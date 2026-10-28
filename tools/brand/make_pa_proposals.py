#!/usr/bin/env python3
"""
make_pa_proposals.py : propositions d'illustration des PA (points d'Aura), 2026-10-28, demande du porteur.

L'idée du porteur : une flamme ou une âme au plus profond de l'individu, comme le chakra ou le nen des mangas, la
petite flamme qui permet de devenir une meilleure version de soi et d'évoluer. Chaque proposition montre donc une
silhouette ou un réceptacle sombre, et la flamme qui brille à l'intérieur ; une couleur par proposition.
Même style que la gemme des PK : contour noir épais, dégradés vifs, une étincelle.

Sortie : tools/brand/pa/pa-<lettre>.svg (64 × 64) et tools/brand/pa/planche.html (planche de comparaison).
Usage : python3 tools/brand/make_pa_proposals.py
"""
from pathlib import Path

OUT = Path(__file__).with_name("pa")
INK = "#111111"

# Flamme intérieure, centrée en (cx, cy), hauteur h : pointe en haut, ventre rond, petite langue à gauche.
def flame(cx, cy, h, fill, stroke=INK, sw=2.0):
    s = h / 20.0
    p = lambda x, y: f"{cx + x * s:.2f} {cy + y * s:.2f}"
    d = (f"M{p(0, -10)} C{p(3, -5.5)} {p(7, -3)} {p(7, 2)} C{p(7, 6.5)} {p(4, 10)} {p(0, 10)} "
         f"C{p(-4, 10)} {p(-7, 6.5)} {p(-7, 2)} C{p(-7, -1)} {p(-5, -3)} {p(-3.5, -5.5)} "
         f"C{p(-3, -3)} {p(-1.5, -2)} {p(-0.5, -2)} C{p(-1, -4.5)} {p(-0.7, -7.5)} {p(0, -10)} Z")
    return f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round"/>'

def core(cx, cy, h):
    # Cœur blanc de la flamme.
    return flame(cx, cy + h * 0.12, h * 0.48, "#FFFFFF", "none", 0)

def spark(x, y, r=4):
    return (f'<path d="M{x} {y - r}Q{x + r * 0.25} {y - r * 0.25} {x + r} {y}Q{x + r * 0.25} {y + r * 0.25} {x} {y + r}'
            f'Q{x - r * 0.25} {y + r * 0.25} {x - r} {y}Q{x - r * 0.25} {y - r * 0.25} {x} {y - r}Z" fill="#FFFFFF" stroke="{INK}" stroke-width="1.5" stroke-linejoin="round"/>')

def spiral(cx, cy, turns, rmax):
    # Spirale d'Archimède partant du centre, tracée en blanc.
    import math
    n = 72
    pts = []
    for i in range(n + 1):
        t = i / n * turns * 2 * math.pi
        r = 0.6 + (rmax - 0.6) * i / n
        pts.append(f"{cx + r * math.cos(t - math.pi / 2):.2f} {cy + r * math.sin(t - math.pi / 2):.2f}")
    return f'<path d="M{" L".join(pts)}" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>'

def svg(title, defs, body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="PA"><title>{title}</title>'
            f'<defs>{defs}</defs>{body}</svg>\n')

def grad(id_, stops, x1=0.3, y1=0, x2=0.7, y2=1):
    s = "".join(f'<stop offset="{o}" stop-color="{c}"/>' for o, c in stops)
    return f'<linearGradient id="{id_}" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}">{s}</linearGradient>'

def rad(id_, stops, cx=0.5, cy=0.5, r=0.5):
    s = "".join(f'<stop offset="{o}" stop-color="{c}"{" stop-opacity=" + chr(34) + str(a) + chr(34) if a is not None else ""}/>' for o, c, a in stops)
    return f'<radialGradient id="{id_}" cx="{cx}" cy="{cy}" r="{r}">{s}</radialGradient>'

P = {}

# A · Âme ardente (violet) : silhouette d'un être, la flamme brûle dans sa poitrine, aura autour.
P["a"] = ("Âme ardente", "Violet", "La silhouette d'un être, et la flamme qui brûle dans sa poitrine ; son aura déborde autour de lui.", svg(
    "PA · Âme ardente",
    rad("au", [(0, "#B26BFF", 0.75), (0.6, "#7A3CF0", 0.35), (1, "#5B2BD6", 0)]) + grad("bo", [(0, "#2A1A55"), (1, "#120B2A")])
    + grad("fl", [(0, "#F4DDFF"), (0.45, "#C084FF"), (1, "#7A3CF0")]),
    '<circle cx="32" cy="34" r="30" fill="url(#au)"/>'
    '<circle cx="32" cy="19" r="9" fill="url(#bo)" stroke="#111111" stroke-width="2.6"/>'
    '<path d="M11 60C11 45 19 33 32 33C45 33 53 45 53 60Z" fill="url(#bo)" stroke="#111111" stroke-width="2.6" stroke-linejoin="round"/>'
    '<circle cx="32" cy="46" r="10" fill="#B26BFF" opacity="0.35"/>'
    + flame(32, 45, 19, "url(#fl)") + core(32, 45, 19) + spark(52, 10)))

