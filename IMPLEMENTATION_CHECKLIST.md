# Bridge Battle - Implementation Checklist

Complete step-by-step checklist for implementing the game in Unity.

---

## Phase 1: Unity Project Setup

- [ ] Create new Unity 3D project (Unity 2022.3 LTS)
- [ ] Copy all files from this repository to Unity project
- [ ] Import TextMeshPro (Window → TextMeshPro → Import TMP Essential Resources)
- [ ] Install LeanTween from Asset Store (optional, stub provided)
- [ ] Set Color Space to Linear (Edit → Project Settings → Player → Color Space)
- [ ] Configure Quality Settings for mobile

---

## Phase 2: Materials and Shaders

### Water Material
- [ ] Verify WaterShader.shader compiles without errors
- [ ] Create/verify WaterMaterial.mat uses WaterShader
- [ ] Test water animation in scene view
- [ ] Adjust wave parameters for realistic look

### Holographic Gate Materials
- [ ] Verify HolographicGate.shader compiles
- [ ] Create HolographicPositive.mat (blue, for +gates)
- [ ] Create HolographicNegative.mat (red, for -gates)
- [ ] Test holographic effects (scanlines, rim glow, pulse)

### Bridge Materials
- [ ] Create BridgeRoad.mat (gray, 0.5, 0.5, 0.5)
- [ ] Create RedPillar.mat (red, 0.8, 0.15, 0.15)
- [ ] Create any additional materials needed

---

## Phase 3: Prefab Creation

### Squad Member Prefab
- [ ] Create capsule or import Mixamo character
- [ ] Scale to 1.5 units tall (must be visible!)
- [ ] Add blue/cyan material with emission
- [ ] Add Rigidbody (freeze rotation, freeze Y)
- [ ] Add Capsule Collider
- [ ] Create ShootPoint child object at (0, 1, 0.5)
- [ ] Add SquadMember script
- [ ] Assign body renderer reference
- [ ] Test: Should move in formation when SquadManager spawns it

### Obstacle Prefab (Tire Stack)
- [ ] Create 3-4 stacked cylinders (tire appearance)
- [ ] Add dark material (rubber texture)
- [ ] Create 3D TextMeshPro for health display
  - [ ] Font size: 6
  - [ ] White with black outline
  - [ ] Position above tires
- [ ] Add Box Collider (not trigger)
- [ ] Create WeaponPickupPoint (empty object on top)
- [ ] Add Obstacle script
  - [ ] Set Max Health: 100-300
  - [ ] Assign health text reference
  - [ ] Set score value: 10
- [ ] Test: Should take damage and show HP when shot

### Gate Prefab
- [ ] Create Plane/Quad for gate visual
- [ ] Scale to FULL bridge width (40, 1, 3)
- [ ] Apply holographic material
- [ ] Create 3D TextMeshPro for value display
  - [ ] Font size: 8 (VERY LARGE)
  - [ ] Position at (0, 1, 0)
  - [ ] White with thick outline
- [ ] Add Box Collider as trigger (40, 3, 1)
- [ ] Add Gate script
  - [ ] Assign value text reference
  - [ ] Assign gate renderer
  - [ ] Set positive/negative materials
- [ ] Test: Should span full bridge, trigger on contact

### Bullet Prefab
- [ ] Create small sphere (scale: 0.15)
- [ ] Add emissive material (yellow/cyan glow)
- [ ] Add Trail Renderer
  - [ ] Start width: 0.1
  - [ ] End width: 0.02
  - [ ] Time: 0.5
  - [ ] Gradient: color → transparent
- [ ] Remove collider (raycast-based collision)
- [ ] Test: Should look like glowing projectile with trail

### Weapon Pickup Prefab
- [ ] Create simple gun model or use cube
- [ ] Add cyan emissive material
- [ ] Add Point Light (cyan, intensity 2, range 5)
- [ ] Add Sphere Collider as trigger
- [ ] Add WeaponPickup script
  - [ ] Set weapon type
  - [ ] Set glow color: cyan
