import {
    THREE,
    TransformControls,
    updateVariable,
    frameTop1Names,
    frameMainNames,
    allModelNames,
    allGroupNames,
    hangerNames,
    rackNames,
    modelQueue,
    GLTFExporter,
    params,
    setting,
    allGroups,
    sharedParams,
} from "../../config.js";
import {
    addHangers,
    cloneWithCustomHangerProperties,
    // setupHangerModel,
    setupHangerGolfClubModel,
} from "./HangerManager.js";
import { savePdfData, traverseAsync,delay } from "../../utils6.js";

async function cloneModelGroup(model) {
    let cloneModelGroup = model.clone();
    let CloneArr = [];
    await traverseAsync(cloneModelGroup, async (node) => {
        if (node.visible && node.name.startsWith("Hanger_")) {
            // console.log(node);
            node.parent.remove(node);
        }
    });
    await traverseAsync(cloneModelGroup, async (node) => {
        if (node.visible && node.name.startsWith("Model_")) {
            CloneArr.push(node);
        }
    });
    // Process each node in CloneArr to remove invisible children
    CloneArr.forEach((node) => {
        node.children.slice().forEach((childNode) => {
            if (!childNode.visible) {
                if (childNode.parent) {
                    childNode.parent.remove(childNode);
                } else {
                    const index = node.children.indexOf(childNode);
                    if (index !== -1) {
                        node.children.splice(index, 1);
                    }
                }
            } else if (childNode.name == "Cone") {
                childNode.parent.remove(childNode);
            }
        });
    });
    // console.log(CloneArr);

    return CloneArr;
}
async function cloneMainModelGroup(model) {
    let cloneModelGroup = model.clone();
    let CloneArr = [];
    // Traverse to find visible models that start with "Model_"
    await traverseAsync(cloneModelGroup, async (node) => {
        if (node.visible && node.name.startsWith("Hanger_")) {
            node.parent.remove(node);
        }
    });
    cloneModelGroup.children.forEach(async (child) => {
        await child.traverse((node) => {
            if (node.visible && node.name.startsWith("Model_")) {
                CloneArr.push(node);
            }
        });
    });
    // Process each node in CloneArr to remove invisible children and unnecessary nodes
    CloneArr.forEach((node) => {
        node.children.slice().forEach((childNode) => {
            if (!childNode.visible) {
                // Remove invisible child nodes
                childNode.parent.remove(childNode);
            } else if (childNode.name === "Cone") {
                // Remove nodes named "Cone"
                childNode.parent.remove(childNode);
            }
        });
    });
    // Calculate combined bounding box for all models in CloneArr
    const combinedBox = new THREE.Box3();
    CloneArr.forEach((node) => {
        const nodeBox = new THREE.Box3().setFromObject(node);
        combinedBox.union(nodeBox); // Expand the combined bounding box to include this model's bounding box
    });
    return combinedBox;
}

async function renderAndDownload(
    viewName,
    tempCamera,
    tempRenderer,
    name,
    imagesNameArr
) {
    // Store original renderer size and camera properties
    const originalWidth = tempRenderer.domElement.width;
    const originalHeight = tempRenderer.domElement.height;
    const originalAspect = tempCamera.aspect;
    const originalPosition = tempCamera.position.clone();
    const originalRotation = tempCamera.rotation.clone();
    const originalQuaternion = tempCamera.quaternion.clone();
    try {
        // Set higher resolution (2x or 3x the original resolution)
        let scaleFactor = 3; // Default scale factor

        if (
            (viewName === "diagonal" || viewName === "wholeModel") &&
            originalWidth * 3 > 5000
        ) {
            scaleFactor = 2;
        } else if (
            viewName === "front" &&
            (originalWidth >= 3000 || originalWidth * 3 > 5000)
        ) {
            scaleFactor = 2;
        }
        tempRenderer.setSize(
            originalWidth * scaleFactor,
            originalHeight * scaleFactor,
            true
        );

        // Update camera aspect and projection matrix
        tempCamera.aspect =
            (originalWidth * scaleFactor) / (originalHeight * scaleFactor);
        tempCamera.updateProjectionMatrix();
        // Render the scene and capture the screenshot
        tempRenderer.render(sharedParams.scene, tempCamera);
        const screenshotData = tempRenderer.domElement.toDataURL("image/png");
        const unixTime = Math.floor(Date.now() / 1000);

        // Download or save the screenshot
        await downloadScreenshotwithDiffCanvas(
            screenshotData,
            `model-${name}-${viewName}-${unixTime}.png`
        );
        imagesNameArr.push(
            `./screenshots/model-${name}-${viewName}-${unixTime}.png`
        );
    } finally {
        // Restore renderer size
        tempRenderer.setSize(originalWidth, originalHeight, true);

        // Restore camera properties
        tempCamera.aspect = originalAspect;
        tempCamera.position.copy(originalPosition);
        tempCamera.rotation.copy(originalRotation);
        tempCamera.quaternion.copy(originalQuaternion);
        tempCamera.updateProjectionMatrix();
    }
}

