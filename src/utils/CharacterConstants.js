/**
 * Character Constants - Character definitions and stats
 *
 * VISUAL REFERENCE: Frame 2 (Character Selection Screen)
 *
 * Each character has:
 * - id: Unique identifier
 * - name: Display name
 * - description: Brief description
 * - rarity: COMMON, RARE, EPIC, LEGENDARY
 * - stats: Base stats (damage, fireRate, hp, speed)
 * - abilities: Array of ability IDs
 * - icon: Visual representation
 * - isUnlocked: Whether player has unlocked this character
 */

export const RARITY = {
    COMMON: 'COMMON',
    RARE: 'RARE',
    EPIC: 'EPIC',
    LEGENDARY: 'LEGENDARY'
};

export const RARITY_COLORS = {
    COMMON: 0x9E9E9E,      // Gray
    RARE: 0x2196F3,        // Blue
    EPIC: 0x9C27B0,        // Purple
    LEGENDARY: 0xFFD700    // Gold
};

export const CHARACTERS = {
    SOLDIER: {
        id: 'SOLDIER',
        name: 'Soldier',
        description: 'Balanced fighter with steady damage',
        rarity: RARITY.COMMON,
        stats: {
            damage: 1.0,        // Base damage multiplier
            fireRate: 1.0,      // Fire rate multiplier
            hp: 100,            // Starting HP
            speed: 1.0          // Movement speed multiplier
        },
        abilities: ['FIREBALL', 'MULTI_SHOT'],
        icon: {
            color: 0x4CAF50,    // Green
            symbol: '🎯'
        },
        isUnlocked: true        // Starter character
    },

    TANK: {
        id: 'TANK',
        name: 'Tank',
        description: 'Heavy armor, slower but powerful',
        rarity: RARITY.RARE,
        stats: {
            damage: 1.5,        // +50% damage
            fireRate: 0.7,      // -30% fire rate
            hp: 150,            // +50% HP
            speed: 0.8          // -20% speed
        },
        abilities: ['SHIELD', 'FIREBALL'],
        icon: {
            color: 0xFF9800,    // Orange
            symbol: '🛡️'
        },
        isUnlocked: true
    },

    SNIPER: {
        id: 'SNIPER',
        name: 'Sniper',
        description: 'High damage, slow fire rate',
        rarity: RARITY.RARE,
        stats: {
            damage: 2.5,        // +150% damage
            fireRate: 0.4,      // -60% fire rate
            hp: 80,             // -20% HP
            speed: 1.0
        },
        abilities: ['LIGHTNING', 'SPEED_BOOST'],
        icon: {
            color: 0xF44336,    // Red
            symbol: '🎯'
        },
        isUnlocked: true
    },

    MAGE: {
        id: 'MAGE',
        name: 'Mage',
        description: 'Magic specialist with powerful abilities',
        rarity: RARITY.EPIC,
        stats: {
            damage: 0.8,        // -20% damage
            fireRate: 1.2,      // +20% fire rate
            hp: 90,             // -10% HP
            speed: 1.0
        },
        abilities: ['LIGHTNING', 'FIREBALL', 'SHIELD'],
        icon: {
            color: 0x9C27B0,    // Purple
            symbol: '🔮'
        },
        isUnlocked: true
    },

    SPEEDSTER: {
        id: 'SPEEDSTER',
        name: 'Speedster',
        description: 'Lightning fast attacks',
        rarity: RARITY.EPIC,
        stats: {
            damage: 0.6,        // -40% damage
            fireRate: 2.0,      // +100% fire rate (2x)
            hp: 70,             // -30% HP
            speed: 1.3          // +30% speed
        },
        abilities: ['SPEED_BOOST', 'MULTI_SHOT'],
        icon: {
            color: 0x00BCD4,    // Cyan
            symbol: '⚡'
        },
        isUnlocked: false       // Must be unlocked
    },

    WARRIOR: {
        id: 'WARRIOR',
        name: 'Warrior',
        description: 'Balanced elite fighter',
        rarity: RARITY.LEGENDARY,
        stats: {
            damage: 1.3,        // +30% damage
            fireRate: 1.3,      // +30% fire rate
            hp: 130,            // +30% HP
            speed: 1.1          // +10% speed
        },
        abilities: ['FIREBALL', 'SHIELD', 'LIGHTNING', 'MULTI_SHOT'],
        icon: {
            color: 0xFFD700,    // Gold
            symbol: '👑'
        },
        isUnlocked: false       // Must be unlocked
    }
};

/**
 * Get all characters as array
 */
export function getAllCharacters() {
    return Object.values(CHARACTERS);
}

/**
 * Get unlocked characters
 */
export function getUnlockedCharacters() {
    return getAllCharacters().filter(char => char.isUnlocked);
}

/**
 * Get character by ID
 */
export function getCharacter(id) {
    return CHARACTERS[id] || null;
}

/**
 * Unlock character (save to localStorage)
 */
export function unlockCharacter(id) {
    if (CHARACTERS[id]) {
        CHARACTERS[id].isUnlocked = true;
        saveCharacterProgress();
    }
}

/**
 * Save character unlock progress to localStorage
 */
export function saveCharacterProgress() {
    const unlocked = getAllCharacters()
        .filter(char => char.isUnlocked)
        .map(char => char.id);

    localStorage.setItem('bridge_battle_unlocked_characters', JSON.stringify(unlocked));
}

/**
 * Load character unlock progress from localStorage
 */
export function loadCharacterProgress() {
    const saved = localStorage.getItem('bridge_battle_unlocked_characters');

    if (saved) {
        try {
            const unlocked = JSON.parse(saved);

            // Reset all to locked first
            getAllCharacters().forEach(char => {
                char.isUnlocked = false;
            });

            // Unlock saved characters
            unlocked.forEach(id => {
                if (CHARACTERS[id]) {
                    CHARACTERS[id].isUnlocked = true;
                }
            });
        } catch (e) {
            console.warn('Failed to load character progress:', e);
        }
    }

    // Ensure starter characters are always unlocked
    CHARACTERS.SOLDIER.isUnlocked = true;
    CHARACTERS.TANK.isUnlocked = true;
    CHARACTERS.SNIPER.isUnlocked = true;
    CHARACTERS.MAGE.isUnlocked = true;
}

/**
 * Get default character selection (for testing)
 */
export function getDefaultSelection() {
    return [
        CHARACTERS.SOLDIER,
        CHARACTERS.TANK,
        CHARACTERS.MAGE
    ];
}

/**
 * Calculate combined stats from character selection
 */
export function calculateCombinedStats(characters) {
    if (!characters || characters.length === 0) {
        return {
            damage: 1.0,
            fireRate: 1.0,
            hp: 100,
            speed: 1.0
        };
    }

    const count = characters.length;

    return {
        damage: characters.reduce((sum, char) => sum + char.stats.damage, 0) / count,
        fireRate: characters.reduce((sum, char) => sum + char.stats.fireRate, 0) / count,
        hp: characters.reduce((sum, char) => sum + char.stats.hp, 0) / count,
        speed: characters.reduce((sum, char) => sum + char.stats.speed, 0) / count
    };
}

/**
 * Get all unique abilities from character selection
 */
export function getCombinedAbilities(characters) {
    if (!characters || characters.length === 0) {
        return [];
    }

    const abilities = new Set();

    characters.forEach(char => {
        char.abilities.forEach(ability => abilities.add(ability));
    });

    return Array.from(abilities);
}
