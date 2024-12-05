import * as THREE from "three";
import { USDZExporter } from "three/addons/exporters/USDZExporter.js";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { SimplifyModifier } from "three/addons/modifiers/SimplifyModifier.js";
import { traverseAsync } from "../../utils6.js";
async function saveModel(blob, filename) {
  if (blob) {
    await saveArrayBuffer(blob, filename); // Save the file only if blob is not null
  }
}

async function exportGLB(clone, name) {
  const gltfExporter = new GLTFExporter();
  // Define the export options
  const options = {
    // Mesh compression options
    compressed: true, // Enable mesh compression
    bufferStreamed: true, // Stream the buffer data
    compressMaterials: true, // Compress materials

    // Texture compression options
    embedImages: false, // Embed images in the GLB file
    forcePowerOfTwoTextures: true, // Ensure textures have power-of-two dimensions
    textureCompressionFormat: THREE.RGBA_ASTC_4x4_Format, // Use ASTC texture compression

    // Other options
    includeCustomExtensions: false, // Exclude custom extensions
    includeImages: false, // Include images in the GLB file
    includeAnimations: false, // Exclude animations
    includeMaterials: true, // Include materials
    includeGeometries: true, // Include geometries

    // Normal options
    includeNormals: false, // Set to false to exclude normals
    binary: true,
  };
  const result = await gltfExporter.parseAsync(clone, options);
  const blob = new Blob([result], { type: "application/octet-stream" });
  // const modellink = document.createElement("a");
  // modellink.href = URL.createObjectURL(blob);
  // modellink.download = name + ".glb";
  // modellink.click();
  await saveModel(blob, `${name}.glb`);
}

async function exportUSDZ(clone, name) {
  convertToStandardMaterial(clone);
  // reduceModelPolygons(clone, 0.5);
  const usdzExporter = new USDZExporter();
  const result = await usdzExporter.parse(clone, {
    textureCompressionQuality: 0.1,
    maxTextureSize: 512,
    compressGeometry: true,
    flipY: false, // Important for USDZ
  });
  const blob = new Blob([result], { type: "application/octet-stream" });
  await saveModel(blob, `${name}.usdz`);
}

async function removeInvisibleChildren(object) {
  // Iterate over each child of the current object
  for (let i = 0; i < object.children.length; i++) {
    const child = object.children[i];

    // Recursively check and remove invisible children
    if (child.children.length > 0) {
      removeInvisibleChildren(child);
    }

    // If child is invisible, remove it
    if (child.visible === false) {
      object.remove(child);
      i--; // Adjust the index after removal
    }
  }
}

function removeSimilarMaterials(scene) {
  const materialMap = new Map();

  scene.traverse((object) => {
    if (object.isMesh) {
      const material = object.material;

      if (Array.isArray(material)) {
        // Handle multi-material meshes
        object.material = material.map((mat) =>
          getOrCreateUniqueMaterial(mat, materialMap)
        );
      } else if (material) {
        // Handle single materials
        object.material = getOrCreateUniqueMaterial(material, materialMap);
      }
    }
  });
  // console.log("Unique materials:", materialMap.size);
}

function getOrCreateUniqueMaterial(material, materialMap) {
  // Create a unique key based on material properties
  const key = createMaterialKey(material);

  if (materialMap.has(key)) {
    return materialMap.get(key); // Use existing material
  } else {
    materialMap.set(key, material); // Add new material
    return material;
  }
}

function createMaterialKey(material) {
  const colorKey = material.color ? material.color.getHexString() : "no_color";
  const mapKey = material.map ? material.map.uuid : "no_map";
  const textureKey = material.map && material.map.image ? material.map.image.src : "no_texture";

  console.log("material.name ",material.name);
  console.log("material.uuid ",material.uuid);
  console.log(`${colorKey}_${mapKey}_${textureKey}`);
  
  // Combine properties into a unique string
  return `${colorKey}_${mapKey}_${textureKey}`;
}


function deduplicateMaterials(model) {
  // Map to store unique materials based on texture source
  const uniqueMaterials = new Map();

  // Map to store original -> deduplicated material references
  const materialMap = new Map();

  // First pass: collect unique materials
  model.traverse((node) => {
    if (node.isMesh && node.material) {
      const materials = Array.isArray(node.material)
        ? node.material
        : [node.material];

      materials.forEach((material) => {
        // Create a key based on material properties
        const textureKey = material.map
          ? material.map.source.data.src
          : "no-texture";
        const materialKey = `${textureKey}_${material.type}`;

        if (!uniqueMaterials.has(materialKey)) {
          // Store the first occurrence of this material
          uniqueMaterials.set(materialKey, material);
        }

        // Store the mapping for this material
        materialMap.set(material, uniqueMaterials.get(materialKey));
      });
    }
  });
  console.log("uniqueMaterials ",uniqueMaterials);
  console.log("materialMap ",materialMap);
  

  // Second pass: replace materials with deduplicated versions
  model.traverse((node) => {
    if (node.isMesh && node.material) {
      if (Array.isArray(node.material)) {        
        // Handle multi-material objects
        node.material = node.material.map((mat) => materialMap.get(mat) || mat);
      } else {
        // Handle single material objects
        node.material = materialMap.get(node.material);
      }
    }
  });

  // model.traverse((object) => {
  //   if (object.isMesh) {
  //     const material = object.material;
  //     console.log(material);
  //   }
  // });

  // console.log(
  //   `Reduced materials from ${materialMap.size} to ${uniqueMaterials.size}`
  // );
  return model;
}

