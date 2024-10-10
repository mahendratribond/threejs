import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ColladaLoader } from 'three/addons/loaders/ColladaLoader.js';

const container = document.getElementById('container');
const topFrameFileUpload = document.getElementById('topFrameFileUpload');
const cropperContainer = document.getElementById('cropper-container');
const cropperImage = document.getElementById('cropper-image');
const cropButton = document.getElementById('crop-button');
const closeIcon = document.querySelector('.close-icon');
const innerDropdown = document.getElementById('innerTextureDropdown');
const borderDropdown = document.getElementById('borderTextureDropdown');
const borderColorDropdown = document.getElementById('borderColorDropdown');
const baseSelectorDropdown = document.getElementById('baseSelector');
const topSelectorDropdown = document.getElementById('topSelector');
const frameColorDropdown = document.getElementById('frameColorDropdown');
const mainFrameFileUpload = document.getElementById('mainFrameFileUpload');

let renderer, canvas, scene, camera, stats, controls, groupFrame, cropper, ambientLight, spotLight1, spotLight2;
let currentBorderColor, currentTopFrame, currentBaseFrame, currentBaseFrameColor, topFramCropedImage, mainFramCropedImage;
let directionalLights = [];
const frames = {};
var footerFlag = 'color';
var fileUploadFlag = '';
const loader = new ColladaLoader();

let params = {
    scale: 0.4,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    moveX: 0,
    moveY: 0,
    moveZ: 0,
    topFrameBackgroundColor: '#ffffff',
    mainFrameBackgroundColor: '#ffffff',
    clear: clear
};

init();

