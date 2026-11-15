# Sons du coffre mystère, 3ᵉ série (`?soncoffre=11` à `15`) : origine des enregistrements

Demande du porteur (2026-11-15) : « Propose-moi vraiment des vrais bruits de coffre qui s'ouvre, avec une touche un peu
"jeu". » Les séries 1 à 5 et 6 à 10 (sons fabriqués par `tools/web/sfx.js`) ont été refusées (« trop jeu vidéo », puis
« trop gaming arcade »).

Les 5 sons de cette série sont des **mixages de vrais enregistrements**, tous dans le **domaine public (CC0 1.0)**.
Aucun autre son, aucune autre licence. Le seul traitement est fait par `make_coffre.py` : découpe, filtres, hauteur
changée (lecture accélérée ou ralentie), un froissement d'étoffe joué à l'envers, volume. Aucun son n'est fabriqué
électroniquement.

## Les packs d'origine

| Pack | Auteur | Page d'origine | Licence |
|---|---|---|---|
| **RPG Audio** (1.0, 17-03-2014) | Kenney (www.kenney.nl) | https://kenney.nl/assets/rpg-audio | CC0 1.0 : http://creativecommons.org/publicdomain/zero/1.0/ |
| **Impact Sounds** (1.0, 19-12-2019) | Kenney (www.kenney.nl) | https://kenney.nl/assets/impact-sounds | CC0 1.0 : http://creativecommons.org/publicdomain/zero/1.0/ |

Texte du fichier `License.txt` de chaque pack : « License: (Creative Commons Zero, CC0) […] This content is free to use
in personal, educational and commercial projects. Support us by crediting Kenney or www.kenney.nl (this is not
mandatory) ». Le crédit n'est pas obligatoire ; il est donné ici.

**Où les fichiers ont été pris (2026-11-15).** kenney.nl, OpenGameArt et freesound ne sont pas joignables depuis
l'environnement de travail de Claude (refus du proxy). Les packs complets de Kenney, avec leur `License.txt`, ont donc
été pris dans le miroir public **github.com/series-ai/jam-ready-assets** (branche `main`, dossiers
`kenney-rpg-audio/audio/` et `kenney-impact-sounds/audio/`). Les fichiers y sont stockés en Git LFS : leur contenu a été
vérifié (empreinte SHA-256 identique à celle du pointeur LFS du miroir) et les empreintes sont gardées dans
`sources.sha256`. `telecharger.sh` les retélécharge et refuse tout fichier dont l'empreinte diffère.

## Fichiers utilisés (35, noms d'origine inchangés)

