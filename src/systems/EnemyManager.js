import Phaser from 'phaser';
import Enemy from '../entities/Enemy.js';
import { GAME, WORLD } from '../utils/GameConstants.js';

/**
 * EnemyManager - Spawns and manages enemies
 *
 * VISUAL REFERENCE: Frames 6-14
 * - Enemies spawn ahead of player
 * - Positioned in formations (lines, grids, clusters)
 * - 6-15+ enemies visible at once
 * - Scattered along the road
 * - Appear in waves
 *
 * SPAWNING PATTERNS:
 * - Wave 1: 3-5 enemies in line
 * - Wave 2: 6-8 enemies in grid
 * - Wave 3: 10+ enemies scattered
 * - Boss: Single large enemy at end
 */
export default class EnemyManager {
    constructor(scene) {
        this.scene = scene;
        this.enemies = [];

        // Spawn configuration
        this.config = {
            minSpawnDistance: 300,      // Minimum pixels ahead
            maxSpawnDistance: 500,      // Maximum pixels ahead
            waveInterval: 3000,         // 3 seconds between waves
            minEnemiesPerWave: 3,       // Minimum enemies
            maxEnemiesPerWave: 8,       // Maximum enemies
            roadWidth: WORLD.ROAD_WIDTH || 400,
            roadCenter: GAME.WIDTH / 2
        };

        // Wave state
        this.currentWave = 0;
        this.nextWaveTime = 0;
        this.totalEnemiesSpawned = 0;
        this.totalEnemiesKilled = 0;

        // Enemy type weights (for variety)
        this.enemyTypeWeights = {
            'SOLDIER': 70,  // 70% chance
            'TANK': 20,     // 20% chance
            'SPEED': 10     // 10% chance
        };

        console.log('✓ EnemyManager initialized');
    }

    /**
     * Update enemy manager
     */
    update(time, delta) {
        // Update all active enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];

            if (enemy.isDestroyed) {
                // Remove destroyed enemies
                this.enemies.splice(i, 1);
                this.totalEnemiesKilled++;
                continue;
            }

            if (enemy.active) {
                enemy.update(time, delta);

                // Move enemies with scroll (so they appear to move toward player)
                // Actually, enemies stay in world space, player scrolls up
                // We'll handle this in GameScene with camera/scroll
            }
        }

