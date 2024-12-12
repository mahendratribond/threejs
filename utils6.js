
import {
    clothsMaterial,
    commonMaterial,
} from "./src/managers/MaterialManager.js";
import { setTextureParams } from "./src/managers/FrameImagesManager.js";
import {
    THREE, OrbitControls, TransformControls, FontLoader,
    CSS2DObject,
    CSS2DRenderer,
    heightMeasurementNames,
    baseFrameTextureNames,
    rodFrameTextureNames,
    allFrameBorderNames,
    allOtherModelNames,
    allGroupModelName,
    hangerPartNames,
    frameMainNames,
    frameTop1Names,
    baseFrameNames,
    allGroupNames,
    golfClubNames,
    allModelNames,
    rackPartNames,
    hangerNames,
    headerNames,
    rackNames,
    params,
    setting,
    allGroups,
    sharedParams,
} from "./config.js";
import {
    getModelSize,
    getHeaderSize,
    computeBoundingBox,
    calculateBoundingBox,
    getNodeSize,
    getCurrentModelSize,
} from "./src/managers/MeasurementManager.js";
const fontLoader = new FontLoader().setPath("./three/examples/fonts/");

export async function getHex(value) {
    return value.replace("0x", "#");
}

// Helper function to create a delay
export async function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getRemoveIcon(removeIconName) {
    // Create the circle geometry for the remove icon
    const removeIconCircleGeometry = new THREE.CircleGeometry(1, 32); // radius 1, 32 segments for smoothness
    const removeIconCircleMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        side: THREE.DoubleSide,
    });
    const removeIconCircleMesh = new THREE.Mesh(
        removeIconCircleGeometry,
        removeIconCircleMaterial
    );

    // Create the cross lines for the remove icon
    const crossMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        linewidth: 2,
    });

    // Cross Line 1 (diagonal from top-left to bottom-right)
    const crossGeometry1 = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-0.7, 0.7, 0), // start point (top-left)
        new THREE.Vector3(0.7, -0.7, 0), // end point (bottom-right)
    ]);
    const crossLine1 = new THREE.Line(crossGeometry1, crossMaterial);

    // Cross Line 2 (diagonal from top-right to bottom-left)
    const crossGeometry2 = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0.7, 0.7, 0), // start point (top-right)
        new THREE.Vector3(-0.7, -0.7, 0), // end point (bottom-left)
    ]);
    const crossLine2 = new THREE.Line(crossGeometry2, crossMaterial);

    // Create a group to hold the circle and cross
    const removeIconGroup = new THREE.Group();
    removeIconGroup.add(removeIconCircleMesh); // Add the circle
    removeIconGroup.add(crossLine1); // Add first cross line
    removeIconGroup.add(crossLine2); // Add second cross line

    // Set the group properties
    removeIconGroup.scale.set(20, 20, 20); // You can adjust the scale as needed
    removeIconGroup.name = removeIconName;
    removeIconGroup.visible = true;

    return removeIconGroup;
}

export async function getRodCount(modelSize) {
    let additionalRods = 0;
    if (modelSize >= 3000) {
        additionalRods = 2; // 4 rods total
    } else if (modelSize >= 1200) {
        additionalRods = 1; // 3 rods total
    }
    return additionalRods;
}

export async function getSupportBaseCount(modelSize) {
    let additionalMiddleBase = 0;
    if (modelSize >= 3000) {
        additionalMiddleBase = 2; // 4 rods total
    } else if (modelSize >= 1500) {
        additionalMiddleBase = 1; // 3 rods total
    }
    return additionalMiddleBase;
}

export async function setPositionCenter(model) {
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3()); // Get the center of the bounding box
    // model.position.y = -center.y
    // Move the model to the center of the area
    // model.position.set(-center.x, -center.y, -center.z); // Center it in the scene
    model.position.sub(center);
    return model;
}

export function setupMainModel(main_model) {
    main_model.traverse(async (modelNode) => {
        if (modelNode.name && modelNode.name.startsWith("Base_Option")) {
            // if (modelNode.material && baseFrameTextureNames.includes(modelNode.name)) {
            // const material = await commonMaterial(
            //     parseInt(params.baseFrameColor, 16)
            // );
            // modelNode.material = material;
            // modelNode.material.needsUpdate = true;

            commonMaterial(parseInt(params.baseFrameColor, 16))
    .then(material => {
        // This code runs after material is created
        modelNode.material = material;
        modelNode.material.needsUpdate = true;
    })
    .catch(error => {
        console.error('Error creating material:', error);
    });

        }

        if (allModelNames.includes(modelNode.name)) {
            if (modelNode.name === params.defaultModel) {
                modelNode.visible = true;
            } else {
                modelNode.visible = false;
            }

            let header_300 = modelNode.getObjectByName("Header");
            if (header_300) {
                header_300.name = header_300.name + "_" + 300;
            }

            let shelfModel = modelNode.getObjectByName("Header_Wooden_Shelf");
            if (shelfModel) {
                modelNode.isShelf = true;
            } else {
                modelNode.isShelf = false;
            }

            let glassShelfModel = modelNode.getObjectByName("Header_Glass_Shelf");
            if (glassShelfModel) {
                modelNode.isGlassShelf = true;
            } else {
                modelNode.isGlassShelf = false;
            }

            let SlottedSideModel = modelNode.getObjectByName("Left_Ex_Slotted");
            if (SlottedSideModel) {
                modelNode.isSlottedSides = true;
            } else {
                modelNode.isSlottedSides = false;
            }
        }
    });
}

export async function getModelNode(model, prefix) {
    let pattern = new RegExp(`^${prefix}\\d{1,2}$`); // Matches names like Header_500_1, Header_600_2, etc.

    if (model && model.children) {
        for (let child of model.children) {
            if (pattern.test(child.name) || child.name == prefix) {
                return child; // Return the first matching child node
            }
        }
    }
    return null; // Return null if no match is found
}

export async function updateModelName(model, oldName, newName) {
    let pattern = new RegExp(`^${oldName}\\d{1,2}$`); // Matches names like oldName_500, oldName_600, etc.

    model.traverse((child) => {
        if (pattern.test(child.name) || child.name == oldName) {
            // If the child name matches the pattern
            // console.log('Updating:', child.name, 'to', newName);
            child.name = newName; // Update the name directly
        }
    });

    return model;
}

export async function cloneWithCustomProperties(source, target) {
    for (let model of allModelNames) {
        let sourceModel = source.getObjectByName(model);
        let targetModel = target.getObjectByName(model);
        for (let key in sourceModel) {
            if (sourceModel.hasOwnProperty(key) && !targetModel.hasOwnProperty(key)) {
                targetModel[key] = sourceModel[key];
            }
        }
    }
}

export async function setupArrowModel() {
    if (sharedParams.arrow_model) {
        await sharedParams.arrow_model.traverse(async function (child) {
            if (child.material) {
                const material = await commonMaterial(parseInt("0x888888", 16));
                child.material = material;
                child.material.needsUpdate = true;
            }
        });

        sharedParams.arrow_model = await setPositionCenter(sharedParams.arrow_model);

        await traverseAsync(sharedParams.modelGroup, async function (modelNode) {
            if (allModelNames.includes(modelNode.name)) {
                const modelBox = new THREE.Box3().setFromObject(modelNode);
                const cone_model = sharedParams.arrow_model.getObjectByName("Cone");
                let cone = cone_model.clone();

                cone = await setPositionCenter(cone);
                cone.scale.set(0.1, 0.1, 0.1);
                const coneBox = new THREE.Box3().setFromObject(cone);
                const coneHeight = coneBox.max.y - coneBox.min.y;
                // console.log('arrowHeight', coneHeight)
                // rod.name = rodName;
                // cone.scale.set(0.5, 0.5, 0.5)
                cone.position.set(
                    modelNode.position.x, // Adjust based on offset
                    modelBox.max.y + coneHeight / 2 + 210,
                    // modelBox.min.y - coneHeight / 2 - 10,
                    0
                );
                cone.rotation.x = Math.PI;
                cone.visible = false;
                modelNode.attach(cone);
            }
        });
    }
}

export async function createRod(modelNode, modelSize) {

    const additionalRods = await getRodCount(modelSize);
    const header = modelNode.getObjectByName("Header_300");

    // Ensure both header and frame nodes exist
    if (header) {
        const headerBox = new THREE.Box3().setFromObject(header);
        const headerSize = await getNodeSize(header); // Size of the current header

        let rodY = headerBox.min.y + params.rodSize.y / 2; //(frameSize.y / 2 + rodSize.y / 2);
        let lassShelfFixingY = params.glassShelfFixingSize.y / 2; //(frameSize.y / 2 + glassShelfFixingSize.y / 2);

        // Function to create and position a rod
        const createAndPositionRod = async (xOffset, rodName, shelfFixingName) => {
            let rod = sharedParams.header_rod_model.clone();
            rod.name = rodName;
            modelNode.add(rod);
            rod = await setPositionCenter(rod);
            rod.position.set(
                header.position.x + xOffset, // Adjust based on offset
                rod.position.y + rodY,
                rod.position.z
            );
            rod.visible = false;

            const rodBox = new THREE.Box3().setFromObject(rod);

            let shelf_fixing = sharedParams.header_glass_shelf_fixing_model.clone();
            shelf_fixing.name = shelfFixingName;
            modelNode.add(shelf_fixing);
            // console.log('shelf_fixing.position', shelf_fixing.position)
            shelf_fixing = await setPositionCenter(shelf_fixing);
            // console.log('shelf_fixing.position update', shelf_fixing.position)
            // shelf_fixing.position.y += headerBox.min.y + rodSize.y + lassShelfFixingY
            shelf_fixing.position.set(
                rod.position.x, // Adjust based on offset
                shelf_fixing.position.y +
                headerBox.min.y +
                params.rodSize.y +
                lassShelfFixingY,
                shelf_fixing.position.z
            );
            shelf_fixing.visible = false;
        };

        let margin = 50;

        // Place the left and right rods first
        await createAndPositionRod(
            -headerSize.x / 2 + params.rodSize.x + margin,
            "Rod",
            "Glass_Shelf_Fixing"
        ); // Left Rod
        await createAndPositionRod(
            headerSize.x / 2 - params.rodSize.x - margin,
            "Rod",
            "Glass_Shelf_Fixing"
        ); // Right Rod

        // Determine and place additional rods based on modelSize
        if (additionalRods > 0) {
            const spacing = headerSize.x / (additionalRods + 1); // Calculate spacing between rods

            // Place additional rods
            for (let i = 1; i <= additionalRods; i++) {
                let xOffset = -headerSize.x / 2 + i * spacing;
                await createAndPositionRod(xOffset, "Rod", "Glass_Shelf_Fixing");
            }
        }
    }

    return modelNode;
}
export async function createSupportBase(
    modelNode,
    modelSize
) {
    const additionalSupportBase = await getSupportBaseCount(modelSize);
    const base = modelNode.getObjectByName("Base_Solid");
    // Ensure both header and frame nodes exist
    if (base) {
        const baseBox = new THREE.Box3().setFromObject(modelNode);
        const baseSize = await getNodeSize(modelNode); // Size of the current base
        let positionY;

        const bbox = new THREE.Box3();
        bbox.expandByObject(sharedParams.support_base_side);
        const modelWidth = bbox.min.y;
        // let baseY = baseBox.min.y + params.rodSize.y / 4; //(frameSize.y / 2 + rodSize.y / 2);
        let baseY = baseBox.min.y - modelWidth; //(frameSize.y / 2 + rodSize.y / 2);
        // Function to create and position a rod
        const createAndPositionBaseSide = async (xOffset, supportBaseName) => {
            let supportSide = sharedParams.support_base_side.clone();
            supportSide.name = supportBaseName;
            modelNode.add(supportSide);
            supportSide = await setPositionCenter(supportSide);
            supportSide.position.set(
                supportSide.position.x + xOffset, // Adjust based on offset
                supportSide.position.y + baseY + 30,
                supportSide.position.z
            );
            positionY = supportSide.position.y;
            supportSide.visible = false;

            const rodBox = new THREE.Box3().setFromObject(supportSide);
        };
        const createAndPositionBaseMiddle = async (
            xOffset,
            supportBaseName,
            positionY
        ) => {
            let supportSide = sharedParams.support_base_middle.clone();
            supportSide.name = supportBaseName;
            modelNode.add(supportSide);
            supportSide = await setPositionCenter(supportSide);
            supportSide.position.set(
                supportSide.position.x + xOffset, // Adjust based on offset
                (supportSide.position.y = positionY),
                supportSide.position.z
            );
            supportSide.visible = false;

            const rodBox = new THREE.Box3().setFromObject(supportSide);
        };

        let margin = 30;

        // Place the left and right rods first
        await createAndPositionBaseSide(
            -baseSize.x / 2 + margin,
            "Base_Support_Sides"
        ); // Left Rod
        await createAndPositionBaseSide(
            baseSize.x / 2 - margin,
            "Base_Support_Sides"
        ); // Right Rod

        // Determine and place additional rods based on modelSize
        if (additionalSupportBase > 0) {
            const spacing = baseSize.x / (additionalSupportBase + 1); // Calculate spacing between rods

            // Place additional rods
            for (let i = 1; i <= additionalSupportBase; i++) {
                let xOffset = -baseSize.x / 2 + i * spacing;
                await createAndPositionBaseMiddle(
                    xOffset,
                    "Base_Support_Sides",
                    positionY
                );
            }
        }
    }

    return modelNode;
}