- [ ] Test: Should rotate, bob, and glow

### Bridge Segment Prefab
- [ ] Create large cube for road (40, 1, 100)
- [ ] Apply BridgeRoad material
- [ ] Add white lane markings (quads or decals)
- [ ] Create empty objects for pillars on sides
- [ ] Add BridgePillar script to generate pillars
  - [ ] Bridge width: 40
  - [ ] Pillar spacing: 30
  - [ ] Assign RedPillar material
- [ ] Test: Should look like wide bridge section

### Enemy Prefab (Optional)
- [ ] Create capsule or use character model
- [ ] Add red material/color
- [ ] Add Capsule Collider
- [ ] Add Enemy script
  - [ ] Set health: 50
  - [ ] Set score: 15
- [ ] Test: Should take damage and be destroyed

---

## Phase 4: Main Scene Setup

### Scene Hierarchy Setup
- [ ] Create "GameManager" empty object
  - [ ] Add GameManager script
  - [ ] Add LevelManager script
  - [ ] Add BulletPooler script
  - [ ] Add DamageNumberManager script
  - [ ] Add AudioManager script

- [ ] Create "SquadManager" empty object at (0, 0, 0)
  - [ ] Add SquadManager script

- [ ] Setup Main Camera
  - [ ] Add CameraController script
  - [ ] Set target: SquadManager
  - [ ] Set offset: (0, 8, -10)

- [ ] Create Water plane
  - [ ] Scale: (50, 1, 50)
  - [ ] Position: (0, -10, 0)
  - [ ] Apply WaterMaterial
  - [ ] Remove collider

- [ ] Configure Directional Light
  - [ ] Rotation: (50, -30, 0)
  - [ ] Intensity: 1.2

### Component Configuration

**GameManager:**
- [ ] Assign squad manager reference
- [ ] Assign UI manager reference
- [ ] Assign level manager reference
- [ ] Set scroll speed: 5
- [ ] Set score values

**LevelManager:**
- [ ] Set segment length: 100
- [ ] Set bridge width: 40
- [ ] Assign bridge segment prefab
- [ ] Assign obstacle prefabs (array)
- [ ] Assign gate prefab
- [ ] Assign enemy prefab
- [ ] Set min/max obstacles per segment
- [ ] Set gates per segment

**SquadManager:**
- [ ] Set initial squad size: 5
- [ ] Assign squad member prefab
- [ ] Set formation radius: 3
- [ ] Set movement boundary X: 15
- [ ] Set shoot interval: 0.33 (~3 bullets/sec)

**BulletPooler:**
- [ ] Assign bullet prefab
- [ ] Set pool size: 100
- [ ] Set bullet speed: 20
- [ ] Set bullet damage: 10
- [ ] Set bullet lifetime: 3

**CameraController:**
- [ ] Assign target: SquadManager transform
- [ ] Set offset: (0, 8, -10)
- [ ] Set smooth speed: 10
- [ ] Set FOV: 60

---

## Phase 5: UI Setup

### Create Canvas
- [ ] Create UI Canvas (Screen Space - Overlay)
- [ ] Set Canvas Scaler:
  - [ ] Scale With Screen Size
  - [ ] Reference Resolution: 1920x1080

### UI Elements
- [ ] Create Score Text (Top Left)
  - [ ] Font size: 60
  - [ ] Position: (-800, 450)
  - [ ] Text: "SCORE: 0"
  - [ ] Outline: Black, thick

- [ ] Create Level Text (Top Right)
  - [ ] Font size: 50
  - [ ] Position: (800, 450)
  - [ ] Text: "LEVEL 1"

- [ ] Create Squad Counter (Bottom Center)
  - [ ] Font size: 120 (MASSIVE)
  - [ ] Position: (0, -400)
  - [ ] Color: Yellow
  - [ ] Outline: Black, very thick
  - [ ] Text: "5"

