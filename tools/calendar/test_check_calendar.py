"""Tests de check_calendar.py (python3 -m unittest discover -s tools/calendar)."""
import datetime as dt
import json
import pathlib
import tempfile
import unittest

import check_calendar as cc

TODAY = dt.date(2026, 11, 19)


def item(**kw):
    base = {"id": "x", "name": "X", "status": "officiel", "date": "2026-12-05"}
    base.update(kw)
    return base


class CheckTest(unittest.TestCase):
    def kinds(self, items):
        return [p["kind"] for p in cc.check(items, TODAY)]

    def test_rien_a_signaler(self):
        self.assertEqual(self.kinds([item(), item(status="sortie", date="2026-11-06"), item(status="rumeur", date="2027-07")]), [])

    def test_date_exacte_passee(self):
        pts = cc.check([item(status="officiel", date="2026-11-18")], TODAY)
        self.assertEqual([p["kind"] for p in pts], ["passee"])
        self.assertIn("sortie", pts[0]["text"])

    def test_mois_en_cours_pas_encore_passe(self):
        # « 2026-11 » couvre tout novembre : pas encore passé le 19.
        self.assertEqual(self.kinds([item(status="rumeur", date="2026-11")]), [])
        self.assertEqual(self.kinds([item(status="rumeur", date="2026-10")]), ["passee"])

    def test_rumeur_a_confirmer(self):
        pts = cc.check([item(status="rumeur", date="2026-11-01")], TODAY)
        self.assertIn("confirmer", pts[0]["text"])

    def test_sortie_dans_le_futur(self):
        self.assertEqual(self.kinds([item(status="sortie", date="2026-12-01")]), ["future"])
        self.assertEqual(self.kinds([item(status="sortie", date="2026-12")]), ["future"])
        self.assertEqual(self.kinds([item(status="sortie", date="2026-11")]), [])

    def test_dates_illisibles(self):
        self.assertEqual(self.kinds([item(date="5 décembre")]), ["date"])
        self.assertEqual(self.kinds([item(date="2026-13")]), ["date"])
        self.assertEqual(self.kinds([item(date="2026-02-30")]), ["date"])
        self.assertEqual(self.kinds([item(preorder="bientôt")]), ["precommande"])

    def test_precommande_passee(self):
        self.assertEqual(self.kinds([item(preorder="2026-11-10")]), ["precommande"])
        self.assertEqual(self.kinds([item(preorder="2026-11-25")]), [])

    def test_rapport_et_code_de_sortie(self):
        with tempfile.TemporaryDirectory() as d:
            f = pathlib.Path(d) / "c.json"
            f.write_text(json.dumps({"updated": "2026-11-18", "items": [item(id="me07", name="Méga 7", date="2026-11-01")]}), "utf-8")
            out = pathlib.Path(d) / "r.md"
            self.assertEqual(cc.main(["--file", str(f), "--today", "2026-11-19", "--out", str(out)]), 1)
            txt = out.read_text("utf-8")
            self.assertIn("**Méga 7** (`me07`)", txt)
            f.write_text(json.dumps({"items": [item()]}), "utf-8")
            self.assertEqual(cc.main(["--file", str(f), "--today", "2026-11-19"]), 0)
            f.write_text("{", "utf-8")
            self.assertEqual(cc.main(["--file", str(f)]), 2)

    def test_vrai_calendrier_lisible(self):
        doc = json.loads(cc.DEFAULT.read_text("utf-8"))
        self.assertTrue(doc["items"])
        self.assertEqual([p for p in cc.check(doc["items"], TODAY) if p["kind"] == "date"], [])


if __name__ == "__main__":
    unittest.main()
