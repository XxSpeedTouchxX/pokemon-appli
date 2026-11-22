# Guide des notifications sur le téléphone (PKM-App, vivant)

*2026-11-20 · pour le porteur, sans jargon · demande du porteur : « je veux que l'utilisateur reçoive une notif sur son téléphone dès lors que les jeux (booster, pièce ou safari) sont de nouveau disponibles », plus une relance après 72 h et une après 1 semaine sans ouvrir l'app.*

> **À retenir.** Tout est construit et testé. Il reste **3 étapes** à faire une fois (environ 5 minutes). **Sans elles, aucune notification n'arrive app fermée** ; depuis le 22 novembre 2026, l'app n'en montre plus non plus à l'ouverture (seulement les pastilles). **Pour savoir si c'est en place** : Mon profil › Notifications doit afficher « Notifications actives sur ce téléphone, même quand l'app est fermée ». **Coût : 0 €** (les services d'envoi de Google, Apple et Mozilla sont gratuits ; rien à payer, aucun compte à créer pour le site).
>
> **Point au 22 novembre 2026 :** étapes 1 et 2 faites par le porteur (la fonction répond et la clé d'envoi est prête) ; reste l'étape 3 sur le téléphone.

---

## Comment ça marche, en clair

1. Sur son téléphone, le joueur touche **Mon profil › Notifications › « Autoriser les notifications »**.
2. Le téléphone donne alors à Dropicards une **adresse d'envoi** (une sorte de boîte aux lettres de ce téléphone). L'app l'enregistre avec son compte, sur ton serveur.
3. **Toutes les 5 minutes**, ton serveur regarde qui a un jeu de nouveau prêt, ses PA du jour à récupérer, ou n'est pas venu depuis 3 jours ou 7 jours. Il envoie la notification à cette adresse. Elle arrive **même si l'app est fermée**.

### Ce qui est envoyé

| Quand | Titre | Texte |
|---|---|---|
| Booster PK de nouveau disponible (délai de son grade) | Booster PK prêt | Ton Booster PK gratuit peut être ouvert |
| Pièce de nouveau disponible | Pièce prête | Tu peux relancer la pièce pour gagner des PK |
| Safari éclair de nouveau disponible | Safari éclair prêt | Tu peux rejouer au Safari éclair |
| PA du jour pas encore récupérés, dès 10 h | PA dispo aujourd’hui | Tes points d’Aura t’attendent |
| 3 jours sans ouvrir l'app (entre 17 h et 20 h) | Tes jeux t’attendent | Booster PK, pièce et PA du jour sont prêts. Reviens les récupérer ! |
| 7 jours sans ouvrir l'app (entre 17 h et 20 h) | Ça fait une semaine ! | Ta collection a peut-être pris de la valeur. Viens voir sur Dropicards. |

Toucher une notification de jeu ouvre l'onglet **Jeux** ; une relance ouvre l'**accueil**.

### Les règles (choix par défaut, à changer si tu veux)

- **Jamais la nuit** : rien entre 22 h et 9 h (heure de Paris). Un jeu prêt à 3 h du matin est annoncé à 9 h.
- **Au plus 6 notifications par jour** et par joueur (la notification de test n'est pas comptée).
- **Une seule fois** par rappel : un booster prêt n'est annoncé qu'une fois, la relance des 3 jours une seule fois par absence, puis celle des 7 jours une seule fois.
- Les **PA du jour** : seulement pour un joueur venu dans les 3 derniers jours (sinon c'est la relance d'absence qui part).
- Les jeux fermés à un grade (pièce à la Recrue, Safari avant Collectionneur) ne sont jamais annoncés.
- Chaque case de **Mon profil › Notifications** coupe son rappel, aussi pour les envois du serveur. Les relances d'absence n'ont pas de case (ta demande) : elles se coupent dans les réglages de notifications du téléphone.
- Un joueur qui se **déconnecte** ne reçoit plus rien sur ce téléphone. **Supprimer son compte** efface tout.
- Un téléphone qui ne répond plus (app désinstallée, notifications coupées) est oublié automatiquement.

### Sur quels téléphones

- **Android** (Chrome, Samsung Internet, Firefox) et **ordinateurs** : tout de suite, depuis dropicards.fr.
- **iPhone** : Apple ne les autorise que pour l'app **ajoutée à l'écran d'accueil** (iOS 16.4 ou plus récent). Dans Safari, la rubrique Notifications l'explique : « Partager › Sur l'écran d'accueil », puis ouvrir Dropicards depuis cette icône et autoriser.
- **App Android du Play Store** : pas encore. Elle demandera **Firebase** (service gratuit de Google, un projet à créer par toi, je te guiderai). En attendant, la rubrique affiche « Les notifications arrivent bientôt dans l'app Android ».

---

## Les 3 étapes à faire une fois

**Étape 1 · La base (Studio, 2 minutes)**
1. Ouvre Supabase Studio (comme pour les scripts précédents, guide illustré `docs/44-guide-ouvrir-studio/`) › **SQL Editor** › nouveau snippet.
2. Colle tout le fichier **`tools/supabase/036_notifications_push.sql`** (sur GitHub : bouton « Raw », tout sélectionner, copier).
3. Clique sur **Run**. En bas, tu dois lire « Envoi automatique programmé : toutes les 5 minutes ». Si tu lis « NON programmé », envoie le message à Claude.
4. Puis colle et lance **`tools/supabase/000_verifier.sql`** : la ligne `036_notifications_push` doit être cochée.

> 036 s'installe à part : il ne dépend pas de `install_024_a_034.sql` (s'il te reste 033 et 034 à installer, l'ordre n'a pas d'importance).

**Étape 2 · La fonction qui envoie (terminal de Coolify, 1 minute)**
> Guide en images (où trouver l'adresse de ton Coolify, puis son terminal) : `docs/47-guide-adresse-et-terminal-coolify/` (`etape-1.png` à `etape-7.png`).

1. Coolify › **Terminal** › choisis le serveur.
2. Colle cette ligne puis Entrée :
   ```
   curl -fsSL https://raw.githubusercontent.com/XxSpeedTouchxX/pokemon-appli/claude/pokemon-app-mockup-1mxt7p/tools/supabase/functions/install-push.sh | bash
   ```
3. Tu dois lire « OK : fonction « push » installée » puis « OK : la fonction répond et la clé d'envoi est prête ».
   - Si tu lis « À VÉRIFIER », c'est en général que l'étape 1 n'est pas faite. Sinon, redémarre Supabase dans Coolify puis relance la ligne.
   - Aucune variable à ajouter dans Coolify : les clés d'envoi sont créées toutes seules au premier passage et gardées dans ta base.

**Étape 3 · L'essai sur ton téléphone (1 minute)**
1. Ouvre dropicards.fr (sur iPhone : depuis l'icône de l'écran d'accueil), connecté à ton compte.
2. **Mon profil › Notifications › « Autoriser les notifications »**, puis accepte la question du téléphone.
3. Une notification « Notifications activées » arrive dans les secondes qui suivent. Le texte de la rubrique devient « Notifications actives sur ce téléphone, même quand l'app est fermée », et un bouton « Envoyer une notification de test » apparaît (une toutes les 10 minutes au plus).
4. Ferme l'app : à la prochaine disponibilité de ton Booster PK, la notification arrive (dans les 5 minutes, hors 22 h - 9 h).

---

## Vérifier que tout tourne (facultatif)

Dans Studio › SQL Editor :
```
select public.push_status();
```
Tu vois le nombre de téléphones (`appareils`) et de comptes inscrits, les notifications envoyées ces dernières 24 h par type (`envoyes_24h`) et les 5 derniers passages du serveur.

**Tout arrêter** (sans rien effacer) : `select cron.unschedule('push-envoi');` dans Studio. Pour relancer, recolle 036.

---

## Ce qui est enregistré (vie privée)

Pour chaque téléphone autorisé : l'adresse d'envoi donnée par le téléphone, deux clés de chiffrement (le contenu est chiffré de bout en bout jusqu'au téléphone), le type d'appareil, et les dates d'envoi des rappels (pour ne jamais doubler). Aucune publicité n'est envoyée. La politique de confidentialité est à jour (20 novembre 2026).

## Fichiers (pour Claude)

- Base : `tools/supabase/036_notifications_push.sql` (tables `push_subs`, `push_prefs`, `push_sent`, `push_keys`, `push_runs` ; `push_due`, `push_report`, cron `push-envoi`) ; tests `tools/supabase/tests/test_036.sql` (51).
- Fonction du serveur : `tools/supabase/functions/push/index.ts` (signature VAPID et chiffrement aes128gcm écrits à la main, sans bibliothèque) ; tests `functions/push/test.mjs` (19) ; installateur `functions/install-push.sh`.
- App : `tools/web/notif.js` (inscription, cases, test), `web/sw.js` (réception et toucher), `tools/web/cloud.js` (désinscription à la déconnexion) ; tests `tools/web/e2e/t-push.mjs` (27) et `t-notif.mjs`.
