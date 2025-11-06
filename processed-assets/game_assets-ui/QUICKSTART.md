# 🚀 Quick Start Guide - Game Assets Integration

## ⚡ 5-Minute Setup

### Step 1: Add Assets to Your Project
```
your-game/
├── assets/
│   └── game_assets/
│       ├── panel_win_complete.png
│       ├── star_filled_01.png
│       ├── button_new_game.png
│       └── ... (all 35 assets)
├── js/
│   └── asset_loader.js  ← Copy this file
└── index.html
```

### Step 2: Initialize in Your HTML
```html
<!DOCTYPE html>
<html>
<head>
    <title>My Game</title>
</head>
<body>
    <canvas id="gameCanvas" width="800" height="600"></canvas>
    <script src="js/asset_loader.js"></script>
    <script src="js/game.js"></script>
</body>
</html>
```

### Step 3: Load Assets in Your Game Code
```javascript
// game.js
const gameAssets = new GameAssets();

// Show loading screen
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

gameAssets.preloadAll(
    (loaded, total) => {
        // Update loading bar
        const percent = Math.round((loaded / total) * 100);
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(100, 280, (canvas.width - 200) * (loaded/total), 40);
        ctx.fillStyle = '#fff';
        ctx.font = '24px Arial';
        ctx.fillText(`Loading... ${percent}%`, 320, 310);
    },
    () => {
        // Assets loaded! Start game
        startGame();
    }
);

function startGame() {
    console.log('All assets loaded!');
    // Your game logic here
    gameLoop();
}
```

---

## 🎯 Common Use Cases

### 1. Display Level Completion
```javascript
function showLevelComplete(won, stars, score) {
    // Draw appropriate panel
    const panel = won ? 'panel_win_complete' : 'panel_lose_complete';
    gameAssets.draw(ctx, panel, 225, 90);
    
    // Note: Panels already include stars, scores, buttons
    // For custom overlay, use individual assets instead
}
```

### 2. Create Dynamic Star Rating
```javascript
function drawStars(x, y, earnedStars) {
    for (let i = 0; i < 3; i++) {
        const star = i < earnedStars 
            ? `star_filled_0${i+1}` 
            : `star_empty_0${i+1}`;
        gameAssets.draw(ctx, star, x + (i * 80), y);
    }
}

// Usage
drawStars(300, 100, 2); // Shows 2 filled, 1 empty
```

### 3. Create Custom Resource Counter
```javascript
function drawResourceCounter(type, value, x, y) {
    // Background
    ctx.fillStyle = 'rgba(74, 123, 167, 0.9)';
    ctx.roundRect(x, y, 200, 60, 10);
    ctx.fill();
    
    // Icon
    const iconMap = {
        'coins': 'icon_coin_01',
        'gems': 'icon_gem_large',
        'lives': 'icon_heart'
    };
    gameAssets.draw(ctx, iconMap[type], x + 10, y + 10, 0.7);
    
    // Value text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 28px Arial';
    ctx.fillText(value, x + 70, y + 40);
}

// Usage
drawResourceCounter('coins', 2655, 50, 50);
drawResourceCounter('gems', 89, 50, 120);
```

### 4. Interactive Menu Buttons
```javascript
class MenuButton {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.asset = `button_${type}`;
        const img = gameAssets.get(this.asset);
        this.width = img.width;
        this.height = img.height;
        this.hovered = false;
    }
    
    draw(ctx) {
        ctx.save();
        
        // Hover effect
        if (this.hovered) {
            ctx.shadowColor = 'rgba(255, 255, 0, 0.8)';
            ctx.shadowBlur = 15;
        }
        
        gameAssets.draw(ctx, this.asset, this.x, this.y);
        ctx.restore();
    }
    
    contains(mx, my) {
        return mx >= this.x && mx <= this.x + this.width &&
               my >= this.y && my <= this.y + this.height;
    }
}

// Create menu
const buttons = [
    new MenuButton('new_game', 285, 100),
    new MenuButton('resume', 285, 190),
    new MenuButton('settings', 285, 280),
    new MenuButton('shop', 285, 370),
    new MenuButton('exit', 285, 460)
];

// Handle clicks
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    buttons.forEach(btn => {
        if (btn.contains(x, y)) {
            handleButtonClick(btn.type);
        }
    });
});

// Handle hover
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    buttons.forEach(btn => {
        btn.hovered = btn.contains(x, y);
    });
});
```

