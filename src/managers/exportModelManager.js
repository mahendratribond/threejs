import * as THREE from "three";
import { USDZExporter } from "three/addons/exporters/USDZExporter.js";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
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
  const usdzExporter = new USDZExporter();
  const result = await usdzExporter.parse(clone);
  const blob = new Blob([result], { type: "application/octet-stream" });
  await saveModel(blob, `${name}.usdz`);
}

export async function exportModelForAr(model, name, isQr = false) {
  const clone = model.clone();

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
