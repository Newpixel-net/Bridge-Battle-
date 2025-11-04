import Phaser from 'phaser';
import config from './config.js';

// Hide loading screen when game is ready
function hideLoadingScreen() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.add('hidden');
        setTimeout(() => loading.style.display = 'none', 500);
    }
}

// Create the game
const game = new Phaser.Game(config);

// Hide loading screen after a short delay
setTimeout(hideLoadingScreen, 1000);

// Export for debugging
window.game = game;

export default game;
