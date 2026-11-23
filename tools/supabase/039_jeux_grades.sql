-- 039 : chaque jeu s'ouvre au grade prévu, pour tout le monde (2026-11-23, porteur : « je suis grade Chasseur et j'ai
-- accès à Safari éclair qui n'est dispo qu'à partir du grade Collectionneur, rectifie-moi ça et fais une vérification
-- pour le déblocage de chaque jeu en fonction des grades »). Après 027 (et 016 pour la pièce). Rejouable.
--   - Avant : les comptes « sans délai » (admins, mot de passe des admins, liste safari_free de 027) ouvraient aussi le
--     Safari éclair et la pièce sous leur grade.
--   - Maintenant : « sans délai » retire seulement l'attente entre deux parties. Le grade décide toujours :
--       Booster PK   : tous les grades (24, 20, 12, 8, 6, 4 h) ;
--       Pile ou face : dès Chasseur (24, 12, 8, 6, 4 h) ;
--       Safari éclair : dès Collectionneur (24, 12, 6, 4 h).
--   - Les délais de chaque grade sont remis aux valeurs de l'app (profile.js, PF_GRADES), au cas où ils auraient bougé.
-- Pour essayer le Safari avec un compte admin de grade plus bas : lui offrir le grade dans Studio (requetes_grade.sql).

-- 1. Délais de chaque grade (heures ; 0 = jeu fermé à ce grade).
update public.game_grades g set booster_h = v.b, coin_h = v.c, safari_h = v.s
from (values (0, 24, 0, 0), (1, 20, 24, 0), (2, 12, 12, 24), (3, 8, 8, 12), (4, 6, 6, 6), (5, 4, 4, 4)) as v(i, b, c, s)
where g.i = v.i;

-- 2. État du Safari lu par l'app : « locked » suit le grade seul ; « free » = sans délai.
create or replace function public.safari_state() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := auth.uid(); last timestamptz; h int; fr boolean;
begin
  if uid is null then raise exception 'Connexion requise' using errcode = '28000'; end if;
  select max(at) into last from public.ledger where user_id = uid and kind = 'safari';
  select safari_h into h from public.game_grades where i = public._game_grade(uid);
  fr := public._safari_free(uid);
  return jsonb_build_object('last', last, 'hours', coalesce(h, 0), 'free', fr, 'locked', coalesce(h, 0) = 0,
    'next', case when last is null or fr or coalesce(h, 0) = 0 then now() else last + make_interval(hours => h) end, 'server_now', now());
end; $$;
revoke all on function public.safari_state() from public, anon;
grant execute on function public.safari_state() to authenticated;
comment on function public.safari_state() is '039 : Safari fermé sous le grade Collectionneur pour tout le monde';

-- 3. Départ d'une partie : même règle que 027, mais le grade passe avant « sans délai ».
create or replace function public.safari_start(req uuid, lvl int) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := public._game_begin(); gr public.game_grades%rowtype; last timestamptz; ty public.safari_types%rowtype;
  decoys int[]; sp jsonb; rid uuid; old public.safari_rounds%rowtype; pts int[];
