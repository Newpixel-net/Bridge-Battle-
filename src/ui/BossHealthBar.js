import Phaser from 'phaser';
import { GAME } from '../utils/GameConstants.js';

/**
 * BossHealthBar - Large prominent health bar for boss battles
 *
 * VISUAL REFERENCE: Frames 14-15
 * - Large horizontal bar at top of screen
 * - Boss name displayed above bar
 * - Current HP / Max HP numbers
 * - Phase indicator (Phase 1/2/3/4)
 * - Color changes based on HP level (green → yellow → red)
 * - Pulsing animation when low HP
 *
 * LAYOUT:
 * - Position: Top center (Y = 30-70)
 * - Width: 80% of screen width
 * - Height: 25px bar + text
 */
export default class BossHealthBar {
    constructor(scene, boss) {
        this.scene = scene;
        this.boss = boss;

        // Configuration
        this.barWidth = GAME.WIDTH * 0.8;
        this.barHeight = 25;
        this.x = GAME.WIDTH / 2;
        this.y = 50;

        // Current values
        this.currentHP = boss.hp;
        this.maxHP = boss.maxHp;
        this.currentPhase = boss.currentPhase;
        this.bossName = boss.stats.name;

        // Visual elements
        this.container = null;
        this.barBackground = null;
        this.barFill = null;
        this.barBorder = null;
        this.nameText = null;
        this.hpText = null;
        this.phaseText = null;

        // Animation state
        this.isLowHP = false;
        this.pulseTween = null;

        // Create UI
        this.create();

        console.log(`✓ BossHealthBar created for ${this.bossName}`);
    }

    /**
     * Create health bar UI
     */
    create() {
        // Main container
        this.container = this.scene.add.container(this.x, this.y);

        // Boss name text (above bar)
        this.nameText = this.scene.add.text(
            0, -30,
            this.bossName.toUpperCase(),
            {
                fontSize: '24px',
                fontFamily: 'Arial Black',
                color: '#FFFFFF',
                stroke: '#000000',
                strokeThickness: 4
            }
        );
        this.nameText.setOrigin(0.5);

        // Health bar background (dark gray)
        this.barBackground = this.scene.add.rectangle(
            0, 0,
            this.barWidth, this.barHeight,
            0x333333, 1.0
        );

        // Health bar fill (dynamic color)
        this.barFill = this.scene.add.rectangle(
            -this.barWidth / 2, 0,
            this.barWidth, this.barHeight,
            0x00FF00, 1.0
        );
        this.barFill.setOrigin(0, 0.5);

        // Health bar border (white outline)
        this.barBorder = this.scene.add.rectangle(
            0, 0,
            this.barWidth, this.barHeight,
            0xFFFFFF, 0
        );
        this.barBorder.setStrokeStyle(3, 0xFFFFFF, 1.0);

        // HP text - large numerical display (e.g., "67")
        this.hpText = this.scene.add.text(
            0, 0,
            `${Math.floor(this.currentHP)}`,
            {
                fontSize: '32px',
                fontFamily: 'Arial Black',
                color: '#FFFFFF',
                stroke: '#000000',
                strokeThickness: 4
            }
        );
        this.hpText.setOrigin(0.5);
        this.hpText.setResolution(2); // High resolution

        // Max HP text (smaller, below main number)
        this.maxHpText = this.scene.add.text(
            0, 20,
            `/ ${this.maxHP}`,
            {
                fontSize: '14px',
                fontFamily: 'Arial',
                color: '#AAAAAA',
                stroke: '#000000',
                strokeThickness: 2
            }
        );
        this.maxHpText.setOrigin(0.5);
        this.maxHpText.setResolution(2);

        // Phase indicator (bottom right of bar)
        this.phaseText = this.scene.add.text(
            this.barWidth / 2 + 10, 0,
            `PHASE ${this.currentPhase}`,
            {
                fontSize: '16px',
                fontFamily: 'Arial Black',
                color: '#FFD700',
                stroke: '#000000',
                strokeThickness: 3
            }
        );
        this.phaseText.setOrigin(0, 0.5);

        // Add warning icon when low HP (hidden initially)
        this.warningIcon = this.scene.add.text(
            -this.barWidth / 2 - 30, 0,
            '⚠️',
            {
                fontSize: '24px'
            }
        );
        this.warningIcon.setOrigin(0.5);
        this.warningIcon.setVisible(false);

        // Add all to container
        this.container.add([
            this.nameText,
            this.barBackground,
            this.barFill,
            this.barBorder,
            this.hpText,
            this.maxHpText,
            this.phaseText,
            this.warningIcon
        ]);

        // Entrance animation
        this.container.setAlpha(0);
        this.container.y = this.y - 30;

        this.scene.tweens.add({
            targets: this.container,
            alpha: 1,
            y: this.y,
            duration: 800,
            ease: 'Back.easeOut'
        });
    }

