"""Tests du découpage du catalogue (split_catalog.py) : python3 -m unittest tools/tcgdex/test_split_catalog.py"""
import json
import unittest
from pathlib import Path

import split_catalog as S

DOC = {"v": 2, "generated": "2026-10-09T11:52:10Z", "source": "TCGdex", "img": "https://assets.tcgdex.net/",
       "usdEur": 0.9, "usdEurDate": "2026-10-08", "usdEurSource": "BCE", "sets": {"sv01": ["Écarlate et Violet"]},
       "fields": ["id", "name", "set", "num", "rarity", "img", "cm", "low", "avg30", "tcp", "upd", "avg7", "avg1"],
       "stats": {"cards": 2}, "rarities": {"Rare": 2},
       "cards": [["sv01-001", "Bulbizarre", "sv01", "001", "Rare", "sv/sv01/001", 1.2, 0.5, 1.1, None, "2026-10-08", 1.0, 1.3],
                 ["sv01-002", "Herbizarre", "sv01", "002", "Rare", "", None, None, None, 2.0, "2026-10-08", None, None]]}


class SplitTest(unittest.TestCase):
    def test_round_trip(self):
        base, prices = S.split(DOC)
        self.assertEqual(S.join(base, prices), DOC)

    def test_base_ignores_daily_values(self):
        b1, _ = S.split(DOC)
        other = json.loads(json.dumps(DOC))
        other["generated"] = "2026-10-10T11:00:00Z"; other["usdEur"] = 0.91; other["cards"][0][6] = 9.99
        b2, p2 = S.split(other)
        self.assertEqual(b1, b2, "un changement de prix ne doit pas changer la partie fixe")
        self.assertEqual(p2["base"], b1["key"])

    def test_mismatch_refused(self):
        base, prices = S.split(DOC)
        other = json.loads(json.dumps(DOC)); other["cards"][1][1] = "Florizarre"
        b2, _ = S.split(other)
        self.assertIsNone(S.join(b2, prices))

    def test_real_catalogue(self):
        src = Path(__file__).resolve().parents[2] / "web" / "data" / "cards.json"
        doc = json.loads(src.read_text("utf-8"))
        base, prices = S.split(doc)
        self.assertEqual(S.join(base, prices), doc)


if __name__ == "__main__":
    unittest.main()
