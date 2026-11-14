"""Essai : la page d'une carte sur Cardmarket, filtrée « Français, Near Mint », est-elle lisible depuis un serveur ?

(2026-11-14, « go » du porteur après l'avis de son avocat : lire les pages de Cardmarket pour le prix des cartes
françaises.) Lit 2 pages par carte d'essai (lien par identifiant, puis la même page filtrée) et affiche seulement :
code de réponse, adresse finale, signes d'une barrière anti-robots, nombre d'offres et leurs prix. Aucun nom de vendeur
n'est affiché ni gardé. Une pause de 4 s sépare chaque page.
"""
import re
import sys
import time
import urllib.error
import urllib.request

UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
CARDS = [('Méga-Rayquaza ex 138/103 (Règne Delta)', 918982), ('Rayquaza swsh4-138', 512400)]
PRICE = re.compile(r'(\d{1,3}(?:\.\d{3})*,\d{2})\s*€')


def get(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept': 'text/html,application/xhtml+xml',
                                               'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.6'})
    try:
        with urllib.request.urlopen(req, timeout=40) as r:
            return r.status, r.geturl(), dict(r.headers), r.read().decode('utf-8', 'replace')
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8', 'replace') if e.fp else ''
        return e.code, url, dict(e.headers or {}), body
    except Exception as e:  # noqa: BLE001 - essai réseau
        return 0, url, {}, 'ERREUR ' + repr(e)


def report(label, url):
    code, final, headers, html = get(url)
    cf = [m for m in ('Just a moment', 'cf-chl', 'challenge-platform', 'Attention Required', 'captcha') if m.lower() in html.lower()]
    rows = html.count('article-row')
    print('---', label)
    print('  code', code, '| finale', final)
    print('  serveur', headers.get('Server') or headers.get('server'), '| cf-ray', headers.get('CF-RAY') or headers.get('cf-ray'), '| taille', len(html))
    print('  barrière anti-robots :', ', '.join(cf) or 'aucune')
    print('  lignes d\'offres (article-row) :', rows)
    # Prix des offres : dans chaque ligne d'offre, le dernier montant en euros avant la quantité.
    offers = []
    for chunk in html.split('article-row')[1:21]:
        p = PRICE.findall(chunk[:6000])
        if p:
            offers.append(p[0])
    print('  premiers prix des offres :', ', '.join(offers[:10]) or '—')
    for key in ('À partir de', 'Tendance des prix', 'Prix moyen 30 jours', 'Prix moyen 7 jours', 'Articles disponibles'):
        i = html.find(key)
        if i >= 0:
            seg = re.sub(r'<[^>]+>', ' ', html[i:i + 260])
            print('  ' + key + ' :', ' '.join(seg.split())[:120])
    return code, final


def main():
    for label, pid in CARDS:
        code, final = report(label + ' · lien par identifiant', 'https://www.cardmarket.com/fr/Pokemon/Products?idProduct=%d' % pid)
        time.sleep(4)
        base = final.split('?')[0] if code == 200 and '/Products/Singles/' in final else None
        if base:
            report(label + ' · Français, Near Mint', base + '?language=2&minCondition=2')
            time.sleep(4)
            report(label + ' · toutes langues', base)
            time.sleep(4)
    return 0


if __name__ == '__main__':
    sys.exit(main())
