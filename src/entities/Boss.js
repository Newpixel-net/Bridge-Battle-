import Phaser from 'phaser';
import { GAME } from '../utils/GameConstants.js';

/**
 * Boss - Epic boss enemy with phases and attack patterns
 *
 * VISUAL REFERENCE: Frame 14-15 (Boss Battle)
 * - Much larger than regular enemies (60-80px)
 * - Dark purple/red color scheme
 * - Multiple attack patterns
 * - Phase-based behavior (changes at 75%, 50%, 25% HP)
 * - Large health bar at top of screen
 *
 * BOSS TYPES:
 * - TANK_BOSS: High HP, slow attacks, spawns minions
 * - SPEED_BOSS: Lower HP, rapid fire, fast movement
 * - MAGE_BOSS: Medium HP, special abilities, area attacks
 */
export default class Boss {
    constructor(scene, x, y, bossType = 'TANK_BOSS') {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.bossType = bossType;

        // Boss stats based on type
        this.stats = this.getBossStats(bossType);
        this.hp = this.stats.maxHp;
        this.maxHp = this.stats.maxHp;

        // State
        this.active = true;
        this.isDying = false;
        this.isDestroyed = false;
        this.currentPhase = 1; // 1, 2, 3, 4 (gets harder each phase)

        // Movement
        this.movementPattern = 'horizontal';
        this.movementSpeed = 50;
        this.movementDirection = 1; // 1 = right, -1 = left
        this.movementBounds = {
            left: 100,
            right: GAME.WIDTH - 100
        };

        // Attack timing
        this.lastAttackTime = 0;
        this.attackCooldown = this.stats.attackCooldown;
        this.lastSpecialAttackTime = 0;
        this.specialAttackCooldown = this.stats.specialAttackCooldown;

        // Visual configuration
        this.size = this.stats.size;
        this.color = this.stats.color;

        // Create visual representation
        this.container = this.createVisuals();

        // Hit flash effect
        this.hitFlashDuration = 100;
        this.lastHitTime = 0;

        // Phase transition effect
        this.isInPhaseTransition = false;

        console.log(`👑 BOSS SPAWNED: ${bossType} at (${x}, ${y}) - HP: ${this.hp}`);
    }

    /**
     * Get boss stats based on type
     */
    getBossStats(type) {
        const types = {
            'WAVE_BOSS': {
                name: 'WAVE BOSS',
                maxHp: 200,
                size: 45,
                color: 0xCC0000,        // Deep red
                glowColor: 0xFF3333,    // Bright red glow
                shadowColor: 0x880000,  // Dark red
                attackCooldown: 3000,   // 3 seconds between attacks
                specialAttackCooldown: 6000, // 6 seconds for special
                scoreValue: 1000,
                abilities: ['PROJECTILE_BARRAGE', 'SUMMON_MINIONS', 'CHARGE_ATTACK', 'AREA_SLAM'],
                phaseCount: 2           // Simple 2-phase system (50% HP)
            },
            'TANK_BOSS': {
                name: 'Iron Colossus',
                maxHp: 500,
                size: 40,
                color: 0x4A148C,        // Deep purple
                glowColor: 0x7B1FA2,    // Purple glow
                shadowColor: 0x311B92,  // Dark purple
                attackCooldown: 2000,   // 2 seconds between attacks
                specialAttackCooldown: 8000, // 8 seconds for special
                scoreValue: 500,
                abilities: ['PROJECTILE_SPREAD', 'SPAWN_MINIONS', 'GROUND_SLAM'],
                phaseCount: 4           // Complex 4-phase system
            },
            'SPEED_BOSS': {
                name: 'Lightning Striker',
                maxHp: 300,
                size: 35,
                color: 0xF57C00,        // Orange
                glowColor: 0xFF9800,    // Bright orange
                shadowColor: 0xE65100,  // Dark orange
                attackCooldown: 800,    // Fast attacks
                specialAttackCooldown: 5000,
                scoreValue: 400,
                abilities: ['RAPID_FIRE', 'DASH_ATTACK', 'LIGHTNING_STORM'],
                phaseCount: 4
            },
            'MAGE_BOSS': {
                name: 'Arcane Destroyer',
                maxHp: 400,
                size: 38,
                color: 0x1565C0,        // Blue
                glowColor: 0x2196F3,    // Bright blue
                shadowColor: 0x0D47A1,  // Dark blue
                attackCooldown: 1500,
                specialAttackCooldown: 6000,
                scoreValue: 450,
                abilities: ['MAGIC_MISSILES', 'TELEPORT', 'ENERGY_WAVE'],
                phaseCount: 4
            }
        };

        return types[type] || types['TANK_BOSS'];
    }

