-- Tests de 038_recherche_cartes.sql (après test_034) : chercher une carte proposée, messages rapides retirés.
-- Chaque ligne « OK » est une vérification réussie ; le script s'arrête à la première erreur.
\set ON_ERROR_STOP 1
reset role;
create or replace function pg_temp.check(ok boolean, label text) returns text language plpgsql as $$
begin if not ok then raise exception 'ÉCHEC : %', label; end if; return 'OK ' || label; end; $$;
create or replace function pg_temp.fails(q text, msg text) returns boolean language plpgsql as $$
begin execute q; return false; exception when others then return position(msg in sqlerrm) > 0; end; $$;
create or replace function pg_temp.as_user(u text) returns void language sql as $$ select set_config('request.jwt.claim.sub', u, false) $$;
grant execute on function pg_temp.check(boolean, text), pg_temp.fails(text, text) to authenticated, anon;
-- Comptes : S (f2801, Sacha28), O (f2809, Éléa), P (f2803, Pierre28), J (f2810, moins de 15 ans).
delete from public.quick_messages;
delete from public.showcase;
update public.profiles set age_range = '25-35', status = 'active' where id in ('00000000-0000-0000-0000-0000000f2801', '00000000-0000-0000-0000-0000000f2809', '00000000-0000-0000-0000-0000000f2803');
update public.profiles set age_range = 'u15', pseudo = 'Jeune34', status = 'active' where id = '00000000-0000-0000-0000-0000000f2810';
delete from public.quick_msg_off;
insert into public.showcase (user_id, ref, card_id, cond, for_trade, for_sale, price_cents, deal, updated_at) values
  ('00000000-0000-0000-0000-0000000f2801', 'ex11-111|FR|NM|', 'ex11-111', 'NM', true, false, null, false, now() - interval '3 hours'),   -- S : Groudon ☆ pour trade
  ('00000000-0000-0000-0000-0000000f2809', 'ex11-111|FR|EX|', 'ex11-111', 'EX', false, true, 45000, false, now() - interval '1 hour'),  -- O : Groudon ☆ à vendre 450 €
  ('00000000-0000-0000-0000-0000000f2810', 'ex11-111|FR|GD|', 'ex11-111', 'GD', true, false, null, false, now()),                      -- J : moins de 15 ans
  ('00000000-0000-0000-0000-0000000f2801', 'base1-4|FR|NM|', 'base1-4', 'NM', true, false, null, true, now()),                         -- S : déjà « d'accord »
  ('00000000-0000-0000-0000-0000000f2801', 'base1-5|FR|NM|', 'base1-5', 'NM', false, false, null, false, now()),                       -- S : seulement montrée
  ('00000000-0000-0000-0000-0000000f2803', 'ex11-111|FR|PL|', 'ex11-111', 'PL', true, false, null, false, now()),                      -- P : la sienne
  ('00000000-0000-0000-0000-0000000f2809', 'sv01-1|FR|NM|', 'sv01-1', 'NM', true, false, null, false, now());                          -- O : sv01-1 pour trade

-- A. Visiteur non connecté refusé.
set role anon;
select pg_temp.check(pg_temp.fails($$select public.showcase_offers(array['ex11-111'])$$, 'permission denied'), 'visiteur non connecté : recherche refusée');
reset role;

