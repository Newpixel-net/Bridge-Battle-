// Player squad with blob formation system

class Squad {
    constructor(scene, initialSize = 5) {
        this.scene = scene;
        this.members = [];
        this.targetPosition = new THREE.Vector3(0, 0, 0);
        this.moveSpeed = 15;
        this.separationForce = 2.0;
        this.cohesionForce = 1.0;
        this.targetDistance = 1.5; // Desired distance between members
        this.forwardSpeed = 10; // Forward movement speed

        // Initialize squad
        this.createMember();
        for (let i = 1; i < initialSize; i++) {
            this.addMember();
        }
    }

    // Create a single squad member (simple character representation)
    createMember() {
        const member = new THREE.Group();

        // Body (capsule-like shape)
        const bodyGeometry = new THREE.CapsuleGeometry(0.4, 1.0, 8, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0x00FF88,
            roughness: 0.7,
            metalness: 0.3
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.0;
        body.castShadow = true;
        member.add(body);

        // Head
        const headGeometry = new THREE.SphereGeometry(0.35, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFDDAA,
            roughness: 0.8
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.8;
        head.castShadow = true;
        member.add(head);

        // Simple weapon (gun)
        const weaponGeometry = new THREE.BoxGeometry(0.15, 0.15, 0.8);
        const weaponMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            metalness: 0.8
        });
        const weapon = new THREE.Mesh(weaponGeometry, weaponMaterial);
        weapon.position.set(0.3, 1.2, -0.3);
        weapon.rotation.x = -Math.PI / 4;
        member.add(weapon);

        member.velocity = new THREE.Vector3();
        member.isRunning = true;

        this.scene.add(member);
        this.members.push(member);

        return member;
    }

    // Add a new member to the squad
    addMember() {
        if (this.members.length === 0) {
            return this.createMember();
        }

        const member = this.createMember();

        // Spawn near the center of the squad
        const center = this.getCenter();
        member.position.set(
            center.x + Utils.randomRange(-2, 2),
            0,
            center.z + Utils.randomRange(-2, 2)
        );

        return member;
    }

    // Remove a member from the squad
    removeMember() {
        if (this.members.length === 0) return;

        const member = this.members.pop();
        this.scene.remove(member);
        Utils.disposeObject(member);
    }

    // Add multiple members
    addMembers(count) {
        for (let i = 0; i < count; i++) {
            this.addMember();
        }
    }

    // Remove multiple members
    removeMembers(count) {
        for (let i = 0; i < count; i++) {
            this.removeMember();
        }
    }

    // Set squad size (add or remove members)
    setSize(size) {
        const currentSize = this.members.length;
        const diff = size - currentSize;

        if (diff > 0) {
            this.addMembers(diff);
        } else if (diff < 0) {
            this.removeMembers(Math.abs(diff));
        }
    }

    // Get the center position of the squad
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

    // Update blob formation using separation and cohesion forces
    updateFormation(deltaTime) {
        if (this.members.length === 0) return;

        const center = this.getCenter();

        this.members.forEach((member, index) => {
            // Separation force - avoid other members
            const separationForce = new THREE.Vector3();
            this.members.forEach((other, otherIndex) => {
                if (index === otherIndex) return;

                const distance = member.position.distanceTo(other.position);
                if (distance < this.targetDistance * 2) {
                    const repulsion = new THREE.Vector3()
                        .subVectors(member.position, other.position)
                        .normalize()
                        .multiplyScalar(this.separationForce / (distance + 0.1));
                    separationForce.add(repulsion);
                }
            });

            // Cohesion force - stay close to center
            const cohesionForce = new THREE.Vector3()
                .subVectors(center, member.position)
                .multiplyScalar(this.cohesionForce);

            // Target following force - follow target position
            const targetForce = new THREE.Vector3()
                .subVectors(this.targetPosition, member.position)
                .multiplyScalar(2.0);

            // Combine forces
            member.velocity.add(separationForce.multiplyScalar(deltaTime));
            member.velocity.add(cohesionForce.multiplyScalar(deltaTime));
            member.velocity.add(targetForce.multiplyScalar(deltaTime));

            // Apply damping
            member.velocity.multiplyScalar(0.95);

            // Limit velocity
            const maxSpeed = this.moveSpeed;
            if (member.velocity.length() > maxSpeed) {
                member.velocity.normalize().multiplyScalar(maxSpeed);
            }

            // Update position
            member.position.add(member.velocity.clone().multiplyScalar(deltaTime));

            // Keep on ground
            member.position.y = 0;

            // Face movement direction
            if (member.velocity.length() > 0.1) {
                const angle = Math.atan2(member.velocity.x, member.velocity.z);
                member.rotation.y = angle;
            }

            // Simple running animation (bob up and down)
            if (member.isRunning) {
                const bobSpeed = 10;
                const bobAmount = 0.15;
                member.position.y = Math.abs(Math.sin(Date.now() * 0.001 * bobSpeed + index)) * bobAmount;
            }
        });
    }

    // Move squad forward automatically
    moveForward(deltaTime) {
        this.targetPosition.z -= this.forwardSpeed * deltaTime;
    }

    // Set horizontal target position (player control)
    setTargetX(x) {
        this.targetPosition.x = Utils.clamp(x, -15, 15); // Keep within bridge bounds
    }

    // Update squad
    update(deltaTime) {
        this.updateFormation(deltaTime);
    }

    // Check if squad is at a position (for gate collision)
    isAtZ(z, threshold = 2) {
        const center = this.getCenter();
        return Math.abs(center.z - z) < threshold;
    }

    // Get current size
    getSize() {
        return this.members.length;
    }

    // Clean up
    dispose() {
        this.members.forEach(member => {
            this.scene.remove(member);
            Utils.disposeObject(member);
        });
        this.members = [];
    }
}