    /**
     * Create boss visuals
     */
    createVisuals() {
        const container = this.scene.add.container(this.x, this.y);

        // Outer glow (largest layer)
        const outerGlow = this.scene.add.circle(
            0, 0,
            this.size * 1.8,
            this.stats.glowColor,
            0.2
        );
        outerGlow.setBlendMode(Phaser.BlendModes.ADD);

        // Middle glow
        const middleGlow = this.scene.add.circle(
            0, 0,
            this.size * 1.4,
            this.stats.glowColor,
            0.4
        );
        middleGlow.setBlendMode(Phaser.BlendModes.ADD);

        // Shadow (bottom layer)
        const shadow = this.scene.add.circle(
            3, 3,
            this.size,
            0x000000,
            0.5
        );

        // Main body
        const body = this.scene.add.circle(
            0, 0,
            this.size,
            this.color,
            1.0
        );

        // Inner glow/highlight
        const innerGlow = this.scene.add.circle(
            -this.size * 0.3, -this.size * 0.3,
            this.size * 0.4,
            0xFFFFFF,
            0.6
        );

        // Boss "crown" or top decoration
        const crown = this.scene.add.triangle(
            0, -this.size * 0.8,
            0, 0,
            this.size * 0.4, this.size * 0.6,
            -this.size * 0.4, this.size * 0.6,
            0xFFD700, // Gold
            1.0
        );

        // Add all to container
        container.add([outerGlow, middleGlow, shadow, body, innerGlow, crown]);

        // Store references for animations
        container.body = body;
        container.outerGlow = outerGlow;
        container.middleGlow = middleGlow;
        container.crown = crown;

        // Pulsing animation
        this.scene.tweens.add({
            targets: [outerGlow, middleGlow],
            scaleX: 1.2,
            scaleY: 1.2,
            alpha: 0.6,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Crown floating animation
        this.scene.tweens.add({
            targets: crown,
            y: crown.y - 5,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        return container;
    }

    /**
     * Update boss
     */
    update(time, delta) {
        if (!this.active || this.isDying) return;

        // Update position
        this.container.x = this.x;
        this.container.y = this.y;

        // Update movement
        this.updateMovement(time, delta);

        // Update attacks
        this.updateAttacks(time);

        // Check for phase transitions
        this.checkPhaseTransition();
    }

    /**
     * Update boss movement
     */
    updateMovement(time, delta) {
        if (this.isInPhaseTransition) return;

        const speed = this.movementSpeed * (delta / 1000);

        if (this.movementPattern === 'horizontal') {
            // Move horizontally
            this.x += speed * this.movementDirection;

            // Reverse at bounds
            if (this.x <= this.movementBounds.left) {
                this.x = this.movementBounds.left;
                this.movementDirection = 1;
            } else if (this.x >= this.movementBounds.right) {
                this.x = this.movementBounds.right;
                this.movementDirection = -1;
            }
        }
    }

    /**
     * Update boss attacks
     */
    updateAttacks(time) {
        if (this.isInPhaseTransition) return;

        // Basic attack
        if (time >= this.lastAttackTime + this.attackCooldown) {
            this.performBasicAttack(time);
            this.lastAttackTime = time;
        }

        // Special attack
        if (time >= this.lastSpecialAttackTime + this.specialAttackCooldown) {
            this.performSpecialAttack(time);
            this.lastSpecialAttackTime = time;
        }
    }

    /**
     * Perform basic attack based on boss type
     */
    performBasicAttack(time) {
        console.log(`👑 Boss basic attack - Phase ${this.currentPhase}`);

        if (this.bossType === 'WAVE_BOSS') {
            // Alternate between projectile barrage and charge attack
            if (Math.random() < 0.5) {
                this.attackProjectileBarrage();
            } else {
                this.attackChargeAttack();
            }
        } else if (this.bossType === 'TANK_BOSS') {
            this.attackProjectileSpread();
        } else if (this.bossType === 'SPEED_BOSS') {
            this.attackRapidFire();
        } else if (this.bossType === 'MAGE_BOSS') {
            this.attackMagicMissiles();
        }
    }

    /**
     * Perform special attack based on boss type and phase
     */
    performSpecialAttack(time) {
        console.log(`💥 Boss special attack - Phase ${this.currentPhase}`);

        if (this.bossType === 'WAVE_BOSS') {
            // Alternate between summon minions and area slam
            if (Math.random() < 0.5) {
                this.attackSummonMinions();
            } else {
                this.attackAreaSlam();
            }
        } else if (this.bossType === 'TANK_BOSS') {
            if (this.currentPhase >= 2) {
                this.spawnMinions();
            }
        } else if (this.bossType === 'SPEED_BOSS') {
            this.attackLightningStorm();
        } else if (this.bossType === 'MAGE_BOSS') {
            this.attackEnergyWave();
        }
    }

    /**
     * ATTACK PATTERN: Projectile spread
     */
    attackProjectileSpread() {
        const projectileCount = 3 + this.currentPhase; // More projectiles each phase
        const spreadAngle = 60; // Total spread
        const angleStep = spreadAngle / (projectileCount - 1);
        const startAngle = -spreadAngle / 2;

        for (let i = 0; i < projectileCount; i++) {
            const angle = startAngle + (angleStep * i);
            this.createBossProjectile(this.x, this.y, angle);
        }
    }

    /**
     * ATTACK PATTERN: Rapid fire
     */
    attackRapidFire() {
        const burstCount = 3 + this.currentPhase;

        for (let i = 0; i < burstCount; i++) {
            this.scene.time.delayedCall(i * 100, () => {
                if (this.active) {
                    this.createBossProjectile(this.x, this.y, 0);
                }
            });
        }
    }

    /**
     * ATTACK PATTERN: Magic missiles (homing)
     */
    attackMagicMissiles() {
        const missileCount = 2 + Math.floor(this.currentPhase / 2);

        for (let i = 0; i < missileCount; i++) {
            const angle = (360 / missileCount) * i;
            this.createBossProjectile(this.x, this.y, angle, true);
        }
    }

    /**
     * ATTACK PATTERN: Lightning storm (area attack)
     */
    attackLightningStorm() {
        // Create multiple lightning strikes across the play area
        const strikeCount = 5 + this.currentPhase;

        for (let i = 0; i < strikeCount; i++) {
            this.scene.time.delayedCall(i * 200, () => {
                if (this.active) {
                    const randomX = Phaser.Math.Between(50, GAME.WIDTH - 50);
                    this.createLightningStrike(randomX);
                }
            });
        }
    }

    /**
     * ATTACK PATTERN: Energy wave (horizontal sweep)
     */
    attackEnergyWave() {
        const wave = this.scene.add.rectangle(
            this.x, this.y,
            GAME.WIDTH, 30,
            0x2196F3, 0.6
        );
        wave.setBlendMode(Phaser.BlendModes.ADD);

        this.scene.tweens.add({
            targets: wave,
            y: GAME.HEIGHT + 50,
            duration: 3000,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                wave.destroy();
            }
        });

        // Check collision with player (handled by GameScene)
        wave.isEnergyWave = true;
        wave.damage = 20;
    }

    /**
     * ATTACK PATTERN: Spawn minions
     */
    spawnMinions() {
        const minionCount = 2 + this.currentPhase;

        for (let i = 0; i < minionCount; i++) {
            const spawnX = this.x + Phaser.Math.Between(-100, 100);
            const spawnY = this.y + 50;

            // Trigger enemy spawn in GameScene
            if (this.scene.enemyManager) {
                this.scene.time.delayedCall(i * 300, () => {
                    if (this.active) {
                        this.scene.enemyManager.spawnEnemy(spawnX, spawnY, 'SOLDIER');
                    }
                });
            }
        }
    }

    // =====================================================
    // WAVE BOSS ABILITIES (Session 3)
    // =====================================================

    /**
     * WAVE BOSS ABILITY 1: Projectile Barrage (8 bullets in circle)
     */
    attackProjectileBarrage() {
        const projectileCount = 8;
        const angleStep = 360 / projectileCount;

        for (let i = 0; i < projectileCount; i++) {
            const angle = i * angleStep;
            this.createBossProjectile(this.x, this.y, angle);
        }

        console.log(`💥 Projectile Barrage: ${projectileCount} bullets!`);
    }

    /**
     * WAVE BOSS ABILITY 2: Summon Minions (spawn 5 regular enemies)
     */
    attackSummonMinions() {
        const minionCount = 5;
        const spawnRadius = 80;

        for (let i = 0; i < minionCount; i++) {
            const angle = (i / minionCount) * Math.PI * 2;
            const spawnX = this.x + Math.cos(angle) * spawnRadius;
            const spawnY = this.y + Math.sin(angle) * spawnRadius;

            // Spawn enemy using wave system
            if (this.scene.spawnWaveEnemy) {
                this.scene.time.delayedCall(i * 200, () => {
                    if (this.active) {
                        this.scene.spawnWaveEnemy('SOLDIER', spawnX, spawnY, 80);

                        // Spawn effect
                        const spawnEffect = this.scene.add.circle(spawnX, spawnY, 30, this.stats.glowColor, 0.6);
                        spawnEffect.setBlendMode(Phaser.BlendModes.ADD);
                        this.scene.tweens.add({
                            targets: spawnEffect,
                            scaleX: 2,
                            scaleY: 2,
                            alpha: 0,
                            duration: 400,
                            onComplete: () => {
                                spawnEffect.destroy();
                            }
                        });
                    }
                });
            }
        }

        console.log(`👹 Summoning ${minionCount} minions!`);
    }

    /**
     * WAVE BOSS ABILITY 3: Charge Attack (dash toward player)
     */
    attackChargeAttack() {
        if (!this.scene.squadCenterX || !this.scene.squadCenterY) return;

        // Visual warning
        const warningLine = this.scene.add.line(
            0, 0,
            this.x, this.y,
            this.scene.squadCenterX, this.scene.squadCenterY,
            0xFF0000, 0.6
        );
        warningLine.setLineWidth(4);
        warningLine.setOrigin(0, 0);

        // Flash warning
        this.scene.tweens.add({
            targets: warningLine,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                warningLine.destroy();

                // Execute charge
                const startX = this.x;
                const startY = this.y;
                const targetX = this.scene.squadCenterX;
                const targetY = this.scene.squadCenterY;

                // Charge animation
                this.scene.tweens.add({
                    targets: this,
                    x: targetX,
                    y: targetY,
                    duration: 400,
                    ease: 'Quad.easeIn',
                    onUpdate: () => {
                        // Check collision during charge
                        const dist = Phaser.Math.Distance.Between(
                            this.x, this.y,
                            this.scene.squadCenterX, this.scene.squadCenterY
                        );

                        if (dist < this.size + 30) {
                            // Hit player during charge
                            if (this.scene.takeDamage) {
                                this.scene.takeDamage(20); // Charge damage
                            }
                        }
                    },
                    onComplete: () => {
                        // Return to original position
                        this.scene.tweens.add({
                            targets: this,
                            x: startX + Phaser.Math.Between(-30, 30),
                            y: startY,
                            duration: 800,
                            ease: 'Quad.easeOut'
                        });
                    }
                });

                // Trail effect during charge
                for (let i = 0; i < 10; i++) {
                    this.scene.time.delayedCall(i * 40, () => {
                        const trail = this.scene.add.circle(this.x, this.y, this.size * 0.8, this.stats.color, 0.4);
                        this.scene.tweens.add({
                            targets: trail,
                            alpha: 0,
                            scaleX: 0.3,
                            scaleY: 0.3,
                            duration: 400,
                            onComplete: () => {
                                trail.destroy();
                            }
                        });
                    });
                }
            }
        });

        console.log(`⚡ Charge Attack!`);
    }

    /**
     * WAVE BOSS ABILITY 4: Area Slam (jump + shockwave)
     */
    attackAreaSlam() {
        const originalY = this.y;

        // Jump up
        this.scene.tweens.add({
            targets: this,
            y: this.y - 80,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 600,
            ease: 'Quad.easeOut',
            onComplete: () => {
                // Slam down
                this.scene.tweens.add({
                    targets: this,
                    y: originalY,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 300,
                    ease: 'Quad.easeIn',
                    onComplete: () => {
                        // Shockwave on impact
                        this.scene.cameras.main.shake(400, 0.015);

                        // Create expanding shockwave rings
                        for (let i = 0; i < 3; i++) {
                            this.scene.time.delayedCall(i * 100, () => {
                                const shockwave = this.scene.add.circle(this.x, this.y, this.size, 0xFF3333, 0);
                                shockwave.setStrokeStyle(8, 0xFF0000, 0.8);
                                shockwave.setBlendMode(Phaser.BlendModes.ADD);
                                shockwave.damage = 15;
                                shockwave.isShockwave = true;

                                // Add to projectiles for collision detection
                                if (!this.scene.bossProjectiles) {
                                    this.scene.bossProjectiles = [];
                                }
                                this.scene.bossProjectiles.push(shockwave);

                                this.scene.tweens.add({
                                    targets: shockwave,
                                    scaleX: 4,
                                    scaleY: 4,
                                    alpha: 0,
                                    duration: 800,
                                    ease: 'Quad.easeOut',
                                    onComplete: () => {
                                        const index = this.scene.bossProjectiles.indexOf(shockwave);
                                        if (index > -1) {
                                            this.scene.bossProjectiles.splice(index, 1);
                                        }
                                        shockwave.destroy();
                                    }
                                });
                            });
                        }

                        // Debris particles
                        for (let i = 0; i < 20; i++) {
                            const angle = (i / 20) * Math.PI * 2;
                            const speed = Phaser.Math.Between(50, 150);
                            const debris = this.scene.add.circle(
                                this.x,
                                this.y,
                                Phaser.Math.Between(3, 8),
                                0x888888,
                                1
                            );

                            this.scene.tweens.add({
                                targets: debris,
                                x: debris.x + Math.cos(angle) * speed,
                                y: debris.y + Math.sin(angle) * speed,
                                alpha: 0,
                                duration: 600,
                                ease: 'Quad.easeOut',
                                onComplete: () => {
                                    debris.destroy();
                                }
                            });
                        }
                    }
                });
            }
        });

        console.log(`💥 Area Slam!`);
    }

    // =====================================================
    // END WAVE BOSS ABILITIES
    // =====================================================

    /**
     * Create boss projectile
     */
    createBossProjectile(x, y, angleDegrees, homing = false) {
        const projectile = this.scene.add.container(x, y);

        // Projectile visual (larger than player bullets)
        const core = this.scene.add.circle(0, 0, 8, this.stats.color, 1.0);
        const glow = this.scene.add.circle(0, 0, 12, this.stats.glowColor, 0.5);
        glow.setBlendMode(Phaser.BlendModes.ADD);

        projectile.add([glow, core]);

        // Calculate velocity
        const angleRad = Phaser.Math.DegToRad(angleDegrees + 90); // +90 because 0 is right
        const speed = 200;
        projectile.velocityX = Math.cos(angleRad) * speed;
        projectile.velocityY = Math.sin(angleRad) * speed;
        projectile.damage = 10 + (this.currentPhase * 2);
        projectile.active = true;
        projectile.homing = homing;
        projectile.isBossProjectile = true;

        // Add to scene tracking (handled by GameScene)
        if (!this.scene.bossProjectiles) {
            this.scene.bossProjectiles = [];
        }
        this.scene.bossProjectiles.push(projectile);

        return projectile;
    }

    /**
     * Create lightning strike
     */
    createLightningStrike(x) {
        // Warning indicator
        const warning = this.scene.add.rectangle(
            x, GAME.HEIGHT / 2,
            10, GAME.HEIGHT,
            0xFFFF00, 0.3
        );

        // Flash warning
        this.scene.tweens.add({
            targets: warning,
            alpha: 0.6,
            duration: 100,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
                // Actual lightning strike
                const lightning = this.scene.add.rectangle(
                    x, GAME.HEIGHT / 2,
                    15, GAME.HEIGHT,
                    0xFFFFFF, 1.0
                );
                lightning.setBlendMode(Phaser.BlendModes.ADD);
                lightning.damage = 15;
                lightning.isLightningStrike = true;

                // Add to tracking
                if (!this.scene.bossProjectiles) {
                    this.scene.bossProjectiles = [];
                }
                this.scene.bossProjectiles.push(lightning);

                // Flash and fade
                this.scene.tweens.add({
                    targets: lightning,
                    alpha: 0,
                    duration: 200,
                    onComplete: () => {
                        lightning.destroy();
                        const index = this.scene.bossProjectiles.indexOf(lightning);
                        if (index > -1) {
                            this.scene.bossProjectiles.splice(index, 1);
                        }
                    }
                });

                warning.destroy();
            }
        });
    }

    /**
     * Take damage
     */
    takeDamage(damage) {
        if (!this.active || this.isDying) return false;

        this.hp -= damage;

        // Hit flash effect
        this.container.body.setFillStyle(0xFFFFFF);
        this.scene.time.delayedCall(this.hitFlashDuration, () => {
            if (this.container.body) {
                this.container.body.setFillStyle(this.color);
            }
        });

        // Damage number popup
        this.showDamageNumber(damage);

        // Check if dead
        if (this.hp <= 0) {
            this.die();
            return true;
        }

        return false;
    }

    /**
     * Show damage number
     */
    showDamageNumber(damage) {
        const damageText = this.scene.add.text(
            this.x + Phaser.Math.Between(-20, 20),
            this.y - this.size,
            `-${damage}`,
            {
                fontSize: '20px',
                fontFamily: 'Arial Black',
                color: '#FFFFFF',
                stroke: '#FF0000',
                strokeThickness: 4
            }
        );
        damageText.setOrigin(0.5);

        this.scene.tweens.add({
            targets: damageText,
            y: damageText.y - 50,
            alpha: 0,
            duration: 1000,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                damageText.destroy();
            }
        });
    }

