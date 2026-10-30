# Outils du serveur dédié

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
