import Phaser from 'phaser';

/**
 * AutoShootingSystem - Continuous automatic shooting
 *
 * VISUAL REFERENCE: Frames 6-11
 * - Bullets fire continuously upward from squad position
 * - Multiple bullets on screen (10-15 visible)
 * - Slight spread pattern (not perfectly straight)
 * - Fire rate increases with squad size
 *
 * MECHANICS:
 * - Auto-fire (no player input needed)
 * - Fire rate scales with squad size
 * - Bullets fired from squad center
 * - Small spread for visual variety
 */
export default class AutoShootingSystem {
    constructor(scene, bulletPool, squadManager) {
        this.scene = scene;
        this.bulletPool = bulletPool;
        this.squadManager = squadManager;

        // Shooting configuration
        this.config = {
            baseFireRate: 200,          // Fire every 200ms (5 bullets/sec)
            baseDamage: 1,              // Base damage per bullet
            spreadAngle: 15,            // Max spread in degrees
            bulletSpeed: 400,           // Pixels per second

            // Squad scaling
            fireRatePerMember: 5,       // Faster fire with more squad
            maxFireRateBonus: 100,      // Cap fire rate bonus (100ms faster max)

            // Visual variance
            minSpread: -15,             // Degrees
            maxSpread: 15               // Degrees
        };

        // Shooting state
        this.nextFireTime = 0;
        this.fireRateModifier = 1.0;    // Can be adjusted by abilities/powerups
        this.damageModifier = 1.0;      // Can be adjusted by abilities/powerups

        console.log('✓ AutoShootingSystem initialized');
    }

    /**
     * Update shooting system
     */
    update(time, delta) {
        // Check if ready to fire
        if (time >= this.nextFireTime) {
            this.fireBullet(time);
        }
    }

    /**
     * Fire a bullet from squad position
     */
    fireBullet(time) {
        // Get squad center position
        const squadX = this.squadManager.squadCenterX;
        const squadY = this.squadManager.squadCenterY;

        // Calculate current fire rate (faster with larger squad)
        const squadSize = this.squadManager.squadMembers.length;
        const fireRateBonus = Math.min(
            squadSize * this.config.fireRatePerMember,
            this.config.maxFireRateBonus
        );
        const currentFireRate = Math.max(
            50, // Min fire rate (20 bullets/sec max)
            (this.config.baseFireRate - fireRateBonus) * this.fireRateModifier
        );

        // Calculate damage
        const damage = this.config.baseDamage * this.damageModifier;

        // Add slight spread for visual variety
        const spreadAngle = Phaser.Math.Between(
            this.config.minSpread,
            this.config.maxSpread
        );
        const spreadRadians = Phaser.Math.DegToRad(spreadAngle);
        const velocityX = Math.sin(spreadRadians) * this.config.bulletSpeed;

        // Fire bullet from squad position
        const bullet = this.bulletPool.fire(squadX, squadY, damage, velocityX);

        // Schedule next fire
        this.nextFireTime = time + currentFireRate;

        // Audio feedback (if enabled)
        if (bullet && this.scene.playShootingSound) {
            this.scene.playShootingSound();
        }

        return bullet;
    }

    /**
     * Fire multiple bullets at once (for special abilities)
     */
    fireSpread(count, spreadAngle = 30) {
        const squadX = this.squadManager.squadCenterX;
        const squadY = this.squadManager.squadCenterY;
        const damage = this.config.baseDamage * this.damageModifier;

        // Fire bullets in a spread pattern
        const angleStep = spreadAngle / (count - 1);
        const startAngle = -spreadAngle / 2;

        for (let i = 0; i < count; i++) {
            const angle = startAngle + (i * angleStep);
            const radians = Phaser.Math.DegToRad(angle);
            const velocityX = Math.sin(radians) * this.config.bulletSpeed;

            this.bulletPool.fire(squadX, squadY, damage, velocityX);
        }

        console.log(`🔫 Fired spread: ${count} bullets`);
    }

    /**
     * Fire bullets in a circle (for special abilities)
     */
    fireCircle(count) {
        const squadX = this.squadManager.squadCenterX;
        const squadY = this.squadManager.squadCenterY;
        const damage = this.config.baseDamage * this.damageModifier;

        const angleStep = 360 / count;

        for (let i = 0; i < count; i++) {
            const angle = i * angleStep;
            const radians = Phaser.Math.DegToRad(angle);

            // Calculate velocity for full circle
            const velocityX = Math.cos(radians) * this.config.bulletSpeed;
            const velocityY = Math.sin(radians) * this.config.bulletSpeed;

            const bullet = this.bulletPool.fire(squadX, squadY, damage, velocityX);
            if (bullet) {
                bullet.velocityY = velocityY; // Override default upward
            }
        }

        console.log(`🎯 Fired circle: ${count} bullets`);
    }

    /**
     * Temporarily boost fire rate
     */
    boostFireRate(multiplier, duration) {
        const originalModifier = this.fireRateModifier;
        this.fireRateModifier = multiplier;

        // Restore after duration
        this.scene.time.delayedCall(duration, () => {
            this.fireRateModifier = originalModifier;
        });

        console.log(`⚡ Fire rate boosted: ${multiplier}x for ${duration}ms`);
    }

    /**
     * Temporarily boost damage
     */
    boostDamage(multiplier, duration) {
        const originalModifier = this.damageModifier;
        this.damageModifier = multiplier;

        // Restore after duration
        this.scene.time.delayedCall(duration, () => {
            this.damageModifier = originalModifier;
        });

        console.log(`💪 Damage boosted: ${multiplier}x for ${duration}ms`);
    }

    /**
     * Get current fire rate (for UI display)
     */
    getCurrentFireRate() {
        const squadSize = this.squadManager.squadMembers.length;
        const fireRateBonus = Math.min(
            squadSize * this.config.fireRatePerMember,
            this.config.maxFireRateBonus
        );
        return Math.max(
            50,
            (this.config.baseFireRate - fireRateBonus) * this.fireRateModifier
        );
    }

    /**
     * Get bullets per second (for UI)
     */
    getBulletsPerSecond() {
        const fireRate = this.getCurrentFireRate();
        return Math.round(1000 / fireRate);
    }

    /**
     * Reset shooting state (for new stage)
     */
    reset() {
        this.nextFireTime = 0;
        this.fireRateModifier = 1.0;
        this.damageModifier = 1.0;
    }

    /**
     * Cleanup
     */
    destroy() {
        // Nothing to cleanup (references only)
    }
}
