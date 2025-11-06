import Phaser from 'phaser';
import { ABILITY_TYPES } from '../utils/AbilityConstants.js';

/**
 * AbilityEffects - Executes ability effects
 *
 * Each ability type has a corresponding effect method
 * Effects are visual + mechanical (damage, buffs, etc.)
 */
export default class AbilityEffects {
    constructor(scene) {
        this.scene = scene;
        this.activeEffects = [];

        console.log('✓ AbilityEffects initialized');
    }

    /**
     * Execute ability effect
     */
    executeAbility(abilityData) {
        console.log(`🎯 Executing ability: ${abilityData.name}`);

        // Play activation audio
        this.playActivationSound(abilityData);

        // Execute based on ability type
        switch (abilityData.id) {
            case ABILITY_TYPES.FIREBALL:
                this.executeFireball(abilityData);
                break;

            case ABILITY_TYPES.SHIELD:
                this.executeShield(abilityData);
                break;

            case ABILITY_TYPES.LIGHTNING:
                this.executeLightning(abilityData);
                break;

            case ABILITY_TYPES.MULTI_SHOT:
                this.executeMultiShot(abilityData);
                break;

            case ABILITY_TYPES.SPEED_BOOST:
                this.executeSpeedBoost(abilityData);
                break;

            default:
                console.warn(`Unknown ability: ${abilityData.id}`);
        }
    }

    /**
     * FIREBALL: Explosive projectile
     */
    executeFireball(ability) {
        const startX = this.scene.squadCenterX;
        const startY = this.scene.squadCenterY;

        // Create fireball projectile
        const fireball = this.scene.add.circle(startX, startY, 15, 0xFF6B35);
        fireball.setBlendMode(Phaser.BlendModes.ADD);
        fireball.setDepth(20);

        // Outer glow
        const glow = this.scene.add.circle(startX, startY, 25, 0xFF6B35, 0.5);
        glow.setBlendMode(Phaser.BlendModes.ADD);
        glow.setDepth(19);

        // Move upward
        this.scene.tweens.add({
            targets: [fireball, glow],
            y: -100,
            duration: 1500,
            ease: 'Linear',
            onUpdate: () => {
                // Check collision with enemies
                this.checkFireballCollision(fireball, ability);

                // Pulsing effect
                glow.setScale(1 + Math.sin(this.scene.time.now * 0.01) * 0.2);
            },
            onComplete: () => {
                // Explode at end
                this.createFireballExplosion(fireball.x, fireball.y, ability);
                fireball.destroy();
                glow.destroy();
            }
        });

        // Trail effect
        this.createFireballTrail(fireball);
    }

    checkFireballCollision(fireball, ability) {
        const enemies = this.scene.enemyManager.getActiveEnemies();

        for (let enemy of enemies) {
            const dist = Phaser.Math.Distance.Between(
                fireball.x, fireball.y,
                enemy.container.x, enemy.container.y
            );

            if (dist < 40) {
                // Hit! Create explosion
                this.createFireballExplosion(fireball.x, fireball.y, ability);
                fireball.destroy();
                return;
            }
        }
    }

