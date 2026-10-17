"""
tcgcsv.py : prix TCGplayer (« market », calculé sur les ventes conclues) des cartes encore sans prix dans TCGdex,
d'après TCGCSV (tcgcsv.com), qui publie chaque jour en fichiers JSON les données de l'API TCGplayer. Aucun
téléchargement de page web : deux fichiers par extension (produits, prix). Décision du porteur du 2026-10-17.

Seules les cartes sans aucun prix (ni Cardmarket, ni TCGplayer via TCGdex) sont complétées : 30ᵉ Anniversaire et sa
Collection Classique, promos, kits du dresseur… Le prix est converti en euros (taux BCE du jour) et marqué « tcgcsv »
(champ ts du catalogue) : la démo l'affiche « TCGplayer via TCGCSV, à confirmer ».

Rapprochement d'une carte TCGdex avec un produit TCGplayer :
    - extension → groupe(s) TCGplayer : table GROUPS, sinon même nom anglais (préfixes « SV10: », « SM - »… retirés) ;
    - même numéro imprimé (« 021/128 » → 21 ; « TG05 », « SWSH045 » gardent leurs lettres) ;
    - plusieurs produits au même numéro : le nom anglais départage ; sinon, aucun prix (pas de prix au hasard) ;
    - Collection Classique du 30ᵉ : numéro de la carte d'origine (« 4/102 »), voir CLASSIC_30_NUM.
Version : prix « market » de la version holo, sinon normale, sinon les autres ; la reverse en dernier.

Aucune dépendance externe (Python 3.9+). Tests : test_tcgcsv.py.
"""
import json
import re
import time
import unicodedata
from urllib.request import Request, urlopen

BASE = "https://tcgcsv.com/tcgplayer/3/"  # catégorie 3 : Pokémon
UA = {"User-Agent": "PKM-App-index/1.0 (catalogue Dropicards)"}

# Extensions TCGdex dont le nom anglais ne suffit pas à trouver le groupe TCGplayer.
GROUPS = {
    "30th": [24722], "30th-c": [24837], "mee": [24461], "mep": [24451], "sv03.5": [23237], "sve": [24382],
    "svp": [22872], "swshp": [2545], "smp": [1861], "xyp": [1451], "bwp": [1407], "hgssp": [1453], "dpp": [1421],
    "np": [1423], "basep": [1418], "sma": [2594], "swsh4.5sv": [2781], "sm1": [1863], "xy0": [1522],
    "cel25cc": [2931], "g1": [1728, 1729], "bw11": [1409, 1465], "ecard1": [1375], "ru1": [1433],
    "tk-xy-b": [1533], "tk-xy-w": [1533], "tk-xy-n": [1532], "tk-xy-sy": [1532], "tk-xy-latia": [1536],
    "tk-xy-latio": [1536], "tk-xy-p": [1796], "tk-xy-su": [1796], "tk-ex-latia": [1543], "tk-ex-latio": [1543],
    "tk-ex-p": [1542], "tk-ex-m": [1542], "tk-hs-r": [1540], "tk-hs-g": [1540], "tk-dp-l": [1541], "tk-dp-m": [1541],
    "tk-bw-e": [1538], "tk-bw-z": [1538], "tk-sm-r": [2069], "tk-sm-l": [2069],
}
# Collection Classique du 30ᵉ Anniversaire, dans l'ordre TCGdex 30th-c-001 à 030 : numéro imprimé (celui de la carte
# d'origine). Même liste que CLASSIC_30 (tools/web/catalog.js).
CLASSIC_30_NUM = ["4/102", "5/109", "11/113", "11/101", "18/132", "19/109", "25/111", "33/181", "41/122", "43/146",
                  "47/127", "50/185", "57/111", "58/102", "69/132", "85/124", "89/149", "94/102", "99/102", "100/102",
                  "101/101", "106/106", "106/160", "106/105", "108/115", "114/264", "123/172", "138/202", "149/147", "203/193"]
SUBTYPES = ["Holofoil", "Normal", "Unlimited Holofoil", "Unlimited", "1st Edition Holofoil", "1st Edition"]
PREFIX = re.compile(r"^(?:[A-Z]{1,5}\d{0,2}(?:\.\d)?|SM|XY|SV|SWSH|ME)\s*(?::|-)\s+")


def fold(t):
    t = unicodedata.normalize("NFD", str(t or "")).encode("ascii", "ignore").decode().lower().replace("&", " and ")
    return re.sub(r"[^a-z0-9]+", " ", t).strip()


