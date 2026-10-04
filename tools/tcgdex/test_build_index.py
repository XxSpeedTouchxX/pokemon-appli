"""Tests des prix de build_index.py. Lancer : python3 -m unittest discover -s tools/tcgdex -p 'test_*.py'"""
import unittest

from build_index import prices


def card(cm=None, tcp=None):
    return {"pricing": {"cardmarket": cm or {}, "tcgplayer": tcp or {}}}


class Prices(unittest.TestCase):
    def test_normal_variant(self):
        cm = {"trend": 12.5, "low": 9, "avg30": 11, "avg7": 12, "avg1": 13.1, "updated": "2026-10-04T00:00:00",
              "trend-holo": 40, "avg30-holo": 38, "avg7-holo": 39, "avg1-holo": 41}
        self.assertEqual(prices(card(cm), 0.9), (12.5, 9, 11, None, "2026-10-04", 12, 13.1))

    def test_holo_variant(self):
        # Pas de tendance normale : tendance et moyennes de la variante holo, jamais un mélange des deux.
        cm = {"avg30": 2, "trend-holo": 40, "low-holo": 30, "avg30-holo": 38, "avg7-holo": 39, "avg1-holo": 41}
        self.assertEqual(prices(card(cm), 0.9), (40, 30, 38, None, None, 39, 41))

    def test_missing_and_tcgplayer(self):
        tcp = {"holofoil": {"marketPrice": 10}}
        self.assertEqual(prices(card({}, tcp), 0.9), (None, None, None, 9.0, None, None, None))
        self.assertEqual(prices(card({"trend": 0, "avg7": -1}), 0.9)[0::5], (None, None))


if __name__ == "__main__":
    unittest.main()
