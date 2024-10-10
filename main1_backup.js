import * as THREE from "three";
import Stats from 'three/addons/libs/stats.module.js';

import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { ColladaLoader } from "three/addons/loaders/ColladaLoader.js";
import {
    updateMeasurementGroups,
    headerOptionsShowHide,
    generateGlassMaterial,
    getCurrentModelSize,
    computeBoundingBox,
    isVisibleParents,
    setTextureParams,
    updateFrameSize,
    commonMaterial,
    checkMeshType,
    showHideNodes,
    getModelSize,
    getNodeSize,
    setupModel,
    getHex,
} from './utils.js';
import {
    heightMeasurementNames,
    baseFrameTextureNames,
    hangerStandBaseNodes,
    allFrameBorderNames,
    slottedHangerNodes,
    frameTop1Names,
    frameMainNames,
    baseFrameNames,
    allModelNames,
    hangerNodes,
    headerNames,
    params,
} from './config.js';


const container = document.getElementById('container');
const frameCount = document.getElementById("frameCount")
const baseColor = document.getElementById("baseColor")
const frameSize = document.getElementById("frameSize")
const addHanger = document.querySelectorAll('.addHanger');
const headerRodToggle = document.getElementById("headerRodToggle")
const topDropdown = document.getElementById("topDropdown")
const headerOptions = document.getElementById("headerOptions")
const headerSizeDropdown = document.getElementById("headerSizeDropdown")
const headerRodColorDropdown = document.getElementById("headerRodColorDropdown")
const topFrameFileUpload = document.getElementById('topFrameFileUpload');
const headerFrameColorInput = document.getElementById('headerFrameColorInput');
const headerFrameColorDropdown = document.getElementById("headerFrameColorDropdown")
const shelfTypeDropdown = document.getElementById("shelfTypeDropdown")
const slottedSidesToggle = document.getElementById('slottedSidesToggle');
const addSlottedHanger = document.querySelectorAll('.addSlottedHanger');
const mainFrameFileUpload = document.getElementById('mainFrameFileUpload');
const mainFrameColorInput = document.getElementById('mainFrameColorInput');
const baseSelectorDropdown = document.getElementById('baseSelector');
const measurementToggle = document.getElementById('measurementToggle');
const captureButton = document.getElementById('captureButton');

const cropperContainer = document.getElementById('cropper-container');
const cropperImage = document.getElementById('cropper-image');
const cropButton = document.getElementById('crop-button');
const closeButton = document.getElementById('close-button');


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

// Display loader progress
const loaderElement = document.getElementById('loader');
const progressBarFill = document.getElementById('progress-bar-fill');
const progressText = document.getElementById('progress-text');

// Set up the loading manager
const manager = new THREE.LoadingManager();

// Initialize the loaders with the manager
const rgbeLoader = new RGBELoader(manager).setPath("./assets/images/background/");
const TextureLoaderJpg = new THREE.TextureLoader(manager).setPath("./assets/images/background/");
const borderTextureLoaderJpg = new THREE.TextureLoader(manager).setPath("./assets/images/borders/");
const colladaLoader = new ColladaLoader(manager).setPath("./assets/models/");
const textureLoader = new THREE.TextureLoader(manager);
const fontLoader = new FontLoader().setPath('./three/examples/fonts/');

const assetPaths = [
    { path: "main_model.dae", loader: colladaLoader, variableName: "main_model_collada" },
    { path: "header_rod_model.dae", loader: colladaLoader, variableName: "header_rod_model_collada" },
    { path: "header_wooden_shelf_model.dae", loader: colladaLoader, variableName: "header_wooden_shelf_model_collada" },
    { path: "header_500_height_model.dae", loader: colladaLoader, variableName: "header_500_height_model_collada" },
    { path: "header_glass_shelf_fixing_model.dae", loader: colladaLoader, variableName: "header_glass_shelf_fixing_model_collada" },
    { path: "header_glass_shelf_model.dae", loader: colladaLoader, variableName: "header_glass_shelf_model_collada" },
    { path: "slotted_sides_model.dae", loader: colladaLoader, variableName: "slotted_sides_model_collada" },
    { path: "hanger_model.dae", loader: colladaLoader, variableName: "hanger_model_collada" },
    { path: "Light_Wood.jpg", loader: borderTextureLoaderJpg, variableName: "texture_border" },
    { path: "venice_sunset_1k.hdr", loader: rgbeLoader, variableName: "texture_background" },
    { path: "helvetiker_regular.typeface.json", loader: fontLoader, variableName: "font" },
];

