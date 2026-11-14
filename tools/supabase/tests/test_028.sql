-- Tests de 028_points_loyaute.sql (après test_027).
-- Chaque ligne « OK » est une vérification réussie ; le script s'arrête à la première erreur.
\set ON_ERROR_STOP 1
reset role;
create or replace function pg_temp.check(ok boolean, label text) returns text language plpgsql as $$
begin if not ok then raise exception 'ÉCHEC : %', label; end if; return 'OK ' || label; end; $$;
create or replace function pg_temp.fails(q text, msg text) returns boolean language plpgsql as $$
begin execute q; return false; exception when others then return position(msg in sqlerrm) > 0; end; $$;
create or replace function pg_temp.as_user(u text) returns void language sql as $$ select set_config('request.jwt.claim.sub', u, false) $$;
grant execute on function pg_temp.check(boolean, text), pg_temp.fails(text, text) to authenticated, anon;
-- Saison 1 commencée il y a 40 jours (séries de 30 jours possibles), finit dans 20 jours.
update public.game_season set start_at = now() - interval '40 days', days = 60;
update public.game_throttle set n = 0;
-- Comptes : P (parrain), F1 et F2 (filleuls), X (compte ancien), S (séries), T1 et T2 (égalité), A (admin), E (accents).
insert into auth.users (id, email, email_confirmed_at, created_at) values
  ('00000000-0000-0000-0000-0000000f2801', 'parrain28@gmail.com', now() - interval '30 days', now() - interval '30 days'),
  ('00000000-0000-0000-0000-0000000f2802', 'filleul28a@gmail.com', now() - interval '3 days', now() - interval '3 days'),
  ('00000000-0000-0000-0000-0000000f2803', 'filleul28b@gmail.com', null, now() - interval '4 days'),
  ('00000000-0000-0000-0000-0000000f2804', 'ancien28@gmail.com', now() - interval '20 days', now() - interval '20 days'),
  ('00000000-0000-0000-0000-0000000f2805', 'serie28@gmail.com', now() - interval '35 days', now() - interval '35 days'),
  ('00000000-0000-0000-0000-0000000f2806', 'egal28a@gmail.com', now(), now() - interval '30 days'),
  ('00000000-0000-0000-0000-0000000f2807', 'egal28b@gmail.com', now(), now() - interval '30 days'),
  ('00000000-0000-0000-0000-0000000f2808', 'admin28@gmail.com', now(), now() - interval '30 days'),
  ('00000000-0000-0000-0000-0000000f2809', 'accent28@gmail.com', now(), now() - interval '2 days'),
  ('00000000-0000-0000-0000-0000000f2810', 'parrain28b@gmail.com', now(), now() - interval '30 days')
on conflict do nothing;
update public.profiles set pseudo = 'Sacha28' where id = '00000000-0000-0000-0000-0000000f2801';
update public.profiles set pseudo = 'Ondine28' where id = '00000000-0000-0000-0000-0000000f2802';
update public.profiles set pseudo = 'Pierre28' where id = '00000000-0000-0000-0000-0000000f2803';
update public.profiles set pseudo = 'Ancien28' where id = '00000000-0000-0000-0000-0000000f2804';
update public.profiles set pseudo = 'Serie28' where id = '00000000-0000-0000-0000-0000000f2805';
update public.profiles set pseudo = 'Egal28a' where id = '00000000-0000-0000-0000-0000000f2806';
update public.profiles set pseudo = 'Egal28b' where id = '00000000-0000-0000-0000-0000000f2807';
update public.profiles set pseudo = 'Admin28', role = 'admin' where id = '00000000-0000-0000-0000-0000000f2808';
update public.profiles set pseudo = 'Éléa' where id = '00000000-0000-0000-0000-0000000f2809';
update public.profiles set pseudo = 'Prof28' where id = '00000000-0000-0000-0000-0000000f2810';
delete from public.admin_unlocks where user_id = '00000000-0000-0000-0000-0000000f2808';

