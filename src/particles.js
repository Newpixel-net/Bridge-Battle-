// Particle system for explosions and visual effects

class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.poolSize = 500;
        this.particlePool = [];

        // Initialize particle pool
        this.initializePool();
    }

    initializePool() {
        for (let i = 0; i < this.poolSize; i++) {
            const geometry = new THREE.SphereGeometry(0.2, 8, 8);
            const material = new THREE.MeshBasicMaterial({
                color: 0xFFFFFF,
                transparent: true,
                opacity: 1
            });
            const particle = new THREE.Mesh(geometry, material);
            particle.visible = false;
            this.scene.add(particle);
            this.particlePool.push({
                mesh: particle,
                velocity: new THREE.Vector3(),
                lifetime: 0,
                maxLifetime: 0,
                active: false
            });
        }
    }

    // Get an inactive particle from the pool
    getParticle() {
        return this.particlePool.find(p => !p.active);
    }

    // Explosion effect with multiple colored particles
    createExplosion(x, y, z, count = 20, colors = [0xFF6600, 0xFF9900, 0xFFCC00, 0xFFFF00]) {
        for (let i = 0; i < count; i++) {
            const particle = this.getParticle();
            if (!particle) continue;

            // Random velocity in all directions
            const speed = Utils.randomRange(5, 15);
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;

            particle.velocity.set(
                Math.sin(phi) * Math.cos(theta) * speed,
                Math.sin(phi) * Math.sin(theta) * speed,
                Math.cos(phi) * speed
            );

            particle.mesh.position.set(x, y, z);
            particle.mesh.material.color.setHex(Utils.randomChoice(colors));
            particle.mesh.scale.set(1, 1, 1);
            particle.mesh.visible = true;
            particle.lifetime = 0;
            particle.maxLifetime = Utils.randomRange(0.5, 1.5);
            particle.active = true;
        }
    }

    // Impact effect (directional particles)
    createImpact(x, y, z, directionX, directionY, directionZ, color = 0xFFFF00) {
        const count = 10;
        for (let i = 0; i < count; i++) {
            const particle = this.getParticle();
            if (!particle) continue;

            const spread = 3;
            const speed = Utils.randomRange(8, 12);

            particle.velocity.set(
                directionX * speed + Utils.randomRange(-spread, spread),
                directionY * speed + Utils.randomRange(-spread, spread),
                directionZ * speed + Utils.randomRange(-spread, spread)
            );

            particle.mesh.position.set(x, y, z);
            particle.mesh.material.color.setHex(color);
            particle.mesh.scale.set(0.8, 0.8, 0.8);
            particle.mesh.visible = true;
            particle.lifetime = 0;
            particle.maxLifetime = 0.5;
            particle.active = true;
        }
    }

    // Sparkle effect for collectibles
    createSparkle(x, y, z, color = 0x00FFFF) {
        const count = 8;
        for (let i = 0; i < count; i++) {
            const particle = this.getParticle();
            if (!particle) continue;

            const angle = (i / count) * Math.PI * 2;
            const speed = 5;

            particle.velocity.set(
                Math.cos(angle) * speed,
                Utils.randomRange(3, 8),
                Math.sin(angle) * speed
            );

            particle.mesh.position.set(x, y, z);
            particle.mesh.material.color.setHex(color);
            particle.mesh.scale.set(0.5, 0.5, 0.5);
            particle.mesh.visible = true;
            particle.lifetime = 0;
            particle.maxLifetime = 1.0;
            particle.active = true;
        }
    }

    // Continuous trail effect
    createTrail(x, y, z, color = 0xFFFFFF) {
        const particle = this.getParticle();
        if (!particle) return;

        particle.velocity.set(0, 0, 0);
        particle.mesh.position.set(x, y, z);
        particle.mesh.material.color.setHex(color);
        particle.mesh.scale.set(0.3, 0.3, 0.3);
        particle.mesh.visible = true;
        particle.lifetime = 0;
        particle.maxLifetime = 0.3;
        particle.active = true;
    }

    // Update all active particles
    update(deltaTime) {
        const gravity = new THREE.Vector3(0, -20, 0);

        this.particlePool.forEach(particle => {
            if (!particle.active) return;

            // Update lifetime
            particle.lifetime += deltaTime;

            if (particle.lifetime >= particle.maxLifetime) {
                particle.active = false;
                particle.mesh.visible = false;
                return;
            }

            // Apply velocity and gravity
            particle.velocity.add(gravity.clone().multiplyScalar(deltaTime));
            particle.mesh.position.add(particle.velocity.clone().multiplyScalar(deltaTime));

            // Fade out over lifetime
            const lifeProgress = particle.lifetime / particle.maxLifetime;
            particle.mesh.material.opacity = 1 - lifeProgress;

            // Shrink over time
            const scale = 1 - lifeProgress * 0.5;
            particle.mesh.scale.set(scale, scale, scale);
        });
    }

    // Clean up all particles
    dispose() {
        this.particlePool.forEach(particle => {
            this.scene.remove(particle.mesh);
            Utils.disposeObject(particle.mesh);
        });
        this.particlePool = [];
    }
}
