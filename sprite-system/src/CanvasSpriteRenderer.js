/**
 * CanvasSpriteRenderer - Dynamic canvas-based sprite rendering
 *
 * Creates sprites from dynamically rendered canvas content.
 * Useful for text, UI elements, procedural graphics, etc.
 *
 * @example
 * import * as THREE from 'three';
 * import { CanvasSpriteRenderer } from './CanvasSpriteRenderer.js';
 *
 * const renderer = new CanvasSpriteRenderer({
 *   renderEngine: THREE
 * });
 *
 * // Create a text sprite
 * const textSprite = renderer.createTextSprite('Hello World', {
 *   fontSize: 32,
 *   color: '#FFFFFF',
 *   backgroundColor: '#000000'
 * });
 *
 * // Create a custom canvas sprite
 * const customSprite = renderer.createCustomSprite((ctx, canvas) => {
 *   ctx.fillStyle = 'red';
 *   ctx.fillRect(0, 0, canvas.width, canvas.height);
 * }, { width: 64, height: 64 });
 */
export class CanvasSpriteRenderer {
    /**
     * Create a canvas sprite renderer
     *
     * @param {Object} options - Configuration options
     * @param {Object} options.renderEngine - Rendering engine (e.g., THREE)
     * @param {Object} [options.textureClass] - Custom texture class (defaults to renderEngine.CanvasTexture)
     * @param {Object} [options.spriteClass] - Custom sprite class (defaults to renderEngine.Sprite)
     * @param {Object} [options.spriteMaterialClass] - Custom material class
     */
    constructor(options = {}) {
        if (!options.renderEngine) {
            throw new Error('CanvasSpriteRenderer requires a renderEngine');
        }

        this.renderEngine = options.renderEngine;
        this.TextureClass = options.textureClass || this.renderEngine.CanvasTexture;
        this.SpriteClass = options.spriteClass || this.renderEngine.Sprite;
        this.SpriteMaterialClass = options.spriteMaterialClass || this.renderEngine.SpriteMaterial;

        // Canvas cache for performance
        this.canvasCache = new Map();
    }

    /**
     * Create a canvas element
     *
     * @param {number} width - Canvas width in pixels
     * @param {number} height - Canvas height in pixels
     * @returns {HTMLCanvasElement} Canvas element
     * @private
     */
    createCanvas(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }

    /**
     * Create a sprite from a custom canvas drawing function
     *
     * @param {Function} drawFunction - Function(ctx, canvas) that draws on the canvas
     * @param {Object} options - Configuration options
     * @param {number} [options.width=256] - Canvas width
     * @param {number} [options.height=256] - Canvas height
     * @param {number} [options.scale=1] - Sprite scale
     * @param {Object} [options.materialOptions] - Material options
     * @returns {Object} Sprite object with { sprite, canvas, texture, update }
     */
    createCustomSprite(drawFunction, options = {}) {
        const {
            width = 256,
            height = 256,
            scale = 1,
            materialOptions = {}
        } = options;

        // Create canvas
        const canvas = this.createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // Execute drawing function
        drawFunction(ctx, canvas);

        // Create texture from canvas
        const texture = new this.TextureClass(canvas);

        // Create sprite material
        const material = new this.SpriteMaterialClass({
            map: texture,
            transparent: true,
            ...materialOptions
        });

        // Create sprite
        const sprite = new this.SpriteClass(material);
        sprite.scale.set(scale, scale, 1);

        // Return sprite with update capability
        return {
            sprite,
            canvas,
            texture,
            update: (newDrawFunction) => {
                ctx.clearRect(0, 0, width, height);
                newDrawFunction(ctx, canvas);
                texture.needsUpdate = true;
            },
            dispose: () => {
                if (sprite.material) {
                    if (sprite.material.map) {
                        sprite.material.map.dispose();
                    }
                    sprite.material.dispose();
                }
            }
        };
    }

