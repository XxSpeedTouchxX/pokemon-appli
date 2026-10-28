#!/usr/bin/env python3
"""
make_pa_lotus.py : 3ᵉ série de propositions des PA (points d'Aura), 2026-10-28, demande du porteur.

Le porteur garde la forme « flamme d'âme » (G1 à G6, make_pa_soul.py) et demande :
- une couleur plus sombre, violette, spectrale ;
- au cœur de la flamme, le lotus de son logo (fleur au trait, cinq pétales, trois points) à la place de la spirale ;
- à la place des petites flammèches, de toutes petites orbes d'énergie.
Trois teintes proposées. Le lotus est redessiné au trait d'après l'image du porteur.

Sortie : tools/brand/pa/pa-h1.svg … pa-h3.svg et tools/brand/pa/planche-lotus.html.
Usage : python3 tools/brand/make_pa_lotus.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from make_pa_proposals import grad, rad, spark, svg  # noqa: E402
from make_pa_soul import halo  # noqa: E402

OUT = Path(__file__).with_name("pa")

# Deux formes, d'après les modèles envoyés par le porteur (2026-10-28). Unités : corps centré en 0, 0, base en
# y = 18. Courbes continues, trait régulier.
# Goutte (modèle : goutte d'eau brillante) : pointe fine qui s'incline à peine à gauche, fond bien rond.
SOUL2 = [("M", [(-2.5, -33)]),
         ("C", [(0, -27), (15, -13), (15, 3)]), ("C", [(15, 11.5), (8.5, 18), (0, 18)]),
         ("C", [(-8.5, 18), (-15, 11.5), (-15, 3)]), ("C", [(-15, -9), (-5, -18), (-3.6, -26)]),
         ("C", [(-3.1, -28.5), (-2.8, -31), (-2.5, -33)])]
# Flamme (modèle : pictogramme de feu plein) : grande pointe centrale, langue à gauche, petite langue à droite,
# base ronde. FLAME_IN (petite flamme intérieure) n'est plus utilisée : le porteur ne garde que le contour.
SOUL3 = [("M", [(0, 18)]),
         ("C", [(-10.5, 18), (-16.5, 10.5), (-16.5, 2)]), ("C", [(-16.5, -6), (-13, -12), (-9.5, -20)]),
         ("C", [(-8.5, -15), (-6.5, -12.5), (-4, -11)]), ("C", [(-4.5, -20), (-1, -28), (3, -34.5)]),
         ("C", [(2.6, -28), (5.2, -23), (8.5, -19.5)]), ("C", [(10, -21.5), (10.5, -24), (10, -26.5)]),
         ("C", [(14.5, -20), (16.5, -10), (16.5, 2)]), ("C", [(16.5, 10.5), (10.5, 18), (0, 18)])]
FLAME_IN = [("M", [(0, 15)]),
            ("C", [(-6.5, 15), (-10, 10.5), (-10, 5)]), ("C", [(-10, -1), (-6.5, -5), (-3.5, -10)]),
            ("C", [(-2.8, -6.5), (-1.2, -4.5), (0.8, -3.8)]), ("C", [(0.8, -7.5), (2.2, -11), (4.5, -13.5)]),
            ("C", [(8.5, -8), (10, -1), (10, 5)]), ("C", [(10, 10.5), (6.5, 15), (0, 15)])]
SHAPE = {"goutte": SOUL2, "flamme": SOUL3, "dedans": FLAME_IN}


def soul(cx, cy, k, fill, stroke="#111111", sw=2.6, shape="goutte"):
    d = ""
    for cmd, pts in SHAPE[shape]:
        d += cmd + " ".join(f"{cx + x * k:.2f} {cy + y * k:.2f}" for x, y in pts)
    return f'<path d="{d}Z" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round" stroke-linecap="round"/>'


def lotus(cx, cy, k, color, w):
    # Lotus au trait, en unités (environ 24 × 20) : pétale central, deux pétales intérieurs, deux extérieurs, trois
    # points au-dessus (d'après le logo du porteur ; la barre de base est retirée, 2026-10-28).
    def P(x, y):
        return f"{cx + x * k:.2f} {cy + y * k:.2f}"
    paths = [
        f"M{P(0, -8)} C{P(4, -4)} {P(4, 2)} {P(0, 7)} C{P(-4, 2)} {P(-4, -4)} {P(0, -8)} Z",
        f"M{P(0, 7)} C{P(-6, 5)} {P(-8.5, -1)} {P(-7, -6)} C{P(-3.5, -4.5)} {P(-1.2, -1)} {P(-0.6, 3)}",
        f"M{P(0, 7)} C{P(6, 5)} {P(8.5, -1)} {P(7, -6)} C{P(3.5, -4.5)} {P(1.2, -1)} {P(0.6, 3)}",
        f"M{P(-1, 7.2)} C{P(-8, 8)} {P(-12.5, 3.5)} {P(-12.5, -1.5)} C{P(-10.5, -1.5)} {P(-8.6, -0.8)} {P(-7.4, 0.3)}",
        f"M{P(1, 7.2)} C{P(8, 8)} {P(12.5, 3.5)} {P(12.5, -1.5)} C{P(10.5, -1.5)} {P(8.6, -0.8)} {P(7.4, 0.3)}",
    ]
    out = "".join(f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"/>' for d in paths)
    for x, y in ((0, -11.2), (-7.6, -8.8), (7.6, -8.8)):
        out += f'<circle cx="{cx + x * k:.2f}" cy="{cy + y * k:.2f}" r="{1.25 * k:.2f}" fill="{color}"/>'
    return out


def orb(x, y, r, core, glow):
    # Petite orbe d'énergie : cœur clair, contour fin, halo flou.
    return (f'<circle cx="{x}" cy="{y}" r="{r * 2.6}" fill="{glow}" filter="url(#gl)"/>'
            f'<circle cx="{x}" cy="{y}" r="{r * 1.5}" fill="{glow}" opacity="0.55"/>'
            f'<circle cx="{x}" cy="{y}" r="{r}" fill="{core}" stroke="#111111" stroke-width="0.9"/>'
            f'<circle cx="{x - r * 0.35}" cy="{y - r * 0.35}" r="{r * 0.35}" fill="#FFFFFF"/>')


def lotus_icon(title, stops, ring, glow, core_dark, lotus_color, orb_core, shape="goutte", drop=None):
    defs = ('<filter id="gl" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="2.4"/></filter>'
            '<filter id="lg" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.1"/></filter>'
            + rad("au", [(0, glow, 0.7), (0.6, glow, 0.22), (1, glow, 0)]) + grad("fl", stops)
            + rad("co", [(0, core_dark, 1), (0.7, core_dark, 0.85), (1, core_dark, 0)])
            + (grad("dg", drop, 0.5, 0, 0.5, 1) if drop else ""))
    body = '<circle cx="32" cy="34" r="30" fill="url(#au)"/>'
    body += halo(32, 47, 26, 7.5, -14, ring, "back")
    # Aura fantôme floue, puis la flamme d'âme.
    body += soul(32, 37, 1.02, glow, glow, 3, shape).replace('/>', ' filter="url(#gl)" opacity="' + ("0.6" if shape == "goutte" else "0.85") + '"/>')
    if shape == "goutte":
        # Goutte brillante : dégradé vertical sombre → lumineux, cœur sombre pour le lotus, éclat en bas à droite.
        body += soul(32, 37, 0.98, "url(#dg)", shape=shape)
        body += '<ellipse cx="32" cy="40.5" rx="10.5" ry="10" fill="url(#co)"/>'
        # Reflet blanc à gauche retiré (2026-10-28, porteur) ; l'éclat en bas à droite reste.
        body += '<ellipse cx="38.5" cy="48" rx="5" ry="3.6" fill="#FFFFFF" filter="url(#lg)" opacity="0.55" transform="rotate(-25 38.5 48)"/>'
        lx, ly = 32, 40
    else:
        body += soul(32, 37, 0.98, "url(#fl)", shape=shape)
        # Seulement le contour de la flamme du modèle (2026-10-28, porteur) ; à l'intérieur, le lotus sur un cœur sombre.
        body += '<ellipse cx="32" cy="41" rx="11" ry="10.5" fill="url(#co)"/>'
        lx, ly = 32, 40.5
    # Le lotus qui brille au fond (trait lumineux + lueur).
    body += f'<g filter="url(#lg)" opacity="0.95">{lotus(lx, ly, 0.78, lotus_color, 2.4)}</g>'
    body += lotus(lx, ly, 0.78, "#FFFFFF", 1.25)
    body += halo(32, 47, 26, 7.5, -14, ring, "front")
    # Orbes d'énergie à la place des flammèches.
    body += orb(11, 19, 2.0, orb_core, glow) + orb(54, 28, 1.6, orb_core, glow) + orb(9, 37, 1.2, orb_core, glow)
    body += spark(51, 8)
    return svg(title, defs, body)


TINTS = [
    ("Violet nuit", "Une flamme violet profond, presque noire à la base ; le lotus blanc brille au fond.",
     [(0, "#C9A6FF"), (0.4, "#7A3CF0"), (1, "#2A0E5C")], "#B08CFF", "#7A3CF0", "#12052B", "#D9C2FF", "#E6D6FF",
     [(0, "#1A0838"), (0.5, "#5B21C8"), (1, "#C4A2FF")]),
    ("Améthyste et spectre", "Le violet glisse vers un bleu spectral sur les bords, comme un feu follet.",
     [(0, "#B9E9FF"), (0.35, "#8C6CFF"), (1, "#2B1466")], "#8FD8FF", "#6C5CFF", "#0F0A2E", "#BFEFFF", "#D6F6FF",
     [(0, "#120E3A"), (0.5, "#4B3BD6"), (1, "#8FE3FF")]),
    ("Prune et violet", "Dans la couleur du logo du porteur : violet prune, lotus rosé.",
     [(0, "#F3B8E6"), (0.4, "#9B3C8F"), (1, "#3A0E3A")], "#E59BD6", "#9B3C8F", "#1E061E", "#FFD1F2", "#FFE1F6",
     [(0, "#2A0726"), (0.5, "#8A2A7E"), (1, "#F3A6E0")]),
]
V = {}
for i, (shape, label) in enumerate((("goutte", "Goutte d'âme"), ("flamme", "Flamme d'âme"))):
    for j, (color, idea, stops, ring, glow, dark, lot, orbc, drop) in enumerate(TINTS):
        V["h%d" % (i * 3 + j + 1)] = (label, color, ("Goutte brillante, d'après ton modèle : sombre en haut, lumineuse en bas, éclat en bas à droite. " if shape == "goutte" else "Le contour de ta flamme rouge, le lotus au cœur. ") + idea,
                                      lotus_icon("PA · " + label + " · " + color, stops, ring, glow, dark, lot, orbc, shape, drop))


def main():
    OUT.mkdir(exist_ok=True)
    cards = []
    for k, (name, color, idea, code) in V.items():
        (OUT / f"pa-{k}.svg").write_text(code, "utf-8")
        cards.append(f'''<figure><div class="big"><img src="pa-{k}.svg" alt=""></div>
<div class="row"><span class="pill y"><img src="pa-{k}.svg" alt="">120 PA</span><span class="pill d"><img src="pa-{k}.svg" alt="">120 PA</span></div>
<figcaption><b>{k.upper()} · {name}</b><span>{color}</span><em>{idea}</em></figcaption></figure>''')
    css = (OUT / "planche.html").read_text("utf-8").split("<style>")[1].split("</style>")[0]
    (OUT / "planche-lotus.html").write_text(f'''<!doctype html><html lang="fr"><meta charset="utf-8"><title>PA · lotus</title>
<style>{css}</style>
<h1>Points d'Aura · flamme d'âme et lotus</h1><p>La forme choisie, en violet sombre et spectral ; le lotus du logo au cœur ; de petites orbes d'énergie autour. En grand, puis à 22 px sur fond jaune et sombre.</p>
<main>{"".join(cards)}</main></html>
''', "utf-8")
    print(f"{len(V)} variantes : {OUT}")


if __name__ == "__main__":
    main()
