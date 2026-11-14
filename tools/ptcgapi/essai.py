"""
essai.py : essai gratuit de l'API de prix pokemontcgapi.com (2026-11-14, demande du porteur : « prix par langue »).

Ce que l'essai gratuit peut montrer (800 crédits, 30 jours, 400 crédits par jour une fois l'adresse confirmée,
40 avant) :
  - si nos cartes sont reconnues (identifiant TCGdex → identifiant pokemontcg.io, que l'API accepte) ;
  - les prix des lignes « anglais » et l'indice en euros, comparés à notre cote Cardmarket ;
  - combien de lignes françaises ou japonaises existent mais sont retenues par l'essai (`meta.withheld`,
    `meta.plan_notes`) : l'essai ne donne PAS les prix français ni japonais, réservés à l'offre Developer
    (29 € par mois) ;
  - le lien entre une carte occidentale et sa version japonaise (`jp_twin_id`).

Coût d'un passage : environ 16 crédits (sous le plafond de 40 par jour d'un compte pas encore confirmé).

La clé n'est jamais écrite dans le dépôt ni affichée : elle est lue dans la variable PTCG_API_KEY (secret GitHub
du même nom, workflow « Essai pokemontcgapi »). Aucune adresse e-mail n'est affichée.

Usage : PTCG_API_KEY=… python3 tools/ptcgapi/essai.py [--out rapport.md]
"""
import json
import os
import statistics
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

API = os.environ.get("PTCG_API_BASE", "https://api.pokemontcgapi.com")
ROOT = Path(__file__).resolve().parents[2]

# Cartes de l'essai : identifiant TCGdex (le nôtre) → identifiant pokemontcg.io (« alternate id » accepté par l'API).
SAMPLE = [
    ("base1-4", "base1-4"),          # Dracaufeu, Set de Base
    ("ex8-107", "ex8-107"),          # Rayquaza ☆, EX Deoxys
    ("swsh7-215", "swsh7-215"),      # Noctali VMAX, Évolution Céleste
    ("sv03.5-199", "sv3pt5-199"),    # Dracaufeu-ex, 151
    ("sv03.5-025", "sv3pt5-25"),     # Pikachu commune, 151
    ("sv08-238", "sv8-238"),         # Pikachu-ex, Étincelles Déferlantes
    ("me02-125", "me2-125"),         # Méga-Dracaufeu X-ex, Flammes Fantasmagoriques
    ("me02.5-294", "me2pt5-294"),    # Méga-Dracaufeu Y-ex
    ("me06-138", "me6-138"),         # Méga-Rayquaza-ex, Règne Delta
]
DETAIL = ["base1-4", "sv3pt5-199", "me6-138"]   # prix complets d'une carte (lignes retenues, remarques de l'offre)
TWINS = ["sv3pt5-199", "swsh7-215"]             # version japonaise de ces cartes