function init() {

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xf1f1f1); // पृष्ठभूमि को सफेद सेट करना

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // renderer.gammaOutput = true;
    // renderer.gammaFactor = 2.2;
    // renderer.toneMapping = THREE.ACESFilmicToneMapping
    // renderer.toneMappingExposure = 1.5

    renderer.setAnimationLoop(animate);

    canvas = renderer.domElement;
    container.appendChild(canvas);

    stats = new Stats();
    container.appendChild(stats.dom);

    scene = new THREE.Scene();
    scene.backgroundIntensity = 5
    // scene.background = new THREE.Color(0x000000); // 0xffffff is the hex code for white
    groupFrame = new THREE.Group();


    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 2, 1000);
    camera.position.set(70, 50, 90);

    controls = new OrbitControls(camera, canvas);
    // controls.enableDamping = true; // Optional: enable damping for smoother control
    // controls.dampingFactor = 0.05;
    controls.update();
    // Add an event listener to track changes in rotation
    // controls.addEventListener('change', () => {
    //     console.log(`Camera Rotation - X: ${camera.rotation.x}, Y: ${camera.rotation.y}, Z: ${camera.rotation.z}`);
    //     console.log(`Camera Position - X: ${camera.position.x}, Y: ${camera.position.y}, Z: ${camera.position.z}`);
    // });


    // Load Collada file
    loadModels()


    // Load the texture
    const groundGeometry = new THREE.PlaneGeometry(10000, 10000); // Use PlaneGeometry for a flat ground

    // Load the texture
    const textureLoader = new THREE.TextureLoader();
    const grassTexture = textureLoader.load('assets/images/background/grass-image.jpg', function (texture) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(100, 100);
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy(); // Enable anisotropic filtering
        texture.needsUpdate = true;
    });

    // Create a material with the loaded texture
    const groundMaterial = new THREE.MeshStandardMaterial({
        // map: grassTexture,
        color: 0xffffff,
        roughness: 1, // Adjust roughness for a more matte finish
        metalness: 0, // Grass typically has no metalness
    });

    // Create the ground geometry and mesh
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.rotation.x = - Math.PI / 2; // Rotate to make the plane horizontal
    groundMesh.position.set(0, -28, 0);
    groundMesh.castShadow = false;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);


    // Ambient Light
    ambientLight = new THREE.AmbientLight(0xffffff, 3); // Adjust intensity
    ambientLight.position.set(1, 1, 1).normalize();
    scene.add(ambientLight);



    spotLight1 = new THREE.SpotLight(0xffffff, 50000);
    spotLight1.name = 'Spot Light';
    spotLight1.angle = Math.PI / 5;
    spotLight1.penumbra = 0.3;
    spotLight1.position.set(100, 100, 0);
    spotLight1.castShadow = true;
    spotLight1.shadow.camera.near = 80;
    spotLight1.shadow.camera.far = 300;
    spotLight1.shadow.mapSize.width = 1024;
    spotLight1.shadow.mapSize.height = 1024;
    scene.add(spotLight1);
    // scene.add(new THREE.CameraHelper(spotLight1.shadow.camera));


    // Directional Light
    // addDirectionalLight(new THREE.Vector3(30, 120, 0), 0.2);
    addDirectionalLight(new THREE.Vector3(60, 70, 70), 0.4);
    addDirectionalLight(new THREE.Vector3(-60, 70, -70), 0.4);
    addDirectionalLight(new THREE.Vector3(30, -28, -30), 0.4);
    addDirectionalLight(new THREE.Vector3(-30, -28, 30), 0.4);

    function addDirectionalLight(position, intensity, isShadow = false) {
        const light = new THREE.DirectionalLight(0xffffff, intensity);
        light.position.copy(position);
        light.castShadow = isShadow;
        light.shadow.camera.near = 1;
        light.shadow.camera.far = 300;
        light.shadow.camera.right = 15;
        light.shadow.camera.left = -15;
        light.shadow.camera.top = 15;
        light.shadow.camera.bottom = -15;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        scene.add(light);
        directionalLights.push(light);
        // Create the DirectionalLightHelper with custom size
        const lightHelper = new THREE.DirectionalLightHelper(light, 5);
        // scene.add(lightHelper);

        // Create a custom material with the desired color (e.g., red)
        const customMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });

        // Traverse the helper and apply the custom material to its lines
        lightHelper.traverse((child) => {
            if (child.isLine) {
                child.material = customMaterial;
            }
        });
    }

    window.addEventListener('resize', onWindowResize);

    const gui = new GUI();

    gui.add(params, 'scale', 0.1, 5).min(0.5).max(2).step(0.1).onChange(updateScale);
    gui.add(params, 'rotateX', -Math.PI, Math.PI).step(0.1).onChange(value => updateRotation('rotateX', value));
    gui.add(params, 'rotateY', -Math.PI, Math.PI).step(0.1).onChange(value => updateRotation('rotateY', value));
    gui.add(params, 'rotateZ', -Math.PI, Math.PI).step(0.1).onChange(value => updateRotation('rotateZ', value));
    gui.add(params, 'moveX', -100, 100).step(0.1).onChange(value => updatePosition('moveX', value));
    gui.add(params, 'moveY', -100, 100).step(0.1).onChange(value => updatePosition('moveY', value));
    gui.add(params, 'moveZ', -100, 100).step(0.1).onChange(value => updatePosition('moveZ', value));
    gui.addColor(params, 'topFrameBackgroundColor').onChange(updateTopFrameBackgroundColor).name('Header Background');
    gui.addColor(params, 'mainFrameBackgroundColor').onChange(updateMainFrameBackgroundColor).name('SEG Background');
    gui.add(params, 'clear');
    gui.open();

    window.addEventListener('keydown', onKeyDown);

    // Set up the dropdowns
    if (innerDropdown) {
        innerDropdown.addEventListener('change', updateDropdownTexture);
    }

    if (borderDropdown) {
        borderDropdown.addEventListener('change', function () {
            const selectedOption = borderDropdown.options[borderDropdown.selectedIndex];
            const borderTexture = selectedOption.value;
            Object.keys(singleStandDaeFiles).forEach((key) => {
                const item = singleStandDaeFiles[key];
                item.fileName = generateFilename(key, innerTexture, borderTexture);
            });
            loadModels()
        });
    }

    if (borderColorDropdown) {
        borderColorDropdown.addEventListener('change', event => {
            currentBorderColor = event.target.value;
            updateAllBorderColor(currentBorderColor);
        });
        currentBorderColor = borderColorDropdown.value
    }

    if (topSelectorDropdown) {
        topSelectorDropdown.addEventListener('change', function (event) {
            switchTopFrame(event.target.value);
        });
    }

    if (baseSelectorDropdown) {
        baseSelectorDropdown.addEventListener('change', function (event) {
            switchBaseFrame(event.target.value);
        });
    }

    if (topFrameFileUpload) {
        topFrameFileUpload.addEventListener('change', handleTopFrameFileUpload);
    }

    if (mainFrameFileUpload) {
        mainFrameFileUpload.addEventListener('change', handleMainFrameFileUpload);
    }

    if (cropButton) {
        cropButton.addEventListener('click', handleCrop);
    }

    if (closeIcon) {
        closeIcon.addEventListener('click', closeCropper);
    }

    if (frameColorDropdown) {
        frameColorDropdown.addEventListener('change', event => {
            currentBaseFrameColor = event.target.value;
            updateBaseFrameColor(currentBaseFrame, currentBaseFrameColor);
        });
        currentBaseFrameColor = frameColorDropdown.value
    }

}

