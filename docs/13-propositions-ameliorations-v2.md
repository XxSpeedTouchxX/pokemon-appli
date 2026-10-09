# Propositions d'améliorations v2 (PKM-App, figé)

*Créé le 2026-10-09 · proposition à valider par le porteur · remplace la v1 du 2026-10-07 (`docs/13-propositions-ameliorations.md`, gardée pour l'historique) · d'après la démo Dropicards (branche `claude/pokemon-app-mockup-1mxt7p`), les documents 01 à 08, CLAUDE.md et les demandes du porteur du 2026-10-09*

> Rien n'est lancé sans « go » (CLAUDE.md §6). Ce document propose et ordonne ; il ne décide pas.

---

## 0. Ce qui change depuis la v1

- **Nouvelles demandes du porteur (2026-10-09)**, détaillées en fiches complètes. Elles sont marquées ★ dans les tableaux :

  | Demande | Fiche |
  |---|---|
  | Haut de page à chaque changement de page, modifications gardées au retour | J1 |
  | Mode Admin | P1, P2 |
  | Animation d'entrée « comme une vraie app », à imaginer | K1 |
  | Page Compte : palier avant « Membre depuis », texte qui s'écrit tout seul, profil qui se déplie | L1 |
  | Territoire plus réaliste, branché sur une vraie API, vues au choix, infos dans une bulle accrochée | M1 à M3 |
  | Marché : choix de la vue | N1 |
  | Fonds d'écran stylés et animés selon l'action | K2 |

- **Livré depuis la v1 :**
  - monnaie PK : gemme, compteur, « Mes PK » ;
  - gains validés : +10, +10, +100, +300 ;
  - 152 compagnons à débloquer ;
  - thème Ouragan ;
  - logo de « Mon classeur » sans Poké Ball.
- **Catalogue élargi :** chaque catégorie de la v1 est complétée, et 7 catégories sont nouvelles :
  - J. Navigation ;
  - K. Animations et ambiance ;
  - L. Compte et profil ;
  - M. Territoire ;
  - N. Marché ;
  - O. PK et personnalisation ;
  - P. Administration.
- **Fiches de la v1 :** elles restent valables. Les tableaux ci-dessous les résument en une ligne et renvoient à la v1 (§3) pour le détail. Les nouvelles propositions ont une fiche complète (§4).

## 1. Comment lire ce document

- **Priorité :**
  - **P0** : à faire avant tout partage public, ou avant d'ajouter d'autres fonctions (fiabilité, juridique) ;
  - **P1** : forte valeur, effort raisonnable ;
  - **P2** : à planifier selon les entretiens et les mesures ;
  - **P3** : à instruire plus tard.
- **ICE** = Impact × Confiance × Facilité, chacun de 1 à 10 (maximum 1 000). C'est une estimation, à revoir après les entretiens (I1) et les premières mesures (G1).
- **Effort** de A à Z, en heures à plein régime. Repères : 8 h = 1 jour à 8 h/j = 2,7 jours au rythme réel de 3 h/j.
- **Coût :** mensuel, et ponctuel s'il y a lieu ; budget du projet : 500 à 5 000 €.
- **Hors périmètre, volontairement absents** (CLAUDE.md §4, §5.4) :
  - réseau social, marketplace, quêtes et saisons, multi-TCG, Pokédex ;
  - récupération automatique de pages (eBay, Vinted, Leboncoin, Cardmarket) sans avis juridique ;
  - achat de PK en argent réel.

---

## 2. Synthèse

### 2.1 Tes demandes du 2026-10-09, chiffrées

| ID | Proposition | Priorité | ICE | Effort | 8 h/j | 3 h/j | Coût |
|---|---|---|---|---|---|---|---|
| J1 ★ | Haut de page à chaque changement de page, réglages gardés au retour | P1 | 720 | 3 h | 0,4 j | 1 j | 0 € |
| L1 ★ | Page Compte : palier en tête, texte qui s'écrit, profil qui se déplie | P1 | 448 | 6 h | 0,8 j | 2 j | 0 € |
| N1 ★ | Marché : sélecteur de vues (liste, galerie, compacte, grandes cartes) | P1 | 392 | 6 h | 0,8 j | 2 j | 0 € |
| M2 ★ | Territoire : sélecteur de vues (liste, galerie, carte, compacte) | P1 | 392 | 6 h | 0,8 j | 2 j | 0 € |
| M3 ★ | Territoire : l'essentiel sur l'élément, « + » ouvre une bulle accrochée, appui ouvre la fiche | P1 | 378 | 6 h | 0,8 j | 2 j | 0 € |
| P1 ★ | Mode Admin sur la démo (panneau de contrôle) | P1 | 360 | 12 h | 1,5 j | 4 j | 0 € |
| K1 ★ | Animation d'entrée de l'app | P2 | 315 | 10 h | 1,3 j | 3,5 j | 0 € |
| K2 ★ | Fonds d'écran animés selon le contexte | P2 | 252 | 16 h | 2 j | 5,5 j | 0 € |
| M1 ★ | Territoire branché sur une vraie API de lieux (photos, notes, horaires du jour) | P2 | 224 | 18 h | 2,3 j | 6 j | 0 à 30 €/mois selon l'API (§4) |
| P2 ★ | Back-office Admin réel (comptes, modération, partenaires) | P3 | 90 | 40 h | 5 j | 13,5 j | 0 € (après G2) |
| | **Total** | | | **≈ 123 h** | **≈ 15,5 j** | **≈ 41 j** | |

### 2.2 Les 15 premières à faire, toutes catégories

| Rang | ID | Proposition | Priorité | ICE | Effort | Coût |
|---|---|---|---|---|---|---|
| 1 | J1 ★ | Haut de page et état gardé | P1 | 720 | 3 h | 0 € |
| 2 | A3 | Sauvegarder et restaurer sa collection | P0 | 648 | 10 h | 0 € |
| 3 | A1 | Tests automatisés du calcul de marge | P0 | 576 | 10 h | 0 € |
| 4 | G1 | Mesure d'usage sans cookies | P0 | 576 | 4 h | 0 € |
| 5 | H1 | Mentions légales, confidentialité, conditions (PK compris) | P0 | 567 | 5 h | 0 à 300 € une fois |
| 6 | I1 | Entretiens avec 10 collectionneurs | P0 | 540 | 19 h | 0 € |
| 7 | I3 | Reformuler la Règle d'or | P1 | 486 | 1 h | 0 € |
| 8 | L1 ★ | Page Compte réorganisée | P1 | 448 | 6 h | 0 € |
| 9 | D5 | Corriger et supprimer un ajout | P1 | 448 | 5 h | 0 € |
| 10 | A2 | Tests navigateur dans le dépôt, vérification à chaque envoi | P0 | 441 | 12 h | 0 € |
| 11 | N1 ★ + M2 ★ | Sélecteur de vues (Marché et Territoire, même composant) | P1 | 392 | 10 h ensemble | 0 € |
| 12 | M3 ★ | Bulle d'infos accrochée et fiche au toucher | P1 | 378 | 6 h | 0 € |
| 13 | P1 ★ | Mode Admin de la démo | P1 | 360 | 12 h | 0 € |
| 14 | C1 | Importer un fichier (tableur, PokéItem, PokéCardex) | P1 | 315 | 16 h | 0 € |
| 15 | K1 ★ | Animation d'entrée | P2 | 315 | 10 h | 0 € |

### 2.3 Ordre recommandé en quatre vagues

| Vague | But | Propositions | Effort | 8 h/j | 3 h/j | Coût |
|---|---|---|---|---|---|---|
| **1. Tes demandes rapides** | Confort immédiat, l'app « se tient » | J1, L1, K4, N1, M2, M3, P1 | ≈ 39 h | ≈ 5 j | ≈ 13 j | 0 € |
| **2. Fiabiliser** (vague 1 de la v1, élargie) | Ne rien perdre, chiffres justes, droit de publier, savoir mesurer | A1, A2, A3, G1, H1, H2, H3, H4, I1 | ≈ 65 h | ≈ 8 j | ≈ 22 j | 0 €/mois ; 350 à 900 € une fois |
| **3. Effet waouh et adoption** | Donner envie, faire venir, changer d'app sans effort | K1, K2, K3, C1, B1, B2, C2, A4, A5, B7, D1, D5, F1 | ≈ 97 h | ≈ 12 j | ≈ 32 j | 0 €/mois |
| **4. Se différencier** (après entretiens) | Revenir chaque semaine, partager, payer | M1, D3, D2, F5, B4, B11, B3, G2, G3, G4, O1, P2 | ≈ 195 h | ≈ 24 j | ≈ 65 j | 0 à 60 €/mois |

**Point de vigilance.** La récompense de +300 PK pour un partage pousse à montrer la démo en public. Or sa vague « Fiabiliser » n'est pas faite :
- pas de sauvegarde de la collection (A3) ;
- pas de mentions légales (H1) ;
- licences des données non vérifiées (H2) ;
- nom et marque non vérifiés (H3).

Je recommande de faire la vague 2 avant de pousser le partage au-delà des proches.

**Total du catalogue (92 propositions) :** environ 690 h, soit 86 jours à plein régime ou 230 jours au rythme réel. La longueur de la liste n'est pas l'objectif (CLAUDE.md §5.7) : les vagues 3 et 4 se choisissent après les mesures et les entretiens.

---

## 3. Catalogue complet par catégorie

Légende du statut : **v1** = fiche dans la v1 (§3), toujours valable · **★** = nouvelle demande du porteur, fiche au §4 · **v2** = nouvelle proposition, fiche au §4 · **en partie** = déjà commencé.

### A. Qualité et fiabilité

| ID | Proposition | Prio | ICE | Effort | Coût | Statut |
|---|---|---|---|---|---|---|
| A1 | Tests automatisés du calcul de marge | P0 | 576 | 10 h | 0 € | v1 |
| A2 | Tests navigateur dans le dépôt, vérification à chaque envoi (≈ 30 suites, ≈ 500 contrôles aujourd'hui hors dépôt) | P0 | 441 | 12 h | 0 € | v1 |
| A3 | Sauvegarder et restaurer sa collection (PK et compagnons compris) | P0 | 648 | 10 h | 0 € | v1 |
| A4 | Visuels de secours des cartes de démo, catalogue hors ligne | P1 | 486 | 4 h | 0 € | v1 |
| A5 | Alléger et accélérer (app.js : 857 Ko non minifié ; catalogue : 2,4 Mo chaque jour) | P1 | 336 | 10 h | 0 € | v1 |
| A6 | Suivi des erreurs | P2 | 288 | 3 h | 0 € | v1 |
| A7 | Bandeau « Nouvelle version disponible » et mise à jour en un geste | P2 | 270 | 3 h | 0 € | v2 |
| A8 | Indicateur hors ligne et file d'attente des ajouts faits sans réseau | P2 | 224 | 5 h | 0 € | v2 |
| A9 | Matrice de compatibilité testée (Safari iOS 15 et plus, Chrome Android, Samsung Internet, Firefox) | P2 | 240 | 4 h | 0 € | v2 |
| A10 | Budget de performance vérifié à chaque envoi (Lighthouse) | P3 | 168 | 3 h | 0 € | v2 |

### B. Prix et valeur

| ID | Proposition | Prio | ICE | Effort | Coût | Statut |
|---|---|---|---|---|---|---|
| B1 | Cote selon l'état et la langue | P1 | 336 | 8 h | 0 € | v1 |
| B2 | Vendre un exemplaire précis | P1 | 336 | 6 h | 0 € | v1 |
| B3 | Prix eBay par l'API officielle | P2 | 120 | 14 h | 0 € | v1 |
| B4 | Historique maison des cotes des cartes | P2 | 288 | 10 h | 0 € | v1 |
| B5 | Cartes gradées | P3 | 80 | 5 h | 0 € | v1 |
| B6 | Catalogue scellé élargi (≈ 300 produits) | P2 | 210 | 14 h | 0 € | v1 |
| B7 | Source et date sur chaque chiffre du classeur | P1 | 432 | 3 h | 0 € | v1 |
| B8 | Alerte de forte variation sur ta collection (± 20 % en 7 jours) | P2 | 252 | 5 h | 0 € | v2 |
| B9 | « Pourquoi ce prix ? » : sources, nombre de ventes, écart entre sources | P2 | 280 | 5 h | 0 € | v2 |
| B10 | Scellé : prix de lancement face à la cote du jour (plus-value depuis la sortie) | P2 | 245 | 4 h | 0 € | v2 |
| B11 | Indice Dropicards du scellé (panier d'ETB et de displays suivi chaque jour) | P3 | 192 | 8 h | 0 € | v2 |

### C. Saisie rapide

| ID | Proposition | Prio | ICE | Effort | Coût | Statut |
|---|---|---|---|---|---|---|
| C1 | Importer un fichier (tableur, PokéItem, PokéCardex) | P1 | 315 | 16 h | 0 € | v1 |
| C2 | Régler le scan sur ton téléphone avec de vraies cartes | P1 | 378 | 6 h | 0 € | v1 |
| C3 | Scan du scellé par code-barres | P2 | 150 | 10 h | 0 € | v1 |
| C4 | Scan en rafale et variantes | P2 | 180 | 8 h | 0 € | v1 |
| C5 | Précommandes depuis « Sorties » | P2 | 180 | 8 h | 0 € | v1 |
| C6 | Ajout groupé depuis la grille d'une extension (cocher les cartes possédées) | P1 | 336 | 6 h | 0 € | v2 |
| C7 | Annuler le dernier ajout pendant quelques secondes (« Annuler » dans le message) | P1 | 400 | 2 h | 0 € | v2 |

### D. Collection et classeur

| ID | Proposition | Prio | ICE | Effort | Coût | Statut |
|---|---|---|---|---|---|---|
| D1 | Classeur : glisser, filtrer, trier | P1 | 336 | 6 h | 0 € | v1 |
| D2 | Classeur par extension, avec complétion | P2 | 240 | 10 h | 0 € | v1 |
| D3 | Liste de souhaits et alertes de prix | P2 | 294 | 8 à 16 h | 0 € | v1 |
| D4 | Doublons | P2 | 280 | 4 h | 0 € | v1 |
| D5 | Corriger et supprimer un ajout | P1 | 448 | 5 h | 0 € | v1 |
| D6 | Plusieurs classeurs personnalisés (« Évolitions », « Full art »…) | P2 | 210 | 8 h | 0 € | v2 |
| D7 | Statistiques de la collection (répartition par extension, rareté, langue ; plus fortes hausses) | P2 | 252 | 6 h | 0 € | v2 |
| D8 | Classeur en plein écran, mode présentation (tourner les pages comme un vrai classeur) | P3 | 168 | 5 h | 0 € | v2 |
| D9 | Photo et note personnelles d'un exemplaire (centrage, défaut, provenance) | P3 | 150 | 6 h | 0 € | v2 |

### E. Marge et revente (cible secondaire)

| ID | Proposition | Prio | ICE | Effort | Coût | Statut |
|---|---|---|---|---|---|---|
| E1 | Frais à jour par plateforme | P2 | 245 | 6 h | 0 € | v1 |
| E2 | Repère des seuils de déclaration des plateformes | P3 | 105 | 4 h | 0 € | v1 |
| E3 | Export comptable simple | P3 | 224 | 3 h | 0 € | v1 |
| E4 | Prix plancher et objectif de vente par article | P3 | 144 | 4 h | 0 € | v2 |

### F. Design, accessibilité, personnalisation

| ID | Proposition | Prio | ICE | Effort | Coût | Statut |
|---|---|---|---|---|---|---|
| F1 | Logo d'en-tête net (ton logo en 1 200 px ou en SVG) | P1 | 450 | 0,5 h | 0 € | v1 |
| F2 | Thèmes pour tous les compagnons, par type (≈ 8 palettes) | P3 | 192 | 8 h | 0 € | v1, en partie (Océan, Volcan, Ouragan) |
| F3 | Accessibilité (lecteurs d'écran, tailles de texte, zones d'appui) | P2 | 336 | 6 h | 0 € | v1 |
| F4 | Premier lancement guidé (3 écrans, import, compagnon) | P2 | 294 | 6 h | 0 € | v1 |
| F5 | Partager une page de son classeur en image | P2 | 210 | 8 h | 0 € | v1 |
| F6 | Choix du thème indépendant du compagnon (jaune, Océan, Volcan, Ouragan, classique) | P2 | 280 | 3 h | 0 € | v2 |
| F7 | Vibrations courtes sur les actions clés (ajout, gain de PK, palier) ; Android seulement | P3 | 160 | 2 h | 0 € | v2 |

### G. Mesure, comptes, monétisation

| ID | Proposition | Prio | ICE | Effort | Coût | Statut |
|---|---|---|---|---|---|---|
| G1 | Mesure d'usage sans cookies (partages et PK compris) | P0 | 576 | 4 h | 0 € | v1 |
| G2 | Comptes et synchronisation entre appareils | P2 | 144 | 36 h | 0 € puis ≈ 25 $/mois | v1 |
| G3 | Offre gratuite et Premium | P2 | 144 | 20 h | 1,5 % + 0,25 € par paiement | v1 |
| G4 | Notifications sur le téléphone | P2 | 180 | 12 h | 0 € | v1 |
| G5 | Apps iOS et Android (Capacitor) | P3 | 70 | 50 h | 99 $/an + 25 $ | v1 |
| G6 | Invitation à installer l'app sur l'écran d'accueil (bannière Android, mode d'emploi iPhone) | P2 | 288 | 3 h | 0 € | v2 |

### H. Juridique et conformité

| ID | Proposition | Prio | ICE | Effort | Coût | Statut |
|---|---|---|---|---|---|---|
| H1 | Mentions légales, confidentialité, conditions d'utilisation | P0 | 567 | 5 h | 0 à 300 € | v1 (+ 1 h pour les PK) |
| H2 | Licences des données (V1 à V6 de docs/05) | P0 | — | 3 h + porteur | 0 € | v1 |
| H3 | Cadre juridique, droits Pokémon, marque « Dropicards », domaine | P0 | — | porteur | 350 à 600 € | v1 (Poké Ball du classeur retirée) |
| H4 | Règles des PK : sans valeur, non échangeables, modifiables ; protection des mineurs ; textes du partage | P0 | 360 | 2 h | 0 € | v2 |
| H5 | Conditions de l'API de lieux choisie (M1) : mentions, durée de conservation | P1 si M1 | — | 1 h | 0 € | v2 |

### I. Pilotage

| ID | Proposition | Prio | ICE | Effort | Coût | Statut |
|---|---|---|---|---|---|---|
| I1 | Entretiens avec 10 collectionneurs | P0 | 540 | 19 h | 0 € | v1 |
| I2 | Mettre à jour docs/06 et docs/08 pour les collectionneurs | P1 | 405 | 4 h | 0 € | v1 |
| I3 | Reformuler la Règle d'or | P1 | 486 | 1 h | 0 € | v1 |
| I4 | Tableau de bord des indicateurs | P2 | 320 | 4 h | 0 € | v1 (intégrable à P1) |

### J. Navigation et ergonomie (nouvelle catégorie)

| ID | Proposition | Prio | ICE | Effort | Coût | Statut |
|---|---|---|---|---|---|---|
| J1 | Haut de page à chaque changement de page, réglages de la page gardés au retour | P1 | 720 | 3 h | 0 € | ★ |
| J2 | Transitions entre pages (glissement d'un onglet à l'autre, fondu vers une fiche) | P2 | 280 | 4 h | 0 € | v2 |
| J3 | Geste retour : glisser depuis le bord gauche | P2 | 252 | 3 h | 0 € | v2 |
| J4 | Réglages des pages gardés aussi après fermeture de l'app (filtres, vues, onglets) | P2 | 240 | 2 h | 0 € | v2 |
| J5 | Recherche accessible de partout (loupe de l'en-tête) | P3 | 180 | 3 h | 0 € | v2 |

### K. Animations et ambiance (nouvelle catégorie)

| ID | Proposition | Prio | ICE | Effort | Coût | Statut |
|---|---|---|---|---|---|---|
| K1 | Animation d'entrée de l'app | P2 | 315 | 10 h | 0 € | ★ |
| K2 | Fonds d'écran animés selon le contexte (8 idées) | P2 | 252 | 16 h | 0 € | ★ |
| K3 | Micro-animations : ajout à la collection, gain de PK, nouveau palier, déblocage | P2 | 288 | 6 h | 0 € | v2 |
| K4 | Texte qui s'écrit tout seul, façon boîte de dialogue Pokémon (composant réutilisable) | P1 | 336 | 2 h | 0 € | ★ (avec L1) |

### L. Compte et profil (nouvelle catégorie)

| ID | Proposition | Prio | ICE | Effort | Coût | Statut |
|---|---|---|---|---|---|---|
| L1 | Page Compte réorganisée : palier en tête, texte animé, profil qui se déplie | P1 | 448 | 6 h | 0 € | ★ |
| L2 | Compagnon comme avatar (à la place de l'image de démo) | P2 | 320 | 2 h | 0 € | v2 |
| L3 | Date « Membre depuis » réelle (premier lancement), au lieu du texte fixe « août 2026 » | P1 | 400 | 1 h | 0 € | v2 |
| L4 | Pseudonyme local (affiché dans le Compte et sur les images partagées) | P3 | 160 | 2 h | 0 € | v2 |

### M. Territoire (nouvelle catégorie)

| ID | Proposition | Prio | ICE | Effort | Coût | Statut |
|---|---|---|---|---|---|---|
| M1 | Branchement sur une vraie API de lieux : photos, note, horaires du jour, « ouvert maintenant » | P2 | 224 | 18 h | 0 à 30 €/mois | ★ |
| M2 | Sélecteur de vues : liste, galerie, carte, compacte | P1 | 392 | 6 h | 0 € | ★ |
| M3 | L'essentiel sur l'élément ; « + » ouvre une bulle accrochée ; appui ouvre la fiche | P1 | 378 | 6 h | 0 € | ★ |
| M4 | Filtres : ouvert maintenant, type de boutique (spécialisée, enseigne culturelle, grande surface, presse) | P1 | 336 | 4 h | 0 € | v2 |
| M5 | Boutiques favorites, avec la distance | P2 | 252 | 3 h | 0 € | v2 |
| M6 | Signalements d'arrivage modérés, sans fil social (prévu le 2026-10-03), après G2 | P3 | 140 | 20 h | 0 € | v2 |
| M7 | Programme « boutiques partenaires » réelles : fiche, accord, annonce d'arrivage | P3 | 120 | porteur + 12 h | 0 € | v2 |

### N. Marché (nouvelle catégorie)

| ID | Proposition | Prio | ICE | Effort | Coût | Statut |
|---|---|---|---|---|---|---|
| N1 | Sélecteur de vues : liste, galerie, compacte, grandes cartes | P1 | 392 | 6 h (4 h si M2 fait avant) | 0 € | ★ |
| N2 | Filtres avancés : extension, rareté, langue, fourchette de prix | P1 | 336 | 5 h | 0 € | v2 |
| N3 | Tri : cote, variation 7 jours, nom, date de sortie | P1 | 360 | 2 h | 0 € | v2 |
| N4 | Plus fortes hausses et baisses de la semaine | P2 | 280 | 4 h | 0 € | v2 |
| N5 | Comparer deux articles côte à côte | P3 | 150 | 5 h | 0 € | v2 |

### O. PK et personnalisation (nouvelle catégorie)

| ID | Proposition | Prio | ICE | Effort | Coût | Statut |
|---|---|---|---|---|---|---|
| O1 | Parrainage +500 PK (mis en attente par le porteur) : avec petit serveur ou version locale | P3 | 160 | 5 h (serveur) ou 2 h (local) | 0 € | en attente |
| O2 | Historique des PK : chaque gain et chaque dépense, avec la date | P2 | 288 | 3 h | 0 € | v2 |
| O3 | Nouveaux déblocages : fonds animés (K2), thèmes seuls (F6), cadres du classeur, icônes d'app | P2 | 245 | 6 h | 0 € | v2 |
| O4 | PK pour les actions utiles : première sauvegarde (A3), premier import (C1) | P2 | 252 | 1 h | 0 € | v2 |
| O5 | Prix des compagnons modifiables depuis l'Admin (P1), sans toucher au code | P2 | 240 | inclus dans P1 | 0 € | v2 |

### P. Administration (nouvelle catégorie)

| ID | Proposition | Prio | ICE | Effort | Coût | Statut |
|---|---|---|---|---|---|---|
| P1 | Mode Admin de la démo : panneau de contrôle sur l'appareil | P1 | 360 | 12 h | 0 € | ★ |
| P2 | Back-office Admin réel : comptes, modération, partenaires, contenus, statistiques | P3 | 90 | 40 h après G2 | 0 € | ★ |

---

## 4. Fiches détaillées des nouvelles propositions

### J1 ★ · Haut de page à chaque changement de page, réglages gardés au retour — P1 · ICE 720

- **Constat :**
  - aujourd'hui, l'accueil, la Collection, le Marché, Territoire, les extensions, le scellé et les Sorties **retrouvent leur position de défilement** quand on y revient ;
  - les autres écrans s'ouvrent en haut ;
  - les réglages (recherche, filtre, onglet du classeur, rayon de Territoire…) sont déjà gardés pendant la visite, mais pas tous, et rien ne le garantit par un test.
- **Proposition :**
  - **toujours en haut** : chaque changement de page (onglet du bas, fiche, retour) affiche le haut de la page ;
  - **réglages gardés** : en revenant sur une page, on retrouve exactement ce qu'on y avait réglé ;

    | Page | Réglages gardés |
    |---|---|
    | Marché | recherche, filtre, vue |
    | Collection | recherche, filtre |
    | Territoire | rayon, tri, filtres, vue |
    | Accueil | onglet et page du classeur, recherche |
    | Extensions | extension ouverte |
    | Radar | secteur |
  - un test par page : régler, changer de page, revenir, vérifier position et réglages ;
  - option J4 (2 h) : garder aussi ces réglages après la fermeture de l'app.
- **Valeur :** une navigation prévisible, comme dans une app native.
- **Durable / mesure :** zéro écart dans les tests de navigation (A2).
- **Effort :** retirer la mémoire de défilement et passer en haut à chaque changement (1 h), inventaire et réglages manquants (1 h), tests (1 h). **3 h**, soit 0,4 j à 8 h/j et 1 j à 3 h/j.
- **Coût :** 0 €.

### P1 ★ · Mode Admin de la démo — P1 · ICE 360

- **Constat :** tester la démo demande aujourd'hui de modifier les données du navigateur à la main : PK, compagnons débloqués, date, profil.
- **Proposition :** un panneau « Admin » qui donne le contrôle de tout, réservé au porteur.
  - **Accès :** 7 appuis rapides sur le numéro de version dans Réglages › À propos, puis un code à 6 chiffres choisi par le porteur. Un badge « Admin » s'affiche dans l'en-tête tant que le mode est actif.
  - **PK et compagnons :**
    - fixer le solde, tout débloquer ou tout reverrouiller ;
    - modifier le prix de chaque compagnon (O5) ;
    - remettre à zéro le bonus du jour et le partage.
  - **Profil et paliers :** forcer Novice, Régulier ou Passionné, et un palier, pour voir chaque version des écrans.
  - **Temps :** simuler une date (aujourd'hui possible seulement par l'adresse `?today=`).
  - **Fonctions :** interrupteurs pour masquer ou montrer :
    - Territoire, Radar, Sorties, scan, PK ;
    - les partenaires fictifs ;
    - les animations (K1, K2).
  - **Données :**
    - date et taille du catalogue, du scellé et des boutiques ;
    - forcer un rechargement ;
    - vider le cache hors ligne.
  - **Démo :**
    - charger une collection type (vide, Novice, Régulier, Passionné) ;
    - rejouer l'accueil guidé ;
    - rejouer l'animation d'entrée.
  - **Diagnostic :**
    - erreurs récentes (A6) ;
    - mode `?debug=scan` en un geste ;
    - export de l'état complet en fichier.
  - **Indicateurs :** plus tard, le tableau de bord I4.
- **Limite importante :** sans serveur, tout se passe sur l'appareil et le code est visible dans l'app. Quelqu'un de déterminé peut ouvrir le panneau. C'est sans enjeu pour une démo : il ne modifie que son propre appareil. Un vrai contrôle de tous les utilisateurs demande des comptes (G2) et un back-office (P2).
- **Valeur :**
  - démontrer chaque cas en 10 secondes, en rendez-vous ou en entretien (I1) ;
  - régler les prix des PK sans passer par moi.
- **Durable / mesure :** temps pour préparer une démonstration (objectif : moins d'une minute).
- **Effort :** accès et code (2 h), PK et prix (2 h), profil, date et interrupteurs (3 h), données et démo (2 h), diagnostic (1 h), tests (2 h). **12 h**, soit 1,5 j à 8 h/j et 4 j à 3 h/j.
- **Coût :** 0 €.

### P2 ★ · Back-office Admin réel — P3 · ICE 90

- **Proposition (après les comptes G2) :**
  - rôles (porteur, modérateur) ;
  - utilisateurs (recherche, suppression sur demande RGPD) ;
  - modération des signalements d'arrivage (M6) ;
  - boutiques partenaires (M7) ;
  - contenus des Sorties ;
  - prix des PK pour tous ;
  - interrupteurs de fonctions à distance ;
  - statistiques (I4).
- **Effort :** **40 h**, soit 5 j à 8 h/j et 13,5 j à 3 h/j.
- **Coût :** 0 € sur l'offre gratuite de Supabase ou de Cloudflare.

### K1 ★ · Animation d'entrée de l'app — P2 · ICE 315

- **Règles communes :**
  - **2 s au plus**, un appui la passe ;
  - version complète au premier lancement de la journée, version éclair (0,6 s) ensuite ;
  - jouée **pendant** le chargement du catalogue : elle ne retarde jamais l'app ;
  - fondu simple si l'utilisateur limite les animations ;
  - SVG et CSS uniquement, sans bibliothèque lourde ;
  - sur l'app installée, le démarrage du téléphone (fond jaune et icône) enchaîne sans saut avec l'animation.

**Brainstorm, 6 idées** (écran de 390 × 844, fond jaune Dropicards) :

| # | Idée | Déroulé | Points forts | Effort |
|---|---|---|---|---|
| 1 | **Ouverture de booster** (recommandée) | Un booster aux couleurs Dropicards tremble ; l'éclair du « I » le déchire en zigzag (flash blanc) ; 5 cartes jaillissent en éventail ; la carte « O » se retourne, grandit et devient le logo ; les cartes se rangent derrière comme dans un classeur | Le geste préféré des collectionneurs ; raconte « tes cartes, leur valeur » | 10 h |
| 2 | **Coup d'éclair** | Écran sombre, un éclair jaune frappe le centre ; les lettres DROPICARDS tombent une à une avec rebond, tournées comme dans le logo ; étincelles ; le fond devient jaune | Très court, très lisible, fidèle au logo | 6 h |
| 3 | **Gemme PK** | La gemme apparaît, tourne en 3D, ses facettes s'allument une à une ; elle éclate en particules qui dessinent le logo ; le compteur de PK s'allume en haut à droite | Met la monnaie en avant | 8 h |
| 4 | **Compagnon qui court** | Ton compagnon traverse l'écran en courant (son sprite animé) et tire le logo derrière lui ; personnalisé à chaque lancement | Personnel, change selon le compagnon | 6 h |
| 5 | **Balayage radar** | Un faisceau radar jaune balaie l'écran et révèle le logo trait par trait, avec des points qui s'allument | Rappelle Territoire et le radar de l'accueil | 6 h |
| 6 | **Classeur qui s'ouvre** | Le classeur de « Mon classeur » s'ouvre en 3D ; les pages tournent vite ; la dernière page montre le logo | Fait le lien avec le classeur | 9 h |

- **Mesure :** part des lancements où l'animation est passée avant la fin (si plus de 60 %, la raccourcir) ; temps jusqu'à l'app utilisable inchangé (A5).
- **Coût :** 0 €.

### K2 ★ · Fonds d'écran animés selon le contexte — P2 · ICE 252

- **Règles communes :**
  - le fond vit **derrière** les cartes et fiches, qui restent opaques : le contraste de 4,5:1 est conservé ;
  - animation lente et discrète, 60 images par seconde au plus ;
  - mise en pause quand l'app est en arrière-plan ;
  - réglage « Fond animé : automatique, calme, désactivé » ; désactivé si l'utilisateur limite les animations ou si la batterie est faible (quand le téléphone le signale) ;
  - fonds réalisés en CSS ou sur un petit canevas, sans vidéo.

**Brainstorm, 8 idées :**

| # | Fond | Quand | Effet |
|---|---|---|---|
| 1 | **Reflet holo** | Fiche d'une carte, classeur | Un reflet arc-en-ciel glisse sur le fond selon l'inclinaison du téléphone (gyroscope), comme une carte holographique ; repli au mouvement du doigt sans gyroscope |
| 2 | **Éclairs** | Accueil (jaune) | De fins éclairs traversent le haut de temps en temps ; un flash au moment d'un scan réussi |
| 3 | **Cartes en apesanteur** | Collection | Silhouettes floues de cartes qui dérivent lentement, en parallaxe au défilement |
| 4 | **Courbes du marché** | Marché | Courbes de cours qui défilent en fond ; vertes si le marché monte sur 7 jours, rouges s'il baisse |
| 5 | **Ondes radar** | Territoire, Radar | Cercles concentriques lents depuis ta position |
| 6 | **Pluie de gemmes** | Gain de PK, déblocage | Gemmes qui tombent et scintillent 1,5 s |
| 7 | **Ambiance du compagnon** | Partout, avec le thème | Océan : vagues et bulles (Kyogre) ; Volcan : braises qui montent (Groudon) ; Ouragan : tourbillon et pluie fine (Rayquaza) ; Électrik : étincelles (Pikachu) |
| 8 | **Jour et nuit** | Partout | Le jaune se réchauffe le soir, ciel étoilé discret la nuit |

- **Proposition de départ :** le moteur commun, plus 4 fonds (1, 2, 6, 7). Les autres pourront se débloquer avec des PK (O3).
- **Effort :** moteur, réglage et pause (5 h), 4 fonds (8 h), contraste et performances sur téléphone d'entrée de gamme (3 h). **16 h**, soit 2 j à 8 h/j et 5,5 j à 3 h/j. Chaque fond de plus : 2 à 3 h.
- **Mesure :** temps passé dans l'app, retours en entretien ; aucune baisse de fluidité (images par seconde mesurées).
- **Coût :** 0 €.

### K3 · Micro-animations — P2 · ICE 288

- **Ajout à la collection :** la carte vole jusqu'à l'onglet Collection ; le montant de la valeur défile jusqu'au nouveau total.
- **Gain de PK :** la gemme du compteur pulse ; les chiffres défilent.
- **Nouveau palier :** bandeau doré et étincelles.
- **Déblocage d'un compagnon :** silhouette noire qui se révèle, comme un Pokémon qui apparaît.
- **Effort :** **6 h**, soit 0,8 j à 8 h/j et 2 j à 3 h/j.

### K4 ★ · Texte qui s'écrit tout seul — P1 · ICE 336

- **Proposition :** un composant réutilisable façon boîte de dialogue des jeux Pokémon.
  - les lettres apparaissent une à une (environ 30 par seconde) ;
  - petit triangle « ▼ » qui clignote à la fin ;
  - un appui affiche tout d'un coup ;
  - texte complet tout de suite si l'utilisateur limite les animations, et lu en entier par les lecteurs d'écran.
- **Utilisé par :** L1, puis l'accueil guidé (F4) et les messages de palier.
- **Effort :** **2 h**.

### L1 ★ · Page Compte réorganisée — P1 · ICE 448

- **Aujourd'hui :**
  - l'encadré d'identité affiche « Ton espace », puis « Membre depuis août 2026 », puis la ligne de palier (« Palier Rare · 77 % vers Ultra rare ») ;
  - l'encadré « Type de collectionneur » montre d'un coup :
    - le nom du profil ;
    - les trois profils ;
    - la description (« Collection installée : au moins 3 cartes ultra rares ou 1 000 € de valeur ») ;
    - « S'adapte tout seul à chaque ajout, scan ou vente » ;
    - l'encadré « Passionné dès … » ;
  - les sections « Ce qui fixe ton profil » et « Ce que ça change pour toi » sont toujours ouvertes.
- **Proposition, d'après ta demande :**
  1. **Identité :** « Palier Rare · 77 % vers Ultra rare » passe **avant** « Membre depuis… ». « Membre depuis » passe **en plus petit**, avec la vraie date du premier lancement (L3).
  2. **Type de collectionneur, fermé par défaut.** Ne restent visibles que :
     - la catégorie (icône et « Régulier ») ;
     - la ligne « Passionné dès 10 cartes ultra rares (encore 5) ou dès 5 000 € de collection (encore 2 344,81 €). »
  3. **Au toucher de la catégorie :**
     - la phrase « S'adapte tout seul à chaque ajout, scan ou vente » **s'écrit lettre par lettre**, comme dans Pokémon (K4) ;
     - puis « Collection installée : au moins 3 cartes ultra rares ou 1 000 € de valeur. » apparaît ;
     - puis le reste se **déplie avec une animation** :
       - les trois profils ;
       - « Ce qui fixe ton profil » (barres qui se remplissent) ;
       - « Ce que ça change pour toi » ;
       - ce qui avait été anticipé à l'inscription ;
     - animation proposée : la carte s'agrandit en douceur (0,35 s), chaque bloc glisse et apparaît l'un après l'autre (décalage de 60 ms), les barres de progression se remplissent ;
     - un second appui replie tout ; la flèche de la catégorie tourne.
  4. **Accessibilité :** la catégorie est un vrai bouton « déplier » (état ouvert ou fermé annoncé) ; tout est lisible sans animation.
- **Durable / mesure :** part des visiteurs du Compte qui déplient ; temps pour comprendre son profil (en entretien).
- **Effort :** ordre et tailles (1 h), repli et dépliage animés (2 h), texte animé, avec K4 (1 h), « Membre depuis » réel (1 h), tests (1 h). **6 h**, soit 0,8 j à 8 h/j et 2 j à 3 h/j.
- **Coût :** 0 €.

### M1 ★ · Territoire branché sur une vraie API de lieux — P2 · ICE 224

- **Constat :**
  - les boutiques viennent d'OpenStreetMap, mis à jour chaque semaine (3 397 boutiques, adresse, horaires saisis par la communauté) ;
  - il manque photos, notes et horaires à jour ;
  - la « chance d'arrivage » est une estimation.
- **Ce qu'aucune API publique ne donne :** le **stock réel** d'une boutique. Une vraie probabilité d'arrivage viendra des boutiques partenaires (M7) et des signalements (M6), comme prévu le 2026-10-03.
- **Options** (tarifs et conditions **à vérifier** au moment du choix, H5) :

| API | Apporte | Coût indicatif | Contraintes |
|---|---|---|---|
| **Google Places (New)** | Photos, note et avis, horaires à jour, « ouvert maintenant », téléphone, site | Quota gratuit mensuel par type d'appel, puis payant au millier d'appels | Conservation limitée des résultats ; mention Google obligatoire ; clé restreinte au domaine |
| **Foursquare Places** | Catégories fines, photos, popularité, horaires | Offre gratuite avec quota, puis au millier d'appels | Mention Foursquare |
| **Geoapify Places** | Données OpenStreetMap enrichies, catégories, recherche autour d'un point | Offre gratuite quotidienne | Mention OSM et Geoapify |

- **Recommandation :**
  - garder OpenStreetMap pour la liste et la carte (gratuit, déjà en place) ;
  - appeler **Google Places seulement à l'ouverture d'une fiche** : photo, note, horaires du jour, « ouvert maintenant » ;
  - mettre en cache pour la journée, dans la limite des conditions ;
  - ce volume reste dans le quota gratuit tant que l'usage est celui d'une démo.
- **Plus réaliste aussi :**
  - type de boutique : spécialisée, Fnac, Cultura, Micromania, grande surface, presse (M4) ;
  - temps de trajet à pied et en voiture ;
  - « ouvert maintenant » ;
  - photo de façade.
- **Effort :** compte et clé restreinte (1 h), petit relais Cloudflare Worker pour protéger la clé et mettre en cache (5 h), fiche enrichie (5 h), types et « ouvert maintenant » (4 h), conditions et mentions (1 h), tests (2 h). **18 h**, soit 2,3 j à 8 h/j et 6 j à 3 h/j.
- **Coût :** 0 €/mois pour une démo ; jusqu'à environ 30 €/mois avec quelques milliers d'utilisateurs actifs, selon l'API et le cache.

### M2 ★ et N1 ★ · Sélecteur de vues (Territoire et Marché) — P1 · ICE 392

- **Proposition :** un bouton de vue en haut de la liste (icône à 4 cases) ouvre un petit menu. Le choix est gardé (J1, J4).
- **Vues de Territoire (M2) :**

  | Vue | Ce qu'elle montre |
  |---|---|
  | Liste | ligne par boutique (actuelle) |
  | Galerie | 2 par ligne, photo ou plaque (M1) |
  | Carte | la carte en plein écran, avec la liste en tiroir |
  | Compacte | nom, distance, chance, sur une ligne |

- **Vues du Marché (N1) :**

  | Vue | Ce qu'elle montre |
  |---|---|
  | Liste | actuelle |
  | Galerie | 3 visuels par ligne avec la cote |
  | Compacte | tableau nom, cote, variation 7 jours |
  | Grandes cartes | 16:9, mise en avant du scellé |

- **Même composant** pour les deux : un seul développement, testé une fois.
- **Effort :** composant et Territoire (6 h), puis Marché (4 h). **10 h ensemble**, soit 1,3 j à 8 h/j et 3,5 j à 3 h/j.
- **Coût :** 0 €.

### M3 ★ · L'essentiel sur l'élément, bulle accrochée, fiche au toucher — P1 · ICE 378

- **Proposition :**
  - chaque boutique ne montre que l'essentiel : nom, distance, ouvert ou fermé, chance d'arrivage ;
  - un bouton **« + »** sur l'élément ouvre une **bulle accrochée à l'élément**, avec une petite flèche vers lui : adresse, horaires du jour, téléphone, itinéraire, site, produits suivis ;
  - la bulle suit l'élément au défilement et se ferme d'un appui ailleurs ;
  - **un appui sur l'élément lui-même** ouvre la page complète de la boutique (fiche actuelle, enrichie par M1) ;
  - même principe dans le Marché (appui = fiche ; « + » = cote par source, variation, ajout rapide).
- **Accessibilité :** la bulle est annoncée comme « détails » ; Échap ou le bouton retour la ferment.
- **Effort :** **6 h**, soit 0,8 j à 8 h/j et 2 j à 3 h/j.
- **Coût :** 0 €.

### Autres nouvelles propositions (v2), en bref

| ID | Proposition, en une phrase |
|---|---|
| A7 | Quand une nouvelle version est en ligne : bandeau « Mettre à jour », sans devoir fermer l'app. |
| A8 | Indicateur « hors ligne » ; les ajouts faits sans réseau sont gardés, puis la cote est complétée au retour. |
| A9 | Liste de navigateurs testés à chaque envoi, dont Safari d'iPhone, le plus sensible pour la caméra et l'installation. |
| A10 | Échec du build si l'app dépasse un budget de poids ou de temps de chargement. |
| B8 | Message dans l'app quand un article de ta collection bouge de plus de 20 % en 7 jours. |
| B9 | Sur la fiche, le détail de la cote : chaque source, son prix, sa date, l'écart entre sources. |
| B10 | Pour le scellé : prix de lancement, cote du jour et plus-value depuis la sortie. |
| B11 | Un indice de prix du scellé, calculé chaque jour par Dropicards : un actif de données propre. |
| C6 | Dans la grille d'une extension, cocher toutes les cartes possédées d'un coup. |
| C7 | « Annuler » dans le message qui suit un ajout. |
| D6 | Créer ses propres classeurs thématiques. |
| D7 | Graphiques de répartition de la collection. |
| D8 | Classeur en plein écran pour montrer sa collection. |
| D9 | Photo de sa vraie carte et note personnelle. |
| E4 | Prix plancher et objectif de vente. |
| F6 | Choisir son thème sans changer de compagnon. |
| F7 | Vibrations courtes (Android). |
| G6 | Inviter à installer l'app sur l'écran d'accueil. |
| H4 | Conditions des PK : sans valeur, non échangeables, règles modifiables ; mineurs. |
| H5 | Conditions de l'API de lieux. |
| J2 | Transitions animées entre pages. |
| J3 | Retour en glissant depuis le bord. |
| J4 | Réglages gardés après fermeture. |
| J5 | Recherche depuis l'en-tête. |
| L2 | Le compagnon devient l'avatar. |
| L3 | Vraie date « Membre depuis ». |
| L4 | Pseudonyme local. |
| M4 | Filtres « ouvert maintenant » et type de boutique. |
| M5 | Boutiques favorites. |
| M6 | Signalements d'arrivage modérés (après comptes). |
| M7 | Vraies boutiques partenaires. |
| N2 | Filtres avancés du Marché. |
| N3 | Tri du Marché. |
| N4 | Hausses et baisses de la semaine. |
| N5 | Comparer deux articles. |
| O2 | Historique des PK. |
| O3 | Nouveaux déblocages (fonds, thèmes, cadres, icônes). |
| O4 | PK pour sauvegarder et importer. |
| O5 | Prix des compagnons réglables dans l'Admin. |

---

## 5. Ce que je recommande de valider maintenant

1. **Go pour la vague 1, tes demandes rapides** (≈ 39 h, soit 5 j à 8 h/j ou 13 j à 3 h/j ; 0 €), dans cet ordre :
   1. J1 : haut de page et réglages gardés ;
   2. L1 avec K4 : page Compte ;
   3. M2, N1 et M3 : vues et bulle d'infos ;
   4. P1 : mode Admin.
2. **Deux choix à faire :**
   - **l'animation d'entrée** (K1) : je recommande « Ouverture de booster » (idée 1) ;
   - **les 4 premiers fonds animés** (K2) : je recommande le reflet holo, les éclairs, la pluie de gemmes et l'ambiance du compagnon.
3. **L'API de Territoire** (M1) : d'accord pour OpenStreetMap, avec Google Places seulement à l'ouverture d'une fiche ? Cela demande de créer un compte Google Cloud, avec une carte bancaire, même dans le quota gratuit.
4. **La vague « Fiabiliser »** juste après, avant de pousser le partage public : sauvegarde de la collection (A3), mentions légales et règles des PK (H1, H4), licences (H2), marque (H3).

*Effort des quatre vagues : environ 400 h, soit 50 jours à plein régime ou 133 jours au rythme réel. Catalogue complet : environ 690 h, soit 86 jours ou 230 jours. D'où l'intérêt de choisir les vagues 3 et 4 après mesure.*
