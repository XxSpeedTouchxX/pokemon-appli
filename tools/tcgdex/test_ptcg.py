"""Tests de ptcg.py (correspondance TCGdex → pokemontcg.io). Lancer : python3 -m unittest discover tools/tcgdex"""
import json
import tempfile
import unittest
from pathlib import Path

from ptcg import PtcgData, candidates, compact_image, fold, norm_number, same_name


def write(root, rel, obj):
    path = Path(root) / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj), "utf-8")


def card(cid, number, name, scx=False):
    set_id = cid.rsplit("-", 1)[0]
    if scx:
        images = {"small": f"https://images.scrydex.com/pokemon/{cid}/small", "large": f"https://images.scrydex.com/pokemon/{cid}/large"}
    else:
        images = {"small": f"https://images.pokemontcg.io/{set_id}/{number}.png", "large": f"https://images.pokemontcg.io/{set_id}/{number}_hires.png"}
    return {"id": cid, "number": number, "name": name, "images": images}


class Helpers(unittest.TestCase):
    def test_norm_number(self):
        self.assertEqual(norm_number("SV001"), "SV1")
        self.assertEqual(norm_number("TG01"), "TG1")
        self.assertEqual(norm_number("001"), "1")
        self.assertEqual(norm_number("%3F"), "?")
        self.assertEqual(norm_number("24a"), "24A")

    def test_candidates(self):
        self.assertIn("sm75", candidates("sm7.5"))
        self.assertIn("swsh45sv", candidates("swsh4.5sv"))
        self.assertIn("swsh12pt5gg", candidates("swsh12.5gg"))
        self.assertIn("me2pt5", candidates("me02.5"))
        self.assertIn("sv3", candidates("sv03"))
        self.assertEqual(candidates("30th-c")[0], "me55c")

    def test_names(self):
        self.assertEqual(fold("Rocket’s Scizor"), fold("Rocket's Scizor"))
        self.assertTrue(same_name("Flabébé", "Flabebe"))
        self.assertTrue(same_name("Pikachu V", "Pikachu V (Full Art)"))
        self.assertFalse(same_name("Pikachu", "Raichu"))

    def test_compact_image(self):
        self.assertEqual(compact_image(card("swsh9tg-TG01", "TG01", "Flareon")["images"]), "ptcg:swsh9tg/TG01")
        self.assertEqual(compact_image(card("me2pt5-1", "1", "Oddish", scx=True)["images"]), "scx:me2pt5-1")
        self.assertIsNone(compact_image({"small": "https://ailleurs.example/a.png", "large": "https://ailleurs.example/b.png"}))


class Data(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        root = self.tmp.name
        write(root, "sets/en.json", [
            {"id": "swsh9tg", "name": "Brilliant Stars Trainer Gallery", "releaseDate": "2022/02/25"},
            {"id": "cel25c", "name": "Celebrations: Classic Collection", "releaseDate": "2021/10/08"},
            {"id": "pop1", "name": "POP Series 1", "releaseDate": "2004/09/01"},
        ])
        write(root, "cards/en/swsh9tg.json", [card("swsh9tg-TG01", "TG01", "Flareon"), card("swsh9tg-TG02", "TG02", "Vaporeon")])
        write(root, "cards/en/cel25c.json", [card("cel25c-2", "2", "Blastoise"), card("cel25c-4", "4", "Charizard")])
        write(root, "cards/en/pop1.json", [card("pop1-1", "1", "Blastoise")])
        self.data = PtcgData(root)

    def tearDown(self):
        self.tmp.cleanup()

    def test_map_set(self):
        self.assertEqual(self.data.map_set("swsh9tg"), "swsh9tg")
        self.assertEqual(self.data.map_set("cel25cc"), "cel25c")
        self.assertEqual(self.data.map_set("inconnue", "POP Series 1", "2004-09-01"), "pop1")
        self.assertIsNone(self.data.map_set("inconnue", "Autre nom"))

    def test_image_by_number_and_name(self):
        self.assertEqual(self.data.image("swsh9tg", "TG01"), "ptcg:swsh9tg/TG01")
        self.assertEqual(self.data.image("swsh9tg", "TG01", "Flareon"), "ptcg:swsh9tg/TG01")
        # Même numéro mais autre carte : refusé.
        self.assertIsNone(self.data.image("swsh9tg", "TG01", "Jolteon"))
        # Numérotation différente (Collection Classique) : trouvée par le nom, s'il est unique.
        self.assertEqual(self.data.image("cel25c", "CC002", "Charizard"), "ptcg:cel25c/4")
        self.assertIsNone(self.data.image("cel25c", "CC009", None))


if __name__ == "__main__":
    unittest.main()
