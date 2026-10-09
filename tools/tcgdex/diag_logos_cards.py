"""Diagnostic temporaire (2026-10-09) : logos des extensions et des séries, cartes manquantes.
Interroge l'API et les images TCGdex (inaccessibles depuis l'environnement de développement) et affiche :
- pour quelques extensions : champ logo en FR et EN, réponse HTTP du logo en .webp et .png ;
- pour les séries : champ logo en FR et EN ;
- pour les extensions incomplètes : nombre de cartes en FR et en EN, cardCount officiel."""
import json
import urllib.request

API = "https://api.tcgdex.net/v2/"
H = {"User-Agent": "dropicards-diagnostic"}


def get(url):
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers=H), timeout=30) as r:
            return json.loads(r.read().decode("utf-8"))
    except Exception as e:
        return {"_error": str(e)}


def head(url):
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers=H, method="GET"), timeout=30) as r:
            return f"{r.status} {r.headers.get('Content-Type')} {len(r.read())} o"
    except Exception as e:
        return "ERREUR " + str(e)[:80]


print("=== Logos d'extensions ===")
for sid in ["me01", "me02", "me02.5", "me03", "me04", "me05", "30th", "30th-c", "sv03.5", "sv08", "swsh12", "sm12"]:
    for lang in ["fr", "en"]:
        s = get(f"{API}{lang}/sets/{sid}")
        logo = s.get("logo")
        print(sid, lang, "logo=", logo, "cards=", len(s.get("cards", []) or []), "cardCount=", s.get("cardCount"))
        if logo:
            for ext in ["webp", "png"]:
                print("   ", ext, head(logo + "." + ext))

print("=== Séries ===")
for lang in ["fr", "en"]:
    ser = get(f"{API}{lang}/series")
    if isinstance(ser, list):
        for x in ser:
            d = get(f"{API}{lang}/series/{x['id']}")
            logo = d.get("logo") or x.get("logo")
            print(lang, x["id"], x.get("name"), "logo=", logo, head(logo + ".webp") if logo else "")
    else:
        print(lang, ser)

print("=== Extensions incomplètes ===")
for sid in ["30th", "jumbo", "basep", "rc", "np", "dpp", "mfb", "tk-sm-l", "tk-sm-r", "sp", "wp", "swshp", "svp"]:
    fr, en = get(f"{API}fr/sets/{sid}"), get(f"{API}en/sets/{sid}")
    nf, ne = len(fr.get("cards", []) or []), len(en.get("cards", []) or [])
    ids_fr = {c["localId"] for c in fr.get("cards", []) or []}
    extra_en = [c["localId"] for c in en.get("cards", []) or [] if c["localId"] not in ids_fr]
    print(sid, "fr", nf, fr.get("cardCount"), "| en", ne, en.get("cardCount"), "| en en plus :", len(extra_en), extra_en[:12])
