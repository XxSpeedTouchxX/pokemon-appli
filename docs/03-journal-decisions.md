# Journal des décisions (PKM-App, vivant)

*Créé le 2026-10-03 · ampleur Structurant · branche 01 Pilotage · nouvelle entrée ajoutée en haut (ordre anté-chronologique)*

> **Déclencheur d'une entrée :** changement structurant (jeu de branches, pivot de Roadmap, changement d'ampleur). Pas une entrée par tâche du backlog, ni pour une révision mineure d'un document figé.

---

## 2026-11-01 (suite 2) — Historique vérifié, cartes des séries en fiche, Mon profil complété

- **Demandes du porteur** : vérifier l'historique de chaque carte (« des fois le prix ne bouge pas entre 1M et 6M ») ; retirer le cœur (favori) des cartes, garder le « + » ; une carte d'une série ouvre la même fiche que celle du Dracaufeu du classeur, sans « J'ai vendu » ; dans Mon profil : la version de l'app (non cliquable, « à jour »), une rubrique Communauté (Discord, App Store pour noter l'app, TikTok), « Nous contacter » (e-mail avec l'adresse de l'équipe en destinataire, adresse à créer), et tout en bas « Conditions générales d'utilisation » et « Politique de confidentialité ». Population PSA : laissée de côté (« nn c'est bon »).
- **Fait** (cache v100) :
  - historique : calcul vérifié (1S = 7 jours, 1M = 30 jours…) ; l'archive commence le 3 octobre 2026, donc 1M, 3M, 6M et 1A montraient le même historique que MAX ; ces périodes sont désormais grisées tant que l'archive ne les couvre pas, avec leur date d'arrivée (1M dès le 1er nov., 3M dès le 1er janv. 2027, 6M dès le 2 avr. 2027, 1A dès le 2 oct. 2027) ;
  - écran d'une extension et « Les plus chères » : cœur retiré, « + » gardé ; un appui sur une carte ouvre la fiche en panneau (prix du marché, historique, prix par état, prix gradés, « Ajouter à ma collection »), sans « J'ai vendu » ; la page complète d'une carte, encore ouverte depuis la recherche, garde « J'ai vendu », seul accès à la vente d'un exemplaire ;
  - Mon profil : Communauté (Discord, App Store, TikTok, icônes Simple Icons sous licence CC0, marques de leurs propriétaires ; « Bientôt » tant que les liens n'existent pas), « Écrire à l'équipe Dropicards » (contact@dropicards.fr, **adresse à créer et à confirmer**), « Conditions générales d'utilisation » et « Politique de confidentialité » (ouvrent l'onglet voulu des informations légales), mention de non-affiliation, puis « Dropicards · version v100 · à jour » (version publiée relue sur le serveur ; sinon « la vXX est disponible : ferme et rouvre l'app »).
- **À fournir par le porteur** : les liens Discord, App Store et TikTok ; l'adresse e-mail de contact définitive.

## 2026-11-01 (suite) — Logo PSA rouge et bleu ; population PSA toujours sans source

- **Demandes du porteur** : « le vrai logo PSA en rouge et bleu » ; « la population de toutes les cartes gradées PSA, notes 6 à 10 ».
- **Fait** (cache v99) : logo PSA rouge et bleu (P et A bleus, S rouge), celui de l'article « Professional Sports Authenticator » de Wikipédia en anglais, téléchargé par le workflow « Logos des entreprises de gradation » (`web/img/grading/psa-color.png`), sur une pastille blanche dans « Prix gradés ». PSA indique dans sa politique de marques que ses logos ne peuvent pas être utilisés sans licence écrite : point d'attention H3, comme les autres logos.
- **Non fait — population PSA** : PSA ne propose pas d'accès public à sa population (pas d'API publique pour ces chiffres ; son site est protégé et le scraping est exclu, décision du 2026-10-03). Voies repérées, toutes à décider par le porteur (aucun chiffre inventé) :
  - PokemonPriceTracker (service payant) : la population n'est servie qu'aux offres « Business » et « Enterprise » (2 crédits par carte ; l'offre à 49 $ par mois ne la donne pas, correction du jour), cartes repérées par leur numéro TCGplayer (versions anglaises) ; prix et conditions d'usage commercial à vérifier ;
  - PokéTracker (pokemontracker.com, proposé par le porteur) : site français de rapports de population ; aucune API ni licence trouvée, recopier ses pages serait du scraping (exclu) et ses chiffres viennent eux-mêmes de PSA ; seule voie propre : écrire à l'éditeur pour demander un accord ou un accès.

## 2026-11-01 — Prix gradés avec logos et notes 10 à 6, courbe qui glisse, Prix par état sans pourcentages

- **Demandes du porteur** :
  - « Prix par état » : retirer les pourcentages ;
  - « Prix gradés » : le logo des 3 entreprises ; les notes de 6 à 10 pour chacune, une nuance par note (10 or, 9,5 vert très foncé, 9 vert foncé, 8 vert, 7 vert-jaune, 6 jaune-orangé) ; chez CCC, aussi le 10 Gold Label et le 10 Black Label ;
  - la population des cartes gradées PSA, notes 6 à 10 ;
  - « Historique du prix » : une transition plus agréable entre les périodes.
- **Fait** (cache v98) :
  - « Prix par état » : nom de l'état et valeur, sans pourcentage ;
  - logos officiels : PCA (image du site pcagrade.com), CCC (logo SVG du site cccgrading.com), PSA (logo SVG de l'en-tête de psacard.com, en blanc sur le rouge de PSA) ; workflow « Logos des entreprises de gradation » (`tools/grading/fetch_logos.py`, `web/img/grading/`), PSA recopié à la main (le site refuse les machines de GitHub) ; marques déposées, même point d'attention que les logos des enseignes (H3) ;
  - notes : PCA 10, 9,5, 9, 8, 7, 6 ; CCC 10 Black Label, 10 Gold Label, 10, 9,5, 9, 8, 7, 6 ; PSA 10, 9, 8, 7, 6 (PSA ne délivre pas de 9,5) ; 8,5 retiré ; toujours des estimations (cote Near Mint × coefficient) ;
  - transition : la courbe et son aire glissent de l'ancienne forme à la nouvelle en 0,65 s, la ligne du prix d'achat et le point du jour suivent, l'axe, les dates et la variation réapparaissent en fondu ; rien ne bouge si le téléphone limite les animations.
- **Non fait — population PSA** : PSA ne publie sa population qu'à travers son site (protégé, pas de scraping) et une API réservée aux comptes PSA, avec un quota très faible et un numéro « spec » PSA par carte, qu'aucune source ouverte ne relie aux cartes du catalogue. Aucun chiffre n'est inventé ; décision du porteur attendue (voir le bilan).
- **Coefficients proposés, à valider** : PCA 10 ×2,6, 9,5 ×1,9, 9 ×1,45, 8 ×1,12, 7 ×0,85, 6 ×0,7 ; CCC 10 Black Label ×6, 10 Gold Label ×4, 10 ×2,8, 9,5 ×2, 9 ×1,5, 8 ×1,15, 7 ×0,9, 6 ×0,72 ; PSA 10 ×3,5, 9 ×1,6, 8 ×1,2, 7 ×0,9, 6 ×0,75.
- **Tests GitHub** : « Tests de la démo » échouait depuis le 31 octobre à l'installation de Chromium (GitHub est passé à Ubuntu 26.04, que Playwright 1.56 ne gère pas) ; les tests navigateur tournent désormais sur Ubuntu 24.04.

## 2026-10-31 (suite 5) — Fiche d'une carte : historique du prix et prix gradés

- **Demandes du porteur** (avec une photo d'un « Historique du prix » et une vidéo de « Prix gradés ») :
  - solde des PA en blanc comme les PK ;
  - fiche d'une carte du classeur : retirer « Investi », « Mes exemplaires », « Marquer comme vendu » et « Voir la fiche complète » ; bulles d'état en couleur dans « Prix par état » ;
  - deux rubriques : la variation du prix de la carte depuis sa sortie, et la cote chez les entreprises de gradation selon chaque note, **PCA, CCC et PSA uniquement**.
- **Fait** (cache v97) :
  - « PA » de l'en-tête en gris clair comme « PK » (le nombre était déjà blanc) ;
  - fiche : les quatre éléments retirés ; « Prix par état » montre la bulle illustrée de chaque état (Mint à Poor) ;
  - **archive quotidienne de la cote** : `tools/tcgdex/history.py` garde chaque jour la cote de chaque carte (celle de l'app : médiane Cardmarket), une fiche par extension dans `web/data/hist/` ; reprise de l'historique git depuis le **3 octobre 2026** (29 jours, 20 652 cartes, 2,7 Mo) ; le workflow « Catalogue TCGdex » ajoute le jour publié ;
  - **« Historique du prix »** façon photo : valeur, variation sur la période (« −96,05 € (−23,0 %) · max »), axe des montants, dates, courbe lissée, point du jour, ligne pointillée orange du prix d'achat (« 🛒 375,00 € », seulement si un prix payé est connu), périodes 1S, 1M, 3M, 6M, 1A, MAX (MAX par défaut) ; la courbe suit l'état de la carte possédée ; repli sur les moyennes Cardmarket si l'archive manque ;
  - **« Prix gradés »** façon vidéo, cartes seulement : PCA et CCC (10, 9,5, 9, 8,5, 8), PSA (10, 9, 8,5, 8), pastille de couleur par note, « ≈ valeur · estimation », noms en texte sans logo.
- **Limites (aucune source ouverte)** :
  - pas d'historique avant le 3 octobre 2026 : « depuis sa sortie » se construit jour après jour (3M, 6M, 1A égalent MAX pour l'instant) ;
  - pas de ventes réelles de cartes gradées : chaque note est une **estimation** (cote Near Mint × coefficient), coefficients **proposés, à valider par le porteur** : PCA 2,6 / 1,9 / 1,45 / 1,25 / 1,12 ; CCC 2,8 / 2,0 / 1,5 / 1,28 / 1,15 ; PSA 3,5 / 1,6 / 1,35 / 1,2 ;
  - pas de points de ventes réelles sur la courbe ni de population PSA.

## 2026-10-31 (suite 4) — Didacticiel sans « Nouveau », Dracaufeu plus grand, « Voir ses cartes » : Cartes ou Items

- **Demandes du porteur** :
  - didacticiel : retirer l'étiquette violette « Nouveau » ;
  - arbre d'évolution : Dracaufeu trop petit ;
  - « Voir ses cartes » d'un Pokémon : seulement ses cartes, sans produits ; deux bulles, « Cartes » et « Items » (tous les produits liés à ce Pokémon, sinon « Pas d'items disponibles ») ; retirer Tendances, Hausses, Baisses, etc.
- **Fait** (cache v96) :
  - étiquette « Nouveau » retirée ;
  - arbre : l'arbre prend toute la largeur de l'écran et chaque colonne la largeur de ses Pokémon (66 px au moins pour le nom), les petites formes laissant la place aux grandes : Dracaufeu passe de 54 à 62 px sur un écran de 390 px (davantage sur un grand écran), toujours sans contact entre voisins ; étiquettes « Évol. 1 », « Évol. 2 » quand la place manque ;
  - « Voir ses cartes » : bulles « Cartes » (ses cartes du catalogue seulement) et « Items » (produits scellés à son nom ou à celui de ses méga-évolutions, parmi les 61 produits réels et la collection) ; « Pas d'items disponibles » sinon (Pikachu, aujourd'hui) ; la recherche redevient normale dès qu'on change le texte.

## 2026-10-31 (suite 3) — Fiche d'une carte : « Déjà possédée ×N » et état modifiable

- **Validé par le porteur** : un seul bouton « Méga-évoluer · 2 500 PA ».
- **Demandes du porteur** : « Déjà possédée ×N » à la place de « ×N dans ta collection » quand on touche une carte du classeur ; l'état de la carte avec sa bulle de couleur, modifiable à tout moment (une Mint saisie par erreur en Near Mint), et le prix qui s'ajuste.
- **Fait** (cache v95) :
  - fiche du classeur et page complète d'une carte : « Déjà possédée ×N » (« Déjà possédé » pour le scellé) ;
  - sous le prix, une bulle par état possédé (bulle illustrée, nom, sigle, langue, pourcentage, valeur) ; un appui ouvre les 6 états avec la valeur de la carte pour chacun ; le choix modifie les exemplaires enregistrés (même langue, même état), avec « Annuler » dans le message ;
  - le grand prix de la fiche d'une carte possédée est désormais celui de la carte selon son état (comme la pastille du classeur), avec « Selon l'état · 99,00 € en Near Mint (Cardmarket) » quand il diffère de la cote.

## 2026-10-31 (suite 2) — Sigle de l'état en blanc, toujours sur une ligne

- **Demande du porteur** : « NM » en blanc comme les autres sigles, et tout sur une seule ligne, comme sur la carte Dracaufeu.
- **Fait** (cache v94) : sigles en blanc ; la pastille ne passe plus jamais sur deux lignes : tout y est mesuré par rapport à la taille du texte, qui suit la largeur de la carte (11 px au plus, environ 8 px sur un écran de 320 px). Vérifié jusqu'à « 12 345 € · NM » sur une carte de 79 px, cote jamais coupée.

## 2026-10-31 (suite) — Sigle de l'état, bouton « OK », méga-évolutions animées et réparées, évolution plus longue

- **Validé par le porteur** : les 3 choix de l'entrée précédente (plus de « vu » ; récupération des PA d'abord ; « Tous les Pokémon » et la mention « Les PK ne s'achètent pas » gardés).
- **Demandes du porteur** :
  - classeur : le sigle de l'état (M, NM, Ex, GD, PL, PO) à côté de sa bulle et du prix, quitte à agrandir un peu la pastille ;
  - Pokédex : « OK : Sélectionner ou faire évoluer son Pokémon » sous l'appareil ; bouton « OK » vert clair, qui ne paraisse plus en double ;
  - Méga-Tortank, Méga-Dracaufeu Y et les autres méga-évolutions immobiles : les faire bouger, en pixel arcade ;
  - Herbizarre aussi petit que Bulbizarre dans l'arbre ; fiche du starter trop allongée ;
  - évolution : l'écran doit remonter sur l'animation, au moins 3 s de plus, dont 2 s de plus sur la nouvelle forme ;
  - méga-évolution impossible malgré les PA, et un bouton en trop.
- **Constat** : la méga-évolution fonctionnait, mais son appui ouvrait une confirmation tout en bas de la fiche, hors de l'écran (rien ne semblait se passer, puis deux boutons en descendant). Le bouton « OK » existait deux fois : dessiné dans l'image du Pokédex et posé par-dessus.
- **Fait** (cache v93) :
  - classeur : sigle coloré après la bulle ; si la cote et l'état ne tiennent pas sur une ligne (petit écran, grosse cote), l'état passe sur une 2ᵉ ligne et la pastille grandit un peu ; la cote n'est jamais coupée ;
  - Pokédex : légende du « OK » ; bouton vert clair d'une seule couche (plus dessiné dans l'image) ; méga-évolution en un seul appui, sans confirmation ;
  - 10 méga-évolutions sans animation (PokeAPI n'en a pas) animées à partir de leur image au pixel près : respiration, ou vol pour Méga-Roucarnage, Méga-Ectoplasma, Méga-Léviator et Méga-Ptéra ;
  - arbre : chaque forme au moins 25 % plus grande que la précédente (Herbizarre 33 px contre 26 px pour Bulbizarre) ; encadré du Pokémon de même hauteur pour toutes les fiches ;
  - évolution de 7,2 s (contre 3,2 s) : silhouettes qui alternent de plus en plus vite, éclat, puis la nouvelle forme près de 3 s avec « Félicitations ! » ; l'écran remonte dessus dès l'appui.
- **À confirmer** : la fin du message du porteur était coupée (« laisse uniquement un seul bouton en mentionnant "3 ») ; le seul bouton gardé affiche « Méga-évoluer · 2 500 PA ».

## 2026-10-31 — Accueil, PK et PA, Pokédex, didacticiel, états des cartes : 20 retouches du porteur

- **Demandes du porteur** (le serveur est mis de côté pour l'instant) :
  - accueil : bulle jaune à flèches retirée sous le compagnon ; courbe de la valeur qui passe en douceur d'une période à l'autre ; « Toutes les sorties » seulement à côté de « Prochaines sorties » ;
  - solde des PK : « Compagnons à thème » et « Mon Pokédex » retirés, « Règles des PK et PA » ; solde des PA : sa propre fenêtre ; pour chacun : c'est quoi, comment on les gagne, à quoi ils servent ;
  - « Règles des PK et PA » : sans les bulles Mentions légales, Confidentialité, Conditions, sans l'encadré « Pas un jeu d'argent » ni « Lire le texte complet des règles » ;
  - Pokédex : « vus » retirés, « Débloqués » sur 156 ; flèches « les évolutions » ; Pokédex, « OK » et croix plus grands ; « OK » animé quand les PA suffisent pour l'évolution affichée ; encadré du Pokémon plus haut ; « Arbre de Pokévolution » dans la police de « Pokédex » ; encadrés « Ton compagnon », « Pokémon sélectionné », « C'est ton compagnon » et texte des PA du bas retirés ; arbre sans Pokémon qui se touchent (Méga-Tortank et Tortank) ;
  - didacticiel : œil de Pikachu sans carré au sourire ; séries qui défilent lentement de gauche à droite ; cadre du solde des PK qui ne mord plus sur les PA ; bouton pour revenir à l'étape précédente ;
  - Mon profil : icône de livre pour « Revoir le didacticiel » ;
  - classeur : la bulle de l'état de la carte à droite du prix, à la place du point vert ; couleurs des 6 états : Mint or, Near Mint vert foncé, Excellent vert clair, Good jaune-vert, Played jaune-orangé, Poor rouge-orangé.
- **Fait** : tout ce qui précède (cache v92). Arbre vérifié sur les 156 Pokémon et leurs méga-évolutions : au moins 6 px entre deux voisins. Étiquette « Faible » du Territoire un peu éclaircie (contraste).
- **Choix faits, à confirmer par le porteur** :
  - le « vu » est retiré entièrement : un scan ne fait plus apparaître un Pokémon du Pokédex ;
  - un appui sur le solde de PA ouvre d'abord la récupération quand des PA du jour attendent, sinon « Mes PA » ;
  - le bouton « Tous les Pokémon » reste ; la mention « Les PK ne s'achètent pas et n'ont aucune valeur en euros » reste dans « Mes PK ».

## 2026-10-30 (suite 8) — Le didacticiel n'apparaissait pas à jour sur le téléphone

- **Constat du porteur** : le didacticiel de l'app n'est pas à jour.
- **Vérifié** : https://dropicards.fr sert bien la dernière version (cache v90, lue en ligne) ; toutes les demandes du jour sont dans cette version. Le décalage vient du téléphone : nginx n'envoie pas « Cache-Control: no-cache » (le fichier `web/_headers` ne vaut que pour Cloudflare Pages), donc le navigateur pouvait resservir une ancienne `app.js`.
- **Fait** (cache v91) : le service worker redemande toujours les fichiers au serveur (« no-cache », réponse légère si rien n'a changé) ; `app.js` porte son empreinte (`app.js?v=…`) ; la nouvelle version est cherchée à chaque ouverture et à chaque retour sur l'app, puis l'app se recharge d'elle-même une fois (quand elle passe en arrière-plan, collection enregistrée).
- **Reste conseillé** : ajouter « Cache-Control: no-cache » pour `index.html`, `app.js` et `sw.js` dans nginx (voir `docs/18`, §4.3).

## 2026-10-30 (suite 7) — Didacticiel : textes du porteur, PA et PK présentés, transitions ; message qui restait affiché

- **Demandes du porteur** :
  - « Notifications refusées… » restait affiché en bas de l'écran ;
  - la valeur de la collection était coupée au début du didacticiel ;
  - nouveaux textes pour le classeur, le scan, le radar, les séries, le Pokédex et l'arbre d'évolution ;
  - une étape sur les PA (points d'Aura) et une sur le solde des PK ; l'étape « Tous les Pokémon » retirée ;
  - une transition plus agréable quand le didacticiel change de page ; fautes d'orthographe corrigées.
- **Fait** :
  - tout message en bas de l'écran s'efface seul au bout de 2,8 s ;
  - sur un petit écran, le cadre de la première étape se limite au montant (le nombre reste entier, au-dessus de la bulle) ;
  - didacticiel en 12 étapes, textes du porteur avec l'orthographe revue ;
  - changement d'onglet « en iris » : le trou du cadre se referme (l'écran reste assombri), la page glisse, puis il se rouvre au centre de la partie suivante. Cache v90.
- **Lecture retenue** : « supprimer l'encadré Tous les Pokémon » = l'étape du didacticiel ; le bouton « Tous les Pokémon » reste dans le Pokédex.

## 2026-10-30 (suite 6) — Accueil revu : les 3 pages restent accessibles

- **Constat du porteur** : depuis Mon profil › « Retour à la page d'accueil », impossible d'aller à la 2ᵉ page : l'accueil se fermait.
- **Fait** : compte déjà créé → page 1 « Continuer », page 2 « Ton compte Dropicards » (adresse préremplie, mot de passe facultatif), page 3 préremplie (âge, pseudo, starter actuel) ; retour par la flèche et les points ; « Passer » ramène à l'app. Valider rejoue le remerciement et le didacticiel ; même starter : évolution et compagnon gardés ; date d'inscription gardée. Cache v89.

## 2026-10-30 (suite 5) — Page 3 du premier écran : âges, choix visibles, remerciement du compagnon

- **Demande du porteur** :
  - 4 tranches d'âge : moins de 15 ans, entre 15 et 25 ans, entre 25 et 35 ans, 35 ans et plus ;
  - âge et compagnon choisis bien visibles ;
  - une transition entre les descriptions des starters ;
  - après le choix : le compagnon au milieu de l'écran, qui sourit et dit « Merci de m'avoir choisi ! Pour te remercier, je vais te montrer comment fonctionne l'application », puis le didacticiel directement.
- **Fait** :
  - bulle d'âge choisie blanche avec une coche verte ; bulle du starter à la couleur de son type (Plante, Feu, Eau, Électrik), coche, halo ; les autres s'effacent ;
  - la nouvelle description arrive en glissant du côté du Pokémon touché ;
  - sourire dessiné au pixel pour les 4 starters (yeux fermés « ^ ^ ») ; scène au centre (rayons, socle, étincelles), phrase écrite avec la voix du didacticiel ; le compagnon vole ensuite jusqu'à la bulle du didacticiel, qui commence aussitôt. Cache v88.

## 2026-10-30 (suite 4) — Premier écran en 3 pages, starter choisi à l'inscription

- **Demande du porteur** : un premier écran en 3 pages, avec retour possible et les mêmes transitions que dans l'app :
  1. présentation et bouton « Créer mon compte » (à la place de « Commencer l'aventure ! ») ;
  2. e-mail, mot de passe, bouton « Suivant » ;
  3. âge, pseudo de dresseur, choix du compagnon parmi les 4 starters.
  Le starter touché est mis en avant avec une courte description et « Choisir X comme compagnon » ; c'est lui qui fait le didacticiel.
- **Fait** :
  - flèche de retour et trois points (on revient à une page déjà vue, jamais en avant sans valider) ; e-mail et mot de passe gardés en mémoire pendant le retour ;
  - transition glissée façon iOS entre les pages (aucune si les animations sont réduites) ;
  - âge en trois choix (moins de 15 ans, 15 à 17 ans, 18 ans et plus) ; moins de 15 ans : pas d'e-mails de nouveautés ;
  - le starter choisi devient compagnon et Pokémon du Pokédex, puis lance le didacticiel ; la question du starter du didacticiel n'est plus posée ;
  - compte déjà créé (accueil revu depuis Mon profil) : « Continuer l'aventure » et « Passer ». Cache v87.
- **Limite connue** : toujours **sur l'appareil seulement** (âge compris) en attendant le serveur ; le mot de passe n'est jamais enregistré.

## 2026-10-30 (suite 3) — Compte à la première ouverture, Pokédex mis en avant, méga-évolutions en pixel

- **Demandes du porteur** :
  - « Retour à la page d'accueil » dans Mon profil ;
  - les 5 cartes du premier écran restaient noires ;
  - après « Commencer l'aventure ! » : plus de questions, création du compte (e-mail, mot de passe), puis pseudo ;
  - « Ventes et marge » retiré de Mon profil ; « PA dispo aujourd'hui » ;
  - Pokédex : Reptincel et les autres centrés sur leur socle, Pokémon touché en grand avec sa description à côté, fiche sans talents, capture, prix, état dans le Pokédex ni rareté ;
  - méga-évolutions en pixel comme les autres.
- **Fait** : tout ce qui précède. Cartes gardées dans l'app (`web/img/onb/`). Centre du corps seul (érosion). Sprites des méga au style Noir et Blanc (PokeAPI). Cache v86.
- **Limite connue** : le compte est créé **sur l'appareil seulement**, faute de serveur (`docs/17`, en attente de « go »). L'e-mail et le pseudo sont gardés ; le mot de passe n'est jamais enregistré par l'app (le trousseau du téléphone peut le garder) et ne sert donc encore à rien.

## 2026-10-30 (suite 2) — dropicards.fr ne se mettait plus à jour

- **Constat du porteur** : rien ne change sur https://dropicards.fr depuis le passage sur le serveur OVH ; le serveur ne récupère pas la branche publiée sur GitHub.
- **Fait** : `tools/server/install-autoupdate.sh`, à lancer une fois sur le serveur. Il trouve le dossier servi par nginx, demande « OUI », sauvegarde le site, puis copie toutes les 5 minutes le dossier `web/` de la branche publiée, avec un garde-fou contre une version incomplète. Il ne touche ni à nginx, ni au pare-feu, ni à SSH. Marche à suivre dans `docs/18` §4.3.
- **Reste à faire par le porteur** : se connecter au serveur et lancer le script (Claude n'a aucun accès au serveur).

## 2026-10-30 (suite) — Option C renforcée envisagée ; prompt « Axicall Control »

- **Porteur** : préfère gérer le serveur lui-même avec l'aide de l'IA (option C) plutôt que payer un prestataire ; demande comment voir les alertes et s'il peut faire tourner des IA en permanence.
- **Proposé (à confirmer par le porteur)** : « C renforcée » = automatisation maximale (mises à jour, sauvegardes hors serveur avec restauration testée chaque mois, surveillance externe, alertes sur le téléphone), base PostgreSQL gérée par OVH, relecture ponctuelle par un professionnel avant les données d'utilisateurs ; agents d'IA en lecture seule (résumer, alerter, proposer), jamais d'action sans validation.
- **Fait** : `docs/19-prompt-axicall-control.md`, prompt complet pour le projet « Axicall Control » (rôle, règles, étapes 0 à 7, outils : ntfy ou Telegram, UptimeRobot, Beszel ou Netdata, Healthchecks.io, CrowdSec, Cockpit derrière Tailscale, restic, Ollama, n8n).

## 2026-10-30 — Guide du porteur de A à Z ; hébergement à rechoisir

- **Contexte** : le porteur n'est pas développeur et ne sait pas se connecter à son serveur ; il demande quoi faire de A à Z.
- **Fait** : `docs/18-guide-porteur-de-a-a-z.md` (mots à connaître, état du projet, connexion SSH pas à pas, audit, protections personnelles, étapes 0 à 6 avec qui fait quoi et coûts) ; `tools/server/audit.sh`, audit du serveur en lecture seule.
- **Décision attendue du porteur** : qui s'occupe du serveur. A, hébergement géré (site sur Cloudflare Pages, comptes sur un service géré européen), **recommandé** ; B, serveur dédié entretenu par un professionnel ; C, serveur dédié entretenu par le porteur avec Claude (risque élevé pour un non-développeur). Rappel : `docs/16` §5 déconseillait déjà un serveur géré soi-même ; la proposition des comptes (`docs/17`) supposait C et sera adaptée au choix.

## 2026-10-29 (nuit, suite) — Premier écran, didacticiel plus fluide, notifications ; comptes proposés

- **Demandes du porteur** : premier écran retouché, création de compte à la première utilisation (e-mail et mot de passe, Face ID ensuite), didacticiel plus fluide et mieux cadré, pastille « 1 » sur le solde de PA, rubrique « Notifications » dans Mon profil. Le logo pas encore à jour sur son téléphone est mis de côté par le porteur.
- **Fait** :
  - premier écran : « Viens découvrir toutes les fonctionnalités de Dropicards » (texte demandé, corrigé : « Vient découvrir toutes fonctionnalités chez Dropicards ») ; 4ᵉ ligne « Gagne des PK et PA pour remporter des lots et enrichir ton Pokédex » avec une manette ; cinq cartes (Pikachu-ex « forêt » de Héros Transcendants à gauche, Mewtwo-ex illustration spéciale du 30ᵉ anniversaire à droite) ; « Commencer l'aventure ! » ; « Essayer avec la collection de démo » retiré ;
  - didacticiel : 11 étapes (fiche du Pokémon retirée) ; bulle placée avant le défilement, à la hauteur de sa phrase ; cadre lissé image par image ; valeur entière encadrée ; radar sans les petites lignes ; PK shop en petit carré centré, nouveau texte ; starter à la taille exacte du compagnon à la fin ;
  - pastille « 1 » à la place du « ! » ; Mon profil › Notifications (PA, Booster PK, pièce, sorties et boutiques), rappels calculés sur l'appareil, pastille sur l'icône de l'app ; `web/sw.js` v85.
- **Proposé, à valider** : comptes Dropicards (`docs/17-proposition-comptes-dropicards.md`) : socle minimal du serveur d'abord (≈ 47 h), puis API des comptes, écrans, synchronisation, RGPD ; ≈ 137 h (17 j à 8 h/j, 46 j à 3 h/j), 2 à 20 €/mois. Face ID par clé d'accès (passkey) ; e-mails de nouveautés seulement avec consentement (case décochée). **Rien n'est codé côté serveur sans « go ».**
- **Points ouverts** : six décisions du §5 de la proposition ; compte obligatoire probablement refusé par Apple pour les stores (règle 5.1.1) ; notifications app fermée seulement avec les comptes (Web Push).

## 2026-10-29 (nuit, fin) — Logo : gemme des PK dans la carte « O »

- **Demande du porteur** : garder exactement le logo Dropicards, mais remplacer l'intérieur de la carte « O » par le logo des PK.
- **Fait** : en-tête et favicon (carte O seule) régénérés depuis le fichier du porteur (`tools/brand/import_logo.py`, `pk_card`) ; contour, liseré blanc et cadre intérieur de la carte gardés ; puis, à sa demande, la gemme aussi dans la carte de l'icône de l'app (« D » + carte), et l'animation d'évolution amenée au centre de l'écran dès l'appui.

---

## 2026-10-29 (nuit, suite) — Pokédex allégé, tailles croissantes, centrage

- **Demandes du porteur** : centrer les Pokémon sur leurs socles ; retirer les statistiques et les niveaux d'évolution de la fiche (surtout sur téléphone) ; tailles dans l'ordre croissant de l'évolution ; bulles du didacticiel centrées.
- **Fait** : centre d'équilibre de chaque sprite (corps et pieds) posé au milieu du socle, sprites volants posés d'après leur image médiane ; chaque forme au moins 10 % plus grande que la précédente à l'écran (la taille écrite reste la vraie) ; statistiques, puissance et « Évolue en … · Niveau » retirés ; bulle du didacticiel centrée sans pourcentage animé (même défaut Safari que la fiche).

---

## 2026-10-29 (nuit) — Pokédex : commandes visibles et guidées

- **Demande du porteur** : les touches cliquables du Pokédex « n'étaient pas du tout intuitives » ; les rendre visuelles, animées et compréhensibles dès la première utilisation.
- **Fait** : croix en relief à flèches et bouton vert « OK » dessinés par-dessus l'appareil, retour à chaque appui (touche qui s'enfonce, voyants, écran qui glisse, bip), « OK » qui brille quand l'action est possible, aide de première utilisation (doigt animé, bulle, « Compris ! »).

---

## 2026-10-29 (soir) — Hébergement : serveur dédié, Cloudflare Pages débranché

- **Décision du porteur** : l'app est hébergée sur son **serveur dédié** (OVHcloud Rise-S, AMD Ryzen 7 9700X), à l'adresse **https://dropicards.fr** ; le serveur récupère seul la branche publiée chaque jour par GitHub Actions. Il demande de débrancher Cloudflare.
- **Fait dans le dépôt** : lien de partage (+300 PK) vers dropicards.fr ; mentions légales (hébergeur : OVH SAS, Roubaix ; services contactés) ; README (hébergement, en-têtes à reproduire dans le serveur web, marche à suivre pour débrancher Cloudflare) ; workflow et documents.
- **Option retenue par le porteur (même soir)** : garder le projet Cloudflare Pages et **rediriger** `pokemon-appli.pages.dev` vers https://dropicards.fr (`web/_redirects`, 302, réversible en retirant le fichier) ; la zone DNS reste en place.
- **Reste au porteur** (ses comptes) : déménager les collections enregistrées sur l'ancienne adresse (sauvegarde puis restauration), supprimer le projet Cloudflare Pages et l'application Access, retirer l'accès GitHub de Cloudflare, garder la zone DNS tant que les domaines en dépendent. **À vérifier** : nom exact de l'hébergeur dans les mentions légales (OVH SAS supposé d'après « Rise-S »).

---

## 2026-10-29 (suite) — Pokédex : vu par le scan, attrapé avec des PA, progression

- **Décision du porteur** (« go faire 2 et 4 ») :
  - **2. Vu / attrapé** : scanner une carte d'un Pokémon le fait « voir » (il sort de sa silhouette) ; le débloquer avec des PA l'« attrape » ;
  - **4. Progression** : attrapés et vus sur 171, par stade et par type.
- **Choix par défaut, à confirmer par le porteur** : le déblocage ne demande pas d'avoir vu le Pokémon ; le scan ne rapporte pas de PA (l'équilibre des PA reste à trancher) ; seul le scan fait « voir » (une carte ajoutée autrement ne compte pas), pour donner une raison de scanner.
- **Mesure prévue** : scans par semaine et part des scans qui font voir un nouveau Pokémon.

---

## 2026-10-29 — Pokédex : les cartes de chaque Pokémon et le Pokédex dessiné cliquable

- **Décision du porteur** (« go faire 1 et 3 », sur ma liste de propositions pour le Pokédex) :
  - **1. Les cartes de chaque Pokémon** dans sa fiche : mes cartes (exemplaires, valeur), ses 3 cartes les plus chères, « Voir ses N cartes » ;
  - **3. Le Pokédex dessiné cliquable** : la croix fait défiler la famille et le Pokédex, le bouton vert fait l'action de la fiche, le petit écran montre le Pokémon touché.
- **Écartés à ma recommandation** : une vraie Game Boy à l'écran (forme déposée par Nintendo), les vrais cris des Pokémon (sons officiels), un jeu « Qui est ce Pokémon ? ». En attente : « vu / attrapé » par le scan (après l'équilibre des PA), le compteur de progression, les shiny.
- **Pourquoi** : relier le Pokédex à la valeur des cartes, le cœur de l'app (principe 4 de CLAUDE.md : pas de Pokédex « pour lui-même »). Mesure prévue : part des fiches où l'on touche « Voir ses cartes » ou une de ses cartes.
- **Données** : noms anglais ajoutés à `tools/sprites/dex.json` (PokeAPI) pour les cartes des extensions sans version française ; aucune nouvelle source ni dépense.

---

## 2026-10-28 (suite) — Pokédex v2 (tous les Pokémon débloqués avec des PA), PA du jour à récupérer, didacticiel v3, voix au choix

- **Décisions du porteur :**
  - le choix du compagnon est **remplacé par le Pokédex** : tous les Pokémon (156 compagnons et 15 méga-évolutions) se débloquent avec des **PA**, prix **selon le stade** (forme de base 100 PA, 1re évolution 500, 2e évolution 1 500, légendaires et fabuleux 2 000, Kyogre/Groudon/Rayquaza 3 000 avec leur thème, méga-évolutions 2 500 ; les 4 starters offerts) ; les PK ne servent plus qu'au PK shop ;
  - fiche de chaque Pokémon **avec la description officielle du Pokédex** (texte des jeux) ;
  - les **PA ne sont plus crédités à l'ouverture** : pastille sur le solde, bouton « Récupérer mes PA », animation d'après sa vidéo (récompense façon Brawl Stars) ;
  - didacticiel : on avance avec « Suivant », place du compagnon vide jusqu'à la fin, bulles qui ne cachent rien, Pokédex balayé en détail, jeux et PK shop retirés (une phrase annonce le PK shop) ;
  - voix : 7 propositions envoyées ; **« Bulles douces » (voix 4) choisie par le porteur**.
- **Fait :** `tools/sprites/fetch_dex.py` et `dex.json` (données PokeAPI figées : catégorie, types, taille, poids, talents, habitat, capture, statistiques, évolution, description) ; `tools/web/dex.js` (route de la famille du Pokémon touché, méga-évolutions au bout de la ligne, fiche, « Tous les Pokémon », déblocage) ; boutons hexagonaux et grille des méga retirés ; Pokémon centrés sur leur socle ; récupération des PA (`pa.js`, `paClaim`) ; `tools/web/tuto.js` v3 ; `tools/web/voice.js` (6 voix synthétisées et la voix du téléphone, `?voix=1` à `?voix=7` pour les essayer).
- **Puis (demande du porteur) :** voix « Bulles douces » retenue ; dans le Pokédex, **tailles proportionnelles** : chaque Pokémon à la hauteur de sa taille réelle dans sa famille (Carapuce < Carabaffe < Tortank < Méga-Tortank), méga-évolution toujours un peu plus grande que sa forme de base.
- **Relecture critique (agents), 12 défauts corrigés :** retour arrière pendant le didacticiel, la liste du Pokédex, la confirmation de méga ou « Tes PA du jour » (fenêtre restée ouverte sur un autre écran) ; tailles calculées d'après les vraies dimensions des sprites (`tools/sprites/dex_boxes.py`) : plus de méga plus petite que sa forme de base, images fixes justes en mouvements réduits ; colonnes de 72 px (route entière à 360 px) ; noms courts « Méga X » et « Méga Y » ; recherche « #133 » ; série et gain du lendemain justes quand des PA attendent ; rappel des PA après l'animation d'entrée ; bulle du didacticiel qui ne cache plus l'élément sur petit écran ; clavier (focus, Tab, Échap) dans la bulle, la liste et la fenêtre des PA.
- **Point d'attention :** les grades demandent toujours 15, 30, 100 puis 151 compagnons débloqués, désormais avec des PA (+10 à +30 par jour) : **compléter le Pokédex prendra beaucoup plus de temps qu'avec les PK** ; barème des PA ou conditions des grades à revoir avec le porteur. Textes et descriptions Pokémon : décision du porteur sur les contenus Pokémon.

## 2026-10-28 (suite) — Didacticiel animé avec la mascotte qui parle, Évolution devenue Pokédex (route façon Digimon), règles des PK et des jeux en images

- **Demandes du porteur :** didacticiel animé, chaque élément encadré, la mascotte (le starter) qui parle avec la bouche qui bouge et un petit bruit pendant que le texte défile, fin « Maintenant que tu connais toute l'appli, tu pourras me trouver ici » sur la place du compagnon ; « Évolution » devient « Pokédex » avec un visuel de Pokédex (sa photo) portant le logo PK ; design complet de l'évolution d'après sa vidéo (route d'évolution de Digimon World Dusk), adapté à Pokémon ; règles des PK et des jeux plus esthétiques et visuelles.
- **Fait :**
  - **Didacticiel** (`tools/web/tuto.js`) : 9 étapes ; cadre jaune animé sur chaque partie, reste de l'écran assombri, trait pointillé vers la mascotte, onglet de la barre du bas cerclé ; texte lettre par lettre ; bouche ouverte et fermée en alternance (images au pixel près, `tools/sprites/make_talk.py`) ; petit cri synthétisé (Web Audio, voix par starter, son coupable) ; fin sur le compagnon où le starter saute. Revoir le didacticiel ne remet plus le starter à sa première forme.
  - **Pokédex** (`pa.js`, `dex.css`) : Pokédex rouge dessiné avec la gemme des PK sur l'objectif (`tools/brand/make_pokedex.py`), Pokémon du moment et solde de PA sur ses écrans ; écran « Route d'évolution » néon (étapes, socles lumineux, trait orange, branches en pointillés pour Méga-Dracaufeu X et Y, panneaux « actuel » et « sélectionné », boutons hexagonaux Évoluer, Compagnon, Méga). Règles inchangées (500, 1 500, 2 500 PA).
  - **Règles des PK et des jeux** (`legal.js`, `rules.css`) : cartes visuelles (gains, chances du Booster PK en barre, pile ou face, délais et scans par grade avec le grade actuel en avant, série des PA, prix du Pokédex, PK shop, « Pas un jeu d'argent ») ; texte complet gardé, dépliable.
- **Relecture critique (agents) puis corrections :** mascotte qui disparaissait en fin de phrase ; app sous le calque bloquée pendant la visite (avant : un toucher changeait d'écran et le cadre restait sur l'ancienne position) ; temps de lecture selon la longueur du texte, pause quand la bulle a le focus, focus placé dans la bulle ; fin adaptée si le compagnon n'est plus le starter ; jauge de Raichu en forme finale ; boutons de la route et hexagones accessibles (rôle bouton, focus visible) ; « Méga » bloqué pendant une évolution ; barre des chances à l'échelle ; texte des règles : les PK servent aussi au PK shop (lots offerts), plus de « ni en biens ». **À faire relire avant publication** (docs/14).
- **Point d'attention :** Pokédex, sprites et noms relèvent de la décision du porteur sur les visuels Pokémon (2026-10-03) ; le Pokédex est redessiné, pas copié, et ne sert pas d'identité à l'app. Le son du didacticiel est à écouter sur téléphone.

## 2026-10-28 (suite) — Méga-évolutions à 2 500 PA validées, 500 scans au Grand maître mondial, pastille PA décalée, propositions d'illustration des PA

- **Décisions du porteur :** 2 500 PA par méga-évolution **validé** ; item « Deluxe » à définir plus tard ; Grand maître mondial Pokémon : **500 scans par jour** au lieu de 100.
- **Fait :** pastille des PA descendue de 7 px dans l'en-tête (elle chevauchait celle des PK) ; 6 propositions d'illustration des PA (`tools/brand/make_pa_proposals.py`, `tools/brand/pa/planche.html`) autour d'une flamme ou d'une âme au plus profond de l'être (chakra, nen) : A Âme ardente (violet), B Chakra (or), C Nen (vert émeraude), D Cœur d'éveil (bleu glacier), E Flamme d'évolution (rouge et or, spirale), F Esprit (rose magenta) ; **choix du porteur attendu** avant de remplacer `web/img/brand/pa.svg`. Le porteur retient E (spirale) et F (halo) et demande un style « flamme d'âme » : 2ᵉ série de 6 variantes G1 à G6 (`tools/brand/make_pa_soul.py`, `tools/brand/pa/planche-soul.html`) : flamme d'âme lumineuse, spirale au cœur, halo autour, flammèches ; rouge et or, rose, violet, bleu spectral, sphère en orbite, or vers rose. Puis, forme gardée, 3ᵉ série (`tools/brand/make_pa_lotus.py`, `tools/brand/pa/planche-lotus.html`) : violet sombre et spectral, **lotus du logo du porteur** au cœur à la place de la spirale, petites orbes d'énergie à la place des flammèches, halo autour de la base ; H1 violet nuit, H2 améthyste et spectre, H3 prune ; puis barre du lotus retirée et contour redessiné en courbes régulières, en deux formes, redessinées à la demande du porteur : une vraie goutte symétrique à pointe fine (H1 à H3) et une vraie flamme aux langues qui ondulent, cœur plus clair (H4 à H6) ; puis redessinées d'après deux modèles envoyés par le porteur : goutte d'eau brillante (sombre en haut, lumineuse en bas, reflet et éclat) et pictogramme de feu (seulement son contour, le lotus au cœur, à la demande du porteur) ; reflet blanc à gauche des gouttes retiré. Le porteur retient **H3** (goutte prune) : 6 variantes de couleur I1 à I6 (`tools/brand/make_pa_h3.py`, `tools/brand/pa/planche-h3.html`) : prune, prune profonde, framboise, mauve, néon, prune et or. **Choix du porteur : I1**, installée dans l'app (`web/img/brand/pa.svg`, `tools/brand/make_pa_logo.py`) ; là où les PA sont expliqués (jeu d'évolution), les orbes gravitent doucement autour de la goutte (`pa-anim.svg`) ; un appui sur le solde de PA y mène directement.

---

## 2026-10-28 — Avantages des grades appliqués, nouvelles conditions, méga-évolutions ; vague 9 mise de côté

- **Décision du porteur :** la vague 9 des propositions v5 (« Chiffres justes ») est mise de côté, à reprendre plus tard.
- **Demande du porteur :** conditions et avantages de chaque grade (liste fournie le 2026-10-28).
- **Réponses du porteur :** avantages **appliqués** dans l'app (pas seulement affichés) ; seule la **carte de France** du Radar est réservée au Maître Pokémon (petit radar de l'accueil et Territoire ouverts à tous) ; méga-évolutions débloquées **avec des PA** ; dernier grade renommé **« Grand maître mondial Pokémon »**.
- **Fait :**
  - conditions : Recrue dès l'inscription ; Chasseur 1 500 PK ; Collectionneur 5 000 PK + 15 compagnons ; Dresseur Pokémon 10 000 PK + 30 compagnons ; Maître Pokémon 20 000 PK + 100 compagnons + 1 méga-évolution ; Grand maître mondial Pokémon 50 000 PK + 151 compagnons + 5 méga-évolutions ; PK gagnés au total, compagnons offerts compris ; parrainages retirés des conditions ;
  - avantages appliqués sur l'appareil : scans par jour (5, 10, 20, 50, 100, 100), Booster PK (24, 24, 10, 8, 6, 4 h), jeu de la pièce (fermé à la Recrue, puis 24, 10, 8, 6, 4 h), ticket du tirage dès Collectionneur, booster du PK shop dès Dresseur, item « Deluxe » au Grand maître mondial (article et prix à définir, affiché « bientôt »), carte de France du Radar dès Maître ; fiches des grades avec la liste du porteur ;
  - « Emblème collectionneur » écrit pour Dresseur, Maître et Grand maître dans la liste du porteur : compris comme l'emblème **de chaque grade** (à confirmer) ;
  - méga-évolutions : les 15 de Kanto, dans le jeu d'évolution, 2 500 PA chacune (**prix à confirmer**), Pokémon de base exigé comme compagnon ; elles deviennent des compagnons ; sprites de Pokémon Showdown et de PokeAPI ;
  - grade forcé pour les tests (`pkm-grade-force`) et dans l'Admin ; nouveau test `t-grades.mjs`.
- **Point d'attention :** tout reste sur l'appareil, donc falsifiable (mode Admin, stockage) tant qu'il n'y a pas de serveur (propositions S74 à S78 de la v5) ; les lots réels restent à protéger avant toute ouverture.

---

## 2026-10-27 — Orientation serveur dédié et PostgreSQL ; propositions d'améliorations v5 avec la cybersécurité

- **Demande du porteur :**
  - l'app sera hébergée sur un **serveur dédié**, avec une base **PostgreSQL** ; domaines .fr et .com achetés ;
  - ajouter la catégorie cybersécurité au fichier des améliorations, avec une base « extrêmement bien sécurisée », et enrichir toutes les catégories.
- **Fait :** `docs/13-propositions-ameliorations-v5.md` (remplace la v4, gardée) :
  - 348 propositions, dont 198 nouvelles ;
  - cybersécurité refaite : 101 propositions en 14 parties (méthode, serveur, réseau et e-mail, PostgreSQL, sauvegardes, API, comptes, apps, anti-triche, GitHub, secrets, journaux et incidents, RGPD, vérifications) ;
  - nouvelle catégorie U (serveur dédié, API, PostgreSQL) et X (international) ; toutes les autres enrichies ;
  - vagues renumérotées : 12 « Socle du serveur sécurisé » (≈ 190 h) **avant** 13 « Comptes, synchronisation et PK sur le serveur » (≈ 175 h) ; coût annuel estimé de l'infrastructure : 400 à 1 100 €, plus un test d'intrusion conseillé (1 500 à 4 000 €) ;
  - 8 nouvelles décisions attendues (n° 13 à 20 : dédié ou VPS au départ, hébergeur, site sur Cloudflare Pages, connexion, langage, âge, test d'intrusion, personne de confiance).
- **Décalage signalé :** `docs/16` §5 déconseillait un serveur loué et recommandait Cloudflare Workers et D1 ; la v5 suit le choix du porteur (décision n° 13 à confirmer), `docs/16` à mettre à jour.
- **Règle d'or :** le serveur, la base et les comptes sont du développement lourd ; rien n'est lancé sans « go ».

---

## 2026-10-26 — Courbe en euros avec périodes, scan rapide avec les 6 états illustrés, PA et jeu d'évolution à la place de la roulette, didacticiel

- **Demande du porteur :**
  - courbe de la valeur : montants sur l'axe vertical, filtres « Aujourd'hui », « 1 semaine », « 1 mois », « Depuis le début » ;
  - scan : carte reconnue en 1,5 s au plus, affichée avec son montant, choix parmi les 6 états (prix selon l'état), bouton « Ajouter à ma collection » ;
  - les 6 états en bulles illustrées, de Mint (brillante, étoiles) à Poor (très abîmée) ;
  - Jeux : roulette supprimée, remplacée par un jeu d'évolution avec les Pokémon de Kanto ; starters Bulbizarre, Salamèche, Carapuce, Pikachu ; PA (points d'Aura) gagnés à la connexion du jour : +10, +15, +20, +25, +30 ; un jour manqué : retour à +15 ; évolutions en silhouette noire ; 500 PA pour la 2ᵉ forme, 1 500 PA pour la 3ᵉ ; logo des PA à proposer, à la place de la barre des tickets en haut à gauche ;
  - première installation : « Veux-tu suivre le didacticiel ? » ; si oui, choix du starter qui présente l'app en 45 s au plus, une phrase courte par onglet, puis le barème des PA.
- **Réponses du porteur :** PA comptés en jours d'affilée ; un seul choix de starter (didacticiel, compagnon et jeu d'évolution) ; les autres compagnons restent à débloquer avec des PK ; tickets affichés dans le PK shop.
- **Fait :**
  - **courbe** (`home.js`, `home-core.js`) : 4 périodes, « 1 mois » par défaut ; 3 ou 4 montants ronds sur l'axe vertical avec lignes pointillées, dates sous la courbe, variation de la période ; quantités recalculées jour par jour d'après les ajouts et les ventes ; au-delà de 30 jours (pas de cote plus ancienne), la plus ancienne valeur connue et les relevés quotidiens gardés sur l'appareil ;
  - **6 états illustrés** (`tools/conds/make_conds.py` → `web/img/conds/`) : Mint (étoiles qui scintillent, reflet), Near Mint, Excellent, Good, Played, Poor (fendue, coins abîmés) ; bulles dans le scan, « Ajouter un exemplaire » et « Modifier l'ajout » ;
  - **scan** : deux lectures en parallèle (numéro et nom), moteur préchauffé, boucle plus rapide ; une carte sûre dès la première lecture ouvre directement sa fiche (sinon « C'est laquelle ? ») ; fiche : la carte en grand, sa valeur Cardmarket selon l'état choisi, les 6 bulles, « Ajouter à ma collection » ; mesuré **0,37 s** sur la machine de test (ordinateur, fausse caméra) : **la mesure sur téléphone reste à faire** (`?debug=scan`) ;
  - **PA** (`pa-core.js`, `pa.js`, logo `web/img/brand/pa.svg` : flamme d'aura violette avec un orbe) : crédités une fois par jour à l'ouverture, avec un message (« +20 PA · 3 jours d'affilée ») ; pastille PA sous le solde de PK, qui ouvre le jeu ; les tickets passent dans le PK shop ; +500 PA dans le mode Admin ;
  - **jeu d'évolution** (onglet Jeux, à la place de la roulette) : choix du starter, lignée avec les formes suivantes en silhouette noire et leur prix, « Faire évoluer » (500 puis 1 500 PA), animation d'évolution de 3 s ; la nouvelle forme devient le compagnon ; Pikachu n'a qu'une évolution de la 1re génération (Raichu, 500 PA) ;
  - **didacticiel** (`tuto.js`) : proposé à la première installation, après l'accueil guidé ; choix du starter, puis 7 bulles de 6 s (42 s) qui ouvrent chaque onglet et entourent ce dont elles parlent : portefeuille, classeur, radar, séries, mini-jeux, shop, PA ; « Suivant » et « Passer » ; à revoir dans Profil › « Revoir le didacticiel » ou avec `?tuto=1`.

---

## 2026-10-25 — Accueil sans « Voir la liste », logo de l'en-tête agrandi, intro avec les PK

- **Demande du porteur :**
  - retirer « Voir la liste » à côté de « Boutiques autour de toi » ;
  - agrandir le logo Dropicards en haut au centre ;
  - ralentir l'animation d'ouverture d'une seconde et faire sortir la monnaie PK du booster à la place des cartes.
- **Fait :**
  - lien retiré ; Territoire reste ouvert par `?start=territory` ; texte « aucune boutique » revu (« Touche le radar pour chercher plus loin ») ;
  - logo de l'en-tête (accueil, Toutes les séries, Jeux, PK shop) : 172 px de large au lieu de 128 ;
  - Radar : la carte prend 70 % de l'écran et la fiche des boutiques 30 % (avant : environ 58 / 42, puis 65 / 35) ; après le scan, une petite icône animée en haut à droite invite à zoomer : deux mains au trait dessinées d'après les modèles envoyés par le porteur, A pincement redessiné au plus près de la photo du porteur (index recourbé en crochet, pouce dessous, doigts repliés et poignet, bords du téléphone ; pouce et index qui s'écartent, flèche double et petits éclats ; par défaut) et B index levé avec flèche double en diagonale (`?main=b`, choix gardé sur l'appareil) ; **le porteur garde la A** (2026-10-25) : la B est retirée ; la A est redessinée proprement, main d'un seul trait (plis des doigts reliés au contour), tout le dessin dans le rond du bouton, et le geste se fait en déformant le tracé (animation SVG) pour qu'aucun trait ne se détache ; image fixe, doigts écartés, si l'utilisateur limite les animations ; quand une boutique est choisie, la fiche s'arrête juste sous les quatre bulles (hauteur mesurée après affichage, 10 px sous les bulles, 62 % de l'écran au plus) : le texte qui suit (indice, horaires, adresse) n'apparaît qu'en faisant défiler ; main de l'aide au zoom remontée pour être centrée dans son rond ;
  - en-tête de l'app net dès l'ouverture : la vraie cause était la fin de l'intro, qui s'effaçait en voile jaune par-dessus l'app ; elle sort maintenant en glissant vers le haut, opaque (fondu gardé seulement si l'utilisateur limite les animations) ; lueur blanche du fond jaune (app et intro) retirée, reflet et étincelles animés masqués dans la zone de l'en-tête ; un appui zoome, elle disparaît au premier zoom ;
  - petit radar de l'accueil : la position est demandée dès que la rubrique apparaît à l'écran, sans appui (une fois par ouverture, pas si elle a été refusée), pour que les repères des boutiques s'affichent tout de suite ;
  - intro : 3 s au lieu de 2 (tous les temps × 1,5), puis le logo Dropicards tenu 0,5 s de plus (3,5 s, porteur) ; sept gemmes PK en éventail, celle du milieu grandit puis laisse place au logo ; version calme et version éclair inchangées.

---

## 2026-10-25 — Radar : logo à côté du nom, « Probabilité », ETB et UPC revus, tous les pop-ups, liste qui défile ; Maxi Toys devenus King Jouet

- **Demande du porteur :**
  - logo à droite du nom dans la fiche d'une boutique, plus en bas ;
  - mot « Probabilité » au-dessus des pourcentages ;
  - ETB rouge (comme UPC) : produit très prisé ; Booster et Autres items orange à vert ;
  - la liste du Radar ne défilait pas ;
  - certaines boutiques n'avaient pas de pop-up pendant le scan ;
  - petit radar de l'accueil : un repère de localisation qui surgit à chaque passage du faisceau, en continu ;
  - Maxi Toys : logo abandonné ; les magasins Maxi Toys, rachetés, s'affichent comme King Jouet.
- **Fait :**
  - fiche : logo à droite du nom, « Probabilité » au-dessus du pourcentage (fiche, résultats, Territoire, accueil) ;
  - indice : ETB −25 points et UPC −40 hors boutique spécialisée (ETB −15 et UPC −25 en boutique de cartes) : rouges en grande surface et magasin de jouets, orange au mieux en boutique de cartes ;
  - liste : les blocs du panneau ne sont plus comprimés, la liste défile ;
  - pop-ups : chaque boutique trouvée a le sien (empilés quand ils se recouvriraient, durée selon le nombre) ;
  - accueil : repère de localisation animé sur chaque point du petit radar, au passage du faisceau ;
  - Maxi Toys → King Jouet : nom, enseigne, logo et indice d'enseigne de jouets, dans l'app et dans la synchronisation OpenStreetMap ;
  - bulle d'infos de Territoire accrochée au bouton « + » ; styles des pop-ups du Radar renommés (ils pouvaient déformer cette bulle).

## 2026-10-24 (fin) — Logos sur la carte, dans les listes et la fiche ; couleurs de la chance ; La Grande Récré et Orchestra

- **Demande du porteur :**
  - les logos restent sur la carte après le scan ;
  - logo de l'enseigne en bas de la fiche d'une boutique ;
  - logos en face des boutiques dans la liste de l'accueil ;
  - couleur selon la chance : rouge 0-20 %, orange 20-40 %, vert clair 40-60 %, vert foncé 60-80 % ;
  - logos de La Grande Récré et d'Orchestra « coûte que coûte ».
- **Fait :**
  - logos gardés sur la carte après le scan, sans chevauchement (d'autres apparaissent en zoomant) ;
  - logo en bas de la fiche ; logo (ou pictogramme pour une boutique indépendante) en face des boutiques sur l'accueil, dans Territoire et dans les résultats du Radar ;
  - 4 couleurs de chance partout (points, légende, listes, fiches) ; libellés Faible, Moyenne, Bonne, Forte ; vert foncé ajusté à #2BC06A pour la lisibilité ;
  - La Grande Récré et Orchestra : logos pris sur leurs sites officiels (absents de Wikimedia et Wikipédia), recadrés ;
  - Orchestra (mode enfant et puériculture) ajoutée aux enseignes suivies dans OpenStreetMap (Wikidata Q28042940, type « Mode enfant et puériculture », indice de base faible : 10 points) ; ses magasins arrivent avec la synchronisation des boutiques.
- **Point d'attention :** logos de marques déposées (H3), pris aussi sur les sites des enseignes.

## 2026-10-24 (suite) — Vrais logos des enseignes ; Radar ouvert sur 5 km

- **Demande du porteur :** les vrais logos des enseignes dans les pop-ups du Radar ; le Radar s'ouvre par défaut à 5 km.
- **Fait :**
  - 9 logos sur 10 : E.Leclerc, Auchan, Fnac, Smyths Toys, Micromania-Zing depuis Wikimedia Commons (Wikidata) ; Carrefour, King Jouet, JouéClub et Cultura depuis Wikipédia en français (logos de marques déposées) ; La Grande Récré garde son badge dessiné (aucun logo dans son article) ;
  - récupération par un workflow manuel GitHub Actions (Wikimedia n'est pas joignable depuis l'environnement de travail), avec source, licence et auteur de chaque fichier dans `web/img/brands/brands.json` ;
  - mention dans les Informations légales : marques de leurs propriétaires, affichées seulement pour identifier les boutiques ;
  - Radar ouvert sur « Ma zone · 5 km », autour de la dernière position connue.
- **Point d'attention :** les logos restent des marques déposées des enseignes ; à inclure dans la consultation juridique (H3) avant toute sortie publique.

## 2026-10-24 — Radar : « Scanner ma zone », distances, produits, pop-ups des enseignes ; fiche boutique à 4 bulles

- **Demande du porteur :**
  - trois distances 5, 15 et 30 km ;
  - un seul bouton bleu-vert « Scanner ma zone » ;
  - en haut, les bulles Booster, ETB, UPC et Autres items (boosters, coffrets classeur, coffrets collection, duo packs, tri packs, Pokébox) ;
  - pendant le balayage, chaque boutique trouvée apparaît en pop-up avec le logo de son enseigne ;
  - fiche d'une boutique trouvée : 4 bulles Itinéraire, Activer une alerte (prévenu quand du stock réapparaît sur le site de la boutique), Site, Appeler.
- **Fait :**
  - « Balayer… » et « Autour de moi » remplacés par « Scanner ma zone » (position, puis la distance choisie ; ou le secteur choisi sur la carte) ; 15 km par défaut ; les anciennes distances (3, 10, 20 km) deviennent 15 km ;
  - « Tout », « Display » et « Objets de valeur » retirés du Radar ; Booster et Autres items ajoutés à l'indice de chance (plus favorables aux grandes surfaces et magasins de jouets) ; Territoire garde ses propres bulles ;
  - pop-ups : badges aux couleurs des 11 enseignes du fichier, sinon le nom de la boutique ; 8 à la fois au plus, sans chevauchement ; balayage allongé à 4,2 s ;
  - fiche : 4 bulles toujours visibles en haut.
- **Écarts assumés, à valider par le porteur :**
  - **logos :** les logos officiels des enseignes n'ont pas pu être récupérés (Wikimedia inaccessible depuis l'environnement de travail) et sont des marques déposées : badges dessinés aux couleurs des enseignes à la place ; les vrais logos demandent une vérification des droits (H3) ;
  - **alerte de stock :** aucune source ouverte ne donne le stock en ligne des enseignes, et le scraping est exclu (décision du 2026-10-03) ; l'alerte est enregistrée, l'app explique que le suivi du stock n'est pas encore branché et prévient la veille et le jour des sorties. Un vrai suivi demanderait des accords ou des flux des enseignes, plus un serveur et des comptes (G2, G4).

## 2026-10-22 — Six états des cartes, valeur selon l'état, article centré

- **Demande du porteur :** dans la fenêtre d'ajout, l'article choisi centré et agrandi (scellé et cartes) ; pour les cartes, garder le choix de l'état avec sa liste (Mint, Near Mint, Excellent, Good, Played, Poor) et faire varier le prix selon l'état.
- **Fait :**
  - six états partout (ajout, scan, « Modifier l'ajout », import CSV, fiche « Prix selon l'état ») ; Near Mint par défaut ; les anciens « Joué » deviennent « Played » ;
  - coefficients d'estimation Dropicards appliqués à la cote Cardmarket (celle d'un exemplaire Near Mint) : Mint 115 %, Near Mint 100 %, Excellent 85 %, Good 70 %, Played 55 %, Poor 30 % ; la valeur de l'ajout, la vignette et la valeur de la collection suivent l'état (et la langue : JP 70 %) ; une phrase décrit l'état choisi ;
  - fenêtre d'ajout : article seul, centré et agrandi ; scellé toujours sans état.
- **Validé par le porteur (2026-10-22) :** les coefficients Mint (115 %), Good (70 %) et Poor (30 %), proposés faute de cote par état en accès ouvert chez Cardmarket.

## 2026-10-22 — Ajout d'une carte comme celui du scellé

- **Demande du porteur :** « Ajouter un exemplaire » sur une carte (ouverte depuis une extension, le classeur ou sa fiche) ouvre la même interface que l'ajout d'un produit scellé.
- **Fait :** seul l'article choisi, sans onglet « Vente », sans état ni prix payé ; restent la langue, la quantité et la valeur Cardmarket ajoutée (valeur à l'unité, collection, grade). L'exemplaire est enregistré en Near Mint, sans prix d'achat.
- **Inchangé :** « Modifier l'ajout » (historique de la fiche) permet toujours de saisir un prix payé et un état ; la vente reste accessible par « Marquer comme vendu ».
- **Conséquence :** la marge d'une carte ajoutée ainsi reste « Prix d'achat à compléter » tant que le prix n'est pas saisi par « Modifier l'ajout ».

## 2026-10-22 — Retouches : valeur, scellé, classeur, son du passage de grade

- **Demande du porteur :**
  - sous la courbe de « Valeur de toute ma collection », seulement « Calculé selon les cotes Cardmarket » (source, date et note retirées ; la date reste dans l'en-tête) ;
  - catalogue du scellé : « Pokébox » devient « Autres items » (tout ce qui n'est ni ETB, Display, UPC, Boosters, Mini tin ni Bundle) ; la flèche de retour dans une extension revient à la liste des séries ;
  - « Tout afficher » du scellé : 2 produits par ligne, photos plus grandes ;
  - « Mon classeur » : plus de cadre autour des onglets « Mes cartes » et « Mes produits scellés » ;
  - un son à chaque passage de grade (charge, éclatement, fanfare), synthétisé dans le navigateur (Web Audio), sans fichier.

## 2026-10-22 — Visuels des cartes : nouvel essai en PNG, diagnostic du CDN

- **Signalement du porteur :** plus aucun visuel de carte (classeur, Toutes les séries).
- **Constat :** le CDN TCGdex répond normalement (200, image/webp, vérifié depuis GitHub) et la démo affiche les visuels dans Chromium et WebKit avec le vrai CDN (workflow manuel `images-check.yml`, `tools/web/e2e/diag-images.mjs`) ; le site est désormais derrière Cloudflare Access (page de connexion), sans effet sur les images qui viennent du CDN.
- **Livré :** un visuel TCGdex en WebP qui ne se charge pas est redemandé en PNG (même adresse) avant la carte dessinée ; test navigateur (`t-lotA`).

## 2026-10-21 — Mon classeur : valeur en haut, vitrine du scellé, fiche en panneau, catalogue du scellé par type et par série

- **Demande du porteur** (2026-10-21, avec deux vidéos), après des maquettes de 6 puis 5 propositions : garder la grille 3 × 3 de « Mes cartes » avec la valeur totale en haut, écrite comme « Valeur de toute ma collection » ; vitrine en verre éclairée (proposition 2) pour « Mes produits scellés », avec le même en-tête et les mêmes pastilles de prix que les cartes ; retirer les bulles « Trier », « Cote », « Récents », « Nom », « Filtrer » ; une fiche proche de sa vidéo 1 au toucher d'une carte ; « Ajouter des produits scellés » avec les seuls filtres Tout, ETB, Display, UPC, Boosters, Pokébox, Mini tin, Bundle, un choix par série et une fiche avec tendance, prix et ajout direct (vidéo 2).
- **Livré :**
  - classeur : valeur totale de l'onglet en haut (Sora, blanc, contour noir), tri par cote seulement, vitrine 3 par tablette (pages de 9) ;
  - fiche en panneau (`tools/web/fiche.js`) : visuel, cote Cardmarket, ajouter, vendre, retirer, prix du marché Cardmarket (tendance, moyennes 7 et 30 jours, veille, plus bas demandé), acheter sur Cardmarket, ventes réussies eBay (lien), historique du prix (7 j, 1 mois, tout pour le scellé), investi, prix par état, mes exemplaires ;
  - catalogue du scellé : « Par type » et « Par série », recherche, grille de 3 avec « + Ajouter » et « Détails ».
- **Retouches du même jour (porteur) :** formulaire d'ajout réparé sur téléphone (le bouton « Ajouter à ma collection » sortait de l'écran) ; pour un produit scellé, seul l'article choisi, sans onglet « Vente », état ni prix payé (restent langue, quantité, valeur Cardmarket) ; un seul bouton jaune en bas de chaque onglet, vide ou non (« Ajouter des cartes » ouvre « Toutes les séries », « Ajouter des produits scellés » le catalogue du scellé) ; tuiles « Cartes » et « Produits scellés » retirées sous le classeur.
- **Retouches suivantes (porteur, 2026-10-21) :** « Plus-value latente » retirée de « Valeur de toute ma collection » ; « Mes cartes » : la page se tourne comme dans un classeur, sans faire bouger l'écran ; « Tout afficher » toujours visible sous le « i » des deux onglets : écran plein « Toutes mes cartes » / « Tous mes produits scellés », classés par valeur, filtres Toutes, Loose, Gradées, « Charger plus » (d'après la vidéo du porteur).
- **Pas repris de la vidéo 1 :** prix des cartes gradées, population PSA, dernière vente eBay, alertes de prix (aucune source ouverte pour les trois premiers ; alertes non demandées explicitement).

## 2026-10-18 — Cote Cardmarket uniquement ; eBay en attente d'un accès officiel

- **Décision du porteur :** la cote se base **uniquement sur Cardmarket et la moyenne des ventes réussies eBay**, plus rien d'autre (exemple : la réimpression de Dracaufeu du 30ᵉ vaut environ 180 €, pas 123 € comme le donnait TCGplayer). Remplace la cote médiane avec TCGplayer (2026-10-16) et TCGCSV (2026-10-17, retiré).
- **Livré :**
  - app : cote = médiane de la tendance et des moyennes 7 et 30 jours **Cardmarket** de la bonne version ; plus de TCGplayer dans la cote, la fiche ni les libellés ; sans prix Cardmarket, pas de cote ;
  - données : les cartes que TCGdex ne relie pas à Cardmarket (tout le 30ᵉ) prennent leurs prix dans les fichiers publics de Cardmarket, déjà utilisés pour le scellé (`tools/tcgdex/cmfiles.py`) : réimpression de Dracaufeu à 174 € environ (tendance 173,99 €, moyenne 30 jours 172,61 €) ;
  - correction du même jour : le 30ᵉ et sa Collection Classique, rangés par Cardmarket dans une seule extension (6601), sont rapprochés ensemble ; les 31 Pikachu, les 2 Lugia (Lugia Cristal de la Collection Classique : 200 € environ) et M-Gardevoir EX, restés sans cote au premier passage (34 cartes), retrouvent leur prix.
- **eBay non branché :** eBay ne publie pas les ventes réussies en libre accès. Le porteur a demandé le scraping des ventes réussies (2026-10-18, en passant outre la règle du 2026-10-03). Test fait le même jour depuis GitHub : le robots.txt d'eBay.fr interdit les pages de recherche à tous les robots (`Disallow: /sch/`, ventes réussies comprises) et eBay répond 403 à chaque requête. Pas de contournement (faux navigateur, serveurs intermédiaires) : scraping abandonné, test retiré. **Seule voie restante : l'API officielle « Marketplace Insights »**, accès réservé, à demander par le porteur sur developer.ebay.com. Le lien « Ventes réussies eBay » reste dans chaque fiche.

---

## 2026-10-17 (soir) — Une valeur pour chaque carte (TCGCSV), cartes + scellé sur l'accueil, séries en 3 colonnes

- **Demande du porteur (avec vidéos) :**
  - chaque carte de chaque série avec sa valeur la plus proche du marché ; la valeur visible dans le classeur ; la valeur des cartes et celle du scellé, dont la somme fait la valeur de la collection (modèle PokéItem, en gardant l'interface Dropicards) ;
  - « Toutes les séries » : extensions 3 par ligne ; une série touchée se déplie vers le bas, sans remonter la page.
- **Décision (porteur, 2026-10-17) : nouvelle source de prix, TCGplayer via TCGCSV**, pour les cartes sans aucun prix dans TCGdex (783 cartes, dont tout le 30ᵉ Anniversaire). Prix « market » (ventes conclues), converti en euros, mis à jour chaque jour, marqué « à confirmer » ; 0 €.
- **Livré :**
  - pipeline : `tools/tcgdex/tcgcsv.py` et ses tests, `build_index.py --tcgcsv`, champ `ts` du catalogue, repli sur le prix de la veille si TCGCSV ne répond pas ; la mise à jour quotidienne s'en charge ;
  - app : source « TCGplayer via TCGCSV, à confirmer » sur ces cartes ;
  - accueil : sous « Mon classeur », tuiles « Cartes » et « Produits scellés » (valeur, nombre, visuels des plus chers) ; leur somme est la valeur de toute la collection (vérifié par les tests) ; un appui ouvre l'onglet du classeur ;
  - séries : extensions 3 par ligne ; l'en-tête touché reste en place et les extensions se déplient dessous (la remontée du 2026-10-14 est retirée ; la barre des logos mène toujours en haut de la série choisie).
  - mise à jour du catalogue du même soir : 708 cartes complétées par TCGCSV, dont les 191 du 30ᵉ Anniversaire (réimpression de Dracaufeu : 123 €) ; 21 290 cartes sur 21 365 ont une valeur ;
  - extensions (demande du même soir) : toutes les cartes en couleur (plus de gris pour celles qu'on n'a pas, la pastille ×N marque celles qu'on a) ; le « + » en haut à droite ajoute la carte avec sa cote du jour comme prix.

---

## 2026-10-17 — Écran d'une extension façon vidéo, réimpressions du 30ᵉ Anniversaire, classeur vide

- **Demande du porteur (avec vidéo) :**
  - « Mon classeur » vide : un bouton pour ajouter des cartes et des produits ;
  - 30ᵉ Anniversaire : visuels manquants, surtout les réimpressions ;
  - filtres sur chaque extension, sur le modèle de la vidéo (série 30 ans), reproduits sur toutes les séries.
- **Livré :**
  - classeur vide : « Ajouter des cartes » (recherche dans tout le catalogue) ou « Ajouter des produits scellés » (catalogue du scellé), avec « Scanner » et l'autre catalogue à côté ;
  - **Collection Classique (30 réimpressions)** : TCGdex n'en a aucun scan. Chaque réimpression reprend exactement une carte d'origine : la liste officielle (relayée par Cardrake et TCG Collector) donne, pour chacune, la carte d'origine, dont l'app affiche le visuel et le numéro imprimé (Dracaufeu 4/102, Lugia 149/147, Magicarpe 203/193…), avec une note dans la fiche. Le premier écran montre désormais le Lugia d'Aquapolis, celui de la réimpression. Restent dessinées : 3 cartes Mew (B, G, R) sans visuel ni détail chez TCGdex ;
  - **écran d'une extension** (toutes les extensions et « Les plus chères ») : logo, date et série, progression des cartes possédées ; Toutes, Possédées, Manquantes, Doublons ; Petit, Moyen, Grand ; recherche par nom ou numéro ; tri par numéro, cote ou nom ; filtres de rareté avec symbole et nombre, cumulables ; cartes manquantes en gris ; cœur (favori, gardé sur l'appareil) et « + » (ajout immédiat d'un exemplaire, FR ou EN, Near Mint, « Annuler » quelques secondes) sur chaque carte ;
  - écarté : « Sélectionner », « Stamps » et « Options » de la vidéo (pas de besoin identifié à ce stade).

---

## 2026-10-16 — Grades par PK et parrainages, Information sur les grades, animation de passage, cote médiane

- **Demande du porteur :**
  - Mon profil : « Type de collectionneur » remplacé par « Grade actuel » (emblème et avantages) ; « Palier » devient « Grade » ;
  - « Paliers et succès » devient « Information sur les grades » : interface gardée, chaque grade cliquable vers sa fiche (emblème en haut, avantages dessous), succès retirés ;
  - nouvelles conditions : Recrue dès l'inscription ; Chasseur 3 000 PK ; Collectionneur 7 500 PK ; Dresseur Pokémon 15 000 PK + 3 parrainages ; Maître Pokémon 30 000 PK + 5 parrainages ; Grand maître Pokémon 100 000 PK + 10 parrainages ;
  - animation de passage de grade inspirée des promotions de rang de League of Legends ;
  - premier écran : cartes entières, cinq nouvelles lignes de présentation ;
  - « Les plus chères » encore incohérente face aux ventes réussies eBay : refaire un scan.
- **Livré :**
  - grades calculés sur les **PK gagnés au total** (`pkEarned`) : une dépense au PK shop ou une perte à la roulette ne fait pas redescendre ; parrainages comptés dans `referrals`, à 0 tant que les comptes n'existent pas ;
  - fiche de chaque grade (écran `grade`), grade actuel dans le profil, liste des grades cliquable, succès retirés, « Grade » partout ;
  - animation : l'ancien emblème se charge (étincelles, tremblement), éclate dans un flash avec onde de choc et éclats, le nouvel emblème s'abat avec des rayons, puis « Nouveau grade » et son nom, « Continuer » ; allongée d'une seconde et terminée par un voile brillant qui glisse sur l'emblème seul (toutes les 3,2 s), d'après la vidéo LoL du porteur ; sans onde de choc ni forme circulaire au centre (flash d'éclatement plein écran) ;
  - **cote = médiane de la tendance et des moyennes 7 et 30 jours Cardmarket, et du prix TCGplayer** (calculé sur les ventes conclues). Une médiane écarte les pics d'un jour (Ectoplasma Skyridge : tendance 4 356 €, moyenne 30 jours 2 270 €, cote 2 856 €) ; les cartes dont les prix Cardmarket varient de plus de 2,5 fois sortent de « Les plus chères » ;
  - mise à jour TCGdex relancée ;
  - en-tête de l'accueil (demande du même jour) : solde de PK et tickets en haut à gauche, logo Dropicards plus petit au centre, avatar plus grand à droite avec l'emblème du grade en bas à droite ;
  - premier écran : « Monte en grade… » prend le pictogramme de la bannière des emblèmes à la place de l'étoile.
  - même en-tête sur les onglets **Toutes les séries**, **Jeux** et **PK shop** (demande du même jour) : solde de PK et tickets à gauche, logo au centre, avatar avec l'emblème du grade à droite ; le titre de la page passe juste en dessous.
  - emblèmes des grades : le reflet blanc du haut de la Poké Ball est légèrement descendu, pour qu'il ne touche plus le contour noir (demande du même jour).
- **À valider par le porteur :**
  - **avantages des grades**, proposés par Claude, affichés mais pas encore activés (tickets offerts, booster plus fréquent, réductions sur les compagnons, concours…) ; le porteur les verra plus tard ;
  - choix des **PK gagnés au total** plutôt que du solde.
- **Limites :** les ventes réussies eBay restent inaccessibles sans l'API Marketplace Insights ; le prix TCGplayer (ventes conclues aux États-Unis) en tient lieu. Les parrainages demandent des comptes : Dresseur Pokémon et au-dessus ne s'obtiennent pas encore sans l'Admin.
- **Principe 2 (plusieurs sources) :** de nouveau suivi pour la cote (quatre indicateurs, deux sources), ce qui lève la contradiction signalée le 2026-10-12.

## 2026-10-14 — Grades selon la valeur, Mon profil, séries, roulette animée, premier écran

- **Demande du porteur :**
  - barre des tickets qui ne cache plus de texte ;
  - série ouverte depuis son en-tête (vidéo) ;
  - flèche sur « Contenu possible et chances » ;
  - confettis ou animation triste à la roulette ;
  - badge Admin retiré de l'accueil ;
  - « Mon profil », photo de la photothèque, rubrique « Informations du dresseur » (pseudo, e-mail, membre depuis, palier) ;
  - 5 grades selon la valeur de la collection, avec logos ; « Série en cours » retirée ;
  - premier écran sans pastille de cote, avec Dracaufeu 1re édition, Lugia réimpression 30 ans, Mew ALT 30 ans.
- **Grades (noms, couleurs, emblèmes et seuils validés par le porteur, « pour l'instant ») :**

  | Grade | Valeur de la collection | Emblème (couleur, pointes par aile) |
  |---|---|---|
  | Recrue | 0 à 500 € | bronze brillant, 1 |
  | Chasseur | 500 à 2 500 € | argent, 2 |
  | Collectionneur | 2 500 à 7 500 € | or, 3, sans éclats |
  | Dresseur Pokémon | 7 500 à 15 000 € | or avec notes de vert, 4, deux éclats |
  | Maître Pokémon | 15 000 à 30 000 € | or et cristal, 5, pointe bleue, trois éclats |
  | Grand maître Pokémon | 30 000 € et plus | rouge Pokémon, 5, couronne |

  Noms, couleurs et ordre choisis par le porteur (même jour, 3ᵉ version, 6 grades au lieu de 5). Seuil de 30 000 € proposé par défaut (le porteur avait donné 5 tranches pour 6 grades), **gardé pour l'instant par le porteur**.

  **Style des emblèmes (demande du porteur, même jour) :** inspiré des rangs de League of Legends (ailes métalliques qui se déploient à chaque grade, plaque centrale en V, bannière derrière), adapté au style Dropicards (contour noir, jaune de la marque), avec une **Poké Ball dessinée au centre, choix du porteur** (le logo des PK l'avait écartée le 2026-10-08 par prudence sur les droits). Dessin original, sans reprise des emblèmes de LoL.

  Ils remplacent les paliers « Commune » à « Hyper rare » (0, 500, 1 500, 3 000, 7 500 €). Logos : `web/img/grades/`, générés par `tools/brand/make_grades.mjs`, sans élément officiel Pokémon.
- **Point d'attention :** l'inscription n'existe pas. L'adresse e-mail est saisie et gardée sur l'appareil en attendant les comptes. La photo de profil est réduite à 256 px sur le téléphone, jamais envoyée.
- **Lugia réimpression 30 ans :** TCGdex n'a pas encore son scan. Le premier écran montre l'illustration du Lugia de Neo Genesis (même dessin), puis le scan de la réimpression dès qu'il existe.

## 2026-10-12 (soir) — Cote Cardmarket seule ; PK shop à 2 000 PK et lot Booster 30 ans ; gains +10 retirés ; transition iOS

- **Demande du porteur :**
  - cote affichée = prix Cardmarket selon l'état (le moins cher en Near Mint, par exemple) + moyenne des ventes réussies eBay ;
  - « Les plus chères » à refaire (Mewtwo à 5 550 € faux) ;
  - ticket à 2 000 PK, sans plafond sur × 2 et ÷ 2 ; barre des tickets sous le solde de PK ; lot « Booster 30 ans Pokémon » à 15 000 PK ;
  - roulette sans chances ni description ; booster toutes les 12 h ; bouton 20 km sur la carte ;
  - retirer « +10 PK par nouvelle carte » et « +10 par jour » ; transition entre pages comme dans sa vidéo.
- **Livré :**
  - **cote = tendance Cardmarket de la bonne version** (holo, normale, reverse) ; TCGplayer affiché, plus compté, sauf pour les 631 cartes sans aucun prix Cardmarket (repli signalé « à confirmer ») ;
  - **cote recopiée** sur plusieurs cartes d'une même extension (rattachement erroné chez TCGdex, 242 cartes, dont les promos XY à 5 550 €) : non comptée, « cote à confirmer » ;
  - « Les plus chères » cohérente (Ectoplasma Skyridge, Dracaufeu Skyridge, Noctali VMAX…) ;
  - PK shop : ticket 2 000 PK, lot Booster 30 ans 15 000 PK (visuel officiel, échange direct, envoi à organiser), barre « N tickets » sous le compteur de PK seulement si on en a ;
  - roulette sans chances ni description (elles restent dans les règles des PK) ; booster toutes les 12 h ; 20 km dans le Radar ;
  - gains : bienvenue, partage et jeux seulement ;
  - transition « iOS » : la nouvelle page arrive de la droite, l'ancienne recule d'un tiers en s'assombrissant (450 ms), l'inverse au retour ; le geste depuis le bord repart de la position du doigt.
- **Pas faisable sans accès officiel (pas de scraping, règle du 2026-10-03) :**
  - prix Cardmarket **par état** (le moins cher en Near Mint) : seulement par l'API Cardmarket, réservée aux comptes approuvés ; TCGdex ne donne que la tendance ;
  - **moyenne des ventes réussies eBay** : API Marketplace Insights, à accès restreint (demande auprès d'eBay) ;
  - en attendant, la fiche garde le lien « eBay · ventes réussies » et les coefficients d'état (cote selon l'état et la langue).
- **Contradiction signalée :** le principe 2 de CLAUDE.md (médiane de plusieurs sources) et le scénario A (« ne jamais dépendre d'une seule source ») ne sont plus suivis pour la cote affichée, qui repose sur Cardmarket seul. À trancher par le porteur : garder Cardmarket seul, ou ajouter eBay dès que l'accès est obtenu.

## 2026-10-12 — Le 4ᵉ onglet devient « PK shop » ; roulette ; Territoire depuis l'accueil

- **Demande du porteur :**
  - remplacer l'onglet Territoire par un « PK shop » où dépenser ses PK ;
  - premier article : un ticket de participation au tirage au sort d'un booster Pokémon ;
  - une roulette dans Jeux : PK ÷ 2 (15 %), PK × 2 (10 %), +100 PK (40 %), −100 PK (35 %).
- **Livré :**
  - PK shop (onglet sac étoilé) : solde, ticket à 500 PK (prix par défaut, à confirmer), tickets gardés sur l'appareil ;
  - roulette : un tour gratuit toutes les 24 h (fréquence par défaut, à confirmer), le solde ne descend jamais sous 0 ;
  - Territoire s'ouvre depuis l'accueil (« Voir la liste ») ; la carte de l'accueil s'ouvre sur 20 km autour de soi.
- **Point d'attention (tirage au sort) :** l'app ne fait pas le tirage. Avant le premier tirage, il faut :
  - un règlement du jeu ;
  - l'identité de l'organisateur ;
  - un moyen de désigner et contacter le gagnant (comptes, serveur) ;
  - la livraison du lot.

  La participation reste gratuite tant que les PK ne s'achètent pas. Si les PK deviennent payants, le tirage et la roulette sont à revoir avec un avis juridique avant.

## 2026-10-11 — L'onglet « Marché » devient « Jeux » ; corrections des données et de l'app

- **Demande du porteur :** supprimer le contenu de l'onglet « Marché » et en faire un endroit pour gagner des PK (icône manette), avec deux mini-jeux.
- **Livré :**
  - **Booster PK**, gratuit : 10 PK (60 %), 30 PK (20 %), 50 PK (15 %), 100 PK (4 %), 1 000 PK (1 %), taux du porteur ;
  - **Pile ou face**, gratuit, toutes les 8 h : face « gemme PK » +30 PK (une chance sur deux), face perdante « cristal éteint » (choix laissé à Claude) ;
  - la recherche de l'ancien Marché reste accessible depuis l'accueil et le scan (écran « Recherche »).
- **Par défaut, à confirmer :** un booster toutes les 24 h (fréquence non précisée par le porteur).
- **Point d'attention :** les jeux sont des tirages au hasard. Ils restent hors du champ des jeux d'argent tant que les PK ne s'achètent pas et n'ont aucune valeur en euros. Si les PK deviennent payants (`docs/16`), les jeux sont à revoir avant (avis juridique).
- **Prix :**
  - cote Cardmarket selon la version de la carte (holo, normale, reverse), avec le prix de l'autre version à côté ;
  - « cote à confirmer » quand les prix s'écartent anormalement ;
  - ventes réussies eBay : un lien vers la recherche eBay, pas de chiffre (pas d'API ouverte, pas de scraping, §4).
- **Données :** les pipelines refusent une mise à jour incomplète (boutiques, scellé, catalogue) et publient `web/data/status.json`.
- **App :**
  - date réelle ;
  - enregistrement sûr de la collection ;
  - première visite sans la collection de démo ;
  - bouton Retour du téléphone et glissement au retour, position gardée ;
  - alertes à l'ouverture de l'app ;
  - mentions légales refaites ;
  - Admin dans les Réglages ;
  - animation d'entrée à chaque démarrage ;
  - icône « D » + carte O.

## 2026-10-09 — Logos des séries et cartes manquantes

- **Signalement du porteur :** logos des séries absents, cartes manquantes dans certaines extensions (30ᵉ Anniversaire).
- **Causes :** le logo de Nuit Noire n'existe qu'en png sur TCGdex, celui du 30ᵉ Anniversaire nulle part ; TCGdex n'a en français ni les Mew rouge, vert et bleu du 30ᵉ Anniversaire, ni certaines promos et cartes de kits que sa version anglaise a ; la Collection Classique était une extension à part.
- **Corrigé :** logos en cascade (TCGdex webp puis png, logos gardés avec la page, sinon une icône) ; cartes manquantes ajoutées depuis TCGdex en anglais puis pokemontcg.io, marquées « EN » ; Collection Classique rattachée à son extension (30ᵉ Anniversaire : 191 cartes, comme dans la vidéo du porteur).

## 2026-10-09 — Le 2ᵉ onglet devient « Toutes les séries »

- **Demande du porteur** (vidéo d'une application concurrente à l'appui) : remplacer « Collection » par « Toutes les séries », avec toutes les séries, les extensions de chaque série et leur nombre de cartes ; chaque extension donne accès à toutes ses cartes.
- **Livré :** barre des séries collée en haut, séries dépliables (logo, extensions, années, progression), extensions en grille (logo, cartes, mois de sortie, progression, « Bientôt » pour une extension annoncée), recherche ; chaque extension ouvre la grille de toutes ses cartes.
- **Retiré :** l'ancien écran Collection (la collection reste sur l'accueil, « Mon classeur », et dans les fiches).
- **Non repris de la vidéo :** l'onglet Pokédex (exclu, CLAUDE.md §5.4).

## 2026-10-09 — Vague 3 et fiabilisation livrées

- **Contexte :** « go » du porteur : « Lance la vague 3 avec ouverture de booster, et fiabilise tout comme tu le sens ».
- **Livré, vague 3 :**
  - **K1, ouverture de booster :** animation d'entrée en SVG (booster, éclair, éventail de cartes, logo) ; environ 2 s à la première ouverture du jour, 0,6 s ensuite ; un appui la passe ; version calme si moins d'animations.
  - **D5, corriger ou supprimer un ajout :** crayon sur chaque ligne de l'historique d'achat ; quantité, prix, date, langue, état ; suppression confirmée ; « Annuler » pendant 6 s ; refus si une vente déjà saisie manquerait d'exemplaires.
  - **B7, source et date :** dates réelles des données dans les en-têtes, la fiche et les Réglages (fin du « 3 oct. à 07:00 » figé) ; bouton « i » dans Mon classeur ; « Hors ligne » indiqué.
  - **A4, visuels de secours et hors ligne :** visuels locaux des cartes de démo si TCGdex ne répond pas ; catalogue et prix du scellé gardés dès la première visite.
  - **B1, cote selon l'état et la langue :** coefficients d'estimation affichés avec leur règle (Near Mint 100 %, Excellent 85 %, Joué 55 %, Boîte abîmée 85 % ; FR et EN 100 %, JP 70 %) ; la fiche montre le calcul ; interrupteur dans les Réglages.
  - **B2, vendre un exemplaire précis :** « Quel exemplaire part ? » dans la vente ; la marge prend le prix d'achat de cet ajout (identification spécifique), sinon le coût moyen ; 4 tests de marge en plus.
  - **D1, classeur :** tri (cote, récents, nom), filtres (langue, état, rareté, extension), glisser pour changer de page.
  - **C1, importer un tableur :** CSV lu sur l'appareil, colonnes devinées (français, anglais, export Dropicards), rapprochement avec le catalogue, lignes à vérifier, ajout avec « Annuler ».
  - **K2, fonds animés :** décors CSS selon l'écran et le compagnon (holo, gemmes, radar, bulles, braises, orage) ; Réglages : Animés, Calmes, Sans.
  - **K3, micro-animations :** ajout, gain de PK, palier, déblocage.
- **Livré, fiabilisation :**
  - **A1** (marge) et **A3** (sauvegarde), **H1, H4** (pages légales) : livrés plus tôt dans la journée.
  - **A5, alléger :** `app.js` minifié, −28 % une fois compressé ; catalogue en deux fichiers (partie fixe gardée par le navigateur, prix du jour) : 200 Ko par jour au lieu de 531.
  - **A2, tests navigateur dans le dépôt :** 29 suites dans `tools/web/e2e`, lancées par GitHub Actions après les tests unitaires.
  - **Correctifs :** les nouveaux ajouts et ventes prennent la date du jour réelle (ils étaient datés du 03/10) ; l'export CSV donne la part de chaque ligne d'un lot (et non le prix du lot entier).
- **Choix par défaut, à valider par le porteur :**
  - pas de PK pour les articles importés depuis un tableur (sinon un fichier inventé suffirait) ;
  - coefficients d'état et de langue (provisoires, à caler sur les prix Cardmarket par état) ;
  - fonds animés activés par défaut.
- **Reste à faire :** modèles d'import PokéItem et PokéCardex (exports réels du porteur), réglage du scan sur téléphone (C2), logo en grande taille (F1).

## 2026-10-09 — Vague 1 des propositions v2 : navigation, Compte, vues, bulle d'infos, mode Admin

- **Contexte :** le porteur donne son « go » pour la vague 1 de `docs/13-propositions-ameliorations-v2.md` (J1, L1 et K4, M2, N1, M3, P1).
- **Livré :**
  - **J1, haut de page :**
    - chaque changement de page s'ouvre en haut ;
    - recherches, filtres, onglets et vues sont retrouvés au retour ;
    - l'ancienne mémoire de défilement par page est retirée.
  - **L1 et K4, Compte :**
    - le palier passe avant « Membre depuis », écrit en plus petit avec le vrai mois du premier lancement ;
    - « Type de collectionneur » est replié ; au toucher, « S'adapte tout seul… » s'écrit lettre par lettre comme dans les jeux Pokémon, puis le reste se déplie bloc par bloc.
  - **M2 et N1, vues :**
    - bouton de vue sur Territoire : liste, galerie, compacte, carte plein écran ;
    - bouton de vue sur le Marché : liste, galerie, compacte, grandes cartes ;
    - la vue choisie est gardée au retour.
  - **M3, bulle d'infos (Territoire) :**
    - l'essentiel sur chaque boutique ;
    - « + » ouvre une bulle accrochée à la boutique : adresse, horaires du jour, itinéraire, appel, site, fiche ;
    - un appui sur la boutique ouvre sa fiche.
  - **P1, mode Admin :**
    - accès par 7 appuis sur « Version », puis un code à 6 chiffres choisi par le porteur (gardé en empreinte sur l'appareil) ;
    - panneau : PK et prix des compagnons, profil et palier forcés, date simulée, interrupteurs (Scan, Territoire, PK, partenaires fictifs, animations), données, collections types, diagnostic.
- **Écarts avec la proposition :**
  - « Carte » de Territoire ouvre le Radar plein écran existant, plutôt qu'une nouvelle carte avec tiroir ;
  - la bulle « + » n'est pas encore ajoutée au Marché ;
  - les interrupteurs ne couvrent pas Radar et Sorties.
- **Limite du mode Admin :** sans serveur, il ne contrôle que l'appareil où il est ouvert ; le contrôle de tous les utilisateurs demandera des comptes et un back-office (P2).
- **Coût :** 0 €.

---

## 2026-10-08 (fin) — PK : compagnons à débloquer, partage récompensé, logo du classeur

- **Contexte :** le porteur valide les règles des PK et demande :
  - de verrouiller presque tous les compagnons, sauf Salamèche, Carapuce, Bulbizarre et Pikachu, offerts dès le premier lancement ;
  - 300 PK pour un partage de l'app sur un réseau social, 500 PK pour un parrainage ;
  - la gemme des PK à la place de la Poké Ball sur le logo de « Mon classeur ».
- **Décision :**
  - **Prix des compagnons** (défaut proposé, ajustable) : selon le stade d'évolution dans Pokémon Rouge et Bleu.

    | Compagnons | Prix |
    |---|---|
    | Pokémon de base | 50 PK |
    | Première évolution | 100 PK |
    | Deuxième évolution | 200 PK |
    | Légendaires et fabuleux (Artikodin, Électhor, Sulfura, Mewtwo, Mew, Latias, Latios) | 400 PK |
    | Kyogre, Groudon, Rayquaza, thème compris | 500 PK |

    Ajustements du porteur : **Ptéra 100 PK, Ronflex 200 PK** ; Kabutops reste à 100 PK. 152 compagnons sont à débloquer, 4 sont offerts. Un compagnon déjà choisi avant son verrouillage reste acquis (règle validée).
  - **« Mes PK » :** les compagnons à thème, puis « Tous les compagnons » qui ouvre le choix.
  - **Partage :** +300 PK la première fois, via WhatsApp, Facebook, X ou la feuille de partage du téléphone ; « Copier le lien » ne rapporte rien. L'app ne peut pas vérifier que la publication a eu lieu : le clic suffit, une seule fois.
  - **Logo de « Mon classeur » :** la gemme des PK remplace la Poké Ball rouge et blanche sur la couverture.
- **Ordre des gains dans « Mes PK » :** du plus petit au plus grand (+10, +10, +100, +300), à la demande du porteur.
- **Parrainage (+500 PK) : mis en attente par le porteur** (2026-10-08). Sans serveur, l'app d'un parrain ne peut pas savoir qu'un filleul s'est inscrit sur un autre téléphone. Options proposées au porteur :
  - un petit serveur gratuit (Cloudflare Worker et KV) ;
  - ou une version locale : le filleul arrive par un lien d'invitation et reçoit les PK, le parrain ne reçoit rien automatiquement.
- **Point d'attention :** le partage expose publiquement la démo (`pokemon-appli.pages.dev`). Disponibilité du nom, licence des données et cadre juridique ne sont pas encore vérifiés (CLAUDE.md §1, §4).
- **Coût :** 0 €.

---

## 2026-10-08 (suite) — Thème « Ouragan » pour Rayquaza

- **Contexte :** le porteur demande un thème « ouragan » pour Rayquaza, affiché « Compagnon et thème Ouragan ».
- **Décision :**
  - le thème « Vert et blanc » (clair) est remplacé par **Ouragan** (sombre) : un ciel d'orage en dégradé vert émeraude et ardoise ;
  - une lueur d'éclair en haut à gauche, un arc de tourbillon en haut à droite, des textes clairs ;
  - la barre du navigateur prend le vert profond du haut du dégradé ;
  - « Mes PK » affiche « Compagnon et thème Ouragan », et le message de choix « Rayquaza t'accompagne · thème Ouragan ».
- **Contraste :** au moins 4,5:1 sur tous les écrans. Le haut du dégradé a été assombri pour les puces (première mesure : 4,41).
- **Coût :** 0 €.

---

## 2026-10-08 — Monnaie virtuelle « PK »

- **Contexte :** le porteur demande une monnaie virtuelle, les **PK** :
  - un petit logo de Poké Ball, dessin laissé à notre choix ;
  - un compteur en haut à droite de l'app ;
  - elle sert à débloquer des interfaces, notamment des compagnons. Premiers prix : **Groudon, Kyogre et Rayquaza à 500 PK** chacun.
- **Décision** (défauts proposés sans validation préalable ; **validés par le porteur le 2026-10-08** : gains, articles qui ne rapportent rien, compagnon déjà choisi gardé, PK conservés quand on vide ou remet la démo) :
  - **Logo, premier jet :** une Poké Ball maison (`web/img/brand/pk.svg`, `tools/brand/make_logo.mjs`) ; ce n'est pas un logo officiel Pokémon. Le porteur a demandé un éclair Dropicards bien plus visible, jaune à contour noir, et a choisi parmi 4 propositions (rouge classique, bleu nuit, éclair traversant, carte « I ») : **l'éclair traversant**, moitié haute bleu nuit, moitié basse blanche, l'éclair du I du logo traversant toute la balle à la place du bouton. Le plus lisible en petit (18 px). Puis, à sa demande, le haut passe du bleu nuit au jaune du logo (#FFD60A) ; l'éclair reste lisible grâce à son contour noir.
  - **Droits :** la Poké Ball rouge classique (proposition A) a été écartée : copie quasi exacte d'un emblème Pokémon, interdite comme identité de l'app (CLAUDE.md §4).
  - **Logo définitif (même jour) :** pour réduire au maximum le risque de droits, le porteur remplace la balle par un **jeton sans aucun repère de Poké Ball** (ni bande, ni bouton, ni rouge et blanc). Il a comparé une pièce, une pièce crantée, la carte « I », une gemme et deux cartes, puis des variantes de la carte et de la gemme. Choix : **la gemme à facettes contrastée avec étincelle (« D2c »)**. C'est un hexagone jaune taillé en 6 facettes, du jaune clair à l'ambre, avec un contour noir. Au centre, l'éclair du I du logo, jaune à contour noir seul (le liseré blanc est retiré à sa demande), et l'étincelle du logo. Formes courantes et éléments propres à Dropicards : risque jugé faible, à confirmer par un avocat avant une sortie publique.
  - **Compteur :** à gauche de l'avatar, sur l'accueil, Collection, Marché et Territoire. Un appui ouvre « Mes PK » : solde, façons de gagner, compagnons à débloquer. Chaque gain s'affiche quelques secondes sous le compteur (« +10 PK »).
  - **En-tête de l'accueil :** pour faire la place, le logo passe à gauche (toujours 196 px au plus) et la pastille « FR » est retirée.
  - **Gains :**
    - 100 PK de bienvenue, une fois ;
    - +10 PK par jour où l'app est ouverte ;
    - +10 PK par nouvel article ajouté à la collection (carte ou produit scellé), une seule fois par article : retirer puis rajouter ne rapporte rien.
    - Les articles déjà présents au premier lancement et ceux de la démo ne rapportent rien.
  - **Déblocage :**
    - dans « Choisis ton compagnon », Kyogre, Groudon et Rayquaza portent un cadenas et leur prix ;
    - un appui ouvre une confirmation : « Débloquer pour 500 PK », ou « Il te manque … PK » avec les façons d'en gagner ;
    - une fois débloqué, le compagnon est choisi et son thème appliqué (Océan, Volcan, Vert et blanc). Il reste acquis.
  - **Transition :** un compagnon à thème choisi avant l'arrivée des PK reste acquis, sans payer.
  - **Enregistrement :** solde, compagnons débloqués et articles déjà récompensés sont gardés sur l'appareil avec la collection. « Vider ma collection » et « Remettre la démo » ne touchent pas aux PK.
  - **Garde-fou :** les PK ne s'achètent pas, ne se convertissent pas en euros et ne s'échangent pas. Le panneau le dit.
- **Écarté :**
  - un achat de PK en argent réel : il ferait de l'app une boutique, avec ses règles (achats intégrés des stores, protection des mineurs) ;
  - des quêtes, des séries de jours ou des saisons : CLAUDE.md §5.4 écarte les quêtes et saisons de PokéItem. Le bonus du jour reste un simple +10, sans série ;
  - des PK par scan réussi : ils feraient double emploi avec l'ajout de la carte scannée.
- **Validé par le porteur (2026-10-08) :** montants des gains, règles de non-gain, transition, PK conservés. **Reste à définir :**
  - prochaines interfaces à débloquer (autres compagnons, thèmes seuls, cadres du classeur…) ;
  - si les PK doivent un jour récompenser des usages utiles au test (inviter un proche, importer sa collection), à mesurer.
- **Limite :** tout est sur l'appareil. Quelqu'un qui modifie les données de son navigateur peut se donner des PK. C'est sans conséquence tant que les PK ne débloquent que de l'affichage. Il faudra un compte et un serveur s'ils prennent de la valeur.
- **Coût :** 0 €.

---

## 2026-10-07 (fin) — Icône de l'app, liste « Ma collection » retirée, thèmes des compagnons

- **Contexte :** demandes du porteur :
  - son logo comme **icône de l'app sur le téléphone** (choix fait parmi : tous les écrans, icône, logo absent du téléphone) ;
  - supprimer la rubrique « Ma collection » de l'accueil en gardant « Marge réalisée sur tes ventes » ;
  - un thème par compagnon : Kyogre (mer, océan), Groudon (rouge, volcan), Rayquaza (vert et blanc), le fond passant du jaune au dégradé du thème.
- **Décision :**
  - **Icône :** son logo exact sur deux lignes (« DROPI » au-dessus de « CARDS »), sur son jaune, pour l'écran d'accueil (Android, iPhone) ; dans l'onglet du navigateur, la carte O du logo, le mot étant illisible à 32 px. L'icône « D + carte » redessinée est retirée. Sur un iPhone où l'app est déjà installée, la nouvelle icône n'apparaît qu'après l'avoir retirée et ajoutée à nouveau.
  - **Accueil :** la liste « Ma collection » est retirée, « Mon classeur » montrant déjà toute la collection ; la marge réalisée reste.
  - **Thèmes :** Océan et Volcan en dégradés sombres avec textes clairs, Vert et blanc en dégradé clair avec textes bleu nuit ; seul le fond et ce qui est posé dessus changent ; un autre compagnon remet le jaune. Contraste ≥ 4,5:1 vérifié dans les quatre thèmes.
  - Au passage, le sigle des plaques de produits dessinées (ETB, DSP…) reçoit un léger fond sombre : le test de contraste, rendu plus juste, le trouvait trop pâle sur certains visuels d'extension.
- **Écarté :** des thèmes Océan et Volcan clairs (pastel) pour garder les textes sombres : un « volcan » clair serait orange pâle, pas rouge.
- **Coût :** 0 €.

---

## 2026-10-07 (suite) — Logo exact du porteur dans l'en-tête

- **Contexte :** le porteur fournit son logo (image PNG, 600 × 127, fond jaune) et demande de l'intégrer **exactement** en haut de l'app, à la place du logo redessiné.
- **Décision :**
  - l'en-tête affiche son fichier lui-même, gardé tel quel dans `tools/brand/source/` ; seul le fond jaune autour des lettres est rendu transparent (`tools/brand/import_logo.py`), les jaunes de la carte O et de l'éclair sont gardés ;
  - même place et même largeur qu'avant : 196 px au plus, centré entre la pastille « FR » et l'avatar. Ce logo est plus large que l'ancien : à largeur égale, il est un peu moins haut ;
  - les icônes de l'app et le logo de « Mon classeur » restent redessinés en SVG.
- **Écarté :** redessiner son logo en SVG. Sa police n'est pas identifiée : le résultat ne serait pas exactement le sien.
- **Point d'attention :** l'image fait 600 px de large ; un export plus grand (1 200 px ou plus) ou un SVG la rendrait plus nette sur les téléphones récents.

---

## 2026-10-07 — « Mon classeur » sur l'accueil ; « Sorties du moment » tout en bas

- **Contexte :** le porteur demande une rubrique « Mon classeur » entre la valeur de la collection et « Boutiques autour de toi », avec un logo de classeur Pokémon au centre et deux onglets, « Mes cartes » et « Mes produits scellés ». Pour « Mes cartes », il montre l'aperçu des cartes de PokéItem. Il demande aussi de mettre « Sorties du moment » tout en bas de l'accueil. Ses choix : **pages de classeur** pour les cartes, **vitrine 2 par ligne** pour le scellé.
- **Décision :**
  - **Mes cartes :** pages de 9 pochettes (3 × 3), de la plus chère à la moins chère ; sur chaque visuel, une pastille avec le drapeau de la langue, la cote et un point de couleur pour l'état, comme l'aperçu de PokéItem ; note de gradation et exemplaires en plus.
  - **Mes produits scellés :** vitrine 2 par ligne, pages de 4, photo officielle, même pastille.
  - En tête de chaque onglet : nombre, valeur totale, cartes gradées et doublons (données réelles de la collection).
  - **Logo :** classeur à anneaux dessiné au style du logo Dropicards (jaune, contour et ombre noirs), Poké Ball sur la couverture : illustration de rubrique, pas l'identité de l'app.
  - **Sorties du moment** passe tout en bas de l'accueil, juste avant la mention de non-affiliation.
- **Écarté :** le reste de l'aperçu de PokéItem (fardes, decks, souhaits, pré-gradation) : hors périmètre (CLAUDE.md §5, pas de dispersion).
- **Coût :** 0 €.

---

## 2026-10-05 — Retouches de l'accueil : logo à l'éclair, compagnons, montant, petit radar

- **Contexte :** demandes du porteur sur l'accueil. Ses choix : le logo complet **dans l'en-tête, en plus grand** ; le radar **lance le balayage**. Après une première version, il corrige deux points : chaque Pokémon garde sa **taille d'origine** (pas d'agrandissement des petits), et le radar va **dans l'encadré, au-dessus de « Me localiser » et « Carte de France »**, pas à côté du titre.
- **Décision :**
  - **En-tête :** le logo complet de la planche (I à l'éclair, O étoilé) remplace le petit logo simplifié, 196 px de large au plus contre 154 (27 % de plus), réduit sur les petits écrans pour rester centré entre la pastille « FR » et l'avatar. `dropicards-small.svg` est retiré.
  - **Compagnons :** 156 au lieu de 151 : les 151 de Kanto, plus **Latias, Latios, Kyogre, Groudon et Rayquaza** (Latias et Latios ajoutés à une deuxième demande), à la fin, dans l'ordre du Pokédex. Le panneau affiche seulement leur nombre, « 156 Pokémon disponibles », sans la liste des noms. Ce choix élargit celui du 2026-10-04 (« compagnon parmi les 151 Pokémon de Kanto »).
  - **Choix du compagnon :**
    - 3 Pokémon par ligne ;
    - panneau opaque : le compagnon de l'accueil se voyait à travers (le « Pokémon derrière Florizarre ») ;
    - icônes refaites : le Pokémon seul, entier, à sa taille d'origine, recadré et centré, au lieu du sprite coupé sur les bords. Toutes vérifiées sur une planche.
  - **Montant de « Ma collection » :** même police et même style que le logo (lettres blanches, contour et ombre noirs), au lieu du jaune.
  - **Logo radar animé** dans l'encadré « Active ta position », juste au-dessus de « Me localiser » et « Carte de France » : un appui demande la position, puis le balayage part tout seul. Une fois la position connue, le grand radar et « Scanner les boutiques » prennent le relais.
- **Coût :** 0 € ; 148 Ko d'icônes et 0,4 Mo de sprites en plus.

---

## 2026-10-04 (nuit, suite) — Scan réel à l'appareil photo ; langue et état des exemplaires

- **Contexte :**
  - le porteur demande que le scan des cartes avec l'appareil photo soit fonctionnel, puis donne son « go » pour la proposition : caméra du téléphone, lecture sur le téléphone du nom et du numéro avec Tesseract.js, 3 propositions à confirmer, 0 € ;
  - ses choix : **pas d'essai préalable** sur 20 photos (construction directe) ; **langue et état enregistrés** à chaque ajout (+ 4 h). Plan validé.
- **Décision :**
  - **Scan réel** : caméra arrière avec un cadre au format carte ; lecture sur l'appareil (Tesseract.js 7 et modèle français, servis par le site, environ 4,7 Mo au premier scan) ; le numéro imprimé est le signal principal, le nom confirme ; rapprochement avec le catalogue (numéro et total imprimé, sous-séries, promos, nom approché), indices additionnés d'une image à l'autre ; 3 propositions, puis la fiche résultat, puis la carte suivante.
  - **Sans caméra** : prendre ou importer une photo, rechercher une carte. **Onglet Scellé** : recherche parmi les vrais produits (pas de code-barres dans nos données).
  - **Langue et état** de chaque ajout enregistrés (scan et « Ajout »), affichés dans « Ma collection », la Collection et la fiche.
  - Retirés : viseur simulé, fausse confiance, faux code-barres.
- **Écarté :**
  - **reconnaissance par l'image** (empreinte des visuels officiels) : index à construire dans GitHub Actions, 12 à 20 h ; gardée en plan B si la lecture du numéro déçoit sur téléphone ;
  - **lecture de toute la carte** en continu : 5 à 10 fois plus lente que deux bandes ; gardée pour les photos importées ;
  - **essai préalable sur photos** : choix du porteur ; remplacé par un banc de cartes de test dessinées et le test sur son téléphone.
- **Coût :** 0 €/mois ; environ 8,7 Mo ajoutés au site (Cloudflare Pages gratuit).
- **Mesures (cartes de test dessinées, mises en page récente, Épée et Bouclier, ancienne et full art) :**
  - la bonne carte figure dans les 3 propositions pour 52 cartes sur 52 à 500, 700 et 1 400 px de large, et pour 51 sur 52 sous forte dégradation (flou, bruit, carte de travers, compression) ;
  - lecture des deux bandes en 0,3 s environ sur ordinateur, 0,5 s avec un processeur ralenti 4 fois ;
  - tests : 14 tests unitaires ; 37 vérifications navigateur avec la fausse caméra de Chromium ; suites existantes et contraste sans régression.
- **Points d'attention :**
  - la **vraie mesure se fera sur téléphone**, avec de vraies cartes (`?debug=scan` montre ce qui est lu) ;
  - le numéro est petit : carte proche, nette, sans reflet ; sinon lecture fine ou photo ;
  - non reconnues : cartes japonaises, cartes horizontales, souvent les cartes dorées ; reverse et premières éditions non distinguées ;
  - la cote ne dépend pas encore de l'état ; à la vente, on ne choisit pas encore l'exemplaire ;
  - Tesseract.js et son modèle : licence Apache 2.0, crédit dans Réglages › À propos.

---

## 2026-10-04 (nuit) — Identité Dropicards et nouvel accueil

- **Contexte :**
  - le porteur demande de refaire la mise en page de l'accueil : une barre de recherche ; la valeur de la collection en premier, dans une police proche de celle du logo, avec la courbe de tendance du marché et un petit Pokémon animé à choisir ; le radar des boutiques autour de soi, avec un scan et des boutiques cliquables pendant le scan (nom et ville exacte) ; les sorties du moment ; la liste de toutes les cartes de la collection à la place de « Mes plus belles pièces » ; la marge réalisée gardée ; « Derniers ajouts » retiré ;
  - il envoie ensuite la planche du logo **Dropicards** (« B6 · I avec éclair vertical »).

  Choix validés : Dropicards devient l'identité de la démo, partout ; logo redessiné en SVG ; police du montant « style logo » ; compagnon parmi les 151 Pokémon de Kanto ; un appui sur une boutique ouvre sa fiche ; palier, arrivage de démo et mouvements retirés.
- **Décision :**
  - **Identité Dropicards** : logo (lettres Luckiest Guy en tracés, cartes à la place du O et du I), icônes de l'app, nom dans le titre et le manifeste, libellés « PKM » → « Dropicards », jaune de la planche. « PKM-App » reste le nom de code des documents.
  - **Nouvel accueil** : recherche ; valeur dans la police du logo, courbe sur 4 points réels et variation sur 7 jours, compagnon animé ; radar des boutiques avec balayage et repères cliquables (nom, ville) ; sorties du moment ; liste complète de la collection (récents ou valeur) ; marge réalisée.
  - **Données** : commune officielle de chaque boutique (contours IGN, noms du code officiel géographique, arrondissements) ; moyennes Cardmarket 7 jours et 1 jour des cartes ; **archive maison** de la cote du scellé, car le guide public de Cardmarket n'a pas de moyennes pour le scellé (CLAUDE.md §5, principe 6).
  - **Correction** : les points des boutiques du Radar n'apparaissaient pas (couche refusée par MapLibre), donc aucun appui possible sur la carte. Corrigé ; un appui pendant le balayage ouvre la fiche.
- **Écarté :**
  - **la police du logo officiel Pokémon** (non libre) ; Luckiest Guy (Apache 2.0) est la plus proche des lettres de Dropicards ;
  - **une carte MapLibre sur l'accueil** (trop lourde au démarrage) : radar en SVG, carte de France à un appui ;
  - **une courbe jour par jour inventée** : 4 points réels, plats quand l'information manque ; la courbe quotidienne viendra de l'archive.
- **Coût :** 0 €/mois. Sprites et logo servis avec le site (Cloudflare Pages) ; données téléchargées par les workflows.
- **Points d'attention :**
  - disponibilité du nom « Dropicards » (marque, nom de domaine) à vérifier avant toute sortie publique ;
  - le logo est une reproduction fidèle de la planche ; les fichiers du designer pourront le remplacer ;
  - sprites des compagnons © The Pokémon Company (via PokeAPI) : décision du porteur sur les visuels Pokémon, crédit affiché ; cadre juridique toujours à produire ;
  - **suite prévue** : le scan réel à l'appareil photo (lecture du nom et du numéro de la carte), plan séparé.

---

## 2026-10-04 (soir) — Refonte v6 : jaune et verre, scellé mis en avant, page Sorties, Territoire réel

- **Contexte :** le porteur demande :
  - un design épuré, jaune pour évoquer Pokémon, de la transparence dans les boutons, les cartes et le fond, des contours autour des cartes ;
  - un visuel pour chaque article, et des ETB, UPC et coffrets plus gros, plus attirants, en priorité ;
  - une page « boutiques autour de soi » plus claire, avec des liens directs vers l'enseigne ;
  - une page des sorties (Pokémon 30 ans…) avec Amazon et eBay, pour demander des invitations Amazon.

  Choix validés le jour même : vraies boutiques d'abord, liens Amazon + eBay + enseignes, jaune dominant.
- **Décision :**
  - **Design v6** : fond jaune, cartes en verre bleu nuit avec contour, accent jaune ; contraste d'au moins 4,5:1 vérifié écran par écran ; flou réel sur 2 éléments au plus par écran. La maquette v5 reste figée : une couche de thème remplace ses couleurs au build. `?theme=classic` garde l'ancien thème.
  - **Articles mis en avant** : carrousels « Sorties du moment » et « Scellé à la une », tuiles doubles, scellé en pleine largeur dans la Collection, grandes cartes 16:9, photos qui remplissent leur cadre ; repli logo puis plaque dessinée.
  - **Page Sorties** : à venir et sorties récentes, dates et prix de lancement constatés avec leur source, cote ou précommandes Cardmarket ; liens directs vers Amazon (fiche quand l'ASIN est connu), eBay, Fnac, Cultura, Micromania.
  - **Positionnement : la page Sorties ne propose que des liens sortants.** PKM ne vend rien, ne compare pas les prix des enseignes et ne touche aucune commission : ce n'est pas une marketplace (CLAUDE.md §4).
  - **Territoire réel** : vraies boutiques autour de la position, distance, ouverture, chance expliquée, carte orientée ; fiche avec itinéraire, site, téléphone, horaires, adresse, signalement d'erreur. Position arrondie à environ 100 m, jamais enregistrée ni envoyée. Les partenaires fictifs passent dans un encadré « Démo ».
  - **Date réelle** pour le scellé, les Sorties et le Radar ; la collection de démo garde sa date fixe.
- **Écarté :**
  - **toute demande automatique d'invitation Amazon** : interdite par Amazon ; l'app ouvre seulement la fiche ;
  - **les liens affiliés et le pistage** ;
  - **la lecture des prix ou des stocks sur les sites des enseignes** (pas de scraping, CLAUDE.md §4) ;
  - **un « prix conseillé » officiel** : aucun n'est publié en euros ; l'app affiche des prix de lancement constatés, avec leur source ;
  - **un fond clair avec des cartes blanches** : il aurait fallu reprendre toutes les couleurs ; le verre bleu nuit garde la lisibilité.
- **Coût :** 0 €/mois. Aucun service nouveau.
- **Points d'attention :**
  - les adresses de recherche Fnac, Cultura et Micromania ont été relevées sans pouvoir les ouvrir d'ici : à tester une fois dans un navigateur ;
  - les ASIN Amazon peuvent changer : la recherche Amazon sert de repli ;
  - dates et prix de lancement viennent de sites tiers (poketrack.fr, boostacote.app, pokecop.com), sauf la date officielle du 16 septembre ;
  - site, téléphone et horaires viennent d'OpenStreetMap : ils peuvent être incomplets ou anciens, d'où le lien « Signaler une erreur ».

---

## 2026-10-04 — Vrais visuels partout et Radar : la carte de France des boutiques réelles

- **Contexte :** le porteur demande trois choses :
  - un visuel pour les 1 203 cartes qui n'en avaient pas ;
  - de vrais visuels pour les produits scellés (ETB, UPC…), repris du web ;
  - une carte de France « façon AXICALL » : zoom par secteur, balayage radar, boutiques réelles qui vendent du Pokémon, et chance d'y trouver des produits.

  Choix validés le jour même : source gratuite, nouvel écran Radar ouvert depuis Territoire, estimation expliquée.
- **Décision :**
  - **Cartes sans visuel :**
    - scan anglais de pokemontcg.io en dernier recours, pour 771 cartes ; chaque correspondance est vérifiée par le nom anglais, ou par le Pokédex et l'illustrateur ;
    - sinon, une carte « Visuel à venir » dessinée par l'app (432 cartes) ;
    - pokemontcg.io arrête son API le 1ᵉʳ mars 2027 : l'app bascule alors seule sur le repli.
  - **Produits scellés :**
    - 61 produits sortis en France depuis l'automne 2025, ou annoncés ;
    - liste figée à la main (`tools/sealed/products.json`) à partir de la galerie officielle Pokémon France ;
    - 53 visuels officiels : la vignette de la galerie, téléchargée une fois ;
    - cote = tendance du guide des prix public Cardmarket, mise à jour chaque jour.
  - **Radar :**
    - boutiques réelles d'OpenStreetMap : 4 076, mises à jour chaque semaine ;
    - carte MapLibre, fond OpenFreeMap, contours IGN ;
    - indice de chance expliqué, entre 5 et 90 % : type de boutique, mention des cartes sur OpenStreetMap, produit recherché, calendrier des sorties ;
    - une vraie boutique n'est jamais présentée comme partenaire PKM, ni comme ayant annoncé un arrivage ;
    - Territoire garde sa liste de démo, et un bandeau ouvre le Radar.
- **Écarté :**
  - **Scrydex**, le CDN commercial des scans récents de pokemontcg.io (29 $/mois) : les 30 cartes de la Collection Classique 30ᵉ Anniversaire restent dessinées ;
  - **le contournement de la protection anti-robots** du site Pokémon : seules la galerie et ses vignettes sont lues. Les dates de sortie viennent des extensions (TCGdex) ou de sources publiques ;
  - **les images « contenu » des fiches officielles** (cartes promo, dés, poster) : elles ne montrent pas la boîte ;
  - **un rapprochement Cardmarket automatique chaque jour** : un ETB et un ETB Pokémon Center se ressemblent trop ;
  - **MapLibre 5** : une faille XSS est signalée sur les versions ≤ 6.4. L'app utilise MapLibre 6.12.
- **Coût :** 0 €/mois. OpenFreeMap, Overpass, pokemontcg.io, la galerie Pokémon, les fichiers Cardmarket et Cloudflare Pages sont gratuits ; GitHub Actions reste sous le quota gratuit.
- **Points d'attention avant tout partage public :**
  - licences et usage commercial de pokemontcg.io, des fichiers Cardmarket et des visuels de la galerie Pokémon ;
  - les mentions OpenStreetMap (ODbL), OpenMapTiles, OpenFreeMap et IGN sont déjà affichées dans le Radar.
- **Impact :**
  - CLAUDE.md (§3) ;
  - `tools/tcgdex/ptcg.py` et `build_index.py` ; `tools/sealed/` ; `tools/stores/` et `tools/geo/` ;
  - workflows `tcgdex.yml`, `sealed.yml` (chaque jour : visuels manquants et prix du scellé) et `stores.yml` (chaque semaine) ;
  - `tools/web/sealed.js`, `radar-core.js`, `radar.js`, `catalog.dc.html` et `build.mjs`.

## 2026-10-04 — Toutes les cartes en visuel officiel, collection enregistrée sur l'appareil

- **Contexte :** le porteur demande de passer à l'étape suivante (enregistrer la collection) et de mettre « toutes les cartes possibles » dans l'app, avec leur design officiel, en qualité la plus haute possible.
- **Décision :**
  - **Catalogue élargi :** les extensions sans version française dans TCGdex entrent au catalogue. Leurs cartes sont en anglais et l'app l'indique.
  - **Visuels :** un visuel absent en français est remplacé par le scan d'une autre version, dans cet ordre : anglais, allemand, italien, espagnol. C'est le même dessin officiel, et l'app l'indique.
  - **Qualité :** la fiche et le zoom affichent la meilleure qualité publiée par TCGdex (PNG 600 × 825). Les grilles s'adaptent à la finesse de l'écran.
  - **Parcours :** « Toutes les cartes » (extensions par série, puis grille de l'extension), accessible depuis le Marché. La carte s'affiche entière.
  - **Collection :**
    - enregistrée dans le navigateur de l'appareil, rien n'est envoyé en ligne ;
    - « Vider ma collection » et « Remettre la démo » dans les Réglages.
- **Écarté :**
  - le stockage des images chez nous : plusieurs Go, au-delà de la limite de 20 000 fichiers de Cloudflare Pages ; le CDN TCGdex suffit (CLAUDE.md §4) ;
  - les cartes japonaises : numérotation et noms différents ;
  - un compte en ligne pour synchroniser la collection entre appareils : à décider plus tard.
- **Impact :**
  - CLAUDE.md (§3) ;
  - `tools/tcgdex/build_index.py`, `.github/workflows/tcgdex.yml` ;
  - `tools/web/catalog.js`, `tools/web/catalog.dc.html`, `tools/web/persist.js`.

## 2026-10-03 — Catalogue réel dans la démo : toutes les cartes françaises via TCGdex, mises à jour chaque jour

- **Contexte :** le porteur veut que toutes les cartes soient dans l'app. Il donne son « go » explicite (option A), ce qui vaut feu vert de la Règle d'or pour cet incrément.
- **Décision :**
  - **Catalogue :** le catalogue TCGdex en français (cartes, raretés, images, prix Cardmarket et TCGplayer) est chargé par la démo web, dans un fichier compact : `web/data/cards.json`.
  - **Mise à jour :** chaque jour, par GitHub Actions. Le réseau de l'environnement Claude Code bloque TCGdex ; les serveurs de GitHub n'ont pas cette limite. L'historique git du fichier sert d'archive quotidienne des prix (principe 6).
  - **Images :** affichées depuis le CDN TCGdex et jamais stockées chez nous (CLAUDE.md §4).
  - **Cote d'une vraie carte :** moyenne de la tendance Cardmarket et de TCGplayer, converti en euros au taux de la BCE. Pas de courbe inventée.
  - **Licence et usage commercial de TCGdex :** à vérifier avant toute sortie publique. Le porteur s'en charge à la fin ; l'app n'est pas destinée à sortir tout de suite.
- **Écarté :**
  - le téléchargement des 20 000 images (plusieurs Go) ;
  - le scraping (CLAUDE.md §4).
- **Impact :**
  - CLAUDE.md (§3) ;
  - `tools/tcgdex/`, `tools/web/catalog.js`, `.github/workflows/tcgdex.yml`.

## 2026-10-03 — Onglet Territoire : boutiques partenaires PKM et arrivages probables

- **Contexte :** le porteur demande un onglet listant les magasins, avec la probabilité d'arrivage des produits (ETB, objets de valeur). La maquette v5 le montre.
- **Décision :**
  - **Partenaires :** boutiques qui ont un accord avec PKM. Ce n'est pas une mention officielle Pokémon.
  - **Probabilité d'arrivage :** estimée à partir de l'annonce du magasin partenaire, des signalements des collectionneurs (modérés, sans fil social) et de l'historique des arrivages.
  - **Navigation :** Territoire prend la place de Profil dans la barre du bas ; le profil s'ouvre depuis l'avatar.
- **Écarté :**
  - le scraping des sites d'enseignes (CLAUDE.md §4) ;
  - un fil social de signalements (principe 4).
- **Impact :** CLAUDE.md (§3) ; maquette v5 (`docs/12-maquette-v5/`).

## 2026-10-03 — Changement de cap : une app de valorisation pour collectionneurs, proche de PokéItem d'abord

- **Contexte :**
  - Le Comparatif des options v2 acte un changement de cap du porteur : lancer d'abord un produit proche de PokéItem, puis l'optimiser, au lieu de tester l'hypothèse par un service manuel.
  - La maquette v3 a recentré l'app sur la valorisation, avec un scan au centre.
  - Le porteur a tranché les points ouverts le 2026-10-03.
- **Décision :**
  - **Positionnement :** app de **valorisation** des cartes et des produits scellés au prix du marché, comparé entre plusieurs sources et mis à jour automatiquement. La marge à la revente reste un complément. Pas de vente dans l'app.
  - **Cible prioritaire : collectionneurs et passionnés** (cartes, cartes gradées, scellé). Revendeurs / investisseurs en scellé = cible secondaire.
  - **Profils Novice, Régulier, Passionné automatiques :** fixés par le nombre de cartes ultra rares ou par la valeur de la collection, sans recalcul hebdomadaire.
  - **Test de la Phase 3 :** pas pour maintenant.
  - **Scraping :** à revoir plus tard. La règle actuelle s'applique en attendant : pas de scraping sans avis juridique.
- **Écarté :**
  - Le test concierge d'abord (scénario E5+T1 du Comparatif v1).
  - Les revendeurs de scellé comme cible prioritaire.
  - Le profil recalculé chaque semaine sur 5 signaux (maquette v3).
- **Impact :**
  - mis à jour : CLAUDE.md (§1, §3, §4, §5), Fiche projet (§1, §2, §6, §8), maquette v4 (`docs/12-maquette-v4/`) ;
  - à reformuler, non fait : Règle d'or, Phase 3 et Gate M3 dans la Roadmap & phases ;
  - à revoir quand le test reviendra : Hypothèses clés v1 et Protocole de test v1, écrits pour les revendeurs.

## 2026-10-03 — Cadrage initial du projet : ampleur, type, branches, outils

- **Contexte :** démarrage de PKM-App (app d'aide au suivi de la valeur et de la marge des produits Pokémon TCG pour collectionneurs et revendeurs français). L'hypothèse principale reste à tester, l'objectif chiffré et l'horizon sont « à préciser plus tard », l'équipe est à plusieurs (composition et rôles à confirmer). Il fallait fixer le cadre de gouvernance et la structure avant de produire les artefacts.
- **Décision :**
  - **Ampleur : Structurant** → Journal des décisions, revue hebdo (🔁 au backlog) et revue de jalon à chaque Gate.
  - **Type : projet d'exploration** (modèle ouvert / à explorer), premier livrable = le test le plus simple de l'hypothèse principale.
  - **Jeu de 9 branches** : 01 Pilotage · 02 Profil · 03 Cartographie · 04 Sourcing · 05 Analyse · 06 Comparaison · 07 Validation · 08 Transition · 09 Organisation & espace.
  - **Outils : tout dans Drive** (pas de cockpit Notion). Règle 1:1:1 branche ↔ dossier ↔ conversation, plus `RÉUNIONS & NOTES` et `ARCHIVES`.
- **Écarté :**
  - Ampleur **Standard** (défaut du kit) : un projet à plusieurs et à enjeux justifie la traçabilité du Structurant. Risque assumé de gouvernance trop lourde pour 2-4 h/jour (Roadmap, section Risques) ; parade : redescendre en Standard sans rien refaire (kit, Partie 8). *Motif détaillé à confirmer.*
  - Jeu de branches **d'exécution** (défaut du kit) : on cherche encore quoi tester, donc branches orientées recherche.
  - **Notion = cockpit, Drive = fichiers** (défaut du kit) : un seul outil retenu pour simplifier. *Motif détaillé à confirmer.*
- **Impact :** Fiche projet (§1, §4, §5, §7), Dossiers Drive (01 → 09 + `RÉUNIONS & NOTES` + `ARCHIVES`), Backlog (tâche 🔁 revue hebdo), Roadmap (Gates et revue de jalon), to-do d'amorçage complète à 21 artefacts.
