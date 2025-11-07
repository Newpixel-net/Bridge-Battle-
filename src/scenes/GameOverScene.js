import Phaser from 'phaser';
import { GAME, COLORS, SCENES, UI_SCALE } from '../utils/GameConstants.js';
import { progressionManager } from '../systems/ProgressionManager.js';

/**
 * GameOverScene - Phase 2
 * Displays when squad count reaches 0
 */
export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.GAME_OVER });
    }

    init(data) {
        this.finalDistance = data.distance || 0;
        this.finalSquadSize = data.squadSize || 0;
        this.score = data.score || 0;
        this.enemiesKilled = data.enemiesKilled || 0;
        this.highScore = data.highScore || progressionManager.getHighScore();
    }

    create() {
        const centerX = GAME.WIDTH / 2;
        const centerY = GAME.HEIGHT / 2;

        // Get AtlasHelper from registry (initialized in PreloadScene)
        this.atlasHelper = this.registry.get('atlasHelper');

        if (this.atlasHelper) {
            console.log('✓ AtlasHelper available - using professional sprite atlases');
        } else {
            console.log('⚠️  AtlasHelper not available - using fallback PNG assets');
        }

        // Dark overlay background
        this.add.rectangle(centerX, centerY, GAME.WIDTH, GAME.HEIGHT, 0x000000, 0.8);

        // TEMPORARY: Use PNG asset until sprite atlas coordinates are properly mapped
        // TODO: Map actual sprite coordinates and re-enable atlas system
        const panel = this.add.image(centerX, centerY, 'ui_panel_lose');
        panel.setScale(0);
        panel.setDepth(10);

        // Scale in animation
        // FIXED: Scale using UI_SCALE.PANEL constant (1640x1800 → 623x684)
        const targetScale = UI_SCALE.PANEL;
        this.tweens.add({
            targets: panel,
            scaleX: targetScale,
            scaleY: targetScale,
            duration: 600,
            ease: 'Back.easeOut',
            delay: 300
        });

        // Add interactive continue button overlay (invisible clickable area)
        const continueButton = this.add.rectangle(
            centerX,
            centerY + 140,
            200,
            50,
            0x000000,
            0
        );
        continueButton.setInteractive({ useHandCursor: true });
        continueButton.setDepth(11);

        // Hover effect
        const hoverScale = targetScale * 1.05;
        continueButton.on('pointerover', () => {
            this.tweens.add({
                targets: panel,
                scaleX: hoverScale,
                scaleY: hoverScale,
                duration: 150,
                ease: 'Quad.easeOut'
            });
        });

        continueButton.on('pointerout', () => {
            this.tweens.add({
                targets: panel,
                scaleX: targetScale,
                scaleY: targetScale,
                duration: 150
            });
        });

        // Click to restart
        continueButton.on('pointerdown', () => {
            this.scene.start(SCENES.GAME);
        });

        // Keyboard shortcuts
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start(SCENES.GAME);
        });

        this.input.keyboard.once('keydown-ESC', () => {
            this.scene.start(SCENES.MENU);
        });

        console.log('💀 Game Over - Distance:', this.finalDistance, 'Squad:', this.finalSquadSize);
    }
}
