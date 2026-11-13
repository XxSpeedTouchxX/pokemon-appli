"""Tests des prix et des garde-fous de build_index.py. Lancer : python3 -m unittest discover -s tools/tcgdex -p 'test_*.py'"""
import json
import unittest
from datetime import date
from unittest import mock

import build_index
from build_index import FIELDS, art_key, compare_catalog, coverage, prices, ptcg_alive, ptcg_row_prices, reprint_images, row


def card(cm=None, tcp=None, variants=None):
    c = {"pricing": {"cardmarket": cm or {}, "tcgplayer": tcp or {}}}
    if variants is not None:
        c["variants"] = variants
    return c


def variants(normal=False, holo=False, reverse=False):
    return {"normal": normal, "holo": holo, "reverse": reverse, "firstEdition": False, "wPromo": False}


# Rayquaza ☆ (ex8-107), réponse réelle de l'API TCGdex du 2026-10-11 : carte holo seulement.
RAYQUAZA = {"updated": "2026-10-10T22:54:32.732Z", "unit": "EUR", "idProduct": 276425, "avg": 22.76, "low": 0.8,
            "trend": 32.35, "avg1": 15, "avg7": 26.5, "avg30": 19.82, "avg-holo": 118.8, "low-holo": 10,
            "trend-holo": 135.39, "avg1-holo": 220, "avg7-holo": 146.29, "avg30-holo": 95.21}