    /**
     * Update health bar
     */
    update(time, delta) {
        if (!this.boss || this.boss.isDestroyed) {
            this.hide();
            return;
        }

        // Get current boss values
        const newHP = this.boss.hp;
        const newPhase = this.boss.currentPhase;

        // Smooth HP transition
        if (newHP !== this.currentHP) {
            this.animateHPChange(newHP);
        }

        // Phase change
        if (newPhase !== this.currentPhase) {
            this.animatePhaseChange(newPhase);
        }

        // Update HP percentage
        const hpPercent = this.boss.getHPPercent();
        this.updateBarColor(hpPercent);

        // Low HP warning
        if (hpPercent <= 0.25 && !this.isLowHP) {
            this.startLowHPWarning();
        } else if (hpPercent > 0.25 && this.isLowHP) {
            this.stopLowHPWarning();
        }
    }

    /**
     * Animate HP change
     */
    animateHPChange(newHP) {
        const oldHP = this.currentHP;
        const hpDiff = newHP - oldHP;

        // Update current HP
        this.currentHP = newHP;

        // Calculate new bar width
        const hpPercent = this.currentHP / this.maxHP;
        const newBarWidth = this.barWidth * hpPercent;

        // Animate bar width change
        this.scene.tweens.add({
            targets: this.barFill,
            width: newBarWidth,
            duration: 300,
            ease: 'Cubic.easeOut'
        });

        // Update HP text with animation
        this.scene.tweens.add({
            targets: this.hpText,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 100,
            yoyo: true,
            onComplete: () => {
                this.hpText.setText(`${Math.max(0, Math.floor(this.currentHP))}`);
            }
        });

        // Damage flash effect
        if (hpDiff < 0) {
            const damageFlash = this.scene.add.rectangle(
                0, 0,
                this.barWidth, this.barHeight,
                0xFF0000, 0.6
            );
            this.container.add(damageFlash);

            this.scene.tweens.add({
                targets: damageFlash,
                alpha: 0,
                duration: 300,
                onComplete: () => {
                    damageFlash.destroy();
                }
            });
        }
    }

    /**
     * Animate phase change
     */
    animatePhaseChange(newPhase) {
        this.currentPhase = newPhase;

        // Flash effect
        const flash = this.scene.add.rectangle(
            0, 0,
            this.barWidth + 20, this.barHeight + 20,
            0xFFFFFF, 0.8
        );
        this.container.add(flash);

        this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 500,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                flash.destroy();
            }
        });

        // Update phase text with animation
        this.scene.tweens.add({
            targets: this.phaseText,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0,
            duration: 200,
            onComplete: () => {
                this.phaseText.setText(`PHASE ${newPhase}`);
                this.phaseText.setScale(1);
                this.scene.tweens.add({
                    targets: this.phaseText,
                    alpha: 1,
                    scaleX: 1.2,
                    scaleY: 1.2,
                    duration: 300,
                    yoyo: true,
                    ease: 'Back.easeOut'
                });
            }
        });

        // Shake name text
        this.scene.tweens.add({
            targets: this.nameText,
            x: 5,
            duration: 50,
            yoyo: true,
            repeat: 5
        });
    }

    /**
     * Update bar color based on HP percentage
     */
    updateBarColor(hpPercent) {
        let color;

        if (hpPercent > 0.6) {
            color = 0x00FF00; // Green
        } else if (hpPercent > 0.3) {
            color = 0xFFFF00; // Yellow
        } else if (hpPercent > 0.15) {
            color = 0xFF8800; // Orange
        } else {
            color = 0xFF0000; // Red
        }

        // Only update if color changed
        if (this.barFill.fillColor !== color) {
            this.barFill.setFillStyle(color, 1.0);
        }
    }

    /**
     * Start low HP warning animation
     */
    startLowHPWarning() {
        this.isLowHP = true;
        this.warningIcon.setVisible(true);

        // Pulse bar
        this.pulseTween = this.scene.tweens.add({
            targets: [this.barFill, this.barBorder],
            alpha: 0.5,
            duration: 400,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Flash warning icon
        this.scene.tweens.add({
            targets: this.warningIcon,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 300,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Name text red pulse
        this.scene.tweens.add({
            targets: this.nameText,
            color: '#FF0000',
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }

    /**
     * Stop low HP warning animation
     */
    stopLowHPWarning() {
        this.isLowHP = false;
        this.warningIcon.setVisible(false);

        // Stop pulse tween
        if (this.pulseTween) {
            this.pulseTween.stop();
            this.barFill.setAlpha(1);
            this.barBorder.setAlpha(1);
        }

        // Reset colors
        this.nameText.setColor('#FFFFFF');
    }

    /**
     * Hide health bar
     */
    hide() {
        if (!this.container) return;

        this.scene.tweens.add({
            targets: this.container,
            alpha: 0,
            y: this.y - 30,
            duration: 500,
            ease: 'Back.easeIn',
            onComplete: () => {
                this.destroy();
            }
        });
    }

    /**
     * Show health bar
     */
    show() {
        if (!this.container) return;

        this.container.setAlpha(0);
        this.scene.tweens.add({
            targets: this.container,
            alpha: 1,
            y: this.y,
            duration: 500,
            ease: 'Back.easeOut'
        });
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.pulseTween) {
            this.pulseTween.stop();
        }

        if (this.container) {
            this.container.destroy();
        }

        this.container = null;
    }
}