def set_key(name, group=False):
    """Nom d'extension comparable : « SV10: Destined Rivals » et « Destined Rivals » → « destined rivals »."""
    n = PREFIX.sub("", str(name or "")) if group else str(name or "")
    n = fold(n)
    n = re.sub(r"^ex ", "", n) if group else n
    return re.sub(r" base set$", "", n)


def norm_num(n, whole=False):
    """Numéro comparable : « 021/128 » → « 21 » ; « TG05 » → « TG5 » ; whole : « 4/102 » → « 4/102 »."""
    s = str(n or "").upper().replace(" ", "")
    if not whole:
        s = s.split("/")[0]
    parts = [re.sub(r"^([A-Z]*)0+(?=\d)", r"\1", re.sub(r"[^A-Z0-9]", "", p)) for p in s.split("/")]
    return "/".join(parts)


def groups_for(sid, en_name, groups):
    """Groupes TCGplayer d'une extension TCGdex : table GROUPS, sinon même nom anglais."""
    if sid in GROUPS:
        return GROUPS[sid]
    key = set_key(en_name)
    return [g["groupId"] for g in groups if key and set_key(g.get("name"), True) == key] if key else []


def number_of(product):
    for x in product.get("extendedData") or []:
        if x.get("name") == "Number":
            return x.get("value")
    return None


def market(prices):
    """Prix « market » (USD) d'un produit : holo, sinon normal, sinon une autre version, la reverse en dernier."""
    by = {p.get("subTypeName"): p.get("marketPrice") for p in prices if isinstance(p.get("marketPrice"), (int, float)) and p["marketPrice"] > 0}
    for k in SUBTYPES + [k for k in by if k not in SUBTYPES and "Reverse" not in str(k)] + [k for k in by if "Reverse" in str(k)]:
        if k in by:
            return by[k]
    return None


def index(products, prices):
    """{numéro: [(nom, prix USD), …]} et {numéro complet: […]} pour les cartes d'un groupe (le scellé n'a pas de numéro)."""
    pr = {}
    for p in prices:
        pr.setdefault(p.get("productId"), []).append(p)
    short, whole = {}, {}
    for prod in products:
        n = number_of(prod)
        usd = market(pr.get(prod.get("productId"), []))
        if not n or usd is None:
            continue
        item = (prod.get("name") or "", usd)
        short.setdefault(norm_num(n), []).append(item)
        whole.setdefault(norm_num(n, True), []).append(item)
    return short, whole


def pick(cands, en_name):
    """Un seul produit à ce numéro : le sien. Plusieurs : celui dont le nom anglais correspond, s'il est unique."""
    if len(cands) == 1:
        return cands[0][1]
    want = fold(en_name)
    if not want:
        return None
    same = [c for c in cands if fold(c[0]) == want] or [c for c in cands if fold(re.sub(r"\(.*?\)", "", c[0])) == want]
    return same[0][1] if len(same) == 1 else None


def price_for(sid, local, en_name, idx):
    """Prix USD d'une carte TCGdex dans l'index de ses groupes ({groupId: (short, whole)}), ou None."""
    if sid == "30th-c":
        try:
            num = CLASSIC_30_NUM[int(local) - 1]
        except (ValueError, IndexError):
            return None
        cands = [c for short, whole in idx.values() for c in whole.get(norm_num(num, True), [])]
    else:
        cands = [c for short, whole in idx.values() for c in short.get(norm_num(local), [])]
    return pick(cands, en_name) if cands else None


class Client:
    """Téléchargement des fichiers TCGCSV (groupes, produits, prix), avec reprise. Échecs comptés, jamais bloquants."""

    def __init__(self, base=BASE, tries=3, pause=5, opener=None):
        self.base, self.tries, self.pause, self.failures = base, tries, pause, []
        self.opener = opener or (lambda url: urlopen(Request(url, headers=UA), timeout=30).read())

    def get(self, path):
        for k in range(self.tries):
            try:
                data = json.loads(self.opener(self.base + path))
                if data.get("success") is False:
                    raise ValueError("; ".join(map(str, data.get("errors") or [])) or "réponse en échec")
                return data.get("results") or []
            except Exception as e:  # noqa: BLE001
                if k == self.tries - 1:
                    self.failures.append(f"{path} : {e}")
                    return None
                time.sleep(self.pause)
        return None

    def groups(self):
        return self.get("groups") or []

    def group_index(self, gid):
        products, prices = self.get(f"{gid}/products"), self.get(f"{gid}/prices")
        return None if products is None or prices is None else index(products, prices)
