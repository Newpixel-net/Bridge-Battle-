// Bullet pooling system for efficient shooting

class BulletManager {
    constructor(scene) {
        this.scene = scene;
        this.bullets = [];
        this.poolSize = 300;
        this.bulletPool = [];
        this.bulletSpeed = 40;
        this.bulletLifetime = 3.0;

        // Initialize bullet pool
        this.initializePool();
    }

    initializePool() {
        for (let i = 0; i < this.poolSize; i++) {
            // Bullet geometry - small glowing sphere
            const geometry = new THREE.SphereGeometry(0.3, 8, 8);
            const material = new THREE.MeshBasicMaterial({
                color: 0xFFFF00,
                transparent: true,
                opacity: 0.9
            });
            const bullet = new THREE.Mesh(geometry, material);

            // Add light trail
            const trailGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1, 8);
            const trailMaterial = new THREE.MeshBasicMaterial({
                color: 0xFFFF00,
                transparent: true,
                opacity: 0.5
            });
            const trail = new THREE.Mesh(trailGeometry, trailMaterial);
            trail.rotation.x = Math.PI / 2;
            bullet.add(trail);

            // Add point light for glow
            const light = new THREE.PointLight(0xFFFF00, 1, 3);
            bullet.add(light);

            bullet.visible = false;
            this.scene.add(bullet);

            this.bulletPool.push({
                mesh: bullet,
                trail: trail,
                light: light,
                velocity: new THREE.Vector3(),
                lifetime: 0,
                active: false
            });
        }
    }

    // Get an inactive bullet from the pool
    getBullet() {
        return this.bulletPool.find(b => !b.active);
    }

    // Fire a bullet from a position in a direction
    shoot(x, y, z, dirX, dirY, dirZ, color = 0xFFFF00) {
        const bullet = this.getBullet();
        if (!bullet) return null;

        // Set position
        bullet.mesh.position.set(x, y, z);

        // Set velocity
        const direction = new THREE.Vector3(dirX, dirY, dirZ).normalize();
        bullet.velocity.copy(direction.multiplyScalar(this.bulletSpeed));

        // Set color
        bullet.mesh.material.color.setHex(color);
        bullet.trail.material.color.setHex(color);
        bullet.light.color.setHex(color);

        // Activate
        bullet.mesh.visible = true;
        bullet.lifetime = 0;
        bullet.active = true;

        return bullet;
    }

    // Shoot at a target
    shootAtTarget(fromX, fromY, fromZ, targetX, targetY, targetZ, color = 0xFFFF00) {
        const dirX = targetX - fromX;
        const dirY = targetY - fromY;
        const dirZ = targetZ - fromZ;

        return this.shoot(fromX, fromY, fromZ, dirX, dirY, dirZ, color);
    }

    // Check collision with an object
    checkCollision(bullet, object, radius = 1.0) {
        if (!bullet.active || !object.visible) return false;

        const distance = Utils.distance3D(
            bullet.mesh.position.x,
            bullet.mesh.position.y,
            bullet.mesh.position.z,
            object.position.x,
            object.position.y,
            object.position.z
        );

        return distance < radius;
    }

    // Deactivate a bullet
    deactivate(bullet) {
        bullet.active = false;
        bullet.mesh.visible = false;
        bullet.lifetime = 0;
    }

    // Update all active bullets
    update(deltaTime) {
        this.bulletPool.forEach(bullet => {
            if (!bullet.active) return;

            // Update lifetime
            bullet.lifetime += deltaTime;

            // Deactivate if expired
            if (bullet.lifetime >= this.bulletLifetime) {
                this.deactivate(bullet);
                return;
            }

            // Move bullet
            bullet.mesh.position.add(
                bullet.velocity.clone().multiplyScalar(deltaTime)
            );

            // Update trail length based on velocity
            const speed = bullet.velocity.length();
            bullet.trail.scale.z = speed * 0.1;

            // Point bullet in direction of travel
            bullet.mesh.lookAt(
                bullet.mesh.position.x + bullet.velocity.x,
                bullet.mesh.position.y + bullet.velocity.y,
                bullet.mesh.position.z + bullet.velocity.z
            );

            // Fade out near end of lifetime
            const fadeStart = this.bulletLifetime * 0.8;
            if (bullet.lifetime > fadeStart) {
                const fadeProgress = (bullet.lifetime - fadeStart) / (this.bulletLifetime - fadeStart);
                bullet.mesh.material.opacity = 0.9 * (1 - fadeProgress);
                bullet.trail.material.opacity = 0.5 * (1 - fadeProgress);
            }
        });
    }

    // Get all active bullets
    getActiveBullets() {
        return this.bulletPool.filter(b => b.active);
    }

    // Clean up
    dispose() {
        this.bulletPool.forEach(bullet => {
            this.scene.remove(bullet.mesh);
            Utils.disposeObject(bullet.mesh);
        });
        this.bulletPool = [];
    }
}

// Auto-shooting system for squad
class AutoShooter {
    constructor(bulletManager) {
        this.bulletManager = bulletManager;
        this.shootInterval = 1.0 / 3.0; // 3 shots per second
        this.timeSinceLastShot = 0;
        this.enabled = true;
    }

    // Update and shoot if interval reached
    update(deltaTime, squad, targets) {
        if (!this.enabled || !squad || squad.members.length === 0) return;

        this.timeSinceLastShot += deltaTime;

        if (this.timeSinceLastShot >= this.shootInterval) {
            this.timeSinceLastShot = 0;
            this.shootFromSquad(squad, targets);
        }
    }

    // Shoot from all squad members
    shootFromSquad(squad, targets) {
        const color = Utils.getSquadColor(squad.members.length);

        squad.members.forEach(member => {
            if (!member.visible) return;

            // Find nearest target in front
            const target = this.findNearestTarget(member.position, targets);

            if (target) {
                // Shoot at target
                this.bulletManager.shootAtTarget(
                    member.position.x,
                    member.position.y + 1.5, // Shoot from upper body
                    member.position.z,
                    target.position.x,
                    target.position.y + 0.5,
                    target.position.z,
                    color
                );
            } else {
                // Shoot forward if no target
                this.bulletManager.shoot(
                    member.position.x,
                    member.position.y + 1.5,
                    member.position.z,
                    0, 0, -1, // Forward
                    color
                );
            }
        });
    }

    // Find the nearest target in front of the position
    findNearestTarget(position, targets) {
        let nearest = null;
        let nearestDist = Infinity;

        targets.forEach(target => {
            if (!target.visible || !target.isAlive) return;

            // Only consider targets in front
            if (target.position.z >= position.z) return;

            const dist = Utils.distance3D(
                position.x, position.y, position.z,
                target.position.x, target.position.y, target.position.z
            );

            if (dist < nearestDist && dist < 50) { // Within range
                nearestDist = dist;
                nearest = target;
            }
        });

        return nearest;
    }

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
    }
}
