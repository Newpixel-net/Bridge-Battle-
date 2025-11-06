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

    // Formation (hexagonal close-packed) - ULTRA TIGHT
    FORMATION_SPACING: 70,       // Space between characters (tight blob, scaled for new size)
    SEPARATION_FORCE: 0.3,       // Force to prevent overlap
    FORMATION_LERP: 0.12,        // Smoothing factor for movement

    // Movement
    MOVE_SPEED: 8,               // Horizontal movement speed
    HORIZONTAL_LIMIT: 180,       // Max distance from center (adjusted for zoom)

    // Character visuals - LARGE and PROMINENT matching reference screenshots
    CHARACTER_RADIUS: 35,        // Radius of each character sphere (70px diameter)
    CHARACTER_SIZE: 70,          // Base size for collision (diameter)
};

// ============================================================================
// CAMERA - CRITICAL: 3D Runner View (like Temple Run/Subway Surfers)
// ============================================================================
export const CAMERA = {
    FOLLOW_OFFSET_Y: -300,       // Camera ahead of player (look forward)
    FOLLOW_LERP: 0.08,           // Smooth following
    ZOOM: 4.0,                   // CRITICAL: High zoom creates tight runner view (road fills screen)
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

    // Squad (from reference screenshots)
    SQUAD_BLUE: 0x03A9F4,        // Bright blue (player color)
    SQUAD_BLUE_DARK: 0x0277BD,   // Darker blue for shading
    SQUAD_HIGHLIGHT: 0xFFFFFF,   // White highlight on top

    // UI
    UI_WHITE: 0xFFFFFF,
    UI_GOLD: 0xFFD700,
    UI_DANGER: 0xFF4444,
    UI_SUCCESS: 0x00FF00,
    UI_SQUAD_BUBBLE: 0x1976D2,   // Dark blue for squad counter background
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
