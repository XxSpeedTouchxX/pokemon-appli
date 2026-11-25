-- Tests de 041_messages_modifier.sql (après test_038, qui rejoue 038 : réinstaller 041 juste avant) : messages envoyés,
-- modifier ou supprimer un message. À lancer depuis tools/supabase (psql -f tests/test_041.sql).
-- Chaque ligne « OK » est une vérification réussie ; le script s'arrête à la première erreur.
\set ON_ERROR_STOP 1
reset role;
create or replace function pg_temp.check(ok boolean, label text) returns text language plpgsql as $$
begin if not ok then raise exception 'ÉCHEC : %', label; end if; return 'OK ' || label; end; $$;
create or replace function pg_temp.fails(q text, msg text) returns boolean language plpgsql as $$
begin execute q; return false; exception when others then return position(msg in sqlerrm) > 0; end; $$;
create or replace function pg_temp.as_user(u text) returns void language sql as $$ select set_config('request.jwt.claim.sub', u, false) $$;
grant execute on function pg_temp.check(boolean, text), pg_temp.fails(text, text) to authenticated, anon;
-- Comptes : S (f2801, Sacha28), O (f2809, Éléa), P (f2803, Pierre28).
delete from public.quick_messages;
delete from public.showcase;
delete from public.quick_msg_off;
update public.profiles set age_range = '25-35', status = 'active' where id in ('00000000-0000-0000-0000-0000000f2801', '00000000-0000-0000-0000-0000000f2809', '00000000-0000-0000-0000-0000000f2803');
insert into public.showcase (user_id, ref, card_id, cond, for_trade, for_sale, price_cents, deal) values
  ('00000000-0000-0000-0000-0000000f2801', 'ex11-111|FR|NM|', 'ex11-111', 'NM', true, false, null, false),   -- S : Groudon ☆ pour trade
  ('00000000-0000-0000-0000-0000000f2801', 'sv01-9|FR|NM|', 'sv01-9', 'NM', false, true, 2500, false),       -- S : à vendre 25 €
  ('00000000-0000-0000-0000-0000000f2803', 'base1-4|FR|NM|', 'base1-4', 'NM', true, false, null, false),     -- P : Dracaufeu pour trade
  ('00000000-0000-0000-0000-0000000f2803', 'base1-2|FR|EX|', 'base1-2', 'EX', true, false, null, false),     -- P : Tortank pour trade
  ('00000000-0000-0000-0000-0000000f2809', 'sv01-1|FR|NM|', 'sv01-1', 'NM', true, false, null, false);       -- O : sv01-1 pour trade
create temp table sid41 as select ref, id from public.showcase;
grant select on sid41 to authenticated;
create or replace function pg_temp.sid(r text) returns bigint language sql as $$ select id from sid41 where ref = r $$;
grant execute on function pg_temp.sid(text) to authenticated;
-- Identifiants de messages relevés par l'administrateur du test (l'app n'a pas accès à la table).
create temp table ids41 (k text primary key, id bigint);
grant select on ids41 to authenticated;

-- A. Visiteur non connecté refusé ; installé (v 41).
set role anon;
select pg_temp.check(pg_temp.fails($$select public.quick_msg_sent(30)$$, 'permission denied'), 'visiteur : messages envoyés refusés');
select pg_temp.check(pg_temp.fails($$select public.trade_delete(1)$$, 'permission denied'), 'visiteur : supprimer refusé');
select pg_temp.check(pg_temp.fails($$select public.trade_edit(1, 'interest', null)$$, 'permission denied'), 'visiteur : modifier refusé');
reset role;

-- B. P envoie « Je suis intéressé » sur le Groudon ☆ de S, puis le retrouve dans ses messages envoyés.
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2803');
set role authenticated;
select pg_temp.check((select (public.trade_send('00000000-0000-0000-0000-0000000f2801', 'interest', pg_temp.sid('ex11-111|FR|NM|'))->>'ok')::boolean), 'P : « Je suis intéressé » envoyé');
select pg_temp.check((select (j->>'v')::int = 41 and jsonb_array_length(j->'items') = 1 from (select public.quick_msg_sent(30) j) x), 'P : 1 message envoyé (v 41)');
select pg_temp.check((select i->>'kind' = 'interest' and i->>'pseudo' = 'Sacha28' and not (i->>'seen')::boolean and not (i->>'edited')::boolean and i->>'answer' is null
  and (i->>'edits_left')::int = 5 and i->'card'->>'card_id' = 'ex11-111' from (select public.quick_msg_sent(30)->'items'->0 i) x), 'P : envoyé à Sacha28, pas encore vu, pas modifié, sans réponse');
