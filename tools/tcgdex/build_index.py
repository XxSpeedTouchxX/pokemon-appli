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
    cards     [[id, nom, set_id, numéro, rareté, image, cm, low, avg30, tcp, maj, avg7, avg1, langue, cmh, cmv, q, ts], ...]
              cm    = tendance Cardmarket (€)      low = plus bas Cardmarket (€, prix demandé)
              avg30 = moyenne Cardmarket 30 jours  tcp = TCGplayer « market », converti en €
              maj   = date de mise à jour des prix Cardmarket
              avg7, avg1 = moyennes Cardmarket 7 jours et 1 jour (tendance de la collection sur l'accueil)
              cm, low et les moyennes viennent d'un même groupe de prix Cardmarket (variante, voir cmv).
              langue = « en » pour une carte ajoutée à une extension française depuis la version anglaise
              (TCGdex, sinon pokemontcg.io : complete.py), vide sinon.
              cmh   = tendance de l'autre groupe de prix : reverse (carte qui a une version reverse), normale
                      (carte holo seulement, cote tirée du groupe holo), ou holo ; null s'il manque
              cmv   = groupe de prix de cm : « n » (champs normaux) ou « h » (champs « -holo ») ; null sans cm
              ts    = 1 si tcp vient de TCGCSV (carte sans aucun prix dans TCGdex, tcgcsv.py), 0 sinon
              q     = 1 si la cote est douteuse (plus bas < 5 % de la tendance, moyenne 1 jour et tendance à plus
                      de 3 fois d'écart, carte holo seulement cotée sans le groupe holo), 0 sinon
    img       préfixe commun des adresses d'images (CDN TCGdex) : image = img + chemin.
              Le chemin commence par la langue du visuel (fr/… ou en/…) ; « ptcg:set/numéro » pour
              pokemontcg.io.
    usdEur    taux appliqué aux prix TCGplayer (BCE du jour, sinon taux de secours)
    stats     contrôle : cartes, visuels dans la langue de la carte, visuels de repli par langue, sans visuel ;
              couverture des prix : cartes avec une cote Cardmarket (cardsCm), avec un prix (cardsPriced), cote
              tirée du groupe holo (cardsHolo), cote douteuse (cardsDoubt), extensions sans aucune cote Cardmarket
              (setsNoCm : {extension: cartes}), dont celles sorties depuis moins de 90 jours (setsPriceSoon :
              « cote à venir »)

Garde-fous (2026-10-11) : comparé au catalogue publié la veille (--out), l'index n'est pas écrit si les cartes
baissent de plus de 2 %, si une extension disparaît, si les cotes Cardmarket baissent de plus de 5 %, ou si les
compléments anglais et visuels de repli chutent (cardsEn, imgAlt : avertissement à −10 %, échec à −25 % ; imgNone :
avertissement à +10 %, échec à +25 %). --force accepte un changement vérifié à la main.
    rarities  nombre de cartes par rareté (contrôle)
"""
import argparse
import json
import re
import sys
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET

from ptcg import PTCG_IMG, PtcgData, compact_image, norm_number  # visuels anglais de dernier recours (pokemontcg.io)
from complete import en_extra, numbering_confirmed, ptcg_extra, ptcg_prices  # cartes manquantes en français (version anglaise, pokemontcg.io)
import tcgcsv  # prix TCGplayer des cartes sans prix (TCGCSV, 2026-10-17)

PTCG_CACHE = Path(__file__).with_name("ptcg_images.json")

ASSETS = "https://assets.tcgdex.net/"
ECB = "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml"
FALLBACK_USD_EUR = 0.86  # taux de secours si la BCE ne répond pas
SKIP_SERIES = {"tcgp"}  # Pokémon TCG Pocket : cartes numériques, hors collection physique
FIELDS = ["id", "name", "set", "num", "rarity", "img", "cm", "low", "avg30", "tcp", "upd", "avg7", "avg1", "lang", "cmh", "cmv", "q", "ts"]
Q_MIN_TREND = 1.0  # en dessous de 1 €, l'écart entre plus bas et tendance ne dit rien : pas de « cote douteuse »
SOON_DAYS = 90  # extension récente sans cote Cardmarket : « cote à venir »
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


def doubtful(trend, low, avg1):
    """Cote douteuse : plus bas sous 5 % de la tendance, ou moyenne 1 jour à plus de 3 fois d'écart de la tendance."""
    if trend is None or trend < Q_MIN_TREND:
        return False
    return (low is not None and low < 0.05 * trend) or (avg1 is not None and (avg1 > 3 * trend or 3 * avg1 < trend))


def prices(card, rate):
    """(cm, low, avg30, tcp, maj, avg7, avg1, cmh, cmv, q) d'une carte TCGdex.
    Cardmarket donne deux groupes de prix : champs normaux (trend, low…) et champs « -holo » (trend-holo…).
    - Carte holo seulement (variants : ni normale ni reverse ; ex. Rayquaza ☆ ex8-107) : le groupe holo est le
      sien, le groupe normal est un autre produit mal rangé : cote tirée du groupe holo.
    - Carte avec une version reverse : « -holo » est le prix de la reverse ; cote du groupe normal, reverse à part (cmh).
    - Sinon : groupe normal s'il a une tendance, sinon groupe holo."""
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
    variants = card.get("variants") or {}
    has_n, has_h = num(cm.get("trend")) is not None, num(cm.get("trend-holo")) is not None
    holo_only = bool(variants.get("holo")) and not variants.get("normal") and not variants.get("reverse")
    if holo_only:
        sfx = "-holo" if has_h else ""
    else:
        sfx = "" if has_n or not has_h else "-holo"
    trend, low, avg30, avg7, avg1 = (num(cm.get(k + sfx)) for k in ("trend", "low", "avg30", "avg7", "avg1"))
    cmh = num(cm.get("trend" + ("" if sfx else "-holo")))
    cmv = None if trend is None else ("h" if sfx else "n")
    # Carte holo seulement sans groupe « -holo » : le groupe normal est alors son prix (vieilles holos), pas un doute.
    q = 1 if doubtful(trend, low, avg1) else 0
    return (trend, low, avg30, tcp, upd, avg7, avg1, cmh, cmv, q)


def row(cid, name, sid, local, rarity, img, p, lang=""):
    """Ligne du catalogue dans l'ordre de FIELDS ; p : prix au format de prices()."""
    return [cid, name, sid, local, rarity, img, *p[:7], lang, *p[7:], 0]


def ptcg_row_prices(card, rate):
    """Prix pokemontcg.io (complete.ptcg_prices) complétés au format de prices() : un seul groupe de prix."""
    p = ptcg_prices(card, rate)
    return (*p, None, None if p[0] is None else "n", 1 if doubtful(p[0], p[1], p[6]) else 0)


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


def probe_image(path):
    url = PTCG_IMG + path[len("ptcg:"):] + ".png"
    try:
        with urlopen(Request(url, method="HEAD", headers={"User-Agent": "PKM-App-index/1.0"}), timeout=20) as resp:
            if resp.status == 200 and (resp.headers.get("Content-Type") or "").startswith("image/"):
                return True
            print(f"pokemontcg.io : {url} → {resp.status} {resp.headers.get('Content-Type')}")
    except Exception as e:  # noqa: BLE001
        print(f"pokemontcg.io ne répond pas pour {url} ({e}).")
    return False


def ptcg_alive(paths, tries=3, pause=30):
    """L'hébergeur d'images de pokemontcg.io répond-il encore (vraie image, pas une page d'erreur) ?
    Vrai dès qu'une image répond ; faux après `tries` essais sur des images différentes, espacés de `pause` s."""
    paths = sorted(set(paths))
    if not paths:
        return True
    picks = []
    for p in (paths[0], paths[len(paths) // 2], paths[-1]) + tuple(paths):
        if p not in picks:
            picks.append(p)
    picks = (picks * tries)[:tries]
    for k, path in enumerate(picks):
        if k:
            time.sleep(pause)
        if probe_image(path):
            return True
    return False


def coverage(cards, sets, today=None):
    """Couverture des prix par extension (E, 2026-10-11) : extensions sans aucune cote Cardmarket, et parmi elles
    celles sorties depuis moins de SOON_DAYS jours (« cote à venir »). Aucune cote n'est inventée."""
    f = {k: i for i, k in enumerate(FIELDS)}
    total, with_cm = {}, {}
    for c in cards:
        total[c[f["set"]]] = total.get(c[f["set"]], 0) + 1
        with_cm[c[f["set"]]] = with_cm.get(c[f["set"]], 0) + (c[f["cm"]] is not None)
    no_cm = {sid: n for sid, n in total.items() if not with_cm[sid]}
    limit = ((today or datetime.now(timezone.utc).date()) - timedelta(SOON_DAYS)).isoformat()
    soon = sorted(sid for sid in no_cm if (sets.get(sid) or ["", "", ""])[2] >= limit)
    return {"cardsCm": sum(with_cm.values()),
            "cardsPriced": sum(1 for c in cards if c[f["cm"]] is not None or c[f["tcp"]] is not None),
            "cardsHolo": sum(1 for c in cards if c[f["cmv"]] == "h"),
            "cardsDoubt": sum(1 for c in cards if c[f["q"]]),
            "setsNoCm": dict(sorted(no_cm.items(), key=lambda kv: (-kv[1], kv[0]))), "setsPriceSoon": soon}


def fill_tcgcsv(cards, sets, set_en, en_names, rate, client, prev=None):
    """Cartes sans aucun prix (ni Cardmarket ni TCGplayer via TCGdex) : prix TCGplayer « market » de TCGCSV, en euros,
    marqué ts = 1. Si TCGCSV ne répond pas pour une extension, le prix TCGCSV de la veille est gardé.
    Retourne (cartes complétées, rapport par extension, échecs de téléchargement)."""
    f = {k: i for i, k in enumerate(FIELDS)}
    need = {}
    for c in cards:
        if all(c[f[k]] is None for k in ("cm", "avg30", "avg7", "tcp")):
            need.setdefault(c[f["set"]], []).append(c)
    if not need:
        return 0, [], []
    groups = client.groups()
    cache, n, report = {}, 0, []
    for sid, rows in sorted(need.items()):
        s = sets.get(sid) or [sid, "", "", "", "", "fr"]
        english = s[5] == "en"  # extension sans version française : noms déjà en anglais
        gids = tcgcsv.groups_for(sid, set_en.get(sid) or (s[0] if english else None), groups)
        idx = {}
        for g in gids:
            if g not in cache:
                cache[g] = client.group_index(g)
            if cache[g]:
                idx[g] = cache[g]
        got = 0
        for c in rows:
            en = en_names.get(c[f["id"]]) or (c[f["name"]] if english or c[f["lang"]] == "en" else None)
            usd = tcgcsv.price_for(sid, c[f["num"]], en, idx) if idx else None
            if usd:
                c[f["tcp"]], c[f["ts"]] = round(usd * rate, 2), 1
                got += 1
        n += got
        if gids:
            report.append(f"{sid} {got}/{len(rows)}")
    # Repli : prix TCGCSV de la veille pour les cartes restées sans prix (TCGCSV absent ou en panne ce jour-là).
    if prev and prev.get("cards") and "ts" in (prev.get("fields") or []):
        pf = {k: i for i, k in enumerate(prev["fields"])}
        old = {c[pf["id"]]: c[pf["tcp"]] for c in prev["cards"] if c[pf["ts"]] == 1 and c[pf["tcp"]] is not None}
        kept = 0
        for rows in need.values():
            for c in rows:
                if c[f["ts"]] != 1 and c[f["id"]] in old:
                    c[f["tcp"]], c[f["ts"]] = old[c[f["id"]]], 1
                    kept += 1
        if kept:
            report.append(f"repris de la veille {kept}")
            n += kept
    return n, report, client.failures


def compare_catalog(prev, doc):
    """Anomalies du nouveau catalogue face à celui de la veille : (erreurs, avertissements)."""
    errors, warnings = [], []
    if not prev or not prev.get("cards"):
        return errors, warnings
    pf = {k: i for i, k in enumerate(prev["fields"])}
    nf = {k: i for i, k in enumerate(doc["fields"])}
    n0, n1 = len(prev["cards"]), len(doc["cards"])
    if n1 < n0 * 0.98:
        errors.append(f"{n1} cartes contre {n0} la veille (moins de 98 %)")
    gone = sorted(set(prev.get("sets") or {}) - set(doc.get("sets") or {}))
    if gone:
        errors.append(f"extensions disparues depuis la veille : {', '.join(gone)}")
    cm0 = sum(1 for c in prev["cards"] if c[pf["cm"]] is not None)
    cm1 = sum(1 for c in doc["cards"] if c[nf["cm"]] is not None)
    if cm1 < cm0 * 0.95:
        errors.append(f"{cm1} cartes avec une cote Cardmarket contre {cm0} la veille (moins de 95 %)")
    s0, s1 = prev.get("stats") or {}, doc.get("stats") or {}

    def drop(label, a, b):
        if a and b < a * 0.75:
            errors.append(f"{label} : {b} contre {a} la veille (−{1 - b / a:.0%})")
        elif a and b < a * 0.9:
            warnings.append(f"{label} : {b} contre {a} la veille (−{1 - b / a:.0%})")

    drop("cartes en anglais (cardsEn)", s0.get("cardsEn", 0), s1.get("cardsEn", 0))
    drop("visuels de repli (imgAlt)", sum((s0.get("imgAlt") or {}).values()), sum((s1.get("imgAlt") or {}).values()))
    a, b = s0.get("imgNone", 0), s1.get("imgNone", 0)
    if b > a * 1.25 + 50:
        errors.append(f"cartes sans visuel (imgNone) : {b} contre {a} la veille")
    elif b > a * 1.1 + 20:
        warnings.append(f"cartes sans visuel (imgNone) : {b} contre {a} la veille")
    return errors, warnings


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
    p.add_argument("--previous", default=None, help="catalogue de la veille à comparer (par défaut : --out avant écriture)")
    p.add_argument("--force", action="store_true", help="écrit l'index malgré une baisse face à la veille (vérifiée à la main)")
    p.add_argument("--tcgcsv", action="store_true", help="complète les cartes sans prix avec TCGplayer via TCGCSV (réseau)")
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
            cards.append(row(cid, r["name"], sid, str(r["local"]), rarity, short_img(img), prices(c, rate)))
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
            cards.append(row(b["id"], c.get("name") or b.get("name") or "", sid, str(b.get("localId") or ""), rarity,
                             short_img(c.get("image") or b.get("image")), prices(c, rate), "en"))
            have_n.add(norm_number(b.get("localId", "")))
            have_ids.add(b["id"])
            stats["cardsEnExtra"] += 1
        ps = ptcg_of.get(sid)
        # Numérotation confirmée d'abord (mêmes cartes aux mêmes numéros), sinon aucun ajout.
        if ptcg and ps and ps not in ptcg_shared and not numbering_confirmed(lambda *a: ptcg.match(ps, *a), rows):
            ps = None
        for x in ptcg_extra(sid, ps, ptcg.cards.get(ps) if ptcg and ps else None, have_n, have_ids, ptcg_shared):
            rarity = RARITY_FR.get(x["rarity"].lower(), x["rarity"])
            rarities[rarity] = rarities.get(rarity, 0) + 1
            cards.append(row(x["id"], x["name"], sid, x["local"], rarity, x["img"], ptcg_row_prices(x["card"], rate), "en"))
            stats["cardsPtcg"] += 1

    for sid, s in fr_sets.items():
        add_set(sid, s, "fr", src)
    for sid in en_only:
        add_set(sid, en_sets[sid], "en", en)
    stats["cards"] = len(cards)
    if args.tcgcsv:
        en_names = dict(en_fb.names) if en_fb else {}
        set_en = {sid: (en_sets.get(sid) or {}).get("name") for sid in sets}
        n_tc, report, fails = fill_tcgcsv(cards, sets, set_en, en_names, rate, tcgcsv.Client(),
                                          load(Path(args.previous) if args.previous else out))
        stats["cardsTcgcsv"] = n_tc
        print(f"TCGCSV : {n_tc} cartes sans prix complétées · " + " · ".join(report))
        for x in fails[:20]:
            print(f"TCGCSV ne répond pas : {x}")
    stats.update(coverage(cards, sets))
    if ptcg_report:
        print("pokemontcg.io, par extension :", " · ".join(ptcg_report))
    # Correspondances validées : gardées pour les jours où le dépôt pokemontcg.io ne répond pas.
    if ptcg and ptcg_found:
        PTCG_CACHE.write_text(json.dumps(dict(sorted(ptcg_found.items())), ensure_ascii=False, indent=0) + "\n", "utf-8")
    # Si l'hébergeur d'images ne répond plus, ces visuels sont retirés (les cartes redeviennent « à venir »).
    if ptcg_found and not args.no_probe and not ptcg_alive(ptcg_found.values()):
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
        "fields": FIELDS,
        "stats": stats,
        "rarities": dict(sorted(rarities.items(), key=lambda kv: -kv[1])),
        "cards": cards,
    }
    errors, warnings = compare_catalog(load(Path(args.previous) if args.previous else out), doc)
    for w in warnings:
        print(f"::warning::Catalogue TCGdex : {w}")
    if errors:
        for e in errors:
            print(f"::error::Catalogue TCGdex : {e}")
        if not args.force:
            sys.exit(f"Index non écrit : {len(errors)} anomalie(s) face au catalogue de la veille (--force après vérification).")
    out.parent.mkdir(parents=True, exist_ok=True)
    tmp = out.with_suffix(".tmp")
    # Une carte par ligne : le fichier reste lisible et l'historique git (archive des prix) reste léger.
    dump = lambda o: json.dumps(o, ensure_ascii=False, separators=(",", ":"))
    head = {k: v for k, v in doc.items() if k != "cards"}
    text = dump(head)[:-1] + ',\n"cards":[\n' + ",\n".join(dump(c) for c in cards) + "\n]}\n"
    tmp.write_text(text, "utf-8")
    tmp.replace(out)

    print(f"{len(cards)} cartes dans {len(sets)} extensions, dont {stats['cardsEn']} cartes en anglais "
          f"({len(en_only)} extensions sans version française dans TCGdex) ; {stats['cardsPriced']} avec un prix, "
          f"{stats['cardsCm']} avec une cote Cardmarket ({stats['cardsHolo']} tirées du groupe holo, {stats['cardsDoubt']} douteuses).")
    if stats["setsNoCm"]:
        print("Extensions sans cote Cardmarket :", ", ".join(f"{k} ({v})" for k, v in stats["setsNoCm"].items()),
              f"· cote à venir : {', '.join(stats['setsPriceSoon']) or 'aucune'}")
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
