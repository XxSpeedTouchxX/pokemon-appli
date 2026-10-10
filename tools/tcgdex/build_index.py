#!/usr/bin/env python3
"""
build_index.py : transforme la copie locale TCGdex (sortie de sync_tcgdex.py) en un catalogue
compact que la démo web charge en une fois : web/data/cards.json.

Aucune dépendance externe (Python 3.9+).

    python tools/tcgdex/build_index.py --src data/tcgdex --en data/tcgdex-en \
        --alt de=data/tcgdex-de --alt it=data/tcgdex-it --alt es=data/tcgdex-es --out web/data/cards.json
    python tools/tcgdex/build_index.py --src data/tcgdex --en data/tcgdex-en --list-en-only

Sources :
    --src  copie française complète (sync_tcgdex.py --lang fr)
    --en   copie anglaise, facultative (sync_tcgdex.py --lang en). Elle sert à :
           - ajouter les extensions sans version française dans TCGdex (cartes en anglais) ;
           - compléter les visuels absents en français ;
           - --list-en-only liste ces extensions, pour en télécharger le détail.
    --alt  autres versions (langue=dossier), facultatives : visuels de repli, après l'anglais.
           Même dessin officiel, texte dans une autre langue.
    --ptcg copie du dépôt PokemonTCG/pokemon-tcg-data, facultative : scans anglais (ptcg.py).

Ordre des visuels : scan TCGdex dans la langue de la carte ; sinon TCGdex anglais, allemand, italien,
espagnol ; sinon, en dernier recours, pokemontcg.io (service dont l'arrêt est prévu le 1er mars 2027).
Les correspondances pokemontcg.io validées sont gardées dans tools/tcgdex/ptcg_images.json : le jour où
le dépôt ne répond pas, ce fichier sert ; le jour où les images ne répondent plus, elles sont écartées.

Repli d'un visuel absent : même carte dans l'autre langue (même identifiant, ou même extension et même
numéro), sinon dans l'extension parente (« swsh9tg » TG01 → « swsh9 » TG01, « swsh12.5gg » GG01 →
« swsh12.5 » GG01, « swsh4.5sv » SV001 → « swsh4.5 » SV001).

Contenu de cards.json :
    sets      { set_id: [nom, série, date de sortie, logo, nombre officiel de cartes, langue des cartes] }
    fields    noms des colonnes de chaque carte
    cards     [[id, nom, set_id, numéro, rareté, image, cm, low, avg30, tcp, maj, avg7, avg1, langue], ...]
              cm    = tendance Cardmarket (€)      low = plus bas Cardmarket (€, prix demandé)
              avg30 = moyenne Cardmarket 30 jours  tcp = TCGplayer « market », converti en €
              maj   = date de mise à jour des prix Cardmarket
              avg7, avg1 = moyennes Cardmarket 7 jours et 1 jour (tendance de la collection sur l'accueil)
              cm et les moyennes viennent de la même variante (normale, sinon holo).
              langue = « en » pour une carte ajoutée à une extension française depuis la version anglaise
              (TCGdex, sinon pokemontcg.io : complete.py), vide sinon.
    img       préfixe commun des adresses d'images (CDN TCGdex) : image = img + chemin.
              Le chemin commence par la langue du visuel (fr/… ou en/…) ; « ptcg:set/numéro » pour
              pokemontcg.io.
    usdEur    taux appliqué aux prix TCGplayer (BCE du jour, sinon taux de secours)
    stats     contrôle : cartes, visuels dans la langue de la carte, visuels de repli par langue, sans visuel
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

from ptcg import PTCG_IMG, PtcgData, compact_image, norm_number  # visuels anglais de dernier recours (pokemontcg.io)
from complete import en_extra, ptcg_extra, ptcg_prices  # cartes manquantes en français (version anglaise, pokemontcg.io)

PTCG_CACHE = Path(__file__).with_name("ptcg_images.json")

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
    # Tendance et moyennes d'une même variante : normale si sa tendance existe, sinon holo.
    sfx = "" if num(cm.get("trend")) is not None or num(cm.get("trend-holo")) is None else "-holo"
    trend, avg30, avg7, avg1 = (num(cm.get(k + sfx)) for k in ("trend", "avg30", "avg7", "avg1"))
    return (trend, first(cm, "low", "low-holo"), avg30, tcp, upd, avg7, avg1)


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


def norm_local(n):
    """Numéro comparable d'une langue à l'autre : SV001 = SV1, TG01 = TG1, 001 = 1."""
    return re.sub(r"(^|\D)0+(?=\d)", r"\1", str(n)).upper()


def parent_set(sid):
    """Extension parente d'une sous-extension (galerie de dresseurs, galerie, coffre) : swsh9tg → swsh9."""
    m = re.match(r"^(.+?)(tg|gg|sv)$", sid)
    return m.group(1) if m else None


