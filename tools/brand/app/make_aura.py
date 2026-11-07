#!/usr/bin/env python3
"""Cristaux d'Aura : images originales de l'app iOS et Android à la place des sprites des jeux Pokémon.

Décision du porteur (2026-11-07) : dans l'app des stores, remplacer les sprites des jeux vidéo Pokémon par des
éléments originaux. Chaque compagnon du Bestiaire (ex-« Pokédex ») devient un cristal d'Aura dessiné ici, au pixel,
sans rien reprendre des jeux :
- couleur du cristal : son premier type, cœur et éclats : son deuxième type (ou une teinte plus claire) ;
- forme selon le stade : orbe ronde (forme de base), gemme taillée (1re évolution), cristal élancé (2e évolution),
  étoile de cristal à liseré d'or (légendaires et fabuleux), cristal entouré d'un anneau d'aura (méga-évolutions) ;
- deux petits yeux, pour en faire un compagnon ; la mascotte du didacticiel parle (bouche ouverte et fermée, sourire).

Les images gardent les noms, tailles et cadrages des sprites qu'elles remplacent (web/img/pokemon/, boîtes et centres
de tools/sprites/dex.json) : les écrans de l'app (accueil, Bestiaire, arbre d'évolution, didacticiel) restent alignés
sans changer leur code. Le site dropicards.fr garde les sprites (décision du porteur du 2026-10-03).

Sortie : mobile/overlay/img/pokemon/ ({n}.gif animé, {n}.png fixe 96 × 96, icon/{n}.png, talk/{n}-0..3.png),
copiée par-dessus web/ par le build de l'app (tools/web/build.mjs, DROPI_APP=1).
Régénérer : python3 tools/brand/app/make_aura.py (Pillow). Le résultat ne dépend que de dex.json : identique à chaque fois.
"""
import json
import math
import os
import shutil
from PIL import Image, ImageDraw

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
DEX = json.load(open(os.path.join(ROOT, 'tools/sprites/dex.json'), encoding='utf-8'))['dex']
OUT = os.path.join(ROOT, 'mobile/overlay/img/pokemon')
TALK = (1, 4, 7, 25)  # starters : mascotte du didacticiel
GC_FIX = {42: 0.48}   # mêmes corrections de centre que tools/web/dex.js (DEX_GC_FIX)

INK = (17, 17, 17, 255)
TYPE = {
    'Plante': (76, 186, 84), 'Feu': (246, 110, 44), 'Eau': (59, 139, 255), 'Électrik': (255, 206, 0),
    'Psy': (255, 92, 160), 'Glace': (110, 222, 240), 'Dragon': (112, 92, 255), 'Ténèbres': (98, 82, 104),
    'Fée': (255, 150, 214), 'Normal': (200, 190, 166), 'Combat': (206, 70, 48), 'Vol': (150, 182, 255),
    'Poison': (166, 84, 206), 'Sol': (222, 168, 84), 'Roche': (186, 160, 98), 'Insecte': (166, 196, 36),
    'Spectre': (124, 98, 190), 'Acier': (168, 186, 204),
}
GOLD = (255, 214, 10)


def mix(a, b, t):
    return tuple(int(round(a[i] + (b[i] - a[i]) * t)) for i in range(3))


def light(c, t):
    return mix(c, (255, 255, 255), t)


def dark(c, t):
    return mix(c, (0, 0, 0), t)


BY_N = {e['n']: e for e in DEX}


def stage(e):
    k, x = 0, e
    while x and x.get('from') and k < 3:
        k += 1
        x = BY_N.get(x['from'])
    return k


def kind(e):
    if e.get('mega'):
        return 'mega'
    if e.get('leg'):
        return 'leg'
    return ('orb', 'gem', 'crystal')[min(stage(e), 2)]


def outline(cx, top, bot, w, k):
    """Contour du cristal (liste de points), centré en cx, de top à bot, largeur w."""
    h = bot - top
    hw = w / 2
    if k == 'orb':
        pts = []
        for i in range(48):
            a = 2 * math.pi * i / 48
            pts.append((cx + hw * math.cos(a), top + h / 2 + h / 2 * math.sin(a)))
        return pts
    if k == 'gem':  # gemme taillée : table plate en haut, pointe en bas
        return [(cx - hw * 0.55, top), (cx + hw * 0.55, top), (cx + hw, top + h * 0.34),
                (cx, bot), (cx - hw, top + h * 0.34)]
    if k in ('crystal', 'mega'):  # cristal élancé : pointes en haut et en bas
        return [(cx, top), (cx + hw, top + h * 0.26), (cx + hw * 0.86, top + h * 0.78),
                (cx, bot), (cx - hw * 0.86, top + h * 0.78), (cx - hw, top + h * 0.26)]
    # étoile de cristal (légendaires) : 8 branches
    pts = []
    cy = top + h / 2
    for i in range(16):
        a = -math.pi / 2 + math.pi * i / 8
        r = 1.0 if i % 2 == 0 else 0.62
        pts.append((cx + hw * r * math.cos(a), cy + h / 2 * r * math.sin(a)))
    return pts


