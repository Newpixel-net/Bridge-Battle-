# Bridge Battle

🎮 A mobile-style 3D runner game where you control an auto-shooting squad navigating a wide bridge while destroying obstacles and managing squad size through arithmetic gates.

![Bridge Battle](reference-images/preview.png)

## 📋 Overview

Bridge Battle is a satisfying destruction game featuring:
- **Auto-shooting squad** with tight blob formation
- **Full-width arithmetic gates** that modify squad size (+5, -3, etc.)
- **Destructible obstacles** (tire stacks) with visible HP
- **Wide bridge environment** with Golden Gate-style pillars
- **Animated water** underneath with vertex shader waves
- **Particle effects** and screen shake for satisfying destruction
- **Mobile-optimized** targeting 30+ FPS

## 🎯 Core Gameplay

- Control a squad of characters that automatically shoot forward
- Navigate left/right on a wide bridge (40+ units)
- Encounter gates spanning the full bridge width
- Gates modify squad size through arithmetic: 5 characters + gate(+3) = 8 characters
- Shoot destructible obstacles to clear the path and earn points
- Collect weapon pickups for bonuses
- Game over when squad size reaches zero

## 🚀 Quick Start

### Prerequisites
- Unity 2022.3 LTS or newer
- TextMeshPro package
- Target platform: Android/iOS (mobile)

### Installation

1. **Clone this repository**
   ```bash
   git clone https://github.com/Newpixel-net/Bridge-Battle-.git
   cd Bridge-Battle-
   ```

2. **Open in Unity**
   - Launch Unity Hub
   - Click "Add" → Navigate to this folder
   - Open the project

3. **Import Required Assets**
   - Window → TextMeshPro → Import TMP Essential Resources
   - (Optional) Install LeanTween from Asset Store

4. **Follow Setup Guide**
   - Read `UNITY_SETUP_GUIDE.md` for detailed setup instructions
   - Follow `IMPLEMENTATION_CHECKLIST.md` step-by-step

## 📁 Project Structure

```
Bridge-Battle-/
├── Assets/
│   ├── Scripts/
│   │   ├── Managers/          # Core game managers
│   │   ├── Player/            # Squad and character control
│   │   ├── Bullets/           # Bullet pooling system
│   │   ├── Gates/             # Gate mechanics
│   │   ├── Obstacles/         # Destructible obstacles
│   │   ├── Enemies/           # Enemy characters
│   │   ├── UI/                # UI and HUD
│   │   └── Utils/             # Helper scripts
│   │
│   ├── Prefabs/               # Game object prefabs
│   │   ├── Characters/        # Squad member prefabs
│   │   ├── Obstacles/         # Tire stacks, etc.
│   │   ├── Gates/             # Arithmetic gates
│   │   ├── Bullets/           # Bullet prefab
│   │   ├── Effects/           # Particle effects
│   │   └── Environment/       # Bridge, water, pillars
│   │
│   ├── Materials/             # Materials and textures
│   ├── Shaders/               # Custom shaders (Water, Holographic)
│   ├── Scenes/                # Unity scenes
│   └── Animations/            # Character animations
│
├── UNITY_SETUP_GUIDE.md       # Complete setup instructions
├── IMPLEMENTATION_CHECKLIST.md # Step-by-step checklist
└── README.md                  # This file
```

## 🎨 Key Features

### Visual Design
- **Wide Bridge:** 40 units wide (80% of screen)
- **3D Graphics:** Low-poly cartoon aesthetic
- **Water Shader:** Multi-layered sine wave vertex animation
- **Holographic Gates:** Scanline effects with rim glow
- **Particle Effects:** Explosions, bullet trails, damage numbers
- **Camera:** Close perspective (8-10 units back, 8 units up)

### Technical Implementation
- **Bullet Pooling:** Efficient single-script bullet management
- **Object Pooling:** Reusable game objects for performance
- **Blob Formation:** Separation/cohesion forces for tight squad
- **Gate Arithmetic:** Correct math operations (not instant death)
- **Procedural Levels:** Infinite level generation
- **Mobile Optimized:** 30+ FPS target on mid-range devices

## 📚 Documentation

### Setup and Implementation
- **[Unity Setup Guide](UNITY_SETUP_GUIDE.md)** - Complete Unity configuration and prefab creation
- **[Implementation Checklist](IMPLEMENTATION_CHECKLIST.md)** - Step-by-step tasks to build the game
- **[Game Development Brief](Bridge%20Battle%20Game%20Development%20Brief)** - Original design specifications

### Scripts Reference

#### Core Managers
- `GameManager.cs` - Main game state and score management
- `LevelManager.cs` - Procedural level generation
- `BulletPooler.cs` - Efficient bullet pooling system
- `AudioManager.cs` - Sound effects and music
- `CameraController.cs` - Smooth camera follow with shake

