#!/usr/bin/env python3
"""
sync_tcgdex.py : télécharge séries, extensions, cartes (JSON) et images depuis l'API TCGdex.

Aucune dépendance externe (bibliothèque standard uniquement, Python 3.9+).
Reprise automatique : les fichiers déjà téléchargés sont ignorés.

Exemples :
    python sync_tcgdex.py --out data/tcgdex                     # tout, en français
    python sync_tcgdex.py --only-set base1 --out data/test      # test rapide sur une extension
    python sync_tcgdex.py --skip-images                         # données seulement
    python sync_tcgdex.py --ext png --quality high              # images png
    python sync_tcgdex.py --refresh                             # re-télécharge tout

Arborescence produite :
    <out>/series.json                       liste des séries
    <out>/sets.json                         liste des extensions
    <out>/sets/<set_id>.json                détail d'une extension (+ liste de ses cartes)
    <out>/cards/<set_id>/<card_id>.json     détail d'une carte (dont prix Cardmarket/TCGplayer)
    <out>/images/<set_id>/<localId>.<ext>   image de carte
    <out>/images/_sets/<set_id>_logo.<ext>  logo d'extension (idem _symbol)
    <out>/index.json                        index série > extension > cartes, avec chemins locaux
    <out>/failures.json                     erreurs éventuelles (vide si tout s'est bien passé)
"""
import argparse
import json
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

API = "https://api.tcgdex.net/v2"
USER_AGENT = "PKM-App-sync/1.0"

lock = threading.Lock()
failures = []


def http_get(url, retries=4, timeout=30):
    """Retourne les octets, ou None si 404. Réessaie en cas d'erreur réseau / 5xx / 429."""
    last = None
    for attempt in range(retries):
        try:
            req = Request(url, headers={"User-Agent": USER_AGENT})
            with urlopen(req, timeout=timeout) as resp:
                return resp.read()
        except HTTPError as e:
            if e.code == 404:
                return None
            last = e
        except (URLError, TimeoutError, ConnectionError) as e:
            last = e
        time.sleep(1.5 * (attempt + 1))
    raise RuntimeError(f"{url} -> {last}")


def get_json(url):
    data = http_get(url)
    return None if data is None else json.loads(data.decode("utf-8"))


def safe_name(value):
    return str(value).replace("/", "_").replace("\\", "_").replace(" ", "_")


def write_atomic(path: Path, data: bytes):
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_bytes(data)
    tmp.replace(path)


def save_json(path: Path, obj):
    write_atomic(path, json.dumps(obj, ensure_ascii=False, indent=2).encode("utf-8"))


def exists(path: Path):
    return path.exists() and path.stat().st_size > 0


def record_failure(kind, ident, error):
    with lock:
        failures.append({"type": kind, "id": ident, "error": str(error)})


def download_file(url, dest: Path, refresh: bool):
    """Télécharge url vers dest. Retourne 'ok', 'skip', 'missing' ou 'error'."""
    if exists(dest) and not refresh:
        return "skip"
    try:
        data = http_get(url)
    except Exception as e:  # noqa: BLE001
        record_failure("file", url, e)
        return "error"
    if data is None:
        return "missing"
    write_atomic(dest, data)
    return "ok"


def process_card(brief, set_id, args, out: Path):
    """Détail JSON + image pour une carte. Retourne l'entrée d'index."""
    card_id = brief["id"]
    local_id = brief.get("localId", card_id)
    entry = {"id": card_id, "localId": local_id, "name": brief.get("name"), "image": None}

    if not args.skip_details:
        dest = out / "cards" / set_id / f"{safe_name(card_id)}.json"
        if not exists(dest) or args.refresh:
            try:
                detail = get_json(f"{API}/{args.lang}/cards/{card_id}")
                if detail is not None:
                    save_json(dest, detail)
            except Exception as e:  # noqa: BLE001
                record_failure("card", card_id, e)

    base = brief.get("image")
    if base and not args.skip_images:
        rel = Path("images") / set_id / f"{safe_name(local_id)}.{args.ext}"
        status = download_file(f"{base}/{args.quality}.{args.ext}", out / rel, args.refresh)
        if status in ("ok", "skip"):
            entry["image"] = rel.as_posix()
        elif status == "missing":
            record_failure("image", card_id, "404 (pas d'image disponible dans cette langue)")
    return entry


