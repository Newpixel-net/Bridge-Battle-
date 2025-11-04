import { SHOOTING, BULLET_COLORS, ASSETS, VFX } from '../utils/GameConstants.js';

/**
 * BulletManager - Handles bullet pooling, firing, and auto-shooting
 * Implements object pooling for performance
 */
export default class BulletManager {
    constructor(scene) {
        this.scene = scene;
        this.bulletPool = [];
        this.activeBullets = [];
        this.fireTimers = new Map(); // Per-character cooldown

        this.initPool();
    }

    /**
     * Initialize bullet pool (pre-allocate for performance)
     */
    initPool() {
        for (let i = 0; i < SHOOTING.BULLET_POOL_SIZE; i++) {
            const bullet = this.createBullet();
            bullet.setActive(false);
            bullet.setVisible(false);
            this.bulletPool.push(bullet);
        }

        console.log(`✓ Bullet pool initialized: ${SHOOTING.BULLET_POOL_SIZE} bullets`);
    }

    /**
     * Create a single bullet sprite
     */
    createBullet() {
        const bullet = this.scene.physics.add.sprite(0, 0, ASSETS.BULLET);

        bullet.setScale(1.5);
        bullet.setDepth(5);
        bullet.body.setSize(SHOOTING.BULLET_SIZE, SHOOTING.BULLET_SIZE);

        // Custom properties
        bullet.spawnTime = 0;
        bullet.trail = [];

        return bullet;
    }

    /**
     * Get bullet from pool (or create new if pool exhausted)
     */
    getBullet() {
        let bullet = this.bulletPool.find(b => !b.active);

        if (!bullet) {
            console.warn('Bullet pool exhausted, creating new bullet');
            bullet = this.createBullet();
            this.bulletPool.push(bullet);
        }

        return bullet;
    }

    /**
     * Fire a bullet from position towards target
     */
    fireBullet(fromX, fromY, targetX, targetY, squadSize) {
        const bullet = this.getBullet();

        bullet.setPosition(fromX, fromY);
        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.spawnTime = this.scene.time.now;
        bullet.trail = [];

        // Calculate direction
        const dx = targetX - fromX;
        const dy = targetY - fromY;
        const angle = Math.atan2(dy, dx);

        // Set velocity
        bullet.setVelocity(
            Math.cos(angle) * SHOOTING.BULLET_SPEED,
            Math.sin(angle) * SHOOTING.BULLET_SPEED
        );

        // Set color based on squad size
        const tint = this.getBulletColor(squadSize);
        bullet.setTint(tint);

        this.activeBullets.push(bullet);

        return bullet;
    }

    /**
     * Get bullet color based on squad size
     */
    getBulletColor(squadSize) {
        for (const tier of Object.values(BULLET_COLORS)) {
            if (squadSize >= tier.min && squadSize <= tier.max) {
                return tier.color;
            }
        }
        return BULLET_COLORS.TIER_1.color;
    }

    /**
     * Auto-shoot system - fires at closest obstacles
     */
    autoShoot(squadMembers, obstacles, time) {
        squadMembers.forEach((member, index) => {
            // Check fire timer for this character
            const lastFire = this.fireTimers.get(index) || 0;
            if (time - lastFire < SHOOTING.FIRE_RATE) return;

            // Find closest target in range
            const target = this.findClosestTarget(member, obstacles);

            if (target) {
                this.fireBullet(
                    member.x,
                    member.y,
                    target.x,
                    target.y,
                    squadMembers.length
                );

                // Update fire timer
                this.fireTimers.set(index, time);
            }
        });
    }

    /**
     * Find closest obstacle in front of character
     */
    findClosestTarget(character, obstacles) {
        let closest = null;
        let minDist = Infinity;

        obstacles.forEach(obstacle => {
            if (!obstacle.active) return;

            // Only target obstacles ahead
            if (obstacle.y < character.y) return;

            // Check if in range
            const dist = Phaser.Math.Distance.Between(
                character.x, character.y,
                obstacle.x, obstacle.y
            );

            if (dist <= SHOOTING.TARGET_RANGE && dist < minDist) {
                minDist = dist;
                closest = obstacle;
            }
        });

        return closest;
    }

    /**
     * Update all active bullets
     */
    update(time, delta) {
        const now = time;

        // Update each active bullet
        for (let i = this.activeBullets.length - 1; i >= 0; i--) {
            const bullet = this.activeBullets[i];

            // Check lifetime
            if (now - bullet.spawnTime > SHOOTING.BULLET_LIFETIME) {
                this.returnToPool(bullet);
                this.activeBullets.splice(i, 1);
                continue;
            }

            // Update trail
            if (SHOOTING.TRAIL_LENGTH > 0) {
                bullet.trail.unshift({ x: bullet.x, y: bullet.y });
                if (bullet.trail.length > SHOOTING.TRAIL_LENGTH) {
                    bullet.trail.pop();
                }
            }

            // Check if off-screen (cleanup)
            if (bullet.y > this.scene.cameras.main.scrollY + 1200 ||
                bullet.y < this.scene.cameras.main.scrollY - 200) {
                this.returnToPool(bullet);
                this.activeBullets.splice(i, 1);
            }
        }
    }

    /**
     * Return bullet to pool
     */
    returnToPool(bullet) {
        bullet.setActive(false);
        bullet.setVisible(false);
        bullet.setVelocity(0, 0);
        bullet.trail = [];
    }

    /**
     * Get all active bullets (for collision detection)
     */
    getActiveBullets() {
        return this.activeBullets;
    }

    /**
     * Remove a specific bullet (on collision)
     */
    removeBullet(bullet) {
        const index = this.activeBullets.indexOf(bullet);
        if (index !== -1) {
            this.returnToPool(bullet);
            this.activeBullets.splice(index, 1);
        }
    }

    /**
     * Render bullet trails
     */
    renderTrails(graphics) {
        if (!SHOOTING.TRAIL_LENGTH) return;

        graphics.clear();

        this.activeBullets.forEach(bullet => {
            if (bullet.trail.length < 2) return;

            graphics.lineStyle(4, bullet.tintTopLeft, 0.3);

            for (let i = 0; i < bullet.trail.length - 1; i++) {
                const alpha = (bullet.trail.length - i) / bullet.trail.length;
                graphics.lineStyle(4 * alpha, bullet.tintTopLeft, alpha * 0.6);

                graphics.lineBetween(
                    bullet.trail[i].x,
                    bullet.trail[i].y,
                    bullet.trail[i + 1].x,
                    bullet.trail[i + 1].y
                );
            }
        });
    }

    /**
     * Cleanup
     */
    destroy() {
        this.bulletPool.forEach(bullet => bullet.destroy());
        this.bulletPool = [];
        this.activeBullets = [];
        this.fireTimers.clear();
    }
}
