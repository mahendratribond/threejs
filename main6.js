// Display loader progress
import { UIManager } from "./src/managers/UIManager.js";
import {
    manager,
    loadAllModels,
    loadGLTFModel,
    TextureLoaderJpg,
    loadPreviousModels,
    loadRemainingModels,
    loadWallModel,
} from "./src/managers/LoadingManager.js";
import { Camera } from "./src/core/Camera.js";
import { Renderer } from "./src/core/Renderer.js";
import { Scene } from "./src/core/Scene.js";
import { Controls } from "./src/core/Controls.js";
import {
    calculateBoundingBox,
    updateMeasurementGroups,
    updateLabelOcclusion,
    initLabelRenderer,
} from "./src/managers/MeasurementManager.js";
import { showHideNodes, centerMainModel } from "./utils6.js";
import { ModelManager } from "./src/managers/ModelManager.js";

import {
    THREE,
    TransformControls,
    params,
    allGroups,
    sharedParams,
    lights,
    lightHelpers,
} from "./config.js";

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
        10,
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

    // Create wall group
    sharedParams.modelWallGroup = new THREE.Group();
    sharedParams.modelWallGroup.name = "model_wall_group";
    sharedParams.scene.add(sharedParams.modelWallGroup);

    // Load main wall model
    sharedParams.main_wall_model = await loadGLTFModel(params.defaultWallModel + ".glb");
    sharedParams.main_wall_model.visible = true; // Wall is always visible
    sharedParams.main_wall_model.name = "main_wall"; // Wall is always visible
    sharedParams.main_wall_model.rotateY(Math.PI / 2);
    sharedParams.modelWallGroup.add(sharedParams.main_wall_model);

    // Create main model group
    sharedParams.modelGroup = new THREE.Group();
    sharedParams.scene.add(sharedParams.modelGroup);

    // Load main model and add it to the main model group
    sharedParams.main_model = await loadGLTFModel(params.defaultModel + ".glb");
    sharedParams.main_model.name = params.selectedGroupName;
    sharedParams.main_model.activeModel = sharedParams.main_model.children[0];
    sharedParams.main_model.activeModel.name = params.defaultModel;
    allGroups.push(sharedParams.main_model);
    console.log("sharedParams", sharedParams);
    sharedParams.selectedGroup = sharedParams.main_model;
    sharedParams.modelGroup.add(sharedParams.main_model);
    sharedParams.modelGroup.name = "main_group";
    modelManager.setupMainModel(sharedParams.main_model);

    // Setup wall models position at the back of all main models
    await modelManager.setupWallModel();

    await loadAllModels();
    await loadRemainingModels();

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
    await showHideNodes();

    sharedParams.labelRenderer = await initLabelRenderer();
    document.body.appendChild(sharedParams.labelRenderer.domElement);
    uiManager.setupEventListeners(lights, lightHelpers);
    uiManager.loadingElements.progressText.innerText = `Loading... 100%`;
    uiManager.loadingElements.loaderElement.style.display = "none";
    await loadPreviousModels();
}

async function render() {
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
// ----------------------------------------------------------------------------------------------------------