-- A. Rien en direct : ni lecture, ni écriture, ni fonctions internes ; rien sans compte.
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2801');
set role authenticated;
select pg_temp.check(pg_temp.fails('select * from public.pl_ledger', 'permission denied'), 'joueur : journal des PL illisible en direct');
select pg_temp.check(pg_temp.fails($$insert into public.pl_ledger (user_id, season, kind, pl) values (auth.uid(), 1, 'admin', 99999)$$, 'permission denied'), 'joueur : pas de PL écrits soi-même');
select pg_temp.check(pg_temp.fails($$select public._pl_give(auth.uid(), 'admin', '', 99999, 1, 'triche')$$, 'permission denied'), 'joueur : fonction interne de gain refusée');
select pg_temp.check(pg_temp.fails($$select public.pl_admin_adjust(auth.uid(), 99999, 'triche')$$, 'permission denied'), 'joueur : correction admin refusée');
select pg_temp.check(pg_temp.fails('select * from public.season_winners(1)', 'permission denied'), 'joueur : liste des gagnants (e-mails) refusée');
select pg_temp.check(pg_temp.fails('select * from public.pl_codes', 'permission denied'), 'joueur : codes des autres illisibles');
select pg_temp.check(pg_temp.fails('select * from public.pl_proofs', 'permission denied'), 'joueur : captures des autres illisibles');
reset role;
select pg_temp.as_user('');
set role anon;
select pg_temp.check(pg_temp.fails('select public.pl_state()', 'permission denied'), 'sans compte : état des PL refusé');
reset role;

-- B. Code de parrainage : créé à la première demande, toujours le même ensuite ; début du pseudo sans accents.
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2801');
set role authenticated;
create temp table st as select public.pl_state() as j;
reset role;
select pg_temp.check((select j->>'code' ~ '^SACHA2[A-Z0-9]{2}$' from st), 'code du parrain : SACHA2 + 2 caractères');
select pg_temp.check((select (j->>'pl_season')::int = 0 and (j->>'pl_total')::int = 0 and jsonb_array_length(j->'new') = 0 from st), 'départ : 0 PL');
select pg_temp.check((select (j->>'can_set_parrain')::boolean = false from st), 'compte de 30 jours : plus de parrain possible');
set role authenticated;
select pg_temp.check((select public.pl_state()->>'code' = (select j->>'code' from st)), 'même code à chaque demande');
reset role;
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2809');
set role authenticated;
select pg_temp.check(public.pl_state()->>'code' ~ '^ELEA[A-Z0-9]{2}$', 'pseudo accentué Éléa : code ELEA + 2 caractères');
reset role;

-- C. Saisie du code par un filleul.
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2802');
set role authenticated;
select pg_temp.check((public.pl_state()->>'can_set_parrain')::boolean, 'compte de 3 jours : parrain possible');
select pg_temp.check(pg_temp.fails($$select public.pl_set_parrain('ZZZZZZ')$$, 'Code de parrainage inconnu'), 'code inconnu refusé');
select pg_temp.check((select (r->>'pl')::int = 50 and r->>'parrain' = 'Sacha28' from (select public.pl_set_parrain('  ' || lower((select j->>'code' from st)) || ' ') as r) x),
  'code saisi en minuscules avec espaces : accepté, 50 PL de bienvenue');
