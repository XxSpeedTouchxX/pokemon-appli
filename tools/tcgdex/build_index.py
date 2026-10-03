#!/usr/bin/env python3
"""
build_index.py : transforme la copie locale TCGdex (sortie de sync_tcgdex.py) en un catalogue
compact que la démo web charge en une fois : web/data/cards.json.

Aucune dépendance externe (Python 3.9+).

    python tools/tcgdex/build_index.py --src data/tcgdex --out web/data/cards.json

Contenu de cards.json :
    sets      { set_id: [nom, série, date de sortie, logo] }
    fields    noms des colonnes de chaque carte
    cards     [[id, nom, set_id, numéro, rareté, image, cm, low, avg30, tcp, maj], ...]
              cm    = tendance Cardmarket (€)      low = plus bas Cardmarket (€, prix demandé)
              avg30 = moyenne Cardmarket 30 jours  tcp = TCGplayer « market », converti en €
              maj   = date de mise à jour des prix Cardmarket
    img       préfixe commun des adresses d'images (CDN TCGdex) : image = img + chemin
    usdEur    taux appliqué aux prix TCGplayer (BCE du jour, sinon taux de secours)
    rarities  nombre de cartes par rareté (contrôle)
"""
import argparse
import json
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET

ASSETS = "https://assets.tcgdex.net/"
ECB = "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml"
FALLBACK_USD_EUR = 0.86  # taux de secours si la BCE ne répond pas
SKIP_SERIES = {"tcgp"}  # Pokémon TCG Pocket : cartes numériques, hors collection physique
TCP_VARIANTS = ["normal", "holofoil", "reverse-holofoil", "1st-edition-holofoil", "1st-edition", "unlimited-holofoil", "unlimited"]


def usd_eur():
    """Taux USD → EUR publié par la BCE (1 / cours EUR-USD). Retourne (taux, date, source)."""
    try:
        req = Request(ECB, headers={"User-Agent": "PKM-App-index/1.0"})
        with urlopen(req, timeout=20) as resp:
            root = ET.fromstring(resp.read())
        for el in root.iter():
            if el.get("currency") == "USD":
                day = next((e.get("time") for e in root.iter() if e.get("time")), None)
                return round(1 / float(el.get("rate")), 5), day, "BCE"
    except Exception as e:  # noqa: BLE001
        print(f"BCE indisponible ({e}) : taux de secours {FALLBACK_USD_EUR}")
    return FALLBACK_USD_EUR, None, "secours"


def num(v):
    return round(float(v), 2) if isinstance(v, (int, float)) and v > 0 else None


def first(d, *keys):
    for k in keys:
        x = num(d.get(k))
        if x is not None:
            return x
    return None


def prices(card, rate):
    pr = card.get("pricing") or {}
    cm = pr.get("cardmarket") or {}
    tp = pr.get("tcgplayer") or {}
    tcp = None
    for v in TCP_VARIANTS + [k for k in tp if k not in TCP_VARIANTS]:
        row = tp.get(v)
        if isinstance(row, dict):
            usd = first(row, "marketPrice", "midPrice")
            if usd is not None:
                tcp = round(usd * rate, 2)
                break
    upd = str(cm.get("updated") or "")[:10] or None
    return (first(cm, "trend", "trend-holo"), first(cm, "low", "low-holo"), first(cm, "avg30", "avg30-holo"), tcp, upd)


def short_img(url):
    if not url:
        return ""
    return url[len(ASSETS):] if url.startswith(ASSETS) else url


def main():
    p = argparse.ArgumentParser(description="Construit web/data/cards.json à partir de la copie TCGdex.")
    p.add_argument("--src", default="data/tcgdex")
    p.add_argument("--out", default="web/data/cards.json")
    p.add_argument("--min-cards", type=int, default=1000, help="échec si moins de cartes (protège contre un index vide)")
    args = p.parse_args()
    src, out = Path(args.src), Path(args.out)

    rate, rate_day, rate_src = usd_eur()
    sets, cards, rarities, missing, skipped = {}, [], {}, 0, 0
    for sf in sorted((src / "sets").glob("*.json")):
        s = json.loads(sf.read_text("utf-8"))
        sid = s["id"]
        if (s.get("serie") or {}).get("id") in SKIP_SERIES:
            skipped += 1
            continue
        sets[sid] = [s.get("name") or sid, (s.get("serie") or {}).get("name") or "", s.get("releaseDate") or "", short_img(s.get("logo"))]
        briefs = {b["id"]: b for b in (s.get("cards") or [])}
        for cid, b in briefs.items():
            cf = src / "cards" / sid / (str(cid).replace("/", "_").replace("\\", "_").replace(" ", "_") + ".json")
            c = json.loads(cf.read_text("utf-8")) if cf.exists() and cf.stat().st_size > 0 else None
            if c is None:
                missing += 1
                c = b
            rarity = c.get("rarity") or ""
            rarities[rarity] = rarities.get(rarity, 0) + 1
            cm, low, avg30, tcp, upd = prices(c, rate)
            cards.append([cid, c.get("name") or b.get("name") or "", sid, str(c.get("localId") or b.get("localId") or ""),
                          rarity, short_img(c.get("image") or b.get("image")), cm, low, avg30, tcp, upd])

    if len(cards) < args.min_cards:
        sys.exit(f"Seulement {len(cards)} cartes : index non écrit (minimum {args.min_cards}).")

    # Extensions les plus récentes d'abord, puis numéro dans l'extension.
    def key(c):
        n = c[3]
        return (sets[c[2]][2], -int(n) if n.isdigit() else -10**9, n)
    cards.sort(key=key, reverse=True)

    doc = {
        "v": 1,
        "generated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "source": "TCGdex (api.tcgdex.net), catalogue français",
        "img": ASSETS,
        "usdEur": rate, "usdEurDate": rate_day, "usdEurSource": rate_src,
        "sets": sets,
        "fields": ["id", "name", "set", "num", "rarity", "img", "cm", "low", "avg30", "tcp", "upd"],
        "cards": cards,
        "rarities": dict(sorted(rarities.items(), key=lambda kv: -kv[1])),
    }
    out.parent.mkdir(parents=True, exist_ok=True)
    tmp = out.with_suffix(".tmp")
    # Une carte par ligne : le fichier reste lisible et l'historique git (archive des prix) reste léger.
    dump = lambda o: json.dumps(o, ensure_ascii=False, separators=(",", ":"))
    head = {k: v for k, v in doc.items() if k != "cards"}
    text = dump(head)[:-1] + ',\n"cards":[\n' + ",\n".join(dump(c) for c in cards) + "\n]}\n"
    tmp.write_text(text, "utf-8")
    tmp.replace(out)

    priced = sum(1 for c in cards if c[6] is not None or c[9] is not None)
    print(f"{len(cards)} cartes, {len(sets)} extensions ({skipped} extensions TCG Pocket ignorées), {priced} avec un prix, {missing} sans détail.")
    print(f"Taux USD→EUR : {rate} ({rate_src}{' du ' + rate_day if rate_day else ''}).")
    print(f"Écrit : {out} ({out.stat().st_size / 1e6:.1f} Mo)")
    print("Raretés :", json.dumps(doc["rarities"], ensure_ascii=False))


if __name__ == "__main__":
    t0 = time.time()
    main()
    print(f"Durée : {time.time() - t0:.0f} s")
