from pathlib import Path

from PIL import Image, ImageDraw


SOURCE_DIR = Path(r"C:\Users\Utente\Downloads")
OUTPUT_DIR = Path(__file__).resolve().parents[1] / "public" / "payment-logos"
PREVIEW_PATH = Path(__file__).resolve().parents[1] / ".tmp-payment-logos-preview.png"

SOURCES = {
    "scalapay": "v1zyofziuqsgafu1oagq.avif",
    "apple-pay": "Apple_Pay_logo.svg.webp",
    "google-pay": "google-pay-logo-png-2448x998-11735759504jb0ziavbyr.webp",
    "klarna": "Klarna_Payment_Badge.svg.webp",
    "postepay": "png-transparent-postepay-icon.png",
    "mastercard": "MasterCard-Logo-1996-2016.png",
    "visa": "kisspng-logo-brand-product-trademark-travel-visa-visa-logo-svg-vector-amp-png-transparent-vecto-5ba3cb8382ee59.1644032215374611235363.jpg",
    "paypal": "images (2).png",
}

CHECKERBOARD_SOURCES = {"google-pay", "postepay", "visa", "paypal"}


def remove_light_checkerboard(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = []
    for red, green, blue, alpha in rgba.getdata():
        brightness = min(red, green, blue)
        neutral = max(red, green, blue) - brightness <= 20
        if neutral and brightness >= 205:
            pixels.append((red, green, blue, 0))
        else:
            pixels.append((red, green, blue, alpha))
    rgba.putdata(pixels)
    return rgba


def trim_and_resize(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    alpha = rgba.getchannel("A")
    bounds = alpha.getbbox()
    if bounds:
        rgba = rgba.crop(bounds)

    rgba.thumbnail((360, 128), Image.Resampling.LANCZOS)
    padded = Image.new("RGBA", (rgba.width + 8, rgba.height + 8), (0, 0, 0, 0))
    padded.alpha_composite(rgba, (4, 4))
    return padded


def build_preview(processed: dict[str, Image.Image]) -> None:
    cell_width, cell_height = 240, 100
    preview = Image.new("RGB", (cell_width * 2, cell_height * 4), "#16131e")
    draw = ImageDraw.Draw(preview)

    for index, (name, logo) in enumerate(processed.items()):
        x = (index % 2) * cell_width
        y = (index // 2) * cell_height
        draw.rounded_rectangle((x + 8, y + 8, x + cell_width - 8, y + cell_height - 8), 8, fill="white")
        display = logo.copy()
        display.thumbnail((cell_width - 32, cell_height - 32), Image.Resampling.LANCZOS)
        preview.paste(display, (x + (cell_width - display.width) // 2, y + (cell_height - display.height) // 2), display)
        draw.text((x + 12, y + 10), name, fill="#5a5268")

    preview.save(PREVIEW_PATH, optimize=True)


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    processed: dict[str, Image.Image] = {}

    for name, filename in SOURCES.items():
        image = Image.open(SOURCE_DIR / filename)
        if name in CHECKERBOARD_SOURCES:
            image = remove_light_checkerboard(image)
        logo = trim_and_resize(image)
        logo.save(OUTPUT_DIR / f"{name}.webp", "WEBP", lossless=True, method=6, exact=True)
        processed[name] = logo

    build_preview(processed)


if __name__ == "__main__":
    main()
