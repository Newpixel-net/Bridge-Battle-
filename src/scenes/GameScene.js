import Phaser from 'phaser';
import { GAME, WORLD, SQUAD, COLORS, SCENES, UI, COLLECTIBLES, OBSTACLES, GATES } from '../utils/GameConstants.js';

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
        console.log('🎮 GameScene - Phase 1: Gaming Functionality');

        // Game state
        this.gameState = 'playing';
        this.distance = 0;              // Total distance traveled
        this.scrollOffset = 0;          // Current scroll offset for objects

        // Squad
        this.squadMembers = [];
        this.groundShadows = [];
        this.formationPositions = [];
        this.squadCenterX = GAME.WIDTH / 2;  // Center horizontally
        this.squadCenterY = SQUAD.START_Y;    // Lower third vertically

        // Game objects
        this.collectibles = [];
        this.obstacles = [];
        this.gates = [];

        // Spawn tracking
        this.nextCollectibleSpawn = COLLECTIBLES.SPAWN_INTERVAL;
        this.nextObstacleSpawn = OBSTACLES.SPAWN_INTERVAL;
        this.nextGateSpawn = GATES.SPAWN_INTERVAL;

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

        // Add distance counter UI
        this.createDistanceUI();

        // STEP 10: Setup input
        this.setupInput();

        console.log('✓ Phase 1 Foundation ready with gameplay!');
        console.log('✓ Auto-scroll, collectibles, obstacles, and gates active');
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
     * Add zebra crossings (white striped crosswalks) - REDUCED
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
        const stripesPerCrossing = 6; // Reduced from 8

        // Fewer crossings - only 2 visible at start
        const crossingPositions = [400, 1200];

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

        console.log('✓ Zebra crossings added (reduced)');
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
     * Create enhanced UI
     */
    createDistanceUI() {
        const uiDepth = 100;

        // Top-left panel background
        const panelBg = this.add.rectangle(10, 10, 250, 100, 0x000000, 0.5);
        panelBg.setOrigin(0, 0);
        panelBg.setDepth(uiDepth);
        panelBg.setScrollFactor(0);

        // Distance counter
        this.distanceText = this.add.text(20, 20, 'Distance: 0m', {
            fontSize: '22px',
            fontFamily: 'Arial Black',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 4
        });
        this.distanceText.setDepth(uiDepth + 1);
        this.distanceText.setScrollFactor(0);

        // Speed indicator
        this.speedText = this.add.text(20, 50, `Speed: ${WORLD.SCROLL_SPEED}m/s`, {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#00BCD4',
            stroke: '#000000',
            strokeThickness: 3
        });
        this.speedText.setDepth(uiDepth + 1);
        this.speedText.setScrollFactor(0);

        // Squad size (separate from bubble - for clarity)
        this.squadSizeUI = this.add.text(20, 75, 'Squad: 1', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: COLORS.SQUAD_BLUE,
            stroke: '#000000',
            strokeThickness: 3
        });
        this.squadSizeUI.setDepth(uiDepth + 1);
        this.squadSizeUI.setScrollFactor(0);

        console.log('✓ Enhanced UI created');
    }

    /**
     * Spawn a collectible item
     */
    spawnCollectible() {
        const centerX = GAME.WIDTH / 2;
        const roadHalfWidth = WORLD.ROAD_WIDTH / 2;

        // Random X position on road
        const x = Phaser.Math.Between(
            centerX - roadHalfWidth + COLLECTIBLES.SIZE * 2,
            centerX + roadHalfWidth - COLLECTIBLES.SIZE * 2
        );
        const y = -COLLECTIBLES.SIZE; // Spawn above screen

        // Create collectible container
        const collectible = this.add.container(x, y);

        // Green circle
        const circle = this.add.circle(0, 0, COLLECTIBLES.SIZE, COLORS.COLLECTIBLE);

        // Highlight
        const highlight = this.add.circle(-5, -5, COLLECTIBLES.SIZE * 0.4, 0xFFFFFF, 0.6);

        // +1 text
        const text = this.add.text(0, 0, '+1', {
            fontSize: '16px',
            fontFamily: 'Arial Black',
            color: '#FFFFFF'
        });
        text.setOrigin(0.5);

        collectible.add([circle, highlight, text]);
        collectible.setDepth(8);
        collectible.type = 'collectible';
        collectible.collected = false;

        this.collectibles.push(collectible);
    }

    /**
     * Spawn an obstacle
     */
    spawnObstacle() {
        const centerX = GAME.WIDTH / 2;
        const roadHalfWidth = WORLD.ROAD_WIDTH / 2;

        // Random X position on road
        const x = Phaser.Math.Between(
            centerX - roadHalfWidth + OBSTACLES.WIDTH / 2,
            centerX + roadHalfWidth - OBSTACLES.WIDTH / 2
        );
        const y = -OBSTACLES.HEIGHT; // Spawn above screen

        // Create obstacle container
        const obstacle = this.add.container(x, y);

        // Red rectangle
        const rect = this.add.rectangle(0, 0, OBSTACLES.WIDTH, OBSTACLES.HEIGHT, COLORS.OBSTACLE);

        // Dark border
        const border = this.add.rectangle(0, 0, OBSTACLES.WIDTH, OBSTACLES.HEIGHT);
        border.setStrokeStyle(4, 0x8B0000);
        border.setFillStyle();

        // -5 text
        const text = this.add.text(0, 0, `-${OBSTACLES.DAMAGE}`, {
            fontSize: '20px',
            fontFamily: 'Arial Black',
            color: '#FFFFFF'
        });
        text.setOrigin(0.5);

        obstacle.add([rect, border, text]);
        obstacle.setDepth(8);
        obstacle.type = 'obstacle';
        obstacle.hit = false;

        this.obstacles.push(obstacle);
    }

    /**
     * Spawn a math gate (two options)
     */
    spawnGate() {
        const centerX = GAME.WIDTH / 2;
        const y = -GATES.HEIGHT; // Spawn above screen

        // Generate random math operations
        const operations = [
            { op: 'x2', mult: 2, color: COLORS.GATE_GOOD },
            { op: 'x3', mult: 3, color: COLORS.GATE_GOOD },
            { op: '+10', add: 10, color: COLORS.GATE_GOOD },
            { op: '+20', add: 20, color: COLORS.GATE_GOOD },
            { op: '/2', div: 2, color: COLORS.GATE_BAD },
            { op: '-5', sub: 5, color: COLORS.GATE_BAD },
            { op: '-10', sub: 10, color: COLORS.GATE_BAD },
        ];

        // Pick two random operations
        const left = Phaser.Utils.Array.GetRandom(operations);
        const right = Phaser.Utils.Array.GetRandom(operations.filter(o => o !== left));

        // Create left gate
        const leftX = centerX - GATES.GAP / 2 - GATES.WIDTH / 2;
        const leftGate = this.createGateHalf(leftX, y, left.op, left.color);
        leftGate.operation = left;

        // Create right gate
        const rightX = centerX + GATES.GAP / 2 + GATES.WIDTH / 2;
        const rightGate = this.createGateHalf(rightX, y, right.op, right.color);
        rightGate.operation = right;

        this.gates.push({ left: leftGate, right: rightGate, passed: false });
    }

    /**
     * Create one half of a gate
     */
    createGateHalf(x, y, label, color) {
        const gate = this.add.container(x, y);

        // Background rectangle with gradient effect
        const bg = this.add.rectangle(0, 0, GATES.WIDTH, GATES.HEIGHT, color, 0.8);
        bg.setStrokeStyle(3, color, 0.5);

        // Inner glow rectangle
        const innerGlow = this.add.rectangle(0, 0, GATES.WIDTH - 10, GATES.HEIGHT - 10, 0xFFFFFF, 0.2);

        // Border - thicker and more prominent
        const border = this.add.rectangle(0, 0, GATES.WIDTH, GATES.HEIGHT);
        border.setStrokeStyle(8, 0xFFFFFF, 0.9);
        border.setFillStyle();

        // Operation text - larger and more visible
        const text = this.add.text(0, 0, label, {
            fontSize: '42px',
            fontFamily: 'Arial Black',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 6
        });
        text.setOrigin(0.5);

        gate.add([bg, innerGlow, border, text]);
        gate.setDepth(8);
        gate.type = 'gate';

        // Pulse animation
        this.tweens.add({
            targets: gate,
            scale: 1.05,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        return gate;
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

        // Update UI panel
        if (this.squadSizeUI) {
            this.squadSizeUI.setText(`Squad: ${count}`);
        }

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
     * Update loop - with gameplay mechanics!
     */
    update(time, delta) {
        if (this.gameState !== 'playing') return;

        const dt = delta / 1000;

        // ========== AUTO-SCROLL ==========
        const scrollAmount = WORLD.SCROLL_SPEED * dt;
        this.distance += scrollAmount;
        this.scrollOffset += scrollAmount;

        // Update distance UI
        this.distanceText.setText(`Distance: ${Math.floor(this.distance)}m`);

        // ========== SPAWN GAME OBJECTS ==========
        // Spawn collectibles
        if (this.distance >= this.nextCollectibleSpawn) {
            this.spawnCollectible();
            this.nextCollectibleSpawn = this.distance + COLLECTIBLES.SPAWN_INTERVAL;
        }

        // Spawn obstacles
        if (this.distance >= this.nextObstacleSpawn) {
            this.spawnObstacle();
            this.nextObstacleSpawn = this.distance + OBSTACLES.SPAWN_INTERVAL;
        }

        // Spawn gates
        if (this.distance >= this.nextGateSpawn) {
            this.spawnGate();
            this.nextGateSpawn = this.distance + GATES.SPAWN_INTERVAL;
        }

        // ========== MOVE GAME OBJECTS ==========
        // Move collectibles
        this.collectibles.forEach(collectible => {
            collectible.y += scrollAmount;
        });

        // Move obstacles
        this.obstacles.forEach(obstacle => {
            obstacle.y += scrollAmount;
        });

        // Move gates
        this.gates.forEach(gate => {
            gate.left.y += scrollAmount;
            gate.right.y += scrollAmount;
        });

        // ========== COLLISION DETECTION ==========
        this.checkCollisions();

        // ========== CLEANUP OFFSCREEN OBJECTS ==========
        this.collectibles = this.collectibles.filter(c => {
            if (c.y > GAME.HEIGHT + 100) {
                c.destroy();
                return false;
            }
            return true;
        });

        this.obstacles = this.obstacles.filter(o => {
            if (o.y > GAME.HEIGHT + 100) {
                o.destroy();
                return false;
            }
            return true;
        });

        this.gates = this.gates.filter(g => {
            if (g.left.y > GAME.HEIGHT + 200) {
                g.left.destroy();
                g.right.destroy();
                return false;
            }
            return true;
        });

        // ========== PLAYER INPUT ==========
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

        // ========== UPDATE SQUAD FORMATION ==========
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

    /**
     * Check collisions with game objects
     */
    checkCollisions() {
        const centerX = this.squadCenterX;
        const centerY = this.squadCenterY;

        // Check collectibles
        this.collectibles.forEach(collectible => {
            if (collectible.collected) return;

            const dist = Phaser.Math.Distance.Between(
                centerX, centerY,
                collectible.x, collectible.y
            );

            if (dist < SQUAD.CHARACTER_RADIUS + COLLECTIBLES.SIZE) {
                collectible.collected = true;
                this.addSquadMember();

                // Visual feedback - green flash
                this.cameras.main.flash(100, 0, 255, 0, false, (camera, progress) => {
                    if (progress === 1) {
                        // Flash complete
                    }
                });

                // Particle burst
                this.createParticleBurst(collectible.x, collectible.y, COLORS.COLLECTIBLE, 8);

                // Collect animation
                this.tweens.add({
                    targets: collectible,
                    scale: 1.5,
                    alpha: 0,
                    duration: 200,
                    ease: 'Back.easeIn',
                    onComplete: () => collectible.destroy()
                });
            }
        });

        // Check obstacles
        this.obstacles.forEach(obstacle => {
            if (obstacle.hit) return;

            const dist = Phaser.Math.Distance.Between(
                centerX, centerY,
                obstacle.x, obstacle.y
            );

            if (dist < SQUAD.CHARACTER_RADIUS + OBSTACLES.WIDTH / 2) {
                obstacle.hit = true;
                this.removeSquadMembers(OBSTACLES.DAMAGE);

                // Camera shake
                this.cameras.main.shake(200, 0.01);

                // Visual feedback - flash red and shake
                this.cameras.main.flash(150, 255, 0, 0);

                // Particle explosion
                this.createParticleBurst(obstacle.x, obstacle.y, COLORS.OBSTACLE, 12);

                this.tweens.add({
                    targets: obstacle,
                    scale: 1.2,
                    alpha: 0,
                    angle: 45,
                    duration: 300,
                    ease: 'Back.easeIn',
                    onComplete: () => obstacle.destroy()
                });
            }
        });

        // Check gates
        this.gates.forEach(gate => {
            if (gate.passed) return;

            // Check if squad passed through gate area
            const gateY = gate.left.y;
            if (centerY < gateY + GATES.HEIGHT / 2 && centerY > gateY - GATES.HEIGHT / 2) {
                // Determine which side player is on
                if (centerX < GAME.WIDTH / 2) {
                    // Left gate
                    this.applyGateOperation(gate.left.operation);
                } else {
                    // Right gate
                    this.applyGateOperation(gate.right.operation);
                }
                gate.passed = true;

                // Determine which gate was chosen
                const chosenGate = centerX < GAME.WIDTH / 2 ? gate.left : gate.right;
                const unchosen = centerX < GAME.WIDTH / 2 ? gate.right : gate.left;

                // Chosen gate - expand and flash
                this.tweens.add({
                    targets: chosenGate,
                    scale: 1.3,
                    alpha: 0,
                    duration: 400,
                    ease: 'Back.easeIn'
                });

                // Unchosen gate - fade out
                this.tweens.add({
                    targets: unchosen,
                    alpha: 0,
                    duration: 300
                });

                // Flash effect based on gate type
                const isGoodGate = chosenGate.operation.mult || chosenGate.operation.add;
                if (isGoodGate) {
                    this.cameras.main.flash(200, 0, 200, 255); // Cyan flash for good
                } else {
                    this.cameras.main.flash(200, 255, 100, 0); // Orange flash for bad
                }
            }
        });
    }

    /**
     * Apply gate math operation
     */
    applyGateOperation(operation) {
        let currentSize = this.squadMembers.length;
        let newSize = currentSize;

        if (operation.mult) {
            newSize = Math.floor(currentSize * operation.mult);
        } else if (operation.add) {
            newSize = currentSize + operation.add;
        } else if (operation.div) {
            newSize = Math.floor(currentSize / operation.div);
        } else if (operation.sub) {
            newSize = Math.max(1, currentSize - operation.sub);
        }

        // Ensure at least 1 member
        newSize = Math.max(1, newSize);

        const diff = newSize - currentSize;

        if (diff > 0) {
            // Add members
            for (let i = 0; i < diff; i++) {
                this.time.delayedCall(i * 30, () => this.addSquadMember());
            }
        } else if (diff < 0) {
            // Remove members
            this.removeSquadMembers(Math.abs(diff));
        }

        console.log(`Gate ${operation.op}: ${currentSize} → ${newSize}`);
    }

    /**
     * Remove squad members
     */
    removeSquadMembers(count) {
        for (let i = 0; i < count && this.squadMembers.length > 0; i++) {
            const member = this.squadMembers.pop();
            const shadow = member.groundShadow;

            this.tweens.add({
                targets: member,
                scale: 0,
                alpha: 0,
                duration: 200,
                onComplete: () => member.destroy()
            });

            if (shadow) {
                this.tweens.add({
                    targets: shadow,
                    scale: 0,
                    alpha: 0,
                    duration: 200,
                    onComplete: () => shadow.destroy()
                });
            }
        }

        this.recalculateFormation();
        this.updateSquadCount();

        // Check for game over
        if (this.squadMembers.length === 0) {
            this.triggerGameOver();
        }
    }

    /**
     * Trigger game over
     */
    triggerGameOver() {
        console.log('💀 GAME OVER!');
        this.gameState = 'gameOver';

        // Camera shake
        this.cameras.main.shake(500, 0.02);

        // Screen flash red
        this.cameras.main.flash(300, 255, 0, 0);

        // Delay before showing game over screen
        this.time.delayedCall(800, () => {
            this.scene.start(SCENES.GAME_OVER, {
                distance: this.distance,
                squadSize: 0
            });
        });
    }

    /**
     * Create particle burst effect
     */
    createParticleBurst(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const speed = Phaser.Math.Between(100, 200);

            const particle = this.add.circle(x, y, 4, color);
            particle.setDepth(50);

            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * speed,
                y: y + Math.sin(angle) * speed,
                alpha: 0,
                scale: 0,
                duration: 400,
                ease: 'Cubic.easeOut',
                onComplete: () => particle.destroy()
            });
        }
    }

    shutdown() {
        console.log('🛑 GameScene shutdown');
        this.input.off('pointerdown');
        this.input.off('pointermove');
        this.input.off('pointerup');
    }
}
