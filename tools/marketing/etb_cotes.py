#!/usr/bin/env python3
"""
etb_cotes.py (2026-11-11, contenus réseaux sociaux, lecture seule) : cote Cardmarket du jour de tous les Coffrets
Dresseur d'élite (ETB) depuis Écarlate et Violet, et visuels officiels de la galerie Pokémon France. Rien n'est écrit
dans l'app : le résultat (out/etb.json, out/img/*.png) est déposé comme pièce jointe du workflow « Cotes des ETB ».
"""
import gzip
import json
import time
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

CM = "https://downloads.s3.cardmarket.com/productCatalog/"
UA = {"User-Agent": "PKM-App-index/1.0 (catalogue Dropicards)", "Accept-Encoding": "gzip"}
OUT = Path("out")
# Extension (code des visuels pokemon.com) et années où chercher le visuel.
SETS = ["sv01", "sv02", "sv03", "sv3pt5", "sv04", "sv4pt5", "sv05", "sv06", "sv6pt5", "sv07", "sv08", "sv8pt5",
        "sv09", "sv10", "sv10pt5", "me01", "me02", "me2pt5", "me03", "me04", "me05"]
IMG = "https://www.pokemon.com/static-assets/content-assets/cms2-fr-fr/img/trading-card-game/series/incrementals/{y}/{s}-elite-trainer-box/{s}-elite-trainer-box-169-fr.png"


def get(url, binary=False):
    req = Request(url, headers=UA if not binary else {"User-Agent": "Mozilla/5.0 (compatible; PKM-App/1.0)"})
    with urlopen(req, timeout=120) as r:
        data = r.read()
        if r.headers.get("Content-Encoding") == "gzip":
            data = gzip.decompress(data)
    return data


