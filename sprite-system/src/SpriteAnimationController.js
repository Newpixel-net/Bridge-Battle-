/**
 * SpriteAnimationController - Generic sprite sheet animation controller
 *
 * Manages UV-based animation for sprite sheets. Works with any sprite sheet
 * layout and supports multiple animations with configurable frame rates.
 *
 * @example
 * const controller = new SpriteAnimationController(texture, {
 *   frameWidth: 64,
 *   frameHeight: 64,
 *   columns: 8,
 *   rows: 8,
 *   totalFrames: 24,
 *   frameRate: 30
 * });
 *
 * controller.addAnimation('walk', 0, 7);
 * controller.addAnimation('idle', 8, 11);
 * controller.play('walk');
 *
 * // In your game loop
 * controller.update(deltaTime);
 */
export class SpriteAnimationController {
    /**
     * Create a sprite animation controller
     *
     * @param {Object} spriteSheetTexture - The texture object (THREE.Texture or similar)
     * @param {Object} options - Configuration options
     * @param {number} options.frameWidth - Width of a single frame in pixels
     * @param {number} options.frameHeight - Height of a single frame in pixels
     * @param {number} options.columns - Number of columns in the sprite sheet
     * @param {number} options.rows - Number of rows in the sprite sheet
     * @param {number} options.totalFrames - Total number of frames in the sprite sheet
     * @param {number} [options.frameRate=30] - Animation frame rate (frames per second)
     */
    constructor(spriteSheetTexture, options) {
        // Support legacy constructor signature for backward compatibility
        if (typeof options === 'number') {
            console.warn('SpriteAnimationController: Using legacy constructor signature. Consider updating to options object.');
            const [frameWidth, frameHeight, columns, rows, totalFrames] = Array.from(arguments).slice(1);
            options = { frameWidth, frameHeight, columns, rows, totalFrames };
        }

        const {
            frameWidth,
            frameHeight,
            columns,
            rows,
            totalFrames,
            frameRate = 30
        } = options;

        this.texture = spriteSheetTexture;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.columns = columns;
        this.rows = rows;
        this.totalFrames = totalFrames;
        this.frameRate = frameRate;

        // Animation state
        this.currentFrame = 0;
        this.currentAnimation = null;
        this.animations = {};
        this.frameTime = 1 / this.frameRate;
        this.elapsedTime = 0;
        this.loop = true;
        this.isPlaying = false;

        // Callbacks
        this.onAnimationComplete = null;
        this.onFrameChange = null;

        // Calculate UV coordinates for each frame
        this.frameUVs = [];
        this.calculateFrameUVs();
    }

    /**
     * Calculate UV coordinates for all frames in the sprite sheet
     * @private
     */
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
     *
     * @param {string} name - Unique name for the animation
     * @param {number} startFrame - Starting frame index (0-based)
     * @param {number} endFrame - Ending frame index (inclusive)
     * @param {Object} [options] - Animation options
     * @param {number} [options.frameRate] - Override frame rate for this animation
     * @returns {SpriteAnimationController} - Returns this for chaining
     */
    addAnimation(name, startFrame, endFrame, options = {}) {
        this.animations[name] = {
            name,
            startFrame,
            endFrame,
            frameCount: endFrame - startFrame + 1,
            frameRate: options.frameRate || this.frameRate
        };
        return this;
    }

    /**
     * Play an animation by name
     *
     * @param {string} animationName - Name of the animation to play
     * @param {boolean} [loop=true] - Whether to loop the animation
     * @returns {boolean} - Returns true if animation started successfully
     */
    play(animationName, loop = true) {
        const anim = this.animations[animationName];
        if (!anim) {
            console.warn(`Animation "${animationName}" not found`);
            return false;
        }

        // Don't restart if already playing the same animation
        if (this.currentAnimation === animationName && this.isPlaying) {
            return true;
        }

        this.currentAnimation = animationName;
        this.currentFrame = anim.startFrame;
        this.loop = loop;
        this.elapsedTime = 0;
        this.isPlaying = true;
        this.frameTime = 1 / anim.frameRate;
        this.updateTextureOffset();
        return true;
    }

    /**
     * Stop the current animation
     */
    stop() {
        this.isPlaying = false;
    }

    /**
     * Pause the current animation
     */
    pause() {
        this.isPlaying = false;
    }

    /**
     * Resume the current animation
     */
    resume() {
        this.isPlaying = true;
    }

    /**
     * Reset animation to the first frame
     */
    reset() {
        if (this.currentAnimation) {
            const anim = this.animations[this.currentAnimation];
            this.currentFrame = anim.startFrame;
            this.elapsedTime = 0;
            this.updateTextureOffset();
        }
    }

    /**
     * Set a specific frame
     *
     * @param {number} frameIndex - Frame index to set
     */
    setFrame(frameIndex) {
        if (frameIndex >= 0 && frameIndex < this.totalFrames) {
            this.currentFrame = frameIndex;
            this.updateTextureOffset();
        }
    }

    /**
     * Update animation (call every frame in your game loop)
     *
     * @param {number} deltaTime - Time elapsed since last update (in seconds)
     */
    update(deltaTime) {
        if (!this.currentAnimation || !this.isPlaying) return;

        this.elapsedTime += deltaTime;

        if (this.elapsedTime >= this.frameTime) {
            this.elapsedTime = 0;

            const anim = this.animations[this.currentAnimation];
            const prevFrame = this.currentFrame;
            this.currentFrame++;

            // Loop or stop at end
            if (this.currentFrame > anim.endFrame) {
                if (this.loop) {
                    this.currentFrame = anim.startFrame;
                } else {
                    this.currentFrame = anim.endFrame;
                    this.isPlaying = false;

                    // Trigger completion callback
                    if (this.onAnimationComplete) {
                        this.onAnimationComplete(anim.name);
                    }
                }
            }

            this.updateTextureOffset();

            // Trigger frame change callback
            if (this.onFrameChange && prevFrame !== this.currentFrame) {
                this.onFrameChange(this.currentFrame, anim.name);
            }
        }
    }

    /**
     * Update the texture offset to display the current frame
     * @private
     */
    updateTextureOffset() {
        if (this.currentFrame >= this.frameUVs.length) return;

        const uv = this.frameUVs[this.currentFrame];
        this.texture.offset.set(uv.offsetX, uv.offsetY);
        this.texture.repeat.set(uv.repeatX, uv.repeatY);
    }

    /**
     * Get information about the current animation state
     *
     * @returns {Object} Current animation state
     */
    getState() {
        return {
            currentAnimation: this.currentAnimation,
            currentFrame: this.currentFrame,
            isPlaying: this.isPlaying,
            loop: this.loop,
            progress: this.currentAnimation
                ? (this.currentFrame - this.animations[this.currentAnimation].startFrame) /
                  this.animations[this.currentAnimation].frameCount
                : 0
        };
    }

    /**
     * Get list of all registered animations
     *
     * @returns {string[]} Array of animation names
     */
    getAnimationNames() {
        return Object.keys(this.animations);
    }

    /**
     * Check if an animation exists
     *
     * @param {string} name - Animation name to check
     * @returns {boolean} True if animation exists
     */
    hasAnimation(name) {
        return this.animations.hasOwnProperty(name);
    }
}

export default SpriteAnimationController;
