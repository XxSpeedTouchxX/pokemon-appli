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
      (numéro TCGdex, identifiant Cardmarket croissant) ; sinon, aucun prix (jamais un prix au hasard). Les produits des
      cartes que TCGdex relie déjà sont mis de côté avant de compter (2026-11-11, voir match).
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
# Extensions TCGdex que Cardmarket range dans l'extension d'une autre (2026-11-11) : rapprochées avec elle, comme le 30ᵉ et
# sa Collection Classique. Destinées Occultes Coffre Étincelant (sma, 94 cartes sans prix) : Cardmarket vend ses cartes
# dans « Hidden Fates » (Charizard GX « HIF SV49 »), que TCGdex relie aux cartes de sm115.
PARENT = {"sma": "sm115"}


def fold(t):
    t = unicodedata.normalize("NFD", str(t or "")).encode("ascii", "ignore").decode().lower()
    t = t.replace("&", " and ").replace("'", "").replace("’", "")
    return re.sub(r"[^a-z0-9]+", " ", t).strip()


def star(name):
    """Noms TCGdex écrits comme Cardmarket (2026-11-01) : « Rayquaza ☆ » → « Rayquaza Gold Star », « Raichu δ » →
    « Raichu Delta Species » (Cardmarket : « Raichu δ Delta Species », δ effacé par fold)."""
    t = re.sub(r"\s*☆", " Gold Star", str(name or ""))
    return re.sub(r"\s*δ(\s+Delta Species)?", " Delta Species", t)


def gold(name):
    """Carte étoile écrite « Star » (2026-11-11, porteur : Groudon ☆ d'EX Espèces Delta sans cote) : TCGdex écrit en
    anglais « Groudon Star » (ex11-111 à 113 : Groudon, Kyogre, Metagross), Cardmarket « Groudon Gold Star ». Nom passé
    par fold ; None s'il ne finit pas par « star » ou s'il est déjà « gold star » ou « prism star ». Essayé seulement
    après le nom tel quel."""
    if name.endswith(" star") and not name.endswith((" gold star", " prism star")):
        return name[:-len(" star")] + " gold star"
    return None


