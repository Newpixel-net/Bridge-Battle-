// Main game loop and initialization - OPTIMIZED VERSION

class BridgeBattle {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = null;
        this.lastTime = 0;

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

        // Camera settings - MUCH CLOSER for professional look
        this.cameraOffset = new THREE.Vector3(0, 5, 6);
        this.cameraLookAhead = 3;
        this.cameraFollowSpeed = 3;

        this.init();
    }

    init() {
        try {
            console.log('Initializing Bridge Battle...');

            this.setupScene();
            this.setupCamera();
            this.setupRenderer();
            this.setupLighting();
            this.setupManagers();
            this.setupUI();

            // Hide loading screen
            this.uiManager.hideLoading();

            // Initialize clock
            this.clock = new THREE.Clock(false); // Don't auto-start
            this.lastTime = performance.now();

            // Start render loop immediately
            this.animate();
            console.log('Bridge Battle initialized successfully!');
        } catch (error) {
            console.error('Error initializing game:', error);
            alert('Error loading game: ' + error.message);
        }
    }

    setupScene() {
        this.scene = new THREE.Scene();
        // Gradient sky background
        this.scene.background = new THREE.Color(0xB0D0F0);
        this.scene.fog = new THREE.Fog(0xB0D0F0, 30, 100);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            60, // Narrower FOV for more focused view
            window.innerWidth / window.innerHeight,
            0.1,
            500
        );
        this.camera.position.set(0, 5, 6);
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
        this.renderer.outputEncoding = THREE.sRGBEncoding; // Better colors
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping; // Professional look
        this.renderer.toneMappingExposure = 1.2;

        document.body.insertBefore(this.renderer.domElement, document.body.firstChild);
        this.renderer.domElement.id = 'gameCanvas';

        window.addEventListener('resize', () => this.onWindowResize(), false);
    }

    setupLighting() {
        // Bright ambient for cartoon look
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(ambientLight);

        // Main directional light (sun) - stronger and closer
        const directionalLight = new THREE.DirectionalLight(0xFFFFE6, 1.2);
        directionalLight.position.set(5, 15, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.left = -25;
        directionalLight.shadow.camera.right = 25;
        directionalLight.shadow.camera.top = 25;
        directionalLight.shadow.camera.bottom = -25;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 100;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.bias = -0.0001;
        this.scene.add(directionalLight);

        // Hemisphere light for nice sky/ground gradient
        const hemisphereLight = new THREE.HemisphereLight(0xB0D0F0, 0x888888, 0.6);
        this.scene.add(hemisphereLight);

        // Subtle fill light from the side
        const fillLight = new THREE.DirectionalLight(0xCCDDFF, 0.4);
        fillLight.position.set(-5, 3, 0);
        this.scene.add(fillLight);
    }

    setupManagers() {
        this.particleSystem = new ParticleSystem(this.scene);
        this.bulletManager = new BulletManager(this.scene);
        this.autoShooter = new AutoShooter(this.bulletManager);
        this.squad = new Squad(this.scene, 5);
        this.gateManager = new GateManager(this.scene);
        this.obstacleManager = new ObstacleManager(this.scene);
        this.level = new Level(this.scene, this.gateManager, this.obstacleManager);

        // Set initial camera position to follow squad
        const center = this.squad.getCenter();
        this.camera.position.set(
            center.x,
            center.y + this.cameraOffset.y,
            center.z + this.cameraOffset.z
        );
    }

    setupUI() {
        this.uiManager.setupButtons(
            () => this.startGame(),
            () => this.restartGame()
        );
    }

    startGame() {
        console.log('Starting game...');
        this.gameState = 'playing';
        this.uiManager.hideStartScreen();
        this.clock.start();
        this.lastTime = performance.now();
        this.autoShooter.enable();
    }

    restartGame() {
        // Clean up existing game objects
        if (this.squad) this.squad.dispose();
        if (this.gateManager) this.gateManager.dispose();
        if (this.obstacleManager) this.obstacleManager.dispose();
        if (this.level) this.level.dispose();

        // Reset state
        this.score = 0;
        this.currentLevel = 1;
        this.timeElapsed = 0;
        this.gameState = 'start';

        // Recreate managers
        this.setupManagers();

        // Reset UI
        this.uiManager.reset();

        // Start game
        this.startGame();
    }

    update(deltaTime) {
        if (this.gameState !== 'playing') return;

        // Cap delta time to prevent huge jumps
        deltaTime = Math.min(deltaTime, 0.033); // Max 33ms (30 FPS)

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

            this.particleSystem.createImpact(
                hit.position.x, hit.position.y, hit.position.z,
                0, 0, -1,
                Utils.getSquadColor(this.squad.getSize())
            );

            if (scoreGained > 0) {
                this.score += scoreGained;
                this.uiManager.updateScore(this.score);

                this.particleSystem.createExplosion(
                    hit.obstacle.mesh.position.x,
                    hit.obstacle.mesh.position.y + 1,
                    hit.obstacle.mesh.position.z,
                    15
                );

                Utils.screenShake(this.camera, 0.3, 150);

                if (hit.obstacle.hasWeapon && hit.obstacle.weaponMesh) {
                    this.collectWeapon(hit.obstacle.mesh.position);
                }
            }

            this.bulletManager.deactivate(hit.bullet);
        });

        // Check bullet collisions with gates
        const gateHits = this.gateManager.checkBulletCollisions(
            this.bulletManager.getActiveBullets()
        );

        gateHits.forEach(hit => {
            this.particleSystem.createSparkle(
                hit.position.x, hit.position.y, hit.position.z,
                0x00FFFF
            );
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

        // Update camera to follow squad smoothly
        this.updateCamera(deltaTime);

        // Check for level progression
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

        this.uiManager.updateSquadSize(result.newSize, true);

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

        if (result.change > 0) {
            this.particleSystem.createSparkle(
                result.gate.mesh.position.x,
                result.gate.mesh.position.y,
                result.gate.mesh.position.z,
                0x00FF88
            );
        }

        const scoreBonus = Math.abs(result.change) * 50;
        this.score += scoreBonus;
        this.uiManager.updateScore(this.score);
    }

    collectWeapon(position) {
        this.particleSystem.createSparkle(position.x, position.y + 3, position.z, 0x00FFFF);
        this.squad.addMember();
        this.uiManager.updateSquadSize(this.squad.getSize(), true);
        this.score += 200;
        this.uiManager.updateScore(this.score);
    }

    updateCamera(deltaTime) {
        const squadCenter = this.squad.getCenter();

        // Target position: slightly above and behind squad
        const targetPosition = new THREE.Vector3(
            squadCenter.x * 0.8, // Slight horizontal follow
            squadCenter.y + this.cameraOffset.y,
            squadCenter.z + this.cameraOffset.z
        );

        // Smooth camera movement
        this.camera.position.lerp(targetPosition, this.cameraFollowSpeed * deltaTime);

        // Look at point slightly ahead of squad
        const lookTarget = new THREE.Vector3(
            squadCenter.x * 0.5,
            squadCenter.y + 1,
            squadCenter.z - this.cameraLookAhead
        );

        const currentLookAt = new THREE.Vector3(0, 0, -1);
        currentLookAt.applyQuaternion(this.camera.quaternion);
        currentLookAt.add(this.camera.position);

        currentLookAt.lerp(lookTarget, deltaTime * 5);
        this.camera.lookAt(currentLookAt);
    }

    gameOver() {
        this.gameState = 'gameover';
        this.autoShooter.disable();
        this.uiManager.showGameOver(this.score);

        const center = this.squad.getCenter();
        this.particleSystem.createExplosion(center.x, center.y, center.z, 50);
        Utils.screenShake(this.camera, 1.5, 500);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Calculate delta time manually for better control
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = currentTime;

        // Only update if delta time is reasonable
        if (deltaTime > 0 && deltaTime < 0.1) {
            this.update(deltaTime);
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
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
