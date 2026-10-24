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
code postal) et à sa commune : addr:city d'OSM, sinon la commune trouvée par la position. Contours des communes :
france-geojson (données IGN, Licence Ouverte) ; noms officiels, article compris (« Le Havre ») : code officiel
géographique de l'INSEE (paquet npm @etalab/decoupage-administratif). Les deux fichiers sont téléchargés par le
workflow dans data/ et ne sont pas publiés. Arrondissement de Paris, Lyon et Marseille d'après le code postal. Coordonnées gardées quand la fiche OSM les donne : site,
téléphone, horaires (format OSM), adresse. Sortie : web/data/stores.json (1 Mo au plus), une boutique par ligne, triée pour des différences lisibles.
Données © les contributeurs d'OpenStreetMap, sous licence ODbL : la mention est obligatoire dans l'app.

Garde-fous (2026-10-11, après la tuile vide du 2026-10-05 : Normandie et Bretagne à zéro) :
  - une tuile vide, ou à moins de 50 % de son meilleur compte connu, est redemandée aux autres serveurs, puis le
    script échoue sans toucher à stores.json ;
  - chaque région doit garder au moins 70 % de son meilleur compte connu, et la France 95 % ;
  - meilleurs comptes connus : tools/stores/reference.json, relevés seulement après une liste acceptée
    (--reset-reference pour repartir des comptes du jour, après vérification à la main).

Usage : python3 tools/stores/sync_stores.py [--input overpass.json] [--reset-reference]
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
COMMUNES = ROOT / "data" / "communes.geojson"  # gitignorés ; voir .github/workflows/stores.yml
COMMUNE_NAMES = ROOT / "data" / "communes-noms.json"
REFERENCE = Path(__file__).with_name("reference.json")  # meilleurs comptes connus (tuiles, régions, total)
TILE_MIN, REGION_MIN, TOTAL_MIN = 0.5, 0.7, 0.95
UA = "PKM-App/1.0 (+https://github.com/XxSpeedTouchxX/pokemon-appli)"
ENDPOINTS = ["https://overpass-api.de/api/interpreter", "https://overpass.private.coffee/api/interpreter",
             "https://maps.mail.ru/osm/tools/overpass/api/interpreter"]
# France métropolitaine et Corse (41.3,-5.3,51.2,9.7) en 6 tuiles : des requêtes courtes passent mieux quand les
# serveurs Overpass sont chargés (une requête pour toute la France y finit en « 504 Gateway Timeout »).
LATS, LONS = (41.3, 44.6, 47.9, 51.2), (-5.3, 2.2, 9.7)
TILES = [f"{s},{w},{n},{e}" for s, n in zip(LATS, LATS[1:]) for w, e in zip(LONS, LONS[1:])]
TILE_TIMEOUT = 300  # secondes, côté serveur, par tuile
FIELDS = ["id", "nom", "type", "lat", "lon", "dept", "ville", "enseigne", "cartes", "site", "tel", "horaires", "adresse"]
CONTACT = slice(9, 13)  # site, tel, horaires, adresse
MAX_BYTES = 1_000_000
DEADLINE = 50 * 60  # le job GitHub Actions est coupé à 60 min : on abandonne avant, avec un message clair

# brand:wikidata → (type de boutique, nom de l'enseigne)
BRANDS = {
    "Q676585": ("culture", "Fnac"), "Q3007154": ("culture", "Cultura"),
    "Q137864222": ("culture", "Espace Culturel E.Leclerc"), "Q3312221": ("jv", "Micromania-Zing"),
    "Q3187152": ("jouets", "JouéClub"), "Q3197009": ("jouets", "King Jouet"),
    "Q3209556": ("jouets", "La Grande Récré"), "Q7546779": ("jouets", "Smyths Toys"),
    "Q1273376": ("hyper", "E.Leclerc"), "Q217599": ("hyper", "Carrefour"), "Q758603": ("hyper", "Auchan"),
    # Orchestra (mode enfant et puériculture, rayon jouets) : demande du porteur du 2026-10-24.
    "Q28042940": ("enfant", "Orchestra"),
}
SHOPS = {"trading_cards": "cartes", "games": "jeux", "video_games": "jv", "toys": "jouets",
         "comic": "bd", "anime": "bd", "collector": "collec"}
