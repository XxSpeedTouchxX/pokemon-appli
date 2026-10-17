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


if __name__ == "__main__":
    unittest.main()
