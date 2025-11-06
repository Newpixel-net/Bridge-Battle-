# PHASER 3 + HTML5 GAME DEVELOPMENT - IRON RULES FOR CLAUDE CODE

## CORE PRINCIPLES

### 1. **NEVER DOWNGRADE - ONLY UPGRADE**
- Every code change MUST improve the existing codebase
- If a change would remove functionality, refactor instead of delete
- Always preserve working features while adding new ones
- Document WHY changes are improvements, not just WHAT changed
- Before modifying working code, create a backup or comment out the old version

### 2. **AAA GAME DEVELOPMENT STANDARDS**
This is not a prototype. This is production-quality code.
- Write code as if 1 million users will play this game
- Performance, scalability, and maintainability are non-negotiable
- Every system must be designed for expansion, not just immediate needs
- Code must be readable by other developers without explanation

---

## PHASER 3 ARCHITECTURE RULES

### **Scene Management**
```javascript
// ✅ CORRECT: Proper scene structure
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }
    
    preload() { /* Asset loading */ }
    create() { /* Initialization */ }
    update(time, delta) { /* Game loop */ }
    
    // Always include cleanup
    shutdown() {
        // Remove listeners, clear timers, destroy objects
    }
}

// ❌ WRONG: Global variables, no cleanup, mixed concerns
```

### **Asset Management**
- **Preload ALL assets** in `preload()` - never load during gameplay
- Use **asset packs** (JSON) for organization
- Implement **loading screens** with progress bars
- Cache textures properly - never reload the same asset
- Use **texture atlases** for sprites (not individual images)

### **Memory Management**
- **Destroy unused objects**: `sprite.destroy()`
- **Remove event listeners**: `this.events.off('eventName', callback)`
- **Clear timers**: `timer.remove()`
- **Unload scenes properly**: Use `shutdown()` method
- Pool frequently created/destroyed objects (bullets, particles, enemies)

---

## CODE QUALITY STANDARDS

### **1. State Management**
```javascript
// ✅ CORRECT: Centralized state
class GameState {
    constructor() {
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.isPaused = false;
    }
    
    updateScore(points) {
        this.score += points;
        this.events.emit('scoreChanged', this.score);
    }
}

// ❌ WRONG: State scattered across files
```

### **2. Input Handling**
```javascript
// ✅ CORRECT: Organized input system
class InputManager {
    constructor(scene) {
        this.scene = scene;
        this.keys = scene.input.keyboard.addKeys({
            up: 'W',
            down: 'S',
            left: 'A',
            right: 'D',
            shoot: 'SPACE'
        });
    }
    
    getDirection() {
        return {
            x: (this.keys.right.isDown ? 1 : 0) - (this.keys.left.isDown ? 1 : 0),
            y: (this.keys.down.isDown ? 1 : 0) - (this.keys.up.isDown ? 1 : 0)
        };
    }
}

// ❌ WRONG: Input checks scattered in update()
```

### **3. Collision Detection**
- Use **Physics Groups** for similar objects
- Enable `collider.active` only when needed
- Use **overlap** for triggers, **collide** for physics interactions
- Always add collision callbacks: `(obj1, obj2) => this.handleCollision(obj1, obj2)`

---

## PERFORMANCE OPTIMIZATION RULES

### **Critical Performance Standards**
- **Target**: 60 FPS constant, never drop below 55 FPS
- **Max draw calls per frame**: < 1000
- **Particle systems**: Reuse particles, cap max particles
- **Audio**: Preload all sounds, use audio sprites for SFX
- **Tweens**: Reuse tween objects, don't create new ones each frame

### **Object Pooling (MANDATORY for bullets, particles, enemies)**
```javascript
class ObjectPool {
    constructor(scene, classType, initialSize = 20) {
        this.group = scene.add.group({
            classType: classType,
            maxSize: 100,
            runChildUpdate: true
        });
        
        // Pre-create objects
        for (let i = 0; i < initialSize; i++) {
            let obj = this.group.create(0, 0);
            obj.setActive(false).setVisible(false);
        }
    }
    
    spawn(x, y) {
        let obj = this.group.getFirstDead(false);
        if (obj) {
            obj.setActive(true).setVisible(true);
            obj.setPosition(x, y);
            return obj;
        }
        return null;
    }
}
```

### **Texture Management**
- **Use texture atlases**: Pack sprites using TexturePacker or similar
- **Max texture size**: 2048x2048 for compatibility
- **Mipmaps**: Enable for textures that scale
- **Compression**: Use WebP with PNG fallback

---

## BUG IDENTIFICATION & DEBUGGING PROTOCOL

### **Before Calling Code "Fixed"**
1. **Test the specific bug** - Reproduce the exact error scenario
2. **Test related systems** - Ensure fix didn't break connected features
3. **Test edge cases**:
   - What happens at x=0 or max values?
   - What if the player is moving during this action?
   - What if multiple events trigger simultaneously?
4. **Check console** - Zero errors, zero warnings
5. **Monitor performance** - FPS didn't drop, memory didn't spike

### **Common Phaser 3 Bugs & Solutions**

