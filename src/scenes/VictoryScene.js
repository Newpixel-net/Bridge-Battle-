import Phaser from 'phaser';
import { GAME, COLORS, SCENES, UI_SCALE } from '../utils/GameConstants.js';
import { progressionManager } from '../systems/ProgressionManager.js';

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

        // PROGRESSION: High score and achievements data
        this.highScore = data?.highScore || progressionManager.getHighScore();
        this.isNewHighScore = data?.isNewHighScore || false;
        this.newAchievements = data?.newAchievements || [];

        // Calculate performance metrics
        this.starRating = this.calculateStarRating();
        this.bonusScore = this.calculateBonusScore();
        this.totalScore = this.finalScore + this.bonusScore;

        // Animation state
        this.animationStep = 0;
        this.statsRevealed = false;

        console.log(`📊 High Score: ${this.highScore} | New High Score: ${this.isNewHighScore}`);
        console.log(`🏆 New Achievements: ${this.newAchievements.length}`);
    }

    create() {
        // Get AtlasHelper from registry (initialized in PreloadScene)
        this.atlasHelper = this.registry.get('atlasHelper');

        if (this.atlasHelper) {
            console.log('✓ AtlasHelper available - using professional sprite atlases');
        } else {
            console.log('⚠️  AtlasHelper not available - using fallback PNG assets');
        }

        // Background gradient (gold to white)
        this.createBackground();

        // Celebration particles
        this.createCelebrationParticles();

        // Use complete victory panel (Option B - pre-made panel asset)
        this.createCompleteVictoryPanel();

        // Victory music
        this.playVictoryMusic();

        console.log('✓ Victory scene ready with complete UI panel');
    }

    /**
     * Create professional AAA victory panel
     */
    createCompleteVictoryPanel() {
        const centerX = GAME.WIDTH / 2;
        const centerY = GAME.HEIGHT / 2;

        // ATLAS ONLY - No PNG fallback
        if (!this.atlasHelper) {
            console.error('❌ CRITICAL: AtlasHelper not available! Cannot create victory panel.');
            return;
        }

        // PROFESSIONAL: Large victory panel
        const panel = this.atlasHelper.createSprite(centerX, centerY, 'panel_large');
        const targetScale = 1.2;

        panel.setScale(0);
        panel.setDepth(10);

        // Dramatic entrance
        this.tweens.add({
            targets: panel,
            scaleX: targetScale,
            scaleY: targetScale,
            duration: 800,
            ease: 'Elastic.easeOut',
            delay: 300
        });

        // PROFESSIONAL: Decorative corner stars
        const cornerStars = [
            { x: centerX - 280, y: centerY - 220 },
            { x: centerX + 280, y: centerY - 220 },
            { x: centerX - 280, y: centerY + 220 },
            { x: centerX + 280, y: centerY + 220 }
        ];

        cornerStars.forEach((pos, i) => {
            const star = this.atlasHelper.createSprite(pos.x, pos.y, 'star_yellow_filled');
            star.setDepth(11);
            star.setScale(0);

            this.tweens.add({
                targets: star,
                scaleX: 1.0,
                scaleY: 1.0,
                duration: 600,
                ease: 'Back.easeOut',
                delay: 600 + (i * 100)
            });

            // Twinkle animation
            this.tweens.add({
                targets: star,
                alpha: 0.5,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 1500 + (i * 200),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
                delay: 1200
            });
        });

        // PROFESSIONAL: "VICTORY!" text
        const victoryText = this.add.text(centerX, centerY - 150, 'VICTORY!', {
            fontSize: '72px',
            fontFamily: 'Arial Black',
            color: '#FFFFFF',
            stroke: '#4A2C2A',
            strokeThickness: 10,
            shadow: {
                offsetX: 4,
                offsetY: 4,
                color: '#000000',
                blur: 10,
                fill: true
            }
        });
        victoryText.setOrigin(0.5);
        victoryText.setDepth(12);
        victoryText.setAlpha(0);

        this.tweens.add({
            targets: victoryText,
            alpha: 1,
            y: centerY - 130,
            duration: 800,
            ease: 'Bounce.easeOut',
            delay: 1000
        });

        // Pulsing animation
        this.tweens.add({
            targets: victoryText,
            scaleX: 1.15,
            scaleY: 1.15,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            delay: 1800
        });

        // PROFESSIONAL: Score display
        const scoreText = this.add.text(
            centerX,
            centerY - 40,
            `Score: ${this.finalScore}`,
            {
                fontSize: '48px',
                fontFamily: 'Arial Black',
                color: '#FFD700',
                stroke: '#000000',
                strokeThickness: 6
            }
        );
        scoreText.setOrigin(0.5);
        scoreText.setDepth(12);
        scoreText.setAlpha(0);

        this.tweens.add({
            targets: scoreText,
            alpha: 1,
            duration: 600,
            delay: 1400
        });

        // PROFESSIONAL: Star rating display
        this.createProfessionalStarRating(centerX, centerY + 40);

        // PROFESSIONAL: Continue button
        const continueBtn = this.atlasHelper.createButton(
            centerX,
            centerY + 160,
            'button_play_green',
            () => this.handleContinue()
        );

        const btnText = this.add.text(centerX, centerY + 160, 'CONTINUE', {
            fontSize: '32px',
            fontFamily: 'Arial Black',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 6
        });
        btnText.setOrigin(0.5);
        btnText.setDepth(101);

        // Entrance animations for button
        continueBtn.setAlpha(0);
        btnText.setAlpha(0);

        this.tweens.add({
            targets: [continueBtn, btnText],
            alpha: 1,
            duration: 600,
            delay: 1800
        });

        // Keyboard shortcuts
        this.input.keyboard.once('keydown-SPACE', () => this.handleContinue());
        this.input.keyboard.once('keydown-ESC', () => this.handleMenu());
    }

    /**
     * Create professional star rating display
     */
    createProfessionalStarRating(centerX, centerY) {
        const starSpacing = 80;
        const startX = centerX - starSpacing;

        for (let i = 0; i < 3; i++) {
            const x = startX + (i * starSpacing);
            const filled = i < this.starRating;

            const star = this.atlasHelper.createSprite(
                x, centerY,
                filled ? 'star_rating_yellow' : 'star_rating_brown'
            );
            star.setDepth(12);
            star.setScale(0);

            // Pop in with stagger
            this.tweens.add({
                targets: star,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 500,
                ease: 'Back.easeOut',
                delay: 1600 + (i * 150)
            });

            // Bounce for filled stars
            if (filled) {
                this.tweens.add({
                    targets: star,
                    scaleY: 1.3,
                    duration: 400,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut',
                    delay: 2100 + (i * 150)
                });

                // Sparkle burst
                this.time.delayedCall(1600 + (i * 150), () => {
                    this.createSparkle(x, centerY);
                });
            }
        }
    }

    /**
     * Create professional AAA background
     */
    createBackground() {
        // Rich gradient layers
        const bg1 = this.add.rectangle(
            GAME.WIDTH / 2, GAME.HEIGHT / 2,
            GAME.WIDTH, GAME.HEIGHT,
            0x2d1b4e, 1.0
        );

        const bg2 = this.add.rectangle(
            GAME.WIDTH / 2, GAME.HEIGHT / 2,
            GAME.WIDTH, GAME.HEIGHT,
            0xFFD700, 0.6
        );

        // Pulsing gold glow
        this.tweens.add({
            targets: bg2,
            alpha: 0.8,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        if (!this.atlasHelper) return;

        // PROFESSIONAL: Massive rotating sunburst behind panel
        const centerX = GAME.WIDTH / 2;
        const centerY = GAME.HEIGHT / 2;

        const sunburst = this.atlasHelper.createSprite(centerX, centerY, 'sunburst_rays');
        sunburst.setScale(1.5);
        sunburst.setAlpha(0.2);
        sunburst.setDepth(5);
        sunburst.setBlendMode(Phaser.BlendModes.ADD);

        // Eternal rotation
        this.tweens.add({
            targets: sunburst,
            angle: 360,
            duration: 20000,
            repeat: -1,
            ease: 'Linear'
        });

        // Pulsing scale
        this.tweens.add({
            targets: sunburst,
            scaleX: 1.8,
            scaleY: 1.8,
            alpha: 0.3,
            duration: 3000,
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
     * PROGRESSION: Create new high score indicator
     */
    createNewHighScoreIndicator() {
        const text = this.add.text(
            GAME.WIDTH / 2,
            200,
            'NEW HIGH SCORE!',
            {
                fontSize: '36px',
                fontFamily: 'Arial Black',
                color: '#FFD700',
                stroke: '#FF0000',
                strokeThickness: 6
            }
        );
        text.setOrigin(0.5);
        text.setAlpha(0);

        // Pulsing glow effect
        this.tweens.add({
            targets: text,
            alpha: 1,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 500,
            ease: 'Bounce.easeOut'
        });

        this.tweens.add({
            targets: text,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Sparkle particles
        this.createSparkle(GAME.WIDTH / 2, 200);
    }

    /**
     * PROGRESSION: Create achievement notification panels
     */
    createAchievementNotifications() {
        console.log(`🏆 Showing ${this.newAchievements.length} new achievements`);

        const startY = 300;
        const spacing = 80;

        // Get achievement details from progression manager
        const allAchievements = progressionManager.getAchievementProgress();

        this.newAchievements.forEach((achievementId, index) => {
            const achievementData = allAchievements.find(a => a.id === achievementId);
            if (!achievementData) return;

            const y = startY + (index * spacing);

            // Create achievement panel
            const panel = this.add.rectangle(
                GAME.WIDTH / 2, y,
                450, 70,
                0x000000, 0.8
            );
            panel.setStrokeStyle(3, 0xFFD700, 1.0);
            panel.setAlpha(0);

            // Achievement icon
            const icon = this.add.text(
                GAME.WIDTH / 2 - 200, y,
                achievementData.icon || '🏆',
                {
                    fontSize: '40px'
                }
            );
            icon.setOrigin(0.5);
            icon.setAlpha(0);

            // Achievement text
            const titleText = this.add.text(
                GAME.WIDTH / 2 - 150, y - 15,
                achievementData.name || 'Achievement',
                {
                    fontSize: '20px',
                    fontFamily: 'Arial Black',
                    color: '#FFD700'
                }
            );
            titleText.setOrigin(0, 0.5);
            titleText.setAlpha(0);

            const descText = this.add.text(
                GAME.WIDTH / 2 - 150, y + 10,
                achievementData.description || '',
                {
                    fontSize: '14px',
                    fontFamily: 'Arial',
                    color: '#FFFFFF'
                }
            );
            descText.setOrigin(0, 0.5);
            descText.setAlpha(0);

            // Animate in with delay based on index
            const delay = index * 400;

            this.tweens.add({
                targets: [panel, icon, titleText, descText],
                alpha: 1,
                x: '+=10',
                duration: 400,
                delay: delay,
                ease: 'Back.easeOut'
            });

            // Flash effect on appearance
            this.time.delayedCall(delay, () => {
                this.cameras.main.flash(200, 255, 215, 0);
            });
        });
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
