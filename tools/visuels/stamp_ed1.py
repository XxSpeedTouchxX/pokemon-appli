#!/usr/bin/env python3
"""Tampon « Édition 1 » sur les cartes du Set de Base (2026-11-20, porteur : « rajoute-moi le tampon 1ère édition sur
toutes les cartes de base »).

Les visuels français du Set de Base chez TCGdex mélangent deux tirages : 81 cartes sont des scans de l'Édition 1 (tampon
noir « EDITION » en arc au-dessus d'un « 1 » dans un disque), 21 sont des scans du tirage illimité, sans tampon. Ce script
pose le vrai tampon français sur ces 21 visuels, à la place exacte qu'il occupe sur les cartes Édition 1 :
  - à gauche, sous l'illustration, devant le bandeau « Pokémon … Taille … poids … » ;
  - abscisse = bord intérieur de la bordure jaune + 1 px, ordonnée = bas du cadre de l'illustration (mesurés carte par
    carte sur les 48 cartes Pokémon déjà tamponnées : écart de ± 3 px).
Le tampon (`ed1-tampon.png`, opacité du noir) est la médiane de 32 tampons relevés sur les Dresseurs et les Énergies du
même set. Les Dresseurs (70-95), la Double Énergie Incolore et les Énergies (96-102) ont déjà leur tampon.

Entrées : la copie locale (web/img/local/, faite par mirror_set.py) ou, à défaut, le visuel redressé (web/img/fix/).
Sorties : web/img/local/<chemin>.webp (600 × 825) et -low.webp (245 × 337), inscrits dans web/data/img-local.json
(« p » : empreinte, « ed1 » : visuels tamponnés). Un visuel déjà tamponné (liste « ed1 ») ou qui porte déjà un tampon à cet
endroit n'est pas retouché : le script peut être relancé sans risque.

Usage : python tools/visuels/stamp_ed1.py   (Pillow et numpy)
"""
import hashlib
import io
import json
import pathlib
import sys
import time

import numpy as np
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[2]
LOCAL = ROOT / "web/img/local"
FIX = ROOT / "web/img/fix"
LIST = ROOT / "web/data/img-local.json"
MASK = pathlib.Path(__file__).with_name("ed1-tampon.png")
INK = np.array([28.0, 26.0, 26.0])  # noir du tampon relevé sur les cartes Édition 1
SET = "fr/base/base1/"
# Coin haut gauche du gabarit 52 × 42 (le tampon y occupe 43 × 32 px) sur le visuel 600 × 825 de chaque carte.
POS = {
    1: (33, 431), 2: (37, 432), 4: (29, 436), 5: (34, 428), 6: (36, 427), 7: (28, 439), 9: (31, 426),
    11: (35, 433), 12: (36, 434), 13: (32, 430), 14: (17, 411), 15: (34, 428), 16: (29, 429), 24: (11, 416),
    26: (24, 434), 27: (31, 442), 28: (25, 435), 29: (34, 435), 34: (33, 434), 35: (29, 436), 37: (27, 437),
}


def mask():
    return np.asarray(Image.open(MASK).convert("L")).astype(float) / 255.0


def has_stamp(rgb, x, y, m):
    """Vrai si un tampon est déjà là (corrélation du gabarit avec la zone, ± 6 px)."""
    g = rgb.mean(axis=2)
    h, w = m.shape
    t = m - m.mean()
    tn = np.sqrt((t ** 2).sum())
    best = -1.0
    for dy in range(-6, 7, 2):
        for dx in range(-6, 7, 2):
            p = g[y + dy:y + dy + h, x + dx:x + dx + w]
            if p.shape != m.shape:
                continue
            b = np.percentile(p, 80) or 1.0
            d = np.clip((b - p) / b, 0, 1)
            d = d - d.mean()
            dn = np.sqrt((d ** 2).sum())
            if dn:
                best = max(best, float((d * t).sum() / (dn * tn)))
    return best > 0.8


def stamp(rgb, x, y, m):
    out = rgb.copy()
    h, w = m.shape
    a = m[..., None]
    out[y:y + h, x:x + w] = out[y:y + h, x:x + w] * (1 - a) + INK * a
    return out


def webp(img, size=None):
    if size:
        img = img.resize(size, Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, "WEBP", quality=88, method=6)
    return buf.getvalue()


def main():
    doc = json.loads(LIST.read_text("utf-8")) if LIST.exists() else {"v": 1, "p": {}}
    done = doc.setdefault("ed1", {})
    m = mask()
    made = skipped = 0
    for n, (x, y) in sorted(POS.items()):
        path = SET + str(n)
        name = path.replace("/", "_")
        if done.get(path):
            skipped += 1
            continue
        src = LOCAL / (name + ".webp")
        if not src.exists():
            src = FIX / (name + ".webp")
        if not src.exists():
            print("MANQUE", path, flush=True)
            continue
        im = Image.open(src).convert("RGB")
        if im.size != (600, 825):
            print("TAILLE INATTENDUE", path, im.size, flush=True)
            continue
        rgb = np.asarray(im).astype(float)
        if has_stamp(rgb, x, y, m):
            print("DÉJÀ TAMPONNÉE", path, flush=True)
            done[path] = 1
            continue
        out = Image.fromarray(np.clip(stamp(rgb, x, y, m), 0, 255).astype("uint8"))
        hi, lo = webp(out), webp(out, (245, 337))
        LOCAL.mkdir(parents=True, exist_ok=True)
        (LOCAL / (name + ".webp")).write_bytes(hi)
        (LOCAL / (name + "-low.webp")).write_bytes(lo)
        doc["p"][path] = hashlib.md5(hi + lo).hexdigest()[:8]
        done[path] = 1
        made += 1
        print("TAMPON", path, "depuis", src.relative_to(ROOT), flush=True)
    doc["p"] = dict(sorted(doc["p"].items()))
    doc["ed1"] = dict(sorted(done.items()))
    doc["made"] = time.strftime("%Y-%m-%d", time.gmtime())
    doc["n"] = len(doc["p"])
    LIST.write_text(json.dumps(doc, ensure_ascii=False, separators=(",", ":")) + "\n", "utf-8")
    print(f"{made} tampons posés, {skipped} déjà faits · {len(doc['ed1'])} visuels tamponnés au total")
    return 0


if __name__ == "__main__":
    sys.exit(main())
