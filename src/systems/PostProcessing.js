/**
 * PostProcessing - AAA-quality post-processing effects for Three.js
 * Implements bloom, FXAA, color grading, and vignette
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';

/**
 * Color Grading Shader
 * Adjusts colors for cinematic look
 */
const ColorGradingShader = {
    uniforms: {
        'tDiffuse': { value: null },
        'brightness': { value: 0.0 },
        'contrast': { value: 1.05 },
        'saturation': { value: 1.1 },
        'tint': { value: new THREE.Color(1.0, 1.0, 1.0) }
    },

    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,

    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float brightness;
        uniform float contrast;
        uniform float saturation;
        uniform vec3 tint;
        varying vec2 vUv;

        vec3 adjustBrightness(vec3 color, float value) {
            return color + value;
        }

        vec3 adjustContrast(vec3 color, float value) {
            return 0.5 + (value * (color - 0.5));
        }

        vec3 adjustSaturation(vec3 color, float value) {
            const vec3 luminanceWeighting = vec3(0.2126, 0.7152, 0.0722);
            float luminance = dot(color, luminanceWeighting);
            return mix(vec3(luminance), color, value);
        }

        void main() {
            vec4 texel = texture2D(tDiffuse, vUv);
            vec3 color = texel.rgb;

            // Apply adjustments
            color = adjustBrightness(color, brightness);
            color = adjustContrast(color, contrast);
            color = adjustSaturation(color, saturation);
            color *= tint;

            gl_FragColor = vec4(color, texel.a);
        }
    `
};

/**
 * Vignette Shader
 * Darkens edges to focus attention on center
 */
const VignetteShader = {
    uniforms: {
        'tDiffuse': { value: null },
        'darkness': { value: 1.0 },
        'offset': { value: 0.8 }
    },

    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,

    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float darkness;
        uniform float offset;
        varying vec2 vUv;

        void main() {
            vec4 texel = texture2D(tDiffuse, vUv);
            vec2 uv = (vUv - 0.5) * 2.0;
            float vignette = 1.0 - dot(uv, uv) * darkness;
            vignette = smoothstep(0.0, offset, vignette);

            gl_FragColor = vec4(texel.rgb * vignette, texel.a);
        }
    `
};

/**
 * Post-Processing Manager
 * Handles all post-processing effects
 */
export class PostProcessingManager {
    constructor(renderer, scene, camera) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;

        // Create effect composer
        this.composer = new EffectComposer(renderer);

        // Get renderer size
        const size = new THREE.Vector2();
        renderer.getSize(size);

        // 1. Render Pass - renders the scene
        this.renderPass = new RenderPass(scene, camera);
        this.composer.addPass(this.renderPass);

