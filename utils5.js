import * as THREE from "three";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { USDZExporter } from "three/addons/exporters/USDZExporter.js";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import {
  CSS2DObject,
  CSS2DRenderer,
} from "three/addons/renderers/CSS2DRenderer.js";

import {
  heightMeasurementNames,
  baseFrameTextureNames,
  rodFrameTextureNames,
  allFrameBorderNames,
  allOtherModelNames,
  allGroupModelName,
  hangerPartNames,
  frameMainNames,
  frameTop1Names,
  baseFrameNames,
  allGroupNames,
  golfClubNames,
  allModelNames,
  rackPartNames,
  hangerNames,
  headerNames,
  rackNames,
  params,
  setting,
} from "./config.js";

const fontLoader = new FontLoader().setPath("./three/examples/fonts/");

export async function getHex(value) {
  return value.replace("0x", "#");
}

export async function getHeaderSize(value) {
  return value.replace("Header_", "");
}

export async function getModelSize(model_name) {
  return model_name.replace("Model_", "");
}

// Helper function to create a delay
export async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

export async function getRemoveIcon(removeIconName) {
  // Create the circle geometry for the remove icon
  const removeIconCircleGeometry = new THREE.CircleGeometry(1, 32); // radius 1, 32 segments for smoothness
  const removeIconCircleMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    side: THREE.DoubleSide,
  });
  const removeIconCircleMesh = new THREE.Mesh(
    removeIconCircleGeometry,
    removeIconCircleMaterial
  );

  // Create the cross lines for the remove icon
  const crossMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    linewidth: 2,
  });

  // Cross Line 1 (diagonal from top-left to bottom-right)
  const crossGeometry1 = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-0.7, 0.7, 0), // start point (top-left)
    new THREE.Vector3(0.7, -0.7, 0), // end point (bottom-right)
  ]);
  const crossLine1 = new THREE.Line(crossGeometry1, crossMaterial);

  // Cross Line 2 (diagonal from top-right to bottom-left)
  const crossGeometry2 = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0.7, 0.7, 0), // start point (top-right)
    new THREE.Vector3(-0.7, -0.7, 0), // end point (bottom-left)
  ]);
  const crossLine2 = new THREE.Line(crossGeometry2, crossMaterial);

  // Create a group to hold the circle and cross
  const removeIconGroup = new THREE.Group();
  removeIconGroup.add(removeIconCircleMesh); // Add the circle
  removeIconGroup.add(crossLine1); // Add first cross line
  removeIconGroup.add(crossLine2); // Add second cross line

  // Set the group properties
  removeIconGroup.scale.set(20, 20, 20); // You can adjust the scale as needed
  removeIconGroup.name = removeIconName;
  removeIconGroup.visible = true;

  return removeIconGroup;
}

export async function checkMeshType(type) {
  switch (type) {
    case "MeshBasicMaterial":
      console.log("This is a MeshBasicMaterial.");
      break;
    case "MeshStandardMaterial":
      console.log("This is a MeshStandardMaterial.");
      break;
    case "MeshPhongMaterial":
      console.log("This is a MeshPhongMaterial.");
      break;
    case "MeshLambertMaterial":
      console.log("This is a MeshLambertMaterial.");
      break;
    case "MeshPhysicalMaterial":
      console.log("This is a MeshPhysicalMaterial.");
      break;
    case "MeshNormalMaterial":
      console.log("This is a MeshNormalMaterial.");
      break;
    case "MeshToonMaterial":
      console.log("This is a MeshToonMaterial.");
      break;
    case "MeshMatcapMaterial":
      console.log("This is a MeshMatcapMaterial.");
      break;
    case "LineBasicMaterial":
      console.log("This is a LineBasicMaterial.");
      break;
    case "LineDashedMaterial":
      console.log("This is a LineDashedMaterial.");
      break;
    case "PointsMaterial":
      console.log("This is a PointsMaterial.");
      break;
    default:
      console.log("Unknown material type.");
      break;
  }
}

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

export async function setTextureParams(texture) {
  texture.encoding = THREE.sRGBEncoding;
  texture.minFilter = 1008;
  texture.magFilter = THREE.LinearFilter;
  texture.colorSpace = "srgb";
  texture.wrapT = THREE.RepeatWrapping;
  texture.wrapS = THREE.RepeatWrapping;
  texture.flipY = true;

  return texture;
}

export async function isHangerAdd(
  frame,
  hangermodel,
  hangerType,
  hangerArray,
  hangerPrefix
) {
  let conditionFlag = true;

  // Get the Top_Ex node width
  let topExNode = frame.getObjectByName("Top_Ex");

  if (!topExNode) {
    console.error("Top_Ex node not found!");
    return false;
  }

  const topExBoundingBox = new THREE.Box3().setFromObject(topExNode);
  const topExWidth = topExBoundingBox.max.x - topExBoundingBox.min.x;
  // Calculate the total width of hangers already added
  let totalHangerWidth = 0;
  totalHangerWidth -= params.frameTopExMargin * 2;
  for (let key in hangerArray) {
    if (key.startsWith(hangerPrefix)) {
      let hangerName = key.replace(hangerPrefix, "");
      let hangerArrayKey = hangerPrefix + hangerName;
      if (hangerName && hangerArray[hangerArrayKey] > 0) {
        let hanger = frame.getObjectByName(hangerName);
        if (hanger) {
          const hangerBoundingBox = new THREE.Box3().setFromObject(hanger);
          totalHangerWidth +=
            (hangerBoundingBox.max.x - hangerBoundingBox.min.x) *
            hangerArray[hangerArrayKey];
        }
      }
    }
  }

  // Calculate the current hanger width
  let hanger = hangermodel.getObjectByName(hangerType);
  if (!hanger) {
    console.error("Hanger not found!");
    return false;
  }

  const hangerBoundingBox = new THREE.Box3().setFromObject(hanger);
  const hangerWidth = hangerBoundingBox.max.x - hangerBoundingBox.min.x;

  // Check if total width exceeds available width
  if (totalHangerWidth + hangerWidth > topExWidth) {
    conditionFlag = false;
  }

  return conditionFlag;
}

export async function getRodCount(modelSize) {
  let additionalRods = 0;
  if (modelSize >= 3000) {
    additionalRods = 2; // 4 rods total
  } else if (modelSize >= 1200) {
    additionalRods = 1; // 3 rods total
  }
  return additionalRods;
}

export async function getSupportBaseCount(modelSize) {
  let additionalMiddleBase = 0;
  if (modelSize >= 3000) {
    additionalMiddleBase = 2; // 4 rods total
  } else if (modelSize >= 1500) {
    additionalMiddleBase = 1; // 3 rods total
  }
  return additionalMiddleBase;
}

export async function loadModel(modelLoader, model_name) {
  let model_load = await modelLoader.loadAsync(model_name);
  let model = model_load.scene;
  model.scale.set(1, 1, 1);
  model.position.set(0, -params.cameraPosition, 0);
  model.castShadow = true;
  // model.visible = false;
  // scene.add(model);
  return model;
}

export async function setPositionCenter(model) {
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3()); // Get the center of the bounding box
  // model.position.y = -center.y
  // Move the model to the center of the area
  // model.position.set(-center.x, -center.y, -center.z); // Center it in the scene
  model.position.sub(center);
  return model;
}

