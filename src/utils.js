// Utility functions for Bridge Battle

const Utils = {
    // Linear interpolation
    lerp(start, end, t) {
        return start + (end - start) * t;
    },

    // Clamp value between min and max
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },

    // Random float between min and max
    randomRange(min, max) {
        return Math.random() * (max - min) + min;
    },

    // Random integer between min and max (inclusive)
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // Random choice from array
    randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    },

    // Distance between two 3D points
    distance3D(x1, y1, z1, x2, y2, z2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dz = z2 - z1;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    },

    // Distance between two 2D points
    distance2D(x1, z1, x2, z2) {
        const dx = x2 - x1;
        const dz = z2 - z1;
        return Math.sqrt(dx * dx + dz * dz);
    },

    // Screen shake effect
    screenShake(camera, intensity, duration) {
        const startTime = Date.now();
        const originalPos = {
            x: camera.position.x,
            y: camera.position.y,
            z: camera.position.z
        };

        function shake() {
            const elapsed = Date.now() - startTime;
            if (elapsed < duration) {
                const factor = 1 - (elapsed / duration);
                camera.position.x = originalPos.x + (Math.random() - 0.5) * intensity * factor;
                camera.position.y = originalPos.y + (Math.random() - 0.5) * intensity * factor;
                camera.position.z = originalPos.z + (Math.random() - 0.5) * intensity * factor;
                requestAnimationFrame(shake);
            } else {
                camera.position.set(originalPos.x, originalPos.y, originalPos.z);
            }
        }
        shake();
    },

    // Color based on squad size
    getSquadColor(size) {
        if (size <= 3) return 0xFFFF00; // Yellow
        if (size <= 7) return 0x00FF00; // Green
        if (size <= 12) return 0x00FFFF; // Cyan
        return 0xFF00FF; // Magenta
    },

    // Convert 3D position to screen coordinates
    toScreenPosition(obj, camera, renderer) {
        const vector = new THREE.Vector3();
        const widthHalf = renderer.domElement.width / 2;
        const heightHalf = renderer.domElement.height / 2;

        obj.updateMatrixWorld();
        vector.setFromMatrixPosition(obj.matrixWorld);
        vector.project(camera);

        vector.x = (vector.x * widthHalf) + widthHalf;
        vector.y = -(vector.y * heightHalf) + heightHalf;

        return {
            x: vector.x,
            y: vector.y
        };
    },

    // Format score with leading zeros
    formatScore(score) {
        return score.toString().padStart(6, '0');
    },

    // Create gradient texture
    createGradientTexture(color1, color2, width = 256, height = 256) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    },

    // Dispose Three.js object properly
    disposeObject(obj) {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
            if (Array.isArray(obj.material)) {
                obj.material.forEach(mat => {
                    if (mat.map) mat.map.dispose();
                    mat.dispose();
                });
            } else {
                if (obj.material.map) obj.material.map.dispose();
                obj.material.dispose();
            }
        }
    }
};