        // 2. Bloom Pass - makes bright objects glow
        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(size.x, size.y),
            1.2,    // strength
            0.4,    // radius
            0.85    // threshold
        );
        this.composer.addPass(this.bloomPass);

        // 3. FXAA Pass - anti-aliasing
        this.fxaaPass = new ShaderPass(FXAAShader);
        this.fxaaPass.material.uniforms['resolution'].value.x = 1 / size.x;
        this.fxaaPass.material.uniforms['resolution'].value.y = 1 / size.y;
        this.composer.addPass(this.fxaaPass);

        // 4. Color Grading Pass
        this.colorGradingPass = new ShaderPass(ColorGradingShader);
        this.colorGradingPass.uniforms['brightness'].value = 0.05;  // Slightly brighter
        this.colorGradingPass.uniforms['contrast'].value = 1.08;    // More contrast
        this.colorGradingPass.uniforms['saturation'].value = 1.15;  // More saturated
        this.colorGradingPass.uniforms['tint'].value = new THREE.Color(1.0, 0.98, 0.95); // Warm tint
        this.composer.addPass(this.colorGradingPass);

        // 5. Vignette Pass - must be last
        this.vignettePass = new ShaderPass(VignetteShader);
        this.vignettePass.uniforms['darkness'].value = 0.5;
        this.vignettePass.uniforms['offset'].value = 0.9;
        this.vignettePass.renderToScreen = true;  // This is the final pass
        this.composer.addPass(this.vignettePass);

        console.log('✓ PostProcessingManager initialized');
        console.log('  - Bloom: ✓');
        console.log('  - FXAA: ✓');
        console.log('  - Color Grading: ✓');
        console.log('  - Vignette: ✓');

        // Settings
        this.enabled = true;
        this.bloomIntensity = 1.2;
    }

    /**
     * Handle window resize
     */
    resize(width, height) {
        this.composer.setSize(width, height);

        // Update FXAA resolution
        this.fxaaPass.material.uniforms['resolution'].value.x = 1 / width;
        this.fxaaPass.material.uniforms['resolution'].value.y = 1 / height;

        // Update bloom resolution
        this.bloomPass.resolution.set(width, height);
    }

    /**
     * Render the scene with post-processing
     */
    render() {
        if (this.enabled) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }

    /**
     * Set bloom intensity
     */
    setBloomIntensity(value) {
        this.bloomIntensity = value;
        this.bloomPass.strength = value;
    }

    /**
     * Get current bloom intensity
     */
    getBloomIntensity() {
        return this.bloomIntensity;
    }

    /**
     * Pulse bloom effect (for impactful moments)
     */
    pulseBloom(targetIntensity = 2.0, duration = 0.3) {
        const startIntensity = this.bloomIntensity;
        const startTime = performance.now();

        const animate = () => {
            const elapsed = (performance.now() - startTime) / 1000;
            const t = Math.min(elapsed / duration, 1.0);

            if (t < 0.5) {
                // Pulse up
                const easeT = t * 2;
                this.setBloomIntensity(startIntensity + (targetIntensity - startIntensity) * easeT);
            } else {
                // Pulse down
                const easeT = (t - 0.5) * 2;
                this.setBloomIntensity(targetIntensity - (targetIntensity - startIntensity) * easeT);
            }

            if (t < 1.0) {
                requestAnimationFrame(animate);
            } else {
                this.setBloomIntensity(startIntensity);
            }
        };

        animate();
    }

    /**
     * Flash effect (for big impacts)
     */
    flash(intensity = 0.5, duration = 0.2) {
        const startBrightness = this.colorGradingPass.uniforms['brightness'].value;
        const targetBrightness = startBrightness + intensity;
        const startTime = performance.now();

        const animate = () => {
            const elapsed = (performance.now() - startTime) / 1000;
            const t = Math.min(elapsed / duration, 1.0);

            // Ease out
            const easeT = 1 - Math.pow(1 - t, 3);
            const brightness = targetBrightness - (targetBrightness - startBrightness) * easeT;
            this.colorGradingPass.uniforms['brightness'].value = brightness;

            if (t < 1.0) {
                requestAnimationFrame(animate);
            } else {
                this.colorGradingPass.uniforms['brightness'].value = startBrightness;
            }
        };

        animate();
    }

    /**
     * Enable/disable post-processing
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    /**
     * Toggle post-processing on/off
     */
    toggle() {
        this.enabled = !this.enabled;
        console.log(`Post-processing: ${this.enabled ? 'ON' : 'OFF'}`);
        return this.enabled;
    }

    /**
     * Update color grading settings
     */
    setColorGrading(brightness, contrast, saturation, tint) {
        if (brightness !== undefined) {
            this.colorGradingPass.uniforms['brightness'].value = brightness;
        }
        if (contrast !== undefined) {
            this.colorGradingPass.uniforms['contrast'].value = contrast;
        }
        if (saturation !== undefined) {
            this.colorGradingPass.uniforms['saturation'].value = saturation;
        }
        if (tint !== undefined) {
            this.colorGradingPass.uniforms['tint'].value = tint;
        }
    }

    /**
     * Update vignette settings
     */
    setVignette(darkness, offset) {
        if (darkness !== undefined) {
            this.vignettePass.uniforms['darkness'].value = darkness;
        }
        if (offset !== undefined) {
            this.vignettePass.uniforms['offset'].value = offset;
        }
    }

    /**
     * Clean up resources
     */
    dispose() {
        this.composer.dispose();
    }
}

export default PostProcessingManager;
