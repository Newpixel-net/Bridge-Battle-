import { GATES, WORLD, COLORS, ASSETS } from '../utils/GameConstants.js';

/**
 * GateManager - Manages gate spawning, collision, and arithmetic logic
 * Gates span FULL bridge width with multiple lanes
 */
export default class GateManager {
    constructor(scene) {
        this.scene = scene;
        this.gates = [];
        this.passedGates = new Set(); // Track which gates have been passed
    }

    /**
     * Create a new gate at specified Z position
     */
    createGate(z) {
        const isPositive = Math.random() < GATES.POSITIVE_CHANCE;
        const value = isPositive ?
            Phaser.Math.Between(GATES.POSITIVE_MIN, GATES.POSITIVE_MAX) :
            Phaser.Math.Between(GATES.NEGATIVE_MIN, GATES.NEGATIVE_MAX);

        const gate = {
            z: z,
            value: value,
            isPositive: isPositive,
            segments: [],
            hp: isPositive ? value * GATES.HP_PER_VALUE : 0,
            maxHp: isPositive ? value * GATES.HP_PER_VALUE : 0,
            destroyed: false,
            active: true,
            id: `gate-${Date.now()}-${Math.random()}`
        };

        // Create visual segments (3 lanes)
        this.createGateSegments(gate);

        this.gates.push(gate);
        return gate;
    }

