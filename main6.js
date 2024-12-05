// Display loader progress
import { UIManager } from "./src/managers/UIManager.js";
const uiManager = new UIManager();

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
    uiManager.loadingElements.progressBarFill.style.width = `${simulatedProgress}%`;
    uiManager.loadingElements.progressText.innerText = `Loading... ${Math.round(
      simulatedProgress
    )}%`;
    requestAnimationFrame(simulateProgress); // Continue animation until 100%
  } else {
    uiManager.loadingElements.loaderElement.style.display = "none";
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
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import {
  loadGLTFModel,
  manager,
  rgbeLoader,
  TextureLoaderJpg,
} from "./src/managers/loadingManager.js";
import { exportModelForAr } from "./src/managers/exportModelManager.js";
import {
  clothsMaterial,
  commonMaterial,
  addNewMaterials,
  restoreMaterials,
} from "./src/managers/materialManager.js";
import { Camera } from "./src/core/Camera.js";
import { Renderer } from "./src/core/Renderer.js";
import { Scene } from "./src/core/Scene.js";
import { Controls } from "./src/core/Controls.js";
import {
  getModelSize,
  getHeaderSize,
  computeBoundingBox,
  calculateBoundingBox,
  getNodeSize,
  getCurrentModelSize,
} from "./src/managers/MeasurementManager.js";
import {
  setTopFrameCropedImage,
  setMainFrameCropedImage,
  setTextureParams,
} from "./src/managers/frameImagesManager.js";
import {
  addHangers,
  cloneWithCustomHangerProperties,
  setupHangerModel,
  setupHangerGolfClubModel,
} from "./src/managers/hangerManager.js";
import {
  // cloneWithCustomHangerProperties,
  drawMeasurementBoxesWithLabels,
  setupHeaderWoodenShelfModel,
  setupHeaderGlassShelfModel,
  setupGlassShelfFixingModel,
  cloneWithCustomProperties,
  setupHeader500HeightModel,
  // setupHangerGolfClubModel,
  updateMeasurementGroups,
  setupSlottedSidesModel,
  generateGlassMaterial,
  setupSupportBaseModel,
  setupWoodenRackModel,
  updateLabelOcclusion,
  findParentNodeByName,
  // calculateBoundingBox,
  // getCurrentModelSize,
  setupGlassRackModel,
  // getNextVisibleChild,
  // getPrevVisibleChild,
  addAnotherModelView,
  // computeBoundingBox,
  getMainParentNode,
  checkForCollision,
  setPositionCenter,
  initLabelRenderer,
  // setupHangerModel,
  addAnotherModels,
  // isVisibleParents,
  // setTextureParams,
  // restoreMaterials,
  // addNewMaterials,
  // updateFrameSize,
  centerMainModel,
  setupArrowModel,
  // commonMaterial,
  setupMainModel,
  // cleanModelName,
  loaderShowHide,
  traverseAsync,
  getRemoveIcon,
  saveModelData,
  // checkMeshType,
  // loadGLTFModel,
  showHideNodes,
  getModelData,
  // getModelSize,
  // isHangerAdd,
  // getNodeSize,
  savePdfData,
  // setupModel,
  // exportUsdz,
  // addHangers,
  // loadModel,
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
  // topFrameCropedImage,
  // mainFrameCropedImage,
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
let sharedData = {
  topFrameCropedImage: null,
  mainFrameCropedImage: null,
};
const lights = [];
const lightHelpers = [];
window["shadow"] = await commonMaterial(0x444444);

// Start simulating progress when the window loads
window.addEventListener("load", async () => {
  try {
    uiManager.loadingElements.loaderElement.style.display = "flex"; // Show the loader

    // Initialize the scene with the loaded resources
    await init().catch(function (err) {
      console.error(err);
    });
  } catch (error) {
    console.error("Error loading assets:", error);
    uiManager.loadingElements.progressText.innerText =
      "Failed to load resources. Please try again.";
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

  if (assetsLoaded === totalAssets) {
    simulatedProgress = 100; // Ensure we finish at 100%
  }
};

// Hide the loader once all items are loaded
manager.onLoad = () => {
  console.log("All assets loaded");
};

// Error handling
manager.onError = (url) => {
  console.error(`There was an error loading ${url}`);
  uiManager.loadingElements.progressText.innerText =
    "Failed to load some resources. Please try again.";
};

async function init() {
  texture_background = await TextureLoaderJpg.loadAsync("background.png");

  renderer = new Renderer(uiManager.elements.container, render);
  renderer.setAnimationLoop(render);

  scene = new Scene();
  scene.setupScene(window, texture_background, lights, lightHelpers);

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  direction = new THREE.Vector3(); // Initialize direction vector

  camera = new Camera(45, window.innerWidth / window.innerHeight, 1, 500000);
  // Set initial camera position
  camera.position.set(2000, 1000, 2000);
  controls = new Controls(camera, renderer.domElement);

  modelGroup = new THREE.Group();
  scene.add(modelGroup);

  // controls.addEventListener('change', () => {
  //   // Calculate and print the camera's position relative to the model
  //   const cameraPosition = camera.position.clone(); // Get a copy of the camera's position
  //   const modelPosition = modelGroup.position.clone(); // Get a copy of the model's position
  //   const relativePosition = cameraPosition.sub(modelPosition);

  //   // console.log('Camera Position:', camera.position); // Print camera position
  //   // console.log('Relative Position (from model to camera):', relativePosition); // Print relative position

  //   // Render the scene (only needed if you are not using a continuous loop)
  //   renderer.render(scene, camera);
  // });

  main_model = await loadGLTFModel(params.defaultModel + ".glb");
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
      let model_load = await loadGLTFModel(model_name);
      await setupMainModel(model_load);
      let model = model_load.getObjectByName(val);
      model.visible = false;
      main_model.add(model);
    }
  }

  await showHideNodes(modelGroup, scene, camera);

  // Transform controls
  transformControls = new TransformControls(camera, renderer.domElement);
  transformControls.addEventListener("dragging-changed", (event) => {
    controls.enabled = !event.value;
  });
  scene.add(transformControls);

  // Add event listeners
  window.addEventListener(
    "mousemove",
    (event) => {
      uiManager.onMouseMove(event, mouse, raycaster, camera, modelGroup);
    },
    false
  );
  window.addEventListener(
    "click",
    uiManager.onMouseClick(
      transformControls,
      selectedNode,
      scene,
      camera,
      modelGroup
    ),
    false
  );
  window.addEventListener("resize", uiManager.onWindowResize(camera, renderer));

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
    hanger_golf_club_model = await loadGLTFModel("hanger_golf_club_model.glb");
    await setupHangerGolfClubModel(hanger_golf_club_model);
    let Golfloader = document.querySelector(".Hanger_Golf_Club_Driver_loader");
    removeLoader(Golfloader);
    let Golfloader2 = document.querySelector(".Hanger_Golf_Club_Iron_loader");
    removeLoader(Golfloader2);
  }

  if (!rack_glass_model) {
    rack_glass_model = await loadGLTFModel("rack_glass_model.glb");
    await setupGlassRackModel(rack_glass_model, texture_background);
  }
  if (!rack_wooden_model) {
    rack_wooden_model = await loadGLTFModel("rack_wooden_model.glb");
    await setupWoodenRackModel(rack_wooden_model);
  }

  labelRenderer = await initLabelRenderer();
  document.body.appendChild(labelRenderer.domElement);

  await loadPreviousModels();
  uiManager.setupEventListeners(
    modelGroup,
    scene,
    camera,
    renderer,
    lights,
    lightHelpers,
    transformControls,
    mouse,
    raycaster,
    sharedData,
    cropper,
    hanger_model,
    hanger_golf_club_model,
    rack_wooden_model,
    rack_glass_model,
    selectedNode
  );
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
      sharedData.mainFrameCropedImage = previousData.main_frame_croped_image;
      sharedData.topFrameCropedImage = previousData.top_frame_croped_image;

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

        await setTopFrameCropedImage(
          sharedData.topFrameCropedImage,
          modelGroup
        );
        await setMainFrameCropedImage(
          sharedData.mainFrameCropedImage,
          modelGroup
        );
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
    hanger_rail_step = await loadGLTFModel("Hanger_Rail_Step.glb");
    await setupHangerModel(hanger_rail_step);
    hanger_model = hanger_rail_step;
    let loader = document.querySelector(".Hanger_Rail_Step_loader");
    removeLoader(loader);
  }
  if (!hanger_rail_single) {
    hanger_rail_single = await loadGLTFModel("Hanger_Rail_Single.glb");
    await setupHangerModel(hanger_rail_single);
    hanger_rail_single =
      hanger_rail_single.getObjectByName("Hanger_Rail_Single");
    hanger_model.add(hanger_rail_single);
    let loader = document.querySelector(".Hanger_Rail_Single_loader");
    removeLoader(loader);
  }

  if (!hanger_rail_d_500) {
    hanger_rail_d_500 = await loadGLTFModel("Hanger_Rail_D_500mm.glb");
    await setupHangerModel(hanger_rail_d_500);
    hanger_rail_d_500 = hanger_rail_d_500.getObjectByName(
      "Hanger_Rail_D_500mm"
    );
    hanger_model.add(hanger_rail_d_500);
    let loader = document.querySelector(".Hanger_Rail_D_500mm_loader");
    removeLoader(loader);
  }

  if (!hanger_rail_d_1000) {
    hanger_rail_d_1000 = await loadGLTFModel("Hanger_Rail_D_1000mm.glb");
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
export async function otherModelSetup() {
  if (!arrow_model) {
    arrow_model = await loadGLTFModel("arrow_model.glb");
    await setupArrowModel(modelGroup, arrow_model);
  }
  if (!header_rod_model) {
    header_rod_model = await loadGLTFModel("header_rod_model.glb");
    params.rodSize = await getNodeSize(header_rod_model);
  }
  if (!header_glass_shelf_fixing_model) {
    header_glass_shelf_fixing_model = await loadGLTFModel(
      "header_glass_shelf_fixing_model.glb"
    );
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
      "header_500_height_model.glb"
    );
    await setupHeader500HeightModel(modelGroup, header_500_height_model);
  }
  if (!header_wooden_shelf_model) {
    header_wooden_shelf_model = await loadGLTFModel(
      "header_wooden_shelf_model.glb"
    );
    await setupHeaderWoodenShelfModel(modelGroup, header_wooden_shelf_model);
  }
  if (!header_glass_shelf_model) {
    header_glass_shelf_model = await loadGLTFModel(
      "header_glass_shelf_model.glb"
    );
    await setupHeaderGlassShelfModel(
      modelGroup,
      header_glass_shelf_model,
      texture_background
    );
  }
  if (!slotted_sides_model) {
    slotted_sides_model = await loadGLTFModel("slotted_sides_model.glb");
    await setupSlottedSidesModel(modelGroup, slotted_sides_model);
  }

  if (!support_base_middle || !support_base_side) {
    support_base_middle = await loadGLTFModel("support_base_middle.glb");
    support_base_side = await loadGLTFModel("support_base_sides.glb");
    await setupSupportBaseModel(
      modelGroup,
      support_base_middle,
      support_base_side
    );
  }
}

if (uiManager.elements.headerFrameColorInput) {
  uiManager.elements.headerFrameColorInput.value = await getHex(
    params.topFrameBackgroundColor
  );

  document.addEventListener("input", async function (event) {
    if (event.target.classList.contains("headerFrameColorInput")) {
      setting[params.selectedGroupName].topFrameBackgroundColor =
        event.target.value;
      console.log(sharedData);

      await setTopFrameCropedImage(
        sharedData.topFrameCropedImage,
        modelGroup,
        params,
        setting
      );
    }
  });
}

if (uiManager.elements.mainFrameColorInput) {
  uiManager.elements.mainFrameColorInput.value = await getHex(
    params.mainFrameBackgroundColor
  );
  document.addEventListener("input", async function (event) {
    if (event.target.classList.contains("mainFrameColorInput")) {
      setting[params.selectedGroupName].mainFrameBackgroundColor =
        event.target.value;
      await setMainFrameCropedImage(
        sharedData.mainFrameCropedImage,
        modelGroup,
        params,
        setting
      );
    }
  });
}

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
    // console.log("selectedModel_pass", selectedModel);
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

// Function to update texture or color on selection
export async function updateMaterial(
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
    // if (type && type == "color" && value && value == "0xffffff") {
    //   renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // } else {
    //   renderer.toneMapping = THREE.AgXToneMapping;
    // }
    // await lightSetup();
    await scene.lightSetup(lights, lightHelpers);
  }
  // console.log(main_model)
}