let gui, stats;
let renderer, scene, camera, controls, transformControls, raycaster, mouse, modelGroup, hangerIntersects, selectedNode, removeIconMesh;
let cropper, topFramCropedImage, mainFramCropedImage,
    // texture_border, texture_background,
    main_model, //main_model_collada,
    header_rod_model, //header_rod_model_collada,
    header_wooden_shelf_model, //header_wooden_shelf_model_collada,
    header_500_height_model, //header_500_height_model_collada,
    header_glass_shelf_fixing_model, //header_glass_shelf_fixing_model_collada,
    header_glass_shelf_model, //header_glass_shelf_model_collada, 
    slotted_sides_model, //slotted_sides_model_collada, 
    hanger_model, //hanger_model_collada, 
    border_texture_material;
const lights = [];
const lightHelpers = [];
const shadow = commonMaterial(0x444444)


let totalAssets = 4; // Number of primary assets to load
let assetsLoaded = 0; // Counter for loaded assets

// Function to update the progress bar
manager.onProgress = (url, itemsLoaded, itemsTotal) => {
    const isTrackedAsset = assetPaths.some(asset => url.includes(asset.path));

    if (isTrackedAsset) {
        assetsLoaded++;
        let progress = (assetsLoaded / totalAssets) * 100;
        if (progress >= 100) progress = 99;

        if (itemsLoaded === itemsTotal) {
            progress = 100;
            loaderElement.style.display = 'none'; // Hide loader when all assets are loaded
        }
        requestAnimationFrame(() => {
            progressBarFill.style.width = `${progress}%`;
            progressText.innerText = `Loading... ${Math.round(progress)}%`;
        });
    }
};

// Hide the loader once all items are loaded
manager.onLoad = () => {
    loaderElement.style.display = 'none';
    console.log('All assets loaded');
};

// Error handling
manager.onError = (url) => {
    console.error(`There was an error loading ${url}`);
    progressText.innerText = 'Failed to load some resources. Please try again.';
};

window.addEventListener('load', async () => {
    try {
        loaderElement.style.display = 'flex';  // Show the loader
        assetsLoaded = 0; // Initialize assets loaded counter

        // Load assets using the loading manager
        const loadedAssets = await Promise.all(
            // assetPaths.map(({ path, loader }) => loader.loadAsync(path))
            assetPaths.map(assetInfo => assetInfo.loader.loadAsync(assetInfo.path))

        );

        // Assign loaded assets to variables dynamically based on variableName
        loadedAssets.forEach((asset, index) => {
            const { variableName } = assetPaths[index];
            window[variableName] = asset; // Directly assign other assets
        });


        texture_border = setTextureParams(texture_border);

        border_texture_material = new THREE.MeshPhongMaterial({
            specular: 3355443,
            map: texture_border,
            shininess: 0.5,
        });

        // Initialize the scene with the loaded resources
        init().catch(function (err) {
            console.error(err);
        });

    } catch (error) {
        console.error('Error loading assets:', error);
        progressText.innerText = 'Failed to load resources. Please try again.';
    }
});

