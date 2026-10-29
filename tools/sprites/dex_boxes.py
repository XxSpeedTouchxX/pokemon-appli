#!/usr/bin/env python3
"""
dex_boxes.py : mesures des sprites pour les tailles proportionnelles du Pokédex (2026-10-29, revue du code).

Pour chaque fiche de dex.json : largeur et hauteur du GIF animé (cadre déjà serré autour du Pokémon), et boîte du
Pokémon dans l'image fixe de 96 px (marges transparentes variables). L'app s'en sert pour dessiner chaque Pokémon à la
hauteur voulue, que l'image soit animée ou fixe, sans qu'un sprite très large ne déborde de sa colonne.
Écrit les champs « gif » [l, h] et « box » [x0, y0, x1, y1] dans tools/sprites/dex.json.
Usage : python3 tools/sprites/dex_boxes.py
"""
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
DEX = ROOT / "tools" / "sprites" / "dex.json"
IMG = ROOT / "web" / "img" / "pokemon"


def main():
    data = json.loads(DEX.read_text("utf-8"))
    for e in data["dex"]:
        n = e["n"]
        g = Image.open(IMG / f"{n}.gif")
        e["gif"] = [g.width, g.height]
        p = Image.open(IMG / f"{n}.png").convert("RGBA")
        e["box"] = list(p.getchannel("A").getbbox() or (0, 0, p.width, p.height))
    DEX.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")), "utf-8")
    print(len(data["dex"]), "fiches mesurées")


if __name__ == "__main__":
    main()
