#!/usr/bin/env python3
"""
make_talk.py : la mascotte du didacticiel qui parle (2026-10-28, demande du porteur).

Pour chaque starter (Bulbizarre, Salamèche, Carapuce, Pikachu), deux images au pixel près, recadrées autour du
Pokémon : bouche fermée (le sprite d'origine) et bouche ouverte (bouche redessinée, intérieur sombre et langue). Le
didacticiel les alterne pendant que le texte s'écrit (tools/web/tuto.js).

Entrée : web/img/pokemon/{n}.png (sprites 96 × 96 de PokeAPI, voir tools/sprites/README.md).
Sortie : web/img/pokemon/talk/{n}-0.png (fermée), {n}-1.png (ouverte), {n}-2.png (sourire : yeux fermés « ^ ^ » et
bouche ouverte) et {n}-3.png (sourire bouche fermée), pour le remerciement du premier écran (2026-10-30), 52 × 54 px.
Usage : python3 tools/sprites/make_talk.py
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "web" / "img" / "pokemon"
OUT = SRC / "talk"
CROP = (22, 20, 74, 74)  # même cadre pour les quatre : la mascotte garde sa taille d'un starter à l'autre

INK = (16, 16, 16, 255)
# Bouche ouverte : pixels redessinés, ligne par ligne : (y, x0, x1, couleur). Les coordonnées sont celles du sprite.
MOUTH = {
    # Bulbizarre : la bouche entrouverte s'ouvre de deux lignes vers le bas.
    1: [(52, 35, 42, (122, 8, 34, 255)), (53, 34, 43, (122, 8, 34, 255)), (53, 37, 40, (238, 32, 57, 255)),
        (54, 34, 43, (238, 32, 57, 255)), (54, 36, 41, (255, 106, 98, 255)), (55, 34, 43, INK), (56, 35, 42, INK)],
    # Salamèche : sous le trait de la bouche, l'intérieur et la langue, puis la lèvre du bas.
    4: [(45, 36, 42, INK), (46, 37, 42, (90, 15, 20, 255)), (46, 40, 41, (230, 57, 0, 255)),
        (47, 37, 41, (230, 57, 0, 255)), (47, 37, 37, INK), (48, 38, 41, INK)],
    # Carapuce : la bouche orangée s'agrandit, intérieur brun et lèvre noire.
    7: [(44, 39, 45, (131, 41, 0, 255)), (45, 39, 45, (131, 41, 0, 255)), (45, 41, 43, (205, 123, 41, 255)),
        (46, 40, 44, INK), (44, 39, 39, INK), (44, 45, 45, INK), (45, 39, 39, INK), (45, 45, 45, INK)],
    # Pikachu : petite bouche ouverte sous la truffe.
    25: [(42, 37, 41, (98, 49, 8, 255)), (43, 37, 41, (98, 49, 8, 255)), (43, 38, 40, (107, 26, 26, 255)),
         (44, 37, 41, (98, 49, 8, 255)), (44, 38, 40, (230, 90, 65, 255)), (45, 38, 40, (98, 49, 8, 255))],
}

# Sourire (2026-10-30) : chaque œil est recouvert de la couleur de la peau (prise au point donné), puis un « ^ » est
# tracé à l'encre : (cadre de l'œil x0, y0, x1, y1), (point de la peau), [pixels du « ^ »].
HAPPY = {
    1: [((42, 42, 46, 47), (41, 45), [(42, 46), (43, 45), (44, 44), (45, 44), (46, 45), (47, 46)]),
        ((30, 42, 31, 47), (33, 45), [(30, 46), (31, 45), (32, 45), (33, 46)])],
    4: [((42, 36, 45, 41), (40, 38), [(41, 40), (42, 39), (43, 38), (44, 38), (45, 39), (46, 40)]),
        ((34, 36, 34, 40), (36, 38), [(34, 39), (35, 38), (36, 39)])],
    7: [((43, 36, 47, 41), (42, 38), [(43, 40), (44, 39), (45, 38), (46, 38), (47, 39), (48, 40)]),
        ((34, 36, 34, 38), (36, 38), [(34, 38), (35, 37), (36, 38)])],
    25: [((41, 37, 45, 41), (39, 40), [(41, 40), (42, 39), (43, 38), (44, 38), (45, 39), (46, 40)]),
         ((33, 38, 34, 41), (36, 40), [(33, 40), (34, 39), (35, 39), (36, 40)])],
}


def main():
    OUT.mkdir(exist_ok=True)
    for n, rows in MOUTH.items():
        im = Image.open(SRC / f"{n}.png").convert("RGBA")
        im.crop(CROP).save(OUT / f"{n}-0.png", optimize=True)
        happy = im.copy()
        hp = happy.load()
        for (x0, y0, x1, y1), (sx, sy), arc in HAPPY[n]:
            skin = hp[sx, sy]
            for x in range(x0, x1 + 1):
                for y in range(y0, y1 + 1):
                    hp[x, y] = skin
            for x, y in arc:
                hp[x, y] = INK
        happy.crop(CROP).save(OUT / f"{n}-3.png", optimize=True)
        px = im.load()
        for y, x0, x1, c in rows:
            for x in range(x0, x1 + 1):
                px[x, y] = c
        im.crop(CROP).save(OUT / f"{n}-1.png", optimize=True)
        for (x0, y0, x1, y1), (sx, sy), arc in HAPPY[n]:
            skin = px[sx, sy]
            for x in range(x0, x1 + 1):
                for y in range(y0, y1 + 1):
                    px[x, y] = skin
            for x, y in arc:
                px[x, y] = INK
        im.crop(CROP).save(OUT / f"{n}-2.png", optimize=True)
    print(f"{len(MOUTH)} mascottes : {OUT}")


if __name__ == "__main__":
    main()
