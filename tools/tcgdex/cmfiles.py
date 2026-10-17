"""
cmfiles.py : prix Cardmarket des cartes que TCGdex ne relie pas à Cardmarket, d'après les fichiers publics de
Cardmarket (liste des produits « singles » et guide des prix, publiés chaque jour ; déjà utilisés pour le scellé).
Décision du porteur du 2026-10-18 : la cote ne vient plus que de Cardmarket (et des ventes réussies eBay quand un
accès officiel existera) ; TCGplayer et TCGCSV ne sont plus utilisés.

Rapprochement d'une carte TCGdex avec un produit Cardmarket :
    - extension Cardmarket : table EXPANSIONS, sinon celle de la majorité des cartes de la même extension que TCGdex
      relie déjà à Cardmarket (idProduct) ;
    - même nom anglais (Cardmarket : « Charizard [Energy Burn | Fire Spin] » → « charizard ») ;
    - plusieurs cartes du même nom (30 Pikachu, 3 Mewtwo-ex…) : autant de produits que de cartes, dans le même ordre
      (numéro TCGdex, identifiant Cardmarket croissant) ; sinon, aucun prix (jamais un prix au hasard).
Mesuré le 2026-10-18 (reconnaissance tools/cardmarket/recon_singles.py) : l'extension 6601 contient les 191 cartes du
30ᵉ Anniversaire et de sa Collection Classique, dans l'ordre de TCGdex (Dracaufeu 4/102 : tendance 173,99 €).

Aucune dépendance externe (Python 3.9+). Tests : test_cmfiles.py.
"""
import gzip
import json
import re
import unicodedata
from collections import Counter
from urllib.request import Request, urlopen

CM = "https://downloads.s3.cardmarket.com/productCatalog/"
TCGDEX_EN = "https://api.tcgdex.net/v2/en/sets/"
UA = {"User-Agent": "PKM-App-index/1.0 (catalogue Dropicards)", "Accept-Encoding": "gzip"}
# Extensions TCGdex sans aucune carte reliée à Cardmarket par TCGdex : extension Cardmarket vérifiée à la main.
EXPANSIONS = {"30th": [6601], "30th-c": [6601]}


def fold(t):
    t = unicodedata.normalize("NFD", str(t or "")).encode("ascii", "ignore").decode().lower()
    t = t.replace("&", " and ").replace("'", "").replace("’", "")
    return re.sub(r"[^a-z0-9]+", " ", t).strip()


def base_name(name):
    """Nom Cardmarket sans les attaques : « Charizard [Energy Burn | Fire Spin] » → « charizard »."""
    return fold(str(name or "").split(" [")[0])


def get_json(url, opener=None):
    if opener:
        return json.loads(opener(url))
    with urlopen(Request(url, headers=UA), timeout=120) as r:
        data = r.read()
        if r.headers.get("Content-Encoding") == "gzip":
            data = gzip.decompress(data)
    return json.loads(data)


class CmFiles:
    """Produits « singles » et guide des prix Cardmarket."""

    def __init__(self, products, guides, created=None):
        self.created = created
        self.exp_of, self.by_exp = {}, {}
        for p in products:
            self.exp_of[p["idProduct"]] = p.get("idExpansion")
            self.by_exp.setdefault(p.get("idExpansion"), []).append(p)
        for lst in self.by_exp.values():
            lst.sort(key=lambda p: p["idProduct"])
        self.guide = {g["idProduct"]: g for g in guides}

    @classmethod
    def download(cls, opener=None):
        singles = get_json(CM + "productList/products_singles_6.json", opener)
        prices = get_json(CM + "priceGuide/price_guide_6.json", opener)
        return cls(singles.get("products") or [], prices.get("priceGuides") or [], str(prices.get("createdAt") or "")[:10] or None)

    def expansions_for(self, sid, known_ids, names=None):
        """Extension(s) Cardmarket d'une extension TCGdex : table, sinon majorité des produits déjà reliés par TCGdex,
        sinon (aucune carte reliée : Gym Heroes, promos, kits…) l'extension Cardmarket dont les noms recouvrent ceux de
        l'extension (au moins 80 % des noms, taille à ±25 %), seulement si une seule extension remplit ces conditions."""
        if sid in EXPANSIONS:
            return EXPANSIONS[sid]
        exps = Counter(self.exp_of[i] for i in known_ids if i in self.exp_of)
        if exps:
            exp, n = exps.most_common(1)[0]
            return [exp] if n >= 3 and n >= 0.6 * sum(exps.values()) else []
        ours = [fold(x) for x in (names or []) if x]
        if len(ours) < 5:
            return []
        want, good = set(ours), []
        for exp, prods in self.by_exp.items():
            if not 0.75 * len(ours) <= len(prods) <= 1.25 * len(ours):
                continue
            have = {base_name(p["name"]) for p in prods}
            share = sum(1 for x in ours if x in have) / len(ours)
            if share >= 0.8 and len(want & have) >= 0.8 * len(want):
                good.append((share, exp))
        return [good[0][1]] if len(good) == 1 else []

    def match(self, cards, exps):
        """cards : [(clé, nom anglais)] dans l'ordre TCGdex ; renvoie {clé: idProduct}. Même nom : même nombre de
        cartes et de produits, appariés dans l'ordre ; sinon rien pour ce nom."""
        prods = {}
        for e in exps:
            for p in self.by_exp.get(e, []):
                prods.setdefault(base_name(p["name"]), []).append(p["idProduct"])
        ours = {}
        for key, en in cards:
            if en:
                ours.setdefault(fold(en), []).append(key)
        out = {}
        for name, keys in ours.items():
            ids = prods.get(name)
            if not ids:
                # « Palkia » ↔ « Palkia LV.X », « Metagross δ » ↔ « Metagross » : un seul candidat qui commence pareil.
                near = [n for n in prods if n.startswith(name + " ") or name.startswith(n + " ")]
                ids = prods[near[0]] if len(near) == 1 else None
            if ids and len(ids) == len(keys):
                out.update(zip(keys, sorted(ids)))
        return out

    def prices(self, idp):
        """Prix Cardmarket d'un produit : (tendance, plus bas, moyenne 30 j, moyenne 7 j, moyenne 1 j, autre version,
        groupe « n » ou « h ») ; groupe normal s'il a une tendance, sinon le groupe holo. None sans aucun prix."""
        g = self.guide.get(idp)
        if not g:
            return None
        num = lambda v: round(float(v), 2) if isinstance(v, (int, float)) and v > 0 else None
        sfx = "" if num(g.get("trend")) is not None or num(g.get("avg30")) is not None else "-holo"
        trend, low, avg30, avg7, avg1 = (num(g.get(k + sfx)) for k in ("trend", "low", "avg30", "avg7", "avg1"))
        if trend is None and avg30 is None and avg7 is None:
            return None
        other = num(g.get("trend" + ("" if sfx else "-holo")))
        return trend, low, avg30, avg7, avg1, other, "h" if sfx else "n"


def en_names(sid, opener=None):
    """Noms anglais d'une extension TCGdex absente de la liste anglaise (30ᵉ Anniversaire) : {id: nom}."""
    try:
        d = get_json(TCGDEX_EN + sid, opener)
        return {c["id"]: c.get("name") for c in d.get("cards") or []}
    except Exception as e:  # noqa: BLE001
        print(f"TCGdex anglais indisponible pour {sid} ({e}).")
        return {}
