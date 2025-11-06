/**
 * Bridge Battle - Game Constants
 * RESPONSIVE DESIGN - Desktop landscape (1280x720) scales to mobile portrait
 *
 * Reference: screenshots-for-claude/the-required-results/Level1.png
 */

// ============================================================================
// RESPONSIVE GAME CONFIGURATION
// ============================================================================

// Desktop-first design: 1280x720 (16:9) scales properly to mobile
// Phaser's FIT mode will adapt this to any screen size
export const GAME = {
    WIDTH: 1280,                 // Wide desktop width
    HEIGHT: 720,                 // Standard height (16:9)
    TARGET_FPS: 60,
    PHYSICS: 'arcade'
};

// ============================================================================
// WORLD & ROAD SPECIFICATIONS - RESPONSIVE
// ============================================================================
export const WORLD = {
    // Road dimensions (fills ~75% of viewport width) - calculated dynamically
    get ROAD_WIDTH() {
        return Math.floor(GAME.WIDTH * 0.75); // 75% of screen width
    },
    get ROAD_WIDTH_RATIO() {
        return 0.75; // Road takes 75% of screen width
    },
    ROAD_LENGTH: 10000,          // Total level length

    // Movement
    SCROLL_SPEED: 200,           // Auto-scroll speed (pixels/sec)
};

// ============================================================================
// PLAYER SQUAD SYSTEM - RESPONSIVE
// ============================================================================
export const SQUAD = {
    // Starting configuration
    START_SIZE: 1,               // Start with 1 character
    MAX_SIZE: 200,               // Maximum squad size

    // Formation - ULTRA-TIGHT hexagonal formation
    FORMATION_SPACING: 52,       // Space between character centers (tight!)
    FORMATION_LERP: 0.15,        // Smoothing factor for movement

    // Movement - responsive
    MOVE_SPEED: 300,             // Horizontal movement speed (pixels/sec)
    get HORIZONTAL_LIMIT() {
        return Math.floor(WORLD.ROAD_WIDTH * 0.35); // 35% of road width from center
    },

    // Character visuals - Matching reference screenshots
    CHARACTER_RADIUS: 25,        // Radius of each character sphere
    CHARACTER_SIZE: 50,          // Diameter for collision

    // Character position - responsive (lower third)
    get START_Y() {
        return Math.floor(GAME.HEIGHT * 0.75); // 75% down screen
    },
};

// ============================================================================
// CAMERA - Fixed orthographic view (no zoom needed)
// ============================================================================
export const CAMERA = {
    FIXED_Y: 0,                  // Camera doesn't move yet (Phase 1)
    ZOOM: 1.0,                   // No zoom - 1:1 pixel ratio
};

// ============================================================================
// GAMEPLAY MECHANICS
// ============================================================================
export const COLLECTIBLES = {
    SPAWN_INTERVAL: 600,         // Distance between collectible spawns
    SIZE: 20,                    // Radius of collectible
    VALUE: 1,                    // How many squad members to add
};

export const OBSTACLES = {
    SPAWN_INTERVAL: 800,         // Distance between obstacle spawns
    WIDTH: 80,                   // Width of obstacle
    HEIGHT: 40,                  // Height of obstacle
    DAMAGE: 5,                   // How many squad members to remove
};

export const GATES = {
    SPAWN_INTERVAL: 1200,        // Distance between gate spawns
    WIDTH: 120,                  // Width of each gate half
    HEIGHT: 100,                 // Height of gate
    GAP: 80,                     // Gap between left and right options
};

// ============================================================================
// COLORS - From Reference Screenshots
// ============================================================================
export const COLORS = {
    // Environment
    SKY_BLUE: 0x87CEEB,
    GRASS_GREEN: 0x7CB342,       // Green grass on sides

    // Road
    ROAD_BROWN: 0x8B7355,        // Brown asphalt
    ROAD_LINE_WHITE: 0xFFFFFF,   // White center line

    // Squad
    SQUAD_BLUE: 0x03A9F4,        // Bright blue characters
    SQUAD_BLUE_DARK: 0x0277BD,   // Darker blue for shading
    SQUAD_HIGHLIGHT: 0xFFFFFF,   // White highlight

    // Collectibles & Obstacles
    COLLECTIBLE: 0x00FF00,       // Green collectibles (+)
    OBSTACLE: 0xFF0000,          // Red obstacles (-)
    GATE_GOOD: 0x4CAF50,         // Green gate (good math)
    GATE_BAD: 0xF44336,          // Red gate (bad math)

    // UI
    BUBBLE_BG: 0x1976D2,         // Blue bubble background
    BUBBLE_BORDER: 0xFFFFFF,     // White bubble border
    TEXT_WHITE: 0xFFFFFF,
    TEXT_BLACK: 0x000000,
};

// ============================================================================
// UI LAYOUT - Squad bubble ABOVE character (not bottom of screen!)
// ============================================================================
export const UI = {
    BUBBLE_RADIUS: 30,           // Size of squad counter bubble
    BUBBLE_OFFSET_Y: -70,        // Above character (negative = up)
    BUBBLE_FONT_SIZE: '48px',
};

// ============================================================================
// SCENES
// ============================================================================
export const SCENES = {
    BOOT: 'BootScene',
    PRELOAD: 'PreloadScene',
    MENU: 'MenuScene',
    CHARACTER_SELECTION: 'CharacterSelectionScene',
    GAME: 'GameScene',
    VICTORY: 'VictoryScene',
    GAME_OVER: 'GameOverScene',
};

// ============================================================================
// PERFORMANCE
// ============================================================================
export const PERFORMANCE = {
    ENABLE_DEBUG: true,          // Show FPS during development
};