    /**
     * Create a text sprite
     *
     * @param {string} text - Text to render
     * @param {Object} options - Text rendering options
     * @param {string} [options.font='Arial'] - Font family
     * @param {number} [options.fontSize=32] - Font size in pixels
     * @param {string} [options.fontWeight='normal'] - Font weight
     * @param {string} [options.color='#FFFFFF'] - Text color
     * @param {string} [options.backgroundColor='transparent'] - Background color
     * @param {number} [options.padding=10] - Padding around text
     * @param {string} [options.align='center'] - Text alignment
     * @param {string} [options.baseline='middle'] - Text baseline
     * @param {number} [options.scale=1] - Sprite scale
     * @param {Object} [options.stroke] - Stroke options
     * @param {string} [options.stroke.color='#000000'] - Stroke color
     * @param {number} [options.stroke.width=2] - Stroke width
     * @param {Object} [options.shadow] - Shadow options
     * @returns {Object} Sprite object
     */
    createTextSprite(text, options = {}) {
        const {
            font = 'Arial',
            fontSize = 32,
            fontWeight = 'normal',
            color = '#FFFFFF',
            backgroundColor = 'transparent',
            padding = 10,
            align = 'center',
            baseline = 'middle',
            scale = 1,
            stroke,
            shadow
        } = options;

        // Create temporary canvas to measure text
        const tempCanvas = this.createCanvas(1, 1);
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.font = `${fontWeight} ${fontSize}px ${font}`;
        const metrics = tempCtx.measureText(text);
        const textWidth = metrics.width;
        const textHeight = fontSize;

        // Create actual canvas with appropriate size
        const canvasWidth = textWidth + padding * 2;
        const canvasHeight = textHeight + padding * 2;

        return this.createCustomSprite((ctx, canvas) => {
            // Background
            if (backgroundColor !== 'transparent') {
                ctx.fillStyle = backgroundColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            // Text settings
            ctx.font = `${fontWeight} ${fontSize}px ${font}`;
            ctx.textAlign = align;
            ctx.textBaseline = baseline;

            // Position (center of canvas)
            const x = canvas.width / 2;
            const y = canvas.height / 2;

            // Shadow
            if (shadow) {
                ctx.shadowColor = shadow.color || '#000000';
                ctx.shadowBlur = shadow.blur || 4;
                ctx.shadowOffsetX = shadow.offsetX || 0;
                ctx.shadowOffsetY = shadow.offsetY || 0;
            }

            // Stroke
            if (stroke) {
                ctx.strokeStyle = stroke.color || '#000000';
                ctx.lineWidth = stroke.width || 2;
                ctx.strokeText(text, x, y);
            }

            // Fill text
            ctx.fillStyle = color;
            ctx.fillText(text, x, y);
        }, {
            width: canvasWidth,
            height: canvasHeight,
            scale
        });
    }

    /**
     * Create a progress bar sprite
     *
     * @param {number} value - Current value (0-1)
     * @param {Object} options - Bar options
     * @param {number} [options.width=200] - Bar width
     * @param {number} [options.height=20] - Bar height
     * @param {string} [options.fillColor='#00FF00'] - Fill color
     * @param {string} [options.backgroundColor='#333333'] - Background color
     * @param {string} [options.borderColor='#FFFFFF'] - Border color
     * @param {number} [options.borderWidth=2] - Border width
     * @param {number} [options.scale=1] - Sprite scale
     * @returns {Object} Sprite object with updateValue method
     */
    createProgressBarSprite(value, options = {}) {
        const {
            width = 200,
            height = 20,
            fillColor = '#00FF00',
            backgroundColor = '#333333',
            borderColor = '#FFFFFF',
            borderWidth = 2,
            scale = 1
        } = options;

        const drawBar = (ctx, canvas, val) => {
            // Background
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Fill (progress)
            const fillWidth = canvas.width * Math.max(0, Math.min(1, val));
            ctx.fillStyle = fillColor;
            ctx.fillRect(0, 0, fillWidth, canvas.height);

            // Border
            if (borderWidth > 0) {
                ctx.strokeStyle = borderColor;
                ctx.lineWidth = borderWidth;
                ctx.strokeRect(
                    borderWidth / 2,
                    borderWidth / 2,
                    canvas.width - borderWidth,
                    canvas.height - borderWidth
                );
            }
        };

        const sprite = this.createCustomSprite(
            (ctx, canvas) => drawBar(ctx, canvas, value),
            { width, height, scale }
        );

        // Add updateValue method
        sprite.updateValue = (newValue) => {
            sprite.update((ctx, canvas) => drawBar(ctx, canvas, newValue));
        };

        return sprite;
    }

    /**
     * Create a circular sprite
     *
     * @param {Object} options - Circle options
     * @param {number} [options.radius=32] - Circle radius
     * @param {string} [options.fillColor='#FF0000'] - Fill color
     * @param {string} [options.strokeColor] - Stroke color
     * @param {number} [options.strokeWidth=0] - Stroke width
     * @param {number} [options.scale=1] - Sprite scale
     * @returns {Object} Sprite object
     */
    createCircleSprite(options = {}) {
        const {
            radius = 32,
            fillColor = '#FF0000',
            strokeColor,
            strokeWidth = 0,
            scale = 1
        } = options;

        const size = radius * 2 + strokeWidth * 2;

        return this.createCustomSprite((ctx, canvas) => {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);

            // Fill
            ctx.fillStyle = fillColor;
            ctx.fill();

            // Stroke
            if (strokeColor && strokeWidth > 0) {
                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = strokeWidth;
                ctx.stroke();
            }
        }, { width: size, height: size, scale });
    }

