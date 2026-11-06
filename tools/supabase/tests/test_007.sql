-- Tests de 007_admin_boutique.sql (après tous les autres, 006 et test_006 compris).
-- Chaque ligne « OK » est une vérification réussie ; le script s'arrête à la première erreur.
\set ON_ERROR_STOP 1
reset role;
create or replace function pg_temp.check(ok boolean, label text) returns text language plpgsql as $$
begin if not ok then raise exception 'ÉCHEC : %', label; end if; return 'OK ' || label; end; $$;
create or replace function pg_temp.fails(q text, label text) returns text language plpgsql as $$
begin
  begin execute q; exception when others then return 'OK ' || label || ' (refusé : ' || left(sqlerrm, 70) || ')'; end;
  raise exception 'ÉCHEC : % (accepté)', label;
end; $$;
grant execute on function pg_temp.check(boolean, text), pg_temp.fails(text, text) to authenticated, anon;
update public.game_throttle set n = 0;
select set_config('request.jwt.claims', '{"aal": "aal1"}', false);

-- A. Mot de passe des admins.
select pg_temp.fails($$select public.admin_set_password('court')$$, 'mot de passe admin de moins de 12 caractères');
select public.admin_set_password('mot-de-passe-de-test-2026');
select pg_temp.check((select hash from public.admin_secret) like '$2a$10$%' and (select hash from public.admin_secret) not like '%mot-de-passe%', 'seule une empreinte bcrypt est gardée');
-- Compte ordinaire : rien, même avec le bon mot de passe.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000a', false);
set role authenticated;
select pg_temp.fails($$select * from public.admin_secret$$, 'lire l''empreinte du mot de passe');
select pg_temp.fails($$select public.admin_set_password('mot-de-passe-pirate-2026')$$, 'changer le mot de passe admin depuis l''app');
select pg_temp.fails($$insert into public.admin_unlocks values (auth.uid(), now() + interval '1 year')$$, 'se déverrouiller soi-même');
select pg_temp.fails($$select public.admin_unlock('mot-de-passe-de-test-2026')$$, 'compte ordinaire avec le bon mot de passe');
select pg_temp.check(not public.is_admin(), 'compte ordinaire : jamais admin');
-- Admin : sans le mot de passe, aucun droit (sans double authentification non plus).
reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000ad', false);
set role authenticated;
select pg_temp.check(not public.is_admin(), 'admin qui n''a pas tapé le mot de passe : pas admin');
select pg_temp.fails($$select public.admin_adjust_wallet('00000000-0000-0000-0000-00000000000a', 100, 0, 'sans mot de passe')$$, 'outil admin sans le mot de passe');
select pg_temp.check(not (public.admin_unlock('faux-mot-de-passe-2026')->>'ok')::boolean, 'mot de passe faux : refusé');
select pg_temp.check(not public.is_admin(), 'après un essai faux : toujours pas admin');
select pg_temp.check((public.admin_unlock('mot-de-passe-de-test-2026')->>'ok')::boolean, 'bon mot de passe : mode Admin ouvert');
select pg_temp.check(public.is_admin(), 'admin déverrouillé : outils admin');
select pg_temp.check((select count(*) from public.profiles) > 1, 'admin déverrouillé : voit tous les profils');
reset role;
select pg_temp.check((select count(*) from public.admin_log where action = 'unlock_failed') = 1 and (select count(*) from public.admin_log where action = 'unlock') = 1, 'essai faux et ouverture inscrits au journal des admins');
select pg_temp.check((select until from public.admin_unlocks where user_id = '00000000-0000-0000-0000-0000000000ad') between now() + interval '23 hours' and now() + interval '25 hours', 'ouverture valable 24 h');
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000ad', false);
set role authenticated;
-- PK et PA illimités : soldes mis à 0, puis tout est possible sans rien débiter.
select public.admin_adjust_wallet('00000000-0000-0000-0000-0000000000ad', -999999, -999999, 'test illimité');
select pg_temp.check((public.game_state()->>'unlimited')::boolean and (public.game_state()->>'pk')::int = 0, 'état du compte : admin illimité, 0 PK');
select pg_temp.check((public.buy_item('ticket-or', 'aaaaaaaa-0000-0000-0000-000000000001')->>'pk')::int = 0, 'ticket Or avec 0 PK : accepté, rien débité');
select pg_temp.check((public.buy_item('achat-etb-30', 'aaaaaaaa-0000-0000-0000-000000000002')->>'pk')::int = 0, 'ETB 30 ans sans grade ni 7 jours : accepté');
select pg_temp.check((public.unlock_pokemon(2, 'aaaaaaaa-0000-0000-0000-000000000003')->>'pa')::int = 0, 'Pokémon débloqué avec 0 PA');
select pg_temp.check((public.open_booster('aaaaaaaa-0000-0000-0000-000000000004')->>'won')::int > 0 and (public.open_booster('aaaaaaaa-0000-0000-0000-000000000005')->>'won')::int > 0, 'deux Booster PK de suite, sans délai');
select pg_temp.check((public.flip_coin('aaaaaaaa-0000-0000-0000-000000000006')->>'won')::int in (0, 50), 'pièce à la Recrue, sans délai');
reset role;
select pg_temp.check((select count(*) from public.ledger where user_id = '00000000-0000-0000-0000-0000000000ad' and ref like '%admin illimité%') = 3, 'journal : achats et déblocage à 0, mention « admin illimité »');
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000ad', false);
set role authenticated;
select pg_temp.check((select count(*) from public.admin_check_ledger()) = 0, 'soldes toujours égaux au journal');
-- Refermé ou expiré : plus rien.
select public.admin_lock();
select pg_temp.check(not public.is_admin() and not (public.game_state()->>'unlimited')::boolean, 'mode Admin refermé : plus admin, plus illimité');
select pg_temp.fails($$select public.buy_item('ticket-bronze', 'aaaaaaaa-0000-0000-0000-000000000007')$$, 'refermé : règles normales de retour (7 jours, solde)');
select (public.admin_unlock('mot-de-passe-de-test-2026')->>'ok')::boolean;
reset role; update public.admin_unlocks set until = now() - interval '1 second'; set role authenticated;
select pg_temp.check(not public.is_admin(), 'ouverture de plus de 24 h : expirée');
select (public.admin_unlock('mot-de-passe-de-test-2026')->>'ok')::boolean;
reset role; select public.admin_set_password('nouveau-mot-de-passe-2026'); set role authenticated;
select pg_temp.check(not public.is_admin(), 'mot de passe changé : il faut le retaper');
select pg_temp.check((public.admin_unlock('nouveau-mot-de-passe-2026')->>'ok')::boolean, 'nouveau mot de passe accepté');
select public.admin_adjust_wallet('00000000-0000-0000-0000-00000000000a', 20000, 0, 'test du nouveau shop');

