
import * as THREE from 'three';
import {params,} from "../../config.js";
export class Renderer extends THREE.WebGLRenderer {
    constructor(container) {
        super({
            antialias: true,
        });

        this.setPixelRatio(window.devicePixelRatio);
        this.setSize(window.innerWidth, window.innerHeight);
        this.toneMapping = THREE.NoToneMapping;
        this.toneMappingExposure = params.exposure;
        
        // Make sure container exists
        if (!container) {
            throw new Error('Container element is required');
        }
        
        // Clear container
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        
        // Append renderer to container
        container.appendChild(this.domElement);
        // this.setAnimationLoop(this);
    }
}