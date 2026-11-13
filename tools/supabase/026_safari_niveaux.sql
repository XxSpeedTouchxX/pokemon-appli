-- 026 : « Safari éclair », 3 niveaux de difficulté (2026-11-13, porteur : « lorsque l'utilisateur appuiera sur "go",
-- il devra choisir 3 niveaux de difficulté »). Après 024 (et 025). Rejouable (Studio › SQL Editor › Run).
--   - Facile (1) : vitesse d'origine, +2 PK par bon Pokémon, −1 PK par erreur, jamais moins de 0 (règle de 024).
--   - Normal (2) : vitesse ×2 (chaque Pokémon traverse deux fois plus vite), +4 PK par bon Pokémon, −4 PK par erreur.
--   - Difficile (3) : vitesse ×3, +8 PK par bon Pokémon, −8 PK par erreur.
--   - Normal et Difficile peuvent finir en négatif : les PK perdus sont retirés du solde (jamais sous 0 : la perte
--     s'arrête au solde). Facile ne fait jamais perdre de PK (défaut proposé, à confirmer par le porteur).
--   - 2XP PK : double les gains seulement, jamais les pertes (défaut proposé).
--   - Une perte retire des PK du solde, comme un achat ; elle ne retire rien aux « PK gagnés au total » (grades) ni aux
--     PK de la saison (défaut proposé, comme les dépenses).
--   - Gain maximal : 36 PK (Facile), 72 PK (Normal), 144 PK (Difficile) ; perte maximale : 0, 72 et 144 PK.
--   - Les 36 Pokémon (18 bons) passent toujours en 20 s ; seule leur vitesse change. Le serveur garde le niveau de la
--     partie : il compte lui-même les points à la fin.
--   - safari_start(req) de 024 reste (niveau Facile) : une app pas encore à jour continue de marcher.

-- 1. Niveau de chaque partie.
alter table public.safari_rounds add column if not exists lvl int not null default 1;
alter table public.safari_rounds drop constraint if exists safari_rounds_lvl_check;
alter table public.safari_rounds add constraint safari_rounds_lvl_check check (lvl between 1 and 3);

-- 2. Points de chaque niveau : (bon, erreur, vitesse).
create or replace function public._safari_pts(lvl int) returns int[]
language sql immutable set search_path = '' as $$
  select case lvl when 2 then array[4, 4, 2] when 3 then array[8, 8, 3] else array[2, 1, 1] end;
$$;
revoke all on function public._safari_pts(int) from public, anon, authenticated;

-- 3. Départ d'une partie au niveau choisi (1, 2 ou 3) : type et Pokémon tirés par le serveur, vitesse du niveau.
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
  if not public._game_free(uid) and coalesce(gr.safari_h, 0) = 0 then
    raise exception 'Le Safari éclair s’ouvre au grade Collectionneur' using errcode = 'P0001';
  end if;
  if not public._game_free(uid) and last is not null and last + make_interval(hours => gr.safari_h) > now() then
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

-- Ancien départ (024, app pas encore à jour) : niveau Facile.
create or replace function public.safari_start(req uuid) returns jsonb
language sql volatile security definer set search_path = '' as $$
  select public.safari_start(req, 1);
$$;
revoke all on function public.safari_start(uuid) from public, anon;
grant execute on function public.safari_start(uuid) to authenticated;

-- 4. Fin de la partie : le serveur compte les points du niveau ; gain (doublé en 2XP PK) ou perte (jamais sous 0).
create or replace function public.safari_finish(round uuid, hits int[], req uuid) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := public._game_begin(); r jsonb; rd public.safari_rounds%rowtype; g int; b int; w int; m int; pk int;
  pts int[]; gr public.game_grades%rowtype;
begin
  r := public._game_replay(uid, req); if r is not null then return r; end if;
  select * into rd from public.safari_rounds sr where sr.id = round and sr.user_id = uid for update;
  if not found or rd.finished_at is not null then raise exception 'Partie introuvable ou déjà finie' using errcode = 'P0001'; end if;
  if now() < rd.started_at + interval '18 seconds' then raise exception 'Partie pas encore finie' using errcode = 'P0001'; end if;
  if now() > rd.started_at + interval '10 minutes' then raise exception 'Partie expirée : relance-la' using errcode = 'P0001'; end if;
  select count(*) filter (where (e->>'ok')::boolean), count(*) filter (where not (e->>'ok')::boolean) into g, b
  from jsonb_array_elements(rd.spawns) e
  where (e->>'i')::int in (select distinct h from unnest(coalesce(hits, '{}'::int[])) h where h between 0 and 35);
  pts := public._safari_pts(rd.lvl);
  w := pts[1] * g - pts[2] * b;
  if rd.lvl = 1 then w := greatest(0, w); end if;
  m := case when w > 0 and public._pk_boost_on(uid) then 2 else 1 end;
  w := w * m;
  -- Perte : jamais plus que le solde (le solde ne descend pas sous 0).
  if w < 0 then
    select wl.pk into pk from public.wallets wl where wl.user_id = uid for update;
    w := greatest(w, -coalesce(pk, 0));
  end if;
  update public.safari_rounds sr set finished_at = now(), good = g, bad = b, won = w where sr.id = rd.id;
  select * into gr from public.game_grades where i = public._game_grade(uid);
  return public._game_move(uid, 'safari', w, 0, rd.kind || ' ' || g || '/' || b || ' · niveau ' || rd.lvl || case when m = 2 then ' · 2XP PK' else '' end, req)
    || jsonb_build_object('won', w, 'base', w / m, 'boost', m = 2, 'good', g, 'bad', b, 'kind', rd.kind, 'lvl', rd.lvl,
                          'raw', pts[1] * g - pts[2] * b, 'next', now() + make_interval(hours => gr.safari_h));
end; $$;
revoke all on function public.safari_finish(uuid, int[], uuid) from public, anon;
grant execute on function public.safari_finish(uuid, int[], uuid) to authenticated;

notify pgrst, 'reload schema';