async function init() {

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

    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight
    );
    // camera.position.set(1.8, 0.6, 2.7);

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    controls = new OrbitControls(camera, renderer.domElement);
    controls.maxPolarAngle = Math.PI / 2; // Adjust the value as needed
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;


    // camera.position.x = 100;
    // camera.position.y = 100;
    // camera.position.z = 120;



    {// Calculate the bounding box, size, and center of the model
        main_model = main_model_collada.scene;
        const box = new THREE.Box3().setFromObject(main_model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // Set the camera's position to fit the model in view
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);

        let cameraZ = Math.abs(maxDim / (2 * Math.tan(fov / 2))) * params.cameraPosition; // Adjust multiplier as needed
        camera.position.set(center.x + 200, center.y + 50, cameraZ - 80); // Center vertically
        camera.lookAt(center);

        // Set the controls target to the center of the model
        controls.target.set(center.x, center.y, center.z);

        // Adjust the max distance to prevent zooming too far out
        controls.maxDistance = cameraZ * 3;
        controls.update();

    }


    modelGroup = new THREE.Group();
    scene.add(modelGroup);

    main_model.scale.set(1, 1, 1);
    main_model.position.set(0, -params.cameraPosition, 0);
    main_model.castShadow = true;

    hanger_model = hanger_model_collada.scene;
    hanger_model.scale.set(1, 1, 1);
    hanger_model.position.set(0, -params.cameraPosition, 0);
    hanger_model.castShadow = true;
    // hanger_model.visible = false;
    // scene.add(hanger_model);

    slotted_sides_model = slotted_sides_model_collada.scene;
    slotted_sides_model.scale.set(1, 1, 1);
    slotted_sides_model.position.set(0, -params.cameraPosition, 0);
    slotted_sides_model.castShadow = true;
    // slotted_sides_model.visible = false;
    // scene.add(slotted_sides_model);

    header_500_height_model = header_500_height_model_collada.scene;
    header_500_height_model.scale.set(1, 1, 1);
    header_500_height_model.position.set(0, -params.cameraPosition, 0);
    header_500_height_model.castShadow = true;
    // header_500_height_model.visible = false;
    // scene.add(header_500_height_model);

    header_wooden_shelf_model = header_wooden_shelf_model_collada.scene;
    header_wooden_shelf_model.scale.set(1, 1, 1);
    header_wooden_shelf_model.position.set(0, -params.cameraPosition, 0);
    header_wooden_shelf_model.castShadow = true;
    // header_wooden_shelf_model.visible = false;
    // scene.add(header_wooden_shelf_model);

    header_rod_model = header_rod_model_collada.scene;
    header_rod_model.scale.set(1, 1, 1);
    header_rod_model.position.set(0, -params.cameraPosition, 0);
    header_rod_model.castShadow = true;
    // header_rod_model.visible = false;
    // scene.add(header_rod_model);
    params.rodSize = getNodeSize(header_rod_model)

    header_glass_shelf_fixing_model = header_glass_shelf_fixing_model_collada.scene;
    header_glass_shelf_fixing_model.scale.set(1, 1, 1);
    header_glass_shelf_fixing_model.position.set(0, -params.cameraPosition, 0);
    header_glass_shelf_fixing_model.castShadow = true;
    // header_glass_shelf_fixing_model.visible = false;
    // scene.add(header_glass_shelf_fixing_model);

    header_glass_shelf_model = header_glass_shelf_model_collada.scene;
    header_glass_shelf_model.scale.set(1, 1, 1);
    header_glass_shelf_model.position.set(0, -params.cameraPosition, 0);
    header_glass_shelf_model.castShadow = true;
    // header_glass_shelf_model.visible = false;
    // scene.add(header_glass_shelf_model);

    setupModel(main_model, header_500_height_model, header_wooden_shelf_model, header_rod_model, header_glass_shelf_fixing_model, header_glass_shelf_model, slotted_sides_model, hanger_model)
    lightSetup()
    loadObjectWithNoOfClones(1)
    updateMaterial('color', params.allBorderColor, '', '', 'frame');
    updateMaterial('color', params.defaultShelfColor, '', '', 'shelf');

    showHideNodes(modelGroup, scene, camera)

    // Find and store references to Header_Glass_Shelf and Shelf
    // const Header_Glass_Shelf = modelGroup.getObjectByName('Header_Glass_Shelf');
    // const Shelf = modelGroup.getObjectByName('Header_Wooden_Shelf');

    // Transform controls
    transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.addEventListener('dragging-changed', (event) => {
        controls.enabled = !event.value;
    });
    scene.add(transformControls);


    // // Set an initial object to move (e.g., Header_Glass_Shelf)
    // selectedObject = Header_Glass_Shelf;
    // // transformControls.mode = 'translate'; // Can be 'rotate', 'scale', or 'translate'
    // transformControls.attach(selectedObject);

    // // Example of toggling between objects using a simple keyboard event
    // document.addEventListener('keydown', (event) => {
    //     if (event.key === '1') {
    //         selectedObject = Header_Glass_Shelf;
    //     } else if (event.key === '2') {
    //         selectedObject = Shelf;
    //     }
    //     // transformControls.mode = 'translate'; // Can be 'rotate', 'scale', or 'translate'
    //     transformControls.attach(selectedObject);
    // });

    controls.addEventListener("change", render); // use if there is no animation loop
    window.addEventListener("resize", onWindowResize);



    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Add event listeners
    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('click', onMouseClick, false);

}


