// Obstacles and enemies with HP system

class Obstacle {
    constructor(scene, x, y, z, type = 'tire') {
        this.scene = scene;
        this.position = new THREE.Vector3(x, y, z);
        this.type = type;
        this.maxHP = this.getMaxHPForType(type);
        this.currentHP = this.maxHP;
        this.isAlive = true;
        this.hasWeapon = Math.random() < 0.3; // 30% chance of weapon on top

        this.mesh = null;
        this.hpText = null;
        this.weaponMesh = null;

        this.create();
    }

    getMaxHPForType(type) {
        switch (type) {
            case 'tire': return Utils.randomInt(100, 300);
            case 'box': return Utils.randomInt(150, 250);
            case 'barrel': return Utils.randomInt(80, 150);
            case 'enemy': return Utils.randomInt(50, 100);
            default: return 100;
        }
    }

    create() {
        const group = new THREE.Group();

        // Create obstacle based on type
        switch (this.type) {
            case 'tire':
                this.createTireStack(group);
                break;
            case 'box':
                this.createBox(group);
                break;
            case 'barrel':
                this.createBarrel(group);
                break;
            case 'enemy':
                this.createEnemy(group);
                break;
        }

        // Add weapon on top if applicable
        if (this.hasWeapon && this.type !== 'enemy') {
            this.createWeapon(group);
        }

        group.position.copy(this.position);
        this.mesh = group;
        this.scene.add(group);

        // Create HP display
        this.createHPDisplay();
    }

    createTireStack(group) {
        const tireGeometry = new THREE.TorusGeometry(1, 0.4, 16, 32);
        const tireMaterial = new THREE.MeshStandardMaterial({
            color: 0x222222,
            roughness: 0.9
        });

        // Stack 3 tires
        for (let i = 0; i < 3; i++) {
            const tire = new THREE.Mesh(tireGeometry, tireMaterial);
            tire.rotation.x = Math.PI / 2;
            tire.position.y = i * 0.8;
            tire.castShadow = true;
            group.add(tire);
        }
    }

    createBox(group) {
        const boxGeometry = new THREE.BoxGeometry(2, 2, 2);
        const boxMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.8
        });
        const box = new THREE.Mesh(boxGeometry, boxMaterial);
        box.position.y = 1;
        box.castShadow = true;
        group.add(box);
    }

    createBarrel(group) {
        const barrelGeometry = new THREE.CylinderGeometry(0.8, 0.8, 2, 16);
        const barrelMaterial = new THREE.MeshStandardMaterial({
            color: 0xFF6600,
            roughness: 0.7,
            metalness: 0.3
        });
        const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
        barrel.position.y = 1;
        barrel.castShadow = true;
        group.add(barrel);
    }

    createEnemy(group) {
        // Simple enemy character (similar to squad member but red)
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0xFF0000,
            roughness: 0.7
        });

        // Use CapsuleGeometry if available, otherwise fallback to cylinder + spheres
        if (typeof THREE.CapsuleGeometry !== 'undefined') {
            const bodyGeometry = new THREE.CapsuleGeometry(0.4, 1.0, 8, 16);
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 1.0;
            body.castShadow = true;
            group.add(body);
        } else {
            // Fallback: cylinder with sphere caps
            const cylinderGeometry = new THREE.CylinderGeometry(0.4, 0.4, 1.0, 8);
            const body = new THREE.Mesh(cylinderGeometry, bodyMaterial);
            body.position.y = 1.0;
            body.castShadow = true;
            group.add(body);

            const topSphereGeometry = new THREE.SphereGeometry(0.4, 8, 8);
            const topSphere = new THREE.Mesh(topSphereGeometry, bodyMaterial);
            topSphere.position.y = 1.5;
            topSphere.castShadow = true;
            group.add(topSphere);

            const bottomSphereGeometry = new THREE.SphereGeometry(0.4, 8, 8);
            const bottomSphere = new THREE.Mesh(bottomSphereGeometry, bodyMaterial);
            bottomSphere.position.y = 0.5;
            bottomSphere.castShadow = true;
            group.add(bottomSphere);
        }

        const headGeometry = new THREE.SphereGeometry(0.35, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B0000,
            roughness: 0.8
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.8;
        head.castShadow = true;
        group.add(head);
    }

    createWeapon(group) {
        // Glowing weapon pickup
        const weaponGroup = new THREE.Group();

        const weaponGeometry = new THREE.BoxGeometry(0.3, 0.3, 1.2);
        const weaponMaterial = new THREE.MeshStandardMaterial({
            color: 0x00FFFF,
            emissive: 0x00FFFF,
            emissiveIntensity: 0.5,
            metalness: 0.8
        });
        const weapon = new THREE.Mesh(weaponGeometry, weaponMaterial);
        weaponGroup.add(weapon);

        // Add glow
        const glowGeometry = new THREE.SphereGeometry(0.8, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00FFFF,
            transparent: true,
            opacity: 0.3
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        weaponGroup.add(glow);

        // Add point light
        const light = new THREE.PointLight(0x00FFFF, 1, 5);
        weaponGroup.add(light);

        weaponGroup.position.y = 3;
        this.weaponMesh = weaponGroup;
        group.add(weaponGroup);
    }

    createHPDisplay() {
        // Create canvas for HP text
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 128;

        this.updateHPCanvas(canvas, context);

        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);

        // Create text plane
        const textGeometry = new THREE.PlaneGeometry(4, 2);
        const textMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide
        });

        this.hpText = new THREE.Mesh(textGeometry, textMaterial);
        this.hpText.position.y = 3.5;
        this.hpText.canvas = canvas;
        this.hpText.context = context;
        this.hpText.texture = texture;

        this.mesh.add(this.hpText);
    }

    updateHPCanvas(canvas, context) {
        // Clear canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Draw HP text
        context.font = 'Bold 60px Arial';
        context.fillStyle = '#FFD700';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.strokeStyle = '#000000';
        context.lineWidth = 6;

        const text = Math.ceil(this.currentHP).toString();
        context.strokeText(text, canvas.width / 2, canvas.height / 2);
        context.fillText(text, canvas.width / 2, canvas.height / 2);
    }

    // Take damage and update HP display
    takeDamage(damage) {
        if (!this.isAlive) return 0;

        this.currentHP -= damage;

        // Update HP display
        if (this.hpText) {
            this.updateHPCanvas(this.hpText.canvas, this.hpText.context);
            this.hpText.texture.needsUpdate = true;
        }

        // Check if destroyed
        if (this.currentHP <= 0) {
            this.currentHP = 0;
            this.isAlive = false;
            return this.maxHP; // Return score
        }

        return 0;
    }

    // Check collision with bullet
    checkBulletCollision(bullet) {
        if (!this.isAlive || !bullet.active) return false;

        const distance = Utils.distance3D(
            bullet.mesh.position.x,
            bullet.mesh.position.y,
            bullet.mesh.position.z,
            this.mesh.position.x,
            this.mesh.position.y + 1.5,
            this.mesh.position.z
        );

        return distance < 2;
    }

    // Update obstacle (rotate weapon, face camera for HP text)
    update(deltaTime, camera) {
        // Rotate weapon pickup
        if (this.weaponMesh && this.isAlive) {
            this.weaponMesh.rotation.y += deltaTime * 2;
            this.weaponMesh.position.y = 3 + Math.sin(Date.now() * 0.003) * 0.3;
        }

        // Make HP text face camera
        if (this.hpText && camera) {
            this.hpText.lookAt(camera.position);
        }

        // Fade out when destroyed
        if (!this.isAlive) {
            this.mesh.position.y -= deltaTime * 2;
            this.mesh.traverse(child => {
                if (child.material) {
                    if (child.material.opacity !== undefined) {
                        child.material.opacity -= deltaTime;
                        child.material.transparent = true;
                    }
                }
            });

            return this.mesh.position.y < -5; // Signal for removal
        }

        return false;
    }

    // Clean up
    dispose() {
        if (this.mesh) {
            this.scene.remove(this.mesh);
            Utils.disposeObject(this.mesh);
        }
    }
}