-- B. Nouveau PK shop (compte ordinaire, adresse confirmée depuis plus de 7 jours, grade quelconque).
reset role; update public.game_throttle set n = 0;
select pg_temp.check(public._game_next_draw('2026-11-01 12:00 Europe/Paris') = '2026-11-22 20:00 Europe/Paris', 'premier tirage : dimanche 22 novembre 2026 à 20 h');
select pg_temp.check(public._game_next_draw('2026-11-22 19:59 Europe/Paris') = '2026-11-22 20:00 Europe/Paris', 'ticket acheté juste avant 20 h : tirage du jour');
select pg_temp.check(public._game_next_draw('2026-11-22 20:01 Europe/Paris') = '2026-12-06 20:00 Europe/Paris', 'juste après : tirage suivant, deux semaines plus tard');
select pg_temp.check(extract(dow from public._game_next_draw() at time zone 'Europe/Paris') = 0, 'tirages le dimanche');
select pg_temp.check((select count(*) from public.game_items where active) = 6 and not (select active from public.game_items where id = 'ticket-booster'), '6 articles en vente, anciens articles retirés');
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000a', false);
set role authenticated;
select pg_temp.fails($$select public.buy_item('ticket-booster', 'bbbbbbbb-0000-0000-0000-000000000001')$$, 'ancien ticket à 2 000 PK');
select pg_temp.fails($$update public.game_items set price_pk = 1 where id = 'ticket-or'$$, 'changer un prix du shop');
create temp table pk0 as select pk from public.wallets where user_id = auth.uid();
select pg_temp.check((public.buy_item('ticket-bronze', 'bbbbbbbb-0000-0000-0000-000000000002')->>'count')::int = 1, 'ticket Bronze (500 PK) pour le prochain tirage');
select pg_temp.check((public.buy_item('ticket-bronze', 'bbbbbbbb-0000-0000-0000-000000000003')->>'count')::int = 2, 'deuxième ticket Bronze : deux chances');
select pg_temp.check((public.buy_item('ticket-argent', 'bbbbbbbb-0000-0000-0000-000000000004')->>'item') = 'ticket-argent', 'ticket Argent (1 500 PK)');
select pg_temp.fails($$select public.buy_item('achat-rare', 'bbbbbbbb-0000-0000-0000-000000000005')$$, 'item rare sans choix');
select pg_temp.fails($$select public.buy_item('achat-rare', 'bbbbbbbb-0000-0000-0000-000000000006', 'Lingot d''or')$$, 'item rare hors de la liste');
select pg_temp.check((public.buy_item('achat-rare', 'bbbbbbbb-0000-0000-0000-000000000007', 'Poster')->>'choice') = 'Poster', 'item rare au choix (10 000 PK) : Poster');
select pg_temp.check((select pk from public.wallets where user_id = auth.uid()) = (select pk from pk0) - 500 - 500 - 1500 - 10000, 'prix exacts débités (500 + 500 + 1 500 + 10 000 PK)');
select pg_temp.fails($$select public.buy_item('achat-etb-30', 'bbbbbbbb-0000-0000-0000-000000000008')$$, 'ETB 30 ans (15 000 PK) sans assez de PK');
select pg_temp.check((public.game_state()->'shop_draw'->>'ticket-bronze')::int = 2 and (public.game_state()->>'next_draw') is not null, 'état du compte : 2 tickets Bronze pour le prochain tirage');
select pg_temp.fails($$select * from public.admin_draw_entries()$$, 'liste des participants sans être admin');
reset role; update auth.users set email_confirmed_at = now() where id = '00000000-0000-0000-0000-00000000000a'; set role authenticated;
select pg_temp.fails($$select public.buy_item('ticket-bronze', 'bbbbbbbb-0000-0000-0000-000000000009')$$, 'ticket avant 7 jours de compte');
reset role; update auth.users set email_confirmed_at = now() - interval '8 days' where id = '00000000-0000-0000-0000-00000000000a';
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000ad', false);
set role authenticated;
select pg_temp.check((select tickets from public.admin_draw_entries() where item = 'ticket-bronze' and user_id = '00000000-0000-0000-0000-00000000000a') = 2, 'admin : participants du prochain tirage (2 tickets Bronze)');
-- Trop d'essais faux : bloqué 15 minutes, même avec le bon mot de passe.
select public.admin_lock();
select public.admin_unlock('faux-1-xxxxxxxx'), public.admin_unlock('faux-2-xxxxxxxx'), public.admin_unlock('faux-3-xxxxxxxx'), public.admin_unlock('faux-4-xxxxxxxx');
select pg_temp.check(not (public.admin_unlock('nouveau-mot-de-passe-2026')->>'ok')::boolean and not public.is_admin(), '5 essais faux en 15 minutes : bloqué, même avec le bon mot de passe');
reset role;
