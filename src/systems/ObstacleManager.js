import { OBSTACLES, ASSETS, COLORS, VFX } from '../utils/GameConstants.js';

/**
 * ObstacleManager - Manages obstacles with HP, damage numbers, and destruction
 */
export default class ObstacleManager {
    constructor(scene) {
        this.scene = scene;
        this.obstacles = [];
        this.damageNumbers = [];
    }

    /**
     * Create a tire stack obstacle
     */
    createObstacle(x, z) {
        const hp = Phaser.Math.Between(OBSTACLES.HP_MIN, OBSTACLES.HP_MAX);

        // Create sprite
        const sprite = this.scene.physics.add.sprite(x, z, ASSETS.OBSTACLE_TIRE);
        sprite.setScale(OBSTACLES.SCALE);
        sprite.setDepth(4);

        // HP text
        const hpText = this.scene.add.text(x, z - 80, hp.toString(), {
            fontSize: '64px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            fontStyle: 'bold',
            backgroundColor: '#FF0000',
            padding: { x: 15, y: 10 }
        });
        hpText.setOrigin(0.5);
        hpText.setDepth(5);

        const obstacle = {
            sprite: sprite,
            hpText: hpText,
            hp: hp,
            maxHp: hp,
            x: x,
            z: z,
            active: true,
            destroyed: false,
            hasWeapon: Math.random() < OBSTACLES.WEAPON_DROP_CHANCE
        };

        this.obstacles.push(obstacle);
        return obstacle;
    }

    /**
     * Create a cluster of obstacles
     */
    createCluster(z) {
        const count = Phaser.Math.Between(
            OBSTACLES.CLUSTER_SIZE_MIN,
            OBSTACLES.CLUSTER_SIZE_MAX
        );

        const obstacles = [];

        for (let i = 0; i < count; i++) {
            // Random X position within bridge bounds
            const x = Phaser.Math.Between(-250, 250);
            const offsetZ = Phaser.Math.Between(-40, 40);

            obstacles.push(this.createObstacle(x, z + offsetZ));
        }

        return obstacles;
    }

    /**
     * Handle bullet hitting obstacle
     */
    handleBulletHit(bullet, onDestroy) {
        let hit = false;

        this.obstacles.forEach(obstacle => {
            if (!obstacle.active || obstacle.destroyed) return;

            const dist = Phaser.Math.Distance.Between(
                bullet.x, bullet.y,
                obstacle.sprite.x, obstacle.sprite.y
            );

            if (dist < 64) { // Hit radius
                // Deal damage
                obstacle.hp -= SHOOTING.BULLET_DAMAGE;

                // Spawn damage number
                this.spawnDamageNumber(
                    SHOOTING.BULLET_DAMAGE,
                    obstacle.sprite.x,
                    obstacle.sprite.y - 60
                );

                // Update HP text
                obstacle.hpText.setText(Math.max(0, obstacle.hp).toString());

                // Pulse effect
                this.scene.tweens.add({
                    targets: obstacle.hpText,
                    scale: 1.3,
                    duration: 100,
                    yoyo: true,
                    ease: 'Power2'
                });

                // Hit flash
                obstacle.sprite.setTint(0xFFFFFF);
                this.scene.time.delayedCall(50, () => {
                    obstacle.sprite.clearTint();
                });

                // Check if destroyed
                if (obstacle.hp <= 0 && !obstacle.destroyed) {
                    this.destroyObstacle(obstacle, onDestroy);
                }

                hit = true;
            }
        });

        return hit;
    }

