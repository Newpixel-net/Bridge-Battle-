import Phaser from 'phaser';
import { SCENES, UI } from '../utils/Constants.js';

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.PRELOAD });
    }

    preload() {
        console.log('📦 Preloading assets...');

        // Create loading UI
        this.createLoadingUI();

        // Set up loading events
        this.load.on('progress', this.onProgress, this);
        this.load.on('complete', this.onComplete, this);

        // TODO: Load real sprites when available
        // this.load.atlas('squad-member', 'assets/sprites/squad-member@2x.png', 'assets/sprites/squad-member.json');

        // For now, we'll use placeholder graphics generated in create()
        // No actual files to load yet
    }

    create() {
        console.log('✅ Assets loaded');

        // Create placeholder textures
        this.createPlaceholderTextures();

        // Small delay before starting menu
        this.time.delayedCall(500, () => {
            this.scene.start(SCENES.MENU);
        });
    }

    createLoadingUI() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background
        const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

        // Title
        const title = this.add.text(width / 2, height / 3, '🌉 BRIDGE BATTLE', {
            fontSize: '84px',
            fontFamily: 'Arial',
            color: '#FFD700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        });
        title.setOrigin(0.5);

        // Loading bar background
        const barWidth = 600;
        const barHeight = 40;
        const barX = width / 2 - barWidth / 2;
        const barY = height / 2 + 100;

        this.loadingBarBg = this.add.rectangle(width / 2, barY, barWidth, barHeight, 0x444444);
        this.loadingBarBg.setOrigin(0.5);

        // Loading bar fill
        this.loadingBar = this.add.rectangle(barX, barY, 0, barHeight, 0xFFD700);
        this.loadingBar.setOrigin(0, 0.5);

        // Loading text
        this.loadingText = this.add.text(width / 2, barY + 60, 'Loading... 0%', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#FFFFFF'
        });
        this.loadingText.setOrigin(0.5);

        // Tip text
        const tip = this.add.text(width / 2, height - 100, 'TIP: Shoot gates to increase their value!', {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#AAAAAA',
            fontStyle: 'italic'
        });
        tip.setOrigin(0.5);
    }

    onProgress(progress) {
        const barWidth = 600;
        this.loadingBar.width = barWidth * progress;
        this.loadingText.setText(`Loading... ${Math.round(progress * 100)}%`);
    }

    onComplete() {
        this.loadingText.setText('Loading Complete!');
    }

    createPlaceholderTextures() {
        // Create placeholder graphics for game objects
        const graphics = this.add.graphics();

        // Squad member (soldier) - Green circle with gun
        graphics.fillStyle(0x44AA44);
        graphics.fillCircle(32, 32, 28);
        graphics.fillStyle(0x333333);
        graphics.fillRect(40, 28, 20, 8); // Gun
        graphics.generateTexture('placeholder-squad', 64, 64);
        graphics.clear();

        // Enemy - Red circle with angry face
        graphics.fillStyle(0xAA4444);
        graphics.fillCircle(32, 32, 28);
        graphics.fillStyle(0x000000);
        graphics.fillCircle(22, 26, 4); // Eye
        graphics.fillCircle(42, 26, 4); // Eye
        graphics.generateTexture('placeholder-enemy', 64, 64);
        graphics.clear();

        // Bullet - Yellow glowing circle
        graphics.fillStyle(0xFFD700);
        graphics.fillCircle(8, 8, 6);
        graphics.fillStyle(0xFFFFFF);
        graphics.fillCircle(8, 8, 3);
        graphics.generateTexture('placeholder-bullet', 16, 16);
        graphics.clear();

        // Obstacle (Tire) - Black circle with gray inside
        graphics.fillStyle(0x222222);
        graphics.fillCircle(64, 64, 60);
        graphics.fillStyle(0x666666);
        graphics.fillCircle(64, 64, 40);
        graphics.fillStyle(0x222222);
        graphics.fillCircle(64, 64, 20);
        graphics.generateTexture('placeholder-obstacle-tire', 128, 128);
        graphics.clear();

        // Crate - Brown box
        graphics.fillStyle(0x8B4513);
        graphics.fillRect(0, 0, 128, 128);
        graphics.lineStyle(4, 0x654321);
        graphics.strokeRect(2, 2, 124, 124);
        graphics.lineBetween(0, 64, 128, 64);
        graphics.lineBetween(64, 0, 64, 128);
        graphics.generateTexture('placeholder-obstacle-crate', 128, 128);
        graphics.clear();

        // Gate (positive) - Blue holographic
        graphics.fillStyle(0x0088FF, 0.3);
        graphics.fillRect(0, 0, 200, 300);
        graphics.lineStyle(4, 0x00AAFF);
        graphics.strokeRect(2, 2, 196, 296);
        graphics.generateTexture('placeholder-gate-positive', 200, 300);
        graphics.clear();

        // Gate (negative) - Red holographic
        graphics.fillStyle(0xFF4444, 0.3);
        graphics.fillRect(0, 0, 200, 300);
        graphics.lineStyle(4, 0xFF0000);
        graphics.strokeRect(2, 2, 196, 296);
        graphics.generateTexture('placeholder-gate-negative', 200, 300);
        graphics.clear();

        // Particle - Small white circle
        graphics.fillStyle(0xFFFFFF);
        graphics.fillCircle(4, 4, 3);
        graphics.generateTexture('placeholder-particle', 8, 8);
        graphics.clear();

        // Weapon pickup - Glowing cyan gun
        graphics.fillStyle(0x00FFFF, 0.5);
        graphics.fillCircle(32, 32, 30);
        graphics.fillStyle(0x00FFFF);
        graphics.fillRect(20, 28, 40, 8);
        graphics.fillRect(40, 20, 8, 24);
        graphics.generateTexture('placeholder-weapon', 64, 64);
        graphics.clear();

        graphics.destroy();

        console.log('✅ Placeholder textures created');
    }
}