    /**
     * Check for phase transitions
     */
    checkPhaseTransition() {
        const hpPercent = this.hp / this.maxHp;

        // WAVE_BOSS: Simple 2-phase system (only at 50% HP)
        if (this.bossType === 'WAVE_BOSS') {
            if (hpPercent <= 0.50 && this.currentPhase === 1) {
                this.transitionToPhase(2);
            }
        }
        // Other bosses: Complex 4-phase system
        else {
            if (hpPercent <= 0.75 && this.currentPhase === 1) {
                this.transitionToPhase(2);
            } else if (hpPercent <= 0.50 && this.currentPhase === 2) {
                this.transitionToPhase(3);
            } else if (hpPercent <= 0.25 && this.currentPhase === 3) {
                this.transitionToPhase(4);
            }
        }
    }

    /**
     * Transition to new phase
     */
    transitionToPhase(newPhase) {
        if (this.isInPhaseTransition) return;

        this.isInPhaseTransition = true;
        this.currentPhase = newPhase;

        console.log(`🔥 BOSS PHASE ${newPhase}!`);

        // WAVE_BOSS: Change color to darker red in phase 2
        if (this.bossType === 'WAVE_BOSS' && newPhase === 2) {
            this.color = 0x880000; // Darker red
            this.stats.glowColor = 0xDD0000; // Darker glow
            if (this.container && this.container.body) {
                this.container.body.setFillStyle(this.color);
            }
        }

        // Visual effect for phase transition
        const flash = this.scene.add.circle(
            this.x, this.y,
            this.size * 3,
            this.stats.glowColor,
            0.8
        );
        flash.setBlendMode(Phaser.BlendModes.ADD);

        this.scene.tweens.add({
            targets: flash,
            scaleX: 3,
            scaleY: 3,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                flash.destroy();
            }
        });