export async function setupGlassShelfFixingModel() {
    let modelSize;
    if (sharedParams.header_glass_shelf_fixing_model) {
        sharedParams.header_glass_shelf_fixing_model = await updateModelName(
            sharedParams.header_glass_shelf_fixing_model,
            "__Glass_Shelf_Fixing",
            "Glass_Shelf_Fixing"
        );
    }
    if (sharedParams.header_rod_model) {
        await traverseAsync(sharedParams.header_rod_model, async function (child) {
            if (child.material && rodFrameTextureNames.includes(child.name)) {
                const material = await commonMaterial(
                    parseInt(params.rodFrameColor, 16)
                );
                child.material = material;
                child.material.needsUpdate = true;
            }
        });
    }

    await traverseAsync(sharedParams.modelGroup, async function (modelNode) {
        if (allModelNames.includes(modelNode.name)) {
            modelSize = await getModelSize(modelNode.name);

            if (sharedParams.header_rod_model && sharedParams.header_glass_shelf_fixing_model) {
                await createRod(modelNode, modelSize);
            }
        }
    });
}
export async function setupSupportBaseModel() {
    let modelSize;
    if (sharedParams.support_base_middle) {
        sharedParams.support_base_middle = await updateModelName(
            sharedParams.support_base_middle,
            "base_3_middle",
            "Base_Support_Sides"
        );
    }
    if (sharedParams.support_base_side) {
        sharedParams.support_base_side = await updateModelName(
            sharedParams.support_base_side,
            "base_3_sides",
            "Base_Support_Sides"
        );
    }

    await traverseAsync(sharedParams.modelGroup, async function (modelNode) {
        if (allModelNames.includes(modelNode.name)) {
            modelSize = await getModelSize(modelNode.name);

            if (sharedParams.support_base_middle && sharedParams.support_base_side) {
                await createSupportBase(
                    modelNode,
                    modelSize
                );
            }
        }
    });
}

export async function setupHeader500HeightModel() {
    let header;
    if (sharedParams.header_500_height_model) {

        await traverseAsync(sharedParams.modelGroup, async function (modelNode) {
            if (allModelNames.includes(modelNode.name)) {
                let frame = modelNode.getObjectByName("Frame");
                const frameBox = new THREE.Box3().setFromObject(frame);

                let header_300 = modelNode.getObjectByName("Header_300");
                let header_500_model = sharedParams.header_500_height_model.getObjectByName(
                    modelNode.name
                );
                const header500ModelSize = await getNodeSize(header_500_model);
                const header300ModelSize = await getNodeSize(header_300);

                if (header_300 && header_500_model) {
                    header = await getModelNode(header_500_model, "Header");
                    if (!header) {
                        header = await getModelNode(header_500_model, "Header_");
                    }
                    if (header) {
                        header = await updateModelName(
                            header,
                            "Header_Frame_",
                            "Header_Frame"
                        );

                        header = await updateModelName(
                            header,
                            "Header_Graphic1",
                            "Header_Graphic1"
                        );
                        header = await updateModelName(
                            header,
                            "Header_Graphic1_",
                            "Header_Graphic1"
                        );
                        header = await updateModelName(
                            header,
                            "Header_Graphic1-Mat",
                            "Header_Graphic1-Mat"
                        );
                        header = await updateModelName(
                            header,
                            "Header_Graphic1-Mat_",
                            "Header_Graphic1-Mat"
                        );
                        header = await updateModelName(
                            header,
                            "Header_Graphic1-Fabric_Colour",
                            "Header_Graphic1-Fabric_Colour"
                        );
                        header = await updateModelName(
                            header,
                            "Header_Graphic1-Fabric_Colour_",
                            "Header_Graphic1-Fabric_Colour"
                        );

                        header = await updateModelName(
                            header,
                            "Header_Graphic2",
                            "Header_Graphic2"
                        );
                        header = await updateModelName(
                            header,
                            "Header_Graphic2_",
                            "Header_Graphic2"
                        );
                        header = await updateModelName(
                            header,
                            "Header_Graphic2-Mat",
                            "Header_Graphic2-Mat"
                        );
                        header = await updateModelName(
                            header,
                            "Header_Graphic2-Mat_",
                            "Header_Graphic2-Mat"
                        );
                        header = await updateModelName(
                            header,
                            "Header_Graphic2-Fabric_Colour",
                            "Header_Graphic2-Fabric_Colour"
                        );
                        header = await updateModelName(
                            header,
                            "Header_Graphic2-Fabric_Colour_",
                            "Header_Graphic2-Fabric_Colour"
                        );

                        header.name = "Header_500";
                        header.visible = false;
                        header.position.y = frameBox.max.y + header500ModelSize.y / 2;
                        modelNode.attach(header);
                    }
                }
            }
        });
    }
}

export async function setupHeaderWoodenShelfModel() {
    await traverseAsync(sharedParams.modelGroup, async function (modelNode) {
        if (allModelNames.includes(modelNode.name)) {
            if (sharedParams.header_wooden_shelf_model) {
                let model = sharedParams.header_wooden_shelf_model.getObjectByName(modelNode.name);
                if (model) {
                    const modelSize = await getNodeSize(model);
                    const frame = modelNode.getObjectByName("Frame");
                    const frameBox = new THREE.Box3().setFromObject(frame);

                    if (frame) {
                        let positionY = frameBox.max.y;
                        if (params.rodSize) {
                            positionY += params.rodSize.y;
                        }
                        positionY += modelSize.y / 2;
                        model.name = "Header_Wooden_Shelf";
                        model.visible = false;
                        model.position.y = positionY;
                        modelNode.attach(model);
                    }
                }
            }
        }
    });
}

export async function setupHeaderGlassShelfModel() {
    if (sharedParams.header_glass_shelf_model) {
        sharedParams.header_glass_shelf_model.traverse(async function (child) {
            if (child.material) {
                child.material = await generateGlassMaterial();
                // child.material = await commonMaterial(0xffffff)
                child.material.needsUpdate = true;
            }
        });
    }

    await traverseAsync(sharedParams.modelGroup, async function (modelNode) {
        if (allModelNames.includes(modelNode.name)) {
            if (sharedParams.header_glass_shelf_model) {
                let model = sharedParams.header_glass_shelf_model.getObjectByName(modelNode.name);
                if (model) {
                    const modelSize = await getNodeSize(model);
                    const frame = modelNode.getObjectByName("Frame");
                    const frameBox = new THREE.Box3().setFromObject(frame);

                    if (frame) {
                        // console.log('frame', frame)
                        let positionY = frameBox.max.y;
                        if (params.rodSize) {
                            positionY += params.rodSize.y;
                        }
                        if (params.glassShelfFixingSize) {
                            positionY += params.glassShelfFixingSize.y;
                        }
                        positionY -= modelSize.y / 2 + 0.5;
                        model.name = "Header_Glass_Shelf";
                        model.visible = false;
                        model.position.y = positionY;
                        modelNode.attach(model);
                    }
                }
            }
        }
    });
}

