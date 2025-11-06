/**
 * ProgressionManager - Handles player progression, achievements, and persistence
 *
 * Features:
 * - High score tracking
 * - Achievement system
 * - Unlockable content
 * - Statistics tracking
 * - LocalStorage persistence
 */

const STORAGE_KEY = 'bridge_battle_progression';

export default class ProgressionManager {
    constructor() {
        this.data = this.loadData();
    }

    /**
     * Load progression data from localStorage
     */
    loadData() {
        try {
            const savedData = localStorage.getItem(STORAGE_KEY);
            if (savedData) {
                const parsed = JSON.parse(savedData);
                console.log('✓ Progression data loaded:', parsed);
                return parsed;
            }
        } catch (error) {
            console.warn('Failed to load progression data:', error);
        }

        // Return default data structure
        return this.getDefaultData();
    }

    /**
     * Get default progression data structure
     */
    getDefaultData() {
        return {
            // High scores
            highScore: 0,
            highestDistance: 0,
            mostEnemiesKilled: 0,
            largestSquad: 0,

            // Statistics
            stats: {
                totalGamesPlayed: 0,
                totalVictories: 0,
                totalDeaths: 0,
                totalDistanceTraveled: 0,
                totalEnemiesKilled: 0,
                totalBossesDefeated: 0,
                totalTimePlayedSeconds: 0
            },

            // Achievements (id: unlocked)
            achievements: {
                // Distance milestones
                'REACH_1000M': false,
                'REACH_2500M': false,
                'REACH_5000M': false,
                'REACH_10000M': false,

                // Squad milestones
                'SQUAD_50': false,
                'SQUAD_100': false,
                'SQUAD_200': false,
                'SQUAD_500': false,

                // Combat achievements
                'KILL_100_ENEMIES': false,
                'KILL_500_ENEMIES': false,
                'KILL_1000_ENEMIES': false,
                'DEFEAT_FIRST_BOSS': false,
                'DEFEAT_10_BOSSES': false,

                // Score achievements
                'SCORE_5000': false,
                'SCORE_10000': false,
                'SCORE_25000': false,

                // Special achievements
                'FIRST_VICTORY': false,
                'WIN_WITH_1_SOLDIER': false,
                'PERFECT_RUN': false, // Win without losing any squad members
                'SPEED_RUN': false // Win in under 5 minutes
            },

            // Unlockables
            unlocks: {
                characters: {
                    // Character skins/variants
                    'WARRIOR_GOLD': false,
                    'ARCHER_SILVER': false,
                    'MAGE_COSMIC': false,
                    'TANK_IRON': false,
                    'ASSASSIN_SHADOW': false,
                    'HEALER_ANGELIC': false
                },
                colors: {
                    // Squad color schemes
                    'RED': true,      // Default
                    'BLUE': true,     // Default
                    'GREEN': false,
                    'PURPLE': false,
                    'GOLD': false,
                    'RAINBOW': false
                },
                effects: {
                    // Visual effects
                    'TRAIL_FIRE': false,
                    'TRAIL_ICE': false,
                    'TRAIL_LIGHTNING': false,
                    'VICTORY_FIREWORKS': false
                }
            },

            // Session data
            lastPlayedDate: Date.now(),
            version: '1.0.0'
        };
    }

    /**
     * Save progression data to localStorage
     */
    saveData() {
        try {
            this.data.lastPlayedDate = Date.now();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
            console.log('✓ Progression data saved');
            return true;
        } catch (error) {
            console.error('Failed to save progression data:', error);
            return false;
        }
    }

