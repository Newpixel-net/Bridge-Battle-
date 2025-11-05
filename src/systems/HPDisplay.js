/**
 * HPDisplay - Health point display system for obstacles
 * Shows large HP numbers on top of obstacles (like "100", "273", "284")
 */

import * as THREE from 'three';

/**
 * HP Display - canvas-based HP number that sits on obstacles
 */
export class HPDisplay {
    constructor(scene, initialHP, maxHP) {
        this.scene = scene;
        this.currentHP = initialHP;
        this.maxHP = maxHP;
        this.sprite = null;
        this.createSprite();
    }

    /**
     * Create the sprite with HP text
     */
    createSprite() {
        const canvas = this.createHPCanvas(this.currentHP, this.maxHP);
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;

        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: true,
            depthWrite: false
        });

        this.sprite = new THREE.Sprite(material);

        // Scale to be large and visible (2 units wide, 1 unit tall)
        this.sprite.scale.set(2, 1, 1);

        // Position above obstacle
        this.sprite.position.y = 2.5;

        return this.sprite;
    }

    /**
     * Create canvas with HP text and background
     */
    createHPCanvas(hp, maxHP) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        // Clear
        ctx.clearRect(0, 0, 256, 128);

        // Background (semi-transparent dark)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.roundRect(10, 20, 236, 88, 10);
        ctx.fill();

        // HP bar background (red)
        const barWidth = 216;
        const barHeight = 20;
        const barX = 20;
        const barY = 80;

        ctx.fillStyle = '#660000';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // HP bar foreground (green to red gradient based on HP%)
        const hpPercent = hp / maxHP;
        const filledWidth = barWidth * Math.max(0, Math.min(1, hpPercent));

        // Color based on HP percentage
        let barColor;
        if (hpPercent > 0.6) {
            barColor = '#00FF00';  // Green
        } else if (hpPercent > 0.3) {
            barColor = '#FFAA00';  // Orange
        } else {
            barColor = '#FF0000';  // Red
        }

        ctx.fillStyle = barColor;
        ctx.fillRect(barX, barY, filledWidth, barHeight);

        // HP bar border
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);

        // HP text (large, white, bold)
        const text = Math.floor(hp).toString();
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Black outline (thick)
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 6;
        ctx.strokeText(text, 128, 45);

        // White fill
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(text, 128, 45);

        return canvas;
    }

    /**
     * Update HP display
     */
    updateHP(newHP) {
        if (newHP === this.currentHP) return;

        this.currentHP = Math.max(0, newHP);

        // Recreate canvas with new HP
        const canvas = this.createHPCanvas(this.currentHP, this.maxHP);
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;

        // Update sprite material
        if (this.sprite && this.sprite.material) {
            if (this.sprite.material.map) {
                this.sprite.material.map.dispose();
            }
            this.sprite.material.map = texture;
            this.sprite.material.needsUpdate = true;
        }

        // Pulse effect when damaged
        if (newHP < this.currentHP) {
            this.pulseEffect();
        }
    }

    /**
     * Pulse effect when taking damage
     */
    pulseEffect() {
        if (!this.sprite) return;

        const originalScale = this.sprite.scale.clone();
        const targetScale = originalScale.clone().multiplyScalar(1.3);

        const startTime = Date.now();
        const duration = 200;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out
            const t = 1 - Math.pow(1 - progress, 3);

            this.sprite.scale.lerpVectors(targetScale, originalScale, t);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    /**
     * Set position (relative to parent)
     */
    setPosition(x, y, z) {
        if (this.sprite) {
            this.sprite.position.set(x, y, z);
        }
    }

    /**
     * Show/hide
     */
    setVisible(visible) {
        if (this.sprite) {
            this.sprite.visible = visible;
        }
    }

    /**
     * Clean up resources
     */
    dispose() {
        if (this.sprite) {
            if (this.sprite.material.map) {
                this.sprite.material.map.dispose();
            }
            this.sprite.material.dispose();
            this.sprite = null;
        }
    }
}

/**
 * Weapon pickup display
 */
export class WeaponPickup {
    constructor(scene, weaponType = 'rifle') {
        this.scene = scene;
        this.weaponType = weaponType;
        this.group = new THREE.Group();
        this.createPickup();
    }

    createPickup() {
        // Create glowing weapon icon/model
        const geometry = new THREE.BoxGeometry(0.6, 0.2, 1.2);

        // Cyan glowing material
        const material = new THREE.MeshStandardMaterial({
            color: 0x00FFFF,
            emissive: 0x00FFFF,
            emissiveIntensity: 0.8,
            metalness: 0.8,
            roughness: 0.2
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.rotation.x = Math.PI / 4; // Tilt for visibility
        this.group.add(this.mesh);

        // Add point light for glow
        this.light = new THREE.PointLight(0x00FFFF, 1.0, 5);
        this.light.position.y = 0.5;
        this.group.add(this.light);

        // Add rotating glow ring
        const ringGeometry = new THREE.TorusGeometry(0.8, 0.1, 8, 16);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0x00FFFF,
            transparent: true,
            opacity: 0.6
        });

        this.ring = new THREE.Mesh(ringGeometry, ringMaterial);
        this.ring.rotation.x = Math.PI / 2;
        this.ring.position.y = -0.5;
        this.group.add(this.ring);

        // Start time for animation
        this.startTime = Date.now();
    }

    /**
     * Update animation (bobbing and rotating)
     */
    update() {
        const elapsed = (Date.now() - this.startTime) / 1000;

        // Bob up and down
        const bobHeight = Math.sin(elapsed * 2) * 0.3;
        this.mesh.position.y = bobHeight;

        // Rotate
        this.mesh.rotation.y = elapsed * 2;
        this.ring.rotation.z = elapsed * 3;

        // Pulse light
        const pulse = Math.sin(elapsed * 4) * 0.3 + 0.7;
        this.light.intensity = pulse;
    }

    /**
     * Clean up
     */
    dispose() {
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
        this.ring.geometry.dispose();
        this.ring.material.dispose();
    }
}

export default HPDisplay;
