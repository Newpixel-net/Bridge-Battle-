import Phaser from 'phaser';
import { GAME } from '../utils/GameConstants.js';

/**
 * WaveManager - Handles 10 waves + 1 boss wave per stage
 * Based on screenshot specifications
 */
export default class WaveManager {
    constructor(scene, stageNumber = 1) {
        this.scene = scene;
        this.stageNumber = stageNumber;

        this.currentWave = 0;
        this.totalWaves = 11;      // 10 regular + 1 boss
        this.wavesPerStage = 10;   // Regular waves before boss

        this.isWaveActive = false;
        this.waveDelay = 3000;     // 3 seconds between waves

        this.activeEnemies = [];
        this.waveDefinitions = this.generateWaveDefinitions();

        console.log(`✓ WaveManager initialized for Stage ${stageNumber}`);
    }

    /**
     * Generate all 11 wave definitions for this stage
     */
    generateWaveDefinitions() {
        const waves = [];

        // WAVES 1-10: Regular Enemy Waves
        for (let i = 1; i <= this.wavesPerStage; i++) {
            waves.push(this.createRegularWave(i));
        }

        // WAVE 11: Mini-Boss Wave
        waves.push(this.createBossWave());

        return waves;
    }

    /**
     * Create definition for a regular wave
     * COUNT MASTERS STYLE: Enemies are STATIONARY obstacles at fixed positions
     */
    createRegularWave(waveNumber) {
        // Wave difficulty increases
        const baseEnemyCount = 20;
        const enemyCount = baseEnemyCount + (waveNumber * 2);  // 20, 22, 24...

        // Mix enemy types based on wave number
        let regularCount = enemyCount;
        let eliteCount = 0;

        if (waveNumber >= 5) {
            // Introduce elites after wave 5
            eliteCount = Math.floor(enemyCount * 0.2);  // 20% are elites
            regularCount = enemyCount - eliteCount;
        }

        // FIXED SPAWN POSITIONS: Between gates on the path
        // Gates at: 400, 1200, 2000, 2800, 3600, 4400, 5200, 6000, 6800, 7600
        // Enemies at: 700, 1500, 2300, 3100, 3900, 4700, 5500, 6300, 7100, 7900
        const spawnPositions = [700, 1500, 2300, 3100, 3900, 4700, 5500, 6300, 7100, 7900];

        return {
            waveNumber: waveNumber,
            type: 'regular',
            spawnY: spawnPositions[waveNumber - 1], // Fixed Y position on path
            enemies: [
                {
                    type: 'SOLDIER',
                    count: regularCount,
                    formation: this.getFormationType(waveNumber)
                },
                {
                    type: 'TANK',
                    count: eliteCount,
                    formation: 'line'
                }
            ],
            spawnDelay: 100           // ms between each enemy spawn (for formation)
            // NO advanceSpeed - enemies are STATIONARY obstacles!
        };
    }

    /**
     * Create definition for boss wave
     */
    createBossWave() {
        return {
            waveNumber: 11,
            type: 'boss',
            boss: {
                type: 'MINI_BOSS',
                hp: 200 + (this.stageNumber * 50),  // Scales with stage
                damage: 5,
                speed: 40
            },
            minions: {
                type: 'SOLDIER',
                count: 10,
                formation: 'circle'  // Surrounds boss
            }
        };
    }

    /**
     * Get formation type for wave (rotates through types)
     */
    getFormationType(waveNumber) {
        const formations = [
            'scattered',    // Random positions
            'line',         // Horizontal line
            'columns',      // Vertical columns
            'wedge',        // V formation
            'circle'        // Circular formation
        ];

        return formations[waveNumber % formations.length];
    }

    /**
     * Start the next wave
     */
    startNextWave() {
        if (this.currentWave >= this.totalWaves) {
            this.completeStage();
            return;
        }

        this.currentWave++;
        const waveData = this.waveDefinitions[this.currentWave - 1];

        // Show wave announcement
        this.announceWave(waveData);

        // Spawn wave after delay
        this.scene.time.delayedCall(1500, () => {
            this.spawnWave(waveData);
        });
    }