KINDS = {"cartes": "Boutique de cartes", "jeux": "Boutique de jeux", "jv": "Jeux vidéo", "jouets": "Magasin de jouets",
         "culture": "Grande surface culturelle", "hyper": "Hypermarché", "bd": "BD et mangas", "collec": "Objets de collection",
         "enfant": "Mode enfant et puériculture"}
NOT_HYPER = r"\b(express|drive|market|city|contact|proxi|piéton|pieton|supermarché|supermarche|relais|station|montagne|bio|my auchan|location|voyages?)\b"
EXCLUDED = r"warhammer|games workshop|\blego\b|playmobil|disney store|build.a.bear|oxybul|nature (?:&|et) d[ée]couvertes|b[ée]b[ée]|pu[ée]riculture|aubert"
TCG_HINT = r"pok[ée]mon|\btcg\b|trading card|cartes? [àa] collectionner|jeux? de cartes|magic the gathering|\bmtg\b|yu.?gi.?oh|lorcana"


def query(bbox):
    sel = "|".join(SHOPS)
    brands = "|".join(BRANDS)
    # Sans filtre « dans la France » (area) depuis le 2026-10-11 : c'est la partie la plus lourde de la requête, et les
    # serveurs saturés répondaient 504 même sur un quart de tuile. Les points hors de France sont écartés ensuite
    # (build : contours des départements, pays de l'adresse).
    return f"""[out:json][timeout:{TILE_TIMEOUT}];
(
  nwr["shop"~"^({sel})$"]({bbox});
  nwr["shop"]["brand:wikidata"~"^({brands})$"]({bbox});
);
out center tags qt;"""


def fetch(q, end, first=0, minimum=1, rounds=2):
    """(réponse, n° du serveur) : chaque serveur tour à tour, en commençant par `first`, `rounds` tours, avant `end`.
    Une réponse de moins de `minimum` éléments (vide, ou tronquée sans « remark ») est refusée : serveur suivant."""
    data = urlencode({"data": q}).encode()
    for attempt in range(rounds):
        for i in [(first + k) % len(ENDPOINTS) for k in range(len(ENDPOINTS))]:
            left = end - time.monotonic()
            if left < 60:
                return None, first
            try:
                req = Request(ENDPOINTS[i], data=data, headers={"User-Agent": UA, "Accept": "application/json"})
                with urlopen(req, timeout=min(TILE_TIMEOUT + 60, left)) as resp:
                    doc = json.loads(resp.read().decode("utf-8"))
                if doc.get("remark"):  # requête interrompue côté serveur : réponse incomplète
                    raise ValueError(doc["remark"])
                n = len(doc.get("elements") or [])
                if n < minimum:
                    raise ValueError(f"{n} éléments seulement, au moins {minimum} attendus : réponse vide ou tronquée")
                return doc, i
            except (OSError, http.client.HTTPException, ValueError) as e:  # dont HTTPError, URLError, coupure de connexion
                print(f"{ENDPOINTS[i]} : {type(e).__name__} {e}", flush=True)
                time.sleep(max(0, min(30 * (attempt + 1), end - time.monotonic())))
    return None, first


def tile_minimum(best):
    """Nombre d'éléments en dessous duquel la réponse d'une tuile est refusée : 50 % du meilleur compte, 1 au moins."""
    return max(1, math.ceil(TILE_MIN * (best or 0)))


def quarters(bbox):
    """Les 4 quarts d'une tuile « s,w,n,e »."""
    s, w, n, e = (float(v) for v in bbox.split(","))
    ms, mw = round((s + n) / 2, 3), round((w + e) / 2, 3)
    return [f"{a},{b},{c},{d}" for a, c in ((s, ms), (ms, n)) for b, d in ((w, mw), (mw, e))]


SPLIT_DEPTH = 2  # une tuile refusée est redemandée en 4 quarts, puis chaque quart refusé en 4 (2026-10-11)


