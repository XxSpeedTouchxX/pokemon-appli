#!/bin/bash
# Refait install_024_a_033.sql à partir des scripts 024 à 028 et 030 à 033 (à relancer après toute modification de l'un d'eux).
# 029 (annonces Vinted) n'y est pas : il demande pg_cron et la fonction « annonces » (docs/42).
cd "$(dirname "$0")" && {
  cat <<'H'
-- INSTALLATION EN UNE FOIS des scripts 024 à 028 et 030 à 033 (2026-11-13 au 16, porteur : « ouvre le Safari à tous », « suivre tous
-- les joueurs en mode admin », « 3 niveaux de difficulté pour le safari », « Safari illimité pour les admins et mon ami »,
-- « Points de loyauté »). 024 : le jeu Safari éclair (le serveur
-- tire les Pokémon, compte et donne les PK). 025 : Admin › Joueurs (PK, PA, régularité) et temps passé dans l'app.
-- 026 : les 3 niveaux du Safari (Facile, Normal, Difficile ; perte de PK possible en Normal et Difficile).
-- 027 : Safari sans délai pour les comptes admin et ceux de la liste safari_free (requetes_safari.sql).
-- 028 : Points de loyauté (PL) : défis, parrainage, captures de partage à valider, classement de la saison en PL.
-- 030 : cartes des tirages du PK shop modifiables même déjà choisies (tickets gardés, carte à rechoisir).
-- 031 : carte de visite des joueurs du classement de « Ma ligue ».
-- 032 : messages rapides entre joueurs de « Ma ligue » (8 messages tout faits, « Mes messages »).
-- 033 : vitrine, « Pour trade », « À vendre » et « Je cherche » (échanges entre joueurs, étage 1).
-- 029 (annonces Vinted) n'y est pas : il a sa propre installation (docs/42).
-- Il faut 001 à 023 déjà installés (fait le 2026-11-12). Rejouable : sans risque si l'un d'eux est déjà installé.
-- Supabase Studio › SQL Editor › New query › colle TOUT ce fichier › Run. Puis colle 000_verifier.sql › Run : les lignes
-- 024 à 028 et 030 à 033 doivent être « oui ». Ce fichier est fabriqué à partir de ces scripts
-- (tools/supabase/make_install_024.sh) : ne pas le modifier à la main.
H
  for f in 024 025 026 027 028 030 031 032 033; do printf '\n-- ================= %s =================\n' "$(ls ${f}_*.sql)"; cat ${f}_*.sql; done
  printf "\n-- Fin : l'API de Supabase relit la liste des fonctions (sinon l'app ne les voit qu'au redémarrage).\nnotify pgrst, 'reload schema';\n"
} > install_024_a_033.sql.new && mv install_024_a_033.sql.new install_024_a_033.sql && echo "install_024_a_033.sql refait"
