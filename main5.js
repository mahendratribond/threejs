// Display loader progress
const loaderElement = document.getElementById("loader");
const progressBarFill = document.getElementById("progress-bar-fill");
const progressText = document.getElementById("progress-text");

let totalAssets = 5; // Number of primary assets to load
let assetsLoaded = 0; // Counter for loaded assets
let lastLoadTime = Date.now(); // Track the time taken between loads
let simulatedProgress = 0;
let speedMultiplier = 0.1; // Initial progress increment multiplier

// Function to dynamically adjust the progress increment based on loading speed
async function adjustSpeedMultiplier(loadTime) {
  const thresholdSlow = 2000; // Define a threshold for slow network (2 seconds per asset)
  const thresholdFast = 500; // Define a threshold for fast network (0.5 seconds per asset)

  if (loadTime > thresholdSlow) {
    speedMultiplier = 0.05; // Slow network, reduce progress speed
  } else if (loadTime < thresholdFast) {
    speedMultiplier = 0.2; // Fast network, increase progress speed
  } else {
    speedMultiplier = 0.1; // Normal speed
  }
}

// Function to gradually increase the progress bar for a smoother experience
async function simulateProgress() {
  if (simulatedProgress < 100) {
    simulatedProgress += speedMultiplier; // Dynamically adjust speed
    progressBarFill.style.width = `${simulatedProgress}%`;
    progressText.innerText = `Loading... ${Math.round(simulatedProgress)}%`;
    requestAnimationFrame(simulateProgress); // Continue animation until 100%
  } else {
    loaderElement.style.display = "none";
  }
}

await simulateProgress(); // Start smooth progress simulation

async function showTime(test) {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");
  const timeString = `${hours}:${minutes}:${seconds}`;
  console.log("timeString" + test + ":", timeString);
}

await showTime(0);

import * as THREE from "three";
// import Stats from 'three/addons/libs/stats.module.js';

// import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TransformControls } from "three/addons/controls/TransformControls.js";

import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { ColladaLoader } from "three/addons/loaders/ColladaLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import {
  drawMeasurementBoxesWithLabels,
  setupHeaderWoodenShelfModel,
  setupHeaderGlassShelfModel,
  setupGlassShelfFixingModel,
  cloneWithCustomProperties,
  setupHeader500HeightModel,
  setupHangerGolfClubModel,
  updateMeasurementGroups,
  setupSlottedSidesModel,
  generateGlassMaterial,
  setupWoodenRackModel,
  updateLabelOcclusion,
  findParentNodeByName,
  calculateBoundingBox,
  getCurrentModelSize,
  updateFrameMaterial,
  setupGlassRackModel,
  getNextVisibleChild,
  getPrevVisibleChild,
  computeBoundingBox,
  // getCustomDropdown,
  checkForCollision,
  setPositionCenter,
  initLabelRenderer,
  setupHangerModel,
  addAnotherModels,
  isVisibleParents,
  setTextureParams,
  updateFrameSize,
  centerMainModel,
  setupArrowModel,
  commonMaterial,
  setupMainModel,
  cleanModelName,
  loaderShowHide,
  traverseAsync,
  getRemoveIcon,
  checkMeshType,
  loadGLTFModel,
  showHideNodes,
  getModelSize,
  isHangerAdd,
  getNodeSize,
  setupModel,
  loadModel,
  getHex,
} from "./utils5.js";

import {
  heightMeasurementNames,
  baseFrameTextureNames,
  hangerStandBaseNodes,
  allFrameBorderNames,
  allOtherModelNames,
  hangerPartNames,
  frameTop1Names,
  frameMainNames,
  baseFrameNames,
  golfClubNames,
  rackPartNames,
  allModelNames,
  hangerNames,
  headerNames,
  rackNames,
  params,
  setting,

  // gui, stats,
  // renderer, scene, camera, controls, transformControls, raycaster, mouse, hangerIntersects, selectedNode,
  // cropper, topFramCropedImage, mainFramCropedImage,
  // texture_background,
  // main_model,
  // header_rod_model,
  // header_wooden_shelf_model,
  // header_500_height_model,
  // header_glass_shelf_fixing_model,
  // header_glass_shelf_model,
  // slotted_sides_model,
  // hanger_model,
  // hanger_golf_club_model,
  // golf_club,
  // rack_wooden_model,
  // rack_glass_model,
  // lights,
  // lightHelpers,
  // hangerArray,
} from "./config.js";

const container = document.getElementById("container");

// Select the elements by class instead of id
const frameSize = document.querySelector(".frameSize");
const topDropdown = document.querySelector(".topDropdown");
const baseColor = document.querySelector(".baseColor");
const shelfTypeDropdown = document.querySelector(".shelfTypeDropdown");
const headerOptions = document.querySelector(".headerOptions");
const headerSizeDropdown = document.querySelector(".headerSizeDropdown");
const headerRodToggle = document.querySelector(".headerRodToggle");
const headerRodColorDropdown = document.querySelector(
  ".headerRodColorDropdown"
);
const topFrameFileUpload = document.querySelector(".topFrameFileUpload");
const headerFrameColorInput = document.querySelector(".headerFrameColorInput");
const headerFrameColorDropdown = document.querySelector(
  ".headerFrameColorDropdown"
);
const slottedSidesToggle = document.querySelector(".slottedSidesToggle");
const mainFrameFileUpload = document.querySelector(".mainFrameFileUpload");
const mainFrameColorInput = document.querySelector(".mainFrameColorInput");
const baseSelectorDropdown = document.querySelector(".baseSelectorDropdown");
const hangerClothesToggle = document.querySelector(".hangerClothesToggle");
const hangerGolfClubsToggle = document.querySelector(".hangerGolfClubsToggle");
const hangerStandColor = document.querySelector(".hangerStandColor");
const rackShelfColor = document.querySelector(".rackShelfColor");
const rackStandColor = document.querySelector(".rackStandColor");

const addHanger = document.querySelectorAll(".addHanger");
const addAnotherModel = document.querySelectorAll(".addAnotherModel");
const addRack = document.querySelectorAll(".addRack");

const measurementToggle = document.getElementById("measurementToggle");
const captureButton = document.getElementById("captureButton");

const cropperContainer = document.getElementById("cropper-container");
const cropperImage = document.getElementById("cropper-image");
const cropButton = document.getElementById("crop-button");
const closeButton = document.getElementById("close-button");

const accordionModel = document.getElementById("accordionModel");
const moveLeftModel = document.getElementById("moveLeftModel");
const moveRightModel = document.getElementById("moveRightModel");

const zoomInButton = document.getElementById("cropper-zoom-in");
const zoomOutButton = document.getElementById("cropper-zoom-out");
const moveLeftButton = document.getElementById("cropper-move-left");
const moveRightButton = document.getElementById("cropper-move-right");
const moveUpButton = document.getElementById("cropper-move-up");
const moveDownButton = document.getElementById("cropper-move-down");
const rotateLeftButton = document.getElementById("cropper-rotate-left");
const rotateRightButton = document.getElementById("cropper-rotate-right");
const scaleXButton = document.getElementById("cropper-scale-x");
const scaleYButton = document.getElementById("cropper-scale-y");
const resetButton = document.getElementById("cropper-reset");

// Set up the loading manager
const manager = new THREE.LoadingManager();

// Initialize the loaders with the manager
const rgbeLoader = new RGBELoader(manager).setPath(
  "./assets/images/background/"
);
const TextureLoaderJpg = new THREE.TextureLoader(manager).setPath(
  "./assets/images/background/"
);
const borderTextureLoaderJpg = new THREE.TextureLoader(manager).setPath(
  "./assets/images/borders/"
);
const colladaLoader = new ColladaLoader(manager).setPath("./assets/models/");
const glftLoader = new GLTFLoader(manager).setPath("./assets/models/glb/");
const textureLoader = new THREE.TextureLoader(manager);
// const loader = new GLTFLoader();

let gui, stats;
let renderer,
  scene,
  camera,
  controls,
  transformControls,
  raycaster,
  mouse,
  direction,
  hangerIntersects,
  selectedNode,
  labelRenderer;
let cropper,
  topFramCropedImage,
  mainFramCropedImage,
  texture_background, //border_texture_material,
  main_model,
  header_rod_model,
  header_wooden_shelf_model,
  header_500_height_model,
  header_glass_shelf_fixing_model,
  header_glass_shelf_model,
  slotted_sides_model,
  hanger_model,
  hanger_golf_club_model,
  rack_wooden_model,
  rack_glass_model,
  arrow_model,
  modelGroup,
  backupMainModel;
const lights = [];
const lightHelpers = [];
const hangerArray = [];
window["shadow"] = await commonMaterial(0x444444);

// Start simulating progress when the window loads
window.addEventListener("load", async () => {
  try {
    loaderElement.style.display = "flex"; // Show the loader

    // Initialize the scene with the loaded resources
    await init().catch(function (err) {
      console.error(err);
    });
  } catch (error) {
    console.error("Error loading assets:", error);
    progressText.innerText = "Failed to load resources. Please try again.";
  }
});