function deduplicateMaterialsUniqueKey(model) {
  // Map to store unique materials based on ID
  const uniqueMaterials = new Map();
  // Map to store all materials by their properties for deduplication
  const materialsByProps = new Map();

  // First pass: collect all materials and their properties
  model.traverse((node) => {
    if (node.isMesh && node.material) {
      const materials = Array.isArray(node.material)
        ? node.material
        : [node.material];

      materials.forEach((material) => {
        // Check if we've already seen this material ID
        if (!uniqueMaterials.has(material.id)) {
          // Create a key based on material properties
          const textureKey = material.map ? material.map.uuid : "no-texture";
          const materialKey = `${textureKey}_${material.type}`;

          // If we've seen these properties before, use the existing material
          if (materialsByProps.has(materialKey)) {
            uniqueMaterials.set(material.id, materialsByProps.get(materialKey));
          } else {
            // This is a new unique material
            materialsByProps.set(materialKey, material);
            uniqueMaterials.set(material.id, material);
          }
        }
      });
    }
  });

  // Second pass: replace materials
  model.traverse((node) => {
    if (node.isMesh && node.material) {
      if (Array.isArray(node.material)) {
        node.material = node.material.map(
          (mat) => uniqueMaterials.get(mat.id) || mat
        );
      } else {
        node.material = uniqueMaterials.get(node.material.id) || node.material;
      }
    }
  });

  // Log the results
  // console.log("Original unique material IDs:", [...uniqueMaterials.keys()]);
  // console.log("Deduplicated to unique materials:", materialsByProps.size);

  // Return map of unique materials for verification
  return {
    model,
    uniqueMaterials: materialsByProps,
    materialMapping: uniqueMaterials,
  };
}




function reduceModelPolygons(model, reductionRatio = 0.5) {
  const modifier = new SimplifyModifier();

  model.traverse((node) => {
    if (node.isMesh) {
      const originalGeometry = node.geometry;

      // Calculate target number of vertices
      const currentVertices = originalGeometry.attributes.position.count;
      const targetVertices = Math.floor(currentVertices * reductionRatio);

      try {
        // Apply simplification
        const simplified = modifier.modify(originalGeometry, targetVertices);
        node.geometry = simplified;

        console.log(
          `Reduced vertices from ${currentVertices} to ${targetVertices}`
        );
      } catch (error) {
        console.error("Error simplifying geometry:", error);
      }
    }
  });
}


export async function exportModelForAr(model, name, isQr = false) {
  const clone = model.clone();
  console.log(clone);
  console.log("+================================================================");
  deduplicateMaterials(clone);
  removeSimilarMaterials(clone);
  // deduplicateMaterialsUniqueKey(clone);
  console.log("+================================================================");
  // {
  //   let meshCounter = 0; // Initialize counter

  //   clone.traverse((object) => {
  //     if (object.isMesh) {
  //       meshCounter++; // Increment counter for each mesh
  //       const material = object.material;
  //       console.log(material);
  //     }
  //   });

  //   console.log(`Total meshes processed: ${meshCounter}`);
  // }
  // removeSimilarMaterials(clone);
  // Scale the clone model proportionally
  const box = new THREE.Box3().setFromObject(clone);
  const size = new THREE.Vector3();
  box.getSize(size);
  clone.scale.set(0.001, 0.001, 0.001);
  clone.updateMatrixWorld();
  clone.position.set(0, 0, 0);

  // Detect device type and export accordingly
  const isIOS = /iPhone|iPad|iPod/.test(
    navigator.userAgent || navigator.vendor || window.opera
  );
  if (isQr) {
    await exportUSDZ(clone, name); // Export USDZ for iOS devices
    await exportGLB(clone, name); // Export only GLB for other devices
  } else {
    if (isIOS) {
      await exportUSDZ(clone, name); // Export USDZ for iOS devices
    } else {
      await exportGLB(clone, name); // Export only GLB for other devices
    }
  }
}

async function saveArrayBuffer(blob, filename) {
  console.log(blob.size);
  const formData = new FormData();
  formData.append("file", blob, filename);
  formData.append("action", "saveModelFile");

  return fetch("api.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("File saved:", data);
      return data; // Ensure data is returned so that exportUsdz can await it
    })
    .catch((error) => {
      console.error("Error saving file:", error);
      throw error; // Re-throw to handle error in exportUsdz
    });
}

function convertToStandardMaterial(object) {
  object.traverse((child) => {
    if (child.isMesh) {
      // Check if the material is not a MeshStandardMaterial
      if (!(child.material instanceof THREE.MeshStandardMaterial)) {
        // Preserve existing material properties
        const oldMaterial = child.material;
        const newMaterial = new THREE.MeshStandardMaterial({
          color: oldMaterial.color,
          map: oldMaterial.map,
          normalMap: oldMaterial.normalMap,
          roughness: oldMaterial.roughness || 0.5, // Default roughness
          metalness: oldMaterial.metalness || 0.5, // Default metalness
          emissive: oldMaterial.emissive,
          emissiveMap: oldMaterial.emissiveMap,
        });

        // Replace the material
        child.material = newMaterial;
        child.material.needsUpdate = true;

        // console.log(`Material converted for mesh: ${child.name}`);
      }
    }
  });
}
