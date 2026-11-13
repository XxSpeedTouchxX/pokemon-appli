-- Tests de 026_safari_niveaux.sql (après test_025).
\set ON_ERROR_STOP 1
reset role;
create or replace function pg_temp.check(ok boolean, label text) returns text language plpgsql as $$
begin if not ok then raise exception 'ÉCHEC : %', label; end if; return 'OK ' || label; end; $$;
grant execute on function pg_temp.check(boolean, text) to authenticated, anon, service_role;
create or replace function pg_temp.fails(q text, msg text) returns boolean language plpgsql as $$
begin execute q; return false; exception when others then return position(msg in sqlerrm) > 0; end; $$;
grant execute on function pg_temp.fails(text, text) to authenticated;
insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000f2601', 'niveaux@gmail.com') on conflict do nothing;
create temp table sv (k text primary key, v jsonb);
grant all on sv to authenticated;
-- Le joueur est Collectionneur (conditions abaissées le temps du test, remises à la fin).
create temp table gg_save6 as select * from public.game_grades;
update public.game_grades set pk_earned = 0, comp = 0, mega = 0 where i = 2;
update public.game_throttle set n = 0;
-- Délai remis à zéro entre deux parties : la dernière partie est vieillie de 25 h.
create or replace function pg_temp.age() returns void language plpgsql as $$
begin
  alter table public.ledger disable trigger ledger_no_change;
  update public.ledger set at = now() - interval '25 hours' where user_id = '00000000-0000-0000-0000-0000000f2601' and kind = 'safari';
  alter table public.ledger enable trigger ledger_no_change;
  update public.game_throttle set n = 0;
end; $$;
-- Bons ou mauvais Pokémon d'une partie (n premiers).
create or replace function pg_temp.pick(k text, ok boolean, n int) returns int[] language sql as $$
  select coalesce(array(select (e->>'i')::int from jsonb_array_elements((select v->'spawns' from sv where sv.k = pick.k)) e where (e->>'ok')::boolean = ok limit n), '{}');
$$;
grant execute on function pg_temp.pick(text, boolean, int) to authenticated;
create or replace function pg_temp.old(k text) returns void language sql as $$
  update public.safari_rounds set started_at = now() - interval '25 seconds' where id = (select (v->>'round')::uuid from sv where sv.k = old.k);
$$;

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f2601', false);
set role authenticated;
select pg_temp.check(pg_temp.fails('select public.safari_start(gen_random_uuid(), 4)', 'Niveau inconnu'), 'niveau 4 refusé');
select pg_temp.check(pg_temp.fails('select public.safari_start(gen_random_uuid(), 0)', 'Niveau inconnu'), 'niveau 0 refusé');
-- Normal : vitesse ×2 (traversée de 1,85 s au plus au lieu de 3,7 s), +4 / −4.
insert into sv values ('n', public.safari_start('00000000-0000-0000-0000-00000000b001', 2));
select pg_temp.check((v->>'lvl')::int = 2 and (v->>'plus')::int = 4 and (v->>'minus')::int = 4, 'Normal : niveau 2, +4 / −4') from sv where k = 'n';
select pg_temp.check((select max((e->>'dur')::int) from jsonb_array_elements(v->'spawns') e) <= 1850
  and (select min((e->>'dur')::int) from jsonb_array_elements(v->'spawns') e) >= 1000
  and jsonb_array_length(v->'spawns') = 36 and (select max((e->>'t')::int) from jsonb_array_elements(v->'spawns') e) < 19000, 'Normal : 36 Pokémon en 20 s, deux fois plus rapides') from sv where k = 'n';