async function downloadScreenshotwithDiffCanvas(dataUrl, filename) {
    const croppedImage = await removeBlankSpacesFromImage(dataUrl);
    try {
        const response = await fetch("api.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                image: croppedImage,
                filename: filename,
            }),
        });
        const data = await response.json();
        if (data.success) {
        } else {
            console.error("Error saving screenshot:", data.error);
        }
    } catch (error) {
        console.error("Fetch error:", error);
    }
}

function removeBlankSpacesFromImage(imageSrc) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = imageSrc;
        img.onload = function () {
            // Create a canvas to work with the image
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw the image onto the canvas
            ctx.drawImage(img, 0, 0);

            // Get the image data
            const imageData = ctx.getImageData(
                0,
                0,
                canvas.width,
                canvas.height
            );
            const { data, width, height } = imageData;

            let top = 0,
                bottom = height,
                left = 0,
                right = width;

            // Find the top boundary
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const alpha = data[(y * width + x) * 4 + 3];
                    if (alpha > 0) {
                        top = y;
                        break;
                    }
                }
                if (top !== 0) break;
            }

            // Find the bottom boundary
            for (let y = height - 1; y >= 0; y--) {
                for (let x = 0; x < width; x++) {
                    const alpha = data[(y * width + x) * 4 + 3];
                    if (alpha > 0) {
                        bottom = y;
                        break;
                    }
                }
                if (bottom !== height) break;
            }

            // Find the left boundary
            for (let x = 0; x < width; x++) {
                for (let y = 0; y < height; y++) {
                    const alpha = data[(y * width + x) * 4 + 3];
                    if (alpha > 0) {
                        left = x;
                        break;
                    }
                }
                if (left !== 0) break;
            }

            // Find the right boundary
            for (let x = width - 1; x >= 0; x--) {
                for (let y = 0; y < height; y++) {
                    const alpha = data[(y * width + x) * 4 + 3];
                    if (alpha > 0) {
                        right = x;
                        break;
                    }
                }
                if (right !== width) break;
            }

            // Crop dimensions
            const cropWidth = right - left + 1;
            const cropHeight = bottom - top + 1;

            // Draw the cropped image
            const croppedCanvas = document.createElement("canvas");
            const croppedCtx = croppedCanvas.getContext("2d");
            croppedCanvas.width = cropWidth;
            croppedCanvas.height = cropHeight;

            croppedCtx.drawImage(
                canvas,
                left,
                top,
                cropWidth,
                cropHeight,
                0,
                0,
                cropWidth,
                cropHeight
            );

            // Convert cropped canvas to a new image
            const croppedImage = croppedCanvas.toDataURL();
            resolve(croppedImage); // Resolve the promise with the cropped image as a data URL
        };

        img.onerror = reject; // In case of an error, reject the promise
    });
}

