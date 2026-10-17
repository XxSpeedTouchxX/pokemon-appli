#!/usr/bin/env python3
"""
recon_ebay.py : reconnaissance des ventes réussies eBay (lancée à la main dans GitHub Actions, n'écrit rien).
Décision du porteur du 2026-10-18 : récupérer les ventes réussies eBay. Vérifie d'abord ce que dit robots.txt, si
eBay répond depuis un serveur GitHub, et la structure des pages de résultats (prix, dates), sur quelques cartes.
"""
import gzip
import re
import time
from urllib.error import HTTPError
from urllib.request import Request, urlopen

UA = "Mozilla/5.0 (compatible; Dropicards-prix/1.0; +https://github.com/XxSpeedTouchxX/pokemon-appli)"
QUERIES = ["Dracaufeu 4/102 30 ans", "Charizard 4/102 30th celebration", "Lugia 149/147 30th", "Mew ex 152 30th celebration"]


def get(url):
    req = Request(url, headers={"User-Agent": UA, "Accept-Language": "fr-FR,fr;q=0.9", "Accept-Encoding": "gzip"})
    try:
        with urlopen(req, timeout=40) as r:
            data = r.read()
            if r.headers.get("Content-Encoding") == "gzip":
                data = gzip.decompress(data)
            return r.status, data.decode("utf-8", "replace")
    except HTTPError as e:
        return e.code, (e.read() or b"").decode("utf-8", "replace")
    except Exception as e:  # noqa: BLE001
        return 0, str(e)


st, robots = get("https://www.ebay.fr/robots.txt")
print("robots.txt", st)
for line in robots.splitlines():
    if re.search(r"(?i)^(user-agent|disallow|allow):\s*(\*|/sch|/itm)", line.strip()):
        print("  ", line.strip())
for q in QUERIES:
    url = "https://www.ebay.fr/sch/i.html?_nkw=" + q.replace(" ", "+") + "&LH_Sold=1&LH_Complete=1&_ipg=60"
    st, html = get(url)
    prices = re.findall(r'class="s-(?:item|card)__price[^"]*"[^>]*>(?:<span[^>]*>)?([^<]{2,40})<', html)
    dates = re.findall(r'(?:Vendu le|Vendu|Sold)\s*([0-9]{1,2}\s\w+\.?\s20\d\d)', html)
    print(f"\n== {q} → HTTP {st}, {len(html)} octets, captcha={'captcha' in html.lower() or 'pardon our interruption' in html.lower()}")
    print("   prix :", prices[:12])
    print("   dates :", dates[:8])
    print("   titres :", re.findall(r'<span role="heading"[^>]*>([^<]{5,90})<', html)[:5])
    time.sleep(5)
