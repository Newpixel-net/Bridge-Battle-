# VISUAL REFERENCE GUIDE - Frame-by-Frame Analysis

> **Purpose**: This document maps each of the 15 gameplay frames to specific features and implementation details. Use this as a quick reference when implementing features from BRIDGE_BATTLE_ADVANCED_FEATURES.md

---

## 📸 FRAME BREAKDOWN

### **FRAME 1: Main Menu / Title Screen**
![Location: Top-left of screenshot grid]

**What You See:**
- City street background with dramatic sky
- Purple/pink atmospheric lighting
- UI elements visible (Start, possibly settings)
- Professional menu presentation

**What to Implement:**
```javascript
// MainMenuScene.js
- Professional background image
- Title text with glow/shadow effects
- Button styling (rounded corners, hover effects)
- Atmospheric particles (optional)
- Background music loop
```

**Key Technical Details:**
- Scene key: `'MainMenuScene'`
- Background: Full screen image (800x600 or larger)
- UI: Bottom-aligned buttons
- Transitions: Smooth fade to character selection

---

### **FRAME 2: Character Selection Screen**
![Location: Second from left, top row]

**What You See:**
- Grid of character cards (4 visible)
- Each card has:
  - Character portrait/icon
  - Name or identifier
  - Stats or level indicator
  - Rarity color coding (blue, purple borders)
- Selection interface at bottom
- "BATTLE" or confirm button

**What to Implement:**
```javascript
// CharacterSelectionScene.js
class CharacterCard {
    // Visual elements:
    - Card background (120x180px)
    - Border color based on rarity
    - Character portrait (100x100px)
    - Name text (14px)
    - Stats preview (10px, 2-3 lines)
    - Selection indicator (glow/border when selected)
}

// Layout:
- 4 cards per row
- 20px spacing between cards
- Cards arranged in grid
- Max 3 selections allowed
- Green border on selected cards
```

