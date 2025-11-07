import Phaser from 'phaser';
import { SCENES, COLORS, UI } from '../utils/GameConstants.js';

/**
 * UIScene - Phase 1: Foundation
 *
 * Displays HUD overlay:
 * - Squad counter (bottom-center, HUGE and prominent)
 *
 * Runs parallel to GameScene
 */
export default class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.UI });
    }

    create() {
        console.log('🎨 UIScene created');

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Get AtlasHelper from registry
        this.atlasHelper = this.registry.get('atlasHelper');

        if (this.atlasHelper) {
            console.log('✓ AtlasHelper available - using professional HUD sprites');
        } else {
            console.warn('⚠️  AtlasHelper not available - using fallback HUD');
        }

        // Squad counter (bottom-center) - PROFESSIONAL AAA DESIGN
        this.createSquadCounter(width, height);

        // Listen for events from GameScene
        this.setupEvents();
    }

    /**
     * Create squad counter display with professional AAA design
     */
    createSquadCounter(width, height) {
        const centerX = width / 2;
        const bottomY = height - 100;

        if (!this.atlasHelper) {
            // Fallback to basic design
            this.createBasicSquadCounter(centerX, bottomY);
            return;
        }

        // PROFESSIONAL: Golden panel background
        this.squadPanel = this.atlasHelper.createSprite(centerX, bottomY, 'panel_golden');
        this.squadPanel.setScrollFactor(0);
        this.squadPanel.setDepth(1000);
        this.squadPanel.setScale(0.6); // Compact for HUD

        // PROFESSIONAL: Decorative stars (3-star rating style)
        this.squadStars = [];
        const starSpacing = 50;
        const starY = bottomY - 60;

        for (let i = 0; i < 3; i++) {
            const starX = centerX - starSpacing + (i * starSpacing);
            const star = this.atlasHelper.createSprite(starX, starY, 'star_rating_brown');
            star.setScrollFactor(0);
            star.setDepth(1001);
            star.setScale(0.6);
            star.setAlpha(0.4);
            this.squadStars.push(star);
        }

        // PROFESSIONAL: Subtle glow effect behind panel
        this.squadGlow = this.add.circle(centerX, bottomY, 120, 0xFFD700, 0.1);
        this.squadGlow.setScrollFactor(0);
        this.squadGlow.setDepth(999);
        this.squadGlow.setBlendMode(Phaser.BlendModes.ADD);

        // Squad count text - VERY LARGE
        this.squadText = this.add.text(
            centerX,
            bottomY - 10,
            '1',
            {
                fontSize: '72px',
                fontFamily: 'Arial Black',
                color: '#FFFFFF',
                fontStyle: 'bold',
                stroke: '#4A2C2A',
                strokeThickness: 8,
                shadow: {
                    offsetX: 3,
                    offsetY: 3,
                    color: '#000000',
                    blur: 6,
                    fill: true
                }
            }
        );
        this.squadText.setOrigin(0.5);
        this.squadText.setScrollFactor(0);
        this.squadText.setDepth(1002);

        // Professional label with icon
        this.squadLabel = this.add.text(
            centerX,
            bottomY + 50,
            '👥 SQUAD',
            {
                fontSize: '20px',
                fontFamily: 'Arial Black',
                color: '#FFD700',
                stroke: '#000000',
                strokeThickness: 3
            }
        );
        this.squadLabel.setOrigin(0.5);
        this.squadLabel.setScrollFactor(0);
        this.squadLabel.setDepth(1002);

        // Entrance animation
        this.squadPanel.setAlpha(0);
        this.squadPanel.setScale(0);

        this.tweens.add({
            targets: this.squadPanel,
            alpha: 1,
            scaleX: 0.6,
            scaleY: 0.6,
            duration: 800,
            ease: 'Elastic.easeOut',
            delay: 500
        });

        console.log('✓ Professional squad counter UI created');
    }

    /**
     * Fallback basic squad counter (no atlas)
     */
    createBasicSquadCounter(centerX, bottomY) {
        this.squadBubble = this.add.circle(centerX, bottomY, 70, 0x1976D2, 0.8);
        this.squadBubble.setScrollFactor(0);
        this.squadBubble.setDepth(1000);

        this.squadBorder = this.add.circle(centerX, bottomY, 70);
        this.squadBorder.setStrokeStyle(4, COLORS.UI_WHITE, 1);
        this.squadBorder.setScrollFactor(0);
        this.squadBorder.setDepth(1001);
        this.squadBorder.setFillStyle(0x000000, 0);

        this.squadText = this.add.text(centerX, bottomY, '1', {
            fontSize: UI.SQUAD_COUNTER_SIZE,
            fontFamily: 'Arial',
            color: '#FFFFFF',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 8
        });
        this.squadText.setOrigin(0.5);
        this.squadText.setScrollFactor(0);
        this.squadText.setDepth(1002);

        this.squadLabel = this.add.text(centerX, bottomY + 90, 'SQUAD', {
            fontSize: UI.SQUAD_LABEL_SIZE,
            fontFamily: 'Arial',
            color: '#AAAAAA',
            fontStyle: 'bold'
        });
        this.squadLabel.setOrigin(0.5);
        this.squadLabel.setScrollFactor(0);
        this.squadLabel.setDepth(1002);

        console.log('✓ Basic squad counter UI created (fallback)');
    }

    /**
     * Setup event listeners from GameScene
     */
    setupEvents() {
        const gameScene = this.scene.get(SCENES.GAME);

        if (gameScene) {
            gameScene.events.on('updateSquad', this.updateSquadCount, this);
            console.log('✓ UI event listeners registered');
        }
    }

    /**
     * Update squad counter with professional AAA animations
     */
    updateSquadCount(count) {
        this.squadText.setText(count.toString());

        if (!this.atlasHelper) {
            // Fallback to basic update
            this.updateBasicSquadCount(count);
            return;
        }

        // PROFESSIONAL: Color coding based on count
        let color = '#FFFFFF';
        let glowColor = 0xFFD700;
        let glowAlpha = 0.1;

        if (count <= 2) {
            color = '#FF4444';        // Danger - red
            glowColor = 0xFF0000;
            glowAlpha = 0.3;
        } else if (count <= 5) {
            color = '#FFAA00';        // Warning - orange
            glowColor = 0xFF6F00;
            glowAlpha = 0.2;
        } else if (count >= 50) {
            color = '#00FF00';        // Excellent - green
            glowColor = 0x00FF00;
            glowAlpha = 0.25;
        }

        this.squadText.setColor(color);
        this.squadGlow.setFillStyle(glowColor, glowAlpha);

        // PROFESSIONAL: Update star rating based on squad size
        const starCount = Math.min(3, Math.floor(count / 10));
        this.squadStars.forEach((star, i) => {
            if (i < starCount) {
                // Light up star
                star.setTexture('buttons');
                star.setCrop(85, 855, 85, 80); // star_rating_yellow coordinates
                star.setAlpha(1.0);
            } else {
                // Dim star
                star.setTexture('buttons');
                star.setCrop(455, 860, 85, 80); // star_rating_brown coordinates
                star.setAlpha(0.4);
            }
        });

        // PROFESSIONAL: Pulse animation on change with glow
        this.tweens.add({
            targets: [this.squadText, this.squadPanel],
            scale: { from: 1.0, to: 1.15 },
            duration: 200,
            yoyo: true,
            ease: 'Back.easeOut'
        });

        // Glow pulse
        this.tweens.add({
            targets: this.squadGlow,
            scale: { from: 1.0, to: 1.3 },
            alpha: glowAlpha * 2,
            duration: 300,
            yoyo: true,
            ease: 'Quad.easeOut'
        });

        // PROFESSIONAL: Particle burst effect for milestones
        if (count % 10 === 0 && count > 0) {
            this.createMilestoneEffect();
        }

        // Adjust text size for large numbers
        if (count >= 100) {
            this.squadText.setFontSize('64px');
        } else {
            this.squadText.setFontSize('72px');
        }
    }

    /**
     * Create milestone celebration effect
     */
    createMilestoneEffect() {
        const centerX = this.cameras.main.width / 2;
        const bottomY = this.cameras.main.height - 100;

        // Create small star particles
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 * i) / 5;
            const distance = 80;
            const targetX = centerX + Math.cos(angle) * distance;
            const targetY = bottomY + Math.sin(angle) * distance;

            const particle = this.add.circle(centerX, bottomY, 8, 0xFFD700);
            particle.setScrollFactor(0);
            particle.setDepth(1003);
            particle.setBlendMode(Phaser.BlendModes.ADD);

            this.tweens.add({
                targets: particle,
                x: targetX,
                y: targetY,
                alpha: 0,
                scale: 0.2,
                duration: 600,
                ease: 'Quad.easeOut',
                onComplete: () => particle.destroy()
            });
        }
    }

    /**
     * Fallback basic update (no atlas)
     */
    updateBasicSquadCount(count) {
        let bubbleColor = 0x1976D2;
        let color = '#FFFFFF';

        if (count <= 2) {
            color = '#FF4444';
            bubbleColor = 0xD32F2F;
        } else if (count <= 5) {
            color = '#FFAA00';
            bubbleColor = 0xFF6F00;
        } else if (count >= 50) {
            color = '#00FF00';
            bubbleColor = 0x388E3C;
        }

        this.squadText.setColor(color);
        this.squadBubble.setFillStyle(bubbleColor, 0.8);

        this.tweens.add({
            targets: [this.squadText, this.squadBubble, this.squadBorder],
            scale: 1.15,
            duration: 200,
            yoyo: true,
            ease: 'Back.easeOut'
        });

        if (count >= 100) {
            this.squadBubble.radius = 90;
            this.squadBorder.radius = 90;
            this.squadText.setFontSize('96px');
        } else if (count >= 50) {
            this.squadBubble.radius = 80;
            this.squadBorder.radius = 80;
            this.squadText.setFontSize('108px');
        } else {
            this.squadBubble.radius = 70;
            this.squadBorder.radius = 70;
            this.squadText.setFontSize(UI.SQUAD_COUNTER_SIZE);
        }
    }

    /**
     * Cleanup
     */
    shutdown() {
        const gameScene = this.scene.get(SCENES.GAME);
        if (gameScene) {
            gameScene.events.off('updateSquad', this.updateSquadCount, this);
        }
    }
}
