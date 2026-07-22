import argparse
from pathlib import Path

from PIL import Image, ImageFilter


def extract_neon(source: Image.Image) -> Image.Image:
    rgba = source.convert("RGBA")
    width, height = rgba.size
    source_pixels = list(rgba.getdata())
    bright = {
        (index % width, index // width)
        for index, (red, green, blue, _) in enumerate(source_pixels)
        if max(red, green, blue) >= 60
    }
    components = []

    while bright:
        pending = [bright.pop()]
        component = set(pending)
        while pending:
            x, y = pending.pop()
            for next_x in range(max(0, x - 1), min(width, x + 2)):
                for next_y in range(max(0, y - 1), min(height, y + 2)):
                    point = (next_x, next_y)
                    if point in bright:
                        bright.remove(point)
                        component.add(point)
                        pending.append(point)
        components.append(component)

    symbol = max(components, key=len)
    mask = Image.new("L", rgba.size, 0)
    mask_pixels = mask.load()
    for x, y in symbol:
        mask_pixels[x, y] = 255
    mask = mask.filter(ImageFilter.GaussianBlur(radius=1.35))

    pixels = []

    for index, (red, green, blue, _) in enumerate(source_pixels):
        intensity = max(red, green, blue)
        coverage = mask.getpixel((index % width, index // width)) / 255
        adjusted_intensity = max(0, round((intensity - 18) * 255 / 237))
        alpha = round(adjusted_intensity * coverage)
        if alpha <= 3 or intensity == 0:
            pixels.append((0, 0, 0, 0))
            continue

        pixels.append((
            min(255, round(red * 255 / intensity)),
            min(255, round(green * 255 / intensity)),
            min(255, round(blue * 255 / intensity)),
            alpha,
        ))

    rgba.putdata(pixels)
    return rgba


def resized(image: Image.Image, size: int) -> Image.Image:
    return image.resize((size, size), Image.Resampling.LANCZOS)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("--output-dir", type=Path, default=Path("public"))
    args = parser.parse_args()

    output_dir = args.output_dir.resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    favicon = resized(extract_neon(Image.open(args.source)), 512)

    favicon.save(output_dir / "favicon.png", optimize=True)
    resized(favicon, 180).save(output_dir / "apple-icon.png", optimize=True)
    resized(favicon, 32).save(output_dir / "favicon-32x32.png", optimize=True)
    resized(favicon, 32).save(output_dir / "icon-dark-32x32.png", optimize=True)
    resized(favicon, 32).save(output_dir / "icon-light-32x32.png", optimize=True)
    favicon.save(output_dir / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])


if __name__ == "__main__":
    main()
