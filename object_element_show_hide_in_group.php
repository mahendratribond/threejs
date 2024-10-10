<?php

$debug_mode = false;

$borderName = $innerName = $fileName = '';
$numObjects = 1;
$originalFileName = 'texture2';
$innerImages = ["adidas.jpg", "tree1.jpeg", "sunset.jpeg", "sunset2.webp", "mount.jpeg", "trees.jpg", "harish_sir.jpg"];
$borderImages = ["Light_Wood.jpg", "Red_Cherry_Wood.jpg", "Lighter_Wood.jpg", "Dark_Wood.jpg"];

$mainNodeBorder = $mainNodeInner = $baseNode = $topNode = [];
$mainNodeBorder = ['_0001-20-001', '_0001-20-002', 'Solid2_1_.2', 'Solid2_1_.1'];
$mainNodeInner = ['Cube.2', 'Cube.1'];
$baseNode = ['Cube'];


$allNodes = array_merge($topNode, $mainNodeBorder, $mainNodeInner, $baseNode);
$mainFrame = $mainNodeInner;
$woodFrame = array_merge($mainNodeBorder, $baseNode);


function getFilename($name)
{
    $imgName = pathinfo($name, PATHINFO_FILENAME);
    $imgName = str_replace(['-', '_'], ' ', $imgName);

    return $imgName;
}

// Handle the generation of the .dae file if query parameters are present
if (isset($_GET['inner']) && isset($_GET['border'])) {
    $innerName = $_GET['inner'];
    $borderName = $_GET['border'];
    $numObjects = !empty($_GET['numObjects']) ? $_GET['numObjects'] : 1;
    $fileName = md5($innerName . $borderName); // Using MD5 hash for unique file names

    // Paths to the original and modified .dae files
    $originalDaePath = __DIR__ . '/assets/models/' . $originalFileName . '.dae';
    $outputDaePath = __DIR__ . '/assets/models/generated/' . $fileName . '.dae';

    // Ensure the output directory exists
    $outputDir = __DIR__ . '/assets/models/generated/';
    if (!is_dir($outputDir)) {
        mkdir($outputDir, 0755, true);
    }

    // Check if the original .dae file exists
    if (!file_exists($originalDaePath)) {
        die("Original .dae file not found.");
    }

    // Check if the modified .dae file exists
    if (!file_exists($outputDaePath) || $debug_mode) {
        // Read the original .dae file
        $daeContent = file_get_contents($originalDaePath);

        // Replace texture paths
        $innerTexturePath = "../../images/inner-images/" . $innerName;
        $borderTexturePath = "../../images/borders/" . $borderName;

        // Update the image paths in the .dae file
        $daeContent = preg_replace('/<image id="ID8">.*?<init_from>.*?<\/init_from>.*?<\/image>/s', '<image id="ID8"><init_from>' . $innerTexturePath . '</init_from></image>', $daeContent);
        $daeContent = preg_replace('/<image id="ID3">.*?<init_from>.*?<\/init_from>.*?<\/image>/s', '<image id="ID3"><init_from>' . $borderTexturePath . '</init_from></image>', $daeContent);

        // Write the modified .dae file
        file_put_contents($outputDaePath, $daeContent);
    }
}
?>
<!DOCTYPE html>
<html>

<head>
    <title>Texture Selector</title>
    <style>
        body {
            margin: 0;
            font-family: Arial, sans-serif;
        }

        #container {
            width: 100vw;
            height: 100vh;
        }

        #info {
            position: absolute;
            top: 50px;
            left: 10px;
            z-index: 1;
        }

        #info label,
        #info select,
        #info input,
        #info button {
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

        #info select {
            padding: 5px;
            font-size: 16px;
        }

        #info button {
            padding: 5px 10px;
            font-size: 16px;
            background: #007bff;
            border: none;
            color: white;
            border-radius: 5px;
        }
    </style>
</head>

