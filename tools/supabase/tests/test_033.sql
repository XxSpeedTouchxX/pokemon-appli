-- Tests de 033_vitrine.sql (après test_032) : vitrine, Pour trade, À vendre, Je cherche, propositions et accord.
-- Chaque ligne « OK » est une vérification réussie ; le script s'arrête à la première erreur.
\set ON_ERROR_STOP 1
reset role;
create or replace function pg_temp.check(ok boolean, label text) returns text language plpgsql as $$
begin if not ok then raise exception 'ÉCHEC : %', label; end if; return 'OK ' || label; end; $$;
create or replace function pg_temp.fails(q text, msg text) returns boolean language plpgsql as $$
begin execute q; return false; exception when others then return position(msg in sqlerrm) > 0; end; $$;
create or replace function pg_temp.as_user(u text) returns void language sql as $$ select set_config('request.jwt.claim.sub', u, false) $$;
grant execute on function pg_temp.check(boolean, text), pg_temp.fails(text, text) to authenticated, anon;
-- Comptes : S (f2801, Sacha28), O (f2809, Éléa), P (f2803), J (f2810, moins de 15 ans).
delete from public.quick_messages; delete from public.quick_msg_off; delete from public.showcase; delete from public.wants; delete from public.trade_adult;
update public.profiles set age_range = 'u15' where id = '00000000-0000-0000-0000-0000000f2810';
update public.profiles set age_range = '25-35' where id in ('00000000-0000-0000-0000-0000000f2801', '00000000-0000-0000-0000-0000000f2809');

-- A. Tables fermées aux joueurs.
set role authenticated;
select pg_temp.check(pg_temp.fails($$select * from public.showcase$$, 'permission denied'), 'vitrine : table illisible pour un joueur');
select pg_temp.check(pg_temp.fails($$select * from public.wants$$, 'permission denied'), 'Je cherche : table illisible pour un joueur');
select pg_temp.check(pg_temp.fails($$select * from public.trade_adult$$, 'permission denied'), 'majeurs : table illisible pour un joueur');
select pg_temp.check(pg_temp.fails($$select public._quick_msg_put2('00000000-0000-0000-0000-0000000f2801', '00000000-0000-0000-0000-0000000f2809', 'gg', null, 'quick', null, null)$$, 'permission denied'), 'outil interne refusé aux joueurs');
reset role;

