#!/usr/bin/env python3
"""
sync_stores.py : boutiques réelles de France métropolitaine susceptibles de vendre des produits Pokémon,
d'après OpenStreetMap (API Overpass). Lancé chaque semaine par GitHub Actions (stores.yml).

Retenu :
  - boutiques de cartes, de jeux, de jeux vidéo, de jouets, de BD et mangas, d'objets de collection ;
  - enseignes : Fnac, Cultura, Espace Culturel E.Leclerc, Micromania-Zing, JouéClub, King Jouet,
    La Grande Récré, Smyths Toys ;
  - hypermarchés E.Leclerc, Carrefour et Auchan (pas les formats express, proximité ou drive).
Écarté : boutiques sans nom, fermées, Warhammer, LEGO, puériculture.

Chaque boutique est rattachée à son département (contours de web/data/geo/departements.json, sinon
code postal). Coordonnées gardées quand la fiche OSM les donne : site, téléphone, horaires (format OSM),
adresse. Sortie : web/data/stores.json (1 Mo au plus), une boutique par ligne, triée pour des différences lisibles.
Données © les contributeurs d'OpenStreetMap, sous licence ODbL : la mention est obligatoire dans l'app.

Usage : python3 tools/stores/sync_stores.py [--input overpass.json]
"""
import argparse
import http.client
import json
import math
import re
import sys
import time
import unicodedata
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "web" / "data" / "stores.json"
DEPTS = ROOT / "web" / "data" / "geo" / "departements.json"
UA = "PKM-App/1.0 (+https://github.com/XxSpeedTouchxX/pokemon-appli)"
ENDPOINTS = ["https://overpass-api.de/api/interpreter", "https://overpass.private.coffee/api/interpreter",
             "https://maps.mail.ru/osm/tools/overpass/api/interpreter"]
BBOX = "41.3,-5.3,51.2,9.7"  # France métropolitaine et Corse
FIELDS = ["id", "nom", "type", "lat", "lon", "dept", "ville", "enseigne", "cartes", "site", "tel", "horaires", "adresse"]
CONTACT = slice(9, 13)  # site, tel, horaires, adresse
MAX_BYTES = 1_000_000

# brand:wikidata → (type de boutique, nom de l'enseigne)
BRANDS = {
    "Q676585": ("culture", "Fnac"), "Q3007154": ("culture", "Cultura"),
    "Q137864222": ("culture", "Espace Culturel E.Leclerc"), "Q3312221": ("jv", "Micromania-Zing"),
    "Q3187152": ("jouets", "JouéClub"), "Q3197009": ("jouets", "King Jouet"),
    "Q3209556": ("jouets", "La Grande Récré"), "Q7546779": ("jouets", "Smyths Toys"),
    "Q1273376": ("hyper", "E.Leclerc"), "Q217599": ("hyper", "Carrefour"), "Q758603": ("hyper", "Auchan"),
}
SHOPS = {"trading_cards": "cartes", "games": "jeux", "video_games": "jv", "toys": "jouets",
         "comic": "bd", "anime": "bd", "collector": "collec"}
KINDS = {"cartes": "Boutique de cartes", "jeux": "Boutique de jeux", "jv": "Jeux vidéo", "jouets": "Magasin de jouets",
         "culture": "Grande surface culturelle", "hyper": "Hypermarché", "bd": "BD et mangas", "collec": "Objets de collection"}
NOT_HYPER = r"\b(express|drive|market|city|contact|proxi|piéton|pieton|supermarché|supermarche|relais|station|montagne|bio|my auchan|location|voyages?)\b"
EXCLUDED = r"warhammer|games workshop|\blego\b|playmobil|disney store|build.a.bear|oxybul|nature (?:&|et) d[ée]couvertes|b[ée]b[ée]|pu[ée]riculture|aubert"
TCG_HINT = r"pok[ée]mon|\btcg\b|trading card|cartes? [àa] collectionner|jeux? de cartes|magic the gathering|\bmtg\b|yu.?gi.?oh|lorcana"


def query():
    sel = "|".join(SHOPS)
    brands = "|".join(BRANDS)
    return f"""[out:json][timeout:600];
area["ISO3166-1"="FR"][admin_level=2]->.fr;
(
  nwr["shop"~"^({sel})$"](area.fr)({BBOX});
  nwr["shop"]["brand:wikidata"~"^({brands})$"](area.fr)({BBOX});
);
out center tags qt;"""


