import Phaser from 'phaser';
import { SCENES, COLORS } from '../utils/GameConstants.js';
import { AtlasHelper } from '../utils/AtlasHelper.js';

/**
 * PreloadScene - Asset loading
 * Shows loading screen with progress bar
 * Creates placeholder assets for Phase 1
 */
export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.PRELOAD });
    }

    preload() {
        console.log('📦 PreloadScene: Loading assets...');

        // Create loading UI
        this.createLoadingUI();

        // Set up loading events
        this.load.on('progress', this.onProgress, this);
        this.load.on('complete', this.onComplete, this);

        // Load NEW high-quality UI assets from processed-assets/ui-elements
        // These are ultra-high-res extractions from the EPS file
        const uiPath = 'processed-assets/ui-elements/';

        // Menu buttons (NEW high-res from EPS)
        this.load.image('ui_button_new_game', uiPath + 'button_new_game.png');
        this.load.image('ui_button_resume', uiPath + 'button_resume.png');
        this.load.image('ui_button_settings', uiPath + 'button_settings.png');
        this.load.image('ui_button_shop', uiPath + 'button_shop.png');
        this.load.image('ui_button_exit', uiPath + 'button_exit.png');

        // Decorations (NEW high-res)
        this.load.image('ui_grass_left', uiPath + 'decoration_grass_left.png');
        this.load.image('ui_grass_right', uiPath + 'decoration_grass_right.png');

        // Stars (NEW high-res from EPS)
        for (let i = 1; i <= 3; i++) {
            this.load.image(`ui_star_filled_${i}`, uiPath + `star_filled_0${i}.png`);
        }
        for (let i = 1; i <= 6; i++) {
            this.load.image(`ui_star_empty_${i}`, uiPath + `star_empty_0${i}.png`);
        }

        // Complete panels (NEW high-res)
        this.load.image('ui_panel_win', uiPath + 'panel_victory.png');
        this.load.image('ui_panel_lose', uiPath + 'panel_defeat.png');

        // Resource icons (NEW high-res)
        this.load.image('ui_icon_coin', uiPath + 'icon_coin.png');
        this.load.image('ui_icon_gem', uiPath + 'icon_gem.png');
        this.load.image('ui_icon_heart', uiPath + 'icon_heart.png');

        // Level badges (NEW high-res)
        this.load.image('ui_badge_24', uiPath + 'badge_level_24.png');
        this.load.image('ui_badge_25', uiPath + 'badge_level_25.png');
        this.load.image('ui_badge_26', uiPath + 'badge_level_26.png');

        console.log('📦 Loading NEW ultra-high-res UI assets from:', uiPath);

        // ✨ NEW: Load professional sprite atlases from ready-made games
        // These are battle-tested UI elements from published games
        const atlasPath = 'assets/ui-atlas/';

        // Load sprite sheets as full textures (we'll extract frames programmatically)
        this.load.image('zombie', atlasPath + 'ui-zombie.png');
        this.load.image('zombie2', atlasPath + 'ui-zombie2.png');
        this.load.image('viking', atlasPath + 'ui-viking.png');

        // Load comprehensive atlas JSON with all UI elements categorized
        this.load.json('ui_atlas_complete', atlasPath + 'ui-complete-atlas.json');

        console.log('🎮 Loading professional UI sprite atlases from published games');
    }

    create() {
        console.log('✓ Assets loaded');

        // Initialize AtlasHelper with comprehensive atlas data
        const atlasHelper = AtlasHelper.initialize(this);

        if (atlasHelper) {
            // Make AtlasHelper globally available to all scenes
            this.registry.set('atlasHelper', atlasHelper);
            console.log('✓ AtlasHelper initialized and registered globally');
        } else {
            console.warn('⚠️  AtlasHelper initialization failed - scenes will use fallback assets');
        }

        // Create placeholder textures for squad members
        this.createPlaceholderTextures();

        // Small delay before starting menu
        this.time.delayedCall(500, () => {
            this.scene.start(SCENES.MENU);
        });
    }

    /**
     * Create loading screen UI
     */
    createLoadingUI() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background
        const bg = this.add.rectangle(
            width / 2,
            height / 2,
            width,
            height,
            0x1a1a2e
        );

        // Title
        const title = this.add.text(
            width / 2,
            height / 3,
            '🌉 BRIDGE BATTLE',
            {
                fontSize: '96px',
                fontFamily: 'Arial',
                color: '#FFD700',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 8
            }
        );
        title.setOrigin(0.5);

        // Subtitle
        const subtitle = this.add.text(
            width / 2,
            height / 3 + 100,
            'Crowd Runner × Auto-Shooter',
            {
                fontSize: '32px',
                fontFamily: 'Arial',
                color: '#AAAAAA',
                fontStyle: 'italic'
            }
        );
        subtitle.setOrigin(0.5);

        // Loading bar background
        const barWidth = 600;
        const barHeight = 40;
        const barY = height / 2 + 150;

        this.loadingBarBg = this.add.rectangle(
            width / 2,
            barY,
            barWidth,
            barHeight,
            0x444444
        );

        // Loading bar fill
        this.loadingBar = this.add.rectangle(
            width / 2 - barWidth / 2,
            barY,
            0,
            barHeight,
            0xFFD700
        );
        this.loadingBar.setOrigin(0, 0.5);

        // Loading text
        this.loadingText = this.add.text(
            width / 2,
            barY + 60,
            'Loading... 0%',
            {
                fontSize: '32px',
                fontFamily: 'Arial',
                color: '#FFFFFF'
            }
        );
        this.loadingText.setOrigin(0.5);

        // Phase indicator
        const phaseText = this.add.text(
            width / 2,
            height - 100,
            'Phase 2: Enhanced Gameplay',
            {
                fontSize: '28px',
                fontFamily: 'Arial',
                color: '#00BCD4',
                fontStyle: 'bold'
            }
        );
        phaseText.setOrigin(0.5);
    }

    /**
     * Update loading progress
     */
    onProgress(progress) {
        const barWidth = 600;
        this.loadingBar.width = barWidth * progress;
        this.loadingText.setText(`Loading... ${Math.round(progress * 100)}%`);
    }

    /**
     * Loading complete
     */
    onComplete() {
        this.loadingText.setText('Loading Complete!');
    }

    /**
     * Create placeholder textures
     * Phase 1: Simple shapes for squad members
     */
    createPlaceholderTextures() {
        const graphics = this.add.graphics();

        // Squad member placeholder (blue circle)
        graphics.fillStyle(COLORS.SQUAD_BLUE);
        graphics.fillCircle(32, 32, 30);

        // Add simple "eye" details
        graphics.fillStyle(0xFFFFFF);
        graphics.fillCircle(24, 28, 4);
        graphics.fillCircle(40, 28, 4);

        graphics.generateTexture('squad-member', 64, 64);
        graphics.clear();

        graphics.destroy();

        console.log('✓ Placeholder textures created');
    }
}