export async function setupSlottedSidesModel() {
    let slotted_left_side, slotted_right_side, frame;
    if (sharedParams.slotted_sides_model) {
        sharedParams.slotted_sides_model = await updateModelName(
            sharedParams.slotted_sides_model,
            "Left_Ex_Slotted_",
            "Left_Ex_Slotted"
        );
        sharedParams.slotted_sides_model = await updateModelName(
            sharedParams.slotted_sides_model,
            "Left_Ex_Slotted",
            "Left_Ex_Slotted"
        );
        sharedParams.slotted_sides_model = await updateModelName(
            sharedParams.slotted_sides_model,
            "Left_Ex_Slotted-Inside_Profile_",
            "Left_Ex_Slotted-Inside_Profile"
        );
        sharedParams.slotted_sides_model = await updateModelName(
            sharedParams.slotted_sides_model,
            "Left_Ex_Slotted-Frame_",
            "Left_Ex_Slotted-Frame"
        );

        sharedParams.slotted_sides_model = await updateModelName(
            sharedParams.slotted_sides_model,
            "Right_Ex_Slotted_",
            "Right_Ex_Slotted"
        );
        sharedParams.slotted_sides_model = await updateModelName(
            sharedParams.slotted_sides_model,
            "Right_Ex_Slotted",
            "Right_Ex_Slotted"
        );
        sharedParams.slotted_sides_model = await updateModelName(
            sharedParams.slotted_sides_model,
            "Right_Ex_Slotted-Inside_Profile_",
            "Left_Ex_Slotted-Inside_Profile"
        );
        sharedParams.slotted_sides_model = await updateModelName(
            sharedParams.slotted_sides_model,
            "Right_Ex_Slotted-Frame_",
            "Left_Ex_Slotted-Frame"
        );
    }

    await traverseAsync(sharedParams.modelGroup, async function (modelNode) {
        if (allModelNames.includes(modelNode.name)) {
            frame = modelNode.getObjectByName("Frame");

            if (sharedParams.slotted_sides_model) {
                let slotted_sides_ = sharedParams.slotted_sides_model.clone();
                let slotted_sides = slotted_sides_.getObjectByName(modelNode.name);
                if (slotted_sides) {
                    slotted_left_side = slotted_sides.getObjectByName("Left_Ex_Slotted");
                    if (slotted_left_side) {
                        let leftSide = frame.getObjectByName("Left_Ex");
                        let leftSideWorldPosition = new THREE.Vector3();
                        leftSide.getWorldPosition(leftSideWorldPosition);
                        slotted_left_side.visible = false;
                        frame.attach(slotted_left_side);
                        slotted_left_side.position.y = leftSide.position.y;
                    }

                    slotted_right_side =
                        slotted_sides.getObjectByName("Right_Ex_Slotted");
                    if (slotted_right_side) {
                        let rightSide = frame.getObjectByName("Right_Ex");
                        let rightSideWorldPosition = new THREE.Vector3();
                        rightSide.getWorldPosition(rightSideWorldPosition);
                        slotted_right_side.visible = false;
                        frame.attach(slotted_right_side);
                        slotted_right_side.position.y = rightSide.position.y;
                    }
                }
            }

            // console.log('frame', frame)
        }
    });
}

export async function setupWoodenRackModel(model) {
    if (model) {
        model = await updateModelName(
            model,
            "Rack_Wooden_Shelf_",
            "Rack_Wooden_Shelf"
        );
        model = await updateModelName(
            model,
            "Rack_Stand_LH_",
            "Rack_Stand_LH"
        );
        model = await updateModelName(
            model,
            "Rack_Stand_LH",
            "Rack_Stand_LH"
        );
        model = await updateModelName(
            model,
            "Rack_Stand_RH_",
            "Rack_Stand_RH"
        );
        model = await updateModelName(
            model,
            "Rack_Stand_RH",
            "Rack_Stand_RH"
        );
        model.traverse(async function (child) {
            if (child.material && rackPartNames.includes(child.name)) {
                const material = await commonMaterial(
                    parseInt(params.defaultRackColor, 16)
                );
                child.material = material;
                child.material.needsUpdate = true;
            }
        });
    }
}

export async function setupGlassRackModel(model) {
    if (model) {
        model = await updateModelName(
            model,
            "Rack_Glass_Shelf_",
            "Rack_Glass_Shelf"
        );
        model = await updateModelName(
            model,
            "Rack_Stand_LH_",
            "Rack_Stand_LH"
        );
        model = await updateModelName(
            model,
            "Rack_Stand_RH_",
            "Rack_Stand_RH"
        );

        const glassMaterial = await generateGlassMaterial();
        const defaultMaterial = await commonMaterial(
            parseInt(params.defaultRackColor, 16)
        );

        model.traverse(async function (child) {
            if (rackPartNames.includes(child.name)) {
                let material =
                    child.name === "Rack_Glass_Shelf" ? glassMaterial : defaultMaterial;

                // Assign material to the child
                child.material = material;
                child.material.needsUpdate = true;

                // If the child has nested meshes, apply the same material
                child.traverse(function (mesh) {
                    mesh.material = material;
                    mesh.material.needsUpdate = true;
                });
            }
        });
    }
}

// Traverse main model asynchronously
export async function traverseAsync(modelNode, callback) {
    await callback(modelNode);
    const promises = modelNode.children.map((child) =>
        traverseAsync(child, callback)
    );
    return Promise.all(promises);
}

// export async function showHideNodes() {
//     // console.log(sharedParams.modelGroup);
//     // let currentModelNode = params.selectedGroupName;
//     let current_setting = setting[params.selectedGroupName];
//     let border_texture_material_Clone = sharedParams.border_texture_material.clone();
//     border_texture_material_Clone.name = "border texture material Clone";

//     let frame_material = border_texture_material_Clone;
//     if (current_setting.frameMaterialType === "texture") {
//         let frame_texture_border = new THREE.TextureLoader().load(
//             "./assets/images/borders/" + current_setting.frameBorderColor
//         );
//         frame_texture_border = await setTextureParams(frame_texture_border);
//         frame_texture_border.name = "border_texture_border";
//         frame_material.uuid = "12345678i";
//         frame_material.map = frame_texture_border;
//     }
//     if (sharedParams.modelGroup) {
//         await traverseAsync(sharedParams.modelGroup, async (child) => {
//             if (child.name === "Cone") {
//                 child.visible = false;
//             }
//         });
//         let main_model = sharedParams.modelGroup.getObjectByName(params.selectedGroupName);
//         await traverseAsync(main_model, async (child) => {
//             let currentModelNode = await getMainParentNode(
//                 child,
//                 allModelNames,
//                 false
//             );
//             // console.log('currentModelNode', currentModelNode)
//             // console.log('child', child)
//             // console.log('child.name', child.name)

//             let isSlottedSides = currentModelNode.isSlottedSides || false;
//             let isShelf = currentModelNode.isShelf || false;
//             let isGlassShelf = currentModelNode.isGlassShelf || false;

//             child.updateMatrixWorld();
//             if (child.name === "Cone") {
//                 child.visible =
//                     (await isActiveGroup(currentModelNode)) &&
//                     Object.keys(setting).length > 1;
//             }
//             if (child.name && allModelNames.includes(child.name)) {
//                 if (child.name === current_setting.defaultModel) {
//                     child.visible = true; // Show the selected model
//                 } else {
//                     child.visible = false; // Hide other models
//                 }
//             }
//             if (child.name === "Left_Ex" || child.name === "Right_Ex") {
//                 if (isSlottedSides && current_setting.slottedSidesToggle) {
//                     child.visible = false;
//                 } else {
//                     child.visible = true;
//                 }
//             }
//             if (hangerNames.includes(child.name)) {
//                 if (isSlottedSides && current_setting.slottedSidesToggle) {
//                     child.visible = true;
//                 } else {
//                     child.visible = true;
//                 }
//             }
//             if (
//                 child.name === "Left_Ex_Slotted" ||
//                 child.name === "Right_Ex_Slotted"
//             ) {
//                 if (isSlottedSides && current_setting.slottedSidesToggle) {
//                     child.visible = true;
//                 } else {
//                     child.visible = false;
//                 }
//             }
//             if (rackNames.includes(child.name)) {
//                 let rackArr = child.rackArrayKey;
//                 let rackModelName = rackArr.split("-")[1];
//                 let rackside = rackArr.split("-")[2];
//                 let isSameSide = false;
//                 let currentModel = main_model.getObjectByName(rackModelName);
//                 let frame = currentModel.getObjectByName("Frame");
//                 for (const hangerFrame of frame.children) {
//                     if (hangerNames.includes(hangerFrame.name) && hangerFrame.visible) {
//                         let hangerArrKey = hangerFrame.hangerArrayKey;
//                         let hangerModel = hangerArrKey.split("-")[1];
//                         let hangerSide = hangerArrKey.split("-")[2];
//                         if (rackModelName === hangerModel && rackside === hangerSide) {
//                             isSameSide = true;
//                         }
//                     }
//                 }
//                 if (
//                     isSlottedSides &&
//                     current_setting.slottedSidesToggle &&
//                     isSameSide == false
//                 ) {
//                     child.visible = true;
//                 } else {
//                     child.visible = false;
//                 }
//             }
//             if (child.name === "Header_Wooden_Shelf") {
//                 child.visible =
//                     current_setting.topOption == "Shelf" &&
//                     isShelf &&
//                     current_setting.defaultShelfType == "Header_Wooden_Shelf";
//             }
//             if (child.name === "Header_Glass_Shelf") {
//                 child.visible =
//                     current_setting.topOption == "Shelf" &&
//                     isGlassShelf &&
//                     current_setting.defaultShelfType == "Header_Glass_Shelf";
//             }
//             if (child.name === "Rod") {
//                 child.visible =
//                     (current_setting.topOption == "Shelf" &&
//                         ((isShelf &&
//                             current_setting.defaultShelfType == "Header_Wooden_Shelf") ||
//                             (isGlassShelf &&
//                                 current_setting.defaultShelfType == "Header_Glass_Shelf"))) ||
//                     (current_setting.headerRodToggle &&
//                         current_setting.topOption == "Header");
//             }
//             if (child.name === "Glass_Shelf_Fixing") {
//                 child.visible =
//                     current_setting.topOption == "Shelf" &&
//                     isGlassShelf &&
//                     current_setting.defaultShelfType == "Header_Glass_Shelf";
//             }

//             if (allFrameBorderNames.includes(child.name)) {
//                 if (current_setting.frameMaterialType === "texture") {
//                     // let frame_texture_border = new THREE.TextureLoader().load(
//                     //   "./assets/images/borders/" + current_setting.frameBorderColor
//                     // );
//                     // frame_texture_border = await setTextureParams(frame_texture_border);
//                     // let frame_material = border_texture_material_Clone;
//                     // frame_material.map = frame_texture_border;
//                     // // child.material = child.material.clone()
//                     child.material = frame_material;
//                     child.material.needsUpdate = true;
//                 } else if (current_setting.frameMaterialType === "color") {
//                     // Apply color
//                     const material = await commonMaterial(
//                         parseInt(current_setting.frameBorderColor, 16)
//                     );
//                     // child.material = child.material.clone()
//                     if (child.material) {
//                         child.material.name = "frame_color";
//                     }
//                     child.material = material;
//                     child.material.needsUpdate = true;
//                 }
//             }

//             if (child.name == "Header_Wooden_Shelf") {
//                 // console.log('Header_Wooden_Shelf', dropdownType, child.name)
//                 if (current_setting.shelfMaterialType === "texture") {
//                     // Load texture
//                     let texture_border = new THREE.TextureLoader().load(
//                         "./assets/images/borders/" + current_setting.defaultShelfColor
//                     );
//                     texture_border = await setTextureParams(texture_border);
//                     let material = border_texture_material_Clone;
//                     material.map = texture_border;
//                     child.material = material;
//                     child.material.needsUpdate = true;
//                 } else if (current_setting.shelfMaterialType === "color") {
//                     // Apply color
//                     const material = await commonMaterial(
//                         parseInt(current_setting.defaultShelfColor, 16)
//                     );
//                     child.material = material;
//                     child.material.needsUpdate = true;
//                 }
//             }

