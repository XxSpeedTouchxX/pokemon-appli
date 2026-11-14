"""Logos de Cardmarket, eBay et Vinted pour le bloc « Prix du marché » de la fiche d'une carte (2026-11-14, porteur :
« que ça reprenne bien les logos de chaque site en question », d'après le modèle de PokéItem).

Source : Simple Icons (paquet npm « simple-icons », licence CC0 ; mêmes icônes que celles de Mon profil › Communauté).
Les sites de Cardmarket, eBay et Vinted ne sont pas lus (aucune aspiration). Chaque logo reste la marque de son
propriétaire (point d'attention H3, docs/14), affiché seulement à côté d'un lien vers le site concerné.

- Cardmarket : le symbole officiel, en bleu de la marque (#012169) ;
- eBay : le mot « ebay », chaque lettre dans sa couleur officielle (rouge, bleu, jaune, vert), découpé aux creux
  entre les lettres (mesurés sur l'icône 16.37.0) ;
- Vinted : le « V » de l'icône de l'app, en vert de la marque (#007782).

Usage : npm pack simple-icons && tar -xzf simple-icons-*.tgz
        python3 tools/market/make_logos.py package
Écrit web/img/market/<cardmarket|ebay|vinted>.svg et web/img/market/logos.json.
"""
import datetime
import json
import os
import re
import sys

OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'web', 'img', 'market')
# Cadre de chaque dessin dans la grille 24 × 24 de Simple Icons (getBBox dans Chromium, version 16.37.0), marge 0,2.
BOX = {'cardmarket': (0, 0.772, 24, 22.456), 'ebay': (0, 7.212, 24, 9.576), 'vinted': (4.246, 0, 15.507, 24)}
COLOR = {'cardmarket': '#012169', 'vinted': '#007782'}
# eBay : creux entre e|b, b|a, a|y (x = 5,97 ; 12,30 ; 17,93 sur 24) et couleurs du logo eBay.
EBAY = [(0, '#E53238'), (5.97, '#0064D2'), (12.30, '#F5AF02'), (17.93, '#86B817')]


def svg(name, d):
    x, y, w, h = BOX[name]
    m = 0.2
    vb = '%g %g %g %g' % (round(x - m, 3), round(y - m, 3), round(w + 2 * m, 3), round(h + 2 * m, 3))
    title = {'cardmarket': 'Cardmarket', 'ebay': 'eBay', 'vinted': 'Vinted'}[name]
    if name == 'ebay':
        stops = ''
        for i, (sx, col) in enumerate(EBAY):
            end = EBAY[i + 1][0] if i + 1 < len(EBAY) else 24
            stops += '<stop offset="%g" stop-color="%s"/><stop offset="%g" stop-color="%s"/>' % (sx / 24, col, end / 24, col)
        defs = '<defs><linearGradient id="g" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="24" y2="0">%s</linearGradient></defs>' % stops
        body = defs + '<path fill="url(#g)" d="%s"/>' % d
    else:
        body = '<path fill="%s" d="%s"/>' % (COLOR[name], d)
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="%s" role="img"><title>%s</title>%s</svg>\n' % (vb, title, body)


def main():
    pkg = sys.argv[1] if len(sys.argv) > 1 else 'package'
    version = json.load(open(os.path.join(pkg, 'package.json'), encoding='utf-8')).get('version', '?')
    os.makedirs(OUT, exist_ok=True)
    done = {}
    for name in ('cardmarket', 'ebay', 'vinted'):
        src = open(os.path.join(pkg, 'icons', name + '.svg'), encoding='utf-8').read()
        d = re.search(r' d="([^"]+)"', src).group(1)
        with open(os.path.join(OUT, name + '.svg'), 'w', encoding='utf-8') as f:
            f.write(svg(name, d))
        done[name] = {'file': name + '.svg', 'source': 'Simple Icons %s (simple-icons, npm)' % version, 'license': 'CC0 (dessin) ; marque déposée de son propriétaire',
                      'date': datetime.date.today().isoformat()}
        print(' ', name, '→', name + '.svg')
    with open(os.path.join(OUT, 'logos.json'), 'w', encoding='utf-8') as f:
        json.dump(done, f, ensure_ascii=False, indent=1)
    return 0


if __name__ == '__main__':
    sys.exit(main())
