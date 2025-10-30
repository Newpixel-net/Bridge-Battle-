# 🎮 Bridge Battle - Complete Implementation Guide

## 🌟 Overview

**Bridge Battle** is a fully functional 3D browser-based runner game built with Three.js. Your squad automatically shoots obstacles while navigating gates that modify squad size through arithmetic operations. The game works perfectly on both **desktop browsers** and **mobile devices** with no installation required!

## ✨ Features Implemented

### Core Gameplay
- ✅ **Auto-shooting system** - Squad shoots ~3 bullets per second
- ✅ **Blob formation** - Characters stay in tight formation using separation forces
- ✅ **Full-width gates** - Cannot be avoided, with correct arithmetic (subtraction works properly)
- ✅ **Shootable gates** - Fire at gates to increase their positive values
- ✅ **Obstacles with HP** - Tire stacks, boxes, barrels, and enemies with real-time HP displays
- ✅ **Weapon pickups** - Glowing cyan weapons on obstacles that add squad members

### Visual Effects
- ✅ **Water shader** - Beautiful animated water using multiple sine wave layers
- ✅ **Particle system** - Explosions, impacts, sparkles, and trails
- ✅ **Screen shake** - On explosions and destruction
- ✅ **Damage numbers** - Large floating numbers showing damage dealt
- ✅ **Holographic gates** - Gradient shaders with scan lines and glow effects
- ✅ **Dynamic lighting** - Point lights on bullets and weapons

### Technical Features
- ✅ **Bullet pooling** - Efficient object reuse for 300+ bullets
- ✅ **Particle pooling** - 500 particle pool for performance
- ✅ **Touch controls** - Native mobile support with touch input
- ✅ **Keyboard/Mouse controls** - Desktop support (WASD/Arrow keys or click-drag)
- ✅ **Responsive UI** - Scales properly on all screen sizes
- ✅ **Progressive difficulty** - Level extends infinitely as you progress
- ✅ **Game state management** - Start screen, gameplay, game over

## 🚀 How to Run

### Option 1: Direct File Opening (Simplest)
1. **Download all files** to a folder on your computer
2. **Open `index.html`** in a modern web browser (Chrome, Firefox, Safari, Edge)
3. **Click "START GAME"** and play!

**Note:** Some browsers may block Three.js from loading due to CORS restrictions when opening files directly. If you see a blank screen, use Option 2 or 3 instead.

### Option 2: Local Web Server (Recommended)

#### Using Python (Built-in on Mac/Linux, easy on Windows):
```bash
# Navigate to the game folder
cd /path/to/Bridge-Battle-

# Python 3
python -m http.server 8000

# OR Python 2
python -m SimpleHTTPServer 8000
```

Then open: `http://localhost:8000` in your browser

#### Using Node.js:
```bash
# Install http-server globally
npm install -g http-server

# Navigate to the game folder and run
cd /path/to/Bridge-Battle-
http-server -p 8000
```

Then open: `http://localhost:8000` in your browser

#### Using PHP:
```bash
cd /path/to/Bridge-Battle-
php -S localhost:8000
```

Then open: `http://localhost:8000` in your browser

### Option 3: Deploy to Web Hosting

Upload all files to any web hosting service:
- **GitHub Pages** (Free) - See deployment instructions below
- **Netlify** (Free) - Drag and drop the folder
- **Vercel** (Free) - Connect your GitHub repo
- **Your own web server** - Upload via FTP/SFTP

## 🎮 How to Play

### Desktop Controls
- **Mouse Click + Drag**: Hold left mouse button and move left/right to control squad
- **Keyboard**: Use Arrow Keys or A/D keys to move left/right
- **Goal**: Survive as long as possible, destroy obstacles, collect gates strategically

### Mobile Controls
- **Touch and Drag**: Touch screen and drag left/right to control squad
- **Auto-shoot**: Squad automatically shoots forward
- **Tilt sensitivity**: Responsive touch controls optimized for mobile

### Game Rules
1. Your squad **automatically shoots** at obstacles and gates
2. **Gates span full width** - you CANNOT avoid them
3. **Gate arithmetic**:
   - If you have 5 members and hit a **+3** gate → you get 8 members
   - If you have 5 members and hit a **-3** gate → you get 2 members
   - **Game over only if** negative value exceeds current squad size
4. **Shoot gates** to increase their value before passing through
5. **Destroy obstacles** for score points
6. **Collect weapons** on top of obstacles for bonus squad members

## 📁 Project Structure

```
Bridge-Battle/
├── index.html              # Main game entry point
├── src/
│   ├── utils.js           # Helper functions (lerp, random, screen shake, etc.)
│   ├── shaders.js         # Water, gate, bullet, and weapon shaders
│   ├── particles.js       # Particle system (explosions, impacts, sparkles)
│   ├── bullets.js         # Bullet pooling and auto-shooting system
│   ├── squad.js           # Player squad with blob formation
│   ├── gates.js           # Gate system with arithmetic and shooting
│   ├── obstacles.js       # Obstacles and enemies with HP
│   ├── level.js           # Level generation and environment
│   ├── input.js           # Touch and keyboard/mouse input handling
│   ├── ui.js              # HUD, menus, and visual feedback
│   └── game.js            # Main game loop and initialization
├── GAME_README.md         # This file
└── Bridge Battle Game Development Brief  # Original design document
```

