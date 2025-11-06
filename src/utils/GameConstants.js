/**
 * Bridge Battle - Game Constants
 * All configuration values in one place for easy tuning
 *
 * CRITICAL: These values define the core game feel
 * Never use magic numbers in code - always reference these constants
 */

// ============================================================================
// GAME CONFIGURATION
// ============================================================================
export const GAME = {
    WIDTH: 1920,
    HEIGHT: 1080,
    TARGET_FPS: 60,
    PHYSICS: 'arcade'
};

// ============================================================================
// WORLD & BRIDGE SPECIFICATIONS
// ============================================================================
export const WORLD = {
    // CRITICAL: Bridge must be wide enough for squad movement
    BRIDGE_WIDTH: 600,           // 31% of screen width (1920)
    BRIDGE_LENGTH: 10000,        // Total level length

    // Movement
    GAME_SPEED: 300,             // Forward scroll speed (units/sec)

    // Visual
    LANE_WIDTH: 200,             // Width of each lane
    NUM_LANES: 3,                // Number of lanes on bridge
};

// ============================================================================
// PLAYER SQUAD SYSTEM
// ============================================================================
export const SQUAD = {
    // Starting configuration
    START_SIZE: 1,               // Start with 1 character
    MAX_SIZE: 200,               // Maximum squad size

    // Formation (hexagonal close-packed)
    FORMATION_SPACING: 45,       // Space between characters (tight blob)
    SEPARATION_FORCE: 0.3,       // Force to prevent overlap
    FORMATION_LERP: 0.12,        // Smoothing factor for movement

    // Movement
    MOVE_SPEED: 8,               // Horizontal movement speed
    HORIZONTAL_LIMIT: 250,       // Max distance from center (-250 to +250)

    // Character visuals
    CHARACTER_SCALE: 0.8,        // Scale of character sprites
    CHARACTER_SIZE: 64,          // Base size for collision
};

// ============================================================================
// CAMERA
// ============================================================================
export const CAMERA = {
    FOLLOW_OFFSET_Y: -200,       // Camera ahead of player (look forward)
    FOLLOW_LERP: 0.08,           // Smooth following
    ZOOM: 1.0,
};

// ============================================================================
// COLORS (From Reference Screenshots)
// ============================================================================
export const COLORS = {
    // Environment
    SKY_TOP: 0x87CEEB,
    SKY_BOTTOM: 0xE0F6FF,
    GRASS_SIDE: 0x7CB342,

    // Bridge
    BRIDGE_ROAD: 0x8B7355,       // Brown asphalt
    BRIDGE_LINES: 0xFFFFFF,      // White lane markings
    BRIDGE_EDGE: 0xCC3333,       // Red railings

    // Squad
    SQUAD_BLUE: 0x03A9F4,        // Bright blue (player color)

    // UI
    UI_WHITE: 0xFFFFFF,
    UI_GOLD: 0xFFD700,
    UI_DANGER: 0xFF4444,
    UI_SUCCESS: 0x00FF00,
};

// ============================================================================
// UI LAYOUT
// ============================================================================
export const UI = {
    // Squad counter (bottom center - HUGE)
    SQUAD_COUNTER_SIZE: '120px',
    SQUAD_COUNTER_BOTTOM: 100,
    SQUAD_LABEL_SIZE: '32px',

    // Padding
    PADDING: 40,
};

// ============================================================================
// SCENES
// ============================================================================
export const SCENES = {
    BOOT: 'BootScene',
    PRELOAD: 'PreloadScene',
    GAME: 'GameScene',
    UI: 'UIScene',
};

// ============================================================================
// PERFORMANCE
// ============================================================================
export const PERFORMANCE = {
    ENABLE_DEBUG: false,         // Show FPS and debug info
};
