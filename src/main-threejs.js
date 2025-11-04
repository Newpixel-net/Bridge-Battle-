/**
 * Bridge Battle - Three.js 3D Implementation
 * Iteration 1: Scene Foundation ✓
 * Iteration 2: Add Characters on Bridge
 */

import * as THREE from 'three';

// ============================================================================
// GAME STATE
// ============================================================================
const game = {
    scene: null,
    camera: null,
    renderer: null,
    bridge: null,
    water: null,
    clock: new THREE.Clock(),

    // Game objects
    squad: [],
    bullets: [],
    obstacles: [],
    gates: [],

    // Input
    pointer: {
        x: 0,
        y: 0,
        isDown: false,
        targetX: 0,
        targetZ: 0
    },

    // State
    paused: false,
    gameOver: false,
    autoForward: true,
    forwardSpeed: 50  // Units per second
};

// ============================================================================
// ITERATION 1: SCENE SETUP
// ============================================================================

function initScene() {
    console.log('🎮 Iteration 1: Setting up 3D scene...');

    // Step 1: Create scene
    game.scene = new THREE.Scene();
    game.scene.background = new THREE.Color(0x87CEEB); // Sky blue
    game.scene.fog = new THREE.Fog(0x87CEEB, 100, 500);

    // Step 2: Create camera (CRITICAL: Behind-squad perspective)
    game.camera = new THREE.PerspectiveCamera(
        60,  // FOV
        window.innerWidth / window.innerHeight,  // Aspect
        0.1,  // Near
        2000  // Far
    );
    game.camera.position.set(0, 8, -10);  // Behind and above
    game.camera.lookAt(0, 0, 20);  // Look forward

    // Step 3: Create renderer
    game.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false
    });
    game.renderer.setSize(window.innerWidth, window.innerHeight);
    game.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    game.renderer.shadowMap.enabled = true;
    game.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Add to DOM
    document.body.appendChild(game.renderer.domElement);

    // Step 4: Add lighting
    // Sunlight
    const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
    sunLight.position.set(50, 100, 50);
    sunLight.castShadow = true;
    sunLight.shadow.camera.left = -100;
    sunLight.shadow.camera.right = 100;
    sunLight.shadow.camera.top = 100;
    sunLight.shadow.camera.bottom = -100;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 500;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    game.scene.add(sunLight);

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    game.scene.add(ambientLight);

    // Hemisphere light (sky/ground gradient)
    const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x4A90E2, 0.3);
    game.scene.add(hemiLight);

    console.log('✓ Scene, camera, renderer, lighting created');
}

function createBridge() {
    console.log('🌉 Creating bridge...');

    // Bridge dimensions: 40 units wide × 1000 units long × 2 units thick
    const bridgeGeometry = new THREE.BoxGeometry(40, 2, 1000);
    const bridgeMaterial = new THREE.MeshPhongMaterial({
        color: 0x808080,  // Gray
        shininess: 5
    });

    game.bridge = new THREE.Mesh(bridgeGeometry, bridgeMaterial);
    game.bridge.position.set(0, -1, 500);  // Center at origin, extend forward
    game.bridge.receiveShadow = true;
    game.bridge.castShadow = true;
    game.scene.add(game.bridge);

    // Add lane markings (white dashed lines)
    const markingGeometry = new THREE.BoxGeometry(0.5, 0.1, 10);
    const markingMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

    for (let z = 0; z < 1000; z += 30) {
        const marking = new THREE.Mesh(markingGeometry, markingMaterial);
        marking.position.set(0, 0.1, z);
        game.scene.add(marking);
    }

    // Add bridge edges (red)
    const edgeGeometry = new THREE.BoxGeometry(1, 3, 1000);
    const edgeMaterial = new THREE.MeshPhongMaterial({ color: 0xCC3333 });  // Red

    const leftEdge = new THREE.Mesh(edgeGeometry, edgeMaterial);
    leftEdge.position.set(-20, 0.5, 500);
    game.scene.add(leftEdge);

    const rightEdge = new THREE.Mesh(edgeGeometry, edgeMaterial);
    rightEdge.position.set(20, 0.5, 500);
    game.scene.add(rightEdge);

    // Add pillars every 100 units
    for (let z = 0; z < 1000; z += 100) {
        const pillarGeometry = new THREE.BoxGeometry(2, 10, 2);
        const pillarMaterial = new THREE.MeshPhongMaterial({ color: 0xCC3333 });

        const leftPillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
        leftPillar.position.set(-20, 5, z);
        game.scene.add(leftPillar);

        const rightPillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
        rightPillar.position.set(20, 5, z);
        game.scene.add(rightPillar);
    }

    console.log('✓ Bridge created: 40 units wide × 1000 units long');
}

