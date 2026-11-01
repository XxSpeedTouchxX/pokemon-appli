"""Tests des prix Cardmarket des fichiers publics (cmfiles.py, fill_cardmarket). Lancer :
python3 -m unittest discover -s tools/tcgdex -p 'test_*.py'"""
import unittest

import cmfiles
from build_index import FIELDS, fill_cardmarket, row

NONE = (None,) * 7 + (None, None, 0)


def prod(idp, name, exp=6601):
    return {"idProduct": idp, "name": name, "idExpansion": exp}


def guide(idp, trend, avg30=None, avg7=None, low=None, holo=None):
    return {"idProduct": idp, "trend": trend, "avg30": avg30, "avg7": avg7, "avg1": None, "low": low, "trend-holo": holo}


FILES = cmfiles.CmFiles(
    [prod(10, "Exeggcute [Hypnosis]"), prod(11, "Pikachu [Thunder Shock | 30]"), prod(12, "Pikachu [Volt Tackle | 30]"),
     prod(13, "Lugia [Elemental Blast | 30]"), prod(20, "Charizard [Energy Burn | Fire Spin]"),
     prod(21, "Pikachu [Gnaw | Thunder Jolt]"), prod(22, "Lugia [Crystal Type | Psychic | Steam Blast]"),
     prod(23, "Palkia LV.X [Restore | Hydro Shot]"), prod(24, "MGardevoir EX [Brilliant Arrow]"), prod(99, "Exeggcute [Ram]", exp=6595)],
    [guide(10, 0.04, 0.09, 0.07), guide(11, 0.62), guide(12, 0.52), guide(13, 0.1), guide(20, 173.99, 172.61, 174.14, 130),
     guide(21, 36.0), guide(22, 200.11, 218.34, 214.43), guide(23, None, None, None, None, holo=9.5)], "2026-10-18")


class Matching(unittest.TestCase):
    def test_same_names_in_order(self):
        cards = [("30th-001", "Exeggcute"), ("30th-023", "Pikachu"), ("30th-024", "Pikachu"), ("30th-060", "Lugia"),
                 ("30th-c-001", "Charizard"), ("30th-c-014", "Pikachu"), ("30th-c-029", "Lugia")]
        m = FILES.match(cards, [6601])
        self.assertEqual(m["30th-001"], 10)
        self.assertEqual((m["30th-023"], m["30th-024"], m["30th-c-014"]), (11, 12, 21))
        self.assertEqual((m["30th-060"], m["30th-c-029"]), (13, 22))
        self.assertEqual(m["30th-c-001"], 20)

    def test_count_mismatch_gives_nothing(self):
        self.assertNotIn("x-1", FILES.match([("x-1", "Pikachu")], [6601]))  # 3 Pikachu chez Cardmarket, 1 ici

    def test_near_name_and_holo_group(self):
        m = FILES.match([("30th-c-022", "Palkia")], [6601])
        self.assertEqual(m["30th-c-022"], 23)
        self.assertEqual(FILES.prices(23), (9.5, None, None, None, None, None, "h"))
        self.assertEqual(FILES.match([("30th-c-023", "M Gardevoir EX")], [6601]), {"30th-c-023": 24})

    def test_expansions(self):
        self.assertEqual(FILES.expansions_for("30th", []), [6601])
        self.assertEqual(FILES.expansions_for("sv10", [10, 11, 12, 13]), [6601])
        self.assertEqual(FILES.expansions_for("sv10", [10, 99]), [])  # trop peu de cartes reliées

    def test_expansion_found_by_names(self):
        files = cmfiles.CmFiles([prod(i, n + " [x]", 1441) for i, n in enumerate(["Brock's Rhydon", "Misty's Seadra", "Lt. Surge's Magnemite", "Erika's Oddish", "Sabrina's Abra", "Blaine's Growlithe"])]
                                + [prod(100 + i, "Pikachu [x]", 9) for i in range(6)], [])
        names = ["Brock's Rhydon", "Misty's Seadra", "Lt. Surge's Magnemite", "Erika's Oddish", "Sabrina's Abra", "Blaine's Growlithe"]
        self.assertEqual(files.expansions_for("gym1", [], names), [1441])
        self.assertEqual(files.expansions_for("gym1", [], names[:3] + ["Mew", "Mewtwo", "Ditto"]), [])  # moins de 80 %


