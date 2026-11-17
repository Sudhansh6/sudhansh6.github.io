"""Build the home-hero portrait from the original photo and its Vision person mask.

The real photo is kept; only its alpha is shaped. The subject stays fully opaque while the
surrounding shoreline fades out with a soft, irregular (noise-modulated) edge, so the photo
dissolves into the page instead of ending at a frame. Legs fade out toward the bottom.

Usage: python3 scripts/build-hero-portrait.py ~/Downloads/IMG_1582.JPG /tmp/me_mask.png
Output: public/assets/img/me/portrait.webp and portrait-dark.webp (1120x1200, shown at 560x600
CSS px). The dark variant drops the pale overcast sky and dims bright water, which would
otherwise glow as an oval on the dark page.
"""
import math, random, sys
from PIL import Image, ImageChops, ImageEnhance, ImageFilter, ImageOps

src, mask_path = sys.argv[1], sys.argv[2]
W, H = 1120, 1200
im = ImageOps.exif_transpose(Image.open(src)).convert('RGB')
mask = Image.open(mask_path).convert('L').resize(im.size)
x0, y0 = 3150 - 1600, 4000 - 3430
crop = (x0, y0, x0 + 3200, 4000)
photo = ImageEnhance.Color(im.crop(crop).resize((W, H), Image.LANCZOS)).enhance(0.9)
person = mask.crop(crop).resize((W, H), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.5))

# Low-frequency noise for an organic edge.
random.seed(3)
noise = Image.new('L', (28, 30))
noise.putdata([random.randrange(256) for _ in range(28 * 30)])
noise = noise.resize((W, H), Image.BICUBIC).filter(ImageFilter.GaussianBlur(40))

cx, cy, rx, ry = W * 0.5, H * 0.55, W * 0.44, H * 0.43
fall = Image.new('L', (W, H))
px = fall.load(); nz = noise.load()
for y in range(0, H):
    for x in range(0, W):
        d = math.hypot((x - cx) / rx, (y - cy) / ry) + (nz[x, y] / 255 - 0.5) * 0.45
        t = min(1, max(0, (1.0 - d) / 0.55))
        px[x, y] = int(255 * t * t * (3 - 2 * t))
# Bottom fade for the subject's legs (and anything else) over the last ~25%.
bottom = Image.linear_gradient('L').resize((W, H)).point(lambda v: 255 if v < 180 else max(0, int(255 * (1 - (v - 180) / 75))))
alpha = ImageChops.multiply(ImageChops.lighter(fall, person), bottom)
light = photo.copy(); light.putalpha(alpha)
light.save('public/assets/img/me/portrait.webp', 'WEBP', quality=84, method=6)

# Dark variant: rather than cutting the sky out with the person mask (which leaves a segmented
# edge and a halo around the hair), darken bright pixels by luminance toward the page colour.
# Hair is dark and stays untouched; sky showing between strands darkens smoothly, so the edge
# stays photographic. Only pixels well inside the person mask (face, skin) are protected.
lum = photo.convert('L')
above = Image.linear_gradient('L').resize((W, H)).point(lambda v: 255 if v < 0.42 * 255 else max(0, int(255 * (1 - (v - 0.42 * 255) / (0.14 * 255)))))
key = lum.point(lambda v: min(255, max(0, int((v - 70) * 255 / 110))))           # 0 dark .. 1 bright
weight = above.point(lambda v: int(v * 0.97 + (255 - v) * 0.8))                  # sky fully, water mostly
protect = ImageChops.invert(person.filter(ImageFilter.MinFilter(5)).filter(ImageFilter.GaussianBlur(1.5)))  # tight: no halo
skyness = ImageChops.multiply(ImageChops.multiply(key, weight), protect)
page = Image.new('RGB', (W, H), (17, 23, 19))
dark = Image.composite(page, ImageEnhance.Brightness(photo).enhance(0.88), skyness)
dark_alpha = ImageChops.multiply(ImageChops.lighter(fall, person), bottom)
dark.putalpha(dark_alpha)
dark.save('public/assets/img/me/portrait-dark.webp', 'WEBP', quality=84, method=6)
print('ok')
