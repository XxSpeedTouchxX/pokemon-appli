#!/usr/bin/env python3
"""
expansions.py : produits scellés officiels de chaque extension, d'après les pages tcg.pokemon.com (2026-11-15, porteur :
« je veux le visuel de tous absolument TOUS LES ITEMS par série et par extension »).

Deux étapes :
  collect : lit la page officielle de chaque extension Écarlate et Violet et Méga-Évolution
            (https://tcg.pokemon.com/fr-fr/expansions/<slug>/, section « Produits à l'affiche ») et note, pour chaque
            produit, son nom exact et son visuel officiel → tools/sealed/tcg-products.json. Une page illisible garde
            la liste déjà connue (rien n'est effacé). Une requête toutes les 3 secondes.
  merge   : range ces produits dans tools/sealed/products.json :
            - un produit déjà au catalogue (même extension, même sorte) reçoit le visuel officiel s'il n'en avait pas
              (displays de Méga-Évolution à Nuit Noire, par exemple) ;
            - un produit absent est ajouté (nom français nettoyé, sorte, extension, visuel officiel, recherche) ;
            - prix : avec le catalogue public Cardmarket (--cm, dans GitHub Actions), un produit ajouté est relié
              à ses identifiants Cardmarket seulement si la correspondance est sûre (même extension, même sorte, hors
              « Pokémon Center », caisses et langues asiatiques) ; sinon il reste sans cote, jamais une cote douteuse.
Les visuels sont ensuite téléchargés par fetch_images.py (même workflow « Catalogue scellé »).

Usage :
  python3 tools/sealed/expansions.py collect
  python3 tools/sealed/expansions.py merge [--cm products_nonsingles_6.json | --cm-url]
"""
import argparse
import html
import json
import re
import sys
import time
import unicodedata
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

HERE = Path(__file__).resolve().parent
RAW = HERE / "tcg-products.json"
PRODUCTS = HERE / "products.json"
BASE = "https://tcg.pokemon.com/fr-fr/expansions/"
CM_URL = "https://downloads.s3.cardmarket.com/productCatalog/productList/products_nonsingles_6.json"
UA = "Mozilla/5.0 (compatible; PKM-App/1.0; +https://github.com/XxSpeedTouchxX/pokemon-appli)"
PAUSE = 3

# Page officielle → extension TCGdex. « black-white » couvre Foudre Noire (sv10.5b) et Flamme Blanche (sv10.5w).
SLUGS = {
    "delta-reign": "me06", "30th-celebration": "30th", "pitch-black": "me05", "chaos-rising": "me04",
    "perfect-order": "me03", "ascended-heroes": "me02.5", "phantasmal-flames": "me02", "mega-evolution": "me01",
    "black-white": "sv10.5", "destined-rivals": "sv10", "journey-together": "sv09", "prismatic-evolutions": "sv08.5",
    "surging-sparks": "sv08", "stellar-crown": "sv07", "shrouded-fable": "sv06.5", "twilight-masquerade": "sv06",
    "temporal-forces": "sv05", "paldean-fates": "sv04.5", "paradox-rift": "sv04", "151": "sv03.5",
    "obsidian-flames": "sv03", "paldea-evolved": "sv02", "scarlet-violet": "sv01",
}
# Nom de l'extension chez Cardmarket (catalogue public, en anglais).
EN = {
    "me06": "Delta Reign", "30th": "30th Celebration", "me05": "Pitch Black", "me04": "Chaos Rising", "me03": "Perfect Order",
    "me02.5": "Ascended Heroes", "me02": "Phantasmal Flames", "me01": "Mega Evolution", "sv10.5b": "Black Bolt",
    "sv10.5w": "White Flare", "sv10": "Destined Rivals", "sv09": "Journey Together", "sv08.5": "Prismatic Evolutions",
    "sv08": "Surging Sparks", "sv07": "Stellar Crown", "sv06.5": "Shrouded Fable", "sv06": "Twilight Masquerade",
    "sv05": "Temporal Forces", "sv04.5": "Paldean Fates", "sv04": "Paradox Rift", "sv03.5": "151", "sv03": "Obsidian Flames",
    "sv02": "Paldea Evolved", "sv01": "Scarlet & Violet",
}
YEAR = {"me06": 2026, "30th": 2026, "me05": 2026, "me04": 2026, "me03": 2026, "me02.5": 2026, "me02": 2025, "me01": 2025,
        "sv10.5b": 2025, "sv10.5w": 2025, "sv10": 2025, "sv09": 2025, "sv08.5": 2025, "sv08": 2024, "sv07": 2024,
        "sv06.5": 2024, "sv06": 2024, "sv05": 2024, "sv04.5": 2024, "sv04": 2023, "sv03.5": 2023, "sv03": 2023, "sv02": 2023,
        "sv01": 2023}
