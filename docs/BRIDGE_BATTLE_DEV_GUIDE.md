# BRIDGE BATTLE CROWD RUNNER - CLAUDE CODE DEVELOPMENT GUIDE

> **CRITICAL**: Read the base [PHASER 3 IRON RULES](./PHASER_IRON_RULES.md) document BEFORE starting any development. This document extends those rules with game-specific requirements.

---

## TABLE OF CONTENTS
1. [Project Overview](#project-overview)
2. [Sprite System Integration](#sprite-system-integration)
3. [Game Architecture](#game-architecture)
4. [Visual Reference Standards](#visual-reference-standards)
5. [Implementation Roadmap](#implementation-roadmap)
6. [Critical Success Criteria](#critical-success-criteria)

---

## PROJECT OVERVIEW

**Game Type**: Mathematical Crowd Runner + Auto-Shooter Hybrid  
**Platform**: HTML5 + Phaser 3  
**Target Quality**: AAA Mobile Game Standard  
**Core Loop**: Grow squad → Navigate gates → Auto-shoot obstacles → Strategic decisions

### **The Golden Rule**
> *Every squad member = More firepower. Math decisions = Combat power. This feedback loop is sacred.*

---

## SPRITE SYSTEM INTEGRATION

### **MANDATORY: Use Existing Sprite System**

You have access to a pre-built sprite system that MUST be integrated. This system handles:
- Character rendering and animation
- Sprite pooling and reuse
- Performance optimization for large crowds
- Visual consistency

```javascript
// Integration Pattern
import { SpritePoolManager } from './systems/SpritePoolManager.js';
import { CharacterSprite } from './entities/CharacterSprite.js';

class SquadManager {
    constructor(scene) {
        this.scene = scene;
        this.spritePool = new SpritePoolManager(scene, CharacterSprite, 200);
        this.activeCharacters = [];
    }
    
    addCharacter(x, y) {
        const sprite = this.spritePool.spawn(x, y);
        this.activeCharacters.push(sprite);
        this.reformFormation();
    }
}
```

### **Character Visual Standards** (From Reference Images)
- **Color**: Bright blue (#03A9F4) - easily distinguishable from enemies
- **Size**: Large enough to see individual characters (minimum 32x32px at base zoom)
- **Style**: Simple, clean silhouettes - no excessive detail
- **Animation**: Idle bounce, run cycle (8 frames), death animation
- **Depth Sorting**: Characters properly layered by Y position

### **Sprite Performance Rules**
```javascript
// ✅ CORRECT: Reuse sprites from pool
const character = this.spritePool.spawn(x, y);

// ❌ WRONG: Create new sprite every time
const character = this.scene.add.sprite(x, y, 'character');
```

---

## GAME ARCHITECTURE

### **Scene Structure**

```
scenes/
├── BootScene.js          // Asset loading + progress bar
├── MenuScene.js          // Start menu, settings
├── GameScene.js          // Main gameplay loop
├── UIScene.js            // HUD overlay (runs parallel)
└── GameOverScene.js      // Results + restart
```

### **System Managers (Critical Components)**

#### **1. SquadManager.js**
```javascript
class SquadManager {
    constructor(scene) {
        this.scene = scene;
        this.characters = [];
        this.squadCount = 1; // Start with 1
        this.formation = 'hexagonal'; // Tight blob
        this.centerPosition = { x: 0, y: 0 };
    }
    
    // CRITICAL: Formation must be ULTRA-TIGHT
    reformFormation() {
        const SPACING = 8; // Characters touching
        const positions = this.calculateHexagonalGrid(this.squadCount, SPACING);
        
        this.characters.forEach((char, i) => {
            if (positions[i]) {
                char.targetX = this.centerPosition.x + positions[i].x;
                char.targetY = this.centerPosition.y + positions[i].y;
            }
        });
    }
    
    calculateHexagonalGrid(count, spacing) {
        // Hexagonal close-packed arrangement
        const positions = [];
        let ring = 0;
        let posInRing = 0;
        
        positions.push({ x: 0, y: 0 }); // Center character
        
        for (let i = 1; i < count; i++) {
            if (posInRing >= ring * 6) {
                ring++;
                posInRing = 0;
            }
            
            const angle = (posInRing / (ring * 6)) * Math.PI * 2;
            const distance = ring * spacing;
            
            positions.push({
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance
            });
            
            posInRing++;
        }
        
        return positions;
    }
    
    // CRITICAL: Math must be EXACT
    modifySquad(operation, value) {
        const oldCount = this.squadCount;
        
        switch(operation) {
            case 'add':
                this.squadCount += value;
                break;
            case 'multiply':
                this.squadCount *= value;
                break;
            case 'subtract':
                this.squadCount -= value;
                if (this.squadCount <= 0) {
                    this.scene.triggerGameOver('squad_eliminated');
                    return;
                }
                break;
        }
        
        this.updateCharacters(oldCount, this.squadCount);
        this.emitSquadChanged();
    }
}
```

#### **2. BulletPool.js** (Performance Critical)
```javascript
class BulletPool {
    constructor(scene, maxSize = 1000) {
        this.scene = scene;
        this.pool = [];
        this.active = [];
        
        // Pre-create bullets
        for (let i = 0; i < maxSize; i++) {
            const bullet = this.scene.add.circle(0, 0, 3, 0x9C27B0);
            bullet.setActive(false).setVisible(false);
            this.scene.physics.add.existing(bullet);
            bullet.body.enable = false;
            this.pool.push(bullet);
        }
    }
    
    fire(x, y, direction, damage = 1) {
        let bullet = this.pool.pop();
        
        if (!bullet) {
            console.warn('Bullet pool exhausted! Consider increasing pool size.');
            return null;
        }
        
        bullet.setPosition(x, y);
        bullet.setActive(true).setVisible(true);
        bullet.body.enable = true;
        
        // Slight spread for visual variety
        const spread = Phaser.Math.Between(-5, 5) * Math.PI / 180;
        const finalDirection = direction + spread;
        
        bullet.body.setVelocity(
            Math.cos(finalDirection) * 400, // 400 = bullet speed
            Math.sin(finalDirection) * 400
        );
        
        bullet.damage = damage;
        bullet.lifetime = 2000; // 2 seconds
        bullet.firedAt = Date.now();
        
        this.active.push(bullet);
        return bullet;
    }
    
    update() {
        const now = Date.now();
        
        this.active = this.active.filter(bullet => {
            const age = now - bullet.firedAt;
            
            if (age > bullet.lifetime || !bullet.active) {
                this.returnToPool(bullet);
                return false;
            }
            
            return true;
        });
    }
    
    returnToPool(bullet) {
        bullet.setActive(false).setVisible(false);
        bullet.body.enable = false;
        bullet.body.setVelocity(0, 0);
        this.pool.push(bullet);
    }
}
```

#### **3. AutoShootingSystem.js** (Core Mechanic)
```javascript
class AutoShootingSystem {
    constructor(scene, squadManager, bulletPool) {
        this.scene = scene;
        this.squadManager = squadManager;
        this.bulletPool = bulletPool;
        
        this.fireRate = 200; // ms between shots per character (5/sec)
        this.lastFireTime = 0;
        this.bulletDamage = 1; // Upgradeable
    }
    
    update(time, delta) {
        // Fire from each squad member continuously
        if (time - this.lastFireTime < this.fireRate) return;
        
        this.lastFireTime = time;
        
        this.squadManager.characters.forEach(character => {
            if (!character.active) return;
            
            // Fire forward (towards top of screen)
            this.bulletPool.fire(
                character.x,
                character.y,
                -Math.PI / 2, // Straight up
                this.bulletDamage
            );
        });
    }
    
    upgradeDamage(newDamage) {
        this.bulletDamage = newDamage;
        // Visual feedback
        this.scene.cameras.main.flash(100, 0, 188, 212); // Cyan flash
    }
}
```

#### **4. GateSystem.js** (Mathematical Core)
```javascript
class GateSystem {
    constructor(scene, squadManager) {
        this.scene = scene;
        this.squadManager = squadManager;
        this.gates = [];
    }
    
    createGate(x, y, type, value, width) {
        const gate = {
            type: type, // 'add', 'multiply', 'subtract'
            value: value,
            x: x,
            y: y,
            width: width,
            passed: false
        };
        
        // Visual representation
        const color = this.getGateColor(type);
        const graphics = this.scene.add.graphics();
        
        // Semi-transparent holographic effect
        graphics.fillStyle(color, 0.6);
        graphics.fillRoundedRect(-width/2, -40, width, 80, 10);
        
        // Frame
        graphics.lineStyle(4, 0xCCCCCC, 0.8);
        graphics.strokeRoundedRect(-width/2, -40, width, 80, 10);
        
        // Text
        const symbol = this.getGateSymbol(type, value);
        const text = this.scene.add.text(0, 0, symbol, {
            fontSize: '48px',
            fontFamily: 'Arial Black',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        const container = this.scene.add.container(x, y, [graphics, text]);
        gate.container = container;
        
        this.gates.push(gate);
        return gate;
    }
    
    getGateColor(type) {
        switch(type) {
            case 'add': return 0x2196F3; // Blue
            case 'multiply': return 0x2196F3; // Blue
            case 'subtract': return 0xF44336; // Red
            default: return 0x9E9E9E;
        }
    }
    
    getGateSymbol(type, value) {
        switch(type) {
            case 'add': return `+${value}`;
            case 'multiply': return `×${value}`;
            case 'subtract': return `-${value}`;
            default: return `${value}`;
        }
    }
    
    checkCollision(squadCenter) {
        this.gates.forEach(gate => {
            if (gate.passed) return;
            
            const distance = Phaser.Math.Distance.Between(
                squadCenter.x, squadCenter.y,
                gate.x, gate.y
            );
            
            if (distance < 50) { // Collision threshold
                this.activateGate(gate);
                gate.passed = true;
            }
        });
    }
    
    activateGate(gate) {
        // CRITICAL: Exact math operations
        this.squadManager.modifySquad(gate.type, gate.value);
        
        // Visual feedback
        gate.container.setScale(1.3);
        this.scene.tweens.add({
            targets: gate.container,
            scale: 0,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => gate.container.destroy()
        });
        
        // Sound
        this.scene.sound.play('gate_pass');
    }
}
```

#### **5. ObstacleManager.js**
```javascript
class ObstacleManager {
    constructor(scene, bulletPool) {
        this.scene = scene;
        this.bulletPool = bulletPool;
        this.obstacles = [];
    }
    
    createTireStack(x, y, hp, hasWeapon = false) {
        const obstacle = {
            x: x,
            y: y,
            maxHP: hp,
            currentHP: hp,
            hasWeapon: hasWeapon,
            isDestroyed: false
        };
        
        // Visual: Tire stack
        const tires = this.scene.add.rectangle(x, y, 60, 80, 0x212121);
        this.scene.physics.add.existing(tires, true); // Static body
        
        // HP Display
        const hpBg = this.scene.add.rectangle(x, y - 50, 60, 30, 0xF44336);
        const hpText = this.scene.add.text(x, y - 50, `${hp}`, {
            fontSize: '24px',
            fontFamily: 'Arial Black',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        
        const container = this.scene.add.container(0, 0, [tires, hpBg, hpText]);
        obstacle.container = container;
        obstacle.body = tires.body;
        obstacle.hpText = hpText;
        obstacle.hpBg = hpBg;
        
        // Weapon visual if present
        if (hasWeapon) {
            const weapon = this.scene.add.rectangle(x, y - 90, 30, 15, 0x00BCD4);
            weapon.setRotation(0.1);
            this.scene.tweens.add({
                targets: weapon,
                angle: 360,
                duration: 2000,
                repeat: -1
            });
            container.add(weapon);
            obstacle.weaponSprite = weapon;
        }
        
        this.obstacles.push(obstacle);
        
        // Setup bullet collisions
        this.setupCollision(obstacle);
        
        return obstacle;
    }
    
    setupCollision(obstacle) {
        this.scene.physics.add.overlap(
            obstacle.body,
            this.bulletPool.active,
            (obstacleBody, bullet) => this.handleBulletHit(obstacle, bullet)
        );
    }
    
    handleBulletHit(obstacle, bullet) {
        if (obstacle.isDestroyed) return;
        
        obstacle.currentHP -= bullet.damage;
        
        // Update HP display
        obstacle.hpText.setText(`${Math.max(0, obstacle.currentHP)}`);
        
        // Pulse effect
        this.scene.tweens.add({
            targets: obstacle.hpBg,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 100,
            yoyo: true
        });
        
        // Return bullet to pool
        this.bulletPool.returnToPool(bullet);
        
        // Check destruction
        if (obstacle.currentHP <= 0) {
            this.destroyObstacle(obstacle);
        }
    }
    
    destroyObstacle(obstacle) {
        obstacle.isDestroyed = true;
        
        // Particle explosion
        this.createExplosion(obstacle.x, obstacle.y);
        
        // Weapon pickup
        if (obstacle.hasWeapon) {
            this.createWeaponPickup(obstacle.x, obstacle.y);
        }
        
        // Remove visual
        this.scene.tweens.add({
            targets: obstacle.container,
            alpha: 0,
            scale: 0,
            duration: 300,
            onComplete: () => {
                obstacle.container.destroy();
                this.obstacles = this.obstacles.filter(o => o !== obstacle);
            }
        });
        
        // Sound
        this.scene.sound.play('explosion');
    }
    
    createExplosion(x, y) {
        const particles = this.scene.add.particles(x, y, 'tire_particle', {
            speed: { min: 100, max: 300 },
            angle: { min: 0, max: 360 },
            scale: { start: 1, end: 0 },
            blendMode: 'NORMAL',
            lifespan: 1000,
            gravityY: 200,
            quantity: 20
        });
        
        this.scene.time.delayedCall(1000, () => particles.destroy());
    }
}
```

---

## VISUAL REFERENCE STANDARDS

Based on the provided screenshots, these standards are **MANDATORY**:

### **Camera Configuration**
```javascript
// GameScene.js - create()
this.cameras.main.setBounds(0, 0, ROAD_WIDTH, LEVEL_LENGTH);
this.cameras.main.setZoom(1.5); // Adjust for character visibility

// Follow squad with smooth lag
this.cameras.main.startFollow(this.squadManager.centerSprite, true, 0.1, 0.1);
this.cameras.main.setFollowOffset(0, -150); // Look ahead
```

### **Road Width (CRITICAL)**
```javascript
const ROAD_CONFIG = {
    width: 400, // WIDE - must fill screen horizontally
    laneCount: 3,
    laneWidth: 133,
    centerLineOffset: ROAD_WIDTH / 2
};

// ✅ CORRECT: Road fills viewport
// ❌ WRONG: Narrow road where squad can't spread
```

### **Character Scale Hierarchy**
```javascript
// Characters must be CLEARLY VISIBLE
const SCALE_STANDARDS = {
    character: 1.0,      // Base size - clearly visible
    squadBubble: 1.5,    // Number bubble - VERY prominent
    gate: 2.0,           // Gates - impossible to miss
    obstacle: 1.2,       // Obstacles - clear threat
    enemy: 1.0           // Enemies - same as player squad
};
```

### **Color Coding (From Screenshots)**
```javascript
const GAME_COLORS = {
    // Squad
    player: 0x03A9F4,        // Bright blue - PRIMARY
    squadBubbleBg: 0x1976D2, // Darker blue circle
    squadBubbleText: 0xFFFFFF, // White text
    
    // Gates
    gatePositive: 0x2196F3,  // Blue for +/×
    gateNegative: 0xF44336,  // Red for -
    gateFrame: 0xCCCCCC,     // Light gray frame
    
    // Obstacles
    tireDark: 0x212121,      // Almost black
    hpBackground: 0xF44336,  // Red plate
    hpText: 0xFFFFFF,        // White numbers
    
    // Enemies
    enemyRed: 0xD32F2F,      // Dark red
    enemyCircle: 0xFF5252,   // Light red highlight
    
    // Environment
    road: 0x8B7355,          // Brown asphalt
    roadLine: 0xFFFFFF,      // White dashes
    grass: 0x7CB342,         // Green sides
    
    // Weapons & Effects
    bullet: 0x9C27B0,        // Purple base
    bulletUpgraded: 0x00BCD4, // Cyan upgraded
    weaponGlow: 0x00BCD4     // Cyan glow
};
```

### **UI/HUD Specifications** (From Screenshot Analysis)
```javascript
// UIScene.js
class UIScene extends Phaser.Scene {
    create() {
        // Squad Counter (BOTTOM CENTER - HUGE)
        const centerX = this.cameras.main.width / 2;
        const bottomY = this.cameras.main.height - 80;
        
        this.squadBubble = this.add.circle(centerX, bottomY, 50, GAME_COLORS.squadBubbleBg);
        
        this.squadText = this.add.text(centerX, bottomY, '1', {
            fontSize: '48px', // LARGE
            fontFamily: 'Arial Black',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // Score (TOP LEFT - Optional)
        this.scoreText = this.add.text(20, 20, 'Score: 0', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#FFFFFF'
        });
        
        // Distance (TOP CENTER)
        this.distanceText = this.add.text(centerX, 20, '0m', {
            fontSize: '28px',
            fontFamily: 'Arial Black',
            color: '#FFFFFF'
        }).setOrigin(0.5, 0);
    }
    
    updateSquadCount(count) {
        // Pulse animation on change
        this.squadText.setText(count.toString());
        
        this.tweens.add({
            targets: [this.squadBubble, this.squadText],
            scale: 1.2,
            duration: 200,
            yoyo: true,
            ease: 'Power2'
        });
        
        // Scale bubble with squad size
        if (count >= 100) {
            this.squadText.setFontSize('60px');
            this.squadBubble.setRadius(60);
        } else if (count >= 50) {
            this.squadText.setFontSize('54px');
            this.squadBubble.setRadius(55);
        }
    }
}
```

---

## IMPLEMENTATION ROADMAP

### **Phase 1: Foundation (Days 1-2)**
**Objective**: Basic movement and formation

```javascript
// Deliverables
✅ SquadManager with hexagonal formation
✅ Player input (touch/mouse drag)
✅ Camera following squad
✅ Road generation (straight section)
✅ Squad counter UI

// Success Criteria
- Squad stays in tight blob formation
- Smooth horizontal movement
- No performance issues with 50 characters
```

### **Phase 2: Math Gates (Days 3-4)**
**Objective**: Gate system with perfect math

```javascript
// Deliverables
✅ GateSystem with add/multiply/subtract
✅ Gate collision detection
✅ Squad modification with animation
✅ Game over on squad <= 0

// Success Criteria
- Math operations are 100% accurate
- Gates are clearly visible from distance
- Visual feedback on gate activation
- Smooth squad count transitions
```

### **Phase 3: Auto-Shooting (Days 5-6)**
**Objective**: Continuous fire from all squad members

```javascript
// Deliverables
✅ BulletPool system (1000 bullets pre-allocated)
✅ AutoShootingSystem (5 bullets/sec/character)
✅ Bullet visual with trail effect
✅ Performance optimization for 100+ active bullets

// Success Criteria
- 60 FPS with 50 squad × 5 bullets/sec = 250 bullets/sec
- Bullets pool properly (no memory leaks)
- Visual spread for organic feel
```

### **Phase 4: Obstacles (Days 7-8)**
**Objective**: Destructible tire stacks with HP

```javascript
// Deliverables
✅ ObstacleManager with tire stacks
✅ HP system with real-time updates
✅ Bullet collision with damage
✅ Explosion particles on destruction
✅ Weapon pickup system

// Success Criteria
- HP calculations are precise
- Clear visual feedback on hit
- Satisfying destruction sequence
- Weapon upgrades work correctly
```

### **Phase 5: Enemies (Days 9-10)**
**Objective**: Enemy formations that drain squad

```javascript
// Deliverables
✅ Enemy soldiers with 5 HP
✅ Formation types (line, circle, scattered)
✅ Squad collision (removes 1 member)
✅ Enemy destruction by bullets

// Success Criteria
- Enemies pose real threat
- Collision detection is accurate
- Squad count decreases correctly
```

### **Phase 6: Level Design (Days 11-12)**
**Objective**: Full level with progression

```javascript
// Deliverables
✅ LevelGenerator with 4 phases
✅ Gate configurations (single/double/triple)
✅ Obstacle placement strategy
✅ Enemy positioning
✅ Golden Gate Bridge visuals

// Success Criteria
- Level feels balanced
- Difficulty curve is clear
- Visual variety throughout
- Replay value evident
```

### **Phase 7: Polish (Days 13-14)**
**Objective**: AAA feel and juice

```javascript
// Deliverables
✅ Particle effects (explosions, pickups, hits)
✅ Screen shake on impacts
✅ Sound effects for all actions
✅ Smooth transitions between sections
✅ Victory/Game Over screens

// Success Criteria
- Game feels satisfying to play
- Audio enhances experience
- Visual polish is evident
- Performance remains stable
```

---

## CRITICAL SUCCESS CRITERIA

### **Non-Negotiable Requirements**

#### **Performance Benchmarks**
```javascript
// Must achieve:
✅ 60 FPS: 1-50 squad members
✅ 45 FPS: 51-100 squad members  
✅ 30 FPS minimum: 101-200 squad members
✅ < 100ms input latency
✅ No memory leaks over 5 minute session

// Testing command
// Run this in console during gameplay:
console.log(`FPS: ${Math.round(this.game.loop.actualFps)}`);
console.log(`Active: ${this.bulletPool.active.length} bullets`);
console.log(`Pool: ${this.bulletPool.pool.length} available`);
```

#### **Math Accuracy Tests**
```javascript
// Create test scenarios:
describe('Squad Math Operations', () => {
    test('Addition gate: 10 + 5 = 15', () => {
        squadManager.squadCount = 10;
        gateSystem.activateGate({ type: 'add', value: 5 });
        expect(squadManager.squadCount).toBe(15);
    });
    
    test('Multiplication gate: 20 × 3 = 60', () => {
        squadManager.squadCount = 20;
        gateSystem.activateGate({ type: 'multiply', value: 3 });
        expect(squadManager.squadCount).toBe(60);
    });
    
    test('Subtraction safety: 5 - 10 = GAME OVER', () => {
        squadManager.squadCount = 5;
        gateSystem.activateGate({ type: 'subtract', value: 10 });
        expect(gameScene.gameOver).toBe(true);
    });
});
```

#### **Visual Standards Checklist**
```javascript
// Before marking feature complete:
✅ Characters are clearly visible at all times
✅ Squad number bubble is PROMINENT
✅ Gates are readable while approaching
✅ Obstacle HP updates in real-time
✅ Color coding is consistent with reference
✅ Road width allows full squad spread
✅ Camera angle matches reference (60° top-down)
✅ No UI elements overlap gameplay
```

#### **Gameplay Feel Checklist**
```javascript
✅ Squad formation feels organic and fluid
✅ Shooting feels continuous and powerful
✅ Destruction is satisfying (particles + sound)
✅ Math decisions feel meaningful
✅ Growing squad = visible power increase
✅ Controls are responsive (< 16ms lag)
✅ No jarring transitions or stutters
✅ Game loop is addictive ("one more run")
```

---

## DEBUGGING PROTOCOL

### **When Issues Arise**

#### **1. Performance Issues**
```javascript
// Debug steps:
1. Check FPS: game.loop.actualFps
2. Profile bullet pool: bulletPool.active.length vs pool.length
3. Monitor sprite count: scene.children.length
4. Check physics bodies: scene.physics.world.bodies.size
5. Look for memory leaks: Run 5 min, check RAM usage

// Common fixes:
- Increase object pooling
- Reduce particle count
- Disable debug rendering
- Use texture atlases
- Implement LOD for distant objects
```

#### **2. Math Errors**
```javascript
// Debug steps:
1. Console.log before and after gate activation
2. Check for floating point errors (use Math.round)
3. Verify operator precedence
4. Test edge cases (0, negative, very large numbers)

// Safety checks:
if (operation === 'subtract' && this.squadCount - value <= 0) {
    console.warn(`Squad eliminated: ${this.squadCount} - ${value}`);
    this.triggerGameOver();
    return;
}
```

#### **3. Visual Glitches**
```javascript
// Debug steps:
1. Check depth/layering: sprite.depth
2. Verify camera bounds: camera.getBounds()
3. Inspect sprite visibility: sprite.visible && sprite.alpha
4. Check for NaN positions: isNaN(sprite.x)

// Common fixes:
sprite.setDepth(10); // Ensure proper layering
sprite.setScrollFactor(1); // Follow camera
sprite.setOrigin(0.5); // Center anchor
```

---

## FILE STRUCTURE

```
bridge-battle/
├── index.html
├── assets/
│   ├── images/
│   │   ├── characters/
│   │   │   ├── player-atlas.png
│   │   │   └── player-atlas.json
│   │   ├── obstacles/
│   │   │   ├── tire-stack.png
│   │   │   └── weapon-icon.png
│   │   ├── enemies/
│   │   │   └── soldier-red.png
│   │   ├── environment/
│   │   │   ├── road-texture.png
│   │   │   ├── bridge-pillar.png
│   │   │   └── water-bg.png
│   │   └── ui/
│   │       ├── gate-frame.png
│   │       └── hud-elements.png
│   ├── audio/
│   │   ├── music/
│   │   │   └── gameplay-loop.mp3
│   │   └── sfx/
│   │       ├── shoot.wav
│   │       ├── explosion.wav
│   │       ├── gate-pass.wav
│   │       ├── weapon-pickup.wav
│   │       └── game-over.wav
│   └── data/
│       └── level-config.json
├── src/
│   ├── config.js
│   ├── main.js
│   ├── scenes/
│   │   ├── BootScene.js
│   │   ├── MenuScene.js
│   │   ├── GameScene.js
│   │   ├── UIScene.js
│   │   └── GameOverScene.js
│   ├── systems/
│   │   ├── SquadManager.js           // Formation & movement
│   │   ├── SpritePoolManager.js      // Reusable sprite system
│   │   ├── BulletPool.js             // Bullet pooling
│   │   ├── AutoShootingSystem.js     // Continuous fire
│   │   ├── GateSystem.js             // Math gates
│   │   ├── ObstacleManager.js        // Tire stacks
│   │   ├── EnemyManager.js           // Enemy AI
│   │   ├── LevelGenerator.js         // Procedural level
│   │   └── AudioManager.js           // Sound control
│   ├── entities/
│   │   ├── CharacterSprite.js        // Individual character
│   │   ├── Bullet.js                 // Projectile logic
│   │   ├── Gate.js                   // Gate object
│   │   ├── TireStack.js              // Obstacle object
│   │   └── EnemySoldier.js           // Enemy object
│   └── utils/
│       ├── MathHelper.js             // Hexagon grid calculator
│       ├── ParticleEffects.js        // Reusable FX
│       └── InputManager.js           // Touch/mouse handler
├── PHASER_IRON_RULES.md              // Base development rules
├── BRIDGE_BATTLE_DEV_GUIDE.md        // This document
└── README.md                          // Project overview
```

---

## COMMON PITFALLS & SOLUTIONS

### **❌ Don't Do This → ✅ Do This Instead**

#### **Formation**
```javascript
// ❌ WRONG: Scattered squad
characters.forEach((char, i) => {
    char.x = startX + (i * 50);
    char.y = startY;
});

// ✅ CORRECT: Tight hexagonal blob
const positions = calculateHexagonalGrid(count, 8);
characters.forEach((char, i) => {
    char.targetX = centerX + positions[i].x;
    char.targetY = centerY + positions[i].y;
});
```

#### **Shooting**
```javascript
// ❌ WRONG: Player-triggered shooting
onPointerDown() {
    this.fireBullet();
}

// ✅ CORRECT: Continuous auto-fire
update(time) {
    if (time - lastFire > fireRate) {
        squad.forEach(char => this.fireBullet(char));
        lastFire = time;
    }
}
```

#### **Math Operations**
```javascript
// ❌ WRONG: Unchecked subtraction
applyGate(type, value) {
    if (type === 'subtract') {
        this.squadCount -= value;
    }
}

// ✅ CORRECT: Safety checks
applyGate(type, value) {
    if (type === 'subtract') {
        if (this.squadCount - value <= 0) {
            this.gameOver();
            return;
        }
        this.squadCount -= value;
    }
}
```

#### **Performance**
```javascript
// ❌ WRONG: Create new bullets every frame
fireBullet() {
    const bullet = this.add.sprite(x, y, 'bullet');
    this.physics.add.existing(bullet);
}

// ✅ CORRECT: Reuse from pool
fireBullet() {
    const bullet = this.bulletPool.spawn(x, y);
}
```

---

## TESTING PROTOCOL

### **Before Pushing Code**

```javascript
// Run this checklist:
const PRE_PUSH_CHECKLIST = {
    // Performance
    fps_60_with_50_squad: test_performance(50),
    fps_45_with_100_squad: test_performance(100),
    no_memory_leaks: test_memory(300), // 5 min runtime
    
    // Math accuracy
    addition_correct: test_math('add', 10, 5, 15),
    multiplication_correct: test_math('multiply', 20, 3, 60),
    subtraction_safe: test_math('subtract', 5, 10, 'GAME_OVER'),
    
    // Visual standards
    characters_visible: check_sprite_size() >= 32,
    squad_bubble_prominent: check_ui_element('squadBubble').size >= 100,
    road_width_adequate: check_road_width() >= 400,
    
    // Gameplay feel
    controls_responsive: measure_input_lag() < 16,
    shooting_continuous: verify_auto_fire(),
    destruction_satisfying: verify_particles_and_sound()
};

// All must pass before commit
const allPass = Object.values(PRE_PUSH_CHECKLIST).every(test => test === true);
if (!allPass) {
    console.error('Tests failed! Do not push.');
}
```

---

## FINAL DIRECTIVES FOR CLAUDE CODE

### **When Starting Development**
1. **Read** the base PHASER_IRON_RULES.md first
2. **Study** the reference screenshots for visual standards
3. **Plan** the implementation phase-by-phase
4. **Never** skip performance optimization
5. **Always** test math operations with edge cases

### **When Encountering Issues**
1. **Debug** systematically using the protocol above
2. **Consult** the Common Pitfalls section
3. **Test** the specific scenario causing issues
4. **Document** the fix and why it works
5. **Verify** related systems weren't broken

### **When Adding Features**
1. **Preserve** all existing functionality
2. **Integrate** with the sprite system
3. **Optimize** for performance from day one
4. **Polish** with juice (particles, sound, feedback)
5. **Test** thoroughly before moving forward

### **The North Star**
> *Every decision should move us toward a game where:*
> - *Math choices feel meaningful*
> - *Shooting feels powerful*  
> - *Growth feels earned*
> - *Replay value is high*
> - *Performance is rock-solid*

---

## GAME SPECIFICATION REFERENCE

### **Core Game Loop**
1. Squad auto-runs forward on bridge
2. Player controls horizontal movement (swipe/drag)
3. Squad auto-shoots continuously (5 bullets/sec per member)
4. Navigate through mathematical gates (+, ×, -)
5. Destroy obstacles with bullets to clear path
6. Collect weapon upgrades for increased damage
7. Avoid/eliminate enemies
8. Reach end of level with maximum squad size

### **Mathematical Gate System**
```javascript
// Gate Types & Values
ADDITION_GATES = [+1, +2, +5, +10, +20];
MULTIPLICATION_GATES = [×2, ×3, ×5, ×10, ×20];
SUBTRACTION_GATES = [-3, -10, -20, -30];

// Gate Configurations
SINGLE_GATE: Full road width (mandatory pass)
DOUBLE_GATES: Side-by-side (player chooses)
TRIPLE_GATES: Three options (left/center/right)

// CRITICAL RULE
if (squad_count - subtraction_value <= 0) {
    GAME_OVER();
}
```

### **Combat System**
```javascript
// DPS Calculation
total_dps = squad_size × bullets_per_second × damage_per_bullet;
// Example: 30 squad × 5 bps × 1 dmg = 150 DPS

// Obstacle Clear Time
time_to_destroy = obstacle_hp / total_dps;
// Example: 300 HP ÷ 150 DPS = 2 seconds

// Weapon Upgrade
base_damage = 1;
upgraded_damage = 2-3;
// Doubles/triples DPS instantly
```

### **Level Progression**
```javascript
// Phase 1: Growth (0-100m)
- Start: 1 character
- Focus: Multiplication gates
- Obstacles: None
- Goal: Reach 30-50 squad size

// Phase 2: Combat Introduction (100-300m)
- Obstacles: 100-200 HP tire stacks
- Weapon pickups available
- Enemy groups appear
- Balance: Navigation + shooting

// Phase 3: Complex Decisions (300-500m)
- Obstacles: 200-300 HP
- Gates behind obstacles
- Multiple path options
- Strategic planning required

// Phase 4: Boss Section (500-600m)
- Obstacles: 300+ HP
- Dense enemy formations
- Critical gate sequences
- Full system mastery needed
```

### **Performance Targets**
```javascript
// Mandatory Benchmarks
60_FPS: Up to 50 squad members
45_FPS: 51-100 squad members
30_FPS_MIN: 101-200 squad members
MAX_BULLETS: 500 active simultaneously
MAX_SPRITES: 1000 total on screen
MEMORY: < 200MB total usage
```

### **Visual Standards (From Screenshots)**
```javascript
// Character Scale
- Characters: Clearly visible individuals
- Squad Blob: Ultra-tight hexagonal formation
- Spacing: 8px between characters (touching)

// UI Scale
- Squad Counter: HUGE (bottom center)
- Gate Text: 48px font (readable at distance)
- HP Numbers: 24px font (clear updates)

// Color Scheme
- Player Squad: Bright Blue (#03A9F4)
- Positive Gates: Blue (#2196F3)
- Negative Gates: Red (#F44336)
- Enemies: Dark Red (#D32F2F)
- Bullets: Purple (#9C27B0) → Cyan (#00BCD4) when upgraded

// Camera
- Angle: 60° top-down
- Follow: Smooth lag (0.1)
- Offset: Look ahead 150px
- Zoom: 1.5× for clarity
```

---

## QUICK REFERENCE CHEAT SHEET

### **Must Remember**
✅ Formation = Ultra-tight hexagonal blob  
✅ Math = 100% accurate with safety checks  
✅ Shooting = Continuous, no player input  
✅ Performance = Object pooling mandatory  
✅ Visuals = Match reference screenshots exactly  
✅ Road Width = 400px minimum (fills screen)  
✅ Squad Bubble = Bottom center, HUGE  
✅ Gates = Readable from distance  
✅ Destruction = Particles + sound + shake  
✅ Testing = Math edge cases + performance benchmarks  

### **Never Do**
❌ Narrow road that constrains movement  
❌ Scattered squad formation  
❌ Player-triggered shooting  
❌ Create new bullets without pooling  
❌ Skip math validation  
❌ Ignore performance optimization  
❌ Small, hard-to-see characters  
❌ Silent, unsatisfying destruction  
❌ Downgrade working functionality  
❌ Push code without testing  

---

**Remember**: We're not building a prototype. We're building a publishable, AAA-quality mobile game. Every line of code should reflect that standard.

Now go forth and create something amazing. 🚀