select pg_temp.check(pg_temp.fails($$select public.pl_set_parrain('$$ || (select j->>'code' from st) || $$')$$, 'déjà un parrain'), 'un seul parrain');
select pg_temp.check((select (j->>'pl_season')::int = 50 and j->>'parrain' = 'Sacha28' and not (j->>'can_set_parrain')::boolean from (select public.pl_state() as j) x), 'filleul : 50 PL, parrain affiché');
reset role;
-- Soi-même, compte ancien, boucle A ↔ B : refusés.
update public.pl_codes set code = 'ONDINE28' where user_id = '00000000-0000-0000-0000-0000000f2802';
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2802');
set role authenticated;
select pg_temp.check(pg_temp.fails($$select public.pl_set_parrain('ONDINE28')$$, 'déjà un parrain'), 'filleul déjà parrainé : son propre code refusé');
reset role;
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2809');
set role authenticated;
select pg_temp.check(pg_temp.fails($$select public.pl_set_parrain(public.pl_state()->>'code')$$, 'propre parrain'), 'son propre code refusé');
reset role;
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2804');
set role authenticated;
select pg_temp.check(pg_temp.fails($$select public.pl_set_parrain('ONDINE28')$$, '14 jours'), 'compte de 20 jours : parrainage refusé');
reset role;
-- Boucle : P a 30 jours, on le rajeunit pour essayer le code de son filleul.
update auth.users set created_at = now() - interval '1 day' where id = '00000000-0000-0000-0000-0000000f2801';
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2801');
set role authenticated;
select pg_temp.check(pg_temp.fails($$select public.pl_set_parrain('ONDINE28')$$, 'déjà ton filleul'), 'boucle A ↔ B refusée');
reset role;
update auth.users set created_at = now() - interval '30 days' where id = '00000000-0000-0000-0000-0000000f2801';
-- F2 (adresse pas vérifiée) prend aussi P comme parrain.
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2803');
set role authenticated;
select public.pl_set_parrain((select j->>'code' from st));
reset role;

-- D. 200 PL au parrain : adresse vérifiée et 3 jours différents dans les 14 premiers jours.
insert into public.app_time (user_id, day, seconds, sessions, last_at) values
  ('00000000-0000-0000-0000-0000000f2802', public._pl_day(now() - interval '3 days'), 60, 1, now() - interval '3 days'),
  ('00000000-0000-0000-0000-0000000f2803', public._pl_day(now() - interval '4 days'), 60, 1, now() - interval '4 days'),
  ('00000000-0000-0000-0000-0000000f2803', public._pl_day(now() - interval '3 days'), 60, 1, now() - interval '3 days'),
  ('00000000-0000-0000-0000-0000000f2803', public._pl_day(now() - interval '2 days'), 60, 1, now() - interval '2 days')
on conflict do nothing;
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2801');
set role authenticated;
select pg_temp.check((select (j->>'pl_season')::int = 0 and (j->'referrals'->>'pending')::int = 2 from (select public.pl_state() as j) x),
  'F1 2 jours seulement (dont celui de l''inscription), F2 adresse pas vérifiée : rien encore, 2 filleuls en attente');
reset role;
-- F1 avait aussi ouvert l'app avant-hier (3e jour) : en ouvrant l'app, c'est lui qui déclenche les 200 PL du parrain
-- (pas dans SA liste).
insert into public.app_time (user_id, day, seconds, sessions, last_at) values
  ('00000000-0000-0000-0000-0000000f2802', public._pl_day(now() - interval '2 days'), 60, 1, now() - interval '2 days') on conflict do nothing;
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2802');
set role authenticated;
select pg_temp.check((select jsonb_array_length(public.pl_state()->'new') = 0), 'filleul : les PL du parrain ne s''affichent pas chez lui');
reset role;
select pg_temp.check((select sum(pl) = 200 from public.pl_ledger where user_id = '00000000-0000-0000-0000-0000000f2801' and kind = 'referral'), 'parrain : 200 PL pour F1');
-- F2 vérifie son adresse : le parrain, en ouvrant l'app, reçoit ses 200 PL (dans sa liste « new »).
update auth.users set email_confirmed_at = now() where id = '00000000-0000-0000-0000-0000000f2803';
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2801');
set role authenticated;
create temp table st2 as select public.pl_state() as j;
reset role;
select pg_temp.check((select (j->>'pl_season')::int = 400 and jsonb_array_length(j->'new') = 1 and (j->'new'->0->>'pl')::int = 200 and (j->'referrals'->>'season')::int = 2 from st2),
  'F2 vérifié : +200 PL, 400 PL au total, 2 filleuls comptés');
set role authenticated;
select pg_temp.check((select (j->>'pl_season')::int = 400 and jsonb_array_length(j->'new') = 0 from (select public.pl_state() as j) x), 'jamais deux fois pour le même filleul');
reset role;
-- Jours hors des 14 premiers jours : ne comptent pas.
insert into auth.users (id, email, email_confirmed_at, created_at) values
  ('00000000-0000-0000-0000-0000000f2811', 'tardif28@gmail.com', now() - interval '30 days', now() - interval '30 days') on conflict do nothing;