def overpass():
    data = urlencode({"data": query()}).encode()
    for attempt in range(2):
        for url in ENDPOINTS:
            try:
                req = Request(url, data=data, headers={"User-Agent": UA, "Accept": "application/json"})
                with urlopen(req, timeout=900) as resp:
                    doc = json.loads(resp.read().decode("utf-8"))
                if doc.get("remark"):
                    raise ValueError(doc["remark"])
                print(f"{url} : {len(doc.get('elements', []))} éléments")
                return doc
            except (OSError, http.client.HTTPException, ValueError) as e:  # dont HTTPError, URLError, coupure de connexion
                print(f"{url} : {type(e).__name__} {e}")
                time.sleep(30 * (attempt + 1))
    sys.exit("Overpass injoignable : stores.json n'est pas modifié.")


def fold(t):
    t = unicodedata.normalize("NFKD", str(t or ""))
    return re.sub(r"[\W_]+", " ", "".join(c for c in t if unicodedata.category(c) != "Mn").lower()).strip()


def classify(tags):
    """(type, enseigne) d'un élément OSM, ou None s'il est écarté."""
    name = (tags.get("name") or "").strip()
    shop = tags.get("shop") or ""
    text = " ".join(str(v) for k, v in tags.items() if k in ("name", "brand", "description", "operator", "shop"))
    if not name or tags.get("disused:shop") or tags.get("access") == "private" or re.search(EXCLUDED, text, re.I):
        return None
    if re.search(r"\b(fermé|closed)\b", tags.get("opening_hours", ""), re.I):
        return None
    brand = BRANDS.get(tags.get("brand:wikidata", ""))
    if brand:
        kind, label = brand
        if label == "E.Leclerc" and shop == "books":
            return "culture", "Espace Culturel E.Leclerc"
        if kind == "hyper":
            if shop not in ("supermarket", "department_store", "general") or re.search(NOT_HYPER, fold(name)):
                return None
        return kind, label
    kind = SHOPS.get(shop)
    return (kind, "") if kind else None


def first(value):
    """Première valeur d'un champ OSM à plusieurs valeurs (« a;b »)."""
    return str(value or "").split(";")[0].strip()


def contact(tags):
    """[site, téléphone, horaires, adresse] nettoyés ; chaîne vide quand l'information manque ou paraît fausse."""
    site = first(tags.get("website") or tags.get("contact:website") or tags.get("url"))
    if site and not re.match(r"^https?://", site, re.I):
        site = "https://" + site
    if not re.match(r"^https?://[\w.-]+\.[a-z]{2,}(?:[/?#]\S*)?$", site, re.I) or len(site) > 200:
        site = ""
    tel = " ".join(first(tags.get("phone") or tags.get("contact:phone")).split())
    if not re.fullmatch(r"\+?[\d .()-]{8,24}", tel):
        tel = ""
    hours = " ".join(str(tags.get("opening_hours") or "").split())
    if len(hours) > 160:
        hours = ""
    street = " ".join(x for x in (tags.get("addr:housenumber", ""), tags.get("addr:street", "")) if x).strip()
    place = " ".join(x for x in (tags.get("addr:postcode", ""), tags.get("addr:city", "")) if x).strip()
    address = ", ".join(x for x in (street, place) if x) if street else ""
    return [site, tel, hours, address]


def ring_inside(x, y, ring):
    c = False
    for (x1, y1), (x2, y2) in zip(ring, ring[1:]):
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1:
            c = not c
    return c


class Departments:
    def __init__(self, path=DEPTS):
        self.items = []
        for f in json.loads(Path(path).read_text("utf-8"))["features"]:
            g = f["geometry"]
            polys = [g["coordinates"]] if g["type"] == "Polygon" else g["coordinates"]
            self.items.append((f["properties"]["code"], f["properties"]["region"], f["properties"]["bbox"], polys))
        self.region = {code: region for code, region, _, _ in self.items}

    def locate(self, lon, lat, postcode=""):
        for code, _, (w, s, e, n), polys in self.items:
            if w <= lon <= e and s <= lat <= n and any(sum(ring_inside(lon, lat, r) for r in p) % 2 for p in polys):
                return code
        # Hors des contours simplifiés (littoral, îles) : code postal, sinon département le plus proche à moins de 3 km.
        pc = re.match(r"^(\d{2})(\d{3})$", (postcode or "").strip())
        if pc:
            code = pc.group(1) if pc.group(1) != "20" else ("2A" if int(pc.group(2)) < 200 else "2B")
            if code in self.region:
                return code
        best, dist = None, 3.0
        k = math.cos(math.radians(lat))
        for code, _, (w, s, e, n), polys in self.items:
            if not (w - 0.05 <= lon <= e + 0.05 and s - 0.05 <= lat <= n + 0.05):
                continue
            for p in polys:
                for (x1, y1), (x2, y2) in zip(p[0], p[0][1:]):
                    d = seg_km(lon, lat, x1, y1, x2, y2, k)
                    if d < dist:
                        best, dist = code, d
        return best


