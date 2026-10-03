#!/usr/bin/env python3
"""
build_index.py : transforme la copie locale TCGdex (sortie de sync_tcgdex.py) en un catalogue
compact que la démo web charge en une fois : web/data/cards.json.

Aucune dépendance externe (Python 3.9+).

    python tools/tcgdex/build_index.py --src data/tcgdex --en data/tcgdex-en --out web/data/cards.json
    python tools/tcgdex/build_index.py --src data/tcgdex --en data/tcgdex-en --list-en-only

Sources :
    --src  copie française complète (sync_tcgdex.py --lang fr)
    --en   copie anglaise, facultative (sync_tcgdex.py --lang en). Elle sert à :
           - compléter les visuels absents en français par le scan anglais de la même carte ;
           - ajouter les extensions jamais sorties en français (cartes en anglais) ;
           - --list-en-only liste ces extensions, pour en télécharger le détail.

Contenu de cards.json :
    sets      { set_id: [nom, série, date de sortie, logo, nombre officiel de cartes, langue des cartes] }
    fields    noms des colonnes de chaque carte
    cards     [[id, nom, set_id, numéro, rareté, image, cm, low, avg30, tcp, maj], ...]
              cm    = tendance Cardmarket (€)      low = plus bas Cardmarket (€, prix demandé)
              avg30 = moyenne Cardmarket 30 jours  tcp = TCGplayer « market », converti en €
              maj   = date de mise à jour des prix Cardmarket
    img       préfixe commun des adresses d'images (CDN TCGdex) : image = img + chemin.
              Le chemin commence par la langue du visuel (fr/… ou en/…).
    usdEur    taux appliqué aux prix TCGplayer (BCE du jour, sinon taux de secours)
    stats     contrôle : cartes, visuels français, visuels anglais de repli, cartes sans visuel
    rarities  nombre de cartes par rareté (contrôle)
"""
import argparse
import json
import re
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
# Raretés des cartes en anglais, dites comme dans le catalogue français.
RARITY_FR = {
    "common": "Commune", "uncommon": "Peu Commune", "rare": "Rare", "rare holo": "Rare Holo", "holo rare": "Holo Rare",
    "promo": "Promo", "none": "Sans Rareté", "ultra rare": "Ultra Rare", "rare ultra": "Ultra Rare", "double rare": "Double rare",
    "illustration rare": "Illustration rare", "special illustration rare": "Illustration spéciale rare",
    "hyper rare": "Hyper rare", "mega hyper rare": "Méga Hyper Rare", "shiny rare": "Shiny rare",
    "shiny ultra rare": "Chromatique ultra rare", "radiant rare": "Radieux Rare", "legend": "LÉGENDE", "rare prime": "Rare Prime",
    "classic collection": "Collection Classique", "black white rare": "Rare Noir Blanc", "crown": "Couronne",
    "rare holo v": "Holo Rare V", "rare holo vmax": "Holo Rare VMAX", "rare holo vstar": "Holo Rare VSTAR",
    "rare holo lv.x": "Rare Holo LV.X", "rare secret": "Rare Secrète", "secret rare": "Rare Secrète",
}


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


def load(path):
    try:
        return json.loads(path.read_text("utf-8")) if path.exists() and path.stat().st_size > 0 else None
    except ValueError:
        return None


def safe_name(value):  # même règle que sync_tcgdex.py
    return str(value).replace("/", "_").replace("\\", "_").replace(" ", "_")


def read_sets(root):
    """Détail des extensions d'une copie TCGdex, sans TCG Pocket : { set_id: détail }."""
    out = {}
    if not root or not (root / "sets").is_dir():
        return out
    for sf in sorted((root / "sets").glob("*.json")):
        s = load(sf)
        if s and (s.get("serie") or {}).get("id") not in SKIP_SERIES:
            out[s["id"]] = s
    return out


def natural(n):
    """Clé de tri des numéros : 2 < 10 < 100, puis les numéros à lettres (TG01, SV001…)."""
    return tuple((0, int(t)) if t.isdigit() else (1, t) for t in re.findall(r"\d+|\D+", str(n)))