select pg_temp.check((select position('@' in public.quick_msg_sent(30)::text) = 0), 'jamais d''adresse e-mail dans les messages envoyés');
reset role;
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2801');
set role authenticated;
select pg_temp.check((select jsonb_array_length(public.quick_msg_sent(30)->'items') = 0), 'S : aucun message envoyé');
select pg_temp.check((select (public.quick_msg_state()->>'unread')::int = 1 and (public.quick_msg_state()->>'v')::int = 41), 'S : 1 proposition non lue');
select public.quick_msg_read();
reset role;
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2803');
set role authenticated;
select pg_temp.check((select (public.quick_msg_sent(30)->'items'->0->>'seen')::boolean), 'P : « Vu » une fois lu par S');

-- C. P modifie sa proposition : « Je te propose une de mes cartes » (Dracaufeu), puis le Tortank.
select pg_temp.check((select (public.trade_edit((public.quick_msg_sent(30)->'items'->0->>'id')::bigint, 'offer', pg_temp.sid('base1-4|FR|NM|'))->>'edits')::int = 1), 'P : modifié en proposition d''échange (Dracaufeu)');
select pg_temp.check((select i->>'kind' = 'offer' and i->'offer'->>'card_id' = 'base1-4' and (i->>'edited')::boolean and (i->>'edits_left')::int = 4 and not (i->>'seen')::boolean
  from (select public.quick_msg_sent(30)->'items'->0 i) x), 'P : proposition « Modifié », carte proposée Dracaufeu, de nouveau non vue');
select pg_temp.check((select (public.trade_edit((public.quick_msg_sent(30)->'items'->0->>'id')::bigint, 'offer', pg_temp.sid('base1-4|FR|NM|'))->>'same')::boolean), 'P : même choix : rien ne change, aucun essai compté');
select pg_temp.check((select (public.trade_edit((public.quick_msg_sent(30)->'items'->0->>'id')::bigint, 'offer', pg_temp.sid('base1-2|FR|EX|'))->>'edits')::int = 2), 'P : carte proposée changée (Tortank)');
select pg_temp.check(pg_temp.fails($$select public.trade_edit((public.quick_msg_sent(30)->'items'->0->>'id')::bigint, 'offer', (select id from sid41 where ref = 'sv01-1|FR|NM|'))$$, 'Choisis une de tes cartes Pour trade'), 'P : pas la carte d''un autre joueur');
select pg_temp.check(pg_temp.fails($$select public.trade_edit((public.quick_msg_sent(30)->'items'->0->>'id')::bigint, 'hello', null)$$, 'messages proposés'), 'P : aucun texte libre');
select pg_temp.check(pg_temp.fails($$select public.trade_edit((public.quick_msg_sent(30)->'items'->0->>'id')::bigint, 'offer', null)$$, 'Choisis une de tes cartes Pour trade'), 'P : échange sans carte refusé');
reset role;
insert into ids41 select 'last', max(id) from public.quick_messages;
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2809');
set role authenticated;
select pg_temp.check(pg_temp.fails($$select public.trade_edit((select id from ids41 where k = 'last'), 'interest', null)$$, 'introuvable'), 'O : ne peut pas modifier le message d''un autre');
select pg_temp.check(pg_temp.fails($$select public.trade_delete((select id from ids41 where k = 'last'))$$, 'introuvable'), 'O : ne peut pas supprimer le message d''un autre');
reset role;
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2801');
set role authenticated;
select pg_temp.check((select i->>'kind' = 'offer' and (i->>'edited')::boolean and not (i->>'read')::boolean and i->'offer'->>'card_id' = 'base1-2'
  from (select public.quick_msg_inbox(30)->'items'->0 i) x), 'S : reçoit la proposition modifiée (Tortank), « Modifié », non lue');
select pg_temp.check(pg_temp.fails($$select public.trade_edit((public.quick_msg_inbox(30)->'items'->0->>'id')::bigint, 'interest', null)$$, 'introuvable'), 'S : ne peut pas modifier un message reçu');