// Handle mouse move for hover
function onMouseMove(event) {
    // Calculate mouse position in normalized device coordinates (-1 to +1 for both axes)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);
    const visibleObjects = [];
    modelGroup.traverse((child) => {
        if (hangerNodes.includes(child.name) && child.visible && isVisibleParents(child.parent)) {
            visibleObjects.push(child);
        }
        // if (slottedHangerNodes.includes(child.name) && child.visible && isVisibleParents(child.parent)) {
        //     visibleObjects.push(child);
        // }
    });

    // Find intersections with the modelGroup
    hangerIntersects = raycaster.intersectObjects(visibleObjects, true);
    // console.log('hangerIntersects', hangerIntersects);

}

// Handle mouse click for selection
function onMouseClick(event) {
    console.log('hangerIntersects', hangerIntersects);

    if (hangerIntersects.length > 0) {
        const intersectNode = hangerIntersects[0].object;
        if (intersectNode) {
            let iconName = intersectNode.name;
            if (iconName.startsWith('removeHanger-')) {
                let nodeName = iconName.replace('removeHanger-', '');
                let defaultModel = modelGroup.getObjectByName(params.defaultModel);
                let hangerToRemove = defaultModel.getObjectByName(nodeName);

                if (hangerToRemove) {
                    let frame = defaultModel.getObjectByName('Frame');
                    transformControls.detach();
                    frame.remove(hangerToRemove);
                }
            }
            else {

                selectedNode = intersectNode.parent//.children[0];  // Select the node (parent if needed)
                if (hangerNodes.includes(selectedNode.name)) {
                    transformControls.removeEventListener('objectChange', enforceHangerBounds);

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

                console.log('intersectNode', intersectNode)
                console.log('selectedNode', selectedNode)

                // if (slottedHangerNodes.includes(selectedNode.name)) {
                //     transformControls.removeEventListener('objectChange', enforceSlottedHangerBounds);

                //     // Attach transform controls to the selected node
                //     transformControls.attach(selectedNode);
                //     transformControls.setMode('translate');  // Set the mode to 'translate' for moving

                //     // Configure to show only X-axis control and allow movement only on X-axis
                //     transformControls.showX = false;  // Show only X-axis arrow
                //     transformControls.showY = true; // Hide Y-axis arrow
                //     transformControls.showZ = false; // Hide Z-axis arrow

                //     // Add event listener to enforce boundary check during movement
                //     transformControls.addEventListener('objectChange', enforceSlottedHangerBounds);
                // }
            }
        }
    }
    else {
        transformControls.detach();
        selectedNode = null;
    }
}

// Function to enforce boundaries on X-axis
function enforceHangerBounds() {
    if (selectedNode) {
        let defaultModel = modelGroup.getObjectByName(params.defaultModel);
        let topFrame = defaultModel.getObjectByName('Top_Ex');

        const boundingBox = computeBoundingBox(defaultModel, hangerStandBaseNodes);
        const min = boundingBox.min.clone();
        const max = boundingBox.max.clone();

        let minX = min.x + topFrame.position.x;
        let maxX = max.x + topFrame.position.x;
        let selectedChildNode = selectedNode.getObjectByName('Hanger_Stand');

        const nodeBoundingBox = new THREE.Box3().setFromObject(selectedChildNode);
        const nodeWidth = nodeBoundingBox.max.x - nodeBoundingBox.min.x;

        const margin = 2;

        const adjustedMinX = minX + nodeWidth / 2 + margin;
        const adjustedMaxX = maxX - nodeWidth / 2 - margin;

        const position = selectedNode.position;
        // console.log('position', position)
        // console.log('minX', minX)
        // console.log('maxX', maxX)

        // If the node is trying to move past the minX or maxX boundary, set its position to the boundary
        if (position.x < adjustedMinX) {
            position.x = adjustedMinX;
        } else if (position.x > adjustedMaxX) {
            position.x = adjustedMaxX;
        }
    }
}

// Function to enforce boundaries on X-axis
function enforceSlottedHangerBounds() {
    if (selectedNode) {
        let defaultModel = modelGroup.getObjectByName(params.defaultModel);
        let baseFrame = defaultModel.getObjectByName('Left_Ex_Slotted');

        const boundingBox = computeBoundingBox(defaultModel, ['Left_Ex_Slotted']);
        const min = boundingBox.min.clone();
        const max = boundingBox.max.clone();

        let minY = min.y + baseFrame.position.y;
        let maxY = max.y + baseFrame.position.y;
        let selectedChildNode = selectedNode.getObjectByName('Hanger_Stand');

        const nodeBoundingBox = new THREE.Box3().setFromObject(selectedChildNode);
        const nodeWidth = nodeBoundingBox.max.y - nodeBoundingBox.min.y;

        const margin = 2;

        const adjustedMinY = minY + nodeWidth / 2 + margin;
        const adjustedMaxY = maxY - nodeWidth / 2 - margin;

        const position = selectedNode.position;
        // console.log('position', position)
        // console.log('minY', minY)
        // console.log('maxY', maxY)

        // If the node is trying to move past the minY or maxY boundary, set its position to the boundary
        if (position.y < adjustedMinY) {
            position.y = adjustedMinY;
        } else if (position.y > adjustedMaxY) {
            position.y = adjustedMaxY;
        }
    }
}

function lightSetup() {
    let radius = 90;
    let lightIntensity1 = 1;
    let lightIntensity2 = 2.3;

    if (params.defaultModel) {
        const model_size = parseInt(getModelSize(params.defaultModel))
        if (model_size >= 2000) {
            radius = 170;
        }
    }

    const customDropdownButton = document.querySelector(`.custom-dropdown[data-type="frame"]`);
    const selectedItem = customDropdownButton.querySelector('.dropdown-item.selected');
    if (selectedItem) {
        const dataType = selectedItem.getAttribute('data-type');
        const dataColor = selectedItem.getAttribute('data-color');
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

function loadObjectWithNoOfClones(count) {
    if (!main_model) {
        console.error('Failed to load the scene.');
        return;
    }

    modelGroup.clear(); // Clear previous objects

    for (let i = 0; i < count; i++) {
        const newModel = main_model.clone();
        newModel.position.x = i * 18.05 - ((count - 1) * 9.025);
        modelGroup.add(newModel);
    }

}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    render();
}

function render() {
    updateMeasurementGroups(modelGroup, scene, camera);
    // if (transformControls) {
    //     transformControls.update();
    // }

    renderer.render(scene, camera);
}


function setMainFrameCropedImage() {
    if (mainFramCropedImage[params.defaultModel]) {
        const mainFrameBackgroundColor = getHex(params.mainFrameBackgroundColor);
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = mainFramCropedImage[params.defaultModel].width;
        tempCanvas.height = mainFramCropedImage[params.defaultModel].height;
        const ctx = tempCanvas.getContext('2d');

        // Draw the background color
        ctx.fillStyle = mainFrameBackgroundColor;
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

        // Draw the cropped image on top
        ctx.drawImage(mainFramCropedImage[params.defaultModel], 0, 0);

        tempCanvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const texture = new THREE.TextureLoader().load(url, function () {
                updateMainFrameImageTexture(texture);
            });
            closeCropper();
        });
    }
}