    /**
     * Update stats after a game session
     */
    updateSessionStats(sessionData) {
        const {
            score = 0,
            distance = 0,
            enemiesKilled = 0,
            squadSize = 0,
            bossDefeated = false,
            victory = false,
            timePlayedSeconds = 0
        } = sessionData;

        // Update high scores
        const isNewHighScore = score > this.data.highScore;
        if (isNewHighScore) {
            this.data.highScore = score;
        }

        if (distance > this.data.highestDistance) {
            this.data.highestDistance = distance;
        }

        if (enemiesKilled > this.data.mostEnemiesKilled) {
            this.data.mostEnemiesKilled = enemiesKilled;
        }

        if (squadSize > this.data.largestSquad) {
            this.data.largestSquad = squadSize;
        }

        // Update statistics
        this.data.stats.totalGamesPlayed++;
        this.data.stats.totalDistanceTraveled += distance;
        this.data.stats.totalEnemiesKilled += enemiesKilled;
        this.data.stats.totalTimePlayedSeconds += timePlayedSeconds;

        if (victory) {
            this.data.stats.totalVictories++;
        } else {
            this.data.stats.totalDeaths++;
        }

        if (bossDefeated) {
            this.data.stats.totalBossesDefeated++;
        }

        // Check for newly unlocked achievements
        const newAchievements = this.checkAchievements(sessionData);

        // Save data
        this.saveData();

        return {
            isNewHighScore,
            newAchievements,
            totalAchievements: this.getUnlockedAchievementCount()
        };
    }

    /**
     * Check and unlock achievements based on session data
     */
    checkAchievements(sessionData) {
        const newAchievements = [];

        // Distance achievements
        this.checkAndUnlock('REACH_1000M', sessionData.distance >= 1000, newAchievements);
        this.checkAndUnlock('REACH_2500M', sessionData.distance >= 2500, newAchievements);
        this.checkAndUnlock('REACH_5000M', sessionData.distance >= 5000, newAchievements);
        this.checkAndUnlock('REACH_10000M', sessionData.distance >= 10000, newAchievements);

        // Squad achievements
        this.checkAndUnlock('SQUAD_50', sessionData.squadSize >= 50, newAchievements);
        this.checkAndUnlock('SQUAD_100', sessionData.squadSize >= 100, newAchievements);
        this.checkAndUnlock('SQUAD_200', sessionData.squadSize >= 200, newAchievements);
        this.checkAndUnlock('SQUAD_500', sessionData.squadSize >= 500, newAchievements);

        // Combat achievements (lifetime stats)
        this.checkAndUnlock('KILL_100_ENEMIES',
            this.data.stats.totalEnemiesKilled >= 100, newAchievements);
        this.checkAndUnlock('KILL_500_ENEMIES',
            this.data.stats.totalEnemiesKilled >= 500, newAchievements);
        this.checkAndUnlock('KILL_1000_ENEMIES',
            this.data.stats.totalEnemiesKilled >= 1000, newAchievements);
        this.checkAndUnlock('DEFEAT_FIRST_BOSS',
            this.data.stats.totalBossesDefeated >= 1, newAchievements);
        this.checkAndUnlock('DEFEAT_10_BOSSES',
            this.data.stats.totalBossesDefeated >= 10, newAchievements);

        // Score achievements
        this.checkAndUnlock('SCORE_5000', sessionData.score >= 5000, newAchievements);
        this.checkAndUnlock('SCORE_10000', sessionData.score >= 10000, newAchievements);
        this.checkAndUnlock('SCORE_25000', sessionData.score >= 25000, newAchievements);

        // Special achievements
        this.checkAndUnlock('FIRST_VICTORY',
            sessionData.victory && this.data.stats.totalVictories >= 1, newAchievements);
        this.checkAndUnlock('WIN_WITH_1_SOLDIER',
            sessionData.victory && sessionData.squadSize === 1, newAchievements);
        this.checkAndUnlock('PERFECT_RUN',
            sessionData.victory && sessionData.noDeaths === true, newAchievements);
        this.checkAndUnlock('SPEED_RUN',
            sessionData.victory && sessionData.timePlayedSeconds <= 300, newAchievements);

        // Unlock rewards for new achievements
        if (newAchievements.length > 0) {
            this.unlockRewards(newAchievements);
        }

        return newAchievements;
    }

    /**
     * Check and unlock a single achievement
     */
    checkAndUnlock(achievementId, condition, newAchievements) {
        if (condition && !this.data.achievements[achievementId]) {
            this.data.achievements[achievementId] = true;
            newAchievements.push(achievementId);
            console.log('🏆 Achievement unlocked:', achievementId);
        }
    }

