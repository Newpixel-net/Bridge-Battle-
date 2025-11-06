import Phaser from 'phaser';
import { GAME, WORLD, SQUAD, COLORS, SCENES } from '../utils/GameConstants.js';

/**
 * GameScene - Phase 1: Foundation COMPLETE REBUILD
 *
 * Building step-by-step to match reference screenshots EXACTLY
 * Reference: screenshots-for-claude/the-required-results/Level1.png Frame 1
 *
 * Steps implemented:
 * 1. Portrait dimensions (540x960) ✓
 * 2. Brown road filling 75% width ✓
 * 3. Green grass on sides ✓
 * 4. White dashed center line ✓
 * 5. Single blue sphere character ✓
 * 6. Character positioned in lower third ✓
 * 7. Squad bubble ABOVE character (not at screen bottom) ✓
 */
export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.GAME });
    }

    init() {
        console.log('🎮 GameScene - Phase 1 Rebuild');

        // Game state
        this.gameState = 'playing';

        // Squad
        this.squadMembers = [];
        this.squadCenterX = GAME.WIDTH / 2;  // Center horizontally
        this.squadCenterY = SQUAD.START_Y;    // Lower third vertically

        // Input
        this.isDragging = false;
        this.targetX = this.squadCenterX;
    }

    create() {
        console.log('🎮 Building Phase 1 - Step by step...');

        // STEP 2-3: Create environment (road + grass)
        this.createEnvironment();

        // STEP 4: Add center line
        this.createCenterLine();

        // STEP 5-6: Add single character
        this.createCharacter();

        // STEP 7: Add squad bubble above character
        this.createSquadBubble();

        // STEP 10: Setup input
        this.setupInput();

        console.log('✓ Phase 1 Foundation ready!');
        console.log('✓ Compare with: screenshots-for-claude/the-required-results/Level1.png Frame 1');
    }

    /**
     * STEP 2-3: Create environment (road + grass)
     */
    createEnvironment() {
        const centerX = GAME.WIDTH / 2;
        const roadHalfWidth = WORLD.ROAD_WIDTH / 2;

        // Sky background
        this.add.rectangle(
            centerX,
            GAME.HEIGHT / 2,
            GAME.WIDTH,
            GAME.HEIGHT,
            COLORS.SKY_BLUE
        ).setDepth(-100);

        // Left grass
        const grassLeft = this.add.rectangle(
            0,
            GAME.HEIGHT / 2,
            centerX - roadHalfWidth,
            GAME.HEIGHT,
            COLORS.GRASS_GREEN
        );
        grassLeft.setOrigin(0, 0.5);
        grassLeft.setDepth(-50);

        // Right grass
        const grassRight = this.add.rectangle(
            centerX + roadHalfWidth,
            GAME.HEIGHT / 2,
            centerX - roadHalfWidth,
            GAME.HEIGHT,
            COLORS.GRASS_GREEN
        );
        grassRight.setOrigin(0, 0.5);
        grassRight.setDepth(-50);

        // Road (brown)
        this.add.rectangle(
            centerX,
            GAME.HEIGHT / 2,
            WORLD.ROAD_WIDTH,
            GAME.HEIGHT * 2,
            COLORS.ROAD_BROWN
        ).setDepth(-10);

        console.log('✓ Environment: Road (400px) + Grass on sides');
    }

    /**
     * STEP 4: Add white dashed center line
     */
    createCenterLine() {
        const centerX = GAME.WIDTH / 2;
        const graphics = this.add.graphics();
        graphics.lineStyle(4, COLORS.ROAD_LINE_WHITE, 1);
        graphics.setDepth(0);

        // Draw dashed line down the center
        for (let y = 0; y < GAME.HEIGHT * 2; y += 60) {
            graphics.lineBetween(centerX, y, centerX, y + 30);
        }

        graphics.strokePath();
        console.log('✓ Center line added');
    }

    /**
     * STEP 5-6: Create single character (blue sphere with 3D effect)
     */
    createCharacter() {
        const x = this.squadCenterX;
        const y = this.squadCenterY;
        const radius = SQUAD.CHARACTER_RADIUS;

        // Container for character
        const character = this.add.container(x, y);

        // Main body (bright blue)
        const body = this.add.circle(0, 0, radius, COLORS.SQUAD_BLUE);

        // Shadow (darker blue, bottom-right)
        const shadow = this.add.circle(3, 3, radius * 0.7, COLORS.SQUAD_BLUE_DARK, 0.4);

        // Highlight (white, top-left)
        const highlight = this.add.circle(-5, -5, radius * 0.35, COLORS.SQUAD_HIGHLIGHT, 0.9);

        // Add to container
        character.add([body, shadow, highlight]);
        character.setDepth(10);

        this.squadMembers.push(character);
        console.log(`✓ Character created at (${x}, ${y}) - radius ${radius}px`);
    }

    /**
     * STEP 7: Create squad bubble ABOVE character (not at screen bottom!)
     */
    createSquadBubble() {
        const x = this.squadCenterX;
        const y = this.squadCenterY - 60; // Above character

        // Blue bubble background
        this.squadBubble = this.add.circle(x, y, 30, COLORS.BUBBLE_BG, 0.9);
        this.squadBubble.setStrokeStyle(3, COLORS.BUBBLE_BORDER);
        this.squadBubble.setDepth(20);

        // Squad count text
        this.squadText = this.add.text(x, y, '1', {
            fontSize: '48px',
            fontFamily: 'Arial Black',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 4
        });
        this.squadText.setOrigin(0.5);
        this.squadText.setDepth(21);

        console.log(`✓ Squad bubble created ABOVE character at (${x}, ${y})`);
    }

    /**
     * STEP 10: Setup input (drag left/right)
     */
    setupInput() {
        // Touch/Mouse
        this.input.on('pointerdown', (pointer) => {
            this.isDragging = true;
        });

        this.input.on('pointermove', (pointer) => {
            if (this.isDragging) {
                // Calculate target X from pointer position
                const centerX = GAME.WIDTH / 2;
                const roadHalfWidth = WORLD.ROAD_WIDTH / 2;
                const offsetX = pointer.x - centerX;

                // Clamp to road bounds
                this.targetX = centerX + Phaser.Math.Clamp(
                    offsetX,
                    -SQUAD.HORIZONTAL_LIMIT,
                    SQUAD.HORIZONTAL_LIMIT
                );
            }
        });

        this.input.on('pointerup', () => {
            this.isDragging = false;
        });

        // Keyboard (for testing)
        this.cursors = this.input.keyboard.createCursorKeys();

        console.log('✓ Input ready - Drag to move left/right');
    }

    /**
     * Update loop
     */
    update(time, delta) {
        if (this.gameState !== 'playing') return;

        const dt = delta / 1000;

        // Handle keyboard input
        if (this.cursors.left.isDown) {
            this.targetX = (GAME.WIDTH / 2) - SQUAD.HORIZONTAL_LIMIT;
        } else if (this.cursors.right.isDown) {
            this.targetX = (GAME.WIDTH / 2) + SQUAD.HORIZONTAL_LIMIT;
        }

        // Smooth movement toward target
        this.squadCenterX = Phaser.Math.Linear(
            this.squadCenterX,
            this.targetX,
            SQUAD.FORMATION_LERP
        );

        // Update character position
        if (this.squadMembers[0]) {
            this.squadMembers[0].x = this.squadCenterX;
        }

        // Update bubble position
        if (this.squadBubble) {
            this.squadBubble.x = this.squadCenterX;
            this.squadText.x = this.squadCenterX;
        }
    }

    shutdown() {
        console.log('🛑 GameScene shutdown');
        this.input.off('pointerdown');
        this.input.off('pointermove');
        this.input.off('pointerup');
    }
}
