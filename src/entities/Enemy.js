import Phaser from 'phaser';

/**
 * Enemy - Individual enemy character
 *
 * VISUAL REFERENCE: Frames 6-11
 * - Dark red/brown color (#D32F2F, #8B4513)
 * - Similar size to player characters (~32px)
 * - Takes damage from bullets
 * - Explodes with particles on death
 * - Orange/yellow explosion effects
 *
 * STATS:
 * - HP: 5 (dies from 5 bullets)
 * - Static (doesn't move toward player)
 * - Destroyed when HP reaches 0
 */
export default class Enemy {
    constructor(scene, x, y, enemyType = 'SOLDIER', speed = 80) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.enemyType = enemyType;
        this.speed = speed;  // Movement speed toward player

        // Enemy stats based on type
        this.stats = this.getEnemyStats(enemyType);
        this.hp = this.stats.maxHp;
        this.maxHp = this.stats.maxHp;

        // State
        this.active = true;
        this.isDying = false;
        this.isDestroyed = false;

        // Visual configuration
        this.size = this.stats.size;
        this.color = this.stats.color;

        // Create visual representation
        this.container = this.createVisuals();

        // Add physics body to container for movement
        this.scene.physics.add.existing(this.container);
        this.container.body.setCircle(this.size);

        // Hit flash effect
        this.hitFlashDuration = 100;
        this.lastHitTime = 0;

