/**
 * EnemySystem - Red uniformed enemy soldiers that fight the player squad
 * Enemies spawn in formations and can be destroyed by player bullets
 */

import * as THREE from 'three';
import { SpriteCharacter, SpriteTextureManager } from './SpriteCharacter.js';

/**
 * Enemy Soldier - Red uniformed enemy with AI behavior
 */
export class EnemySoldier {
    constructor(x, y, z, index, textureManager) {
        this.index = index;
        this.group = new THREE.Group();
        this.textureManager = textureManager;
        this.hp = 5; // 5 HP per enemy as specified
        this.maxHp = 5;
        this.destroyed = false;

        // Get run animation texture
        const texture = textureManager.getTexture('run');

        // Create sprite material with RED tint for enemies
        const spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.1,
            depthWrite: true,
            depthTest: true,
            color: 0xFF3333  // RED TINT for enemies!
        });

        // Create sprite
        this.sprite = new THREE.Sprite(spriteMaterial);

        // Scale to make character 1.5 units tall
        const targetHeight = 1.5;
        const aspectRatio = 275 / 294;
        this.sprite.scale.set(targetHeight * aspectRatio, targetHeight, 1);

        // Offset sprite up so feet are at Y=0
        this.sprite.position.y = targetHeight / 2;

        this.group.add(this.sprite);

        // Position in world
        this.group.position.set(x, y, z);

        // Add shadow
        this.createShadow();

        // Create HP bar above enemy
        this.createHPBar();

        // Animation controller (reusing from SpriteCharacter animations)
        const SpriteAnimationController = window.SpriteAnimationController;
        if (SpriteAnimationController) {
            this.animController = new SpriteAnimationController(
                texture,
                275,  // frame width
                294,  // frame height
                6,    // columns
                6,    // rows
                36    // total frames
            );

            // Define animations
            this.animController.addAnimation('idle', 0, 5);
            this.animController.addAnimation('run', 6, 11);
            this.animController.addAnimation('shoot', 12, 17);
            this.animController.addAnimation('death', 18, 23);

            // Start with run animation
            this.animController.play('run', true);
        }

        // Movement properties (enemies stay mostly stationary or move slowly)
        this.velocityX = 0;
        this.velocityZ = 0;
        this.formationOffsetX = 0;
        this.formationOffsetZ = 0;

        // AI behavior
        this.aiState = 'idle'; // idle, alert, attacking
        this.targetPlayer = null;
        this.alertRange = 50;
        this.active = true;
    }

    createShadow() {
        const shadowGeometry = new THREE.CircleGeometry(0.4, 16);
        const shadowMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.3,
            depthWrite: false
        });

        this.shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
        this.shadow.rotation.x = -Math.PI / 2;
        this.shadow.position.y = 0.02; // Slightly above ground
        this.group.add(this.shadow);
    }

    createHPBar() {
        // Create HP bar above enemy
        const barWidth = 1.2;
        const barHeight = 0.15;

        // Background (red)
        const bgGeometry = new THREE.PlaneGeometry(barWidth, barHeight);
        const bgMaterial = new THREE.MeshBasicMaterial({ color: 0x330000 });
        this.hpBarBg = new THREE.Mesh(bgGeometry, bgMaterial);
        this.hpBarBg.position.y = 2.0;
        this.group.add(this.hpBarBg);

        // Foreground (green, shows remaining HP)
        const fgGeometry = new THREE.PlaneGeometry(barWidth, barHeight);
        const fgMaterial = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
        this.hpBarFg = new THREE.Mesh(fgGeometry, fgMaterial);
        this.hpBarFg.position.y = 2.0;
        this.hpBarFg.position.z = 0.01;
        this.group.add(this.hpBarFg);
    }

    updateHPBar() {
        if (this.hpBarFg) {
            const hpPercent = Math.max(0, this.hp / this.maxHp);
            this.hpBarFg.scale.x = hpPercent;
            this.hpBarFg.position.x = -(1.2 * (1 - hpPercent)) / 2;
        }

        // Make HP bar always face camera
        if (this.hpBarBg && window.game && window.game.camera) {
            this.hpBarBg.lookAt(window.game.camera.position);
            this.hpBarFg.lookAt(window.game.camera.position);
        }
    }

    update(deltaTime, playerSquadCenter) {
        if (!this.active || this.destroyed) return;

        // Update animation
        if (this.animController) {
            this.animController.update(deltaTime);
        }

        // Update HP bar
        this.updateHPBar();

        // Simple AI: Face player squad
        if (playerSquadCenter) {
            const dx = playerSquadCenter.x - this.group.position.x;
            const dz = playerSquadCenter.z - this.group.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);

            // Check if player is in range
            if (dist < this.alertRange) {
                this.aiState = 'alert';
            } else {
                this.aiState = 'idle';
            }
        }

        // Enemies don't move forward (they're static obstacles)
        // Player moves past them
    }

    takeDamage(amount) {
        if (this.destroyed) return false;

        this.hp -= amount;
        this.updateHPBar();

        // Flash effect
        if (this.sprite) {
            this.sprite.material.color.setHex(0xFFFFFF);
            setTimeout(() => {
                if (this.sprite && this.sprite.material) {
                    this.sprite.material.color.setHex(0xFF3333);
                }
            }, 50);
        }

        // Check if destroyed
        if (this.hp <= 0 && !this.destroyed) {
            this.destroy();
            return true;
        }

        return false;
    }

    destroy() {
        this.destroyed = true;

        // Play death animation if available
        if (this.animController) {
            this.animController.play('death', false);
        }

        // Fade out and remove
        const startTime = Date.now();
        const duration = 500;

        const animateDestruction = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            if (this.sprite && this.sprite.material) {
                this.sprite.material.opacity = 1 - progress;
            }

            this.group.position.y = -progress * 0.5; // Sink into ground

            if (progress < 1) {
                requestAnimationFrame(animateDestruction);
            } else {
                this.cleanup();
            }
        };

        animateDestruction();
    }

    cleanup() {
        this.active = false;

        if (this.sprite) {
            if (this.sprite.geometry) this.sprite.geometry.dispose();
            if (this.sprite.material) this.sprite.material.dispose();
        }
        if (this.shadow) {
            if (this.shadow.geometry) this.shadow.geometry.dispose();
            if (this.shadow.material) this.shadow.material.dispose();
        }
        if (this.hpBarBg) {
            if (this.hpBarBg.geometry) this.hpBarBg.geometry.dispose();
            if (this.hpBarBg.material) this.hpBarBg.material.dispose();
        }
        if (this.hpBarFg) {
            if (this.hpBarFg.geometry) this.hpBarFg.geometry.dispose();
            if (this.hpBarFg.material) this.hpBarFg.material.dispose();
        }
    }
}