function createWater() {
    console.log('🌊 Creating water plane...');

    // Water plane: 200×200 units, subdivided for wave animation
    const waterGeometry = new THREE.PlaneGeometry(200, 200, 100, 100);
    const waterMaterial = new THREE.MeshPhongMaterial({
        color: 0x4A90E2,  // Ocean blue
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
        shininess: 100,
        specular: 0x111111
    });

    game.water = new THREE.Mesh(waterGeometry, waterMaterial);
    game.water.rotation.x = -Math.PI / 2;  // Horizontal
    game.water.position.y = -20;  // Below bridge
    game.water.receiveShadow = true;
    game.scene.add(game.water);

    // Store base vertex positions for animation
    game.water.userData.baseVertices = new Float32Array(
        game.water.geometry.attributes.position.array
    );

    console.log('✓ Water plane created at Y = -20');
}

// ============================================================================
// ITERATION 4: BULLET SYSTEM
// ============================================================================

class Bullet {
    constructor() {
        // Create bullet mesh (small sphere)
        const geometry = new THREE.SphereGeometry(0.2, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: 0xFFFF00,  // Yellow
            emissive: 0xFFFF00
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.visible = false;
        game.scene.add(this.mesh);

        // Physics
        this.velocity = new THREE.Vector3();
        this.active = false;
        this.spawnTime = 0;
        this.lifetime = 3000;  // 3 seconds
    }

    fire(fromX, fromY, fromZ, targetX, targetY, targetZ) {
        this.mesh.position.set(fromX, fromY, fromZ);
        this.mesh.visible = true;
        this.active = true;
        this.spawnTime = Date.now();

        // Calculate direction
        const dx = targetX - fromX;
        const dy = targetY - fromY;
        const dz = targetZ - fromZ;
        const len = Math.sqrt(dx * dx + dy * dy + dz * dz);

        // Set velocity (80 units/sec)
        const speed = 80;
        this.velocity.set(
            (dx / len) * speed,
            (dy / len) * speed,
            (dz / len) * speed
        );
    }

    update(deltaTime) {
        if (!this.active) return;

        // Move bullet
        this.mesh.position.x += this.velocity.x * deltaTime;
        this.mesh.position.y += this.velocity.y * deltaTime;
        this.mesh.position.z += this.velocity.z * deltaTime;

        // Check lifetime
        if (Date.now() - this.spawnTime > this.lifetime) {
            this.deactivate();
        }

        // Check if too far forward
        if (this.mesh.position.z > 1000) {
            this.deactivate();
        }
    }

    deactivate() {
        this.active = false;
        this.mesh.visible = false;
        this.velocity.set(0, 0, 0);
    }

    destroy() {
        game.scene.remove(this.mesh);
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }
}

// Bullet pool
const bulletPool = [];
const BULLET_POOL_SIZE = 500;

function initBulletPool() {
    console.log('🔫 Iteration 4: Initializing bullet pool...');

    for (let i = 0; i < BULLET_POOL_SIZE; i++) {
        bulletPool.push(new Bullet());
    }

    console.log(`✓ Bullet pool created: ${BULLET_POOL_SIZE} bullets`);
}

function getBullet() {
    // Find inactive bullet
    for (let bullet of bulletPool) {
        if (!bullet.active) {
            return bullet;
        }
    }

    // Pool exhausted, create new (shouldn't happen often)
    console.warn('Bullet pool exhausted, creating new bullet');
    const newBullet = new Bullet();
    bulletPool.push(newBullet);
    return newBullet;
}

function updateBullets(deltaTime) {
    const BULLET_DAMAGE = 10;
    const HIT_RADIUS = 2.0;  // Collision radius

    for (let bullet of bulletPool) {
        if (bullet.active) {
            bullet.update(deltaTime);

            // Check collision with obstacles
            for (let obstacle of obstacles) {
                if (!obstacle.active || obstacle.destroyed) continue;

                const dx = bullet.mesh.position.x - obstacle.group.position.x;
                const dy = bullet.mesh.position.y - obstacle.group.position.y;
                const dz = bullet.mesh.position.z - obstacle.group.position.z;
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist < HIT_RADIUS) {
                    // Hit!
                    const destroyed = obstacle.takeDamage(BULLET_DAMAGE);
                    bullet.deactivate();

                    // Spawn hit particle effect (simple flash)
                    spawnHitEffect(bullet.mesh.position.x, bullet.mesh.position.y, bullet.mesh.position.z);

                    break;  // Bullet can only hit one obstacle
                }
            }
        }
    }
}

