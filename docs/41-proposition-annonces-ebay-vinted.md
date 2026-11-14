# Proposition Annonces eBay et Vinted v1 (PKM-App, figé)

*2026-11-14 · demande du porteur : « faire du scraping directement sur eBay et Vinted pour reprendre les annonces en ligne des cartes revendues, comme sur PokéItem » (capture d'écran de PokéItem, rubrique « Lots & collections », en inspiration).*

**Statut : proposition, rien n'est codé. Décisions A1 à A6 au § 8, puis « go » attendu.**

> **Mise à jour du 2026-11-14 (même jour) :** le porteur a obtenu un avis juridique ; le **scraping d'eBay et de Vinted est autorisé** (CLAUDE.md §4, journal du 2026-11-14). Les § 2, § 5 et A2 sont mis à jour en conséquence. Leboncoin et Cardmarket restent sous la règle du 2026-10-03.

---

## 1. L'idée en une phrase

Un fil d'**annonces en cours** (cartes, lots, scellé) repris d'eBay et, si possible, de Vinted, relié aux cartes du catalogue Dropicards, avec un filtre **« Bonnes affaires »** (annonce nettement sous la cote Cardmarket) et un bouton **« Voir l'annonce »** qui ouvre le site d'origine. Dropicards reste un outil de valeur, **pas une plateforme de vente** : aucune transaction dans l'app, seulement des liens sortants, comme la page Sorties.

## 2. Ce qui bloque, et ce qui ne bloque pas (point de validation)

| Sujet | Règle actuelle du projet | Conséquence |
|---|---|---|
| Scraping eBay | **Autorisé depuis le 2026-11-14** (avis juridique obtenu par le porteur) | L'**API officielle Browse** reste recommandée pour les annonces en cours : gratuite, stable, liens affiliés EPN. Le `robots.txt` d'eBay interdit toujours ses pages de recherche et eBay avait répondu 403 le 18/10 : le scraping d'eBay ne servirait qu'en complément, pour une donnée que l'API ne donne pas. |
| Scraping Vinted | **Autorisé depuis le 2026-11-14** (avis juridique obtenu par le porteur) | Vinted n'a **pas d'API ouverte** (Vinted Pro Integrations est réservée à des vendeurs Pro autorisés, pour gérer **leurs** annonces). Le scraping devient la seule voie pour afficher ses annonces. Restent des **risques techniques** : protection anti-robot, blocage de l'adresse du serveur, changement de format sans prévenir (voir § 5). |
| Prix demandé / prix vendu (principe 3) | Chaque chiffre distingue prix demandé et prix vendu | Une annonce en cours = **prix demandé**. Elle ne compte **jamais** dans la cote (qui reste Cardmarket seule, décision du 18/10) et elle est étiquetée « Prix demandé · eBay ». |
| Affiliation | Page Sorties « sans affiliation » | Nouvelle décision (A1) : les liens eBay peuvent passer par l'**eBay Partner Network** (EPN) et rapporter une commission à chaque achat après un clic. eBay exige l'inscription à l'EPN pour utiliser les API d'achat en production. |
| Données personnelles | RGPD | On ne garde **ni pseudo ni avatar de vendeur**, seulement l'annonce : titre, prix, photo, lien. Les photos ne sont **pas copiées** : on affiche celle hébergée par eBay. |

## 3. Comment ça marche (eBay)

Tout tourne sur ce qui existe déjà : le Supabase installé par Coolify et une fonction du serveur, comme `stripe` et `notify`.

1. **Une liste de recherches** (`listing_queries`) : les cartes les plus chères du catalogue (par exemple les 500 premières), les produits scellés (61 + Règne Delta) et quelques recherches larges (« lot cartes pokémon »). Chaque recherche a une priorité ; les plus chères tournent plus souvent.
2. **Une fonction du serveur `annonces`** (`tools/supabase/functions/annonces/index.ts`) :
   - obtient un jeton eBay (identifiants de l'application, jamais dans le dépôt, réglés dans Coolify) ;
   - interroge l'API Browse sur **eBay France** (catégorie des cartes Pokémon, prix en euros) ;
   - enregistre ou met à jour chaque annonce ;
   - marque « terminée » une annonce qui n'est plus revue depuis 48 h.
3. **Un déclencheur toutes les 30 minutes** : une tâche planifiée de Coolify (un simple appel de la fonction avec une clé secrète). Elle reste visible et arrêtable par le porteur.
4. **Une table `listings`** que l'app lit (lecture seule pour tous, écriture par le serveur seulement) :
   source (`ebay`, plus tard `vinted` ou `dropicards`), identifiant de l'annonce, titre, prix, frais de port, enchère ou prix fixe, fin de l'enchère, photo (adresse eBay), lien, lien affilié, nombre de cartes pour un lot, carte ou produit reconnu, confiance de la reconnaissance, vue pour la première fois, vue pour la dernière fois, état.
5. **La reconnaissance de la carte** à partir du titre (« Mew ex 30 ans 151/165 FR ») :
   - d'abord des règles, sans IA : numéro « 151/165 », nom français ou anglais du catalogue, extension, langue ;
   - une annonce dont la confiance est faible reste dans le fil, sans être reliée à une carte ni comptée dans les bonnes affaires ;
   - option plus tard : IA pour les titres difficiles (coût à estimer à ce moment-là).
6. **« Bonne affaire »** = annonce à prix fixe reliée avec une bonne confiance, livraison comprise, au moins 20 % sous la cote Cardmarket de la carte dans sa langue (**seuil à confirmer**).

**Accès en production (vérifié le 2026-11-14, `docs/42`) :** l'API Browse est réservée aux partenaires d'eBay : compte EPN, demande « Buy API » acceptée (réponse en 10 jours ouvrés au plus), relecture par le support développeur, contrat signé ; refus possible. Règles : prix fixe seulement, livraison en France, tri d'eBay à ne pas modifier. Les filtres « Enchères » et le tri « Moins chères » du § 4 sont donc à revoir pour eBay.

Exigence d'eBay à prévoir : les applications en production doivent soit recevoir les notifications de suppression de compte d'eBay, soit déclarer ne garder aucune donnée d'utilisateur eBay. Dropicards garde des annonces : la déclaration « aucune donnée gardée » ne serait pas exacte ; une petite fonction du serveur recevra donc ces avis (`docs/42`, étapes 4 et 5).

## 4. Ce que voit l'utilisateur

- **Fiche d'une carte** : un bloc « Annonces en ce moment » (les 3 moins chères, prix demandé, eBay, « Voir l'annonce »), sous la cote.
- **Fil « Annonces »** ouvert depuis l'accueil : recherche, tri « Plus récentes », « Moins chères », filtres « Bonnes affaires », « Extension », « Lots », « Scellé », « Enchères » ; vignette avec badge de la source, badge « Lot » et nombre de cartes, prix, écart à la cote (« −32 % »).
- **Mention sous chaque prix** : « Prix demandé sur eBay, vu il y a 12 min ».
- Plus tard, si A5 est choisi : « Préviens-moi » sur une carte (alerte quand une annonce passe sous un prix), comme les « snipers » d'un concurrent.

## 5. Vinted : 3 voies

| Voie | Ce que c'est | Risque | Travail |
|---|---|---|---|
| **V1 · Lien de recherche** | Bouton « Chercher sur Vinted » dans la fiche et le fil, qui ouvre la recherche Vinted de la carte. | Aucun | ≈ 1 h |
| **V2 · Le vendeur publie sur Dropicards** | Un joueur colle le lien de **sa** annonce Vinted, ajoute ses photos et son prix et accepte qu'elle soit affichée ; modération par un admin ; retrait quand c'est vendu. | Faible (accord du vendeur) ; modération à tenir | ≈ 20 h |
| **V3 · Scraping** | Lecture des annonces publiques du catalogue Vinted par un robot sur le serveur (recherches de cartes Pokémon, rythme modéré), mêmes champs qu'eBay, sans pseudo ni avatar du vendeur. | Juridique : couvert par l'avis du porteur. Technique : **moyen à élevé** (anti-robot, blocage, format qui change) ; si Vinted bloque le serveur, le fil continue avec eBay seul | ≈ 15 h, plus l'entretien à chaque changement de Vinted ; prestataire (Apify…) possible : ≈ quelques dollars pour 1 000 annonces |

**Défaut proposé (mis à jour le 2026-11-14) : V1 tout de suite (bouton de secours) et V3 construit juste après eBay**, avec un interrupteur dans le panneau Admin pour couper Vinted à tout moment ; V2 plus tard si le fil plaît. Travail ajouté au total du § 6 : ≈ 15 h, soit ≈ 42 h en tout (5 jours à 8 h/j, 14 jours à 3 h/j).

## 6. Travail de A à Z

| Étape | Durée |
|---|---|
| Comptes eBay développeur et EPN, clés de production (porteur, guidé pas à pas dans un guide `docs/42`) | ≈ 1 h pour le porteur, puis quelques jours de validation par eBay |
| Script `029_annonces.sql` (tables, droits, nettoyage) et tests de sécurité | 4 h |
| Fonction `annonces` (jeton, recherche, enregistrement, fin des annonces) et tests sur des réponses enregistrées | 6 h |
| Reconnaissance par règles et tests sur 200 titres réels | 6 h |
| Écrans : bloc de la fiche, fil, filtres, étiquettes « prix demandé » | 8 h |
| Script d'installation et tâche planifiée Coolify | 2 h |
| Vinted V1 | 1 h |
| **Total** | **≈ 27 h** : 3,5 jours à plein régime (8 h/j), 9 jours au rythme réel (3 h/j) |

## 7. Coût mensuel

| Poste | Coût |
|---|---|
| API Browse d'eBay | 0 € (quota quotidien d'appels largement suffisant pour une recherche toutes les 30 min, **à confirmer** avec les clés) |
| Serveur et base | 0 € de plus (serveur et Supabase déjà en place ; quelques dizaines de Mo de données) |
| EPN | Rapporte une commission sur les achats après un clic (montant non estimé) |
| IA de reconnaissance (option) | À chiffrer seulement si elle est demandée |

