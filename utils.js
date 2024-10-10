
import * as THREE from "three";
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import {
    heightMeasurementNames,
    baseFrameTextureNames,
    rodFrameTextureNames,
    allFrameBorderNames,
    allOtherModelNames,
    hangerPartNames,
    baseFrameNames,
    allModelNames,
    rackPartNames,
    hangerNames,
    headerNames,
    rackNames,
    params,
} from './config.js';

const fontLoader = new FontLoader().setPath('./three/examples/fonts/');


export async function getHex(value) {
    return value.replace('0x', '#')
}

export async function getHeaderSize(value) {
    return value.replace('Header_', '')
}

export async function getModelSize(model_name) {
    return model_name.replace('Model_', '')
}

export async function commonMaterial(color) {
    const material = new THREE.MeshPhysicalMaterial({
        color: color, // Black color
        metalness: 0.5, // Full metallic
        roughness: 0.3, // Adjust roughness as needed
    });

    return material
}

export async function commonMaterialNew(color) {
    const material = new THREE.MeshStandardMaterial({
        color: color, // Black color
        metalness: 0, // Full metallic
        roughness: 0.8, // Adjust roughness as needed
    });

    return material
}

export async function getRemoveIcon(removeIconName) {
    // Create the circle geometry for the remove icon
    const removeIconCircleGeometry = new THREE.CircleGeometry(1, 32); // radius 1, 32 segments for smoothness
    const removeIconCircleMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
    const removeIconCircleMesh = new THREE.Mesh(removeIconCircleGeometry, removeIconCircleMaterial);


    // Create the cross lines for the remove icon
    const crossMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });

    // Cross Line 1 (diagonal from top-left to bottom-right)
    const crossGeometry1 = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-0.7, 0.7, 0),  // start point (top-left)
        new THREE.Vector3(0.7, -0.7, 0)   // end point (bottom-right)
    ]);
    const crossLine1 = new THREE.Line(crossGeometry1, crossMaterial);

    // Cross Line 2 (diagonal from top-right to bottom-left)
    const crossGeometry2 = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0.7, 0.7, 0),   // start point (top-right)
        new THREE.Vector3(-0.7, -0.7, 0)  // end point (bottom-left)
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

export async function checkMeshType(type) {
    switch (type) {
        case 'MeshBasicMaterial':
            console.log("This is a MeshBasicMaterial.");
            break;
        case 'MeshStandardMaterial':
            console.log("This is a MeshStandardMaterial.");
            break;
        case 'MeshPhongMaterial':
            console.log("This is a MeshPhongMaterial.");
            break;
        case 'MeshLambertMaterial':
            console.log("This is a MeshLambertMaterial.");
            break;
        case 'MeshPhysicalMaterial':
            console.log("This is a MeshPhysicalMaterial.");
            break;
        case 'MeshNormalMaterial':
            console.log("This is a MeshNormalMaterial.");
            break;
        case 'MeshToonMaterial':
            console.log("This is a MeshToonMaterial.");
            break;
        case 'MeshMatcapMaterial':
            console.log("This is a MeshMatcapMaterial.");
            break;
        case 'LineBasicMaterial':
            console.log("This is a LineBasicMaterial.");
            break;
        case 'LineDashedMaterial':
            console.log("This is a LineDashedMaterial.");
            break;
        case 'PointsMaterial':
            console.log("This is a PointsMaterial.");
            break;
        default:
            console.log("Unknown material type.");
            break;
    }

}

export async function getCurrentModelSize(model, node) {
    const cubeNode = model.getObjectByName(node);
    return getNodeSize(cubeNode);
}

export async function getNodeSize(cubeNode) {
    if (cubeNode) {
        const boundingBox = new THREE.Box3().setFromObject(cubeNode);
        const size = boundingBox.getSize(new THREE.Vector3());
        return size; // Returns an object with x, y, and z dimensions
    } else {
        return false; // Default size in case node is not found
    }
}

export async function setTextureParams(texture) {
    texture.encoding = THREE.sRGBEncoding;
    texture.minFilter = 1008;
    texture.magFilter = THREE.LinearFilter;
    texture.colorSpace = "srgb";
    texture.wrapT = THREE.RepeatWrapping;
    texture.wrapS = THREE.RepeatWrapping;
    texture.flipY = true;

    return texture
}

export async function isHangerAdd(frame, hangermodel, hangerType, hangerArray, hangerPrefix) {
    let conditionFlag = true;

    // Get the Top_Ex node width
    let topExNode = frame.getObjectByName('Top_Ex');

    if (!topExNode) {
        console.error("Top_Ex node not found!");
        return false;
    }

    const topExBoundingBox = new THREE.Box3().setFromObject(topExNode);
    const topExWidth = topExBoundingBox.max.x - topExBoundingBox.min.x;
    // Calculate the total width of hangers already added
    let totalHangerWidth = 0;
    totalHangerWidth -= (params.frameTopExMargin * 2);
    for (let key in hangerArray) {
        if (key.startsWith(hangerPrefix)) {
            let hangerName = key.replace(hangerPrefix, '');
            let hangerArrayKey = hangerPrefix + hangerName;
            if (hangerName && hangerArray[hangerArrayKey] > 0) {
                let hanger = frame.getObjectByName(hangerName);
                if (hanger) {
                    const hangerBoundingBox = new THREE.Box3().setFromObject(hanger);
                    totalHangerWidth += (hangerBoundingBox.max.x - hangerBoundingBox.min.x) * hangerArray[hangerArrayKey];
                }
            }
        }
    }

    // Calculate the current hanger width
    let hanger = hangermodel.getObjectByName(hangerType);
    if (!hanger) {
        console.error("Hanger not found!");
        return false;
    }

    const hangerBoundingBox = new THREE.Box3().setFromObject(hanger);
    const hangerWidth = hangerBoundingBox.max.x - hangerBoundingBox.min.x;

    // Check if total width exceeds available width
    if (totalHangerWidth + hangerWidth > topExWidth) {
        conditionFlag = false;
    }


    return conditionFlag;
}

