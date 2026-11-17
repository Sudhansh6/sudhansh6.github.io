"""Build the home-hero portrait assets from the original photo and its Vision person mask.

Outputs (public/assets/img/me/):
  cutout.webp  - the person on a transparent background, framed to the hero portrait box,
                 dissolving toward the bottom.
  splats.bin   - packed splats sampled from the photo's background (and the dissolving legs),
                 drawn as an animated cloud behind the cutout.
Usage: python3 scripts/build-hero-splats.py ~/Downloads/IMG_1582.JPG /tmp/me_mask.png
"""
import random, struct, sys
from PIL import Image, ImageFilter, ImageOps, ImageEnhance

src, mask_path = sys.argv[1], sys.argv[2]
OUT = 'public/assets/img/me/'
BOX_W, BOX_H = 560, 600          # hero portrait box in CSS px
im = ImageOps.exif_transpose(Image.open(src)).convert('RGB')
mask = Image.open(mask_path).convert('L').resize(im.size)

# Frame: subject centred horizontally, head near the top, legs running off the bottom.
x0, y0 = 3150 - 1600, 4000 - 3430
crop = (x0, y0, x0 + 3200, 4000)
photo = im.crop(crop); m = mask.crop(crop)

# Cutout at 2x, with a soft edge and a bottom dissolve.
cw, ch = BOX_W * 2, BOX_H * 2
cut = ImageEnhance.Color(photo.resize((cw, ch), Image.LANCZOS)).enhance(0.92)
a = m.resize((cw, ch), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.2))
fade = Image.linear_gradient('L').resize((cw, ch))          # 0 top -> 255 bottom
fade = fade.point(lambda v: 255 if v < 170 else max(0, int(255 * (1 - (v - 170) / 70))))
a = Image.composite(a, Image.new('L', a.size, 0), fade)
cut.putalpha(a)
cut.save(OUT + 'cutout.webp', 'WEBP', quality=82, method=6)

# Splats: jittered samples over the box, colours from a lightly blurred copy of the photo.
small = photo.resize((BOX_W, BOX_H), Image.LANCZOS)
blur = small.filter(ImageFilter.GaussianBlur(1.1))
detail = small.convert('L').filter(ImageFilter.FIND_EDGES).filter(ImageFilter.GaussianBlur(3))
ms = m.resize((BOX_W, BOX_H), Image.LANCZOS)
random.seed(7)
rows = []
step = 5.4
y = 0.0
while y < BOX_H:
    x = 0.0
    while x < BOX_W:
        px, py = x + random.uniform(0, step), y + random.uniform(0, step)
        if px < BOX_W and py < BOX_H:
            person = ms.getpixel((int(px), int(py))) / 255
            legs = py / BOX_H > 0.62
            if person < 0.45 or (legs and random.random() < (py / BOX_H - 0.62) * 2.2):
                r, g, b = blur.getpixel((int(px), int(py)))
                busy = min(1, detail.getpixel((int(px), int(py))) / 40)
                radius = random.uniform(2.3, 4.0) * (1.45 - 0.6 * busy)
                # Calm water below the horizon (~48% down) becomes long horizontal streaks;
                # trees, rocks and the subject keep small, randomly oriented splats.
                water = py / BOX_H > 0.47 and busy < 0.45 and person < 0.2
                if water:
                    radius *= 1.7
                    angle = int((random.uniform(-0.06, 0.06) % 3.14159) / 3.14159 * 255)
                    aspect = random.randrange(55, 110)
                else:
                    angle, aspect = random.randrange(256), random.randrange(110, 256)
                rows.append(struct.pack('<HHBBBBBBBB',
                    int(px / BOX_W * 65535), int(py / BOX_H * 65535),
                    min(255, int(radius * 20)), angle, aspect,
                    r, g, b, random.randrange(256), random.randrange(256)))
        x += step
    y += step
open(OUT + 'splats.bin', 'wb').write(b''.join(rows))
print(len(rows), 'splats')
