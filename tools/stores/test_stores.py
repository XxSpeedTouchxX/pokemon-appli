"""Tests de sync_stores.py. Lancer : python3 -m unittest discover -s tools/stores"""
import http.client
import io
import json
import tempfile
import unittest
from pathlib import Path
from unittest import mock

import sync_stores
from sync_stores import FIELDS, MAX_BYTES, Communes, Departments, build, classify, contact, render, with_district

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


def square(code, name, w, s, e, n):
    return {"type": "Feature", "properties": {"code": code, "nom": name},
            "geometry": {"type": "Polygon", "coordinates": [[[w, s], [e, s], [e, n], [w, n], [w, s]]]}}


def communes(*features, names=None):
    with tempfile.TemporaryDirectory() as d:
        path, npath = Path(d) / "communes.geojson", Path(d) / "noms.json"
        path.write_text(json.dumps({"type": "FeatureCollection", "features": list(features)}), "utf-8")
        npath.write_text(json.dumps(names or []), "utf-8")
        return Communes(path, npath if names else None)


# Deux communes du Rhône côte à côte (carrés de 0,02° de côté), une de l'Ain, une commune sans contour.
RHONE = communes(square("69123", "Lyon", 4.82, 45.75, 4.84, 45.77), square("69266", "Villeurbanne", 4.84, 45.75, 4.86, 45.77),
                 square("01001", "L'Abergement-Clémenciat", 4.82, 45.75, 4.84, 45.77),
                 {"type": "Feature", "properties": {"code": "69999", "nom": "Sans contour"}, "geometry": None})


class Commune(unittest.TestCase):
    def test_locate(self):
        self.assertEqual(RHONE.locate(4.83, 45.76, "69"), "Lyon")
        self.assertEqual(RHONE.locate(4.85, 45.76, "69"), "Villeurbanne")
        self.assertEqual(RHONE.locate(4.83, 45.76, "01"), "L'Abergement-Clémenciat")  # seules les communes du département
        self.assertEqual(RHONE.locate(4.83, 45.776, "69"), "Lyon")  # juste au nord (0,7 km) : la plus proche
        self.assertIsNone(RHONE.locate(4.83, 45.85, "69"))  # à 9 km de toute commune
        self.assertIsNone(RHONE.locate(4.83, 45.76, "75"))

    def test_official_name(self):
        # Les contours donnent « Havre » ; le code officiel géographique, « Le Havre ».
        c = communes(square("76351", "Havre", 0.0, 49.4, 0.2, 49.6),
                     names=[{"code": "76351", "nom": "Le Havre", "type": "commune-actuelle"}])
        self.assertEqual(c.locate(0.1, 49.5, "76"), "Le Havre")
        self.assertEqual(c.named, 1)
        self.assertEqual(communes(square("76351", "Havre", 0.0, 49.4, 0.2, 49.6)).locate(0.1, 49.5, "76"), "Havre")

    def test_district(self):
        self.assertEqual(with_district("Lyon", "69002"), "Lyon 2e")
        self.assertEqual(with_district("Paris", "75116"), "Paris 16e")
        self.assertEqual(with_district("Paris", "75001"), "Paris 1er")
        self.assertEqual(with_district("Marseille", "13016"), "Marseille 16e")
        self.assertEqual(with_district("Lyon", ""), "Lyon")
        self.assertEqual(with_district("Lyon", "69100"), "Lyon")  # code postal de Villeurbanne : pas d'arrondissement
        self.assertEqual(with_district("Villeurbanne", "69100"), "Villeurbanne")

    def test_build_city(self):
        f = {k: i for i, k in enumerate(FIELDS)}
        elements = [
            node(1, 45.76, 4.83, name="Game Spirit", shop="video_games", **{"addr:housenumber": "23", "addr:street": "Quai Jean Moulin", "addr:postcode": "69002"}),
            node(2, 45.76, 4.85, name="Ludik", shop="games", **{"addr:city": "Villeurbanne"}),
            node(3, 45.76, 4.851, name="Sans ville", shop="toys"),
        ]
        rows, _ = build(elements, DEPTS, RHONE)
        by = {r[0]: r for r in rows}
        self.assertEqual(by["n1"][f["ville"]], "Lyon 2e")  # commune par la position, arrondissement par le code postal
        self.assertEqual(by["n1"][f["adresse"]], "23 Quai Jean Moulin, 69002 Lyon")  # adresse complétée par la commune
        self.assertEqual(by["n2"][f["ville"]], "Villeurbanne")  # addr:city d'OSM d'abord
        self.assertEqual(by["n3"][f["ville"]], "Villeurbanne")
        rows, _ = build(elements, DEPTS)  # sans contours : addr:city seulement
        self.assertEqual({r[0]: r[f["ville"]] for r in rows}, {"n1": "", "n2": "Villeurbanne", "n3": ""})


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
        # 4 500 boutiques (10 % de plus qu'en octobre 2026), toutes avec leur ville, deux tiers avec toutes leurs
        # coordonnées (en réalité : site 60 %, horaires 69 %, adresse 34 %), tiennent dans la limite de taille.
        full = ["n12345678", "Boutique de cartes du centre", "cartes", 45.7578, 4.832, "69", "Villeurbanne", "", 1,
                "https://www.boutique-exemple.fr/", "+33 4 78 12 34 56", "Tu-Sa 10:00-12:30,14:00-19:00", "12 Rue de la République, 69100 Villeurbanne"]
        bare = full[:9] + ["", "", "", ""]
        self.assertLess(len(render([full] * 3000 + [bare] * 1500).encode("utf-8")), MAX_BYTES)