# B · Chakra (or) : un être en méditation, roue de chakra derrière, flamme d'or au centre de la poitrine.
P["b"] = ("Chakra", "Or et orange", "Un être en méditation ; la roue du chakra tourne derrière lui, la flamme d'or brille au centre.", svg(
    "PA · Chakra",
    rad("au", [(0, "#FFE46B", 0.8), (0.55, "#FFB21E", 0.35), (1, "#FF7A00", 0)]) + grad("bo", [(0, "#3A2410"), (1, "#1C1006")])
    + grad("fl", [(0, "#FFF6C2"), (0.45, "#FFD60A"), (1, "#FF8A00")]),
    '<circle cx="32" cy="33" r="30" fill="url(#au)"/>'
    '<circle cx="32" cy="33" r="25" fill="none" stroke="#FFB21E" stroke-width="1.6" stroke-dasharray="3 3.2" opacity="0.9"/>'
    '<circle cx="32" cy="33" r="19" fill="none" stroke="#FFD60A" stroke-width="1.2" opacity="0.8"/>'
    '<circle cx="32" cy="14" r="6.5" fill="url(#bo)" stroke="#111111" stroke-width="2.4"/>'
    '<path d="M32 21.5C38 21.5 41 25.5 41 31L42 40C48 42 54 44.5 56 49C56 53.5 50 54.5 44 53.5L32 51.5L20 53.5C14 54.5 8 53.5 8 49C10 44.5 16 42 22 40L23 31C23 25.5 26 21.5 32 21.5Z" fill="url(#bo)" stroke="#111111" stroke-width="2.4" stroke-linejoin="round"/>'
    '<circle cx="32" cy="34" r="8" fill="#FFD60A" opacity="0.35"/>'
    + flame(32, 33.5, 15, "url(#fl)") + core(32, 33.5, 15) + spark(54, 11)))

# C · Nen (vert émeraude) : l'aura en flammes enveloppe un petit être ; son cœur brille vert et blanc.
P["c"] = ("Nen", "Vert émeraude", "L'aura monte en flammes autour d'un petit être ; tout au fond, son cœur brille.", svg(
    "PA · Nen",
    grad("au", [(0, "#B9FFD9"), (0.5, "#2FD37A"), (1, "#0B7A47")]) + grad("bo", [(0, "#123A2C"), (1, "#06170F")])
    + rad("co", [(0, "#FFFFFF", 1), (0.45, "#9BFFC8", 1), (1, "#2FD37A", 0)]),
    '<path d="M32 3C34 9 38.5 9.5 40.5 4C46 10 53 18 53 31C53 47 44 60 32 60C20 60 11 47 11 31C11 21 16 12 22 6C23.5 11 27.5 12.5 29 9C30 7 31 5 32 3Z" fill="url(#au)" stroke="#111111" stroke-width="2.6" stroke-linejoin="round"/>'
    '<path d="M32 22C40 22 44 31 44 39C44 47.5 39 52 32 52C25 52 20 47.5 20 39C20 31 24 22 32 22Z" fill="url(#bo)" stroke="#111111" stroke-width="2.4"/>'
    '<circle cx="32" cy="40" r="9" fill="url(#co)"/>'
    + flame(32, 39.5, 12, "#9BFFC8", INK, 1.6) + core(32, 39.5, 12) + spark(52, 9)))

# D · Cœur d'éveil (bleu glacier) : un cœur de cristal, la flamme bleue au fond.
P["d"] = ("Cœur d'éveil", "Bleu glacier", "Un cœur de cristal ; au plus profond, une flamme bleue qui ne s'éteint jamais.", svg(
    "PA · Cœur d'éveil",
    rad("au", [(0, "#7CF5FF", 0.7), (0.6, "#2E9BFF", 0.3), (1, "#1E5BFF", 0)]) + grad("bo", [(0, "#1E3A7A"), (1, "#0A1530")])
    + grad("fl", [(0, "#E8FDFF"), (0.45, "#7CF5FF"), (1, "#2E7BFF")]),
    '<circle cx="32" cy="34" r="30" fill="url(#au)"/>'
    '<path d="M32 57L9.5 33C3.5 26 6.5 13.5 17 12.5C24 12 29 15.5 32 20.5C35 15.5 40 12 47 12.5C57.5 13.5 60.5 26 54.5 33Z" fill="url(#bo)" stroke="#111111" stroke-width="2.6" stroke-linejoin="round"/>'
    '<path d="M17 16L23 26L32 20.5M47 16L41 26L32 20.5M23 26L32 57M41 26L32 57M9.5 28L23 26M54.5 28L41 26" fill="none" stroke="#7CF5FF" stroke-width="1" opacity="0.45"/>'
    '<circle cx="32" cy="36" r="9" fill="#7CF5FF" opacity="0.3"/>'
    + flame(32, 35, 17, "url(#fl)") + core(32, 35, 17) + spark(53, 9)))