async function captureFixtureImage(
    tempCamera,
    tempRenderer,
    model,
    MainmodelName,
    imagesNameArr
) {
    console.log("here 1")
    for (const modelChild of model.children) {
        console.log("here 2");
        if (!modelChild.visible) continue;
        const CloneModel = modelChild.clone();
        await cloneWithCustomHangerProperties(modelChild, CloneModel);
        const Frame = CloneModel.getObjectByName("Frame");
        for (const child of Frame.children) {
            console.log("here 3", child);
            if (child.name.startsWith("Hanger_")) {
                console.log("here 4");
                let HangerModel;
                await traverseAsync(child, async (subChild) => {
                    if (
                        subChild.parent.name !== "Frame" &&
                        subChild.name !== "Hanger_Stand" &&
                        subChild.name !== "Hanger_StandX" &&
                        subChild.parent !== null
                    ) {
                        console.log("here ", subChild);
                        subChild.parent.remove(subChild);
                    } else if (
                        subChild.name !== "Hanger_Stand" &&
                        subChild.name !== "Hanger_StandX"
                    ) {
                        console.log("here ", subChild);
                        subChild.visible = false;
                    } else {
                        HangerModel = subChild;
                    }
                });
                console.log("here 5", HangerModel);
                const hangerNames = imagesNameArr
                    .map((url) => url.split("/").pop()) // Get the file name
                    .filter(
                        (name) =>
                            name.includes("Hanger") &&
                            name.includes(MainmodelName)
                    ) // Check for "Hanger" and "MainmodelName"
                    .map((name) => name.split("-")[2]); // Extract the part starting with "Hanger"
                if (!hangerNames.includes(child.name) && HangerModel) {
                    modelChild.visible = false; // hide the model
                    HangerModel.rotation.y = Math.PI;
                    HangerModel.name = "hangerForPreview_";
                    sharedParams.scene.add(HangerModel);
                    const box = new THREE.Box3().setFromObject(HangerModel);
                    const size = box.getSize(new THREE.Vector3());
                    const center = box.getCenter(new THREE.Vector3());
                    if (child.name === "Hanger_Rail_Step") {
                        tempRenderer.setSize((size.x + size.z) * 5, size.z * 5);
                    } else if (child.name === "Hanger_Rail_Single") {
                        tempRenderer.setSize((size.x + size.z) * 4, size.z * 4);
                    } else if (child.name === "Hanger_Rail_D_500mm") {
                        tempRenderer.setSize(size.x * 2, (size.x + size.y) * 2);
                    } else if (child.name === "Hanger_Rail_D_1000mm") {
                        tempRenderer.setSize(
                            size.x * 1.5,
                            (size.x + size.y) * 2
                        );
                    } else {
                        tempRenderer.setSize((size.x + size.z) * 3, size.z * 3);
                    }
                    const maxDim = Math.max(size.x, size.y, size.x);
                    const cameraDistance = maxDim + 350; // Adjust multiplier as needed
                    tempCamera.position.set(
                        center.x + cameraDistance, // Offset in X for diagonal perspective
                        center.y + 200, // Offset in Y for better centering
                        center.z + (cameraDistance + 500) // Offset in Z for distance
                    );
                    tempCamera.lookAt(center);
                    console.log("here again");
                    
                    await renderAndDownload(
                        child.name,
                        tempCamera,
                        tempRenderer,
                        MainmodelName,
                        imagesNameArr
                    );
                    sharedParams.scene.remove(HangerModel);
                    modelChild.visible = true;
                }
            }
        }
    }
}

function cloneRenderer() {
    // Create a new WebGLRenderer with the same parameters as the original
    const parameters = {
        // antialias: sharedParams.renderer.antialias,
        // alpha: sharedParams.renderer.alpha,
        // precision: sharedParams.renderer.precision,
        // stencil: sharedParams.renderer.stencil,
        // preserveDrawingBuffer: sharedParams.renderer.preserveDrawingBuffer,
        // powerPreference: sharedParams.renderer.powerPreference,
    };

    const newRenderer = new THREE.WebGLRenderer(parameters);

    // Copy size
    const size = sharedParams.renderer.getSize(new THREE.Vector2());
    newRenderer.setSize(size.width, size.height, false);

    // Copy pixel ratio
    newRenderer.setPixelRatio(sharedParams.renderer.getPixelRatio());
    newRenderer.toneMapping = THREE.NoToneMapping;
    return newRenderer;
}

