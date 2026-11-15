#!/usr/bin/env python3
"""
make_holo.py : logo du DropiPass « carte holo » (logo 2, choisi par le porteur le 2026-11-15) avec plusieurs motifs au
centre, à proposer au porteur : gemme des PK (d'origine), « D » de l'icône Dropicards (tracé exact de
web/img/brand/monogram.svg), « D » doré, éclair, étoile, « D » et gemme. Écrit web/img/brand/dropipass-2a.svg à 2f.svg.
Usage : python3 tools/brand/dropipass/make_holo.py
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
MONO = (ROOT / "web/img/brand/monogram.svg").read_text("utf-8")
D_PATH = re.search(r'<path transform="translate\(0 -4\) rotate\(-3 40.1 -50\)" d="([^"]+)"', MONO).group(1)

DEFS = ('<defs><linearGradient id="h" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF9AD5"/><stop offset=".28" stop-color="#9CC8FF"/>'
        '<stop offset=".52" stop-color="#9BFFD0"/><stop offset=".76" stop-color="#FFF19A"/><stop offset="1" stop-color="#FFB592"/></linearGradient>'
        '<linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF3A6"/><stop offset=".5" stop-color="#FFD60A"/>'
        '<stop offset="1" stop-color="#F2A900"/></linearGradient></defs>')
CARD = ('<rect x="13" y="5" width="38" height="54" rx="6" fill="url(#h)" stroke="#2A1A55" stroke-width="3"/>'
        '<rect x="17.5" y="9.5" width="29" height="45" rx="3.5" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="1.6"/>'
        '<path d="M17 40L47 16" stroke="#fff" stroke-opacity=".55" stroke-width="5"/>')
SPARK = ('<path d="M52 6l1.6 4.4L58 12l-4.4 1.6L52 18l-1.6-4.4L46 12l4.4-1.6z" fill="#fff" stroke="#2A1A55" stroke-width="1.4" '
         'stroke-linejoin="round"/>')
GEM = ('<path d="M32 18.5l11 8.5-11 20-11-20z" fill="url(#g)" stroke="#7A4A00" stroke-width="2.6" stroke-linejoin="round"/>'
       '<path d="M21 27h22M32 18.5L27.5 27 32 47l4.5-20z" fill="none" stroke="#7A4A00" stroke-width="1.5" stroke-linejoin="round"/>')


def d_letter(k=0.25, cx=32, cy=32.5, fill="#FFFFFF"):
    """« D » de l'icône : ombre décalée, contour noir épais, lettre pleine (même tracé que monogram.svg)."""
    tx, ty = cx - 40.1 * k, cy + 50.3 * k
    t = f'translate({tx:.2f} {ty:.2f}) scale({k})'
    inner = f'<path transform="translate(0 -4) rotate(-3 40.1 -50)" d="{D_PATH}"'
    return (f'<g transform="{t}"><g transform="translate(5 7)" fill="#111111" stroke="#111111" stroke-width="14" stroke-linejoin="round">{inner}/></g>'
            f'<g fill="#111111" stroke="#111111" stroke-width="14" stroke-linejoin="round">{inner}/></g>{inner} fill="{fill}"/></g>')


BOLT = '<path d="M36.5 15.5l-11 17h7.4l-4.4 15 13-19.5h-7.6l2.6-12.5z" fill="url(#g)" stroke="#111111" stroke-width="2.6" stroke-linejoin="round"/>'
STAR = ('<path d="M32 15.5l4.6 10 10.9 1.2-8.2 7.4 2.3 10.8L32 39.4l-9.6 5.5 2.3-10.8-8.2-7.4 10.9-1.2z" fill="url(#g)" stroke="#7A4A00" '
        'stroke-width="2.4" stroke-linejoin="round"/><path d="M32 21.5l2.4 5.4" stroke="#FFF7C2" stroke-width="1.8" stroke-linecap="round"/>')
MINI_GEM = ('<g transform="translate(36.5 37.5) scale(0.42)"><path d="M14 0l14 11-14 25L0 11z" fill="url(#g)" stroke="#111111" stroke-width="4" '
            'stroke-linejoin="round"/><path d="M0 11h28" stroke="#111111" stroke-width="2.6"/></g>')

MOTIFS = {
    "2a": ("Gemme des PK", GEM),
    "2b": ("D de Dropicards", d_letter()),
    "2c": ("D doré", d_letter(fill="url(#g)")),
    "2d": ("Éclair", BOLT),
    "2e": ("Étoile", STAR),
    "2f": ("D et gemme", d_letter(k=0.21, cx=29.5, cy=30.5) + MINI_GEM),
}

for key, (label, motif) in MOTIFS.items():
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="DropiPass, carte holo : {label}">'
           f'{DEFS}<g transform="rotate(8 32 32)">{CARD}{motif}</g>{SPARK}</svg>\n')
    (ROOT / f"web/img/brand/dropipass-{key}.svg").write_text(svg, "utf-8")
    print(f"dropipass-{key}.svg : {label}")
