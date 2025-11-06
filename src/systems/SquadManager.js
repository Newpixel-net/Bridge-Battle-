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
     * Creates 3D-looking sphere with shading (matching screenshots)
     */
    addMember() {
        const radius = SQUAD.CHARACTER_RADIUS;

        // Container to hold all visual elements
        const container = this.scene.add.container(this.centerX, this.centerY);

        // Main sphere body (bright blue)
        const body = this.scene.add.circle(0, 0, radius, COLORS.SQUAD_BLUE);
        body.setDepth(10);

        // Dark shading (bottom-right) for 3D effect
        const shadow = this.scene.add.circle(2, 2, radius * 0.8, COLORS.SQUAD_BLUE_DARK, 0.3);
        shadow.setDepth(11);

        // White highlight (top-left) for 3D sphere look
        const highlight = this.scene.add.circle(-3, -3, radius * 0.4, COLORS.SQUAD_HIGHLIGHT, 0.8);
        highlight.setDepth(12);

        // Add to container
        container.add([body, shadow, highlight]);
        container.setDepth(10);

        // Add physics to container
        this.scene.physics.add.existing(container);
        container.body.setCircle(radius);

        // Custom properties for formation
        container.formationIndex = this.members.length;
        container.targetX = 0;
        container.targetY = 0;

        this.members.push(container);
        this.recalculateFormation();

        // Spawn animation - grow from 0
        container.setScale(0);
        this.scene.tweens.add({
            targets: container,
            scale: 1.0,
            duration: 300,
            ease: 'Back.easeOut'
        });

        return container;
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
        const minDist = SQUAD.CHARACTER_SIZE;

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
