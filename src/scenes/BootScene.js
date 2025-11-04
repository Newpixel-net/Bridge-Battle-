import Phaser from 'phaser';
import { SCENES } from '../utils/GameConstants.js';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.BOOT });
    }

    preload() {
        // Create loading bar graphics
        this.createLoadingGraphics();
    }

    create() {
        console.log('🎮 Bridge Battle - Boot Scene');

        // Start preload scene
        this.scene.start(SCENES.PRELOAD);
    }

    createLoadingGraphics() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background
        const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x222222);

        // Title
        const title = this.add.text(width / 2, height / 2 - 100, 'BRIDGE BATTLE', {
            fontSize: '72px',
            fontFamily: 'Arial',
            color: '#FFD700',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);

        // Loading text
        const loading = this.add.text(width / 2, height / 2 + 50, 'Initializing...', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#FFFFFF'
        });
        loading.setOrigin(0.5);
    }
}
