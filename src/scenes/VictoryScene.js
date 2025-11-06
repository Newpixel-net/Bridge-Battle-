import Phaser from 'phaser';
import { GAME, COLORS, SCENES } from '../utils/GameConstants.js';

/**
 * VictoryScene - Professional victory screen with stats and rewards
 *
 * VISUAL REFERENCE: Frame 15 (Victory Screen)
 * - Large "VICTORY!" title
 * - Stats display (score, distance, enemies killed)
 * - Star rating system (1-3 stars)
 * - Reward/bonus display
 * - Continue and Menu buttons
 * - Celebration particles and effects
 *
 * TRIGGERED BY:
 * - Boss defeated (main victory condition)
 * - Distance milestone reached (5000m+)
 * - Special victory conditions
 */
export default class VictoryScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.VICTORY });
    }

    init(data) {
        console.log('🎉 VictoryScene - Victory achieved!');

        // Victory data from previous scene
        this.finalScore = data?.score || 0;
        this.distance = data?.distance || 0;
        this.enemiesKilled = data?.enemiesKilled || 0;
        this.bossDefeated = data?.bossDefeated || false;
        this.stageNumber = data?.stageNumber || 1;
        this.timePlayed = data?.timePlayed || 0;

        // Calculate performance metrics
        this.starRating = this.calculateStarRating();
        this.bonusScore = this.calculateBonusScore();
        this.totalScore = this.finalScore + this.bonusScore;

        // Animation state
        this.animationStep = 0;
        this.statsRevealed = false;
    }

    create() {
        // Background gradient (gold to white)
        this.createBackground();

        // Celebration particles
        this.createCelebrationParticles();

        // Victory title animation
        this.createVictoryTitle();

        // Stats panel (appears after title)
        this.time.delayedCall(1000, () => {
            this.createStatsPanel();
        });

        // Star rating (appears after stats)
        this.time.delayedCall(2000, () => {
            this.createStarRating();
        });

        // Buttons (appear last)
        this.time.delayedCall(3000, () => {
            this.createButtons();
        });

        // Victory music
        this.playVictoryMusic();

        console.log('✓ Victory scene ready');
    }

    /**
     * Create background
     */
    createBackground() {
        // Gold gradient background
        const gradient = this.add.rectangle(
            GAME.WIDTH / 2, GAME.HEIGHT / 2,
            GAME.WIDTH, GAME.HEIGHT,
            0xFFD700, 1.0
        );

        // Add white overlay for glow effect
        const overlay = this.add.rectangle(
            GAME.WIDTH / 2, GAME.HEIGHT / 2,
            GAME.WIDTH, GAME.HEIGHT,
            0xFFFFFF, 0.3
        );

        // Pulsing animation
        this.tweens.add({
            targets: overlay,
            alpha: 0.5,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    /**
     * Create celebration particles
     */
    createCelebrationParticles() {
        // Confetti particles falling from top
        const colors = [0xFFD700, 0xFF6B35, 0x00D4FF, 0xFF00FF, 0x00FF00];

        // Create particles continuously
        this.particleTimer = this.time.addEvent({
            delay: 100,
            callback: () => {
                for (let i = 0; i < 3; i++) {
                    const x = Phaser.Math.Between(0, GAME.WIDTH);
                    const y = -20;
                    const size = Phaser.Math.Between(8, 15);
                    const color = Phaser.Utils.Array.GetRandom(colors);

                    const particle = this.add.rectangle(x, y, size, size, color, 1.0);
                    particle.setRotation(Phaser.Math.Between(0, 360));

                    this.tweens.add({
                        targets: particle,
                        y: GAME.HEIGHT + 50,
                        x: x + Phaser.Math.Between(-100, 100),
                        rotation: particle.rotation + Phaser.Math.Between(2, 6),
                        duration: Phaser.Math.Between(3000, 5000),
                        ease: 'Cubic.easeIn',
                        onComplete: () => {
                            particle.destroy();
                        }
                    });
                }
            },
            loop: true
        });
    }

    /**
     * Create victory title
     */
    createVictoryTitle() {
        // "VICTORY!" text
        const title = this.add.text(
            GAME.WIDTH / 2, -100,
            'VICTORY!',
            {
                fontSize: '80px',
                fontFamily: 'Arial Black',
                color: '#FFFFFF',
                stroke: '#FFD700',
                strokeThickness: 12
            }
        );
        title.setOrigin(0.5);

        // Drop in from top with bounce
        this.tweens.add({
            targets: title,
            y: 120,
            duration: 800,
            ease: 'Bounce.easeOut'
        });

        // Pulsing animation
        this.tweens.add({
            targets: title,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Subtitle (if boss defeated)
        if (this.bossDefeated) {
            const subtitle = this.add.text(
                GAME.WIDTH / 2, -50,
                'BOSS DEFEATED!',
                {
                    fontSize: '32px',
                    fontFamily: 'Arial Black',
                    color: '#FF0000',
                    stroke: '#FFFFFF',
                    strokeThickness: 4
                }
            );
            subtitle.setOrigin(0.5);
            subtitle.setAlpha(0);

            this.tweens.add({
                targets: subtitle,
                y: 180,
                alpha: 1,
                duration: 600,
                delay: 400,
                ease: 'Back.easeOut'
            });
        }
    }

    /**
     * Create stats panel
     */
    createStatsPanel() {
        const centerX = GAME.WIDTH / 2;
        const startY = 250;

        // Panel background
        const panelWidth = 400;
        const panelHeight = 280;
        const panel = this.add.rectangle(
            centerX, startY + panelHeight / 2,
            panelWidth, panelHeight,
            0x000000, 0.7
        );
        panel.setStrokeStyle(4, 0xFFFFFF, 1.0);
        panel.setScale(0);

        this.tweens.add({
            targets: panel,
            scaleX: 1,
            scaleY: 1,
            duration: 400,
            ease: 'Back.easeOut'
        });

        // Stats array
        const stats = [
            { label: 'SCORE', value: this.finalScore, icon: '⭐', delay: 200 },
            { label: 'DISTANCE', value: `${Math.floor(this.distance)}m`, icon: '🏃', delay: 400 },
            { label: 'ENEMIES KILLED', value: this.enemiesKilled, icon: '💀', delay: 600 },
            { label: 'BONUS', value: `+${this.bonusScore}`, icon: '🎁', delay: 800 }
        ];

        // Display each stat with animation
        let yOffset = startY + 40;
        stats.forEach((stat, index) => {
            this.createStatRow(centerX, yOffset, stat, stat.delay);
            yOffset += 60;
        });

        // Total score (separate, larger)
        this.time.delayedCall(1000, () => {
            const totalY = startY + panelHeight - 40;

            // Divider line
            const divider = this.add.rectangle(
                centerX, totalY - 30,
                panelWidth - 40, 2,
                0xFFFFFF, 0.5
            );

            // Total score text
            const totalText = this.add.text(
                centerX - 100, totalY,
                'TOTAL SCORE',
                {
                    fontSize: '24px',
                    fontFamily: 'Arial Black',
                    color: '#FFD700'
                }
            );
            totalText.setOrigin(0, 0.5);
            totalText.setAlpha(0);

            const totalValue = this.add.text(
                centerX + 100, totalY,
                this.totalScore.toString(),
                {
                    fontSize: '32px',
                    fontFamily: 'Arial Black',
                    color: '#FFFFFF',
                    stroke: '#FFD700',
                    strokeThickness: 4
                }
            );
            totalValue.setOrigin(1, 0.5);
            totalValue.setAlpha(0);

            // Animate in
            this.tweens.add({
                targets: [totalText, totalValue],
                alpha: 1,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 400,
                yoyo: true,
                ease: 'Back.easeOut'
            });
        });
    }

    /**
     * Create individual stat row
     */
    createStatRow(centerX, y, stat, delay) {
        // Icon
        const icon = this.add.text(
            centerX - 180, y,
            stat.icon,
            {
                fontSize: '28px'
            }
        );
        icon.setOrigin(0.5);
        icon.setAlpha(0);

        // Label
        const label = this.add.text(
            centerX - 140, y,
            stat.label,
            {
                fontSize: '20px',
                fontFamily: 'Arial',
                color: '#FFFFFF'
            }
        );
        label.setOrigin(0, 0.5);
        label.setAlpha(0);

        // Value
        const value = this.add.text(
            centerX + 180, y,
            stat.value.toString(),
            {
                fontSize: '24px',
                fontFamily: 'Arial Black',
                color: '#FFD700',
                stroke: '#000000',
                strokeThickness: 3
            }
        );
        value.setOrigin(1, 0.5);
        value.setAlpha(0);

        // Animate in from left
        this.tweens.add({
            targets: [icon, label, value],
            alpha: 1,
            x: '+=10',
            duration: 300,
            delay: delay,
            ease: 'Back.easeOut'
        });

        // Number count-up animation for numeric values
        if (typeof stat.value === 'number') {
            this.animateNumberCountUp(value, 0, stat.value, 500, delay);
        }
    }

    /**
     * Animate number counting up
     */
    animateNumberCountUp(textObject, from, to, duration, delay) {
        this.tweens.addCounter({
            from: from,
            to: to,
            duration: duration,
            delay: delay,
            ease: 'Cubic.easeOut',
            onUpdate: (tween) => {
                const value = Math.floor(tween.getValue());
                textObject.setText(value.toString());
            }
        });
    }

    /**
     * Create star rating
     */
    createStarRating() {
        const centerX = GAME.WIDTH / 2;
        const y = 560;

        // "RATING" label
        const label = this.add.text(
            centerX, y - 40,
            'PERFORMANCE',
            {
                fontSize: '24px',
                fontFamily: 'Arial Black',
                color: '#FFFFFF'
            }
        );
        label.setOrigin(0.5);
        label.setAlpha(0);

        this.tweens.add({
            targets: label,
            alpha: 1,
            duration: 300
        });

        // Stars
        const starSpacing = 70;
        const startX = centerX - (starSpacing * (3 - 1)) / 2;

        for (let i = 0; i < 3; i++) {
            const x = startX + (i * starSpacing);
            const filled = i < this.starRating;

            this.createStar(x, y, filled, i * 200);
        }
    }

    /**
     * Create individual star
     */
    createStar(x, y, filled, delay) {
        const starText = this.add.text(
            x, y,
            filled ? '⭐' : '☆',
            {
                fontSize: '64px'
            }
        );
        starText.setOrigin(0.5);
        starText.setScale(0);

        // Pop in animation
        this.tweens.add({
            targets: starText,
            scaleX: 1,
            scaleY: 1,
            duration: 400,
            delay: delay,
            ease: 'Back.easeOut',
            onComplete: () => {
                // Sparkle effect for filled stars
                if (filled) {
                    this.createSparkle(x, y);
                }
            }
        });

        // Bounce animation for filled stars
        if (filled) {
            this.tweens.add({
                targets: starText,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 500,
                delay: delay + 400,
                yoyo: true,
                ease: 'Sine.easeInOut'
            });
        }
    }

    /**
     * Create sparkle effect around star
     */
    createSparkle(centerX, centerY) {
        const sparkleCount = 8;
        const radius = 40;

        for (let i = 0; i < sparkleCount; i++) {
            const angle = (360 / sparkleCount) * i;
            const angleRad = Phaser.Math.DegToRad(angle);
            const x = centerX + Math.cos(angleRad) * radius;
            const y = centerY + Math.sin(angleRad) * radius;

            const sparkle = this.add.circle(centerX, centerY, 4, 0xFFFFFF, 1.0);

            this.tweens.add({
                targets: sparkle,
                x: x,
                y: y,
                alpha: 0,
                duration: 500,
                ease: 'Cubic.easeOut',
                onComplete: () => {
                    sparkle.destroy();
                }
            });
        }
    }

    /**
     * Create buttons
     */
    createButtons() {
        const centerX = GAME.WIDTH / 2;
        const startY = 680;

        // Continue/Next Stage button
        const continueButton = this.createButton(
            centerX, startY,
            'NEXT STAGE',
            0x00D4FF,
            () => this.handleContinue()
        );

        // Menu button
        const menuButton = this.createButton(
            centerX, startY + 70,
            'MAIN MENU',
            0x666666,
            () => this.handleMenu()
        );
    }

    /**
     * Create button
     */
    createButton(x, y, text, color, callback) {
        const buttonWidth = 300;
        const buttonHeight = 60;

        // Button background
        const button = this.add.rectangle(
            x, y,
            buttonWidth, buttonHeight,
            color, 1.0
        );
        button.setStrokeStyle(4, 0xFFFFFF, 1.0);
        button.setInteractive({ useHandCursor: true });
        button.setAlpha(0);

        // Button text
        const buttonText = this.add.text(
            x, y,
            text,
            {
                fontSize: '28px',
                fontFamily: 'Arial Black',
                color: '#FFFFFF'
            }
        );
        buttonText.setOrigin(0.5);
        buttonText.setAlpha(0);

        // Fade in
        this.tweens.add({
            targets: [button, buttonText],
            alpha: 1,
            duration: 400,
            ease: 'Cubic.easeOut'
        });

        // Hover effect
        button.on('pointerover', () => {
            this.tweens.add({
                targets: [button, buttonText],
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 200,
                ease: 'Back.easeOut'
            });
        });

        button.on('pointerout', () => {
            this.tweens.add({
                targets: [button, buttonText],
                scaleX: 1,
                scaleY: 1,
                duration: 200
            });
        });

        // Click effect
        button.on('pointerdown', () => {
            this.cameras.main.flash(200, 255, 255, 255);
            this.time.delayedCall(200, callback);
        });

        return { button, buttonText };
    }

    /**
     * Calculate star rating (1-3 stars)
     */
    calculateStarRating() {
        let stars = 1; // Minimum 1 star for victory

        // Add star for high score (>1000)
        if (this.finalScore >= 1000) stars++;

        // Add star for boss defeated
        if (this.bossDefeated) stars++;

        // Cap at 3 stars
        return Math.min(stars, 3);
    }

    /**
     * Calculate bonus score
     */
    calculateBonusScore() {
        let bonus = 0;

        // Distance bonus (1 point per 10m)
        bonus += Math.floor(this.distance / 10);

        // Enemy kill bonus (5 points per enemy)
        bonus += this.enemiesKilled * 5;

        // Boss defeat bonus
        if (this.bossDefeated) {
            bonus += 500;
        }

        // Star rating bonus
        bonus += this.starRating * 100;

        return bonus;
    }

    /**
     * Handle continue button
     */
    handleContinue() {
        console.log('📍 Continue to next stage');

        // Stop particles
        if (this.particleTimer) {
            this.particleTimer.remove();
        }

        // Fade out
        this.cameras.main.fadeOut(800, 0, 0, 0);

        this.time.delayedCall(800, () => {
            // Go to character selection for next stage
            this.scene.start(SCENES.CHARACTER_SELECTION, {
                stageNumber: this.stageNumber + 1
            });
        });
    }

    /**
     * Handle menu button
     */
    handleMenu() {
        console.log('📍 Return to main menu');

        // Stop particles
        if (this.particleTimer) {
            this.particleTimer.remove();
        }

        // Fade out
        this.cameras.main.fadeOut(500, 0, 0, 0);

        this.time.delayedCall(500, () => {
            this.scene.start(SCENES.MENU);
        });
    }

    /**
     * Play victory music
     */
    playVictoryMusic() {
        // Victory fanfare would go here
        // For now, just log
        console.log('🎵 Victory music playing');
    }

    /**
     * Cleanup
     */
    shutdown() {
        console.log('🛑 VictoryScene shutdown');

        // Stop particle timer
        if (this.particleTimer) {
            this.particleTimer.remove();
        }
    }
}