        // Check if time to spawn new wave
        if (time >= this.nextWaveTime) {
            this.spawnWave(time);
        }
    }

    /**
     * Spawn a wave of enemies
     */
    spawnWave(time) {
        this.currentWave++;

        // Calculate wave difficulty (more enemies over time)
        const waveMultiplier = 1 + (this.currentWave * 0.1);
        const enemyCount = Math.floor(
            Phaser.Math.Between(
                this.config.minEnemiesPerWave,
                this.config.maxEnemiesPerWave
            ) * waveMultiplier
        );

        // Cap at reasonable number
        const cappedCount = Math.min(enemyCount, 15);

        // Choose formation pattern
        const patterns = ['line', 'grid', 'scatter', 'circle', 'arrow'];
        const pattern = Phaser.Utils.Array.GetRandom(patterns);

        // Spawn formation
        this.spawnFormation(pattern, cappedCount);

        // Schedule next wave
        this.nextWaveTime = time + this.config.waveInterval;

        console.log(`🌊 Wave ${this.currentWave} spawned: ${cappedCount} enemies (${pattern})`);
    }

    /**
     * Spawn enemies in formation
     */
    spawnFormation(pattern, count) {
        // Calculate spawn position (ahead of player, off-screen top)
        const baseY = -100; // Off-screen at top
        const centerX = this.config.roadCenter;
        const roadWidth = this.config.roadWidth * 0.8; // Keep enemies within road

        const positions = this.getFormationPositions(pattern, count, centerX, baseY, roadWidth);

        // Spawn enemies at each position
        positions.forEach(pos => {
            this.spawnEnemy(pos.x, pos.y);
        });
    }

    /**
     * Calculate formation positions
     */
    getFormationPositions(pattern, count, centerX, baseY, width) {
        const positions = [];
        const spacing = 50; // Pixels between enemies

        switch (pattern) {
            case 'line':
                // Horizontal line
                const lineWidth = (count - 1) * spacing;
                const lineStartX = centerX - lineWidth / 2;
                for (let i = 0; i < count; i++) {
                    positions.push({
                        x: lineStartX + (i * spacing),
                        y: baseY
                    });
                }
                break;

            case 'grid':
                // Grid formation (2 rows)
                const cols = Math.ceil(count / 2);
                const rows = Math.min(2, count);
                const gridWidth = (cols - 1) * spacing;
                const gridStartX = centerX - gridWidth / 2;

                let enemyIndex = 0;
                for (let row = 0; row < rows && enemyIndex < count; row++) {
                    for (let col = 0; col < cols && enemyIndex < count; col++) {
                        positions.push({
                            x: gridStartX + (col * spacing),
                            y: baseY + (row * spacing)
                        });
                        enemyIndex++;
                    }
                }
                break;

            case 'scatter':
                // Random scattered positions
                for (let i = 0; i < count; i++) {
                    positions.push({
                        x: centerX + Phaser.Math.Between(-width / 2, width / 2),
                        y: baseY + Phaser.Math.Between(-50, 100)
                    });
                }
                break;

            case 'circle':
                // Circular formation
                const radius = 80;
                const angleStep = (Math.PI * 2) / count;
                for (let i = 0; i < count; i++) {
                    const angle = i * angleStep;
                    positions.push({
                        x: centerX + Math.cos(angle) * radius,
                        y: baseY + Math.sin(angle) * radius
                    });
                }
                break;

            case 'arrow':
                // Arrow/V formation pointing at player
                const halfCount = Math.floor(count / 2);
                for (let i = 0; i < count; i++) {
                    const side = i < halfCount ? -1 : 1;
                    const offset = (i < halfCount ? i : i - halfCount) * spacing;
                    positions.push({
                        x: centerX + (side * offset),
                        y: baseY - (offset * 0.5) // Diagonal
                    });
                }
                break;

            default:
                // Fallback to line
                for (let i = 0; i < count; i++) {
                    positions.push({
                        x: centerX + (i - count / 2) * spacing,
                        y: baseY
                    });
                }
        }

        return positions;
    }

    /**
     * Spawn single enemy
     */
    spawnEnemy(x, y, type = null) {
        // Choose enemy type randomly if not specified
        if (!type) {
            type = this.getRandomEnemyType();
        }

        // Create enemy
        const enemy = new Enemy(this.scene, x, y, type);
        this.enemies.push(enemy);
        this.totalEnemiesSpawned++;

        return enemy;
    }

    /**
     * Get random enemy type based on weights
     */
    getRandomEnemyType() {
        const rand = Math.random() * 100;
        let cumulative = 0;

        for (const [type, weight] of Object.entries(this.enemyTypeWeights)) {
            cumulative += weight;
            if (rand <= cumulative) {
                return type;
            }
        }

        return 'SOLDIER'; // Fallback
    }

    /**
     * Get all active enemies (for collision detection)
     */
    getActiveEnemies() {
        return this.enemies.filter(enemy => enemy.active && !enemy.isDestroyed);
    }

    /**
     * Get enemy count
     */
    getEnemyCount() {
        return this.enemies.filter(enemy => enemy.active).length;
    }

    /**
     * Get stats for UI
     */
    getStats() {
        return {
            active: this.getEnemyCount(),
            spawned: this.totalEnemiesSpawned,
            killed: this.totalEnemiesKilled,
            currentWave: this.currentWave
        };
    }

    /**
     * Clear all enemies (for stage transitions)
     */
    clear() {
        this.enemies.forEach(enemy => enemy.destroy());
        this.enemies = [];
    }

    /**
     * Reset for new stage
     */
    reset() {
        this.clear();
        this.currentWave = 0;
        this.nextWaveTime = 0;
        this.totalEnemiesSpawned = 0;
        this.totalEnemiesKilled = 0;
    }

    /**
     * Pause spawning
     */
    pauseSpawning() {
        this.nextWaveTime = Infinity;
    }

    /**
     * Resume spawning
     */
    resumeSpawning(time) {
        this.nextWaveTime = time + this.config.waveInterval;
    }

    /**
     * Cleanup
     */
    destroy() {
        this.clear();
    }
}
