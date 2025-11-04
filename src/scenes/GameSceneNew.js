import Phaser from 'phaser';
import { GAME, WORLD, SQUAD, GATES, OBSTACLES, CAMERA, COLORS, SCENES, LEVEL, PERFORMANCE } from '../utils/GameConstants.js';
import SquadManager from '../systems/SquadManager.js';
import BulletManager from '../systems/BulletManager.js';
import GateManager from '../systems/GateManager.js';
import ObstacleManager from '../systems/ObstacleManager.js';

/**
 * GameScene - Main gameplay scene
 * Complete rebuild with all systems properly integrated
 */
export default class GameSceneNew extends Phaser.Scene {
    constructor() {
        super({ key: 'GameSceneNew' });
    }

    init() {
        // Game state
        this.gameState = 'playing';
        this.score = 0;
        this.level = 1;
        this.distance = 0;

        // Systems
        this.squadManager = null;
        this.bulletManager = null;
        this.gateManager = null;
        this.obstacleManager = null;

        // Spawning
        this.lastGateSpawn = 0;
        this.lastObstacleSpawn = 0;
        this.nextSpawnZ = LEVEL.START_Z;

        // Input
        this.isDragging = false;
        this.pointerX = 0;

        console.log('🎮 GameScene initialized');
    }

    create() {
        console.log('🎮 GameScene created - Building complete game...');

        // Create environment
        this.createEnvironment();

        // Initialize all game systems
        this.squadManager = new SquadManager(this);
        this.bulletManager = new BulletManager(this);
        this.gateManager = new GateManager(this);
        this.obstacleManager = new ObstacleManager(this);

        // Initialize squad
        this.squadManager.init(SQUAD.START_SIZE);

        // Setup camera
        this.setupCamera();

        // Setup input
        this.setupInput();

        // Create graphics for bullet trails
        this.trailGraphics = this.add.graphics();
        this.trailGraphics.setDepth(4);

        // Start UI scene
        this.scene.launch(SCENES.UI);
        this.events.emit('updateScore', this.score);
        this.events.emit('updateLevel', this.level);
        this.events.emit('updateSquad', this.squadManager.getCount());

        // Spawn initial gates and obstacles
        this.spawnInitialLevel();

        console.log('✓ All systems online - Game ready!');
    }

    /**
     * Create environment (sky, water, bridge)
     */
    createEnvironment() {
        // Sky background
        const sky = this.add.rectangle(
            GAME.WIDTH / 2,
            0,
            GAME.WIDTH * 3,
            GAME.HEIGHT * 3,
            COLORS.SKY_TOP
        );
        sky.setOrigin(0.5, 0);
        sky.setDepth(-100);
        sky.setScrollFactor(0.3, 0.1);

        // Water
        const water = this.add.rectangle(
            0,
            0,
            GAME.WIDTH * 3,
            WORLD.BRIDGE_LENGTH + 2000,
            COLORS.WATER
        );
        water.setDepth(-50);

        // Bridge road
        const bridge = this.add.rectangle(
            0,
            0,
            WORLD.BRIDGE_WIDTH,
            WORLD.BRIDGE_LENGTH + 1000,
            COLORS.BRIDGE_ROAD
        );
        bridge.setDepth(-10);

        // Bridge edges
        const leftEdge = this.add.rectangle(
            -WORLD.BRIDGE_WIDTH / 2,
            0,
            20,
            WORLD.BRIDGE_LENGTH + 1000,
            COLORS.BRIDGE_PILLAR
        );
        leftEdge.setDepth(-5);

        const rightEdge = this.add.rectangle(
            WORLD.BRIDGE_WIDTH / 2,
            0,
            20,
            WORLD.BRIDGE_LENGTH + 1000,
            COLORS.BRIDGE_PILLAR
        );
        rightEdge.setDepth(-5);

        // Lane markings
        const graphics = this.add.graphics();
        graphics.setDepth(-8);
        graphics.lineStyle(6, COLORS.BRIDGE_LINES, 0.5);

        for (let y = -200; y < WORLD.BRIDGE_LENGTH + 200; y += 100) {
            graphics.lineBetween(0, y, 0, y + 50);
        }

        console.log('✓ Environment created');
    }

    /**
     * Setup camera to follow squad
     */
    setupCamera() {
        this.cameras.main.setBounds(
            -GAME.WIDTH,
            -500,
            GAME.WIDTH * 2,
            WORLD.BRIDGE_LENGTH + 2000
        );

        // Set initial camera position
        const squadPos = this.squadManager.getCenter();
        this.cameras.main.scrollY = squadPos.y + CAMERA.FOLLOW_OFFSET_Y;
    }

