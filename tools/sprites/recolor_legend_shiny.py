"""Shiny « maison » des 3 légendaires de Hoenn pour l'avatar (2026-11-12, porteur).

- Kyogre : violet clair (lavande), à partir du sprite normal (bleu).
- Groudon : doré, comme Groudon ☆ (EX Espèces Delta 111/113), à partir du sprite normal (rouge).
- Rayquaza : noir, écailles un peu dorées et rouges, comme Rayquaza ☆ (EX Deoxys 107/107), à partir du sprite normal (vert).

Écrit web/img/pokemon/shiny/382.png, 383.png et 384.png. À relancer après fetch_shiny.py (qui remet les shiny officiels).
Usage : python3 tools/sprites/recolor_legend_shiny.py
"""
import colorsys
import os
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), '..', '..', 'web', 'img', 'pokemon')


def recolor(src, fn):
    im = Image.open(src).convert('RGBA')
    px = im.load()
    for y in range(im.size[1]):
        for x in range(im.size[0]):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
            out = fn(h * 360, l, s)
            if out is None:
                continue
            h2, l2, s2 = out
            r2, g2, b2 = colorsys.hls_to_rgb((h2 % 360) / 360, max(0, min(1, l2)), max(0, min(1, s2)))
            px[x, y] = (round(r2 * 255), round(g2 * 255), round(b2 * 255), a)
    return im


def kyogre(h, l, s):
    # Bleus du corps (≈ 195-250°) → lavande (≈ 268°), plus clairs ; le rouge, le blanc et le noir ne bougent pas.
    if 185 <= h <= 255 and s > 0.25:
        return 270 + (h - 220) * 0.2, 0.40 + l * 0.7, s * 0.62
    return None


def groudon(h, l, s):
    # Rouges du corps (≈ 340-20°) → or (≈ 44°), éclaircis ; gris, blanc, noir gardés.
    if (h >= 335 or h <= 22) and s > 0.35:
        return 44 + (l - 0.45) * 12, 0.22 + l * 0.85, min(1, s * 0.95 + 0.05)
    return None


def rayquaza(h, l, s):
    # Corps vert → noir profond (ombres gardées) ; marques jaunes → or ; accents rouges plus vifs.
    if 40 <= h <= 72 and s > 0.35:          # anneaux jaunes
        return 45, min(0.6, max(0.42, l)), 0.88
    if (h >= 330 or h <= 18) and s > 0.3:   # rouge (bouche, ailerons)
        return 356, l * 0.9, min(1, s * 1.1)
    if 95 <= h <= 200 and s > 0.15:         # vert du corps
        return 220, 0.05 + l * 0.32, 0.18
    return None


if __name__ == '__main__':
    recolor(os.path.join(ROOT, '382.png'), kyogre).save(os.path.join(ROOT, 'shiny', '382.png'))
    recolor(os.path.join(ROOT, '383.png'), groudon).save(os.path.join(ROOT, 'shiny', '383.png'))
    recolor(os.path.join(ROOT, '384.png'), rayquaza).save(os.path.join(ROOT, 'shiny', '384.png'))
    print('382, 383, 384 : shiny maison écrits')
