# Bridge Battle - Unity 3D Setup Guide

Complete implementation guide for the Bridge Battle mobile runner game.

## Table of Contents
1. [Project Overview](#project-overview)
2. [Unity Setup](#unity-setup)
3. [Creating Prefabs](#creating-prefabs)
4. [Scene Setup](#scene-setup)
5. [Materials and Shaders](#materials-and-shaders)
6. [Character Models](#character-models)
7. [Testing and Optimization](#testing-and-optimization)

---

## Project Overview

Bridge Battle is a 3D mobile runner game featuring:
- **Auto-shooting squad** with blob formation
- **Full-width gates** with arithmetic operations
- **Destructible obstacles** (tire stacks with HP)
- **Wide bridge** (40+ units) with Golden Gate-style pillars
- **Animated water** underneath using vertex shaders
- **Particle effects** and satisfying destruction
- **Optimized performance** (30+ FPS target)

---

## Unity Setup

### Required Unity Version
- **Unity 2022.3 LTS** or newer
- Platform: Android/iOS (mobile-optimized)

### Project Setup Steps

1. **Import TextMeshPro**
   - Window → TextMeshPro → Import TMP Essential Resources

2. **Install Packages** (Optional but recommended)
   - LeanTween (from Asset Store or GitHub) - for smooth animations
   - Post Processing Stack v2 - for visual polish

3. **Configure Build Settings**
   - File → Build Settings
   - Switch platform to Android or iOS
   - Set resolution to 1920x1080 (portrait or landscape)

4. **Player Settings**
   - Enable GPU Skinning
   - Set Graphics API to Vulkan/Metal
   - Enable Multithreaded Rendering
   - Set Color Space to Linear (for better visuals)

---

## Creating Prefabs

### 1. Squad Member Prefab

**Location:** `Assets/Prefabs/Characters/SquadMember.prefab`

**Structure:**
```
SquadMember (Root)
├── Body (Capsule or imported 3D model)
│   └── Material: Blue/Cyan color with emission
├── Head (Sphere - helmet)
│   └── Material: Bright blue
└── ShootPoint (Empty GameObject)
    └── Position: (0, 1, 0.5)
```

**Components on Root:**
- Rigidbody (constraints: freeze rotation, freeze Y position)
- Capsule Collider (radius: 0.5, height: 1.5)
- SquadMember script

**Settings:**
- Scale: ~1.5 units tall (must be visible)
- Set body renderer reference in SquadMember script

**Using Character Models:**
If using Mixamo or other animated characters:
1. Import FBX with animations
2. Add Animator component
3. Set running animation to loop
4. Adjust scale to 1.5 units tall

---

### 2. Obstacle Prefab (Tire Stack)

**Location:** `Assets/Prefabs/Obstacles/TireStack.prefab`

**Structure:**
```
TireStack (Root)
├── TireModel1 (Cylinder or 3D model)
├── TireModel2
├── TireModel3
├── HealthText (TextMeshPro - 3D Text)
│   └── Font Size: 6
│   └── Color: White with outline
└── WeaponPickupPoint (Empty GameObject)
    └── Position: (0, 3, 0) - on top
```

**Components on Root:**
- Box Collider (size to fit tire stack)
- Obstacle script
  - Max Health: 100-300
  - Score Value: 10

**Tire Model Setup:**
- Stack 3-4 cylinders vertically
- Scale: (2, 0.5, 2) each
- Material: Dark rubber texture
- Spacing: 0.5 units between tires

**Health Text Setup:**
- Create 3D TextMeshPro object
- Position above tire stack
- Font size: 6 (large and visible)
- Add black outline for readability
- Always face camera (script handles this)

---

### 3. Gate Prefab

**Location:** `Assets/Prefabs/Gates/Gate.prefab`

**Structure:**
```
Gate (Root)
├── GateVisual (Plane or Quad)
│   └── Material: HolographicPositive or HolographicNegative
│   └── Scale: (40, 1, 3) - FULL bridge width
├── ValueText (TextMeshPro - 3D Text)
│   └── Font Size: 8
│   └── Position: (0, 1, 0)
└── TriggerCollider (Box Collider)
    └── Is Trigger: true
    └── Size: (40, 3, 1)
```

**Components on Root:**
- Gate script
  - Gate Value: Set in LevelManager (random -10 to +10)
  - Can Be Shot: true

**Important:**
- Gate MUST span full width (40 units)
- Use holographic shader materials
- Large visible numbers (+14, -8, etc.)
- Set positive/negative material in script

---

### 4. Bullet Prefab

**Location:** `Assets/Prefabs/Bullets/Bullet.prefab`

**Structure:**
```
Bullet (Root - Sphere)
└── Trail (Trail Renderer)
```

**Components:**
- MeshRenderer (Sphere primitive, scale: 0.15)
- Trail Renderer
  - Width: 0.1 → 0.02
  - Time: 0.5s
  - Material: Emissive with color gradient

**Material:**
- Emissive shader (glow effect)
- Color changes based on squad size (set by BulletPooler)

---

### 5. Weapon Pickup Prefab

**Location:** `Assets/Prefabs/Environment/WeaponPickup.prefab`

**Structure:**
```
WeaponPickup (Root)
├── WeaponModel (Cube or gun model)
│   └── Material: Cyan emissive
├── GlowLight (Point Light)
│   └── Color: Cyan
│   └── Intensity: 2
│   └── Range: 5
└── TriggerCollider (Sphere Collider)
    └── Is Trigger: true
    └── Radius: 1
```

**Components on Root:**
- WeaponPickup script
  - Weapon Type: 1
  - Rotation Speed: 90
  - Glow Color: Cyan

---

### 6. Bridge Segment Prefab

**Location:** `Assets/Prefabs/Environment/BridgeSegment.prefab`

**Structure:**
```
BridgeSegment (Root)
├── Road (Cube)
│   └── Material: BridgeRoad (gray)
│   └── Scale: (40, 1, 100)
├── LaneMarkings (Quads)
│   └── White dashed lines
├── LeftPillars (BridgePillar script)
└── RightPillars (BridgePillar script)
```

**Road Setup:**
- Width: 40 units (80% of screen)
- Material: Gray with white lane markings
- Box Collider for physics

---

## Scene Setup

### Main Scene: `Assets/Scenes/MainGame.unity`

#### Hierarchy Structure:

```
MainGame Scene
├── GameManager (Empty GameObject)
│   ├── GameManager script
│   ├── LevelManager script
│   ├── BulletPooler script
│   ├── DamageNumberManager script
│   └── AudioManager script
│
├── Player
│   ├── SquadManager (Empty GameObject with script)
│   └── Squad members spawned at runtime
│
├── MainCamera
│   └── CameraController script
│       └── Target: SquadManager
│       └── Offset: (0, 8, -10)
│
├── Environment
│   ├── Water (Plane)
│   │   └── Material: WaterMaterial
│   │   └── Scale: (500, 1, 500)
│   │   └── Position: (0, -10, 0)
│   └── Directional Light
│       └── Intensity: 1.2
│       └── Rotation: (50, -30, 0)
│
├── UI Canvas
│   ├── ScoreText (TextMeshPro)
│   ├── LevelText (TextMeshPro)
│   ├── SquadCounter (TextMeshPro - VERY LARGE)
│   └── GameOverPanel
│       ├── GameOverText
│       ├── FinalScoreText
│       └── RestartButton
│
└── LevelSegments (Empty parent)
    └── Segments generated at runtime
```

### Step-by-Step Scene Setup

#### 1. Create Game Manager

1. Create empty GameObject named "GameManager"
2. Add components:
   - GameManager
   - LevelManager
   - BulletPooler
   - DamageNumberManager
   - AudioManager

3. **GameManager Settings:**
   - Scroll Speed: 5
   - Score Per Obstacle: 10
   - Score Per Enemy: 15

4. **LevelManager Settings:**
   - Segment Length: 100
   - Bridge Width: 40
   - Bridge Segment Prefab: (assign prefab)
   - Obstacle Prefabs: (assign tire stack prefabs)
   - Gate Prefab: (assign gate prefab)
   - Enemy Prefab: (assign enemy prefab)

5. **BulletPooler Settings:**
   - Bullet Prefab: (assign)
   - Pool Size: 100
   - Bullet Speed: 20
   - Bullet Lifetime: 3

#### 2. Create Player Squad

1. Create empty GameObject named "SquadManager"
2. Position at (0, 0, 0)
3. Add SquadManager script:
   - Initial Squad Size: 5
   - Squad Member Prefab: (assign)
   - Formation Radius: 3
   - Movement Boundary X: 15

#### 3. Setup Camera

1. Select Main Camera
2. Add CameraController script:
   - Target: SquadManager transform
   - Offset: (0, 8, -10)
   - Field of View: 60

#### 4. Create Water

1. Create Plane (GameObject → 3D Object → Plane)
2. Name: "Water"
3. Transform:
   - Position: (0, -10, 0)
   - Rotation: (0, 0, 0)
   - Scale: (50, 1, 50)
4. Apply WaterMaterial
5. Remove Mesh Collider

#### 5. Setup Lighting

1. Select Directional Light
2. Transform Rotation: (50, -30, 0)
3. Intensity: 1.2
4. Color: Slightly warm white

#### 6. Create UI Canvas

1. Create UI → Canvas
2. Canvas settings:
   - Render Mode: Screen Space - Overlay
   - Canvas Scaler:
     - UI Scale Mode: Scale With Screen Size
     - Reference Resolution: 1920x1080

**UI Elements:**

**Score Text (Top Left):**
- Position: (-800, 450)
- Font Size: 60
- Text: "SCORE: 0"
- Font: Bold
- Color: White with black outline

**Level Text (Top Right):**
- Position: (800, 450)
- Font Size: 50
- Text: "LEVEL 1"
- Color: White with outline

**Squad Counter (Bottom Center):**
- Position: (0, -400)
- Font Size: 120 (VERY LARGE)
- Text: "5"
- Color: Yellow with thick black outline
- Assigned to UIManager

**Game Over Panel:**
- Full screen panel
- Background: Semi-transparent black
- Initially disabled
- Contains:
  - "GAME OVER" text
  - Final Score display
  - Restart button

#### 7. Connect References

In GameManager:
- Squad Manager: (assign SquadManager GameObject)
- UI Manager: (assign UIManager component)
- Level Manager: (assign LevelManager component)

In UIManager:
- Assign all text references
- Assign game over panel
- Assign restart button

---

## Materials and Shaders

### 1. Water Material

**File:** `Assets/Materials/WaterMaterial.mat`

**Shader:** BridgeBattle/WaterShader

**Properties:**
- Wave Speed: 1
- Wave Amplitude 1-4: 0.5, 0.3, 0.2, 0.15
- Wave Frequency 1-4: 1, 1.5, 2, 3
- Color: Light blue (0.2, 0.5, 0.8, 0.8)
- Deep Color: Dark blue (0.1, 0.3, 0.6, 1)

Apply to large plane under bridge.

### 2. Holographic Gate Materials

**Positive Gates (+5, +10, etc.):**
- Material: HolographicPositive.mat
- Color: Blue gradient
- Rim glow: Cyan

**Negative Gates (-3, -8, etc.):**
- Material: HolographicNegative.mat
- Color: Red gradient
- Rim glow: Pink

### 3. Bridge Materials

**Road:**
- Color: Gray (0.5, 0.5, 0.5)
- Slightly rough surface
- Add white line markings using decals or separate quads

**Pillars:**
- Color: Red (0.8, 0.15, 0.15)
- Golden Gate Bridge style
- Slight metallic property

---

## Character Models

### Option 1: Simple Capsule Characters

**Quick Setup:**
1. Use primitive capsules (1.5 units tall)
2. Add sphere on top for head
3. Use bright colors (blue helmets, tan bodies)
4. Add running animation using simple rotation

### Option 2: Mixamo Characters (Recommended)

**Steps:**
1. Go to mixamo.com
2. Download character (e.g., "Mannequin" or stylized character)
3. Download "Running" animation
4. Import into Unity:
   - FBX scale: 0.01 (adjust to ~1.5 units tall)
   - Animation Type: Humanoid
   - Loop Time: enabled for running animation

5. Create Animator Controller:
   - Create "Running" state
   - Set running animation
   - Make it default state

6. Apply to SquadMember prefab

### Option 3: Custom Low-Poly Models

Create simple low-poly characters in Blender:
- Cube body
- Sphere head
- Cylinder arms/legs
- Keep under 500 polygons
- Export as FBX

---

## Testing and Optimization

### Testing Checklist

- [ ] Squad formation stays tight (blob-like)
- [ ] Auto-shooting works (~3 bullets/second per character)
- [ ] Gates modify squad size correctly (arithmetic not instant death)
- [ ] Obstacles show HP and take damage
- [ ] Damage numbers float upward
- [ ] Particles spawn on destruction
- [ ] Camera follows smoothly with shake
- [ ] UI updates in real-time
- [ ] Water animates smoothly
- [ ] Level generates procedurally
- [ ] Game over triggers when squad reaches 0

### Performance Optimization

**Target:** 30+ FPS on mid-range mobile devices

**Optimizations Implemented:**
1. **Bullet Pooling** - Single BulletPooler manages all bullets
2. **Object Pooling** - Reuse game objects instead of destroying
3. **LOD System** - Reduce detail on distant objects
4. **Occlusion Culling** - Don't render what's behind camera
5. **Texture Atlasing** - Combine textures to reduce draw calls

**Unity Settings:**
- Edit → Project Settings → Quality
- Shadow Distance: 50
- Shadow Resolution: Medium Shadows
- Anti Aliasing: 2x Multi Sampling
- VSync: Off (use Application.targetFrameRate = 60)

**Mobile Specific:**
```csharp
void Start()
{
    Application.targetFrameRate = 60;
    QualitySettings.vSyncCount = 0;
}
```

### Build Settings

**Android:**
- Minimum API Level: 24 (Android 7.0)
- Target API Level: 33
- Scripting Backend: IL2CPP
- ARM64: Enabled

**iOS:**
- Minimum iOS Version: 12.0
- Target SDK: Latest

---

## Additional Scripts

### Animation Pooling (Advanced)

For better performance with many characters:

```csharp
// Pre-calculate animation frames
// Instantiate static meshes instead of animated characters
// Update mesh manually based on precalculated frames
```

This is mentioned in the brief but can be added later for optimization.

---

## Next Steps

1. **Create all prefabs** following the guides above
2. **Setup main scene** with all GameObjects and references
3. **Import or create character models**
4. **Test basic gameplay** - squad movement and shooting
5. **Add obstacles and gates** to test progression
6. **Polish visuals** - particles, effects, UI
7. **Optimize performance** for target platform
8. **Build and test** on actual device

---

## Troubleshooting

### Squad members don't stay together
- Increase cohesion force in SquadManager
- Decrease formation radius
- Check Rigidbody constraints are set

### Bullets not hitting obstacles
- Verify colliders are on obstacles
- Check bullet layer masks
- Ensure raycast distance is sufficient

### Gates not triggering
- Make sure collider is set to "Is Trigger"
- Check gate spans full bridge width
- Verify SquadManager has collider

### Water not animating
- Check shader compilation
- Ensure material uses WaterShader
- Verify vertex modification is enabled

### Poor performance
- Reduce pool sizes
- Lower shadow quality
- Simplify water shader
- Use simpler character models
- Enable GPU Instancing on materials

---

## Support Resources

- Unity Forums: https://forum.unity.com
- Unity Documentation: https://docs.unity3d.com
- Mixamo (Free characters): https://www.mixamo.com
- TextMeshPro Guide: https://learn.unity.com/tutorial/textmesh-pro

---

**Good luck creating Bridge Battle! 🎮**
