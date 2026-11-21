-- Tests de 037_parrainage.sql (après test_036, sur la base de tous les scripts 001 à 036).
-- Chaque ligne « OK » est une vérification réussie ; le script s'arrête à la première erreur.
\set ON_ERROR_STOP 1
reset role;
create or replace function pg_temp.check(ok boolean, label text) returns text language plpgsql as $$
begin if not ok then raise exception 'ÉCHEC : %', label; end if; return 'OK ' || label; end; $$;
create or replace function pg_temp.fails(q text, msg text) returns boolean language plpgsql as $$
begin execute q; return false; exception when others then return position(msg in sqlerrm) > 0; end; $$;
create or replace function pg_temp.as_user(u text) returns void language sql as $$ select set_config('request.jwt.claim.sub', u, false) $$;
grant execute on function pg_temp.check(boolean, text), pg_temp.fails(text, text) to authenticated, anon;
update public.game_throttle set n = 0;

-- Avant tout : les anciens gains (028) sont déjà « vus » à l'installation.
select pg_temp.check((select count(*) > 0 from public.pl_seen where user_id = '00000000-0000-0000-0000-0000000f2801'), 'installation : anciens gains marqués vus');
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2801');
set role authenticated;
select pg_temp.check((select count(*) = 0 from jsonb_array_elements(public.pl_state()->'new') g where g->>'kind' = 'referral'), 'ancien parrain : ses anciens 200 PL ne reviennent pas');
reset role;

-- Comptes : P (parrain), S (parrain suspendu), O (compte ancien).
insert into auth.users (id, email, email_confirmed_at, created_at) values
  ('00000000-0000-0000-0000-0000000f3701', 'parrain37@gmail.com', now() - interval '30 days', now() - interval '30 days'),
  ('00000000-0000-0000-0000-0000000f3702', 'suspendu37@gmail.com', now() - interval '30 days', now() - interval '30 days'),
  ('00000000-0000-0000-0000-0000000f3703', 'ancien37@gmail.com', now() - interval '20 days', now() - interval '20 days')
on conflict do nothing;
update public.profiles set pseudo = 'Parrain37' where id = '00000000-0000-0000-0000-0000000f3701';
update public.profiles set pseudo = 'Suspendu37' where id = '00000000-0000-0000-0000-0000000f3702';
update public.profiles set pseudo = 'Ancien37' where id = '00000000-0000-0000-0000-0000000f3703';
select pg_temp.as_user('00000000-0000-0000-0000-0000000f3701');
set role authenticated;
create temp table p37 as select public.pl_state() as j;
reset role;
grant select on p37 to anon;
select pg_temp.check((select (j->>'v')::int = 37 and jsonb_typeof(j->'filleuls') = 'array' and jsonb_array_length(j->'filleuls') = 0 and j->'me_ref' = 'null'::jsonb from p37), 'parrain : état v37, aucun filleul, pas de parrain');
insert into public.pl_codes (user_id, code) values ('00000000-0000-0000-0000-0000000f3702', 'SUSP37') on conflict do nothing;
update public.profiles set status = 'suspended' where id = '00000000-0000-0000-0000-0000000f3702';

-- A. Invitation lue sans compte : pseudo seulement.
select pg_temp.as_user('');
set role anon;
select pg_temp.check((select public.pl_invite(lower((select j->>'code' from p37))) = '{"pseudo": "Parrain37"}'::jsonb), 'visiteur : invitation avec le pseudo du parrain (minuscules acceptées)');
select pg_temp.check(public.pl_invite('ZZZZ99') is null, 'visiteur : code inconnu → rien');
select pg_temp.check(public.pl_invite('SUSP37') is null, 'visiteur : parrain suspendu → rien');
select pg_temp.check(pg_temp.fails('select * from public.pl_seen', 'permission denied'), 'visiteur : gains vus illisibles');
select pg_temp.check(pg_temp.fails('select public.pl_state()', 'permission denied'), 'visiteur : état des PL refusé');
reset role;
select pg_temp.as_user('00000000-0000-0000-0000-0000000f3703');
set role authenticated;
select pg_temp.check(pg_temp.fails('select * from public.pl_seen', 'permission denied'), 'joueur : gains vus illisibles en direct');
select pg_temp.check(pg_temp.fails('select public._pl_ref_progress(auth.uid())', 'permission denied'), 'joueur : avancement interne refusé');
reset role;

