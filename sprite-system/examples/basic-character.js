/**
 * Basic Character Example
 *
 * Demonstrates how to create a simple animated character sprite
 * using the sprite system.
 */

import * as THREE from 'three';
import { BillboardSprite, SpriteTextureManager } from '../src/index.js';

export async function createBasicCharacter(scene) {
    // Create texture manager
    const textureManager = new SpriteTextureManager({
        loader: new THREE.TextureLoader(),
        textureConfig: {
            magFilter: THREE.NearestFilter,
            minFilter: THREE.LinearMipMapLinearFilter,
            generateMipmaps: true,
            wrapS: THREE.ClampToEdgeWrapping,
            wrapT: THREE.ClampToEdgeWrapping
        }
    });

    // Load character sprite sheet
    await textureManager.loadTexture('character', '/sprites/character.png');

    // Create billboard sprite
    const character = new BillboardSprite({
        texture: textureManager.getTexture('character'),
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
            run: { startFrame: 14, endFrame: 21 },
            jump: { startFrame: 22, endFrame: 23 }
        },
        shadow: {
            enabled: true,
            radius: 0.5,
            opacity: 0.3
        },
        renderEngine: THREE
    });

    // Add to scene
    scene.add(character.getObject3D());

    // Play idle animation
    character.play('idle');

    // Setup callbacks
    character.onAnimationComplete((animName) => {
        console.log(`Animation "${animName}" completed`);
    });

    return {
        character,
        textureManager,

        // Helper methods
        update(deltaTime) {
            character.update(deltaTime);
        },

        moveTo(x, z) {
            character.setPosition(x, 0, z);
        },

        playAnimation(name) {
            character.play(name);
        },

        cleanup() {
            character.cleanup();
            textureManager.unloadAll();
        }
    };
}

// Usage example:
/*
const characterController = await createBasicCharacter(scene);

// In game loop
function animate() {
    const deltaTime = clock.getDelta();
    characterController.update(deltaTime);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

// Control character
characterController.playAnimation('walk');
characterController.moveTo(5, 0);
*/
