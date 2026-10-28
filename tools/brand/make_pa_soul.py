#!/usr/bin/env python3
"""
make_pa_soul.py : 2ᵉ série de propositions des PA (points d'Aura), 2026-10-28, demande du porteur.

Le porteur garde E (flamme d'évolution, spirale) et F (esprit, halo) et demande un style de flamme « soul » (flamme
d'âme) : corps rond, langues de feu qui s'enroulent, petites flammèches qui s'envolent ; la spirale de E brille au
cœur, le halo de F l'entoure (passe derrière puis devant la flamme). Six variantes de couleur et de forme.

Sortie : tools/brand/pa/pa-g1.svg … pa-g6.svg et tools/brand/pa/planche-soul.html.
Usage : python3 tools/brand/make_pa_soul.py
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from make_pa_proposals import INK, grad, rad, spark, svg  # noqa: E402

OUT = Path(__file__).with_name("pa")

# Flamme d'âme, en unités (corps centré en 0, 0 ; environ 30 × 47 unités), mise à l'échelle k et placée en (cx, cy).
SOUL = [("M", [(0, 18)]),
        ("C", [(-10, 18), (-15, 10), (-15, 3)]), ("C", [(-15, -5), (-10, -10), (-6, -15)]),
        ("C", [(-3, -19), (-3, -23), (-6, -27)]), ("C", [(0, -25), (2, -20), (1, -15)]),
        ("C", [(6, -20), (2, -26), (8, -34)]), ("C", [(16, -27), (17, -15), (13, -7)]),
        ("C", [(15, -2), (15, 4), (13, 9)]), ("C", [(10, 15), (6, 18), (0, 18)])]

def soul(cx, cy, k, fill, stroke=INK, sw=2.6):
    d = ""
    for cmd, pts in SOUL:
        d += cmd + " ".join(f"{cx + x * k:.2f} {cy + y * k:.2f}" for x, y in pts)
    return f'<path d="{d}Z" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round"/>'

def spiral(cx, cy, turns, rmax, color="#FFFFFF", w=2.4):
    pts = []
    for i in range(73):
        t = i / 72 * turns * 2 * math.pi
        r = 0.6 + (rmax - 0.6) * i / 72
        pts.append(f"{cx + r * math.cos(t - math.pi / 2):.2f} {cy + r * math.sin(t - math.pi / 2):.2f}")
    return f'<path d="M{" L".join(pts)}" fill="none" stroke="{color}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"/>'

def wisp(x, y, r, fill):
    # Petite flammèche qui s'envole : une flamme d'âme miniature.
    return soul(x, y, r / 8.0, fill, INK, 1.3)

def halo(cx, cy, rx, ry, rot, color, part, w=2.4):
    # Halo incliné : « back » = moitié du haut (derrière la flamme), « front » = moitié du bas (devant).
    a = math.radians(rot)
    x1, y1 = cx - rx * math.cos(a), cy - rx * math.sin(a)
    x2, y2 = cx + rx * math.cos(a), cy + rx * math.sin(a)
    sweep = 1 if part == "back" else 0
    op = ' opacity="0.55"' if part == "back" else ""
    return f'<path d="M{x1:.2f} {y1:.2f}A{rx} {ry} {rot} 0 {sweep} {x2:.2f} {y2:.2f}" fill="none" stroke="{color}" stroke-width="{w}" stroke-linecap="round"{op}/>'

def soul_icon(title, stops, ring, glow, wisps=True, sphere=None):
    defs = ('<filter id="gl" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="2.6"/></filter>'
            + rad("au", [(0, glow, 0.75), (0.6, glow, 0.25), (1, glow, 0)]) + grad("fl", stops)
            + grad("in", [(0, "#FFFFFF"), (1, stops[1][1])]))
    body = '<circle cx="32" cy="34" r="30" fill="url(#au)"/>'
    body += halo(32, 38, 27, 8, -16, ring, "back")
    if sphere:
        defs += rad("sp", [(0, sphere[0], 1), (1, sphere[1], 1)], 0.4, 0.35, 0.7)
        body += '<circle cx="32" cy="35" r="20" fill="url(#sp)" stroke="#111111" stroke-width="2.6"/>'
        body += soul(32, 36, 0.62, "url(#fl)", INK, 2) + spiral(32, 38, 1.75, 4.6, "#FFFFFF", 1.8)
    else:
        # Aura fantôme : la même flamme, floue et lumineuse, derrière.
        body += soul(32, 37, 1.02, stops[1][1], stops[1][1], 3).replace('/>', ' filter="url(#gl)" opacity="0.85"/>')
        body += soul(32, 37, 0.98, "url(#fl)")
        # Langue intérieure plus claire, puis la spirale au cœur.
        body += soul(32, 42, 0.5, "url(#in)", "none", 0)
        body += spiral(32, 42, 2.0, 7.2)
    body += halo(32, 38, 27, 8, -16, ring, "front")
    if wisps:
        body += wisp(12, 17, 1.9, stops[1][1]) + wisp(52, 27, 1.5, stops[1][1])
    body += spark(51, 8)
    return svg(title, defs, body)

V = {
    "g1": ("Âme spirale", "Rouge et or", "La flamme d'âme de E, son cœur en spirale, cerclée du halo de F.",
           soul_icon("PA · Âme spirale", [(0, "#FFF0B0"), (0.45, "#FFB21E"), (1, "#E3350D")], "#FFD60A", "#FFB21E")),
    "g2": ("Âme spirale", "Rose magenta", "La même, dans le rose de F.",
           soul_icon("PA · Âme spirale rose", [(0, "#FFE6F7"), (0.45, "#FF7AD9"), (1, "#C2187A")], "#FF7AD9", "#FF7AD9")),
    "g3": ("Âme spirale", "Violet aura", "La même, dans le violet actuel des PA.",
           soul_icon("PA · Âme spirale violette", [(0, "#F4DDFF"), (0.45, "#C084FF"), (1, "#6A2BD6")], "#C7A6FF", "#B26BFF")),
    "g4": ("Âme spectrale", "Bleu spectral", "Une flamme d'âme bleue, comme un feu follet, avec le halo.",
           soul_icon("PA · Âme spectrale", [(0, "#E8FDFF"), (0.45, "#7CF5FF"), (1, "#2E5BFF")], "#7CF5FF", "#2E9BFF")),
    "g5": ("Âme en orbite", "Rose et violet", "La sphère de F garde la flamme d'âme ; le halo tourne autour.",
           soul_icon("PA · Âme en orbite", [(0, "#FFE6F7"), (0.45, "#FF7AD9"), (1, "#8A2BD6")], "#FF7AD9", "#FF7AD9", True, ("#5A1745", "#1E0A2E"))),
    "g6": ("Âme d'éveil", "Or vers rose", "La flamme passe de l'or au rose, entre E et F.",
           soul_icon("PA · Âme d'éveil", [(0, "#FFF0B0"), (0.45, "#FF9A3C"), (1, "#E0218A")], "#FFD60A", "#FF9A3C")),
}


def main():
    OUT.mkdir(exist_ok=True)
    cards = []
    for k, (name, color, idea, code) in V.items():
        (OUT / f"pa-{k}.svg").write_text(code, "utf-8")
        cards.append(f'''<figure><div class="big"><img src="pa-{k}.svg" alt=""></div>
<div class="row"><span class="pill y"><img src="pa-{k}.svg" alt="">120 PA</span><span class="pill d"><img src="pa-{k}.svg" alt="">120 PA</span></div>
<figcaption><b>{k.upper()} · {name}</b><span>{color}</span><em>{idea}</em></figcaption></figure>''')
    css = (OUT / "planche.html").read_text("utf-8").split("<style>")[1].split("</style>")[0]
    (OUT / "planche-soul.html").write_text(f'''<!doctype html><html lang="fr"><meta charset="utf-8"><title>PA · flamme d'âme</title>
<style>{css}</style>
<h1>Points d'Aura · flamme d'âme (E + F)</h1><p>Corps rond, langues de feu qui s'enroulent, flammèches qui s'envolent ; spirale au cœur, halo autour. En grand, puis à 22 px sur fond jaune et sombre.</p>
<main>{"".join(cards)}</main></html>
''', "utf-8")
    print(f"{len(V)} variantes : {OUT}")


if __name__ == "__main__":
    main()