-- B. Vitrine de S.
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2801');
set role authenticated;
select pg_temp.check(pg_temp.fails($$select public.showcase_set('[{"ref":"base1-4|FR|NM|","card_id":"base1-4","lang":"FR","cond":"NM","sale":true,"price":40}]')$$, '18 ans ou plus'), 'vente refusée avant « J''ai 18 ans ou plus »');
select pg_temp.check((public.trade_adult_confirm()->>'adult')::boolean, 'S confirme avoir 18 ans ou plus');
select pg_temp.check(pg_temp.fails($$select public.showcase_set('[{"ref":"a","card_id":"base1-4","sale":true,"price":0.5}]')$$, 'de 1 € à 100 000 €'), 'prix sous 1 € refusé');
select pg_temp.check(pg_temp.fails($$select public.showcase_set('[{"ref":"a","card_id":"base1-4","sale":true,"price":200000}]')$$, 'de 1 € à 100 000 €'), 'prix au-dessus de 100 000 € refusé');
select pg_temp.check(pg_temp.fails($$select public.showcase_set('[{"ref":"a","card_id":"base1-4","cond":"XX"}]')$$, 'illisible'), 'état inconnu refusé');
select pg_temp.check(pg_temp.fails($$select public.showcase_set('[{"ref":"a","card_id":"base1-4"},{"ref":"a","card_id":"base1-4"}]')$$, 'illisible'), 'même exemplaire deux fois refusé');
select pg_temp.check(pg_temp.fails(format('select public.showcase_set(%L::jsonb)', (select jsonb_agg(jsonb_build_object('ref', 'r' || g, 'card_id', 'base1-4')) from generate_series(1, 31) g)), '30 cartes au plus'), '31 cartes refusées');
select pg_temp.check((public.showcase_set('[
  {"ref":"30th-c-029|FR|NM|","card_id":"30th-c-029","lang":"FR","cond":"NM","trade":true},
  {"ref":"30th-151|FR|NM|","card_id":"30th-151","lang":"FR","cond":"NM","trade":true},
  {"ref":"base1-4|FR|EX|","card_id":"base1-4","lang":"FR","cond":"EX"},
  {"ref":"me02.5-276|FR|NM|PSA-10","card_id":"me02.5-276","lang":"FR","cond":"NM","grade":"PSA-10","sale":true,"price":40.5}
]')->>'n')::int = 4, 'vitrine de S : 4 cartes (2 Pour trade, 1 montrée, 1 à vendre 40,50 €)');
reset role;
select pg_temp.check((select price_cents = 4050 and for_sale and not for_trade from public.showcase where ref = 'me02.5-276|FR|NM|PSA-10'), 'prix gardé en centimes, gradée PSA 10');

-- C. « Je cherche » de O, et sa vitrine.
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2809');
set role authenticated;
select pg_temp.check(pg_temp.fails($$select public.wants_set(array['bad id!'])$$, 'illisible'), 'Je cherche : carte illisible refusée');
select pg_temp.check(pg_temp.fails(format('select public.wants_set(%L::text[])', (select array_agg('c' || g) from generate_series(1, 51) g)), '50 cartes au plus'), 'Je cherche : 51 cartes refusées');
select pg_temp.check((public.wants_set(array['30th-c-029', 'me02.5-276', 'sv03.5-199'])->>'n')::int = 3, 'O cherche 3 cartes');
select pg_temp.check((public.showcase_set('[{"ref":"swsh12pt5-160|FR|NM|","card_id":"swsh12pt5-160","cond":"NM","trade":true},{"ref":"sv01-1|FR|GD|","card_id":"sv01-1","cond":"GD"}]')->>'n')::int = 2, 'vitrine de O : 2 cartes, 1 Pour trade');
reset role;
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2801');
set role authenticated;
select public.wants_set(array['swsh12pt5-160']);
reset role;

-- D. État, fiche d'une carte, échanges possibles.
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2801');
set role authenticated;
create temp table st33 as select public.trade_state() as j;
reset role;
select pg_temp.check((select (j->>'adult')::boolean and (j->>'age_ok')::boolean and (j->'demand'->>'30th-c-029')::int = 1 and (j->'demand'->>'me02.5-276')::int = 1 and not (j->'demand' ? 'base1-4') from st33), 'S : sa Lugia et son Pikachu cherchés par 1 joueur');
select pg_temp.check((select (j->'supply'->>'swsh12pt5-160')::int = 1 from st33), 'S : la carte qu''il cherche est proposée par 1 joueur');
select pg_temp.check((select jsonb_array_length(j->'mine') = 4 and j->'mine'->0->>'ref' = '30th-c-029|FR|NM|' and (j->'mine'->0->>'sid') is not null and not (j->'mine'->0->>'deal')::boolean from st33), 'S : ses 4 cartes en vitrine avec leur numéro');
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2803');
set role authenticated;
select pg_temp.check((select (j->>'wanted')::int = 1 and (j->>'offered')::int = 1 from (select public.trade_card('30th-c-029') as j) x), 'fiche de la Lugia : 1 joueur la cherche, 1 l''a pour trade');
select pg_temp.check((select (j->>'wanted')::int = 0 and (j->>'offered')::int = 0 from (select public.trade_card('base1-4') as j) x), 'carte seulement montrée : comptée nulle part');
reset role;
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2809');
set role authenticated;
create temp table m33 as select public.trade_matches(30) as j;
reset role;
select pg_temp.check((select jsonb_array_length(j) = 1 and j->0->>'pseudo' = 'Sacha28' and (j->0->>'has')::int = 2 and (j->0->>'wants')::int = 1 from m33), 'échanges possibles de O : S a 2 cartes cherchées et cherche 1 de ses cartes');
select pg_temp.check((select j->0->'has_ids' @> '["30th-c-029"]' and j->0->'want_ids' = '["swsh12pt5-160"]' from m33), 'échanges possibles : les cartes en question');

-- E. Vitrine de S vue par O.
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2809');
set role authenticated;
create temp table v33 as select public.player_showcase('00000000-0000-0000-0000-0000000f2801') as j;
reset role;
select pg_temp.check((select jsonb_array_length(j->'items') = 4 and j->'items'->0->>'card_id' = '30th-c-029' and (j->'items'->0->>'trade')::boolean
    and (j->'items'->3->>'price_cents')::int = 4050 and j->'items'->3->>'grade' = 'PSA-10' and not (j->'items'->0 ? 'ref') from v33), 'vitrine de S : 4 cartes dans l''ordre, prix, note, sans clé de l''appareil');
select pg_temp.check((select j->'wants' = '["swsh12pt5-160"]' and (j->>'has_for_me')::int = 2 and (j->>'wants_mine')::int = 1 and not (j->>'me')::boolean from v33), 'vitrine de S : ce qu''il cherche et ce qui colle avec O');

-- F. Propositions de O à S.
create temp table ids33 as select ref, id from public.showcase;
grant select on ids33 to authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2809');
set role authenticated;
select pg_temp.check((public.trade_send('00000000-0000-0000-0000-0000000f2801', 'interest', (select (e->>'sid')::bigint from v33, jsonb_array_elements(j->'items') e where e->>'card_id' = '30th-c-029'))->>'ok')::boolean, 'O : « Je suis intéressé » par la Lugia de S');
select pg_temp.check(pg_temp.fails(format('select public.trade_send(%L, %L, %s)', '00000000-0000-0000-0000-0000000f2801', 'interest', (select e->>'sid' from v33, jsonb_array_elements(j->'items') e where e->>'card_id' = '30th-c-029')), 'attends sa réponse'), 'une seule proposition à la fois par carte');
select pg_temp.check(pg_temp.fails(format('select public.trade_send(%L, %L, %s)', '00000000-0000-0000-0000-0000000f2801', 'interest', (select e->>'sid' from v33, jsonb_array_elements(j->'items') e where e->>'card_id' = 'base1-4')), 'plus disponible'), 'carte seulement montrée : pas de proposition');
select pg_temp.check(pg_temp.fails(format('select public.trade_send(%L, %L, %s, %s)', '00000000-0000-0000-0000-0000000f2801', 'offer', (select e->>'sid' from v33, jsonb_array_elements(j->'items') e where e->>'card_id' = 'me02.5-276'), (select id from ids33 where ref = 'swsh12pt5-160|FR|NM|')), 'pas proposée à l''échange'), 'carte seulement à vendre : pas d''échange');
select pg_temp.check(pg_temp.fails(format('select public.trade_send(%L, %L, %s, %s)', '00000000-0000-0000-0000-0000000f2801', 'offer', (select e->>'sid' from v33, jsonb_array_elements(j->'items') e where e->>'card_id' = '30th-151'), (select id from ids33 where ref = 'sv01-1|FR|GD|')), 'tes cartes Pour trade'), 'échange avec une de mes cartes pas Pour trade : refusé');
select pg_temp.check((public.trade_send('00000000-0000-0000-0000-0000000f2801', 'offer', (select (e->>'sid')::bigint from v33, jsonb_array_elements(j->'items') e where e->>'card_id' = '30th-151'), (select id from ids33 where ref = 'swsh12pt5-160|FR|NM|'))->>'ok')::boolean, 'O propose sa carte contre le Mewtwo de S');
select pg_temp.check((public.trade_send('00000000-0000-0000-0000-0000000f2801', 'interest', (select (e->>'sid')::bigint from v33, jsonb_array_elements(j->'items') e where e->>'card_id' = 'me02.5-276'))->>'ok')::boolean, 'O : intéressé par la carte à vendre de S');
select pg_temp.check(pg_temp.fails($$select public.quick_msg_send('00000000-0000-0000-0000-0000000f2801', 'offer')$$, 'messages proposés'), 'code d''échange refusé dans un message rapide ordinaire');
reset role;

-- G. Boîte de S et réponses.
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2801');
set role authenticated;
create temp table i33 as select public.quick_msg_inbox(30) as j;
select pg_temp.check((select (j->>'trade')::boolean and jsonb_array_length(j->'items') = 3 and j->'items'->0->>'kind' = 'interest' and j->'items'->1->>'kind' = 'offer'
    and j->'items'->1->'offer'->>'card_id' = 'swsh12pt5-160' and j->'items'->1->'card'->>'card_id' = '30th-151' from i33), 'boîte de S : 2 « intéressé » et 1 proposition, avec les cartes');
select pg_temp.check(pg_temp.fails(format('select public.quick_msg_reply(%s, %L)', (select j->'items'->1->>'id' from i33), 'merci'), 'boutons de la proposition'), 'réponse ordinaire à une proposition refusée');
select pg_temp.check(pg_temp.fails(format('select public.trade_answer(%s, %L)', (select j->'items'->1->>'id' from i33), 'gg'), 'messages proposés'), 'réponse d''échange inconnue refusée');
select pg_temp.check((public.trade_answer((select (j->'items'->1->>'id')::bigint from i33), 'deal_yes')->>'deal')::boolean, 'S accepte l''échange : d''accord');
select pg_temp.check(pg_temp.fails(format('select public.trade_answer(%s, %L)', (select j->'items'->1->>'id' from i33), 'deal_no'), 'déjà répondu'), 'une seule réponse par proposition');
select pg_temp.check(not (public.trade_answer((select (j->'items'->2->>'id')::bigint from i33), 'deal_no')->>'deal')::boolean, 'S : « Non merci » à l''autre proposition');
reset role;
select pg_temp.check((select bool_and(deal) from public.showcase where ref in ('30th-151|FR|NM|', 'swsh12pt5-160|FR|NM|')), 'accord : les deux cartes passent « d''accord »');
select pg_temp.check((select not deal from public.showcase where ref = '30th-c-029|FR|NM|'), 'les autres cartes ne changent pas');
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2809');
set role authenticated;
select pg_temp.check((select x->>'kind' = 'answer' and x->>'code' = 'deal_yes' and (x->>'deal')::boolean and x->'card'->>'card_id' = '30th-151' and x->'offer'->>'card_id' = 'swsh12pt5-160'
    from (select e as x from jsonb_array_elements(public.quick_msg_inbox(30)->'items') e where e->>'code' = 'deal_yes') y), 'boîte de O : réponse « Ça m''intéresse » avec les cartes et l''accord');
select pg_temp.check(pg_temp.fails(format('select public.trade_send(%L, %L, %s)', '00000000-0000-0000-0000-0000000f2801', 'interest', (select e->>'sid' from v33, jsonb_array_elements(j->'items') e where e->>'card_id' = '30th-151')), 'plus disponible'), 'carte « d''accord » : plus de proposition');
select pg_temp.check((select (j->>'has')::int = 2 and (j->>'wants')::int = 0 from (select e as j from jsonb_array_elements(public.trade_matches(30)) e) x where j->>'pseudo' = 'Sacha28') is not distinct from true, 'échanges possibles : la carte « d''accord » de O ne compte plus');
reset role;

-- H. L'accord reste quand S renvoie sa vitrine ; « deal_off » le retire.
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2801');
set role authenticated;
select public.showcase_set('[{"ref":"30th-c-029|FR|NM|","card_id":"30th-c-029","trade":true},{"ref":"30th-151|FR|NM|","card_id":"30th-151","trade":true}]');
reset role;
select pg_temp.check((select deal from public.showcase where ref = '30th-151|FR|NM|') and (select count(*) = 2 from public.showcase where user_id = '00000000-0000-0000-0000-0000000f2801'), 'vitrine renvoyée : accord gardé, cartes retirées effacées');
set role authenticated;
select public.showcase_set('[{"ref":"30th-c-029|FR|NM|","card_id":"30th-c-029","trade":true},{"ref":"30th-151|FR|NM|","card_id":"30th-151","trade":true,"deal_off":true}]');
reset role;
select pg_temp.check((select not deal from public.showcase where ref = '30th-151|FR|NM|'), 'accord annulé par le joueur');

-- I. Moins de 15 ans : vitrine possible, échanges fermés.
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2810');
set role authenticated;
select pg_temp.check(pg_temp.fails($$select public.showcase_set('[{"ref":"a","card_id":"base1-4","trade":true}]')$$, 'à partir de 15 ans'), 'moins de 15 ans : Pour trade refusé');
select pg_temp.check((public.showcase_set('[{"ref":"a","card_id":"base1-4"}]')->>'n')::int = 1, 'moins de 15 ans : vitrine montrée');
select pg_temp.check(pg_temp.fails($$select public.trade_adult_confirm()$$, '18 ans et plus'), 'moins de 15 ans : vente refusée');
select pg_temp.check(pg_temp.fails(format('select public.trade_send(%L, %L, %s)', '00000000-0000-0000-0000-0000000f2801', 'interest', (select id from ids33 where ref = '30th-c-029|FR|NM|')), 'à partir de 15 ans'), 'moins de 15 ans : propositions refusées');
select pg_temp.check((select not (j->>'age_ok')::boolean from (select public.trade_state() as j) x), 'moins de 15 ans : état « age_ok » faux');
reset role;

-- J. Compte suspendu caché ; visiteur non connecté refusé ; compte supprimé effacé.
update public.profiles set status = 'suspended' where id = '00000000-0000-0000-0000-0000000f2801';
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2809');
set role authenticated;
select pg_temp.check(pg_temp.fails($$select public.player_showcase('00000000-0000-0000-0000-0000000f2801')$$, 'plus dans la ligue'), 'compte suspendu : vitrine refusée');
select pg_temp.check((select jsonb_array_length(public.trade_matches(30)) = 0), 'compte suspendu : absent des échanges possibles');
select pg_temp.check((select (public.trade_card('30th-c-029')->>'offered')::int = 0), 'compte suspendu : pas compté dans la fiche d''une carte');
reset role;
update public.profiles set status = 'active' where id = '00000000-0000-0000-0000-0000000f2801';
set role anon;
select pg_temp.check(pg_temp.fails($$select public.player_showcase('00000000-0000-0000-0000-0000000f2801')$$, 'permission denied'), 'visiteur non connecté : vitrine refusée');
select pg_temp.check(pg_temp.fails($$select public.showcase_set('[]')$$, 'permission denied'), 'visiteur non connecté : vitrine non modifiable');
reset role;
insert into auth.users (id, email, email_confirmed_at, created_at) values ('00000000-0000-0000-0000-0000000f3301', 'suppr33@gmail.com', now(), now()) on conflict do nothing;
update public.profiles set pseudo = 'Suppr33' where id = '00000000-0000-0000-0000-0000000f3301';
select pg_temp.as_user('00000000-0000-0000-0000-0000000f3301');
set role authenticated;
select public.showcase_set('[{"ref":"a","card_id":"base1-4","trade":true}]');
select public.wants_set(array['base1-4']);
select public.trade_adult_confirm();
select pg_temp.check((public.delete_my_account()->>'ok')::boolean, 'Suppr33 supprime son compte');
reset role;
select pg_temp.check(not exists (select 1 from public.showcase where user_id = '00000000-0000-0000-0000-0000000f3301') and not exists (select 1 from public.wants where user_id = '00000000-0000-0000-0000-0000000f3301')
    and not exists (select 1 from public.trade_adult where user_id = '00000000-0000-0000-0000-0000000f3301'), 'compte supprimé : vitrine, liste et déclaration effacées');
-- Rejouable : relancer 033 garde les vitrines.
\i 033_vitrine.sql
select pg_temp.check((select count(*) > 0 from public.showcase), '033 rejoué : vitrines gardées');
update public.profiles set age_range = null where id in ('00000000-0000-0000-0000-0000000f2801', '00000000-0000-0000-0000-0000000f2809', '00000000-0000-0000-0000-0000000f2810');
