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

import {
    loadGLTFModel,
    manager,
    TextureLoaderJpg,
} from "./src/managers/LoadingManager.js";
import { exportModelForAr } from "./src/managers/ExportModelManager.js";
import {
    addNewMaterials,
    restoreMaterials,
} from "./src/managers/MaterialManager.js";
import { Camera } from "./src/core/Camera.js";
import { Renderer } from "./src/core/Renderer.js";
import { Scene } from "./src/core/Scene.js";
import { Controls } from "./src/core/Controls.js";
import {
    calculateBoundingBox,
    getNodeSize,
} from "./src/managers/MeasurementManager.js";
import {
    setTopFrameCropedImage,
    setMainFrameCropedImage,
} from "./src/managers/FrameImagesManager.js";
import {
    addHangers,
    cloneWithCustomHangerProperties,
    // setupHangerModel,
    setupHangerGolfClubModel,
} from "./src/managers/HangerManager.js";
import {
    drawMeasurementBoxesWithLabels,
    setupHeaderWoodenShelfModel,
    setupHeaderGlassShelfModel,
    setupGlassShelfFixingModel,
    setupHeader500HeightModel,
    updateMeasurementGroups,
    setupSlottedSidesModel,
    setupSupportBaseModel,
    setupWoodenRackModel,
    updateLabelOcclusion,
    setupGlassRackModel,
    checkForCollision,
    initLabelRenderer,
    addAnotherModels,
    centerMainModel,
    setupArrowModel,
    setupMainModel,
    loaderShowHide,
    traverseAsync,
    saveModelData,
    showHideNodes,
    getModelData,
    savePdfData,
    addRacks,
    getHex,
    delay,
} from "./utils6.js";

import {
    THREE,
    TransformControls,
    updateVariable,
    frameTop1Names,
    frameMainNames,
    allModelNames,
    allGroupNames,
    hangerNames,
    rackNames,
    modelQueue,
    GLTFExporter,
    params,
    setting,
    allGroups,
    sharedParams,
} from "./config.js";

let previousData, main_model;
const lights = [];
const lightHelpers = [];

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
    sharedParams.texture_background = await TextureLoaderJpg.loadAsync(
        "background.png"
    );

    sharedParams.renderer = new Renderer(uiManager.elements.container, render);
    sharedParams.renderer.setAnimationLoop(render);

    sharedParams.scene = new Scene();
    sharedParams.scene.setupScene(window, lights, lightHelpers);

    sharedParams.raycaster = new THREE.Raycaster();
    sharedParams.mouse = new THREE.Vector2();
    sharedParams.direction = new THREE.Vector3(); // Initialize direction vector

    sharedParams.camera = new Camera(
        45,
        window.innerWidth / window.innerHeight,
        1,
        500000
    );
    // Set initial sharedParams.camera position
    sharedParams.camera.position.set(2000, 1000, 2000);
    sharedParams.controls = new Controls(
        sharedParams.camera,
        sharedParams.renderer.domElement
    );

    sharedParams.modelGroup = new THREE.Group();
    sharedParams.scene.add(sharedParams.modelGroup);
    main_model = await loadGLTFModel(params.defaultModel + ".glb");
    main_model.name = params.selectedGroupName;
    main_model.activeModel = main_model.children[0];
    allGroups.push(main_model);
    sharedParams.selectedGroup = main_model;
    sharedParams.modelGroup.add(main_model);
    sharedParams.modelGroup.name = "main_group";
    console.log(sharedParams.modelGroup);
    setupMainModel(main_model);
    await loadAllModels();
    // return
    // await showHideNodes();
    // loadHangerModels();

    // Transform controls
    sharedParams.transformControls = new TransformControls(
        sharedParams.camera,
        sharedParams.renderer.domElement
    );
    sharedParams.transformControls.addEventListener(
        "dragging-changed",
        (event) => {
            sharedParams.controls.enabled = !event.value;
        }
    );
    sharedParams.scene.add(sharedParams.transformControls);

    // Add event listeners
    window.addEventListener(
        "mousemove",
        (event) => {
            uiManager.onMouseMove(event);
        },
        false
    );
    window.addEventListener("click", uiManager.onMouseClick(), false);
    window.addEventListener("resize", uiManager.onWindowResize());

    await calculateBoundingBox(sharedParams.modelGroup);
    // await otherModelSetup();
    await showHideNodes();
    // setupMainModel(sharedParams.modelGroup);
    
    // await traverseAsync(sharedParams.modelGroup, async (modelNode) => {
    //     if (allModelNames.includes(modelNode.name)) {
    //         modelNode.traverse(async function (child) {
    //             if (
    //                 frameTop1Names.includes(child.name) ||
    //                 frameMainNames.includes(child.name)
    //             ) {
    //                 if (child.isMesh && child.material) {
    //                     params.lastInnerMaterial =
    //                         params.lastInnerMaterial || {};
    //                     params.lastInnerMaterial[modelNode.name] =
    //                         params.lastInnerMaterial[modelNode.name] || {};
    //                     params.lastInnerMaterial[modelNode.name][child.name] =
    //                         child.material;
    //                 }
    //             }
    //         });
    //     }
    // });

    sharedParams.labelRenderer = await initLabelRenderer();
    document.body.appendChild(sharedParams.labelRenderer.domElement);

    await loadPreviousModels();
    uiManager.setupEventListeners(lights, lightHelpers);
}

