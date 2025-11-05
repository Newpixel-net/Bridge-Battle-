/**
 * LevelProgression - 4-phase level system that controls game difficulty
 * Phase 1: Growth (focus on gates, build your squad)
 * Phase 2: Combat (enemies appear, mix of gates and combat)
 * Phase 3: Complex (double/triple gates, more enemies, obstacles)
 * Phase 4: Boss (final challenging section with boss enemy)
 */

export class LevelPhase {
    constructor(name, startDistance, endDistance, config) {
        this.name = name;
        this.startDistance = startDistance;
        this.endDistance = endDistance;
        this.config = config;
        this.active = false;
        this.completed = false;
    }

    isInPhase(distance) {
        return distance >= this.startDistance && distance < this.endDistance;
    }

    getSpawnConfig() {
        return this.config;
    }
}

export class LevelProgressionManager {
    constructor(game) {
        this.game = game;
        this.currentPhase = null;
        this.phases = [];

        this.initializePhases();
    }

    initializePhases() {
        // Phase 1: Growth (0-300 units) - Focus on building squad
        this.phases.push(new LevelPhase('Growth', 0, 300, {
            gateProbability: 0.7,      // 70% chance of gates
            obstacleProbability: 0.3,  // 30% chance of obstacles
            enemyProbability: 0.0,     // No enemies
            gateSpawnInterval: 6000,   // Spawn gates every 6 seconds
            obstacleSpawnInterval: 4000, // Spawn obstacles every 4 seconds
            gateValueRange: { min: 1, max: 10 },  // Positive gates
            multiGate: false,          // Single gates only
            description: '🌱 Phase 1: GROWTH - Build your squad!'
        }));

        // Phase 2: Combat (300-600 units) - Introduction to enemies
        this.phases.push(new LevelPhase('Combat', 300, 600, {
            gateProbability: 0.4,      // 40% gates
            obstacleProbability: 0.3,  // 30% obstacles
            enemyProbability: 0.3,     // 30% enemies
            gateSpawnInterval: 8000,   // Gates less frequent
            obstacleSpawnInterval: 3000,
            enemySpawnInterval: 12000, // Enemies every 12 seconds
            gateValueRange: { min: -5, max: 15 },  // Mix of positive/negative
            multiGate: false,
            description: '⚔️ Phase 2: COMBAT - Fight the red soldiers!'
        }));

        // Phase 3: Complex (600-900 units) - Multi-gates and chaos
        this.phases.push(new LevelPhase('Complex', 600, 900, {
            gateProbability: 0.35,
            obstacleProbability: 0.3,
            enemyProbability: 0.35,
            gateSpawnInterval: 7000,
            obstacleSpawnInterval: 2500,
            enemySpawnInterval: 10000, // More frequent enemies
            gateValueRange: { min: -10, max: 20 },
            multiGate: true,           // Enable double/triple gates!
            multiGateProbability: 0.4, // 40% chance of multi-gate
            description: '🌀 Phase 3: COMPLEX - Master the multi-gates!'
        }));

        // Phase 4: Boss (900-1000 units) - Final challenge
        this.phases.push(new LevelPhase('Boss', 900, 1000, {
            gateProbability: 0.2,      // Few gates
            obstacleProbability: 0.3,
            enemyProbability: 0.5,     // Many enemies!
            gateSpawnInterval: 10000,  // Rare gates
            obstacleSpawnInterval: 2000, // Frequent obstacles
            enemySpawnInterval: 6000,  // Very frequent enemies
            gateValueRange: { min: -15, max: 25 },
            multiGate: true,
            multiGateProbability: 0.6, // 60% multi-gates
            bossMode: true,
            description: '👹 Phase 4: BOSS - Survive the onslaught!'
        }));

        console.log('📊 Level Progression System initialized with 4 phases');
        this.logPhaseInfo();
    }

    logPhaseInfo() {
        console.log('');
        console.log('=== LEVEL PHASES ===');
        this.phases.forEach((phase, i) => {
            console.log(`Phase ${i + 1}: ${phase.name} (${phase.startDistance}-${phase.endDistance}m)`);
            console.log(`  ${phase.config.description}`);
        });
        console.log('===================');
        console.log('');
    }

