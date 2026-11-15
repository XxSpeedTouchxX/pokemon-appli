#!/usr/bin/env python3
"""Sons d'ouverture du coffre mystère, 3ᵉ série (?soncoffre=11 à 15 ; 2026-11-15, porteur : « propose-moi vraiment des
vrais bruits de coffre qui s'ouvre, avec une touche un peu "jeu" »).

Mixage de vrais enregistrements libres de droits (CC0, Kenney : « RPG Audio » et « Impact Sounds », voir SOURCES.md) :
grincement de charnière, loquet et serrure en métal, couvercle lourd, pièces, coups de bois. La touche « jeu » reste
discrète : quelques reflets de verre (vrais chocs de verre joués plus aigus), un souffle (froissement d'étoffe joué à
l'envers) ou une petite cloche frappée ; aucune note électronique, aucun bip.

Chaque proposition donne UN fichier web/sfx/coffre-1N.mp3 (mono, 44,1 kHz, 64 kbit/s) en trois parties, lues par sfx.js
(SFX_CH_FILE) au rythme de l'animation (games.css, pkmMx* ; xppk.js, myStage) :
  0,00 à 2,40 s  arrivée, jouée dès l'appui : le coffre tombe et se pose (0,65 s), puis deux petits sauts qui
                 retombent (1,34 et 1,89 s) ;
  2,48 à 4,60 s  ouverture, jouée quand le serveur répond (instant 0 à 2,50 s dans le fichier) : le coffre se tasse
                 (0 à 0,19 s), le couvercle bascule (0,10 à 0,46 s), éclair et lot (0,42 s), le lot se pose (1,12 s) ;
  4,68 à 5,80 s  supplément des gros lots (instant 0 à 4,70 s = apparition du nombre, 1,27 s après l'ouverture) :
                 à mi-volume pour un gros lot, en entier pour un Pokémon légendaire.
Des silences séparent les parties : une partie ne déborde jamais sur la suivante. Chaque partie est ramenée à un volume
commun (mesuré dans les fréquences qu'un haut-parleur de téléphone rend, au-dessus de 200 Hz) : arrivée un peu en
retrait, ouverture la plus présente, supplément discret ; crêtes limitées (−6, −5 et −9 dBFS).

Utilisation (fichiers d'origine téléchargés et vérifiés par telecharger.sh, jamais lancés) :
  python3 -I tools/sfx/coffre/make_coffre.py --src DOSSIER --out web/sfx [--wav DOSSIER_WAV] [--used]
Dépendances : numpy, scipy, ffmpeg (avec libmp3lame).
"""
import argparse
import os
import subprocess
import wave
from fractions import Fraction

import numpy as np
from scipy.ndimage import minimum_filter1d
from scipy.signal import butter, resample_poly, sosfilt

SR = 44100
TOTAL = 5.80
OPEN_T0, BONUS_T0 = 2.50, 4.70
# Parties du fichier : (début de lecture, fin) ; le contenu reste à l'intérieur, à 20 ms près.
SEGS = [(0.0, 2.40), (2.48, 4.60), (4.68, TOTAL)]
# Volume visé de chaque partie (RMS sur les 400 ms les plus fortes, au-dessus de 200 Hz, dBFS) et crête maximale (le
# supplément reste en retrait : quelques reflets ou pièces de plus, jamais une sonnerie).
TARGET = [-27.0, -21.0, -28.0]
CEIL = [-6.0, -5.0, -9.0]
LAND = [0.65, 1.34, 1.89]  # chute posée, puis les deux sauts (games.css, pkmMxLand et pkmMxHop)
PACKS = {'rpg': 'kenney-rpg-audio', 'imp': 'kenney-impact-sounds'}

_cache = {}


def load(src, name):
    """Son d'origine (« rpg/creak1 » ou « imp/impactWood_heavy_000 »), mono, 44,1 kHz, crête ramenée à 1."""
    if name not in _cache:
        pack, base = name.split('/')
        path = os.path.join(src, PACKS[pack], base + '.ogg')
        raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                             capture_output=True, check=True).stdout
        x = np.frombuffer(raw, dtype=np.float32).astype(np.float64)
        x = x - np.mean(x)
        _cache[name] = x / max(np.max(np.abs(x)), 1e-9)
    return _cache[name].copy()


