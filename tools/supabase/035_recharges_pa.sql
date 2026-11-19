-- 035 : « Recharger mes PA » payé avec Stripe (2026-11-19, porteur : « fais-moi des redirections Stripe pour tous les
-- prix de l'application »). Après 010 et 017. Rejouable. Guide : docs/28 § 8 septies.
--   - pa_packs : les 4 packs vendus, avec leur prix en centimes (le serveur ne croit jamais un prix envoyé par l'app) :
--     500 PA 4,99 € ; 1 500 PA 9,99 € (1 000 + 500 offerts) ; 3 000 PA 14,99 € (1 500 + 1 500 offerts) ;
--     5 000 PA 19,99 € (2 000 + 3 000 offerts). Prix fixés par le porteur le 2026-11-01 au soir.
--   - pa_purchases : chaque achat payé (session de paiement Stripe), les PA donnés, un éventuel remboursement.
--     Gardé après « Supprimer mon compte », sans lien avec le compte (comptabilité, comme premium_payments).
--   - 1ʳᵉ recharge doublée (affichée dans l'app depuis le 2026-11-01, « à valider ») : une seule fois par compte, sur le
--     premier achat payé, tous modes Stripe confondus.
--   - Remboursement (depuis Stripe) : les PA du pack sont repris au prorata du montant remboursé, sans jamais passer le
--     solde sous 0 (défaut à confirmer par le porteur).
--   Écrit seulement par la fonction « stripe » du serveur (clé service_role), après vérification de la signature de
--   Stripe et relecture de la session de paiement chez Stripe. Chaque mouvement de PA va au journal ineffaçable (ledger, catégorie « purchase », prévue depuis 016).

create table if not exists public.pa_packs (
  id text primary key check (id ~ '^pa_[0-9]+$'),
  pa int not null check (pa > 0),
  base int not null check (base > 0),
  gift int not null default 0 check (gift >= 0),
  cents int not null check (cents > 0),
  label text not null,
  sort int not null default 0,
  active boolean not null default true
);
insert into public.pa_packs (id, pa, base, gift, cents, label, sort) values
  ('pa_500', 500, 500, 0, 499, '500 PA', 1),
  ('pa_1500', 1500, 1000, 500, 999, '1 500 PA (1 000 + 500 offerts)', 2),
  ('pa_3000', 3000, 1500, 1500, 1499, '3 000 PA (1 500 + 1 500 offerts)', 3),
  ('pa_5000', 5000, 2000, 3000, 1999, '5 000 PA (2 000 + 3 000 offerts)', 4)
on conflict (id) do update set pa = excluded.pa, base = excluded.base, gift = excluded.gift, cents = excluded.cents,
  label = excluded.label, sort = excluded.sort;

create table if not exists public.pa_purchases (
  session text primary key check (session ~ '^cs_[A-Za-z0-9_]+$'),
  user_id uuid references auth.users (id) on delete set null,
  pack text not null,
  pa int not null,
  pa_given int not null default 0,
  first boolean not null default false,
  amount_cents int not null check (amount_cents >= 0),
  currency text not null,
  payment_intent text unique,
  livemode boolean not null default false,
  paid_at timestamptz not null default now(),
  refunded_cents int not null default 0,
  pa_taken int not null default 0,
  refunded_at timestamptz,
  note text
);
create index if not exists pa_purchases_user on public.pa_purchases (user_id, paid_at desc);
alter table public.pa_packs enable row level security;
alter table public.pa_purchases enable row level security;
revoke all on public.pa_packs, public.pa_purchases from public, anon, authenticated;
grant select, insert, update on public.pa_packs, public.pa_purchases to service_role;

-- Pack demandé par un joueur, juste avant d'ouvrir la page de paiement (fonction « stripe ») : pack actif, compte
-- existant et non suspendu, jamais un compte « moins de 15 ans » (la page affiche « réservé aux 18 ans et plus »).
create or replace function public.pa_checkout_pack(uid uuid, pack_id text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare k public.pa_packs%rowtype; pr record;
begin
  select * into k from public.pa_packs where id = pack_id and active;
  if not found then raise exception 'Ce pack de PA n’existe pas.' using errcode = 'P0001'; end if;
  select role, status, age_range into pr from public.profiles where id = uid;
  if not found then raise exception 'Compte introuvable.' using errcode = 'P0001'; end if;
  if pr.status = 'suspended' then raise exception 'Ce compte est suspendu.' using errcode = 'P0001'; end if;
  if pr.age_range = 'u15' then raise exception 'Les recharges de PA sont réservées aux 18 ans et plus.' using errcode = 'P0001'; end if;
  return jsonb_build_object('id', k.id, 'pa', k.pa, 'cents', k.cents, 'label', k.label,
    'first', not exists (select 1 from public.pa_purchases where user_id = uid and pa_given > 0));
end; $$;

-- Achat payé (message « checkout.session.completed » ou « checkout.session.async_payment_succeeded » de Stripe, session
-- relue chez Stripe). Une session ne donne des PA qu'une fois. Montant ou devise inattendus : rien n'est donné, la ligne
-- est gardée avec une note (à regarder dans Studio).
create or replace function public.pa_purchase_credit(sess text, uid uuid, pack_id text, amount int, cur text, pi text,
  live boolean) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare k public.pa_packs%rowtype; p public.pa_purchases%rowtype; fst boolean; gain int; r jsonb;
begin
  if sess is null or sess !~ '^cs_[A-Za-z0-9_]+$' then raise exception 'Session Stripe invalide'; end if;
  select * into p from public.pa_purchases where session = sess;
  if found then return jsonb_build_object('ok', true, 'already', true, 'user_id', p.user_id, 'pa_given', p.pa_given); end if;
  if uid is null or not exists (select 1 from auth.users where id = uid) then
    return jsonb_build_object('ok', false, 'msg', 'compte introuvable');
  end if;
  select * into k from public.pa_packs where id = pack_id;
  if not found then return jsonb_build_object('ok', false, 'msg', 'pack inconnu'); end if;
  -- Un achat à la fois par compte (la 1re recharge ne peut pas être doublée deux fois).
  perform 1 from public.wallets where user_id = uid for update;
  if amount is distinct from k.cents or lower(coalesce(cur, '')) <> 'eur' then
    insert into public.pa_purchases (session, user_id, pack, pa, pa_given, amount_cents, currency, payment_intent, livemode, note)
    values (sess, uid, k.id, k.pa, 0, coalesce(amount, 0), lower(coalesce(cur, '?')), pi, coalesce(live, false),
      'Montant inattendu : ' || coalesce(amount::text, '?') || ' ' || coalesce(cur, '?') || ' au lieu de ' || k.cents || ' eur. Aucun PA donné.')
    on conflict (session) do nothing;
    return jsonb_build_object('ok', false, 'msg', 'montant inattendu', 'user_id', uid);
  end if;
  fst := not exists (select 1 from public.pa_purchases where user_id = uid and pa_given > 0);
  gain := k.pa * case when fst then 2 else 1 end;
  r := public._game_move(uid, 'purchase', 0, gain, k.label || case when fst then ' · 1re recharge ×2' else '' end, null);
  insert into public.pa_purchases (session, user_id, pack, pa, pa_given, first, amount_cents, currency, payment_intent, livemode)
  values (sess, uid, k.id, k.pa, gain, fst, amount, 'eur', pi, coalesce(live, false));
  return jsonb_build_object('ok', true, 'user_id', uid, 'pa_given', gain, 'first', fst, 'pa', (r->>'pa')::int);
end; $$;

-- Remboursement fait depuis Stripe (message « charge.refunded » : montant remboursé au total sur ce paiement). Les PA
-- sont repris au prorata, en une ou plusieurs fois, jamais plus que le solde (le manque est noté).
create or replace function public.pa_purchase_refund(pi text, refunded int, live boolean) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare p public.pa_purchases%rowtype; owed int; delta int; have int; took int := 0;
begin
  if pi is null or pi !~ '^pi_[A-Za-z0-9_]+$' then return jsonb_build_object('ok', false, 'msg', 'paiement inconnu'); end if;
  select * into p from public.pa_purchases where payment_intent = pi for update;
  if not found then return jsonb_build_object('ok', false, 'msg', 'paiement inconnu'); end if;
  if coalesce(refunded, 0) <= p.refunded_cents then return jsonb_build_object('ok', true, 'already', true, 'user_id', p.user_id); end if;
  owed := case when p.amount_cents > 0 then ceil(p.pa_given::numeric * least(refunded, p.amount_cents) / p.amount_cents)::int else 0 end;
  delta := greatest(owed - p.pa_taken, 0);
  if delta > 0 and p.user_id is not null and exists (select 1 from public.wallets where user_id = p.user_id) then
    select pa into have from public.wallets where user_id = p.user_id for update;
    took := least(delta, greatest(have, 0));
    if took > 0 then
      perform public._game_move(p.user_id, 'purchase', 0, -took, 'Remboursement ' || p.pack
        || case when took < delta then ' (' || (delta - took) || ' PA déjà dépensés)' else '' end, null);
    end if;
  end if;
  update public.pa_purchases set refunded_cents = least(refunded, amount_cents), pa_taken = pa_taken + delta, refunded_at = now(),
    note = case when took < delta then coalesce(note || ' · ', '') || (delta - took) || ' PA déjà dépensés, non repris' else note end
  where session = p.session;
  return jsonb_build_object('ok', true, 'user_id', p.user_id, 'pa_taken', took, 'pa_missing', delta - took);
end; $$;

revoke all on function public.pa_checkout_pack(uuid, text), public.pa_purchase_credit(text, uuid, text, int, text, text, boolean),
  public.pa_purchase_refund(text, int, boolean) from public, anon, authenticated;
grant execute on function public.pa_checkout_pack(uuid, text), public.pa_purchase_credit(text, uuid, text, int, text, text, boolean),
  public.pa_purchase_refund(text, int, boolean) to service_role;

-- Pour l'app (joueur connecté) : les packs et leurs prix tels que le serveur les facture, la 1re recharge encore
-- disponible ou non, le nombre de recharges payées.
create or replace function public.pa_shop_state() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Connexion requise' using errcode = '28000'; end if;
  return jsonb_build_object(
    'first', not exists (select 1 from public.pa_purchases where user_id = uid and pa_given > 0),
    'bought', (select count(*) from public.pa_purchases where user_id = uid and pa_given > 0),
    'packs', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'pa', pa, 'base', base, 'gift', gift, 'cents', cents) order by sort)
      from public.pa_packs where active), '[]'::jsonb));
end; $$;
revoke all on function public.pa_shop_state() from public, anon;
grant execute on function public.pa_shop_state() to authenticated;

notify pgrst, 'reload schema';
