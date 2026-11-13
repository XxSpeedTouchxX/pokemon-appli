"""Tests des prix Cardmarket des fichiers publics (cmfiles.py, fill_cardmarket). Lancer :
python3 -m unittest discover -s tools/tcgdex -p 'test_*.py'"""
import unittest
from datetime import date, timedelta

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

    def test_same_name_plus_longer_name(self):
        # 2026-11-08 : Palkia du 30ᵉ (0,07 €) et Palkia LV.X de la Collection Classique (12,21 €).
        files = cmfiles.CmFiles([prod(30, "Palkia [Wormhole | 30]"), prod(31, "Palkia LV.X [Restructure | Hydro Reflect]")], [])
        m = files.match([("30th-020", "Palkia"), ("30th-c-022", "Palkia")], [6601])
        self.assertEqual((m["30th-020"], m["30th-c-022"]), (30, 31))
        # Le compte ne tombe pas juste : rien plutôt qu'un mauvais produit.
        self.assertEqual(files.match([("a", "Palkia"), ("b", "Palkia"), ("c", "Palkia")], [6601]), {})

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
        old[f["cm"]], old[f["cmf"]], old[f["upd"]] = 170.0, 1, date.today().isoformat()
        n, _ = fill_cardmarket(cards, {}, {}, {}, None, {"fields": FIELDS, "cards": [old]})
        self.assertEqual((n, cards[0][f["cm"]], cards[0][f["cmf"]]), (1, 170.0, 1))

    def test_old_yesterday_dropped(self):
        # Prix repris plus de 7 jours (Palkia de la Classique, repris du 17 octobre au 7 novembre 2026) : abandonné.
        f = {k: i for i, k in enumerate(FIELDS)}
        cards = [row("30th-c-022", "Palkia", "30th-c", "022", "", "", NONE)]
        old = list(cards[0])
        old[f["cm"]], old[f["cmf"]], old[f["upd"]] = 0.06, 1, (date.today() - timedelta(days=8)).isoformat()
        n, _ = fill_cardmarket(cards, {}, {}, {}, None, {"fields": FIELDS, "cards": [old]})
        self.assertEqual((n, cards[0][f["cm"]]), (0, None))


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

    def test_30th_reprint_linked_by_tcgdex_to_the_wrong_product(self):
        # 2026-11-08 : TCGdex donne au Palkia LV.X de la Collection Classique le prix du Palkia du set principal.
        f = {k: i for i, k in enumerate(FIELDS)}
        files = cmfiles.CmFiles([prod(30, "Palkia [Wormhole | 30]"), prod(31, "Palkia LV.X [Restructure | Hydro Reflect]")],
                                [guide(30, 0.07, 0.07, 0.07), guide(31, 12.21, 12.45, 12.65, 8)], "2026-11-07")
        cards = [row("30th-020", "Palkia", "30th", "020", "", "", (0.06, None, 0.11, None, "2026-11-07", 0.08, None, None, "n", 0)),
                 row("30th-c-022", "Palkia", "30th-c", "022", "", "", (0.06, None, 0.11, None, "2026-11-07", 0.08, None, None, "n", 0))]
        n, _ = fill_cardmarket(cards, {}, {"30th-020": "Palkia", "30th-c-022": "Palkia"}, {"30th-020": 30, "30th-c-022": 30}, files, en_fetch=lambda sid: {})
        self.assertEqual((cards[1][f["cm"]], cards[1][f["avg30"]], cards[1][f["cmf"]]), (12.21, 12.45, 1))
        self.assertEqual((cards[0][f["cm"]], cards[0][f["cmf"]]), (0.06, 0))  # bien relié par TCGdex : inchangé

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