| Fichier d'origine | Pack | URL exacte | SHA-256 |
|---|---|---|---|
| `impactBell_heavy_000.ogg` | Impact Sounds | https://media.githubusercontent.com/media/series-ai/jam-ready-assets/main/kenney-impact-sounds/audio/Audio/impactBell_heavy_000.ogg | `d86598c8dc47c9464eb720d6c959abccd7329a3eecc0cfd4ce7935b0b4faaa9f` |
| `impactBell_heavy_001.ogg` | Impact Sounds | https://media.githubusercontent.com/media/series-ai/jam-ready-assets/main/kenney-impact-sounds/audio/Audio/impactBell_heavy_001.ogg | `6975198cbdebc941892bf8e5f79c863795aa14188b8191a6a80b3b128de78c16` |
| `impactBell_heavy_003.ogg` | Impact Sounds | https://media.githubusercontent.com/media/series-ai/jam-ready-assets/main/kenney-impact-sounds/audio/Audio/impactBell_heavy_003.ogg | `2fc3a5f9e04f5076977ea9ba11cb2686b364ec7eba1a829928ee73156215f1c9` |
| `impactGlass_light_000.ogg` | Impact Sounds | https://media.githubusercontent.com/media/series-ai/jam-ready-assets/main/kenney-impact-sounds/audio/Audio/impactGlass_light_000.ogg | `518b3ca93556b42d330d20334cf6bad51d3b371bd3cf7b731f34ead41b5a0112` |
| `impactGlass_light_001.ogg` | Impact Sounds | https://media.githubusercontent.com/media/series-ai/jam-ready-assets/main/kenney-impact-sounds/audio/Audio/impactGlass_light_001.ogg | `40bd734d148e6b9fd3e72883e1ae289278fbc94027e4c43dceaf31df428e136a` |
| `impactGlass_light_002.ogg` | Impact Sounds | https://media.githubusercontent.com/media/series-ai/jam-ready-assets/main/kenney-impact-sounds/audio/Audio/impactGlass_light_002.ogg | `1893814a6ac478e652624e4342b00bbd8690e442d5d3e042f11ac5019faa9f70` |
| `impactGlass_light_003.ogg` | Impact Sounds | https://media.githubusercontent.com/media/series-ai/jam-ready-assets/main/kenney-impact-sounds/audio/Audio/impactGlass_light_003.ogg | `2a80cf5619ebbebbacdad212d85813f08af889343eaba91f0156081dc3945bc4` |
| `impactGlass_light_004.ogg` | Impact Sounds | https://media.githubusercontent.com/media/series-ai/jam-ready-assets/main/kenney-impact-sounds/audio/Audio/impactGlass_light_004.ogg | `aff091a74c44a7d8ba67674c93f70a0e48981730bcaa10d92621ccd0ca105d37` |
| `impactMetal_light_000.ogg` | Impact Sounds | https://media.githubusercontent.com/media/series-ai/jam-ready-assets/main/kenney-impact-sounds/audio/Audio/impactMetal_light_000.ogg | `3fd6289d5b23077db8607811f9f80c3a8b113434de08260d0366b24729f5b530` |
| `impactMetal_light_001.ogg` | Impact Sounds | https://media.githubusercontent.com/media/series-ai/jam-ready-assets/main/kenney-impact-sounds/audio/Audio/impactMetal_light_001.ogg | `f092b75cc53083af839dc72e245d6b0daea6cd417a9abf707c67d91348483bce` |
| `impactMetal_light_002.ogg` | Impact Sounds | https://media.githubusercontent.com/media/series-ai/jam-ready-assets/main/kenney-impact-sounds/audio/Audio/impactMetal_light_002.ogg | `0d9cc7901cbd5cea390cfff2c2efdfc9bffe14b21e169ad56f25211ee66bd48a` |
| `impactMetal_light_003.ogg` | Impact Sounds | https://media.githubusercontent.com/media/series-ai/jam-ready-assets/main/kenney-impact-sounds/audio/Audio/impactMetal_light_003.ogg | `55b5aaf50e2420baa7d1a13d33b5bef173f782e4116d2217865cb70ad395a550` |
| `impactPlank_medium_001.ogg` | Impact Sounds | https://media.githubusercontent.com/media/series-ai/jam-ready-assets/main/kenney-impact-sounds/audio/Audio/impactPlank_medium_001.ogg | `6666c0d6a91a832fce2f816d6bd2127b8d417c1a5e21814b8df42770deada89a` |
| `impactSoft_heavy_000.ogg` | Impact Sounds | https://media.githubusercontent.com/media/series-ai/jam-ready-assets/main/kenney-impact-sounds/audio/Audio/impactSoft_heavy_000.ogg | `5103f2616bd97a74daef0c0dd801873a334a92120a787467d131826e4a8a2650` |
| `impactSoft_heavy_001.ogg` | Impact Sounds | https://media.githubusercontent.com/media/series-ai/jam-ready-assets/main/kenney-impact-sounds/audio/Audio/impactSoft_heavy_001.ogg | `2b36cd469413095d397f46370b84cea5e362e0719b53defe9898696947e141ff` |
| `impactSoft_heavy_002.ogg` | Impact Sounds | https://media.githubusercontent.com/media/series-ai/jam-ready-assets/main/kenney-impact-sounds/audio/Audio/impactSoft_heavy_002.ogg | `79f3fb671aed42551c7e7d0035388011a763046bd0f33c97d19d7c4356e71f20` |
| `impactWood_heavy_000.ogg` | Impact Sounds | https://media.githubusercontent.com/media/series-ai/jam-ready-assets/main/kenney-impact-sounds/audio/Audio/impactWood_heavy_000.ogg | `0b58af520d6ab9ff893ae79929764ebb073474dbbcacb1d6b7a085a44ec033be` |
| `impactWood_medium_001.ogg` | Impact Sounds | https://media.githubusercontent.com/media/series-ai/jam-ready-assets/main/kenney-impact-sounds/audio/Audio/impactWood_medium_001.ogg | `2e41f88be0f1f3697d52d9403126939974d96d78fbea358f7d556deda25eb4a5` |
| `impactWood_medium_002.ogg` | Impact Sounds | https://media.githubusercontent.com/media/series-ai/jam-ready-assets/main/kenney-impact-sounds/audio/Audio/impactWood_medium_002.ogg | `d8ed153af39b7715ccc66683dacb9334a102a64c9c3ec95646bbfed717925f55` |
| `beltHandle1.ogg` | RPG Audio | https://media.githubusercontent.com/media/series-ai/jam-ready-assets/main/kenney-rpg-audio/audio/Audio/beltHandle1.ogg | `d9dde0c56bba2986f63e84eddd83111f33f15e819f5cdd8f5d46bb451ce8a8de` |
| `bookPlace1.ogg` | RPG Audio | https://media.githubusercontent.com/media/series-ai/jam-ready-assets/main/kenney-rpg-audio/audio/Audio/bookPlace1.ogg | `026372c5e3abfc8caa2263ab46f7fa60ed37edc161a6a01bd62c9c67d428089c` |
| `bookPlace2.ogg` | RPG Audio | https://media.githubusercontent.com/media/series-ai/jam-ready-assets/main/kenney-rpg-audio/audio/Audio/bookPlace2.ogg | `7616b0da866cda26158e52e8b02cfef935c2cd069c5a483735487eacc13193e1` |
| `bookPlace3.ogg` | RPG Audio | https://media.githubusercontent.com/media/series-ai/jam-ready-assets/main/kenney-rpg-audio/audio/Audio/bookPlace3.ogg | `11d2e6635cb19cb0896d7861f73d7804448d98dd455b11b01e38baa0a964c743` |
| `cloth1.ogg` | RPG Audio | https://media.githubusercontent.com/media/series-ai/jam-ready-assets/main/kenney-rpg-audio/audio/Audio/cloth1.ogg | `3598f30f9afa294e4834fab7a3b1b76fbd0588607fdcd848fc87c2c9a0011d3f` |
| `creak1.ogg` | RPG Audio | https://media.githubusercontent.com/media/series-ai/jam-ready-assets/main/kenney-rpg-audio/audio/Audio/creak1.ogg | `fa75b1d17d327d7e0001d249d468493b59f3865b00a2582c21f7da2287728728` |
| `creak3.ogg` | RPG Audio | https://media.githubusercontent.com/media/series-ai/jam-ready-assets/main/kenney-rpg-audio/audio/Audio/creak3.ogg | `be677e6970e830fa4a8e3b20de596c3818466c4d341cd341186cff77616d9399` |
| `doorClose_4.ogg` | RPG Audio | https://media.githubusercontent.com/media/series-ai/jam-ready-assets/main/kenney-rpg-audio/audio/Audio/doorClose_4.ogg | `a0b40a11ffd7fc8c521085bcda1fafd7bf10d8e058beb72815754a3bcebb7319` |
| `doorOpen_1.ogg` | RPG Audio | https://media.githubusercontent.com/media/series-ai/jam-ready-assets/main/kenney-rpg-audio/audio/Audio/doorOpen_1.ogg | `a3f9deb5ac1b6e1cbb8f6a5de93f1940d4d00eb4a4424ae4f2f3f7a9170dd9b0` |
| `doorOpen_2.ogg` | RPG Audio | https://media.githubusercontent.com/media/series-ai/jam-ready-assets/main/kenney-rpg-audio/audio/Audio/doorOpen_2.ogg | `378471f21245119d19d55b5c78bfffc72cf614da8781915d6903f13527cd5f50` |
| `dropLeather.ogg` | RPG Audio | https://media.githubusercontent.com/media/series-ai/jam-ready-assets/main/kenney-rpg-audio/audio/Audio/dropLeather.ogg | `1d4d88b55a72654af8c1239ad45117848126bc5121acdfe4b544bc3fb913f840` |
| `handleCoins.ogg` | RPG Audio | https://media.githubusercontent.com/media/series-ai/jam-ready-assets/main/kenney-rpg-audio/audio/Audio/handleCoins.ogg | `fc7d7de1b012b77e89b9f052065734eada8001a69226b5ca6086a0618f7ff4d6` |
| `handleCoins2.ogg` | RPG Audio | https://media.githubusercontent.com/media/series-ai/jam-ready-assets/main/kenney-rpg-audio/audio/Audio/handleCoins2.ogg | `32d79ea56ff22e6d74c4dd541674c95f5adbcff01300b9f99694627e3e9fdbfe` |
| `handleSmallLeather.ogg` | RPG Audio | https://media.githubusercontent.com/media/series-ai/jam-ready-assets/main/kenney-rpg-audio/audio/Audio/handleSmallLeather.ogg | `37fde28abdd317a47e0c02d5ce9a33201a93833b97fa43b40d7b38dffc3bc949` |
| `metalClick.ogg` | RPG Audio | https://media.githubusercontent.com/media/series-ai/jam-ready-assets/main/kenney-rpg-audio/audio/Audio/metalClick.ogg | `a510eee39fd16aadb47944198a32f333c03b9f839b2da119eb4c449796d27bb6` |
| `metalLatch.ogg` | RPG Audio | https://media.githubusercontent.com/media/series-ai/jam-ready-assets/main/kenney-rpg-audio/audio/Audio/metalLatch.ogg | `ea762526168b6ebeeefeb5a620be2b95a8da53e71ba8d7a2b736560ee00011d0` |

