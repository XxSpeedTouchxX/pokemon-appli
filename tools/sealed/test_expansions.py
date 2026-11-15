"""Tests de expansions.py (produits officiels de chaque extension, 2026-11-15) : lecture d'une page, noms, sortes,
doublons et correspondances Cardmarket sûres. Lancés par le workflow « Catalogue scellé »."""
import json
import unittest
from pathlib import Path

import expansions as E

PAGE = """
<section id="featured-products">
<img src="https://d1i787aglh9bmb.cloudfront.net/assets/img/me-expansions/me05/collections/fr-fr/me05-etb-fr.png" alt="">
<h3>JCC Pokémon : Coffret Dresseur d’élite <em>Méga-Évolution –</em> <em>Nuit Noire</em></h3>
<img src="https://d1i787aglh9bmb.cloudfront.net/assets/img/me-expansions/me05/collections/fr-fr/me05-etb-fr.png" alt="">
<h3>JCC Pokémon : Coffret Dresseur d’élite <em>Méga-Évolution – Nuit Noire</em></h3>
<img data-src="https://d1i787aglh9bmb.cloudfront.net/assets/img/me-expansions/me05/collections/fr-fr/me05-booster-display-fr.png">
<h3>JCC Pokémon&nbsp;: présentoir de boosters <em>Méga-Évolution – Nuit Noire</em></h3>
<img src="https://d1i787aglh9bmb.cloudfront.net/assets/img/me-expansions/me05/frames/divider/divide-line-left.png">
<h3>Points forts de l’extension</h3>
</section>
"""


class Parse(unittest.TestCase):
    def test_featured_products_once_each(self):
        got = E.parse(PAGE)
        self.assertEqual([g["img"].rsplit("/", 1)[-1] for g in got], ["me05-etb-fr.png", "me05-booster-display-fr.png"])
        self.assertEqual(got[0]["name"], "JCC Pokémon : Coffret Dresseur d’élite Méga-Évolution – Nuit Noire")

    def test_page_without_products(self):
        self.assertEqual(E.parse("<h3>Rien</h3>"), [])


class Names(unittest.TestCase):
    def test_clean_name(self):
        self.assertEqual(E.clean_name("JCC Pokémon : lot de boosters _Méga-Évolution – Nuit Noire_", "me05"), "Lot de boosters Nuit Noire")
        self.assertEqual(E.clean_name("JCC Pokémon : présentoir des boosters _Méga-Évolution – Équilibre Parfait_", "me03"),
                         "Display Équilibre Parfait (36 boosters)")
        self.assertEqual(E.clean_name("JCC Pokémon : Coffret Dresseur d’élite _Méga-Évolution_", "me01"), "Coffret Dresseur d’élite Méga-Évolution")

    def test_kinds(self):
        self.assertEqual(E.kind_of("Coffret Dresseur d’élite Nuit Noire"), "ETB")
        self.assertEqual(E.kind_of("présentoir de boosters Nuit Noire"), "DSP")
        self.assertEqual(E.kind_of("Boîtier Stratégies et Combats Nuit Noire"), "DCK")
        self.assertEqual(E.kind_of("booster sous pochette Rivalités Destinées"), "BST")
        self.assertEqual(E.kind_of("Collection Ultra-Premium 151"), "UPC")
        self.assertEqual(E.kind_of("Collection poster 151"), "CFT")

    def test_black_white_split(self):
        self.assertEqual(E.set_of("sv10.5", "Coffret Dresseur d’élite Écarlate et Violet – Flamme Blanche"), "sv10.5w")
        self.assertEqual(E.set_of("sv10.5", "lot de boosters Écarlate et Violet – Foudre Noire"), "sv10.5b")

    def test_ids(self):
        self.assertEqual(E.pid("https://x/collections/fr-fr/P8972_SV03pt5_3D_ETB_FR.png"), "tcg-sv03pt5-3d-etb")
        self.assertEqual(E.pid("https://x/collections/fr-fr/me05-booster-display-fr.png"), "tcg-me05-booster-display")


