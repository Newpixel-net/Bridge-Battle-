// Gate system with arithmetic operations

class Gate {
    constructor(scene, z, value, bridgeWidth = 40) {
        this.scene = scene;
        this.z = z;
        this.originalValue = value;
        this.currentValue = value;
        this.bridgeWidth = bridgeWidth;
        this.isPositive = value > 0;
        this.isCollected = false;
        this.canBeShot = true;
        this.hp = Math.abs(value) * 10; // HP for shooting gates
        this.shootBonus = 0; // Additional value gained from shooting

        this.mesh = null;
        this.textMesh = null;
        this.material = null;

        this.create();
    }

    create() {
        // Gate frame spans full width
        const gateGroup = new THREE.Group();

        // Holographic gate plane
        const gateGeometry = new THREE.PlaneGeometry(this.bridgeWidth, 8);
        this.material = createGateMaterial(this.isPositive);
        const gatePlane = new THREE.Mesh(gateGeometry, this.material);
        gatePlane.position.y = 4;
        gateGroup.add(gatePlane);

        // Gate frame (left and right pillars)
        const pillarGeometry = new THREE.BoxGeometry(2, 10, 2);
        const pillarMaterial = new THREE.MeshStandardMaterial({
            color: this.isPositive ? 0x0088FF : 0xFF4444,
            emissive: this.isPositive ? 0x004488 : 0x882222,
            emissiveIntensity: 0.5
        });

        const leftPillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
        leftPillar.position.set(-this.bridgeWidth / 2 - 1, 5, 0);
        leftPillar.castShadow = true;
        gateGroup.add(leftPillar);

        const rightPillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
        rightPillar.position.set(this.bridgeWidth / 2 + 1, 5, 0);
        rightPillar.castShadow = true;
        gateGroup.add(rightPillar);

        // Top bar
        const barGeometry = new THREE.BoxGeometry(this.bridgeWidth + 4, 1, 2);
        const topBar = new THREE.Mesh(barGeometry, pillarMaterial);
        topBar.position.y = 10;
        topBar.castShadow = true;
        gateGroup.add(topBar);

        // Add glow lights
        const glowColor = this.isPositive ? 0x00FFFF : 0xFF0000;
        const leftLight = new THREE.PointLight(glowColor, 2, 15);
        leftLight.position.set(-this.bridgeWidth / 2, 5, 0);
        gateGroup.add(leftLight);

        const rightLight = new THREE.PointLight(glowColor, 2, 15);
        rightLight.position.set(this.bridgeWidth / 2, 5, 0);
        gateGroup.add(rightLight);

        gateGroup.position.z = this.z;
        this.mesh = gateGroup;
        this.scene.add(gateGroup);

        // Create text display
        this.createText();
    }

