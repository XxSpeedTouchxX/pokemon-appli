# Guide : lancement TikTok, comptes et récupération des e-mails (PKM-App, vivant)

*Créé le 2026-11-12 · pour le porteur (non développeur) · une étape à la fois*

## 0. Où on en est

La base de données est **déjà en ligne** et branchée sur dropicards.fr :

- Supabase tourne sur ton serveur (Coolify › PKM › production › `supabase-…`, « Running ») ;
- tous les scripts de 001 à 023 sont installés (contrôle `000_verifier.sql` du 2026-11-12) ;
- l'inscription, la connexion, le mot de passe oublié, les PK, les PA et le Premium passent par cette base depuis la v132 ;
- tu as déjà créé un compte depuis ton téléphone.

Il n'y a donc rien à « déployer ». En revanche, **deux limites peuvent bloquer les inscriptions dès qu'il y a du monde** (vidéo TikTok qui marche). Elles se règlent en 10 minutes : étapes 1 et 2.

---

## 1. Limite de 30 e-mails par heure (Coolify, 5 minutes) — ✅ fait le 2026-11-12

**Le problème.** À chaque inscription, le serveur des comptes (Supabase Auth) envoie un e-mail : la bienvenue avec le lien « Valider mon adresse e-mail ». Par défaut, il n'en envoie que **30 par heure, pour tout le site**. Ce réglage n'est pas dans la configuration installée par Coolify, donc c'est ce défaut qui s'applique. À la 31ᵉ inscription de l'heure, l'e-mail ne part pas, la création du compte échoue et la personne voit « Trop d'e-mails envoyés : attends quelques minutes ».

**La correction.**

1. Coolify › Projects › **PKM** › **production** › **supabase-…**.
2. Bouton **« Edit Compose File »**.
3. Cherche le bloc **`supabase-auth:`**, puis, en dessous, **`environment:`**.
4. Ajoute cette ligne dans la liste, **au même format et avec le même retrait que les lignes voisines** :
   - si les lignes voisines ressemblent à `- GOTRUE_MAILER_AUTOCONFIRM=${ENABLE_EMAIL_AUTOCONFIRM:-false}`, ajoute :
     ```
     - GOTRUE_RATE_LIMIT_EMAIL_SENT=1000
     ```
   - si elles ressemblent à `GOTRUE_MAILER_AUTOCONFIRM: "false"`, ajoute :
     ```
     GOTRUE_RATE_LIMIT_EMAIL_SENT: "1000"
     ```
   Cela autorise 1 000 e-mails par heure.
5. Profites-en pour vérifier que la ligne `GOTRUE_MAILER_ALLOW_UNVERIFIED_EMAIL_SIGN_INS` (avec `true`) est bien présente (`docs/31` A). Elle permet d'entrer dans l'app sans taper de code. Si elle manque, ajoute-la de la même façon.
6. **Save**, puis **Restart** du service Supabase. L'app est indisponible environ 1 minute : fais-le avant de publier une vidéo, pas pendant.

---

## 2. Quota d'e-mails de Brevo (5 minutes) — offre gratuite gardée pour l'instant (décision du 2026-11-12)

**Le problème.** Les e-mails partent par Brevo. L'offre gratuite de Brevo est limitée à **300 e-mails par jour** (chiffre à vérifier sur ton compte). Au-delà, Brevo refuse l'envoi et la création du compte échoue, comme à l'étape 1.

**À faire.**

