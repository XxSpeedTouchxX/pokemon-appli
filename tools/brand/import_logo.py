#!/usr/bin/env python3
"""
import_logo.py : logo de l'en-tête et icônes de l'app, à partir du fichier du porteur (2026-10-07).

Source : tools/brand/source/dropicards-porteur.png (600 × 127, fond jaune #FFD60A), gardée telle quelle ; depuis le
2026-10-29, l'intérieur de la carte O est remplacé par la gemme des PK (pk_card, source/pk-512.png).

1. En-tête : le logo est repris exactement ; seul le fond jaune autour des lettres devient transparent. On part des
   bords de l'image et on avance sur les pixels qui mêlent le jaune du fond et le noir du contour, jamais au-delà du
   contour : les jaunes de la carte O et de l'éclair, enfermés dans le contour noir, sont gardés. Les pixels du bord
   du contour deviennent du noir semi-transparent (pas de liseré jaune sur un autre fond). Recadré au plus près.
2. Icônes de l'app (écran d'accueil du téléphone) : le mot, trop large pour un carré, est coupé entre le I et le C
   et posé sur deux lignes, « DROPI » au-dessus de « CARDS », sur le jaune du logo. Dans l'onglet du navigateur
   (16 à 32 px), le mot serait illisible : la carte O du logo, seule.

Sorties : web/img/brand/dropicards-header.png ; web/icons/icon-192.png, icon-512.png (carré arrondi bordé de noir,
coins transparents), icon-maskable-512.png (plein cadre, mot dans la zone sûre), apple-touch-icon.png (180, plein
cadre), favicon-32.png.
Usage : python3 tools/brand/import_logo.py   (Pillow)
"""
from collections import deque
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
SRC = Path(__file__).with_name("source") / "dropicards-porteur.png"
HEADER = ROOT / "web" / "img" / "brand" / "dropicards-header.png"
ICONS = ROOT / "web" / "icons"
BG, INK = (255, 214, 10), (17, 17, 17)  # jaune du fond et noir du contour, relevés sur le fichier
MARGIN = 2  # pixels transparents gardés autour du logo
SPLIT = 275  # colonne vide entre la carte I et le C, dans le logo recadré


def blend(p):
    """Position de p entre le fond (0) et le noir (1), et écart à ce mélange."""
    d = [k - b for k, b in zip(INK, BG)]
    t = sum((c - b) * dd for c, b, dd in zip(p, BG, d)) / sum(dd * dd for dd in d)
    t = min(1.0, max(0.0, t))
    off = sum((c - (b + t * dd)) ** 2 for c, b, dd in zip(p, BG, d)) ** 0.5
    return t, off


def transparent(im):
    """Fond jaune relié aux bords rendu transparent ; bord du contour en noir semi-transparent."""
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
    return im


def trim(im, margin=MARGIN):
    box = im.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
    w, h = im.size
    return im.crop((max(0, box[0] - margin), max(0, box[1] - margin), min(w, box[2] + margin), min(h, box[3] + margin)))


