#!/usr/bin/env python3
"""
build_sealed.py : catalogue scellé de l'app avec les prix du jour → web/data/sealed.json.
Lancé chaque jour par le workflow « Catalogue scellé » (seul à écrire ce fichier) ; chaque mise à jour est
un commit, l'historique git sert d'archive quotidienne des prix (comme pour les cartes).

Entrées :
  - tools/sealed/products.json : liste figée des produits (nom, type, extension, sortie, ids Cardmarket) ;
  - guide des prix public Cardmarket (price_guide_6.json) : tendance, moyenne 30 jours, plus bas ;
  - web/img/products/<id>.webp : visuel officiel, s'il a été téléchargé (fetch_images.py).
Prix d'un produit à plusieurs variantes (ex. deux coffrets) : médiane des variantes.
Si le guide des prix est injoignable, les prix de la veille sont gardés.

Usage : python3 tools/sealed/build_sealed.py [--prices price_guide_6.json]
"""
import argparse
import json
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
FIELDS = ["id", "name", "type", "set", "release", "releaseText", "year", "photo", "trend", "avg30", "low", "variants"]


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


def median(values):
    xs = [v for v in values if isinstance(v, (int, float)) and v > 0]
    return round(statistics.median(xs), 2) if xs else None


def build(products, guide, previous):
    prices = {g["idProduct"]: g for g in (guide or {}).get("priceGuides", [])}
    rows, priced = [], 0
    for p in products:
        found = [prices[i] for i in p.get("cm", []) if i in prices]
        if guide is not None:
            trend, avg30, low = (median(g.get(k) for g in found) for k in ("trend", "avg30", "low"))
        else:
            trend, avg30, low = (previous.get(p["id"]) or [None, None, None])
        photo = (IMG / (p["id"] + ".webp")).exists()
        rows.append([p["id"], p["name"], p["type"], p.get("set") or "", p.get("release") or "", p.get("releaseText") or "",
                     p.get("year") or 0, 1 if photo else 0, trend, avg30, low, len(p.get("cm", []))])
        priced += trend is not None
    return rows, priced


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--prices", help="guide des prix Cardmarket déjà téléchargé (JSON)")
    args = ap.parse_args()
    manifest = json.loads(PRODUCTS.read_text("utf-8"))
    guide = json.loads(Path(args.prices).read_text("utf-8")) if args.prices else fetch_prices()
    previous = {}
    if OUT.exists():
        old = json.loads(OUT.read_text("utf-8"))
        f = {k: i for i, k in enumerate(old["fields"])}
        previous = {r[f["id"]]: [r[f["trend"]], r[f["avg30"]], r[f["low"]]] for r in old["products"]}
    rows, priced = build(manifest["products"], guide, previous)
    head = {
        "generated": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "prices": (guide or {}).get("createdAt", "") if guide is not None else "veille (guide des prix injoignable)",
        "source": "Cardmarket, guide des prix public · visuels : galerie officielle Pokémon France",
        "fields": FIELDS, "demo": manifest.get("demo", {}), "count": len(rows),
    }
    body = ",\n".join(json.dumps(r, ensure_ascii=False, separators=(",", ":")) for r in rows)
    OUT.write_text(json.dumps(head, ensure_ascii=False)[:-1] + ',\n"products":[\n' + body + "\n]}\n", "utf-8")
    print(f"sealed.json : {len(rows)} produits, {priced} avec un prix Cardmarket, {sum(r[7] for r in rows)} avec un visuel officiel"
          + ("" if guide is not None else " · prix de la veille gardés"))


if __name__ == "__main__":
    main()