function spawnHitEffect(x, y, z) {
    // Create small explosion flash
    const flash = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 8, 8),
        new THREE.MeshBasicMaterial({
            color: 0xFFAA00,
            transparent: true
        })
    );

    flash.position.set(x, y, z);
    game.scene.add(flash);

    // Animate and remove
    const startTime = Date.now();
    const duration = 200;

    const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        flash.scale.set(1 + progress * 2, 1 + progress * 2, 1 + progress * 2);
        flash.material.opacity = 1 - progress;

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            game.scene.remove(flash);
            flash.geometry.dispose();
            flash.material.dispose();
        }
    };

    animate();
}

// Auto-shooting system
const fireTimers = new Map();  // Per-character cooldowns
const FIRE_RATE = 333;  // Milliseconds between shots (3 per second)
const TARGET_RANGE = 100;  // Range for finding targets

function findClosestObstacle(character) {
    let closest = null;
    let minDist = Infinity;

    obstacles.forEach(obstacle => {
        if (!obstacle.active || obstacle.destroyed) return;

        // Only target obstacles ahead
        if (obstacle.group.position.z < character.group.position.z) return;

        // Calculate distance
        const dx = obstacle.group.position.x - character.group.position.x;
        const dz = obstacle.group.position.z - character.group.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist <= TARGET_RANGE && dist < minDist) {
            minDist = dist;
            closest = obstacle;
        }
    });

    return closest;
}

function autoShoot() {
    const now = Date.now();

    game.squad.forEach((character, index) => {
        // Check cooldown
        const lastFire = fireTimers.get(index) || 0;
        if (now - lastFire < FIRE_RATE) return;

        // Find closest obstacle to target
        const target = findClosestObstacle(character);

        let targetX, targetY, targetZ;

        if (target) {
            // Aim at obstacle
            targetX = target.group.position.x;
            targetY = target.group.position.y + 1;
            targetZ = target.group.position.z;
        } else {
            // Shoot forward if no target
            targetX = character.group.position.x;
            targetY = 0;
            targetZ = character.group.position.z + 50;
        }

        // Fire bullet
        const bullet = getBullet();
        bullet.fire(
            character.group.position.x,
            character.group.position.y + 0.5,  // Shoot from character height
            character.group.position.z,
            targetX,
            targetY,
            targetZ
        );

        // Update cooldown
        fireTimers.set(index, now);
    });
}

// ============================================================================
// ITERATION 5: OBSTACLE SYSTEM
// ============================================================================

class Obstacle {
    constructor(x, y, z) {
        this.group = new THREE.Group();

        // Create tire stack (3 tires)
        const tireRadius = 1.0;
        const tireThickness = 0.5;

        for (let i = 0; i < 3; i++) {
            // Outer tire
            const outerGeometry = new THREE.TorusGeometry(tireRadius, tireThickness * 0.4, 16, 32);
            const tireMaterial = new THREE.MeshPhongMaterial({
                color: 0x222222,  // Dark rubber
                shininess: 5
            });
            const tire = new THREE.Mesh(outerGeometry, tireMaterial);
            tire.rotation.x = Math.PI / 2;
            tire.position.y = i * tireThickness;
            tire.castShadow = true;
            tire.receiveShadow = true;
            this.group.add(tire);
        }

        // Position obstacle
        this.group.position.set(x, y, z);
        this.group.scale.set(1.2, 1.2, 1.2);
        game.scene.add(this.group);

        // HP properties
        this.maxHp = Math.floor(Math.random() * 50) + 50;  // 50-100 HP
        this.hp = this.maxHp;
        this.active = true;
        this.destroyed = false;

        // Create HP text (using DOM overlay would be better, but using 3D text for now)
        // For simplicity, we'll create a plane with color indicating HP
        this.createHPBar();
    }

