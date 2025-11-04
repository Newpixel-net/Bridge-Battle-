# 🎮 Bridge Battle - Sprite Automation System

Complete automated sprite processing pipeline for the Bridge Battle mobile runner game.

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Workflow](#-workflow)
- [AI Sprite Generation](#-ai-sprite-generation)
- [Processing Scripts](#-processing-scripts)
- [Configuration](#-configuration)
- [Troubleshooting](#-troubleshooting)

---

## ⚡ Quick Start

### Step 1: Install & Setup (2 minutes)

```bash
# Install dependencies
npm install
```

### Step 2: Generate Sprites with AI (10-30 minutes)

Review the sprite request template:

```bash
# Open sprite-requests.json to see what sprites to generate
cat sprite-requests.json
```

**Recommended AI Tools:**

| Tool | Best For | URL |
|------|----------|-----|
| **God Mode AI** | Character animations, 8-directional sprites | https://www.godmodeai.co/ |
| **Ludo.ai** | Animated sprites with sound effects | https://ludo.ai/features/sprite-generator |
| **PixelVibe** | UI elements, items, backgrounds | https://lab.rosebud.ai/ai-game-assets |

**Place generated sprites in:**

```
raw-assets/ai-generated/
├── characters/       # Squad members (required)
├── enemies/          # Enemy characters (required)
├── obstacles/        # Tire stacks, crates (required)
├── gates/            # Holographic gates (required)
├── ui/               # HUD elements
├── effects/          # Bullets, explosions, particles
├── weapons/          # Weapon pickups
└── backgrounds/      # Bridge sections, water
```

**💡 Pro Tip:** For automatic sprite sheet packing, put animation frames in a folder with `{tps}` tag:

```
raw-assets/ai-generated/hero-walk{tps}/
├── frame-01.png
├── frame-02.png
├── frame-03.png
└── ...
```

### Step 3: Run Automation & Launch (1 minute)

```bash
# Process all sprites (resize, optimize, generate multiple resolutions)
npm run process

# Pack animation frames into sprite sheets
npm run pack-sheets

# Additional optimization for mobile
npm run optimize

# Validate all assets
npm run validate
```

---

## 📁 Project Structure

```
Bridge-Battle/
├── raw-assets/              # Your AI-generated sprites go here
│   └── ai-generated/
│       ├── characters/
│       ├── enemies/
│       ├── obstacles/
│       ├── gates/
│       ├── ui/
│       ├── effects/
│       ├── weapons/
│       └── backgrounds/
│
├── processed-assets/        # Auto-generated processed sprites
│   ├── individual/          # Individual sprites (1x, 2x, 4x resolutions)
│   ├── sprite-sheets/       # Packed sprite sheets with atlases
│   └── optimized/           # Further optimized for production
│
├── scripts/                 # Automation scripts
│   ├── process-sprites.js   # Main processing pipeline
│   ├── pack-sprite-sheets.js # Sprite sheet packer
│   ├── optimize-sprites.js  # Additional optimization
│   ├── validate-assets.js   # Asset validator
│   └── watch-sprites.js     # Auto-process on file add
│
├── config/                  # Configuration files
│   └── sprite-config.json   # Sprite specifications
│
├── reference-images/        # Reference images and mockups
│
├── sprite-requests.json     # Template for AI sprite generation
├── package.json
└── README.md
```

---

## 🔄 Workflow

### Complete Workflow

```
1. Generate sprites with AI tools
   ↓
2. Place in raw-assets/ai-generated/
   ↓
3. Run npm run process
   ↓
4. Review processed-assets/
   ↓
5. Import into Unity/Godot
```

### Automated Workflow (Watch Mode)

```bash
# Start watching for new sprites
npm run watch

# Now just drop sprites into raw-assets/ai-generated/
# They'll be automatically processed!
```

---

## 🤖 AI Sprite Generation

### Required Sprites (Start Here!)

#### 1. Squad Members (Characters)

**Tool:** God Mode AI
**Prompt:**
```
Create a cartoon-style military character with a gun, bright colors, clean outlines.
Running animation in 8 directions. Character should be large and visible on mobile.
Simple but expressive design. Size: 128x192px.
```

**Animations needed:**
- Idle (8 directions)
- Run (8 directions)
- Shoot (8 directions)
- Death (1 direction)

**Folder:** `raw-assets/ai-generated/characters/squad-member-run{tps}/`

#### 2. Enemies

**Tool:** God Mode AI
**Prompt:**
```
Create cartoon enemy character, red/orange color scheme, menacing but not scary.
Idle and death animations. Should be clearly distinguishable from blue-colored player squad.
Size: 128x192px.
```

**Folder:** `raw-assets/ai-generated/enemies/`

#### 3. Obstacles (Tire Stacks)

**Tool:** PixelVibe
**Prompt:**
```
Create stacks of tires (small, medium, large variants), cartoon style with clear outlines.
Black rubber with highlights. Top should have flat area for weapon pickups.
```

**Folder:** `raw-assets/ai-generated/obstacles/tire-stacks/`

#### 4. Holographic Gates

**Tool:** PixelVibe
**Prompt:**
```
Create holographic gate effects: blue glowing gate for positive numbers, red glowing
gate for negative numbers. Translucent with bright edges. Futuristic hologram style.
Should span full width (2048px wide).
```

**Folder:** `raw-assets/ai-generated/gates/`

### Optional Sprites (Enhance the Game!)

See `sprite-requests.json` for complete list with detailed specifications.

---

## 🛠️ Processing Scripts

### `npm run process` (Main Script)

Processes all sprites in `raw-assets/ai-generated/`:
- ✅ Resizes to multiple resolutions (1x, 2x, 4x)
- ✅ Converts to PNG and WebP formats
- ✅ Optimizes for mobile performance
- ✅ Generates metadata JSON
- ✅ Preserves alpha channels for transparency

**Output:** `processed-assets/individual/`

### `npm run pack-sheets` (Sprite Sheet Packer)

Automatically packs animation frames from `{tps}` folders:
- ✅ Detects folders with `{tps}` tag
- ✅ Arranges frames in optimal grid layout
- ✅ Generates sprite sheet atlas JSON
- ✅ Power-of-two dimensions for GPU optimization

**Output:** `processed-assets/sprite-sheets/`

**Example Atlas JSON:**
```json
{
  "name": "hero-walk",
  "imageFile": "hero-walk.png",
  "frameWidth": 128,
  "frameHeight": 192,
  "frameCount": 8,
  "columns": 4,
  "rows": 2,
  "frames": [
    {"frame": 0, "x": 0, "y": 0, "width": 128, "height": 192},
    ...
  ]
}
```

### `npm run optimize` (Additional Optimization)

Further optimizes processed sprites:
- ✅ Maximum compression for mobile
- ✅ Removes unnecessary metadata
- ✅ Near-lossless WebP compression
- ✅ Reports file size savings

**Output:** `processed-assets/optimized/`

### `npm run validate` (Asset Validator)

Validates all sprites for common issues:
- ✅ Checks file sizes (< 1MB per sprite)
- ✅ Validates dimensions (reasonable sizes)
- ✅ Verifies power-of-two dimensions (GPU-friendly)
- ✅ Checks for alpha channels (transparency)
- ✅ Verifies required categories exist

### `npm run watch` (Auto-Process Mode)

Watches for new sprites and auto-processes:
- ✅ Monitors `raw-assets/ai-generated/`
- ✅ Automatically processes new files
- ✅ Auto-packs sprite sheets from `{tps}` folders
- ✅ Real-time feedback

---

## ⚙️ Configuration

### Sprite Specifications

Edit `config/sprite-config.json` to customize:

```json
{
  "processing": {
    "resolutions": [
      {"suffix": "", "scale": 1},
      {"suffix": "@2x", "scale": 2},
      {"suffix": "@4x", "scale": 4}
    ],
    "formats": ["png", "webp"],
    "optimization": {
      "maxFileSizeKB": 1024,
      "recommendedFileSizeKB": 500
    }
  },
  "spriteSheets": {
    "maxSheetSize": 4096,
    "padding": 2,
    "powerOfTwo": true
  }
}
```

### Modify Processing Settings

Edit `scripts/process-sprites.js`:

```javascript
const CONFIG = {
  RESOLUTIONS: [
    { suffix: '', scale: 1 },
    { suffix: '@2x', scale: 2 },
    { suffix: '@4x', scale: 4 }
  ],
  FORMATS: ['png', 'webp'],
  QUALITY: {
    png: { compressionLevel: 9 },
    webp: { quality: 85, effort: 6 }
  }
};
```

---

## 🎯 Game-Specific Requirements

### Bridge Battle Sprite Specs

Based on the game development brief:

#### Character Sprites
- **Size:** 1.5 units tall (~128x192px)
- **Visibility:** Must be BIG and visible on mobile
- **Animations:** Idle, Run, Shoot, Death
- **Directions:** 8-directional for formation movement
- **Style:** Bright cartoon, clean outlines

#### Obstacles
- **Tire Stacks:** 100-300 HP, 2-4 units tall
- **HP Display:** Space for large HP text
- **Variants:** Small, Medium, Large
- **Weapon Pickups:** Flat top surface for placement

#### Gates
- **Width:** 40+ units (FULL bridge width)
- **Style:** Holographic, translucent
- **Colors:** Blue/cyan for positive, Red/orange for negative
- **Number Display:** Large visible numbers (+5, -3, etc.)

#### Effects
- **Bullets:** Small glowing orbs (16-32px)
- **Colors:** Yellow → Green → Cyan → Magenta (based on squad size)
- **Explosions:** 8-12 frame animations, multiple colors
- **Damage Numbers:** VERY large golden text (64-128px)

#### UI Elements
- **Size:** OVERSIZED for mobile visibility
- **Contrast:** High contrast for readability
- **Elements:** Score panel, Level indicator, Squad counter

---

## 🚀 Usage in Game Engine

### Unity

1. Import sprites from `processed-assets/individual/`
2. For sprite sheets, use atlas JSON to slice:
   ```csharp
   // Load atlas JSON
   TextAsset atlasJson = Resources.Load<TextAsset>("hero-walk");
   SpriteAtlas atlas = JsonUtility.FromJson<SpriteAtlas>(atlasJson.text);
   ```

3. Set sprite import settings:
   - Sprite Mode: Multiple
   - Pixels Per Unit: Based on your game scale
   - Filter Mode: Bilinear
   - Compression: High Quality

### Godot

1. Import sprites from `processed-assets/individual/`
2. For sprite sheets, create AtlasTexture:
   ```gdscript
   var atlas = AtlasTexture.new()
   atlas.atlas = load("res://sprites/hero-walk.png")
   atlas.region = Rect2(0, 0, 128, 192)  # Use JSON coordinates
   ```

### Phaser

```javascript
// Load sprite sheet with atlas
this.load.atlas(
  'hero-walk',
  'sprites/hero-walk.png',
  'sprites/hero-walk.json'
);

// Use in game
this.add.sprite(x, y, 'hero-walk', 'frame-01.png');
```

---

## 🐛 Troubleshooting

### Common Issues

#### "No sprites found"
- **Solution:** Place sprites in `raw-assets/ai-generated/` subdirectories

#### "Error: Cannot find module 'sharp'"
- **Solution:** Run `npm install` to install dependencies

#### "File too large" warnings
- **Solution:** Use AI tools to generate smaller images, or run `npm run optimize`

#### Sprite sheets not packing
- **Solution:** Ensure folder name contains `{tps}` tag (e.g., `hero-walk{tps}`)

#### Images look blurry in game
- **Solution:** Use higher resolution variant (@2x or @4x) for your target devices

### Performance Tips

1. **Use WebP format** for backgrounds and large images (smaller file size)
2. **Use PNG format** for sprites needing sharp edges and transparency
3. **Power-of-two dimensions** (128, 256, 512, etc.) for better GPU performance
4. **Sprite sheets** reduce draw calls (better performance than individual sprites)
5. **Target file sizes:** < 500KB for sprites, < 1MB for backgrounds

---

## 📚 Resources

### Game Development Brief

See `Bridge Battle Game Development Brief` for complete game specifications.

### AI Tool Links

- **God Mode AI:** https://www.godmodeai.co/
- **Ludo.ai:** https://ludo.ai/features/sprite-generator
- **PixelVibe:** https://lab.rosebud.ai/ai-game-assets

### Documentation

- `sprite-requests.json` - Detailed sprite specifications
- `config/sprite-config.json` - Processing configuration
- `scripts/` - Automation script source code

---

## 🎮 Next Steps

1. ✅ **Generate sprites** using AI tools (start with required categories)
2. ✅ **Place in folders** according to category
3. ✅ **Run processing** (`npm run process`)
4. ✅ **Pack sprite sheets** (`npm run pack-sheets`)
5. ✅ **Validate** (`npm run validate`)
6. ✅ **Import to game engine** (Unity/Godot)
7. ✅ **Start building** Bridge Battle!

---

## 📝 License

MIT License - Feel free to use for your game projects!

---

## 🤝 Contributing

Found a bug or have a suggestion? Open an issue or submit a pull request!

---

**Happy Game Development! 🎮**
