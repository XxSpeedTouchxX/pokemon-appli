# Préparation : domaine, App Store et Play Store, PK payants (PKM-App, vivant)

> **Mise à jour du 2026-10-29 :** dropicards.fr et dropicards.com sont achetés et l'app est servie par le **serveur dédié du porteur** (OVHcloud Rise-S) sur https://dropicards.fr ; **Cloudflare Pages est débranché**. Les passages ci-dessous qui parlent de Cloudflare Pages décrivent l'ancien hébergement.

*Créé le 2026-10-11, à la demande du porteur (« mets ça de côté pour pouvoir le préparer »). Rien n'est lancé : chaque étape attend un « go ». Les prix et les règles des stores changent souvent : à revérifier sur les sites officiels au moment de s'inscrire.*

## 1. Ce qui est hébergé aujourd'hui

- **App :** site statique (`web/`) servi par **Cloudflare Pages**, redéployé à chaque push. Pas de serveur, pas de base de données, pas de compte utilisateur.
- **Données :** cartes, prix, scellé et boutiques, mis à jour par **GitHub Actions** (`tcgdex.yml`, `sealed.yml`, `stores.yml`), qui commitent les fichiers JSON.
- **Collection, PK, réglages :** sur l'appareil de chaque utilisateur (navigateur).
- **Installation :** app web installable (manifeste et service worker).
- **Coût :** 0 €. Cloudflare Pages gratuit : bande passante illimitée, 500 déploiements par mois, 25 Mo par fichier.

**Conclusion :** aucun serveur n'est nécessaire pour publier sur les stores. Un serveur ne devient utile que pour les comptes, la synchronisation, les alertes envoyées app fermée, les partenaires et les paiements (§5).

## 2. Domaine

| Domaine | Disponible (vérifié le 2026-10-11) |
|---|---|
| **dropicards.fr** | oui |
| **dropicards.com** | oui |
| dropicards.app, .io, .eu | oui |
| dropicard.fr | oui |
| dropicard.com | **non** (déjà pris) |

- **Conseil :** prendre **dropicards.fr** et **dropicards.com** (environ 20 €/an au total), les deux branchés sur Cloudflare Pages.
  - Le .com s'achète chez Cloudflare Registrar, au prix coûtant.
  - Le .fr s'achète chez OVH ou Gandi, puis ses DNS passent chez Cloudflare.
- **Avant l'achat, vérifier la marque :** recherche gratuite sur data.inpi.fr et euipo.europa.eu, pour « Dropicards » et « Dropicard », classes 9 (logiciels) et 42.
  - **Point d'attention :** « DropiCard » est utilisé par **Dropi**, une société colombienne de dropshipping, pour une carte de paiement. Autre métier, mais nom très proche.
  - Dépôt de la marque à l'INPI : environ 190 € pour une classe, plus environ 40 € par classe supplémentaire.
- **Ce que le porteur fait :** recherche de marque et achat à son nom. **Ce que Claude fait ensuite, sur « go » :** branchement sur Cloudflare Pages, redirection de `pokemon-appli.pages.dev`, mise à jour des liens (lien en bio, pages légales).

## 3. Apps iOS et Android

### Méthode : Capacitor

Le même code web (`web/`) devient une app iOS et une app Android.
- La caméra (scan), la position (Radar), les notifications, les vibrations et le partage marchent en natif.
- Les données restent servies par Cloudflare.

### Étapes

1. Domaine (§2) et adresses de la politique de confidentialité et du support (les pages légales existent déjà).
2. Comptes développeur (§4).
3. Projet Capacitor :
   - icônes, écran de démarrage ;
   - textes des autorisations (caméra, position) ;
   - adresses complètes des données ;
   - tests sur de vrais téléphones.
4. Fonctions natives pour passer la règle Apple 4.2, qui refuse « un site dans une coquille » : notifications des alertes du Radar, partage natif, vibrations.
5. Compilation iOS : sur un Mac, ou avec Codemagic (palier gratuit).
6. Fiches des stores :
   - captures, description ;
   - fiche de confidentialité d'Apple, formulaire « Sécurité des données » de Google ;
   - mention de non-affiliation ;
   - pas de « Pokémon » dans le nom ni dans l'icône de l'app.
7. Validation : Apple en 1 à 3 jours ; Google en quelques jours, après le test fermé (§4).

### Effort et coûts

- **Effort :** environ 25 h, soit 3 jours à plein régime (8 h/j) ou 8 à 9 jours au rythme réel (3 h/j). Sans compter les 14 jours de test fermé sur Google.
- **Coûts :**
  - Apple : 99 $/an ;
  - Google : 25 $, une seule fois ;
  - domaine : environ 20 €/an ;
  - Mac : pas nécessaire avec Codemagic.

### Risques

- **Droits Pokémon :** Apple et Google peuvent demander une preuve de droits sur les noms et les visuels. C'est le moment où le *Cadre juridique & droits Pokémon* devient concret.
- **Paiements (§5) :** un abonnement ou des PK payants passent obligatoirement par l'achat intégré d'Apple et de Google.

## 4. Compte développeur personnel

