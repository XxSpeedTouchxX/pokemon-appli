-- 018 : lots en quantité limitée, un achat direct par compte et par mois, tirage mensuel d'une carte choisie,
-- 2XP PK offert le premier mois du Premium (2026-11-09, porteur). Après 017. Rejouable (Studio › SQL Editor › Run).
--   - Achats directs plafonnés, réassort le 1er du mois à 20 h (heure de Paris) : booster 10 par mois, item rare 3 par
--     mois, ETB 30 ans 1 tous les 2 mois (périodes de 2 mois qui commencent en novembre, janvier, mars, mai, juillet,
--     septembre). « Épuisé » jusqu'au réassort.
--   - Un seul achat direct par compte et par mois (tous lots confondus), « pour donner la chance à tout le monde ».
--   - Tickets toujours en vente ; un tirage par mois pour chaque ticket, le 1er à 20 h, avec 1 lot par tirage :
--     Bronze = une carte ultra rare (double étoile argentée), Argent = une carte AR (une étoile dorée), Or = une carte
--     ALT (deux étoiles dorées). Le porteur charge chaque mois une ou plusieurs cartes par ticket (panneau Admin de
--     l'app, ou Studio › Table Editor › draw_prizes) ; le joueur choisit sa carte à l'achat du ticket. Le gagnant
--     reçoit la carte qu'il a choisie.
--   - Premium : 30 jours de 2XP PK offerts au premier abonnement, une seule fois par compte.
--   - Un admin déverrouillé (007) n'est ni plafonné ni compté dans les stocks.

-- 1. Mois du PK shop : du 1er à 20 h au 1er suivant à 20 h (heure de Paris).
create or replace function public._shop_month_start(t timestamptz) returns timestamptz
language sql stable set search_path = '' as $$
  select (case when x >= date_trunc('month', x) + interval '20 hours' then date_trunc('month', x) + interval '20 hours'
    else date_trunc('month', x) - interval '1 month' + interval '20 hours' end) at time zone 'Europe/Paris'
  from (select t at time zone 'Europe/Paris' as x) s;
$$;
-- Période d'un stock (1 ou 2 mois ; les périodes de 2 mois commencent en novembre 2026, puis tous les 2 mois).
create or replace function public._shop_period(t timestamptz, months int) returns timestamptz
language plpgsql stable set search_path = '' as $$
declare s timestamp := public._shop_month_start(t) at time zone 'Europe/Paris'; k int; n int := greatest(coalesce(months, 1), 1);
begin
  if n > 1 then
    k := (extract(year from s)::int * 12 + extract(month from s)::int) - (2026 * 12 + 11);
    s := s - make_interval(months => ((k % n) + n) % n);
  end if;
  return s at time zone 'Europe/Paris';
end; $$;
-- Fin de cette période (= prochain réassort).
create or replace function public._shop_period_end(t timestamptz, months int) returns timestamptz
language sql stable set search_path = '' as $$
  select ((public._shop_period(t, months) at time zone 'Europe/Paris') + make_interval(months => greatest(coalesce(months, 1), 1))) at time zone 'Europe/Paris';
$$;
-- « le 1er décembre à 20 h »
create or replace function public._shop_when(t timestamptz) returns text
language sql stable set search_path = '' as $$
  select 'le ' || case when extract(day from x)::int = 1 then '1er' else extract(day from x)::int::text end || ' '
    || (array['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'])[extract(month from x)::int]
    || ' à ' || extract(hour from x)::int || ' h'
  from (select t at time zone 'Europe/Paris' as x) s;
$$;
-- Tirages : le 1er de chaque mois à 20 h pour les 3 tickets (remplace 007 et 008).
create or replace function public._game_next_draw(t timestamptz default now()) returns timestamptz
language sql stable set search_path = '' as $$ select public._shop_period_end(t, 1); $$;
create or replace function public._game_next_draw(cyc text, t timestamptz) returns timestamptz
language sql stable set search_path = '' as $$ select public._shop_period_end(t, 1); $$;
revoke all on function public._shop_month_start(timestamptz), public._shop_period(timestamptz, int), public._shop_period_end(timestamptz, int),
  public._shop_when(timestamptz), public._game_next_draw(timestamptz), public._game_next_draw(text, timestamptz) from public, anon, authenticated;

-- 2. Articles : tirages mensuels, lot d'une carte par ticket.
update public.game_items set cycle = '1m', label = 'Ticket Bronze · tirage d’une carte ultra rare, chaque mois', value_text = 'Carte ultra rare' where id = 'ticket-bronze';
update public.game_items set cycle = '1m', label = 'Ticket Argent · tirage d’une carte AR, chaque mois', value_text = 'Carte AR' where id = 'ticket-argent';
update public.game_items set cycle = '1m', label = 'Ticket Or · tirage d’une carte ALT, chaque mois', value_text = 'Carte ALT' where id = 'ticket-or';

-- 3. Stock des achats directs (modifiable ici ou dans Studio ; lu par tous les joueurs).
create table if not exists public.shop_stock (
  item text primary key references public.game_items (id) on delete cascade,
  qty int not null check (qty >= 0),
  months int not null default 1 check (months between 1 and 12)
);
insert into public.shop_stock (item, qty, months) values ('achat-booster', 10, 1), ('achat-rare', 3, 1), ('achat-etb-30', 1, 2)
on conflict (item) do update set qty = excluded.qty, months = excluded.months;
alter table public.shop_stock enable row level security;
drop policy if exists shop_stock_read on public.shop_stock;
create policy shop_stock_read on public.shop_stock for select to authenticated using (true);
revoke insert, update, delete on public.shop_stock from public, anon, authenticated;
grant select on public.shop_stock to authenticated;
create index if not exists tickets_item_at on public.tickets (item, bought_at);

-- 4. Cartes à gagner : une ou plusieurs par tirage et par ticket, chargées par le porteur.
create table if not exists public.draw_prizes (
  id bigint generated always as identity primary key,
  draw_at timestamptz not null,
  item text not null references public.game_items (id) on delete cascade,
  card text not null check (card ~ '^[A-Za-z0-9._-]{1,60}$'),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  info text check (info is null or char_length(info) <= 160),
  img text check (img is null or (img ~ '^[A-Za-z0-9._/-]{1,200}$' and img !~ '\.\.')),
  created_at timestamptz not null default now(),
  unique (draw_at, item, card)
);
alter table public.draw_prizes enable row level security;
drop policy if exists draw_prizes_read on public.draw_prizes;
create policy draw_prizes_read on public.draw_prizes for select to authenticated using (true);
revoke insert, update, delete on public.draw_prizes from public, anon, authenticated;
grant select on public.draw_prizes to authenticated;

-- Ajouter une carte à un tirage (admins) : un tirage = le 1er d'un mois à 20 h, à venir ; tickets seulement.
create or replace function public.admin_prize_add(draw timestamptz, item_id text, card_id text, card_name text,
  card_info text default null, card_img text default null) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare d timestamptz := coalesce(draw, public._game_next_draw(now())); nid bigint;
begin
  if not public.is_admin() then raise exception 'Réservé aux admins' using errcode = '42501'; end if;
  if d <= now() or d <> public._shop_month_start(d) then raise exception 'Tirage invalide (le 1er d''un mois à 20 h, à venir)' using errcode = 'P0001'; end if;
  if not exists (select 1 from public.game_items where id = item_id and kind = 'ticket') then raise exception 'Ticket inconnu' using errcode = 'P0001'; end if;
  insert into public.draw_prizes (draw_at, item, card, name, info, img)
  values (d, item_id, btrim(card_id), btrim(card_name), nullif(btrim(coalesce(card_info, '')), ''), nullif(btrim(coalesce(card_img, '')), ''))
  on conflict (draw_at, item, card) do update set name = excluded.name, info = excluded.info, img = excluded.img
  returning id into nid;
  insert into public.admin_log (admin_id, action, details, reason)
  values (auth.uid(), 'prize_add', jsonb_build_object('item', item_id, 'card', card_id, 'draw_at', d), 'Carte ajoutée au tirage');
  return jsonb_build_object('ok', true, 'id', nid, 'draw_at', d);
end; $$;
-- Retirer une carte (admins) : impossible si un joueur l'a déjà choisie.
create or replace function public.admin_prize_remove(prize_id bigint) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare p public.draw_prizes%rowtype;
begin
  if not public.is_admin() then raise exception 'Réservé aux admins' using errcode = '42501'; end if;
  select * into p from public.draw_prizes where id = prize_id;
  if not found then return jsonb_build_object('ok', false, 'msg', 'Carte introuvable'); end if;
  if exists (select 1 from public.tickets where item = p.item and draw_at = p.draw_at and choice = p.card) then
    raise exception 'Des joueurs ont déjà choisi cette carte : elle reste au tirage' using errcode = 'P0001';
  end if;
  delete from public.draw_prizes where id = prize_id;
  insert into public.admin_log (admin_id, action, details, reason)
  values (auth.uid(), 'prize_remove', jsonb_build_object('item', p.item, 'card', p.card, 'draw_at', p.draw_at), 'Carte retirée du tirage');
  return jsonb_build_object('ok', true);
end; $$;
-- Cartes des tirages à venir, avec le nombre de tickets de chacune (admins).
create or replace function public.admin_prizes() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Réservé aux admins' using errcode = '42501'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('id', p.id, 'draw_at', p.draw_at, 'item', p.item, 'card', p.card, 'name', p.name,
      'info', p.info, 'img', p.img, 'tickets', (select count(*) from public.tickets t where t.item = p.item and t.draw_at = p.draw_at and t.choice = p.card))
    order by p.draw_at, p.item, p.id) from public.draw_prizes p where p.draw_at > now()), '[]'::jsonb);
