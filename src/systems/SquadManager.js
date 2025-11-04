import { SQUAD, ASSETS, VFX } from '../utils/GameConstants.js';

/**
 * SquadManager - Manages squad formation, movement, and members
 * Implements blob formation with separation forces
 */
export default class SquadManager {
    constructor(scene) {
        this.scene = scene;
        this.members = [];
        this.centerX = 0;
        this.centerY = 200;
        this.targetX = 0;
        this.formationPositions = [];
    }

    /**
     * Initialize squad with starting members
     */
    init(count = SQUAD.START_SIZE) {
        for (let i = 0; i < count; i++) {
            this.addMember();
        }
        this.recalculateFormation();
    }

    /**
     * Add a single member to the squad
     */
    addMember() {
        const member = this.scene.physics.add.sprite(
            this.centerX,
            this.centerY,
            ASSETS.CHAR_RUN,
            0
        );

        member.setScale(SQUAD.CHARACTER_SCALE);
        member.setDepth(10);
        member.play('anim-run');

        // Custom properties for formation
        member.formationIndex = this.members.length;
        member.velocityX = 0;
        member.velocityZ = 0;
        member.targetX = 0;
        member.targetY = 0;

        this.members.push(member);
        this.recalculateFormation();

        // Spawn animation
        member.setScale(0);
        this.scene.tweens.add({
            targets: member,
            scale: SQUAD.CHARACTER_SCALE,
            duration: 300,
            ease: 'Back.easeOut'
        });

        return member;
    }

    /**
     * Remove members from squad
     */
    removeMembers(count) {
        for (let i = 0; i < count && this.members.length > 0; i++) {
            const member = this.members.pop();

            // Death animation
            this.scene.tweens.add({
                targets: member,
                scale: 0,
                alpha: 0,
                duration: 300,
                ease: 'Power2',
                onComplete: () => member.destroy()
            });

            // Particle effect
            this.spawnDeathParticles(member.x, member.y);
        }

        this.recalculateFormation();
    }

    /**
     * Add multiple members at once
     */
    addMembers(count) {
        for (let i = 0; i < count; i++) {
            // Delay spawns slightly for visual effect
            this.scene.time.delayedCall(i * 50, () => {
                if (this.members.length < SQUAD.MAX_SIZE) {
                    this.addMember();
                }
            });
        }
    }

    /**
     * Calculate blob formation positions
     * Uses circular/spiral pattern for natural grouping
     */
    recalculateFormation() {
        this.formationPositions = [];
        const count = this.members.length;

        if (count === 0) return;

        // Special case for 1 member - center position
        if (count === 1) {
            this.formationPositions.push({ x: 0, y: 0 });
            return;
        }

        // Calculate spiral/circular formation
        const spacing = SQUAD.FORMATION_SPACING;
        let ring = 0;
        let posInRing = 0;
        let maxInRing = 1;

        for (let i = 0; i < count; i++) {
            if (posInRing >= maxInRing) {
                ring++;
                posInRing = 0;
                maxInRing = Math.ceil(Math.PI * 2 * ring);
            }

            if (ring === 0) {
                // Center character
                this.formationPositions.push({ x: 0, y: 0 });
            } else {
                // Circular placement
                const angle = (posInRing / maxInRing) * Math.PI * 2;
                const radius = ring * spacing;

                this.formationPositions.push({
                    x: Math.cos(angle) * radius,
                    y: Math.sin(angle) * radius
                });
            }

            posInRing++;
        }
    }

    /**
     * Update squad position and formation
     */
    update(delta) {
        if (this.members.length === 0) return;

        const dt = delta / 1000; // Convert to seconds

        // Smoothly move center towards target X
        const dx = this.targetX - this.centerX;
        this.centerX += dx * SQUAD.MOVE_SPEED * dt;

        // Clamp to bridge bounds
        const maxX = SQUAD.HORIZONTAL_LIMIT;
        this.centerX = Phaser.Math.Clamp(this.centerX, -maxX, maxX);

        // Update each member to follow formation with separation
        this.updateFormation(dt);
    }

    /**
     * Update formation with separation forces
     */
    updateFormation(dt) {
        this.members.forEach((member, index) => {
            // Get target formation position
            const formation = this.formationPositions[index];
            const targetX = this.centerX + formation.x;
            const targetY = this.centerY + formation.y;

            // Calculate forces
            let forceX = 0;
            let forceY = 0;

            // 1. Attraction to formation position
            forceX += (targetX - member.x) * 2.0;
            forceY += (targetY - member.y) * 2.0;

            // 2. Separation from other members (prevent overlap)
            this.members.forEach((other, otherIndex) => {
                if (index === otherIndex) return;

                const dx = member.x - other.x;
                const dy = member.y - other.y;
                const distSq = dx * dx + dy * dy;
                const minDist = SQUAD.FORMATION_SPACING * 0.5;

                if (distSq < minDist * minDist && distSq > 0) {
                    const dist = Math.sqrt(distSq);
                    const separationForce = (minDist - dist) / dist * SQUAD.SEPARATION_FORCE;
                    forceX += dx * separationForce;
                    forceY += dy * separationForce;
                }
            });

            // Apply forces with lerp for smooth movement
            member.x += forceX * dt * 60;
            member.y += forceY * dt * 60;
        });
    }

    /**
     * Set target X position (from player input)
     */
    setTargetX(x) {
        this.targetX = Phaser.Math.Clamp(x, -SQUAD.HORIZONTAL_LIMIT, SQUAD.HORIZONTAL_LIMIT);
    }

    /**
     * Move squad forward
     */
    moveForward(speed, dt) {
        this.centerY += speed * dt;
    }

    /**
     * Get current squad size
     */
    getCount() {
        return this.members.length;
    }

    /**
     * Get squad center position
     */
    getCenter() {
        return { x: this.centerX, y: this.centerY };
    }

    /**
     * Get all squad members
     */
    getMembers() {
        return this.members;
    }

    /**
     * Spawn death particles
     */
    spawnDeathParticles(x, y) {
        // Create particle burst
        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 100 + Math.random() * 100;

            const particle = this.scene.add.circle(x, y, 4, 0xFF0000);
            particle.setAlpha(0.8);

            this.scene.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * speed,
                y: y + Math.sin(angle) * speed,
                alpha: 0,
                scale: 0,
                duration: 500 + Math.random() * 500,
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        }
    }

    /**
     * Cleanup
     */
    destroy() {
        this.members.forEach(member => member.destroy());
        this.members = [];
    }
}
