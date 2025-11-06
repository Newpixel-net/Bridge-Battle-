import Phaser from 'phaser';
import { GAME } from './utils/GameConstants.js';
import BootScene from './scenes/BootScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import GameScene from './scenes/GameScene.js';

/**
 * Phaser 3 Game Configuration
 * Phase 1: Foundation REBUILD - Portrait 540x960
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

    // Scene order - Only Boot, Preload, Game for Phase 1
    scene: [
        BootScene,
        PreloadScene,
        GameScene
    ]
};

export default config;