function getFilenameWithDelimiter(name) {
    const imgName = name.split('.').slice(0, -1).join('.'); // Remove the extension
    return imgName.replace(/[-\s]/g, '_'); // Replace '-' and ' ' with '_'
}

// Function to generate filename with a delimiter
function generateFilename(key, innerImage, borderImage) {
    return `${key}_${getFilenameWithDelimiter(innerImage)}_${getFilenameWithDelimiter(borderImage)}.dae`;
}

// Function to animate the groupFrame
async function loadModels() {
    document.body.classList.remove('loaded');

    // Convert each model loading into a promise
    const modelPromises = Object.entries(singleStandDaeFiles).map(([key, value]) => {
        const filePath = '.' + generatedDir + value.fileName;

        return new Promise((resolve, reject) => {
            loader.load(filePath, function (collada) {
                const frame = collada.scene;

                // Set properties for the loaded model
                frame.scale.set(0.4, 0.4, 0.4);
                frame.colorSpace = THREE.SRGBColorSpace;
                frame.castShadow = true; // Ensure the model casts shadows

                // Add to frames collection
                frames[key] = frame;

                // Perform additional processing
                computeBoundingBox(frames[key]);
                checkAndAddToGroup();

                resolve(); // Resolve the promise when done
            },
                undefined,
                function (error) {
                    console.error('An error occurred while loading the model:', error);
                    reject(error); // Reject the promise if there's an error
                });
        });
    });

    // Await all promises to complete
    try {
        await Promise.all(modelPromises);

        // After all models are loaded, do any additional tasks
        if (mainFramCropedImage) {
            setMainFrameCropedImage();
        }
        if (topFramCropedImage) {
            setTopFrameCropedImage();
        }

    } catch (error) {
        console.error('One or more models failed to load:', error);
    } finally {
        // Hide loader after loading is complete
        setTimeout(function () {
            document.body.classList.add('loaded');
        }, 1000)
    }
}

// Function to animate the groupFrame
function animateGroupFrame(groupFrame) {
    // Initial scale set to zero (invisible)
    groupFrame.scale.set(0.1, 0.1, 0.1);

    // Initial rotation
    groupFrame.rotation.set(0, 0, 0);

    const duration = 2000; // Duration of the animation in milliseconds
    const targetScale = { x: 1.3, y: 1.3, z: 1.3 }; // Target scale (original size)
    const targetRotation = { x: Math.PI * 1, y: Math.PI * 1, z: Math.PI * 1 }; // Target rotation

    const startTime = Date.now();

    function groupFrameAnimate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Scale interpolation
        groupFrame.scale.x = THREE.MathUtils.lerp(0.1, targetScale.x, progress);
        groupFrame.scale.y = THREE.MathUtils.lerp(0.1, targetScale.y, progress);
        groupFrame.scale.z = THREE.MathUtils.lerp(0.1, targetScale.z, progress);

        // Rotation interpolation
        // groupFrame.rotation.x = THREE.MathUtils.lerp(0, targetRotation.x, progress);
        groupFrame.rotation.y = THREE.MathUtils.lerp(0, targetRotation.y, progress);
        // groupFrame.rotation.z = THREE.MathUtils.lerp(0, targetRotation.z, progress);

        if (progress < 1) {
            requestAnimationFrame(groupFrameAnimate);
        }
    }

    groupFrameAnimate();
}

function handleMainFrameFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    fileUploadFlag = 'MainFrame';

    const reader = new FileReader();
    reader.onload = function (e) {
        cropperImage.src = e.target.result;
        cropperContainer.style.display = 'block';

        if (cropper) {
            cropper.destroy();
        }

        cropper = new Cropper(cropperImage, {
            aspectRatio: 5787 / 12874,
            viewMode: 1,
            autoCropArea: 1,
            cropBoxResizable: false,
            cropBoxMovable: true,
        });
    };
    reader.readAsDataURL(file);
}


function handleTopFrameFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    fileUploadFlag = 'TopFrame';

    const reader = new FileReader();
    reader.onload = function (e) {
        cropperImage.src = e.target.result;
        cropperContainer.style.display = 'block';

        if (cropper) {
            cropper.destroy();
        }

        cropper = new Cropper(cropperImage, {
            aspectRatio: 6992 / 3449,
            viewMode: 1,
            autoCropArea: 1,
            cropBoxResizable: false,
            cropBoxMovable: true,
        });

    };
    reader.readAsDataURL(file);
}

function handleCrop() {
    if (cropper) {
        if (fileUploadFlag == 'MainFrame') {
            mainFramCropedImage = cropper.getCroppedCanvas();
            setMainFrameCropedImage();
        } else if (fileUploadFlag == 'TopFrame') {
            topFramCropedImage = cropper.getCroppedCanvas();
            setTopFrameCropedImage()
        } else {
            topFramCropedImage = cropper.getCroppedCanvas();
            setTopFrameCropedImage()
        }
    }
}

function setMainFrameCropedImage() {

    if (mainFramCropedImage) {
        const mainFrameBackgroundColor = params.mainFrameBackgroundColor;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = mainFramCropedImage.width;
        tempCanvas.height = mainFramCropedImage.height;
        const ctx = tempCanvas.getContext('2d');

        // Draw the background color
        ctx.fillStyle = mainFrameBackgroundColor;
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

        // Draw the cropped image on top
        ctx.drawImage(mainFramCropedImage, 0, 0);

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

    if (topFramCropedImage) {
        const topFrameBackgroundColor = params.topFrameBackgroundColor;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = topFramCropedImage.width;
        tempCanvas.height = topFramCropedImage.height;
        const ctx = tempCanvas.getContext('2d');

        // Draw the background color
        ctx.fillStyle = topFrameBackgroundColor;
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

        // Draw the cropped image on top
        ctx.drawImage(topFramCropedImage, 0, 0);

        tempCanvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const texture = new THREE.TextureLoader().load(url, function () {
                updateTopFrameImageTexture(texture);
            });
            closeCropper();
        });
    }
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

function updateTopFrameBackgroundColor(color) {
    params.topFrameBackgroundColor = color;
    setTopFrameCropedImage()
}

function updateMainFrameBackgroundColor(color) {
    params.mainFrameBackgroundColor = color;
    setMainFrameCropedImage()
}

function updateBaseFrameColor(frame, color) {
    let intensity = 0.7;
    let bgColor = '#ffffff';
    let textureURL = './assets/images/background/pure-white-background.png';

    switch (color) {
        case 'black':
            intensity = 2;
            bgColor = '#000000';
            textureURL = './assets/images/background/pure-black-background.png';
            break;
        case 'red':
            intensity = 0.9;
            bgColor = '#9f0000';
            textureURL = './assets/images/background/pure-red-background.png';
            break;
        default:
            break;
    }

    frame.traverse(mesh => {
        if (mesh.isMesh) {

            mesh.castShadow = true;
            mesh.receiveShadow = true;

            mesh.material.flatShading = true;
            mesh.material.shininess = 2000;
            mesh.material.envMapIntensity = 100;
            mesh.material.roughness = 0.9;
            mesh.material.metalness = 0.7;

            if (footerFlag == 'image') {
                // Load and apply the texture
                const textureLoader = new THREE.TextureLoader();
                textureLoader.load(textureURL, texture => {
                    mesh.material.map = texture;
                    mesh.material.needsUpdate = true;
                });
            } else {
                // Remove the texture and set the color
                if (mesh.material.map) {
                    mesh.material.map = null;
                }
                mesh.material.color.set(bgColor); // Black color
                mesh.material.needsUpdate = true;
            }
        }
    });
}

