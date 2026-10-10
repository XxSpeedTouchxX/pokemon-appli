"""Floute, sur chaque image d'une prise (record-app.mjs), les noms, villes et adresses des vraies boutiques.
Zones relevées image par image en pixels CSS (blurs.json) ; images capturées en ×2.
Lancer : python3 tools/promo/blur_frames.py <dossier des images> <blurs.json>"""
import json
import sys
from pathlib import Path

from PIL import Image, ImageFilter

frames, blurs = Path(sys.argv[1]), json.loads(Path(sys.argv[2]).read_text())
SCALE, PAD = 2, 6
done = 0
for i, rects in enumerate(blurs):
    if not rects:
        continue
    f = frames / f"{i:04d}.jpg"
    im = Image.open(f).convert("RGB")
    for x, y, w, h in rects:
        box = tuple(int(round(v)) for v in (max(0, (x - PAD) * SCALE), max(0, (y - PAD) * SCALE),
                                            min(im.width, (x + w + PAD) * SCALE), min(im.height, (y + h + PAD) * SCALE)))
        if box[2] > box[0] and box[3] > box[1]:
            im.paste(im.crop(box).filter(ImageFilter.GaussianBlur(14)), box)
    im.save(f, quality=92)
    done += 1
print(f"{frames.name} : {done}/{len(blurs)} images floutées")