// Set up real loading progress tracking
manager.onProgress = (url, itemsLoaded, itemsTotal) => {
  let currentLoadTime = Date.now(); // Capture time after asset load
  let loadDuration = currentLoadTime - lastLoadTime; // Calculate the duration
  adjustSpeedMultiplier(loadDuration); // Adjust speed based on load duration
  lastLoadTime = currentLoadTime;

  assetsLoaded = itemsLoaded;
  let actualProgress = (assetsLoaded / itemsTotal) * 100;
  if (simulatedProgress < actualProgress) {
    simulatedProgress = actualProgress; // Sync simulated progress with real progress
  }

  // console.log('url', url);
  // console.log('assetsLoaded', assetsLoaded);
  // console.log('totalAssets', totalAssets);

  if (assetsLoaded === totalAssets) {
    simulatedProgress = 100; // Ensure we finish at 100%
  }
};

// Hide the loader once all items are loaded
manager.onLoad = () => {
  // loaderElement.style.display = 'none';
  console.log("All assets loaded");
};

// Error handling
manager.onError = (url) => {
  console.error(`There was an error loading ${url}`);
  progressText.innerText = "Failed to load some resources. Please try again.";
};

async function init() {
  texture_background = await TextureLoaderJpg.loadAsync("background.png");

  window["border_texture_material"] = new THREE.MeshPhongMaterial({
    // specular: 3355443,
    specular: new THREE.Color(0x111111),
    map: texture_background,
    // shininess: 0.5,
    shininess: 30,
  });

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(render);

  container.appendChild(renderer.domElement);

  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = params.exposure;

  scene = new THREE.Scene();
  scene.backgroundBlurriness = params.blurriness;
  texture_background.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture_background;
  scene.environment = texture_background;

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  direction = new THREE.Vector3(); // Initialize direction vector

  await lightSetup();

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    500000
  );

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  camera.position.x = 2000;
  camera.position.y = 1000;
  camera.position.z = 2000;

  controls = new OrbitControls(camera, renderer.domElement);
  controls.maxPolarAngle = Math.PI / 2; // Adjust the value as needed
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;
  controls.screenSpacePanning = false;

  modelGroup = new THREE.Group();
  scene.add(modelGroup);

  main_model = await loadGLTFModel(glftLoader, params.defaultModel + ".glb");
  main_model.name = "main_model";
  await setupMainModel(main_model);
  await updateFrameMaterial(
    main_model,
    "frame",
    "color",
    params.allBorderColor
  );
  // scene.add(main_model);
  modelGroup.add(main_model);
  await showHideNodes(main_model, scene, camera);

  for (let val of allModelNames) {
    let model_name = val + ".glb";
    let already_added = main_model.getObjectByName(val);
    if (!already_added) {
      let model_load = await loadGLTFModel(glftLoader, model_name);
      await setupMainModel(model_load);
      let model = model_load.getObjectByName(val);
      model.visible = false;
      await updateFrameMaterial(model, "frame", "color", params.allBorderColor);
      main_model.add(model);
    }
  }

  await showHideNodes(main_model, scene, camera);
  backupMainModel = main_model.clone();

  // Transform controls
  transformControls = new TransformControls(camera, renderer.domElement);
  transformControls.addEventListener("dragging-changed", (event) => {
    controls.enabled = !event.value;
  });
  scene.add(transformControls);

  // Add event listeners
  window.addEventListener("mousemove", onMouseMove, false);
  window.addEventListener("click", onMouseClick, false);
  window.addEventListener("resize", onWindowResize);

  await loaderShowHide(false);
  // const boundingBox = await computeBoundingBox(main_model, allModelNames);
  // const updatedCenter = boundingBox.getCenter(new THREE.Vector3());
  // main_model.position.sub(updatedCenter);
  await calculateBoundingBox(main_model);
  await otherModelSetup();
  await updateFrameSize(main_model, scene, camera);
  await showHideNodes(main_model, scene, camera);
  await setupMainModel(main_model);

  main_model.traverse(async function (modelNode) {
    if (allModelNames.includes(modelNode.name)) {
      modelNode.traverse(async function (child) {
        if (
          frameTop1Names.includes(child.name) ||
          frameMainNames.includes(child.name)
        ) {
          if (child.isMesh && child.material) {
            params.lastInnerMaterial[modelNode.name] =
              params.lastInnerMaterial[modelNode.name] || {};
            params.lastInnerMaterial[modelNode.name][child.name] =
              child.material;
          }
        }
      });
    }
  });

  if (!hanger_golf_club_model) {
    hanger_golf_club_model = await loadGLTFModel(
      glftLoader,
      "hanger_golf_club_model.glb"
    );
    // hanger_golf_club_model = await loadModel(colladaLoader, 'hanger_golf_club_model.dae');
    await setupHangerGolfClubModel(hanger_golf_club_model);
  }
  if (!hanger_model) {
    console.log("hanger_model lodeding");
    hanger_model = await loadGLTFModel(glftLoader, "hanger_model.glb");
    console.log("hanger_model loded", hanger_model);
    // hanger_model = await loadModel(colladaLoader, 'hanger_model.dae');
    await setupHangerModel(hanger_model);
    console.log("hanger_model update", hanger_model);
  }
  if (!rack_glass_model) {
    rack_glass_model = await loadGLTFModel(glftLoader, "rack_glass_model.glb");
    // rack_glass_model = await loadModel(colladaLoader, 'rack_glass_model.dae');
    await setupGlassRackModel(rack_glass_model, texture_background);
  }
  if (!rack_wooden_model) {
    rack_wooden_model = await loadGLTFModel(
      glftLoader,
      "rack_wooden_model.glb"
    );
    // rack_wooden_model = await loadModel(colladaLoader, 'rack_wooden_model.dae');
    // console.log('hanger_model', hanger_model)
    await setupWoodenRackModel(rack_wooden_model);
  }

  labelRenderer = await initLabelRenderer();
  document.body.appendChild(labelRenderer.domElement);
}

// Handle mouse move for hover
async function otherModelSetup() {
  if (!arrow_model) {
    arrow_model = await loadGLTFModel(glftLoader, "arrow_model.glb");
    // header_rod_model = await loadModel(colladaLoader, 'arrow_model.dae');
    await setupArrowModel(main_model, arrow_model);
  }
  if (!header_rod_model) {
    header_rod_model = await loadGLTFModel(glftLoader, "header_rod_model.glb");
    // header_rod_model = await loadModel(colladaLoader, 'header_rod_model.dae');
    params.rodSize = await getNodeSize(header_rod_model);
    // console.log('params.rodSize', params.rodSize)
  }
  if (!header_glass_shelf_fixing_model) {
    header_glass_shelf_fixing_model = await loadGLTFModel(
      glftLoader,
      "header_glass_shelf_fixing_model.glb"
    );
    // header_glass_shelf_fixing_model = await loadModel(colladaLoader, 'header_glass_shelf_fixing_model.dae');
    params.glassShelfFixingSize = await getNodeSize(
      header_glass_shelf_fixing_model
    );
    await setupGlassShelfFixingModel(
      main_model,
      header_rod_model,
      header_glass_shelf_fixing_model
    );
  }
  if (!header_500_height_model) {
    header_500_height_model = await loadGLTFModel(
      glftLoader,
      "header_500_height_model.glb"
    );
    // header_500_height_model = await loadModel(colladaLoader, 'header_500_height_model.dae');
    await setupHeader500HeightModel(main_model, header_500_height_model);
    await updateMaterial(params.allBorderColor, "frame");
  }
  if (!header_wooden_shelf_model) {
    header_wooden_shelf_model = await loadGLTFModel(
      glftLoader,
      "header_wooden_shelf_model.glb"
    );
    // header_wooden_shelf_model = await loadModel(colladaLoader, 'header_wooden_shelf_model.dae');
    await setupHeaderWoodenShelfModel(main_model, header_wooden_shelf_model);
    await updateMaterial(params.defaultShelfColor, "shelf");
  }
  if (!header_glass_shelf_model) {
    header_glass_shelf_model = await loadGLTFModel(
      glftLoader,
      "header_glass_shelf_model.glb"
    );
    // header_glass_shelf_model = await loadModel(colladaLoader, 'header_glass_shelf_model.dae');
    await setupHeaderGlassShelfModel(
      main_model,
      header_glass_shelf_model,
      texture_background
    );
  }
  if (!slotted_sides_model) {
    slotted_sides_model = await loadGLTFModel(
      glftLoader,
      "slotted_sides_model.glb"
    );
    // slotted_sides_model = await loadModel(colladaLoader, 'slotted_sides_model.dae');
    await setupSlottedSidesModel(main_model, slotted_sides_model);
    await updateMaterial(params.allBorderColor, "frame");
  }
}

// Handle mouse move for hover
async function onMouseMove(event) {
  // Calculate mouse position in normalized device coordinates (-1 to +1 for both axes)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update the raycaster with the camera and mouse position
  raycaster.setFromCamera(mouse, camera);
  const visibleObjects = [];

  // Traverse the main model and find visible objects
  main_model.traverse((child) => {
    if (hangerNames.includes(child.name) && child.visible) {
      visibleObjects.push(child);
    }
    if (rackNames.includes(child.name) && child.visible) {
      visibleObjects.push(child);
    }
    // Check for allModelNames and allOtherModelNames as well
    if (allModelNames.includes(child.name) && child.visible) {
      visibleObjects.push(child);
    }
    // if (allOtherModelNames.includes(child.name) && child.visible) {
    //     visibleObjects.push(child);
    // }
  });

  // Now check if parents are visible (using async outside of traverse)
  const finalVisibleObjects = [];
  for (const child of visibleObjects) {
    if (await isVisibleParents(child.parent)) {
      finalVisibleObjects.push(child);
    }
  }

  // Find intersections with the main_model
  hangerIntersects = raycaster.intersectObjects(finalVisibleObjects, true);
  // console.log('main_model', main_model);
}

