import { UIManager } from "./src/managers/UIManager.js";
import { commonMaterial } from "./src/managers/MaterialManager.js";
import { setTextureParams } from "./src/managers/FrameImagesManager.js";
import {
    THREE,
    FontLoader,
    rodFrameTextureNames,
    allFrameBorderNames,
    allGroupModelName,
    frameMainNames,
    frameTop1Names,
    baseFrameNames,
    allGroupNames,
    allModelNames,
    hangerNames,
    headerNames,
    rackNames,
    params,
    setting,
    allGroups,
    sharedParams,
} from "./config.js";
import {
    computeBoundingBox,
    drawMeasurementBoxesWithLabels,
    updateMeasurementGroups,
    updateLabelOcclusion,
} from "./src/managers/MeasurementManager.js";

const fontLoader = new FontLoader().setPath("./three/examples/fonts/");

export function getHex(value) {
    return value.replace("0x", "#");
}

// Helper function to create a delay
export async function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getRemoveIcon(removeIconName) {
    let removeIcon = sharedParams.removeIcon.clone();
    removeIcon.name = removeIconName;
    removeIcon.visible = true;
    return removeIcon.children[0];
}

export function getRodCount(modelSize) {
    let additionalRods = 0;
    if (modelSize >= 3000) {
        additionalRods = 2; // 4 rods total
    } else if (modelSize >= 1200) {
        additionalRods = 1; // 3 rods total
    }
    return additionalRods;
}

export function getSupportBaseCount(modelSize) {
    let additionalMiddleBase = 0;
    if (modelSize >= 3000) {
        additionalMiddleBase = 2; // 4 rods total
    } else if (modelSize >= 1500) {
        additionalMiddleBase = 1; // 3 rods total
    }
    return additionalMiddleBase;
}

export function setPositionCenter(model) {
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3()); // Get the center of the bounding box
    // model.position.y = -center.y
    // Move the model to the center of the area
    // model.position.set(-center.x, -center.y, -center.z); // Center it in the scene
    model.position.sub(center);
    return model;
}

