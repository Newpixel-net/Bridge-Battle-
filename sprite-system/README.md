# Sprite System

A game-agnostic sprite rendering and animation system for 2D sprites in 3D space (billboards) and canvas-based dynamic sprites.

## Features

- **Billboard Sprites** - Camera-facing 2D sprites in 3D space
- **UV-Based Animation** - Efficient sprite sheet animation using texture UV coordinates
- **Texture Management** - Load, cache, and clone textures with ease
- **Canvas Sprites** - Dynamic canvas-based sprites for text, UI, and procedural graphics
- **Game-Agnostic** - Works with any rendering engine (tested with THREE.js)
- **Fully Typed** - Complete JSDoc type annotations
- **Zero Game Logic** - Pure sprite rendering without game-specific code

## Installation

```bash
# Copy the sprite-system directory to your project
cp -r sprite-system /path/to/your/project/
```

## Quick Start

```javascript
import * as THREE from 'three';
import { createSpriteSystem } from './sprite-system/src/index.js';

// Create the sprite system
const spriteSystem = createSpriteSystem(THREE);

// Load a sprite sheet
await spriteSystem.loadTexture('character', '/sprites/character.png');

// Create a billboard sprite
const sprite = spriteSystem.createBillboardSprite({
    texture: spriteSystem.getTexture('character'),
    position: { x: 0, y: 0, z: 0 },
    size: { height: 1.5 },
    spriteSheet: {
        frameWidth: 64,
        frameHeight: 64,
        columns: 8,
        rows: 8,
        totalFrames: 32,
        frameRate: 30
    },
    animations: {
        idle: { startFrame: 0, endFrame: 7 },
        walk: { startFrame: 8, endFrame: 15 },
        run: { startFrame: 16, endFrame: 23 }
    }
});

// Add to scene
scene.add(sprite.getObject3D());

// Play animation
sprite.play('walk');

// Update in game loop
function animate() {
    const deltaTime = clock.getDelta();
    sprite.update(deltaTime);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
```

## Core Components

### BillboardSprite

3D camera-facing sprite with animation support.

```javascript
import { BillboardSprite } from './sprite-system/src/BillboardSprite.js';

const sprite = new BillboardSprite({
    texture: myTexture,
    position: { x: 0, y: 0, z: 0 },
    size: { width: 1, height: 1 },
    spriteSheet: {
        frameWidth: 64,
        frameHeight: 64,
        columns: 8,
        rows: 8,
        totalFrames: 32
    },
    animations: {
        idle: { startFrame: 0, endFrame: 7 }
    },
    shadow: {
        enabled: true,
        radius: 0.5,
        opacity: 0.3
    },
    renderEngine: THREE
});

// Control playback
sprite.play('idle', true);  // loop = true
sprite.pause();
sprite.resume();
sprite.stop();

// Control appearance
sprite.setPosition(x, y, z);
sprite.setScale(2.0);
sprite.setOpacity(0.5);
sprite.setColor(0xFF0000);
sprite.setVisible(true);

// Callbacks
sprite.onAnimationComplete((animName) => {
    console.log(`Animation ${animName} completed`);
});

sprite.onFrameChange((frameIndex, animName) => {
    console.log(`Frame changed to ${frameIndex}`);
});
```

### SpriteAnimationController

UV-based sprite sheet animation.

```javascript
import { SpriteAnimationController } from './sprite-system/src/SpriteAnimationController.js';

const controller = new SpriteAnimationController(texture, {
    frameWidth: 64,
    frameHeight: 64,
    columns: 8,
    rows: 8,
    totalFrames: 32,
    frameRate: 30
});

// Define animations
controller.addAnimation('walk', 0, 7);
controller.addAnimation('jump', 8, 11, { frameRate: 60 });

// Control playback
controller.play('walk', true);  // loop
controller.update(deltaTime);   // call every frame

// Get state
const state = controller.getState();
// { currentAnimation, currentFrame, isPlaying, loop, progress }
```

### SpriteTextureManager

Load and manage sprite sheet textures.

```javascript
import { SpriteTextureManager } from './sprite-system/src/SpriteTextureManager.js';

const manager = new SpriteTextureManager({
    loader: new THREE.TextureLoader(),
    textureConfig: {
        magFilter: THREE.NearestFilter,  // Pixel-perfect
        minFilter: THREE.LinearMipMapLinearFilter,
        generateMipmaps: true
    }
});

// Load single texture
await manager.loadTexture('player', '/sprites/player.png');

// Load multiple textures
await manager.loadTextures([
    { name: 'player', path: '/sprites/player.png' },
    { name: 'enemy', path: '/sprites/enemy.png' }
]);

// Get texture (cloned for independent UV)
const texture = manager.getTexture('player');

// Statistics
console.log(manager.getStats());
```

### CanvasSpriteRenderer

Create sprites from dynamic canvas content.

