"""Tests de fetch_news.py (sans réseau) : python3 -m unittest discover -s tools/news -v"""
import os
import sys
import unittest
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(__file__))
import fetch_news as fn  # noqa: E402

RSS = b"""<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Site</title>
<item><title>JCC Pok\xc3\xa9mon : nouveau coffret Dresseur d'\xc3\xa9lite</title><link>https://ex.fr/a?utm_source=rss&amp;id=3</link><pubDate>Tue, 17 Nov 2026 20:19:00 +0100</pubDate><description>texte long</description></item>
<item><title>Pok\xc3\xa9mon GO : Collaboration avec Duolingo !</title><link>https://ex.fr/b</link><pubDate>Wed, 18 Nov 2026 07:50:00 +0000</pubDate></item>
<item><title>Pok\xc3\xa9mon Pocket : nouveau Booster promo !</title><link>https://ex.fr/c</link><pubDate>Wed, 18 Nov 2026 08:48:00 +0000</pubDate></item>
<item><title>Sans date</title><link>https://ex.fr/d</link></item>
</channel></rss>"""
ATOM = b"""<?xml version="1.0" encoding="UTF-8"?><feed xmlns="http://www.w3.org/2005/Atom"><title>F</title>
<entry><title>Les cartes qui r\xc3\xa9unissent une lign\xc3\xa9e</title><link href="https://f.fr/x"/><published>2026-11-18T17:00:00+01:00</published></entry>
</feed>"""


class NewsTest(unittest.TestCase):
    def test_rss(self):
        items = fn.parse_feed(RSS, {"name": "Site", "tcg": None})
        self.assertEqual(len(items), 3, "article sans date ignoré")
        a = items[0]
        self.assertEqual(a["url"], "https://ex.fr/a?id=3", "paramètres utm_ retirés")
        self.assertEqual(a["date"], "2026-11-17T19:19:00Z", "date en UTC")
        self.assertTrue(a["tcg"], "titre JCC repéré")
        self.assertFalse(items[1]["tcg"], "Pokémon GO : pas JCC")
        self.assertFalse(items[2]["tcg"], "Pokémon Pocket : pas JCC")
        self.assertNotIn("description", a, "aucun texte d'article repris")

    def test_atom_and_forced_tcg(self):
        items = fn.parse_feed(ATOM, {"name": "F", "tcg": True})
        self.assertEqual(items[0]["url"], "https://f.fr/x")
        self.assertEqual(items[0]["date"], "2026-11-18T16:00:00Z")
        self.assertTrue(items[0]["tcg"])

    def test_merge(self):
        now = datetime(2026, 11, 19, tzinfo=timezone.utc)
        a = fn.parse_feed(RSS, {"name": "Site", "tcg": None})
        dup = [dict(a[0], source="Autre")]
        old = [{"title": "Vieux", "url": "https://o.fr", "date": "2026-08-01T00:00:00Z", "source": "O", "tcg": False}]
        out = fn.merge([a, dup, old], now=now)
        self.assertEqual([x["url"] for x in out], ["https://ex.fr/c", "https://ex.fr/b", "https://ex.fr/a?id=3"], "du plus récent au plus ancien, sans doublon ni article trop vieux")
        self.assertEqual(len(fn.merge([a], now=now, keep=2)), 2)


if __name__ == "__main__":
    unittest.main()
