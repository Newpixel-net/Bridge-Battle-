#!/usr/bin/env python3
"""
Extract individual UI elements from the master high-res PNG
Uses intelligent cropping based on transparency and bounding boxes
"""

from PIL import Image
import numpy as np
import os
import json

def find_elements(image_path, output_dir, padding=20):
    """
    Find and extract individual UI elements from a sprite sheet
    """
    print(f"🔍 Loading image: {image_path}")
    img = Image.open(image_path)

    # Convert to numpy array
    img_array = np.array(img)

    print(f"   📊 Image size: {img.width}x{img.height} pixels")
    print(f"   📊 Mode: {img.mode}")

    # Check if image has alpha channel
    if img.mode != 'RGBA':
        print("   ⚠️  Converting to RGBA...")
        img = img.convert('RGBA')
        img_array = np.array(img)

    # Get alpha channel
    alpha = img_array[:, :, 3]

    # Find bounding boxes of non-transparent regions
    # Threshold: consider pixels with alpha > 10 as non-transparent
    mask = alpha > 10

    # Find rows and columns with any non-transparent pixels
    rows = np.any(mask, axis=1)
    cols = np.any(mask, axis=0)

    if not np.any(rows) or not np.any(cols):
        print("   ❌ No non-transparent content found!")
        return []

    # Get overall bounding box
    row_min, row_max = np.where(rows)[0][[0, -1]]
    col_min, col_max = np.where(cols)[0][[0, -1]]

    print(f"   📦 Content bounds: ({col_min}, {row_min}) to ({col_max}, {row_max})")

    # Based on the reference image, manually define element regions
    # This is more reliable than automatic detection for organized sprite sheets
    elements = define_ui_regions(img.width, img.height)

    extracted = []
    os.makedirs(output_dir, exist_ok=True)

    for i, element in enumerate(elements):
        name = element['name']
        x, y, w, h = element['box']

        # Add padding
        x1 = max(0, x - padding)
        y1 = max(0, y - padding)
        x2 = min(img.width, x + w + padding)
        y2 = min(img.height, y + h + padding)

        # Crop element
        element_img = img.crop((x1, y1, x2, y2))

        # Auto-crop to remove excess transparency
        element_img = autocrop_transparency(element_img)

        # Save
        output_path = os.path.join(output_dir, f"{name}.png")
        element_img.save(output_path, 'PNG', optimize=True)

        print(f"   ✓ Extracted: {name} ({element_img.width}x{element_img.height}px)")

        extracted.append({
            'name': name,
            'original_box': element['box'],
            'cropped_size': [element_img.width, element_img.height],
            'file': output_path
        })

    return extracted

def autocrop_transparency(img, threshold=10):
    """
    Remove transparent edges from image
    """
    img_array = np.array(img)

    if img.mode != 'RGBA':
        return img

    alpha = img_array[:, :, 3]
    mask = alpha > threshold

    rows = np.any(mask, axis=1)
    cols = np.any(mask, axis=0)

    if not np.any(rows) or not np.any(cols):
        return img

    row_min, row_max = np.where(rows)[0][[0, -1]]
    col_min, col_max = np.where(cols)[0][[0, -1]]

    return img.crop((col_min, row_min, col_max + 1, row_max + 1))