    /**
     * Create gate visual segments (spans full bridge width)
     */
    createGateSegments(gate) {
        const segmentWidth = (GATES.WIDTH - (GATES.SEGMENTS - 1) * GATES.SEGMENT_GAP) / GATES.SEGMENTS;

        for (let i = 0; i < GATES.SEGMENTS; i++) {
            // Calculate X position for this lane
            const laneX = -GATES.WIDTH / 2 + (i * (segmentWidth + GATES.SEGMENT_GAP)) + segmentWidth / 2;

            // Randomize value slightly for each lane (within ±2 of base value)
            const variance = Phaser.Math.Between(-2, 2);
            const laneValue = gate.isPositive ?
                Math.max(1, gate.value + variance) :
                Math.min(-1, gate.value + variance);

            // Create visual sprite
            const sprite = this.scene.add.rectangle(
                laneX,
                gate.z,
                segmentWidth,
                GATES.HEIGHT,
                gate.isPositive ? COLORS.GATE_POSITIVE : COLORS.GATE_NEGATIVE,
                GATES.OPACITY
            );

            sprite.setDepth(2);
            sprite.setStrokeStyle(4, gate.isPositive ? COLORS.GATE_POSITIVE_GRADIENT : COLORS.GATE_NEGATIVE_GRADIENT);

            // Create value text
            const text = this.scene.add.text(
                laneX,
                gate.z,
                `${laneValue > 0 ? '+' : ''}${laneValue}`,
                {
                    fontSize: '72px',
                    fontFamily: 'Arial',
                    color: '#FFFFFF',
                    fontStyle: 'bold',
                    stroke: '#000000',
                    strokeThickness: 6
                }
            );

            text.setOrigin(0.5);
            text.setDepth(3);

            // Pulse animation
            this.scene.tweens.add({
                targets: [sprite, text],
                scaleX: GATES.PULSE_SCALE_MAX,
                scaleY: GATES.PULSE_SCALE_MAX,
                duration: GATES.PULSE_DURATION / 2,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            gate.segments.push({
                sprite: sprite,
                text: text,
                x: laneX,
                value: laneValue,
                width: segmentWidth
            });
        }
    }

    /**
     * Check collision between squad and gates
     */
    checkCollisions(squadCenter, squadMembers, onGatePass) {
        this.gates.forEach(gate => {
            if (!gate.active || gate.destroyed) return;
            if (this.passedGates.has(gate.id)) return;

            // Check if squad has reached gate Z position
            const distToGate = Math.abs(squadCenter.y - gate.z);

            if (distToGate < 50) { // Within collision range
                // Find which lane the squad center is in
                const segmentIndex = this.getSegmentForPosition(squadCenter.x);

                if (segmentIndex !== -1 && gate.segments[segmentIndex]) {
                    const segment = gate.segments[segmentIndex];

                    // Apply gate effect
                    this.applyGateEffect(gate, segment, onGatePass);

                    // Mark as passed
                    this.passedGates.add(gate.id);
                    gate.destroyed = true;

                    // Visual feedback
                    this.playGatePassEffect(gate, segment);
                }
            }
        });
    }

    /**
     * Determine which segment/lane a position is in
     */
    getSegmentForPosition(x) {
        const segmentWidth = (GATES.WIDTH - (GATES.SEGMENTS - 1) * GATES.SEGMENT_GAP) / GATES.SEGMENTS;

        for (let i = 0; i < GATES.SEGMENTS; i++) {
            const laneX = -GATES.WIDTH / 2 + (i * (segmentWidth + GATES.SEGMENT_GAP)) + segmentWidth / 2;
            const halfWidth = segmentWidth / 2;

            if (x >= laneX - halfWidth && x <= laneX + halfWidth) {
                return i;
            }
        }

        return -1; // Not in any lane
    }

    /**
     * Apply gate arithmetic effect to squad
     */
    applyGateEffect(gate, segment, callback) {
        const value = segment.value;

        // Callback to SquadManager to modify squad size
        if (callback) {
            callback(value, gate.isPositive);
        }
    }

    /**
     * Play visual effect when passing through gate
     */
    playGatePassEffect(gate, segment) {
        // Screen shake
        this.scene.cameras.main.shake(200, 0.005);

        // Enlarge and fade segment
        this.scene.tweens.add({
            targets: [segment.sprite, segment.text],
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                segment.sprite.destroy();
                segment.text.destroy();
            }
        });

        // Destroy other segments
        gate.segments.forEach((seg, index) => {
            if (seg === segment) return;

            this.scene.tweens.add({
                targets: [seg.sprite, seg.text],
                alpha: 0,
                duration: 200,
                onComplete: () => {
                    seg.sprite.destroy();
                    seg.text.destroy();
                }
            });
        });

        // Particle burst
        this.spawnGateParticles(segment.x, gate.z, gate.isPositive);
    }

    /**
     * Handle bullet hitting positive gate (increases value)
     */
    handleBulletHit(bullet, onValueIncrease) {
        this.gates.forEach(gate => {
            if (!gate.active || gate.destroyed || !gate.isPositive) return;

            gate.segments.forEach(segment => {
                const dist = Phaser.Math.Distance.Between(
                    bullet.x, bullet.y,
                    segment.x, gate.z
                );

                if (dist < 50) {
                    // Deal damage
                    gate.hp -= SHOOTING.BULLET_DAMAGE;

                    // Increase value every 10 damage
                    if (gate.hp % (GATES.VALUE_INCREASE_PER_10_DMG * 10) < SHOOTING.BULLET_DAMAGE) {
                        segment.value++;
                        segment.text.setText(`+${segment.value}`);

                        // Pulse effect
                        this.scene.tweens.add({
                            targets: segment.text,
                            scale: 1.3,
                            duration: 150,
                            yoyo: true,
                            ease: 'Back.easeOut'
                        });

                        if (onValueIncrease) {
                            onValueIncrease();
                        }
                    }

                    return true;
                }
            });
        });

        return false;
    }

    /**
     * Spawn particles when passing gate
     */
    spawnGateParticles(x, y, isPositive) {
        const color = isPositive ? 0x00FFFF : 0xFF4444;
        const count = 30;

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 100 + Math.random() * 150;

            const particle = this.scene.add.circle(x, y, 6, color);
            particle.setAlpha(0.8);

            this.scene.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * speed,
                y: y + Math.sin(angle) * speed,
                alpha: 0,
                scale: 0,
                duration: 400 + Math.random() * 400,
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        }
    }

    /**
     * Update gates (remove off-screen gates)
     */
    update(cameraY) {
        for (let i = this.gates.length - 1; i >= 0; i--) {
            const gate = this.gates[i];

            // Remove gates that are far behind camera
            if (gate.z < cameraY - 500) {
                this.destroyGate(gate);
                this.gates.splice(i, 1);
            }
        }
    }

    /**
     * Destroy gate and cleanup
     */
    destroyGate(gate) {
        gate.segments.forEach(segment => {
            segment.sprite.destroy();
            segment.text.destroy();
        });
        gate.active = false;
    }

    /**
     * Get gates in range for bullet collision
     */
    getGatesInRange(y, range) {
        return this.gates.filter(gate =>
            gate.active &&
            !gate.destroyed &&
            gate.z >= y &&
            gate.z <= y + range
        );
    }

    /**
     * Cleanup
     */
    destroy() {
        this.gates.forEach(gate => this.destroyGate(gate));
        this.gates = [];
        this.passedGates.clear();
    }
}
