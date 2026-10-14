# CLAUDE.md — PKM-App (nom de code provisoire)

> Mémoire du projet, lue automatiquement par Claude Code à chaque session.
> Source de vérité détaillée : le dossier `docs/` (à lire dans l'ordre des numéros).
> En cas de contradiction entre ce fichier et `docs/`, signale-la, ne tranche pas seul.

## 1. Le projet en 5 lignes
- **Nom :** **Dropicards** pour la démo (identité choisie par le porteur le 2026-10-04 : logo, icône, nom) ; « PKM-App » reste le nom de code des documents. Disponibilité du nom (marque, domaine) à vérifier avant toute sortie publique.
- **Vision :** une app qui aide les collectionneurs et passionnés français de Pokémon TCG à connaître la **valeur** de leurs cartes et produits scellés, au prix du marché comparé entre plusieurs sources et mis à jour automatiquement. Le suivi de la **marge** à la revente reste un complément. Ce n'est **pas une plateforme de vente**.
- **Cible prioritaire (hypothèse à tester) :** **collectionneurs et passionnés** français (cartes, cartes gradées, scellé). Revendeurs / investisseurs en scellé = cible secondaire. *(Décision du porteur du 2026-10-03, qui remplace la cible « revendeurs de scellé ».)*
- **Ambition :** side-business. Projet d'**exploration** (on cherche encore quoi construire exactement).
- **Contraintes :** 2-4 h/jour, budget 500 à 5 000 €, équipe à plusieurs (rôles à confirmer), aucun calendrier externe.
- **Concurrent de référence :** PokéItem (pokeitem.fr). Voir `docs/04-cartographie-concurrents.md` et `docs/10-analyse-pokeitem-brouillon.md`.

## 2. Règle d'or (non négociable)
**On ne construit rien de lourd (développement d'app, dépense significative) avant que le test de la Phase 3 soit passé.**
Le test prévu est un service « concierge » par messagerie, **sans développement** (`docs/08-protocole-test.md`).
→ Tant que l'utilisateur n'a pas dit explicitement « go » : **propose, planifie, spécifie. Ne code pas.**
→ Quand le « go » est donné, le premier incrément doit être **le plus petit livrable qui sert le test ou la transition**, pas l'app complète.

> **Contradiction signalée (2026-10-03), à trancher par le porteur.**
> - Le Comparatif des options v2 (`docs/07-comparatif-options.md`) acte un changement de cap : un **produit proche de PokéItem d'abord**, à optimiser ensuite.
> - Le porteur a aussi indiqué que le test de la Phase 3 n'est **pas pour maintenant**.
> - Le Comparatif v2 dit que la Règle d'or est à reformuler. Tant qu'une nouvelle formulation n'est pas validée, la règle ci-dessus s'applique.

## 3. État d'avancement (au 2026-10-12)
- Phase 1 (cadrage, cartographie) : cartographie faite ; besoins de la cible (≥ 10 entretiens) **non faits**.
- Phase 2 (sourcing, hypothèse) : sources de données, hypothèses, comparatif des options faits ; **cadre juridique & droits Pokémon non produit**.
- Phase 3 (test) : protocole rédigé, **non validé, non gelé** ; **pas pour maintenant** (décision du 2026-10-03).
- **Changement de cap (2026-10-03, Comparatif des options v2) :** produit proche de PokéItem d'abord, optimisation ensuite.
- **Positionnement (2026-10-03) :**
  - valorisation des cartes et du scellé au prix du marché ;
  - cible : collectionneurs et passionnés ;
  - profils Novice, Régulier et Passionné automatiques, selon le nombre de cartes ultra rares ou la valeur de la collection.

  Maquette : `docs/12-maquette-v5/`.
- **Territoire (validé le 2026-10-03) :**
  - onglet dans la barre du bas ; le profil s'ouvre depuis l'avatar ;
  - « partenaires » = boutiques qui ont un accord avec PKM, pas une mention officielle Pokémon ;
  - probabilité d'arrivage estimée à partir de trois sources : annonce du magasin partenaire, signalements des collectionneurs (modérés, sans fil social), historique des arrivages.
- **Catalogue réel (2026-10-03, « go » du porteur ; élargi le 2026-10-04) :**
  - la démo web (https://pokemon-appli.pages.dev) charge toutes les cartes françaises de TCGdex, plus les extensions sans version française (cartes en anglais), avec leurs prix ;
  - visuels officiels en qualité maximale, depuis le CDN TCGdex ; repli sur le scan d'une autre version (anglaise, allemande, italienne, espagnole) quand le français manque ;
  - parcours « Toutes les cartes » par extension ;
  - GitHub Actions met tout à jour chaque jour (`.github/workflows/tcgdex.yml`) ;
  - licence et usage commercial à vérifier avant toute sortie publique.
- **Collection enregistrée sur l'appareil (2026-10-04) :** dans le navigateur, sans compte ni serveur ; « Vider ma collection » et « Remettre la démo » dans les Réglages.
- **Visuels et scellé réels (2026-10-04) :**
  - chaque carte a un visuel : scan TCGdex, sinon scan anglais pokemontcg.io (dernier recours, arrêt prévu le 1ᵉʳ mars 2027), sinon carte dessinée par l'app ;
  - 61 produits scellés réels : galerie officielle Pokémon France, liste figée dans `tools/sealed/products.json`, visuels officiels, cote Cardmarket du jour.
- **Radar (2026-10-04) :**
  - écran plein écran ouvert depuis Territoire : carte de France des boutiques réelles (OpenStreetMap, chaque semaine) ;
  - zoom par secteur, balayage radar, « Autour de moi », indice de chance expliqué ;
  - jamais de badge « partenaire » ni d'arrivage annoncé sur une vraie boutique.
- **Refonte v6 (2026-10-04, soir) :**
  - design jaune et verre (cartes bleu nuit translucides, contours, accent jaune), contraste vérifié ; l'ancien thème reste accessible avec `?theme=classic` ;
  - ETB, UPC, coffrets et cartes mis en avant partout (carrousels, grandes cartes 16:9, tuiles doubles) ;
  - page **Sorties** (`#sorties`) : dates et prix de lancement sourcés, liens directs Amazon (invitations), eBay, Fnac, Cultura, Micromania, sans affiliation : liens sortants, pas une marketplace ;
  - **Territoire réel** : vraies boutiques autour de la position (OpenStreetMap), fiche avec itinéraire, site, téléphone, horaires ; partenaires fictifs dans un encadré « Démo ».
- **Identité Dropicards et nouvel accueil (2026-10-04, nuit) :**
  - logo Dropicards redessiné en SVG (`tools/brand/`), icônes, nom, libellés ; jaune de la planche ;
  - accueil : recherche, valeur dans la police du logo avec courbe sur 4 points réels et compagnon animé (151 Pokémon de Kanto), radar des boutiques avec balayage et repères cliquables (nom, ville exacte), sorties, liste complète de la collection, marge ;
  - données : commune officielle des boutiques, moyennes Cardmarket 7 j et 1 j des cartes, archive quotidienne de la cote du scellé ;
  - Radar : points des boutiques enfin affichés et touchables pendant le balayage ;
  - scan réel à l'appareil photo : livré ensuite (ci-dessous).
- **Scan réel et exemplaires (2026-10-04, nuit) :**
  - scan à l'appareil photo : lecture sur le téléphone (Tesseract.js, aucune image envoyée) du numéro et du nom, 3 propositions à confirmer, carte suivante ; photo, import ou recherche sans caméra ; onglet Scellé en recherche ;
  - langue et état de chaque ajout enregistrés et affichés (liste, Collection, fiche) ;
  - lecture réglée sur des cartes de test dessinées : la vraie mesure se fait sur téléphone (`?debug=scan`).
- **Retouches de l'accueil (2026-10-05) :**
  - logo complet dans l'en-tête (I à l'éclair, O étoilé), plus grand ;
  - compagnons : 156 (les 151 de Kanto, plus Latias, Latios, Kyogre, Groudon, Rayquaza) ; choix sur 3 colonnes, icônes à la taille d'origine de chaque Pokémon, panneau opaque ;
  - montant de la collection au style du logo (blanc, contour noir) ;
  - logo radar interactif dans l'encadré « Active ta position » (au-dessus de « Me localiser ») : position, puis balayage.
- **Mon classeur (2026-10-07) :**
  - rubrique de l'accueil entre la valeur et « Boutiques autour de toi » : logo de classeur Pokémon et deux onglets ;
  - « Mes cartes » : pages de 9 visuels avec drapeau, cote et état, d'après l'aperçu de PokéItem ; « Mes produits scellés » : vitrine 2 par ligne ;
  - « Sorties du moment » tout en bas de l'accueil ;
  - en-tête : le logo exact du porteur (son fichier PNG, fond rendu transparent), à la place du logo redessiné ;
  - icône de l'app (écran d'accueil du téléphone) : le logo du porteur sur deux lignes ; carte O dans l'onglet du navigateur ;
  - liste « Ma collection » retirée de l'accueil (la marge réalisée reste) ;
  - thèmes des compagnons : Kyogre (océan, bleu), Groudon (volcan, rouge), Rayquaza (ouragan, vert émeraude et ardoise, depuis le 2026-10-08) changent le fond de l'app.
- **Monnaie « PK » (2026-10-08) :**
  - logo : une gemme jaune à facettes avec l'éclair du logo (jaune, contour noir) et une étincelle, sans aucun repère de Poké Ball pour limiter le risque de droits (choisie le 2026-10-08 après plusieurs séries de propositions) ; compteur à gauche de l'avatar (accueil, Collection, Marché, Territoire), qui ouvre « Mes PK » ; sur l'accueil, logo à gauche, pastille « FR » retirée ;
  - gains : 100 de bienvenue, +300 pour un partage, et les jeux ; les +10 par jour et par nouvel article ont été retirés le 2026-10-12 ;
  - compagnons : Bulbizarre, Salamèche, Carapuce, Pikachu offerts ; les autres de 50 à 200 PK selon le stade d'évolution, légendaires 400, Kyogre, Groudon et Rayquaza 500 avec leur thème ; un compagnon déjà choisi reste acquis ;
  - +300 PK une fois pour un partage sur un réseau social ; parrainage (+500) **mis en attente** par le porteur ;
  - logo de « Mon classeur » : la gemme des PK remplace la Poké Ball ;
  - sur l'appareil, sans achat en argent réel ni valeur en euros ; gains et règles **validés par le porteur (2026-10-08)** ; prochains déblocages à définir.
- **Vague 1 livrée (2026-10-09, « go » du porteur) :**
  - chaque page s'ouvre en haut, réglages gardés au retour ;
  - page Compte : palier en tête, texte qui s'écrit lettre par lettre, profil replié qui se déplie ;
  - choix de vue (Territoire : liste, galerie, compacte, carte ; Marché : liste, galerie, compacte, grandes cartes) ;
  - bulle d'infos accrochée aux boutiques ;
  - mode Admin (7 appuis sur « Version » et code ; PK, prix, profil, palier, date, interrupteurs, données, diagnostic).
- **Vague 3 et fiabilisation livrées (2026-10-09, « go » du porteur) :**
  - ouverture de booster à l'entrée ; corriger ou supprimer un ajout ; source et date sur chaque cote ; visuels de secours et hors ligne ;
  - cote selon l'état et la langue (coefficients affichés) ; vente d'un exemplaire précis ;
  - classeur trié, filtré, à glisser ; import d'un tableur CSV (sans PK) ;
  - fonds animés (Animés, Calmes, Sans) et micro-animations ;
  - app.js minifié ; tests navigateur dans `tools/web/e2e` et en CI.
- **2ᵉ onglet « Toutes les séries » (2026-10-09, demande du porteur avec vidéo) :** remplace l'écran Collection ; séries dépliables avec barre de logos, extensions (logo, nombre de cartes, sortie, progression, « Bientôt »), recherche ; chaque extension ouvre toutes ses cartes. La collection reste dans « Mon classeur » sur l'accueil. Logos en cascade (webp, png, logos locaux) et cartes manquantes complétées en anglais (TCGdex EN, pokemontcg.io) ; Collection Classique rattachée au 30ᵉ Anniversaire (191 cartes).
- **Jeux et corrections (2026-10-11, demande du porteur) :**
  - l'onglet « Marché » devient **« Jeux »** (manette) : Booster PK gratuit (10 PK 60 %, 30 PK 20 %, 50 PK 15 %, 100 PK 4 %, 1 000 PK 1 % ; un toutes les 24 h, à confirmer) et Pile ou face toutes les 8 h (+30 PK, une chance sur deux) ; la recherche de l'ancien Marché reste accessible depuis l'accueil ;
  - cote Cardmarket selon la version (holo, normale, reverse) avec l'autre version à côté, « cote à confirmer », lien vers les ventes réussies eBay (pas de chiffre : ni API ouverte ni scraping) ; filtre « Les plus chères » de toutes les séries ;
  - pipelines : mise à jour incomplète refusée (boutiques, scellé, catalogue), `web/data/status.json` ;
  - app : date réelle, enregistrement sûr, première visite sans démo, bouton Retour et glissement au retour avec position gardée, alertes à l'ouverture, prochaines sorties et radar simplifié sur l'accueil, logos de séries manquants, mentions légales refaites (identité de l'éditeur **à compléter par le porteur**), Admin dans les Réglages, animation d'entrée à chaque démarrage, icône « D » + carte O.
- **PK shop et roulette (2026-10-12, demande du porteur) :**
  - le 4ᵉ onglet (Territoire) devient **« PK shop »** : ticket de participation au tirage au sort d'un booster Pokémon, 500 PK (prix à confirmer) ; tirage **non fait par l'app** (règlement, organisateur, contact du gagnant à prévoir) ;
  - Territoire s'ouvre depuis l'accueil ; la carte de l'accueil s'ouvre sur 20 km autour de soi ;
  - roulette dans Jeux : PK ÷ 2 (15 %), × 2 (10 %), +100 (40 %), −100 (35 %), un tour toutes les 24 h (à confirmer) ;
  - ciseaux qui ouvrent le booster, pièce plus longue (16 demi-tours), déblocage de compagnon en 3 s avec confettis, icône (D légèrement remonté).
- **Cote, PK shop et transitions (2026-10-12, soir, demande du porteur) :**
  - cote = **tendance Cardmarket seule** (bonne version), TCGplayer en repli pour 631 cartes sans Cardmarket ; cotes recopiées par TCGdex (242 cartes) « à confirmer » ; « Les plus chères » refaite. **Contradiction avec le principe 2 (plusieurs sources), à trancher** ;
  - prix par état (Near Mint) et moyenne des ventes eBay **impossibles sans API officielle** (Cardmarket, eBay Marketplace Insights) : demandes d'accès à faire par le porteur ;
  - ticket 2 000 PK, lot Booster 30 ans 15 000 PK, barre des tickets sous le solde ; roulette sans chances affichées, sans plafond ; booster toutes les 12 h ; 20 km dans le Radar ; gains +10 (jour, nouvelle carte) retirés ;
  - transition entre pages façon iOS (d'après la vidéo du porteur).
- **Grades, Mon profil et retouches (2026-10-14, demande du porteur) :**
  - 6 grades selon la valeur de la collection, emblèmes à ailes façon LoL avec une Poké Ball au centre (choix du porteur), validés par le porteur (`web/img/grades/`) : Recrue (0-500 €, bronze), Chasseur (500-2 500 €, argent), Collectionneur (2 500-7 500 €, or), Dresseur Pokémon (7 500-15 000 €, or et vert), Maître Pokémon (15 000-30 000 €, or et cristal), Grand maître Pokémon (30 000 € et plus, rouge, couronne) ; seuil de 30 000 € gardé pour l'instant (porteur, 2026-10-14) ; « Série en cours » retirée ;
  - « Mon profil » : photo choisie dans la photothèque (gardée sur l'appareil), « Informations du dresseur » (pseudo, e-mail en attendant l'inscription, membre depuis, palier) ; badge Admin retiré de l'en-tête ;
  - série ouverte depuis son en-tête, barre des tickets sous un compteur resserré, flèche sur les chances du booster, confettis ou nuage de pluie à la roulette ;
  - premier écran : Dracaufeu 1re édition, Lugia réimpression 30 ans (illustration Neo Genesis en attendant le scan), Mew-ex illustration spéciale 30 ans ; pastille de cote retirée.
- **Propositions d'améliorations v2 (2026-10-09) :** `docs/13-propositions-ameliorations-v2.md` (remplace la v1 du 2026-10-07, gardée) ; 92 propositions en 16 catégories, dont les demandes du porteur du 2026-10-09 :
  - haut de page et réglages gardés ;
  - mode Admin ;
  - animation d'entrée ;
  - page Compte ;
  - Territoire (vraie API, vues, bulle d'infos) ;
  - vues du Marché ;
  - fonds animés.

  Quatre vagues, **à valider** ; rien n'est lancé sans « go ».
- **Décalage connu :** `docs/06` (Hypothèses) et `docs/08` (Protocole de test) restent écrits pour les revendeurs de scellé ; CLAUDE.md cite `docs/10-analyse-pokeitem-brouillon.md`, absent du dépôt.
- Les documents ont été écrits en parallèle : plusieurs disent « tel document n'existe pas encore » alors qu'il existe maintenant. Signale ces décalages.

## 4. Décisions et orientations déjà prises
- **Scénario recommandé** (Comparatif des options v2, proposition à valider) :
  - **freemium + app mobile multiplateforme** (E1+T3) ;
  - repli **web app/PWA** (T2) si la compétence mobile manque ;
  - écartés à ce stade : marketplace (E4), service à l'acte (E5), app native à deux bases de code (T4).

  L'ancien scénario « test concierge d'abord » (E5+T1, Comparatif v1) est abandonné par le porteur.
- Données : **scénario A** proposé = TCGdex (catalogue FR + prix) + fichiers publics Cardmarket (scellé) + archivage quotidien maison. Accès, licence et usage commercial **à vérifier** (V1 à V6 dans `docs/05-sources-donnees-prix.md`).
- **Pas de scraping** (eBay, Vinted, Leboncoin, Cardmarket) sans avis juridique préalable. Sujet à revoir plus tard (décision du 2026-10-03).
- **Visuels et noms Pokémon : AUTORISÉS par le porteur du projet (Nico, décision du 2026-10-03).** L'app peut afficher les noms, illustrations de cartes et visuels de produits scellés, comme le font tous les concurrents (PokéItem, TCG Crew, Pokéindex…). C'est une décision du porteur, qui en assume le risque ; ne bloque pas le travail dessus et ne redemande pas l'autorisation.
  - **Sourcing des images :** utilise en priorité les URLs ou CDN fournis par les sources de données retenues (ex. TCGdex, voir `docs/05-sources-donnees-prix.md`) ; à défaut, stockage local des images nécessaires au prototype. Pas de téléchargement massif depuis les pages des marketplaces.
  - **Obligatoire :** mention de non-affiliation visible dans l'app et sur le site (« application indépendante, non affiliée à Nintendo, GAME FREAK ou The Pokémon Company »). Pas de logo officiel Pokémon comme identité visuelle de l'app.
  - Le *Cadre juridique & droits Pokémon* n'est pas encore produit : mentionne simplement le sujet comme point d'attention dans la proposition, sans en faire un blocage.
- Hypothèse principale, seuils et prix testé (9,90 €/mois) : `docs/06-hypotheses-opportunites.md` et `docs/08-protocole-test.md` (propositions à valider).

## 5. Principes produit (le cahier des charges de fond)
1. **Novice ET passionné :**
   - un mode simple par défaut : valeur de la collection, collection, scan ;
   - des fonctions avancées activables (divulgation progressive) ;
   - un profil (Novice, Régulier, Passionné) qui s'adapte **automatiquement** à la collection : nombre de cartes ultra rares ou valeur.

   Une seule app, pas deux.
2. **Valeur réelle d'abord :**
   - la cote de chaque carte et de chaque produit au prix du marché : médiane des prix « marché » de plusieurs sources, mise à jour automatiquement ;
   - la **marge nette réelle** (prix d'achat − frais de plateforme − port, par vente et par lot) reste disponible pour ceux qui revendent.
3. **Transparence des prix :** chaque chiffre affiche sa source, sa date, et distingue prix demandé / prix vendu.
4. **Pas de dispersion :** on ne copie PAS le réseau social, la marketplace, les quêtes/saisons, le multi-TCG ni le Pokédex de PokéItem.
5. **Saisie rapide :** scan d'une carte ou d'un produit, sinon 2-3 champs pour enregistrer un ajout ou une vente ; import CSV (tableur, PokéItem, PokéCardex) ; export complet.
6. **Données maison :** archiver chaque jour les prix utilisés ; ne jamais dépendre d'une seule source.
7. La longueur de la liste de fonctions n'est pas un avantage durable (voir `docs/04-cartographie-concurrents.md` §6) : toute proposition doit dire **ce qui rend l'avantage durable** et **comment il sera mesuré par le test**.

## 6. Façon de travailler (pour Claude Code)
- **Langue :** français (code, commentaires et noms de variables en anglais acceptés ; documents et échanges en français).
- **Challenger uniquement aux points de validation** (proposition d'app, choix de stack, changement de périmètre). En dehors, exécute sans commentaire stratégique non sollicité.
- **Proposer des défauts, valider avant d'appliquer.** Pose au plus quelques questions à la fois, avec une valeur par défaut proposée.
- **Ne jamais ajouter un livrable hors de ce qui a été validé.**
- Effort exprimé en « **quoi faire de A à Z + durée à plein régime (8 h/j) et au rythme réel (3 h/j)** », jamais en calendrier imposé.
- Utiliser le **Plan Mode** pour toute proposition d'architecture ; ne modifier des fichiers qu'après validation.
- Une fois en phase de code : petits incréments testables, tests automatisés sur le calcul de marge (c'est le cœur métier), aucun secret dans le dépôt (`.env` ignoré), commits courts et lisibles.
- Estimer le coût mensuel (hébergement, données) de toute option et le comparer au budget.

## 7. Conventions de nommage des documents (kit v5)
- Figé : `[Document] vN (PKM-App, figé)` · Vivant : `[Document] (PKM-App, vivant)`.
- Les documents vivants (Fiche projet, Backlog, Roadmap, Registre, Journal des décisions) s'éditent en place ; les figés prennent une nouvelle version.
- Un changement structurant = une ligne en haut du Journal des décisions (ordre antéchronologique).
- Dans ce dépôt, les documents sont dans `docs/` avec un préfixe numérique ; les livrables produits par Claude Code vont dans `docs/` aussi, avec le nom au format ci-dessus.

## 8. Ce qui reste « à confirmer » (ne pas inventer)
Objectif chiffré, horizon, critères de réussite, critère d'abandon (proposition dans le protocole), composition et compétences de l'équipe, non-négociables, cadre juridique, accès réel aux fichiers Cardmarket, usage commercial des prix.
