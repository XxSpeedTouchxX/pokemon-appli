"""Floute, sur chaque image enregistrée du Radar, les noms, villes et adresses des vraies boutiques
(zones relevées par record-radar.mjs dans out/radar-blurs.json, en pixels CSS ; images en ×2)."""
import json
from pathlib import Path

from PIL import Image, ImageFilter

HERE = Path(__file__).parent
FRAMES, SCALE, PAD = HERE / "out/radar-frames", 2, 6
blurs = json.loads((HERE / "out/radar-blurs.json").read_text())
done = 0
for i, rects in enumerate(blurs):
    if not rects:
        continue
    f = FRAMES / f"{i:04d}.jpg"
    im = Image.open(f).convert("RGB")
    for x, y, w, h in rects:
        box = tuple(int(round(v)) for v in (max(0, (x - PAD) * SCALE), max(0, (y - PAD) * SCALE),
                                            min(im.width, (x + w + PAD) * SCALE), min(im.height, (y + h + PAD) * SCALE)))
        if box[2] > box[0] and box[3] > box[1]:
            im.paste(im.crop(box).filter(ImageFilter.GaussianBlur(14)), box)
    im.save(f, quality=92)
    done += 1
print(f"Images floutées : {done}/{len(blurs)}")
