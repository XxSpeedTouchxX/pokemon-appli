#!/usr/bin/env python3
"""
build_geo.py : contours des régions et des départements de France métropolitaine pour l'écran Radar.

Source : gregoiredavid/france-geojson, versions simplifiées (données IGN Admin Express, Licence Ouverte).
Lancé une fois (les contours ne changent pas) ; sortie dans web/data/geo/ :
  - regions.json : 13 régions ;
  - departements.json : 96 départements, chacun avec le code de sa région.
Chaque secteur porte son nom, un point d'étiquette à l'intérieur du contour (pôle d'inaccessibilité)
et son emprise (bbox) pour les zooms. Coordonnées arrondies à 3 décimales (environ 100 m) : les
frontières communes restent identiques d'un secteur à l'autre.

Usage : python3 tools/geo/build_geo.py [--src DOSSIER]  (sinon téléchargement depuis GitHub)
"""
import argparse
import heapq
import json
import math
from pathlib import Path
from urllib.request import Request, urlopen

RAW = "https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/"
FILES = {"regions": "regions-version-simplifiee.geojson", "departements": "departements-version-simplifiee.geojson"}
OUT = Path(__file__).resolve().parents[2] / "web" / "data" / "geo"

# Découpage officiel (INSEE) : région → départements.
REGIONS = {
    "11": "75 77 78 91 92 93 94 95", "24": "18 28 36 37 41 45", "27": "21 25 39 58 70 71 89 90",
    "28": "14 27 50 61 76", "32": "02 59 60 62 80", "44": "08 10 51 52 54 55 57 67 68 88",
    "52": "44 49 53 72 85", "53": "22 29 35 56", "75": "16 17 19 23 24 33 40 47 64 79 86 87",
    "76": "09 11 12 30 31 32 34 46 48 65 66 81 82", "84": "01 03 07 15 26 38 42 43 63 69 73 74",
    "93": "04 05 06 13 83 84", "94": "2A 2B",
}
SHORT = {"27": "Bourgogne-Franche-Comté", "93": "Provence-Alpes-Côte d’Azur"}
# Petite couronne : étiquettes décalées (en pixels) pour qu'elles ne se chevauchent pas.
OFFSETS = {"92": [-30, 4], "93": [24, -22], "94": [24, 24]}


def load(name, src):
    if src:
        return json.loads((Path(src) / FILES[name]).read_text("utf-8"))
    req = Request(RAW + FILES[name], headers={"User-Agent": "PKM-App/1.0"})
    with urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode("utf-8"))


def polygons(geom):
    return [geom["coordinates"]] if geom["type"] == "Polygon" else geom["coordinates"]


def round_ring(ring):
    out = []
    for x, y in ring:
        p = [round(x, 3), round(y, 3)]
        if not out or p != out[-1]:
            out.append(p)
    if out[0] != out[-1]:
        out.append(out[0])
    return out if len(out) >= 4 else None


def round_geom(geom):
    polys = []
    for poly in polygons(geom):
        outer = round_ring(poly[0])
        if outer:  # un îlot trop petit disparaît avec ses trous
            polys.append([outer] + [r for r in (round_ring(r) for r in poly[1:]) if r])
    if len(polys) == 1:
        return {"type": "Polygon", "coordinates": polys[0]}
    return {"type": "MultiPolygon", "coordinates": polys}


def ring_area(ring):
    return abs(sum(x1 * y2 - x2 * y1 for (x1, y1), (x2, y2) in zip(ring, ring[1:]))) / 2


def inside(x, y, rings):
    """Point dans un polygone (anneau extérieur et trous), par lancer de rayon."""
    c = False
    for ring in rings:
        for (x1, y1), (x2, y2) in zip(ring, ring[1:]):
            if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1:
                c = not c
    return c


def in_geom(x, y, geom):
    return any(inside(x, y, poly) for poly in polygons(geom))


