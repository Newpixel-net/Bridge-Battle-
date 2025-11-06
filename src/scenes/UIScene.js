import Phaser from 'phaser';
import { SCENES, COLORS, UI } from '../utils/GameConstants.js';

/**
 * UIScene - Phase 1: Foundation
 *
 * Displays HUD overlay:
 * - Squad counter (bottom-center, HUGE and prominent)
 *
 * Runs parallel to GameScene
 */
export default class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.UI });
    }

    create() {
        console.log('🎨 UIScene created');

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Squad counter (bottom-center) - VERY LARGE and PROMINENT
        this.createSquadCounter(width, height);

        // Listen for events from GameScene
        this.setupEvents();
    }

    /**
     * Create squad counter display (bottom-center, HUGE)
     */
    createSquadCounter(width, height) {
        const centerX = width / 2;
        const bottomY = height - UI.SQUAD_COUNTER_BOTTOM;

        // Background circle/bubble
        this.squadBubble = this.add.circle(
            centerX,
            bottomY,
            70,
            0x1976D2,  // Dark blue background
            0.8
        );
        this.squadBubble.setScrollFactor(0);
        this.squadBubble.setDepth(1000);

        // White border
        this.squadBorder = this.add.circle(
            centerX,
            bottomY,
            70
        );
        this.squadBorder.setStrokeStyle(4, COLORS.UI_WHITE, 1);
        this.squadBorder.setScrollFactor(0);
        this.squadBorder.setDepth(1001);
        this.squadBorder.setFillStyle(0x000000, 0); // Transparent fill

        // Squad count text - VERY LARGE
        this.squadText = this.add.text(
            centerX,
            bottomY,
            '1',
            {
                fontSize: UI.SQUAD_COUNTER_SIZE,
                fontFamily: 'Arial',
                color: '#FFFFFF',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 8
            }
        );
        this.squadText.setOrigin(0.5);
        this.squadText.setScrollFactor(0);
        this.squadText.setDepth(1002);

        // Small label below
        this.squadLabel = this.add.text(
            centerX,
            bottomY + 90,
            'SQUAD',
            {
                fontSize: UI.SQUAD_LABEL_SIZE,
                fontFamily: 'Arial',
                color: '#AAAAAA',
                fontStyle: 'bold'
            }
        );
        this.squadLabel.setOrigin(0.5);
        this.squadLabel.setScrollFactor(0);
        this.squadLabel.setDepth(1002);

        console.log('✓ Squad counter UI created');
    }

    /**
     * Setup event listeners from GameScene
     */
    setupEvents() {
        const gameScene = this.scene.get(SCENES.GAME);

        if (gameScene) {
            gameScene.events.on('updateSquad', this.updateSquadCount, this);
            console.log('✓ UI event listeners registered');
        }
    }

    /**
     * Update squad counter with animation
     */
    updateSquadCount(count) {
        this.squadText.setText(count.toString());

        // Color coding based on count
        let color = '#FFFFFF';
        let bubbleColor = 0x1976D2;

        if (count <= 2) {
            color = '#FF4444';        // Danger - red
            bubbleColor = 0xD32F2F;
        } else if (count <= 5) {
            color = '#FFAA00';        // Warning - orange
            bubbleColor = 0xFF6F00;
        } else if (count >= 50) {
            color = '#00FF00';        // Excellent - green
            bubbleColor = 0x388E3C;
        }

        this.squadText.setColor(color);
        this.squadBubble.setFillStyle(bubbleColor, 0.8);

        // Pulse animation on change
        this.tweens.add({
            targets: [this.squadText, this.squadBubble, this.squadBorder],
            scale: 1.15,
            duration: 200,
            yoyo: true,
            ease: 'Back.easeOut'
        });

        // Adjust bubble size for large numbers
        if (count >= 100) {
            this.squadBubble.radius = 90;
            this.squadBorder.radius = 90;
            this.squadText.setFontSize('96px');
        } else if (count >= 50) {
            this.squadBubble.radius = 80;
            this.squadBorder.radius = 80;
            this.squadText.setFontSize('108px');
        } else {
            this.squadBubble.radius = 70;
            this.squadBorder.radius = 70;
            this.squadText.setFontSize(UI.SQUAD_COUNTER_SIZE);
        }
    }

    /**
     * Cleanup
     */
    shutdown() {
        const gameScene = this.scene.get(SCENES.GAME);
        if (gameScene) {
            gameScene.events.off('updateSquad', this.updateSquadCount, this);
        }
    }
}
