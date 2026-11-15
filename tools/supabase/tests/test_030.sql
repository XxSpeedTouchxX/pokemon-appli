-- Tests de 030_tirages_cartes.sql (après test_018 à test_023) : une carte déjà choisie peut être retirée, les tickets
-- concernés restent valables et leur joueur rechoisit une carte du tirage.
\set ON_ERROR_STOP 1
reset role;
create or replace function pg_temp.check(ok boolean, label text) returns text language plpgsql as $$
begin if not ok then raise exception 'ÉCHEC : %', label; end if; return 'OK ' || label; end; $$;
create or replace function pg_temp.fails(q text, label text) returns text language plpgsql as $$
begin
  begin execute q; exception when others then return 'OK ' || label || ' (refusé : ' || left(sqlerrm, 90) || ')'; end;
  raise exception 'ÉCHEC : % (accepté)', label;
end; $$;
create or replace function pg_temp.err(q text) returns text language plpgsql as $$
begin
  begin execute q; exception when others then return sqlerrm; end;
  return '';
end; $$;
grant execute on function pg_temp.check(boolean, text), pg_temp.fails(text, text), pg_temp.err(text) to authenticated, anon, service_role;
update public.game_throttle set n = 0;
-- Admin « ad » déverrouillé pour ces tests (mot de passe des admins, 007), reverrouillé à la fin.
insert into public.admin_unlocks values ('00000000-0000-0000-0000-0000000000ad', now() + interval '1 hour') on conflict (user_id) do update set until = excluded.until;

-- État de départ (test_018) : le joueur f05 a des tickets Bronze pour Dracaufeu-ex au prochain tirage.
select set_config('t.n', (select count(*)::text from public.tickets where user_id = '00000000-0000-0000-0000-0000000f0005' and item = 'ticket-bronze'
  and choice = 'sv03.5-199' and draw_at > now()), false);
select pg_temp.check(current_setting('t.n')::int > 0, 'départ : ' || current_setting('t.n') || ' ticket(s) de f05 pour Dracaufeu-ex');
select set_config('t.all', (select count(*)::text from public.tickets where item = 'ticket-bronze' and choice = 'sv03.5-199' and draw_at > now()), false);

-- A. Un joueur ne retire rien.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f0005', false);
set role authenticated;
select pg_temp.fails($$select public.admin_prize_remove((select id from public.draw_prizes where card = 'sv03.5-199'))$$, 'joueur : retirer une carte du tirage');
reset role;

-- B. L'admin retire Dracaufeu-ex, déjà choisi : accepté, les tickets sont à rechoisir.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000ad', false);
set role authenticated;
select pg_temp.check((select (r->>'ok')::boolean and (r->>'rechoose')::int = current_setting('t.all')::int
  from (select public.admin_prize_remove((select id from public.draw_prizes where card = 'sv03.5-199')) r) x), 'admin : carte déjà choisie retirée (' || current_setting('t.all') || ' ticket(s) à rechoisir, tous joueurs)');
select pg_temp.check(not exists (select 1 from public.draw_prizes where card = 'sv03.5-199'), 'la carte n''est plus au tirage');
select pg_temp.check((select count(*) from public.admin_draw_entries() where user_id = '00000000-0000-0000-0000-0000000f0005' and item = 'ticket-bronze' and card = 'Carte à rechoisir (carte retirée)') = 1, 'participants : « Carte à rechoisir » pour f05');
select pg_temp.check((public.admin_prize_add(null, 'ticket-bronze', 'sv03.5-205', 'Électhor-ex', '151 · 205/165 · Ultra Rare', null)->>'ok')::boolean, 'admin : nouvelle carte au tirage Bronze');
reset role;
select pg_temp.check((select count(*) from public.tickets where user_id = '00000000-0000-0000-0000-0000000f0005' and item = 'ticket-bronze' and draw_at > now() and choice is null) = current_setting('t.n')::int, 'tickets gardés (rien de perdu ni de remboursé), carte effacée');
select pg_temp.check(exists (select 1 from public.admin_log where action = 'prize_remove' and (details->>'tickets_to_rechoose')::int = current_setting('t.all')::int and reason like '%à rechoisir'), 'journal des admins : retrait avec le nombre de tickets à rechoisir');

-- C. Le joueur voit son ticket à rechoisir et choisit une carte du tirage.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f0005', false);
set role authenticated;
select pg_temp.check(public.shop_state()->'redo' = '["ticket-bronze"]'::jsonb and public.shop_state()->'mine'->'ticket-bronze' is null, 'état du shop : ticket Bronze « à rechoisir »');
select pg_temp.check(pg_temp.err($$select public.buy_item('ticket-bronze', gen_random_uuid(), 'sv03.5-205')$$) like 'Ticket déjà acheté%', 'pas de 2ᵉ ticket Bronze ce mois-ci (son ticket compte toujours)');
select pg_temp.fails($$select public.ticket_choose('ticket-bronze', 'sv01-1')$$, 'rechoisir une carte qui n''est pas au tirage');
select pg_temp.fails($$select public.ticket_choose('ticket-bronze', 'sv03.5-199')$$, 'rechoisir la carte retirée');
select pg_temp.check((public.ticket_choose('ticket-bronze', 'sv03.5-205')->>'choice') = 'sv03.5-205', 'ticket rechoisi : Électhor-ex');
select pg_temp.check(public.shop_state()->'redo' = '[]'::jsonb and (public.shop_state()->'mine'->'ticket-bronze'->>'sv03.5-205')::int = current_setting('t.n')::int, 'état du shop : plus rien à rechoisir, ticket pour Électhor-ex');
select pg_temp.check(pg_temp.err($$select public.ticket_choose('ticket-bronze', 'sv03.5-205')$$) = 'Aucun ticket à rechoisir pour ce tirage', 'une carte déjà choisie ne se change pas une 2ᵉ fois');
reset role;

-- D. Les autres : un joueur sans ticket à rechoisir, un visiteur non connecté.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f0006', false);
set role authenticated;
select pg_temp.check(pg_temp.err($$select public.ticket_choose('ticket-bronze', 'sv03.5-205')$$) = 'Aucun ticket à rechoisir pour ce tirage', 'joueur sans ticket à rechoisir : refusé');
reset role;
set role anon;
select pg_temp.fails($$select public.ticket_choose('ticket-bronze', 'sv03.5-205')$$, 'visiteur non connecté');
reset role;

-- E. Une carte sans ticket se retire toujours, sans rien à rechoisir.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000ad', false);
set role authenticated;
select pg_temp.check((public.admin_prize_add(null, 'ticket-bronze', 'sv03.5-206', 'Sulfura-ex', null, null)->>'ok')::boolean, 'admin : une autre carte');
select pg_temp.check((select (r->>'ok')::boolean and (r->>'rechoose')::int = 0 from (select public.admin_prize_remove((select id from public.draw_prizes where card = 'sv03.5-206')) r) x), 'carte sans ticket : retirée, rien à rechoisir');
reset role;
delete from public.admin_unlocks where user_id = '00000000-0000-0000-0000-0000000000ad';