def pitch(x, semi):
    """Change la hauteur en lisant plus vite ou plus lentement (comme un enregistrement accéléré : la durée change)."""
    if not semi:
        return x
    r = Fraction(2 ** (semi / 12)).limit_denominator(97)
    return resample_poly(x, r.denominator, r.numerator)


def filt(x, kind, f, order=2):
    return sosfilt(butter(order, f, btype=kind, fs=SR, output='sos'), x)


def fade(x, fin=0.0, fout=0.0):
    x = x.copy()
    a, b = min(int(fin * SR), len(x)), min(int(fout * SR), len(x))
    if a:
        x[:a] *= np.linspace(0, 1, a) ** 2
    if b:
        x[-b:] *= np.linspace(1, 0, b) ** 2
    return x


def cut(x, t0=0.0, t1=None):
    return x[int(t0 * SR): None if t1 is None else int(t1 * SR)]


def anchor(x):
    """Instant du coup principal : première tranche de 5 ms à moins de 4 dB de la plus forte."""
    hop = int(0.005 * SR)
    e = np.array([np.sqrt(np.mean(x[i:i + hop] ** 2)) for i in range(0, max(1, len(x) - hop), hop)])
    return int(np.argmax(e >= e.max() * 10 ** (-4 / 20))) * hop / SR


class Mix:
    def __init__(self):
        self.buf = np.zeros(int(TOTAL * SR))

    def put(self, x, at, db=0.0, anc=None, pre=0.03):
        """Pose x pour que son coup principal (anc, sinon trouvé tout seul) tombe à l'instant « at » (secondes dans le
        fichier) ; on garde au plus « pre » secondes avant ce coup, et le son reste dans la partie de « at »."""
        a = anchor(x) if anc is None else anc
        if pre is not None and a > pre:
            x, a = fade(x[int((a - pre) * SR):], 0.004), pre
        lo, hi = next((s + 0.02, e - 0.02) for s, e in SEGS if s <= at < e)
        t = at - a
        if t < lo:
            x, t = fade(x[int((lo - t) * SR):], 0.003), lo
        n = min(len(x), int((hi - t) * SR))
        if n < len(x):
            x = fade(x[:n], 0, min(0.05, n / SR))
        i = int(round(t * SR))
        self.buf[i:i + len(x)] += x * 10 ** (db / 20)


# Briques communes. db : niveau relatif (chaque partie est ramenée au volume commun à la fin).
def thud_heavy(src, m, at, db, semi=0, var=0):
    """Coffre en bois massif qui se pose : coup sourd (corps du coffre), choc mat d'une lourde pièce de bois (porte qui
    se ferme, plus grave) et claquement du bois, que rend même un haut-parleur de téléphone."""
    m.put(filt(pitch(load(src, 'imp/impactWood_heavy_00%d' % var), semi), 'highpass', 60), at, db - 4)
    m.put(filt(pitch(load(src, 'rpg/doorClose_4'), semi - 3), 'highpass', 70), at, db, pre=0.01)
    m.put(filt(pitch(load(src, 'rpg/bookPlace%d' % (var % 3 + 1)), semi - 3), 'lowpass', 5000), at, db - 5)


def thud_light(src, m, at, db, semi=0, var=0):
    """Petit saut qui retombe : coup de bois plus léger."""
    m.put(filt(pitch(load(src, 'imp/impactWood_medium_00%d' % (var % 5)), semi), 'highpass', 70), at, db - 2)
    m.put(filt(pitch(load(src, 'rpg/bookPlace%d' % ((var + 1) % 3 + 1)), semi - 1), 'lowpass', 6000), at, db - 1)


def rattle_iron(src, m, at, db, semi=0, var=0):
    """Ferrures du coffre qui vibrent au choc (métal léger, joué plus grave)."""
    x = filt(pitch(load(src, 'imp/impactMetal_light_00%d' % (var % 5)), semi - 7), 'highpass', 400)
    m.put(fade(x, 0, 0.08), at + 0.006, db)


def coins_inside(src, m, at, db, semi=0):
    """Pièces qui sautent dans le coffre au choc."""
    x = filt(pitch(load(src, 'rpg/handleCoins2'), semi), 'highpass', 1200)
    m.put(fade(cut(x, 0.03, 0.30), 0.004, 0.08), at + 0.012, db, anc=0.0)


