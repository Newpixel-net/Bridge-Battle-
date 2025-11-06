import Phaser from 'phaser';
import config from './config.js';

/**
 * Bridge Battle - Main Entry Point
 * Phase 1: Foundation
 *
 * AAA-Quality Crowd Runner × Auto-Shooter
 */

// Hide loading screen when game is ready
function hideLoadingScreen() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.add('hidden');
        setTimeout(() => {
            loading.style.display = 'none';
        }, 500);
    }
}

// Create the Phaser game instance
console.log('🎮 Bridge Battle - Starting...');
console.log('📖 Phase 1: Foundation');
console.log('   ✓ Squad Movement & Formation');
console.log('   ✓ Camera Following');
console.log('   ✓ Input Controls');
console.log('   ✓ Bridge Environment');

const game = new Phaser.Game(config);

// Hide loading screen after a short delay
setTimeout(hideLoadingScreen, 1000);

// Export for debugging
window.game = game;

// Development helpers
if (process.env.NODE_ENV === 'development') {
    window.debug = {
        game: game,
        getScene: (key) => game.scene.getScene(key),
        fps: () => Math.round(game.loop.actualFps),
    };
    console.log('🔧 Debug mode enabled - Access via window.debug');
}

export default game;
