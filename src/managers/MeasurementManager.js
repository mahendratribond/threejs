import {
    THREE,
    params,
    CSS2DObject,
    sharedParams,
    CSS2DRenderer,
    allModelNames,
    heightMeasurementNames,
} from "../../config.js";
import {traverseAsync} from "../../utils6.js"
export async function getCurrentModelSize(model, node) {
    const cubeNode = model.getObjectByName(node);
    return getNodeSize(cubeNode);
}

export function getNodeSize(cubeNode) {
    if (cubeNode) {
        const boundingBox = new THREE.Box3().setFromObject(cubeNode);
        const size = boundingBox.getSize(new THREE.Vector3());
        return size; // Returns an object with x, y, and z dimensions
    } else {
        return false; // Default size in case node is not found
    }
}

export async function calculateBoundingBox(object) {
    const bbox = new THREE.Box3();

    let nodes = ["Frame"];

    object.traverse(async function (modelNode) {
        if (allModelNames.includes(modelNode.name)) {
            // Ensure the object for modelNode.name exists
            if (!params.calculateBoundingBox[modelNode.name]) {
                params.calculateBoundingBox[modelNode.name] = {}; // Initialize if it doesn't exist
            }

            for (let val of nodes) {
                let thisNode = modelNode.getObjectByName(val);
                if (thisNode) {
                    const boundingBox = new THREE.Box3().setFromObject(
                        thisNode
                    );
                    params.calculateBoundingBox[modelNode.name][val] =
                        boundingBox; // Now safe to assign
                }
            }
        }
    });

    return bbox;
}

export async function computeBoundingBox(object, frameNames) {
    const bbox = new THREE.Box3();

    // Traverse the object and expand the bounding box for visible nodes
    object.traverse(async function (modelNode) {
        if (frameNames.includes(modelNode.name)) {
            let isNodeVisible = modelNode.visible;

            // Expand the bounding box only if the node is visible and has visible parents
            if (isNodeVisible) {
                // console.log('modelNode.name', modelNode.name)
                bbox.expandByObject(modelNode);
            }
        }
    });

    return bbox;
}

export async function getHeaderSize(value) {
    return value.replace("Header_", "");
}

export async function getModelSize(model_name) {
    return model_name.replace("Model_", "");
}

export async function clearMeasurementBoxes() {
    const objectsToRemove = [];

    // Traverse all the children in the scene
    sharedParams.scene.traverse(function (child) {
        if (child.name && child.name.startsWith("Measurement")) {
            objectsToRemove.push(child);
        }
    });

    // Now remove all flagged objects from the scene
    objectsToRemove.forEach((object) => {
        if (object.parent) {
            object.parent.remove(object); // Remove from its parent
        }

        // Additionally, dispose of geometry and material to free up memory
        if (object.geometry) object.geometry.dispose();
        if (object.material) object.material.dispose();
    });

    // Clean up the list of children in the scene
    // sharedParams.scene.children = sharedParams.scene.children.filter(child => !child.name.startsWith('Measurement'));
    // sharedParams.scene.children = sharedParams.scene.children.filter(child => {
    //     return child.name && !child.name.startsWith('Measurement');
    // });
}

export async function computeVisibleNodeBoundingBox(
    object,
    mainModelNames,
    innerModelNames
) {
    const bbox = new THREE.Box3();

    // Traverse the object and expand the bounding box for visible nodes
    object.traverse(async function (child) {
        if (mainModelNames.includes(child.name) && child.visible) {
            child.traverse(async function (modelNode) {
                if (innerModelNames.includes(modelNode.name)) {
                    let isNodeVisible = modelNode.visible;
                    // Expand the bounding box only if the node is visible and has visible parents
                    if (isNodeVisible) {
                        bbox.expandByObject(modelNode);
                    }
                }
            });
        }
    });
    return bbox;
}