// Obstacle manager
class ObstacleManager {
    constructor(scene) {
        this.scene = scene;
        this.obstacles = [];
    }

    // Create a new obstacle
    createObstacle(x, z, type = 'tire') {
        const obstacle = new Obstacle(this.scene, x, 0, z, type);
        this.obstacles.push(obstacle);
        return obstacle;
    }

    // Create random obstacles at a position
    createRandomObstacles(z, count = 3, bridgeWidth = 40) {
        const types = ['tire', 'box', 'barrel'];
        const positions = [];

        for (let i = 0; i < count; i++) {
            let x, attempts = 0;
            let validPosition = false;

            // Try to find a non-overlapping position
            while (!validPosition && attempts < 10) {
                x = Utils.randomRange(-bridgeWidth / 2 + 3, bridgeWidth / 2 - 3);
                validPosition = true;

                // Check against existing positions
                for (const pos of positions) {
                    if (Math.abs(pos - x) < 4) {
                        validPosition = false;
                        break;
                    }
                }
                attempts++;
            }

            if (validPosition) {
                positions.push(x);
                const type = Utils.randomChoice(types);
                this.createObstacle(x, z, type);
            }
        }
    }

    // Create enemy obstacles
    createEnemies(z, count = 2, bridgeWidth = 40) {
        for (let i = 0; i < count; i++) {
            const x = Utils.randomRange(-bridgeWidth / 2 + 3, bridgeWidth / 2 - 3);
            this.createObstacle(x, z, 'enemy');
        }
    }

    // Check bullet collisions
    checkBulletCollisions(bullets) {
        const hits = [];

        bullets.forEach(bullet => {
            if (!bullet.active) return;

            this.obstacles.forEach(obstacle => {
                if (obstacle.checkBulletCollision(bullet)) {
                    hits.push({
                        obstacle: obstacle,
                        bullet: bullet,
                        position: bullet.mesh.position.clone()
                    });
                }
            });
        });

        return hits;
    }

    // Update all obstacles
    update(deltaTime, camera) {
        // Remove destroyed obstacles
        this.obstacles = this.obstacles.filter(obstacle => {
            const shouldRemove = obstacle.update(deltaTime, camera);
            if (shouldRemove) {
                obstacle.dispose();
                return false;
            }
            return true;
        });
    }

    // Get all alive obstacles for shooting AI
    getAliveObstacles() {
        return this.obstacles.filter(o => o.isAlive);
    }

    // Clean up
    dispose() {
        this.obstacles.forEach(obstacle => obstacle.dispose());
        this.obstacles = [];
    }
}
