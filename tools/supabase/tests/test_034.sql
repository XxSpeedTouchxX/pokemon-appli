-- Tests de 034_recherche_dresseurs.sql (après test_033) : rechercher un dresseur, vitrines des dresseurs.
-- Chaque ligne « OK » est une vérification réussie ; le script s'arrête à la première erreur.
\set ON_ERROR_STOP 1
reset role;
create or replace function pg_temp.check(ok boolean, label text) returns text language plpgsql as $$
begin if not ok then raise exception 'ÉCHEC : %', label; end if; return 'OK ' || label; end; $$;
create or replace function pg_temp.fails(q text, msg text) returns boolean language plpgsql as $$
begin execute q; return false; exception when others then return position(msg in sqlerrm) > 0; end; $$;
create or replace function pg_temp.as_user(u text) returns void language sql as $$ select set_config('request.jwt.claim.sub', u, false) $$;
grant execute on function pg_temp.check(boolean, text), pg_temp.fails(text, text) to authenticated, anon;
-- Comptes : S (f2801, Sacha28), O (f2809, Éléa), P (f2803, Pierre28), J (f2810, moins de 15 ans), A (f2808, Admin28, admin).
delete from public.showcase;
update public.profiles set age_range = '25-35', status = 'active' where id in ('00000000-0000-0000-0000-0000000f2801', '00000000-0000-0000-0000-0000000f2809', '00000000-0000-0000-0000-0000000f2803');
update public.profiles set age_range = 'u15', pseudo = 'Jeune34' where id = '00000000-0000-0000-0000-0000000f2810';
insert into public.showcase (user_id, ref, card_id, for_trade, for_sale, price_cents, updated_at) values
  ('00000000-0000-0000-0000-0000000f2801', 'base1-4|FR|NM|', 'base1-4', true, false, null, now() - interval '2 hours'),
  ('00000000-0000-0000-0000-0000000f2801', 'base1-5|FR|NM|', 'base1-5', false, false, null, now() - interval '2 hours'),
  ('00000000-0000-0000-0000-0000000f2809', 'sv01-1|FR|NM|', 'sv01-1', false, true, 1500, now() - interval '1 hour'),
  ('00000000-0000-0000-0000-0000000f2810', 'base1-6|FR|NM|', 'base1-6', false, false, null, now());

-- A. Visiteur non connecté refusé.
set role anon;
select pg_temp.check(pg_temp.fails($$select public.player_search('')$$, 'permission denied'), 'visiteur non connecté : recherche refusée');
reset role;

-- B. Vitrines des dresseurs (recherche vide), vues par P (sans vitrine).
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2803');
set role authenticated;
create temp table r34 as select public.player_search('') as j;
reset role;
select pg_temp.check((select jsonb_array_length(j) = 2 from r34), 'vitrines : 2 dresseurs (S et O ; ni J, moins de 15 ans, ni P lui-même, ni les comptes sans vitrine)');
select pg_temp.check((select j->0->>'pseudo' = 'Éléa' and j->1->>'pseudo' = 'Sacha28' from r34), 'vitrines : la plus récemment changée en premier (Éléa, puis Sacha28)');
select pg_temp.check((select (j->0->>'cards')::int = 1 and (j->0->>'sale')::int = 1 and (j->0->>'trade')::int = 0 from r34), 'Éléa : 1 carte, à vendre');
select pg_temp.check((select (j->1->>'cards')::int = 2 and (j->1->>'trade')::int = 1 and (j->1->>'sale')::int = 0 from r34), 'Sacha28 : 2 cartes, dont 1 Pour trade');
select pg_temp.check((select j->0 ? 'id' and j->0 ? 'avatar' and j->0 ? 'grade' and not (j->0 ? 'email') and not (j->0 ? 'age_range') and not (j->0 ? 'role') and position('@' in j::text) = 0 from r34),
  'résultat : identifiant, avatar, grade ; jamais l''e-mail, l''âge ni le rôle');
drop table r34;