update public.profiles set pseudo = 'Tardif28' where id = '00000000-0000-0000-0000-0000000f2811';
insert into public.pl_referrals (filleul, parrain, season, created_at) values ('00000000-0000-0000-0000-0000000f2811', '00000000-0000-0000-0000-0000000f2801', 1, now() - interval '30 days');
insert into public.app_time (user_id, day, seconds, sessions, last_at)
  select '00000000-0000-0000-0000-0000000f2811', public._pl_day(now() - make_interval(days => d)), 60, 1, now() - make_interval(days => d) from generate_series(5, 10) d
on conflict do nothing;
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2811');
set role authenticated;
select public.pl_state();
reset role;
select pg_temp.check((select qualified_at is null from public.pl_referrals where filleul = '00000000-0000-0000-0000-0000000f2811'), 'jours après les 14 premiers : filleul pas compté');

-- Alias Gmail du parrain (points, « +étiquette ») ou d'un autre compte plus ancien : validé mais pas compté, sans PL.
insert into auth.users (id, email, email_confirmed_at, created_at) values
  ('00000000-0000-0000-0000-0000000f2812', 'Par.rain28+bis@googlemail.com', now() - interval '4 days', now() - interval '4 days'),
  ('00000000-0000-0000-0000-0000000f2813', 'filleul28a+2@gmail.com', now() - interval '2 days', now() - interval '2 days') on conflict do nothing;
update public.profiles set pseudo = 'Alias28' where id = '00000000-0000-0000-0000-0000000f2812';
update public.profiles set pseudo = 'Alias28b' where id = '00000000-0000-0000-0000-0000000f2813';
insert into public.pl_referrals (filleul, parrain, season, created_at) values
  ('00000000-0000-0000-0000-0000000f2812', '00000000-0000-0000-0000-0000000f2801', 1, now() - interval '4 days'),
  ('00000000-0000-0000-0000-0000000f2813', '00000000-0000-0000-0000-0000000f2801', 1, now() - interval '2 days');
insert into public.app_time (user_id, day, seconds, sessions, last_at)
  select u, public._pl_day(now() - make_interval(days => d)), 60, 1, now() - make_interval(days => d)
  from unnest(array['00000000-0000-0000-0000-0000000f2812', '00000000-0000-0000-0000-0000000f2813']::uuid[]) u, generate_series(0, 2) d on conflict do nothing;
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2801');
set role authenticated;
select pg_temp.check((select (j->>'pl_season')::int = 400 and jsonb_array_length(j->'new') = 0 from (select public.pl_state() as j) x), 'alias Gmail du parrain ou d''un compte plus ancien : pas de PL');
reset role;
select pg_temp.check((select count(*) = 2 from public.pl_referrals where filleul in ('00000000-0000-0000-0000-0000000f2812', '00000000-0000-0000-0000-0000000f2813') and qualified_at is not null and not counted), 'alias : validés mais pas comptés');
select pg_temp.check(public._pl_mailkey(' N.om+test@GMail.com ') = 'nom@gmail.com' and public._pl_mailkey('a.b+c@free.fr') = 'a.b@free.fr', 'adresse ramenée à sa boîte réelle (Gmail sans points ; autres : sans « +étiquette »)');

-- E. 20 filleuls comptés par saison au plus (parrain P2).
insert into auth.users (id, email, email_confirmed_at, created_at)
  select ('00000000-0000-0000-0000-0000002800' || lpad(i::text, 2, '0'))::uuid, 'fil28_' || i || '@gmail.com', now() - interval '5 days', now() - interval '5 days'
  from generate_series(1, 21) i on conflict do nothing;
update public.profiles set pseudo = 'Fil28_' || right(id::text, 2) where id::text like '00000000-0000-0000-0000-0000002800%';
insert into public.pl_referrals (filleul, parrain, season, created_at)
  select ('00000000-0000-0000-0000-0000002800' || lpad(i::text, 2, '0'))::uuid, '00000000-0000-0000-0000-0000000f2810', 1, now() - interval '5 days'
  from generate_series(1, 21) i on conflict do nothing;