<body>
    <div id="container"></div>
    <div id="info">
        <select id="innerTextureDropdown">
            <option value="">Select Inner Texture</option>
            <?php foreach ($innerImages as $img) {
                $imgName = getFilename($img); // Get the filename without extension
                $selected = ($innerName == $img) ? 'selected' : '';
            ?>
                <option value="<?= $img ?>" <?= $selected ?>><?= $imgName ?></option>";
            <?php
            }
            ?>
        </select>

        <select id="borderTextureDropdown">
            <option value="">Select Border Texture</option>
            <?php foreach ($borderImages as $img) {
                $imgName = getFilename($img); // Get the filename without extension
                $selected = ($borderName == $img) ? 'selected' : '';
            ?>
                <option value="<?= $img ?>" <?= $selected ?>><?= $imgName ?></option>";
            <?php
            }
            ?>
        </select>

        <input type="number" id="numObjects" min="1" value="<?php echo !empty($numObjects) ? $numObjects : 1 ?>" placeholder="Number of Objects">


        <button id="applyTextures">Apply Textures</button>
    </div>

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
        let renderer, scene, camera, stats;
        let elfGroup;
        const allNodes = <?php echo !empty($allNodes) ? json_encode($allNodes) : '""'; ?>;
        const mainFrame = <?php echo !empty($mainFrame) ? json_encode($mainFrame) : '""'; ?>;
        const woodFrame = <?php echo !empty($woodFrame) ? json_encode($woodFrame) : '""'; ?>;
        const numObjects = <?php echo !empty($numObjects) ? $numObjects : 1 ?>;
        const fileName = "<?php echo !empty($fileName) ? 'generated/' . $fileName : $originalFileName ?>";
        const daeUrl = `./assets/models/${fileName}.dae`;

        let params = {
            scale: 1,
            rotateX: 0,
            rotateY: 0,
            rotateZ: 0,
            moveX: 0,
            moveY: 0,
            moveZ: 0,
            clear: clear
        };

        function init() {
            renderer = new THREE.WebGLRenderer({
                antialias: true
            });
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setAnimationLoop(animate);
            container.appendChild(renderer.domElement);

            stats = new Stats();
            container.appendChild(stats.dom);

            scene = new THREE.Scene();
            scene.background = new THREE.Color(0xffffff); // 0xffffff is the hex code for white

            // Load and set the background image
            // const loader = new THREE.TextureLoader();
            // loader.load('./assets/images/background/bg1.jpg', function(texture) {
            //     texture.encoding = THREE.sRGBEncoding;
            //     texture.wrapS = THREE.RepeatWrapping;
            //     texture.wrapT = THREE.RepeatWrapping;
            //     texture.repeat.set(1, 1); // Adjust these values if necessary
            //     scene.background = texture;
            // });

            camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight);
            camera.position.z = 180;

            const controls = new OrbitControls(camera, renderer.domElement);
            controls.minDistance = 50;
            controls.maxDistance = 200;

            scene.add(new THREE.AmbientLight(0xffffff));

            const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.5); // Reduced intensity
            dirLight1.position.set(1, 0.75, 0.5);
            scene.add(dirLight1);

            const dirLight2 = new THREE.DirectionalLight(0xffffff, 1.5); // Reduced intensity
            dirLight2.position.set(-1, 0.75, -0.5);
            scene.add(dirLight2);

            elfGroup = new THREE.Group();
            scene.add(elfGroup);

            const gui = new GUI({
                title : 'Object Group',
                closeFolders : true,
            });

            gui.add(params, 'scale', 1).onChange(updateScale).min(0.5).max(2).step(0.1);
            gui.add(params, 'rotateX', -Math.PI, Math.PI).step(1).onChange(value => updateRotation('rotateX', value));
            gui.add(params, 'rotateY', -Math.PI, Math.PI).step(1).onChange(value => updateRotation('rotateY', value));
            gui.add(params, 'rotateZ', -Math.PI, Math.PI).step(1).onChange(value => updateRotation('rotateZ', value));
            gui.add(params, 'moveX', -100, 100).step(1).onChange(value => updatePosition('moveX', value));
            gui.add(params, 'moveY', -100, 100).step(1).onChange(value => updatePosition('moveY', value));
            gui.add(params, 'moveZ', -100, 100).step(1).onChange(value => updatePosition('moveZ', value));
            gui.add(params, 'clear');

            loadObjects(daeUrl, numObjects, gui); // Load the initial object

            window.addEventListener('resize', onWindowResize);
            window.addEventListener('keydown', onKeyDown);
        }

        function loadObjects(url, count, gui) {
            const loader = new ColladaLoader();
            loader.load(url, function(collada) {
                const elf = collada.scene;
                if (!elf) {
                    console.error('Failed to load the scene.');
                    return;
                }

                elf.scale.set(0.4, 0.4, 0.4);
                elf.position.y = -24;

                elfGroup.clear(); // Clear previous objects
                console.log(allNodes)

                for (let i = 0; i < count; i++) {
                    const newElf = elf.clone();
                    newElf.position.x = i * 24.05 - ((count - 1) * 12.025);

                    // if (i % 2 !== 0) {
                    //     // Traverse through the children to selectively remove meshes
                    //     newElf.traverse((child) => {
                    //         if (child.isMesh) {
                    //             if (isInnerPart(child)) {
                    //                 // child.visible = false; // Hide the mesh instead of removing
                    //             }
                    //         }
                    //     });
                    // }

                    const objectsFolder = gui.addFolder(`Texture Objects ${i+1}`);
                    newElf.traverse((child) => {
                        // console.log(child.name)
                        if (allNodes.includes(child.name)) {
                            const checkbox = objectsFolder.add(child, `visible`).name(child.name);
                            checkbox.onChange(visible => {
                                if (newElf && newElf[i]) {
                                    newElf[i].visible = visible;
                                }
                            });
                        }
                    });


                    elfGroup.add(newElf);
                }
            }, undefined, function(error) {
                console.error('An error occurred while loading the Collada model:', error);
            });
        }

        function clear() {
            location.href = location.pathname;
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

        function updateScale(value) {
            elfGroup.scale.set(value, value, value);
        }

        function updateRotation(axis, value) {
            if (elfGroup) {
                switch (axis) {
                    case 'rotateX':
                        elfGroup.rotation.x = value;
                        break;
                    case 'rotateY':
                        elfGroup.rotation.y = value;
                        break;
                    case 'rotateZ':
                        elfGroup.rotation.z = value;
                        break;
                }
            }
        }

        function updatePosition(axis, value) {
            if (elfGroup) {
                switch (axis) {
                    case 'moveX':
                        elfGroup.position.x = value;
                        break;
                    case 'moveY':
                        elfGroup.position.y = value;
                        break;
                    case 'moveZ':
                        elfGroup.position.z = value;
                        break;
                }
            }
        }

        function onKeyDown(event) {
            if (!elfGroup) return;

            const step = 1;
            const rotationStep = 0.1;

            switch (event.key) {
                case 'ArrowUp':
                    elfGroup.position.y += step;
                    break;
                case 'ArrowDown':
                    elfGroup.position.y -= step;
                    break;
                case 'ArrowLeft':
                    elfGroup.position.x -= step;
                    break;
                case 'ArrowRight':
                    elfGroup.position.x += step;
                    break;
                case 'w':
                    elfGroup.position.y += step;
                    break;
                case 's':
                    elfGroup.position.y -= step;
                    break;
                case 'a':
                    elfGroup.position.x -= step;
                    break;
                case 'd':
                    elfGroup.position.x += step;
                    break;
                case 't':
                    elfGroup.rotation.y -= rotationStep;
                    break;
                case 'g':
                    elfGroup.rotation.y += rotationStep;
                    break;
                case 'r':
                    elfGroup.rotation.x -= rotationStep;
                    break;
                case 'f':
                    elfGroup.rotation.x += rotationStep;
                    break;
                case 'q':
                    elfGroup.rotation.z -= rotationStep;
                    break;
                case 'e':
                    elfGroup.rotation.z += rotationStep;
                    break;
                case '=':
                case '+':
                    elfGroup.scale.multiplyScalar(1.1);
                    break;
                case '-':
                    elfGroup.scale.multiplyScalar(0.9);
                    break;
            }
        }

        function isInnerPart(mesh) {
            const innerNames = mainFrame; // Replace with actual names or IDs of inner meshes
            return innerNames.includes(mesh.name);
        }

        function isBorderPart(mesh) {
            const borderNames = woodFrame; // Replace with actual names or IDs of border meshes
            return borderNames.includes(mesh.name);
        }

        document.getElementById('applyTextures').addEventListener('click', function() {
            const innerTexture = document.getElementById('innerTextureDropdown').value;
            const borderTexture = document.getElementById('borderTextureDropdown').value;
            const numObjects = document.getElementById('numObjects').value;

            if (innerTexture && borderTexture) {
                location.href = `?inner=${innerTexture}&border=${borderTexture}&numObjects=${numObjects}`;
            } else {
                alert("Please select both inner and border textures.");
            }
        });

        init();
    </script>
</body>

</html>