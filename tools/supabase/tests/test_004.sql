-- Tests de triche de 004_jeu.sql et 005_jetables.sql (après mock_supabase.sql, 001 à 005, test_001.sql, test_003.sql).
-- Chaque ligne « OK » est une vérification réussie ; le script s'arrête à la première erreur.
\set ON_ERROR_STOP 1
reset role;
create or replace function pg_temp.check(ok boolean, label text) returns text language plpgsql as $$
begin if not ok then raise exception 'ÉCHEC : %', label; end if; return 'OK ' || label; end; $$;
create or replace function pg_temp.fails(q text, label text) returns text language plpgsql as $$
begin
  begin execute q; exception when others then return 'OK ' || label || ' (refusé : ' || left(sqlerrm, 70) || ')'; end;
  raise exception 'ÉCHEC : % (accepté)', label;
end; $$;
grant execute on function pg_temp.check(boolean, text), pg_temp.fails(text, text) to authenticated, anon;
-- A : compte confirmé (test_001). Tout le monde repart à 100 PK, journal à jour.
select pg_temp.check((select count(*) from public.wallets where pk = 100 and pa = 0) = (select count(*) from public.wallets), 'reprise : tous les comptes à 100 PK, 0 PA');
select pg_temp.check((select count(*) from public.ledger where kind in ('welcome', 'reprise')) = (select count(*) from public.wallets), 'reprise : chaque compte a sa ligne de départ dans le journal');
select pg_temp.check((select count(*) from public.game_pokemon) = 171 and (select sum(price_pa) from public.game_pokemon) = 15150, '171 Pokémon et 15 150 PA de prix sur le serveur');
select pg_temp.check((select min(x) >= 0 and max(x) < 1 from (select public._game_rand() x from generate_series(1, 5000)) t), 'tirage au hasard du serveur entre 0 et 1');

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000a', false);
set role authenticated;
select pg_temp.check((public.game_state()->>'pk')::int = 100 and (public.game_state()->>'pa_gain')::int = 20 and (public.game_state()->>'grade')::int = 0, 'état du compte : 100 PK, +20 PA à récupérer, Recrue');
-- Écritures directes : toutes refusées.
select pg_temp.fails($$update public.wallets set pa = 99999$$, 'écrire ses PA soi-même');
select pg_temp.fails($$insert into public.ledger (user_id, kind, pk, pa, pk_after, pa_after) values (auth.uid(), 'admin', 9999, 0, 9999, 0)$$, 'écrire dans le journal');
select pg_temp.fails($$select public._game_move(auth.uid(), 'admin', 9999, 9999, null, null)$$, 'appeler l''outil interne de mouvement');
select pg_temp.fails($$select public.admin_adjust_wallet(auth.uid(), 9999, 9999, 'triche')$$, 'outil admin sans être admin');
select pg_temp.fails($$update public.game_pokemon set price_pa = 0$$, 'changer le prix d''un Pokémon');
select pg_temp.fails($$update public.game_grades set booster_h = 0$$, 'changer le délai du booster');
-- PA du jour.
select pg_temp.check((public.claim_daily_pa('11111111-0000-0000-0000-000000000001')->>'gain')::int = 20, 'PA du jour : +20 (J1)');
select pg_temp.check((public.claim_daily_pa('11111111-0000-0000-0000-000000000001')->>'replay')::boolean and (public.game_state()->>'pa')::int = 20, 'même demande envoyée deux fois : un seul gain');
select pg_temp.fails($$select public.claim_daily_pa('11111111-0000-0000-0000-000000000002')$$, 'PA du jour une deuxième fois le même jour');
reset role; update public.wallets set pa_day = public._game_today() - 1 where user_id = '00000000-0000-0000-0000-00000000000a'; set role authenticated;
select pg_temp.check((public.claim_daily_pa('11111111-0000-0000-0000-000000000003')->>'gain')::int = 30, 'lendemain : +30 (J2)');
reset role; update public.wallets set pa_day = public._game_today() - 3, pa_streak = 4 where user_id = '00000000-0000-0000-0000-00000000000a'; set role authenticated;
select pg_temp.check((public.claim_daily_pa('11111111-0000-0000-0000-000000000004')->>'gain')::int = 30, 'jours manqués : retour à +30 (palier J2)');
reset role; update public.wallets set pa_day = public._game_today() - 1, pa_streak = 9 where user_id = '00000000-0000-0000-0000-00000000000a'; set role authenticated;
select pg_temp.check((public.claim_daily_pa('11111111-0000-0000-0000-000000000005')->>'gain')::int = 70, 'longue série : +70 au plus');
-- Booster PK.
select pg_temp.check((public.open_booster('22222222-0000-0000-0000-000000000001')->>'won')::int in (30, 50, 100, 200, 500), 'booster PK : gain tiré par le serveur');
select pg_temp.fails($$select public.open_booster('22222222-0000-0000-0000-000000000002')$$, 'booster rouvert avant le délai');
reset role; update public.game_throttle set n = 0;
alter table public.ledger disable trigger ledger_no_change;
update public.ledger set at = at - interval '25 hours' where user_id = '00000000-0000-0000-0000-00000000000a' and kind = 'booster';
alter table public.ledger enable trigger ledger_no_change;
set role authenticated;
select pg_temp.check((public.open_booster('22222222-0000-0000-0000-000000000003')->>'won')::int > 0, 'booster de nouveau prêt après 24 h (Recrue)');
-- Pièce : fermée à la Recrue.
select pg_temp.fails($$select public.flip_coin('33333333-0000-0000-0000-000000000001')$$, 'pièce à la Recrue');
-- Partage : une fois.
select pg_temp.check((public.claim_share('44444444-0000-0000-0000-000000000001', 'tiktok')->>'won')::int = 300, 'partage : +300 PK');
select pg_temp.fails($$select public.claim_share('44444444-0000-0000-0000-000000000002', 'x')$$, 'partage récompensé une deuxième fois');
-- Pokédex.
select pg_temp.fails($$select public.unlock_pokemon(1, '55555555-0000-0000-0000-000000000001')$$, 'débloquer un starter déjà offert');
select pg_temp.fails($$select public.unlock_pokemon(9, '55555555-0000-0000-0000-000000000002')$$, 'débloquer Tortank sans Carabaffe');
select pg_temp.fails($$select public.unlock_pokemon(150, '55555555-0000-0000-0000-000000000003')$$, 'débloquer Mewtwo (500 PA) sans assez de PA');
select pg_temp.fails($$select public.unlock_pokemon(99999, '55555555-0000-0000-0000-000000000004')$$, 'Pokémon inconnu');
select pg_temp.check((public.unlock_pokemon(8, '55555555-0000-0000-0000-000000000005')->>'price')::int = 50, 'Carabaffe débloqué (50 PA, Carapuce offert)');
select pg_temp.fails($$select public.unlock_pokemon(8, '55555555-0000-0000-0000-000000000006')$$, 'débloquer deux fois le même Pokémon');
select pg_temp.check((select buddy from public.profiles where id = auth.uid()) = 8, 'Carabaffe devient le compagnon');
select pg_temp.fails($$update public.profiles set buddy = 150$$, 'choisir un compagnon non débloqué');
update public.profiles set buddy = 25;
select pg_temp.check((select buddy from public.profiles where id = auth.uid()) = 25, 'choisir un compagnon offert');
-- PK shop.
select pg_temp.fails($$select public.buy_item('ticket-booster', '66666666-0000-0000-0000-000000000001')$$, 'ticket à la Recrue');
reset role; update public.game_throttle set n = 0;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000ad', false);
set role authenticated;
select public.admin_adjust_wallet('00000000-0000-0000-0000-00000000000a', 5000, 0, 'test des tickets');
reset role;
insert into public.dex_unlocks (user_id, pokemon) select '00000000-0000-0000-0000-00000000000a', n from public.game_pokemon where not mega and price_pa > 0 and n <> 8 order by n limit 10;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000a', false);
set role authenticated;
select pg_temp.check((public.game_state()->>'grade')::int = 2, 'Collectionneur (5 000 PK gagnés, 15 compagnons) calculé par le serveur');
select pg_temp.fails($$select public.buy_item('ticket-booster', '66666666-0000-0000-0000-000000000002')$$, 'ticket avant 7 jours de compte');
reset role; update auth.users set email_confirmed_at = now() - interval '8 days' where id = '00000000-0000-0000-0000-00000000000a'; set role authenticated;
select pg_temp.check((public.buy_item('ticket-booster', '66666666-0000-0000-0000-000000000003')->>'count')::int = 1, 'ticket acheté après 7 jours (2 000 PK)');
select pg_temp.fails($$select public.buy_item('lot-booster-30', '66666666-0000-0000-0000-000000000004')$$, 'lot à 15 000 PK au grade Collectionneur');
select pg_temp.check((public.flip_coin('33333333-0000-0000-0000-000000000002')->>'won')::int in (0, 50), 'pièce ouverte dès Chasseur');
-- Rafale : au plus 30 actions par minute.
reset role; update public.game_throttle set n = 0; set role authenticated;
select pg_temp.fails($q$do $x$ begin for i in 1..40 loop perform public.claim_daily_pa('11111111-0000-0000-0000-000000000005'); end loop; end $x$$q$, 'rafale de 40 demandes en une minute');
-- Journal : soldes = somme des mouvements.
reset role; update public.game_throttle set n = 0;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000ad', false);
set role authenticated;
select public.admin_adjust_wallet('00000000-0000-0000-0000-00000000000b', -999999, 0, 'test du plancher');
select pg_temp.check((select pk from public.wallets where user_id = '00000000-0000-0000-0000-00000000000b') = 0, 'retrait admin plus grand que le solde : solde à 0, jamais négatif');
select pg_temp.check((select count(*) from public.admin_check_ledger()) = 0, 'vérification des comptes : aucun écart entre soldes et journal');
select public.admin_set_status('00000000-0000-0000-0000-00000000000b', 'suspended', 'test');
-- Compte suspendu, adresse non confirmée, visiteur.
reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000b', false);
set role authenticated;
select pg_temp.fails($$select public.claim_daily_pa('77777777-0000-0000-0000-000000000001')$$, 'compte suspendu');
reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000c1', false);
set role authenticated;
select pg_temp.fails($$select public.claim_daily_pa('77777777-0000-0000-0000-000000000002')$$, 'adresse non confirmée');
reset role;
select set_config('request.jwt.claim.sub', '', false);
set role anon;
select pg_temp.fails($$select public.claim_daily_pa('77777777-0000-0000-0000-000000000003')$$, 'visiteur non connecté');
select pg_temp.fails($$select public.game_state()$$, 'visiteur : état du compte');
-- Adresses jetables.
reset role;
select pg_temp.fails($$insert into auth.users (email) values ('triche@yopmail.com')$$, 'inscription avec une adresse jetable');
select pg_temp.fails($$insert into auth.users (email) values ('triche@x.yopmail.com')$$, 'sous-domaine d''une adresse jetable');
select pg_temp.fails($$update auth.users set email = 'a@yopmail.com' where id = '00000000-0000-0000-0000-00000000000a'$$, 'changer son adresse pour une adresse jetable');
insert into auth.users (email) values ('vrai@gmail.com');
select pg_temp.check((select count(*) from auth.users where email = 'vrai@gmail.com') = 1, 'adresse ordinaire acceptée');