# Sorte d'un produit : mots français (nom officiel) → code de l'app, mots anglais du catalogue Cardmarket.
KINDS = [
    ("ETB", r"coffret dresseur d ?elite", r"elite trainer box"),
    ("UPC", r"ultra ?premium", r"ultra ?premium collection"),
    ("BDL", r"lot de boosters", r"booster bundle"),
    ("DSP", r"presentoir|display", r"booster box|booster display"),
    ("DCK", r"boitier strategies et combats|strategies et combats", r"build (and |& )?battle (box|stadium)"),
    ("BST", r"booster sous pochette|booster sous blister|sleeved booster", r"sleeved booster"),
    ("TIN", r"mini ?boite|\btin\b", r"\btin\b"),
]
EXCLUDED = r"pokemon center|\bcase\b|indonesian|thai|chinese|korean|japanese|sam s club|costco|\bsealed set\b|\bempty\b"
IMG_RE = re.compile(r"<img[^>]+?(?:data-src|src)=\"(https://[^\"]+/collections/[^\"]+?\.(?:png|jpg|jpeg|webp))\"", re.I)
H3_RE = re.compile(r"<h3[^>]*>(.*?)</h3>", re.I | re.S)


def fold(t):
    t = unicodedata.normalize("NFKD", html.unescape(str(t or "")))
    t = "".join(ch for ch in t if unicodedata.category(ch) != "Mn")
    return re.sub(r"[\W_]+", " ", t.lower()).strip()


def text(t):
    t = re.sub(r"<[^>]+>", " ", t)
    return " ".join(html.unescape(t).replace("\xa0", " ").replace(" ", " ").split())


def get(url):
    req = Request(url, headers={"User-Agent": UA, "Accept": "text/html,application/json"})
    try:
        with urlopen(req, timeout=60) as r:
            return r.status, r.read().decode("utf-8", "replace")
    except HTTPError as e:
        return e.code, ""
    except (URLError, TimeoutError) as e:
        return 0, str(e)


def parse(page):
    """Produits « à l'affiche » : chaque visuel /collections/ suivi de son titre h3 (nom du produit)."""
    marks = [(m.start(), "img", m.group(1)) for m in IMG_RE.finditer(page)]
    marks += [(m.start(), "h3", text(m.group(1))) for m in H3_RE.finditer(page)]
    marks.sort()
    out, seen, img = [], set(), None
    for _, kind, val in marks:
        if kind == "img":
            img = val
        elif img and val and img not in seen and re.search(r"pok[eé]mon", fold(val)):
            seen.add(img)
            out.append({"name": val, "img": img})
            img = None
    return out


def collect():
    raw = json.loads(RAW.read_text("utf-8")) if RAW.exists() else {}
    ok = 0
    for slug, set_id in SLUGS.items():
        time.sleep(PAUSE)
        status, page = get(BASE + slug + "/")
        found = parse(page) if status == 200 else []
        if found:
            raw[set_id] = {"slug": slug, "products": found}
            ok += 1
            print(f"  {set_id} ({slug}) : {len(found)} produit(s)")
        else:
            prev = len((raw.get(set_id) or {}).get("products") or [])
            # Indices pour comprendre une page lue sans produit (2026-11-15) : taille, images de produits, titres.
            hint = f"{len(page or '')} car., {(page or '').count('/collections/')} image(s) de produits, {len(H3_RE.findall(page or ''))} titre(s)"
            print(f"  {set_id} ({slug}) : page illisible (réponse {status} · {hint}), {prev} produit(s) déjà connus gardés")
    RAW.write_text(json.dumps(raw, ensure_ascii=False, indent=1) + "\n", "utf-8")
    print(f"{ok}/{len(SLUGS)} pages lues")
    return ok


