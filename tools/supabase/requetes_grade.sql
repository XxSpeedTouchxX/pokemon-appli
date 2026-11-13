-- Offrir le grade « Grand maître Pokémon » (le plus haut) à un compte (2026-11-13, porteur : « comment je peux donner
-- accès grand Pokémon au max à un ami ? »). À coller dans Supabase Studio › SQL Editor › New query, après avoir remplacé
-- l'adresse de la ligne « ami », puis Run. Rejouable sans risque.
-- Ce que ça fait :
--   1. débloque tous les Pokémon du Pokédex du compte (les 171, méga-évolutions comprises) ;
--   2. met ses « PK gagnés au total » (le compteur des grades) à 100 000 s'il en a moins. Son solde de PK à dépenser
--      ne change pas : il ne reçoit aucun PK utilisable au PK shop ;
--   3. écrit une ligne dans le journal admin (qui, quoi, quand).
-- Le grade apparaît sur son téléphone à sa prochaine ouverture de l'app (avec l'animation de passage de grade).
do $$
declare
  ami text := 'ADRESSE-DE-TON-AMI@exemple.fr';   -- ← remplace par l'adresse e-mail du compte de ton ami
  uid uuid;
begin
  select id into uid from auth.users where lower(email) = lower(trim(ami));
  if uid is null then raise exception 'Aucun compte avec l''adresse %', ami; end if;
  insert into public.dex_unlocks (user_id, pokemon) select uid, g.n from public.game_pokemon g on conflict do nothing;
  update public.wallets set pk_earned = greatest(pk_earned, (select pk_earned from public.game_grades where i = 5)), updated_at = now()
  where user_id = uid;
  insert into public.admin_log (admin_id, action, target_user, details, reason)
  values (null, 'grade', uid, jsonb_build_object('grade', 'Grand maître Pokémon'), 'Grade offert par le porteur depuis Studio');
  raise notice 'Grade du compte maintenant : %', (select name from public.game_grades where i = public._game_grade(uid));
end $$;