def fetch_tile(bbox, end, good, minimum, depth=0):
    """(éléments sans doublon, n° du serveur) d'une tuile, ou (None, n°). La tuile entière d'abord ; si les serveurs
    saturent (cas de la tuile Bretagne-Normandie, très dense), ses 4 quarts. Un quart peut être vide (la mer) : c'est
    le total des quarts qui doit atteindre `minimum`, si bien qu'une réponse vide ne passe jamais pour la tuile."""
    doc, good = fetch(query(bbox), end, good, minimum if depth == 0 else 0, rounds=1 if depth < SPLIT_DEPTH else 2)
    if doc is not None:
        return {(e.get("type"), e.get("id")): e for e in doc.get("elements", [])}, good
    if depth >= SPLIT_DEPTH or end - time.monotonic() < 120:
        return None, good
    print(f"Tuile {bbox} : découpée en 4", flush=True)
    found = {}
    for part in quarters(bbox):
        time.sleep(max(0, min(5, end - time.monotonic() - 60)))
        got, good = fetch_tile(part, end, good, 0, depth + 1)
        if got is None:
            return None, good
        found.update(got)
    if len(found) < minimum:
        print(f"Tuile {bbox} : {len(found)} éléments en 4 quarts, au moins {minimum} attendus", flush=True)
        return None, good
    return found, good


def overpass(deadline=DEADLINE, best_tiles=None):
    """Toutes les tuiles, sans doublon (un bâtiment à cheval sur deux tuiles revient deux fois).
    best_tiles : meilleurs comptes connus par tuile ; une tuile trop courte est redemandée aux autres serveurs,
    puis en 4 quarts (fetch_tile)."""
    end = time.monotonic() + deadline
    found, good, tiles = {}, 0, {}
    # Une tuile qui échoue est remise en fin de file (2026-10-11) : les serveurs publics saturent par moments et
    # répondent quelques minutes plus tard. Échec seulement quand le temps manque ou après 3 passages.
    todo = list(enumerate(TILES, 1))
    for attempt in range(3):
        left = []
        for k, (n, bbox) in enumerate(todo):
            if k or attempt:
                time.sleep(max(0, min(10, end - time.monotonic() - 60)))  # politesse envers les serveurs publics
            minimum = tile_minimum((best_tiles or {}).get(bbox))
            got, good = fetch_tile(bbox, end, good, minimum)
            if got is None:
                print(f"Tuile {n}/{len(TILES)} ({bbox}) : pas de réponse complète, redemandée plus tard", flush=True)
                left.append((n, bbox))
                continue
            tiles[bbox] = len(got)
            found.update(got)
            print(f"Tuile {n}/{len(TILES)} : {len(got)} éléments ({ENDPOINTS[good]})", flush=True)
        todo = left
        if not todo or end - time.monotonic() < 120:
            break
    if todo:
        n, bbox = todo[0]
        minimum = tile_minimum((best_tiles or {}).get(bbox))
        print(f"::error::Overpass : tuile {n}/{len(TILES)} ({bbox}) sans réponse complète (au moins {minimum} éléments attendus)", flush=True)
        sys.exit(f"Overpass : tuile {n}/{len(TILES)} sans réponse complète (serveurs saturés, réponse vide ou tronquée, "
                 f"ou {deadline // 60} min écoulées) : stores.json n'est pas modifié.")
    return {"elements": list(found.values()), "tiles": tiles}


def fold(t):
    t = unicodedata.normalize("NFKD", str(t or ""))
    return re.sub(r"[\W_]+", " ", "".join(c for c in t if unicodedata.category(c) != "Mn").lower()).strip()


def classify(tags):
    """(type, enseigne) d'un élément OSM, ou None s'il est écarté."""
    name = (tags.get("name") or "").strip()
    shop = tags.get("shop") or ""
    text = " ".join(str(v) for k, v in tags.items() if k in ("name", "brand", "description", "operator", "shop"))
    brand = BRANDS.get(tags.get("brand:wikidata", ""))
    # Maxi Toys : magasins rachetés et devenus King Jouet (2022-2023), souvent encore « Maxi Toys » dans OSM.
    if not brand and re.match(r"maxi\s*-?\s*toys", name, re.I):
        brand = ("jouets", "King Jouet")
    if not name or tags.get("disused:shop") or tags.get("access") == "private" or (not brand and re.search(EXCLUDED, text, re.I)):
        return None
    if re.search(r"\b(fermé|closed)\b", tags.get("opening_hours", ""), re.I):
        return None
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