if (uiManager.elements.saveModelDataButton) {
  uiManager.elements.saveModelDataButton.addEventListener(
    "click",
    async function () {
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
          params.rackAdded[child.rackArrayKey][child.rackCount] =
            child.position;
        }
      });

      const dataToSave = {
        params: params || null,
        setting: setting || null,
        group_names: allGroupNames || null,
        top_frame_croped_image: sharedData.topFrameCropedImage || null,
        main_frame_croped_image: sharedData.mainFrameCropedImage || null,
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
    }
  );
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

// if (captureButton) {
//   captureButton.addEventListener("click", async function () {
//     // Save the original size of the renderer
//     const originalWidth = renderer.domElement.width;
//     const originalHeight = renderer.domElement.height;

//     // Set higher resolution (2x or 3x the original resolution)
//     const scaleFactor = 3; // You can adjust this factor
//     renderer.setSize(
//       originalWidth * scaleFactor,
//       originalHeight * scaleFactor,
//       false
//     );
//     camera.aspect =
//       (originalWidth * scaleFactor) / (originalHeight * scaleFactor);
//     camera.updateProjectionMatrix();

//     // Render the scene at higher resolution
//     renderer.render(scene, camera);

//     // Get the canvas from the renderer
//     const canvas = renderer.domElement;

