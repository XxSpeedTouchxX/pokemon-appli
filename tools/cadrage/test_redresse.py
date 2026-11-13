"""Tests du redressement des visuels de travers, sur des photos fabriquées à partir de vrais visuels (web/img/c30)."""
import unittest
from pathlib import Path

import cv2
import numpy as np

import redresse as R

ROOT = Path(__file__).resolve().parents[2]
CARDS = sorted((ROOT / "web/img/c30").glob("30th-c-0[0-1]?.webp"))


def photo(card_bgr, corners, size=(900, 1200), bg=(18, 18, 22), noise=6, seed=1):
    """La carte posée sur un fond, ses 4 coins aux positions données (perspective), comme une photo."""
    h, w = card_bgr.shape[:2]
    rng = np.random.default_rng(seed)
    canvas = np.full((size[1], size[0], 3), bg, np.uint8).astype(np.int16)
    canvas += rng.integers(-noise, noise + 1, canvas.shape, dtype=np.int16)
    canvas = np.clip(canvas, 0, 255).astype(np.uint8)
    M = cv2.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), np.float32(corners))
    warped = cv2.warpPerspective(card_bgr, M, size, flags=cv2.INTER_CUBIC)
    mask = cv2.warpPerspective(np.full((h, w), 255, np.uint8), M, size)
    # Coins arrondis de la vraie carte.
    rmask = R.round_corners(np.dstack([card_bgr, np.full((h, w), 255, np.uint8)]), R.RADIUS * w)[..., 3]
    mask = cv2.warpPerspective(rmask, M, size)
    f = (mask.astype(np.float32) / 255)[..., None]
    return (warped * f + canvas * (1 - f)).astype(np.uint8)


def similar(a_bgra, b_bgr):
    """Écart moyen (0-255) entre la carte redressée et l'originale, hors des bords (5 %)."""
    size = (120, 165)
    a = cv2.resize(a_bgra[..., :3], size, interpolation=cv2.INTER_AREA).astype(np.float32)
    b = cv2.resize(b_bgr, size, interpolation=cv2.INTER_AREA).astype(np.float32)
    m = 6
    return float(np.abs(a - b)[m:-m, m:-m].mean())


class Redresse(unittest.TestCase):
    def setUp(self):
        self.assertTrue(CARDS, "visuels de test absents (web/img/c30)")
        self.cards = [cv2.imread(str(p), cv2.IMREAD_UNCHANGED) for p in CARDS[:6]]

    def test_clean_scans_untouched(self):
        # Vrais visuels (coins transparents) et les mêmes sans transparence (coins blancs ou noirs) : jamais touchés.
        for im in self.cards:
            bad, _, m, why = R.crooked(im)
            self.assertFalse(bad, why)
            bgr, alpha = R.split(im)
            if alpha is None:
                alpha = np.full(bgr.shape[:2], 255, np.uint8)
            for bg in (255, 0):
                f = (alpha.astype(np.float32) / 255)[..., None]
                flat = (bgr * f + bg * (1 - f)).astype(np.uint8)
                bad, _, m, why = R.crooked(flat)
                self.assertFalse(bad, f"fond {bg} : {why}")

    def test_tilted_photo_straightened(self):
        # Photo penchée en perspective sur fond sombre (comme Rayquaza ☆ ex8-107) : repérée puis redressée.
        for i, im in enumerate(self.cards):
            bgr = R.split(im)[0]
            ph = photo(bgr, [[150, 170], [740, 150], [770, 1000], [120, 1030]], seed=i)
            bad, card, m, why = R.crooked(ph)
            self.assertTrue(bad, why)
            out = R.rectify(ph, card["q"])
            self.assertEqual(out.shape, (R.H, R.W, 4))
            self.assertLess(similar(out, bgr), 18, f"carte {i} mal redressée")
            self.assertGreater(similar(out, R.split(self.cards[(i + 1) % len(self.cards)])[0]), 25)
            self.assertEqual(int(out[0, 0, 3]), 0)  # coin transparent
            self.assertEqual(int(out[R.H // 2, R.W // 2, 3]), 255)

    def test_rotated_photo_light_background(self):
        bgr = R.split(self.cards[0])[0]
        c, ang = np.array([450, 600]), np.radians(5)
        rot = np.array([[np.cos(ang), -np.sin(ang)], [np.sin(ang), np.cos(ang)]])
        corners = [c + rot @ np.array(p) for p in ([-300, -412], [300, -412], [300, 412], [-300, 412])]
        ph = photo(bgr, corners, bg=(150, 175, 196), noise=10)
        bad, card, m, why = R.crooked(ph)
        self.assertTrue(bad and "penchée" in why, why)
        self.assertLess(similar(R.rectify(ph, card["q"]), bgr), 18)

    def test_straight_with_background_recropped(self):
        bgr = R.split(self.cards[1])[0]
        ph = photo(bgr, [[150, 190], [750, 190], [750, 1015], [150, 1015]])
        bad, card, m, why = R.crooked(ph)
        self.assertTrue(bad and "fond autour" in why, why)
        self.assertLess(m["tilt"], 0.3)
        self.assertLess(similar(R.rectify(ph, card["q"]), bgr), 18)

    def test_small_low_image(self):
        # Même tri sur le petit visuel (245 px de large).
        bgr = R.split(self.cards[2])[0]
        ph = photo(bgr, [[150, 170], [740, 150], [770, 1000], [120, 1030]])
        small = cv2.resize(ph, (245, round(245 * 1200 / 900)), interpolation=cv2.INTER_AREA)
        self.assertTrue(R.crooked(small)[0])
        # Sur le petit visuel, un vrai scan peut passer le premier tri : le grand visuel décide (main).

    def test_key(self):
        self.assertEqual(R.key_of("fr/ex/ex8/107"), "fr_ex_ex8_107")


if __name__ == "__main__":
    unittest.main()
