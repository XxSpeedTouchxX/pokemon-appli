"""Tests des prix et des garde-fous de build_index.py. Lancer : python3 -m unittest discover -s tools/tcgdex -p 'test_*.py'"""
import json
import unittest
from datetime import date
from unittest import mock

import build_index
from build_index import FIELDS, compare_catalog, coverage, prices, ptcg_alive, ptcg_row_prices, row


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

    def test_holo_only_without_holo_bucket(self):
        # Carte holo seulement mais seul le groupe normal est coté : cote gardée, marquée douteuse.
        cm = {"trend": 20, "low": 15, "avg1": 21}
        self.assertEqual(prices(card(cm, variants=variants(holo=True)), 0.9)[6:], (21, None, "n", 1))

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


if __name__ == "__main__":
    unittest.main()