- [ ] Create Game Over Panel
  - [ ] Full screen
  - [ ] Background: Black, 80% alpha
  - [ ] Disabled by default
  - [ ] Contains:
    - [ ] "GAME OVER" title
    - [ ] Final score text
    - [ ] Restart button

### UI Manager Setup
- [ ] Create empty object "UIManager"
- [ ] Add UIManager script
- [ ] Assign all text references:
  - [ ] Score text
  - [ ] Level text
  - [ ] Squad count text
- [ ] Assign game over panel
- [ ] Assign restart button
- [ ] Connect to GameManager

---

## Phase 6: Testing Basic Gameplay

### Movement Test
- [ ] Play scene
- [ ] Verify squad spawns with 5 members
- [ ] Test horizontal movement (mouse/keyboard)
- [ ] Verify formation stays tight (blob-like)
- [ ] Check squad stays within boundaries
- [ ] Verify camera follows smoothly

### Shooting Test
- [ ] Verify bullets spawn automatically
- [ ] Check shoot rate (~3 per second per character)
- [ ] Verify bullets have trails
- [ ] Check bullet color matches squad size
- [ ] Verify bullets pool correctly (check count in hierarchy)

### Obstacle Test
- [ ] Place obstacle prefab in scene manually
- [ ] Verify squad shoots at obstacle
- [ ] Check HP display updates
- [ ] Verify damage numbers appear
- [ ] Check obstacle destroys at 0 HP
- [ ] Verify explosion particles spawn
- [ ] Check score increases

### Gate Test
- [ ] Place gate prefab spanning full bridge width
- [ ] Test positive gate (+5): squad should gain 5 members
- [ ] Test negative gate (-3): squad should lose 3 members
- [ ] Verify UI counter updates
- [ ] Check gate destroys after trigger
- [ ] Test shooting gate increases value (if positive)
- [ ] Verify game over when losing all members

---

## Phase 7: Level Generation

- [ ] Remove manually placed obstacles/gates
- [ ] Verify LevelManager generates initial segments
- [ ] Test procedural generation as player moves forward
- [ ] Check old segments despawn
- [ ] Verify obstacles spawn randomly
- [ ] Check gates spawn at intervals
- [ ] Test difficulty progression
- [ ] Verify no overlap between objects

---

## Phase 8: Visual Polish

### Particles and Effects
- [ ] Verify explosion particles on obstacle destruction
- [ ] Check damage numbers float upward and fade
- [ ] Test screen shake on explosions
- [ ] Verify gate holographic pulse effect
- [ ] Check weapon pickup glow and rotation

### Materials and Lighting
- [ ] Ensure water animates smoothly
- [ ] Verify holographic gates pulse and scan
- [ ] Check bullet trails are visible
- [ ] Test lighting looks good from gameplay camera
- [ ] Verify all emissive materials glow

### UI Animation
- [ ] Check squad counter pulses when changing
- [ ] Verify game over panel fades in
- [ ] Test all text is readable
- [ ] Ensure UI scales on different resolutions

---

## Phase 9: Audio Integration

- [ ] Import or create sound effects:
  - [ ] Shooting sound (pew pew)
  - [ ] Explosion sound
  - [ ] Hit sound (damage)
  - [ ] Collection sound (weapon pickup)
  - [ ] Gate sound
  - [ ] Game over sound

- [ ] Assign sounds to AudioManager
- [ ] Add audio calls to scripts:
  - [ ] BulletPooler → PlayShoot()
  - [ ] Obstacle.DestroyObstacle() → PlayExplosion()
  - [ ] Obstacle.TakeDamage() → PlayHit()
  - [ ] WeaponPickup.Collect() → PlayCollect()
  - [ ] Gate.ApplyGateEffect() → PlayGate()
  - [ ] GameManager.GameOver() → PlayGameOver()

