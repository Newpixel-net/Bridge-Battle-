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

        // ========================================================================
        // 🎨 MODERN UI ATLAS SYSTEM - AAA Mobile Game Quality
        // ========================================================================
        // Loading ONLY professional sprite atlases from Zombie Buster
        // NO old PNG assets - complete modern redesign

        const atlasPath = 'assets/ui-atlas/';
        const zombiePath = atlasPath + 'zombie/';

        // Load professional sprite sheets
        this.load.image('main', atlasPath + 'zombie-ui-main.png');
        this.load.image('buttons', atlasPath + 'zombie-ui-buttons.png');
        this.load.image('panels', atlasPath + 'zombie-ui-panels.png');

        // Load comprehensive modern atlas JSON
        this.load.json('ui_atlas_complete', atlasPath + 'modern-ui-atlas.json');

        // ========================================================================
        // 🎯 REAL ZOMBIE BUSTER BUTTON SPRITES
        // ========================================================================
        // Load the actual button sprite sheets with real coordinates
        this.load.atlas('zombie_buttons_small', zombiePath + 'shared-0-sheet4.png', zombiePath + 'shared-0-sheet4.json');
        this.load.atlas('zombie_buttons_social', zombiePath + 'shared-2-sheet6.png', zombiePath + 'shared-2-sheet6.json');
        this.load.atlas('zombie_button_play', zombiePath + 'shared-2-sheet5.png', zombiePath + 'shared-2-sheet5.json');
        this.load.atlas('zombie_button_sound', zombiePath + 'shared-0-sheet3.png', zombiePath + 'shared-0-sheet3.json');

        // ========================================================================
        // 🧟 ZOMBIE CHARACTER SPRITES - Real character graphics!
        // ========================================================================
        // Load zombie character parts (heads, bodies, limbs) for player squad and enemies
        // NOTE: zombie_heads (shared-0-sheet5.png) is currently missing - using fallback graphics
        // this.load.atlas('zombie_heads', zombiePath + 'shared-0-sheet5.png', zombiePath + 'shared-0-sheet5.json');
        this.load.atlas('zombie_parts', zombiePath + 'shared-0-sheet6.png', zombiePath + 'shared-0-sheet6.json');

        // ========================================================================
        // 🎮 NEW HIGH-QUALITY GAME SPRITES from raw-assets
        // ========================================================================
        const spritePath = 'assets/sprites/';

        // ENEMIES - Viking goblins and flying enemies (Phase 1 & 2)
        this.load.image('goblin_warrior', spritePath + 'enemies/goblinwarrior-sheet0.png');
        this.load.image('goblin_archer', spritePath + 'enemies/goblinarcher-sheet0.png');
        this.load.image('goblin_bomber', spritePath + 'enemies/goblinbomber-sheet0.png');
        this.load.image('goblin_cyclops', spritePath + 'enemies/goblincyclops-sheet0.png');
        this.load.image('fly_enemy_01', spritePath + 'enemies/flyenemy_01-sheet0.png');
        this.load.image('fly_enemy_02', spritePath + 'enemies/flyenemy_02-sheet0.png');
        this.load.image('fly_enemy_05', spritePath + 'enemies/flyenemy_05-sheet0.png');

        // PLAYER - Viking hero character
        this.load.image('viking_player', spritePath + 'player/player-sheet0.png');

        // EFFECTS - Explosions, fire, blood
        this.load.image('explosion_electro', spritePath + 'effects/explosion_electro-sheet0.png');
        this.load.image('explosion_bomb', spritePath + 'effects/explosion_bomb-sheet0.png');
        this.load.image('explosion_ground', spritePath + 'effects/explosion_ground-sheet0.png');
        this.load.image('fire_effect', spritePath + 'effects/fire-sheet0.png');
        this.load.image('flame_effect', spritePath + 'effects/flame-sheet0.png');
        this.load.image('blood_splatter', spritePath + 'effects/blood-sheet1.png');
        this.load.image('dust_effect', spritePath + 'effects/dust-sheet0.png');
        this.load.image('magic_effect', spritePath + 'effects/magic-sheet0.png');

        // COLLECTIBLES - Coins and bonus boxes
        this.load.image('coin_sprite', spritePath + 'collectibles/coin-sheet0.png');
        this.load.image('bonus_box', spritePath + 'collectibles/bonusbox-sheet0.png');

        console.log('🎨 Loading MODERN UI ATLAS - Professional AAA Quality');
        console.log('🎯 Loading REAL ZOMBIE BUSTER BUTTON SPRITES');
        console.log('🧟 Loading ZOMBIE CHARACTER SPRITES');
        console.log('✨ Loading HIGH-QUALITY GAME SPRITES - Vikings, Goblins, Effects!');
    }

    create() {
        console.log('✓ Assets loaded');
        console.log('🔍 Checking loaded textures...');
        console.log('  - main texture exists:', this.textures.exists('main'));
        console.log('  - buttons texture exists:', this.textures.exists('buttons'));
        console.log('  - panels texture exists:', this.textures.exists('panels'));
        console.log('  - ui_atlas_complete JSON exists:', this.cache.json.exists('ui_atlas_complete'));

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
            console.log('🎮 Starting MenuScene...');
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
