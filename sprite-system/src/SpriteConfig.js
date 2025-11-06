/**
 * SpriteConfig - Configuration utilities and helpers
 *
 * Provides default configurations and helper methods for sprite setup.
 */

/**
 * Default sprite sheet configuration
 */
export const DEFAULT_SPRITE_SHEET_CONFIG = {
    frameWidth: 64,
    frameHeight: 64,
    columns: 8,
    rows: 8,
    totalFrames: 64,
    frameRate: 30
};

/**
 * Default texture configuration for THREE.js
 */
export const DEFAULT_TEXTURE_CONFIG = {
    // Pixel-perfect rendering (nearest neighbor)
    pixelPerfect: {
        magFilter: 9728, // THREE.NearestFilter
        minFilter: 9987, // THREE.LinearMipMapLinearFilter
        generateMipmaps: true,
        wrapS: 1001,    // THREE.ClampToEdgeWrapping
        wrapT: 1001     // THREE.ClampToEdgeWrapping
    },
    // Smooth rendering (linear interpolation)
    smooth: {
        magFilter: 9729, // THREE.LinearFilter
        minFilter: 9987, // THREE.LinearMipMapLinearFilter
        generateMipmaps: true,
        wrapS: 1001,
        wrapT: 1001
    }
};

/**
 * Default sprite material options
 */
export const DEFAULT_MATERIAL_OPTIONS = {
    transparent: true,
    alphaTest: 0.1,
    depthWrite: true,
    depthTest: true
};

/**
 * Default shadow configuration
 */
export const DEFAULT_SHADOW_CONFIG = {
    enabled: false,
    radius: 0.5,
    opacity: 0.3,
    color: 0x000000,
    segments: 16
};

/**
 * Common animation frame rates
 */
export const ANIMATION_FRAME_RATES = {
    CINEMATIC: 24,
    STANDARD: 30,
    SMOOTH: 60,
    FAST: 120
};

/**
 * Helper to create sprite sheet configuration from texture size
 *
 * @param {Object} options - Options
 * @param {number} options.textureWidth - Total texture width in pixels
 * @param {number} options.textureHeight - Total texture height in pixels
 * @param {number} options.frameWidth - Single frame width
 * @param {number} options.frameHeight - Single frame height
 * @param {number} [options.frameRate=30] - Animation frame rate
 * @returns {Object} Sprite sheet configuration
 */
export function createSpriteSheetConfig(options) {
    const { textureWidth, textureHeight, frameWidth, frameHeight, frameRate = 30 } = options;

    const columns = Math.floor(textureWidth / frameWidth);
    const rows = Math.floor(textureHeight / frameHeight);
    const totalFrames = columns * rows;

    return {
        frameWidth,
        frameHeight,
        columns,
        rows,
        totalFrames,
        frameRate
    };
}

/**
 * Helper to create animation definitions from metadata
 *
 * @param {Array<Object>} animationList - List of animation definitions
 * @returns {Object} Animation definitions map
 *
 * @example
 * const animations = createAnimations([
 *   { name: 'idle', startFrame: 0, endFrame: 5 },
 *   { name: 'walk', startFrame: 6, endFrame: 13 },
 *   { name: 'run', startFrame: 14, endFrame: 21 }
 * ]);
 */
export function createAnimations(animationList) {
    const animations = {};
    animationList.forEach(anim => {
        animations[anim.name] = {
            startFrame: anim.startFrame,
            endFrame: anim.endFrame,
            options: anim.options || {}
        };
    });
    return animations;
}

/**
 * Helper to calculate sprite size from dimensions
 *
 * @param {Object} options - Size options
 * @param {number} [options.width] - Target width
 * @param {number} [options.height] - Target height
 * @param {number} options.frameWidth - Frame width in pixels
 * @param {number} options.frameHeight - Frame height in pixels
 * @returns {Object} Size object {width, height}
 */
export function calculateSpriteSize(options) {
    const { width, height, frameWidth, frameHeight } = options;
    const aspectRatio = frameWidth / frameHeight;

    if (width && height) {
        return { width, height };
    } else if (width) {
        return { width, height: width / aspectRatio };
    } else if (height) {
        return { width: height * aspectRatio, height };
    } else {
        // Default to 1 unit height
        return { width: aspectRatio, height: 1 };
    }
}

/**
 * Helper to create a sprite configuration preset
 *
 * @param {string} preset - Preset name
 * @returns {Object} Configuration object
 */
