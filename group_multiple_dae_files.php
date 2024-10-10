<?php

$debug_mode = false;

$borderName = $innerName = $fileName = '';
$numObjects = 1;
$originalFileName = 'texture2';
$innerImages = ["adidas.jpg", "tree1.jpeg", "sunset.jpeg", "sunset2.webp", "mount.jpeg", "trees.jpg", "harish_sir.jpg"];
$borderImages = ["Light_Wood.jpg", "Red_Cherry_Wood.jpg", "Lighter_Wood.jpg", "Dark_Wood.jpg"];

$frameTop1Names = ['_600_Header_Graphic', '_600_Header_Graphic.1'];
$frameMainNames = ['_600SEG_Graphic.1', '_600_SEG_Graphic'];
$allFrameBorderNames = ['_600_Header_Frame', 'Left_Profile', 'Right_Profile', 'Lower_Profile', 'Top_Profile', 'Base_150_Flat', 'Base_Option_1'];


// $allNodes = array_merge($topNode, $mainNodeBorder, $mainNodeInner, $baseNode);
// $mainFrame = $mainNodeInner;
// $woodFrame = array_merge($mainNodeBorder, $baseNode);


function getFilename($name)
{
    $imgName = pathinfo($name, PATHINFO_FILENAME);
    $imgName = str_replace(['-', '_'], ' ', $imgName);

    return $imgName;
}

?>

<!DOCTYPE html>
<html>

<head>
    <title>DAE Viewer with Dynamic Textures</title>
    <style>
        body {
            margin: 0;
        }

        canvas {
            display: block;
        }

        #info {
            position: absolute;
            top: 80px;
            z-index: 1;
        }

        #info label,
        #info select {
            cursor: pointer;
            text-transform: uppercase;
            font-size: 16px;
            margin: 5px;
            padding: 10px;
            display: block;
            background: #ffffff;
            border: 1px solid #ccc;
            border-radius: 4px;
            color: #333;
        }

        #info img {
            width: 40px;
            height: 40px;
            vertical-align: middle;
        }

        .file-upload-wrapper {
            position: relative;
            display: inline-block;
        }

        .file-upload-input {
            width: 0.1px;
            height: 0.1px;
            opacity: 0;
            overflow: hidden;
            position: absolute;
            z-index: -1;
        }

        .file-upload-label {
            display: inline-block;
            cursor: pointer;
            text-transform: uppercase;
            font-size: 16px;
            margin: 5px;
            padding: 10px;
            background: #ffffff;
            border: 1px solid #ccc;
            border-radius: 4px;
            color: #333;
        }

        .file-upload-label:hover {
            background: #f0f0f0;
        }

        #cropper-container {
            position: absolute;
            top: 100px;
            left: 100px;
            width: 500px;
            height: 500px;
            background: #ffffff;
            display: none;
            z-index: 10;
        }

        /* Ensure the cropper-popup uses flexbox for alignment */
        .cropper-popup {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            height: 100%;
        }

        /* Ensure the cropper-inner takes the full height and width of its container */
        .cropper-inner {
            width: 100%;
            height: 100%;
            box-sizing: border-box;
        }

        .close-icon {
            position: absolute;
            top: 10px;
            right: 10px;
            cursor: pointer;
            font-size: 20px;
            z-index: 10;
            background-color: #ff0000;
            border-radius: 50%;
            padding: 3px 10px 5px;
            font-weight: bold;
            color: #fff;
        }

        #cropper-image {
            max-width: 100%;
            height: auto;
        }

        #crop-button {
            margin-top: 10px;
            padding: 5px 10px;
            background: #007bff;
            border: none;
            color: #fff;
            cursor: pointer;
        }

        #crop-button:hover {
            background: #0056b3;
        }
    </style>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.12/cropper.min.css" rel="stylesheet">

</head>