export function getModelNode(model, prefix) {
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

export function updateModelName(model, oldName, newName) {
    let pattern = new RegExp(`^${oldName}\\d{1,2}$`); // Matches names like oldName_500, oldName_600, etc.

    model.traverse((child) => {
        if (pattern.test(child.name) || child.name == oldName) {
            // console.log(pattern.test(child.name), "  -  ", child.name , "  -  ", child.parent.name);
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
            if (
                sourceModel.hasOwnProperty(key) &&
                !targetModel.hasOwnProperty(key)
            ) {
                targetModel[key] = sourceModel[key];
            }
        }
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

// Function to collect all nodes with their conditions

function collectNodes(model) {
    const nodeCollections = {
        // Basic nodes with name checks
        coneNodes: [],
        modelNodes: [],
        leftRightEx: [], // Left_Ex, Right_Ex
        leftRightExSlotted: [], // Left_Ex_Slotted, Right_Ex_Slotted
        hangerNodes: [],
        rackNodes: [],
        headerShelfWooden: [], // Header_Wooden_Shelf
        headerShelfGlass: [], // Header_Glass_Shelf
        glassShelfFixing: [], // Glass_Shelf_Fixing
        rodNodes: [], // Rod nodes
        headerNodes: [], // All header nodes
        baseFrameNodes: [], // Base frame nodes
        frameBorderNodes: [], // Nodes needing frame border updates
        baseMaterialNodes: [], // Base material nodes
        rodFrameNodes: [], // Rod frame nodes
        hangerStandNodes: [], // Hanger stand nodes
        rackWoodenNodes: [], // Rack wooden nodes
        rackStandNodes: [], // Rack stand nodes
        clothingNodes: [], // Clothing nodes
        hangerClubNodes: [], // Hanger club nodes
        nodeToHide: [], // hide nodes
    };

    // Single traverse to collect all nodes
    model.traverse((child) => {
        // Save original context with each node
        child.updateMatrixWorld();

        // Collect nodes based on name
        switch (child.name) {
            case "Cone":
                nodeCollections.coneNodes.push(child);
                break;
            case "Left_Ex":
            case "Right_Ex":
                nodeCollections.leftRightEx.push(child);
                break;
            case "Left_Ex_Slotted":
            case "Right_Ex_Slotted":
                nodeCollections.leftRightExSlotted.push(child);
                break;
            case "Header_Wooden_Shelf":
                nodeCollections.headerShelfWooden.push(child);
                break;
            case "Header_Glass_Shelf":
                nodeCollections.headerShelfGlass.push(child);
                break;
            case "Rod":
                nodeCollections.rodNodes.push(child);
                break;
            case "Glass_Shelf_Fixing":
                nodeCollections.glassShelfFixing.push(child);
                break;
            case "Rack_Wooden_Shelf":
                nodeCollections.rackWoodenNodes.push(child);
                break;
            case "Clothing":
                nodeCollections.clothingNodes.push(child);
                break;
            case "Hanger_ClubsX":
                nodeCollections.hangerClubNodes.push(child);
                break;
            case "Base_Flat":
                nodeCollections.nodeToHide.push(child);
                break;
        }

        // Collection based on includes checks
        if (allModelNames.includes(child.name)) {
            nodeCollections.modelNodes.push(child);
        }
        if (hangerNames.includes(child.name)) {
            nodeCollections.hangerNodes.push(child);
        }
        if (rackNames.includes(child.name)) {
            nodeCollections.rackNodes.push(child);
        }
        if (headerNames.includes(child.name)) {
            nodeCollections.headerNodes.push(child);
        }
        if (baseFrameNames.includes(child.name)) {
            nodeCollections.baseFrameNodes.push(child);
        }
        if (allFrameBorderNames.includes(child.name)) {
            nodeCollections.frameBorderNodes.push(child);
        }
        if (rodFrameTextureNames.includes(child.name)) {
            if (child.type === "Mesh") {
                nodeCollections.rodFrameNodes.push(child);
            }
        }

        // Material and special condition nodes
        if (child.name && child.material) {
            if (
                child.name.startsWith("Base_Option") ||
                child.name === "Base_Support_Sides" ||
                child.name === "Bolts" ||
                child.name === "Plastic_Caps"
            ) {
                nodeCollections.baseMaterialNodes.push(child);
            }
            if (
                [
                    "Hanger_Stand",
                    "Hanger_StandX",
                    "Hanger_Stand-Arm_Metal",
                    "Hanger_Stand-Fixture_Material",
                    "Hanger_Stand-Arm_MetalX",
                    "Hanger_Stand-Fixture_MaterialX",
                ].includes(child.name)
            ) {
                nodeCollections.hangerStandNodes.push(child);
            }
            if (["Rack_Stand_LH", "Rack_Stand_RH"].includes(child.name)) {
                nodeCollections.rackStandNodes.push(child);
            }
        }
    });

    return nodeCollections;
}

export async function showHideNodes() {
    const uiManager = new UIManager();
    let current_setting = setting[sharedParams.selectedGroup.name];
    let main_model = sharedParams.selectedGroup;
    // Collect all nodes once
    const nodes = collectNodes(main_model.activeModel);
    // console.log(sharedParams.modelGroup);
    for (const hideNode of nodes.nodeToHide) {
        hideNode.visible = false;
    }
    // Update materials and visibility in chunks
    async function updateInChunks(nodeArray, updateFn) {
        const chunkSize = 10;
        for (let i = 0; i < nodeArray.length; i += chunkSize) {
            const chunk = nodeArray.slice(i, i + chunkSize);
            await Promise.all(chunk.map(updateFn));
            await new Promise((resolve) => setTimeout(resolve, 0));
        }
    }
    await updateMeasurementGroups();
    await updateLabelOcclusion();

    // Apply updates based on conditions
    await Promise.all([
        // Update cone nodes
        updateInChunks(nodes.coneNodes, (node) => {
            for (const hideCornNode of sharedParams.modelGroup.children) {
                let coneNode = hideCornNode.activeModel.getObjectByName("Cone");
                coneNode.visible = false;
            }
            node.visible = true;
            if (sharedParams.modelGroup.children.length < 2) {
                node.visible = false;
            }
            return Promise.resolve();
        }),

        // Update model nodes
        updateInChunks(nodes.modelNodes, (node) => {
            node.visible = node.name === current_setting.defaultModel;
            if (node.visible) {
                main_model.activeModel = node;
                allGroups.push(main_model);
            }
            return Promise.resolve();
        }),

        // Update Left/Right Ex nodes
        updateInChunks(nodes.leftRightEx, (node) => {
            node.visible = !current_setting.slottedSidesToggle;
            if (!current_setting.slottedSidesToggle) {
                for (const hideLeftRightslotted of nodes.leftRightExSlotted) {
                    hideLeftRightslotted.visible = true;
                }
            }
            if (
                current_setting.slottedSidesToggle &&
                nodes.leftRightExSlotted.length
            ) {
                node.visible = false;
            } else {
                node.visible = true;
            }
            return Promise.resolve();
        }),

        // Update Left/Right Ex Slotted nodes
        updateInChunks(nodes.leftRightExSlotted, (node) => {
            if (current_setting.slottedSidesToggle) {
                for (const hideLeftRight of nodes.leftRightEx) {
                    hideLeftRight.visible = false;
                }
            }
            node.visible = current_setting.slottedSidesToggle;
            return Promise.resolve();
        }),

        updateInChunks(nodes.rodNodes, (node) => {
            node.visible =
                (current_setting.topOption == "Shelf" &&
                    (current_setting.defaultShelfType ==
                        "Header_Wooden_Shelf" ||
                        current_setting.defaultShelfType ==
                            "Header_Glass_Shelf") &&
                    nodes.headerShelfGlass.length > 0) ||
                (current_setting.headerRodToggle &&
                    current_setting.topOption == "Header");
            return Promise.resolve();
        }),

        // Header nodes
        updateInChunks(nodes.headerNodes, (node) => {
            node.visible =
                current_setting.topOption == "Header" &&
                current_setting.defaultHeaderSize == node.name;
            if (current_setting.topOption == "Header") {
                if (
                    current_setting.headerRodToggle &&
                    !current_setting.headerUpDown
                ) {
                    node.position.y += params.rodSize.y;
                } else if (
                    !current_setting.headerRodToggle &&
                    current_setting.headerUpDown
                ) {
                    node.position.y -= params.rodSize.y;
                }
            }
            return Promise.resolve();
        }),

        updateInChunks(main_model.children, (childNode) => {
            if (current_setting.defaultModel !== childNode.name) {
                if (
                    current_setting.headerRodToggle &&
                    !current_setting.headerUpDown
                ) {
                    let header300 = childNode.getObjectByName("Header_300");
                    if (header300) {
                        header300.position.y += params.rodSize.y;
                    }
                    let header500 = childNode.getObjectByName("Header_500");
                    if (header500) {
                        header500.position.y += params.rodSize.y;
                    }
                } else if (
                    !current_setting.headerRodToggle &&
                    current_setting.headerUpDown
                ) {
                    let header300 = childNode.getObjectByName("Header_300");
                    if (header300) {
                        header300.position.y -= params.rodSize.y;
                    }
                    let header500 = childNode.getObjectByName("Header_500");
                    if (header500) {
                        header500.position.y -= params.rodSize.y;
                    }
                }
            }
        }),

        (setting[params.selectedGroupName].headerUpDown = setting[params.selectedGroupName].headerRodToggle),
        // Header Wooden Shelf nodes
        updateInChunks(nodes.headerShelfWooden, (node) => {
            node.visible =
                current_setting.topOption == "Shelf" &&
                current_setting.defaultShelfType == "Header_Wooden_Shelf";
            return Promise.resolve();
        }),

        // Header Glass Shelf nodes
        updateInChunks(nodes.headerShelfGlass, (node) => {
            node.visible =
                current_setting.topOption == "Shelf" &&
                current_setting.defaultShelfType == "Header_Glass_Shelf";
            return Promise.resolve();
        }),

        // Continue with all your other conditions...
        // Example for frame border nodes:
        updateInChunks(nodes.frameBorderNodes, async (node) => {
            if (current_setting.frameMaterialType === "texture") {
                let frame_material =
                    sharedParams.border_texture_material.clone();
                let frame_texture_border = await new THREE.TextureLoader().load(
                    "./assets/images/borders/" +
                        current_setting.frameBorderColor
                );
                frame_texture_border = await setTextureParams(
                    frame_texture_border
                );
                frame_material.map = frame_texture_border;
                node.material = frame_material;
            } else if (current_setting.frameMaterialType === "color") {
                const material = await commonMaterial(
                    parseInt(current_setting.frameBorderColor, 16)
                );
                node.material = material;
            }
            node.material.needsUpdate = true;
        }),

        updateInChunks(nodes.headerShelfWooden, async (node) => {
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
                node.material = material;
                node.material.needsUpdate = true;
            } else if (current_setting.shelfMaterialType === "color") {
                // Apply color
                const material = await commonMaterial(
                    parseInt(current_setting.defaultShelfColor, 16)
                );
                node.material = material;
                node.material.needsUpdate = true;
            }
        }),

        // Base Frame nodes
        updateInChunks(nodes.baseFrameNodes, (node) => {
            node.visible = node.name === current_setting.selectedBaseFrame;
            return Promise.resolve();
        }),

        updateInChunks(nodes.baseMaterialNodes, async (node) => {
            node.material = node.material.clone();
            node.material.color.set(getHex(current_setting.baseFrameColor));
            node.material.needsUpdate = true;
        }),

        updateInChunks(nodes.rackNodes, async (node) => {
            let rackArr = node.rackArrayKey;
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

            node.visible = current_setting.slottedSidesToggle && !isSameSide;
            return Promise.resolve();
        }),

        // Rack wooden nodes
        updateInChunks(nodes.rackWoodenNodes, async (node) => {
            node.material = node.material.clone();
            node.material.color.set(
                getHex(current_setting.defaultRackShelfStandColor)
            );
            node.material.needsUpdate = true;
        }),

        // Rack stand nodes
        updateInChunks(nodes.rackStandNodes, async (node) => {
            if (node.material) {
                node.material = node.material.clone();
                node.material.color.set(
                    getHex(current_setting.defaultRackStandStandColor)
                );
                node.material.needsUpdate = true;
            } else {
                node.traverse(async function (mesh) {
                    if (mesh.material) {
                        mesh.material = mesh.material.clone();
                        mesh.material.color.set(
                            getHex(current_setting.defaultRackStandStandColor)
                        );
                        mesh.material.needsUpdate = true;
                    }
                });
            }
        }),

        // Hanger stand nodes
        updateInChunks(nodes.hangerStandNodes, async (node) => {
            node.material = node.material.clone();
            node.material.color.set(
                getHex(current_setting.defaultHangerStandColor)
            );
            node.material.needsUpdate = true;
        }),

        // Clothing nodes
        updateInChunks(nodes.clothingNodes, (node) => {
            node.visible = current_setting.hangerClothesToggle;
            return Promise.resolve();
        }),

        // Hanger Club nodes
        updateInChunks(nodes.hangerClubNodes, (node) => {
            node.visible = current_setting.hangerGolfClubsToggle;
            return Promise.resolve();
        }),

        // Rod frame nodes
        updateInChunks(nodes.rodFrameNodes, async (node) => {
            node.material = node.material.clone();
            node.material.color.set(getHex(current_setting.rodFrameColor));
            node.material.needsUpdate = true;
        }),

        // Glass Shelf Fixing nodes
        updateInChunks(nodes.glassShelfFixing, (node) => {
            node.visible =
                current_setting.topOption == "Shelf" &&
                current_setting.defaultShelfType == "Header_Glass_Shelf" &&
                nodes.headerShelfGlass.length > 0;
            return Promise.resolve();
        }),

        // Add all your other conditions here following the same pattern
    ]);

    // Update UI elements at the end
    uiManager.updateUIElements(current_setting);
    await drawMeasurementBoxesWithLabels();
}

export function updateActiveModel(modelName) {
    let main_model = sharedParams.selectedGroup;
    for (const node of main_model.children) {
        node.visible = false;
    }
    main_model.activeModel = main_model.getObjectByName(modelName);
    main_model.activeModel.visible = true;
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
            const main_model =
                sharedParams.modelGroup.getObjectByName(modelName);

            main_model.children.forEach((model) => {
                if (
                    allModelNames.includes(model.name) &&
                    model &&
                    model.visible
                ) {
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
                newPositionX =
                    -modelSpacing + currentX + modelWidth / 2 + modelSpacing;
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
export async function checkForCollision(movingModelGroup, moveAmount) {
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

export function findParentWithNamesInArr(node, nameArray) {
    let current = node;

    while (current.parent) {
        // Check if parent's name exists in the array
        if (current.parent.name && nameArray.includes(current.parent.name)) {
            return current.parent;
        }
        current = current.parent;
    }

    return null;
}

export async function addAnotherModels(
    allGroupNames,
    modelName = null,
    side = null
) {
    if (sharedParams.modelGroup) {
        let haveShelf = false;
        let defaultModel =
            sharedParams.modelGroup.getObjectByName("main_model");
        // console.log('defaultModel', defaultModel);
        const newModel = defaultModel.clone();
        await cloneWithCustomProperties(defaultModel, newModel);

        const nodesToRemove = [];
        await traverseAsync(newModel, async (child) => {
            if (hangerNames.includes(child.name) || rackNames.includes(child.name)) {
                if (child.name == "RackWoodenShelf" || child.name == "RackGlassShelf") {
                    haveShelf = true;
                }
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
        const modelBoundingBox = await computeBoundingBox(
            newModel,
            allModelNames
        );
        const modelWidth = modelBoundingBox.max.x - modelBoundingBox.min.x;

        const boundingBox = await computeBoundingBox(
            sharedParams.modelGroup,
            allModelNames
        );

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
            setting[modelName] = JSON.parse(
                JSON.stringify(setting["main_model"])
            );
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
                let currentModelNode = await getMainParentNode(
                    mesh,
                    allModelNames
                );
                if (
                    params.lastInnerMaterial[currentModelNode.name] &&
                    params.lastInnerMaterial[currentModelNode.name][mesh.name]
                ) {
                    // const material = await commonMaterial(parseInt('0xffffff', 16))
                    const material =
                        params.lastInnerMaterial[currentModelNode.name][
                            mesh.name
                        ];
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
export async function addAnotherModelView(mergedArray, cameraOnLeft) {
    const uiManager = new UIManager();
    const rightControls = document.querySelector(".model_items");

    // Loop through the mergedArray and append cards for visible models
    await mergedArray.forEach(async (modelName) => {
        if (
            modelName.startsWith("Other_") &&
            !document.querySelector(
                `.accordion-item[data-model="${modelName}"]`
            )
        ) {
            // Clone the accordion item
            const accordionItem = await uiManager.cloneAccordionItem(modelName);

            if (accordionItem) {
                // Ensure accordionItem is valid
                const accordionContainer =
                    document.querySelector("#accordionModel");

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
                await uiManager.addCloseButton(
                    modelName,
                    accordionItem,
                    mergedArray
                );

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

export async function addRacks(rackType, lastside = null, position = null) {
    if (sharedParams.modelGroup) {
        let selectedGroupName = params.selectedGroupName;
        let defaultModelName = setting[selectedGroupName].defaultModel;
        let selectedGroupModel =
            sharedParams.modelGroup.getObjectByName(selectedGroupName);
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
                    side =
                        sharedParams.camera.position.z > 0 ? "Front" : "Back";
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
                        selectedGroupName +
                        "-" +
                        defaultModelName +
                        "-" +
                        side +
                        "-"; // Prefix to match keys
                    let rackArrayKey = rackPrefix + rackType;

                    // Calculate the bounding box for the frame to find the center
                    const topExSideBoundingBox = new THREE.Box3().setFromObject(
                        topExSide
                    );
                    const topExSideCenter = topExSideBoundingBox.getCenter(
                        new THREE.Vector3()
                    ); // Get center of frame

                    const boundingBox =
                        params.calculateBoundingBox[defaultModelName][
                            frame.name
                        ];

                    // Now compute the bounding box relative to the world coordinates
                    const rackBoundingBox = new THREE.Box3().setFromObject(
                        rack
                    );
                    const rackCenter = rackBoundingBox.getCenter(
                        new THREE.Vector3()
                    );
                    const rackLength =
                        rackBoundingBox.max.z - rackBoundingBox.min.z;

                    rack.position.x = topExSideCenter.x; // Ensure it stays centered

                    frame.attach(rack);

                    let margin = 1;
                    let gmargin = 20;

                    if (side == "Front") {
                        rack.position.z =
                            boundingBox.max.z + rackLength / 2 + margin;
                        rack.rotation.y = Math.PI;
                        if (rack.name == "RackGlassShelf") {
                            rack.position.z -= gmargin;
                        }
                    } else {
                        rack.position.z =
                            boundingBox.min.z - rackLength / 2 - margin;
                        if (rack.name == "RackGlassShelf") {
                            rack.position.z += gmargin;
                        }
                    }

                    let removeRackIcon = await getRemoveIcon(
                        `removeRack-${rackType}`
                    );

                    removeRackIcon.position.set(
                        rackBoundingBox.max.x, // Offset in world space
                        0,
                        -rackBoundingBox.min.z + 1
                    );
                    removeRackIcon.visible = false;
                    rack.add(removeRackIcon);
                    rack.removeIcon = removeRackIcon;

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
                    params.rackCount[rackArrayKey] =
                        params.rackCount[rackArrayKey] || 0;
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

export function checkTime(name){
    console.log(
        `${name}`,
        Math.floor(Math.floor(Date.now() / 1000) / 60),
        Math.floor(Math.floor(Date.now() / 1000) % 60)
    );
}
// --------------------------------export models--------------------------------------------
