-- 014 : « Mon avatar » (2026-11-08, demande du porteur). Après 013.
-- Rejouable (à coller dans Supabase Studio › SQL Editor, puis « Run »).
--   - Chaque joueur compose son avatar dans l'app ; il est gardé ici (profiles.avatar) et montré dans le classement.
--   - Styles PRO (badge couronne) : ouverts avec l'abonnement Premium, ou débloqués pour toujours avec des PA
--     (avatar_buy : PA débités par le serveur, journal « avatar »). Prix dans avatar_items (mêmes que l'app).
--   - avatar_save refuse un avatar qui utilise un style PRO ni acheté ni ouvert par Premium, ou un Pokémon non débloqué.

-- 1. Styles PRO et leur prix en PA.
create table if not exists public.avatar_items (id text primary key, price_pa int not null check (price_pa > 0));
alter table public.avatar_items enable row level security;
revoke all on public.avatar_items from anon, authenticated;
insert into public.avatar_items (id, price_pa) values
  ('skin:lavande', 150), ('skin:menthe', 150), ('skin:ciel', 150), ('skin:or', 150),
  ('eyes:etoiles', 150),
  ('hair:chignon', 200), ('hair:queue', 200), ('hair:couettes', 200), ('hair:crete', 200),
  ('hc:rose', 100), ('hc:bleu', 100), ('hc:vert', 100), ('hc:violet', 100),
  ('outfit:aventurier', 250), ('outfit:maillot', 250), ('outfit:cape', 250),
  ('bg:etoiles', 150), ('bg:holo', 150), ('bg:aurore', 150), ('bg:volcan', 150),
  ('slot:2', 300)
on conflict (id) do update set price_pa = excluded.price_pa;

-- 2. Styles achetés, avatar enregistré, journal.
create table if not exists public.avatar_unlocks (
  user_id uuid not null references auth.users (id) on delete cascade,
  item text not null references public.avatar_items (id),
  at timestamptz not null default now(),
  primary key (user_id, item)
);
alter table public.avatar_unlocks enable row level security;
revoke all on public.avatar_unlocks from anon, authenticated;
alter table public.profiles add column if not exists avatar jsonb;
alter table public.ledger drop constraint if exists ledger_kind_check;
alter table public.ledger add constraint ledger_kind_check check (kind in ('welcome', 'reprise', 'share', 'pa_day', 'booster', 'coin', 'unlock', 'shop', 'admin', 'purchase', 'avatar'));
-- Un joueur ne modifie pas lui-même la colonne avatar (seulement par avatar_save).
revoke update (avatar) on public.profiles from authenticated;

-- 3. Achat d'un style PRO avec des PA.
create or replace function public.avatar_buy(item text, req uuid) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := public._game_begin(); price int; r jsonb;
begin
  r := public._game_replay(uid, req); if r is not null then return r; end if;
  select a.price_pa into price from public.avatar_items a where a.id = item;
  if price is null then raise exception 'Style inconnu' using errcode = 'P0001'; end if;
  if exists (select 1 from public.avatar_unlocks u where u.user_id = uid and u.item = avatar_buy.item) then raise exception 'Style déjà débloqué' using errcode = 'P0001'; end if;
  insert into public.avatar_unlocks (user_id, item) values (uid, item);
  r := public._game_move(uid, 'avatar', 0, -price, item, req);
  return r || jsonb_build_object('item', item, 'price', price);
end; $$;
revoke all on function public.avatar_buy(text, uuid) from public, anon;
grant execute on function public.avatar_buy(text, uuid) to authenticated;

-- 4. Enregistrement de l'avatar (vérifié).
create or replace function public.avatar_save(cfg jsonb) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := public._game_begin(); k text; v text; prem boolean; clean jsonb := '{}'::jsonb; n int;
begin
  if cfg is null or jsonb_typeof(cfg) <> 'object' or length(cfg::text) > 600 then raise exception 'Avatar invalide' using errcode = 'P0001'; end if;
  prem := public._premium_on(uid);
  foreach k in array array['skin', 'face', 'eyes', 'hair', 'hc', 'outfit', 'bg', 'pos'] loop
    v := cfg->>k;
    if v is null or v !~ '^[a-z0-9]{1,16}$' then raise exception 'Avatar invalide (%)', k using errcode = 'P0001'; end if;
    if k <> 'pos' and exists (select 1 from public.avatar_items a where a.id = k || ':' || v)
       and not prem and not exists (select 1 from public.avatar_unlocks u where u.user_id = uid and u.item = k || ':' || v) then
      raise exception 'Style PRO à débloquer : %', k || ':' || v using errcode = 'P0001';
    end if;
    clean := clean || jsonb_build_object(k, v);
  end loop;
  if (cfg->>'pos') not in ('right', 'left', 'shoulder', 'above', 'front', 'behind') then raise exception 'Avatar invalide (pos)' using errcode = 'P0001'; end if;
  n := coalesce((cfg->>'size')::int, 100);
  clean := clean || jsonb_build_object('size', greatest(60, least(140, n)));
  n := (cfg->>'poke')::int;
  if n is null or not public._game_owns(uid, n) then raise exception 'Pokémon non débloqué' using errcode = 'P0001'; end if;
  clean := clean || jsonb_build_object('poke', n);
  n := coalesce((cfg->>'poke2')::int, 0);
  if n <> 0 then
    if not prem and not exists (select 1 from public.avatar_unlocks u where u.user_id = uid and u.item = 'slot:2') then raise exception 'Style PRO à débloquer : slot:2' using errcode = 'P0001'; end if;
    if not public._game_owns(uid, n) then raise exception 'Pokémon non débloqué' using errcode = 'P0001'; end if;
  end if;
  clean := clean || jsonb_build_object('poke2', n);
  update public.profiles set avatar = clean, updated_at = now() where id = uid;
  return clean;
end; $$;
revoke all on function public.avatar_save(jsonb) from public, anon;
grant execute on function public.avatar_save(jsonb) to authenticated;

-- 5. Styles débloqués et avatar du joueur connecté.
create or replace function public.avatar_state() returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'owned', coalesce((select jsonb_agg(u.item order by u.item) from public.avatar_unlocks u where u.user_id = auth.uid()), '[]'::jsonb),
    'avatar', (select p.avatar from public.profiles p where p.id = auth.uid()),
    'premium', public._premium_on(auth.uid()))
  where auth.uid() is not null;