        // Camera shake
        this.scene.cameras.main.shake(300, 0.01);

        // Speed up attacks
        this.attackCooldown *= 0.85; // 15% faster
        this.specialAttackCooldown *= 0.9; // 10% faster
        this.movementSpeed *= 1.2; // 20% faster movement

        // End transition after effect
        this.scene.time.delayedCall(500, () => {
            this.isInPhaseTransition = false;
        });
    }

    /**
     * Boss dies
     */
    die() {
        if (this.isDying) return;

        this.isDying = true;
        this.active = false;

        console.log(`💀 BOSS DEFEATED: ${this.stats.name}`);

        // Epic explosion effect
        this.createBossExplosion();

        // Camera shake
        this.scene.cameras.main.shake(800, 0.015);

        // Destroy container after explosion
        this.scene.time.delayedCall(2000, () => {
            if (this.container) {
                this.container.destroy();
            }
            this.isDestroyed = true;

            // Trigger boss defeat event in GameScene
            if (this.scene.onBossDefeated) {
                this.scene.onBossDefeated(this.stats.scoreValue);
            }
        });
    }

    /**
     * Create epic boss explosion
     */
    createBossExplosion() {
        const particleCount = 50;
        const colors = [0xFF0000, 0xFF6B00, 0xFFFF00, this.stats.color, this.stats.glowColor];

        for (let i = 0; i < particleCount; i++) {
            const angle = (360 / particleCount) * i;
            const distance = Phaser.Math.Between(50, 150);
            const size = Phaser.Math.Between(10, 30);
            const color = Phaser.Utils.Array.GetRandom(colors);

            const particle = this.scene.add.circle(
                this.x, this.y,
                size, color, 1.0
            );

            const angleRad = Phaser.Math.DegToRad(angle);
            const targetX = this.x + Math.cos(angleRad) * distance;
            const targetY = this.y + Math.sin(angleRad) * distance;

            this.scene.tweens.add({
                targets: particle,
                x: targetX,
                y: targetY,
                scaleX: 0,
                scaleY: 0,
                alpha: 0,
                duration: Phaser.Math.Between(500, 1500),
                ease: 'Cubic.easeOut',
                onComplete: () => {
                    particle.destroy();
                }
            });
        }

        // Central flash
        const flash = this.scene.add.circle(
            this.x, this.y,
            this.size * 5,
            0xFFFFFF,
            1.0
        );
        flash.setBlendMode(Phaser.BlendModes.ADD);

        this.scene.tweens.add({
            targets: flash,
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                flash.destroy();
            }
        });
    }

    /**
     * Get HP percentage
     */
    getHPPercent() {
        return this.hp / this.maxHp;
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.container) {
            this.container.destroy();
        }
        this.isDestroyed = true;
        this.active = false;
    }
}
