# Démo web de PKM-App

Version web installable (dossier `web/`) de la maquette v5 (`docs/12-maquette-v5/`) : mêmes écrans, même logique, **données, prix et magasins fictifs**. Il n'y a ni compte, ni serveur, ni vraies données de prix.

- **Page claude.ai (privée) :** https://claude.ai/artifact/9sDF5mc4brvvYaZWLd64qe
- **Hébergement prévu :** Cloudflare Pages, accès limité par e-mail.

## Avant tout partage public

Les visuels de `web/img/` sont des **découpes provisoires** de captures d'écran. Il faut les remplacer par les images TCGdex (CLAUDE.md §4) avant d'ouvrir l'adresse à d'autres personnes que l'équipe.

## Mettre en ligne sur Cloudflare Pages

*Les libellés de l'interface Cloudflare peuvent varier.*

1. Crée un compte gratuit sur https://dash.cloudflare.com.
2. Ouvre **Workers & Pages**, puis **Créer**, onglet **Pages**, puis **Se connecter à Git**. Autorise GitHub et choisis le dépôt `XxSpeedTouchxX/pokemon-appli`.
3. Renseigne les réglages :

   | Réglage | Valeur |
   |---|---|
   | Nom du projet | `pkm-app` (adresse `https://pkm-app.pages.dev`) |
   | Branche de production | `claude/pokemon-app-mockup-1mxt7p`, tant qu'elle n'est pas fusionnée dans `main` |
   | Préréglage du framework | Aucun |
   | Commande de build | vide |
   | Répertoire de sortie | `web` |

4. Clique sur **Enregistrer et déployer**. Ensuite, chaque push sur la branche met le site à jour.
5. Limite l'accès (recommandé) :
   - ouvre **Zero Trust**, puis **Access**, puis **Applications** ;
   - ajoute une application **Self-hosted** sur `pkm-app.pages.dev` ;
   - crée une règle **Emails** avec la liste des personnes autorisées ;
   - choisis la connexion par code reçu par e-mail (*One-time PIN*).

   C'est gratuit jusqu'à 50 utilisateurs.
6. Installe la démo sur ton téléphone :
   - **iPhone :** Safari, puis **Partager**, puis **Sur l'écran d'accueil** ;
   - **Android :** Chrome, puis menu **⋮**, puis **Installer l'application**.

Le site n'est pas indexé par les moteurs de recherche : balise `robots` et en-tête `X-Robots-Tag` dans `_headers`.

## Ouvrir un écran précis

- **Avec un ancrage :** `#territoire`, `#scan`, `#collection`, `#marche`, `#profil`, `#paliers`, `#reglages`, `#ventes`, `#bienvenue` (accueil en 3 étapes), `#novice` (petite collection de démo).
- **Avec des paramètres (hébergement uniquement) :** par exemple `?start=store&storeId=s3`.

## Régénérer après une évolution de la maquette

Ne modifie pas `web/app.js` à la main : il est généré à partir de `docs/12-maquette-v5/Main.dc.html`.

```bash
cd tools/web
npm ci
npm run build
```

Le script `tools/web/build.mjs` :
- convertit le gabarit du canevas Design en gabarit Vue, compilé à l'avance (pas d'évaluation de code dans le navigateur) ;
- adapte la page aux vraies tailles d'écran ;
- copie Vue 3.5.43 dans `web/vendor/` et les images dans `web/img/`.

## Contenu du dossier `web/`

| Fichier | Rôle |
|---|---|
| `index.html` | Page de l'app |
| `app.js` | Logique de la maquette, gabarit compilé et démarrage |
| `vendor/vue.runtime.global.prod.js` | Vue 3.5.43, licence MIT |
| `img/` | Visuels provisoires |
| `icons/` | Icônes de l'app |
| `manifest.webmanifest` | Installation sur l'écran d'accueil |
| `sw.js` | Fonctionnement hors ligne : réseau d'abord, copie locale à défaut |
| `_headers` | En-têtes Cloudflare : non-indexation, cache |
