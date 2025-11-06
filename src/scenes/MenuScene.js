import Phaser from 'phaser';
import { GAME, COLORS, SCENES } from '../utils/GameConstants.js';

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

        // Animated background
        this.createAnimatedBackground();

        // Logo/Title section
        this.createTitle();

        // Main menu buttons
        this.createMainButtons();

        // Version info
        this.createVersionInfo();

        // Grass decorations (bottom corners)
        this.createGrassDecorations();

        // Keyboard shortcuts
        this.setupKeyboardShortcuts();

        console.log('🎮 Enhanced Menu Scene Ready');
    }

    /**
     * Create animated background
     */
    createAnimatedBackground() {
        const centerX = GAME.WIDTH / 2;
        const centerY = GAME.HEIGHT / 2;

        // Base gradient background
        const bg = this.add.rectangle(centerX, centerY, GAME.WIDTH, GAME.HEIGHT, COLORS.SKY_BLUE);

        // Animated clouds/shapes in background
        for (let i = 0; i < 5; i++) {
            const x = Phaser.Math.Between(0, GAME.WIDTH);
            const y = Phaser.Math.Between(0, GAME.HEIGHT);
            const size = Phaser.Math.Between(60, 120);

            const cloud = this.add.circle(x, y, size, 0xFFFFFF, 0.1);

            this.tweens.add({
                targets: cloud,
                x: x + 50,
                y: y + Phaser.Math.Between(-20, 20),
                alpha: 0.15,
                duration: Phaser.Math.Between(3000, 5000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    /**
     * Create title section
     */
    createTitle() {
        const centerX = GAME.WIDTH / 2;

        // Main title
        const title = this.add.text(centerX, 140, 'BRIDGE\nBATTLE', {
            fontSize: '84px',
            fontFamily: 'Arial Black',
            color: '#FFFFFF',
            stroke: '#1976D2',
            strokeThickness: 12,
            align: 'center',
            shadow: {
                offsetX: 4,
                offsetY: 4,
                color: '#000000',
                blur: 8,
                fill: true
            }
        });
        title.setOrigin(0.5);

        // Floating animation
        this.tweens.add({
            targets: title,
            y: 130,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Subtitle with game features
        const subtitle = this.add.text(centerX, 260, 'Squad Combat • Boss Battles • Epic Abilities', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 3
        });
        subtitle.setOrigin(0.5);

        // Pulse animation
        this.tweens.add({
            targets: subtitle,
            alpha: 0.7,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    /**
     * Create main menu buttons
     */
    createMainButtons() {
        const centerX = GAME.WIDTH / 2;
        const startY = 340;
        const buttonSpacing = 90;

        // New Game button (using PNG asset)
        this.createImageButton(
            centerX, startY,
            'ui_button_new_game',
            () => this.startGame()
        );

        // Settings button
        this.createImageButton(
            centerX, startY + buttonSpacing,
            'ui_button_settings',
            () => this.showSettings()
        );

        // Shop button (new feature - shows "How to Play" for now)
        this.createImageButton(
            centerX, startY + buttonSpacing * 2,
            'ui_button_shop',
            () => this.showHowToPlay()
        );

        // Exit button (shows credits)
        this.createImageButton(
            centerX, startY + buttonSpacing * 3,
            'ui_button_exit',
            () => this.showCredits()
        );
    }

    /**
     * Create an image button with hover/click effects (NEW - for PNG assets)
     */
    createImageButton(x, y, imageKey, callback) {
        // Create image button
        const button = this.add.image(x, y, imageKey);
        button.setInteractive({ useHandCursor: true });
        button.setScale(1.0);

        // Hover effect - scale up slightly and brighten
        button.on('pointerover', () => {
            this.tweens.add({
                targets: button,
                scaleX: 1.08,
                scaleY: 1.08,
                duration: 150,
                ease: 'Back.easeOut'
            });
            // Brighten effect
            button.setTint(0xFFFFFF);
        });

        button.on('pointerout', () => {
            this.tweens.add({
                targets: button,
                scaleX: 1.0,
                scaleY: 1.0,
                duration: 150
            });
            // Remove tint
            button.clearTint();
        });

        // Click effect
        button.on('pointerdown', () => {
            // Quick scale down (press effect)
            this.tweens.add({
                targets: button,
                scaleX: 0.95,
                scaleY: 0.95,
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
        grassLeft.setScale(1.2);
        grassLeft.setAlpha(0.9);

        // Right grass decoration
        const grassRight = this.add.image(GAME.WIDTH - 80, GAME.HEIGHT - 25, 'ui_grass_right');
        grassRight.setScale(1.2);
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
     * Create version info
     */
    createVersionInfo() {
        const centerX = GAME.WIDTH / 2;

        this.add.text(centerX, GAME.HEIGHT - 30, 'v1.0 Complete • All Systems Operational', {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            alpha: 0.6
        }).setOrigin(0.5);
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