<body>
    <div id="container"></div>
    <div id="info">
        <select id="innerTextureDropdown">
            <option value="">Inner Texture</option>
            <option value="./assets/images/inner-images/adidas.jpg">Adidas</option>
            <option value="./assets/images/inner-images/tree1.jpeg">Tree1</option>
            <option value="./assets/images/inner-images/sunset.jpeg">Sunset</option>
            <option value="./assets/images/inner-images/sunset2.webp">Sunset2</option>
            <option value="./assets/images/inner-images/mount.jpeg">Mount</option>
            <option value="./assets/images/inner-images/trees.jpg">Trees</option>
        </select>

        <select id="borderTextureDropdown">
            <option value="">Border Texture</option>
            <option value="./assets/images/borders/Light_Wood.jpg">Light Wood</option>
            <option value="./assets/images/borders/Red_Cherry_Wood.jpg">Red Cherry Wood</option>
            <option value="./assets/images/borders/Lighter_Wood.jpg">Lighter Wood</option>
            <option value="./assets/images/borders/Dark_Wood.jpg">Dark Wood</option>
        </select>

        <select id="top-selector">
            <option value="none">Select Top Frame</option>
            <option value="frame_top1" selected>Top Frame </option>
        </select>

        <select id="base-selector">
            <option value="none">Select Base Frame</option>
            <option value="frame_base1" selected>Base Frame 1</option>
            <option value="frame_base2">Base Frame 2</option>
        </select>

        <div class="file-upload-wrapper">
            <input type="file" id="texture-upload" accept="image/*" class="file-upload-input">
            <label for="texture-upload" class="file-upload-label">Upload Top Frame Image</label>
        </div>

        <div id="cropper-container">
            <div class="cropper-popup">
                <div class="cropper-inner">
                    <span class="close-icon">&times;</span>
                    <img id="cropper-image" src="" alt="Image to crop">
                    <button id="crop-button">Crop</button>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.12/cropper.min.js"></script>

    <script type="importmap">
        {
            "imports": {
                "three": "./three/build/three.module.js",
                "three/addons/": "./three/examples/jsm/"
            }
        }
    </script>
    <script type="module">
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
        const textureUpload = document.getElementById('texture-upload');
        const cropperContainer = document.getElementById('cropper-container');
        const cropperImage = document.getElementById('cropper-image');
        const cropButton = document.getElementById('crop-button');
        const closeIcon = document.querySelector('.close-icon');

        let renderer, canvas, scene, camera, stats, groupFrame, cropper, cropedImage;
        let frameBase1, frameBase2, frameMain, frameTop1, frameTop2, currentBaseFrame, currentTopFrame;

        const frameTop1Names = <?php echo !empty($frameTop1Names) ? json_encode($frameTop1Names) : '""'; ?>;
        const frameMainNames = <?php echo !empty($frameMainNames) ? json_encode($frameMainNames) : '""'; ?>;
        const allFrameBorderNames = <?php echo !empty($allFrameBorderNames) ? json_encode($allFrameBorderNames) : '""'; ?>;
        // const frameTop1Names = ['_600_Header_Graphic', '_600_Header_Graphic.1'];


        let params = {
            scale: 0.4,
            rotateX: 0,
            rotateY: 0,
            rotateZ: 0,
            moveX: 0,
            moveY: 0,
            moveZ: 0,
            backgroundColor: '#ffffff',
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
            renderer.setAnimationLoop(animate);

            canvas = renderer.domElement;
            container.appendChild(canvas);

            stats = new Stats();
            container.appendChild(stats.dom);

            scene = new THREE.Scene();
            groupFrame = new THREE.Group();


            camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 2, 1000);
            camera.position.z = 120;

            const controls = new OrbitControls(camera, canvas);
            controls.update();

            // Ambient Light
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Adjust intensity
            scene.add(ambientLight);

            // Directional Light
            const directionalLight = new THREE.DirectionalLight(0x000000, 0.5);
            directionalLight.position.set(1, 1, 1).normalize();
            scene.add(directionalLight);


            // Load Collada file
            const loader = new ColladaLoader();
            loader.load('./assets/models/frame_main.dae', function(collada) {
                frameMain = collada.scene;
                frameMain.scale.set(0.4, 0.4, 0.4);
                computeBoundingBox(frameMain);
                checkAndAddToGroup();
            });
            loader.load('./assets/models/frame_base1.dae', function(collada) {
                frameBase1 = collada.scene;
                frameBase1.scale.set(0.4, 0.4, 0.4);
                computeBoundingBox(frameBase1);
                checkAndAddToGroup();
            });
            loader.load('./assets/models/frame_base2.dae', function(collada) {
                frameBase2 = collada.scene;
                frameBase2.scale.set(0.4, 0.4, 0.4);
                computeBoundingBox(frameBase2);
                checkAndAddToGroup();
            });

            loader.load('./assets/models/frame_top.dae', function(collada) {
                frameTop1 = collada.scene;
                frameTop1.scale.set(0.4, 0.4, 0.4);
                computeBoundingBox(frameTop1);
                checkAndAddToGroup();
            });

            window.addEventListener('resize', onWindowResize);

            const gui = new GUI();

            gui.add(params, 'scale', 0.1, 5).min(0.5).max(2).step(0.1).onChange(updateScale);
            gui.add(params, 'rotateX', -Math.PI, Math.PI).step(0.1).onChange(value => updateRotation('rotateX', value));
            gui.add(params, 'rotateY', -Math.PI, Math.PI).step(0.1).onChange(value => updateRotation('rotateY', value));
            gui.add(params, 'rotateZ', -Math.PI, Math.PI).step(0.1).onChange(value => updateRotation('rotateZ', value));
            gui.add(params, 'moveX', -100, 100).step(0.1).onChange(value => updatePosition('moveX', value));
            gui.add(params, 'moveY', -100, 100).step(0.1).onChange(value => updatePosition('moveY', value));
            gui.add(params, 'moveZ', -100, 100).step(0.1).onChange(value => updatePosition('moveZ', value));
            gui.addColor(params, 'backgroundColor').onChange(updateBackgroundColor);
            gui.add(params, 'clear');
            gui.open();

            window.addEventListener('keydown', onKeyDown);

            // Set up the dropdowns
            const innerDropdown = document.getElementById('innerTextureDropdown');
            if (innerDropdown) {
                innerDropdown.addEventListener('change', function() {
                    const selectedOption = innerDropdown.options[innerDropdown.selectedIndex];
                    const image = selectedOption.value;
                    updateMainFrameImageTexture(image, false); // Apply to inner parts
                });
            }

            const borderDropdown = document.getElementById('borderTextureDropdown');
            if (borderDropdown) {
                borderDropdown.addEventListener('change', function() {
                    const selectedOption = borderDropdown.options[borderDropdown.selectedIndex];
                    const image = selectedOption.value;
                    updateAllFrameBorderTexture(image, true); // Apply to border parts
                });
            }

            const topSelectorDropdown = document.getElementById('top-selector');
            if (topSelectorDropdown) {
                topSelectorDropdown.addEventListener('change', function(event) {
                    switchTopFrame(event.target.value);
                });
            }

            const baseSelectorDropdown = document.getElementById('base-selector');
            if (baseSelectorDropdown) {
                baseSelectorDropdown.addEventListener('change', function(event) {
                    switchBaseFrame(event.target.value);
                });
            }

            if (textureUpload) {
                textureUpload.addEventListener('change', handleImageUpload);
            }

            if (cropButton) {
                cropButton.addEventListener('click', handleCrop);
            }

            if (closeIcon) {
                closeIcon.addEventListener('click', closeCropper);
            }

        }

        function handleImageUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(e) {
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
                    // ready: function() {
                    //     // Set the fixed crop box size
                    //     const cropBoxData = cropper.getCropBoxData();
                    //     cropBoxData.width = 6992;
                    //     cropBoxData.height = 3449;
                    //     cropper.setCropBoxData(cropBoxData);
                    // }
                });
            };
            reader.readAsDataURL(file);
        }

        function handleCrop() {
            if (cropper) {
                cropedImage = cropper.getCroppedCanvas();
            }
            setCropedImage()
        }

        function setCropedImage() {

            if (cropedImage) {
                const backgroundColor = params.backgroundColor;
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = cropedImage.width;
                tempCanvas.height = cropedImage.height;
                const ctx = tempCanvas.getContext('2d');

                // Draw the background color
                ctx.fillStyle = backgroundColor;
                ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

                // Draw the cropped image on top
                ctx.drawImage(cropedImage, 0, 0);

                tempCanvas.toBlob((blob) => {
                    const url = URL.createObjectURL(blob);
                    const texture = new THREE.TextureLoader().load(url, function() {
                        updateTopFrameImageTexture(texture);
                    });
                    closeCropper();
                });
            } else {
                console.log('dddd')
            }
        }

        function closeCropper() {
            cropperContainer.style.display = 'none';
            document.body.classList.remove('modal-open');
            if (cropper) {
                cropper.destroy();
                cropper = null;
            }
            textureUpload.value = '';
        }

        function updateBackgroundColor(color) {
            params.backgroundColor = color;
            setCropedImage()
        }

        function computeBoundingBox(object) {
            const box = new THREE.Box3();
            object.traverse(function(child) {
                if (child.isMesh) {
                    child.geometry.computeBoundingBox();
                    box.expandByObject(child);
                }
            });
            object.userData.boundingBox = box;
        }

        function checkAndAddToGroup() {
            if (frameBase1 && frameBase2 && frameMain && frameTop1) {
                groupFrame.add(frameMain);

                // const mainBox = frameMain.userData.boundingBox;
                // frameTop1.position.y = mainBox.max.y + 1 - (frameTop1.userData.boundingBox ? frameTop1.userData.boundingBox.getSize(new THREE.Vector3()).y : 0);
                // groupFrame.add(frameTop1);

                scene.add(groupFrame);

                // Center the camera
                const box = new THREE.Box3().setFromObject(groupFrame);
                const center = new THREE.Vector3();
                box.getCenter(center);
                groupFrame.position.sub(center); // Center the group

                // camera.position.set(100, 100, 100); // Adjust camera position
                // camera.lookAt(groupFrame.position);

                // animate();

                // Add bounding box helper
                // const boxHelper = new THREE.BoxHelper(groupFrame, 0xff0000);
                // scene.add(boxHelper);
                switchBaseFrame('frame_base1');
                switchTopFrame('frame_top1');

            }
        }

        function switchBaseFrame(baseFrame) {
            if (currentBaseFrame) {
                groupFrame.remove(currentBaseFrame);
            }

            if (baseFrame === 'none') {
                return;
            }

            const mainBox = frameMain ? frameMain.userData.boundingBox : null;
            let baseBox;

            if (baseFrame === 'frame_base2') {
                currentBaseFrame = frameBase2;
                baseBox = frameBase2.userData.boundingBox;
            } else {
                currentBaseFrame = frameBase1;
                baseBox = frameBase1.userData.boundingBox;
            }

            // currentBaseFrame.position.y = mainBox.min.y - baseBox.max.y;
            currentBaseFrame.position.y = 0;
            groupFrame.add(currentBaseFrame);

        }

        function switchTopFrame(topFrame) {
            if (currentTopFrame) {
                groupFrame.remove(currentTopFrame);
            }

            if (topFrame === 'none') {
                return;
            }

            const mainBox = frameMain.userData.boundingBox;
            if (topFrame === 'frame_top2') {
                currentTopFrame = frameTop2;
            } else {
                currentTopFrame = frameTop1;
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

        function updateTopFrameImageTexture(texture) {
            const frameTop1Box = new THREE.Box3().setFromObject(frameTop1);
            const frameTop1Width = frameTop1Box.max.x - frameTop1Box.min.x;
            const frameTop1Height = frameTop1Box.max.y - frameTop1Box.min.y;

            const boxAspectRatio = frameTop1Width / frameTop1Height;
            const imageAspectRatio = texture.image.width / texture.image.height;
            console.log('image', texture.image.width, texture.image.height)

            // Adjust texture settings for centering and scaling
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;

            texture.needsUpdate = true;

            frameTop1.traverse(function(child) {
                updateTexture(child, texture, frameTop1Names)
            });
            renderer.render(scene, camera);

        }

        function updateAllFrameBorderTexture(textureURL, isBorder) {
            const texture = new THREE.TextureLoader().load(textureURL);

            // Apply texture to top frame
            if (frameTop1) {
                frameTop1.traverse(function(child) {
                    updateTexture(child, texture, allFrameBorderNames)
                });
            }

            // Apply texture to main frame
            if (frameMain) {
                frameMain.traverse(function(child) {
                    updateTexture(child, texture, allFrameBorderNames)
                });
            }

            // Apply texture to main frame
            if (frameBase1) {
                frameBase1.traverse(function(child) {
                    updateTexture(child, texture, allFrameBorderNames)
                });
            }
            // Apply texture to main frame
            if (frameBase2) {
                frameBase2.traverse(function(child) {
                    updateTexture(child, texture, allFrameBorderNames)
                });
            }

            renderer.render(scene, camera);
        }

        function updateMainFrameImageTexture(textureURL, isBorder) {
            const texture = new THREE.TextureLoader().load(textureURL);

            // Apply texture to main frame
            if (frameMain) {
                frameMain.traverse(function(child) {
                    updateTexture(child, texture, frameMainNames)
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
            // location.href = location.pathname;

            groupFrame.scale.set(1, 1, 1);
            groupFrame.rotation.set(0, 0, 0);
            groupFrame.position.set(0, 0, 0);
        }
    </script>
</body>

</html>