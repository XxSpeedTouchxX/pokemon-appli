#!/usr/bin/env python3
"""
make_pokedex.py : le Pokédex de Dropicards (2026-10-28, demande du porteur, d'après sa photo d'un Pokédex rouge).

Pokédex ouvert, dessiné à plat : volet gauche avec l'objectif (la gemme des PK à la place de la lentille bleue), les
trois voyants et l'écran ; charnière ; volet droit avec l'écran noir, le clavier bleu et les touches. Les écrans sont
vides : l'app y pose le Pokémon et le solde de PA (tools/web/pa.js, dex.css).

Sortie : web/img/brand/pokedex.svg (400 × 250, icône et petits usages). Écrans, en unités du dessin : gauche (45, 100,
120 × 70), droit (232, 92, 140 × 38).
Et web/img/brand/pokedex-device.svg (2026-10-31, porteur : « un plus gros écran, un OK et des flèches plus gros ») :
le Pokédex de l'onglet Jeux, écran gauche agrandi (34, 89, 146 × 76), croix (128, 174, 62 × 62) et bouton vert « OK »
(38, 188, 70 × 36) plus gros : mêmes valeurs en pourcentage dans tools/web/dex.css.
Usage : python3 tools/brand/make_pokedex.py
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "web" / "img" / "brand" / "pokedex.svg"
INK = "#3A0A0E"


def gem(cx, cy, size):
    """La gemme des PK (web/img/brand/pk.svg), centrée en (cx, cy), de côté size."""
    src = (ROOT / "web" / "img" / "brand" / "pk.svg").read_text("utf-8")
    inner = re.sub(r"^.*?<title>PK</title>", "", src, flags=re.S).replace("</svg>", "")
    k = size / 64
    return f'<g transform="translate({cx - size / 2:.1f} {cy - size / 2:.1f}) scale({k:.4f})">{inner}</g>'


def write(big):
    body = f'''<defs>
<linearGradient id="rd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F0333F"/><stop offset="1" stop-color="#B5121F"/></linearGradient>
<linearGradient id="rd2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#D51E2C"/><stop offset="1" stop-color="#9E0F1B"/></linearGradient>
<linearGradient id="hg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8E0D18"/><stop offset="0.45" stop-color="#F25562"/><stop offset="1" stop-color="#8E0D18"/></linearGradient>
<radialGradient id="ring" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#C9D3EA"/></radialGradient>
<linearGradient id="bz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3F3F3"/><stop offset="1" stop-color="#C9C9C9"/></linearGradient>
<linearGradient id="kb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6FC8FF"/><stop offset="1" stop-color="#2C8BE6"/></linearGradient>
</defs>
<!-- volet gauche -->
<path d="M14 40 Q14 28 26 28 L120 28 L132 16 L192 16 Q202 16 202 26 L202 236 Q202 244 194 244 L22 244 Q14 244 14 236 Z" fill="url(#rd)" stroke="{INK}" stroke-width="4" stroke-linejoin="round"/>
<path d="M14 74 L120 74 L134 58 L202 58" fill="none" stroke="{INK}" stroke-width="3" stroke-linejoin="round" opacity="0.55"/>
<path d="M22 236 L196 236" stroke="#7E0A14" stroke-width="5" stroke-linecap="round" opacity="0.5"/>
<circle cx="56" cy="50" r="27" fill="url(#ring)" stroke="{INK}" stroke-width="4"/>
<circle cx="56" cy="50" r="20" fill="#1A2236" stroke="{INK}" stroke-width="2"/>
{gem(56, 50, 34)}
<circle cx="102" cy="40" r="6" fill="#FF3B3B" stroke="{INK}" stroke-width="2.5"/><circle cx="100" cy="38" r="2" fill="#FFFFFF" opacity="0.8"/>
<circle cx="120" cy="40" r="6" fill="#FFD60A" stroke="{INK}" stroke-width="2.5"/><circle cx="118" cy="38" r="2" fill="#FFFFFF" opacity="0.8"/>
<circle cx="138" cy="40" r="6" fill="#3DDC84" stroke="{INK}" stroke-width="2.5"/><circle cx="136" cy="38" r="2" fill="#FFFFFF" opacity="0.8"/>
''' + left_panel(big) + f'''<!-- charnière -->
<rect x="200" y="24" width="18" height="222" rx="9" fill="url(#hg)" stroke="{INK}" stroke-width="4"/>
<path d="M200 60 h18 M200 210 h18" stroke="{INK}" stroke-width="3"/>
<!-- volet droit -->
<path d="M216 66 L270 66 L284 54 L380 54 Q390 54 390 64 L390 236 Q390 244 382 244 L216 244 Z" fill="url(#rd2)" stroke="{INK}" stroke-width="4" stroke-linejoin="round"/>
<rect x="232" y="92" width="140" height="38" rx="5" fill="#0E1626" stroke="{INK}" stroke-width="3"/>
''' + "".join(f'<rect x="{232 + c * 28}" y="{142 + r * 18}" width="28" height="18" fill="url(#kb)" stroke="{INK}" stroke-width="2"/>' for r in range(2) for c in range(5)) + f'''
<rect x="232" y="190" width="20" height="14" rx="2" fill="#F3F3F3" stroke="{INK}" stroke-width="2"/><rect x="252" y="190" width="20" height="14" rx="2" fill="#F3F3F3" stroke="{INK}" stroke-width="2"/>
<rect x="318" y="192" width="20" height="5" rx="2.5" fill="#1C1C1C"/><rect x="342" y="192" width="20" height="5" rx="2.5" fill="#1C1C1C"/>
<circle cx="362" cy="214" r="6" fill="#FFD60A" stroke="{INK}" stroke-width="2.5"/>
<rect x="232" y="214" width="56" height="20" rx="3" fill="#123A2A" stroke="{INK}" stroke-width="3"/>
<rect x="300" y="222" width="50" height="14" rx="3" fill="#123A2A" stroke="{INK}" stroke-width="3"/>
'''
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250" role="img" aria-label="Pokédex"><title>Pokédex</title>{body}</svg>\n'
    out = OUT.with_name("pokedex-device.svg") if big else OUT
    out.write_text(svg, "utf-8")
    print(out, len(svg), "octets")


def left_panel(big):
    """Écran, boutons et croix du volet gauche ; plus grands pour l'appareil de l'onglet Jeux."""
    if not big:
        return f'''<path d="M30 88 L180 88 L180 186 L48 186 L30 168 Z" fill="url(#bz)" stroke="{INK}" stroke-width="3.5" stroke-linejoin="round"/>
<circle cx="94" cy="95" r="3" fill="#E2202F"/><circle cx="116" cy="95" r="3" fill="#E2202F"/>
<rect x="45" y="100" width="120" height="70" rx="5" fill="#0E1626" stroke="{INK}" stroke-width="3"/>
<circle cx="44" cy="176" r="0" fill="none"/>
<path d="M150 176 h18 M150 180 h18 M150 172 h18" stroke="#6B6B6B" stroke-width="2" stroke-linecap="round"/>
<circle cx="40" cy="210" r="11" fill="#1C1C1C" stroke="{INK}" stroke-width="3"/>
<rect x="60" y="196" width="22" height="5" rx="2.5" fill="#FF5A5A" stroke="{INK}" stroke-width="1.5"/>
<rect x="88" y="196" width="22" height="5" rx="2.5" fill="#4AA8FF" stroke="{INK}" stroke-width="1.5"/>
<rect x="60" y="208" width="50" height="22" rx="4" fill="#3DDC84" stroke="{INK}" stroke-width="3"/>
<path d="M150 196 h14 v14 h14 v14 h-14 v14 h-14 v-14 h-14 v-14 h14 Z" fill="#1C1C1C" stroke="{INK}" stroke-width="3" stroke-linejoin="round"/>
'''
    return f'''<path d="M22 80 L192 80 L192 172 L40 172 L22 154 Z" fill="url(#bz)" stroke="{INK}" stroke-width="3.5" stroke-linejoin="round"/>
<circle cx="96" cy="84.5" r="2.5" fill="#E2202F"/><circle cx="118" cy="84.5" r="2.5" fill="#E2202F"/>
<rect x="34" y="89" width="146" height="76" rx="5" fill="#0E1626" stroke="{INK}" stroke-width="3"/>
<rect x="44" y="178" width="22" height="5" rx="2.5" fill="#FF5A5A" stroke="{INK}" stroke-width="1.5"/>
<rect x="72" y="178" width="22" height="5" rx="2.5" fill="#4AA8FF" stroke="{INK}" stroke-width="1.5"/>
<rect x="38" y="188" width="70" height="36" rx="6" fill="#3DDC84" stroke="{INK}" stroke-width="3"/>
<path d="M149 174 h20 v21 h21 v20 h-21 v21 h-20 v-21 h-21 v-20 h21 Z" fill="#1C1C1C" stroke="{INK}" stroke-width="3" stroke-linejoin="round"/>
'''


def main():
    for big in (False, True):
        write(big)


if __name__ == "__main__":
    main()