    /**
     * Show wave announcement UI
     */
    announceWave(waveData) {
        const centerX = GAME.WIDTH / 2;
        const centerY = GAME.HEIGHT / 2;

        let message = '';
        if (waveData.type === 'boss') {
            message = '⚠️ BOSS WAVE! ⚠️';
        } else {
            message = `Wave ${waveData.waveNumber} / ${this.wavesPerStage}`;
        }

        // Create announcement text
        const announcement = this.scene.add.text(
            centerX, centerY,
            message,
            {
                fontSize: waveData.type === 'boss' ? '64px' : '48px',
                fontFamily: 'Arial Black',
                color: waveData.type === 'boss' ? '#FF0000' : '#FFD700',
                stroke: '#000000',
                strokeThickness: 8
            }
        ).setOrigin(0.5);

        announcement.setDepth(5000);
        announcement.setScrollFactor(0);
        announcement.setResolution(2);

        // Animate in
        announcement.setScale(0);
        this.scene.tweens.add({
            targets: announcement,
            scale: 1,
            duration: 300,
            ease: 'Back.easeOut',
            onComplete: () => {
                // Fade out after 1 second
                this.scene.tweens.add({
                    targets: announcement,
                    alpha: 0,
                    scale: 1.5,
                    duration: 500,
                    delay: 1000,
                    onComplete: () => announcement.destroy()
                });
            }
        });

        // Flash for boss wave
        if (waveData.type === 'boss') {
            this.scene.cameras.main.flash(500, 255, 0, 0);
        }
    }

    /**
     * Spawn a wave
     */
    spawnWave(waveData) {
        this.isWaveActive = true;

        if (waveData.type === 'boss') {
            this.spawnBossWave(waveData);
        } else {
            this.spawnRegularWave(waveData);
        }
    }

    /**
     * Spawn regular enemy wave
     * COUNT MASTERS STYLE: Spawn at fixed Y position (stationary obstacles)
     */
    spawnRegularWave(waveData) {
        waveData.enemies.forEach(enemyGroup => {
            if (enemyGroup.count === 0) return;

            // Use fixed spawnY from wave data (700, 1500, 2300, etc.)
            const positions = this.calculateFormationPositions(
                enemyGroup.formation,
                enemyGroup.count,
                null,  // Use default centerX
                waveData.spawnY  // Fixed Y position for this wave
            );

            positions.forEach((pos, index) => {
                this.scene.time.delayedCall(
                    index * waveData.spawnDelay,
                    () => {
                        this.spawnEnemy(
                            enemyGroup.type,
                            pos.x,
                            pos.y,
                            0  // NO SPEED - enemies are stationary!
                        );
                    }
                );
            });
        });
    }

    /**
     * Spawn boss wave (dramatic entrance)
     */
    spawnBossWave(waveData) {
        // Boss spawns at top center
        const bossX = GAME.WIDTH / 2;
        const bossY = -150;

        // Spawn boss
        this.spawnBoss(waveData.boss, bossX, bossY);

        // Spawn minions in circle around boss after delay
        this.scene.time.delayedCall(1000, () => {
            const positions = this.calculateFormationPositions(
                waveData.minions.formation,
                waveData.minions.count,
                bossX,
                100  // Spawn at Y=100 (below boss)
            );

            positions.forEach((pos, index) => {
                this.scene.time.delayedCall(index * 100, () => {
                    this.spawnEnemy(waveData.minions.type, pos.x, pos.y, 80);
                });
            });
        });
    }