begin
  if lvl is null or lvl not between 1 and 3 then raise exception 'Niveau inconnu' using errcode = 'P0001'; end if;
  select * into old from public.safari_rounds sr where sr.user_id = uid and sr.req = safari_start.req;
  if found then
    pts := public._safari_pts(old.lvl);
    return jsonb_build_object('round', old.id, 'kind', old.kind, 'spawns', old.spawns, 'lvl', old.lvl, 'plus', pts[1], 'minus', pts[2], 'server_now', now());
  end if;
  pts := public._safari_pts(lvl);
  select * into gr from public.game_grades where i = public._game_grade(uid);
  select max(at) into last from public.ledger where user_id = uid and kind = 'safari';
  if coalesce(gr.safari_h, 0) = 0 then
    raise exception 'Le Safari éclair s’ouvre au grade Collectionneur' using errcode = 'P0001';
  end if;
  if not public._safari_free(uid) and last is not null and last + make_interval(hours => gr.safari_h) > now() then
    raise exception 'Safari pas encore prêt' using errcode = 'P0001';
  end if;
  select * into ty from public.safari_types order by public._game_rand() limit 1;
  select array_agg(n) into decoys from (select distinct unnest(nums) as n from public.safari_types) x where not (n = any (ty.nums));
  with s as (select g, (g <= 18) as tgt, public._game_rand() as k from generate_series(1, 36) g),
       o as (select (row_number() over (order by k) - 1)::int as idx, tgt from s)
  select jsonb_agg(jsonb_build_object(
    'i', idx,
    'n', case when tgt then ty.nums[1 + floor(public._game_rand() * array_length(ty.nums, 1))::int]
              else decoys[1 + floor(public._game_rand() * array_length(decoys, 1))::int] end,
    'ok', tgt,
    't', idx * 520 + floor(public._game_rand() * 250)::int,
    'lane', floor(public._game_rand() * 5)::int,
    'dir', case when public._game_rand() < 0.5 then 1 else -1 end,
    -- Vitesse ×2 ou ×3 : la traversée dure 2 ou 3 fois moins longtemps.
    'dur', ((3400 - idx * 38 + floor(public._game_rand() * 300)::int) / pts[3])::int) order by idx)
  into sp from o;
  delete from public.safari_rounds where user_id = uid and finished_at is null;
  insert into public.safari_rounds (user_id, req, kind, spawns, lvl) values (uid, safari_start.req, ty.t, sp, safari_start.lvl) returning id into rid;
  return jsonb_build_object('round', rid, 'kind', ty.t, 'spawns', sp, 'lvl', safari_start.lvl, 'plus', pts[1], 'minus', pts[2], 'server_now', now());
end; $$;
revoke all on function public.safari_start(uuid, int) from public, anon;
grant execute on function public.safari_start(uuid, int) to authenticated;
comment on function public.safari_start(uuid, int) is '039 : Safari fermé sous le grade Collectionneur pour tout le monde';

-- 4. Pile ou face (remplace 016) : fermée à la Recrue pour tout le monde ; « sans délai » (mot de passe des admins)
-- retire seulement l'attente. Gains inchangés : 50 PK une fois sur deux, 100 PK pendant un 2XP PK.
create or replace function public.flip_coin(req uuid) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := public._game_begin(); gr public.game_grades%rowtype; last timestamptz; won int; m int; r jsonb; free boolean := public._game_free(uid);
begin
  r := public._game_replay(uid, req); if r is not null then return r; end if;
  select * into gr from public.game_grades where i = public._game_grade(uid);
  if coalesce(gr.coin_h, 0) = 0 then raise exception 'Pièce réservée au grade Chasseur et plus' using errcode = 'P0001'; end if;
  select max(at) into last from public.ledger where user_id = uid and kind = 'coin';
  if not free and last is not null and last + make_interval(hours => gr.coin_h) > now() then raise exception 'Pièce pas encore prête' using errcode = 'P0001'; end if;
  won := case when public._game_rand() < 0.5 then 50 else 0 end;
  m := case when public._pk_boost_on(uid) then 2 else 1 end;
  return public._game_move(uid, 'coin', won * m, 0, case when m = 2 and won > 0 then '2XP PK' end, req)
    || jsonb_build_object('won', won * m, 'base', won, 'boost', m = 2, 'win', won > 0, 'next', now() + make_interval(hours => greatest(gr.coin_h, 4)));
end; $$;
revoke all on function public.flip_coin(uuid) from public, anon;
grant execute on function public.flip_coin(uuid) to authenticated;
comment on function public.flip_coin(uuid) is '039 : pièce fermée à la Recrue pour tout le monde';

notify pgrst, 'reload schema';
