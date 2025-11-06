import Phaser from 'phaser';
import { RARITY_COLORS } from '../utils/CharacterConstants.js';

/**
 * CharacterCard - Character selection card component
 *
 * VISUAL REFERENCE: Frame 2 (Character Selection Screen)
 * - Card size: 120×180px
 * - Border color based on rarity
 * - Character portrait/icon
 * - Name text
 * - Stats preview (2-3 lines)
 * - Selection indicator (green border when selected)
 *
 * INTERACTION:
 * - Click to select/deselect
 * - Disabled when locked
 * - Visual feedback on selection
 */
export default class CharacterCard {
    constructor(scene, x, y, characterData, onSelect) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.characterData = characterData;
        this.onSelect = onSelect;

        // Card dimensions (from visual reference)
        this.width = 120;
        this.height = 180;

        // State
        this.isSelected = false;
        this.isLocked = !characterData.isUnlocked;
        this.isHovered = false;

        // Visual elements
        this.container = null;
        this.background = null;
        this.border = null;
        this.icon = null;
        this.nameText = null;
        this.statsText = null;
        this.lockOverlay = null;

        this.create();
    }

    /**
     * Create card visuals
     */
    create() {
        this.container = this.scene.add.container(this.x, this.y);
        this.container.setDepth(50);

        // Background
        this.background = this.scene.add.rectangle(
            0, 0,
            this.width, this.height,
            0x2A2A3E,
            1.0
        );

        // Border (color based on rarity)
        const rarityColor = RARITY_COLORS[this.characterData.rarity] || 0xFFFFFF;
        this.border = this.scene.add.rectangle(
            0, 0,
            this.width, this.height,
            0x000000,
            0
        );
        this.border.setStrokeStyle(3, rarityColor, 1);

        // Character icon (large circle at top)
        const iconSize = 50;
        this.icon = this.scene.add.circle(
            0, -40,
            iconSize / 2,
            this.characterData.icon.color,
            1.0
        );

        // Icon symbol
        this.iconSymbol = this.scene.add.text(
            0, -40,
            this.characterData.icon.symbol,
            {
                fontSize: '40px',
                color: '#FFFFFF'
            }
        );
        this.iconSymbol.setOrigin(0.5);

        // Name text
        this.nameText = this.scene.add.text(
            0, 0,
            this.characterData.name,
            {
                fontSize: '16px',
                fontFamily: 'Arial Black',
                color: '#FFFFFF',
                align: 'center'
            }
        );
        this.nameText.setOrigin(0.5);

        // Stats text (3 lines)
        const stats = this.characterData.stats;
        const statsText = [
            `DMG: ${(stats.damage * 100).toFixed(0)}%`,
            `SPD: ${(stats.fireRate * 100).toFixed(0)}%`,
            `HP: ${stats.hp}`
        ].join('\n');

        this.statsText = this.scene.add.text(
            0, 40,
            statsText,
            {
                fontSize: '12px',
                fontFamily: 'Arial',
                color: '#AAAAAA',
                align: 'center',
                lineSpacing: 4
            }
        );
        this.statsText.setOrigin(0.5);

        // Rarity badge (small text at bottom)
        this.rarityText = this.scene.add.text(
            0, 75,
            this.characterData.rarity,
            {
                fontSize: '10px',
                fontFamily: 'Arial',
                color: rarityColor,
                stroke: '#000000',
                strokeThickness: 2
            }
        );
        this.rarityText.setOrigin(0.5);

        // Lock overlay (if locked)
        if (this.isLocked) {
            this.lockOverlay = this.scene.add.rectangle(
                0, 0,
                this.width, this.height,
                0x000000,
                0.7
            );

            this.lockIcon = this.scene.add.text(
                0, 0,
                '🔒',
                {
                    fontSize: '48px'
                }
            );
            this.lockIcon.setOrigin(0.5);
        }

        // Add all to container
        const children = [
            this.background,
            this.border,
            this.icon,
            this.iconSymbol,
            this.nameText,
            this.statsText,
            this.rarityText
        ];

        if (this.isLocked) {
            children.push(this.lockOverlay, this.lockIcon);
        }

        this.container.add(children);

        // Make interactive (if unlocked)
        if (!this.isLocked) {
            this.background.setInteractive({ useHandCursor: true });
            this.background.on('pointerdown', () => this.handleClick());
            this.background.on('pointerover', () => this.handleHover());
            this.background.on('pointerout', () => this.handleOut());
        }
    }

    /**
     * Handle click
     */
    handleClick() {
        if (this.isLocked) return;

        // Toggle selection
        this.setSelected(!this.isSelected);

        // Notify callback
        if (this.onSelect) {
            this.onSelect(this.characterData, this.isSelected);
        }

        // Visual feedback
        this.scene.tweens.add({
            targets: this.container,
            scale: 0.95,
            duration: 100,
            yoyo: true
        });

        // Audio feedback
        if (this.scene.playButtonClickSound) {
            this.scene.playButtonClickSound();
        }
    }

    /**
     * Handle hover
     */
    handleHover() {
        if (this.isLocked) return;

        this.isHovered = true;

        // Scale up
        this.scene.tweens.add({
            targets: this.container,
            scale: 1.05,
            duration: 100,
            ease: 'Back.easeOut'
        });

        // Audio feedback
        if (this.scene.playButtonHoverSound) {
            this.scene.playButtonHoverSound();
        }
    }

    /**
     * Handle out
     */
    handleOut() {
        if (this.isLocked) return;

        this.isHovered = false;

        // Scale back (unless selected)
        if (!this.isSelected) {
            this.scene.tweens.add({
                targets: this.container,
                scale: 1.0,
                duration: 100
            });
        }
    }

    /**
     * Set selection state
     */
    setSelected(selected) {
        this.isSelected = selected;

        if (selected) {
            // Green border for selection
            this.border.setStrokeStyle(5, 0x00FF00, 1);

            // Scale up slightly
            this.scene.tweens.add({
                targets: this.container,
                scale: 1.05,
                duration: 200,
                ease: 'Back.easeOut'
            });

            // Glow effect
            this.scene.tweens.add({
                targets: this.icon,
                scale: 1.2,
                duration: 300,
                yoyo: true,
                ease: 'Sine.easeInOut'
            });
        } else {
            // Restore rarity color border
            const rarityColor = RARITY_COLORS[this.characterData.rarity];
            this.border.setStrokeStyle(3, rarityColor, 1);

            // Scale back
            this.scene.tweens.add({
                targets: this.container,
                scale: 1.0,
                duration: 200
            });
        }
    }

    /**
     * Disable selection (when max reached)
     */
    setDisabled(disabled) {
        if (this.isLocked || this.isSelected) return;

        if (disabled) {
            this.background.disableInteractive();
            this.container.setAlpha(0.5);
        } else {
            this.background.setInteractive({ useHandCursor: true });
            this.container.setAlpha(1.0);
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
