-- Tests de 035_recharges_pa.sql (après test_034) : packs de PA payés avec Stripe, 1re recharge doublée, remboursement.
-- Chaque ligne « OK » est une vérification réussie ; le script s'arrête à la première erreur.
\set ON_ERROR_STOP 1
reset role;
create or replace function pg_temp.check(ok boolean, label text) returns text language plpgsql as $$
begin if not ok then raise exception 'ÉCHEC : %', label; end if; return 'OK ' || label; end; $$;
create or replace function pg_temp.fails(q text, msg text) returns boolean language plpgsql as $$
begin execute q; return false; exception when others then return position(msg in sqlerrm) > 0; end; $$;
create or replace function pg_temp.as_user(u text) returns void language sql as $$ select set_config('request.jwt.claim.sub', u, false) $$;
create or replace function pg_temp.pa(u text) returns int language sql security definer as $$ select pa from public.wallets where user_id = u::uuid $$;
grant execute on function pg_temp.check(boolean, text), pg_temp.fails(text, text), pg_temp.pa(text) to authenticated, anon, service_role;
-- Comptes : R (f3501, 25-35 ans), J (f3502, moins de 15 ans), X (f3503, suspendu).
insert into auth.users (id, email, email_confirmed_at, created_at) values
  ('00000000-0000-0000-0000-0000000f3501', 'recharge35@gmail.com', now(), now()),
  ('00000000-0000-0000-0000-0000000f3502', 'jeune35@gmail.com', now(), now()),
  ('00000000-0000-0000-0000-0000000f3503', 'suspendu35@gmail.com', now(), now()) on conflict do nothing;
update public.profiles set age_range = '25-35', status = 'active' where id = '00000000-0000-0000-0000-0000000f3501';
update public.profiles set age_range = 'u15' where id = '00000000-0000-0000-0000-0000000f3502';
update public.profiles set age_range = '25-35', status = 'suspended' where id = '00000000-0000-0000-0000-0000000f3503';
update public.wallets set pa = 100 where user_id = '00000000-0000-0000-0000-0000000f3501';

-- A. Les packs sont ceux de l'app (prix en centimes).
select pg_temp.check((select string_agg(id || '=' || pa || '/' || cents, ' ' order by sort) from public.pa_packs where active)
  = 'pa_500=500/499 pa_1500=1500/999 pa_3000=3000/1499 pa_5000=5000/1999', '4 packs : 500 PA 4,99 €, 1 500 PA 9,99 €, 3 000 PA 14,99 €, 5 000 PA 19,99 €');

-- B. Un joueur ne peut ni se donner des PA, ni lire les achats, ni appeler les fonctions du serveur.
select pg_temp.as_user('00000000-0000-0000-0000-0000000f3501');
set role authenticated;
select pg_temp.check(pg_temp.fails($$select public.pa_purchase_credit('cs_test_moi', auth.uid(), 'pa_5000', 1999, 'eur', 'pi_moi', false)$$, 'permission denied'), 'joueur : se créditer un pack refusé');
select pg_temp.check(pg_temp.fails($$select public.pa_purchase_refund('pi_x', 100, false)$$, 'permission denied'), 'joueur : remboursement refusé');
select pg_temp.check(pg_temp.fails($$select public.pa_checkout_pack(auth.uid(), 'pa_500')$$, 'permission denied'), 'joueur : fonction de la page de paiement refusée');
select pg_temp.check(pg_temp.fails($$select * from public.pa_purchases$$, 'permission denied'), 'joueur : lire les achats refusé');
select pg_temp.check(pg_temp.fails($$update public.pa_packs set cents = 1$$, 'permission denied'), 'joueur : changer un prix refusé');
select pg_temp.check((public.pa_shop_state()->>'first')::boolean and jsonb_array_length(public.pa_shop_state()->'packs') = 4, 'état : 1re recharge disponible, 4 packs');
reset role;
set role anon;
select pg_temp.check(pg_temp.fails($$select public.pa_shop_state()$$, 'permission denied'), 'visiteur non connecté : état refusé');
reset role;

-- C. Page de paiement : pack, âge, compte.
set role service_role;
select pg_temp.check((public.pa_checkout_pack('00000000-0000-0000-0000-0000000f3501', 'pa_3000')->>'cents')::int = 1499, 'pack 3 000 PA : 14,99 € pris dans la base');
select pg_temp.check(pg_temp.fails($$select public.pa_checkout_pack('00000000-0000-0000-0000-0000000f3501', 'pa_999999')$$, 'n’existe pas'), 'pack inventé refusé');
select pg_temp.check(pg_temp.fails($$select public.pa_checkout_pack('00000000-0000-0000-0000-0000000f3502', 'pa_500')$$, '18 ans'), 'moins de 15 ans refusé');
select pg_temp.check(pg_temp.fails($$select public.pa_checkout_pack('00000000-0000-0000-0000-0000000f3503', 'pa_500')$$, 'suspendu'), 'compte suspendu refusé');

