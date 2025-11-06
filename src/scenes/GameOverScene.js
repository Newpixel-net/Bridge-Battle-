import Phaser from 'phaser';
import { GAME, COLORS, SCENES } from '../utils/GameConstants.js';
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

        // Dark overlay background
        this.add.rectangle(centerX, centerY, GAME.WIDTH, GAME.HEIGHT, 0x000000, 0.8);

        // Game Over title
        const title = this.add.text(centerX, centerY - 200, 'GAME OVER', {
            fontSize: '64px',
            fontFamily: 'Arial Black',
            color: '#FF0000',
            stroke: '#000000',
            strokeThickness: 8
        });
        title.setOrigin(0.5);

        // Pulse animation
        this.tweens.add({
            targets: title,
            scale: 1.1,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Stats container
        const statsY = centerY - 100;

        // Score
        this.add.text(centerX, statsY, `Score: ${this.score}`, {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // High Score
        this.add.text(centerX, statsY + 45, `High Score: ${this.highScore}`, {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#AAAAAA',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Distance traveled
        this.add.text(centerX, statsY + 90, `Distance: ${Math.floor(this.finalDistance)}m`, {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Enemies killed
        this.add.text(centerX, statsY + 130, `Enemies: ${this.enemiesKilled}`, {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Final squad size
        this.add.text(centerX, statsY + 170, `Final Squad: ${this.finalSquadSize}`, {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Restart button
        const restartButton = this.add.rectangle(centerX, centerY + 150, 300, 80, COLORS.GATE_GOOD);
        restartButton.setStrokeStyle(4, 0xFFFFFF);
        restartButton.setInteractive({ useHandCursor: true });

        const restartText = this.add.text(centerX, centerY + 150, 'RESTART', {
            fontSize: '36px',
            fontFamily: 'Arial Black',
            color: '#FFFFFF'
        });
        restartText.setOrigin(0.5);

        // Button hover effect
        restartButton.on('pointerover', () => {
            restartButton.setFillStyle(COLORS.GATE_GOOD, 0.8);
            restartButton.setScale(1.05);
        });

        restartButton.on('pointerout', () => {
            restartButton.setFillStyle(COLORS.GATE_GOOD, 1);
            restartButton.setScale(1);
        });

        restartButton.on('pointerdown', () => {
            this.scene.start(SCENES.GAME);
        });

        // Menu button
        const menuButton = this.add.rectangle(centerX, centerY + 250, 300, 80, 0x666666);
        menuButton.setStrokeStyle(4, 0xFFFFFF);
        menuButton.setInteractive({ useHandCursor: true });

        const menuText = this.add.text(centerX, centerY + 250, 'MENU', {
            fontSize: '36px',
            fontFamily: 'Arial Black',
            color: '#FFFFFF'
        });
        menuText.setOrigin(0.5);

        // Button hover effect
        menuButton.on('pointerover', () => {
            menuButton.setFillStyle(0x666666, 0.8);
            menuButton.setScale(1.05);
        });

        menuButton.on('pointerout', () => {
            menuButton.setFillStyle(0x666666, 1);
            menuButton.setScale(1);
        });

        menuButton.on('pointerdown', () => {
            this.scene.start(SCENES.MENU);
        });

        // Keyboard shortcuts
        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.start(SCENES.GAME);
        });

        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start(SCENES.MENU);
        });

        console.log('💀 Game Over - Distance:', this.finalDistance, 'Squad:', this.finalSquadSize);
    }
}
