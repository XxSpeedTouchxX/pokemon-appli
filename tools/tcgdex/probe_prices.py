#!/usr/bin/env python3
"""Prix bruts d'une extension chez TCGdex (diagnostic, lecture seule ; workflow « Sonde des prix », 2026-11-20).

Pour chaque carte : tendance et moyennes Cardmarket (groupes normal et holo) et toutes les versions TCGplayer (prix
« market », en dollars), par exemple « holofoil » (tirage illimité) et « 1st-edition-holofoil » (1re édition).
Rien n'est écrit dans l'app. Usage : python tools/tcgdex/probe_prices.py base1 [--lang fr]
"""
import argparse
import json
import sys
import time
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

UA = {"User-Agent": "PKM-App-index/1.0 (catalogue Dropicards)"}


def get(url):
    for k in range(5):
        try:
            with urlopen(Request(url, headers=UA), timeout=60) as r:
                return json.loads(r.read())
        except HTTPError as e:
            if e.code == 404:
                return None
        except (URLError, TimeoutError):
            pass
        time.sleep(2 + 3 * k)
    return None


def probe_cm(names):
    """Tous les produits du catalogue public de Cardmarket qui portent ces noms, avec leur extension et leur prix."""
    cm = "https://downloads.s3.cardmarket.com/productCatalog/"
    prods = (get(cm + "productList/products_singles_6.json") or {}).get("products") or []
    guide = {g["idProduct"]: g for g in (get(cm + "priceGuide/price_guide_6.json") or {}).get("priceGuides") or []}
    size = {}
    for p in prods:
        size[p.get("idExpansion")] = size.get(p.get("idExpansion"), 0) + 1
    print("CATALOGUE", len(prods), "produits,", len(guide), "prix", flush=True)
    for p in prods:
        n = (p.get("name") or "").lower()
        if any(n == x or n.startswith(x + " ") or n.startswith(x + " (") for x in names):
            print("CM", json.dumps({"id": p["idProduct"], "name": p.get("name"), "exp": p.get("idExpansion"), "expSize": size.get(p.get("idExpansion")),
                                    "cat": p.get("idCategory"), "added": p.get("dateAdded"), "g": guide.get(p["idProduct"])}, ensure_ascii=False), flush=True)
    return 0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("set")
    ap.add_argument("--lang", default="fr")
    ap.add_argument("--ptcg", default="", help="extension pokemontcg.io à sonder aussi (ex. base1)")
    ap.add_argument("--cm", default="", help="noms anglais séparés par des virgules : tous les produits Cardmarket de ce nom")
    a = ap.parse_args()
    if a.cm:
        return probe_cm([x.strip().lower() for x in a.cm.split(",") if x.strip()])
    if a.ptcg:
        d = get(f"https://api.pokemontcg.io/v2/cards?q=set.id:{a.ptcg}&pageSize=250&select=id,name,rarity,tcgplayer,cardmarket") or {}
        for c in d.get("data") or []:
            tp = ((c.get("tcgplayer") or {}).get("prices")) or {}
            cm = ((c.get("cardmarket") or {}).get("prices")) or {}
            print("PTCG", json.dumps({"id": c.get("id"), "name": c.get("name"), "rarity": c.get("rarity"),
                                      "tcp": {k: (v or {}).get("market") or (v or {}).get("mid") for k, v in tp.items()},
                                      "cm": {k: cm.get(k) for k in ("trendPrice", "avg7", "avg30", "averageSellPrice") if cm.get(k)}}, ensure_ascii=False), flush=True)
        return 0
    s = get(f"https://api.tcgdex.net/v2/{a.lang}/sets/{a.set}")
    if not s:
        print("extension introuvable")
        return 1
    for c in s.get("cards") or []:
        card = get(f"https://api.tcgdex.net/v2/{a.lang}/cards/{c['id']}") or {}
        pr = card.get("pricing") or {}
        cm, tp = pr.get("cardmarket") or {}, pr.get("tcgplayer") or {}
        cmt = {k: cm.get(k) for k in ("trend", "avg7", "avg30", "trend-holo", "avg7-holo", "avg30-holo") if cm.get(k)}
        tpv = {k: (v or {}).get("marketPrice") or (v or {}).get("midPrice") for k, v in tp.items() if isinstance(v, dict)}
        print("PRIX", json.dumps({"id": c["id"], "name": card.get("name"), "rarity": card.get("rarity"), "variants": card.get("variants"),
                                  "cm": cmt, "tcp": tpv, "cmUpd": cm.get("updated"), "tpUpd": tp.get("updated")}, ensure_ascii=False), flush=True)
        time.sleep(0.15)
    return 0


if __name__ == "__main__":
    sys.exit(main())
