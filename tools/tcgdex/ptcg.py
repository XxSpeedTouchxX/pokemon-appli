"""
ptcg.py : visuels anglais haute définition de pokemontcg.io, pour les cartes que TCGdex n'illustre dans
aucune langue.

Source : le dépôt public PokemonTCG/pokemon-tcg-data (données de l'API pokemontcg.io, dépréciée, arrêt prévu
le 1er mars 2027). Seules les images servies par images.pokemontcg.io sont retenues (petit visuel 245 × 342,
grand 734 × 1024) ; celles du CDN commercial Scrydex sont laissées de côté.

Correspondance d'une extension TCGdex vers pokemontcg.io, dans l'ordre :
  1. table de correspondance (identifiants qui ne se déduisent pas) ;
  2. identifiant transformé : sv03 → sv3, sm7.5 → sm75, swsh12.5gg → swsh12pt5gg, me02.5 → me2pt5 ;
  3. même nom anglais (et, à défaut d'unicité, même date de sortie).

Correspondance d'une carte : même numéro normalisé (SV001 = SV1), puis contrôle avec ce qu'on connaît de
la carte : son nom anglais, sinon ses numéros de Pokédex et son illustrateur (identiques dans toutes les
langues). Quand la numérotation diffère (Collection Classique…), la carte est cherchée dans l'extension
par ces mêmes critères, si une seule carte y répond. Le contrôle d'ensemble d'une extension (taux d'accord)
est fait par build_index.py.
"""
import json
import re
import unicodedata
from pathlib import Path
from urllib.parse import unquote

PTCG_IMG = "https://images.pokemontcg.io/"

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
    """Texte comparable : sans accents, casse ni ponctuation (y compris ’ et « »)."""
    t = unicodedata.normalize("NFD", str(text or ""))
    t = "".join(ch for ch in t if unicodedata.category(ch) != "Mn")
    t = re.sub(r"[\W_]+", " ", t.lower())
    return t.encode("ascii", "ignore").decode().strip()


def norm_number(n):
    """Numéro comparable : SV001 = SV1, TG01 = TG1, 001 = 1, %3F = ?."""
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
    """Adresse courte « ptcg:set/numéro » d'une image pokemontcg.io, ou None (autre hébergeur, format inattendu)."""
    small, large = (images or {}).get("small") or "", (images or {}).get("large") or ""
    if small.startswith(PTCG_IMG) and small.endswith(".png") and large == small[:-4] + "_hires.png":
        return "ptcg:" + small[len(PTCG_IMG):-4]
    return None


def same_name(a, b):
    """Même nom anglais, parenthèses ignorées : « Pikachu V (Full Art) » = « Pikachu V », mais « Pikachu » ≠ « Pikachu V »."""
    strip = lambda t: fold(re.sub(r"\([^)]*\)", " ", str(t or "")))
    fa, fb = strip(a), strip(b)
    return bool(fa) and fa == fb


def agrees(card, en_name=None, dex=None, artist=None):
    """La carte pokemontcg.io correspond-elle ? True, False, ou None si rien ne permet de le vérifier."""
    if en_name:
        return same_name(en_name, card.get("name"))
    checks = []
    if dex and card.get("nationalPokedexNumbers"):
        checks.append(bool(set(dex) & set(card["nationalPokedexNumbers"])))
    if artist and card.get("artist"):
        checks.append(fold(artist) == fold(card["artist"]))
    return all(checks) if checks else None


class PtcgData:
    def __init__(self, root):
        root = Path(root)
        self.sets, self.cards, self.by_num = {}, {}, {}
        sets_file = root / "sets" / "en.json"
        if not sets_file.exists():
            return
        for s in json.loads(sets_file.read_text("utf-8")):
            self.sets[s["id"]] = s
            cf = root / "cards" / "en" / (s["id"] + ".json")
            if cf.exists():
                cards = json.loads(cf.read_text("utf-8"))
                self.cards[s["id"]] = cards
                by_num = self.by_num[s["id"]] = {}
                for c in cards:  # plusieurs cartes peuvent partager un numéro (Collection Classique)
                    by_num.setdefault(norm_number(c.get("number", "")), []).append(c)
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

    def match(self, ptcg_set, number, en_name=None, dex=None, artist=None):
        """Carte pokemontcg.io correspondante et état du contrôle : (carte, True) vérifiée,
        (carte, None) même numéro mais rien pour vérifier, (None, False) écartée, (None, None) introuvable."""
        cards = self.cards.get(ptcg_set) or []
        same_num = self.by_num.get(ptcg_set, {}).get(norm_number(number), [])
        verdicts = [(c, agrees(c, en_name, dex, artist)) for c in same_num]
        ok = [c for c, v in verdicts if v]
        if len(ok) == 1:
            return ok[0], True
        if len(same_num) == 1 and verdicts[0][1] is None:
            return same_num[0], None
        if en_name or dex or artist:
            found = [c for c in cards if agrees(c, en_name, dex, artist)]
            if len(found) == 1:
                return found[0], True
        return None, (False if same_num else None)