def glints(src, m, at, db, n=3, spread=0.09, base=12, seed=1):
    """Reflets de verre : petits « tink » de verre (vrais chocs de verre, joués plus aigus), très doux et irréguliers
    (pas une mélodie)."""
    rng = np.random.default_rng(seed)
    t = at
    for k in range(n):
        x = load(src, 'imp/impactGlass_light_00%d' % ((seed + k) % 5))
        x = filt(pitch(x, base + int(rng.integers(0, 8))), 'highpass', 1500)
        m.put(fade(x, 0, 0.05), t, db - 3 * rng.random())
        t += spread * (0.6 + 0.8 * rng.random())


def breath(src, m, end, dur, db, hp=1800):
    """Petit souffle « magique » : froissement d'étoffe joué à l'envers (il enfle puis s'arrête), filtré dans l'aigu ;
    il se termine à l'instant « end »."""
    x = load(src, 'rpg/cloth1')[::-1]
    x = filt(filt(x, 'highpass', hp), 'lowpass', 9000)
    x = fade(cut(x, len(x) / SR - dur), dur * 0.6, 0.04)
    m.put(x, end - len(x) / SR + 0.001, db, anc=0.0, pre=None)


def bell(src, m, at, db, semi=19, var=0, lp=6000):
    """Petite cloche (vraie cloche frappée, jouée plus aiguë), un seul coup, doux."""
    x = filt(filt(pitch(load(src, 'imp/impactBell_heavy_00%d' % var), semi), 'highpass', 300), 'lowpass', lp)
    m.put(fade(x, 0, 0.12), at, db)


def arrival(src, m, semi=0, extra=None):
    """Arrivée : chute posée puis deux sauts. extra(at, i) ajoute un détail à chaque choc."""
    for i, t in enumerate(LAND):
        if i == 0:
            thud_heavy(src, m, t, 0, semi=semi)
        else:
            thud_light(src, m, t, -5 - 2 * (i - 1), semi=semi, var=i)
        if extra:
            extra(t, i)


def o(t):
    """Instant t de l'ouverture → position dans le fichier."""
    return OPEN_T0 + t


def b(t):
    """Instant t du supplément (apparition du nombre) → position dans le fichier."""
    return BONUS_T0 + t


# ——— Les 5 propositions ———
def s11(src):
    """Vieux coffre qui grince : bois massif ; le loquet saute, la charnière grince en deux temps pendant que le couvercle
    bascule, le couvercle cogne en arrière ; deux ou trois reflets de verre et un souffle quand le lot apparaît."""
    m = Mix()
    arrival(src, m)
    m.put(filt(load(src, 'rpg/metalLatch'), 'lowpass', 7000), o(0.04), -8)
    m.put(filt(load(src, 'rpg/creak1'), 'highpass', 250), o(0.14), 0, anc=0.17, pre=0.04)
    m.put(filt(load(src, 'imp/impactPlank_medium_001'), 'highpass', 80), o(0.46), -8)
    m.put(filt(load(src, 'rpg/bookPlace2'), 'lowpass', 4500), o(0.46), -12)
    breath(src, m, o(0.44), 0.30, -16)
    glints(src, m, o(0.47), -15, n=3, spread=0.11, base=12, seed=2)
    m.put(filt(load(src, 'rpg/handleSmallLeather'), 'lowpass', 6000), o(1.12), -16)
    glints(src, m, b(0.0), -9, n=4, spread=0.10, base=14, seed=5)
    breath(src, m, b(0.32), 0.26, -12)
    return m


def s12(src):
    """Serrure de fer et couvercle lourd : la serrure fait deux tours (« clic-clac »), le lourd couvercle se soulève en
    grinçant et retombe en arrière ; une petite cloche discrète quand le lot apparaît."""
    m = Mix()
    arrival(src, m, semi=-1, extra=lambda t, i: rattle_iron(src, m, t, -13 - 3 * min(i, 1), var=i + 1))
    m.put(filt(load(src, 'rpg/metalClick'), 'highpass', 300), o(0.03), -3, anc=0.10)
    dop = filt(pitch(load(src, 'rpg/doorOpen_2'), -2), 'highpass', 90)
    m.put(fade(cut(dop, 0, 1.15), 0, 0.35), o(0.20), -2, pre=0.20)
    m.put(filt(pitch(load(src, 'rpg/doorClose_4'), -2), 'highpass', 110), o(0.47), -4, pre=0.01)
    breath(src, m, o(0.46), 0.28, -18, hp=1400)
    bell(src, m, o(0.52), -15, semi=19, var=3)
    m.put(filt(load(src, 'rpg/dropLeather'), 'highpass', 90), o(1.12), -14)
    bell(src, m, b(0.0), -4, semi=24, var=3)
    glints(src, m, b(0.10), -12, n=2, spread=0.12, base=10, seed=7)
    return m


