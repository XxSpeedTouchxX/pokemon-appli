#!/usr/bin/env python3
"""
dex_boxes.py : mesures des sprites pour les tailles proportionnelles du Pokédex (2026-10-29, revue du code).

Pour chaque fiche de dex.json : largeur et hauteur du GIF animé (cadre déjà serré autour du Pokémon), et boîte du
Pokémon dans l'image fixe de 96 px (marges transparentes variables). L'app s'en sert pour dessiner chaque Pokémon à la
hauteur voulue, que l'image soit animée ou fixe, sans qu'un sprite très large ne déborde de sa colonne.
Écrit les champs « gif » [l, h] et « box » [x0, y0, x1, y1] dans tools/sprites/dex.json.
Depuis le 2026-10-29 (porteur : « gère le centrage des Pokémon »), aussi le centre d'équilibre horizontal du Pokémon
(moyenne du centre de masse et de celui des pieds, toutes les images du GIF cumulées) : « gc » en fraction de la largeur du GIF, « pc »
en pixels de l'image fixe de 96 px ; « gb », le vide sous le Pokémon dans l'image médiane du GIF. Le Pokédex pose ce centre, et non le milieu du cadre, au centre du socle : une
queue (Reptincel, Dracaufeu) ou une aile ne décale plus le corps.
Usage : python3 tools/sprites/dex_boxes.py
"""
import json
from pathlib import Path
from PIL import Image, ImageSequence


def centroid(alpha):
    """Centre horizontal « d'équilibre » d'un canal alpha (en pixels) : moyenne du centre de masse de tout le Pokémon
    et de celui de son quart bas (ses pieds, ce qui touche le socle) ; le milieu si l'image est vide."""
    w, h = alpha.size
    px = alpha.load()
    bbox = alpha.getbbox()
    if not bbox:
        return w / 2
    y_feet = bbox[3] - (bbox[3] - bbox[1]) * 0.25

    def mass(y_from):
        tot = acc = 0
        for y in range(int(y_from), h):
            for x in range(w):
                v = px[x, y]
                tot += v
                acc += v * (x + 0.5)
        return acc / tot if tot else w / 2
    return (mass(0) + mass(y_feet)) / 2

ROOT = Path(__file__).resolve().parents[2]
DEX = ROOT / "tools" / "sprites" / "dex.json"
IMG = ROOT / "web" / "img" / "pokemon"


def main():
    data = json.loads(DEX.read_text("utf-8"))
    for e in data["dex"]:
        n = e["n"]
        g = Image.open(IMG / f"{n}.gif")
        e["gif"] = [g.width, g.height]
        acc = Image.new("L", g.size, 0)
        for fr in ImageSequence.Iterator(g):
            a = fr.convert("RGBA").getchannel("A")
            acc = Image.composite(Image.new("L", g.size, 255), acc, a)  # union des silhouettes de toutes les images
        e["gc"] = round(centroid(acc) / g.width, 3)
        # Vide sous le Pokémon dans une image « médiane » de l'animation, en fraction de la hauteur : un Pokémon qui vole
        # ou rebondit (Méga-Dracaufeu Y) se pose alors sur son socle la plupart du temps, au lieu de flotter au-dessus.
        gaps = sorted(g.height - (fr.convert("RGBA").getchannel("A").getbbox() or (0, 0, 0, g.height))[3] for fr in ImageSequence.Iterator(g))
        e["gb"] = round(gaps[len(gaps) // 2] / g.height, 3)
        p = Image.open(IMG / f"{n}.png").convert("RGBA")
        e["box"] = list(p.getchannel("A").getbbox() or (0, 0, p.width, p.height))
        e["pc"] = round(centroid(p.getchannel("A")), 1)
    DEX.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")), "utf-8")
    print(len(data["dex"]), "fiches mesurées")


if __name__ == "__main__":
    main()