Licences des packs (texte complet) : https://raw.githubusercontent.com/series-ai/jam-ready-assets/main/kenney-rpg-audio/audio/License.txt
et https://raw.githubusercontent.com/series-ai/jam-ready-assets/main/kenney-impact-sounds/audio/License.txt

## Ce que contient chaque son

| N° | Fichier servi | Nom | Enregistrements d'origine |
|---|---|---|---|
| 11 | `web/sfx/coffre-11.mp3` | Vieux coffre qui grince | chocs : `impactWood_heavy_000`, `doorClose_4` (plus grave), `bookPlace1-3`, `impactWood_medium_001-002` ; loquet `metalLatch` ; charnière `creak1` ; couvercle qui cogne `impactPlank_medium_001`, `bookPlace2` ; lot `handleSmallLeather` ; reflets `impactGlass_light_*` (plus aigus) ; souffle `cloth1` (à l'envers) |
| 12 | `web/sfx/coffre-12.mp3` | Serrure de fer et couvercle lourd | chocs du n° 11 (un ton plus grave) et ferrures `impactMetal_light_001-003` (plus graves) ; serrure `metalClick` ; couvercle `doorOpen_2` (plus grave), `doorClose_4` ; lot `dropLeather` ; petite cloche `impactBell_heavy_003` (plus aiguë) ; reflets `impactGlass_light_*` ; souffle `cloth1` |
| 13 | `web/sfx/coffre-13.mp3` | Loquet, charnière et pièces d'or | chocs du n° 11 et pièces dans le coffre `handleCoins2` ; loquet `metalLatch` ; charnière `creak3` ; pièces `handleCoins`, `handleCoins2` ; reflets `impactGlass_light_*` |
| 14 | `web/sfx/coffre-14.mp3` | Clé qui tourne et scintillement | chocs du n° 11 (plus aigus : petit coffre) ; trousseau `beltHandle1` ; clé `metalClick` (plus aiguë) ; charnière `creak3` (plus grave) ; couvercle `impactWood_medium_002` ; scintillement `impactGlass_light_*` (plus aigus) ; souffle `cloth1` |
| 15 | `web/sfx/coffre-15.mp3` | Vieux coffre de pirate | chocs du n° 11 (plus graves) avec `impactSoft_heavy_000-002` et ferrures `impactMetal_light_000-002` ; serrure lourde `metalLatch` (plus grave) ; couvercle `doorOpen_1`, `doorClose_4` (plus graves) ; pièces `handleCoins` (plus graves) ; lot `dropLeather` ; cloche de navire `impactBell_heavy_000-001` |

## Refaire les fichiers

```
bash tools/sfx/coffre/telecharger.sh /chemin/vers/un/dossier/vide
python3 -I tools/sfx/coffre/make_coffre.py --src /chemin/vers/un/dossier/vide --out web/sfx
```

Dépendances : numpy, scipy, ffmpeg (libmp3lame). Le résultat est identique octet pour octet d'une fois à l'autre
(vérifié le 2026-11-15). Chaque MP3 : mono, 44,1 kHz, 64 kbit/s, 5,8 s, 46 Ko, en trois parties (arrivée, ouverture,
supplément des gros lots) décrites dans `make_coffre.py` et lues par `SFX_CH_FILE` (`tools/web/sfx.js`).
