#!/usr/bin/env python3
"""Vérification du calendrier TCG (web/data/calendar.json, tenu à la main).

« Le coin des dresseurs › Le calendrier TCG » (2026-11-19, porteur) : chaque semaine, la liste des sorties dont la date
est passée sans que le calendrier ait été mis à jour (statut encore « rumeur », « officiel » ou « japon »). L'app les
affiche déjà en attendant (coin.js, vCal) : « À confirmer » pour une rumeur ou une date au mois près, « Sortie » ou
« Sorti au Japon » pour une date exacte passée. Ce script ne modifie rien : il écrit un rapport (Markdown) que le
workflow « Calendrier TCG » publie dans une issue GitHub.

Signalé aussi :
- une sortie marquée « sortie » dont la date est encore à venir ;
- une date mal écrite (ni AAAA-MM-JJ ni AAAA-MM) ou une date de précommande mal écrite ;
- une date de précommande passée sur une sortie encore à venir (l'alerte « précommandes » ne sert plus).

Utilisation : check_calendar.py [--file web/data/calendar.json] [--today AAAA-MM-JJ] [--out rapport.md]
Code de sortie : 0 (rien à faire), 1 (au moins un point à vérifier), 2 (fichier illisible).
"""
import argparse
import calendar as cal
import datetime as dt
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
DEFAULT = ROOT / "web" / "data" / "calendar.json"
DAY = re.compile(r"^\d{4}-\d{2}-\d{2}$")
MONTH = re.compile(r"^\d{4}-\d{2}$")
STATUS = {"sortie": "Sortie", "officiel": "Officiel", "japon": "Annonce Japon", "rumeur": "Rumeur"}


def end_of(date):
    """Dernier jour couvert par la date : le jour lui-même, ou le dernier jour du mois pour « AAAA-MM »."""
    if DAY.match(date):
        return dt.date.fromisoformat(date)
    y, m = (int(v) for v in date.split("-"))
    return dt.date(y, m, cal.monthrange(y, m)[1])


def start_of(date):
    return dt.date.fromisoformat(date) if DAY.match(date) else dt.date.fromisoformat(date + "-01")


def valid(date):
    if not isinstance(date, str) or not (DAY.match(date) or MONTH.match(date)):
        return False
    try:
        end_of(date)
        return True
    except ValueError:
        return False


def check(items, today):
    """Liste des points à vérifier : [{id, name, kind, text}] dans l'ordre du fichier."""
    out = []
    for x in items:
        iid, name, st, date = x.get("id", "?"), x.get("name", "?"), x.get("status", ""), x.get("date", "")
        label = STATUS.get(st, st or "sans statut")
        if not valid(date):
            out.append({"id": iid, "name": name, "kind": "date", "text": f"date « {date} » illisible (attendu AAAA-MM-JJ ou AAAA-MM)"})
            continue
        if st != "sortie" and end_of(date) < today:
            precise = "le " + date if DAY.match(date) else "en " + date
            want = "passer en « sortie » (ou corriger la date)" if DAY.match(date) and st != "rumeur" else "confirmer la date ou la repousser"
            out.append({"id": iid, "name": name, "kind": "passee", "text": f"prévue {precise}, encore « {label} » : {want}"})
        if st == "sortie" and start_of(date) > today:
            out.append({"id": iid, "name": name, "kind": "future", "text": f"marquée « Sortie » alors que la date ({date}) est à venir"})
        pre = x.get("preorder")
        if pre is not None:
            if not valid(pre):
                out.append({"id": iid, "name": name, "kind": "precommande", "text": f"date de précommande « {pre} » illisible"})
            elif end_of(pre) < today <= end_of(date) and st != "sortie":
                out.append({"id": iid, "name": name, "kind": "precommande", "text": f"précommandes ouvertes depuis {pre} : le champ peut être retiré"})
    return out


def report(points, today, updated):
    head = f"Vérification du {today.isoformat()} · calendrier mis à jour le {updated or '?'} (`web/data/calendar.json`)."
    if not points:
        return head + "\n\nRien à mettre à jour.\n"
    lines = [head, "", f"{len(points)} point(s) à vérifier :", ""]
    lines += [f"- **{p['name']}** (`{p['id']}`) : {p['text']}" for p in points]
    lines += ["", "En attendant, l'app affiche « À confirmer » (rumeur ou date au mois près) ou « Sortie » (date exacte passée)."]
    return "\n".join(lines) + "\n"


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--file", default=str(DEFAULT))
    ap.add_argument("--today", default=None)
    ap.add_argument("--out", default=None)
    a = ap.parse_args(argv)
    try:
        doc = json.loads(pathlib.Path(a.file).read_text("utf-8"))
        items = doc["items"]
    except (OSError, ValueError, KeyError, TypeError) as e:
        print(f"Calendrier illisible : {e}", file=sys.stderr)
        return 2
    today = dt.date.fromisoformat(a.today) if a.today else dt.date.today()
    points = check(items, today)
    text = report(points, today, doc.get("updated"))
    if a.out:
        pathlib.Path(a.out).write_text(text, "utf-8")
    print(text, end="")
    return 1 if points else 0


if __name__ == "__main__":
    sys.exit(main())