| **Bug** | **Cause** | **Solution** |
|---------|----------|------------|
| Objects not appearing | Wrong depth/layer | Use `setDepth()` or proper layer order |
| Physics not working | Body not enabled | `this.physics.add.existing(sprite)` |
| Memory leak | No cleanup | Implement `shutdown()` in scenes |
| Input lag | Too many listeners | Debounce, use pointerdown once |
| Collision miss | Speed too high | Use CCD or reduce velocity |

---

## UPGRADE METHODOLOGY

### **When Adding New Features**
1. **Document current state** - What works now?
2. **Design the addition** - How does it integrate?
3. **Implement incrementally** - One system at a time
4. **Test continuously** - After each addition
5. **Refactor if needed** - Improve existing code to support new feature

### **When Refactoring**
```javascript
// STEP 1: Ensure current code works
// STEP 2: Write the new version alongside the old
// STEP 3: Test new version thoroughly
// STEP 4: Switch over, keep old code commented for 1 iteration
// STEP 5: Remove old code only after new code proves stable
```

### **Version Control Mindset**
Even without git in Claude Code:
- Comment major changes with `// [v1.2] Added feature X - Date`
- Keep working versions in commented blocks temporarily
- Document breaking changes at the top of files

---

## FILE STRUCTURE (MANDATORY)

```
game/
├── index.html              # Minimal, just loads game
├── assets/
│   ├── images/
│   │   ├── sprites/       # Character/object sprites
│   │   ├── backgrounds/   # BG images
│   │   └── ui/            # Interface elements
│   ├── audio/
│   │   ├── music/
│   │   └── sfx/
│   └── data/
│       └── levels/        # JSON level data
├── src/
│   ├── config.js          # Game configuration
│   ├── main.js            # Game initialization
│   ├── scenes/
│   │   ├── BootScene.js   # Asset loading
│   │   ├── MenuScene.js
│   │   ├── GameScene.js
│   │   └── UIScene.js
│   ├── entities/
│   │   ├── Player.js
│   │   ├── Enemy.js
│   │   └── Projectile.js
│   ├── systems/
│   │   ├── InputManager.js
│   │   ├── AudioManager.js
│   │   ├── GameState.js
│   │   └── LevelManager.js
│   └── utils/
│       ├── ObjectPool.js
│       └── MathHelpers.js
└── README.md              # Setup and architecture docs
```

---

## AAA FEATURES CHECKLIST

Every game MUST eventually include:

### **Core Systems**
- ✅ Smooth 60 FPS performance
- ✅ Responsive controls (< 16ms input delay)
- ✅ Save/Load system (localStorage + JSON)
- ✅ Settings menu (volume, controls, graphics quality)
- ✅ Pause functionality
- ✅ Multiple difficulty levels

### **Polish**
- ✅ Particle effects for key actions
- ✅ Screen shake on impacts
- ✅ Smooth camera following
- ✅ Transition animations between scenes
- ✅ Audio feedback for all interactions
- ✅ Visual feedback (hit flashes, damage numbers)

### **Juice** (Makes games feel AAA)
- ✅ Tweening animations (scale, rotation, alpha)
- ✅ Dynamic lighting/glow effects
- ✅ Post-processing (bloom, blur, chromatic aberration)
- ✅ Satisfying sound design
- ✅ Impact freeze frames (brief pause on hit)

---

## ERROR PREVENTION RULES

### **Before Submitting Code**
1. **No console errors** - Zero tolerance
2. **No `undefined` or `null` errors** - Always check existence
3. **No magic numbers** - Use named constants
4. **No hard-coded values** - Use config files
5. **No global scope pollution** - Everything in classes/modules

### **Defensive Programming**
```javascript
// ✅ ALWAYS check before using
if (this.player && this.player.active) {
    this.player.update(delta);
}

// ✅ Use optional chaining
this.player?.body?.setVelocity(100, 0);

// ✅ Provide defaults
const damage = enemy.attackPower || 10;

// ❌ NEVER assume existence
this.player.update(); // Could crash if player is destroyed
```

---

## COMMUNICATION PROTOCOL

### **When Presenting Code Changes**
1. **Explain WHAT changed** - "Added enemy spawning system"
2. **Explain WHY** - "To increase difficulty progression"
3. **List improvements** - "Now supports 50+ enemies without lag"
4. **Note dependencies** - "Requires ObjectPool class"
5. **Testing done** - "Tested with 100 enemies, FPS stable at 60"

### **When Bugs Are Found**
1. **Acknowledge** - "Found issue in collision detection"
2. **Explain root cause** - "Physics body wasn't updated after respawn"
3. **Describe fix** - "Reset body in respawn() method"
4. **Confirm fix works** - "Tested 10 respawns, collision works correctly"

---

## FINAL DIRECTIVE

**REMEMBER**: We are building a **professional, publishable game**. Every line of code should reflect that standard. When in doubt:

- **Choose performance over convenience**
- **Choose maintainability over quick fixes**
- **Choose proper architecture over "it works for now"**
- **Choose upgrading over patching**

**If a change would make the game worse in ANY way - don't make it.** Find a better solution.

---

This is your foundation. Build excellence on it. 🎮
