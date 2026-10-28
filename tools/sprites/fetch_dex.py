#!/usr/bin/env python3
"""
fetch_dex.py : fiches du Pokédex de Dropicards (2026-10-28, demande du porteur).

Pour les 156 compagnons (les 151 de Kanto, Latias, Latios, Kyogre, Groudon, Rayquaza) et les 15 méga-évolutions de
megas.json : nom, catégorie, types, taille, poids, statistiques de base, talents, habitat, taux de capture, légendaire
ou fabuleux, forme précédente et façon d'évoluer, description du Pokédex en français (texte des jeux le plus récent),
tous en français quand la donnée existe.

Source : fichiers CSV publics de PokeAPI (PokeAPI/pokeapi, data/v2/csv), lus une fois ; les données sont figées dans
tools/sprites/dex.json, que le build injecte dans l'app (DEX_DATA). Textes et noms © The Pokémon Company : décision
du porteur sur les contenus Pokémon (CLAUDE.md §4, description choisie par le porteur le 2026-10-28).
Usage : python3 tools/sprites/fetch_dex.py
"""
import csv
import io
import json
import time
from pathlib import Path
from urllib.request import Request, urlopen

HERE = Path(__file__).resolve().parent
OUT = HERE / "dex.json"
CSV = "https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/{}.csv"
UA = "Dropicards/1.0 (+https://github.com/XxSpeedTouchxX/pokemon-appli)"
FR = "5"
SPECIES = list(range(1, 152)) + [380, 381, 382, 383, 384]


def table(name):
    for k in range(4):
        try:
            with urlopen(Request(CSV.format(name), headers={"User-Agent": UA}), timeout=120) as r:
                return list(csv.DictReader(io.StringIO(r.read().decode("utf-8"))))
        except Exception:  # réseau : on réessaie
            time.sleep(2 * (k + 1))
    raise SystemExit("CSV introuvable : " + name)


def clean(t):
    return " ".join(t.replace("\f", " ").replace("\n", " ").replace("­", "").split())


def main():
    megas = json.loads((HERE / "megas.json").read_text("utf-8"))["megas"]
    sp = {int(r["id"]): r for r in table("pokemon_species")}
    names = {int(r["pokemon_species_id"]): r for r in table("pokemon_species_names") if r["local_language_id"] == FR}
    poke = {int(r["id"]): r for r in table("pokemon")}
    tnames = {r["type_id"]: r["name"] for r in table("type_names") if r["local_language_id"] == FR}
    types = {}
    for r in table("pokemon_types"):
        types.setdefault(int(r["pokemon_id"]), []).append((int(r["slot"]), tnames[r["type_id"]]))
    stats = {}
    for r in table("pokemon_stats"):
        stats.setdefault(int(r["pokemon_id"]), {})[int(r["stat_id"])] = int(r["base_stat"])
    anames = {r["ability_id"]: r["name"] for r in table("ability_names") if r["local_language_id"] == FR}
    abil = {}
    for r in table("pokemon_abilities"):
        abil.setdefault(int(r["pokemon_id"]), []).append((int(r["slot"]), anames.get(r["ability_id"], ""), r["is_hidden"] == "1"))
    habitats = {r["pokemon_habitat_id"]: r["name"] for r in table("pokemon_habitat_names") if r["local_language_id"] == FR}
    items = {r["item_id"]: r["name"] for r in table("item_names") if r["local_language_id"] == FR}
    evo = {}
    for r in table("pokemon_evolution"):
        evo.setdefault(int(r["evolved_species_id"]), []).append(r)
    text = {}
    for r in table("pokemon_species_flavor_text"):
        if r["language_id"] == FR:
            k = int(r["species_id"])
            if k not in text or int(r["version_id"]) > text[k][0]:
                text[k] = (int(r["version_id"]), clean(r["flavor_text"]))

    def how(k):
        rows = sorted(evo.get(k, []), key=lambda r: int(r["id"]))
        if not rows:
            return ""
        r = rows[0]
        if r["evolution_trigger_id"] == "1":
            if r["minimum_level"]:
                return "Niveau " + r["minimum_level"]
            if r["minimum_happiness"]:
                return "Bonheur"
            return "Gain de niveau"
        if r["evolution_trigger_id"] == "2":
            return "Échange" + (" en tenant " + items[r["held_item_id"]] if r["held_item_id"] else "")
        if r["evolution_trigger_id"] == "3":
            return items.get(r["trigger_item_id"], "Objet")
        return "Condition spéciale"

    def card(pid, species):
        p, st = poke[pid], stats[pid]
        return {
            "types": [t for _, t in sorted(types[pid])],
            "h": int(p["height"]), "w": int(p["weight"]),
            "stats": [st[1], st[2], st[3], st[4], st[5], st[6]],
            "abil": [a + (" (caché)" if hid else "") for _, a, hid in sorted(abil.get(pid, [])) if a],
        }

    out = []
    for k in SPECIES:
        s, n = sp[k], names[k]
        frm = int(s["evolves_from_species_id"]) if s["evolves_from_species_id"] else 0
        e = {"n": k, "name": n["name"], "genus": n["genus"], **card(k, s),
             "hab": habitats.get(s["habitat_id"], ""), "cap": int(s["capture_rate"]),
             "leg": 2 if s["is_mythical"] == "1" else 1 if s["is_legendary"] == "1" else 0,
             "from": frm if frm in SPECIES else 0, "how": how(k) if frm in SPECIES else "",
             "fam": int(s["evolution_chain_id"]), "text": text.get(k, (0, ""))[1]}
        out.append(e)
    for mid, base, mname, *_ in megas:
        e = {"n": mid, "name": mname, "genus": names[base]["genus"], **card(mid, sp[base]),
             "hab": "", "cap": 0, "leg": 0, "from": base, "how": "Méga-évolution", "fam": int(sp[base]["evolution_chain_id"]), "text": "", "mega": 1}
        out.append(e)
    OUT.write_text(json.dumps({"fetched": time.strftime("%Y-%m-%d"), "source": "PokeAPI/pokeapi data/v2/csv",
                               "dex": out}, ensure_ascii=False, separators=(",", ":")), "utf-8")
    print(len(out), "fiches,", OUT.stat().st_size, "octets")


if __name__ == "__main__":
    main()