1. Ouvre Brevo et regarde ton offre et ton quota du jour (menu de ton compte › **Mon offre** / **My plan**).
2. Si tu attends **plus d'environ 250 inscriptions par jour**, passe à une offre payante (prix sur le site de Brevo, selon le nombre d'e-mails par mois). Fais-le avant une vidéo qui risque de bien marcher.
3. **Solution de secours**, si le quota est atteint en pleine journée : dans le même fichier qu'à l'étape 1, remplace la **valeur** de la ligne `GOTRUE_MAILER_AUTOCONFIRM` par `true` (dans ta version, elle s'écrit peut-être `${ENABLE_EMAIL_AUTOCONFIRM:-false}` : remplace tout ce qui suit le `=` par `true`). Fais **Save**, puis **Restart**.
   - Les comptes sont alors créés **sans e-mail** : les inscriptions ne bloquent plus.
   - En contrepartie, plus d'e-mail de bienvenue, et les adresses sont considérées comme vérifiées sans contrôle.
   - Remets `false` dès que le quota revient (le lendemain), ou dès que tu as l'offre payante.

---

## 3. Vérifier que l'inscription marche (2 minutes)

1. Sur un ordinateur, en navigation privée, ouvre **https://dropicards.fr**.
2. **Créer mon compte** avec une adresse que tu n'as jamais utilisée (par exemple ton adresse avec un `+test1` avant le `@`, si ta messagerie l'accepte).
3. Tu dois arriver dans l'app, puis recevoir l'e-mail de bienvenue (regarde aussi les spams).
4. Dans Studio, lance la requête 1 de l'étape 4 : le nombre de comptes « créés aujourd'hui » doit avoir augmenté.

Si une étape échoue, envoie-moi une capture de l'écran et du message.

---

## 4. Récupérer les e-mails des comptes (Studio, quand tu veux)

Le fichier `tools/supabase/requetes_emails.sql` contient 4 requêtes. Elles **lisent seulement** : rien n'est modifié.

1. Sur GitHub, ouvre le fichier :
   https://github.com/XxSpeedTouchxX/pokemon-appli/blob/claude/pokemon-app-mockup-1mxt7p/tools/supabase/requetes_emails.sql
2. Studio (`https://api.dropicards.fr`) › **SQL Editor** › **New query**.
3. Copie **une seule requête** (de `select` jusqu'au `;`), colle-la, puis **Run** :

| N° | Ce qu'elle donne | À quoi elle sert |
|---|---|---|
| 1 | Nombre de comptes, créés aujourd'hui, ayant accepté les nouveautés | Suivre ton lancement en un coup d'œil |
| 2 | Tous les comptes : e-mail, pseudo, âge, date de création, dernière connexion | Ton suivi interne |
| 3 | Les adresses qui ont **coché « nouveautés »** (15 ans et plus, compte actif) | Les **seules** à qui tu peux envoyer une newsletter |
| 4 | Inscriptions par jour | Voir l'effet de chaque vidéo TikTok |

4. Pour garder le résultat : bouton **Export** au-dessus du tableau › **CSV**. Le fichier s'ouvre avec Excel ou Google Sheets.

### Ce que dit la loi (RGPD), en simple

- Tu peux écrire à **tout le monde** pour le compte lui-même : bienvenue, mot de passe, gain d'un lot, changement des conditions.
- Pour la **publicité ou les nouveautés** (nouvelle fonction, concours, sortie d'une extension), écris **seulement** aux adresses de la requête 3. Elles ont donné leur accord à l'inscription, avec la date enregistrée.
- Jamais de publicité aux moins de 15 ans : la requête 3 les retire déjà.
- Chaque newsletter doit contenir un lien de désinscription. Si tu l'envoies avec Brevo (Campagnes › importer le CSV de la requête 3 dans une liste), Brevo l'ajoute tout seul.
- Le fichier CSV contient des données personnelles. Garde-le pour toi, ne le partage pas, et supprime les vieux exports.

---

## 5. Avant un gros afflux (rappel, déjà prévu)

- **Sauvegarde** : la base est sauvegardée chaque nuit. Un essai de restauration reste à faire, une fois, pour être sûr qu'elle sert.
- **Studio** : l'adresse de Studio donne accès à toutes les données. Elle doit rester protégée par un mot de passe long, connu de toi seul. Plus tard, réserve-la à Tailscale (déjà prévu).
- **Serveur** : 62 Go de mémoire, dont 58 libres (audit du 2026-11-05). Quelques milliers de comptes ne posent aucun problème.
