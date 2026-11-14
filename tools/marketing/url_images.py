#!/usr/bin/env python3
"""
url_images.py (2026-11-14, contenus réseaux sociaux, lecture seule) : visuels officiels de quelques produits à venir,
copiés dans le journal du workflow « Visuels de produits » (WebP 2400 px au plus, en base64), pour les vidéos TikTok et Instagram.
Usage : python tools/marketing/url_images.py "nom1=https://... nom2=https://..."
Rien n'est écrit dans l'app.
"""
import base64
import io
import sys
import time
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from PIL import Image

UA = {"User-Agent": "Mozilla/5.0 (Dropicards, visuels de produits)"}

for item in sys.argv[1].split():
    key, _, url = item.partition("=")
    try:
        with urlopen(Request(url, headers=UA), timeout=60) as r:
            data = r.read()
        im = Image.open(io.BytesIO(data)).convert("RGBA")
    except (HTTPError, URLError, TimeoutError, OSError) as e:
        print("MANQUE", key, e); continue
    orig = im.size
    im.thumbnail((2400, 2400), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, "WEBP", quality=92, method=6)
    b = base64.b64encode(buf.getvalue()).decode()
    print("TROUVE", key, orig, im.size)
    for k in range(0, len(b), 4000):
        print(f"IMG {key} {k // 4000} {b[k:k + 4000]}")
    time.sleep(0.5)
