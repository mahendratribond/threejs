
import * as THREE from "three";
import {
    allModelNames,
    baseFrameNames,
    headerNames,
    baseFrameTextureNames,
    rodFrameTextureNames,
    params,
} from './config.js';


export function commonMaterial(color) {
    const material = new THREE.MeshPhysicalMaterial({
        color: color, // Black color
        metalness: 0.5, // Full metallic
        roughness: 0.5, // Adjust roughness as needed
    });

    return material
}

export function setTextureParams(texture) {
    texture.encoding = THREE.sRGBEncoding;
    texture.minFilter = 1008;
    texture.magFilter = THREE.LinearFilter;
    texture.colorSpace = "srgb";
    texture.wrapT = THREE.RepeatWrapping;
    texture.wrapS = THREE.RepeatWrapping;

    return texture
}

export function updateBaseFrameColorModel(main_model) {
    main_model.traverse(function (child) {
        if (child.material && baseFrameTextureNames.includes(child.name)) {
            // console.log('fff', getHex(color))
            child.material.color.set(getHex(params.baseFrameColor));
            child.material.needsUpdate = true;
        }
    });
}

export function updateRodFrameColorModel(main_model) {
    main_model.traverse(function (child) {
        if (child.material && rodFrameTextureNames.includes(child.name)) {
            const material = commonMaterial(parseInt(params.rodFrameColor, 16))
            child.material = material
            child.material.needsUpdate = true;

        }
    });
}

export function updateBaseFrameVisibilityModel(main_model) {
    main_model.traverse(function (child) {
        if (baseFrameNames.includes(child.name)) {
            // console.log('show_hide', child.name)
            child.visible = (child.name === params.selectedBaseFrame);
        }
    });
}

export function getRodCount(modelSize) {
    let additionalRods = 0;
    if (modelSize >= 2000) {
        additionalRods = 2; // 4 rods total
    } else if (modelSize >= 1200) {
        additionalRods = 1; // 3 rods total
    }
    return additionalRods;
}