end; $$;
revoke all on function public.admin_prize_add(timestamptz, text, text, text, text, text), public.admin_prize_remove(bigint), public.admin_prizes() from public, anon;
grant execute on function public.admin_prize_add(timestamptz, text, text, text, text, text), public.admin_prize_remove(bigint), public.admin_prizes() to authenticated;

-- 5. Achat (remplace 015) : cartes au choix pour les tickets, stock et un achat par mois pour les achats directs.
create or replace function public.buy_item(item_id text, req uuid, choice text default null) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := public._game_begin(); it public.game_items%rowtype; conf timestamptz; r jsonb; st public.shop_stock%rowtype;
  free boolean := public._game_free(uid); d timestamptz; c text := nullif(btrim(coalesce(choice, '')), ''); gname text; used int;
begin
  r := public._game_replay(uid, req); if r is not null then return r; end if;
  select * into it from public.game_items where id = item_id and active;
  if not found then raise exception 'Article indisponible' using errcode = 'P0001'; end if;
  if not free and public._game_grade(uid) < it.min_grade then
    select name into gname from public.game_grades where i = it.min_grade;
    raise exception 'Tu dois d''abord déverrouiller le grade % pour avoir accès à cet article', gname using errcode = 'P0001';
  end if;
  select email_confirmed_at into conf from auth.users where id = uid;
  if not free and conf is null then raise exception 'Vérifie d''abord ton adresse e-mail pour participer aux tirages et recevoir tes lots' using errcode = 'P0001'; end if;
  if not free and conf > now() - interval '7 days' then raise exception 'Disponible 7 jours après la création de ton compte' using errcode = 'P0001'; end if;
  if it.kind = 'ticket' then
    d := public._game_next_draw(now());
    if not exists (select 1 from public.draw_prizes where draw_at = d and item = it.id) then
      raise exception 'Les cartes du prochain tirage ne sont pas encore annoncées : reviens bientôt' using errcode = 'P0001';
    end if;
    if c is null or not exists (select 1 from public.draw_prizes where draw_at = d and item = it.id and card = c) then
      raise exception 'Choisis la carte que tu veux gagner' using errcode = 'P0001';
    end if;
  else
    if it.choices is not null and (c is null or not (c = any (it.choices))) then raise exception 'Choisis ton item' using errcode = 'P0001'; end if;
    if it.choices is null then c := null; end if;
    if not free then
      select * into st from public.shop_stock where item = it.id for update;
      if found then
        if exists (select 1 from public.tickets t join public.game_items i on i.id = t.item
            where t.user_id = uid and i.kind = 'lot' and t.cost_pk > 0 and t.bought_at >= public._shop_month_start(now())) then
          raise exception 'Tu as déjà fait ton achat du mois : prochain achat possible %', public._shop_when(public._shop_period_end(now(), 1)) using errcode = 'P0001';
        end if;
        select count(*) into used from public.tickets where item = it.id and cost_pk > 0 and bought_at >= public._shop_period(now(), st.months);
        if used >= st.qty then
          raise exception 'Épuisé : retour %', public._shop_when(public._shop_period_end(now(), st.months)) using errcode = 'P0001';
        end if;
      end if;
    end if;
  end if;
  insert into public.tickets (user_id, item, cost_pk, draw_at, choice) values (uid, it.id, case when free then 0 else it.price_pk end, d, c);
  return public._game_move(uid, 'shop', -it.price_pk, 0, it.id || coalesce(' · ' || c, ''), req) || jsonb_build_object('item', it.id,
    'count', (select count(*) from public.tickets where user_id = uid and item = it.id and draw_at is not distinct from d),
    'draw_at', d, 'choice', c);
