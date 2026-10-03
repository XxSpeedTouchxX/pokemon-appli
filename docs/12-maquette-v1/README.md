# Maquette v1 (PKM-App, figé)

*Créée le 2026-10-03 · usage interne (aligner l'équipe, préparer la Proposition d'application v1) · données fictives*

> **Statut.** Une maquette est de la spécification, pas du développement. Elle respecte la Règle d'or : elle ne vaut pas « go » de développement et ne remplace pas le test concierge de la Phase 3.

## Ouvrir la maquette

- **Lien :** https://claude.ai/artifact/FUh3nx5AxNTv8s7jQLB5uA. Le lien est privé : partage-le depuis le menu *Partager* de la page pour que l'équipe puisse l'ouvrir.
- **Vue d'ensemble :** les 14 écrans sont disposés en deux rangées, mode simple en haut et mode avancé en bas.
- **Prototype :** bouton *Play* sur un cadre. Le premier cadre démarre sur l'écran Marge. Le bouton + saisit une vente ou un achat, et le stock, la marge et le récap se recalculent.
- **Fichiers de ce dossier :** ce sont les sources du canevas (`canvas.json` + `*.dc.html`). Ils ne s'ouvrent pas seuls dans un navigateur : ils servent d'archive versionnée.

## Choix validés (2026-10-03)

| Question | Choix |
|---|---|
| Usage | Interne : équipe et Proposition d'application v1 |
| Périmètre | Mode simple + mode avancé activable |
| Support | Mobile d'abord (web app / PWA) |
| Noms de produits | Types réels (display, ETB, UPC, coffret), séries inventées, aucune image |

## Écrans

**Mode simple (par défaut).** Il comprend :
- **Marge :** l'accueil reprend le récap du dimanche du test concierge.
- **Stock**, **Fiche produit**, **Ventes** et **Détail d'une vente**.
- **Saisie rapide :** produit, prix et plateforme, avec la marge nette estimée en direct.
- **Réglages**, qui contiennent l'interrupteur du mode avancé.

**Mode avancé (activable).** Les mêmes écrans affichent en plus :
- **Lots :** répartition du prix d'un lot entre ses articles.
- **Associés :** apports de chacun et partage de la marge.
- **Frais par plateforme :** frais modifiables.
- **Importer / exporter :** fichiers CSV.

## Règles de calcul appliquées dans le prototype (à valider)

1. **Marge nette d'une vente** = prix de vente − commission − port et emballage à ta charge − coût d'achat.
2. **Coût d'achat** = PRU (coût moyen pondéré) du produit au jour de la vente, puis **figé**. Un achat ultérieur ne modifie pas les marges passées.
3. **Frais d'une vente :** calculés depuis la plateforme au moment de l'enregistrement, puis figés et modifiables vente par vente. Un changement de barème ne s'applique qu'aux ventes suivantes.
4. **Port non renseigné :** la marge est estimée avec le port par défaut de la plateforme, et la vente est signalée « Port à renseigner ».
5. **Lot :** son prix est réparti au prorata de la valeur de marché à la date d'achat, tirée de l'archive maison, ou à parts égales. Le choix change fortement les marges : en parts égales, la vente eBay de l'ETB devient une perte.
6. **Valorisation du stock :** par défaut au prix tendance Cardmarket, réglable sur la moyenne 30 jours ou le plus bas. Chaque prix affiche sa source et sa date, avec l'étiquette « demandé » (annonce) ou « vendu » (tes ventes).

## Hypothèses et points à vérifier

- **Frais par plateforme :** ce sont des valeurs d'exemple (Vinted 0 %, Cardmarket 5 %, eBay 11 % + 0,35 €). Elles sont à vérifier selon le statut (particulier ou professionnel).
- **Indicateurs Cardmarket :** leur nature est à confirmer (prix demandé ou prix de vente). Seul le « plus bas » est étiqueté « demandé ». Lié aux vérifications V1 et V5 du document *Sources de données & prix v1*.
- **Doc 10 :** l'*Analyse PokéItem (brouillon)* n'était pas disponible, donc la liste de fonctions A à N n'est pas reprise.

## Hors maquette (non retenu dans le périmètre choisi)

Précommandes et stock en transit, alertes de prix, export comptable, scan, réseau social, marketplace, multi-TCG.
