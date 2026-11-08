-- Tests de 013_saisons.sql (après test_012).
\set ON_ERROR_STOP 1
reset role;
create or replace function pg_temp.check(ok boolean, label text) returns text language plpgsql as $$
begin if not ok then raise exception 'ÉCHEC : %', label; end if; return 'OK ' || label; end; $$;
create or replace function pg_temp.fails(q text, label text) returns text language plpgsql as $$
begin
  begin execute q; exception when others then return 'OK ' || label || ' (refusé : ' || left(sqlerrm, 90) || ')'; end;
  raise exception 'ÉCHEC : % (accepté)', label;
end; $$;
grant execute on function pg_temp.check(boolean, text), pg_temp.fails(text, text) to authenticated, anon, service_role;

-- Saisons de 60 jours depuis le 8 novembre 2026 (heure de Paris).
select pg_temp.check((select start_at = '2026-11-08 00:00:00 Europe/Paris'::timestamptz and days = 60 from public.game_season), 'saison 1 : 8 novembre 2026, 60 jours');
select pg_temp.check((public._season_at('2026-11-20 12:00 Europe/Paris')->>'n')::int = 1, '20 novembre 2026 : saison 1');
select pg_temp.check((public._season_at('2027-01-07 00:00 Europe/Paris')->>'n')::int = 2 and (public._season_at('2027-01-07 00:00 Europe/Paris')->>'start')::timestamptz = '2027-01-07 00:00 Europe/Paris', '7 janvier 2027 : saison 2 commence');
select pg_temp.check((public._season_at('2026-10-01')->>'n')::int = 1, 'avant le départ : saison 1');

-- Saison en cours pour les tests : commencée il y a 10 jours.
update public.game_season set start_at = now() - interval '10 days';
-- Trois nouveaux joueurs classés (Alpha, Bravo, Charlie), un admin (non classé), un joueur sans pseudo (non classé) ;
-- les joueurs des tests précédents n'ont plus de pseudo (non classés), pour un classement connu d'avance.
insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000000c1', 'c1@gmail.com'), ('00000000-0000-0000-0000-0000000000c2', 'c2@gmail.com'),
  ('00000000-0000-0000-0000-0000000000c3', 'c3@gmail.com'), ('00000000-0000-0000-0000-0000000000c4', 'c4@gmail.com') on conflict do nothing;
update public.profiles set pseudo = null where id not in ('00000000-0000-0000-0000-0000000000ad');
update public.profiles set pseudo = 'Alpha' where id = '00000000-0000-0000-0000-0000000000c1';
update public.profiles set pseudo = 'Bravo' where id = '00000000-0000-0000-0000-0000000000c3';
update public.profiles set pseudo = 'Charlie' where id = '00000000-0000-0000-0000-0000000000c4';
update public.profiles set pseudo = 'Admin', role = 'admin' where id = '00000000-0000-0000-0000-0000000000ad';
insert into public.ledger (user_id, kind, pk, pa, pk_after, pa_after, at) values
  ('00000000-0000-0000-0000-0000000000c1', 'booster', 500, 0, 0, 0, now() - interval '2 days'),
  ('00000000-0000-0000-0000-0000000000c1', 'coin', 50, 0, 0, 0, now() - interval '1 day'),
  ('00000000-0000-0000-0000-0000000000c1', 'shop', -500, 0, 0, 0, now() - interval '1 day'),        -- achat : pas déduit
  ('00000000-0000-0000-0000-0000000000c1', 'booster', 9000, 0, 0, 0, now() - interval '20 days'),   -- saison précédente
  ('00000000-0000-0000-0000-0000000000c3', 'booster', 200, 0, 0, 0, now() - interval '3 days'),
  ('00000000-0000-0000-0000-0000000000c3', 'admin', 100000, 0, 0, 0, now() - interval '3 days'),    -- don d'un admin : exclu
  ('00000000-0000-0000-0000-0000000000c4', 'welcome', 100, 0, 0, 0, now() - interval '3 days'),
  ('00000000-0000-0000-0000-0000000000c4', 'booster', 100, 0, 0, 0, now() - interval '2 days'),
  ('00000000-0000-0000-0000-0000000000c2', 'booster', 5000, 0, 0, 0, now() - interval '2 days'),
  ('00000000-0000-0000-0000-0000000000ad', 'booster', 50000, 0, 0, 0, now() - interval '2 days');

-- Vu par le joueur Bravo.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000c3', false);
set role authenticated;
select pg_temp.check((public.season_board(50)->'season'->>'n')::int = 1, 'saison en cours : 1');
select pg_temp.check((select string_agg((e->>'pseudo') || ':' || (e->>'pk') || ':' || (e->>'rank'), ',' order by ord) from jsonb_array_elements(public.season_board(50)->'top') with ordinality as t(e, ord)) = 'Alpha:550:1,Bravo:200:2,Charlie:200:2',
  'classement : Alpha 550 (achats non déduits, saison précédente exclue), Bravo et Charlie 200 à égalité (don d''admin exclu)');
select pg_temp.check(not exists (select 1 from jsonb_array_elements(public.season_board(50)->'top') e where e->>'pseudo' in ('Admin') or e->>'pseudo' is null), 'admin et joueur sans pseudo : pas classés');
select pg_temp.check((public.season_board(50)->'me'->>'rank')::int = 2 and (public.season_board(50)->'me'->>'pk')::int = 200, 'ma place : 2ᵉ avec 200 PK');
select pg_temp.check((select bool_and((e->>'me')::boolean = (e->>'pseudo' = 'Bravo')) from jsonb_array_elements(public.season_board(50)->'top') e), 'ma ligne marquée « me »');
select pg_temp.check(public.season_board(50)::text not like '%@%' and public.season_board(50)::text not like '%00000000-0000%', 'aucun e-mail ni identifiant d''un autre joueur');
select pg_temp.check((public.season_board(50)->>'players')::int = 3 and (public.season_board(50)->'top'->0) ? 'grade', 'nombre de joueurs et grade de chaque joueur');
select pg_temp.fails($$select * from public.game_season$$, 'un joueur lit la table des saisons');
select pg_temp.fails($$update public.game_season set days = 7$$, 'un joueur change la durée d''une saison');
select pg_temp.fails($$select * from public.season_winners(1)$$, 'un joueur lit la liste des gagnants (e-mails)');
select pg_temp.fails($$select * from public._season_scores(now() - interval '1 year', now())$$, 'un joueur lit les scores bruts');
reset role;
-- Sans connexion : refusé.
select set_config('request.jwt.claim.sub', '', false);
set role anon;
select pg_temp.fails($$select public.season_board(50)$$, 'classement sans connexion');
reset role;
-- Admin connecté : pas classé, mais voit le classement.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000ad', false);
set role authenticated;
select pg_temp.check(public.season_board(50)->'me' = 'null'::jsonb and jsonb_array_length(public.season_board(50)->'top') >= 3, 'admin : voit le classement, sans place');
reset role;
-- Studio : gagnants avec e-mail et lot.
select pg_temp.check((select string_agg(rang || ':' || pseudo || ':' || lot, ',' order by rang, pseudo) from public.season_winners(1)) = '1:Alpha:Top 10 : lot à définir,2:Bravo:Top 10 : lot à définir,2:Charlie:Top 10 : lot à définir', 'gagnants de la saison 1 (Studio)');
select pg_temp.check((select count(*) from public.season_winners(1) where email like '%@%') = 3, 'gagnants : e-mail pour remettre le lot');