### 5. Level Selection Screen
```javascript
function drawLevelSelection() {
    const levels = [
        { num: 24, state: 'completed', stars: 3 },
        { num: 25, state: 'current', stars: 0 },
        { num: 26, state: 'locked', stars: 0 }
    ];
    
    levels.forEach((level, i) => {
        const badge = `badge_level_${level.num}`;
        const x = 200 + (i * 150);
        const y = 250;
        
        gameAssets.draw(ctx, badge, x, y);
        
        // Add click detection for unlocked levels
        if (level.state !== 'locked') {
            // Make clickable
        }
    });
}
```

---

## 🎨 Styling Tips

### Scale Assets for Different Screen Sizes
```javascript
// Calculate scale based on canvas size
const baseWidth = 800;
const scale = canvas.width / baseWidth;

// Draw with scale
const img = gameAssets.get('panel_win_complete');
ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

// Or use the built-in method
gameAssets.draw(ctx, 'panel_win_complete', x, y, scale);
```

### Add Drop Shadows
```javascript
ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
ctx.shadowBlur = 10;
ctx.shadowOffsetX = 3;
ctx.shadowOffsetY = 3;
gameAssets.draw(ctx, 'button_new_game', x, y);
ctx.shadowColor = 'transparent'; // Reset
```

### Animate Assets
```javascript
// Pulse animation
let pulseScale = 1;
let pulseDirection = 0.01;

function animateButton() {
    pulseScale += pulseDirection;
    if (pulseScale > 1.1 || pulseScale < 0.9) {
        pulseDirection *= -1;
    }
    
    ctx.save();
    ctx.translate(x + width/2, y + height/2);
    ctx.scale(pulseScale, pulseScale);
    ctx.translate(-(x + width/2), -(y + height/2));
    gameAssets.draw(ctx, 'button_continue_win', x, y);
    ctx.restore();
}
```

---

## 📱 Responsive Design

### Handle Different Screen Sizes
```javascript
function setupCanvas() {
    const container = document.getElementById('gameContainer');
    const ratio = window.devicePixelRatio || 1;
    
    canvas.width = container.clientWidth * ratio;
    canvas.height = container.clientHeight * ratio;
    canvas.style.width = container.clientWidth + 'px';
    canvas.style.height = container.clientHeight + 'px';
    
    ctx.scale(ratio, ratio);
}

window.addEventListener('resize', setupCanvas);
setupCanvas();
```

---

## ⚠️ Common Pitfalls

### ❌ DON'T: Draw before assets load
```javascript
// BAD
const img = gameAssets.get('star_filled_01');
ctx.drawImage(img, x, y); // May not be loaded yet!
```

### ✅ DO: Wait for preload completion
```javascript
// GOOD
gameAssets.preloadAll(null, () => {
    const img = gameAssets.get('star_filled_01');
    ctx.drawImage(img, x, y); // Guaranteed to be loaded
});
```

---

## 🔧 Optimization

### Use Sprite Sheets (Advanced)
For production, combine assets into sprite sheets:
```javascript
// Tools: TexturePacker, Shoebox, etc.
// Results in 1 HTTP request instead of 35
```

### Lazy Load by Scene
```javascript
// Load only menu assets for menu scene
const menuAssets = ['button_new_game', 'button_resume', ...];
// Load game assets when entering game
const gameAssets = ['star_filled_01', 'counter_coins', ...];
```

---

## 📊 Asset Reference

**Complete Panels (Use as-is):**
- `panel_win_complete` - Victory screen
- `panel_lose_complete` - Defeat screen

**Build Your Own UI:**
- Stars: `star_filled_01` to `star_filled_06`, `star_empty_01` to `star_empty_07`
- Icons: `icon_coin_01`, `icon_gem_large`, `icon_heart`
- Buttons: `button_new_game`, `button_resume`, etc.
- Badges: `badge_level_24`, `badge_level_25`, `badge_level_26`

---

## 🆘 Need Help?

Check these files:
- `README.md` - Complete documentation
- `integration_demo.html` - Working examples
- `asset_loader.js` - Full implementation
- `assets_manifest.json` - Asset metadata

---

**Ready to build? Your assets are prepped and waiting! 🎮**