export async function drawMeasurementBoxesWithLabels() {
    if (sharedParams.modelGroup) {
        const bbox = await computeVisibleNodeBoundingBox(
            sharedParams.modelGroup,
            allModelNames,
            heightMeasurementNames
        );
        if (bbox) {
            let multiplier = 1;

            // Clear previous measurement boxes and labels
            await clearMeasurementBoxes();
            if (params.measurementToggle) {
                const min = bbox.min.clone();
                const max = bbox.max.clone();

                // Material for the measurement boxes
                const material = new THREE.MeshBasicMaterial({
                    color: params.measurementLineColor,
                });

                // Create width measurement group
                const width = max.x - min.x;
                const widthGroup = await addMeasurementGroup(
                    material,
                    {
                        width: width,
                        height: params.measurementLineLength,
                        depth: params.measurementLineLength,
                    }, // lineSize
                    `${width.toFixed(0) * multiplier}mm`, // labelText Width:
                    new THREE.BoxGeometry(
                        params.measurementLineLength,
                        params.measurementLineHeight,
                        params.measurementLineLength
                    ), // handleLineGeometry
                    "MeasurementWidth" // groupNamePrefix
                );
                sharedParams.scene.add(widthGroup); // Add the group to the scene

                // Create height measurement group
                const height = max.y - min.y;
                const heightGroup = await addMeasurementGroup(
                    material,
                    {
                        width: params.measurementLineLength,
                        height: height,
                        depth: params.measurementLineLength,
                    }, // lineSize
                    `${height.toFixed(0) * multiplier}mm`, // labelText Height:
                    new THREE.BoxGeometry(
                        params.measurementLineLength,
                        params.measurementLineLength,
                        params.measurementLineHeight
                    ), // handleLineGeometry
                    "MeasurementHeight" // groupNamePrefix
                );
                sharedParams.scene.add(heightGroup); // Add the group to the scene

                // Create depth measurement group
                const depth = max.z - min.z;
                const depthGroup = await addMeasurementGroup(
                    material,
                    {
                        width: params.measurementLineLength,
                        height: params.measurementLineLength,
                        depth: depth,
                    }, // lineSize
                    `${depth.toFixed(0) * multiplier}mm`, // labelText Depth:
                    new THREE.BoxGeometry(
                        params.measurementLineLength,
                        params.measurementLineHeight,
                        params.measurementLineLength
                    ), // handleLineGeometry
                    "MeasurementDepth" // groupNamePrefix
                );
                sharedParams.scene.add(depthGroup); // Add the group to the scene

                // Update labels to always face the camera
                sharedParams.scene.onBeforeRender = function () {
                    sharedParams.scene.traverse((obj) => {
                        if (obj.name && obj.name.includes("Label")) {
                            obj.lookAt(sharedParams.camera.position);
                        }
                    });
                };
            }
        }
    }
}

export async function addMeasurementGroup(
    material,
    lineSize,
    labelText,
    handleLineGeometry,
    groupNamePrefix
) {
    // Create a group for the measurement
    const measurementGroup = new THREE.Group();
    measurementGroup.name = groupNamePrefix;
    measurementGroup.visible = false;

    // Create measurement box
    const boxGeometry = new THREE.BoxGeometry(
        lineSize.width,
        lineSize.height,
        lineSize.depth
    );
    const box = new THREE.Mesh(boxGeometry, material);
    box.name = `${groupNamePrefix}Box`;
    measurementGroup.add(box);

    // Create lines
    const startLine = new THREE.Mesh(handleLineGeometry, material);
    const endLine = new THREE.Mesh(handleLineGeometry, material);

    // Set positions for start and end lines
    startLine.name = `${groupNamePrefix}StartLine`;
    measurementGroup.add(startLine);

    endLine.name = `${groupNamePrefix}EndLine`;
    measurementGroup.add(endLine);

    // Create and add label
    const label = await createLabel(labelText);
    label.name = `${groupNamePrefix}Label`;
    measurementGroup.add(label);

    // Return the group so it can be added to the scene or manipulated further
    return measurementGroup;
}

export async function createLabel(text) {
    const labelDiv = document.createElement("div");
    labelDiv.className = "measurement_label"; // Add CSS class for styling
    labelDiv.textContent = text;
    labelDiv.style.backgroundColor = "rgba(0, 0, 0, 1)"; // Similar background style as example
    labelDiv.style.color = "#ffffff"; // White text color
    labelDiv.style.padding = "2px 5px"; // Padding similar to example
    labelDiv.style.borderRadius = "5px"; // borderRadius similar to example
    labelDiv.style.fontSize = "16px"; // fontSize similar to example

    // Create a CSS2DObject with the labelDiv
    const label = new CSS2DObject(labelDiv);
    label.position.set(0, 0, 0); // Adjust position according to your needs
    // console.log('label', label)
    return label;
}

