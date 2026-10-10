"""Floute la liste des vraies boutiques sous le radar de Territoire (noms et indices) : la pub ne montre aucune
boutique réelle avec un indice de chance. Lancer après capture.mjs : python3 tools/promo/blur_territoire.py"""
from pathlib import Path

from PIL import Image, ImageFilter

HERE = Path(__file__).parent
im = Image.open(HERE / "shots/territoire.png").convert("RGB")
box = (0, 650 * 3, im.width, im.height)  # sous la carte du radar (écran 390 × 844, capturé en ×3)
im.paste(im.crop(box).filter(ImageFilter.GaussianBlur(28)), box)
im.save(HERE / "shots/territoire-floue.png")
