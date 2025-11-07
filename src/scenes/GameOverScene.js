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

        // PROFESSIONAL: Dark dramatic background
        this.createDramaticBackground();

        // ATLAS ONLY - No PNG fallback
        if (!this.atlasHelper) {
            console.error('❌ CRITICAL: AtlasHelper not available! Cannot create game over panel.');
            return;
        }

        // PROFESSIONAL: Main panel with effects
        this.createGameOverPanel(centerX, centerY);

        console.log('💀 Game Over - Distance:', this.finalDistance, 'Squad:', this.finalSquadSize);
    }

    /**
     * Create dramatic background
     */
    createDramaticBackground() {
        const centerX = GAME.WIDTH / 2;
        const centerY = GAME.HEIGHT / 2;

        // Dark gradient layers
        this.add.rectangle(centerX, centerY, GAME.WIDTH, GAME.HEIGHT, 0x1a1a2e, 1.0);

        const darkOverlay = this.add.rectangle(centerX, centerY, GAME.WIDTH, GAME.HEIGHT, 0x000000, 0.7);

        // Pulsing dark effect
        this.tweens.add({
            targets: darkOverlay,
            alpha: 0.5,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        if (!this.atlasHelper) return;

        // Slow rotating sunburst (darker, ominous)
        const sunburst = this.atlasHelper.createSprite(centerX, centerY, 'sunburst_rays');
        sunburst.setScale(1.2);
        sunburst.setAlpha(0.08);
        sunburst.setDepth(1);
        sunburst.setTint(0x880000); // Dark red tint

        this.tweens.add({
            targets: sunburst,
            angle: -360, // Reverse rotation
            duration: 25000,
            repeat: -1,
            ease: 'Linear'
        });

        // Falling stars (dimmed)
        for (let i = 0; i < 3; i++) {
            const x = Phaser.Math.Between(100, GAME.WIDTH - 100);
            const star = this.atlasHelper.createSprite(x, -50, 'star_brown_small');
            star.setAlpha(0.3);
            star.setDepth(2);

            this.tweens.add({
                targets: star,
                y: GAME.HEIGHT + 50,
                alpha: 0,
                duration: Phaser.Math.Between(4000, 6000),
                delay: i * 800,
                ease: 'Cubic.easeIn',
                onComplete: () => star.destroy()
            });
        }
    }

    /**
     * Create professional game over panel
     */
    createGameOverPanel(centerX, centerY) {
        // Professional panel
        const panel = this.atlasHelper.createSprite(centerX, centerY, 'panel_large');
        const targetScale = 1.2;

        panel.setScale(0);
        panel.setDepth(10);
        panel.setTint(0xCCCCCC); // Slight gray tint for sombre feel

        // Slow, heavy entrance
        this.tweens.add({
            targets: panel,
            scaleX: targetScale,
            scaleY: targetScale,
            duration: 1000,
            ease: 'Cubic.easeOut',
            delay: 200
        });

        // PROFESSIONAL: Corner stars (dimmed)
        const cornerPositions = [
            { x: centerX - 280, y: centerY - 220 },
            { x: centerX + 280, y: centerY - 220 },
            { x: centerX - 280, y: centerY + 220 },
            { x: centerX + 280, y: centerY + 220 }
        ];

        cornerPositions.forEach((pos, i) => {
            const star = this.atlasHelper.createSprite(pos.x, pos.y, 'star_brown_small');
            star.setDepth(11);
            star.setAlpha(0);
            star.setScale(0.8);

            this.tweens.add({
                targets: star,
                alpha: 0.6,
                duration: 800,
                delay: 500 + (i * 150)
            });
        });

        // PROFESSIONAL: "GAME OVER" text
        const gameOverText = this.add.text(centerX, centerY - 140, 'GAME OVER', {
            fontSize: '64px',
            fontFamily: 'Arial Black',
            color: '#FF4444',
            stroke: '#000000',
            strokeThickness: 10,
            shadow: {
                offsetX: 4,
                offsetY: 4,
                color: '#000000',
                blur: 10,
                fill: true
            }
        });
        gameOverText.setOrigin(0.5);
        gameOverText.setDepth(12);
        gameOverText.setAlpha(0);

        this.tweens.add({
            targets: gameOverText,
            alpha: 1,
            y: centerY - 120,
            duration: 1000,
            ease: 'Cubic.easeOut',
            delay: 800
        });

        // PROFESSIONAL: Stats display
        const statsY = centerY - 40;
        const stats = [
            { label: 'Distance', value: `${Math.floor(this.finalDistance)}m`, icon: '🏃' },
            { label: 'Squad', value: this.finalSquadSize, icon: '👥' },
            { label: 'Enemies', value: this.enemiesKilled, icon: '💀' }
        ];

        stats.forEach((stat, i) => {
            const y = statsY + (i * 40);

            const statText = this.add.text(
                centerX,
                y,
                `${stat.icon} ${stat.label}: ${stat.value}`,
                {
                    fontSize: '28px',
                    fontFamily: 'Arial',
                    color: '#FFFFFF',
                    stroke: '#000000',
                    strokeThickness: 4
                }
            );
            statText.setOrigin(0.5);
            statText.setDepth(12);
            statText.setAlpha(0);

            this.tweens.add({
                targets: statText,
                alpha: 1,
                duration: 600,
                delay: 1200 + (i * 200)
            });
        });

        // PROFESSIONAL: Retry button
        const retryBtn = this.atlasHelper.createButton(
            centerX,
            centerY + 140,
            'button_play_green',
            () => this.scene.start(SCENES.GAME)
        );

        const retryText = this.add.text(centerX, centerY + 140, 'TRY AGAIN', {
            fontSize: '32px',
            fontFamily: 'Arial Black',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 6
        });
        retryText.setOrigin(0.5);
        retryText.setDepth(101);

        // Entrance animations
        retryBtn.setAlpha(0);
        retryText.setAlpha(0);

        this.tweens.add({
            targets: [retryBtn, retryText],
            alpha: 1,
            duration: 600,
            delay: 1800
        });

        // Keyboard shortcuts
        this.input.keyboard.once('keydown-SPACE', () => this.scene.start(SCENES.GAME));
        this.input.keyboard.once('keydown-ESC', () => this.scene.start(SCENES.MENU));
    }
}
