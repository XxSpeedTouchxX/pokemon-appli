#!/usr/bin/env python3
"""
fetch_images.py : télécharge une seule fois le visuel officiel de chaque produit de tools/sealed/products.json
(galerie Pokémon France) et l'enregistre en WebP dans web/img/products/<id>.webp. Lancé par le workflow
« Catalogue scellé » quand la liste des produits change.

Ordre de préférence :
  1. la photo détourée du produit (dossier « inline » de la fiche : 01-fr.png, sinon 01.png) ;
  2. la vignette de la galerie (format 16:9).
Les visuels déjà présents ne sont pas retéléchargés. Une requête toutes les deux secondes.
"""
import io
import json
import sys
import time
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
PRODUCTS = Path(__file__).with_name("products.json")
OUT = ROOT / "web" / "img" / "products"
UA = "Mozilla/5.0 (compatible; PKM-App/1.0; +https://github.com/XxSpeedTouchxX/pokemon-appli)"
MAX_SIDE = 800
PAUSE = 2


def candidates(tile):
    """Photo détourée d'abord (même dossier que la vignette), puis la vignette elle-même."""
    folder = tile.rsplit("/", 1)[0]
    fr = tile.endswith("-fr.png")
    return [folder + "/inline/01-fr.png"] * fr + [folder + "/inline/01.png", tile]


def download(url):
    req = Request(url, headers={"User-Agent": UA, "Accept": "image/png,image/*"})
    try:
        with urlopen(req, timeout=60) as resp:
            data = resp.read()
            return data if data[:4] == b"\x89PNG" or data[:3] == b"\xff\xd8\xff" else None
    except (HTTPError, URLError, TimeoutError):
        return None


def to_webp(data, path):
    """Recadre les bords transparents, réduit à 800 px au plus et enregistre en WebP (transparence gardée)."""
    im = Image.open(io.BytesIO(data))
    im = im.convert("RGBA")
    alpha = im.getchannel("A")
    if alpha.getextrema()[0] < 250:
        box = alpha.point(lambda a: 255 if a > 8 else 0).getbbox()
        if box:
            im = im.crop(box)
    im.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)
    opaque = im.getchannel("A").getextrema()[0] >= 250
    (im.convert("RGB") if opaque else im).save(path, "WEBP", quality=82, method=6)
    return im.size


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    products = json.loads(PRODUCTS.read_text("utf-8"))["products"]
    done, missing = 0, []
    for p in products:
        if not p.get("img"):
            continue
        path = OUT / (p["id"] + ".webp")
        if path.exists():
            continue
        for url in candidates(p["img"]):
            time.sleep(PAUSE)
            data = download(url)
            if not data:
                continue
            w, h = to_webp(data, path)
            kind = "photo détourée" if "/inline/" in url else "vignette"
            print(f"  {p['id']} : {kind} {w} × {h}, {path.stat().st_size // 1024} Ko")
            done += 1
            break
        else:
            missing.append(p["id"])
            print(f"  {p['id']} : aucun visuel")
    total = sum(f.stat().st_size for f in OUT.glob("*.webp"))
    print(f"{done} visuel(s) ajouté(s) · {len(list(OUT.glob('*.webp')))} au total, {total // 1024} Ko · sans visuel : {missing or 'aucun'}")
    if missing and len(missing) == sum(1 for p in products if p.get("img")):
        sys.exit("Aucun visuel téléchargé : le site bloque peut-être les images.")


if __name__ == "__main__":
    main()
