import Phaser from 'phaser';
import { GAME } from './utils/GameConstants.js';
import BootScene from './scenes/BootScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import GameOverScene from './scenes/GameOverScene.js';

/**
 * Phaser 3 Game Configuration
 * Phase 2: Enhanced Gameplay - Menu + Game Over + Effects
 */
const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: GAME.WIDTH,   // 540 (portrait)
    height: GAME.HEIGHT,  // 960 (portrait)

    // Scale settings for mobile + desktop
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: GAME.WIDTH,
        height: GAME.HEIGHT
    },

    // Physics configuration
    physics: {
        default: GAME.PHYSICS,
        arcade: {
            gravity: { y: 0 },
            debug: false  // Set to true for development
        }
    },

    // Rendering
    render: {
        pixelArt: false,
        antialias: true,
        roundPixels: false
    },

    // FPS target
    fps: {
        target: GAME.TARGET_FPS,
        forceSetTimeOut: false
    },

    // Scene order - Phase 2: Menu → Game → GameOver
    scene: [
        BootScene,
        PreloadScene,
        MenuScene,
        GameScene,
        GameOverScene
    ]
};

export default config;
