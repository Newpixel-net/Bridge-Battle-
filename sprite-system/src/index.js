/**
 * Sprite System - Reusable sprite rendering and animation system
 *
 * A game-agnostic sprite system for 2D sprites in 3D space (billboards)
 * and canvas-based dynamic sprites. Works with any rendering engine that
 * supports the required primitives (tested with THREE.js).
 *
 * @module sprite-system
 * @version 1.0.0
 * @license MIT
 */

// Core animation system
export { SpriteAnimationController } from './SpriteAnimationController.js';

// Texture management
export { SpriteTextureManager } from './SpriteTextureManager.js';

// 3D billboard sprites
export { BillboardSprite } from './BillboardSprite.js';

// Canvas-based sprites
export { CanvasSpriteRenderer } from './CanvasSpriteRenderer.js';

// Configuration and utilities
export {
    DEFAULT_SPRITE_SHEET_CONFIG,
    DEFAULT_TEXTURE_CONFIG,
    DEFAULT_MATERIAL_OPTIONS,
    DEFAULT_SHADOW_CONFIG,
    ANIMATION_FRAME_RATES,
    createSpriteSheetConfig,
    createAnimations,
    calculateSpriteSize,
    getPreset,
    mergeConfigs,
    validateSpriteSheetConfig,
    validateAnimation
} from './SpriteConfig.js';

/**
 * Version information
 */
export const VERSION = '1.0.0';

/**
 * Quick start helper - Create a complete sprite system
 *
 * @param {Object} renderEngine - Rendering engine (e.g., THREE)
 * @returns {Object} Sprite system components
 */
export function createSpriteSystem(renderEngine) {
    if (!renderEngine) {
        throw new Error('createSpriteSystem requires a rendering engine (e.g., THREE)');
    }

    const textureManager = new (require('./SpriteTextureManager.js').SpriteTextureManager)({
        loader: new renderEngine.TextureLoader(),
        textureConfig: require('./SpriteConfig.js').DEFAULT_TEXTURE_CONFIG.pixelPerfect
    });

    const canvasRenderer = new (require('./CanvasSpriteRenderer.js').CanvasSpriteRenderer)({
        renderEngine
    });

    return {
        textureManager,
        canvasRenderer,
        renderEngine,

        /**
         * Create a billboard sprite
         */
        createBillboardSprite: (options) => {
            return new (require('./BillboardSprite.js').BillboardSprite)({
                ...options,
                renderEngine
            });
        },

        /**
         * Load a texture
         */
        loadTexture: (name, path, config) => {
            return textureManager.loadTexture(name, path, config);
        },

        /**
         * Get a loaded texture
         */
        getTexture: (name, clone = true) => {
            return textureManager.getTexture(name, clone);
        }
    };
}

// Default export
export default {
    SpriteAnimationController,
    SpriteTextureManager,
    BillboardSprite,
    CanvasSpriteRenderer,
    createSpriteSystem,
    VERSION
};
