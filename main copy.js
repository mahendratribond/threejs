import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import {
    GUI
} from 'three/addons/libs/lil-gui.module.min.js';
import {
    OrbitControls
} from 'three/addons/controls/OrbitControls.js';
import {
    ColladaLoader
} from 'three/addons/loaders/ColladaLoader.js';

const container = document.getElementById('container');
const topFrameFileUpload = document.getElementById('topFrameFileUpload');
const cropperContainer = document.getElementById('cropper-container');
const cropperImage = document.getElementById('cropper-image');
const cropButton = document.getElementById('crop-button');
const closeIcon = document.querySelector('.close-icon');
const innerDropdown = document.getElementById('innerTextureDropdown');
const borderDropdown = document.getElementById('borderTextureDropdown');
const baseSelectorDropdown = document.getElementById('baseSelector');
const topSelectorDropdown = document.getElementById('topSelector');
const frameColorDropdown = document.getElementById('frameColorDropdown');
const mainFrameFileUpload = document.getElementById('mainFrameFileUpload');

let renderer, canvas, scene, camera, stats, controls, groupFrame, cropper, ambientLight, directionalLight1, directionalLight2, directionalLight3, directionalLight4, poinrLight;
let currentTopFrame, currentBaseFrame, currentBaseFrameColor, topFramCropedImage, mainFramCropedImage;
const frames = {};
const lights = [];
var footerFlag = 'color';
var fileUploadFlag = '';


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

    // renderer.gammaOutput = true;
    // renderer.gammaFactor = 2.2;

    renderer.setAnimationLoop(animate);

    canvas = renderer.domElement;
    container.appendChild(canvas);

    stats = new Stats();
    container.appendChild(stats.dom);

    scene = new THREE.Scene();
    // scene.background = new THREE.Color(0x000000); // 0xffffff is the hex code for white
    groupFrame = new THREE.Group();


    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 2, 1000);
    camera.position.z = 120;

    controls = new OrbitControls(camera, canvas);
    controls.update();

    // Ambient Light
    ambientLight = new THREE.AmbientLight(0xffffff, 2.5); // Adjust intensity
    ambientLight.position.set(1, 1, 1).normalize();
    scene.add(ambientLight);

    // // Directional Light
    // directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.5);
    // directionalLight1.position.set(20, 20, 20);//.normalize();
    // scene.add(directionalLight1);

    // directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    // directionalLight2.position.set(-20, 20, -20);//.normalize();
    // scene.add(directionalLight2);

    // directionalLight3 = new THREE.DirectionalLight(0xffffff, 0.5);
    // directionalLight3.position.set(20, -20, -20);//.normalize();
    // scene.add(directionalLight3);

    // directionalLight4 = new THREE.DirectionalLight(0xffffff, 0.5);
    // directionalLight4.position.set(-20, -20, 20);//.normalize();
    // scene.add(directionalLight4);

    // // poinrLight = new THREE.PointLight(0xff9000, 3);
    // // poinrLight.position.set(1, -0.0, 1);//.normalize();
    // // scene.add(poinrLight);




    // // Add the lights to an array for convenience
    // lights.push(directionalLight1);
    // lights.push(directionalLight2);
    // lights.push(directionalLight3);
    // lights.push(directionalLight4);

    // Add helpers to make the lights visible
    // lights.forEach(light => {
    //     const helper = new THREE.DirectionalLightHelper(light, 5);
    //     scene.add(helper);
    // });


    // const light = new THREE.DirectionalLight(0xffffff, 5);
    // light.position.set(10, 10, 10).normalize();
    // scene.add(light);

    // Load Collada file
    const loader = new ColladaLoader();
    // loadObjects(daeUrl, numObjects); // Load the initial object
    for (const [key, value] of Object.entries(singleStandDaeFiles)) {
        // console.log(value)
        loader.load('.' + generatedDir + value.fileName, function (collada) {
            frames[key] = collada.scene;
            frames[key].scale.set(0.4, 0.4, 0.4);
            computeBoundingBox(frames[key]);
            checkAndAddToGroup();
        });
    };

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
        borderDropdown.addEventListener('change', updateDropdownTexture);
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
            const color = event.target.value;
            currentBaseFrameColor = color
            updateBaseFrameColor(currentBaseFrame, color);
        });
        currentBaseFrameColor = frameColorDropdown.value
    }


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
    // directionalLight1.intensity = 0.5;
    // directionalLight2.intensity = 0.5;
    // directionalLight3.intensity = 0.5;
    // directionalLight4.intensity = 0.5;
    // Traverse each mesh in the frame
    var bgColor = '#ffffff';
    var textureURL = './assets/images/background/pure-white-background.png'
    if (color == 'black') {
        bgColor = '#000000';
        textureURL = './assets/images/background/pure-black-background.png'
        // directionalLight1.intensity = 0.9;
        // directionalLight2.intensity = 0.9;
        // directionalLight3.intensity = 0.9;
        // directionalLight4.intensity = 0.9;
    } else if (color == 'red') {
        bgColor = '#9f0000';
        textureURL = './assets/images/background/pure-red-background.png'
    }
    frame.traverse(mesh => {
        if (mesh.isMesh) {

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
    object.traverse(function (child) {
        if (child.isMesh) {
            child.geometry.computeBoundingBox();
            box.expandByObject(child);
        }
    });
    object.userData.boundingBox = box;
}

function checkAndAddToGroup() {
    if (frames.frameBase1 && frames.frameBase2 && frames.frameMain && frames.frameTop1) {
        groupFrame.add(frames.frameMain);

        scene.add(groupFrame);

        // Center the camera
        const box = new THREE.Box3().setFromObject(groupFrame);
        const center = new THREE.Vector3();
        box.getCenter(center);
        groupFrame.position.sub(center); // Center the group

        switchBaseFrame('frame_base1');
        switchTopFrame('frame_top1');


    // Directional Light
    directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight1.position.set(20, 20, 20);//.normalize();
    scene.add(directionalLight1);

    directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight2.position.set(-20, 20, -20);//.normalize();
    scene.add(directionalLight2);

    directionalLight3 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight3.position.set(-20, 20, 20);//.normalize();
    scene.add(directionalLight3);

    directionalLight4 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight4.position.set(20, 20, -20);//.normalize();
    scene.add(directionalLight4);

    // poinrLight = new THREE.PointLight(0xff9000, 3);
    // poinrLight.position.set(1, -0.0, 1);//.normalize();
    // scene.add(poinrLight);




    // Add the lights to an array for convenience
    lights.push(directionalLight1);
    lights.push(directionalLight2);
    lights.push(directionalLight3);
    lights.push(directionalLight4);

    directionalLight1.target = currentBaseFrame;
    directionalLight2.target = currentBaseFrame;
    directionalLight3.target = currentBaseFrame;
    directionalLight4.target = currentBaseFrame;

    lights.forEach(light => {
        const helper = new THREE.DirectionalLightHelper(light, 5);
        scene.add(helper);
    });

    }
}

function switchBaseFrame(baseFrame) {
    if (currentBaseFrame) {
        groupFrame.remove(currentBaseFrame);
    }

    if (baseFrame === 'none') {
        return;
    }

    const mainBox = frames.frameMain ? frames.frameMain.userData.boundingBox : null;
    let baseBox;

    if (baseFrame === 'frame_base2') {
        currentBaseFrame = frames.frameBase2;
        baseBox = frames.frameBase2.userData.boundingBox;
    } else {
        currentBaseFrame = frames.frameBase1;
        baseBox = frames.frameBase1.userData.boundingBox;
    }

    // currentBaseFrame.position.y = mainBox.min.y - baseBox.max.y;
    currentBaseFrame.position.y = 0;
    groupFrame.add(currentBaseFrame);
    updateBaseFrameColor(currentBaseFrame, currentBaseFrameColor)


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
    currentTopFrame.position.y = mainBox.max.y + 1 - (topBox ? topBox.getSize(new THREE.Vector3()).y : 0);
    groupFrame.add(currentTopFrame);
}

function updateTexture(mesh, texture, frameNames) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    // texture.encoding = THREE.sRGBEncoding;
    // texture.minFilter = THREE.LinearFilter;
    // texture.magFilter = THREE.LinearFilter;
    // texture.repeat.set(1, 1);
    if (mesh.isMesh) {
        if (frameNames.includes(mesh.name)) {
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
    }, 1000)
});