//             if (["Clothing"].includes(child.name)) {
//                 child.visible = current_setting.hangerClothesToggle;
//             }
//             if (["Hanger_Clubs"].includes(child.name)) {
//                 child.visible = current_setting.hangerGolfClubsToggle;
//             }

//             if (headerNames.includes(child.name)) {
//                 child.visible =
//                     current_setting.topOption == "Header" &&
//                     current_setting.defaultHeaderSize == child.name;
//             }

//             if (baseFrameNames.includes(child.name)) {
//                 child.visible = child.name === current_setting.selectedBaseFrame;
//             }

//             if (
//                 child.material &&
//                 child.material.color &&
//                 child.name &&
//                 (child.name.startsWith("Base_Option") ||
//                     child.name === "Base_Support_Sides")
//             ) {
//                 if (child.name === "Base_Support_Sides") {
//                     await traverseAsync(child, async (subChild) => {
//                         subChild.material = subChild.material.clone();
//                         subChild.material.color.set(
//                             await getHex(current_setting.baseFrameColor)
//                         );
//                         subChild.material.needsUpdate = true;
//                     });
//                 }
//                 child.material = child.material.clone();
//                 child.material.name = "base here";
//                 child.material.color.set(await getHex(current_setting.baseFrameColor));
//                 child.material.needsUpdate = true;
//             }
//             if (
//                 child.material &&
//                 rodFrameTextureNames.includes(child.name) &&
//                 child.material.color
//             ) {
//                 child.material = child.material.clone();
//                 child.material.color.set(await getHex(current_setting.rodFrameColor));
//                 child.material.needsUpdate = true;
//             }
//             if (
//                 child.material &&
//                 [
//                     "Hanger_Stand",
//                     "Hanger_Stand-Arm_Metal",
//                     "Hanger_Stand-Fixture_Material",
//                 ].includes(child.name) &&
//                 child.material.color
//             ) {
//                 child.material = child.material.clone();
//                 child.material.color.set(
//                     await getHex(current_setting.defaultHangerStandColor)
//                 );
//                 child.material.needsUpdate = true;
//             }
//             if (
//                 child.material &&
//                 ["Rack_Wooden_Shelf"].includes(child.name) &&
//                 child.material.color
//             ) {
//                 child.material = child.material.clone();
//                 child.material.color.set(
//                     await getHex(current_setting.defaultRackShelfStandColor)
//                 );
//                 child.material.needsUpdate = true;
//             }
//             if (["Rack_Stand_LH", "Rack_Stand_RH"].includes(child.name)) {
//                 if (child.material) {
//                     child.material = child.material.clone();
//                     child.material.color.set(
//                         await getHex(current_setting.defaultRackStandStandColor)
//                     );
//                     child.material.needsUpdate = true;
//                 } else {
//                     child.traverse(async function (mesh) {
//                         if (mesh.material) {
//                             mesh.material = mesh.material.clone();
//                             mesh.material.color.set(
//                                 await getHex(current_setting.defaultRackStandStandColor)
//                             );
//                             mesh.material.needsUpdate = true;
//                         }
//                     });
//                 }
//             }
//         });

//         if (params.topOption == "Header") {
//             await traverseAsync(main_model, async (modelNode) => {
//                 if (allModelNames.includes(modelNode.name)) {
//                     await Promise.all(
//                         headerNames.map(async (headerName) => {
//                             const header = modelNode.getObjectByName(headerName);
//                             if (header) {
//                                 if (
//                                     current_setting.headerRodToggle &&
//                                     !current_setting.headerUpDown
//                                 ) {
//                                     header.position.y += params.rodSize.y;
//                                 } else if (
//                                     !current_setting.headerRodToggle &&
//                                     current_setting.headerUpDown
//                                 ) {
//                                     header.position.y -= params.rodSize.y;
//                                 }
//                             }
//                         })
//                     );
//                 }
//             });

//             setting[params.selectedGroupName].headerUpDown =
//                 setting[params.selectedGroupName].headerRodToggle;
//         }
//     }

//     // console.log("sharedParams.modelGroup", sharedParams.modelGroup);

//     const parentElement = document.querySelector(
//         `div.accordion-item[data-model="${params.selectedGroupName}"]`
//     );
//     if (parentElement) {
//         let frameSize = parentElement.querySelector(".frameSize");
//         if (frameSize) {
//             frameSize.value = current_setting.defaultModel;
//         }
//         let topDropdown = parentElement.querySelector(".topDropdown");
//         if (topDropdown) {
//             topDropdown.value = current_setting.topOption;
//         }
//         let headerOptions = parentElement.querySelector(".headerOptions");
//         if (headerOptions) {
//             headerOptions.value = current_setting.headerOptions;
//         }
//         let headerSizeDropdown = parentElement.querySelector(".headerSizeDropdown");
//         if (headerSizeDropdown) {
//             headerSizeDropdown.value = current_setting.defaultHeaderSize;
//         }
//         let headerRodToggle = parentElement.querySelector(".headerRodToggle");
//         if (headerRodToggle) {
//             headerRodToggle.checked = current_setting.headerRodToggle;
//         }
//         let headerRodColorDropdown = parentElement.querySelector(
//             ".headerRodColorDropdown"
//         );
//         if (headerRodColorDropdown) {
//             headerRodColorDropdown.value = current_setting.rodFrameColor;
//         }
//         let shelfTypeDropdown = parentElement.querySelector(".shelfTypeDropdown");
//         if (shelfTypeDropdown) {
//             shelfTypeDropdown.value = current_setting.defaultShelfType;
//         }
//         let slottedSidesToggle = parentElement.querySelector(".slottedSidesToggle");
//         if (slottedSidesToggle) {
//             slottedSidesToggle.checked = current_setting.slottedSidesToggle;
//         }
//         let headerFrameColorInput = parentElement.querySelector(
//             ".headerFrameColorInput"
//         );
//         if (headerFrameColorInput) {
//             headerFrameColorInput.value = await getHex(
//                 current_setting.topFrameBackgroundColor
//             );
//         }
//         let headerFrameColorDropdown = parentElement.querySelector(
//             ".headerFrameColorDropdown"
//         );
//         if (headerFrameColorDropdown) {
//             headerFrameColorDropdown.value = current_setting.topFrameBackgroundColor;
//         }
//         let mainFrameColorInput = parentElement.querySelector(
//             ".mainFrameColorInput"
//         );
//         if (mainFrameColorInput) {
//             mainFrameColorInput.value = await getHex(
//                 current_setting.mainFrameBackgroundColor
//             );
//         }
//         let baseSelectorDropdown = parentElement.querySelector(
//             ".baseSelectorDropdown"
//         );
//         if (baseSelectorDropdown) {
//             baseSelectorDropdown.value = current_setting.selectedBaseFrame;
//         }
//         let baseColor = parentElement.querySelector(".baseColor");
//         if (baseColor) {
//             baseColor.value = current_setting.baseFrameColor;
//         }
//         let hangerClothesToggle = parentElement.querySelector(
//             ".hangerClothesToggle"
//         );
//         if (hangerClothesToggle) {
//             hangerClothesToggle.value = current_setting.hangerClothesToggle;
//         }

//         let hangerGolfClubsToggle = parentElement.querySelector(
//             ".hangerGolfClubsToggle"
//         );
//         if (hangerGolfClubsToggle) {
//             hangerGolfClubsToggle.value = current_setting.hangerGolfClubsToggle;
//         }
//         let hangerStandColor = parentElement.querySelector(".hangerStandColor");
//         if (hangerStandColor) {
//             hangerStandColor.value = current_setting.defaultHangerStandColor;
//         }
//         let rackShelfColor = parentElement.querySelector(".rackShelfColor");
//         if (rackShelfColor) {
//             rackShelfColor.value = current_setting.defaultRackShelfStandColor;
//         }
//         let rackStandColor = parentElement.querySelector(".rackStandColor");
//         if (rackStandColor) {
//             rackStandColor.value = current_setting.defaultRackStandStandColor;
//         }

//         if (current_setting.topOption == "Shelf") {
//             parentElement.querySelectorAll(".topHeaderOptions").forEach((element) => {
//                 element.style.display = "none";
//             });
//             parentElement.querySelectorAll(".topShelfOptions").forEach((element) => {
//                 element.style.display = "block";
//             });
//         } else if (current_setting.topOption == "Header") {
//             parentElement.querySelectorAll(".topHeaderOptions").forEach((element) => {
//                 element.style.display = "block";
//             });
//             parentElement.querySelectorAll(".topShelfOptions").forEach((element) => {
//                 element.style.display = "none";
//             });
//         } else {
//             parentElement.querySelectorAll(".topHeaderOptions").forEach((element) => {
//                 element.style.display = "none";
//             });
//             parentElement.querySelectorAll(".topShelfOptions").forEach((element) => {
//                 element.style.display = "none";
//             });
//         }

//         if (
//             (current_setting.topOption == "Header" &&
//                 current_setting.headerRodToggle) ||
//             (current_setting.topOption == "Shelf" &&
//                 (current_setting.defaultShelfType == "Header_Wooden_Shelf" ||
//                     current_setting.defaultShelfType == "Header_Glass_Shelf"))
//         ) {
//             parentElement
//                 .querySelectorAll(".headerRodColorDropdownBox")
//                 .forEach((element) => {
//                     element.style.display = "block";
//                 });
//         } else {
//             parentElement
//                 .querySelectorAll(".headerRodColorDropdownBox")
//                 .forEach((element) => {
//                     element.style.display = "none";
//                 });
//         }

//         if (
//             current_setting.topOption == "Shelf" &&
//             current_setting.defaultShelfType == "Header_Wooden_Shelf"
//         ) {
//             parentElement.querySelectorAll(".shelfTypeBox").forEach((element) => {
//                 element.style.display = "block";
//             });
//         } else {
//             parentElement.querySelectorAll(".shelfTypeBox").forEach((element) => {
//                 element.style.display = "none";
//             });
//         }

