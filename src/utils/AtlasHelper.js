/**
 * AtlasHelper - Professional sprite atlas management
 *
 * Provides easy access to UI elements from multiple atlases
 * with automatic scaling and positioning
 */

import { UI_SCALE } from './GameConstants.js';

export class AtlasHelper {
    /**
     * @param {Phaser.Scene} scene - The Phaser scene
     * @param {object} atlasData - The loaded atlas JSON data
     */
    constructor(scene, atlasData) {
        this.scene = scene;
        this.atlasData = atlasData;
        this.cache = new Map();
    }

    /**
     * Get frame data for a specific UI element
     * @param {string} elementName - Name of the UI element
     * @returns {object} Frame data with atlas info
     */
    getFrameData(elementName) {
        // Check cache first
        if (this.cache.has(elementName)) {
            return this.cache.get(elementName);
        }

        // Search through all atlases
        const atlases = this.atlasData.atlases;

        for (const [atlasName, atlasInfo] of Object.entries(atlases)) {
            if (atlasInfo.frames && atlasInfo.frames[elementName]) {
                const frameData = {
                    atlasName,
                    imageName: atlasInfo.image,
                    frame: atlasInfo.frames[elementName].frame,
                    pivot: atlasInfo.frames[elementName].pivot || { x: 0.5, y: 0.5 }
                };

                this.cache.set(elementName, frameData);
                return frameData;
            }
        }

        console.warn(`⚠️  AtlasHelper: Frame "${elementName}" not found in any atlas`);
        return null;
    }

    /**
     * Create a sprite from atlas with automatic cropping
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} elementName - Name of the UI element
     * @param {number} scale - Optional scale override
     * @returns {Phaser.GameObjects.Image} The created sprite
     */
    createSprite(x, y, elementName, scale = null) {
        console.log(`🔍 createSprite called: elementName="${elementName}"`);

        const frameData = this.getFrameData(elementName);

        if (!frameData) {
            console.error(`❌ createSprite: No frame data for "${elementName}"`);
            // Fallback: create a placeholder
            return this.scene.add.rectangle(x, y, 100, 100, 0xFF00FF, 0.5);
        }

        console.log(`✅ Frame data found:`, frameData);

        // Load the full texture
        const texture = this.scene.textures.get(frameData.atlasName);

        if (!texture || texture.key === '__MISSING') {
            console.error(`❌ Texture "${frameData.atlasName}" not loaded`);
            console.log('Available textures:', this.scene.textures.list);
            return this.scene.add.rectangle(x, y, 100, 100, 0xFF0000, 0.5);
        }

        console.log(`✅ Texture "${frameData.atlasName}" found`);

        // Create sprite with crop
        const sprite = this.scene.add.image(x, y, frameData.atlasName);

        // Apply crop to show only this frame
        sprite.setCrop(
            frameData.frame.x,
            frameData.frame.y,
            frameData.frame.w,
            frameData.frame.h
        );

        console.log(`✅ Sprite cropped to:`, frameData.frame);

        // Set origin based on pivot
        sprite.setOrigin(frameData.pivot.x, frameData.pivot.y);

        // Apply scale
        const elementType = this.getElementType(elementName);
        const defaultScale = this.getDefaultScale(elementType);
        const finalScale = scale || defaultScale;
        sprite.setScale(finalScale);

        console.log(`✅ Sprite created at (${x}, ${y}) with scale ${finalScale}`);

        return sprite;
    }

