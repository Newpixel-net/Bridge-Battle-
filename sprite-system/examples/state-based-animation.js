/**
 * State-Based Animation Example
 *
 * Demonstrates how to create a character with automatic animation
 * transitions based on game state (velocity, actions, etc).
 */

import * as THREE from 'three';
import { BillboardSprite, SpriteTextureManager } from '../src/index.js';

export class AnimatedCharacter {
    constructor(scene, options = {}) {
        this.scene = scene;
        this.sprite = null;
        this.state = 'idle';
        this.velocity = { x: 0, z: 0 };
        this.isJumping = false;
        this.isAttacking = false;

        // Configuration
        this.moveThreshold = 0.5;
        this.runThreshold = 5.0;

        this.options = options;
    }

    async init() {
        // Setup texture manager
        const textureManager = new SpriteTextureManager({
            loader: new THREE.TextureLoader()
        });

        await textureManager.loadTexture(
            'character',
            this.options.spritePath || '/sprites/character.png'
        );

        // Create sprite
        this.sprite = new BillboardSprite({
            texture: textureManager.getTexture('character'),
            position: { x: 0, y: 0, z: 0 },
            size: { height: 1.5 },
            spriteSheet: this.options.spriteSheet || {
                frameWidth: 64,
                frameHeight: 64,
                columns: 8,
                rows: 4,
                totalFrames: 32,
                frameRate: 30
            },
            animations: this.options.animations || {
                idle: { startFrame: 0, endFrame: 5 },
                walk: { startFrame: 6, endFrame: 13 },
                run: { startFrame: 14, endFrame: 21 },
                jump: { startFrame: 22, endFrame: 24 },
                attack: { startFrame: 25, endFrame: 29 }
            },
            shadow: { enabled: true },
            renderEngine: THREE
        });

        this.scene.add(this.sprite.getObject3D());
        this.sprite.play('idle');

        // Setup animation callbacks
        this.sprite.onAnimationComplete((animName) => {
            if (animName === 'attack') {
                this.isAttacking = false;
                this.updateState();
            }
            if (animName === 'jump') {
                this.isJumping = false;
                this.updateState();
            }
        });

        return this;
    }

    // Update animation state based on character state
    updateState() {
        const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.z ** 2);

        let newState = 'idle';

        // Priority-based state selection
        if (this.isAttacking) {
            newState = 'attack';
        } else if (this.isJumping) {
            newState = 'jump';
        } else if (speed > this.runThreshold) {
            newState = 'run';
        } else if (speed > this.moveThreshold) {
            newState = 'walk';
        } else {
            newState = 'idle';
        }

        // Only change animation if state changed
        if (newState !== this.state) {
            this.state = newState;
            const loop = !['attack', 'jump'].includes(newState);
            this.sprite.play(newState, loop);
        }
    }

    // Set velocity (triggers animation update)
    setVelocity(x, z) {
        this.velocity.x = x;
        this.velocity.z = z;
        this.updateState();
    }

    // Move to position
    moveTo(x, z) {
        const pos = this.sprite.getPosition();
        const dx = x - pos.x;
        const dz = z - pos.z;
        const distance = Math.sqrt(dx * dx + dz * dz);

        if (distance > 0.1) {
            // Calculate velocity for smooth movement
            const speed = 3.0;
            this.setVelocity(
                (dx / distance) * speed,
                (dz / distance) * speed
            );
        } else {
            this.setVelocity(0, 0);
        }
    }

    // Trigger jump
    jump() {
        if (!this.isJumping) {
            this.isJumping = true;
            this.updateState();
        }
    }

    // Trigger attack
    attack() {
        if (!this.isAttacking) {
            this.isAttacking = true;
            this.updateState();
        }
    }

    // Stop all movement
    stop() {
        this.setVelocity(0, 0);
    }

    // Update (call every frame)
    update(deltaTime) {
        if (!this.sprite) return;

        // Update sprite animation
        this.sprite.update(deltaTime);

        // Update position based on velocity
        const pos = this.sprite.getPosition();
        this.sprite.setPosition(
            pos.x + this.velocity.x * deltaTime,
            pos.y,
            pos.z + this.velocity.z * deltaTime
        );
    }

    // Get current position
    getPosition() {
        return this.sprite ? this.sprite.getPosition() : { x: 0, y: 0, z: 0 };
    }

    // Set position
    setPosition(x, y, z) {
        if (this.sprite) {
            this.sprite.setPosition(x, y, z);
        }
    }

    // Cleanup
    cleanup() {
        if (this.sprite) {
            this.sprite.cleanup();
        }
    }
}

// Usage example:
/*
// Create character
const character = new AnimatedCharacter(scene, {
    spritePath: '/sprites/hero.png',
    spriteSheet: {
        frameWidth: 64,
        frameHeight: 64,
        columns: 8,
        rows: 4,
        totalFrames: 32
    },
    animations: {
        idle: { startFrame: 0, endFrame: 5 },
        walk: { startFrame: 6, endFrame: 13 },
        run: { startFrame: 14, endFrame: 21 },
        jump: { startFrame: 22, endFrame: 24 },
        attack: { startFrame: 25, endFrame: 29 }
    }
});

await character.init();

// Game loop
function animate() {
    const deltaTime = clock.getDelta();
    character.update(deltaTime);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

// Control character
character.setVelocity(5, 0);  // Walk right
character.stop();              // Stop
character.jump();              // Jump
character.attack();            // Attack
character.moveTo(10, 5);       // Move to position
*/

export default AnimatedCharacter;