    createHPBar() {
        // HP bar background (red)
        const bgGeometry = new THREE.PlaneGeometry(2, 0.3);
        const bgMaterial = new THREE.MeshBasicMaterial({
            color: 0xFF0000,
            side: THREE.DoubleSide
        });
        this.hpBarBg = new THREE.Mesh(bgGeometry, bgMaterial);
        this.hpBarBg.position.set(0, 2.5, 0);
        this.group.add(this.hpBarBg);

        // HP bar foreground (green)
        const fgGeometry = new THREE.PlaneGeometry(2, 0.3);
        const fgMaterial = new THREE.MeshBasicMaterial({
            color: 0x00FF00,
            side: THREE.DoubleSide
        });
        this.hpBarFg = new THREE.Mesh(fgGeometry, fgMaterial);
        this.hpBarFg.position.set(0, 2.5, 0.01);
        this.group.add(this.hpBarFg);

        // Make HP bars face camera
        this.hpBarBg.lookAt(game.camera.position);
        this.hpBarFg.lookAt(game.camera.position);
    }

    takeDamage(amount) {
        if (this.destroyed) return false;

        this.hp -= amount;

        // Update HP bar
        const hpPercent = Math.max(0, this.hp / this.maxHp);
        this.hpBarFg.scale.x = hpPercent;
        this.hpBarFg.position.x = -(1 - hpPercent);

        // Flash effect
        const originalColor = this.group.children[0].material.color.getHex();
        this.group.children.forEach(child => {
            if (child.material) {
                child.material.color.setHex(0xFF0000);
            }
        });

        setTimeout(() => {
            this.group.children.forEach(child => {
                if (child.material && child !== this.hpBarBg && child !== this.hpBarFg) {
                    child.material.color.setHex(originalColor);
                }
            });
        }, 50);

        // Check if destroyed
        if (this.hp <= 0 && !this.destroyed) {
            this.destroy();
            return true;
        }

        return false;
    }

    update() {
        if (!this.active) return;

        // Make HP bars always face camera
        if (this.hpBarBg) {
            this.hpBarBg.lookAt(game.camera.position);
            this.hpBarFg.lookAt(game.camera.position);
        }
    }

    destroy() {
        this.destroyed = true;

        // Explosion effect (simple scale down with fadeout)
        const originalScale = this.group.scale.clone();

        const startTime = Date.now();
        const duration = 300;

        const animateDestruction = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            this.group.scale.set(
                originalScale.x * (1 - progress),
                originalScale.y * (1 - progress),
                originalScale.z * (1 - progress)
            );

            this.group.children.forEach(child => {
                if (child.material) {
                    child.material.opacity = 1 - progress;
                    child.material.transparent = true;
                }
            });

            if (progress < 1) {
                requestAnimationFrame(animateDestruction);
            } else {
                this.cleanup();
            }
        };

        animateDestruction();
    }

    cleanup() {
        game.scene.remove(this.group);
        this.active = false;

        // Dispose geometries and materials
        this.group.children.forEach(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        });
    }
}

// Obstacle management
const obstacles = [];
let lastObstacleSpawn = 0;
const OBSTACLE_SPAWN_INTERVAL = 2000;  // Spawn every 2 seconds

function spawnObstacle() {
    // Random X position within bridge bounds (±15 units)
    const x = (Math.random() - 0.5) * 30;
    const y = 0;

    // Spawn ahead of squad
    let spawnZ = 50;  // Default start position
    if (game.squad.length > 0) {
        const avgZ = game.squad.reduce((sum, char) => sum + char.group.position.z, 0) / game.squad.length;
        spawnZ = avgZ + 100;  // Spawn 100 units ahead
    }

    const obstacle = new Obstacle(x, y, spawnZ);
    obstacles.push(obstacle);

    return obstacle;
}