end; $$;
revoke all on function public.buy_item(text, uuid, text) from public, anon;
grant execute on function public.buy_item(text, uuid, text) to authenticated;

-- 6. État du PK shop, lu par l'app : stocks, achat du mois, cartes du prochain tirage et tickets du joueur.
create or replace function public.shop_state() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := auth.uid(); m timestamptz := public._shop_month_start(now()); nd timestamptz := public._game_next_draw(now());
  mb jsonb; stock jsonb; prizes jsonb; mine jsonb;
begin
  if uid is null then raise exception 'Connexion requise' using errcode = '28000'; end if;
  select jsonb_build_object('item', t.item, 'at', t.bought_at) into mb from public.tickets t join public.game_items i on i.id = t.item
    where t.user_id = uid and i.kind = 'lot' and t.cost_pk > 0 and t.bought_at >= m order by t.bought_at desc limit 1;
  select jsonb_object_agg(s.item, jsonb_build_object('total', s.qty, 'months', s.months, 'restock', public._shop_period_end(now(), s.months),
      'left', greatest(0, s.qty - (select count(*)::int from public.tickets t where t.item = s.item and t.cost_pk > 0 and t.bought_at >= public._shop_period(now(), s.months)))))
    into stock from public.shop_stock s;
  select jsonb_object_agg(x.item, x.cards) into prizes from (
    select p.item, jsonb_agg(jsonb_build_object('id', p.card, 'name', p.name, 'info', p.info, 'img', p.img) order by p.id) as cards
    from public.draw_prizes p where p.draw_at = nd group by p.item) x;
  select jsonb_object_agg(y.item, y.picks) into mine from (
    select t.item, jsonb_object_agg(t.choice, t.n) as picks
    from (select item, choice, count(*) as n from public.tickets where user_id = uid and draw_at = nd and choice is not null group by item, choice) t
    group by t.item) y;
  return jsonb_build_object('server_now', now(), 'month_start', m, 'next_month', public._shop_period_end(now(), 1), 'draw_at', nd, 'draw_lots', 1,
    'stock', coalesce(stock, '{}'::jsonb), 'month_buy', mb, 'prizes', coalesce(prizes, '{}'::jsonb), 'mine', coalesce(mine, '{}'::jsonb));
