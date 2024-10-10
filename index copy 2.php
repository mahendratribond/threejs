<?php

include './config.php';

$innerTexture = $_GET['innerTexture'] ?? 'default.jpg';
$borderTexture = $_GET['borderTexture'] ?? 'Light_Wood.jpg';
$numObjects = !empty($_GET['numObjects']) ? $_GET['numObjects'] : 1;
foreach ($singleStandDaeFiles as $key => $singleStandDaeFile) {
    $singleStandDaeFiles[$key]['fileName'] = generateFilename($key, $innerTexture, $borderTexture); // Using MD5 hash for unique file names
}


// pr($singleStandDaeFiles);
// die;
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
        <input type="hidden" id="numObjects" min="1" value="<?php echo !empty($numObjects) ? $numObjects : 1 ?>" placeholder="Number of Objects">

        <select id="innerTextureDropdown" class="applyTextures">
            <option value="">Select Inner Texture</option>
            <?php foreach ($innerImages as $img) {
                $imgName = getFilename($img); // Get the filename without extension
                $selected = ($innerTexture == $img) ? 'selected' : '';
            ?>
                <option value="<?= $img ?>" <?= $selected ?>><?= $imgName ?></option>";
            <?php
            }
            ?>
        </select>

        <select id="borderTextureDropdown" class="applyTextures">
            <option value="">Select Border Texture</option>
            <?php foreach ($borderImages as $img) {
                $imgName = getFilename($img); // Get the filename without extension
                $selected = ($borderTexture == $img) ? 'selected' : '';
            ?>
                <option value="<?= $img ?>" <?= $selected ?>><?= $imgName ?></option>";
            <?php
            }
            ?>
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

        <select id="frameColorDropdown">
            <option value="">Select Frame Color</option>
            <option value="#ffffff">White</option>
            <option value="#000000">Black</option>
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
        const frameColorDropdown = document.getElementById('frameColorDropdown');

        let renderer, canvas, scene, camera, stats, groupFrame, cropper, cropedImage;
        let currentBaseFrame, currentTopFrame;
        const frames = {};

        const singleStandDaeFiles = <?php echo !empty($singleStandDaeFiles) ? json_encode($singleStandDaeFiles) : ''; ?>;
        const frameTop1Names = <?php echo !empty($frameTop1Names) ? json_encode($frameTop1Names) : ''; ?>;
        const frameMainNames = <?php echo !empty($frameMainNames) ? json_encode($frameMainNames) : ''; ?>;
        const allFrameBorderNames = <?php echo !empty($allFrameBorderNames) ? json_encode($allFrameBorderNames) : ''; ?>;
        const generatedDir = "<?php echo !empty($generatedDir) ? $generatedDir : ''; ?>";


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
            renderer.toneMappingExposure = 1;

            stats = new Stats();
            container.appendChild(stats.dom);

            scene = new THREE.Scene();
            groupFrame = new THREE.Group();


            camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 2, 1000);
            camera.position.z = 120;

            const controls = new OrbitControls(camera, canvas);
            controls.update();

            // Ambient Light
            const ambientLight = new THREE.AmbientLight(0xffffff, 1); // Adjust intensity
            scene.add(ambientLight);



            // Load Collada file
            const loader = new ColladaLoader();
            // loadObjects(daeUrl, numObjects); // Load the initial object
            for (const [key, value] of Object.entries(singleStandDaeFiles)) {
                // console.log(key)
                loader.load('.' + generatedDir + value.fileName, function(collada) {
                    frames[key] = collada.scene;
                    frames[key].scale.set(0.4, 0.4, 0.4);
                    computeBoundingBox(frames[key]);
                    checkAndAddToGroup();
                });
            };
            // loader.load('./assets/models/frame_main.dae', function(collada) {
            //     frameMain = collada.scene;
            //     frameMain.scale.set(0.4, 0.4, 0.4);
            //     computeBoundingBox(frameMain);
            //     checkAndAddToGroup();
            // });
            // loader.load('./assets/models/frame_base1.dae', function(collada) {
            //     frameBase1 = collada.scene;
            //     frameBase1.scale.set(0.4, 0.4, 0.4);
            //     computeBoundingBox(frameBase1);
            //     checkAndAddToGroup();
            // });
            // loader.load('./assets/models/frame_base2.dae', function(collada) {
            //     frameBase2 = collada.scene;
            //     frameBase2.scale.set(0.4, 0.4, 0.4);
            //     computeBoundingBox(frameBase2);
            //     checkAndAddToGroup();
            // });

            // loader.load('./assets/models/frame_top.dae', function(collada) {
            //     frameTop1 = collada.scene;
            //     frameTop1.scale.set(0.4, 0.4, 0.4);
            //     computeBoundingBox(frameTop1);
            //     checkAndAddToGroup();
            // });

            // Directional Light
            const directionalLight = new THREE.DirectionalLight(0x000000, 0.5);
            directionalLight.position.set(1, 1, 1).normalize();
            scene.add(directionalLight);

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
                innerDropdown.addEventListener('change', updateTextures);
            }

            const borderDropdown = document.getElementById('borderTextureDropdown');
            if (borderDropdown) {
                borderDropdown.addEventListener('change', updateTextures);
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

            if (frameColorDropdown) {
                frameColorDropdown.addEventListener('change', event => {
                    const color = event.target.value;                    
                    updateBaseFrameColor(currentBaseFrame, color);
                });
            }

        }

        function updateBaseFrameColor(frame, color) {
            console.log(color)
            console.log(frame)
            // Traverse each mesh in the frame
            frame.traverse(child => {
                // if (child.isMesh) {
                    // Ensure the mesh has a material
                    if (child.material) {
                        const canvas = document.createElement('canvas');
                        canvas.width = frame.width;
                        canvas.height = frame.height;
                        const context = canvas.getContext('2d');

                        // Fill the canvas with a background color
                        context.fillStyle = color; // e.g., '#ff0000' for red
                        context.fillRect(0, 0, canvas.width, canvas.height);
                        const texture = new THREE.Texture(canvas);
                        console.log(texture)
                        child.material.map = texture;
                        child.material.needsUpdate = true;
                        // Handle single material
                        // if (child.material instanceof THREE.MeshStandardMaterial) {
                        //     child.material.map = null;
                        //     child.material.color.set(color);
                        //     child.material.needsUpdate = true;
                        // }
                        // // Handle multiple materials
                        // else if (Array.isArray(child.material)) {
                        //     child.material.forEach(mat => {
                        //         if (mat instanceof THREE.MeshStandardMaterial) {
                        //             mat.map = null;
                        //             mat.color.set(color);
                        //             mat.needsUpdate = true;
                        //         }
                        //     });
                        // }
                    }
                // }
            });
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
            // console.log(object);
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
            if (frames.frameBase1 && frames.frameBase2 && frames.frameMain && frames.frameTop1) {

                groupFrame.add(frames.frameMain);

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
            updateBaseFrameColor(currentBaseFrame, '#ffffff')

            groupFrame.add(currentBaseFrame);

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
                    var material = new THREE.MeshStandardMaterial();
                    mesh.material.map = texture;
                    mesh.material.needsUpdate = true;
                    mesh.material.toneMapped = true;

                    // if (Array.isArray(mesh.material)) {
                    //     // If the mesh has multiple materials
                    //     mesh.material.forEach(mat => {
                    //         mat.map = texture;
                    //         mat.map.wrapS = THREE.RepeatWrapping;
                    //         mat.map.wrapT = THREE.RepeatWrapping;
                    //         mat.needsUpdate = true;
                    //     });
                    // } else {
                    //     // If the mesh has a single material
                    //     mesh.material.map = texture;
                    //     mesh.material.map.wrapS = THREE.RepeatWrapping;
                    //     mesh.material.map.wrapT = THREE.RepeatWrapping;
                    //     mesh.material.needsUpdate = true;
                    // }
                }
            }
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

            frames.frameTop1.traverse(function(child) {
                updateTexture(child, texture, frameTop1Names)
            });
            renderer.render(scene, camera);

        }

        function updateAllFrameBorderTexture(textureURL, isBorder) {
            const texture = new THREE.TextureLoader().load(textureURL);

            // Apply texture to top frame
            if (frames.frameTop1) {
                frames.frameTop1.traverse(function(child) {
                    updateTexture(child, texture, allFrameBorderNames)
                });
            }

            // Apply texture to main frame
            if (frames.frameMain) {
                frames.frameMain.traverse(function(child) {
                    updateTexture(child, texture, allFrameBorderNames)
                });
            }

            // Apply texture to main frame
            if (frames.frameBase1) {
                frames.frameBase1.traverse(function(child) {
                    updateTexture(child, texture, allFrameBorderNames)
                });
            }
            // Apply texture to main frame
            if (frames.frameBase2) {
                frames.frameBase2.traverse(function(child) {
                    updateTexture(child, texture, allFrameBorderNames)
                });
            }

            renderer.render(scene, camera);
        }

        function updateMainFrameImageTexture(textureURL, isBorder) {
            const texture = new THREE.TextureLoader().load(textureURL);

            // Apply texture to main frame
            if (frames.frameMain) {
                frames.frameMain.traverse(function(child) {
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
            location.href = location.pathname;

            // groupFrame.scale.set(1, 1, 1);
            // groupFrame.rotation.set(0, 0, 0);
            // groupFrame.position.set(0, 0, 0);
        }

        document.getElementById('innerTextureDropdown').addEventListener('change', updateTextures);
        document.getElementById('borderTextureDropdown').addEventListener('change', updateTextures);

        function updateTextures() {
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
    </script>
</body>

</html>