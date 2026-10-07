#!/usr/bin/env python3
"""
import_header.py : logo de l'en-tête de l'app, à partir du fichier du porteur (2026-10-07).

Source : tools/brand/source/dropicards-porteur.png (600 × 127, fond jaune #FFD60A), gardée telle quelle.
Le logo est repris exactement : seul le fond jaune autour des lettres devient transparent. On part des bords de
l'image et on avance sur les pixels qui mêlent le jaune du fond et le noir du contour, jamais au-delà du contour :
les jaunes de la carte O et de l'éclair, enfermés dans le contour noir, sont gardés. Les pixels du bord du contour
deviennent du noir semi-transparent (pas de liseré jaune sur un autre fond). L'image est ensuite recadrée au plus près.

Sortie : web/img/brand/dropicards-header.png
Usage : python3 tools/brand/import_header.py   (Pillow)
"""
from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SRC = Path(__file__).with_name("source") / "dropicards-porteur.png"
OUT = ROOT / "web" / "img" / "brand" / "dropicards-header.png"
BG, INK = (255, 214, 10), (17, 17, 17)  # jaune du fond et noir du contour, relevés sur le fichier
MARGIN = 2  # pixels transparents gardés autour du logo


def blend(p):
    """Position de p entre le fond (0) et le noir (1), et écart à ce mélange."""
    d = [k - b for k, b in zip(INK, BG)]
    t = sum((c - b) * dd for c, b, dd in zip(p, BG, d)) / sum(dd * dd for dd in d)
    t = min(1.0, max(0.0, t))
    off = sum((c - (b + t * dd)) ** 2 for c, b, dd in zip(p, BG, d)) ** 0.5
    return t, off


def main():
    im = Image.open(SRC).convert("RGBA")
    w, h = im.size
    px = im.load()
    seen = bytearray(w * h)
    queue = deque((x, y) for x in range(w) for y in (0, h - 1))
    queue.extend((x, y) for y in range(h) for x in (0, w - 1))
    while queue:
        x, y = queue.popleft()
        if seen[y * w + x]:
            continue
        r, g, b, a = px[x, y]
        t, off = blend((r, g, b))
        if off > 40 or t > 0.9:  # ni fond ni bord du contour : on s'arrête
            continue
        seen[y * w + x] = 1
        px[x, y] = INK + (round(255 * t),)
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx]:
                queue.append((nx, ny))
    box = im.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
    box = (max(0, box[0] - MARGIN), max(0, box[1] - MARGIN), min(w, box[2] + MARGIN), min(h, box[3] + MARGIN))
    out = im.crop(box)
    out.save(OUT, optimize=True)
    print(f"{OUT.relative_to(ROOT)} : {out.width} × {out.height}, {OUT.stat().st_size // 1024} Ko")


if __name__ == "__main__":
    main()
