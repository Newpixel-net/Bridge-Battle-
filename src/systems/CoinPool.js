import Phaser from 'phaser';

/**
 * CoinPool - Manages coin drops from defeated enemies
 *
 * VISUAL REFERENCE: From screenshots showing yellow star coins
 * - Yellow/gold star sprites
 * - Drop from enemies on death (30% chance)
 * - Animate toward player when nearby
 * - Auto-collect on contact
 *
 * FEATURES:
 * - Object pooling for performance
 * - Magnetic collection (moves toward player)
 * - Bounce animation on spawn
 * - Collection counter tracks total coins
 */
export default class CoinPool {
    constructor(scene, maxSize = 100) {
        this.scene = scene;
        this.maxSize = maxSize;
        this.coins = [];
        this.activeCoins = [];

        // Coin configuration
        this.config = {
            size: 12,                   // Coin radius
            color: 0xFFD700,            // Gold color
            glowColor: 0xFFFF00,        // Yellow glow
            dropChance: 0.30,           // 30% drop rate from regular enemies
            bossDropChance: 1.0,        // 100% drop rate from boss
            bossDropCount: 50,          // Boss drops 50 coins

            // Collection mechanics
            magnetRange: 150,           // Distance at which coins move toward player
            magnetSpeed: 300,           // Speed of magnetic pull
            collectionRange: 30,        // Distance for auto-collect

            // Animation
            bounceHeight: 20,           // Initial bounce height
            bounceDuration: 300,        // Bounce animation duration
            lifetime: 30000,            // 30 seconds before disappear

            // Visual
            pulseSpeed: 0.003,          // Pulse animation speed
            rotationSpeed: 2            // Rotation speed (radians/sec)
        };

        // Total coins collected (for UI display)
        this.totalCoinsCollected = 0;

        // Create pool
        this.initializePool();

        console.log(`✓ CoinPool created (max: ${maxSize} coins)`);
    }

    /**
     * Create pool of reusable coin objects
     */
    initializePool() {
        for (let i = 0; i < this.maxSize; i++) {
            const coin = this.createCoinObject();
            this.coins.push(coin);
        }
    }

    /**
     * Create a single coin object (star shape)
     */
    createCoinObject() {
        const coin = this.scene.add.container(0, 0);

        // Create 5-pointed star shape
        const starPoints = [];
        const numPoints = 5;
        const outerRadius = this.config.size;
        const innerRadius = this.config.size * 0.4;

        for (let i = 0; i < numPoints * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / numPoints - Math.PI / 2;
            starPoints.push(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius
            );
        }

        // Create star graphics
        const star = this.scene.add.graphics();
        star.fillStyle(this.config.color, 1.0);
        star.beginPath();
        star.moveTo(starPoints[0], starPoints[1]);
        for (let i = 2; i < starPoints.length; i += 2) {
            star.lineTo(starPoints[i], starPoints[i + 1]);
        }
        star.closePath();
        star.fillPath();

        // Glow effect
        const glow = this.scene.add.circle(
            0, 0,
            this.config.size * 1.5,
            this.config.glowColor,
            0.3
        );
        glow.setBlendMode(Phaser.BlendModes.ADD);

        // Add to container
        coin.add([glow, star]);
        coin.setDepth(20); // Above enemies

        // Store references
        coin.star = star;
        coin.glow = glow;

        // Coin state
        coin.active = false;
        coin.velocityX = 0;
        coin.velocityY = 0;
        coin.spawnTime = 0;
        coin.bouncing = false;

        // Hide initially
        coin.setVisible(false);

        return coin;
    }

    /**
     * Spawn a coin at position
     */
    spawn(x, y) {
        const coin = this.getCoin();
        if (!coin) return null; // Pool exhausted

        // Position coin
        coin.x = x;
        coin.y = y;
        coin.spawnY = y;

        // Random horizontal velocity for scatter effect
        coin.velocityX = Phaser.Math.Between(-50, 50);
        coin.velocityY = -100; // Initial upward velocity

        // Activate
        coin.active = true;
        coin.spawnTime = this.scene.time.now;
        coin.bouncing = true;
        coin.setVisible(true);
        coin.setScale(0.1);

        // Spawn animation - scale up and bounce
        this.scene.tweens.add({
            targets: coin,
            scaleX: 1,
            scaleY: 1,
            duration: this.config.bounceDuration,
            ease: 'Back.easeOut'
        });

        // Add to active list
        this.activeCoins.push(coin);

        return coin;
    }

