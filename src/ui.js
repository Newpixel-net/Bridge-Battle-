// UI management for HUD, menus, and visual feedback

class UIManager {
    constructor() {
        this.score = 0;
        this.level = 1;
        this.squadSize = 5;

        this.scoreElement = document.getElementById('score');
        this.levelElement = document.getElementById('level');
        this.squadCountElement = document.getElementById('squadCount');
        this.squadCounterElement = document.getElementById('squadCounter');

        this.startScreen = document.getElementById('startScreen');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.finalScoreElement = document.getElementById('finalScore');
        this.loadingElement = document.getElementById('loading');

        this.damageNumbers = [];
    }

    // Show loading screen
    showLoading() {
        if (this.loadingElement) {
            this.loadingElement.style.display = 'block';
        }
    }

    // Hide loading screen
    hideLoading() {
        if (this.loadingElement) {
            this.loadingElement.style.display = 'none';
        }
    }

    // Show start screen
    showStartScreen() {
        this.startScreen.classList.remove('hidden');
        this.gameOverScreen.classList.remove('visible');
    }

    // Hide start screen
    hideStartScreen() {
        this.startScreen.classList.add('hidden');
    }

    // Show game over screen
    showGameOver(finalScore) {
        this.finalScoreElement.textContent = `Score: ${Utils.formatScore(finalScore)}`;
        this.gameOverScreen.classList.add('visible');
    }

    // Hide game over screen
    hideGameOver() {
        this.gameOverScreen.classList.remove('visible');
    }

    // Update score display
    updateScore(score) {
        this.score = score;
        this.scoreElement.textContent = Utils.formatScore(score);
    }

    // Add to score
    addScore(points) {
        this.updateScore(this.score + points);
    }

    // Update level display
    updateLevel(level) {
        this.level = level;
        this.levelElement.textContent = `LEVEL ${level}`;
    }

    // Update squad size display with animation
    updateSquadSize(size, animated = true) {
        this.squadSize = size;
        this.squadCountElement.textContent = size;

        if (animated) {
            // Trigger pulse animation
            this.squadCounterElement.classList.remove('pulse');
            // Force reflow to restart animation
            void this.squadCounterElement.offsetWidth;
            this.squadCounterElement.classList.add('pulse');
        }
    }

    // Show damage number at world position
    showDamageNumber(x, y, z, damage, camera, renderer) {
        // Convert 3D position to screen coordinates
        const vector = new THREE.Vector3(x, y, z);
        vector.project(camera);

        const screenX = (vector.x * 0.5 + 0.5) * window.innerWidth;
        const screenY = (-vector.y * 0.5 + 0.5) * window.innerHeight;

        // Create damage number element
        const damageEl = document.createElement('div');
        damageEl.className = 'damage-number';
        damageEl.textContent = Math.ceil(damage);
        damageEl.style.left = screenX + 'px';
        damageEl.style.top = screenY + 'px';

        document.body.appendChild(damageEl);

        // Remove after animation completes
        setTimeout(() => {
            if (damageEl.parentNode) {
                damageEl.parentNode.removeChild(damageEl);
            }
        }, 1000);

        this.damageNumbers.push({
            element: damageEl,
            lifetime: 0,
            maxLifetime: 1.0
        });
    }

    // Show floating text at position (for gate effects, collectibles, etc.)
    showFloatingText(x, y, z, text, color, camera) {
        const vector = new THREE.Vector3(x, y, z);
        vector.project(camera);

        const screenX = (vector.x * 0.5 + 0.5) * window.innerWidth;
        const screenY = (-vector.y * 0.5 + 0.5) * window.innerHeight;

        const textEl = document.createElement('div');
        textEl.className = 'damage-number';
        textEl.textContent = text;
        textEl.style.left = screenX + 'px';
        textEl.style.top = screenY + 'px';
        textEl.style.color = color;
        textEl.style.fontSize = '64px';

        document.body.appendChild(textEl);

        setTimeout(() => {
            if (textEl.parentNode) {
                textEl.parentNode.removeChild(textEl);
            }
        }, 1000);
    }

    // Update damage numbers (clean up old ones)
    update(deltaTime) {
        this.damageNumbers = this.damageNumbers.filter(dn => {
            dn.lifetime += deltaTime;
            if (dn.lifetime >= dn.maxLifetime) {
                if (dn.element.parentNode) {
                    dn.element.parentNode.removeChild(dn.element);
                }
                return false;
            }
            return true;
        });
    }

    // Reset UI to initial state
    reset() {
        this.updateScore(0);
        this.updateLevel(1);
        this.updateSquadSize(5, false);
        this.hideGameOver();

        // Clean up any remaining damage numbers
        this.damageNumbers.forEach(dn => {
            if (dn.element.parentNode) {
                dn.element.parentNode.removeChild(dn.element);
            }
        });
        this.damageNumbers = [];
    }

    // Setup button event listeners
    setupButtons(onStart, onRestart) {
        const startButton = document.getElementById('startButton');
        const restartButton = document.getElementById('restartButton');

        if (startButton) {
            startButton.addEventListener('click', onStart);
        }

        if (restartButton) {
            restartButton.addEventListener('click', onRestart);
        }
    }
}