    /**
     * Destroy obstacle with explosion effect
     */
    destroyObstacle(obstacle, callback) {
        obstacle.destroyed = true;

        // Screen shake
        this.scene.cameras.main.shake(300, 0.008);

        // Explosion particles
        this.spawnExplosion(obstacle.sprite.x, obstacle.sprite.y);

        // Fade out and destroy
        this.scene.tweens.add({
            targets: [obstacle.sprite, obstacle.hpText],
            alpha: 0,
            scale: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                obstacle.sprite.destroy();
                obstacle.hpText.destroy();
                obstacle.active = false;

                // Spawn weapon if applicable
                if (obstacle.hasWeapon) {
                    this.spawnWeapon(obstacle.sprite.x, obstacle.sprite.y);
                }

                if (callback) {
                    callback();
                }
            }
        });
    }

    /**
     * Spawn explosion particles
     */
    spawnExplosion(x, y) {
        const count = VFX.EXPLOSION_PARTICLE_COUNT;

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 100 + Math.random() * 200;
            const size = 6 + Math.random() * 10;

            // Random explosion colors
            const colors = [0xFF8800, 0xFF4400, 0xFF0000, 0xFFAA00];
            const color = Phaser.Math.RND.pick(colors);

            const particle = this.scene.add.circle(x, y, size, color);
            particle.setAlpha(1);
            particle.setDepth(15);

            this.scene.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * speed,
                y: y + Math.sin(angle) * speed - 50,
                alpha: 0,
                scale: 0.2,
                duration: 500 + Math.random() * 500,
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        }

        // Central flash
        const flash = this.scene.add.circle(x, y, 40, 0xFFFFFF);
        flash.setAlpha(0.8);
        flash.setDepth(16);

        this.scene.tweens.add({
            targets: flash,
            scale: 3,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => flash.destroy()
        });
    }

    /**
     * Spawn floating damage number
     */
    spawnDamageNumber(damage, x, y) {
        const text = this.scene.add.text(x, y, damage.toString(), {
            fontSize: `${VFX.DAMAGE_NUMBER_SIZE}px`,
            fontFamily: 'Arial',
            color: COLORS.DAMAGE_NUMBER,
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        });

        text.setOrigin(0.5);
        text.setDepth(20);
        text.setAlpha(1);

        const damageNum = {
            text: text,
            lifetime: VFX.DAMAGE_NUMBER_LIFETIME,
            maxLifetime: VFX.DAMAGE_NUMBER_LIFETIME
        };

        this.damageNumbers.push(damageNum);

        // Float upward and fade
        this.scene.tweens.add({
            targets: text,
            y: y - VFX.DAMAGE_NUMBER_RISE_SPEED,
            alpha: 0,
            duration: VFX.DAMAGE_NUMBER_LIFETIME,
            ease: 'Power2',
            onComplete: () => {
                text.destroy();
                const index = this.damageNumbers.indexOf(damageNum);
                if (index !== -1) {
                    this.damageNumbers.splice(index, 1);
                }
            }
        });

        return text;
    }

    /**
     * Spawn weapon pickup
     */
    spawnWeapon(x, y) {
        const weapon = this.scene.add.circle(x, y, 20, 0x00FFFF);
        weapon.setStrokeStyle(4, 0xFFFFFF);
        weapon.setDepth(10);

        // Rotate slowly
        this.scene.tweens.add({
            targets: weapon,
            angle: 360,
            duration: 2000,
            repeat: -1,
            ease: 'Linear'
        });

        // Float up and down
        this.scene.tweens.add({
            targets: weapon,
            y: y - 20,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // TODO: Add collision detection for pickup
    }

    /**
     * Update obstacles (sync HP text with sprite position)
     */
    update(cameraY) {
        this.obstacles.forEach(obstacle => {
            if (!obstacle.active || obstacle.destroyed) return;

            // Update HP text position
            obstacle.hpText.setPosition(
                obstacle.sprite.x,
                obstacle.sprite.y - 80
            );

            // Cleanup off-screen obstacles
            if (obstacle.sprite.y < cameraY - 500) {
                obstacle.sprite.destroy();
                obstacle.hpText.destroy();
                obstacle.active = false;
            }
        });

        // Remove inactive obstacles
        this.obstacles = this.obstacles.filter(o => o.active);
    }

    /**
     * Get active obstacles in range
     */
    getObstaclesInRange(y, range) {
        return this.obstacles.filter(obstacle =>
            obstacle.active &&
            !obstacle.destroyed &&
            obstacle.sprite.y >= y &&
            obstacle.sprite.y <= y + range
        );
    }

    /**
     * Get all active obstacles
     */
    getActiveObstacles() {
        return this.obstacles.filter(o => o.active && !o.destroyed);
    }

    /**
     * Cleanup
     */
    destroy() {
        this.obstacles.forEach(obstacle => {
            if (obstacle.sprite) obstacle.sprite.destroy();
            if (obstacle.hpText) obstacle.hpText.destroy();
        });
        this.obstacles = [];

        this.damageNumbers.forEach(dmgNum => {
            if (dmgNum.text) dmgNum.text.destroy();
        });
        this.damageNumbers = [];
    }
}