def contact(tags, city=""):
    """[site, téléphone, horaires, adresse] nettoyés ; chaîne vide quand l'information manque ou paraît fausse.
    city : commune trouvée par la position, ajoutée à l'adresse quand la fiche OSM n'en donne pas."""
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
    place = " ".join(x for x in (tags.get("addr:postcode", ""), tags.get("addr:city", "") or city) if x).strip()
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
            # Seulement près du département (îles, littoral) : un code postal allemand à 5 chiffres (« 79539 ») ne
            # doit pas rattacher une boutique d'outre-Rhin aux Deux-Sèvres.
            box = next((b for c, _, b, _ in self.items if c == code), None)
            if code in self.region and box and box[0] - 0.3 <= lon <= box[2] + 0.3 and box[1] - 0.3 <= lat <= box[3] + 0.3:
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


class Communes:
    """Commune (nom officiel) d'un point, d'après les contours simplifiés des communes, rangés par département.
    Les contours de france-geojson donnent des noms sans article (« Havre ») : le nom vient du code officiel
    géographique quand il est fourni (names : liste de {code, nom, type})."""

    def __init__(self, path=COMMUNES, names=COMMUNE_NAMES):
        official = {}
        if names and Path(names).exists():
            for c in json.loads(Path(names).read_text("utf-8")):
                if c.get("type") == "commune-actuelle" or c["code"] not in official:
                    official[c["code"]] = c["nom"]
        self.named = 0
        self.by_dept = {}
        for f in json.loads(Path(path).read_text("utf-8"))["features"]:
            g = f.get("geometry")
            if not g:
                continue
            polys = [g["coordinates"]] if g["type"] == "Polygon" else g["coordinates"]
            xs = [x for p in polys for x, _ in p[0]]
            ys = [y for p in polys for _, y in p[0]]
            code = f["properties"]["code"]
            self.named += code in official
            name = official.get(code) or f["properties"]["nom"]
            self.by_dept.setdefault(code[:2], []).append((name, (min(xs), min(ys), max(xs), max(ys)), polys))

    def locate(self, lon, lat, dept):
        items = self.by_dept.get(dept, [])
        for name, (w, s, e, n), polys in items:
            if w <= lon <= e and s <= lat <= n and any(sum(ring_inside(lon, lat, r) for r in p) % 2 for p in polys):
                return name
        # Hors des contours simplifiés (littoral, limites) : commune la plus proche à moins de 2 km.
        best, dist = None, 2.0
        k = math.cos(math.radians(lat))
        for name, (w, s, e, n), polys in items:
            if not (w - 0.03 <= lon <= e + 0.03 and s - 0.03 <= lat <= n + 0.03):
                continue
            for p in polys:
                for (x1, y1), (x2, y2) in zip(p[0], p[0][1:]):
                    d = seg_km(lon, lat, x1, y1, x2, y2, k)
                    if d < dist:
                        best, dist = name, d
        return best


ARRONDISSEMENTS = {"paris": ("75", 20), "lyon": ("69", 9), "marseille": ("13", 16)}


def with_district(city, postcode):
    """« Lyon » + 69002 → « Lyon 2e » ; « Paris » + 75116 → « Paris 16e » ; « Marseille » + 13001 → « Marseille 1er »."""
    a = ARRONDISSEMENTS.get(fold(city))
    m = re.fullmatch(r"(\d{2})(\d{3})", (postcode or "").strip())
    if not a or not m or m.group(1) != a[0]:
        return city
    n = int(m.group(2)) % 100 if a[0] != "75" or m.group(2) != "116" else 16
    return f"{city} {n}{'er' if n == 1 else 'e'}" if 1 <= n <= a[1] else city


