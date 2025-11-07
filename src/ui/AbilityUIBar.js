import Phaser from 'phaser';
import AbilityCard from './AbilityCard.js';

/**
 * AbilityUIBar - Manages ability cards display at bottom of screen
 *
 * VISUAL REFERENCE: Frames 6-14 (bottom center)
 * - 3-5 ability cards displayed horizontally
 * - Cards are 80x100px, spaced evenly
 * - Positioned at bottom center of screen
 * - Energy bar above cards
 *
 * LAYOUT:
 * - Y position: 550 (bottom of 600px screen)
 * - Spacing: 20px between cards
 * - Center aligned
 */
export default class AbilityUIBar {
    constructor(scene, x, y, abilities, energySystem, onActivate) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.abilities = abilities;
        this.energySystem = energySystem;
        this.onActivate = onActivate;

        // Card management
        this.cards = [];
        this.cardWidth = 80;
        this.cardHeight = 100;
        this.cardSpacing = 20;

        // Energy bar
        this.energyBar = null;
        this.energyBarBg = null;
        this.energyText = null;

        this.create();
    }

    /**
     * Create UI bar
     */
    create() {
        // Calculate total width and starting X
        const totalWidth = (this.abilities.length * this.cardWidth) +
                          ((this.abilities.length - 1) * this.cardSpacing);
        const startX = this.x - (totalWidth / 2) + (this.cardWidth / 2);

        // Create ability cards
        this.abilities.forEach((ability, index) => {
            const cardX = startX + (index * (this.cardWidth + this.cardSpacing));
            const cardY = this.y;

            const card = new AbilityCard(
                this.scene,
                cardX,
                cardY,
                ability,
                (abilityData) => this.handleAbilityActivation(abilityData)
            );

            this.cards.push(card);
        });

        // Create energy bar above cards
        this.createEnergyBar();

        // Register energy change callback
        this.energySystem.onEnergyChange = (current, max) => {
            this.updateEnergyBar(current, max);
        };

        console.log(`✓ AbilityUIBar created (${this.abilities.length} abilities)`);
    }

    /**
     * Create energy bar visualization
     */
    createEnergyBar() {
        const barWidth = 300;
        const barHeight = 20;
        const barY = this.y - 70; // Above ability cards

        // Background
        this.energyBarBg = this.scene.add.rectangle(
            this.x,
            barY,
            barWidth,
            barHeight,
            0x1A1A2E,
            0.8
        );
        this.energyBarBg.setStrokeStyle(2, 0x00AAFF, 1);
        this.energyBarBg.setDepth(150);
        this.energyBarBg.setScrollFactor(0);

        // Fill (energy amount)
        this.energyBar = this.scene.add.rectangle(
            this.x - barWidth / 2,
            barY,
            barWidth,
            barHeight,
            0x00D4FF,
            1.0
        );
        this.energyBar.setOrigin(0, 0.5);
        this.energyBar.setDepth(151);
        this.energyBar.setScrollFactor(0);

        // Energy text
        this.energyText = this.scene.add.text(
            this.x,
            barY,
            '100/100',
            {
                fontSize: '14px',
                fontFamily: 'Arial Black',
                color: '#FFFFFF',
                stroke: '#000000',
                strokeThickness: 3
            }
        );
        this.energyText.setOrigin(0.5);
        this.energyText.setDepth(152);
        this.energyText.setScrollFactor(0);

        // Label
        const label = this.scene.add.text(
            this.x,
            barY - 20,
            'ENERGY',
            {
                fontSize: '12px',
                fontFamily: 'Arial',
                color: '#00FFFF',
                stroke: '#000000',
                strokeThickness: 2
            }
        );
        label.setOrigin(0.5);
        label.setDepth(150);
        label.setScrollFactor(0);

        // Initial update
        this.updateEnergyBar(
            this.energySystem.currentEnergy,
            this.energySystem.maxEnergy
        );
    }

    /**
     * Update energy bar visual
     */
    updateEnergyBar(current, max) {
        const barWidth = 300;
        const percent = current / max;

        // Update fill width
        this.energyBar.width = barWidth * percent;

        // Update text (both values as whole numbers)
        this.energyText.setText(`${Math.floor(current)}/${Math.floor(max)}`);

        // Color based on energy level
        if (percent > 0.6) {
            this.energyBar.setFillStyle(0x00D4FF); // Cyan (high)
        } else if (percent > 0.3) {
            this.energyBar.setFillStyle(0xFFEB3B); // Yellow (medium)
        } else {
            this.energyBar.setFillStyle(0xFF6B35); // Orange-red (low)
        }

        // Update card affordability
        this.cards.forEach(card => {
            card.updateAffordability(current);
        });
    }

    /**
     * Handle ability activation
     */
    handleAbilityActivation(abilityData) {
        // Try to consume energy
        const success = this.energySystem.consumeEnergy(abilityData.energyCost);

        if (!success) {
            console.warn('⚠️ Cannot activate: insufficient energy');
            return;
        }

        // Trigger callback (GameScene will execute the effect)
        if (this.onActivate) {
            this.onActivate(abilityData);
        }

        // Visual feedback - energy bar flash
        this.scene.tweens.add({
            targets: this.energyBar,
            alpha: 0.3,
            duration: 100,
            yoyo: true
        });
    }

    /**
     * Update all cards (cooldowns, etc.)
     */
    update(time, delta) {
        this.cards.forEach(card => {
            card.update(time, delta);
        });
    }

    /**
     * Show ability bar
     */
    show() {
        this.cards.forEach(card => {
            if (card.container) {
                card.container.setVisible(true);
            }
        });

        if (this.energyBar) this.energyBar.setVisible(true);
        if (this.energyBarBg) this.energyBarBg.setVisible(true);
        if (this.energyText) this.energyText.setVisible(true);
    }

    /**
     * Hide ability bar
     */
    hide() {
        this.cards.forEach(card => {
            if (card.container) {
                card.container.setVisible(false);
            }
        });

        if (this.energyBar) this.energyBar.setVisible(false);
        if (this.energyBarBg) this.energyBarBg.setVisible(false);
        if (this.energyText) this.energyText.setVisible(false);
    }

    /**
     * Reset all abilities (clear cooldowns)
     */
    reset() {
        this.cards.forEach(card => {
            card.isOnCooldown = false;
            card.cooldownRemaining = 0;
            card.cooldownOverlay?.setVisible(false);
            card.cooldownText?.setVisible(false);
        });
    }

    /**
     * Cleanup
     */
    destroy() {
        this.cards.forEach(card => card.destroy());
        this.cards = [];

        if (this.energyBar) this.energyBar.destroy();
        if (this.energyBarBg) this.energyBarBg.destroy();
        if (this.energyText) this.energyText.destroy();
    }
}