def seg_dist2(px, py, ax, ay, bx, by):
    dx, dy = bx - ax, by - ay
    t = 0 if dx == dy == 0 else max(0, min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
    qx, qy = ax + t * dx - px, ay + t * dy - py
    return qx * qx + qy * qy


def signed_dist(x, y, rings):
    d = min(seg_dist2(x, y, *a, *b) for ring in rings for a, b in zip(ring, ring[1:]))
    return math.sqrt(d) * (1 if inside(x, y, rings) else -1)


def polylabel(rings, precision=0.002):
    """Pôle d'inaccessibilité (algorithme polylabel) : le point le plus loin des bords."""
    xs, ys = [p[0] for p in rings[0]], [p[1] for p in rings[0]]
    minx, miny, maxx, maxy = min(xs), min(ys), max(xs), max(ys)
    size = min(maxx - minx, maxy - miny)
    if size == 0:
        return [minx, miny]
    h = size / 2

    def cell(x, y, half):
        d = signed_dist(x, y, rings)
        return (-(d + half * math.sqrt(2)), d, x, y, half)

    q = []
    x = minx
    while x < maxx:
        y = miny
        while y < maxy:
            heapq.heappush(q, cell(x + h, y + h, h))
            y += size
        x += size
    best = cell((minx + maxx) / 2, (miny + maxy) / 2, 0)
    while q:
        c = heapq.heappop(q)
        if c[1] > best[1]:
            best = c
        if -c[0] - best[1] <= precision:
            continue
        half = c[4] / 2
        for dx in (-half, half):
            for dy in (-half, half):
                heapq.heappush(q, cell(c[2] + dx, c[3] + dy, half))
    return [best[2], best[3]]


def label_point(geom):
    """Étiquette dans le plus grand morceau, calculée en projection locale (longitudes × cos latitude)."""
    poly = max(polygons(geom), key=lambda p: ring_area(p[0]))
    k = math.cos(math.radians(sum(p[1] for p in poly[0]) / len(poly[0])))
    x, y = polylabel([[[px * k, py] for px, py in ring] for ring in poly])
    return [round(x / k, 3), round(y, 3)]


def bbox(geom):
    pts = [p for poly in polygons(geom) for p in poly[0]]
    return [min(p[0] for p in pts), min(p[1] for p in pts), max(p[0] for p in pts), max(p[1] for p in pts)]


def write(path, features):
    lines = ",\n".join(json.dumps(f, ensure_ascii=False, separators=(",", ":")) for f in features)
    path.write_text('{"type":"FeatureCollection","features":[\n' + lines + "\n]}\n", "utf-8")
    return path.stat().st_size


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", help="dossier contenant les fichiers france-geojson déjà téléchargés")
    args = ap.parse_args()

    dept_region = {d: r for r, ds in REGIONS.items() for d in ds.split()}
    regions, depts = [], []
    for f in load("regions", args.src)["features"]:
        code, geom = f["properties"]["code"], round_geom(f["geometry"])
        regions.append({"type": "Feature", "properties": {
            "code": code, "nom": f["properties"]["nom"], "court": SHORT.get(code, f["properties"]["nom"]),
            "label": label_point(geom), "bbox": bbox(geom), "depts": REGIONS[code].split()}, "geometry": geom})
    by_region = {r["properties"]["code"]: r for r in regions}
    for f in load("departements", args.src)["features"]:
        code, geom = f["properties"]["code"], round_geom(f["geometry"])
        props = {"code": code, "nom": f["properties"]["nom"], "region": dept_region[code], "label": label_point(geom), "bbox": bbox(geom)}
        if code in OFFSETS:
            props["offset"] = OFFSETS[code]
        depts.append({"type": "Feature", "properties": props, "geometry": geom})

    # Contrôles : 13 régions, 96 départements, chaque étiquette dans son secteur et dans sa région.
    assert len(regions) == 13 and len(depts) == 96, (len(regions), len(depts))
    assert sorted(dept_region) == sorted(d["properties"]["code"] for d in depts)
    for s in regions + depts:
        x, y = s["properties"]["label"]
        assert in_geom(x, y, s["geometry"]), s["properties"]["nom"]
    for d in depts:
        x, y = d["properties"]["label"]
        assert in_geom(x, y, by_region[d["properties"]["region"]]["geometry"]), d["properties"]["nom"]

    OUT.mkdir(parents=True, exist_ok=True)
    regions.sort(key=lambda f: f["properties"]["code"])
    depts.sort(key=lambda f: f["properties"]["code"])
    a = write(OUT / "regions.json", regions)
    b = write(OUT / "departements.json", depts)
    print(f"regions.json : {len(regions)} régions, {a // 1024} Ko · departements.json : {len(depts)} départements, {b // 1024} Ko")


if __name__ == "__main__":
    main()