// Handle mouse click for selection
async function onMouseClick(event) {
  // console.log('hangerIntersects', hangerIntersects);
  let defaultModelName =
    params.selectedModelName !== "default"
      ? params.selectedModelName
      : params.defaultModel;
  let defaultModel = main_model.getObjectByName(defaultModelName);
  if (hangerIntersects.length > 0) {
    hideRemoveIcons();
    const intersectNode = hangerIntersects[0].object;
    if (intersectNode) {
      // console.log('intersectNode', intersectNode)
      selectedNode = intersectNode.parent;
      let iconName = selectedNode.name;

      if (iconName.startsWith("removeHanger-")) {
        let nodeName = iconName.replace("removeHanger-", "");
        let hangerToRemove = await findParentNodeByName(selectedNode, nodeName);
        let hangerArrayKey = hangerToRemove.hangerArrayKey || null;
        if (hangerToRemove) {
          let frame = defaultModel.getObjectByName("Frame");
          transformControls.detach();
          frame.remove(hangerToRemove);
        }
        if (hangerArrayKey) {
          hangerArray[hangerArrayKey] -= 1;
        }
      } else if (iconName.startsWith("removeRack-")) {
        let nodeName = iconName.replace("removeRack-", "");
        let hangerToRemove = await findParentNodeByName(selectedNode, nodeName);
        if (hangerToRemove) {
          let frame = defaultModel.getObjectByName("Frame");
          transformControls.detach();
          frame.remove(hangerToRemove);
        }
      } else if (
        hangerPartNames.includes(selectedNode.name) ||
        hangerNames.includes(selectedNode.name)
      ) {
        let tempNode, selectedHangerNode;

        for (let val of hangerNames) {
          tempNode = await findParentNodeByName(selectedNode, val, true);
          if (tempNode) {
            selectedHangerNode = tempNode;
            break;
          }
        }
        if (selectedHangerNode) {
          selectedNode = selectedHangerNode;
          let removeHanger = selectedNode.getObjectByName(
            "removeHanger-" + selectedNode.name
          );
          if (removeHanger) {
            removeHanger.visible = true;
          }
          // console.log('selectedNode', selectedNode)

          // Attach transform controls to the selected node
          transformControls.attach(selectedNode);
          transformControls.setMode("translate"); // Set the mode to 'translate' for moving

          // Configure to show only X-axis control and allow movement only on X-axis
          transformControls.showX = true; // Show only X-axis arrow
          transformControls.showY = false; // Hide Y-axis arrow
          transformControls.showZ = false; // Hide Z-axis arrow

          // Add event listener to enforce boundary check during movement
          transformControls.addEventListener(
            "objectChange",
            enforceHangerBounds
          );
        }
      } else if (
        rackPartNames.includes(selectedNode.name) ||
        rackNames.includes(selectedNode.name)
      ) {
        let tempNode, selectedRackNode;

        for (let val of rackNames) {
          tempNode = await findParentNodeByName(selectedNode, val, true);
          if (tempNode) {
            selectedRackNode = tempNode;
            break;
          }
        }
        if (
          !selectedRackNode &&
          rackNames.includes(selectedNode.name) &&
          (await isVisibleParents(selectedNode))
        ) {
          selectedRackNode = selectedNode;
        }
        if (selectedRackNode) {
          selectedNode = selectedRackNode;
          let removeRack = selectedNode.getObjectByName(
            "removeRack-" + selectedNode.name
          );
          if (removeRack) {
            removeRack.visible = true;
          }
          // Attach transform controls to the selected node
          transformControls.attach(selectedNode);
          transformControls.setMode("translate"); // Set the mode to 'translate' for moving
          transformControls.translationSnap = 3.139;

          // Configure to show only X-axis control and allow movement only on X-axis
          transformControls.showX = false; // Show only X-axis arrow
          transformControls.showY = true; // Hide Y-axis arrow
          transformControls.showZ = false; // Hide Z-axis arrow

          // Add event listener to enforce boundary check during movement
          transformControls.addEventListener("objectChange", enforceRackBounds);
        }
      } else {
        hideRemoveIcons();
      }
    } else {
      hideRemoveIcons();
    }
  } else {
    hideRemoveIcons();
  }
}

// Function to hide remove icons
function hideRemoveIcons() {
  if (main_model && selectedNode) {
    main_model.traverse((child) => {
      if (child.name && child.name.includes("remove")) {
        child.visible = false; // Hide remove icon
      }
    });
    transformControls.detach();
    selectedNode = null;

    transformControls.removeEventListener("objectChange", enforceHangerBounds);
    transformControls.removeEventListener("objectChange", enforceRackBounds);
    // Check if clicked on allModelNames or allOtherModelNames
  }
}

// Function to enforce boundaries on X-axis
async function enforceHangerBounds() {
  if (selectedNode) {
    let tempNode, defaultModel;

    for (let val of allModelNames) {
      tempNode = await findParentNodeByName(selectedNode, val, true);
      if (tempNode) {
        defaultModel = tempNode;
        break;
      }
    }

    // let defaultModelName = params.selectedModelName !== 'default' ? params.selectedModelName : params.defaultModel;
    // let defaultModel = main_model.getObjectByName(selectedHangerNode);
    if (defaultModel) {
      console.log("defaultModel", defaultModel);
      defaultModel.traverse((child) => {
        if (child.isMesh && child.geometry) {
          child.geometry.computeBoundingBox();
        }
      });

      let frame = defaultModel.getObjectByName("Top_Ex");

      const worldPosition = new THREE.Vector3();
      frame.getWorldPosition(worldPosition);

      const frameBox = new THREE.Box3().setFromObject(frame);
      const framecenter = frameBox.getCenter(new THREE.Vector3());
      console.log("defaultModel", defaultModel);
      console.log("frame", frame);
      // console.log('frameBox', frameBox)
      console.log("frameBox.min", frameBox.min);
      console.log("frameBox.max", frameBox.max);
      console.log("framecenter", framecenter);
      console.log("World Position:", worldPosition);

      let minX = frameBox.min.x + frame.position.x - worldPosition.x;
      let maxX = frameBox.max.x + frame.position.x - worldPosition.x;
      let selectedChildNode = selectedNode.getObjectByName("Hanger_Stand");

      // const selectedChildWorldPosition = new THREE.Vector3();
      // selectedChildNode.getWorldPosition(selectedChildWorldPosition);

      const nodeBoundingBox = new THREE.Box3().setFromObject(selectedChildNode);
      const nodeWidth = nodeBoundingBox.max.x - nodeBoundingBox.min.x;

      // const margin = 20;
      // const adjustedMinX = frameBox.min.x + selectedChildNode.position.x + (nodeWidth / 2) + params.frameTopExMargin;
      // const adjustedMaxX = frameBox.max.x - selectedChildNode.position.x - (nodeWidth / 2) - params.frameTopExMargin;

      const adjustedMinX = minX + nodeWidth / 2 + params.frameTopExMargin;
      const adjustedMaxX = maxX - nodeWidth / 2 - params.frameTopExMargin;

      const position = selectedNode.position;
      console.log("selectedChildNode", selectedChildNode);
      console.log("nodeWidth", nodeWidth);
      console.log("nodeBoundingBox", nodeBoundingBox);
      console.log("adjustedMinX", adjustedMinX);
      console.log("adjustedMaxX", adjustedMaxX);

      // If the node is trying to move past the minX or maxX boundary, set its position to the boundary
      if (position.x < adjustedMinX) {
        position.x = adjustedMinX;
      } else if (position.x > adjustedMaxX) {
        position.x = adjustedMaxX;
      } else {
        // If within bounds, ensure position is properly centered
        position.x = THREE.MathUtils.clamp(
          position.x,
          adjustedMinX,
          adjustedMaxX
        );
      }
      console.log("Final position.x", position.x);
    }
  }
}

// Function to enforce boundaries on X-axis
async function enforceRackBounds() {
  if (selectedNode) {
    let defaultModelName =
      params.selectedModelName !== "default"
        ? params.selectedModelName
        : params.defaultModel;
    let defaultModel = main_model.getObjectByName(defaultModelName);
    // let defaultModel = main_model.getObjectByName(params.defaultModel);
    let baseFrame = defaultModel.getObjectByName("Base_Solid");
    let leftSlottedFrame = defaultModel.getObjectByName("Left_Ex_Slotted");
    const baseFrameBox = new THREE.Box3().setFromObject(baseFrame);
    const leftSlottedFrameBox = new THREE.Box3().setFromObject(
      leftSlottedFrame
    );
    // const boundingBox = params.calculateBoundingBox[params.defaultModel]['Frame'];

    const min = leftSlottedFrameBox.min.clone();
    const max = leftSlottedFrameBox.max.clone();
    const leftSlottedFrameHeight = max.y - min.y;
    const baseFrameHeight = baseFrameBox.max.y - baseFrameBox.min.y;

    let minY = min.y;
    let maxY = max.y + leftSlottedFrame.position.y;
    const nodeBoundingBox = new THREE.Box3().setFromObject(selectedNode);
    const nodeHeight = nodeBoundingBox.max.y - nodeBoundingBox.min.y;

    const margin = 10;

    const adjustedMinY = minY - nodeHeight / 2 - baseFrameHeight - 50;
    const adjustedMaxY = maxY - nodeHeight / 2 + baseFrameHeight + 25;

    const position = selectedNode.position;

    // If the node is trying to move past the minY or maxY boundary, set its position to the boundary
    if (position.y < adjustedMinY) {
      position.y = adjustedMinY;
    } else if (position.y > adjustedMaxY) {
      position.y = adjustedMaxY;
    }

    // console.log('adjustedMinY', adjustedMinY)
    // console.log('nodeHeight', nodeHeight)
    // console.log('leftSlottedFrameHeight', leftSlottedFrameHeight)
    // console.log('baseFrameHeight', baseFrameHeight)
    // console.log('baseFrameBox', baseFrameBox)
    // console.log('nodeBoundingBox', nodeBoundingBox)
  }
}

