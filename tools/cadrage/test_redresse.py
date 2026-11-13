"""Tests du redressement des visuels de travers, sur des photos fabriquées à partir de vrais visuels (web/img/c30)."""
import unittest
from pathlib import Path

import cv2
import numpy as np

import redresse as R

ROOT = Path(__file__).resolve().parents[2]
CARDS = sorted((ROOT / "web/img/c30").glob("30th-c-0[0-1]?.webp"))
CASES = sorted((Path(__file__).resolve().parent / "cas").glob("scan-droit-*.webp"))


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


def opaque(im):
    """Visuel limité à la carte : les rangées ou colonnes entièrement transparentes (bande vide sous certains visuels
    des 30 ans) sont retirées, puis le visuel remis à 600 × 825."""
    bgr, alpha = R.split(im)
    if alpha is None:
        return im
    rows, cols = np.where((alpha > 128).any(1))[0], np.where((alpha > 128).any(0))[0]
    crop = im[rows[0]:rows[-1] + 1, cols[0]:cols[-1] + 1]
    return cv2.resize(crop, (R.W, R.H), interpolation=cv2.INTER_AREA)


class Redresse(unittest.TestCase):
    def setUp(self):
        self.assertTrue(CARDS, "visuels de test absents (web/img/c30)")
        self.cards = [opaque(cv2.imread(str(p), cv2.IMREAD_UNCHANGED)) for p in CARDS[:6]]

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

    def test_straight_with_background_untouched(self):
        # Carte droite avec du fond autour : pas « de travers », laissée telle quelle (aucun recadrage seul).
        bgr = R.split(self.cards[1])[0]
        ph = photo(bgr, [[150, 190], [750, 190], [750, 1015], [150, 1015]])
        bad, card, m, why = R.crooked(ph)
        self.assertFalse(bad, why)
        self.assertLess(m["tilt"], 0.3)

    def test_real_clean_scans_untouched(self):
        # Vrais visuels TCGdex droits que le premier passage (13 novembre 2026) avait pris à tort pour des photos de
        # travers (bord argenté, cadres dessinés) : coins sombres opaques, puis coins rendus transparents.
        self.assertTrue(CASES, "cas réels absents (tools/cadrage/cas)")
        for p in CASES:
            im = cv2.imread(str(p), cv2.IMREAD_UNCHANGED)
            bad, _, m, why = R.crooked(im)
            self.assertFalse(bad, f"{p.name} : {why}")
            near = (np.abs(im[..., :3].astype(int) - 40).max(2) < 14).astype(np.uint8)
            n, lbl = cv2.connectedComponents(near)
            edge = np.unique(np.concatenate([lbl[0], lbl[-1], lbl[:, 0], lbl[:, -1]]))
            alpha = np.where(np.isin(lbl, edge[edge > 0]), 0, 255).astype(np.uint8)
            bad, _, m, why = R.crooked(np.dstack([im[..., :3], alpha]))
            self.assertFalse(bad, f"{p.name} (transparent) : {why}")
            # Le même scan photographié de travers, lui, est repéré.
            h, w = im.shape[:2]
            c, ang = np.array([w * 0.75, h * 0.75]), np.radians(3)
            rot = np.array([[np.cos(ang), -np.sin(ang)], [np.sin(ang), np.cos(ang)]])
            corners = [c + rot @ np.array(q) for q in ([-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2])]
            ph = photo(im[..., :3], corners, size=(round(w * 1.5), round(h * 1.5)))
            bad, _, m, why = R.crooked(ph)
            self.assertTrue(bad and "penchée" in why, f"{p.name} de travers : {why}")

    def test_tight_photo_lines(self):
        # Photo serrée (la carte remplit le visuel, sans fond autour) prise un peu de travers, comme Rayquaza ☆ ex8-107 :
        # repérée par ses grands traits du pourtour, puis remise droite (traits droits après correction).
        found = 0
        for path in CASES:
            bgr = cv2.resize(cv2.imread(str(path)), (R.W, R.H), interpolation=cv2.INTER_CUBIC)
            h, w = bgr.shape[:2]
            ref = R.line_skew(bgr)
            if ref is None or ref["n"] < 10:
                continue  # petit visuel agrandi : trop peu de traits nets sur le pourtour
            src = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
            dst = np.float32([[22, 36], [w - 4, 2], [w - 14, h - 8], [8, h - 2]])
            M = cv2.getPerspectiveTransform(src, dst)
            warped = cv2.warpPerspective(bgr, M, (w, h), borderMode=cv2.BORDER_REPLICATE)
            ph = cv2.resize(warped[38:h - 14, 26:w - 18], (w, h), interpolation=cv2.INTER_AREA)
            bad, fix, m, why = R.crooked(ph)
            if not bad:
                continue
            found += 1
            self.assertEqual(fix["mode"], "lignes", f"{path.name} : {why}")
            out = R.unskew(ph, fix["H"])
            self.assertEqual(out.shape, (R.H, R.W, 4))
            after = R.line_skew(out)
            self.assertFalse(R.crooked(out)[0], f"{path.name} encore de travers après correction")
            if after is not None:
                self.assertLess(after["before"], 0.4, f"{path.name} encore de travers après correction")
            # Le petit visuel donne la même correction (contrôle « petit / grand » du workflow).
            small = cv2.resize(ph, (245, round(245 * h / w)), interpolation=cv2.INTER_AREA)
            self.assertTrue(R.crooked(small, low=True)[0], path.name)
            self.assertTrue(R.agree(small, ph, fix), path.name)
        self.assertGreaterEqual(found, 3)

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