-- B. Inscription avec le code du lien (comme l'app : data.parrain) : filleul relié, 50 PL tout de suite.
insert into auth.users (id, email, raw_user_meta_data, created_at) values
  ('00000000-0000-0000-0000-0000000f3711', 'filleul37a@gmail.com', jsonb_build_object('pseudo', 'Filleul37', 'parrain', ' ' || lower((select j->>'code' from p37)) || ' '), now()),
  ('00000000-0000-0000-0000-0000000f3712', 'filleul37b@gmail.com', '{"pseudo": "Inconnu37", "parrain": "ZZZZ99"}', now()),
  ('00000000-0000-0000-0000-0000000f3713', 'filleul37c@gmail.com', '{"pseudo": "Susp37f", "parrain": "SUSP37"}', now()),
  ('00000000-0000-0000-0000-0000000f3714', 'filleul37d@gmail.com', '{"pseudo": "Bizarre37", "parrain": "x; drop table x"}', now()),
  ('00000000-0000-0000-0000-0000000f3715', 'filleul37e@gmail.com', '{"pseudo": "Sans37"}', now());
select pg_temp.check((select count(*) = 5 from public.profiles where id::text like '00000000-0000-0000-0000-0000000f371%'), 'les 5 inscriptions passent, code valable ou non');
select pg_temp.check((select parrain = '00000000-0000-0000-0000-0000000f3701' from public.pl_referrals where filleul = '00000000-0000-0000-0000-0000000f3711'), 'inscription avec le code : filleul relié au parrain');
select pg_temp.check((select count(*) = 1 and sum(pl) = 50 from public.pl_ledger where user_id = '00000000-0000-0000-0000-0000000f3711' and kind = 'welcome_ref'), 'inscription avec le code : 50 PL de bienvenue');
select pg_temp.check((select count(*) = 0 from public.pl_referrals where filleul in ('00000000-0000-0000-0000-0000000f3712', '00000000-0000-0000-0000-0000000f3713', '00000000-0000-0000-0000-0000000f3714', '00000000-0000-0000-0000-0000000f3715')),
  'code inconnu, parrain suspendu, code invalide ou absent : pas de parrainage');
select pg_temp.check((select count(*) = 0 from public.pl_ledger where user_id in ('00000000-0000-0000-0000-0000000f3712', '00000000-0000-0000-0000-0000000f3713', '00000000-0000-0000-0000-0000000f3714')), 'pas de PL sans parrainage');

-- C. Lien rouvert : le même code = déjà fait, sans erreur ni PL en double ; un autre code = refusé.
select pg_temp.as_user('00000000-0000-0000-0000-0000000f3711');
set role authenticated;
select pg_temp.check((select (r->>'ok')::boolean and (r->>'already')::boolean and (r->>'pl')::int = 0 and r->>'parrain' = 'Parrain37' from (select public.pl_set_parrain((select j->>'code' from p37)) as r) x),
  'même code une 2e fois : déjà fait');
select pg_temp.check(pg_temp.fails($$select public.pl_set_parrain('SUSP37')$$, 'déjà un parrain'), 'autre code : un seul parrain');
reset role;
select pg_temp.check((select count(*) = 1 from public.pl_ledger where user_id = '00000000-0000-0000-0000-0000000f3711' and kind = 'welcome_ref'), 'toujours une seule bienvenue');
-- Code saisi plus tard (14 premiers jours) : toujours possible, 50 PL ; compte ancien : refusé ; son propre code : refusé.
select pg_temp.as_user('00000000-0000-0000-0000-0000000f3712');
set role authenticated;
select pg_temp.check((select (r->>'pl')::int = 50 and not coalesce((r->>'already')::boolean, false) from (select public.pl_set_parrain((select j->>'code' from p37)) as r) x), 'code saisi après l''inscription : 50 PL');
reset role;
select pg_temp.as_user('00000000-0000-0000-0000-0000000f3703');
set role authenticated;
select pg_temp.check(pg_temp.fails($$select public.pl_set_parrain('$$ || (select j->>'code' from p37) || $$')$$, '14 jours'), 'compte de 20 jours : refusé');
reset role;
select pg_temp.as_user('00000000-0000-0000-0000-0000000f3701');
set role authenticated;
select pg_temp.check(pg_temp.fails($$select public.pl_set_parrain('$$ || (select j->>'code' from p37) || $$')$$, '14 jours'), 'parrain de 30 jours : son lien ne le parraine pas');
reset role;

-- D. Le filleul voit sa bienvenue une fois, et où il en est des conditions.
select pg_temp.as_user('00000000-0000-0000-0000-0000000f3711');
set role authenticated;
create temp table f37 as select public.pl_state() as j;
select pg_temp.check((select jsonb_array_length(j->'new') = 1 and j->'new'->0->>'kind' = 'welcome_ref' and (j->'new'->0->>'pl')::int = 50 from f37), 'filleul : bienvenue dans « new »');
select pg_temp.check((select j->'me_ref'->>'parrain' = 'Parrain37' and not (j->'me_ref'->>'verified')::boolean and (j->'me_ref'->>'days')::int = 1
  and (j->'me_ref'->>'need')::int = 3 and (j->'me_ref'->>'open')::boolean and not (j->'me_ref'->>'done')::boolean and not (j->'me_ref'->>'missed')::boolean from f37),
  'filleul : avancement (adresse à valider, 1 jour sur 3 : aujourd''hui)');
select pg_temp.check((select jsonb_array_length(public.pl_state()->'new') = 0), 'filleul : bienvenue montrée une seule fois');
reset role;

-- E. Le parrain voit ses filleuls (sans e-mail) et leurs étapes.
select pg_temp.as_user('00000000-0000-0000-0000-0000000f3701');
set role authenticated;
create temp table p37b as select public.pl_state() as j;
reset role;
select pg_temp.check((select jsonb_array_length(j->'filleuls') = 2 and (j->'referrals'->>'all')::int = 2 and (j->'referrals'->>'pending')::int = 2 from p37b), 'parrain : 2 filleuls en attente');
select pg_temp.check((select bool_and(f->>'state' = 'wait' and not (f->>'verified')::boolean and not (f ? 'email') and (f->>'days')::int = 1) from p37b, jsonb_array_elements(j->'filleuls') f),
  'parrain : étapes de chaque filleul (jour de l''inscription compté), jamais d''e-mail');
select pg_temp.check((select position('gmail' in (j->'filleuls')::text) = 0 from p37b), 'parrain : aucune adresse dans la liste');

-- F. 200 PL au parrain déclenchés par le filleul (il ouvre l'app) : le parrain les voit à sa prochaine ouverture.
update auth.users set created_at = now() - interval '3 days', email_confirmed_at = now() where id = '00000000-0000-0000-0000-0000000f3711';
insert into public.app_time (user_id, day, seconds, sessions, last_at) values
  ('00000000-0000-0000-0000-0000000f3711', public._pl_day(now() - interval '3 days'), 60, 1, now() - interval '3 days'),
  ('00000000-0000-0000-0000-0000000f3711', public._pl_day(now() - interval '2 days'), 60, 1, now() - interval '2 days')
on conflict do nothing;
select pg_temp.as_user('00000000-0000-0000-0000-0000000f3711');
set role authenticated;
select pg_temp.check((select (j->'me_ref'->>'done')::boolean and (j->'me_ref'->>'verified')::boolean and (j->'me_ref'->>'days')::int = 3 and jsonb_array_length(j->'new') = 0 from (select public.pl_state() as j) x),
  'filleul : adresse validée, 3 jours : conditions remplies (les PL vont au parrain)');
reset role;
select pg_temp.check((select sum(pl) = 200 from public.pl_ledger where user_id = '00000000-0000-0000-0000-0000000f3701' and kind = 'referral'), 'parrain : 200 PL au journal');
select pg_temp.as_user('00000000-0000-0000-0000-0000000f3701');
set role authenticated;
create temp table p37c as select public.pl_state() as j;
select pg_temp.check((select jsonb_array_length(public.pl_state()->'new') = 0), 'parrain : 200 PL montrés une seule fois');
reset role;
select pg_temp.check((select jsonb_array_length(j->'new') = 1 and j->'new'->0->>'kind' = 'referral' and (j->'new'->0->>'pl')::int = 200 and j->'new'->0->>'note' = 'Filleul : Filleul37' from p37c),
  'parrain : ses 200 PL arrivés en son absence sont dans « new » (animation)');
select pg_temp.check((select f->>'state' = 'ok' and (f->>'verified')::boolean and (f->>'days')::int = 3 from p37c, jsonb_array_elements(j->'filleuls') f where f->>'pseudo' = 'Filleul37'), 'parrain : Filleul37 compté');
select pg_temp.check((select (j->'referrals'->>'season')::int = 1 and (j->'referrals'->>'pending')::int = 1 from p37c), 'parrain : 1 filleul compté, 1 en attente');

-- G. Délai passé : un filleul de 20 jours avec 1 seul jour d'ouverture ne compte plus (« missed »).
insert into auth.users (id, email, raw_user_meta_data, created_at, email_confirmed_at) values
  ('00000000-0000-0000-0000-0000000f3716', 'filleul37f@gmail.com', jsonb_build_object('pseudo', 'Tard37', 'parrain', (select j->>'code' from p37)), now() - interval '20 days', now());
select pg_temp.as_user('00000000-0000-0000-0000-0000000f3716');
set role authenticated;
select pg_temp.check((select (j->'me_ref'->>'missed')::boolean and not (j->'me_ref'->>'open')::boolean from (select public.pl_state() as j) x), 'filleul hors délai : conditions manquées');
reset role;
select pg_temp.as_user('00000000-0000-0000-0000-0000000f3701');
set role authenticated;
select pg_temp.check((select f->>'state' = 'missed' from jsonb_array_elements(public.pl_state()->'filleuls') f where f->>'pseudo' = 'Tard37'), 'parrain : Tard37 hors délai');
reset role;

-- H. Le filleul supprime son compte : parrainage, gains et « vus » effacés avec lui.
select pg_temp.as_user('00000000-0000-0000-0000-0000000f3712');
set role authenticated;
select pg_temp.check((public.delete_my_account()->>'ok')::boolean, 'filleul supprime son compte');
reset role;
select pg_temp.check((select count(*) = 0 from public.pl_referrals where filleul = '00000000-0000-0000-0000-0000000f3712')
  and (select count(*) = 0 from public.pl_seen where user_id = '00000000-0000-0000-0000-0000000f3712'), 'parrainage et gains vus effacés avec lui');
select pg_temp.as_user('');
