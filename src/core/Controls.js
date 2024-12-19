import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export class Controls extends OrbitControls {
  constructor(camera, domElement) {
    // Call the parent class constructor with the necessary parameters
    super(camera, domElement);

    // Apply your custom settings
    this.maxPolarAngle = Math.PI / 2; // Adjust the value as needed
    this.enableDamping = true;
    this.dampingFactor = 0.25;
    this.screenSpacePanning = false;
  }
}