export async function updateMeasurementGroups() {
    if (sharedParams.modelGroup) {
        const bbox = await computeVisibleNodeBoundingBox(
            sharedParams.modelGroup,
            allModelNames,
            heightMeasurementNames
        );
        if (bbox) {
            const min = bbox.min.clone();
            const max = bbox.max.clone();
            const center = bbox.getCenter(new THREE.Vector3());

            // Determine if the camera is on the left or right side of the model
            const cameraOnLeft = sharedParams.camera.position.x < center.x;
            const cameraZAdjustment =
                sharedParams.camera.position.z < center.z ? -70 : 70; // Adjust if camera is in front or behind
            const lableZAdjustment =
                sharedParams.camera.position.z < center.z ? -20 : 20; // Adjust if camera is in front or behind
            const lableYAdjustment = 30; // Adjust if camera is in front or behind

            // Create width measurement group
            const width = max.x - min.x;
            await updateMeasurementGroupPosition(
                "MeasurementWidth",
                {
                    x: min.x + width / 2,
                    y: max.y + params.measurementLineDistance,
                    z: cameraZAdjustment,
                }, // linePosition
                new THREE.Vector3(
                    min.x + width / 2,
                    max.y +
                        1 +
                        params.measurementLineDistance +
                        lableYAdjustment,
                    cameraZAdjustment + lableZAdjustment
                ), // labelPosition
                {
                    x: min.x,
                    y: max.y + params.measurementLineDistance,
                    z: cameraZAdjustment,
                }, // startLinePosition
                {
                    x: max.x,
                    y: max.y + params.measurementLineDistance,
                    z: cameraZAdjustment,
                } // endLinePosition
            );

            // Update height measurement
            const height = max.y - min.y;
            const heightXPosition = cameraOnLeft
                ? max.x + 1 + params.measurementLineDistance // If camera is on the left, height is on the right
                : min.x - 1 - params.measurementLineDistance; // If camera is on the right, height is on the left

            await updateMeasurementGroupPosition(
                "MeasurementHeight",
                {
                    x: heightXPosition,
                    y: min.y + height / 2,
                    z: cameraZAdjustment,
                }, // linePosition
                new THREE.Vector3(
                    heightXPosition,
                    min.y + height / 2,
                    cameraZAdjustment + lableZAdjustment
                ), // labelPosition
                { x: heightXPosition, y: min.y, z: cameraZAdjustment }, // startLinePosition
                { x: heightXPosition, y: max.y, z: cameraZAdjustment } // endLinePosition
            );

            // Update depth measurement
            const depth = max.z - min.z;
            const depthXPosition = cameraOnLeft
                ? min.x - params.measurementLineDistance // If camera is in front, depth is behind
                : max.x + params.measurementLineDistance; // If camera is behind, depth is in front

            await updateMeasurementGroupPosition(
                "MeasurementDepth",
                { x: depthXPosition, y: min.y, z: min.z + depth / 2 }, // linePosition
                new THREE.Vector3(
                    depthXPosition,
                    min.y + lableYAdjustment,
                    min.z + depth / 2 + lableZAdjustment
                ), // labelPosition
                { x: depthXPosition, y: min.y, z: min.z }, // startLinePosition
                { x: depthXPosition, y: min.y, z: max.z } // endLinePosition
            );
        }
    }
}

// Initialize the label renderer
export async function updateLabelOcclusion() {
    // Perform the raycasting for each measurement group
    sharedParams.scene.traverse((object) => {
        if (object instanceof CSS2DObject && object.name.includes("Label")) {
            // Get the label position
            const labelPosition = new THREE.Vector3();
            object.getWorldPosition(labelPosition);

            // Calculate direction from camera to the label
            sharedParams.direction
                .subVectors(labelPosition, sharedParams.camera.position)
                .normalize();

            // Set raycaster from the camera towards the label
            sharedParams.raycaster.set(
                sharedParams.camera.position,
                sharedParams.direction
            );

            // Perform raycast and check for intersections
            const intersects = sharedParams.raycaster.intersectObjects(
                sharedParams.scene.children,
                true
            );

            // If there's an object closer to the camera than the label, hide the label
            if (
                intersects.length > 0 &&
                intersects[0].distance <
                    labelPosition.distanceTo(sharedParams.camera.position)
            ) {
                object.renderOrder = -3; // Send behind the other objects
            } else {
                object.renderOrder = 1; // Bring in front if no occlusion
            }
        }
    });
}

