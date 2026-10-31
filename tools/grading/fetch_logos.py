"""Logos des entreprises de gradation PCA, CCC et PSA (2026-11-01, demande du porteur : « rajoute le logo pour les
3 entreprises de gradation » dans « Prix gradés » de la fiche d'une carte).

Chaque logo vient du site officiel de l'entreprise (un seul fichier par entreprise, pas d'aspiration de pages) :
- PCA : image de la barre de navigation de pcagrade.com ;
- CCC : logo SVG intégré à l'en-tête de cccgrading.com (couleurs de la page reportées dans le fichier) ;
- PSA : logo de psacard.com (icône SVG du site, sinon image de partage hébergée par leur CDN Contentful).
Écrit web/img/grading/<pca|ccc|psa>.<ext> et web/img/grading/logos.json (source, date). Lancé par
.github/workflows/grading-logos.yml : ces sites ne sont pas joignables depuis l'environnement de Claude Code.

Les logos sont des marques de leurs propriétaires (comme ceux des enseignes du Radar, point d'attention H3, docs/14).
"""
import datetime
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request

OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'web', 'img', 'grading')
BROWSER = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'

PCA = ['https://pcagrade.com/images/other/logo-navbar@2x.png']
CCC_PAGE = 'https://www.cccgrading.com/en'
PSA = ['https://www.psacard.com/psa/images/brand/favicons/psa-favicon.svg',
       'https://images.ctfassets.net/l40e281thfxr/6csiDTsdnOCtE97s4rmxLh/9a71ffc8f5e1de382d22b4cd71eac4da/PSA.png']


def fetch(url):
    for i in range(4):
        req = urllib.request.Request(url, headers={'User-Agent': BROWSER, 'Accept': '*/*', 'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8'})
        try:
            with urllib.request.urlopen(req, timeout=40) as r:
                return r.read(), r.headers.get('Content-Type', '')
        except Exception as e:  # noqa: BLE001 - réseau : on réessaie
            print('  essai', i + 1, 'échoué :', url, e)
            time.sleep(5 * (i + 1))
    return None, ''


def ext_of(url, ctype, data):
    if data[:4] == b'\x89PNG':
        return 'png'
    if data[:4] == b'RIFF' and data[8:12] == b'WEBP':
        return 'webp'
    if b'<svg' in data[:2000]:
        return 'svg'
    if data[:3] == b'\xff\xd8\xff':
        return 'jpg'
    m = re.search(r'\.(png|svg|webp|jpg)\b', url)
    return m.group(1) if m else ''


def trim(path):
    """Marges transparentes retirées et 480 px de large au plus (Pillow, s'il est installé)."""
    if not path.endswith(('.png', '.webp', '.jpg')):
        return
    try:
        from PIL import Image
        im = Image.open(path).convert('RGBA')
        box = im.getchannel('A').point(lambda a: 255 if a > 8 else 0).getbbox()
        if box:
            im = im.crop(box)
        im.thumbnail((480, 480))
        im.save(path[:-4] + '.png' if path.endswith('.jpg') else path)
    except Exception as e:  # noqa: BLE001 - image gardée telle quelle
        print('  recadrage impossible :', e)


def save(name, data, ext, src, done):
    for old in os.listdir(OUT):
        if old.startswith(name + '.'):
            os.remove(os.path.join(OUT, old))
    path = os.path.join(OUT, name + '.' + ext)
    with open(path, 'wb') as f:
        f.write(data)
    trim(path)
    done[name] = {'file': name + '.' + ('png' if ext == 'jpg' else ext), 'source': src, 'license': 'marque déposée',
                  'date': datetime.date.today().isoformat()}
    print(' ', name, '→', done[name]['file'], len(data), 'octets')


def first(name, urls, done):
    for u in urls:
        data, ctype = fetch(u)
        ext = ext_of(u, ctype, data) if data else ''
        if data and ext:
            save(name, data, ext, u, done)
            return True
    return False


def ccc(done):
    """Logo SVG de l'en-tête de cccgrading.com ; les couleurs posées par la feuille de style du site (classes
    svg-logo-*) sont écrites dans le fichier : texte et emblème en blanc, contour masqué, tricolore gardé."""
    data, _ = fetch(CCC_PAGE)
    if not data:
        return False
    html = data.decode('utf-8', 'replace')
    m = re.search(r'class="header-logo".*?(<svg\b.*?</svg>)', html, re.S)
    if not m:
        print('  logo CCC introuvable dans la page')
        return False
    svg = re.sub(r'<title>.*?</title>', '<title>CCC</title>', m.group(1), flags=re.S)
    style = '<style>.svg-logo-base{fill:#FFFFFF}.svg-logo-stroke{display:none}</style>'
    svg = re.sub(r'(<svg\b[^>]*>)', r'\1' + style, svg, count=1)
    if 'xmlns=' not in svg[:300]:
        svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"', 1)
    save('ccc', svg.encode('utf-8'), 'svg', CCC_PAGE, done)
    return True


def main():
    os.makedirs(OUT, exist_ok=True)
    done = {}
    ok = [first('pca', PCA, done), ccc(done), first('psa', PSA, done)]
    with open(os.path.join(OUT, 'logos.json'), 'w', encoding='utf-8') as f:
        json.dump(done, f, ensure_ascii=False, indent=1)
    print('Logos :', ', '.join(done) or 'aucun')
    if not all(ok):
        print('::warning::logo(s) manquant(s) : ' + ', '.join(n for n, o in zip(('pca', 'ccc', 'psa'), ok) if not o))
    return 0


if __name__ == '__main__':
    sys.exit(main())
