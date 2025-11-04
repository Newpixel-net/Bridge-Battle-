import Phaser from 'phaser';
import { SCENES, UI } from '../utils/Constants.js';

export default class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.UI });
    }

    create() {
        console.log('🎨 UI Scene launched');

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Score display (top-left)
        this.scoreLabel = this.add.text(30, 30, 'SCORE', {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#AAAAAA'
        });

        this.scoreValue = this.add.text(30, 70, '0', {
            fontSize: '56px',
            fontFamily: 'Arial',
            color: '#FFD700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        });

        // Level display (top-right)
        this.levelLabel = this.add.text(width - 30, 30, 'LEVEL', {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#AAAAAA',
            align: 'right'
        });
        this.levelLabel.setOrigin(1, 0);

        this.levelValue = this.add.text(width - 30, 70, '1', {
            fontSize: '56px',
            fontFamily: 'Arial',
            color: '#00AAFF',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'right'
        });
        this.levelValue.setOrigin(1, 0);

        // Squad counter (bottom-center) - VERY LARGE
        const squadY = height - 120;

        this.squadIcon = this.add.text(width / 2 - 120, squadY, '👥', {
            fontSize: '80px'
        });
        this.squadIcon.setOrigin(0.5);

        this.squadCount = this.add.text(width / 2 + 20, squadY, '0', {
            fontSize: '96px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        });
        this.squadCount.setOrigin(0.5);

        // Squad counter background
        this.squadBg = this.add.rectangle(width / 2, squadY, 300, 120, 0x000000, 0.5);
        this.squadBg.setDepth(-1);

        // Initialize values
        this.score = 0;
        this.level = 1;
        this.squadSize = 0;

        // Listen for events from GameScene
        this.setupEvents();
    }

    setupEvents() {
        const gameScene = this.scene.get(SCENES.GAME);

        if (gameScene) {
            gameScene.events.on('scoreUpdate', this.updateScore, this);
            gameScene.events.on('squadUpdate', this.updateSquad, this);
            gameScene.events.on('levelUpdate', this.updateLevel, this);
        }
    }

    updateScore(score) {
        this.score = score;
        this.scoreValue.setText(score.toString());

        // Pulse animation
        this.tweens.add({
            targets: this.scoreValue,
            scale: { from: 1.2, to: 1 },
            duration: 200,
            ease: 'Back.easeOut'
        });
    }

    updateSquad(count) {
        const previous = this.squadSize;
        this.squadSize = count;
        this.squadCount.setText(count.toString());

        // Change color based on count
        let color = '#FFFFFF';
        if (count <= 2) color = '#FF4444'; // Danger
        else if (count <= 5) color = '#FFAA00'; // Warning
        else if (count >= 15) color = '#00FF00'; // Excellent

        this.squadCount.setColor(color);

        // Pulse animation
        this.tweens.add({
            targets: [this.squadCount, this.squadIcon],
            scale: { from: 1.2, to: 1 },
            duration: 300,
            ease: 'Back.easeOut'
        });

        // Shake if lost members
        if (count < previous) {
            this.cameras.main.shake(100, 0.005);
        }
    }

    updateLevel(level) {
        this.level = level;
        this.levelValue.setText(level.toString());

        // Flash animation
        this.tweens.add({
            targets: this.levelValue,
            alpha: { from: 0, to: 1 },
            scale: { from: 1.5, to: 1 },
            duration: 500,
            ease: 'Cubic.easeOut'
        });
    }

    shutdown() {
        // Clean up events
        const gameScene = this.scene.get(SCENES.GAME);
        if (gameScene) {
            gameScene.events.off('scoreUpdate', this.updateScore, this);
            gameScene.events.off('squadUpdate', this.updateSquad, this);
            gameScene.events.off('levelUpdate', this.updateLevel, this);
        }
    }
}