class Duplicates(unittest.TestCase):
    def test_same_kind_same_set(self):
        self.assertTrue(E.same({"set": "me05", "type": "DSP", "name": "Display Nuit Noire (36 boosters)"}, "me05", "DSP", "Display Nuit Noire"))
        self.assertFalse(E.same({"set": "me04", "type": "DSP", "name": "Display Chaos Ascendant"}, "me05", "DSP", "Display Nuit Noire"))

    def test_collections_need_a_distinctive_word(self):
        figure = {"set": "sv08.5", "type": "CFT", "name": "Collection Premium avec figurine Évolutions Prismatiques"}
        self.assertFalse(E.same(figure, "sv08.5", "CFT", "Collection poster Évolutions Prismatiques"))
        alakazam = {"set": "sv03.5", "type": "CFT", "name": "Collection Alakazam-ex 151"}
        self.assertFalse(E.same(alakazam, "sv03.5", "CFT", "Collection Électhor-ex 151"))
        poster = {"set": "sv03.5", "type": "CFT", "name": "Collection poster 151"}
        self.assertTrue(E.same(poster, "sv03.5", "CFT", "Collection poster 151"))


class Cardmarket(unittest.TestCase):
    CM = [{"idProduct": i, "name": n, "fold": E.fold(n)} for i, n in [
        (1, "Pitch Black Elite Trainer Box"), (2, "Pitch Black Booster Box"), (3, "Pitch Black Booster Bundle"),
        (4, "Scarlet & Violet Elite Trainer Box: Koraidon"), (5, "Scarlet & Violet Elite Trainer Box: Miraidon"),
        (6, "Scarlet & Violet 151 Elite Trainer Box"), (7, "151 Elite Trainer Box"),
        (8, "Pitch Black Booster Bundle Display"), (9, "Pitch Black Build & Battle Box"), (10, "Pitch Black Build & Battle Box Display"),
        (11, "Pitch Black Booster Box (18 Boosters)"), (12, "Pitch Black Enhanced Booster Box"), (13, "Pitch Black Sleeved Booster"),
    ]]

    def test_sure_matches_only(self):
        self.assertEqual(E.cm_match("me05", "ETB", self.CM), [1])
        self.assertEqual(E.cm_match("me05", "DSP", self.CM), [2])
        self.assertEqual(E.cm_match("sv01", "ETB", self.CM), [4, 5])
        self.assertEqual(E.cm_match("sv03.5", "ETB", self.CM), [7])

    def test_never_a_whole_carton(self):
        # 2026-11-15 : « Booster Bundle Display », « Build & Battle Box Display », « Booster Box (18 Boosters) » écartés.
        self.assertEqual(E.cm_match("me05", "BDL", self.CM), [3])
        self.assertEqual(E.cm_match("me05", "DCK", self.CM), [9])
        self.assertEqual(E.cm_match("me05", "DSP", self.CM), [2])
        self.assertEqual(E.cm_match("me05", "BST", self.CM), [13])

    def test_collections_never_guessed(self):
        self.assertEqual(E.cm_match("me05", "CFT", self.CM), [])
        self.assertEqual(E.cm_match("me05", "TIN", self.CM), [])


class Catalogue(unittest.TestCase):
    def test_dump_keeps_layout(self):
        path = Path(E.__file__).with_name("products.json")
        text = path.read_text("utf-8")
        self.assertEqual(E.dump(json.loads(text)), text)

    def test_every_product_has_kind_and_set_or_none(self):
        prods = json.loads(Path(E.__file__).with_name("products.json").read_text("utf-8"))["products"]
        ids = [p["id"] for p in prods]
        self.assertEqual(len(ids), len(set(ids)), "identifiants en double")
        for p in prods:
            self.assertIn(p["type"], ("ETB", "UPC", "DSP", "BDL", "TIN", "BST", "DCK", "CFT"), p["id"])


if __name__ == "__main__":
    unittest.main()
