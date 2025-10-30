// Player squad with TIGHT blob formation - Professional quality

class Squad {
    constructor(scene, initialSize = 5) {
        this.scene = scene;
        this.members = [];
        this.targetPosition = new THREE.Vector3(0, 0, 0);
        this.moveSpeed = 20;
        this.separationForce = 3.0;
        this.cohesionForce = 2.5;
        this.targetDistance = 0.8; // MUCH TIGHTER - characters very close together
        this.forwardSpeed = 12;

        // Initialize squad
        for (let i = 0; i < initialSize; i++) {
            this.addMember();
        }
    }

    // Create professional-looking cartoon character
    createMember() {
        const member = new THREE.Group();

        // Material with cartoon shading (Toon material for cel-shaded look)
        const bodyMaterial = new THREE.MeshToonMaterial({
            color: 0x4A90E2, // Nice blue color
            gradientMap: this.createToonGradient()
        });

        const skinMaterial = new THREE.MeshToonMaterial({
            color: 0xFFDDAA,
            gradientMap: this.createToonGradient()
        });

        // Body with better proportions
        const torsoGeometry = new THREE.CylinderGeometry(0.35, 0.4, 0.9, 12);
        const torso = new THREE.Mesh(torsoGeometry, bodyMaterial);
        torso.position.y = 1.0;
        torso.castShadow = true;
        torso.receiveShadow = true;
        member.add(torso);

        // Head - larger and rounder for cartoon look
        const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const head = new THREE.Mesh(headGeometry, skinMaterial);
        head.position.y = 1.7;
        head.scale.set(1, 1.1, 1); // Slightly taller
        head.castShadow = true;
        head.receiveShadow = true;
        member.add(head);

        // Cap/helmet on top of head
        const capGeometry = new THREE.SphereGeometry(0.42, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const capMaterial = new THREE.MeshToonMaterial({
            color: 0xFF4444, // Red cap like in reference
            gradientMap: this.createToonGradient()
        });
        const cap = new THREE.Mesh(capGeometry, capMaterial);
        cap.position.y = 1.9;
        cap.castShadow = true;
        member.add(cap);

        // Arms
        const armGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.6, 8);
        const armMaterial = bodyMaterial;

        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.45, 0.9, 0);
        leftArm.rotation.z = Math.PI / 6;
        leftArm.castShadow = true;
        member.add(leftArm);

        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.45, 0.9, -0.1);
        rightArm.rotation.z = -Math.PI / 6;
        rightArm.castShadow = true;
        member.add(rightArm);

        // Legs
        const legGeometry = new THREE.CylinderGeometry(0.15, 0.12, 0.6, 8);
        const legMaterial = new THREE.MeshToonMaterial({
            color: 0x2C3E50, // Dark pants
            gradientMap: this.createToonGradient()
        });

        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.15, 0.3, 0);
        leftLeg.castShadow = true;
        member.add(leftLeg);

        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.15, 0.3, 0);
        rightLeg.castShadow = true;
        member.add(rightLeg);

        // Simple weapon
        const weaponGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.5);
        const weaponMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            metalness: 0.8,
            roughness: 0.3
        });
        const weapon = new THREE.Mesh(weaponGeometry, weaponMaterial);
        weapon.position.set(0.4, 1.1, -0.2);
        weapon.rotation.set(-Math.PI / 8, 0, 0);
        weapon.castShadow = true;
        member.add(weapon);

        // Add glow outline effect
        const outlineGeometry = new THREE.SphereGeometry(0.42, 16, 16);
        const outlineMaterial = new THREE.MeshBasicMaterial({
            color: 0x4A90E2,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });
        const outline = new THREE.Mesh(outlineGeometry, outlineMaterial);
        outline.position.y = 1.7;
        outline.scale.set(1.05, 1.15, 1.05);
        member.add(outline);

        member.velocity = new THREE.Vector3();
        member.isRunning = true;
        member.animationOffset = Math.random() * Math.PI * 2; // Random animation offset

        this.scene.add(member);
        this.members.push(member);

        // Spawn near center if not first member
        if (this.members.length > 1) {
            const center = this.getCenter();
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 0.5;
            member.position.set(
                center.x + Math.cos(angle) * radius,
                0,
                center.z + Math.sin(angle) * radius
            );
        }

        return member;
    }

    // Create toon gradient for cel-shaded look
    createToonGradient() {
        const colors = new Uint8Array(3);
        colors[0] = 0;
        colors[1] = 128;
        colors[2] = 255;

        const gradientMap = new THREE.DataTexture(colors, colors.length, 1, THREE.LuminanceFormat);
        gradientMap.needsUpdate = true;

        return gradientMap;
    }

    addMember() {
        return this.createMember();
    }

    removeMember() {
        if (this.members.length === 0) return;

        const member = this.members.pop();
        this.scene.remove(member);
        member.traverse(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        });
    }

    addMembers(count) {
        for (let i = 0; i < count; i++) {
            this.addMember();
        }
    }

    removeMembers(count) {
        for (let i = 0; i < count; i++) {
            this.removeMember();
        }
    }

    setSize(size) {
        const currentSize = this.members.length;
        const diff = size - currentSize;

        if (diff > 0) {
            this.addMembers(diff);
        } else if (diff < 0) {
            this.removeMembers(Math.abs(diff));
        }
    }

    getCenter() {
        if (this.members.length === 0) {
            return new THREE.Vector3();
        }

        const center = new THREE.Vector3();
        this.members.forEach(member => {
            center.add(member.position);
        });
        center.divideScalar(this.members.length);

        return center;
    }

    // TIGHT blob formation with strong forces
    updateFormation(deltaTime) {
        if (this.members.length === 0) return;

        const center = this.getCenter();

        this.members.forEach((member, index) => {
            // Very strong separation force to prevent overlap
            const separationForce = new THREE.Vector3();
            this.members.forEach((other, otherIndex) => {
                if (index === otherIndex) return;

                const distance = member.position.distanceTo(other.position);
                if (distance < this.targetDistance * 1.5 && distance > 0.01) {
                    const repulsion = new THREE.Vector3()
                        .subVectors(member.position, other.position)
                        .normalize()
                        .multiplyScalar(this.separationForce / Math.max(distance, 0.1));
                    separationForce.add(repulsion);
                }
            });

            // Strong cohesion to stay in tight blob
            const cohesionForce = new THREE.Vector3()
                .subVectors(center, member.position)
                .multiplyScalar(this.cohesionForce);

            // Follow target position (player input)
            const targetForce = new THREE.Vector3()
                .subVectors(this.targetPosition, member.position)
                .multiplyScalar(3.0);

            // Combine all forces
            member.velocity.add(separationForce.multiplyScalar(deltaTime));
            member.velocity.add(cohesionForce.multiplyScalar(deltaTime));
            member.velocity.add(targetForce.multiplyScalar(deltaTime));

            // Strong damping for tight control
            member.velocity.multiplyScalar(0.92);

            // Limit velocity
            const maxSpeed = this.moveSpeed;
            if (member.velocity.length() > maxSpeed) {
                member.velocity.normalize().multiplyScalar(maxSpeed);
            }

            // Update position
            member.position.add(member.velocity.clone().multiplyScalar(deltaTime));

            // Keep on ground
            member.position.y = 0;

            // Face movement direction smoothly
            if (member.velocity.length() > 0.5) {
                const targetAngle = Math.atan2(member.velocity.x, member.velocity.z);
                member.rotation.y += (targetAngle - member.rotation.y) * deltaTime * 10;
            }

            // Enhanced running animation
            if (member.isRunning) {
                const time = Date.now() * 0.001;
                const bobSpeed = 12;
                const bobAmount = 0.1;

                // Bob up and down
                member.position.y = Math.abs(Math.sin((time + member.animationOffset) * bobSpeed)) * bobAmount;

                // Arm swing
                if (member.children.length >= 5) {
                    const leftArm = member.children[3];
                    const rightArm = member.children[4];

                    const swingAmount = 0.3;
                    leftArm.rotation.x = Math.sin((time + member.animationOffset) * bobSpeed) * swingAmount;
                    rightArm.rotation.x = -Math.sin((time + member.animationOffset) * bobSpeed) * swingAmount;
                }
            }
        });
    }

    moveForward(deltaTime) {
        this.targetPosition.z -= this.forwardSpeed * deltaTime;
    }

    setTargetX(x) {
        this.targetPosition.x = Utils.clamp(x, -15, 15);
    }

    update(deltaTime) {
        this.updateFormation(deltaTime);
    }

    isAtZ(z, threshold = 2) {
        const center = this.getCenter();
        return Math.abs(center.z - z) < threshold;
    }

    getSize() {
        return this.members.length;
    }

    dispose() {
        this.members.forEach(member => {
            this.scene.remove(member);
            member.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
        });
        this.members = [];
    }
}