```javascript
import { CanvasSpriteRenderer } from './sprite-system/src/CanvasSpriteRenderer.js';

const renderer = new CanvasSpriteRenderer({ renderEngine: THREE });

// Text sprite
const textSprite = renderer.createTextSprite('Score: 100', {
    fontSize: 32,
    color: '#FFFFFF',
    backgroundColor: '#000000',
    stroke: { color: '#000000', width: 2 }
});
scene.add(textSprite.sprite);

// Progress bar
const healthBar = renderer.createProgressBarSprite(0.75, {
    width: 200,
    height: 20,
    fillColor: '#00FF00',
    backgroundColor: '#333333'
});
healthBar.updateValue(0.5);  // Update to 50%

// Custom canvas
const customSprite = renderer.createCustomSprite((ctx, canvas) => {
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}, { width: 64, height: 64 });
```

## Configuration Utilities

```javascript
import {
    getPreset,
    createSpriteSheetConfig,
    createAnimations,
    validateSpriteSheetConfig,
    ANIMATION_FRAME_RATES
} from './sprite-system/src/SpriteConfig.js';

// Use presets
const characterConfig = getPreset('character');
const particleConfig = getPreset('particle');
const pixelArtConfig = getPreset('pixelArt');

// Create sprite sheet config
const config = createSpriteSheetConfig({
    textureWidth: 512,
    textureHeight: 512,
    frameWidth: 64,
    frameHeight: 64,
    frameRate: ANIMATION_FRAME_RATES.SMOOTH
});

// Create animations
const animations = createAnimations([
    { name: 'idle', startFrame: 0, endFrame: 5 },
    { name: 'walk', startFrame: 6, endFrame: 13 }
]);

// Validate configuration
const validation = validateSpriteSheetConfig(config);
if (!validation.valid) {
    console.error(validation.errors);
}
```

## Examples

### Example 1: Simple Character

```javascript
import * as THREE from 'three';
import { BillboardSprite, SpriteTextureManager } from './sprite-system/src/index.js';

// Setup
const scene = new THREE.Scene();
const manager = new SpriteTextureManager({
    loader: new THREE.TextureLoader()
});

// Load texture
await manager.loadTexture('hero', '/sprites/hero.png');

// Create sprite
const hero = new BillboardSprite({
    texture: manager.getTexture('hero'),
    position: { x: 0, y: 0, z: 0 },
    size: { height: 1.5 },
    spriteSheet: {
        frameWidth: 64,
        frameHeight: 64,
        columns: 8,
        rows: 4,
        totalFrames: 24,
        frameRate: 30
    },
    animations: {
        idle: { startFrame: 0, endFrame: 5 },
        walk: { startFrame: 6, endFrame: 13 },
        attack: { startFrame: 14, endFrame: 19 }
    },
    shadow: { enabled: true },
    renderEngine: THREE
});

scene.add(hero.getObject3D());
hero.play('idle');

// Game loop
function gameLoop() {
    const deltaTime = clock.getDelta();
    hero.update(deltaTime);
    renderer.render(scene, camera);
    requestAnimationFrame(gameLoop);
}
```

### Example 2: Dynamic State-Based Animation

```javascript
// Character with state-based animation
class Character {
    constructor(sprite) {
        this.sprite = sprite;
        this.state = 'idle';
        this.velocity = { x: 0, z: 0 };
    }

    update(deltaTime) {
        // Update physics
        this.sprite.setPosition(
            this.sprite.getPosition().x + this.velocity.x * deltaTime,
            0,
            this.sprite.getPosition().z + this.velocity.z * deltaTime
        );

        // Update animation based on state
        const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.z ** 2);

        if (speed > 5) {
            if (this.state !== 'run') {
                this.state = 'run';
                this.sprite.play('run');
            }
        } else if (speed > 0.5) {
            if (this.state !== 'walk') {
                this.state = 'walk';
                this.sprite.play('walk');
            }
        } else {
            if (this.state !== 'idle') {
                this.state = 'idle';
                this.sprite.play('idle');
            }
        }

        this.sprite.update(deltaTime);
    }
}
```

### Example 3: Canvas-Based UI

```javascript
import { CanvasSpriteRenderer } from './sprite-system/src/index.js';

const canvasRenderer = new CanvasSpriteRenderer({ renderEngine: THREE });

// Create UI elements
const scoreText = canvasRenderer.createTextSprite('Score: 0', {
    fontSize: 24,
    color: '#FFD700',
    stroke: { color: '#000000', width: 3 }
});

const healthBar = canvasRenderer.createProgressBarSprite(1.0, {
    width: 200,
    height: 20,
    fillColor: '#00FF00'
});

// Position in scene
scoreText.sprite.position.set(0, 5, 0);
healthBar.sprite.position.set(0, 4.5, 0);

scene.add(scoreText.sprite);
scene.add(healthBar.sprite);

// Update dynamically
function updateUI(score, health) {
    scoreText.update((ctx, canvas) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#FFD700';
        ctx.textAlign = 'center';
        ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2);
    });

    healthBar.updateValue(health / 100);
}
```

## API Reference

See `/docs` directory for complete API documentation.

## Requirements

- A rendering engine with sprite/billboard support (tested with THREE.js)
- ES6 module support

## Browser Compatibility

Works in all modern browsers that support:
- ES6 modules
- Canvas API
- WebGL (for 3D rendering)

## License

MIT License - Free to use in any project

## Contributing

This is an extracted module. Contributions welcome!

## Credits

Extracted from Bridge Battle game as a reusable sprite system.
