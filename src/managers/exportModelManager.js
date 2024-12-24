import {
    THREE,
    USDZExporter,
    GLTFExporter,
    sharedParams,
} from "../../config.js";
import { traverseAsync } from "../../utils6.js";

async function saveModel(blob, filename) {
    if (blob) {
        await saveArrayBuffer(blob, filename); // Save the file only if blob is not null
    }
}
async function exportGLB(clone, name) {
    const gltfExporter = new GLTFExporter();
    console.log(clone);
    clone.traverse((child) => {
        if (child.isMesh && child.material && child.name !== "Header_Glass_Shelf") {
            child.material.transparent = false; // Disable transparency
            child.material.opacity = 1.0; // Fully opaque
            child.material.depthWrite = true; // Write to the depth buffer
            child.material.depthTest = true; // Enable depth testing
            child.material.alphaTest = 0.5; // Enable depth testing
            child.material.side = THREE.DoubleSide; // Render only front faces
        }
    });
    clone.renderOrder = 999999;
    const options = {
        compressed: true, // Enable mesh compression
        bufferStreamed: true, // Stream the buffer data
        compressMaterials: true, // Compress materials

        // Texture compression options
        embedImages: false, // Embed images in the GLB file
        forcePowerOfTwoTextures: true, // Ensure textures have power-of-two dimensions
        textureCompressionFormat: THREE.RGBA_ASTC_4x4_Format, // Use ASTC texture compression
        textureCompressionQuality: 0.5,

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
    await optimizeTexturesForUSDZ(clone);
    optimizeGeometry(clone, {
        minVertices: 1000,
        positionPrecision: 100, // 3 decimal places
        normalPrecision: 100, // 2 decimal places
    });

    const usdzExporter = new USDZExporter();
    const result = await usdzExporter.parse(clone, {
        textureCompressionQuality: 0.5,
        maxTextureSize: 512,
        compressGeometry: true,
        compressMaterials: true,
        binary: true,
        flipY: false,
    });
    const blob = new Blob([result], { type: "application/octet-stream" });
    // const modellink = document.createElement("a");
    // modellink.href = URL.createObjectURL(blob);
    // modellink.download = name + ".usdz";
    // modellink.click();
    await saveModel(blob, `${name}.usdz`);
}

function removeSimilarMaterials(model) {
    const materialMap = new Map();

    model.traverse((object) => {
        if (object.isMesh) {
            const material = object.material;

            if (Array.isArray(material)) {
                // Handle multi-material meshes
                object.material = material.map((mat) =>
                    getOrCreateUniqueMaterial(mat, materialMap)
                );
            } else if (material) {
                // Handle single materials
                object.material = getOrCreateUniqueMaterial(
                    material,
                    materialMap
                );
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
    const colorKey = material.color
        ? material.color.getHexString()
        : "no_color";
    const mapKey = material.map ? material.map.uuid : "no_map";
    const textureKey =
        material.map && material.map.image
            ? material.map.image.src
            : "no_texture";

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

    // Second pass: replace materials with deduplicated versions
    model.traverse((node) => {
        if (node.isMesh && node.material) {
            if (Array.isArray(node.material)) {
                // Handle multi-material objects
                node.material = node.material.map(
                    (mat) => materialMap.get(mat) || mat
                );
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

export async function exportModelForAr(model, name, isQr = false) {
    const clone = model.clone();
    await traverseAsync(clone, (cloneChild) => {
      if (cloneChild.name.startsWith("Cone")) {
        //   console.log(cloneChild);
            cloneChild.parent.remove(cloneChild);
        }
    });
    // deduplicateMaterials(clone);
    // removeSimilarMaterials(clone);

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
        await Promise.all([
            exportUSDZ(clone.clone(), name),
            exportGLB(clone.clone(), name)
        ]);
    } else {
        if (isIOS) {
            await exportUSDZ(clone.clone(), name); // Export USDZ for iOS devices
        } else {
            await exportGLB(clone.clone(), name); // Export only GLB for other devices
        }
    }
}

async function saveArrayBuffer(blob, filename) {
    // console.log(blob.size);
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

//////////////

async function optimizeTexturesForUSDZ(model) {
    model.traverse((node) => {
        if (node.isMesh && node.material) {
            if (node.material.map) {
                // Force power-of-two textures
                const texture = node.material.map;
                texture.minFilter = THREE.LinearFilter;
                texture.maxFilter = THREE.LinearFilter;

                // Aggressively limit texture size
                const maxSize = 32; // Xcode often uses efficient sizes
                if (
                    texture.image &&
                    (texture.image.width > maxSize ||
                        texture.image.height > maxSize)
                ) {
                    const scale =
                        maxSize /
                        Math.max(texture.image.width, texture.image.height);
                    texture.image.width *= scale;
                    texture.image.height *= scale;
                }
            }

            // Remove unnecessary maps
            node.material.roughnessMap = null;
            node.material.metalnessMap = null;
            node.material.normalMap = null;
            node.material.aoMap = null;
        }
    });
}

// function optimizeTexturesForGLB(model) {
//   model.traverse((node) => {
//     if (node.isMesh && node.material) {
//       if (node.material.map) {
//         // Force power-of-two textures
//         const texture = node.material.map;
//         texture.minFilter = THREE.LinearFilter;
//         texture.magFilter = THREE.LinearFilter;

//         // Aggressively limit texture size
//         const maxSize = 256; // Adjust the maximum texture size as needed
//         if (
//           texture.image &&
//           (texture.image.width > maxSize || texture.image.height > maxSize)
//         ) {
//           const scale =
//             maxSize / Math.max(texture.image.width, texture.image.height);
//           texture.image.width *= scale;
//           texture.image.height *= scale;
//         }

//         // Remove unnecessary maps
//         node.material.roughnessMap = null;
//         node.material.metalnessMap = null;
//         node.material.normalMap = null;
//         node.material.aoMap = null;
//       }
//     }
//   });
// }

function optimizeGeometry(model, options = {}) {
    const {
        minVertices = 1000, // Only optimize geometries with more than this many vertices
        positionPrecision = 1000, // 3 decimal places
        normalPrecision = 100, // 2 decimal places
    } = options;

    model.traverse((node) => {
        if (node.isMesh) {
            const geometry = node.geometry;

            // Only optimize larger geometries
            if (geometry.attributes.position.count > minVertices) {
                const positions = geometry.attributes.position.array;
                for (let i = 0; i < positions.length; i++) {
                    positions[i] =
                        Math.round(positions[i] * positionPrecision) /
                        positionPrecision;
                }

                if (geometry.attributes.normal) {
                    const normals = geometry.attributes.normal.array;
                    for (let i = 0; i < normals.length; i++) {
                        normals[i] =
                            Math.round(normals[i] * normalPrecision) /
                            normalPrecision;
                    }
                }

                // Remove unused attributes
                if (geometry.attributes.uv2) geometry.deleteAttribute("uv2");
                if (geometry.attributes.tangent)
                    geometry.deleteAttribute("tangent");

                // Update attributes
                geometry.attributes.position.needsUpdate = true;
                if (geometry.attributes.normal) {
                    geometry.attributes.normal.needsUpdate = true;
                }
            }
        }
    });
}
