import Phaser from 'phaser';
import { SCENES, UI, COLORS } from '../utils/Constants.js';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.MENU });
    }

    create() {
        console.log('🏠 Menu Scene');

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background gradient
        this.cameras.main.setBackgroundColor('#1a1a2e');

        // Title
        const title = this.add.text(width / 2, height / 4, '🌉 BRIDGE BATTLE', {
            fontSize: '96px',
            fontFamily: 'Arial',
            color: '#FFD700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 8
        });
        title.setOrigin(0.5);

        // Subtitle
        const subtitle = this.add.text(width / 2, height / 4 + 100, 'Squad Shooter Runner', {
            fontSize: '40px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            fontStyle: 'italic'
        });
        subtitle.setOrigin(0.5);

        // Play button
        this.createButton(
            width / 2,
            height / 2 + 100,
            '▶  START GAME',
            () => this.startGame()
        );

        // Instructions
        const instructions = [
            'CONTROLS:',
            '• Mouse/Touch: Drag to move squad',
            '• Squad shoots automatically',
            '• Avoid negative gates or shoot them!',
            '• Collect squad members from + gates',
            '• Destroy all obstacles!',
        ];

        const instructionY = height / 2 + 220;
        instructions.forEach((text, index) => {
            const line = this.add.text(width / 2, instructionY + (index * 35), text, {
                fontSize: index === 0 ? '32px' : '24px',
                fontFamily: 'Arial',
                color: index === 0 ? '#FFD700' : '#CCCCCC',
                fontStyle: index === 0 ? 'bold' : 'normal'
            });
            line.setOrigin(0.5);
        });

        // Version
        const version = this.add.text(20, height - 30, 'v1.0.0 | Placeholder Graphics Mode', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#888888'
        });

        // Animate title
        this.tweens.add({
            targets: title,
            scale: { from: 1, to: 1.05 },
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    createButton(x, y, text, callback) {
        // Button background
        const bg = this.add.rectangle(x, y, 400, 80, 0x4CAF50);
        bg.setInteractive({ useHandCursor: true });
        bg.setStrokeStyle(4, 0x45a049);

        // Button text
        const label = this.add.text(x, y, text, {
            fontSize: '42px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            fontStyle: 'bold'
        });
        label.setOrigin(0.5);

        // Hover effects
        bg.on('pointerover', () => {
            bg.setFillStyle(0x5CBF60);
            this.tweens.add({
                targets: [bg, label],
                scale: 1.05,
                duration: 100
            });
        });

        bg.on('pointerout', () => {
            bg.setFillStyle(0x4CAF50);
            this.tweens.add({
                targets: [bg, label],
                scale: 1.0,
                duration: 100
            });
        });

        bg.on('pointerdown', () => {
            bg.setFillStyle(0x45a049);
            this.tweens.add({
                targets: [bg, label],
                scale: 0.95,
                duration: 50,
                yoyo: true,
                onComplete: callback
            });
        });

        return { bg, label };
    }

    startGame() {
        console.log('🎮 Starting game...');

        // Start game scene and UI scene
        this.scene.start(SCENES.GAME);
        this.scene.launch(SCENES.UI);
    }
}
