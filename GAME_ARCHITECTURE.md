# Bridge Battle - Game Architecture Plan

## Technology Stack

### Core Framework
**Phaser 3** (v3.70+) - HTML5 Game Framework
- Excellent performance on mobile
- Built-in physics (Arcade Physics)
- Strong sprite/animation system
- WebGL renderer with fallback to Canvas
- Asset management and preloading
- Scene management

### Build System
- **Vite** - Fast build tool for modern web
- **ES6 Modules** - Clean code organization
- **Hot Module Replacement** - Fast development

### Performance
- Target: 30+ FPS on 2015-era devices
- WebGL renderer with batching
- Object pooling for bullets and particles
- Sprite atlases for reduced draw calls

---

## Project Structure

```
Bridge-Battle/
├── src/                          # Game source code
│   ├── main.js                   # Entry point
│   ├── config.js                 # Phaser configuration
│   │
│   ├── scenes/                   # Game scenes
│   │   ├── BootScene.js          # Initial loading
│   │   ├── PreloadScene.js       # Asset preloading
│   │   ├── MenuScene.js          # Main menu
│   │   ├── GameScene.js          # Main gameplay
│   │   └── UIScene.js            # HUD overlay
│   │
│   ├── entities/                 # Game objects
│   │   ├── Player.js             # Squad member (single unit)
│   │   ├── Squad.js              # Squad manager
│   │   ├── Bullet.js             # Single bullet
│   │   ├── Gate.js               # +/- gates
│   │   ├── Obstacle.js           # Destructible objects
│   │   └── Enemy.js              # Enemy units
│   │
│   ├── systems/                  # Core game systems
│   │   ├── BulletPool.js         # Bullet pooling system
│   │   ├── FormationSystem.js    # Squad formation logic
│   │   ├── ShootingSystem.js     # Auto-shooting system
│   │   ├── ParticleSystem.js     # VFX manager
│   │   ├── LevelGenerator.js     # Procedural level creation
│   │   └── CameraController.js   # Camera follow logic
│   │
│   ├── ui/                       # UI components
│   │   ├── HUD.js                # Score, squad count, etc.
│   │   ├── DamageNumber.js       # Floating damage text
│   │   └── SquadCounter.js       # Large squad display
│   │
│   ├── utils/                    # Utilities
│   │   ├── Constants.js          # Game constants
│   │   ├── MathUtils.js          # Math helpers
│   │   └── ColorUtils.js         # Color transitions
│   │
│   └── assets/                   # Asset references
│       └── AssetKeys.js          # Asset key constants
│
├── public/                       # Static assets
│   ├── assets/
│   │   ├── sprites/              # From processed-assets
│   │   ├── audio/                # Sound effects
│   │   ├── fonts/                # Custom fonts
│   │   └── placeholder/          # Temporary graphics
│   │
│   └── index.html                # Game HTML
│
├── processed-assets/             # Sprite automation output
├── raw-assets/                   # Source sprites
├── scripts/                      # Sprite automation scripts
├── dist/                         # Build output
├── vite.config.js                # Vite configuration
└── package.json                  # Dependencies
```

---

## Core Systems Architecture

### 1. Squad System
```
Squad (Manager)
├── FormationSystem
│   ├── Calculate positions (blob formation)
│   ├── Separation forces
│   └── Dynamic scaling based on count
│
├── SquadMembers (Array)
│   └── Player instances
│
└── Input Handler
    └── Horizontal movement (touch/mouse)
```

**Key Features:**
- Dynamic formation that scales with squad size
- Smooth interpolation between positions
- Collision detection for movement boundaries
- Visual feedback (animations, trails)

### 2. Shooting System
```
ShootingSystem
├── Fire Rate: 3 bullets/sec per character
├── BulletPool (Object Pool)
│   ├── Pre-instantiate 200 bullets
│   ├── Reuse bullets for performance
│   └── Auto-return on collision/timeout
│
└── Bullet Properties
    ├── Speed: 15 units/sec
    ├── Color based on squad size
    ├── Trail effect (particle)
    └── Damage: 10 per bullet
```

