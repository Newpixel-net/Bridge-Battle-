/**
 * Bridge Battle - Game Constants
 * PHASE 1 COMPLETE REBUILD - Matching Reference Screenshots EXACTLY
 *
 * Reference: screenshots-for-claude/the-required-results/Level1.png
 */

// ============================================================================
// GAME CONFIGURATION - PORTRAIT MOBILE RUNNER
// ============================================================================
export const GAME = {
    WIDTH: 540,                  // PORTRAIT width (mobile runner style)
    HEIGHT: 960,                 // PORTRAIT height
    TARGET_FPS: 60,
    PHYSICS: 'arcade'
};

// ============================================================================
// WORLD & ROAD SPECIFICATIONS
// ============================================================================
export const WORLD = {
    // Road dimensions (fills ~75% of viewport width)
    ROAD_WIDTH: 400,             // 400/540 = 74% of screen width
    ROAD_LENGTH: 10000,          // Total level length

    // Movement
    SCROLL_SPEED: 0,             // No auto-scroll yet (Phase 1)
};

// ============================================================================
// PLAYER SQUAD SYSTEM
// ============================================================================
export const SQUAD = {
    // Starting configuration
    START_SIZE: 1,               // Start with 1 character
    MAX_SIZE: 200,               // Maximum squad size

    // Formation - ULTRA-TIGHT hexagonal formation
    FORMATION_SPACING: 52,       // Space between character centers (tight!)
    FORMATION_LERP: 0.15,        // Smoothing factor for movement

    // Movement
    MOVE_SPEED: 300,             // Horizontal movement speed (pixels/sec)
    HORIZONTAL_LIMIT: 150,       // Max distance from center

    // Character visuals - Matching reference screenshots
    CHARACTER_RADIUS: 25,        // Radius of each character sphere
    CHARACTER_SIZE: 50,          // Diameter for collision

    // Character position
    START_Y: 720,                // Y position (lower third of screen: 960 * 0.75)
};

// ============================================================================
// CAMERA - Fixed orthographic view (no zoom needed)
// ============================================================================
export const CAMERA = {
    FIXED_Y: 0,                  // Camera doesn't move yet (Phase 1)
    ZOOM: 1.0,                   // No zoom - 1:1 pixel ratio
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

    // UI
    BUBBLE_BG: 0x1976D2,         // Blue bubble background
    BUBBLE_BORDER: 0xFFFFFF,     // White bubble border
    TEXT_WHITE: 0xFFFFFF,
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
    GAME: 'GameScene',
};

// ============================================================================
// PERFORMANCE
// ============================================================================
export const PERFORMANCE = {
    ENABLE_DEBUG: true,          // Show FPS during development
};
