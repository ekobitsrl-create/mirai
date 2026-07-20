from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
MASCOT_ROOT = ROOT / "public" / "mascot"
OUTPUT_ROOT = MASCOT_ROOT / "rigging"


# x, y, width, height. Each cut keeps a small overlap at the joints so a rigger
# can mesh/deform the parts without exposing gaps.
MALE_PARTS = [
    ("head-shell", (31, 0, 246, 191), "root", (123, 181)),
    ("hood", (29, 0, 250, 199), "head-shell", (125, 182)),
    ("headphone-left", (34, 46, 74, 106), "head-shell", (50, 53)),
    ("headphone-right", (204, 45, 75, 107), "head-shell", (26, 53)),
    ("visor-source", (75, 31, 164, 115), "head-shell", (82, 57)),
    ("torso-hoodie", (76, 151, 161, 202), "root", (81, 7)),
    ("arm-left-upper", (37, 163, 72, 111), "torso-hoodie", (54, 14)),
    ("arm-left-lower", (26, 246, 77, 102), "arm-left-upper", (49, 9)),
    ("hand-left", (24, 303, 72, 53), "arm-left-lower", (50, 9)),
    ("arm-right-upper", (202, 163, 72, 111), "torso-hoodie", (17, 14)),
    ("arm-right-lower", (206, 246, 77, 102), "arm-right-upper", (28, 9)),
    ("hand-right", (216, 303, 72, 53), "arm-right-lower", (23, 9)),
    ("belt-waist", (75, 293, 164, 72), "torso-hoodie", (82, 12)),
    ("strap-left", (60, 321, 76, 216), "belt-waist", (38, 4)),
    ("strap-right", (173, 321, 76, 216), "belt-waist", (38, 4)),
    ("thigh-left", (50, 339, 105, 147), "belt-waist", (62, 5)),
    ("shin-left", (55, 457, 103, 109), "thigh-left", (60, 8)),
    ("shoe-left", (52, 534, 109, 118), "shin-left", (55, 10)),
    ("thigh-right", (155, 339, 105, 147), "belt-waist", (42, 5)),
    ("shin-right", (151, 457, 103, 109), "thigh-right", (43, 8)),
    ("shoe-right", (149, 534, 109, 118), "shin-right", (54, 10)),
    ("hip-pouch-left", (49, 340, 65, 103), "belt-waist", (38, 7)),
    ("hip-pouch-right", (195, 340, 65, 103), "belt-waist", (27, 7)),
]

FEMALE_PARTS = [
    ("head-shell", (67, 0, 215, 196), "root", (107, 183)),
    ("ponytail", (219, 0, 122, 240), "head-shell", (28, 36)),
    ("headphone-left", (65, 53, 73, 106), "head-shell", (53, 54)),
    ("headphone-right", (236, 53, 73, 106), "head-shell", (20, 54)),
    ("visor-source", (103, 36, 150, 113), "head-shell", (75, 56)),
    ("torso-jacket", (77, 165, 201, 167), "root", (101, 8)),
    ("top-chest", (114, 204, 130, 126), "torso-jacket", (65, 6)),
    ("arm-left-upper", (69, 184, 72, 113), "torso-jacket", (53, 13)),
    ("arm-left-lower", (58, 262, 75, 103), "arm-left-upper", (50, 9)),
    ("hand-left", (54, 322, 68, 52), "arm-left-lower", (48, 7)),
    ("arm-right-upper", (224, 184, 72, 113), "torso-jacket", (17, 13)),
    ("arm-right-lower", (230, 262, 75, 103), "arm-right-upper", (25, 9)),
    ("hand-right", (242, 322, 68, 52), "arm-right-lower", (20, 7)),
    ("belt-waist", (93, 300, 169, 69), "torso-jacket", (85, 8)),
    ("strap-left", (88, 326, 71, 209), "belt-waist", (36, 4)),
    ("strap-right", (196, 326, 71, 209), "belt-waist", (36, 4)),
    ("thigh-left", (80, 349, 102, 151), "belt-waist", (61, 5)),
    ("shin-left", (85, 470, 98, 109), "thigh-left", (57, 8)),
    ("shoe-left", (80, 548, 106, 127), "shin-left", (53, 10)),
    ("thigh-right", (173, 349, 102, 151), "belt-waist", (41, 5)),
    ("shin-right", (171, 470, 98, 109), "thigh-right", (41, 8)),
    ("shoe-right", (168, 548, 106, 127), "shin-right", (53, 10)),
    ("hip-pouch-left", (77, 349, 65, 103), "belt-waist", (36, 6)),
    ("hip-pouch-right", (219, 349, 65, 103), "belt-waist", (29, 6)),
]


