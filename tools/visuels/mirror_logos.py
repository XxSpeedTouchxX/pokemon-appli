#!/usr/bin/env python3
"""Copie locale des logos des extensions (2026-11-20, porteur : « dans Toutes les séries, le bandeau avec toutes les
séries, on ne voit plus le visuel de plusieurs séries, fais en sorte qu'on les revoie »).

Les logos des séries et des extensions venaient tous du CDN de TCGdex, qui refuse parfois des images par rafales (503)
quand une page en demande beaucoup d'un coup : l'app passait alors au nom dessiné. Ce script copie chaque logo (WebP,
sinon PNG, tel quel) dans web/img/logos/ et l'inscrit dans web/data/logos-local.json, que l'app lit avec le catalogue :
les logos s'affichent alors depuis dropicards.fr, avec retour au CDN de TCGdex si la copie manque.

Usage : python tools/visuels/mirror_logos.py            (logos pas encore copiés)
        python tools/visuels/mirror_logos.py --all      (tous, recopiés)
"""
import hashlib
import json
import pathlib
import sys
import time
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / "web/img/logos"
LIST = ROOT / "web/data/logos-local.json"
UA = {"User-Agent": "PKM-App-index/1.0 (catalogue Dropicards)"}
ASSETS = "https://assets.tcgdex.net/"


def fetch(url, tries=7):
    """L'image, ou None si elle n'existe pas (404) ; nouvel essai espacé sur les refus passagers (503, 429, réseau)."""
    wait = 2.0
    for k in range(tries):
        try:
            with urlopen(Request(url, headers=UA), timeout=60) as r:
                return r.read()
        except HTTPError as e:
            if e.code == 404:
                return None
            if k == tries - 1:
                raise
        except (URLError, TimeoutError):
            if k == tries - 1:
                raise
        time.sleep(wait)
        wait = min(wait * 2, 30)
    return None


def main(redo):
    sets = json.loads((ROOT / "web/data/cards-base.json").read_text("utf-8"))["sets"]
    doc = json.loads(LIST.read_text("utf-8")) if LIST.exists() else {"v": 1, "p": {}}
    OUT.mkdir(parents=True, exist_ok=True)
    paths = sorted({s[3] for s in sets.values() if s and len(s) > 3 and s[3] and not s[3].startswith("http")})
    done = missing = kept = 0
    for path in paths:
        if not redo and path in doc["p"] and (OUT / doc["p"][path][0]).exists():
            kept += 1
            continue
        for ext in ("webp", "png"):
            data = fetch(ASSETS + path + "." + ext)
            if data:
                name = path.replace("/", "_") + "." + ext
                (OUT / name).write_bytes(data)
                doc["p"][path] = [name, hashlib.md5(data).hexdigest()[:8]]
                done += 1
                print("COPIE", path, ext, len(data) // 1024, "Ko", flush=True)
                break
        else:
            missing += 1
            print("MANQUE", path, flush=True)
        time.sleep(0.3)
    doc["p"] = dict(sorted(doc["p"].items()))
    doc["made"] = time.strftime("%Y-%m-%d", time.gmtime())
    doc["n"] = len(doc["p"])
    LIST.write_text(json.dumps(doc, ensure_ascii=False, separators=(",", ":")) + "\n", "utf-8")
    print(f"Logos : {done} copiés, {kept} déjà là, {missing} introuvables sur TCGdex, {doc['n']} au total")


if __name__ == "__main__":
    main("--all" in sys.argv[1:])
