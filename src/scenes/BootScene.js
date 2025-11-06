import Phaser from 'phaser';
import { SCENES } from '../utils/GameConstants.js';

/**
 * BootScene - Initial scene
 * Handles basic setup before asset loading
 */
export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.BOOT });
    }

    preload() {
        console.log('🚀 BootScene: Starting game...');
    }

    create() {
        console.log('✓ BootScene: Complete');

        // Move to preload scene
        this.scene.start(SCENES.PRELOAD);
    }
}