function computeBoundingBox(object) {
    // console.log(object);
    const box = new THREE.Box3();
    object.traverse(function (mesh) {
        if (mesh.isMesh) {
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            if (Array.isArray(mesh.material)) {
                // If the mesh has multiple materials
                mesh.material.forEach(mat => {
                    mat.metalness = 1.0;
                    mat.roughness = 0.2;
                    mat.clearCoat = 1.0;
                    mat.clearCoatRoughness = 0.1;
                    mat.flatShading = true;
                    mat.shininess = 1000;
                });
            } else {
                // If the mesh has a single material
                mesh.material.metalness = 1.0;
                mesh.material.roughness = 0.2;
                mesh.material.clearCoat = 1.0;
                mesh.material.clearCoatRoughness = 0.1;
                mesh.material.flatShading = true;
                mesh.material.shininess = 1000;
            }
            mesh.geometry.computeBoundingBox();
            box.expandByObject(mesh);
        }
    });
    object.userData.boundingBox = box;
}

function checkAndAddToGroup() {
    if (frames.frameBase1 && frames.frameBase2 && frames.frameMain && frames.frameTop1) {
        switchBaseFrame(defaultBaseFrame);
        frames.frameMain.position.y = currentBaseFrame.userData.boundingBox.min.y - .6;
        groupFrame.add(frames.frameMain);
        switchTopFrame(defaultTopFrame);
        scene.add(groupFrame);

        // Center the camera
        const box = new THREE.Box3().setFromObject(groupFrame);
        const center = new THREE.Vector3();
        box.getCenter(center);
        // groupFrame.position.sub(center); // Center the group
    }
}

function switchBaseFrame(baseFrame) {
    let baseBox;
    let moveY;
    defaultBaseFrame = baseFrame
    if (currentBaseFrame) {
        groupFrame.remove(currentBaseFrame);
    }

    if (baseFrame === 'frame_base2') {
        currentBaseFrame = frames.frameBase2;
        baseBox = frames.frameBase2.userData.boundingBox;
        moveY = 27
    } else if (baseFrame === 'frame_base1') {
        currentBaseFrame = frames.frameBase1;
        baseBox = frames.frameBase1.userData.boundingBox;
        moveY = 28.5
    } else if (baseFrame === 'none') {
        moveY = 29
    }

    groupFrame.position.y = -moveY;
    if (baseFrame !== 'none') {
        currentBaseFrame.position.y = 0;
        groupFrame.add(currentBaseFrame);
        updateBaseFrameColor(currentBaseFrame, currentBaseFrameColor)
    }

}

function switchTopFrame(topFrame) {
    if (currentTopFrame) {
        groupFrame.remove(currentTopFrame);
    }

    if (topFrame === 'none') {
        return;
    }

    const mainBox = frames.frameMain.userData.boundingBox;
    if (topFrame === 'frame_top2') {
        currentTopFrame = frames.frameTop2;
    } else {
        currentTopFrame = frames.frameTop1;
    }

    const topBox = currentTopFrame.userData.boundingBox;
    currentTopFrame.position.y = mainBox.max.y - 71;
    groupFrame.add(currentTopFrame);
}

