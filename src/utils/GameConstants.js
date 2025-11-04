/**
 * Bridge Battle - Complete Game Constants
 * All values from game design specification
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
    // CRITICAL: Bridge must be 600px (31% of 1920px screen)
    BRIDGE_WIDTH: 600,
    BRIDGE_LENGTH: 10000,

    // Movement
    GAME_SPEED: 300,        // Forward scroll speed (units/sec)

    // Visual
    LANE_WIDTH: 200,        // Width of each lane (3 lanes)
    NUM_LANES: 3,           // Number of lanes on bridge
};

// ============================================================================
// PLAYER SQUAD SYSTEM
// ============================================================================
export const SQUAD = {
    // Starting configuration
    START_SIZE: 3,
    MAX_SIZE: 50,

    // Formation (blob physics)
    FORMATION_SPACING: 60,      // Space between characters
    SEPARATION_FORCE: 0.5,      // Force to prevent overlap
    FORMATION_LERP: 0.1,        // Smoothing factor

    // Movement
    MOVE_SPEED: 8,              // Horizontal movement speed
    HORIZONTAL_LIMIT: 250,      // Max distance from center

    // Character size
    CHARACTER_SCALE: 0.4,       // Scale of character sprites
    CHARACTER_HEIGHT: 88,       // Actual pixel height at scale
};

// ============================================================================
// AUTO-SHOOTING SYSTEM
// ============================================================================
export const SHOOTING = {
    // Fire rate
    FIRE_RATE: 333,             // ms between shots (3/sec per character)

    // Bullet physics
    BULLET_SPEED: 600,          // units per second
    BULLET_LIFETIME: 3000,      // ms before bullet despawns
    BULLET_SIZE: 12,            // Pixel size

    // Pooling
    BULLET_POOL_SIZE: 500,

    // Damage
    BULLET_DAMAGE: 10,

    // Targeting
    TARGET_RANGE: 400,          // How far ahead to look for targets

    // Visual
    TRAIL_LENGTH: 5,            // Number of trail particles
    BULLET_GLOW: true,
};

// ============================================================================
// BULLET COLORS (Based on squad size)
// ============================================================================
export const BULLET_COLORS = {
    TIER_1: { min: 1,  max: 10, color: 0xFFD700, name: 'Yellow' },
    TIER_2: { min: 11, max: 20, color: 0x00FF00, name: 'Green' },
    TIER_3: { min: 21, max: 30, color: 0x00FFFF, name: 'Cyan' },
    TIER_4: { min: 31, max: 99, color: 0xFF00FF, name: 'Magenta' },
};

// ============================================================================
// GATE SYSTEM
// ============================================================================
export const GATES = {
    // Dimensions - CRITICAL: Gates span FULL bridge width
    WIDTH: 600,                 // FULL BRIDGE WIDTH
    HEIGHT: 100,                // Visual height
    SEGMENTS: 3,                // Number of lanes (player chooses one)
    SEGMENT_GAP: 10,            // Gap between segments

    // Spawning
    SPAWN_INTERVAL_MIN: 600,
    SPAWN_INTERVAL_MAX: 1000,

    // Values
    POSITIVE_MIN: 1,
    POSITIVE_MAX: 15,
    NEGATIVE_MIN: -8,
    NEGATIVE_MAX: -1,
    POSITIVE_CHANCE: 0.6,       // 60% chance of positive gate

    // Shooting mechanics (positive gates only)
    SHOOTABLE: true,
    HP_PER_VALUE: 50,           // HP = value * 50
    VALUE_INCREASE_PER_10_DMG: 1, // Every 10 damage increases value by 1

    // Visual
    OPACITY: 0.7,
    PULSE_SCALE_MIN: 0.95,
    PULSE_SCALE_MAX: 1.05,
    PULSE_DURATION: 2000,       // ms
};

// ============================================================================
// OBSTACLES
// ============================================================================
export const OBSTACLES = {
    // HP range
    HP_MIN: 100,
    HP_MAX: 300,

    // Spawning
    SPAWN_INTERVAL_MIN: 400,
    SPAWN_INTERVAL_MAX: 800,
    CLUSTER_SIZE_MIN: 2,
    CLUSTER_SIZE_MAX: 5,

    // Size
    SCALE: 1.0,

    // Loot
    WEAPON_DROP_CHANCE: 0.3,    // 30% chance
};

// ============================================================================
// VISUAL EFFECTS
// ============================================================================
export const VFX = {
    // Screen shake
    SHAKE_AMPLITUDE: 8,
    SHAKE_DURATION: 200,        // ms

    // Particles
    PARTICLE_POOL_SIZE: 1000,
    EXPLOSION_PARTICLE_COUNT: 50,
    HIT_PARTICLE_COUNT: 10,

    // Floating text
    DAMAGE_NUMBER_RISE_SPEED: 60,  // pixels/sec upward
    DAMAGE_NUMBER_LIFETIME: 1000,   // ms
    DAMAGE_NUMBER_SIZE: 48,

    // Pulse animations
    PULSE_SCALE_AMOUNT: 1.3,
    PULSE_DURATION: 300,        // ms
};

// ============================================================================
// COLORS
// ============================================================================
export const COLORS = {
    // Environment
    SKY_TOP: 0x87CEEB,
    SKY_BOTTOM: 0xE0F6FF,
    WATER: 0x4A90E2,
    OCEAN: 0x0066AA,

    // Bridge
    BRIDGE_ROAD: 0x808080,
    BRIDGE_LINES: 0xFFFFFF,
    BRIDGE_PILLAR: 0xCC3333,
    BRIDGE_EDGE: 0x222222,

    // Gates
    GATE_POSITIVE: 0x4A90E2,
    GATE_POSITIVE_GRADIENT: 0x00FFFF,
    GATE_NEGATIVE: 0xFF4444,
    GATE_NEGATIVE_GRADIENT: 0xAA0000,

    // UI
    UI_SCORE: 0xFFD700,
    UI_LEVEL: 0x00BFFF,
    UI_SQUAD: 0xFFFFFF,
    UI_DANGER: 0xFF4444,
    UI_SUCCESS: 0x00FF00,

    // Effects
    EXPLOSION: 0xFF8800,
    DAMAGE_NUMBER: 0xFFD700,
    FLASH_HIT: 0xFFFFFF,
};

// ============================================================================
// CAMERA
// ============================================================================
export const CAMERA = {
    FOLLOW_OFFSET_Y: -200,      // Camera ahead of player
    FOLLOW_LERP: 0.08,          // Smooth following
    ZOOM: 1.0,
};

// ============================================================================
// UI LAYOUT
// ============================================================================
export const UI = {
    // Padding
    PADDING: 40,

    // Font sizes
    FONT_SCORE_LABEL: '32px',
    FONT_SCORE_VALUE: '64px',
    FONT_LEVEL_LABEL: '32px',
    FONT_LEVEL_VALUE: '64px',
    FONT_SQUAD_VALUE: '120px',  // VERY LARGE
    FONT_SQUAD_LABEL: '24px',

    // Squad counter
    SQUAD_COUNTER_BOTTOM: 80,

    // Colors
    COLOR_WHITE: '#FFFFFF',
    COLOR_GOLD: '#FFD700',
    COLOR_CYAN: '#00BFFF',
    COLOR_RED: '#FF4444',
    COLOR_GREEN: '#00FF00',
};

// ============================================================================
// GAME STATES
// ============================================================================
export const GAME_STATES = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameover',
    VICTORY: 'victory',
};

// ============================================================================
// SCENES
// ============================================================================
export const SCENES = {
    BOOT: 'BootScene',
    PRELOAD: 'PreloadScene',
    MENU: 'MenuScene',
    GAME: 'GameScene',
    UI: 'UIScene',
};

// ============================================================================
// ASSET KEYS
// ============================================================================
export const ASSETS = {
    // Character animations
    CHAR_RUN: 'char-run',
    CHAR_GUNFIRE: 'char-gunfire',
    CHAR_POWER_ATTACK: 'char-power-attack',

    // Obstacles (match PreloadScene placeholder names)
    OBSTACLE_TIRE: 'placeholder-obstacle-tire',
    OBSTACLE_CRATE: 'placeholder-obstacle-crate',

    // Gates (match PreloadScene placeholder names)
    GATE_POSITIVE: 'placeholder-gate-positive',
    GATE_NEGATIVE: 'placeholder-gate-negative',

    // Effects (match PreloadScene placeholder names)
    BULLET: 'placeholder-bullet',
    PARTICLE: 'placeholder-particle',
    WEAPON: 'placeholder-weapon',
};

// ============================================================================
// LEVEL GENERATION
// ============================================================================
export const LEVEL = {
    // Segment types
    GATE_CHANCE: 0.4,
    OBSTACLE_CHANCE: 0.3,
    EMPTY_CHANCE: 0.3,

    // Spacing
    MIN_SPACING: 300,
    MAX_SPACING: 600,

    // Start position
    START_Z: 200,

    // Win condition
    WIN_DISTANCE: 10000,
};

// ============================================================================
// PERFORMANCE
// ============================================================================
export const PERFORMANCE = {
    CULL_DISTANCE: 1000,        // Destroy objects this far behind
    SPAWN_DISTANCE: 800,        // Spawn objects this far ahead
    MAX_PARTICLES: 1000,
    ENABLE_GLOW: true,
    ENABLE_TRAILS: true,
};

// ============================================================================
// DEBUG
// ============================================================================
export const DEBUG = {
    SHOW_PHYSICS: false,
    SHOW_FPS: true,
    SHOW_HITBOXES: false,
    GOD_MODE: false,
    INFINITE_AMMO: false,
    LOG_COLLISIONS: false,
};