/**
 * Enemy Formation Manager
 */
export class EnemyFormation {
    constructor(scene, textureManager, centerX, centerZ, type = 'line') {
        this.scene = scene;
        this.textureManager = textureManager;
        this.enemies = [];
        this.centerX = centerX;
        this.centerZ = centerZ;
        this.type = type;
        this.active = true;

        this.createFormation();
    }

    createFormation() {
        const formations = {
            line: this.createLineFormation.bind(this),
            wedge: this.createWedgeFormation.bind(this),
            circle: this.createCircleFormation.bind(this),
            square: this.createSquareFormation.bind(this)
        };

        const formationFn = formations[this.type] || formations.line;
        formationFn();

        // Add all enemies to scene
        this.enemies.forEach(enemy => {
            this.scene.add(enemy.group);
        });
    }

    createLineFormation() {
        // 5 enemies in a horizontal line
        const spacing = 2.5;
        const count = 5;

        for (let i = 0; i < count; i++) {
            const x = this.centerX + (i - (count - 1) / 2) * spacing;
            const enemy = new EnemySoldier(x, 0, this.centerZ, i, this.textureManager);
            this.enemies.push(enemy);
        }
    }

    createWedgeFormation() {
        // V-shaped formation: 3 rows
        const positions = [
            [0, 0],           // Front
            [-2, -3], [2, -3], // Second row
            [-4, -6], [4, -6]  // Back row
        ];

        positions.forEach((pos, i) => {
            const x = this.centerX + pos[0];
            const z = this.centerZ + pos[1];
            const enemy = new EnemySoldier(x, 0, z, i, this.textureManager);
            this.enemies.push(enemy);
        });
    }

