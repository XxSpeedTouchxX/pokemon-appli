#!/usr/bin/env python3
"""
check_data.py : contrôle des données publiées par un workflow, juste avant leur publication (2026-10-11).

    python3 tools/check_data.py stores|sealed|cards [--base HEAD] [--revert] [--force]

Pour la source donnée :
  - vérifie le format des fichiers (champs, nombre de lignes, dates) ;
  - compare au dernier état publié (git, --base, HEAD par défaut) : refuse une baisse de plus de 5 % (2 % pour
    les cartes ; voir aussi les garde-fous de chaque script) ;
  - écrit un bilan dans le résumé du job GitHub ($GITHUB_STEP_SUMMARY) et met à jour web/data/status.json
    (par source : date des données en amont, comptes, écart avec la veille, avertissements, erreurs) ;
  - sort en erreur (code 1) en cas d'anomalie, pour que GitHub prévienne le porteur par courriel. Avec --revert,
    les fichiers de la source reprennent leur dernier état publié : seul status.json change ce jour-là.
--force (lancement à la main, après vérification) : les anomalies deviennent des avertissements.

status.json garde une source par ligne, séparées par une ligne vide : trois workflows l'écrivent. Si deux publications
se croisent, tools/publish_data.sh reprend la dernière version publiée et n'y remplace que la ligne de sa source
(--merge-status REV : ligne de la source lue dans le commit REV, posée sur le status.json du disque).
"""
import argparse
import json
import os
import re
import subprocess
import sys
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools" / "tcgdex"))
from build_index import compare_catalog  # noqa: E402  (mêmes garde-fous que la construction du catalogue)
from split_catalog import join  # noqa: E402

STATUS = ROOT / "web" / "data" / "status.json"
SOURCES = ["cards", "sealed", "stores"]
FILES = {
    "stores": ["web/data/stores.json", "tools/stores/reference.json"],
    "sealed": ["web/data/sealed.json"],
    "cards": ["web/data/cards.json", "web/data/cards-base.json", "web/data/cards-prices.json"],
}
NAMES = {"cards": "Cartes (TCGdex)", "sealed": "Scellé (Cardmarket)", "stores": "Boutiques (OpenStreetMap)"}
MAX_DROP = {"stores": 0.05, "sealed": 0.05, "cards": 0.02}
DAY = re.compile(r"^\d{4}-\d{2}-\d{2}")


def git_json(path, base="HEAD"):
    """Contenu JSON d'un fichier au dernier état publié, ou None (fichier absent, pas de dépôt git)."""
    try:
        out = subprocess.run(["git", "show", f"{base}:{path}"], cwd=ROOT, capture_output=True, check=True)
        return json.loads(out.stdout.decode("utf-8"))
    except (OSError, subprocess.CalledProcessError, ValueError):
        return None


def read_json(path):
    try:
        return json.loads((ROOT / path).read_text("utf-8"))
    except (OSError, ValueError):
        return None


def parse_time(text):
    """Date ou date-heure ISO (« 2026-10-11 », « 2026-10-11T02:44:21+0200 », « …Z ») en UTC ; None si illisible."""
    text = str(text or "")
    for fmt in ("%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%dT%H:%M:%S.%f%z"):
        try:
            return datetime.strptime(text.replace("Z", "+0000"), fmt).astimezone(timezone.utc)
        except ValueError:
            pass
    if DAY.match(text):
        return datetime.strptime(text[:10], "%Y-%m-%d").replace(tzinfo=timezone.utc)
    return None


def hours_since(text, now):
    t = parse_time(text)
    return None if t is None else (now - t).total_seconds() / 3600


def rows_ok(doc, key, errors, required):
    """Format commun : champs attendus, une ligne par élément, de la bonne longueur."""
    fields, rows = doc.get("fields"), doc.get(key)
    if not isinstance(fields, list) or not isinstance(rows, list):
        errors.append(f"format : « fields » ou « {key} » absent")
        return None
    missing = [k for k in required if k not in fields]
    if missing:
        errors.append(f"format : champs absents {missing}")
        return None
    bad = sum(1 for r in rows if not isinstance(r, list) or len(r) != len(fields))
    if bad:
        errors.append(f"format : {bad} lignes de mauvaise longueur")
    return {k: i for i, k in enumerate(fields)}


def drop(label, now, before, limit, errors):
    if before and now < before * (1 - limit):
        errors.append(f"{label} : {now} contre {before} au dernier état publié (−{1 - now / before:.1%}, plus de {limit:.0%})")