//     // Get the high-resolution image data from the canvas
//     const imageData = canvas.toDataURL("image/png");

//     // Create an image element to display the captured image
//     const image = new Image();
//     image.src = imageData;

//     // Optionally, style the image for better display (fit to screen)
//     image.style.maxWidth = "100%";
//     image.style.height = "auto";
//     document.body.appendChild(image);

//     // Optionally, trigger a download
//     const link = document.createElement("a");
//     link.href = imageData;
//     link.download = "high-res-model-image.png";
//     link.click();

//     // Remove the image from the DOM after download
//     image.onload = function () {
//       // Wait for the image to be fully loaded before removing it
//       document.body.removeChild(image);
//     };

//     // Revert the renderer back to its original size
//     renderer.setSize(originalWidth, originalHeight, false);
//     camera.aspect = originalWidth / originalHeight;
//     camera.updateProjectionMatrix();

//     // Re-render the scene at the original size
//     renderer.render(scene, camera);
//   });
// }

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
function showLoadingModal(message) {
  document.getElementById("loadingModal").style.display = "flex";
  document.getElementById("loadingText").innerHTML = message;
}

function hideLoadingModal() {
  document.getElementById("loadingModal").style.display = "none";
}

if (uiManager.elements.closeButtonAR) {
  uiManager.elements.closeButtonAR.addEventListener("click", () => {
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
      // console.log(node);
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
  // console.log(CloneArr);

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

async function renderAndDownload(
  viewName,
  camera,
  tempRenderer,
  name,
  imagesNameArr
) {
  // Store original renderer size and camera properties
  const originalWidth = tempRenderer.domElement.width;
  const originalHeight = tempRenderer.domElement.height;
  const originalAspect = camera.aspect;
  const originalPosition = camera.position.clone();
  const originalRotation = camera.rotation.clone();
  const originalQuaternion = camera.quaternion.clone();
  try {
    // Set higher resolution (2x or 3x the original resolution)
    let scaleFactor = 3; // Default scale factor

    if (
      (viewName === "diagonal" || viewName === "wholeModel") &&
      originalWidth * 3 > 5000
    ) {
      scaleFactor = 2;
    } else if (
      viewName === "front" &&
      (originalWidth >= 3000 || originalWidth * 3 > 5000)
    ) {
      scaleFactor = 2;
    }
    tempRenderer.setSize(
      originalWidth * scaleFactor,
      originalHeight * scaleFactor,
      true
    );

    // Update camera aspect and projection matrix
    camera.aspect =
      (originalWidth * scaleFactor) / (originalHeight * scaleFactor);
    camera.updateProjectionMatrix();
    // Render the scene and capture the screenshot
    tempRenderer.render(scene, camera);
    const screenshotData = tempRenderer.domElement.toDataURL("image/png");
    const unixTime = Math.floor(Date.now() / 1000);

    // Download or save the screenshot
    await downloadScreenshotwithDiffCanvas(
      screenshotData,
      `model-${name}-${viewName}-${unixTime}.png`
    );
    imagesNameArr.push(
      `./screenshots/model-${name}-${viewName}-${unixTime}.png`
    );
  } finally {
    // Restore renderer size
    tempRenderer.setSize(originalWidth, originalHeight, true);

    // Restore camera properties
    camera.aspect = originalAspect;
    camera.position.copy(originalPosition);
    camera.rotation.copy(originalRotation);
    camera.quaternion.copy(originalQuaternion);
    camera.updateProjectionMatrix();
  }
}

async function downloadScreenshotwithDiffCanvas(dataUrl, filename) {
  // const link = document.createElement("a");
  // link.href = dataUrl;
  // link.download = filename;
  // link.click();
  // return;
  const croppedImage = await removeBlankSpacesFromImage(dataUrl);
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
}

function removeBlankSpacesFromImage(imageSrc) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = function () {
      // Create a canvas to work with the image
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the image onto the canvas
      ctx.drawImage(img, 0, 0);

      // Get the image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const { data, width, height } = imageData;

      let top = 0,
        bottom = height,
        left = 0,
        right = width;

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
      const croppedCanvas = document.createElement("canvas");
      const croppedCtx = croppedCanvas.getContext("2d");
      croppedCanvas.width = cropWidth;
      croppedCanvas.height = cropHeight;

      croppedCtx.drawImage(
        canvas,
        left,
        top,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      );

      // Convert cropped canvas to a new image
      const croppedImage = croppedCanvas.toDataURL();
      resolve(croppedImage); // Resolve the promise with the cropped image as a data URL
    };

    img.onerror = reject; // In case of an error, reject the promise
  });
}

