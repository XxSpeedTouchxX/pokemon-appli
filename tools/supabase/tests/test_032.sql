-- Tests de 032_messages_rapides.sql (après test_028 et test_031) : messages tout faits entre joueurs de « Ma ligue ».
-- Chaque ligne « OK » est une vérification réussie ; le script s'arrête à la première erreur.
\set ON_ERROR_STOP 1
reset role;
create or replace function pg_temp.check(ok boolean, label text) returns text language plpgsql as $$
begin if not ok then raise exception 'ÉCHEC : %', label; end if; return 'OK ' || label; end; $$;
create or replace function pg_temp.fails(q text, msg text) returns boolean language plpgsql as $$
begin execute q; return false; exception when others then return position(msg in sqlerrm) > 0; end; $$;
create or replace function pg_temp.as_user(u text) returns void language sql as $$ select set_config('request.jwt.claim.sub', u, false) $$;
grant execute on function pg_temp.check(boolean, text), pg_temp.fails(text, text) to authenticated, anon;
-- Comptes de test_028 : S (f2801, Sacha28), O (f2809, Éléa), P (f2803, Pierre28), E (f2805, Serie28), A (f2808, admin).
delete from public.quick_messages; delete from public.quick_msg_off;

-- A. Catalogue : 8 messages, aucune table lisible directement.
select pg_temp.check((select count(*) = 8 from public.quick_msg_catalog), 'catalogue : 8 messages tout faits');
set role authenticated;
select pg_temp.check(pg_temp.fails($$select * from public.quick_messages$$, 'permission denied'), 'messages : table illisible pour un joueur');
select pg_temp.check(pg_temp.fails($$select * from public.quick_msg_catalog$$, 'permission denied'), 'catalogue : table illisible pour un joueur');
select pg_temp.check(pg_temp.fails($$select * from public.quick_msg_off$$, 'permission denied'), 'réglages : table illisible pour un joueur');
select pg_temp.check(pg_temp.fails($$insert into public.quick_messages (from_id, to_id, code) values ('00000000-0000-0000-0000-0000000f2801', '00000000-0000-0000-0000-0000000f2809', 'gg')$$, 'permission denied'), 'messages : écriture directe refusée');
select pg_temp.check(pg_temp.fails($$select public._quick_msg_put('00000000-0000-0000-0000-0000000f2801', '00000000-0000-0000-0000-0000000f2809', 'gg', null)$$, 'permission denied'), 'outil interne refusé aux joueurs');
reset role;

-- B. Envoi : S écrit à O.
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2801');
set role authenticated;
select pg_temp.check((public.quick_msg_send('00000000-0000-0000-0000-0000000f2809', 'salut')->>'left')::int = 9, 'envoi : 9 messages restants aujourd’hui');
select pg_temp.check(pg_temp.fails($$select public.quick_msg_send('00000000-0000-0000-0000-0000000f2801', 'salut')$$, 'à toi-même'), 'pas de message à soi-même');
select pg_temp.check(pg_temp.fails($$select public.quick_msg_send('00000000-0000-0000-0000-0000000f2809', 'Coucou, ton numéro ?')$$, 'messages proposés'), 'texte libre refusé (code inconnu)');
select pg_temp.check(pg_temp.fails($$select public.quick_msg_send('00000000-0000-0000-0000-00000000dead', 'salut')$$, 'plus dans la ligue'), 'compte inconnu refusé');
select pg_temp.check((public.quick_msg_state()->>'left')::int = 9 and (public.quick_msg_state()->>'unread')::int = 0, 'état de S : 9 restants, rien reçu');
reset role;

-- C. Boîte de O : le message de S, non lu, avec pseudo et grade ; puis lu.
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2809');
set role authenticated;
select pg_temp.check((public.quick_msg_state()->>'unread')::int = 1, 'O : 1 message non lu');
create temp table i32 as select public.quick_msg_inbox(30) as j;
select pg_temp.check((select jsonb_array_length(j->'items') = 1 and j->'items'->0->>'code' = 'salut' and j->'items'->0->>'pseudo' = 'Sacha28'
    and j->'items'->0->>'from' = '00000000-0000-0000-0000-0000000f2801' and (j->'items'->0->>'read')::boolean = false
    and j->'items'->0 ? 'grade' and j->'items'->0 ? 'avatar' and j->'items'->0->'replied' = 'null'::jsonb from i32), 'boîte : code, pseudo, grade, avatar, non lu');