def seg_km(px, py, ax, ay, bx, by, k):
    """Distance en km d'un point à un segment (projection locale)."""
    px, ax, bx = px * k, ax * k, bx * k
    dx, dy = bx - ax, by - ay
    t = 0 if dx == dy == 0 else max(0, min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
    return math.hypot(ax + t * dx - px, ay + t * dy - py) * 111.2


def build(elements, depts, communes=None):
    rows, skipped = [], {"écartés": 0, "hors France": 0, "doublons": 0}
    for el in elements:
        tags = el.get("tags") or {}
        c = classify(tags)
        lat, lon = (el.get("lat"), el.get("lon")) if el["type"] == "node" else ((el.get("center") or {}).get("lat"), (el.get("center") or {}).get("lon"))
        if not c or lat is None:
            skipped["écartés"] += 1
            continue
        country = (tags.get("addr:country") or "FR").strip().upper()
        dept = depts.locate(lon, lat, tags.get("addr:postcode", "")) if country in ("FR", "FRANCE") else None
        if not dept:
            skipped["hors France"] += 1
            continue
        kind, brand = c
        text = " ".join(str(v) for k, v in tags.items() if k in ("name", "description", "shop", "sells", "games", "trade") or k.startswith("sells:"))
        tcg = 1 if kind == "cartes" or re.search(TCG_HINT, text, re.I) else 0
        commune = communes.locate(lon, lat, dept) if communes else None
        city = with_district(" ".join(str(tags.get("addr:city") or commune or "").split()), tags.get("addr:postcode", ""))
        label = " ".join(tags["name"].split())
        if re.match(r"maxi\s*-?\s*toys", label, re.I):
            label = "King Jouet"  # Maxi Toys devenus King Jouet
        rows.append([el["type"][0] + str(el["id"]), label, kind, round(lat, 4), round(lon, 4), dept, city, brand, tcg]
                    + contact(tags, commune or ""))
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


def render(rows, regions=None, tiles=None):
    head = {"generated": time.strftime("%Y-%m-%d"), "source": "© les contributeurs d’OpenStreetMap, licence ODbL",
            "fields": FIELDS, "kinds": KINDS, "count": len(rows)}
    if regions:
        head["regions"] = dict(sorted(regions.items()))  # boutiques par région (contrôle)
    if tiles:
        head["tiles"] = tiles  # éléments Overpass par tuile (contrôle)
    body = ",\n".join(json.dumps(r, ensure_ascii=False, separators=(",", ":")) for r in rows)
    return json.dumps(head, ensure_ascii=False)[:-1] + ',\n"stores":[\n' + body + "\n]}\n"


def write(rows, regions=None, tiles=None):
    text = render(rows, regions, tiles)
    size = len(text.encode("utf-8"))
    if size > MAX_BYTES:
        sys.exit(f"stores.json ferait {size // 1024} Ko (plus de {MAX_BYTES // 1000} Ko) : fichier inchangé.")
    OUT.write_text(text, "utf-8")
    return size


def count_regions(rows, region):
    out = {}
    for r in rows:
        out[region[r[5]]] = out.get(region[r[5]], 0) + 1
    return out


def load_reference(path=None):
    try:
        ref = json.loads(Path(path or REFERENCE).read_text("utf-8"))
    except (OSError, ValueError):
        ref = {}
    return {"date": ref.get("date"), "total": ref.get("total", 0), "regions": ref.get("regions") or {}, "tiles": ref.get("tiles") or {}}


def guard(total, regions, ref, names=None):
    """Anomalies d'une nouvelle liste face aux meilleurs comptes connus : liste de messages (vide si tout va bien)."""
    problems = []
    if ref["total"] and total < ref["total"] * TOTAL_MIN:
        problems.append(f"{total} boutiques contre {ref['total']} au mieux ({ref['date']}) : moins de {TOTAL_MIN:.0%}")
    for code, best in sorted(ref["regions"].items()):
        n = regions.get(code, 0)
        if best and n < best * REGION_MIN:
            problems.append(f"région {(names or {}).get(code, code)} : {n} boutiques contre {best} au mieux, moins de {REGION_MIN:.0%}")
    return problems


def raise_reference(ref, total, regions, tiles, day, reset=False):
    """Meilleurs comptes connus après une liste acceptée : chaque compte ne fait que monter (sauf reset)."""
    if reset:
        return {"date": day, "total": total, "regions": dict(sorted(regions.items())), "tiles": dict(tiles or {})}
    new = {"date": ref["date"], "total": max(ref["total"], total),
           "regions": {k: max(ref["regions"].get(k, 0), regions.get(k, 0)) for k in sorted(set(ref["regions"]) | set(regions))},
           "tiles": {k: max(ref["tiles"].get(k, 0), (tiles or {}).get(k, 0)) for k in TILES if k in ref["tiles"] or k in (tiles or {})}}
    if new != ref:
        new["date"] = day
    return new


def save_reference(ref, path=None):
    note = ("Meilleurs comptes connus de stores.json (sync_stores.py) : boutiques au total et par région (code INSEE), "
            "éléments Overpass par tuile. Relevés seulement après une liste acceptée ; --reset-reference pour repartir à zéro.")
    Path(path or REFERENCE).write_text(json.dumps(dict({"note": note}, **ref), ensure_ascii=False, indent=1) + "\n", "utf-8")


def region_names():
    try:
        geo = json.loads((ROOT / "web" / "data" / "geo" / "regions.json").read_text("utf-8"))
        return {f["properties"]["code"]: f["properties"].get("nom") or f["properties"]["code"] for f in geo["features"]}
    except (OSError, ValueError, KeyError):
        return {}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", help="réponse Overpass déjà téléchargée (JSON)")
    ap.add_argument("--reset-reference", action="store_true",
                    help="accepte la liste du jour quels que soient les comptes et repart de ses comptes (après vérification)")
    args = ap.parse_args()
    ref = load_reference()
    doc = json.loads(Path(args.input).read_text("utf-8")) if args.input else overpass(best_tiles=ref["tiles"])
    communes = None
    if COMMUNES.exists():
        communes = Communes()
        total = sum(len(v) for v in communes.by_dept.values())
        print(f"Communes : {total} contours, {communes.named} noms officiels" + ("" if COMMUNE_NAMES.exists() else f" ({COMMUNE_NAMES} absent)"), flush=True)
    else:
        print(f"{COMMUNES} absent : villes tirées d'OpenStreetMap seulement.", flush=True)
    depts = Departments()
    rows, skipped = build(doc.get("elements", []), depts, communes)
    by_region = count_regions(rows, depts.region)
    names = region_names()
    problems = guard(len(rows), by_region, ref, names)
    if problems and not args.reset_reference:
        for p in problems:
            print(f"::error::Boutiques : {p}", flush=True)
        sys.exit("Réponse Overpass incomplète ? stores.json n'est pas modifié (voir tools/stores/reference.json).")
    size = write(rows, by_region, doc.get("tiles"))
    new_ref = raise_reference(ref, len(rows), by_region, doc.get("tiles"), time.strftime("%Y-%m-%d"), args.reset_reference)
    if new_ref != ref:
        save_reference(new_ref)
        print(f"Meilleurs comptes connus relevés : {new_ref['total']} boutiques.")
    by_kind = {}
    for r in rows:
        by_kind[r[2]] = by_kind.get(r[2], 0) + 1
    print(f"{len(rows)} boutiques ({size // 1024} Ko) · écartées : {skipped}")
    print("Par type : " + ", ".join(f"{KINDS[k]} {n}" for k, n in sorted(by_kind.items(), key=lambda x: -x[1])))
    print("Par région : " + ", ".join(f"{names.get(k, k)} {n}" for k, n in sorted(by_region.items())))
    print(f"Avec un indice cartes / Pokémon : {sum(r[8] for r in rows)}")
    print("Coordonnées : " + ", ".join(f"{k} {sum(1 for r in rows if r[FIELDS.index(k)])}" for k in FIELDS[CONTACT]))
    district = sum(1 for r in rows if re.search(r" \d+(er|e)$", r[6]))
    print(f"Avec une ville : {sum(1 for r in rows if r[6])} (dont {district} avec l'arrondissement)")


if __name__ == "__main__":
    main()