    /**
     * Create a rectangle sprite
     *
     * @param {Object} options - Rectangle options
     * @param {number} [options.width=64] - Rectangle width
     * @param {number} [options.height=64] - Rectangle height
     * @param {string} [options.fillColor='#0000FF'] - Fill color
     * @param {string} [options.strokeColor] - Stroke color
     * @param {number} [options.strokeWidth=0] - Stroke width
     * @param {number} [options.cornerRadius=0] - Corner radius for rounded rectangles
     * @param {number} [options.scale=1] - Sprite scale
     * @returns {Object} Sprite object
     */
    createRectangleSprite(options = {}) {
        const {
            width = 64,
            height = 64,
            fillColor = '#0000FF',
            strokeColor,
            strokeWidth = 0,
            cornerRadius = 0,
            scale = 1
        } = options;

        return this.createCustomSprite((ctx, canvas) => {
            const x = 0;
            const y = 0;
            const w = canvas.width;
            const h = canvas.height;

            if (cornerRadius > 0) {
                // Rounded rectangle
                ctx.beginPath();
                ctx.moveTo(x + cornerRadius, y);
                ctx.lineTo(x + w - cornerRadius, y);
                ctx.arcTo(x + w, y, x + w, y + cornerRadius, cornerRadius);
                ctx.lineTo(x + w, y + h - cornerRadius);
                ctx.arcTo(x + w, y + h, x + w - cornerRadius, y + h, cornerRadius);
                ctx.lineTo(x + cornerRadius, y + h);
                ctx.arcTo(x, y + h, x, y + h - cornerRadius, cornerRadius);
                ctx.lineTo(x, y + cornerRadius);
                ctx.arcTo(x, y, x + cornerRadius, y, cornerRadius);
                ctx.closePath();
            } else {
                // Regular rectangle
                ctx.rect(x, y, w, h);
            }

            // Fill
            ctx.fillStyle = fillColor;
            ctx.fill();

            // Stroke
            if (strokeColor && strokeWidth > 0) {
                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = strokeWidth;
                ctx.stroke();
            }
        }, { width, height, scale });
    }

    /**
     * Clear canvas cache
     */
    clearCache() {
        this.canvasCache.clear();
    }
}

export default CanvasSpriteRenderer;