async function captureModelImages() {
    let imagesNameArr = [];
    sharedParams.scene.background = null; // No background color for transparency

    // Store original camera position and rotation
    const originalPosition = sharedParams.camera.position.clone();
    const originalRotation = sharedParams.camera.rotation.clone();
    const originalQuaternion = sharedParams.camera.quaternion.clone();

    // Calculate bounding box for the model group
    const Outerbox = await cloneMainModelGroup(sharedParams.modelGroup);
    const outerSize = Outerbox.getSize(new THREE.Vector3());
    const outerCenter = Outerbox.getCenter(new THREE.Vector3());
    const maxDim = Math.max(outerSize.x, outerSize.y, outerSize.z);
    const fov = sharedParams.camera.fov * (Math.PI / 180);

    // Adjusted distance calculation - reduced divisor for closer view
    const distance = Math.abs(maxDim / Math.sin(fov / 2) / 2.5); // Changed from 1.5 to 3.5 for closer view

    // Optional: Add a slight elevation to the camera
    const heightOffset = outerSize.y * 0.1; // 10% of model height

    for (const model of sharedParams.modelGroup.children) {
        let isCorn = false;
        sharedParams.renderer.setClearColor(0x000000, 0);

        // Hide Cone if present
        for (const modelChild of model.children) {
            if (modelChild.visible) {
                modelChild.traverse((node) => {
                    if (node.name === "Cone" && node.visible === true) {
                        isCorn = true;
                        node.visible = false;
                    }
                });
            }
        }

        // Hide other models
        sharedParams.scene.children.forEach((childScene) => {
            if (childScene.name === "main_group") {
                childScene.children.forEach((child) => {
                    if (child.name !== model.name) {
                        child.visible = false;
                    }
                });
            }
        });

        // Step 1: Calculate the bounding box for the current model
        let modelSize = await cloneModelGroup(model);
        const box = new THREE.Box3().setFromObject(modelSize[0]);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // Prepare a temporary canvas for rendering
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = size.x;
        tempCanvas.height = size.y;
        const tempRenderer = cloneRenderer();
        tempRenderer.setSize(tempCanvas.width * 1.2, tempCanvas.height * 1.2);
        tempRenderer.setClearColor(0x000000, 0);

        // Set up an orthographic camera based on the bounding box size
        const frontCamera = new THREE.OrthographicCamera(
            -size.x / 2,
            size.x / 2,
            size.y / 2,
            -size.y / 2,
            0.5,
            10000
        );

        // Step 2a: Front view - Set the camera position to capture the front of the model
        frontCamera.position.set(center.x, center.y, center.z + 700 + 2000); // Increase the z-distance
        frontCamera.lookAt(center);
        await renderAndDownload(
            "front",
            frontCamera,
            tempRenderer,
            model.name,
            imagesNameArr
        );

        // Side view
        tempCanvas.width = 1602;
        tempCanvas.height = 2005;
        tempRenderer.setSize(tempCanvas.width, tempCanvas.height);
        const sideCamera = new THREE.OrthographicCamera(
            -1602,
            1602,
            2005,
            -2005,
            1,
            10000
        );
        // Position the camera along the positive X-axis for a side view
        const sideViewDistance = size.x + 1000;
        sideCamera.position.set(
            center.x + sideViewDistance,
            center.y,
            center.z
        );
        sideCamera.lookAt(center);

        // Wait for side view render to complete
        await renderAndDownload(
            "side",
            sideCamera,
            tempRenderer,
            model.name,
            imagesNameArr
        );

        // Step 2c: Diagonal view - Adjust the camera position to capture a diagonal angle of the model
        tempCanvas.width = size.x + size.z; // Use both x and z to ensure a wide view
        tempCanvas.height = size.y; // Use both y and z for better height coverage
        tempRenderer.setSize(tempCanvas.width, tempCanvas.height);
        const diagonalCamera = new THREE.PerspectiveCamera(
            45,
            size.x / size.y,
            100,
            100000
        );

        const maxDim = Math.max(size.x, size.y, size.z); // Largest dimension
        const cameraDistance = maxDim + 350; // Adjust multiplier as needed

        diagonalCamera.position.set(
            center.x + cameraDistance, // Offset in X for diagonal perspective
            center.y, // Offset in Y for better centering
            center.z + cameraDistance + 500 // Offset in Z for distance
        );

        diagonalCamera.lookAt(center);
        await renderAndDownload(
            "diagonal",
            diagonalCamera,
            tempRenderer,
            model.name,
            imagesNameArr
        );

        diagonalCamera.position.set(
            center.x + cameraDistance, // Offset in X for diagonal perspective
            center.y + 100, // Offset in Y for better centering
            center.z + cameraDistance + 500 // Offset in Z for distance
        );

        await captureFixtureImage(
            diagonalCamera,
            tempRenderer,
            model,
            model.name,
            imagesNameArr
        );

        // Restore visibility
        sharedParams.scene.children.forEach((childScene) => {
            if (childScene.name === "main_group") {
                childScene.children.forEach((child) => {
                    child.visible = true;
                });
            }
        });

        // Restore Cone visibility
        if (isCorn) {
            for (const modelChild of model.children) {
                modelChild.traverse((node) => {
                    if (node.name === "Cone") {
                        node.visible = true;
                    }
                });
            }
        }
    }

    for (const modelChild of sharedParams.modelGroup.children) {
        modelChild.traverse((node) => {
            if (node.name === "Cone") {
                node.visible = false;
            }
        });
    }

    const wholeModelDistance = distance + 1000; // Slightly closer for wholeModel view
    sharedParams.camera.position.set(
        wholeModelDistance * Math.cos(Math.PI / 4) + 500,
        heightOffset,
        wholeModelDistance * Math.cos(Math.PI / 4) + 500
    );
    sharedParams.camera.lookAt(outerCenter);
    await renderAndDownload(
        "wholeModel",
        sharedParams.camera,
        sharedParams.renderer,
        sharedParams.modelGroup.name,
        imagesNameArr
    );

    // Restore original camera position and rotation
    sharedParams.camera.position.copy(originalPosition);
    sharedParams.camera.rotation.copy(originalRotation);
    sharedParams.camera.quaternion.copy(originalQuaternion);

    // Restore scene background
    sharedParams.scene.backgroundBlurriness = params.blurriness;
    sharedParams.texture_background.mapping =
        THREE.EquirectangularReflectionMapping;
    sharedParams.scene.background = sharedParams.texture_background;
    sharedParams.scene.environment = sharedParams.texture_background;

    return imagesNameArr;
}