function updateObstacles() {
    // Update existing obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];

        if (!obstacle.active) {
            obstacles.splice(i, 1);
            continue;
        }

        obstacle.update();

        // Remove obstacles far behind camera
        if (game.squad.length > 0) {
            const avgZ = game.squad.reduce((sum, char) => sum + char.group.position.z, 0) / game.squad.length;
            if (obstacle.group.position.z < avgZ - 50) {
                obstacle.cleanup();
                obstacles.splice(i, 1);
            }
        }
    }

    // Spawn new obstacles
    const now = Date.now();
    if (now - lastObstacleSpawn > OBSTACLE_SPAWN_INTERVAL) {
        spawnObstacle();
        lastObstacleSpawn = now;
    }
}

// ============================================================================
// ITERATION 2: CHARACTER SYSTEM
// ============================================================================

class Character {
    constructor(x, y, z, index) {
        this.group = new THREE.Group();
        this.index = index;

        // Body (capsule shape approximated with cylinder + spheres)
        const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.0, 8);
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0xDEB887,  // Skin tone
            shininess: 5
        });
        this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.body.castShadow = true;
        this.body.receiveShadow = true;
        this.group.add(this.body);

        // Helmet (blue for player squad)
        const helmetGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const helmetMaterial = new THREE.MeshPhongMaterial({
            color: 0x00BFFF,  // Cyan
            shininess: 30
        });
        this.helmet = new THREE.Mesh(helmetGeometry, helmetMaterial);
        this.helmet.position.y = 0.7;
        this.helmet.castShadow = true;
        this.group.add(this.helmet);

        // Legs (simple rectangles)
        const legGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.6, 6);
        const legMaterial = new THREE.MeshPhongMaterial({
            color: 0x333333  // Dark pants
        });

        this.leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        this.leftLeg.position.set(-0.15, -0.8, 0);
        this.leftLeg.castShadow = true;
        this.group.add(this.leftLeg);

        this.rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        this.rightLeg.position.set(0.15, -0.8, 0);
        this.rightLeg.castShadow = true;
        this.group.add(this.rightLeg);

        // Position and scale
        this.group.position.set(x, y, z);
        this.group.scale.set(1.5, 1.5, 1.5);  // Make BIG (1.5 units tall)

        // Add to scene
        game.scene.add(this.group);

        // Physics properties
        this.targetX = x;
        this.targetZ = z;
        this.velocityX = 0;
        this.velocityZ = 0;
        this.fireTimer = 0;

        // Formation properties
        this.formationOffsetX = 0;
        this.formationOffsetZ = 0;
    }

    update(deltaTime, squadCenter, allCharacters) {
        // Calculate target position (squad center + formation offset + player input)
        const targetX = squadCenter.x + this.formationOffsetX + game.pointer.targetX;
        const targetZ = squadCenter.z + this.formationOffsetZ + (game.autoForward ? game.forwardSpeed * deltaTime : 0);

        // Apply separation forces (blob physics)
        let separationX = 0;
        let separationZ = 0;
        const separationRadius = 1.2;  // Minimum distance between characters
        const separationStrength = 3.0;

        allCharacters.forEach(other => {
            if (other === this) return;

            const dx = this.group.position.x - other.group.position.x;
            const dz = this.group.position.z - other.group.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);

            if (dist < separationRadius && dist > 0) {
                const force = (separationRadius - dist) / separationRadius;
                separationX += (dx / dist) * force * separationStrength;
                separationZ += (dz / dist) * force * separationStrength;
            }
        });

        // Apply forces to velocity
        const moveSpeed = 8.0;
        const drag = 0.85;

        this.velocityX += (targetX - this.group.position.x) * moveSpeed * deltaTime;
        this.velocityZ += (targetZ - this.group.position.z) * moveSpeed * deltaTime;

        this.velocityX += separationX * deltaTime;
        this.velocityZ += separationZ * deltaTime;

        // Apply drag
        this.velocityX *= drag;
        this.velocityZ *= drag;

        // Update position
        this.group.position.x += this.velocityX * deltaTime;
        this.group.position.z += this.velocityZ * deltaTime;

        // Clamp to bridge bounds (±18 units, leaving margin for edges)
        this.group.position.x = Math.max(-18, Math.min(18, this.group.position.x));

        // Simple running animation (bob up and down)
        const time = game.clock.getElapsedTime();
        this.group.position.y = Math.sin(time * 10 + this.index * 0.5) * 0.1;
    }

    destroy() {
        game.scene.remove(this.group);
    }
}

