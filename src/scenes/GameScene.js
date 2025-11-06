import Phaser from 'phaser';
import { GAME, WORLD, SQUAD, COLORS, SCENES, UI, COLLECTIBLES, OBSTACLES, GATES } from '../utils/GameConstants.js';

// COMBAT SYSTEM - Priority 1 Implementation
import BulletPool from '../systems/BulletPool.js';
import AutoShootingSystem from '../systems/AutoShootingSystem.js';
import EnemyManager from '../systems/EnemyManager.js';

// ABILITY SYSTEM - Priority 2 Implementation
import EnergySystem from '../systems/EnergySystem.js';
import AbilityEffects from '../systems/AbilityEffects.js';
import AbilityUIBar from '../ui/AbilityUIBar.js';
import { getDefaultLoadout } from '../utils/AbilityConstants.js';

// CHARACTER SELECTION - Priority 3 Implementation
import { calculateCombinedStats, getCombinedAbilities } from '../utils/CharacterConstants.js';

// BOSS BATTLE SYSTEM - Priority 4 Implementation
import BossManager from '../systems/BossManager.js';
import BossHealthBar from '../ui/BossHealthBar.js';

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

    init(data) {
        console.log('🎮 GameScene - Phase 1: Gaming Functionality + Character Polish');

        // CHARACTER SELECTION - Priority 3 Integration
        this.selectedCharacters = data?.selectedCharacters || [];
        this.stageNumber = data?.stageNumber || 1;
        this.characterStats = null; // Will be calculated from selectedCharacters

        // Calculate combined stats if characters selected
        if (this.selectedCharacters.length > 0) {
            this.characterStats = calculateCombinedStats(this.selectedCharacters);
            console.log('🎭 Characters selected:', this.selectedCharacters.map(c => c.name).join(', '));
            console.log('📊 Combined stats:', this.characterStats);
        } else {
            // Default stats if no selection (should not happen with character selection)
            this.characterStats = {
                damage: 1.0,
                fireRate: 1.0,
                hp: 100,
                speed: 1.0
            };
            console.log('⚠️ No characters selected - using default stats');
        }

        // Game state
        this.gameState = 'playing';
        this.distance = 0;              // Total distance traveled
        this.scrollOffset = 0;          // Current scroll offset for objects
        this.lastMovementDirection = 0; // Track movement direction for character tilt

        // Squad
        this.squadMembers = [];
        this.groundShadows = [];
        this.formationPositions = [];
        this.squadCenterX = GAME.WIDTH / 2;  // Center horizontally
        this.squadCenterY = SQUAD.START_Y;    // Lower third vertically
        this.previousSquadCenterX = GAME.WIDTH / 2; // For movement direction calculation

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

        // UI/HUD Polish tracking
        this.previousSquadSize = 1;  // For color coding changes
        this.comboCount = 0;          // Track consecutive collectibles
        this.currentMultiplier = 1;   // Current score multiplier
        this.lastCollectibleTime = 0; // For combo timeout
        this.previousDistance = 0;    // For rolling number animation

        // Camera Animation tracking
        this.targetCameraZoom = 1.0;  // Dynamic zoom target
        this.cameraOffsetX = 0;       // Movement anticipation offset

        // AUDIO SYSTEM 🔊
        this.audioEnabled = true;
        this.musicVolume = 0.5;
        this.sfxVolume = 0.7;
        this.ambientVolume = 0.3;

        // Audio context for Web Audio API (procedural sounds)
        if (!window.audioContext) {
            window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        this.audioContext = window.audioContext;

        // Music layers (for dynamic music)
        this.musicLayers = {
            base: null,
            drums: null,
            melody: null,
            intensity: null
        };
        this.currentMusicState = 'menu'; // 'menu', 'game', 'gameOver', 'victory'

        // Ambient audio loops
        this.ambientLoops = {
            background: null,
            water: null,
            crowd: null
        };

        // Footstep timing
        this.footstepTimer = 0;
        this.footstepInterval = 150; // ms between footsteps

        // COMBAT SYSTEM - Phase 1 Integration
        this.bulletPool = null;
        this.autoShootingSystem = null;
        this.enemyManager = null;
        this.score = 0;
        this.enemiesKilled = 0;

        // ABILITY SYSTEM - Priority 2 Integration
        this.energySystem = null;
        this.abilityEffects = null;
        this.abilityUIBar = null;
        this.abilities = [];

        // BOSS BATTLE SYSTEM - Priority 4 Integration
        this.bossManager = null;
        this.bossHealthBar = null;
        this.bossProjectiles = [];
    }

    create() {
        console.log('🎮 Building Phase 1 - Step by step...');

        // ANIMATION IMPROVEMENTS 1: Scene transition fade-in
        this.cameras.main.fadeIn(800, 0, 0, 0);

        // AUDIO SYSTEM: Initialize audio
        this.initializeAudio();

        // COMBAT SYSTEM: Initialize combat (bullets, shooting, enemies)
        this.initializeCombatSystem();

        // ABILITY SYSTEM: Initialize abilities (energy, effects, UI)
        this.initializeAbilitySystem();

        // BOSS BATTLE SYSTEM: Initialize boss manager
        this.initializeBossSystem();

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

        // ANIMATION IMPROVEMENTS 3: Countdown animation before game starts
        this.startCountdown();

        console.log('✓ Phase 1 Foundation ready with gameplay!');
        console.log('✓ Auto-scroll, collectibles, obstacles, and gates active');
    }

    /**
     * ANIMATION IMPROVEMENTS 3: Start countdown before game begins
     */
    startCountdown() {
        // Pause game initially
        this.gameState = 'countdown';

        const countdownNumbers = ['3', '2', '1', 'GO!'];
        let currentIndex = 0;

        // Create countdown text
        const countdownText = this.add.text(
            GAME.WIDTH / 2,
            GAME.HEIGHT / 2,
            countdownNumbers[0],
            {
                fontSize: '120px',
                fontFamily: 'Arial Black',
                color: '#FFFF00',
                stroke: '#000000',
                strokeThickness: 12
            }
        );
        countdownText.setOrigin(0.5);
        countdownText.setDepth(200);
        countdownText.setScrollFactor(0);
        countdownText.setScale(0);

        // Background overlay for countdown
        const overlay = this.add.rectangle(
            GAME.WIDTH / 2,
            GAME.HEIGHT / 2,
            GAME.WIDTH,
            GAME.HEIGHT,
            0x000000,
            0.5
        );
        overlay.setDepth(199);
        overlay.setScrollFactor(0);

        const showNumber = () => {
            if (currentIndex >= countdownNumbers.length) {
                // Countdown complete - start game
                this.tweens.add({
                    targets: [countdownText, overlay],
                    alpha: 0,
                    duration: 300,
                    onComplete: () => {
                        countdownText.destroy();
                        overlay.destroy();
                        this.gameState = 'playing';
                    }
                });
                return;
            }

            const number = countdownNumbers[currentIndex];
            countdownText.setText(number);

            // AUDIO: Countdown beep
            this.playCountdownBeep(number === 'GO!');

            // Zoom in animation
            this.tweens.add({
                targets: countdownText,
                scale: 1.5,
                alpha: 1,
                duration: 300,
                ease: 'Back.easeOut',
                onComplete: () => {
                    // Zoom out and fade
                    this.tweens.add({
                        targets: countdownText,
                        scale: 0.5,
                        alpha: 0,
                        duration: 500,
                        delay: 200,
                        ease: 'Back.easeIn',
                        onComplete: () => {
                            currentIndex++;
                            showNumber();
                        }
                    });
                }
            });

            // Color change for "GO!"
            if (number === 'GO!') {
                countdownText.setColor('#00FF00');
                countdownText.setStroke('#FFFFFF', 12);
            }
        };

        // Start countdown
        showNumber();
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
        this.grassLeft = this.add.rectangle(
            0,
            GAME.HEIGHT / 2,
            centerX - roadHalfWidth,
            GAME.HEIGHT,
            COLORS.GRASS_GREEN
        );
        this.grassLeft.setOrigin(0, 0.5);
        this.grassLeft.setDepth(-50);

        // Right grass
        this.grassRight = this.add.rectangle(
            centerX + roadHalfWidth,
            GAME.HEIGHT / 2,
            centerX - roadHalfWidth,
            GAME.HEIGHT,
            COLORS.GRASS_GREEN
        );
        this.grassRight.setOrigin(0, 0.5);
        this.grassRight.setDepth(-50);

        // ENVIRONMENT POLISH 2: Gentle grass swaying
        this.createGrassSwaying();

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

        // ENVIRONMENT POLISH 1: Asphalt grain/noise texture
        this.createAsphaltTexture(centerX, WORLD.ROAD_WIDTH);

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

        // ENVIRONMENT POLISH 3: Sky details (clouds/birds)
        this.createSkyDetails();

        // ENVIRONMENT POLISH 4: Volumetric light effect
        this.createVolumetricLight(centerX);

        // ENVIRONMENT POLISH 5: Animated grass shadows
        this.createGrassShadows(centerX, roadHalfWidth);

        // ENVIRONMENT POLISH 6: Road heat shimmer
        this.createHeatShimmer(centerX, WORLD.ROAD_WIDTH);

        // ENVIRONMENT POLISH 7: Parallax background layers
        this.createParallaxLayers(centerX);

        console.log('✓ Environment: Road + Grass + All Polish Effects Active');
    }

    /**
     * ENVIRONMENT POLISH 1: Create asphalt grain texture
     */
    createAsphaltTexture(centerX, roadWidth) {
        const graphics = this.add.graphics();
        graphics.setDepth(-8);

        // Generate random grain pattern (subtle noise)
        const grainDensity = 300; // Number of grain particles
        const grainSize = 1.5;

        for (let i = 0; i < grainDensity; i++) {
            const x = centerX - roadWidth / 2 + Math.random() * roadWidth;
            const y = Math.random() * GAME.HEIGHT * 1.5;
            const alpha = Math.random() * 0.15 + 0.05; // Very subtle (0.05-0.2)

            // Mix of dark and light grains
            const isDark = Math.random() > 0.5;
            const color = isDark ? 0x000000 : 0xFFFFFF;

            graphics.fillStyle(color, alpha);
            graphics.fillCircle(x, y, grainSize);
        }

        console.log('✓ Asphalt texture grain added');
    }

    /**
     * ENVIRONMENT POLISH 2: Gentle grass swaying
     */
    createGrassSwaying() {
        // Gentle sway on left grass
        this.tweens.add({
            targets: this.grassLeft,
            scaleX: 1.01, // Very subtle stretch
            duration: 3000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Gentle sway on right grass (offset timing)
        this.tweens.add({
            targets: this.grassRight,
            scaleX: 1.01,
            duration: 3000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            delay: 1500 // Offset by half cycle
        });

        console.log('✓ Grass swaying animation active');
    }

    /**
     * ENVIRONMENT POLISH 3: Add clouds or birds in sky
     */
    createSkyDetails() {
        const clouds = [];
        const numClouds = 4;

        for (let i = 0; i < numClouds; i++) {
            const cloud = this.add.container(
                Math.random() * GAME.WIDTH,
                Math.random() * GAME.HEIGHT * 0.3 // Top third of screen
            );

            // Create fluffy cloud shape (3 overlapping circles)
            const cloudColor = 0xFFFFFF;
            const cloudAlpha = 0.4;

            const circle1 = this.add.circle(-15, 0, 25, cloudColor, cloudAlpha);
            const circle2 = this.add.circle(0, -5, 30, cloudColor, cloudAlpha);
            const circle3 = this.add.circle(15, 0, 25, cloudColor, cloudAlpha);

            cloud.add([circle1, circle2, circle3]);
            cloud.setDepth(-90);

            clouds.push(cloud);

            // Slow drift across sky
            const driftSpeed = Phaser.Math.Between(8000, 15000);
            this.tweens.add({
                targets: cloud,
                x: GAME.WIDTH + 100,
                duration: driftSpeed,
                repeat: -1,
                onRepeat: () => {
                    cloud.x = -100; // Reset to left side
                    cloud.y = Math.random() * GAME.HEIGHT * 0.3;
                }
            });
        }

        console.log('✓ Sky details (clouds) added');
    }

    /**
     * ENVIRONMENT POLISH 4: Volumetric light rays from top
     */
    createVolumetricLight(centerX) {
        const numRays = 5;

        for (let i = 0; i < numRays; i++) {
            const rayX = centerX - 200 + (i * 100);
            const rayWidth = 40;
            const rayHeight = GAME.HEIGHT * 0.6;

            // Create light ray (vertical gradient rectangle)
            const ray = this.add.rectangle(
                rayX,
                0,
                rayWidth,
                rayHeight,
                0xFFFFFF,
                0.08 // Very subtle
            );
            ray.setOrigin(0.5, 0);
            ray.setDepth(-85);
            ray.setAlpha(0.05);

            // Gentle pulsing animation
            this.tweens.add({
                targets: ray,
                alpha: 0.12,
                duration: 2500 + (i * 300),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }

        console.log('✓ Volumetric light rays active');
    }

    /**
     * ENVIRONMENT POLISH 5: Animated grass shadows (sway with wind)
     */
    createGrassShadows(centerX, roadHalfWidth) {
        // Left grass shadow strips
        this.grassShadowsLeft = [];
        const numShadowStrips = 3;

        for (let i = 0; i < numShadowStrips; i++) {
            const shadowStrip = this.add.rectangle(
                centerX - roadHalfWidth - 30 - (i * 40),
                GAME.HEIGHT / 2,
                15,
                GAME.HEIGHT,
                0x000000,
                0.1 + (i * 0.03) // Varying darkness
            );
            shadowStrip.setDepth(-45);
            this.grassShadowsLeft.push(shadowStrip);

            // Sway animation (simulate wind)
            this.tweens.add({
                targets: shadowStrip,
                scaleX: 1.2,
                x: shadowStrip.x + 5,
                duration: 2500 + (i * 400),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }

        // Right grass shadow strips
        this.grassShadowsRight = [];
        for (let i = 0; i < numShadowStrips; i++) {
            const shadowStrip = this.add.rectangle(
                centerX + roadHalfWidth + 30 + (i * 40),
                GAME.HEIGHT / 2,
                15,
                GAME.HEIGHT,
                0x000000,
                0.1 + (i * 0.03)
            );
            shadowStrip.setDepth(-45);
            this.grassShadowsRight.push(shadowStrip);

            // Sway animation (offset timing)
            this.tweens.add({
                targets: shadowStrip,
                scaleX: 1.2,
                x: shadowStrip.x - 5,
                duration: 2500 + (i * 400),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
                delay: 1200
            });
        }

        console.log('✓ Animated grass shadows active');
    }

    /**
     * ENVIRONMENT POLISH 6: Road heat shimmer effect
     */
    createHeatShimmer(centerX, roadWidth) {
        // Create multiple shimmer wave lines
        this.heatShimmers = [];
        const numShimmers = 4;

        for (let i = 0; i < numShimmers; i++) {
            const shimmer = this.add.rectangle(
                centerX,
                GAME.HEIGHT * 0.5 + (i * 100),
                roadWidth * 0.9,
                2, // Thin horizontal line
                0xFFFFFF,
                0.15
            );
            shimmer.setDepth(-7);
            this.heatShimmers.push(shimmer);

            // Subtle wave distortion effect
            this.tweens.add({
                targets: shimmer,
                scaleX: 0.95,
                alpha: 0.05,
                duration: 1500 + (i * 200),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // Vertical drift (shimmer rises)
            this.tweens.add({
                targets: shimmer,
                y: shimmer.y - 150,
                duration: 3000,
                repeat: -1,
                onRepeat: () => {
                    shimmer.y = GAME.HEIGHT;
                }
            });
        }

        console.log('✓ Heat shimmer effect active');
    }

    /**
     * ENVIRONMENT POLISH 7: Parallax background layers (distant scenery)
     */
    createParallaxLayers(centerX) {
        // Far background - distant mountains
        this.parallaxMountains = [];
        const numMountains = 5;

        for (let i = 0; i < numMountains; i++) {
            const mountainWidth = 200 + Math.random() * 150;
            const mountainHeight = 100 + Math.random() * 80;
            const mountainX = (i * 250) - 100;

            // Simple triangle mountain shape
            const mountain = this.add.triangle(
                mountainX,
                GAME.HEIGHT * 0.35,
                0, 0,
                mountainWidth / 2, mountainHeight,
                -mountainWidth / 2, mountainHeight,
                0x2C3E50,
                0.3
            );
            mountain.setOrigin(0, 0);
            mountain.setDepth(-95);
            this.parallaxMountains.push(mountain);
        }

        // Mid-ground - distant buildings/trees
        this.parallaxBuildings = [];
        const numBuildings = 8;

        for (let i = 0; i < numBuildings; i++) {
            const buildingWidth = 40 + Math.random() * 60;
            const buildingHeight = 80 + Math.random() * 120;
            const buildingX = (i * 180) - 50;

            const building = this.add.rectangle(
                buildingX,
                GAME.HEIGHT * 0.4,
                buildingWidth,
                buildingHeight,
                0x34495E,
                0.25
            );
            building.setOrigin(0.5, 1);
            building.setDepth(-80);
            this.parallaxBuildings.push(building);
        }

        console.log('✓ Parallax background layers created');
    }

    /**
     * Update parallax layers in update loop
     */
    updateParallaxLayers(dt) {
        // Scroll mountains slowly (0.1x speed)
        if (this.parallaxMountains) {
            this.parallaxMountains.forEach((mountain, index) => {
                mountain.y += WORLD.SCROLL_SPEED * dt * 0.1;

                // Wrap around when off-screen
                if (mountain.y > GAME.HEIGHT + 100) {
                    mountain.y = -100;
                    mountain.x = Math.random() * GAME.WIDTH;
                }
            });
        }

        // Scroll buildings faster (0.3x speed)
        if (this.parallaxBuildings) {
            this.parallaxBuildings.forEach((building, index) => {
                building.y += WORLD.SCROLL_SPEED * dt * 0.3;

                // Wrap around when off-screen
                if (building.y > GAME.HEIGHT + 100) {
                    building.y = GAME.HEIGHT * 0.4;
                    building.x = Math.random() * GAME.WIDTH;
                }
            });
        }
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
     * Create enhanced character with all polish features
     * 1. Size variation (0.9x - 1.1x)
     * 2. Color variation (subtle blue tints)
     * 3. Bobbing animation
     * 4. Eye blinking
     * 5. Eye direction
     * 6. Facial expressions
     * 7. Rotation based on movement
     */
    createEnhancedCharacter(x, y) {
        const baseRadius = SQUAD.CHARACTER_RADIUS;

        // 1. SIZE VARIATION (0.9x to 1.1x for organic feel)
        const sizeVariation = Phaser.Math.FloatBetween(0.9, 1.1);
        const radius = baseRadius * sizeVariation;

        // 2. COLOR VARIATION (subtle blue tints)
        const colorVariations = [
            0x03A9F4, // Original blue
            0x0288D1, // Slightly darker
            0x039BE5, // Slightly lighter
            0x03A0E3, // Subtle tint
            0x04B5FF, // Brighter tint
        ];
        const bodyColor = Phaser.Utils.Array.GetRandom(colorVariations);

        // Ground shadow (ellipse beneath character)
        const groundShadow = this.add.ellipse(x, y + radius + 5, radius * 1.5, radius * 0.5, 0x000000, 0.3);
        groundShadow.setDepth(5);

        // Container for character
        const character = this.add.container(x, y);

        // Main body (bright blue with variation)
        const body = this.add.circle(0, 0, radius, bodyColor);

        // Shadow gradient (darker blue, bottom-right)
        const shadow1 = this.add.circle(4, 4, radius * 0.85, COLORS.SQUAD_BLUE_DARK, 0.25);
        const shadow2 = this.add.circle(3, 3, radius * 0.7, COLORS.SQUAD_BLUE_DARK, 0.35);

        // Highlight (white, top-left)
        const highlight1 = this.add.circle(-6, -6, radius * 0.4, COLORS.SQUAD_HIGHLIGHT, 0.6);
        const highlight2 = this.add.circle(-4, -4, radius * 0.25, COLORS.SQUAD_HIGHLIGHT, 0.95);

        // Eyes (will be animated for blinking and direction)
        const eyeSize = radius * 0.12;
        const eyeY = -radius * 0.1;
        const eyeSpacing = radius * 0.35;

        const leftEye = this.add.circle(-eyeSpacing, eyeY, eyeSize, 0x000000, 0.8);
        const rightEye = this.add.circle(eyeSpacing, eyeY, eyeSize, 0x000000, 0.8);

        // Mouth (for expressions - initially neutral)
        const mouth = this.add.arc(0, radius * 0.15, radius * 0.15, 0, 180, false, 0x000000, 0.6);
        mouth.setStrokeStyle(2, 0x000000, 0.8);
        mouth.isClosed = true;

        // 8. RUNNING ANIMATION - Add legs that will animate
        const legLength = radius * 0.6;
        const legWidth = 3;
        const legSpacing = radius * 0.25;
        const legStartY = radius * 0.5;

        // Left leg (line from hip to foot)
        const leftLeg = this.add.line(
            0, 0,
            -legSpacing, legStartY,
            -legSpacing, legStartY + legLength,
            0x0277BD,
            1
        );
        leftLeg.setLineWidth(legWidth);
        leftLeg.setOrigin(0, 0);

        // Right leg (line from hip to foot)
        const rightLeg = this.add.line(
            0, 0,
            legSpacing, legStartY,
            legSpacing, legStartY + legLength,
            0x0277BD,
            1
        );
        rightLeg.setLineWidth(legWidth);
        rightLeg.setOrigin(0, 0);

        // Add to container in correct order (legs first, then body, then details on top)
        character.add([leftLeg, rightLeg, body, shadow1, shadow2, highlight1, highlight2, leftEye, rightEye, mouth]);
        character.setDepth(10);

        // Store references for animations
        character.body = body;
        character.leftEye = leftEye;
        character.rightEye = rightEye;
        character.mouth = mouth;
        character.leftLeg = leftLeg;
        character.rightLeg = rightLeg;
        character.baseRadius = radius;
        character.sizeVariation = sizeVariation;
        character.legSpacing = legSpacing;
        character.legStartY = legStartY;
        character.legLength = legLength;

        // Formation properties
        character.formationX = 0;
        character.formationY = 0;
        character.groundShadow = groundShadow;

        // Animation properties
        character.bobbingOffset = Math.random() * Math.PI * 2; // Random phase for organic look
        character.nextBlinkTime = this.time.now + Phaser.Math.Between(2000, 4000);
        character.isBlinking = false;
        character.currentEmotion = 'neutral'; // 'neutral', 'happy', 'worried'

        // 3. BOBBING ANIMATION - Continuous up/down bounce
        this.tweens.add({
            targets: character,
            y: y - 3, // Bob up 3 pixels
            duration: 600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            delay: character.bobbingOffset * 100 // Stagger animations
        });

        // 8. RUNNING ANIMATION - Alternating leg movement
        const legSwingAmount = 8; // Pixels to swing forward/back
        const runCycleDuration = 300; // Fast running cycle

        // Left leg - swings forward first
        this.tweens.add({
            targets: leftLeg,
            x2: -legSpacing + legSwingAmount, // Foot forward
            duration: runCycleDuration,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            delay: character.bobbingOffset * 50 // Slight stagger
        });

        // Right leg - swings backward first (opposite of left)
        this.tweens.add({
            targets: rightLeg,
            x2: legSpacing - legSwingAmount, // Foot backward
            duration: runCycleDuration,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            delay: (character.bobbingOffset * 50) + (runCycleDuration / 2) // Offset by half cycle
        });

        return character;
    }

    /**
     * STEP 5-6: Create single character (blue sphere with 3D effect)
     */
    createCharacter() {
        const x = this.squadCenterX;
        const y = this.squadCenterY;

        const character = this.createEnhancedCharacter(x, y);

        this.squadMembers.push(character);
        this.groundShadows.push(character.groundShadow);

        // Calculate initial formation
        this.recalculateFormation();

        console.log(`✓ Enhanced character created at (${x}, ${y})`);
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
     * Create enhanced UI with all polish features
     */
    createDistanceUI() {
        const uiDepth = 100;

        // UI/HUD POLISH 8: Vignette effect - subtle edge darkening
        this.createVignette(uiDepth - 1);

        // Top-left panel background (expanded)
        const panelBg = this.add.rectangle(10, 10, 280, 180, 0x000000, 0.6);
        panelBg.setOrigin(0, 0);
        panelBg.setDepth(uiDepth);
        panelBg.setScrollFactor(0);

        // Panel glow
        const panelGlow = this.add.rectangle(10, 10, 280, 180, 0x00AAFF, 0.1);
        panelGlow.setOrigin(0, 0);
        panelGlow.setDepth(uiDepth);
        panelGlow.setScrollFactor(0);
        panelGlow.setStrokeStyle(2, 0x00AAFF, 0.5);

        // UI/HUD POLISH 1: Distance counter with rolling numbers
        this.distanceText = this.add.text(20, 20, '0m', {
            fontSize: '28px',
            fontFamily: 'Arial Black',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 4
        });
        this.distanceText.setDepth(uiDepth + 1);
        this.distanceText.setScrollFactor(0);

        // UI/HUD POLISH 7: Milestone tracker
        this.milestoneText = this.add.text(20, 52, 'Next: 100m', {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#FFA500',
            stroke: '#000000',
            strokeThickness: 3
        });
        this.milestoneText.setDepth(uiDepth + 1);
        this.milestoneText.setScrollFactor(0);

        // UI/HUD POLISH 2: Squad size with color coding
        this.squadSizeUI = this.add.text(20, 75, 'Squad: 1', {
            fontSize: '20px',
            fontFamily: 'Arial Black',
            color: COLORS.SQUAD_BLUE,
            stroke: '#000000',
            strokeThickness: 3
        });
        this.squadSizeUI.setDepth(uiDepth + 1);
        this.squadSizeUI.setScrollFactor(0);

        // UI/HUD POLISH 3: Visual gauge for squad size
        this.createSquadGauge(20, 105, uiDepth);

        // UI/HUD POLISH 5 & 6: Combo tracker and multiplier display
        this.createComboUI(20, 135, uiDepth);

        // UI/HUD POLISH 4: Upcoming obstacles preview (top-right)
        this.createUpcomingPreview(GAME.WIDTH - 160, 10, uiDepth);

        console.log('✓ Enhanced UI with all polish features created');
    }

    /**
     * UI/HUD POLISH 8: Create vignette effect
     */
    createVignette(depth) {
        const vignetteSize = 200;
        const vignetteAlpha = 0.4;

        // Top vignette
        const topVignette = this.add.rectangle(
            GAME.WIDTH / 2, 0,
            GAME.WIDTH, vignetteSize,
            0x000000, vignetteAlpha
        );
        topVignette.setOrigin(0.5, 0);
        topVignette.setDepth(depth);
        topVignette.setScrollFactor(0);
        topVignette.setAlpha(0);

        // Gradient fade
        this.tweens.add({
            targets: topVignette,
            alpha: vignetteAlpha,
            y: -vignetteSize / 2,
            duration: 0
        });

        // Bottom vignette
        const bottomVignette = this.add.rectangle(
            GAME.WIDTH / 2, GAME.HEIGHT,
            GAME.WIDTH, vignetteSize,
            0x000000, vignetteAlpha
        );
        bottomVignette.setOrigin(0.5, 1);
        bottomVignette.setDepth(depth);
        bottomVignette.setScrollFactor(0);

        // Left vignette
        const leftVignette = this.add.rectangle(
            0, GAME.HEIGHT / 2,
            vignetteSize, GAME.HEIGHT,
            0x000000, vignetteAlpha * 0.6
        );
        leftVignette.setOrigin(0, 0.5);
        leftVignette.setDepth(depth);
        leftVignette.setScrollFactor(0);

        // Right vignette
        const rightVignette = this.add.rectangle(
            GAME.WIDTH, GAME.HEIGHT / 2,
            vignetteSize, GAME.HEIGHT,
            0x000000, vignetteAlpha * 0.6
        );
        rightVignette.setOrigin(1, 0.5);
        rightVignette.setDepth(depth);
        rightVignette.setScrollFactor(0);

        console.log('✓ Vignette effect created');
    }

    /**
     * UI/HUD POLISH 3: Create visual gauge for squad size
     */
    createSquadGauge(x, y, depth) {
        const gaugeWidth = 240;
        const gaugeHeight = 18;

        // Gauge background
        this.gaugeBackground = this.add.rectangle(x, y, gaugeWidth, gaugeHeight, 0x333333, 0.8);
        this.gaugeBackground.setOrigin(0, 0);
        this.gaugeBackground.setDepth(depth + 1);
        this.gaugeBackground.setScrollFactor(0);
        this.gaugeBackground.setStrokeStyle(2, 0x666666);

        // Gauge fill (dynamic)
        this.gaugeFill = this.add.rectangle(x + 2, y + 2, 10, gaugeHeight - 4, 0x00FF00, 1);
        this.gaugeFill.setOrigin(0, 0);
        this.gaugeFill.setDepth(depth + 2);
        this.gaugeFill.setScrollFactor(0);

        // Gauge segments (visual markers every 10 members)
        const segmentCount = 10;
        for (let i = 1; i < segmentCount; i++) {
            const segmentX = x + (gaugeWidth / segmentCount) * i;
            const segment = this.add.rectangle(segmentX, y, 1, gaugeHeight, 0xFFFFFF, 0.3);
            segment.setOrigin(0, 0);
            segment.setDepth(depth + 1);
            segment.setScrollFactor(0);
        }
    }

    /**
     * UI/HUD POLISH 5 & 6: Create combo and multiplier UI
     */
    createComboUI(x, y, depth) {
        // Combo/Multiplier container background
        const comboBg = this.add.rectangle(x, y, 240, 35, 0x000000, 0.7);
        comboBg.setOrigin(0, 0);
        comboBg.setDepth(depth);
        comboBg.setScrollFactor(0);

        // Combo text
        this.comboText = this.add.text(x + 10, y + 8, 'Combo: 0', {
            fontSize: '16px',
            fontFamily: 'Arial Black',
            color: '#FFFF00',
            stroke: '#000000',
            strokeThickness: 3
        });
        this.comboText.setDepth(depth + 1);
        this.comboText.setScrollFactor(0);
        this.comboText.setVisible(false); // Hidden until combo > 0

        // Multiplier text
        this.multiplierText = this.add.text(x + 150, y + 8, 'x1', {
            fontSize: '18px',
            fontFamily: 'Arial Black',
            color: '#00FFFF',
            stroke: '#000000',
            strokeThickness: 3
        });
        this.multiplierText.setDepth(depth + 1);
        this.multiplierText.setScrollFactor(0);
    }

    /**
     * UI/HUD POLISH 4: Create upcoming obstacles preview
     */
    createUpcomingPreview(x, y, depth) {
        // Preview panel background
        const previewBg = this.add.rectangle(x, y, 150, 200, 0x000000, 0.6);
        previewBg.setOrigin(0, 0);
        previewBg.setDepth(depth);
        previewBg.setScrollFactor(0);

        // Title
        const previewTitle = this.add.text(x + 10, y + 10, 'AHEAD:', {
            fontSize: '14px',
            fontFamily: 'Arial Black',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 3
        });
        previewTitle.setDepth(depth + 1);
        previewTitle.setScrollFactor(0);

        // Preview icons container
        this.previewIcons = [];
        for (let i = 0; i < 5; i++) {
            const iconY = y + 40 + (i * 30);

            // Icon background
            const iconBg = this.add.circle(x + 20, iconY, 10, 0x444444, 0.5);
            iconBg.setDepth(depth + 1);
            iconBg.setScrollFactor(0);

            // Distance label
            const distLabel = this.add.text(x + 40, iconY - 8, '---', {
                fontSize: '12px',
                fontFamily: 'Arial',
                color: '#AAAAAA',
                stroke: '#000000',
                strokeThickness: 2
            });
            distLabel.setDepth(depth + 1);
            distLabel.setScrollFactor(0);

            this.previewIcons.push({
                background: iconBg,
                label: distLabel,
                type: null
            });
        }
    }

    /**
     * UI/HUD POLISH 1: Update distance with rolling number animation
     */
    updateDistanceDisplay() {
        const currentDist = Math.floor(this.distance);
        const prevDist = Math.floor(this.previousDistance);

        if (currentDist !== prevDist) {
            // Rolling number animation
            this.distanceText.setText(`${currentDist}m`);

            // Scale pulse on increment
            this.tweens.add({
                targets: this.distanceText,
                scale: 1.15,
                duration: 100,
                yoyo: true,
                ease: 'Quad.easeOut'
            });

            this.previousDistance = this.distance;
        }

        // UI/HUD POLISH 7: Update milestone tracker
        const milestones = [100, 250, 500, 1000, 2000, 5000];
        let nextMilestone = milestones.find(m => m > currentDist);
        if (!nextMilestone) nextMilestone = Math.ceil(currentDist / 1000) * 1000 + 1000;

        const remaining = nextMilestone - currentDist;
        this.milestoneText.setText(`Next: ${nextMilestone}m (${remaining}m)`);
    }

    /**
     * UI/HUD POLISH 3: Update visual gauge
     */
    updateSquadGauge() {
        const maxGaugeWidth = 236; // 240 - 4 (padding)
        const maxSquadSize = 100; // Visual max for gauge
        const currentSize = this.squadMembers.length;

        const fillWidth = Math.min((currentSize / maxSquadSize) * maxGaugeWidth, maxGaugeWidth);

        // Smooth tween to new width
        this.tweens.add({
            targets: this.gaugeFill,
            width: fillWidth,
            duration: 200,
            ease: 'Quad.easeOut'
        });

        // Color based on squad size
        let gaugeColor = 0x00FF00; // Green (good)
        if (currentSize < 10) gaugeColor = 0xFF0000; // Red (danger)
        else if (currentSize < 25) gaugeColor = 0xFFAA00; // Orange (warning)
        else if (currentSize >= 50) gaugeColor = 0x00FFFF; // Cyan (excellent)

        this.gaugeFill.setFillStyle(gaugeColor);
    }

    /**
     * UI/HUD POLISH 4: Update upcoming preview
     */
    updateUpcomingPreview() {
        // Gather next 5 objects
        const allObjects = [
            ...this.collectibles.map(c => ({ type: 'collectible', y: c.y, obj: c })),
            ...this.obstacles.map(o => ({ type: 'obstacle', y: o.y, obj: o })),
            ...this.gates.map(g => ({ type: 'gate', y: g.left.y, obj: g }))
        ];

        // Sort by distance (closest first)
        allObjects.sort((a, b) => a.y - b.y);

        // Update preview icons
        for (let i = 0; i < 5; i++) {
            const icon = this.previewIcons[i];

            if (i < allObjects.length) {
                const obj = allObjects[i];
                const distanceAway = Math.max(0, Math.floor(obj.y - this.squadCenterY));

                // Color based on type
                let color = 0x444444;
                if (obj.type === 'collectible') color = COLORS.COLLECTIBLE;
                else if (obj.type === 'obstacle') color = COLORS.OBSTACLE;
                else if (obj.type === 'gate') color = 0xFFFF00;

                icon.background.setFillStyle(color, 0.8);
                icon.label.setText(`${distanceAway}m`);
                icon.type = obj.type;
            } else {
                icon.background.setFillStyle(0x444444, 0.3);
                icon.label.setText('---');
                icon.type = null;
            }
        }
    }

    /**
     * UI/HUD POLISH 5: Update combo display
     */
    updateComboDisplay() {
        if (this.comboCount > 0) {
            this.comboText.setVisible(true);
            this.comboText.setText(`Combo: ${this.comboCount}🔥`);

            // Pulse animation
            this.tweens.add({
                targets: this.comboText,
                scale: 1.2,
                duration: 150,
                yoyo: true,
                ease: 'Back.easeOut'
            });
        } else {
            this.comboText.setVisible(false);
        }
    }

    /**
     * UI/HUD POLISH 6: Update multiplier display
     */
    updateMultiplierDisplay() {
        // Calculate multiplier based on combo
        if (this.comboCount >= 10) this.currentMultiplier = 3;
        else if (this.comboCount >= 5) this.currentMultiplier = 2;
        else this.currentMultiplier = 1;

        this.multiplierText.setText(`x${this.currentMultiplier}`);

        // Color based on multiplier
        if (this.currentMultiplier >= 3) this.multiplierText.setColor('#FF00FF'); // Magenta
        else if (this.currentMultiplier >= 2) this.multiplierText.setColor('#00FFFF'); // Cyan
        else this.multiplierText.setColor('#FFFFFF'); // White
    }

    /**
     * Reset combo (called when hit obstacle or timeout)
     */
    resetCombo() {
        if (this.comboCount > 0) {
            this.comboCount = 0;
            this.currentMultiplier = 1;
            this.updateComboDisplay();
            this.updateMultiplierDisplay();
        }
    }

    /**
     * Spawn a collectible item (ENHANCED with polish)
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

        // OBJECT POLISH 1: Glowing pulsing aura (outer glow)
        const aura = this.add.circle(0, 0, COLLECTIBLES.SIZE * 1.8, COLORS.COLLECTIBLE, 0.3);
        aura.setBlendMode(Phaser.BlendModes.ADD); // Additive blending for glow effect

        // Pulsing animation for aura
        this.tweens.add({
            targets: aura,
            scale: 1.2,
            alpha: 0.1,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Green circle (main body)
        const circle = this.add.circle(0, 0, COLLECTIBLES.SIZE, COLORS.COLLECTIBLE);

        // Inner glow ring
        const innerGlow = this.add.circle(0, 0, COLLECTIBLES.SIZE * 0.8, 0x00FF88, 0.4);

        // Highlight
        const highlight = this.add.circle(-5, -5, COLLECTIBLES.SIZE * 0.4, 0xFFFFFF, 0.6);

        // OBJECT POLISH 7: Color gradient effect (darker at bottom)
        const gradient = this.add.circle(0, 3, COLLECTIBLES.SIZE * 0.9, 0x006633, 0.3);

        // +1 text
        const text = this.add.text(0, 0, '+1', {
            fontSize: '16px',
            fontFamily: 'Arial Black',
            color: '#FFFFFF',
            stroke: '#00AA44',
            strokeThickness: 3
        });
        text.setOrigin(0.5);

        // Add all elements to container
        collectible.add([aura, circle, innerGlow, gradient, highlight, text]);
        collectible.setDepth(8);
        collectible.type = 'collectible';
        collectible.collected = false;

        // Store reference to aura for cleanup
        collectible.aura = aura;

        // OBJECT POLISH 2: Twinkle particles around collectible
        this.createTwinkleParticles(collectible);

        // Gentle rotation animation
        this.tweens.add({
            targets: collectible,
            angle: 360,
            duration: 8000,
            repeat: -1,
            ease: 'Linear'
        });

        // OBJECT ANIMATION 1: Y-axis spin (3D effect via scaleX)
        this.tweens.add({
            targets: [circle, innerGlow, gradient, text],
            scaleX: 0.3,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.collectibles.push(collectible);
    }

    /**
     * OBJECT POLISH 2: Create twinkle particles around collectible
     */
    createTwinkleParticles(collectible) {
        const numParticles = 4;
        const particles = [];

        for (let i = 0; i < numParticles; i++) {
            const angle = (i / numParticles) * Math.PI * 2;
            const distance = COLLECTIBLES.SIZE * 1.5;

            // Small star/twinkle particle
            const particle = this.add.circle(
                Math.cos(angle) * distance,
                Math.sin(angle) * distance,
                2,
                0xFFFFFF,
                0.8
            );
            particle.setBlendMode(Phaser.BlendModes.ADD);

            collectible.add(particle);
            particles.push(particle);

            // Orbit animation
            this.tweens.add({
                targets: particle,
                alpha: 0.3,
                scale: 0.5,
                duration: 800 + (i * 200),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }

        collectible.twinkleParticles = particles;
    }

    /**
     * Spawn an obstacle (ENHANCED with polish)
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

        // OBJECT POLISH 7: Color gradient base (darker at bottom)
        const gradientBase = this.add.rectangle(0, 5, OBSTACLES.WIDTH, OBSTACLES.HEIGHT, 0x660000, 0.5);

        // Red rectangle (main body)
        const rect = this.add.rectangle(0, 0, OBSTACLES.WIDTH, OBSTACLES.HEIGHT, COLORS.OBSTACLE);

        // OBJECT POLISH 3: Red warning glow around obstacle
        const warningGlow = this.add.rectangle(0, 0, OBSTACLES.WIDTH + 8, OBSTACLES.HEIGHT + 8, 0xFF0000, 0.4);
        warningGlow.setBlendMode(Phaser.BlendModes.ADD);

        // Pulsing warning glow
        this.tweens.add({
            targets: warningGlow,
            alpha: 0.1,
            scale: 1.1,
            duration: 600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Dark border
        const border = this.add.rectangle(0, 0, OBSTACLES.WIDTH, OBSTACLES.HEIGHT);
        border.setStrokeStyle(4, 0x8B0000);
        border.setFillStyle();

        // OBJECT POLISH 4: Scanline animation
        const scanline = this.add.rectangle(
            0,
            -OBSTACLES.HEIGHT / 2,
            OBSTACLES.WIDTH,
            3,
            0xFFFFFF,
            0.5
        );

        // Scanline moves down repeatedly
        this.tweens.add({
            targets: scanline,
            y: OBSTACLES.HEIGHT / 2,
            duration: 1200,
            repeat: -1,
            ease: 'Linear'
        });

        // OBJECT POLISH 3: Exclamation mark warning above obstacle
        const exclamation = this.add.text(0, -OBSTACLES.HEIGHT - 20, '⚠', {
            fontSize: '24px',
            color: '#FF0000',
            stroke: '#FFFF00',
            strokeThickness: 2
        });
        exclamation.setOrigin(0.5);

        // Bobbing animation for warning
        this.tweens.add({
            targets: exclamation,
            y: exclamation.y - 5,
            duration: 400,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // -5 text
        const text = this.add.text(0, 0, `-${OBSTACLES.DAMAGE}`, {
            fontSize: '20px',
            fontFamily: 'Arial Black',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 4
        });
        text.setOrigin(0.5);

        // Add all elements to container
        obstacle.add([warningGlow, gradientBase, rect, border, scanline, exclamation, text]);
        obstacle.setDepth(8);
        obstacle.type = 'obstacle';
        obstacle.hit = false;

        // Store references
        obstacle.warningGlow = warningGlow;
        obstacle.scanline = scanline;

        // OBJECT POLISH 4: Transparency pulse on main rect
        this.tweens.add({
            targets: rect,
            alpha: 0.7,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // OBJECT ANIMATION 2: Drop from above with bounce
        const targetY = obstacle.y;
        obstacle.y = targetY - 200; // Start higher
        obstacle.setScale(0.5);

        this.tweens.add({
            targets: obstacle,
            y: targetY,
            scale: 1,
            duration: 600,
            ease: 'Bounce.easeOut'
        });

        // Camera shake on obstacle spawn
        this.cameras.main.shake(50, 0.002);

        this.obstacles.push(obstacle);
    }

    /**
     * Spawn a math gate (two options) - ENHANCED with polish
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
        const leftGate = this.createGateHalf(leftX, y, left.op, left.color, 'LEFT');
        leftGate.operation = left;

        // Create right gate
        const rightX = centerX + GATES.GAP / 2 + GATES.WIDTH / 2;
        const rightGate = this.createGateHalf(rightX, y, right.op, right.color, 'RIGHT');
        rightGate.operation = right;

        // OBJECT ANIMATION 3: Rise from ground with shake
        const targetYLeft = leftGate.y;
        const targetYRight = rightGate.y;
        leftGate.y = targetYLeft + 300; // Start below
        rightGate.y = targetYRight + 300;
        leftGate.setAlpha(0);
        rightGate.setAlpha(0);

        // Rise animation
        this.tweens.add({
            targets: [leftGate, rightGate],
            y: targetYLeft,
            alpha: 1,
            duration: 800,
            ease: 'Back.easeOut'
        });

        // Camera shake when gates appear
        this.cameras.main.shake(100, 0.003);

        this.gates.push({ left: leftGate, right: rightGate, passed: false });
    }

    /**
     * Create one half of a gate (ENHANCED with polish)
     */
    createGateHalf(x, y, label, color, side) {
        const gate = this.add.container(x, y);

        // OBJECT POLISH 7: Gradient base (darker at bottom)
        const gradientBase = this.add.rectangle(0, 10, GATES.WIDTH, GATES.HEIGHT, 0x000000, 0.3);

        // Background rectangle with gradient effect
        const bg = this.add.rectangle(0, 0, GATES.WIDTH, GATES.HEIGHT, color, 0.8);
        bg.setStrokeStyle(3, color, 0.5);

        // OBJECT POLISH 7: Outer glow aura
        const outerGlow = this.add.rectangle(0, 0, GATES.WIDTH + 12, GATES.HEIGHT + 12, color, 0.3);
        outerGlow.setBlendMode(Phaser.BlendModes.ADD);

        // Pulsing glow
        this.tweens.add({
            targets: outerGlow,
            alpha: 0.1,
            scale: 1.05,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Inner glow rectangle
        const innerGlow = this.add.rectangle(0, 0, GATES.WIDTH - 10, GATES.HEIGHT - 10, 0xFFFFFF, 0.2);

        // Border - thicker and more prominent
        const border = this.add.rectangle(0, 0, GATES.WIDTH, GATES.HEIGHT);
        border.setStrokeStyle(8, 0xFFFFFF, 0.9);
        border.setFillStyle();

        // OBJECT POLISH 5: Directional arrow indicator
        const arrow = side === 'LEFT' ? '←' : '→';
        const arrowText = this.add.text(0, -GATES.HEIGHT / 2 - 30, arrow, {
            fontSize: '32px',
            color: '#FFFFFF',
            stroke: color === COLORS.GATE_GOOD ? '#00FF00' : '#FF0000',
            strokeThickness: 4
        });
        arrowText.setOrigin(0.5);

        // Arrow bob animation
        this.tweens.add({
            targets: arrowText,
            y: arrowText.y - 5,
            duration: 600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // OBJECT POLISH 5: Side label (LEFT/RIGHT)
        const sideLabel = this.add.text(0, GATES.HEIGHT / 2 + 25, side, {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 3
        });
        sideLabel.setOrigin(0.5);
        sideLabel.setAlpha(0.7);

        // Operation text - larger and more visible
        const text = this.add.text(0, 0, label, {
            fontSize: '42px',
            fontFamily: 'Arial Black',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 6
        });
        text.setOrigin(0.5);

        // OBJECT POLISH 7: Motion blur trails (fake motion blur with fading rectangles)
        const trailCount = 3;
        const trails = [];
        for (let i = 0; i < trailCount; i++) {
            const trail = this.add.rectangle(
                0,
                (i + 1) * -15,
                GATES.WIDTH * 0.9,
                GATES.HEIGHT * 0.8,
                color,
                0.1 - (i * 0.03)
            );
            trails.push(trail);
        }

        gate.add([...trails, outerGlow, gradientBase, bg, innerGlow, border, arrowText, text, sideLabel]);
        gate.setDepth(8);
        gate.type = 'gate';

        // Store references
        gate.outerGlow = outerGlow;
        gate.arrowText = arrowText;

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

        // Create enhanced character with all polish features
        const character = this.createEnhancedCharacter(x, y);

        // AUDIO: Character join sound
        this.playCharacterJoinSound();

        // Spawn animation (overrides bobbing temporarily)
        character.setScale(0);
        this.tweens.add({
            targets: character,
            scale: character.sizeVariation, // Scale to character's unique size
            duration: 300,
            ease: 'Back.easeOut'
        });

        character.groundShadow.setScale(0);
        this.tweens.add({
            targets: character.groundShadow,
            scale: 1.0,
            duration: 300,
            ease: 'Back.easeOut'
        });

        this.squadMembers.push(character);
        this.groundShadows.push(character.groundShadow);

        // Recalculate formation
        this.recalculateFormation();

        // Update squad count display
        this.updateSquadCount();

        console.log(`✓ Enhanced squad member added (total: ${this.squadMembers.length})`);
    }

    /**
     * Update squad count display (ENHANCED with color coding)
     */
    updateSquadCount() {
        const count = this.squadMembers.length;
        this.squadText.setText(count.toString());

        // UI/HUD POLISH 2: Color coding based on growing/shrinking
        let textColor = COLORS.SQUAD_BLUE; // Default

        if (count > this.previousSquadSize) {
            // Growing - GREEN
            textColor = '#00FF00';

            // AUDIO: Crowd cheer when squad grows significantly
            if (count > this.previousSquadSize + 5 || count % 10 === 0) {
                this.playCrowdCheerSound();
            }
        } else if (count < this.previousSquadSize) {
            // Shrinking - RED
            textColor = '#FF0000';
        }

        // Update color with fade back to default
        if (this.squadSizeUI) {
            this.squadSizeUI.setColor(textColor);
            this.squadSizeUI.setText(`Squad: ${count}`);

            // Fade back to default color after 500ms
            this.time.delayedCall(500, () => {
                if (this.squadSizeUI) {
                    this.squadSizeUI.setColor(COLORS.SQUAD_BLUE);
                }
            });
        }

        // Pulse animation
        this.tweens.add({
            targets: [this.squadText, this.squadBubble],
            scale: 1.15,
            duration: 150,
            yoyo: true,
            ease: 'Back.easeOut'
        });

        // Update visual gauge
        this.updateSquadGauge();

        // Store for next comparison
        this.previousSquadSize = count;
    }

    /**
     * Update character animations (blinking, eye direction, rotation)
     */
    updateCharacterAnimations(time, movementDirection) {
        this.squadMembers.forEach((character, index) => {
            if (!character.active) return;

            // 4. EYE BLINKING - Random blinks every 2-4 seconds
            if (time >= character.nextBlinkTime && !character.isBlinking) {
                character.isBlinking = true;

                // Blink animation (squeeze eyes)
                this.tweens.add({
                    targets: [character.leftEye, character.rightEye],
                    scaleY: 0.1,
                    duration: 80,
                    yoyo: true,
                    onComplete: () => {
                        character.isBlinking = false;
                        character.nextBlinkTime = time + Phaser.Math.Between(2000, 4000);
                    }
                });
            }

            // 5. EYE DIRECTION - Eyes look toward movement direction
            const eyeSpacing = character.baseRadius * 0.35;
            const eyeY = -character.baseRadius * 0.1;
            const eyeLookOffset = movementDirection * 2; // 2 pixels left/right

            character.leftEye.x = -eyeSpacing + eyeLookOffset;
            character.rightEye.x = eyeSpacing + eyeLookOffset;

            // 2. CHARACTER ROTATION - Tilt in direction of movement
            const maxTilt = 0.15; // Max 0.15 radians (~8.6 degrees)
            const targetRotation = movementDirection * maxTilt;

            // Smooth rotation interpolation
            character.rotation = Phaser.Math.Linear(
                character.rotation,
                targetRotation,
                0.1 // Smooth lerp
            );
        });
    }

    /**
     * CAMERA ANIMATIONS: Update dynamic camera effects
     */
    updateCameraAnimations(movementDelta) {
        // CAMERA ANIMATION 7: Dynamic zoom based on squad size
        const squadSize = this.squadMembers.length;
        let targetZoom = 1.0;

        if (squadSize < 5) {
            targetZoom = 1.1; // Zoom in when small
        } else if (squadSize >= 50) {
            targetZoom = 0.85; // Zoom out when large
        } else if (squadSize >= 25) {
            targetZoom = 0.95; // Slightly zoom out
        }

        this.targetCameraZoom = targetZoom;

        // Smooth zoom transition
        const currentZoom = this.cameras.main.zoom;
        this.cameras.main.setZoom(
            Phaser.Math.Linear(currentZoom, this.targetCameraZoom, 0.02)
        );

        // CAMERA ANIMATION 8: Movement anticipation (lead the camera)
        const anticipationAmount = movementDelta * 15; // Amplify movement
        this.cameraOffsetX = Phaser.Math.Linear(
            this.cameraOffsetX,
            anticipationAmount,
            0.1
        );

        // Apply camera offset
        this.cameras.main.scrollX = this.cameraOffsetX;
    }

    /**
     * CAMERA ANIMATION 9: Quick zoom on event
     */
    cameraEventZoom(zoomAmount = 0.1, duration = 150) {
        const originalZoom = this.cameras.main.zoom;

        this.tweens.add({
            targets: this.cameras.main,
            zoom: originalZoom + zoomAmount,
            duration: duration,
            yoyo: true,
            ease: 'Quad.easeInOut'
        });
    }

    /**
     * Set facial expression for character
     * @param {Phaser.GameObjects.Container} character
     * @param {string} emotion - 'happy', 'worried', or 'neutral'
     */
    setCharacterExpression(character, emotion) {
        if (!character || !character.mouth) return;

        character.currentEmotion = emotion;
        const radius = character.baseRadius;

        // Remove old mouth
        character.remove(character.mouth);
        character.mouth.destroy();

        // Create new mouth based on emotion
        let newMouth;

        if (emotion === 'happy') {
            // Happy smile (arc facing up)
            newMouth = this.add.arc(0, radius * 0.2, radius * 0.2, 0, Math.PI, false, 0x000000, 0);
            newMouth.setStrokeStyle(2, 0x000000, 0.8);
        } else if (emotion === 'worried') {
            // Worried frown (arc facing down)
            newMouth = this.add.arc(0, radius * 0.25, radius * 0.15, Math.PI, 0, false, 0x000000, 0);
            newMouth.setStrokeStyle(2, 0x000000, 0.8);
        } else {
            // Neutral (small line)
            newMouth = this.add.arc(0, radius * 0.15, radius * 0.15, 0, Math.PI, false, 0x000000, 0);
            newMouth.setStrokeStyle(2, 0x000000, 0.8);
        }

        character.add(newMouth);
        character.mouth = newMouth;
    }

    /**
     * Set all squad members to an expression
     */
    setSquadExpression(emotion) {
        this.squadMembers.forEach(character => {
            this.setCharacterExpression(character, emotion);
        });
    }

    /**
     * Update loop - with gameplay mechanics!
     */
    update(time, delta) {
        if (this.gameState !== 'playing') return;

        const dt = delta / 1000;

        // ========== ENVIRONMENT POLISH - PARALLAX ==========
        this.updateParallaxLayers(dt);

        // ========== AUTO-SCROLL ==========
        const scrollAmount = WORLD.SCROLL_SPEED * dt;
        this.distance += scrollAmount;
        this.scrollOffset += scrollAmount;

        // ========== UI/HUD POLISH UPDATES ==========
        this.updateDistanceDisplay();        // Rolling numbers + milestone
        this.updateUpcomingPreview();        // Upcoming obstacles preview
        this.updateMultiplierDisplay();      // Multiplier based on combo

        // ========== ABILITY SYSTEM UPDATES ==========
        // Update energy regeneration
        if (this.energySystem) {
            this.energySystem.update(time, delta);
        }

        // Update ability UI (cooldowns, etc.)
        if (this.abilityUIBar) {
            this.abilityUIBar.update(time, delta);
        }

        // ========== AUDIO UPDATES ==========
        // AUDIO: Check for milestone (every 1000m)
        const currentMilestone = Math.floor(this.distance / 1000);
        const previousMilestone = Math.floor((this.distance - scrollAmount) / 1000);
        if (currentMilestone > previousMilestone && currentMilestone > 0) {
            this.playMilestoneSound();
        }

        // AUDIO: Dynamic music intensity based on squad size
        this.updateMusicIntensity();

        // AUDIO: Footsteps (play periodically based on squad movement)
        this.footstepTimer += delta;
        if (this.footstepTimer >= this.footstepInterval && this.squadMembers.length > 0) {
            this.playFootstepSound();
            this.footstepTimer = 0;
        }

        // Check combo timeout (3 seconds without collecting)
        if (this.comboCount > 0 && time - this.lastCollectibleTime > 3000) {
            this.resetCombo();
        }

        // ANIMATION IMPROVEMENTS 5: Check victory condition (reach 5000m)
        if (this.distance >= 5000 && this.gameState === 'playing') {
            this.triggerVictory();
        }

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

        // ========== COMBAT SYSTEM UPDATES ==========
        // Update squad manager proxy (shooting needs current position)
        this.updateSquadManagerProxy();

        // Update bullet pool (move bullets, cleanup off-screen)
        if (this.bulletPool) {
            this.bulletPool.update(time, delta);
        }

        // Update auto-shooting (fire bullets continuously)
        if (this.autoShootingSystem) {
            this.autoShootingSystem.update(time, delta);
        }

        // Update enemy manager (spawn waves, update enemies)
        if (this.enemyManager) {
            this.enemyManager.update(time, delta);
        }

        // Update boss manager (boss behavior, attacks, projectiles)
        if (this.bossManager) {
            this.bossManager.update(time, delta);
        }

        // Update boss health bar
        if (this.bossHealthBar) {
            this.bossHealthBar.update(time, delta);
        }

        // Check combat collisions (bullets vs enemies + boss)
        this.checkCombatCollisions();

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
        // Handle keyboard input - GRADUAL MOVEMENT (smooth like mouse)
        const KEYBOARD_SPEED = 8; // Pixels per frame (adjustable for feel)
        const centerX = GAME.WIDTH / 2;
        const minX = centerX - SQUAD.HORIZONTAL_LIMIT;
        const maxX = centerX + SQUAD.HORIZONTAL_LIMIT;

        if (this.cursors.left.isDown) {
            // Move gradually left (like analog stick)
            this.targetX -= KEYBOARD_SPEED;
            this.targetX = Math.max(this.targetX, minX); // Clamp to left boundary
        } else if (this.cursors.right.isDown) {
            // Move gradually right (like analog stick)
            this.targetX += KEYBOARD_SPEED;
            this.targetX = Math.min(this.targetX, maxX); // Clamp to right boundary
        }

        // Smooth movement toward target (works with both keyboard and mouse)
        this.squadCenterX = Phaser.Math.Linear(
            this.squadCenterX,
            this.targetX,
            SQUAD.FORMATION_LERP
        );

        // ========== CHARACTER ANIMATIONS ==========
        // Calculate movement direction for character tilt and eye direction
        const movementDelta = this.squadCenterX - this.previousSquadCenterX;
        const movementDirection = Math.sign(movementDelta); // -1 (left), 0 (still), 1 (right)
        this.previousSquadCenterX = this.squadCenterX;

        // Update all character animations (blinking, eye direction, rotation)
        this.updateCharacterAnimations(time, movementDirection);

        // ========== CAMERA ANIMATIONS ==========
        this.updateCameraAnimations(movementDelta);

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

                // UI/HUD POLISH 5: Track combo
                this.comboCount++;
                this.lastCollectibleTime = this.time.now;
                this.updateComboDisplay();

                // AUDIO: Collectible pickup sound + combo sound
                this.playCollectibleSound();
                this.playComboSound(this.comboCount);

                // CAMERA ANIMATION 9: Quick zoom on collectible
                this.cameraEventZoom(0.05, 100);

                // 6. FACIAL EXPRESSIONS - Happy when collecting!
                this.setSquadExpression('happy');
                this.time.delayedCall(1000, () => {
                    this.setSquadExpression('neutral');
                });

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

                // UI/HUD POLISH: Reset combo on hit
                this.resetCombo();

                // AUDIO: Obstacle hit sound
                this.playObstacleHitSound();

                // CAMERA ANIMATION 9: Quick zoom on impact
                this.cameraEventZoom(0.15, 150);

                // 6. FACIAL EXPRESSIONS - Worried when hit!
                this.setSquadExpression('worried');
                this.time.delayedCall(1000, () => {
                    this.setSquadExpression('neutral');
                });

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

                // OBJECT POLISH 6: Bright flash when passing through
                const isGoodGate = chosenGate.operation.mult || chosenGate.operation.add;

                // AUDIO: Gate pass sound (with operation-specific audio)
                const isMultiplication = chosenGate.operation.mult ? true : false;
                this.playGatePassSound(isMultiplication);

                // CAMERA ANIMATION 9: Quick zoom on gate pass
                this.cameraEventZoom(0.12, 200);

                // Create bright flash particle burst at gate position
                const flashColor = isGoodGate ? 0x00FFFF : 0xFFAA00;
                this.createParticleBurst(chosenGate.x, chosenGate.y, flashColor, 20);

                // Intense screen flash
                if (isGoodGate) {
                    this.cameras.main.flash(300, 100, 255, 255); // Bright cyan flash
                } else {
                    this.cameras.main.flash(300, 255, 150, 0); // Bright orange flash
                }

                // Create expanding ring effect
                const ring = this.add.circle(chosenGate.x, chosenGate.y, 20, flashColor, 0.8);
                ring.setDepth(50);
                ring.setBlendMode(Phaser.BlendModes.ADD);

                this.tweens.add({
                    targets: ring,
                    scale: 4,
                    alpha: 0,
                    duration: 500,
                    ease: 'Cubic.easeOut',
                    onComplete: () => ring.destroy()
                });

                // Chosen gate - expand and flash
                this.tweens.add({
                    targets: chosenGate,
                    scale: 1.5,
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
    /**
     * Remove squad members (ENHANCED with death animation)
     */
    removeSquadMembers(count) {
        for (let i = 0; i < count && this.squadMembers.length > 0; i++) {
            const member = this.squadMembers.pop();
            const shadow = member.groundShadow;

            // OBJECT ANIMATION 6: Death particle explosion
            const memberColor = member.body ? member.body.fillColor : 0x03A9F4;
            this.createParticleBurst(member.x, member.y, memberColor, 15);

            // AUDIO: Character death sound
            this.playCharacterDeathSound();

            // Add additional death effects
            this.cameras.main.flash(50, 255, 255, 255, false);

            this.tweens.add({
                targets: member,
                scale: 0,
                alpha: 0,
                angle: 360,
                duration: 200,
                ease: 'Back.easeIn',
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
     * Trigger game over (ENHANCED with slow-motion)
     */
    triggerGameOver() {
        console.log('💀 GAME OVER!');
        this.gameState = 'gameOver';

        // AUDIO: Play game over music
        this.playGameOverMusic();

        // ANIMATION IMPROVEMENTS 4: Slow-motion effect
        this.physics.world.timeScale = 3.0; // Slow down physics
        this.tweens.timeScale = 0.3; // Slow down tweens

        // Camera shake (slower due to time scale)
        this.cameras.main.shake(500, 0.02);

        // Screen flash red
        this.cameras.main.flash(300, 255, 0, 0);

        // Dramatic zoom
        this.cameras.main.zoomTo(1.2, 1000, 'Quad.easeIn');

        // "GAME OVER" text with dramatic entrance
        const gameOverText = this.add.text(
            GAME.WIDTH / 2,
            GAME.HEIGHT / 2 - 100,
            'GAME OVER',
            {
                fontSize: '80px',
                fontFamily: 'Arial Black',
                color: '#FF0000',
                stroke: '#000000',
                strokeThickness: 10
            }
        );
        gameOverText.setOrigin(0.5);
        gameOverText.setDepth(200);
        gameOverText.setScrollFactor(0);
        gameOverText.setScale(0);
        gameOverText.setAlpha(0);

        // Dramatic entrance animation
        this.tweens.add({
            targets: gameOverText,
            scale: 1.5,
            alpha: 1,
            duration: 1000,
            ease: 'Elastic.easeOut',
            onComplete: () => {
                // Shake text
                this.tweens.add({
                    targets: gameOverText,
                    angle: -5,
                    duration: 100,
                    yoyo: true,
                    repeat: 5
                });
            }
        });

        // ANIMATION IMPROVEMENTS 1: Scene transition fade-out
        // Delay before showing game over screen
        this.time.delayedCall(2500, () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
        });

        this.time.delayedCall(3000, () => {
            // Reset time scales
            this.physics.world.timeScale = 1.0;
            this.tweens.timeScale = 1.0;

            this.scene.start(SCENES.GAME_OVER, {
                distance: this.distance,
                squadSize: 0
            });
        });
    }

    /**
     * ANIMATION IMPROVEMENTS 5: Trigger victory screen
     */
    triggerVictory() {
        console.log('🎉 VICTORY!');
        this.gameState = 'victory';

        // AUDIO: Play victory music
        this.playVictoryMusic();

        // CAMERA ANIMATION 10: Zoom in on squad at level end
        // First zoom in on squad, then zoom out for celebration
        this.cameras.main.zoomTo(1.3, 500, 'Quad.easeIn', false, (camera, progress) => {
            if (progress === 1) {
                // Then zoom out for celebration view
                camera.zoomTo(0.9, 1000, 'Sine.easeInOut');
            }
        });

        // Victory overlay
        const victoryOverlay = this.add.rectangle(
            GAME.WIDTH / 2,
            GAME.HEIGHT / 2,
            GAME.WIDTH,
            GAME.HEIGHT,
            0x000000,
            0
        );
        victoryOverlay.setDepth(199);
        victoryOverlay.setScrollFactor(0);

        this.tweens.add({
            targets: victoryOverlay,
            alpha: 0.7,
            duration: 1000
        });

        // Victory text
        const victoryText = this.add.text(
            GAME.WIDTH / 2,
            GAME.HEIGHT / 2 - 100,
            'VICTORY!',
            {
                fontSize: '100px',
                fontFamily: 'Arial Black',
                color: '#FFD700',
                stroke: '#FFFFFF',
                strokeThickness: 12
            }
        );
        victoryText.setOrigin(0.5);
        victoryText.setDepth(200);
        victoryText.setScrollFactor(0);
        victoryText.setScale(0);

        // Victory entrance
        this.tweens.add({
            targets: victoryText,
            scale: 1.3,
            angle: 360,
            duration: 1500,
            ease: 'Elastic.easeOut'
        });

        // Pulsing glow
        this.tweens.add({
            targets: victoryText,
            alpha: 0.7,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        // Stats text
        const statsText = this.add.text(
            GAME.WIDTH / 2,
            GAME.HEIGHT / 2 + 50,
            `Distance: ${Math.floor(this.distance)}m\nSquad: ${this.squadMembers.length}`,
            {
                fontSize: '32px',
                fontFamily: 'Arial',
                color: '#FFFFFF',
                stroke: '#000000',
                strokeThickness: 6,
                align: 'center'
            }
        );
        statsText.setOrigin(0.5);
        statsText.setDepth(200);
        statsText.setScrollFactor(0);
        statsText.setAlpha(0);

        this.tweens.add({
            targets: statsText,
            alpha: 1,
            y: statsText.y + 20,
            duration: 800,
            delay: 500,
            ease: 'Back.easeOut'
        });

        // ANIMATION IMPROVEMENTS 5: Confetti particles!
        this.createConfettiExplosion();

        // Continue after delay
        this.time.delayedCall(5000, () => {
            this.cameras.main.fadeOut(500);
        });

        this.time.delayedCall(5500, () => {
            // Transition to victory screen
            this.scene.start(SCENES.VICTORY, {
                score: this.score,
                distance: this.distance,
                enemiesKilled: this.enemiesKilled,
                bossDefeated: false, // Distance victory, not boss victory
                stageNumber: this.stageNumber,
                timePlayed: this.time.now / 1000 // Convert to seconds
            });
        });
    }

    /**
     * ANIMATION IMPROVEMENTS 5: Create confetti explosion
     */
    createConfettiExplosion() {
        const confettiCount = 100;
        const colors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF, 0xFFA500];

        for (let i = 0; i < confettiCount; i++) {
            const x = Phaser.Math.Between(0, GAME.WIDTH);
            const y = -20;
            const color = Phaser.Utils.Array.GetRandom(colors);

            // Random confetti shape (rectangle or circle)
            const isCircle = Math.random() > 0.5;
            let confetti;

            if (isCircle) {
                confetti = this.add.circle(x, y, 5, color);
            } else {
                confetti = this.add.rectangle(x, y, 8, 8, color);
            }

            confetti.setDepth(201);
            confetti.setScrollFactor(0);

            // Random rotation
            const rotation = Math.random() * Math.PI * 2;
            confetti.setRotation(rotation);

            // Fall animation with rotation
            const fallDuration = Phaser.Math.Between(2000, 4000);
            const endY = GAME.HEIGHT + 20;
            const drift = Phaser.Math.Between(-100, 100);

            this.tweens.add({
                targets: confetti,
                y: endY,
                x: x + drift,
                angle: rotation + (Math.random() > 0.5 ? 360 : -360) * 3,
                alpha: 0,
                duration: fallDuration,
                ease: 'Cubic.easeIn',
                delay: Math.random() * 500,
                onComplete: () => confetti.destroy()
            });

            // Wiggle while falling
            this.tweens.add({
                targets: confetti,
                x: `+=${Phaser.Math.Between(-30, 30)}`,
                duration: 400,
                yoyo: true,
                repeat: Math.floor(fallDuration / 800),
                ease: 'Sine.easeInOut'
            });
        }

        console.log('🎊 Confetti explosion created!');
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

    // ========================================
    // COMBAT SYSTEM 🔫
    // ========================================

    /**
     * COMBAT: Initialize combat system
     */
    initializeCombatSystem() {
        console.log('🔫 Initializing combat system...');

        // Create bullet pool (50 bullets max)
        this.bulletPool = new BulletPool(this, 50);

        // Create squad manager reference (needed for shooting system)
        const squadManagerProxy = {
            squadCenterX: this.squadCenterX,
            squadCenterY: this.squadCenterY,
            squadMembers: this.squadMembers
        };

        // Create auto-shooting system
        this.autoShootingSystem = new AutoShootingSystem(
            this,
            this.bulletPool,
            squadManagerProxy
        );

        // Apply character stats to combat system
        if (this.characterStats) {
            this.autoShootingSystem.damageModifier = this.characterStats.damage;
            this.autoShootingSystem.fireRateModifier = 1 / this.characterStats.fireRate; // Lower = faster
            console.log(`⚔️ Combat stats applied: Damage ${(this.characterStats.damage * 100).toFixed(0)}%, Fire Rate ${(this.characterStats.fireRate * 100).toFixed(0)}%`);
        }

        // Create enemy manager
        this.enemyManager = new EnemyManager(this);

        // Start enemy spawning after countdown
        this.time.delayedCall(3000, () => {
            this.enemyManager.resumeSpawning(this.time.now);
        });

        console.log('✓ Combat system initialized');
    }

    /**
     * COMBAT: Check bullet-enemy collisions + boss collisions
     */
    checkCombatCollisions() {
        const bullets = this.bulletPool.getActiveBullets();
        const enemies = this.enemyManager.getActiveEnemies();

        // Check each bullet against each enemy
        for (let bullet of bullets) {
            if (!bullet.active) continue;

            // Check bullet vs regular enemies
            for (let enemy of enemies) {
                if (!enemy.active) continue;

                // Simple circle collision
                const dist = Phaser.Math.Distance.Between(
                    bullet.x,
                    bullet.y,
                    enemy.container.x,
                    enemy.container.y
                );

                if (dist < (bullet.core.radius + enemy.getRadius())) {
                    // Hit!
                    const killed = enemy.takeDamage(bullet.damage);

                    // Recycle bullet
                    this.bulletPool.recycleBullet(bullet);

                    // Update score if killed
                    if (killed) {
                        this.score += enemy.getScoreValue();
                        this.enemiesKilled++;
                    }

                    // Play hit sound
                    if (this.playBulletHitSound) {
                        this.playBulletHitSound();
                    }

                    break; // Bullet hit, stop checking this bullet
                }
            }

            // Check bullet vs boss (if boss active)
            if (bullet.active && this.bossManager && this.bossManager.isBossAlive()) {
                const boss = this.bossManager.getCurrentBoss();
                if (boss && boss.active) {
                    const dist = Phaser.Math.Distance.Between(
                        bullet.x,
                        bullet.y,
                        boss.x,
                        boss.y
                    );

                    if (dist < (bullet.core.radius + boss.size)) {
                        // Hit boss!
                        const killed = boss.takeDamage(bullet.damage);

                        // Recycle bullet
                        this.bulletPool.recycleBullet(bullet);

                        // Play hit sound (louder for boss)
                        if (this.playBulletHitSound) {
                            this.playBulletHitSound();
                        }

                        // If boss defeated, handled by boss itself
                    }
                }
            }
        }

        // Check boss projectiles vs player squad
        if (this.bossManager && this.bossProjectiles) {
            for (let i = this.bossProjectiles.length - 1; i >= 0; i--) {
                const projectile = this.bossProjectiles[i];
                if (!projectile || !projectile.active) continue;

                // Check collision with squad
                const dist = Phaser.Math.Distance.Between(
                    projectile.x,
                    projectile.y,
                    this.squadCenterX,
                    this.squadCenterY
                );

                // Squad hit radius (approx 30px)
                if (dist < 40) {
                    // Hit squad!
                    this.takeDamage(projectile.damage || 10);

                    // Destroy projectile
                    projectile.active = false;
                    if (projectile.destroy) {
                        projectile.destroy();
                    }
                    this.bossProjectiles.splice(i, 1);
                }
            }
        }
    }

    /**
     * Player takes damage from boss attacks
     */
    takeDamage(damage) {
        // Reduce squad size based on damage
        const membersToLose = Math.floor(damage / 10); // 10 damage = 1 member

        for (let i = 0; i < membersToLose && this.squadMembers.length > 0; i++) {
            const member = this.squadMembers.pop();
            if (member && member.destroy) {
                member.destroy();
            }

            // Remove shadow
            if (this.groundShadows.length > 0) {
                const shadow = this.groundShadows.pop();
                if (shadow && shadow.destroy) {
                    shadow.destroy();
                }
            }
        }

        // Update squad display
        if (this.squadBubbleText) {
            this.squadBubbleText.setText(`${this.squadMembers.length}`);
        }

        // Screen shake on hit
        this.cameras.main.shake(200, 0.005);

        // Check game over
        if (this.squadMembers.length === 0) {
            this.gameOver();
        }
    }

    /**
     * COMBAT: Update squad manager proxy (for shooting system)
     */
    updateSquadManagerProxy() {
        // The AutoShootingSystem needs current squad position
        // Update the proxy with current values
        if (this.autoShootingSystem && this.autoShootingSystem.squadManager) {
            this.autoShootingSystem.squadManager.squadCenterX = this.squadCenterX;
            this.autoShootingSystem.squadManager.squadCenterY = this.squadCenterY;
            this.autoShootingSystem.squadManager.squadMembers = this.squadMembers;
        }
    }

    // ========================================
    // ABILITY SYSTEM 💪
    // ========================================

    /**
     * ABILITY: Initialize ability system
     */
    initializeAbilitySystem() {
        console.log('💪 Initializing ability system...');

        // Create energy system (base HP from character stats)
        const baseHP = this.characterStats?.hp || 100;
        this.energySystem = new EnergySystem(this, baseHP, 10);

        // Create ability effects executor
        this.abilityEffects = new AbilityEffects(this);

        // Get abilities from selected characters, or default loadout
        if (this.selectedCharacters.length > 0) {
            this.abilities = getCombinedAbilities(this.selectedCharacters);
            console.log(`🎯 Character abilities loaded: ${this.abilities.map(a => a.name).join(', ')}`);
        } else {
            this.abilities = getDefaultLoadout();
            console.log('⚠️ Using default ability loadout');
        }

        // Create ability UI bar (bottom center)
        this.abilityUIBar = new AbilityUIBar(
            this,
            GAME.WIDTH / 2,    // Center X
            550,                // Bottom Y
            this.abilities,
            this.energySystem,
            (abilityData) => this.handleAbilityActivation(abilityData)
        );

        console.log('✓ Ability system initialized');
    }

    /**
     * ABILITY: Handle ability activation
     */
    handleAbilityActivation(abilityData) {
        console.log(`🎯 Activating ability: ${abilityData.name}`);

        // Execute ability effect
        if (this.abilityEffects) {
            this.abilityEffects.executeAbility(abilityData);
        }

        // Visual feedback - screen effect based on ability
        const flashColors = {
            'FIREBALL': [255, 100, 0],
            'SHIELD': [0, 200, 255],
            'LIGHTNING': [255, 255, 100],
            'MULTI_SHOT': [200, 0, 255],
            'SPEED_BOOST': [0, 255, 100]
        };

        const color = flashColors[abilityData.id] || [255, 255, 255];
        this.cameras.main.flash(150, ...color, false);
    }

    // ========================================
    // AUDIO SYSTEM 🔊
    // ========================================

    /**
     * AUDIO: Initialize audio system
     */
    initializeAudio() {
        console.log('🔊 Initializing audio system...');

        // Start background music
        this.playBackgroundMusic('game');

        // Start ambient audio loops
        this.startAmbientAudio();

        console.log('✓ Audio system initialized');
    }

    /**
     * AUDIO: Play background music with state
     */
    playBackgroundMusic(state) {
        if (!this.audioEnabled) return;

        this.currentMusicState = state;

        // For now, use Web Audio API to create simple music loops
        // In production, you would load actual audio files

        // Create base music loop (120 BPM for game)
        const bpm = state === 'game' ? 130 : 100;
        const beatInterval = (60 / bpm) * 1000;

        // Clear existing music loops
        if (this.musicLoopTimer) {
            clearInterval(this.musicLoopTimer);
        }

        // Simple procedural music loop
        this.musicLoopTimer = setInterval(() => {
            if (this.gameState === 'playing') {
                this.playMusicalNote(220, 0.1, 0.15, 'square'); // Bass note
            }
        }, beatInterval);

        // Melody layer (plays less frequently)
        this.melodyLoopTimer = setInterval(() => {
            if (this.gameState === 'playing') {
                const melodyNotes = [330, 440, 550, 660];
                const note = melodyNotes[Math.floor(Math.random() * melodyNotes.length)];
                this.playMusicalNote(note, 0.05, 0.2, 'sine');
            }
        }, beatInterval * 4);

        console.log(`♪ Background music started (${state}, ${bpm} BPM)`);
    }

    /**
     * AUDIO: Dynamic music - add layers based on squad size
     */
    updateMusicIntensity() {
        if (!this.audioEnabled) return;

        const squadSize = this.squadMembers.length;

        // Dynamic music intensity based on squad size
        // < 5: Minimal (just base)
        // 5-24: Normal (base + melody)
        // 25-49: Intense (base + melody + drums)
        // 50+: Maximum (all layers)

        // This is a placeholder for actual layered music system
        // In production, you would adjust volume of different music layers

        if (squadSize >= 50) {
            // Maximum intensity - all layers playing
            this.musicIntensityLevel = 4;
        } else if (squadSize >= 25) {
            this.musicIntensityLevel = 3;
        } else if (squadSize >= 5) {
            this.musicIntensityLevel = 2;
        } else {
            this.musicIntensityLevel = 1;
        }
    }

    /**
     * AUDIO: Play a musical note using Web Audio API
     */
    playMusicalNote(frequency, volume, duration, waveType = 'sine') {
        if (!this.audioEnabled || !this.audioContext) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = waveType;

            gainNode.gain.setValueAtTime(volume * this.musicVolume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (e) {
            console.warn('Audio playback error:', e);
        }
    }

    /**
     * AUDIO: Start ambient audio loops
     */
    startAmbientAudio() {
        if (!this.audioEnabled) return;

        // AMBIENT 1: Background ambience (subtle wind/atmosphere)
        this.ambientWindTimer = setInterval(() => {
            if (this.gameState === 'playing') {
                // Subtle wind whoosh
                this.playWhiteNoise(0.02, 2000);
            }
        }, 5000);

        // AMBIENT 3: Water sounds (tied to water background)
        this.ambientWaterTimer = setInterval(() => {
            if (this.gameState === 'playing') {
                // Subtle water splash/ripple
                this.playSweep(150, 80, 0.03, 0.5);
            }
        }, 8000);

        console.log('🌊 Ambient audio started');
    }

    /**
     * AUDIO: Stop all music and ambient audio
     */
    stopAllMusic() {
        if (this.musicLoopTimer) clearInterval(this.musicLoopTimer);
        if (this.melodyLoopTimer) clearInterval(this.melodyLoopTimer);
        if (this.ambientWindTimer) clearInterval(this.ambientWindTimer);
        if (this.ambientWaterTimer) clearInterval(this.ambientWaterTimer);
    }

    /**
     * SFX 1: Collectible pickup sound - Pleasant "ding" or "pop"
     */
    playCollectibleSound() {
        if (!this.audioEnabled) return;

        // Pleasant ascending ding
        this.playMusicalNote(880, 0.15 * this.sfxVolume, 0.1, 'sine');
        setTimeout(() => {
            this.playMusicalNote(1320, 0.12 * this.sfxVolume, 0.15, 'sine');
        }, 50);

        console.log('♪ Collectible sound');
    }

    /**
     * SFX 2: Obstacle hit sound - Heavy "thud" or "crash"
     */
    playObstacleHitSound() {
        if (!this.audioEnabled) return;

        // Heavy thud (low frequency burst)
        this.playMusicalNote(80, 0.3 * this.sfxVolume, 0.2, 'square');
        this.playWhiteNoise(0.2 * this.sfxVolume, 100);

        console.log('💥 Obstacle hit sound');
    }

    /**
     * SFX 3: Gate pass sound - Whoosh + operation-specific sound
     */
    playGatePassSound(isMultiplication = false) {
        if (!this.audioEnabled) return;

        // Whoosh (sweep from high to low)
        this.playSweep(1000, 200, 0.2 * this.sfxVolume, 0.3);

        // Operation-specific sound
        if (isMultiplication) {
            // Positive/exciting sound for multiplication
            setTimeout(() => {
                this.playMusicalNote(880, 0.15 * this.sfxVolume, 0.15, 'sine');
                setTimeout(() => {
                    this.playMusicalNote(1100, 0.15 * this.sfxVolume, 0.15, 'sine');
                }, 80);
            }, 150);
        } else {
            // Neutral sound for other operations
            setTimeout(() => {
                this.playMusicalNote(440, 0.12 * this.sfxVolume, 0.2, 'square');
            }, 150);
        }

        console.log('🌀 Gate pass sound');
    }

    /**
     * SFX 4: Character join sound - Quick "pop" sound
     */
    playCharacterJoinSound() {
        if (!this.audioEnabled) return;

        // Quick pop
        this.playMusicalNote(660, 0.1 * this.sfxVolume, 0.08, 'sine');

        console.log('👤 Character join sound');
    }

    /**
     * SFX 5: Character death sound - Subtle "oof" or pop
     */
    playCharacterDeathSound() {
        if (!this.audioEnabled) return;

        // Descending "oof"
        this.playSweep(440, 220, 0.15 * this.sfxVolume, 0.15);

        console.log('💀 Character death sound');
    }

    /**
     * SFX 6: Movement footsteps - Subtle, many characters
     */
    playFootstepSound() {
        if (!this.audioEnabled) return;

        // Very subtle footstep (short low frequency click)
        const volume = Math.min(0.03 + (this.squadMembers.length * 0.002), 0.15) * this.sfxVolume;
        this.playMusicalNote(100, volume, 0.05, 'square');
    }

    /**
     * SFX 7: Button press sound
     */
    playButtonClickSound() {
        if (!this.audioEnabled) return;

        this.playMusicalNote(550, 0.15 * this.sfxVolume, 0.08, 'sine');
        setTimeout(() => {
            this.playMusicalNote(660, 0.12 * this.sfxVolume, 0.1, 'sine');
        }, 30);

        console.log('🔘 Button click sound');
    }

    /**
     * SFX 8: Button hover sound
     */
    playButtonHoverSound() {
        if (!this.audioEnabled) return;

        // Very subtle hover sound
        this.playMusicalNote(440, 0.05 * this.sfxVolume, 0.06, 'sine');

        console.log('👆 Button hover sound');
    }

    /**
     * SFX 9: Milestone achievement sound (every 1000m)
     */
    playMilestoneSound() {
        if (!this.audioEnabled) return;

        // Triumphant fanfare (ascending notes)
        const notes = [440, 550, 660, 880];
        notes.forEach((note, i) => {
            setTimeout(() => {
                this.playMusicalNote(note, 0.2 * this.sfxVolume, 0.2, 'sine');
            }, i * 80);
        });

        console.log('🏆 Milestone sound');
    }

    /**
     * SFX 10: Combo sound - Pitch increases with combo chain
     */
    playComboSound(comboCount) {
        if (!this.audioEnabled) return;

        // Pitch increases with combo (cap at x10)
        const basePitch = 440;
        const pitchMultiplier = 1 + (Math.min(comboCount, 10) * 0.1);
        const frequency = basePitch * pitchMultiplier;

        this.playMusicalNote(frequency, 0.15 * this.sfxVolume, 0.1, 'sine');

        if (comboCount >= 5) {
            // Extra sparkle for high combos
            setTimeout(() => {
                this.playMusicalNote(frequency * 1.5, 0.1 * this.sfxVolume, 0.08, 'sine');
            }, 50);
        }

        console.log(`🔥 Combo x${comboCount} sound`);
    }

    /**
     * AMBIENT 2: Crowd cheering when squad grows
     */
    playCrowdCheerSound() {
        if (!this.audioEnabled) return;

        // Simulate crowd cheer with filtered white noise
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.playWhiteNoise(0.08 * this.ambientVolume, 200);
            }, i * 50);
        }

        console.log('👥 Crowd cheer sound');
    }

    /**
     * MUSIC: Game over music - Sad/tense sting
     */
    playGameOverMusic() {
        if (!this.audioEnabled) return;

        this.stopAllMusic();

        // Descending sad notes
        const sadNotes = [440, 370, 330, 277];
        sadNotes.forEach((note, i) => {
            setTimeout(() => {
                this.playMusicalNote(note, 0.25 * this.musicVolume, 0.5, 'sine');
            }, i * 300);
        });

        console.log('😢 Game over music');
    }

    /**
     * MUSIC: Victory music - Triumphant fanfare
     */
    playVictoryMusic() {
        if (!this.audioEnabled) return;

        this.stopAllMusic();

        // Triumphant ascending fanfare
        const victoryNotes = [330, 440, 550, 660, 880];
        victoryNotes.forEach((note, i) => {
            setTimeout(() => {
                this.playMusicalNote(note, 0.3 * this.musicVolume, 0.3, 'sine');
                this.playMusicalNote(note * 1.5, 0.15 * this.musicVolume, 0.3, 'sine');
            }, i * 150);
        });

        // Sustained victory chord
        setTimeout(() => {
            this.playMusicalNote(660, 0.2 * this.musicVolume, 2.0, 'sine');
            this.playMusicalNote(880, 0.2 * this.musicVolume, 2.0, 'sine');
            this.playMusicalNote(1100, 0.2 * this.musicVolume, 2.0, 'sine');
        }, 800);

        console.log('🎉 Victory music');
    }

    /**
     * AUDIO: Play frequency sweep (for whooshes, etc.)
     */
    playSweep(startFreq, endFreq, volume, duration) {
        if (!this.audioEnabled || !this.audioContext) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.setValueAtTime(startFreq, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(endFreq, this.audioContext.currentTime + duration);

            gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (e) {
            console.warn('Audio sweep error:', e);
        }
    }

    /**
     * AUDIO: Play white noise burst (for impacts, crowds, etc.)
     */
    playWhiteNoise(volume, duration) {
        if (!this.audioEnabled || !this.audioContext) return;

        try {
            const bufferSize = this.audioContext.sampleRate * (duration / 1000);
            const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const output = buffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }

            const whiteNoise = this.audioContext.createBufferSource();
            whiteNoise.buffer = buffer;

            const gainNode = this.audioContext.createGain();
            gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);

            whiteNoise.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            whiteNoise.start(this.audioContext.currentTime);
            whiteNoise.stop(this.audioContext.currentTime + (duration / 1000));
        } catch (e) {
            console.warn('White noise error:', e);
        }
    }

    /**
     * AUDIO: Countdown beep sound
     */
    playCountdownBeep(isGo = false) {
        if (!this.audioEnabled) return;

        if (isGo) {
            // "GO!" - exciting ascending sound
            this.playMusicalNote(660, 0.25 * this.sfxVolume, 0.2, 'square');
            setTimeout(() => {
                this.playMusicalNote(880, 0.25 * this.sfxVolume, 0.3, 'square');
            }, 80);
        } else {
            // Regular countdown beep
            this.playMusicalNote(550, 0.2 * this.sfxVolume, 0.15, 'square');
        }

        console.log(`⏱ Countdown beep (${isGo ? 'GO!' : 'beep'})`);
    }

    /**
     * COMBAT AUDIO: Shooting sound (subtle, continuous)
     */
    playShootingSound() {
        if (!this.audioEnabled) return;

        // Very subtle shooting sound (short, high frequency)
        this.playMusicalNote(1200, 0.03 * this.sfxVolume, 0.03, 'square');
    }

    /**
     * COMBAT AUDIO: Bullet hit enemy sound
     */
    playBulletHitSound() {
        if (!this.audioEnabled) return;

        // Impact sound (short, punchy)
        this.playMusicalNote(200, 0.08 * this.sfxVolume, 0.05, 'square');
        this.playWhiteNoise(0.05 * this.sfxVolume, 30);
    }

    /**
     * COMBAT AUDIO: Enemy death explosion sound
     */
    playEnemyDeathSound() {
        if (!this.audioEnabled) return;

        // Explosion sound (sweep down + white noise)
        this.playSweep(300, 100, 0.12 * this.sfxVolume, 0.2);
        this.playWhiteNoise(0.1 * this.sfxVolume, 150);
    }

    /**
     * BOSS AUDIO: Boss warning siren
     */
    playBossWarningSiren() {
        if (!this.audioEnabled) return;

        // Dramatic warning siren (sweep up and down)
        this.playSweep(200, 600, 0.15 * this.sfxVolume, 1.0);
        setTimeout(() => {
            this.playSweep(600, 200, 0.15 * this.sfxVolume, 1.0);
        }, 1000);
    }

    /**
     * BOSS AUDIO: Boss attack sound
     */
    playBossAttackSound() {
        if (!this.audioEnabled) return;

        // Heavy attack sound (low frequency + noise)
        this.playMusicalNote(150, 0.15 * this.sfxVolume, 0.3, 'sawtooth');
        this.playWhiteNoise(0.08 * this.sfxVolume, 100);
    }

    /**
     * BOSS AUDIO: Boss phase transition sound
     */
    playBossPhaseSound() {
        if (!this.audioEnabled) return;

        // Epic phase change sound (sweep up + dramatic note)
        this.playSweep(100, 800, 0.2 * this.sfxVolume, 0.5);
        setTimeout(() => {
            this.playMusicalNote(400, 0.2 * this.sfxVolume, 0.5, 'square');
        }, 300);
    }

    /**
     * BOSS AUDIO: Boss defeated sound
     */
    playBossDefeatedSound() {
        if (!this.audioEnabled) return;

        // Epic death explosion (long sweep down + lots of noise)
        this.playSweep(800, 50, 0.25 * this.sfxVolume, 1.5);
        this.playWhiteNoise(0.2 * this.sfxVolume, 1000);

        // Victory chime after explosion
        setTimeout(() => {
            this.playMusicalNote(523, 0.15 * this.sfxVolume, 0.3, 'sine'); // C5
            setTimeout(() => {
                this.playMusicalNote(659, 0.15 * this.sfxVolume, 0.3, 'sine'); // E5
                setTimeout(() => {
                    this.playMusicalNote(784, 0.2 * this.sfxVolume, 0.5, 'sine'); // G5
                }, 150);
            }, 150);
        }, 1500);
    }

    /**
     * BOSS AUDIO: Boss music (intense combat music)
     */
    playBossMusic() {
        if (!this.audioEnabled) return;

        // Stop regular music
        this.stopAllMusic();

        // Faster, more intense music loop
        const bpm = 160; // Fast tempo for boss
        const beatInterval = (60 / bpm) * 1000;

        this.musicLoopTimer = setInterval(() => {
            if (this.gameState === 'playing' || this.gameState === 'victory') {
                // Intense bass line
                this.playMusicalNote(65, 0.08 * this.musicVolume, 0.2, 'square');

                // High energy notes
                setTimeout(() => {
                    this.playMusicalNote(330, 0.05 * this.musicVolume, 0.1, 'sawtooth');
                }, beatInterval / 4);

                setTimeout(() => {
                    this.playMusicalNote(392, 0.05 * this.musicVolume, 0.1, 'sawtooth');
                }, beatInterval / 2);

                setTimeout(() => {
                    this.playMusicalNote(440, 0.05 * this.musicVolume, 0.1, 'sawtooth');
                }, (beatInterval * 3) / 4);
            }
        }, beatInterval);

        console.log('🎵 Boss battle music started');
    }

    // ========================================
    // BOSS BATTLE SYSTEM 👑
    // ========================================

    /**
     * BOSS: Initialize boss system
     */
    initializeBossSystem() {
        console.log('👑 Initializing boss battle system...');

        // Create boss manager
        this.bossManager = new BossManager(this);

        // Set up boss health bar callback (created when boss spawns)
        const originalSpawnBoss = this.bossManager.spawnBoss.bind(this.bossManager);
        this.bossManager.spawnBoss = (bossType) => {
            originalSpawnBoss(bossType);

            // Create health bar after boss is spawned (3 second delay for warning)
            this.time.delayedCall(3000, () => {
                if (this.bossManager.currentBoss && !this.bossManager.currentBoss.isDestroyed) {
                    this.bossHealthBar = new BossHealthBar(this, this.bossManager.currentBoss);
                }
            });
        };

        console.log('✓ Boss battle system initialized');
    }

    /**
     * BOSS: Handle boss victory
     */
    handleBossVictory() {
        console.log('🎉 Boss battle won!');

        // Stop game state
        this.gameState = 'victory';

        // Camera effect
        this.cameras.main.fadeOut(2000, 255, 215, 0); // Gold fade

        // Transition to victory screen after fade
        this.time.delayedCall(2000, () => {
            // Go to victory screen
            this.scene.start(SCENES.VICTORY, {
                score: this.score,
                distance: this.distance,
                enemiesKilled: this.enemiesKilled,
                bossDefeated: true,
                stageNumber: this.stageNumber,
                timePlayed: this.time.now / 1000 // Convert to seconds
            });
        });
    }

    shutdown() {
        console.log('🛑 GameScene shutdown');

        // Stop all audio
        this.stopAllMusic();

        this.input.off('pointerdown');
        this.input.off('pointermove');
        this.input.off('pointerup');
    }
}
