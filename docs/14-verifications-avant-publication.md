# Vérifications avant publication (PKM-App, vivant)

*Créé le 2026-10-09 · document vivant, mis à jour à chaque vérification · liste ce qui reste à faire **par le porteur** (ou avec un professionnel) avant de montrer Dropicards au-delà des proches ; ce que Claude a déjà préparé est indiqué.*

> Rien ici n'est un avis juridique. Les points marqués « à faire relire » demandent un professionnel (avocat en propriété intellectuelle, ou juriste du numérique).

---

## 1. À compléter dans l'app (10 minutes)

| Point | Où | Ce qu'il faut |
|---|---|---|
| Éditeur | Réglages › À propos › Informations légales › Mentions légales | Nom ou raison sociale, adresse, e-mail de contact |
| Directeur de la publication | idem | Nom |
| Contact confidentialité et conditions | Confidentialité, Conditions | Un e-mail de contact |

Les champs sont marqués « [à compléter par l'éditeur avant publication] » dans `tools/web/legal.js`. Donne-moi ces informations et je les intègre.

## 2. Licences des données (H2)

Pour chaque source : lire les conditions, puis écrire pour obtenir une confirmation de l'usage prévu (application gratuite puis Premium, sans revente des données).

| Source | Usage dans Dropicards | Question à poser |
|---|---|---|
| **TCGdex** (catalogue, visuels, prix) | Catalogue complet, visuels depuis leur CDN, prix Cardmarket et TCGplayer qu'ils agrègent | L'usage dans une app gratuite puis payante est-il permis ? Faut-il une mention précise ? Les prix agrégés peuvent-ils être affichés et archivés ? |
| **Cardmarket** (prix du scellé) | Cote du jour des 61 produits, archive quotidienne | Les fichiers publics de prix peuvent-ils servir à une app tierce, gratuite puis payante ? |
| **pokemontcg.io** (visuels de repli) | Quelques visuels anglais, en dernier recours ; arrêt annoncé le 1ᵉʳ mars 2027 | Usage permis ; prévoir le remplacement avant l'arrêt |
| **Galerie officielle Pokémon France** (visuels du scellé) | Photos officielles des produits | Sujet couvert par la décision du 2026-10-03 (visuels autorisés par le porteur, risque assumé) ; à inclure dans la consultation H3 |
| **OpenStreetMap** (boutiques) | Liste et carte des boutiques | Licence ODbL : mention « © les contributeurs d'OpenStreetMap » déjà affichée ; partage à l'identique si la base est redistribuée |
| **OpenFreeMap** (fond de carte du Radar) | Tuiles de la carte | Conditions d'usage gratuites à confirmer pour une app publique |
| **Polices** (Sora, Plus Jakarta Sans, Luckiest Guy) | Texte de l'app | Licence libre (SIL OFL), licences copiées dans `web/fonts/` ; **fait le 2026-10-09** : polices hébergées avec l'app, plus aucun appel à Google Fonts depuis la démo |

## 3. Droits Pokémon et marque (H3)

- **Consultation d'un avocat en propriété intellectuelle** (150 à 400 €) :
  - affichage des noms et visuels de cartes, des visuels de produits et des sprites des compagnons ;
  - icône PK (gemme, sans repère de Poké Ball) ;
  - publication sur les stores ;
  - textes des pages légales et des règles des PK.
- **Marque « Dropicards » :**
  - recherche d'antériorité (INPI, EUIPO) ;
  - puis dépôt à l'INPI : 190 € pour une classe, environ 40 € par classe en plus. Classes probables : 9 (logiciel), 42 (services en ligne).
- **Nom de domaine :** 10 à 15 €/an. Ensuite, brancher le domaine sur Cloudflare Pages (Claude peut préparer la marche à suivre).

## 4. Mesure d'usage sans cookie (G1)

- Le plus simple, gratuit : dans le tableau de bord Cloudflare, ouvrir le projet Pages `pokemon-appli`, puis **Web Analytics › Activer**. Aucune ligne de code, aucun cookie : visites, pages et pays.
- Une fois activée, prévenir Claude pour mettre à jour la rubrique « Mesure d'audience » de la page Confidentialité.
- Les événements détaillés (carte ajoutée, scan réussi, sauvegarde) demanderont un petit service, à décider avec les entretiens.

## 5. À mesurer sur ton téléphone

| Point | Ce qu'il faut |
|---|---|
| **Scan** (C2) | Ouvrir `https://pokemon-appli.pages.dev/?debug=scan#scan` et scanner 30 vraies cartes (récentes, anciennes, full art). Noter combien sont trouvées en tête des 3 propositions ; envoyer les captures du mode diagnostic. |
| **Logo net** (F1) | Envoyer ton logo en 1 200 px de large ou plus, ou en SVG. |
| **Sauvegarde** | Faire une sauvegarde (Réglages › « Sauvegarder ou restaurer ») et vérifier que le fichier arrive bien dans Fichiers ou Drive. |

## 6. Entretiens (I1)

Dix collectionneurs, 45 minutes chacun. Le guide d'entretien est à préparer (proposition I1 de `docs/13-propositions-ameliorations-v2.md`) : demande-le à Claude quand tu es prêt à recruter.

---

| Date | Mise à jour |
|---|---|
| 2026-10-09 | Création : pages légales intégrées dans l'app, champs de l'éditeur à compléter ; liste des vérifications. |