def main():
    OUT.mkdir(exist_ok=True); (OUT / "img").mkdir(exist_ok=True)
    prods = json.loads(get(CM + "productList/products_nonsingles_6.json"))
    guide = json.loads(get(CM + "priceGuide/price_guide_6.json"))
    print("fichiers :", prods.get("createdAt"), guide.get("createdAt"))
    g = {x["idProduct"]: x for x in guide["priceGuides"]}
    rows = []
    for p in prods["products"]:
        n = p.get("name", "")
        if "elite trainer box" not in n.lower() or (p.get("dateAdded") or "") < "2022-12-01":
            continue
        x = g.get(p["idProduct"], {})
        rows.append({"id": p["idProduct"], "name": n, "cat": p.get("categoryName"), "exp": p.get("idExpansion"),
                     "added": p.get("dateAdded"), "trend": x.get("trend"), "avg30": x.get("avg30"), "avg7": x.get("avg7"),
                     "avg1": x.get("avg1"), "low": x.get("low"), "avg": x.get("avg")})
    rows.sort(key=lambda r: r["added"] or "")
    for r in rows:
        print(f'{r["id"]:>7} {r["added"][:10]} exp {r["exp"]} trend {r["trend"]} avg30 {r["avg30"]} low {r["low"]} | {r["name"]}')
    found = {}
    for s in SETS:
        for y in (2023, 2024, 2025, 2026):
            url = IMG.format(y=y, s=s)
            try:
                data = get(url, binary=True)
            except (HTTPError, URLError, TimeoutError):
                continue
            if data[:4] == b"\x89PNG":
                (OUT / "img" / f"{s}.png").write_bytes(data); found[s] = url; break
        time.sleep(1)
    # Visuels de 2023 : la galerie bloque la lecture des fiches ; essais de chemins de la galerie anglaise, puis logos
    # TCGdex des extensions en secours (logo-<set>.png).
    st = "https://www.pokemon.com/static-assets/content-assets/"
    var = {"sv01": ["", "-koraidon", "-miraidon"], "sv04": ["", "-roaring-moon", "-iron-valiant"]}
    tcg = {"sv01": "sv01", "sv02": "sv02", "sv03": "sv03", "sv3pt5": "sv03.5", "sv04": "sv04", "sv4pt5": "sv04.5"}
    for s, tid in tcg.items():
        if s in found:
            continue
        tries = []
        for v in var.get(s, [""]):
            for y in (2022, 2023, 2024):
                for loc, suf in (("cms2", "-169-en"), ("cms2", "-169"), ("cms2-fr-fr", "-169"), ("cms2-en-us", "-169-en")):
                    tries.append(f"{st}{loc}/img/trading-card-game/series/incrementals/{y}/{s}-elite-trainer-box{v}/{s}-elite-trainer-box{v}{suf}.png")
        for u in tries:
            try:
                data = get(u, binary=True)
            except (HTTPError, URLError, TimeoutError):
                continue
            if data[:4] == b"\x89PNG":
                (OUT / "img" / f"{s}.png").write_bytes(data); found[s] = u; print("trouvé", u); break
        for lang in ("fr", "en"):
            try:
                data = get(f"https://assets.tcgdex.net/{lang}/sv/{tid}/logo.png", binary=True)
            except (HTTPError, URLError, TimeoutError):
                continue
            if data[:4] == b"\x89PNG":
                (OUT / "img" / f"logo-{s}.png").write_bytes(data); found["logo-" + s] = lang; break
    # Carte phare (la plus cotée) des extensions de 2023 sans visuel de coffret.
    for s, path in {"sv01": "sv01/245", "sv02": "sv02/203", "sv03": "sv03/223", "sv3pt5": "sv03.5/199",
                    "sv04": "sv04/199", "sv4pt5": "sv04.5/232"}.items():
        try:
            data = get(f"https://assets.tcgdex.net/fr/sv/{path}/high.png", binary=True)
        except (HTTPError, URLError, TimeoutError) as e:
            print("carte", path, e); continue
        if data[:4] == b"\x89PNG":
            (OUT / "img" / f"card-{s}.png").write_bytes(data); found["card-" + s] = path
    # Visuels officiels des ETB de 2023 hébergés par Poképédia (API MediaWiki, une requête par page, 2026-11-12).
    from urllib.parse import quote
    api = "https://www.pokepedia.fr/api.php?format=json&action=query"
    pp = {"sv01": "Coffret Dresseur d'élite Écarlate et Violet",
          "sv02": "Coffret Dresseur d'élite Écarlate et Violet Évolutions à Paldea",
          "sv03": "Coffret Dresseur d'élite Écarlate et Violet Flammes Obsidiennes",
          "sv3pt5": "Coffret Dresseur d'élite Écarlate et Violet 151",
          "sv04": "Coffret Dresseur d'élite Écarlate et Violet Faille Paradoxe",
          "sv4pt5": "Coffret Dresseur d'élite Écarlate et Violet Destinées de Paldea"}
    for s, title in pp.items():
        try:
            d = json.loads(get(api + "&prop=images&imlimit=50&titles=" + quote(title), binary=True))
        except (HTTPError, URLError, TimeoutError, ValueError) as e:
            print("poképédia", s, e); continue
        files = [i["title"] for pg in d.get("query", {}).get("pages", {}).values() for i in pg.get("images", [])]
        print("poképédia", s, files)
        keep = [f for f in files if "Coffret Dresseur" in f and not any(w in f for w in ("Contenu", "Center", "Promo", "Logo"))]
        for k, f in enumerate(keep[:3]):
            try:
                info = json.loads(get(api + "&prop=imageinfo&iiprop=url&iiurlwidth=1200&titles=" + quote(f), binary=True))
                ii = [pg["imageinfo"][0] for pg in info["query"]["pages"].values() if pg.get("imageinfo")][0]
                data = get(ii.get("thumburl") or ii["url"], binary=True)
            except (HTTPError, URLError, TimeoutError, ValueError, IndexError, KeyError) as e:
                print("poképédia", f, e); continue
            if data[:4] == b"\x89PNG" or data[:3] == b"\xff\xd8\xff":
                name = f"pp-{s}-{k}"
                (OUT / "img" / f"{name}.png").write_bytes(data); found[name] = f; print("poképédia trouvé", name, f)
            time.sleep(1)
    print("visuels :", len(found), "sur", len(SETS), "manquants :", [s for s in SETS if s not in found])
    (OUT / "etb.json").write_text(json.dumps({"created": guide.get("createdAt"), "rows": rows, "images": found},
                                             ensure_ascii=False, indent=1), "utf-8")
    # Copie lisible dans le journal du workflow (les pièces jointes ne sont pas téléchargeables partout) : lignes
    # « ROW » en JSON, visuels réduits à 800 px en WebP, en base64 par morceaux de 4 000 caractères.
    import base64, io
    from PIL import Image
    for r in rows:
        print("ROW " + json.dumps(r, ensure_ascii=False))
    for s in found:
        im = Image.open(OUT / "img" / f"{s}.png").convert("RGBA")
        im.thumbnail((800, 800), Image.LANCZOS)
        buf = io.BytesIO(); im.save(buf, "WEBP", quality=85, method=6)
        b = base64.b64encode(buf.getvalue()).decode()
        for k in range(0, len(b), 4000):
            print(f"IMG {s} {k // 4000} {b[k:k + 4000]}")


if __name__ == "__main__":
    main()