end; $$;
revoke all on function public.shop_state() from public, anon;
grant execute on function public.shop_state() to authenticated;

-- 7. Participants (remplace 008) : avec la carte choisie.
drop function if exists public.admin_draw_entries(timestamptz);
create or replace function public.admin_draw_entries(draw timestamptz default null)
returns table (draw_at timestamptz, item text, card text, user_id uuid, pseudo text, email text, tickets bigint)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Réservé aux admins'; end if;
  return query
    select t.draw_at, t.item, coalesce(p.name || coalesce(' (' || p.info || ')', ''), t.choice), t.user_id, pr.pseudo, u.email::text, count(*)
    from public.tickets t join auth.users u on u.id = t.user_id left join public.profiles pr on pr.id = t.user_id
      left join public.draw_prizes p on p.draw_at = t.draw_at and p.item = t.item and p.card = t.choice
    where t.draw_at is not null and (case when draw is null then t.draw_at > now() else t.draw_at = draw end)
    group by t.draw_at, t.item, p.name, p.info, t.choice, t.user_id, pr.pseudo, u.email
    order by t.draw_at, t.item, count(*) desc;
end; $$;
revoke all on function public.admin_draw_entries(timestamptz) from public, anon;
grant execute on function public.admin_draw_entries(timestamptz) to authenticated;