- [ ] Test all sounds play at correct times
- [ ] Adjust volumes for balance

---

## Phase 10: Optimization

### Performance Profiling
- [ ] Open Profiler (Window → Analysis → Profiler)
- [ ] Run game and check FPS
- [ ] Identify performance bottlenecks
- [ ] Target: 30+ FPS on mobile

### Optimization Tasks
- [ ] Enable GPU Instancing on all materials
- [ ] Verify object pooling works (bullets, damage numbers)
- [ ] Check draw calls (should be < 100)
- [ ] Test on actual mobile device
- [ ] Adjust quality settings if needed
- [ ] Consider LOD for distant objects

### Mobile-Specific
- [ ] Add touch input support (already in SquadManager)
- [ ] Set target frame rate to 60
- [ ] Test on low-end device
- [ ] Optimize texture sizes (max 1024x1024)
- [ ] Enable texture compression

---

## Phase 11: Build and Deploy

### Build Setup
- [ ] File → Build Settings
- [ ] Add current scene
- [ ] Switch to target platform (Android/iOS)
- [ ] Configure Player Settings:
  - [ ] Company name
  - [ ] Product name: "Bridge Battle"
  - [ ] Package identifier
  - [ ] Version
  - [ ] Icons
  - [ ] Orientation (portrait or landscape)

### Android Build
- [ ] Set minimum API level: 24
- [ ] Enable IL2CPP
- [ ] Enable ARM64
- [ ] Build APK or AAB
- [ ] Test on Android device

### iOS Build
- [ ] Set minimum iOS: 12.0
- [ ] Configure signing
- [ ] Build Xcode project
- [ ] Test on iOS device

---

## Phase 12: Final Testing

### Gameplay Testing
- [ ] Play from start to game over
- [ ] Verify all mechanics work correctly
- [ ] Test edge cases (losing many members at once)
- [ ] Check game over condition
- [ ] Test restart functionality

### Visual Testing
- [ ] All effects look polished
- [ ] No visual glitches
- [ ] UI is readable on all screen sizes
- [ ] Water looks realistic
- [ ] Character animations smooth

### Performance Testing
- [ ] Stable 30+ FPS
- [ ] No memory leaks (play for 5+ minutes)
- [ ] Check battery usage (should be reasonable)

### Bug Fixing
- [ ] Fix any crashes
- [ ] Resolve visual glitches
- [ ] Address performance issues
- [ ] Polish edge cases

---

## Completion Criteria

✅ **Core Gameplay:**
- Squad auto-shoots continuously
- Formation stays tight (blob-like)
- Gates span full width and modify squad correctly
- Obstacles are destructible with HP displays
- Level generates procedurally
- Game over when squad reaches 0

✅ **Visuals:**
- Wide bridge (40+ units)
- Animated water underneath
- Holographic gates with pulse effects
- Particle explosions
- Damage numbers float upward
- Camera close enough to see action

✅ **Performance:**
- 30+ FPS on target device
- Smooth gameplay
- No stuttering or lag

✅ **Polish:**
- UI clear and readable
- Sound effects present
- Visual feedback for all actions
- Satisfying destruction

---

## Optional Enhancements

After completing the checklist above, consider adding:

- [ ] More weapon types with different effects
- [ ] Power-ups (speed boost, invincibility)
- [ ] Different enemy types
- [ ] Boss battles at end of levels
- [ ] Leaderboard integration
- [ ] Analytics tracking
- [ ] Ad integration (optional)
- [ ] More visual effects (trails, glows)
- [ ] Background music
- [ ] Tutorial level
- [ ] Settings menu (sound, graphics options)

---

**Estimated Time to Complete:**
- Experienced Unity developer: 2-3 days
- Intermediate developer: 5-7 days
- Beginner developer: 10-14 days

Good luck! 🎮🚀
