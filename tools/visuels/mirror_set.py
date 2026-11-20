#!/usr/bin/env python3
"""Copie locale des visuels d'une extension (2026-11-20, porteur : « retrouve-moi le visuel de toutes les cartes de la
première série, édition 1 »).

Le CDN de TCGdex refuse parfois des visuels par rafales (503) quand une page en demande une centaine d'un coup : l'app
affichait alors la carte dessinée. Ce script copie les visuels de l'extension (WebP 600 px et 245 px, tels quels) dans
web/img/local/ et les inscrit dans web/data/img-local.json, que l'app lit avec le catalogue : ces cartes s'affichent alors
depuis dropicards.fr, avec retour au visuel TCGdex si la copie manque. Un visuel déjà redressé (web/data/img-fix.json)
n'est pas copié : la version redressée reste prioritaire. Après la copie du Set de Base, stamp_ed1.py repose le tampon
« Édition 1 » sur les visuels du tirage illimité (une copie refaite efface le tampon : il est reposé aussitôt).

Usage : python tools/visuels/mirror_set.py base1 [base2 …]
"""
import hashlib
import json
import pathlib
import sys
import time
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / "web/img/local"
LIST = ROOT / "web/data/img-local.json"
UA = {"User-Agent": "PKM-App-index/1.0 (catalogue Dropicards)"}
ASSETS = "https://assets.tcgdex.net/"


def fetch(url, tries=7):
    """Le visuel, ou None s'il n'existe pas (404) ; nouvel essai espacé sur les refus passagers (503, 429, réseau)."""
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


def name_of(path):
    return path.replace("/", "_")


def main(sets):
    d = json.loads((ROOT / "web/data/cards-base.json").read_text("utf-8"))
    f = {k: i for i, k in enumerate(d["fields"])}
    fixed = json.loads((ROOT / "web/data/img-fix.json").read_text("utf-8")).get("p", {}) if (ROOT / "web/data/img-fix.json").exists() else {}
    doc = json.loads(LIST.read_text("utf-8")) if LIST.exists() else {"v": 1, "p": {}}
    OUT.mkdir(parents=True, exist_ok=True)
    done = missing = 0
    for sid in sets:
        for c in d["cards"]:
            path = c[f["set"]] == sid and c[f["img"]]
            if not path or ":" in path or path.startswith("http") or path in fixed:
                continue
            hi, lo = fetch(ASSETS + path + "/high.webp"), fetch(ASSETS + path + "/low.webp")
            if not hi or not lo:
                missing += 1
                print("MANQUE", c[f["id"]], path, flush=True)
                continue
            (OUT / (name_of(path) + ".webp")).write_bytes(hi)
            (OUT / (name_of(path) + "-low.webp")).write_bytes(lo)
            doc["p"][path] = hashlib.md5(hi + lo).hexdigest()[:8]
            doc.get("ed1", {}).pop(path, None)  # copie neuve : le tampon « Édition 1 » est à reposer
            done += 1
            print("COPIE", c[f["id"]], path, len(hi) // 1024, "Ko", flush=True)
            time.sleep(0.3)
    doc["p"] = dict(sorted(doc["p"].items()))
    doc["made"] = time.strftime("%Y-%m-%d", time.gmtime())
    doc["n"] = len(doc["p"])
    LIST.write_text(json.dumps(doc, ensure_ascii=False, separators=(",", ":")) + "\n", "utf-8")
    print(f"{done} visuels copiés, {missing} introuvables · web/img/local, web/data/img-local.json ({doc['n']} au total)")
    if "base1" in sets:
        sys.path.insert(0, str(pathlib.Path(__file__).parent))
        import stamp_ed1  # Pillow et numpy (installés par le workflow)
        stamp_ed1.main()
    return 1 if missing and not done else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:] or ["base1"]))