    /**
     * Unlock rewards based on achievements
     */
    unlockRewards(achievements) {
        achievements.forEach(achievementId => {
            switch (achievementId) {
                case 'REACH_5000M':
                    this.data.unlocks.colors.GREEN = true;
                    break;
                case 'SQUAD_100':
                    this.data.unlocks.colors.PURPLE = true;
                    break;
                case 'DEFEAT_FIRST_BOSS':
                    this.data.unlocks.characters.WARRIOR_GOLD = true;
                    break;
                case 'KILL_500_ENEMIES':
                    this.data.unlocks.colors.GOLD = true;
                    break;
                case 'SCORE_10000':
                    this.data.unlocks.effects.TRAIL_FIRE = true;
                    break;
                case 'PERFECT_RUN':
                    this.data.unlocks.colors.RAINBOW = true;
                    break;
            }
        });
    }

    /**
     * Get count of unlocked achievements
     */
    getUnlockedAchievementCount() {
        return Object.values(this.data.achievements).filter(unlocked => unlocked).length;
    }

    /**
     * Get total achievement count
     */
    getTotalAchievementCount() {
        return Object.keys(this.data.achievements).length;
    }

    /**
     * Check if achievement is unlocked
     */
    isAchievementUnlocked(achievementId) {
        return this.data.achievements[achievementId] === true;
    }

    /**
     * Check if content is unlocked
     */
    isUnlocked(category, itemId) {
        return this.data.unlocks[category]?.[itemId] === true;
    }

    /**
     * Get high score
     */
    getHighScore() {
        return this.data.highScore;
    }

    /**
     * Get all statistics
     */
    getStats() {
        return { ...this.data.stats };
    }

    /**
     * Get achievement progress (for UI display)
     */
    getAchievementProgress() {
        const progress = [];

        // Distance achievements
        progress.push({
            id: 'REACH_1000M',
            name: 'Explorer',
            description: 'Travel 1000m',
            unlocked: this.data.achievements.REACH_1000M,
            icon: '🗺️'
        });

        progress.push({
            id: 'REACH_5000M',
            name: 'Adventurer',
            description: 'Travel 5000m',
            unlocked: this.data.achievements.REACH_5000M,
            icon: '🏔️',
            reward: 'Unlocks: Green color'
        });

        progress.push({
            id: 'REACH_10000M',
            name: 'World Traveler',
            description: 'Travel 10000m',
            unlocked: this.data.achievements.REACH_10000M,
            icon: '🌍'
        });

        // Squad achievements
        progress.push({
            id: 'SQUAD_50',
            name: 'Growing Army',
            description: 'Reach 50 squad members',
            unlocked: this.data.achievements.SQUAD_50,
            icon: '👥'
        });

        progress.push({
            id: 'SQUAD_100',
            name: 'Mighty Force',
            description: 'Reach 100 squad members',
            unlocked: this.data.achievements.SQUAD_100,
            icon: '🛡️',
            reward: 'Unlocks: Purple color'
        });

        progress.push({
            id: 'SQUAD_500',
            name: 'Legendary Army',
            description: 'Reach 500 squad members',
            unlocked: this.data.achievements.SQUAD_500,
            icon: '⚔️'
        });

        // Combat achievements
        progress.push({
            id: 'KILL_100_ENEMIES',
            name: 'Warrior',
            description: 'Defeat 100 enemies (total)',
            unlocked: this.data.achievements.KILL_100_ENEMIES,
            icon: '💀'
        });

        progress.push({
            id: 'DEFEAT_FIRST_BOSS',
            name: 'Boss Slayer',
            description: 'Defeat your first boss',
            unlocked: this.data.achievements.DEFEAT_FIRST_BOSS,
            icon: '👹',
            reward: 'Unlocks: Gold Warrior skin'
        });

        progress.push({
            id: 'SCORE_10000',
            name: 'High Scorer',
            description: 'Reach 10000 points in one game',
            unlocked: this.data.achievements.SCORE_10000,
            icon: '⭐',
            reward: 'Unlocks: Fire trail effect'
        });

        progress.push({
            id: 'PERFECT_RUN',
            name: 'Perfectionist',
            description: 'Win without losing any squad members',
            unlocked: this.data.achievements.PERFECT_RUN,
            icon: '✨',
            reward: 'Unlocks: Rainbow color'
        });

        return progress;
    }

    /**
     * Reset all progression data (for testing or player choice)
     */
    reset() {
        console.warn('⚠️ Resetting all progression data');
        this.data = this.getDefaultData();
        this.saveData();
    }
}

// Create singleton instance
const progressionManager = new ProgressionManager();
export { progressionManager };