def bag(name):
    """Mots d'un nom sans ordre : « delta species rainbow energy » (δ Rainbow Energy) ↔ « rainbow energy delta »."""
    return " ".join(sorted(set(name.split()) - {"species"}))


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
        self.name_of = {}
        for p in products:
            self.exp_of[p["idProduct"]] = p.get("idExpansion")
            self.name_of[p["idProduct"]] = base_name(p.get("name"))
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

    def lookup(self, name, prods, full):
        """Produits Cardmarket d'un nom (déjà passé par fold et star) : (identifiants, nom exact ?), ou (None, False).
        Ordre : mêmes lettres, espaces mis à part, toutes orthographes réunies (« M Charizard EX » et « MCharizard EX »,
        les deux chez Cardmarket pour Flashfire) ; carte étoile « … Star » → « … Gold Star » (gold) ; nom complet,
        crochets compris (« Professor's Research [Professor Magnolia] ») ; un seul nom qui commence pareil (« Palkia » ↔
        « Palkia LV.X », « Metagross δ » ↔ « Metagross ») ; mêmes mots dans un autre ordre (« δ Rainbow Energy » ↔
        « Rainbow Energy Delta »)."""
        tight = name.replace(" ", "")
        same = [n for n in prods if n.replace(" ", "") == tight]  # le nom exact compris, s'il existe
        if same:
            return sorted(i for n in same for i in prods[n]), True
        if gold(name) in prods:
            return prods[gold(name)], True
        if name in full:
            return full[name], True
        near = [n for n in prods if n.startswith(name + " ") or name.startswith(n + " ")]
        if len(near) == 1:
            return prods[near[0]], False
        words = [n for n in prods if bag(n) == bag(name)]
        if len(words) == 1:
            return prods[words[0]], True
        return None, False

    def match(self, cards, exps, trusted=None):
        """cards : [(clé, nom anglais)] dans l'ordre TCGdex ; renvoie {clé: idProduct}. Même nom : même nombre de
        cartes et de produits, appariés dans l'ordre ; sinon rien pour ce nom.
        trusted : {clé: idProduct} des cartes que TCGdex relie déjà à Cardmarket (2026-11-11). Leur produit est retiré
        des candidats de leur nom : les autres cartes du même nom se partagent ceux qui restent (Charizard GX de
        Hidden Fates 9, relié, et SV49, non relié). S'il reste plus de produits que de cartes, les produits créés après le
        dernier produit relié par TCGdex dans ces extensions (version « Oversized » de MCharizard EX, ajoutée des années
        après Flashfire) sont écartés ; le compte doit alors tomber juste."""
        trusted = trusted or {}
        prods, full = {}, {}
        for e in exps:
            for p in self.by_exp.get(e, []):
                prods.setdefault(base_name(p["name"]), []).append(p["idProduct"])
                full.setdefault(fold(p["name"]), []).append(p["idProduct"])
        mine = {i for e in exps for i in (p["idProduct"] for p in self.by_exp.get(e, []))}
        last = max((i for i in trusted.values() if i in mine), default=None)
        ours = {}
        for key, en in cards:
            if en:
                ours.setdefault(fold(star(en)), []).append(key)
        out = {}
        for name, keys in ours.items():
            ids, exact = self.lookup(name, prods, full)
            if not ids:
                continue
            if exact and len(ids) < len(keys):
                # Deux « Palkia » chez nous (30ᵉ et sa Collection Classique), « Palkia » et « Palkia LV.X » chez Cardmarket
                # (2026-11-08, porteur : « le prix du Palkia 30 ans est faux ») : les produits au nom exact d'abord, puis le
                # seul autre nom qui le prolonge, si le compte tombe juste (l'extension principale vient avant la Classique).
                near = [n for n in prods if n.startswith(name + " ")]
                if len(near) == 1 and len(ids) + len(prods[near[0]]) == len(keys):
                    out.update(zip(keys, sorted(ids) + sorted(prods[near[0]])))
                    continue
            ids = sorted(set(ids))
            known = [k for k in keys if trusted.get(k) in ids]
            if known:
                out.update((k, trusted[k]) for k in known)
                taken = {trusted[k] for k in known}
                keys, ids = [k for k in keys if k not in known], [i for i in ids if i not in taken]
            if keys and len(ids) > len(keys) and last is not None:
                early = [i for i in ids if i <= last]
                ids = early if len(early) == len(keys) else ids
            if keys and len(ids) == len(keys):
                out.update(zip(keys, ids))
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

    def group(self, idp, grp):
        """Prix d'un groupe précis (« n » normal, « h » holo) : (tendance, plus bas, moyenne 30 j, moyenne 7 j,
        moyenne 1 j) ; None sans tendance ni moyenne."""
        g = self.guide.get(idp)
        if not g:
            return None
        num = lambda v: round(float(v), 2) if isinstance(v, (int, float)) and v > 0 else None
        sfx = "-holo" if grp == "h" else ""
        out = tuple(num(g.get(k + sfx)) for k in ("trend", "low", "avg30", "avg7", "avg1"))
        return out if out[0] is not None or out[2] is not None or out[3] is not None else None

    def relink(self, idp, en):
        """Produit Cardmarket d'une carte « étoile » que TCGdex relie à un autre produit (Rayquaza ☆ relié au Rayquaza
        ordinaire, 2026-11-01) : le seul produit de la même extension qui porte son nom (« … Gold Star »). Toute autre
        carte garde le produit de TCGdex : les noms diffèrent trop souvent pour de bonnes raisons (δ, Niv., RC5…), et un
        rapprochement par le nom seul les reliait à la version ordinaire (Tortank δ 269 € → 6 €, premier passage)."""
        name = fold(star(en)) if en else ""
        name = gold(name) or name  # « Groudon Star » (TCGdex, anglais) = « Groudon Gold Star » (Cardmarket)
        have = self.name_of.get(idp)
        if "gold star" not in name or have is None or "gold star" in have:
            return idp
        same = [p["idProduct"] for p in self.by_exp.get(self.exp_of.get(idp), []) if base_name(p.get("name")) == name]
        return same[0] if len(same) == 1 else idp


def en_names(sid, opener=None):
    """Noms anglais d'une extension TCGdex absente de la liste anglaise (30ᵉ Anniversaire) : {id: nom}."""
    try:
        d = get_json(TCGDEX_EN + sid, opener)
        return {c["id"]: c.get("name") for c in d.get("cards") or []}
    except Exception as e:  # noqa: BLE001
        print(f"TCGdex anglais indisponible pour {sid} ({e}).")
        return {}
