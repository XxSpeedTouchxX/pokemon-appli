"""Tests de sync_stores.py. Lancer : python3 -m unittest discover -s tools/stores"""
import unittest

from sync_stores import FIELDS, MAX_BYTES, Departments, build, classify, contact, render

DEPTS = Departments()


def node(i, lat, lon, **tags):
    return {"type": "node", "id": i, "lat": lat, "lon": lon, "tags": tags}


class Classify(unittest.TestCase):
    def test_brands(self):
        self.assertEqual(classify({"name": "Fnac Bellecour", "shop": "books", "brand:wikidata": "Q676585"}), ("culture", "Fnac"))
        self.assertEqual(classify({"name": "Micromania-Zing", "shop": "video_games", "brand:wikidata": "Q3312221"}), ("jv", "Micromania-Zing"))
        self.assertEqual(classify({"name": "E.Leclerc Espace Culturel", "shop": "books", "brand:wikidata": "Q1273376"}),
                         ("culture", "Espace Culturel E.Leclerc"))

    def test_hypermarkets_only(self):
        self.assertEqual(classify({"name": "E.Leclerc", "shop": "supermarket", "brand:wikidata": "Q1273376"}), ("hyper", "E.Leclerc"))
        self.assertIsNone(classify({"name": "E.Leclerc Express", "shop": "supermarket", "brand:wikidata": "Q1273376"}))
        self.assertIsNone(classify({"name": "E.Leclerc Drive", "shop": "supermarket", "brand:wikidata": "Q1273376"}))
        self.assertIsNone(classify({"name": "Carrefour Market", "shop": "supermarket", "brand:wikidata": "Q217599"}))
        self.assertIsNone(classify({"name": "Station E.Leclerc", "shop": "car_repair", "brand:wikidata": "Q1273376"}))
        self.assertEqual(classify({"name": "Auchan", "shop": "supermarket", "brand:wikidata": "Q758603"}), ("hyper", "Auchan"))
        self.assertIsNone(classify({"name": "Auchan Supermarché", "shop": "supermarket", "brand:wikidata": "Q758603"}))

    def test_independent_shops(self):
        self.assertEqual(classify({"name": "Le Dé Pipé", "shop": "games"}), ("jeux", ""))
        self.assertEqual(classify({"name": "Manga Café", "shop": "anime"}), ("bd", ""))
        self.assertEqual(classify({"name": "Cartes & Co", "shop": "trading_cards"}), ("cartes", ""))

    def test_excluded(self):
        self.assertIsNone(classify({"shop": "games"}))  # sans nom
        self.assertIsNone(classify({"name": "Warhammer", "shop": "games"}))
        self.assertIsNone(classify({"name": "LEGO Store", "shop": "toys"}))
        self.assertIsNone(classify({"name": "Ancien magasin", "shop": "toys", "disused:shop": "toys"}))
        self.assertIsNone(classify({"name": "Boulangerie", "shop": "bakery"}))


class Locate(unittest.TestCase):
    def test_departments(self):
        self.assertEqual(DEPTS.locate(2.3522, 48.8566), "75")  # Paris
        self.assertEqual(DEPTS.locate(4.8357, 45.7640), "69")  # Lyon
        self.assertEqual(DEPTS.locate(8.7386, 41.9192), "2A")  # Ajaccio
        self.assertEqual(DEPTS.locate(9.4500, 42.7000), "2B")  # Bastia
        self.assertEqual(DEPTS.locate(-4.4861, 48.3904), "29")  # Brest
        self.assertEqual(DEPTS.region["69"], "84")

    def test_outside_contours(self):
        # Île d'Ouessant, hors des contours simplifiés : rattachée par son code postal.
        self.assertEqual(DEPTS.locate(-5.0960, 48.4580, "29242"), "29")
        # Ajaccio par code postal (20000 → Corse-du-Sud), Bastia (20200 → Haute-Corse).
        self.assertEqual(DEPTS.locate(8.30, 41.90, "20000"), "2A")
        self.assertEqual(DEPTS.locate(9.60, 42.70, "20200"), "2B")
        # En pleine mer, loin de tout : écarté.
        self.assertIsNone(DEPTS.locate(-7.0, 46.0))


