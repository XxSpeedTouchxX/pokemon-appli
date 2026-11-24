-- 2XP PK et 2XP PA sur le serveur une fois tous les scripts installés (2026-11-24, porteur : « fais en sorte que les
-- doubles XP de PA et PK marchent bien ; j'ai l'impression que je n'ai pas eu de double XP sur mes PK aujourd'hui »).
-- À lancer après le dernier script (039) et ses tests : vérifie l'état final, quel que soit le script qui a remplacé
-- en dernier chaque jeu (Booster PK 016, pile ou face 039, Safari 027, PA du jour 019).
--   - 2XP PK (boîte mystère, DropiPass au 1er abonnement) : PK doublés au Booster PK, à pile ou face et au Safari
--     (gains seulement : une perte du Safari n'est jamais doublée) ; compte admin déverrouillé compris.
--   - 2XP PA (boîte mystère) ou DropiPass : PA du jour doublés, ×2 au plus quand on a les deux.
--   - Les PK doublés comptent dans les PK gagnés (grades, saison) ; le journal porte « 2XP PK ».
--   - 2XP terminé : plus rien n'est doublé.
\set ON_ERROR_STOP 1
reset role;
create or replace function pg_temp.check(ok boolean, label text) returns text language plpgsql as $$
begin if not ok then raise exception 'ÉCHEC : %', label; end if; return 'OK ' || label; end; $$;
grant execute on function pg_temp.check(boolean, text) to authenticated, anon, service_role;

-- Joueurs : b avec un 2XP PK, a admin déverrouillé avec un 2XP PK, n sans 2XP, e 2XP terminé ;
-- PA : p DropiPass, x 2XP PA, d les deux, z aucun.
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000002a001', 'xp-b@gmail.com'), ('00000000-0000-0000-0000-00000002a002', 'xp-a@gmail.com'),
  ('00000000-0000-0000-0000-00000002a003', 'xp-n@gmail.com'), ('00000000-0000-0000-0000-00000002a004', 'xp-e@gmail.com'),
  ('00000000-0000-0000-0000-00000002a005', 'xp-p@gmail.com'), ('00000000-0000-0000-0000-00000002a006', 'xp-x@gmail.com'),
  ('00000000-0000-0000-0000-00000002a007', 'xp-d@gmail.com'), ('00000000-0000-0000-0000-00000002a008', 'xp-z@gmail.com') on conflict do nothing;
-- Grade Collectionneur (pièce et Safari ouverts) sans compagnons demandés le temps du test ; liste safari_free pour rejouer.
create temp table gg_save2x as select * from public.game_grades;
update public.game_grades set comp = 0, mega = 0 where i = 2;
update public.wallets set pk = 0, pk_earned = 7500 where user_id in ('00000000-0000-0000-0000-00000002a001', '00000000-0000-0000-0000-00000002a002', '00000000-0000-0000-0000-00000002a003', '00000000-0000-0000-0000-00000002a004');
insert into public.safari_free (user_id, note) values ('00000000-0000-0000-0000-00000002a001', 'test 2XP'), ('00000000-0000-0000-0000-00000002a003', 'test 2XP') on conflict do nothing;
insert into public.pk_boosts (user_id, until) values
  ('00000000-0000-0000-0000-00000002a001', now() + interval '3 days'), ('00000000-0000-0000-0000-00000002a002', now() + interval '3 days'),
  ('00000000-0000-0000-0000-00000002a004', now() - interval '1 minute')
on conflict (user_id) do update set until = excluded.until;
update public.profiles set role = 'admin', status = 'active' where id = '00000000-0000-0000-0000-00000002a002';
insert into public.admin_unlocks (user_id, until) values ('00000000-0000-0000-0000-00000002a002', now() + interval '1 day') on conflict (user_id) do update set until = excluded.until;
update public.game_throttle set n = 0;

-- Partie de Safari : bons Pokémon touchés (good) ou mauvais seulement (bad), au niveau voulu.
create or replace function pg_temp.safari(uid uuid, lvl int, mode text) returns jsonb language plpgsql as $$
declare r jsonb; hits int[];
begin
  perform set_config('request.jwt.claim.sub', uid::text, true);
  execute 'set local role authenticated';
  r := public.safari_start(gen_random_uuid(), lvl);
  execute 'reset role';
  update public.safari_rounds set started_at = now() - interval '25 seconds' where id = (r->>'round')::uuid;
  select array_agg((e->>'i')::int) into hits from public.safari_rounds sr, jsonb_array_elements(sr.spawns) e
  where sr.id = (r->>'round')::uuid and (e->>'ok')::boolean = (mode = 'good');
  update public.game_throttle set n = 0;
  execute 'set local role authenticated';
  r := public.safari_finish((r->>'round')::uuid, hits, gen_random_uuid());
  execute 'reset role';
  return r;
end; $$;

-- 1. Joueur avec un 2XP PK.
begin;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000002a001', true);
set local role authenticated;
select pg_temp.check((public.pk_boost_state()->>'on')::boolean, 'b : 2XP PK actif lu par l’app (pk_boost_state)');
select pg_temp.check((select (r->>'won')::int = 2 * (r->>'base')::int and (r->>'boost')::boolean and (r->>'base')::int in (30, 50, 100, 200, 500)
  from (select public.open_booster(gen_random_uuid()) r) t), 'b : Booster PK doublé (gain = 2 × tirage)');
select pg_temp.check((select (r->>'boost')::boolean and (r->>'won')::int = 2 * (r->>'base')::int and (r->>'won')::int in (0, 100)
  from (select public.flip_coin(gen_random_uuid()) r) t), 'b : pile ou face doublé (0 ou 100 PK)');
commit;
select pg_temp.check((select (r->>'boost')::boolean and (r->>'won')::int = 2 * (r->>'raw')::int and (r->>'raw')::int > 0
  from (select pg_temp.safari('00000000-0000-0000-0000-00000002a001', 1, 'good') r) t), 'b : Safari facile, bons Pokémon : gain doublé');
select pg_temp.check((select (r->>'boost')::boolean and (r->>'won')::int = 2 * (r->>'raw')::int
  from (select pg_temp.safari('00000000-0000-0000-0000-00000002a001', 3, 'good') r) t), 'b : Safari difficile, bons Pokémon : gain doublé');
update public.wallets set pk = 1000 where user_id = '00000000-0000-0000-0000-00000002a001';
select pg_temp.check((select not (r->>'boost')::boolean and (r->>'won')::int = (r->>'raw')::int and (r->>'won')::int < 0
  from (select pg_temp.safari('00000000-0000-0000-0000-00000002a001', 2, 'bad') r) t), 'b : Safari normal, erreurs seulement : perte jamais doublée');
select pg_temp.check((select count(*) from public.ledger where user_id = '00000000-0000-0000-0000-00000002a001' and kind in ('booster', 'coin', 'safari') and pk > 0 and ref like '%2XP PK%') >= 3
  and (select count(*) from public.ledger where user_id = '00000000-0000-0000-0000-00000002a001' and kind in ('booster', 'coin', 'safari') and pk > 0 and coalesce(ref, '') not like '%2XP PK%') = 0, 'b : journal « 2XP PK » sur chaque gain doublé');
select pg_temp.check((select pk_earned from public.wallets where user_id = '00000000-0000-0000-0000-00000002a001')
  = 7500 + (select sum(pk) from public.ledger where user_id = '00000000-0000-0000-0000-00000002a001' and pk > 0 and kind in ('booster', 'coin', 'safari')), 'b : PK doublés comptés dans les PK gagnés (grades, saison)');

-- 2. Admin déverrouillé (PK illimités) avec un 2XP PK : doublé aussi.
begin;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000002a002', true);
set local role authenticated;
select pg_temp.check((public.game_state()->>'unlimited')::boolean, 'a : admin déverrouillé');
select pg_temp.check((select (r->>'won')::int = 2 * (r->>'base')::int and (r->>'boost')::boolean from (select public.open_booster(gen_random_uuid()) r) t), 'a : Booster PK doublé pour un admin déverrouillé');
select pg_temp.check((select (r->>'won')::int = 2 * (r->>'base')::int and (r->>'boost')::boolean from (select public.open_booster(gen_random_uuid()) r) t), 'a : 2e booster aussitôt (sans délai), doublé');
commit;

-- 3. Sans 2XP, et 2XP terminé : gains normaux.
begin;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000002a003', true);
set local role authenticated;
select pg_temp.check(not (public.pk_boost_state()->>'on')::boolean, 'n : pas de 2XP');
select pg_temp.check((select (r->>'won')::int = (r->>'base')::int and not (r->>'boost')::boolean from (select public.open_booster(gen_random_uuid()) r) t), 'n : Booster PK normal');
select pg_temp.check((select (r->>'won')::int in (0, 50) and not (r->>'boost')::boolean from (select public.flip_coin(gen_random_uuid()) r) t), 'n : pile ou face normal (0 ou 50 PK)');
commit;
select pg_temp.check((select not (r->>'boost')::boolean and (r->>'won')::int = (r->>'raw')::int from (select pg_temp.safari('00000000-0000-0000-0000-00000002a003', 1, 'good') r) t), 'n : Safari normal');
begin;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000002a004', true);
set local role authenticated;
select pg_temp.check(not (public.pk_boost_state()->>'on')::boolean and public.pk_boost_state()->>'until' is null, 'e : 2XP terminé, plus annoncé');
select pg_temp.check((select (r->>'won')::int = (r->>'base')::int and not (r->>'boost')::boolean from (select public.open_booster(gen_random_uuid()) r) t), 'e : Booster PK normal après la fin');
commit;

-- 4. PA du jour : DropiPass, 2XP PA, les deux (×2 au plus), aucun. Premier jour : 20 PA de base.
insert into public.premium (user_id, status, period_end) values
  ('00000000-0000-0000-0000-00000002a005', 'active', now() + interval '1 month'), ('00000000-0000-0000-0000-00000002a007', 'active', now() + interval '1 month')
on conflict (user_id) do update set status = 'active', period_end = excluded.period_end;
insert into public.pa_boosts (user_id, until) values
  ('00000000-0000-0000-0000-00000002a006', now() + interval '7 days'), ('00000000-0000-0000-0000-00000002a007', now() + interval '7 days')
on conflict (user_id) do update set until = excluded.until;
update public.wallets set pa = 0, pa_day = null, pa_streak = 0, pa_run = 0 where user_id in ('00000000-0000-0000-0000-00000002a005', '00000000-0000-0000-0000-00000002a006', '00000000-0000-0000-0000-00000002a007', '00000000-0000-0000-0000-00000002a008');
create or replace function pg_temp.pa(uid uuid) returns text language plpgsql as $$
declare g jsonb; r jsonb;
begin
  perform set_config('request.jwt.claim.sub', uid::text, true);
  execute 'set local role authenticated';
  g := public.game_state();
  r := public.claim_daily_pa(gen_random_uuid());
  execute 'reset role';
  return (g->>'pa_gain') || '/' || (r->>'gain') || '/' || (r->>'pa');
end; $$;
select pg_temp.check(pg_temp.pa('00000000-0000-0000-0000-00000002a005') = '40/40/40', 'DropiPass : PA du jour doublés (annonce 40, reçu 40)');
select pg_temp.check(pg_temp.pa('00000000-0000-0000-0000-00000002a006') = '40/40/40', '2XP PA : PA du jour doublés');
select pg_temp.check(pg_temp.pa('00000000-0000-0000-0000-00000002a007') = '40/40/40', 'DropiPass et 2XP PA : ×2 au plus');
select pg_temp.check(pg_temp.pa('00000000-0000-0000-0000-00000002a008') = '20/20/20', 'sans rien : PA du jour normaux');
select pg_temp.check((select ref from public.ledger where user_id = '00000000-0000-0000-0000-00000002a005' and kind = 'pa_day') like '%×2%'
  and (select ref from public.ledger where user_id = '00000000-0000-0000-0000-00000002a006' and kind = 'pa_day') like '%2XP PA%', 'journal : « Premium ×2 » et « 2XP PA »');

-- Remise en état.
update public.game_grades g set comp = s.comp, mega = s.mega from gg_save2x s where g.i = s.i;
