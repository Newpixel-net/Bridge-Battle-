import Phaser from 'phaser';
import { GAME, SCENES } from '../utils/GameConstants.js';
import { getAllCharacters, loadCharacterProgress, getDefaultSelection } from '../utils/CharacterConstants.js';
import CharacterCard from '../ui/CharacterCard.js';

/**
 * CharacterSelectionScene - Character selection before game
 *
 * VISUAL REFERENCE: Frame 2
 * - Grid of character cards
 * - Select exactly 3 characters
 * - Visual feedback on selection
 * - Confirm button to start game
 * - Shows character stats and abilities
 */
export default class CharacterSelectionScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.CHARACTER_SELECTION || 'CharacterSelectionScene' });
    }

    init() {
        console.log('🎭 CharacterSelectionScene initialized');

        // Selection state
        this.selectedCharacters = [];
        this.maxSelection = 3;
        this.cards = [];

        // Load character unlock progress
        loadCharacterProgress();
    }

    create() {
        console.log('🎭 Creating Character Selection UI...');

        // Background
        this.createBackground();

        // Title
        this.createTitle();

        // Character cards grid
        this.createCharacterGrid();

        // Selection info
        this.createSelectionInfo();

        // Confirm button
        this.createConfirmButton();

        // Back button
        this.createBackButton();

        console.log('✓ Character Selection UI created');
    }

    /**
     * Create background
     */
    createBackground() {
        // Dark gradient background
        const bg = this.add.rectangle(
            GAME.WIDTH / 2,
            GAME.HEIGHT / 2,
            GAME.WIDTH,
            GAME.HEIGHT,
            0x1A1A2E
        );

        // Decorative elements
        for (let i = 0; i < 50; i++) {
            const star = this.add.circle(
                Math.random() * GAME.WIDTH,
                Math.random() * GAME.HEIGHT,
                Math.random() * 2,
                0xFFFFFF,
                Math.random() * 0.5
            );

            // Twinkling animation
            this.tweens.add({
                targets: star,
                alpha: Math.random() * 0.8,
                duration: Phaser.Math.Between(1000, 3000),
                yoyo: true,
                repeat: -1
            });
        }
    }

    /**
     * Create title
     */
    createTitle() {
        const title = this.add.text(
            GAME.WIDTH / 2,
            50,
            'SELECT YOUR SQUAD',
            {
                fontSize: '48px',
                fontFamily: 'Arial Black',
                color: '#FFD700',
                stroke: '#000000',
                strokeThickness: 8
            }
        );
        title.setOrigin(0.5);

        // Subtle pulse animation
        this.tweens.add({
            targets: title,
            scale: 1.05,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Subtitle
        const subtitle = this.add.text(
            GAME.WIDTH / 2,
            100,
            'Choose 3 characters for your squad',
            {
                fontSize: '20px',
                fontFamily: 'Arial',
                color: '#AAAAAA'
            }
        );
        subtitle.setOrigin(0.5);
    }

    /**
     * Create character card grid
     */
    createCharacterGrid() {
        const characters = getAllCharacters();

        // Grid layout
        const cardsPerRow = 3;
        const cardWidth = 120;
        const cardHeight = 180;
        const spacing = 30;

        const totalWidth = (cardsPerRow * cardWidth) + ((cardsPerRow - 1) * spacing);
        const startX = (GAME.WIDTH - totalWidth) / 2 + (cardWidth / 2);
        const startY = 180;

        characters.forEach((character, index) => {
            const row = Math.floor(index / cardsPerRow);
            const col = index % cardsPerRow;

            const x = startX + (col * (cardWidth + spacing));
            const y = startY + (row * (cardHeight + spacing));

            const card = new CharacterCard(
                this,
                x,
                y,
                character,
                (charData, selected) => this.handleCardSelection(charData, selected)
            );

            this.cards.push(card);
        });
    }

    /**
     * Handle card selection
     */
    handleCardSelection(character, selected) {
        if (selected) {
            // Add to selection (if under limit)
            if (this.selectedCharacters.length < this.maxSelection) {
                this.selectedCharacters.push(character);
                console.log(`✓ Selected: ${character.name} (${this.selectedCharacters.length}/${this.maxSelection})`);
            } else {
                // Max reached - deselect this card
                const card = this.cards.find(c => c.characterData.id === character.id);
                if (card) {
                    card.setSelected(false);
                }
                console.warn('⚠️ Max selection reached!');
                return;
            }
        } else {
            // Remove from selection
            const index = this.selectedCharacters.findIndex(c => c.id === character.id);
            if (index !== -1) {
                this.selectedCharacters.splice(index, 1);
                console.log(`✗ Deselected: ${character.name} (${this.selectedCharacters.length}/${this.maxSelection})`);
            }
        }

        // Update selection info
        this.updateSelectionInfo();

        // Update card states (disable if max reached)
        this.updateCardStates();

        // Update confirm button state
        this.updateConfirmButton();
    }

    /**
     * Create selection info display
     */
    createSelectionInfo() {
        this.selectionInfo = this.add.text(
            GAME.WIDTH / 2,
            480,
            'Selected: 0/3',
            {
                fontSize: '24px',
                fontFamily: 'Arial Black',
                color: '#FFFFFF',
                stroke: '#000000',
                strokeThickness: 4
            }
        );
        this.selectionInfo.setOrigin(0.5);
    }

    /**
     * Update selection info
     */
    updateSelectionInfo() {
        const count = this.selectedCharacters.length;
        const color = count === this.maxSelection ? '#00FF00' : '#FFFFFF';

        this.selectionInfo.setText(`Selected: ${count}/${this.maxSelection}`);
        this.selectionInfo.setColor(color);

        // Pulse when complete
        if (count === this.maxSelection) {
            this.tweens.add({
                targets: this.selectionInfo,
                scale: 1.2,
                duration: 200,
                yoyo: true
            });
        }
    }

    /**
     * Update card states based on selection
     */
    updateCardStates() {
        const maxReached = this.selectedCharacters.length >= this.maxSelection;

        this.cards.forEach(card => {
            if (!card.isSelected) {
                card.setDisabled(maxReached);
            }
        });
    }

    /**
     * Create confirm button
     */
    createConfirmButton() {
        const buttonY = 530;

        // Button background
        this.confirmButton = this.add.rectangle(
            GAME.WIDTH / 2,
            buttonY,
            200,
            60,
            0x4CAF50,
            1.0
        );
        this.confirmButton.setStrokeStyle(4, 0xFFFFFF, 1);

        // Button text
        this.confirmText = this.add.text(
            GAME.WIDTH / 2,
            buttonY,
            'BATTLE!',
            {
                fontSize: '32px',
                fontFamily: 'Arial Black',
                color: '#FFFFFF',
                stroke: '#000000',
                strokeThickness: 6
            }
        );
        this.confirmText.setOrigin(0.5);

        // Initially disabled
        this.confirmButton.setAlpha(0.3);
        this.confirmText.setAlpha(0.3);

        // Store initial state
        this.confirmEnabled = false;
    }

    /**
     * Update confirm button state
     */
    updateConfirmButton() {
        const canConfirm = this.selectedCharacters.length === this.maxSelection;

        if (canConfirm && !this.confirmEnabled) {
            // Enable button
            this.confirmEnabled = true;

            this.tweens.add({
                targets: [this.confirmButton, this.confirmText],
                alpha: 1.0,
                duration: 300
            });

            // Make interactive
            this.confirmButton.setInteractive({ useHandCursor: true });
            this.confirmButton.on('pointerdown', () => this.handleConfirm());
            this.confirmButton.on('pointerover', () => this.handleConfirmHover());
            this.confirmButton.on('pointerout', () => this.handleConfirmOut());
        } else if (!canConfirm && this.confirmEnabled) {
            // Disable button
            this.confirmEnabled = false;

            this.tweens.add({
                targets: [this.confirmButton, this.confirmText],
                alpha: 0.3,
                duration: 300
            });

            this.confirmButton.disableInteractive();
            this.confirmButton.off('pointerdown');
            this.confirmButton.off('pointerover');
            this.confirmButton.off('pointerout');
        }
    }

    /**
     * Handle confirm button hover
     */
    handleConfirmHover() {
        this.tweens.add({
            targets: [this.confirmButton, this.confirmText],
            scale: 1.1,
            duration: 100,
            ease: 'Back.easeOut'
        });

        if (this.playButtonHoverSound) {
            this.playButtonHoverSound();
        }
    }

    /**
     * Handle confirm button out
     */
    handleConfirmOut() {
        this.tweens.add({
            targets: [this.confirmButton, this.confirmText],
            scale: 1.0,
            duration: 100
        });
    }

    /**
     * Handle confirm (start game)
     */
    handleConfirm() {
        console.log('🎮 Starting game with:', this.selectedCharacters.map(c => c.name));

        // Audio feedback
        if (this.playButtonClickSound) {
            this.playButtonClickSound();
        }

        // Visual feedback
        this.tweens.add({
            targets: [this.confirmButton, this.confirmText],
            scale: 0.9,
            duration: 100,
            yoyo: true,
            onComplete: () => {
                // Fade out and transition
                this.cameras.main.fadeOut(500, 0, 0, 0);

                this.time.delayedCall(500, () => {
                    // Start game with selected characters
                    this.scene.start(SCENES.GAME || 'GameScene', {
                        selectedCharacters: this.selectedCharacters,
                        stageNumber: 1
                    });
                });
            }
        });
    }

    /**
     * Create back button
     */
    createBackButton() {
        const backButton = this.add.rectangle(
            80,
            40,
            120,
            40,
            0x444444,
            1.0
        );
        backButton.setStrokeStyle(2, 0xAAAAA, 1);

        const backText = this.add.text(
            80,
            40,
            'BACK',
            {
                fontSize: '20px',
                fontFamily: 'Arial',
                color: '#FFFFFF'
            }
        );
        backText.setOrigin(0.5);

        backButton.setInteractive({ useHandCursor: true });
        backButton.on('pointerdown', () => {
            if (this.playButtonClickSound) {
                this.playButtonClickSound();
            }

            this.cameras.main.fadeOut(300);
            this.time.delayedCall(300, () => {
                this.scene.start(SCENES.MENU || 'MenuScene');
            });
        });

        backButton.on('pointerover', () => {
            this.tweens.add({
                targets: [backButton, backText],
                scale: 1.1,
                duration: 100
            });
        });

        backButton.on('pointerout', () => {
            this.tweens.add({
                targets: [backButton, backText],
                scale: 1.0,
                duration: 100
            });
        });
    }

    /**
     * Audio stubs (for when audio system is integrated)
     */
    playButtonClickSound() {
        // Will use scene audio when integrated
    }

    playButtonHoverSound() {
        // Will use scene audio when integrated
    }
}
