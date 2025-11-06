import Phaser from 'phaser';
import Boss from '../entities/Boss.js';
import { GAME } from '../utils/GameConstants.js';

/**
 * BossManager - Manages boss encounters
 *
 * VISUAL REFERENCE: Frames 14-15
 * - Boss appears at specific stages/milestones
 * - Only one boss active at a time
 * - Boss appears at top/center of screen
 * - Triggers victory screen when defeated
 *
 * MECHANICS:
 * - Spawns boss after wave threshold or stage milestone
 * - Manages boss lifecycle
 * - Handles boss projectiles
 * - Triggers victory/defeat conditions
 */
export default class BossManager {
    constructor(scene) {
        this.scene = scene;

        // Boss state
        this.currentBoss = null;
        this.isBossActive = false;
        this.bossDefeated = false;

        // Boss projectiles tracking
        this.bossProjectiles = [];

        // Spawn conditions
        this.bossSpawnConditions = {
            waveThreshold: 10,        // Spawn boss after wave 10
            enemiesKilled: 50,        // Or after 50 enemies killed
            distance: 5000            // Or after 5000 distance
        };

        // Boss selection
        this.availableBossTypes = ['TANK_BOSS', 'SPEED_BOSS', 'MAGE_BOSS'];
        this.currentBossType = null;

        console.log('✓ BossManager initialized');
    }

    /**
     * Update boss manager
     */
    update(time, delta) {
        // Update current boss
        if (this.currentBoss && !this.currentBoss.isDestroyed) {
            this.currentBoss.update(time, delta);
        }

        // Update boss projectiles
        this.updateBossProjectiles(time, delta);

        // Check spawn conditions
        if (!this.isBossActive && !this.bossDefeated) {
            this.checkSpawnConditions();
        }
    }

    /**
     * Update boss projectiles
     */
    updateBossProjectiles(time, delta) {
        for (let i = this.bossProjectiles.length - 1; i >= 0; i--) {
            const projectile = this.bossProjectiles[i];

            if (!projectile.active) {
                projectile.destroy();
                this.bossProjectiles.splice(i, 1);
                continue;
            }

            // Move projectile
            projectile.x += projectile.velocityX * (delta / 1000);
            projectile.y += projectile.velocityY * (delta / 1000);

            // Remove if off screen
            if (projectile.y > GAME.HEIGHT + 50 ||
                projectile.y < -50 ||
                projectile.x < -50 ||
                projectile.x > GAME.WIDTH + 50) {
                projectile.active = false;
                projectile.destroy();
                this.bossProjectiles.splice(i, 1);
            }
        }
    }

    /**
     * Check if boss should spawn
     */
    checkSpawnConditions() {
        const scene = this.scene;
        const conditions = this.bossSpawnConditions;

        // Check wave threshold
        if (scene.enemyManager && scene.enemyManager.currentWave >= conditions.waveThreshold) {
            this.spawnBoss();
            return;
        }

        // Check enemies killed
        if (scene.enemiesKilled >= conditions.enemiesKilled) {
            this.spawnBoss();
            return;
        }

        // Check distance traveled
        if (scene.distance >= conditions.distance) {
            this.spawnBoss();
            return;
        }
    }

    /**
     * Spawn boss
     */
    spawnBoss(bossType = null) {
        if (this.isBossActive || this.bossDefeated) return;

        // Stop enemy spawning when boss appears
        if (this.scene.enemyManager) {
            this.scene.enemyManager.pauseSpawning();

            // Clear existing enemies for cleaner boss fight
            this.scene.enemyManager.clearAllEnemies();
        }

        // Select boss type
        if (!bossType) {
            // Choose based on stage or random
            if (this.scene.stageNumber) {
                const stageIndex = (this.scene.stageNumber - 1) % this.availableBossTypes.length;
                bossType = this.availableBossTypes[stageIndex];
            } else {
                bossType = Phaser.Utils.Array.GetRandom(this.availableBossTypes);
            }
        }
        this.currentBossType = bossType;

        // Spawn position (top center of screen)
        const spawnX = GAME.WIDTH / 2;
        const spawnY = 120;

        // Warning announcement
        this.showBossWarning(bossType);

        // Spawn boss after warning
        this.scene.time.delayedCall(3000, () => {
            this.currentBoss = new Boss(this.scene, spawnX, spawnY, bossType);
            this.isBossActive = true;

            // Track boss projectiles in scene
            this.scene.bossProjectiles = this.bossProjectiles;

            // Set up boss defeat callback
            this.scene.onBossDefeated = (scoreValue) => {
                this.handleBossDefeated(scoreValue);
            };

            // Boss music (if audio system exists)
            if (this.scene.playBossMusic) {
                this.scene.playBossMusic();
            }

            console.log(`👑 Boss battle started: ${bossType}`);
        });
    }