def define_ui_regions(width, height):
    """
    Define UI element regions based on the reference layout
    Approximate positions - will be refined with auto-crop
    """
    # Based on 12917x3750 image
    # Divide into logical sections

    w = width
    h = height

    # Approximate region definitions (will be auto-cropped)
    elements = [
        # Victory panel (left side)
        {'name': 'panel_victory', 'box': [int(w*0.02), int(h*0.05), int(w*0.15), int(h*0.90)]},

        # Stars (center-left area)
        {'name': 'star_filled_01', 'box': [int(w*0.18), int(h*0.05), int(w*0.05), int(h*0.15)]},
        {'name': 'star_filled_02', 'box': [int(w*0.24), int(h*0.05), int(w*0.05), int(h*0.15)]},
        {'name': 'star_filled_03', 'box': [int(w*0.30), int(h*0.05), int(w*0.05), int(h*0.15)]},

        {'name': 'star_empty_01', 'box': [int(w*0.18), int(h*0.25), int(w*0.05), int(h*0.15)]},
        {'name': 'star_empty_02', 'box': [int(w*0.24), int(h*0.25), int(w*0.05), int(h*0.15)]},
        {'name': 'star_empty_03', 'box': [int(w*0.30), int(h*0.25), int(w*0.05), int(h*0.15)]},

        {'name': 'star_empty_04', 'box': [int(w*0.18), int(h*0.45), int(w*0.05), int(h*0.15)]},
        {'name': 'star_empty_05', 'box': [int(w*0.24), int(h*0.45), int(w*0.05), int(h*0.15)]},
        {'name': 'star_empty_06', 'box': [int(w*0.30), int(h*0.45), int(w*0.05), int(h*0.15)]},

        # Resource icons (center area)
        {'name': 'icon_heart', 'box': [int(w*0.37), int(h*0.05), int(w*0.04), int(h*0.12)]},
        {'name': 'counter_timer', 'box': [int(w*0.42), int(h*0.05), int(w*0.08), int(h*0.12)]},
        {'name': 'icon_gem', 'box': [int(w*0.51), int(h*0.05), int(w*0.04), int(h*0.12)]},

        {'name': 'icon_coin', 'box': [int(w*0.37), int(h*0.20), int(w*0.04), int(h*0.12)]},
        {'name': 'counter_coins', 'box': [int(w*0.42), int(h*0.20), int(w*0.08), int(h*0.12)]},

        {'name': 'badge_level_24', 'box': [int(w*0.37), int(h*0.65), int(w*0.04), int(h*0.15)]},
        {'name': 'badge_level_25', 'box': [int(w*0.42), int(h*0.65), int(w*0.04), int(h*0.15)]},
        {'name': 'badge_level_26', 'box': [int(w*0.47), int(h*0.65), int(w*0.04), int(h*0.15)]},

        # Defeat panel (center-right)
        {'name': 'panel_defeat', 'box': [int(w*0.58), int(h*0.05), int(w*0.15), int(h*0.90)]},

        # Menu buttons (right side)
        {'name': 'button_new_game', 'box': [int(w*0.75), int(h*0.05), int(w*0.12), int(h*0.12)]},
        {'name': 'button_resume', 'box': [int(w*0.75), int(h*0.20), int(w*0.12), int(h*0.12)]},
        {'name': 'button_settings', 'box': [int(w*0.75), int(h*0.35), int(w*0.12), int(h*0.12)]},
        {'name': 'button_shop', 'box': [int(w*0.75), int(h*0.50), int(w*0.12), int(h*0.12)]},
        {'name': 'button_exit', 'box': [int(w*0.75), int(h*0.65), int(w*0.12), int(h*0.12)]},

        # Grass decorations
        {'name': 'decoration_grass_left', 'box': [int(w*0.02), int(h*0.85), int(w*0.08), int(h*0.12)]},
        {'name': 'decoration_grass_right', 'box': [int(w*0.92), int(h*0.85), int(w*0.08), int(h*0.12)]},
    ]

    return elements

def main():
    import sys

    input_path = "processed-assets/ui-extracted/ui-master-highres.png"
    output_dir = "processed-assets/ui-elements"

    if len(sys.argv) > 1:
        input_path = sys.argv[1]
    if len(sys.argv) > 2:
        output_dir = sys.argv[2]

    print("\n" + "="*70)
    print("🎨 UI Element Extractor")
    print("="*70 + "\n")

    extracted = find_elements(input_path, output_dir)

    # Save metadata
    metadata = {
        'source': input_path,
        'elements': extracted,
        'total': len(extracted)
    }

    metadata_path = os.path.join(output_dir, 'metadata.json')
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)

    print(f"\n✅ Extraction complete!")
    print(f"   📦 Extracted {len(extracted)} elements")
    print(f"   📁 Output: {output_dir}/")
    print(f"   📋 Metadata: {metadata_path}\n")

if __name__ == '__main__':
    main()