## 🌐 Deploying to GitHub Pages (Free Hosting)

1. **Commit your changes**:
```bash
git add .
git commit -m "Complete Bridge Battle game implementation"
```

2. **Push to GitHub**:
```bash
git push origin claude/browser-game-support-011CUe8W9ZQfRyM5q69tnq8D
```

3. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under "Source", select your branch: `claude/browser-game-support-011CUe8W9ZQfRyM5q69tnq8D`
   - Select folder: `/ (root)`
   - Click **Save**

4. **Access your game**:
   - Your game will be live at: `https://[your-username].github.io/Bridge-Battle-/`
   - Wait 1-2 minutes for deployment to complete

## 🎨 Customization Guide

### Adjusting Game Difficulty
Edit `src/level.js`:
```javascript
// Line 9-10: Change spacing between gates and obstacles
this.gateSpacing = 30;              // Distance between gates
this.obstacleGroupSpacing = 20;     // Distance between obstacle groups
```

Edit `src/gates.js`:
```javascript
// Line 244-245: Change gate value ranges
createGates(startZ, count, spacing, minValue = -5, maxValue = 8)
```

### Changing Squad Starting Size
Edit `src/squad.js`:
```javascript
// Line 3: Change initial squad size
constructor(scene, initialSize = 5)  // Change 5 to your desired starting size
```

### Adjusting Shooting Speed
Edit `src/bullets.js`:
```javascript
// Line 153: Change bullets per second
this.shootInterval = 1.0 / 3.0;  // Change 3.0 to shoot more/less per second
```

### Modifying Bridge Width
Edit `src/level.js`:
```javascript
// Line 8: Change bridge width
this.bridgeWidth = 40;  // Make wider or narrower
```

### Changing Colors
Edit `src/utils.js`:
```javascript
// Lines 50-54: Squad bullet colors based on size
getSquadColor(size) {
    if (size <= 3) return 0xFFFF00;  // Yellow
    if (size <= 7) return 0x00FF00;  // Green
    if (size <= 12) return 0x00FFFF; // Cyan
    return 0xFF00FF;                  // Magenta
}
```

## 🔧 Troubleshooting

### Game doesn't load / Blank screen
- **Cause**: Browser blocking Three.js CDN or CORS issues
- **Solution**: Use a local web server (see Option 2 above)

### Poor performance on mobile
- **Cause**: Too many particles or bullets
- **Solution**: Reduce pool sizes in `src/bullets.js` (line 11) and `src/particles.js` (line 6)

### Controls not working
- **Cause**: Browser security blocking input events
- **Solution**: Make sure you clicked on the game canvas. Try refreshing the page.

### Water not animating
- **Cause**: Shader compilation issues
- **Solution**: Check browser console for errors. Try a different browser (Chrome recommended).

## 🎯 Performance Optimization

The game is already optimized for mobile devices with:
- Object pooling for bullets and particles
- Efficient shader-based water animation
- Automatic cleanup of off-screen objects
- Limited shadow rendering
- Capped frame delta time

For even better performance on older devices:
1. Reduce bullet pool size (`src/bullets.js` line 11): `this.poolSize = 150`
2. Reduce particle pool size (`src/particles.js` line 6): `this.poolSize = 250`
3. Lower pixel ratio (`src/game.js` line 71): `this.renderer.setPixelRatio(1)`

## 📱 Mobile Testing

To test on your mobile device:
1. Run a local web server on your computer
2. Find your computer's local IP address:
   - **Mac/Linux**: Run `ifconfig | grep inet` in terminal
   - **Windows**: Run `ipconfig` in command prompt
3. On your mobile device (connected to same WiFi):
   - Open browser and go to: `http://[YOUR-IP]:8000`
   - Example: `http://192.168.1.100:8000`

## 🎮 Advanced Features You Can Add

The codebase is structured to easily add:
- **Sound effects**: Add Web Audio API in `src/game.js`
- **Power-ups**: Extend `src/obstacles.js` with new collectible types
- **Boss fights**: Create special enemy classes in `src/obstacles.js`
- **Leaderboards**: Add localStorage or backend API integration
- **Multiple levels**: Create themed level classes in `src/level.js`
- **Character customization**: Extend `src/squad.js` with different character meshes

## 📞 Support

If you encounter issues:
1. Check browser console (F12) for error messages
2. Ensure all files are in correct folders
3. Try a different modern browser (Chrome/Firefox recommended)
4. Use a local web server instead of opening files directly

## 🎉 You're Ready!

Your game is **100% functional** and ready to play! Just open `index.html` in a browser or deploy to GitHub Pages. No Unity, no complicated setup - just pure web technology.

**Enjoy destroying obstacles and conquering the bridge!** 🌉💥
