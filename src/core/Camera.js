import * as THREE from 'three';
// core/Camera.js
export class Camera extends THREE.PerspectiveCamera {
    constructor(fov = 45, aspect = window.innerWidth / window.innerHeight, near = 1, far = 5000000) {
        super(fov, aspect, near, far);
        this.setupInitialPosition();
    }

    setupInitialPosition() {
        this.position.set(2000, 1000, 2000);
        this.lookAt(0, 0, 0);
        this.updateAspect(this.aspect);
    }

    updateAspect(aspect) {
        this.aspect = aspect;
        this.updateProjectionMatrix();
    }

    setOptimalPosition(boundingBox) {
        const size = new THREE.Vector3();
        boundingBox.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = this.fov * (Math.PI / 180);
        const cameraZ = Math.abs(maxDim / Math.sin(fov / 2));
        
        this.position.set(cameraZ, cameraZ / 2, cameraZ);
        this.lookAt(boundingBox.getCenter(new THREE.Vector3()));
        this.updateProjectionMatrix();
    }
}