class Missing(unittest.TestCase):
    """Cartes sans cote alors que Cardmarket en a une (2026-11-11, porteur : Groudon ☆ d'EX Espèces Delta, 111/113)."""
    F = {k: i for i, k in enumerate(FIELDS)}

    def card(self, cid, name, sid, p=NONE, cmid=None):
        return row(cid, name, sid, cid.split("-")[-1], "", "", p, cmid=cmid)

    def priced(self, cm):
        return (cm, None, cm, None, "2026-11-10", cm, None, None, "n", 0)

    def test_star_written_star_in_english(self):
        # TCGdex : « Groudon Star » en anglais, Cardmarket : « Groudon Gold Star » (produit 276874, DS 111).
        f = self.F
        files = cmfiles.CmFiles([prod(276874, "Groudon Gold Star", 1500), prod(276875, "Kyogre Gold Star", 1500),
                                 prod(276876, "Metagross Gold Star", 1500), prod(276800, "Groudon ex [Dual]", 1500)]
                                + [prod(276700 + i, f"Card {i}", 1500) for i in range(3)],
                                [guide(276874, 1180.0, 1105.5, 1290.0, 899.0), guide(276875, 950.0, 990.0, 940.0)], "2026-11-11")
        cards = [self.card("ex11-111", "Groudon ☆", "ex11"), self.card("ex11-112", "Kyogre ☆", "ex11"),
                 self.card("ex11-113", "Metalosse ☆", "ex11")]
        cards += [self.card(f"ex11-{i}", f"Carte {i}", "ex11", self.priced(1.0), 276700 + i) for i in range(3)]
        en = {"ex11-111": "Groudon Star", "ex11-112": "Kyogre Star", "ex11-113": "Metagross Star"}
        ids = {f"ex11-{i}": 276700 + i for i in range(3)}
        n, report = fill_cardmarket(cards, {"ex11": ["EX Espèces Delta", "", "", "", 113, "fr"]}, en, ids, files, en_fetch=lambda sid: {})
        g = {c[f["id"]]: c for c in cards}
        self.assertEqual((g["ex11-111"][f["cm"]], g["ex11-111"][f["avg30"]], g["ex11-111"][f["cmf"]]), (1180.0, 1105.5, 1))
        self.assertEqual((g["ex11-111"][f["cmid"]], g["ex11-111"][f["en"]]), (276874, "Groudon Star"))
        self.assertEqual(g["ex11-112"][f["cm"]], 950.0)
        # Metagross : produit trouvé, sans prix ce jour-là : pas de cote inventée, mais le lien direct est connu.
        self.assertEqual((g["ex11-113"][f["cm"]], g["ex11-113"][f["cmid"]]), (None, 276876))
        self.assertEqual(report[0], "ex11 2/3")

    def test_gold_only_after_plain_name(self):
        self.assertEqual(cmfiles.gold("groudon star"), "groudon gold star")
        self.assertIsNone(cmfiles.gold("rayquaza gold star"))
        self.assertIsNone(cmfiles.gold("tapu koko prism star"))
        files = cmfiles.CmFiles([prod(1, "Star Piece", 7), prod(2, "Lucky Star", 7)], [])
        self.assertEqual(files.match([("a", "Lucky Star"), ("b", "Star Piece")], [7]), {"a": 2, "b": 1})

    def test_spellings_brackets_and_word_order(self):
        files = cmfiles.CmFiles([prod(1, "M Charizard EX", 8), prod(2, "MCharizard EX", 8),
                                 prod(3, "Professor's Research [Professor Magnolia]", 8), prod(4, "Rainbow Energy Delta", 8)], [])
        m = files.match([("xy2-13", "M Charizard EX"), ("xy2-69", "M Charizard EX"),
                         ("swsh1-178", "Professor's Research Professor Magnolia"), ("ex13-98", "δ Rainbow Energy")], [8])
        self.assertEqual(m, {"xy2-13": 1, "xy2-69": 2, "swsh1-178": 3, "ex13-98": 4})

    def test_linked_products_set_aside_and_late_oversized_dropped(self):
        # Flashfire : 4 MCharizard EX (13, 69, 107, 108) sans lien TCGdex + une version « Oversized » ajoutée bien plus
        # tard ; Charizard EX 12 relié par TCGdex. Sans la mise à l'écart : 5 produits pour 4 cartes, aucun prix.
        files = cmfiles.CmFiles([prod(100, "Charizard EX", 9), prod(101, "MCharizard EX", 9), prod(102, "MCharizard EX", 9),
                                 prod(150, "MCharizard EX", 9), prod(151, "MCharizard EX", 9), prod(900, "MCharizard EX", 9),
                                 prod(160, "Charizard EX", 9)], [])
        cards = [("xy2-11", "Charizard EX"), ("xy2-12", "Charizard EX"), ("xy2-13", "M Charizard EX"), ("xy2-69", "M Charizard EX"),
                 ("xy2-107", "M Charizard EX"), ("xy2-108", "M Charizard EX")]
        m = files.match(cards, [9], trusted={"xy2-12": 160})
        self.assertEqual((m["xy2-11"], m["xy2-12"]), (100, 160))  # le produit relié n'est pas donné à une autre carte
        self.assertEqual([m[k] for k in ("xy2-13", "xy2-69", "xy2-107", "xy2-108")], [101, 102, 150, 151])
        self.assertEqual(files.match(cards[2:], [9]), {})  # sans repère TCGdex : 5 produits, 4 cartes, rien

    def test_shiny_vault_matched_with_its_parent_set(self):
        # Destinées Occultes Coffre Étincelant (sma) : vendu par Cardmarket dans « Hidden Fates », avec sm115.
        f = self.F
        files = cmfiles.CmFiles([prod(200 + i, f"Card {i}", 2600) for i in range(3)]
                                + [prod(210, "Charizard GX", 2600), prod(211, "Charizard GX", 2600), prod(212, "Rowlet", 2600)],
                                [guide(211, 437.98, 559.34, 480.0), guide(212, 1.2, 1.1, 1.0), guide(210, 90.0, 88.0, 92.0)], "2026-11-11")
        cards = [self.card(f"sm115-{i}", f"Carte {i}", "sm115", self.priced(1.0), 200 + i) for i in range(3)]
        cards += [self.card("sm115-9", "Dracaufeu GX", "sm115", self.priced(91.0), 210),
                  self.card("sma-SV1", "Brindibou", "sma"), self.card("sma-SV49", "Dracaufeu GX", "sma")]
        en = {"sm115-9": "Charizard-GX", "sma-SV1": "Rowlet", "sma-SV49": "Charizard-GX"}
        ids = {f"sm115-{i}": 200 + i for i in range(3)}
        ids["sm115-9"] = 210
        n, report = fill_cardmarket(cards, {}, en, ids, files, en_fetch=lambda sid: {})
        g = {c[f["id"]]: c for c in cards}
        self.assertEqual((g["sma-SV49"][f["cm"]], g["sma-SV49"][f["cmid"]]), (437.98, 211))
        self.assertEqual(g["sma-SV1"][f["cm"]], 1.2)
        self.assertEqual((g["sm115-9"][f["cm"]], g["sm115-9"][f["cmf"]]), (91.0, 0))  # relié par TCGdex : inchangé
        self.assertIn("sm115+sma 2/2", report)

    def test_product_shared_by_several_cards(self):
        # TCGdex relie Dracaufeu d'Expedition 6 (holo) et 39 au même produit : l'app ne les cotait pas (« dup »).
        f = self.F
        files = cmfiles.CmFiles([prod(300, "Charizard [Burning Tail]", 31), prod(301, "Charizard [Burning Tail]", 31),
                                 prod(302, "Groudon", 31), prod(303, "Groudon", 31), prod(304, "Groudon", 31), prod(305, "Mew", 31)],
                                [guide(300, 554.38, 520.0, 540.0), guide(301, 60.0, 58.0, 61.0)], "2026-11-11")
        cards = [self.card("ecard1-6", "Dracaufeu", "ecard1", self.priced(554.38), 300),
                 self.card("ecard1-39", "Dracaufeu", "ecard1", self.priced(554.38), 300),
                 self.card("ecard1-50", "Groudon", "ecard1", self.priced(2.0), 302),
                 self.card("ecard1-51", "Groudon", "ecard1", self.priced(2.0), 302),
                 self.card("ecard1-60", "Mew", "ecard1", self.priced(3.0), 305)]
        en = {"ecard1-6": "Charizard", "ecard1-39": "Charizard", "ecard1-50": "Groudon", "ecard1-51": "Groudon", "ecard1-60": "Mew"}
        ids = {"ecard1-6": 300, "ecard1-39": 300, "ecard1-50": 302, "ecard1-51": 302, "ecard1-60": 305}
        n, report = fill_cardmarket(cards, {}, en, ids, files, en_fetch=lambda sid: {})
        g = {c[f["id"]]: c for c in cards}
        self.assertEqual((g["ecard1-6"][f["cm"]], g["ecard1-6"][f["cmf"]], g["ecard1-6"][f["cmid"]]), (554.38, 0, 300))
        self.assertEqual((g["ecard1-39"][f["cm"]], g["ecard1-39"][f["cmf"]], g["ecard1-39"][f["cmid"]]), (60.0, 1, 301))
        # 3 produits Groudon pour 2 cartes : rien de sûr, prix de TCGdex gardés, mais plus de lien direct douteux.
        self.assertEqual((g["ecard1-50"][f["cm"]], g["ecard1-50"][f["cmid"]], g["ecard1-51"][f["cmid"]]), (2.0, None, None))
        self.assertEqual(g["ecard1-60"][f["cmid"]], 305)
        self.assertIn("liens TCGdex partagés corrigés 1 : ecard1-39", report)

    def test_row_keeps_english_name_only_when_different(self):
        f = self.F
        self.assertEqual(FIELDS[-3:], ["cmid", "en", "c30"])
        self.assertEqual(row("ex11-111", "Groudon ☆", "ex11", "111", "", "", NONE, cmid=5, en="Groudon Star")[f["en"]], "Groudon Star")
        self.assertEqual(row("lc-7", "Dark Raichu", "lc", "7", "", "", NONE, en="Dark Raichu")[f["en"]], "")


if __name__ == "__main__":
    unittest.main()