//         if (
//             current_setting.topOption == "Header" &&
//             current_setting.headerOptions == "SEG"
//         ) {
//             parentElement
//                 .querySelectorAll(".headerFrameColorDropdownBox")
//                 .forEach((element) => {
//                     element.style.display = "none";
//                 });
//             parentElement
//                 .querySelectorAll(".headerFrameColorInputBox")
//                 .forEach((element) => {
//                     element.style.display = "block";
//                 });
//         } else if (
//             current_setting.topOption == "Header" &&
//             current_setting.headerOptions == "ALG"
//         ) {
//             parentElement
//                 .querySelectorAll(".headerFrameColorDropdownBox")
//                 .forEach((element) => {
//                     element.style.display = "block";
//                 });
//             parentElement
//                 .querySelectorAll(".headerFrameColorInputBox")
//                 .forEach((element) => {
//                     element.style.display = "none";
//                 });
//         } else if (
//             current_setting.topOption == "Header" &&
//             current_setting.headerOptions == "ALG3D"
//         ) {
//             parentElement
//                 .querySelectorAll(".headerFrameColorDropdownBox")
//                 .forEach((element) => {
//                     element.style.display = "none";
//                 });
//             parentElement
//                 .querySelectorAll(".headerFrameColorInputBox")
//                 .forEach((element) => {
//                     element.style.display = "block";
//                 });
//         } else {
//             parentElement
//                 .querySelectorAll(".headerFrameColorDropdownBox")
//                 .forEach((element) => {
//                     element.style.display = "none";
//                 });
//             parentElement
//                 .querySelectorAll(".headerFrameColorInputBox")
//                 .forEach((element) => {
//                     element.style.display = "none";
//                 });
//         }
//     }

//     await drawMeasurementBoxesWithLabels();
// }

export async function showHideNodes() {
    // console.log(sharedParams.modelGroup);
    // let currentModelNode = params.selectedGroupName;
    let current_setting = setting[params.selectedGroupName];
    let border_texture_material_Clone =
        sharedParams.border_texture_material.clone();
    border_texture_material_Clone.name = "border texture material Clone";

    let frame_material = border_texture_material_Clone;
    if (current_setting.frameMaterialType === "texture") {
        let frame_texture_border = new THREE.TextureLoader().load(
            "./assets/images/borders/" + current_setting.frameBorderColor
        );
        frame_texture_border = await setTextureParams(frame_texture_border);
        frame_material.map = frame_texture_border;
    }
    if (sharedParams.modelGroup) {
        // await traverseAsync(sharedParams.modelGroup, async (child) => {
        //     if (child.name === "Cone") {
        //         child.visible = false;
        //     }
        // });

        // let main_model = sharedParams.modelGroup.getObjectByName(
        //     params.selectedGroupName
        // );
        let main_model = sharedParams.selectedGroup;
        console.log("main_model-----------",main_model);
        
        await traverseAsync(main_model, async (child) => {
            // let currentModelNode = await getMainParentNode(
            //     child,
            //     allModelNames,
            //     false
            // );
            let currentModelNode = main_model.activeModel;
            // console.log('currentModelNode', currentModelNode)
            // console.log('child', child)
            // return
            // console.log('child.name', child.name)

            let isSlottedSides = currentModelNode.isSlottedSides || false;
            let isShelf = currentModelNode.isShelf || false;
            let isGlassShelf = currentModelNode.isGlassShelf || false;

            child.updateMatrixWorld();
            if (child.name === "Cone") {
                // child.visible =
                //     (await isActiveGroup(currentModelNode)) &&
                //     Object.keys(setting).length > 1;
                child.visible = true;
            }
            if (child.name && allModelNames.includes(child.name)) {
                if (child.name === current_setting.defaultModel) {
                    child.visible = true; // Show the selected model
                    main_model.activeModel = child;
                    allGroups.push(main_model);
                } else {
                    child.visible = false; // Hide other models
                }
            }
            if (child.name === "Left_Ex" || child.name === "Right_Ex") {
                if (isSlottedSides && current_setting.slottedSidesToggle) {
                    child.visible = false;
                } else {
                    child.visible = true;
                }
            }
            if (hangerNames.includes(child.name)) {
                if (isSlottedSides && current_setting.slottedSidesToggle) {
                    child.visible = true;
                } else {
                    child.visible = true;
                }
            }
            if (
                child.name === "Left_Ex_Slotted" ||
                child.name === "Right_Ex_Slotted"
            ) {
                if (isSlottedSides && current_setting.slottedSidesToggle) {
                    child.visible = true;
                } else {
                    child.visible = false;
                }
            }
            if (rackNames.includes(child.name)) {
                let rackArr = child.rackArrayKey;
                let rackModelName = rackArr.split("-")[1];
                let rackside = rackArr.split("-")[2];
                let isSameSide = false;
                let currentModel = main_model.getObjectByName(rackModelName);
                let frame = currentModel.getObjectByName("Frame");
                for (const hangerFrame of frame.children) {
                    if (
                        hangerNames.includes(hangerFrame.name) &&
                        hangerFrame.visible
                    ) {
                        let hangerArrKey = hangerFrame.hangerArrayKey;
                        let hangerModel = hangerArrKey.split("-")[1];
                        let hangerSide = hangerArrKey.split("-")[2];
                        if (
                            rackModelName === hangerModel &&
                            rackside === hangerSide
                        ) {
                            isSameSide = true;
                        }
                    }
                }
                if (
                    isSlottedSides &&
                    current_setting.slottedSidesToggle &&
                    isSameSide == false
                ) {
                    child.visible = true;
                } else {
                    child.visible = false;
                }
            }
            if (child.name === "Header_Wooden_Shelf") {
                child.visible =
                    current_setting.topOption == "Shelf" &&
                    isShelf &&
                    current_setting.defaultShelfType == "Header_Wooden_Shelf";
            }
            if (child.name === "Header_Glass_Shelf") {
                child.visible =
                    current_setting.topOption == "Shelf" &&
                    isGlassShelf &&
                    current_setting.defaultShelfType == "Header_Glass_Shelf";
            }
            if (child.name === "Rod") {
                child.visible =
                    (current_setting.topOption == "Shelf" &&
                        ((isShelf &&
                            current_setting.defaultShelfType ==
                                "Header_Wooden_Shelf") ||
                            (isGlassShelf &&
                                current_setting.defaultShelfType ==
                                    "Header_Glass_Shelf"))) ||
                    (current_setting.headerRodToggle &&
                        current_setting.topOption == "Header");
            }
            if (child.name === "Glass_Shelf_Fixing") {
                child.visible =
                    current_setting.topOption == "Shelf" &&
                    isGlassShelf &&
                    current_setting.defaultShelfType == "Header_Glass_Shelf";
            }

            if (allFrameBorderNames.includes(child.name)) {
                if (current_setting.frameMaterialType === "texture") {
                    child.material = frame_material;
                    child.material.needsUpdate = true;
                } else if (current_setting.frameMaterialType === "color") {
                    // Apply color
                    const material = await commonMaterial(
                        parseInt(current_setting.frameBorderColor, 16)
                    );
                    // child.material = child.material.clone()
                    if (child.material) {
                        child.material.name = "frame_color";
                    }
                    child.material = material;
                    child.material.needsUpdate = true;
                }
            }

            if (child.name == "Header_Wooden_Shelf") {
                // console.log('Header_Wooden_Shelf', dropdownType, child.name)
                if (current_setting.shelfMaterialType === "texture") {
                    // Load texture
                    let texture_border = new THREE.TextureLoader().load(
                        "./assets/images/borders/" +
                            current_setting.defaultShelfColor
                    );
                    texture_border = await setTextureParams(texture_border);
                    let material = border_texture_material_Clone;
                    material.map = texture_border;
                    child.material = material;
                    child.material.needsUpdate = true;
                } else if (current_setting.shelfMaterialType === "color") {
                    // Apply color
                    const material = await commonMaterial(
                        parseInt(current_setting.defaultShelfColor, 16)
                    );
                    child.material = material;
                    child.material.needsUpdate = true;
                }
            }

            if (["Clothing"].includes(child.name)) {
                child.visible = current_setting.hangerClothesToggle;
            }
            if (["Hanger_Clubs"].includes(child.name)) {
                child.visible = current_setting.hangerGolfClubsToggle;
            }

            if (headerNames.includes(child.name)) {
                child.visible =
                    current_setting.topOption == "Header" &&
                    current_setting.defaultHeaderSize == child.name;
            }

            if (baseFrameNames.includes(child.name)) {
                child.visible =
                    child.name === current_setting.selectedBaseFrame;
            }

            if (
                child.material &&
                child.material.color &&
                child.name &&
                (child.name.startsWith("Base_Option") ||
                    child.name === "Base_Support_Sides")
            ) {
                if (child.name === "Base_Support_Sides") {
                    await traverseAsync(child, async (subChild) => {
                        subChild.material = subChild.material.clone();
                        subChild.material.color.set(
                            await getHex(current_setting.baseFrameColor)
                        );
                        subChild.material.needsUpdate = true;
                    });
                }
                child.material = child.material.clone();
                child.material.name = "base here";
                child.material.color.set(
                    await getHex(current_setting.baseFrameColor)
                );
                child.material.needsUpdate = true;
            }
            if (
                child.material &&
                rodFrameTextureNames.includes(child.name) &&
                child.material.color
            ) {
                child.material = child.material.clone();
                child.material.color.set(
                    await getHex(current_setting.rodFrameColor)
                );
                child.material.needsUpdate = true;
            }
            if (
                child.material &&
                [
                    "Hanger_Stand",
                    "Hanger_Stand-Arm_Metal",
                    "Hanger_Stand-Fixture_Material",
                ].includes(child.name) &&
                child.material.color
            ) {
                child.material = child.material.clone();
                child.material.color.set(
                    await getHex(current_setting.defaultHangerStandColor)
                );
                child.material.needsUpdate = true;
            }
            if (
                child.material &&
                ["Rack_Wooden_Shelf"].includes(child.name) &&
                child.material.color
            ) {
                child.material = child.material.clone();
                child.material.color.set(
                    await getHex(current_setting.defaultRackShelfStandColor)
                );
                child.material.needsUpdate = true;
            }
            if (["Rack_Stand_LH", "Rack_Stand_RH"].includes(child.name)) {
                if (child.material) {
                    child.material = child.material.clone();
                    child.material.color.set(
                        await getHex(current_setting.defaultRackStandStandColor)
                    );
                    child.material.needsUpdate = true;
                } else {
                    child.traverse(async function (mesh) {
                        if (mesh.material) {
                            mesh.material = mesh.material.clone();
                            mesh.material.color.set(
                                await getHex(
                                    current_setting.defaultRackStandStandColor
                                )
                            );
                            mesh.material.needsUpdate = true;
                        }
                    });
                }
            }
        });

        // if (params.topOption == "Header") {
        //     await traverseAsync(main_model, async (modelNode) => {
        //         if (allModelNames.includes(modelNode.name)) {
        //             await Promise.all(
        //                 headerNames.map(async (headerName) => {
        //                     const header =
        //                         modelNode.getObjectByName(headerName);
        //                     if (header) {
        //                         if (
        //                             current_setting.headerRodToggle &&
        //                             !current_setting.headerUpDown
        //                         ) {
        //                             header.position.y += params.rodSize.y;
        //                         } else if (
        //                             !current_setting.headerRodToggle &&
        //                             current_setting.headerUpDown
        //                         ) {
        //                             header.position.y -= params.rodSize.y;
        //                         }
        //                     }
        //                 })
        //             );
        //         }
        //     });

        //     setting[params.selectedGroupName].headerUpDown =
        //         setting[params.selectedGroupName].headerRodToggle;
        // }
    }

    // console.log("sharedParams.modelGroup", sharedParams.modelGroup);

    const parentElement = document.querySelector(
        `div.accordion-item[data-model="${params.selectedGroupName}"]`
    );
    if (parentElement) {
        let frameSize = parentElement.querySelector(".frameSize");
        if (frameSize) {
            frameSize.value = current_setting.defaultModel;
        }
        let topDropdown = parentElement.querySelector(".topDropdown");
        if (topDropdown) {
            topDropdown.value = current_setting.topOption;
        }
        let headerOptions = parentElement.querySelector(".headerOptions");
        if (headerOptions) {
            headerOptions.value = current_setting.headerOptions;
        }
        let headerSizeDropdown = parentElement.querySelector(
            ".headerSizeDropdown"
        );
        if (headerSizeDropdown) {
            headerSizeDropdown.value = current_setting.defaultHeaderSize;
        }
        let headerRodToggle = parentElement.querySelector(".headerRodToggle");
        if (headerRodToggle) {
            headerRodToggle.checked = current_setting.headerRodToggle;
        }
        let headerRodColorDropdown = parentElement.querySelector(
            ".headerRodColorDropdown"
        );
        if (headerRodColorDropdown) {
            headerRodColorDropdown.value = current_setting.rodFrameColor;
        }
        let shelfTypeDropdown =
            parentElement.querySelector(".shelfTypeDropdown");
        if (shelfTypeDropdown) {
            shelfTypeDropdown.value = current_setting.defaultShelfType;
        }
        let slottedSidesToggle = parentElement.querySelector(
            ".slottedSidesToggle"
        );
        if (slottedSidesToggle) {
            slottedSidesToggle.checked = current_setting.slottedSidesToggle;
        }
        let headerFrameColorInput = parentElement.querySelector(
            ".headerFrameColorInput"
        );
        if (headerFrameColorInput) {
            headerFrameColorInput.value = await getHex(
                current_setting.topFrameBackgroundColor
            );
        }
        let headerFrameColorDropdown = parentElement.querySelector(
            ".headerFrameColorDropdown"
        );
        if (headerFrameColorDropdown) {
            headerFrameColorDropdown.value =
                current_setting.topFrameBackgroundColor;
        }
        let mainFrameColorInput = parentElement.querySelector(
            ".mainFrameColorInput"
        );
        if (mainFrameColorInput) {
            mainFrameColorInput.value = await getHex(
                current_setting.mainFrameBackgroundColor
            );
        }
        let baseSelectorDropdown = parentElement.querySelector(
            ".baseSelectorDropdown"
        );
        if (baseSelectorDropdown) {
            baseSelectorDropdown.value = current_setting.selectedBaseFrame;
        }
        let baseColor = parentElement.querySelector(".baseColor");
        if (baseColor) {
            baseColor.value = current_setting.baseFrameColor;
        }
        let hangerClothesToggle = parentElement.querySelector(
            ".hangerClothesToggle"
        );
        if (hangerClothesToggle) {
            hangerClothesToggle.value = current_setting.hangerClothesToggle;
        }

        let hangerGolfClubsToggle = parentElement.querySelector(
            ".hangerGolfClubsToggle"
        );
        if (hangerGolfClubsToggle) {
            hangerGolfClubsToggle.value = current_setting.hangerGolfClubsToggle;
        }
        let hangerStandColor = parentElement.querySelector(".hangerStandColor");
        if (hangerStandColor) {
            hangerStandColor.value = current_setting.defaultHangerStandColor;
        }
        let rackShelfColor = parentElement.querySelector(".rackShelfColor");
        if (rackShelfColor) {
            rackShelfColor.value = current_setting.defaultRackShelfStandColor;
        }
        let rackStandColor = parentElement.querySelector(".rackStandColor");
        if (rackStandColor) {
            rackStandColor.value = current_setting.defaultRackStandStandColor;
        }

        if (current_setting.topOption == "Shelf") {
            parentElement
                .querySelectorAll(".topHeaderOptions")
                .forEach((element) => {
                    element.style.display = "none";
                });
            parentElement
                .querySelectorAll(".topShelfOptions")
                .forEach((element) => {
                    element.style.display = "block";
                });
        } else if (current_setting.topOption == "Header") {
            parentElement
                .querySelectorAll(".topHeaderOptions")
                .forEach((element) => {
                    element.style.display = "block";
                });
            parentElement
                .querySelectorAll(".topShelfOptions")
                .forEach((element) => {
                    element.style.display = "none";
                });
        } else {
            parentElement
                .querySelectorAll(".topHeaderOptions")
                .forEach((element) => {
                    element.style.display = "none";
                });
            parentElement
                .querySelectorAll(".topShelfOptions")
                .forEach((element) => {
                    element.style.display = "none";
                });
        }

        if (
            (current_setting.topOption == "Header" &&
                current_setting.headerRodToggle) ||
            (current_setting.topOption == "Shelf" &&
                (current_setting.defaultShelfType == "Header_Wooden_Shelf" ||
                    current_setting.defaultShelfType == "Header_Glass_Shelf"))
        ) {
            parentElement
                .querySelectorAll(".headerRodColorDropdownBox")
                .forEach((element) => {
                    element.style.display = "block";
                });
        } else {
            parentElement
                .querySelectorAll(".headerRodColorDropdownBox")
                .forEach((element) => {
                    element.style.display = "none";
                });
        }

        if (
            current_setting.topOption == "Shelf" &&
            current_setting.defaultShelfType == "Header_Wooden_Shelf"
        ) {
            parentElement
                .querySelectorAll(".shelfTypeBox")
                .forEach((element) => {
                    element.style.display = "block";
                });
        } else {
            parentElement
                .querySelectorAll(".shelfTypeBox")
                .forEach((element) => {
                    element.style.display = "none";
                });
        }

        if (
            current_setting.topOption == "Header" &&
            current_setting.headerOptions == "SEG"
        ) {
            parentElement
                .querySelectorAll(".headerFrameColorDropdownBox")
                .forEach((element) => {
                    element.style.display = "none";
                });
            parentElement
                .querySelectorAll(".headerFrameColorInputBox")
                .forEach((element) => {
                    element.style.display = "block";
                });
        } else if (
            current_setting.topOption == "Header" &&
            current_setting.headerOptions == "ALG"
        ) {
            parentElement
                .querySelectorAll(".headerFrameColorDropdownBox")
                .forEach((element) => {
                    element.style.display = "block";
                });
            parentElement
                .querySelectorAll(".headerFrameColorInputBox")
                .forEach((element) => {
                    element.style.display = "none";
                });
        } else if (
            current_setting.topOption == "Header" &&
            current_setting.headerOptions == "ALG3D"
        ) {
            parentElement
                .querySelectorAll(".headerFrameColorDropdownBox")
                .forEach((element) => {
                    element.style.display = "none";
                });
            parentElement
                .querySelectorAll(".headerFrameColorInputBox")
                .forEach((element) => {
                    element.style.display = "block";
                });
        } else {
            parentElement
                .querySelectorAll(".headerFrameColorDropdownBox")
                .forEach((element) => {
                    element.style.display = "none";
                });
            parentElement
                .querySelectorAll(".headerFrameColorInputBox")
                .forEach((element) => {
                    element.style.display = "none";
                });
        }
    }

    // await drawMeasurementBoxesWithLabels();
}

