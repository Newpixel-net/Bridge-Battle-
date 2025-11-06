import Phaser from 'phaser';

/**
 * DamageNumberPool - Displays floating damage numbers when enemies are hit
 *
 * VISUAL REFERENCE: From screenshots showing "-9.9", "-6.6s" above enemies
 * - White text with black outline
 * - Floats upward and fades out
 * - Appears directly above hit location
 *
 * FEATURES:
 * - Object pooling for performance
 * - Smooth float animation
 * - Fade out effect
 * - High resolution text rendering
 */
export default class DamageNumberPool {
    constructor(scene, maxSize = 50) {
        this.scene = scene;
        this.maxSize = maxSize;
        this.damageNumbers = [];
        this.activeDamageNumbers = [];

        // Animation configuration
        this.config = {
            floatSpeed: 60,         // Pixels per second upward
            floatDistance: 40,      // Total distance to float
            duration: 800,          // Total animation duration (ms)
            fadeStartDelay: 200,    // When to start fading (ms)
            fontSize: '18px',       // Font size
            fontFamily: 'Arial Bold',
            color: '#FFFFFF',       // White text
            strokeColor: '#000000', // Black outline
            strokeThickness: 4
        };

        // Create pool
        this.initializePool();

        console.log(`✓ DamageNumberPool created (max: ${maxSize})`);
    }

    /**
     * Create pool of reusable damage number text objects
     */
    initializePool() {
        for (let i = 0; i < this.maxSize; i++) {
            const damageText = this.createDamageTextObject();
            this.damageNumbers.push(damageText);
        }
    }

    /**
     * Create a single damage text object
     */
    createDamageTextObject() {
        const text = this.scene.add.text(0, 0, '', {
            fontSize: this.config.fontSize,
            fontFamily: this.config.fontFamily,
            color: this.config.color,
            stroke: this.config.strokeColor,
            strokeThickness: this.config.strokeThickness
        });

        text.setOrigin(0.5, 0.5); // Center align
        text.setDepth(100); // Above everything except UI
        text.setResolution(2); // High resolution text
        text.setVisible(false);
        text.setScrollFactor(1); // Follows camera (world space)

        // State
        text.active = false;
        text.startY = 0;
        text.startTime = 0;

        return text;
    }

    /**
     * Spawn a damage number at a position
     */
    spawn(x, y, damage) {
        // Get inactive damage number
        const damageText = this.getDamageNumber();
        if (!damageText) return null; // Pool exhausted

        // Format damage text (1 decimal place)
        const damageValue = Math.abs(damage).toFixed(1);
        damageText.setText(`-${damageValue}`);

        // Position at hit location (slightly above enemy)
        damageText.x = x;
        damageText.y = y - 20;
        damageText.startY = y - 20;
        damageText.startTime = this.scene.time.now;

        // Reset alpha
        damageText.setAlpha(1);

        // Activate
        damageText.active = true;
        damageText.setVisible(true);

        // Add to active list
        this.activeDamageNumbers.push(damageText);

        return damageText;
    }

    /**
     * Get an inactive damage number from pool
     */
    getDamageNumber() {
        for (let damageText of this.damageNumbers) {
            if (!damageText.active) {
                return damageText;
            }
        }
        return null; // Pool exhausted
    }

    /**
     * Return damage number to pool
     */
    recycleDamageNumber(damageText) {
        damageText.active = false;
        damageText.setVisible(false);

        // Remove from active list
        const index = this.activeDamageNumbers.indexOf(damageText);
        if (index !== -1) {
            this.activeDamageNumbers.splice(index, 1);
        }
    }

    /**
     * Update all active damage numbers
     */
    update(time, delta) {
        const dt = delta / 1000;

        for (let i = this.activeDamageNumbers.length - 1; i >= 0; i--) {
            const damageText = this.activeDamageNumbers[i];

            if (!damageText.active) continue;

            const elapsed = time - damageText.startTime;

            // Check if animation complete
            if (elapsed >= this.config.duration) {
                this.recycleDamageNumber(damageText);
                continue;
            }

            // Float upward
            damageText.y = damageText.startY - (this.config.floatSpeed * elapsed / 1000);

            // Fade out after delay
            if (elapsed > this.config.fadeStartDelay) {
                const fadeProgress = (elapsed - this.config.fadeStartDelay) /
                                   (this.config.duration - this.config.fadeStartDelay);
                damageText.setAlpha(1 - fadeProgress);
            }
        }
    }

    /**
     * Clear all damage numbers
     */
    clear() {
        for (let damageText of this.activeDamageNumbers) {
            damageText.active = false;
            damageText.setVisible(false);
        }
        this.activeDamageNumbers = [];
    }

    /**
     * Cleanup
     */
    destroy() {
        for (let damageText of this.damageNumbers) {
            damageText.destroy();
        }
        this.damageNumbers = [];
        this.activeDamageNumbers = [];
    }
}
