"""Logos des enseignes du Radar (2026-10-24, demande du porteur).

Pour chaque enseigne du fichier des boutiques, cherche l'élément Wikidata de l'enseigne (logo, propriété P154),
puis télécharge ce logo depuis Wikimedia Commons en PNG de 320 px de large, avec sa licence et son auteur.
Sans logo sur Wikidata : le logo de l'article de l'enseigne sur Wikipédia en français.
Écrit web/img/brands/<slug>.png et web/img/brands/brands.json. Une enseigne sans logo trouvé garde le badge
dessiné par l'app. Lancé par .github/workflows/brand-logos.yml (Wikimedia n'est pas joignable partout).

Les logos sont des marques de leurs propriétaires : leur usage dans l'app reste un point d'attention (docs/14, H3).
"""
import json, os, re, sys, time, urllib.parse, urllib.request

UA = 'DropicardsDemo/1.0 (https://github.com/XxSpeedTouchxX/pokemon-appli; demo app, brand logos)'
OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'web', 'img', 'brands')
# Enseigne du fichier des boutiques → recherche Wikidata (France : P17 = Q142, sauf Smyths, irlandaise).
# Dernier élément : article de Wikipédia en français dont le logo sert de repli (logos absents de Commons, hébergés
# par Wikipédia au titre de marque déposée).
BRANDS = [
    ('E.Leclerc', 'leclerc', 'E.Leclerc', 'Q142', 'E.Leclerc'),
    ('Carrefour', 'carrefour', 'Carrefour', 'Q142', 'Carrefour (enseigne)'),
    ('King Jouet', 'king-jouet', 'King Jouet', 'Q142', 'King Jouet'),
    ('Micromania-Zing', 'micromania', 'Micromania', 'Q142', 'Micromania-Zing'),
    ('JouéClub', 'joueclub', 'JouéClub', 'Q142', 'JouéClub'),
    ('Auchan', 'auchan', 'Auchan', 'Q142', 'Auchan'),
    ('Fnac', 'fnac', 'Fnac', 'Q142', 'Fnac'),
    ('Cultura', 'cultura', 'Cultura', 'Q142', 'Cultura (entreprise)'),
    ('La Grande Récré', 'la-grande-recre', 'La Grande Récré', 'Q142', 'La Grande Récré'),
    ('Smyths Toys', 'smyths', 'Smyths', None, None),
]
ALIAS = {'Espace Culturel E.Leclerc': 'E.Leclerc'}


def get(url, binary=False):
    for i in range(3):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA})
            with urllib.request.urlopen(req, timeout=30) as r:
                data = r.read()
            return data if binary else json.loads(data)
        except Exception as e:  # noqa: BLE001 - réseau : on réessaie
            print('  essai', i + 1, 'échoué :', e)
            time.sleep(3 * (i + 1))
    raise RuntimeError('injoignable : ' + url)


def wd(params):
    return get('https://www.wikidata.org/w/api.php?' + urllib.parse.urlencode(dict(params, format='json')))


def candidates(term, country):
    """Éléments Wikidata probables : recherche avec logo (et pays), puis recherche simple."""
    q = '"%s" haswbstatement:P154' % term + (' haswbstatement:P17=%s' % country if country else '')
    found = [h['title'] for h in wd({'action': 'query', 'list': 'search', 'srsearch': q, 'srlimit': 5}).get('query', {}).get('search', [])]
    found += [h['id'] for h in wd({'action': 'wbsearchentities', 'search': term, 'language': 'fr', 'type': 'item', 'limit': 7}).get('search', [])]
    seen, out = set(), []
    for x in found:
        if x not in seen:
            seen.add(x); out.append(x)
    return out


def norm(s):
    return re.sub(r'[^a-z0-9]', '', s.lower().replace('é', 'e').replace('è', 'e'))


def current_logo(claims):
    """Logo actuel : rang « préféré », sinon un logo sans date de fin (P582), sinon le dernier."""
    ok = [c for c in claims if c.get('rank') != 'deprecated' and c['mainsnak'].get('datavalue')]
    pref = [c for c in ok if c.get('rank') == 'preferred']
    live = [c for c in ok if 'P582' not in c.get('qualifiers', {})]
    pick = (pref or live or ok or [None])[-1]
    return pick['mainsnak']['datavalue']['value'] if pick else None