    /**
     * Show boss warning
     */
    showBossWarning(bossType) {
        // Get boss name
        const tempBoss = new Boss(this.scene, 0, -1000, bossType);
        const bossName = tempBoss.stats.name;
        tempBoss.container.destroy();

        // Warning text background
        const warningBg = this.scene.add.rectangle(
            GAME.WIDTH / 2, GAME.HEIGHT / 2,
            GAME.WIDTH, 150,
            0x000000, 0.85
        );

        // Warning text
        const warningText = this.scene.add.text(
            GAME.WIDTH / 2, GAME.HEIGHT / 2 - 20,
            'BOSS APPROACHING',
            {
                fontSize: '48px',
                fontFamily: 'Arial Black',
                color: '#FF0000',
                stroke: '#FFFF00',
                strokeThickness: 6
            }
        );
        warningText.setOrigin(0.5);

        // Boss name
        const nameText = this.scene.add.text(
            GAME.WIDTH / 2, GAME.HEIGHT / 2 + 30,
            bossName.toUpperCase(),
            {
                fontSize: '32px',
                fontFamily: 'Arial Black',
                color: '#FFFFFF',
                stroke: '#000000',
                strokeThickness: 4
            }
        );
        nameText.setOrigin(0.5);

        // Pulse animation
        this.scene.tweens.add({
            targets: [warningText, nameText],
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 500,
            yoyo: true,
            repeat: 2,
            ease: 'Sine.easeInOut'
        });

        // Camera flash
        this.scene.cameras.main.flash(500, 255, 0, 0);

        // Remove after 3 seconds
        this.scene.time.delayedCall(2800, () => {
            this.scene.tweens.add({
                targets: [warningBg, warningText, nameText],
                alpha: 0,
                duration: 200,
                onComplete: () => {
                    warningBg.destroy();
                    warningText.destroy();
                    nameText.destroy();
                }
            });
        });
    }

    /**
     * Handle boss defeated
     */
    handleBossDefeated(scoreValue) {
        console.log(`🎉 Boss defeated! Score: ${scoreValue}`);

        this.isBossActive = false;
        this.bossDefeated = true;

        // Add score
        if (this.scene.score !== undefined) {
            this.scene.score += scoreValue;
            if (this.scene.updateScoreDisplay) {
                this.scene.updateScoreDisplay();
            }
        }

        // Show victory message
        this.showVictoryMessage();

        // Trigger victory screen after delay
        this.scene.time.delayedCall(3000, () => {
            if (this.scene.handleBossVictory) {
                this.scene.handleBossVictory();
            } else {
                // Default: transition to game over with victory flag
                this.scene.scene.start('GameOverScene', {
                    victory: true,
                    score: this.scene.score,
                    distance: this.scene.distance
                });
            }
        });
    }

    /**
     * Show victory message
     */
    showVictoryMessage() {
        // Victory background
        const victoryBg = this.scene.add.rectangle(
            GAME.WIDTH / 2, GAME.HEIGHT / 2,
            GAME.WIDTH, 200,
            0x000000, 0.7
        );

        // Victory text
        const victoryText = this.scene.add.text(
            GAME.WIDTH / 2, GAME.HEIGHT / 2,
            'BOSS DEFEATED!',
            {
                fontSize: '56px',
                fontFamily: 'Arial Black',
                color: '#FFD700',
                stroke: '#FFFFFF',
                strokeThickness: 8
            }
        );
        victoryText.setOrigin(0.5);

        // Celebration particles
        this.createVictoryParticles();

        // Pulse animation
        this.scene.tweens.add({
            targets: victoryText,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 300,
            yoyo: true,
            repeat: 3,
            ease: 'Back.easeOut'
        });

        // Camera flash
        this.scene.cameras.main.flash(1000, 255, 215, 0); // Gold flash

        // Fade out after 2.5 seconds
        this.scene.time.delayedCall(2500, () => {
            this.scene.tweens.add({
                targets: [victoryBg, victoryText],
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    victoryBg.destroy();
                    victoryText.destroy();
                }
            });
        });
    }

    /**
     * Create victory celebration particles
     */
    createVictoryParticles() {
        const particleCount = 100;
        const colors = [0xFFD700, 0xFFFF00, 0xFF8C00, 0xFFFFFF];

        for (let i = 0; i < particleCount; i++) {
            const x = Phaser.Math.Between(0, GAME.WIDTH);
            const y = Phaser.Math.Between(0, GAME.HEIGHT / 2);
            const size = Phaser.Math.Between(5, 15);
            const color = Phaser.Utils.Array.GetRandom(colors);

            const particle = this.scene.add.circle(x, y, size, color, 1.0);

            this.scene.tweens.add({
                targets: particle,
                y: GAME.HEIGHT + 50,
                x: x + Phaser.Math.Between(-100, 100),
                scaleX: 0,
                scaleY: 0,
                alpha: 0,
                duration: Phaser.Math.Between(1000, 2000),
                ease: 'Cubic.easeIn',
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
    }

    /**
     * Force spawn boss (for testing or stage transitions)
     */
    forceSpawnBoss(bossType = null) {
        if (this.isBossActive) {
            console.warn('⚠️ Boss already active');
            return;
        }

        this.bossDefeated = false;
        this.spawnBoss(bossType);
    }

    /**
     * Get current boss
     */
    getCurrentBoss() {
        return this.currentBoss;
    }

    /**
     * Check if boss is active
     */
    isBossAlive() {
        return this.isBossActive && this.currentBoss && !this.currentBoss.isDestroyed;
    }

    /**
     * Get boss HP percent
     */
    getBossHPPercent() {
        if (this.currentBoss && !this.currentBoss.isDestroyed) {
            return this.currentBoss.getHPPercent();
        }
        return 0;
    }

    /**
     * Get boss projectiles
     */
    getBossProjectiles() {
        return this.bossProjectiles;
    }

    /**
     * Damage boss (for collision detection)
     */
    damageBoss(damage) {
        if (this.currentBoss && !this.currentBoss.isDestroyed) {
            return this.currentBoss.takeDamage(damage);
        }
        return false;
    }

    /**
     * Clear all boss projectiles
     */
    clearAllProjectiles() {
        for (let projectile of this.bossProjectiles) {
            if (projectile && projectile.destroy) {
                projectile.destroy();
            }
        }
        this.bossProjectiles = [];
    }

    /**
     * Cleanup
     */
    cleanup() {
        this.clearAllProjectiles();

        if (this.currentBoss && !this.currentBoss.isDestroyed) {
            this.currentBoss.destroy();
        }

        this.currentBoss = null;
        this.isBossActive = false;
        this.bossDefeated = false;
    }
}
