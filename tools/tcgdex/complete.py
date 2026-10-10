"""
complete.py : cartes manquantes d'une extension française (2026-10-09, demande du porteur).

TCGdex n'a pas toutes les cartes de certaines extensions en français (promos Black Star, promos Nintendo,
promos DP, kits du dresseur…), et aucune langue n'a les trois Mew R, V, B du 30ᵉ Anniversaire. Deux compléments,
dans l'ordre :
  1. la version anglaise de TCGdex (même identifiant de carte, prix et visuel TCGdex) ;
  2. pokemontcg.io (dépôt public PokemonTCG/pokemon-tcg-data), pour ce qui manque encore.
Règles : jamais deux fois le même numéro dans une extension ; pas de variante à suffixe (« 60a », « 152b ») ;
pas d'extension pokemontcg.io partagée par plusieurs extensions TCGdex (les Zarbi d'EX Forces Cachées sont déjà
une extension à part). Ces cartes sont marquées « en » : l'app les présente comme cartes en anglais.
"""
import re

from ptcg import compact_image, norm_number

SUFFIX_VARIANT = re.compile(r"\d[a-z]$", re.I)  # 60a, 152b : impressions anglaises particulières


def en_extra(fr_set, en_set):
    """Cartes de la version anglaise absentes de la française (résumés de l'extension), dans l'ordre anglais."""
    have = {norm_number(b.get("localId", "")) for b in (fr_set or {}).get("cards") or []}
    out = []
    for b in (en_set or {}).get("cards") or []:
        n = norm_number(b.get("localId", ""))
        if n and n not in have:
            have.add(n)
            out.append(b)
    return out


def ptcg_prices(card, rate):
    """Prix d'une carte pokemontcg.io au format du catalogue : (tendance, plus bas, moy. 30 j, TCGplayer €, date,
    moy. 7 j, moy. 1 j)."""
    def pos(v):
        return round(float(v), 2) if isinstance(v, (int, float)) and v > 0 else None
    cm = (card.get("cardmarket") or {})
    p = cm.get("prices") or {}
    upd = str(cm.get("updatedAt") or "").replace("/", "-")[:10] or None
    tcp = None
    for row in ((card.get("tcgplayer") or {}).get("prices") or {}).values():
        usd = pos((row or {}).get("market")) or pos((row or {}).get("mid"))
        if usd is not None:
            tcp = round(usd * rate, 2)
            break
    return (pos(p.get("trendPrice")), pos(p.get("lowPrice")), pos(p.get("avg30")), tcp, upd, pos(p.get("avg7")), pos(p.get("avg1")))


def numbering_confirmed(match, rows):
    """La numérotation pokemontcg.io est-elle celle de l'extension ? Au moins 3 cartes vérifiées au même numéro
    et 90 % d'accord. match(numéro, nom anglais, Pokédex, illustrateur) -> (carte, état), comme PtcgData.match.
    Les Collections Classiques gardent dans pokemontcg.io le numéro de la carte d'origine : jamais confirmées."""
    good = bad = 0
    for r in rows:
        card, state = match(r["local"], r.get("en"), r.get("dex"), r.get("artist"))
        if state is True and card is not None and norm_number(card.get("number", "")) == norm_number(r["local"]):
            good += 1
        elif state is not None:
            bad += 1
    return good >= 3 and good / (good + bad) >= 0.9


def ptcg_extra(sid, ps, ptcg_cards, have_numbers, have_ids, shared):
    """Cartes pokemontcg.io de l'extension ps absentes de l'extension TCGdex sid. have_numbers : numéros déjà
    présents (normalisés) ; have_ids : identifiants déjà pris ; shared : extensions pokemontcg.io à ignorer."""
    if not ps or ps in shared:
        return []
    out = []
    for c in ptcg_cards or []:
        number = str(c.get("number") or "")
        n = norm_number(number)
        cid = f"{sid}-{number}"
        if not n or n in have_numbers or SUFFIX_VARIANT.search(number) or cid in have_ids:
            continue
        have_numbers.add(n)
        have_ids.add(cid)
        out.append({"id": cid, "local": number, "name": c.get("name") or "", "rarity": c.get("rarity") or "",
                    "img": compact_image(c.get("images")) or "", "card": c})
    return out
