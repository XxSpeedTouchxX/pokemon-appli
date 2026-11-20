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


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("set")
    ap.add_argument("--lang", default="fr")
    a = ap.parse_args()
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
