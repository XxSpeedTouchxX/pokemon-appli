#!/usr/bin/env python3
"""Appareil du Bestiaire (app iOS et Android) : l'appareil dessiné du « Pokédex » aux couleurs de l'Aura.

Décision du porteur (2026-11-07) : dans l'app des stores, ni nom « Pokédex » ni rappel de l'objet des jeux. Le dessin
de web/img/brand/pokedex-device.svg et son icône pokedex.svg (rouge, grille de boutons bleus) sont recopiés avec une
autre palette : prune des PA (goutte d'Aura, web/img/brand/pa.svg) à la place du rouge, or des PK à la place du bleu.
Sortie : mobile/overlay/img/brand/ (mêmes noms de fichiers ; copiés par-dessus web/ par le build de l'app).
Régénérer : python3 tools/brand/app/make_app_brand.py ; tools/web/dex.css est recoloré par le build de l'app (APP_CSS).
"""
import os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
SRC = os.path.join(ROOT, 'web/img/brand')
OUT = os.path.join(ROOT, 'mobile/overlay/img/brand')
# Rouges du dessin → prunes ; bleus de la grille → ors ; du plus clair au plus sombre, pour garder le relief.
PALETTE = {
    '#FF5A5A': '#E59BD6', '#FF3B3B': '#D77BC6', '#F25562': '#D77BC6', '#F0333F': '#B95AAB', '#E2202F': '#9B3C8F',
    '#D51E2C': '#8E3384', '#B5121F': '#7A2A71', '#9E0F1B': '#68235F', '#8E0D18': '#5C1F55', '#7E0A14': '#4C1946',
    '#3A0A0E': '#1E061E', '#6FC8FF': '#FFE27A', '#4AA8FF': '#FFD60A', '#2C8BE6': '#E8A000',
}


def recolor(text):
    for a, b in PALETTE.items():
        text = text.replace(a, b).replace(a.lower(), b)
    return text


def main():
    os.makedirs(OUT, exist_ok=True)
    for name in ('pokedex-device.svg', 'pokedex.svg'):
        src = open(os.path.join(SRC, name), encoding='utf-8').read()
        out = recolor(src)
        left = [c for c in PALETTE if c in out or c.lower() in out]
        if left:
            raise SystemExit('Couleur non remplacée dans %s : %s' % (name, ', '.join(left)))
        open(os.path.join(OUT, name), 'w', encoding='utf-8').write(out)
    print('Appareil du Bestiaire : 2 dessins aux couleurs de l’Aura dans mobile/overlay/img/brand/')


if __name__ == '__main__':
    main()
