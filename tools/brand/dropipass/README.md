# DropiPass : logo (2026-11-15)

« Dropicards Premium » renommé « DropiPass » par le porteur ; seul le logo change, le contenu de l'offre reste le même.

- **Choix du porteur (2026-11-15) : la carte holo arc-en-ciel (logo 2) avec le « D » de l'icône au centre (2b)**,
  dans l'app partout (bannière, offre, lots 4ᵉ à 10ᵉ de « Ma ligue » avec une bulle « 1M »).
- `planche-holo.png` : les 6 motifs de la carte holo (2a gemme des PK, 2b « D » de l'icône, 2c « D » doré, 2d éclair,
  2e étoile, 2f « D » et gemme), chacun dans la bannière et en tête de l'écran de l'offre. Fichiers :
  `web/img/brand/dropipass-2a.svg` à `2f.svg`, faits par `make_holo.py` (le « D » reprend le tracé exact de
  `web/img/brand/monogram.svg`). 2b par défaut ; les autres restent visibles pour comparer : `dropicards.fr/?dpvis=2a`…
- `planche.png` : les 4 premières propositions (1 Pass doré, 2 Carte holo, 3 Couronne éclair, 4 Badge D), encore
  visibles avec `?dpvis=1`, `3`, `4`.
- « Pass » : reflet brillant toutes les 3 s, seulement sur « Pass » (bannière et écran de l'offre) ; le voile qui
  balayait tout l'en-tête de l'offre est retiré (`premium.css`, `.pkm-dp-pass`).