class Fill(unittest.TestCase):
    def test_fill_only_cards_without_cardmarket(self):
        f = {k: i for i, k in enumerate(FIELDS)}
        cards = [row("30th-c-001", "Dracaufeu", "30th-c", "001", "Collection Classique", "", NONE),
                 row("30th-c-002", "Delcatty", "30th-c", "002", "Collection Classique", "", (5.0,) + (None,) * 6 + (None, "n", 0))]
        en = {"30th-c-001": "Charizard", "30th-c-002": "Delcatty"}
        n, report = fill_cardmarket(cards, {"30th-c": ["CC", "", "", "", "", "fr"]}, en, {}, FILES, en_fetch=lambda sid: {})
        self.assertEqual(n, 1)
        self.assertEqual((cards[0][f["cm"]], cards[0][f["avg30"]], cards[0][f["cmf"]], cards[0][f["upd"]]), (173.99, 172.61, 1, "2026-10-18"))
        self.assertEqual((cards[1][f["cm"]], cards[1][f["cmf"]]), (5.0, 0))

    def test_sets_sharing_an_expansion_matched_together(self):
        f = {k: i for i, k in enumerate(FIELDS)}
        cards = [row("30th-c-029", "Lugia", "30th-c", "029", "", "", NONE), row("30th-c-014", "Pikachu", "30th-c", "014", "", "", NONE),
                 row("30th-023", "Pikachu", "30th", "023", "", "", NONE), row("30th-024", "Pikachu", "30th", "024", "", "", NONE),
                 row("30th-121", "Lugia", "30th", "121", "", "", NONE)]
        en = {c[f["id"]]: c[f["name"]] for c in cards}
        n, report = fill_cardmarket(cards, {}, en, {}, FILES, en_fetch=lambda sid: {})
        got = {c[f["id"]]: c[f["cm"]] for c in cards}
        self.assertEqual(n, 5)
        self.assertEqual((got["30th-023"], got["30th-024"], got["30th-c-014"]), (0.62, 0.52, 36.0))
        self.assertEqual((got["30th-121"], got["30th-c-029"]), (0.1, 200.11))
        self.assertEqual(report, ["30th+30th-c 5/5"])

    def test_english_names_fetched_when_missing(self):
        f = {k: i for i, k in enumerate(FIELDS)}
        cards = [row("30th-001", "Noeunoeuf", "30th", "001", "Commune", "", NONE)]
        n, _ = fill_cardmarket(cards, {}, {}, {}, FILES, en_fetch=lambda sid: {"30th-001": "Exeggcute"})
        self.assertEqual((n, cards[0][f["cm"]]), (1, 0.04))

    def test_yesterday_kept_without_files(self):
        f = {k: i for i, k in enumerate(FIELDS)}
        cards = [row("30th-c-001", "Dracaufeu", "30th-c", "001", "", "", NONE)]
        old = list(cards[0])
        old[f["cm"]], old[f["cmf"]] = 170.0, 1
        n, _ = fill_cardmarket(cards, {}, {}, {}, None, {"fields": FIELDS, "cards": [old]})
        self.assertEqual((n, cards[0][f["cm"]], cards[0][f["cmf"]]), (1, 170.0, 1))


