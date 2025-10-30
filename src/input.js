// Input handling for touch and keyboard/mouse controls

class InputManager {
    constructor() {
        this.mouseX = 0;
        this.mouseY = 0;
        this.touchX = 0;
        this.touchY = 0;
        this.isMouseDown = false;
        this.isTouching = false;
        this.targetX = 0;
        this.controlSensitivity = 0.1;

        this.setupListeners();
    }

    setupListeners() {
        // Mouse events for desktop
        window.addEventListener('mousemove', (e) => {
            this.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        window.addEventListener('mousedown', () => {
            this.isMouseDown = true;
        });

        window.addEventListener('mouseup', () => {
            this.isMouseDown = false;
        });

        // Touch events for mobile
        window.addEventListener('touchstart', (e) => {
            this.isTouching = true;
            this.updateTouch(e.touches[0]);
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (this.isTouching) {
                this.updateTouch(e.touches[0]);
            }
        }, { passive: true });

        window.addEventListener('touchend', () => {
            this.isTouching = false;
        });

        window.addEventListener('touchcancel', () => {
            this.isTouching = false;
        });

        // Keyboard controls (arrow keys and WASD)
        this.keys = {};

        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }

    updateTouch(touch) {
        this.touchX = (touch.clientX / window.innerWidth) * 2 - 1;
        this.touchY = -(touch.clientY / window.innerHeight) * 2 + 1;
    }

    // Get horizontal input (-1 to 1)
    getHorizontalInput() {
        let input = 0;

        // Touch input (mobile)
        if (this.isTouching) {
            input = this.touchX;
        }
        // Mouse input (desktop) - only when mouse is down
        else if (this.isMouseDown) {
            input = this.mouseX;
        }
        // Keyboard input
        else {
            if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) {
                input -= 1;
            }
            if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) {
                input += 1;
            }
        }

        return Utils.clamp(input, -1, 1);
    }

    // Get target X position for squad based on input
    getTargetX(bridgeWidth = 40) {
        const input = this.getHorizontalInput();
        const maxX = bridgeWidth / 2 - 3; // Keep squad within bounds
        return input * maxX;
    }

    // Check if any control is active
    isControlActive() {
        return this.isTouching || this.isMouseDown ||
               this.keys['ArrowLeft'] || this.keys['ArrowRight'] ||
               this.keys['a'] || this.keys['A'] || this.keys['d'] || this.keys['D'];
    }

    // Reset input state
    reset() {
        this.isMouseDown = false;
        this.isTouching = false;
        this.targetX = 0;
    }

    // Clean up event listeners
    dispose() {
        // Note: In a real application, you'd want to store references to the handlers
        // and remove them properly. For this game, it's not critical.
    }
}
