import {
    THREE,
    RGBELoader,
    GLTFLoader,
    updateVariable,
    allGroupNames,
    modelQueue,
    params,
    setting,
    sharedParams,
} from "../../config.js";
import {
    setPositionCenter,
    addAnotherModels,
    centerMainModel,
    showHideNodes,
    getModelData,
    addRacks,
    delay,
} from "../../utils6.js";
import { addHangers } from "./HangerManager.js";
import { addNewMaterials, restoreMaterials } from "./MaterialManager.js";
import {
    setTopFrameCropedImage,
    setMainFrameCropedImage,
} from "./FrameImagesManager.js";
import {getNodeSize} from "./MeasurementManager.js"

import { UIManager } from "./UIManager.js";
import { ModelManager } from "./ModelManager.js";
const uiManager = new UIManager();
const modelManager = new ModelManager();
// Create a function to load GLTF models using a Promise
export const manager = new THREE.LoadingManager();
const glftLoader = new GLTFLoader(manager).setPath("./assets/models/glb/");

export const TextureLoaderJpg = new THREE.TextureLoader(manager).setPath(
    "./assets/images/background/"
);
export const rgbeLoader = new RGBELoader(manager).setPath(
    "./assets/images/background/"
);
export async function loadGLTFModel(url) {
    return new Promise((resolve, reject) => {
        glftLoader.load(
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

export async function loadPreviousModels() {
    const loadingModal = document.getElementById("loadingModal");
    const loadingText = document.getElementById("loadingText");
    loadingModal.style.display = "flex";
    loadingText.innerHTML = "Loading Your Data Please wait...";

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
                sharedParams.selectedGroup =
                    sharedParams.modelGroup.getObjectByName(groupName);
                for (const hideModel of sharedParams.selectedGroup.children) {
                    hideModel.visible = false;
                }
                sharedParams.selectedGroup.activeModel =
                    sharedParams.selectedGroup.getObjectByName(
                        setting[params.selectedGroupName].defaultModel
                    );

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

            // for (const name of hangerNames) {
            //     const loaders = document.querySelectorAll(`.${name}_loader`);
            //     loaders.forEach((loader) => removeLoader(loader));
            // }

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
            await showHideNodes();
            await centerMainModel();
        }
    }
    loadingModal.style.display = "none";
}

export async function loadAllModels() {
    let count = 0;
    const loadedModelsStatus = new Map();
    sharedParams.hanger_model = new THREE.Group();

    try {
        async function loadModelWithRetry(modelPath, maxRetries = 3) {
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    const gltf = await loadGLTFModel(modelPath);
                    count += 1;
                    let percent = (count * 100) / modelQueue.length;
                    uiManager.loadingElements.progressText.innerText = `Loading... ${Math.round(
                        percent
                    )}%`;

                    if (!gltf) {
                        throw new Error(
                            `Model ${modelPath} loaded but is null`
                        );
                    }

                    loadedModelsStatus.set(modelPath, "loaded");
                    return gltf;
                } catch (error) {
                    console.error(
                        `Attempt ${attempt} failed for ${modelPath}:`,
                        error
                    );
                    if (attempt === maxRetries) {
                        loadedModelsStatus.set(modelPath, "failed");
                        throw error;
                    }
                    await new Promise((resolve) =>
                        setTimeout(resolve, 1000 * attempt)
                    );
                }
            }
        }

        const loadPromises = modelQueue.map(async (modelPath) => {
            try {
                const gltf = await loadModelWithRetry(modelPath);

                switch (modelPath) {
                    case "Model_1061.glb":
                        modelManager.setupMainModel(gltf);
                        const model_1061 = gltf.getObjectByName("Model_1061");
                        if (!model_1061)
                            throw new Error(
                                "Model_1061 not found in loaded model"
                            );
                        model_1061.visible = false;
                        sharedParams.main_model.add(model_1061);
                        break;

                    case "Model_1200.glb":
                        modelManager.setupMainModel(gltf);
                        const Model_1200 = gltf.getObjectByName("Model_1200");
                        if (!Model_1200)
                            throw new Error(
                                "Model_1200 not found in loaded model"
                            );
                        Model_1200.visible = false;
                        sharedParams.main_model.add(Model_1200);
                        break;

                    case "Model_1500.glb":
                        modelManager.setupMainModel(gltf);
                        const Model_1500 = gltf.getObjectByName("Model_1500");
                        if (!Model_1500)
                            throw new Error(
                                "Model_1500 not found in loaded model"
                            );
                        Model_1500.visible = false;
                        sharedParams.main_model.add(Model_1500);
                        break;

                    case "Model_2000.glb":
                        modelManager.setupMainModel(gltf);
                        const Model_2000 = gltf.getObjectByName("Model_2000");
                        if (!Model_2000)
                            throw new Error(
                                "Model_2000 not found in loaded model"
                            );
                        Model_2000.visible = false;
                        sharedParams.main_model.add(Model_2000);
                        break;

                    case "Model_3000.glb":
                        modelManager.setupMainModel(gltf);
                        const Model_3000 = gltf.getObjectByName("Model_3000");
                        if (!Model_3000)
                            throw new Error(
                                "Model_3000 not found in loaded model"
                            );
                        Model_3000.visible = false;
                        sharedParams.main_model.add(Model_3000);
                        break;

                    case "Hanger_Rail_Step.glb":
                        if (!gltf) {
                            throw new Error("Hanger_Rail_Step model is null");
                        }
                        const railStep =
                            gltf.getObjectByName("Hanger_Rail_Step");
                        if (!railStep) {
                            throw new Error(
                                "Hanger_Rail_Step not found in loaded model"
                            );
                        }
                        sharedParams.hanger_rail_step = railStep;
                        sharedParams.hanger_model.add(
                            sharedParams.hanger_rail_step
                        );
                        break;

                    case "Hanger_Rail_Single.glb":
                        if (!sharedParams.hanger_model)
                            throw new Error("hanger_model not initialized");
                        sharedParams.hanger_rail_single = gltf;
                        const railSingle =
                            gltf.getObjectByName("Hanger_Rail_Single");
                        if (!railSingle)
                            throw new Error(
                                "Hanger_Rail_Single not found in loaded model"
                            );
                        sharedParams.hanger_rail_single = railSingle;
                        sharedParams.hanger_model.add(
                            sharedParams.hanger_rail_single
                        );
                        break;

                    case "Hanger_Rail_D_500mm.glb":
                        if (!sharedParams.hanger_model)
                            throw new Error("hanger_model not initialized");
                        sharedParams.hanger_rail_d_500 = gltf;
                        const railD500 = gltf.getObjectByName(
                            "Hanger_Rail_D_500mm"
                        );
                        if (!railD500)
                            throw new Error("Hanger_Rail_D_500mm not found");
                        sharedParams.hanger_rail_d_500 = railD500;
                        sharedParams.hanger_model.add(
                            sharedParams.hanger_rail_d_500
                        );
                        break;

                    case "Hanger_Rail_D_1000mm.glb":
                        if (!sharedParams.hanger_model)
                            throw new Error("hanger_model not initialized");
                        sharedParams.hanger_rail_d_1000 = gltf;
                        const railD1000 = gltf.getObjectByName(
                            "Hanger_Rail_D_1000mm"
                        );
                        if (!railD1000)
                            throw new Error("Hanger_Rail_D_1000mm not found");
                        sharedParams.hanger_rail_d_1000 = railD1000;
                        sharedParams.hanger_model.add(
                            sharedParams.hanger_rail_d_1000
                        );
                        break;

                    case "hanger_golf_driver_club_model.glb":
                        if (!gltf)
                            throw new Error(
                                "hanger_golf_driver_club_model is null"
                            );
                        sharedParams.hanger_golf_driver_club_model = gltf;
                        break;

                    case "hanger_golf_Iron_club_model.glb":
                        if (!gltf)
                            throw new Error(
                                "hanger_golf_Iron_club_model is null"
                            );
                        sharedParams.hanger_golf_Iron_club_model = gltf;
                        break;

                    case "rack_glass_model.glb":
                        if (!gltf) throw new Error("rack_glass_model is null");
                        sharedParams.rack_glass_model = gltf;
                        await modelManager.setupGlassRackModel(
                            sharedParams.rack_glass_model
                        );
                        break;

                    case "rack_wooden_model.glb":
                        if (!gltf) throw new Error("rack_wooden_model is null");
                        sharedParams.rack_wooden_model = gltf;
                        await modelManager.setupWoodenRackModel(
                            sharedParams.rack_wooden_model
                        );
                        break;

                    case "arrow_model.glb":
                        if (!gltf) throw new Error("arrow_model is null");
                        sharedParams.arrow_model = gltf;
                        await modelManager.setupArrowModel();
                        break;

                    case "header_rod_model.glb":
                        if (!gltf) throw new Error("header_rod_model is null");
                        sharedParams.header_rod_model = gltf;
                        params.rodSize = getNodeSize(
                            sharedParams.header_rod_model
                        );
                        params.rodSize = { x: 50, y: 50, z: 50 };
                        break;

                    case "header_glass_shelf_fixing_model.glb":
                        if (!gltf)
                            throw new Error(
                                "header_glass_shelf_fixing_model is null"
                            );
                        sharedParams.header_glass_shelf_fixing_model = gltf;
                        params.glassShelfFixingSize = getNodeSize(
                            sharedParams.header_glass_shelf_fixing_model
                        );
                        await modelManager.setupGlassShelfFixingModel();
                        break;

                    case "header_500_height_model.glb":
                        if (!gltf)
                            throw new Error("header_500_height_model is null");
                        sharedParams.header_500_height_model = gltf;
                        await modelManager.setupHeader500HeightModel();
                        break;

                    case "header_wooden_shelf_model.glb":
                        if (!gltf)
                            throw new Error(
                                "header_wooden_shelf_model is null"
                            );
                        sharedParams.header_wooden_shelf_model = gltf;
                        await modelManager.setupHeaderWoodenShelfModel();
                        break;

                    case "header_glass_shelf_model.glb":
                        if (!gltf)
                            throw new Error("header_glass_shelf_model is null");
                        sharedParams.header_glass_shelf_model = gltf;
                        await modelManager.setupHeaderGlassShelfModel();
                        break;

                    case "slotted_sides_model.glb":
                        if (!gltf)
                            throw new Error("slotted_sides_model is null");
                        sharedParams.slotted_sides_model = gltf;
                        await modelManager.setupSlottedSidesModel();
                        break;

                    case "support_base_middle.glb":
                        if (!gltf)
                            throw new Error("support_base_middle is null");
                        sharedParams.support_base_middle = gltf;
                        await modelManager.setupSupportBaseModel();
                        break;

                    case "support_base_sides.glb":
                        if (!gltf) throw new Error("support_base_side is null");
                        sharedParams.support_base_side = gltf;
                        await modelManager.setupSupportBaseModel();
                        break;

                    case "removeIcon.glb":
                        if (!gltf) throw new Error("removeIcon is null");
                        sharedParams.removeIcon = gltf;
                        break;

                    default:
                        console.log(`No specific handling for ${modelPath}`);
                        break;
                }

                return { modelPath, success: true };
            } catch (error) {
                console.error(`Error processing ${modelPath}:`, error);
                return { modelPath, success: false, error };
            }
        });

        const results = await Promise.all(loadPromises);

        const failedModels = results.filter((result) => !result.success);
        if (failedModels.length > 0) {
            console.error("Failed to load models:", failedModels);
            throw new Error(`Failed to load ${failedModels.length} models`);
        }

        const verifyDependencies = () => {
            if (!sharedParams.hanger_model)
                throw new Error("hanger_model not initialized");
        };
        verifyDependencies();

        console.log("All models loaded successfully");
        return true;
    } catch (error) {
        console.error("Error in loadAllModels:", error);
        console.log("Loading status:", Object.fromEntries(loadedModelsStatus));
        throw error;
    }
}
//  load all the remaining models if not loaded in first try
export async function loadRemainingModels() {
    if (!sharedParams.arrow_model) {
        sharedParams.arrow_model = await loadGLTFModel("arrow_model.glb");
        await modelManager.setupArrowModel();
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
        await modelManager.setupGlassShelfFixingModel();
    }
    if (!sharedParams.header_500_height_model) {
        sharedParams.header_500_height_model = await loadGLTFModel(
            "header_500_height_model.glb"
        );
        await modelManager.setupHeader500HeightModel();
    }
    if (!sharedParams.header_wooden_shelf_model) {
        sharedParams.header_wooden_shelf_model = await loadGLTFModel(
            "header_wooden_shelf_model.glb"
        );
        await modelManager.setupHeaderWoodenShelfModel();
    }
    if (!sharedParams.header_glass_shelf_model) {
        sharedParams.header_glass_shelf_model = await loadGLTFModel(
            "header_glass_shelf_model.glb"
        );
        await modelManager.setupHeaderGlassShelfModel();
    }
    if (!sharedParams.slotted_sides_model) {
        sharedParams.slotted_sides_model = await loadGLTFModel(
            "slotted_sides_model.glb"
        );
        await modelManager.setupSlottedSidesModel();
    }

    if (!sharedParams.support_base_middle || !sharedParams.support_base_side) {
        sharedParams.support_base_middle = await loadGLTFModel(
            "support_base_middle.glb"
        );
        sharedParams.support_base_side = await loadGLTFModel(
            "support_base_sides.glb"
        );
        await modelManager.setupSupportBaseModel();
    }
}
