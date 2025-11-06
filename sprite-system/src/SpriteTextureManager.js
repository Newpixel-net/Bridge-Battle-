/**
 * SpriteTextureManager - Generic texture loading and management system
 *
 * Manages loading, caching, and cloning of sprite sheet textures.
 * Works with any texture loader that returns a texture object with
 * offset, repeat, and clone() methods.
 *
 * @example
 * // With THREE.js
 * import * as THREE from 'three';
 * const manager = new SpriteTextureManager({
 *   loader: new THREE.TextureLoader()
 * });
 *
 * // With custom loader
 * const manager = new SpriteTextureManager({
 *   loader: {
 *     load: (path, onLoad, onProgress, onError) => {
 *       // Custom loading logic
 *     }
 *   }
 * });
 *
 * await manager.loadTexture('player', '/sprites/player.png');
 * const texture = manager.getTexture('player');
 */
export class SpriteTextureManager {
    /**
     * Create a texture manager
     *
     * @param {Object} options - Configuration options
     * @param {Object} options.loader - Texture loader object (e.g., THREE.TextureLoader)
     * @param {Object} [options.textureConfig] - Default texture configuration
     * @param {number} [options.textureConfig.magFilter] - Magnification filter
     * @param {number} [options.textureConfig.minFilter] - Minification filter
     * @param {boolean} [options.textureConfig.generateMipmaps=true] - Generate mipmaps
     * @param {number} [options.textureConfig.wrapS] - S wrapping mode
     * @param {number} [options.textureConfig.wrapT] - T wrapping mode
     */
    constructor(options = {}) {
        if (!options.loader) {
            throw new Error('SpriteTextureManager requires a texture loader');
        }

        this.loader = options.loader;
        this.textures = {};
        this.loading = {};
        this.textureConfig = options.textureConfig || {};

        // Statistics
        this.stats = {
            loaded: 0,
            failed: 0,
            cached: 0
        };
    }

    /**
     * Configure default texture settings
     *
     * @param {Object} config - Texture configuration
     */
    setDefaultTextureConfig(config) {
        this.textureConfig = { ...this.textureConfig, ...config };
    }

    /**
     * Apply configuration to a texture
     *
     * @param {Object} texture - Texture to configure
     * @param {Object} [config] - Configuration to apply (uses defaults if not provided)
     * @private
     */
    configureTexture(texture, config = {}) {
        const finalConfig = { ...this.textureConfig, ...config };

        if (finalConfig.magFilter !== undefined) {
            texture.magFilter = finalConfig.magFilter;
        }
        if (finalConfig.minFilter !== undefined) {
            texture.minFilter = finalConfig.minFilter;
        }
        if (finalConfig.generateMipmaps !== undefined) {
            texture.generateMipmaps = finalConfig.generateMipmaps;
        }
        if (finalConfig.wrapS !== undefined) {
            texture.wrapS = finalConfig.wrapS;
        }
        if (finalConfig.wrapT !== undefined) {
            texture.wrapT = finalConfig.wrapT;
        }
    }

    /**
     * Load a sprite sheet texture
     *
     * @param {string} name - Unique identifier for the texture
     * @param {string} path - Path to the texture file
     * @param {Object} [config] - Texture configuration (overrides defaults)
     * @returns {Promise<Object>} Promise resolving to the loaded texture
     */
    loadTexture(name, path, config = {}) {
        // Return cached texture
        if (this.textures[name]) {
            this.stats.cached++;
            return Promise.resolve(this.textures[name]);
        }

        // Return existing loading promise
        if (this.loading[name]) {
            return this.loading[name];
        }

        // Start loading
        this.loading[name] = new Promise((resolve, reject) => {
            this.loader.load(
                path,
                (texture) => {
                    // Configure texture
                    this.configureTexture(texture, config);

                    // Store and resolve
                    this.textures[name] = texture;
                    this.stats.loaded++;
                    delete this.loading[name];
                    resolve(texture);
                },
                undefined, // onProgress callback
                (error) => {
                    console.error(`Failed to load texture "${name}" from: ${path}`, error);
                    this.stats.failed++;
                    delete this.loading[name];
                    reject(error);
                }
            );
        });

        return this.loading[name];
    }