-- C. Recherche par pseudo.
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2803');
set role authenticated;
select pg_temp.check((select jsonb_array_length(public.player_search('SACHA')) = 1 and public.player_search('SACHA')->0->>'pseudo' = 'Sacha28'), 'pseudo trouvé sans tenir compte des majuscules');
select pg_temp.check((select public.player_search('cha2')->0->>'pseudo' = 'Sacha28'), 'pseudo trouvé par un morceau du milieu');
select pg_temp.check((select exists (select 1 from jsonb_array_elements(public.player_search('Admin28')) e where e->>'pseudo' = 'Admin28')), 'compte admin trouvable');
select pg_temp.check((select exists (select 1 from jsonb_array_elements(public.player_search('Pierre')) e where e->>'pseudo' = 'Pierre28')) = false, 'soi-même absent des résultats');
select pg_temp.check((select jsonb_array_length(public.player_search('jeune')) = 0), 'moins de 15 ans : jamais dans la recherche');
select pg_temp.check((select jsonb_array_length(public.player_search('%')) = 0 and jsonb_array_length(public.player_search('_')) > 0
    and not exists (select 1 from jsonb_array_elements(public.player_search('_')) e where position('_' in e->>'pseudo') = 0)), '« % » et « _ » cherchés tels quels (pas de joker)');
select pg_temp.check((select jsonb_array_length(public.player_search('Sacha28', 1)) = 1), 'limite respectée');
reset role;
-- Pseudo exact avant les pseudos qui le contiennent.
insert into auth.users (id, email, email_confirmed_at, created_at) values ('00000000-0000-0000-0000-0000000f3401', 'sacha34@gmail.com', now(), now()) on conflict do nothing;
update public.profiles set pseudo = 'ZSacha', age_range = '15-25' where id = '00000000-0000-0000-0000-0000000f3401';
insert into auth.users (id, email, email_confirmed_at, created_at) values ('00000000-0000-0000-0000-0000000f3402', 'sacha35@gmail.com', now(), now()) on conflict do nothing;
update public.profiles set pseudo = 'Sacha', age_range = '15-25' where id = '00000000-0000-0000-0000-0000000f3402';
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2803');
set role authenticated;
select pg_temp.check((select public.player_search('sacha')->0->>'pseudo' = 'Sacha' and public.player_search('sacha')->1->>'pseudo' = 'Sacha28' and public.player_search('sacha')->2->>'pseudo' = 'ZSacha'),
  'ordre : pseudo exact, puis qui commence par, puis qui contient');
select pg_temp.check((select jsonb_array_length(public.player_search(repeat('a', 200))) = 0), 'texte trop long coupé à 24 caractères, sans erreur');
reset role;

-- D. Comptes suspendus ou sans pseudo cachés.
update public.profiles set status = 'suspended' where id = '00000000-0000-0000-0000-0000000f2809';
update public.profiles set pseudo = null where id = '00000000-0000-0000-0000-0000000f3401';
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2803');
set role authenticated;
select pg_temp.check((select not exists (select 1 from jsonb_array_elements(public.player_search('')) e where e->>'pseudo' = 'Éléa')), 'compte suspendu : caché');
select pg_temp.check((select jsonb_array_length(public.player_search('zsacha')) = 0), 'compte sans pseudo : caché');
reset role;
update public.profiles set status = 'active' where id = '00000000-0000-0000-0000-0000000f2809';

-- E. Un résultat ouvre sa vitrine (033) : mêmes cartes.
select pg_temp.as_user('00000000-0000-0000-0000-0000000f2803');
set role authenticated;
select pg_temp.check((select jsonb_array_length(public.player_showcase((public.player_search('Sacha28')->0->>'id')::uuid)->'items') = 2), 'le résultat ouvre la vitrine de Sacha28 (2 cartes)');
reset role;

-- F. Rejouable.
\i 034_recherche_dresseurs.sql
select pg_temp.check(to_regprocedure('public.player_search(text,integer)') is not null, '034 rejoué');
delete from public.showcase;
update public.profiles set pseudo = null where id in ('00000000-0000-0000-0000-0000000f3401', '00000000-0000-0000-0000-0000000f3402');
update public.profiles set age_range = null where id in ('00000000-0000-0000-0000-0000000f2801', '00000000-0000-0000-0000-0000000f2809', '00000000-0000-0000-0000-0000000f2803', '00000000-0000-0000-0000-0000000f2810');