class Prices(unittest.TestCase):
    def test_normal_variant(self):
        cm = {"trend": 12.5, "low": 9, "avg30": 11, "avg7": 12, "avg1": 13.1, "updated": "2026-10-04T00:00:00",
              "trend-holo": 40, "avg30-holo": 38, "avg7-holo": 39, "avg1-holo": 41}
        self.assertEqual(prices(card(cm), 0.9), (12.5, 9, 11, None, "2026-10-04", 12, 13.1, 40, "n", 0))

    def test_holo_variant(self):
        # Pas de tendance normale : tendance et moyennes de la variante holo, jamais un mélange des deux.
        cm = {"avg30": 2, "trend-holo": 40, "low-holo": 30, "avg30-holo": 38, "avg7-holo": 39, "avg1-holo": 41}
        self.assertEqual(prices(card(cm), 0.9), (40, 30, 38, None, None, 39, 41, None, "h", 0))

    def test_holo_only_card(self):
        # Bug signalé par le porteur : Rayquaza ☆ affichait 32 € (groupe normal) au lieu de 135 € (groupe holo).
        p = prices(card(RAYQUAZA, variants=variants(holo=True)), 0.9)
        self.assertEqual(p, (135.39, 10, 95.21, None, "2026-10-10", 146.29, 220, 32.35, "h", 0))

    def test_holo_only_group_checked_with_tcgplayer(self):
        # 2026-11-01 (porteur : Dracaufeu du Set de Base absent de « Les plus chères ») : groupes à plus de 2 fois
        # d'écart, la holo illimitée TCGplayer (854,50 €) désigne le groupe normal (497,57 €), pas le groupe holo.
        cm = {"trend": 497.57, "low": 150, "avg30": 480, "avg7": 505, "avg1": 520,
              "trend-holo": 123.63, "low-holo": 60, "avg30-holo": 202.71, "avg7-holo": 129.55, "avg1-holo": 207.4}
        tcp = {"holofoil": {"marketPrice": 949.44}, "1st-edition-holofoil": {"marketPrice": 12000}}
        p = prices(card(cm, tcp, variants(holo=True)), 0.9)
        self.assertEqual((p[0], p[2], p[5], p[7], p[8]), (497.57, 480, 505, 123.63, "n"))
        self.assertEqual(p[3], 854.5)  # repère : tirage illimité avant la 1re édition
        # Repère plus proche du groupe holo (Rayquaza ☆) : groupe holo gardé.
        self.assertEqual(prices(card(RAYQUAZA, {"holofoil": {"marketPrice": 150}}, variants(holo=True)), 0.9)[8], "h")
        # Groupes à moins de 2 fois d'écart : la règle du 2026-10-11 s'applique (groupe holo).
        near = dict(cm, trend=200)
        self.assertEqual(prices(card(near, tcp, variants(holo=True)), 0.9)[8], "h")
        # Seulement un prix 1re édition chez TCGplayer : pas de repère, groupe holo.
        self.assertEqual(prices(card(cm, {"1st-edition-holofoil": {"marketPrice": 12000}}, variants(holo=True)), 0.9)[8], "h")

    def test_ex_era_ex_card_uses_normal_group(self):
        # 2026-11-13 (porteur : « Dracolosse d'Île des Dragons à 27 € sur Dropicards, vers 400 € en ventes réussies ») :
        # une carte « ex » de l'époque EX n'existe pas en reverse, sa cote est le groupe normal de Cardmarket.
        cm = {"trend": 184.72, "low": 120, "avg30": 170, "avg7": 190, "avg1": 200,
              "trend-holo": 31.89, "avg30-holo": 22.23, "avg7-holo": 27.25, "avg1-holo": 9.99}
        c = dict(card(cm, variants=variants(holo=True)), id="ex15-91", name="Dracolosse ex δ", set={"id": "ex15"})
        p = prices(c, 0.9)
        self.assertEqual((p[0], p[2], p[5], p[7], p[8]), (184.72, 170, 190, 31.89, "n"))
        self.assertIn("ex15-91 31.89→184.72", build_index.EX_SWITCHED)
        # Écart de moins de 2 fois entre les groupes (Drattak ex ex16-96 : 63,31 € en normal, 33,63 € en holo) : normal aussi.
        self.assertEqual(prices(dict(c, id="ex16-96", name="Drattak ex", set={"id": "ex16"},
                                     pricing={"cardmarket": dict(cm, trend=63.31, **{"trend-holo": 33.63})}), 0.9)[:1], (63.31,))
        # Groupe normal vide (sous 1 €) : groupe holo gardé.
        self.assertEqual(prices(dict(c, pricing={"cardmarket": dict(cm, trend=0.74)}), 0.9)[8], "h")
        # « -ex » d'Écarlate et Violet, ou carte holo d'une autre époque : règle d'origine (groupe holo).
        self.assertEqual(prices(dict(c, id="sv03.5-199", name="Dracaufeu-ex", set={"id": "sv03.5"}), 0.9)[8], "h")
        self.assertEqual(prices(dict(c, id="ex15-5", name="Milobellus δ"), 0.9)[8], "h")
        # Même avec un repère TCGplayer (Mew ex ex12-88 : 1,25 $ chez TCGplayer), la règle de l'époque EX passe avant.
        self.assertEqual(prices(dict(c, pricing={"cardmarket": cm, "tcgplayer": {"holofoil": {"marketPrice": 1.25}}}), 0.9)[8], "n")
        # Une holo d'une autre époque garde l'arbitrage TCGplayer (règle du 2026-11-01).
        self.assertEqual(prices(dict(c, id="ex15-5", name="Milobellus δ", pricing={"cardmarket": cm, "tcgplayer": {"holofoil": {"marketPrice": 30}}}), 0.9)[8], "h")

    def test_price_audit(self):
        f = {k: i for i, k in enumerate(FIELDS)}
        ok = row("a-1", "Carte sûre", "a", "1", "", "", (50, 40, 50, 55, "2026-11-13", 50, 50, 60, "n", 0))
        grp = row("ex7-99", "Rocket's Mewtwo ex", "ex7", "99", "", "", (2012, None, 130, None, "2026-11-13", 140, None, 20.5, "n", 0))
        tcp = row("b-2", "Celebi", "b", "2", "", "", (970, 500, 960, 8573, "2026-11-13", 980, 900, None, "n", 0))
        cheap = row("c-3", "Petite", "c", "3", "", "", (2, 1, 2, 9, "2026-11-13", 2, 2, 0.3, "n", 0))
        out = build_index.price_audit([ok, grp, tcp, cheap])
        self.assertEqual(len(out), 2)
        self.assertTrue(out[0].startswith("b-2 Celebi : cote 970") and "TCGplayer 8573" in out[0])
        self.assertTrue(out[1].startswith("ex7-99") and "autre groupe 20.5" in out[1])

    def test_holo_only_without_holo_bucket(self):
        # Carte holo seulement mais seul le groupe normal est coté (vieilles holos) : c'est son prix, pas un doute
        # (2026-10-11 : marquées douteuses avant, 2 858 cartes « cote à confirmer » sans raison).
        cm = {"trend": 20, "low": 15, "avg1": 21}
        self.assertEqual(prices(card(cm, variants=variants(holo=True)), 0.9)[6:], (21, None, "n", 0))

    def test_reverse_card(self):
        # Carte avec une reverse : « -holo » est la reverse ; cote du groupe normal, reverse exposée à part.
        cm = {"trend": 0.3, "low": 0.02, "avg1": 0.25, "trend-holo": 1.2, "low-holo": 0.5}
        p = prices(card(cm, variants=variants(normal=True, reverse=True)), 0.9)
        self.assertEqual((p[0], p[1], p[7], p[8], p[9]), (0.3, 0.02, 1.2, "n", 0))  # sous 1 € : jamais douteuse

    def test_doubtful(self):
        self.assertEqual(prices(card({"trend": 20, "low": 0.5}), 0.9)[9], 1)  # plus bas < 5 % de la tendance
        self.assertEqual(prices(card({"trend": 20, "low": 5, "avg1": 70}), 0.9)[9], 1)  # moyenne 1 j > 3 × tendance
        self.assertEqual(prices(card({"trend": 20, "low": 5, "avg1": 6}), 0.9)[9], 1)  # moyenne 1 j < tendance / 3
        self.assertEqual(prices(card({"trend": 20, "low": 5, "avg1": 25}), 0.9)[9], 0)

    def test_missing_and_tcgplayer(self):
        tcp = {"holofoil": {"marketPrice": 10}}
        self.assertEqual(prices(card({}, tcp), 0.9), (None, None, None, 9.0, None, None, None, None, None, 0))
        self.assertEqual(prices(card({"trend": 0, "avg7": -1}), 0.9)[0::5], (None, None))

    def test_row_order(self):
        r = row("ex8-107", "Rayquaza ☆", "ex8", "107", "Rare", "fr/ex/ex8/107", prices(card(RAYQUAZA, variants=variants(holo=True)), 0.9))
        f = {k: i for i, k in enumerate(FIELDS)}
        self.assertEqual(len(r), len(FIELDS))
        self.assertEqual((r[f["cm"]], r[f["lang"]], r[f["cmh"]], r[f["cmv"]], r[f["q"]]), (135.39, "", 32.35, "h", 0))
        self.assertEqual(FIELDS[:14], ["id", "name", "set", "num", "rarity", "img", "cm", "low", "avg30", "tcp", "upd", "avg7", "avg1", "lang"])

    def test_ptcg_prices(self):
        c = {"cardmarket": {"prices": {"trendPrice": 12.5, "lowPrice": 9}}}
        self.assertEqual(ptcg_row_prices(c, 0.9)[7:], (None, "n", 0))
        self.assertEqual(ptcg_row_prices({}, 0.9)[7:], (None, None, 0))


