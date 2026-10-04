#!/usr/bin/env python3
"""
discover.py : liste les produits scellés de la galerie officielle Pokémon France et propose, pour chacun,
les produits Cardmarket qui pourraient lui correspondre. Lancé à la demande dans GitHub Actions.

Il écrit tools/sealed/candidates.json, un rapport de travail : la liste des produits retenus pour l'app
(tools/sealed/products.json) est arrêtée à partir de ce rapport, puis ne change plus d'elle-même
(le rapprochement Cardmarket n'est jamais refait chaque jour : un ETB et un ETB Pokémon Center se
ressemblent trop).

Sources :
  - https://www.pokemon.com/fr/jcc-pokemon/galerie-produits (et les pages par année) : nom, visuels,
    description et date de sortie de chaque produit ;
  - les articles mensuels « produits du JCC Pokémon qui sortiront en <mois> » : dates exactes ;
  - catalogue et guide des prix publics Cardmarket des produits scellés.
Une requête par seconde vers pokemon.com.
"""
import argparse
import gzip
import html
import json
import re
import time
import unicodedata
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

UA = "Mozilla/5.0 (compatible; PKM-App/1.0; +https://github.com/XxSpeedTouchxX/pokemon-appli)"
BASE = "https://www.pokemon.com"
GALLERY = BASE + "/fr/jcc-pokemon/galerie-produits"
NEWS = BASE + "/fr/actualites/"
MONTHLY = ["decouvrez-tous-les-produits-du-jcc-pokemon-qui-sortiront-en-",
           "un-apercu-de-tous-les-produits-du-jcc-pokemon-qui-sortiront-en-"]
MONTHS = ["janvier", "fevrier", "mars", "avril", "mai", "juin", "juillet", "aout", "septembre", "octobre", "novembre", "decembre"]
CM = "https://downloads.s3.cardmarket.com/productCatalog/"
CM_PRODUCTS = CM + "productList/products_nonsingles_6.json"
CM_PRICES = CM + "priceGuide/price_guide_6.json"
OUT = Path(__file__).with_name("candidates.json")

# Extensions récentes : nom français → nom anglais (Cardmarket), et code des visuels officiels.
SETS_FR_EN = {
    "30ᵉ Anniversaire": "30th Celebration", "30e Anniversaire": "30th Celebration",
    "Nuit Noire": "Pitch Black", "Chaos Ascendant": "Chaos Rising", "Équilibre Parfait": "Perfect Order",
    "Héros Transcendants": "Ascended Heroes", "Flammes Fantasmagoriques": "Phantasmal Flames",
    "Méga-Évolution": "Mega Evolution", "Règne Delta": "Delta Reign",
    "Foudre Noire": "Black Bolt", "Flamme Blanche": "White Flare", "Rivalités Destinées": "Destined Rivals",
    "Aventures Ensemble": "Journey Together", "Évolutions Prismatiques": "Prismatic Evolutions",
}
SET_CODES = {"me01": "Méga-Évolution", "me02": "Flammes Fantasmagoriques", "me025": "Héros Transcendants",
             "me02pt5": "Héros Transcendants", "me03": "Équilibre Parfait", "me04": "Chaos Ascendant",
             "me05": "Nuit Noire", "30th": "30ᵉ Anniversaire", "sv10pt5": "Foudre Noire", "sv10": "Rivalités Destinées"}
# Type de produit : mots français → code de l'app et mots anglais de Cardmarket.
TYPES = [
    ("ETB", r"coffret dresseur d ?elite", r"elite trainer box"),
    ("UPC", r"collection ultra ?premium", r"ultra ?premium collection"),
    ("BDL", r"lot de boosters", r"booster bundle"),
    ("DSP", r"display|boite de 36 boosters", r"booster box"),
    ("TIN", r"mini ?boite|pokebox|\btin\b", r"\btin\b"),
    ("BST", r"blister|booster", r"blister|booster"),
    ("DCK", r"deck", r"deck"),
    ("CFT", r"coffret|boite|collection", r"box|collection"),
]
EXCLUDED = r"pokemon center|\bcase\b|indonesian|thai|chinese|korean|japanese|sam s club|costco|\bsealed set\b"


def fold(t):
    t = unicodedata.normalize("NFKD", html.unescape(str(t or "")))
    t = "".join(ch for ch in t if unicodedata.category(ch) != "Mn")
    return re.sub(r"[\W_]+", " ", t.lower()).strip()


def get(url, binary=False):
    req = Request(url, headers={"User-Agent": UA, "Accept-Language": "fr-FR,fr;q=0.9", "Accept-Encoding": "gzip"})
    try:
        with urlopen(req, timeout=60) as resp:
            data = resp.read()
            if resp.headers.get("Content-Encoding") == "gzip":
                data = gzip.decompress(data)
            return resp.status, data if binary else data.decode("utf-8", "replace")
    except HTTPError as e:
        return e.code, b"" if binary else ""
    except (URLError, TimeoutError) as e:
        print(f"  {url} : {e}")
        return 0, b"" if binary else ""