def two_lines(logo, width):
    """« DROPI » au-dessus de « CARDS », centrés, la ligne la plus large faisant `width` pixels."""
    top, bottom = trim(logo.crop((0, 0, SPLIT, logo.height)), 0), trim(logo.crop((SPLIT, 0, logo.width, logo.height)), 0)
    k = width / max(top.width, bottom.width)
    top = top.resize((round(top.width * k), round(top.height * k)), Image.LANCZOS)
    bottom = bottom.resize((round(bottom.width * k), round(bottom.height * k)), Image.LANCZOS)
    gap = round(6 * k)
    out = Image.new("RGBA", (max(top.width, bottom.width), top.height + gap + bottom.height), (0, 0, 0, 0))
    out.alpha_composite(top, ((out.width - top.width) // 2, 0))
    out.alpha_composite(bottom, ((out.width - bottom.width) // 2, top.height + gap))
    return out


def icon(size, content, rounded):
    """Carré jaune (bordé de noir, coins transparents si `rounded`), contenu centré."""
    s = 4  # dessin agrandi puis réduit : bords lisses
    base = Image.new("RGBA", (size * s, size * s), (0, 0, 0, 0))
    d = ImageDraw.Draw(base)
    if rounded:
        m, r, bw = round(size * s * 20 / 512), round(size * s * 112 / 512), round(size * s * 24 / 512)
        d.rounded_rectangle((m, m, size * s - m, size * s - m), r, fill=BG + (255,), outline=INK + (255,), width=bw)
    else:
        d.rectangle((0, 0, size * s, size * s), fill=BG + (255,))
    base = base.resize((size, size), Image.LANCZOS)
    base.alpha_composite(content, ((size - content.width) // 2, (size - content.height) // 2))
    return base


# Carte « O » (2026-10-29, porteur : « même logo, mais l'intérieur de la carte O remplacé par le logo des PK ») :
# le contour noir, le liseré blanc et le cadre noir intérieur de la carte sont gardés ; la face (disque étoilé, traits)
# est repeinte en jaune, avec la gemme des PK (web/img/brand/pk.svg, rendue en
# PNG dans source/pk-512.png) centrée sur la face.
PK = Path(__file__).with_name("source") / "pk-512.png"
O_SEED = (160, 46)  # un pixel jaune de la face de la carte O, dans le fichier du porteur (600 × 127)


def pk_card(im):
    """Remplace l'intérieur de la carte O par la gemme des PK ; renvoie une copie."""
    im = im.copy()
    w, h = im.size
    px = im.load()
    white = lambda p: min(p[:3]) > 170  # liseré blanc de la carte
    # Région entourée par le liseré blanc : remplissage depuis la face, arrêté par le blanc.
    seen, todo, region = {O_SEED}, deque([O_SEED]), []
    while todo:
        x, y = todo.popleft()
        region.append((x, y))
        for q in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= q[0] < w and 0 <= q[1] < h and q not in seen and not white(px[q]):
                seen.add(q)
                todo.append(q)
    if len(region) > 4000:
        raise SystemExit("carte O : le liseré blanc n'est pas fermé (%d pixels)" % len(region))
    xs, ys = [p[0] for p in region], [p[1] for p in region]
    box = (min(xs), min(ys), max(xs), max(ys))
    # Trous de la région (disque blanc du dessin d'origine, entouré de noir) : rattachés à la face.
    mask = Image.new("L", im.size, 0)
    mp = mask.load()
    for q in region:
        mp[q] = 255
    outside = {(box[0] - 1, box[1] - 1)}
    todo = deque(outside)
    while todo:
        x, y = todo.popleft()
        for q in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if box[0] - 1 <= q[0] <= box[2] + 1 and box[1] - 1 <= q[1] <= box[3] + 1 and q not in outside and not (0 <= q[0] < w and 0 <= q[1] < h and mp[q]):
                outside.add(q)
                todo.append(q)
    for x in range(box[0], box[2] + 1):
        for y in range(box[1], box[3] + 1):
            if (x, y) not in outside:
                mp[x, y] = 255
    # Face jaune : la région rognée de 2 px, pour garder intact le cadre noir intérieur d'origine (bords adoucis).
    from PIL import ImageFilter
    face = mask.filter(ImageFilter.MinFilter(5))
    im.paste(BG + (255,), (0, 0), face.filter(ImageFilter.GaussianBlur(0.5)))
    fb = face.getbbox()
    fw, fh = fb[2] - fb[0], fb[3] - fb[1]
    gem = Image.open(PK).convert("RGBA")
    gem = gem.crop(gem.getchannel("A").getbbox())
    k = min(fw * 0.86 / gem.width, fh * 0.86 / gem.height)
    gem = gem.resize((max(1, round(gem.width * k)), max(1, round(gem.height * k))), Image.LANCZOS)
    im.alpha_composite(gem, (fb[0] + (fw - gem.width) // 2, fb[1] + (fh - gem.height) // 2))
    return im


def main():
    logo = trim(transparent(pk_card(Image.open(SRC).convert("RGBA"))))
    logo.save(HEADER, optimize=True)
    print(f"{HEADER.relative_to(ROOT)} : {logo.width} × {logo.height}")
    ICONS.mkdir(parents=True, exist_ok=True)
    # Icônes de l'app : depuis le 2026-10-11, monogramme « D » + carte O (make_icons.mjs) ; ici le favicon seulement.
    card = trim(logo.crop((SPLIT - 151, 0, SPLIT - 100, logo.height)), 0)  # la carte O
    k = 28 / card.height
    card = card.resize((round(card.width * k), 28), Image.LANCZOS)
    icon(32, card, False).save(ICONS / "favicon-32.png", optimize=True)
    print("Icône : favicon-32.png")


if __name__ == "__main__":
    main()
