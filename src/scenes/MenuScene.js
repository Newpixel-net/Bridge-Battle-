import Phaser from 'phaser';
import { GAME, COLORS, SCENES, UI_SCALE } from '../utils/GameConstants.js';

/**
 * MenuScene - Enhanced Main Menu
 *
 * FEATURES:
 * - Professional title and logo
 * - Start Game button
 * - How to Play panel
 * - Settings panel (audio controls)
 * - Credits screen
 * - Animated background elements
 */
export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.MENU });
    }

    init() {
        // Menu state
        this.currentPanel = null; // 'howtoplay', 'settings', 'credits', or null

        // Audio settings (persistent across game)
        if (window.gameSettings === undefined) {
            window.gameSettings = {
                audioEnabled: true,
                musicVolume: 0.5,
                sfxVolume: 0.7
            };
        }
    }

    create() {
        const centerX = GAME.WIDTH / 2;
        const centerY = GAME.HEIGHT / 2;

        console.log('🎮 MenuScene.create() called');

        // Get AtlasHelper from registry (initialized in PreloadScene)
        this.atlasHelper = this.registry.get('atlasHelper');

        console.log('🔍 AtlasHelper status:', this.atlasHelper ? 'AVAILABLE' : 'NOT AVAILABLE');

        if (this.atlasHelper) {
            console.log('✓ AtlasHelper available - using professional sprite atlases');
            console.log('🔍 Testing atlas - available textures:', this.textures.list);
            console.log('🔍 Checking for main texture:', this.textures.exists('main'));
            console.log('🔍 Checking for buttons texture:', this.textures.exists('buttons'));
            console.log('🔍 Checking for panels texture:', this.textures.exists('panels'));
        } else {
            console.log('⚠️  AtlasHelper not available - using fallback PNG assets');
        }

        // DEBUG: Show full textures to verify they're loading
        console.log('🔍 DEBUG: Creating full texture test...');
        const testMain = this.add.image(100, 100, 'main');
        testMain.setOrigin(0, 0);
        testMain.setAlpha(0.5);
        testMain.setScale(0.2);

        const testButtons = this.add.image(100, 300, 'buttons');
        testButtons.setOrigin(0, 0);
        testButtons.setAlpha(0.5);
        testButtons.setScale(0.2);

        const testPanels = this.add.image(100, 500, 'panels');
        testPanels.setOrigin(0, 0);
        testPanels.setAlpha(0.5);
        testPanels.setScale(0.2);

        // Animated background
        this.createAnimatedBackground();

        // Logo/Title section
        this.createTitle();

        // Main menu buttons
        this.createMainButtons();

        // Version info
        this.createVersionInfo();

        // Grass decorations REMOVED - using atlas system only
        // this.createGrassDecorations();

        // Keyboard shortcuts
        this.setupKeyboardShortcuts();

        console.log('🎮 Enhanced Menu Scene Ready');
    }

    /**
     * Create animated background with professional AAA elements
     */
    createAnimatedBackground() {
        const centerX = GAME.WIDTH / 2;
        const centerY = GAME.HEIGHT / 2;

        // Rich gradient background
        const bg = this.add.rectangle(centerX, centerY, GAME.WIDTH, GAME.HEIGHT, 0x1a1a2e);

        // Create gradient effect with multiple overlays
        const gradientTop = this.add.rectangle(centerX, 150, GAME.WIDTH, 300, 0x2d1b4e, 0.4);
        const gradientBottom = this.add.rectangle(centerX, GAME.HEIGHT - 150, GAME.WIDTH, 300, 0x0f3460, 0.3);

        if (!this.atlasHelper) return;

        // PROFESSIONAL: Rotating sunburst rays background
        const sunburst = this.atlasHelper.createSprite(centerX, 200, 'sunburst_rays');
        sunburst.setAlpha(0.15);
        sunburst.setDepth(1);

        // Slow eternal rotation
        this.tweens.add({
            targets: sunburst,
            angle: 360,
            duration: 30000,
            repeat: -1,
            ease: 'Linear'
        });

        // PROFESSIONAL: Ice crystal decorations in corners
        const crystalTopLeft = this.atlasHelper.createSprite(120, 80, 'ice_crystals');
        crystalTopLeft.setAlpha(0.6);
        crystalTopLeft.setDepth(1);

        const crystalTopRight = this.atlasHelper.createSprite(GAME.WIDTH - 120, 80, 'ice_crystals');
        crystalTopRight.setAlpha(0.6);
        crystalTopRight.setFlipX(true);
        crystalTopRight.setDepth(1);

        // Floating animation for crystals
        this.tweens.add({
            targets: [crystalTopLeft, crystalTopRight],
            y: '-=15',
            duration: 2500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // PROFESSIONAL: Floating stars
        for (let i = 0; i < 8; i++) {
            const starX = Phaser.Math.Between(100, GAME.WIDTH - 100);
            const starY = Phaser.Math.Between(100, GAME.HEIGHT - 100);

            const star = this.atlasHelper.createSprite(starX, starY,
                i % 3 === 0 ? 'star_yellow_filled' : 'star_yellow_outline');
            star.setAlpha(0.3);
            star.setDepth(1);

            // Gentle floating
            this.tweens.add({
                targets: star,
                y: starY - 30,
                alpha: 0.6,
                duration: Phaser.Math.Between(2000, 4000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
                delay: Phaser.Math.Between(0, 2000)
            });

            // Gentle rotation
            this.tweens.add({
                targets: star,
                angle: 360,
                duration: Phaser.Math.Between(8000, 12000),
                repeat: -1,
                ease: 'Linear'
            });
        }
    }

    /**
     * Create title section with professional AAA elements
     */
    createTitle() {
        const centerX = GAME.WIDTH / 2;

        if (!this.atlasHelper) return;

        // PROFESSIONAL: Golden panel background for title area
        const titlePanel = this.atlasHelper.createSprite(centerX, 180, 'panel_golden');
        titlePanel.setDepth(5);
        titlePanel.setScale(1.1); // Slightly larger for prominence

        // Scale in animation on load
        titlePanel.setScale(0);
        this.tweens.add({
            targets: titlePanel,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 800,
            ease: 'Elastic.easeOut',
            delay: 300
        });

        // Gentle floating
        this.tweens.add({
            targets: titlePanel,
            y: 175,
            duration: 2500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            delay: 1100
        });

        // PROFESSIONAL: Decorative stars around panel
        const starPositions = [
            { x: centerX - 200, y: 100 },
            { x: centerX + 200, y: 100 },
            { x: centerX - 180, y: 250 },
            { x: centerX + 180, y: 250 }
        ];

        starPositions.forEach((pos, i) => {
            const star = this.atlasHelper.createSprite(pos.x, pos.y, 'star_yellow_filled');
            star.setDepth(6);
            star.setScale(0.8);

            // Pop in animation
            star.setScale(0);
            this.tweens.add({
                targets: star,
                scaleX: 0.8,
                scaleY: 0.8,
                duration: 600,
                ease: 'Back.easeOut',
                delay: 500 + (i * 100)
            });

            // Twinkle
            this.tweens.add({
                targets: star,
                alpha: 0.5,
                duration: 1000 + (i * 200),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });

        // Main title text over panel
        const title = this.add.text(centerX, 160, 'BRIDGE\nBATTLE', {
            fontSize: '68px',
            fontFamily: 'Arial Black',
            color: '#FFFFFF',
            stroke: '#4A2C2A',
            strokeThickness: 10,
            align: 'center',
            shadow: {
                offsetX: 3,
                offsetY: 3,
                color: '#000000',
                blur: 12,
                fill: true
            }
        });
        title.setOrigin(0.5);
        title.setDepth(10);

        // Fade in animation
        title.setAlpha(0);
        this.tweens.add({
            targets: title,
            alpha: 1,
            duration: 1000,
            delay: 800
        });

        // PROFESSIONAL: "TAP TO PLAY" sprite below
        const tapToPlay = this.atlasHelper.createSprite(centerX, 290, 'text_tap_to_play');
        tapToPlay.setDepth(10);

        // Pulse animation - AAA feel
        tapToPlay.setScale(0);
        this.tweens.add({
            targets: tapToPlay,
            scaleX: 0.8,
            scaleY: 0.8,
            duration: 600,
            ease: 'Back.easeOut',
            delay: 1200
        });

        this.tweens.add({
            targets: tapToPlay,
            scaleX: 0.85,
            scaleY: 0.85,
            alpha: 0.8,
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            delay: 1800
        });
    }

    /**
     * Create main menu buttons with professional AAA polish using REAL zombie buster sprites
     */
    createMainButtons() {
        const centerX = GAME.WIDTH / 2;
        const startY = 400;
        const buttonSpacing = 100;

        // Button configuration: [label, atlasKey, frameName, callback, delay]
        const buttons = [
            ['START GAME', 'zombie_buttons_small', 'Button_Start_0000', () => this.startGame(), 0],
            ['SETTINGS', 'zombie_button_sound', 'Button_Sound_0000', () => this.showSettings(), 100],
            ['HOW TO PLAY', 'zombie_buttons_small', 'Button_Levels_0000', () => this.showHowToPlay(), 200],
            ['CREDITS', 'zombie_buttons_small', 'Button_Menu_0000', () => this.showCredits(), 300]
        ];

        buttons.forEach(([label, atlasKey, frameName, callback, delay], index) => {
            const yPos = startY + (buttonSpacing * index);

            // Create button sprite from the loaded atlas
            const button = this.add.sprite(centerX, yPos, atlasKey, frameName);
            button.setScale(0.8);
            button.setInteractive({ useHandCursor: true });
            button.setDepth(100);

            // Add text label on top of button
            const buttonText = this.add.text(centerX, yPos, label, {
                fontSize: '24px',
                fontFamily: 'Arial Black',
                color: '#FFFFFF',
                stroke: '#000000',
                strokeThickness: 5,
                shadow: {
                    offsetX: 2,
                    offsetY: 2,
                    color: '#000000',
                    blur: 4,
                    fill: true
                }
            });
            buttonText.setOrigin(0.5);
            buttonText.setDepth(101); // Above button

            // Entrance animation - slide in from sides
            const slideFrom = index % 2 === 0 ? -100 : GAME.WIDTH + 100;
            button.setX(slideFrom);
            buttonText.setX(slideFrom);

            this.tweens.add({
                targets: [button, buttonText],
                x: centerX,
                duration: 800,
                ease: 'Back.easeOut',
                delay: 1400 + delay
            });

            // Button hover/click effects
            const baseScale = 0.8;
            const hoverScale = baseScale * 1.08;
            const clickScale = baseScale * 0.95;

            button.on('pointerover', () => {
                this.tweens.add({
                    targets: [button, buttonText],
                    scaleX: hoverScale,
                    scaleY: hoverScale,
                    duration: 150,
                    ease: 'Back.easeOut'
                });
                button.setTint(0xFFFFFF);
            });

            button.on('pointerout', () => {
                this.tweens.add({
                    targets: [button, buttonText],
                    scaleX: baseScale,
                    scaleY: baseScale,
                    duration: 150
                });
                button.clearTint();
            });

            button.on('pointerdown', () => {
                this.tweens.add({
                    targets: [button, buttonText],
                    scaleX: clickScale,
                    scaleY: clickScale,
                    duration: 100,
                    yoyo: true,
                    ease: 'Quad.easeInOut'
                });

                this.cameras.main.flash(100, 255, 255, 255);
                this.time.delayedCall(100, callback);
            });
        });
    }

    /**
     * Create an image button with hover/click effects (NEW - for PNG assets)
     */
    createImageButton(x, y, imageKey, callback) {
        // Create image button
        const button = this.add.image(x, y, imageKey);
        button.setInteractive({ useHandCursor: true });
        // FIXED: Scale buttons using UI_SCALE constant (788x370 -> 394x185)
        button.setScale(UI_SCALE.BUTTON);

        // Hover effect - scale up slightly and brighten
        const hoverScale = UI_SCALE.BUTTON * 1.08;
        button.on('pointerover', () => {
            this.tweens.add({
                targets: button,
                scaleX: hoverScale,
                scaleY: hoverScale,
                duration: 150,
                ease: 'Back.easeOut'
            });
            // Brighten effect
            button.setTint(0xFFFFFF);
        });

        button.on('pointerout', () => {
            this.tweens.add({
                targets: button,
                scaleX: UI_SCALE.BUTTON,
                scaleY: UI_SCALE.BUTTON,
                duration: 150
            });
            // Remove tint
            button.clearTint();
        });

        // Click effect
        button.on('pointerdown', () => {
            // Quick scale down (press effect)
            const clickScale = UI_SCALE.BUTTON * 0.95;
            this.tweens.add({
                targets: button,
                scaleX: clickScale,
                scaleY: clickScale,
                duration: 100,
                yoyo: true,
                ease: 'Quad.easeInOut'
            });

            this.cameras.main.flash(100, 255, 255, 255);
            this.time.delayedCall(100, callback);
        });

        return button;
    }

    /**
     * Create a button with hover/click effects (OLD - for rectangle buttons in panels)
     */
    createButton(x, y, text, color, height, width, callback, fontSize = '32px') {
        // Button background
        const button = this.add.rectangle(x, y, width, height, color, 1.0);
        button.setStrokeStyle(4, 0xFFFFFF, 1.0);
        button.setInteractive({ useHandCursor: true });

        // Button text
        const buttonText = this.add.text(x, y, text, {
            fontSize: fontSize,
            fontFamily: 'Arial Black',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 4
        });
        buttonText.setOrigin(0.5);

        // Hover effect
        button.on('pointerover', () => {
            this.tweens.add({
                targets: [button, buttonText],
                scaleX: 1.08,
                scaleY: 1.08,
                duration: 150,
                ease: 'Back.easeOut'
            });
        });

        button.on('pointerout', () => {
            this.tweens.add({
                targets: [button, buttonText],
                scaleX: 1,
                scaleY: 1,
                duration: 150
            });
        });

        // Click effect
        button.on('pointerdown', () => {
            this.cameras.main.flash(100, 255, 255, 255);
            this.time.delayedCall(100, callback);
        });

        return { button, buttonText };
    }

    /**
     * Start game
     */
    startGame() {
        console.log('🎮 Starting game...');
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.time.delayedCall(500, () => {
            this.scene.start(SCENES.CHARACTER_SELECTION);
        });
    }

    /**
     * Show How to Play panel
     */
    showHowToPlay() {
        if (this.currentPanel) return;

        console.log('📖 Showing How to Play');
        this.currentPanel = 'howtoplay';

        const centerX = GAME.WIDTH / 2;
        const centerY = GAME.HEIGHT / 2;

        // Dark overlay
        const overlay = this.add.rectangle(centerX, centerY, GAME.WIDTH, GAME.HEIGHT, 0x000000, 0.8);
        overlay.setInteractive();
        overlay.setDepth(100);

        // Panel background
        const panelWidth = 480;
        const panelHeight = 720;
        const panel = this.add.rectangle(centerX, centerY, panelWidth, panelHeight, 0x1E1E1E, 1.0);
        panel.setStrokeStyle(6, 0xFFFFFF, 1.0);
        panel.setDepth(101);

        // Title
        const title = this.add.text(centerX, centerY - 320, 'HOW TO PLAY', {
            fontSize: '40px',
            fontFamily: 'Arial Black',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 4
        });
        title.setOrigin(0.5);
        title.setDepth(102);

        // Instructions content
        const instructions = [
            { icon: '👆', text: 'Drag to move your squad left/right' },
            { icon: '🎯', text: 'Auto-shoot enemies as you move' },
            { icon: '💚', text: 'Collect green spheres to grow squad (+1)' },
            { icon: '🚪', text: 'Choose math gates wisely (×2, +10, etc.)' },
            { icon: '⚡', text: 'Use abilities: Fireball, Shield, Lightning' },
            { icon: '👹', text: 'Defeat enemies to earn score' },
            { icon: '👑', text: 'Face epic boss at the end!' },
            { icon: '⭐', text: 'Reach 5000m or defeat boss to win!' }
        ];

        let yPos = centerY - 250;
        instructions.forEach(item => {
            const iconText = this.add.text(centerX - 200, yPos, item.icon, {
                fontSize: '32px'
            });
            iconText.setOrigin(0, 0.5);
            iconText.setDepth(102);

            const instructionText = this.add.text(centerX - 150, yPos, item.text, {
                fontSize: '18px',
                fontFamily: 'Arial',
                color: '#FFFFFF',
                wordWrap: { width: 320 }
            });
            instructionText.setOrigin(0, 0.5);
            instructionText.setDepth(102);

            yPos += 75;
        });

        // Close button
        const closeButton = this.createButton(
            centerX, centerY + 300,
            'CLOSE',
            0x666666,
            50,
            200,
            () => this.closePanel([overlay, panel, title, ...this.children.list.filter(c => c.depth >= 102)]),
            '28px'
        );
        closeButton.button.setDepth(102);
        closeButton.buttonText.setDepth(103);

        // Scale in animation
        panel.setScale(0);
        this.tweens.add({
            targets: panel,
            scaleX: 1,
            scaleY: 1,
            duration: 300,
            ease: 'Back.easeOut'
        });
    }

    /**
     * Show Settings panel
     */
    showSettings() {
        if (this.currentPanel) return;

        console.log('⚙️ Showing Settings');
        this.currentPanel = 'settings';

        const centerX = GAME.WIDTH / 2;
        const centerY = GAME.HEIGHT / 2;

        // Dark overlay
        const overlay = this.add.rectangle(centerX, centerY, GAME.WIDTH, GAME.HEIGHT, 0x000000, 0.8);
        overlay.setInteractive();
        overlay.setDepth(100);

        // Panel background
        const panelWidth = 400;
        const panelHeight = 400;
        const panel = this.add.rectangle(centerX, centerY, panelWidth, panelHeight, 0x1E1E1E, 1.0);
        panel.setStrokeStyle(6, 0xFFFFFF, 1.0);
        panel.setDepth(101);

        // Title
        const title = this.add.text(centerX, centerY - 160, 'SETTINGS', {
            fontSize: '40px',
            fontFamily: 'Arial Black',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 4
        });
        title.setOrigin(0.5);
        title.setDepth(102);

        // Audio toggle
        const audioLabel = this.add.text(centerX - 150, centerY - 80, 'Audio:', {
            fontSize: '24px',
            fontFamily: 'Arial Black',
            color: '#FFFFFF'
        });
        audioLabel.setOrigin(0, 0.5);
        audioLabel.setDepth(102);

        const audioToggle = this.createToggleButton(
            centerX + 100, centerY - 80,
            window.gameSettings.audioEnabled,
            (enabled) => {
                window.gameSettings.audioEnabled = enabled;
                console.log(`🔊 Audio: ${enabled ? 'ON' : 'OFF'}`);
            }
        );

        // Music volume
        const musicLabel = this.add.text(centerX - 150, centerY, 'Music Volume:', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#FFFFFF'
        });
        musicLabel.setOrigin(0, 0.5);
        musicLabel.setDepth(102);

        const musicValue = this.add.text(centerX + 130, centerY, `${Math.round(window.gameSettings.musicVolume * 100)}%`, {
            fontSize: '20px',
            fontFamily: 'Arial Black',
            color: '#00D4FF'
        });
        musicValue.setOrigin(0.5);
        musicValue.setDepth(102);

        // SFX volume
        const sfxLabel = this.add.text(centerX - 150, centerY + 60, 'SFX Volume:', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#FFFFFF'
        });
        sfxLabel.setOrigin(0, 0.5);
        sfxLabel.setDepth(102);

        const sfxValue = this.add.text(centerX + 130, centerY + 60, `${Math.round(window.gameSettings.sfxVolume * 100)}%`, {
            fontSize: '20px',
            fontFamily: 'Arial Black',
            color: '#00D4FF'
        });
        sfxValue.setOrigin(0.5);
        sfxValue.setDepth(102);

        // Note: Volume sliders would require more complex UI elements
        // For now, showing current values

        // Close button
        const closeButton = this.createButton(
            centerX, centerY + 140,
            'CLOSE',
            0x666666,
            50,
            200,
            () => this.closePanel([overlay, panel, title, audioLabel, musicLabel, musicValue, sfxLabel, sfxValue, ...audioToggle, closeButton.button, closeButton.buttonText]),
            '28px'
        );
        closeButton.button.setDepth(102);
        closeButton.buttonText.setDepth(103);

        // Scale in animation
        panel.setScale(0);
        this.tweens.add({
            targets: panel,
            scaleX: 1,
            scaleY: 1,
            duration: 300,
            ease: 'Back.easeOut'
        });
    }

    /**
     * Create toggle button (ON/OFF)
     */
    createToggleButton(x, y, initialState, onToggle) {
        const elements = [];

        // Background
        const bg = this.add.rectangle(x, y, 80, 40, 0x666666, 1.0);
        bg.setStrokeStyle(3, 0xFFFFFF, 1.0);
        bg.setInteractive({ useHandCursor: true });
        bg.setDepth(102);
        elements.push(bg);

        // Toggle circle
        const toggle = this.add.circle(
            initialState ? x + 20 : x - 20,
            y,
            15,
            initialState ? 0x4CAF50 : 0xFF5252,
            1.0
        );
        toggle.setDepth(103);
        elements.push(toggle);

        // Text
        const text = this.add.text(x, y, initialState ? 'ON' : 'OFF', {
            fontSize: '16px',
            fontFamily: 'Arial Black',
            color: '#FFFFFF'
        });
        text.setOrigin(0.5);
        text.setDepth(104);
        elements.push(text);

        let currentState = initialState;

        bg.on('pointerdown', () => {
            currentState = !currentState;

            // Animate toggle
            this.tweens.add({
                targets: toggle,
                x: currentState ? x + 20 : x - 20,
                duration: 200,
                ease: 'Back.easeOut'
            });

            // Update color
            toggle.setFillStyle(currentState ? 0x4CAF50 : 0xFF5252);
            text.setText(currentState ? 'ON' : 'OFF');

            // Callback
            if (onToggle) onToggle(currentState);
        });

        return elements;
    }

    /**
     * Show Credits screen
     */
    showCredits() {
        if (this.currentPanel) return;

        console.log('🎬 Showing Credits');
        this.currentPanel = 'credits';

        const centerX = GAME.WIDTH / 2;
        const centerY = GAME.HEIGHT / 2;

        // Dark overlay
        const overlay = this.add.rectangle(centerX, centerY, GAME.WIDTH, GAME.HEIGHT, 0x000000, 0.8);
        overlay.setInteractive();
        overlay.setDepth(100);

        // Panel background
        const panelWidth = 400;
        const panelHeight = 500;
        const panel = this.add.rectangle(centerX, centerY, panelWidth, panelHeight, 0x1E1E1E, 1.0);
        panel.setStrokeStyle(6, 0xFFFFFF, 1.0);
        panel.setDepth(101);

        // Title
        const title = this.add.text(centerX, centerY - 210, 'CREDITS', {
            fontSize: '40px',
            fontFamily: 'Arial Black',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 4
        });
        title.setOrigin(0.5);
        title.setDepth(102);

        // Credits content
        const credits = [
            { role: 'GAME DESIGN', name: 'Bridge Battle Team' },
            { role: 'PROGRAMMING', name: 'Phaser 3 Engine' },
            { role: 'GAME SYSTEMS', name: 'Combat, Abilities, Bosses' },
            { role: 'CHARACTER SYSTEM', name: '6 Unique Characters' },
            { role: 'AUDIO', name: 'Procedural Sound Effects' },
            { role: 'SPECIAL THANKS', name: 'You for playing!' }
        ];

        let yPos = centerY - 140;
        credits.forEach(credit => {
            const roleText = this.add.text(centerX, yPos, credit.role, {
                fontSize: '16px',
                fontFamily: 'Arial Black',
                color: '#FFD700'
            });
            roleText.setOrigin(0.5);
            roleText.setDepth(102);

            const nameText = this.add.text(centerX, yPos + 25, credit.name, {
                fontSize: '18px',
                fontFamily: 'Arial',
                color: '#FFFFFF'
            });
            nameText.setOrigin(0.5);
            nameText.setDepth(102);

            yPos += 70;
        });

        // Version
        const version = this.add.text(centerX, centerY + 180, 'Version 1.0 - Complete Edition', {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#888888'
        });
        version.setOrigin(0.5);
        version.setDepth(102);

        // Close button
        const closeButton = this.createButton(
            centerX, centerY + 220,
            'CLOSE',
            0x666666,
            50,
            200,
            () => this.closePanel([overlay, panel, title, version, ...this.children.list.filter(c => c.depth >= 102)]),
            '28px'
        );
        closeButton.button.setDepth(102);
        closeButton.buttonText.setDepth(103);

        // Scale in animation
        panel.setScale(0);
        this.tweens.add({
            targets: panel,
            scaleX: 1,
            scaleY: 1,
            duration: 300,
            ease: 'Back.easeOut'
        });
    }

    /**
     * Close panel
     */
    closePanel(elements) {
        console.log('❌ Closing panel');
        this.currentPanel = null;

        // Fade out and destroy all elements
        elements.forEach(element => {
            if (element && element.destroy) {
                this.tweens.add({
                    targets: element,
                    alpha: 0,
                    duration: 200,
                    onComplete: () => {
                        if (element && !element.scene) return; // Already destroyed
                        element.destroy();
                    }
                });
            }
        });
    }

    /**
     * Create grass decorations
     */
    createGrassDecorations() {
        // Left grass decoration
        const grassLeft = this.add.image(80, GAME.HEIGHT - 25, 'ui_grass_left');
        // FIXED: Scale using UI_SCALE.DECORATION constant
        grassLeft.setScale(UI_SCALE.DECORATION);
        grassLeft.setAlpha(0.9);

        // Right grass decoration
        const grassRight = this.add.image(GAME.WIDTH - 80, GAME.HEIGHT - 25, 'ui_grass_right');
        // FIXED: Scale using UI_SCALE.DECORATION constant
        grassRight.setScale(UI_SCALE.DECORATION);
        grassRight.setAlpha(0.9);

        // Subtle swaying animation for left grass
        this.tweens.add({
            targets: grassLeft,
            angle: -3,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Subtle swaying animation for right grass (opposite phase)
        this.tweens.add({
            targets: grassRight,
            angle: 3,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            delay: 1000  // Offset animation
        });
    }

    /**
     * Create version info with professional styling
     */
    createVersionInfo() {
        const centerX = GAME.WIDTH / 2;

        // Version text with fade-in
        const versionText = this.add.text(
            centerX,
            GAME.HEIGHT - 35,
            'v2.0 Modern Edition • AAA Quality UI',
            {
                fontSize: '16px',
                fontFamily: 'Arial',
                color: '#00D4FF',
                stroke: '#000000',
                strokeThickness: 2,
                alpha: 0
            }
        );
        versionText.setOrigin(0.5);
        versionText.setDepth(20);

        this.tweens.add({
            targets: versionText,
            alpha: 0.7,
            duration: 1500,
            delay: 2000,
            ease: 'Sine.easeIn'
        });

        // Add small decorative stars
        if (this.atlasHelper) {
            const star1 = this.atlasHelper.createSprite(centerX - 240, GAME.HEIGHT - 35, 'star_brown_small');
            star1.setScale(0.5);
            star1.setAlpha(0);
            star1.setDepth(20);

            const star2 = this.atlasHelper.createSprite(centerX + 240, GAME.HEIGHT - 35, 'star_brown_small');
            star2.setScale(0.5);
            star2.setAlpha(0);
            star2.setDepth(20);

            this.tweens.add({
                targets: [star1, star2],
                alpha: 0.6,
                duration: 1000,
                delay: 2200,
                ease: 'Sine.easeIn'
            });
        }
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        // Space = Start game
        this.input.keyboard.on('keydown-SPACE', () => {
            if (!this.currentPanel) {
                this.startGame();
            }
        });

        // ESC = Close panel
        this.input.keyboard.on('keydown-ESC', () => {
            if (this.currentPanel) {
                const allPanelElements = this.children.list.filter(c => c.depth >= 100);
                this.closePanel(allPanelElements);
            }
        });
    }

    /**
     * Cleanup
     */
    shutdown() {
        console.log('🛑 MenuScene shutdown');
        this.input.keyboard.off('keydown-SPACE');
        this.input.keyboard.off('keydown-ESC');
    }
}
