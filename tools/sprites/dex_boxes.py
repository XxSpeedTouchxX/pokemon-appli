#!/usr/bin/env python3
"""
dex_boxes.py : mesures des sprites pour les tailles proportionnelles du Pokédex (2026-10-29, revue du code).

Pour chaque fiche de dex.json : largeur et hauteur du GIF animé (cadre déjà serré autour du Pokémon), et boîte du
Pokémon dans l'image fixe de 96 px (marges transparentes variables). L'app s'en sert pour dessiner chaque Pokémon à la
hauteur voulue, que l'image soit animée ou fixe, sans qu'un sprite très large ne déborde de sa colonne.
Écrit les champs « gif » [l, h] et « box » [x0, y0, x1, y1] dans tools/sprites/dex.json.
Depuis le 2026-10-29 (porteur : « gère le centrage des Pokémon »), aussi le centre horizontal du corps du Pokémon
(depuis le 2026-10-30 : la plus grosse tache après érosion, sans queue ni ailes ; médiane de l'animation) : « gc » en
fraction de la largeur du GIF, « pc » en pixels de l'image fixe de 96 px ; « gb », le vide sous le Pokémon dans l'image médiane du GIF. Le Pokédex pose ce centre, et non le milieu du cadre, au centre du socle : une
queue (Reptincel, Dracaufeu) ou une aile ne décale plus le corps.
Usage : python3 tools/sprites/dex_boxes.py
"""
import json
from pathlib import Path
from PIL import Image, ImageFilter, ImageSequence


def _components(mask):
    """Taches d'un seul tenant (4-voisinage) d'un masque noir et blanc, en listes de points."""
    w, h = mask.size
    px = mask.load()
    seen = [[False] * w for _ in range(h)]
    out = []
    for y in range(h):
        for x in range(w):
            if px[x, y] and not seen[y][x]:
                stack, pts = [(x, y)], []
                seen[y][x] = True
                while stack:
                    a, b = stack.pop()
                    pts.append((a, b))
                    for c, d in ((a + 1, b), (a - 1, b), (a, b + 1), (a, b - 1)):
                        if 0 <= c < w and 0 <= d < h and px[c, d] and not seen[d][c]:
                            seen[d][c] = True
                            stack.append((c, d))
                out.append(pts)
    return out


def centroid(alpha, frac=0.28):
    """Centre horizontal du CORPS du Pokémon (en pixels), 2026-10-30 (porteur : « Reptincel est toujours décalé vers la
    gauche de son socle ») : la silhouette est érodée d'environ 28 % de sa plus petite dimension, ce qui efface les
    parties fines (queue, flamme au bout de la queue, ailes, antennes) ; on garde la plus grosse tache restante, le
    corps, et on prend son centre. Le milieu de l'image si elle est vide."""
    m = alpha.point(lambda v: 255 if v > 64 else 0)
    bb = m.getbbox()
    if not bb:
        return alpha.size[0] / 2
    k = max(3, int(round(frac * min(bb[2] - bb[0], bb[3] - bb[1])))) | 1
    e = m.filter(ImageFilter.MinFilter(k))
    parts = _components(e) if e.getbbox() else []
    if not parts:
        parts = _components(m)
    body = max(parts, key=len)
    return sum(x + 0.5 for x, _ in body) / len(body)


def gif_center(g):
    """Centre du corps dans le GIF animé : médiane sur une image sur trois de l'animation."""
    vals = [centroid(fr.convert("RGBA").getchannel("A")) for i, fr in enumerate(ImageSequence.Iterator(g)) if i % 3 == 0]
    vals.sort()
    return vals[len(vals) // 2]

ROOT = Path(__file__).resolve().parents[2]
DEX = ROOT / "tools" / "sprites" / "dex.json"
IMG = ROOT / "web" / "img" / "pokemon"


def main():
    data = json.loads(DEX.read_text("utf-8"))
    for e in data["dex"]:
        n = e["n"]
        g = Image.open(IMG / f"{n}.gif")
        e["gif"] = [g.width, g.height]
        e["gc"] = round(gif_center(g) / g.width, 3)
        # Vide sous le Pokémon dans une image « médiane » de l'animation, en fraction de la hauteur : un Pokémon qui vole
        # ou rebondit (Méga-Dracaufeu Y) se pose alors sur son socle la plupart du temps, au lieu de flotter au-dessus.
        gaps = sorted(g.height - (fr.convert("RGBA").getchannel("A").getbbox() or (0, 0, 0, g.height))[3] for fr in ImageSequence.Iterator(g))
        e["gb"] = round(gaps[len(gaps) // 2] / g.height, 3)
        p = Image.open(IMG / f"{n}.png").convert("RGBA")
        e["box"] = list(p.getchannel("A").getbbox() or (0, 0, p.width, p.height))
        e["pc"] = round(centroid(p.getchannel("A")), 1)
    DEX.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")), "utf-8")
    print(len(data["dex"]), "fiches mesurées")


if __name__ == "__main__":
    main()