async function captureMainFixtureImage(
  camera,
  tempRenderer,
  CloneModel,
  MainmodelName,
  imagesNameArr,
  modelChild
) {
  const Frame = CloneModel.getObjectByName("Frame");
  for (const child of Frame.children) {
    if (child.name.startsWith("Hanger_")) {
      let HangerModel;
      await traverseAsync(child, async (subChild) => {
        if (
          subChild.parent.name !== "Frame" &&
          subChild.name !== "Hanger_Stand" &&
          subChild.parent !== null
        ) {
          subChild.parent.remove(subChild);
        } else if (subChild.name !== "Hanger_Stand") {
          subChild.visible = false;
        } else {
          HangerModel = subChild;
        }
      });
      const hangerNames = imagesNameArr
        .map((url) => url.split("/").pop()) // Get the file name
        .filter(
          (name) => name.includes("Hanger") && name.includes(MainmodelName)
        ) // Check for "Hanger" and "MainmodelName"
        .map((name) => name.split("-")[2]); // Extract the part starting with "Hanger"
      if (!hangerNames.includes(child.name) && HangerModel) {
        modelChild.visible = false; // hide the model
        HangerModel.rotation.y = Math.PI;
        HangerModel.name = "hangerForPreview_";
        scene.add(HangerModel);
        const box = new THREE.Box3().setFromObject(HangerModel);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        if (child.name === "Hanger_Rail_Step") {
          tempRenderer.setSize((size.x + size.z) * 5, size.z * 5);
        } else if (child.name === "Hanger_Rail_Single") {
          tempRenderer.setSize((size.x + size.z) * 4, size.z * 4);
        } else if (child.name === "Hanger_Rail_D_500mm") {
          tempRenderer.setSize(size.x * 2, (size.x + size.y) * 2);
        } else if (child.name === "Hanger_Rail_D_1000mm") {
          tempRenderer.setSize(size.x * 1.5, (size.x + size.y) * 2);
        } else {
          tempRenderer.setSize((size.x + size.z) * 3, size.z * 3);
        }
        const maxDim = Math.max(size.x, size.y, size.x);
        const cameraDistance = maxDim + 350; // Adjust multiplier as needed
        camera.position.set(
          center.x + cameraDistance, // Offset in X for diagonal perspective
          center.y + 200, // Offset in Y for better centering
          center.z + (cameraDistance + 500) // Offset in Z for distance
        );
        camera.lookAt(center);
        await renderAndDownload(
          child.name,
          camera,
          tempRenderer,
          MainmodelName,
          imagesNameArr
        );
        scene.remove(HangerModel);
        modelChild.visible = true;
      }
    }
  }
  return;
}