-- D. S répond « Non merci », puis change sa réponse en « Ça m'intéresse » (cartes réservées), puis « Plus disponible ».
select pg_temp.check((select not (public.trade_answer((public.quick_msg_inbox(30)->'items'->0->>'id')::bigint, 'deal_no')->>'deal')::boolean), 'S : « Non merci »');
select pg_temp.check((select (public.trade_answer_edit((public.quick_msg_inbox(30)->'items'->0->>'id')::bigint, 'deal_yes')->>'deal')::boolean), 'S : réponse changée en « Ça m''intéresse »');
reset role;
select pg_temp.check((select bool_and(deal) from public.showcase where ref in ('ex11-111|FR|NM|', 'base1-2|FR|EX|')), 'accord : Groudon ☆ et Tortank réservés');
select pg_temp.check((select not deal from public.showcase where ref = 'base1-4|FR|NM|'), 'accord : le Dracaufeu (ancienne carte proposée) reste libre');
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2803');
set role authenticated;
select pg_temp.check((select i->>'answer' = 'deal_yes' and (i->>'answer_edited')::boolean and (i->>'deal')::boolean from (select public.quick_msg_sent(30)->'items'->0 i) x), 'P : voit la réponse modifiée « Ça m''intéresse » et l''accord');
select pg_temp.check((select i->>'kind' = 'answer' and i->>'code' = 'deal_yes' and (i->>'edited')::boolean and not (i->>'read')::boolean from (select public.quick_msg_inbox(30)->'items'->0 i) x), 'P : réponse « Modifié », de nouveau non lue');
select pg_temp.check(pg_temp.fails($$select public.trade_edit((public.quick_msg_sent(30)->'items'->0->>'id')::bigint, 'interest', null)$$, 'déjà répondu'), 'P : plus de modification après une réponse');
reset role;
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2801');
set role authenticated;
select pg_temp.check((select not (public.trade_answer_edit((public.quick_msg_inbox(30)->'items'->0->>'id')::bigint, 'gone')->>'deal')::boolean), 'S : réponse changée en « Plus disponible »');
reset role;
select pg_temp.check((select not bool_or(deal) from public.showcase), 'accord annulé : cartes libérées');
select pg_temp.check((select not bool_or(deal) from public.quick_messages), 'accord annulé sur les messages aussi');
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2801');
set role authenticated;
select pg_temp.check(pg_temp.fails($$select public.trade_answer_edit((public.quick_msg_inbox(30)->'items'->0->>'id')::bigint, 'bonjour')$$, 'messages proposés'), 'S : aucun texte libre dans la réponse');
select pg_temp.check((select (public.trade_answer_edit((public.quick_msg_inbox(30)->'items'->0->>'id')::bigint, 'gone')->>'same')::boolean), 'S : même réponse : rien ne change');
select pg_temp.check((select i->>'kind' = 'answer' and i->>'code' = 'gone' and (i->>'edited')::boolean from (select public.quick_msg_sent(30)->'items'->0 i) x), 'S : sa réponse dans ses messages envoyés');

-- E. S supprime sa réponse : la proposition redevient sans réponse pour les deux.
select pg_temp.check((select public.trade_delete((public.quick_msg_sent(30)->'items'->0->>'id')::bigint)->>'removed' = 'both'), 'S : réponse supprimée (pour les deux)');
select pg_temp.check((select (public.quick_msg_inbox(30)->'items'->0->>'replied') is null), 'S : proposition de nouveau sans réponse');
select pg_temp.check((select (public.trade_answer((public.quick_msg_inbox(30)->'items'->0->>'id')::bigint, 'deal_yes')->>'deal')::boolean), 'S : peut répondre de nouveau (accord)');
-- Supprimer une réponse d'accord libère les cartes.
select pg_temp.check((select public.trade_delete((public.quick_msg_sent(30)->'items'->0->>'id')::bigint)->>'removed' = 'both'), 'S : réponse d''accord supprimée');
reset role;
select pg_temp.check((select not bool_or(deal) from public.showcase), 'réponse d''accord supprimée : cartes libérées');
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2803');
set role authenticated;
select pg_temp.check((select (public.quick_msg_sent(30)->'items'->0->>'answer') is null and not exists (select 1 from jsonb_array_elements(public.quick_msg_inbox(30)->'items') e where e->>'kind' = 'answer')),
  'P : plus de réponse, ni dans ses envoyés ni dans ses reçus');

