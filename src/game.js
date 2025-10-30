// Main game loop and initialization

class BridgeBattle {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();

        // Game managers
        this.uiManager = new UIManager();
        this.inputManager = new InputManager();
        this.particleSystem = null;
        this.bulletManager = null;
        this.autoShooter = null;
        this.squad = null;
        this.gateManager = null;
        this.obstacleManager = null;
        this.level = null;

        // Game state
        this.gameState = 'start'; // 'start', 'playing', 'gameover'
        this.score = 0;
        this.currentLevel = 1;
        this.timeElapsed = 0;

        // Camera settings
        this.cameraOffset = new THREE.Vector3(0, 8, 8);
        this.cameraFollowSpeed = 5;

        this.init();
    }

    init() {
        try {
            console.log('Initializing Bridge Battle...');

            this.setupScene();
            console.log('Scene setup complete');

            this.setupCamera();
            console.log('Camera setup complete');

            this.setupRenderer();
            console.log('Renderer setup complete');

            this.setupLighting();
            console.log('Lighting setup complete');

            this.setupManagers();
            console.log('Managers setup complete');

            this.setupUI();
            console.log('UI setup complete');

            // Hide loading screen
            this.uiManager.hideLoading();

            // Start render loop
            this.animate();
            console.log('Bridge Battle initialized successfully!');
        } catch (error) {
            console.error('Error initializing game:', error);
            alert('Error loading game. Please check console for details.');
        }
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
        this.scene.fog = new THREE.Fog(0x87CEEB, 50, 200);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 8, 10);
        this.camera.lookAt(0, 0, 0);
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Replace body content with canvas
        document.body.insertBefore(this.renderer.domElement, document.body.firstChild);
        this.renderer.domElement.id = 'gameCanvas';

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize(), false);
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.left = -50;
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -50;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Hemisphere light for better color
        const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x555555, 0.5);
        this.scene.add(hemisphereLight);
    }

    setupManagers() {
        this.particleSystem = new ParticleSystem(this.scene);
        this.bulletManager = new BulletManager(this.scene);
        this.autoShooter = new AutoShooter(this.bulletManager);
        this.squad = new Squad(this.scene, 5);
        this.gateManager = new GateManager(this.scene);
        this.obstacleManager = new ObstacleManager(this.scene);
        this.level = new Level(this.scene, this.gateManager, this.obstacleManager);
    }

    setupUI() {
        this.uiManager.setupButtons(
            () => this.startGame(),
            () => this.restartGame()
        );
    }

    startGame() {
        this.gameState = 'playing';
        this.uiManager.hideStartScreen();
        this.clock.start();
    }

    restartGame() {
        // Clean up existing game objects
        if (this.squad) this.squad.dispose();
        if (this.gateManager) this.gateManager.dispose();
        if (this.obstacleManager) this.obstacleManager.dispose();
        if (this.level) this.level.dispose();
        if (this.particleSystem) this.particleSystem.dispose();
        if (this.bulletManager) this.bulletManager.dispose();

        // Reset state
        this.score = 0;
        this.currentLevel = 1;
        this.timeElapsed = 0;

        // Recreate managers
        this.setupManagers();

        // Reset UI
        this.uiManager.reset();

        // Start game
        this.startGame();
    }

    update(deltaTime) {
        if (this.gameState !== 'playing') return;

        this.timeElapsed += deltaTime;

        // Update input and squad movement
        const targetX = this.inputManager.getTargetX(this.level.bridgeWidth);
        this.squad.setTargetX(targetX);
        this.squad.moveForward(deltaTime);
        this.squad.update(deltaTime);

        // Update shooting system
        const targets = [
            ...this.obstacleManager.getAliveObstacles(),
            ...this.gateManager.gates.filter(g => !g.isCollected)
        ];
        this.autoShooter.update(deltaTime, this.squad, targets);

        // Update bullets
        this.bulletManager.update(deltaTime);

        // Check bullet collisions with obstacles
        const obstacleHits = this.obstacleManager.checkBulletCollisions(
            this.bulletManager.getActiveBullets()
        );

        obstacleHits.forEach(hit => {
            const scoreGained = hit.obstacle.takeDamage(10);

            // Create impact effect
            this.particleSystem.createImpact(
                hit.position.x, hit.position.y, hit.position.z,
                0, 0, -1,
                Utils.getSquadColor(this.squad.getSize())
            );

            // Show damage number
            this.uiManager.showDamageNumber(
                hit.position.x, hit.position.y, hit.position.z,
                10, this.camera, this.renderer
            );

            // Add score if destroyed
            if (scoreGained > 0) {
                this.score += scoreGained;
                this.uiManager.updateScore(this.score);

                // Create explosion
                this.particleSystem.createExplosion(
                    hit.obstacle.mesh.position.x,
                    hit.obstacle.mesh.position.y + 1,
                    hit.obstacle.mesh.position.z
                );

                // Screen shake
                Utils.screenShake(this.camera, 0.5, 200);

                // Check for weapon pickup
                if (hit.obstacle.hasWeapon && hit.obstacle.weaponMesh) {
                    this.collectWeapon(hit.obstacle.mesh.position);
                }
            }

            // Deactivate bullet
            this.bulletManager.deactivate(hit.bullet);
        });

        // Check bullet collisions with gates
        const gateHits = this.gateManager.checkBulletCollisions(
            this.bulletManager.getActiveBullets()
        );

        gateHits.forEach(hit => {
            // Create sparkle effect
            this.particleSystem.createSparkle(
                hit.position.x, hit.position.y, hit.position.z,
                0x00FFFF
            );

            // Show damage number
            this.uiManager.showDamageNumber(
                hit.position.x, hit.position.y, hit.position.z,
                1, this.camera, this.renderer
            );

            // Deactivate bullet
            this.bulletManager.deactivate(hit.bullet);
        });

        // Check gate collisions with squad
        const gateResult = this.gateManager.checkCollisions(this.squad);
        if (gateResult) {
            this.handleGateCollision(gateResult);
        }

        // Update obstacles
        this.obstacleManager.update(deltaTime, this.camera);

        // Update gates
        this.gateManager.update(deltaTime, this.timeElapsed);

        // Update level
        this.level.update(deltaTime, this.timeElapsed);
        this.level.extendLevel(this.squad.getCenter().z);

        // Update particles
        this.particleSystem.update(deltaTime);

        // Update UI
        this.uiManager.update(deltaTime);

        // Update camera to follow squad
        this.updateCamera(deltaTime);

        // Check for level progression (based on distance)
        const newLevel = Math.floor(Math.abs(this.squad.getCenter().z) / 100) + 1;
        if (newLevel > this.currentLevel) {
            this.currentLevel = newLevel;
            this.uiManager.updateLevel(this.currentLevel);
        }
    }

    handleGateCollision(result) {
        if (result.gameOver) {
            this.gameOver();
            return;
        }

        // Update UI
        this.uiManager.updateSquadSize(result.newSize, true);

        // Show text
        const changeText = result.change > 0 ? `+${result.change}` : `${result.change}`;
        const color = result.change > 0 ? '#00FF88' : '#FF4444';
        this.uiManager.showFloatingText(
            result.gate.mesh.position.x,
            result.gate.mesh.position.y + 5,
            result.gate.mesh.position.z,
            changeText,
            color,
            this.camera
        );

        // Visual effect
        if (result.change > 0) {
            this.particleSystem.createSparkle(
                result.gate.mesh.position.x,
                result.gate.mesh.position.y,
                result.gate.mesh.position.z,
                0x00FF88
            );
        }

        // Add score
        const scoreBonus = Math.abs(result.change) * 50;
        this.score += scoreBonus;
        this.uiManager.updateScore(this.score);
    }

    collectWeapon(position) {
        // Visual effect
        this.particleSystem.createSparkle(
            position.x,
            position.y + 3,
            position.z,
            0x00FFFF
        );

        // Add bonus to squad
        this.squad.addMember();
        this.uiManager.updateSquadSize(this.squad.getSize(), true);

        // Score bonus
        this.score += 200;
        this.uiManager.updateScore(this.score);

        // Show text
        this.uiManager.showFloatingText(
            position.x,
            position.y + 4,
            position.z,
            'WEAPON!',
            '#00FFFF',
            this.camera
        );
    }

    updateCamera(deltaTime) {
        // Follow squad center
        const squadCenter = this.squad.getCenter();
        const targetPosition = new THREE.Vector3(
            squadCenter.x,
            squadCenter.y + this.cameraOffset.y,
            squadCenter.z + this.cameraOffset.z
        );

        // Smooth camera follow
        this.camera.position.lerp(targetPosition, this.cameraFollowSpeed * deltaTime);

        // Look slightly ahead of squad
        const lookTarget = new THREE.Vector3(
            squadCenter.x,
            squadCenter.y,
            squadCenter.z - 5
        );
        this.camera.lookAt(lookTarget);
    }

    gameOver() {
        this.gameState = 'gameover';
        this.autoShooter.disable();
        this.uiManager.showGameOver(this.score);

        // Big explosion effect
        const center = this.squad.getCenter();
        this.particleSystem.createExplosion(center.x, center.y, center.z, 50);
        Utils.screenShake(this.camera, 2, 500);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const deltaTime = Math.min(this.clock.getDelta(), 0.1); // Cap delta time

        this.update(deltaTime);
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    // Check if Three.js is loaded
    if (typeof THREE === 'undefined') {
        console.error('Three.js failed to load!');
        alert('Failed to load Three.js library. Please check your internet connection and try again.');
        return;
    }

    console.log('Three.js loaded successfully, version:', THREE.REVISION);

    try {
        new BridgeBattle();
    } catch (error) {
        console.error('Fatal error creating game:', error);
        alert('Failed to start game. Error: ' + error.message);
    }
});
