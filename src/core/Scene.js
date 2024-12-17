import {
    THREE,
    params,
    sharedParams,
} from "../../config.js";
import {getModelSize} from "../managers/MeasurementManager.js";
// core/Scene.js
export class Scene extends THREE.Scene {
  constructor() {
    super();
  }
  async setupScene(window, lights, lightHelpers) {
    sharedParams.border_texture_material = new THREE.MeshPhongMaterial({
      // specular: 3355443,
      specular: new THREE.Color(0x111111),
      map: sharedParams.texture_background,
      // shininess: 0.5,
      shininess: 30,
    });
    this.backgroundBlurriness = params.blurriness;
    sharedParams.texture_background.mapping = THREE.EquirectangularReflectionMapping;
    this.background = sharedParams.texture_background;
    this.environment = sharedParams.texture_background;
    this.lightSetup(lights, lightHelpers);
  }

  clear() {
    while (this.children.length > 0) {
      this.remove(this.children[0]);
    }
  }
  async lightSetup(lights, lightHelpers) {
    let radius = 1000;
    let lightIntensity1 = 1;
    let lightIntensity2 = 2.3;

    if (params.defaultModel) {
      const model_size = parseInt(await getModelSize(params.defaultModel));
      if (model_size >= 2000) {
        radius = 170;
      }
    }

    const customDropdownButton = document.querySelector(
      `.custom-dropdown[data-type="frame"]`
    );
    const selectedItem = customDropdownButton.querySelector(
      ".dropdown-item.selected"
    );
    if (selectedItem) {
      const dataType = selectedItem.getAttribute("data-type");
      const dataColor = selectedItem.getAttribute("data-value");
      if (dataType == "color" && dataColor == "0xffffff") {
        lightIntensity1 = 0;
      }
    }

    // Remove previously added lights and helpers
    lights.forEach((light) => {
      this.remove(light);
      light.dispose(); // Optional: Dispose of light resources
    });
    lightHelpers.forEach((helper) => {
      this.remove(helper);
      // No need to dispose of helper resources explicitly in most cases
    });

    // Clear the arrays
    lights.length = 0;
    lightHelpers.length = 0;

    // const radius = customRadius;
    const height = 550;

    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const directionalLight = new THREE.DirectionalLight(
        0xffffff,
        i % 2 === 0 ? lightIntensity1 : lightIntensity2
      );
      directionalLight.position.set(x, height, z);

      const targetObject = new THREE.Object3D();
      targetObject.position.set(0, -90, 0);
      this.add(targetObject);

      directionalLight.target = targetObject;
      directionalLight.target.updateMatrixWorld();

      this.add(directionalLight);
      lights.push(directionalLight);

      const directionalLightHelper = new THREE.DirectionalLightHelper(
        directionalLight,
        5
      );
      // scene.add(directionalLightHelper);
      lightHelpers.push(directionalLightHelper);
    }
  }
}
