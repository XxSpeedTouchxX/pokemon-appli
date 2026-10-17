"""Tests des prix TCGCSV (tcgcsv.py, fill_tcgcsv). Lancer : python3 -m unittest discover -s tools/tcgdex -p 'test_*.py'"""
import json
import unittest

import tcgcsv
from build_index import FIELDS, fill_tcgcsv, row


def prod(pid, name, number=None):
    ext = [{"name": "Number", "value": number}] if number else []
    return {"productId": pid, "name": name, "extendedData": ext}


def price(pid, market, sub="Normal"):
    return {"productId": pid, "marketPrice": market, "subTypeName": sub}


GROUPS = [{"groupId": 1, "name": "SV10: Destined Rivals"}, {"groupId": 2, "name": "SM - Team Up"},
          {"groupId": 3, "name": "EX Ruby and Sapphire"}, {"groupId": 4, "name": "Hidden Fates"},
          {"groupId": 5, "name": "Hidden Fates: Shiny Vault"}, {"groupId": 6, "name": "XY Base Set"}]


class Names(unittest.TestCase):
    def test_prefixes_and_spelling(self):
        self.assertEqual(tcgcsv.set_key("SV10: Destined Rivals", True), tcgcsv.set_key("Destined Rivals"))
        self.assertEqual(tcgcsv.set_key("SM - Team Up", True), "team up")
        self.assertEqual(tcgcsv.set_key("EX Ruby and Sapphire", True), tcgcsv.set_key("Ruby & Sapphire"))
        self.assertEqual(tcgcsv.set_key("XY Base Set", True), "xy")

    def test_groups(self):
        self.assertEqual(tcgcsv.groups_for("sv10", "Destined Rivals", GROUPS), [1])
        self.assertEqual(tcgcsv.groups_for("sm115", "Hidden Fates", GROUPS), [4])  # pas le Shiny Vault
        self.assertEqual(tcgcsv.groups_for("sma", "Hidden Fates Shiny Vault", GROUPS), [2594])  # table GROUPS
        self.assertEqual(tcgcsv.groups_for("x", None, GROUPS), [])

    def test_numbers(self):
        self.assertEqual(tcgcsv.norm_num("021/128"), "21")
        self.assertEqual(tcgcsv.norm_num("TG05/TG30"), "TG5")
        self.assertEqual(tcgcsv.norm_num("SWSH045"), "SWSH45")
        self.assertEqual(tcgcsv.norm_num("050/185", True), "50/185")


class Prices(unittest.TestCase):
    def test_subtype_order(self):
        self.assertEqual(tcgcsv.market([price(1, 2.0, "Reverse Holofoil"), price(1, 5.0, "Normal")]), 5.0)
        self.assertEqual(tcgcsv.market([price(1, 9.0, "Holofoil"), price(1, 5.0, "Normal")]), 9.0)
        self.assertEqual(tcgcsv.market([price(1, 2.0, "Reverse Holofoil")]), 2.0)
        self.assertIsNone(tcgcsv.market([price(1, None)]))

    def test_match_by_number_and_name(self):
        idx = {1: tcgcsv.index([prod(10, "Greninja ex", "021/128"), prod(11, "Booster Pack"), prod(12, "Mew", "B"),
                                prod(13, "Mew (Cosmos Holo)", "B")],
                               [price(10, 3.5), price(11, 4.0), price(12, 1.0), price(13, 6.0)])}
        self.assertEqual(tcgcsv.price_for("30th", "021", None, idx), 3.5)
        self.assertIsNone(tcgcsv.price_for("30th", "B", None, idx))  # deux produits, rien pour départager
        self.assertEqual(tcgcsv.price_for("30th", "B", "Mew", idx), 1.0)
        self.assertIsNone(tcgcsv.price_for("30th", "999", None, idx))

    def test_classic_collection_original_numbers(self):
        # Trois cartes au numéro 106 : seul le numéro complet (« 106/105 ») les distingue.
        idx = {24837: tcgcsv.index([prod(1, "Charizard", "4/102"), prod(2, "Palkia LV.X", "106/106"),
                                    prod(3, "Shining Celebi", "106/105"), prod(4, "Raikou", "050/185")],
                                   [price(1, 150.0, "Holofoil"), price(2, 9.0, "Holofoil"), price(3, 25.0, "Holofoil"), price(4, 3.0, "Holofoil")])}
        self.assertEqual(tcgcsv.price_for("30th-c", "001", None, idx), 150.0)
        self.assertEqual(tcgcsv.price_for("30th-c", "024", None, idx), 25.0)
        self.assertEqual(tcgcsv.price_for("30th-c", "012", None, idx), 3.0)
        self.assertEqual(len(tcgcsv.CLASSIC_30_NUM), 30)


class Client(unittest.TestCase):
    def test_failure_is_counted(self):
        def opener(url):
            raise OSError("hors ligne")
        c = tcgcsv.Client(pause=0, opener=opener)
        self.assertIsNone(c.group_index(5))
        self.assertTrue(c.failures)


class Fill(unittest.TestCase):
    def client(self, data):
        return tcgcsv.Client(pause=0, opener=lambda url: json.dumps({"success": True, "results": data[url.split("/3/")[1]]}))

    def test_fill_only_cards_without_price(self):
        f = {k: i for i, k in enumerate(FIELDS)}
        none = (None,) * 7 + (None, None, 0)
        cards = [row("30th-001", "Noeunoeuf", "30th", "001", "Commune", "", none),
                 row("sv10-001", "X", "sv10", "001", "Commune", "", (1.0,) + (None,) * 6 + (None, "n", 0))]
        data = {"groups": [], "24722/products": [prod(1, "Exeggcute", "001/128")], "24722/prices": [price(1, 0.5)]}
        sets = {"30th": ["30ᵉ", "", "2026-09-16", "", 128, "fr"], "sv10": ["Rivales", "", "", "", 182, "fr"]}
        n, report, fails = fill_tcgcsv(cards, sets, {}, {}, 0.9, self.client(data))
        self.assertEqual((n, fails), (1, []))
        self.assertEqual((cards[0][f["tcp"]], cards[0][f["ts"]]), (0.45, 1))
        self.assertEqual((cards[1][f["tcp"]], cards[1][f["ts"]]), (None, 0))

    def test_yesterday_kept_when_tcgcsv_is_down(self):
        f = {k: i for i, k in enumerate(FIELDS)}
        cards = [row("30th-001", "Noeunoeuf", "30th", "001", "Commune", "", (None,) * 7 + (None, None, 0))]
        prev_card = list(cards[0])
        prev_card[f["tcp"]], prev_card[f["ts"]] = 0.4, 1
        def opener(url):
            raise OSError("hors ligne")
        n, report, fails = fill_tcgcsv(cards, {}, {}, {}, 0.9, tcgcsv.Client(pause=0, opener=opener), {"fields": FIELDS, "cards": [prev_card]})
        self.assertEqual((n, cards[0][f["tcp"]], cards[0][f["ts"]]), (1, 0.4, 1))
        self.assertTrue(fails)


if __name__ == "__main__":
    unittest.main()
