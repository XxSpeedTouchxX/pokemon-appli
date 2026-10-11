"""Tests de build_sealed.py. Lancer : python3 -m unittest discover -s tools/sealed"""
import json
import unittest
from pathlib import Path

from datetime import datetime, timezone

import build_sealed
from build_sealed import ASIN, FIELDS, HIST_DAYS, archive, build, check_guide, guide_age, median

PRODUCTS = [
    {"id": "coffret", "name": "Coffret A ou B", "type": "CFT", "set": "30th", "cm": [1, 2]},
    {"id": "etb", "name": "ETB", "type": "ETB", "set": "me05", "release": "2026-07-17", "cm": [3]},
    {"id": "inconnu", "name": "Sans prix", "type": "TIN", "cm": []},
    {"id": "sortie", "name": "UPC", "type": "UPC", "release": "2026-11-06", "cm": [], "amazon": "B0H8SVJL9F", "msrp": [239.99, 229.99],
     "msrpSource": "boutiques", "q": "pokemon upc", "dateSource": "pokemon.com"},
    {"id": "asin-faux", "name": "ASIN faux", "type": "ETB", "cm": [], "amazon": "b0h8-12", "msrp": [59.99]},
]
GUIDE = {"createdAt": "2026-10-04T02:00:00+0200", "priceGuides": [
    {"idProduct": 1, "trend": 50.0, "avg30": 48.0, "low": 45.0, "avg7": 49.0, "avg1": 51.0},
    {"idProduct": 2, "trend": 40.0, "avg30": None, "low": 39.0, "avg7": 41.0, "avg1": 39.0},
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
        f = {k: i for i, k in enumerate(FIELDS)}
        self.assertEqual((by["coffret"][f["avg7"]], by["coffret"][f["avg1"]]), (45.0, 45.0))  # médianes des moyennes 7 j et 1 j
        self.assertEqual((by["etb"][f["avg7"]], by["etb"][f["avg1"]]), (None, None))  # absentes du guide

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
        rows, priced = build(PRODUCTS, None, {"etb": [69.0, 70.0, 65.0, 68.0, 69.5]})
        by = {r[0]: r for r in rows}
        f = {k: i for i, k in enumerate(FIELDS)}
        self.assertEqual(by["etb"][8:11], [69.0, 70.0, 65.0])
        self.assertEqual((by["etb"][f["avg7"]], by["etb"][f["avg1"]]), (68.0, 69.5))
        self.assertEqual(by["coffret"][8:11], [None, None, None])
        self.assertEqual(priced, 1)


class Archive(unittest.TestCase):
    def old(self, days, hist):
        return {"fields": ["id", "trend", "hist"], "days": days, "products": [["etb", 1, h] for h in [hist]]}

    def test_new_day_appended(self):
        rows, _ = build(PRODUCTS, GUIDE, {})
        f = {k: i for i, k in enumerate(FIELDS)}
        days = archive(rows, self.old(["2026-10-02", "2026-10-03"], [68.0, 69.5]), "2026-10-04")
        by = {r[0]: r for r in rows}
        self.assertEqual(days, ["2026-10-02", "2026-10-03", "2026-10-04"])
        self.assertEqual(by["etb"][f["hist"]], [68.0, 69.5, 70.01])
        self.assertEqual(by["coffret"][f["hist"]], [None, None, 45.0])  # nouveau dans l'archive

    def test_same_day_replaced_and_offline_kept(self):
        rows, _ = build(PRODUCTS, GUIDE, {})
        f = {k: i for i, k in enumerate(FIELDS)}
        old = self.old(["2026-10-03", "2026-10-04"], [69.5, 60.0])
        self.assertEqual(archive(rows, old, "2026-10-04"), ["2026-10-03", "2026-10-04"])
        self.assertEqual({r[0]: r for r in rows}["etb"][f["hist"]], [69.5, 70.01])  # le jour même : valeur remplacée
        self.assertEqual(archive(rows, old, None), ["2026-10-03", "2026-10-04"])  # sans guide : archive gardée
        self.assertEqual({r[0]: r for r in rows}["etb"][f["hist"]], [69.5, 60.0])

    def test_window(self):
        rows, _ = build(PRODUCTS, GUIDE, {})
        f = {k: i for i, k in enumerate(FIELDS)}
        days0 = [f"2026-09-{d:02d}" for d in range(1, 31)] + ["2026-10-01", "2026-10-02"]
        days = archive(rows, self.old(days0, list(range(32))), "2026-10-03")
        self.assertEqual(len(days), HIST_DAYS)
        self.assertEqual(days[0], "2026-09-03")
        self.assertEqual({r[0]: r for r in rows}["etb"][f["hist"]][-2:], [31, 70.01])
        self.assertEqual(archive(rows, None, "2026-10-04"), ["2026-10-04"])  # premier jour

    def test_missing_days_are_null(self):
        # Le 2026-10-05 manque (guide de la veille refusé) : la date est gardée, avec null.
        rows, _ = build(PRODUCTS, GUIDE, {})
        f = {k: i for i, k in enumerate(FIELDS)}
        days = archive(rows, self.old(["2026-10-03", "2026-10-04", "2026-10-06"], [1, 2, 3]), "2026-10-08")
        self.assertEqual(days, ["2026-10-03", "2026-10-04", "2026-10-05", "2026-10-06", "2026-10-07", "2026-10-08"])
        self.assertEqual({r[0]: r for r in rows}["etb"][f["hist"]], [1, 2, None, 3, None, 70.01])
        self.assertEqual(archive(rows, self.old(["2026-10-04", "2026-10-06"], [2, 3]), None), ["2026-10-04", "2026-10-05", "2026-10-06"])


NOW = datetime(2026, 10, 11, 6, 20, tzinfo=timezone.utc)


class Guard(unittest.TestCase):
    def test_age(self):
        self.assertAlmostEqual(guide_age({"createdAt": "2026-10-11T02:44:21+0200"}, NOW), 5.6, places=1)
        self.assertIsNone(guide_age({"createdAt": "hier"}, NOW))

    def test_fresh_guide_accepted(self):
        self.assertEqual(check_guide({"createdAt": "2026-10-11T02:44:21+0200", "priceGuides": [{}]}, 60, 61, NOW), [])

    def test_stale_guide_refused(self):
        problems = check_guide({"createdAt": "2026-10-09T23:44:21+0200", "priceGuides": [{}]}, 61, 61, NOW)
        self.assertEqual(len(problems), 1)
        self.assertIn("plus de 30 h", problems[0])

    def test_empty_or_thin_guide_refused(self):
        self.assertTrue(check_guide({"createdAt": "2026-10-11T02:44:21+0200", "priceGuides": []}, 0, 61, NOW))
        self.assertTrue(check_guide({"createdAt": "2026-10-11T02:44:21+0200", "guides": [{}]}, 0, 61, NOW))  # clé renommée
        self.assertTrue(check_guide({"createdAt": "2026-10-11T02:44:21+0200", "priceGuides": [{}]}, 48, 61, NOW))  # 79 %
        self.assertEqual(check_guide({"createdAt": "2026-10-11T02:44:21+0200", "priceGuides": [{}]}, 49, 61, NOW), [])

    def test_main_keeps_file(self):
        import io
        import tempfile
        from unittest import mock
        with tempfile.TemporaryDirectory() as d:
            out, guide = Path(d) / "sealed.json", Path(d) / "guide.json"
            out.write_text(json.dumps({"fields": ["id", "trend"], "products": [["etb", 70.0]]}), "utf-8")
            before = out.read_text("utf-8")
            guide.write_text(json.dumps({"createdAt": "2026-01-01T02:00:00+0100", "priceGuides": GUIDE["priceGuides"]}), "utf-8")
            with mock.patch.object(build_sealed, "OUT", out), mock.patch("sys.argv", ["build_sealed.py", "--prices", str(guide)]), \
                    mock.patch("sys.stdout", io.StringIO()):
                with self.assertRaises(SystemExit) as e:
                    build_sealed.main()
            self.assertIn("n'est pas modifié", str(e.exception.code))
            self.assertEqual(out.read_text("utf-8"), before)


if __name__ == "__main__":
    unittest.main()
