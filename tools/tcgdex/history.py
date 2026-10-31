"""Archive quotidienne de la cote de chaque carte (2026-10-31, porteur : « une variation de prix de la carte depuis
sa sortie », d'après sa photo d'un « Historique du prix »).

Aucune source ouverte ne donne l'historique des prix depuis la sortie d'une carte : Dropicards garde donc lui-même,
chaque jour, la cote qu'il affiche (principe 6 : « archiver chaque jour les prix utilisés »). Cote = celle de l'app
(tools/web/catalog.js, coteOf) : médiane de la tendance et des moyennes 30 et 7 jours Cardmarket ; une cote recopiée
sur plusieurs cartes d'une même extension (≥ 20 €, mêmes trois valeurs) ne compte pas.

Sortie, une fiche par extension (la démo ne télécharge que celle de la carte ouverte) :
    web/data/hist/<extension>.json   {"days": ["2026-10-03", …], "c": {"<id carte>": [centimes | null, …]}}
    web/data/hist/index.json         {"days": […], "sets": {"<extension>": nombre de cartes}}

Le premier jour est le 3 octobre 2026 (première version publiée de web/data/cards.json) : --backfill reprend toutes
les versions quotidiennes du fichier dans l'historique git (la dernière de chaque jour). Ensuite, le workflow
« Catalogue TCGdex » ajoute (ou remplace) le jour du catalogue publié.

    python3 tools/tcgdex/history.py --backfill   # une fois, depuis l'historique git
    python3 tools/tcgdex/history.py              # chaque jour, après build_index.py
"""
import argparse
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = "web/data/cards.json"
OUT = ROOT / "web" / "data" / "hist"


def num(v):
    return isinstance(v, (int, float)) and not isinstance(v, bool) and v > 0


def med(cm, a30, a7):
    """Médiane des valeurs présentes (comme coteMed, catalog.js)."""
    v = sorted(x for x in (cm, a30, a7) if num(x))
    if not v:
        return 0
    m = len(v) >> 1
    return v[m] if len(v) % 2 else (v[m - 1] + v[m]) / 2


def cotes(doc):
    """{id: (extension, cote en centimes)} d'une version de cards.json, avec la règle des cotes recopiées."""
    F = {k: i for i, k in enumerate(doc["fields"])}
    g = lambda r, k: r[F[k]] if k in F and F[k] < len(r) else None
    seen = {}
    for r in doc["cards"]:
        cm = g(r, "cm")
        if num(cm) and cm >= 20:
            seen.setdefault((g(r, "set"), cm, g(r, "avg30"), g(r, "avg7")), []).append(g(r, "id"))
    dup = {i for ids in seen.values() if len(ids) > 1 for i in ids}
    out = {}
    for r in doc["cards"]:
        cid = g(r, "id")
        v = 0 if cid in dup else med(g(r, "cm"), g(r, "avg30"), g(r, "avg7"))
        out[cid] = (g(r, "set"), int(round(v * 100)) if v > 0 else None)
    return out


def load():
    days, by_set = [], {}
    idx = OUT / "index.json"
    if idx.exists():
        days = json.loads(idx.read_text("utf-8"))["days"]
        for f in OUT.glob("*.json"):
            if f.name != "index.json":
                by_set[f.stem] = json.loads(f.read_text("utf-8"))["c"]
    return days, by_set


def put(days, by_set, day, values):
    """Ajoute (ou remplace) un jour ; les cartes absentes ce jour-là reçoivent null."""
    if day in days:
        k = days.index(day)
    else:
        days.append(day)
        days.sort()
        k = days.index(day)
        for cards in by_set.values():
            for arr in cards.values():
                arr.insert(k, None)
    n = len(days)
    for cid, (sid, cents) in values.items():
        if not sid:
            continue
        cards = by_set.setdefault(sid, {})
        arr = cards.setdefault(cid, [None] * n)
        if len(arr) < n:
            arr.extend([None] * (n - len(arr)))
        arr[k] = cents


def save(days, by_set):
    OUT.mkdir(parents=True, exist_ok=True)
    sets = {}
    for sid, cards in sorted(by_set.items()):
        # Une carte qui n'a jamais eu de cote n'est pas gardée.
        keep = {cid: arr for cid, arr in sorted(cards.items()) if any(v is not None for v in arr)}
        if not keep:
            continue
        sets[sid] = len(keep)
        safe = "".join(ch if ch.isalnum() or ch in "-_." else "_" for ch in sid)
        (OUT / f"{safe}.json").write_text(json.dumps({"days": days, "c": keep}, separators=(",", ":")), "utf-8")
    (OUT / "index.json").write_text(json.dumps({"days": days, "sets": sets}, ensure_ascii=False, separators=(",", ":")), "utf-8")
    return sets


def git(*args):
    return subprocess.run(["git", *args], cwd=ROOT, check=True, capture_output=True).stdout


def backfill():
    days, by_set = [], {}
    last = {}
    for line in git("log", "--reverse", "--format=%H %ad", "--date=short", "--", SRC).decode().split("\n"):
        if line.strip():
            h, d = line.split()
            last[d] = h  # la dernière version de chaque jour
    for d, h in sorted(last.items()):
        doc = json.loads(git("show", f"{h}:{SRC}"))
        day = (doc.get("generated") or d)[:10]
        put(days, by_set, day, cotes(doc))
        print(f"{day} : {len(doc['cards'])} cartes")
    return days, by_set


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--backfill", action="store_true", help="refaire l'archive depuis l'historique git de cards.json")
    a = ap.parse_args()
    if a.backfill:
        days, by_set = backfill()
    else:
        days, by_set = load()
        doc = json.loads((ROOT / SRC).read_text("utf-8"))
        put(days, by_set, doc["generated"][:10], cotes(doc))
    sets = save(days, by_set)
    print(f"Archive : {len(days)} jours ({days[0]} → {days[-1]}), {len(sets)} extensions, {sum(sets.values())} cartes")


if __name__ == "__main__":
    main()
