"""Tests de ptcg.py (correspondance TCGdex → pokemontcg.io). Lancer : python3 -m unittest discover -s tools/tcgdex

Les cartes de test_ptcg_fixtures.json sont des extraits réels du dépôt pokemon-tcg-data (Collection Classique
avec plusieurs cartes au même numéro, kit du dresseur Posipi, Zarbi « ? »).
"""
import json
import tempfile
import unittest
from pathlib import Path

from ptcg import PtcgData, agrees, candidates, compact_image, fold, norm_number, same_name

FIXTURES = json.loads(Path(__file__).with_name("test_ptcg_fixtures.json").read_text("utf-8"))


class Helpers(unittest.TestCase):
    def test_norm_number(self):
        self.assertEqual(norm_number("SV001"), "SV1")
        self.assertEqual(norm_number("TG01"), "TG1")
        self.assertEqual(norm_number("001"), "1")
        self.assertEqual(norm_number("%3F"), "?")

    def test_candidates(self):
        self.assertIn("sm75", candidates("sm7.5"))
        self.assertIn("swsh45sv", candidates("swsh4.5sv"))
        self.assertIn("swsh12pt5gg", candidates("swsh12.5gg"))
        self.assertIn("me2pt5", candidates("me02.5"))
        self.assertIn("sv3", candidates("sv03"))
        self.assertEqual(candidates("30th-c")[0], "me55c")

    def test_names(self):
        self.assertEqual(fold("Rocket’s Scizor"), fold("Rocket's Scizor"))
        self.assertTrue(same_name("Pikachu V (Full Art)", "Pikachu V"))
        self.assertFalse(same_name("Pikachu", "Pikachu V"))
        self.assertFalse(same_name("", "Pikachu"))

    def test_agrees(self):
        beldum = FIXTURES["tk2a"][0]
        self.assertTrue(agrees(beldum, dex=[374], artist="Kouki Saitou"))
        self.assertFalse(agrees(beldum, dex=[355]))  # Terhal (Pokédex 355) n’est pas Beldum (374)
        self.assertIsNone(agrees(beldum))

    def test_compact_image(self):
        self.assertEqual(compact_image(FIXTURES["tk2a"][0]["images"]), "ptcg:tk2a/1")
        self.assertIsNone(compact_image({"small": "https://images.scrydex.com/pokemon/me2pt5-1/small", "large": "https://images.scrydex.com/pokemon/me2pt5-1/large"}))


class Data(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        root = Path(self.tmp.name)
        (root / "cards" / "en").mkdir(parents=True)
        (root / "sets").mkdir()
        sets = [{"id": k, "name": k, "releaseDate": "2000/01/01"} for k in FIXTURES]
        (root / "sets" / "en.json").write_text(json.dumps(sets), "utf-8")
        for k, cards in FIXTURES.items():
            (root / "cards" / "en" / (k + ".json")).write_text(json.dumps(cards), "utf-8")
        self.data = PtcgData(root)

    def tearDown(self):
        self.tmp.cleanup()

    def test_map_set(self):
        self.assertEqual(self.data.map_set("cel25cc"), "cel25c")
        self.assertEqual(self.data.map_set("tk-ex-p"), "tk2a")
        self.assertEqual(self.data.map_set("exu"), "ex10")

    def test_duplicate_numbers_are_kept(self):
        # Quatre cartes portent le numéro 15 : la bonne est trouvée par son Pokédex et son illustrateur.
        card, state = self.data.match("cel25c", "CC003", dex=[3], artist="Mitsuhiro Arita")
        self.assertEqual((card["name"], state), ("Venusaur", True))
        card, state = self.data.match("cel25c", "CC009", dex=[145])
        self.assertEqual((card["name"], state), ("Rocket's Zapdos", True))

    def test_wrong_card_with_same_number_is_rejected(self):
        # Kit du dresseur : le n° 1 français (Terhal, Pokédex 355) n'est pas le n° 1 anglais (Terhal ≠ Beldum).
        card, state = self.data.match("tk2a", "1", dex=[355], artist="Masakazu Fukuda")
        self.assertIsNone(card)
        self.assertFalse(state)

    def test_unverifiable_same_number(self):
        card, state = self.data.match("tk2a", "2")
        self.assertEqual(card["name"], "Electrike")
        self.assertIsNone(state)

    def test_url_encoded_number(self):
        card, state = self.data.match("ex10", "%3F", dex=[201])
        self.assertEqual((card["number"], state), ("?", True))


if __name__ == "__main__":
    unittest.main()