## 8. Décisions attendues

| # | Question | Défaut proposé |
|---|---|---|
| A1 | eBay par l'API officielle, avec liens affiliés EPN ? | **Oui** |
| A2 | Vinted : V1, V2 ou V3 ? | **V1 + V3** (scraping autorisé depuis le 2026-11-14), V2 plus tard |
| A3 | Où dans l'app ? | **Bloc dans la fiche de chaque carte + fil « Annonces » depuis l'accueil** |
| A4 | Fréquence de mise à jour | **Toutes les 30 min** |
| A5 | Alertes « Préviens-moi » sous un prix | **Plus tard** (après le fil) |
| A6 | Seuil d'une « bonne affaire » | **20 % sous la cote, livraison comprise** |

Rien n'est codé sans « go ».

## Sources

- eBay Developers, Browse API, méthode `search` (champ `itemAffiliateWebUrl` pour l'EPN) : https://developer.ebay.com/api-docs/buy/browse/resources/item_summary/methods/search
- Communauté eBay Developers, accès en production des API Buy et EPN : https://community.ebay.com/forum/ebay-developers-program-57950/topic/browse-api-production-scope-for-an-existing-production-keyset-and-exemption-semantics-480672/
- Friptadium, « API Vinted officielle et risques » (conditions de Vinted relues le 23/10/2026) : https://friptadium.com/blogs/actualites/api-vinted-officielle-risques
