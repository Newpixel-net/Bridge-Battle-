import Phaser from 'phaser';
import {
    SCENES, WORLD, PLAYER, SHOOTING, GATES, OBSTACLES,
    CAMERA, COLORS, UI, GAME
} from '../utils/Constants.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.GAME });
    }

    init() {
        // Game state
        this.score = 0;
        this.level = 1;
        this.gameOver = false;
        this.distanceTraveled = 0;

        // Squad
        this.squadSize = PLAYER.SQUAD_START_SIZE;
        this.squadMembers = [];
        this.squadCenter = { x: 0, y: 0 };

        // Shooting
        this.bullets = [];
        this.lastShootTime = 0;

        // Spawn tracking
        this.lastGateSpawn = 0;
        this.lastObstacleSpawn = 0;

        // Input
        this.inputX = 0;
        this.isDragging = false;
    }

    create() {
        console.log('🎮 Game Scene Started');

        // Set up world bounds
        this.physics.world.setBounds(
            -WORLD.BRIDGE_WIDTH / 2,
            0,
            WORLD.BRIDGE_WIDTH,
            WORLD.BRIDGE_LENGTH
        );

        // Create environment
        this.createBridge();

        // Create squad
        this.createSquad();

        // Set up camera
        this.setupCamera();

        // Set up input
        this.setupInput();

        // Create groups
        this.obstaclesGroup = this.physics.add.group();
        this.gatesGroup = this.physics.add.group();
        this.bulletsGroup = this.physics.add.group();

        // Set up collisions
        this.setupCollisions();

        // Start game
        this.emitEvent('squadUpdate', this.squadSize);
        this.emitEvent('scoreUpdate', this.score);
    }

    update(time, delta) {
        if (this.gameOver) return;

        // Update distance
        this.distanceTraveled += WORLD.SCROLL_SPEED * (delta / 1000);

        // Update squad
        this.updateSquad(delta);

        // Auto-shoot
        this.autoShoot(time);

        // Update bullets
        this.updateBullets();

        // Spawn obstacles and gates
        this.spawnObjects();

        // Camera follow
        this.updateCamera();

        // Check if reached end
        if (this.distanceTraveled >= WORLD.BRIDGE_LENGTH) {
            this.levelComplete();
        }
    }

    createBridge() {
        const graphics = this.add.graphics();

        // Draw bridge road
        graphics.fillStyle(COLORS.BRIDGE.ROAD);
        graphics.fillRect(
            -WORLD.BRIDGE_WIDTH / 2,
            -100,
            WORLD.BRIDGE_WIDTH,
            WORLD.BRIDGE_LENGTH + 200
        );

        // Draw lane markings
        graphics.lineStyle(2, COLORS.BRIDGE.LINES, 0.5);
        for (let y = 0; y < WORLD.BRIDGE_LENGTH; y += 40) {
            graphics.lineBetween(0, y, 0, y + 20);
        }

        // Draw bridge edges
        graphics.lineStyle(4, COLORS.BRIDGE.PILLAR);
        graphics.lineBetween(-WORLD.BRIDGE_WIDTH / 2, 0, -WORLD.BRIDGE_WIDTH / 2, WORLD.BRIDGE_LENGTH);
        graphics.lineBetween(WORLD.BRIDGE_WIDTH / 2, 0, WORLD.BRIDGE_WIDTH / 2, WORLD.BRIDGE_LENGTH);

        // Add some pillars
        for (let y = 100; y < WORLD.BRIDGE_LENGTH; y += 150) {
            const pillarLeft = this.add.rectangle(-WORLD.BRIDGE_WIDTH / 2, y, 8, 50, COLORS.BRIDGE.PILLAR);
            const pillarRight = this.add.rectangle(WORLD.BRIDGE_WIDTH / 2, y, 8, 50, COLORS.BRIDGE.PILLAR);
        }

        // Water (simple background)
        const water = this.add.rectangle(0, WORLD.BRIDGE_LENGTH / 2, WORLD.BRIDGE_WIDTH * 2, WORLD.BRIDGE_LENGTH, COLORS.WATER);
        water.setDepth(-10);
    }

    createSquad() {
        // Create squad members in formation
        for (let i = 0; i < this.squadSize; i++) {
            this.addSquadMember();
        }

        // Set initial position
        this.squadCenter.x = 0;
        this.squadCenter.y = 50;
    }

    addSquadMember() {
        const member = this.physics.add.sprite(0, 0, 'placeholder-squad');
        member.setScale(PLAYER.CHARACTER_SIZE);
        member.setDepth(10);
        this.squadMembers.push(member);
    }

    removeSquadMember() {
        if (this.squadMembers.length > 0) {
            const member = this.squadMembers.pop();

            // Death animation
            this.tweens.add({
                targets: member,
                alpha: 0,
                scale: 0,
                duration: 300,
                onComplete: () => member.destroy()
            });
        }
    }

    updateSquad(delta) {
        // Handle input movement
        if (this.isDragging) {
            const targetX = Phaser.Math.Clamp(
                this.inputX,
                -WORLD.BRIDGE_WIDTH / 2 + 2,
                WORLD.BRIDGE_WIDTH / 2 - 2
            );

            this.squadCenter.x = Phaser.Math.Linear(
                this.squadCenter.x,
                targetX,
                PLAYER.MOVE_SPEED * (delta / 1000)
            );
        }

        // Move forward
        this.squadCenter.y += WORLD.SCROLL_SPEED;

        // Update member positions (blob formation)
        this.updateFormation();
    }

    updateFormation() {
        const memberCount = this.squadMembers.length;
        if (memberCount === 0) return;

        // Calculate grid formation
        const cols = Math.ceil(Math.sqrt(memberCount));
        const spacing = PLAYER.FORMATION_SPACING;

        this.squadMembers.forEach((member, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;

            // Calculate offset from center
            const offsetX = (col - (cols - 1) / 2) * spacing;
            const offsetY = (row - Math.floor(memberCount / cols) / 2) * spacing;

            // Target position
            const targetX = this.squadCenter.x + offsetX;
            const targetY = this.squadCenter.y + offsetY;

            // Lerp to position
            member.x = Phaser.Math.Linear(member.x, targetX, 0.1);
            member.y = Phaser.Math.Linear(member.y, targetY, 0.1);
        });
    }

    autoShoot(time) {
        // Each squad member shoots at intervals
        if (time - this.lastShootTime > SHOOTING.FIRE_RATE) {
            this.squadMembers.forEach(member => {
                this.shootBullet(member.x, member.y);
            });

            this.lastShootTime = time;
        }
    }

    shootBullet(x, y) {
        // Create bullet
        const bullet = this.physics.add.sprite(x, y, 'placeholder-bullet');
        bullet.setScale(1.5);
        bullet.setDepth(5);

        // Bullet color based on squad size
        let tint = COLORS.BULLET.SQUAD_1_5;
        if (this.squadSize >= 16) tint = COLORS.BULLET.SQUAD_16_PLUS;
        else if (this.squadSize >= 11) tint = COLORS.BULLET.SQUAD_11_15;
        else if (this.squadSize >= 6) tint = COLORS.BULLET.SQUAD_6_10;

        bullet.setTint(tint);

        // Set velocity
        bullet.setVelocity(0, SHOOTING.BULLET_SPEED * 60);

        // Add to group
        this.bulletsGroup.add(bullet);

        // Auto-destroy after lifetime
        this.time.delayedCall(SHOOTING.BULLET_LIFETIME, () => {
            if (bullet.active) bullet.destroy();
        });
    }

    updateBullets() {
        // Remove bullets that are off-screen
        this.bulletsGroup.children.entries.forEach(bullet => {
            if (bullet.y > this.squadCenter.y + 100) {
                bullet.destroy();
            }
        });
    }

    spawnObjects() {
        const spawnY = this.squadCenter.y + 600; // Spawn ahead of player

        // Spawn gates
        if (this.distanceTraveled - this.lastGateSpawn > GATES.SPAWN_INTERVAL_MIN) {
            this.spawnGate(spawnY);
            this.lastGateSpawn = this.distanceTraveled;
        }

        // Spawn obstacles
        if (this.distanceTraveled - this.lastObstacleSpawn > OBSTACLES.SPAWN_INTERVAL_MIN) {
            this.spawnObstacle(spawnY);
            this.lastObstacleSpawn = this.distanceTraveled;
        }
    }

    spawnGate(y) {
        const value = Phaser.Math.Between(GATES.VALUES.MIN, GATES.VALUES.MAX);
        const isPositive = value > 0;

        const gate = this.physics.add.sprite(
            0,
            y,
            isPositive ? 'placeholder-gate-positive' : 'placeholder-gate-negative'
        );

        gate.setDisplaySize(WORLD.BRIDGE_WIDTH, 150);
        gate.setDepth(2);
        gate.setAlpha(0.7);
        gate.setData('value', value);
        gate.setData('hp', 100); // Can be shot

        // Add text
        const text = this.add.text(gate.x, gate.y, `${value > 0 ? '+' : ''}${value}`, {
            fontSize: '72px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        });
        text.setOrigin(0.5);
        text.setDepth(3);
        gate.setData('text', text);

        this.gatesGroup.add(gate);

        // Pulse animation
        this.tweens.add({
            targets: gate,
            alpha: { from: 0.7, to: 0.9 },
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
    }

    spawnObstacle(y) {
        const x = Phaser.Math.Between(-WORLD.BRIDGE_WIDTH / 4, WORLD.BRIDGE_WIDTH / 4);
        const hp = Phaser.Math.Between(OBSTACLES.HP_MIN, OBSTACLES.HP_MAX);

        const obstacle = this.physics.add.sprite(x, y, 'placeholder-obstacle-tire');
        obstacle.setScale(1.5);
        obstacle.setDepth(4);
        obstacle.setData('hp', hp);
        obstacle.setData('maxHp', hp);

        // HP text
        const hpText = this.add.text(obstacle.x, obstacle.y - 60, hp.toString(), {
            fontSize: '42px',
            fontFamily: 'Arial',
            color: '#FFD700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        });
        hpText.setOrigin(0.5);
        hpText.setDepth(5);
        obstacle.setData('hpText', hpText);

        this.obstaclesGroup.add(obstacle);
    }

    setupCollisions() {
        // Bullets hit obstacles
        this.physics.add.overlap(
            this.bulletsGroup,
            this.obstaclesGroup,
            this.bulletHitObstacle,
            null,
            this
        );

        // Bullets hit gates
        this.physics.add.overlap(
            this.bulletsGroup,
            this.gatesGroup,
            this.bulletHitGate,
            null,
            this
        );

        // Squad collides with gates
        this.physics.add.overlap(
            this.squadMembers,
            this.gatesGroup,
            this.squadHitGate,
            null,
            this
        );
    }

    bulletHitObstacle(bullet, obstacle) {
        bullet.destroy();

        // Damage obstacle
        const hp = obstacle.getData('hp');
        const newHp = hp - SHOOTING.BULLET_DAMAGE;

        obstacle.setData('hp', newHp);

        // Update HP text
        const hpText = obstacle.getData('hpText');
        if (hpText) {
            hpText.setText(Math.max(0, newHp).toString());

            // Pulse text
            this.tweens.add({
                targets: hpText,
                scale: { from: 1.2, to: 1 },
                duration: 100
            });
        }

        // Show damage number
        this.showDamageNumber(obstacle.x, obstacle.y - 80, SHOOTING.BULLET_DAMAGE);

        // Destroy if HP <= 0
        if (newHp <= 0) {
            this.destroyObstacle(obstacle);
        }
    }

    bulletHitGate(bullet, gate) {
        bullet.destroy();

        // Increase gate value
        if (GATES.SHOOT_TO_INCREASE) {
            const hp = gate.getData('hp') - SHOOTING.BULLET_DAMAGE;
            gate.setData('hp', hp);

            if (hp <= 0) {
                let value = gate.getData('value');
                value += GATES.INCREASE_PER_10_DAMAGE;
                gate.setData('value', value);
                gate.setData('hp', 100); // Reset HP

                // Update text
                const text = gate.getData('text');
                if (text) {
                    text.setText(`${value > 0 ? '+' : ''}${value}`);

                    // Flash effect
                    this.tweens.add({
                        targets: text,
                        scale: { from: 1.3, to: 1 },
                        duration: 200
                    });
                }
            }
        }
    }

    squadHitGate(member, gate) {
        // Only trigger once per gate
        if (gate.getData('triggered')) return;

        gate.setData('triggered', true);

        const value = gate.getData('value');
        const newSquadSize = this.squadSize + value;

        console.log(`Gate hit: ${value}, Squad: ${this.squadSize} → ${newSquadSize}`);

        // Check game over
        if (newSquadSize <= 0) {
            this.endGame();
            return;
        }

        // Update squad size
        if (value > 0) {
            // Add members
            for (let i = 0; i < value; i++) {
                this.addSquadMember();
            }
        } else {
            // Remove members
            for (let i = 0; i < Math.abs(value); i++) {
                this.removeSquadMember();
            }
        }

        this.squadSize = newSquadSize;
        this.emitEvent('squadUpdate', this.squadSize);

        // Destroy gate
        const text = gate.getData('text');
        if (text) text.destroy();
        gate.destroy();

        // Screen shake for negative gates
        if (value < 0) {
            this.cameras.main.shake(200, 0.01);
        }
    }

    destroyObstacle(obstacle) {
        const hpText = obstacle.getData('hpText');
        if (hpText) hpText.destroy();

        // Explosion effect
        this.createExplosion(obstacle.x, obstacle.y);

        // Award points
        const points = obstacle.getData('maxHp');
        this.addScore(points);

        // Screen shake
        this.cameras.main.shake(100, 0.005);

        obstacle.destroy();
    }

    createExplosion(x, y) {
        // Simple particle explosion
        for (let i = 0; i < 10; i++) {
            const particle = this.add.circle(x, y, 5, 0xFFAA00);
            particle.setDepth(20);

            const angle = (Math.PI * 2 * i) / 10;
            const speed = Phaser.Math.Between(100, 200);

            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * speed,
                y: y + Math.sin(angle) * speed,
                alpha: 0,
                duration: 500,
                onComplete: () => particle.destroy()
            });
        }
    }

    showDamageNumber(x, y, damage) {
        const text = this.add.text(x, y, damage.toString(), {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#FFD700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        });
        text.setOrigin(0.5);
        text.setDepth(25);

        this.tweens.add({
            targets: text,
            y: y - 50,
            alpha: 0,
            duration: 1000,
            ease: 'Cubic.easeOut',
            onComplete: () => text.destroy()
        });
    }

    addScore(points) {
        this.score += points;
        this.emitEvent('scoreUpdate', this.score);
    }

    setupCamera() {
        this.cameras.main.setBounds(
            -WORLD.BRIDGE_WIDTH,
            0,
            WORLD.BRIDGE_WIDTH * 2,
            WORLD.BRIDGE_LENGTH
        );
    }

    updateCamera() {
        // Smooth follow squad
        const targetY = this.squadCenter.y - 300;
        const currentY = this.cameras.main.scrollY;

        this.cameras.main.scrollY = Phaser.Math.Linear(currentY, targetY, CAMERA.FOLLOW_LERP);
        this.cameras.main.scrollX = this.squadCenter.x - GAME.WIDTH / 2;
    }

    setupInput() {
        // Mouse/Touch input
        this.input.on('pointerdown', (pointer) => {
            this.isDragging = true;
            this.inputX = pointer.worldX;
        });

        this.input.on('pointermove', (pointer) => {
            if (this.isDragging) {
                this.inputX = pointer.worldX;
            }
        });

        this.input.on('pointerup', () => {
            this.isDragging = false;
        });

        // Keyboard fallback
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    levelComplete() {
        console.log('🎉 Level Complete!');

        this.level++;
        this.emitEvent('levelUpdate', this.level);

        // Reset for next level
        this.distanceTraveled = 0;
        this.squadCenter.y = 50;

        // Could reload level or generate new one
    }

    endGame() {
        console.log('💀 Game Over');

        this.gameOver = true;

        // Freeze everything
        this.physics.pause();

        // Show game over
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const gameOverText = this.add.text(width / 2, height / 2 - 100, 'GAME OVER', {
            fontSize: '96px',
            fontFamily: 'Arial',
            color: '#FF4444',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 8
        });
        gameOverText.setOrigin(0.5);
        gameOverText.setScrollFactor(0);
        gameOverText.setDepth(100);

        const finalScore = this.add.text(width / 2, height / 2 + 20, `Final Score: ${this.score}`, {
            fontSize: '48px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            fontStyle: 'bold'
        });
        finalScore.setOrigin(0.5);
        finalScore.setScrollFactor(0);
        finalScore.setDepth(100);

        const restartText = this.add.text(width / 2, height / 2 + 100, 'Click to Restart', {
            fontSize: '36px',
            fontFamily: 'Arial',
            color: '#AAAAAA'
        });
        restartText.setOrigin(0.5);
        restartText.setScrollFactor(0);
        restartText.setDepth(100);

        // Restart on click
        this.input.once('pointerdown', () => {
            this.scene.stop(SCENES.UI);
            this.scene.restart();
            this.scene.launch(SCENES.UI);
        });
    }

    emitEvent(event, data) {
        this.events.emit(event, data);
    }

    shutdown() {
        // Clean up
        this.input.off('pointerdown');
        this.input.off('pointermove');
        this.input.off('pointerup');
    }
}
