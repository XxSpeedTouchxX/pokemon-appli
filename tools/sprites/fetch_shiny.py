#!/usr/bin/env python3
"""
fetch_shiny.py (2026-11-10, porteur : « tu pourras choisir aussi la version shiny de ton Pokémon » dans Mon avatar) :
version chromatique (shiny) du sprite fixe de chaque Pokémon du Pokédex de l'app (156 + 15 méga-évolutions).
Lancé à la main ; fichiers gardés dans le dépôt (web/img/pokemon/shiny/<n>.png, empreintes dans shiny.json).

Source (dépôt GitHub PokeAPI/sprites, données publiques, même source que fetch_sprites.py) :
  - Pokémon : sprites/pokemon/versions/generation-v/black-white/shiny/<n>.png (style Noir et Blanc, comme les autres) ;
  - méga-évolutions (absentes de Noir et Blanc) : sprites/pokemon/shiny/<id>.png.
Images © The Pokémon Company (visuels autorisés par le porteur le 2026-10-03, CLAUDE.md §4).

Usage : python3 tools/sprites/fetch_shiny.py
"""
import hashlib
import json
import time
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "web" / "img" / "pokemon" / "shiny"
INDEX = Path(__file__).with_name("shiny.json")
RAW = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/"
BW = RAW + "versions/generation-v/black-white/shiny/{n}.png"
MEGA = RAW + "shiny/{n}.png"
UA = "Dropicards/1.0 (+https://github.com/XxSpeedTouchxX/pokemon-appli)"
MAX_PNG = 40_000


def get(url):
    for attempt in range(3):
        try:
            with urlopen(Request(url, headers={"User-Agent": UA}), timeout=60) as resp:
                return resp.read()
        except OSError as e:  # noqa: PERF203
            print(f"{url} : {e}")
            time.sleep(2 * (attempt + 1))
    raise SystemExit(f"Injoignable : {url}")


def main():
    dex = json.loads((Path(__file__).with_name("dex.json")).read_text("utf-8"))["dex"]
    OUT.mkdir(parents=True, exist_ok=True)
    index = []
    for e in dex:
        n = int(e["n"])
        url = (MEGA if n > 10000 else BW).format(n=n)
        png = get(url)
        if not png.startswith(b"\x89PNG") or len(png) > MAX_PNG:
            raise SystemExit(f"Sprite shiny n° {n} refusé (format ou taille)")
        (OUT / f"{n}.png").write_bytes(png)
        index.append({"n": n, "sha256": hashlib.sha256(png).hexdigest(), "source": url})
    INDEX.write_text(json.dumps({"count": len(index), "shiny": index}, ensure_ascii=False, indent=1) + "\n", "utf-8")
    print(f"{len(index)} sprites shiny dans {OUT}")


if __name__ == "__main__":
    main()