select pg_temp.check((public.safari_start('00000000-0000-0000-0000-00000000b001', 3)->>'lvl')::int = 2, 'même demande rejouée : même partie, même niveau');
reset role;
-- Solde de départ : 500 PK, 1 000 PK gagnés au total.
update public.wallets set pk = 500, pk_earned = 1000 where user_id = '00000000-0000-0000-0000-0000000f2601';
select pg_temp.old('n');
update public.game_throttle set n = 0;
set role authenticated;
-- 3 bons, 6 erreurs : 3 × 4 − 6 × 4 = −12 PK retirés du solde.
insert into sv select 'nf', public.safari_finish((select (v->>'round')::uuid from sv where k = 'n'), pg_temp.pick('n', true, 3) || pg_temp.pick('n', false, 6), gen_random_uuid());
select pg_temp.check((v->>'won')::int = -12 and (v->>'good')::int = 3 and (v->>'bad')::int = 6 and (v->>'lvl')::int = 2 and (v->>'pk')::int = 488, 'Normal : 3 bons, 6 erreurs = −12 PK, solde 488') from sv where k = 'nf';
reset role;
select pg_temp.check((select pk from public.ledger where user_id = '00000000-0000-0000-0000-0000000f2601' and kind = 'safari' order by id desc limit 1) = -12, 'journal : −12 PK « safari »');
select pg_temp.check((select pk_earned from public.wallets where user_id = '00000000-0000-0000-0000-0000000f2601') = 1000, 'perte : PK gagnés au total inchangés (grades)');
select pg_temp.check(coalesce((select pk from public._season_scores(now() - interval '1 day', now() + interval '1 day') where user_id = '00000000-0000-0000-0000-0000000f2601'), 0) >= 0, 'perte : rien de retiré à la saison');
-- Délai : la perte compte comme une partie jouée.
set role authenticated;
select pg_temp.check(pg_temp.fails('select public.safari_start(gen_random_uuid(), 1)', 'pas encore prêt'), 'après une perte : délai du grade');
reset role;
select pg_temp.age();
-- Difficile : vitesse ×3, +8 / −8 ; que des erreurs avec 50 PK : la perte s'arrête au solde (jamais sous 0).
update public.wallets set pk = 50 where user_id = '00000000-0000-0000-0000-0000000f2601';
set role authenticated;
insert into sv values ('d', public.safari_start(gen_random_uuid(), 3));
select pg_temp.check((v->>'plus')::int = 8 and (v->>'minus')::int = 8 and (select max((e->>'dur')::int) from jsonb_array_elements(v->'spawns') e) <= 1234, 'Difficile : +8 / −8, trois fois plus rapides') from sv where k = 'd';
reset role;
select pg_temp.old('d');
update public.game_throttle set n = 0;
set role authenticated;
insert into sv select 'df', public.safari_finish((select (v->>'round')::uuid from sv where k = 'd'), pg_temp.pick('d', false, 18), gen_random_uuid());
select pg_temp.check((v->>'won')::int = -50 and (v->>'raw')::int = -144 and (v->>'pk')::int = 0, 'Difficile : 18 erreurs = −144, perte arrêtée au solde (−50, solde 0)') from sv where k = 'df';
reset role;
select pg_temp.age();
-- Difficile avec 2XP PK : 5 bons = 40, doublés à 80 ; une perte n'est jamais doublée.
insert into public.pk_boosts (user_id, until) values ('00000000-0000-0000-0000-0000000f2601', now() + interval '1 day') on conflict (user_id) do update set until = excluded.until;
update public.wallets set pk = 500 where user_id = '00000000-0000-0000-0000-0000000f2601';
set role authenticated;
insert into sv values ('b', public.safari_start(gen_random_uuid(), 3));
reset role;
select pg_temp.old('b');
update public.game_throttle set n = 0;
set role authenticated;
select pg_temp.check((public.safari_finish((select (v->>'round')::uuid from sv where k = 'b'), pg_temp.pick('b', true, 5), gen_random_uuid())->>'won')::int = 80, '2XP PK : 5 bons × 8 = 40, doublés à 80');
reset role;
select pg_temp.age();
set role authenticated;
insert into sv values ('b2', public.safari_start(gen_random_uuid(), 2));
reset role;
select pg_temp.old('b2');
update public.game_throttle set n = 0;
set role authenticated;
select pg_temp.check((public.safari_finish((select (v->>'round')::uuid from sv where k = 'b2'), pg_temp.pick('b2', true, 1) || pg_temp.pick('b2', false, 3), gen_random_uuid())->>'won')::int = -8, '2XP PK : perte jamais doublée (4 − 12 = −8)');
reset role;
delete from public.pk_boosts where user_id = '00000000-0000-0000-0000-0000000f2601';
select pg_temp.age();
-- Facile : jamais de perte (que des erreurs = 0) ; l'ancien départ sans niveau = Facile, vitesse d'origine.
set role authenticated;
insert into sv values ('f', public.safari_start(gen_random_uuid()));
select pg_temp.check((v->>'lvl')::int = 1 and (v->>'plus')::int = 2 and (v->>'minus')::int = 1 and (select max((e->>'dur')::int) from jsonb_array_elements(v->'spawns') e) > 1850, 'ancien départ : Facile, vitesse d''origine') from sv where k = 'f';
reset role;
select pg_temp.old('f');
update public.game_throttle set n = 0;
set role authenticated;
select pg_temp.check((public.safari_finish((select (v->>'round')::uuid from sv where k = 'f'), pg_temp.pick('f', false, 10), gen_random_uuid())->>'won')::int = 0, 'Facile : 10 erreurs = 0 PK, jamais de perte');
-- Personne ne change le niveau d'une partie depuis l'app.
select pg_temp.check(pg_temp.fails('update public.safari_rounds set lvl = 1', 'permission'), 'niveau d''une partie : écriture refusée');
reset role;
update public.game_grades g set pk_earned = x.pk_earned, comp = x.comp, mega = x.mega from gg_save6 x where g.i = x.i;
