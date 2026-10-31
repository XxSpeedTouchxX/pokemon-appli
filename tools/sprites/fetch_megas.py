#!/usr/bin/env python3
"""
fetch_megas.py : méga-évolutions des Pokémon de Kanto, débloquées avec des PA dans le jeu d'évolution (2026-10-28,
demande du porteur). Une fois débloquée, une méga-évolution devient un compagnon de l'accueil.

Style pixel « arcade » comme les autres Pokémon (2026-10-30, porteur : les méga-évolutions en 3D détonnaient) :
sprites au style Noir et Blanc de PokeAPI (sprites/pokemon/versions/generation-v/black-white/), faits par la communauté
pour les Pokémon apparus après la 5e génération :
- animé : black-white/animated/<id>.gif quand il existe (Méga-Dracaufeu X, Méga-Dardargnan, Méga-Alakazam, Méga-Mewtwo X et Y),
  sinon une animation au pixel près fabriquée à partir de l'image fixe (2026-10-31, porteur : « Méga-Tortank et
  Méga-Dracaufeu Y sont immobiles, fais-les bouger comme les autres ») : respiration (le haut du corps s'étire d'un à
  quatre pixels, pieds fixes, en 10 images) ou vol (le Pokémon monte et descend de 4 pixels) pour ceux qui flottent ;
  pixels nets, aucune couleur ajoutée ;
- fixe : black-white/<id>.png, 96 px ;
- icône du choix du compagnon : sprite fixe recadré au plus près et centré dans 96 px, comme make_icons.py.
Identifiants : ceux de PokeAPI (pokemon.csv), vérifiés le 2026-10-28.

Sortie : web/img/pokemon/<id>.gif, <id>.png, icon/<id>.png et tools/sprites/megas.json.
Usage : python3 tools/sprites/fetch_megas.py   (Pillow)
        python3 tools/sprites/fetch_megas.py --local   (sans réseau : refait les animations fabriquées à partir des
        images fixes déjà là, puis relancer python3 tools/sprites/dex_boxes.py)
"""
import hashlib
import io
import json
import sys
import time
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "web" / "img" / "pokemon"
INDEX = Path(__file__).with_name("megas.json")
RAW = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/"
ANIMATED = RAW + "versions/generation-v/black-white/animated/{n}.gif"
STILL = RAW + "versions/generation-v/black-white/{n}.png"
UA = "Dropicards/1.0 (+https://github.com/XxSpeedTouchxX/pokemon-appli)"
MAX_GIF, MAX_PNG = 400_000, 20_000  # octets : au-delà, refusé
SIZE = 96
# id PokeAPI, n° du Pokémon de base, nom français
MEGAS = [
    (10033, 3, "Méga-Florizarre"), (10034, 6, "Méga-Dracaufeu X"), (10035, 6, "Méga-Dracaufeu Y"),
    (10036, 9, "Méga-Tortank"), (10090, 15, "Méga-Dardargnan"), (10073, 18, "Méga-Roucarnage"),
    (10037, 65, "Méga-Alakazam"), (10071, 80, "Méga-Flagadoss"), (10038, 94, "Méga-Ectoplasma"),
    (10039, 115, "Méga-Kangourex"), (10040, 127, "Méga-Scarabrute"), (10041, 130, "Méga-Léviator"),
    (10042, 142, "Méga-Ptéra"), (10043, 150, "Méga-Mewtwo X"), (10044, 150, "Méga-Mewtwo Y"),
]


def get(url, optional=False):
    for attempt in range(3):
        try:
            with urlopen(Request(url, headers={"User-Agent": UA}), timeout=60) as resp:
                return resp.read()
        except HTTPError as e:
            if e.code == 404 and optional:
                return None
            print(f"{url} : {e}")
            time.sleep(2 * (attempt + 1))
        except OSError as e:  # noqa: PERF203
            print(f"{url} : {e}")
            time.sleep(2 * (attempt + 1))
    raise SystemExit(f"Injoignable : {url}")


# Méga-évolutions qui flottent ou volent : elles montent et descendent au lieu de respirer.
FLOAT = {10073, 10038, 10041, 10042}
IDLE_MARK = b"Dropicards idle"
# Respiration : pixels ajoutés au haut du corps à chaque image ; vol : décalage vers le haut. 10 images de 120 ms.
BREATH = [0, 1, 2, 3, 4, 4, 3, 2, 1, 0]
FLY = [0, 1, 2, 3, 4, 4, 3, 2, 1, 0]


def _stretch(im, d):
    """Étire de d pixels le haut du corps (72 % supérieurs), au plus proche voisin : les pieds ne bougent pas."""
    w, h = im.size
    split = int(h * 0.72)
    top = im.crop((0, 0, w, split)).resize((w, split + d), Image.NEAREST)
    out = Image.new("RGBA", (w, h + d), (0, 0, 0, 0))
    out.paste(top, (0, 0))
    out.paste(im.crop((0, split, w, h)), (0, split + d))
    return out