        console.log(`👹 Enemy spawned: ${enemyType} at (${x}, ${y}) - HP: ${this.hp}, Speed: ${speed}`);
    }

    /**
     * Get enemy stats based on type
     */
    getEnemyStats(type) {
        const types = {
            'SOLDIER': {
                maxHp: 5,
                size: 16,
                color: 0xD32F2F,        // Dark red
                shadowColor: 0x8B0000,  // Darker red
                scoreValue: 10
            },
            'TANK': {
                maxHp: 15,
                size: 20,
                color: 0x8B4513,        // Brown
                shadowColor: 0x654321,  // Dark brown
                scoreValue: 30
            },
            'SPEED': {
                maxHp: 3,
                size: 14,
                color: 0xFF5722,        // Orange-red
                shadowColor: 0xD84315,  // Dark orange
                scoreValue: 15
            }
        };

        return types[type] || types['SOLDIER'];
    }

    /**
     * Create enemy visuals - SPRITE-BASED VERSION
     */
    createVisuals() {
        // SIZE VARIATION based on enemy type
        const baseScale = this.enemyType === 'TANK' ? 0.7 : this.enemyType === 'SPEED' ? 0.5 : 0.6;
        const sizeVariation = Phaser.Math.FloatBetween(0.9, 1.1);
        const finalScale = baseScale * sizeVariation;

        // ZOMBIE VARIETY - Randomly select from 3 zombie types
        const zombieTypes = [1, 2, 3];
        const zombieType = Phaser.Utils.Array.GetRandom(zombieTypes);

        // Ground shadow
        const shadowSize = 30 * sizeVariation;
        const groundShadow = this.scene.add.ellipse(
            this.x, this.y + shadowSize,
            shadowSize * 1.5, shadowSize * 0.4,
            0x000000, 0.3
        );
        groundShadow.setDepth(5);

        const container = this.scene.add.container(this.x, this.y);

        // SPRITE ASSEMBLY: Head + Body + Limbs from atlas
        const bodySprite = this.scene.add.sprite(0, 10, 'zombie_parts', `Zombie_${zombieType}_Body_0000`);
        bodySprite.setScale(finalScale);
        bodySprite.setTint(this.color); // Tint based on enemy type (red/brown/orange)

        const headSprite = this.scene.add.sprite(0, -15, 'zombie_heads', `Zombie_${zombieType}_Head_0000`);
        headSprite.setScale(finalScale);
        headSprite.setTint(this.color);

        const leftHandSprite = this.scene.add.sprite(-15, 5, 'zombie_parts', `Zombie_${zombieType}_HandLeft_0000`);
        leftHandSprite.setScale(finalScale * 0.9);
        leftHandSprite.setTint(this.color);

        const rightHandSprite = this.scene.add.sprite(15, 5, 'zombie_parts', `Zombie_${zombieType}_HandRight_0000`);
        rightHandSprite.setScale(finalScale * 0.9);
        rightHandSprite.setTint(this.color);

        const leftFootSprite = this.scene.add.sprite(-8, 25, 'zombie_parts', `Zombie_${zombieType}_FootLeft_0000`);
        leftFootSprite.setScale(finalScale);
        leftFootSprite.setTint(this.color);

        const rightFootSprite = this.scene.add.sprite(8, 25, 'zombie_parts', `Zombie_${zombieType}_FootRight_0000`);
        rightFootSprite.setScale(finalScale);
        rightFootSprite.setTint(this.color);

        // Add to container in depth order (feet first, head last)
        container.add([
            leftFootSprite,
            rightFootSprite,
            leftHandSprite,
            bodySprite,
            rightHandSprite,
            headSprite
        ]);
        container.setDepth(8); // Below player (10) but above road

        // Store references for animations
        container.headSprite = headSprite;
        container.bodySprite = bodySprite;
        container.leftHandSprite = leftHandSprite;
        container.rightHandSprite = rightHandSprite;
        container.leftFootSprite = leftFootSprite;
        container.rightFootSprite = rightFootSprite;
        container.zombieType = zombieType;
        container.groundShadow = groundShadow;

        // Store reference to body sprite for hit flash (replaces old visualBody)
        container.visualBody = bodySprite;

        // RUNNING ANIMATION - Foot swinging (left/right alternating)
        this.scene.tweens.add({
            targets: leftFootSprite,
            x: leftFootSprite.x - 6,
            duration: 300,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.scene.tweens.add({
            targets: rightFootSprite,
            x: rightFootSprite.x + 6,
            duration: 300,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            delay: 150 // Offset for alternating motion
        });

        // HAND SWINGING - Opposite to feet
        this.scene.tweens.add({
            targets: leftHandSprite,
            rotation: Phaser.Math.DegToRad(-15),
            duration: 300,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            delay: 150 // Opposite to right foot
        });

        this.scene.tweens.add({
            targets: rightHandSprite,
            rotation: Phaser.Math.DegToRad(15),
            duration: 300,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // HEAD BOBBING - Subtle up/down
        this.scene.tweens.add({
            targets: headSprite,
            y: headSprite.y - 2,
            duration: 300,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        console.log(`🧟 Enemy sprite created: Type ${zombieType}, Scale ${finalScale.toFixed(2)}, Tint ${this.color.toString(16)}`);

        return container;
    }

    /**
     * Take damage from bullet
     */
    takeDamage(damage) {
        if (this.isDying || this.isDestroyed) return false;

        this.hp -= damage;
        this.lastHitTime = this.scene.time.now;

        // Visual feedback - white flash on all sprite parts
        if (this.container) {
            const spriteRefs = [
                this.container.headSprite,
                this.container.bodySprite,
                this.container.leftHandSprite,
                this.container.rightHandSprite,
                this.container.leftFootSprite,
                this.container.rightFootSprite
            ];

            // Flash white
            spriteRefs.forEach(sprite => {
                if (sprite) sprite.setTint(0xFFFFFF);
            });

            // Return to original color
            this.scene.time.delayedCall(this.hitFlashDuration, () => {
                spriteRefs.forEach(sprite => {
                    if (sprite) sprite.setTint(this.color);
                });
            });
        }

        // Shake on hit
        this.scene.tweens.add({
            targets: this.container,
            x: this.container.x + Phaser.Math.Between(-3, 3),
            duration: 50,
            yoyo: true,
            repeat: 1
        });

        console.log(`💥 Enemy hit! HP: ${this.hp}/${this.maxHp}`);

        // Check if dead
        if (this.hp <= 0) {
            this.die();
            return true; // Enemy killed
        }

        return false; // Enemy still alive
    }

    /**
     * Enemy death
     */
    die() {
        if (this.isDying) return;

        this.isDying = true;
        this.active = false;

        console.log(`💀 Enemy defeated!`);

        // Death animation - expand and fade
        this.scene.tweens.add({
            targets: this.container,
            scale: 2.0,
            alpha: 0,
            duration: 300,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                this.destroy();
            }
        });

        // Create explosion effect
        this.createExplosion();

        // Screen shake (slight)
        this.scene.cameras.main.shake(50, 0.002);

        // Audio feedback
        if (this.scene.playEnemyDeathSound) {
            this.scene.playEnemyDeathSound();
        }
    }

    /**
     * Create explosion effect
     * Reference: Frames 8-9 show orange/yellow explosions
     */
    createExplosion() {
        const explosionColors = [0xFF6B6B, 0xFF8E53, 0xFFD93D]; // Red → Orange → Yellow
        const particleCount = 15;

        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const speed = Phaser.Math.Between(80, 150);
            const color = Phaser.Utils.Array.GetRandom(explosionColors);
            const size = Phaser.Math.Between(3, 6);

            const particle = this.scene.add.circle(
                this.container.x,
                this.container.y,
                size,
                color
            );
            particle.setDepth(50);
            particle.setBlendMode(Phaser.BlendModes.ADD);

            // Particle trajectory
            const velocityX = Math.cos(angle) * speed;
            const velocityY = Math.sin(angle) * speed;

            this.scene.tweens.add({
                targets: particle,
                x: particle.x + velocityX,
                y: particle.y + velocityY,
                alpha: 0,
                scale: 0,
                duration: 400,
                ease: 'Cubic.easeOut',
                onComplete: () => particle.destroy()
            });
        }

        // Screen flash (brief orange glow)
        this.scene.cameras.main.flash(100, 255, 150, 0, false);
    }

    /**
     * Update enemy (called each frame)
     * CRITICAL: Makes enemy advance toward player continuously
     */
    update(time, delta) {
        if (!this.active || this.isDestroyed || this.isDying) return;

        // WAVE SYSTEM: Advance toward player
        this.advanceTowardPlayer();

        // FORWARD MOTION FEEL: Rotate to face player
        this.rotateTowardPlayer();
    }

    /**
     * WAVE SYSTEM: Advance toward player continuously
     */
    advanceTowardPlayer() {
        if (!this.scene.squadCenterX || !this.scene.squadCenterY) return;
        if (!this.container.body) return;

        // Get player position
        const playerX = this.scene.squadCenterX;
        const playerY = this.scene.squadCenterY;

        // Calculate angle to player
        const angle = Phaser.Math.Angle.Between(
            this.container.x,
            this.container.y,
            playerX,
            playerY
        );

        // Set velocity toward player
        this.container.body.setVelocity(
            Math.cos(angle) * this.speed,
            Math.sin(angle) * this.speed
        );
    }

    /**
     * Rotate enemy to face the player (forward motion feel)
     */
    rotateTowardPlayer() {
        if (!this.scene.squadCenterX || !this.scene.squadCenterY) return;

        // Calculate angle from enemy to player
        const playerX = this.scene.squadCenterX;
        const playerY = this.scene.squadCenterY;
        const enemyX = this.container.x;
        const enemyY = this.container.y;

        // Calculate angle in radians
        const angle = Phaser.Math.Angle.Between(enemyX, enemyY, playerX, playerY);

        // Smoothly rotate container to face player
        // Add 90 degrees (PI/2) because sprites face right by default
        const targetRotation = angle + Math.PI / 2;

        // Smooth rotation (lerp for natural feel)
        const rotationSpeed = 0.1; // 10% per frame for smooth transition
        const currentRotation = this.container.rotation;
        const newRotation = Phaser.Math.Angle.RotateTo(currentRotation, targetRotation, rotationSpeed);

        this.container.setRotation(newRotation);
    }

    /**
     * Get position for collision detection
     */
    getPosition() {
        return {
            x: this.container.x,
            y: this.container.y
        };
    }

    /**
     * Get radius for collision detection
     */
    getRadius() {
        return this.size;
    }

    /**
     * Check if point is within enemy bounds
     */
    contains(x, y) {
        const dist = Phaser.Math.Distance.Between(
            this.container.x,
            this.container.y,
            x,
            y
        );
        return dist <= this.size;
    }

    /**
     * Destroy enemy and cleanup
     */
    destroy() {
        this.isDestroyed = true;
        this.active = false;

        // Clean up ground shadow
        if (this.container && this.container.groundShadow) {
            this.container.groundShadow.destroy();
        }

        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
    }

    /**
     * Get score value for killing this enemy
     */
    getScoreValue() {
        return this.stats.scoreValue;
    }
}