def save_png(image: Image.Image, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    image.save(destination, "PNG", optimize=True)


def crop_part(source: Image.Image, box: tuple[int, int, int, int]) -> Image.Image:
    left, top, width, height = box
    return source.crop((left, top, left + width, top + height))


def glow_layer(size: tuple[int, int], draw_callback, color: tuple[int, int, int, int], blur: int = 5) -> Image.Image:
    mask = Image.new("L", size, 0)
    draw_callback(ImageDraw.Draw(mask))
    blurred = mask.filter(ImageFilter.GaussianBlur(blur))
    layer = Image.new("RGBA", size, color)
    layer.putalpha(blurred)
    return layer


def face_eye(side: str, state: str) -> Image.Image:
    size = (64, 64)
    image = Image.new("RGBA", size, (0, 0, 0, 0))
    x = 13 if side == "left" else 9
    violet = (184, 92, 255, 255)

    def paint(draw: ImageDraw.ImageDraw) -> None:
        if state == "closed":
            draw.arc((x, 21, 64 - x, 51), start=15, end=165, fill=255, width=8)
        elif state == "thinking":
            draw.rounded_rectangle((x, 21, x + 18, 39), radius=7, fill=255)
            draw.ellipse((46, 40, 54, 48), fill=255)
            draw.ellipse((55, 33, 61, 39), fill=255)
        elif state == "surprised":
            draw.rounded_rectangle((x, 13, x + 20, 48), radius=10, fill=255)
        else:
            draw.rounded_rectangle((x, 16, x + 20, 47), radius=10, fill=255)

    image.alpha_composite(glow_layer(size, paint, violet, blur=5))
    draw = ImageDraw.Draw(image)
    if state == "closed":
        draw.arc((x, 21, 64 - x, 51), start=15, end=165, fill=violet, width=7)
    elif state == "thinking":
        draw.rounded_rectangle((x, 21, x + 18, 39), radius=7, fill=violet)
        draw.ellipse((46, 40, 54, 48), fill=violet)
        draw.ellipse((55, 33, 61, 39), fill=violet)
    elif state == "surprised":
        draw.rounded_rectangle((x, 13, x + 20, 48), radius=10, fill=(212, 172, 255, 255))
    else:
        draw.rounded_rectangle((x, 16, x + 20, 47), radius=10, fill=violet)
    return image


def face_mouth(state: str) -> Image.Image:
    size = (96, 64)
    image = Image.new("RGBA", size, (0, 0, 0, 0))
    violet = (184, 92, 255, 255)

    def paint(draw: ImageDraw.ImageDraw) -> None:
        if state == "open":
            draw.ellipse((35, 15, 61, 49), fill=255)
        elif state == "smile":
            draw.arc((18, 14, 78, 52), start=15, end=165, fill=255, width=7)
        elif state == "thinking":
            draw.arc((32, 19, 66, 45), start=195, end=345, fill=255, width=7)
        else:
            draw.line((25, 33, 71, 33), fill=255, width=7)

    image.alpha_composite(glow_layer(size, paint, violet, blur=4))
    draw = ImageDraw.Draw(image)
    if state == "open":
        draw.ellipse((35, 15, 61, 49), fill=(212, 172, 255, 255))
    elif state == "smile":
        draw.arc((18, 14, 78, 52), start=15, end=165, fill=violet, width=7)
    elif state == "thinking":
        draw.arc((32, 19, 66, 45), start=195, end=345, fill=violet, width=7)
    else:
        draw.line((25, 33, 71, 33), fill=violet, width=7)
    return image


def empty_face_screen() -> Image.Image:
    size = (168, 122)
    image = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((3, 4, 165, 118), radius=52, fill=(6, 8, 13, 255), outline=(210, 214, 224, 255), width=7)
    draw.rounded_rectangle((10, 11, 158, 111), radius=47, outline=(174, 92, 255, 220), width=2)
    draw.arc((24, 14, 143, 70), start=195, end=345, fill=(245, 245, 250, 75), width=6)
    glow = Image.new("RGBA", size, (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.rounded_rectangle((8, 9, 160, 113), radius=48, outline=(174, 92, 255, 255), width=4)
    image.alpha_composite(glow.filter(ImageFilter.GaussianBlur(6)))
    image.alpha_composite(glow)
    return image


def chest_triangle() -> Image.Image:
    size = (96, 96)
    image = Image.new("RGBA", size, (0, 0, 0, 0))
    glow = Image.new("RGBA", size, (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.polygon(((48, 12), (81, 72), (15, 72)), outline=(184, 92, 255, 255), width=8)
    image.alpha_composite(glow.filter(ImageFilter.GaussianBlur(6)))
    draw = ImageDraw.Draw(image)
    draw.polygon(((48, 12), (81, 72), (15, 72)), fill=(28, 17, 46, 255), outline=(184, 92, 255, 255), width=7)
    draw.polygon(((48, 30), (63, 58), (33, 58)), fill=(216, 180, 254, 255))
    return image


def surprise_sparkle() -> Image.Image:
    size = (80, 80)
    image = Image.new("RGBA", size, (0, 0, 0, 0))
    points = ((40, 4), (47, 31), (76, 40), (47, 49), (40, 76), (33, 49), (4, 40), (33, 31))
    glow = Image.new("RGBA", size, (0, 0, 0, 0))
    ImageDraw.Draw(glow).polygon(points, fill=(192, 132, 252, 255))
    image.alpha_composite(glow.filter(ImageFilter.GaussianBlur(7)))
    ImageDraw.Draw(image).polygon(points, fill=(216, 180, 254, 255))
    return image


def export_variant(variant: str, source_name: str, parts: list[tuple]) -> list[dict]:
    source_path = MASCOT_ROOT / source_name
    source = Image.open(source_path).convert("RGBA")
    variant_root = OUTPUT_ROOT / variant
    save_png(source, variant_root / "00-full-body-reference.png")

    manifest_parts = []
    for name, box, parent, pivot in parts:
        filename = f"{name}.png"
        save_png(crop_part(source, box), variant_root / filename)
        manifest_parts.append(
            {
                "id": f"{variant}/{name}",
                "file": f"{variant}/{filename}",
                "parent": parent,
                "pivot": {"x": pivot[0], "y": pivot[1]},
                "sourceRect": {"x": box[0], "y": box[1], "width": box[2], "height": box[3]},
            }
        )
    return manifest_parts


def export_shared_assets() -> list[str]:
    face_root = OUTPUT_ROOT / "shared" / "face"
    accessory_root = OUTPUT_ROOT / "shared" / "accessories"
    save_png(empty_face_screen(), face_root / "screen-empty.png")

    asset_names = ["screen-empty"]
    for state in ("neutral", "closed", "surprised", "thinking"):
        for side in ("left", "right"):
            name = f"eye-{side}-{state}"
            save_png(face_eye(side, state), face_root / f"{name}.png")
            asset_names.append(name)
    for state in ("neutral", "smile", "open", "thinking"):
        name = f"mouth-{state}"
        save_png(face_mouth(state), face_root / f"{name}.png")
        asset_names.append(name)

    save_png(chest_triangle(), accessory_root / "chest-triangle.png")
    save_png(surprise_sparkle(), accessory_root / "surprise-sparkle.png")
    asset_names.extend(("chest-triangle", "surprise-sparkle"))
    return asset_names


def write_documentation(male_assets: list[dict], female_assets: list[dict], shared_assets: list[str]) -> None:
    manifest = {
        "format": "mira-rigging-pack-v1",
        "coordinateSystem": "pixel, origin top-left",
        "source": {
            "male": "public/mascot/mira-male-idle.webp",
            "female": "public/mascot/mira-female-idle.webp",
        },
        "assemblyOrder": [
            "root",
            "torso-jacket or torso-hoodie",
            "belt-waist",
            "thigh, shin, shoe",
            "arm upper, lower, hand",
            "head-shell, hair or hood, headphones, visor",
            "shared face screen, eyes, mouth, accessories",
        ],
        "faceLayout": {
            "screen": "shared/face/screen-empty.png",
            "leftEyeAnchor": {"x": 27, "y": 27},
            "rightEyeAnchor": {"x": 78, "y": 27},
            "mouthAnchor": {"x": 36, "y": 58},
        },
        "sharedAssets": [{"id": f"shared/{name}"} for name in shared_assets],
        "variants": {"male": male_assets, "female": female_assets},
        "notes": [
            "All raster components are PNG with alpha.",
            "Pivots are local to each exported PNG and are a 2D rigging starting point.",
            "The pieces intentionally overlap at joints to support mesh cleanup and deformation.",
            "Use the empty face screen above the source visor before adding eye and mouth assets.",
        ],
    }
    readme = """# MIRA Rigging Pack v1

Questo pacchetto contiene pezzi PNG separati per costruire un rig 2D di MIRA.
Le immagini derivano dalle versioni ufficiali gia presenti nel progetto: colori,
outfit e proporzioni restano coerenti con il sito.

## Struttura

- `male/` e `female/`: body parts, arti, scarpe, cintura, tasche e accessori testa.
- `shared/face/`: schermo vuoto, occhi e bocche intercambiabili.
- `shared/accessories/`: simbolo sul petto e scintilla per la reazione sorpresa.
- `rig-map.json`: ordine di composizione, gerarchia e pivot iniziali.

## Ordine consigliato

1. Inserire `00-full-body-reference.png` come guida non renderizzata.
2. Assemblare torso, cintura, gambe e scarpe.
3. Collegare braccia e mani a spalla e gomito.
4. Collegare testa, cuffie e capelli/cappuccio al collo.
5. Posizionare `shared/face/screen-empty.png` sopra il visore sorgente, poi gli occhi e la bocca scelti.

I joint hanno volutamente una piccola sovrapposizione: e utile per mesh warp,
deformazioni e pulizia del rigger. I pivot sono un punto di partenza e vanno
rifiniti nel software di rigging scelto.
"""
    (OUTPUT_ROOT / "rig-map.json").write_text(f"{json.dumps(manifest, indent=2)}\n", encoding="utf-8")
    (OUTPUT_ROOT / "README.md").write_text(readme, encoding="utf-8")


def main() -> None:
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    male_assets = export_variant("male", "mira-male-idle.webp", MALE_PARTS)
    female_assets = export_variant("female", "mira-female-idle.webp", FEMALE_PARTS)
    shared_assets = export_shared_assets()
    write_documentation(male_assets, female_assets, shared_assets)
    total_pngs = len(male_assets) + len(female_assets) + len(shared_assets) + 2
    print(f"Created {total_pngs} PNG assets in {OUTPUT_ROOT}")


if __name__ == "__main__":
    main()
