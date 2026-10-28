#!/usr/bin/env python3
"""
make_pa_h3.py : variantes de couleur de H3 (goutte d'âme prune, lotus au cœur), 2026-10-28, demande du porteur.

Même forme que H3 (goutte brillante, halo, orbes d'énergie, lotus du porteur) ; seules les couleurs changent, autour
du violet prune.

Sortie : tools/brand/pa/pa-i1.svg … pa-i6.svg et tools/brand/pa/planche-h3.html.
Usage : python3 tools/brand/make_pa_h3.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from make_pa_lotus import lotus_icon  # noqa: E402

OUT = Path(__file__).with_name("pa")

# nom, idée, halo, lueur, cœur sombre, lueur du lotus, orbes, dégradé de la goutte (haut → bas)
TINTS = [
    ("Prune (H3)", "La teinte de référence.",
     "#E59BD6", "#9B3C8F", "#1E061E", "#FFD1F2", "#FFE1F6", [(0, "#2A0726"), (0.5, "#8A2A7E"), (1, "#F3A6E0")]),
    ("Prune profonde", "Plus sombre et plus mystérieuse ; le bas reste lumineux.",
     "#C77DBA", "#7A2370", "#14030F", "#F7C6EA", "#F5D8EE", [(0, "#16030F"), (0.55, "#5E1656"), (1, "#D67FC6")]),
    ("Prune framboise", "Le bas tire vers le framboise, plus vivant.",
     "#FF8AC8", "#B02A72", "#22051A", "#FFD0EA", "#FFE0F0", [(0, "#2B0620"), (0.5, "#A3246E"), (1, "#FF8FC9")]),
    ("Prune mauve", "Plus doux, vers le mauve et le lilas.",
     "#D8B0F0", "#8E4FB0", "#1A0A26", "#EBD8FF", "#F2E6FF", [(0, "#24102F"), (0.5, "#7B3E99"), (1, "#E2C2F7")]),
    ("Prune néon", "Le bas s'allume en rose néon, très lumineux.",
     "#FF6FE0", "#C21FA8", "#1C0418", "#FFC2F2", "#FFDCF8", [(0, "#22041C"), (0.5, "#9C1A88"), (1, "#FF7FE8")]),
    ("Prune et or", "La goutte prune, le halo et les orbes en or comme les PK.",
     "#FFD60A", "#FFB21E", "#1E061E", "#FFE9A8", "#FFF2C2", [(0, "#2A0726"), (0.5, "#8A2A7E"), (1, "#F3A6E0")]),
]


def main():
    OUT.mkdir(exist_ok=True)
    cards = []
    for i, (name, idea, ring, glow, dark, lot, orbc, drop) in enumerate(TINTS, 1):
        code = lotus_icon("PA · " + name, drop, ring, glow, dark, lot, orbc, "goutte", drop)
        (OUT / f"pa-i{i}.svg").write_text(code, "utf-8")
        cards.append(f'''<figure><div class="big"><img src="pa-i{i}.svg" alt=""></div>
<div class="row"><span class="pill y"><img src="pa-i{i}.svg" alt="">120 PA</span><span class="pill d"><img src="pa-i{i}.svg" alt="">120 PA</span></div>
<figcaption><b>I{i} · {name}</b><em>{idea}</em></figcaption></figure>''')
    css = (OUT / "planche.html").read_text("utf-8").split("<style>")[1].split("</style>")[0]
    (OUT / "planche-h3.html").write_text(f'''<!doctype html><html lang="fr"><meta charset="utf-8"><title>PA · variantes de H3</title>
<style>{css}</style>
<h1>Points d'Aura · variantes de couleur de H3</h1><p>La goutte d'âme prune avec le lotus ; même forme, six couleurs. En grand, puis à 22 px sur fond jaune et sombre.</p>
<main>{"".join(cards)}</main></html>
''', "utf-8")
    print(f"{len(TINTS)} variantes : {OUT}")


if __name__ == "__main__":
    main()
