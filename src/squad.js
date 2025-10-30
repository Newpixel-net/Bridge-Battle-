// OPTIMIZED Squad with Instanced Rendering - NO FREEZE

class Squad {
    constructor(scene, initialSize = 5) {
        this.scene = scene;
        this.maxMembers = 50; // Maximum squad size
        this.currentSize = 0;
        this.members = []; // Just position/velocity data, not mesh objects

        this.targetPosition = new THREE.Vector3(0, 0, 0);
        this.moveSpeed = 15;
        this.separationForce = 2.5;
        this.cohesionForce = 2.0;
        this.targetDistance = 0.9;
        this.forwardSpeed = 10;

        // Create instanced meshes (one mesh for all characters)
        this.createInstancedMeshes();

        // Add initial members
        for (let i = 0; i < initialSize; i++) {
            this.addMember();
        }
    }

    createInstancedMeshes() {
        // Simple body geometry - LOW POLY
        const bodyGeometry = new THREE.BoxGeometry(0.6, 1.2, 0.5);
        const bodyMaterial = new THREE.MeshLambertMaterial({
            color: 0x4A90E2,
            flatShading: true // Cartoon look, faster
        });

        this.bodyInstances = new THREE.InstancedMesh(bodyGeometry, bodyMaterial, this.maxMembers);
        this.bodyInstances.castShadow = true;
        this.bodyInstances.count = 0; // Start with 0 visible
        this.scene.add(this.bodyInstances);

        // Simple head - sphere
        const headGeometry = new THREE.SphereGeometry(0.4, 8, 8); // LOW POLY
        const headMaterial = new THREE.MeshLambertMaterial({
            color: 0xFFDDAA,
            flatShading: true
        });

        this.headInstances = new THREE.InstancedMesh(headGeometry, headMaterial, this.maxMembers);
        this.headInstances.castShadow = true;
        this.headInstances.count = 0;
        this.scene.add(this.headInstances);

        // Red cap
        const capGeometry = new THREE.ConeGeometry(0.45, 0.3, 8);
        const capMaterial = new THREE.MeshLambertMaterial({
            color: 0xFF4444,
            flatShading: true
        });

        this.capInstances = new THREE.InstancedMesh(capGeometry, capMaterial, this.maxMembers);
        this.capInstances.castShadow = true;
        this.capInstances.count = 0;
        this.scene.add(this.capInstances);

        // Temporary matrices for transformations
        this.tempMatrix = new THREE.Matrix4();
        this.tempPosition = new THREE.Vector3();
        this.tempQuaternion = new THREE.Quaternion();
        this.tempScale = new THREE.Vector3(1, 1, 1);
    }

    addMember() {
        if (this.currentSize >= this.maxMembers) return;

        // Just store data, not create new meshes
        const center = this.getCenter();
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 0.5;

        this.members.push({
            position: new THREE.Vector3(
                center.x + Math.cos(angle) * radius,
                0,
                center.z + Math.sin(angle) * radius
            ),
            velocity: new THREE.Vector3(),
            rotation: 0,
            animOffset: Math.random() * Math.PI * 2
        });

        this.currentSize++;
        this.bodyInstances.count = this.currentSize;
        this.headInstances.count = this.currentSize;
        this.capInstances.count = this.currentSize;
    }

    removeMember() {
        if (this.currentSize === 0) return;

        this.members.pop();
        this.currentSize--;
        this.bodyInstances.count = this.currentSize;
        this.headInstances.count = this.currentSize;
        this.capInstances.count = this.currentSize;
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
        size = Math.min(size, this.maxMembers);
        const diff = size - this.currentSize;

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
        this.members.forEach(m => center.add(m.position));
        center.divideScalar(this.members.length);
        return center;
    }

    updateFormation(deltaTime) {
        if (this.members.length === 0) return;

        const center = this.getCenter();

        // Update all member positions
        for (let i = 0; i < this.members.length; i++) {
            const member = this.members[i];

            // Separation
            const separation = new THREE.Vector3();
            for (let j = 0; j < this.members.length; j++) {
                if (i === j) continue;
                const other = this.members[j];
                const dist = member.position.distanceTo(other.position);

                if (dist < this.targetDistance * 1.5 && dist > 0.01) {
                    const repel = new THREE.Vector3()
                        .subVectors(member.position, other.position)
                        .normalize()
                        .multiplyScalar(this.separationForce / Math.max(dist, 0.1));
                    separation.add(repel);
                }
            }

            // Cohesion
            const cohesion = new THREE.Vector3()
                .subVectors(center, member.position)
                .multiplyScalar(this.cohesionForce);

            // Target following
            const targetForce = new THREE.Vector3()
                .subVectors(this.targetPosition, member.position)
                .multiplyScalar(2.5);

            // Apply forces
            member.velocity.add(separation.multiplyScalar(deltaTime));
            member.velocity.add(cohesion.multiplyScalar(deltaTime));
            member.velocity.add(targetForce.multiplyScalar(deltaTime));

            // Damping
            member.velocity.multiplyScalar(0.9);

            // Limit speed
            if (member.velocity.length() > this.moveSpeed) {
                member.velocity.normalize().multiplyScalar(this.moveSpeed);
            }

            // Update position
            member.position.add(member.velocity.clone().multiplyScalar(deltaTime));
            member.position.y = 0;

            // Update rotation
            if (member.velocity.length() > 0.5) {
                const targetRot = Math.atan2(member.velocity.x, member.velocity.z);
                member.rotation += (targetRot - member.rotation) * deltaTime * 8;
            }

            // Update instanced meshes
            const time = Date.now() * 0.001;
            const bobAmount = Math.abs(Math.sin((time + member.animOffset) * 10)) * 0.08;

            // Body
            this.tempPosition.set(member.position.x, 0.6 + bobAmount, member.position.z);
            this.tempQuaternion.setFromEuler(new THREE.Euler(0, member.rotation, 0));
            this.tempMatrix.compose(this.tempPosition, this.tempQuaternion, this.tempScale);
            this.bodyInstances.setMatrixAt(i, this.tempMatrix);

            // Head
            this.tempPosition.set(member.position.x, 1.4 + bobAmount, member.position.z);
            this.tempMatrix.compose(this.tempPosition, this.tempQuaternion, this.tempScale);
            this.headInstances.setMatrixAt(i, this.tempMatrix);

            // Cap
            this.tempPosition.set(member.position.x, 1.75 + bobAmount, member.position.z);
            this.tempMatrix.compose(this.tempPosition, this.tempQuaternion, this.tempScale);
            this.capInstances.setMatrixAt(i, this.tempMatrix);
        }

        // Mark for update
        this.bodyInstances.instanceMatrix.needsUpdate = true;
        this.headInstances.instanceMatrix.needsUpdate = true;
        this.capInstances.instanceMatrix.needsUpdate = true;
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
        return this.currentSize;
    }

    dispose() {
        this.scene.remove(this.bodyInstances);
        this.scene.remove(this.headInstances);
        this.scene.remove(this.capInstances);

        this.bodyInstances.geometry.dispose();
        this.bodyInstances.material.dispose();
        this.headInstances.geometry.dispose();
        this.headInstances.material.dispose();
        this.capInstances.geometry.dispose();
        this.capInstances.material.dispose();

        this.members = [];
    }
}
