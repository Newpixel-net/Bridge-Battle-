import { SQUAD, COLORS } from '../utils/GameConstants.js';

/**
 * SquadManager - Phase 1: Foundation
 *
 * Manages squad formation, movement, and members
 * Implements ultra-tight hexagonal blob formation
 *
 * CRITICAL: Formation must be ULTRA-TIGHT (characters touching)
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
        console.log(`🎮 Initializing squad with ${count} members`);

        for (let i = 0; i < count; i++) {
            this.addMember();
        }

        this.recalculateFormation();
    }

    /**
     * Add a single member to the squad
     */
    addMember() {
        // Create simple circle sprite for now (will use sprite system later)
        const member = this.scene.add.circle(
            this.centerX,
            this.centerY,
            SQUAD.CHARACTER_SIZE / 2,
            COLORS.SQUAD_BLUE
        );

        // Add physics body
        this.scene.physics.add.existing(member);
        member.body.setCircle(SQUAD.CHARACTER_SIZE / 2);

        // Visual properties
        member.setDepth(10);
        member.setScale(SQUAD.CHARACTER_SCALE);

        // Custom properties for formation
        member.formationIndex = this.members.length;
        member.targetX = 0;
        member.targetY = 0;

        this.members.push(member);
        this.recalculateFormation();

        // Spawn animation - grow from 0
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
        }

        this.recalculateFormation();
    }

    /**
     * Add multiple members at once
     */
    addMembers(count) {
        for (let i = 0; i < count; i++) {
            // Stagger spawns for visual effect
            this.scene.time.delayedCall(i * 50, () => {
                if (this.members.length < SQUAD.MAX_SIZE) {
                    this.addMember();
                }
            });
        }
    }

    /**
     * Calculate hexagonal close-packed formation
     * CRITICAL: This creates the ultra-tight blob formation
     */
    calculateHexagonalGrid(count) {
        const positions = [];
        const spacing = SQUAD.FORMATION_SPACING;

        if (count === 0) return positions;

        // Center character at origin
        positions.push({ x: 0, y: 0 });

        if (count === 1) return positions;

        // Build outward in hexagonal rings
        let ring = 1;
        let positionIndex = 1;

        while (positionIndex < count) {
            const pointsInRing = ring * 6;

            for (let i = 0; i < pointsInRing && positionIndex < count; i++) {
                const angle = (i / pointsInRing) * Math.PI * 2;
                const distance = ring * spacing;

                positions.push({
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance
                });

                positionIndex++;
            }

            ring++;
        }

        return positions;
    }

    /**
     * Recalculate formation positions for all members
     */
    recalculateFormation() {
        this.formationPositions = this.calculateHexagonalGrid(this.members.length);

        this.members.forEach((member, index) => {
            if (this.formationPositions[index]) {
                member.targetX = this.formationPositions[index].x;
                member.targetY = this.formationPositions[index].y;
            }
        });
    }

    /**
     * Set target X position for squad (player input)
     */
    setTargetX(x) {
        // Clamp to bridge bounds
        this.targetX = Phaser.Math.Clamp(x, -SQUAD.HORIZONTAL_LIMIT, SQUAD.HORIZONTAL_LIMIT);
    }

    /**
     * Update squad each frame
     */
    update(delta) {
        if (this.members.length === 0) return;

        const dt = delta / 1000;

        // Smoothly move center to target
        this.centerX = Phaser.Math.Linear(
            this.centerX,
            this.targetX,
            SQUAD.FORMATION_LERP
        );

        // Update each member to their formation position
        this.members.forEach((member, index) => {
            if (!member.active) return;

            const targetWorldX = this.centerX + member.targetX;
            const targetWorldY = this.centerY + member.targetY;

            // Smooth movement to formation position
            member.x = Phaser.Math.Linear(
                member.x,
                targetWorldX,
                SQUAD.FORMATION_LERP
            );

            member.y = Phaser.Math.Linear(
                member.y,
                targetWorldY,
                SQUAD.FORMATION_LERP
            );

            // Apply separation force (prevent overlap)
            this.applySeparation(member, index);
        });
    }

    /**
     * Apply separation force to prevent characters from overlapping
     */
    applySeparation(member, index) {
        const minDist = SQUAD.CHARACTER_SIZE * SQUAD.CHARACTER_SCALE;

        this.members.forEach((other, otherIndex) => {
            if (index === otherIndex || !other.active) return;

            const dx = member.x - other.x;
            const dy = member.y - other.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < minDist && dist > 0) {
                const force = (minDist - dist) * SQUAD.SEPARATION_FORCE;
                const angle = Math.atan2(dy, dx);

                member.x += Math.cos(angle) * force;
                member.y += Math.sin(angle) * force;
            }
        });
    }

    /**
     * Get center position of squad
     */
    getCenter() {
        return {
            x: this.centerX,
            y: this.centerY
        };
    }

    /**
     * Get current squad count
     */
    getCount() {
        return this.members.length;
    }

    /**
     * Get all active members
     */
    getMembers() {
        return this.members.filter(m => m.active);
    }

    /**
     * Cleanup
     */
    destroy() {
        this.members.forEach(member => {
            if (member && member.active) {
                member.destroy();
            }
        });
        this.members = [];
    }
}
