// Display loader progress
const loaderElement = document.getElementById('loader');
const progressBarFill = document.getElementById('progress-bar-fill');
const progressText = document.getElementById('progress-text');


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
    }
    else {
        loaderElement.style.display = 'none';
    }
}

await simulateProgress(); // Start smooth progress simulation


async function showTime(test) {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds}`;
    console.log('timeString' + test + ':', timeString);
}

await showTime(0)

import * as THREE from "three";
// import Stats from 'three/addons/libs/stats.module.js';

// import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TransformControls } from 'three/addons/controls/TransformControls.js';

import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { ColladaLoader } from "three/addons/loaders/ColladaLoader.js";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import {
    setupHeaderWoodenShelfModel,
    setupHeaderGlassShelfModel,
    setupGlassShelfFixingModel,
    setupHeader500HeightModel,
    setupHangerGolfClubModel,
    updateMeasurementGroups,
    setupSlottedSidesModel,
    generateGlassMaterial,
    setupWoodenRackModel,
    findParentNodeByName,
    getCurrentModelSize,
    updateFrameMaterial,
    updateRightControls,
    setupGlassRackModel,
    getNextVisibleChild,
    getPrevVisibleChild,
    computeBoundingBox,
    setupHangerModel,
    isVisibleParents,
    setTextureParams,
    updateFrameSize,
    commonMaterial,
    setupMainModel,
    loaderShowHide,
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
} from './utils.js';


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
} from './config.js';


const container = document.getElementById('container');
const baseColor = document.getElementById("baseColor")
const frameSize = document.getElementById("frameSize")
const addHanger = document.querySelectorAll('.addHanger');
const addAnotherModel = document.querySelectorAll('.addAnotherModel');
const headerRodToggle = document.getElementById("headerRodToggle")
const addRack = document.querySelectorAll('.addRack');
const topDropdown = document.getElementById("topDropdown")
const headerOptions = document.getElementById("headerOptions")
const headerSizeDropdown = document.getElementById("headerSizeDropdown")
const headerRodColorDropdown = document.getElementById("headerRodColorDropdown")
const topFrameFileUpload = document.getElementById('topFrameFileUpload');
const headerFrameColorInput = document.getElementById('headerFrameColorInput');
const headerFrameColorDropdown = document.getElementById("headerFrameColorDropdown")
const shelfTypeDropdown = document.getElementById("shelfTypeDropdown")
const slottedSidesToggle = document.getElementById('slottedSidesToggle');
const hangerClothesToggle = document.getElementById('hangerClothesToggle');
const hangerGolfClubsToggle = document.getElementById('hangerGolfClubsToggle');
const mainFrameFileUpload = document.getElementById('mainFrameFileUpload');
const mainFrameColorInput = document.getElementById('mainFrameColorInput');
const baseSelectorDropdown = document.getElementById('baseSelector');
const measurementToggle = document.getElementById('measurementToggle');
const captureButton = document.getElementById('captureButton');
const hangerStandColor = document.getElementById('hangerStandColor');
const rackShelfColor = document.getElementById('rackShelfColor');
const rackStandColor = document.getElementById('rackStandColor');

const cropperContainer = document.getElementById('cropper-container');
const cropperImage = document.getElementById('cropper-image');
const cropButton = document.getElementById('crop-button');
const closeButton = document.getElementById('close-button');

// const selectedModel = document.querySelectorAll(".selectedModel")
const selectedPrevModel = document.getElementById('selectedPrevModel');
const selectedNextModel = document.getElementById('selectedNextModel');

const zoomInButton = document.getElementById('cropper-zoom-in');
const zoomOutButton = document.getElementById('cropper-zoom-out');
const moveLeftButton = document.getElementById('cropper-move-left');
const moveRightButton = document.getElementById('cropper-move-right');
const moveUpButton = document.getElementById('cropper-move-up');
const moveDownButton = document.getElementById('cropper-move-down');
const rotateLeftButton = document.getElementById('cropper-rotate-left');
const rotateRightButton = document.getElementById('cropper-rotate-right');
const scaleXButton = document.getElementById('cropper-scale-x');
const scaleYButton = document.getElementById('cropper-scale-y');
const resetButton = document.getElementById('cropper-reset');


// Set up the loading manager
const manager = new THREE.LoadingManager();

// Initialize the loaders with the manager
const rgbeLoader = new RGBELoader(manager).setPath("./assets/images/background/");
const TextureLoaderJpg = new THREE.TextureLoader(manager).setPath("./assets/images/background/");
const borderTextureLoaderJpg = new THREE.TextureLoader(manager).setPath("./assets/images/borders/");
const colladaLoader = new ColladaLoader(manager).setPath("./assets/models/");
const GLTFLoaderaLoader = new GLTFLoader(manager).setPath("./assets/models/glb/");
const textureLoader = new THREE.TextureLoader(manager);
// const loader = new GLTFLoader();


let gui, stats;
let renderer, scene, camera, controls, transformControls, raycaster, mouse, hangerIntersects, selectedNode;
let cropper, topFramCropedImage, mainFramCropedImage,
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
    golf_club,
    rack_wooden_model,
    rack_glass_model;
const lights = [];
const lightHelpers = [];
const hangerArray = [];
window['shadow'] = await commonMaterial(0x444444)


// Start simulating progress when the window loads
window.addEventListener('load', async () => {
    try {
        loaderElement.style.display = 'flex';  // Show the loader

        // Initialize the scene with the loaded resources
        await init().catch(function (err) {
            console.error(err);
        });

    } catch (error) {
        console.error('Error loading assets:', error);
        progressText.innerText = 'Failed to load resources. Please try again.';
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
    console.log('All assets loaded');
};

// Error handling
manager.onError = (url) => {
    console.error(`There was an error loading ${url}`);
    progressText.innerText = 'Failed to load some resources. Please try again.';
};


async function init() {
    texture_background = await TextureLoaderJpg.loadAsync('background.png');

    window['border_texture_material'] = new THREE.MeshPhongMaterial({
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

    await lightSetup()

    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        1, 500000
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
    controls.update();


    main_model = await loadGLTFModel(GLTFLoaderaLoader, params.defaultModel + '.glb');
    await setupMainModel(main_model)
    await updateFrameMaterial(main_model, 'frame', 'color', params.allBorderColor);
    // params.mainModel[params.defaultModel] = main_model.clone()
    scene.add(main_model);
    await showHideNodes(main_model, scene, camera)

    for (let val of allModelNames) {
        let model_name = val + '.glb';
        let already_added = main_model.getObjectByName(val);
        if (!already_added) {
            let model_load = await loadGLTFModel(GLTFLoaderaLoader, model_name);
            await setupMainModel(model_load)
            let model = model_load.getObjectByName(val);
            model.visible = false;
            await updateFrameMaterial(model, 'frame', 'color', params.allBorderColor);
            // params.mainModel[val] = model.clone()
            main_model.add(model);
        }
    }

    await showHideNodes(main_model, scene, camera)

    // Transform controls
    transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.addEventListener('dragging-changed', (event) => {
        controls.enabled = !event.value;
    });
    scene.add(transformControls);


    // Add event listeners
    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('click', onMouseClick, false);
    window.addEventListener("resize", onWindowResize);

    await loaderShowHide(false)
    await otherModelSetup()
    await updateFrameSize(main_model, scene, camera)
    await showHideNodes(main_model, scene, camera);

    if (!hanger_golf_club_model) {
        hanger_golf_club_model = await loadGLTFModel(GLTFLoaderaLoader, "hanger_golf_club_model.glb");
        // hanger_golf_club_model = await loadModel(colladaLoader, 'hanger_golf_club_model.dae');
        await setupHangerGolfClubModel(main_model, hanger_golf_club_model);
    }
    if (!hanger_model) {
        hanger_model = await loadGLTFModel(GLTFLoaderaLoader, "hanger_model.glb");
        // hanger_model = await loadModel(colladaLoader, 'hanger_model.dae');
        await setupHangerModel(main_model, hanger_model);
    }
    if (!rack_glass_model) {
        rack_glass_model = await loadGLTFModel(GLTFLoaderaLoader, 'rack_glass_model.glb');
        // rack_glass_model = await loadModel(colladaLoader, 'rack_glass_model.dae');
        await setupGlassRackModel(main_model, rack_glass_model, texture_background);
    }
    if (!rack_wooden_model) {
        rack_wooden_model = await loadGLTFModel(GLTFLoaderaLoader, 'rack_wooden_model.glb');
        // rack_wooden_model = await loadModel(colladaLoader, 'rack_wooden_model.dae');
        // console.log('hanger_model', hanger_model)
        await setupWoodenRackModel(main_model, rack_wooden_model);
    }


    for (let val of allModelNames) {
        let model = main_model.getObjectByName(val);
        // model.visible = false;
        params.mainModel[val] = model.clone()
    }



}



// Handle mouse move for hover
async function otherModelSetup() {
    if (!header_rod_model) {
        header_rod_model = await loadGLTFModel(GLTFLoaderaLoader, 'header_rod_model.glb');
        // header_rod_model = await loadModel(colladaLoader, 'header_rod_model.dae');
        params.rodSize = await getNodeSize(header_rod_model)
        // console.log('params.rodSize', params.rodSize)
    }
    if (!header_glass_shelf_fixing_model) {
        header_glass_shelf_fixing_model = await loadGLTFModel(GLTFLoaderaLoader, 'header_glass_shelf_fixing_model.glb');
        // header_glass_shelf_fixing_model = await loadModel(colladaLoader, 'header_glass_shelf_fixing_model.dae');
        params.glassShelfFixingSize = await getNodeSize(header_glass_shelf_fixing_model);
        await setupGlassShelfFixingModel(main_model, header_rod_model, header_glass_shelf_fixing_model);
    }
    if (!header_500_height_model) {
        header_500_height_model = await loadGLTFModel(GLTFLoaderaLoader, 'header_500_height_model.glb');
        // header_500_height_model = await loadModel(colladaLoader, 'header_500_height_model.dae');
        await setupHeader500HeightModel(main_model, header_500_height_model);
        await updateMaterial(params.allBorderColor, 'frame');
    }
    if (!header_wooden_shelf_model) {
        header_wooden_shelf_model = await loadGLTFModel(GLTFLoaderaLoader, 'header_wooden_shelf_model.glb');
        // header_wooden_shelf_model = await loadModel(colladaLoader, 'header_wooden_shelf_model.dae');
        await setupHeaderWoodenShelfModel(main_model, header_wooden_shelf_model);
        await updateMaterial(params.defaultShelfColor, 'shelf');
    }
    if (!header_glass_shelf_model) {
        header_glass_shelf_model = await loadGLTFModel(GLTFLoaderaLoader, 'header_glass_shelf_model.glb');
        // header_glass_shelf_model = await loadModel(colladaLoader, 'header_glass_shelf_model.dae');
        await setupHeaderGlassShelfModel(main_model, header_glass_shelf_model, texture_background);
    }
    if (!slotted_sides_model) {
        slotted_sides_model = await loadGLTFModel(GLTFLoaderaLoader, 'slotted_sides_model.glb');
        // slotted_sides_model = await loadModel(colladaLoader, 'slotted_sides_model.dae');
        await setupSlottedSidesModel(main_model, slotted_sides_model);
        await updateMaterial(params.allBorderColor, 'frame');
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
        if (allOtherModelNames.includes(child.name) && child.visible) {
            visibleObjects.push(child);
        }
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
    console.log('hangerIntersects', hangerIntersects);
    let defaultModel = main_model.getObjectByName(params.defaultModel);
    if (hangerIntersects.length > 0) {


        const intersectNode = hangerIntersects[0].object;
        if (intersectNode) {
            selectedNode = intersectNode.parent
            let iconName = selectedNode.name;

            transformControls.removeEventListener('objectChange', enforceHangerBounds);
            transformControls.removeEventListener('objectChange', enforceRackBounds);
            // Check if clicked on allModelNames or allOtherModelNames

            if (iconName.startsWith('removeHanger-')) {
                let nodeName = iconName.replace('removeHanger-', '');
                let hangerToRemove = await findParentNodeByName(selectedNode, nodeName);
                let hangerArrayKey = hangerToRemove.hangerArrayKey || null
                if (hangerToRemove) {
                    let frame = defaultModel.getObjectByName('Frame');
                    transformControls.detach();
                    frame.remove(hangerToRemove);
                }
                if (hangerArrayKey) {
                    hangerArray[hangerArrayKey] -= 1
                }
            }
            else if (iconName.startsWith('removeRack-')) {
                let nodeName = iconName.replace('removeRack-', '');
                let hangerToRemove = await findParentNodeByName(selectedNode, nodeName);
                if (hangerToRemove) {
                    let frame = defaultModel.getObjectByName('Frame');
                    transformControls.detach();
                    frame.remove(hangerToRemove);
                }
            }
            else if (hangerPartNames.includes(selectedNode.name) || hangerNames.includes(selectedNode.name)) {
                let tempNode, selectedHangerNode;

                for (let val of hangerNames) {
                    tempNode = await findParentNodeByName(selectedNode, val, true);
                    if (tempNode) {
                        selectedHangerNode = tempNode
                        break;
                    }
                }
                if (selectedHangerNode) {
                    selectedNode = selectedHangerNode

                    // console.log('selectedNode', selectedNode)

                    // Attach transform controls to the selected node
                    transformControls.attach(selectedNode);
                    transformControls.setMode('translate');  // Set the mode to 'translate' for moving

                    // Configure to show only X-axis control and allow movement only on X-axis
                    transformControls.showX = true;  // Show only X-axis arrow
                    transformControls.showY = false; // Hide Y-axis arrow
                    transformControls.showZ = false; // Hide Z-axis arrow

                    // Add event listener to enforce boundary check during movement
                    transformControls.addEventListener('objectChange', enforceHangerBounds);
                }
            }
            else if (rackPartNames.includes(selectedNode.name) || rackNames.includes(selectedNode.name)) {
                let tempNode, selectedRackNode;

                for (let val of rackNames) {
                    tempNode = await findParentNodeByName(selectedNode, val, true);
                    if (tempNode) {
                        selectedRackNode = tempNode
                        break;
                    }
                }
                if (!selectedRackNode && rackNames.includes(selectedNode.name)) {
                    selectedRackNode = selectedNode
                }
                if (selectedRackNode) {
                    selectedNode = selectedRackNode
                    // Attach transform controls to the selected node
                    transformControls.attach(selectedNode);
                    transformControls.setMode('translate');  // Set the mode to 'translate' for moving
                    transformControls.translationSnap = 3.139;

                    // Configure to show only X-axis control and allow movement only on X-axis
                    transformControls.showX = false;  // Show only X-axis arrow
                    transformControls.showY = true; // Hide Y-axis arrow
                    transformControls.showZ = false; // Hide Z-axis arrow


                    // Add event listener to enforce boundary check during movement
                    transformControls.addEventListener('objectChange', enforceRackBounds);
                }
            }
            else {

                transformControls.detach();
                selectedNode = null;
            }
        }
        else {
            transformControls.detach();
            selectedNode = null;
        }
    }
    else {
        transformControls.detach();
        selectedNode = null;
    }
}

// Function to enforce boundaries on X-axis
async function enforceHangerBounds() {
    if (selectedNode) {
        let defaultModel = main_model.getObjectByName(params.defaultModel);
        let baseFrame = defaultModel.getObjectByName('Top_Ex');
        const baseFrameBox = new THREE.Box3().setFromObject(baseFrame);

        const min = baseFrameBox.min.clone();
        const max = baseFrameBox.max.clone();

        let minX = min.x + baseFrame.position.x;
        let maxX = max.x + baseFrame.position.x;
        let selectedChildNode = selectedNode.getObjectByName('Hanger_Stand');

        const nodeBoundingBox = new THREE.Box3().setFromObject(selectedChildNode);
        const nodeWidth = nodeBoundingBox.max.x - nodeBoundingBox.min.x;

        // const margin = 20;

        const adjustedMinX = minX + nodeWidth / 2 + params.frameTopExMargin;
        const adjustedMaxX = maxX - nodeWidth / 2 - params.frameTopExMargin;

        const position = selectedNode.position;

        // If the node is trying to move past the minX or maxX boundary, set its position to the boundary
        if (position.x < adjustedMinX) {
            position.x = adjustedMinX;
        } else if (position.x > adjustedMaxX) {
            position.x = adjustedMaxX;
        }
    }
}

// Function to enforce boundaries on X-axis
async function enforceRackBounds() {
    if (selectedNode) {

        let defaultModel = main_model.getObjectByName(params.defaultModel);
        let baseFrame = defaultModel.getObjectByName('Base_Solid');
        let leftSlottedFrame = defaultModel.getObjectByName('Left_Ex_Slotted');
        const baseFrameBox = new THREE.Box3().setFromObject(baseFrame);
        const leftSlottedFrameBox = new THREE.Box3().setFromObject(leftSlottedFrame);

        const min = leftSlottedFrameBox.min.clone();
        const max = leftSlottedFrameBox.max.clone();
        const leftSlottedFrameHeight = max.y - min.y;
        const baseFrameHeight = baseFrameBox.max.y - baseFrameBox.min.y;

        let minY = min.y;
        let maxY = max.y + leftSlottedFrame.position.y;
        const nodeBoundingBox = new THREE.Box3().setFromObject(selectedNode);
        const nodeHeight = nodeBoundingBox.max.y - nodeBoundingBox.min.y;

        const margin = 0.5;

        const adjustedMinY = minY - nodeHeight / 2 - baseFrameHeight - 25;
        const adjustedMaxY = maxY - nodeHeight / 2 + baseFrameHeight * 2 + margin;

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
        let baseFrame = defaultModel.getObjectByName('Base_Solid');
        let leftSlottedFrame = defaultModel.getObjectByName('Left_Ex_Slotted');
        const baseFrameBox = new THREE.Box3().setFromObject(baseFrame);
        const leftSlottedFrameBox = new THREE.Box3().setFromObject(leftSlottedFrame);

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

        const adjustedMinY = minY //- params.cameraPosition  //- 0.5;
        const adjustedMaxY = maxY //- params.cameraPosition // + margin;
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
    let radius = 90;
    let lightIntensity1 = 1;
    let lightIntensity2 = 2.3;

    if (params.defaultModel) {
        const model_size = parseInt(await getModelSize(params.defaultModel))
        if (model_size >= 2000) {
            radius = 170;
        }
    }

    const customDropdownButton = document.querySelector(`.custom-dropdown[data-type="frame"]`);
    const selectedItem = customDropdownButton.querySelector('.dropdown-item.selected');
    if (selectedItem) {
        const dataType = selectedItem.getAttribute('data-type');
        const dataColor = selectedItem.getAttribute('data-value');
        if (dataType == 'color' && dataColor == '0xffffff') {
            lightIntensity1 = 0;
        }
    }

    // Remove previously added lights and helpers
    lights.forEach(light => {
        scene.remove(light);
        light.dispose(); // Optional: Dispose of light resources
    });
    lightHelpers.forEach(helper => {
        scene.remove(helper);
        // No need to dispose of helper resources explicitly in most cases
    });

    // Clear the arrays
    lights.length = 0;
    lightHelpers.length = 0;

    // const radius = customRadius;
    const height = 100;

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
    await updateMeasurementGroups(main_model, scene, camera);
    renderer.render(scene, camera);
}

async function setMainFrameCropedImage() {
    if (mainFramCropedImage[params.defaultModel]) {
        const mainFrameBackgroundColor = await getHex(params.mainFrameBackgroundColor);
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = mainFramCropedImage[params.defaultModel].width;
        tempCanvas.height = mainFramCropedImage[params.defaultModel].height;
        const ctx = tempCanvas.getContext('2d');

        // Draw the background color
        ctx.fillStyle = mainFrameBackgroundColor;
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

        // Draw the cropped image on top
        ctx.drawImage(mainFramCropedImage[params.defaultModel], 0, 0);

        tempCanvas.toBlob(async (blob) => {
            const url = URL.createObjectURL(blob);
            const texture = new THREE.TextureLoader().load(url, async function () {
                await updateMainFrameImageTexture(texture);
            });
            await closeCropper();
        });
    }
}

async function setTopFrameCropedImage() {
    if (topFramCropedImage[params.defaultModel][params.defaultHeaderSize]) {
        const topFrameBackgroundColor = await getHex(params.topFrameBackgroundColor);
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = topFramCropedImage[params.defaultModel][params.defaultHeaderSize].width;
        tempCanvas.height = topFramCropedImage[params.defaultModel][params.defaultHeaderSize].height;
        const ctx = tempCanvas.getContext('2d');

        // Draw the background color
        ctx.fillStyle = topFrameBackgroundColor;
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

        // Draw the cropped image on top
        ctx.drawImage(topFramCropedImage[params.defaultModel][params.defaultHeaderSize], 0, 0);

        tempCanvas.toBlob(async (blob) => {
            const url = URL.createObjectURL(blob);
            const texture = new THREE.TextureLoader().load(url, async function () {
                await updateTopFrameImageTexture(texture);
            });
            await closeCropper();
        });
    }
}


async function updateMainFrameImageTexture1(texture) {
    const currentModel = scene.getObjectByName(params.defaultModel);
    currentModel.traverse(async function (main_model) {
        main_model.traverse(async function (child) {
            await updateTexture(child, texture, frameMainNames)
        });
        renderer.render(scene, camera);
    })
}

async function updateTopFrameImageTexture1(texture) {
    const currentModel = scene.getObjectByName(params.defaultModel);
    currentModel.traverse(async function (main_model) {
        main_model.traverse(async function (child) {
            await updateTexture(child, texture, frameTop1Names)
        });
        renderer.render(scene, camera);
    });
}

async function updateMainFrameImageTexture(texture) {
    const currentModel = scene.getObjectByName(params.defaultModel);
    currentModel.traverse(function (modelNode) {
        const frame = modelNode.getObjectByName('Frame');
        if (frame) {
            frame.traverse(async function (child) {
                await setUploadedTexture(child, texture, frameMainNames)
            });
        }

    });
}

async function updateTopFrameImageTexture(texture) {
    const currentModel = scene.getObjectByName(params.defaultModel);
    currentModel.traverse(function (modelNode) {
        const header = modelNode.getObjectByName(params.defaultHeaderSize);
        if (header) {
            header.traverse(async function (child) {
                await setUploadedTexture(child, texture, frameTop1Names)
            });
        }

    });
}

async function setUploadedTexture(mesh, texture, frameNames) {
    texture = await setTextureParams(texture);
    texture.flipY = false;

    if (frameNames.includes(mesh.name)) {
        // Check if the mesh is a mesh
        if (mesh.isMesh) {
            var met = mesh.material.clone()
            // If the mesh has a single material
            met.map = texture;
            met.map.wrapS = THREE.RepeatWrapping;
            met.map.wrapT = THREE.RepeatWrapping;
            met.needsUpdate = true;
            mesh.material = met;

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
                mesh.material = mesh.material.map(mat => mat.clone());
                mesh.userData.isUnique = true; // Mark this node as having unique instances
            }

            // // Loop through each material and update the texture
            mesh.material.forEach(material => {
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
                mesh.material.forEach(mat => {
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
async function updateMaterial(value, dropdownType) {
    // console.log('value', value)
    let type, imageUrl, displayText;
    if (dropdownType === 'frame') {
        params.allBorderColor = value
    }
    else if (dropdownType === 'shelf') {
        params.defaultShelfColor = value
    }

    const customDropdownButton = document.querySelector(`.custom-dropdown[data-type=${dropdownType}]`);

    // Reset selected class
    // document.querySelectorAll(".dropdown-item").forEach(function (el) {
    customDropdownButton.querySelectorAll(`.dropdown-item`).forEach(function (el) {
        el.classList.remove("selected");
    });

    // Find the matching element and add the selected class
    customDropdownButton.querySelectorAll(`.dropdown-item`).forEach(function (element) {
        // console.log('element', element.getAttribute("data-value"))
        if (element.getAttribute("data-value") === value) {
            // console.log('yes', value)

            type = element.getAttribute("data-type")
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
    const dropdownButton = customDropdownButton.querySelector(`.dropdown-button`);
    if (dropdownButton) {
        const selectedImage = dropdownButton.querySelector('.selected-image');
        const selectedText = dropdownButton.querySelector('span');
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

    if (dropdownType === 'frame') {
        if (type && type == 'color' && value && value == '0xffffff') {
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
        }
        else {
            renderer.toneMapping = THREE.AgXToneMapping;
        }
        await lightSetup()
    }
    // console.log(main_model)
}

async function closeCropper() {
    cropperContainer.style.display = 'none';
    document.body.classList.remove('modal-open');
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
    topFrameFileUpload.value = '';
    mainFrameFileUpload.value = '';
}

// Event listeners for controls
if (frameSize) {
    frameSize.value = params.defaultModel;
    frameSize.addEventListener("change", async function (event) {
        params.defaultModel = event.target.value;
        await loaderShowHide(true)
        // await otherModelSetup()
        await loaderShowHide(false)
        await updateFrameSize(main_model, scene, camera)
        await lightSetup();
    });
}

// Event listeners for controls
if (headerSizeDropdown) {
    headerSizeDropdown.value = params.defaultHeaderSize;
    headerSizeDropdown.addEventListener("change", async function (event) {
        params.defaultHeaderSize = event.target.value;

        await loaderShowHide(true)
        await otherModelSetup()
        await loaderShowHide(false)
        await showHideNodes(main_model, scene, camera);
    });
}

if (baseColor) {
    baseColor.value = params.baseFrameColor;

    baseColor.addEventListener("change", async function (event) {
        params.baseFrameColor = event.target.value;
        await loaderShowHide(true)
        await otherModelSetup()
        await loaderShowHide(false)
        await showHideNodes(main_model, scene, camera)
    });
}

if (hangerStandColor) {
    hangerStandColor.value = params.defaultHangerStandColor;

    hangerStandColor.addEventListener("change", async function (event) {
        params.defaultHangerStandColor = event.target.value;
        await loaderShowHide(true)
        await otherModelSetup()
        await loaderShowHide(false)
        await showHideNodes(main_model, scene, camera)
    });
}

if (rackShelfColor) {
    rackShelfColor.value = params.defaultRackShelfStandColor;

    rackShelfColor.addEventListener("change", async function (event) {
        params.defaultRackShelfStandColor = event.target.value;
        await loaderShowHide(true)
        await otherModelSetup()
        await loaderShowHide(false)
        await showHideNodes(main_model, scene, camera)
    });
}

if (rackStandColor) {
    rackStandColor.value = params.defaultRackStandStandColor;

    rackStandColor.addEventListener("change", async function (event) {
        params.defaultRackStandStandColor = event.target.value;
        await loaderShowHide(true)
        await otherModelSetup()
        await loaderShowHide(false)
        await showHideNodes(main_model, scene, camera)
    });
}

if (headerOptions) {
    headerOptions.value = params.headerOptions;
    headerOptions.addEventListener("change", async function (event) {
        params.headerOptions = event.target.value
        await loaderShowHide(true)
        await otherModelSetup()
        await loaderShowHide(false)
        await showHideNodes()
    });
}

if (baseSelectorDropdown) {
    baseSelectorDropdown.value = params.selectedBaseFrame;

    baseSelectorDropdown.addEventListener('change', async function (event) {
        params.selectedBaseFrame = event.target.value
        await loaderShowHide(true)
        await otherModelSetup()
        await loaderShowHide(false)
        await showHideNodes(main_model, scene, camera);
    });
}

if (topDropdown) {
    topDropdown.value = params.topOption;

    topDropdown.addEventListener("change", async function (event) {
        params.topOption = event.target.value
        params.headerRodToggle = false;
        if (params.topOption == 'Header_Wooden_Shelf') {
            params.headerRodToggle = true;
        }

        headerRodToggle.checked = params.headerRodToggle;
        await loaderShowHide(true)
        await otherModelSetup()
        await loaderShowHide(false)
        await showHideNodes(main_model, scene, camera);

    });
}

if (headerRodToggle) {
    headerRodToggle.checked = params.headerRodToggle;
    headerRodToggle.addEventListener("change", async function (event) {
        params.headerRodToggle = event.target.checked;
        await loaderShowHide(true)
        await otherModelSetup()
        await loaderShowHide(false)
        await showHideNodes(main_model, scene, camera)
    });
}

if (shelfTypeDropdown) {
    shelfTypeDropdown.value = params.defaultShelfType;
    shelfTypeDropdown.addEventListener("change", async function (event) {
        params.defaultShelfType = event.target.value;
        await loaderShowHide(true)
        await otherModelSetup()
        await loaderShowHide(false)
        await showHideNodes(main_model, scene, camera)
    });
}

if (slottedSidesToggle) {
    slottedSidesToggle.checked = params.slottedSidesToggle;

    slottedSidesToggle.addEventListener("change", async function (event) {
        params.slottedSidesToggle = event.target.checked;

        await loaderShowHide(true)
        await otherModelSetup()
        await loaderShowHide(false)
        await loaderShowHide(false)
        await showHideNodes(main_model, scene, camera)
    });
}

if (hangerClothesToggle) {
    hangerClothesToggle.checked = params.hangerClothesToggle;

    hangerClothesToggle.addEventListener("change", async function (event) {
        params.hangerClothesToggle = event.target.checked;
        await loaderShowHide(true)
        await otherModelSetup()
        await loaderShowHide(false)
        await showHideNodes(main_model, scene, camera)
    });
}

if (hangerGolfClubsToggle) {
    hangerGolfClubsToggle.checked = params.hangerGolfClubsToggle;

    hangerGolfClubsToggle.addEventListener("change", async function (event) {
        params.hangerGolfClubsToggle = event.target.checked;
        await loaderShowHide(true)
        await otherModelSetup()
        await loaderShowHide(false)
        await showHideNodes(main_model, scene, camera)
    });
}

if (measurementToggle) {
    measurementToggle.checked = params.measurementToggle;

    measurementToggle.addEventListener("change", async function (event) {
        params.measurementToggle = event.target.checked;
        await loaderShowHide(true)
        await otherModelSetup()
        await loaderShowHide(false)
        await showHideNodes(main_model, scene, camera)
    });
}

if (topFrameFileUpload) {
    topFrameFileUpload.addEventListener("change", async function (event) {
        const file = event.target.files[0];
        if (!file) return;
        params.fileUploadFlag = 'TopFrame';

        const reader = new FileReader();
        reader.onload = async function (e) {
            cropperImage.src = e.target.result;
            cropperContainer.style.display = 'block';

            if (cropper) {
                cropper.destroy();
            }

            let currentModel = scene.getObjectByName(params.defaultModel);
            let currentHeader = currentModel.getObjectByName(params.defaultHeaderSize);
            const size = await getCurrentModelSize(currentHeader, 'Header_Graphic1-Mat');

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
    });
}

if (mainFrameFileUpload) {
    mainFrameFileUpload.addEventListener("change", async function (event) {
        const file = event.target.files[0];
        if (!file) return;

        params.fileUploadFlag = 'MainFrame';

        const reader = new FileReader();
        reader.onload = async function (e) {
            cropperImage.src = e.target.result;
            cropperContainer.style.display = 'block';

            if (cropper) {
                cropper.destroy();
            }

            let currentModel = scene.getObjectByName(params.defaultModel);
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
    });
}

if (headerFrameColorInput) {
    headerFrameColorInput.value = await getHex(params.topFrameBackgroundColor);

    headerFrameColorInput.addEventListener("input", async function (event) {
        params.topFrameBackgroundColor = event.target.value;
        await loaderShowHide(true)
        await otherModelSetup()
        await loaderShowHide(false)
        await setTopFrameCropedImage()
    });
}

if (headerRodColorDropdown) {
    headerRodColorDropdown.value = params.rodFrameColor;

    headerRodColorDropdown.addEventListener("change", async function (event) {
        params.rodFrameColor = event.target.value;
        await loaderShowHide(true)
        await otherModelSetup()
        await loaderShowHide(false)
        await showHideNodes(main_model, scene, camera)
    });
}

if (headerFrameColorDropdown) {
    headerFrameColorDropdown.value = params.topFrameBackgroundColor;

    headerFrameColorDropdown.addEventListener("change", async function (event) {
        params.topFrameBackgroundColor = event.target.value;
        await setTopFrameCropedImage()
    });
}

if (mainFrameColorInput) {
    mainFrameColorInput.value = await getHex(params.mainFrameBackgroundColor);

    mainFrameColorInput.addEventListener("input", async function (event) {
        params.mainFrameBackgroundColor = event.target.value;
        await setMainFrameCropedImage()
    });
}

if (cropButton) {
    cropButton.addEventListener("click", async function (event) {
        if (cropper) {
            if (params.fileUploadFlag == 'MainFrame') {
                mainFramCropedImage = mainFramCropedImage || {};
                mainFramCropedImage[params.defaultModel] = cropper.getCroppedCanvas();
                await setMainFrameCropedImage();
            } else if (params.fileUploadFlag == 'TopFrame') {
                topFramCropedImage = topFramCropedImage || {};
                topFramCropedImage[params.defaultModel] = topFramCropedImage[params.defaultModel] || {};
                topFramCropedImage[params.defaultModel][params.defaultHeaderSize] = cropper.getCroppedCanvas();
                await setTopFrameCropedImage()
            }
        }
    });
}

if (closeButton) {
    closeButton.addEventListener("click", closeCropper);
}

// Event listeners for controls

// if (selectedModel) {
//     selectedModel.forEach(button => {
//         // button.addEventListener('click', async function () {
//         button.addEventListener("change", async function (event) {
//             // params.selectedModel = event.target.value
//             if (params.selectedModel) {
//                 params.selectedModel.position.z -= params.selectedModelZAxis;
//             }
//             params.selectedModel = main_model.getObjectByName(event.target.value);
//             if (params.selectedModel) {
//                 params.selectedModel.position.z += params.selectedModelZAxis;
//             }
//             // params.selectedModel = params.defaultModel;
//             // if (!params.selectedModel) {
//             // }
//             // params.selectedModel.position.z -= params.selectedModelZAxis
//             // params.selectedModel = main_model.getObjectByName(event.target.value);
//             console.log('event.target.value', event.target.value)
//             // console.log('event.target.checked', event.target.checked)

//             // // if (event.target.checked) {
//             // params.selectedModel.position.z += params.selectedModelZAxis
//             // }


//         });
//     });
// }

// Event listener for the previous model button
if (selectedPrevModel) {
    selectedPrevModel.addEventListener("click", async function () {
        const prevModel = await getPrevVisibleChild(main_model, params.selectedModel);
        if (prevModel) {
            params.selectedModel.position.z -= params.selectedModelZAxis; // Move the current model back
            params.selectedModel = prevModel; // Update the selected model
            params.selectedModel.position.z += params.selectedModelZAxis; // Move the new model forward
            console.log('Selected Previous Model:', params.selectedModel.name);
        }
    });
}

// Event listener for the next model button
if (selectedNextModel) {
    selectedNextModel.addEventListener("click", async function () {
        const nextModel = await getNextVisibleChild(main_model, params.selectedModel);
        if (nextModel) {
            params.selectedModel.position.z -= params.selectedModelZAxis; // Move the current model back
            params.selectedModel = nextModel; // Update the selected model
            params.selectedModel.position.z += params.selectedModelZAxis; // Move the new model forward
            console.log('Selected Next Model:', params.selectedModel.name);
        }
    });
}

if (addAnotherModel) {
    addAnotherModel.forEach(button => {
        button.addEventListener('click', async function () {
            const modelType = this.getAttribute('data-type');
            let defaultModel = main_model.getObjectByName(params.defaultModel);
            await loaderShowHide(true)
            await otherModelSetup()
            // console.log('params.mainModel', params.mainModel)
            if (params.mainModel && params.mainModel[modelType]) {
                let model_load = params.mainModel[modelType].clone();
                let model = model_load.getObjectByName(modelType);
                if (!model) {
                    model = model_load
                }
                // console.log('model', model)
                let baseModelName = 'Other_' + modelType;
                model.name = baseModelName + '_1';
                let suffix = 1;
                while (main_model.getObjectByName(model.name)) {
                    model.name = `${baseModelName}_${suffix}`;
                    suffix++;
                }

                allOtherModelNames.push(model.name)
                // console.log('allOtherModelNames', allOtherModelNames)

                const modelBoundingBox = new THREE.Box3().setFromObject(model);
                const modelWidth = modelBoundingBox.max.x - modelBoundingBox.min.x


                const mergedArray = allModelNames.concat(allOtherModelNames);
                const boundingBox = await computeBoundingBox(main_model, mergedArray);
                const mergedArrayWidth = boundingBox.max.x - boundingBox.min.x

                const center = boundingBox.getCenter(new THREE.Vector3());
                const cameraOnLeft = camera.position.x < center.x;

                // model.position.y = +params.cameraPosition //+ boundingBox.max.x
                //+ boundingBox.max.x
                if (cameraOnLeft) {
                    model.position.x = boundingBox.max.x + modelWidth / 2
                }
                else {
                    model.position.x = boundingBox.min.x - modelWidth / 2
                }
                model.visible = true;
                main_model.add(model);
                // await setupMainModel(main_model)

                // Initially add the model to the scene
                main_model.add(model);

                // Merge the array and calculate the bounding box for all models including the newly added one
                const updatedBoundingBox = await computeBoundingBox(main_model, mergedArray);
                const updatedBoundingBoxWidth = updatedBoundingBox.max.x - updatedBoundingBox.min.x
                // console.log('main_model.position', main_model.position)
                // console.log('updatedBoundingBox', updatedBoundingBox)
                // console.log('updatedBoundingBoxWidth', updatedBoundingBoxWidth)

                // Get the center of the bounding box of all models
                const updatedCenter = updatedBoundingBox.getCenter(new THREE.Vector3());
                // console.log('updatedCenter', updatedCenter)

                // main_model.position.x = updatedBoundingBoxWidth / 2
                // main_model.position.x -= updatedCenter.x;
                // model.position.x += updatedCenter.x;


                // console.log('main_model.position', main_model.position)

                // main_model.position.add(mergedArrayCenter);  // Move to the center of the entire scene

                // main_model.visible = true;


                // Call to update the UI
                await updateRightControls(main_model, mergedArray);


            }
            await loaderShowHide(false)
            await showHideNodes(main_model, scene, camera)
        });
    });
}

if (addHanger) {
    addHanger.forEach(button => {
        button.addEventListener('click', async function () {
            const hangerType = this.getAttribute('data-hanger');

            let hangermodel, hanger
            await loaderShowHide(true)
            await otherModelSetup()

            // const loader = new GLTFLoader();
            if (golfClubNames.includes(hangerType)) {
                console.log("hello from shiv")
                if (!hanger_golf_club_model) {
                    // hanger_golf_club_model = await loadModel(colladaLoader, 'hanger_golf_club_model.dae');
                    hanger_golf_club_model = await loadGLTFModel(GLTFLoaderaLoader, "hanger_golf_club_model.glb");
                    // rack_glass_model = await loadGLTFModel(GLTFLoaderaLoader, 'rack_glass_model.glb');
                    await setupHangerGolfClubModel(main_model, hanger_golf_club_model);
                }
                hangermodel = hanger_golf_club_model;

            }
            else {
                if (!hanger_model) {
                    // hanger_model = await loadModel(colladaLoader, 'hanger_model.dae');
                    hanger_model = await loadGLTFModel(GLTFLoaderaLoader, "hanger_model.glb");
                    await setupHangerModel(main_model, hanger_model);
                }
                hangermodel = hanger_model;
            }

            let defaultModel = main_model.getObjectByName(params.defaultModel);
            if (hangermodel) {
                console.log('hangermodel', hangermodel)

                let hanger_object = hangermodel.getObjectByName(hangerType);
                if (hanger_object) {

                    hanger = hanger_object.clone();
                    if (hanger) {
                        let frame = defaultModel.getObjectByName('Frame');
                        let side = "Back"
                        if (camera.position.z > 0) {
                            side = "Front"
                        }

                        const hangerPrefix = params.defaultModel + '_' + side + '_';  // Prefix to match keys

                        let hangerArrayKey = hangerPrefix + hangerType;

                        let conditionFlag = await isHangerAdd(frame, hangermodel, hangerType, hangerArray, hangerPrefix);
                        // let conditionFlag = await isHangerAdd(hangerType, hangerArray, hangerArrayKey);

                        let leftSideSlotted = frame.getObjectByName('Left_Ex_Slotted');
                        if ((!leftSideSlotted || !leftSideSlotted.visible)) {
                            if (conditionFlag) {
                                hanger.position.y -= params.cameraPosition;
                                hanger.name = hangerType;
                                let removeHangerIcon = await getRemoveIcon(`removeHanger-${hangerType}`);

                                // Get the hanger's world position
                                const worldPosition = new THREE.Vector3();
                                hanger.getWorldPosition(worldPosition);

                                // Now compute the bounding box relative to the world coordinates
                                const hangerBoundingBox = new THREE.Box3().setFromObject(hanger);
                                const hangerCenter = new THREE.Vector3();
                                // const hangerSize = hangerBoundingBox.getSize(hangerCenter);
                                hangerBoundingBox.getCenter(hangerCenter);
                                const hangerLength = hangerBoundingBox.min.z - hangerBoundingBox.max.z
                                // console.log('hangerBoundingBox', hangerBoundingBox)

                                hanger.localToWorld(hangerBoundingBox.min);
                                hanger.localToWorld(hangerBoundingBox.max);

                                // Adjust position based on world coordinates
                                removeHangerIcon.position.set(
                                    hangerCenter.x, // Offset in world space
                                    hangerCenter.y,
                                    hangerLength
                                );

                                // Adjust the hanger position based on the camera's z-axis position
                                if (side == "Front") {
                                    hanger.rotation.y = Math.PI;
                                    if (golfClubNames.includes(hangerType) || hangerType == 'Hanger_Rail_Step') {
                                        hanger.position.z = frame.position.z - hangerBoundingBox.max.z - 40; // Small offset in front of the frame
                                    }
                                    else {
                                        hanger.position.z = frame.position.z - hangerBoundingBox.max.z / 2; // Small offset in front of the frame
                                    }
                                }


                                hanger.add(removeHangerIcon);
                                frame.attach(hanger);

                                // Update removeHanger to always face the camera
                                scene.onBeforeRender = function () {
                                    scene.traverse((obj) => {
                                        if (obj.name && obj.name.includes('remove')) {
                                            obj.lookAt(camera.position);
                                        }
                                    });
                                };

                                hanger.hangerArrayKey = hangerArrayKey;

                                if (!hangerArray[hangerArrayKey]) {
                                    hangerArray[hangerArrayKey] = 0;
                                }

                                hangerArray[hangerArrayKey] += 1

                                await showHideNodes(main_model, scene, camera)
                                // console.log('hangerCenter', hangerCenter);
                                // console.log('hangerBoundingBox', hangerBoundingBox);
                                // console.log('hanger', hanger);
                            }
                            else {
                                alert('There is not enough space to add this hanger.');
                            }
                        }
                        else {
                            // alert('The slotted side is visible; cannot add hanger.');
                        }
                    }
                }
            }
            await loaderShowHide(false)
        });
    });
}

if (addRack) {
    addRack.forEach(button => {
        button.addEventListener('click', async function () {
            await loaderShowHide(true)
            await otherModelSetup()

            const rackType = this.getAttribute('data-rack');
            let defaultModel = main_model.getObjectByName(params.defaultModel);
            let rack_model
            if (rackType == 'RackGlassShelf') {
                if (!rack_glass_model) {
                    rack_glass_model = await loadGLTFModel(GLTFLoaderaLoader, 'rack_glass_model.glb');
                    // rack_glass_model = await loadModel(colladaLoader, 'rack_glass_model.dae');
                    await setupGlassRackModel(main_model, rack_glass_model, texture_background);
                }
                rack_model = rack_glass_model

            }
            else if (rackType == 'RackWoodenShelf') {
                if (!rack_wooden_model) {
                    rack_wooden_model = await loadGLTFModel(GLTFLoaderaLoader, 'rack_wooden_model.glb');
                    // rack_wooden_model = await loadModel(colladaLoader, 'rack_wooden_model.dae');
                    await setupWoodenRackModel(main_model, rack_wooden_model);
                }
                rack_model = rack_wooden_model
            }

            // console.log('rack_glass_model', rack_glass_model)
            // console.log('rack_wooden_model', rack_wooden_model)

            if (rack_model) {
                let rack_clone = rack_model.clone();
                let frame = defaultModel.getObjectByName('Frame');
                let rack = rack_clone.getObjectByName(params.defaultModel);

                if (rack) {

                    rack.name = rackType

                    // frame.attach(rack);
                    // frame.attach(rack);

                    // Get the Left_Ex_Slotted node
                    let leftSideSlotted = frame.getObjectByName('Left_Ex_Slotted');

                    if (leftSideSlotted && leftSideSlotted.visible) {
                        // Compute bounding box of Left_Ex_Slotted
                        const boundingBox = new THREE.Box3().setFromObject(frame);

                        // Get the center and top of the bounding box
                        const min = boundingBox.min;
                        const max = boundingBox.max;
                        const center = boundingBox.getCenter(new THREE.Vector3());

                        // rack.scale.set(0.6, 0.6, 0.6);
                        // rack.position.set(0, 0, 0);

                        // Get the rack's world position
                        // const worldPosition = new THREE.Vector3();
                        // rack.getWorldPosition(worldPosition);

                        // Now compute the bounding box relative to the world coordinates
                        const rackBoundingBox = new THREE.Box3().setFromObject(rack);

                        // Position the rack:
                        // - Centered on X-axis
                        // - Slightly below the top of Left_Ex_Slotted on the Y-axis
                        // rack.position.set(
                        //     center.x, // X-axis center of Left_Ex_Slotted
                        //     max.y + params.cameraPosition - 9.5, // Slightly below the top of Left_Ex_Slotted (adjust offset as needed)
                        //     center.z // Center on Z-axis if needed
                        // );

                        // Attach rack to the frame

                        rack.position.y = rack.position.y + 4

                        if (camera.position.z > 0) {
                            // Camera is in front of the frame, add the rack in front
                            rack.position.z = -rackBoundingBox.min.z / 2 + 0.5; // Small offset in front of the frame
                            rack.rotation.y = Math.PI; // Rotate 180 degrees to face the camera
                        }
                        frame.attach(rack);


                        let removeRackIcon = await getRemoveIcon(`removeRack-${rackType}`);
                        rack.add(removeRackIcon);

                        removeRackIcon.position.set(
                            rackBoundingBox.max.x, // Offset in world space
                            rack.position.y / 2,
                            -rackBoundingBox.min.z / 2 + 1
                        );

                        // Update removeRack to always face the camera
                        scene.onBeforeRender = function () {
                            scene.traverse((obj) => {
                                if (obj.name && obj.name.includes('remove')) {
                                    obj.lookAt(camera.position);
                                }
                            });
                        };

                        await showHideNodes(main_model, scene, camera)
                        // Log for debugging
                        // console.log('Hanger:', rack);
                        // console.log('leftSideSlotted.position:', leftSideSlotted.position);
                        // console.log('BoundingBox min:', min);
                        // console.log('BoundingBox max:', max);
                        // console.log('frame.position:', frame.position);
                        // console.log('rack.position:', rack.position);
                        // console.log('rackBoundingBox:', rackBoundingBox);
                        // console.log('boundingBox:', boundingBox);
                    }
                }
            }
            await loaderShowHide(false)
        });
    });
}

if (captureButton) {
    captureButton.addEventListener("click", async function () {
        // Save the original size of the renderer
        const originalWidth = renderer.domElement.width;
        const originalHeight = renderer.domElement.height;

        // Set higher resolution (2x or 3x the original resolution)
        const scaleFactor = 3;  // You can adjust this factor
        renderer.setSize(originalWidth * scaleFactor, originalHeight * scaleFactor, false);
        camera.aspect = (originalWidth * scaleFactor) / (originalHeight * scaleFactor);
        camera.updateProjectionMatrix();

        // Render the scene at higher resolution
        renderer.render(scene, camera);

        // Get the canvas from the renderer
        const canvas = renderer.domElement;

        // Get the high-resolution image data from the canvas
        const imageData = canvas.toDataURL('image/png');

        // Create an image element to display the captured image
        const image = new Image();
        image.src = imageData;

        // Optionally, style the image for better display (fit to screen)
        image.style.maxWidth = "100%";
        image.style.height = "auto";
        document.body.appendChild(image);

        // Optionally, trigger a download
        const link = document.createElement('a');
        link.href = imageData;
        link.download = 'high-res-model-image.png';
        link.click();

        // Revert the renderer back to its original size
        renderer.setSize(originalWidth, originalHeight, false);
        camera.aspect = originalWidth / originalHeight;
        camera.updateProjectionMatrix();

        // Re-render the scene at the original size
        renderer.render(scene, camera);
    });
}

if (zoomInButton) {
    zoomInButton.addEventListener('click', function () {
        if (cropper) cropper.zoom(0.1); // Zoom in
    });
}

if (zoomOutButton) {
    zoomOutButton.addEventListener('click', function () {
        if (cropper) cropper.zoom(-0.1); // Zoom out
    });
}

if (moveLeftButton) {
    moveLeftButton.addEventListener('click', function () {
        if (cropper) cropper.move(-10, 0); // Move left
    });
}

if (moveRightButton) {
    moveRightButton.addEventListener('click', function () {
        if (cropper) cropper.move(10, 0); // Move right
    });
}

if (moveUpButton) {
    moveUpButton.addEventListener('click', function () {
        if (cropper) cropper.move(0, -10); // Move up
    });
}

if (moveDownButton) {
    moveDownButton.addEventListener('click', function () {
        if (cropper) cropper.move(0, 10); // Move down
    });
}

if (rotateLeftButton) {
    rotateLeftButton.addEventListener('click', function () {
        if (cropper) cropper.rotate(-15); // Rotate left by 15 degrees
    });
}

if (rotateRightButton) {
    rotateRightButton.addEventListener('click', function () {
        if (cropper) cropper.rotate(15); // Rotate right by 15 degrees
    });
}

if (scaleXButton) {
    scaleXButton.addEventListener('click', function () {
        if (cropper) {
            const currentData = cropper.getData();
            cropper.setData({
                ...currentData,
                scaleX: currentData.scaleX === 1 ? -1 : 1 // Toggle between 1 and -1
            });
        }
    });
}

if (scaleYButton) {
    scaleYButton.addEventListener('click', function () {
        if (cropper) {
            const currentData = cropper.getData();
            cropper.setData({
                ...currentData,
                scaleY: currentData.scaleY === 1 ? -1 : 1 // Toggle between 1 and -1
            });
        }
    });
}
if (resetButton) {
    resetButton.addEventListener('click', function () {
        if (cropper) {
            cropper.reset(); // Reset cropper settings to default
        }
    });
}


// Toggle dropdown visibility
document.querySelectorAll(".custom-dropdown").forEach(function (dropdown) {
    dropdown.querySelector(".dropdown-button").addEventListener("click", function () {
        const dropdownContent = dropdown.querySelector(".dropdown-content");
        dropdownContent.style.display = dropdownContent.style.display === "block" ? "none" : "block";
    });
});

// Add event listeners to dropdown items
document.querySelectorAll(".dropdown-item").forEach(function (item) {
    item.addEventListener("click", function () {
        const dropdownType = item.closest(".custom-dropdown").getAttribute("data-type");
        const value = item.getAttribute("data-value");
        updateMaterial(value, dropdownType);
        item.closest(".custom-dropdown").querySelector(".dropdown-content").style.display = "none"; // Hide dropdown
    });
});

// Close the dropdown if clicked outside
window.addEventListener("click", function (event) {
    if (!event.target.closest('.custom-dropdown')) {
        document.querySelectorAll(".dropdown-content").forEach(function (dropdownContent) {
            if (dropdownContent.style.display === "block") {
                dropdownContent.style.display = "none";
            }
        });
    }
});

// Initialize Bootstrap tooltips
document.addEventListener('DOMContentLoaded', function () {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    })
});