class Verify(unittest.TestCase):
    """Cotes TCGdex vérifiées avec les fichiers Cardmarket (2026-11-01, Rayquaza ☆ à 505 € au lieu de 6 985 €)."""
    FILES = cmfiles.CmFiles(
        [prod(1, "Rayquaza ex [Spiral Rush]", 200), prod(2, "Rayquaza Gold Star [Spiral Rush | Holy Star]", 200),
         prod(3, "Deoxys [Psychic]", 200), prod(4, "Pikachu [Gnaw]", 200)],
        [guide(1, 65.18, 60.0, 62.0), guide(2, 6985.88, 4162.09, 5834.62, 5000.0, holo=3312.82), guide(3, 40.0, 38.0, 39.0), guide(4, 0.5, 0.4, 0.45)],
        "2026-11-01")

    def card(self, cid, name, cm, cmv="n"):
        return row(cid, name, "ex8", cid.split("-")[1], "", "", (cm, None, cm, None, "2026-10-30", cm, None, None, cmv, 0))

    def test_card_linked_to_another_product(self):
        f = {k: i for i, k in enumerate(FIELDS)}
        cards = [self.card("ex8-107", "Rayquaza ☆", 505.34, "h")]
        n, report = fill_cardmarket(cards, {"ex8": ["Deoxys", "", "", "", "", "en"]}, {}, {"ex8-107": 1}, self.FILES, en_fetch=lambda sid: {})
        self.assertEqual(n, 1)
        self.assertEqual((cards[0][f["cm"]], cards[0][f["avg30"]], cards[0][f["cmf"]], cards[0][f["cmv"]]), (6985.88, 4162.09, 1, "n"))
        self.assertIn("autre produit", report[-1])

    def test_stale_price_of_the_same_product(self):
        f = {k: i for i, k in enumerate(FIELDS)}
        cards = [self.card("ex8-3", "Deoxys", 9.0), self.card("ex8-4", "Pikachu", 0.1)]
        n, _ = fill_cardmarket(cards, {"ex8": ["Deoxys", "", "", "", "", "en"]}, {}, {"ex8-3": 3, "ex8-4": 4}, self.FILES, en_fetch=lambda sid: {})
        self.assertEqual((n, cards[0][f["cm"]], cards[0][f["cmf"]]), (1, 40.0, 1))
        self.assertEqual((cards[1][f["cm"]], cards[1][f["cmf"]]), (0.1, 0))  # moins de 5 € : écart ignoré

    def test_delta_card_not_moved_to_the_plain_pokemon(self):
        f = {k: i for i, k in enumerate(FIELDS)}
        files = cmfiles.CmFiles([prod(5, "Raichu δ Delta Species [Zzzap]", 201), prod(6, "Raichu [Thunder]", 201)],
                                [guide(5, None, None, None, holo=59.0), guide(6, 1.3, 2.3, 2.2)], "2026-11-01")
        cards = [self.card("ex13-15", "Raichu δ", 59.26, "h")]
        n, _ = fill_cardmarket(cards, {"ex8": ["Holon", "", "", "", "", "en"]}, {}, {"ex13-15": 5}, files, en_fetch=lambda sid: {})
        self.assertEqual((n, cards[0][f["cm"]], cards[0][f["cmf"]]), (0, 59.26, 0))

    def test_volatile_trend_alone_is_not_enough(self):
        f = {k: i for i, k in enumerate(FIELDS)}
        files = cmfiles.CmFiles([prod(7, "Lugia [Aeroblast]", 202)], [guide(7, 1328.93, 825.5, 913.69)], "2026-11-01")
        cards = [row("neo1-9", "Lugia", "ex8", "9", "", "", (348.39, None, 699.55, None, "2026-10-31", 461.27, None, None, "n", 0))]
        n, _ = fill_cardmarket(cards, {"ex8": ["Neo", "", "", "", "", "en"]}, {}, {"neo1-9": 7}, files, en_fetch=lambda sid: {})
        self.assertEqual((n, cards[0][f["cm"]]), (0, 348.39))

    def test_delta_names_matched(self):
        files = cmfiles.CmFiles([prod(8, "Pikachu δ Delta Species [Zzzap]", 203), prod(9, "Pikachu [Gnaw]", 203)], [])
        self.assertEqual(files.match([("x-1", "Pikachu δ"), ("x-2", "Pikachu")], [203]), {"x-1": 8, "x-2": 9})

    def test_close_price_kept(self):
        f = {k: i for i, k in enumerate(FIELDS)}
        cards = [self.card("ex8-3", "Deoxys", 30.0)]
        n, _ = fill_cardmarket(cards, {"ex8": ["Deoxys", "", "", "", "", "en"]}, {}, {"ex8-3": 3}, self.FILES, en_fetch=lambda sid: {})
        self.assertEqual((n, cards[0][f["cm"]], cards[0][f["cmf"]]), (0, 30.0, 0))


if __name__ == "__main__":
    unittest.main()
