import Phaser from 'phaser';
import { GAME, COLORS, SCENES } from '../utils/GameConstants.js';

/**
 * MenuScene - Phase 2
 * Main menu with start button
 */
export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.MENU });
    }

    create() {
        const centerX = GAME.WIDTH / 2;
        const centerY = GAME.HEIGHT / 2;

        // Background gradient (sky blue to lighter blue)
        const bg = this.add.rectangle(centerX, centerY, GAME.WIDTH, GAME.HEIGHT, COLORS.SKY_BLUE);

        // Title
        const title = this.add.text(centerX, 200, 'BRIDGE\nBATTLE', {
            fontSize: '72px',
            fontFamily: 'Arial Black',
            color: '#FFFFFF',
            stroke: COLORS.SQUAD_BLUE_DARK,
            strokeThickness: 10,
            align: 'center'
        });
        title.setOrigin(0.5);

        // Title animation
        this.tweens.add({
            targets: title,
            y: 190,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Subtitle
        this.add.text(centerX, 350, 'Crowd Runner', {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Start button
        const startButton = this.add.rectangle(centerX, centerY + 100, 350, 90, COLORS.GATE_GOOD);
        startButton.setStrokeStyle(6, 0xFFFFFF);
        startButton.setInteractive({ useHandCursor: true });

        const startText = this.add.text(centerX, centerY + 100, 'START GAME', {
            fontSize: '42px',
            fontFamily: 'Arial Black',
            color: '#FFFFFF'
        });
        startText.setOrigin(0.5);

        // Button hover effect
        startButton.on('pointerover', () => {
            startButton.setFillStyle(COLORS.GATE_GOOD);
            startButton.setScale(1.08);
            startText.setScale(1.08);

            this.tweens.add({
                targets: [startButton, startText],
                scale: 1.1,
                duration: 100,
                ease: 'Back.easeOut'
            });
        });

        startButton.on('pointerout', () => {
            this.tweens.add({
                targets: [startButton, startText],
                scale: 1,
                duration: 100
            });
        });

        startButton.on('pointerdown', () => {
            // Flash effect
            this.cameras.main.flash(200, 255, 255, 255);

            this.time.delayedCall(200, () => {
                this.scene.start(SCENES.CHARACTER_SELECTION);
            });
        });

        // Instructions
        const instructions = [
            'Drag to move left/right',
            'Collect green spheres (+1)',
            'Avoid red obstacles (-5)',
            'Choose gates wisely!'
        ];

        let instructionY = centerY + 250;
        instructions.forEach(text => {
            this.add.text(centerX, instructionY, text, {
                fontSize: '20px',
                fontFamily: 'Arial',
                color: '#FFFFFF',
                stroke: '#000000',
                strokeThickness: 3
            }).setOrigin(0.5);
            instructionY += 35;
        });

        // Version info
        this.add.text(centerX, GAME.HEIGHT - 30, 'Phase 2: Enhanced Gameplay', {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            alpha: 0.7
        }).setOrigin(0.5);

        // Keyboard shortcut
        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.start(SCENES.CHARACTER_SELECTION);
        });

        console.log('🎮 Menu Scene Ready');
    }
}