def kind_of(name):
    n = fold(name)
    for code, fr, _ in KINDS:
        if re.search(fr, n):
            return code
    return "CFT"


def clean_name(name, set_id):
    n = text(name).replace("_", "")
    n = re.sub(r"^JCC\s*Pok[ée]mon\s*:\s*", "", n, flags=re.I)
    n = " ".join(n.split())
    # « Méga-Évolution – Nuit Noire » → « Nuit Noire » ; « Écarlate et Violet – 151 » → « 151 » (sauf extensions de base).
    if set_id not in ("me01", "sv01"):
        n = re.sub(r"(Méga-Évolution|Écarlate et Violet)\s*[–-]\s*", "", n)
    n = re.sub(r"^présentoir (de|des) boosters\s+(.*)$", r"Display \2 (36 boosters)", n, flags=re.I)
    return n[:1].upper() + n[1:]


def set_of(set_id, name):
    if set_id != "sv10.5":
        return set_id
    f = fold(name)
    return "sv10.5w" if "flamme blanche" in f else "sv10.5b" if "foudre noire" in f else None


def pid(img):
    stem = re.sub(r"\.(png|jpe?g|webp)$", "", img.rsplit("/", 1)[-1], flags=re.I).lower()
    stem = re.sub(r"^p\d{4}_", "", stem)
    stem = re.sub(r"[-_](fr|en)$", "", stem)
    return "tcg-" + re.sub(r"[^a-z0-9]+", "-", stem).strip("-")


GENERIC = {"collection", "coffret", "boite", "de", "des", "du", "la", "le", "les", "et", "avec", "ou", "jcc", "pokemon",
           "mega", "evolution", "ecarlate", "violet", "premium", "speciale", "special", "ex", "v", "vmax", "vstar", "gx"}


def set_words(set_id):
    """Mots du nom français de l'extension (cards-base.json) : communs à tous ses produits, donc pas distinctifs."""
    try:
        sets = json.loads((HERE.parents[1] / "web" / "data" / "cards-base.json").read_text("utf-8")).get("sets", {})
    except (OSError, ValueError):
        sets = {}
    return set(fold((sets.get(set_id) or [""])[0]).split())


def same(p, set_id, kind, name):
    """Même produit déjà au catalogue : même extension et même sorte ; collections et boîtes : au moins un mot
    distinctif en commun (poster, classeur, nom du Pokémon…), hors mots de l'extension et mots génériques."""
    if p.get("set") != set_id:
        return False
    pk = p.get("type")
    if kind not in ("CFT", "TIN"):
        return pk == kind
    skip = GENERIC | set_words(set_id)
    mine = set(fold(name).split()) - skip
    return pk in ("CFT", "TIN", "BST") and bool(mine & (set(fold(p.get("name")).split()) - skip))


def load_cm(path=None, url=False):
    if path:
        d = json.loads(Path(path).read_text("utf-8"))
    elif url:
        status, body = get(CM_URL)
        if status != 200:
            print(f"Catalogue Cardmarket injoignable (réponse {status}) : aucun prix relié")
            return []
        d = json.loads(body)
    else:
        return []
    prods = d.get("products", []) if isinstance(d, dict) else d
    for p in prods:
        p["fold"] = fold(p.get("name"))
    return [p for p in prods if not re.search(EXCLUDED, p["fold"])]


# Nom Cardmarket exact de chaque sorte, après le nom de l'extension (2026-11-15) : « Booster Bundle » mais pas
# « Booster Bundle Display » (6 lots), « Build & Battle Box » mais pas « … Box Display » (10 boîtiers), « Booster Box »
# (36 boosters) mais pas « Booster Box (18 Boosters) » ni « Enhanced Booster Box ». Sinon la cote (médiane des produits
# reliés) mélange un article et un carton entier.
CM_EXACT = {
    "ETB": r"elite trainer box( (?!display|case|bundle|plus)[a-z]+)?",
    "BDL": r"booster bundle",
    "DSP": r"booster (box|display|display box)",
    "DCK": r"build (and )?battle box",  # « Boîtier » ; le « Stade » (Stadium) est un autre produit
    "BST": r"sleeved booster",
    "UPC": r"ultra ?premium collection",
}