def check_stores(cur, prev, now):
    errors, warnings, details = [], [], {}
    doc = cur["web/data/stores.json"]
    if doc is None:
        return {"errors": ["web/data/stores.json absent ou illisible"], "warnings": []}
    f = rows_ok(doc, "stores", errors, ["id", "nom", "type", "lat", "lon", "dept"])
    rows = doc.get("stores") or []
    if f and doc.get("count") != len(rows):
        errors.append(f"format : count = {doc.get('count')} pour {len(rows)} boutiques")
    if f:
        out = sum(1 for r in rows if len(r) == len(doc["fields"]) and not (41 <= r[f["lat"]] <= 51.5 and -5.5 <= r[f["lon"]] <= 10))
        if out:
            errors.append(f"{out} boutiques hors de France métropolitaine")
    age = hours_since(doc.get("generated"), now)
    if age is None:
        errors.append(f"date de la liste illisible ({doc.get('generated')!r})")
    elif age > 8 * 24 + 12:
        warnings.append(f"liste du {doc['generated']} : pas de mise à jour depuis {age / 24:.0f} jours")
    old = prev.get("web/data/stores.json") or {}
    drop("boutiques", len(rows), len(old.get("stores") or []), MAX_DROP["stores"], errors)
    regions, old_regions = doc.get("regions") or {}, old.get("regions") or {}
    for code, n in sorted(old_regions.items()):
        drop(f"région {code}", regions.get(code, 0), n, 0.3, errors)
    if regions:
        details["regions"] = regions
    return {"upstream": doc.get("generated"), "count": len(rows), "previous": len(old.get("stores") or []) or None,
            "errors": errors, "warnings": warnings, "details": details}


def contiguous(days):
    try:
        ds = [date.fromisoformat(d) for d in days]
    except (TypeError, ValueError):
        return False
    return all(b - a == timedelta(1) for a, b in zip(ds, ds[1:]))


def check_sealed(cur, prev, now):
    errors, warnings = [], []
    doc = cur["web/data/sealed.json"]
    if doc is None:
        return {"errors": ["web/data/sealed.json absent ou illisible"], "warnings": []}
    f = rows_ok(doc, "products", errors, ["id", "name", "trend", "hist"])
    rows = doc.get("products") or []
    priced = sum(1 for r in rows if f and len(r) == len(doc["fields"]) and r[f["trend"]] is not None)
    if f and doc.get("count") != len(rows):
        errors.append(f"format : count = {doc.get('count')} pour {len(rows)} produits")
    days = doc.get("days") or []
    if not contiguous(days):
        errors.append("archive : jours non consécutifs (un jour manquant doit valoir null)")
    if f and any(len(r[f["hist"]] or []) != len(days) for r in rows if len(r) == len(doc["fields"])):
        errors.append("archive : historique d'un produit non aligné sur les jours")
    age = hours_since(doc.get("prices"), now)
    if age is None:
        errors.append(f"date du guide des prix illisible ({doc.get('prices')!r})")
    elif age > 30:
        errors.append(f"prix du {doc['prices'][:10]} : guide Cardmarket non renouvelé depuis {age:.0f} h")
    old = prev.get("web/data/sealed.json") or {}
    of = {k: i for i, k in enumerate(old.get("fields") or [])}
    old_priced = sum(1 for r in old.get("products") or [] if "trend" in of and r[of["trend"]] is not None)
    drop("produits", len(rows), len(old.get("products") or []), MAX_DROP["sealed"], errors)
    drop("produits cotés", priced, old_priced, MAX_DROP["sealed"], errors)
    return {"upstream": doc.get("prices"), "count": len(rows), "previous": len(old.get("products") or []) or None,
            "errors": errors, "warnings": warnings, "details": {"priced": priced, "pricedBefore": old_priced or None,
                                                                "days": len(days)}}


def check_cards(cur, prev, now):
    errors, warnings = [], []
    doc = cur["web/data/cards.json"]
    if doc is None:
        return {"errors": ["web/data/cards.json absent ou illisible"], "warnings": []}
    f = rows_ok(doc, "cards", errors, ["id", "name", "set", "num", "img", "cm", "low", "tcp", "upd"])
    rows = doc.get("cards") or []
    stats = doc.get("stats") or {}
    if f and stats.get("cards") != len(rows):
        errors.append(f"format : stats.cards = {stats.get('cards')} pour {len(rows)} cartes")
    if f:
        unknown = {r[f["set"]] for r in rows if len(r) == len(doc["fields"])} - set(doc.get("sets") or {})
        if unknown:
            errors.append(f"format : cartes d'extensions inconnues {sorted(unknown)[:5]}")
    base, prices = cur["web/data/cards-base.json"], cur["web/data/cards-prices.json"]
    joined = join(base, prices) if base and prices else None
    if joined is None or joined.get("fields") != doc.get("fields") or joined.get("cards") != rows:
        errors.append("cards-base.json + cards-prices.json ne redonnent pas cards.json (split_catalog.py oublié ?)")
    upd = max((r[f["upd"]] for r in rows if f and len(r) == len(doc["fields"]) and r[f["upd"]]), default=None)
    age = hours_since(upd, now)
    if age is None:
        errors.append("aucune date de prix Cardmarket")
    elif age > 4 * 24:
        errors.append(f"prix Cardmarket les plus récents du {upd} : pas de mise à jour depuis {age / 24:.0f} jours")
    elif age > 48:
        warnings.append(f"prix Cardmarket les plus récents du {upd}")
    old = prev.get("web/data/cards.json")
    e, w = compare_catalog(old, doc) if f else ([], [])
    errors += e
    warnings += w
    details = {k: stats.get(k) for k in ("cardsCm", "cardsPriced", "cardsEn", "imgNone", "cardsDoubt") if k in stats}
    details["sets"] = len(doc.get("sets") or {})
    if stats.get("setsPriceSoon"):
        details["setsPriceSoon"] = stats["setsPriceSoon"]
    return {"upstream": upd, "count": len(rows), "previous": len((old or {}).get("cards") or []) or None,
            "errors": errors, "warnings": warnings, "details": details}


