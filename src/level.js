// Level generation and management

class Level {
    constructor(scene, gateManager, obstacleManager) {
        this.scene = scene;
        this.gateManager = gateManager;
        this.obstacleManager = obstacleManager;

        this.bridgeWidth = 40;
        this.bridgeLength = 1200;
        this.currentZ = 0;
        this.gateSpacing = 30;
        this.obstacleGroupSpacing = 20;
        this.difficultyLevel = 1;

        this.bridge = null;
        this.water = null;
        this.pillars = [];

        this.generateLevel();
    }

    generateLevel() {
        this.createBridge();
        this.createWater();
        this.createPillars();
        this.generateGatesAndObstacles();
    }

    createBridge() {
        // Main bridge surface
        const bridgeGeometry = new THREE.PlaneGeometry(this.bridgeWidth, this.bridgeLength);
        const bridgeMaterial = new THREE.MeshStandardMaterial({
            color: 0x888888,
            roughness: 0.8
        });
        this.bridge = new THREE.Mesh(bridgeGeometry, bridgeMaterial);
        this.bridge.rotation.x = -Math.PI / 2;
        this.bridge.position.z = -this.bridgeLength / 2;
        this.bridge.receiveShadow = true;
        this.scene.add(this.bridge);

        // Lane markings
        const markingGeometry = new THREE.PlaneGeometry(0.5, this.bridgeLength);
        const markingMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFFFFF
        });

        // Center line
        const centerLine = new THREE.Mesh(markingGeometry, markingMaterial);
        centerLine.rotation.x = -Math.PI / 2;
        centerLine.position.y = 0.01;
        centerLine.position.z = -this.bridgeLength / 2;
        this.scene.add(centerLine);

        // Side lines
        const leftLine = new THREE.Mesh(markingGeometry, markingMaterial);
        leftLine.rotation.x = -Math.PI / 2;
        leftLine.position.set(-this.bridgeWidth / 2 + 1, 0.01, -this.bridgeLength / 2);
        this.scene.add(leftLine);

        const rightLine = new THREE.Mesh(markingGeometry, markingMaterial);
        rightLine.rotation.x = -Math.PI / 2;
        rightLine.position.set(this.bridgeWidth / 2 - 1, 0.01, -this.bridgeLength / 2);
        this.scene.add(rightLine);
    }

    createWater() {
        // Water plane using custom shader
        const waterGeometry = new THREE.PlaneGeometry(200, this.bridgeLength * 2);
        const waterMaterial = createWaterMaterial();

        this.water = new THREE.Mesh(waterGeometry, waterMaterial);
        this.water.rotation.x = -Math.PI / 2;
        this.water.position.y = -10;
        this.water.position.z = -this.bridgeLength / 2;
        this.scene.add(this.water);
    }

    createPillars() {
        // Golden Gate style bridge pillars
        const pillarSpacing = 50;
        const pillarCount = Math.floor(this.bridgeLength / pillarSpacing);

        for (let i = 0; i < pillarCount; i++) {
            const z = -i * pillarSpacing;

            // Left pillar
            this.createPillar(-this.bridgeWidth / 2 - 5, z);

            // Right pillar
            this.createPillar(this.bridgeWidth / 2 + 5, z);
        }
    }

    createPillar(x, z) {
        const pillarGroup = new THREE.Group();

        // Main pillar
        const mainGeometry = new THREE.BoxGeometry(4, 30, 4);
        const pillarMaterial = new THREE.MeshStandardMaterial({
            color: 0xCC3333,
            roughness: 0.7,
            metalness: 0.3
        });
        const main = new THREE.Mesh(mainGeometry, pillarMaterial);
        main.position.y = 15;
        main.castShadow = true;
        pillarGroup.add(main);

        // Top decoration
        const topGeometry = new THREE.BoxGeometry(5, 2, 5);
        const top = new THREE.Mesh(topGeometry, pillarMaterial);
        top.position.y = 31;
        top.castShadow = true;
        pillarGroup.add(top);

        // Cables (decorative)
        const cableGeometry = new THREE.CylinderGeometry(0.1, 0.1, 20, 8);
        const cableMaterial = new THREE.MeshStandardMaterial({
            color: 0x666666,
            metalness: 0.8
        });

        for (let i = 0; i < 3; i++) {
            const cable = new THREE.Mesh(cableGeometry, cableMaterial);
            cable.position.set(0, 20, (i - 1) * 2);
            cable.rotation.z = x < 0 ? Math.PI / 6 : -Math.PI / 6;
            pillarGroup.add(cable);
        }

        pillarGroup.position.set(x, 0, z);
        this.pillars.push(pillarGroup);
        this.scene.add(pillarGroup);
    }

    generateGatesAndObstacles() {
        let currentZ = -20; // Start position

        for (let i = 0; i < 30; i++) {
            // Alternate between gates and obstacles
            if (i % 2 === 0) {
                // Create gate
                const value = this.getGateValueForDifficulty(i);
                this.gateManager.createGate(currentZ, value);
                currentZ -= this.gateSpacing;
            } else {
                // Create obstacle group
                const obstacleCount = Utils.randomInt(2, 5);
                this.obstacleManager.createRandomObstacles(currentZ, obstacleCount, this.bridgeWidth);

                // Occasionally add enemies
                if (i > 5 && Math.random() < 0.3) {
                    this.obstacleManager.createEnemies(currentZ, Utils.randomInt(1, 2), this.bridgeWidth);
                }

                currentZ -= this.obstacleGroupSpacing;
            }
        }
    }

    getGateValueForDifficulty(index) {
        // Early gates are more positive
        if (index < 3) {
            return Utils.randomInt(3, 8);
        }

        // Mix of positive and negative
        const baseRange = 8;
        const negativeChance = Math.min(0.5, index * 0.02);

        if (Math.random() < negativeChance) {
            return -Utils.randomInt(1, baseRange);
        } else {
            return Utils.randomInt(1, baseRange);
        }
    }

    // Extend level as player progresses
    extendLevel(playerZ) {
        const furthestGateZ = this.gateManager.getFurthestGateZ();

        // Generate more content if player is getting close to the end
        if (playerZ < furthestGateZ + 100) {
            let currentZ = furthestGateZ - 30;

            // Generate 10 more sections
            for (let i = 0; i < 10; i++) {
                if (i % 2 === 0) {
                    const value = this.getGateValueForDifficulty(20 + i);
                    this.gateManager.createGate(currentZ, value);
                    currentZ -= this.gateSpacing;
                } else {
                    this.obstacleManager.createRandomObstacles(currentZ, Utils.randomInt(3, 6), this.bridgeWidth);

                    if (Math.random() < 0.4) {
                        this.obstacleManager.createEnemies(currentZ, Utils.randomInt(1, 3), this.bridgeWidth);
                    }

                    currentZ -= this.obstacleGroupSpacing;
                }
            }
        }
    }

    // Update water animation
    update(deltaTime, time) {
        if (this.water && this.water.material.uniforms) {
            this.water.material.uniforms.time.value = time;
        }
    }

    // Clean up
    dispose() {
        if (this.bridge) {
            this.scene.remove(this.bridge);
            Utils.disposeObject(this.bridge);
        }

        if (this.water) {
            this.scene.remove(this.water);
            Utils.disposeObject(this.water);
        }

        this.pillars.forEach(pillar => {
            this.scene.remove(pillar);
            Utils.disposeObject(pillar);
        });
        this.pillars = [];
    }
}
