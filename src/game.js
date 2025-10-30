// OPTIMIZED Game - Fast Loading, No Freeze

class BridgeBattle {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.lastTime = 0;

        // Game managers - created lazily
        this.uiManager = new UIManager();
        this.inputManager = new InputManager();
        this.squad = null;
        this.gateManager = null;
        this.obstacleManager = null;
        this.level = null;
        this.bulletManager = null;
        this.autoShooter = null;
        this.particleSystem = null;

        // Game state
        this.gameState = 'start';
        this.score = 0;
        this.currentLevel = 1;
        this.timeElapsed = 0;

        // Camera settings
        this.cameraOffset = new THREE.Vector3(0, 6, 8);
        this.cameraLookAhead = 5;

        this.init();
    }

    init() {
        console.log('Initializing (fast)...');

        // ONLY setup essentials on load
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLighting();

        // Setup UI immediately
        this.uiManager.setupButtons(
            () => this.startGame(),
            () => this.restartGame()
        );

        this.uiManager.hideLoading();

        // Start render loop
        this.lastTime = performance.now();
        this.animate();

        console.log('Ready! Click START to play.');
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xA8D5FF);
        this.scene.fog = new THREE.Fog(0xA8D5FF, 40, 120);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            65,
            window.innerWidth / window.innerHeight,
            0.1,
            500
        );
        this.camera.position.set(0, 6, 8);
        this.camera.lookAt(0, 0, -10);
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: false, // Faster
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Cap for performance
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.BasicShadowMap; // Faster shadows

        document.body.insertBefore(this.renderer.domElement, document.body.firstChild);
        this.renderer.domElement.id = 'gameCanvas';

        window.addEventListener('resize', () => this.onWindowResize(), false);
    }

    setupLighting() {
        // Simple lighting setup
        const ambient = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambient);

        const sun = new THREE.DirectionalLight(0xFFFFE6, 1.0);
        sun.position.set(8, 20, 8);
        sun.castShadow = true;
        sun.shadow.camera.left = -30;
        sun.shadow.camera.right = 30;
        sun.shadow.camera.top = 30;
        sun.shadow.camera.bottom = -30;
        sun.shadow.mapSize.width = 1024; // Lower for performance
        sun.shadow.mapSize.height = 1024;
        this.scene.add(sun);
    }

    // LAZY: Create game objects only when game starts
    setupGameObjects() {
        console.log('Creating game objects...');

        // Create in order of priority
        this.squad = new Squad(this.scene, 5);
        console.log('Squad created');

        this.gateManager = new GateManager(this.scene);
        this.obstacleManager = new ObstacleManager(this.scene);
        this.level = new Level(this.scene, this.gateManager, this.obstacleManager);
        console.log('Level created');

        this.bulletManager = new BulletManager(this.scene);
        this.autoShooter = new AutoShooter(this.bulletManager);
        this.particleSystem = new ParticleSystem(this.scene);
        console.log('Effects created');

        // Position camera
        const center = this.squad.getCenter();
        this.camera.position.set(
            center.x,
            center.y + this.cameraOffset.y,
            center.z + this.cameraOffset.z
        );
    }

    startGame() {
        console.log('Starting game...');

        // Create game objects now (not on page load)
        if (!this.squad) {
            this.setupGameObjects();
        }

        this.gameState = 'playing';
        this.uiManager.hideStartScreen();
        this.lastTime = performance.now();

        if (this.autoShooter) {
            this.autoShooter.enable();
        }
    }

    restartGame() {
        // Clean up
        if (this.squad) this.squad.dispose();
        if (this.gateManager) this.gateManager.dispose();
        if (this.obstacleManager) this.obstacleManager.dispose();
        if (this.level) this.level.dispose();

        // Reset
        this.squad = null;
        this.gateManager = null;
        this.obstacleManager = null;
        this.level = null;

        this.score = 0;
        this.currentLevel = 1;
        this.timeElapsed = 0;

        this.uiManager.reset();
        this.startGame();
    }

    update(deltaTime) {
        if (this.gameState !== 'playing' || !this.squad) return;

        deltaTime = Math.min(deltaTime, 0.033);
        this.timeElapsed += deltaTime;

        // Input
        const targetX = this.inputManager.getTargetX(this.level.bridgeWidth);
        this.squad.setTargetX(targetX);
        this.squad.moveForward(deltaTime);
        this.squad.update(deltaTime);

        // Shooting
        const targets = [
            ...this.obstacleManager.getAliveObstacles(),
            ...this.gateManager.gates.filter(g => !g.isCollected)
        ];
        this.autoShooter.update(deltaTime, this.squad, targets);
        this.bulletManager.update(deltaTime);

        // Collisions
        const obstacleHits = this.obstacleManager.checkBulletCollisions(
            this.bulletManager.getActiveBullets()
        );

        obstacleHits.forEach(hit => {
            const scoreGained = hit.obstacle.takeDamage(10);

            if (scoreGained > 0) {
                this.score += scoreGained;
                this.uiManager.updateScore(this.score);

                this.particleSystem.createExplosion(
                    hit.obstacle.mesh.position.x,
                    hit.obstacle.mesh.position.y + 1,
                    hit.obstacle.mesh.position.z,
                    10 // Fewer particles
                );

                if (hit.obstacle.hasWeapon) {
                    this.collectWeapon(hit.obstacle.mesh.position);
                }
            }

            this.bulletManager.deactivate(hit.bullet);
        });

        // Gate collisions
        const gateHits = this.gateManager.checkBulletCollisions(
            this.bulletManager.getActiveBullets()
        );
        gateHits.forEach(hit => {
            this.bulletManager.deactivate(hit.bullet);
        });

        const gateResult = this.gateManager.checkCollisions(this.squad);
        if (gateResult) {
            this.handleGateCollision(gateResult);
        }

        // Updates
        this.obstacleManager.update(deltaTime, this.camera);
        this.gateManager.update(deltaTime, this.timeElapsed);
        this.level.update(deltaTime, this.timeElapsed);
        this.level.extendLevel(this.squad.getCenter().z);
        this.particleSystem.update(deltaTime);
        this.uiManager.update(deltaTime);

        // Camera
        this.updateCamera(deltaTime);

        // Level progression
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

        const targetPos = new THREE.Vector3(
            squadCenter.x * 0.5,
            squadCenter.y + this.cameraOffset.y,
            squadCenter.z + this.cameraOffset.z
        );

        this.camera.position.lerp(targetPos, deltaTime * 4);

        const lookTarget = new THREE.Vector3(
            squadCenter.x * 0.3,
            squadCenter.y + 1,
            squadCenter.z - this.cameraLookAhead
        );

        this.camera.lookAt(lookTarget);
    }

    gameOver() {
        this.gameState = 'gameover';
        if (this.autoShooter) this.autoShooter.disable();
        this.uiManager.showGameOver(this.score);

        const center = this.squad.getCenter();
        this.particleSystem.createExplosion(center.x, center.y, center.z, 30);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        if (deltaTime > 0 && deltaTime < 0.1) {
            this.update(deltaTime);
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize FAST
window.addEventListener('load', () => {
    if (typeof THREE === 'undefined') {
        alert('Failed to load Three.js. Please check internet connection.');
        return;
    }

    console.log('Three.js version:', THREE.REVISION);

    try {
        new BridgeBattle();
    } catch (error) {
        console.error('Error:', error);
        alert('Error: ' + error.message);
    }
});