def main():
    p = argparse.ArgumentParser(description="Construit web/data/cards.json à partir de la copie TCGdex.")
    p.add_argument("--src", default="data/tcgdex", help="copie française")
    p.add_argument("--en", default=None, help="copie anglaise (facultative)")
    p.add_argument("--out", default="web/data/cards.json")
    p.add_argument("--list-en-only", action="store_true", help="affiche les extensions absentes du catalogue français, puis s'arrête")
    p.add_argument("--min-cards", type=int, default=1000, help="échec si moins de cartes (protège contre un index vide)")
    args = p.parse_args()
    src, out = Path(args.src), Path(args.out)
    en = Path(args.en) if args.en else None

    fr_sets, en_sets = read_sets(src), read_sets(en)
    en_only = [sid for sid in en_sets if sid not in fr_sets]
    if args.list_en_only:
        print("\n".join(en_only))
        return

    t0 = time.time()
    rate, rate_day, rate_src = usd_eur()
    fr_series = {s["id"]: s.get("name") for s in (load(src / "series.json") or []) if s.get("id")}
    en_img = {b["id"]: b.get("image") for s in en_sets.values() for b in (s.get("cards") or []) if b.get("image")}

    sets, cards, rarities = {}, [], {}
    stats = {"cards": 0, "cardsEn": 0, "imgFr": 0, "imgEn": 0, "imgNone": 0, "noDetail": 0}

    def add_set(sid, s, lang, root):
        serie = s.get("serie") or {}
        logo = s.get("logo") or (en_sets.get(sid) or {}).get("logo")
        official = (s.get("cardCount") or {}).get("official") or ""
        sets[sid] = [s.get("name") or sid, fr_series.get(serie.get("id")) or serie.get("name") or "",
                     s.get("releaseDate") or "", short_img(logo), official, lang]
        for b in s.get("cards") or []:
            cid = b["id"]
            c = load(root / "cards" / sid / (safe_name(cid) + ".json"))
            if c is None:
                stats["noDetail"] += 1
                c = b
            img = c.get("image") or b.get("image")
            if img:
                stats["imgFr" if lang == "fr" else "imgEn"] += 1
            elif lang == "fr" and en_img.get(cid):
                img = en_img[cid]
                stats["imgEn"] += 1
            else:
                stats["imgNone"] += 1
            rarity = c.get("rarity") or ""
            if lang == "en":
                rarity = RARITY_FR.get(rarity.lower(), rarity)
                stats["cardsEn"] += 1
            rarities[rarity] = rarities.get(rarity, 0) + 1
            cm, low, avg30, tcp, upd = prices(c, rate)
            cards.append([cid, c.get("name") or b.get("name") or "", sid, str(c.get("localId") or b.get("localId") or ""),
                          rarity, short_img(img), cm, low, avg30, tcp, upd])

    for sid, s in fr_sets.items():
        add_set(sid, s, "fr", src)
    for sid in en_only:
        add_set(sid, en_sets[sid], "en", en)
    stats["cards"] = len(cards)

    if len(cards) < args.min_cards:
        sys.exit(f"Seulement {len(cards)} cartes : index non écrit (minimum {args.min_cards}).")

    # Extensions les plus récentes d'abord ; dans une extension, numéros dans l'ordre (tri stable).
    cards.sort(key=lambda c: natural(c[3]))
    cards.sort(key=lambda c: (sets[c[2]][2], c[2]), reverse=True)

    doc = {
        "v": 2,
        "generated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "source": "TCGdex (api.tcgdex.net) : catalogue français, complété par le catalogue anglais",
        "img": ASSETS,
        "usdEur": rate, "usdEurDate": rate_day, "usdEurSource": rate_src,
        "sets": sets,
        "fields": ["id", "name", "set", "num", "rarity", "img", "cm", "low", "avg30", "tcp", "upd"],
        "stats": stats,
        "rarities": dict(sorted(rarities.items(), key=lambda kv: -kv[1])),
        "cards": cards,
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
    print(f"{len(cards)} cartes dans {len(sets)} extensions, dont {stats['cardsEn']} cartes en anglais "
          f"({len(en_only)} extensions jamais sorties en français) ; {priced} avec un prix.")
    print(f"Visuels : {stats['imgFr']} en français, {stats['imgEn']} en anglais, {stats['imgNone']} sans visuel. "
          f"{stats['noDetail']} cartes sans détail.")
    if en_only:
        print("Extensions en anglais :", ", ".join(f"{sid} ({en_sets[sid].get('name')})" for sid in en_only))
    print(f"Taux USD→EUR : {rate} ({rate_src}{' du ' + rate_day if rate_day else ''}).")
    print(f"Écrit : {out} ({out.stat().st_size / 1e6:.1f} Mo) en {time.time() - t0:.0f} s")
    print("Raretés :", json.dumps(doc["rarities"], ensure_ascii=False))


if __name__ == "__main__":
    main()