async function captureFixtureImage(
  camera,
  tempRenderer,
  model,
  name,
  imagesNameArr
) {
  for (const modelChild of model.children) {
    if (!modelChild.visible) continue;
    const CloneModel = modelChild.clone();
    await cloneWithCustomHangerProperties(modelChild, CloneModel);
    await captureMainFixtureImage(
      camera,
      tempRenderer,
      CloneModel,
      name,
      imagesNameArr,
      modelChild
    );
  }
}

function cloneRenderer(renderer) {
  // Create a new WebGLRenderer with the same parameters as the original
  const parameters = {
    // antialias: renderer.antialias,
    // alpha: renderer.alpha,
    // precision: renderer.precision,
    // stencil: renderer.stencil,
    // preserveDrawingBuffer: renderer.preserveDrawingBuffer,
    // powerPreference: renderer.powerPreference,
  };

  const newRenderer = new THREE.WebGLRenderer(parameters);

  // Copy size
  const size = renderer.getSize(new THREE.Vector2());
  newRenderer.setSize(size.width, size.height, false);

  // Copy pixel ratio
  newRenderer.setPixelRatio(renderer.getPixelRatio());
  newRenderer.toneMapping = THREE.NoToneMapping;
  return newRenderer;
}

async function captureModelImages(modelGroup) {
  let imagesNameArr = [];
  scene.background = null; // No background color for transparency

  // Store original camera position and rotation
  const originalPosition = camera.position.clone();
  const originalRotation = camera.rotation.clone();
  const originalQuaternion = camera.quaternion.clone();

  // Calculate bounding box for the model group
  const Outerbox = await cloneMainModelGroup(modelGroup);
  const outerSize = Outerbox.getSize(new THREE.Vector3());
  const outerCenter = Outerbox.getCenter(new THREE.Vector3());
  const maxDim = Math.max(outerSize.x, outerSize.y, outerSize.z);
  const fov = camera.fov * (Math.PI / 180);

  // Adjusted distance calculation - reduced divisor for closer view
  const distance = Math.abs(maxDim / Math.sin(fov / 2) / 2.5); // Changed from 1.5 to 3.5 for closer view

  // Optional: Add a slight elevation to the camera
  const heightOffset = outerSize.y * 0.1; // 10% of model height

  for (const model of modelGroup.children) {
    let isCorn = false;
    renderer.setClearColor(0x000000, 0);

    // Hide Cone if present
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

    // Step 1: Calculate the bounding box for the current model
    let modelSize = await cloneModelGroup(model);
    const box = new THREE.Box3().setFromObject(modelSize[0]);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // Prepare a temporary canvas for rendering
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = size.x;
    tempCanvas.height = size.y;
    const tempRenderer = cloneRenderer(renderer);
    tempRenderer.setSize(tempCanvas.width * 1.2, tempCanvas.height * 1.2);
    tempRenderer.setClearColor(0x000000, 0);

    // Set up an orthographic camera based on the bounding box size
    const frontCamera = new THREE.OrthographicCamera(
      -size.x / 2,
      size.x / 2,
      size.y / 2,
      -size.y / 2,
      0.5,
      10000
    );

    // Step 2a: Front view - Set the camera position to capture the front of the model
    frontCamera.position.set(center.x, center.y, center.z + 700 + 2000); // Increase the z-distance
    frontCamera.lookAt(center);
    await renderAndDownload(
      "front",
      frontCamera,
      tempRenderer,
      model.name,
      imagesNameArr
    );

    // Side view
    tempCanvas.width = 1602;
    tempCanvas.height = 2005;
    tempRenderer.setSize(tempCanvas.width, tempCanvas.height);
    const sideCamera = new THREE.OrthographicCamera(
      -1602,
      1602,
      2005,
      -2005,
      1,
      10000
    );
    // Position the camera along the positive X-axis for a side view
    const sideViewDistance = size.x + 1000;
    sideCamera.position.set(center.x + sideViewDistance, center.y, center.z);
    sideCamera.lookAt(center);

    // Wait for side view render to complete
    await renderAndDownload(
      "side",
      sideCamera,
      tempRenderer,
      model.name,
      imagesNameArr
    );

    // Step 2c: Diagonal view - Adjust the camera position to capture a diagonal angle of the model
    tempCanvas.width = size.x + size.z; // Use both x and z to ensure a wide view
    tempCanvas.height = size.y; // Use both y and z for better height coverage
    tempRenderer.setSize(tempCanvas.width, tempCanvas.height);
    const diagonalCamera = new THREE.PerspectiveCamera(
      45,
      size.x / size.y,
      100,
      100000
    );

    const maxDim = Math.max(size.x, size.y, size.z); // Largest dimension
    const cameraDistance = maxDim + 350; // Adjust multiplier as needed

    diagonalCamera.position.set(
      center.x + cameraDistance, // Offset in X for diagonal perspective
      center.y, // Offset in Y for better centering
      center.z + cameraDistance + 500 // Offset in Z for distance
    );

    diagonalCamera.lookAt(center);
    await renderAndDownload(
      "diagonal",
      diagonalCamera,
      tempRenderer,
      model.name,
      imagesNameArr
    );

    diagonalCamera.position.set(
      center.x + cameraDistance, // Offset in X for diagonal perspective
      center.y + 100, // Offset in Y for better centering
      center.z + cameraDistance + 500 // Offset in Z for distance
    );

    await captureFixtureImage(
      diagonalCamera,
      tempRenderer,
      model,
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

  for (const modelChild of modelGroup.children) {
    modelChild.traverse((node) => {
      if (node.name === "Cone") {
        node.visible = false;
      }
    });
  }

  const wholeModelDistance = distance + 1000; // Slightly closer for wholeModel view
  camera.position.set(
    wholeModelDistance * Math.cos(Math.PI / 4) + 500,
    heightOffset,
    wholeModelDistance * Math.cos(Math.PI / 4) + 500
  );
  camera.lookAt(outerCenter);
  await renderAndDownload(
    "wholeModel",
    camera,
    renderer,
    modelGroup.name,
    imagesNameArr
  );

  // Restore original camera position and rotation
  camera.position.copy(originalPosition);
  camera.rotation.copy(originalRotation);
  camera.quaternion.copy(originalQuaternion);

  // Restore scene background
  scene.backgroundBlurriness = params.blurriness;
  texture_background.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture_background;
  scene.environment = texture_background;

  return imagesNameArr;
}

// if (takeScreenShot) {
//   takeScreenShot.addEventListener("click", async function () {
//     await captureModelImages(modelGroup);
//   });
// }
// ----------------------------------------------------------------------------------------------------------

if (uiManager.elements.createQrButton) {
  uiManager.elements.createQrButton.addEventListener(
    "click",
    async function () {
      showLoadingModal("Please wait... we are creating your QR Code");
      const unixTimestamp = Math.floor(Date.now() / 1000);
      const modelName = `main_group_${unixTimestamp}`;
      const exportedModelFileUrl = `/export_models/${modelName}`;
      const isQr = true;
      const closeBtn = document.getElementById("closeBtn");
      const showQRHere = document.getElementById("showQRHere");
      closeBtn.addEventListener("click", async function () {
        showQRHere.style.display = "none";
      });
      await exportModelForAr(modelGroup, modelName, isQr);
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
            console.log("Qr Code generate successfully!");
            document.getElementById("qrImage").src = data.url;
            hideLoadingModal();
            showQRHere.style.display = "flex";
          } else {
            console.error("Error saving model data:", data.error);
            hideLoadingModal();
          }
        });
    }
  );
}