def s13(src):
    """Loquet, charnière et pièces d'or : des pièces sautent dans le coffre à chaque choc, le loquet saute, la charnière
    grince, puis les pièces d'or se déversent ; un petit reflet de verre."""
    m = Mix()
    arrival(src, m, extra=lambda t, i: coins_inside(src, m, t, -12 - 3 * min(i, 1)))
    m.put(filt(load(src, 'rpg/metalLatch'), 'lowpass', 8000), o(0.04), -6)
    m.put(filt(load(src, 'rpg/creak3'), 'highpass', 250), o(0.21), -3)
    m.put(filt(load(src, 'rpg/handleCoins'), 'highpass', 300), o(0.44), 0)
    m.put(filt(pitch(load(src, 'rpg/handleCoins2'), -1), 'highpass', 400), o(0.72), -6)
    glints(src, m, o(0.50), -16, n=2, spread=0.12, base=14, seed=3)
    m.put(fade(cut(filt(load(src, 'rpg/handleCoins2'), 'highpass', 800), 0.14, 0.26), 0.003, 0.05), o(1.12), -9, anc=0.0)
    m.put(filt(pitch(load(src, 'rpg/handleCoins'), -2), 'highpass', 300), b(0.02), 0)
    m.put(filt(load(src, 'rpg/handleCoins2'), 'highpass', 400), b(0.38), -5)
    glints(src, m, b(0.06), -16, n=2, spread=0.12, base=15, seed=9)
    return m


def s14(src):
    """Clé qui tourne et scintillement : un petit coffre ; le trousseau tinte, la clé tourne dans la serrure (« clic…
    clac »), le couvercle grince, puis un scintillement doux de reflets de verre et un souffle."""
    m = Mix()
    arrival(src, m, semi=2)
    m.put(filt(load(src, 'rpg/beltHandle1'), 'lowpass', 9000), o(0.0), -13, anc=0.0)
    m.put(filt(pitch(load(src, 'rpg/metalClick'), 2), 'highpass', 400), o(0.04), -3, anc=0.09)
    m.put(filt(pitch(load(src, 'rpg/creak3'), -2), 'highpass', 200), o(0.26), -4)
    m.put(filt(load(src, 'imp/impactWood_medium_002'), 'highpass', 90), o(0.46), -11)
    breath(src, m, o(0.43), 0.34, -14)
    glints(src, m, o(0.45), -12, n=6, spread=0.085, base=12, seed=4)
    glints(src, m, o(1.12), -20, n=2, spread=0.07, base=17, seed=11)
    glints(src, m, b(0.0), -8, n=6, spread=0.09, base=14, seed=6)
    breath(src, m, b(0.30), 0.26, -12)
    return m


def s15(src):
    """Vieux coffre de pirate : un gros coffre cerclé de fer, plus grave ; serrure lourde, couvercle qui gémit et claque
    en arrière, pièces d'or, et une cloche de navire au loin, toute douce."""
    m = Mix()

    def extra(t, i):
        rattle_iron(src, m, t, -12 - 3 * min(i, 1), semi=-3, var=i)
        m.put(filt(load(src, 'imp/impactSoft_heavy_00%d' % i), 'highpass', 50), t, -8 - 4 * min(i, 1))
    arrival(src, m, semi=-3, extra=extra)
    m.put(filt(pitch(load(src, 'rpg/metalLatch'), -5), 'lowpass', 6000), o(0.04), -4)
    m.put(fade(filt(pitch(load(src, 'rpg/doorOpen_1'), -3), 'highpass', 80), 0, 0.3), o(0.20), -2, pre=0.20)
    m.put(filt(pitch(load(src, 'rpg/doorClose_4'), -4), 'highpass', 100), o(0.47), -3, pre=0.01)
    m.put(filt(pitch(load(src, 'rpg/handleCoins'), -3), 'highpass', 300), o(0.60), -8)
    bell(src, m, o(0.55), -17, semi=12, var=0, lp=4000)
    m.put(filt(pitch(load(src, 'rpg/dropLeather'), -2), 'highpass', 80), o(1.12), -13)
    m.put(filt(pitch(load(src, 'rpg/handleCoins'), -4), 'highpass', 300), b(0.02), -2)
    bell(src, m, b(0.12), -9, semi=12, var=1, lp=4000)
    return m