// Function to find the next visible child
export async function isActiveGroup(currentModelName) {
    let isActive = false;

    let activeParentGroup = await getMainParentNode(
        currentModelName,
        allGroupNames,
        false
    );
    if (
        activeParentGroup.name &&
        params.selectedGroupName == activeParentGroup.name
    ) {
        isActive = true;
    }

    return isActive;
}

export async function loaderShowHide(isShow = false) {
    if (isShow) {
        document.body.classList.remove("loaded");
    } else {
        document.body.classList.add("loaded");
    }
}

export async function getMainParentNode(child, nodeNames, isVisible = true) {
    let tempNode;
    let currentModelNode = {};

    // Create an array of promises from allModelNames
    let findParentPromises = nodeNames.map(async (val) => {
        tempNode = findParentNodeByName(child, val, isVisible);
        if (tempNode) {
            return tempNode;
        }
        return null;
    });

    // Await Promise.all and filter for the first non-null result
    let result = await Promise.all(findParentPromises);
    currentModelNode = result.find((node) => node !== null) || {};
    return currentModelNode;
}

export async function centerMainModel() {
    if (sharedParams.modelGroup !== undefined) {
        const spacing = 1; // Base space between models
        let currentX = 0; // Start positioning from 0 along the x-axis

        // Get total width of all models to center the group
        let totalWidth = 0;
        const models = [];

        // First pass: Calculate total width and collect visible models
        allGroupNames.forEach((modelName) => {
            const main_model = sharedParams.modelGroup.getObjectByName(modelName);

            main_model.children.forEach((model) => {
                if (allModelNames.includes(model.name) && model && model.visible) {
                    // Only consider visible models
                    models.push(model);

                    // Ensure the bounding box is computed
                    model.traverse((child) => {
                        if (child.isMesh && child.geometry) {
                            child.geometry.computeBoundingBox();
                        }
                    });

                    // Get bounding box for the model
                    const boundingBox = new THREE.Box3().setFromObject(model);
                    const modelWidth = boundingBox.max.x - boundingBox.min.x;

                    // Get model-specific spacing (manual movement)
                    const modelSpacing = Math.abs(model.parent.spacing || 0); // Use positive spacing value
                    totalWidth += modelWidth + spacing + modelSpacing;
                }
            });
        });

        // Center the starting position by shifting based on half the total width
        currentX = -(totalWidth / 2);

        // console.log("totalWidth:", totalWidth);

        // Second pass: Position each model with spacing and manual offsets
        for (const model of models) {
            // Get bounding box again for this model
            const boundingBox = new THREE.Box3().setFromObject(model);
            const modelWidth = boundingBox.max.x - boundingBox.min.x;

            // Get the original y position (to preserve vertical alignment)
            const originalYPosition = model.position.y;

            // Get model-specific spacing (manual movement)
            // const modelSpacing = Math.abs(model.spacing || 0); // Use positive spacing value
            const modelSpacing = Math.abs(model.parent.spacing || 0); // Use positive spacing value
            let isPositive = Math.sign(model.parent.spacing);
            let newPositionX;
            if (isPositive === -1) {
                newPositionX = -modelSpacing + currentX + modelWidth / 2 + modelSpacing;
            } else {
                newPositionX = currentX + modelWidth / 2 + modelSpacing;
            }

            // Position the model along the x-axis with added spacing and manual offset
            // const newPositionX = currentX + modelWidth / 2 + modelSpacing;

            // model.position.set(newPositionX, originalYPosition, model.position.z); // Use original y and z positions
            model.parent.position.x = newPositionX; // Use original y and z positions

            // Move to the next position along the x-axis (account for model width + base spacing + manual spacing)

            currentX += modelWidth + spacing + modelSpacing;
        }

        // Recompute bounding boxes for all models in the group
        await traverseAsync(sharedParams.modelGroup, async (modelchild) => {
            modelchild.traverse((child) => {
                if (child.isMesh && child.geometry) {
                    child.geometry.computeBoundingBox();
                }
            });
        });
    }

    // console.log("sharedParams.modelGroup:", sharedParams.modelGroup);
    // console.log("models:", models);
}