// ----------------------------------------------------------------------------------------------------------
async function generateArModel() {
  const unixTimestamp = Math.floor(Date.now() / 1000);
  const modelName = `main_group_${unixTimestamp}`;
  const exportedModelFileUrl = `./export_models/${modelName}`;

  await exportModelForAr(modelGroup, modelName);

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
}
if (uiManager.elements.showInAR) {
  uiManager.elements.showInAR.addEventListener("click", async function () {
    showLoadingModal("Please wait... we are creating your AR model file");
    await generateArModel();
  });
}
// ----------------------------------------------------------------------------------------------------------
async function creatingPDF() {
  transformControls.detach();
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
      // console.log("params.rackAdded", params.rackAdded);
      // console.log("child", child);
      // console.log("child.name", child.name);

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
    top_frame_croped_image: sharedData.topFrameCropedImage || null,
    main_frame_croped_image: sharedData.mainFrameCropedImage || null,
    ModelImageName: ModelImageName || null,
  };
  await delay(1000);
  await savePdfData(dataToSave, modelGroup);
}

if (uiManager.elements.savePdfButton) {
  uiManager.elements.savePdfButton.addEventListener("click", async (event) => {
    uiManager.elements.CreatingPdfFile.style.display = "flex";
    try {
      await creatingPDF();
    } catch (error) {
      console.error("Error creating PDF:", error);
    }
  });
}
// ----------------------------------------------------------------------------------------------------------
if (uiManager.elements.formSubmition) {
  uiManager.elements.formSubmition.addEventListener("click", function () {
    formModel.style.display = "flex";
  });
}
if (uiManager.elements.formCloseBtn) {
  uiManager.elements.formCloseBtn.addEventListener("click", function () {
    formModel.style.display = "none";
    const form = document.getElementById("FormSubmitionForMonday");
    if (form) {
      form.classList.remove("was-validated");
    }
    hideLoadingModal();
  });
}
if (uiManager.elements.submitForm) {
  uiManager.elements.submitForm.addEventListener("click", function () {
    showLoadingModal("Please wait...");
    const form = document.getElementById("FormSubmitionForMonday");
    let hasError = false;
    const specialCharRegex = /[^a-zA-Z0-9\s]/;
    // Form fields to validate
    const fieldsToValidate = [
      {
        field: document.getElementById("name"),
        errorMessage:
          "Name cannot contain special characters like - ' \" ? / > <.",
      },
      {
        field: document.getElementById("companyName"),
        errorMessage:
          "Company name cannot contain special characters like - ' \" ? / > <.",
      },
    ];
    // Validate each field
    fieldsToValidate.forEach(({ field, errorMessage }) => {
      const invalidFeedback = field.nextElementSibling; // Assuming the invalid-feedback is the next sibling after input
      const valueText = invalidFeedback.textContent;

      if (specialCharRegex.test(field.value)) {
        field.classList.add("is-invalid"); // Add is-invalid class
        invalidFeedback.textContent = errorMessage; // Set the custom error message
        invalidFeedback.style.display = "block"; // Make sure the error message is visible
        hasError = true; // Set the error flag
      } else if (field.value === "") {
        invalidFeedback.style.display = "block"; // Hide the error message
      } else {
        field.classList.remove("is-invalid"); // Remove is-invalid class if valid
        invalidFeedback.textContent = valueText; // Clear any error message
        invalidFeedback.style.display = "none"; // Hide the error message
      }
    });

    if (form) {
      if (!form.checkValidity()) {
        form.classList.add("was-validated");
      } else if (hasError) {
        return;
      } else {
        const formBase = document.getElementById("formBase");
        formBase.style.display = "none";
        // Prevent the default form submission
        event.preventDefault();
        // Show the modal
        const modal = document.getElementById("confirmationModal");
        modal.style.display = "flex"; // Or use a library method to show

        document.getElementById("confirModelCloseButtton").onclick = () => {
          modal.style.display = "none";
          formModel.style.display = "none";
          hideLoadingModal();
        };

        // Handle modal buttons
        document.getElementById("yesButton").onclick = async function () {
          modal.style.display = "none"; // Hide modal
          formModel.style.display = "none";
          try {
            await creatingPDF();
            await delay(500);
            await generateArModel();
            await formSubmitionForMonday();
          } catch (e) {
            console.log("error while submitting Data, ", e);
          }
        };

        document.getElementById("noButton").onclick = async function () {
          modal.style.display = "none"; // Hide modal
          formModel.style.display = "none";
          await formSubmitionForMonday();
          hideLoadingModal();
        };
      }
    }
  });
}

async function formSubmitionForMonday() {
  const formForMonday = document.getElementById("FormSubmitionForMonday");
  const formDataForMonday = new FormData(formForMonday);
  try {
    const response = await fetch("api.php", {
      method: "POST",
      body: formDataForMonday,
    });
    const data = await response.json();
    hideLoadingModal();
    return data; // Ensure the resolved data is returned
  } catch (error) {
    console.error("Error while submitting form: ", error);
    throw error; // Re-throw the error to handle it at the calling point
  }
}

// ----------------------------------------------------------------------------------------------------------
// Initialize Bootstrap tooltips
document.addEventListener("DOMContentLoaded", function () {
  var tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
});
