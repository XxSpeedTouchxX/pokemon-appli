"""Visuels de cartes « de travers » (2026-11-13, porteur : « certaines cartes sont tordues, arrange cela dans le cadrage »).

Une partie des visuels TCGdex (surtout des extensions anciennes, en français) sont des photos de la carte, prises un peu
de travers, avec un fond autour : Rayquaza ☆ d'EX Deoxys (ex8-107) en est l'exemple envoyé par le porteur. Ce module :

1. trouve la carte dans le visuel (ses 4 bords) ;
2. décide si le visuel est « de travers » : carte tournée, en perspective, ou entourée de fond ;
3. redresse et recadre la carte au format des visuels TCGdex (600 × 825), coins arrondis transparents.

Un vrai scan (la carte remplit tout le visuel, coins transparents) n'est jamais touché. Rien n'est inventé : seuls les
pixels de la photo sont déplacés (perspective), comme quand on remet une photo droite.

Usage (GitHub Actions, workflow « Cadrage des cartes ») :
    python3 tools/cadrage/redresse.py            # tout le catalogue
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
# Seuils : au-delà, le visuel est « de travers ».
TILT_DEG = 0.8           # bord penché de plus de 0,8°
PERSP = 0.025            # côtés opposés de longueurs différentes de plus de 2,5 % (photo en perspective)
FRAMED = 0.05            # fond de plus de 5 % de la largeur ou de la hauteur d'un côté
AGREE = 0.02             # petit et grand visuel : mêmes coins à 2 % de la largeur près (sinon détection instable)
CONTRAST = 22.0          # écart de couleur minimal entre le fond et le bord de la carte (Lab)
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


def find_card(img):
    """Carte dans le visuel : {'q': 4 coins (TL, TR, BR, BL), 'src': 'alpha' | 'bords'} ou None.
    Visuel avec transparence : la forme de la carte vient de sa transparence. Sinon : bords de la carte (contours)."""
    bgr, alpha = split(img)
    h, w = bgr.shape[:2]
    k = 520.0 / max(w, h)
    small = cv2.resize(bgr, (round(w * k), round(h * k)), interpolation=cv2.INTER_AREA) if k < 1 else bgr
    sh, sw = small.shape[:2]
    scale = w / sw
    if alpha is not None and (alpha < 128).mean() > 0.002:
        a = cv2.resize(alpha, (sw, sh), interpolation=cv2.INTER_AREA) if k < 1 else alpha
        mask = (a >= 128).astype(np.uint8) * 255
        cs, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
        if not cs:
            return None
        c = max(cs, key=cv2.contourArea)
        if cv2.contourArea(c) < 0.25 * sw * sh:
            return None
        return {"q": _quad(c, sw, sh) * scale, "src": "alpha"}
    gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray, (5, 5), 0)
    best = None
    v = float(np.median(gray))
    for lo, hi in ((max(10, 0.5 * v), min(255, 1.2 * v + 30)), (20, 60), (40, 120)):
        edges = cv2.Canny(gray, lo, hi)
        edges = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5)), iterations=2)
        cs, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
        for c in cs:
            area = cv2.contourArea(cv2.convexHull(c))
            if area >= 0.25 * sw * sh and (best is None or area > best[0]):
                best = (area, c)
        if best is not None:
            break
    if best is None:
        return None
    return {"q": _quad(best[1], sw, sh) * scale, "src": "bords"}


def measure(q, w, h):
    """Mesures d'une carte trouvée : penche (degrés), perspective, fond de chaque côté, proportions, surface."""
    tl, tr, br, bl = q
    top, bottom = np.linalg.norm(tr - tl), np.linalg.norm(br - bl)
    left, right = np.linalg.norm(bl - tl), np.linalg.norm(br - tr)
    ang = lambda a, b, horiz: abs(math.degrees(math.atan2(b[1] - a[1], b[0] - a[0]) if horiz else math.atan2(b[0] - a[0], b[1] - a[1])))
    tilt = max(ang(tl, tr, True), ang(bl, br, True), ang(tl, bl, False), ang(tr, br, False))
    persp = max(abs(top - bottom) / max(top, bottom), abs(left - right) / max(left, right))
    margins = [min(tl[0], bl[0]) / w, min(tl[1], tr[1]) / h, (w - max(tr[0], br[0])) / w, (h - max(bl[1], br[1])) / h]
    aspect = ((top + bottom) / 2) / ((left + right) / 2)
    area = cv2.contourArea(q.astype(np.float32)) / (w * h)
    return {"tilt": tilt, "persp": persp, "margins": margins, "aspect": aspect, "area": area}


def border_contrast(img, q):
    """Écart de couleur (Lab) entre une bande juste à l'extérieur de la carte et une bande juste à l'intérieur."""
    bgr = split(img)[0]
    h, w = bgr.shape[:2]
    k = 900.0 / max(w, h)
    if k < 1:
        bgr = cv2.resize(bgr, (round(w * k), round(h * k)), interpolation=cv2.INTER_AREA)
        q = q * k
        h, w = bgr.shape[:2]
    mask = np.zeros((h, w), np.uint8)
    cv2.fillPoly(mask, [np.round(q).astype(np.int32)], 255)
    r = max(2, round(0.02 * w))
    ker = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * r + 1, 2 * r + 1))
    outer = cv2.dilate(mask, ker) & ~mask
    inner = mask & ~cv2.erode(mask, ker)
    if cv2.countNonZero(outer) < 0.004 * w * h or cv2.countNonZero(inner) == 0:
        return 0.0
    lab = cv2.cvtColor(bgr, cv2.COLOR_BGR2LAB).astype(np.float32)
    mo = np.array(cv2.mean(lab, outer)[:3])
    mi = np.array(cv2.mean(lab, inner)[:3])
    return float(np.linalg.norm(mo - mi))


