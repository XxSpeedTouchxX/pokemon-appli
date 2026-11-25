-- Tests de 043_mail_joueur_lot.sql (après test_042, sur une base où 012 et 042 sont installés) : e-mail de félicitations
-- au joueur après un achat direct (booster, item rare, ETB), jamais pour un ticket, une seule fois par achat.
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

-- A. Installé, achats d'avant 043 jamais envoyés.
select pg_temp.check(obj_description('public.shop_player_mails'::regclass, 'pg_class') like '043%', '043 installé (repère de 000_verifier.sql)');
update public.shop_player_mail_start set since = clock_timestamp();
select pg_temp.check(jsonb_array_length(public.shop_player_pending(50)) = 0, 'achats d''avant l''installation : pas d''e-mail');

-- B. Un ticket, un booster payé, un item rare choisi, un ETB acheté en mode Admin (0 PK).
insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000043a1', 'joueur43@gmail.com'), ('00000000-0000-0000-0000-0000000043b1', 'admin43@gmail.com') on conflict do nothing;
update public.profiles set pseudo = 'Ondine43' where id = '00000000-0000-0000-0000-0000000043a1';
insert into public.tickets (user_id, item, cost_pk, draw_at) values ('00000000-0000-0000-0000-0000000043a1', 'ticket-bronze', 500, public._game_next_draw('2w', now()));
insert into public.tickets (user_id, item, cost_pk) values ('00000000-0000-0000-0000-0000000043a1', 'achat-booster', 10000);
insert into public.tickets (user_id, item, cost_pk, choice) values ('00000000-0000-0000-0000-0000000043a1', 'achat-rare', 25000, 'Poster');
insert into public.tickets (user_id, item, cost_pk) values ('00000000-0000-0000-0000-0000000043b1', 'achat-etb-30', 0);
select pg_temp.check(jsonb_array_length(public.shop_player_pending(50)) = 3, 'les 3 achats directs à écrire, pas le ticket');
select pg_temp.check(not exists (select 1 from jsonb_array_elements(public.shop_player_pending(50)) e where e->>'item' like 'ticket-%'), 'jamais d''e-mail pour un ticket de tirage');
select pg_temp.check((select e->>'email' = 'joueur43@gmail.com' and e->>'pseudo' = 'Ondine43' and (e->>'cost_pk')::int = 10000 and (e->>'price_pk')::int = 10000
  from jsonb_array_elements(public.shop_player_pending(50)) e where e->>'item' = 'achat-booster'), 'booster : e-mail, pseudo, PK payés et prix');
select pg_temp.check((select e->>'choice' = 'Poster' from jsonb_array_elements(public.shop_player_pending(50)) e where e->>'item' = 'achat-rare'), 'item rare : item choisi');
select pg_temp.check((select (e->>'cost_pk')::int = 0 and (e->>'price_pk')::int = (select price_pk from public.game_items where id = 'achat-etb-30')
  from jsonb_array_elements(public.shop_player_pending(50)) e where e->>'item' = 'achat-etb-30'), 'achat d''admin (0 PK) : vrai prix de l''article donné');
select pg_temp.check((select string_agg(e->>'item', ',' order by ord) from jsonb_array_elements(public.shop_player_pending(50)) with ordinality as a(e, ord)) = 'achat-booster,achat-rare,achat-etb-30', 'du plus ancien au plus récent');
select pg_temp.check(jsonb_array_length(public.shop_player_pending(2)) = 2, 'limite respectée');

-- C. Un joueur ne lit pas la liste et ne marque rien.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000043a1', false);
set role authenticated;
select pg_temp.fails($$select public.shop_player_pending(50)$$, 'un joueur lit la liste');
select pg_temp.fails($$select public.shop_player_mark_sent(array[gen_random_uuid()])$$, 'un joueur marque un e-mail comme envoyé');
select pg_temp.fails($$select * from public.shop_player_mails$$, 'un joueur lit les e-mails envoyés');
reset role;
set role anon;
select pg_temp.fails($$select public.shop_player_pending(50)$$, 'un visiteur lit la liste');
reset role;

-- D. Le serveur marque les e-mails envoyés : ils ne repartent plus ; l'e-mail à Dropicards (012) reste à part.
set role service_role;
select pg_temp.check(public.shop_player_mark_sent((select array_agg((e->>'id')::uuid) from jsonb_array_elements(public.shop_player_pending(2)) e)) = 2, '2 e-mails marqués');
select pg_temp.check(jsonb_array_length(public.shop_player_pending(50)) = 1, 'il en reste 1');
select pg_temp.check(public.shop_player_mark_sent((select array_agg((e->>'id')::uuid) from jsonb_array_elements(public.shop_player_pending(50)) e)) = 1, 'le dernier marqué');
select pg_temp.check(jsonb_array_length(public.shop_player_pending(50)) = 0, 'tout est envoyé, rien en double');
select pg_temp.check(public.shop_player_mark_sent(array[gen_random_uuid()]) = 0, 'identifiant inconnu ignoré');
select pg_temp.check((select count(*) from jsonb_array_elements(public.shop_pending(50)) e where e->>'user_id' in ('00000000-0000-0000-0000-0000000043a1', '00000000-0000-0000-0000-0000000043b1')) = 4, 'e-mail à Dropicards (012) indépendant : les 4 achats toujours à signaler');
reset role;

-- E. Rejouable ; achats effacés (comme à la suppression du compte, 017) : leurs e-mails envoyés partent avec eux.
\i 043_mail_joueur_lot.sql
select pg_temp.check((select count(*) from public.shop_player_mails m join public.tickets t on t.id = m.ticket_id where t.user_id = '00000000-0000-0000-0000-0000000043a1') = 2, 'rejoué : rien perdu');
delete from public.tickets where user_id = '00000000-0000-0000-0000-0000000043a1';
select pg_temp.check(not exists (select 1 from public.shop_player_mails m left join public.tickets t on t.id = m.ticket_id where t.id is null)
  and (select count(*) from public.shop_player_mails) >= 1, 'achats effacés : leurs e-mails envoyés aussi, les autres restent');
select 'test_043 : tout est bon' as fin;
