/**
 * ParticleSystem - High-performance particle effects for Three.js
 * Handles explosions, impacts, and visual effects
 */

import * as THREE from 'three';

/**
 * Single particle in the system
 */
class Particle {
    constructor() {
        this.position = new THREE.Vector3();
        this.velocity = new THREE.Vector3();
        this.acceleration = new THREE.Vector3();
        this.color = new THREE.Color();
        this.size = 1.0;
        this.life = 1.0;
        this.maxLife = 1.0;
        this.active = false;
        this.fadeRate = 1.0;
        this.sizeDecay = 1.0;
        this.index = 0;
    }

    init(x, y, z, vx, vy, vz, color, size, life) {
        this.position.set(x, y, z);
        this.velocity.set(vx, vy, vz);
        this.acceleration.set(0, -9.8, 0); // Gravity
        this.color.set(color);
        this.size = size;
        this.life = life;
        this.maxLife = life;
        this.active = true;
        this.fadeRate = 1.0 / life;
        this.sizeDecay = 0.95;
    }

    update(deltaTime) {
        if (!this.active) return;

        // Physics
        this.velocity.add(this.acceleration.clone().multiplyScalar(deltaTime));
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));

        // Life decay
        this.life -= deltaTime;
        if (this.life <= 0) {
            this.active = false;
            return;
        }

        // Size decay
        this.size *= Math.pow(this.sizeDecay, deltaTime * 60);

        // Ensure size doesn't go negative
        if (this.size < 0.01) {
            this.active = false;
        }
    }

    getAlpha() {
        return Math.max(0, Math.min(1, this.life / this.maxLife));
    }
}

/**
 * Particle emitter - manages a pool of particles
 */
