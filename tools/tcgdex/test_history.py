"""Tests de l'archive quotidienne des cotes (history.py)."""
import unittest

import history as H


def doc(cards, fields=("id", "set", "cm", "avg30", "avg7")):
    return {"fields": list(fields), "cards": [list(c) for c in cards]}


class TestHistory(unittest.TestCase):
    def test_mediane_comme_l_app(self):
        c = H.cotes(doc([("a", "s1", 10, 12, 30), ("b", "s1", 5, None, None), ("c", "s1", None, None, None)]))
        self.assertEqual(c["a"], ("s1", 1200))
        self.assertEqual(c["b"], ("s1", 500))
        self.assertEqual(c["c"], ("s1", None))

    def test_deux_valeurs_moyenne(self):
        self.assertEqual(H.med(10, None, 20), 15)

    def test_cote_recopiee_ignoree(self):
        c = H.cotes(doc([("a", "s1", 5550, 5000, 5100), ("b", "s1", 5550, 5000, 5100), ("d", "s2", 5550, 5000, 5100)]))
        self.assertIsNone(c["a"][1])
        self.assertIsNone(c["b"][1])
        self.assertEqual(c["d"][1], 510000)

    def test_ancien_format_sans_moyenne_7_jours(self):
        c = H.cotes(doc([("a", "s1", 8, 10)], fields=("id", "set", "cm", "avg30")))
        self.assertEqual(c["a"], ("s1", 900))

    def test_jours_ajoutes_et_remplaces(self):
        days, by_set = [], {}
        H.put(days, by_set, "2026-10-02", {"a": ("s", 100)})
        H.put(days, by_set, "2026-10-01", {"a": ("s", 90), "b": ("s", 50)})
        self.assertEqual(days, ["2026-10-01", "2026-10-02"])
        self.assertEqual(by_set["s"]["a"], [90, 100])
        self.assertEqual(by_set["s"]["b"], [50, None])
        H.put(days, by_set, "2026-10-02", {"a": ("s", 110)})
        self.assertEqual(by_set["s"]["a"], [90, 110])
        H.put(days, by_set, "2026-10-03", {"c": ("s", 7)})
        self.assertEqual(by_set["s"]["a"], [90, 110, None])
        self.assertEqual(by_set["s"]["c"], [None, None, 7])


if __name__ == "__main__":
    unittest.main()
