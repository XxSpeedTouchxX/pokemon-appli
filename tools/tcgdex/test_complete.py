"""Tests des compléments d'extensions (complete.py). Lancer : python3 -m unittest discover -s tools/tcgdex -p 'test_*.py'"""
import unittest

from complete import en_extra, ptcg_extra, ptcg_prices

IMG = "https://images.pokemontcg.io/"


def ptcg_card(number, name="Mew", rarity="Rare"):
    return {"number": number, "name": name, "rarity": rarity,
            "images": {"small": f"{IMG}30th/{number}.png", "large": f"{IMG}30th/{number}_hires.png"}}


class EnExtra(unittest.TestCase):
    def test_missing_numbers_only(self):
        fr = {"cards": [{"localId": "001"}, {"localId": "2"}]}
        en = {"cards": [{"id": "x-1", "localId": "1"}, {"id": "x-2", "localId": "002"}, {"id": "x-3", "localId": "003"},
                        {"id": "x-3b", "localId": "3"}]}
        self.assertEqual([c["id"] for c in en_extra(fr, en)], ["x-3"])

    def test_no_english_version(self):
        self.assertEqual(en_extra({"cards": [{"localId": "1"}]}, None), [])


class PtcgExtra(unittest.TestCase):
    def test_adds_missing_cards(self):
        cards = [ptcg_card("1"), ptcg_card("159", "Mew (Red)"), ptcg_card("160", "Mew (Green)"), ptcg_card("60a")]
        have_n, have_ids = {"1"}, {"30th-1"}
        out = ptcg_extra("30th", "30th", cards, have_n, have_ids, set())
        self.assertEqual([x["id"] for x in out], ["30th-159", "30th-160"])
        self.assertEqual(out[0]["img"], "ptcg:30th/159")
        self.assertEqual(out[0]["local"], "159")
        self.assertIn("160", have_n)  # jamais deux fois le même numéro

    def test_shared_or_unmapped_set(self):
        self.assertEqual(ptcg_extra("ex10", "ex10", [ptcg_card("1")], set(), set(), {"ex10"}), [])
        self.assertEqual(ptcg_extra("x", None, [ptcg_card("1")], set(), set(), set()), [])

    def test_prices(self):
        c = {"cardmarket": {"updatedAt": "2026/10/08", "prices": {"trendPrice": 12.5, "lowPrice": 9, "avg30": 0,
                                                                  "avg7": 11, "avg1": 13}},
             "tcgplayer": {"prices": {"holofoil": {"market": 10}}}}
        self.assertEqual(ptcg_prices(c, 0.9), (12.5, 9, None, 9.0, "2026-10-08", 11, 13))
        self.assertEqual(ptcg_prices({}, 0.9), (None, None, None, None, None, None, None))


if __name__ == "__main__":
    unittest.main()
