#!/usr/bin/env python3
"""
card_images.py (2026-11-12, contenus réseaux sociaux, lecture seule) : visuels TCGdex de quelques cartes, copiés dans le
journal du workflow « Visuels de cartes » (WebP 800 px en base64), pour les carrousels TikTok et Instagram.
Usage : python tools/marketing/card_images.py "fr/me/me02.5/276 fr/me/me06/138 ..."
Chaque chemin est essayé en français puis en anglais (même numéro).
"""
import base64
import io
import sys
import time
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from PIL import Image

UA = {"User-Agent": "PKM-App-index/1.0 (catalogue Dropicards)"}


def get(url):
    with urlopen(Request(url, headers=UA), timeout=60) as r:
        return r.read()


for path in sys.argv[1].split():
    tries = [path] + ([path.replace("fr/", "en/", 1)] if path.startswith("fr/") else [])
    data, used = None, None
    for t in tries:
        for q in ("high.png", "high.webp"):
            try:
                data = get(f"https://assets.tcgdex.net/{t}/{q}"); used = f"{t}/{q}"; break
            except (HTTPError, URLError, TimeoutError):
                continue
        if data:
            break
    if not data:
        print("MANQUE", path); continue
    im = Image.open(io.BytesIO(data)).convert("RGBA")
    im.thumbnail((800, 800), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, "WEBP", quality=88, method=6)
    b = base64.b64encode(buf.getvalue()).decode()
    key = path.replace("/", "_")
    print("TROUVE", path, used, im.size)
    for k in range(0, len(b), 4000):
        print(f"IMG {key} {k // 4000} {b[k:k + 4000]}")
    time.sleep(0.5)
