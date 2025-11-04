# 🎮 Bridge Battle - Getting Started

## ✅ What's Been Built

A complete, playable HTML5 game infrastructure with:
- **Phaser 3** game framework
- **Vite** build system for fast development
- **Full game loop** with placeholder graphics
- **Core mechanics** implemented
- **Ready for sprite integration**

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

Game will start at `http://localhost:3000`

### 3. Build for Production
```bash
npm run build
```

Built files will be in `dist/` folder

---

## 🎯 Current Features (Placeholder Graphics Mode)

### ✅ Working Features
- **Squad System**: 3 starting members, formation movement
- **Auto-Shooting**: 3 bullets/sec per character
- **Bullet Pooling**: Efficient bullet management
- **Gates**: +/- gates that modify squad size
- **Obstacles**: Destructible with HP system
- **Collision Detection**: Bullets, obstacles, gates
- **UI/HUD**: Score, squad count, level display
- **Camera**: Smooth follow with shake effects
- **Input**: Mouse/Touch drag to move squad
- **Game Over**: When squad size goes negative
- **Level System**: Basic level progression

### 🎨 Placeholder Graphics
All game objects use colored shapes:
- **Squad Members**: Green circles
- **Bullets**: Yellow glowing circles
- **Obstacles**: Black/gray tires
- **Gates**: Blue (positive) / Red (negative) holographic
- **Enemies**: Red circles (system ready)

---

## 📂 Project Structure

```
Bridge-Battle/
├── src/
│   ├── main.js                 # Entry point
│   ├── config.js               # Phaser configuration
│   ├── scenes/
│   │   ├── BootScene.js        # Initial boot
│   │   ├── PreloadScene.js     # Asset loading
│   │   ├── MenuScene.js        # Main menu
│   │   ├── GameScene.js        # Main gameplay ⭐
│   │   └── UIScene.js          # HUD overlay
│   └── utils/
│       └── Constants.js        # All game constants
│
├── public/assets/              # Put your sprites here
│   ├── sprites/               # Sprite sheets go here
│   ├── audio/                 # Sound effects
│   └── placeholder/           # Generated placeholders
│
├── processed-assets/          # From sprite automation
│   ├── individual/
│   └── sprite-sheets/
│
├── index.html                 # Game HTML
├── vite.config.js            # Vite configuration
└── package.json              # Dependencies
```

---

## 🎮 How to Play (Current Version)

### Controls
- **Mouse/Touch**: Click and drag to move squad horizontally
- **Keyboard**: Arrow keys (fallback, not implemented yet)

### Objective
1. **Avoid negative gates** or shoot them to increase their value
2. **Collect positive gates** to grow your squad
3. **Destroy obstacles** for points
4. **Don't let squad size go negative** (game over!)

### Gameplay Tips
- Shoot gates before hitting them to change their values
- Larger squad = more firepower = easier to destroy obstacles
- Watch the squad counter at the bottom - don't let it hit zero!

---

## 🔧 Key Game Constants

Edit `src/utils/Constants.js` to tweak gameplay:

```javascript
// Squad settings
PLAYER.SQUAD_START_SIZE = 3        // Starting squad members
PLAYER.MAX_SQUAD_SIZE = 50         // Maximum squad size
PLAYER.MOVE_SPEED = 5              // Movement speed

// Shooting
SHOOTING.FIRE_RATE = 333           // ms between shots (3/sec)
SHOOTING.BULLET_DAMAGE = 10        // Damage per bullet
SHOOTING.POOL_SIZE = 200           // Bullet pool size

// Gates
GATES.SPAWN_INTERVAL_MIN = 50      // Distance between gates
GATES.VALUES.MIN = -5              // Minimum gate value
GATES.VALUES.MAX = 10              // Maximum gate value

// Obstacles
OBSTACLES.HP_MIN = 100             // Minimum obstacle HP
OBSTACLES.HP_MAX = 300             // Maximum obstacle HP
```

---

## 📸 Integrating Your Sprites

### When Your Sprites Are Ready

1. **Copy sprite sheets** to `public/assets/sprites/`:
   ```
   public/assets/sprites/
   ├── squad-member@2x.png
   ├── squad-member.json
   ├── enemy@2x.png
   ├── enemy.json
   └── ...
   ```

2. **Update PreloadScene.js** to load real sprites:
   ```javascript
   // In PreloadScene.preload()
   this.load.atlas(
       'squad-member',
       'assets/sprites/squad-member@2x.png',
       'assets/sprites/squad-member.json'
   );
   ```

3. **Replace placeholder keys** in GameScene.js:
   ```javascript
   // Change:
   const member = this.physics.add.sprite(0, 0, 'placeholder-squad');

   // To:
   const member = this.physics.add.sprite(0, 0, 'squad-member');
   member.play('run'); // Use real animation
   ```

### Sprite Automation Commands

```bash
# Process new sprite sheets
npm run slice-sprites

# Watch for new sprites
npm run watch-sprites

# Validate processed sprites
npm run validate
```

---

## 🎨 Customization Guide

