import Phaser from 'phaser';
import { GAME } from './utils/GameConstants.js';
import BootScene from './scenes/BootScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import GameSceneNew from './scenes/GameSceneNew.js';
import UIScene from './scenes/UIScene.js';

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: GAME.WIDTH,
    height: GAME.HEIGHT,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: GAME.PHYSICS,
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    render: {
        pixelArt: false,
        antialias: true
    },
    fps: {
        target: GAME.TARGET_FPS,
        forceSetTimeOut: true
    },
    scene: [
        BootScene,
        PreloadScene,
        GameSceneNew,
        UIScene
    ]
};

export default config;
