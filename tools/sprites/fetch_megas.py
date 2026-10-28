#!/usr/bin/env python3
"""
fetch_megas.py : méga-évolutions des Pokémon de Kanto, débloquées avec des PA dans le jeu d'évolution (2026-10-28,
demande du porteur). Une fois débloquée, une méga-évolution devient un compagnon de l'accueil.

Les sprites Noir et Blanc n'existent pas pour les méga-évolutions (apparues en 6e génération) :
- animé : sprite de Pokémon Showdown (PokeAPI/sprites, sprites/pokemon/other/showdown/<id>.gif) ;
- fixe : sprite par défaut de PokeAPI (sprites/pokemon/<id>.png), 96 px ;
- icône du choix du compagnon : sprite fixe recadré au plus près et centré dans 96 px, comme make_icons.py.
Identifiants : ceux de PokeAPI (pokemon.csv), vérifiés le 2026-10-28.

Sortie : web/img/pokemon/<id>.gif, <id>.png, icon/<id>.png et tools/sprites/megas.json.
Usage : python3 tools/sprites/fetch_megas.py   (Pillow)
"""
import hashlib
import io
import json
import time
from pathlib import Path
from urllib.request import Request, urlopen

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "web" / "img" / "pokemon"
INDEX = Path(__file__).with_name("megas.json")
RAW = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/"
ANIMATED = RAW + "other/showdown/{n}.gif"
STILL = RAW + "{n}.png"
UA = "Dropicards/1.0 (+https://github.com/XxSpeedTouchxX/pokemon-appli)"
MAX_GIF, MAX_PNG = 400_000, 20_000  # octets (GIF de Showdown plus lourds que ceux de Noir et Blanc) : au-delà, refusé
SIZE = 96
# id PokeAPI, n° du Pokémon de base, nom français
MEGAS = [
    (10033, 3, "Méga-Florizarre"), (10034, 6, "Méga-Dracaufeu X"), (10035, 6, "Méga-Dracaufeu Y"),
    (10036, 9, "Méga-Tortank"), (10090, 15, "Méga-Dardargnan"), (10073, 18, "Méga-Roucarnage"),
    (10037, 65, "Méga-Alakazam"), (10071, 80, "Méga-Flagadoss"), (10038, 94, "Méga-Ectoplasma"),
    (10039, 115, "Méga-Kangourex"), (10040, 127, "Méga-Scarabrute"), (10041, 130, "Méga-Léviator"),
    (10042, 142, "Méga-Ptéra"), (10043, 150, "Méga-Mewtwo X"), (10044, 150, "Méga-Mewtwo Y"),
]


def get(url):
    for attempt in range(3):
        try:
            with urlopen(Request(url, headers={"User-Agent": UA}), timeout=60) as resp:
                return resp.read()
        except OSError as e:  # noqa: PERF203
            print(f"{url} : {e}")
            time.sleep(2 * (attempt + 1))
    raise SystemExit(f"Injoignable : {url}")


def icon(n, png):
    src = Image.open(io.BytesIO(png)).convert("RGBA")
    poke = src.crop(src.getchannel("A").getbbox())
    out = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    out.paste(poke, ((SIZE - poke.width) // 2, (SIZE - poke.height) // 2))
    out.save(OUT / "icon" / f"{n}.png", optimize=True)


def main():
    (OUT / "icon").mkdir(parents=True, exist_ok=True)
    index, total = [], 0
    for n, base, nom in MEGAS:
        gif, png = get(ANIMATED.format(n=n)), get(STILL.format(n=n))
        if not gif.startswith(b"GIF8") or len(gif) > MAX_GIF or not png.startswith(b"\x89PNG") or len(png) > MAX_PNG:
            raise SystemExit(f"Sprite n° {n} refusé (format ou taille : {len(gif)} et {len(png)} octets)")
        (OUT / f"{n}.gif").write_bytes(gif)
        (OUT / f"{n}.png").write_bytes(png)
        icon(n, png)
        index.append([n, base, nom, hashlib.sha256(gif).hexdigest()[:16], hashlib.sha256(png).hexdigest()[:16]])
        total += len(gif) + len(png)
    INDEX.write_text(json.dumps({
        "fetched": time.strftime("%Y-%m-%d"),
        "credit": "Sprites © The Pokémon Company ; animés de Pokémon Showdown et fixes de PokeAPI, via PokeAPI/sprites",
        "sources": {"animated": ANIMATED, "still": STILL},
        "fields": ["id", "base", "nom", "gif_sha256_16", "png_sha256_16"], "megas": index,
    }, ensure_ascii=False, indent=1) + "\n", "utf-8")
    print(f"{len(index)} méga-évolutions, {total // 1024} Ko")


if __name__ == "__main__":
    main()
