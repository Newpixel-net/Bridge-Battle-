import Phaser from 'phaser';

/**
 * AbilityCard - Individual ability card UI component
 *
 * VISUAL REFERENCE: Frames 6-14 (bottom center UI)
 * - Card size: 80x100px
 * - Shows: Icon, name, energy cost
 * - Cooldown overlay when on cooldown
 * - Darkened when insufficient energy
 * - Glows when hoverable/ready
 *
 * INTERACTION:
 * - Click to activate ability
 * - Visual feedback on hover
 * - Disabled state when on cooldown or insufficient energy
 */
export default class AbilityCard {
    constructor(scene, x, y, abilityData, onActivate) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.abilityData = abilityData;
        this.onActivate = onActivate;

        // Card dimensions (from visual reference)
        this.width = 80;
        this.height = 100;

        // State
        this.isOnCooldown = false;
        this.cooldownRemaining = 0;
        this.cooldownEndTime = 0;
        this.isHovered = false;
        this.canAfford = true;

        // Visual elements
        this.container = null;
        this.background = null;
        this.icon = null;
        this.nameText = null;
        this.costText = null;
        this.cooldownOverlay = null;
        this.cooldownText = null;

        this.create();
    }

    /**
     * Create card visuals
     */
    create() {
        this.container = this.scene.add.container(this.x, this.y);
        this.container.setDepth(150); // Above game, below some UI
        this.container.setScrollFactor(0); // Fixed to screen

        // Background
        this.background = this.scene.add.rectangle(
            0, 0,
            this.width, this.height,
            0x1A1A2E,
            0.9
        );
        this.background.setStrokeStyle(3, this.abilityData.icon.color, 1);

        // Icon area (top 60% of card)
        const iconSize = 40;
        this.icon = this.scene.add.circle(
            0, -15,
            iconSize / 2,
            this.abilityData.icon.color,
            1.0
        );

        // Icon symbol (emoji/text)
        this.iconSymbol = this.scene.add.text(
            0, -15,
            this.abilityData.icon.symbol,
            {
                fontSize: '32px',
                color: '#FFFFFF'
            }
        );
        this.iconSymbol.setOrigin(0.5);

        // Name text
        this.nameText = this.scene.add.text(
            0, 20,
            this.abilityData.name,
            {
                fontSize: '12px',
                fontFamily: 'Arial',
                color: '#FFFFFF',
                align: 'center'
            }
        );
        this.nameText.setOrigin(0.5);

        // Energy cost
        this.costText = this.scene.add.text(
            0, 38,
            `⚡${this.abilityData.energyCost}`,
            {
                fontSize: '14px',
                fontFamily: 'Arial Black',
                color: '#FFD700',
                stroke: '#000000',
                strokeThickness: 2
            }
        );
        this.costText.setOrigin(0.5);

        // Cooldown overlay (dark rectangle, initially hidden)
        this.cooldownOverlay = this.scene.add.rectangle(
            0, 0,
            this.width, this.height,
            0x000000,
            0.7
        );
        this.cooldownOverlay.setVisible(false);

        // Cooldown timer text
        this.cooldownText = this.scene.add.text(
            0, 0,
            '0.0s',
            {
                fontSize: '24px',
                fontFamily: 'Arial Black',
                color: '#FF0000',
                stroke: '#000000',
                strokeThickness: 4
            }
        );
        this.cooldownText.setOrigin(0.5);
        this.cooldownText.setVisible(false);

        // Add all to container
        this.container.add([
            this.background,
            this.icon,
            this.iconSymbol,
            this.nameText,
            this.costText,
            this.cooldownOverlay,
            this.cooldownText
        ]);

        // Make interactive
        this.background.setInteractive({ useHandCursor: true });
        this.background.on('pointerdown', () => this.handleClick());
        this.background.on('pointerover', () => this.handleHover());
        this.background.on('pointerout', () => this.handleOut());

        // Idle animation (gentle pulse)
        this.scene.tweens.add({
            targets: this.icon,
            scale: 1.1,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    /**
     * Handle click
     */
    handleClick() {
        if (this.isOnCooldown || !this.canAfford) {
            // Cannot activate - play error sound
            this.scene.playMusicalNote(200, 0.1, 0.1, 'square');

            // Shake to indicate cannot use
            this.scene.tweens.add({
                targets: this.container,
                x: this.x + 5,
                duration: 50,
                yoyo: true,
                repeat: 3
            });

            return;
        }

        // Activate ability
        if (this.onActivate) {
            this.onActivate(this.abilityData);
        }

        // Start cooldown
        this.startCooldown();

        // Visual feedback - flash
        this.scene.tweens.add({
            targets: [this.background, this.icon],
            scale: 1.2,
            alpha: 0.5,
            duration: 100,
            yoyo: true
        });

        console.log(`🎯 Ability activated: ${this.abilityData.name}`);
    }

    /**
     * Handle hover
     */
    handleHover() {
        if (this.isOnCooldown || !this.canAfford) return;

        this.isHovered = true;

        // Glow effect
        this.background.setStrokeStyle(4, 0xFFFFFF, 1);

        // Scale up slightly
        this.scene.tweens.add({
            targets: this.container,
            scale: 1.05,
            duration: 100,
            ease: 'Back.easeOut'
        });

        // Play hover sound
        if (this.scene.playButtonHoverSound) {
            this.scene.playButtonHoverSound();
        }
    }

    /**
     * Handle out
     */
    handleOut() {
        this.isHovered = false;

        // Restore border
        this.background.setStrokeStyle(3, this.abilityData.icon.color, 1);

        // Scale back
        this.scene.tweens.add({
            targets: this.container,
            scale: 1.0,
            duration: 100
        });
    }

    /**
     * Start cooldown
     */
    startCooldown() {
        this.isOnCooldown = true;
        this.cooldownEndTime = this.scene.time.now + this.abilityData.cooldown;
        this.cooldownRemaining = this.abilityData.cooldown;

        // Show overlay
        this.cooldownOverlay.setVisible(true);
        this.cooldownText.setVisible(true);

        // Disable interaction temporarily
        this.background.disableInteractive();
    }

    /**
     * Update cooldown
     */
    update(time, delta) {
        if (!this.isOnCooldown) return;

        // Calculate remaining cooldown
        this.cooldownRemaining = Math.max(0, this.cooldownEndTime - time);

        // Update cooldown text
        const seconds = (this.cooldownRemaining / 1000).toFixed(1);
        this.cooldownText.setText(`${seconds}s`);

        // Check if cooldown finished
        if (this.cooldownRemaining <= 0) {
            this.endCooldown();
        }
    }

    /**
     * End cooldown
     */
    endCooldown() {
        this.isOnCooldown = false;
        this.cooldownRemaining = 0;

        // Hide overlay
        this.cooldownOverlay.setVisible(false);
        this.cooldownText.setVisible(false);

        // Re-enable interaction
        this.background.setInteractive({ useHandCursor: true });

        // Visual feedback - brief glow
        this.scene.tweens.add({
            targets: this.background,
            alpha: 1,
            duration: 200,
            yoyo: true,
            repeat: 2
        });

        // Play ready sound
        this.scene.playMusicalNote(880, 0.08, 0.15, 'sine');

        console.log(`✅ ${this.abilityData.name} ready!`);
    }

    /**
     * Update affordability (can player afford this ability?)
     */
    updateAffordability(currentEnergy) {
        const wasAffordable = this.canAfford;
        this.canAfford = currentEnergy >= this.abilityData.energyCost;

        // Visual update if changed
        if (wasAffordable !== this.canAfford) {
            if (!this.canAfford) {
                // Darken card (insufficient energy)
                this.container.setAlpha(0.5);
            } else {
                // Restore brightness
                this.container.setAlpha(1.0);
            }
        }
    }

    /**
     * Destroy card
     */
    destroy() {
        if (this.container) {
            this.container.destroy();
        }
    }
}