// Function to enforce boundaries on X-axis
async function enforceRackBounds1() {
  if (selectedNode) {
    let defaultModel = main_model.getObjectByName(params.defaultModel);
    let baseFrame = defaultModel.getObjectByName("Base_Solid");
    let leftSlottedFrame = defaultModel.getObjectByName("Left_Ex_Slotted");
    const baseFrameBox = new THREE.Box3().setFromObject(baseFrame);
    const leftSlottedFrameBox = new THREE.Box3().setFromObject(
      leftSlottedFrame
    );

    const min = leftSlottedFrameBox.min.clone();
    const max = leftSlottedFrameBox.max.clone();
    const leftSlottedFrameHeight = max.y - min.y;
    const baseFrameHeight = baseFrameBox.max.y - baseFrameBox.min.y;

    let minY = min.y;
    let maxY = max.y;
    // let minY = min.y - leftSlottedFrame.position.y;
    // let maxY = max.y + leftSlottedFrame.position.y;
    const nodeBoundingBox = new THREE.Box3().setFromObject(selectedNode);
    const nodeHeight = nodeBoundingBox.max.y - nodeBoundingBox.min.y;

    const margin = 0.5;

    const adjustedMinY = minY; //- params.cameraPosition  //- 0.5;
    const adjustedMaxY = maxY; //- params.cameraPosition // + margin;
    // const adjustedMinY = minY - nodeHeight  - 0.5;
    // const adjustedMaxY = maxY + nodeHeight  + margin;

    const position = selectedNode.position;

    // If the node is trying to move past the minY or maxY boundary, set its position to the boundary
    if (position.y < adjustedMinY) {
      position.y = adjustedMinY;
    } else if (position.y > adjustedMaxY) {
      position.y = adjustedMaxY;
    }

    // console.log('selectedNode', selectedNode)
    // console.log('minY', minY)
    // console.log('maxY', maxY)
    // console.log('adjustedMinY', adjustedMinY)
    // console.log('adjustedMaxY', adjustedMaxY)
    // console.log('position', position.y)
    // console.log('leftSlottedFrame', leftSlottedFrame)
    // console.log('nodeHeight', nodeHeight)
    // console.log('leftSlottedFrameHeight', leftSlottedFrameHeight)
    // console.log('baseFrameHeight', baseFrameHeight)
    // console.log('baseFrameBox', baseFrameBox)
    // console.log('nodeBoundingBox', nodeBoundingBox)
  }
}

async function lightSetup() {
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
    scene.remove(light);
    light.dispose(); // Optional: Dispose of light resources
  });
  lightHelpers.forEach((helper) => {
    scene.remove(helper);
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
    scene.add(targetObject);

    directionalLight.target = targetObject;
    directionalLight.target.updateMatrixWorld();

    scene.add(directionalLight);
    lights.push(directionalLight);

    const directionalLightHelper = new THREE.DirectionalLightHelper(
      directionalLight,
      5
    );
    // scene.add(directionalLightHelper);
    lightHelpers.push(directionalLightHelper);
  }
}

async function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

async function render() {
  // await drawMeasurementBoxesWithLabels(main_model, scene, camera)
  await updateMeasurementGroups(main_model, scene, camera);
  await updateLabelOcclusion(scene, camera, raycaster, direction);

  controls.update();
  renderer.render(scene, camera);
  if (labelRenderer) {
    labelRenderer.render(scene, camera); // CSS2D rendering
  }
}

async function setMainFrameCropedImage() {
  let defaultModelName =
    params.selectedModelName !== "default"
      ? params.selectedModelName
      : params.defaultModel;

  if (mainFramCropedImage && mainFramCropedImage[defaultModelName]) {
    const mainFrameBackgroundColor = await getHex(
      setting[params.selectedModelName].mainFrameBackgroundColor
    );
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = mainFramCropedImage[defaultModelName].width;
    tempCanvas.height = mainFramCropedImage[defaultModelName].height;
    const ctx = tempCanvas.getContext("2d");

    // Draw the background color
    ctx.fillStyle = mainFrameBackgroundColor;
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Draw the cropped image on top
    ctx.drawImage(mainFramCropedImage[defaultModelName], 0, 0);

    tempCanvas.toBlob(async (blob) => {
      const url = URL.createObjectURL(blob);
      const texture = new THREE.TextureLoader().load(url, async function () {
        await updateMainFrameImageTexture(texture);
      });
      await closeCropper();
    });
  } else {
    const mainFrameBackgroundColor = await getHex(
      setting[params.selectedModelName].mainFrameBackgroundColor
    );
    main_model.traverse(async function (child) {
      if (frameMainNames.includes(child.name)) {
        child.material.color.set(mainFrameBackgroundColor);
        child.material.needsUpdate = true;
      }
    });
  }
}

async function setTopFrameCropedImage() {
  let defaultModelName =
    params.selectedModelName !== "default"
      ? params.selectedModelName
      : params.defaultModel;
  let defaultHeaderSize = setting[params.selectedModelName].defaultHeaderSize;

  if (
    topFramCropedImage &&
    topFramCropedImage[defaultModelName][defaultHeaderSize]
  ) {
    const topFrameBackgroundColor = await getHex(
      setting[params.selectedModelName].topFrameBackgroundColor
    );
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width =
      topFramCropedImage[defaultModelName][defaultHeaderSize].width;
    tempCanvas.height =
      topFramCropedImage[defaultModelName][defaultHeaderSize].height;
    const ctx = tempCanvas.getContext("2d");

    // Draw the background color
    ctx.fillStyle = topFrameBackgroundColor;
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Draw the cropped image on top
    ctx.drawImage(
      topFramCropedImage[defaultModelName][defaultHeaderSize],
      0,
      0
    );

    tempCanvas.toBlob(async (blob) => {
      const url = URL.createObjectURL(blob);
      const texture = new THREE.TextureLoader().load(url, async function () {
        await updateTopFrameImageTexture(texture);
      });
      await closeCropper();
    });
  } else {
    const topFrameBackgroundColor = await getHex(
      setting[params.selectedModelName].topFrameBackgroundColor
    );
    main_model.traverse(async function (child) {
      if (frameTop1Names.includes(child.name)) {
        child.material.color.set(topFrameBackgroundColor);
        child.material.needsUpdate = true;
      }
    });
  }
}

async function updateMainFrameImageTexture(texture) {
  let defaultModelName =
    params.selectedModelName !== "default"
      ? params.selectedModelName
      : params.defaultModel;
  const currentModel = main_model.getObjectByName(defaultModelName);
  const frame = currentModel.getObjectByName("Frame");
  if (frame) {
    frame.traverse(async function (child) {
      await setUploadedTexture(child, texture, frameMainNames);
    });
  }
}

async function updateTopFrameImageTexture(texture) {
  let defaultModelName =
    params.selectedModelName !== "default"
      ? params.selectedModelName
      : params.defaultModel;
  let defaultHeaderSize = setting[params.selectedModelName].defaultHeaderSize;
  const currentModel = main_model.getObjectByName(defaultModelName);
  // currentModel.traverse(function (modelNode) {
  const header = currentModel.getObjectByName(defaultHeaderSize);
  if (header) {
    header.traverse(async function (child) {
      await setUploadedTexture(child, texture, frameTop1Names);
    });
  }

  // });
}

async function setUploadedTexture(mesh, texture, frameNames) {
  texture = await setTextureParams(texture);
  texture.flipY = false;

  if (frameNames.includes(mesh.name)) {
    // Check if the mesh is a mesh
    if (mesh.isMesh) {
      var met = mesh.material.clone();
      met.map = texture;
      met.map.wrapS = THREE.RepeatWrapping;
      met.map.wrapT = THREE.RepeatWrapping;
      met.needsUpdate = true;

      mesh.material = met;
      mesh.needsUpdate = true;
    }
  }
}

async function updateUploadedTexture(mesh, texture, frameNames) {
  texture = await setTextureParams(texture);

  if (frameNames.includes(mesh.name)) {
    // Check if the mesh is a mesh
    if (mesh.isMesh) {
      // Clone the geometry and material if not already unique
      if (!mesh.userData.isUnique) {
        mesh.geometry = mesh.geometry.clone();
        mesh.material = mesh.material.map((mat) => mat.clone());
        mesh.userData.isUnique = true; // Mark this node as having unique instances
      }

      // // Loop through each material and update the texture
      mesh.material.forEach((material) => {
        material.map = texture;
        material.needsUpdate = true; // Update the material
      });
    }
  }
}

