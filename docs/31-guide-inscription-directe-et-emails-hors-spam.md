# Guide : inscription directe et e-mails hors spam (PKM-App, vivant)

*Créé le 2026-11-08 · pour le porteur (non développeur) · deux réglages à faire, une étape à la fois*

L'app est prête depuis la version v163 :

- à la création du compte, l'adresse e-mail et le mot de passe suffisent. Le compte est enregistré tout de suite sur le serveur ;
- Face ID / Touch ID (ou l'empreinte sur Android) est proposé juste après ;
- la vérification de l'adresse se fait plus tard, avec le lien de l'e-mail reçu. Mon profil rappelle de le faire, avec un bouton « Renvoyer l'e-mail ».

Deux réglages restent à faire de ton côté :

- **A** : autoriser la connexion avant la vérification de l'adresse (Coolify) ;
- **B** : faire arriver les e-mails en boîte de réception plutôt qu'en spam (OVH et Brevo).

Tant que **A** n'est pas fait, l'app fonctionne quand même : elle demande d'abord le code à 6 chiffres reçu par e-mail, puis propose Face ID et continue. C'est l'ancien parcours.

---

## A. Connexion avant la vérification de l'adresse (Coolify, 5 minutes)

Ce réglage dit au serveur des comptes (Supabase Auth) : « laisse entrer quelqu'un qui n'a pas encore cliqué sur le lien de l'e-mail ». Le lien reste envoyé et l'adresse reste à vérifier.

**À savoir :** les jeux et le PK shop restent fermés tant que l'adresse n'est pas vérifiée (règle du serveur, `004_jeu.sql`, contre les faux comptes). Le joueur voit le message « Vérifie d'abord ton adresse e-mail pour jouer » avec le chemin à suivre. Décision du porteur (2026-11-08) : l'adresse vérifiée valide le compte ; les jeux et le PK shop attendent cette vérification.

1. Ouvre Coolify, puis le projet où est installé Supabase.
2. Ouvre le service Supabase, puis le bouton **« Edit Compose File »** (modifier le fichier de configuration).
3. Cherche le bloc **`supabase-auth:`**, puis, en dessous, la ligne **`environment:`**.
4. Dans la liste qui suit, ajoute une ligne, avec le même retrait que les lignes voisines (par exemple sous `GOTRUE_MAILER_AUTOCONFIRM`) :

   ```
   GOTRUE_MAILER_ALLOW_UNVERIFIED_EMAIL_SIGN_INS: "true"
   ```

   Ne touche pas à `GOTRUE_MAILER_AUTOCONFIRM` : il doit rester à `false`, sinon plus aucun e-mail de vérification ne partirait.
5. **Save**, puis **Restart** (redémarrer) le service Supabase.
6. Essai : sur ton téléphone, crée un compte avec une nouvelle adresse. Tu dois arriver directement sur la page « âge, pseudo, compagnon », avec la question Face ID / Touch ID, sans code à taper.

---

## B. E-mails hors spam (OVH et Brevo, 15 minutes, puis quelques jours)

### Ce que j'ai vérifié (DNS de dropicards.fr, le 2026-11-08)

| Contrôle | État | Explication simple |
|---|---|---|
| **DKIM** Brevo (`brevo1`, `brevo2`) | ✅ en place | Les e-mails sont signés au nom de dropicards.fr : Gmail sait qu'ils viennent bien de toi. |
| **DMARC** | ✅ présent (`p=none`) | Gmail sait quoi faire d'un faux e-mail à ton nom (pour l'instant : rien, simple observation). |
| **SPF** | ⚠️ incomplet | La liste des serveurs autorisés à envoyer pour dropicards.fr ne contient qu'OVH, pas Brevo. |
| **MX** | ✅ OVH | Tes boîtes (contact@…) sont chez OVH. |

Le domaine est **tout neuf** : Gmail se méfie toujours des premiers envois. Les réglages ci-dessous, puis quelques jours d'e-mails ouverts et non signalés, règlent le problème.

### B1. Ajouter Brevo au SPF (OVH, 5 minutes)