function setTopFrameCropedImage() {
    if (topFramCropedImage[params.defaultModel][params.defaultHeaderSize]) {
        const topFrameBackgroundColor = getHex(params.topFrameBackgroundColor);
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = topFramCropedImage[params.defaultModel][params.defaultHeaderSize].width;
        tempCanvas.height = topFramCropedImage[params.defaultModel][params.defaultHeaderSize].height;
        const ctx = tempCanvas.getContext('2d');

        // Draw the background color
        ctx.fillStyle = topFrameBackgroundColor;
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

        // Draw the cropped image on top
        ctx.drawImage(topFramCropedImage[params.defaultModel][params.defaultHeaderSize], 0, 0);

        tempCanvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const texture = new THREE.TextureLoader().load(url, function () {
                updateTopFrameImageTexture(texture);
            });
            closeCropper();
        });
    }
}


function updateMainFrameImageTexture1(texture) {
    const currentModel = scene.getObjectByName(params.defaultModel);
    currentModel.traverse(function (main_model) {
        main_model.traverse(function (child) {
            console.log('main child', child.name)
            updateTexture(child, texture, frameMainNames)
        });
        renderer.render(scene, camera);
    })
}

function updateTopFrameImageTexture1(texture) {
    const currentModel = scene.getObjectByName(params.defaultModel);
    currentModel.traverse(function (main_model) {
        main_model.traverse(function (child) {
            console.log('top child', child.name)
            updateTexture(child, texture, frameTop1Names)
        });
        renderer.render(scene, camera);
    });
}

function updateMainFrameImageTexture(texture) {
    const currentModel = scene.getObjectByName(params.defaultModel);
    currentModel.traverse(function (modelNode) {
        const frame = modelNode.getObjectByName('Frame');
        if (frame) {
            frame.traverse(function (child) {
                updateUploadedTexture(child, texture, frameMainNames)
            });
        }

    });
}

