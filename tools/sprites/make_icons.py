#!/usr/bin/env python3
"""
make_icons.py : icônes du panneau « Choisis ton compagnon », faites à partir des sprites fixes (web/img/pokemon/<n>.png).

Chaque Pokémon garde sa taille d'origine (demande du porteur, 2026-10-05) : rien n'est agrandi, un petit Pokémon reste
petit à côté d'un grand. Le sprite est seulement recadré au plus près du Pokémon, puis centré dans une icône carrée
transparente de 96 px, affichée sur 96 px (agrandie sans flou par le navigateur sur les écrans à haute densité).
Rien d'autre que le Pokémon n'est dessiné ; l'icône garde la palette et la transparence du sprite.

Sortie : web/img/pokemon/icon/<n>.png, pour chaque Pokémon de companions.json.
Usage : python3 tools/sprites/make_icons.py   (Pillow)
"""
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "web" / "img" / "pokemon"
OUT = SRC / "icon"
INDEX = Path(__file__).with_name("companions.json")
SIZE = 96  # côté de l'icône, en pixels : celui du sprite d'origine


def icon(n):
    src = Image.open(SRC / f"{n}.png")
    if src.mode != "P" or not isinstance(src.info.get("transparency"), int):
        raise SystemExit(f"Sprite n° {n} : palette et couleur transparente attendues")
    clear = src.info["transparency"]
    box = src.convert("RGBA").getchannel("A").getbbox()
    poke = src.crop(box)
    out = Image.new("P", (SIZE, SIZE), clear)
    out.putpalette(src.getpalette())
    out.paste(poke, ((SIZE - poke.width) // 2, (SIZE - poke.height) // 2))
    out.save(OUT / f"{n}.png", optimize=True, transparency=clear)
    return poke.size


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    numbers = [p[0] for p in json.loads(INDEX.read_text("utf-8"))["pokemon"]]
    sizes = [icon(n) for n in numbers]
    total = sum((OUT / f"{n}.png").stat().st_size for n in numbers)
    side = sorted(max(s) for s in sizes)
    print(f"{len(numbers)} icônes, {total // 1024} Ko ; Pokémon de {side[0]} à {side[-1]} px, à leur taille d'origine")


if __name__ == "__main__":
    main()