def doc(cards, sets=None, stats=None):
    f = {k: i for i, k in enumerate(FIELDS)}
    rows = []
    for i, (sid, cm) in enumerate(cards):
        r = [None] * len(FIELDS)
        r[f["id"]], r[f["set"]], r[f["cm"]], r[f["img"]] = f"{sid}-{i}", sid, cm, ""
        rows.append(r)
    return {"fields": FIELDS, "sets": sets or {sid: [sid, "", "2020-01-01"] for sid, _ in cards}, "stats": stats or {}, "cards": rows}


class Compare(unittest.TestCase):
    def setUp(self):
        self.prev = doc([("a", 1.0)] * 60 + [("b", 2.0)] * 40, stats={"cardsEn": 100, "imgAlt": {"en": 80, "pokemontcg.io": 20}, "imgNone": 100})

    def test_same(self):
        self.assertEqual(compare_catalog(self.prev, self.prev), ([], []))
        self.assertEqual(compare_catalog(None, self.prev), ([], []))

    def test_cards_drop(self):
        errors, _ = compare_catalog(self.prev, doc([("a", 1.0)] * 57 + [("b", 2.0)] * 40, stats=self.prev["stats"]))
        self.assertTrue(any("97 cartes contre 100" in e for e in errors))
        self.assertEqual(compare_catalog(self.prev, doc([("a", 1.0)] * 58 + [("b", 2.0)] * 40, stats=self.prev["stats"]))[0], [])

    def test_set_disappeared(self):
        errors, _ = compare_catalog(self.prev, doc([("a", 1.0)] * 100, stats=self.prev["stats"]))
        self.assertTrue(any("disparues" in e and "b" in e for e in errors))

    def test_prices_drop(self):
        errors, _ = compare_catalog(self.prev, doc([("a", 1.0)] * 60 + [("b", None)] * 40, stats=self.prev["stats"]))
        self.assertTrue(any("cote Cardmarket" in e for e in errors))

    def test_english_stats(self):
        new = doc([("a", 1.0)] * 60 + [("b", 2.0)] * 40, stats={"cardsEn": 85, "imgAlt": {"en": 80}, "imgNone": 120})
        errors, warnings = compare_catalog(self.prev, new)
        self.assertEqual(errors, [])
        self.assertEqual(len(warnings), 2)  # cardsEn −15 %, imgAlt −20 %
        # Images pokemontcg.io retirées (hébergeur muet) : imgAlt −40 %, imgNone +100.
        new["stats"] = {"cardsEn": 100, "imgAlt": {"en": 60}, "imgNone": 200}
        errors, _ = compare_catalog(self.prev, new)
        self.assertEqual(len(errors), 2)

    def test_new_set_without_images(self):
        # 2026-11-11 : me06 annoncée par TCGdex avec 141 cartes sans image ; pas une perte de visuels.
        new = doc([("a", 1.0)] * 60 + [("b", 2.0)] * 40 + [("me06", None)] * 141, stats={**self.prev["stats"], "imgNone": 241})
        errors, warnings = compare_catalog(self.prev, new)
        self.assertEqual(errors, [])
        self.assertTrue(any("nouvelles extensions : me06 (141 cartes encore sans visuel)" in w for w in warnings))
        # Mais des visuels perdus dans les extensions déjà connues restent une erreur.
        new["stats"]["imgNone"] = 241 + 100
        self.assertTrue(any("imgNone" in e for e in compare_catalog(self.prev, new)[0]))


