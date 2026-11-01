#!/usr/bin/env python3
"""
recon_singles.py : reconnaissance des fichiers publics Cardmarket des cartes (lancée dans GitHub Actions, n'écrit
rien). Affiche la date des fichiers, les extensions récentes et les cartes du 30ᵉ Anniversaire (Charizard, Pikachu,
Lugia…) avec leurs prix, pour écrire ensuite le rapprochement des cartes sans prix TCGdex sur des bases vérifiées.
"""
import gzip
import json
from collections import Counter
from urllib.request import Request, urlopen

CM = "https://downloads.s3.cardmarket.com/productCatalog/"
UA = "PKM-App-index/1.0 (catalogue Dropicards)"


def get(path):
    req = Request(CM + path, headers={"User-Agent": UA, "Accept-Encoding": "gzip"})
    with urlopen(req, timeout=120) as r:
        data = r.read()
        if r.headers.get("Content-Encoding") == "gzip":
            data = gzip.decompress(data)
    return json.loads(data)


singles = get("productList/products_singles_6.json")
prices = get("priceGuide/price_guide_6.json")
print("singles", singles.get("createdAt"), len(singles["products"]), "| prix", prices.get("createdAt"), len(prices["priceGuides"]))
pg = {p["idProduct"]: p for p in prices["priceGuides"]}
prods = singles["products"]
# 2026-11-01 (porteur : « Rayquaza ☆ ex Deoxys n'est qu'à 500 € ») : produit Cardmarket que TCGdex relie à ces cartes,
# son nom et ses prix, et les produits « Gold Star » du même nom, pour comparer avec le site (tendance 6 985 €).
names = {p["idProduct"]: p for p in prods}
for cid in ("ex8-107", "ex8-102", "ex13-111"):
    try:
        req = Request("https://api.tcgdex.net/v2/en/cards/" + cid, headers={"User-Agent": UA})
        with urlopen(req, timeout=60) as r:
            card = json.loads(r.read())
    except Exception as e:  # noqa: BLE001
        print(cid, "TCGdex injoignable", e)
        continue
    cmk = (card.get("pricing") or {}).get("cardmarket") or {}
    idp = cmk.get("idProduct")
    print(f"\n== {cid} {card.get('name')} variants {card.get('variants')}")
    print("   TCGdex :", {k: cmk.get(k) for k in ("idProduct", "updated", "trend", "avg7", "avg30", "low", "trend-holo", "avg7-holo", "avg30-holo", "low-holo")})
    p = names.get(idp)
    print("   produit Cardmarket de cet id :", p and (p["name"], p["idExpansion"]), "| guide :", {k: v for k, v in (pg.get(idp) or {}).items() if v})
    base = (card.get("name") or "").replace("☆", "").strip().split(" ")[0]
    for q in prods:
        if q["name"].startswith(base) and ("Gold Star" in q["name"] or (p and q["idExpansion"] == p["idExpansion"])):
            print("   candidat", q["idProduct"], q["name"], q["idExpansion"], "|", {k: v for k, v in (pg.get(q["idProduct"]) or {}).items() if v and k != "idProduct"})