select pg_temp.check((select not ((j->'items'->0) ? 'email') and not ((j->'items'->0) ? 'age_range') from i32), 'boîte : ni e-mail ni âge de l’expéditeur');
select pg_temp.check((public.quick_msg_read()->>'read')::int = 1, 'tout marquer comme lu');
select pg_temp.check((public.quick_msg_state()->>'unread')::int = 0, 'O : plus rien de non lu');

-- D. Réponse : une seule par message, à l'expéditeur.
select pg_temp.check((public.quick_msg_reply((select (j->'items'->0->>'id')::bigint from i32), 'merci')->>'ok')::boolean, 'O répond « Merci ! »');
select pg_temp.check(pg_temp.fails(format('select public.quick_msg_reply(%s, %L)', (select j->'items'->0->>'id' from i32), 'gg'), 'déjà répondu'), 'une seule réponse par message');
select pg_temp.check((select public.quick_msg_inbox(30)->'items'->0->>'replied' = 'merci'), 'boîte de O : ma réponse affichée');
reset role;
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2803');
set role authenticated;
select pg_temp.check(pg_temp.fails(format('select public.quick_msg_reply(%s, %L)', (select j->'items'->0->>'id' from i32), 'gg'), 'introuvable'), 'P ne peut pas répondre au message reçu par O');
reset role;
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2801');
set role authenticated;
select pg_temp.check((select public.quick_msg_inbox(30)->'items'->0->>'code' = 'merci'), 'S reçoit la réponse de O');
reset role;

-- E. Limites : 3 par jour au même joueur, 10 par jour en tout.
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2801');
set role authenticated;
select public.quick_msg_send('00000000-0000-0000-0000-0000000f2809', 'gg');
select public.quick_msg_send('00000000-0000-0000-0000-0000000f2809', 'bravo');
select pg_temp.check(pg_temp.fails($$select public.quick_msg_send('00000000-0000-0000-0000-0000000f2809', 'top10')$$, '3 messages à ce joueur'), '4ᵉ message au même joueur refusé');
select public.quick_msg_send('00000000-0000-0000-0000-0000000f2803', 'salut');
select public.quick_msg_send('00000000-0000-0000-0000-0000000f2803', 'gg');
select public.quick_msg_send('00000000-0000-0000-0000-0000000f2803', 'bravo');
select public.quick_msg_send('00000000-0000-0000-0000-0000000f2804', 'salut');
select public.quick_msg_send('00000000-0000-0000-0000-0000000f2804', 'gg');
select public.quick_msg_send('00000000-0000-0000-0000-0000000f2804', 'bravo');
select pg_temp.check((public.quick_msg_state()->>'left')::int = 1, 'S : 1 message restant');
select public.quick_msg_send('00000000-0000-0000-0000-0000000f2806', 'safari');
select pg_temp.check(pg_temp.fails($$select public.quick_msg_send('00000000-0000-0000-0000-0000000f2807', 'salut')$$, '10 messages rapides'), '11ᵉ message du jour refusé');
select pg_temp.check((public.quick_msg_state()->>'left')::int = 0, 'S : 0 message restant');
reset role;
-- Le lendemain (jour de Paris), le compteur repart.
update public.quick_messages set created_at = created_at - interval '1 day' where from_id = '00000000-0000-0000-0000-0000000f2801';
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2801');
set role authenticated;
select pg_temp.check((public.quick_msg_state()->>'left')::int = 10, 'lendemain : 10 messages de nouveau');
reset role;

