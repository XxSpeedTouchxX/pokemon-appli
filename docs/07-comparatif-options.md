# Comparatif des options (modèle économique et technique) v1 (PKM-App, figé)

*Créé le 2026-10-03 · branche 06 Comparaison · Phase 2 (Sourcing & hypothèse) → Jalon M2 · projet d'exploration · ampleur Structurant*

> **Statut des scores : provisoires.** Les documents amont de la Phase 2 (Sources de données & prix, Cadre juridique & droits Pokémon, Hypothèses clés & opportunités) n'existent pas encore. Les notes ci-dessous reposent sur des hypothèses de travail marquées « à confirmer » et seront recalibrées dans une **v2** (la v1 passera alors en `ARCHIVES`). Les poids et les ancrages sont des **propositions à valider**.

---

## 1. Objet

Comparer les options de **modèle économique** et de **modèle technique** de PKM-App afin de choisir (a) le véhicule du **test de l'hypothèse principale** (Phase 3) et (b) la trajectoire probable vers l'exécution (Phase 4).

**Outil de scoring : grille pondérée** (outil des options/opportunités). L'ICE est réservé aux tâches du backlog et n'est pas utilisé ici.

## 2. Hypothèse principale (provisoire)

> Des **revendeurs / investisseurs en scellé** français de Pokémon TCG utiliseraient (et paieraient pour) un outil de suivi de la valeur et de la marge de l'achat à la revente, car les apps existantes (dont Pokeitem : français, scan, prix en temps réel) ne couvrent pas ce besoin.

- Seuil de réussite mesurable : **à fixer** dans *Hypothèses clés & opportunités v1* (et **avant** le test, cf. Roadmap, Phase 3).
- La cible du projet est double (collectionneurs ET revendeurs/investisseurs en scellé). Les options ci-dessous sont comparées sur le test de l'hypothèse « revendeurs » ; la branche collectionneurs reste à arbitrer (voir §7).

## 3. Hypothèses de travail (à confirmer)

| Sujet | Hypothèse | Où la confirmer |
|---|---|---|
| Temps | 2-4 h/jour | Fiche projet §3 |
| Budget | 500 à 5 000 € | Fiche projet §3 |
| Équipe & compétences | à plusieurs, composition et compétences à confirmer | Branche 02 Profil |
| Source de prix / catalogue | inconnue (accès, licence, coût) | Sources de données & prix v1 |
| Droits Pokémon (noms, images) | à vérifier, notamment en usage commercial | Cadre juridique & droits Pokémon v1 |
| Positionnement de Pokeitem | tel que décrit dans la Roadmap, non revérifié ici | Cartographie des apps concurrentes v1 |

## 4. Méthode : grille pondérée

**Score /100 = Σ (poids × note) ÷ 5**, notes de 1 à 5 (5 = meilleur). Pour le critère « Risque », 5 = risque faible.

| # | Critère | Poids | Note 5 | Note 3 | Note 1 |
|---|---|---|---|---|---|
| C1 | Rapidité du test | 20 | signal exploitable en quelques jours | quelques semaines | plusieurs mois avant tout signal |
| C2 | Coût vs budget | 20 | bas de fourchette (< 500 €) | ~1 000 à 2 500 € | proche ou au-delà de 5 000 € |
| C3 | Faisabilité (temps, compétences) | 15 | faisable en 2-4 h/j avec les compétences actuelles | apprentissage ou aide externe | compétence ou ressource indisponible |
| C4 | Risque données & juridique | 15 | aucune donnée tierce, usage limité des images | dépendance à une source tierce ou usage commercial à vérifier | blocage probable |
| C5 | Différenciation vs Pokeitem | 15 | besoin clairement non couvert | partiellement couvert | déjà couvert (scan, prix temps réel) |
| C6 | Potentiel de revenu | 10 | récurrent, significatif, extensible | complément modeste | quasi nul |
| C7 | Réversibilité & évolutivité | 5 | brique réutilisable, abandon sans perte | réutilisable en partie | engagement lourd, difficile à défaire |

**Logique des poids :** la Règle d'or (rien de lourd avant le test de la Phase 3) pèse sur la rapidité et le coût (40 % à elles deux). Une pondération alternative « long terme » est testée au §6.

## 5. Options et scores

### 5.1 Modèle économique

- **E1 : Abonnement payant dès le départ** (revendeurs/investisseurs en scellé)
- **E2 : Freemium** (base gratuite collectionneurs, premium revendeurs)
- **E3 : Gratuit + affiliation / publicité** (cible collectionneurs, volume)
- **E4 : Commission sur transaction / mise en relation** (marketplace)
- **E5 : Service payant à l'acte** (suivi de marge ou rapport fait à la main pour quelques revendeurs, sans produit logiciel)

| Option | C1 (20) | C2 (20) | C3 (15) | C4 (15) | C5 (15) | C6 (10) | C7 (5) | **Score** |
|---|---|---|---|---|---|---|---|---|
| E5 Service à l'acte | 5 | 5 | 4 | 3 | 3 | 2 | 4 | **78** |
| E1 Abonnement dès le départ | 3 | 4 | 3 | 3 | 4 | 4 | 3 | **69** |
| E2 Freemium | 3 | 3 | 3 | 3 | 3 | 4 | 4 | **63** |
| E3 Gratuit + affiliation/pub | 2 | 4 | 4 | 3 | 2 | 2 | 3 | **58** |
| E4 Commission / marketplace | 1 | 2 | 1 | 1 | 3 | 4 | 2 | **37** |

**Lecture, option par option :**

