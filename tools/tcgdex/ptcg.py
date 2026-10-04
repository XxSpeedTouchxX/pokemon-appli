"""
ptcg.py : visuels anglais haute définition de pokemontcg.io, pour les cartes que TCGdex n'illustre pas.

Source : le dépôt public PokemonTCG/pokemon-tcg-data (données de l'API pokemontcg.io, dépréciée,
arrêt prévu le 1er mars 2027). Les images sont servies par images.pokemontcg.io (734 × 1024) ou, pour
les extensions récentes, par le CDN Scrydex.

Correspondance d'une extension TCGdex vers pokemontcg.io, dans l'ordre :
  1. table de correspondance (identifiants qui ne se déduisent pas) ;
  2. identifiant transformé : sv03 → sv3, sm7.5 → sm75, swsh12.5gg → swsh12pt5gg, me02.5 → me2pt5 ;
  3. même nom anglais (et, à défaut d'unicité, même date de sortie).
Correspondance d'une carte : même numéro normalisé (SV001 = SV1), et même nom anglais quand on le connaît.
"""
import json
import re
import unicodedata
from pathlib import Path
from urllib.parse import unquote

PTCG_IMG = "https://images.pokemontcg.io/"
SCX_IMG = "https://images.scrydex.com/pokemon/"

# Identifiants TCGdex qui ne se déduisent pas de ceux de pokemontcg.io.
SET_TABLE = {
    "30th": "me55", "30th-c": "me55c", "cel25cc": "cel25c", "hgssp": "hsp",
    "sv10.5b": "zsv10pt5", "sv10.5w": "rsv10pt5",
    "2011bw": "mcd11", "2012bw": "mcd12", "2014xy": "mcd14", "2015xy": "mcd15", "2016xy": "mcd16",
    "2017sm": "mcd17", "2018sm": "mcd18", "2019sm": "mcd19", "2021swsh": "mcd21", "2022swsh": "mcd22",
    "fut2020": "fut20", "bog": "bp", "exu": "ex10",
    "tk-ex-latia": "tk1a", "tk-ex-latio": "tk1b", "tk-ex-p": "tk2a", "tk-ex-m": "tk2b",
}


def fold(text):
    """Nom comparable : sans accents, casse ni ponctuation."""
    t = unicodedata.normalize("NFD", str(text or ""))
    t = "".join(ch for ch in t if unicodedata.category(ch) != "Mn")  # accents
    t = re.sub(r"[\W_]+", " ", t.lower())  # toute ponctuation, y compris ’ et « »
    return t.encode("ascii", "ignore").decode().strip()


def norm_number(n):
    """Numéro comparable : SV001 = SV1, TG01 = TG1, 001 = 1."""
    return re.sub(r"(^|\D)0+(?=\d)", r"\1", unquote(str(n))).upper()


def candidates(sid):
    """Identifiants pokemontcg.io possibles pour une extension TCGdex."""
    out = [SET_TABLE[sid]] if sid in SET_TABLE else []
    short = re.sub(r"^([a-z]+)0(\d)", r"\1\2", sid)  # sv03 → sv3, me02.5 → me2.5
    for base in (sid, short):
        out += [base, base.replace(".5", "pt5"), base.replace(".", "")]
    seen, res = set(), []
    for c in out:
        if c not in seen:
            seen.add(c)
            res.append(c)
    return res


def compact_image(images):
    """Adresse courte d'une image (préfixe ptcg: ou scx:), ou None si le format est inattendu."""
    small, large = (images or {}).get("small") or "", (images or {}).get("large") or ""
    if small.startswith(PTCG_IMG) and small.endswith(".png") and large == small[:-4] + "_hires.png":
        return "ptcg:" + small[len(PTCG_IMG):-4]
    m = re.match(re.escape(SCX_IMG) + r"([^/]+)/small$", small)
    if m and large == SCX_IMG + m.group(1) + "/large":
        return "scx:" + m.group(1)
    return None


def same_name(a, b):
    """Même carte ? Noms anglais égaux, ou l'un commence par l'autre (« Pikachu V » / « Pikachu V (…) »)."""
    fa, fb = fold(a), fold(b)
    return bool(fa and fb) and (fa == fb or fa.startswith(fb + " ") or fb.startswith(fa + " "))


class PtcgData:
    def __init__(self, root):
        root = Path(root)
        self.sets = {}
        self.cards = {}  # set_id → {numéro normalisé: carte}
        sets_file = root / "sets" / "en.json"
        if not sets_file.exists():
            return
        for s in json.loads(sets_file.read_text("utf-8")):
            self.sets[s["id"]] = s
            cf = root / "cards" / "en" / (s["id"] + ".json")
            if cf.exists():
                self.cards[s["id"]] = {norm_number(c.get("number", "")): c for c in json.loads(cf.read_text("utf-8"))}
        self.by_name = {}
        for s in self.sets.values():
            self.by_name.setdefault(fold(s.get("name")), []).append(s)

    def __bool__(self):
        return bool(self.sets)

    def map_set(self, sid, en_name=None, date=None):
        """Extension pokemontcg.io d'une extension TCGdex, ou None."""
        for c in candidates(sid):
            if c in self.cards:
                return c
        same = self.by_name.get(fold(en_name)) if en_name else None
        if same:
            if len(same) == 1:
                return same[0]["id"]
            day = (date or "").replace("-", "/")
            dated = [s for s in same if s.get("releaseDate") == day]
            if len(dated) == 1:
                return dated[0]["id"]
        return None

    def image(self, ptcg_set, number, en_name=None):
        """Image compacte de la carte, ou None. Si le nom anglais est connu, il doit correspondre ;
        quand la numérotation diffère (Collection Classique…), la carte est cherchée par son nom, si
        ce nom est unique dans l'extension."""
        cards = self.cards.get(ptcg_set) or {}
        card = cards.get(norm_number(number))
        if card and en_name and not same_name(en_name, card.get("name")):
            card = None
        if not card and en_name:
            same = [c for c in cards.values() if same_name(en_name, c.get("name"))]
            card = same[0] if len(same) == 1 else None
        return compact_image(card.get("images")) if card else None
