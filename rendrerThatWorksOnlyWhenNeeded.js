// Display loader progress
import { UIManager } from "./src/managers/UIManager.js";
import {
    manager,
    loadAllModels,
    loadGLTFModel,
    TextureLoaderJpg,
    loadPreviousModels,
    loadRemainingModels,
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

// these are the variables being used to call renderer method and it will help us in improving performances
let animationFrameId;
let lastFrameTime = 0;
const TARGET_FRAMERATE = 60;
const FRAME_INTERVAL = 1000 / TARGET_FRAMERATE;
let isRenderingNeeded = true; // Flag to control rendering

async function init() {
    sharedParams.texture_background = await TextureLoaderJpg.loadAsync(
        "background.png"
    );

    sharedParams.renderer = new Renderer(uiManager.elements.container, render);
    // sharedParams.renderer.setAnimationLoop(render);

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
    sharedParams.main_model = await loadGLTFModel(params.defaultModel + ".glb");
    sharedParams.main_model.name = params.selectedGroupName;
    sharedParams.main_model.activeModel = sharedParams.main_model.children[0];
    allGroups.push(sharedParams.main_model);
    sharedParams.selectedGroup = sharedParams.main_model;
    sharedParams.modelGroup.add(sharedParams.main_model);
    sharedParams.modelGroup.name = "main_group";
    modelManager.setupMainModel(sharedParams.main_model);
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
    startRenderLoop();

    // Add listeners for events that require re-rendering
    // sharedParams.controls.addEventListener('change', () => {
    //     isRenderingNeeded = true;
    // });

    // // Listen for transform control changes
    // sharedParams.transformControls.addEventListener('change', () => {
    //     isRenderingNeeded = true;
    // });

    // Listen for camera movement
    // sharedParams.camera.addEventListener('change', () => {
    //     isRenderingNeeded = true;
    // });
}


// // Updated render function with frame limiting and error handling
// async function render(currentTime) {
//     console.log("ehlo")
//     // Calculate time elapsed since last frame
//     const deltaTime = currentTime - lastFrameTime;

//     // Only render if enough time has passed
//     if (deltaTime >= FRAME_INTERVAL) {
//         try {
//             await updateMeasurementGroups();
//             await updateLabelOcclusion();

//             sharedParams.controls.update();
//             sharedParams.renderer.render(sharedParams.scene, sharedParams.camera);
            
//             if (sharedParams.labelRenderer) {
//                 sharedParams.labelRenderer.render(
//                     sharedParams.scene,
//                     sharedParams.camera
//                 );
//             }

//             lastFrameTime = currentTime;
//         } catch (error) {
//             console.error('Error in render loop:', error);
//         }
//     }

//     // Request next frame
//     animationFrameId = requestAnimationFrame(render);
// }

async function render(currentTime) {
    // if (!isRenderingNeeded) {
    //     animationFrameId = requestAnimationFrame(render);
    //     return;
    // }

    console.log("hi")
    const deltaTime = currentTime - lastFrameTime;
    
    if (deltaTime >= FRAME_INTERVAL) {
        try {
            // Only update controls if they're being used
            if (sharedParams.controls.enabled) {
                sharedParams.controls.update();
            }

            // Render scene
            sharedParams.renderer.render(sharedParams.scene, sharedParams.camera);
            
            // Only update measurements when needed
            if (sharedParams.measurementsNeedUpdate) {
                await updateMeasurementGroups();
                sharedParams.measurementsNeedUpdate = false;
            }

            // Only update labels when needed
            if (sharedParams.labelsNeedUpdate) {
                await updateLabelOcclusion();
                sharedParams.labelsNeedUpdate = false;
            }

            // Render labels if they exist
            if (sharedParams.labelRenderer) {
                sharedParams.labelRenderer.render(
                    sharedParams.scene,
                    sharedParams.camera
                );
            }

            lastFrameTime = currentTime;
            // isRenderingNeeded = false; // Reset the flag after rendering
        } catch (error) {
            console.error('Error in render loop:', error);
        }
    }

    animationFrameId = requestAnimationFrame(render);
}
// Add these control functions
function startRenderLoop() {
    if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(render);
    }
}

function stopRenderLoop() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

// Optional: Add cleanup on window unload
window.addEventListener('unload', () => {
    stopRenderLoop();
});