def seg_km(px, py, ax, ay, bx, by, k):
    """Distance en km d'un point à un segment (projection locale)."""
    px, ax, bx = px * k, ax * k, bx * k
    dx, dy = bx - ax, by - ay
    t = 0 if dx == dy == 0 else max(0, min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
    return math.hypot(ax + t * dx - px, ay + t * dy - py) * 111.2


def build(elements, depts):
    rows, skipped = [], {"écartés": 0, "hors France": 0, "doublons": 0}
    for el in elements:
        tags = el.get("tags") or {}
        c = classify(tags)
        lat, lon = (el.get("lat"), el.get("lon")) if el["type"] == "node" else ((el.get("center") or {}).get("lat"), (el.get("center") or {}).get("lon"))
        if not c or lat is None:
            skipped["écartés"] += 1
            continue
        dept = depts.locate(lon, lat, tags.get("addr:postcode", ""))
        if not dept:
            skipped["hors France"] += 1
            continue
        kind, brand = c
        text = " ".join(str(v) for k, v in tags.items() if k in ("name", "description", "shop", "sells", "games", "trade") or k.startswith("sells:"))
        tcg = 1 if kind == "cartes" or re.search(TCG_HINT, text, re.I) else 0
        city = tags.get("addr:city") or ""
        rows.append([el["type"][0] + str(el["id"]), " ".join(tags["name"].split()), kind, round(lat, 4), round(lon, 4), dept, city, brand, tcg] + contact(tags))
    # Doublons : même nom à moins de 100 m (un point et le bâtiment du même magasin, par exemple).
    rows.sort(key=lambda r: (r[0][0] != "w", r[0]))
    out, by_name = [], {}
    for r in rows:
        prev = by_name.setdefault(fold(r[1]), [])
        k = math.cos(math.radians(r[3]))
        twin = next((o for o in prev if math.hypot((o[4] - r[4]) * k, o[3] - r[3]) * 111.2 < 0.1), None)
        if twin:
            twin[6] = twin[6] or r[6]  # garde la ville connue par l'un ou l'autre
            twin[8] = max(twin[8], r[8])
            twin[CONTACT] = [a or b for a, b in zip(twin[CONTACT], r[CONTACT])]  # et ses coordonnées
            skipped["doublons"] += 1
            continue
        prev.append(r)
        out.append(r)
    out.sort(key=lambda r: (r[5], r[2], fold(r[1]), r[0]))
    return out, skipped


def render(rows):
    head = {"generated": time.strftime("%Y-%m-%d"), "source": "© les contributeurs d’OpenStreetMap, licence ODbL",
            "fields": FIELDS, "kinds": KINDS, "count": len(rows)}
    body = ",\n".join(json.dumps(r, ensure_ascii=False, separators=(",", ":")) for r in rows)
    return json.dumps(head, ensure_ascii=False)[:-1] + ',\n"stores":[\n' + body + "\n]}\n"


def write(rows):
    text = render(rows)
    size = len(text.encode("utf-8"))
    if size > MAX_BYTES:
        sys.exit(f"stores.json ferait {size // 1024} Ko (plus de {MAX_BYTES // 1000} Ko) : fichier inchangé.")
    OUT.write_text(text, "utf-8")
    return size


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", help="réponse Overpass déjà téléchargée (JSON)")
    ap.add_argument("--min-ratio", type=float, default=0.8, help="refuse une liste plus courte que ce ratio de la précédente")
    args = ap.parse_args()
    doc = json.loads(Path(args.input).read_text("utf-8")) if args.input else overpass()
    rows, skipped = build(doc.get("elements", []), Departments())
    previous = 0
    if OUT.exists():
        try:
            previous = json.loads(OUT.read_text("utf-8")).get("count", 0)
        except ValueError:
            previous = 0
    if previous and len(rows) < previous * args.min_ratio:
        sys.exit(f"Seulement {len(rows)} boutiques contre {previous} la dernière fois : réponse Overpass incomplète ? Fichier inchangé.")
    size = write(rows)
    by_kind = {}
    for r in rows:
        by_kind[r[2]] = by_kind.get(r[2], 0) + 1
    by_region = {}
    region = Departments().region
    for r in rows:
        by_region[region[r[5]]] = by_region.get(region[r[5]], 0) + 1
    print(f"{len(rows)} boutiques ({size // 1024} Ko) · écartées : {skipped}")
    print("Par type : " + ", ".join(f"{KINDS[k]} {n}" for k, n in sorted(by_kind.items(), key=lambda x: -x[1])))
    print("Par région : " + ", ".join(f"{k} {n}" for k, n in sorted(by_region.items())))
    print(f"Avec un indice cartes / Pokémon : {sum(r[8] for r in rows)}")
    print("Coordonnées : " + ", ".join(f"{k} {sum(1 for r in rows if r[FIELDS.index(k)])}" for k in FIELDS[CONTACT]))


if __name__ == "__main__":
    main()
