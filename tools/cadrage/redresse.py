"""Visuels de cartes « de travers » (2026-11-13, porteur : « certaines cartes sont tordues, arrange cela dans le cadrage »).

Une partie des visuels TCGdex (surtout des extensions anciennes, en français) sont des photos de la carte, prises un peu
de travers, avec un fond autour : Rayquaza ☆ d'EX Deoxys (ex8-107) en est l'exemple envoyé par le porteur. Ce module :

1. trouve la carte dans le visuel (ses 4 bords) ;
2. décide si le visuel est « de travers » : carte tournée, en perspective, ou entourée de fond ;
3. redresse et recadre la carte au format des visuels TCGdex (600 × 825), coins arrondis transparents.

Un vrai scan (la carte remplit tout le visuel, coins transparents) n'est jamais touché. Rien n'est inventé : seuls les
pixels de la photo sont déplacés (perspective), comme quand on remet une photo droite.

Usage (GitHub Actions, workflow « Cadrage des cartes ») :
    python3 tools/cadrage/redresse.py --essai    # essai à blanc : rapport et planches dans tools/cadrage/essai/
    python3 tools/cadrage/redresse.py            # publication : tout le catalogue
    python3 tools/cadrage/redresse.py --only ex8-107,ex8-106
Écrit web/img/fix/<chemin>.webp (600 px) et <chemin>-low.webp (245 px), web/data/img-fix.json (liste lue par l'app) et
tools/cadrage/apercu/*.jpg (avant / après, pour vérifier à l'œil).
"""
import argparse
import hashlib
import json
import math
import os
import sys
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import date
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
W, H = 600, 825          # visuels TCGdex « high »
LOW_W = 245              # visuels TCGdex « low »
RADIUS = 0.045           # coins arrondis, en part de la largeur (≈ 27 px sur 600)
INSET = 0.004            # la carte est recadrée 0,4 % à l'intérieur de son bord (aucun liseré de fond)
# Seuils (v2, après un premier passage qui prenait des scans droits pour des photos de travers) :
BG_MIN = 0.015           # fond visible autour de la carte : au moins 1,5 % du visuel (coins arrondis d'un scan ≈ 0,2 %)
BG_T = 16.0              # écart de couleur (Lab) toléré à l'intérieur du fond
SPREAD = 20.0            # au moins 3 des 4 coins du visuel ont la même couleur de fond (à cet écart près)
FILL = 0.97              # la carte remplit le quadrilatère de ses bords : vraie forme de carte (sinon fond mal trouvé)
TILT_DEG = 1.0           # carte tournée d'au moins 1°
PERSP = 0.03             # perspective signalée (côtés opposés à 3 % d'écart ou plus), redressée avec la rotation
SKEW = 6.0               # côtés penchés différemment de plus de 6° : forme douteuse, laissé tel quel
AGREE = 0.02             # petit et grand visuel : mêmes coins à 2 % de la largeur près (sinon détection instable)
UA = {"User-Agent": "Dropicards/1.0 (+https://dropicards.fr)"}


def order(pts):
    """Coins dans l'ordre haut-gauche, haut-droit, bas-droit, bas-gauche."""
    p = np.asarray(pts, dtype=np.float64).reshape(-1, 2)
    s, d = p.sum(1), p[:, 1] - p[:, 0]
    return np.array([p[np.argmin(s)], p[np.argmin(d)], p[np.argmax(s)], p[np.argmax(d)]])


def split(img):
    """(BGR, alpha ou None) d'une image lue avec cv2.IMREAD_UNCHANGED."""
    if img.ndim == 2:
        return cv2.cvtColor(img, cv2.COLOR_GRAY2BGR), None
    if img.shape[2] == 4:
        return img[..., :3].copy(), img[..., 3]
    return img, None