def call(path, params=None):
    key = os.environ.get("PTCG_API_KEY", "").strip()
    url = API + path + ("?" + urllib.parse.urlencode(params) if params else "")
    req = urllib.request.Request(url, headers={"X-Api-Key": key, "Accept": "application/json", "User-Agent": "DropicardsEssai/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            body, status, hdr = r.read(), r.status, r.headers
    except urllib.error.HTTPError as e:
        body, status, hdr = e.read(), e.code, e.headers
    try:
        data = json.loads(body.decode("utf-8") or "{}")
    except ValueError:
        data = {"raw": body[:300].decode("utf-8", "replace")}
    cost = hdr.get("X-Credits-Cost") if hdr else None
    left = hdr.get("X-Quota-Remaining") if hdr else None
    return status, data, cost, left


def our_cotes():
    """Notre cote (médiane de la tendance et des moyennes 7 et 30 jours Cardmarket), par identifiant TCGdex."""
    try:
        base = json.loads((ROOT / "web/data/cards-base.json").read_text("utf-8"))
        pr = json.loads((ROOT / "web/data/cards-prices.json").read_text("utf-8"))
    except (OSError, ValueError):
        return {}
    ix = {f: i for i, f in enumerate(pr["fields"])}
    out = {}
    for c, p in zip(base["cards"], pr["prices"]):
        vals = [p[ix[k]] for k in ("cm", "avg7", "avg30") if isinstance(p[ix[k]], (int, float)) and p[ix[k]] > 0]
        out[c[0]] = (c[1], round(statistics.median(vals), 2) if vals else None)
    return out


def safe_me(d):
    """Seulement l'offre, les crédits et l'état de l'essai (jamais l'adresse e-mail)."""
    keep = {}

    def walk(o, pre=""):
        if isinstance(o, dict):
            for k, v in o.items():
                if "email" in k.lower() or "mail" in k.lower() or k.lower() in ("id", "user_id", "account_id", "secret", "key"):
                    continue
                walk(v, pre + k + ".")
        elif any(w in pre.lower() for w in ("plan", "credit", "quota", "trial", "verified", "cards", "remaining", "limit")):
            keep[pre[:-1]] = o
    walk(d)
    return keep


def eur(q):
    return q.get("amount") if q.get("currency") == "EUR" else None


def main():
    out_path = None
    if "--out" in sys.argv:
        out_path = sys.argv[sys.argv.index("--out") + 1]
    lines = ["# Essai pokemontcgapi (prix par langue)", ""]
    if not os.environ.get("PTCG_API_KEY", "").strip():
        lines += ["**Clé absente** : ajoute le secret GitHub `PTCG_API_KEY` (clé de l'essai gratuit), puis relance."]
        print("\n".join(lines))
        if out_path:
            Path(out_path).write_text("\n".join(lines) + "\n", "utf-8")
        return 1

    st, me, _, _ = call("/v1/me")
    lines += ["## Compte", "", f"- Réponse : {st}"]
    for k, v in safe_me(me).items():
        lines.append(f"- {k} : {v}")
    if st == 401:
        lines += ["", "**Clé refusée** (401) : vérifie le secret `PTCG_API_KEY`."]
        print("\n".join(lines))
        if out_path:
            Path(out_path).write_text("\n".join(lines) + "\n", "utf-8")
        return 1

    ours = our_cotes()
    ids = [p for _, p in SAMPLE]
    st, batch, cost, left = call("/v1/prices/current", {"ids": ",".join(ids)})
    lines += ["", "## Prix des cartes de l'essai", "", f"- Réponse : {st} · crédits : {cost} · restants : {left}"]
    if isinstance(batch, dict) and batch.get("error"):
        lines.append(f"- Erreur : {batch['error'].get('code')} — {batch['error'].get('message')}")
    rows = {d.get("card_id"): d for d in (batch.get("data") or [])} if isinstance(batch, dict) else {}
    lines += ["", "| Carte | Notre cote | Indice € (essai) | Langues de l'indice | Cardmarket € (lignes) | Lignes |", "|---|---|---|---|---|---|"]
    for tid, pid in SAMPLE:
        name, cote = ours.get(tid, (tid, None))
        d = rows.get(pid)
        if not d:
            lines.append(f"| {name} ({tid} → {pid}) | {cote} | absente | | | 0 |")
            continue
        idx = d.get("index") or {}
        locs = ", ".join(f"{b.get('locale')} {b.get('eur')} € (n={b.get('sample_n')})" for b in (idx.get("by_locale") or []))
        cm = [f"{q.get('variant')} {eur(q)}" for q in (d.get("quotes") or []) if q.get("source") == "CARDMARKET" and eur(q) is not None]
        lines.append(f"| {name} ({tid} → {pid}) | {cote} | {idx.get('eur')} | {locs} | {'; '.join(cm[:4])} | {len(d.get('quotes') or [])} |")
    lines.append(f"\nCartes trouvées : {batch.get('found') if isinstance(batch, dict) else '?'} sur {len(ids)}.")

    lines += ["", "## Détail de 3 cartes (lignes retenues par l'essai)", ""]
    for pid in DETAIL:
        st, d, cost, left = call(f"/v1/cards/{pid}/prices")
        meta = d.get("meta") if isinstance(d, dict) else None
        data = (d.get("data") or {}) if isinstance(d, dict) else {}
        locs = sorted({q.get("locale") or "sans langue" for q in (data.get("quotes") or [])})
        lines.append(f"- **{pid}** : réponse {st}, crédits {cost}, {len((data.get('quotes') or []))} lignes, langues vues : {', '.join(locs) or '—'}")
        if meta:
            lines.append(f"  - meta : `{json.dumps(meta, ensure_ascii=False)[:600]}`")

    lines += ["", "## Versions japonaises", ""]
    for pid in TWINS:
        st, c, cost, _ = call(f"/v1/cards/{pid}")
        card = (c.get("data") or {}) if isinstance(c, dict) else {}
        twin = card.get("jp_twin_id")
        lines.append(f"- {pid} : réponse {st}, crédits {cost}, version japonaise : {twin or 'aucune'}")
        if twin:
            st, d, cost, _ = call(f"/v1/cards/{urllib.parse.quote(twin)}/prices")
            data = (d.get("data") or {}) if isinstance(d, dict) else {}
            meta = d.get("meta") if isinstance(d, dict) else None
            idx = data.get("index") or {}
            lines.append(f"  - prix : réponse {st}, crédits {cost}, indice {idx.get('eur')} €, {len(data.get('quotes') or [])} lignes")
            if meta:
                lines.append(f"  - meta : `{json.dumps(meta, ensure_ascii=False)[:400]}`")

    st, me2, _, _ = call("/v1/me")
    lines += ["", "## Après l'essai", ""] + [f"- {k} : {v}" for k, v in safe_me(me2).items()]
    text = "\n".join(lines) + "\n"
    print(text)
    if out_path:
        Path(out_path).write_text(text, "utf-8")
    return 0


if __name__ == "__main__":
    sys.exit(main())
