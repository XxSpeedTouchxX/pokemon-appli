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
print("clés produit :", sorted(prods[0].keys()))
recent = [p for p in prods if str(p.get("dateAdded", "")) >= "2026-06-01"]
by_exp = Counter(p["idExpansion"] for p in recent)
print("extensions avec des produits ajoutés depuis juin 2026 :", by_exp.most_common(20))
for exp, n in by_exp.most_common(12):
    names = [p["name"] for p in prods if p["idExpansion"] == exp]
    print(f"\n== extension {exp} ({len(names)} cartes) :", " ; ".join(names[:12]))
want = ("Charizard", "Lugia", "Magikarp", "Gengar", "Pikachu", "Mew ex", "Mewtwo ex", "Exeggcute", "Delcatty")
for exp, n in by_exp.most_common(12):
    for p in prods:
        if p["idExpansion"] == exp and p["name"].split(" [")[0] in want:
            g = pg.get(p["idProduct"], {})
            print(exp, p["idProduct"], p["name"], p.get("dateAdded"), "| trend", g.get("trend"), "avg", g.get("avg"), "avg7", g.get("avg7"),
                  "avg30", g.get("avg30"), "low", g.get("low"), "| holo", g.get("trend-holo"), g.get("avg30-holo"))
# Extension 6601 en entier, dans l'ordre des identifiants (rapprochement des 31 Pikachu, 2 Lugia, M-Gardevoir).
print("\n== 6601 dans l'ordre")
for i, p in enumerate(sorted((p for p in prods if p["idExpansion"] == 6601), key=lambda p: p["idProduct"])):
    g = pg.get(p["idProduct"], {})
    print(i + 1, p["idProduct"], p["name"], "| trend", g.get("trend"), "avg30", g.get("avg30"), "holo", g.get("trend-holo"))
