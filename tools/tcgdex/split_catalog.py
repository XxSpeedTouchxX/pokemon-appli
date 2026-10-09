"""Découpe web/data/cards.json en deux fichiers pour la démo web (A5, 2026-10-09).

- cards-base.json : ce qui change rarement (extensions, raretés, nom, numéro, rareté et visuel de chaque carte).
  D'un jour à l'autre il reste identique : le navigateur garde sa copie (réponse « non modifié »).
- cards-prices.json : ce qui change chaque jour (prix de chaque carte, date, taux USD→EUR, statistiques).

Les deux fichiers portent la même empreinte (« key » / « base ») : la démo ne les assemble que s'ils vont
ensemble, sinon elle charge cards.json, qui reste publié tel quel (et sert d'archive quotidienne des prix).

    python3 tools/tcgdex/split_catalog.py --src web/data/cards.json
"""
import argparse
import hashlib
import json
from pathlib import Path

PRICE_FIELDS = ["cm", "low", "avg30", "tcp", "upd", "avg7", "avg1"]
DAILY_KEYS = ["generated", "usdEur", "usdEurDate", "usdEurSource", "stats"]


def dump(o):
    return json.dumps(o, ensure_ascii=False, separators=(",", ":"))


def split(doc):
    fields = doc["fields"]
    s_idx = [i for i, f in enumerate(fields) if f not in PRICE_FIELDS]
    p_idx = [fields.index(f) for f in PRICE_FIELDS if f in fields]
    base = {k: v for k, v in doc.items() if k not in DAILY_KEYS and k not in ("fields", "cards")}
    base["fields"] = [fields[i] for i in s_idx]
    base["cards"] = [[c[i] for i in s_idx] for c in doc["cards"]]
    key = hashlib.sha1(dump(base).encode("utf-8")).hexdigest()[:16]
    base = dict({"key": key}, **base)
    prices = {k: doc[k] for k in DAILY_KEYS if k in doc}
    prices.update({"base": key, "order": fields, "fields": [fields[i] for i in p_idx], "n": len(doc["cards"]),
                   "prices": [[c[i] for i in p_idx] for c in doc["cards"]]})
    return base, prices


def join(base, prices):
    """Inverse de split (même logique que la démo web) ; None si les fichiers ne vont pas ensemble."""
    if base.get("key") != prices.get("base") or len(base["cards"]) != prices.get("n"):
        return None
    sf, pf = base["fields"], prices["fields"]
    pick = [("s", sf.index(f)) if f in sf else ("p", pf.index(f)) for f in prices["order"]]
    doc = {k: v for k, v in base.items() if k not in ("key", "fields", "cards")}
    doc.update({k: prices[k] for k in DAILY_KEYS if k in prices})
    doc["fields"] = prices["order"]
    doc["cards"] = [[(b if w == "s" else p)[i] for w, i in pick] for b, p in zip(base["cards"], prices["prices"])]
    return doc


def write(path, obj, rows_key):
    # Une carte par ligne, comme cards.json.
    head = {k: v for k, v in obj.items() if k != rows_key}
    text = dump(head)[:-1] + ',\n"' + rows_key + '":[\n' + ",\n".join(dump(r) for r in obj[rows_key]) + "\n]}\n"
    tmp = path.with_suffix(".tmp")
    tmp.write_text(text, "utf-8")
    tmp.replace(path)


def main():
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    p.add_argument("--src", default="web/data/cards.json")
    a = p.parse_args()
    src = Path(a.src)
    doc = json.loads(src.read_text("utf-8"))
    base, prices = split(doc)
    back = join(base, prices)
    if back is None or back["cards"] != doc["cards"] or back["fields"] != doc["fields"]:
        raise SystemExit("Découpage incohérent : cards.json n'est pas reconstitué à l'identique")
    write(src.with_name("cards-base.json"), base, "cards")
    write(src.with_name("cards-prices.json"), prices, "prices")
    print(f"Catalogue découpé : {len(base['cards'])} cartes, empreinte {base['key']}")


if __name__ == "__main__":
    main()