// Create a function to load GLTF models using a Promise
export async function loadGLTFModel(loader, url) {
  return new Promise((resolve, reject) => {
    loader.load(
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

export async function setupMainModel(main_model) {
  main_model.traverse(async function (modelNode) {
    if (modelNode.name && modelNode.name.startsWith("Base_Option")) {
      // if (modelNode.material && baseFrameTextureNames.includes(modelNode.name)) {
      const material = await commonMaterial(
        parseInt(params.baseFrameColor, 16)
      );
      modelNode.material = material;
      modelNode.material.needsUpdate = true;
    }

    if (allModelNames.includes(modelNode.name)) {
      if (modelNode.name === params.defaultModel) {
        modelNode.visible = true;
      } else {
        modelNode.visible = false;
      }

      let header_300 = modelNode.getObjectByName("Header");
      if (header_300) {
        header_300.name = header_300.name + "_" + 300;
      }

      let shelfModel = modelNode.getObjectByName("Header_Wooden_Shelf");
      if (shelfModel) {
        modelNode.isShelf = true;
      } else {
        modelNode.isShelf = false;
      }

      let glassShelfModel = modelNode.getObjectByName("Header_Glass_Shelf");
      if (glassShelfModel) {
        modelNode.isGlassShelf = true;
      } else {
        modelNode.isGlassShelf = false;
      }

      let SlottedSideModel = modelNode.getObjectByName("Left_Ex_Slotted");
      if (SlottedSideModel) {
        modelNode.isSlottedSides = true;
      } else {
        modelNode.isSlottedSides = false;
      }
    }

    // if (frameTop1Names.includes(modelNode.name) || frameMainNames.includes(modelNode.name)) {
    //     if (modelNode.material) {
    //         console.log('modelNode.material', modelNode.material);

    //         const material = await commonMaterial(parseInt('0xffffff', 16))
    //         modelNode.material = material
    //         modelNode.material.needsUpdate = true;
    //     }
    // }
  });

  // console.log(main_model)
}

export async function cleanModelName(modelName) {
  // Remove the "Other_" prefix if it exists
  let cleanedName = modelName.replace(/^Other_/, "");

  // Remove the trailing "_1", "_2", "_3" or any underscore followed by digits
  cleanedName = cleanedName.replace(/_\d+$/, "");

  return cleanedName;
}

export async function getModelNode(model, prefix) {
  let pattern = new RegExp(`^${prefix}\\d{1,2}$`); // Matches names like Header_500_1, Header_600_2, etc.

  if (model && model.children) {
    for (let child of model.children) {
      if (pattern.test(child.name) || child.name == prefix) {
        return child; // Return the first matching child node
      }
    }
  }
  return null; // Return null if no match is found
}

export async function updateModelName(model, oldName, newName) {
  let pattern = new RegExp(`^${oldName}\\d{1,2}$`); // Matches names like oldName_500, oldName_600, etc.

  model.traverse((child) => {
    if (pattern.test(child.name) || child.name == oldName) {
      // If the child name matches the pattern
      // console.log('Updating:', child.name, 'to', newName);
      child.name = newName; // Update the name directly
    }
  });

  return model;
}

export async function updateMainModelName(model) {
  if (model) {
    model.traverse(async function (modelNode) {
      // if (modelNode.name == 'Model_661') {
      //     modelNode.name = 'Model_661';
      // }
      // if (modelNode.name == 'Model_1061') {
      //     modelNode.name = 'Model_1061';
      // }
    });
  }
  return model;
}

export async function cloneWithCustomProperties(source, target) {
  for (let model of allModelNames) {
    let sourceModel = source.getObjectByName(model);
    let targetModel = target.getObjectByName(model);
    for (let key in sourceModel) {
      if (sourceModel.hasOwnProperty(key) && !targetModel.hasOwnProperty(key)) {
        targetModel[key] = sourceModel[key];
      }
    }
  }
}

export async function setupArrowModel(main_model, arrow_model) {
  // console.log('arrow_model', arrow_model)
  if (arrow_model) {
    await arrow_model.traverse(async function (child) {
      if (child.material) {
        const material = await commonMaterial(parseInt("0x888888", 16));
        child.material = material;
        child.material.needsUpdate = true;
      }
    });
    // arrow_model.scale.set(0.1, 0.1, 0.1)
    arrow_model = await setPositionCenter(arrow_model);

    await main_model.traverse(async function (modelNode) {
      if (allModelNames.includes(modelNode.name)) {
        const modelBox = new THREE.Box3().setFromObject(modelNode);
        const cone_model = arrow_model.getObjectByName("Cone");
        let cone = cone_model.clone();

        cone = await setPositionCenter(cone);
        cone.scale.set(0.1, 0.1, 0.1);
        const coneBox = new THREE.Box3().setFromObject(cone);
        const coneHeight = coneBox.max.y - coneBox.min.y;
        // console.log('arrowHeight', coneHeight)
        // rod.name = rodName;
        // cone.scale.set(0.5, 0.5, 0.5)
        cone.position.set(
          modelNode.position.x, // Adjust based on offset
          modelBox.max.y + coneHeight / 2 + 210,
          // modelBox.min.y - coneHeight / 2 - 10,
          0
        );
        cone.rotation.x = Math.PI;
        cone.visible = false;
        modelNode.attach(cone);
      }
    });
  }
}

export async function createRod(
  modelNode,
  modelSize,
  header_rod_model,
  header_glass_shelf_fixing_model
) {
  // const rodSize = await getNodeSize(header_rod_model);

  const additionalRods = await getRodCount(modelSize);

  // console.log(modelSize)
  const header = modelNode.getObjectByName("Header_300");

  // Ensure both header and frame nodes exist
  if (header) {
    const headerBox = new THREE.Box3().setFromObject(header);
    const headerSize = await getNodeSize(header); // Size of the current header

    let rodY = headerBox.min.y + params.rodSize.y / 2; //(frameSize.y / 2 + rodSize.y / 2);
    let lassShelfFixingY = params.glassShelfFixingSize.y / 2; //(frameSize.y / 2 + glassShelfFixingSize.y / 2);

    // Function to create and position a rod
    const createAndPositionRod = async (xOffset, rodName, shelfFixingName) => {
      let rod = header_rod_model.clone();
      rod.name = rodName;
      modelNode.add(rod);
      rod = await setPositionCenter(rod);
      rod.position.set(
        header.position.x + xOffset, // Adjust based on offset
        rod.position.y + rodY,
        rod.position.z
      );
      rod.visible = false;

      const rodBox = new THREE.Box3().setFromObject(rod);

      let shelf_fixing = header_glass_shelf_fixing_model.clone();
      shelf_fixing.name = shelfFixingName;
      modelNode.add(shelf_fixing);
      // console.log('shelf_fixing.position', shelf_fixing.position)
      shelf_fixing = await setPositionCenter(shelf_fixing);
      // console.log('shelf_fixing.position update', shelf_fixing.position)
      // shelf_fixing.position.y += headerBox.min.y + rodSize.y + lassShelfFixingY
      shelf_fixing.position.set(
        rod.position.x, // Adjust based on offset
        shelf_fixing.position.y +
          headerBox.min.y +
          params.rodSize.y +
          lassShelfFixingY,
        shelf_fixing.position.z
      );
      shelf_fixing.visible = false;
    };

    let margin = 50;

    // Place the left and right rods first
    await createAndPositionRod(
      -headerSize.x / 2 + params.rodSize.x + margin,
      "Rod",
      "Glass_Shelf_Fixing"
    ); // Left Rod
    await createAndPositionRod(
      headerSize.x / 2 - params.rodSize.x - margin,
      "Rod",
      "Glass_Shelf_Fixing"
    ); // Right Rod

    // Determine and place additional rods based on modelSize
    if (additionalRods > 0) {
      const spacing = headerSize.x / (additionalRods + 1); // Calculate spacing between rods

      // Place additional rods
      for (let i = 1; i <= additionalRods; i++) {
        let xOffset = -headerSize.x / 2 + i * spacing;
        await createAndPositionRod(xOffset, "Rod", "Glass_Shelf_Fixing");
      }
    }
  }

  return modelNode;
}
export async function createSupportBase(
  modelNode,
  modelSize,
  support_base_middle,
  support_base_side
) {
  const additionalSupportBase = await getSupportBaseCount(modelSize);
  const base = modelNode.getObjectByName("Base_Solid");
  // Ensure both header and frame nodes exist
  if (base) {
    const baseBox = new THREE.Box3().setFromObject(modelNode);
    const baseSize = await getNodeSize(modelNode); // Size of the current base
    let positionY;

    const bbox = new THREE.Box3();
    bbox.expandByObject(support_base_side);
    const modelWidth = bbox.min.y;
    // let baseY = baseBox.min.y + params.rodSize.y / 4; //(frameSize.y / 2 + rodSize.y / 2);
    let baseY = baseBox.min.y - modelWidth; //(frameSize.y / 2 + rodSize.y / 2);
    // Function to create and position a rod
    const createAndPositionBaseSide = async (xOffset, supportBaseName) => {
      let supportSide = support_base_side.clone();
      supportSide.name = supportBaseName;
      modelNode.add(supportSide);
      supportSide = await setPositionCenter(supportSide);
      supportSide.position.set(
        supportSide.position.x + xOffset, // Adjust based on offset
        supportSide.position.y + baseY,
        supportSide.position.z
      );
      positionY = supportSide.position.y;
      supportSide.visible = false;

      const rodBox = new THREE.Box3().setFromObject(supportSide);
    };
    const createAndPositionBaseMiddle = async (
      xOffset,
      supportBaseName,
      positionY
    ) => {
      let supportSide = support_base_middle.clone();
      supportSide.name = supportBaseName;
      modelNode.add(supportSide);
      supportSide = await setPositionCenter(supportSide);
      supportSide.position.set(
        supportSide.position.x + xOffset, // Adjust based on offset
        (supportSide.position.y = positionY),
        supportSide.position.z
      );
      supportSide.visible = false;

      const rodBox = new THREE.Box3().setFromObject(supportSide);
    };

    let margin = 30;

    // Place the left and right rods first
    await createAndPositionBaseSide(
      -baseSize.x / 2 + margin,
      "Base_Support_Sides"
    ); // Left Rod
    await createAndPositionBaseSide(
      baseSize.x / 2 - margin,
      "Base_Support_Sides"
    ); // Right Rod

    // Determine and place additional rods based on modelSize
    if (additionalSupportBase > 0) {
      const spacing = baseSize.x / (additionalSupportBase + 1); // Calculate spacing between rods

      // Place additional rods
      for (let i = 1; i <= additionalSupportBase; i++) {
        let xOffset = -baseSize.x / 2 + i * spacing;
        await createAndPositionBaseMiddle(
          xOffset,
          "Base_Support_Sides",
          positionY
        );
      }
    }
  }

  return modelNode;
}

export async function setupGlassShelfFixingModel(
  main_model,
  header_rod_model,
  header_glass_shelf_fixing_model
) {
  let modelSize;
  if (header_glass_shelf_fixing_model) {
    header_glass_shelf_fixing_model = await updateModelName(
      header_glass_shelf_fixing_model,
      "__Glass_Shelf_Fixing",
      "Glass_Shelf_Fixing"
    );
  }
  if (header_rod_model) {
    await header_rod_model.traverse(async function (child) {
      if (child.material && rodFrameTextureNames.includes(child.name)) {
        const material = await commonMaterial(
          parseInt(params.rodFrameColor, 16)
        );
        child.material = material;
        child.material.needsUpdate = true;
      }
    });
  }

  await main_model.traverse(async function (modelNode) {
    if (allModelNames.includes(modelNode.name)) {
      modelSize = await getModelSize(modelNode.name);

      if (header_rod_model && header_glass_shelf_fixing_model) {
        await createRod(
          modelNode,
          modelSize,
          header_rod_model,
          header_glass_shelf_fixing_model
        );
      }
    }
  });
}
export async function setupSupportBaseModel(
  main_model,
  support_base_middle,
  support_base_side
) {
  let modelSize;
  if (support_base_middle) {
    support_base_middle = await updateModelName(
      support_base_middle,
      "base_3_middle",
      "Base_Support_Sides"
    );
  }
  if (support_base_side) {
    support_base_side = await updateModelName(
      support_base_side,
      "base_3_sides",
      "Base_Support_Sides"
    );
  }

  await main_model.traverse(async function (modelNode) {
    if (allModelNames.includes(modelNode.name)) {
      modelSize = await getModelSize(modelNode.name);

      if (support_base_middle && support_base_side) {
        await createSupportBase(
          modelNode,
          modelSize,
          support_base_middle,
          support_base_side
        );
      }
    }
  });
}

export async function setupHeader500HeightModel(
  main_model,
  header_500_height_model
) {
  let header;
  if (header_500_height_model) {
    // console.log('header_500_height_model', header_500_height_model)
    header_500_height_model = await updateMainModelName(
      header_500_height_model
    );

    main_model.traverse(async function (modelNode) {
      if (allModelNames.includes(modelNode.name)) {
        let frame = modelNode.getObjectByName("Frame");
        const frameBox = new THREE.Box3().setFromObject(frame);

        let header_300 = modelNode.getObjectByName("Header_300");
        let header_500_model = header_500_height_model.getObjectByName(
          modelNode.name
        );
        const header500ModelSize = await getNodeSize(header_500_model);
        const header300ModelSize = await getNodeSize(header_300);

        if (header_300 && header_500_model) {
          header = await getModelNode(header_500_model, "Header");
          if (!header) {
            header = await getModelNode(header_500_model, "Header_");
          }
          if (header) {
            header = await updateModelName(
              header,
              "Header_Frame_",
              "Header_Frame"
            );

            header = await updateModelName(
              header,
              "Header_Graphic1",
              "Header_Graphic1"
            );
            header = await updateModelName(
              header,
              "Header_Graphic1_",
              "Header_Graphic1"
            );
            header = await updateModelName(
              header,
              "Header_Graphic1-Mat",
              "Header_Graphic1-Mat"
            );
            header = await updateModelName(
              header,
              "Header_Graphic1-Mat_",
              "Header_Graphic1-Mat"
            );
            header = await updateModelName(
              header,
              "Header_Graphic1-Fabric_Colour",
              "Header_Graphic1-Fabric_Colour"
            );
            header = await updateModelName(
              header,
              "Header_Graphic1-Fabric_Colour_",
              "Header_Graphic1-Fabric_Colour"
            );

            header = await updateModelName(
              header,
              "Header_Graphic2",
              "Header_Graphic2"
            );
            header = await updateModelName(
              header,
              "Header_Graphic2_",
              "Header_Graphic2"
            );
            header = await updateModelName(
              header,
              "Header_Graphic2-Mat",
              "Header_Graphic2-Mat"
            );
            header = await updateModelName(
              header,
              "Header_Graphic2-Mat_",
              "Header_Graphic2-Mat"
            );
            header = await updateModelName(
              header,
              "Header_Graphic2-Fabric_Colour",
              "Header_Graphic2-Fabric_Colour"
            );
            header = await updateModelName(
              header,
              "Header_Graphic2-Fabric_Colour_",
              "Header_Graphic2-Fabric_Colour"
            );

            header.name = "Header_500";
            header.visible = false;
            header.position.y = frameBox.max.y + header500ModelSize.y / 2;
            modelNode.attach(header);
          }
        }
      }
    });
  }
}

export async function setupHeaderWoodenShelfModel(
  main_model,
  header_wooden_shelf_model
) {
  header_wooden_shelf_model = await updateMainModelName(
    header_wooden_shelf_model
  );

  main_model.traverse(async function (modelNode) {
    if (allModelNames.includes(modelNode.name)) {
      if (header_wooden_shelf_model) {
        let model = header_wooden_shelf_model.getObjectByName(modelNode.name);
        if (model) {
          const modelSize = await getNodeSize(model);
          const frame = modelNode.getObjectByName("Frame");
          const frameBox = new THREE.Box3().setFromObject(frame);

          if (frame) {
            let positionY = frameBox.max.y;
            if (params.rodSize) {
              positionY += params.rodSize.y;
            }
            positionY += modelSize.y / 2;
            model.name = "Header_Wooden_Shelf";
            model.visible = false;
            model.position.y = positionY;
            modelNode.attach(model);
          }
        }
      }
    }
  });
}

export async function setupHeaderGlassShelfModel(
  main_model,
  header_glass_shelf_model,
  texture_background
) {
  if (header_glass_shelf_model) {
    header_glass_shelf_model = await updateMainModelName(
      header_glass_shelf_model
    );

    header_glass_shelf_model.traverse(async function (child) {
      if (child.material) {
        child.material = await generateGlassMaterial(texture_background);
        // child.material = await commonMaterial(0xffffff)
        child.material.needsUpdate = true;
      }
    });
  }

  main_model.traverse(async function (modelNode) {
    if (allModelNames.includes(modelNode.name)) {
      if (header_glass_shelf_model) {
        let model = header_glass_shelf_model.getObjectByName(modelNode.name);
        if (model) {
          const modelSize = await getNodeSize(model);
          // model = header_wooden_shelf_model.getObjectByName(modelNode.name);
          const frame = modelNode.getObjectByName("Frame");
          const frameBox = new THREE.Box3().setFromObject(frame);

          if (frame) {
            // console.log('frame', frame)
            let positionY = frameBox.max.y;
            if (params.rodSize) {
              positionY += params.rodSize.y;
            }
            if (params.glassShelfFixingSize) {
              positionY += params.glassShelfFixingSize.y;
            }
            positionY -= modelSize.y / 2 + 0.5;
            model.name = "Header_Glass_Shelf";
            model.visible = false;
            model.position.y = positionY;
            modelNode.attach(model);
          }
        }
      }
    }
  });
}

export async function setupSlottedSidesModel(main_model, slotted_sides_model) {
  let slotted_left_side, slotted_right_side, frame;
  // console.log('slotted_sides_model', slotted_sides_model)
  if (slotted_sides_model) {
    slotted_sides_model = await updateMainModelName(slotted_sides_model);
    slotted_sides_model = await updateModelName(
      slotted_sides_model,
      "Left_Ex_Slotted_",
      "Left_Ex_Slotted"
    );
    slotted_sides_model = await updateModelName(
      slotted_sides_model,
      "Left_Ex_Slotted",
      "Left_Ex_Slotted"
    );
    slotted_sides_model = await updateModelName(
      slotted_sides_model,
      "Left_Ex_Slotted-Inside_Profile_",
      "Left_Ex_Slotted-Inside_Profile"
    );
    slotted_sides_model = await updateModelName(
      slotted_sides_model,
      "Left_Ex_Slotted-Frame_",
      "Left_Ex_Slotted-Frame"
    );

    slotted_sides_model = await updateModelName(
      slotted_sides_model,
      "Right_Ex_Slotted_",
      "Right_Ex_Slotted"
    );
    slotted_sides_model = await updateModelName(
      slotted_sides_model,
      "Right_Ex_Slotted",
      "Right_Ex_Slotted"
    );
    slotted_sides_model = await updateModelName(
      slotted_sides_model,
      "Right_Ex_Slotted-Inside_Profile_",
      "Left_Ex_Slotted-Inside_Profile"
    );
    slotted_sides_model = await updateModelName(
      slotted_sides_model,
      "Right_Ex_Slotted-Frame_",
      "Left_Ex_Slotted-Frame"
    );
  }

  main_model.traverse(async function (modelNode) {
    if (allModelNames.includes(modelNode.name)) {
      frame = modelNode.getObjectByName("Frame");

      if (slotted_sides_model) {
        let slotted_sides_ = slotted_sides_model.clone();
        let slotted_sides = slotted_sides_.getObjectByName(modelNode.name);
        if (slotted_sides) {
          slotted_left_side = slotted_sides.getObjectByName("Left_Ex_Slotted");
          if (slotted_left_side) {
            let leftSide = frame.getObjectByName("Left_Ex");
            let leftSideWorldPosition = new THREE.Vector3();
            leftSide.getWorldPosition(leftSideWorldPosition);
            slotted_left_side.visible = false;
            frame.attach(slotted_left_side);
            slotted_left_side.position.y = leftSide.position.y;
          }

          slotted_right_side =
            slotted_sides.getObjectByName("Right_Ex_Slotted");
          if (slotted_right_side) {
            let rightSide = frame.getObjectByName("Right_Ex");
            let rightSideWorldPosition = new THREE.Vector3();
            rightSide.getWorldPosition(rightSideWorldPosition);
            slotted_right_side.visible = false;
            frame.attach(slotted_right_side);
            slotted_right_side.position.y = rightSide.position.y;
          }
        }
      }

      // console.log('frame', frame)
    }
  });
}

export async function setupWoodenRackModel(rack_wooden_model) {
  if (rack_wooden_model) {
    rack_wooden_model = await updateMainModelName(rack_wooden_model);
    rack_wooden_model = await updateModelName(
      rack_wooden_model,
      "Rack_Wooden_Shelf_",
      "Rack_Wooden_Shelf"
    );
    rack_wooden_model = await updateModelName(
      rack_wooden_model,
      "Rack_Stand_LH_",
      "Rack_Stand_LH"
    );
    rack_wooden_model = await updateModelName(
      rack_wooden_model,
      "Rack_Stand_LH",
      "Rack_Stand_LH"
    );
    rack_wooden_model = await updateModelName(
      rack_wooden_model,
      "Rack_Stand_RH_",
      "Rack_Stand_RH"
    );
    rack_wooden_model = await updateModelName(
      rack_wooden_model,
      "Rack_Stand_RH",
      "Rack_Stand_RH"
    );
    rack_wooden_model.traverse(async function (child) {
      if (child.material && rackPartNames.includes(child.name)) {
        const material = await commonMaterial(
          parseInt(params.defaultRackColor, 16)
        );
        child.material = material;
        child.material.needsUpdate = true;
      }
    });
  }
}

export async function setupGlassRackModel(
  rack_glass_model,
  texture_background
) {
  if (rack_glass_model) {
    rack_glass_model = await updateMainModelName(rack_glass_model);
    rack_glass_model = await updateModelName(
      rack_glass_model,
      "Rack_Glass_Shelf_",
      "Rack_Glass_Shelf"
    );
    rack_glass_model = await updateModelName(
      rack_glass_model,
      "Rack_Stand_LH_",
      "Rack_Stand_LH"
    );
    rack_glass_model = await updateModelName(
      rack_glass_model,
      "Rack_Stand_RH_",
      "Rack_Stand_RH"
    );

    const glassMaterial = await generateGlassMaterial(texture_background);
    const defaultMaterial = await commonMaterial(
      parseInt(params.defaultRackColor, 16)
    );

    rack_glass_model.traverse(async function (child) {
      if (rackPartNames.includes(child.name)) {
        let material =
          child.name === "Rack_Glass_Shelf" ? glassMaterial : defaultMaterial;

        // Assign material to the child
        child.material = material;
        child.material.needsUpdate = true;

        // If the child has nested meshes, apply the same material
        child.traverse(function (mesh) {
          mesh.material = material;
          mesh.material.needsUpdate = true;
        });
      }
    });
  }
}

export async function setupHangerModel(hanger_model) {
  if (hanger_model) {
    hanger_model = await updateModelName(
      hanger_model,
      "__Hanger_Rail_Step",
      "Hanger_Rail_Step"
    );
    hanger_model = await updateModelName(
      hanger_model,
      "__Hanger_Rail_Single",
      "Hanger_Rail_Single"
    );

    hanger_model = await updateModelName(
      hanger_model,
      "Hanger_Stand_",
      "Hanger_Stand"
    );
    hanger_model = await updateModelName(
      hanger_model,
      "Hanger_Stand-Fixture_Material_",
      "Hanger_Stand-Arm_Metal"
    );

    hanger_model = await updateModelName(hanger_model, "Clothing_", "Clothing");
    hanger_model = await updateModelName(
      hanger_model,
      "Clothing-Mat2",
      "Clothing-Mat"
    );
    hanger_model = await updateModelName(
      hanger_model,
      "Clothing-Mat1_",
      "Clothing-Mat"
    );
    hanger_model = await updateModelName(
      hanger_model,
      "Clothing-Mat2_",
      "Clothing-Mat"
    );
    hanger_model = await updateModelName(
      hanger_model,
      "Clothing-Shirt_Colour_",
      "Clothing-Shirt_Colour"
    );
    hanger_model.traverse(async function (child) {
      if (child.material && ["Clothing-Shirt_Colour"].includes(child.name)) {
        // const material = await clothsMaterial(parseInt(params.defaultClothingColor, 16))
        // child.material = material
        // child.material.needsUpdate = true;
        child.material.color.set(await getHex(params.defaultClothingColor));
        child.material.needsUpdate = true;
      }
      if (child.material && ["Hanger_Stand"].includes(child.name)) {
        const material = await commonMaterial(
          parseInt(params.defaultHangerStandColor, 16)
        );
        child.material = material;
        child.material.needsUpdate = true;
      }
    });

    // console.log('hanger_model_update', hanger_model)
  }
}

export async function setupHangerGolfClubModel(hanger_golf_club_model) {
  if (hanger_golf_club_model) {
    // console.log('hanger_golf_club_model', hanger_golf_club_model)
    hanger_golf_club_model = await updateModelName(
      hanger_golf_club_model,
      "Hanger_Stand_",
      "Hanger_Stand"
    );
    hanger_golf_club_model = await updateModelName(
      hanger_golf_club_model,
      "Hanger_Stand-Arm_Rubber_",
      "Hanger_Stand-Arm_Rubber"
    );
    hanger_golf_club_model = await updateModelName(
      hanger_golf_club_model,
      "Hanger_Stand-Fixture Material",
      "Hanger_Stand-Fixture_Material"
    );
    hanger_golf_club_model = await updateModelName(
      hanger_golf_club_model,
      "Hanger_Stand-Arm_Metal_",
      "Hanger_Stand-Arm_Metal"
    );

    hanger_golf_club_model = await updateModelName(
      hanger_golf_club_model,
      "Hanger_Clubs_",
      "Hanger_Clubs"
    );
    hanger_golf_club_model = await updateModelName(
      hanger_golf_club_model,
      "Hanger_Clubs-Club_Grip_Rubber_",
      "Hanger_Clubs-Club_Grip_Rubber"
    );
    hanger_golf_club_model = await updateModelName(
      hanger_golf_club_model,
      "Hanger_Clubs-Driver_Shaft_Metalic_",
      "Hanger_Clubs-Driver_Shaft_Metalic"
    );

    hanger_golf_club_model = await updateModelName(
      hanger_golf_club_model,
      "Hanger_Faceplate_",
      "Hanger_Faceplate"
    );
    hanger_golf_club_model = await updateModelName(
      hanger_golf_club_model,
      "Hanger_Faceplate-Arm_Metal_",
      "Hanger_Faceplate-Arm_Metal"
    );
    hanger_golf_club_model = await updateModelName(
      hanger_golf_club_model,
      "Hanger_Faceplate-Logo_",
      "Hanger_Faceplate-Logo"
    );

    // console.log('hanger_golf_club_model', hanger_golf_club_model)

    hanger_golf_club_model.traverse(async function (child) {
      // if (child.name == "Iron_Arm_1") {
      //     child.name = 'Hanger_Stand';
      // }
      // if (child.name == "Driver_Arm") {
      //     child.name = 'Hanger_Stand';
      // }
      if (child.material && ["Hanger_Stand"].includes(child.name)) {
        // const material = await commonMaterial(parseInt(params.defaultHangerStandColor, 16))
        // child.material = material
        // child.material.needsUpdate = true;
      } else if (child.material && ["Hanger_Clubs"].includes(child.name)) {
        // const material = await commonMaterial(parseInt('0x444444', 16))
        // child.material = material
        // child.material.needsUpdate = true;
      } else if (child.material && ["Hanger_Faceplate"].includes(child.name)) {
        // const material = await commonMaterial(parseInt('0x444444', 16))
        // child.material = material
        // child.material.needsUpdate = true;
      } else {
        // const material = await commonMaterial(parseInt(params.defaultHangerStandColor, 16))
        // child.material = material
        // child.material.needsUpdate = true;
      }
    });
  }
}

export async function setupModel(
  main_model,
  header_500_height_model,
  header_wooden_shelf_model,
  header_rod_model,
  header_glass_shelf_fixing_model,
  header_glass_shelf_model,
  slotted_sides_model,
  hanger_model,
  rack_wooden_model,
  rack_glass_model
) {
  let modelSize, model, header, slotted_left_side, slotted_right_side, frame;

  if (header_glass_shelf_model) {
    header_glass_shelf_model.traverse(async function (child) {
      if (child.material) {
        child.material = await generateGlassMaterial(texture_background);
        // child.material = await commonMaterial(0xffffff)
        child.material.needsUpdate = true;
      }
    });
  }

  if (header_rod_model) {
    header_rod_model.traverse(async function (child) {
      if (child.material && rodFrameTextureNames.includes(child.name)) {
        const material = await commonMaterial(
          parseInt(params.rodFrameColor, 16)
        );
        child.material = material;
        child.material.needsUpdate = true;
      }
    });
  }

  if (hanger_model) {
    hanger_model.traverse(async function (child) {
      if (child.material && ["Clothing"].includes(child.name)) {
        const material = await clothsMaterial(
          parseInt(params.defaultClothingColor, 16)
        );
        child.material = material;
        child.material.needsUpdate = true;
      }
      if (child.material && ["Hanger_Stand"].includes(child.name)) {
        const material = await commonMaterial(
          parseInt(params.defaultHangerStandColor, 16)
        );
        child.material = material;
        child.material.needsUpdate = true;
      }
    });
  }

  if (rack_wooden_model) {
    rack_wooden_model.traverse(async function (child) {
      if (child.material && rackNames.includes(child.name)) {
        const material = await commonMaterial(
          parseInt(params.defaultRackColor, 16)
        );
        child.material = material;
        child.material.needsUpdate = true;
      }
    });
  }

  if (rack_glass_model) {
    // Create materials once
    const glassMaterial = await generateGlassMaterial(texture_background);
    const defaultMaterial = await commonMaterial(
      parseInt(params.defaultRackColor, 16)
    );

    rack_glass_model.traverse(async function (child) {
      if (rackNames.includes(child.name)) {
        let material =
          child.name === "Rack_Glass_Shelf" ? glassMaterial : defaultMaterial;

        // Assign material to the child
        child.material = material;
        child.material.needsUpdate = true;

        // If the child has nested meshes, apply the same material
        child.traverse(function (mesh) {
          mesh.material = material;
          mesh.material.needsUpdate = true;
        });
      }
    });
  }

  main_model.traverse(async function (modelNode) {
    if (modelNode.material && baseFrameTextureNames.includes(modelNode.name)) {
      const material = await commonMaterial(
        parseInt(params.baseFrameColor, 16)
      );
      modelNode.material = material;
      modelNode.material.needsUpdate = true;
    }
    if (allModelNames.includes(modelNode.name)) {
      modelSize = await getModelSize(modelNode.name);
      frame = await modelNode.getObjectByName("Frame");

      if (header_500_height_model) {
        model = await header_500_height_model.getObjectByName(modelNode.name);
        header = await model.getObjectByName("Header");
        if (header) {
          header.name = header.name + "_" + 500;
          header.visible = false;
          modelNode.attach(header);
        }
      }

      if (slotted_sides_model) {
        model = await slotted_sides_model.getObjectByName(modelNode.name);
        if (model) {
          slotted_left_side = await model.getObjectByName("Left_Ex_Slotted");
          if (slotted_left_side) {
            slotted_left_side.visible = false;
            frame.attach(slotted_left_side);
          }

          slotted_right_side = await model.getObjectByName("Right_Ex_Slotted");
          if (slotted_right_side) {
            slotted_right_side.visible = false;
            frame.attach(slotted_right_side);
          }
        }
      }

      if (header_wooden_shelf_model) {
        model = await header_wooden_shelf_model.getObjectByName(modelNode.name);
        if (model) {
          model.name = "Header_Wooden_Shelf";
          model.visible = false;
          modelNode.attach(model);
        }
      }

      if (header_rod_model && header_glass_shelf_fixing_model) {
        await createRod(
          modelNode,
          modelSize,
          header_rod_model,
          header_glass_shelf_fixing_model
        );
      }

      if (header_glass_shelf_model) {
        model = await header_glass_shelf_model.getObjectByName(modelNode.name);
        if (model) {
          model.name = "Header_Glass_Shelf";
          model.visible = false;
          model.position.y = params.glassShelfFixingSize.y / 2;
          modelNode.attach(model);
        }
      }

      if (modelNode.name === params.defaultModel) {
        modelNode.visible = true;
      } else {
        modelNode.visible = false;
      }

      let header_300 = await modelNode.getObjectByName("Header");
      if (header_300) {
        header_300.name = header_300.name + "_" + 300;
      }
    }
  });

  console.log(main_model);
}

export async function updateFrameSize(main_model, scene, camera) {
  if (main_model) {
    let model = main_model.getObjectByName(params.selectedGroupName);
    model.traverse(function (modelNode) {
      if (modelNode.name && allModelNames.includes(modelNode.name)) {
        if (modelNode.name === setting[params.selectedGroupName].defaultModel) {
          modelNode.visible = true; // Show the selected model
        } else {
          modelNode.visible = false; // Hide other models
        }
      }
    });
  }

  await showHideNodes(main_model, scene, camera);
  await centerMainModel(main_model);
}

// Traverse main model asynchronously
export async function traverseAsync(modelNode, callback) {
  await callback(modelNode);
  const promises = modelNode.children.map((child) =>
    traverseAsync(child, callback)
  );
  return Promise.all(promises);
}

export async function showHideNodes(modelGroup, scene, camera) {
  // let currentModelNode = params.selectedGroupName;
  let current_setting = setting[params.selectedGroupName];

  if (modelGroup) {
    await traverseAsync(modelGroup, async (child) => {
      if (child.name === "Cone") {
        child.visible = false;
      }
    });
    let main_model = modelGroup.getObjectByName(params.selectedGroupName);
    // console.log('main_model', main_model)
    await traverseAsync(main_model, async (child) => {
      let currentModelNode = await getMainParentNode(
        child,
        allModelNames,
        false
      );
      // console.log('currentModelNode', currentModelNode)
      // console.log('child', child)
      // console.log('child.name', child.name)

      let isSlottedSides = currentModelNode.isSlottedSides || false;
      let isShelf = currentModelNode.isShelf || false;
      let isGlassShelf = currentModelNode.isGlassShelf || false;

      child.updateMatrixWorld();
      if (child.name === "Cone") {
        child.visible =
          (await isActiveGroup(currentModelNode)) &&
          Object.keys(setting).length > 1;
      }
      if (child.name && allModelNames.includes(child.name)) {
        if (child.name === current_setting.defaultModel) {
          child.visible = true; // Show the selected model
        } else {
          child.visible = false; // Hide other models
        }
      }
      if (child.name === "Left_Ex" || child.name === "Right_Ex") {
        if (isSlottedSides && current_setting.slottedSidesToggle) {
          child.visible = false;
        } else {
          child.visible = true;
        }
      }
      if (hangerNames.includes(child.name)) {
        if (isSlottedSides && current_setting.slottedSidesToggle) {
          child.visible = false;
        } else {
          child.visible = true;
        }
      }
      if (
        child.name === "Left_Ex_Slotted" ||
        child.name === "Right_Ex_Slotted"
      ) {
        if (isSlottedSides && current_setting.slottedSidesToggle) {
          child.visible = true;
        } else {
          child.visible = false;
        }
      }
      if (rackNames.includes(child.name)) {
        if (isSlottedSides && current_setting.slottedSidesToggle) {
          child.visible = true;
        } else {
          child.visible = false;
        }
      }
      if (child.name === "Header_Wooden_Shelf") {
        child.visible =
          current_setting.topOption == "Shelf" &&
          isShelf &&
          current_setting.defaultShelfType == "Header_Wooden_Shelf";
      }
      if (child.name === "Header_Glass_Shelf") {
        child.visible =
          current_setting.topOption == "Shelf" &&
          isGlassShelf &&
          current_setting.defaultShelfType == "Header_Glass_Shelf";
      }
      if (child.name === "Rod") {
        child.visible =
          (current_setting.topOption == "Shelf" &&
            ((isShelf &&
              current_setting.defaultShelfType == "Header_Wooden_Shelf") ||
              (isGlassShelf &&
                current_setting.defaultShelfType == "Header_Glass_Shelf"))) ||
          (current_setting.headerRodToggle &&
            current_setting.topOption == "Header");
      }
      if (child.name === "Glass_Shelf_Fixing") {
        child.visible =
          current_setting.topOption == "Shelf" &&
          isGlassShelf &&
          current_setting.defaultShelfType == "Header_Glass_Shelf";
      }

      if (allFrameBorderNames.includes(child.name)) {
        if (current_setting.frameMaterialType === "texture") {
          let texture_border = new THREE.TextureLoader().load(
            "./assets/images/borders/" + current_setting.frameBorderColor
          );
          texture_border = await setTextureParams(texture_border);
          let material = border_texture_material.clone();
          material.map = texture_border;
          // // child.material = child.material.clone()
          child.material = material;
          child.material.needsUpdate = true;
        } else if (current_setting.frameMaterialType === "color") {
          // Apply color
          const material = await commonMaterial(
            parseInt(current_setting.frameBorderColor, 16)
          );
          // child.material = child.material.clone()
          child.material = material;
          child.material.needsUpdate = true;
        }
      }

      if (child.name == "Header_Wooden_Shelf") {
        // console.log('Header_Wooden_Shelf', dropdownType, child.name)
        if (current_setting.shelfMaterialType === "texture") {
          // Load texture
          let texture_border = new THREE.TextureLoader().load(
            "./assets/images/borders/" + current_setting.defaultShelfColor
          );
          texture_border = await setTextureParams(texture_border);
          let material = border_texture_material.clone();
          material.map = texture_border;
          child.material = material;
          // child.material = [border_texture_material, shadow];
          child.material.needsUpdate = true;
        } else if (current_setting.shelfMaterialType === "color") {
          // Apply color
          const material = await commonMaterial(
            parseInt(current_setting.defaultShelfColor, 16)
          );
          child.material = material;
          // child.material = [material, shadow];
          child.material.needsUpdate = true;
        }
      }

      if (["Clothing"].includes(child.name)) {
        child.visible = current_setting.hangerClothesToggle;
      }
      if (["Hanger_Clubs"].includes(child.name)) {
        child.visible = current_setting.hangerGolfClubsToggle;
      }

      if (headerNames.includes(child.name)) {
        child.visible =
          current_setting.topOption == "Header" &&
          current_setting.defaultHeaderSize == child.name;
      }

      if (baseFrameNames.includes(child.name)) {
        child.visible = child.name === current_setting.selectedBaseFrame;
      }

      if (
        child.material &&
        child.material.color &&
        child.name &&
        (child.name.startsWith("Base_Option") ||
          child.name === "Base_Support_Sides")
      ) {
        child.material = child.material.clone();
        child.material.color.set(await getHex(current_setting.baseFrameColor));
        child.material.needsUpdate = true;
      }
      if (
        child.material &&
        rodFrameTextureNames.includes(child.name) &&
        child.material.color
      ) {
        child.material = child.material.clone();
        child.material.color.set(await getHex(current_setting.rodFrameColor));
        child.material.needsUpdate = true;
      }
      if (
        child.material &&
        [
          "Hanger_Stand",
          "Hanger_Stand-Arm_Metal",
          "Hanger_Stand-Fixture_Material",
        ].includes(child.name) &&
        child.material.color
      ) {
        child.material = child.material.clone();
        child.material.color.set(
          await getHex(current_setting.defaultHangerStandColor)
        );
        child.material.needsUpdate = true;
      }
      if (
        child.material &&
        ["Rack_Wooden_Shelf"].includes(child.name) &&
        child.material.color
      ) {
        child.material = child.material.clone();
        child.material.color.set(
          await getHex(current_setting.defaultRackShelfStandColor)
        );
        child.material.needsUpdate = true;
      }
      if (["Rack_Stand_LH", "Rack_Stand_RH"].includes(child.name)) {
        if (child.material) {
          child.material = child.material.clone();
          child.material.color.set(
            await getHex(current_setting.defaultRackStandStandColor)
          );
          child.material.needsUpdate = true;
        } else {
          child.traverse(async function (mesh) {
            if (mesh.material) {
              mesh.material = mesh.material.clone();
              mesh.material.color.set(
                await getHex(current_setting.defaultRackStandStandColor)
              );
              mesh.material.needsUpdate = true;
            }
          });
        }
      }
    });

    if (params.topOption == "Header") {
      await traverseAsync(main_model, async (modelNode) => {
        if (allModelNames.includes(modelNode.name)) {
          await Promise.all(
            headerNames.map(async (headerName) => {
              const header = modelNode.getObjectByName(headerName);
              if (header) {
                if (
                  current_setting.headerRodToggle &&
                  !current_setting.headerUpDown
                ) {
                  header.position.y += params.rodSize.y;
                } else if (
                  !current_setting.headerRodToggle &&
                  current_setting.headerUpDown
                ) {
                  header.position.y -= params.rodSize.y;
                }
              }
            })
          );
        }
      });

      setting[params.selectedGroupName].headerUpDown =
        setting[params.selectedGroupName].headerRodToggle;
    }
  }

  // console.log("modelGroup", modelGroup);

  const parentElement = document.querySelector(
    `div.accordion-item[data-model="${params.selectedGroupName}"]`
  );
  if (parentElement) {
    let frameSize = parentElement.querySelector(".frameSize");
    if (frameSize) {
      frameSize.value = current_setting.defaultModel;
    }
    let topDropdown = parentElement.querySelector(".topDropdown");
    if (topDropdown) {
      topDropdown.value = current_setting.topOption;
    }
    let headerOptions = parentElement.querySelector(".headerOptions");
    if (headerOptions) {
      headerOptions.value = current_setting.headerOptions;
    }
    let headerSizeDropdown = parentElement.querySelector(".headerSizeDropdown");
    if (headerSizeDropdown) {
      headerSizeDropdown.value = current_setting.defaultHeaderSize;
    }
    let headerRodToggle = parentElement.querySelector(".headerRodToggle");
    if (headerRodToggle) {
      headerRodToggle.checked = current_setting.headerRodToggle;
    }
    let headerRodColorDropdown = parentElement.querySelector(
      ".headerRodColorDropdown"
    );
    if (headerRodColorDropdown) {
      headerRodColorDropdown.value = current_setting.rodFrameColor;
    }
    let shelfTypeDropdown = parentElement.querySelector(".shelfTypeDropdown");
    if (shelfTypeDropdown) {
      shelfTypeDropdown.value = current_setting.defaultShelfType;
    }
    let slottedSidesToggle = parentElement.querySelector(".slottedSidesToggle");
    if (slottedSidesToggle) {
      slottedSidesToggle.checked = current_setting.slottedSidesToggle;
    }
    let headerFrameColorInput = parentElement.querySelector(
      ".headerFrameColorInput"
    );
    if (headerFrameColorInput) {
      headerFrameColorInput.value = await getHex(
        current_setting.topFrameBackgroundColor
      );
    }
    let headerFrameColorDropdown = parentElement.querySelector(
      ".headerFrameColorDropdown"
    );
    if (headerFrameColorDropdown) {
      headerFrameColorDropdown.value = current_setting.topFrameBackgroundColor;
    }
    let mainFrameColorInput = parentElement.querySelector(
      ".mainFrameColorInput"
    );
    if (mainFrameColorInput) {
      mainFrameColorInput.value = await getHex(
        current_setting.mainFrameBackgroundColor
      );
    }
    let baseSelectorDropdown = parentElement.querySelector(
      ".baseSelectorDropdown"
    );
    if (baseSelectorDropdown) {
      baseSelectorDropdown.value = current_setting.selectedBaseFrame;
    }
    let hangerClothesToggle = parentElement.querySelector(
      ".hangerClothesToggle"
    );
    if (hangerClothesToggle) {
      hangerClothesToggle.value = current_setting.hangerClothesToggle;
    }

    let hangerGolfClubsToggle = parentElement.querySelector(
      ".hangerGolfClubsToggle"
    );
    if (hangerGolfClubsToggle) {
      hangerGolfClubsToggle.value = current_setting.hangerGolfClubsToggle;
    }
    let hangerStandColor = parentElement.querySelector(".hangerStandColor");
    if (hangerStandColor) {
      hangerStandColor.value = current_setting.defaultHangerStandColor;
    }
    let rackShelfColor = parentElement.querySelector(".rackShelfColor");
    if (rackShelfColor) {
      rackShelfColor.value = current_setting.defaultRackShelfStandColor;
    }
    let rackStandColor = parentElement.querySelector(".rackStandColor");
    if (rackStandColor) {
      rackStandColor.value = current_setting.defaultRackStandStandColor;
    }

    if (current_setting.topOption == "Shelf") {
      parentElement.querySelectorAll(".topHeaderOptions").forEach((element) => {
        element.style.display = "none";
      });
      parentElement.querySelectorAll(".topShelfOptions").forEach((element) => {
        element.style.display = "block";
      });
    } else if (current_setting.topOption == "Header") {
      parentElement.querySelectorAll(".topHeaderOptions").forEach((element) => {
        element.style.display = "block";
      });
      parentElement.querySelectorAll(".topShelfOptions").forEach((element) => {
        element.style.display = "none";
      });
    } else {
      parentElement.querySelectorAll(".topHeaderOptions").forEach((element) => {
        element.style.display = "none";
      });
      parentElement.querySelectorAll(".topShelfOptions").forEach((element) => {
        element.style.display = "none";
      });
    }

    if (
      (current_setting.topOption == "Header" &&
        current_setting.headerRodToggle) ||
      (current_setting.topOption == "Shelf" &&
        (current_setting.defaultShelfType == "Header_Wooden_Shelf" ||
          current_setting.defaultShelfType == "Header_Glass_Shelf"))
    ) {
      parentElement
        .querySelectorAll(".headerRodColorDropdownBox")
        .forEach((element) => {
          element.style.display = "block";
        });
    } else {
      parentElement
        .querySelectorAll(".headerRodColorDropdownBox")
        .forEach((element) => {
          element.style.display = "none";
        });
    }

    if (
      current_setting.topOption == "Shelf" &&
      current_setting.defaultShelfType == "Header_Wooden_Shelf"
    ) {
      parentElement.querySelectorAll(".shelfTypeBox").forEach((element) => {
        element.style.display = "block";
      });
    } else {
      parentElement.querySelectorAll(".shelfTypeBox").forEach((element) => {
        element.style.display = "none";
      });
    }

    if (
      current_setting.topOption == "Header" &&
      current_setting.headerOptions == "SEG"
    ) {
      parentElement
        .querySelectorAll(".headerFrameColorDropdownBox")
        .forEach((element) => {
          element.style.display = "none";
        });
      parentElement
        .querySelectorAll(".headerFrameColorInputBox")
        .forEach((element) => {
          element.style.display = "block";
        });
    } else if (
      current_setting.topOption == "Header" &&
      current_setting.headerOptions == "ALG"
    ) {
      parentElement
        .querySelectorAll(".headerFrameColorDropdownBox")
        .forEach((element) => {
          element.style.display = "block";
        });
      parentElement
        .querySelectorAll(".headerFrameColorInputBox")
        .forEach((element) => {
          element.style.display = "none";
        });
    } else if (
      current_setting.topOption == "Header" &&
      current_setting.headerOptions == "ALG3D"
    ) {
      parentElement
        .querySelectorAll(".headerFrameColorDropdownBox")
        .forEach((element) => {
          element.style.display = "none";
        });
      parentElement
        .querySelectorAll(".headerFrameColorInputBox")
        .forEach((element) => {
          element.style.display = "block";
        });
    } else {
      parentElement
        .querySelectorAll(".headerFrameColorDropdownBox")
        .forEach((element) => {
          element.style.display = "none";
        });
      parentElement
        .querySelectorAll(".headerFrameColorInputBox")
        .forEach((element) => {
          element.style.display = "none";
        });
    }
  }

  await drawMeasurementBoxesWithLabels(modelGroup, scene, camera);
}

// Function to find the next visible child
export async function isActiveGroup(currentModelName) {
  let isActive = false;

  let activeParentGroup = await getMainParentNode(
    currentModelName,
    allGroupNames,
    false
  );
  if (
    activeParentGroup.name &&
    params.selectedGroupName == activeParentGroup.name
  ) {
    isActive = true;
  }

  return isActive;
}

// Function to find the next visible child
export async function getPrevVisibleChild(main_model, currentModel) {
  const children = main_model.children; // Get all children of main_model
  let currentIndex = -1;

  // Find the current model index
  for (let i = 0; i < children.length; i++) {
    if (children[i].visible && children[i].name === currentModel.name) {
      currentIndex = i;
      break;
    }
  }

  // Loop through the children to find the next visible child
  for (
    let i = (currentIndex + 1) % children.length;
    i !== currentIndex;
    i = (i + 1) % children.length
  ) {
    if (children[i].visible) {
      return children[i];
    }
  }

  return null; // No next visible child found
}

// Function to find the previous visible child
export async function getNextVisibleChild(main_model, currentModel) {
  const children = main_model.children; // Get all children of main_model
  let currentIndex = -1;

  // Find the current model index
  for (let i = 0; i < children.length; i++) {
    if (children[i].visible && children[i].name === currentModel.name) {
      currentIndex = i;
      break;
    }
  }

  // Loop through the children to find the previous visible child
  for (
    let i = (currentIndex - 1 + children.length) % children.length;
    i !== currentIndex;
    i = (i - 1 + children.length) % children.length
  ) {
    if (children[i].visible) {
      return children[i];
    }
  }

  return null; // No previous visible child found
}

export async function loaderShowHide(isShow = false) {
  if (isShow) {
    document.body.classList.remove("loaded");
  } else {
    document.body.classList.add("loaded");
  }
}

export async function getMainParentNode(child, nodeNames, isVisible = true) {
  let tempNode;
  let currentModelNode = {};

  // Create an array of promises from allModelNames
  let findParentPromises = nodeNames.map(async (val) => {
    tempNode = await findParentNodeByName(child, val, isVisible);
    if (tempNode) {
      return tempNode;
    }
    return null;
  });

  // Await Promise.all and filter for the first non-null result
  let result = await Promise.all(findParentPromises);
  currentModelNode = result.find((node) => node !== null) || {};
  return currentModelNode;
}

export async function updateFrameMaterial(
  main_model,
  dropdownType,
  type,
  value
) {
  // Update Three.js material
  main_model.traverse(async function (child) {
    // console.log('child.name', child.name)
    if (allFrameBorderNames.includes(child.name) && dropdownType === "frame") {
      // let currentModelNode = params.selectedGroupName;
      let currentModelNode = await getMainParentNode(
        child,
        allModelNames,
        false
      );
      let isActive = await isActiveGroup(currentModelNode);
      if (isActive) {
        // console.log('currentModelNode.name', currentModelNode.name)
        if (setting[params.selectedGroupName].frameMaterialType === "texture") {
          // console.log('child.name', child.name)

          // Load texture
          let texture_border = new THREE.TextureLoader().load(
            "./assets/images/borders/" +
              setting[params.selectedGroupName].frameBorderColor
          );
          texture_border = await setTextureParams(texture_border);
          let material = border_texture_material.clone();
          material.map = texture_border;
          // // child.material = child.material.clone()
          child.material = material;
          child.material.needsUpdate = true;
          // let texture_border = new THREE.TextureLoader().load("./assets/images/borders/" + "Black-Wallnut.jpg");

          // texture_border = await setTextureParams(texture_border);
          // const newMaterial = new THREE.MeshStandardMaterial({
          //     map: texture_border,            // Base color texture
          //     roughness: 0.2,          // Adjust as needed
          //     metalness: 0.7           // Adjust as needed
          // });
          // child.material = newMaterial;
          // child.material.needsUpdate = true;
        } else if (
          setting[params.selectedGroupName].frameMaterialType === "color"
        ) {
          // Apply color
          const material = await commonMaterial(
            parseInt(setting[params.selectedGroupName].frameBorderColor, 16)
          );
          // child.material = child.material.clone()
          child.material = material;
          child.material.needsUpdate = true;

          // if (child instanceof THREE.Group) {
          //     console.log("group")

          //     child.traverse(async (child1) => {

          //         if (child1.name == "Top_Ex_Metal") {
          //             child1.material = material;
          //             child1.material.needsUpdate = true;
          //         }
          //         else{
          //             // console.log("child1.name", child1.name)
          //             // child1.material = material;
          //             // child1.material.needsUpdate = true;
          //         }

          //     });
          // }
          // else {
          //     child.material = material;
          //     child.material.needsUpdate = true;

          // }
        }
      }
    }
    if (child.name == "Header_Wooden_Shelf" && dropdownType === "shelf") {
      // console.log('Header_Wooden_Shelf', dropdownType, child.name)
      if (setting[params.selectedGroupName].shelfMaterialType === "texture") {
        // Load texture
        let texture_border = new THREE.TextureLoader().load(
          "./assets/images/borders/" +
            setting[params.selectedGroupName].defaultShelfColor
        );
        texture_border = await setTextureParams(texture_border);
        let material = border_texture_material.clone();
        material.map = texture_border;
        child.material = material;
        // child.material = [border_texture_material, shadow];
        child.material.needsUpdate = true;
      } else if (
        setting[params.selectedGroupName].shelfMaterialType === "color"
      ) {
        // Apply color
        const material = await commonMaterial(
          parseInt(setting[params.selectedGroupName].defaultShelfColor, 16)
        );
        child.material = material;
        // child.material = [material, shadow];
        child.material.needsUpdate = true;
      }
    }
  });
}

export async function centerMainModel(modelGroup) {
  const spacing = 1; // Base space between models
  let currentX = 0; // Start positioning from 0 along the x-axis

  // Get total width of all models to center the group
  let totalWidth = 0;
  const models = [];

  // First pass: Calculate total width and collect visible models
  allGroupNames.forEach((modelName) => {
    const main_model = modelGroup.getObjectByName(modelName);

    main_model.children.forEach((model) => {
      if (allModelNames.includes(model.name) && model && model.visible) {
        // Only consider visible models
        models.push(model);

        // Ensure the bounding box is computed
        model.traverse((child) => {
          if (child.isMesh && child.geometry) {
            child.geometry.computeBoundingBox();
          }
        });

        // Get bounding box for the model
        const boundingBox = new THREE.Box3().setFromObject(model);
        const modelWidth = boundingBox.max.x - boundingBox.min.x;

        // Get model-specific spacing (manual movement)
        const modelSpacing = Math.abs(model.parent.spacing || 0); // Use positive spacing value
        totalWidth += modelWidth + spacing + modelSpacing;
      }
    });
  });

  // Center the starting position by shifting based on half the total width
  currentX = -(totalWidth / 2);

  // console.log("totalWidth:", totalWidth);

  // Second pass: Position each model with spacing and manual offsets
  for (const model of models) {
    // Get bounding box again for this model
    const boundingBox = new THREE.Box3().setFromObject(model);
    const modelWidth = boundingBox.max.x - boundingBox.min.x;

    // Get the original y position (to preserve vertical alignment)
    const originalYPosition = model.position.y;

    // Get model-specific spacing (manual movement)
    // const modelSpacing = Math.abs(model.spacing || 0); // Use positive spacing value
    const modelSpacing = Math.abs(model.parent.spacing || 0); // Use positive spacing value
    let isPositive = Math.sign(model.parent.spacing);
    let newPositionX;
    if (isPositive === -1) {
      newPositionX = -modelSpacing + currentX + modelWidth / 2 + modelSpacing;
    } else {
      newPositionX = currentX + modelWidth / 2 + modelSpacing;
    }

    // Position the model along the x-axis with added spacing and manual offset
    // const newPositionX = currentX + modelWidth / 2 + modelSpacing;

    // model.position.set(newPositionX, originalYPosition, model.position.z); // Use original y and z positions
    model.parent.position.x = newPositionX; // Use original y and z positions

    // Move to the next position along the x-axis (account for model width + base spacing + manual spacing)

    currentX += modelWidth + spacing + modelSpacing;
  }

  // Recompute bounding boxes for all models in the group
  modelGroup.traverse((modelchild) => {
    modelchild.traverse((child) => {
      if (child.isMesh && child.geometry) {
        child.geometry.computeBoundingBox();
      }
    });
  });

  // console.log("modelGroup:", modelGroup);
  // console.log("models:", models);
}

export async function centerMainModel1(modelGroup) {
  const spacing = 1; // Base space between models
  let currentX = 0; // Start positioning from 0 along the x-axis

  // Get total width of all models to center the group
  let totalWidth = 0;
  const models = [];

  // First pass: Calculate total width and collect visible models
  allGroupNames.forEach((modelName) => {
    const main_model = modelGroup.getObjectByName(modelName);
    main_model.children.forEach((model) => {
      if (allModelNames.includes(model.name) && model && model.visible) {
        // Only consider visible models
        models.push(model);

        // Ensure the bounding box is computed
        model.traverse((child) => {
          if (child.isMesh && child.geometry) {
            child.geometry.computeBoundingBox();
          }
        });

        // Get bounding box for the model
        const boundingBox = new THREE.Box3().setFromObject(model);
        const modelWidth = boundingBox.max.x - boundingBox.min.x;

        // Get model-specific spacing (manual movement)
        const modelSpacing = Math.abs(model.spacing || 0); // Use positive spacing value
        totalWidth += modelWidth + spacing + modelSpacing;
      }
    });
  });

  // Center the starting position by shifting based on half the total width
  currentX = -(totalWidth / 2);

  // Second pass: Position each model with spacing and manual offsets
  // models.forEach(async model => {
  for (const model of models) {
    // Get bounding box again for this model
    const boundingBox = new THREE.Box3().setFromObject(model);
    const modelWidth = boundingBox.max.x - boundingBox.min.x;

    // Get the original y position
    const originalYPosition = model.position.y; // Maintain the original y position

    // Get model-specific spacing (manual movement)
    const modelSpacing = Math.abs(model.spacing || 0); // Use positive spacing value

    // Position the model along the x-axis with added spacing and manual offset
    let updateSpacing = 0;
    if (currentX + modelWidth / 2 > 0) {
      updateSpacing = modelSpacing;
    }
    (model.parent.position.x = currentX + modelWidth / 2 + updateSpacing),
      originalYPosition;

    // model.position.set(currentX + modelWidth / 2 + updateSpacing, originalYPosition, 0); // Use original y position

    // Move to the next position along the x-axis (account for model width + base spacing + manual spacing)
    currentX += modelWidth + spacing + modelSpacing;
  }
  // });

  // Ensure the bounding box is computed
  modelGroup.traverse((modelchild) => {
    modelchild.traverse((child) => {
      if (child.isMesh && child.geometry) {
        child.geometry.computeBoundingBox();
      }
    });
  });
}

// Function to check for collision
export async function checkForCollision(
  modelGroup,
  movingModelGroup,
  moveAmount
) {
  const movingModelBoundingBox = await computeBoundingBox(
    movingModelGroup,
    allModelNames
  );
  movingModelBoundingBox.translate(new THREE.Vector3(moveAmount, 0, 0)); // Move bounding box based on movement

  // Check against all other model groups in the scene
  for (let otherModelGroup of modelGroup.children) {
    if (otherModelGroup !== movingModelGroup && otherModelGroup.visible) {
      const otherModelBoundingBox = await computeBoundingBox(
        otherModelGroup,
        allModelNames
      );
      // Check if the bounding boxes intersect
      if (movingModelBoundingBox.intersectsBox(otherModelBoundingBox)) {
        return false; // Collision detected
      }
    }
  }
  return true; // No collision, safe to move
}

// // Function to check for collision
// export async function checkForCollision(main_model, movingModel, moveAmount) {
//     const movingModelBoundingBox = new THREE.Box3().setFromObject(movingModel);
//     movingModelBoundingBox.translate(new THREE.Vector3(moveAmount, 0, 0)); // Move bounding box based on movement

//     // Check against all other models
//     for (let otherModelName of main_model.children) {
//         const otherModel = main_model.getObjectByName(otherModelName.name);

//         if (otherModel && otherModel !== movingModel && otherModel.visible) {
//             const otherModelBoundingBox = new THREE.Box3().setFromObject(otherModel);

//             // Check if the bounding boxes intersect
//             if (movingModelBoundingBox.intersectsBox(otherModelBoundingBox)) {
//                 return false; // Collision detected
//             }
//         }
//     }

//     return true; // No collision, safe to move
// }

export async function clearMeasurementBoxes(scene) {
  const objectsToRemove = [];

  // Traverse all the children in the scene
  scene.traverse(function (child) {
    if (child.name && child.name.startsWith("Measurement")) {
      objectsToRemove.push(child);
    }
  });

  // Now remove all flagged objects from the scene
  objectsToRemove.forEach((object) => {
    if (object.parent) {
      object.parent.remove(object); // Remove from its parent
    }

    // Additionally, dispose of geometry and material to free up memory
    if (object.geometry) object.geometry.dispose();
    if (object.material) object.material.dispose();
  });

  // Clean up the list of children in the scene
  // scene.children = scene.children.filter(child => !child.name.startsWith('Measurement'));
  // scene.children = scene.children.filter(child => {
  //     return child.name && !child.name.startsWith('Measurement');
  // });
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

export async function computeVisibleNodeBoundingBox(
  object,
  mainModelNames,
  innerModelNames
) {
  const bbox = new THREE.Box3();

  // Traverse the object and expand the bounding box for visible nodes
  object.traverse(async function (child) {
    if (mainModelNames.includes(child.name) && child.visible) {
      child.traverse(async function (modelNode) {
        if (innerModelNames.includes(modelNode.name)) {
          let isNodeVisible = modelNode.visible;
          // Expand the bounding box only if the node is visible and has visible parents
          if (isNodeVisible) {
            bbox.expandByObject(modelNode);
          }
        }
      });
    }
  });
  return bbox;
}

export async function drawMeasurementBoxesWithLabels(
  main_model,
  scene,
  camera
) {
  if (main_model) {
    const bbox = await computeVisibleNodeBoundingBox(
      main_model,
      allModelNames,
      heightMeasurementNames
    );
    if (bbox) {
      let multiplier = 1;

      // Clear previous measurement boxes and labels
      await clearMeasurementBoxes(scene);
      if (params.measurementToggle) {
        const min = bbox.min.clone();
        const max = bbox.max.clone();

        // Material for the measurement boxes
        const material = new THREE.MeshBasicMaterial({
          color: params.measurementLineColor,
        });

        // Create width measurement group
        const width = max.x - min.x;
        const widthGroup = await addMeasurementGroup(
          material,
          {
            width: width,
            height: params.measurementLineLength,
            depth: params.measurementLineLength,
          }, // lineSize
          `${width.toFixed(0) * multiplier}mm`, // labelText Width:
          new THREE.BoxGeometry(
            params.measurementLineLength,
            params.measurementLineHeight,
            params.measurementLineLength
          ), // handleLineGeometry
          "MeasurementWidth" // groupNamePrefix
        );
        scene.add(widthGroup); // Add the group to the scene

        // Create height measurement group
        const height = max.y - min.y;
        const heightGroup = await addMeasurementGroup(
          material,
          {
            width: params.measurementLineLength,
            height: height,
            depth: params.measurementLineLength,
          }, // lineSize
          `${height.toFixed(0) * multiplier}mm`, // labelText Height:
          new THREE.BoxGeometry(
            params.measurementLineLength,
            params.measurementLineLength,
            params.measurementLineHeight
          ), // handleLineGeometry
          "MeasurementHeight" // groupNamePrefix
        );
        scene.add(heightGroup); // Add the group to the scene

        // Create depth measurement group
        const depth = max.z - min.z;
        const depthGroup = await addMeasurementGroup(
          material,
          {
            width: params.measurementLineLength,
            height: params.measurementLineLength,
            depth: depth,
          }, // lineSize
          `${depth.toFixed(0) * multiplier}mm`, // labelText Depth:
          new THREE.BoxGeometry(
            params.measurementLineLength,
            params.measurementLineHeight,
            params.measurementLineLength
          ), // handleLineGeometry
          "MeasurementDepth" // groupNamePrefix
        );
        scene.add(depthGroup); // Add the group to the scene

        // Update labels to always face the camera
        scene.onBeforeRender = function () {
          scene.traverse((obj) => {
            if (obj.name && obj.name.includes("Label")) {
              obj.lookAt(camera.position);
            }
          });
        };
      }
    }
  }
}

export async function addMeasurementGroup(
  material,
  lineSize,
  labelText,
  handleLineGeometry,
  groupNamePrefix
) {
  // Create a group for the measurement
  const measurementGroup = new THREE.Group();
  measurementGroup.name = groupNamePrefix;
  measurementGroup.visible = false;

  // Create measurement box
  const boxGeometry = new THREE.BoxGeometry(
    lineSize.width,
    lineSize.height,
    lineSize.depth
  );
  const box = new THREE.Mesh(boxGeometry, material);
  box.name = `${groupNamePrefix}Box`;
  measurementGroup.add(box);

  // Create lines
  const startLine = new THREE.Mesh(handleLineGeometry, material);
  const endLine = new THREE.Mesh(handleLineGeometry, material);

  // Set positions for start and end lines
  startLine.name = `${groupNamePrefix}StartLine`;
  measurementGroup.add(startLine);

  endLine.name = `${groupNamePrefix}EndLine`;
  measurementGroup.add(endLine);

  // Create and add label
  const label = await createLabel(labelText);
  label.name = `${groupNamePrefix}Label`;
  measurementGroup.add(label);

  // Return the group so it can be added to the scene or manipulated further
  return measurementGroup;
}

export async function createLabel(text) {
  const labelDiv = document.createElement("div");
  labelDiv.className = "measurement_label"; // Add CSS class for styling
  labelDiv.textContent = text;
  labelDiv.style.backgroundColor = "rgba(0, 0, 0, 1)"; // Similar background style as example
  labelDiv.style.color = "#ffffff"; // White text color
  labelDiv.style.padding = "2px 5px"; // Padding similar to example
  labelDiv.style.borderRadius = "5px"; // borderRadius similar to example
  labelDiv.style.fontSize = "16px"; // fontSize similar to example

  // Create a CSS2DObject with the labelDiv
  const label = new CSS2DObject(labelDiv);
  label.position.set(0, 0, 0); // Adjust position according to your needs
  // console.log('label', label)
  return label;
}

// Initialize the label renderer
export async function initLabelRenderer() {
  let labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.style.position = "absolute";
  labelRenderer.domElement.style.top = "0px";
  labelRenderer.domElement.style.pointerEvents = "none"; // Add this line
  return labelRenderer;
}

// Initialize the label renderer
export async function updateLabelOcclusion(
  scene,
  camera,
  raycaster,
  direction
) {
  // Perform the raycasting for each measurement group
  scene.traverse((object) => {
    if (object instanceof CSS2DObject && object.name.includes("Label")) {
      // Get the label position
      const labelPosition = new THREE.Vector3();
      object.getWorldPosition(labelPosition);

      // Calculate direction from camera to the label
      direction.subVectors(labelPosition, camera.position).normalize();

      // Set raycaster from the camera towards the label
      raycaster.set(camera.position, direction);

      // Perform raycast and check for intersections
      const intersects = raycaster.intersectObjects(scene.children, true);

      // If there's an object closer to the camera than the label, hide the label
      if (
        intersects.length > 0 &&
        intersects[0].distance < labelPosition.distanceTo(camera.position)
      ) {
        object.renderOrder = -3; // Send behind the other objects
      } else {
        object.renderOrder = 1; // Bring in front if no occlusion
      }
    }
  });
}

export async function createLabel1(text) {
  const labelGroup = new THREE.Group();

  if (!params.font) {
    params.font = await fontLoader.loadAsync("helvetiker_bold.typeface.json");
  }

  const textGeometry = new TextGeometry(text, {
    font: params.font,
    size: params.fontSize,
    // depth: 0.2,
    // height: 0.2, // Depth of the text
    // curveSegments: 20 // Smoother text
    depth: 5,
    curveSegments: 12,
    // bevelEnabled: false,
    // bevelThickness: 10,
    // bevelSize: 1,
    // bevelOffset: 0,
    // bevelSegments: 5
  });

  textGeometry.computeBoundingBox();
  const textSize = textGeometry.boundingBox.getSize(new THREE.Vector3());

  const padding = 30;
  const backgroundWidth = textSize.x + padding;
  const backgroundHeight = textSize.y + padding;
  const cornerRadius = 10;

  const roundedRectShape = await createRoundedRectShape(
    backgroundWidth,
    backgroundHeight,
    cornerRadius
  );
  const extrudesetting = {
    depth: 0.1,
    bevelEnabled: false,
  };
  const backgroundGeometry = new THREE.ExtrudeGeometry(
    roundedRectShape,
    extrudesetting
  );
  const backgroundMaterial = new THREE.MeshBasicMaterial({
    color: params.measurementLineColor,
    opacity: 0.1,
    transparent: false, // Make transparent if needed
    // depthTest: false,
    // depthWrite: false,
  });

  const backgroundMesh = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
  const textMaterial = new THREE.MeshBasicMaterial({
    color: params.measurementTextColor,
    opacity: 1,
    transparent: true,
    // depthTest: false,
    // depthWrite: false
  });

  if (textMaterial.map) {
    textMaterial.map.minFilter = THREE.LinearMipMapLinearFilter;
  }

  const textMesh = new THREE.Mesh(textGeometry, textMaterial);

  textMesh.position.set(-textSize.x / 2, -textSize.y / 2, 1); // Offset slightly to avoid z-fighting

  textMesh.renderOrder = 1;
  backgroundMesh.renderOrder = 0;

  labelGroup.add(backgroundMesh);
  labelGroup.add(textMesh);

  return labelGroup;
}

export async function createRoundedRectShape(width, height, radius) {
  const shape = new THREE.Shape();
  shape.moveTo(-width / 2 + radius, -height / 2);
  shape.lineTo(width / 2 - radius, -height / 2);
  shape.quadraticCurveTo(
    width / 2,
    -height / 2,
    width / 2,
    -height / 2 + radius
  );
  shape.lineTo(width / 2, height / 2 - radius);
  shape.quadraticCurveTo(width / 2, height / 2, width / 2 - radius, height / 2);
  shape.lineTo(-width / 2 + radius, height / 2);
  shape.quadraticCurveTo(
    -width / 2,
    height / 2,
    -width / 2,
    height / 2 - radius
  );
  shape.lineTo(-width / 2, -height / 2 + radius);
  shape.quadraticCurveTo(
    -width / 2,
    -height / 2,
    -width / 2 + radius,
    -height / 2
  );
  return shape;
}

export async function updateMeasurementGroups(main_model, scene, camera) {
  if (main_model) {
    const bbox = await computeVisibleNodeBoundingBox(
      main_model,
      allModelNames,
      heightMeasurementNames
    );
    if (bbox) {
      const min = bbox.min.clone();
      const max = bbox.max.clone();
      const center = bbox.getCenter(new THREE.Vector3());

      // Determine if the camera is on the left or right side of the model
      const cameraOnLeft = camera.position.x < center.x;
      const cameraZAdjustment = camera.position.z < center.z ? -70 : 70; // Adjust if camera is in front or behind
      const lableZAdjustment = camera.position.z < center.z ? -20 : 20; // Adjust if camera is in front or behind
      const lableYAdjustment = 30; // Adjust if camera is in front or behind

      // Create width measurement group
      const width = max.x - min.x;
      await updateMeasurementGroupPosition(
        scene,
        camera,
        "MeasurementWidth",
        {
          x: min.x + width / 2,
          y: max.y + params.measurementLineDistance,
          z: cameraZAdjustment,
        }, // linePosition
        new THREE.Vector3(
          min.x + width / 2,
          max.y + 1 + params.measurementLineDistance + lableYAdjustment,
          cameraZAdjustment + lableZAdjustment
        ), // labelPosition
        {
          x: min.x,
          y: max.y + params.measurementLineDistance,
          z: cameraZAdjustment,
        }, // startLinePosition
        {
          x: max.x,
          y: max.y + params.measurementLineDistance,
          z: cameraZAdjustment,
        } // endLinePosition
      );

      // Update height measurement
      const height = max.y - min.y;
      const heightXPosition = cameraOnLeft
        ? max.x + 1 + params.measurementLineDistance // If camera is on the left, height is on the right
        : min.x - 1 - params.measurementLineDistance; // If camera is on the right, height is on the left

      await updateMeasurementGroupPosition(
        scene,
        camera,
        "MeasurementHeight",
        { x: heightXPosition, y: min.y + height / 2, z: cameraZAdjustment }, // linePosition
        new THREE.Vector3(
          heightXPosition,
          min.y + height / 2,
          cameraZAdjustment + lableZAdjustment
        ), // labelPosition
        { x: heightXPosition, y: min.y, z: cameraZAdjustment }, // startLinePosition
        { x: heightXPosition, y: max.y, z: cameraZAdjustment } // endLinePosition
      );

      // Update depth measurement
      const depth = max.z - min.z;
      const depthXPosition = cameraOnLeft
        ? min.x - params.measurementLineDistance // If camera is in front, depth is behind
        : max.x + params.measurementLineDistance; // If camera is behind, depth is in front

      await updateMeasurementGroupPosition(
        scene,
        camera,
        "MeasurementDepth",
        { x: depthXPosition, y: min.y, z: min.z + depth / 2 }, // linePosition
        new THREE.Vector3(
          depthXPosition,
          min.y + lableYAdjustment,
          min.z + depth / 2 + lableZAdjustment
        ), // labelPosition
        { x: depthXPosition, y: min.y, z: min.z }, // startLinePosition
        { x: depthXPosition, y: min.y, z: max.z } // endLinePosition
      );
    }
  }
}

export async function updateMeasurementGroupPosition(
  scene,
  camera,
  groupName,
  linePosition,
  labelPosition,
  startLinePosition,
  endLinePosition
) {
  const measurementGroup = scene.getObjectByName(groupName);
  if (measurementGroup) {
    measurementGroup.visible = params.measurementToggle;

    // Update box position
    const box = measurementGroup.getObjectByName(`${groupName}Box`);
    if (box) box.position.copy(linePosition);

    // Update start and end line positions
    const startLine = measurementGroup.getObjectByName(`${groupName}StartLine`);
    const endLine = measurementGroup.getObjectByName(`${groupName}EndLine`);
    if (startLine) startLine.position.copy(startLinePosition);
    if (endLine) endLine.position.copy(endLinePosition);

    // Update label position
    const label = measurementGroup.getObjectByName(`${groupName}Label`);
    if (label) label.position.copy(labelPosition);
  }
}

export async function generateGlassTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 2;
  canvas.height = 2;

  const context = canvas.getContext("2d");
  context.fillStyle = "white";
  context.fillRect(0, 1, 2, 1);

  return canvas;
}

export async function generateGlassMaterial(texture_background) {
  let texture_glass = texture_background.clone();
  texture_glass.mapping = THREE.EquirectangularReflectionMapping;
  const texture = new THREE.CanvasTexture(await generateGlassTexture());
  const material = new THREE.MeshPhysicalMaterial({
    color: "#3d7e35",
    metalness: 0.09,
    roughness: 0,
    ior: 2,
    alphaMap: texture,
    envMap: texture_glass,
    envMapIntensity: 1,
    transmission: 1, // use material.transmission for glass materials
    specularIntensity: 1,
    specularColor: "#ffffff",
    opacity: 0.4,
    side: THREE.DoubleSide,
    transparent: true,
  });
  return material;
}

export async function isVisibleParents(node) {
  // Base case: If the node is null, return true (end of the hierarchy)
  if (!node) {
    return true;
  }

  // Check if the current node is visible
  if (!node.visible) {
    return false;
  }

  // Recursively check the parent node
  return await isVisibleParents(node.parent);
}

export async function findParentNodeByName(node, parentName, isVisible = null) {
  // Base case: If the current node has no parent, return null
  if (!node || !node.parent) return null;

  // Check if parentName is an array or a string
  const isMatch = Array.isArray(parentName)
    ? parentName.includes(node.parent.name)
    : node.parent.name === parentName;

  // If the current node's parent matches the name (or one of the names in the array), return the parent node
  if (isVisible) {
    if (isMatch && node.parent.visible) {
      return node.parent; // Return the current node if its parent name matches
    }
  } else {
    if (isMatch) {
      return node.parent; // Return the current node if its parent name matches
    }
  }

  // Recursively search for the matching node in the children
  const result = await findParentNodeByName(node.parent, parentName, isVisible);
  if (result) return result; // If a match is found, return it

  // If no match is found, return null
  return null;
}

export async function addCloseButton(
  modelName,
  accordionItem,
  modelGroup,
  mergedArray
) {
  const closeButtonDiv = document.createElement("div");
  closeButtonDiv.classList.add("control-group");
  const closeButton = document.createElement("button");
  closeButton.classList.add(
    "btn",
    "btn-danger",
    "btn-sm",
    "model-close-button"
  );
  closeButton.type = "button";
  closeButton.innerHTML = "Delete";
  closeButtonDiv.appendChild(closeButton);

  // Append the close button to the accordion header
  const accordionHeader = accordionItem.querySelector(".accordion-body");
  accordionHeader.appendChild(closeButtonDiv);

  // You can add the event listener for closing functionality here
  closeButton.addEventListener("click", async () => {
    const confirmDelete = confirm("Do you want to delete the model?");
    if (confirmDelete) {
      const modelToRemove = modelGroup.getObjectByName(modelName);
      if (modelToRemove) {
        modelGroup.remove(modelToRemove);
      }
      const index = mergedArray.indexOf(modelName);
      if (index > -1) {
        mergedArray.splice(index, 1); // Removes 1 element at the specified index
      }
      accordionItem.remove();
    }
    await centerMainModel(modelGroup);
  });
}

export async function addAnotherModels(
  allGroupNames,
  modelGroup,
  scene,
  camera,
  modelName = null,
  side = null
) {
  let defaultModel = modelGroup.getObjectByName("main_model");
  // console.log('defaultModel', defaultModel);

  const newModel = defaultModel.clone();
  await cloneWithCustomProperties(defaultModel, newModel);

  const nodesToRemove = [];
  await traverseAsync(newModel, async (child) => {
    if (hangerNames.includes(child.name) || rackNames.includes(child.name)) {
      // Mark node for removal
      nodesToRemove.push(child);
    }
  });

  // Remove nodes after traversal
  nodesToRemove.forEach((node) => {
    if (node.parent) {
      node.parent.remove(node); // Remove the node from its parent
    }
  });

  if (!modelName) {
    let baseModelName = "Other_" + newModel.name;
    let newModelName = baseModelName + "_1"; // Avoid redefining modelName
    let suffix = 1;
    while (allGroupModelName.includes(newModelName)) {
      suffix++;
      newModelName = `${baseModelName}_${suffix}`;
    }

    modelName = newModelName;
  }

  newModel.name = modelName; // If modelName is not null or undefined

  //   newModel.position.x = i * 18.05 - (modelGroupLength - 1) * 9.025;
  const modelBoundingBox = await computeBoundingBox(newModel, allModelNames);
  const modelWidth = modelBoundingBox.max.x - modelBoundingBox.min.x;

  const boundingBox = await computeBoundingBox(modelGroup, allModelNames);
  const center = boundingBox.getCenter(new THREE.Vector3());
  const cameraOnLeft = side || camera.position.x < center.x;

  if (cameraOnLeft) {
    newModel.position.x = boundingBox.max.x + modelWidth / 2;
    allGroupNames.push(newModel.name);
    allGroupModelName.push(newModel.name);
  } else {
    newModel.position.x = boundingBox.min.x - modelWidth / 2;
    allGroupNames.unshift(newModel.name);
    allGroupModelName.unshift(newModel.name);
  }

  if (!setting[modelName]) {
    setting[modelName] = JSON.parse(JSON.stringify(setting["main_model"]));
    setting[modelName].topFrameBackgroundColor = params.topFrameBackgroundColor;
    setting[modelName].mainFrameBackgroundColor =
      params.mainFrameBackgroundColor;
    setting[modelName].defaultModel = params.addedVisibleModelName;
  }

  await traverseAsync(newModel, async (mesh) => {
    if (
      frameTop1Names.includes(mesh.name) ||
      frameMainNames.includes(mesh.name)
    ) {
      let currentModelNode = await getMainParentNode(mesh, allModelNames);
      if (
        params.lastInnerMaterial[currentModelNode.name] &&
        params.lastInnerMaterial[currentModelNode.name][mesh.name]
      ) {
        // const material = await commonMaterial(parseInt('0xffffff', 16))
        const material =
          params.lastInnerMaterial[currentModelNode.name][mesh.name];
        mesh.material = material;
        mesh.needsUpdate = true;
      }
    }

    if (mesh.name && allModelNames.includes(mesh.name)) {
      if (mesh.name === params.addedVisibleModelName) {
        mesh.visible = true; // Show the selected model
      } else {
        mesh.visible = false; // Hide other models
      }
    }
  });

  modelGroup.add(newModel);

  await addAnotherModelView(allGroupNames, cameraOnLeft, modelGroup);
}

// Function to dynamically generate and append cards for visible models
export async function addAnotherModelView(
  mergedArray,
  cameraOnLeft,
  modelGroup
) {
  const rightControls = document.querySelector(".model_items");

  // Loop through the mergedArray and append cards for visible models
  await mergedArray.forEach(async (modelName) => {
    if (
      modelName.startsWith("Other_") &&
      !document.querySelector(`.accordion-item[data-model="${modelName}"]`)
    ) {
      // Clone the accordion item
      const accordionItem = await cloneAccordionItem(modelName);

      if (accordionItem) {
        // Ensure accordionItem is valid
        const accordionContainer = document.querySelector("#accordionModel");

        // Collapse all currently open accordion items
        const openAccordionItems = accordionContainer.querySelectorAll(
          ".accordion-collapse.show"
        );
        openAccordionItems.forEach((item) => {
          const bsCollapse = new bootstrap.Collapse(item, {
            toggle: false, // Prevent toggle during the collapse
          });
          bsCollapse.hide(); // Explicitly hide the open accordion
        });

        // Set the parent for the new accordion item
        accordionItem
          .querySelector(".accordion-collapse")
          .setAttribute("data-bs-parent", "#accordionModel");
        accordionItem.setAttribute("data-model", modelName); // Ensure the data-model attribute is set
        await addCloseButton(modelName, accordionItem, modelGroup, mergedArray);

        // Append the new accordion item to the container
        // accordionContainer.appendChild(accordionItem);
        if (cameraOnLeft) {
          accordionContainer.appendChild(accordionItem);
        } else {
          accordionContainer.prepend(accordionItem);
        }

        // Initialize the new setting for the model

        // Now open the newly appended accordion item
        const collapseElement = accordionItem.querySelector(
          ".accordion-collapse"
        );
        const bsCollapse = new bootstrap.Collapse(collapseElement, {
          toggle: true, // This will show the collapse content
        });

        // Optionally, scroll the page to the new accordion item
        accordionItem.scrollIntoView({ behavior: "smooth" });
      }
    }
  });

  const allCards = rightControls.querySelectorAll(".model_item_card");
  allCards.forEach((card, idx) => {
    const indexElement = card.querySelector(".card-index");
    if (indexElement) {
      indexElement.textContent = idx + 1; // Reassign index based on position
    }
  });

  const moveLeftRightModel = document.querySelector(".moveLeftRightModel");
  if (moveLeftRightModel) {
    if (setting && Object.keys(setting).length > 1) {
      moveLeftRightModel.style.display = "flex"; // Initially hide the move buttons
    } else {
      moveLeftRightModel.style.display = "none"; // Initially hide the move buttons
    }
  }
}

export async function cloneAccordionItem(modelName) {
  // Find the original accordion item
  const originalAccordionItem = document.querySelector(
    '.accordion-item[data-model="main_model"]'
  );

  // Check if the original accordion item exists
  if (!originalAccordionItem) {
    console.error("Original accordion item not found");
    return null;
  }

  // Clone the accordion item
  const newAccordionItem = originalAccordionItem.cloneNode(true);

  // // Find the div containing the 'frameSize' dropdown
  // var frameSizeDiv = newAccordionItem.querySelector('select.frameSize');

  // // Check if the dropdown exists and remove its parent div
  // if (frameSizeDiv) {
  //     frameSizeDiv.closest('.control-group').remove();
  // }

  // Modify the data-model attribute and the text content
  let displayName = modelName
    .replace("Other_", "") // Remove "Other_"
    .replace(/_/g, " ") // Replace underscores with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase());
  newAccordionItem.setAttribute("data-model", modelName);
  newAccordionItem.querySelector(".accordion-header button").textContent =
    displayName; // Change the title

  // Set the new ID and aria-controls to ensure uniqueness
  const newId = `collapse${modelName}`;
  newAccordionItem
    .querySelector(".accordion-collapse")
    .setAttribute("id", newId);
  newAccordionItem
    .querySelector(".accordion-header button")
    .setAttribute("data-bs-target", `#${newId}`);
  newAccordionItem
    .querySelector(".accordion-collapse")
    .classList.remove("show"); // Make it collapsed
  // Find all elements with a 'data-src' attribute
  newAccordionItem.querySelectorAll("[data-src]").forEach(function (element) {
    // Get the value of the 'data-src' attribute
    const dataSrcValue = element.getAttribute("data-src");

    // Set it as the 'src' attribute
    element.setAttribute("src", dataSrcValue);

    // Optionally, remove the 'data-src' attribute
    element.removeAttribute("data-src");
  });
  // Return the new accordion item
  return newAccordionItem;
}

export async function addHangers(
  modelGroup,
  hangerType,
  hanger_model,
  hanger_golf_club_model,
  scene,
  camera,
  lastside = null,
  position = null
) {
  let hangermodel, hanger;

  // const loader = new GLTFLoader();
  if (golfClubNames.includes(hangerType)) {
    hangermodel = hanger_golf_club_model;
  } else {
    hangermodel = hanger_model;
  }
  let selectedGroupName = params.selectedGroupName;
  let defaultModelName = setting[selectedGroupName].defaultModel;
  let selectedGroupModel = modelGroup.getObjectByName(selectedGroupName);
  let defaultModel = selectedGroupModel.getObjectByName(defaultModelName);
  if (hangermodel) {
    // console.log('hangermodel', hangermodel)
    // console.log('selectedGroupName', selectedGroupName)
    // console.log('defaultModelName', defaultModelName)

    let hanger_object = hangermodel.getObjectByName(hangerType);
    if (hanger_object) {
      hanger = hanger_object.clone();
      if (hanger) {
        let frame = defaultModel.getObjectByName("Frame");
        let side;
        if (lastside) {
          side = lastside;
        } else {
          side = camera.position.z > 0 ? "Front" : "Back";
        }

        const hangerPrefix =
          selectedGroupName + "-" + defaultModelName + "-" + side + "-"; // Prefix to match keys
        let hangerArrayKey = hangerPrefix + hangerType;

        let conditionFlag = await isHangerAdd(
          frame,
          hangermodel,
          hangerType,
          params.hangerCount,
          hangerPrefix
        );

        // if (!conditionFlag) {
        // console.log("frame:", frame);
        // console.log("hangermodel:", hangermodel);
        // console.log("hangerType:", hangerType);
        // console.log("params.hangerCount:", params.hangerCount);
        // console.log("hangerArrayKey:", hangerArrayKey);
        // console.log("conditionFlag:", conditionFlag);
        //   // console.log("There is not enough .", frame, hangermodel, hangerType, params.hangerCount, hangerArrayKey, conditionFlag);
        // }

        let leftSideSlotted = frame.getObjectByName("Left_Ex_Slotted");
        if (!leftSideSlotted || !leftSideSlotted.visible) {
          if (conditionFlag) {
            hanger.position.y -= params.cameraPosition;
            hanger.name = hangerType;

            // Get the bounding box of the frame to find its center
            const frameBoundingBox = new THREE.Box3().setFromObject(frame);
            const frameCenter = frameBoundingBox.getCenter(new THREE.Vector3());
            const frameWidth = frameBoundingBox.max.x - frameBoundingBox.min.x;

            // Get the bounding box of the hanger
            const hangerBoundingBox = new THREE.Box3().setFromObject(hanger);
            const hangerCenter = hangerBoundingBox.getCenter(
              new THREE.Vector3()
            );
            const hangerLength =
              hangerBoundingBox.max.z - hangerBoundingBox.min.z;

            hanger.localToWorld(hangerBoundingBox.min);
            hanger.localToWorld(hangerBoundingBox.max);

            let removeHangerIcon = await getRemoveIcon(
              `removeHanger-${hangerType}`
            );

            // if (position) {
            //   hanger.position.x = frameCenter.x + position.x
            // }
            // else {
            //   hanger.position.x = frameCenter.x;
            // }
            hanger.position.x = frameCenter.x;

            removeHangerIcon.position.set(
              0, // Offset in world space
              hangerCenter.y,
              -hangerLength
            );
            // Adjust the hanger position based on the camera's z-axis position
            if (side == "Front") {
              hanger.rotation.y = Math.PI;
              if (
                golfClubNames.includes(hangerType) ||
                hangerType == "Hanger_Rail_Step"
              ) {
                hanger.position.z =
                  frame.position.z - hangerBoundingBox.max.z - 40; // Small offset in front of the frame
              } else {
                hanger.position.z =
                  frame.position.z - hangerBoundingBox.max.z / 2; // Small offset in front of the frame
              }
              // hanger.position.x = frame.position.x
            }

            removeHangerIcon.visible = false;
            hanger.add(removeHangerIcon);
            frame.attach(hanger);

            // Update removeHanger to always face the camera
            scene.onBeforeRender = function () {
              scene.traverse((obj) => {
                if (obj.name && obj.name.includes("remove")) {
                  obj.lookAt(camera.position);
                }
              });
            };

            if (position) {
              hanger.position.x = position.x;
            }

            params.hangerCount = params.hangerCount || {};
            params.hangerCount[hangerArrayKey] =
              params.hangerCount[hangerArrayKey] || 0;
            params.hangerCount[hangerArrayKey] += 1;

            let count = params.hangerCount[hangerArrayKey];
            hanger.hangerCount = count;
            hanger.hangerArrayKey = hangerArrayKey;

            // params.hangerAdded = params.hangerAdded || {};
            // params.hangerAdded[hangerArrayKey] = params.hangerAdded[hangerArrayKey] || {};
            // params.hangerAdded[hangerArrayKey][count] = hanger.position;

            // console.log('params.hangerCount', params.hangerCount);
            // console.log('params.hangerAdded', params.hangerAdded);

            await showHideNodes(modelGroup, scene, camera);
          } else {
            if (!lastside) {
              alert("There is not enough space to add this hanger.");
            }
            console.log("There is not enough space to add this hanger.");
          }
        } else {
          // alert('The slotted side is visible; cannot add hanger.');
        }
      }
    }
  }
}

export async function addRacks(
  modelGroup,
  rackType,
  rack_wooden_model,
  rack_glass_model,
  scene,
  camera,
  lastside = null,
  position = null
) {
  let selectedGroupName = params.selectedGroupName;
  let defaultModelName = setting[selectedGroupName].defaultModel;
  let selectedGroupModel = modelGroup.getObjectByName(selectedGroupName);
  let defaultModel = selectedGroupModel.getObjectByName(defaultModelName);
  let rack_model;
  if (rackType == "RackGlassShelf") {
    rack_model = rack_glass_model;
  } else if (rackType == "RackWoodenShelf") {
    rack_model = rack_wooden_model;
  }

  if (rack_model) {
    let rack_clone = rack_model.clone();
    let frame = defaultModel.getObjectByName("Frame");
    let rack = rack_clone.getObjectByName(defaultModelName);

    if (rack) {
      rack.name = rackType;

      // Get the Left_Ex_Slotted node
      let leftSideSlotted = frame.getObjectByName("Left_Ex_Slotted");
      let topExSide = frame.getObjectByName("Top_Ex");

      if (topExSide && leftSideSlotted && leftSideSlotted.visible) {
        let side;
        if (lastside) {
          side = lastside;
        } else {
          side = camera.position.z > 0 ? "Front" : "Back";
        }

        const rackPrefix =
          selectedGroupName + "-" + defaultModelName + "-" + side + "-"; // Prefix to match keys
        let rackArrayKey = rackPrefix + rackType;

        // Calculate the bounding box for the frame to find the center
        const topExSideBoundingBox = new THREE.Box3().setFromObject(topExSide);
        const topExSideCenter = topExSideBoundingBox.getCenter(
          new THREE.Vector3()
        ); // Get center of frame

        const boundingBox =
          params.calculateBoundingBox[defaultModelName][frame.name];

        // Now compute the bounding box relative to the world coordinates
        const rackBoundingBox = new THREE.Box3().setFromObject(rack);
        const rackCenter = rackBoundingBox.getCenter(new THREE.Vector3());
        const rackLength = rackBoundingBox.max.z - rackBoundingBox.min.z;

        rack.position.x = topExSideCenter.x; // Ensure it stays centered

        frame.attach(rack);

        let margin = 1;
        let gmargin = 20;

        if (side == "Front") {
          rack.position.z = boundingBox.max.z + rackLength / 2 + margin;
          rack.rotation.y = Math.PI;
          if (rack.name == "RackGlassShelf") {
            rack.position.z -= gmargin;
          }
        } else {
          rack.position.z = boundingBox.min.z - rackLength / 2 - margin;
          if (rack.name == "RackGlassShelf") {
            rack.position.z += gmargin;
          }
        }

        let removeRackIcon = await getRemoveIcon(`removeRack-${rackType}`);

        removeRackIcon.position.set(
          rackBoundingBox.max.x, // Offset in world space
          0,
          -rackBoundingBox.min.z + 1
        );
        removeRackIcon.visible = false;
        rack.add(removeRackIcon);

        if (position) {
          rack.position.y = position.y;
        }

        // Update removeRack to always face the camera
        scene.onBeforeRender = function () {
          scene.traverse((obj) => {
            if (obj.name && obj.name.includes("remove")) {
              obj.lookAt(camera.position);
            }
          });
        };

        params.rackCount = params.rackCount || {};
        params.rackCount[rackPrefix] = params.rackCount[rackPrefix] || 0;
        params.rackCount[rackArrayKey] += 1;

        let count = params.rackCount[rackArrayKey];
        rack.rackCount = count;
        rack.rackArrayKey = rackArrayKey;

        await showHideNodes(modelGroup, scene, camera);
      }
    }
  }
}

export async function saveModelData(name, dataToSave, modelId = 0) {
  // const model_data = dataToSave;
  dataToSave["action"] = "save_model_data";
  dataToSave["id"] = modelId || 0;
  dataToSave["name"] = name;

  const model_data = JSON.stringify(dataToSave);
  // console.log('model_data', model_data);

  fetch("api.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: model_data,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert("Model data saved successfully!");
      } else {
        alert("Error saving model data:", data.error);
      }
    })
    .catch((error) => console.error("Fetch error:", error));
}

export async function getModelData(id) {
  try {
    // Send model state to the backend
    const response = await fetch("api.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "get_model_data", id: id }), // Ensure data is stringified
    });

    const data = await response.json(); // Wait for the JSON response

    if (data.success) {
      console.log("Model fetch successfully!");
      return data.data; // Return the fetched data
    } else {
      console.error("No data found:");
      return null; // Return null if no data is found
    }
  } catch (error) {
    console.error("Fetch error:", error);
    return null; // Return null on error
  }
}

// Utility function to set opacity for a model and its children
export async function setModelOpacity(
  main_model,
  selectedModel,
  opacityForOthers = 0.5
) {
  main_model.traverse((child) => {
    if (child.isGroup) {
      // If it's the selected model, set full opacity
      if (child.name === selectedModel.name) {
        console.log("child.name", child.name);
        child.material.opacity = 1;
        child.material.emissive = new THREE.Color(0x00ff00); // Optional: Add glow-like effect
        child.material.emissiveIntensity = 0.5;
      } else {
        // Otherwise, reduce opacity for other models
        child.material.opacity = opacityForOthers;
        child.material.emissive = new THREE.Color(0x000000); // Reset any glow effect
        child.material.emissiveIntensity = 0;
      }

      child.material.transparent = true; // Ensure transparency is enabled
      child.material.needsUpdate = true;
    }
  });
}
async function takeAngleShots(
  modelGroup,
  camera,
  renderer,
  angleImages,
  scene
) {
  const camPosition = [camera.position.x, camera.position.y, camera.position.z];
  // Save the original size of the renderer for high-res images
  const originalWidth = renderer.domElement.width;
  const originalHeight = renderer.domElement.height;
  const scaleFactor = 3; // Increase resolution
  renderer.setSize(
    originalWidth * scaleFactor,
    originalHeight * scaleFactor,
    false
  );
  camera.aspect =
    (originalWidth * scaleFactor) / (originalHeight * scaleFactor);
  camera.updateProjectionMatrix();

  // Get the model's bounding box to determine its size
  const boundingBox = new THREE.Box3().setFromObject(modelGroup);
  const size = boundingBox.getSize(new THREE.Vector3());
  const center = boundingBox.getCenter(new THREE.Vector3());

  console.log("Model Size:", size); // Check if the size values are reasonable
  console.log("Model Center:", center);

  // Adjust camera distance based on model size (add a safety check for large values)
  let maxDim = Math.max(size.x, size.y, size.z);
  if (maxDim === 0 || isNaN(maxDim)) {
    maxDim = 1; // Fallback if the model size is too small or undefined
  }

  const cameraDistance = Math.min(maxDim * 2, size.x * 0.7); // Limit max camera distance

  // Define four dynamic angles based on the model's size
  const angles = [
    {
      x: cameraDistance,
      y: cameraDistance > 1000 ? 1000 : cameraDistance,
      z: cameraDistance * 0.7,
    }, // Front-Top-Right
    {
      x: -cameraDistance,
      y: cameraDistance > 1000 ? 1000 : cameraDistance,
      z: -cameraDistance * 0.7,
    }, // Back-Top-Left
    {
      x: 0,
      y: cameraDistance > 1000 ? 1000 : cameraDistance,
      z: cameraDistance,
    }, // Front-Top-Center
    {
      x: 0,
      y: cameraDistance > 1000 ? 1000 : cameraDistance,
      z: -cameraDistance,
    }, // Back-Top-Center
    {
      x: cameraDistance,
      y: cameraDistance > 1000 ? 1000 : cameraDistance,
      z: 0,
    }, // Right-Top-Center
  ];

  let counter = 1;
  const fetchPromises = angles.map((angle) =>
    captureScreenshot(angle.x, angle.y, angle.z, scene, angleImages, counter++)
  );

  await Promise.all(fetchPromises);

  // Revert the renderer back to its original size
  renderer.setSize(originalWidth, originalHeight, false);
  camera.aspect = originalWidth / originalHeight;
  camera.position.x = camPosition[0];
  camera.position.y = camPosition[1];
  camera.position.z = camPosition[2];
  camera.updateProjectionMatrix();

  // Re-render the scene at the original size
  renderer.render(scene, camera);

  async function captureScreenshot(
    angleX,
    angleY,
    angleZ,
    scene,
    angleImages,
    counter
  ) {
    // Rotate the camera around the model
    camera.position.set(angleX, angleY, angleZ);
    camera.lookAt(scene.position); // Ensure camera is looking at the model's position
    renderer.render(scene, camera);

    // Capture the screenshot from the current camera angle
    const screenshotData = renderer.domElement.toDataURL(); // Get screenshot as data URL
    const unixTime = Math.floor(Date.now() / 1000);

    // Optionally, download the screenshot
    // downloadScreenshot(
    //   screenshotData,
    //   `screenshot_angle_${angleX}_${angleY}_${angleZ}.png`
    // );
    // Send screenshot to PHP
    try {
      const response = await fetch("api.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: screenshotData,
          filename: `screenshot_angle_${unixTime}_${counter}.png`,
        }),
      });
      const data = await response.json();
      if (data.success) {
        angleImages[`Counter${counter}`] = data.path;
      } else {
        console.error("Error saving screenshot:", data.error);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }

  // Helper function to download the screenshot
  // function downloadScreenshot(dataUrl, filename) {
  //   const link = document.createElement("a");
  //   link.href = dataUrl;
  //   link.download = filename;
  //   link.click();
  // }
}