async function updateTexture(mesh, texture, frameNames) {
  texture = await setTextureParams(texture);

  // texture.repeat.set(10, 10);
  if (mesh.isMesh) {
    if (frameNames.includes(mesh.name)) {
      // console.log(mesh.name)
      if (Array.isArray(mesh.material)) {
        // If the mesh has multiple materials
        mesh.material.forEach((mat) => {
          mat.map = texture;
          mat.map.wrapS = THREE.RepeatWrapping;
          mat.map.wrapT = THREE.RepeatWrapping;
          mat.needsUpdate = true;
        });
      } else {
        // If the mesh has a single material
        mesh.material.map = texture;
        mesh.material.map.wrapS = THREE.RepeatWrapping;
        mesh.material.map.wrapT = THREE.RepeatWrapping;
        mesh.material.needsUpdate = true;
      }
    }
  }
}

// Function to update texture or color on selection
async function updateMaterial(value, dropdownType, selectedModel = "default") {
  // console.log('value', value)
  let type, imageUrl, displayText;
  if (dropdownType === "frame") {
    params.allBorderColor = value;
  } else if (dropdownType === "shelf") {
    params.defaultShelfColor = value;
  }
  // console.log('selectedModel', selectedModel)

  // const customDropdownButton = document.querySelector(`.custom-dropdown[data-type=${dropdownType}]`);
  const customDropdownButton = document.querySelector(
    `.accordion-item[data-model=${selectedModel}] .custom-dropdown[data-type=${dropdownType}]`
  );
  // console.log('customDropdownButton', customDropdownButton)
  // Reset selected class
  // document.querySelectorAll(".dropdown-item").forEach(function (el) {
  customDropdownButton
    .querySelectorAll(`.dropdown-item`)
    .forEach(function (el) {
      el.classList.remove("selected");
    });

  // Find the matching element and add the selected class
  customDropdownButton
    .querySelectorAll(`.dropdown-item`)
    .forEach(function (element) {
      // console.log('element', element.getAttribute("data-value"))
      if (element.getAttribute("data-value") === value) {
        // console.log('yes', value)
        let accordion = customDropdownButton.closest(`.accordion-item`);
        selectedModel = accordion.getAttribute(`data-model`);
        type = element.getAttribute("data-type");
        imageUrl = type === "texture" ? element.querySelector("img").src : "";
        displayText = element.querySelector("span").innerText;
        element.classList.add("selected");
      }
    });

  // console.log('value', value)
  // console.log('type', type)
  // console.log('displayText', displayText)

  await updateFrameMaterial(main_model, dropdownType, type, value);

  // Update dropdown button with selected image/color and name
  const dropdownButton = customDropdownButton.querySelector(
    `.accordion-item[data-model=${selectedModel}] .dropdown-button`
  );
  if (dropdownButton) {
    const selectedImage = dropdownButton.querySelector(".selected-image");
    const selectedText = dropdownButton.querySelector("span");
    if (selectedImage) {
      if (type === "texture") {
        selectedImage.src = imageUrl;
        selectedImage.style.display = "inline-block"; // Show image
      } else if (type === "color") {
        selectedImage.style.display = "none"; // Hide image for color
      }
    }

    if (selectedText && displayText) {
      selectedText.innerText = displayText;
    }
  }

  if (dropdownType === "frame") {
    if (type && type == "color" && value && value == "0xffffff") {
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
    } else {
      renderer.toneMapping = THREE.AgXToneMapping;
    }
    await lightSetup();
  }
  // console.log(main_model)
}

async function closeCropper() {
  cropperContainer.style.display = "none";
  document.body.classList.remove("modal-open");
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
  topFrameFileUpload.value = "";
  mainFrameFileUpload.value = "";
}

// Event listeners for controls
if (frameSize) {
  frameSize.value = params.defaultModel;
  // frameSize.addEventListener("change", async function (event) {
  document.addEventListener("change", async function (event) {
    if (event.target.classList.contains("frameSize")) {
      params.defaultModel = event.target.value;
      await loaderShowHide(true);
      await updateFrameSize(main_model, scene, camera);
      await lightSetup();
      await loaderShowHide(false);
      await centerMainModel(modelGroup, allModelNames);
    }
  });
}

if (topDropdown) {
  topDropdown.value = params.topOption;
  document.addEventListener("change", async function (event) {
    if (event.target.classList.contains("topDropdown")) {
      console.log(
        "setting[params.selectedModelName]",
        setting[params.selectedModelName]
      );
      console.log("params.selectedModelName", params.selectedModelName);
      setting[params.selectedModelName].topOption = event.target.value;
      setting[params.selectedModelName].headerRodToggle = false;
      if (
        setting[params.selectedModelName].topOption == "Header_Wooden_Shelf"
      ) {
        setting[params.selectedModelName].headerRodToggle = true;
      }

      headerRodToggle.checked =
        setting[params.selectedModelName].headerRodToggle;
      await loaderShowHide(true);
      await otherModelSetup();
      await loaderShowHide(false);
      await showHideNodes(main_model, scene, camera);
    }
    // You can add similar event handlers for other elements here
  });
}

if (headerOptions) {
  headerOptions.value = params.headerOptions;
  document.addEventListener("change", async function (event) {
    if (event.target.classList.contains("headerOptions")) {
      setting[params.selectedModelName].headerOptions = event.target.value;
      await loaderShowHide(true);
      await otherModelSetup();
      await loaderShowHide(false);
      await showHideNodes();
    }
  });
}

if (headerSizeDropdown) {
  headerSizeDropdown.value = params.defaultHeaderSize;
  document.addEventListener("change", async function (event) {
    if (event.target.classList.contains("headerSizeDropdown")) {
      setting[params.selectedModelName].defaultHeaderSize = event.target.value;
      await loaderShowHide(true);
      await otherModelSetup();
      await loaderShowHide(false);
      await showHideNodes(main_model, scene, camera);
    }
  });
}

if (headerRodToggle) {
  headerRodToggle.checked = params.headerRodToggle;
  document.addEventListener("change", async function (event) {
    if (event.target.classList.contains("headerRodToggle")) {
      setting[params.selectedModelName].headerRodToggle = event.target.checked;
      await loaderShowHide(true);
      await otherModelSetup();
      await loaderShowHide(false);
      await showHideNodes(main_model, scene, camera);
    }
  });
}

if (headerRodColorDropdown) {
  headerRodColorDropdown.value = params.rodFrameColor;
  document.addEventListener("change", async function (event) {
    if (event.target.classList.contains("headerRodColorDropdown")) {
      setting[params.selectedModelName].rodFrameColor = event.target.value;
      await loaderShowHide(true);
      await otherModelSetup();
      await loaderShowHide(false);
      await showHideNodes(main_model, scene, camera);
    }
  });
}

if (shelfTypeDropdown) {
  shelfTypeDropdown.value = params.defaultShelfType;
  document.addEventListener("change", async function (event) {
    if (event.target.classList.contains("shelfTypeDropdown")) {
      setting[params.selectedModelName].defaultShelfType = event.target.value;
      await loaderShowHide(true);
      await otherModelSetup();
      await loaderShowHide(false);
      await showHideNodes(main_model, scene, camera);
    }
  });
}

if (slottedSidesToggle) {
  slottedSidesToggle.checked = params.slottedSidesToggle;
  document.addEventListener("change", async function (event) {
    if (event.target.classList.contains("slottedSidesToggle")) {
      setting[params.selectedModelName].slottedSidesToggle =
        event.target.checked;

      await loaderShowHide(true);
      await otherModelSetup();
      await loaderShowHide(false);
      await loaderShowHide(false);
      await showHideNodes(main_model, scene, camera);
    }
  });
}

if (topFrameFileUpload) {
  document.addEventListener("change", async function (event) {
    if (event.target.classList.contains("topFrameFileUpload")) {
      const file = event.target.files[0];
      if (!file) return;
      params.fileUploadFlag = "TopFrame";

      const reader = new FileReader();
      reader.onload = async function (e) {
        cropperImage.src = e.target.result;
        cropperContainer.style.display = "block";

        if (cropper) {
          cropper.destroy();
        }

        let defaultModelName =
          params.selectedModelName !== "default"
            ? params.selectedModelName
            : params.defaultModel;
        let currentModel = scene.getObjectByName(defaultModelName);
        let defaultHeaderSize =
          setting[params.selectedModelName].defaultHeaderSize;
        let currentHeader = currentModel.getObjectByName(defaultHeaderSize);
        const size = await getCurrentModelSize(
          currentHeader,
          "Header_Graphic1-Mat"
        );
        console.log("size", size);

        cropper = new Cropper(cropperImage, {
          aspectRatio: size.x / size.y,
          viewMode: 0.4,
          autoCropArea: 1,
          cropBoxResizable: true,
          cropBoxMovable: true,
          background: false,
        });
      };
      reader.readAsDataURL(file);
    }
  });
}

