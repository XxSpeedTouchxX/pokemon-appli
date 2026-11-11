-- Tests de 022_avatar_v3.sql (après test_021).
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

-- Prix des Pokémon d'avatar : 1re forme 25, 2e 50, 3e 100, légendaires 300, Kyogre/Groudon/Rayquaza 500, méga 200 ;
-- shiny : le double.
select pg_temp.check((select price_pa from public.avatar_items where id = 'poke:1') = 25 and (select price_pa from public.avatar_items where id = 'poke:2') = 50
  and (select price_pa from public.avatar_items where id = 'poke:3') = 100, 'Bulbizarre 25, Herbizarre 50, Florizarre 100 PA');
select pg_temp.check((select price_pa from public.avatar_items where id = 'poke:25') = 25 and (select price_pa from public.avatar_items where id = 'poke:26') = 50, 'Pikachu 25, Raichu 50 PA');
select pg_temp.check((select price_pa from public.avatar_items where id = 'poke:150') = 300 and (select price_pa from public.avatar_items where id = 'poke:144') = 300
  and (select price_pa from public.avatar_items where id = 'poke:380') = 300, 'légendaires 300 PA (Mewtwo, Artikodin, Latias)');
select pg_temp.check((select count(*) from public.avatar_items where id in ('poke:382', 'poke:383', 'poke:384') and price_pa = 500) = 3, 'Kyogre, Groudon, Rayquaza 500 PA');
select pg_temp.check((select price_pa from public.avatar_items where id = 'poke:10034') = 200, 'méga-évolution 200 PA');
select pg_temp.check((select price_pa from public.avatar_items where id = 'shiny:6') = 200 and (select price_pa from public.avatar_items where id = 'shiny:383') = 1000, 'shiny : le double (Dracaufeu 200, Groudon 1 000 PA)');
select pg_temp.check((select count(*) from public.avatar_items where id like 'poke:%') = (select count(*) from public.game_pokemon), 'un prix pour chaque Pokémon du jeu');
select pg_temp.check((select price_pa from public.avatar_items where id = 'frame:tempete') = 250 and (select count(*) from public.avatar_items where id like 'frame:%') = 11, '11 cadres PRO');
-- L'avatar déjà enregistré de c1 (Pikachu, test_021) garde son Pokémon.
select pg_temp.check(exists (select 1 from public.avatar_unlocks where user_id = '00000000-0000-0000-0000-0000000000c1' and item = 'poke:25'), 'Pokémon de l''avatar déjà enregistré offert');
select pg_temp.check(exists (select 1 from public.avatar_unlocks where user_id = '00000000-0000-0000-0000-0000000000c1' and item = 'shiny:25') and not exists (select 1 from public.avatar_unlocks where user_id = '00000000-0000-0000-0000-0000000000c1' and item = 'shiny:1'), 'ancien shiny (v2) converti en Pikachu shiny');

-- Joueur c1 : 1 000 PA, pas Premium.
update public.wallets set pa = 1000 where user_id = '00000000-0000-0000-0000-0000000000c1';
delete from public.premium where user_id = '00000000-0000-0000-0000-0000000000c1';
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000c1', false);
set role authenticated;
-- Avatar de départ : sans Pokémon, cheveux noirs en pics, fond jaune.
select set_config('t.r', public.avatar_save('{"skin":"s3","face":"rond","eyes":"grands","hair":"pics","hc":"noir","outfit":"tshirt","bg":"jaune","pos":"right","size":100,"poke":0}'::jsonb)::text, false);
select pg_temp.check((current_setting('t.r')::jsonb->>'poke')::int = 0 and current_setting('t.r')::jsonb->>'frame' = 'aucun' and current_setting('t.r')::jsonb->>'aon' = 'poke'
  and not (current_setting('t.r')::jsonb ? 'poke2'), 'avatar sans Pokémon accepté, cadre « aucun », plus de coup de cœur');
