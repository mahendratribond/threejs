import { THREE,params, allModelNames } from "../../config.js";
export async function getCurrentModelSize(model, node) {
  const cubeNode = model.getObjectByName(node);
  return getNodeSize(cubeNode);
}

export async function getNodeSize(cubeNode) {
  if (cubeNode) {
    const boundingBox = new THREE.Box3().setFromObject(cubeNode);
    const size = boundingBox.getSize(new THREE.Vector3());
    return size; // Returns an object with x, y, and z dimensions
  } else {
    return false; // Default size in case node is not found
  }
}

export async function calculateBoundingBox(object) {
  const bbox = new THREE.Box3();

  let nodes = ["Frame"];

  object.traverse(async function (modelNode) {
    if (allModelNames.includes(modelNode.name)) {
      // Ensure the object for modelNode.name exists
      if (!params.calculateBoundingBox[modelNode.name]) {
        params.calculateBoundingBox[modelNode.name] = {}; // Initialize if it doesn't exist
      }

      for (let val of nodes) {
        let thisNode = modelNode.getObjectByName(val);
        if (thisNode) {
          const boundingBox = new THREE.Box3().setFromObject(thisNode);
          params.calculateBoundingBox[modelNode.name][val] = boundingBox; // Now safe to assign
        }
      }
    }
  });

  return bbox;
}

export async function computeBoundingBox(object, frameNames) {
  const bbox = new THREE.Box3();

  // Traverse the object and expand the bounding box for visible nodes
  object.traverse(async function (modelNode) {
    if (frameNames.includes(modelNode.name)) {
      let isNodeVisible = modelNode.visible;

      // Expand the bounding box only if the node is visible and has visible parents
      if (isNodeVisible) {
        // console.log('modelNode.name', modelNode.name)
        bbox.expandByObject(modelNode);
      }
    }
  });

  return bbox;
}

export async function getHeaderSize(value) {
  return value.replace("Header_", "");
}

export async function getModelSize(model_name) {
  return model_name.replace("Model_", "");
}