function createSquad(count = 14) {
    console.log(`👥 Iteration 2 & 3: Creating squad of ${count} characters...`);

    // Clear existing squad
    game.squad.forEach(char => char.destroy());
    game.squad = [];

    // Create characters in a simple grid formation
    const cols = Math.ceil(Math.sqrt(count));
    const spacing = 1.5;

    for (let i = 0; i < count; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;

        const x = (col - (cols - 1) / 2) * spacing;
        const z = 10 + row * spacing;  // Start at Z=10 on bridge
        const y = 0;  // On bridge surface

        const character = new Character(x, y, z, i);

        // Store formation offset from center
        character.formationOffsetX = (col - (cols - 1) / 2) * spacing;
        character.formationOffsetZ = row * spacing;

        game.squad.push(character);
    }

    console.log(`✓ Created ${count} characters on bridge`);
    console.log(`   Position: Z=10 (bridge start)`);
    console.log(`   Formation: ${cols}×${Math.ceil(count/cols)} grid`);
    console.log(`   Scale: 1.5 (large and visible)`);
    console.log(`   Blob physics: Separation radius = 1.2 units`);
}

function updateSquad(deltaTime) {
    if (game.squad.length === 0) return;

    // Calculate squad center
    let avgX = 0, avgZ = 0;
    game.squad.forEach(char => {
        avgX += char.group.position.x;
        avgZ += char.group.position.z;
    });
    avgX /= game.squad.length;
    avgZ /= game.squad.length;

    const squadCenter = { x: avgX, z: avgZ };

    // Update each character with blob physics
    game.squad.forEach(char => {
        char.update(deltaTime, squadCenter, game.squad);
    });

    // Camera follows behind squad
    const targetCamX = avgX;
    const targetCamY = avgZ + 8;  // Above
    const targetCamZ = avgZ - 10;  // Behind

    game.camera.position.x += (targetCamX - game.camera.position.x) * 0.1;
    game.camera.position.y += (targetCamY - game.camera.position.y) * 0.1;
    game.camera.position.z += (targetCamZ - game.camera.position.z) * 0.1;

    game.camera.lookAt(avgX, 0, avgZ + 20);  // Look ahead
}

// ============================================================================
// ANIMATION LOOP
// ============================================================================

function animate() {
    requestAnimationFrame(animate);

    const deltaTime = game.clock.getDelta();
    const elapsedTime = game.clock.getElapsedTime();

    // Update squad (Iteration 2 & 3)
    updateSquad(deltaTime);

    // Auto-shooting & bullets (Iteration 4)
    if (!game.paused && !game.gameOver) {
        autoShoot();
        updateBullets(deltaTime);
        updateObstacles();  // Iteration 5
    }

    // Animate water (basic wave for now, full shader in Iteration 9)
    if (game.water) {
        const positions = game.water.geometry.attributes.position;
        const baseVertices = game.water.userData.baseVertices;

        for (let i = 0; i < positions.count; i++) {
            const x = baseVertices[i * 3];
            const z = baseVertices[i * 3 + 2];

            // Simple wave animation
            const y = Math.sin(x * 0.1 + elapsedTime * 2) * 0.5 +
                     Math.sin(z * 0.15 + elapsedTime * 1.5) * 0.3;

            positions.setY(i, y);
        }

        positions.needsUpdate = true;
    }

    // Render scene
    game.renderer.render(game.scene, game.camera);
}

// ============================================================================
// INPUT HANDLING (ITERATION 3)
// ============================================================================

function onPointerDown(event) {
    game.pointer.isDown = true;
    updatePointerPosition(event);
}

function onPointerMove(event) {
    if (game.pointer.isDown) {
        updatePointerPosition(event);
    }
}

function onPointerUp(event) {
    game.pointer.isDown = false;
    // Reset to center when released
    game.pointer.targetX = 0;
}

function updatePointerPosition(event) {
    // Get normalized pointer position (-1 to +1)
    const x = event.clientX || (event.touches && event.touches[0].clientX);
    if (x === undefined) return;

    // Convert to world X coordinate (±15 units for bridge width)
    const normalizedX = (x / window.innerWidth) * 2 - 1;
    game.pointer.targetX = normalizedX * 15;  // Max ±15 units
}