def cm_match(set_id, kind, cm):
    """Identifiants Cardmarket sûrs : nom exact « <extension> <sorte> » (ETB, lot, display, Stratégies et Combats,
    booster sous pochette, Ultra-Premium). Collections et boîtes : jamais devinées."""
    if not cm or set_id not in EN or kind not in CM_EXACT:
        return []
    head = fold(EN[set_id])
    hits = [p for p in cm if p["fold"].startswith(head + " ") and re.fullmatch(CM_EXACT[kind], p["fold"][len(head) + 1:])]
    if set_id == "sv01":  # « Scarlet & Violet Elite Trainer Box » mais pas « Scarlet & Violet 151 … »
        hits = [p for p in hits if not re.search(r"\b(151|paldea|obsidian|paradox|temporal|twilight|shrouded|stellar|surging|prismatic|journey|destined|black bolt|white flare)\b", p["fold"])]
    return sorted(p["idProduct"] for p in hits)[:4] if 0 < len(hits) <= 4 else []


def dump(doc):
    """Même mise en page que products.json : une clé par ligne, un produit par ligne."""
    keys, lines = list(doc), ["{"]
    for i, k in enumerate(keys):
        end = "," if i < len(keys) - 1 else ""
        if k == "products":
            lines.append('"products": [\n' + ",\n".join(json.dumps(p, ensure_ascii=False) for p in doc[k]) + "\n]" + end)
        else:
            lines.append(json.dumps(k) + ": " + json.dumps(doc[k], ensure_ascii=False) + end)
    return "\n".join(lines) + "\n}\n"


def merge(cm):
    raw = json.loads(RAW.read_text("utf-8"))
    doc = json.loads(PRODUCTS.read_text("utf-8"))
    prods = doc["products"]
    ids = {p["id"] for p in prods}
    added = filled = priced = 0
    for page_set, entry in raw.items():
        for item in entry.get("products") or []:
            set_id = set_of(page_set, item["name"])
            if not set_id or not str(item.get("img", "")).startswith("https://"):
                continue
            name = clean_name(item["name"], set_id)
            kind = kind_of(item["name"])
            twin = next((p for p in prods if same(p, set_id, kind, name)), None)
            if twin:
                if not twin.get("img"):
                    twin["img"] = item["img"]
                    twin["imgSource"] = "tcg.pokemon.com"
                    filled += 1
                continue
            new_id = pid(item["img"])
            if new_id in ids:
                continue
            p = {"id": new_id, "name": name, "type": kind, "set": set_id, "year": YEAR.get(set_id), "img": item["img"],
                 "imgSource": "tcg.pokemon.com", "q": "pokemon " + fold(name)}
            ids_cm = cm_match(set_id, kind, cm)
            if ids_cm:
                p["cm"] = ids_cm
                p["cmAuto"] = True
                priced += 1
            prods.append(p)
            ids.add(new_id)
            added += 1
    # Produits ajoutés lors d'un passage sans catalogue Cardmarket (en local) : reliés dès que le catalogue est là.
    # Les liens posés automatiquement (cmAuto) sont recalculés à chaque passage : une règle plus stricte les corrige.
    relinked = 0
    for p in prods:
        if cm and p.get("imgSource") == "tcg.pokemon.com" and (not p.get("cm") or p.get("cmAuto")):
            ids_cm = cm_match(p.get("set"), p.get("type"), cm)
            if ids_cm:
                if p.get("cm") != ids_cm:
                    relinked += bool(p.get("cm"))
                    priced += not p.get("cm")
                p["cm"] = ids_cm
                p["cmAuto"] = True
            elif p.get("cmAuto"):
                p.pop("cm", None)
                p.pop("cmAuto", None)
                relinked += 1
    PRODUCTS.write_text(dump(doc), "utf-8")
    print(f"products.json : {added} produit(s) ajouté(s), {priced} relié(s) à Cardmarket, {relinked} lien(s) corrigé(s), {filled} visuel(s) officiel(s) complété(s)")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("step", choices=["collect", "merge"])
    ap.add_argument("--cm", help="catalogue Cardmarket (products_nonsingles_6.json) déjà téléchargé")
    ap.add_argument("--cm-url", action="store_true", help="télécharger le catalogue Cardmarket")
    a = ap.parse_args()
    if a.step == "collect":
        return 0 if collect() else 1
    merge(load_cm(a.cm, a.cm_url))
    return 0


if __name__ == "__main__":
    sys.exit(main())
