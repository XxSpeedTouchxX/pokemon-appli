"""
check_6601.py : contrôle en lecture seule des produits Cardmarket de l'extension 6601 (30ᵉ Anniversaire et Collection
Classique) dont le nom contient un des mots donnés, avec leurs prix du jour (fichiers publics de Cardmarket), et le
rapprochement fait par cmfiles.py pour nos cartes du même nom. Usage : python check_6601.py palkia charizard
(workflow « Contrôle des prix Cardmarket »).
"""
import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "tcgdex"))
import cmfiles  # noqa: E402

words = [w.lower() for w in sys.argv[1:]] or ["palkia"]
files = cmfiles.CmFiles.download()
prods = files.by_exp.get(6601, [])
print(f"Extension 6601 : {len(prods)} produits (fichiers du {files.created})")
for i, p in enumerate(prods):
    if any(w in (p.get("name") or "").lower() for w in words):
        g = files.guide.get(p["idProduct"], {})
        keep = {k: g.get(k) for k in ("trend", "avg1", "avg7", "avg30", "low", "trend-holo", "avg30-holo", "low-holo") if g.get(k)}
        print(f"  #{i + 1:>3} id {p['idProduct']} · {p.get('name')} · {json.dumps(keep)}")
root = os.path.join(os.path.dirname(__file__), "..", "..")
doc = json.load(open(os.path.join(root, "web", "data", "cards.json"), encoding="utf-8"))
F = {k: i for i, k in enumerate(doc["fields"])}
for r in doc["cards"]:
    if r[F["set"]] in ("30th", "30th-c") and any(w in r[F["name"]].lower() or (w == "charizard" and "dracaufeu" in r[F["name"]].lower()) for w in words):
        print(f"  nous : {r[F['id']]} {r[F['name']]} n° {r[F['num']]} · tendance {r[F['cm']]} · 7 j {r[F['avg7']]} · 30 j {r[F['avg30']]}")
