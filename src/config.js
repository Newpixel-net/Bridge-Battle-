import Phaser from 'phaser';
import { GAME } from './utils/GameConstants.js';
import BootScene from './scenes/BootScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import MenuScene from './scenes/MenuScene.js';
import CharacterSelectionScene from './scenes/CharacterSelectionScene.js';
import GameScene from './scenes/GameScene.js';
import GameOverScene from './scenes/GameOverScene.js';

/**
 * Phaser 3 Game Configuration
 * Phase 2: RESPONSIVE - Adapts to desktop and mobile
 */
const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: GAME.WIDTH,
    height: GAME.HEIGHT,

    // Responsive scale settings - fills screen properly
    scale: {
        mode: Phaser.Scale.FIT,           // Fit to container
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: 'game-container',
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

    // Scene order - Phase 2: Menu → Character Selection → Game → GameOver
    scene: [
        BootScene,
        PreloadScene,
        MenuScene,
        CharacterSelectionScene,
        GameScene,
        GameOverScene
    ]
};

export default config;