if (mainFrameFileUpload) {
  document.addEventListener("change", async function (event) {
    if (event.target.classList.contains("mainFrameFileUpload")) {
      const file = event.target.files[0];
      if (!file) return;

      params.fileUploadFlag = "MainFrame";

      const reader = new FileReader();
      reader.onload = async function (e) {
        cropperImage.src = e.target.result;
        cropperContainer.style.display = "block";

        if (cropper) {
          cropper.destroy();
        }

        let defaultModelName =
          params.selectedModelName !== "default"
            ? params.selectedModelName
            : params.defaultModel;
        let currentModel = scene.getObjectByName(defaultModelName);
        const size = await getCurrentModelSize(currentModel, "Cube1-Mat");
        // console.log(size)

        cropper = new Cropper(cropperImage, {
          aspectRatio: size.x / size.y,
          viewMode: 0.4,
          autoCropArea: 1,
          cropBoxResizable: true,
          cropBoxMovable: true,
          background: false,
        });
      };
      reader.readAsDataURL(file);
    }
  });
}

if (headerFrameColorInput) {
  headerFrameColorInput.value = await getHex(params.topFrameBackgroundColor);
  document.addEventListener("input", async function (event) {
    if (event.target.classList.contains("headerFrameColorInput")) {
      setting[params.selectedModelName].topFrameBackgroundColor =
        event.target.value;
      await loaderShowHide(true);
      await otherModelSetup();
      await loaderShowHide(false);
      await setTopFrameCropedImage();
    }
  });
}

if (headerFrameColorDropdown) {
  headerFrameColorDropdown.value = params.topFrameBackgroundColor;
  document.addEventListener("change", async function (event) {
    if (event.target.classList.contains("headerFrameColorDropdown")) {
      setting[params.selectedModelName].topFrameBackgroundColor =
        event.target.value;
      await setTopFrameCropedImage();
    }
  });
}

if (mainFrameColorInput) {
  mainFrameColorInput.value = await getHex(params.mainFrameBackgroundColor);
  document.addEventListener("input", async function (event) {
    if (event.target.classList.contains("mainFrameColorInput")) {
      setting[params.selectedModelName].mainFrameBackgroundColor =
        event.target.value;
      await setMainFrameCropedImage();
    }
  });
}

if (baseSelectorDropdown) {
  baseSelectorDropdown.value = params.selectedBaseFrame;
  document.addEventListener("change", async function (event) {
    if (event.target.classList.contains("baseSelectorDropdown")) {
      setting[params.selectedModelName].selectedBaseFrame = event.target.value;
      await loaderShowHide(true);
      await otherModelSetup();
      await loaderShowHide(false);
      await showHideNodes(main_model, scene, camera);
    }
  });
}

if (baseColor) {
  baseColor.value = params.baseFrameColor;
  document.addEventListener("change", async function (event) {
    if (event.target.classList.contains("baseColor")) {
      setting[params.selectedModelName].baseFrameColor = event.target.value;
      await loaderShowHide(true);
      await otherModelSetup();
      await loaderShowHide(false);
      await showHideNodes(main_model, scene, camera);
    }
  });
}

if (hangerClothesToggle) {
  hangerClothesToggle.checked = params.hangerClothesToggle;
  document.addEventListener("change", async function (event) {
    if (event.target.classList.contains("hangerClothesToggle")) {
      setting[params.selectedModelName].hangerClothesToggle =
        event.target.checked;
      await loaderShowHide(true);
      await otherModelSetup();
      await loaderShowHide(false);
      await showHideNodes(main_model, scene, camera);
    }
  });
}

if (hangerGolfClubsToggle) {
  hangerGolfClubsToggle.checked = params.hangerGolfClubsToggle;
  document.addEventListener("change", async function (event) {
    if (event.target.classList.contains("hangerGolfClubsToggle")) {
      setting[params.selectedModelName].hangerGolfClubsToggle =
        event.target.checked;
      await loaderShowHide(true);
      await otherModelSetup();
      await loaderShowHide(false);
      await showHideNodes(main_model, scene, camera);
    }
  });
}

if (hangerStandColor) {
  hangerStandColor.value = params.defaultHangerStandColor;
  document.addEventListener("change", async function (event) {
    if (event.target.classList.contains("hangerStandColor")) {
      setting[params.selectedModelName].defaultHangerStandColor =
        event.target.value;
      await loaderShowHide(true);
      await otherModelSetup();
      await loaderShowHide(false);
      await showHideNodes(main_model, scene, camera);
    }
  });
}

if (rackShelfColor) {
  rackShelfColor.value = params.defaultRackShelfStandColor;
  document.addEventListener("change", async function (event) {
    if (event.target.classList.contains("rackShelfColor")) {
      setting[params.selectedModelName].defaultRackShelfStandColor =
        event.target.value;
      await loaderShowHide(true);
      await otherModelSetup();
      await loaderShowHide(false);
      await showHideNodes(main_model, scene, camera);
    }
  });
}

if (rackStandColor) {
  rackStandColor.value = params.defaultRackStandStandColor;
  document.addEventListener("change", async function (event) {
    if (event.target.classList.contains("rackStandColor")) {
      setting[params.selectedModelName].defaultRackStandStandColor =
        event.target.value;
      await loaderShowHide(true);
      await otherModelSetup();
      await loaderShowHide(false);
      await showHideNodes(main_model, scene, camera);
    }
  });
}

if (measurementToggle) {
  measurementToggle.checked = params.measurementToggle;

  measurementToggle.addEventListener("change", async function (event) {
    params.measurementToggle = event.target.checked;
    await loaderShowHide(true);
    await otherModelSetup();
    await loaderShowHide(false);
    await showHideNodes(main_model, scene, camera);
  });
}

if (cropButton) {
  cropButton.addEventListener("click", async function (event) {
    if (cropper) {
      let defaultModelName =
        params.selectedModelName !== "default"
          ? params.selectedModelName
          : params.defaultModel;
      let defaultHeaderSize =
        setting[params.selectedModelName].defaultHeaderSize;
      if (params.fileUploadFlag == "MainFrame") {
        mainFramCropedImage = mainFramCropedImage || {};
        mainFramCropedImage[defaultModelName] = cropper.getCroppedCanvas();
        await setMainFrameCropedImage();
      } else if (params.fileUploadFlag == "TopFrame") {
        topFramCropedImage = topFramCropedImage || {};
        topFramCropedImage[defaultModelName] =
          topFramCropedImage[defaultModelName] || {};
        topFramCropedImage[defaultModelName][defaultHeaderSize] =
          cropper.getCroppedCanvas();
        await setTopFrameCropedImage();
      }
    }
  });
}

if (closeButton) {
  closeButton.addEventListener("click", closeCropper);
}

if (addHanger) {
  document.addEventListener("click", async function (event) {
    if (event.target.closest(".addHanger")) {
      const hangerType = event.target.getAttribute("data-hanger");

      let hangermodel, hanger;
      await loaderShowHide(true);
      await otherModelSetup();

      // const loader = new GLTFLoader();
      if (golfClubNames.includes(hangerType)) {
        // console.log("hello from shiv")
        if (!hanger_golf_club_model) {
          // hanger_golf_club_model = await loadModel(colladaLoader, 'hanger_golf_club_model.dae');
          hanger_golf_club_model = await loadGLTFModel(
            glftLoader,
            "hanger_golf_club_model.glb"
          );
          await setupHangerGolfClubModel(main_model, hanger_golf_club_model);
        }
        hangermodel = hanger_golf_club_model;
      } else {
        if (!hanger_model) {
          // hanger_model = await loadModel(colladaLoader, 'hanger_model.dae');
          hanger_model = await loadGLTFModel(glftLoader, "hanger_model.glb");
          await setupHangerModel(main_model, hanger_model);
        }
        hangermodel = hanger_model;
      }

      let defaultModelName =
        params.selectedModelName !== "default"
          ? params.selectedModelName
          : params.defaultModel;

      let defaultModel = main_model.getObjectByName(defaultModelName);
      if (hangermodel) {
        // console.log('hangermodel', hangermodel)

        let hanger_object = hangermodel.getObjectByName(hangerType);
        if (hanger_object) {
          hanger = hanger_object.clone();
          if (hanger) {
            let frame = defaultModel.getObjectByName("Frame");
            let side = camera.position.z > 0 ? "Front" : "Back";

            const hangerPrefix = defaultModelName + "_" + side + "_"; // Prefix to match keys
            let hangerArrayKey = hangerPrefix + hangerType;

            let conditionFlag = await isHangerAdd(
              frame,
              hangermodel,
              hangerType,
              hangerArray,
              hangerPrefix
            );

            let leftSideSlotted = frame.getObjectByName("Left_Ex_Slotted");
            if (!leftSideSlotted || !leftSideSlotted.visible) {
              if (conditionFlag) {
                hanger.position.y -= params.cameraPosition;
                hanger.name = hangerType;

                // Get the bounding box of the frame to find its center
                const frameBoundingBox = new THREE.Box3().setFromObject(frame);
                const frameCenter = frameBoundingBox.getCenter(
                  new THREE.Vector3()
                );
                const frameWidth =
                  frameBoundingBox.max.x - frameBoundingBox.min.x;

                // Get the bounding box of the hanger
                const hangerBoundingBox = new THREE.Box3().setFromObject(
                  hanger
                );
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

                hanger.hangerArrayKey = hangerArrayKey;

                if (!hangerArray[hangerArrayKey]) {
                  hangerArray[hangerArrayKey] = 0;
                }

                hangerArray[hangerArrayKey] += 1;

                await showHideNodes(main_model, scene, camera);
              } else {
                alert("There is not enough space to add this hanger.");
              }
            } else {
              // alert('The slotted side is visible; cannot add hanger.');
            }
          }
        }
      }
      await loaderShowHide(false);
    }
  });
}

