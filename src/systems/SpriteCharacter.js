/**
 * SpriteCharacter - Billboard sprite character system for Three.js
 * Uses sprite sheets for animated 2D characters in 3D space
 */

import * as THREE from 'three';

export class SpriteAnimationController {
    constructor(spriteSheetTexture, frameWidth, frameHeight, columns, rows, totalFrames) {
        this.texture = spriteSheetTexture;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.columns = columns;
        this.rows = rows;
        this.totalFrames = totalFrames;

        // Animation state
        this.currentFrame = 0;
        this.currentAnimation = null;
        this.animations = {};
        this.frameTime = 1/30; // 30 FPS
        this.elapsedTime = 0;
        this.loop = true;

        // Calculate UV coordinates for each frame
        this.frameUVs = [];
        this.calculateFrameUVs();
    }

    calculateFrameUVs() {
        const frameW = 1 / this.columns;
        const frameH = 1 / this.rows;

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.columns; col++) {
                const frameIndex = row * this.columns + col;
                if (frameIndex >= this.totalFrames) break;

                this.frameUVs.push({
                    offsetX: col * frameW,
                    offsetY: row * frameH,
                    repeatX: frameW,
                    repeatY: frameH
                });
            }
        }
    }

    /**
     * Define an animation by name and frame range
     */
    addAnimation(name, startFrame, endFrame) {
        this.animations[name] = {
            name,
            startFrame,
            endFrame,
            frameCount: endFrame - startFrame + 1
        };
    }

    /**
     * Play an animation by name
     */
    play(animationName, loop = true) {
        if (this.currentAnimation === animationName) return;

        const anim = this.animations[animationName];
        if (!anim) {
            console.warn(`Animation "${animationName}" not found`);
            return;
        }

        this.currentAnimation = animationName;
        this.currentFrame = anim.startFrame;
        this.loop = loop;
        this.elapsedTime = 0;
        this.updateTextureOffset();
    }

    /**
     * Update animation (call every frame)
     */
    update(deltaTime) {
        if (!this.currentAnimation) return;

        this.elapsedTime += deltaTime;

        if (this.elapsedTime >= this.frameTime) {
            this.elapsedTime = 0;

            const anim = this.animations[this.currentAnimation];
            this.currentFrame++;

            // Loop or stop at end
            if (this.currentFrame > anim.endFrame) {
                if (this.loop) {
                    this.currentFrame = anim.startFrame;
                } else {
                    this.currentFrame = anim.endFrame;
                }
            }

            this.updateTextureOffset();
        }
    }

    updateTextureOffset() {
        if (this.currentFrame >= this.frameUVs.length) return;

        const uv = this.frameUVs[this.currentFrame];
        this.texture.offset.set(uv.offsetX, uv.offsetY);
        this.texture.repeat.set(uv.repeatX, uv.repeatY);
    }
}