function updateTexture(mesh, texture, frameNames) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.encoding = THREE.sRGBEncoding;
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    // texture.repeat.set(10, 10);
    if (mesh.isMesh) {
        if (frameNames.includes(mesh.name)) {
            console.log('ffff')

            if (Array.isArray(mesh.material)) {
                // If the mesh has multiple materials
                mesh.material.forEach(mat => {
                    mat.map = texture;
                    mat.map.wrapS = THREE.RepeatWrapping;
                    mat.map.wrapT = THREE.RepeatWrapping;
                    mat.needsUpdate = true;
                    mat.metalness = 1.0;
                    mat.roughness = 0.2;
                    mat.clearCoat = 1.0;
                    mat.clearCoatRoughness = 0.1;
                });
            } else {
                // If the mesh has a single material
                mesh.material.map = texture;
                mesh.material.map.wrapS = THREE.RepeatWrapping;
                mesh.material.map.wrapT = THREE.RepeatWrapping;
                mesh.material.needsUpdate = true;
                mesh.material.metalness = 1.0;
                mesh.material.roughness = 0.2;
                mesh.material.clearCoat = 1.0;
                mesh.material.clearCoatRoughness = 0.1;
            }
        }
    }
}

function updateMainFrameImageTexture(texture) {
    const frameMainBox = new THREE.Box3().setFromObject(frames.frameMain);
    const frameMainWidth = frameMainBox.max.x - frameMainBox.min.x;
    const frameMainHeight = frameMainBox.max.y - frameMainBox.min.y;

    const boxAspectRatio = frameMainWidth / frameMainHeight;
    const imageAspectRatio = texture.image.width / texture.image.height;
    console.log('image', texture.image.width, texture.image.height)

    // Adjust texture settings for centering and scaling
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    texture.needsUpdate = true;

    frames.frameMain.traverse(function (child) {
        updateTexture(child, texture, frameMainNames)
    });
    renderer.render(scene, camera);
}

function updateTopFrameImageTexture(texture) {
    const frameTop1Box = new THREE.Box3().setFromObject(frames.frameTop1);
    const frameTop1Width = frameTop1Box.max.x - frameTop1Box.min.x;
    const frameTop1Height = frameTop1Box.max.y - frameTop1Box.min.y;

    const boxAspectRatio = frameTop1Width / frameTop1Height;
    const imageAspectRatio = texture.image.width / texture.image.height;
    console.log('image', texture.image.width, texture.image.height)

    // Adjust texture settings for centering and scaling
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    texture.needsUpdate = true;

    frames.frameTop1.traverse(function (child) {
        updateTexture(child, texture, frameTop1Names)
    });
    renderer.render(scene, camera);
}

function setBorderColor(mesh, bgColor) {
    if (mesh.isMesh) {
        if (allFrameBorderNames.includes(mesh.name)) {
            if (mesh.material.map) {
                mesh.material.map = null;
            }
            mesh.material.metalness = 1.0;
            mesh.material.roughness = 0.2;
            mesh.material.clearCoat = 1.0;
            mesh.material.clearCoatRoughness = 0.1;
            mesh.material.flatShading = true;
            mesh.material.intensity = 2;
            mesh.material.shininess = 1000;
            mesh.material.color.set(bgColor); // Black color
            mesh.material.needsUpdate = true;
        }
    }
}

function updateAllBorderColor(bgColor) {
    // Apply texture to top frame
    if (frames.frameTop1) {
        frames.frameTop1.traverse(function (mesh) {
            setBorderColor(mesh, bgColor)
        });
    }

    // Apply texture to main frame
    if (frames.frameMain) {
        frames.frameMain.traverse(function (mesh) {
            setBorderColor(mesh, bgColor)
        });
    }

    // // Apply texture to main frame
    // if (frames.frameBase1) {
    //     frames.frameBase1.traverse(function (mesh) {
    //         setBorderColor(mesh, bgColor)
    //     });
    // }
    // // Apply texture to main frame
    // if (frames.frameBase2) {
    //     frames.frameBase2.traverse(function (mesh) {
    //         setBorderColor(mesh, bgColor)
    //     });
    // }

    renderer.render(scene, camera);
}

