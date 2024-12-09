import { THREE,params, allModelNames,sharedParams } from "../../config.js";
export async function commonMaterial(color) {
  const material = new THREE.MeshPhysicalMaterial({
    color: color, // Black color
    metalness: 0.5, // Full metallic
    roughness: 0.1, // Adjust roughness as needed
  });

  return material;
}

export async function clothsMaterial(color) {
  const material = new THREE.MeshStandardMaterial({
    color: color, // Black color
    metalness: 0, // Full metallic
    roughness: 0.8, // Adjust roughness as needed
  });

  return material;
}

export async function restoreMaterials(materialDataObject, loader) {
  for (let [modelName, materialData] of Object.entries(materialDataObject)) {
    if (!params.lastInnerMaterial[modelName]) {
      let restoredMaterials = {}; // Reset restoredMaterials for each modelName
      for (const materialName in materialData) {
        restoredMaterials[materialName] = loader.parse(
          materialData[materialName]
        );
      }
      params.lastInnerMaterial[modelName] = restoredMaterials;
    }
  }
}

export async function addNewMaterials(materialDataObject) {
  for (let [modelName, materialData] of Object.entries(materialDataObject)) {
    if (!params.lastInnerMaterial[modelName]) {
      let restoredMaterials = {}; // Reset restoredMaterials for each modelName
      for (const materialName in materialData) {
        restoredMaterials[materialName] = materialData[materialName];
      }
      params.lastInnerMaterial[modelName] = restoredMaterials;
    }
  }
}
