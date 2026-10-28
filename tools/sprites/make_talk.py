#!/usr/bin/env python3
"""
make_talk.py : la mascotte du didacticiel qui parle (2026-10-28, demande du porteur).

Pour chaque starter (Bulbizarre, Salamèche, Carapuce, Pikachu), deux images au pixel près, recadrées autour du
Pokémon : bouche fermée (le sprite d'origine) et bouche ouverte (bouche redessinée, intérieur sombre et langue). Le
didacticiel les alterne pendant que le texte s'écrit (tools/web/tuto.js).

Entrée : web/img/pokemon/{n}.png (sprites 96 × 96 de PokeAPI, voir tools/sprites/README.md).
Sortie : web/img/pokemon/talk/{n}-0.png (fermée) et {n}-1.png (ouverte), 52 × 54 px.
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


def main():
    OUT.mkdir(exist_ok=True)
    for n, rows in MOUTH.items():
        im = Image.open(SRC / f"{n}.png").convert("RGBA")
        im.crop(CROP).save(OUT / f"{n}-0.png", optimize=True)
        px = im.load()
        for y, x0, x1, c in rows:
            for x in range(x0, x1 + 1):
                px[x, y] = c
        im.crop(CROP).save(OUT / f"{n}-1.png", optimize=True)
    print(f"{len(MOUTH)} mascottes : {OUT}")


if __name__ == "__main__":
    main()
