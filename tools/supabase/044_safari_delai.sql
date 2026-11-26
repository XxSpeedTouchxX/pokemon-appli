-- 044_safari_delai.sql — Safari éclair : une partie toutes les X heures selon le grade, pour TOUS les comptes
-- (2026-11-26, porteur : « pour le Safari éclair, mets bien le délai en rapport avec les grades ; actuellement je suis
-- Collectionneur et j'ai joué autant de fois que je voulais ; mets la limite à 1 fois toutes les X heures en fonction du
-- grade actuel »).
--
--   - Cause : depuis 027 (2026-11-13), les comptes admin, le mode Admin (mot de passe des admins) et les comptes de la
--     liste safari_free jouaient au Safari sans délai.
--   - Désormais, plus aucune exception : Collectionneur 1 partie toutes les 24 h, Dresseur Pokémon 12 h, Maître Pokémon
--     6 h, Grand maître Pokémon 4 h ; fermé à la Recrue et au Chasseur (inchangé, 039). Admins et liste safari_free
--     compris. La table safari_free est gardée (rien d'effacé) mais n'est plus lue.
--   - safari_state, safari_start et safari_finish (027, 039) demandent tous « _safari_free » : il répond toujours
--     « non », donc le délai du grade s'applique partout, et les rappels « Safari éclair prêt » (036) partent aussi.
--   - Booster PK et pièce : inchangés (le mode Admin garde leurs parties sans délai).
-- À installer après 039 (Supabase Studio › SQL Editor › New query › colle ce fichier › Run). Rejouable.
-- Revenir en arrière (sans délai pour les admins et la liste) : relancer 027_safari_libre.sql puis 039_jeux_grades.sql.
-- Tests : tests/test_044.sql.

do $$ begin
  if to_regprocedure('public._safari_free(uuid)') is null or to_regprocedure('public.safari_start(uuid,integer)') is null then
    raise exception 'Installe d''abord 027_safari_libre.sql et 039_jeux_grades.sql';
  end if;
end $$;

create or replace function public._safari_free(uid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select false;
$$;
revoke all on function public._safari_free(uuid) from public, anon, authenticated;

-- Repère lu par 000_verifier.sql.
comment on function public._safari_free(uuid) is '044 : Safari éclair au délai du grade pour tous, sans exception';

notify pgrst, 'reload schema';