    /**
     * Setup player input
     */
    setupInput() {
        // Touch/Mouse input for horizontal movement
        this.input.on('pointerdown', (pointer) => {
            this.isDragging = true;
            this.pointerX = pointer.x;
        });

        this.input.on('pointermove', (pointer) => {
            if (this.isDragging) {
                this.pointerX = pointer.x;
            }
        });

        this.input.on('pointerup', () => {
            this.isDragging = false;
        });

        // Keyboard fallback
        this.cursors = this.input.keyboard.createCursorKeys();

        console.log('✓ Input initialized');
    }

    /**
     * Spawn initial level content
     */
    spawnInitialLevel() {
        // Spawn first few gates and obstacles
        for (let i = 0; i < 5; i++) {
            const z = LEVEL.START_Z + i * 400;

            if (i % 2 === 0) {
                this.gateManager.createGate(z);
            } else {
                this.obstacleManager.createCluster(z);
            }
        }

        this.nextSpawnZ = LEVEL.START_Z + 2000;
    }

    /**
     * Main update loop
     */
    update(time, delta) {
        if (this.gameState !== 'playing') return;

        const dt = delta / 1000; // Convert to seconds

        // Update input
        this.handleInput(dt);

        // Update squad
        this.squadManager.update(delta);

        // Auto-shoot at obstacles
        const visibleObstacles = this.obstacleManager.getObstaclesInRange(
            this.squadManager.getCenter().y,
            PERFORMANCE.SPAWN_DISTANCE
        );
        this.bulletManager.autoShoot(
            this.squadManager.getMembers(),
            visibleObstacles,
            time
        );

        // Update bullets
        this.bulletManager.update(time, delta);

        // Check bullet collisions
        this.checkBulletCollisions();

        // Check gate collisions
        this.checkGateCollisions();

        // Update systems
        const cameraY = this.cameras.main.scrollY;
        this.gateManager.update(cameraY);
        this.obstacleManager.update(cameraY);

        // Update camera
        this.updateCamera(dt);

        // Render bullet trails
        this.bulletManager.renderTrails(this.trailGraphics);

        // Spawn new content
        this.spawnContent();

        // Update distance
        this.distance = this.squadManager.getCenter().y;

        // Check win condition
        if (this.distance >= LEVEL.WIN_DISTANCE) {
            this.onVictory();
        }
    }

    /**
     * Handle player input
     */
    handleInput(dt) {
        let targetX = 0;

        if (this.isDragging) {
            // Convert screen X to world X
            const normalizedX = (this.pointerX / GAME.WIDTH) - 0.5;
            targetX = normalizedX * WORLD.BRIDGE_WIDTH;
        } else if (this.cursors.left.isDown) {
            targetX = -SQUAD.HORIZONTAL_LIMIT;
        } else if (this.cursors.right.isDown) {
            targetX = SQUAD.HORIZONTAL_LIMIT;
        }

        this.squadManager.setTargetX(targetX);
    }

    /**
     * Update camera to follow squad
     */
    updateCamera(dt) {
        const squadCenter = this.squadManager.getCenter();
        const targetY = squadCenter.y + CAMERA.FOLLOW_OFFSET_Y;

        // Smooth camera follow
        const currentY = this.cameras.main.scrollY;
        const newY = Phaser.Math.Linear(currentY, targetY, CAMERA.FOLLOW_LERP);

        this.cameras.main.scrollY = newY;
    }

    /**
     * Check bullet vs obstacle collisions
     */
    checkBulletCollisions() {
        const bullets = this.bulletManager.getActiveBullets();

        bullets.forEach(bullet => {
            // Check obstacle hits
            const hitObstacle = this.obstacleManager.handleBulletHit(bullet, () => {
                this.addScore(100);
            });

            if (hitObstacle) {
                this.bulletManager.removeBullet(bullet);
                return;
            }

            // Check gate hits (positive gates only)
            const hitGate = this.gateManager.handleBulletHit(bullet, () => {
                this.addScore(10);
            });

            if (hitGate) {
                this.bulletManager.removeBullet(bullet);
            }
        });
    }

    /**
     * Check squad vs gate collisions
     */
    checkGateCollisions() {
        const squadCenter = this.squadManager.getCenter();
        const squadMembers = this.squadManager.getMembers();

        this.gateManager.checkCollisions(
            squadCenter,
            squadMembers,
            (value, isPositive) => {
                this.applyGateEffect(value, isPositive);
            }
        );
    }

