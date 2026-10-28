#!/usr/bin/env python3
"""
make_pa_logo.py : logo des PA (points d'Aura) de l'app, choisi par le porteur le 2026-10-28 : H3, goutte d'âme prune
avec le lotus au cœur (variante de couleur I1 ; les autres variantes sont dans tools/brand/pa/planche-h3.html).

Sortie :
- web/img/brand/pa.svg : logo fixe (en-tête, didacticiel…) ;
- web/img/brand/pa-anim.svg : le même, dont les orbes gravitent doucement autour de la goutte (jeu d'évolution, là où
  les PA sont expliqués) ; l'app montre le logo fixe si l'utilisateur limite les animations.
Usage : python3 tools/brand/make_pa_logo.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from make_pa_h3 import TINTS  # noqa: E402
from make_pa_lotus import lotus_icon  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
CHOICE = 0  # I1 · Prune (H3)


def main():
    name, _idea, ring, glow, dark, lot, orbc, drop = TINTS[CHOICE]
    out = ROOT / "web" / "img" / "brand"
    (out / "pa.svg").write_text(lotus_icon("PA · points d'Aura", drop, ring, glow, dark, lot, orbc, "goutte", drop), "utf-8")
    (out / "pa-anim.svg").write_text(lotus_icon("PA · points d'Aura", drop, ring, glow, dark, lot, orbc, "goutte", drop, anim=True), "utf-8")
    print("Logo des PA :", name)


if __name__ == "__main__":
    main()