export class SpriteCharacter {
    constructor(x, y, z, index, textureManager) {
        this.index = index;
        this.group = new THREE.Group();
        this.textureManager = textureManager;

        // Get run animation texture
        const texture = textureManager.getTexture('run');

        // Create sprite material
        const spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.1,
            depthWrite: true,
            depthTest: true
        });

        // Create sprite
        this.sprite = new THREE.Sprite(spriteMaterial);

        // Scale to make character 1.5 units tall (frame is 275x294px)
        // Aspect ratio: 275/294 = 0.935
        const targetHeight = 1.5;
        const aspectRatio = 275 / 294;
        this.sprite.scale.set(targetHeight * aspectRatio, targetHeight, 1);

        // Offset sprite up so feet are at Y=0
        this.sprite.position.y = targetHeight / 2;

        this.group.add(this.sprite);

        // Position in world
        this.group.position.set(x, y, z);

        // Add shadow (simple circular shadow on ground)
        this.createShadow();

        // Animation controller
        this.animController = new SpriteAnimationController(
            texture,
            275,  // frame width
            294,  // frame height
            6,    // columns
            6,    // rows
            36    // total frames
        );

        // Define animations from metadata
        this.animController.addAnimation('idle', 0, 5);
        this.animController.addAnimation('run', 6, 11);
        this.animController.addAnimation('shoot', 12, 17);
        this.animController.addAnimation('death', 18, 23);

        // Start with run animation
        this.animController.play('run', true);

        // Movement properties
        this.velocityX = 0;
        this.velocityZ = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.formationOffsetX = 0;
        this.formationOffsetZ = 0;

        // Shooting
        this.shootCooldown = 0;
        this.maxShootCooldown = 0.33; // ~3 shots per second
    }

    createShadow() {
        // Simple circular shadow on ground
        const shadowGeometry = new THREE.CircleGeometry(0.4, 16);
        const shadowMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.3,
            depthWrite: false
        });

        this.shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
        this.shadow.rotation.x = -Math.PI / 2;
        this.shadow.position.y = 0.01; // Slightly above ground to prevent z-fighting
        this.group.add(this.shadow);
    }

    update(deltaTime, squadCenter, allCharacters) {
        // Update sprite animation
        this.animController.update(deltaTime);

        // Update shooting cooldown
        if (this.shootCooldown > 0) {
            this.shootCooldown -= deltaTime;
        }

        // Calculate target position (formation position relative to squad center)
        const targetX = squadCenter.x + this.formationOffsetX;
        const targetZ = squadCenter.z + this.formationOffsetZ;

        // Blob physics - separation forces
        const separationRadius = 1.2;
        const separationStrength = 10.0;
        let separationX = 0;
        let separationZ = 0;

        allCharacters.forEach(other => {
            if (other === this) return;

            const dx = this.group.position.x - other.group.position.x;
            const dz = this.group.position.z - other.group.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);

            if (dist < separationRadius && dist > 0) {
                const force = (separationRadius - dist) / separationRadius;
                separationX += (dx / dist) * force * separationStrength;
                separationZ += (dz / dist) * force * separationStrength;
            }
        });

        // Apply forces to velocity
        const moveSpeed = 8.0;
        const drag = 0.85;

        this.velocityX += (targetX - this.group.position.x) * moveSpeed * deltaTime;
        this.velocityZ += (targetZ - this.group.position.z) * moveSpeed * deltaTime;

        this.velocityX += separationX * deltaTime;
        this.velocityZ += separationZ * deltaTime;

        // Apply drag
        this.velocityX *= drag;
        this.velocityZ *= drag;

        // Update position
        this.group.position.x += this.velocityX * deltaTime;
        this.group.position.z += this.velocityZ * deltaTime;

        // Clamp to bridge bounds (±18 units, leaving margin for edges)
        this.group.position.x = Math.max(-18, Math.min(18, this.group.position.x));

        // Animation state management (Phase 6: Dynamic animations)
        const speed = Math.sqrt(this.velocityX * this.velocityX + this.velocityZ * this.velocityZ);
        const movingThreshold = 0.5;

        if (speed > movingThreshold) {
            // Moving - play run animation
            if (this.animController.currentAnimation !== 'run') {
                this.animController.play('run', true);
            }
        } else {
            // Stopped - play idle animation
            if (this.animController.currentAnimation !== 'idle') {
                this.animController.play('idle', true);
            }
        }

        // Billboard effect is automatic with THREE.Sprite
        // Sprites always face the camera
    }

    canShoot() {
        return this.shootCooldown <= 0;
    }

    shoot() {
        this.shootCooldown = this.maxShootCooldown;
    }

    playAnimation(animName) {
        this.animController.play(animName, true);
    }

    cleanup() {
        if (this.sprite) {
            this.sprite.geometry.dispose();
            this.sprite.material.dispose();
        }
        if (this.shadow) {
            this.shadow.geometry.dispose();
            this.shadow.material.dispose();
        }
    }
}

/**
 * TextureManager - Manages loading and caching of sprite sheet textures
 */
export class SpriteTextureManager {
    constructor() {
        this.textures = {};
        this.loader = new THREE.TextureLoader();
        this.loading = {};
    }

    /**
     * Load a sprite sheet texture
     */
    loadTexture(name, path) {
        if (this.textures[name]) {
            return Promise.resolve(this.textures[name]);
        }

        if (this.loading[name]) {
            return this.loading[name];
        }

        this.loading[name] = new Promise((resolve, reject) => {
            this.loader.load(
                path,
                (texture) => {
                    // Configure texture for pixel-perfect sprites
                    texture.magFilter = THREE.NearestFilter;
                    texture.minFilter = THREE.LinearMipMapLinearFilter;
                    texture.generateMipmaps = true;
                    texture.wrapS = THREE.ClampToEdgeWrapping;
                    texture.wrapT = THREE.ClampToEdgeWrapping;

                    this.textures[name] = texture;
                    delete this.loading[name];
                    resolve(texture);
                },
                undefined,
                (error) => {
                    console.error(`Failed to load texture: ${path}`, error);
                    delete this.loading[name];
                    reject(error);
                }
            );
        });

        return this.loading[name];
    }

    /**
     * Get a loaded texture
     */
    getTexture(name) {
        if (!this.textures[name]) {
            console.warn(`Texture "${name}" not loaded yet`);
            return null;
        }
        return this.textures[name].clone(); // Clone so each sprite can have independent UV offsets
    }

    /**
     * Preload all sprite sheets
     */
    async preloadAll() {
        console.log('📦 Preloading sprite sheets...');

        const texturesToLoad = [
            { name: 'run', path: '/processed-assets/sprite-sheets/run/run@2x.png' },
            { name: 'gunfire', path: '/processed-assets/sprite-sheets/gunfire/gunfire@2x.png' },
            { name: 'power-attack', path: '/processed-assets/sprite-sheets/power-attack/power-attack@2x.png' }
        ];

        try {
            await Promise.all(
                texturesToLoad.map(tex => this.loadTexture(tex.name, tex.path))
            );
            console.log('✓ All sprite sheets loaded');
        } catch (error) {
            console.error('❌ Failed to load sprite sheets:', error);
            throw error;
        }
    }
}

export default SpriteCharacter;
