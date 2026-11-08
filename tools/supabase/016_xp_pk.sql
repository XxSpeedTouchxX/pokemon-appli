-- 016 : « 2XP PK » achetables avec des PA au PK shop (2026-11-08, porteur : « dans le PK shop tu vas aussi proposer des
-- double XP de PK que l'on pourra acheter avec ses PA » ; 7 jours 400 PA, 14 jours 700 PA, 30 jours 1 000 PA).
-- Après 015. Rejouable (Studio › SQL Editor › Run).
--   - Pendant la durée achetée, les PK gagnés au Booster PK et à pile ou face sont doublés (heure du serveur).
--   - Un nouvel achat pendant un 2XP en cours prolonge la fin (les jours s'ajoutent, rien n'est perdu).
--   - PA débités par le serveur, journal « boost » ineffaçable ; un admin déverrouillé ne paie rien (007).
--   - Les PK doublés comptent pour les grades et le classement de la saison (PK gagnés), comme tout gain de jeu.

-- 1. Offres (prix modifiables ici seulement) et 2XP de chaque joueur (écrit par le serveur seulement).
create table if not exists public.pk_boost_offers (
  id text primary key,
  days int not null check (days between 1 and 365),
  price_pa int not null check (price_pa > 0),
  active boolean not null default true
);
insert into public.pk_boost_offers (id, days, price_pa, active) values
  ('xp-7', 7, 400, true), ('xp-14', 14, 700, true), ('xp-30', 30, 1000, true)
on conflict (id) do update set days = excluded.days, price_pa = excluded.price_pa, active = excluded.active;
alter table public.pk_boost_offers enable row level security;
drop policy if exists pk_boost_offers_read on public.pk_boost_offers;
create policy pk_boost_offers_read on public.pk_boost_offers for select to authenticated using (true);
revoke insert, update, delete on public.pk_boost_offers from public, anon, authenticated;

create table if not exists public.pk_boosts (
  user_id uuid primary key references auth.users (id) on delete cascade,
  until timestamptz not null,
  updated_at timestamptz not null default now()
);
alter table public.pk_boosts enable row level security;
drop policy if exists pk_boosts_own on public.pk_boosts;
create policy pk_boosts_own on public.pk_boosts for select to authenticated using (user_id = auth.uid());
revoke insert, update, delete on public.pk_boosts from public, anon, authenticated;

alter table public.ledger drop constraint if exists ledger_kind_check;
alter table public.ledger add constraint ledger_kind_check check (kind in ('welcome', 'reprise', 'share', 'pa_day', 'booster', 'coin',
  'unlock', 'shop', 'admin', 'purchase', 'avatar', 'boost'));

-- 2. 2XP en cours ?
create or replace function public._pk_boost_on(uid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.pk_boosts where user_id = uid and until > now());
$$;
revoke all on function public._pk_boost_on(uuid) from public, anon, authenticated;

-- 3. Achat d'un 2XP avec des PA.
create or replace function public.buy_pk_boost(offer text, req uuid) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := public._game_begin(); o public.pk_boost_offers%rowtype; cur timestamptz; nu timestamptz; r jsonb;
begin
  r := public._game_replay(uid, req); if r is not null then return r; end if;
  select * into o from public.pk_boost_offers where id = offer and active;
  if not found then raise exception 'Offre indisponible' using errcode = 'P0001'; end if;
  select until into cur from public.pk_boosts where user_id = uid for update;
  nu := greatest(coalesce(cur, now()), now()) + make_interval(days => o.days);
  r := public._game_move(uid, 'boost', 0, -o.price_pa, o.id, req);
  insert into public.pk_boosts (user_id, until) values (uid, nu)
  on conflict (user_id) do update set until = excluded.until, updated_at = now();
  return r || jsonb_build_object('offer', o.id, 'days', o.days, 'until', nu);
end; $$;
revoke all on function public.buy_pk_boost(text, uuid) from public, anon;
grant execute on function public.buy_pk_boost(text, uuid) to authenticated;

-- 4. Booster PK (remplace 011) : mêmes délais et chances ; PK doublés pendant un 2XP.
create or replace function public.open_booster(req uuid) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := public._game_begin(); gr public.game_grades%rowtype; last timestamptz; x double precision; won int; m int; r jsonb;
begin
  r := public._game_replay(uid, req); if r is not null then return r; end if;
  select * into gr from public.game_grades where i = public._game_grade(uid);
  select max(at) into last from public.ledger where user_id = uid and kind = 'booster';
  if not public._game_free(uid) and last is not null and last + make_interval(hours => gr.booster_h) > now() then
    raise exception 'Booster pas encore prêt' using errcode = 'P0001';
  end if;
  x := public._game_rand();
  won := case when x < 0.40 then 30 when x < 0.70 then 50 when x < 0.85 then 100 when x < 0.95 then 200 else 500 end;
  m := case when public._pk_boost_on(uid) then 2 else 1 end;
  return public._game_move(uid, 'booster', won * m, 0, case when m = 2 then '2XP PK' end, req)
    || jsonb_build_object('won', won * m, 'base', won, 'boost', m = 2, 'next', now() + make_interval(hours => gr.booster_h));
end; $$;
revoke all on function public.open_booster(uuid) from public, anon;
grant execute on function public.open_booster(uuid) to authenticated;

-- 5. Pile ou face (remplace 007) : mêmes règles ; 50 PK deviennent 100 PK pendant un 2XP.
create or replace function public.flip_coin(req uuid) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := public._game_begin(); gr public.game_grades%rowtype; last timestamptz; won int; m int; r jsonb; free boolean := public._game_free(uid);
begin
  r := public._game_replay(uid, req); if r is not null then return r; end if;
  select * into gr from public.game_grades where i = public._game_grade(uid);
  if gr.coin_h = 0 and not free then raise exception 'Pièce réservée au grade Chasseur et plus' using errcode = 'P0001'; end if;
  select max(at) into last from public.ledger where user_id = uid and kind = 'coin';
  if not free and last is not null and last + make_interval(hours => gr.coin_h) > now() then raise exception 'Pièce pas encore prête' using errcode = 'P0001'; end if;
  won := case when public._game_rand() < 0.5 then 50 else 0 end;
  m := case when public._pk_boost_on(uid) then 2 else 1 end;
  return public._game_move(uid, 'coin', won * m, 0, case when m = 2 and won > 0 then '2XP PK' end, req)
    || jsonb_build_object('won', won * m, 'base', won, 'boost', m = 2, 'win', won > 0, 'next', now() + make_interval(hours => greatest(gr.coin_h, 4)));
end; $$;
revoke all on function public.flip_coin(uuid) from public, anon;
grant execute on function public.flip_coin(uuid) to authenticated;

-- 6. Fin du 2XP en cours, lue par l'app (game_state reste celui de 010).
create or replace function public.pk_boost_state() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := auth.uid(); u timestamptz;
begin
  if uid is null then raise exception 'Connexion requise' using errcode = '28000'; end if;
  select until into u from public.pk_boosts where user_id = uid;
  return jsonb_build_object('on', u is not null and u > now(), 'until', case when u > now() then u end, 'server_now', now(),
    'offers', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'days', days, 'pa', price_pa) order by days) from public.pk_boost_offers where active), '[]'::jsonb));
end; $$;
revoke all on function public.pk_boost_state() from public, anon;
grant execute on function public.pk_boost_state() to authenticated;