def _quad(contour, w, h):
    """4 coins d'un contour : points extrêmes selon les diagonales (sur l'arrondi des coins de la carte), puis chaque
    côté recalé sur les points du contour (droite ajustée, coins arrondis écartés) et les côtés voisins croisés."""
    hull = cv2.convexHull(contour).reshape(-1, 2)
    q = order(hull)
    pts = contour.reshape(-1, 2).astype(np.float64)
    lines = []
    for i in range(4):
        a, b = q[i], q[(i + 1) % 4]
        ab = b - a
        n = np.linalg.norm(ab)
        if n < 1:
            return q
        t = ((pts - a) @ ab) / (n * n)
        dist = np.abs(ab[0] * (pts[:, 1] - a[1]) - ab[1] * (pts[:, 0] - a[0])) / n
        sel = pts[(t > 0.12) & (t < 0.88) & (dist < 0.025 * max(w, h))]
        if len(sel) < 8:
            lines.append(None)
            continue
        vx, vy, x0, y0 = cv2.fitLine(sel.astype(np.float32), cv2.DIST_HUBER, 0, 0.01, 0.01).ravel()
        lines.append((float(vx), float(vy), float(x0), float(y0)))
    if any(ln is None for ln in lines):
        return q
    out = []
    for i in range(4):
        (vx1, vy1, x1, y1), (vx2, vy2, x2, y2) = lines[i - 1], lines[i]
        den = vx1 * vy2 - vy1 * vx2
        if abs(den) < 1e-6:
            return q
        s = ((x2 - x1) * vy2 - (y2 - y1) * vx2) / den
        out.append((x1 + s * vx1, y1 + s * vy1))
    q2 = order(out)
    # Garde-fou : coins recalés trop loin du polygone de départ → on garde le polygone.
    if np.max(np.linalg.norm(q2 - q, axis=1)) > 0.05 * max(w, h):
        return q
    return q2


def _lab(bgr):
    """Couleurs Lab à la vraie échelle (L 0-100, a et b centrés sur 0)."""
    lab = cv2.cvtColor(bgr, cv2.COLOR_BGR2LAB).astype(np.float32)
    lab[..., 0] *= 100.0 / 255.0
    lab[..., 1:] -= 128.0
    return lab


def background(img):
    """Fond autour de la carte, repéré depuis les 4 coins du visuel : (masque du fond sur une image réduite, source,
    couleur Lab du fond, écart entre les coins, échelle) ou None quand les coins n'ont pas la même couleur (pas de fond uni).
    Visuel avec coins transparents : le fond est la partie transparente. Sinon : les pixels de la couleur des coins
    reliés au bord du visuel (la carte, d'une autre couleur, les arrête)."""
    bgr, alpha = split(img)
    h, w = bgr.shape[:2]
    k = min(1.0, 420.0 / max(w, h))
    size = (max(1, round(w * k)), max(1, round(h * k)))
    small = cv2.resize(bgr, size, interpolation=cv2.INTER_AREA) if k < 1 else bgr
    sh, sw = small.shape[:2]
    p = max(2, round(0.015 * sw))
    corners = [(slice(0, p), slice(0, p)), (slice(0, p), slice(sw - p, sw)),
               (slice(sh - p, sh), slice(0, p)), (slice(sh - p, sh), slice(sw - p, sw))]
    if alpha is not None:
        a = cv2.resize(alpha, size, interpolation=cv2.INTER_AREA) if k < 1 else alpha
        if sum(float(a[c].mean()) < 128 for c in corners) >= 3:
            return a < 128, "alpha", None, 0.0, k
    lab = _lab(small)
    cols = np.array([np.median(lab[c].reshape(-1, 3), 0) for c in corners])
    bgc = np.median(cols, 0)
    d = np.linalg.norm(cols - bgc, axis=1)
    if int((d < SPREAD).sum()) < 3:
        return None
    bgc = cols[d < SPREAD].mean(0)
    near = (np.linalg.norm(lab - bgc, axis=2) < BG_T).astype(np.uint8)
    n, lbl = cv2.connectedComponents(near, connectivity=8)
    edge = np.concatenate([lbl[0], lbl[-1], lbl[:, 0], lbl[:, -1]])
    nedge = np.concatenate([near[0], near[-1], near[:, 0], near[:, -1]])
    keep = np.unique(edge[nedge > 0])
    bg = np.isin(lbl, keep).astype(np.uint8)
    # Un fond qui s'infiltre dans la carte par de fins passages (paillettes, bord sombre) est coupé : seul le fond
    # assez épais (≥ 1,2 % de la largeur) reste du fond.
    r = max(3, round(0.012 * sw)) | 1
    bg = cv2.morphologyEx(bg, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (r, r)))
    return bg > 0, "couleur", bgc, float(d.max()), k