async function loadPreviousModels() {
    await loaderShowHide(true);
    sharedParams.labelRenderer = await initLabelRenderer();
    document.body.appendChild(sharedParams.labelRenderer.domElement);

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
            sharedParams.mainFrameCropedImage =
                previousData.main_frame_croped_image;
            sharedParams.topFrameCropedImage =
                previousData.top_frame_croped_image;

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
                    await addAnotherModels(allGroupNames, groupName, side);
                }
                // Add a short delay between each group loading
                await delay(100); // Adjust the delay time (in milliseconds) as needed
                i++;
            }

            await centerMainModel();

            for (const groupName of lastGroupNames) {
                params.selectedGroupName = groupName;

                if (
                    setting[params.selectedGroupName].headerRodToggle ===
                        true &&
                    setting[params.selectedGroupName].headerRodToggle ===
                        setting[params.selectedGroupName].headerUpDown
                ) {
                    setting[params.selectedGroupName].headerUpDown =
                        !setting[params.selectedGroupName].headerRodToggle;
                }

                await setTopFrameCropedImage(sharedParams.topFrameCropedImage);
                await setMainFrameCropedImage(
                    sharedParams.mainFrameCropedImage
                );
                await showHideNodes();
                await centerMainModel();

                // Delay to ensure each model group update is visually distinct
                await delay(100); // Adjust as needed
            }

            await centerMainModel();
            await showHideNodes();

            // Sequentially process hangerAdded entries with delay
            if (hangerAdded) {
                for (const [hangerArrayKey, value] of Object.entries(
                    hangerAdded
                )) {
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
                            await addHangers(hangerType, side, position);
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
                            await addRacks(rackType, side, position);
                            await delay(100); // Delay for racks
                        }
                    }

                    setting[groupName].defaultModel = lastDefaultModel;
                }
            }

            params.selectedGroupName = retrievedSelectedGroupName;

            await centerMainModel();
            await showHideNodes();

            for (const name of hangerNames) {
                const loaders = document.querySelectorAll(`.${name}_loader`);
                loaders.forEach((loader) => removeLoader(loader));
            }

            const accordionContainer =
                document.querySelector("#accordionModel");
            const openAccordionItems = accordionContainer.querySelectorAll(
                ".accordion-collapse.show"
            );
            openAccordionItems.forEach((item) => {
                const bsCollapse = new bootstrap.Collapse(item, {
                    toggle: false,
                });
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

async function exportModel(model, name) {
    model.position.set(0, 0, 0);
    model.updateMatrixWorld();
    const gltfExporter = new GLTFExporter();
    const result = await gltfExporter.parseAsync(model, { binary: true });
    const blob = new Blob([result], { type: "application/octet-stream" });
    const modellink = document.createElement("a");
    modellink.href = URL.createObjectURL(blob);
    modellink.download = name;
    modellink.click();
}
async function loadAllModels() {
    try {
        // Create an array of promises for all model loads
        const loadPromises = modelQueue.map(async (modelPath) =>
            await loadGLTFModel(modelPath)
                .then(async (gltf) => {
                    // console.log(`Loaded: ${modelPath}`, gltf);
                    // loadedModels.set(modelPath, gltf);
                    // return gltf;
                    switch (modelPath) {
                        case "Model_1061.glb":
                            setupMainModel(gltf);
                            let model_1061 = gltf.getObjectByName("Model_1061");
                            model_1061.visible = false;
                            main_model.add(model_1061);
                            break;
                        case "Model_1200.glb":
                            setupMainModel(gltf);
                            let Model_1200 = gltf.getObjectByName("Model_1200");
                            Model_1200.visible = false;
                            main_model.add(Model_1200);
                            break;
                        case "Model_1500.glb":
                            setupMainModel(gltf);
                            let Model_1500 = gltf.getObjectByName("Model_1500");
                            Model_1500.visible = false;
                            main_model.add(Model_1500);
                            break;
                        case "Model_2000.glb":
                            setupMainModel(gltf);
                            let Model_2000 = gltf.getObjectByName("Model_2000");
                            Model_2000.visible = false;
                            main_model.add(Model_2000);
                            break;
                        case "Model_3000.glb":
                            setupMainModel(gltf);
                            let Model_3000 = gltf.getObjectByName("Model_3000");
                            Model_3000.visible = false;
                            main_model.add(Model_3000);
                            break;
                        case "Hanger_Rail_Step.glb":
                            sharedParams.hanger_rail_step = gltf;
                            sharedParams.hanger_model = sharedParams.hanger_rail_step;
                            break;
                        case "Hanger_Rail_Single.glb":
                            sharedParams.hanger_rail_single = gltf;
                            sharedParams.hanger_rail_single =
                                sharedParams.hanger_rail_single.getObjectByName(
                                    "Hanger_Rail_Single"
                                );
                            sharedParams.hanger_model.add(
                                sharedParams.hanger_rail_single
                            );
                            break;
                        case "Hanger_Rail_D_500mm.glb":
                            sharedParams.hanger_rail_d_500 = gltf;
                            sharedParams.hanger_rail_d_500 =
                                sharedParams.hanger_rail_d_500.getObjectByName(
                                    "Hanger_Rail_D_500mm"
                                );
                            sharedParams.hanger_model.add(
                                sharedParams.hanger_rail_d_500
                            );
                            break;
                        case "Hanger_Rail_D_1000mm.glb":
                            sharedParams.hanger_rail_d_1000 = gltf;
                            sharedParams.hanger_rail_d_1000 =
                                sharedParams.hanger_rail_d_1000.getObjectByName(
                                    "Hanger_Rail_D_1000mm"
                                );
                            sharedParams.hanger_model.add(
                                sharedParams.hanger_rail_d_1000
                            );
                            break;
                        case "hanger_golf_club_model.glb":
                            sharedParams.hanger_golf_club_model = gltf;
                            // await setupHangerGolfClubModel(
                            //     sharedParams.hanger_golf_club_model,
                            // );
                            console.log(sharedParams.hanger_golf_club_model);
                            // await exportModel(
                            //     sharedParams.hanger_golf_club_model,
                            //     modelPath
                            // ); 
                            // console.log(sharedParams.hanger_golf_club_model);
                            // 
                            
                            break;
                        case "rack_glass_model.glb":
                            sharedParams.rack_glass_model = gltf;
                            await setupGlassRackModel(
                                sharedParams.rack_glass_model
                            );
                            break;
                        case "rack_wooden_model.glb":
                            sharedParams.rack_wooden_model = gltf;
                            await setupWoodenRackModel(
                                sharedParams.rack_wooden_model
                            );
                            break;
                        case "arrow_model.glb":
                            sharedParams.arrow_model = gltf;
                            await setupArrowModel();
                            break;
                        case "header_rod_model.glb":
                            sharedParams.header_rod_model = gltf;
                            // params.rodSize = await getNodeSize(
                            //     sharedParams.header_rod_model
                            // );
                            params.rodSize = {x: 50, y: 50, z: 50};                            
                            break;
                        case "header_glass_shelf_fixing_model.glb":
                            sharedParams.header_glass_shelf_fixing_model = gltf;
                            // params.glassShelfFixingSize = await getNodeSize(
                            //     sharedParams.header_glass_shelf_fixing_model
                            // );
                            await setupGlassShelfFixingModel();
                            break;
                        case "header_500_height_model.glb":
                            sharedParams.header_500_height_model = gltf;
                            await setupHeader500HeightModel();
                            break;
                        case "header_wooden_shelf_model.glb":
                            sharedParams.header_wooden_shelf_model = gltf;
                            await setupHeaderWoodenShelfModel();
                            break;
                        case "header_glass_shelf_model.glb":
                            sharedParams.header_glass_shelf_model = gltf;
                            await setupHeaderGlassShelfModel();
                            break;
                        case "slotted_sides_model.glb":
                            sharedParams.slotted_sides_model = gltf;
                            await setupSlottedSidesModel();
                            break;
                        case "support_base_middle.glb":
                            sharedParams.support_base_middle = gltf;
                            await setupSupportBaseModel();
                            break;
                        case "support_base_sides.glb":
                            sharedParams.support_base_side = gltf;
                            await setupSupportBaseModel();
                            break;
                        default:
                            break;
                    }
                })
                .catch((error) => {
                    console.error(`Failed to load ${modelPath}:`, error);
                    return null;
                })
        );

        // Optional: Add a loading indicator
        // this.showLoadingProgress(loadPromises.length);
        console.log(loadPromises.length);

        // Load all models in parallel
        const results = await Promise.allSettled(loadPromises);

        // Process results
        results.forEach((result, index) => {
            const modelPath = modelQueue[index];
            if (result.status === "fulfilled" && result.value) {
                // Model loaded successfully
                const model = result.value;
                console.log("model in loop", model);
            }
        });

        console.log("All models loaded");
        // this.hideLoadingProgress();
    } catch (error) {
        console.error("Error loading models:", error);
    }
}

async function removeLoader(loader) {
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
    if (!sharedParams.arrow_model) {
        sharedParams.arrow_model = await loadGLTFModel("arrow_model.glb");
        await setupArrowModel();
    }
    if (!sharedParams.header_rod_model) {
        sharedParams.header_rod_model = await loadGLTFModel(
            "header_rod_model.glb"
        );
        params.rodSize = await getNodeSize(sharedParams.header_rod_model);
    }
    if (!sharedParams.header_glass_shelf_fixing_model) {
        sharedParams.header_glass_shelf_fixing_model = await loadGLTFModel(
            "header_glass_shelf_fixing_model.glb"
        );
        params.glassShelfFixingSize = await getNodeSize(
            sharedParams.header_glass_shelf_fixing_model
        );
        await setupGlassShelfFixingModel();
    }
    if (!sharedParams.header_500_height_model) {
        sharedParams.header_500_height_model = await loadGLTFModel(
            "header_500_height_model.glb"
        );
        await setupHeader500HeightModel();
    }
    if (!sharedParams.header_wooden_shelf_model) {
        sharedParams.header_wooden_shelf_model = await loadGLTFModel(
            "header_wooden_shelf_model.glb"
        );
        await setupHeaderWoodenShelfModel();
    }
    if (!sharedParams.header_glass_shelf_model) {
        sharedParams.header_glass_shelf_model = await loadGLTFModel(
            "header_glass_shelf_model.glb"
        );
        await setupHeaderGlassShelfModel();
    }
    if (!sharedParams.slotted_sides_model) {
        sharedParams.slotted_sides_model = await loadGLTFModel(
            "slotted_sides_model.glb"
        );
        await setupSlottedSidesModel();
    }

    if (!sharedParams.support_base_middle || !sharedParams.support_base_side) {
        sharedParams.support_base_middle = await loadGLTFModel(
            "support_base_middle.glb"
        );
        sharedParams.support_base_side = await loadGLTFModel(
            "support_base_sides.glb"
        );
        await setupSupportBaseModel();
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

            await setTopFrameCropedImage(
                sharedParams.topFrameCropedImage,
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
            await setMainFrameCropedImage(sharedParams.mainFrameCropedImage);
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
            dropdownContent.style.display = isDropdownVisible
                ? "none"
                : "block"; // Toggle the clicked dropdown
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
    // await drawMeasurementBoxesWithLabels()
    await updateMeasurementGroups();
    await updateLabelOcclusion();

    sharedParams.controls.update();
    sharedParams.renderer.render(sharedParams.scene, sharedParams.camera);
    if (sharedParams.labelRenderer) {
        sharedParams.labelRenderer.render(
            sharedParams.scene,
            sharedParams.camera
        ); // CSS2D rendering
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
    await showHideNodes();

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
        //   sharedParams.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        // } else {
        //   sharedParams.renderer.toneMapping = THREE.AgXToneMapping;
        // }
        // await lightSetup();
        await sharedParams.scene.lightSetup(lights, lightHelpers);
    }
    // console.log(main_model)
}

if (uiManager.elements.saveModelDataButton) {
    uiManager.elements.saveModelDataButton.addEventListener(
        "click",
        async function () {
            if (
                !localStorage.getItem("user_id") &&
                !localStorage.getItem("username")
            ) {
                document.querySelector(".loginFormDiv").style.display = "flex";
                return;
            } else {
                const modelId =
                    previousData && previousData.id ? previousData.id : 0;

                await traverseAsync(sharedParams.modelGroup, async (child) => {
                    if (
                        hangerNames.includes(child.name) &&
                        child.hangerArrayKey &&
                        child.hangerCount
                    ) {
                        params.hangerAdded = params.hangerAdded || {};
                        params.hangerAdded[child.hangerArrayKey] =
                            params.hangerAdded[child.hangerArrayKey] || {};
                        params.hangerAdded[child.hangerArrayKey][
                            child.hangerCount
                        ] = child.position;
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
                    top_frame_croped_image:
                        sharedParams.topFrameCropedImage || null,
                    main_frame_croped_image:
                        sharedParams.mainFrameCropedImage || null,
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
        }
    );
}

async function checkFileExists(url) {
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
    tempCamera,
    tempRenderer,
    name,
    imagesNameArr
) {
    // Store original renderer size and camera properties
    const originalWidth = tempRenderer.domElement.width;
    const originalHeight = tempRenderer.domElement.height;
    const originalAspect = tempCamera.aspect;
    const originalPosition = tempCamera.position.clone();
    const originalRotation = tempCamera.rotation.clone();
    const originalQuaternion = tempCamera.quaternion.clone();
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
        tempCamera.aspect =
            (originalWidth * scaleFactor) / (originalHeight * scaleFactor);
        tempCamera.updateProjectionMatrix();
        // Render the scene and capture the screenshot
        tempRenderer.render(sharedParams.scene, tempCamera);
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
        tempCamera.aspect = originalAspect;
        tempCamera.position.copy(originalPosition);
        tempCamera.rotation.copy(originalRotation);
        tempCamera.quaternion.copy(originalQuaternion);
        tempCamera.updateProjectionMatrix();
    }
}

async function downloadScreenshotwithDiffCanvas(dataUrl, filename) {
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
            const imageData = ctx.getImageData(
                0,
                0,
                canvas.width,
                canvas.height
            );
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

async function captureFixtureImage(
    tempCamera,
    tempRenderer,
    model,
    MainmodelName,
    imagesNameArr
) {
    for (const modelChild of model.children) {
        if (!modelChild.visible) continue;
        const CloneModel = modelChild.clone();
        await cloneWithCustomHangerProperties(modelChild, CloneModel);
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
                        (name) =>
                            name.includes("Hanger") &&
                            name.includes(MainmodelName)
                    ) // Check for "Hanger" and "MainmodelName"
                    .map((name) => name.split("-")[2]); // Extract the part starting with "Hanger"
                if (!hangerNames.includes(child.name) && HangerModel) {
                    modelChild.visible = false; // hide the model
                    HangerModel.rotation.y = Math.PI;
                    HangerModel.name = "hangerForPreview_";
                    sharedParams.scene.add(HangerModel);
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
                        tempRenderer.setSize(
                            size.x * 1.5,
                            (size.x + size.y) * 2
                        );
                    } else {
                        tempRenderer.setSize((size.x + size.z) * 3, size.z * 3);
                    }
                    const maxDim = Math.max(size.x, size.y, size.x);
                    const cameraDistance = maxDim + 350; // Adjust multiplier as needed
                    tempCamera.position.set(
                        center.x + cameraDistance, // Offset in X for diagonal perspective
                        center.y + 200, // Offset in Y for better centering
                        center.z + (cameraDistance + 500) // Offset in Z for distance
                    );
                    tempCamera.lookAt(center);
                    await renderAndDownload(
                        child.name,
                        tempCamera,
                        tempRenderer,
                        MainmodelName,
                        imagesNameArr
                    );
                    sharedParams.scene.remove(HangerModel);
                    modelChild.visible = true;
                }
            }
        }
    }
}

function cloneRenderer() {
    // Create a new WebGLRenderer with the same parameters as the original
    const parameters = {
        // antialias: sharedParams.renderer.antialias,
        // alpha: sharedParams.renderer.alpha,
        // precision: sharedParams.renderer.precision,
        // stencil: sharedParams.renderer.stencil,
        // preserveDrawingBuffer: sharedParams.renderer.preserveDrawingBuffer,
        // powerPreference: sharedParams.renderer.powerPreference,
    };

    const newRenderer = new THREE.WebGLRenderer(parameters);

    // Copy size
    const size = sharedParams.renderer.getSize(new THREE.Vector2());
    newRenderer.setSize(size.width, size.height, false);

    // Copy pixel ratio
    newRenderer.setPixelRatio(sharedParams.renderer.getPixelRatio());
    newRenderer.toneMapping = THREE.NoToneMapping;
    return newRenderer;
}

async function captureModelImages() {
    let imagesNameArr = [];
    sharedParams.scene.background = null; // No background color for transparency

    // Store original camera position and rotation
    const originalPosition = sharedParams.camera.position.clone();
    const originalRotation = sharedParams.camera.rotation.clone();
    const originalQuaternion = sharedParams.camera.quaternion.clone();

    // Calculate bounding box for the model group
    const Outerbox = await cloneMainModelGroup(sharedParams.modelGroup);
    const outerSize = Outerbox.getSize(new THREE.Vector3());
    const outerCenter = Outerbox.getCenter(new THREE.Vector3());
    const maxDim = Math.max(outerSize.x, outerSize.y, outerSize.z);
    const fov = sharedParams.camera.fov * (Math.PI / 180);

    // Adjusted distance calculation - reduced divisor for closer view
    const distance = Math.abs(maxDim / Math.sin(fov / 2) / 2.5); // Changed from 1.5 to 3.5 for closer view

    // Optional: Add a slight elevation to the camera
    const heightOffset = outerSize.y * 0.1; // 10% of model height

    for (const model of sharedParams.modelGroup.children) {
        let isCorn = false;
        sharedParams.renderer.setClearColor(0x000000, 0);

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
        sharedParams.scene.children.forEach((childScene) => {
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
        const tempRenderer = cloneRenderer();
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
        sideCamera.position.set(
            center.x + sideViewDistance,
            center.y,
            center.z
        );
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
        sharedParams.scene.children.forEach((childScene) => {
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

    for (const modelChild of sharedParams.modelGroup.children) {
        modelChild.traverse((node) => {
            if (node.name === "Cone") {
                node.visible = false;
            }
        });
    }

    const wholeModelDistance = distance + 1000; // Slightly closer for wholeModel view
    sharedParams.camera.position.set(
        wholeModelDistance * Math.cos(Math.PI / 4) + 500,
        heightOffset,
        wholeModelDistance * Math.cos(Math.PI / 4) + 500
    );
    sharedParams.camera.lookAt(outerCenter);
    await renderAndDownload(
        "wholeModel",
        sharedParams.camera,
        sharedParams.renderer,
        sharedParams.modelGroup.name,
        imagesNameArr
    );

    // Restore original camera position and rotation
    sharedParams.camera.position.copy(originalPosition);
    sharedParams.camera.rotation.copy(originalRotation);
    sharedParams.camera.quaternion.copy(originalQuaternion);

    // Restore scene background
    sharedParams.scene.backgroundBlurriness = params.blurriness;
    sharedParams.texture_background.mapping =
        THREE.EquirectangularReflectionMapping;
    sharedParams.scene.background = sharedParams.texture_background;
    sharedParams.scene.environment = sharedParams.texture_background;

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
            await exportModelForAr(sharedParams.modelGroup, modelName, isQr);
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

    await exportModelForAr(sharedParams.modelGroup, modelName);

    // Check if the file exists
    if (await checkFileExists(exportedModelFileUrl)) {
        hideLoadingModal();
        await showARModel(exportedModelFileUrl);
        // Configure model viewer attributes
        // const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        // if (/iPhone|iPad|iPod/.test(userAgent)) {
        //   let ViewArForIos = document.getElementById("ViewArForIos");
        //   ViewArForIos.style.display = "block";
        //   ViewArForIos.href = `${exportedModelFileUrl}.usdz`;
        //   ViewArForIos.click();
        // } else if (/Android/.test(userAgent)) {
        //   // Create or update the AR viewer
        //   const modelViewer = document.getElementById("modelViewer");
        //   let ArViewer = document.getElementById("ArView");
        //   ArViewer.style.display = "block";
        //   modelViewer.setAttribute("src", `${exportedModelFileUrl}.glb`);
        //   modelViewer.setAttribute("ar-modes", "scene-viewer");
        //   modelViewer.addEventListener("load", () => {
        //     modelViewer.enterAR();
        //   });
        // } else {
        //   alert("This feature is only supported on iOS and Android devices.");
        // }
    } else {
        console.error("File was not found within the expected time.");
        hideLoadingModal();
    }
}
async function showARModel(exportedModelFileUrl) {
    const userAgent = navigator.userAgent;

    // Create loading screen elements
    const loadingScreen = document.createElement("div");
    loadingScreen.className = "ar-loading-screen";

    const spinner = document.createElement("div");
    spinner.className = "ar-loading-spinner";

    const progressBar = document.createElement("div");
    progressBar.className = "ar-progress-bar";

    const progressFill = document.createElement("div");
    progressFill.className = "ar-progress-fill";

    const loadingText = document.createElement("div");
    loadingText.className = "ar-loading-text";
    loadingText.textContent = "Preparing AR Experience...";

    progressBar.appendChild(progressFill);
    loadingScreen.appendChild(spinner);
    loadingScreen.appendChild(progressBar);
    loadingScreen.appendChild(loadingText);
    document.body.appendChild(loadingScreen);

    // Function to update progress
    function updateProgress(percent) {
        progressFill.style.width = `${percent}%`;
        loadingText.textContent = `Loading AR Model: ${Math.round(percent)}%`;
    }

    // Function to remove loading screen
    function removeLoadingScreen() {
        loadingScreen.remove();
    }

    if (/iPhone|iPad|iPod/.test(userAgent)) {
        // For iOS devices
        fetch(`${exportedModelFileUrl}.usdz`)
            .then((response) => {
                const reader = response.body.getReader();
                const contentLength = +response.headers.get("Content-Length");
                let receivedLength = 0;

                return new ReadableStream({
                    start(controller) {
                        function push() {
                            reader.read().then(({ done, value }) => {
                                if (done) {
                                    controller.close();
                                    return;
                                }
                                receivedLength += value.length;
                                const progress =
                                    (receivedLength / contentLength) * 100;
                                updateProgress(progress);
                                controller.enqueue(value);
                                push();
                            });
                        }
                        push();
                    },
                });
            })
            .then(() => {
                let ViewArForIos = document.getElementById("ViewArForIos");
                ViewArForIos.style.display = "block";
                ViewArForIos.href = `${exportedModelFileUrl}.usdz`;
                ViewArForIos.click();
                removeLoadingScreen();
            })
            .catch((error) => {
                loadingText.textContent =
                    "Error loading AR model. Please try again.";
                console.error("Error:", error);
                setTimeout(removeLoadingScreen, 2000);
            });
    } else if (/Android/.test(userAgent)) {
        // For Android devices
        const modelViewer = document.getElementById("modelViewer");
        let ArViewer = document.getElementById("ArView");
        // Show loading screen
        ArViewer.style.display = "block";

        fetch(`${exportedModelFileUrl}.glb`)
            .then((response) => {
                const reader = response.body.getReader();
                const contentLength = +response.headers.get("Content-Length");
                let receivedLength = 0;

                return new ReadableStream({
                    start(controller) {
                        function push() {
                            reader.read().then(({ done, value }) => {
                                if (done) {
                                    controller.close();
                                    return;
                                }
                                receivedLength += value.length;
                                const progress =
                                    (receivedLength / contentLength) * 100;
                                updateProgress(progress);
                                controller.enqueue(value);
                                push();
                            });
                        }
                        push();
                    },
                });
            })
            .then(() => {
                modelViewer.setAttribute("src", `${exportedModelFileUrl}.glb`);
                modelViewer.setAttribute("ar-modes", "scene-viewer");
                modelViewer.addEventListener("load", () => {
                    removeLoadingScreen();
                    modelViewer.enterAR();
                });
            })
            .catch((error) => {
                loadingText.textContent =
                    "Error loading AR model. Please try again.";
                console.error("Error:", error);
                setTimeout(removeLoadingScreen, 2000);
            });
    } else {
        removeLoadingScreen();
        alert("This feature is only supported on iOS and Android devices.");
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
    sharedParams.transformControls.detach();
    await traverseAsync(sharedParams.modelGroup, async (child) => {
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
            params.rackAdded[child.rackArrayKey][child.rackCount] =
                child.position;
        }
    });
    let ModelImageName = await captureModelImages();

    const dataToSave = {
        params: params || null,
        setting: setting || null,
        group_names: allGroupNames || null,
        top_frame_croped_image: sharedParams.topFrameCropedImage || null,
        main_frame_croped_image: sharedParams.mainFrameCropedImage || null,
        ModelImageName: ModelImageName || null,
    };
    await delay(1000);
    await savePdfData(dataToSave, sharedParams.modelGroup);
}

if (uiManager.elements.savePdfButton) {
    uiManager.elements.savePdfButton.addEventListener(
        "click",
        async (event) => {
            if (
                !localStorage.getItem("user_id") &&
                !localStorage.getItem("username")
            ) {
                document.querySelector(".loginFormDiv").style.display = "flex";
                return;
            } else {
                document.getElementById("loadingModal").style.display = "flex";
                document.getElementById("loadingText").innerHTML =
                    "Please wait... we are creating your Pdf file";
                try {
                    await creatingPDF();
                } catch (error) {
                    console.error("Error creating PDF:", error);
                }
            }
        }
    );
}
// ----------------------------------------------------------------------------------------------------------
if (uiManager.elements.formSubmition) {
    uiManager.elements.formSubmition.addEventListener("click", function () {
        if (
            !localStorage.getItem("user_id") &&
            !localStorage.getItem("username")
        ) {
            document.querySelector(".loginFormDiv").style.display = "flex";
            return;
        } else {
            formModel.style.display = "flex";
        }
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
        showLoadingModal("Please wait... the form submitting");
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

                document.getElementById("confirModelCloseButtton").onclick =
                    () => {
                        modal.style.display = "none";
                        formModel.style.display = "none";
                        hideLoadingModal();
                    };

                // Handle modal buttons
                document.getElementById("yesButton").onclick =
                    async function () {
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

                document.getElementById("noButton").onclick =
                    async function () {
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

if (uiManager.elements.registerForm) {
    uiManager.elements.registerForm.addEventListener("click", async () => {
        document.querySelector(".loginFormDiv").style.display = "none";
        document.querySelector(".registerFormDiv").style.display = "flex";
    });
}
if (uiManager.elements.LoginForm) {
    uiManager.elements.LoginForm.addEventListener("click", async () => {
        document.querySelector(".registerFormDiv").style.display = "none";
        document.querySelector(".loginFormDiv").style.display = "flex";
    });
}

if (uiManager.elements.loginRegisterClose) {
    uiManager.elements.loginRegisterClose.addEventListener(
        "click",
        async () => {
            document.getElementById("loginEmail").value = null;
            document.getElementById("loginPassword").value = null;
            document.getElementById("loginEmailError").innerHTML = null;
            document.getElementById("loginPasswordError").innerHTML = null;
            document.getElementById("responseErr").style.display = "none";
            document.getElementById("registerUsername").value = null;
            document.getElementById("registerEmail").value = null;
            document.getElementById("registerPassword").value = null;
            document.getElementById("registerUsernameError").innerHTML = null;
            document.getElementById("registerEmailError").innerHTML = null;
            document.getElementById("registerPasswordError").innerHTML = null;
            document.querySelector(".loginFormDiv").style.display = "none";
            document.querySelector(".registerFormDiv").style.display = "none";
        }
    );
}

document.getElementById("loginButton").addEventListener("click", function () {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    const emailError = document.getElementById("loginEmailError");
    const passwordError = document.getElementById("loginPasswordError");
    const responseError = document.getElementById("responseErr");

    // Reset error messages
    emailError.textContent = "";
    passwordError.textContent = "";
    responseError.style.display = "none";
    responseError.textContent = "";

    let hasError = false;

    // Email validation
    if (!email) {
        emailError.textContent = "Email is required.";
        hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        emailError.textContent = "Enter a valid email address.";
        hasError = true;
    }

    // Password validation
    if (!password) {
        passwordError.textContent = "Password is required.";
        hasError = true;
    } else if (password.length < 6) {
        passwordError.textContent =
            "Password must be at least 6 characters long.";
        hasError = true;
    }

    // Stop the function if there are validation errors
    if (hasError) return;

    // Prepare form data
    const form = document.getElementById("Login");
    const formData = new FormData(form);

    // Send an AJAX request
    fetch("api.php", {
        method: "POST",
        body: formData,
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json(); // Parse JSON response
        })
        .then((data) => {
            if (data.success) {
                // Handle successful login
                createSession(data.session.user_id, data.session.username);
                document.querySelector(".loginFormDiv").style.display = "none";
                document.getElementById("myModelsDiv").style.display = "block";
                document.querySelector(".LogoutUser").style.display = "block";
            } else {
                // Handle server-side validation errors
                responseError.style.display = "block";
                responseError.textContent = data.message || "Login failed.";
            }
        })
        .catch((error) => {
            console.error("Request failed:", error);
            responseError.style.display = "block";
            responseError.textContent =
                "An unexpected error occurred. Please try again later.";
        });
});

function createSession(userId, username) {
    localStorage.setItem("user_id", userId);
    localStorage.setItem("username", username);
}
document
    .getElementById("registerButton")
    .addEventListener("click", function () {
        const username = document
            .getElementById("registerUsername")
            .value.trim();
        const email = document.getElementById("registerEmail").value.trim();
        const password = document
            .getElementById("registerPassword")
            .value.trim();

        const usernameError = document.getElementById("registerUsernameError");
        const emailError = document.getElementById("registerEmailError");
        const passwordError = document.getElementById("registerPasswordError");

        // Reset error messages
        usernameError.textContent = "";
        emailError.textContent = "";
        passwordError.textContent = "";

        let hasError = false;

        // Username validation
        if (!username) {
            usernameError.textContent = "Username is required.";
            hasError = true;
        } else if (username.length < 3 || username.length > 15) {
            usernameError.textContent =
                "Username must be between 3 and 15 characters.";
            hasError = true;
        }

        // Email validation
        if (!email) {
            emailError.textContent = "Email is required.";
            hasError = true;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            emailError.textContent = "Enter a valid email address.";
            hasError = true;
        }

        // Password validation
        if (!password) {
            passwordError.textContent = "Password is required.";
            hasError = true;
        } else if (password.length < 6) {
            passwordError.textContent =
                "Password must be at least 6 characters.";
            hasError = true;
        }

        // Stop the function if there are validation errors
        if (hasError) return;

        // Prepare form data
        const form = document.getElementById("Register");
        const formData = new FormData(form);

        // Send an AJAX request
        fetch("api.php", {
            method: "POST",
            body: formData,
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                if (data.success) {
                    // Handle successful registration
                    alert("Registration successful. Redirecting to login...");
                    document.querySelector(".registerFormDiv").style.display =
                        "none";
                    document.querySelector(".loginFormDiv").style.display =
                        "flex";
                } else {
                    // Handle server-side errors
                    if (data.message) {
                        alert(data.message);
                    } else {
                        alert("An error occurred. Please try again.");
                    }
                }
            })
            .catch((error) => {
                console.error("Request failed:", error);
                alert("An unexpected error occurred. Please try again later.");
            });
    });