class Fallback:
    """Visuels et logos d'une autre langue, cherchés par identifiant puis par (extension, numéro)."""

    def __init__(self, lang, sets):
        self.lang, self.sets, self.by_id, self.by_local, self.names = lang, sets, {}, {}, {}
        for sid, s in sets.items():
            for b in s.get("cards") or []:
                self.names[b["id"]] = b.get("name")
                if b.get("image"):
                    self.by_id[b["id"]] = b["image"]
                    self.by_local[(sid, norm_local(b.get("localId", "")))] = b["image"]

    def image(self, cid, sid, local):
        key = norm_local(local)
        return (self.by_id.get(cid) or self.by_local.get((sid, key))
                or (parent_set(sid) and self.by_local.get((parent_set(sid), key))))

    def logo(self, sid):
        for k in (sid, parent_set(sid)):
            if k and (self.sets.get(k) or {}).get("logo"):
                return self.sets[k]["logo"]
        return None


def ptcg_alive(path):
    """L'hébergeur d'images de pokemontcg.io répond-il encore (vraie image, pas une page d'erreur) ?"""
    url = PTCG_IMG + path[len("ptcg:"):] + ".png"
    try:
        with urlopen(Request(url, method="HEAD", headers={"User-Agent": "PKM-App-index/1.0"}), timeout=20) as resp:
            return resp.status == 200 and (resp.headers.get("Content-Type") or "").startswith("image/")
    except Exception as e:  # noqa: BLE001
        print(f"pokemontcg.io ne répond pas ({e}).")
        return False


def natural(n):
    """Clé de tri des numéros : 2 < 10 < 100, puis les numéros à lettres (TG01, SV001…)."""
    return tuple((0, int(t)) if t.isdigit() else (1, t) for t in re.findall(r"\d+|\D+", str(n)))


