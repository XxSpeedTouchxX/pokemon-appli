#!/usr/bin/env python3
"""
fetch_megas.py : méga-évolutions des Pokémon de Kanto, débloquées avec des PA dans le jeu d'évolution (2026-10-28,
demande du porteur). Une fois débloquée, une méga-évolution devient un compagnon de l'accueil.

Style pixel « arcade » comme les autres Pokémon (2026-10-30, porteur : les méga-évolutions en 3D détonnaient) :
sprites au style Noir et Blanc de PokeAPI (sprites/pokemon/versions/generation-v/black-white/), faits par la communauté
pour les Pokémon apparus après la 5e génération :
- animé : black-white/animated/<id>.gif quand il existe (Méga-Dracaufeu X, Méga-Dardargnan, Méga-Alakazam, Méga-Mewtwo X et Y),
  sinon l'image fixe recadrée, en GIF d'une seule image ;
- fixe : black-white/<id>.png, 96 px ;
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
from urllib.error import HTTPError
from urllib.request import Request, urlopen

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "web" / "img" / "pokemon"
INDEX = Path(__file__).with_name("megas.json")
RAW = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/"
ANIMATED = RAW + "versions/generation-v/black-white/animated/{n}.gif"
STILL = RAW + "versions/generation-v/black-white/{n}.png"
UA = "Dropicards/1.0 (+https://github.com/XxSpeedTouchxX/pokemon-appli)"
MAX_GIF, MAX_PNG = 400_000, 20_000  # octets : au-delà, refusé
SIZE = 96
# id PokeAPI, n° du Pokémon de base, nom français
MEGAS = [
    (10033, 3, "Méga-Florizarre"), (10034, 6, "Méga-Dracaufeu X"), (10035, 6, "Méga-Dracaufeu Y"),
    (10036, 9, "Méga-Tortank"), (10090, 15, "Méga-Dardargnan"), (10073, 18, "Méga-Roucarnage"),
    (10037, 65, "Méga-Alakazam"), (10071, 80, "Méga-Flagadoss"), (10038, 94, "Méga-Ectoplasma"),
    (10039, 115, "Méga-Kangourex"), (10040, 127, "Méga-Scarabrute"), (10041, 130, "Méga-Léviator"),
    (10042, 142, "Méga-Ptéra"), (10043, 150, "Méga-Mewtwo X"), (10044, 150, "Méga-Mewtwo Y"),
]


def get(url, optional=False):
    for attempt in range(3):
        try:
            with urlopen(Request(url, headers={"User-Agent": UA}), timeout=60) as resp:
                return resp.read()
        except HTTPError as e:
            if e.code == 404 and optional:
                return None
            print(f"{url} : {e}")
            time.sleep(2 * (attempt + 1))
        except OSError as e:  # noqa: PERF203
            print(f"{url} : {e}")
            time.sleep(2 * (attempt + 1))
    raise SystemExit(f"Injoignable : {url}")


def still_gif(png):
    """GIF d'une seule image, transparent, à partir du sprite fixe (méga-évolution sans animation au style Noir et Blanc)."""
    im = Image.open(io.BytesIO(png)).convert("RGBA")
    box = im.getchannel("A").getbbox()
    im = im.crop(box)
    alpha = im.getchannel("A")
    pal = im.convert("RGB").quantize(colors=255, method=Image.Quantize.MEDIANCUT)
    mask = alpha.point(lambda v: 255 if v <= 128 else 0)
    pal.paste(255, mask=mask)
    buf = io.BytesIO()
    pal.save(buf, "GIF", transparency=255)
    return buf.getvalue()


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
        png = get(STILL.format(n=n))
        gif = get(ANIMATED.format(n=n), optional=True) or still_gif(png)
        if not gif.startswith(b"GIF8") or len(gif) > MAX_GIF or not png.startswith(b"\x89PNG") or len(png) > MAX_PNG:
            raise SystemExit(f"Sprite n° {n} refusé (format ou taille : {len(gif)} et {len(png)} octets)")
        (OUT / f"{n}.gif").write_bytes(gif)
        (OUT / f"{n}.png").write_bytes(png)
        icon(n, png)
        index.append([n, base, nom, hashlib.sha256(gif).hexdigest()[:16], hashlib.sha256(png).hexdigest()[:16]])
        total += len(gif) + len(png)
    INDEX.write_text(json.dumps({
        "fetched": time.strftime("%Y-%m-%d"),
        "credit": "Sprites © The Pokémon Company ; style Noir et Blanc de la communauté, via PokeAPI/sprites",
        "sources": {"animated": ANIMATED, "still": STILL},
        "fields": ["id", "base", "nom", "gif_sha256_16", "png_sha256_16"], "megas": index,
    }, ensure_ascii=False, indent=1) + "\n", "utf-8")
    print(f"{len(index)} méga-évolutions, {total // 1024} Ko")


if __name__ == "__main__":
    main()
