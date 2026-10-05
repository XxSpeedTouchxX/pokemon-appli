#!/usr/bin/env python3
"""
fetch_sprites.py : compagnons de l'accueil, les 151 Pokémon de Kanto (thème 30 ans), plus Kyogre, Groudon et
Rayquaza (demande du porteur, 2026-10-05). Lancé à la main ; les fichiers sont ensuite gardés dans le dépôt (version
figée, empreintes SHA-256 dans companions.json). Les icônes du choix sont faites ensuite par make_icons.py.

Sources (dépôts GitHub de PokeAPI, données publiques) :
  - sprites animés et fixes de Pokémon Noir et Blanc : PokeAPI/sprites,
    sprites/pokemon/versions/generation-v/black-white[/animated]/<n>.(gif|png) ;
    images © The Pokémon Company (dépôt sous CC0 pour sa structure) ;
  - noms français : PokeAPI/pokeapi, data/v2/csv/pokemon_species_names.csv (langue 5 = français).

Sorties : web/img/pokemon/<n>.gif (animé), web/img/pokemon/<n>.png (fixe : animations réduites, source des icônes),
tools/sprites/companions.json (n°, nom français, empreintes, sources).

Usage : python3 tools/sprites/fetch_sprites.py && python3 tools/sprites/make_icons.py
"""
import csv
import hashlib
import io
import json
import time
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "web" / "img" / "pokemon"
INDEX = Path(__file__).with_name("companions.json")
RAW = "https://raw.githubusercontent.com/PokeAPI/"
ANIMATED = RAW + "sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/{n}.gif"
STILL = RAW + "sprites/master/sprites/pokemon/versions/generation-v/black-white/{n}.png"
NAMES = RAW + "pokeapi/master/data/v2/csv/pokemon_species_names.csv"
UA = "Dropicards/1.0 (+https://github.com/XxSpeedTouchxX/pokemon-appli)"
MAX_GIF, MAX_PNG = 200_000, 20_000  # octets : un sprite plus gros est refusé
KANTO = range(1, 152)
EXTRA = (382, 383, 384)  # Kyogre, Groudon, Rayquaza, à la suite dans l'ordre du Pokédex


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
    rows = csv.DictReader(io.StringIO(get(NAMES).decode("utf-8")))
    names = {int(r["pokemon_species_id"]): r["name"] for r in rows if r["local_language_id"] == "5"}
    OUT.mkdir(parents=True, exist_ok=True)
    index, total = [], 0
    for n in [*KANTO, *EXTRA]:
        gif, png = get(ANIMATED.format(n=n)), get(STILL.format(n=n))
        if not gif.startswith(b"GIF8") or len(gif) > MAX_GIF or not png.startswith(b"\x89PNG") or len(png) > MAX_PNG:
            raise SystemExit(f"Sprite n° {n} refusé (format ou taille)")
        (OUT / f"{n}.gif").write_bytes(gif)
        (OUT / f"{n}.png").write_bytes(png)
        index.append([n, names[n], hashlib.sha256(gif).hexdigest()[:16], hashlib.sha256(png).hexdigest()[:16]])
        total += len(gif) + len(png)
    INDEX.write_text(json.dumps({
        "fetched": time.strftime("%Y-%m-%d"), "credit": "Sprites de Pokémon Noir et Blanc © The Pokémon Company, via PokeAPI",
        "sources": {"animated": ANIMATED, "still": STILL, "names": NAMES},
        "fields": ["n", "nom", "gif_sha256_16", "png_sha256_16"], "pokemon": index,
    }, ensure_ascii=False, indent=1) + "\n", "utf-8")
    print(f"{len(index)} compagnons, {total // 1024} Ko : {index[0][1]} … {index[-1][1]}")


if __name__ == "__main__":
    main()