#### Player Systems
- `SquadManager.cs` - Squad formation and control
- `SquadMember.cs` - Individual character behavior
- `UIManager.cs` - HUD and game over screen
- `DamageNumberManager.cs` - Floating damage numbers

#### Game Objects
- `Gate.cs` - Arithmetic gate mechanics
- `Obstacle.cs` - Destructible obstacles with HP
- `Enemy.cs` - Enemy characters
- `WeaponPickup.cs` - Collectible weapon pickups
- `BridgePillar.cs` - Bridge pillar generation

#### Shaders
- `WaterShader.shader` - Multi-wave water animation
- `HolographicGate.shader` - Holographic gate effects

## 🎮 Controls

### Desktop (Testing)
- **Mouse:** Click and drag to move squad horizontally
- **Keyboard:** Arrow keys or A/D to move
- **Automatic:** Squad shoots automatically

### Mobile
- **Touch:** Touch and drag to move squad horizontally
- **Automatic:** Squad shoots automatically at ~3 bullets/second per character

## 🔧 Configuration

### Key Settings in Unity

**SquadManager:**
- Initial Squad Size: 5
- Formation Radius: 3
- Shoot Interval: 0.33 (3 bullets/sec)
- Movement Boundary: ±15 units

**LevelManager:**
- Bridge Width: 40 units
- Segment Length: 100 units
- Obstacles Per Segment: 2-5
- Gates Per Segment: 1
- Difficulty Increase: 0.1 per segment

**BulletPooler:**
- Pool Size: 100
- Bullet Speed: 20 units/sec
- Bullet Damage: 10 HP
- Bullet Lifetime: 3 seconds

## 🎯 Gameplay Tips

1. **Gate Strategy:** Shoot positive gates to increase their value before passing through
2. **Squad Size:** Maintain a large squad for maximum firepower
3. **Obstacle Priority:** Destroy high-HP obstacles early
4. **Positioning:** Center your squad to have more reaction time
5. **Math Skills:** Quick mental arithmetic helps plan gate navigation

## 🐛 Troubleshooting

### Common Issues

**Squad members spread out:**
- Increase cohesion force in SquadManager
- Decrease formation radius

**Bullets not hitting:**
- Check obstacle colliders
- Verify bullet layer masks
- Ensure raycast distance is sufficient

**Gates not working:**
- Verify gate spans full bridge width (40 units)
- Check "Is Trigger" is enabled on collider
- Ensure SquadManager has collider

**Performance issues:**
- Lower quality settings
- Reduce pool sizes
- Simplify water shader
- Enable GPU Instancing

See `UNITY_SETUP_GUIDE.md` for detailed troubleshooting.

## 🚀 Building for Mobile

### Android
```bash
# In Unity
File → Build Settings
Switch Platform → Android
Build APK
```

**Settings:**
- Minimum API: 24 (Android 7.0)
- Scripting Backend: IL2CPP
- ARM64: Enabled

### iOS
```bash
# In Unity
File → Build Settings
Switch Platform → iOS
Build Xcode Project
```

**Settings:**
- Minimum iOS: 12.0
- Target SDK: Latest

## 📦 Dependencies

### Required
- Unity 2022.3 LTS or newer
- TextMeshPro (included with Unity)

### Optional
- LeanTween (for smoother animations) - Stub provided
- Post Processing Stack v2 (for visual polish)

## 🎨 Assets Used

### Character Models
- Option 1: Unity primitives (capsules)
- Option 2: Mixamo free characters (recommended)
- Option 3: Custom low-poly models

### Materials
- All materials are procedurally created
- Custom shaders included (Water, Holographic)
- No external texture dependencies

## 📈 Performance Optimization

Implemented optimizations:
- ✅ Bullet pooling (single manager)
- ✅ Object pooling (reusable objects)
- ✅ Efficient update loops
- ✅ Raycast-based collision
- ✅ LOD-ready structure

**Target Performance:**
- 60 FPS on high-end mobile
- 30+ FPS on mid-range mobile
- Tested on Android API 24+

## 🤝 Contributing

This is a personal project, but suggestions are welcome!

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project is provided as-is for educational and portfolio purposes.

## 🎓 Learning Resources

- **Unity Learn:** https://learn.unity.com
- **Mixamo (Free Characters):** https://www.mixamo.com
- **TextMeshPro Guide:** https://learn.unity.com/tutorial/textmesh-pro
- **Shader Graph Tutorials:** https://unity.com/shader-graph

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Made with Unity 🎮 | Mobile-Optimized 📱 | 3D Graphics 🌊**

*Bridge Battle - Destroy, Navigate, Survive!*