class Overpass(unittest.TestCase):
    def test_tiles_cover_france(self):
        boxes = [[float(v) for v in b.split(",")] for b in sync_stores.TILES]
        self.assertEqual(len(boxes), 6)
        self.assertEqual((min(b[0] for b in boxes), min(b[1] for b in boxes), max(b[2] for b in boxes), max(b[3] for b in boxes)),
                         (41.3, -5.3, 51.2, 9.7))
        self.assertIn("(area.fr)(" + sync_stores.TILES[2] + ")", sync_stores.query(sync_stores.TILES[2]))

    def test_next_server_after_disconnect(self):
        # Le premier serveur coupe la connexion sans répondre : le suivant est essayé, puis gardé pour les tuiles
        # suivantes. Un élément présent dans toutes les tuiles n'est gardé qu'une fois.
        calls = []

        def fake_urlopen(req, timeout):
            calls.append(req.full_url)
            if len(calls) == 1:
                raise http.client.RemoteDisconnected("Remote end closed connection without response")
            answer = io.BytesIO(json.dumps({"elements": [{"type": "way", "id": 1}, {"type": "node", "id": len(calls)}]}).encode())
            return mock.MagicMock(__enter__=lambda s: answer, __exit__=lambda *a: False)

        with mock.patch.object(sync_stores, "urlopen", fake_urlopen), mock.patch.object(sync_stores.time, "sleep"):
            doc = sync_stores.overpass()
        tiles = len(sync_stores.TILES)
        self.assertEqual(len(doc["elements"]), 1 + tiles)
        self.assertEqual(calls, sync_stores.ENDPOINTS[:2] + [sync_stores.ENDPOINTS[1]] * (tiles - 1))

    def test_partial_answer_retried(self):
        # Requête interrompue côté serveur (« remark ») : réponse incomplète, le serveur suivant est essayé.
        calls = []

        def fake_urlopen(req, timeout):
            calls.append(req.full_url)
            body = {"elements": [{"type": "node", "id": 1}]}
            if len(calls) == 1:
                body["remark"] = "runtime error: Query timed out"
            answer = io.BytesIO(json.dumps(body).encode())
            return mock.MagicMock(__enter__=lambda s: answer, __exit__=lambda *a: False)

        with mock.patch.object(sync_stores, "urlopen", fake_urlopen), mock.patch.object(sync_stores.time, "sleep"):
            sync_stores.overpass()
        self.assertEqual(calls[:2], sync_stores.ENDPOINTS[:2])

    def test_deadline(self):
        # Serveurs muets : on abandonne avant l'échéance (le job GitHub est coupé à 60 min), avec un message.
        clock = [0.0]
        timeouts = []

        def fake_urlopen(req, timeout):
            timeouts.append(timeout)
            clock[0] += timeout
            raise TimeoutError("The read operation timed out")

        def fake_sleep(s):
            clock[0] += s

        with mock.patch.object(sync_stores, "urlopen", fake_urlopen), \
                mock.patch.object(sync_stores.time, "sleep", fake_sleep), \
                mock.patch.object(sync_stores.time, "monotonic", lambda: clock[0]):
            with self.assertRaises(SystemExit) as e:
                sync_stores.overpass(deadline=1000)
        self.assertIn("tuile 1/6 sans réponse", str(e.exception.code))
        self.assertLessEqual(clock[0], 1000)
        self.assertEqual(timeouts, [360, 360, 220])


if __name__ == "__main__":
    unittest.main()