CHECKS = {"stores": check_stores, "sealed": check_sealed, "cards": check_cards}


def check(source, cur, prev, now=None, force=False):
    """Bilan d'une source : dict prêt pour status.json."""
    now = now or datetime.now(timezone.utc)
    r = CHECKS[source](cur, prev, now)
    errors, warnings = r.get("errors", []), r.get("warnings", [])
    if force and errors:
        warnings = [f"accepté à la main : {e}" for e in errors] + warnings
        errors = []
    entry = {"checked": now.strftime("%Y-%m-%dT%H:%M:%SZ"), "ok": not errors, "upstream": r.get("upstream"),
             "count": r.get("count"), "previous": r.get("previous"),
             "delta": None if r.get("count") is None or r.get("previous") is None else r["count"] - r["previous"],
             "warnings": warnings, "errors": errors}
    if r.get("details"):
        entry["details"] = r["details"]
    return entry


def render_status(status):
    """Une source par ligne, séparées par une ligne vide (fusion git sans conflit entre workflows)."""
    dump = lambda o: json.dumps(o, ensure_ascii=False, separators=(",", ":"))
    head = '{"v":1,"note":' + dump("Contrôle des données publiées (tools/check_data.py) : une source par ligne.") + ","
    lines = [f'"{s}":{dump(status.get(s))}' for s in SOURCES]
    return head + "\n\n" + ",\n\n".join(lines) + "}\n"


def summary(source, entry):
    """Bilan en Markdown pour le résumé du job GitHub."""
    mark = "✅" if entry["ok"] and not entry["warnings"] else ("⚠️" if entry["ok"] else "❌")
    delta = "" if entry["delta"] is None else f" ({entry['delta']:+d})"
    out = [f"### {mark} {NAMES[source]}", "", "| | |", "|---|---|",
           f"| Données en amont | {entry['upstream'] or '?'} |", f"| Éléments | {entry['count']}{delta} |"]
    for k, v in (entry.get("details") or {}).items():
        out.append(f"| {k} | {json.dumps(v, ensure_ascii=False) if isinstance(v, (dict, list)) else v} |")
    out += [""] + [f"- ❌ {e}" for e in entry["errors"]] + [f"- ⚠️ {w}" for w in entry["warnings"]]
    return "\n".join(out) + "\n"


def merge_status(source, rev):
    """Conflit de publication : status.json publié par les autres sources, plus la ligne de `source` venue de `rev`."""
    mine = git_json("web/data/status.json", rev) or {}
    if source not in mine:
        print(f"{rev} n'a pas de ligne « {source} » dans status.json", file=sys.stderr)
        return 1
    status = git_json("web/data/status.json", "HEAD") or {}
    status[source] = mine[source]
    STATUS.write_text(render_status(status), "utf-8")
    return 0


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[1])
    ap.add_argument("source", choices=SOURCES)
    ap.add_argument("--base", default="HEAD", help="dernier état publié (révision git)")
    ap.add_argument("--revert", action="store_true", help="en cas d'anomalie, remet les fichiers de la source à leur dernier état publié")
    ap.add_argument("--force", action="store_true", help="anomalies acceptées à la main : simples avertissements")
    ap.add_argument("--merge-status", metavar="REV", help="sans contrôle : ligne de la source prise dans REV, posée sur status.json")
    args = ap.parse_args()
    if args.merge_status:
        sys.exit(merge_status(args.source, args.merge_status))
    files = FILES[args.source]
    cur = {p: read_json(p) for p in files}
    prev = {p: git_json(p, args.base) for p in files}
    entry = check(args.source, cur, prev, force=args.force)
    text = summary(args.source, entry)
    print(text)
    if os.environ.get("GITHUB_STEP_SUMMARY"):
        with open(os.environ["GITHUB_STEP_SUMMARY"], "a", encoding="utf-8") as fh:
            fh.write(text)
    try:
        status = json.loads(STATUS.read_text("utf-8"))
    except (OSError, ValueError):
        status = {}
    status[args.source] = entry
    STATUS.write_text(render_status(status), "utf-8")
    for w in entry["warnings"]:
        print(f"::warning::{NAMES[args.source]} : {w}")
    if entry["errors"]:
        for e in entry["errors"]:
            print(f"::error::{NAMES[args.source]} : {e}")
        if args.revert:
            for p in files:
                if prev.get(p) is not None:
                    subprocess.run(["git", "checkout", args.base, "--", p], cwd=ROOT, check=False)
            print("Fichiers remis à leur dernier état publié : seul status.json sera publié.")
        sys.exit(1)


if __name__ == "__main__":
    main()