if (addRack) {
  document.addEventListener("click", async function (event) {
    if (event.target.closest(".addRack")) {
      await loaderShowHide(true);
      await otherModelSetup();

      const rackType = event.target.getAttribute("data-rack");
      let defaultModelName =
        params.selectedModelName !== "default"
          ? params.selectedModelName
          : params.defaultModel;
      let getCleanModelName =
        params.selectedModelName !== "default"
          ? await cleanModelName(defaultModelName)
          : params.defaultModel;

      let defaultModel = main_model.getObjectByName(defaultModelName);
      let rack_model;
      if (rackType == "RackGlassShelf") {
        if (!rack_glass_model) {
          rack_glass_model = await loadGLTFModel(
            glftLoader,
            "rack_glass_model.glb"
          );
          // rack_glass_model = await loadModel(colladaLoader, 'rack_glass_model.dae');
          await setupGlassRackModel(
            main_model,
            rack_glass_model,
            texture_background
          );
        }
        rack_model = rack_glass_model;
      } else if (rackType == "RackWoodenShelf") {
        if (!rack_wooden_model) {
          rack_wooden_model = await loadGLTFModel(
            glftLoader,
            "rack_wooden_model.glb"
          );
          // rack_wooden_model = await loadModel(colladaLoader, 'rack_wooden_model.dae');
          await setupWoodenRackModel(main_model, rack_wooden_model);
        }
        rack_model = rack_wooden_model;
      }

      if (rack_model) {
        let rack_clone = rack_model.clone();
        let frame = defaultModel.getObjectByName("Frame");
        let rack = rack_clone.getObjectByName(getCleanModelName);

        if (rack) {
          rack.name = rackType;

          // Get the Left_Ex_Slotted node
          let leftSideSlotted = frame.getObjectByName("Left_Ex_Slotted");
          let topExSide = frame.getObjectByName("Top_Ex");

          if (topExSide && leftSideSlotted && leftSideSlotted.visible) {
            let side = camera.position.z > 0 ? "Front" : "Back";

            // Calculate the bounding box for the frame to find the center
            const topExSideBoundingBox = new THREE.Box3().setFromObject(
              topExSide
            );
            const topExSideCenter = topExSideBoundingBox.getCenter(
              new THREE.Vector3()
            ); // Get center of frame

            const boundingBox =
              params.calculateBoundingBox[getCleanModelName][frame.name];

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

            // Update removeRack to always face the camera
            scene.onBeforeRender = function () {
              scene.traverse((obj) => {
                if (obj.name && obj.name.includes("remove")) {
                  obj.lookAt(camera.position);
                }
              });
            };

            await showHideNodes(main_model, scene, camera);
          }
        }
      }
      await loaderShowHide(false);
    }
  });
}