async function getModelMeasurement(
  model,
  heightMeasurementNames,
  modelMeasurement
) {
  const bbox = new THREE.Box3();
  model.traverse(async function (modelNode) {
    if (heightMeasurementNames.includes(modelNode.name)) {
      let isNodeVisible = modelNode.visible;
      if (isNodeVisible) {
        bbox.expandByObject(modelNode);
      }
    }
  });
  if (bbox) {
    let multiplier = 1;
    const min = bbox.min.clone();
    const max = bbox.max.clone();
    // Create width measurement group
    const width = max.x - min.x;
    modelMeasurement["width"] = `${width.toFixed(0) * multiplier}mm`;
    // Create height measurement group
    const height = max.y - min.y;
    modelMeasurement["height"] = `${height.toFixed(0) * multiplier}mm`;
    // Create depth measurement group
    const depth = max.z - min.z;
    modelMeasurement["depth"] = `${depth.toFixed(0) * multiplier}mm`;
  }
}

export async function savePdfData(
  name = "test",
  dataToSave,
  modelGroup,
  camera,
  renderer,
  scene
) {
  let modelMeasurementData = {};
  await traverseAsync(modelGroup, async (child) => {
    if (allModelNames.includes(child.name) && child.visible) {
      let modelMeasurement = {};
      await getModelMeasurement(
        child,
        heightMeasurementNames,
        modelMeasurement
      );
      // Check if the parent key exists; if not, create it as an object
      if (!modelMeasurementData[child.parent.name]) {
        modelMeasurementData[child.parent.name] = {};
      }
      // Assign the measurement data under the appropriate keys
      modelMeasurementData[child.parent.name][child.name] = modelMeasurement;
    }
  });

  // let angleImages = {};

  // await takeAngleShots(modelGroup, camera, renderer, angleImages, scene);

  // dataToSave["angleImages"] = ModelImageName;
  dataToSave["ModelData"] = modelMeasurementData;
  dataToSave["action"] = "save_Pdf_data";
  // dataToSave["id"] = modelId || 0;
  // dataToSave["name"] = name;
  // console.log(dataToSave);
  // return
  const pdf_data = JSON.stringify(dataToSave);
  fetch("api.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: pdf_data,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        console.log("Model data saved successfully!");
      } else {
        console.error("Error saving model data:", data.error);
      }
    })
    .catch((error) => console.error("Fetch error:", error));
}

