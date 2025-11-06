import Phaser from 'phaser';
import { GAME, WORLD, SQUAD, COLORS, SCENES, UI } from '../utils/GameConstants.js';

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
        this.groundShadows = [];
        this.formationPositions = [];
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

        // Add zebra crossings
        this.createZebraCrossings();

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

        // Road (brown) with depth gradient
        this.add.rectangle(
            centerX,
            GAME.HEIGHT / 2,
            WORLD.ROAD_WIDTH,
            GAME.HEIGHT * 2,
            COLORS.ROAD_BROWN
        ).setDepth(-10);

        // Add depth gradient (darker at top, lighter at bottom)
        const gradientSteps = 8;
        for (let i = 0; i < gradientSteps; i++) {
            const alpha = (1 - (i / gradientSteps)) * 0.3; // Darker at top
            const y = (i / gradientSteps) * GAME.HEIGHT;
            const height = GAME.HEIGHT / gradientSteps;

            this.add.rectangle(
                centerX,
                y + height / 2,
                WORLD.ROAD_WIDTH,
                height,
                0x000000,
                alpha
            ).setDepth(-9);
        }

        // Road edges/barriers (dark lines on both sides)
        const edgeWidth = 8;
        const edgeColor = 0x4A4A4A;

        // Left edge
        this.add.rectangle(
            centerX - roadHalfWidth,
            GAME.HEIGHT / 2,
            edgeWidth,
            GAME.HEIGHT * 2,
            edgeColor
        ).setDepth(-5);

        // Right edge
        this.add.rectangle(
            centerX + roadHalfWidth,
            GAME.HEIGHT / 2,
            edgeWidth,
            GAME.HEIGHT * 2,
            edgeColor
        ).setDepth(-5);

        console.log('✓ Environment: Road (400px) + Grass on sides + Barriers');
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
     * Add zebra crossings (white striped crosswalks)
     */
    createZebraCrossings() {
        const centerX = GAME.WIDTH / 2;
        const roadHalfWidth = WORLD.ROAD_WIDTH / 2;
        const graphics = this.add.graphics();
        graphics.setDepth(-5); // Above road, below center line

        // Zebra crossing stripe dimensions
        const stripeWidth = WORLD.ROAD_WIDTH * 0.9; // 90% of road width
        const stripeHeight = 15;
        const stripeGap = 12;
        const stripesPerCrossing = 8;

        // Add crossings at intervals
        const crossingPositions = [200, 500, 900, 1300, 1700];

        crossingPositions.forEach(startY => {
            graphics.fillStyle(COLORS.ROAD_LINE_WHITE, 1);

            for (let i = 0; i < stripesPerCrossing; i++) {
                const y = startY + (i * (stripeHeight + stripeGap));
                graphics.fillRect(
                    centerX - stripeWidth / 2,
                    y,
                    stripeWidth,
                    stripeHeight
                );
            }
        });

        console.log('✓ Zebra crossings added');
    }

    /**
     * STEP 5-6: Create single character (blue sphere with 3D effect)
     */
    createCharacter() {
        const x = this.squadCenterX;
        const y = this.squadCenterY;
        const radius = SQUAD.CHARACTER_RADIUS;

        // Ground shadow (ellipse beneath character)
        const groundShadow = this.add.ellipse(x, y + radius + 5, radius * 1.5, radius * 0.5, 0x000000, 0.3);
        groundShadow.setDepth(5);

        // Container for character
        const character = this.add.container(x, y);

        // Main body (bright blue)
        const body = this.add.circle(0, 0, radius, COLORS.SQUAD_BLUE);

        // Shadow gradient (darker blue, bottom-right) - larger for better 3D effect
        const shadow1 = this.add.circle(4, 4, radius * 0.85, COLORS.SQUAD_BLUE_DARK, 0.25);
        const shadow2 = this.add.circle(3, 3, radius * 0.7, COLORS.SQUAD_BLUE_DARK, 0.35);

        // Highlight (white, top-left) - brighter and more defined
        const highlight1 = this.add.circle(-6, -6, radius * 0.4, COLORS.SQUAD_HIGHLIGHT, 0.6);
        const highlight2 = this.add.circle(-4, -4, radius * 0.25, COLORS.SQUAD_HIGHLIGHT, 0.95);

        // Simple face - two eyes
        const eyeSize = radius * 0.12;
        const eyeY = -radius * 0.1;
        const eyeSpacing = radius * 0.35;

        const leftEye = this.add.circle(-eyeSpacing, eyeY, eyeSize, 0x000000, 0.8);
        const rightEye = this.add.circle(eyeSpacing, eyeY, eyeSize, 0x000000, 0.8);

        // Add to container in correct order (back to front)
        character.add([body, shadow1, shadow2, highlight1, highlight2, leftEye, rightEye]);
        character.setDepth(10);

        // Store formation properties
        character.formationX = 0;
        character.formationY = 0;
        character.groundShadow = groundShadow;

        this.squadMembers.push(character);
        this.groundShadows.push(groundShadow);

        // Calculate initial formation
        this.recalculateFormation();

        console.log(`✓ Character created at (${x}, ${y}) - radius ${radius}px`);
    }

    /**
     * STEP 7: Create squad bubble ABOVE character (not at screen bottom!)
     */
    createSquadBubble() {
        const x = this.squadCenterX;
        const y = this.squadCenterY + UI.BUBBLE_OFFSET_Y; // Above character

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

        // Add squad members for testing (+ key)
        this.input.keyboard.on('keydown-EQUALS', () => {
            this.addSquadMember();
        });

        // Add multiple squad members (SPACE key - add 5)
        this.input.keyboard.on('keydown-SPACE', () => {
            for (let i = 0; i < 5; i++) {
                this.time.delayedCall(i * 50, () => this.addSquadMember());
            }
        });

        console.log('✓ Input ready - Drag to move, + to add members, SPACE to add 5');
    }

    /**
     * Calculate hexagonal close-packed formation positions
     */
    calculateHexagonalFormation(count) {
        const positions = [];
        const spacing = SQUAD.FORMATION_SPACING;

        if (count === 0) return positions;

        // Center character at origin
        positions.push({ x: 0, y: 0 });

        if (count === 1) return positions;

        // Build outward in hexagonal rings
        let ring = 1;
        let positionIndex = 1;

        while (positionIndex < count) {
            const pointsInRing = ring * 6;

            for (let i = 0; i < pointsInRing && positionIndex < count; i++) {
                const angle = (i / pointsInRing) * Math.PI * 2;
                const distance = ring * spacing;

                positions.push({
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance
                });

                positionIndex++;
            }

            ring++;
        }

        return positions;
    }

    /**
     * Recalculate formation positions for all squad members
     */
    recalculateFormation() {
        this.formationPositions = this.calculateHexagonalFormation(this.squadMembers.length);

        this.squadMembers.forEach((member, index) => {
            if (this.formationPositions[index]) {
                member.formationX = this.formationPositions[index].x;
                member.formationY = this.formationPositions[index].y;
            }
        });
    }

    /**
     * Add a new squad member with formation
     */
    addSquadMember() {
        if (this.squadMembers.length >= SQUAD.MAX_SIZE) {
            console.log('⚠️ Max squad size reached');
            return;
        }

        const x = this.squadCenterX;
        const y = this.squadCenterY;
        const radius = SQUAD.CHARACTER_RADIUS;

        // Ground shadow (ellipse beneath character)
        const groundShadow = this.add.ellipse(x, y + radius + 5, radius * 1.5, radius * 0.5, 0x000000, 0.3);
        groundShadow.setDepth(5);

        // Container for character
        const character = this.add.container(x, y);

        // Main body (bright blue)
        const body = this.add.circle(0, 0, radius, COLORS.SQUAD_BLUE);

        // Shadow gradient (darker blue, bottom-right) - larger for better 3D effect
        const shadow1 = this.add.circle(4, 4, radius * 0.85, COLORS.SQUAD_BLUE_DARK, 0.25);
        const shadow2 = this.add.circle(3, 3, radius * 0.7, COLORS.SQUAD_BLUE_DARK, 0.35);

        // Highlight (white, top-left) - brighter and more defined
        const highlight1 = this.add.circle(-6, -6, radius * 0.4, COLORS.SQUAD_HIGHLIGHT, 0.6);
        const highlight2 = this.add.circle(-4, -4, radius * 0.25, COLORS.SQUAD_HIGHLIGHT, 0.95);

        // Simple face - two eyes
        const eyeSize = radius * 0.12;
        const eyeY = -radius * 0.1;
        const eyeSpacing = radius * 0.35;

        const leftEye = this.add.circle(-eyeSpacing, eyeY, eyeSize, 0x000000, 0.8);
        const rightEye = this.add.circle(eyeSpacing, eyeY, eyeSize, 0x000000, 0.8);

        // Add to container in correct order (back to front)
        character.add([body, shadow1, shadow2, highlight1, highlight2, leftEye, rightEye]);
        character.setDepth(10);

        // Formation properties
        character.formationX = 0;
        character.formationY = 0;
        character.groundShadow = groundShadow;

        // Spawn animation
        character.setScale(0);
        this.tweens.add({
            targets: character,
            scale: 1.0,
            duration: 300,
            ease: 'Back.easeOut'
        });

        groundShadow.setScale(0);
        this.tweens.add({
            targets: groundShadow,
            scale: 1.0,
            duration: 300,
            ease: 'Back.easeOut'
        });

        this.squadMembers.push(character);
        this.groundShadows.push(groundShadow);

        // Recalculate formation
        this.recalculateFormation();

        // Update squad count display
        this.updateSquadCount();

        console.log(`✓ Squad member added (total: ${this.squadMembers.length})`);
    }

    /**
     * Update squad count display
     */
    updateSquadCount() {
        const count = this.squadMembers.length;
        this.squadText.setText(count.toString());

        // Pulse animation
        this.tweens.add({
            targets: [this.squadText, this.squadBubble],
            scale: 1.15,
            duration: 150,
            yoyo: true,
            ease: 'Back.easeOut'
        });
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

        // Update all squad members to their formation positions
        this.squadMembers.forEach((member, index) => {
            if (!member.active) return;

            // Target position (center + formation offset)
            const targetWorldX = this.squadCenterX + member.formationX;
            const targetWorldY = this.squadCenterY + member.formationY;

            // Smooth movement to formation position
            member.x = Phaser.Math.Linear(
                member.x,
                targetWorldX,
                SQUAD.FORMATION_LERP
            );

            member.y = Phaser.Math.Linear(
                member.y,
                targetWorldY,
                SQUAD.FORMATION_LERP
            );

            // Update ground shadow position
            if (member.groundShadow) {
                member.groundShadow.x = member.x;
                member.groundShadow.y = member.y + SQUAD.CHARACTER_RADIUS + 5;
            }
        });

        // Update bubble position (follow center of formation)
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
