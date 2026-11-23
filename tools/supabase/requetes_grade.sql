-- Offrir le grade « Grand maître Pokémon » (le plus haut) à un compte, et des PA si tu veux (2026-11-13, porteur :
-- « comment je peux donner accès grand Pokémon au max à un ami ? » ; PA ajoutés le 2026-11-23, porteur : « le grade max
-- pour qu'il puisse utiliser toute l'application, et un gain de PA pour les cosmétiques »).
-- À coller dans Supabase Studio › SQL Editor › New query, après avoir rempli les 2 lignes marquées « ← », puis Run.
-- Rejouable sans risque pour le grade ; chaque lancement redonne les PA choisis (mets 0 pour ne rien redonner).
-- Ce que ça fait :
--   1. débloque tous les Pokémon du Pokédex du compte (les 171, méga-évolutions comprises) ;
--   2. met ses « PK gagnés au total » (le compteur des grades) à 100 000 s'il en a moins. Son solde de PK à dépenser
--      ne change pas : il ne reçoit aucun PK utilisable au PK shop ;
--   3. ajoute les PA choisis à son solde de PA (pour les cosmétiques de « Mon avatar »), avec une ligne dans son
--      historique des PK et PA ;
--   4. écrit une ligne dans le journal admin (qui, quoi, quand).
-- Le grade et les PA apparaissent sur son téléphone à sa prochaine ouverture de l'app (avec l'animation de passage de
-- grade). Ce n'est pas le rôle admin : il ne voit ni le panneau Admin ni les comptes des autres.
do $$
declare
  ami text := 'ADRESSE-DE-TON-AMI@exemple.fr';   -- ← remplace par l'adresse e-mail du compte de ton ami
  pa_offerts int := 5000;                        -- ← PA offerts (0 pour aucun)
  uid uuid;
  w public.wallets;
begin
  select id into uid from auth.users where lower(email) = lower(trim(ami));
  if uid is null then raise exception 'Aucun compte avec l''adresse %', ami; end if;
  if coalesce(pa_offerts, 0) < 0 or pa_offerts > 1000000 then raise exception 'PA offerts : entre 0 et 1 000 000'; end if;
  insert into public.dex_unlocks (user_id, pokemon) select uid, g.n from public.game_pokemon g on conflict do nothing;
  update public.wallets set pk_earned = greatest(pk_earned, (select pk_earned from public.game_grades where i = 5)),
    pa = pa + coalesce(pa_offerts, 0), updated_at = now()
  where user_id = uid returning * into w;
  if w.user_id is null then raise exception 'Le compte % n''a pas encore de porte-monnaie : il doit ouvrir l''app une fois', ami; end if;
  if coalesce(pa_offerts, 0) > 0 then
    insert into public.ledger (user_id, kind, pk, pa, pk_after, pa_after, ref)
    values (uid, 'admin', 0, pa_offerts, w.pk, w.pa, 'cadeau');
  end if;
  insert into public.admin_log (admin_id, action, target_user, details, reason)
  values (null, 'grade', uid, jsonb_build_object('grade', 'Grand maître Pokémon', 'pa', coalesce(pa_offerts, 0)),
    'Grade et PA offerts par le porteur depuis Studio');
  raise notice 'Grade du compte maintenant : % · solde de PA : %', (select name from public.game_grades where i = public._game_grade(uid)), w.pa;
end $$;