    /**
     * Spawn multiple coins (for boss death)
     */
    spawnMultiple(x, y, count) {
        const coins = [];
        for (let i = 0; i < count; i++) {
            // Spread coins in a circle
            const angle = (i / count) * Math.PI * 2;
            const radius = 30;
            const spawnX = x + Math.cos(angle) * radius;
            const spawnY = y + Math.sin(angle) * radius;

            const coin = this.spawn(spawnX, spawnY);
            if (coin) {
                coins.push(coin);
            }
        }
        return coins;
    }

    /**
     * Get an inactive coin from pool
     */
    getCoin() {
        for (let coin of this.coins) {
            if (!coin.active) {
                return coin;
            }
        }
        return null; // Pool exhausted
    }

    /**
     * Return coin to pool
     */
    recycleCoin(coin) {
        coin.active = false;
        coin.setVisible(false);

        // Remove from active list
        const index = this.activeCoins.indexOf(coin);
        if (index !== -1) {
            this.activeCoins.splice(index, 1);
        }
    }

    /**
     * Collect a coin (add to total)
     */
    collectCoin(coin) {
        this.totalCoinsCollected++;
        this.recycleCoin(coin);

        // Collection effect - sparkle
        this.createCollectionEffect(coin.x, coin.y);

        console.log(`💰 Coin collected! Total: ${this.totalCoinsCollected}`);
    }

    /**
     * Create visual effect on collection
     */
    createCollectionEffect(x, y) {
        // Create small sparkle particles
        for (let i = 0; i < 5; i++) {
            const particle = this.scene.add.circle(x, y, 3, 0xFFFF00, 1);
            particle.setDepth(25);

            const angle = (i / 5) * Math.PI * 2;
            const speed = 100;

            this.scene.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * 30,
                y: y + Math.sin(angle) * 30,
                alpha: 0,
                duration: 300,
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
    }

    /**
     * Update all active coins
     */
    update(time, delta, playerX, playerY) {
        const dt = delta / 1000;

        for (let i = this.activeCoins.length - 1; i >= 0; i--) {
            const coin = this.activeCoins[i];

            if (!coin.active) continue;

            const elapsed = time - coin.spawnTime;

            // Check lifetime
            if (elapsed > this.config.lifetime) {
                this.recycleCoin(coin);
                continue;
            }

            // Bounce physics (first 300ms)
            if (coin.bouncing) {
                coin.velocityY += 500 * dt; // Gravity
                coin.y += coin.velocityY * dt;

                // Stop bouncing when back to spawn height
                if (coin.y >= coin.spawnY && elapsed > this.config.bounceDuration) {
                    coin.bouncing = false;
                    coin.y = coin.spawnY;
                    coin.velocityY = 0;
                }
            }

            // Apply horizontal velocity (deceleration)
            if (coin.velocityX !== 0) {
                coin.x += coin.velocityX * dt;
                coin.velocityX *= 0.95; // Friction
                if (Math.abs(coin.velocityX) < 1) {
                    coin.velocityX = 0;
                }
            }

            // Magnetic pull toward player
            if (!coin.bouncing && playerX !== undefined && playerY !== undefined) {
                const distToPlayer = Phaser.Math.Distance.Between(
                    coin.x, coin.y,
                    playerX, playerY
                );

                // Check collection
                if (distToPlayer < this.config.collectionRange) {
                    this.collectCoin(coin);
                    continue;
                }

                // Magnetic pull
                if (distToPlayer < this.config.magnetRange) {
                    const angle = Phaser.Math.Angle.Between(
                        coin.x, coin.y,
                        playerX, playerY
                    );
                    coin.x += Math.cos(angle) * this.config.magnetSpeed * dt;
                    coin.y += Math.sin(angle) * this.config.magnetSpeed * dt;
                }
            }

            // Visual effects - pulse glow
            const pulse = 1 + Math.sin(time * this.config.pulseSpeed) * 0.3;
            coin.glow.setScale(pulse);

            // Rotate star
            coin.star.rotation += this.config.rotationSpeed * dt;
        }
    }

    /**
     * Check if enemy should drop coin (30% chance)
     */
    shouldDropCoin(isBoss = false) {
        if (isBoss) return true; // Boss always drops
        return Math.random() < this.config.dropChance;
    }

    /**
     * Get total coins collected
     */
    getTotalCoins() {
        return this.totalCoinsCollected;
    }

    /**
     * Reset coin counter (for new stage)
     */
    reset() {
        this.totalCoinsCollected = 0;
    }

    /**
     * Clear all coins
     */
    clear() {
        for (let coin of this.activeCoins) {
            coin.active = false;
            coin.setVisible(false);
        }
        this.activeCoins = [];
    }

    /**
     * Cleanup
     */
    destroy() {
        for (let coin of this.coins) {
            coin.destroy();
        }
        this.coins = [];
        this.activeCoins = [];
    }
}
