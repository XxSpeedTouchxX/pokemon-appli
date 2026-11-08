"""Cartes du banc d'essai du scan (2026-11-08, porteur : scan plus rapide et plus précis).

Le banc d'essai (tools/web/e2e/bench-scan.mjs) a besoin de scans en haute définition : les copies de l'app (300 px)
rendent le numéro illisible. Ce script copie, une fois, le visuel « high » de TCGdex (600 × 825) des cartes listées
dans tools/web/e2e/files/bench/cards.json (toutes les époques, de Set de Base à Méga-Évolution), en JPEG.
Usage (GitHub Actions, workflow « Banc d'essai du scan ») : python tools/web/e2e/fetch_bench.py
"""
import io
import json
import pathlib
import sys
import time
import urllib.request

from PIL import Image

DIR = pathlib.Path(__file__).resolve().parent / "files" / "bench"
CDN = "https://assets.tcgdex.net/"


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Dropicards/1.0 (+https://dropicards.fr)"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def main():
    cards = json.loads((DIR / "cards.json").read_text("utf-8"))
    bad = []
    for c in cards:
        out = DIR / (c["id"] + ".jpg")
        if out.exists():
            continue
        try:
            data = fetch(CDN + c["img"] + "/high.png")
            im = Image.open(io.BytesIO(data)).convert("RGB")
            im.save(out, "JPEG", quality=88)
            print(c["id"], im.size)
        except Exception as e:  # visuel absent du CDN
            bad.append(c["id"])
            print(c["id"], "introuvable :", e)
        time.sleep(0.5)
    print(len(cards) - len(bad), "cartes ;", "manquantes :", bad or "aucune")
    if len(bad) > len(cards) // 2:
        sys.exit(1)


if __name__ == "__main__":
    main()
