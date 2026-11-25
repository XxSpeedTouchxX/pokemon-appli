# Guide : un e-mail à Dropicards pour chaque achat au PK shop (PKM-App, vivant)

*Créé le 2026-11-07 à la demande du porteur. Les étapes se font une par une : envoie une capture à Claude si un écran ne ressemble pas à ce qui est décrit.*

## 1. Comment ça marche, en clair

- Un joueur achète un **ticket** (Bronze, Argent, Or) ou fait un **achat direct** (booster, item rare, ETB).
- Le serveur enregistre l'achat dans la base (table `tickets`), comme avant.
- Juste après, l'app réveille la fonction **notify** du serveur. Elle lit dans la base les achats pas encore signalés et envoie **un e-mail à contact@dropicards.fr** avec :
  - le joueur (pseudo et adresse e-mail) ;
  - l'article et son prix en PK ;
  - pour un ticket : le tirage visé et le nombre de tickets du joueur pour ce tirage ;
  - pour un achat direct : l'item choisi, et le rappel d'écrire au joueur pour son adresse de livraison.
- Chaque achat n'est envoyé **qu'une fois**. Si l'envoi rate (Brevo en panne, réseau coupé), l'achat repart avec l'e-mail du prochain achat.
- Seuls les achats faits **après l'installation** sont signalés (pas l'historique).
- L'e-mail part par **Brevo**, déjà utilisé pour les e-mails des comptes, avec l'expéditeur `noreply@dropicards.fr`.

**Tickets après le tirage (décision du porteur, 2026-11-07)** : chaque ticket vaut une chance pour **le prochain tirage** de sa couleur. Une fois ce tirage passé, tous les tickets achetés pour lui sont utilisés : ils ne comptent plus dans le solde du joueur. Rien à faire de ton côté. La liste complète d'un tirage reste disponible dans Studio (fonction `draw_entries`).

## 2. Avant de commencer

- L'adresse **contact@dropicards.fr** doit exister, ou être redirigée vers ta boîte habituelle. Sinon les e-mails se perdent.
- Tu peux choisir une autre adresse : elle se règle dans Coolify (variable `NOTIFY_TO`, étape 4), jamais dans le code.

## 3. Étape 1 : installer 011 et 012 dans la base (2 minutes)

1. Supabase Studio › **SQL Editor**.
2. Si ce n'est pas déjà fait : colle tout `tools/supabase/011_grades_v4.sql`, puis **Run**.
3. Colle tout `tools/supabase/012_shop_notices.sql`, puis **Run**. Le message attendu : « Success. No rows returned ».

## 4. Étape 2 : créer une clé d'API dans Brevo (3 minutes)

1. Brevo › ton nom en haut à droite › **SMTP et API** › onglet **Clés API**.
2. **Générer une nouvelle clé API**, nom : `dropicards-notify`.
3. Copie la clé (elle commence par `xkeysib-`). **Ne la colle jamais dans une conversation** : seulement dans Coolify, à l'étape suivante.

## 5. Étape 3 : donner la clé au serveur, dans Coolify (5 minutes)

1. Coolify › projet de **Supabase** › **Edit Compose File**.
2. Bloc `supabase-edge-functions:`, sous les lignes `STRIPE_…` ajoutées pour le Premium, ajoute ces lignes **alignées exactement comme celles du dessus** :

```yaml
      - BREVO_API_KEY=${BREVO_API_KEY}
      - NOTIFY_TO=${NOTIFY_TO:-contact@dropicards.fr}
```

3. Enregistre. Dans **Environment Variables** :
   - `BREVO_API_KEY` : colle la clé `xkeysib-…` ;
   - `NOTIFY_TO` : laisse vide pour contact@dropicards.fr, ou mets une autre adresse.

   Enregistre.