async function saveModel(blob, filename) {
  if (blob) {
    await saveArrayBuffer(blob, filename); // Save the file only if blob is not null
  }
}

async function exportGLB(clone, name) {
  const gltfExporter = new GLTFExporter();
  const result = await gltfExporter.parseAsync(clone, { binary: true });
  const blob = new Blob([result], { type: "application/octet-stream" });
  await saveModel(blob, `${name}.glb`);
}

async function exportUSDZ(clone, name) {
  const usdzExporter = new USDZExporter();
  const result = await usdzExporter.parse(clone);
  const blob = new Blob([result], { type: "application/octet-stream" });
  await saveModel(blob, `${name}.usdz`);
}

export async function exportUsdz(model, name) {
  const clone = model.clone();

  // Scale the clone model proportionally
  const box = new THREE.Box3().setFromObject(clone);
  const size = new THREE.Vector3();
  box.getSize(size);
  // const scaleFactor = 1 / Math.min(size.x, size.y, size.z);
  // clone.scale.set(scaleFactor, scaleFactor, scaleFactor);
  // alert(scaleFactor);
  // clone.scale.multiplyScalar(0.001);
  clone.scale.set(0.001, 0.001, 0.001);
  clone.updateMatrixWorld();
  clone.position.set(0, 0, 0);

  // Detect device type and export accordingly
  const isIOS = /iPhone|iPad|iPod/.test(
    navigator.userAgent || navigator.vendor || window.opera
  );

  if (isIOS) {
    await exportUSDZ(clone, name); // Export USDZ for iOS devices
  } else {
    await exportGLB(clone, name); // Export only GLB for other devices
  }
}

async function saveArrayBuffer(blob, filename) {
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