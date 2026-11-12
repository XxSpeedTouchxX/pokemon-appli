-- Tests de 024_safari.sql (après test_023).
\set ON_ERROR_STOP 1
reset role;
create or replace function pg_temp.check(ok boolean, label text) returns text language plpgsql as $$
begin if not ok then raise exception 'ÉCHEC : %', label; end if; return 'OK ' || label; end; $$;
grant execute on function pg_temp.check(boolean, text) to authenticated, anon, service_role;
create or replace function pg_temp.fails(q text, msg text) returns boolean language plpgsql as $$
begin execute q; return false; exception when others then return position(msg in sqlerrm) > 0; end; $$;
grant execute on function pg_temp.fails(text, text) to authenticated;
insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000f2401', 'safari@gmail.com'), ('00000000-0000-0000-0000-0000000f2402', 'voisin@gmail.com') on conflict do nothing;
create temp table sf (k text primary key, v jsonb);
grant all on sf to authenticated;

-- Départ : 36 Pokémon, 18 du bon type, tous dans les 20 s.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f2401', false);
set role authenticated;
insert into sf values ('a', public.safari_start('00000000-0000-0000-0000-00000000a001'));
select pg_temp.check(jsonb_array_length(v->'spawns') = 36 and (select count(*) from jsonb_array_elements(v->'spawns') e where (e->>'ok')::boolean) = 18
  and (select max((e->>'t')::int) from jsonb_array_elements(v->'spawns') e) < 19000, 'départ : 36 Pokémon, 18 du bon type, en moins de 19 s') from sf where k = 'a';
reset role;
select pg_temp.check((select bool_and((e->>'n')::int = any (t.nums) = (e->>'ok')::boolean) from jsonb_array_elements(sf.v->'spawns') e, public.safari_types t where t.t = sf.v->>'kind'), 'les bons sont du type demandé, les autres non') from sf where k = 'a';
set role authenticated;
select pg_temp.check((public.safari_start('00000000-0000-0000-0000-00000000a001')->>'round') = (select v->>'round' from sf where k = 'a'), 'même demande rejouée : même partie');
-- Fin trop tôt : refusée.
select pg_temp.check(pg_temp.fails(format('select public.safari_finish(%L, array[0,1]::int[], gen_random_uuid())', (select v->>'round' from sf where k = 'a')), 'pas encore finie'), 'fin avant 18 s refusée');
reset role;
update public.safari_rounds set started_at = now() - interval '25 seconds' where user_id = '00000000-0000-0000-0000-0000000f2401';
update public.game_throttle set n = 0;
-- Le voisin ne peut pas finir la partie d'un autre.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f2402', false);
set role authenticated;
select pg_temp.check(pg_temp.fails(format('select public.safari_finish(%L, array[0]::int[], gen_random_uuid())', (select v->>'round' from sf where k = 'a')), 'introuvable'), 'partie d''un autre joueur refusée');
reset role;
-- Tous les bons + 2 erreurs, des doublons et des numéros hors partie : 36 − 2 = 34 PK.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f2401', false);
insert into sf select 'hits', to_jsonb(array(select (e->>'i')::int from jsonb_array_elements(v->'spawns') e where (e->>'ok')::boolean)
  || array(select (e->>'i')::int from jsonb_array_elements(v->'spawns') e where not (e->>'ok')::boolean limit 2)) from sf where k = 'a';
set role authenticated;
insert into sf select 'f', public.safari_finish((select (v->>'round')::uuid from sf where k = 'a'),
  array(select jsonb_array_elements_text(v)::int from sf where k = 'hits') || array[0, 0, 99, -3], '00000000-0000-0000-0000-00000000a002');
select pg_temp.check((v->>'won')::int = 34 and (v->>'good')::int = 18 and (v->>'bad')::int = 2, 'gain : 18 bons × 2 − 2 erreurs = 34 PK') from sf where k = 'f';
select pg_temp.check((public.safari_finish((select (v->>'round')::uuid from sf where k = 'a'), array[]::int[], '00000000-0000-0000-0000-00000000a002')->>'replay')::boolean, 'même fin rejouée : rien de plus');
select pg_temp.check(pg_temp.fails(format('select public.safari_finish(%L, array[0]::int[], gen_random_uuid())', (select v->>'round' from sf where k = 'a')), 'déjà finie'), 'partie finie : impossible de la finir deux fois');
reset role;
select pg_temp.check((select pk from public.ledger where user_id = '00000000-0000-0000-0000-0000000f2401' and kind = 'safari') = 34, 'journal : +34 PK « safari »');
-- Délai : nouvelle partie refusée pendant 8 h (Recrue).
set role authenticated;
select pg_temp.check(pg_temp.fails('select public.safari_start(gen_random_uuid())', 'pas encore prêt'), 'nouvelle partie refusée pendant le délai');
select pg_temp.check((public.safari_state()->>'hours')::int = 8, 'délai de la Recrue : 8 h');
reset role;
alter table public.ledger disable trigger ledger_no_change;
update public.ledger set at = now() - interval '9 hours' where user_id = '00000000-0000-0000-0000-0000000f2401' and kind = 'safari';
alter table public.ledger enable trigger ledger_no_change;
update public.game_throttle set n = 0;
-- Que des erreurs : jamais moins de 0 ; 2XP PK : gain doublé.
set role authenticated;
insert into sf values ('b', public.safari_start(gen_random_uuid()));
reset role;
update public.safari_rounds set started_at = now() - interval '25 seconds' where id = (select (v->>'round')::uuid from sf where k = 'b');
set role authenticated;
select pg_temp.check((public.safari_finish((select (v->>'round')::uuid from sf where k = 'b'), array(select (e->>'i')::int from jsonb_array_elements((select v->'spawns' from sf where k = 'b')) e where not (e->>'ok')::boolean), gen_random_uuid())->>'won')::int = 0, 'que des erreurs : 0 PK, jamais négatif');
reset role;
alter table public.ledger disable trigger ledger_no_change;
update public.ledger set at = now() - interval '9 hours' where user_id = '00000000-0000-0000-0000-0000000f2401' and kind = 'safari';
alter table public.ledger enable trigger ledger_no_change;
insert into public.pk_boosts (user_id, until) values ('00000000-0000-0000-0000-0000000f2401', now() + interval '1 day') on conflict (user_id) do update set until = excluded.until;
set role authenticated;
insert into sf values ('c', public.safari_start(gen_random_uuid()));
reset role;
update public.safari_rounds set started_at = now() - interval '25 seconds' where id = (select (v->>'round')::uuid from sf where k = 'c');
set role authenticated;
select pg_temp.check((public.safari_finish((select (v->>'round')::uuid from sf where k = 'c'), array(select (e->>'i')::int from jsonb_array_elements((select v->'spawns' from sf where k = 'c')) e where (e->>'ok')::boolean limit 5), gen_random_uuid())->>'won')::int = 20, '2XP PK : 5 bons = 10 PK, doublés à 20');
reset role;
-- Saison : les PK du safari comptent.
select pg_temp.check((select pk from public._season_scores(now() - interval '1 day', now() + interval '1 day') where user_id = '00000000-0000-0000-0000-0000000f2401') >= 54, 'saison : PK du safari comptés');
-- Personne n'écrit dans les parties ni les types depuis l'app.
set role authenticated;
select pg_temp.check(pg_temp.fails('update public.safari_rounds set won = 999', 'permission'), 'parties : écriture refusée');
select pg_temp.check(pg_temp.fails('select * from public.safari_types', 'permission'), 'types : lecture directe refusée');
reset role;
