#!/usr/bin/env python3
"""Disponibilité des visuels d'une extension (diagnostic, lecture seule ; workflow « Disponibilité des visuels »).

Pour chaque carte de l'extension (web/data/cards-base.json), essaie le visuel de chaque source et écrit une ligne :
    base1-4  fr:200 en:200 de:404 … ptcg:200
puis un résumé par source. Rien n'est écrit dans l'app.
Usage : python tools/visuels/check_set.py base1 [--langs fr,en,de,it,es,pt] [--ptcg base1]
"""
import argparse
import json
import pathlib
import sys
import time
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT = pathlib.Path(__file__).resolve().parents[2]
UA = {"User-Agent": "PKM-App-index/1.0 (catalogue Dropicards)"}


def status(url):
    try:
        with urlopen(Request(url, headers=UA, method="HEAD"), timeout=30) as r:
            return r.status
    except HTTPError as e:
        return e.code
    except (URLError, TimeoutError):
        return 0


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument("set")
    ap.add_argument("--langs", default="fr,en,de,it,es,pt")
    ap.add_argument("--ptcg", default=None, help="identifiant pokemontcg.io de l'extension (par défaut : le même)")
    a = ap.parse_args(argv)
    d = json.loads((ROOT / "web/data/cards-base.json").read_text("utf-8"))
    f = {k: i for i, k in enumerate(d["fields"])}
    cards = [c for c in d["cards"] if c[f["set"]] == a.set]
    serie_path = None
    for c in cards:
        if c[f["img"]] and "/" in c[f["img"]]:
            serie_path = "/".join(c[f["img"]].split("/")[1:3])  # « base/base1 »
            break
    if not serie_path:
        print("Pas de chemin TCGdex pour", a.set); return 1
    langs = a.langs.split(",")
    ptcg = a.ptcg or a.set
    tot = {k: 0 for k in langs + ["ptcg"]}
    print(f"{a.set} : {len(cards)} cartes · chemin TCGdex {serie_path} · pokemontcg.io {ptcg}")
    for c in cards:
        num = c[f["num"]]
        res = {}
        for lg in langs:
            res[lg] = status(f"https://assets.tcgdex.net/{lg}/{serie_path}/{num}/high.webp")
        res["ptcg"] = status(f"https://images.pokemontcg.io/{ptcg}/{num}_hires.png")
        for k, v in res.items():
            tot[k] += v == 200
        print(c[f["id"]], c[f["name"]], " ".join(f"{k}:{v}" for k, v in res.items()), flush=True)
        time.sleep(0.05)
    print("RÉSUMÉ", " ".join(f"{k}={v}/{len(cards)}" for k, v in tot.items()))
    return 0


if __name__ == "__main__":
    sys.exit(main())