// Function to check for collision
export async function checkForCollision(
    movingModelGroup,
    moveAmount
) {
    const movingModelBoundingBox = await computeBoundingBox(
        movingModelGroup,
        allModelNames
    );
    movingModelBoundingBox.translate(new THREE.Vector3(moveAmount, 0, 0)); // Move bounding box based on movement

    // Check against all other model groups in the scene
    for (let otherModelGroup of sharedParams.modelGroup.children) {
        if (otherModelGroup !== movingModelGroup && otherModelGroup.visible) {
            const otherModelBoundingBox = await computeBoundingBox(
                otherModelGroup,
                allModelNames
            );
            // Check if the bounding boxes intersect
            if (movingModelBoundingBox.intersectsBox(otherModelBoundingBox)) {
                return false; // Collision detected
            }
        }
    }
    return true; // No collision, safe to move
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

// Initialize the label renderer
export async function initLabelRenderer() {
    let labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = "absolute";
    labelRenderer.domElement.style.top = "0px";
    labelRenderer.domElement.style.pointerEvents = "none"; // Add this line
    return labelRenderer;
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
            sharedParams.direction.subVectors(labelPosition, sharedParams.camera.position).normalize();

            // Set raycaster from the camera towards the label
            sharedParams.raycaster.set(sharedParams.camera.position, sharedParams.direction);

            // Perform raycast and check for intersections
            const intersects = sharedParams.raycaster.intersectObjects(sharedParams.scene.children, true);

            // If there's an object closer to the camera than the label, hide the label
            if (
                intersects.length > 0 &&
                intersects[0].distance < labelPosition.distanceTo(sharedParams.camera.position)
            ) {
                object.renderOrder = -3; // Send behind the other objects
            } else {
                object.renderOrder = 1; // Bring in front if no occlusion
            }
        }
    });
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
            const cameraZAdjustment = sharedParams.camera.position.z < center.z ? -70 : 70; // Adjust if camera is in front or behind
            const lableZAdjustment = sharedParams.camera.position.z < center.z ? -20 : 20; // Adjust if camera is in front or behind
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
                    max.y + 1 + params.measurementLineDistance + lableYAdjustment,
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
                { x: heightXPosition, y: min.y + height / 2, z: cameraZAdjustment }, // linePosition
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
        const startLine = measurementGroup.getObjectByName(`${groupName}StartLine`);
        const endLine = measurementGroup.getObjectByName(`${groupName}EndLine`);
        if (startLine) startLine.position.copy(startLinePosition);
        if (endLine) endLine.position.copy(endLinePosition);

        // Update label position
        const label = measurementGroup.getObjectByName(`${groupName}Label`);
        if (label) label.position.copy(labelPosition);
    }
}

export async function generateGlassTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 2;
    canvas.height = 2;

    const context = canvas.getContext("2d");
    context.fillStyle = "white";
    context.fillRect(0, 1, 2, 1);

    return canvas;
}

export async function generateGlassMaterial() {
    let texture_glass = sharedParams.texture_background.clone();
    texture_glass.mapping = THREE.EquirectangularReflectionMapping;
    const texture = new THREE.CanvasTexture(await generateGlassTexture());
    const material = new THREE.MeshPhysicalMaterial({
        color: "#3d7e35",
        metalness: 0.09,
        roughness: 0,
        ior: 2,
        alphaMap: texture,
        envMap: texture_glass,
        envMapIntensity: 1,
        transmission: 1, // use material.transmission for glass materials
        specularIntensity: 1,
        specularColor: "#ffffff",
        opacity: 0.4,
        side: THREE.DoubleSide,
        transparent: true,
    });
    return material;
}

export function findParentNodeByName(node, parentName, isVisible = null) {
    // Base case: If the current node has no parent, return null
    if (!node || !node.parent) return null;

    // Check if parentName is an array or a string
    const isMatch = Array.isArray(parentName)
        ? parentName.includes(node.parent.name)
        : node.parent.name === parentName;

    // If the current node's parent matches the name (or one of the names in the array), return the parent node
    if (isVisible) {
        if (isMatch && node.parent.visible) {
            return node.parent; // Return the current node if its parent name matches
        }
    } else {
        if (isMatch) {
            return node.parent; // Return the current node if its parent name matches
        }
    }

    // Recursively search for the matching node in the children
    const result = findParentNodeByName(node.parent, parentName, isVisible);
    if (result) return result; // If a match is found, return it

    // If no match is found, return null
    return null;
}

export async function addCloseButton(
    modelName,
    accordionItem,
    mergedArray
) {
    const closeButtonDiv = document.createElement("div");
    closeButtonDiv.classList.add("control-group");
    const closeButton = document.createElement("button");
    closeButton.classList.add(
        "btn",
        "btn-danger",
        "btn-sm",
        "model-close-button"
    );
    closeButton.type = "button";
    closeButton.innerHTML = "Delete";
    closeButtonDiv.appendChild(closeButton);

    // Append the close button to the accordion header
    const accordionHeader = accordionItem.querySelector(".accordion-body");
    accordionHeader.appendChild(closeButtonDiv);

    // You can add the event listener for closing functionality here
    closeButton.addEventListener("click", async () => {
        const confirmDelete = confirm("Do you want to delete the model?");
        if (confirmDelete) {
            const modelToRemove = sharedParams.modelGroup.getObjectByName(modelName);
            if (modelToRemove) {
                sharedParams.modelGroup.remove(modelToRemove);
            }
            const index = mergedArray.indexOf(modelName);
            if (index > -1) {
                mergedArray.splice(index, 1); // Removes 1 element at the specified index
            }
            accordionItem.remove();
        }
        await centerMainModel();
    });
}

export async function addAnotherModels(
    allGroupNames,
    modelName = null,
    side = null
) {
    if (sharedParams.modelGroup) {
        let defaultModel = sharedParams.modelGroup.getObjectByName("main_model");
        // console.log('defaultModel', defaultModel);

        const newModel = defaultModel.clone();
        await cloneWithCustomProperties(defaultModel, newModel);

        const nodesToRemove = [];
        await traverseAsync(newModel, async (child) => {
            if (hangerNames.includes(child.name) || rackNames.includes(child.name)) {
                // Mark node for removal
                nodesToRemove.push(child);
            }
        });

        // Remove nodes after traversal
        nodesToRemove.forEach((node) => {
            if (node.parent) {
                node.parent.remove(node); // Remove the node from its parent
            }
        });

        if (!modelName) {
            let baseModelName = "Other_" + newModel.name;
            let newModelName = baseModelName + "_1"; // Avoid redefining modelName
            let suffix = 1;
            while (allGroupModelName.includes(newModelName)) {
                suffix++;
                newModelName = `${baseModelName}_${suffix}`;
            }

            modelName = newModelName;
        }

        newModel.name = modelName; // If modelName is not null or undefined

        //   newModel.position.x = i * 18.05 - (modelGroupLength - 1) * 9.025;
        const modelBoundingBox = await computeBoundingBox(newModel, allModelNames);
        const modelWidth = modelBoundingBox.max.x - modelBoundingBox.min.x;

        const boundingBox = await computeBoundingBox(sharedParams.modelGroup, allModelNames);
        const center = boundingBox.getCenter(new THREE.Vector3());
        const cameraOnLeft = side || sharedParams.camera.position.x < center.x;

        if (cameraOnLeft) {
            newModel.position.x = boundingBox.max.x + modelWidth / 2;
            allGroupNames.push(newModel.name);
            allGroupModelName.push(newModel.name);
        } else {
            newModel.position.x = boundingBox.min.x - modelWidth / 2;
            allGroupNames.unshift(newModel.name);
            allGroupModelName.unshift(newModel.name);
        }

        if (!setting[modelName]) {
            setting[modelName] = JSON.parse(JSON.stringify(setting["main_model"]));
            setting[modelName].topFrameBackgroundColor =
                params.topFrameBackgroundColor;
            setting[modelName].mainFrameBackgroundColor =
                params.mainFrameBackgroundColor;
            setting[modelName].defaultModel = params.addedVisibleModelName;
        }

        await traverseAsync(newModel, async (mesh) => {
            if (
                frameTop1Names.includes(mesh.name) ||
                frameMainNames.includes(mesh.name)
            ) {
                let currentModelNode = await getMainParentNode(mesh, allModelNames);
                if (
                    params.lastInnerMaterial[currentModelNode.name] &&
                    params.lastInnerMaterial[currentModelNode.name][mesh.name]
                ) {
                    // const material = await commonMaterial(parseInt('0xffffff', 16))
                    const material =
                        params.lastInnerMaterial[currentModelNode.name][mesh.name];
                    mesh.material = material;
                    mesh.needsUpdate = true;
                }
            }

            if (mesh.name && allModelNames.includes(mesh.name)) {
                if (mesh.name === params.addedVisibleModelName) {
                    mesh.visible = true; // Show the selected model
                } else {
                    mesh.visible = false; // Hide other models
                }
            }
        });

        sharedParams.modelGroup.add(newModel);
        newModel.activeModel = newModel.children[0];
        allGroups.push(newModel);
        sharedParams.selectedGroup = newModel;
        await addAnotherModelView(allGroupNames, cameraOnLeft);
    }
}