    createCircleFormation() {
        // 6 enemies in a circle
        const count = 6;
        const radius = 4;

        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const x = this.centerX + Math.cos(angle) * radius;
            const z = this.centerZ + Math.sin(angle) * radius;
            const enemy = new EnemySoldier(x, 0, z, i, this.textureManager);
            this.enemies.push(enemy);
        }
    }

    createSquareFormation() {
        // 3x3 grid of enemies
        const spacing = 2.5;
        const size = 3;

        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const x = this.centerX + (col - (size - 1) / 2) * spacing;
                const z = this.centerZ + (row - (size - 1) / 2) * spacing;
                const enemy = new EnemySoldier(x, 0, z, row * size + col, this.textureManager);
                this.enemies.push(enemy);
            }
        }
    }

    update(deltaTime, playerSquadCenter) {
        // Update all enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];

            if (!enemy.active) {
                enemy.cleanup();
                this.scene.remove(enemy.group);
                this.enemies.splice(i, 1);
                continue;
            }

            enemy.update(deltaTime, playerSquadCenter);
        }

        // Check if formation is destroyed
        if (this.enemies.length === 0) {
            this.active = false;
        }
    }

    checkBulletCollisions(bullets, particleManager, damageNumbers) {
        const BULLET_DAMAGE = 10;
        const HIT_RADIUS = 0.8;

        bullets.forEach(bullet => {
            if (!bullet.active) return;

            for (let enemy of this.enemies) {
                if (!enemy.active || enemy.destroyed) continue;

                const enemyPos = enemy.group.position;
                const bulletPos = bullet.getPosition();
                const dist = bulletPos.distanceTo(enemyPos);

                if (dist < HIT_RADIUS) {
                    // Hit!
                    const destroyed = enemy.takeDamage(BULLET_DAMAGE);

                    // Show damage number
                    if (damageNumbers) {
                        damageNumbers.show(
                            BULLET_DAMAGE,
                            enemyPos.x,
                            enemyPos.y + 1,
                            enemyPos.z
                        );
                    }

                    // Impact particles
                    if (particleManager) {
                        particleManager.impact(
                            enemyPos.x,
                            enemyPos.y + 1,
                            enemyPos.z,
                            new THREE.Vector3(0, 0, -1)
                        );
                    }

                    if (destroyed && particleManager) {
                        // Explosion on death
                        particleManager.explosion(
                            enemyPos.x,
                            enemyPos.y + 0.5,
                            enemyPos.z,
                            1.0
                        );
                    }

                    // Deactivate bullet
                    bullet.deactivate();
                    return;
                }
            }
        });
    }

    cleanup() {
        this.enemies.forEach(enemy => {
            enemy.cleanup();
            this.scene.remove(enemy.group);
        });
        this.enemies = [];
        this.active = false;
    }
}

/**
 * Enemy Manager - Spawns and manages enemy formations
 */
export class EnemyManager {
    constructor(scene, textureManager, particleManager, damageNumbers) {
        this.scene = scene;
        this.textureManager = textureManager;
        this.particleManager = particleManager;
        this.damageNumbers = damageNumbers;
        this.formations = [];
        this.lastSpawn = Date.now(); // Track last spawn time
        this.spawnInterval = 10000; // Spawn enemies every 10 seconds
    }

    update(deltaTime, playerSquadCenter, bullets) {
        // Update all formations
        for (let i = this.formations.length - 1; i >= 0; i--) {
            const formation = this.formations[i];

            if (!formation.active) {
                formation.cleanup();
                this.formations.splice(i, 1);
                continue;
            }

            formation.update(deltaTime, playerSquadCenter);

            // Check bullet collisions
            formation.checkBulletCollisions(
                bullets,
                this.particleManager,
                this.damageNumbers
            );

            // Remove formations that are far behind player
            if (playerSquadCenter && formation.centerZ < playerSquadCenter.z - 50) {
                formation.cleanup();
                this.formations.splice(i, 1);
            }
        }
    }

    spawnFormation(z) {
        // Random formation type
        const types = ['line', 'wedge', 'circle', 'square'];
        const type = types[Math.floor(Math.random() * types.length)];

        // Random X position on bridge
        const x = (Math.random() - 0.5) * 20; // ±10 units from center

        const formation = new EnemyFormation(
            this.scene,
            this.textureManager,
            x,
            z,
            type
        );

        this.formations.push(formation);
        this.lastSpawn = Date.now(); // Update last spawn time
        console.log(`🔴 Spawned enemy formation (${type}) at Z=${z}`);

        return formation;
    }

    trySpawn(currentTime, playerZ) {
        if (currentTime - this.lastSpawn > this.spawnInterval) {
            // Spawn ahead of player
            const spawnZ = playerZ + 120;
            this.spawnFormation(spawnZ);
            this.lastSpawn = currentTime;
        }
    }

    getAllEnemies() {
        return this.formations.flatMap(f => f.enemies);
    }

    getActiveCount() {
        return this.formations.reduce((sum, f) => sum + f.enemies.length, 0);
    }

    cleanup() {
        this.formations.forEach(f => f.cleanup());
        this.formations = [];
    }
}

export default EnemyManager;