class Coverage(unittest.TestCase):
    def test_sets_without_cardmarket(self):
        d = doc([("30th", None)] * 3 + [("gym1", None)] * 2 + [("sv01", 1.0), ("sv01", None)])
        d["sets"] = {"30th": ["30ᵉ", "", "2026-09-16"], "gym1": ["Gym", "", "2000-08-14"], "sv01": ["EV", "", "2023-03-31"]}
        c = coverage(d["cards"], d["sets"], date(2026, 10, 11))
        self.assertEqual(c["setsNoCm"], {"30th": 3, "gym1": 2})
        self.assertEqual(c["setsPriceSoon"], ["30th"])  # sortie il y a moins de 90 jours : « cote à venir »
        self.assertEqual((c["cardsCm"], c["cardsPriced"]), (1, 1))


class Probe(unittest.TestCase):
    def test_three_images_before_giving_up(self):
        seen = []
        with mock.patch.object(build_index, "probe_image", lambda p: seen.append(p) or False), \
                mock.patch.object(build_index.time, "sleep") as sleep:
            self.assertFalse(ptcg_alive(["ptcg:a/1", "ptcg:b/2", "ptcg:c/3", "ptcg:d/4"]))
        self.assertEqual(len(set(seen)), 3)
        self.assertEqual(sleep.call_count, 2)

    def test_one_answer_is_enough(self):
        answers = iter([False, True])
        with mock.patch.object(build_index, "probe_image", lambda p: next(answers)), mock.patch.object(build_index.time, "sleep"):
            self.assertTrue(ptcg_alive(["ptcg:a/1", "ptcg:b/2"]))


class RealCatalogue(unittest.TestCase):
    def test_published_catalogue_compares_with_itself(self):
        from pathlib import Path
        src = Path(__file__).resolve().parents[2] / "web" / "data" / "cards.json"
        d = json.loads(src.read_text("utf-8"))
        self.assertEqual(compare_catalog(d, d), ([], []))



class Reprints(unittest.TestCase):
    """Visuel d'une réimpression du même dessin (2026-11-01, porteur : « il y a encore des cartes sans visuel »)."""
    RAICHU = {"name": "Raichu", "illustrator": "Kagemaru Himeno", "hp": 90,
              "attacks": [{"name": "Poing Éclair"}, {"name": "Tonnerre"}]}

    def test_key(self):
        self.assertEqual(art_key(self.RAICHU), ("raichu", "kagemaru himeno", "90", ("poing eclair", "tonnerre"), (), ""))
        self.assertIsNone(art_key({"name": "Énergie Feu de base"}))  # ni illustrateur ni texte : pas de signature
        self.assertIsNone(art_key({"name": "Raichu", "illustrator": "X"}))  # rien d'autre à comparer
        trainer = {"name": "Potion", "illustrator": "Ryo Ueda", "effect": "Soignez 30 dégâts."}
        self.assertEqual(art_key(trainer)[5], "soignez 30 degats")

    def test_match(self):
        k = art_key(self.RAICHU)
        other = art_key(dict(self.RAICHU, hp=100))  # autres PV : autre carte, pas de visuel
        known = [(k, "fr/hgss/hgss1/22", "hgss1-22"), (k, "fr/hgss/hgss2/5", "hgss2-5"), (None, "fr/x/y/1", "y-1")]
        got = reprint_images(known, [(k, "tk-hs-r-12"), (other, "tk-hs-r-13"), (None, "tk-hs-r-14")])
        self.assertEqual(got, {"tk-hs-r-12": ("fr/hgss/hgss1/22", "hgss1-22")})  # la première illustrée gagne


if __name__ == "__main__":
    unittest.main()
