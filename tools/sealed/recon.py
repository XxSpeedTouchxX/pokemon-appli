#!/usr/bin/env python3
"""
recon.py : reconnaissance des sources du catalogue scellé, lancée une fois dans GitHub Actions.
Elle n'écrit rien : elle affiche, dans le journal du workflow, la structure de la galerie officielle
Pokémon France, d'une page produit, d'un article « produits du mois » et des fichiers publics
Cardmarket, pour écrire ensuite sync_sealed.py sur des bases vérifiées.
"""
import gzip
import json
import re
import time
from html.parser import HTMLParser
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

UA = "Mozilla/5.0 (compatible; PKM-App/1.0; +https://github.com/XxSpeedTouchxX/pokemon-appli)"
PAGES = [
    "https://www.pokemon.com/robots.txt",
    "https://www.pokemon.com/fr/jcc-pokemon/galerie-produits",
    "https://www.pokemon.com/fr/jcc-pokemon/galerie-produits/coffret-dresseur-delite-mega-evolution-flammes-fantasmagoriques",
    "https://www.pokemon.com/fr/actualites/decouvrez-tous-les-produits-du-jcc-pokemon-qui-sortiront-en-septembre-2026",
    "https://www.pokemon.com/fr/actualites/jcc-pokemon-produits-30-anniversaire",
]
CARDMARKET = [
    "https://downloads.s3.cardmarket.com/productCatalog/productList/products_nonsingles_6.json",
    "https://downloads.s3.cardmarket.com/productCatalog/priceGuide/price_guide_6.json",
]


def get(url):
    req = Request(url, headers={"User-Agent": UA, "Accept-Language": "fr-FR,fr;q=0.9", "Accept-Encoding": "gzip"})
    try:
        with urlopen(req, timeout=40) as resp:
            data = resp.read()
            if resp.headers.get("Content-Encoding") == "gzip":
                data = gzip.decompress(data)
            return resp.status, dict(resp.headers), data
    except HTTPError as e:
        return e.code, dict(e.headers or {}), e.read() or b""
    except (URLError, TimeoutError) as e:
        return 0, {}, str(e).encode()


class Tags(HTMLParser):
    def __init__(self):
        super().__init__()
        self.meta, self.imgs, self.links, self.scripts, self.heads, self._h = {}, [], [], [], [], None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "meta" and (a.get("property") or a.get("name")):
            self.meta[a.get("property") or a.get("name")] = a.get("content")
        elif tag == "img":
            self.imgs.append({k: a.get(k) for k in ("src", "data-src", "srcset", "alt") if a.get(k)})
        elif tag == "a" and a.get("href"):
            self.links.append(a["href"])
        elif tag == "script":
            self.scripts.append(a.get("src") or "(inline)")
        elif tag in ("h1", "h2", "h3"):
            self._h = tag

    def handle_data(self, data):
        if self._h and data.strip():
            self.heads.append(f"{self._h}: {data.strip()[:120]}")
            self._h = None


def show_page(url):
    print("\n" + "=" * 100 + f"\n{url}")
    status, headers, data = get(url)
    print(f"statut {status} · {len(data)} octets · type {headers.get('Content-Type')} · serveur {headers.get('Server')}")
    text = data.decode("utf-8", "replace")
    if url.endswith("robots.txt"):
        print("\n".join(l for l in text.splitlines() if l.strip())[:3000])
        return
    if status != 200:
        print(text[:800])
        return
    t = Tags()
    t.feed(text)
    print("méta :", json.dumps({k: v for k, v in t.meta.items() if k.startswith(("og:", "twitter:", "description"))}, ensure_ascii=False)[:1500])
    print("titres :", t.heads[:40])
    prod = sorted({l for l in t.links if "galerie-produits/" in l})
    print(f"liens vers des fiches produit ({len(prod)}) :", prod[:80])
    print(f"images ({len(t.imgs)}) :", json.dumps(t.imgs[:40], ensure_ascii=False)[:4000])
    print("scripts :", t.scripts[:30])
    for marker in ("__NEXT_DATA__", "__NUXT__", "window.__", "application/ld+json", "api/", "galerie-produits"):
        i = text.find(marker)
        if i >= 0:
            print(f"repère {marker!r} à {i} :", text[max(0, i - 120):i + 400].replace("\n", " "))
    dates = re.findall(r"[^<>]{0,60}(?:sortie|disponible|Disponible|Date)[^<>]{0,80}", text)
    print("mentions de date :", [d.strip() for d in dates[:20]])


def show_cardmarket(url):
    print("\n" + "=" * 100 + f"\n{url}")
    status, headers, data = get(url)
    print(f"statut {status} · {len(data)} octets · type {headers.get('Content-Type')}")
    if status != 200:
        print(data[:500])
        return
    doc = json.loads(data)
    print("clés :", list(doc.keys()) if isinstance(doc, dict) else type(doc))
    items = next((v for v in doc.values() if isinstance(v, list)), []) if isinstance(doc, dict) else doc
    print(f"{len(items)} éléments ; premier :", json.dumps(items[:2], ensure_ascii=False)[:1500])
    if items and "name" in items[0]:
        hits = [x for x in items if re.search(r"Elite Trainer|Mega Evolution|30th|Booster Box|Ultra.Premium|Bundle", x.get("name", ""), re.I)]
        print(f"exemples ({len(hits)}) :", json.dumps(hits[-40:], ensure_ascii=False)[:5000])


if __name__ == "__main__":
    for u in PAGES:
        show_page(u)
        time.sleep(1.5)
    for u in CARDMARKET:
        show_cardmarket(u)