if (addAnotherModel) {
  addAnotherModel.forEach((button) => {
    button.addEventListener("click", async function () {

      //   ----------------------------------------------------------
    //   let backupMainModel = main_model.clone();
    //   let modelGroupLength = modelGroup.children.length;
    //   let backupModelGroup = modelGroup.clone();
    //   modelGroup.clear();
    //   modelGroup.add(backupMainModel);
    //   for (let i = 0; i < modelGroupLength; i++) {
    //     const newModel = backupModelGroup.children[i].clone();
    //     newModel.name = `main_model_${i + 1}`;
    //     //   newModel.position.x = i * 18.05 - (modelGroupLength - 1) * 9.025;
    //     const modelBoundingBox = new THREE.Box3().setFromObject(
    //       newModel.children[0]
    //     );
    //     const modelWidth = modelBoundingBox.max.x - modelBoundingBox.min.x;
    //     const boundingBox = await computeBoundingBox(newModel, allModelNames);
    //     const center = boundingBox.getCenter(new THREE.Vector3());
    //     const cameraOnLeft = camera.position.x < center.x;

    //     if (cameraOnLeft) {
    //       newModel.position.x = boundingBox.max.x + modelWidth / 2;
    //       allModelNames.push(newModel.children[0].name);
    //     } else {
    //       newModel.position.x = boundingBox.min.x - modelWidth / 2;
    //       allModelNames.unshift(newModel.children[0].name);
    //     }
    //     modelGroup.add(newModel);
    //   }
    //   console.log(modelGroup);
    //   return;
      //   ----------------------------------------------------------
      let FirstMainModel = modelGroup.getObjectByName("main_model");
      const newModel = FirstMainModel.clone();
      params.defaultModel = "Model_661";
      await updateFrameSize(newModel, scene, camera);      
      let baseModelName = "Other_" + newModel.name;
      let modelName = baseModelName + "_1";
      let suffix = 1;
      while (Array.from(modelGroup.children).some((child) => child.name === modelName)) {
        suffix++;
        modelName = `${baseModelName}_${suffix}`;
      }
      newModel.name = modelName;
      //   newModel.position.x = i * 18.05 - (modelGroupLength - 1) * 9.025;
      const modelBoundingBox = await computeBoundingBox(newModel, allModelNames);
      const modelWidth = modelBoundingBox.max.x - modelBoundingBox.min.x;

      const boundingBox = await computeBoundingBox(modelGroup, allModelNames);
      const center = boundingBox.getCenter(new THREE.Vector3());
      const cameraOnLeft = camera.position.x < center.x;

      if (cameraOnLeft) {
        newModel.position.x = boundingBox.max.x - modelWidth / 2;
      } else {
        newModel.position.x = boundingBox.min.x - modelWidth / 2;
      }
      modelGroup.add(newModel);
      await centerMainModel(modelGroup, allModelNames);
      await addAnotherModels(
        newModel,
        allModelNames,
        cameraOnLeft,
        scene,
        camera
      );
      console.log(modelGroup);
      return;

      //   ----------------------------------------------------------

      const modelType = this.getAttribute("data-type");
      await loaderShowHide(true);
      await otherModelSetup();

      let defaultModel = main_model.getObjectByName(modelType);
      if (defaultModel) {
        let model = defaultModel.clone();
        await cloneWithCustomProperties(defaultModel, model);
        const nodesToRemove = [];
        model.traverse((child) => {
          if (
            hangerNames.includes(child.name) ||
            rackNames.includes(child.name)
          ) {
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

        let baseModelName = "Other_" + modelType;
        let modelName = baseModelName + "_1";
        let suffix = 1;
        while (main_model.getObjectByName(modelName)) {
          modelName = `${baseModelName}_${suffix}`;
          suffix++;
        }

        model.name = modelName;
        const modelBoundingBox = new THREE.Box3().setFromObject(model);
        const modelWidth = modelBoundingBox.max.x - modelBoundingBox.min.x;

        const boundingBox = await computeBoundingBox(main_model, allModelNames);
        const center = boundingBox.getCenter(new THREE.Vector3());
        const cameraOnLeft = camera.position.x < center.x;

        if (cameraOnLeft) {
          model.position.x = boundingBox.max.x + modelWidth / 2;
          allModelNames.push(model.name);
        } else {
          model.position.x = boundingBox.min.x - modelWidth / 2;
          allModelNames.unshift(model.name);
        }

        model.visible = true;

        setting[modelName] = JSON.parse(JSON.stringify(setting["default"]));
        setting[modelName].topFrameBackgroundColor =
          params.topFrameBackgroundColor;
        setting[modelName].mainFrameBackgroundColor =
          params.mainFrameBackgroundColor;

        await traverseAsync(model, async (mesh) => {
          if (
            frameTop1Names.includes(mesh.name) ||
            frameMainNames.includes(mesh.name)
          ) {
            if (params.lastInnerMaterial[modelType][mesh.name]) {
              // const material = await commonMaterial(parseInt('0xffffff', 16))
              const material = params.lastInnerMaterial[modelType][mesh.name];
              mesh.material = material;
              mesh.needsUpdate = true;
            }
          }
        });

        main_model.add(model);

        await centerMainModel(main_model, allModelNames);
        await addAnotherModels(
          model,
          allModelNames,
          cameraOnLeft,
          scene,
          camera
        );
      } else {
      }

      await loaderShowHide(false);
      await showHideNodes(main_model, scene, camera);
    });
  });
}

moveLeftModel.addEventListener("click", async () => {
  let defaultModelName =
    params.selectedModelName !== "default"
      ? params.selectedModelName
      : params.defaultModel;
  let defaultModel = main_model.getObjectByName(defaultModelName);

  if (defaultModel) {
    // Check for collision before moving left
    const canMoveLeft = await checkForCollision(
      main_model,
      defaultModel,
      -params.moveLeftRight
    );

    if (canMoveLeft) {
      defaultModel.position.x -= params.moveLeftRight; // Adjust the value to control the speed of movement
      if (!defaultModel.spacing) {
        defaultModel.spacing = 0;
      }
      defaultModel.spacing += params.moveLeftRight;
      await drawMeasurementBoxesWithLabels(main_model, scene, camera);
    } else {
      console.log("Collision detected! Cannot move further left.");
    }
  }
});

moveRightModel.addEventListener("click", async () => {
  let defaultModelName =
    params.selectedModelName !== "default"
      ? params.selectedModelName
      : params.defaultModel;
  let defaultModel = main_model.getObjectByName(defaultModelName);

  if (defaultModel) {
    // Check for collision before moving right
    const canMoveRight = await checkForCollision(
      main_model,
      defaultModel,
      params.moveLeftRight
    );

    if (canMoveRight) {
      defaultModel.position.x += params.moveLeftRight; // Adjust the value to control the speed of movement
      if (!defaultModel.spacing) {
        defaultModel.spacing = 0;
      }
      defaultModel.spacing += params.moveLeftRight;
      await drawMeasurementBoxesWithLabels(main_model, scene, camera);
    } else {
      console.log("Collision detected! Cannot move further right.");
    }
  }
});

// // Add event listeners for move buttons
// moveLeftModel.addEventListener("click", async () => {
//     let defaultModelName = params.selectedModelName !== 'default' ? params.selectedModelName : params.defaultModel;
//     let defaultModel = main_model.getObjectByName(defaultModelName);

//     if (defaultModel) {
//         defaultModel.position.x -= params.moveLeftRight; // Adjust the value to control the speed of movement
//         if (!defaultModel.spacing) {
//             defaultModel.spacing = 0
//         }
//         defaultModel.spacing -= params.moveLeftRight
//         console.log('defaultModel', defaultModel)
//         await drawMeasurementBoxesWithLabels(main_model, scene, camera)
//     }
// });

// moveRightModel.addEventListener("click", async () => {
//     let defaultModelName = params.selectedModelName !== 'default' ? params.selectedModelName : params.defaultModel;
//     let defaultModel = main_model.getObjectByName(defaultModelName);
//     if (defaultModel) {
//         defaultModel.position.x += params.moveLeftRight; // Adjust the value to control the speed of movement
//         if (!defaultModel.spacing) {
//             defaultModel.spacing = 0
//         }
//         defaultModel.spacing += params.moveLeftRight
//         await drawMeasurementBoxesWithLabels(main_model, scene, camera)
//     }
// });

if (captureButton) {
  captureButton.addEventListener("click", async function () {
    // Save the original size of the renderer
    const originalWidth = renderer.domElement.width;
    const originalHeight = renderer.domElement.height;

    // Set higher resolution (2x or 3x the original resolution)
    const scaleFactor = 3; // You can adjust this factor
    renderer.setSize(
      originalWidth * scaleFactor,
      originalHeight * scaleFactor,
      false
    );
    camera.aspect =
      (originalWidth * scaleFactor) / (originalHeight * scaleFactor);
    camera.updateProjectionMatrix();

    // Render the scene at higher resolution
    renderer.render(scene, camera);

    // Get the canvas from the renderer
    const canvas = renderer.domElement;

    // Get the high-resolution image data from the canvas
    const imageData = canvas.toDataURL("image/png");

    // Create an image element to display the captured image
    const image = new Image();
    image.src = imageData;

    // Optionally, style the image for better display (fit to screen)
    image.style.maxWidth = "100%";
    image.style.height = "auto";
    document.body.appendChild(image);

    // Optionally, trigger a download
    const link = document.createElement("a");
    link.href = imageData;
    link.download = "high-res-model-image.png";
    link.click();

    // Remove the image from the DOM after download
    image.onload = function () {
      // Wait for the image to be fully loaded before removing it
      document.body.removeChild(image);
    };

    // Revert the renderer back to its original size
    renderer.setSize(originalWidth, originalHeight, false);
    camera.aspect = originalWidth / originalHeight;
    camera.updateProjectionMatrix();

    // Re-render the scene at the original size
    renderer.render(scene, camera);
  });
}

if (zoomInButton) {
  zoomInButton.addEventListener("click", function () {
    if (cropper) cropper.zoom(0.1); // Zoom in
  });
}

if (zoomOutButton) {
  zoomOutButton.addEventListener("click", function () {
    if (cropper) cropper.zoom(-0.1); // Zoom out
  });
}

if (moveLeftButton) {
  moveLeftButton.addEventListener("click", function () {
    if (cropper) cropper.move(-10, 0); // Move left
  });
}

if (moveRightButton) {
  moveRightButton.addEventListener("click", function () {
    if (cropper) cropper.move(10, 0); // Move right
  });
}

if (moveUpButton) {
  moveUpButton.addEventListener("click", function () {
    if (cropper) cropper.move(0, -10); // Move up
  });
}

if (moveDownButton) {
  moveDownButton.addEventListener("click", function () {
    if (cropper) cropper.move(0, 10); // Move down
  });
}

if (rotateLeftButton) {
  rotateLeftButton.addEventListener("click", function () {
    if (cropper) cropper.rotate(-15); // Rotate left by 15 degrees
  });
}

if (rotateRightButton) {
  rotateRightButton.addEventListener("click", function () {
    if (cropper) cropper.rotate(15); // Rotate right by 15 degrees
  });
}

if (scaleXButton) {
  scaleXButton.addEventListener("click", function () {
    if (cropper) {
      const currentData = cropper.getData();
      cropper.setData({
        ...currentData,
        scaleX: currentData.scaleX === 1 ? -1 : 1, // Toggle between 1 and -1
      });
    }
  });
}

if (scaleYButton) {
  scaleYButton.addEventListener("click", function () {
    if (cropper) {
      const currentData = cropper.getData();
      cropper.setData({
        ...currentData,
        scaleY: currentData.scaleY === 1 ? -1 : 1, // Toggle between 1 and -1
      });
    }
  });
}
if (resetButton) {
  resetButton.addEventListener("click", function () {
    if (cropper) {
      cropper.reset(); // Reset cropper settings to default
    }
  });
}

// Assuming your accordion has a class or ID you can select

accordionModel.addEventListener("show.bs.collapse", async function (event) {
  const openAccordionItems = accordionModel.querySelectorAll(
    ".accordion-collapse.show"
  );
  openAccordionItems.forEach((item) => {
    const bsCollapse = new bootstrap.Collapse(item, {
      toggle: false, // This will collapse the accordion content
    });
    bsCollapse.hide(); // Explicitly hide the open accordion
  });
  const openedAccordionItem = event.target.closest(".accordion-item");

  // Find the data-model attribute of the currently open accordion item
  const modelName = openedAccordionItem.getAttribute("data-model");
  if (modelName) {
    params.selectedModelName = modelName;
    await loaderShowHide(true);
    await otherModelSetup();
    await loaderShowHide(false);
    await showHideNodes(main_model, scene, camera);
  }
});

// Toggle dropdown visibility with delegation
document.addEventListener("click", function (event) {
  // Check if a dropdown button was clicked
  if (event.target.closest(".dropdown-button")) {
    const dropdown = event.target.closest(".custom-dropdown");
    const dropdownContent = dropdown.querySelector(".dropdown-content");

    // Toggle visibility of the clicked dropdown
    if (dropdownContent) {
      const isDropdownVisible = dropdownContent.style.display === "block";
      dropdownContent
        .querySelectorAll(".custom-dropdown .dropdown-content")
        .forEach(function (content) {
          content.style.display = "none"; // Close all dropdowns
        });
      dropdownContent.style.display = isDropdownVisible ? "none" : "block"; // Toggle the clicked dropdown
    }
  }

  // Check if a dropdown item was clicked
  if (event.target.closest(".dropdown-item")) {
    const item = event.target.closest(".dropdown-item");
    const dropdownType = item
      .closest(".custom-dropdown")
      .getAttribute("data-type");
    const value = item.getAttribute("data-value");
    const accordion = item.closest(".accordion-item");
    const selectedModel = accordion.getAttribute("data-model");
    console.log("selectedModel_pass", selectedModel);
    // Update material based on the dropdown type and value
    updateMaterial(value, dropdownType, selectedModel);

    // Hide the dropdown after selection
    const dropdown = item.closest(".custom-dropdown");
    const dropdownContent = dropdown.querySelector(".dropdown-content");
    if (dropdownContent) {
      dropdownContent.style.display = "none";
    }
  }
});

// Close dropdowns if clicking outside of them
window.addEventListener("click", function (event) {
  if (!event.target.closest(".custom-dropdown")) {
    document
      .querySelectorAll(".custom-dropdown .dropdown-content")
      .forEach(function (content) {
        content.style.display = "none";
      });
  }
});

// Initialize the dropdowns
// getCustomDropdown();

// // Toggle dropdown visibility
// document.querySelectorAll(".custom-dropdown").forEach(function (dropdown) {
//     dropdown.querySelector(".dropdown-button").addEventListener("click", function () {
//         const dropdownContent = dropdown.querySelector(".dropdown-content");
//         dropdownContent.style.display = dropdownContent.style.display === "block" ? "none" : "block";
//     });
// });

// // Add event listeners to dropdown items
// document.querySelectorAll(".dropdown-item").forEach(function (item) {
//     item.addEventListener("click", function () {
//         const dropdownType = item.closest(".custom-dropdown").getAttribute("data-type");
//         const value = item.getAttribute("data-value");
//         updateMaterial(value, dropdownType);
//         item.closest(".custom-dropdown").querySelector(".dropdown-content").style.display = "none"; // Hide dropdown
//     });
// });

// // Close the dropdown if clicked outside
// window.addEventListener("click", function (event) {
//     if (!event.target.closest('.custom-dropdown')) {
//         document.querySelectorAll(".dropdown-content").forEach(function (dropdownContent) {
//             if (dropdownContent.style.display === "block") {
//                 dropdownContent.style.display = "none";
//             }
//         });
//     }
// });

// Initialize Bootstrap tooltips
document.addEventListener("DOMContentLoaded", function () {
  var tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
});
