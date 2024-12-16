// Display loader progress
import { UIManager } from "./src/managers/UIManager.js";
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
    updateMeasurementGroups,
    updateLabelOcclusion,    
    checkForCollision,
    initLabelRenderer,
    addAnotherModels,
    centerMainModel,
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
import { ModelManager } from "./src/managers/ModelManager.js";

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

let main_model;
const lights = [];
const lightHelpers = [];
const uiManager = new UIManager();
const modelManager = new ModelManager();

async function showTime(test) {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");
    const timeString = `${hours}:${minutes}:${seconds}`;
    console.log("timeString" + test + ":", timeString);
}

await showTime(0);

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
    modelManager.setupMainModel(main_model);
    await loadAllModels();

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
    uiManager.loadingElements.progressText.innerText = `Loading... 100%`;
    uiManager.loadingElements.loaderElement.style.display = "none";
}

async function loadPreviousModels() {
    await loaderShowHide(true);
    sharedParams.labelRenderer = await initLabelRenderer();
    document.body.appendChild(sharedParams.labelRenderer.domElement);

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");

    if (id) {
        sharedParams.previousData = await getModelData(id);
        if (sharedParams.previousData && sharedParams.previousData.params) {
            const loader = new THREE.MaterialLoader();

            let newMaterialData = params.lastInnerMaterial;
            await updateVariable("params", sharedParams.previousData.params);
            await updateVariable("setting", sharedParams.previousData.setting);
            let lastGroupNames = sharedParams.previousData.group_names;
            sharedParams.mainFrameCropedImage =
                sharedParams.previousData.main_frame_croped_image;
            sharedParams.topFrameCropedImage =
                sharedParams.previousData.top_frame_croped_image;

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
    let count = 0;
    try {
        // Create an array of promises for all model loads
        const loadPromises = modelQueue.map(async (modelPath) =>
            await loadGLTFModel(modelPath)
                .then(async (gltf) => {
                    count += 1
                    let percent = (count * 100)/ modelQueue.length
                    uiManager.loadingElements.progressText.innerText = `Loading... ${Math.round(
                        percent
                    )}%`;
                    // console.log(`Loaded: ${modelPath}`, gltf);
                    // loadedModels.set(modelPath, gltf);
                    // return gltf;
                    switch (modelPath) {
                        case "Model_1061.glb":
                            modelManager.setupMainModel(gltf);
                            let model_1061 = gltf.getObjectByName("Model_1061");
                            model_1061.visible = false;
                            main_model.add(model_1061);
                            break;
                        case "Model_1200.glb":
                            modelManager.setupMainModel(gltf);
                            let Model_1200 = gltf.getObjectByName("Model_1200");
                            Model_1200.visible = false;
                            main_model.add(Model_1200);
                            break;
                        case "Model_1500.glb":
                            modelManager.setupMainModel(gltf);
                            let Model_1500 = gltf.getObjectByName("Model_1500");
                            Model_1500.visible = false;
                            main_model.add(Model_1500);
                            break;
                        case "Model_2000.glb":
                            modelManager.setupMainModel(gltf);
                            let Model_2000 = gltf.getObjectByName("Model_2000");
                            Model_2000.visible = false;
                            main_model.add(Model_2000);
                            break;
                        case "Model_3000.glb":
                            modelManager.setupMainModel(gltf);
                            let Model_3000 = gltf.getObjectByName("Model_3000");
                            Model_3000.visible = false;
                            main_model.add(Model_3000);
                            break;
                        case "Hanger_Rail_Step.glb":
                            sharedParams.hanger_rail_step = gltf;
                            sharedParams.hanger_model =
                                sharedParams.hanger_rail_step;
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
                        case "hanger_golf_driver_club_model.glb":
                            sharedParams.hanger_golf_driver_club_model = gltf;
                            break;
                        case "hanger_golf_Iron_club_model.glb":
                            sharedParams.hanger_golf_Iron_club_model = gltf;
                            break;
                        case "rack_glass_model.glb":
                            sharedParams.rack_glass_model = gltf;
                            await modelManager.setupGlassRackModel(
                                sharedParams.rack_glass_model
                            );
                            break;
                        case "rack_wooden_model.glb":
                            sharedParams.rack_wooden_model = gltf;
                            await modelManager.setupWoodenRackModel(
                                sharedParams.rack_wooden_model
                            );
                            break;
                        case "arrow_model.glb":
                            sharedParams.arrow_model = gltf;
                            await modelManager.setupArrowModel;
                            break;
                        case "header_rod_model.glb":
                            sharedParams.header_rod_model = gltf;
                            params.rodSize = getNodeSize(
                                sharedParams.header_rod_model
                            );
                            params.rodSize = { x: 50, y: 50, z: 50 };
                            break;
                        case "header_glass_shelf_fixing_model.glb":
                            sharedParams.header_glass_shelf_fixing_model = gltf;
                            params.glassShelfFixingSize = getNodeSize(
                                sharedParams.header_glass_shelf_fixing_model
                            );
                            await modelManager.setupGlassShelfFixingModel();
                            break;
                        case "header_500_height_model.glb":
                            sharedParams.header_500_height_model = gltf;
                            await modelManager.setupHeader500HeightModel();
                            break;
                        case "header_wooden_shelf_model.glb":
                            sharedParams.header_wooden_shelf_model = gltf;
                            await modelManager.setupHeaderWoodenShelfModel();
                            break;
                        case "header_glass_shelf_model.glb":
                            sharedParams.header_glass_shelf_model = gltf;
                            await modelManager.setupHeaderGlassShelfModel();
                            break;
                        case "slotted_sides_model.glb":
                            sharedParams.slotted_sides_model = gltf;
                            await modelManager.setupSlottedSidesModel();
                            break;
                        case "support_base_middle.glb":
                            sharedParams.support_base_middle = gltf;
                            await modelManager.setupSupportBaseModel();
                            break;
                        case "support_base_sides.glb":
                            sharedParams.support_base_side = gltf;
                            await modelManager.setupSupportBaseModel();
                            break;
                        case "removeIcon.glb":
                            sharedParams.removeIcon = gltf;
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
        await setupArrowModel;
    }
    if (!sharedParams.header_rod_model) {
        sharedParams.header_rod_model = await loadGLTFModel(
            "header_rod_model.glb"
        );
        params.rodSize = getNodeSize(sharedParams.header_rod_model);
    }
    if (!sharedParams.header_glass_shelf_fixing_model) {
        sharedParams.header_glass_shelf_fixing_model = await loadGLTFModel(
            "header_glass_shelf_fixing_model.glb"
        );
        params.glassShelfFixingSize = getNodeSize(
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
    uiManager.elements.headerFrameColorInput.value = getHex(
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
    uiManager.elements.mainFrameColorInput.value = getHex(
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

document.getElementById("registerButton").addEventListener("click", function () {
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