def idle_gif(png, n):
    """Animation au pixel près à partir du sprite fixe (méga-évolution sans animation au style Noir et Blanc) : GIF
    transparent en boucle, même cadre serré pour toutes les images, posé sur le bas (respiration) ou flottant (vol)."""
    im = Image.open(io.BytesIO(png)).convert("RGBA")
    im = im.crop(im.getchannel("A").getbbox())
    w, h = im.size
    pad = max(BREATH + FLY)
    frames = []
    for k in range(len(BREATH)):
        canvas = Image.new("RGBA", (w, h + pad), (0, 0, 0, 0))
        if n in FLOAT:
            canvas.paste(im, (0, pad - FLY[k]))
        else:
            body = _stretch(im, BREATH[k])
            canvas.paste(body, (0, h + pad - body.height))
        frames.append(canvas)
    # Palette commune (couleurs du sprite d'origine), index 255 transparent.
    sheet = Image.new("RGBA", (w * len(frames), h + pad), (0, 0, 0, 0))
    for k, f in enumerate(frames):
        sheet.paste(f, (k * w, 0))
    pal = sheet.convert("RGB").quantize(colors=255, method=Image.Quantize.MEDIANCUT)
    out = []
    for f in frames:
        q = f.convert("RGB").quantize(palette=pal, dither=Image.Dither.NONE)
        q.paste(255, mask=f.getchannel("A").point(lambda v: 255 if v <= 128 else 0))
        out.append(q)
    buf = io.BytesIO()
    out[0].save(buf, "GIF", save_all=True, append_images=out[1:], duration=120, loop=0, disposal=2, transparency=255,
                comment=IDLE_MARK)
    return buf.getvalue()


def icon(n, png):
    src = Image.open(io.BytesIO(png)).convert("RGBA")
    poke = src.crop(src.getchannel("A").getbbox())
    out = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    out.paste(poke, ((SIZE - poke.width) // 2, (SIZE - poke.height) // 2))
    out.save(OUT / "icon" / f"{n}.png", optimize=True)


def main():
    (OUT / "icon").mkdir(parents=True, exist_ok=True)
    index, total = [], 0
    for n, base, nom in MEGAS:
        png = get(STILL.format(n=n))
        gif = get(ANIMATED.format(n=n), optional=True) or idle_gif(png, n)
        if not gif.startswith(b"GIF8") or len(gif) > MAX_GIF or not png.startswith(b"\x89PNG") or len(png) > MAX_PNG:
            raise SystemExit(f"Sprite n° {n} refusé (format ou taille : {len(gif)} et {len(png)} octets)")
        (OUT / f"{n}.gif").write_bytes(gif)
        (OUT / f"{n}.png").write_bytes(png)
        icon(n, png)
        index.append([n, base, nom, hashlib.sha256(gif).hexdigest()[:16], hashlib.sha256(png).hexdigest()[:16]])
        total += len(gif) + len(png)
    INDEX.write_text(json.dumps({
        "fetched": time.strftime("%Y-%m-%d"),
        "credit": "Sprites © The Pokémon Company ; style Noir et Blanc de la communauté, via PokeAPI/sprites",
        "sources": {"animated": ANIMATED, "still": STILL},
        "fields": ["id", "base", "nom", "gif_sha256_16", "png_sha256_16"], "megas": index,
    }, ensure_ascii=False, indent=1) + "\n", "utf-8")
    print(f"{len(index)} méga-évolutions, {total // 1024} Ko")


def local():
    """Sans réseau : refait les animations fabriquées (GIF d'une seule image ou marqué « Dropicards idle ») à partir de
    l'image fixe déjà téléchargée, et met à jour les empreintes de megas.json."""
    data = json.loads(INDEX.read_text("utf-8"))
    done = []
    for row in data["megas"]:
        n = row[0]
        gif_path, png_path = OUT / f"{n}.gif", OUT / f"{n}.png"
        cur = gif_path.read_bytes()
        frames = getattr(Image.open(io.BytesIO(cur)), "n_frames", 1)
        if frames > 1 and IDLE_MARK not in cur:
            continue  # vraie animation de PokeAPI : gardée
        gif = idle_gif(png_path.read_bytes(), n)
        if len(gif) > MAX_GIF:
            raise SystemExit(f"Animation n° {n} trop lourde : {len(gif)} octets")
        gif_path.write_bytes(gif)
        row[3] = hashlib.sha256(gif).hexdigest()[:16]
        done.append(f"{n} {row[2]}")
    INDEX.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", "utf-8")
    print(f"{len(done)} animations refaites : " + ", ".join(done))


if __name__ == "__main__":
    local() if "--local" in sys.argv else main()
