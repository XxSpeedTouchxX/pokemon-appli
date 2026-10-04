#!/usr/bin/env python3
"""
build_sealed.py : catalogue scellé de l'app avec les prix du jour → web/data/sealed.json.
Lancé chaque jour par le workflow « Catalogue scellé » (seul à écrire ce fichier) ; chaque mise à jour est
un commit, l'historique git sert d'archive quotidienne des prix (comme pour les cartes).

Entrées :
  - tools/sealed/products.json : liste figée des produits (nom, type, extension, sortie, ids Cardmarket) ;
  - guide des prix public Cardmarket (price_guide_6.json) : tendance, moyennes 30, 7 et 1 jours, plus bas ;
    le guide public ne donne pas encore de moyennes pour le scellé : la tendance du jour est donc archivée ici,
    31 jours glissants (en-tête « days », colonne « hist » alignée sur ces jours) ;
  - web/img/products/<id>.webp : visuel officiel, s'il a été téléchargé (fetch_images.py).
Prix d'un produit à plusieurs variantes (ex. deux coffrets) : médiane des variantes.
Page Sorties de l'app : ASIN Amazon (amazon, refusé s'il est mal formé), prix de lancement constatés (msrp, une
valeur ou une fourchette) et leur source, texte des recherches chez les enseignes (q), source de la date.
Si le guide des prix est injoignable, les prix de la veille sont gardés.

Usage : python3 tools/sealed/build_sealed.py [--prices price_guide_6.json | --offline]
"""
import argparse
import json
import re
import statistics
import time
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[2]
PRODUCTS = Path(__file__).with_name("products.json")
OUT = ROOT / "web" / "data" / "sealed.json"
IMG = ROOT / "web" / "img" / "products"
PRICES = "https://downloads.s3.cardmarket.com/productCatalog/priceGuide/price_guide_6.json"
FIELDS = ["id", "name", "type", "set", "release", "releaseText", "year", "photo", "trend", "avg30", "low", "variants",
          "amazon", "msrp", "msrpSource", "q", "dateSource", "avg7", "avg1", "hist"]
HIST_DAYS = 31
PRICED = ("trend", "avg30", "low", "avg7", "avg1")  # prix gardés d'un jour à l'autre si le guide manque
ASIN = re.compile(r"^[A-Z0-9]{10}$")


def fetch_prices():
    for attempt in range(3):
        try:
            req = Request(PRICES, headers={"User-Agent": "PKM-App/1.0 (+https://github.com/XxSpeedTouchxX/pokemon-appli)"})
            with urlopen(req, timeout=120) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except (HTTPError, URLError, TimeoutError, ValueError) as e:
            print(f"Guide des prix Cardmarket : {e}")
            time.sleep(20 * (attempt + 1))
    return None


def asin(product):
    """ASIN Amazon du produit, ou None s'il manque ou est mal formé (10 lettres majuscules et chiffres)."""
    value = product.get("amazon") or ""
    if value and not ASIN.match(value):
        print(f"ASIN refusé pour {product['id']} : {value!r}")
        return None
    return value or None


def msrp(product):
    """Prix de lancement constaté : une valeur ou une fourchette [bas, haut], en euros."""
    values = product.get("msrp") or []
    ok = isinstance(values, list) and 1 <= len(values) <= 2 and all(isinstance(v, (int, float)) and v > 0 for v in values)
    return sorted(values) if ok and product.get("msrpSource") else None


def median(values):
    xs = [v for v in values if isinstance(v, (int, float)) and v > 0]
    return round(statistics.median(xs), 2) if xs else None


def build(products, guide, previous):
    prices = {g["idProduct"]: g for g in (guide or {}).get("priceGuides", [])}
    rows, priced = [], 0
    for p in products:
        found = [prices[i] for i in p.get("cm", []) if i in prices]
        if guide is not None:
            trend, avg30, low, avg7, avg1 = (median(g.get(k) for g in found) for k in PRICED)
        else:
            trend, avg30, low, avg7, avg1 = (previous.get(p["id"]) or [None] * len(PRICED))
        photo = (IMG / (p["id"] + ".webp")).exists()
        price = msrp(p)
        rows.append([p["id"], p["name"], p["type"], p.get("set") or "", p.get("release") or "", p.get("releaseText") or "",
                     p.get("year") or 0, 1 if photo else 0, trend, avg30, low, len(p.get("cm", [])),
                     asin(p), price, p.get("msrpSource") if price else None, p.get("q") or None, p.get("dateSource") or None,
                     avg7, avg1, None])
        priced += trend is not None
    return rows, priced


def archive(rows, old, day):
    """Archive glissante de la tendance : jours (31 au plus) et, par produit, la tendance de chaque jour.
    day : jour du guide des prix, ou None sans guide (archive gardée telle quelle). Retourne la liste des jours."""
    f = {k: i for i, k in enumerate(FIELDS)}
    days, prev = list((old or {}).get("days") or []), {}
    if old and "hist" in old.get("fields", []):
        of = {k: i for i, k in enumerate(old["fields"])}
        prev = {r[of["id"]]: list(r[of["hist"]] or []) for r in old["products"]}
    if day and day not in days:
        days.append(day)
    for r in rows:
        h = (prev.get(r[f["id"]]) or [])[:len(days)]
        h += [None] * (len(days) - len(h))  # nouveau produit : jours d'avant sans valeur
        if day:
            h[days.index(day)] = r[f["trend"]]
        r[f["hist"]] = h[-HIST_DAYS:]
    return days[-HIST_DAYS:]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--prices", help="guide des prix Cardmarket déjà téléchargé (JSON)")
    ap.add_argument("--offline", action="store_true", help="sans guide des prix : garde les prix de sealed.json")
    args = ap.parse_args()
    manifest = json.loads(PRODUCTS.read_text("utf-8"))
    guide = json.loads(Path(args.prices).read_text("utf-8")) if args.prices else (None if args.offline else fetch_prices())
    previous, stamp, old = {}, "", None
    if OUT.exists():
        old = json.loads(OUT.read_text("utf-8"))
        stamp = old.get("prices", "")
        f = {k: i for i, k in enumerate(old["fields"])}
        previous = {r[f["id"]]: [r[f[k]] if k in f else None for k in PRICED] for r in old["products"]}  # anciens fichiers : sans avg7, avg1
    rows, priced = build(manifest["products"], guide, previous)
    days = archive(rows, old, guide.get("createdAt", "")[:10] or None if guide is not None else None)
    head = {
        "generated": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        # Sans guide des prix, la date des prix gardés reste celle du fichier précédent.
        "prices": guide.get("createdAt", "") if guide is not None else (stamp if re.match(r"\d{4}-\d{2}-\d{2}", stamp) else "veille (guide des prix injoignable)"),
        "source": "Cardmarket, guide des prix public · visuels : galerie officielle Pokémon France",
        "fields": FIELDS, "days": days, "demo": manifest.get("demo", {}), "count": len(rows),
    }
    body = ",\n".join(json.dumps(r, ensure_ascii=False, separators=(",", ":")) for r in rows)
    OUT.write_text(json.dumps(head, ensure_ascii=False)[:-1] + ',\n"products":[\n' + body + "\n]}\n", "utf-8")
    print(f"sealed.json : {len(rows)} produits, {priced} avec un prix Cardmarket, {sum(r[7] for r in rows)} avec un visuel officiel"
          + ("" if guide is not None else " · prix de la veille gardés"))


if __name__ == "__main__":
    main()
