import Phaser from 'phaser';

/**
 * EnergySystem - Manages energy resource for abilities
 *
 * VISUAL REFERENCE: Frames 6-14 (bottom UI)
 * - Energy is the resource pool for abilities
 * - Regenerates over time (+10 per second)
 * - Max capacity: 100
 * - Consumed when activating abilities
 *
 * MECHANICS:
 * - Starts at 100 (full)
 * - Regenerates continuously during gameplay
 * - Abilities consume energy when activated
 * - Cannot activate ability if insufficient energy
 */
export default class EnergySystem {
    constructor(scene, maxEnergy = 100, regenRate = 10) {
        this.scene = scene;
        this.maxEnergy = maxEnergy;
        this.currentEnergy = maxEnergy; // Start full
        this.regenRate = regenRate; // Energy per second

        // Regen state
        this.lastRegenTime = 0;
        this.regenInterval = 100; // Update every 100ms (smooth regen)

        // Callbacks for UI updates
        this.onEnergyChange = null;

        console.log(`⚡ EnergySystem initialized (${maxEnergy} max, +${regenRate}/sec)`);
    }

    /**
     * Update energy regeneration
     */
    update(time, delta) {
        // Regenerate energy over time
        if (time >= this.lastRegenTime + this.regenInterval) {
            const regenAmount = (this.regenRate * this.regenInterval) / 1000;
            this.addEnergy(regenAmount);
            this.lastRegenTime = time;
        }
    }

    /**
     * Add energy (regeneration or pickups)
     */
    addEnergy(amount) {
        const oldEnergy = this.currentEnergy;
        this.currentEnergy = Math.min(this.currentEnergy + amount, this.maxEnergy);

        // Trigger callback if energy changed
        if (this.currentEnergy !== oldEnergy && this.onEnergyChange) {
            this.onEnergyChange(this.currentEnergy, this.maxEnergy);
        }
    }

    /**
     * Consume energy (ability activation)
     */
    consumeEnergy(amount) {
        if (!this.hasEnergy(amount)) {
            console.warn(`⚠️ Insufficient energy: ${this.currentEnergy}/${amount}`);
            return false;
        }

        const oldEnergy = this.currentEnergy;
        this.currentEnergy -= amount;

        // Trigger callback
        if (this.onEnergyChange) {
            this.onEnergyChange(this.currentEnergy, this.maxEnergy);
        }

        console.log(`⚡ Energy consumed: -${amount} (${this.currentEnergy}/${this.maxEnergy})`);
        return true;
    }

    /**
     * Check if has enough energy
     */
    hasEnergy(amount) {
        return this.currentEnergy >= amount;
    }

    /**
     * Get current energy
     */
    getEnergy() {
        return this.currentEnergy;
    }

    /**
     * Get energy percentage (0-1)
     */
    getEnergyPercent() {
        return this.currentEnergy / this.maxEnergy;
    }

    /**
     * Set energy to specific value
     */
    setEnergy(amount) {
        this.currentEnergy = Math.max(0, Math.min(amount, this.maxEnergy));

        if (this.onEnergyChange) {
            this.onEnergyChange(this.currentEnergy, this.maxEnergy);
        }
    }

    /**
     * Fill energy to max
     */
    fillEnergy() {
        this.setEnergy(this.maxEnergy);
    }

    /**
     * Reset for new stage
     */
    reset() {
        this.currentEnergy = this.maxEnergy;
        this.lastRegenTime = 0;

        if (this.onEnergyChange) {
            this.onEnergyChange(this.currentEnergy, this.maxEnergy);
        }
    }

    /**
     * Boost regen rate temporarily
     */
    boostRegen(multiplier, duration) {
        const originalRate = this.regenRate;
        this.regenRate *= multiplier;

        this.scene.time.delayedCall(duration, () => {
            this.regenRate = originalRate;
        });

        console.log(`⚡ Energy regen boosted: ${multiplier}x for ${duration}ms`);
    }
}