export class ParticleEmitter {
    constructor(scene, maxParticles = 1000) {
        this.scene = scene;
        this.maxParticles = maxParticles;
        this.particles = [];

        // Create particle pool
        for (let i = 0; i < maxParticles; i++) {
            const particle = new Particle();
            particle.index = i;
            this.particles.push(particle);
        }

        // Create particle geometry
        this.geometry = new THREE.BufferGeometry();

        // Attributes for particle system
        this.positions = new Float32Array(maxParticles * 3);
        this.colors = new Float32Array(maxParticles * 3);
        this.sizes = new Float32Array(maxParticles);
        this.alphas = new Float32Array(maxParticles);

        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
        this.geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1));
        this.geometry.setAttribute('alpha', new THREE.BufferAttribute(this.alphas, 1));

        // Create particle material with custom shader
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                pointTexture: { value: this.createParticleTexture() }
            },
            vertexShader: `
                attribute float size;
                attribute float alpha;
                attribute vec3 color;
                varying vec3 vColor;
                varying float vAlpha;

                void main() {
                    vColor = color;
                    vAlpha = alpha;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform sampler2D pointTexture;
                varying vec3 vColor;
                varying float vAlpha;

                void main() {
                    vec4 texColor = texture2D(pointTexture, gl_PointCoord);
                    gl_FragColor = vec4(vColor, vAlpha * texColor.a);
                }
            `,
            blending: THREE.AdditiveBlending,
            depthTest: true,
            depthWrite: false,
            transparent: true,
            vertexColors: true
        });

        // Create particle system
        this.particleSystem = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.particleSystem);

        console.log(`✓ ParticleEmitter created: ${maxParticles} particles`);
    }

    /**
     * Create a circular particle texture
     */
    createParticleTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        // Draw circular gradient
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);

        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    /**
     * Emit a single particle
     */
    emit(x, y, z, vx, vy, vz, color, size, life) {
        // Find inactive particle
        for (let particle of this.particles) {
            if (!particle.active) {
                particle.init(x, y, z, vx, vy, vz, color, size, life);
                return particle;
            }
        }
        return null;
    }

    /**
     * Emit an explosion of particles
     */
    emitExplosion(x, y, z, count = 30, colors = null) {
        const defaultColors = [
            0xFFFF00, // Yellow
            0xFFA500, // Orange
            0xFF4500, // Red-Orange
            0xFF0000, // Red
            0xFFD700, // Gold
            0xFFFFFF  // White
        ];

        const colorPalette = colors || defaultColors;

        for (let i = 0; i < count; i++) {
            // Random velocity in all directions
            const speed = 5 + Math.random() * 10;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;

            const vx = Math.sin(phi) * Math.cos(theta) * speed;
            const vy = Math.sin(phi) * Math.sin(theta) * speed + 5; // Upward bias
            const vz = Math.cos(phi) * speed;

            const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            const size = 0.5 + Math.random() * 1.5;
            const life = 0.5 + Math.random() * 1.0;

            this.emit(x, y, z, vx, vy, vz, color, size, life);
        }
    }

    /**
     * Emit bullet impact particles
     */
    emitImpact(x, y, z, direction, count = 10) {
        for (let i = 0; i < count; i++) {
            const spread = 0.5;
            const vx = direction.x * 3 + (Math.random() - 0.5) * spread * 2;
            const vy = direction.y * 3 + (Math.random() - 0.5) * spread * 2 + 2;
            const vz = direction.z * 3 + (Math.random() - 0.5) * spread * 2;

            const color = Math.random() > 0.5 ? 0xFFFFFF : 0xFFFF00;
            const size = 0.2 + Math.random() * 0.3;
            const life = 0.2 + Math.random() * 0.3;

            this.emit(x, y, z, vx, vy, vz, color, size, life);
        }
    }

    /**
     * Emit continuous smoke
     */
    emitSmoke(x, y, z, count = 5) {
        for (let i = 0; i < count; i++) {
            const vx = (Math.random() - 0.5) * 2;
            const vy = 2 + Math.random() * 3;
            const vz = (Math.random() - 0.5) * 2;

            const grayValue = 0.3 + Math.random() * 0.4;
            const color = new THREE.Color(grayValue, grayValue, grayValue).getHex();
            const size = 1.0 + Math.random() * 2.0;
            const life = 1.0 + Math.random() * 1.5;

            const particle = this.emit(x, y, z, vx, vy, vz, color, size, life);
            if (particle) {
                particle.acceleration.set(0, 1, 0); // Smoke rises
                particle.sizeDecay = 1.05; // Smoke grows
            }
        }
    }

    /**
     * Update all particles
     */
    update(deltaTime) {
        let activeCount = 0;

        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];

            if (particle.active) {
                particle.update(deltaTime);

                if (particle.active) {
                    // Update buffer attributes
                    const idx = i * 3;
                    this.positions[idx] = particle.position.x;
                    this.positions[idx + 1] = particle.position.y;
                    this.positions[idx + 2] = particle.position.z;

                    this.colors[idx] = particle.color.r;
                    this.colors[idx + 1] = particle.color.g;
                    this.colors[idx + 2] = particle.color.b;

                    this.sizes[i] = particle.size;
                    this.alphas[i] = particle.getAlpha();

                    activeCount++;
                } else {
                    // Hide inactive particles
                    this.sizes[i] = 0;
                    this.alphas[i] = 0;
                }
            } else {
                // Hide inactive particles
                this.sizes[i] = 0;
                this.alphas[i] = 0;
            }
        }

        // Update geometry
        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.color.needsUpdate = true;
        this.geometry.attributes.size.needsUpdate = true;
        this.geometry.attributes.alpha.needsUpdate = true;

        return activeCount;
    }

    /**
     * Clean up resources
     */
    dispose() {
        this.geometry.dispose();
        this.material.dispose();
        if (this.particleSystem) {
            this.scene.remove(this.particleSystem);
        }
    }
}

/**
 * Global particle manager - singleton
 */
export class ParticleManager {
    constructor(scene) {
        this.scene = scene;
        this.emitters = new Map();
        this.createDefaultEmitters();
    }

    createDefaultEmitters() {
        // Main emitter for explosions and impacts
        this.emitters.set('main', new ParticleEmitter(this.scene, 2000));

        // Separate emitter for smoke (slower, larger particles)
        this.emitters.set('smoke', new ParticleEmitter(this.scene, 500));

        console.log('✓ ParticleManager initialized with 2 emitters');
    }

    getEmitter(name = 'main') {
        return this.emitters.get(name);
    }

    /**
     * Quick explosion effect
     */
    explosion(x, y, z, size = 1.0) {
        const emitter = this.getEmitter('main');
        const count = Math.floor(30 * size);
        emitter.emitExplosion(x, y, z, count);
    }

    /**
     * Quick impact effect
     */
    impact(x, y, z, direction) {
        const emitter = this.getEmitter('main');
        emitter.emitImpact(x, y, z, direction, 8);
    }

    /**
     * Quick smoke effect
     */
    smoke(x, y, z) {
        const emitter = this.getEmitter('smoke');
        emitter.emitSmoke(x, y, z, 3);
    }

    /**
     * Update all emitters
     */
    update(deltaTime) {
        let totalActive = 0;
        for (let emitter of this.emitters.values()) {
            totalActive += emitter.update(deltaTime);
        }
        return totalActive;
    }

    /**
     * Clean up all resources
     */
    dispose() {
        for (let emitter of this.emitters.values()) {
            emitter.dispose();
        }
        this.emitters.clear();
    }
}

export default ParticleManager;
