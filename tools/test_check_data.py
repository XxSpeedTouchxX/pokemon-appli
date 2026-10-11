"""Tests de check_data.py. Lancer : python3 -m unittest discover -s tools -p test_check_data.py"""
import json
import subprocess
import sys
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import check_data as C  # noqa: E402
from build_index import FIELDS  # noqa: E402  (tools/tcgdex, ajouté au chemin par check_data)
from split_catalog import split  # noqa: E402

NOW = datetime(2026, 10, 11, 6, 30, tzinfo=timezone.utc)
STORE_FIELDS = ["id", "nom", "type", "lat", "lon", "dept", "ville", "enseigne", "cartes", "site", "tel", "horaires", "adresse"]


def stores(n, regions=None, generated="2026-10-11"):
    rows = [[f"n{i}", "Boutique", "jeux", 45.76, 4.83, "69", "Lyon", "", 0, "", "", "", ""] for i in range(n)]
    doc = {"generated": generated, "fields": STORE_FIELDS, "count": n, "stores": rows}
    if regions:
        doc["regions"] = regions
    return {"web/data/stores.json": doc, "tools/stores/reference.json": None}


SEALED_FIELDS = ["id", "name", "trend", "hist"]


def sealed(priced, total=10, days=("2026-10-10", "2026-10-11"), prices="2026-10-11T02:44:21+0200"):
    rows = [[f"p{i}", "Produit", 10.0 if i < priced else None, [None] * len(days)] for i in range(total)]
    return {"web/data/sealed.json": {"prices": prices, "fields": SEALED_FIELDS, "days": list(days), "count": total, "products": rows}}


def cards(n, priced=None, sets=("a", "b"), upd="2026-10-10"):
    priced = n if priced is None else priced
    f = {k: i for i, k in enumerate(FIELDS)}
    rows = []
    for i in range(n):
        r = [None] * len(FIELDS)
        r[f["id"]], r[f["name"]], r[f["set"]], r[f["num"]], r[f["img"]] = f"c{i}", "Carte", sets[i % len(sets)], str(i), ""
        r[f["cm"]], r[f["upd"]], r[f["lang"]], r[f["q"]] = (1.0 if i < priced else None), upd, "", 0
        rows.append(r)
    doc = {"v": 2, "generated": "2026-10-11T05:00:00Z", "sets": {s: [s, "", "2020-01-01", "", "", "fr"] for s in sets},
           "fields": FIELDS, "stats": {"cards": n, "cardsEn": 0, "imgAlt": {}, "imgNone": 0}, "cards": rows}
    base, prices = split(doc)
    return {"web/data/cards.json": doc, "web/data/cards-base.json": base, "web/data/cards-prices.json": prices}


class Stores(unittest.TestCase):
    def test_ok(self):
        e = C.check("stores", stores(100), stores(98), NOW)
        self.assertTrue(e["ok"])
        self.assertEqual((e["count"], e["previous"], e["delta"]), (100, 98, 2))

    def test_drop_refused(self):
        e = C.check("stores", stores(94), stores(100), NOW)
        self.assertFalse(e["ok"])
        self.assertIn("plus de 5%", e["errors"][0])
        self.assertTrue(C.check("stores", stores(94), stores(100), NOW, force=True)["ok"])  # accepté à la main

    def test_region_drop(self):
        e = C.check("stores", stores(100, {"28": 0, "84": 100}), stores(100, {"28": 30, "84": 70}), NOW)
        self.assertTrue(any("région 28" in x for x in e["errors"]))

    def test_bad_rows(self):
        cur = stores(3)
        cur["web/data/stores.json"]["stores"][0] = ["n0", "x"]
        cur["web/data/stores.json"]["stores"][1][3] = 12.0  # hors de France
        e = C.check("stores", cur, {}, NOW)
        self.assertEqual(len(e["errors"]), 2)


class Sealed(unittest.TestCase):
    def test_ok(self):
        self.assertTrue(C.check("sealed", sealed(9), sealed(9), NOW)["ok"])

    def test_stale_guide(self):
        e = C.check("sealed", sealed(9, prices="2026-10-09T23:00:00+0200"), sealed(9), NOW)
        self.assertTrue(any("non renouvelé" in x for x in e["errors"]))

    def test_priced_drop_and_gap(self):
        e = C.check("sealed", sealed(5, days=("2026-10-04", "2026-10-06")), sealed(9), NOW)
        self.assertTrue(any("produits cotés" in x for x in e["errors"]))
        self.assertTrue(any("non consécutifs" in x for x in e["errors"]))


class Cards(unittest.TestCase):
    def test_ok(self):
        e = C.check("cards", cards(100), cards(100), NOW)
        self.assertTrue(e["ok"], e["errors"])
        self.assertEqual(e["upstream"], "2026-10-10")

    def test_drops(self):
        self.assertFalse(C.check("cards", cards(97), cards(100), NOW)["ok"])  # −3 % de cartes
        self.assertFalse(C.check("cards", cards(100, priced=90), cards(100), NOW)["ok"])  # −10 % de cotes
        e = C.check("cards", cards(100, sets=("a",)), cards(100), NOW)  # extension disparue
        self.assertTrue(any("disparues" in x for x in e["errors"]))

    def test_split_forgotten(self):
        cur = cards(100)
        cur["web/data/cards-prices.json"] = cards(100, priced=50)["web/data/cards-prices.json"]
        self.assertTrue(any("split_catalog" in x for x in C.check("cards", cur, {}, NOW)["errors"]))

    def test_stale_prices(self):
        self.assertFalse(C.check("cards", cards(10, upd="2026-10-01"), {}, NOW)["ok"])
        e = C.check("cards", cards(10, upd="2026-10-08"), {}, NOW)
        self.assertTrue(e["ok"])
        self.assertEqual(len(e["warnings"]), 1)


class Status(unittest.TestCase):
    def test_render_round_trip(self):
        status = {"cards": {"ok": True}, "stores": {"ok": False}}
        doc = json.loads(C.render_status(status))
        self.assertEqual((doc["cards"], doc["sealed"], doc["stores"]), ({"ok": True}, None, {"ok": False}))

    def test_git_merges_two_workflows(self):
        # Deux workflows mettent à jour status.json en même temps (sources différentes) : fusion sans conflit.
        base = C.render_status({s: {"ok": True, "n": 0} for s in C.SOURCES})
        ours = C.render_status({"cards": {"ok": True, "n": 1}, "sealed": {"ok": True, "n": 0}, "stores": {"ok": True, "n": 0}})
        theirs = C.render_status({"cards": {"ok": True, "n": 0}, "sealed": {"ok": False, "n": 2}, "stores": {"ok": True, "n": 0}})
        with tempfile.TemporaryDirectory() as d:
            paths = [Path(d) / n for n in ("ours", "base", "theirs")]
            for p, text in zip(paths, (ours, base, theirs)):
                p.write_text(text, "utf-8")
            r = subprocess.run(["git", "merge-file", *map(str, paths)], capture_output=True)
            self.assertEqual(r.returncode, 0, r.stderr)
            merged = json.loads(paths[0].read_text("utf-8"))
        self.assertEqual((merged["cards"]["n"], merged["sealed"]["n"]), (1, 2))

    def test_summary(self):
        text = C.summary("cards", C.check("cards", cards(97), cards(100), NOW))
        self.assertIn("❌", text)
        self.assertIn("97 (-3)", text)


if __name__ == "__main__":
    unittest.main()