// Mouse events
window.addEventListener('mousedown', onPointerDown);
window.addEventListener('mousemove', onPointerMove);
window.addEventListener('mouseup', onPointerUp);
window.addEventListener('mouseleave', onPointerUp);

// Touch events
window.addEventListener('touchstart', onPointerDown, { passive: true });
window.addEventListener('touchmove', onPointerMove, { passive: true });
window.addEventListener('touchend', onPointerUp);
window.addEventListener('touchcancel', onPointerUp);

// ============================================================================
// WINDOW EVENTS
// ============================================================================

function onWindowResize() {
    game.camera.aspect = window.innerWidth / window.innerHeight;
    game.camera.updateProjectionMatrix();
    game.renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize);

// ============================================================================
// INITIALIZATION
// ============================================================================

function init() {
    console.log('🎮 Bridge Battle - Three.js 3D');
    console.log('🔧 Iteration 1: Scene Foundation ✓');
    console.log('🔧 Iteration 2: Characters ✓');
    console.log('🔧 Iteration 3: Squad Formation & Controls ✓');
    console.log('🔧 Iteration 4: Auto-Shooting System ✓');
    console.log('🔧 Iteration 5: Obstacles with HP & Collision ✓');
    console.log('');

    initScene();
    createBridge();
    createWater();
    initBulletPool();
    createSquad(14);

    console.log('✅ Iterations 1-5 Complete!');
    console.log('');
    console.log('📋 Iteration 1 Checklist:');
    console.log('   ✓ Scene created with sky blue background');
    console.log('   ✓ Camera positioned at (0, 8, -10) looking forward');
    console.log('   ✓ Lighting: Sun, ambient, hemisphere');
    console.log('   ✓ Bridge: 40 units wide × 1000 long, gray');
    console.log('   ✓ Bridge edges and pillars (red)');
    console.log('   ✓ Lane markings (white dashed)');
    console.log('   ✓ Water plane at Y=-20, animated waves');
    console.log('');
    console.log('📋 Iteration 2 Checklist:');
    console.log('   ✓ 14 characters created on bridge');
    console.log('   ✓ Characters at Z=10 (bridge start)');
    console.log('   ✓ Characters scaled to 1.5 (large and visible)');
    console.log('   ✓ Camera follows behind squad');
    console.log('');
    console.log('📋 Iteration 3 Checklist:');
    console.log('   ✓ Mouse/touch input controls');
    console.log('   ✓ Squad moves left/right with pointer');
    console.log('   ✓ Auto-forward movement at 50 units/sec');
    console.log('   ✓ Blob physics with separation forces');
    console.log('   ✓ Characters maintain formation');
    console.log('   ✓ Bridge boundary clamping (±18 units)');
    console.log('');
    console.log('📋 Iteration 4 Checklist:');
    console.log('   ✓ Bullet pool system (500 bullets)');
    console.log('   ✓ Auto-shooting: 3 bullets/sec per character');
    console.log('   ✓ Bullet physics: 80 units/sec speed');
    console.log('   ✓ 3-second bullet lifetime');
    console.log('   ✓ Per-character fire cooldowns');
    console.log('   ✓ Auto-targeting system (100-unit range)');
    console.log('');
    console.log('📋 Iteration 5 Checklist:');
    console.log('   ✓ Tire stack obstacles (3 tires each)');
    console.log('   ✓ HP bars (50-100 HP per obstacle)');
    console.log('   ✓ Bullet-obstacle collision detection');
    console.log('   ✓ Damage system (10 damage per bullet)');
    console.log('   ✓ Destruction animation with fadeout');
    console.log('   ✓ Hit effects (orange flash)');
    console.log('   ✓ Auto-spawning every 2 seconds');
    console.log('');
    console.log('🎬 Starting animation loop...');
    console.log('🎮 Controls: Click/drag or touch to steer squad left/right');
    console.log('🎯 Watch your squad auto-shoot and destroy obstacles!');

    // Hide loading screen now that game is initialized
    const loadingScreen = document.getElementById('loading');
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        console.log('✓ Loading screen hidden - game ready!');
    }

    animate();
}

// Start the game
init();

// Export game object for debugging
window.game = game;
