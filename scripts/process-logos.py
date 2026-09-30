"""
Procesa los logos originales (brand/*.jpg) y genera versiones web optimizadas
con fondo transparente en public/img/brand/ y los iconos del sitio en public/.
Uso: pip install pillow && python3 scripts/process-logos.py
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageChops

ROOT = Path(__file__).resolve().parent.parent
BRAND = ROOT / "brand"
OUT = ROOT / "public" / "img" / "brand"
PUB = ROOT / "public"
OUT.mkdir(parents=True, exist_ok=True)

CREAM = (247, 243, 236)
GREEN = (31, 94, 67)


def remove_background(im, bg, lo=14, hi=70):
    """Convierte el fondo crema en transparencia (con bordes suaves)."""
    im = im.convert("RGB")
    px = im.load()
    out = Image.new("RGBA", im.size)
    po = out.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b = px[x, y]
            d = ((r - bg[0]) ** 2 + (g - bg[1]) ** 2 + (b - bg[2]) ** 2) ** 0.5
            a = min(max((d - lo) / (hi - lo), 0), 1)
            if a <= 0:
                po[x, y] = (0, 0, 0, 0)
                continue
            # des-mezclar el color del fondo
            c = [min(max(round((v - (1 - a) * bv) / a), 0), 255) for v, bv in zip((r, g, b), bg)]
            po[x, y] = (*c, round(a * 255))
    return out


def trim(im, pad=12):
    bbox = im.getchannel("A").point(lambda v: 255 if v > 25 else 0).getbbox()
    x0, y0, x1, y1 = bbox
    return im.crop((max(x0 - pad, 0), max(y0 - pad, 0), min(x1 + pad, im.width), min(y1 + pad, im.height)))


def recolor_green(im, color):
    """Versión para fondos oscuros: el verde de marca pasa a crema."""
    im = im.copy()
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a and g > r + 20 and g > b + 5 and (r + g + b) < 330:
                px[x, y] = (*color, a)
    return im


def save(im, name, height=None, size=None):
    if height:
        im = im.resize((round(im.width * height / im.height), height), Image.LANCZOS)
    if size:
        im = im.resize((size, size), Image.LANCZOS)
    im.save(OUT / f"{name}.png", optimize=True)
    im.save(OUT / f"{name}.webp", quality=90, method=6)
    return im


# --- Logo horizontal -------------------------------------------------------
src = Image.open(BRAND / "logo-horizontal-original.jpg")
bg = tuple(sum(c) // 4 for c in zip(*(src.convert("RGB").getpixel(p) for p in [(8, 8), (src.width - 8, 8), (8, src.height - 8), (src.width - 8, src.height - 8)])))
logo = trim(remove_background(src, bg))
save(logo, "logo-horizontal", height=240)
save(logo, "logo-header", height=128)
save(recolor_green(logo, CREAM), "logo-footer", height=128)
print("logo horizontal:", logo.size)

# --- Emblema circular -------------------------------------------------------
em = Image.open(BRAND / "emblema-original.jpg").convert("RGB")
diff = ImageChops.difference(em, Image.new("RGB", em.size, (255, 255, 255))).convert("L").point(lambda v: 255 if v > 30 else 0)
x0, y0, x1, y1 = diff.getbbox()
side = max(x1 - x0, y1 - y0)
cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
em = em.crop((cx - side // 2, cy - side // 2, cx + side // 2, cy + side // 2))
S = 4  # máscara circular con antialias
mask = Image.new("L", (em.width * S, em.height * S), 0)
ImageDraw.Draw(mask).ellipse((S, S, em.width * S - S, em.height * S - S), fill=255)
mask = mask.resize(em.size, Image.LANCZOS)
em = em.convert("RGBA")
em.putalpha(mask)
save(em, "emblema", size=512)
print("emblema:", em.size)

# Iconos del sitio
# Para tamaños pequeños se hace zoom a las montañas (el aro fino no se ve a 32 px)
w = em.width
zoom = em.crop((round(w * 0.14), round(w * 0.14), round(w * 0.86), round(w * 0.86)))
zmask = Image.new("L", (zoom.width * S, zoom.height * S), 0)
ImageDraw.Draw(zmask).ellipse((0, 0, zoom.width * S, zoom.height * S), fill=255)
zoom.putalpha(zmask.resize(zoom.size, Image.LANCZOS))
for size, name in [(32, "favicon-32.png"), (180, "apple-touch-icon.png"), (192, "icon-192.png"), (512, "icon-512.png")]:
    icon = (zoom if size <= 180 else em).resize((size, size), Image.LANCZOS)
    if name == "apple-touch-icon.png":  # iOS no admite transparencia
        base = Image.new("RGBA", (size, size), CREAM + (255,))
        base.alpha_composite(icon)
        icon = base.convert("RGB")
    icon.save(PUB / name, optimize=True)
zoom.resize((48, 48), Image.LANCZOS).save(PUB / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
print("iconos listos")