-- F. P supprime sa proposition sans réponse : retirée pour les deux ; il peut en refaire une ; elle reste comptée.
select pg_temp.check((select public.trade_delete((public.quick_msg_sent(30)->'items'->0->>'id')::bigint)->>'removed' = 'both'), 'P : proposition sans réponse retirée (pour les deux)');
select pg_temp.check((select jsonb_array_length(public.quick_msg_sent(30)->'items') = 0), 'P : plus dans ses messages envoyés');
reset role;
insert into ids41 select 'gone', max(id) from public.quick_messages where kind = 'offer';
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2801');
set role authenticated;
select pg_temp.check((select jsonb_array_length(public.quick_msg_inbox(30)->'items') = 0 and (public.quick_msg_state()->>'unread')::int = 0), 'S : plus dans ses messages reçus, aucun non lu');
select pg_temp.check(pg_temp.fails($$select public.trade_answer((select id from ids41 where k = 'gone'), 'deal_yes')$$, 'retirée'), 'S : ne peut plus répondre à une proposition retirée');
reset role;
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2803');
set role authenticated;
select pg_temp.check(pg_temp.fails($$select public.trade_delete((select id from ids41 where k = 'gone'))$$, 'introuvable'), 'P : déjà retirée, rien à supprimer');
select pg_temp.check((select (public.trade_send('00000000-0000-0000-0000-0000000f2801', 'interest', pg_temp.sid('sv01-9|FR|NM|'))->>'ok')::boolean), 'P : nouvelle proposition (carte à vendre de S)');
select pg_temp.check((select (public.trade_send('00000000-0000-0000-0000-0000000f2801', 'interest', pg_temp.sid('ex11-111|FR|NM|'))->>'ok')::boolean), 'P : peut redemander le Groudon ☆ (proposition retirée)');
select pg_temp.check((select (public.quick_msg_state()->>'left')::int = 7), 'P : la proposition retirée compte dans les 10 messages du jour (7 restants)');
select pg_temp.check(pg_temp.fails($$select public.trade_edit((public.quick_msg_sent(30)->'items'->1->>'id')::bigint, 'offer', (select id from sid41 where ref = 'base1-4|FR|NM|'))$$, 'pas proposée à l''échange'),
  'P : carte seulement à vendre : pas de proposition d''échange');

-- G. 5 modifications au plus.
select public.trade_edit((public.quick_msg_sent(30)->'items'->0->>'id')::bigint, 'offer', pg_temp.sid('base1-4|FR|NM|'));
select public.trade_edit((public.quick_msg_sent(30)->'items'->0->>'id')::bigint, 'interest', null);
select public.trade_edit((public.quick_msg_sent(30)->'items'->0->>'id')::bigint, 'offer', pg_temp.sid('base1-2|FR|EX|'));
select public.trade_edit((public.quick_msg_sent(30)->'items'->0->>'id')::bigint, 'interest', null);
select public.trade_edit((public.quick_msg_sent(30)->'items'->0->>'id')::bigint, 'offer', pg_temp.sid('base1-4|FR|NM|'));
select pg_temp.check((select (public.quick_msg_sent(30)->'items'->0->>'edits_left')::int = 0), 'P : 5 modifications faites, plus aucune');
select pg_temp.check(pg_temp.fails($$select public.trade_edit((public.quick_msg_sent(30)->'items'->0->>'id')::bigint, 'interest', null)$$, '5 fois'), 'P : 6ᵉ modification refusée');

-- H. Proposition avec réponse supprimée par P : retirée de sa liste seulement ; S garde la sienne.
reset role;
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2801');
set role authenticated;
select public.trade_answer((select (e->>'id')::bigint from jsonb_array_elements(public.quick_msg_inbox(30)->'items') e where e->'card'->>'card_id' = 'sv01-9'), 'deal_no');
reset role;
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2803');
set role authenticated;
select pg_temp.check((select public.trade_delete((select (e->>'id')::bigint from jsonb_array_elements(public.quick_msg_sent(30)->'items') e where e->'card'->>'card_id' = 'sv01-9'))->>'removed' = 'me'),
  'P : proposition avec réponse supprimée de sa liste seulement');