def main():
    p = argparse.ArgumentParser(description="Synchronise le catalogue TCGdex en local.")
    p.add_argument("--out", default="data/tcgdex", help="dossier de sortie")
    p.add_argument("--lang", default="fr", help="langue (fr, en, de, es, it, pt-br...)")
    p.add_argument("--quality", default="high", choices=["high", "low"])
    p.add_argument("--ext", default="webp", choices=["webp", "png", "jpg"])
    p.add_argument("--workers", type=int, default=8, help="téléchargements en parallèle")
    p.add_argument("--only-set", help="ne traiter qu'une extension (ex. base1, sv03)")
    p.add_argument("--skip-images", action="store_true")
    p.add_argument("--skip-details", action="store_true", help="ne pas télécharger le JSON détaillé de chaque carte")
    p.add_argument("--refresh", action="store_true", help="re-télécharger même si le fichier existe")
    args = p.parse_args()

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)

    print(f"Langue: {args.lang} | images: {args.quality}.{args.ext} | sortie: {out}")

    series = get_json(f"{API}/{args.lang}/series")
    sets = get_json(f"{API}/{args.lang}/sets")
    if series is None or sets is None:
        sys.exit("Impossible de récupérer les séries / extensions.")
    save_json(out / "series.json", series)
    save_json(out / "sets.json", sets)

    if args.only_set:
        sets = [s for s in sets if s["id"] == args.only_set]
        if not sets:
            sys.exit(f"Extension introuvable : {args.only_set}")

    print(f"{len(series)} séries, {len(sets)} extensions à traiter.")

    index = {}  # serie_id -> {"name":..., "sets": {set_id: {...}}}
    total_cards = 0
    t0 = time.time()

    for n, s in enumerate(sets, 1):
        set_id = s["id"]
        try:
            detail = get_json(f"{API}/{args.lang}/sets/{set_id}")
        except Exception as e:  # noqa: BLE001
            record_failure("set", set_id, e)
            continue
        if detail is None:
            record_failure("set", set_id, "404")
            continue
        save_json(out / "sets" / f"{safe_name(set_id)}.json", detail)

        # Logo et symbole de l'extension
        set_images = {}
        if not args.skip_images:
            for kind in ("logo", "symbol"):
                base = detail.get(kind)
                if base:
                    rel = Path("images") / "_sets" / f"{safe_name(set_id)}_{kind}.{args.ext}"
                    status = download_file(f"{base}.{args.ext}", out / rel, args.refresh)
                    if status in ("ok", "skip"):
                        set_images[kind] = rel.as_posix()

        briefs = detail.get("cards") or []
        entries = []
        with ThreadPoolExecutor(max_workers=args.workers) as pool:
            futures = [pool.submit(process_card, b, set_id, args, out) for b in briefs]
            for f in as_completed(futures):
                try:
                    entries.append(f.result())
                except Exception as e:  # noqa: BLE001
                    record_failure("card", "?", e)
        entries.sort(key=lambda e: str(e["localId"]).zfill(6))
        total_cards += len(entries)

        serie = detail.get("serie") or {}
        serie_id = serie.get("id", "inconnue")
        bucket = index.setdefault(serie_id, {"name": serie.get("name"), "sets": {}})
        bucket["sets"][set_id] = {
            "name": detail.get("name"),
            "releaseDate": detail.get("releaseDate"),
            "cardCount": detail.get("cardCount"),
            "images": set_images,
            "cards": entries,
        }
        elapsed = time.time() - t0
        print(f"[{n}/{len(sets)}] {set_id:<12} {len(entries):>4} cartes  (total {total_cards}, {elapsed:0.0f}s)")

    save_json(out / "index.json", index)
    save_json(out / "failures.json", failures)
    print(f"\nTerminé : {total_cards} cartes indexées, {len(failures)} erreur(s).")
    if failures:
        print(f"Détail dans {out / 'failures.json'} (relancer le script reprend là où il s'est arrêté).")


if __name__ == "__main__":
    main()