export async function isHangerAdd1(hangerType, hangerArray, hangerArrayKey) {
    let conditionFlag = true;
    let modelSize = await getModelSize(params.defaultModel);
    if (['Hanger_Rail_Step', 'Hanger_Rail_Single', 'Hanger_Golf_Club_Iron', 'Hanger_Golf_Club_Driver'].includes(hangerType)) {
        if (hangerArray[hangerArrayKey] >= 1 && modelSize <= 600) {
            conditionFlag = false
        }
        else if (hangerArray[hangerArrayKey] >= 2 && modelSize <= 1200) {
            conditionFlag = false
        }
        // else if (hangerArray[hangerArrayKey] >= 2 && modelSize <= 1500 ) {
        //     conditionFlag = false
        // }
        // else if (hangerArray[hangerArrayKey] >= 3 && modelSize <= 2000 ) {
        //     conditionFlag = false
        // }
        // else if (hangerArray[hangerArrayKey] >= 4 && modelSize <= 3000 ) {
        //     conditionFlag = false
        // }
    }
    else if (hangerType == 'Hanger_Rail_D_500mm') {
        if (hangerArray[hangerArrayKey] >= 1 && modelSize < 1000) {
            conditionFlag = false
        }
        else if (hangerArray[hangerArrayKey] >= 2 && modelSize <= 1500) {
            conditionFlag = false
        }
        else if (hangerArray[hangerArrayKey] >= 3 && modelSize <= 2000) {
            conditionFlag = false
        }
        else if (hangerArray[hangerArrayKey] >= 5 && modelSize <= 3000) {
            conditionFlag = false
        }
    }
    else if (hangerType == 'Hanger_Rail_D_1000mm') {
        if (modelSize < 1000) {
            conditionFlag = false
        }
        else if (hangerArray[hangerArrayKey] >= 1 && modelSize <= 2000) {
            conditionFlag = false
        }
        else if (hangerArray[hangerArrayKey] >= 2 && modelSize <= 3000) {
            conditionFlag = false
        }
    }
    return conditionFlag
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

export async function createRod(modelNode, modelSize, header_rod_model, header_glass_shelf_fixing_model) {
    const rodSize = await getNodeSize(header_rod_model);

    const additionalRods = await getRodCount(modelSize);

    // console.log(modelSize)
    const header = modelNode.getObjectByName('Header_300');

    // Ensure both header and frame nodes exist
    if (header) {
        const headerSize = await getNodeSize(header); // Size of the current header

        const headerBox = new THREE.Box3().setFromObject(header);

        let rodY = headerBox.min.y + params.cameraPosition + rodSize.y / 2;//(frameSize.y / 2 + rodSize.y / 2);
        let lassShelfFixingY = params.glassShelfFixingSize.y / 2;//(frameSize.y / 2 + glassShelfFixingSize.y / 2);

        // Function to create and position a rod
        const createAndPositionRod = async (xOffset, rodName, shelfFixingName) => {
            let rod = header_rod_model.clone();
            rod.name = rodName;
            rod.position.set(
                header.position.x + xOffset, // Adjust based on offset
                rod.position.y + rodY,
                rod.position.z
            );
            rod.visible = false
            modelNode.attach(rod);

            const rodBox = new THREE.Box3().setFromObject(rod);

            let shelf_fixing = header_glass_shelf_fixing_model.clone();
            shelf_fixing.name = shelfFixingName;
            shelf_fixing.position.set(
                rod.position.x, // Adjust based on offset
                shelf_fixing.position.y + lassShelfFixingY,
                shelf_fixing.position.z
            );
            shelf_fixing.visible = false
            modelNode.attach(shelf_fixing);
        };

        let margin = 50;

        // Place the left and right rods first
        await createAndPositionRod(-headerSize.x / 2 + rodSize.x + margin, "Rod", "Glass_Shelf_Fixing"); // Left Rod
        await createAndPositionRod(headerSize.x / 2 - rodSize.x - margin, "Rod", "Glass_Shelf_Fixing"); // Right Rod

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
}

export async function createRod1(modelNode, modelSize, header_rod_model, header_glass_shelf_fixing_model) {
    header_glass_shelf_fixing_model.scale.set(10, 10, 10)

    const rodSize = await getNodeSize(header_rod_model);

    const additionalRods = await getRodCount(modelSize);

    // console.log(modelSize)
    const header = modelNode.getObjectByName('Header_300');

    // Ensure both header and frame nodes exist
    if (header) {
        const headerSize = await getNodeSize(header); // Size of the current header

        const headerBox = new THREE.Box3().setFromObject(header);

        let rodY = headerBox.min.y + params.cameraPosition + rodSize.y / 2;//(frameSize.y / 2 + rodSize.y / 2);
        // let lassShelfFixingY = headerBox.max.y  - params.glassShelfFixingSize.y / 2;//(frameSize.y / 2 + glassShelfFixingSize.y / 2);
        // console.log('headerBox', headerBox)
        // console.log('rodSize', rodSize)
        // console.log('params.glassShelfFixingSize', params.glassShelfFixingSize)
        // console.log('shelf_fixing', shelf_fixing)
        // Function to create and position a rod
        const createAndPositionRod = async (xOffset, rodName, shelfFixingName) => {
            let rod = header_rod_model.clone();
            rod.name = rodName;
            // var p =rod.position.clone()
            rod.position.set(
                header.position.x + xOffset, // Adjust based on offset
                rod.position.y + rodY,
                rod.position.z
            );

            // var axesHelper = new THREE.AxesHelper(5);
            // rod.add(axesHelper);
            rod.visible = false
            modelNode.attach(rod);

            const rodBox = new THREE.Box3().setFromObject(header_rod_model);

            let rodHeight = rodBox.max.y - rodBox.min.y
            // console.log('rodBox', rodBox)




            let shelf_fixing = header_glass_shelf_fixing_model.clone();
            shelf_fixing.updateMatrixWorld(true);
            const shelf_fixingBox = new THREE.Box3().setFromObject(shelf_fixing);
            let shelf_fixingHeight = shelf_fixingBox.max.y - shelf_fixingBox.min.y
            let lassShelfFixingY = rodBox.max.y - 18;
            shelf_fixing.name = shelfFixingName;
            shelf_fixing.position.set(
                rod.position.x, // Adjust based on offset
                lassShelfFixingY,
                shelf_fixing.position.z
            );



            // shelf_fixing.position.set(
            //     20, // Adjust based on offset
            //     20,
            //     20
            // );
            shelf_fixing.visible = false
            modelNode.attach(shelf_fixing);

        };

        let margin = 5;

        // Place the left and right rods first
        await createAndPositionRod(-headerSize.x / 2 + rodSize.x + margin, "Rod", "Glass_Shelf_Fixing"); // Left Rod
        await createAndPositionRod(headerSize.x / 2 - rodSize.x - margin, "Rod", "Glass_Shelf_Fixing"); // Right Rod

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
}

export async function loadModel(modelLoader, model_name) {
    let model_load = await modelLoader.loadAsync(model_name);
    let model = model_load.scene;
    model.scale.set(1, 1, 1);
    model.position.set(0, -params.cameraPosition, 0);
    model.castShadow = true;
    // model.visible = false;
    // scene.add(model);
    return model
}
// Create a function to load GLTF models using a Promise
export async function loadGLTFModel(loader, url) {
    return new Promise((resolve, reject) => {
        loader.load(
            url,
            function (model_load) {
                let model = model_load.scene;
                // model.position.set(0, 0, 0);  // Reset position to the origin
                model.position.set(0, -params.cameraPosition, 0);
                model.scale.set(1, 1, 1);
                model.updateMatrixWorld();
                // Scale down the model
                // model.scale.set(0.1, 0.1, 0.1); // Adjust the scale if necessary
                resolve(model);
            },
            undefined,
            function (error) {
                reject(error);
            }
        );
    });
}

export async function setupMainModel(main_model) {
    main_model.traverse(async function (modelNode) {
        if (modelNode.name == 'Model_661') {
            modelNode.name = 'Model_600'
        }
        if (modelNode.name == 'Model_1061') {
            modelNode.name = 'Model_900'
        }

        if (modelNode.name && modelNode.name.startsWith('Base_Option')) {
            // if (modelNode.material && baseFrameTextureNames.includes(modelNode.name)) {
            const material = await commonMaterial(parseInt(params.baseFrameColor, 16))
            modelNode.material = material
            modelNode.material.needsUpdate = true;

        }


        if (allModelNames.includes(modelNode.name)) {
            if (modelNode.name === params.defaultModel) {
                modelNode.visible = true;
            }
            else {
                modelNode.visible = false;
            }

            let header_300 = modelNode.getObjectByName('Header');
            if (header_300) {
                header_300.name = header_300.name + "_" + 300;
            }

        }
    });

    // console.log(main_model)
}

export async function setupGlassShelfFixingModel(main_model, header_rod_model, header_glass_shelf_fixing_model) {
    let modelSize;
    if (header_glass_shelf_fixing_model) {
        header_glass_shelf_fixing_model = await updateModelName(header_glass_shelf_fixing_model, '__Glass_Shelf_Fixing', 'Glass_Shelf_Fixing')
    }
    if (header_rod_model) {
        await header_rod_model.traverse(async function (child) {
            if (child.material && rodFrameTextureNames.includes(child.name)) {
                const material = await commonMaterial(parseInt(params.rodFrameColor, 16))
                child.material = material
                child.material.needsUpdate = true;
            }
        });
    }

    await main_model.traverse(async function (modelNode) {
        if (allModelNames.includes(modelNode.name)) {
            modelSize = await getModelSize(modelNode.name);

            if (header_rod_model && header_glass_shelf_fixing_model) {
                await createRod(modelNode, modelSize, header_rod_model, header_glass_shelf_fixing_model)
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
        if (pattern.test(child.name) || child.name == oldName) {  // If the child name matches the pattern
            // console.log('Updating:', child.name, 'to', newName);
            child.name = newName;  // Update the name directly
        }
    });

    return model;
}

export async function updateMainModelName(model) {
    model.traverse(async function (modelNode) {
        if (modelNode.name == 'Model_661') {
            modelNode.name = 'Model_600';
        }
        if (modelNode.name == 'Model_1061') {
            modelNode.name = 'Model_900';
        }
    })
    return model;
}

export async function setupHeader500HeightModel(main_model, header_500_height_model) {
    let header;
    if (header_500_height_model) {
        // console.log('header_500_height_model', header_500_height_model)
        header_500_height_model = await updateMainModelName(header_500_height_model)

        main_model.traverse(async function (modelNode) {
            if (allModelNames.includes(modelNode.name)) {
                let header_300 = modelNode.getObjectByName('Header_300');
                let header_500_model = header_500_height_model.getObjectByName(modelNode.name);

                if (header_300 && header_500_model) {
                    header = await getModelNode(header_500_model, 'Header');
                    if (!header) {
                        header = await getModelNode(header_500_model, 'Header_');
                    }
                    if (header) {
                        header = await updateModelName(header, 'Header_Frame_', 'Header_Frame')

                        header = await updateModelName(header, 'Header_Graphic1', 'Header_Graphic1')
                        header = await updateModelName(header, 'Header_Graphic1_', 'Header_Graphic1')
                        header = await updateModelName(header, 'Header_Graphic1-Mat', 'Header_Graphic1-Mat')
                        header = await updateModelName(header, 'Header_Graphic1-Mat_', 'Header_Graphic1-Mat')
                        header = await updateModelName(header, 'Header_Graphic1-Fabric_Colour', 'Header_Graphic1-Fabric_Colour')
                        header = await updateModelName(header, 'Header_Graphic1-Fabric_Colour_', 'Header_Graphic1-Fabric_Colour')

                        header = await updateModelName(header, 'Header_Graphic2', 'Header_Graphic2')
                        header = await updateModelName(header, 'Header_Graphic2_', 'Header_Graphic2')
                        header = await updateModelName(header, 'Header_Graphic2-Mat', 'Header_Graphic2-Mat')
                        header = await updateModelName(header, 'Header_Graphic2-Mat_', 'Header_Graphic2-Mat')
                        header = await updateModelName(header, 'Header_Graphic2-Fabric_Colour', 'Header_Graphic2-Fabric_Colour')
                        header = await updateModelName(header, 'Header_Graphic2-Fabric_Colour_', 'Header_Graphic2-Fabric_Colour')


                        header.name = "Header_500";
                        header.visible = false;
                        modelNode.attach(header);
                    }
                }
            }
        });

    }
}


export async function setupHeaderWoodenShelfModel(main_model, header_wooden_shelf_model) {
    let model;
    header_wooden_shelf_model = await updateMainModelName(header_wooden_shelf_model)

    main_model.traverse(async function (modelNode) {

        if (allModelNames.includes(modelNode.name)) {
            if (header_wooden_shelf_model) {
                model = header_wooden_shelf_model.getObjectByName(modelNode.name);
                if (model) {
                    model.name = "Header_Wooden_Shelf";
                    model.visible = false;
                    modelNode.attach(model);
                }
            }


        }
    });


}

export async function setupHeaderGlassShelfModel(main_model, header_glass_shelf_model, texture_background) {
    let model;
    if (header_glass_shelf_model) {
        header_glass_shelf_model = await updateMainModelName(header_glass_shelf_model)

        header_glass_shelf_model.traverse(async function (child) {

            if (child.material) {
                child.material = await generateGlassMaterial(texture_background)
                // child.material = await commonMaterial(0xffffff)
                child.material.needsUpdate = true;
            }
        });
    }

    main_model.traverse(function (modelNode) {
        if (allModelNames.includes(modelNode.name)) {
            if (header_glass_shelf_model) {
                model = header_glass_shelf_model.getObjectByName(modelNode.name);
                if (model) {
                    model.name = "Header_Glass_Shelf";
                    model.visible = false;
                    model.position.y = params.glassShelfFixingSize.y / 2;
                    modelNode.attach(model);
                }
            }
        }
    });

}

export async function setupSlottedSidesModel(main_model, slotted_sides_model) {
    let slotted_left_side, slotted_right_side, frame;
    // console.log('slotted_sides_model', slotted_sides_model)
    if (slotted_sides_model) {
        slotted_sides_model = await updateMainModelName(slotted_sides_model)
        slotted_sides_model = await updateModelName(slotted_sides_model, 'Left_Ex_Slotted_', 'Left_Ex_Slotted')
        slotted_sides_model = await updateModelName(slotted_sides_model, 'Left_Ex_Slotted', 'Left_Ex_Slotted')
        slotted_sides_model = await updateModelName(slotted_sides_model, 'Left_Ex_Slotted-Inside_Profile_', 'Left_Ex_Slotted-Inside_Profile')
        slotted_sides_model = await updateModelName(slotted_sides_model, 'Left_Ex_Slotted-Frame_', 'Left_Ex_Slotted-Frame')


        slotted_sides_model = await updateModelName(slotted_sides_model, 'Right_Ex_Slotted_', 'Right_Ex_Slotted')
        slotted_sides_model = await updateModelName(slotted_sides_model, 'Right_Ex_Slotted', 'Right_Ex_Slotted')
        slotted_sides_model = await updateModelName(slotted_sides_model, 'Right_Ex_Slotted-Inside_Profile_', 'Left_Ex_Slotted-Inside_Profile')
        slotted_sides_model = await updateModelName(slotted_sides_model, 'Right_Ex_Slotted-Frame_', 'Left_Ex_Slotted-Frame')
    }

    main_model.traverse(async function (modelNode) {
        if (allModelNames.includes(modelNode.name)) {
            frame = modelNode.getObjectByName('Frame');

            if (slotted_sides_model) {
                let slotted_sides_ = slotted_sides_model.clone();
                let slotted_sides = slotted_sides_.getObjectByName(modelNode.name);

                if (slotted_sides) {


                    slotted_left_side = slotted_sides.getObjectByName('Left_Ex_Slotted');
                    if (slotted_left_side) {
                        slotted_left_side.visible = false;
                        frame.attach(slotted_left_side);
                    }

                    slotted_right_side = slotted_sides.getObjectByName('Right_Ex_Slotted');
                    if (slotted_right_side) {
                        slotted_right_side.visible = false;
                        frame.attach(slotted_right_side);
                    }
                }
            }

            // console.log('frame', frame)


        }
    });

}


export async function setupWoodenRackModel(main_model, rack_wooden_model) {
    // console.log('rack_wooden_model', rack_wooden_model)

    if (rack_wooden_model) {
        rack_wooden_model = await updateMainModelName(rack_wooden_model)
        rack_wooden_model = await updateModelName(rack_wooden_model, 'Rack_Wooden_Shelf_', 'Rack_Wooden_Shelf')
        rack_wooden_model = await updateModelName(rack_wooden_model, 'Rack_Stand_LH_', 'Rack_Stand_LH')
        rack_wooden_model = await updateModelName(rack_wooden_model, 'Rack_Stand_LH', 'Rack_Stand_LH')
        rack_wooden_model = await updateModelName(rack_wooden_model, 'Rack_Stand_RH_', 'Rack_Stand_RH')
        rack_wooden_model = await updateModelName(rack_wooden_model, 'Rack_Stand_RH', 'Rack_Stand_RH')
        rack_wooden_model.traverse(async function (child) {
            if (child.material && rackPartNames.includes(child.name)) {
                const material = await commonMaterial(parseInt(params.defaultRackColor, 16))
                child.material = material
                child.material.needsUpdate = true;
            }
        });
    }

}

export async function setupGlassRackModel(main_model, rack_glass_model, texture_background) {
    // console.log('rack_glass_model', rack_glass_model)

    if (rack_glass_model) {
        rack_glass_model = await updateMainModelName(rack_glass_model)
        rack_glass_model = await updateModelName(rack_glass_model, 'Rack_Glass_Shelf_', 'Rack_Glass_Shelf')
        rack_glass_model = await updateModelName(rack_glass_model, 'Rack_Stand_LH_', 'Rack_Stand_LH')
        rack_glass_model = await updateModelName(rack_glass_model, 'Rack_Stand_RH_', 'Rack_Stand_RH')

        const glassMaterial = await generateGlassMaterial(texture_background);
        const defaultMaterial = await commonMaterial(parseInt(params.defaultRackColor, 16));

        rack_glass_model.traverse(async function (child) {
            if (rackPartNames.includes(child.name)) {
                let material = child.name === 'Rack_Glass_Shelf' ? glassMaterial : defaultMaterial;

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

export async function setupHangerModel(main_model, hanger_model) {
    if (hanger_model) {
        hanger_model = await updateModelName(hanger_model, '__Hanger_Rail_Step', 'Hanger_Rail_Step')
        hanger_model = await updateModelName(hanger_model, '__Hanger_Rail_Single', 'Hanger_Rail_Single')

        hanger_model = await updateModelName(hanger_model, 'Hanger_Stand_', 'Hanger_Stand')
        hanger_model = await updateModelName(hanger_model, 'Hanger_Stand-Fixture_Material_', 'Hanger_Stand-Arm_Metal')

        hanger_model = await updateModelName(hanger_model, 'Clothing_', 'Clothing')
        hanger_model = await updateModelName(hanger_model, 'Clothing-Mat2', 'Clothing-Mat')
        hanger_model = await updateModelName(hanger_model, 'Clothing-Mat1_', 'Clothing-Mat')
        hanger_model = await updateModelName(hanger_model, 'Clothing-Mat2_', 'Clothing-Mat')
        hanger_model = await updateModelName(hanger_model, 'Clothing-Shirt_Colour_', 'Clothing-Shirt_Colour')
        hanger_model.traverse(async function (child) {
            if (child.material && ['Clothing-Shirt_Colour'].includes(child.name)) {
                // const material = await commonMaterialNew(parseInt(params.defaultClothingColor, 16))
                // child.material = material
                // child.material.needsUpdate = true;
                child.material.color.set(await getHex(params.defaultClothingColor));
                child.material.needsUpdate = true;
            }
            if (child.material && ['Hanger_Stand'].includes(child.name)) {
                const material = await commonMaterial(parseInt(params.defaultHangerStandColor, 16))
                child.material = material
                child.material.needsUpdate = true;
            }
        });

        // console.log('hanger_model_update', hanger_model)
    }

}

export async function setupHangerGolfClubModel(main_model, hanger_golf_club_model) {
    if (hanger_golf_club_model) {
        // console.log('hanger_golf_club_model', hanger_golf_club_model)
        hanger_golf_club_model = await updateModelName(hanger_golf_club_model, 'Hanger_Stand_', 'Hanger_Stand')
        hanger_golf_club_model = await updateModelName(hanger_golf_club_model, 'Hanger_Stand-Arm_Rubber_', 'Hanger_Stand-Arm_Rubber')
        hanger_golf_club_model = await updateModelName(hanger_golf_club_model, 'Hanger_Stand-Arm_Metal_', 'Hanger_Stand-Arm_Metal')

        hanger_golf_club_model = await updateModelName(hanger_golf_club_model, 'Hanger_Clubs_', 'Hanger_Clubs')
        hanger_golf_club_model = await updateModelName(hanger_golf_club_model, 'Hanger_Clubs-Club_Grip_Rubber_', 'Hanger_Clubs-Club_Grip_Rubber')
        hanger_golf_club_model = await updateModelName(hanger_golf_club_model, 'Hanger_Clubs-Driver_Shaft_Metalic_', 'Hanger_Clubs-Driver_Shaft_Metalic')

        hanger_golf_club_model = await updateModelName(hanger_golf_club_model, 'Hanger_Faceplate_', 'Hanger_Faceplate')
        hanger_golf_club_model = await updateModelName(hanger_golf_club_model, 'Hanger_Faceplate-Arm_Metal_', 'Hanger_Faceplate-Arm_Metal')
        hanger_golf_club_model = await updateModelName(hanger_golf_club_model, 'Hanger_Faceplate-Logo_', 'Hanger_Faceplate-Logo')

        // console.log('hanger_golf_club_model', hanger_golf_club_model)

        hanger_golf_club_model.traverse(async function (child) {
            // if (child.name == "Iron_Arm_1") {
            //     child.name = 'Hanger_Stand';
            // }
            // if (child.name == "Driver_Arm") {
            //     child.name = 'Hanger_Stand';
            // }
            if (child.material && ['Hanger_Stand'].includes(child.name)) {
                // const material = await commonMaterial(parseInt(params.defaultHangerStandColor, 16))
                // child.material = material
                // child.material.needsUpdate = true;
            } else if (child.material && ['Hanger_Clubs'].includes(child.name)) {
                // const material = await commonMaterial(parseInt('0x444444', 16))
                // child.material = material
                // child.material.needsUpdate = true;
            } else if (child.material && ['Hanger_Faceplate'].includes(child.name)) {
                // const material = await commonMaterial(parseInt('0x444444', 16))
                // child.material = material
                // child.material.needsUpdate = true;
            } else {
                // const material = await commonMaterial(parseInt(params.defaultHangerStandColor, 16))
                // child.material = material
                // child.material.needsUpdate = true;
            }
        });
    }

}

export async function setupModel(main_model, header_500_height_model, header_wooden_shelf_model, header_rod_model, header_glass_shelf_fixing_model, header_glass_shelf_model, slotted_sides_model, hanger_model, rack_wooden_model, rack_glass_model) {
    let modelSize, model, header, slotted_left_side, slotted_right_side, frame;

    if (header_glass_shelf_model) {
        header_glass_shelf_model.traverse(async function (child) {
            if (child.material) {
                child.material = await generateGlassMaterial(texture_background)
                // child.material = await commonMaterial(0xffffff)
                child.material.needsUpdate = true;
            }
        });
    }

    if (header_rod_model) {
        header_rod_model.traverse(async function (child) {
            if (child.material && rodFrameTextureNames.includes(child.name)) {
                const material = await commonMaterial(parseInt(params.rodFrameColor, 16))
                child.material = material
                child.material.needsUpdate = true;
            }
        });
    }

    if (hanger_model) {
        hanger_model.traverse(async function (child) {
            if (child.material && ['Clothing'].includes(child.name)) {
                const material = await commonMaterialNew(parseInt(params.defaultClothingColor, 16))
                child.material = material
                child.material.needsUpdate = true;
            }
            if (child.material && ['Hanger_Stand'].includes(child.name)) {
                const material = await commonMaterial(parseInt(params.defaultHangerStandColor, 16))
                child.material = material
                child.material.needsUpdate = true;
            }
        });
    }

    if (rack_wooden_model) {
        rack_wooden_model.traverse(async function (child) {
            if (child.material && rackNames.includes(child.name)) {
                const material = await commonMaterial(parseInt(params.defaultRackColor, 16))
                child.material = material
                child.material.needsUpdate = true;
            }
        });
    }

    if (rack_glass_model) {
        // Create materials once
        const glassMaterial = await generateGlassMaterial(texture_background);
        const defaultMaterial = await commonMaterial(parseInt(params.defaultRackColor, 16));

        rack_glass_model.traverse(async function (child) {
            if (rackNames.includes(child.name)) {
                let material = child.name === 'Rack_Glass_Shelf' ? glassMaterial : defaultMaterial;

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

    main_model.traverse(async function (modelNode) {
        if (modelNode.material && baseFrameTextureNames.includes(modelNode.name)) {
            const material = await commonMaterial(parseInt(params.baseFrameColor, 16))
            modelNode.material = material
            modelNode.material.needsUpdate = true;
        }
        if (allModelNames.includes(modelNode.name)) {
            modelSize = await getModelSize(modelNode.name);
            frame = await modelNode.getObjectByName('Frame');

            if (header_500_height_model) {
                model = await header_500_height_model.getObjectByName(modelNode.name);
                header = await model.getObjectByName('Header');
                if (header) {
                    header.name = header.name + "_" + 500;
                    header.visible = false;
                    modelNode.attach(header);
                }
            }

            if (slotted_sides_model) {
                model = await slotted_sides_model.getObjectByName(modelNode.name);
                if (model) {
                    slotted_left_side = await model.getObjectByName('Left_Ex_Slotted');
                    if (slotted_left_side) {
                        slotted_left_side.visible = false;
                        frame.attach(slotted_left_side);
                    }

                    slotted_right_side = await model.getObjectByName('Right_Ex_Slotted');
                    if (slotted_right_side) {
                        slotted_right_side.visible = false;
                        frame.attach(slotted_right_side);
                    }
                }
            }

            if (header_wooden_shelf_model) {
                model = await header_wooden_shelf_model.getObjectByName(modelNode.name);
                if (model) {
                    model.name = "Header_Wooden_Shelf";
                    model.visible = false;
                    modelNode.attach(model);
                }
            }

            if (header_rod_model && header_glass_shelf_fixing_model) {
                await createRod(modelNode, modelSize, header_rod_model, header_glass_shelf_fixing_model)
            }

            if (header_glass_shelf_model) {
                model = await header_glass_shelf_model.getObjectByName(modelNode.name);
                if (model) {

                    model.name = "Header_Glass_Shelf";
                    model.visible = false;
                    model.position.y = params.glassShelfFixingSize.y / 2;
                    modelNode.attach(model);
                }
            }

            if (modelNode.name === params.defaultModel) {
                modelNode.visible = true;
            }
            else {
                modelNode.visible = false;
            }

            let header_300 = await modelNode.getObjectByName('Header');
            if (header_300) {
                header_300.name = header_300.name + "_" + 300;
            }
        }
    });

    console.log(main_model)
}

export async function updateFrameSize(main_model, scene, camera) {
    if (main_model) {
        main_model.traverse(function (modelNode) {
            if (allModelNames.includes(modelNode.name)) {
                if (modelNode.name === params.defaultModel) {
                    modelNode.visible = true;  // Show the selected model
                } else {
                    modelNode.visible = false; // Hide other models
                }
            }
        });

        let currentModel = main_model.getObjectByName(params.defaultModel);
        let shelfModel = currentModel.getObjectByName('Header_Wooden_Shelf')
        if (shelfModel) {
            params.isShelf = true
        }
        else {
            params.isShelf = false
        }

        let glassShelfModel = currentModel.getObjectByName('Header_Glass_Shelf')
        if (glassShelfModel) {
            params.isGlassShelf = true
        }
        else {
            params.isGlassShelf = false
        }

        let SlottedSideModel = currentModel.getObjectByName('Left_Ex_Slotted')
        if (SlottedSideModel) {
            params.isSlottedSides = true
        }
        else {
            params.isSlottedSides = false
        }

    }

    await showHideNodes(main_model, scene, camera)
}

export async function showHideNodes(main_model, scene, camera) {
    console.log('main_model', main_model);
    if (main_model) {
        main_model.traverse(async function (child) {
            // let tempNode;

            // for (let val of hangerNames) {
            //     tempNode = await findParentNodeByName(child, val, true);
            //     if (tempNode) {
            //         selectedNode = tempNode
            //         break;
            //     }
            // }

            child.updateMatrixWorld();
            if (child.name === "Left_Ex" || child.name === "Right_Ex") {
                if (params.isSlottedSides && params.slottedSidesToggle) {
                    child.visible = false;
                }
                else {
                    child.visible = true;
                }
            }
            if (hangerNames.includes(child.name)) {
                if (params.isSlottedSides && params.slottedSidesToggle) {
                    child.visible = false;
                }
                else {
                    child.visible = true;
                }
            }
            if (child.name === "Left_Ex_Slotted" || child.name === "Right_Ex_Slotted") {
                if (params.isSlottedSides && params.slottedSidesToggle) {
                    child.visible = true;
                }
                else {
                    child.visible = false;
                }
            }
            if (rackNames.includes(child.name)) {
                if (params.isSlottedSides && params.slottedSidesToggle) {
                    child.visible = true;
                }
                else {
                    child.visible = false;
                }
            }
            if (child.name === "Header_Wooden_Shelf") {
                child.visible = params.topOption == 'Shelf' && params.isShelf && params.defaultShelfType == 'Header_Wooden_Shelf';
            }
            if (child.name === "Header_Glass_Shelf") {
                child.visible = params.topOption == 'Shelf' && params.isGlassShelf && params.defaultShelfType == 'Header_Glass_Shelf';
            }
            if (child.name === "Rod") {
                child.visible = (params.topOption == 'Shelf' && ((params.isShelf && params.defaultShelfType == 'Header_Wooden_Shelf') || (params.isGlassShelf && params.defaultShelfType == 'Header_Glass_Shelf'))) || (params.headerRodToggle && params.topOption == 'Header');
            }
            if (child.name === "Glass_Shelf_Fixing") {
                child.visible = params.topOption == 'Shelf' && params.isGlassShelf && params.defaultShelfType == 'Header_Glass_Shelf';
            }
            if (['Clothing'].includes(child.name)) {
                child.visible = params.hangerClothesToggle;
            }
            if (['Hanger_Clubs'].includes(child.name)) {
                child.visible = params.hangerGolfClubsToggle;
            }

            if (headerNames.includes(child.name)) {
                child.visible = params.topOption == 'Header' && params.defaultHeaderSize == child.name;
            }

            if (baseFrameNames.includes(child.name)) {
                child.visible = (child.name === params.selectedBaseFrame);
            }

            // if (child.material && baseFrameTextureNames.includes(child.name) && child.material.color) {
            if (child.material && child.material.color && child.name && child.name.startsWith('Base_Option')) {
                child.material.color.set(await getHex(params.baseFrameColor));
                child.material.needsUpdate = true;
            }
            if (child.material && rodFrameTextureNames.includes(child.name) && child.material.color) {
                child.material.color.set(await getHex(params.rodFrameColor));
                child.material.needsUpdate = true;
            }
            if (child.material && ['Hanger_Stand', 'Hanger_Stand-Arm_Metal'].includes(child.name) && child.material.color) {
                child.material.color.set(await getHex(params.defaultHangerStandColor));
                child.material.needsUpdate = true;
            }
            if (child.material && ['Rack_Wooden_Shelf'].includes(child.name) && child.material.color) {
                console.log('child', child)
                child.material.color.set(await getHex(params.defaultRackShelfStandColor));
                child.material.needsUpdate = true;
            }
            if (['Rack_Stand_LH', 'Rack_Stand_RH'].includes(child.name)) {
                if (child.material) {
                    child.material.color.set(await getHex(params.defaultRackStandStandColor));
                    child.material.needsUpdate = true;
                }
                else {
                    child.traverse(async function (mesh) {
                        if (mesh.material) {
                            mesh.material.color.set(await getHex(params.defaultRackStandStandColor));
                            mesh.material.needsUpdate = true;
                        }
                    });
                }
            }
        });

        if (params.topOption == 'Header') {
            main_model.traverse(function (modelNode) {
                if (allModelNames.includes(modelNode.name)) {
                    headerNames.forEach(function (headerName) {
                        const header = modelNode.getObjectByName(headerName);
                        if (header) { // Check if header is not null
                            if (params.headerRodToggle && !params.headerUpDown) {
                                header.position.y += params.rodSize.y;
                            } else if (!params.headerRodToggle && params.headerUpDown) {
                                header.position.y -= params.rodSize.y;
                            }
                        } else {
                            // console.warn(`Header with name "${headerName}" not found in modelNode "${modelNode.name}".`);
                        }
                    });
                }
            });

            params.headerUpDown = params.headerRodToggle
        }

        await drawMeasurementBoxesWithLabels(main_model, scene, camera)

    }

    if (params.topOption == 'Shelf') {
        document.querySelectorAll('.topHeaderOptions').forEach(element => {
            element.style.display = 'none';
        });
        document.querySelectorAll('.topShelfOptions').forEach(element => {
            element.style.display = 'block';
        });
    }
    else if (params.topOption == 'Header') {
        document.querySelectorAll('.topHeaderOptions').forEach(element => {
            element.style.display = 'block';
        });
        document.querySelectorAll('.topShelfOptions').forEach(element => {
            element.style.display = 'none';
        });
    }
    else {
        document.querySelectorAll('.topHeaderOptions').forEach(element => {
            element.style.display = 'none';
        });
        document.querySelectorAll('.topShelfOptions').forEach(element => {
            element.style.display = 'none';
        });
    }

    if ((params.topOption == 'Header' && params.headerRodToggle) || (params.topOption == 'Shelf' && ((params.isShelf && params.defaultShelfType == 'Header_Wooden_Shelf') || (params.isGlassShelf && params.defaultShelfType == 'Header_Glass_Shelf')))) {
        document.querySelectorAll('.headerRodColorDropdownBox').forEach(element => {
            element.style.display = 'block';
        });
    }
    else {
        document.querySelectorAll('.headerRodColorDropdownBox').forEach(element => {
            element.style.display = 'none';
        });
    }

    if (params.topOption == 'Shelf' && ((params.isShelf && params.defaultShelfType == 'Header_Wooden_Shelf'))) {
        document.querySelectorAll('.shelfTypeBox').forEach(element => {
            element.style.display = 'block';
        });
    }
    else {
        document.querySelectorAll('.shelfTypeBox').forEach(element => {
            element.style.display = 'none';
        });
    }

    if (params.topOption == 'Header' && params.headerOptions == 'SEG') {
        document.querySelectorAll('.headerFrameColorDropdownBox').forEach(element => {
            element.style.display = 'none';
        });
        document.querySelectorAll('.headerFrameColorInputBox').forEach(element => {
            element.style.display = 'block';
        });
    }
    else if (params.topOption == 'Header' && params.headerOptions == 'ALG') {
        document.querySelectorAll('.headerFrameColorDropdownBox').forEach(element => {
            element.style.display = 'block';
        });
        document.querySelectorAll('.headerFrameColorInputBox').forEach(element => {
            element.style.display = 'none';
        });
    }
    else if (params.topOption == 'Header' && params.headerOptions == 'ALG3D') {
        document.querySelectorAll('.headerFrameColorDropdownBox').forEach(element => {
            element.style.display = 'none';
        });
        document.querySelectorAll('.headerFrameColorInputBox').forEach(element => {
            element.style.display = 'block';
        });
    }
    else {
        document.querySelectorAll('.headerFrameColorDropdownBox').forEach(element => {
            element.style.display = 'none';
        });
        document.querySelectorAll('.headerFrameColorInputBox').forEach(element => {
            element.style.display = 'none';
        });
    }

}

// Function to find the next visible child
export async function getPrevVisibleChild(main_model, currentModel) {
    const children = main_model.children; // Get all children of main_model
    let currentIndex = -1;

    // Find the current model index
    for (let i = 0; i < children.length; i++) {
        if (children[i].visible && children[i].name === currentModel.name) {
            currentIndex = i;
            break;
        }
    }

    // Loop through the children to find the next visible child
    for (let i = (currentIndex + 1) % children.length; i !== currentIndex; i = (i + 1) % children.length) {
        if (children[i].visible) {
            return children[i];
        }
    }

    return null; // No next visible child found
}

// Function to find the previous visible child
export async function getNextVisibleChild(main_model, currentModel) {
    const children = main_model.children; // Get all children of main_model
    let currentIndex = -1;

    // Find the current model index
    for (let i = 0; i < children.length; i++) {
        if (children[i].visible && children[i].name === currentModel.name) {
            currentIndex = i;
            break;
        }
    }

    // Loop through the children to find the previous visible child
    for (let i = (currentIndex - 1 + children.length) % children.length; i !== currentIndex; i = (i - 1 + children.length) % children.length) {
        if (children[i].visible) {
            return children[i];
        }
    }

    return null; // No previous visible child found
}

export async function loaderShowHide(isShow = false) {
    if (isShow) {
        document.body.classList.remove('loaded');
    }
    else {
        document.body.classList.add('loaded');
    }
}

export async function updateFrameMaterial(main_model, dropdownType, type, value) {
    // Update Three.js material
    main_model.traverse(async function (child) {
        // console.log('child.name', child.name)
        if (allFrameBorderNames.includes(child.name) && dropdownType === 'frame') {
            // console.log('Frame', dropdownType, child.name)
            if (type === "texture") {
                console.log('child.name', child.name)

                // Load texture
                let texture_border = new THREE.TextureLoader().load("./assets/images/borders/" + value);
                texture_border = await setTextureParams(texture_border);

                border_texture_material.map = texture_border;
                child.material = border_texture_material;
                child.material.needsUpdate = true;
                // let texture_border = new THREE.TextureLoader().load("./assets/images/borders/" + "Black-Wallnut.jpg");

                // texture_border = await setTextureParams(texture_border);
                // const newMaterial = new THREE.MeshStandardMaterial({
                //     map: texture_border,            // Base color texture
                //     roughness: 0.2,          // Adjust as needed
                //     metalness: 0.7           // Adjust as needed
                // });
                // child.material = newMaterial;
                // child.material.needsUpdate = true;
            } else if (type === "color") {

                // Apply color
                const material = await commonMaterial(parseInt(value, 16))
                child.material = material;
                child.material.needsUpdate = true;

                // if (child instanceof THREE.Group) {
                //     console.log("group")

                //     child.traverse(async (child1) => {

                //         if (child1.name == "Top_Ex_Metal") {
                //             child1.material = material;
                //             child1.material.needsUpdate = true;
                //         }
                //         else{
                //             // console.log("child1.name", child1.name)
                //             // child1.material = material;
                //             // child1.material.needsUpdate = true;
                //         }

                //     });
                // }
                // else {
                //     child.material = material;
                //     child.material.needsUpdate = true;

                // }


            }
        }
        if (child.name == 'Header_Wooden_Shelf' && dropdownType === 'shelf') {
            // console.log('Header_Wooden_Shelf', dropdownType, child.name)
            if (type === "texture") {
                // Load texture
                let texture_border = new THREE.TextureLoader().load("./assets/images/borders/" + value);
                texture_border = await setTextureParams(texture_border);

                border_texture_material.map = texture_border;
                child.material = border_texture_material;
                // child.material = [border_texture_material, shadow];
                child.material.needsUpdate = true;
            } else if (type === "color") {
                // Apply color
                const material = await commonMaterial(parseInt(value, 16))
                child.material = material;
                // child.material = [material, shadow];
                child.material.needsUpdate = true;
            }
        }
    });
}

export async function clearMeasurementBoxes(scene) {
    const objectsToRemove = [];

    // Traverse all the children in the scene
    scene.traverse(function (child) {
        if (child.name && child.name.startsWith('Measurement')) {
            objectsToRemove.push(child);
        }
    });

    // Now remove all flagged objects from the scene
    objectsToRemove.forEach(object => {
        if (object.parent) {
            object.parent.remove(object); // Remove from its parent
        }

        // Additionally, dispose of geometry and material to free up memory
        if (object.geometry) object.geometry.dispose();
        if (object.material) object.material.dispose();
    });


    // Clean up the list of children in the scene
    // scene.children = scene.children.filter(child => !child.name.startsWith('Measurement'));
    // scene.children = scene.children.filter(child => {
    //     return child.name && !child.name.startsWith('Measurement');
    // });
}

export async function computeBoundingBox(object, frameNames) {
    const bbox = new THREE.Box3();

    // Traverse the object and expand the bounding box for visible nodes
    object.traverse(async function (modelNode) {
        if (frameNames.includes(modelNode.name)) {
            let isNodeVisible = modelNode.visible;


            // Expand the bounding box only if the node is visible and has visible parents
            if (isNodeVisible) {
                console.log('modelNode.name', modelNode.name)
                bbox.expandByObject(modelNode);
            }
        }

    });

    return bbox;
}

export async function computeVisibleNodeBoundingBox(object, mainModelNames, innerModelNames) {
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

export async function drawMeasurementBoxesWithLabels(main_model, scene, camera) {
    if (main_model) {
        const mergedArray = allModelNames.concat(allOtherModelNames);
        const bbox = await computeVisibleNodeBoundingBox(main_model, mergedArray, heightMeasurementNames)
        if (bbox) {

            let multiplier = 1;

            // Clear previous measurement boxes and labels
            await clearMeasurementBoxes(scene);
            if (params.measurementToggle) {
                const min = bbox.min.clone();
                const max = bbox.max.clone();

                // Material for the measurement boxes
                const material = new THREE.MeshBasicMaterial({ color: params.measurementLineColor });

                // Create width measurement group
                const width = max.x - min.x;
                const widthGroup = await addMeasurementGroup(
                    material,
                    { width: width, height: params.measurementLineLength, depth: params.measurementLineLength }, // lineSize
                    `${width.toFixed(0) * multiplier}mm`, // labelText Width: 
                    new THREE.BoxGeometry(params.measurementLineLength, params.measurementLineHeight, params.measurementLineLength), // handleLineGeometry
                    'MeasurementWidth' // groupNamePrefix
                );
                scene.add(widthGroup); // Add the group to the scene

                // Create height measurement group
                const height = max.y - min.y;
                const heightGroup = await addMeasurementGroup(
                    material,
                    { width: params.measurementLineLength, height: height, depth: params.measurementLineLength }, // lineSize
                    `${height.toFixed(0) * multiplier}mm`, // labelText Height: 
                    new THREE.BoxGeometry(params.measurementLineLength, params.measurementLineLength, params.measurementLineHeight), // handleLineGeometry
                    'MeasurementHeight' // groupNamePrefix
                );
                scene.add(heightGroup); // Add the group to the scene

                // Create depth measurement group
                const depth = max.z - min.z;
                const depthGroup = await addMeasurementGroup(
                    material,
                    { width: params.measurementLineLength, height: params.measurementLineLength, depth: depth }, // lineSize
                    `${depth.toFixed(0) * multiplier}mm`, // labelText Depth: 
                    new THREE.BoxGeometry(params.measurementLineLength, params.measurementLineHeight, params.measurementLineLength), // handleLineGeometry
                    'MeasurementDepth' // groupNamePrefix
                );
                scene.add(depthGroup); // Add the group to the scene

                // Update labels to always face the camera
                scene.onBeforeRender = function () {
                    scene.traverse((obj) => {
                        if (obj.name && obj.name.includes('Label')) {
                            obj.lookAt(camera.position);
                        }
                    });
                };
            }
        }
    }
}

export async function addMeasurementGroup(material, lineSize, labelText, handleLineGeometry, groupNamePrefix) {

    // Create a group for the measurement
    const measurementGroup = new THREE.Group();
    measurementGroup.name = groupNamePrefix;
    measurementGroup.visible = false;

    // Create measurement box
    const boxGeometry = new THREE.BoxGeometry(lineSize.width, lineSize.height, lineSize.depth);
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
    const labelGroup = new THREE.Group();

    if (!params.font) {
        params.font = await fontLoader.loadAsync('helvetiker_regular.typeface.json');
    }

    const textGeometry = new TextGeometry(text, {
        font: params.font,
        size: params.fontSize,
        depth: 0.2
    });

    textGeometry.computeBoundingBox();
    const textSize = textGeometry.boundingBox.getSize(new THREE.Vector3());

    const padding = 25;
    const backgroundWidth = textSize.x + padding;
    const backgroundHeight = textSize.y + padding;
    const cornerRadius = 10;

    const roundedRectShape = await createRoundedRectShape(backgroundWidth, backgroundHeight, cornerRadius);
    const extrudeSettings = {
        depth: 0.1,
        bevelEnabled: false
    };
    const backgroundGeometry = new THREE.ExtrudeGeometry(roundedRectShape, extrudeSettings);
    const backgroundMaterial = new THREE.MeshBasicMaterial({
        color: params.measurementLineColor,
        opacity: 1,
        transparent: false, // Make transparent if needed
        // depthTest: false,
        // depthWrite: false,
    });

    const backgroundMesh = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
    const textMaterial = new THREE.MeshBasicMaterial({
        color: params.measurementTextColor,
        // depthTest: false,
        // depthWrite: false
    });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);

    textMesh.position.set(-textSize.x / 2, -textSize.y / 2, 0.2); // Offset slightly to avoid z-fighting

    labelGroup.add(backgroundMesh);
    labelGroup.add(textMesh);

    return labelGroup;
}

export async function createRoundedRectShape(width, height, radius) {
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2 + radius, -height / 2);
    shape.lineTo(width / 2 - radius, -height / 2);
    shape.quadraticCurveTo(width / 2, -height / 2, width / 2, -height / 2 + radius);
    shape.lineTo(width / 2, height / 2 - radius);
    shape.quadraticCurveTo(width / 2, height / 2, width / 2 - radius, height / 2);
    shape.lineTo(-width / 2 + radius, height / 2);
    shape.quadraticCurveTo(-width / 2, height / 2, -width / 2, height / 2 - radius);
    shape.lineTo(-width / 2, -height / 2 + radius);
    shape.quadraticCurveTo(-width / 2, -height / 2, -width / 2 + radius, -height / 2);
    return shape;
}

export async function updateMeasurementGroups(main_model, scene, camera) {
    if (main_model) {
        const mergedArray = allModelNames.concat(allOtherModelNames);
        const bbox = await computeVisibleNodeBoundingBox(main_model, mergedArray, heightMeasurementNames)
        if (bbox) {
            const min = bbox.min.clone();
            const max = bbox.max.clone();
            const center = bbox.getCenter(new THREE.Vector3());

            // Determine if the camera is on the left or right side of the model
            const cameraOnLeft = camera.position.x < center.x;
            const cameraZAdjustment = camera.position.z < center.z ? -70 : 70; // Adjust if camera is in front or behind
            const lableZAdjustment = camera.position.z < center.z ? -10 : 10; // Adjust if camera is in front or behind

            // Create width measurement group
            const width = max.x - min.x;
            await updateMeasurementGroupPosition(
                scene,
                'MeasurementWidth',
                { x: (min.x + width / 2), y: max.y + params.measurementLineDistance, z: cameraZAdjustment }, // linePosition
                new THREE.Vector3(min.x + width / 2, max.y + 1 + params.measurementLineDistance, cameraZAdjustment + lableZAdjustment), // labelPosition
                { x: min.x, y: max.y + params.measurementLineDistance, z: cameraZAdjustment }, // startLinePosition
                { x: max.x, y: max.y + params.measurementLineDistance, z: cameraZAdjustment }, // endLinePosition
            );

            // Update height measurement
            const height = max.y - min.y;
            const heightXPosition = cameraOnLeft
                ? max.x + 1 + params.measurementLineDistance  // If camera is on the left, height is on the right
                : min.x - 1 - params.measurementLineDistance; // If camera is on the right, height is on the left

            await updateMeasurementGroupPosition(
                scene,
                'MeasurementHeight',
                { x: heightXPosition, y: min.y + height / 2, z: cameraZAdjustment }, // linePosition
                new THREE.Vector3(heightXPosition, min.y + height / 2, cameraZAdjustment + lableZAdjustment), // labelPosition
                { x: heightXPosition, y: min.y, z: cameraZAdjustment }, // startLinePosition
                { x: heightXPosition, y: max.y, z: cameraZAdjustment }, // endLinePosition
            );

            // Update depth measurement
            const depth = max.z - min.z;
            const depthXPosition = cameraOnLeft
                ? min.x - params.measurementLineDistance  // If camera is in front, depth is behind
                : max.x + params.measurementLineDistance; // If camera is behind, depth is in front

            await updateMeasurementGroupPosition(
                scene,
                'MeasurementDepth',
                { x: depthXPosition, y: min.y, z: min.z + depth / 2 }, // linePosition
                new THREE.Vector3(depthXPosition, min.y, min.z + depth / 2 + lableZAdjustment), // labelPosition
                { x: depthXPosition, y: min.y, z: min.z }, // startLinePosition
                { x: depthXPosition, y: min.y, z: max.z }, // endLinePosition
            );
        }

    }
}

export async function updateMeasurementGroupPosition(scene, groupName, linePosition, labelPosition, startLinePosition, endLinePosition) {
    const measurementGroup = scene.getObjectByName(groupName);
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

export async function generateGlassMaterial(texture_background) {
    let texture_glass = texture_background.clone()
    texture_glass.mapping = THREE.EquirectangularReflectionMapping;
    const texture = new THREE.CanvasTexture(await generateGlassTexture());
    const material = new THREE.MeshPhysicalMaterial({
        color: '#3d7e35',
        metalness: 0.09,
        roughness: 0,
        ior: 2,
        alphaMap: texture,
        envMap: texture_glass,
        envMapIntensity: 1,
        transmission: 1, // use material.transmission for glass materials
        specularIntensity: 1,
        specularColor: '#ffffff',
        opacity: 0.4,
        side: THREE.DoubleSide,
        transparent: true
    });
    return material
}

export async function isVisibleParents(node) {
    // Base case: If the node is null, return true (end of the hierarchy)
    if (!node) {
        return true;
    }

    // Check if the current node is visible
    if (!node.visible) {
        return false;
    }

    // Recursively check the parent node
    return await isVisibleParents(node.parent);
}

export async function findParentNodeByName(node, parentName, isVisible = null) {
    // Base case: If the current node has no parent, return null
    if (!node.parent) return null;

    // Check if parentName is an array or a string
    const isMatch = Array.isArray(parentName) ? parentName.includes(node.parent.name) : node.parent.name === parentName;

    // If the current node's parent matches the name (or one of the names in the array), return the parent node
    if (isVisible) {
        if (isMatch && node.parent.visible) {
            return node.parent; // Return the current node if its parent name matches
        }
    }
    else {
        if (isMatch) {
            return node.parent; // Return the current node if its parent name matches
        }
    }

    // Recursively search for the matching node in the children
    const result = await findParentNodeByName(node.parent, parentName, isVisible);
    if (result) return result; // If a match is found, return it

    // If no match is found, return null
    return null;
}

// Function to dynamically generate cards for visible models
export async function updateRightControls(main_model, mergedArray) {
    const rightControls = document.querySelector('.model_items');

    // Clear the existing controls
    rightControls.innerHTML = '';

    let index = 0;
    // Loop through the mergedArray and create cards for visible models
    mergedArray.forEach((modelName) => {
        const model = main_model.getObjectByName(modelName);
        if (model && model.visible) {
            const name = modelName.replace('Other_', '')
            // Create card element
            index++;
            const card = document.createElement('div');
            card.className = 'card mb-2'; // Bootstrap card with margin-bottom

            card.innerHTML = `
                <div class="card-header">
                    <label class="d-flex justify-content-between">
                        <div class="flex-shrink-1 p-2">${index}</div>
                        <div class="w-100 p-2">${name}</div>
                        <div class="p-2">
                            <input class="form-check-input selectedModel" value="${modelName}" type="radio" name="flexRadioDefault" id="flexRadioDefault${index}">
                        </div>
                    </label>
                </div>
            `;

            // Append the card to the right-controls
            rightControls.appendChild(card);
        }
    });

    const moveLeftRightModel = document.querySelector(".moveLeftRightModel");
    if (moveLeftRightModel) {
        moveLeftRightModel.style.display = 'none'; // Initially hide the move buttons
    }

    const selectedModels = document.querySelectorAll(".selectedModel");
    selectedModels.forEach(button => {
        button.addEventListener("change", async function (event) {
            // Ensure params.selectedModel is defined and update its position
            if (params.selectedModel) {
                params.selectedModel.position.z -= params.selectedModelZAxis; // Move previous model back
            }

            // Get the newly selected model
            params.selectedModel = main_model.getObjectByName(event.target.value);
            if (params.selectedModel) {
                console.log('Selected Model:', params.selectedModel.name); // Debugging log
                params.selectedModel.position.z += params.selectedModelZAxis; // Move new model forward
                
                // Show move buttons
                moveLeftRightModel.style.display = 'flex';
            } else {
                console.warn('Model not found:', event.target.value); // Warning if model is not found
            }
        });
    });

    // Add event listeners for move buttons
    const moveLeftModel = document.getElementById("moveLeftModel");
    const moveRightModel = document.getElementById("moveRightModel");

    moveLeftModel.addEventListener("click", () => {
        if (params.selectedModel) {
            params.selectedModel.position.x -= 10; // Adjust the value to control the speed of movement
        }
    });

    moveRightModel.addEventListener("click", () => {
        if (params.selectedModel) {
            params.selectedModel.position.x += 10; // Adjust the value to control the speed of movement
        }
    });

    // Hide move buttons when no model is selected
    const unselectModel = () => {
        if (params.selectedModel) {
            params.selectedModel.position.z -= params.selectedModelZAxis; // Move model back
            params.selectedModel = null;
            moveLeftRightModel.style.display = 'none'; // Hide move buttons
        }
    };

    // You can call this unselectModel function wherever needed to handle unselection
}