export async function updateMeasurementGroupPosition(
    groupName,
    linePosition,
    labelPosition,
    startLinePosition,
    endLinePosition
) {
    const measurementGroup = sharedParams.scene.getObjectByName(groupName);
    if (measurementGroup) {
        measurementGroup.visible = params.measurementToggle;

        // Update box position
        const box = measurementGroup.getObjectByName(`${groupName}Box`);
        if (box) box.position.copy(linePosition);

        // Update start and end line positions
        const startLine = measurementGroup.getObjectByName(
            `${groupName}StartLine`
        );
        const endLine = measurementGroup.getObjectByName(`${groupName}EndLine`);
        if (startLine) startLine.position.copy(startLinePosition);
        if (endLine) endLine.position.copy(endLinePosition);

        // Update label position
        const label = measurementGroup.getObjectByName(`${groupName}Label`);
        if (label) label.position.copy(labelPosition);
    }
}


export async function getModelMeasurement(
    model,
    heightMeasurementNames,
    modelMeasurement
) {
    const bbox = new THREE.Box3();
    model.traverse(async function (modelNode) {
        if (heightMeasurementNames.includes(modelNode.name)) {
            let isNodeVisible = modelNode.visible;
            if (isNodeVisible) {
                bbox.expandByObject(modelNode);
            }
        }
    });
    if (bbox) {
        let multiplier = 1;
        const min = bbox.min.clone();
        const max = bbox.max.clone();
        // Create width measurement group
        const width = max.x - min.x;
        modelMeasurement["width"] = `${width.toFixed(0) * multiplier}mm`;
        // Create height measurement group
        const height = max.y - min.y;
        modelMeasurement["height"] = `${height.toFixed(0) * multiplier}mm`;
        // Create depth measurement group
        const depth = max.z - min.z;
        modelMeasurement["depth"] = `${depth.toFixed(0) * multiplier}mm`;
    }
}

export async function getComponentSize(model, modelComponentsData) {
    // console.log(model);

    const setModelSize = (child, size) => {
        modelComponentsData[child.name] = size;
    };

    const isValidChild = (child) => child.parent.visible && child.visible;

    const isHeaderGraphic1Mat = (child) =>
        child.name === "Header_Graphic1-Mat" &&
        child.parent.parent.visible &&
        ["Header_300", "Header_500"].includes(child.parent.parent.name);

    const isHeaderFrame = (child, parentName) =>
        child.name === "Header_Frame" && child.parent.name === parentName;

    await traverseAsync(model, async (child) => {
        if (isValidChild(child)) {
            const modelSize = getNodeSize(child);
            if (
                isHeaderFrame(child, "Header_300") ||
                isHeaderFrame(child, "Header_500")
            ) {
                setModelSize(child, modelSize);
            } else if (isHeaderGraphic1Mat(child)) {
                setModelSize(child, modelSize);
            } else if (["Frame", "Cube1-Mat"].includes(child.name)) {
                if (child.name === "Frame") {
                    const frameChild = child.clone();
                    for (let i = frameChild.children.length - 1; i >= 0; i--) {
                        const modelNode = frameChild.children[i];
                        if (
                            modelNode.name &&
                            modelNode.name.startsWith("Hanger_")
                        ) {
                            modelNode.parent.remove(modelNode);
                        }
                    }
                    const bbox = new THREE.Box3();
                    frameChild.traverse((modelNode) => {
                        if (modelNode.visible) {
                            bbox.expandByObject(modelNode);
                        }
                    });
                    const min = bbox.min.clone();
                    const max = bbox.max.clone();
                    let modelMeasurement = {};
                    const width = max.x - min.x;
                    modelMeasurement["width"] = `${width.toFixed(0) * 1}mm`;
                    const height = max.y - min.y;
                    modelMeasurement["height"] = `${height.toFixed(0) * 1}mm`;
                    const depth = max.z - min.z;
                    modelMeasurement["depth"] = `${depth.toFixed(0) * 1}mm`;
                    setModelSize(child, modelMeasurement);
                } else {
                    setModelSize(child, modelSize);
                }
            } else if (
                ["Base_Solid", "Base_Support_Sides"].includes(child.name)
            ) {
                setModelSize(child, modelSize);
            } else if (
                child.parent.name.startsWith("Hanger") &&
                (child.name == "Hanger_Stand" || child.name == "Hanger_StandX")
            ) {
                setModelSize(child.parent, modelSize);
            }
        }
    });
}

export async function initLabelRenderer() {
    let labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = "absolute";
    labelRenderer.domElement.style.top = "0px";
    labelRenderer.domElement.style.pointerEvents = "none"; // Add this line
    return labelRenderer;
}