-- D. Premier achat payé : PA doublés, une seule fois par session.
select pg_temp.check((public.pa_purchase_credit('cs_test_A1', '00000000-0000-0000-0000-0000000f3501', 'pa_1500', 999, 'EUR', 'pi_A1', false)->>'pa_given')::int = 3000, '1re recharge : 1 500 PA doublés → 3 000 PA');
select pg_temp.check(pg_temp.pa('00000000-0000-0000-0000-0000000f3501') = 3100, 'solde : 100 + 3 000 = 3 100 PA');
select pg_temp.check((public.pa_purchase_credit('cs_test_A1', '00000000-0000-0000-0000-0000000f3501', 'pa_1500', 999, 'eur', 'pi_A1', false)->>'already')::boolean, 'même session reçue deux fois : déjà comptée');
select pg_temp.check(pg_temp.pa('00000000-0000-0000-0000-0000000f3501') = 3100, 'message en double : aucun PA de plus');
reset role;
select pg_temp.check((select count(*) from public.ledger where user_id = '00000000-0000-0000-0000-0000000f3501' and kind = 'purchase') = 1, 'journal : un seul mouvement « purchase »');
set role service_role;

-- E. Achat suivant : prix de base.
select pg_temp.check((public.pa_purchase_credit('cs_test_A2', '00000000-0000-0000-0000-0000000f3501', 'pa_500', 499, 'eur', 'pi_A2', false)->>'pa_given')::int = 500, '2e recharge : 500 PA, pas doublés');
select pg_temp.check(pg_temp.pa('00000000-0000-0000-0000-0000000f3501') = 3600, 'solde : 3 600 PA');

-- F. Montant inattendu : rien n'est donné, la ligne est notée.
select pg_temp.check(not (public.pa_purchase_credit('cs_test_A3', '00000000-0000-0000-0000-0000000f3501', 'pa_5000', 499, 'eur', 'pi_A3', false)->>'ok')::boolean, 'pack 5 000 PA payé 4,99 € : refusé');
select pg_temp.check(pg_temp.pa('00000000-0000-0000-0000-0000000f3501') = 3600 and (select note from public.pa_purchases where session = 'cs_test_A3') like 'Montant inattendu%', 'aucun PA, ligne notée « Montant inattendu »');
select pg_temp.check(not (public.pa_purchase_credit('cs_test_A4', '00000000-0000-0000-0000-0000000f3501', 'pa_500', 499, 'usd', 'pi_A4', false)->>'ok')::boolean, 'devise autre que l’euro : refusée');
select pg_temp.check(not (public.pa_purchase_credit('cs_test_A5', '00000000-0000-0000-0000-0000000000ff', 'pa_500', 499, 'eur', 'pi_A5', false)->>'ok')::boolean, 'compte inconnu : rien n’est donné');
select pg_temp.check(pg_temp.fails($$select public.pa_purchase_credit('pas-une-session', '00000000-0000-0000-0000-0000000f3501', 'pa_500', 499, 'eur', 'pi_A6', false)$$, 'Session Stripe invalide'), 'session mal formée refusée');

-- G. Remboursements : au prorata, jamais sous 0.
select pg_temp.check((public.pa_purchase_refund('pi_A2', 499, false)->>'pa_taken')::int = 500, 'remboursement complet de 4,99 € : 500 PA repris');
select pg_temp.check(pg_temp.pa('00000000-0000-0000-0000-0000000f3501') = 3100, 'solde après remboursement : 3 100 PA');
select pg_temp.check((public.pa_purchase_refund('pi_A2', 499, false)->>'already')::boolean, 'même remboursement reçu deux fois : rien de plus');
reset role;
update public.wallets set pa = 1000 where user_id = '00000000-0000-0000-0000-0000000f3501';
set role service_role;
select pg_temp.check((public.pa_purchase_refund('pi_A1', 500, false)->>'pa_taken')::int = 1000 and (public.pa_purchase_refund('pi_A1', 500, false)->>'already')::boolean, 'remboursement partiel (5,00 € sur 9,99 €) : 1 502 PA dus, 1 000 repris (solde)');
select pg_temp.check(pg_temp.pa('00000000-0000-0000-0000-0000000f3501') = 0, 'solde jamais négatif');
select pg_temp.check((select note from public.pa_purchases where session = 'cs_test_A1') like '%502 PA déjà dépensés%', 'manque noté sur l’achat');
select pg_temp.check(not (public.pa_purchase_refund('pi_inconnu', 100, false)->>'ok')::boolean, 'paiement inconnu : rien');
reset role;

-- H. État pour l'app après achat, et 1re recharge toujours unique.
select pg_temp.as_user('00000000-0000-0000-0000-0000000f3501');
set role authenticated;
select pg_temp.check(not (public.pa_shop_state()->>'first')::boolean and (public.pa_shop_state()->>'bought')::int = 2, 'état : 1re recharge utilisée, 2 recharges payées');
reset role;
set role service_role;
select pg_temp.check((public.pa_checkout_pack('00000000-0000-0000-0000-0000000f3501', 'pa_500')->>'first') = 'false', 'page de paiement : plus de doublement');
reset role;

-- I. Supprimer son compte : les achats restent pour la comptabilité, sans lien avec le compte.
select pg_temp.as_user('00000000-0000-0000-0000-0000000f3501');
set role authenticated;
select public.delete_my_account();
reset role;
select pg_temp.check((select count(*) from public.pa_purchases where session in ('cs_test_A1', 'cs_test_A2') and user_id is null) = 2, 'compte supprimé : achats gardés, sans lien');