# E · Flamme d'évolution (rouge et or) : la flamme s'enroule en spirale, comme une évolution qui commence.
P["e"] = ("Flamme d'évolution", "Rouge et or", "La flamme intérieure s'enroule en spirale : l'évolution qui commence.", svg(
    "PA · Flamme d'évolution",
    rad("au", [(0, "#FFB21E", 0.6), (1, "#E3350D", 0)]) + grad("fl", [(0, "#FFF0B0"), (0.4, "#FFB21E"), (1, "#E3350D")]),
    '<circle cx="32" cy="36" r="28" fill="url(#au)"/>'
    + flame(32, 34, 52, "url(#fl)", INK, 2.6)
    + spiral(32, 41, 2.25, 10)
    + '<circle cx="12" cy="44" r="2.2" fill="#FFD60A" stroke="#111111" stroke-width="1.2"/><circle cx="51" cy="50" r="1.8" fill="#FFD60A" stroke="#111111" stroke-width="1.2"/>'
    + spark(51, 10)))

# F · Esprit (rose magenta) : une sphère d'âme, un halo autour, la flamme rose au centre.
P["f"] = ("Esprit", "Rose magenta", "Une sphère d'âme cerclée d'un halo ; la flamme rose vit en son centre.", svg(
    "PA · Esprit",
    rad("au", [(0, "#FF9BE3", 0.7), (1, "#C2187A", 0)]) + rad("bo", [(0, "#5A1745", 1), (1, "#220818", 1)], 0.4, 0.35, 0.7)
    + grad("fl", [(0, "#FFE6F7"), (0.45, "#FF7AD9"), (1, "#C2187A")]),
    '<circle cx="32" cy="32" r="30" fill="url(#au)"/>'
    '<ellipse cx="32" cy="34" rx="29" ry="9" fill="none" stroke="#FF7AD9" stroke-width="2.2" transform="rotate(-18 32 34)" opacity="0.9"/>'
    '<circle cx="32" cy="32" r="19" fill="url(#bo)" stroke="#111111" stroke-width="2.6"/>'
    '<path d="M44 30a12 12 0 0 1 -6 10" fill="none" stroke="#FF9BE3" stroke-width="1.4" stroke-linecap="round" opacity="0.6"/>'
    '<circle cx="32" cy="33" r="9" fill="#FF7AD9" opacity="0.35"/>'
    + flame(32, 32, 20, "url(#fl)") + core(32, 32, 20)
    + '<path d="M4.42 42.96A29 9 -18 0 0 59.58 25.04" fill="none" stroke="#FF7AD9" stroke-width="2.2"/>'
    + spark(53, 9)))


def main():
    OUT.mkdir(exist_ok=True)
    cards = []
    for k, (name, color, idea, code) in P.items():
        (OUT / f"pa-{k}.svg").write_text(code, "utf-8")
        cards.append(f'''<figure><div class="big"><img src="pa-{k}.svg" alt=""></div>
<div class="row"><span class="pill y"><img src="pa-{k}.svg" alt="">120 PA</span><span class="pill d"><img src="pa-{k}.svg" alt="">120 PA</span></div>
<figcaption><b>{k.upper()} · {name}</b><span>{color}</span><em>{idea}</em></figcaption></figure>''')
    (OUT / "planche.html").write_text('''<!doctype html><html lang="fr"><meta charset="utf-8"><title>PA · propositions</title>
<style>body{margin:0;padding:22px;background:#FFD60A;font:14px/1.4 system-ui,sans-serif;color:#111}h1{font-size:20px;margin:0 0 4px}p{margin:0 0 16px}
main{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}figure{margin:0;padding:14px;border-radius:22px;background:#0F1828;color:#F3F6FC;display:flex;flex-direction:column;gap:10px}
.big{display:flex;justify-content:center;padding:6px;border-radius:16px;background:radial-gradient(circle at 50% 40%,#1B2A48,#0B1120)}.big img{width:150px;height:150px}
.row{display:flex;gap:8px;justify-content:center}.pill{display:inline-flex;align-items:center;gap:5px;height:28px;padding:0 10px 0 4px;border-radius:999px;font-weight:800;font-size:13px}
.pill img{width:22px;height:22px}.y{background:#FFD60A;color:#111;border:1px solid #111}.d{background:#111A2C;border:1px solid #3B2A6B}
figcaption{display:flex;flex-direction:column;gap:2px}figcaption b{font-size:15px}figcaption span{color:#C7A6FF;font-size:12.5px}figcaption em{font-style:normal;color:#C9D3EA;font-size:12.5px}</style>
<h1>Points d'Aura · 6 propositions</h1><p>La flamme au plus profond de l'être, qui le fait évoluer. En grand, puis à la taille de l'en-tête (22 px), sur fond jaune et sur fond sombre.</p>
<main>''' + "\n".join(cards) + "</main></html>\n", "utf-8")
    print(f"{len(P)} propositions : {OUT}")


if __name__ == "__main__":
    main()
