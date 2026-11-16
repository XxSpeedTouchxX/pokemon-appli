# Proposition : messagerie entre joueurs (PKM-App, vivant)

> Demande du porteur (2026-11-15) : sur la carte de dresseur d'un joueur du classement de « Ma ligue », « même un chat
> pour le contacter directement s'il veut lui parler ».
> Maquette (2026-11-16, demandée par le porteur avant de choisir) : `docs/43-maquette-messagerie/` (`index.html`,
> `option-a.png`, `option-b.png`, `option-c.png`).
> État : **proposition, rien n'est construit**. La carte de dresseur est livrée sans messagerie (`031_carte_joueur.sql`,
> `progress.js`). Décisions attendues du porteur : M1 à M4 (§5).

## 1. Pourquoi ce n'est pas construit tout de suite

Ce point est un **point de validation** au sens de CLAUDE.md §6 (changement de périmètre). Quatre raisons :

1. **Contradiction avec un principe produit.** CLAUDE.md §5, principe 4 : « on ne copie PAS le réseau social » de
   PokéItem. Les signalements du Territoire sont d'ailleurs prévus « sans fil social ». Une messagerie entre inconnus est
   le cœur d'un réseau social. Le principe peut changer, mais c'est au porteur de le décider, pas à Claude.
2. **Des mineurs sont inscrits.** L'inscription propose la tranche « Moins de 15 ans ». Une messagerie libre entre
   inconnus, avec des enfants, expose au harcèlement et à la prise de contact par des adultes mal intentionnés. C'est le
   risque le plus grave du projet si rien n'est prévu.
3. **Règles des stores et de la loi.** Apple (règle 1.2) et Google demandent, pour tout contenu écrit par les
   utilisateurs : un filtre, un bouton « Signaler », un bouton « Bloquer », une réponse rapide aux signalements et un
   moyen de contact. Le règlement européen sur les services numériques (DSA) impose aussi de traiter les signalements.
   Sans cela, l'app peut être refusée ou retirée des stores.
4. **Données personnelles.** Les messages sont des données personnelles : durée de conservation, droit d'accès et
   d'effacement, mention dans la politique de confidentialité.

## 2. Trois options

| | A. Pas de messagerie | B. Messages rapides | C. Messagerie libre encadrée |
|---|---|---|---|
| Ce que voit le joueur | Rien de plus que la carte | Une dizaine de messages tout faits : « Bien joué ! », « GG », « On se retrouve au top 10 ? », émojis Pokémon | Une vraie conversation écrite |
| Risque pour les mineurs | Aucun | Très faible (aucun texte libre) | Réel : à limiter (§3) |
| Modération | Aucune | Aucune (rien à lire) | Filtre, signalements, blocage, file d'attente admin, réponse sous 24 h |
| Contradiction avec le principe 4 | Aucune | Faible (pas de fil, pas de discussion) | Forte (à lever par le porteur) |
| Travail | 0 | ≈ 10 h | ≈ 40 h |
| Coût mensuel | 0 € | 0 € (serveur actuel) | 0 € de serveur, mais du **temps de modération** chaque semaine |

## 3. Si C est retenu : garde-fous proposés (défauts à valider)

- Réservé aux **18 ans et plus**, ou au minimum aux 15 ans et plus (tranche « Moins de 15 ans » exclue).
- Un joueur peut **couper ses messages** (réglage « Personne », « Seulement les joueurs que j'ai contactés »).
- **Signaler** et **Bloquer** sur chaque conversation ; un message signalé est caché tout de suite et va dans une file
  « Messages signalés » du panneau Admin.
- Filtre de mots (insultes, numéros de téléphone, adresses e-mail, liens) : message refusé avant envoi.
- Texte seulement : ni photo, ni lien, ni fichier. 20 messages par heure au plus.
- Messages gardés 90 jours, puis effacés ; tout est effacé avec le compte.
- Politique de confidentialité, CGU et règles de conduite mises à jour avant l'ouverture.
- Avis juridique conseillé avant l'ouverture (mineurs, DSA).

## 4. Recommandation

**B d'abord** : il répond à l'envie de « parler » aux autres joueurs sans aucun risque pour les mineurs ni travail de
modération, et reste compatible avec le principe 4. **C plus tard**, seulement si B montre que les joueurs veulent
vraiment discuter, après décision du porteur sur le principe 4, sur l'âge minimum et sur le temps de modération qu'il
peut y consacrer.

Ce qui rend l'avantage durable et comment le mesurer (principe 7) : la ligue fidélise si les joueurs reviennent pour se
comparer. Mesure : part des joueurs qui ouvrent au moins une carte de dresseur par semaine, puis part des cartes
ouvertes qui mènent à un message rapide (B).

## 5. Décisions attendues

- **M1.** Option A, B ou C ? (défaut proposé : **B**)
- **M2.** Si C : âge minimum 15 ou 18 ans ? (défaut : **18 ans**)
- **M3.** Si C : qui modère, et combien de temps par semaine ? (défaut : le porteur, réponse sous 24 h)
- **M4.** Si C : le principe 4 (« pas de réseau social ») est-il modifié ? (défaut : non tant que B n'a pas été essayé)

## 6. Effort

- **B** : messages tout faits côté serveur (table, envoi limité, lecture), pastille « nouveau message » sur la carte,
  liste des messages reçus, tests. ≈ 10 h, soit ≈ 1,5 jour à plein régime (8 h/j) ou ≈ 3,5 jours au rythme réel (3 h/j).
- **C** : tout B, plus texte libre, filtre, signalement, blocage, réglage de confidentialité, file Admin, effacement à
  90 jours, textes légaux, tests de sécurité. ≈ 40 h, soit ≈ 5 jours à plein régime ou ≈ 13 jours au rythme réel.
