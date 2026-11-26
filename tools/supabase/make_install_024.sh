#!/bin/bash
# Refait install_024_a_034.sql à partir des scripts 024 à 028, 030 à 034, 037 à 044 (sauf 036) (à relancer après toute modification de l'un d'eux).
# 029 (annonces Vinted) n'y est pas : il demande pg_cron et la fonction « annonces » (docs/42).
cd "$(dirname "$0")" && {
  cat <<'H'
-- INSTALLATION EN UNE FOIS des scripts 024 à 028 et 030 à 034 (2026-11-13 au 18, porteur : « ouvre le Safari à tous », « suivre tous
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
-- 034 : « Le coin des dresseurs » : rechercher un dresseur par son pseudo et voir les vitrines des dresseurs.
-- 037 (2026-11-21) : parrainage fiabilisé : code du lien envoyé avec l'inscription (50 PL tout de suite), invitation
-- avec le pseudo du parrain, 200 PL du parrain enfin montrés, avancement de chaque filleul.
-- 038 (2026-11-21) : « Ma vitrine » : chercher une carte proposée Pour trade ou à vendre (quel dresseur la propose) ;
-- messages rapides retirés (les propositions d'échange restent dans « Mes messages »).
-- 039 (2026-11-23) : chaque jeu s'ouvre au grade prévu pour tout le monde (Safari dès Collectionneur, pièce dès
-- Chasseur) ; les comptes « sans délai » (admins, liste du Safari) gardent seulement l'absence d'attente.
-- 040 (2026-11-25) : chaque achat direct du PK shop (booster, item rare, ETB) retire un article du stock, achats faits
-- en mode Admin compris.
-- 041 (2026-11-25) : « Mes messages » : messages envoyés, modifier ou supprimer un message (proposition sans réponse
-- modifiable ou retirée pour les deux, réponse modifiable ou retirée, message reçu retiré de sa liste).
-- 042 (2026-11-25) : PK shop : booster à 10 000 PK, item rare au choix et ETB 30 ans « Bientôt disponible » (fermés).
-- 043 (2026-11-25) : e-mail de félicitations au joueur après un achat direct (booster, item rare, ETB), avec une fiche
-- à renvoyer à contact@dropicards.fr ; il faut aussi la nouvelle fonction « notify » (docs/30 § 9).
-- 044 (2026-11-26) : Safari éclair au délai du grade pour tous (plus de « sans délai » pour les admins, le mode Admin
-- ni la liste safari_free).
-- 029 (annonces Vinted) n'y est pas : il a sa propre installation (docs/42).
-- Il faut 001 à 023 déjà installés (fait le 2026-11-12). Rejouable : sans risque si l'un d'eux est déjà installé.
-- Supabase Studio › SQL Editor › New query › colle TOUT ce fichier › Run. Puis colle 000_verifier.sql › Run : les lignes
-- 024 à 028, 030 à 034 et 037 à 044 doivent être « oui ». Ce fichier est fabriqué à partir de ces scripts
-- (tools/supabase/make_install_024.sh) : ne pas le modifier à la main.
H
  for f in 024 025 026 027 028 030 031 032 033 034 037 038 039 040 041 042 043 044; do printf '\n-- ================= %s =================\n' "$(ls ${f}_*.sql)"; cat ${f}_*.sql; done
  printf "\n-- Fin : l'API de Supabase relit la liste des fonctions (sinon l'app ne les voit qu'au redémarrage).\nnotify pgrst, 'reload schema';\n"
} > install_024_a_034.sql.new && mv install_024_a_034.sql.new install_024_a_034.sql && echo "install_024_a_034.sql refait"