export async function creatingPDF() {
    sharedParams.transformControls.detach();
    await traverseAsync(sharedParams.modelGroup, async (child) => {
        if (
            hangerNames.includes(child.name) &&
            child.hangerArrayKey &&
            child.hangerCount
        ) {
            params.hangerAdded = params.hangerAdded || {};
            params.hangerAdded[child.hangerArrayKey] =
                params.hangerAdded[child.hangerArrayKey] || {};
            params.hangerAdded[child.hangerArrayKey][child.hangerCount] =
                child.position;
        }
        if (
            rackNames.includes(child.name) &&
            child.rackArrayKey &&
            child.rackCount
        ) {
            // console.log("params.rackAdded", params.rackAdded);
            // console.log("child", child);
            // console.log("child.name", child.name);

            params.rackAdded = params.rackAdded || {};
            params.rackAdded[child.rackArrayKey] =
                params.rackAdded[child.rackArrayKey] || {};
            params.rackAdded[child.rackArrayKey][child.rackCount] =
                child.position;
        }
    });
    let ModelImageName = await captureModelImages();

    const dataToSave = {
        params: params || null,
        setting: setting || null,
        group_names: allGroupNames || null,
        top_frame_croped_image: sharedParams.topFrameCropedImage || null,
        main_frame_croped_image: sharedParams.mainFrameCropedImage || null,
        ModelImageName: ModelImageName || null,
    };
    await delay(1000);
    await savePdfData(dataToSave, sharedParams.modelGroup);
}
