#!/usr/bin/env python3
"""News Pokémon de « Le coin des dresseurs » (2026-11-18, porteur : « fais apparaître en bas de la frise les news
Pokémon du moment »).

Lit les flux RSS publics de sites d'actualité Pokémon francophones et écrit web/data/news.json : pour chaque
article, seulement le titre, la date, le nom du site et le lien (l'article s'ouvre sur son site ; aucun texte ni
image n'est repris). Sources (vérifiées le 19/11/2026) :
  - Pokébip (jeux vidéo, Pokémon GO, JCC Pocket, un peu de JCC) : https://www.pokebip.com/news.rss
  - Margxt, rubrique JCC Pokémon : https://www.margxt.fr/category/actualites/jcc-pokemon/feed/
Écartés : PokéCardex et PocketMonsters.net (leurs conditions interdisent la reprise sans accord écrit), PokeBeach
(liens vers le forum et dates remises à jour à chaque réponse), Pokémon Trash (flux arrêté), pokemon.com (aucun flux).
Un flux qui ne répond pas est ignoré ; si aucun ne répond, le fichier publié n'est pas modifié.
Usage : python3 tools/news/fetch_news.py [--out web/data/news.json]
"""
import argparse
import email.utils
import json
import re
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone

FEEDS = [
    {"name": "Pokébip", "url": "https://www.pokebip.com/news.rss", "site": "https://www.pokebip.com", "tcg": None},
    {"name": "Margxt", "url": "https://www.margxt.fr/category/actualites/jcc-pokemon/feed/", "site": "https://www.margxt.fr", "tcg": True},
]
KEEP = 30          # articles gardés au plus
MAX_DAYS = 45      # plus vieux : retirés
UA = "DropicardsNews/1.0 (+https://dropicards.fr)"
# JCC (cartes physiques) : mots du titre ; « Pocket » (le jeu mobile) n'en fait pas partie.
TCG_WORDS = re.compile(r"\b(jcc|tcg|cartes?|booster|extensions?|coffret|display|etb|dresseur d.élite|promo)\b", re.I)
NOT_TCG = re.compile(r"\bpocket\b", re.I)


def clean_link(url):
    """Lien sans les paramètres de suivi (utm_…)."""
    try:
        p = urllib.parse.urlsplit(url.strip())
        q = [(k, v) for k, v in urllib.parse.parse_qsl(p.query, keep_blank_values=True) if not k.lower().startswith("utm_")]
        return urllib.parse.urlunsplit((p.scheme, p.netloc, p.path, urllib.parse.urlencode(q), ""))
    except ValueError:
        return url.strip()


def parse_date(text):
    if not text:
        return None
    text = text.strip()
    try:
        d = email.utils.parsedate_to_datetime(text)
    except (TypeError, ValueError):
        d = None
    if d is None:
        try:
            d = datetime.fromisoformat(text.replace("Z", "+00:00"))
        except ValueError:
            return None
    if d.tzinfo is None:
        d = d.replace(tzinfo=timezone.utc)
    return d.astimezone(timezone.utc)


def text_of(el):
    return re.sub(r"\s+", " ", (el.text or "")).strip() if el is not None else ""


def parse_feed(xml_bytes, feed):
    """Articles d'un flux RSS 2.0 ou Atom : [{title, url, date, source, tcg}]."""
    root = ET.fromstring(xml_bytes)
    out = []
    atom = "{http://www.w3.org/2005/Atom}"
    items = root.findall(".//item") or root.findall(f".//{atom}entry")
    for it in items:
        title = text_of(it.find("title")) or text_of(it.find(f"{atom}title"))
        link = text_of(it.find("link"))
        if not link:
            a = it.find(f"{atom}link")
            link = (a.get("href") if a is not None else "") or ""
        date = parse_date(text_of(it.find("pubDate")) or text_of(it.find(f"{atom}published")) or text_of(it.find(f"{atom}updated")))
        if not title or not link.startswith("http") or date is None:
            continue
        tcg = feed["tcg"] if feed["tcg"] is not None else bool(TCG_WORDS.search(title)) and not NOT_TCG.search(title)
        out.append({"title": title[:180], "url": clean_link(link), "date": date.strftime("%Y-%m-%dT%H:%M:%SZ"), "source": feed["name"], "tcg": bool(tcg)})
    return out


def merge(lists, now=None, keep=KEEP, max_days=MAX_DAYS):
    """Tous les articles, sans doublon (même lien ou même titre), du plus récent au plus ancien."""
    now = now or datetime.now(timezone.utc)
    limit = (now - timedelta(days=max_days)).strftime("%Y-%m-%dT%H:%M:%SZ")
    future = (now + timedelta(days=1)).strftime("%Y-%m-%dT%H:%M:%SZ")
    seen, out = set(), []
    for x in sorted((x for lst in lists for x in lst), key=lambda x: x["date"], reverse=True):
        k1, k2 = x["url"], x["title"].lower()
        if k1 in seen or k2 in seen or x["date"] < limit or x["date"] > future:
            continue
        seen.update((k1, k2))
        out.append(x)
    return out[:keep]


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/rss+xml, application/atom+xml, application/xml;q=0.9, */*;q=0.5"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="web/data/news.json")
    a = ap.parse_args()
    lists, ok = [], []
    for f in FEEDS:
        try:
            items = parse_feed(fetch(f["url"]), f)
            print(f"{f['name']} : {len(items)} articles")
            lists.append(items)
            ok.append({"name": f["name"], "url": f["site"]})
        except Exception as e:  # un flux en panne n'arrête pas les autres
            print(f"::warning::{f['name']} : flux illisible ({e})")
    if not ok:
        print("::error::Aucun flux lu : news.json n'est pas modifié.")
        return 1
    items = merge(lists)
    doc = {"updated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"), "sources": ok, "items": items}
    with open(a.out, "w", encoding="utf-8") as fh:
        json.dump(doc, fh, ensure_ascii=False, indent=1)
        fh.write("\n")
    print(f"{len(items)} news écrites dans {a.out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