export function getPreset(preset) {
    const presets = {
        // Character sprites (typical game character)
        character: {
            spriteSheet: {
                frameWidth: 64,
                frameHeight: 64,
                columns: 8,
                rows: 8,
                totalFrames: 64,
                frameRate: 30
            },
            size: { height: 1.5 },
            shadow: { enabled: true, radius: 0.4, opacity: 0.3 },
            materialOptions: { ...DEFAULT_MATERIAL_OPTIONS }
        },

        // UI sprites (interface elements)
        ui: {
            spriteSheet: {
                frameWidth: 32,
                frameHeight: 32,
                columns: 8,
                rows: 8,
                totalFrames: 64,
                frameRate: 30
            },
            size: { height: 1 },
            shadow: { enabled: false },
            materialOptions: { transparent: true, depthWrite: false }
        },

        // Particle sprites (effects)
        particle: {
            spriteSheet: {
                frameWidth: 32,
                frameHeight: 32,
                columns: 4,
                rows: 4,
                totalFrames: 16,
                frameRate: 60
            },
            size: { height: 0.5 },
            shadow: { enabled: false },
            materialOptions: {
                transparent: true,
                depthWrite: false,
                alphaTest: 0.01
            }
        },

        // Large sprites (bosses, large objects)
        large: {
            spriteSheet: {
                frameWidth: 128,
                frameHeight: 128,
                columns: 8,
                rows: 8,
                totalFrames: 64,
                frameRate: 24
            },
            size: { height: 3 },
            shadow: { enabled: true, radius: 1.5, opacity: 0.4 },
            materialOptions: { ...DEFAULT_MATERIAL_OPTIONS }
        },

        // Pixel art (retro style)
        pixelArt: {
            spriteSheet: {
                frameWidth: 16,
                frameHeight: 16,
                columns: 16,
                rows: 16,
                totalFrames: 256,
                frameRate: 12
            },
            size: { height: 1 },
            shadow: { enabled: false },
            materialOptions: { ...DEFAULT_MATERIAL_OPTIONS }
        }
    };

    return presets[preset] || presets.character;
}

/**
 * Merge sprite configurations
 *
 * @param {...Object} configs - Configuration objects to merge
 * @returns {Object} Merged configuration
 */
export function mergeConfigs(...configs) {
    const merged = {};

    configs.forEach(config => {
        Object.keys(config).forEach(key => {
            if (typeof config[key] === 'object' && !Array.isArray(config[key])) {
                merged[key] = { ...merged[key], ...config[key] };
            } else {
                merged[key] = config[key];
            }
        });
    });

    return merged;
}

/**
 * Validate sprite sheet configuration
 *
 * @param {Object} config - Configuration to validate
 * @returns {Object} Validation result {valid, errors}
 */
export function validateSpriteSheetConfig(config) {
    const errors = [];

    if (!config) {
        errors.push('Configuration is required');
        return { valid: false, errors };
    }

    const required = ['frameWidth', 'frameHeight', 'columns', 'rows', 'totalFrames'];
    required.forEach(field => {
        if (config[field] === undefined) {
            errors.push(`Missing required field: ${field}`);
        } else if (typeof config[field] !== 'number' || config[field] <= 0) {
            errors.push(`Invalid ${field}: must be a positive number`);
        }
    });

    if (config.columns * config.rows < config.totalFrames) {
        errors.push(`Invalid grid: ${config.columns}x${config.rows} cannot fit ${config.totalFrames} frames`);
    }

    if (config.frameRate !== undefined) {
        if (typeof config.frameRate !== 'number' || config.frameRate <= 0) {
            errors.push('Invalid frameRate: must be a positive number');
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Validate animation definition
 *
 * @param {Object} animation - Animation to validate
 * @param {number} totalFrames - Total frames in sprite sheet
 * @returns {Object} Validation result {valid, errors}
 */
export function validateAnimation(animation, totalFrames) {
    const errors = [];

    if (!animation) {
        errors.push('Animation is required');
        return { valid: false, errors };
    }

    if (animation.startFrame === undefined) {
        errors.push('Missing startFrame');
    } else if (typeof animation.startFrame !== 'number' || animation.startFrame < 0) {
        errors.push('Invalid startFrame: must be a non-negative number');
    }

    if (animation.endFrame === undefined) {
        errors.push('Missing endFrame');
    } else if (typeof animation.endFrame !== 'number' || animation.endFrame < 0) {
        errors.push('Invalid endFrame: must be a non-negative number');
    }

    if (animation.startFrame !== undefined && animation.endFrame !== undefined) {
        if (animation.startFrame > animation.endFrame) {
            errors.push('startFrame must be less than or equal to endFrame');
        }
        if (animation.endFrame >= totalFrames) {
            errors.push(`endFrame (${animation.endFrame}) exceeds totalFrames (${totalFrames})`);
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

export default {
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
};
