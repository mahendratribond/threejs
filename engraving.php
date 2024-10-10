<!DOCTYPE html>
<html>
<head>
    <title>Texture Selector</title>
    <style>
        body {
            padding: 0;
            margin: 0;
        }

        #drawing-canvas {
            position: absolute;
            background-color: #000;
            top: 0px;
            right: 0px;
            z-index: 3;
        }

        #threejs-container {
            position: absolute;
            left: 0px;
            top: 0px;
            width: 100%;
            height: 100%;
            z-index: 1;
        }
    </style>
</head>
<body>
    <canvas id="drawing-canvas" height="128" width="128"></canvas>
    <div id="threejs-container"></div>

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
        import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
        import { ColladaLoader } from 'three/addons/loaders/ColladaLoader.js';

        var camera, scene, renderer, mesh, material, stats;
        var drawStartPos = { x: 0, y: 0 };

        init();
        setupCanvasDrawing();
        animate();

        function init() {
            // Renderer.
            renderer = new THREE.WebGLRenderer();
            renderer.setSize(window.innerWidth, window.innerHeight);
            document.getElementById('threejs-container').appendChild(renderer.domElement);

            // Create camera.
            camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
            camera.position.z = 400;

            // Create scene.
            scene = new THREE.Scene();

            // Create material
            material = new THREE.MeshStandardMaterial({
                normalMap: new THREE.Texture(), // Initialize the normal map
                normalScale: new THREE.Vector2(1, 1) // Adjust this value to control the normal map intensity
            });

            // Create cube and add to scene.
            var geometry = new THREE.BoxGeometry(200, 200, 200);
            mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);

            // Create ambient light and add to scene.
            var light = new THREE.AmbientLight(0x404040); // soft white light
            scene.add(light);

            // Create directional light and add to scene.
            var directionalLight = new THREE.DirectionalLight(0xffffff);
            directionalLight.position.set(1, 1, 1).normalize();
            scene.add(directionalLight);

            // Add listener for window resize.
            window.addEventListener('resize', onWindowResize, false);

            // Add stats to page.
            stats = new Stats();
            document.body.appendChild(stats.dom);
        }

        function setupCanvasDrawing() {
            var drawingCanvas = document.getElementById('drawing-canvas');
            var drawingContext = drawingCanvas.getContext('2d');

            drawingContext.fillStyle = "#FFFFFF";
            drawingContext.fillRect(0, 0, 128, 128);

            material.normalMap = new THREE.Texture(drawingCanvas);

            var paint = false;

            drawingCanvas.addEventListener('mousedown', function(e) {
                paint = true
                drawStartPos = { x: e.offsetX, y: e.offsetY };
            });
            drawingCanvas.addEventListener('mousemove', function(e) {
                if (paint) {
                    draw(drawingContext, e.offsetX, e.offsetY);
                }
            });
            drawingCanvas.addEventListener('mouseup', function(e) {
                paint = false;
            });
            drawingCanvas.addEventListener('mouseleave', function(e) {
                paint = false;
            });
        }

        function draw(drawContext, x, y) {
            drawContext.strokeStyle = "#000000";
            drawContext.lineWidth = 2;
            drawContext.beginPath();
            drawContext.moveTo(drawStartPos.x, drawStartPos.y);
            drawContext.lineTo(x, y);
            drawContext.stroke();
            drawStartPos = { x: x, y: y };
            material.normalMap.needsUpdate = true;
        }

        function animate() {
            requestAnimationFrame(animate);
            mesh.rotation.x += 0.005;
            mesh.rotation.y += 0.01;
            renderer.render(scene, camera);
            stats.update();
        }

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
    </script>
</body>
</html>