    createFireballExplosion(x, y, ability) {
        // Damage all enemies in radius
        const enemies = this.scene.enemyManager.getActiveEnemies();

        enemies.forEach(enemy => {
            const dist = Phaser.Math.Distance.Between(
                x, y,
                enemy.container.x, enemy.container.y
            );

            if (dist < ability.radius) {
                enemy.takeDamage(ability.damage);
            }
        });

        // Visual explosion
        const explosion = this.scene.add.circle(x, y, 10, 0xFF6B35, 1);
        explosion.setBlendMode(Phaser.BlendModes.ADD);
        explosion.setDepth(50);

        this.scene.tweens.add({
            targets: explosion,
            scale: ability.radius / 10,
            alpha: 0,
            duration: 500,
            ease: 'Cubic.easeOut',
            onComplete: () => explosion.destroy()
        });

        // Particle burst
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const speed = 150;
            const particle = this.scene.add.circle(x, y, 4, 0xFFD93D);
            particle.setBlendMode(Phaser.BlendModes.ADD);
            particle.setDepth(50);

            this.scene.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * speed,
                y: y + Math.sin(angle) * speed,
                alpha: 0,
                scale: 0,
                duration: 400,
                ease: 'Cubic.easeOut',
                onComplete: () => particle.destroy()
            });
        }

        // Screen shake
        this.scene.cameras.main.shake(200, 0.005);
        this.scene.cameras.main.flash(100, 255, 100, 0, false);
    }

    createFireballTrail(fireball) {
        const trail = this.scene.time.addEvent({
            delay: 50,
            callback: () => {
                if (!fireball.active) {
                    trail.remove();
                    return;
                }

                const particle = this.scene.add.circle(
                    fireball.x + Phaser.Math.Between(-5, 5),
                    fireball.y + Phaser.Math.Between(-5, 5),
                    Phaser.Math.Between(3, 6),
                    0xFF8E53,
                    0.8
                );
                particle.setBlendMode(Phaser.BlendModes.ADD);
                particle.setDepth(18);

                this.scene.tweens.add({
                    targets: particle,
                    alpha: 0,
                    scale: 0,
                    duration: 300,
                    onComplete: () => particle.destroy()
                });
            },
            loop: true
        });
    }

    /**
     * SHIELD: Temporary invulnerability
     */
    executeShield(ability) {
        const x = this.scene.squadCenterX;
        const y = this.scene.squadCenterY;

        // Create shield visual
        const shield = this.scene.add.circle(x, y, 60, 0x00D4FF, 0.3);
        shield.setStrokeStyle(4, 0x00D4FF, 1);
        shield.setBlendMode(Phaser.BlendModes.ADD);
        shield.setDepth(12);

        // Shield hexagon pattern
        const hexagon = this.scene.add.graphics();
        hexagon.lineStyle(3, 0x00FFFF, 0.8);
        hexagon.setDepth(12);

        const drawHexagon = () => {
            hexagon.clear();
            hexagon.lineStyle(3, 0x00FFFF, 0.8);
            const sides = 6;
            const radius = 60;

            for (let i = 0; i < sides; i++) {
                const angle = (i / sides) * Math.PI * 2;
                const nextAngle = ((i + 1) / sides) * Math.PI * 2;

                hexagon.lineBetween(
                    x + Math.cos(angle) * radius,
                    y + Math.sin(angle) * radius,
                    x + Math.cos(nextAngle) * radius,
                    y + Math.sin(nextAngle) * radius
                );
            }
        };

        drawHexagon();

        // Pulsing animation
        this.scene.tweens.add({
            targets: shield,
            scale: 1.1,
            alpha: 0.5,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        // Track shield with squad
        const updateShield = () => {
            shield.x = this.scene.squadCenterX;
            shield.y = this.scene.squadCenterY;
            drawHexagon();
        };

        const updateTimer = this.scene.time.addEvent({
            delay: 16,
            callback: updateShield,
            loop: true
        });

        // TODO: Implement invulnerability logic
        // this.scene.isInvulnerable = true;

        // Remove after duration
        this.scene.time.delayedCall(ability.duration, () => {
            // this.scene.isInvulnerable = false;
            updateTimer.remove();

            this.scene.tweens.add({
                targets: [shield, hexagon],
                alpha: 0,
                duration: 300,
                onComplete: () => {
                    shield.destroy();
                    hexagon.destroy();
                }
            });
        });

        console.log(`🛡️ Shield active for ${ability.duration}ms`);
    }

    /**
     * LIGHTNING: Chain lightning
     */
    executeLightning(ability) {
        const enemies = this.scene.enemyManager.getActiveEnemies();
        if (enemies.length === 0) return;

        // Find closest enemy
        let closest = null;
        let closestDist = Infinity;

        enemies.forEach(enemy => {
            const dist = Phaser.Math.Distance.Between(
                this.scene.squadCenterX,
                this.scene.squadCenterY,
                enemy.container.x,
                enemy.container.y
            );

            if (dist < closestDist) {
                closestDist = dist;
                closest = enemy;
            }
        });

        if (!closest) return;

        // Chain to multiple enemies
        const targets = [closest];
        let current = closest;

        for (let i = 1; i < ability.maxTargets; i++) {
            let nextTarget = null;
            let nextDist = Infinity;

            enemies.forEach(enemy => {
                if (targets.includes(enemy)) return;

                const dist = Phaser.Math.Distance.Between(
                    current.container.x,
                    current.container.y,
                    enemy.container.x,
                    enemy.container.y
                );

                if (dist < ability.jumpRange && dist < nextDist) {
                    nextDist = dist;
                    nextTarget = enemy;
                }
            });

            if (nextTarget) {
                targets.push(nextTarget);
                current = nextTarget;
            } else {
                break;
            }
        }

        // Draw lightning and damage
        this.createLightningChain(
            this.scene.squadCenterX,
            this.scene.squadCenterY,
            targets,
            ability
        );
    }

    createLightningChain(startX, startY, targets, ability) {
        const graphics = this.scene.add.graphics();
        graphics.setDepth(25);

        let currentX = startX;
        let currentY = startY;

        targets.forEach((enemy, index) => {
            // Damage enemy
            enemy.takeDamage(ability.damage);

            // Draw lightning bolt
            const targetX = enemy.container.x;
            const targetY = enemy.container.y;

            graphics.lineStyle(3, 0xFFEB3B, 1);
            graphics.beginPath();
            graphics.moveTo(currentX, currentY);

            // Jagged line
            const segments = 5;
            for (let i = 1; i <= segments; i++) {
                const t = i / segments;
                const x = Phaser.Math.Linear(currentX, targetX, t);
                const y = Phaser.Math.Linear(currentY, targetY, t);
                const offset = Phaser.Math.Between(-10, 10);

                graphics.lineTo(x + offset, y + offset);
            }

            graphics.strokePath();

            currentX = targetX;
            currentY = targetY;

            // Glow on hit
            const glow = this.scene.add.circle(targetX, targetY, 20, 0xFFEB3B, 0.8);
            glow.setBlendMode(Phaser.BlendModes.ADD);
            glow.setDepth(26);

            this.scene.tweens.add({
                targets: glow,
                scale: 2,
                alpha: 0,
                duration: 300,
                onComplete: () => glow.destroy()
            });
        });

        // Flash screen
        this.scene.cameras.main.flash(100, 255, 255, 100, false);

        // Remove graphics after delay
        this.scene.time.delayedCall(200, () => graphics.destroy());

        console.log(`⚡ Lightning chained to ${targets.length} enemies`);
    }

    /**
     * MULTI-SHOT: Spread of bullets
     */
    executeMultiShot(ability) {
        if (this.scene.autoShootingSystem) {
            this.scene.autoShootingSystem.fireSpread(
                ability.bulletCount,
                ability.spreadAngle
            );

            // Visual feedback
            this.scene.cameras.main.flash(50, 255, 0, 255, false);
        }

        console.log(`💥 Multi-shot: ${ability.bulletCount} bullets`);
    }

    /**
     * SPEED BOOST: Increase fire rate
     */
    executeSpeedBoost(ability) {
        if (this.scene.autoShootingSystem) {
            this.scene.autoShootingSystem.boostFireRate(
                1 / ability.fireRateMultiplier, // Lower = faster
                ability.duration
            );

            // Visual indicator
            const indicator = this.scene.add.text(
                this.scene.squadCenterX,
                this.scene.squadCenterY - 40,
                '⚡SPEED⚡',
                {
                    fontSize: '20px',
                    fontFamily: 'Arial Black',
                    color: '#4CAF50',
                    stroke: '#000000',
                    strokeThickness: 4
                }
            );
            indicator.setOrigin(0.5);
            indicator.setDepth(30);

            this.scene.tweens.add({
                targets: indicator,
                y: indicator.y - 30,
                alpha: 0,
                duration: ability.duration,
                onComplete: () => indicator.destroy()
            });
        }

        console.log(`⚡ Speed boost: ${ability.fireRateMultiplier}x for ${ability.duration}ms`);
    }

    /**
     * Play activation sound
     */
    playActivationSound(ability) {
        // Different sound per ability type
        const sounds = {
            [ABILITY_TYPES.FIREBALL]: () => {
                this.scene.playSweep(200, 600, 0.15, 0.3);
            },
            [ABILITY_TYPES.SHIELD]: () => {
                this.scene.playMusicalNote(880, 0.2, 0.3, 'sine');
                setTimeout(() => this.scene.playMusicalNote(1100, 0.15, 0.4, 'sine'), 100);
            },
            [ABILITY_TYPES.LIGHTNING]: () => {
                this.scene.playWhiteNoise(0.15, 150);
                this.scene.playSweep(800, 400, 0.12, 0.2);
            },
            [ABILITY_TYPES.MULTI_SHOT]: () => {
                this.scene.playMusicalNote(660, 0.15, 0.2, 'square');
            },
            [ABILITY_TYPES.SPEED_BOOST]: () => {
                this.scene.playSweep(400, 800, 0.15, 0.25);
            }
        };

        const soundFn = sounds[ability.id];
        if (soundFn && this.scene.audioEnabled) {
            soundFn();
        }
    }

    /**
     * Cleanup
     */
    destroy() {
        this.activeEffects = [];
    }
}