function updateTopFrameImageTexture(texture) {
    const currentModel = scene.getObjectByName(params.defaultModel);
    currentModel.traverse(function (modelNode) {
        const header = modelNode.getObjectByName(params.defaultHeaderSize);
        if (header) {
            header.traverse(function (child) {
                updateUploadedTexture(child, texture, frameTop1Names)
            });
        }

    });
}

function updateUploadedTexture(mesh, texture, frameNames) {
    texture = setTextureParams(texture);

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

function updateTexture(mesh, texture, frameNames) {
    texture = setTextureParams(texture);

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
function updateMaterial(type, value, imageUrl, displayText, dropdownType) {
    const customDropdownButton = document.querySelector(`.custom-dropdown[data-type=${dropdownType}]`);

    // Reset selected class
    // document.querySelectorAll(".dropdown-item").forEach(function (el) {
    customDropdownButton.querySelectorAll(`.dropdown-item`).forEach(function (el) {
        el.classList.remove("selected");
    });

    // Find the matching element and add the selected class
    customDropdownButton.querySelectorAll(`.dropdown-item`).forEach(function (element) {
        if ((type === "texture" && element.getAttribute("data-texture") === value) ||
            (type === "color" && element.getAttribute("data-color") === value)) {

            if (!displayText) {
                displayText = element.querySelector("span").innerText;
            }

            element.classList.add("selected");
        }
    });


    // Update Three.js material
    modelGroup.traverse(function (main_model) {
        main_model.traverse(function (child) {
            if (child.isMesh && allFrameBorderNames.includes(child.name) && dropdownType === 'frame') {
                // console.log('Frame', dropdownType, child.name)
                if (type === "texture") {
                    // Load texture
                    let texture_border = new THREE.TextureLoader().load("./assets/images/borders/" + value);
                    texture_border = setTextureParams(texture_border);

                    border_texture_material.map = texture_border;
                    child.material = [border_texture_material, shadow, shadow];
                    child.material.needsUpdate = true;
                } else if (type === "color") {
                    // Apply color
                    const material = commonMaterial(parseInt(value, 16))
                    child.material = [material, shadow, shadow];
                    child.material.needsUpdate = true;
                }
            }
            if (child.isMesh && child.name == 'Header_Wooden_Shelf' && dropdownType === 'shelf') {
                // console.log('Header_Wooden_Shelf', dropdownType, child.name)
                if (type === "texture") {
                    // Load texture
                    let texture_border = new THREE.TextureLoader().load("./assets/images/borders/" + value);
                    texture_border = setTextureParams(texture_border);

                    border_texture_material.map = texture_border;
                    child.material = [border_texture_material, shadow];
                    child.material.needsUpdate = true;
                } else if (type === "color") {
                    // Apply color
                    const material = commonMaterial(parseInt(value, 16))
                    child.material = [material, shadow];
                    child.material.needsUpdate = true;
                }
            }
        });
    });


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
        lightSetup()
    }
    // console.log(main_model)
}

function closeCropper() {
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
    frameSize.addEventListener("change", function (event) {
        params.defaultModel = event.target.value;
        updateFrameSize(modelGroup, scene, camera)
        lightSetup();
    });
}

// Event listeners for controls
if (headerSizeDropdown) {
    headerSizeDropdown.value = params.defaultHeaderSize;
    headerSizeDropdown.addEventListener("change", function (event) {
        params.defaultHeaderSize = event.target.value;
        showHideNodes(modelGroup, scene, camera);
    });
}

if (frameCount) {
    frameCount.addEventListener("change", function (event) {
        const frame_no = event.target.value;

        if (main_model) {
            loadObjectWithNoOfClones(frame_no)
        }
    });
}

if (baseColor) {
    baseColor.value = params.baseFrameColor;

    baseColor.addEventListener("change", function (event) {
        params.baseFrameColor = event.target.value;
        showHideNodes(modelGroup, scene, camera)
    });
}

if (headerOptions) {
    headerOptions.value = params.headerOptions;
    headerOptionsShowHide()
    headerOptions.addEventListener("change", function (event) {
        params.headerOptions = event.target.value
        headerOptionsShowHide()
    });
}

if (baseSelectorDropdown) {
    baseSelectorDropdown.value = params.selectedBaseFrame;

    baseSelectorDropdown.addEventListener('change', function (event) {
        params.selectedBaseFrame = event.target.value
        showHideNodes(modelGroup, scene, camera);
    });
}

if (topDropdown) {
    topDropdown.value = params.topOption;

    topDropdown.addEventListener("change", function (event) {
        params.topOption = event.target.value

        params.headerRodToggle = false;
        if (params.topOption == 'Header_Wooden_Shelf') {
            params.headerRodToggle = true;
        }

        headerRodToggle.checked = params.headerRodToggle;

        showHideNodes(modelGroup, scene, camera);

    });
}

if (headerRodToggle) {
    headerRodToggle.checked = params.headerRodToggle;
    headerRodToggle.addEventListener("change", function (event) {
        params.headerRodToggle = event.target.checked;
        showHideNodes(modelGroup, scene, camera)
    });
}

if (shelfTypeDropdown) {
    shelfTypeDropdown.value = params.defaultShelfType;
    shelfTypeDropdown.addEventListener("change", function (event) {
        params.defaultShelfType = event.target.value;
        showHideNodes(modelGroup, scene, camera)
    });
}

if (slottedSidesToggle) {
    slottedSidesToggle.checked = params.slottedSidesToggle;

    slottedSidesToggle.addEventListener("change", function (event) {
        params.slottedSidesToggle = event.target.checked;
        showHideNodes(modelGroup, scene, camera)
    });
}

if (measurementToggle) {
    measurementToggle.checked = params.measurementToggle;

    measurementToggle.addEventListener("change", function (event) {
        params.measurementToggle = event.target.checked;
        showHideNodes(modelGroup, scene, camera)
    });
}

if (topFrameFileUpload) {
    topFrameFileUpload.addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (!file) return;
        params.fileUploadFlag = 'TopFrame';

        const reader = new FileReader();
        reader.onload = function (e) {
            cropperImage.src = e.target.result;
            cropperContainer.style.display = 'block';

            if (cropper) {
                cropper.destroy();
            }

            let currentModel = scene.getObjectByName(params.defaultModel);
            let currentHeader = currentModel.getObjectByName(params.defaultHeaderSize);
            const size = getCurrentModelSize(currentHeader, 'Header_Graphic.1');

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
    mainFrameFileUpload.addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (!file) return;

        params.fileUploadFlag = 'MainFrame';

        const reader = new FileReader();
        reader.onload = function (e) {
            cropperImage.src = e.target.result;
            cropperContainer.style.display = 'block';

            if (cropper) {
                cropper.destroy();
            }

            let currentModel = scene.getObjectByName(params.defaultModel);
            const size = getCurrentModelSize(currentModel, 'Cube.1');
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
    headerFrameColorInput.value = getHex(params.topFrameBackgroundColor);

    headerFrameColorInput.addEventListener("input", function (event) {
        params.topFrameBackgroundColor = event.target.value;
        setTopFrameCropedImage()
    });
}

if (headerRodColorDropdown) {
    headerRodColorDropdown.value = params.rodFrameColor;

    headerRodColorDropdown.addEventListener("change", function (event) {
        params.rodFrameColor = event.target.value;
        showHideNodes(modelGroup, scene, camera)
    });
}

if (headerFrameColorDropdown) {
    headerFrameColorDropdown.value = params.topFrameBackgroundColor;

    headerFrameColorDropdown.addEventListener("change", function (event) {
        params.topFrameBackgroundColor = event.target.value;
        setTopFrameCropedImage()
    });
}

if (mainFrameColorInput) {
    mainFrameColorInput.value = getHex(params.mainFrameBackgroundColor);

    mainFrameColorInput.addEventListener("input", function (event) {
        params.mainFrameBackgroundColor = event.target.value;
        setMainFrameCropedImage()
    });
}

if (cropButton) {
    cropButton.addEventListener("click", function (event) {
        if (cropper) {
            if (params.fileUploadFlag == 'MainFrame') {
                mainFramCropedImage = mainFramCropedImage || {};
                mainFramCropedImage[params.defaultModel] = cropper.getCroppedCanvas();
                setMainFrameCropedImage();
            } else if (params.fileUploadFlag == 'TopFrame') {
                topFramCropedImage = topFramCropedImage || {};
                topFramCropedImage[params.defaultModel] = topFramCropedImage[params.defaultModel] || {};
                topFramCropedImage[params.defaultModel][params.defaultHeaderSize] = cropper.getCroppedCanvas();
                setTopFrameCropedImage()
            }
        }
    });
}

if (closeButton) {
    closeButton.addEventListener("click", closeCropper);
}

if (addHanger) {
    addHanger.forEach(button => {
        button.addEventListener('click', function () {
            const hangerType = this.getAttribute('data-hanger');
            let defaultModel = modelGroup.getObjectByName(params.defaultModel);
            if (hanger_model) {
                let new_hanger = hanger_model.clone();
                let frame = defaultModel.getObjectByName('Frame');
                let hanger = new_hanger.getObjectByName(hangerType);
                if (hanger) {

                    const boundingBox = computeBoundingBox(defaultModel, hangerStandBaseNodes);
                    const min = boundingBox.min.clone();
                    const max = boundingBox.max.clone();

                    hanger.name = hangerType;

                    // Create the remove icon
                    const removeIconGeometry = new THREE.BoxGeometry(2, 2, 2);
                    const removeIconMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                    removeIconMesh = new THREE.Mesh(removeIconGeometry, removeIconMaterial);
                    removeIconMesh.scale.set(1, 1, 1);


                    removeIconMesh.name = `removeHanger-${hangerType}`;
                    removeIconMesh.visible = true;

                    // Add the remove icon as a child of the hanger
                    hanger.add(removeIconMesh);

                    // Attach hanger to the frame
                    frame.attach(hanger);

                    // Get the hanger's world position
                    const worldPosition = new THREE.Vector3();
                    hanger.getWorldPosition(worldPosition);

                    // Now compute the bounding box relative to the world coordinates
                    const hangerBoundingBox = new THREE.Box3().setFromObject(hanger);
                    const hangerCenter = new THREE.Vector3();
                    hangerBoundingBox.getCenter(hangerCenter);

                    // Adjust position based on world coordinates
                    removeIconMesh.position.set(
                        hangerCenter.x, // Offset in world space
                        hangerCenter.y,
                        hangerCenter.z * 2
                    );


                    // Log the positions and other details for debugging
                    // console.log('hangerBoundingBox', hangerBoundingBox);
                    // console.log('hangerCenter', hangerCenter);
                    // console.log('new_hanger', new_hanger);
                    // console.log('removeIconMesh', removeIconMesh);
                    // console.log('max', max);
                }
            }
        });
    });
}

if (addSlottedHanger) {
    addSlottedHanger.forEach(button => {
        button.addEventListener('click', function () {
            const hangerType = this.getAttribute('data-slotted-hanger');
            let defaultModel = modelGroup.getObjectByName(params.defaultModel);

            if (hanger_model) {
                let new_hanger = hanger_model.clone();
                let frame = defaultModel.getObjectByName('Frame');
                let hanger = new_hanger.getObjectByName(hangerType);

                if (hanger) {
                    // Remove clothing node
                    let clothing = hanger.getObjectByName('Clothing');
                    if (clothing) {
                        hanger.remove(clothing);
                    }

                    hanger.name = 'SlottedHanger'

                    // Get the Left_Ex_Slotted node
                    let leftSideSlotted = frame.getObjectByName('Left_Ex_Slotted');

                    if (leftSideSlotted) {
                        // Compute bounding box of Left_Ex_Slotted
                        const boundingBox = new THREE.Box3().setFromObject(leftSideSlotted);

                        // Get the center and top of the bounding box
                        const min = boundingBox.min;
                        const max = boundingBox.max;
                        const center = boundingBox.getCenter(new THREE.Vector3());

                        hanger.scale.set(0.6, 0.6, 0.6);
                        hanger.position.set(0, 0, 0);

                        // Position the hanger:
                        // - Centered on X-axis
                        // - Slightly below the top of Left_Ex_Slotted on the Y-axis
                        hanger.position.set(
                            center.x, // X-axis center of Left_Ex_Slotted
                            max.y + params.cameraPosition - 9.5, // Slightly below the top of Left_Ex_Slotted (adjust offset as needed)
                            center.z // Center on Z-axis if needed
                        );

                        // Attach hanger to the frame
                        frame.attach(hanger);

                        // Log for debugging
                        console.log('Hanger:', hanger);
                        console.log('leftSideSlotted.position:', leftSideSlotted.position);
                        console.log('BoundingBox min:', min);
                        console.log('BoundingBox max:', max);
                        console.log('Center:', center);
                    }
                }
            }
        });
    });
}

if (captureButton) {
    captureButton.addEventListener("click", function () {
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
        const type = item.getAttribute("data-type");
        const value = type === "texture" ? item.getAttribute("data-texture") : item.getAttribute("data-color");
        const imageUrl = type === "texture" ? item.querySelector("img").src : "";
        const displayText = item.querySelector("span").innerText;

        updateMaterial(type, value, imageUrl, displayText, dropdownType);
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