1. Ouvre l'espace client OVH, **Web Cloud › Noms de domaine › dropicards.fr › Zone DNS**.
2. Trouve la ligne de type **TXT** dont la valeur commence par `v=spf1` (aujourd'hui : `v=spf1 include:mx.ovh.com -all`).
3. Clique sur **…** au bout de la ligne, puis **Modifier l'entrée**.
4. Remplace la valeur par :

   ```
   v=spf1 include:mx.ovh.com include:spf.brevo.com -all
   ```

5. Valide. La prise en compte prend de quelques minutes à quelques heures. Il ne faut **qu'une seule** ligne `v=spf1` : n'en ajoute pas une deuxième.

### B2. Couper le suivi des clics et des ouvertures dans Brevo (5 minutes)

Brevo peut remplacer les liens des e-mails par ses propres liens de suivi : Gmail voit alors des liens vers un autre domaine que dropicards.fr, ce qui fait « spam ». Pour des e-mails de compte (code, vérification, mot de passe), le suivi ne sert à rien.

1. Ouvre Brevo, menu **Transactionnel** (ou **Transactional**), puis **Paramètres** (Settings).
2. Dans **Suivi** (Tracking) : désactive le **suivi des clics** et le **suivi des ouvertures**.
3. Enregistre.

### B3. Nom de l'expéditeur et objet de l'e-mail de bienvenue (Coolify, 3 minutes)

1. Coolify › projet PKM › service Supabase › onglet **Environment Variables**.
2. Cherche chaque nom ci-dessous ; s'il existe, clique dessus et change la valeur ; sinon, ajoute-le. Puis **Save** :
   - `SMTP_SENDER_NAME` = `Dropicards` (l'expéditeur affiché sera « Dropicards », pas une adresse seule) ;
   - `SMTP_ADMIN_EMAIL` = `noreply@dropicards.fr` (normalement déjà réglé) ;
   - `MAILER_SUBJECTS_CONFIRMATION` = `Valide ton adresse pour commencer sur Dropicards` (objet de l'e-mail de bienvenue).
3. **Restart** le service Supabase.

### Nouvel e-mail de bienvenue (rien à faire, automatique)

Depuis la version v164, l'e-mail reçu à la création du compte dit :

> Merci **Sacha** d'avoir créé ton compte sur Dropicards ! La dernière étape avant de commencer à utiliser Dropicards est de valider ton adresse e-mail en touchant ce bouton : **[Valider mon adresse e-mail]**
> Ensuite, l'app est à toi : tu commences au grade **Recrue** (5 scans par jour, Booster PK toutes les 24 h, classeur de 36 cartes et 9 produits scellés, ticket Bronze et booster du PK shop).

Le pseudo est demandé avec l'adresse et le mot de passe (même page), pour que l'e-mail puisse l'utiliser. Le modèle est sur dropicards.fr (`web/email/confirmation.html`) : Supabase le relit tout seul (en moins de 10 minutes). Le code à 6 chiffres reste en petit en bas, en secours.

Le bouton ouvre dropicards.fr : l'adresse est validée, le compte est actif au grade Recrue (« Adresse validée : bienvenue sur Dropicards ! »). Si l'app était déjà ouverte sur le téléphone, elle le voit dès qu'on y revient.

### B4. Gmail Postmaster Tools (10 minutes, facultatif mais conseillé)

C'est l'outil gratuit de Google qui montre la réputation de ton domaine chez Gmail.

1. Va sur **postmaster.google.com** avec ton compte Google, puis **+** et `dropicards.fr`.
2. Google donne une ligne **TXT** à ajouter : ajoute-la dans la zone DNS OVH, comme à l'étape B1 mais avec **Ajouter une entrée › TXT**.
3. Reviens sur Postmaster Tools et clique sur **Valider**. Les courbes apparaissent après quelques jours d'envois.

### B5. Les premiers jours

- Demande à tes premiers testeurs, s'ils trouvent l'e-mail dans les spams, de cliquer sur **« Non spam »** : c'est ce qui construit la réputation du domaine.
- Dans 2 à 4 semaines, si les rapports DMARC sont propres (Brevo les reçoit), on pourra passer le DMARC de `p=none` à `p=quarantine` (encore plus de confiance de la part de Gmail). Je te dirai quoi changer.

---

## Ce qui change pour un joueur

1. Il tape son adresse et un mot de passe : le compte est créé.
2. « Compte créé ! Utiliser Face ID / Touch ID ? » : **Oui** ou **Non, plus tard**.
3. Âge, pseudo, compagnon, puis l'app.
4. Plus tard, il touche le lien de l'e-mail reçu pour vérifier son adresse (Mon profil le rappelle tant que ce n'est pas fait). Les jeux et le PK shop s'ouvrent alors.
5. S'il est un jour déconnecté (session perdue, nouvel appareil où Face ID est déjà activé), Face ID est demandé tout de suite à l'ouverture, sans mot de passe. Après un « Me déconnecter » volontaire, Face ID n'est pas redemandé tout seul : le bouton « Me connecter avec Face ID / Touch ID » reste en tête.

Limite : un site web ne peut pas savoir si un iPhone a Face ID ou Touch ID. L'app écrit donc « Face ID / Touch ID » sur iPhone et Mac, et « mon empreinte » sur Android.
