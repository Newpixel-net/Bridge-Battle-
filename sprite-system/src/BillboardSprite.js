/**
 * BillboardSprite - Generic 3D billboard sprite
 *
 * A camera-facing sprite in 3D space with animation support.
 * Completely game-agnostic and can be used in any 3D engine that supports
 * billboard sprites (tested with THREE.js).
 *
 * @example
 * import * as THREE from 'three';
 * import { BillboardSprite } from './BillboardSprite.js';
 *
 * const sprite = new BillboardSprite({
 *   texture: myTexture,
 *   position: { x: 0, y: 0, z: 0 },
 *   size: { width: 1, height: 1 },
 *   animations: {
 *     walk: { startFrame: 0, endFrame: 7 },
 *     idle: { startFrame: 8, endFrame: 11 }
 *   },
 *   spriteSheet: {
 *     frameWidth: 64,
 *     frameHeight: 64,
 *     columns: 8,
 *     rows: 4,
 *     totalFrames: 24
 *   },
 *   renderEngine: THREE
 * });
 *
 * sprite.play('walk');
 * sprite.update(deltaTime);
 */
import { SpriteAnimationController } from './SpriteAnimationController.js';

export class BillboardSprite {
    /**
     * Create a billboard sprite
     *
     * @param {Object} options - Configuration options
     * @param {Object} options.texture - Texture object for the sprite
     * @param {Object} [options.position={x:0,y:0,z:0}] - Initial position
     * @param {Object} [options.size] - Sprite size
     * @param {number} [options.size.width] - Width in world units
     * @param {number} [options.size.height] - Height in world units
     * @param {Object} [options.spriteSheet] - Sprite sheet configuration
     * @param {number} options.spriteSheet.frameWidth - Frame width in pixels
     * @param {number} options.spriteSheet.frameHeight - Frame height in pixels
     * @param {number} options.spriteSheet.columns - Grid columns
     * @param {number} options.spriteSheet.rows - Grid rows
     * @param {number} options.spriteSheet.totalFrames - Total frames
     * @param {number} [options.spriteSheet.frameRate=30] - Animation frame rate
     * @param {Object} [options.animations] - Animation definitions
     * @param {Object} [options.materialOptions] - Material options (transparency, etc)
     * @param {Object} [options.shadow] - Shadow configuration
     * @param {boolean} [options.shadow.enabled=false] - Enable shadow
     * @param {number} [options.shadow.radius=0.5] - Shadow radius
     * @param {number} [options.shadow.opacity=0.3] - Shadow opacity
     * @param {Object} options.renderEngine - Rendering engine (e.g., THREE)
     */
    constructor(options = {}) {
        const {
            texture,
            position = { x: 0, y: 0, z: 0 },
            size,
            spriteSheet,
            animations = {},
            materialOptions = {},
            shadow = { enabled: false },
            renderEngine
        } = options;

        if (!texture) {
            throw new Error('BillboardSprite requires a texture');
        }

        if (!spriteSheet) {
            throw new Error('BillboardSprite requires spriteSheet configuration');
        }

        if (!renderEngine) {
            throw new Error('BillboardSprite requires a renderEngine (e.g., THREE)');
        }

        this.renderEngine = renderEngine;
        this.texture = texture;

        // Create group to hold sprite and shadow
        this.group = new this.renderEngine.Group();

        // Calculate size
        const aspectRatio = spriteSheet.frameWidth / spriteSheet.frameHeight;
        let width, height;

        if (size) {
            width = size.width;
            height = size.height || size.width / aspectRatio;
        } else {
            // Default: 1 unit height, maintain aspect ratio
            height = 1;
            width = height * aspectRatio;
        }

        this.width = width;
        this.height = height;

        // Create sprite material
        const spriteMaterial = new this.renderEngine.SpriteMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.1,
            depthWrite: true,
            depthTest: true,
            ...materialOptions
        });

        // Create sprite
        this.sprite = new this.renderEngine.Sprite(spriteMaterial);
        this.sprite.scale.set(width, height, 1);

        // Offset sprite up so the bottom is at Y=0 (feet on ground)
        this.sprite.position.y = height / 2;

        this.group.add(this.sprite);

        // Position in world
        this.group.position.set(position.x, position.y, position.z);

        // Create shadow if enabled
        this.shadow = null;
        if (shadow.enabled) {
            this.createShadow(shadow);
        }

        // Create animation controller
        this.animController = new SpriteAnimationController(texture, {
            frameWidth: spriteSheet.frameWidth,
            frameHeight: spriteSheet.frameHeight,
            columns: spriteSheet.columns,
            rows: spriteSheet.rows,
            totalFrames: spriteSheet.totalFrames,
            frameRate: spriteSheet.frameRate || 30
        });

        // Add animations
        Object.entries(animations).forEach(([name, config]) => {
            this.animController.addAnimation(
                name,
                config.startFrame,
                config.endFrame,
                config.options
            );
        });

        // Custom data (for user extensions)
        this.userData = {};
    }

    /**
     * Create a circular shadow under the sprite
     *
     * @param {Object} shadowConfig - Shadow configuration
     * @private
     */
    createShadow(shadowConfig) {
        const {
            radius = 0.5,
            opacity = 0.3,
            color = 0x000000,
            segments = 16
        } = shadowConfig;

        const shadowGeometry = new this.renderEngine.CircleGeometry(radius, segments);
        const shadowMaterial = new this.renderEngine.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: opacity,
            depthWrite: false
        });

        this.shadow = new this.renderEngine.Mesh(shadowGeometry, shadowMaterial);
        this.shadow.rotation.x = -Math.PI / 2;
        this.shadow.position.y = 0.01; // Slightly above ground to prevent z-fighting
        this.group.add(this.shadow);
    }

    /**
     * Update the sprite (call in your game loop)
     *
     * @param {number} deltaTime - Time elapsed since last update (in seconds)
     */
    update(deltaTime) {
        this.animController.update(deltaTime);
    }

    /**
     * Play an animation
     *
     * @param {string} animationName - Name of the animation
     * @param {boolean} [loop=true] - Whether to loop the animation
     * @returns {boolean} True if animation started successfully
     */
    play(animationName, loop = true) {
        return this.animController.play(animationName, loop);
    }

    /**
     * Stop the current animation
     */
    stop() {
        this.animController.stop();
    }

    /**
     * Pause the current animation
     */
    pause() {
        this.animController.pause();
    }

    /**
     * Resume the current animation
     */
    resume() {
        this.animController.resume();
    }

    /**
     * Set sprite position
     *
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} z - Z coordinate
     */
    setPosition(x, y, z) {
        this.group.position.set(x, y, z);
    }

    /**
     * Get sprite position
     *
     * @returns {Object} Position {x, y, z}
     */
    getPosition() {
        return {
            x: this.group.position.x,
            y: this.group.position.y,
            z: this.group.position.z
        };
    }

    /**
     * Set sprite scale
     *
     * @param {number} scaleX - X scale
     * @param {number} [scaleY] - Y scale (defaults to scaleX)
     */
    setScale(scaleX, scaleY) {
        const scale = scaleY !== undefined ? scaleY : scaleX;
        this.sprite.scale.set(this.width * scaleX, this.height * scale, 1);
    }

    /**
     * Set sprite opacity
     *
     * @param {number} opacity - Opacity value (0-1)
     */
    setOpacity(opacity) {
        this.sprite.material.opacity = Math.max(0, Math.min(1, opacity));
        this.sprite.material.transparent = opacity < 1;
    }

    /**
     * Set sprite color tint
     *
     * @param {number} color - Color value (e.g., 0xFF0000 for red)
     */
    setColor(color) {
        this.sprite.material.color.setHex(color);
    }

    /**
     * Set sprite visibility
     *
     * @param {boolean} visible - Visibility state
     */
    setVisible(visible) {
        this.sprite.visible = visible;
        if (this.shadow) {
            this.shadow.visible = visible;
        }
    }

    /**
     * Get the 3D group object (for adding to scene)
     *
     * @returns {Object} The THREE.Group or equivalent
     */
    getObject3D() {
        return this.group;
    }

    /**
     * Get animation state
     *
     * @returns {Object} Current animation state
     */
    getAnimationState() {
        return this.animController.getState();
    }

    /**
     * Check if an animation exists
     *
     * @param {string} name - Animation name
     * @returns {boolean} True if animation exists
     */
    hasAnimation(name) {
        return this.animController.hasAnimation(name);
    }

    /**
     * Add a new animation
     *
     * @param {string} name - Animation name
     * @param {number} startFrame - Start frame index
     * @param {number} endFrame - End frame index
     * @param {Object} [options] - Animation options
     */
    addAnimation(name, startFrame, endFrame, options) {
        this.animController.addAnimation(name, startFrame, endFrame, options);
    }

    /**
     * Set callback for animation completion
     *
     * @param {Function} callback - Callback function (animationName) => {}
     */
    onAnimationComplete(callback) {
        this.animController.onAnimationComplete = callback;
    }

    /**
     * Set callback for frame changes
     *
     * @param {Function} callback - Callback function (frameIndex, animationName) => {}
     */
    onFrameChange(callback) {
        this.animController.onFrameChange = callback;
    }

    /**
     * Clean up resources
     */
    cleanup() {
        if (this.sprite) {
            if (this.sprite.geometry) {
                this.sprite.geometry.dispose();
            }
            if (this.sprite.material) {
                if (this.sprite.material.map) {
                    this.sprite.material.map.dispose();
                }
                this.sprite.material.dispose();
            }
        }

        if (this.shadow) {
            if (this.shadow.geometry) {
                this.shadow.geometry.dispose();
            }
            if (this.shadow.material) {
                this.shadow.material.dispose();
            }
        }

        // Clear references
        this.sprite = null;
        this.shadow = null;
        this.group = null;
        this.animController = null;
    }

    /**
     * Alias for cleanup
     */
    dispose() {
        this.cleanup();
    }

    /**
     * Alias for cleanup (for compatibility)
     */
    destroy() {
        this.cleanup();
    }
}

export default BillboardSprite;
