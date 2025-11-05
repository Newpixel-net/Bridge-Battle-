/**
 * DamageNumbers - Floating damage number system for visual feedback
 * Shows large, golden numbers that float upward and fade
 */

import * as THREE from 'three';

/**
 * Single damage number instance
 */
class DamageNumber {
    constructor(scene) {
        this.scene = scene;
        this.active = false;
        this.sprite = null;
        this.value = 0;
        this.position = new THREE.Vector3();
        this.velocity = new THREE.Vector3();
        this.life = 0;
        this.maxLife = 1.5;
        this.scale = 1.0;
    }

    /**
     * Create the sprite for this damage number
     */
    createSprite(value, x, y, z) {
        this.value = value;
        this.position.set(x, y, z);
        this.life = this.maxLife;
        this.active = true;

        // Random upward velocity with slight horizontal spread
        this.velocity.set(
            (Math.random() - 0.5) * 2,
            3 + Math.random() * 2,
            (Math.random() - 0.5) * 2
        );

        // Create canvas texture for the number
        const canvas = this.createNumberCanvas(value);
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;

        // Create sprite material
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false,
            depthWrite: false
        });

        // Create sprite
        this.sprite = new THREE.Sprite(material);

        // Scale based on number size (larger numbers = larger display)
        const baseScale = 2.0;
        const valueScale = Math.log10(Math.max(value, 1)) * 0.5 + 1;
        this.scale = baseScale * valueScale;

        this.sprite.scale.set(this.scale, this.scale * 0.5, 1);
        this.sprite.position.copy(this.position);

        // Add to scene
        this.scene.add(this.sprite);

        // Pop-in animation (scale from 0 to full)
        this.animationPhase = 0;
    }

    /**
     * Create canvas with damage number text
     */
    createNumberCanvas(value) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        // Clear canvas
        ctx.clearRect(0, 0, 256, 128);

        // Draw text with outline
        const text = Math.floor(value).toString();
        ctx.font = 'bold 80px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Black outline (thick)
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 8;
        ctx.strokeText(text, 128, 64);

        // Golden fill with gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, 128);
        gradient.addColorStop(0, '#FFD700');    // Gold
        gradient.addColorStop(0.5, '#FFED4E');  // Light gold
        gradient.addColorStop(1, '#FFA500');    // Orange-gold

        ctx.fillStyle = gradient;
        ctx.fillText(text, 128, 64);

        return canvas;
    }

    /**
     * Update damage number animation
     */
    update(deltaTime) {
        if (!this.active) return;

        this.life -= deltaTime;
        if (this.life <= 0) {
            this.cleanup();
            return;
        }

        // Animation phase (0 to 1)
        this.animationPhase = Math.min(1, this.animationPhase + deltaTime * 5);

        // Update position
        this.velocity.y -= 5 * deltaTime; // Gravity
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
        this.sprite.position.copy(this.position);

        // Scale animation (pop in, then shrink)
        let currentScale = this.scale;
        if (this.animationPhase < 0.2) {
            // Pop in
            const t = this.animationPhase / 0.2;
            currentScale = this.scale * this.easeOutBack(t);
        } else {
            // Slowly shrink
            const shrinkFactor = 1 - ((this.animationPhase - 0.2) * 0.3);
            currentScale = this.scale * Math.max(0.5, shrinkFactor);
        }

        this.sprite.scale.set(currentScale, currentScale * 0.5, 1);

        // Fade out in last 0.5 seconds
        const fadeTime = 0.5;
        if (this.life < fadeTime) {
            const alpha = this.life / fadeTime;
            this.sprite.material.opacity = alpha;
        } else {
            this.sprite.material.opacity = 1.0;
        }
    }

    /**
     * Ease out back easing for pop effect
     */
    easeOutBack(t) {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }

    /**
     * Clean up sprite
     */
    cleanup() {
        this.active = false;
        if (this.sprite) {
            this.scene.remove(this.sprite);
            if (this.sprite.material.map) {
                this.sprite.material.map.dispose();
            }
            this.sprite.material.dispose();
            this.sprite = null;
        }
    }
}

/**
 * Damage number manager - handles pool of damage numbers
 */
export class DamageNumberManager {
    constructor(scene, poolSize = 100) {
        this.scene = scene;
        this.pool = [];
        this.active = [];

        // Create pool
        for (let i = 0; i < poolSize; i++) {
            this.pool.push(new DamageNumber(scene));
        }

        console.log(`✓ DamageNumberManager created: ${poolSize} damage numbers`);
    }

    /**
     * Show a damage number at position
     */
    show(value, x, y, z) {
        // Get from pool or create new
        let damageNum = null;

        // Try to reuse from pool
        if (this.pool.length > 0) {
            damageNum = this.pool.pop();
        } else {
            // Pool exhausted, create new
            damageNum = new DamageNumber(this.scene);
        }

        damageNum.createSprite(value, x, y, z);
        this.active.push(damageNum);

        return damageNum;
    }

    /**
     * Show critical damage (larger, different color)
     */
    showCritical(value, x, y, z) {
        const damageNum = this.show(value, x, y, z);
        if (damageNum && damageNum.sprite) {
            // Make critical hits bigger and redder
            damageNum.scale *= 1.5;
            damageNum.sprite.scale.multiplyScalar(1.5);

            // Could change color here if we want
            // For now, size difference is enough
        }
        return damageNum;
    }

    /**
     * Update all active damage numbers
     */
    update(deltaTime) {
        for (let i = this.active.length - 1; i >= 0; i--) {
            const damageNum = this.active[i];
            damageNum.update(deltaTime);

            if (!damageNum.active) {
                // Return to pool
                this.active.splice(i, 1);
                this.pool.push(damageNum);
            }
        }

        return this.active.length;
    }

    /**
     * Clean up all resources
     */
    dispose() {
        // Clean up active numbers
        for (let damageNum of this.active) {
            damageNum.cleanup();
        }

        // Clean up pool
        for (let damageNum of this.pool) {
            damageNum.cleanup();
        }

        this.active = [];
        this.pool = [];
    }
}

export default DamageNumberManager;
