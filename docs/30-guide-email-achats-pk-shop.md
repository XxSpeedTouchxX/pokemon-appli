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
