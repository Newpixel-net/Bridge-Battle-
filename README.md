# 🎮 Bridge Battle - Three.js 3D Runner Game

A mobile-style runner game built with Three.js featuring squad mechanics, auto-shooting, gates, and obstacles.

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Game Features](#-game-features)
- [Controls](#-controls)
- [Development](#-development)
- [Project Structure](#-project-structure)
- [Troubleshooting](#-troubleshooting)

---

## ⚡ Quick Start

### Step 1: Install Dependencies

```bash
# Install all dependencies (including Three.js)
npm install
```

### Step 2: Run Development Server

```bash
# Start the Vite dev server
npm run dev
```

Open your browser to the URL shown (usually http://localhost:5173)

### Step 3: Build for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build
npm run preview
```

---

## 🎮 Game Features

### Core Gameplay
- **Squad Formation:** Control a squad of 14 characters in a dynamic blob formation
- **Auto-Shooting:** Characters automatically shoot at targets ahead
- **Obstacles:** Destroy tire stacks with HP bars (50-100 HP each)
- **Full-Width Gates:** Unavoidable gates that modify squad size with arithmetic
- **Score System:** Earn points for distance traveled and destroying obstacles

### Visual Features
- **3D Graphics:** Built with Three.js for smooth 3D rendering
- **Enhanced Water Shader:** Multi-layer wave simulation beneath the bridge
- **Screen Shake:** Dynamic camera shake on impacts
- **Floating Text:** Damage numbers and gate values float up
- **UI System:** Score display and squad counter with pulse effects
- **Particle Effects:** Hit effects and explosions

### Technical Features
- **Bullet Pooling:** Efficient bullet system (500 bullet pool)
- **Blob Physics:** Squad members use separation forces to maintain formation
- **Collision Detection:** Bullets vs obstacles, gates, and more
- **Responsive:** Works on desktop and mobile devices

---

## 🎮 Controls

### Desktop
- **Mouse Drag:** Click and drag left/right to steer the squad
- **Mouse Hold:** Hold to continuously steer

### Mobile
- **Touch Drag:** Touch and drag left/right to steer the squad
- **Touch Hold:** Hold to continuously steer

### Gameplay
- Squad automatically moves forward
- Characters automatically shoot at obstacles
- Shoot gates before passing through to increase their positive values
- Avoid losing all squad members (game over)

---

## 🛠️ Development

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Sprite processing (legacy)
npm run process-sprites
npm run pack-sheets
npm run optimize
npm run validate
```

### Game Architecture

**Entry Point:** `index.html` → `src/main-threejs.js`

**Key Systems:**
- Scene setup and rendering
- Character system with blob physics
- Bullet pooling and auto-shooting
- Obstacle spawning and HP system
- Gate system with arithmetic
- Water shader with multi-layer waves
- UI and visual effects

### Customization

Edit `src/main-threejs.js` to modify:
- Squad size (default: 14 characters)
- Forward speed (default: 50 units/sec)
- Fire rate (default: 3 bullets/sec per character)
- Gate spawn interval (default: 8 seconds)
- Obstacle spawn interval (default: 2 seconds)

---

## 📁 Project Structure

```
Bridge-Battle/
├── src/
│   ├── main-threejs.js          # Main game code (Three.js)
│   ├── config.js                # Configuration
│   ├── scenes/                  # Game scenes (legacy Phaser)
│   ├── systems/                 # Game systems (legacy)
│   └── utils/                   # Utilities
│
├── dist/                        # Production build output (gitignored)
│
├── raw-assets/                  # Raw asset sources
├── processed-assets/            # Processed sprites (legacy)
│
├── scripts/                     # Sprite processing scripts (legacy)
│   ├── process-sprites.js
│   ├── pack-sprite-sheets.js
│   └── ...
│
├── config/                      # Configuration files
│
├── index.html                   # Entry HTML file
├── vite.config.js              # Vite configuration
├── package.json                # Dependencies
├── GAME_ARCHITECTURE.md        # Architecture documentation
├── PROJECT_SUMMARY.md          # Project summary
├── GETTING_STARTED.md          # Getting started guide
└── README.md                   # This file
```

---

## 🐛 Troubleshooting

### "Failed to resolve import 'three'"

**Solution:** Install dependencies
```bash
npm install
```

### Loading screen won't disappear

**Issue:** Game initializes but stays on loading screen
**Solution:** This has been fixed. Update to latest code from the repository.

### Build errors

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Game not loading

1. Check browser console for errors
2. Ensure you're running `npm run dev` or `npm run build` + `npm run preview`
3. Clear browser cache
4. Try a different browser

### Poor performance

1. Close other browser tabs
2. Update graphics drivers
3. Try a different browser (Chrome recommended)
4. Lower resolution or adjust game settings

---

## 🎯 Game Mechanics Details

### Squad Formation
- Characters use separation forces to avoid overlap
- Formation dynamically adjusts based on squad size
- Blob-like cohesive movement

### Gate System
- **Blue gates:** Positive values (add squad members)
- **Red gates:** Negative values (remove squad members)
- Shoot gates to increase their values by +1 per bullet
- Game over when squad size reaches 0

### Obstacle System
- Tire stacks with 50-100 HP
- Visible HP bars that update in real-time
- 10 damage per bullet
- 50 points for destroying an obstacle
- Screen shake on destruction

### Scoring
- **Distance:** 2 points per second
- **Hits:** 1 point per bullet hit
- **Destroyed:** 50 points per obstacle destroyed
- **Gates:** 10 points per squad member gained

---

## 📚 Documentation

- `GAME_ARCHITECTURE.md` - Technical architecture details
- `PROJECT_SUMMARY.md` - Project overview and progress
- `GETTING_STARTED.md` - Detailed getting started guide
- `Bridge Battle Game Development Brief` - Original game design document

---

## 🔧 Technical Stack

- **Rendering:** Three.js (3D WebGL)
- **Build Tool:** Vite
- **Language:** JavaScript (ES6+)
- **Dev Server:** Vite Dev Server with HMR

---

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

Output will be in `dist/` folder. Deploy this folder to any static hosting:

- **GitHub Pages:** Push `dist/` to gh-pages branch
- **Netlify:** Drag and drop `dist/` folder
- **Vercel:** Connect repository and set build command to `npm run build`
- **AWS S3:** Upload `dist/` contents to S3 bucket

---

## 🎨 Legacy: AI Sprite Generation

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
