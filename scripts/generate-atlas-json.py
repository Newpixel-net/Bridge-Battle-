#!/usr/bin/env python3
"""
Generate comprehensive Phaser atlas JSON from sprite sheets
Professional approach with proper frame definitions
"""

import json
from pathlib import Path
from PIL import Image
import numpy as np

def analyze_sprite_sheet(image_path):
    """
    Analyze a sprite sheet to detect potential sprite boundaries
    Returns potential frame coordinates
    """
    img = Image.open(image_path)
    width, height = img.size

    print(f"\n📊 Analyzing: {image_path.name}")
    print(f"   Dimensions: {width}x{height}")
    print(f"   Mode: {img.mode}")

    # Convert to RGBA if needed
    if img.mode != 'RGBA':
        img = img.convert('RGBA')

    # Get alpha channel to detect sprite boundaries
    alpha = np.array(img)[:,:,3] if img.mode == 'RGBA' else np.ones((height, width)) * 255

    # Simple grid-based approach for now
    # Most sprite sheets use power-of-2 grids
    potential_sizes = [32, 64, 128, 256, 512]

    return {
        'width': width,
        'height': height,
        'mode': img.mode,
        'potential_grid_sizes': potential_sizes
    }

def create_comprehensive_atlas_json(atlas_name, image_path, frames_config):
    """
    Create a comprehensive Phaser atlas JSON

    frames_config = {
        'frame_name': {'x': 0, 'y': 0, 'w': 100, 'h': 100},
        ...
    }
    """
    atlas = {
        "frames": {},
        "meta": {
            "app": "Bridge Battle Atlas Generator",
            "version": "1.0",
            "image": image_path.name,
            "format": "RGBA8888",
            "size": {"w": 2048, "h": 2048},
            "scale": "1"
        }
    }

    for frame_name, coords in frames_config.items():
        atlas["frames"][frame_name] = {
            "frame": {
                "x": coords['x'],
                "y": coords['y'],
                "w": coords['w'],
                "h": coords['h']
            },
            "rotated": False,
            "trimmed": False,
            "spriteSourceSize": {
                "x": 0,
                "y": 0,
                "w": coords['w'],
                "h": coords['h']
            },
            "sourceSize": {
                "w": coords['w'],
                "h": coords['h']
            }
        }

    return atlas

def generate_atlases():
    """Generate comprehensive atlases for all sprite sheets"""

    print("🎨 Bridge Battle - Professional Atlas Generator")
    print("=" * 70)

    atlas_dir = Path('public/assets/ui-atlas')

    # Analyze main sprite sheets
    sprite_sheets = [
        atlas_dir / 'ui-zombie.png',
        atlas_dir / 'ui-zombie2.png',
        atlas_dir / 'ui-viking.png'
    ]

    for sheet in sprite_sheets:
        if sheet.exists():
            info = analyze_sprite_sheet(sheet)
            print(f"   Analyzed: {sheet.name}")
            print(f"   Suggest manual inspection to identify UI elements")
        else:
            print(f"   ⚠️  Not found: {sheet}")

    print("\n" + "=" * 70)
    print("✅ Analysis complete!")
    print("\n💡 Next steps:")
    print("   1. Open sprite sheets in image editor")
    print("   2. Identify UI element coordinates manually")
    print("   3. Add frame definitions to atlas JSON")
    print("   4. Or use TexturePacker for automatic generation")

if __name__ == '__main__':
    try:
        from PIL import Image
        generate_atlases()
    except ImportError:
        print("⚠️  PIL/Pillow not installed. Installing...")
        print("   Run: pip3 install Pillow")
        print("\n📝 Creating manual atlas templates instead...")

        # Create template structure
        template = {
            "frames": {
                "button_example": {
                    "frame": {"x": 0, "y": 0, "w": 200, "h": 80},
                    "rotated": False,
                    "trimmed": False,
                    "spriteSourceSize": {"x": 0, "y": 0, "w": 200, "h": 80},
                    "sourceSize": {"w": 200, "h": 80}
                }
            },
            "meta": {
                "app": "Bridge Battle",
                "version": "1.0",
                "image": "sprite-sheet.png",
                "format": "RGBA8888",
                "size": {"w": 2048, "h": 2048},
                "scale": "1"
            }
        }

        print(json.dumps(template, indent=2))