class Page(HTMLParser):
    """Méta, liens, images et suite des titres et textes d'une page (sans les scripts)."""

    def __init__(self):
        super().__init__()
        self.meta, self.links, self.imgs, self.alternates, self.events = {}, [], [], {}, []
        self.heading, self.skip = None, 0

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in ("script", "style", "noscript"):
            self.skip += 1
        elif tag == "meta" and (a.get("property") or a.get("name")):
            self.meta[a.get("property") or a.get("name")] = html.unescape(a.get("content") or "")
        elif tag == "link" and a.get("rel") == "alternate" and a.get("hreflang"):
            self.alternates[a["hreflang"]] = a.get("href") or ""
        elif tag == "a" and a.get("href"):
            self.links.append(a["href"])
        elif tag == "img" and a.get("src"):
            alt = html.unescape(a.get("alt") or "")
            self.imgs.append((a["src"], alt))
            self.events.append(("img", a["src"], alt))
        elif tag in ("h1", "h2", "h3"):
            self.heading = [tag, ""]

    def handle_endtag(self, tag):
        if tag in ("script", "style", "noscript"):
            self.skip = max(0, self.skip - 1)
        elif self.heading and tag == self.heading[0]:
            self.events.append((tag, clean(self.heading[1])))
            self.heading = None

    def handle_data(self, data):
        if self.skip:
            return
        if self.heading is not None:
            self.heading[1] += data
        else:
            t = clean(data)
            if t:
                self.events.append(("text", t))


def clean(t):
    return " ".join(str(t).replace("\xa0", " ").replace(" ", " ").split())


def strip_brand(t):
    return re.sub(r"^JCC\s*Pokémon\s*:\s*", "", clean(t)).strip()


def absolute(src):
    return src if src.startswith("http") else BASE + src


DATE_RE = re.compile(r"Date de sortie\s*:?\s*((?:\d{1,2}(?:er)?\s+)?[a-zéû]+\s+\d{4}|\d+(?:e|er|ème)?\s+trimestre\s+\d{4})", re.I)


def product_type(name):
    n = fold(name)
    for code, fr, _ in TYPES:
        if re.search(fr, n):
            return code
    return "CFT"


def product_set(name, images):
    for fr in sorted(SETS_FR_EN, key=len, reverse=True):
        if fold(fr) in fold(name):
            return fr, SETS_FR_EN[fr]
    for src in images:
        m = re.search(r"/incrementals/\d{4}/([a-z0-9]+)-", src)
        if m and m.group(1) in SET_CODES:
            fr = SET_CODES[m.group(1)]
            return fr, SETS_FR_EN[fr]
    return None, None


def load_cardmarket():
    status, raw = get(CM_PRODUCTS)
    products = json.loads(raw).get("products", []) if status == 200 else []
    status, raw = get(CM_PRICES)
    prices = {p["idProduct"]: p for p in json.loads(raw).get("priceGuides", [])} if status == 200 else {}
    print(f"Cardmarket : {len(products)} produits scellés, {len(prices)} prix")
    for p in products:
        g = prices.get(p["idProduct"]) or {}
        p["trend"], p["avg30"], p["low"] = g.get("trend"), g.get("avg30"), g.get("low")
        p["fold"] = fold(p["name"])
    return [p for p in products if not re.search(EXCLUDED, p["fold"])]


def cardmarket_candidates(words, ptype, set_en, products):
    """Produits Cardmarket du même type (et de la même extension si connue), classés par mots en commun."""
    en_type = next(en for code, _, en in TYPES if code == ptype)
    out = []
    for p in products:
        if not re.search(en_type, p["fold"]):
            continue
        if set_en and fold(set_en) not in p["fold"]:
            continue
        score = len(words & set(p["fold"].split()))
        if not set_en and score < 2:
            continue
        out.append((score, p))
    out.sort(key=lambda x: (-x[0], -(x[1]["idProduct"])))
    return [{"cmId": p["idProduct"], "name": p["name"], "category": p.get("categoryName"), "added": (p.get("dateAdded") or "")[:10],
             "trend": p["trend"], "avg30": p["avg30"]} for _, p in out[:5]]


