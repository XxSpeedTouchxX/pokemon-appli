#!/bin/bash
# Refait install_024_a_028.sql à partir des scripts 024 à 028 (à relancer après toute modification de l'un d'eux).
cd "$(dirname "$0")" && {
  cat <<'H'
-- INSTALLATION EN UNE FOIS des scripts 024 à 028 (2026-11-13 et 14, porteur : « ouvre le Safari à tous », « suivre tous
-- les joueurs en mode admin », « 3 niveaux de difficulté pour le safari », « Safari illimité pour les admins et mon ami »,
-- « Points de loyauté »). 024 : le jeu Safari éclair (le serveur
-- tire les Pokémon, compte et donne les PK). 025 : Admin › Joueurs (PK, PA, régularité) et temps passé dans l'app.
-- 026 : les 3 niveaux du Safari (Facile, Normal, Difficile ; perte de PK possible en Normal et Difficile).
-- 027 : Safari sans délai pour les comptes admin et ceux de la liste safari_free (requetes_safari.sql).
-- 028 : Points de loyauté (PL) : défis, parrainage, captures de partage à valider, classement de la saison en PL.
-- Il faut 001 à 023 déjà installés (fait le 2026-11-12). Rejouable : sans risque si l'un d'eux est déjà installé.
-- Supabase Studio › SQL Editor › New query › colle TOUT ce fichier › Run. Puis colle 000_verifier.sql › Run : les lignes
-- 024 à 028 doivent être « oui ». Ce fichier est fabriqué à partir de 024 à 028
-- (tools/supabase/make_install_024.sh) : ne pas le modifier à la main.
H
  for f in 024 025 026 027 028; do printf '\n-- ================= %s =================\n' "$(ls ${f}_*.sql)"; cat ${f}_*.sql; done
  printf "\n-- Fin : l'API de Supabase relit la liste des fonctions (sinon l'app ne les voit qu'au redémarrage).\nnotify pgrst, 'reload schema';\n"
} > install_024_a_028.sql.new && mv install_024_a_028.sql.new install_024_a_028.sql && echo "install_024_a_028.sql refait"
