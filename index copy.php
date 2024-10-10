<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>3D Frame</title>
    <style>
        body { margin: 0; }
        canvas { display: block; }
    </style>
</head>
<body>
    <div>
        <select id="base-selector">
            <option value="frame_base1">Base Frame 1</option>
            <option value="frame_base2">Base Frame 2</option>
        </select>
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
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
        import { ColladaLoader } from 'three/addons/loaders/ColladaLoader.js';

        let scene, camera, renderer, loader;
        let group = new THREE.Group();
        let frameBase1, frameBase2, frameMain, frameTop;
        let currentBaseFrame;

        init();
        loadModels();

        function init() {
            scene = new THREE.Scene();

            // Add lights
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            scene.add(ambientLight);
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
            directionalLight.position.set(1, 1, 1).normalize();
            scene.add(directionalLight);

            camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.z = 100;

            renderer = new THREE.WebGLRenderer();
            renderer.setSize(window.innerWidth, window.innerHeight);
            document.body.appendChild(renderer.domElement);

            const controls = new OrbitControls(camera, renderer.domElement);
            controls.minDistance = 50;
            controls.maxDistance = 200;
            // controls.update();

            loader = new ColladaLoader();
        }

        function loadModels() {
            loader.load('./assets/models/frame_base1.dae', function (collada) {
                frameBase1 = collada.scene;
                frameBase1.scale.set(1, 1, 1); // Adjust scaling
                computeBoundingBox(frameBase1);
                console.log('Loaded frame_base1:', frameBase1);
                checkAndAddToGroup();
            });

            loader.load('./assets/models/frame_base2.dae', function (collada) {
                frameBase2 = collada.scene;
                frameBase2.scale.set(1, 1, 1); // Adjust scaling
                computeBoundingBox(frameBase2);
                console.log('Loaded frame_base2:', frameBase2);
                checkAndAddToGroup();
            });

            loader.load('./assets/models/frame_main.dae', function (collada) {
                frameMain = collada.scene;
                // frameMain.position.y = -25;
                frameMain.scale.set(1, 1, 1); // Adjust scaling
                computeBoundingBox(frameMain);
                console.log('Loaded frame_main:', frameMain);
                checkAndAddToGroup();
            });

            loader.load('./assets/models/frame_top.dae', function (collada) {
                frameTop = collada.scene;
                frameTop.scale.set(1, 1, 1); // Adjust scaling
                computeBoundingBox(frameTop);
                console.log('Loaded frame_top:', frameTop);
                checkAndAddToGroup();
            });
        }

        function computeBoundingBox(object) {
            const box = new THREE.Box3();
            object.traverse(function (child) {
                if (child.isMesh) {
                    child.geometry.computeBoundingBox();
                    box.expandByObject(child);
                }
            });
            object.userData.boundingBox = box;
            console.log('Computed bounding box:', box);
        }

        function checkAndAddToGroup() {
            if (frameBase1 && frameBase2 && frameMain && frameTop) {
                group.add(frameMain);

                const mainBox = frameMain.userData.boundingBox;
                frameTop.position.y = mainBox.max.y;
                group.add(frameTop);

                switchBaseFrame(getQueryStringParam('base') || 'frame_base1');

                scene.add(group);

                // Add bounding box helper
                const boxHelper = new THREE.BoxHelper(group, 0xff0000);
                scene.add(boxHelper);

                // Center the camera
                const box = new THREE.Box3().setFromObject(group);
                const center = new THREE.Vector3();
                box.getCenter(center);
                group.position.sub(center); // Center the group

                camera.position.set(0, 0, 10); // Adjust camera position
                camera.lookAt(center);

                animate();
            }
        }

        function switchBaseFrame(baseFrame) {
            if (currentBaseFrame) {
                group.remove(currentBaseFrame);
            }

            const mainBox = frameMain.userData.boundingBox;
            let baseBox;

            if (baseFrame === 'frame_base2') {
                currentBaseFrame = frameBase2;
                baseBox = frameBase2.userData.boundingBox;
            } else {
                currentBaseFrame = frameBase1;
                baseBox = frameBase1.userData.boundingBox;
            }

            // currentBaseFrame.position.y = mainBox.min.y - baseBox.max.y;
            group.add(currentBaseFrame);
            console.log('Switched base frame to:', baseFrame);

            // Update bounding box helper
            const boxHelper = new THREE.BoxHelper(group, 0xff0000);
            scene.add(boxHelper);
        }

        function animate() {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        }

        function getQueryStringParam(param) {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get(param);
        }

        document.getElementById('base-selector').addEventListener('change', function (event) {
            switchBaseFrame(event.target.value);
        });
    </script>
</body>
</html>