function updateAllFrameBorderTexture(textureURL) {
    const texture = new THREE.TextureLoader().load(textureURL);

    // Apply texture to top frame
    if (frames.frameTop1) {
        frames.frameTop1.traverse(function (child) {
            updateTexture(child, texture, allFrameBorderNames)
        });
    }

    // Apply texture to main frame
    if (frames.frameMain) {
        frames.frameMain.traverse(function (child) {
            updateTexture(child, texture, allFrameBorderNames)
        });
    }

    // Apply texture to main frame
    if (frames.frameBase1) {
        frames.frameBase1.traverse(function (child) {
            updateTexture(child, texture, allFrameBorderNames)
        });
    }
    // Apply texture to main frame
    if (frames.frameBase2) {
        frames.frameBase2.traverse(function (child) {
            updateTexture(child, texture, allFrameBorderNames)
        });
    }

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    renderer.render(scene, camera);
    stats.update();
}

function onKeyDown(event) {
    if (!groupFrame) return;

    const step = 1;
    const rotationStep = 0.1;

    switch (event.key) {
        case 'ArrowUp':
            groupFrame.position.y += step;
            break;
        case 'ArrowDown':
            groupFrame.position.y -= step;
            break;
        case 'ArrowLeft':
            groupFrame.position.x -= step;
            break;
        case 'ArrowRight':
            groupFrame.position.x += step;
            break;
        case 'w':
            groupFrame.position.y += step;
            break;
        case 's':
            groupFrame.position.y -= step;
            break;
        case 'a':
            groupFrame.position.x -= step;
            break;
        case 'd':
            groupFrame.position.x += step;
            break;
        case 't':
            groupFrame.rotation.y -= rotationStep;
            break;
        case 'g':
            groupFrame.rotation.y += rotationStep;
            break;
        case 'r':
            groupFrame.rotation.x -= rotationStep;
            break;
        case 'f':
            groupFrame.rotation.x += rotationStep;
            break;
        case 'q':
            groupFrame.rotation.z -= rotationStep;
            break;
        case 'e':
            groupFrame.rotation.z += rotationStep;
            break;
        case '=':
        case '+':
            groupFrame.scale.multiplyScalar(1.1);
            break;
        case '-':
            groupFrame.scale.multiplyScalar(0.9);
            break;
    }
}

function updateScale(value) {
    if (groupFrame) groupFrame.scale.set(value, value, value);
}

function updateRotation(axis, value) {
    if (groupFrame) {
        switch (axis) {
            case 'rotateX':
                groupFrame.rotation.x = value;
                break;
            case 'rotateY':
                groupFrame.rotation.y = value;
                break;
            case 'rotateZ':
                groupFrame.rotation.z = value;
                break;
        }
    }
}

function updatePosition(axis, value) {
    if (groupFrame) {
        switch (axis) {
            case 'moveX':
                groupFrame.position.x = value;
                break;
            case 'moveY':
                groupFrame.position.y = value;
                break;
            case 'moveZ':
                groupFrame.position.z = value;
                break;
        }
    }
}

function clear() {
    location.href = location.pathname;

    // groupFrame.scale.set(1, 1, 1);
    // groupFrame.rotation.set(0, 0, 0);
    // groupFrame.position.set(0, 0, 0);
}

function updateDropdownTexture() {
    const innerTexture = document.getElementById('innerTextureDropdown').value;
    const borderTexture = document.getElementById('borderTextureDropdown').value;
    const numObjects = document.getElementById('numObjects').value;

    const queryParams = [];
    if (innerTexture) {
        queryParams.push(`innerTexture=${encodeURIComponent(innerTexture)}`);
    }
    if (borderTexture) {
        queryParams.push(`borderTexture=${encodeURIComponent(borderTexture)}`);
    }
    if (numObjects) {
        queryParams.push(`numObjects=${encodeURIComponent(numObjects)}`);
    }

    if (innerTexture && borderTexture) {
        location.href = `?` + queryParams.join('&');
    } else {
        console.log("Please select both inner and border textures.");
    }
}

window.addEventListener('load', function () {
    setTimeout(function () {
        document.body.classList.add('loaded');
        // animateGroupFrame(groupFrame);
    }, 1000)
});