-- Tests de 021_avatar_v2.sql (après test_020).
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

select pg_temp.check((select count(*) from public.avatar_items) = 26 and (select price_pa from public.avatar_items where id = 'shiny:1') = 300, '26 styles PRO, shiny à 300 PA');
-- Joueur c1 (test_014) : 500 PA, pas Premium.
update public.wallets set pa = 500 where user_id = '00000000-0000-0000-0000-0000000000c1';
delete from public.premium where user_id = '00000000-0000-0000-0000-0000000000c1';
delete from public.avatar_unlocks where user_id = '00000000-0000-0000-0000-0000000000c1' and (item like 'acc:%' or item = 'shiny:1');
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000c1', false);
set role authenticated;
select set_config('t.r', public.avatar_save('{"skin":"s3","face":"rond","eyes":"grands","hair":"court","hc":"brun","outfit":"tshirt","bg":"type","pos":"behind","size":100,"poke":25,"poke2":0,"px":12.4,"py":130,"acc":"casquette","ax":200,"ay":-5,"asz":20}'::jsonb)::text, false);
select pg_temp.check((current_setting('t.r')::jsonb->>'px')::int = 12 and (current_setting('t.r')::jsonb->>'py')::int = 110, 'place libre gardée et bornée (12, 110)');
select pg_temp.check(current_setting('t.r')::jsonb->>'acc' = 'casquette' and (current_setting('t.r')::jsonb->>'ax')::int = 80 and (current_setting('t.r')::jsonb->>'ay')::int = -5 and (current_setting('t.r')::jsonb->>'asz')::int = 50, 'casquette gratuite, décalage et taille bornés');
select pg_temp.check(current_setting('t.r')::jsonb->>'shiny' = 'false' and current_setting('t.r')::jsonb->>'pos' = 'behind', 'pas shiny, derrière le dresseur');
select pg_temp.fails($$select public.avatar_save('{"skin":"s3","face":"rond","eyes":"grands","hair":"court","hc":"brun","outfit":"tshirt","bg":"type","pos":"right","size":100,"poke":25,"shiny":true}'::jsonb)$$, 'shiny (PRO) sans l''avoir débloqué');
select pg_temp.fails($$select public.avatar_save('{"skin":"s3","face":"rond","eyes":"grands","hair":"court","hc":"brun","outfit":"tshirt","bg":"type","pos":"right","size":100,"poke":25,"acc":"couronne"}'::jsonb)$$, 'couronne (PRO) sans l''avoir débloquée');
select pg_temp.fails($$select public.avatar_save('{"skin":"s3","face":"rond","eyes":"grands","hair":"court","hc":"brun","outfit":"tshirt","bg":"type","pos":"right","size":100,"poke":25,"acc":"chapeau"}'::jsonb)$$, 'accessoire inconnu');
select pg_temp.check((public.avatar_buy('shiny:1', gen_random_uuid())->>'pa_after')::int = 200, 'shiny débloqué : 300 PA débités (500 → 200)');
select pg_temp.check((public.avatar_save('{"skin":"s3","face":"rond","eyes":"grands","hair":"court","hc":"brun","outfit":"tshirt","bg":"type","pos":"right","size":100,"poke":25,"shiny":true}'::jsonb)->>'shiny')::boolean, 'shiny débloqué : enregistré');
select pg_temp.check(not (public.avatar_state()->'avatar' ? 'px'), 'sans place libre : pas de px (place prédéfinie)');
reset role;
-- Premium : couronne sans achat.
insert into public.premium (user_id, plan, status, period_end) values ('00000000-0000-0000-0000-0000000000c1', 'quarter', 'active', now() + interval '80 days')
  on conflict (user_id) do update set plan = 'quarter', status = 'active', period_end = now() + interval '80 days';
set role authenticated;
select pg_temp.check(public.avatar_save('{"skin":"s3","face":"rond","eyes":"grands","hair":"court","hc":"brun","outfit":"tshirt","bg":"type","pos":"right","size":100,"poke":25,"acc":"couronne"}'::jsonb)->>'acc' = 'couronne', 'Premium (trimestriel) : couronne enregistrée sans achat');
reset role;
delete from public.premium where user_id = '00000000-0000-0000-0000-0000000000c1';