    update(playerDistance) {
        // Check which phase we're in
        const newPhase = this.phases.find(phase => phase.isInPhase(playerDistance));

        // Phase change detected
        if (newPhase && newPhase !== this.currentPhase) {
            this.onPhaseChange(newPhase);
        }

        this.currentPhase = newPhase;
        return this.currentPhase;
    }

    onPhaseChange(newPhase) {
        console.log('');
        console.log(`🎯 === PHASE CHANGE === 🎯`);
        console.log(newPhase.config.description);
        console.log(`Distance: ${newPhase.startDistance}-${newPhase.endDistance}m`);
        console.log('========================');
        console.log('');

        // Show phase change message to player
        if (this.game.ui.scoreElement) {
            const phaseText = document.createElement('div');
            phaseText.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 64px;
                font-weight: bold;
                color: #FFD700;
                text-shadow: 4px 4px 8px rgba(0,0,0,0.9);
                z-index: 1000;
                text-align: center;
                pointer-events: none;
                animation: phaseAnnounce 3s ease-out forwards;
            `;
            phaseText.textContent = newPhase.config.description;

            // Add CSS animation
            if (!document.getElementById('phase-animation-style')) {
                const style = document.createElement('style');
                style.id = 'phase-animation-style';
                style.textContent = `
                    @keyframes phaseAnnounce {
                        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
                        20% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
                        80% { opacity: 1; transform: translate(-50%, -50%) scale(1.0); }
                        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                    }
                `;
                document.head.appendChild(style);
            }

            document.body.appendChild(phaseText);
            setTimeout(() => phaseText.remove(), 3000);
        }

        // Trigger camera shake
        if (this.game.cameraShake) {
            this.game.cameraShake.intensity = 0.8;
        }
    }

    getCurrentPhaseConfig() {
        return this.currentPhase ? this.currentPhase.config : null;
    }

    shouldSpawnGate(timeSinceLastGate) {
        if (!this.currentPhase) return false;
        const config = this.currentPhase.config;
        return timeSinceLastGate > config.gateSpawnInterval &&
               Math.random() < config.gateProbability;
    }

    shouldSpawnObstacle(timeSinceLastObstacle) {
        if (!this.currentPhase) return false;
        const config = this.currentPhase.config;
        return timeSinceLastObstacle > config.obstacleSpawnInterval &&
               Math.random() < config.obstacleProbability;
    }

    shouldSpawnEnemy(timeSinceLastEnemy) {
        if (!this.currentPhase) return false;
        const config = this.currentPhase.config;
        return config.enemyProbability > 0 &&
               config.enemySpawnInterval &&
               timeSinceLastEnemy > config.enemySpawnInterval &&
               Math.random() < config.enemyProbability;
    }

    getGateValue() {
        if (!this.currentPhase) return 5;
        const config = this.currentPhase.config;
        const range = config.gateValueRange;
        return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    }

    shouldUseMultiGate() {
        if (!this.currentPhase) return false;
        const config = this.currentPhase.config;
        return config.multiGate &&
               Math.random() < (config.multiGateProbability || 0);
    }

    getPhaseProgress() {
        if (!this.currentPhase) return 0;
        const phase = this.currentPhase;
        const progress = (this.game.distance - phase.startDistance) /
                        (phase.endDistance - phase.startDistance);
        return Math.max(0, Math.min(1, progress));
    }

    getCurrentPhaseName() {
        return this.currentPhase ? this.currentPhase.name : 'Unknown';
    }

    getCurrentPhaseNumber() {
        if (!this.currentPhase) return 0;
        return this.phases.indexOf(this.currentPhase) + 1;
    }

    getTotalPhases() {
        return this.phases.length;
    }

    isInBossPhase() {
        return this.currentPhase && this.currentPhase.config.bossMode === true;
    }

    getDistanceToNextPhase() {
        if (!this.currentPhase) return 0;
        const currentIndex = this.phases.indexOf(this.currentPhase);
        if (currentIndex >= this.phases.length - 1) return 0; // Last phase
        const nextPhase = this.phases[currentIndex + 1];
        return Math.max(0, nextPhase.startDistance - this.game.distance);
    }
}

export default LevelProgressionManager;