$$;
revoke all on function public.avatar_state() from public, anon;
grant execute on function public.avatar_state() to authenticated;

-- 6. Classement (013) : l'avatar de chaque joueur en plus.
create or replace function public.season_board(lim int default 50) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := auth.uid(); se jsonb; a timestamptz; b timestamptz; res jsonb; n int := least(greatest(coalesce(lim, 50), 3), 100);
begin
  if uid is null then raise exception 'Connecte-toi à ton compte Dropicards.' using errcode = '42501'; end if;
  se := public._season_at(now());
  a := (se->>'start')::timestamptz; b := (se->>'end')::timestamptz;
  with sc as (select * from public._season_scores(a, b)),
       rk as (select sc.user_id, sc.pk, (rank() over (order by sc.pk desc))::int as r, row_number() over (order by sc.pk desc, sc.user_id) as rn from sc)
  select jsonb_build_object(
    'season', se, 'now', now(), 'players', (select count(*) from rk),
    'top', coalesce((select jsonb_agg(jsonb_build_object('rank', rk.r, 'pseudo', p.pseudo, 'grade', public._game_grade(rk.user_id), 'pk', rk.pk, 'me', rk.user_id = uid, 'avatar', p.avatar) order by rk.rn)
                     from rk join public.profiles p on p.id = rk.user_id where rk.rn <= n), '[]'::jsonb),
    'me', (select jsonb_build_object('rank', rk.r, 'pk', rk.pk) from rk where rk.user_id = uid),
    'pk_total', coalesce((select w.pk_earned from public.wallets w where w.user_id = uid), 0),
    'grade', public._game_grade(uid)
  ) into res;
  return res;
end; $$;
revoke all on function public.season_board(int) from public, anon;
grant execute on function public.season_board(int) to authenticated;