| | Apple | Google |
|---|---|---|
| Coût | 99 $/an | 25 $ une fois |
| Ce qu'il faut | Identifiant Apple avec double authentification, pièce d'identité | Compte Google, pièce d'identité, téléphone |
| Nom affiché sur le store | Nom et prénom du porteur | Nom du porteur |
| Délai | Quelques jours | Quelques jours, puis **test fermé : 12 testeurs pendant 14 jours** avant la publication |

- **Avantages :** pas de société, pas de numéro D-U-N-S.
- **Limite :** c'est le nom du porteur qui apparaît, pas « Dropicards ».
- **Règle européenne DSA :** dès que l'app vend quelque chose, le compte est classé « professionnel ». L'**adresse, le téléphone et l'e-mail deviennent publics** sur la fiche de l'app. Pour ne pas publier l'adresse du domicile : domiciliation, ou passage à un compte « organisation » (société et D-U-N-S).
- **Revenus :** pour encaisser, il faut un statut, au minimum la **micro-entreprise** (création gratuite en ligne).
- **Plus tard :** un compte personnel peut passer en compte « organisation » sans republier l'app.

## 5. Le jour où il faut un serveur

- **Besoins :** comptes, synchronisation entre téléphones, alertes envoyées app fermée, signalements modérés, partenaires, paiements.
- **Recommandation :** rester chez Cloudflare.
  - **Workers** (code serveur) et **D1** (base de données), plus **R2** pour les fichiers.
  - Gratuit au début (environ 100 000 requêtes par jour), puis environ 5 $/mois.
  - Alternative : Supabase (gratuit, puis 25 $/mois).
- **Déconseillé :** un serveur loué (VPS, 5 à 10 €/mois). Mises à jour de sécurité, sauvegardes et pannes à gérer soi-même : trop lourd pour 2 à 4 h par jour.
- **Migration :**
  - les collections déjà sur les téléphones sont importées dans le compte à la première connexion (la sauvegarde existe déjà) ;
  - les mises à jour des données restent sur GitHub Actions ;
  - Apple impose un bouton « supprimer mon compte ».
- **Effort :** 30 à 35 h (environ 4 jours à plein régime, 11 jours au rythme réel).

## 6. PK achetés en argent réel (à décider)

**Changement de cap :** le 2026-10-08, le porteur a validé des PK « sans achat en argent réel ni valeur en euros ». Les vendre demande une nouvelle décision, à inscrire au Journal des décisions.

### a) Paiement

- **Dans les apps :** achat intégré obligatoire (Apple In-App Purchase, Google Play Billing).
  - Commission de **15 %** (programmes pour petits éditeurs). Les stores encaissent et reversent la TVA.
  - Exemple : un pack de 500 PK à 1,99 € TTC donne environ 1,66 € hors taxes, soit environ **1,41 €** pour le porteur après la commission.
- **Sur le site web :** Stripe est possible (environ 1,5 % + 0,25 € par paiement), mais la TVA est alors à gérer soi-même (guichet unique OSS).
- **Conseil :** commencer par les stores seulement.

### b) Technique

- Le solde des PK doit vivre sur le serveur (§5). Sur l'appareil, il est modifiable par n'importe qui.
- Chaque achat est vérifié auprès d'Apple ou de Google. RevenueCat simplifie le travail et reste gratuit sous environ 2 500 $ de revenus par mois.

### c) Règles légales, avec un public jeune

- Les PK ne s'échangent **jamais** contre de l'argent ni contre de vraies cartes (sinon : réglementation de la monnaie électronique).
- **Aucune récompense aléatoire payante** (pas de booster payant au hasard) : risque de jeu d'argent, et Apple impose d'afficher les probabilités.
- Prix en euros affiché à côté du prix en PK.
- CGV, et renoncement exprès au droit de rétractation pour le contenu numérique.
- Rien de trompeur ni de pressant pour les mineurs (pas de « dernière chance », pas de compte à rebours).

### d) Effort

- Comptes et serveur : 30 à 35 h.
- Achats intégrés, CGV, tests : 15 à 20 h.
- Total : environ 50 h, soit 6 à 7 jours à plein régime ou 16 à 18 jours au rythme réel.
- Coûts : 0 € au départ, puis environ 5 $/mois.

### e) Autre piste, plus simple

Garder les PK gratuits et vendre l'**abonnement Premium** (9,90 €/mois, prévu dans `docs/06` et `docs/08`). Il passe par les mêmes systèmes de paiement.

## 7. Ordre proposé

1. **Porteur :** recherche de marque (INPI, EUIPO).
2. **Porteur :** achat de dropicards.fr et dropicards.com.
3. **Claude, sur « go » :** branchement des domaines sur Cloudflare Pages.
4. **Porteur :** comptes Apple et Google en personnel (ou en organisation si l'adresse publique pose problème).
5. **Claude, sur « go » :** app gratuite sur les stores (Capacitor, notifications natives).
6. **Plus tard, sur décision :** comptes et serveur, puis Premium **ou** PK payants.

## 8. Questions ouvertes (valeur par défaut proposée)

- **Compte personnel ou société ?** Par défaut : personnel.
- **Mac disponible ?** Par défaut : Codemagic.
- **Monétisation :** Premium ou PK payants ? Par défaut : Premium d'abord, PK gratuits.
