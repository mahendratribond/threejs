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
  setupSupportBaseModel,
  setupWoodenRackModel,
  updateLabelOcclusion,
  findParentNodeByName,
  calculateBoundingBox,
  getCurrentModelSize,
  updateFrameMaterial,
  setupGlassRackModel,
  getNextVisibleChild,
  getPrevVisibleChild,
  addAnotherModelView,
  computeBoundingBox,
  getMainParentNode,
  checkForCollision,
  setPositionCenter,
  initLabelRenderer,
  setupHangerModel,
  addAnotherModels,
  isVisibleParents,
  setTextureParams,
  restoreMaterials,
  addNewMaterials,
  updateFrameSize,
  centerMainModel,
  setupArrowModel,
  commonMaterial,
  setupMainModel,
  cleanModelName,
  loaderShowHide,
  traverseAsync,
  getRemoveIcon,
  saveModelData,
  checkMeshType,
  loadGLTFModel,
  showHideNodes,
  getModelData,
  getModelSize,
  isHangerAdd,
  getNodeSize,
  savePdfData,
  setupModel,
  exportUsdz,
  addHangers,
  loadModel,
  addRacks,
  getHex,
  delay,
} from "./utils6.js";

import {
  heightMeasurementNames,
  baseFrameTextureNames,
  hangerStandBaseNodes,
  allFrameBorderNames,
  allOtherModelNames,
  allGroupModelName,
  hangerPartNames,
  updateVariable,
  frameTop1Names,
  frameMainNames,
  baseFrameNames,
  golfClubNames,
  rackPartNames,
  allModelNames,
  allGroupNames,
  hangerNames,
  headerNames,
  rackNames,
  params,
  setting,
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
const takeScreenShot = document.getElementById("takeScreenShot");
const saveModelDataButton = document.getElementById("saveModelDataButton");
const showInAR = document.getElementById("showInAR");
const savePdfButton = document.getElementById("savePdfButton");
const CreatingPdfFile = document.getElementById("CreatingPdfFile");
const cropperContainer = document.getElementById("cropper-container");
const cropperImage = document.getElementById("cropper-image");
const cropButton = document.getElementById("crop-button");
const closeButton = document.getElementById("close-button");
const closeButtonAR = document.getElementById("closeButtonAR");
const createQrButton = document.getElementById("createQrButton");

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
  topFrameCropedImage,
  mainFrameCropedImage,
  texture_background, //border_texture_material,
  main_model,
  header_rod_model,
  header_wooden_shelf_model,
  header_500_height_model,
  header_glass_shelf_fixing_model,
  header_glass_shelf_model,
  slotted_sides_model,
  hanger_model,
  hanger_rail_step,
  hanger_rail_single,
  hanger_rail_d_500,
  hanger_rail_d_1000,
  hanger_golf_club_model,
  rack_wooden_model,
  rack_glass_model,
  arrow_model,
  modelGroup,
  support_base_middle,
  support_base_side,
  previousData;
const lights = [];
const lightHelpers = [];
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
  main_model.name = params.selectedGroupName;
  await setupMainModel(main_model);
  modelGroup.add(main_model);
  await showHideNodes(modelGroup, scene, camera);
  await loadHangerModels();
  modelGroup.name = "main_group";

  for (let val of allModelNames) {
    let model_name = val + ".glb";
    let already_added = modelGroup.getObjectByName(val);
    if (!already_added) {
      let model_load = await loadGLTFModel(glftLoader, model_name);
      await setupMainModel(model_load);
      let model = model_load.getObjectByName(val);
      model.visible = false;
      main_model.add(model);
    }
  }

  // await updateFrameMaterial(
  //   modelGroup,
  //   "frame",
  //   "color",
  //   params.frameBorderColor
  // );
  await showHideNodes(modelGroup, scene, camera);
  // backupMainModel = main_model.clone();

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

  await calculateBoundingBox(modelGroup);
  await otherModelSetup();
  await showHideNodes(modelGroup, scene, camera);
  await setupMainModel(modelGroup);

  await traverseAsync(modelGroup, async (modelNode) => {
    if (allModelNames.includes(modelNode.name)) {
      modelNode.traverse(async function (child) {
        if (
          frameTop1Names.includes(child.name) ||
          frameMainNames.includes(child.name)
        ) {
          if (child.isMesh && child.material) {
            params.lastInnerMaterial = params.lastInnerMaterial || {};
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
    let Golfloader = document.querySelector(".Hanger_Golf_Club_Driver_loader");
    removeLoader(Golfloader);
    let Golfloader2 = document.querySelector(".Hanger_Golf_Club_Iron_loader");
    removeLoader(Golfloader2);
  }
  // if (!hanger_model) {
  //   // console.log("hanger_model lodeding");
  //   hanger_model = await loadGLTFModel(glftLoader, "hanger_model.glb");
  //   console.log("hanger_model loded", hanger_model);
  //   // hanger_model = await loadModel(colladaLoader, 'hanger_model.dae');
  //   await setupHangerModel(hanger_model);
  //   // console.log("hanger_model update", hanger_model);
  // }

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

  await loadPreviousModels();
}

async function loadPreviousModels() {
  await loaderShowHide(true);
  labelRenderer = await initLabelRenderer();
  document.body.appendChild(labelRenderer.domElement);

  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

  if (id) {
    previousData = await getModelData(id);
    if (previousData && previousData.params) {
      const loader = new THREE.MaterialLoader();

      let newMaterialData = params.lastInnerMaterial;
      await updateVariable("params", previousData.params);
      await updateVariable("setting", previousData.setting);
      let lastGroupNames = previousData.group_names;
      mainFrameCropedImage = previousData.main_frame_croped_image;
      topFrameCropedImage = previousData.top_frame_croped_image;

      let mainModelIndex = lastGroupNames.indexOf("main_model");
      let retrievedSelectedGroupName = params.selectedGroupName;
      let retrievedMaterialData = params.lastInnerMaterial;
      let hangerAdded = params.hangerAdded;
      params.hangerAdded = {};
      let rackAdded = params.rackAdded;
      params.rackAdded = {};

      let reverseLastGroupNames = lastGroupNames;
      if (mainModelIndex > 0) {
        reverseLastGroupNames = lastGroupNames
          .slice(0, mainModelIndex) // Get elements before "main_model"
          .reverse() // Reverse them
          .concat(lastGroupNames.slice(mainModelIndex)); // Concatenate with the rest of the array
      }

      params.lastInnerMaterial = {};
      await restoreMaterials(retrievedMaterialData, loader);
      await addNewMaterials(newMaterialData);

      let i = 0;
      for (const groupName of reverseLastGroupNames) {
        const side = i < mainModelIndex ? false : true;

        if (groupName.startsWith("Other_")) {
          await addAnotherModels(
            allGroupNames,
            modelGroup,
            scene,
            camera,
            groupName,
            side
          );
        }
        // Add a short delay between each group loading
        await delay(100); // Adjust the delay time (in milliseconds) as needed
        i++;
      }

      await centerMainModel(modelGroup);

      for (const groupName of lastGroupNames) {
        params.selectedGroupName = groupName;

        if (
          setting[params.selectedGroupName].headerRodToggle === true &&
          setting[params.selectedGroupName].headerRodToggle ===
            setting[params.selectedGroupName].headerUpDown
        ) {
          setting[params.selectedGroupName].headerUpDown =
            !setting[params.selectedGroupName].headerRodToggle;
        }

        await setTopFrameCropedImage();
        await setMainFrameCropedImage();
        await showHideNodes(modelGroup, scene, camera);
        await centerMainModel(modelGroup);

        // Delay to ensure each model group update is visually distinct
        await delay(100); // Adjust as needed
      }

      await centerMainModel(modelGroup);
      await showHideNodes(modelGroup, scene, camera);

      // Sequentially process hangerAdded entries with delay
      if (hangerAdded) {
        for (const [hangerArrayKey, value] of Object.entries(hangerAdded)) {
          const hangerArray = hangerArrayKey.split("-");
          const groupName = hangerArray[0] || "";
          const modelName = hangerArray[1] || "";
          const side = hangerArray[2] || "";
          const hangerType = hangerArray[3] || "";

          params.selectedGroupName = groupName;
          const lastDefaultModel = setting[groupName].defaultModel;
          setting[groupName].defaultModel = modelName;

          if (hangerArrayKey.startsWith(groupName)) {
            for (const position of Object.values(value)) {
              await addHangers(
                modelGroup,
                hangerType,
                hanger_model,
                hanger_golf_club_model,
                scene,
                camera,
                side,
                position
              );
              await delay(100); // Delay for hangers
            }
          }

          setting[groupName].defaultModel = lastDefaultModel;
        }
      }

      // Sequentially process rackAdded entries with delay
      if (rackAdded) {
        for (const [rackArrayKey, value] of Object.entries(rackAdded)) {
          const rackArray = rackArrayKey.split("-");
          const groupName = rackArray[0] || "";
          const modelName = rackArray[1] || "";
          const side = rackArray[2] || "";
          const rackType = rackArray[3] || "";

          params.selectedGroupName = groupName;
          const lastDefaultModel = setting[groupName].defaultModel;
          setting[groupName].defaultModel = modelName;

          if (rackArrayKey.startsWith(groupName)) {
            for (const position of Object.values(value)) {
              await addRacks(
                modelGroup,
                rackType,
                rack_wooden_model,
                rack_glass_model,
                scene,
                camera,
                side,
                position
              );
              await delay(100); // Delay for racks
            }
          }

          setting[groupName].defaultModel = lastDefaultModel;
        }
      }

      params.selectedGroupName = retrievedSelectedGroupName;

      await centerMainModel(modelGroup);
      await showHideNodes(modelGroup, scene, camera);

      for (const name of hangerNames) {
        const loaders = document.querySelectorAll(`.${name}_loader`);
        loaders.forEach((loader) => removeLoader(loader));
      }

      const accordionContainer = document.querySelector("#accordionModel");
      const openAccordionItems = accordionContainer.querySelectorAll(
        ".accordion-collapse.show"
      );
      openAccordionItems.forEach((item) => {
        const bsCollapse = new bootstrap.Collapse(item, { toggle: false });
        bsCollapse.hide();
      });

      const lastAccordionItem = accordionContainer.querySelector(
        `.accordion-item[data-model="${params.selectedGroupName}"] .accordion-collapse`
      );
      if (lastAccordionItem) {
        const bsCollapse = new bootstrap.Collapse(lastAccordionItem, {
          toggle: true,
        });
      }
    }
  }
  await loaderShowHide(false);
}


async function loadHangerModels() {
  if (!hanger_rail_step) {
    hanger_rail_step = await loadGLTFModel(glftLoader, "Hanger_Rail_Step.glb");
    await setupHangerModel(hanger_rail_step);
    hanger_model = hanger_rail_step;
    let loader = document.querySelector(".Hanger_Rail_Step_loader");
    removeLoader(loader);
  }
  if (!hanger_rail_single) {
    hanger_rail_single = await loadGLTFModel(
      glftLoader,
      "Hanger_Rail_Single.glb"
    );
    await setupHangerModel(hanger_rail_single);
    hanger_rail_single =
      hanger_rail_single.getObjectByName("Hanger_Rail_Single");
    hanger_model.add(hanger_rail_single);
    let loader = document.querySelector(".Hanger_Rail_Single_loader");
    removeLoader(loader);
  }

  if (!hanger_rail_d_500) {
    hanger_rail_d_500 = await loadGLTFModel(
      glftLoader,
      "Hanger_Rail_D_500mm.glb"
    );
    await setupHangerModel(hanger_rail_d_500);
    hanger_rail_d_500 = hanger_rail_d_500.getObjectByName(
      "Hanger_Rail_D_500mm"
    );
    hanger_model.add(hanger_rail_d_500);
    let loader = document.querySelector(".Hanger_Rail_D_500mm_loader");
    removeLoader(loader);
  }

  if (!hanger_rail_d_1000) {
    hanger_rail_d_1000 = await loadGLTFModel(
      glftLoader,
      "Hanger_Rail_D_1000mm.glb"
    );
    await setupHangerModel(hanger_rail_d_1000);
    hanger_rail_d_1000 = hanger_rail_d_1000.getObjectByName(
      "Hanger_Rail_D_1000mm"
    );
    hanger_model.add(hanger_rail_d_1000);
    let loader = document.querySelector(".Hanger_Rail_D_1000mm_loader");
    removeLoader(loader);
  }
}

function removeLoader(loader) {
  let button = loader.closest("button");
  // Select the loader image and the loader div
  let loaderImage = loader;
  let loaderDiv = button.querySelector(".loaderBack");
  setTimeout(() => {
    // Hide the loader image and loader div
    loaderImage.style.display = "none"; // Hides the loader image
    loaderDiv.style.display = "none"; // Hides the loader div

    // Enable the button
    button.disabled = false;
  }, 1500); // Delay of 1500ms
}

// Handle mouse move for hover
async function otherModelSetup() {
  if (!arrow_model) {
    arrow_model = await loadGLTFModel(glftLoader, "arrow_model.glb");
    // header_rod_model = await loadModel(colladaLoader, 'arrow_model.dae');
    await setupArrowModel(modelGroup, arrow_model);
  }
  if (!header_rod_model) {
    header_rod_model = await loadGLTFModel(glftLoader, "header_rod_model.glb");
    // console.log('header_rod_model', header_rod_model)
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
      modelGroup,
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
    await setupHeader500HeightModel(modelGroup, header_500_height_model);
    // await updateMaterial(params.frameBorderColor, "frame");
  }
  if (!header_wooden_shelf_model) {
    header_wooden_shelf_model = await loadGLTFModel(
      glftLoader,
      "header_wooden_shelf_model.glb"
    );
    // header_wooden_shelf_model = await loadModel(colladaLoader, 'header_wooden_shelf_model.dae');
    await setupHeaderWoodenShelfModel(modelGroup, header_wooden_shelf_model);
    // await updateMaterial(params.defaultShelfColor, "shelf");
  }
  if (!header_glass_shelf_model) {
    header_glass_shelf_model = await loadGLTFModel(
      glftLoader,
      "header_glass_shelf_model.glb"
    );
    // header_glass_shelf_model = await loadModel(colladaLoader, 'header_glass_shelf_model.dae');
    await setupHeaderGlassShelfModel(
      modelGroup,
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
    await setupSlottedSidesModel(modelGroup, slotted_sides_model);
    // await updateMaterial(params.frameBorderColor, "frame");
  }

  if (!support_base_middle || !support_base_side) {
    support_base_middle = await loadGLTFModel(
      glftLoader,
      "support_base_middle.glb"
    );
    support_base_side = await loadGLTFModel(
      glftLoader,
      "support_base_sides.glb"
    );
    await setupSupportBaseModel(
      modelGroup,
      support_base_middle,
      support_base_side
    );
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
  modelGroup.traverse((child) => {
    if (hangerNames.includes(child.name) && child.visible) {
      visibleObjects.push(child);
    }
    if (rackNames.includes(child.name) && child.visible) {
      visibleObjects.push(child);
    }
    // Check for allModelNames and allOtherModelNames as well
    // if (allModelNames.includes(child.name) && child.visible) {
    //   visibleObjects.push(child);
    // }
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

  // console.log('finalVisibleObjects', finalVisibleObjects);
  // Find intersections with the main_model
  hangerIntersects = raycaster.intersectObjects(finalVisibleObjects, true);
  // console.log('hangerIntersects', hangerIntersects);
}

// Handle mouse click for selection
async function onMouseClick(event) {
  // console.log('hangerIntersects', hangerIntersects);

  // let defaultModel = modelGroup.getObjectByName(params.selectedGroupName);
  if (hangerIntersects.length > 0) {
    hideRemoveIcons();
    const intersectNode = hangerIntersects[0].object;
    if (intersectNode) {
      // console.log('intersectNode', intersectNode)
      selectedNode = intersectNode.parent;
      let iconName = selectedNode.name;

      let tempNode, defaultModel;
      for (let val of allModelNames) {
        tempNode = await findParentNodeByName(selectedNode, val, true);
        if (tempNode) {
          defaultModel = tempNode;
          break;
        }
      }

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
          params.hangerCount[hangerArrayKey] -= 1;
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
  if (modelGroup && selectedNode) {
    modelGroup.traverse((child) => {
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

    // let defaultModelName = params.selectedGroupName !== 'default' ? params.selectedGroupName : params.defaultModel;
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
    let tempNode, defaultModel;
    for (let val of allModelNames) {
      tempNode = await findParentNodeByName(selectedNode, val, true);
      if (tempNode) {
        defaultModel = tempNode;
        break;
      }
    }
    // let defaultModel = main_model.getObjectByName(params.selectedGroupName);
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
  // await drawMeasurementBoxesWithLabels(modelGroup, scene, camera)
  await updateMeasurementGroups(modelGroup, scene, camera);
  await updateLabelOcclusion(scene, camera, raycaster, direction);

  controls.update();
  renderer.render(scene, camera);
  if (labelRenderer) {
    labelRenderer.render(scene, camera); // CSS2D rendering
  }
}

async function setMainFrameCropedImage() {
  let selectedGroupName = params.selectedGroupName;
  let defaultModel = setting[selectedGroupName].defaultModel;

  if (
    mainFrameCropedImage &&
    mainFrameCropedImage[selectedGroupName] &&
    mainFrameCropedImage[selectedGroupName][defaultModel]
  ) {
    const mainFrameBackgroundColor = await getHex(
      setting[selectedGroupName].mainFrameBackgroundColor
    );
    const tempCanvas = document.createElement("canvas");
    const ctx = tempCanvas.getContext("2d");

    // Create a new image element
    const img = new Image();
    img.src = mainFrameCropedImage[selectedGroupName][defaultModel]; // Assign the base64 string to the image's src

    // Wait for the image to load
    img.onload = function () {
      // Set canvas dimensions to match the image dimensions
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;

      // Draw the background color
      ctx.fillStyle = mainFrameBackgroundColor;
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      // Draw the cropped image on top
      ctx.drawImage(img, 0, 0);

      // Convert the canvas to a blob and create a texture from it
      tempCanvas.toBlob(async (blob) => {
        const url = URL.createObjectURL(blob);
        const texture = new THREE.TextureLoader().load(url, async function () {
          await updateMainFrameImageTexture(texture);
        });
        await closeCropper();
      });
    };

    // Handle any errors during image loading
    img.onerror = function (err) {
      console.error("Image loading failed", err);
    };
  } else {
    const mainFrameBackgroundColor = await getHex(
      setting[selectedGroupName].mainFrameBackgroundColor
    );
    let main_model = modelGroup.getObjectByName(selectedGroupName);
    main_model.traverse(async function (child) {
      if (frameMainNames.includes(child.name)) {
        child.material = child.material.clone();
        child.material.color.set(mainFrameBackgroundColor);
        child.material.needsUpdate = true;
      }
    });
  }
}

async function setTopFrameCropedImage() {
  let selectedGroupName = params.selectedGroupName;
  let defaultModel = setting[selectedGroupName].defaultModel;
  let defaultHeaderSize = setting[params.selectedGroupName].defaultHeaderSize;

  if (
    topFrameCropedImage &&
    topFrameCropedImage[selectedGroupName] &&
    topFrameCropedImage[selectedGroupName][defaultModel] &&
    topFrameCropedImage[selectedGroupName][defaultModel][defaultHeaderSize]
  ) {
    const topFrameBackgroundColor = await getHex(
      setting[selectedGroupName].topFrameBackgroundColor
    );
    const tempCanvas = document.createElement("canvas");
    const ctx = tempCanvas.getContext("2d");

    // Create a new image element
    const img = new Image();
    img.src =
      topFrameCropedImage[selectedGroupName][defaultModel][defaultHeaderSize]; // Assign the base64 string to the image's src

    // Wait for the image to load
    img.onload = function () {
      // Set canvas dimensions to match the image dimensions
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;

      // Draw the background color
      ctx.fillStyle = topFrameBackgroundColor;
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      // Draw the cropped image on top
      ctx.drawImage(img, 0, 0);

      // Convert the canvas to a blob and create a texture from it
      tempCanvas.toBlob(async (blob) => {
        const url = URL.createObjectURL(blob);
        const texture = new THREE.TextureLoader().load(url, async function () {
          await updateTopFrameImageTexture(texture);
        });
        await closeCropper();
      });
    };

    // Handle any errors during image loading
    img.onerror = function (err) {
      console.error("Image loading failed", err);
    };
  } else {
    const topFrameBackgroundColor = await getHex(
      setting[selectedGroupName].topFrameBackgroundColor
    );
    let main_model = modelGroup.getObjectByName(selectedGroupName);
    main_model.traverse(async function (child) {
      if (frameTop1Names.includes(child.name)) {
        child.material = child.material.clone();
        child.material.color.set(topFrameBackgroundColor);
        child.material.needsUpdate = true;
      }
    });
  }
}

async function updateMainFrameImageTexture(texture) {
  let selectedGroupName = params.selectedGroupName;
  let defaultModel = setting[selectedGroupName].defaultModel;
  let main_model = modelGroup.getObjectByName(selectedGroupName);
  const currentModel = main_model.getObjectByName(defaultModel);
  const frame = currentModel.getObjectByName("Frame");
  if (frame) {
    frame.traverse(async function (child) {
      await setUploadedTexture(child, texture, frameMainNames);
    });
  }
}

async function updateTopFrameImageTexture(texture) {
  let selectedGroupName = params.selectedGroupName;
  let defaultModel = setting[selectedGroupName].defaultModel;
  let defaultHeaderSize = setting[params.selectedGroupName].defaultHeaderSize;

  let main_model = modelGroup.getObjectByName(selectedGroupName);
  const currentModel = main_model.getObjectByName(defaultModel);
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
async function updateMaterial(
  value,
  dropdownType,
  selectedModel = "main_model"
) {
  let current_setting = setting[params.selectedGroupName];

  // console.log('value', value)
  let type, imageUrl, displayText;

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

  if (dropdownType === "frame") {
    setting[params.selectedGroupName].frameBorderColor = value;
    setting[params.selectedGroupName].frameMaterialType = type;
  } else if (dropdownType === "shelf") {
    setting[params.selectedGroupName].defaultShelfColor = value;
    setting[params.selectedGroupName].shelfMaterialType = type;
  }

  // console.log('value', value)
  // console.log('type', type)
  // console.log('displayText', displayText)

  // await updateFrameMaterial(modelGroup, dropdownType, type, value);
  await showHideNodes(modelGroup, scene, camera);

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

  const topFrameFileUploads = document.querySelectorAll(".mainFrameFileUpload");

  // Loop through each element and set its value to blank
  topFrameFileUploads.forEach((element) => {
    // console.log('vvvv', element);

    element.value = ""; // Set the value to an empty string
  });

  const mainFrameFileUploads = document.querySelectorAll(
    ".mainFrameFileUpload"
  );

  // Loop through each element and set its value to blank
  mainFrameFileUploads.forEach((element) => {
    element.value = ""; // Set the value to an empty string
  });
}

// Event listeners for controls
if (frameSize) {
  frameSize.value = params.defaultModel;
  // frameSize.addEventListener("change", async function (event) {
  document.addEventListener("change", async function (event) {
    if (event.target.classList.contains("frameSize")) {
      setting[params.selectedGroupName].defaultModel = event.target.value;
      await showHideNodes(modelGroup, scene, camera);
      await centerMainModel(modelGroup);
      await lightSetup();
    }
  });
}

if (topDropdown) {
  topDropdown.value = params.topOption;
  document.addEventListener("change", async function (event) {
    if (event.target.classList.contains("topDropdown")) {
      console.log(
        "setting[params.selectedGroupName]",
        setting[params.selectedGroupName]
      );
      console.log("params.selectedGroupName", params.selectedGroupName);
      setting[params.selectedGroupName].topOption = event.target.value;
      setting[params.selectedGroupName].headerRodToggle = false;
      if (
        setting[params.selectedGroupName].topOption == "Header_Wooden_Shelf"
      ) {
        setting[params.selectedGroupName].headerRodToggle = true;
      }

      headerRodToggle.checked =
        setting[params.selectedGroupName].headerRodToggle;
      await otherModelSetup();
      await showHideNodes(modelGroup, scene, camera);
    }
    // You can add similar event handlers for other elements here
  });
}

if (headerOptions) {
  headerOptions.value = params.headerOptions;
  document.addEventListener("change", async function (event) {
    if (event.target.classList.contains("headerOptions")) {
      setting[params.selectedGroupName].headerOptions = event.target.value;
      await otherModelSetup();
      await showHideNodes();
    }
  });
}

if (headerSizeDropdown) {
  headerSizeDropdown.value = params.defaultHeaderSize;
  document.addEventListener("change", async function (event) {
    if (event.target.classList.contains("headerSizeDropdown")) {
      setting[params.selectedGroupName].defaultHeaderSize = event.target.value;
      await otherModelSetup();
      await showHideNodes(modelGroup, scene, camera);
    }
  });
}

if (headerRodToggle) {
  headerRodToggle.checked = params.headerRodToggle;
  document.addEventListener("change", async function (event) {
    if (event.target.classList.contains("headerRodToggle")) {
      setting[params.selectedGroupName].headerRodToggle = event.target.checked;
      await otherModelSetup();
      await showHideNodes(modelGroup, scene, camera);
    }
  });
}

if (headerRodColorDropdown) {
  headerRodColorDropdown.value = params.rodFrameColor;
  document.addEventListener("change", async function (event) {
    if (event.target.classList.contains("headerRodColorDropdown")) {
      setting[params.selectedGroupName].rodFrameColor = event.target.value;
      await otherModelSetup();
      await showHideNodes(modelGroup, scene, camera);
    }
  });
}

if (shelfTypeDropdown) {
  shelfTypeDropdown.value = params.defaultShelfType;
  document.addEventListener("change", async function (event) {
    if (event.target.classList.contains("shelfTypeDropdown")) {
      setting[params.selectedGroupName].defaultShelfType = event.target.value;
      await otherModelSetup();
      await showHideNodes(modelGroup, scene, camera);
    }
  });
}

if (slottedSidesToggle) {
  slottedSidesToggle.checked = params.slottedSidesToggle;
  document.addEventListener("change", async function (event) {
    if (event.target.classList.contains("slottedSidesToggle")) {
      setting[params.selectedGroupName].slottedSidesToggle =
        event.target.checked;

      await otherModelSetup();
      await showHideNodes(modelGroup, scene, camera);
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

        let currentGroup = modelGroup.getObjectByName(params.selectedGroupName);
        let defaultModelName = setting[params.selectedGroupName].defaultModel;

        let currentModel = currentGroup.getObjectByName(defaultModelName);
        let defaultHeaderSize =
          setting[params.selectedGroupName].defaultHeaderSize;
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

        let currentGroup = modelGroup.getObjectByName(params.selectedGroupName);
        let defaultModelName = setting[params.selectedGroupName].defaultModel;
        let defaultModel = currentGroup.getObjectByName(defaultModelName);

        const size = await getCurrentModelSize(defaultModel, "Cube1-Mat");
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
      setting[params.selectedGroupName].topFrameBackgroundColor =
        event.target.value;
      await otherModelSetup();
      await setTopFrameCropedImage();
    }
  });
}

if (headerFrameColorDropdown) {
  headerFrameColorDropdown.value = params.topFrameBackgroundColor;
  document.addEventListener("change", async function (event) {
    if (event.target.classList.contains("headerFrameColorDropdown")) {
      setting[params.selectedGroupName].topFrameBackgroundColor =
        event.target.value;
      await setTopFrameCropedImage();
    }
  });
}

if (mainFrameColorInput) {
  mainFrameColorInput.value = await getHex(params.mainFrameBackgroundColor);
  document.addEventListener("input", async function (event) {
    if (event.target.classList.contains("mainFrameColorInput")) {
      setting[params.selectedGroupName].mainFrameBackgroundColor =
        event.target.value;
      await setMainFrameCropedImage();
    }
  });
}

if (baseSelectorDropdown) {
  baseSelectorDropdown.value = params.selectedBaseFrame;
  document.addEventListener("change", async function (event) {
    if (event.target.classList.contains("baseSelectorDropdown")) {
      setting[params.selectedGroupName].selectedBaseFrame = event.target.value;
      await otherModelSetup();
      await showHideNodes(modelGroup, scene, camera);
    }
  });
}

if (baseColor) {
  baseColor.value = params.baseFrameColor;
  document.addEventListener("change", async function (event) {
    if (event.target.classList.contains("baseColor")) {
      setting[params.selectedGroupName].baseFrameColor = event.target.value;
      await otherModelSetup();
      await showHideNodes(modelGroup, scene, camera);
    }
  });
}

if (hangerClothesToggle) {
  hangerClothesToggle.checked = params.hangerClothesToggle;
  document.addEventListener("change", async function (event) {
    if (event.target.classList.contains("hangerClothesToggle")) {
      setting[params.selectedGroupName].hangerClothesToggle =
        event.target.checked;
      await otherModelSetup();
      await showHideNodes(modelGroup, scene, camera);
    }
  });
}

if (hangerGolfClubsToggle) {
  hangerGolfClubsToggle.checked = params.hangerGolfClubsToggle;
  document.addEventListener("change", async function (event) {
    if (event.target.classList.contains("hangerGolfClubsToggle")) {
      setting[params.selectedGroupName].hangerGolfClubsToggle =
        event.target.checked;
      await otherModelSetup();
      await showHideNodes(modelGroup, scene, camera);
    }
  });
}

if (hangerStandColor) {
  hangerStandColor.value = params.defaultHangerStandColor;
  document.addEventListener("change", async function (event) {
    if (event.target.classList.contains("hangerStandColor")) {
      setting[params.selectedGroupName].defaultHangerStandColor =
        event.target.value;
      await otherModelSetup();
      await showHideNodes(modelGroup, scene, camera);
    }
  });
}

if (rackShelfColor) {
  rackShelfColor.value = params.defaultRackShelfStandColor;
  document.addEventListener("change", async function (event) {
    if (event.target.classList.contains("rackShelfColor")) {
      setting[params.selectedGroupName].defaultRackShelfStandColor =
        event.target.value;
      await otherModelSetup();
      await showHideNodes(modelGroup, scene, camera);
    }
  });
}

if (rackStandColor) {
  rackStandColor.value = params.defaultRackStandStandColor;
  document.addEventListener("change", async function (event) {
    if (event.target.classList.contains("rackStandColor")) {
      setting[params.selectedGroupName].defaultRackStandStandColor =
        event.target.value;
      await otherModelSetup();
      await showHideNodes(modelGroup, scene, camera);
    }
  });
}

if (measurementToggle) {
  measurementToggle.checked = params.measurementToggle;

  measurementToggle.addEventListener("change", async function (event) {
    params.measurementToggle = event.target.checked;
    await otherModelSetup();
    await showHideNodes(modelGroup, scene, camera);
  });
}

if (cropButton) {
  cropButton.addEventListener("click", async function (event) {
    console.log("cropper", cropper);
    if (cropper) {
      let selectedGroupName = params.selectedGroupName;
      let defaultModel = setting[selectedGroupName].defaultModel;
      let defaultHeaderSize = setting[selectedGroupName].defaultHeaderSize;
      if (params.fileUploadFlag == "MainFrame") {
        mainFrameCropedImage = mainFrameCropedImage || {};
        mainFrameCropedImage[selectedGroupName] =
          mainFrameCropedImage[selectedGroupName] || {};
        mainFrameCropedImage[selectedGroupName][defaultModel] = cropper
          .getCroppedCanvas()
          .toDataURL("image/png");
        await setMainFrameCropedImage();
      } else if (params.fileUploadFlag == "TopFrame") {
        topFrameCropedImage = topFrameCropedImage || {};
        topFrameCropedImage[selectedGroupName] =
          topFrameCropedImage[selectedGroupName] || {};
        topFrameCropedImage[selectedGroupName][defaultModel] =
          topFrameCropedImage[selectedGroupName][defaultModel] || {};
        topFrameCropedImage[selectedGroupName][defaultModel][
          defaultHeaderSize
        ] = cropper.getCroppedCanvas().toDataURL("image/png");
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
      await otherModelSetup();
      await addHangers(
        modelGroup,
        hangerType,
        hanger_model,
        hanger_golf_club_model,
        scene,
        camera
      );
    }
  });
}

if (addRack) {
  document.addEventListener("click", async function (event) {
    if (event.target.closest(".addRack")) {
      const rackType = event.target.getAttribute("data-rack");
      await otherModelSetup();
      await addRacks(
        modelGroup,
        rackType,
        rack_wooden_model,
        rack_glass_model,
        scene,
        camera
      );
    }
  });
}

if (saveModelDataButton) {
  saveModelDataButton.addEventListener("click", async function () {
    const modelId = previousData && previousData.id ? previousData.id : 0;

    await traverseAsync(modelGroup, async (child) => {
      if (
        hangerNames.includes(child.name) &&
        child.hangerArrayKey &&
        child.hangerCount
      ) {
        params.hangerAdded = params.hangerAdded || {};
        params.hangerAdded[child.hangerArrayKey] =
          params.hangerAdded[child.hangerArrayKey] || {};
        params.hangerAdded[child.hangerArrayKey][child.hangerCount] =
          child.position;
      }
      if (
        rackNames.includes(child.name) &&
        child.rackArrayKey &&
        child.rackCount
      ) {
        console.log("params.rackAdded", params.rackAdded);
        console.log("child", child);
        console.log("child.name", child.name);

        params.rackAdded = params.rackAdded || {};
        params.rackAdded[child.rackArrayKey] =
          params.rackAdded[child.rackArrayKey] || {};
        params.rackAdded[child.rackArrayKey][child.rackCount] = child.position;
      }
    });

    const dataToSave = {
      params: params || null,
      setting: setting || null,
      group_names: allGroupNames || null,
      top_frame_croped_image: topFrameCropedImage || null,
      main_frame_croped_image: mainFrameCropedImage || null,
    };

    let projectName = (previousData && previousData.name) || null;
    let dataSave;
    if (modelId > 0) {
      dataSave = true;
    }
    if (!projectName) {
      // Prompt the user to enter a value
      projectName = prompt("Please enter a project name:");
      if (projectName !== null) {
        dataSave = true;
      }
    }

    // console.log('params.hangerAdded', params.hangerAdded);

    if (dataSave) {
      await saveModelData(projectName, dataToSave, modelId);
    }
  });
}

if (addAnotherModel) {
  addAnotherModel.forEach((button) => {
    button.addEventListener("click", async function () {
      await addAnotherModels(allGroupNames, modelGroup, scene, camera);
      await centerMainModel(modelGroup);
      await showHideNodes(modelGroup, scene, camera);
    });
  });
}

// Move Left
moveLeftModel.addEventListener("click", async () => {
  const selectedGroupName = params.selectedGroupName;
  const selectedModelGroup = modelGroup.getObjectByName(selectedGroupName);

  if (selectedModelGroup) {
    // Check for collision before moving left
    const canMoveLeft = await checkForCollision(
      modelGroup,
      selectedModelGroup,
      -params.moveLeftRight
    );

    if (canMoveLeft) {
      selectedModelGroup.position.x -= params.moveLeftRight; // Move selected model group left
      if (!selectedModelGroup.spacing) {
        selectedModelGroup.spacing = 0;
      }
      selectedModelGroup.spacing -= params.moveLeftRight;
      await drawMeasurementBoxesWithLabels(modelGroup, scene, camera);
    } else {
      console.log("Collision detected! Cannot move further left.");
    }
  } else {
    console.log(`Group ${selectedGroupName} not found.`);
  }
});

// Move Right
moveRightModel.addEventListener("click", async () => {
  const selectedGroupName = params.selectedGroupName;
  const selectedModelGroup = modelGroup.getObjectByName(selectedGroupName);

  if (selectedModelGroup) {
    // Check for collision before moving right
    const canMoveRight = await checkForCollision(
      modelGroup,
      selectedModelGroup,
      params.moveLeftRight
    );

    if (canMoveRight) {
      selectedModelGroup.position.x += params.moveLeftRight; // Move selected model group right
      if (!selectedModelGroup.spacing) {
        selectedModelGroup.spacing = 0;
      }
      selectedModelGroup.spacing += params.moveLeftRight;
      await drawMeasurementBoxesWithLabels(modelGroup, scene, camera);
    } else {
      console.log("Collision detected! Cannot move further right.");
    }
  } else {
    console.log(`Group ${selectedGroupName} not found.`);
  }
});

// moveLeftModel.addEventListener("click", async () => {
//   let defaultModelName = setting[params.selectedGroupName].defaultModel
//   let defaultModel = modelGroup.getObjectByName(defaultModelName);

//   if (defaultModel) {
//     // Check for collision before moving left
//     const canMoveLeft = await checkForCollision(
//       modelGroup,
//       defaultModel,
//       -params.moveLeftRight
//     );

//     if (canMoveLeft) {
//       defaultModel.position.x -= params.moveLeftRight; // Adjust the value to control the speed of movement
//       if (!defaultModel.spacing) {
//         defaultModel.spacing = 0;
//       }
//       defaultModel.spacing += params.moveLeftRight;
//       await drawMeasurementBoxesWithLabels(modelGroup, scene, camera);
//     } else {
//       console.log("Collision detected! Cannot move further left.");
//     }
//   }
// });

// moveRightModel.addEventListener("click", async () => {
//   let defaultModelName = setting[params.selectedGroupName].defaultModel
//   let defaultModel = modelGroup.getObjectByName(defaultModelName);

//   if (defaultModel) {
//     // Check for collision before moving right
//     const canMoveRight = await checkForCollision(
//       main_model,
//       defaultModel,
//       params.moveLeftRight
//     );

//     if (canMoveRight) {
//       defaultModel.position.x += params.moveLeftRight; // Adjust the value to control the speed of movement
//       if (!defaultModel.spacing) {
//         defaultModel.spacing = 0;
//       }
//       defaultModel.spacing += params.moveLeftRight;
//       await drawMeasurementBoxesWithLabels(modelGroup, scene, camera);
//     } else {
//       console.log("Collision detected! Cannot move further right.");
//     }
//   }
// });

// // Add event listeners for move buttons
// moveLeftModel.addEventListener("click", async () => {
//     let defaultModelName = params.selectedGroupName !== 'default' ? params.selectedGroupName : params.defaultModel;
//     let defaultModel = main_model.getObjectByName(defaultModelName);

//     if (defaultModel) {
//         defaultModel.position.x -= params.moveLeftRight; // Adjust the value to control the speed of movement
//         if (!defaultModel.spacing) {
//             defaultModel.spacing = 0
//         }
//         defaultModel.spacing -= params.moveLeftRight
//         console.log('defaultModel', defaultModel)
//         await drawMeasurementBoxesWithLabels(modelGroup, scene, camera)
//     }
// });

// moveRightModel.addEventListener("click", async () => {
//     let defaultModelName = params.selectedGroupName !== 'default' ? params.selectedGroupName : params.defaultModel;
//     let defaultModel = main_model.getObjectByName(defaultModelName);
//     if (defaultModel) {
//         defaultModel.position.x += params.moveLeftRight; // Adjust the value to control the speed of movement
//         if (!defaultModel.spacing) {
//             defaultModel.spacing = 0
//         }
//         defaultModel.spacing += params.moveLeftRight
//         await drawMeasurementBoxesWithLabels(modelGroup, scene, camera)
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
// ----------------------------------------------------------------------------------------------------------
async function checkFileExists(url) {
  // Poll the server every 500ms to check if the file exists
  let FileFound = false;
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  if (/iPhone|iPad|iPod/.test(userAgent)) {
    url = `${url}.usdz`;
  } else {
    url = `${url}.glb`;
  }
  while (!FileFound) {
    try {
      const response = await fetch(url, { method: "HEAD" });
      if (response.ok) return true; // File exists, exit the loop
    } catch (error) {
      alert("Checking file existence failed:", error);
    }
  }
  return false; // File not found after max attempts
}
function showLoadingModal() {
  document.getElementById("loadingModal").style.display = "flex";
}

function hideLoadingModal() {
  document.getElementById("loadingModal").style.display = "none";
}

closeButton.addEventListener("click", () => {
  document.body.removeChild(document.getElementById("ArView"));
});

if (closeButtonAR) {
  closeButtonAR.addEventListener("click", () => {
    let arviewer = document.getElementById("ArView");
    arviewer.style.display = "none";
  });
}
// ----------------------------------------------------------------------------------------------------------
async function cloneModelGroup(model) {
  let cloneModelGroup = model.clone();
  let CloneArr = [];
  await traverseAsync(cloneModelGroup, async (node) => {
    if (node.visible && node.name.startsWith("Hanger_")) {
      console.log(node);
      node.parent.remove(node);
    }
  });
  await traverseAsync(cloneModelGroup, async (node) => {
    if (node.visible && node.name.startsWith("Model_")) {
      CloneArr.push(node);
    }
  });
  // Process each node in CloneArr to remove invisible children
  CloneArr.forEach((node) => {
    node.children.slice().forEach((childNode) => {
      if (!childNode.visible) {
        if (childNode.parent) {
          childNode.parent.remove(childNode);
        } else {
          const index = node.children.indexOf(childNode);
          if (index !== -1) {
            node.children.splice(index, 1);
          }
        }
      } else if (childNode.name == "Cone") {
        childNode.parent.remove(childNode);
      }
    });
  });
  console.log(CloneArr);

  return CloneArr;
}
async function cloneMainModelGroup(model) {
  let cloneModelGroup = model.clone();
  let CloneArr = [];
  // Traverse to find visible models that start with "Model_"
  await traverseAsync(cloneModelGroup, async (node) => {
    if (node.visible && node.name.startsWith("Hanger_")) {
      node.parent.remove(node);
    }
  });
  cloneModelGroup.children.forEach(async (child) => {
    await child.traverse((node) => {
      if (node.visible && node.name.startsWith("Model_")) {
        CloneArr.push(node);
      }
    });
  });
  // Process each node in CloneArr to remove invisible children and unnecessary nodes
  CloneArr.forEach((node) => {
    node.children.slice().forEach((childNode) => {
      if (!childNode.visible) {
        // Remove invisible child nodes
        childNode.parent.remove(childNode);
      } else if (childNode.name === "Cone") {
        // Remove nodes named "Cone"
        childNode.parent.remove(childNode);
      }
    });
  });
  // Calculate combined bounding box for all models in CloneArr
  const combinedBox = new THREE.Box3();
  CloneArr.forEach((node) => {
    const nodeBox = new THREE.Box3().setFromObject(node);
    combinedBox.union(nodeBox); // Expand the combined bounding box to include this model's bounding box
  });
  return combinedBox;
}
// Helper function to render and download a screenshot
async function renderAndDownload(
  viewName,
  camera,
  tempRenderer,
  name,
  imagesNameArr
) {
  tempRenderer.render(scene, camera);
  const screenshotData = tempRenderer.domElement.toDataURL();
  const unixTime = Math.floor(Date.now() / 1000);
  await downloadScreenshotwithDiffCanvas(
    screenshotData,
    `model-${name}-${viewName}-${unixTime}.png`
  );
  imagesNameArr.push(`./screenshots/model-${name}-${viewName}-${unixTime}.png`);
}

// Function to download the image
async function downloadScreenshotwithDiffCanvas(dataUrl, filename) {
  // const link = document.createElement("a");
  // link.href = dataUrl;
  // link.download = filename;
  // link.click();
  // return;
  
  await removeBlankSpacesFromImage(dataUrl , async (croppedImage) => {
    try {
      const response = await fetch("api.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: croppedImage,
          filename: filename,
        }),
      });
      const data = await response.json();
      if (data.success) {
      } else {
        console.error("Error saving screenshot:", data.error);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  });

}

async function removeBlankSpacesFromImage(imageSrc, callback) {
  const img = new Image();
  img.src = imageSrc;
  img.onload = function () {
    // Create a canvas to work with the image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    
    // Draw the image onto the canvas
    ctx.drawImage(img, 0, 0);

    // Get the image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { data, width, height } = imageData;

    let top = 0, bottom = height, left = 0, right = width;

    // Find the top boundary
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const alpha = data[(y * width + x) * 4 + 3];
        if (alpha > 0) {
          top = y;
          break;
        }
      }
      if (top !== 0) break;
    }

    // Find the bottom boundary
    for (let y = height - 1; y >= 0; y--) {
      for (let x = 0; x < width; x++) {
        const alpha = data[(y * width + x) * 4 + 3];
        if (alpha > 0) {
          bottom = y;
          break;
        }
      }
      if (bottom !== height) break;
    }

    // Find the left boundary
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const alpha = data[(y * width + x) * 4 + 3];
        if (alpha > 0) {
          left = x;
          break;
        }
      }
      if (left !== 0) break;
    }

    // Find the right boundary
    for (let x = width - 1; x >= 0; x--) {
      for (let y = 0; y < height; y++) {
        const alpha = data[(y * width + x) * 4 + 3];
        if (alpha > 0) {
          right = x;
          break;
        }
      }
      if (right !== width) break;
    }

    // Crop dimensions
    const cropWidth = right - left + 1;
    const cropHeight = bottom - top + 1;

    // Draw the cropped image
    const croppedCanvas = document.createElement('canvas');
    const croppedCtx = croppedCanvas.getContext('2d');
    croppedCanvas.width = cropWidth;
    croppedCanvas.height = cropHeight;

    croppedCtx.drawImage(
      canvas,
      left, top, cropWidth, cropHeight,
      0, 0, cropWidth, cropHeight
    );

    // Convert cropped canvas to a new image
    const croppedImage = croppedCanvas.toDataURL();
    callback(croppedImage); // Return the cropped image as a data URL
  };
}



async function captureModelImages(modelGroup) {
  let imagesNameArr = [];
  scene.background = null; // No background color for transparency

  // Convert forEach to for...of loop for proper async handling
  for (const model of modelGroup.children) {
    let isCorn = false;

    // Step 1: Calculate the bounding box for the current model
    let modelSize = await cloneModelGroup(model);
    // return

    const box = new THREE.Box3().setFromObject(modelSize[0]);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    console.log(size);
    console.log(box);

    // Prepare a temporary canvas for rendering
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = size.x;
    tempCanvas.height = size.y;
    const tempRenderer = new THREE.WebGLRenderer({
      canvas: tempCanvas,
      alpha: true,
    });
    tempRenderer.setSize(tempCanvas.width, tempCanvas.height);
    tempRenderer.setClearColor(0x000000, 0);

    // Check for Cone nodes
    for (const modelChild of model.children) {
      if (modelChild.visible) {
        modelChild.traverse((node) => {
          if (node.name === "Cone" && node.visible === true) {
            isCorn = true;
            node.visible = false;
          }
        });
      }
    }

    // Hide other models
    scene.children.forEach((childScene) => {
      if (childScene.name === "main_group") {
        childScene.children.forEach((child) => {
          if (child.name !== model.name) {
            child.visible = false;
          }
        });
      }
    });

    // Front view
    const frontCamera = new THREE.PerspectiveCamera(
      45,
      size.x / size.y,
      0.1,
      10000
    );
    let adjustedMultiplier = 3.4;
    var s = 700 * adjustedMultiplier;
    frontCamera.position.set(center.x, center.y, center.z + s);
    frontCamera.lookAt(center);

    // Wait for front view render to complete
    await renderAndDownload(
      "front",
      frontCamera,
      tempRenderer,
      model.name,
      imagesNameArr
    );

    // Side view
    tempCanvas.width = size.z;
    tempCanvas.height = size.y;
    tempRenderer.setSize(tempCanvas.width, tempCanvas.height);
    const sideCamera = new THREE.PerspectiveCamera(
      45,
      size.z / size.y,
      1,
      10000
    );

    var sr = box.max.x + 2000;
    sideCamera.position.set(sr, center.y, center.z);
    sideCamera.lookAt(center);

    // Wait for side view render to complete
    await renderAndDownload(
      "side",
      sideCamera,
      tempRenderer,
      model.name,
      imagesNameArr
    );

    // Diagonal view setup
    tempCanvas.width = size.x + size.z / 2;
    tempCanvas.height = size.y;
    tempRenderer.setSize(tempCanvas.width, tempCanvas.height);
    const diagonalCamera = new THREE.PerspectiveCamera(
      45,
      (size.x + size.z / 2) / size.y,
      10,
      100000
    );

    // Calculate camera position for diagonal view
    let xMultiplier = 0.8;
    let yMultiplier = 0.4;
    let zMultiplier =
      size.x <= 800 ? 3.2 : size.x < 1500 ? 3.4 : size.x <= 3000 ? 3.5 : 3.7;

    const cameraPos = {
      x: center.x + size.x * xMultiplier,
      y: center.y + size.y * yMultiplier,
      z: center.z + 700 * zMultiplier,
    };

    diagonalCamera.position.set(cameraPos.x, cameraPos.y, cameraPos.z);
    diagonalCamera.fov = 45;
    diagonalCamera.updateProjectionMatrix();
    diagonalCamera.lookAt(center);

    // Wait for diagonal view render to complete
    await renderAndDownload(
      "diagonal",
      diagonalCamera,
      tempRenderer,
      model.name,
      imagesNameArr
    );

    // Restore visibility
    scene.children.forEach((childScene) => {
      if (childScene.name === "main_group") {
        childScene.children.forEach((child) => {
          child.visible = true;
        });
      }
    });

    // Restore Cone visibility
    if (isCorn) {
      for (const modelChild of model.children) {
        modelChild.traverse((node) => {
          if (node.name === "Cone") {
            node.visible = true;
          }
        });
      }
    }
  }

  // Whole model capture
  const Outerbox = await cloneMainModelGroup(modelGroup);
  const outerSize = Outerbox.getSize(new THREE.Vector3());
  const outerCenter = Outerbox.getCenter(new THREE.Vector3());

  const outerTempCanvas = document.createElement("canvas");
  outerTempCanvas.width =
    outerSize.x < 1000 ? outerSize.x + outerSize.x / 2 : outerSize.x;
  outerTempCanvas.height = outerSize.y;

  const outerTempRenderer = new THREE.WebGLRenderer({
    canvas: outerTempCanvas,
    alpha: true,
  });
  outerTempRenderer.setSize(outerTempCanvas.width, outerTempCanvas.height);
  outerTempRenderer.setClearColor(0x000000, 0);

  let parentName,
    grandparentName,
    isCorn = false;

  // Find and handle Cone visibility
  modelGroup.traverse((node) => {
    if (node.name === "Cone" && node.visible) {
      parentName = node.parent.name;
      grandparentName = node.parent.parent.name;
      node.visible = false;
      isCorn = true;
    }
  });

  const outerCamera = new THREE.PerspectiveCamera(
    45,
    (outerSize.x + outerSize.z / 2) / outerSize.y,
    10,
    100000
  );
  // Calculate camera position for diagonal view
  let xMultiplier = 0.8;
  let yMultiplier = 0.4;
  let zMultiplier =
    outerSize.x < 1500
      ? 3.4
      : outerSize.x <= 3000
      ? 3.6
      : outerSize.x <= 5000
      ? 3.8
      : 7;
  console.log("s", outerSize.x);
  console.log("m", zMultiplier);

  const cameraPos = {
    x: outerCenter.x + outerSize.x * xMultiplier,
    y: outerCenter.y + outerSize.y * yMultiplier,
    z: outerCenter.z + 700 * zMultiplier,
  };

  outerCamera.position.set(cameraPos.x, cameraPos.y, cameraPos.z);
  outerCamera.fov = 45;
  outerCamera.updateProjectionMatrix();
  outerCamera.lookAt(outerCenter);

  // Wait for diagonal view render to complete
  await renderAndDownload(
    "wholeModel",
    outerCamera,
    outerTempRenderer,
    modelGroup.name,
    imagesNameArr
  );

  // Restore scene background
  scene.backgroundBlurriness = params.blurriness;
  texture_background.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture_background;
  scene.environment = texture_background;

  return imagesNameArr;
}

// Modified download function with proper async handling
// async function downloadScreenshotwithDiffCanvas(dataUrl, filename) {
//   return new Promise((resolve, reject) => {
//     const link = document.createElement("a");
//     link.href = dataUrl;
//     link.download = filename;
//     link.onclick = () => resolve();
//     link.onerror = () => reject(new Error("Download failed"));
//     link.click();
//   });
// }

if (takeScreenShot) {
  takeScreenShot.addEventListener("click", async function () {
    await captureModelImages(modelGroup);
  });
}
// ----------------------------------------------------------------------------------------------------------


if (createQrButton) {
  createQrButton.addEventListener("click", async function () {
    const unixTimestamp = Math.floor(Date.now() / 1000);
    const modelName = `main_group_${unixTimestamp}`;
    const exportedModelFileUrl = `/export_models/${modelName}`;
    const isQr = true
    const closeBtn = document.getElementById("closeBtn");
    const showQRHere = document.getElementById("showQRHere");
    closeBtn.addEventListener("click", async function () {
      showQRHere.style.display = "none";
    })
    await exportUsdz(modelGroup, modelName, isQr);
    const data = {};
    data["action"] = "create_qr_code";
    data["url"] = exportedModelFileUrl;

    const qr_data = JSON.stringify(data);
    fetch("api.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: qr_data,
    })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        console.log("Model data saved successfully!");
        document.getElementById("qrImage").src = data.url;
        showQRHere.style.display = "flex";
      } else {
        console.error("Error saving model data:", data.error);
      }
    })
  });
}




// ----------------------------------------------------------------------------------------------------------
if (showInAR) {
  showInAR.addEventListener("click", async function () {
    showLoadingModal();
    const unixTimestamp = Math.floor(Date.now() / 1000);
    const modelName = `main_group_${unixTimestamp}`;
    const exportedModelFileUrl = `./export_models/${modelName}`;

    await exportUsdz(modelGroup, modelName);

    // Check if the file exists
    if (await checkFileExists(exportedModelFileUrl)) {
      hideLoadingModal();
      // Configure model viewer attributes
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      if (/iPhone|iPad|iPod/.test(userAgent)) {
        let ViewArForIos = document.getElementById("ViewArForIos");
        ViewArForIos.style.display = "block";
        ViewArForIos.href = `${exportedModelFileUrl}.usdz`;
        ViewArForIos.click();
      } else if (/Android/.test(userAgent)) {
        // Create or update the AR viewer
        const modelViewer = document.getElementById("modelViewer");
        let ArViewer = document.getElementById("ArView");
        ArViewer.style.display = "block";
        modelViewer.setAttribute("src", `${exportedModelFileUrl}.glb`);
        modelViewer.setAttribute("ar-modes", "scene-viewer");
        modelViewer.addEventListener("load", () => {
          modelViewer.enterAR();
        });
      } else {
        alert("This feature is only supported on iOS and Android devices.");
      }
    } else {
      console.error("File was not found within the expected time.");
      hideLoadingModal();
    }
  });
}
// ----------------------------------------------------------------------------------------------------------
if (savePdfButton) {
  savePdfButton.addEventListener("click", async function () {
    CreatingPdfFile.style.display = "flex";
    await traverseAsync(modelGroup, async (child) => {
      if (
        hangerNames.includes(child.name) &&
        child.hangerArrayKey &&
        child.hangerCount
      ) {
        params.hangerAdded = params.hangerAdded || {};
        params.hangerAdded[child.hangerArrayKey] =
          params.hangerAdded[child.hangerArrayKey] || {};
        params.hangerAdded[child.hangerArrayKey][child.hangerCount] =
          child.position;
      }
      if (
        rackNames.includes(child.name) &&
        child.rackArrayKey &&
        child.rackCount
      ) {
        console.log("params.rackAdded", params.rackAdded);
        console.log("child", child);
        console.log("child.name", child.name);

        params.rackAdded = params.rackAdded || {};
        params.rackAdded[child.rackArrayKey] =
          params.rackAdded[child.rackArrayKey] || {};
        params.rackAdded[child.rackArrayKey][child.rackCount] = child.position;
      }
    });

    let ModelImageName = await captureModelImages(modelGroup);

    const dataToSave = {
      params: params || null,
      setting: setting || null,
      group_names: allGroupNames || null,
      top_frame_croped_image: topFrameCropedImage || null,
      main_frame_croped_image: mainFrameCropedImage || null,
      ModelImageName: ModelImageName || null,
    };
    await delay(200)
    await savePdfData("test", dataToSave, modelGroup, camera, renderer, scene);
  });
}
// ----------------------------------------------------------------------------------------------------------
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
    params.selectedGroupName = modelName;
    await otherModelSetup();
    await showHideNodes(modelGroup, scene, camera);
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

// Initialize Bootstrap tooltips
document.addEventListener("DOMContentLoaded", function () {
  var tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
});
