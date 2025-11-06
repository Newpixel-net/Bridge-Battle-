import Phaser from 'phaser';
import { GAME } from '../utils/GameConstants.js';

/**
 * BulletPool - Efficient bullet management using object pooling
 *
 * VISUAL REFERENCE: Frames 6-11
 * - Small white/cyan projectiles
 * - 10-15 bullets visible on screen simultaneously
 * - Fast upward movement
 * - Glow/trail effect
 *
 * PERFORMANCE:
 * - Object pooling prevents GC overhead
 * - Reuses bullets instead of create/destroy
 * - Target: 50+ bullets with no FPS drop
 */
export default class BulletPool {
    constructor(scene, maxSize = 50) {
        this.scene = scene;
        this.maxSize = maxSize;
        this.bullets = [];
        this.activeBullets = [];

        // Bullet configuration (from visual reference)
        this.config = {
            size: 4,                    // Small projectiles (4px)
            speed: 400,                 // Fast upward movement
            damage: 1,                  // Base damage per bullet
            color: 0xFFFFFF,            // White/cyan color
            glowColor: 0x00FFFF,        // Cyan glow
            trailLength: 3,             // Trail effect length
            lifetime: 3000              // Max lifetime (3 seconds)
        };

        // Create bullet pool
        this.initializePool();

        console.log(`✓ BulletPool created (max: ${maxSize} bullets)`);
    }

    /**
     * Create pool of reusable bullets
     */
    initializePool() {
        for (let i = 0; i < this.maxSize; i++) {
            const bullet = this.createBulletObject();
            this.bullets.push(bullet);
        }
    }

    /**
     * Create a single bullet object (container with glow)
     */
    createBulletObject() {
        const bullet = this.scene.add.container(0, 0);

        // Core projectile (white circle)
        const core = this.scene.add.circle(
            0, 0,
            this.config.size,
            this.config.color,
            1.0
        );

        // Glow effect (larger, semi-transparent)
        const glow = this.scene.add.circle(
            0, 0,
            this.config.size * 2,
            this.config.glowColor,
            0.4
        );
        glow.setBlendMode(Phaser.BlendModes.ADD);

        // Outer glow (even larger, very subtle)
        const outerGlow = this.scene.add.circle(
            0, 0,
            this.config.size * 3,
            this.config.glowColor,
            0.2
        );
        outerGlow.setBlendMode(Phaser.BlendModes.ADD);

        // Add to container (back to front)
        bullet.add([outerGlow, glow, core]);
        bullet.setDepth(15); // Above squad (10) but below UI (100)

        // Store references
        bullet.core = core;
        bullet.glow = glow;
        bullet.outerGlow = outerGlow;

        // Bullet state
        bullet.active = false;
        bullet.damage = this.config.damage;
        bullet.velocityY = -this.config.speed;
        bullet.spawnTime = 0;

        // Hide initially
        bullet.setVisible(false);

        return bullet;
    }

    /**
     * Fire a bullet from position
     */
    fire(x, y, damage = null, velocityX = 0) {
        // Get inactive bullet from pool
        const bullet = this.getBullet();
        if (!bullet) return null; // Pool exhausted

        // Position bullet
        bullet.x = x;
        bullet.y = y;

        // Set damage
        bullet.damage = damage !== null ? damage : this.config.damage;

        // Set velocity
        bullet.velocityY = -this.config.speed;
        bullet.velocityX = velocityX; // Allow spread

        // Activate
        bullet.active = true;
        bullet.spawnTime = this.scene.time.now;
        bullet.setVisible(true);

        // Add to active list
        this.activeBullets.push(bullet);

        return bullet;
    }

    /**
     * Get an inactive bullet from pool
     */
    getBullet() {
        // Find first inactive bullet
        for (let bullet of this.bullets) {
            if (!bullet.active) {
                return bullet;
            }
        }

        // Pool exhausted
        return null;
    }

    /**
     * Return bullet to pool (deactivate)
     */
    recycleBullet(bullet) {
        bullet.active = false;
        bullet.setVisible(false);

        // Remove from active list
        const index = this.activeBullets.indexOf(bullet);
        if (index !== -1) {
            this.activeBullets.splice(index, 1);
        }
    }

    /**
     * Update all active bullets
     */
    update(time, delta) {
        const dt = delta / 1000;

        // Update each active bullet
        for (let i = this.activeBullets.length - 1; i >= 0; i--) {
            const bullet = this.activeBullets[i];

            if (!bullet.active) continue;

            // Move bullet
            bullet.y += bullet.velocityY * dt;
            bullet.x += bullet.velocityX * dt;

            // Pulsing glow effect
            const pulseScale = 1 + Math.sin(time * 0.01) * 0.2;
            bullet.glow.setScale(pulseScale);

            // Check lifetime
            if (time - bullet.spawnTime > this.config.lifetime) {
                this.recycleBullet(bullet);
                continue;
            }

            // Check if off-screen (top)
            if (bullet.y < -50) {
                this.recycleBullet(bullet);
                continue;
            }

            // Check if off-screen (sides)
            if (bullet.x < -50 || bullet.x > GAME.WIDTH + 50) {
                this.recycleBullet(bullet);
                continue;
            }
        }
    }

    /**
     * Get all active bullets (for collision detection)
     */
    getActiveBullets() {
        return this.activeBullets;
    }

    /**
     * Get bullet count for debugging
     */
    getStats() {
        return {
            total: this.bullets.length,
            active: this.activeBullets.length,
            available: this.bullets.length - this.activeBullets.length
        };
    }

    /**
     * Clear all bullets (for scene transitions)
     */
    clear() {
        // Recycle all active bullets
        for (let bullet of this.activeBullets) {
            bullet.active = false;
            bullet.setVisible(false);
        }

        this.activeBullets = [];
    }

    /**
     * Destroy pool (cleanup)
     */
    destroy() {
        // Destroy all bullet objects
        for (let bullet of this.bullets) {
            bullet.destroy();
        }

        this.bullets = [];
        this.activeBullets = [];
    }
}