4. **Restart** du service Supabase (les comptes sont coupés environ une minute ; Axicall Pilot n'est pas touché).

## 6. Étape 4 : installer la fonction sur le serveur (1 minute)

Dans Coolify › **Terminal** › ton serveur, colle cette ligne puis Entrée :

```bash
curl -fsSL https://raw.githubusercontent.com/XxSpeedTouchxX/pokemon-appli/claude/pokemon-app-mockup-1mxt7p/tools/supabase/functions/install-notify.sh | bash
```

Le résultat attendu :
- `OK : fonction « notify » installée (… lignes).`
- `OK : BREVO_API_KEY est réglée.`

## 7. Étape 5 : essai

1. Sur dropicards.fr, connecte-toi avec un compte admin et ouvre le mode Admin (achats sans débit), ou utilise un compte qui a assez de PK.
2. PK shop › **Ticket Bronze** › **Acheter un ticket** › **Confirmer**.
3. Dans la minute, un e-mail « [Dropicards] Nouveau Ticket Bronze · ton pseudo » arrive sur contact@dropicards.fr. Regarde aussi dans les spams.
4. En cas de souci : Brevo › **Transactionnel** › **Journaux** montre chaque envoi. Envoie une capture à Claude.

Pour voir les achats signalés dans Studio › SQL Editor :

```sql
select t.bought_at, t.item, t.choice, u.email, n.sent_at
from public.tickets t join auth.users u on u.id = t.user_id
left join public.shop_notices n on n.ticket_id = t.id
order by t.bought_at desc limit 50;
```

## 8. Coût

Brevo gratuit : 300 e-mails par jour, ce qui couvre largement les achats du PK shop. 0 €.

## 9. E-mail de félicitations au joueur (2026-11-25)

Demande du porteur : « lorsque l'utilisateur arrive à acheter un booster direct à 10 000 PK ou un autre item du PK shop comme l'item rare ou l'ETB, qu'il reçoive automatiquement un mail de félicitations… ».

**Ce que reçoit le joueur**, juste après un **achat direct** (booster, item rare, ETB ; jamais pour un ticket de tirage), à l'adresse e-mail de son compte :

- objet « Félicitations Sacha ! Ton booster Règne Delta t'attend 🎉 » ;
- le lot remontré : visuel, nom, item choisi (item rare), « Obtenu avec 10 000 PK », date et **référence** (ex. `DC-42BA7ADE`, la même que dans l'e-mail reçu par contact@dropicards.fr) ;
- « Plus qu'une étape pour le recevoir » en 3 étapes ;
- une **fiche à remplir** : nom, prénom, adresse, code postal, ville, adresse e-mail, numéro de téléphone ;
- un bouton **« Envoyer mes coordonnées »** qui ouvre un e-mail prérempli vers contact@dropicards.fr (la fiche et la référence sont déjà dedans) ; « Répondre » écrit aussi à contact@dropicards.fr ;
- « Tes coordonnées servent uniquement à t'envoyer ton lot. Dropicards ne te demandera jamais ton mot de passe ni tes coordonnées bancaires. »

Un e-mail par achat, jamais deux. Un achat fait en **mode Admin** donne aussi l'e-mail (pratique pour le voir). Aperçu : `docs/30-apercu-email-felicitations.png`.

**À faire (2 étapes, 3 minutes) :**

1. **Studio** (`api.dropicards.fr`) › SQL Editor › « + » › New query › colle tout `tools/supabase/043_mail_joueur_lot.sql` › **Run** (« Success. No rows returned »).
2. **Coolify** › Terminal › le serveur › colle cette ligne › Entrée (même ligne qu'à l'étape 4 du § 6, elle remplace la fonction par la nouvelle version) :

   ```
   curl -fsSL https://raw.githubusercontent.com/XxSpeedTouchxX/pokemon-appli/claude/pokemon-app-mockup-1mxt7p/tools/supabase/functions/install-notify.sh | bash
   ```

   Doit afficher « OK : fonction « notify » installée » et « OK : BREVO_API_KEY est réglée. ».

**Essai :** en mode Admin, achète le booster au PK shop (rien n'est débité). Dans la minute, 2 e-mails : « [Dropicards] Achat direct : … » sur contact@dropicards.fr, et « Félicitations … » sur l'adresse de ton compte (regarde aussi les spams). Ensuite, rends ce booster d'essai au stock avec la requête 4 de `requetes_boutique.sql`.

**Important :** les réponses des joueurs arrivent sur **contact@dropicards.fr**. Vérifie que cette adresse reçoit bien les e-mails (boîte créée chez OVH ou redirection vers ta boîte habituelle).

Voir les e-mails partis aux joueurs (Studio › SQL Editor) :

```sql
select t.bought_at, t.item, t.choice, u.email, m.sent_at
from public.tickets t join auth.users u on u.id = t.user_id
join public.game_items i on i.id = t.item
left join public.shop_player_mails m on m.ticket_id = t.id
where i.kind = 'lot' order by t.bought_at desc limit 50;
```

Changer de booster ou de série : le nom et le visuel du lot sont dans `tools/supabase/functions/notify/index.ts` (`LOTS`), comme dans l'app (`tools/web/pkshop.js`) ; demande-le à Claude, puis relance la ligne de l'étape 2.