-- 8. E-mail de chaque achat (remplace 012) : nom de la carte choisie à la place de son identifiant.
create or replace function public.shop_pending(lim int default 20) returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(x order by x->>'bought_at'), '[]'::jsonb) from (
    select jsonb_build_object('id', t.id, 'item', t.item, 'label', i.label, 'kind', i.kind, 'cost_pk', t.cost_pk,
      'bought_at', t.bought_at, 'draw_at', t.draw_at, 'choice', coalesce(dp.name || coalesce(' · ' || dp.info, ''), t.choice), 'user_id', t.user_id,
      'email', u.email::text, 'pseudo', p.pseudo,
      'count', (select count(*) from public.tickets t2 where t2.user_id = t.user_id and t2.item = t.item and t2.draw_at is not distinct from t.draw_at)) as x
    from public.tickets t
    join auth.users u on u.id = t.user_id
    left join public.profiles p on p.id = t.user_id
    left join public.game_items i on i.id = t.item
    left join public.draw_prizes dp on dp.draw_at = t.draw_at and dp.item = t.item and dp.card = t.choice
    where not exists (select 1 from public.shop_notices n where n.ticket_id = t.id)
      and t.bought_at >= (select since from public.shop_notice_start where k = 1)
    order by t.bought_at
    limit greatest(1, least(coalesce(lim, 20), 50))
  ) s;
$$;
revoke all on function public.shop_pending(int) from public, anon, authenticated;
grant execute on function public.shop_pending(int) to service_role;

-- 9. Premium : 30 jours de 2XP PK offerts au premier abonnement (une fois par compte). Remplace premium_apply de 010.
alter table public.premium add column if not exists xp_gift_at timestamptz;
create or replace function public.premium_apply(uid uuid, cust text, sub text, plan_id text, sub_status text,
  ends_at timestamptz, cancel boolean, live boolean) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare u uuid := uid; gift boolean := false;
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
  if sub_status in ('active', 'trialing') then
    update public.premium set xp_gift_at = now() where user_id = u and xp_gift_at is null;
    gift := found;
    if gift then
      insert into public.pk_boosts (user_id, until) values (u, now() + interval '30 days')
      on conflict (user_id) do update set until = greatest(public.pk_boosts.until, now()) + interval '30 days', updated_at = now();
    end if;
  end if;
  return jsonb_build_object('ok', true, 'user_id', u, 'premium', public._premium_on(u), 'xp_gift', gift);
end; $$;
revoke all on function public.premium_apply(uuid, text, text, text, text, timestamptz, boolean, boolean) from public, anon, authenticated;
grant execute on function public.premium_apply(uuid, text, text, text, text, timestamptz, boolean, boolean) to service_role;

-- 2XP en cours (remplace 016) : en plus, la date du 2XP offert par le Premium.
create or replace function public.pk_boost_state() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := auth.uid(); u timestamptz;
begin
  if uid is null then raise exception 'Connexion requise' using errcode = '28000'; end if;
  select until into u from public.pk_boosts where user_id = uid;
  return jsonb_build_object('on', u is not null and u > now(), 'until', case when u > now() then u end, 'server_now', now(),
    'gift_at', (select xp_gift_at from public.premium where user_id = uid),
    'offers', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'days', days, 'pa', price_pa) order by days) from public.pk_boost_offers where active), '[]'::jsonb));
end; $$;
revoke all on function public.pk_boost_state() from public, anon;
grant execute on function public.pk_boost_state() to authenticated;
