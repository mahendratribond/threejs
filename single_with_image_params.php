<?php
$innerName = $borderName = $fileName = '';
$originalFileName = 'texture2';
$innerImages = ["adidas.jpg", "tree1.jpeg", "sunset.jpeg", "sunset2.webp", "mount.jpeg", "trees.jpg"];
$borderImages = ["Light_Wood.jpg", "Red_Cherry_Wood.jpg", "Lighter_Wood.jpg", "Dark_Wood.jpg"];

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
    if (!file_exists($outputDaePath)) {
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
        let elf;
        const fileName = "<?php echo !empty($fileName) ? 'generated/' . $fileName : $originalFileName ?>";
        const daeUrl = `./assets/models/${fileName}.dae`;

        let params = {
            scale: 0.4,
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

            camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight);
            camera.position.z = 120;

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

            const loader = new ColladaLoader();
            loader.load(daeUrl, function(collada) {
                elf = collada.scene;
                elf.scale.set(0.4, 0.4, 0.4);
                elf.position.y = -25;
                scene.add(elf);
            });

            window.addEventListener('resize', onWindowResize);

            const gui = new GUI();
            gui.add(params, 'scale', 0.1, 5).onChange(updateScale);
            gui.add(params, 'rotateX', -Math.PI, Math.PI).onChange(value => updateRotation('rotateX', value));
            gui.add(params, 'rotateY', -Math.PI, Math.PI).onChange(value => updateRotation('rotateY', value));
            gui.add(params, 'rotateZ', -Math.PI, Math.PI).onChange(value => updateRotation('rotateZ', value));
            gui.add(params, 'moveX', -100, 100).onChange(value => updatePosition('moveX', value));
            gui.add(params, 'moveY', -100, 100).onChange(value => updatePosition('moveY', value));
            gui.add(params, 'moveZ', -100, 100).onChange(value => updatePosition('moveZ', value));
            gui.add(params, 'clear');

            window.addEventListener('keydown', onKeyDown);


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
            elf.scale.set(value, value, value);
        }

        function updateRotation(axis, value) {
            if (elf) {
                switch (axis) {
                    case 'rotateX':
                        elf.rotation.x = value;
                        break;
                    case 'rotateY':
                        elf.rotation.y = value;
                        break;
                    case 'rotateZ':
                        elf.rotation.z = value;
                        break;
                }
            }
        }

        function updatePosition(axis, value) {
            if (elf) {
                switch (axis) {
                    case 'moveX':
                        elf.position.x = value;
                        break;
                    case 'moveY':
                        elf.position.y = value;
                        break;
                    case 'moveZ':
                        elf.position.z = value;
                        break;
                }
            }
        }

        function onKeyDown(event) {
            if (!elf) return;

            const step = 1;
            const rotationStep = 0.1;

            switch (event.key) {
                case 'ArrowUp':
                    elf.position.y += step;
                    break;
                case 'ArrowDown':
                    elf.position.y -= step;
                    break;
                case 'ArrowLeft':
                    elf.position.x -= step;
                    break;
                case 'ArrowRight':
                    elf.position.x += step;
                    break;
                case 'w':
                    elf.position.y += step;
                    break;
                case 's':
                    elf.position.y -= step;
                    break;
                case 'a':
                    elf.position.x -= step;
                    break;
                case 'd':
                    elf.position.x += step;
                    break;
                case 't':
                    elf.rotation.y -= rotationStep;
                    break;
                case 'g':
                    elf.rotation.y += rotationStep;
                    break;
                case 'r':
                    elf.rotation.x -= rotationStep;
                    break;
                case 'f':
                    elf.rotation.x += rotationStep;
                    break;
                case 'q':
                    elf.rotation.z -= rotationStep;
                    break;
                case 'e':
                    elf.rotation.z += rotationStep;
                    break;
                case '=': 
                case '+': 
                    elf.scale.multiplyScalar(1.1);
                    break;
                case '-':
                    elf.scale.multiplyScalar(0.9);
                    break;
            }
        }

        document.getElementById('applyTextures').addEventListener('click', function() {
            const innerTexture = document.getElementById('innerTextureDropdown').value;
            const borderTexture = document.getElementById('borderTextureDropdown').value;

            if (innerTexture && borderTexture) {
                location.href = `?inner=${innerTexture}&border=${borderTexture}`;
            } else {
                alert("Please select both inner and border textures.");
            }
        });

        init();
    </script>
</body>

</html>