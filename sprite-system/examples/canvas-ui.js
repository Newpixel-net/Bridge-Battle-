/**
 * Canvas UI Example
 *
 * Demonstrates how to create dynamic UI elements using canvas sprites.
 */

import * as THREE from 'three';
import { CanvasSpriteRenderer } from '../src/index.js';

export function createGameUI(scene) {
    const canvasRenderer = new CanvasSpriteRenderer({
        renderEngine: THREE
    });

    // Create score display
    const scoreDisplay = canvasRenderer.createTextSprite('Score: 0', {
        fontSize: 32,
        color: '#FFD700',
        fontWeight: 'bold',
        stroke: {
            color: '#000000',
            width: 3
        },
        shadow: {
            color: '#000000',
            blur: 4,
            offsetX: 2,
            offsetY: 2
        }
    });
    scoreDisplay.sprite.position.set(0, 5, 0);
    scene.add(scoreDisplay.sprite);

    // Create health bar
    const healthBar = canvasRenderer.createProgressBarSprite(1.0, {
        width: 200,
        height: 20,
        fillColor: '#00FF00',
        backgroundColor: '#333333',
        borderColor: '#FFFFFF',
        borderWidth: 2
    });
    healthBar.sprite.position.set(0, 4.5, 0);
    scene.add(healthBar.sprite);

    // Create combo counter
    const comboDisplay = canvasRenderer.createTextSprite('', {
        fontSize: 48,
        color: '#FF6600',
        fontWeight: 'bold'
    });
    comboDisplay.sprite.position.set(0, 3.5, 0);
    comboDisplay.sprite.visible = false;
    scene.add(comboDisplay.sprite);

    // State
    let score = 0;
    let health = 100;
    let combo = 0;
    let comboTimer = 0;

    return {
        // Update score
        addScore(points) {
            score += points;
            scoreDisplay.update((ctx, canvas) => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.font = 'bold 32px Arial';
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 3;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                const text = `Score: ${score}`;
                ctx.strokeText(text, canvas.width / 2, canvas.height / 2);
                ctx.fillStyle = '#FFD700';
                ctx.fillText(text, canvas.width / 2, canvas.height / 2);
            });
        },

        // Update health
        setHealth(value) {
            health = Math.max(0, Math.min(100, value));
            healthBar.updateValue(health / 100);

            // Change color based on health
            const color = health > 60 ? '#00FF00' :
                         health > 30 ? '#FFFF00' :
                         '#FF0000';

            const ctx = healthBar.canvas.getContext('2d');
            ctx.clearRect(0, 0, healthBar.canvas.width, healthBar.canvas.height);

            // Background
            ctx.fillStyle = '#333333';
            ctx.fillRect(0, 0, healthBar.canvas.width, healthBar.canvas.height);

            // Fill
            const fillWidth = healthBar.canvas.width * (health / 100);
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, fillWidth, healthBar.canvas.height);

            // Border
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.strokeRect(1, 1, healthBar.canvas.width - 2, healthBar.canvas.height - 2);

            healthBar.texture.needsUpdate = true;
        },

        // Update combo
        addCombo() {
            combo++;
            comboTimer = 2; // Show for 2 seconds

            comboDisplay.sprite.visible = true;
            comboDisplay.update((ctx, canvas) => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.font = 'bold 48px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                const text = `${combo}x COMBO!`;
                ctx.fillStyle = '#FF6600';
                ctx.fillText(text, canvas.width / 2, canvas.height / 2);
            });
        },

        // Reset combo
        resetCombo() {
            combo = 0;
            comboDisplay.sprite.visible = false;
        },

        // Update (call every frame)
        update(deltaTime) {
            if (comboTimer > 0) {
                comboTimer -= deltaTime;
                if (comboTimer <= 0) {
                    this.resetCombo();
                }
            }
        },

        // Cleanup
        cleanup() {
            scoreDisplay.dispose();
            healthBar.dispose();
            comboDisplay.dispose();
        }
    };
}

// Usage example:
/*
const ui = createGameUI(scene);

// In game loop
function animate() {
    const deltaTime = clock.getDelta();
    ui.update(deltaTime);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

// Game events
ui.addScore(100);
ui.setHealth(75);
ui.addCombo();
*/