export function createRod(modelNode, modelSize, header_rod_model, header_glass_shelf_fixing_model) {
    const rodSize = getNodeSize(header_rod_model);
    const glassShelfFixingSize = getNodeSize(header_glass_shelf_fixing_model);

    const additionalRods = getRodCount(modelSize);

    // console.log(modelSize)
    // console.log(header_rod_model)
    const header = modelNode.getObjectByName('Header');

    // Ensure both header and frame nodes exist
    if (header) {
        const headerSize = getNodeSize(header); // Size of the current header

        const headerBox = new THREE.Box3().setFromObject(header);

        let rodY = headerBox.min.y + params.cameraPosition + rodSize.y / 2;//(frameSize.y / 2 + rodSize.y / 2);
        let lassShelfFixingY = glassShelfFixingSize.y / 2;//(frameSize.y / 2 + glassShelfFixingSize.y / 2);

        // Function to create and position a rod
        const createAndPositionRod = (xOffset, rodName, shelfFixingName) => {
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

        // Place the left and right rods first
        createAndPositionRod(-headerSize.x / 2 + rodSize.x + 5, "Rod", "Glass_Shelf_Fixing"); // Left Rod
        createAndPositionRod(headerSize.x / 2 - rodSize.x - 5, "Rod", "Glass_Shelf_Fixing"); // Right Rod

        // Determine and place additional rods based on modelSize
        if (additionalRods > 0) {
            const spacing = headerSize.x / (additionalRods + 1); // Calculate spacing between rods

            // Place additional rods
            for (let i = 1; i <= additionalRods; i++) {
                let xOffset = -headerSize.x / 2 + i * spacing;
                createAndPositionRod(xOffset, "Rod", "Glass_Shelf_Fixing");
            }
        }

    }
}

export function setupModel(main_model, header_500_height_model, header_wooden_shelf_model, header_rod_model, header_glass_shelf_fixing_model, header_glass_shelf_model) {
    main_model.traverse(function (modelNode) {
        if (allModelNames.includes(modelNode.name)) {
            let modelSize = getModelSize(modelNode.name);
            let model = header_500_height_model.getObjectByName(modelNode.name);
            let header = model.getObjectByName('Header');
            if (header) {
                header.name = header.name + "_" + 500;
                header.visible = false;
                modelNode.attach(header);
            }

            model = header_wooden_shelf_model.getObjectByName(modelNode.name);
            if (model) {
                model.name = "Header_Wooden_Shelf";
                model.visible = false;
                modelNode.attach(model);
            }

            createRod(modelNode, modelSize, header_rod_model, header_glass_shelf_fixing_model)

            model = header_glass_shelf_model.getObjectByName(modelNode.name);
            if (model) {
                const glassShelfFixingSize = getNodeSize(header_glass_shelf_fixing_model);
                model.name = "Header_Glass_Shelf";
                model.visible = false;
                model.position.y = glassShelfFixingSize.y;
                modelNode.attach(model);
            }

            if (modelNode.name === params.defaulrModel) {
                modelNode.visible = true;
            }
            else {
                modelNode.visible = false;
            }
        }
    });
    // main_model.traverse(function (child) {
    //     console.log(child.name, child)
    // });

    console.log(main_model)
    // header_500_height_model.traverse(function (child) {
    //     if (allModelNames.includes(child.name)) {
    //         child.visible = false;
    //     }
    // });
}


export function headerShowHide(main_model) {
    main_model.traverse(function (child) {
        if (child.name === "Header") {
            child.visible = params.headerToggle && params.defaultHeaderSize == 300;
        }
        if (child.name === "Header_500") {
            child.visible = params.headerToggle && params.defaultHeaderSize == 500;
        }
    });
}

export function checkMeshType(type) {
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

export function getHex(value) {
    return value.replace('0x', '#')
}


export function getCurrentModelSize(model, node) {
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

export function topOptionsShowHide() {
    if (params.topOption == 'Header_Wooden_Shelf') {
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
}

export function headerOptionsShowHide() {
    if (params.headerOptions == 'SEG') {
        document.querySelector('.headerFrameColorDropdownBox').style.display = 'none'
        document.querySelector('.headerFrameColorInputBox').style.display = 'block'
    }
    else if (params.headerOptions == 'ALG') {
        document.querySelector('.headerFrameColorDropdownBox').style.display = 'block'
        document.querySelector('.headerFrameColorInputBox').style.display = 'none'
    }
    else {
        document.querySelector('.headerFrameColorDropdownBox').style.display = 'none'
        document.querySelector('.headerFrameColorInputBox').style.display = 'block'
    }
}

export function getModelSize(model_name) {
    return model_name.replace('Model_', '')
}

export function showHideRod(modelGroup, header_rod_model) {
    // const rodSize = getNodeSize(header_rod_model); // Size of the rod
    // // Check if modelGroup is defined
    // if (modelGroup) {
    //     // Traverse through all nodes in modelGroup
    //     modelGroup.traverse(function (modelNode) {
    //         // Check if the modelNode name matches the pattern "Model_XXXX"
    //         if (/^Model_\d+$/.test(modelNode.name)) {
    //             const header = modelNode.getObjectByName('Header');
    //             const frame = modelNode.getObjectByName('Frame');
    //             const base = modelNode.getObjectByName('Base_Solid');

    //             // Ensure both header and frame nodes exist
    //             if (header && frame) {
    //                 const headerSize = getNodeSize(header); // Size of the current header
    //                 const frameSize = getNodeSize(frame); // Size of the current frame
    //                 const baseSize = getNodeSize(base); // Size of the current frame

    //                 // Remove existing rods to avoid duplicates
    //                 const existingLeftRod = modelNode.getObjectByName("LeftRod_" + modelNode.name);
    //                 const existingRightRod = modelNode.getObjectByName("RightRod_" + modelNode.name);

    //                 if (existingLeftRod && existingRightRod) {
    //                     modelNode.remove(existingLeftRod);
    //                     modelNode.remove(existingRightRod);
    //                     header.position.y = header.position.y - rodSize.y;
    //                 }

    //                 if (params.headerRodToggle) {
    //                     // Create left and right rods
    //                     let leftRod = header_rod_model.clone();
    //                     let rightRod = header_rod_model.clone();
    //                     leftRod.name = "LeftRod_" + modelNode.name;
    //                     rightRod.name = "RightRod_" + modelNode.name;
    //                     leftRod.visible = modelNode.visible; // Set visibility according to the parent model node
    //                     rightRod.visible = modelNode.visible; // Set visibility according to the parent model node

    //                     const headerBox = new THREE.Box3().setFromObject(header);
    //                     const frameBox = new THREE.Box3().setFromObject(frame);

    //                     let rodY = headerBox.min.y + params.cameraPosition + rodSize.y / 2;//(frameSize.y / 2 + rodSize.y / 2);

    //                     // Set the positions for the rods
    //                     leftRod.position.set(
    //                         header.position.x - headerSize.x / 2 + rodSize.x + 5, // Left side
    //                         leftRod.position.y + rodY,
    //                         leftRod.position.z
    //                     );

    //                     rightRod.position.set(
    //                         header.position.x + headerSize.x / 2 - rodSize.x - 5, // Right side
    //                         rightRod.position.y + rodY,
    //                         rightRod.position.z
    //                     );

    //                     // Add rods to the modelNode instead of the scene
    //                     modelNode.attach(leftRod);
    //                     modelNode.attach(rightRod);

    //                     // Adjust the header position
    //                     header.position.y = header.position.y + rodSize.y;

    //                 }

    //                 header.visible = params.headerToggle;

    //             }
    //         }

    //     });
    // }
    if (modelGroup) {
        modelGroup.traverse(function (child) {
            if (child.name === "Header") {
                console.log(child.name)
                child.visible = params.shelfChecked;
            }

        });
    }
}

export function showHideShelf(modelGroup, header_wooden_shelf_model) {
    console.log('params.defaultShelfType', params.defaultShelfType)
    if (modelGroup) {
        modelGroup.traverse(function (child) {
            let isRodShow = false
            if (child.parent) {
                let isShelf = child.parent.getObjectByName('Header_Wooden_Shelf')
                if (isShelf) {
                    isRodShow = true
                }
            }

            if (child.name === "Header_Wooden_Shelf") {
                child.visible = params.shelfChecked && params.defaultShelfType == 'Header_Wooden_Shelf';
            }
            if (child.name === "Header_Glass_Shelf") {
                child.visible = params.shelfChecked && params.defaultShelfType == 'Header_Glass_Shelf';
            }
            if (child.name === "Rod") {
                child.visible = params.shelfChecked && isRodShow;
            }
            if (child.name === "Glass_Shelf_Fixing") {
                child.visible = params.shelfChecked && isRodShow && params.defaultShelfType == 'Header_Glass_Shelf';
            }
            if (headerNames.includes(child.name)) {
                child.visible = false;
            }
        });
    }
}

// export function showHideRod(modelGroup, header_rod_model) {
//     const rodSize = getNodeSize(header_rod_model); // Size of the rod
//     // Check if modelGroup is defined
//     if (modelGroup) {
//         // Traverse through all nodes in modelGroup
//         modelGroup.traverse(function (modelNode) {
//             // Check if the modelNode name matches the pattern "Model_XXXX"
//             if (/^Model_\d+$/.test(modelNode.name)) {
//                 const header = modelNode.getObjectByName('Header');
//                 const frame = modelNode.getObjectByName('Frame');
//                 const base = modelNode.getObjectByName('Base_Solid');

//                 // Ensure both header and frame nodes exist
//                 if (header && frame) {
//                     const headerSize = getNodeSize(header); // Size of the current header
//                     const frameSize = getNodeSize(frame); // Size of the current frame
//                     const baseSize = getNodeSize(base); // Size of the current frame

//                     // Remove existing rods to avoid duplicates
//                     const existingLeftRod = modelNode.getObjectByName("LeftRod_" + modelNode.name);
//                     const existingRightRod = modelNode.getObjectByName("RightRod_" + modelNode.name);

//                     if (existingLeftRod && existingRightRod) {
//                         modelNode.remove(existingLeftRod);
//                         modelNode.remove(existingRightRod);
//                         header.position.y = header.position.y - rodSize.y;
//                     }

//                     if (params.headerRodToggle) {
//                         // Create left and right rods
//                         let leftRod = header_rod_model.clone();
//                         let rightRod = header_rod_model.clone();
//                         leftRod.name = "LeftRod_" + modelNode.name;
//                         rightRod.name = "RightRod_" + modelNode.name;
//                         leftRod.visible = modelNode.visible; // Set visibility according to the parent model node
//                         rightRod.visible = modelNode.visible; // Set visibility according to the parent model node

//                         const headerBox = new THREE.Box3().setFromObject(header);
//                         const frameBox = new THREE.Box3().setFromObject(frame);

//                         let rodY = headerBox.min.y + params.cameraPosition + rodSize.y / 2;//(frameSize.y / 2 + rodSize.y / 2);

//                         // Set the positions for the rods
//                         leftRod.position.set(
//                             header.position.x - headerSize.x / 2 + rodSize.x + 5, // Left side
//                             leftRod.position.y + rodY,
//                             leftRod.position.z
//                         );

//                         rightRod.position.set(
//                             header.position.x + headerSize.x / 2 - rodSize.x - 5, // Right side
//                             rightRod.position.y + rodY,
//                             rightRod.position.z
//                         );

//                         // Add rods to the modelNode instead of the scene
//                         modelNode.attach(leftRod);
//                         modelNode.attach(rightRod);

//                         // Adjust the header position
//                         header.position.y = header.position.y + rodSize.y;

//                     }

//                     header.visible = params.headerToggle;

//                 }
//             }

//         });
//     }
// }

// export function showHideShelf(modelGroup, header_wooden_shelf_model) {
//     const shelfSize = getNodeSize(header_wooden_shelf_model); // Size of the rod
//     // Check if modelGroup is defined
//     if (modelGroup) {
//         // Traverse through all nodes in modelGroup
//         modelGroup.traverse(function (modelNode) {
//             // Check if the modelNode name matches the pattern "Model_XXXX"
//             if (/^Model_\d+$/.test(modelNode.name)) {
//                 const header = modelNode.getObjectByName('Header');
//                 const frame = modelNode.getObjectByName('Frame');
//                 const base = modelNode.getObjectByName('Base_Solid');

//                 // Ensure both header and frame nodes exist
//                 if (header && frame) {
//                     const headerSize = getNodeSize(header); // Size of the current header
//                     const frameSize = getNodeSize(frame); // Size of the current frame
//                     const baseSize = getNodeSize(base); // Size of the current frame

//                     const existingShelfModel = modelNode.getObjectByName("Shelf_" + modelNode.name);

//                     if (existingShelfModel) {
//                         modelNode.remove(existingShelfModel);
//                     }

//                     if (params.shelfChecked) {
//                         header_wooden_shelf_model.visible = true;
//                         let shelfModel = header_wooden_shelf_model.clone();
//                         shelfModel.name = "Shelf_" + modelNode.name;
//                         shelfModel.visible = modelNode.visible; // Set visibility according to the parent model node


//                         const headerBox = new THREE.Box3().setFromObject(header);
//                         const frameBox = new THREE.Box3().setFromObject(frame);

//                         let shelfY = headerBox.min.y + params.cameraPosition + shelfSize.y / 2;//(frameSize.y / 2 + rodSize.y / 2);

//                         // Set the positions for the rods
//                         shelfModel.position.set(
//                             shelfModel.position.x, // Left side
//                             shelfModel.position.y + shelfY,
//                             shelfModel.position.z
//                         );
//                         modelNode.attach(shelfModel);

//                     }

//                     header.visible = params.headerToggle;


//                 }
//             }

//         });
//     }
// }


