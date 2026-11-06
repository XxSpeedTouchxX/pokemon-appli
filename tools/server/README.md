# Outils du serveur dédié

> **2026-11-05 :** dropicards.fr est publié par **Coolify** (projet « PKM », ressource « dropicards », Build strategy « Static », nginx:alpine, dossier `/web`), redéployé à chaque envoi sur la branche. `install-autoupdate.sh` ne doit **pas** être lancé sur ce serveur.

## Configuration nginx dans Coolify (`coolify-nginx.conf`, 2026-11-05)

À coller dans la ressource › Configuration › General › Build & deploy › « Custom Nginx configuration », puis Save et Redeploy. Reprend la configuration par défaut de Coolify v4.6.0 et ajoute : HSTS, `nosniff`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` (caméra et position pour le site seulement), non-indexation, compression gzip, `no-cache` pour `/`, `index.html`, `app.js`, `sw.js`, le manifeste et `/data/`, cache d'un an pour `/vendor/tesseract/`, manifeste en `application/manifest+json`, `_headers` et `_redirects` jamais servis. Vérifiée avec nginx (`nginx -t`) et le test navigateur `t-look` derrière cette configuration. Pas encore de Content-Security-Policy. Retour en arrière : vider le champ, Save, Redeploy.

## Mise à jour automatique du site (`install-autoupdate.sh`, 2026-10-30)

Depuis le passage sur le serveur OVH (2026-10-29), le site ne se mettait plus à jour. À lancer **une fois**, avec sudo :

```sh
curl -fsSL https://raw.githubusercontent.com/XxSpeedTouchxX/pokemon-appli/claude/pokemon-app-mockup-1mxt7p/tools/server/install-autoupdate.sh -o maj.sh
sudo bash maj.sh
```

- **Dossier du site** : trouvé dans la configuration nginx (bloc qui contient `dropicards.fr`), ou donné avec `ROOT=/chemin`.
- **Avant toute modification** : plan affiché, confirmation par `OUI`, sauvegarde du site dans `/root`.
- **Dépôt** : copie du dépôt public dans `/opt/dropicards/depot`.
- **Toutes les 5 minutes** (minuterie systemd `dropicards-maj`, sinon cron) :
  - téléchargement de la branche publiée ;
  - garde-fou : rien n'est remplacé si `index.html`, `app.js`, `sw.js` ou `data/cards.json` manque ;
  - copie de `web/` dans le dossier servi (`_headers`, `_redirects` et `.well-known` exclus).
- **À la fin** : version sur le serveur et vue de l'extérieur, cache de `sw.js`, `.git` exposé ou non.
- **Ce qu'il ne touche pas** : nginx, le pare-feu, SSH.
- **Journal** : `sudo journalctl -u dropicards-maj -n 20`.
- **Tout retirer** : voir l'en-tête du script.

## Audit en lecture seule (`audit.sh`, 2026-10-30)

Fait le point sur le serveur de https://dropicards.fr **sans rien modifier** : aucune installation, aucun redémarrage,
aucun fichier écrit. Aucun secret n'est affiché (ni clé, ni mot de passe, ni contenu de fichier sensible) ; les
adresses IP et e-mail sont masquées, pour pouvoir coller le résultat dans une conversation.

Sur le serveur, depuis le dossier du dépôt (que le serveur récupère déjà) :

```sh
sudo bash tools/server/audit.sh | tee ~/audit-dropicards.txt
```

Sans `sudo`, le script marche aussi, mais SSH, pare-feu, PostgreSQL et comptes restent en partie vides.
`SITE=https://www.dropicards.fr sudo -E bash tools/server/audit.sh` pour vérifier une autre adresse.

Ce qui est vérifié, puis résumé à la fin (OK, À VOIR, RISQUE) :
1. système, disque, heure, chiffrement du disque ;
2. mises à jour en attente et mises à jour de sécurité automatiques ;
3. comptes, droits root, sudo, nombre de clés SSH ;
4. configuration SSH effective (mot de passe, root), tentatives ratées sur 24 h ;
5. ports ouverts à l'extérieur, PostgreSQL ouvert ou non ;
6. pare-feu (ufw, nftables, iptables), fail2ban ou CrowdSec ;
7. nginx (extraits de configuration sans secrets), certificats ;
8. le site vu de l'extérieur : redirection vers https, en-têtes de sécurité, fichiers qui ne doivent jamais être
   servis (`.git`, `.env`, `docs/`, `tools/`…), protocoles TLS anciens ;
9. mise à jour automatique du site (cron, minuteries systemd, dépôt git) ;
10. PostgreSQL (bases, rôles, règles d'accès) et services en marche ;
11. traces de sauvegarde.

Le résumé couvre les erreurs les plus courantes ; il ne remplace pas un audit complet (vague 12 des propositions v5).

## Ports 8000, 6001 et 6002 fermés au public (2026-11-06, `docs/25` étape D3)

`close-ports.sh` : règle dans la chaîne DOCKER-USER (Docker ouvre ses ports en passant à côté du pare-feu), sur la carte réseau publique seulement (Tailscale et le serveur gardent l'accès ; Coolify reste ouvert par son domaine), reposée à chaque redémarrage par le service `dropicards-ports`. Dans le terminal de Coolify :

```sh
curl -fsSL https://raw.githubusercontent.com/XxSpeedTouchxX/pokemon-appli/claude/pokemon-app-mockup-1mxt7p/tools/server/close-ports.sh -o /root/close-ports.sh
sh /root/close-ports.sh install     # retour en arrière : sh /root/close-ports.sh remove
```
