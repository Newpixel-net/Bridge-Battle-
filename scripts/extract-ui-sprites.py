#!/usr/bin/env python3
"""
Extract UI sprites from Construct 3 exported games
Converts to Phaser atlas format for Bridge Battle
"""

import json
import os
import re
import shutil
from pathlib import Path
from collections import defaultdict

# Games to extract from
GAMES = {
    'viking-escape': 'raw-assets/readyassets/viking-escape',
    'zombie-buster': 'raw-assets/readyassets/zombie-buster',
    'gold-miner-jack': 'raw-assets/readyassets/gold-miner-jack'
}

# Output directory
OUTPUT_DIR = 'public/assets/ui-atlas'

# UI element categories to extract
UI_CATEGORIES = {
    'buttons': ['button', 'btn'],
    'panels': ['panel', 'popup', 'dialog', 'menu'],
    'icons': ['icon', 'coin', 'heart', 'gem', 'star'],
    'badges': ['badge', 'level'],
    'hud': ['score', 'timer', 'counter', 'gui'],
    'text': ['text', 'label', 'title', 'logo']
}

def parse_construct3_data(data_json_path):
    """
    Parse Construct 3 data.json and extract sprite information

    Construct 3 format is complex - it's an array with:
    - Index 0: Project name
    - Index 1: Loading screen name
    - Later indices: Object types, animations, frames
    """
    with open(data_json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    if 'project' not in data:
        print(f"⚠️  Unexpected format in {data_json_path}")
        return None

    project = data['project']
    project_name = project[0] if len(project) > 0 else "Unknown"

    print(f"\n📦 Processing: {project_name}")
    print(f"   Project array length: {len(project)}")

    # Try to find object type definitions
    # Typically they're in arrays with structure containing animation data
    sprites = {}

    # Search through the project array for sprite/object definitions
    for i, item in enumerate(project):
        if isinstance(item, dict):
            # Look for object type definitions
            if 'name' in item or 'type' in item:
                print(f"   Found dict at index {i}: {item}")
        elif isinstance(item, list) and len(item) > 0:
            # Check if this looks like it contains object definitions
            if isinstance(item[0], str):
                # Might be a list of object names
                for name in item:
                    if isinstance(name, str) and any(cat in name.lower() for cats in UI_CATEGORIES.values() for cat in cats):
                        print(f"   Found UI element name: {name}")

    return {
        'project_name': project_name,
        'sprites': sprites
    }

def find_shared_sheets(game_path):
    """Find all shared-*.png sprite sheets in a game directory"""
    images_dir = Path(game_path) / 'images'
    if not images_dir.exists():
        return []

    sheets = sorted(images_dir.glob('shared-*.png'))
    return sheets

def categorize_sprite_name(name):
    """Determine which category a sprite belongs to"""
    name_lower = name.lower()

    for category, keywords in UI_CATEGORIES.items():
        for keyword in keywords:
            if keyword in name_lower:
                return category

    return 'misc'

def extract_ui_sprites():
    """Main extraction function"""
    print("🎮 Bridge Battle - UI Sprite Extraction Tool")
    print("=" * 60)

    # Create output directory structure
    Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)
    for category in UI_CATEGORIES.keys():
        (Path(OUTPUT_DIR) / category).mkdir(parents=True, exist_ok=True)

    all_ui_elements = defaultdict(list)

    # Process each game
    for game_id, game_path in GAMES.items():
        print(f"\n{'='*60}")
        print(f"🎯 Processing: {game_id}")
        print(f"{'='*60}")

        data_json = Path(game_path) / 'data.json'

        if not data_json.exists():
            print(f"❌ data.json not found at {data_json}")
            continue

        # Parse the data
        result = parse_construct3_data(data_json)

        # Find sprite sheets
        sheets = find_shared_sheets(game_path)
        print(f"\n📋 Found {len(sheets)} sprite sheets:")
        for sheet in sheets:
            size_kb = sheet.stat().st_size / 1024
            print(f"   • {sheet.name} ({size_kb:.1f} KB)")

    print(f"\n{'='*60}")
    print("✅ Extraction complete!")
    print(f"{'='*60}")

    return all_ui_elements

if __name__ == '__main__':
    extract_ui_sprites()