    /**
     * Create an interactive button from atlas
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} elementName - Name of the button element
     * @param {function} onClick - Click callback
     * @param {number} scale - Optional scale override
     * @returns {Phaser.GameObjects.Image} The created button
     */
    createButton(x, y, elementName, onClick, scale = null) {
        console.log(`🔍 createButton called: elementName="${elementName}" at (${x}, ${y})`);

        const button = this.createSprite(x, y, elementName, scale);

        if (!button) {
            console.error(`❌ createButton: Failed to create sprite for "${elementName}"`);
            return null;
        }

        console.log(`✅ Button sprite created, making interactive`);

        // Make interactive
        button.setInteractive({ useHandCursor: true });

        const baseScale = button.scaleX;
        const hoverScale = baseScale * 1.08;
        const clickScale = baseScale * 0.95;

        // Hover effects
        button.on('pointerover', () => {
            this.scene.tweens.add({
                targets: button,
                scaleX: hoverScale,
                scaleY: hoverScale,
                duration: 150,
                ease: 'Back.easeOut'
            });
            button.setTint(0xFFFFFF);
        });

        button.on('pointerout', () => {
            this.scene.tweens.add({
                targets: button,
                scaleX: baseScale,
                scaleY: baseScale,
                duration: 150
            });
            button.clearTint();
        });

        // Click effect
        button.on('pointerdown', () => {
            this.scene.tweens.add({
                targets: button,
                scaleX: clickScale,
                scaleY: clickScale,
                duration: 100,
                yoyo: true,
                ease: 'Quad.easeInOut'
            });

            if (onClick) {
                this.scene.time.delayedCall(100, onClick);
            }
        });

        return button;
    }

    /**
     * Get element type from name
     * @param {string} elementName
     * @returns {string} Element type (button, panel, icon, etc.)
     */
    getElementType(elementName) {
        if (elementName.startsWith('button_')) return 'button';
        if (elementName.startsWith('panel_')) return 'panel';
        if (elementName.startsWith('icon_')) return 'icon';
        if (elementName.startsWith('banner_')) return 'banner';
        return 'default';
    }

    /**
     * Get default scale for element type
     * @param {string} type - Element type
     * @returns {number} Default scale
     */
    getDefaultScale(type) {
        const scalingData = this.atlasData.scaling;

        if (scalingData && scalingData[type]) {
            return scalingData[type];
        }

        // Fallback to UI_SCALE constants
        switch (type) {
            case 'button': return UI_SCALE.BUTTON;
            case 'panel': return UI_SCALE.PANEL;
            case 'icon': return UI_SCALE.ICON;
            default: return 0.5;
        }
    }

    /**
     * Get all elements in a category
     * @param {string} category - Category name (buttons, panels, icons, etc.)
     * @returns {array} Array of element names
     */
    getCategory(category) {
        const categories = this.atlasData.categories;

        if (categories && categories[category]) {
            return categories[category].elements.map(el => el.name);
        }

        return [];
    }

    /**
     * Preload all required atlases
     * @static
     * @param {Phaser.Scene} scene - The scene loading assets
     * @param {string} atlasJsonPath - Path to the atlas JSON
     */
    static preloadAtlases(scene, atlasJsonPath = 'assets/ui-atlas/ui-complete-atlas.json') {
        // Load the atlas JSON first
        scene.load.json('ui_atlas_complete', atlasJsonPath);

        // Load the sprite sheets
        scene.load.image('zombie', 'assets/ui-atlas/ui-zombie.png');
        scene.load.image('zombie2', 'assets/ui-atlas/ui-zombie2.png');
        scene.load.image('viking', 'assets/ui-atlas/ui-viking.png');
    }

    /**
     * Initialize atlas helper in a scene
     * @static
     * @param {Phaser.Scene} scene - The scene
     * @returns {AtlasHelper} Initialized helper instance
     */
    static initialize(scene) {
        console.log('🔍 AtlasHelper.initialize() called');

        const atlasData = scene.cache.json.get('ui_atlas_complete');

        if (!atlasData) {
            console.error('❌ AtlasHelper: ui_atlas_complete not loaded!');
            console.log('Available JSON keys:', scene.cache.json.getKeys());
            return null;
        }

        console.log('✅ AtlasHelper: ui_atlas_complete loaded successfully');
        console.log('Atlas data:', atlasData);

        return new AtlasHelper(scene, atlasData);
    }
}

export default AtlasHelper;