    /**
     * Load multiple textures in parallel
     *
     * @param {Array<Object>} textures - Array of {name, path, config} objects
     * @returns {Promise<Object[]>} Promise resolving to array of loaded textures
     */
    async loadTextures(textures) {
        const promises = textures.map(tex =>
            this.loadTexture(tex.name, tex.path, tex.config)
        );
        return Promise.all(promises);
    }

    /**
     * Get a loaded texture (cloned for independent UV manipulation)
     *
     * @param {string} name - Name of the texture to get
     * @param {boolean} [clone=true] - Whether to clone the texture
     * @returns {Object|null} Texture object or null if not found
     */
    getTexture(name, clone = true) {
        if (!this.textures[name]) {
            console.warn(`Texture "${name}" not loaded yet`);
            return null;
        }

        // Clone texture so each sprite can have independent UV offsets for animation
        return clone ? this.textures[name].clone() : this.textures[name];
    }

    /**
     * Get the original (non-cloned) texture
     *
     * @param {string} name - Name of the texture to get
     * @returns {Object|null} Original texture object or null if not found
     */
    getOriginalTexture(name) {
        return this.getTexture(name, false);
    }

    /**
     * Check if a texture is loaded
     *
     * @param {string} name - Name of the texture to check
     * @returns {boolean} True if texture is loaded
     */
    hasTexture(name) {
        return this.textures.hasOwnProperty(name);
    }

    /**
     * Check if a texture is currently loading
     *
     * @param {string} name - Name of the texture to check
     * @returns {boolean} True if texture is loading
     */
    isLoading(name) {
        return this.loading.hasOwnProperty(name);
    }

    /**
     * Unload a texture from memory
     *
     * @param {string} name - Name of the texture to unload
     * @returns {boolean} True if texture was unloaded
     */
    unloadTexture(name) {
        if (this.textures[name]) {
            // Dispose texture if it has a dispose method
            if (typeof this.textures[name].dispose === 'function') {
                this.textures[name].dispose();
            }
            delete this.textures[name];
            return true;
        }
        return false;
    }

    /**
     * Unload all textures from memory
     */
    unloadAll() {
        Object.keys(this.textures).forEach(name => {
            this.unloadTexture(name);
        });
        this.textures = {};
    }

    /**
     * Get list of all loaded texture names
     *
     * @returns {string[]} Array of texture names
     */
    getLoadedTextures() {
        return Object.keys(this.textures);
    }

    /**
     * Get loading statistics
     *
     * @returns {Object} Loading statistics
     */
    getStats() {
        return {
            ...this.stats,
            totalLoaded: Object.keys(this.textures).length,
            currentlyLoading: Object.keys(this.loading).length
        };
    }

    /**
     * Wait for all pending loads to complete
     *
     * @returns {Promise<Object[]>} Promise resolving when all loads complete
     */
    async waitForAll() {
        const pending = Object.values(this.loading);
        if (pending.length === 0) {
            return Promise.resolve([]);
        }
        return Promise.all(pending);
    }

    /**
     * Create a texture atlas mapping
     * Useful for managing multiple sprites from a single sheet
     *
     * @param {string} atlasName - Name for the atlas
     * @param {Object} mapping - Map of sprite names to frame indices
     * @returns {Object} Atlas object with sprite accessor methods
     */
    createAtlas(atlasName, mapping) {
        return {
            name: atlasName,
            mapping,
            getSprite: (spriteName) => {
                if (!mapping[spriteName]) {
                    console.warn(`Sprite "${spriteName}" not found in atlas "${atlasName}"`);
                    return null;
                }
                return {
                    texture: this.getTexture(atlasName),
                    ...mapping[spriteName]
                };
            }
        };
    }
}

export default SpriteTextureManager;