-- B. P cherche « Groudon star » (l'app envoie les identifiants trouvés dans son catalogue).
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2803');
set role authenticated;
create temp table r38 as select public.showcase_offers(array['ex11-111', 'base1-4', 'base1-5', 'sv01-1', 'zz-1']) as j;
reset role;
select pg_temp.check((select jsonb_array_length(j) = 3 from r38), '3 exemplaires proposés (2 Groudon ☆, 1 sv01-1)');
select pg_temp.check((select j->0->>'card_id' = 'ex11-111' and j->1->>'card_id' = 'ex11-111' and j->2->>'card_id' = 'sv01-1' from r38), 'ordre des cartes envoyées par l''app respecté');
select pg_temp.check((select j->0->'owner'->>'pseudo' = 'Éléa' and j->1->'owner'->>'pseudo' = 'Sacha28' from r38), 'même carte : vitrine changée le plus récemment d''abord');
select pg_temp.check((select (j->0->>'sale')::boolean and (j->0->>'price_cents')::int = 45000 and j->0->>'cond' = 'EX' and not (j->0->>'trade')::boolean from r38), 'Éléa : à vendre 450 €, état EX');
select pg_temp.check((select (j->1->>'trade')::boolean and (j->1->>'sid') is not null from r38), 'Sacha28 : pour trade, avec l''identifiant de l''exemplaire');
select pg_temp.check((select not exists (select 1 from jsonb_array_elements(j) e where e->'owner'->>'pseudo' in ('Jeune34', 'Pierre28')) from r38), 'ni moins de 15 ans, ni soi-même');
select pg_temp.check((select not exists (select 1 from jsonb_array_elements(j) e where e->>'card_id' in ('base1-4', 'base1-5')) from r38), 'ni carte déjà « d''accord », ni carte seulement montrée');
select pg_temp.check((select j->0->'owner' ? 'id' and j->0->'owner' ? 'avatar' and j->0->'owner' ? 'grade' and position('@' in j::text) = 0 and not (j->0->'owner' ? 'age_range') from r38),
  'dresseur : identifiant, pseudo, avatar, grade ; jamais l''e-mail ni l''âge');
drop table r38;

-- C. Cas limites.
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2803');
set role authenticated;
select pg_temp.check((select public.showcase_offers(array[]::text[]) = '[]'::jsonb and public.showcase_offers(null) = '[]'::jsonb), 'liste vide : aucun résultat');
select pg_temp.check((select public.showcase_offers(array['x''; drop table x;--', '%']) = '[]'::jsonb), 'identifiants invalides ignorés, sans erreur');
select pg_temp.check((select jsonb_array_length(public.showcase_offers(array['ex11-111'], 1)) = 1), 'limite respectée');
select pg_temp.check((select jsonb_array_length(public.showcase_offers(array_cat(array(select 'zz-' || g from generate_series(1, 500) g), array['ex11-111']))) = 0),
  'au plus 400 cartes cherchées (la 501ᵉ est ignorée)');
reset role;
update public.profiles set status = 'suspended' where id = '00000000-0000-0000-0000-0000000f2809';
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2803');
set role authenticated;
select pg_temp.check((select not exists (select 1 from jsonb_array_elements(public.showcase_offers(array['ex11-111'])) e where e->'owner'->>'pseudo' = 'Éléa')), 'compte suspendu : caché');
reset role;
update public.profiles set status = 'active' where id = '00000000-0000-0000-0000-0000000f2809';

-- D. Mise en relation : P demande la carte trouvée (trade_send de 033), S accepte (trade_answer).
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2803');
set role authenticated;
select pg_temp.check((select (public.trade_send('00000000-0000-0000-0000-0000000f2801', 'interest',
    (select (e->>'sid')::bigint from jsonb_array_elements(public.showcase_offers(array['ex11-111'])) e where e->'owner'->>'pseudo' = 'Sacha28'))->>'ok')::boolean), 'P : « Je suis intéressé » sur le Groudon ☆ trouvé');
reset role;
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2801');
set role authenticated;
select pg_temp.check((select (public.quick_msg_state()->>'unread')::int = 1), 'S : 1 proposition non lue');
select pg_temp.check((select (public.trade_answer((public.quick_msg_inbox(30)->'items'->0->>'id')::bigint, 'deal_yes')->>'deal')::boolean), 'S : « Ça m''intéresse » (accord)');
reset role;
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2803');
set role authenticated;
select pg_temp.check((select (public.quick_msg_inbox(30)->'items'->0->>'deal')::boolean and public.quick_msg_inbox(30)->'items'->0->>'kind' = 'answer'), 'P : réponse d''accord reçue');
select pg_temp.check((select not exists (select 1 from jsonb_array_elements(public.showcase_offers(array['ex11-111'])) e where e->'owner'->>'pseudo' = 'Sacha28')), 'carte « d''accord » : plus proposée');
reset role;

-- E. Messages rapides retirés.
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2803');
set role authenticated;
select pg_temp.check(pg_temp.fails($$select public.quick_msg_send('00000000-0000-0000-0000-0000000f2801', 'salut')$$, 'messages rapides ont été retirés'), 'envoyer un message rapide : refusé');
select pg_temp.check(pg_temp.fails($$select public.quick_msg_reply(1, 'merci')$$, 'messages rapides ont été retirés'), 'répondre par un message rapide : refusé');
reset role;
-- Un ancien message rapide (d'avant 038) n'apparaît plus dans « Mes messages » ni dans le compte des non lus.
insert into public.quick_messages (from_id, to_id, code, kind) values ('00000000-0000-0000-0000-0000000f2801', '00000000-0000-0000-0000-0000000f2803', 'salut', 'quick');
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2803');
set role authenticated;
select pg_temp.check((select not exists (select 1 from jsonb_array_elements(public.quick_msg_inbox(30)->'items') e where e->>'kind' = 'quick')), 'Mes messages : plus de message rapide');
select pg_temp.check((select (public.quick_msg_state()->>'unread')::int = 1 and (public.quick_msg_state()->>'v')::int = 38), 'non lus : seulement la réponse d''échange');
reset role;
-- Rejouable : relancer 038 efface les messages rapides et garde les propositions.
\i 038_recherche_cartes.sql
select pg_temp.check((select not exists (select 1 from public.quick_messages where kind = 'quick') and (select count(*) = 2 from public.quick_messages where kind <> 'quick')),
  '038 rejoué : messages rapides effacés, proposition et réponse gardées');
set role anon;
select pg_temp.check(pg_temp.fails($$select public.quick_msg_inbox(30)$$, 'permission denied'), 'visiteur non connecté : boîte refusée');
reset role;
