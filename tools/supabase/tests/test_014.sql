-- Tests de 014_avatar.sql (après test_013).
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

select pg_temp.check((select count(*) from public.avatar_items) = 21 and (select price_pa from public.avatar_items where id = 'slot:2') = 300, '21 styles PRO, coup de cœur à 300 PA');
-- Joueur Alpha (c1, compte confirmé) avec 400 PA, pas Premium ; Pikachu (25) offert.
update auth.users set email_confirmed_at = now() where id = '00000000-0000-0000-0000-0000000000c1';
update public.wallets set pa = 400 where user_id = '00000000-0000-0000-0000-0000000000c1';
delete from public.premium where user_id = '00000000-0000-0000-0000-0000000000c1';
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000c1', false);
set role authenticated;
select pg_temp.check((public.avatar_state()->'owned') = '[]'::jsonb and public.avatar_state()->'avatar' = 'null'::jsonb, 'au départ : aucun style acheté, pas d''avatar');
select pg_temp.check((public.avatar_save('{"skin":"s3","face":"rond","eyes":"grands","hair":"court","hc":"brun","outfit":"tshirt","bg":"type","pos":"right","size":100,"poke":25,"poke2":0}'::jsonb)->>'poke')::int = 25, 'avatar sans style PRO : enregistré');
select pg_temp.fails($$select public.avatar_save('{"skin":"s3","face":"rond","eyes":"grands","hair":"court","hc":"brun","outfit":"tshirt","bg":"holo","pos":"right","size":100,"poke":25}'::jsonb)$$, 'fond Holo (PRO) sans l''avoir débloqué');
select pg_temp.fails($$select public.avatar_save('{"skin":"s3","face":"rond","eyes":"grands","hair":"court","hc":"brun","outfit":"tshirt","bg":"type","pos":"right","size":100,"poke":150}'::jsonb)$$, 'Mewtwo pas encore débloqué dans le Pokédex');
select pg_temp.fails($$select public.avatar_save('{"skin":"<script>","face":"rond","eyes":"grands","hair":"court","hc":"brun","outfit":"tshirt","bg":"type","pos":"right","size":100,"poke":25}'::jsonb)$$, 'valeur farfelue (texte libre)');
select pg_temp.fails($$select public.avatar_save('{"skin":"s3","face":"rond","eyes":"grands","hair":"court","hc":"brun","outfit":"tshirt","bg":"type","pos":"right","size":100,"poke":25,"poke2":4}'::jsonb)$$, '2ᵉ Pokémon (coup de cœur PRO) sans l''avoir débloqué');
select pg_temp.check((public.avatar_buy('bg:holo', gen_random_uuid())->>'pa_after')::int = 250, 'Holo acheté : 150 PA débités (400 → 250)');
select pg_temp.fails($$select public.avatar_buy('bg:holo', gen_random_uuid())$$, 'Holo acheté deux fois');
select pg_temp.fails($$select public.avatar_buy('slot:2', gen_random_uuid()) from (select 1) x where (select pa from public.wallets where user_id = auth.uid()) >= 0 and public.avatar_buy('outfit:cape', gen_random_uuid()) is not null$$, 'pas assez de PA (cape 250 puis coup de cœur 300)');
select pg_temp.fails($$select public.avatar_buy('bg:inconnu', gen_random_uuid())$$, 'style inconnu');
select pg_temp.check((public.avatar_save('{"skin":"s3","face":"rond","eyes":"grands","hair":"court","hc":"brun","outfit":"tshirt","bg":"holo","pos":"shoulder","size":500,"poke":25,"extra":"x"}'::jsonb)->>'size')::int = 140, 'Holo débloqué : enregistré ; taille bornée à 140, clé inconnue ignorée');
select pg_temp.check(public.avatar_state()->'owned' ? 'bg:holo' and public.avatar_state()->'avatar'->>'bg' = 'holo' and not (public.avatar_state()->'avatar' ? 'extra'), 'état : Holo acheté, avatar gardé');
select pg_temp.fails($$update public.profiles set avatar = '{"bg":"volcan"}' where id = auth.uid()$$, 'écrire son avatar sans vérification');
select pg_temp.fails($$insert into public.avatar_unlocks (user_id, item) values (auth.uid(), 'bg:volcan')$$, 's''offrir un style');
select pg_temp.fails($$update public.avatar_items set price_pa = 1$$, 'changer le prix d''un style');
select pg_temp.check((select pa from public.wallets where user_id = auth.uid()) = 250, 'solde inchangé par les essais refusés');
reset role;
select pg_temp.check((select count(*) from public.ledger where user_id = '00000000-0000-0000-0000-0000000000c1' and kind = 'avatar') = 1, 'journal : un achat « avatar »');
-- Premium : tout est ouvert sans achat.
insert into public.premium (user_id, status, period_end) values ('00000000-0000-0000-0000-0000000000c3', 'active', now() + interval '20 days')
  on conflict (user_id) do update set status = 'active', period_end = now() + interval '20 days';
update auth.users set email_confirmed_at = now() where id = '00000000-0000-0000-0000-0000000000c3';
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000c3', false);
set role authenticated;
select pg_temp.check((public.avatar_save('{"skin":"or","face":"carre","eyes":"etoiles","hair":"crete","hc":"violet","outfit":"cape","bg":"volcan","pos":"behind","size":120,"poke":25,"poke2":1}'::jsonb)->>'outfit') = 'cape', 'Premium : tous les styles PRO sans achat (avec un coup de cœur)');
-- Classement : l'avatar de chaque joueur.
select pg_temp.check((select e->'avatar'->>'bg' from jsonb_array_elements(public.season_board(50)->'top') e where e->>'pseudo' = 'Alpha') = 'holo', 'classement : avatar d''Alpha (fond Holo)');
reset role;
