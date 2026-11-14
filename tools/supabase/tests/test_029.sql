-- Tests de 029_annonces.sql (base de test seulement, après mock_supabase.sql ; indépendant des scripts de jeu).
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
delete from public.listings; delete from public.listing_runs;

-- Passages : le serveur en démarre un, pas un second à moins de 20 minutes.
set role service_role;
select pg_temp.check(public.listings_run_begin('vinted') is not null, 'premier passage accepté');
select pg_temp.check(public.listings_run_begin('vinted') is null, 'second passage à moins de 20 minutes refusé');
select pg_temp.check(public.listings_run_begin('vinted', 0) is not null, 'écart 0 : passage accepté');
select pg_temp.fails($$select public.listings_run_begin('leboncoin')$$, 'source inconnue');

-- Enregistrement : 3 bonnes annonces, 3 mal formées mises de côté.
select pg_temp.check(public.listings_upsert('vinted', $j$[
  {"id":"101","title":"  Mew ex  alt 30 ans ","price":"90.0","total_price":"95.2","currency":"eur","photo":"https://images1.vinted.net/a.jpg","url":"https://www.vinted.fr/items/101-mew","brand":"Pokémon","cond":"Très bon état","is_lot":false,"kind":"card"},
  {"id":"102","title":"Lot 5 cartes pokemon","price":70,"url":"https://www.vinted.fr/items/102","is_lot":true,"lot_count":5,"kind":"lot"},
  {"id":"103","title":"ETB Évolutions Prismatiques","price":"65","url":"https://www.vinted.fr/items/103","photo":"http://pas-sur.fr/x.jpg","kind":"sealed"},
  {"id":"104","title":"","price":"5","url":"https://www.vinted.fr/items/104"},
  {"id":"105","title":"Prix faux","price":"abc","url":"https://www.vinted.fr/items/105"},
  {"id":"1 06","title":"Lien faux","price":"5","url":"javascript:alert(1)"}
]$j$::jsonb, 'carte pokemon') = 3, 'enregistrement : 3 annonces gardées, 3 mal formées mises de côté');
reset role;
select pg_temp.check((select title = 'Mew ex alt 30 ans' and price = 90 and total_price = 95.2 and currency = 'EUR' and kind = 'card' and query = 'carte pokemon' from public.listings where ext_id = '101'), 'titre nettoyé, prix, devise, type');
select pg_temp.check((select is_lot and lot_count = 5 and kind = 'lot' from public.listings where ext_id = '102'), 'lot de 5 cartes');
select pg_temp.check((select photo is null and kind = 'sealed' from public.listings where ext_id = '103'), 'photo non https écartée');

-- Mise à jour : nouveau prix, revue maintenant ; annonce non revue depuis 3 jours inactive ; effacée après 15 jours.
update public.listings set last_seen = now() - interval '3 days', first_seen = now() - interval '3 days' where ext_id = '102';
insert into public.listings (source, ext_id, title, price, url, last_seen) values ('vinted', '199', 'Vieille annonce', 1, 'https://www.vinted.fr/items/199', now() - interval '15 days');
set role service_role;
select pg_temp.check(public.listings_upsert('vinted', '[{"id":"101","title":"Mew ex alt 30 ans","price":"85","url":"https://www.vinted.fr/items/101-mew"}]'::jsonb) = 1, 'mise à jour d''une annonce');
reset role;
select pg_temp.check((select price = 85 and photo = 'https://images1.vinted.net/a.jpg' and active from public.listings where ext_id = '101'), 'prix mis à jour, photo gardée');
select pg_temp.check((select not active from public.listings where ext_id = '102'), 'non revue depuis 2 jours : inactive');
select pg_temp.check(not exists (select 1 from public.listings where ext_id = '199'), 'non revue depuis 14 jours : effacée');
set role service_role;
select pg_temp.check(public.listings_upsert('vinted', '[{"id":"102","title":"Lot 5 cartes pokemon","price":60,"url":"https://www.vinted.fr/items/102","is_lot":true,"lot_count":5}]'::jsonb) = 1, 'annonce revue');
reset role;
select pg_temp.check((select active and first_seen < now() - interval '2 days' from public.listings where ext_id = '102'), 'revue : de nouveau active, première date gardée');
update public.listings set last_seen = now() - interval '3 days' where ext_id = '102';
set role service_role;
select pg_temp.fails($$select public.listings_upsert('vinted', '{"id":"1"}'::jsonb)$$, 'liste attendue');
select public.listings_upsert('vinted', '[]'::jsonb);
reset role;

-- Fin d'un passage et état public.
set role service_role;
select public.listings_run_end((select max(id) from public.listing_runs), true, 12, 3, '{"message":"3 annonces"}'::jsonb);
reset role;

-- Visiteur et joueur : lisent les annonces actives, rien d'autre.
set role anon;
select pg_temp.check((select count(*) from public.listings) = 2, 'visiteur : seulement les annonces actives');
select pg_temp.check((select (public.listings_status()->'vinted'->>'active')::int = 2 and public.listings_status()->'vinted'->'last_run'->>'message' = '3 annonces' and public.listings_status()->'vinted'->>'last_ok' is not null), 'état public : nombre et dernier passage');
select pg_temp.fails($$select * from public.listing_runs$$, 'visiteur lit les passages');
select pg_temp.fails($$select query from public.listings$$, 'visiteur lit la recherche d''origine');
select pg_temp.fails($$insert into public.listings (source, ext_id, title, price, url) values ('vinted', 'x', 'x', 1, 'https://x.fr')$$, 'visiteur ajoute une annonce');
select pg_temp.fails($$select public.listings_upsert('vinted', '[]'::jsonb)$$, 'visiteur enregistre des annonces');
select pg_temp.fails($$select public.listings_run_begin('vinted', 0)$$, 'visiteur démarre un passage');
reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000a', false);
set role authenticated;
select pg_temp.check((select count(*) from public.listings) = 2, 'joueur : seulement les annonces actives');
select pg_temp.fails($$update public.listings set price = 0$$, 'joueur modifie une annonce');
select pg_temp.fails($$delete from public.listings$$, 'joueur efface une annonce');
reset role;
select pg_temp.check((select count(*) from public.listings where source = 'vinted') = 3, 'rien modifié par le visiteur ni le joueur');