def main():
    p = argparse.ArgumentParser(description="Construit web/data/cards.json à partir de la copie TCGdex.")
    p.add_argument("--src", default="data/tcgdex", help="copie française")
    p.add_argument("--en", default=None, help="copie anglaise (facultative)")
    p.add_argument("--alt", action="append", default=[], metavar="LANGUE=DOSSIER", help="autre version, pour les visuels de repli")
    p.add_argument("--ptcg", default=None, help="copie de PokemonTCG/pokemon-tcg-data (facultative)")
    p.add_argument("--no-probe", action="store_true", help="ne pas vérifier que les images pokemontcg.io répondent (tests)")
    p.add_argument("--out", default="web/data/cards.json")
    p.add_argument("--list-en-only", action="store_true", help="affiche les extensions absentes du catalogue français, puis s'arrête")
    p.add_argument("--list-en-extra", action="store_true", help="affiche les extensions françaises dont la version anglaise a des cartes en plus, puis s'arrête")
    p.add_argument("--min-cards", type=int, default=1000, help="échec si moins de cartes (protège contre un index vide)")
    args = p.parse_args()
    src, out = Path(args.src), Path(args.out)
    en = Path(args.en) if args.en else None

    fr_sets, en_sets = read_sets(src), read_sets(en)
    en_only = [sid for sid in en_sets if sid not in fr_sets]
    if args.list_en_only:
        print("\n".join(en_only))
        return
    if args.list_en_extra:
        print("\n".join(sid for sid in fr_sets if en_extra(fr_sets[sid], en_sets.get(sid))))
        return

    t0 = time.time()
    rate, rate_day, rate_src = usd_eur()
    fr_series = {s["id"]: s.get("name") for s in (load(src / "series.json") or []) if s.get("id")}
    # Visuels de repli : l'anglais d'abord, puis les autres versions dans l'ordre donné.
    fallbacks = [Fallback("en", en_sets)] if en_sets else []
    for spec in args.alt:
        lang, _, folder = spec.partition("=")
        alt = read_sets(Path(folder))
        if alt:
            fallbacks.append(Fallback(lang, alt))
    own = Fallback("fr", fr_sets)
    en_fb = fallbacks[0] if fallbacks and fallbacks[0].lang == "en" else None
    ptcg = PtcgData(args.ptcg) if args.ptcg else None
    cache = (load(PTCG_CACHE) or {}) if not ptcg else {}
    if args.ptcg and not ptcg:
        print(f"pokemontcg.io : aucune donnée dans {args.ptcg} ; correspondances reprises de {PTCG_CACHE.name} ({len(cache)}).")
    ptcg_found, ptcg_report = {}, []

    sets, cards, rarities = {}, [], {}
    stats = {"cards": 0, "cardsEn": 0, "cardsEnExtra": 0, "cardsPtcg": 0, "imgOwn": 0, "imgAlt": {}, "imgNone": 0, "noDetail": 0}
    # Extensions pokemontcg.io visées par plusieurs extensions TCGdex (Zarbi d'EX Forces Cachées) : pas de complément.
    ptcg_of = {sid: ptcg.map_set(sid, (en_sets.get(sid) or {}).get("name"), s.get("releaseDate")) for sid, s in fr_sets.items()} if ptcg else {}
    ptcg_count = {}
    for ps in ptcg_of.values():
        if ps:
            ptcg_count[ps] = ptcg_count.get(ps, 0) + 1
    ptcg_shared = {ps for ps, k in ptcg_count.items() if k > 1}

    def ptcg_for_set(sid, s, lang, rows):
        """Visuels pokemontcg.io des cartes encore sans visuel d'une extension. Les correspondances non vérifiables
        (même numéro, rien d'autre à comparer) ne sont prises que si la numérotation de l'extension est confirmée."""
        if not any(r["img"] is None for r in rows):
            return {}
        if not ptcg:
            return {r["cid"]: cache[r["cid"]] for r in rows if r["img"] is None and r["cid"] in cache}
        en_name = s.get("name") if lang == "en" else (en_sets.get(sid) or {}).get("name")
        ps = ptcg.map_set(sid, en_name, s.get("releaseDate"))
        if not ps:
            return {}
        good = bad = 0
        found = {}
        for r in rows:
            card, state = ptcg.match(ps, r["local"], r["en"], r["dex"], r["artist"])
            same_num = state is not None or card is not None
            if state is True and card is not None and norm_number(card.get("number")) == norm_number(r["local"]):
                good += 1
            elif same_num and state is not None:
                bad += 1
            if r["img"] is None and card is not None:
                found[r["cid"]] = (card, state)
        sure = good + bad >= 3 and good / (good + bad) >= 0.9
        out = {}
        for cid, (card, state) in found.items():
            path = compact_image(card.get("images"))
            if path and (state is True or (state is None and sure)):
                out[cid] = path
        missing = sum(1 for r in rows if r["img"] is None)
        ptcg_report.append(f"{sid}→{ps} {len(out)}/{missing} (numérotation {good}/{good + bad})")
        return out

    def add_set(sid, s, lang, root):
        serie = s.get("serie") or {}
        logo = s.get("logo") or (own.logo(sid) if lang == "fr" else None)
        for fb in fallbacks:
            logo = logo or fb.logo(sid)
        official = (s.get("cardCount") or {}).get("official") or ""
        name = re.sub(r"(?<=[a-zà-ÿ])(?=\d)", " ", s.get("name") or sid)  # « Classique30ᵉ » → « Classique 30ᵉ »
        sets[sid] = [name, fr_series.get(serie.get("id")) or serie.get("name") or "",
                     s.get("releaseDate") or "", short_img(logo), official, lang]
        rows = []
        for b in s.get("cards") or []:
            cid = b["id"]
            c = load(root / "cards" / sid / (safe_name(cid) + ".json"))
            if c is None:
                stats["noDetail"] += 1
                c = b
            local = c.get("localId") or b.get("localId") or ""
            name = c.get("name") or b.get("name") or ""
            # Visuel TCGdex : celui de la carte, sinon celui d'une autre version (même dessin officiel).
            img, img_lang = c.get("image") or b.get("image"), lang
            for fb in ([] if img else fallbacks):
                if fb.lang != lang:
                    img = fb.image(cid, sid, local)
                    if img:
                        img_lang = fb.lang
                        break
            rows.append({"cid": cid, "c": c, "local": local, "name": name, "img": img, "img_lang": img_lang,
                         "en": name if lang == "en" else (en_fb.names.get(cid) if en_fb else None),
                         "dex": c.get("dexId") or [], "artist": c.get("illustrator")})
        last_resort = ptcg_for_set(sid, s, lang, rows)
        ptcg_found.update(last_resort)
        for r in rows:
            c, cid, img = r["c"], r["cid"], r["img"]
            if img and r["img_lang"] == lang:
                stats["imgOwn"] += 1
            elif img:
                stats["imgAlt"][r["img_lang"]] = stats["imgAlt"].get(r["img_lang"], 0) + 1
            elif cid in last_resort:
                img = last_resort[cid]
                stats["imgAlt"]["pokemontcg.io"] = stats["imgAlt"].get("pokemontcg.io", 0) + 1
            else:
                stats["imgNone"] += 1
            rarity = c.get("rarity") or ""
            if lang == "en":
                rarity = RARITY_FR.get(rarity.lower(), rarity)
                stats["cardsEn"] += 1
            rarities[rarity] = rarities.get(rarity, 0) + 1
            cards.append([cid, r["name"], sid, str(r["local"]), rarity, short_img(img), *prices(c, rate), ""])
        if lang == "fr":
            complete_set(sid, s, rows)

    def complete_set(sid, s, rows):
        """Cartes manquantes en français : version anglaise de TCGdex, puis pokemontcg.io (complete.py)."""
        have_n, have_ids = {norm_number(r["local"]) for r in rows}, {r["cid"] for r in rows}
        for b in en_extra(s, en_sets.get(sid)):
            c = (load(en / "cards" / sid / (safe_name(b["id"]) + ".json")) if en else None) or b
            rarity = c.get("rarity") or ""
            rarity = RARITY_FR.get(rarity.lower(), rarity)
            rarities[rarity] = rarities.get(rarity, 0) + 1
            cards.append([b["id"], c.get("name") or b.get("name") or "", sid, str(b.get("localId") or ""), rarity,
                          short_img(c.get("image") or b.get("image")), *prices(c, rate), "en"])
            have_n.add(norm_number(b.get("localId", "")))
            have_ids.add(b["id"])
            stats["cardsEnExtra"] += 1
        ps = ptcg_of.get(sid)
        if ptcg and ps and ps not in ptcg_shared:
            # Numérotation confirmée d'abord (mêmes cartes aux mêmes numéros), sinon aucun ajout.
            good = bad = 0
            for r in rows:
                card, state = ptcg.match(ps, r["local"], r["en"], r["dex"], r["artist"])
                if state is True and card is not None:
                    good += 1
                elif state is not None:
                    bad += 1
            if not (good >= 3 and good / (good + bad) >= 0.9):
                ps = None
        for x in ptcg_extra(sid, ps, ptcg.cards.get(ps) if ptcg and ps else None, have_n, have_ids, ptcg_shared):
            rarity = RARITY_FR.get(x["rarity"].lower(), x["rarity"])
            rarities[rarity] = rarities.get(rarity, 0) + 1
            cards.append([x["id"], x["name"], sid, x["local"], rarity, x["img"], *ptcg_prices(x["card"], rate), "en"])
            stats["cardsPtcg"] += 1

    for sid, s in fr_sets.items():
        add_set(sid, s, "fr", src)
    for sid in en_only:
        add_set(sid, en_sets[sid], "en", en)
    stats["cards"] = len(cards)
    if ptcg_report:
        print("pokemontcg.io, par extension :", " · ".join(ptcg_report))
    # Correspondances validées : gardées pour les jours où le dépôt pokemontcg.io ne répond pas.
    if ptcg and ptcg_found:
        PTCG_CACHE.write_text(json.dumps(dict(sorted(ptcg_found.items())), ensure_ascii=False, indent=0) + "\n", "utf-8")
    # Si l'hébergeur d'images ne répond plus, ces visuels sont retirés (les cartes redeviennent « à venir »).
    if ptcg_found and not args.no_probe and not ptcg_alive(next(iter(ptcg_found.values()))):
        print(f"Images pokemontcg.io indisponibles : {len(ptcg_found)} visuels retirés.")
        for c in cards:
            if c[5].startswith("ptcg:"):
                c[5] = ""
        stats["imgNone"] += stats["imgAlt"].pop("pokemontcg.io", 0)

    if len(cards) < args.min_cards:
        sys.exit(f"Seulement {len(cards)} cartes : index non écrit (minimum {args.min_cards}).")

    # Extensions les plus récentes d'abord ; dans une extension, numéros dans l'ordre (tri stable).
    cards.sort(key=lambda c: natural(c[3]))
    cards.sort(key=lambda c: (sets[c[2]][2], c[2]), reverse=True)

    doc = {
        "v": 2,
        "generated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "source": "TCGdex (api.tcgdex.net) : catalogue français, complété par les autres versions",
        "img": ASSETS,
        "usdEur": rate, "usdEurDate": rate_day, "usdEurSource": rate_src,
        "sets": sets,
        "fields": ["id", "name", "set", "num", "rarity", "img", "cm", "low", "avg30", "tcp", "upd", "avg7", "avg1", "lang"],
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
          f"({len(en_only)} extensions sans version française dans TCGdex) ; {priced} avec un prix.")
    print(f"Cartes ajoutées aux extensions françaises : {stats['cardsEnExtra']} de TCGdex en anglais, "
          f"{stats['cardsPtcg']} de pokemontcg.io.")
    print(f"Visuels : {stats['imgOwn']} dans la langue de la carte, repli {json.dumps(stats['imgAlt'])}, "
          f"{stats['imgNone']} sans visuel. {stats['noDetail']} cartes sans détail.")
    missing = {}
    for c in cards:
        if not c[5]:
            missing[c[2]] = missing.get(c[2], 0) + 1
    if missing:
        print("Sans visuel :", ", ".join(f"{k} ({v})" for k, v in sorted(missing.items(), key=lambda kv: -kv[1])[:25]))
    if en_only:
        print("Extensions en anglais :", ", ".join(f"{sid} ({en_sets[sid].get('name')})" for sid in en_only))
    print(f"Taux USD→EUR : {rate} ({rate_src}{' du ' + rate_day if rate_day else ''}).")
    print(f"Écrit : {out} ({out.stat().st_size / 1e6:.1f} Mo) en {time.time() - t0:.0f} s")
    print("Raretés :", json.dumps(doc["rarities"], ensure_ascii=False))


if __name__ == "__main__":
    main()
