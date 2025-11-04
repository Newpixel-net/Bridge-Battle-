/**
 * Bridge Battle - Three.js 3D Implementation
 * Iteration 1: Scene Foundation
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

    // State
    paused: false,
    gameOver: false
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
// ANIMATION LOOP
// ============================================================================

function animate() {
    requestAnimationFrame(animate);

    const deltaTime = game.clock.getDelta();
    const elapsedTime = game.clock.getElapsedTime();

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
    console.log('🔧 Iteration 1: Scene Foundation');

    initScene();
    createBridge();
    createWater();

    console.log('✅ Iteration 1 Complete!');
    console.log('📋 Checklist:');
    console.log('   ✓ Scene created with sky blue background');
    console.log('   ✓ Camera positioned at (0, 8, -10) looking forward');
    console.log('   ✓ Lighting: Sun, ambient, hemisphere');
    console.log('   ✓ Bridge: 40 units wide × 1000 long, gray');
    console.log('   ✓ Bridge edges and pillars (red)');
    console.log('   ✓ Lane markings (white dashed)');
    console.log('   ✓ Water plane at Y=-20, animated waves');
    console.log('');
    console.log('🎬 Starting animation loop...');

    animate();
}

// Start the game
init();

// Export game object for debugging
window.game = game;
