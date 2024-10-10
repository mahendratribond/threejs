
import * as THREE from "three";
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import {
    heightMeasurementNames,
    baseFrameTextureNames,
    rodFrameTextureNames,
    baseFrameNames,
    allModelNames,
    headerNames,
    rackNodes,
    params,
} from './config.js';



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
        roughness: 0.1, // Adjust roughness as needed
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
    const removeIconCircleMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
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
    removeIconGroup.scale.set(2, 2, 2); // You can adjust the scale as needed
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

    return texture
}

export async function isHangerAdd(hangerType, hangerArray, hangerArrayKey) {
    let conditionFlag = true;
    let modelSize = getModelSize(params.defaultModel);
    if (hangerType == 'Hanger_Rail_Single') {
        if (hangerArray[hangerArrayKey] >= 1 && modelSize <= 600) {
            conditionFlag = false
        }
    }
    else if (hangerType == 'Hanger_Rail_D_500mm') {
        if (hangerArray[hangerArrayKey] >= 1 && modelSize < 1000) {
            conditionFlag = false
        }
    }
    else if (hangerType == 'Hanger_Rail_D_1000mm') {
        if (modelSize < 1000) {
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

export async function setupMainModel(modelGroup) {
    modelGroup.traverse(async function (modelNode) {
        if (modelNode.material && baseFrameTextureNames.includes(modelNode.name)) {
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

    console.log(modelGroup)
}

export async function setupGlassShelfFixingModel(modelGroup, header_rod_model, header_glass_shelf_fixing_model) {
    let modelSize;

    if (header_rod_model) {
        await header_rod_model.traverse(async function (child) {
            if (child.material && rodFrameTextureNames.includes(child.name)) {
                const material = await commonMaterial(parseInt(params.rodFrameColor, 16))
                child.material = material
                child.material.needsUpdate = true;
            }
        });
    }

    await modelGroup.traverse(async function (modelNode) {
        if (allModelNames.includes(modelNode.name)) {
            modelSize = await getModelSize(modelNode.name);

            if (header_rod_model && header_glass_shelf_fixing_model) {
                await createRod(modelNode, modelSize, header_rod_model, header_glass_shelf_fixing_model)
            }

        }
    });

}

export async function setupHeader500HeightModel(modelGroup, header_500_height_model) {
    let model, header;

    modelGroup.traverse(function (modelNode) {

        if (allModelNames.includes(modelNode.name)) {

            if (header_500_height_model) {
                model = header_500_height_model.getObjectByName(modelNode.name);
                header = model.getObjectByName('Header');
                if (header) {
                    header.name = header.name + "_" + 500;
                    header.visible = false;
                    modelNode.attach(header);
                }
            }


        }
    });

}

export async function setupHeaderWoodenShelfModel(modelGroup, header_wooden_shelf_model) {
    let model;

    modelGroup.traverse(function (modelNode) {

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

export async function setupHeaderGlassShelfModel(modelGroup, header_glass_shelf_model, texture_background) {
    let model;
    console.log('texture_background', texture_background)
    console.log('params.glassShelfFixingSize', params.glassShelfFixingSize)
    if (header_glass_shelf_model) {
        header_glass_shelf_model.traverse(async function (child) {
            if (child.material) {
                child.material = await generateGlassMaterial(texture_background)
                // child.material = await commonMaterial(0xffffff)
                child.material.needsUpdate = true;
            }
        });
    }

    modelGroup.traverse(function (modelNode) {
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

export async function setupSlottedSidesModel(modelGroup, slotted_sides_model) {
    let model, slotted_left_side, slotted_right_side, frame;

    modelGroup.traverse(async function (modelNode) {
        if (allModelNames.includes(modelNode.name)) {
            frame = modelNode.getObjectByName('Frame');

            if (slotted_sides_model) {
                model = slotted_sides_model.getObjectByName(modelNode.name);
                console.log('modelNode.name', modelNode.name)
                console.log('model', model)
                if (model) {
                    slotted_left_side = model.getObjectByName('Left_Ex_Slotted');
                    if (slotted_left_side) {
                        slotted_left_side.visible = false;
                        frame.attach(slotted_left_side);
                    }

                    slotted_right_side = model.getObjectByName('Right_Ex_Slotted');
                    if (slotted_right_side) {
                        slotted_right_side.visible = false;
                        frame.attach(slotted_right_side);
                    }
                }
            }

        }
    });

}

export async function setupWoodenRackModel(modelGroup, rack_wooden_model) {

    if (rack_wooden_model) {
        rack_wooden_model.traverse(async function (child) {
            if (child.material && rackNodes.includes(child.name)) {
                const material = await commonMaterial(parseInt(params.defaultRackColor, 16))
                child.material = material
                child.material.needsUpdate = true;
            }
        });
    }

}

export async function setupGlassRackModel(modelGroup, rack_glass_model, texture_background) {
    if (rack_glass_model) {
        const glassMaterial = await generateGlassMaterial(texture_background);
        const defaultMaterial = await commonMaterial(parseInt(params.defaultRackColor, 16));

        rack_glass_model.traverse(async function (child) {
            if (rackNodes.includes(child.name)) {
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

export async function setupHangerModel(modelGroup, hanger_model) {
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

}

export async function setupModel(modelGroup, header_500_height_model, header_wooden_shelf_model, header_rod_model, header_glass_shelf_fixing_model, header_glass_shelf_model, slotted_sides_model, hanger_model, rack_wooden_model, rack_glass_model) {
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
            if (child.material && rackNodes.includes(child.name)) {
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
            if (rackNodes.includes(child.name)) {
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

    modelGroup.traverse(async function (modelNode) {
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

    console.log(modelGroup)
}

export async function updateFrameSize(modelGroup, scene, camera) {
    if (modelGroup) {
        modelGroup.traverse(function (modelNode) {
            if (allModelNames.includes(modelNode.name)) {
                if (modelNode.name === params.defaultModel) {
                    modelNode.visible = true;  // Show the selected model
                } else {
                    modelNode.visible = false; // Hide other models
                }
            }
        });

        let currentModel = modelGroup.getObjectByName(params.defaultModel);
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

    showHideNodes(modelGroup, scene, camera)
}

export async function showHideNodes(modelGroup, scene, camera) {
    console.log('modelGroup', modelGroup);
    if (modelGroup) {
        let currentModel = modelGroup.getObjectByName(params.defaultModel);
        if (currentModel) {
            await modelGroup.traverse(async function (child) {
                if (child.name === "Left_Ex" || child.name === "Right_Ex") {
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
                if (child.name === "Header_Wooden_Shelf") {
                    console.log('Header_Wooden_Shelf pre', child.parent.name)
                    child.visible = params.topOption == 'Shelf' && params.defaultShelfType == 'Header_Wooden_Shelf';
                    console.log('Header_Wooden_Shelf post')
                }
                if (child.name === "Header_Glass_Shelf") {
                    console.log('pre', child)
                    child.visible = params.topOption == 'Shelf' && params.defaultShelfType == 'Header_Glass_Shelf';
                    console.log('post')
                }
                if (child.name === "Rod") {
                    child.visible = (params.topOption == 'Shelf' && ((params.isShelf && params.defaultShelfType == 'Header_Wooden_Shelf') || (params.isGlassShelf && params.defaultShelfType == 'Header_Glass_Shelf'))) || (params.headerRodToggle && params.topOption == 'Header');
                }
                if (child.name === "Glass_Shelf_Fixing") {
                    child.visible = params.topOption == 'Shelf' && params.isGlassShelf && params.defaultShelfType == 'Header_Glass_Shelf';
                }

                if (headerNames.includes(child.name)) {
                    child.visible = params.topOption == 'Header' && params.defaultHeaderSize == child.name;
                }

                if (baseFrameNames.includes(child.name)) {
                    child.visible = (child.name === params.selectedBaseFrame);
                }

                if (child.material && baseFrameTextureNames.includes(child.name) && child.material.color) {
                    child.material.color.set(await getHex(params.baseFrameColor));
                    child.material.needsUpdate = true;
                }
                if (child.material && rodFrameTextureNames.includes(child.name) && child.material.color) {
                    child.material.color.set(await getHex(params.rodFrameColor));
                    child.material.needsUpdate = true;
                }
                if (child.material && ['Hanger_Stand'].includes(child.name) && child.material.color) {
                    child.material.color.set(await getHex(params.defaultHangerStandColor));
                    child.material.needsUpdate = true;
                }
                if (child.material && ['Rack_Wooden_Shelf'].includes(child.name) && child.material.color) {
                    child.material.color.set(await getHex(params.defaultRackShelfStandColor));
                    child.material.needsUpdate = true;
                }
                if (['Rack_Stand_LH', 'Rack_Stand_RH'].includes(child.name)) {
                    if (child.material) {
                        child.material.color.set(getHex(params.defaultRackStandStandColor));
                        child.material.needsUpdate = true;
                    }
                    else {
                        child.traverse(function (mesh) {
                            if (mesh.material) {
                                mesh.material.color.set(getHex(params.defaultRackStandStandColor));
                                mesh.material.needsUpdate = true;
                            }
                        });
                    }
                }
            });

            if (params.topOption == 'Header') {
                modelGroup.traverse(function (modelNode) {
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

            // drawMeasurementBoxesWithLabels(modelGroup, scene, camera)
        }
    }

    if (params.topOption == 'Shelf') {
        document.querySelector('.topHeaderOptions').style.display = 'none'
        document.querySelector('.topShelfOptions').style.display = 'block'
    }
    else if (params.topOption == 'Header') {
        document.querySelector('.topHeaderOptions').style.display = 'block'
        document.querySelector('.topShelfOptions').style.display = 'none'
    }
    else {
        document.querySelector('.topHeaderOptions').style.display = 'none'
        document.querySelector('.topShelfOptions').style.display = 'none'
    }

    if (params.headerRodToggle) {
        document.querySelector('.headerRodColorDropdownBox').style.display = 'block'
    }
    else {
        document.querySelector('.headerRodColorDropdownBox').style.display = 'none'
    }
}

export async function headerOptionsShowHide() {
    if (params.headerOptions == 'SEG') {
        document.querySelector('.headerFrameColorDropdownBox').style.display = 'none'
        document.querySelector('.headerFrameColorInputBox').style.display = 'block'
    }
    else if (params.headerOptions == 'ALG') {
        document.querySelector('.headerFrameColorDropdownBox').style.display = 'block'
        document.querySelector('.headerFrameColorInputBox').style.display = 'none'
    }
    else if (params.headerOptions == 'ALG3D') {
        document.querySelector('.headerFrameColorDropdownBox').style.display = 'none'
        document.querySelector('.headerFrameColorInputBox').style.display = 'block'
    }
    else {
        document.querySelector('.headerFrameColorDropdownBox').style.display = 'none'
        document.querySelector('.headerFrameColorInputBox').style.display = 'none'
    }
}

export async function loaderShowHide(isShow = false) {
    if (isShow) {
        document.body.classList.remove('loaded');
    }
    else {
        document.body.classList.add('loaded');
    }
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
    scene.children = scene.children.filter(child => !child.name.startsWith('Measurement'));
}

export async function computeBoundingBox(object, frameNames) {
    const bbox = new THREE.Box3();

    // Traverse the object and expand the bounding box for visible nodes
    object.traverse(function (modelNode) {
        if (frameNames.includes(modelNode.name) && modelNode.visible) {
            bbox.expandByObject(modelNode);
        }
    });

    return bbox;
}

export async function drawMeasurementBoxesWithLabels(modelGroup, scene, camera) {
    if (modelGroup) {
        let object = modelGroup.getObjectByName(params.defaultModel);
        const bbox = computeBoundingBox(object, heightMeasurementNames)

        // Clear previous measurement boxes and labels
        clearMeasurementBoxes(scene);
        if (params.measurementToggle) {
            const min = bbox.min.clone();
            const max = bbox.max.clone();

            // Material for the measurement boxes
            const material = new THREE.MeshBasicMaterial({ color: params.measurementLineColor });

            // Create width measurement group
            const width = max.x - min.x;
            const widthGroup = addMeasurementGroup(
                material,
                { width: width, height: params.measurementLineLength, depth: params.measurementLineLength }, // lineSize
                `Width: ${width.toFixed(0) * 10}mm`, // labelText
                new THREE.BoxGeometry(params.measurementLineLength, params.measurementLineHeight, params.measurementLineLength), // handleLineGeometry
                'MeasurementWidth' // groupNamePrefix
            );
            scene.add(widthGroup); // Add the group to the scene

            // Create height measurement group
            const height = max.y - min.y;
            const heightGroup = addMeasurementGroup(
                material,
                { width: params.measurementLineLength, height: height, depth: params.measurementLineLength }, // lineSize
                `Height: ${height.toFixed(0) * 10}mm`, // labelText
                new THREE.BoxGeometry(params.measurementLineLength, params.measurementLineLength, params.measurementLineHeight), // handleLineGeometry
                'MeasurementHeight' // groupNamePrefix
            );
            scene.add(heightGroup); // Add the group to the scene

            // Create depth measurement group
            const depth = max.z - min.z;
            const depthGroup = addMeasurementGroup(
                material,
                { width: params.measurementLineLength, height: params.measurementLineLength, depth: depth }, // lineSize
                `Depth: ${depth.toFixed(0) * 10}mm`, // labelText
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
    const label = createLabel(labelText);
    label.name = `${groupNamePrefix}Label`;
    measurementGroup.add(label);

    // Return the group so it can be added to the scene or manipulated further
    return measurementGroup;
}

export async function createLabel(text) {
    if (!font) {
        console.error("Font is not loaded.");
        return;
    }

    const textGeometry = new TextGeometry(text, {
        font: font,
        size: params.fontSize,
        depth: 0.2
    });

    textGeometry.computeBoundingBox();
    const textSize = textGeometry.boundingBox.getSize(new THREE.Vector3());

    const padding = 5;
    const backgroundWidth = textSize.x + padding;
    const backgroundHeight = textSize.y + padding;
    const cornerRadius = 2;

    const roundedRectShape = createRoundedRectShape(backgroundWidth, backgroundHeight, cornerRadius);
    const extrudeSettings = {
        depth: 0.1,
        bevelEnabled: false
    };
    const backgroundGeometry = new THREE.ExtrudeGeometry(roundedRectShape, extrudeSettings);
    const backgroundMaterial = new THREE.MeshBasicMaterial({
        color: params.measurementLineColor,
        opacity: 1,
        transparent: false, // Make transparent if needed
        depthTest: false,
        depthWrite: false,
    });

    const backgroundMesh = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
    const textMaterial = new THREE.MeshBasicMaterial({ color: params.measurementTextColor, depthTest: false, depthWrite: false });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);

    textMesh.position.set(-textSize.x / 2, -textSize.y / 2, 0.2); // Offset slightly to avoid z-fighting

    const labelGroup = new THREE.Group();
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

export async function updateMeasurementGroups(modelGroup, scene, camera) {
    if (modelGroup) {
        let object = modelGroup.getObjectByName(params.defaultModel);
        if (object) {
            const bbox = await computeBoundingBox(object, heightMeasurementNames)

            const min = bbox.min.clone();
            const max = bbox.max.clone();
            const center = bbox.getCenter(new THREE.Vector3());

            // Determine if the camera is on the left or right side of the model
            const cameraOnLeft = camera.position.x < center.x;
            const cameraZAdjustment = camera.position.z < center.z ? -7 : 7; // Adjust if camera is in front or behind

            // Create width measurement group
            const width = max.x - min.x;
            updateMeasurementGroupPosition(
                scene,
                'MeasurementWidth',
                { x: (min.x + width / 2), y: max.y + params.measurementLineDistance, z: cameraZAdjustment }, // linePosition
                new THREE.Vector3(min.x + width / 2, max.y + 1 + params.measurementLineDistance, cameraZAdjustment), // labelPosition
                { x: min.x, y: max.y + params.measurementLineDistance, z: cameraZAdjustment }, // startLinePosition
                { x: max.x, y: max.y + params.measurementLineDistance, z: cameraZAdjustment }, // endLinePosition
            );

            // Update height measurement
            const height = max.y - min.y;
            const heightXPosition = cameraOnLeft
                ? max.x + 1 + params.measurementLineDistance  // If camera is on the left, height is on the right
                : min.x - 1 - params.measurementLineDistance; // If camera is on the right, height is on the left

            updateMeasurementGroupPosition(
                scene,
                'MeasurementHeight',
                { x: heightXPosition, y: min.y + height / 2, z: cameraZAdjustment }, // linePosition
                new THREE.Vector3(heightXPosition, min.y + height / 2, cameraZAdjustment), // labelPosition
                { x: heightXPosition, y: min.y, z: cameraZAdjustment }, // startLinePosition
                { x: heightXPosition, y: max.y, z: cameraZAdjustment }, // endLinePosition
            );

            // Update depth measurement
            const depth = max.z - min.z;
            const depthXPosition = cameraOnLeft
                ? min.x - params.measurementLineDistance  // If camera is in front, depth is behind
                : max.x + params.measurementLineDistance; // If camera is behind, depth is in front

            updateMeasurementGroupPosition(
                scene,
                'MeasurementDepth',
                { x: depthXPosition, y: min.y, z: min.z + depth / 2 }, // linePosition
                new THREE.Vector3(depthXPosition, min.y, min.z + depth / 2), // labelPosition
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
    const texture = new THREE.CanvasTexture(generateGlassTexture());
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
    return isVisibleParents(node.parent);
}

export async function findParentNodeByName(node, parentName) {
    // Base case: If the current node has no parent, return null
    if (!node.parent) return null;

    // Check if the parent name matches the desired name
    if (node.parent.name === parentName) {
        return node.parent; // Return the current node if its parent name matches
    }

    // Recursively search for the matching node in the children
    const result = findParentNodeByName(node.parent, parentName);
    if (result) return result; // If a match is found, return it

    // If no match is found, return null
    return null;
}