PROPS = [(11, 'coffre-bois-grincement', s11), (12, 'serrure-fer-couvercle-lourd', s12),
         (13, 'loquet-charniere-pieces', s13), (14, 'cle-scintillement', s14), (15, 'coffre-de-pirate', s15)]


def limit(x, ceil):
    """Limiteur de crêtes (anticipation 3 ms, relâchement 80 ms) : aucune crête au-dessus de « ceil »."""
    thr = 10 ** (ceil / 20)
    g = np.minimum(1.0, thr / np.maximum(np.abs(x), 1e-9))
    g = minimum_filter1d(g, size=int(0.006 * SR) | 1)
    a = np.exp(-1 / (0.08 * SR))
    sm = np.empty_like(g)
    cur = 1.0
    for i, v in enumerate(g):  # descend tout de suite, remonte doucement
        cur = v if v < cur else a * cur + (1 - a) * v
        sm[i] = cur
    return x * sm


def phone_rms(x):
    """Volume perçu sur un haut-parleur de téléphone : RMS des 400 ms les plus fortes, au-dessus de 200 Hz."""
    y = sosfilt(butter(4, 200, 'highpass', fs=SR, output='sos'), x)
    w = int(0.4 * SR)
    return max(np.sqrt(np.mean(y[i:i + w] ** 2)) for i in range(0, max(1, len(y) - w), 2205))


def finish(m):
    x = filt(m.buf, 'highpass', 45)
    for (s, e), tgt, ceil in zip(SEGS, TARGET, CEIL):
        i, j = int(s * SR), int(e * SR)
        seg = x[i:j] * 10 ** (tgt / 20) / max(phone_rms(x[i:j]), 1e-9)
        seg = limit(seg, ceil)
        k = int(0.02 * SR)
        seg[:k] *= np.linspace(0, 1, k)
        seg[-k:] *= np.linspace(1, 0, k)
        x[i:j] = seg
    for (s0, e0), (s1, _) in zip(SEGS, SEGS[1:]):  # silence entre deux parties
        x[int(e0 * SR):int(s1 * SR)] = 0
    return x


def write_wav(path, x):
    w = wave.open(path, 'wb')
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(x, -1, 1) * 32767).astype('<i2').tobytes())
    w.close()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--src', required=True, help='dossier des fichiers d\'origine (telecharger.sh)')
    ap.add_argument('--out', required=True, help='dossier des MP3 servis par l\'app (web/sfx)')
    ap.add_argument('--wav', help='dossier où écrire aussi les WAV (contrôle)')
    ap.add_argument('--kbps', type=int, default=64)
    ap.add_argument('--used', action='store_true', help='affiche les fichiers d\'origine utilisés')
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    for num, slug, fn in PROPS:
        x = finish(fn(a.src))
        tmp = os.path.join(a.wav or a.out, 'coffre-%d-%s.wav' % (num, slug))
        write_wav(tmp, x)
        mp3 = os.path.join(a.out, 'coffre-%d.mp3' % num)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-ac', '1', '-ar', str(SR), '-codec:a', 'libmp3lame',
                        '-b:a', '%dk' % a.kbps, '-map_metadata', '-1', '-id3v2_version', '0', '-write_xing', '1', mp3],
                       check=True)
        if not a.wav:
            os.remove(tmp)
        print('%s  %5.1f Ko  %s' % (mp3, os.path.getsize(mp3) / 1024, slug))
    if a.used:
        print('\n'.join(sorted(PACKS[k.split('/')[0]] + '/' + k.split('/')[1] + '.ogg' for k in _cache)))


if __name__ == '__main__':
    main()