def frwiki_logo(article, term):
    """Repli : le logo affiché dans l'article de Wikipédia en français (fichier local ou de Commons)."""
    q = get('https://fr.wikipedia.org/w/api.php?' + urllib.parse.urlencode({
        'action': 'query', 'titles': article, 'prop': 'images', 'imlimit': 100, 'redirects': 1, 'format': 'json'}))
    page = next(iter(q.get('query', {}).get('pages', {}).values()), {})
    files = [x['title'].split(':', 1)[1] for x in page.get('images', [])]
    word = norm(term)[:6]
    good = [x for x in files if 'logo' in x.lower() and word in norm(x) and re.search(r'\.(svg|png)$', x, re.I)]
    print('   Wikipédia :', ', '.join(good[:6]) or 'rien')
    # Logo actuel d'abord : sans année ou avec l'année la plus récente, SVG de préférence.
    year = lambda x: max([int(y) for y in re.findall(r'(?:19|20)\d\d', x)] or [9999])
    good.sort(key=lambda x: (-year(x), not x.lower().endswith('.svg'), len(x)))
    return good[0] if good else None


def main():
    os.makedirs(OUT, exist_ok=True)
    result, missing = {}, []
    for brand, slug, term, country, article in BRANDS:
        print('==', brand)
        pick = None
        for qid in candidates(term, country):
            ent = wd({'action': 'wbgetentities', 'ids': qid, 'props': 'claims|labels|descriptions', 'languages': 'fr|en'})['entities'][qid]
            label = (ent.get('labels', {}).get('fr') or ent.get('labels', {}).get('en') or {}).get('value', '')
            logos = ent.get('claims', {}).get('P154', [])
            desc = (ent.get('descriptions', {}).get('fr') or ent.get('descriptions', {}).get('en') or {}).get('value', '')
            print('  ', qid, label, '·', desc, '· logo' if logos else '')
            if logos and norm(term) in norm(label) and current_logo(logos):
                pick = (qid, label, desc, current_logo(logos))
                break
        wiki = 'commons.wikimedia.org'
        if not pick and article:
            f = frwiki_logo(article, term)
            if f:
                pick, wiki = ('', term, 'logo de l’article « ' + article + ' » de Wikipédia', f), 'fr.wikipedia.org'
        if not pick:
            missing.append(brand); continue
        qid, label, desc, file = pick
        info = get('https://' + wiki + '/w/api.php?' + urllib.parse.urlencode({
            'action': 'query', 'titles': 'File:' + file, 'prop': 'imageinfo', 'iiprop': 'url|extmetadata', 'iiurlwidth': 320, 'format': 'json'}))
        page = next(iter(info['query']['pages'].values()))
        ii = page['imageinfo'][0]
        meta = ii.get('extmetadata', {})
        val = lambda k: re.sub(r'<[^>]+>', '', (meta.get(k) or {}).get('value', '')).strip()
        png = get(ii.get('thumburl') or ii['url'], binary=True)
        name = slug + '.png'
        with open(os.path.join(OUT, name), 'wb') as f:
            f.write(png)
        result[brand] = {'file': 'img/brands/' + name, 'wikidata': qid, 'label': label, 'description': desc, 'commons': ii.get('descriptionurl', ''),
                         'source': wiki, 'license': val('LicenseShortName'), 'artist': val('Artist'), 'restrictions': val('Restrictions')}
        print('  →', qid, file, '·', result[brand]['license'], '·', len(png), 'octets')
    for a, b in ALIAS.items():
        if b in result:
            result[a] = result[b]
    # Logos qui ne servent plus (enseigne retirée, mauvais fichier d'une version précédente) : supprimés.
    used = {os.path.basename(v['file']) for v in result.values()}
    for name in os.listdir(OUT):
        if name.endswith('.png') and name not in used:
            os.remove(os.path.join(OUT, name)); print('retiré :', name)
    with open(os.path.join(OUT, 'brands.json'), 'w', encoding='utf-8') as f:
        json.dump({'source': 'Wikidata (P154) et Wikimedia Commons', 'note': 'Marques de leurs propriétaires.', 'brands': result}, f, ensure_ascii=False, indent=1)
    print('Logos trouvés :', len(BRANDS) - len(missing), '/', len(BRANDS), '· sans logo :', ', '.join(missing) or 'aucune')
    return 0 if len(missing) < len(BRANDS) else 1


if __name__ == '__main__':
    sys.exit(main())
