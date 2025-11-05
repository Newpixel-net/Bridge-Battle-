/**
 * BulletEffects - Enhanced bullet rendering with trails and glow
 * Makes bullets look like glowing projectiles with light trails
 */

import * as THREE from 'three';

/**
 * Bullet trail - follows behind bullet
 */
class BulletTrail {
    constructor(scene) {
        this.scene = scene;
        this.points = [];
        this.maxPoints = 8;
        this.line = null;
        this.active = false;
        this.color = new THREE.Color(0xFFFF00);
    }

    /**
     * Initialize trail for a bullet
     */
    init(position, color) {
        this.points = [];
        this.color.set(color);
        this.active = true;

        // Add initial point
        this.points.push(position.clone());

        // Create line geometry
        this.createLine();
    }

    /**
     * Create the line mesh for the trail
     */
    createLine() {
        // Properly dispose of existing line to prevent memory leak
        if (this.line) {
            this.scene.remove(this.line);
            if (this.line.geometry) this.line.geometry.dispose();
            if (this.line.material) this.line.material.dispose();
            this.line = null;
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(this.points);

        const material = new THREE.LineBasicMaterial({
            color: this.color,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            linewidth: 2
        });

        this.line = new THREE.Line(geometry, material);
        this.scene.add(this.line);
    }

    /**
     * Add a point to the trail
     */
    addPoint(position) {
        if (!this.active) return;

        this.points.push(position.clone());

        // Limit trail length
        if (this.points.length > this.maxPoints) {
            this.points.shift();
        }

        // Update line geometry
        if (this.line) {
            this.line.geometry.setFromPoints(this.points);
            this.line.geometry.attributes.position.needsUpdate = true;

            // Fade out trail
            const alpha = 0.8 * (this.points.length / this.maxPoints);
            this.line.material.opacity = alpha;
        }
    }

    /**
     * Clear the trail
     */
    clear() {
        this.active = false;
        if (this.line) {
            this.scene.remove(this.line);
            this.line.geometry.dispose();
            this.line.material.dispose();
            this.line = null;
        }
        this.points = [];
    }
}

/**
 * Enhanced bullet with glow and trail
 */
export class EnhancedBullet {
    constructor(scene, particleManager) {
        this.scene = scene;
        this.particleManager = particleManager;

        // Bullet mesh (glowing sphere)
        const geometry = new THREE.SphereGeometry(0.15, 8, 8);

        // Color based on squad size (will be updated)
        this.baseColor = 0xFFFF00; // Yellow by default

        const material = new THREE.MeshStandardMaterial({
            color: this.baseColor,
            emissive: this.baseColor,
            emissiveIntensity: 1.0,
            transparent: true,
            opacity: 1.0,
            metalness: 0.0,
            roughness: 0.5
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.visible = false;
        this.scene.add(this.mesh);

        // Point light for glow effect
        this.light = new THREE.PointLight(this.baseColor, 0.5, 5);
        this.light.visible = false;
        this.scene.add(this.light);

        // Trail
        this.trail = new BulletTrail(scene);

        // State
        this.active = false;
        this.position = new THREE.Vector3();
        this.velocity = new THREE.Vector3();
        this.lifetime = 0;
        this.maxLifetime = 3.0;
        this.trailCounter = 0;
        this.trailInterval = 0.02; // Add trail point every 0.02 seconds
    }

    /**
     * Fire bullet with enhanced visuals
     */
    fire(x, y, z, vx, vy, vz, color = null) {
        this.active = true;
        this.position.set(x, y, z);
        this.velocity.set(vx, vy, vz);
        this.lifetime = 0;
        this.trailCounter = 0;

        // Update color if provided
        if (color !== null) {
            this.baseColor = color;
            this.mesh.material.color.set(color);
            this.mesh.material.emissive.set(color);
            this.light.color.set(color);
        }

        // Show mesh and light
        this.mesh.visible = true;
        this.mesh.position.copy(this.position);
        this.light.visible = true;
        this.light.position.copy(this.position);

        // Initialize trail
        this.trail.init(this.position, this.baseColor);
    }

    /**
     * Update bullet
     */
    update(deltaTime) {
        if (!this.active) return;

        // Update lifetime
        this.lifetime += deltaTime;
        if (this.lifetime >= this.maxLifetime) {
            this.deactivate();
            return;
        }

        // Update position
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
        this.mesh.position.copy(this.position);
        this.light.position.copy(this.position);

        // Update trail
        this.trailCounter += deltaTime;
        if (this.trailCounter >= this.trailInterval) {
            this.trail.addPoint(this.position);
            this.trailCounter = 0;
        }

        // Pulse effect
        const pulseSpeed = 10;
        const pulse = Math.sin(this.lifetime * pulseSpeed) * 0.3 + 0.7;
        this.mesh.material.opacity = pulse;
        this.light.intensity = pulse * 0.5;
    }

    /**
     * Get current position
     */
    getPosition() {
        return this.position;
    }

    /**
     * Check if bullet hit something
     */
    checkCollision(targetPos, radius) {
        if (!this.active) return false;
        return this.position.distanceTo(targetPos) < radius;
    }

    /**
     * Deactivate bullet (on hit or timeout)
     */
    deactivate() {
        this.active = false;
        this.mesh.visible = false;
        this.light.visible = false;
        this.trail.clear();
    }

    /**
     * Create impact effect at current position
     */
    createImpact() {
        if (this.particleManager) {
            const direction = this.velocity.clone().normalize();
            this.particleManager.impact(
                this.position.x,
                this.position.y,
                this.position.z,
                direction
            );
        }
    }

    /**
     * Clean up resources
     */
    dispose() {
        this.scene.remove(this.mesh);
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();

        this.scene.remove(this.light);
        this.trail.clear();
    }
}

/**
 * Bullet color manager - changes color based on squad size
 */
export class BulletColorManager {
    constructor() {
        this.colors = [
            { threshold: 0, color: 0xFFFF00, name: 'Yellow' },     // 1-10 members
            { threshold: 10, color: 0x00FF00, name: 'Green' },     // 11-20 members
            { threshold: 20, color: 0x00FFFF, name: 'Cyan' },      // 21-30 members
            { threshold: 30, color: 0xFF00FF, name: 'Magenta' }    // 31+ members
        ];
    }

    /**
     * Get bullet color based on squad size
     */
    getColor(squadSize) {
        for (let i = this.colors.length - 1; i >= 0; i--) {
            if (squadSize >= this.colors[i].threshold) {
                return this.colors[i].color;
            }
        }
        return this.colors[0].color;
    }

    /**
     * Get color name for debugging
     */
    getColorName(squadSize) {
        for (let i = this.colors.length - 1; i >= 0; i--) {
            if (squadSize >= this.colors[i].threshold) {
                return this.colors[i].name;
            }
        }
        return this.colors[0].name;
    }
}

/**
 * Enhanced bullet pool manager
 */
export class EnhancedBulletPool {
    constructor(scene, particleManager, poolSize = 500) {
        this.scene = scene;
        this.particleManager = particleManager;
        this.pool = [];
        this.colorManager = new BulletColorManager();

        // Create pool
        for (let i = 0; i < poolSize; i++) {
            this.pool.push(new EnhancedBullet(scene, particleManager));
        }

        console.log(`✓ EnhancedBulletPool created: ${poolSize} enhanced bullets`);
    }

    /**
     * Get a bullet from the pool
     */
    getBullet() {
        for (let bullet of this.pool) {
            if (!bullet.active) {
                return bullet;
            }
        }
        return null; // Pool exhausted
    }

    /**
     * Fire a bullet with squad-size-based color
     */
    fire(x, y, z, vx, vy, vz, squadSize = 1) {
        const bullet = this.getBullet();
        if (bullet) {
            const color = this.colorManager.getColor(squadSize);
            bullet.fire(x, y, z, vx, vy, vz, color);
        }
        return bullet;
    }

    /**
     * Update all bullets
     */
    update(deltaTime) {
        let activeCount = 0;
        for (let bullet of this.pool) {
            if (bullet.active) {
                bullet.update(deltaTime);
                activeCount++;
            }
        }
        return activeCount;
    }

    /**
     * Check collisions with a target
     */
    checkCollisions(targetPos, radius, onHit) {
        const hits = [];
        for (let bullet of this.pool) {
            if (bullet.active && bullet.checkCollision(targetPos, radius)) {
                hits.push(bullet);
                bullet.createImpact();
                bullet.deactivate();
                if (onHit) onHit(bullet);
            }
        }
        return hits;
    }

    /**
     * Clean up all resources
     */
    dispose() {
        for (let bullet of this.pool) {
            bullet.dispose();
        }
        this.pool = [];
    }
}

export default EnhancedBulletPool;