    createText() {
        // Create canvas for text
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 256;

        // Clear canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Draw text
        context.font = 'Bold 120px Arial';
        context.fillStyle = this.isPositive ? '#00FFFF' : '#FF0000';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.strokeStyle = '#000000';
        context.lineWidth = 8;

        const text = (this.currentValue > 0 ? '+' : '') + this.currentValue;
        context.strokeText(text, canvas.width / 2, canvas.height / 2);
        context.fillText(text, canvas.width / 2, canvas.height / 2);

        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;

        // Create text plane
        const textGeometry = new THREE.PlaneGeometry(12, 6);
        const textMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide
        });

        if (this.textMesh) {
            this.mesh.remove(this.textMesh);
            Utils.disposeObject(this.textMesh);
        }

        this.textMesh = new THREE.Mesh(textGeometry, textMaterial);
        this.textMesh.position.set(0, 6, 0);
        this.mesh.add(this.textMesh);
    }

    // Update text when value changes from shooting
    updateValue(newValue) {
        this.currentValue = newValue;
        this.createText();

        // Update color if it changed sign
        if ((newValue > 0) !== this.isPositive) {
            this.isPositive = newValue > 0;
            this.material = createGateMaterial(this.isPositive);
            this.mesh.children[0].material = this.material;
        }
    }

    // Take damage from bullets (increases positive value)
    takeDamage(damage) {
        if (!this.canBeShot || this.isCollected) return false;

        this.shootBonus += damage;

        // Update displayed value
        const newValue = this.originalValue + Math.floor(this.shootBonus / 10);
        if (newValue !== this.currentValue) {
            this.updateValue(newValue);
        }

        return true;
    }

    // Apply gate effect to squad
    applyToSquad(squad) {
        if (this.isCollected) return null;

        this.isCollected = true;

        const currentSize = squad.getSize();
        const finalValue = this.currentValue;
        let newSize = currentSize + finalValue;

        // Game over only if negative value exceeds current squad size
        if (newSize < 1) {
            return {
                gameOver: true,
                change: finalValue,
                newSize: 0
            };
        }

        // Apply the change
        squad.setSize(newSize);

        return {
            gameOver: false,
            change: finalValue,
            newSize: newSize
        };
    }

    // Check if squad is passing through this gate
    checkCollision(squad) {
        if (this.isCollected) return false;

        const center = squad.getCenter();
        return Math.abs(center.z - this.z) < 2;
    }

    // Animate gate (pulsing effect)
    update(deltaTime, time) {
        if (this.material && this.material.uniforms) {
            this.material.uniforms.time.value = time;
        }

        // Rotate text slightly for emphasis
        if (this.textMesh && !this.isCollected) {
            this.textMesh.rotation.y = Math.sin(time * 2) * 0.1;
        }

        // Fade out after collection
        if (this.isCollected) {
            this.mesh.position.y += deltaTime * 5;
            this.mesh.traverse(child => {
                if (child.material) {
                    if (child.material.opacity !== undefined) {
                        child.material.opacity -= deltaTime * 2;
                        child.material.transparent = true;
                    }
                }
            });

            // Remove when fully faded
            if (this.mesh.position.y > 20) {
                return true; // Signal for removal
            }
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

// Gate manager
class GateManager {
    constructor(scene) {
        this.scene = scene;
        this.gates = [];
    }

    // Create a new gate
    createGate(z, value) {
        const gate = new Gate(this.scene, z, value);
        this.gates.push(gate);
        return gate;
    }

    // Create multiple gates at intervals
    createGates(startZ, count, spacing, minValue = -5, maxValue = 8) {
        for (let i = 0; i < count; i++) {
            const z = startZ - (i * spacing);
            let value;

            // Bias toward positive gates early on
            if (i < 3) {
                value = Utils.randomInt(1, maxValue);
            } else {
                // Random value, but avoid zero
                value = Utils.randomInt(minValue, maxValue);
                if (value === 0) value = 1;
            }

            this.createGate(z, value);
        }
    }

    // Check collisions with squad
    checkCollisions(squad) {
        let result = null;

        this.gates.forEach(gate => {
            if (gate.checkCollision(squad)) {
                result = gate.applyToSquad(squad);
                if (result) {
                    result.gate = gate;
                }
            }
        });

        return result;
    }

    // Check bullet collisions with gates
    checkBulletCollisions(bullets) {
        const hits = [];

        bullets.forEach(bullet => {
            if (!bullet.active) return;

            this.gates.forEach(gate => {
                if (gate.isCollected) return;

                // Check if bullet is near gate
                const distance = Math.abs(bullet.mesh.position.z - gate.z);
                if (distance < 1) {
                    // Hit the gate
                    if (gate.takeDamage(1)) {
                        hits.push({
                            gate: gate,
                            bullet: bullet,
                            position: bullet.mesh.position.clone()
                        });
                    }
                }
            });
        });

        return hits;
    }

    // Update all gates
    update(deltaTime, time) {
        // Remove gates that are ready for disposal
        this.gates = this.gates.filter(gate => {
            const shouldRemove = gate.update(deltaTime, time);
            if (shouldRemove) {
                gate.dispose();
                return false;
            }
            return true;
        });
    }

    // Clean up all gates
    dispose() {
        this.gates.forEach(gate => gate.dispose());
        this.gates = [];
    }

    // Get furthest gate position
    getFurthestGateZ() {
        if (this.gates.length === 0) return 0;
        return Math.min(...this.gates.map(g => g.z));
    }
}