def draw_cristal(img, cx, top, bot, w, e, frame=0, frames=1, face=0, talking=False):
    """Dessine le cristal de e dans img. face : 0 yeux ouverts, 1 bouche ouverte, 2 sourire bouche ouverte,
    3 sourire bouche fermée (didacticiel), -1 sans visage."""
    d = ImageDraw.Draw(img)
    k = kind(e)
    types = e.get('types') or ['Normal']
    c1 = TYPE.get(types[0], TYPE['Normal'])
    c2 = TYPE.get(types[1], light(c1, 0.45)) if len(types) > 1 else light(c1, 0.45)
    h = bot - top
    if h < 6 or w < 6:
        return
    if k == 'mega':  # anneau d'aura derrière le cristal
        ring = Image.new('RGBA', img.size, (0, 0, 0, 0))
        rd = ImageDraw.Draw(ring)
        rw, rh = w * 1.12, h * 0.34
        cy = top + h * 0.55
        rd.ellipse([cx - rw / 2, cy - rh / 2, cx + rw / 2, cy + rh / 2], outline=GOLD + (255,), width=max(2, int(h / 26)))
        rd.ellipse([cx - rw / 2 + 2, cy - rh / 2 + 2, cx + rw / 2 - 2, cy + rh / 2 - 2], outline=(170, 110, 255, 200), width=1)
        img.alpha_composite(ring)
        d = ImageDraw.Draw(img)
    pts = outline(cx, top, bot, w, k)
    d.polygon(pts, fill=c1 + (255,), outline=INK)
    # Facettes : clair en haut à gauche, sombre en bas à droite, cœur du second type.
    cy = top + h * (0.5 if k in ('orb', 'leg') else 0.42)
    hl = [(x, y) for (x, y) in pts if x <= cx + 0.5 and y <= cy + 0.5]
    if len(hl) >= 2:
        d.polygon([(cx, cy)] + hl, fill=light(c1, 0.35) + (255,))
    sh = [(x, y) for (x, y) in pts if x >= cx - 0.5 and y >= cy - 0.5]
    if len(sh) >= 2:
        d.polygon([(cx, cy)] + sh, fill=dark(c1, 0.22) + (255,))
    # Cœur du second type, sous le visage (une petite gemme dans le bas du cristal).
    # Pas de cœur sur la mascotte qui parle (la bouche est à sa place).
    core, ky = (0.15, top + h * 0.83) if k == 'orb' else (0.22, top + h * (0.74 if k != 'gem' else 0.62))
    if not talking:
        d.polygon([(cx + (x - cx) * core, ky + (y - cy) * core) for (x, y) in pts], fill=c2 + (255,), outline=dark(c2, 0.35) + (255,))
    d.polygon(pts, outline=INK)
    if k == 'leg':  # liseré d'or
        d.polygon([(cx + (x - cx) * 0.86, cy + (y - cy) * 0.86) for (x, y) in pts], outline=GOLD + (255,))
    # Reflet qui balaie le cristal (animation) et éclat fixe.
    t = frame / max(1, frames)
    sx = cx - w / 2 + (w * 1.4) * t - w * 0.2
    shine = Image.new('RGBA', img.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shine)
    sw = max(2, w * 0.12)
    sd.polygon([(sx, top), (sx + sw, top), (sx + sw - h * 0.35, bot), (sx - h * 0.35, bot)], fill=(255, 255, 255, 110))
    mask = Image.new('L', img.size, 0)
    ImageDraw.Draw(mask).polygon(pts, fill=255)
    shine.putalpha(Image.composite(shine.getchannel('A'), Image.new('L', img.size, 0), mask))
    img.alpha_composite(shine)
    d = ImageDraw.Draw(img)
    gx, gy = cx - w * 0.2, top + h * (0.22 if k != 'gem' else 0.16)
    gs = max(1, int(min(w, h) / 18))
    d.rectangle([gx, gy, gx + gs, gy + gs], fill=(255, 255, 255, 255))
    # Étincelle qui scintille (2 images sur 8).
    if frames > 1 and frame in (2, 3):
        px, py = cx + w * 0.34, top + h * 0.12
        s = max(1, int(min(w, h) / 14))
        d.line([(px - s, py), (px + s, py)], fill=(255, 255, 255, 255))
        d.line([(px, py - s), (px, py + s)], fill=(255, 255, 255, 255))
    # Visage : deux yeux, et pour la mascotte qui parle, une bouche.
    if face >= 0:
        ey = top + h * (0.48 if k in ('orb', 'leg') else 0.42)
        ex = max(2, w * 0.14)
        es = max(1, int(min(w, h) / 13))
        for side in (-1, 1):
            x0 = cx + side * ex - es / 2
            if face in (2, 3):  # yeux fermés « ^ ^ » (sourire)
                d.line([(x0 - es * 0.4, ey + es), (x0 + es / 2, ey - es * 0.2), (x0 + es * 1.4, ey + es)], fill=INK, width=1)
            else:
                d.rectangle([x0, ey - es, x0 + es, ey + es], fill=INK)
                d.point((x0 + es * 0.25, ey - es * 0.7), fill=(255, 255, 255, 255))
        my = ey + es * 2.2
        mw = max(2, w * 0.10)
        if face in (1, 2):
            d.ellipse([cx - mw, my - es * 0.6, cx + mw, my + es * 1.6], fill=(60, 10, 30, 255), outline=INK)
            d.rectangle([cx - mw * 0.5, my + es * 0.7, cx + mw * 0.5, my + es * 1.2], fill=(255, 120, 150, 255))
        elif face == 3:
            d.arc([cx - mw, my - es, cx + mw, my + es * 1.2], 20, 160, fill=INK, width=1)
        else:
            d.line([(cx - mw * 0.6, my), (cx + mw * 0.6, my)], fill=INK, width=1)


