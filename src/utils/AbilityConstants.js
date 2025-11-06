/**
 * Ability Constants - Definitions for all abilities
 *
 * VISUAL REFERENCE: Frames 6-14 (bottom UI shows 3-5 ability cards)
 *
 * Each ability has:
 * - id: Unique identifier
 * - name: Display name
 * - description: What it does
 * - energyCost: Energy required to activate
 * - cooldown: Milliseconds before can use again
 * - icon: Visual representation (color/shape for now)
 * - effect: Function that executes when activated
 */

export const ABILITY_TYPES = {
    FIREBALL: 'FIREBALL',
    SHIELD: 'SHIELD',
    LIGHTNING: 'LIGHTNING',
    MULTI_SHOT: 'MULTI_SHOT',
    SPEED_BOOST: 'SPEED_BOOST'
};

export const ABILITIES = {
    FIREBALL: {
        id: 'FIREBALL',
        name: 'Fireball',
        description: 'Explosive projectile that damages all nearby enemies',
        energyCost: 30,
        cooldown: 5000, // 5 seconds
        icon: {
            color: 0xFF6B35, // Orange-red
            symbol: '🔥'
        },
        effectType: 'projectile',
        damage: 10,
        radius: 80
    },

    SHIELD: {
        id: 'SHIELD',
        name: 'Shield',
        description: 'Temporary invulnerability for 3 seconds',
        energyCost: 40,
        cooldown: 8000, // 8 seconds
        icon: {
            color: 0x00D4FF, // Cyan
            symbol: '🛡️'
        },
        effectType: 'buff',
        duration: 3000
    },

    LIGHTNING: {
        id: 'LIGHTNING',
        name: 'Lightning',
        description: 'Chain lightning that jumps between enemies',
        energyCost: 35,
        cooldown: 6000, // 6 seconds
        icon: {
            color: 0xFFEB3B, // Yellow
            symbol: '⚡'
        },
        effectType: 'chain',
        damage: 8,
        maxTargets: 5,
        jumpRange: 100
    },

    MULTI_SHOT: {
        id: 'MULTI_SHOT',
        name: 'Multi-Shot',
        description: 'Fire a spread of 8 bullets',
        energyCost: 25,
        cooldown: 3000, // 3 seconds
        icon: {
            color: 0x9C27B0, // Purple
            symbol: '💥'
        },
        effectType: 'instant',
        bulletCount: 8,
        spreadAngle: 60
    },

    SPEED_BOOST: {
        id: 'SPEED_BOOST',
        name: 'Speed Boost',
        description: 'Increase fire rate by 3x for 4 seconds',
        energyCost: 20,
        cooldown: 7000, // 7 seconds
        icon: {
            color: 0x4CAF50, // Green
            symbol: '⚡'
        },
        effectType: 'buff',
        fireRateMultiplier: 3.0,
        duration: 4000
    }
};

/**
 * Default ability loadout (3 abilities shown)
 */
export const DEFAULT_LOADOUT = [
    ABILITIES.FIREBALL,
    ABILITIES.LIGHTNING,
    ABILITIES.MULTI_SHOT
];

/**
 * Get ability by ID
 */
export function getAbility(id) {
    return ABILITIES[id] || null;
}

/**
 * Get default loadout
 */
export function getDefaultLoadout() {
    return [...DEFAULT_LOADOUT];
}