// Function to dynamically generate and append cards for visible models
export async function addAnotherModelView(
    mergedArray,
    cameraOnLeft,
) {
    const rightControls = document.querySelector(".model_items");

    // Loop through the mergedArray and append cards for visible models
    await mergedArray.forEach(async (modelName) => {
        if (
            modelName.startsWith("Other_") &&
            !document.querySelector(`.accordion-item[data-model="${modelName}"]`)
        ) {
            // Clone the accordion item
            const accordionItem = await cloneAccordionItem(modelName);

            if (accordionItem) {
                // Ensure accordionItem is valid
                const accordionContainer = document.querySelector("#accordionModel");

                // Collapse all currently open accordion items
                const openAccordionItems = accordionContainer.querySelectorAll(
                    ".accordion-collapse.show"
                );
                openAccordionItems.forEach((item) => {
                    const bsCollapse = new bootstrap.Collapse(item, {
                        toggle: false, // Prevent toggle during the collapse
                    });
                    bsCollapse.hide(); // Explicitly hide the open accordion
                });

                // Set the parent for the new accordion item
                accordionItem
                    .querySelector(".accordion-collapse")
                    .setAttribute("data-bs-parent", "#accordionModel");
                accordionItem.setAttribute("data-model", modelName); // Ensure the data-model attribute is set
                await addCloseButton(modelName, accordionItem, mergedArray);

                // Append the new accordion item to the container
                // accordionContainer.appendChild(accordionItem);
                if (cameraOnLeft) {
                    accordionContainer.appendChild(accordionItem);
                } else {
                    accordionContainer.prepend(accordionItem);
                }

                // Initialize the new setting for the model

                // Now open the newly appended accordion item
                const collapseElement = accordionItem.querySelector(
                    ".accordion-collapse"
                );
                const bsCollapse = new bootstrap.Collapse(collapseElement, {
                    toggle: true, // This will show the collapse content
                });

                // Optionally, scroll the page to the new accordion item
                accordionItem.scrollIntoView({ behavior: "smooth" });
            }
        }
    });

    const allCards = rightControls.querySelectorAll(".model_item_card");
    allCards.forEach((card, idx) => {
        const indexElement = card.querySelector(".card-index");
        if (indexElement) {
            indexElement.textContent = idx + 1; // Reassign index based on position
        }
    });

    const moveLeftRightModel = document.querySelector(".moveLeftRightModel");
    if (moveLeftRightModel) {
        if (setting && Object.keys(setting).length > 1) {
            moveLeftRightModel.style.display = "flex"; // Initially hide the move buttons
        } else {
            moveLeftRightModel.style.display = "none"; // Initially hide the move buttons
        }
    }
}

export async function cloneAccordionItem(modelName) {
    // Find the original accordion item
    const originalAccordionItem = document.querySelector(
        '.accordion-item[data-model="main_model"]'
    );

    // Check if the original accordion item exists
    if (!originalAccordionItem) {
        console.error("Original accordion item not found");
        return null;
    }

    // Clone the accordion item
    const newAccordionItem = originalAccordionItem.cloneNode(true);

    // // Find the div containing the 'frameSize' dropdown
    // var frameSizeDiv = newAccordionItem.querySelector('select.frameSize');

    // // Check if the dropdown exists and remove its parent div
    // if (frameSizeDiv) {
    //     frameSizeDiv.closest('.control-group').remove();
    // }

    // Modify the data-model attribute and the text content
    let displayName = modelName
        .replace("Other_", "") // Remove "Other_"
        .replace(/_/g, " ") // Replace underscores with spaces
        .replace(/\b\w/g, (char) => char.toUpperCase());
    newAccordionItem.setAttribute("data-model", modelName);
    newAccordionItem.querySelector(".accordion-header button").textContent =
        displayName; // Change the title

    // Set the new ID and aria-controls to ensure uniqueness
    const newId = `collapse${modelName}`;
    newAccordionItem
        .querySelector(".accordion-collapse")
        .setAttribute("id", newId);
    newAccordionItem
        .querySelector(".accordion-header button")
        .setAttribute("data-bs-target", `#${newId}`);
    newAccordionItem
        .querySelector(".accordion-collapse")
        .classList.remove("show"); // Make it collapsed
    // Find all elements with a 'data-src' attribute
    newAccordionItem.querySelectorAll("[data-src]").forEach(function (element) {
        // Get the value of the 'data-src' attribute
        const dataSrcValue = element.getAttribute("data-src");

        // Set it as the 'src' attribute
        element.setAttribute("src", dataSrcValue);

        // Optionally, remove the 'data-src' attribute
        element.removeAttribute("data-src");
    });
    // Return the new accordion item
    return newAccordionItem;
}

export async function addRacks(
    rackType,
    lastside = null,
    position = null
) {
    if (sharedParams.modelGroup) {
        let selectedGroupName = params.selectedGroupName;
        let defaultModelName = setting[selectedGroupName].defaultModel;
        let selectedGroupModel = sharedParams.modelGroup.getObjectByName(selectedGroupName);
        let defaultModel = selectedGroupModel.getObjectByName(defaultModelName);
        let rack_model;
        if (rackType == "RackGlassShelf") {
            rack_model = sharedParams.rack_glass_model;
        } else if (rackType == "RackWoodenShelf") {
            rack_model = sharedParams.rack_wooden_model;
        }

        if (rack_model) {
            let rack_clone = rack_model.clone();
            let frame = defaultModel.getObjectByName("Frame");
            let rack = rack_clone.getObjectByName(defaultModelName);
            if (rack) {
                let side;
                if (lastside) {
                    side = lastside;
                } else {
                    side = sharedParams.camera.position.z > 0 ? "Front" : "Back";
                }
                let sameSide = false;
                for (const frameHanger of frame.children) {
                    if (hangerNames.includes(frameHanger.name)) {
                        if (side === frameHanger.side) {
                            sameSide = true;
                        }
                    }
                }
                rack.name = rackType;
                // Get the Left_Ex_Slotted node
                let leftSideSlotted = frame.getObjectByName("Left_Ex_Slotted");
                let topExSide = frame.getObjectByName("Top_Ex");
                if (
                    topExSide &&
                    leftSideSlotted &&
                    leftSideSlotted.visible &&
                    sameSide === false
                ) {
                    const rackPrefix =
                        selectedGroupName + "-" + defaultModelName + "-" + side + "-"; // Prefix to match keys
                    let rackArrayKey = rackPrefix + rackType;

                    // Calculate the bounding box for the frame to find the center
                    const topExSideBoundingBox = new THREE.Box3().setFromObject(
                        topExSide
                    );
                    const topExSideCenter = topExSideBoundingBox.getCenter(
                        new THREE.Vector3()
                    ); // Get center of frame

                    const boundingBox =
                        params.calculateBoundingBox[defaultModelName][frame.name];

                    // Now compute the bounding box relative to the world coordinates
                    const rackBoundingBox = new THREE.Box3().setFromObject(rack);
                    const rackCenter = rackBoundingBox.getCenter(new THREE.Vector3());
                    const rackLength = rackBoundingBox.max.z - rackBoundingBox.min.z;

                    rack.position.x = topExSideCenter.x; // Ensure it stays centered

                    frame.attach(rack);

                    let margin = 1;
                    let gmargin = 20;

                    if (side == "Front") {
                        rack.position.z = boundingBox.max.z + rackLength / 2 + margin;
                        rack.rotation.y = Math.PI;
                        if (rack.name == "RackGlassShelf") {
                            rack.position.z -= gmargin;
                        }
                    } else {
                        rack.position.z = boundingBox.min.z - rackLength / 2 - margin;
                        if (rack.name == "RackGlassShelf") {
                            rack.position.z += gmargin;
                        }
                    }

                    let removeRackIcon = await getRemoveIcon(`removeRack-${rackType}`);

                    removeRackIcon.position.set(
                        rackBoundingBox.max.x, // Offset in world space
                        0,
                        -rackBoundingBox.min.z + 1
                    );
                    removeRackIcon.visible = false;
                    rack.add(removeRackIcon);

                    if (position) {
                        rack.position.y = position.y;
                    }

                    // Update removeRack to always face the camera
                    sharedParams.scene.onBeforeRender = function () {
                        sharedParams.scene.traverse((obj) => {
                            if (obj.name && obj.name.includes("remove")) {
                                obj.lookAt(sharedParams.camera.position);
                            }
                        });
                    };

                    params.rackCount = params.rackCount || {};
                    params.rackCount[rackArrayKey] = params.rackCount[rackArrayKey] || 0;
                    params.rackCount[rackArrayKey] += 1;

                    let count = params.rackCount[rackArrayKey];
                    rack.rackCount = count;
                    rack.rackArrayKey = rackArrayKey;
                    rack.side = side;

                    await showHideNodes();
                }
            }
        }
    }
}

export async function saveModelData(name, dataToSave, modelId = 0) {
    // const model_data = dataToSave;
    dataToSave["action"] = "save_model_data";
    dataToSave["id"] = modelId || 0;
    dataToSave["name"] = name;

    const model_data = JSON.stringify(dataToSave);
    // console.log('model_data', model_data);

    fetch("api.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: model_data,
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                alert("Model data saved successfully!");
            } else {
                alert("Error saving model data:", data.error);
            }
        })
        .catch((error) => console.error("Fetch error:", error));
}

export async function getModelData(id) {
    try {
        // Send model state to the backend
        const response = await fetch("api.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ action: "get_model_data", id: id }), // Ensure data is stringified
        });

        const data = await response.json(); // Wait for the JSON response

        if (data.success) {
            console.log("Model fetch successfully!");
            return data.data; // Return the fetched data
        } else {
            console.error("No data found:");
            window.location.href = "test6.html";
            return null; // Return null if no data is found
        }
    } catch (error) {
        console.error("Fetch error:", error);
        return null; // Return null on error
    }
}

async function getModelMeasurement(
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

async function getComponentSize(model, modelComponentsData) {
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
            const modelSize = await getNodeSize(child);
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
                        if (modelNode.name && modelNode.name.startsWith("Hanger_")) {
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
            } else if (["Base_Solid", "Base_Support_Sides"].includes(child.name)) {
                setModelSize(child, modelSize);
            } else if (
                child.parent.name.startsWith("Hanger") &&
                child.name == "Hanger_Stand"
            ) {
                setModelSize(child.parent, modelSize);
            }
        }
    });
}

export async function savePdfData(dataToSave) {
    const loadingModal = document.getElementById("loadingModal");
    let modelMeasurementData = {};
    try {
        await traverseAsync(sharedParams.modelGroup, async (child) => {
            if (allModelNames.includes(child.name) && child.visible) {
                let modelMeasurement = {};
                await getModelMeasurement(
                    child,
                    heightMeasurementNames,
                    modelMeasurement
                );
                let modelComponentsData = {};
                modelComponentsData["modelMeasure"] = modelMeasurement;
                await getComponentSize(child, modelComponentsData);

                if (!modelMeasurementData[child.parent.name]) {
                    modelMeasurementData[child.parent.name] = {};
                }

                modelMeasurementData[child.parent.name][child.name] =
                    modelComponentsData;
            }
        });
    } catch (error) {
        console.log(error);
    }

    const username = localStorage.getItem("username");
    const unixTimestamp = Math.floor(Date.now() / 1000);
    const fileName = `${username}_${unixTimestamp}.pdf`;
    dataToSave["ModelData"] = modelMeasurementData;
    dataToSave["action"] = "save_Pdf_data";
    dataToSave["fileName"] = fileName;

    const pdf_data = JSON.stringify(dataToSave);
    fetch("api.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: pdf_data,
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                console.log("Pdf saved successfully!");
                loadingModal.style.display = "none";
                const pdfDownoad = document.createElement("a");
                pdfDownoad.href = data.url;
                pdfDownoad.download = fileName;
                pdfDownoad.click();
            } else {
                console.error("Error saving model data:", data.error);
            }
        })
        .catch((error) => console.error("Fetch error:", error));
}
// --------------------------------export models--------------------------------------------