def crooked(img):
    """(True/False, carte trouvée, mesures, raison) : True quand le visuel doit être redressé ou recadré."""
    card = find_card(img)
    h, w = img.shape[:2]
    if card is None:
        return False, None, None, "carte introuvable"
    m = measure(card["q"], w, h)
    if not (0.62 <= m["aspect"] <= 0.82) or m["area"] < 0.35:
        return False, card, m, "forme différente d'une carte"
    # La carte touche le bord du visuel : c'est un scan plein cadre (ou une photo coupée, impossible à compléter).
    if min(m["margins"]) < 0.004:
        return False, card, m, "carte jusqu'au bord du visuel"
    # Autour de la carte, il faut du fond : une couleur nettement différente du bord de la carte juste à l'intérieur.
    # Sinon le contour trouvé est une ligne dessinée sur la carte (cadre intérieur, bord doré à paillettes) : scan droit.
    if card["src"] != "alpha":
        de = border_contrast(img, card["q"])
        m["contrast"] = de
        if de < CONTRAST:
            return False, card, m, f"pas de fond autour de la carte (écart de couleur {de:.0f})"
    why = []
    if m["tilt"] >= TILT_DEG:
        why.append(f"penchée de {m['tilt']:.1f}°")
    if m["persp"] >= PERSP:
        why.append(f"perspective {m['persp'] * 100:.1f} %")
    if max(m["margins"]) >= FRAMED:
        why.append(f"fond autour ({max(m['margins']) * 100:.0f} %)")
    return bool(why), card, m, ", ".join(why) or "droite"


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
    ap.add_argument("--max", type=int, default=3000, help="au-delà, rien n'est publié (détection à revoir)")
    a = ap.parse_args()
    doc = json.loads((ROOT / "web/data/cards.json").read_text("utf-8"))
    f = {k: i for i, k in enumerate(doc["fields"])}
    assets = doc.get("img") or "https://assets.tcgdex.net/"
    only = {x for x in a.only.split(",") if x}
    paths = {}
    for r in doc["cards"]:
        p = r[f["img"]]
        if not p or p.startswith(("ptcg:", "sdx:")) or p.startswith("http"):
            continue
        if only and r[f["id"]] not in only:
            continue
        paths.setdefault(p, r[f["id"]])
    cache, high = Path(a.cache), ROOT / ".cache/cadrage/high"
    cache.mkdir(parents=True, exist_ok=True)
    high.mkdir(parents=True, exist_ok=True)
    low_file = lambda p: cache / (hashlib.sha1((assets + p + "/low.webp").encode()).hexdigest()[:20] + ".webp")
    print(f"{len(paths)} visuels TCGdex à contrôler")
    with ThreadPoolExecutor(12) as ex:
        ok = list(ex.map(lambda p: get(assets + p + "/low.webp", low_file(p)), paths))
    print(f"petits visuels : {sum(ok)} disponibles, {len(ok) - sum(ok)} introuvables")
    # 1. Tri sur le petit visuel ; 2. confirmation et redressement sur le grand.
    cand = []
    for p, cid in paths.items():
        lf = low_file(p)
        if not lf.exists():
            continue
        im = read(lf)
        if im is None:
            continue
        bad, _, m, why = crooked(im)
        if bad:
            cand.append((p, cid, why))
    print(f"{len(cand)} visuels peut-être de travers sur les petits visuels (vérifiés sur les grands)")
    if len(cand) > 4 * a.max:
        sys.exit(f"Trop de visuels repérés ({len(cand)}) : détection à revoir, rien n'est publié.")
    out_dir = ROOT / "web/img/fix"
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
        # Même carte trouvée sur le petit et le grand visuel ? Un cadre dessiné sur la carte (faux contour) ne l'est
        # presque jamais aux deux tailles ; le vrai bord d'une photo, toujours.
        lim = read(low_file(p))
        lc = find_card(lim) if lim is not None else None
        if lc is None or np.max(np.linalg.norm(lc["q"] * (im.shape[1] / lim.shape[1]) - card["q"], axis=1)) > AGREE * im.shape[1]:
            log.append(f"{cid} {p} : détection instable entre petit et grand visuel, laissé tel quel")
            continue
        hi = rectify(im, card["q"])
        lo = cv2.resize(hi, (LOW_W, round(LOW_W * H / W)), interpolation=cv2.INTER_AREA)
        k = key_of(p)
        cv2.imwrite(str(out_dir / (k + ".webp")), hi, [cv2.IMWRITE_WEBP_QUALITY, 90])
        cv2.imwrite(str(out_dir / (k + "-low.webp")), lo, [cv2.IMWRITE_WEBP_QUALITY, 86])
        fixed[p] = hashlib.sha1((out_dir / (k + ".webp")).read_bytes()).hexdigest()[:8]
        log.append(f"{cid} {p} : {why2}")
        pairs.append((cid, im, hi))
    if len(fixed) > a.max:
        sys.exit(f"Trop de visuels redressés ({len(fixed)} > {a.max}) : détection à revoir, rien n'est publié.")
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


if __name__ == "__main__":
    main()
