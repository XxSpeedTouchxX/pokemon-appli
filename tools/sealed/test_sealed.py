"""Tests de build_sealed.py. Lancer : python3 -m unittest discover -s tools/sealed"""
import json
import unittest
from pathlib import Path

from build_sealed import ASIN, FIELDS, build, median

PRODUCTS = [
    {"id": "coffret", "name": "Coffret A ou B", "type": "CFT", "set": "30th", "cm": [1, 2]},
    {"id": "etb", "name": "ETB", "type": "ETB", "set": "me05", "release": "2026-07-17", "cm": [3]},
    {"id": "inconnu", "name": "Sans prix", "type": "TIN", "cm": []},
    {"id": "sortie", "name": "UPC", "type": "UPC", "release": "2026-11-06", "cm": [], "amazon": "B0H8SVJL9F", "msrp": [239.99, 229.99],
     "msrpSource": "boutiques", "q": "pokemon upc", "dateSource": "pokemon.com"},
    {"id": "asin-faux", "name": "ASIN faux", "type": "ETB", "cm": [], "amazon": "b0h8-12", "msrp": [59.99]},
]
GUIDE = {"createdAt": "2026-10-04T02:00:00+0200", "priceGuides": [
    {"idProduct": 1, "trend": 50.0, "avg30": 48.0, "low": 45.0},
    {"idProduct": 2, "trend": 40.0, "avg30": None, "low": 39.0},
    {"idProduct": 3, "trend": 70.01, "avg30": 72.5, "low": 0},
]}


class Sealed(unittest.TestCase):
    def test_median(self):
        self.assertEqual(median([50.0, 40.0]), 45.0)
        self.assertEqual(median([None, 0, 12.5]), 12.5)
        self.assertIsNone(median([None, 0]))

    def test_build(self):
        rows, priced = build(PRODUCTS, GUIDE, {})
        by = {r[0]: r for r in rows}
        self.assertEqual(by["coffret"][8:12], [45.0, 48.0, 42.0, 2])  # médiane des deux variantes
        self.assertEqual(by["etb"][4], "2026-07-17")
        self.assertIsNone(by["etb"][10])  # « plus bas » à 0 : ignoré
        self.assertEqual(by["inconnu"][8:11], [None, None, None])
        self.assertEqual(priced, 2)

    def test_release_fields(self):
        rows, _ = build(PRODUCTS, GUIDE, {})
        f = {k: i for i, k in enumerate(FIELDS)}
        by = {r[0]: r for r in rows}
        self.assertEqual(len(by["sortie"]), len(FIELDS))
        self.assertEqual(by["sortie"][f["amazon"]], "B0H8SVJL9F")
        self.assertEqual(by["sortie"][f["msrp"]], [229.99, 239.99])  # fourchette dans l'ordre
        self.assertEqual(by["sortie"][f["msrpSource"]], "boutiques")
        self.assertEqual(by["sortie"][f["q"]], "pokemon upc")
        self.assertEqual(by["sortie"][f["dateSource"]], "pokemon.com")
        self.assertIsNone(by["asin-faux"][f["amazon"]])  # ASIN mal formé : refusé
        self.assertIsNone(by["asin-faux"][f["msrp"]])  # prix sans source : écarté

    def test_products_file(self):
        doc = json.loads(Path(__file__).with_name("products.json").read_text("utf-8"))
        ids = [p["id"] for p in doc["products"]]
        self.assertEqual(len(ids), len(set(ids)))
        for p in doc["products"]:
            if "amazon" in p:
                self.assertRegex(p["amazon"], ASIN, p["id"])
            if "msrp" in p:
                self.assertTrue(p.get("msrpSource"), p["id"])
                self.assertTrue(1 <= len(p["msrp"]) <= 2 and all(v > 0 for v in p["msrp"]), p["id"])

    def test_previous_prices_kept_without_guide(self):
        rows, priced = build(PRODUCTS, None, {"etb": [69.0, 70.0, 65.0]})
        by = {r[0]: r for r in rows}
        self.assertEqual(by["etb"][8:11], [69.0, 70.0, 65.0])
        self.assertEqual(by["coffret"][8:11], [None, None, None])
        self.assertEqual(priced, 1)


if __name__ == "__main__":
    unittest.main()