select pg_temp.check((select not exists (select 1 from jsonb_array_elements(public.quick_msg_sent(30)->'items') e where e->'card'->>'card_id' = 'sv01-9' and e->>'kind' = 'interest')), 'P : plus dans ses envoyés');
reset role;
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2801');
set role authenticated;
select pg_temp.check((select exists (select 1 from jsonb_array_elements(public.quick_msg_inbox(30)->'items') e where e->'card'->>'card_id' = 'sv01-9' and e->>'replied' = 'deal_no')), 'S : garde la proposition et sa réponse');

-- I. Message reçu supprimé : retiré de ma liste seulement, plus compté comme non lu.
select pg_temp.check((select public.trade_delete((select (e->>'id')::bigint from jsonb_array_elements(public.quick_msg_inbox(30)->'items') e where e->'card'->>'card_id' = 'sv01-9'))->>'removed' = 'me'),
  'S : message reçu supprimé de sa liste');
select pg_temp.check((select not exists (select 1 from jsonb_array_elements(public.quick_msg_inbox(30)->'items') e where e->'card'->>'card_id' = 'sv01-9')), 'S : plus dans ses reçus');
select pg_temp.check((select (public.quick_msg_state()->>'unread')::int = 1), 'S : seul le Groudon ☆ reste non lu');
reset role;
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2803');
set role authenticated;
select pg_temp.check((select exists (select 1 from jsonb_array_elements(public.quick_msg_inbox(30)->'items') e where e->>'kind' = 'answer' and e->>'code' = 'deal_no')), 'P : garde la réponse « Non merci » reçue');
select pg_temp.check((select public.trade_delete((select (e->>'id')::bigint from jsonb_array_elements(public.quick_msg_inbox(30)->'items') e where e->>'kind' = 'answer'))->>'removed' = 'me'), 'P : réponse reçue supprimée de sa liste');
select pg_temp.check((select (public.quick_msg_state()->>'unread')::int = 0 and not exists (select 1 from jsonb_array_elements(public.quick_msg_inbox(30)->'items') e where e->>'kind' = 'answer')), 'P : plus de réponse reçue, aucun non lu');
reset role;

-- J. Une carte réservée par un autre accord n'est pas libérée par l'annulation d'un accord.
delete from public.quick_messages;
update public.showcase set deal = false;
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2803');
set role authenticated;
select public.trade_send('00000000-0000-0000-0000-0000000f2801', 'interest', pg_temp.sid('ex11-111|FR|NM|'));
reset role;
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2801');
set role authenticated;
select public.trade_answer((public.quick_msg_inbox(30)->'items'->0->>'id')::bigint, 'deal_yes');
reset role;
-- Le Groudon ☆ est réservé par cet accord ; une autre proposition d'accord (ancienne, forcée ici) le réserve aussi.
insert into public.quick_messages (from_id, to_id, code, kind, card, deal) values ('00000000-0000-0000-0000-0000000f2809', '00000000-0000-0000-0000-0000000f2801', 'interest', 'interest',
  jsonb_build_object('sid', pg_temp.sid('ex11-111|FR|NM|'), 'card_id', 'ex11-111'), true);
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2801');
set role authenticated;
select public.trade_answer_edit((select (e->>'id')::bigint from jsonb_array_elements(public.quick_msg_inbox(30)->'items') e where e->>'from' = '00000000-0000-0000-0000-0000000f2803'), 'deal_no');
reset role;
select pg_temp.check((select deal from public.showcase where ref = 'ex11-111|FR|NM|'), 'carte gardée réservée par l''autre accord');

-- K. Droits : les fonctions internes ne s'appellent pas depuis l'app.
set role authenticated;
select pg_temp.check(pg_temp.fails($$select public._trade_unreserve(1, 2)$$, 'permission denied'), 'outil interne _trade_unreserve refusé');
reset role;

delete from public.quick_messages;
delete from public.showcase;
-- L. Rejouable : réinstaller 041 ne change rien (et remet ses fonctions si test_038 a rejoué 038 juste avant).
\i 041_messages_modifier.sql
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2801');
set role authenticated;
select pg_temp.check((select (public.quick_msg_state()->>'v')::int = 41), '041 rejoué : « Mes messages » en version 41');
reset role;
select 'test_041 : tout est OK' as fin;