def find_card(img):
    """Carte dans le visuel : {'q': 4 coins (TL, TR, BR, BL), 'src', 'bg' (part de fond), 'fill' (la carte remplit son
    rectangle), 'spread' (écart entre les coins)} ou None (pas de fond uni autour : visuel laissé tel quel)."""
    r = background(img)
    if r is None:
        return None
    bg, src, bgc, spread, k = r
    sh, sw = bg.shape
    card = np.where(bg, 0, 255).astype(np.uint8)
    card = cv2.morphologyEx(card, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3)))
    cs, _ = cv2.findContours(card, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    if not cs:
        return None
    c = max(cs, key=cv2.contourArea)
    area = cv2.contourArea(c)
    if area < 0.25 * sw * sh:
        return None
    q = _quad(c, sw, sh)
    # La carte remplit le quadrilatère de ses 4 bords et n'a pas de creux (contour sans fuite du fond).
    fill = min(area / max(1.0, cv2.contourArea(q.astype(np.float32))), area / max(1.0, cv2.contourArea(cv2.convexHull(c))))
    return {"q": q / k, "src": src, "bg": float(bg.mean()), "fill": float(fill), "spread": spread,
            "bgL": None if bgc is None else float(bgc[0])}


def measure(q, w, h):
    """Mesures d'une carte trouvée : rotation (degrés, signée), écart entre les côtés, perspective, proportions, surface."""
    tl, tr, br, bl = q
    top, bottom = np.linalg.norm(tr - tl), np.linalg.norm(br - bl)
    left, right = np.linalg.norm(bl - tl), np.linalg.norm(br - tr)
    deg = lambda y, x: math.degrees(math.atan2(y, x))
    # Angle de chaque côté (0 quand il est droit) ; une carte tournée a ses 4 côtés tournés du même angle.
    angs = [deg(tr[1] - tl[1], tr[0] - tl[0]), deg(br[1] - bl[1], br[0] - bl[0]),
            -deg(bl[0] - tl[0], bl[1] - tl[1]), -deg(br[0] - tr[0], br[1] - tr[1])]
    rot = float(np.mean(angs))
    skew = float(max(abs(x - rot) for x in angs))
    persp = max(abs(top - bottom) / max(top, bottom), abs(left - right) / max(left, right))
    margins = [min(tl[0], bl[0]) / w, min(tl[1], tr[1]) / h, (w - max(tr[0], br[0])) / w, (h - max(bl[1], br[1])) / h]
    aspect = ((top + bottom) / 2) / ((left + right) / 2)
    area = cv2.contourArea(q.astype(np.float32)) / (w * h)
    return {"tilt": abs(rot), "rot": rot, "skew": skew, "persp": persp, "margins": margins, "aspect": aspect, "area": area}


def crooked(img):
    """(True/False, carte trouvée, mesures, raison) : True quand le visuel est une photo de travers à redresser.
    Il faut, à la fois : un fond uni autour de la carte (même couleur aux coins du visuel, ou transparent), au moins
    1,5 % du visuel ; une vraie forme de carte (proportions, quadrilatère bien rempli, côtés cohérents) ; et une carte
    tournée d'au moins 1° (la perspective est redressée en même temps). Un scan droit n'est jamais touché."""
    card = find_card(img)
    h, w = img.shape[:2]
    if card is None:
        return False, None, None, "pas de fond uni autour de la carte"
    m = measure(card["q"], w, h)
    m.update(bg=card["bg"], fill=card["fill"], spread=card["spread"], src=card["src"])
    if card["bg"] < BG_MIN:
        return False, card, m, f"pas de fond autour de la carte ({card['bg'] * 100:.1f} %)"
    if not (0.66 <= m["aspect"] <= 0.78) or m["area"] < 0.4:
        return False, card, m, "forme différente d'une carte"
    if card["fill"] < FILL:
        return False, card, m, f"contour irrégulier ({card['fill'] * 100:.0f} %)"
    if m["skew"] > SKEW:
        return False, card, m, f"côtés incohérents ({m['skew']:.1f}°)"
    # Il faut une carte tournée : un fond qui déborde un peu sur un côté de la carte (bord sombre, paillettes) donne
    # une fausse perspective, jamais une carte tournée de 1° dont les 4 côtés suivent le fond.
    if m["tilt"] < TILT_DEG:
        return False, card, m, "droite"
    why = [f"penchée de {m['tilt']:.1f}°"]
    if m["persp"] >= PERSP:
        why.append(f"perspective {m['persp'] * 100:.1f} %")
    return True, card, m, ", ".join(why)


def round_corners(rgba, radius):
    """Coins arrondis transparents, lissés (dessinés 4 fois plus grands puis réduits)."""
    h, w = rgba.shape[:2]
    s = 4
    m = np.zeros((h * s, w * s), np.uint8)
    r = int(radius * s)
    cv2.rectangle(m, (r, 0), (w * s - r, h * s), 255, -1)
    cv2.rectangle(m, (0, r), (w * s, h * s - r), 255, -1)
    for cx, cy in ((r, r), (w * s - r - 1, r), (r, h * s - r - 1), (w * s - r - 1, h * s - r - 1)):
        cv2.circle(m, (cx, cy), r, 255, -1)
    m = cv2.resize(m, (w, h), interpolation=cv2.INTER_AREA)
    out = rgba.copy()
    out[..., 3] = np.minimum(out[..., 3], m)
    return out


def rectify(img, q, size=(W, H)):
    """La carte (4 coins) remise droite, au format size, coins arrondis transparents (BGRA)."""
    bgr, alpha = split(img)
    c = q.mean(0)
    src = (c + (q - c) * (1 - 2 * INSET)).astype(np.float32)
    dst = np.float32([[0, 0], [size[0], 0], [size[0], size[1]], [0, size[1]]])
    M = cv2.getPerspectiveTransform(src, dst)
    out = cv2.warpPerspective(bgr, M, size, flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REPLICATE)
    a = np.full(size[::-1], 255, np.uint8)
    rgba = np.dstack([out, a])
    return round_corners(rgba, RADIUS * size[0])


# ——— Catalogue ———

def key_of(path):
    """Nom de fichier d'un chemin TCGdex (« fr/ex/ex8/107 » → « fr_ex_ex8_107 »)."""
    return path.replace("/", "_")


def get(url, dest, tries=3):
    if dest.exists():
        return True
    for k in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
                dest.write_bytes(r.read())
                return True
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return False
        except Exception:  # noqa: BLE001
            pass
        time.sleep(1 + k)
    return False


def read(p):
    data = np.frombuffer(Path(p).read_bytes(), np.uint8)
    return cv2.imdecode(data, cv2.IMREAD_UNCHANGED)


def sheet(pairs, out):
    """Planche « avant | après » (12 cartes) pour vérifier à l'œil."""
    th = 260
    tiles = []
    for cid, before, after in pairs:
        def fit(im):
            bgr, alpha = split(im)
            if alpha is not None:
                bg = np.full_like(bgr, 40)
                f = (alpha.astype(np.float32) / 255)[..., None]
                bgr = (bgr * f + bg * (1 - f)).astype(np.uint8)
            k = th / bgr.shape[0]
            return cv2.resize(bgr, (round(bgr.shape[1] * k), th), interpolation=cv2.INTER_AREA)
        b, a = fit(before), fit(after)
        pad = np.full((th, 8, 3), 40, np.uint8)
        t = np.hstack([b, pad, a])
        label = np.full((22, t.shape[1], 3), 20, np.uint8)
        cv2.putText(label, cid, (4, 16), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (240, 240, 240), 1, cv2.LINE_AA)
        tiles.append(np.vstack([label, t]))
    if not tiles:
        return
    tw = max(t.shape[1] for t in tiles)
    tiles = [np.hstack([t, np.full((t.shape[0], tw - t.shape[1], 3), 20, np.uint8)]) for t in tiles]
    rows = [np.hstack(tiles[i:i + 3]) if len(tiles[i:i + 3]) == 3 else np.hstack(tiles[i:i + 3] + [np.full_like(tiles[0], 20)] * (3 - len(tiles[i:i + 3]))) for i in range(0, len(tiles), 3)]
    cv2.imwrite(str(out), np.vstack(rows), [cv2.IMWRITE_JPEG_QUALITY, 72])


def main():
    ap = argparse.ArgumentParser(description="Redresse les visuels de cartes de travers.")
    ap.add_argument("--only", default="", help="ids de cartes séparés par des virgules")
    ap.add_argument("--cache", default=str(ROOT / ".cache/scan/img"), help="dossier des petits visuels (même cache que le scan)")
    ap.add_argument("--max", type=int, default=400, help="au-delà, rien n'est publié (détection à revoir)")
    ap.add_argument("--essai", action="store_true",
                    help="essai à blanc : rapport, mesures et planches dans tools/cadrage/essai/, aucun visuel de l'app changé")
    ap.add_argument("--voir", default="ex8-107", help="essai : cartes dont le visuel d'origine est toujours joint au rapport")
    a = ap.parse_args()
    doc = json.loads((ROOT / "web/data/cards.json").read_text("utf-8"))
    f = {k: i for i, k in enumerate(doc["fields"])}
    assets = doc.get("img") or "https://assets.tcgdex.net/"
    only = {x for x in a.only.split(",") if x}
    voir = {x for x in a.voir.split(",") if x}
    paths = {}
    for r in doc["cards"]:
        p = r[f["img"]]
        if not p or p.startswith(("ptcg:", "sdx:")) or p.startswith("http"):
            continue
        if only and r[f["id"]] not in only and r[f["id"]] not in voir:
            continue
        paths.setdefault(p, r[f["id"]])
    cache, high = Path(a.cache), ROOT / ".cache/cadrage/high"
    cache.mkdir(parents=True, exist_ok=True)
    high.mkdir(parents=True, exist_ok=True)
    low_file = lambda p: cache / (hashlib.sha1((assets + p + "/low.webp").encode()).hexdigest()[:20] + ".webp")
    print(f"{len(paths)} visuels TCGdex à contrôler" + (" (essai à blanc)" if a.essai else ""))
    with ThreadPoolExecutor(12) as ex:
        ok = list(ex.map(lambda p: get(assets + p + "/low.webp", low_file(p)), paths))
    print(f"petits visuels : {sum(ok)} disponibles, {len(ok) - sum(ok)} introuvables")
    # 1. Tri sur le petit visuel ; 2. confirmation et redressement sur le grand.
    cand, rows, seen = [], [], {}
    for p, cid in paths.items():
        lf = low_file(p)
        if not lf.exists():
            continue
        im = read(lf)
        if im is None:
            continue
        bad, card, m, why = crooked(im)
        seen[p] = why
        if a.essai and (bad or cid in voir or (m and m.get("bg", 0) >= 0.005)):
            rows.append((cid, p, "oui" if bad else "non", why, m or {}))
        if bad:
            cand.append((p, cid, why))
    print(f"{len(cand)} visuels peut-être de travers sur les petits visuels (vérifiés sur les grands)")
    if len(cand) > 4 * a.max:
        sys.exit(f"Trop de visuels repérés ({len(cand)}) : détection à revoir, rien n'est publié.")
    out_dir = ROOT / ("tools/cadrage/essai/fix" if a.essai else "web/img/fix")
    out_dir.mkdir(parents=True, exist_ok=True)
    fixed, pairs, log = {}, [], []
    for p, cid, why in cand:
        hf = high / (key_of(p) + ".img")
        if not (get(assets + p + "/high.webp", hf) or get(assets + p + "/high.png", hf)):
            log.append(f"{cid} {p} : grand visuel introuvable")
            continue
        im = read(hf)
        if im is None:
            continue
        bad, card, m, why2 = crooked(im)
        if not bad:
            log.append(f"{cid} {p} : droit sur le grand visuel ({why2})")
            continue
        # Même carte trouvée sur le petit et le grand visuel ? Un faux contour ne l'est presque jamais aux deux tailles ;
        # le vrai bord d'une photo, toujours.
        lim = read(low_file(p))
        lc = find_card(lim) if lim is not None else None
        if lc is None or np.max(np.linalg.norm(lc["q"] * (im.shape[1] / lim.shape[1]) - card["q"], axis=1)) > AGREE * im.shape[1]:
            log.append(f"{cid} {p} : détection instable entre petit et grand visuel, laissé tel quel")
            continue
        hi = rectify(im, card["q"])
        lo = cv2.resize(hi, (LOW_W, round(LOW_W * H / W)), interpolation=cv2.INTER_AREA)
        k = key_of(p)
        if not a.essai:
            cv2.imwrite(str(out_dir / (k + ".webp")), hi, [cv2.IMWRITE_WEBP_QUALITY, 84])
            cv2.imwrite(str(out_dir / (k + "-low.webp")), lo, [cv2.IMWRITE_WEBP_QUALITY, 82])
            fixed[p] = hashlib.sha1((out_dir / (k + ".webp")).read_bytes()).hexdigest()[:8]
        else:
            fixed[p] = "essai"
        log.append(f"{cid} {p} : {why2}")
        pairs.append((cid, im, hi))
    if len(fixed) > a.max:
        sys.exit(f"Trop de visuels redressés ({len(fixed)} > {a.max}) : détection à revoir, rien n'est publié.")
    if a.essai:
        essai(a, paths, low_file, rows, pairs, log, fixed, seen, voir)
        return
    # Fichiers d'anciens redressements devenus inutiles : retirés (sauf avec --only).
    if not only:
        keep = {key_of(p) for p in fixed}
        for fp in out_dir.glob("*.webp"):
            if fp.name.replace("-low.webp", "").replace(".webp", "") not in keep:
                fp.unlink()
    listing = ROOT / "web/data/img-fix.json"
    old = json.loads(listing.read_text("utf-8")).get("p", {}) if listing.exists() and only else {}
    old.update(fixed)
    listing.write_text(json.dumps({"v": 1, "made": date.today().isoformat(), "n": len(old), "p": dict(sorted(old.items()))},
                                  ensure_ascii=False, separators=(",", ":")) + "\n", "utf-8")
    ap_dir = ROOT / "tools/cadrage/apercu"
    ap_dir.mkdir(parents=True, exist_ok=True)
    for fp in ap_dir.glob("*.jpg"):
        fp.unlink()
    for i in range(0, min(len(pairs), 240), 12):
        sheet(pairs[i:i + 12], ap_dir / f"apercu-{i // 12 + 1:02d}.jpg")
    print(f"{len(fixed)} visuels redressés (web/img/fix, web/data/img-fix.json)")
    for line in log:
        print("  " + line)


def essai(a, paths, low_file, rows, pairs, log, fixed, seen, voir):
    """Essai à blanc : tools/cadrage/essai/ reçoit le rapport, les mesures, les planches avant / après des visuels qui
    seraient redressés, et les petits visuels d'origine utiles pour régler la détection (repérés, demandés, au hasard)."""
    d = ROOT / "tools/cadrage/essai"
    import shutil
    shutil.rmtree(d, ignore_errors=True)
    (d / "orig").mkdir(parents=True)
    with (d / "mesures.csv").open("w", encoding="utf-8") as fh:
        fh.write("id;chemin;repere;raison;source;fond;remplissage;rotation;ecart_cotes;perspective;proportions;surface;coins\n")
        for cid, p, flag, why, m in rows:
            g = lambda k, n=3: "" if m.get(k) is None else (f"{m[k]:.{n}f}" if isinstance(m[k], (float, np.floating)) else str(m[k]))
            fh.write(";".join([cid, p, flag, why.replace(";", ","), g("src"), g("bg"), g("fill"), g("rot", 2), g("skew", 2),
                               g("persp"), g("aspect"), g("area"), g("spread", 1)]) + "\n")
    ids = {p: cid for p, cid in paths.items()}
    want = [p for p, cid in ids.items() if cid in voir]
    want += [p for _, p, flag, _, _ in rows if flag == "oui"][:150]
    others = sorted((p for p in seen if p not in want), key=lambda p: hashlib.sha1(p.encode()).hexdigest())[:24]
    for p in dict.fromkeys(want + others):
        lf = low_file(p)
        if lf.exists():
            shutil.copy(lf, d / "orig" / (ids[p] + ".webp"))
    for i in range(0, min(len(pairs), 120), 12):
        sheet(pairs[i:i + 12], d / f"planche-{i // 12 + 1:02d}.jpg")
    with (d / "rapport.txt").open("w", encoding="utf-8") as fh:
        fh.write(f"Essai à blanc du {date.today().isoformat()} : {len(paths)} visuels contrôlés, "
                 f"{sum(1 for r in rows if r[2] == 'oui')} repérés sur les petits visuels, {len(fixed)} seraient redressés.\n")
        for cid in sorted(voir):
            p = next((p for p, c in ids.items() if c == cid), None)
            fh.write(f"Carte demandée {cid} ({p}) : {seen.get(p, 'visuel introuvable')}\n")
        fh.write("\n" + "\n".join(log) + "\n")
    print((d / "rapport.txt").read_text("utf-8")[:4000])


if __name__ == "__main__":
    main()
