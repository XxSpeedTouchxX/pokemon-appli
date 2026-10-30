"""Cartes de l'éventail du premier écran, gardées dans l'app (2026-10-30, demande du porteur).

Les cinq visuels étaient chargés à chaque ouverture depuis le CDN de TCGdex ; sur le téléphone du porteur, ils
restaient noirs (carte dessinée de secours). On en garde une copie réduite dans web/img/onb/ : l'éventail s'affiche
tout de suite, même hors ligne ; le CDN reste en secours.

Sortie : web/img/onb/{id}.webp, 300 px de large (affichées à 92 px, trois fois la densité d'un iPhone).
Usage (GitHub Actions, workflow « Cartes du premier écran ») : python tools/brand/fetch_onb_cards.py
"""
import io
import pathlib
import sys
import urllib.request

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / "web" / "img" / "onb"
CDN = "https://assets.tcgdex.net/fr/"
# Identifiant de la carte dans l'app, chemin du visuel sur TCGdex (Lugia de la Collection Classique : visuel de la
# carte d'origine, Aquapolis 149/147, comme dans l'app).
CARDS = [
    ("me02.5-276", "me/me02.5/276"),   # Pikachu-ex « forêt », Héros Transcendants
    ("base1-4", "base/base1/4"),       # Dracaufeu, Set de Base
    ("30th-c-029", "ecard/ecard2/149"),  # Lugia, Collection Classique du 30e anniversaire
    ("30th-152", "me/30th/152"),       # Mew-ex, illustration spéciale
    ("30th-151", "me/30th/151"),       # Mewtwo-ex, illustration spéciale
]


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Dropicards/1.0 (+https://dropicards.fr)"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    bad = []
    for cid, path in CARDS:
        data = None
        for ext in ("high.webp", "high.png"):
            try:
                data = fetch(CDN + path + "/" + ext)
                break
            except Exception as e:  # noqa: BLE001
                print(f"{cid} : {ext} indisponible ({e})")
        if not data:
            bad.append(cid)
            continue
        im = Image.open(io.BytesIO(data)).convert("RGBA")
        w = 300
        im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        dest = OUT / f"{cid}.webp"
        im.save(dest, "WEBP", quality=86, method=6)
        print(f"{cid} : {im.width} x {im.height}, {dest.stat().st_size // 1024} Ko")
    if bad:
        print("Visuels introuvables : " + ", ".join(bad))
        sys.exit(1)


if __name__ == "__main__":
    main()
