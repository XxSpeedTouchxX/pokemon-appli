-- 031_carte_joueur.sql — Carte de visite d'un joueur du classement de « Ma ligue » (2026-11-15, porteur).
--
-- Demande du porteur : « lorsqu'un utilisateur clique sur le profil d'un joueur du classement, il peut voir sa carte de
-- visite : son avatar, son pseudo, depuis quand il est sur l'appli, les PL remportés et son classement des anciennes
-- saisons et de sa saison actuelle ».
--   - season_board (remplace celle de 028) : chaque joueur du classement (et ma ligne « me ») porte son identifiant
--     (« id »), pour ouvrir sa carte ; rien d'autre ne change.
--   - player_card(target) : la carte d'un joueur, pour tout compte connecté. Seulement ce que le classement montre déjà
--     (pseudo, avatar, grade, PL et place) plus le mois d'arrivée sur Dropicards (« membre depuis », au mois près) et
--     ses saisons passées (PL et place). Jamais l'adresse e-mail, l'âge ni la collection.
--   - Comptes admin ou suspendus : pas classés (comme au classement) ; carte d'un compte suspendu ou supprimé refusée.
-- À installer après 028 (install_024_a_033.sql). Rejouable. Tests : tests/test_031.sql.

do $$ begin
  if to_regprocedure('public._pl_scores(integer)') is null or to_regclass('public.pl_ledger') is null then
    raise exception 'Installe d''abord 028_points_loyaute.sql (fichier install_024_a_033.sql)';
  end if;
end $$;

-- 1. Classement de la saison (même règle que 028), avec l'identifiant de chaque joueur.
create or replace function public.season_board(lim int default 50) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := auth.uid(); se jsonb; s int; res jsonb; n int := least(greatest(coalesce(lim, 50), 3), 100);
begin
  if uid is null then raise exception 'Connecte-toi à ton compte Dropicards.' using errcode = '42501'; end if;
  se := public._season_at(now()); s := (se->>'n')::int;
  with sc as (select * from public._pl_scores(s)),
       rk as (select sc.user_id, sc.pl, (rank() over (order by sc.pl desc, sc.last_at asc nulls last))::int as r,
                     row_number() over (order by sc.pl desc, sc.last_at asc nulls last, sc.user_id) as rn from sc)
  select jsonb_build_object(
    'unit', 'pl', 'season', se, 'now', now(), 'players', (select count(*) from rk),
    'ranked', (select count(*) from rk where rk.pl > 0),
    'top', coalesce((select jsonb_agg(jsonb_build_object('id', rk.user_id, 'rank', rk.r, 'pseudo', p.pseudo, 'grade', public._game_grade(rk.user_id), 'pl', rk.pl,
                       'me', rk.user_id = uid, 'avatar', p.avatar) order by rk.rn)
                     from rk join public.profiles p on p.id = rk.user_id where rk.rn <= n), '[]'::jsonb),
    'me', (select jsonb_build_object('id', rk.user_id, 'rank', rk.r, 'pl', rk.pl) from rk where rk.user_id = uid),
    'pl_season', coalesce((select sum(l.pl) from public.pl_ledger l where l.user_id = uid and l.season = s), 0),
    'pl_total', coalesce((select sum(l.pl) from public.pl_ledger l where l.user_id = uid), 0),
    'pk_total', coalesce((select w.pk_earned from public.wallets w where w.user_id = uid), 0),
    'grade', public._game_grade(uid)
  ) into res;
  return res;
end; $$;
revoke all on function public.season_board(int) from public, anon;
grant execute on function public.season_board(int) to authenticated;

-- 2. Place et PL d'un joueur dans une saison (même règle que le classement : PL décroissants, égalité départagée par
-- l'heure du dernier gain). Aucune ligne si le joueur n'est pas classé (admin, compte suspendu, pas de pseudo).
create or replace function public._pl_rank(target uuid, n int) returns table (rank int, pl bigint, players bigint)
language sql stable security definer set search_path = '' as $$
  with sc as (select * from public._pl_scores(n)),
       rk as (select sc.user_id, sc.pl, (rank() over (order by sc.pl desc, sc.last_at asc nulls last))::int as r from sc)
  select rk.r, rk.pl, (select count(*) from rk) from rk where rk.user_id = target;
$$;
revoke all on function public._pl_rank(uuid, int) from public, anon, authenticated;

-- 3. Carte de visite d'un joueur.
create or replace function public.player_card(target uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := auth.uid(); p public.profiles%rowtype; s int; cur jsonb; past jsonb;
begin
  if uid is null then raise exception 'Connecte-toi à ton compte Dropicards.' using errcode = '42501'; end if;
  select * into p from public.profiles where id = target and status = 'active' and pseudo is not null;
  if not found then raise exception 'Ce joueur n''est plus dans la ligue.' using errcode = 'P0001'; end if;
  s := (public._season_at(now())->>'n')::int;
  select jsonb_build_object('n', s, 'rank', r.rank, 'pl', r.pl, 'players', r.players) into cur from public._pl_rank(target, s) r;
  -- Saisons passées où le joueur a gagné des PL, de la plus récente à la plus ancienne.
  select coalesce(jsonb_agg(y.x order by y.k desc), '[]'::jsonb) into past from (
    select k, jsonb_build_object('n', k, 'rank', r.rank, 'pl', r.pl, 'players', r.players) as x
    from generate_series(1, greatest(s - 1, 0)) k cross join lateral public._pl_rank(target, k) r where r.pl > 0) y;
  return jsonb_build_object(
    'id', p.id, 'pseudo', p.pseudo, 'avatar', p.avatar, 'grade', public._game_grade(target), 'me', target = uid,
    'since', to_char(date_trunc('month', p.created_at at time zone 'Europe/Paris'), 'YYYY-MM'),
    'season', coalesce(cur, jsonb_build_object('n', s, 'rank', null, 'pl', 0, 'players', null)),
    'past', past);
end; $$;
revoke all on function public.player_card(uuid) from public, anon;
grant execute on function public.player_card(uuid) to authenticated;

-- Fin : l'API de Supabase relit la liste des fonctions (sinon l'app ne les voit qu'au redémarrage).
notify pgrst, 'reload schema';
