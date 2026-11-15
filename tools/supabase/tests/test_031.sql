-- Tests de 031_carte_joueur.sql (après test_028) : carte de visite d'un joueur du classement.
-- Chaque ligne « OK » est une vérification réussie ; le script s'arrête à la première erreur.
\set ON_ERROR_STOP 1
reset role;
create or replace function pg_temp.check(ok boolean, label text) returns text language plpgsql as $$
begin if not ok then raise exception 'ÉCHEC : %', label; end if; return 'OK ' || label; end; $$;
create or replace function pg_temp.fails(q text, msg text) returns boolean language plpgsql as $$
begin execute q; return false; exception when others then return position(msg in sqlerrm) > 0; end; $$;
create or replace function pg_temp.as_user(u text) returns void language sql as $$ select set_config('request.jwt.claim.sub', u, false) $$;
grant execute on function pg_temp.check(boolean, text), pg_temp.fails(text, text) to authenticated, anon;
update public.game_season set start_at = now() - interval '40 days', days = 60;
update public.game_throttle set n = 0;
-- État de départ (test_028) : en saison 1, T1 (f2806) et T2 (f2807) à 380 PL, T2 arrivé le premier ; A (f2808) admin.

-- A. Le classement porte l'identifiant de chaque joueur.
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2806');
set role authenticated;
create temp table b31 as select public.season_board(100) as j;
reset role;
select pg_temp.check((select bool_and(e ? 'id') and count(*) > 0 from b31, jsonb_array_elements(j->'top') e), 'classement : chaque joueur a son identifiant');
select pg_temp.check((select bool_and((e->>'me')::boolean = (e->>'id' = '00000000-0000-0000-0000-0000000f2806')) from b31, jsonb_array_elements(j->'top') e), 'classement : « me » sur ma ligne seulement');
select pg_temp.check((select j->'me'->>'id' = '00000000-0000-0000-0000-0000000f2806' from b31), 'classement : ma ligne « me » porte aussi mon identifiant');

-- B. Carte d'un autre joueur, saison en cours.
set role authenticated;
create temp table c31 as select public.player_card('00000000-0000-0000-0000-0000000f2807') as j;
reset role;
select pg_temp.check((select j->>'pseudo' is not null and (j->>'me')::boolean = false and j ? 'avatar' and (j->>'grade') is not null from c31), 'carte : pseudo, avatar, grade');
select pg_temp.check((select j->>'since' = to_char(date_trunc('month', (select created_at from public.profiles where id = '00000000-0000-0000-0000-0000000f2807') at time zone 'Europe/Paris'), 'YYYY-MM') from c31), 'carte : membre depuis (au mois près)');
select pg_temp.check((select (j->'season'->>'n')::int = 1 and (j->'season'->>'pl')::int = 380 and (j->'season'->>'rank')::int
    = (select (e->>'rank')::int from b31, jsonb_array_elements(j->'top') e where e->>'id' = '00000000-0000-0000-0000-0000000f2807') from c31), 'carte : PL et place de la saison, comme au classement');
select pg_temp.check((select j->'past' = '[]'::jsonb from c31), 'carte : aucune saison passée en saison 1');
select pg_temp.check((select not (j ? 'email') and not (j ? 'age_range') and not (j ? 'role') from c31), 'carte : ni e-mail, ni âge, ni rôle');

-- C. Sa propre carte.
set role authenticated;
select pg_temp.check((select (j->>'me')::boolean and (j->'season'->>'pl')::int = 380 from (select public.player_card('00000000-0000-0000-0000-0000000f2806') as j) x), 'ma carte : « me » et mes PL');
reset role;

-- D. Saison suivante : la saison 1 passe dans « saisons passées » avec ses PL et sa place.
update public.game_season set start_at = now() - interval '70 days';
set role authenticated;
create temp table d31 as select public.player_card('00000000-0000-0000-0000-0000000f2807') as j;
reset role;
select pg_temp.check((select (j->'season'->>'n')::int = 2 and (j->'season'->>'pl')::int = 0 from d31), 'saison 2 : 0 PL pour l’instant');
select pg_temp.check((select jsonb_array_length(j->'past') = 1 and (j->'past'->0->>'n')::int = 1 and (j->'past'->0->>'pl')::int = 380
    and (j->'past'->0->>'rank')::int = (select (e->>'rank')::int from b31, jsonb_array_elements(j->'top') e where e->>'id' = '00000000-0000-0000-0000-0000000f2807') from d31),
  'saisons passées : saison 1, 380 PL, même place qu’à la fin de la saison');
update public.game_season set start_at = now() - interval '40 days';

-- E. Admin : carte visible mais jamais classé ; compte suspendu : refusé ; visiteur non connecté : refusé.
select pg_temp.check((select role = 'admin' from public.profiles where id = '00000000-0000-0000-0000-0000000f2808'), 'A est admin');
set role authenticated;
select pg_temp.check((select j->'season'->>'rank' is null and j->'past' = '[]'::jsonb from (select public.player_card('00000000-0000-0000-0000-0000000f2808') as j) x), 'admin : pas de place au classement');
reset role;
update public.profiles set status = 'suspended' where id = '00000000-0000-0000-0000-0000000f2805';
set role authenticated;
select pg_temp.check(pg_temp.fails($$select public.player_card('00000000-0000-0000-0000-0000000f2805')$$, 'plus dans la ligue'), 'compte suspendu : carte refusée');
select pg_temp.check(pg_temp.fails($$select public.player_card('00000000-0000-0000-0000-00000000dead')$$, 'plus dans la ligue'), 'compte inconnu : carte refusée');
reset role;
update public.profiles set status = 'active' where id = '00000000-0000-0000-0000-0000000f2805';
set role anon;
select pg_temp.check(pg_temp.fails($$select public.player_card('00000000-0000-0000-0000-0000000f2807')$$, 'permission denied'), 'visiteur non connecté : refusé');
reset role;
set role authenticated;
select pg_temp.check(pg_temp.fails($$select * from public._pl_rank('00000000-0000-0000-0000-0000000f2807', 1)$$, 'permission denied'), '_pl_rank : refusée aux joueurs');
reset role;