- **E5 :** test de paiement quasi immédiat et sans coût de développement ; faible potentiel de revenu à long terme, mais c'est surtout un **véhicule de test**, pas un modèle final.
- **E1 :** différencie par un outil pro pour revendeurs ; nécessite un produit (ou au moins une pré-vente / liste d'attente) avant de tester le consentement à payer.
- **E2 :** double cible servie, mais il faut du volume gratuit avant de convertir, ce qui allonge le test.
- **E3 :** les collectionneurs sont déjà servis par Pokeitem (C5 bas) ; le revenu dépend d'un gros volume, peu cohérent avec un side-business à 2-4 h/j.
- **E4 :** chantier lourd (confiance, paiement, litiges, conformité) ; écarté pour la phase d'exploration.

### 5.2 Modèle technique

- **T1 : Tableur / no-code** (Google Sheets, Notion ou équivalent : stock, coûts d'achat, marge ; prix saisis ou importés)
- **T2 : Web app / PWA sur mesure** (suivi stock, marge, prix via source tierce)
- **T3 : App mobile native** (iOS/Android, avec scan)
- **T4 : Bot / communauté** (Discord ou Telegram : alertes et suivi léger)

| Option | C1 (20) | C2 (20) | C3 (15) | C4 (15) | C5 (15) | C6 (10) | C7 (5) | **Score** |
|---|---|---|---|---|---|---|---|---|
| T1 Tableur / no-code | 5 | 5 | 5 | 4 | 2 | 2 | 3 | **80** |
| T4 Bot / communauté | 4 | 4 | 3 | 3 | 3 | 3 | 3 | **68** |
| T2 Web app / PWA | 3 | 3 | 3 | 3 | 4 | 4 | 4 | **66** |
| T3 App mobile native | 1 | 2 | 2 | 2 | 2 | 4 | 3 | **41** |

**Lecture, option par option :**

- **T1 :** le plus rapide et le moins cher, risque juridique limité si les prix sont saisis à la main ; ne différencie pas par lui-même et ne passe pas à l'échelle.
- **T4 :** bon pour tester l'intérêt et constituer une audience ; la différenciation est à vérifier en Cartographie (offre d'alertes déjà existante ?).
- **T2 :** meilleur compromis différenciation / potentiel / réutilisation, mais dépend d'une source de prix dont l'accès et la licence sont inconnus (C4 et C2 provisoires).
- **T3 :** le scan est justement le point fort déjà couvert par Pokeitem ; coût et délai élevés, à écarter avant validation du besoin.

## 6. Sensibilité : et si on pondère « long terme » ?

Pondération alternative : C1 10 · C2 10 · C3 10 · C4 15 · C5 20 · C6 25 · C7 10 (total 100), mêmes notes.

| Option | Score base | Score alternatif |
|---|---|---|
| E5 Service à l'acte | 78 | 67 |
| E1 Abonnement | 69 | **71** |
| E2 Freemium | 63 | 67 |
| E3 Gratuit + affiliation | 58 | 53 |
| E4 Commission | 37 | 47 |
| T1 Tableur / no-code | 80 | 66 |
| T2 Web app / PWA | 66 | **71** |
| T4 Bot / communauté | 68 | 64 |
| T3 App mobile native | 41 | 50 |

**Ce qu'on en retient :** le classement s'inverse en tête selon l'horizon (E5/T1 en test rapide, E1/T2 à plus long terme), ce qui dessine une **séquence** plutôt qu'un choix exclusif. E3, E4 et T3 restent en bas dans les deux lectures.

## 7. Scénario recommandé (proposition à valider)

1. **Phase 3, véhicule de test : E5 + T1** (service payant à l'acte, outillé par un tableur), auprès de quelques revendeurs en scellé. Aucun développement, conforme à la Règle d'or. Le porteur pratique lui-même l'achat-revente de scellé : ses premiers testeurs sont accessibles dans son réseau (à confirmer), avec un biais de proximité à contrôler lors de la lecture des résultats.
2. **Si le Gate M3 est franchi (Phase 4) : E1 + T2**, abonnement sur une web app (PWA), avec une option freemium (E2) à reconsidérer selon la demande côté collectionneurs.
3. **Écartés à ce stade :** E3, E4, T3. T4 reste une option de **canal d'acquisition** à examiner plus tard, pas un produit.

**Point d'arbitrage ouvert :** la double cible (collectionneurs ET revendeurs). Ce comparatif privilégie les revendeurs/investisseurs en scellé, seule cible où une différenciation vs Pokeitem est plausible ; à confirmer avec les besoins recueillis en Phase 1.

## 8. Ce qui ferait changer le classement

| Événement | Effet probable |
|---|---|
| Aucune source de prix exploitable dans le budget | T2 chute (C2, C4) ; T1 et E5 deviennent le seul chemin |
| Blocage ou risque fort sur les noms/images Pokémon en usage commercial | E1, E2 et T2 perdent en C4 ; revoir le modèle (service, données sans images) |
| Pokeitem couvre déjà le suivi de marge | C5 baisse partout ; l'hypothèse principale est à reformuler |
| Les entretiens ne montrent pas de consentement à payer | E1 et E5 chutent ; E3 et E2 remontent mais restent faibles en revenu |
| Compétence technique disponible dans l'équipe | C3 et C2 de T2 augmentent ; T2 peut passer devant T1 plus tôt |

## 9. Suites

- Recalibrer les notes (v2) dès que *Sources de données & prix v1*, *Cadre juridique & droits Pokémon v1* et *Hypothèses clés & opportunités v1* existent.
- Reporter le véhicule de test retenu dans *Protocole de test de l'hypothèse v1* (Phase 3).
- Consigner au *Journal des décisions* le choix du scénario une fois validé.