insert into public.app_time (user_id, day, seconds, sessions, last_at)
  select ('00000000-0000-0000-0000-0000002800' || lpad(i::text, 2, '0'))::uuid, public._pl_day(now() - make_interval(days => d)), 60, 1, now() - make_interval(days => d)
  from generate_series(1, 21) i, generate_series(2, 4) d on conflict do nothing;
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2810');
set role authenticated;
select pg_temp.check((select (j->>'pl_season')::int = 4000 and (j->'referrals'->>'season')::int = 20 and jsonb_array_length(j->'new') = 20 from (select public.pl_state() as j) x),
  '21 filleuls valables : 20 comptés (4 000 PL), plafond de la saison');
reset role;
select pg_temp.check((select count(*) = 21 and count(*) filter (where counted) = 20 from public.pl_referrals where parrain = '00000000-0000-0000-0000-0000000f2810' and qualified_at is not null),
  '21e filleul : validé mais pas compté');

-- F. Filleul Premium : 400 PL après 14 jours d'abonnement payé (paiement réel).
insert into public.premium_payments (invoice, user_id, amount_cents, currency, plan, paid_at, livemode) values
  ('in_pl28_f1', '00000000-0000-0000-0000-0000000f2802', 990, 'eur', 'month', now() - interval '15 days', true),
  ('in_pl28_f2', '00000000-0000-0000-0000-0000000f2803', 990, 'eur', 'month', now() - interval '20 days', false),
  ('in_pl28_f2b', '00000000-0000-0000-0000-0000000f2803', 990, 'eur', 'month', now() - interval '5 days', true) on conflict do nothing;
insert into public.premium (user_id, plan, status, period_end) values
  ('00000000-0000-0000-0000-0000000f2802', 'month', 'active', now() + interval '15 days'),
  ('00000000-0000-0000-0000-0000000f2803', 'month', 'active', now() + interval '25 days')
on conflict (user_id) do update set status = 'active', period_end = excluded.period_end;
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2801');
set role authenticated;
select pg_temp.check((select (j->>'pl_season')::int = 800 and jsonb_array_length(j->'new') = 1 and j->'new'->0->>'kind' = 'referral_premium' and (j->'referrals'->>'premium')::int = 1 from (select public.pl_state() as j) x),
  'F1 Premium payé il y a 15 jours : +400 PL ; F2 (paiement de test, ou réel de 5 jours) : rien');
reset role;