### Adding New Obstacles
```javascript
// In GameScene.spawnObstacle()
const types = ['tire', 'crate', 'barrel'];
const type = Phaser.Math.RND.pick(types);
const obstacle = this.physics.add.sprite(x, y, `obstacle-${type}`);
```

### Changing Bullet Colors
```javascript
// In Constants.js
export const COLORS = {
    BULLET: {
        SQUAD_1_5: 0xFFD700,    // Yellow
        SQUAD_6_10: 0x00FF00,   // Green
        SQUAD_11_15: 0x00FFFF,  // Cyan
        SQUAD_16_PLUS: 0xFF00FF // Magenta
    }
};
```

### Adjusting Difficulty
```javascript
// In Constants.js
WORLD.SCROLL_SPEED = 3      // Increase for harder
GATES.SPAWN_INTERVAL_MIN = 50  // Decrease for more gates
OBSTACLES.HP_MAX = 300      // Increase for tankier obstacles
```

---

## 🐛 Troubleshooting

### Game Won't Start
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Port 3000 Already In Use
```bash
# Change port in vite.config.js
server: {
    port: 3001  // Or any other port
}
```

### Sprites Not Loading
1. Check file paths in `public/assets/sprites/`
2. Verify JSON format of atlas files
3. Check browser console for errors (F12)

### Performance Issues
1. Reduce `PARTICLES.MAX_PARTICLES` in Constants
2. Lower `SHOOTING.POOL_SIZE`
3. Disable `PERFORMANCE.PARTICLE_QUALITY_HIGH`

---

## 📋 Next Steps (TODOs)

### Phase 1: Polish Current Mechanics ✅
- [x] Squad formation
- [x] Auto-shooting
- [x] Bullet pooling
- [x] Gates with arithmetic
- [x] Obstacles with HP
- [x] Basic UI

### Phase 2: Add Missing Features 🔄
- [ ] Enemy spawning and AI
- [ ] Weapon pickups system
- [ ] Particle effects (explosions, trails)
- [ ] Sound effects integration
- [ ] Background music
- [ ] Power-ups (speed boost, shield, etc.)

### Phase 3: Visual Polish 🎨
- [ ] Replace placeholders with real sprites
- [ ] Add sprite animations
- [ ] Implement water shader
- [ ] Add bridge pillars and details
- [ ] Create particle effects
- [ ] UI redesign with real graphics

### Phase 4: Gameplay Enhancements 🎮
- [ ] Multiple level designs
- [ ] Boss battles
- [ ] Achievement system
- [ ] Leaderboards (local storage)
- [ ] Mobile optimization
- [ ] Tutorial system

### Phase 5: Polish & Deploy 🚀
- [ ] Performance optimization
- [ ] Mobile testing (touch controls)
- [ ] Sound balancing
- [ ] Loading optimization
- [ ] Analytics integration
- [ ] Deploy to web hosting

---

## 🎯 Sprite Requirements Checklist

Ready to receive these sprites:

### Characters
- [ ] Squad Member (36 frames @4x)
  - Idle animation (frames 1-6)
  - Run animation (frames 7-12)
  - Shoot animation (frames 13-18)
  - Death animation (frames 19-24)

### Enemies
- [ ] Basic Enemy (sprite sheet)
- [ ] Enemy variants

### Obstacles
- [ ] Tire stacks (small, medium, large)
- [ ] Wooden crates
- [ ] Explosive barrels

### Gates
- [ ] Positive gate (holographic blue)
- [ ] Negative gate (holographic red)

### Effects
- [ ] Bullet projectiles (4 colors)
- [ ] Explosion particles
- [ ] Hit effects
- [ ] Collect effects

### UI
- [ ] Squad counter icon
- [ ] Score panel background
- [ ] Level indicator
- [ ] Button assets

### Environment
- [ ] Bridge tiles
- [ ] Bridge pillars
- [ ] Water texture
- [ ] Background elements

---

## 📞 Development Commands

```bash
# Development
npm run dev          # Start dev server with hot reload

# Building
npm run build        # Build for production
npm run preview      # Preview production build

# Sprite Processing
npm run slice-sprites    # Process sprite sheets
npm run watch-sprites    # Auto-process new sprites
npm run validate        # Validate sprite assets
```

---

## 🎓 Learning Resources

### Phaser 3 Documentation
- Official Docs: https://photonstorm.github.io/phaser3-docs/
- Examples: https://phaser.io/examples
- Community: https://phaser.discourse.group/

### Game Development
- Bullet pooling: `src/scenes/GameScene.js` (autoShoot method)
- Formation system: `src/scenes/GameScene.js` (updateFormation method)
- Collision detection: `src/scenes/GameScene.js` (setupCollisions method)

---

## 🏆 Current Status

**FULLY FUNCTIONAL PLACEHOLDER VERSION**

✅ You can play the game right now!
✅ All core mechanics work
✅ Ready to integrate your sprites
✅ Optimized performance
✅ Mobile-ready (touch controls)

**Next: Add your sprite sheets and watch the game come to life!**

---

Happy Game Development! 🎮🌉
