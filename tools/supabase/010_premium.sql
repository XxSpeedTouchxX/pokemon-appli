-- 010 : abonnement Premium payé avec Stripe (2026-11-07, « go » du porteur ; docs/27, guide docs/28). Après 009.
-- Rejouable.
--   - premium : un abonné par ligne (formule, statut donné par Stripe, fin de la période payée, arrêt demandé).
--   - premium_payments : chaque paiement reçu (montant, date, facture Stripe), pour que le porteur voie qui a payé quoi.
--   - stripe_events : journal des messages reçus de Stripe (déjà traités ou non).
--   Ces tables ne s'écrivent que par la fonction « stripe » du serveur (clé service_role, jamais dans l'app) après
--   vérification de la signature de Stripe. Un joueur lit seulement sa propre ligne « premium ».
--   - Avantage tenu par le serveur : PA du jour doublés (« Double XP permanent sur tes PA », décision P5).
--   - game_state donne l'état Premium à l'app, qui ouvre les autres avantages (scans, classeur, Radar, historique).

create table if not exists public.premium (
  user_id uuid primary key references auth.users (id) on delete cascade,
  stripe_customer text unique,
  stripe_subscription text unique,
  plan text check (plan is null or plan in ('month', 'year')),
  status text not null default 'none'
    check (status in ('none', 'incomplete', 'incomplete_expired', 'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'paused')),
  period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  livemode boolean not null default false,
  started_at timestamptz,
  updated_at timestamptz not null default now()
);
create table if not exists public.premium_payments (
  invoice text primary key,
  user_id uuid references auth.users (id) on delete set null,
  stripe_customer text,
  amount_cents int not null check (amount_cents >= 0),
  currency text not null,
  plan text,
  paid_at timestamptz not null,
  livemode boolean not null default false
);
create index if not exists premium_payments_user on public.premium_payments (user_id, paid_at desc);
create table if not exists public.stripe_events (
  id text primary key,
  type text not null,
  user_id uuid,
  livemode boolean not null default false,
  received_at timestamptz not null default now()
);
alter table public.premium enable row level security;
alter table public.premium_payments enable row level security;
alter table public.stripe_events enable row level security;
revoke all on public.premium, public.premium_payments, public.stripe_events from public, anon, authenticated;
grant select on public.premium to authenticated;
drop policy if exists premium_own on public.premium;
create policy premium_own on public.premium for select to authenticated using (user_id = (select auth.uid()));

-- Premium actif : payé (ou essai), jusqu'à la fin de la période payée ; 3 jours de grâce si un renouvellement échoue
-- (Stripe réessaie de prélever pendant ce temps).
create or replace function public._premium_on(uid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((select p.status in ('active', 'trialing', 'past_due') and p.period_end > now() - interval '3 days'
    from public.premium p where p.user_id = uid), false);
$$;
revoke all on function public._premium_on(uuid) from public, anon, authenticated;

-- ——— Fonctions réservées au serveur (fonction « stripe », clé service_role) ———
create or replace function public.premium_customer(uid uuid) returns text
language sql stable security definer set search_path = '' as $$
  select stripe_customer from public.premium where user_id = uid;
$$;
create or replace function public.premium_set_customer(uid uuid, cust text) returns void
language plpgsql volatile security definer set search_path = '' as $$
begin
  if uid is null or cust is null or cust !~ '^cus_[A-Za-z0-9]+$' then raise exception 'Client Stripe invalide'; end if;
  if not exists (select 1 from auth.users where id = uid) then raise exception 'Compte inconnu'; end if;
  insert into public.premium (user_id, stripe_customer) values (uid, cust)
  on conflict (user_id) do update set stripe_customer = excluded.stripe_customer, updated_at = now()
    where public.premium.stripe_customer is null or public.premium.stripe_customer = excluded.stripe_customer;
end; $$;

-- Abonnement reçu de Stripe (toujours relu chez Stripe par la fonction, donc à jour quel que soit l'ordre des messages).
-- Compte retrouvé par l'identifiant mis dans l'abonnement, sinon par le client Stripe.
create or replace function public.premium_apply(uid uuid, cust text, sub text, plan_id text, sub_status text,
  ends_at timestamptz, cancel boolean, live boolean) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare u uuid := uid;
begin
  if u is null then select user_id into u from public.premium where stripe_customer = cust or stripe_subscription = sub limit 1; end if;
  if u is null or not exists (select 1 from auth.users where id = u) then return jsonb_build_object('ok', false, 'msg', 'compte introuvable'); end if;
  if sub is null or sub !~ '^sub_[A-Za-z0-9]+$' then raise exception 'Abonnement Stripe invalide'; end if;
  if exists (select 1 from public.premium where stripe_customer = cust and user_id <> u) then raise exception 'Client Stripe déjà lié à un autre compte'; end if;
  insert into public.premium as p (user_id, stripe_customer, stripe_subscription, plan, status, period_end, cancel_at_period_end, livemode, started_at)
  values (u, cust, sub, plan_id, sub_status, ends_at, coalesce(cancel, false), coalesce(live, false), case when sub_status in ('active', 'trialing') then now() end)
  on conflict (user_id) do update set
    stripe_customer = coalesce(excluded.stripe_customer, p.stripe_customer),
    stripe_subscription = excluded.stripe_subscription,
    plan = coalesce(excluded.plan, p.plan),
    status = excluded.status,
    period_end = excluded.period_end,
    cancel_at_period_end = excluded.cancel_at_period_end,
    livemode = excluded.livemode,
    started_at = coalesce(p.started_at, excluded.started_at),
    updated_at = now();
  return jsonb_build_object('ok', true, 'user_id', u, 'premium', public._premium_on(u));
end; $$;

create or replace function public.premium_payment(invoice_id text, cust text, amount int, cur text, plan_id text,
  paid timestamptz, live boolean) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare u uuid;
begin
  if invoice_id is null or invoice_id !~ '^in_[A-Za-z0-9]+$' then raise exception 'Facture Stripe invalide'; end if;
  select user_id into u from public.premium where stripe_customer = cust;
  insert into public.premium_payments (invoice, user_id, stripe_customer, amount_cents, currency, plan, paid_at, livemode)
  values (invoice_id, u, cust, amount, lower(cur), plan_id, paid, coalesce(live, false))
  on conflict (invoice) do nothing;
  return jsonb_build_object('ok', true, 'user_id', u);
end; $$;

create or replace function public.premium_log_event(ev_id text, ev_type text, uid uuid, live boolean) returns boolean
language plpgsql volatile security definer set search_path = '' as $$
begin
  insert into public.stripe_events (id, type, user_id, livemode) values (ev_id, ev_type, uid, coalesce(live, false)) on conflict (id) do nothing;
  return found;
end; $$;

revoke all on function public.premium_customer(uuid), public.premium_set_customer(uuid, text),
  public.premium_apply(uuid, text, text, text, text, timestamptz, boolean, boolean),
  public.premium_payment(text, text, int, text, text, timestamptz, boolean),
  public.premium_log_event(text, text, uuid, boolean) from public, anon, authenticated;
grant execute on function public.premium_customer(uuid), public.premium_set_customer(uuid, text),
  public.premium_apply(uuid, text, text, text, text, timestamptz, boolean, boolean),
  public.premium_payment(text, text, int, text, text, timestamptz, boolean),
  public.premium_log_event(text, text, uuid, boolean) to service_role;
grant select, insert, update on public.premium, public.premium_payments, public.stripe_events to service_role;

-- PA du jour (remplace la version de 004) : doublés pour un abonné Premium.
create or replace function public.claim_daily_pa(req uuid) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := public._game_begin(); w public.wallets%rowtype; today date := public._game_today(); s int; gain int; r jsonb;
  prem boolean;
begin
  r := public._game_replay(uid, req); if r is not null then return r; end if;
  select * into w from public.wallets where user_id = uid;
  if w.pa_day = today then raise exception 'PA du jour déjà récupérés' using errcode = 'P0001'; end if;
  s := case when w.pa_day is null then 1 when w.pa_day = today - 1 then greatest(w.pa_streak, 0) + 1 else 2 end;
  prem := public._premium_on(uid);
  gain := (array[20, 30, 40, 50, 70])[least(s, 5)] * case when prem then 2 else 1 end;
  update public.wallets set pa_day = today, pa_streak = s where user_id = uid;
  return public._game_move(uid, 'pa_day', 0, gain, 'J' || s || case when prem then ' · Premium ×2' else '' end, req)
    || jsonb_build_object('gain', gain, 'streak', s, 'premium', prem);
end; $$;
revoke all on function public.claim_daily_pa(uuid) from public, anon;
grant execute on function public.claim_daily_pa(uuid) to authenticated;

-- État du compte (remplace la version de 008) : état Premium, et PA du jour doublés pour un abonné.
create or replace function public.game_state() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := auth.uid(); w public.wallets%rowtype; g int; gr public.game_grades%rowtype; today date := public._game_today();
  conf timestamptz; nb timestamptz; nc timestamptz; nxt jsonb; free boolean; draws jsonb; p public.premium%rowtype; prem boolean;
begin
  if uid is null then raise exception 'Connexion requise' using errcode = '28000'; end if;
  free := public._game_free(uid);
  prem := public._premium_on(uid);
  select * into p from public.premium where user_id = uid;
  select * into w from public.wallets where user_id = uid;
  g := public._game_grade(uid);
  select * into gr from public.game_grades where i = g;
  select email_confirmed_at into conf from auth.users where id = uid;
  nb := case when not free then (select max(at) from public.ledger where user_id = uid and kind = 'booster') + make_interval(hours => gr.booster_h) end;
  nc := case when gr.coin_h > 0 and not free then (select max(at) from public.ledger where user_id = uid and kind = 'coin') + make_interval(hours => gr.coin_h) end;
  nxt := case when w.pa_day = today then null
    else to_jsonb(case when w.pa_day is null then 20 when w.pa_day = today - 1 then (array[20, 30, 40, 50, 70])[least(w.pa_streak + 1, 5)] else 30 end
      * case when prem then 2 else 1 end) end;
  select coalesce(jsonb_object_agg(id, public._game_next_draw(cycle, now())), '{}'::jsonb) into draws from public.game_items where kind = 'ticket' and active;
  return jsonb_build_object(
    'pk', w.pk, 'pa', w.pa, 'pk_earned', w.pk_earned, 'today', today, 'server_now', now(),
    'pa_day', w.pa_day, 'pa_streak', w.pa_streak, 'pa_gain', nxt,
    'grade', g, 'booster_next', nb, 'coin_open', gr.coin_h > 0 or free, 'coin_next', nc,
    'booster_last', case when not free then (select max(at) from public.ledger where user_id = uid and kind = 'booster') end,
    'coin_last', case when not free then (select max(at) from public.ledger where user_id = uid and kind = 'coin') end,
    'buddy', (select buddy from public.profiles where id = uid),
    'shared', exists (select 1 from public.ledger where user_id = uid and kind = 'share'),
    'unlocked', coalesce((select jsonb_agg(pokemon order by pokemon) from public.dex_unlocks where user_id = uid), '[]'::jsonb),
    'shop', coalesce((select jsonb_object_agg(item, n) from (select item, count(*) n from public.tickets where user_id = uid group by item) t), '{}'::jsonb),
    'shop_draw', coalesce((select jsonb_object_agg(t.item, t.n) from (select item, count(*) n from public.tickets tk
      where tk.user_id = uid and tk.draw_at = (draws->>tk.item)::timestamptz group by item) t), '{}'::jsonb),
    'draws', draws,
    'next_draw', draws->>'ticket-bronze',
    'shop_open_at', conf + interval '7 days',
    'unlimited', free,
    'admin_until', (select until from public.admin_unlocks where user_id = uid and until > now()),
    'premium', jsonb_build_object('on', prem, 'plan', p.plan, 'status', coalesce(p.status, 'none'), 'until', p.period_end,
      'cancel', coalesce(p.cancel_at_period_end, false), 'customer', p.stripe_customer is not null));
end; $$;
revoke all on function public.game_state() from public, anon;
grant execute on function public.game_state() to authenticated;
