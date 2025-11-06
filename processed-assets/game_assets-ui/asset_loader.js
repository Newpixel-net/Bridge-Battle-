/**
 * Game Assets Loader for HTML5/JavaScript
 * Auto-generated asset loader with preloading functionality
 */

class GameAssets {
    constructor() {
        this.assets = {};
        this.loaded = 0;
        this.total = 0;
        this.basePath = 'assets/game_assets/'; // Adjust this to your asset directory
        
        // Asset definitions from manifest
        this.manifest = {
            panels: [
                'panel_win_complete.png',
                'panel_lose_complete.png'
            ],
            stars: {
                filled: [
                    'star_filled_01.png', 'star_filled_02.png', 'star_filled_03.png',
                    'star_filled_04.png', 'star_filled_05.png', 'star_filled_06.png'
                ],
                empty: [
                    'star_empty_01.png', 'star_empty_02.png', 'star_empty_03.png',
                    'star_empty_04.png', 'star_empty_05.png', 'star_empty_06.png',
                    'star_empty_07.png'
                ]
            },
            counters: [
                'counter_hearts_time.png',
                'counter_coins.png',
                'counter_gems.png'
            ],
            icons: [
                'icon_gem_large.png', 'icon_coin_01.png', 'icon_coin_02.png',
                'icon_coin_03.png', 'icon_heart.png'
            ],
            badges: [
                'badge_level_24.png', 'badge_level_25.png', 'badge_level_26.png'
            ],
            buttons: {
                menu: [
                    'button_new_game.png', 'button_resume.png', 'button_settings.png',
                    'button_shop.png', 'button_exit.png'
                ],
                continue: [
                    'button_continue_win.png', 'button_continue_lose.png'
                ]
            },
            decorations: [
                'decoration_grass_left.png', 'decoration_grass_right.png'
            ]
        };
    }

    /**
     * Preload all game assets
     * @param {Function} onProgress - Callback for progress updates (loaded, total)
     * @param {Function} onComplete - Callback when all assets are loaded
     */
    preloadAll(onProgress, onComplete) {
        const allFiles = this._flattenManifest();
        this.total = allFiles.length;
        this.loaded = 0;

        allFiles.forEach(filename => {
            const img = new Image();
            
            img.onload = () => {
                this.loaded++;
                if (onProgress) {
                    onProgress(this.loaded, this.total);
                }
                
                if (this.loaded === this.total && onComplete) {
                    onComplete();
                }
            };
            
            img.onerror = () => {
                console.error(`Failed to load: ${filename}`);
                this.loaded++;
                if (this.loaded === this.total && onComplete) {
                    onComplete();
                }
            };
            
            const key = filename.replace('.png', '');
            this.assets[key] = img;
            img.src = this.basePath + filename;
        });
    }

    /**
     * Get a loaded asset by name
     * @param {string} name - Asset name (without .png extension)
     * @returns {Image} The loaded image
     */
    get(name) {
        return this.assets[name];
    }

    /**
     * Draw an asset on canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string} name - Asset name
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} scale - Scale factor (optional)
     */
    draw(ctx, name, x, y, scale = 1) {
        const img = this.get(name);
        if (img && img.complete) {
            const width = img.width * scale;
            const height = img.height * scale;
            ctx.drawImage(img, x, y, width, height);
        }
    }

    /**
     * Helper method to flatten manifest into array of filenames
     */
    _flattenManifest() {
        const files = [];
        
        const flatten = (obj) => {
            if (Array.isArray(obj)) {
                files.push(...obj);
            } else if (typeof obj === 'object') {
                Object.values(obj).forEach(flatten);
            }
        };
        
        flatten(this.manifest);
        return files;
    }
}

// Usage Example:
// --------------

// Initialize the asset loader
const gameAssets = new GameAssets();

// Preload all assets with progress tracking
gameAssets.preloadAll(
    (loaded, total) => {
        console.log(`Loading: ${loaded}/${total} (${Math.round(loaded/total*100)}%)`);
        // Update your loading bar here
    },
    () => {
        console.log('All assets loaded!');
        // Start your game here
        startGame();
    }
);

// Example game functions:
function startGame() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    // Draw example assets
    gameAssets.draw(ctx, 'panel_win_complete', 50, 50);
    gameAssets.draw(ctx, 'star_filled_01', 200, 100, 1.5);
    gameAssets.draw(ctx, 'button_continue_win', 100, 300);
    
    // Or access the image directly
    const coinIcon = gameAssets.get('icon_coin_01');
    ctx.drawImage(coinIcon, 300, 150);
}

// Star rating system example
function drawStarRating(ctx, x, y, stars, maxStars = 3) {
    for (let i = 0; i < maxStars; i++) {
        const starName = i < stars ? `star_filled_0${i+1}` : `star_empty_0${i+1}`;
        gameAssets.draw(ctx, starName, x + (i * 80), y);
    }
}

// Button interaction example
class Button {
    constructor(assetName, x, y, onClick) {
        this.img = gameAssets.get(assetName);
        this.x = x;
        this.y = y;
        this.width = this.img.width;
        this.height = this.img.height;
        this.onClick = onClick;
    }
    
    draw(ctx) {
        ctx.drawImage(this.img, this.x, this.y);
    }
    
    isClicked(mouseX, mouseY) {
        return mouseX >= this.x && mouseX <= this.x + this.width &&
               mouseY >= this.y && mouseY <= this.y + this.height;
    }
}

// Create buttons
const buttons = [
    new Button('button_new_game', 100, 50, () => console.log('New Game')),
    new Button('button_resume', 100, 140, () => console.log('Resume')),
    new Button('button_settings', 100, 230, () => console.log('Settings'))
];

// Handle clicks
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    buttons.forEach(button => {
        if (button.isClicked(x, y)) {
            button.onClick();
        }
    });
});