**Key Colors Visible:**
- Common: Gray/white cards
- Rare: Blue borders (#2196F3)
- Epic: Purple borders (#9C27B0)
- Selected: Green highlight (#00FF00)

**Critical Features:**
- Click to select/deselect
- Visual feedback on selection
- Disable selection when 3 chosen
- Pass selected character data to game

---

### **FRAME 3: Game Start - Initial State**
![Location: Third from left, top row]

**What You See:**
- Player squad at bottom (appears as single unit or small group)
- Road with crosswalk
- Enemies ahead (dark colored characters)
- Trees on sides (green)
- Brown road
- White center line dashes

**What to Implement:**
```javascript
// GameScene.js - Initial spawn
- Player starts at bottom center (x: 400, y: 500)
- Small initial squad (1-5 characters)
- Enemies positioned ahead (y: 200-300)
- Road extends upward
- Camera centered on player

// Visual standards:
- Road width: 400px minimum
- Player clearly visible
- Enemies distinguishable from player
```

**Color Coding:**
- Player squad: Light/white/blue
- Enemies: Dark/red/brown
- Road: Brown (#8B7355)
- Grass sides: Green (#7CB342)

---

### **FRAME 4: Character/Tutorial Close-up**
![Location: Fourth from left, top row]

**What You See:**
- Large character portrait/dialogue
- Text box with instructions
- Appears to be tutorial or story moment
- Character wears hat (cowboy/military style)

**What to Implement:**
```javascript
// Optional: Tutorial/Dialogue System
class DialogueBox {
    - Character portrait (150x150px)
    - Text box below (600x100px)
    - Typewriter text effect
    - "Continue" indicator
    - Semi-transparent background
}

// When to show:
- First time playing
- Start of new stage
- Boss introduction
- Special events
```

**Implementation Priority:**
- Low priority (optional feature)
- Can be added after core gameplay works
- Not critical for MVP

---

### **FRAME 5: Early Gameplay**
![Location: Fifth from left, top row]

**What You See:**
- Player squad visible at bottom (blue/white characters)
- Enemies positioned ahead
- Road continues upward
- Trees on sides
- Crosswalk in distance
- Clean, clear view of gameplay

**What to Implement:**
```javascript
// Standard gameplay state
- Auto-run forward (squad moves up)
- Player can move left/right
- Enemies static in formation
- Clear visual separation player vs enemies
- Camera following player with offset

// Bottom UI visible:
- Small indicators/icons at bottom
- Possibly ability cards (frame 5 shows this)
```

**Visual Clarity:**
- Player squad: Bright, clearly visible
- Enemies: Darker, contrasting color
- Battlefield: Clean, uncluttered
- UI: Non-intrusive

---

### **FRAMES 6-10: Active Combat**
![Location: Bottom row, left side]

**What You See in ALL These Frames:**
- White/light projectiles (bullets) flying upward
- Player squad at bottom shooting continuously
- Enemies being hit (some frames show explosions)
- Orange/yellow explosion effects
- Bottom UI showing character cards/abilities
- "CRT-30N" label visible (cart/vehicle indicator)

**Key Combat Features Visible:**

**Projectiles:**
```javascript
- Small white/cyan bullets
- Travel upward from player position
- Visible trail/glow effect
- Multiple bullets on screen simultaneously
- Spread pattern (not perfectly straight)
```

**Explosions:**
```javascript
- Orange/yellow/red particles
- Happen when enemy hit
- Size varies (small for regular, large for special)
- Flash effect on impact
```

**Bottom UI (Ability Bar):**
```javascript
// Visible in frames 6-14
- 3-5 card slots at bottom center
- Each card shows:
  * Icon/image
  * Cooldown overlay (dark if not ready)
  * Energy cost number
- Cards spaced evenly
- Width: ~80px per card
- Height: ~100px per card
```

**What to Implement:**
```javascript
// Combat State
class CombatState {
    update() {
        // Continuous shooting
        this.autoShootingSystem.update(time, delta);
        
        // Bullet collision with enemies
        this.physics.overlap(bullets, enemies, this.bulletHitEnemy);
        
        // Create explosion on kill
        if (enemy.hp <= 0) {
            this.createExplosion(enemy.x, enemy.y);
        }
        
        // Update ability UI
        this.abilityBar.update(time, delta);
    }
}
```

---

### **FRAME 7: Mid-Combat**
**Specific observations:**
- Multiple enemies on screen
- Active shooting visible
- Some enemies appear damaged
- Crosswalk approaching

**Details:**
- Enemy count: 6-8 visible
- Projectile count: 10-15 on screen
- Player squad intact
- Combat intensity: Medium

---

### **FRAME 8: Heavy Combat**
**Specific observations:**
- Large enemy group ahead
- Explosion visible (orange burst)
- Many projectiles
- Squad formation maintained

**Details:**
- Enemy count: 15+ visible
- Explosion at center-top
- High projectile density
- Squad count appears: 20-30 characters

---

### **FRAME 9: Explosive Moment**
**Specific observations:**
- Large explosion effect
- Multiple enemies clustered
- Heavy fire from player
- Ability may have been used

**Details:**
- Explosion size: Large (3x normal)
- Suggests special ability or boss damage
- Particle effects prominent
- Screen shake indicated by frame composition

---

### **FRAME 10: Continued Combat**
**Specific observations:**
- Combat continues after explosion
- Enemies still present
- Squad maintaining fire
- Bottom UI clearly showing abilities

**Details:**
- Ability cards visible at bottom
- Multiple card slots (3-4 visible)
- Some cards may have cooldown overlays
- Energy system active

---

### **FRAME 11: Advanced Combat**
![Location: Bottom row, left-middle]

**What You See:**
- Continued combat
- Enemies scattered
- Explosions from hits
- Player squad still large

**Implementation Notes:**
- Demonstrates sustained combat
- Squad management during battle
- Continuous auto-fire working
- Collision detection functioning

---

### **FRAME 12: Boss Battle!**
![Location: Bottom row, center-left]

**What You See - CRITICAL:**
- Large enemy group or boss at center-top
- Red indicators or special effects
- Explosion effects
- Intensified combat
- Different enemy appearance (darker, larger?)

**Boss Battle Indicators:**
```javascript
// What makes this a boss:
1. Larger enemy sprite (2-3x normal size)
2. Red/dark color scheme
3. Special effects around boss
4. Health bar likely at top (not visible but implied)
5. More intense particle effects
6. Multiple explosions happening

// Boss features to implement:
class BossEnemy {
    - HP: 200-500 (vs 5 for normal)
    - Size: 3x normal sprite
    - Special attacks
    - Phase transitions
    - Screen shake on attacks
    - Particle effects constant
}
```

**Key Visual Differences from Normal Combat:**
- Enemy size significantly larger
- Darker color scheme (implies danger)
- Multiple simultaneous effects
- Increased visual intensity

---

### **FRAME 13: Boss Battle Continues**
![Location: Bottom row, center]

**What You See:**
- Boss battle in progress
- Multiple enemies or boss phases
- Heavy combat effects
- Squad still fighting

**Implementation Notes:**
- Boss has multiple phases or summons minions
- Combat intensity sustained
- Player must manage abilities carefully
- Victory approaching

---

### **FRAME 14: Final Combat / Pre-Victory**
![Location: Bottom row, center-right]

**What You See:**
- Large group of enemies/boss nearly defeated
- Yellow/gold effects (suggests victory near)
- Heavy visual effects
- Final push

**Victory Indicators Visible:**
```javascript
// Signs victory is near:
- Golden/yellow particle effects
- Large explosion effects
- Enemy count decreasing
- Special visual effects ramping up
```

---

### **FRAME 15: VICTORY SCREEN** ⭐
![Location: Bottom-right]

**What You See - COMPLETE VICTORY UI:**

**Main Elements:**
```javascript
// Victory Banner
- Dark background with light burst
- "VICTORY" text (large, golden)
- Trophy/shield icon
- "Stage 1" indicator

// Stats Display (center)
- Multiple stat lines visible
- Likely shows:
  * Score
  * Enemies defeated
  * Squad survived
  * Time taken
- Text in white/gold

// Rewards Section (bottom center)
- 2-3 reward cards visible
- Cards show:
  * Icons
  * Quantities/descriptions
  * Rarity indicators
- Similar to character selection cards but smaller

// Buttons (bottom)
- "Back to Base" button (blue, clearly visible)
- Possibly "Next Stage" button
- Large, clickable buttons
```

**Color Scheme:**
- Background: Dark (0x000000, 0.7 alpha)
- Victory text: Gold (#FFD700)
- Stats text: White (#FFFFFF)
- Buttons: Blue (#2196F3)
- Rewards: Various (based on rarity)

**What to Implement:**
```javascript
class VictoryScene extends Phaser.Scene {
    create() {
        // 1. Dark overlay
        this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);
        
        // 2. Victory banner (animate in)
        const banner = this.add.text(400, 100, 'VICTORY!', {
            fontSize: '72px',
            color: '#FFD700',
            // ... styling
        });
        
        // 3. Stage info
        this.add.text(400, 180, `Stage ${stage} Complete!`);
        
        // 4. Stats display (4-5 lines)
        this.createStatsDisplay(250);
        
        // 5. Rewards (card format)
        this.createRewardCards(400);
        
        // 6. Buttons
        this.createButtons(530);
    }
}
```

**Critical Details:**
- Trophy/shield icon at top center
- Stats centered and clearly readable
- Rewards visually appealing (card format)
- Buttons large and obvious
- Everything animated in sequence
- Professional, polished feel

---

## 🎨 CONSISTENT VISUAL ELEMENTS

### **Throughout All Frames:**

**Road:**
- Color: Brown (#8B7355)
- Width: ~400px (fills most of horizontal space)
- Center line: White dashes
- Crosswalks: White stripes, regularly spaced

**Environment:**
- Sides: Green grass (#7CB342)
- Trees: Simple green circles/shapes
- Sky: Not visible (camera focused on road)

**Player Squad:**
- Color: Light blue/white (#03A9F4, #FFFFFF)
- Formation: Tight group
- Size: Clearly visible individual characters
- Position: Bottom third of screen

**Enemies:**
- Color: Dark red/brown (#D32F2F, #8B4513)
- Formation: Scattered or grouped
- Size: Similar to player characters
- Position: Middle to top of screen

**Projectiles:**
- Color: White/cyan/purple
- Size: Small (3-5px)
- Effect: Glow/trail
- Speed: Fast (visible motion between frames)

**Explosions:**
- Colors: Orange → Yellow → Red
- Size: Variable (small to large)
- Particles: 10-40 particles
- Duration: Brief (0.5-1 second)

**UI Elements:**
- Bottom: Ability cards (80x100px each)
- Top: Score/distance (implied, not always visible)
- Style: Modern, clean, readable

---

## 🔍 IMPLEMENTATION PRIORITY BY FRAME

### **High Priority (Must Have):**
- Frame 3: Basic gameplay setup
- Frames 6-11: Combat system
- Frame 15: Victory screen

### **Medium Priority (Important):**
- Frame 2: Character selection
- Frames 12-14: Boss battle
- Frame 5: UI elements

### **Low Priority (Polish):**
- Frame 1: Main menu
- Frame 4: Tutorial/dialogue

---

## 💡 QUICK REFERENCE FOR CLAUDE CODE

### **When implementing Character Selection:**
→ Look at Frame 2

### **When implementing Combat:**
→ Look at Frames 6-11

### **When implementing Boss:**
→ Look at Frames 12-14

### **When implementing Victory:**
→ Look at Frame 15

### **When setting up initial game:**
→ Look at Frames 3, 5

### **When designing UI:**
→ Look at Frames 6-14 (bottom area)

---

## 📊 TECHNICAL SPECIFICATIONS FROM FRAMES

### **Based on Visual Analysis:**

```javascript
// Screen dimensions (estimated)
SCREEN_WIDTH = 800;
SCREEN_HEIGHT = 600;

// Road dimensions
ROAD_WIDTH = 400;
ROAD_LENGTH = 2000; // Per stage

// Character sizes
PLAYER_CHARACTER_SIZE = 32; // Width/height in pixels
ENEMY_CHARACTER_SIZE = 32;
BOSS_CHARACTER_SIZE = 96; // 3x normal

// UI dimensions
ABILITY_CARD_WIDTH = 80;
ABILITY_CARD_HEIGHT = 100;
ABILITY_BAR_Y = 550; // Bottom of screen

// Projectile specs
BULLET_SIZE = 4;
BULLET_SPEED = 400;
BULLET_COLOR = 0xFFFFFF; // White

// Explosion specs
EXPLOSION_SMALL_PARTICLES = 10;
EXPLOSION_LARGE_PARTICLES = 30;
EXPLOSION_COLORS = [0xFF6B6B, 0xFF8E53, 0xFFD93D];

// Victory screen
VICTORY_BANNER_Y = 100;
STATS_START_Y = 250;
REWARDS_Y = 400;
BUTTONS_Y = 530;
```

---

## ✅ VISUAL CHECKLIST

Before considering feature complete, verify against frames:

### **Character Selection (Frame 2):**
- [ ] Cards displayed in grid
- [ ] Each card shows character art
- [ ] Rarity colors match
- [ ] Selection visual feedback works
- [ ] Can select exactly 3 characters

### **Combat (Frames 6-11):**
- [ ] Projectiles visible and moving
- [ ] Explosions on enemy death
- [ ] Player squad clearly visible
- [ ] Enemies distinguishable
- [ ] UI visible at bottom

### **Boss Battle (Frames 12-14):**
- [ ] Boss significantly larger
- [ ] Special effects active
- [ ] Multiple explosions
- [ ] Intense visual feel
- [ ] Screen shake working

### **Victory (Frame 15):**
- [ ] Victory banner prominent
- [ ] Stats displayed clearly
- [ ] Rewards shown as cards
- [ ] Buttons obvious and clickable
- [ ] Professional appearance

---

**Use this guide alongside the screenshots to ensure your implementation matches the reference material exactly.** 🎮