def monthly_articles(first, last):
    """Articles mensuels de Pokémon France : chaque section (titre h2) avec sa date de sortie et ses visuels."""
    out = []
    y, m = first
    while (y, m) <= last:
        for prefix in MONTHLY:
            url = f"{NEWS}{prefix}{MONTHS[m - 1]}-{y}"
            status, text = get(url)
            time.sleep(1)
            if status != 200:
                continue
            page = Page()
            page.feed(text)
            sections = []
            for ev in page.events:
                if ev[0] == "h2":
                    sections.append({"title": strip_brand(ev[1]), "text": [], "images": []})
                elif sections and ev[0] == "img" and "/trading-card-game/" in ev[1] and "/cards/" not in ev[1]:
                    sections[-1]["images"].append(absolute(ev[1]))
                elif sections and ev[0] in ("text", "h3"):
                    sections[-1]["text"].append(ev[1])
            for s in sections:
                body = " ".join(s.pop("text"))
                d = DATE_RE.search(body)
                s["date"] = d.group(1) if d else ""
                s["excerpt"] = body[:300]
            sections = [s for s in sections if s["date"] or s["images"]]
            print(f"{url} : {len(sections)} section(s)")
            out.append({"month": f"{y}-{m:02d}", "url": url, "sections": sections})
            break
        else:
            print(f"article {MONTHS[m - 1]} {y} : introuvable")
        y, m = (y + 1, 1) if m == 12 else (y, m + 1)
    return out


def dump(doc):
    """JSON lisible : un produit par ligne dans les listes."""
    parts = []
    for k, v in doc.items():
        if isinstance(v, list):
            inner = ",\n".join(json.dumps(x, ensure_ascii=False) for x in v)
            parts.append(f'"{k}": [\n{inner}\n]')
        else:
            parts.append(f'"{k}": {json.dumps(v, ensure_ascii=False)}')
    return "{\n" + ",\n".join(parts) + "\n}\n"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--years", default="2025,2026", help="pages de la galerie par année à parcourir")
    ap.add_argument("--months", default="2025-09:2026-12", help="articles mensuels à lire (début:fin)")
    ap.add_argument("--recent", default="2025-06-01", help="produits Cardmarket ajoutés depuis cette date (rapport)")
    args = ap.parse_args()

    listing = [GALLERY] + [f"{GALLERY}/{y}" for y in args.years.split(",") if y]
    seen = []
    for url in listing:
        status, text = get(url)
        page = Page()
        page.feed(text)
        before = len(seen)
        for href in page.links:
            m = re.match(r"^(?:https://www\.pokemon\.com)?(/fr/jcc-pokemon/galerie-produits/([a-z0-9-]+))/?$", href)
            if m and not m.group(2).isdigit() and m.group(1) not in seen:
                seen.append(m.group(1))
        print(f"{url} : {status} · {len(seen) - before} nouveau(x) produit(s)")
        time.sleep(1)

    cm = load_cardmarket()
    products = []
    for path in seen:
        url = BASE + path
        status, text = get(url)
        time.sleep(1)
        if status != 200:
            print(f"  {path} : {status}")
            continue
        page = Page()
        page.feed(text)
        title = strip_brand(page.meta.get("og:title", ""))
        body = " ".join(ev[1] for ev in page.events if ev[0] == "text")
        date = DATE_RE.search(body)
        images = [absolute(s) for s, _ in page.imgs if "/trading-card-game/" in s and "/_ui/" not in s]
        en = page.alternates.get("en") or page.alternates.get("en-us") or ""
        en_slug = en.rstrip("/").rsplit("/", 1)[-1] if "/product-gallery/" in en else ""
        img_slug = next((m.group(1) for m in (re.search(r"/incrementals/\d{4}/([a-z0-9-]+)/", s) for s in images) if m), "")
        ptype = product_type(title)
        set_fr, set_en = product_set(title, images)
        words = set(fold(title).split()) | set(en_slug.split("-")) | set(img_slug.split("-"))
        products.append({
            "slug": path.rsplit("/", 1)[1], "url": url, "name": title, "enSlug": en_slug, "imgSlug": img_slug,
            "type": ptype, "setFr": set_fr, "setEn": set_en, "date": date.group(1) if date else "",
            "description": page.meta.get("og:description", ""), "ogImage": page.meta.get("og:image", ""), "images": images,
            "cardmarket": cardmarket_candidates(words, ptype, set_en, cm),
        })
        p = products[-1]
        best = p["cardmarket"][0] if p["cardmarket"] else None
        print(f"  {ptype:3} {title} · {p['date'] or '?'} · {len(images)} image(s) · "
              + (f"Cardmarket {best['cmId']} {best['name']} ({best['trend']} €)" if best else "Cardmarket ?"))

    first, last = [tuple(int(x) for x in s.split("-")) for s in args.months.split(":")]
    articles = monthly_articles(first, last)

    recent = sorted((p for p in cm if (p.get("dateAdded") or "") >= args.recent), key=lambda p: (p.get("idExpansion") or 0, p["idProduct"]))
    recent = [[p["idProduct"], p["name"], p.get("categoryName"), p.get("idExpansion"), (p.get("dateAdded") or "")[:10], p["trend"], p["avg30"]]
              for p in recent]

    OUT.write_text(dump({"generated": time.strftime("%Y-%m-%d"), "products": products, "articles": articles,
                         "recentCardmarket": recent}), "utf-8")
    print(f"{len(products)} produits, {len(articles)} articles, {len(recent)} produits Cardmarket récents écrits dans {OUT}")


if __name__ == "__main__":
    main()
