import Phaser from 'phaser';

/**
 * TestScene - Verify ONE mechanic at a time
 * This scene tests ONLY player movement with keyboard
 */
export default class TestScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TestScene' });
    }

    create() {
        console.log('🧪 TEST SCENE: Player Movement Test');

        // Simple background
        this.add.rectangle(960, 540, 1920, 1080, 0x87CEEB);

        // Create a simple player sprite (red square for now)
        const graphics = this.add.graphics();
        graphics.fillStyle(0xFF0000);
        graphics.fillRect(0, 0, 64, 64);
        graphics.generateTexture('test-player', 64, 64);
        graphics.destroy();

        // Create player
        this.player = this.add.sprite(960, 540, 'test-player');

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');

        // Instructions
        this.add.text(960, 100, 'TEST: Can you move the red square?', {
            fontSize: '48px',
            color: '#000000'
        }).setOrigin(0.5);

        this.add.text(960, 160, 'Arrow Keys or WASD to move', {
            fontSize: '32px',
            color: '#333333'
        }).setOrigin(0.5);

        // Debug text
        this.debugText = this.add.text(20, 20, '', {
            fontSize: '24px',
            color: '#000000',
            backgroundColor: '#FFFFFF',
            padding: { x: 10, y: 10 }
        });
    }

    update() {
        const speed = 5;
        let moved = false;
        let direction = '';

        // Check input and move
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            this.player.x -= speed;
            moved = true;
            direction = 'LEFT';
        }
        if (this.cursors.right.isDown || this.wasd.D.isDown) {
            this.player.x += speed;
            moved = true;
            direction = 'RIGHT';
        }
        if (this.cursors.up.isDown || this.wasd.W.isDown) {
            this.player.y -= speed;
            moved = true;
            direction = 'UP';
        }
        if (this.cursors.down.isDown || this.wasd.S.isDown) {
            this.player.y += speed;
            moved = true;
            direction = 'DOWN';
        }

        // Update debug info
        this.debugText.setText(
            `Player Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})\n` +
            `Input: ${moved ? direction : 'NONE'}\n` +
            `Status: ${moved ? '✓ MOVEMENT WORKING' : '○ Waiting for input...'}`
        );
    }
}
