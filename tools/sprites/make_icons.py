#!/usr/bin/env python3
"""
make_icons.py : icônes du panneau « Choisis ton compagnon », faites à partir des sprites fixes (web/img/pokemon/<n>.png).

Chaque sprite est recadré au plus près du Pokémon (le cadre de 96 px est presque vide), agrandi d'un nombre entier
de fois, sans flou (pixels nets et réguliers), puis centré dans une icône carrée transparente de 288 px. L'icône
s'affiche sur 96 px : un pixel d'écran par pixel d'icône sur un téléphone de densité 3. Rien d'autre que le Pokémon
n'est dessiné ; l'icône garde la palette et la transparence du sprite.

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
SIZE = 288  # côté de l'icône, en pixels (96 px affichés × densité 3)
MAX_ZOOM = 7  # les plus petits sprites (30 px) ne sont pas agrandis au-delà


def icon(n):
    src = Image.open(SRC / f"{n}.png")
    if src.mode != "P" or not isinstance(src.info.get("transparency"), int):
        raise SystemExit(f"Sprite n° {n} : palette et couleur transparente attendues")
    clear = src.info["transparency"]
    box = src.convert("RGBA").getchannel("A").getbbox()
    poke = src.crop(box)
    w, h = poke.size
    zoom = min(MAX_ZOOM, SIZE // max(w, h))
    poke = poke.resize((w * zoom, h * zoom), Image.NEAREST)
    out = Image.new("P", (SIZE, SIZE), clear)
    out.putpalette(src.getpalette())
    out.paste(poke, ((SIZE - poke.width) // 2, (SIZE - poke.height) // 2))
    out.save(OUT / f"{n}.png", optimize=True, transparency=clear)
    return zoom, poke.size


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    numbers = [p[0] for p in json.loads(INDEX.read_text("utf-8"))["pokemon"]]
    sizes = [icon(n) for n in numbers]
    total = sum((OUT / f"{n}.png").stat().st_size for n in numbers)
    side = sorted(max(s) for _, s in sizes)
    print(f"{len(numbers)} icônes, {total // 1024} Ko ; Pokémon de {side[0] // 3} à {side[-1] // 3} px affichés")


if __name__ == "__main__":
    main()