def body_w(box_w, h, k):
    """Largeur du cristal : celle de la boîte du sprite, bornée pour garder une forme lisible."""
    ratio = {'orb': (0.8, 1.15), 'gem': (0.75, 1.2), 'crystal': (0.55, 0.85), 'mega': (0.6, 0.9), 'leg': (0.85, 1.1)}[k]
    return max(h * ratio[0], min(box_w, h * ratio[1]))


def still(e, face=0):
    """Image fixe 96 × 96 : cristal dans la boîte du sprite, centré sur le centre de son corps (pc)."""
    x0, y0, x1, y1 = e['box']
    img = Image.new('RGBA', (96, 96), (0, 0, 0, 0))
    k = kind(e)
    h = y1 - y0
    w = body_w(x1 - x0, h, k)
    cx = e.get('pc') or (x0 + x1) / 2
    cx = min(max(cx, w / 2 + 1), 95 - w / 2)
    draw_cristal(img, cx, y0, y1 - 1, w, e, face=face)
    return img


def anim(e):
    """GIF animé à la taille du GIF d'origine : cristal centré sur gc, posé en bas (gb), reflet qui balaie."""
    gw, gh = e['gif']
    k = kind(e)
    gc = GC_FIX.get(e['n'], e.get('gc') or 0.5)
    bot = gh * (1 - (e.get('gb') or 0)) - 1
    h = bot - 1
    w = min(body_w(gw, h, k), gw - 2)
    cx = min(max(gc * gw, w / 2 + 1), gw - 1 - w / 2)
    frames = []
    for f in range(8):
        img = Image.new('RGBA', (gw, gh), (0, 0, 0, 0))
        draw_cristal(img, cx, 1, bot, w, e, frame=f, frames=8)
        frames.append(img)
    return frames


def save_gif(frames, path):
    pal = []
    for im in frames:
        p = im.convert('RGBA')
        alpha = p.getchannel('A')
        q = p.convert('RGB').quantize(colors=255, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
        q.paste(255, mask=Image.eval(alpha, lambda a: 255 if a < 128 else 0))
        pal.append(q)
    pal[0].save(path, save_all=True, append_images=pal[1:], duration=120, loop=0, transparency=255, disposal=2, optimize=False)


def icon(e):
    """Icône 96 × 96 : le cristal à la taille de la boîte du sprite, centré."""
    x0, y0, x1, y1 = e['box']
    img = Image.new('RGBA', (96, 96), (0, 0, 0, 0))
    k = kind(e)
    h = y1 - y0
    w = body_w(x1 - x0, h, k)
    top = (96 - h) / 2
    draw_cristal(img, 48, top, top + h - 1, w, e)
    return img


def talk(e, face):
    """Mascotte du didacticiel : 52 × 54, cristal entier avec visage (bouche fermée, ouverte, sourires)."""
    img = Image.new('RGBA', (52, 54), (0, 0, 0, 0))
    draw_cristal(img, 26, 4, 52, 44, e, face=face, talking=True)
    return img


def main():
    if os.path.isdir(OUT):
        shutil.rmtree(OUT)
    os.makedirs(os.path.join(OUT, 'icon'))
    os.makedirs(os.path.join(OUT, 'talk'))
    for e in DEX:
        n = e['n']
        save_gif(anim(e), os.path.join(OUT, '%d.gif' % n))
        still(e).save(os.path.join(OUT, '%d.png' % n), optimize=True)
        icon(e).save(os.path.join(OUT, 'icon', '%d.png' % n), optimize=True)
    for n in TALK:
        for face, name in ((0, 0), (1, 1), (2, 2), (3, 3)):
            talk(BY_N[n], face).save(os.path.join(OUT, 'talk', '%d-%d.png' % (n, name)), optimize=True)
    print('Cristaux d’Aura : %d compagnons (GIF, image fixe, icône), mascotte des %d starters' % (len(DEX), len(TALK)))


if __name__ == '__main__':
    main()
