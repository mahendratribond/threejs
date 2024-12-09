import { THREE, RGBELoader, GLTFLoader,sharedParams  } from "../../config.js";
import { setPositionCenter } from "../../utils6.js";

export const manager = new THREE.LoadingManager();
export const TextureLoaderJpg = new THREE.TextureLoader(manager).setPath(
  "./assets/images/background/"
);

// Create a function to load GLTF models using a Promise
const glftLoader = new GLTFLoader(manager).setPath("./assets/models/glb/");
export async function loadGLTFModel(url) {
  return new Promise((resolve, reject) => {
    glftLoader.load(
      url,
      async function (model_load) {
        let model = model_load.scene;
        // model.position.set(0, 0, 0);  // Reset position to the origin
        // model.position.set(0, -params.cameraPosition, 0);

        model = await setPositionCenter(model); // Center it in the scene

        model.scale.set(1, 1, 1);
        model.updateMatrixWorld();
        // Scale down the model
        // model.scale.set(0.1, 0.1, 0.1); // Adjust the scale if necessary
        resolve(model);
      },
      undefined,
      function (error) {
        reject(error);
      }
    );
  });
}


export const rgbeLoader = new RGBELoader(manager).setPath(
  "./assets/images/background/"
);