    /**
     * Apply gate effect to squad
     */
    applyGateEffect(value, isPositive) {
        const currentCount = this.squadManager.getCount();
        const newCount = currentCount + value;

        console.log(`Gate: ${value > 0 ? '+' : ''}${value}, Squad: ${currentCount} → ${newCount}`);

        if (newCount <= 0) {
            // Game Over
            this.onGameOver();
        } else if (value > 0) {
            // Add members
            this.squadManager.addMembers(value);
            this.addScore(value * 50);

            // Update UI with positive feedback
            this.events.emit('updateSquad', this.squadManager.getCount(), true);
        } else {
            // Remove members
            this.squadManager.removeMembers(Math.abs(value));

            // Update UI with negative feedback
            this.events.emit('updateSquad', this.squadManager.getCount(), false);
        }
    }

    /**
     * Spawn new gates and obstacles as player progresses
     */
    spawnContent() {
        const squadY = this.squadManager.getCenter().y;

        if (squadY + PERFORMANCE.SPAWN_DISTANCE > this.nextSpawnZ) {
            const spawnType = Math.random();

            if (spawnType < 0.5) {
                // Spawn gate
                this.gateManager.createGate(this.nextSpawnZ);
            } else {
                // Spawn obstacle cluster
                this.obstacleManager.createCluster(this.nextSpawnZ);
            }

            this.nextSpawnZ += Phaser.Math.Between(LEVEL.MIN_SPACING, LEVEL.MAX_SPACING);
        }
    }

    /**
     * Add to score
     */
    addScore(points) {
        this.score += points;
        this.events.emit('updateScore', this.score);
    }

    /**
     * Game Over
     */
    onGameOver() {
        console.log('💀 GAME OVER');
        this.gameState = 'gameover';

        // Stop all movement
        this.physics.pause();

        // Show game over screen
        this.showGameOverScreen();
    }

    /**
     * Victory
     */
    onVictory() {
        console.log('🎉 VICTORY!');
        this.gameState = 'victory';

        this.showVictoryScreen();
    }

    /**
     * Show game over screen
     */
    showGameOverScreen() {
        const overlay = this.add.rectangle(
            this.cameras.main.worldView.centerX,
            this.cameras.main.worldView.centerY,
            GAME.WIDTH,
            GAME.HEIGHT,
            0x000000,
            0.7
        );
        overlay.setScrollFactor(0);
        overlay.setDepth(1000);

        const text = this.add.text(
            this.cameras.main.worldView.centerX,
            this.cameras.main.worldView.centerY,
            'GAME OVER\n\nClick to Restart',
            {
                fontSize: '96px',
                color: '#FF4444',
                fontStyle: 'bold',
                align: 'center'
            }
        );
        text.setOrigin(0.5);
        text.setScrollFactor(0);
        text.setDepth(1001);

        const scoreText = this.add.text(
            this.cameras.main.worldView.centerX,
            this.cameras.main.worldView.centerY + 150,
            `Final Score: ${this.score}`,
            {
                fontSize: '48px',
                color: '#FFFFFF'
            }
        );
        scoreText.setOrigin(0.5);
        scoreText.setScrollFactor(0);
        scoreText.setDepth(1001);

        this.input.once('pointerdown', () => {
            this.scene.restart();
        });
    }

    /**
     * Show victory screen
     */
    showVictoryScreen() {
        const overlay = this.add.rectangle(
            this.cameras.main.worldView.centerX,
            this.cameras.main.worldView.centerY,
            GAME.WIDTH,
            GAME.HEIGHT,
            0x000000,
            0.7
        );
        overlay.setScrollFactor(0);
        overlay.setDepth(1000);

        const text = this.add.text(
            this.cameras.main.worldView.centerX,
            this.cameras.main.worldView.centerY,
            'VICTORY!\n\nClick to Continue',
            {
                fontSize: '96px',
                color: '#00FF00',
                fontStyle: 'bold',
                align: 'center'
            }
        );
        text.setOrigin(0.5);
        text.setScrollFactor(0);
        text.setDepth(1001);

        this.input.once('pointerdown', () => {
            this.scene.restart();
        });
    }

    /**
     * Cleanup
     */
    shutdown() {
        if (this.squadManager) this.squadManager.destroy();
        if (this.bulletManager) this.bulletManager.destroy();
        if (this.gateManager) this.gateManager.destroy();
        if (this.obstacleManager) this.obstacleManager.destroy();
    }
}