-- G. Réseaux (sur l'honneur) : 100 PL une seule fois par réseau.
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2802');
set role authenticated;
select pg_temp.check((public.pl_claim_social('TikTok')->>'pl')::int = 100, 'TikTok : 100 PL');
select pg_temp.check(pg_temp.fails($$select public.pl_claim_social('tiktok')$$, 'Déjà fait'), 'TikTok une 2e fois : refusé');
select pg_temp.check(pg_temp.fails($$select public.pl_claim_social('facebook')$$, 'Réseau inconnu'), 'réseau inconnu refusé');
select pg_temp.check((select (j->'social'->>'tiktok')::boolean and not (j->'social'->>'instagram')::boolean and (j->>'pl_season')::int = 150 from (select public.pl_state() as j) x),
  'état : TikTok fait, Instagram à faire, 150 PL');
reset role;

-- H. Séries de jours d'affilée dans la saison : 5 (30 PL), 15 (100 PL), 30 (150 PL), une fois par saison.
insert into public.app_time (user_id, day, seconds, sessions, last_at)
  select '00000000-0000-0000-0000-0000000f2805', public._pl_day(now() - make_interval(days => d)), 60, 1, now() - make_interval(days => d) from generate_series(1, 4) d
on conflict do nothing;
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2805');
set role authenticated;
select pg_temp.check((select (j->>'pl_season')::int = 30 and (j->'streak'->>'cur')::int = 5 and j->'streak'->'done' = '[5]'::jsonb from (select public.pl_state() as j) x),
  '4 jours + aujourd''hui : série de 5, +30 PL');
reset role;
-- Un trou il y a 5 jours, puis 10 jours avant : la série en cours reste 5.
insert into public.app_time (user_id, day, seconds, sessions, last_at)
  select '00000000-0000-0000-0000-0000000f2805', public._pl_day(now() - make_interval(days => d)), 60, 1, now() - make_interval(days => d) from generate_series(6, 15) d
on conflict do nothing;
set role authenticated;
select pg_temp.check((select (j->>'pl_season')::int = 30 and (j->'streak'->>'best')::int = 10 and (j->'streak'->>'cur')::int = 5 from (select public.pl_state() as j) x), 'trou d''un jour : pas de série de 15');
reset role;
-- Le trou comblé par une partie (journal des PK) ce jour-là : série de 16 → +100 PL.
insert into public.ledger (user_id, kind, pk, pa, pk_after, pa_after, at) values
  ('00000000-0000-0000-0000-0000000f2805', 'coin', 0, 0, 0, 0, now() - interval '5 days');
set role authenticated;
select pg_temp.check((select (j->>'pl_season')::int = 130 and (j->'streak'->>'cur')::int = 16 from (select public.pl_state() as j) x), 'jour comblé par une partie : série de 16, +100 PL');
reset role;
insert into public.app_time (user_id, day, seconds, sessions, last_at)
  select '00000000-0000-0000-0000-0000000f2805', public._pl_day(now() - make_interval(days => d)), 60, 1, now() - make_interval(days => d) from generate_series(16, 45) d
on conflict do nothing;
set role authenticated;
select pg_temp.check((select (j->>'pl_season')::int = 280 and j->'streak'->'done' = '[5, 15, 30]'::jsonb and (j->'streak'->>'best')::int <= 41 from (select public.pl_state() as j) x),
  'série de 30 : +150 PL ; les jours d''avant la saison ne comptent pas');
select pg_temp.check((select (j->>'pl_season')::int = 280 from (select public.pl_state() as j) x), 'séries : jamais deux fois dans la saison');
reset role;

-- I. Partage avec capture : en attente, puis décision d'un admin déverrouillé ; capture effacée ; une fois par saison.
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2805');
set role authenticated;
select pg_temp.check(pg_temp.fails($$select public.pl_submit_proof('tiktok', 'data:text/html;base64,PHNjcmlwdD4=')$$, 'Image trop lourde'), 'capture : autre chose qu''une image refusée');
select pg_temp.check(pg_temp.fails($$select public.pl_submit_proof('tiktok', 'data:image/jpeg;base64,' || repeat('A', 700000))$$, 'Image trop lourde'), 'capture trop lourde refusée');
select pg_temp.check(public.pl_submit_proof('tiktok', 'data:image/jpeg;base64,/9j/4AAQSkZJRg==')->>'status' = 'pending', 'capture envoyée : en attente');
select pg_temp.check(pg_temp.fails($$select public.pl_submit_proof('tiktok', 'data:image/jpeg;base64,/9j/4AAQSkZJRg==')$$, 'en attente de validation'), 'une seule capture en attente');
select pg_temp.check((public.pl_state()->'share'->>'status') = 'pending', 'état : en attente de validation');
select pg_temp.check(pg_temp.fails('select * from public.admin_pl_proofs()', 'Réservé aux admins'), 'joueur : liste des captures refusée');
reset role;
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2808');
set role authenticated;
select pg_temp.check(pg_temp.fails('select * from public.admin_pl_proofs()', 'Réservé aux admins'), 'admin pas déverrouillé : refusé');
reset role;
insert into public.admin_unlocks values ('00000000-0000-0000-0000-0000000f2808', now() + interval '1 hour') on conflict (user_id) do update set until = excluded.until;
set role authenticated;
create temp table pr as select * from public.admin_pl_proofs();
select pg_temp.check((select count(*) = 1 and min(pseudo) = 'Serie28' and min(image) like 'data:image/jpeg;base64,%' from pr), 'admin : capture visible avec le pseudo');
select pg_temp.check((public.admin_pl_decide((select id from pr), false)->>'status') = 'no', 'admin : capture refusée');
select pg_temp.check(pg_temp.fails($$select public.admin_pl_decide((select id from pr), true)$$, 'déjà traitée'), 'décision une seule fois');
reset role;
select pg_temp.check((select image is null and decided_by = '00000000-0000-0000-0000-0000000f2808' from public.pl_proofs where id = (select id from pr)), 'capture effacée après la décision');
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2805');
set role authenticated;
select pg_temp.check((public.pl_state()->'share'->>'status') = 'no', 'état : refusée, nouvel envoi possible');
select public.pl_submit_proof('instagram', 'data:image/png;base64,iVBORw0KGgo=');
reset role;
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2808');
set role authenticated;
select pg_temp.check((public.admin_pl_decide((select id from public.admin_pl_proofs() limit 1), true)->>'pl')::int = 100, 'admin : capture validée, 100 PL');
reset role;
select pg_temp.check((select count(*) = 2 from public.admin_log where action = 'pl_proof' and admin_id = '00000000-0000-0000-0000-0000000f2808'), 'décisions au journal des admins');
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2805');
set role authenticated;
select pg_temp.check((select (j->>'pl_season')::int = 380 and j->'share'->>'status' = 'ok' from (select public.pl_state() as j) x), 'partage validé : 380 PL');
select pg_temp.check(pg_temp.fails($$select public.pl_submit_proof('tiktok', 'data:image/jpeg;base64,/9j/4AAQSkZJRg==')$$, 'Déjà fait cette saison'), 'partage : une fois par saison');
reset role;
-- 3 envois au plus par saison.
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2806');
set role authenticated;
select public.pl_submit_proof('x', 'data:image/jpeg;base64,/9j/4AAQSkZJRg==');
reset role;
update public.pl_proofs set status = 'no', image = null where user_id = '00000000-0000-0000-0000-0000000f2806';
set role authenticated;
select public.pl_submit_proof('x', 'data:image/jpeg;base64,/9j/4AAQSkZJRg==');
reset role;
update public.pl_proofs set status = 'no', image = null where user_id = '00000000-0000-0000-0000-0000000f2806';
set role authenticated;
select public.pl_submit_proof('x', 'data:image/jpeg;base64,/9j/4AAQSkZJRg==');
reset role;
update public.pl_proofs set status = 'no', image = null where user_id = '00000000-0000-0000-0000-0000000f2806';
set role authenticated;
select pg_temp.check(pg_temp.fails($$select public.pl_submit_proof('x', 'data:image/jpeg;base64,/9j/4AAQSkZJRg==')$$, '3 au plus'), '4e envoi de la saison refusé');
reset role;

-- J. Journal ineffaçable.
select pg_temp.check(pg_temp.fails('update public.pl_ledger set pl = 99999', 'ni modifié ni effacé'), 'journal des PL : modification refusée (même pour le compte technique)');
select pg_temp.check(pg_temp.fails('delete from public.pl_ledger', 'ni modifié ni effacé'), 'journal des PL : effacement refusé');

-- K. Classement en PL : égalité départagée par l'heure du dernier gain ; admins non classés.
delete from public.pl_proofs where user_id = '00000000-0000-0000-0000-0000000f2806';
insert into public.pl_ledger (user_id, season, kind, ref, pl, at) values
  ('00000000-0000-0000-0000-0000000f2807', 1, 'admin', '', 380, now() - interval '3 hours'),
  ('00000000-0000-0000-0000-0000000f2806', 1, 'admin', '', 380, now() - interval '2 hours'),
  ('00000000-0000-0000-0000-0000000f2808', 1, 'admin', '', 90000, now() - interval '2 hours');
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2806');
set role authenticated;
create temp table bd as select public.season_board(100) as j;
reset role;
select pg_temp.check((select j->>'unit' = 'pl' and (j->'me'->>'pl')::int = 380 from bd), 'classement en PL ; ma ligne');
select pg_temp.check((select (select (e->>'rank')::int from jsonb_array_elements(j->'top') e where e->>'pseudo' = 'Egal28b')
                          < (select (e->>'rank')::int from jsonb_array_elements(j->'top') e where e->>'pseudo' = 'Egal28a') from bd),
  'égalité à 380 PL : le premier arrivé passe devant');
select pg_temp.check((select not exists (select 1 from jsonb_array_elements(j->'top') e where e->>'pseudo' = 'Admin28') from bd), 'admin non classé');
select pg_temp.check((select (j->'top'->0->>'pseudo') = 'Prof28' and (j->'top'->0->>'pl')::int = 4000 from bd), '1er : le parrain de 20 filleuls');
select pg_temp.check((select (j->>'pl_total')::int = 380 and (j->>'ranked')::int >= 6 from bd), 'total à vie et joueurs classés');
-- Saison suivante : compteur de la saison à 0, total à vie gardé (L5).
update public.game_season set start_at = now() - interval '70 days';
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2803');
set role authenticated;
select pg_temp.check((select (j->>'pl_season')::int = 0 and (j->>'pl_total')::int = 50 and (j->'season'->>'n')::int = 2 from (select public.pl_state() as j) x),
  'saison 2 : 0 PL de la saison, 50 à vie');
reset role;
update public.game_season set start_at = now() - interval '40 days';

-- L. Lots (Studio) : moins de 50 joueurs classés → Premium pour le podium ; sinon ETB, coffret, 2 boosters.
select pg_temp.check((select lot like '1 mois de Premium offert%' and pseudo = 'Prof28' from public.season_winners(1) where rang = 1), 'moins de 50 classés : Premium à la 1re place');
select pg_temp.check((select count(*) <= 10 and bool_and(pseudo <> 'Admin28') from public.season_winners(1)), 'top 10 seulement, sans admin');
insert into auth.users (id, email, created_at)
  select ('00000000-0000-0000-0000-0000002801' || lpad(i::text, 2, '0'))::uuid, 'lot28_' || i || '@gmail.com', now() - interval '30 days' from generate_series(1, 50) i on conflict do nothing;
update public.profiles set pseudo = 'Lot28_' || right(id::text, 2) where id::text like '00000000-0000-0000-0000-0000002801%';
insert into public.pl_ledger (user_id, season, kind, ref, pl)
  select ('00000000-0000-0000-0000-0000002801' || lpad(i::text, 2, '0'))::uuid, 1, 'admin', '', i from generate_series(1, 50) i;
select pg_temp.check((select lot = 'ETB du moment' from public.season_winners(1) where rang = 1), '50 classés ou plus : ETB à la 1re place');
select pg_temp.check((select lot = '2 boosters du moment' from public.season_winners(1) where rang = 3), '3e : 2 boosters');
select pg_temp.check((select lot like '%ticket Or%' from public.season_winners(1) where rang = 4), '4e : Premium ou ticket Or');
select pg_temp.check((select lot like '%ticket Bronze%' from public.season_winners(1) where rang = 10), '10e : Premium ou ticket Bronze');
select pg_temp.check((select email = 'parrain28b@gmail.com' from public.season_winners(1) where rang = 1), 'e-mail du gagnant (Studio seulement)');

-- M. Correction dans Studio et suppression d'un compte.
select pg_temp.check((public.pl_admin_adjust('00000000-0000-0000-0000-0000000f2810', -200, 'Faux filleul')->>'pl')::int = -200, 'Studio : 200 PL retirés avec un motif');
select pg_temp.check((select count(*) = 1 from public.admin_log where action = 'pl_adjust' and target_user = '00000000-0000-0000-0000-0000000f2810'), 'correction au journal des admins');
update public.premium set cancel_at_period_end = true where user_id = '00000000-0000-0000-0000-0000000f2802';
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2802');
set role authenticated;
select pg_temp.check((public.delete_my_account()->>'ok')::boolean, 'filleul supprime son compte');
reset role;
select pg_temp.check((select count(*) = 0 from public.pl_ledger where user_id = '00000000-0000-0000-0000-0000000f2802')
  and (select count(*) = 0 from public.pl_referrals where filleul = '00000000-0000-0000-0000-0000000f2802'), 'ses PL et son parrainage effacés avec lui');
select pg_temp.check((select sum(pl) = 800 from public.pl_ledger where user_id = '00000000-0000-0000-0000-0000000f2801'), 'les PL déjà gagnés par son parrain restent');
