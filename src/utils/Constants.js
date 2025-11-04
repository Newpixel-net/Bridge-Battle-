/**
 * Game Constants
 * All game-wide constants and configuration values
 */

export const GAME = {
    WIDTH: 1920,
    HEIGHT: 1080,
    TARGET_FPS: 60,
    PHYSICS: 'arcade'
};

export const WORLD = {
    BRIDGE_WIDTH: 40,
    BRIDGE_LENGTH: 1000,
    SCROLL_SPEED: 3,
    LANE_WIDTH: 8
};

export const PLAYER = {
    SQUAD_START_SIZE: 3,
    MAX_SQUAD_SIZE: 50,
    MOVE_SPEED: 5,
    CHARACTER_SIZE: 1.5,
    FORMATION_SPACING: 1.2,
    SEPARATION_FORCE: 0.3
};

export const SHOOTING = {
    FIRE_RATE: 333, // ms (3 bullets per second)
    BULLET_SPEED: 15,
    BULLET_DAMAGE: 10,
    BULLET_LIFETIME: 2000, // ms
    POOL_SIZE: 200
};

export const GATES = {
    SPAWN_INTERVAL_MIN: 50,
    SPAWN_INTERVAL_MAX: 100,
    WIDTH: 40, // Full bridge width
    VALUES: {
        MIN: -5,
        MAX: 10
    },
    SHOOT_TO_INCREASE: true,
    INCREASE_PER_10_DAMAGE: 1
};

export const OBSTACLES = {
    HP_MIN: 100,
    HP_MAX: 300,
    SPAWN_INTERVAL_MIN: 20,
    SPAWN_INTERVAL_MAX: 40,
    TYPES: ['TIRE_STACK', 'CRATE', 'BARREL']
};

export const ENEMIES = {
    HP: 50,
    SPAWN_INTERVAL: 60,
    CLUSTER_SIZE: {
        MIN: 3,
        MAX: 8
    }
};

export const CAMERA = {
    DISTANCE_BACK: 9,
    HEIGHT: 8,
    FOLLOW_LERP: 0.1,
    SHAKE_INTENSITY: 5
};

export const UI = {
    FONT_FAMILY: 'Arial, sans-serif',
    FONT_SIZE_LARGE: 72,
    FONT_SIZE_MEDIUM: 48,
    FONT_SIZE_SMALL: 32,
    SQUAD_COUNTER_SIZE: 96,
    DAMAGE_NUMBER_SIZE: 48,
    COLORS: {
        WHITE: '#FFFFFF',
        GOLD: '#FFD700',
        RED: '#FF4444',
        GREEN: '#44FF44',
        CYAN: '#00FFFF',
        MAGENTA: '#FF00FF'
    }
};

export const COLORS = {
    BULLET: {
        SQUAD_1_5: 0xFFD700,    // Yellow
        SQUAD_6_10: 0x00FF00,   // Green
        SQUAD_11_15: 0x00FFFF,  // Cyan
        SQUAD_16_PLUS: 0xFF00FF // Magenta
    },
    GATE: {
        POSITIVE: 0x00AAFF,     // Blue
        NEGATIVE: 0xFF4444      // Red
    },
    BRIDGE: {
        ROAD: 0x888888,         // Gray
        LINES: 0xFFFFFF,        // White
        PILLAR: 0xCC3333        // Red
    },
    WATER: 0x0066AA
};

export const PARTICLES = {
    MAX_PARTICLES: 500,
    EXPLOSION_PARTICLES: 20,
    BULLET_TRAIL_PARTICLES: 3
};

export const AUDIO = {
    MASTER_VOLUME: 0.7,
    MUSIC_VOLUME: 0.5,
    SFX_VOLUME: 0.8
};

export const PERFORMANCE = {
    CULL_DISTANCE: 100,
    PARTICLE_QUALITY_HIGH: true,
    ENABLE_SHADOWS: false,
    MAX_LIGHTS: 0
};

export const ASSET_KEYS = {
    // Character Sprites (Real Assets)
    CHAR_RUN: 'char-run',
    CHAR_GUNFIRE: 'char-gunfire',
    CHAR_POWER_ATTACK: 'char-power-attack',

    // Placeholder Sprites
    SQUAD_MEMBER: 'squad-member',
    ENEMY: 'enemy',
    OBSTACLE_TIRE: 'obstacle-tire',
    OBSTACLE_CRATE: 'obstacle-crate',
    GATE_POSITIVE: 'gate-positive',
    GATE_NEGATIVE: 'gate-negative',

    // Audio
    SFX_SHOOT: 'sfx-shoot',
    SFX_EXPLOSION: 'sfx-explosion',
    SFX_HIT: 'sfx-hit',
    SFX_GATE: 'sfx-gate',
    SFX_PICKUP: 'sfx-pickup',
    MUSIC_GAME: 'music-game'
};

export const SCENES = {
    BOOT: 'BootScene',
    PRELOAD: 'PreloadScene',
    MENU: 'MenuScene',
    GAME: 'GameScene',
    UI: 'UIScene',
    GAME_OVER: 'GameOverScene'
};

export default {
    GAME,
    WORLD,
    PLAYER,
    SHOOTING,
    GATES,
    OBSTACLES,
    ENEMIES,
    CAMERA,
    UI,
    COLORS,
    PARTICLES,
    AUDIO,
    PERFORMANCE,
    ASSET_KEYS,
    SCENES
};