**Bullet Color System:**
- 1-5 squad: Yellow (#FFD700)
- 6-10 squad: Green (#00FF00)
- 11-15 squad: Cyan (#00FFFF)
- 16+ squad: Magenta (#FF00FF)

### 3. Gate System
```
Gate
├── Type: POSITIVE (+) or NEGATIVE (-)
├── Value: Displayed number
├── Width: Full bridge width (40 units)
├── Can be shot to increase value
│   └── Each 10 damage = +1 to gate value
│
└── On Collision with Squad
    ├── Calculate: newSquadSize = current + gateValue
    ├── Game Over if newSquadSize < 0
    └── Visual feedback (pulse, particles)
```

**Gate Arithmetic:**
```javascript
// Example: 5 squad members, hit -3 gate
current = 5
gateValue = -3
result = 5 + (-3) = 2  // Continue playing

// Example: 2 squad members, hit -5 gate
current = 2
gateValue = -5
result = 2 + (-5) = -3  // GAME OVER (would go negative)
```

### 4. Obstacle System
```
Obstacle
├── HP: 100-300
├── HP Display: Large text above obstacle
├── On Damage:
│   ├── Update HP display
│   ├── Spawn damage number
│   └── Play hit effect
│
└── On Destroyed:
    ├── Explosion particles
    ├── Screen shake
    ├── Award points
    └── Drop weapon pickup (if applicable)
```

### 5. Level Generation
```
LevelGenerator
├── Spawn System (procedural)
│   ├── Distance-based spawning
│   ├── Difficulty curve
│   └── Obstacle variety
│
├── Spawn Types:
│   ├── Gates (every 50-100 units)
│   ├── Obstacles (random intervals)
│   ├── Enemies (clusters)
│   └── Weapon pickups (on obstacles)
│
└── Level Length: 1000+ units
```

---

## Visual Systems

### 1. Camera System
```
CameraController
├── Position: 8-10 units back, 8 units up
├── Follow: Squad center (lerp smoothing)
├── Shake: On explosions (amplitude based on size)
└── Bounds: Keep bridge in view
```

### 2. Bridge Environment
```
Bridge
├── Width: 40 units (fills 80% of screen)
├── Surface: Gray with white lane markings
├── Pillars: Red (Golden Gate style)
│   └── Spawn every 100 units
│
└── Water (Simplified for HTML5)
    ├── Animated sprite or tilemap
    ├── Sine wave movement (CSS/shader if WebGL)
    └── Scroll speed matches game speed
```

**Water Shader (WebGL - Optional Enhancement):**
```glsl
// Simplified sine wave water
float wave1 = sin(time * 0.5 + uv.x * 2.0) * 0.1;
float wave2 = sin(time * 0.7 + uv.y * 3.0) * 0.05;
float wave3 = cos(time * 0.3 + uv.x * 1.5) * 0.08;
float height = wave1 + wave2 + wave3;
```

### 3. Particle System
```
ParticleSystem
├── ExplosionEmitter (pool of emitters)
├── BulletTrailEmitter
├── GateParticles (shimmer effect)
└── PickupGlowEmitter

Performance:
- Max 500 particles on screen
- Auto-recycle particles
- Lower quality on older devices
```

### 4. UI/HUD System
```
HUD (Separate Scene - Overlay)
├── Score Display
│   ├── Position: Top-left
│   ├── Font: Large, bold, white
│   └── Updates: Every obstacle destroyed
│
├── Level Indicator
│   ├── Position: Top-right
│   └── Format: "Level 1"
│
└── Squad Counter
    ├── Position: Bottom-center
    ├── Size: VERY LARGE
    ├── Format: Icon + Number
    └── Animation: Pulse on change
```

---

## Game Loop & State Management

### Game States
```
BOOT → PRELOAD → MENU → GAME → GAME_OVER
```

### GameScene Update Loop
```javascript
update(time, delta) {
    // 1. Player Input
    this.handleInput();

    // 2. Squad Movement & Formation
    this.squad.update(delta);

    // 3. Shooting System
    this.shootingSystem.update(delta);

    // 4. Bullet Updates
    this.bulletPool.update(delta);

    // 5. Level Generation
    this.levelGenerator.update(delta);

    // 6. Collision Detection
    this.checkCollisions();

    // 7. Camera Follow
    this.cameraController.update(delta);

    // 8. UI Updates
    this.updateHUD();
}
```

---

## Performance Optimizations

### 1. Object Pooling
- **Bullets:** Pre-allocate 200 bullets
- **Particles:** Pool of 500 particles
- **Damage Numbers:** Pool of 50 text objects
- **Obstacles:** Pool of 30 obstacles

### 2. Sprite Atlases
- Pack all sprites into 2-3 atlases
- Use @4x frames from sprite automation
- Reduce draw calls significantly

### 3. Animation Pooling
- Pre-create animation states
- Reuse animation instances
- Disable off-screen animations

### 4. Culling
- Only update objects near camera
- Destroy objects far behind player
- Limit particle spawns on older devices

### 5. Memory Management
```javascript
// Destroy objects when off-screen
if (object.y < camera.y - 100) {
    object.destroy();
}

// Clear unused assets
this.textures.remove('unused_texture');
```

---

## Asset Integration Plan

### Sprite Assets (From Automation System)
```
processed-assets/individual/characters/squad-member/
├── frame-01@4x.png  → Idle animation
├── frame-07@4x.png  → Run animation
├── frame-13@4x.png  → Shoot animation
└── ...

processed-assets/sprite-sheets/squad-member/
├── squad-member@2x.png  → Full sprite sheet
└── squad-member.json    → Atlas data
```

**Integration:**
1. Copy sprite sheet to `public/assets/sprites/`
2. Load with Phaser atlas loader
3. Create animations from atlas JSON
4. Apply to squad members

### Placeholder Assets (Initial Development)
- Colored rectangles for squad members
- Circles for bullets
- Simple shapes for obstacles/gates
- CSS-based UI elements

---

## Development Phases

### Phase 1: Core Infrastructure ✅
- [x] Set up Vite + Phaser project
- [x] Create scene structure
- [x] Basic game loop
- [x] Constants and utilities

### Phase 2: Player & Movement 🔄
- [ ] Squad system with formation
- [ ] Input handling (touch/mouse)
- [ ] Camera follow
- [ ] Movement boundaries

### Phase 3: Shooting System 🔄
- [ ] Bullet pooling
- [ ] Auto-shooting (3/sec per character)
- [ ] Bullet trails
- [ ] Bullet colors based on squad size

### Phase 4: Gates & Arithmetic 🔄
- [ ] Gate spawning
- [ ] Gate collision detection
- [ ] Squad size modification
- [ ] Game over logic

### Phase 5: Obstacles & Combat 🔄
- [ ] Obstacle system with HP
- [ ] Bullet-obstacle collision
- [ ] Damage numbers
- [ ] Destruction effects

### Phase 6: Polish & VFX 🔄
- [ ] Particle systems
- [ ] Screen shake
- [ ] Sound effects
- [ ] Juice & feel

### Phase 7: Integration 🔄
- [ ] Replace placeholders with real sprites
- [ ] UI styling
- [ ] Performance optimization
- [ ] Mobile testing

---

## Technical Decisions

### Why Phaser 3?
✅ Mature, production-ready
✅ Excellent mobile performance
✅ Built-in physics and pooling
✅ Great documentation
✅ WebGL + Canvas fallback
✅ Active community

### Performance Targets
- 60 FPS on modern devices
- 30+ FPS on 2015-era devices
- < 50MB total asset size
- < 2 second load time

### Input System
- Touch: Single finger drag
- Mouse: Click and drag
- Keyboard: Arrow keys (fallback)

---

## Next Steps

1. ✅ Set up Vite + Phaser project structure
2. ✅ Create scene framework
3. 🔄 Implement squad system with placeholders
4. 🔄 Add shooting system
5. 🔄 Create gate system
6. 🔄 Build obstacle system
7. 🔄 Add VFX and polish
8. 🔄 Integrate real sprites
9. 🔄 Optimize and test

---

## Asset Requirements Checklist

**Ready to Receive:**
- [ ] Squad member sprites (36 frames @4x)
- [ ] Enemy sprites
- [ ] Obstacle sprites (tires, crates)
- [ ] Gate sprites (holographic effects)
- [ ] Weapon pickup sprites
- [ ] UI elements (icons, buttons)
- [ ] Background tiles (bridge, water)
- [ ] Particle textures

**Placeholder Until Then:**
- [x] Colored shapes for all game objects
- [x] CSS-based UI
- [x] Simple text labels
- [x] Basic particle effects

---

**This architecture provides a solid foundation for building Bridge Battle with professional quality and performance.**