    /**
     * Calculate formation positions for enemies
     */
    calculateFormationPositions(formationType, count, centerX = null, centerY = null) {
        const positions = [];
        const screenWidth = GAME.WIDTH;
        const spawnY = centerY !== null ? centerY : -50;
        const formationCenterX = centerX !== null ? centerX : screenWidth / 2;

        switch(formationType) {
            case 'scattered':
                // Random positions across width
                for (let i = 0; i < count; i++) {
                    positions.push({
                        x: Phaser.Math.Between(100, screenWidth - 100),
                        y: spawnY - Phaser.Math.Between(0, 200)
                    });
                }
                break;

            case 'line':
                // Horizontal line
                const lineSpacing = Math.min(screenWidth / (count + 1), 60);
                const lineWidth = lineSpacing * (count - 1);
                const lineStartX = formationCenterX - lineWidth / 2;

                for (let i = 0; i < count; i++) {
                    positions.push({
                        x: lineStartX + (lineSpacing * i),
                        y: spawnY
                    });
                }
                break;

            case 'columns':
                // Vertical columns (3 columns)
                const columnCount = 3;
                const columnSpacing = screenWidth / (columnCount + 1);
                const rowSpacing = 60;

                for (let i = 0; i < count; i++) {
                    const column = i % columnCount;
                    const row = Math.floor(i / columnCount);

                    positions.push({
                        x: columnSpacing * (column + 1),
                        y: spawnY - (row * rowSpacing)
                    });
                }
                break;

            case 'wedge':
                // V formation
                const spread = 40;

                for (let i = 0; i < count; i++) {
                    const row = Math.floor(i / 2);
                    const side = i % 2 === 0 ? -1 : 1;

                    positions.push({
                        x: formationCenterX + (side * row * spread),
                        y: spawnY - (row * 50)
                    });
                }
                break;

            case 'circle':
                // Circular formation
                const radius = 100;

                for (let i = 0; i < count; i++) {
                    const angle = (i / count) * Math.PI * 2;
                    positions.push({
                        x: formationCenterX + Math.cos(angle) * radius,
                        y: spawnY + Math.sin(angle) * radius
                    });
                }
                break;
        }

        return positions;
    }

    /**
     * Spawn a single enemy
     */
    spawnEnemy(type, x, y, speed) {
        // Delegate to scene's enemy spawning
        const enemy = this.scene.spawnWaveEnemy(type, x, y, speed);
        if (enemy) {
            this.activeEnemies.push(enemy);
        }
        return enemy;
    }

    /**
     * Spawn boss
     */
    spawnBoss(bossData, x, y) {
        // Delegate to scene's boss spawning
        const boss = this.scene.spawnBoss(bossData, x, y);
        if (boss) {
            this.activeEnemies.push(boss);
        }
        return boss;
    }

    /**
     * Update - check if wave is complete
     */
    update() {
        if (!this.isWaveActive) return;

        // Remove destroyed enemies
        this.activeEnemies = this.activeEnemies.filter(enemy => enemy.active);

        // Check if wave is complete
        if (this.activeEnemies.length === 0) {
            this.onWaveComplete();
        }
    }

    /**
     * Called when all enemies in wave are defeated
     */
    onWaveComplete() {
        this.isWaveActive = false;

        // Show completion message
        this.showWaveCompleteMessage();

        // Wait before next wave
        this.scene.time.delayedCall(this.waveDelay, () => {
            this.startNextWave();
        });
    }

    /**
     * Show wave complete message
     */
    showWaveCompleteMessage() {
        const message = this.scene.add.text(
            GAME.WIDTH / 2,
            GAME.HEIGHT / 2,
            'Wave Complete!',
            {
                fontSize: '48px',
                fontFamily: 'Arial Black',
                color: '#00FF00',
                stroke: '#000000',
                strokeThickness: 6
            }
        ).setOrigin(0.5);

        message.setDepth(5000);
        message.setScrollFactor(0);
        message.setResolution(2);

        // Fade in/out
        message.setAlpha(0);
        this.scene.tweens.add({
            targets: message,
            alpha: 1,
            duration: 300,
            yoyo: true,
            hold: 500,
            onComplete: () => message.destroy()
        });
    }

    /**
     * Called when all waves (including boss) are complete
     */
    completeStage() {
        console.log('🎉 Stage Complete!');
        this.scene.showVictoryScreen();
    }

    /**
     * Called when an enemy is killed
     */
    onEnemyKilled(enemy) {
        const index = this.activeEnemies.indexOf(enemy);
        if (index > -1) {
            this.activeEnemies.splice(index, 1);
        }
    }

    /**
     * Get current wave info
     */
    getCurrentWaveInfo() {
        return {
            currentWave: this.currentWave,
            totalWaves: this.totalWaves,
            isActive: this.isWaveActive,
            enemiesRemaining: this.activeEnemies.length
        };
    }

    /**
     * Cleanup
     */
    destroy() {
        this.activeEnemies.forEach(enemy => {
            if (enemy.destroy) enemy.destroy();
        });
        this.activeEnemies = [];
    }
}