-- Pokémon du Pokédex mais pas de l'avatar : refusé (c1 a Bulbizarre au Pokédex, test_004).
select pg_temp.fails($$select public.avatar_save('{"skin":"s3","face":"rond","eyes":"grands","hair":"pics","hc":"noir","outfit":"tshirt","bg":"jaune","pos":"right","size":100,"poke":1}'::jsonb)$$, 'Pokémon non débloqué pour l''avatar');
select pg_temp.fails($$select public.avatar_buy('shiny:1', gen_random_uuid())$$, 'shiny avant le Pokémon');
select pg_temp.check((public.avatar_buy('poke:1', gen_random_uuid())->>'pa_after')::int = 975, 'Bulbizarre d''avatar : 25 PA (1 000 → 975)');
select pg_temp.check((public.avatar_buy('shiny:1', gen_random_uuid())->>'pa_after')::int = 925, 'Bulbizarre shiny : 50 PA (975 → 925)');
select set_config('t.r', public.avatar_save('{"skin":"s3","face":"rond","eyes":"grands","hair":"pics","hc":"noir","outfit":"tshirt","bg":"jaune","pos":"right","size":100,"poke":1,"shiny":true,"acc":"casquette","aon":"perso","ax":-900,"ay":350,"asz":4000}'::jsonb)::text, false);
select pg_temp.check((current_setting('t.r')::jsonb->>'poke')::int = 1 and (current_setting('t.r')::jsonb->>'shiny')::boolean, 'Bulbizarre shiny enregistré');
select pg_temp.check(current_setting('t.r')::jsonb->>'aon' = 'perso' and (current_setting('t.r')::jsonb->>'ax')::int = -400 and (current_setting('t.r')::jsonb->>'ay')::int = 350
  and (current_setting('t.r')::jsonb->>'asz')::int = 4000, 'accessoire sur moi, taille 4 000 % gardée, décalage borné à -400');
select pg_temp.fails($$select public.avatar_save('{"skin":"s3","face":"rond","eyes":"grands","hair":"pics","hc":"noir","outfit":"tshirt","bg":"jaune","pos":"right","size":100,"poke":4,"shiny":true}'::jsonb)$$, 'shiny d''un Pokémon non débloqué');
select pg_temp.fails($$select public.avatar_save('{"skin":"s3","face":"rond","eyes":"grands","hair":"pics","hc":"noir","outfit":"tshirt","bg":"jaune","pos":"right","size":100,"poke":0,"frame":"tempete"}'::jsonb)$$, 'cadre PRO sans l''avoir débloqué');
select pg_temp.fails($$select public.avatar_save('{"skin":"s3","face":"rond","eyes":"grands","hair":"pics","hc":"noir","outfit":"tshirt","bg":"jaune","pos":"right","size":100,"poke":0,"frame":"licorne"}'::jsonb)$$, 'cadre inconnu');
select pg_temp.fails($$select public.avatar_save('{"skin":"s3","face":"rond","eyes":"grands","hair":"pics","hc":"noir","outfit":"tshirt","bg":"jaune","pos":"right","size":100,"poke":0,"aon":"tete"}'::jsonb)$$, 'place d''accessoire inconnue');
select pg_temp.check(public.avatar_save('{"skin":"s3","face":"rond","eyes":"grands","hair":"pics","hc":"noir","outfit":"tshirt","bg":"jaune","pos":"right","size":100,"poke":0,"frame":"dore"}'::jsonb)->>'frame' = 'dore', 'cadre doré (gratuit) enregistré');
reset role;
-- Premium (2026-11-11, porteur) : tout le mode avatar ouvert, Pokémon d'avatar et shiny compris.
insert into public.premium (user_id, plan, status, period_end) values ('00000000-0000-0000-0000-0000000000c1', 'month', 'active', now() + interval '20 days')
  on conflict (user_id) do update set plan = 'month', status = 'active', period_end = now() + interval '20 days';
set role authenticated;
select pg_temp.check(public.avatar_save('{"skin":"s3","face":"rond","eyes":"grands","hair":"pics","hc":"noir","outfit":"tshirt","bg":"jaune","pos":"right","size":100,"poke":0,"frame":"lave"}'::jsonb)->>'frame' = 'lave', 'Premium : cadre lave sans achat');
select set_config('t.r', public.avatar_save('{"skin":"s3","face":"rond","eyes":"grands","hair":"pics","hc":"noir","outfit":"tshirt","bg":"jaune","pos":"right","size":3000,"poke":383,"shiny":true,"prot":-90,"arot":725}'::jsonb)::text, false);
select pg_temp.check((current_setting('t.r')::jsonb->>'poke')::int = 383 and (current_setting('t.r')::jsonb->>'shiny')::boolean, 'Premium : Groudon shiny d''avatar sans achat');
select pg_temp.check((current_setting('t.r')::jsonb->>'size')::int = 3000 and (current_setting('t.r')::jsonb->>'prot')::int = 270 and (current_setting('t.r')::jsonb->>'arot')::int = 5, 'taille 3 000 %, rotations ramenées entre 0 et 359° (270, 5)');
select pg_temp.fails($$select public.avatar_save('{"skin":"s3","face":"rond","eyes":"grands","hair":"pics","hc":"noir","outfit":"tshirt","bg":"jaune","pos":"right","size":100,"poke":9999}'::jsonb)$$, 'Pokémon inconnu');
reset role;
delete from public.premium where user_id = '00000000-0000-0000-0000-0000000000c1';
