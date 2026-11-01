#!/usr/bin/env python3
"""
fetch_megatext.py : descriptions du Pokédex des 15 méga-évolutions (2026-11-01, demande du porteur).

PokeAPI (source de fetch_dex.py) n'a aucun texte pour les formes méga : la fiche d'une méga-évolution restait sans
description. Le texte vient du Pokédex de Légendes Pokémon : Z-A (2025, le jeu le plus récent, comme pour les autres
Pokémon), en français : fichier zukan_comment_A.txt du relevé public des textes du jeu (CPokemon/plza-text, GitHub),
une ligne par forme, repérée par son étiquette ZKN_COMMENT_A_<n° national>_<n° de forme>. Le nom de chaque forme est
vérifié dans zkn_form.txt (ZKN_FORM_<n°>_<forme>) contre le nom de megas.json ; le moindre écart arrête le script.
Recoupé le 2026-11-01 avec un second relevé indépendant (abcboy101/poke-corpus, version 2.0.1 du jeu) : identique.
Textes © The Pokémon Company : décision du porteur sur les contenus Pokémon (CLAUDE.md §4).
Les retours à la ligne du jeu (\\n) deviennent des espaces. Résultat figé dans megas_text.json, lu par fetch_dex.py.
Usage : python3 tools/sprites/fetch_megatext.py
"""
import json
from pathlib import Path
from urllib.request import Request, urlopen

HERE = Path(__file__).resolve().parent
OUT = HERE / "megas_text.json"
BASE = "https://raw.githubusercontent.com/CPokemon/plza-text/main/french/common/"
UA = "Dropicards/1.0 (+https://github.com/XxSpeedTouchxX/pokemon-appli)"
# n° de la méga-évolution (megas.json) → étiquette de forme dans le jeu (n° national, n° de forme).
FORMS = {10033: "003_001", 10034: "006_001", 10035: "006_002", 10036: "009_001", 10090: "015_001", 10073: "018_001",
         10037: "065_001", 10071: "080_001", 10038: "094_001", 10039: "115_001", 10040: "127_001", 10041: "130_001",
         10042: "142_001", 10043: "150_001", 10044: "150_002"}


def lines(name, prefix):
    with urlopen(Request(BASE + name, headers={"User-Agent": UA}), timeout=120) as r:
        rows = r.read().decode("utf-8").splitlines()
    out = {}
    for row in rows:
        parts = row.split("\t")
        if len(parts) >= 4 and parts[2].startswith(prefix):
            out[parts[2][len(prefix):]] = parts[3]
    return out


def main():
    megas = {m[0]: m[2] for m in json.loads((HERE / "megas.json").read_text("utf-8"))["megas"]}
    if set(megas) != set(FORMS):
        raise SystemExit("megas.json et FORMS ne listent pas les mêmes méga-évolutions")
    names, texts = lines("zkn_form.txt", "ZKN_FORM_"), lines("zukan_comment_A.txt", "ZKN_COMMENT_A_")
    out = {}
    for mid, form in FORMS.items():
        if names.get(form) != megas[mid]:
            raise SystemExit(f"forme {form} : « {names.get(form)} » au lieu de « {megas[mid]} »")
        t = " ".join(texts.get(form, "").replace("\\n", " ").split())
        if len(t) < 40:
            raise SystemExit(f"texte manquant pour {megas[mid]}")
        out[str(mid)] = t
    OUT.write_text(json.dumps({"source": "Pokédex de Légendes Pokémon : Z-A (2025), textes du jeu en français : "
                                         "github.com/CPokemon/plza-text, french/common/zukan_comment_A.txt",
                               "texts": out}, ensure_ascii=False, indent=1) + "\n", "utf-8")
    print(len(out), "descriptions →", OUT.name)


if __name__ == "__main__":
    main()
