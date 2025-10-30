// Shader definitions for Bridge Battle

const Shaders = {
    // Water shader with multiple sine waves for realistic water
    water: {
        vertexShader: `
            uniform float time;
            varying vec2 vUv;
            varying vec3 vPosition;
            varying float vElevation;

            // Wave parameters for 4 wave layers
            vec3 wave1 = vec3(0.5, 0.8, 1.0);   // amplitude, frequency, speed
            vec3 wave2 = vec3(0.3, 1.2, 1.5);
            vec3 wave3 = vec3(0.2, 1.6, 2.0);
            vec3 wave4 = vec3(0.15, 2.0, 2.5);

            // Wave directions (2D)
            vec2 dir1 = vec2(1.0, 0.5);
            vec2 dir2 = vec2(-0.7, 1.0);
            vec2 dir3 = vec2(0.5, -1.0);
            vec2 dir4 = vec2(-1.0, -0.3);

            float calculateWave(vec3 waveParams, vec2 direction, vec2 position, float t) {
                float amplitude = waveParams.x;
                float frequency = waveParams.y;
                float speed = waveParams.z;

                float dotProduct = dot(normalize(direction), position);
                return amplitude * sin(frequency * dotProduct + t * speed);
            }

            void main() {
                vUv = uv;
                vPosition = position;

                // Calculate elevation from multiple wave layers
                float elevation = 0.0;
                elevation += calculateWave(wave1, dir1, position.xz, time);
                elevation += calculateWave(wave2, dir2, position.xz, time);
                elevation += calculateWave(wave3, dir3, position.xz, time);
                elevation += calculateWave(wave4, dir4, position.xz, time);

                vElevation = elevation;

                // Apply elevation to vertex position
                vec3 newPosition = position;
                newPosition.y += elevation;

                gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            varying vec2 vUv;
            varying vec3 vPosition;
            varying float vElevation;

            void main() {
                // Base water color (deep blue to cyan gradient)
                vec3 deepWater = vec3(0.0, 0.2, 0.4);
                vec3 shallowWater = vec3(0.0, 0.5, 0.7);

                // Mix based on elevation
                float mixFactor = (vElevation + 1.0) * 0.5;
                vec3 waterColor = mix(deepWater, shallowWater, mixFactor);

                // Add some sparkle/foam on peaks
                float foam = smoothstep(0.5, 1.0, vElevation);
                waterColor += vec3(foam * 0.3);

                // Add animated shimmer
                float shimmer = sin(vPosition.x * 2.0 + time) * cos(vPosition.z * 2.0 + time) * 0.1;
                waterColor += vec3(shimmer);

                gl_FragColor = vec4(waterColor, 0.9);
            }
        `
    },

    // Holographic gate shader
    gate: {
        vertexShader: `
            varying vec2 vUv;
            varying vec3 vPosition;

            void main() {
                vUv = uv;
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform vec3 color1;
            uniform vec3 color2;
            uniform float opacity;
            varying vec2 vUv;
            varying vec3 vPosition;

            void main() {
                // Vertical gradient
                vec3 color = mix(color1, color2, vUv.y);

                // Animated scan lines
                float scanLine = sin(vUv.y * 20.0 + time * 3.0) * 0.5 + 0.5;
                color += vec3(scanLine * 0.2);

                // Edge glow
                float edge = 1.0 - abs(vUv.x - 0.5) * 2.0;
                edge = pow(edge, 3.0);
                color += vec3(edge * 0.3);

                // Pulsing effect
                float pulse = sin(time * 2.0) * 0.1 + 0.9;

                gl_FragColor = vec4(color * pulse, opacity);
            }
        `
    },

    // Bullet trail shader
    bulletTrail: {
        vertexShader: `
            varying vec2 vUv;

            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 color;
            uniform float opacity;
            varying vec2 vUv;

            void main() {
                // Fade from center to edges
                float dist = length(vUv - vec2(0.5));
                float alpha = 1.0 - smoothstep(0.0, 0.5, dist);

                gl_FragColor = vec4(color, alpha * opacity);
            }
        `
    },

    // Glowing weapon shader
    weaponGlow: {
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;

            void main() {
                vNormal = normalize(normalMatrix * normal);
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform vec3 glowColor;
            varying vec3 vNormal;
            varying vec3 vPosition;

            void main() {
                // Fresnel effect for rim lighting
                vec3 viewDirection = normalize(cameraPosition - vPosition);
                float fresnel = pow(1.0 - abs(dot(viewDirection, vNormal)), 3.0);

                // Pulsing glow
                float pulse = sin(time * 3.0) * 0.3 + 0.7;

                vec3 glow = glowColor * fresnel * pulse;

                gl_FragColor = vec4(glow, 1.0);
            }
        `
    }
};

// Helper function to create water material
function createWaterMaterial() {
    return new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 }
        },
        vertexShader: Shaders.water.vertexShader,
        fragmentShader: Shaders.water.fragmentShader,
        transparent: true,
        side: THREE.DoubleSide
    });
}

// Helper function to create gate material
function createGateMaterial(isPositive = true) {
    const color1 = isPositive ? new THREE.Color(0x00FFFF) : new THREE.Color(0xFF0000);
    const color2 = isPositive ? new THREE.Color(0x0088FF) : new THREE.Color(0x880000);

    return new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            color1: { value: color1 },
            color2: { value: color2 },
            opacity: { value: 0.7 }
        },
        vertexShader: Shaders.gate.vertexShader,
        fragmentShader: Shaders.gate.fragmentShader,
        transparent: true,
        side: THREE.DoubleSide
    });
}

// Helper function to create bullet trail material
function createBulletTrailMaterial(color) {
    return new THREE.ShaderMaterial({
        uniforms: {
            color: { value: new THREE.Color(color) },
            opacity: { value: 1.0 }
        },
        vertexShader: Shaders.bulletTrail.vertexShader,
        fragmentShader: Shaders.bulletTrail.fragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
}

// Helper function to create weapon glow material
function createWeaponGlowMaterial() {
    return new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            glowColor: { value: new THREE.Color(0x00FFFF) }
        },
        vertexShader: Shaders.weaponGlow.vertexShader,
        fragmentShader: Shaders.weaponGlow.fragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.FrontSide
    });
}
