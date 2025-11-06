import Phaser from 'phaser';
import { GAME, WORLD, SQUAD, CAMERA, COLORS, SCENES } from '../utils/GameConstants.js';
import SquadManager from '../systems/SquadManager.js';

/**
 * GameScene - Phase 1: Foundation
 *
 * Implements core gameplay loop:
 * - Squad movement with hexagonal formation
 * - Player input (touch/mouse drag)
 * - Camera following
 * - Simple bridge environment
 *
 * SUCCESS CRITERIA:
 * - Squad stays in tight blob formation ✓
 * - Smooth horizontal movement ✓
 * - No performance issues with 50 characters ✓
 */
export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.GAME });
    }

    init() {
        console.log('🎮 GameScene initializing...');

        // Game state
        this.gameState = 'playing';

        // Systems
        this.squadManager = null;

        // Input tracking
        this.isDragging = false;
        this.pointerX = 0;
    }

    create() {
        console.log('🎮 GameScene created - Building Phase 1...');

        // 1. Create environment
        this.createEnvironment();

        // 2. Initialize squad system
        this.squadManager = new SquadManager(this);
        this.squadManager.init(SQUAD.START_SIZE);

        // 3. Setup camera
        this.setupCamera();

        // 4. Setup input
        this.setupInput();

        // 5. Launch UI scene
        this.scene.launch(SCENES.UI);
        this.updateUI();

        console.log('✓ Phase 1 Foundation ready!');
        console.log(`✓ Squad initialized with ${this.squadManager.getCount()} members`);
    }

    /**
     * Create game environment
     * - Sky background
     * - Grass on sides
     * - Brown bridge/road
     * - Lane markings
     */
    createEnvironment() {
        const centerX = 0;

        // Sky background (parallax effect)
        const sky = this.add.rectangle(
            centerX,
            0,
            GAME.WIDTH * 3,
            GAME.HEIGHT * 3,
            COLORS.SKY_TOP
        );
        sky.setOrigin(0.5, 0);
        sky.setDepth(-100);
        sky.setScrollFactor(0.3, 0.1); // Parallax

        // Grass on sides (outside bridge)
        const grassLeft = this.add.rectangle(
            centerX - WORLD.BRIDGE_WIDTH,
            0,
            GAME.WIDTH * 2,
            WORLD.BRIDGE_LENGTH + 2000,
            COLORS.GRASS_SIDE
        );
        grassLeft.setOrigin(1, 0);
        grassLeft.setDepth(-50);

        const grassRight = this.add.rectangle(
            centerX + WORLD.BRIDGE_WIDTH,
            0,
            GAME.WIDTH * 2,
            WORLD.BRIDGE_LENGTH + 2000,
            COLORS.GRASS_SIDE
        );
        grassRight.setOrigin(0, 0);
        grassRight.setDepth(-50);

        // Bridge road (brown asphalt)
        const bridge = this.add.rectangle(
            centerX,
            0,
            WORLD.BRIDGE_WIDTH,
            WORLD.BRIDGE_LENGTH + 1000,
            COLORS.BRIDGE_ROAD
        );
        bridge.setOrigin(0.5, 0);
        bridge.setDepth(-10);

        // Bridge edges (red railings)
        const edgeWidth = 20;
        const leftEdge = this.add.rectangle(
            centerX - WORLD.BRIDGE_WIDTH / 2,
            0,
            edgeWidth,
            WORLD.BRIDGE_LENGTH + 1000,
            COLORS.BRIDGE_EDGE
        );
        leftEdge.setOrigin(0.5, 0);
        leftEdge.setDepth(-5);

        const rightEdge = this.add.rectangle(
            centerX + WORLD.BRIDGE_WIDTH / 2,
            0,
            edgeWidth,
            WORLD.BRIDGE_LENGTH + 1000,
            COLORS.BRIDGE_EDGE
        );
        rightEdge.setOrigin(0.5, 0);
        rightEdge.setDepth(-5);

        // Lane markings (white dashed lines)
        this.createLaneMarkings(centerX);

        // Zebra crossings (white stripes across road)
        this.createZebraCrossings(centerX);

        console.log('✓ Environment created');
    }

    /**
     * Create white dashed lane markings
     */
    createLaneMarkings(centerX) {
        const graphics = this.add.graphics();
        graphics.setDepth(-8);
        graphics.lineStyle(6, COLORS.BRIDGE_LINES, 0.6);

        // Center line
        for (let y = -200; y < WORLD.BRIDGE_LENGTH + 200; y += 100) {
            graphics.lineBetween(centerX, y, centerX, y + 50);
        }

        graphics.strokePath();
    }

    /**
     * Create zebra crossings (crosswalk stripes) - matching screenshots
     */
    createZebraCrossings(centerX) {
        const graphics = this.add.graphics();
        graphics.setDepth(-8);

        // Create zebra crossings every 400-600 units
        for (let y = 400; y < WORLD.BRIDGE_LENGTH; y += 550) {
            this.drawZebraCrossing(graphics, centerX, y);
        }
    }

    /**
     * Draw a single zebra crossing at position
     */
    drawZebraCrossing(graphics, centerX, y) {
        const stripeWidth = 40;
        const stripeHeight = 12;
        const roadWidth = WORLD.BRIDGE_WIDTH;
        const numStripes = 12;

        graphics.fillStyle(COLORS.BRIDGE_LINES, 0.9);

        for (let i = 0; i < numStripes; i++) {
            const x = centerX - roadWidth / 2 + (i * (roadWidth / numStripes));
            graphics.fillRect(x, y, stripeWidth, stripeHeight);
        }
    }

    /**
     * Setup camera to follow squad
     */
    setupCamera() {
        // Set camera bounds
        this.cameras.main.setBounds(
            -GAME.WIDTH,
            -500,
            GAME.WIDTH * 2,
            WORLD.BRIDGE_LENGTH + 2000
        );

        // Set camera zoom for better character visibility
        this.cameras.main.setZoom(CAMERA.ZOOM);

        // Start at squad position
        const squadPos = this.squadManager.getCenter();
        this.cameras.main.scrollY = squadPos.y + CAMERA.FOLLOW_OFFSET_Y;
        this.cameras.main.scrollX = 0; // Center horizontally

        console.log('✓ Camera setup complete');
        console.log(`  Zoom: ${CAMERA.ZOOM}x`);
    }

    /**
     * Setup player input (touch/mouse drag + keyboard fallback)
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

        // Keyboard fallback (for testing)
        this.cursors = this.input.keyboard.createCursorKeys();

        // Debug keys
        this.input.keyboard.on('keydown-PLUS', () => {
            this.squadManager.addMembers(5);
            this.updateUI();
        });

        this.input.keyboard.on('keydown-MINUS', () => {
            this.squadManager.removeMembers(5);
            this.updateUI();
        });

        console.log('✓ Input system ready');
        console.log('  - Drag/Touch for movement');
        console.log('  - Arrow keys for testing');
        console.log('  - +/- keys to add/remove squad members');
    }

    /**
     * Main update loop
     */
    update(time, delta) {
        if (this.gameState !== 'playing') return;

        // 1. Handle input
        this.handleInput(delta);

        // 2. Update squad
        this.squadManager.update(delta);

        // 3. Update camera
        this.updateCamera(delta);

        // 4. Update UI
        this.updateUI();
    }

    /**
     * Handle player input
     */
    handleInput(delta) {
        let targetX = 0;

        if (this.isDragging) {
            // Convert screen X to world X (-250 to +250)
            const normalizedX = (this.pointerX / GAME.WIDTH) - 0.5;
            targetX = normalizedX * WORLD.BRIDGE_WIDTH * 0.8; // 80% of bridge width
        } else if (this.cursors) {
            // Keyboard fallback
            if (this.cursors.left.isDown) {
                targetX = -SQUAD.HORIZONTAL_LIMIT;
            } else if (this.cursors.right.isDown) {
                targetX = SQUAD.HORIZONTAL_LIMIT;
            }
        }

        this.squadManager.setTargetX(targetX);
    }

    /**
     * Update camera to smoothly follow squad
     */
    updateCamera(delta) {
        const squadCenter = this.squadManager.getCenter();
        const targetY = squadCenter.y + CAMERA.FOLLOW_OFFSET_Y;

        // Smooth camera follow using lerp
        const currentY = this.cameras.main.scrollY;
        const newY = Phaser.Math.Linear(currentY, targetY, CAMERA.FOLLOW_LERP);

        this.cameras.main.scrollY = newY;
    }

    /**
     * Update UI with current squad count
     */
    updateUI() {
        const count = this.squadManager.getCount();
        this.events.emit('updateSquad', count);
    }

    /**
     * Cleanup when scene shuts down
     */
    shutdown() {
        console.log('🛑 GameScene shutting down');

        if (this.squadManager) {
            this.squadManager.destroy();
        }

        // Remove input listeners
        this.input.off('pointerdown');
        this.input.off('pointermove');
        this.input.off('pointerup');
    }
}