-- F. Couper ses messages : plus rien reçu, puis réactivé.
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2807');
set role authenticated;
select pg_temp.check((public.quick_msg_set(false)->>'off')::boolean, 'T2 coupe ses messages');
select pg_temp.check((public.quick_msg_inbox(30)->>'off')::boolean, 'boîte de T2 : messages coupés');
reset role;
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2801');
set role authenticated;
select pg_temp.check(pg_temp.fails($$select public.quick_msg_send('00000000-0000-0000-0000-0000000f2807', 'salut')$$, 'ne reçoit pas'), 'message vers T2 refusé');
reset role;
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2807');
set role authenticated;
select pg_temp.check(not (public.quick_msg_set(true)->>'off')::boolean, 'T2 réactive ses messages');
reset role;
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2801');
set role authenticated;
select pg_temp.check((public.quick_msg_send('00000000-0000-0000-0000-0000000f2807', 'salut')->>'ok')::boolean, 'message vers T2 accepté de nouveau');
reset role;

-- G. Compte suspendu : ne reçoit plus, n'envoie plus, ses messages disparaissent des boîtes.
update public.profiles set status = 'suspended' where id = '00000000-0000-0000-0000-0000000f2801';
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2801');
set role authenticated;
select pg_temp.check(pg_temp.fails($$select public.quick_msg_send('00000000-0000-0000-0000-0000000f2809', 'salut')$$, 'suspendu'), 'compte suspendu : envoi refusé');
reset role;
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2809');
set role authenticated;
select pg_temp.check(pg_temp.fails($$select public.quick_msg_send('00000000-0000-0000-0000-0000000f2801', 'salut')$$, 'plus dans la ligue'), 'message vers un compte suspendu refusé');
select pg_temp.check((select jsonb_array_length(public.quick_msg_inbox(30)->'items') = 0), 'boîte de O : messages du compte suspendu cachés');
select pg_temp.check((public.quick_msg_state()->>'unread')::int = 0, 'pastille de O : messages du compte suspendu non comptés');
reset role;
update public.profiles set status = 'active' where id = '00000000-0000-0000-0000-0000000f2801';

-- H. Ménage à 90 jours, effacement avec le compte, visiteur non connecté.
update public.quick_messages set created_at = now() - interval '91 days' where to_id = '00000000-0000-0000-0000-0000000f2803';
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2809');
set role authenticated;
select public.quick_msg_send('00000000-0000-0000-0000-0000000f2804', 'gg');
reset role;
select pg_temp.check((select count(*) = 0 from public.quick_messages where to_id = '00000000-0000-0000-0000-0000000f2803'), 'messages de plus de 90 jours effacés');
select pg_temp.check((select count(*) > 0 from public.quick_messages where from_id = '00000000-0000-0000-0000-0000000f2809' or to_id = '00000000-0000-0000-0000-0000000f2809'), 'O a des messages avant la suppression');
insert into auth.users (id, email, email_confirmed_at, created_at) values ('00000000-0000-0000-0000-0000000f3201', 'suppr32@gmail.com', now(), now()) on conflict do nothing;
update public.profiles set pseudo = 'Suppr32' where id = '00000000-0000-0000-0000-0000000f3201';
select pg_temp.as_user('00000000-0000-0000-0000-0000000f3201');
set role authenticated;
select public.quick_msg_send('00000000-0000-0000-0000-0000000f2804', 'salut');
select public.quick_msg_set(false);
select pg_temp.check((public.delete_my_account()->>'ok')::boolean, 'Suppr32 supprime son compte');
reset role;
select pg_temp.check((select count(*) = 0 from public.quick_messages where from_id = '00000000-0000-0000-0000-0000000f3201')
    and not exists (select 1 from public.quick_msg_off where user_id = '00000000-0000-0000-0000-0000000f3201'), 'compte supprimé : messages et réglage effacés');
set role anon;
select pg_temp.check(pg_temp.fails($$select public.quick_msg_send('00000000-0000-0000-0000-0000000f2809', 'salut')$$, 'permission denied'), 'visiteur non connecté : envoi refusé');
select pg_temp.check(pg_temp.fails($$select public.quick_msg_inbox(30)$$, 'permission denied'), 'visiteur non connecté : boîte refusée');
reset role;
-- Rejouable : relancer 032 garde les messages.
\i 032_messages_rapides.sql
select pg_temp.check((select count(*) > 0 from public.quick_messages), '032 rejoué : messages gardés');