class Build(unittest.TestCase):
    def test_build(self):
        elements = [
            node(1, 45.7578, 4.8320, name="Fnac Bellecour", shop="books", **{"brand:wikidata": "Q676585", "addr:city": "Lyon"}),
            {"type": "way", "id": 2, "center": {"lat": 45.7579, "lon": 4.8321}, "tags": {"name": "Fnac Bellecour", "shop": "books", "brand:wikidata": "Q676585"}},
            node(3, 48.8530, 2.3499, name="Le Temple des Cartes", shop="games", description="Cartes Pokémon et Magic"),
            node(4, 48.8600, 2.3500, name="Warhammer", shop="games"),
            node(5, 46.0, -7.0, name="Bateau", shop="toys"),
        ]
        rows, skipped = build(elements, DEPTS)
        self.assertEqual([r[0] for r in rows], ["w2", "n3"])  # le bâtiment est préféré au point en double
        fnac = rows[0]
        self.assertEqual((fnac[2], fnac[5], fnac[6], fnac[7]), ("culture", "69", "Lyon", "Fnac"))
        self.assertEqual(rows[1][8], 1)  # indice « cartes » repéré dans la description
        self.assertEqual(skipped, {"écartés": 1, "hors France": 1, "doublons": 1})
        self.assertEqual(len(fnac), len(FIELDS))

    def test_twins_share_contacts(self):
        elements = [
            node(1, 45.7578, 4.8320, name="Ludik & Co", shop="games", phone="+33 4 78 00 00 00"),
            {"type": "way", "id": 2, "center": {"lat": 45.7579, "lon": 4.8321},
             "tags": {"name": "Ludik & Co", "shop": "games", "website": "ludik.example.fr", "opening_hours": "Tu-Sa 10:00-19:00"}},
        ]
        rows, _ = build(elements, DEPTS)
        f = {k: i for i, k in enumerate(FIELDS)}
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0][f["site"]], "https://ludik.example.fr")
        self.assertEqual(rows[0][f["tel"]], "+33 4 78 00 00 00")  # repris du point en double
        self.assertEqual(rows[0][f["horaires"]], "Tu-Sa 10:00-19:00")


class Contact(unittest.TestCase):
    def test_clean(self):
        site, tel, hours, address = contact({"contact:website": "www.ludik.fr/ ; https://autre.fr", "phone": "04 78 12 34 56;06 00 00 00 00",
                                             "opening_hours": "Mo-Sa  10:00-19:00", "addr:housenumber": "12", "addr:street": "Rue de la Paix",
                                             "addr:postcode": "69002", "addr:city": "Lyon"})
        self.assertEqual(site, "https://www.ludik.fr/")
        self.assertEqual(tel, "04 78 12 34 56")
        self.assertEqual(hours, "Mo-Sa 10:00-19:00")
        self.assertEqual(address, "12 Rue de la Paix, 69002 Lyon")

    def test_rejected(self):
        self.assertEqual(contact({"website": "pas un site", "phone": "appeler", "opening_hours": "x" * 200, "addr:city": "Lyon"}), ["", "", "", ""])
        self.assertEqual(contact({}), ["", "", "", ""])

    def test_size_budget(self):
        # 4 500 boutiques aux coordonnées complètes tiennent dans la limite de taille.
        row = ["n12345678", "Boutique de cartes du centre", "cartes", 45.7578, 4.832, "69", "Lyon", "", 1,
               "https://www.boutique-exemple.fr/", "+33 4 78 12 34 56", "Tu-Sa 10:00-12:30,14:00-19:00", "12 Rue de la République, 69002 Lyon"]
        self.assertLess(len(render([row] * 4500).encode("utf-8")), MAX_BYTES)


if __name__ == "__main__":
    unittest.main()
