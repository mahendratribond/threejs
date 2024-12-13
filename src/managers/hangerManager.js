import {
    updateModelName,
    getRemoveIcon,
    showHideNodes,
    getHex,
} from "../../utils6.js";

import { commonMaterial } from "./MaterialManager.js";

import {
    THREE,
    params,
    golfClubNames,
    setting,
    rackNames,
    hangerNames, sharedParams,
} from "../../config.js";

export async function cloneWithCustomHangerProperties(source, target) {
    for (let model of hangerNames) {
        let sourceModel = source.getObjectByName(model);
        let targetModel = target.getObjectByName(model);
        for (let key in sourceModel) {
            if (sourceModel.hasOwnProperty(key) && !targetModel.hasOwnProperty(key)) {
                targetModel[key] = sourceModel[key];
            }
        }
    }
}

export async function addHangers(hangerType, lastside = null, position = null) {
    if (sharedParams.modelGroup) {
        let hangermodel, hanger;

        // const loader = new GLTFLoader();
        // if (golfClubNames.includes(hangerType)) {
        //     hangermodel = sharedParams.hanger_golf_club_model;
        // }
        if (hangerType == "Hanger_Golf_Club_Iron") {
            hangermodel = sharedParams.hanger_golf_Iron_club_model;
        } else if (hangerType == "Hanger_Golf_Club_Driver") {
            hangermodel = sharedParams.hanger_golf_driver_club_model;
        } else {
            hangermodel = sharedParams.hanger_model;
        }
        let selectedGroupName = params.selectedGroupName;
        let defaultModelName = setting[selectedGroupName].defaultModel;
        let selectedGroupModel = sharedParams.modelGroup.getObjectByName(selectedGroupName);
        let defaultModel = selectedGroupModel.getObjectByName(defaultModelName);
        if (hangermodel) {
            // console.log('hangermodel', hangermodel)
            // console.log('selectedGroupName', selectedGroupName)
            // console.log('defaultModelName', defaultModelName)

            let hanger_object = hangermodel.getObjectByName(hangerType);
            if (hanger_object) {
                hanger = hanger_object.clone();
                if (hanger) {
                    let frame = defaultModel.getObjectByName("Frame");
                    let side;
                    if (lastside) {
                        side = lastside;
                    } else {
                        side = sharedParams.camera.position.z > 0 ? "Front" : "Back";
                    }
                    let sameSide = false;
                    for (const rackHanger of frame.children) {
                        if (rackNames.includes(rackHanger.name)) {
                            if (side === rackHanger.side) {
                                sameSide = true;
                            }
                        }
                    }

                    const hangerPrefix =
                        selectedGroupName + "-" + defaultModelName + "-" + side + "-"; // Prefix to match keys
                    let hangerArrayKey = hangerPrefix + hangerType;

                    let conditionFlag = await isHangerAdd(
                        frame,
                        hangermodel,
                        hangerType,
                        params.hangerCount,
                        hangerPrefix
                    );

                    // if (!conditionFlag) {
                    // console.log("frame:", frame);
                    // console.log("hangermodel:", hangermodel);
                    // console.log("hangerType:", hangerType);
                    // console.log("params.hangerCount:", params.hangerCount);
                    // console.log("hangerArrayKey:", hangerArrayKey);
                    // console.log("conditionFlag:", conditionFlag);
                    //   // console.log("There is not enough .", frame, hangermodel, hangerType, params.hangerCount, hangerArrayKey, conditionFlag);
                    // }

                    // let leftSideSlotted = frame.getObjectByName("Left_Ex_Slotted");
                    let RackShelf =
                        frame.getObjectByName("RackWoodenShelf") ||
                        frame.getObjectByName("RackGlassShelf");
                    // if (!leftSideSlotted || !leftSideSlotted.visible) {
                    if (!RackShelf || !RackShelf.visible || sameSide === false) {
                        if (conditionFlag) {
                            hanger.position.y -= params.cameraPosition;
                            hanger.name = hangerType;

                            // Get the bounding box of the frame to find its center
                            const frameBoundingBox = new THREE.Box3().setFromObject(frame);
                            const frameCenter = frameBoundingBox.getCenter(
                                new THREE.Vector3()
                            );
                            const frameWidth =
                                frameBoundingBox.max.x - frameBoundingBox.min.x;

                            // Get the bounding box of the hanger
                            const hangerBoundingBox = new THREE.Box3().setFromObject(hanger);
                            const hangerCenter = hangerBoundingBox.getCenter(
                                new THREE.Vector3()
                            );
                            const hangerLength =
                                hangerBoundingBox.max.z - hangerBoundingBox.min.z;

                            hanger.localToWorld(hangerBoundingBox.min);
                            hanger.localToWorld(hangerBoundingBox.max);

                            let removeHangerIcon = await getRemoveIcon(
                                `removeHanger-${hangerType}`
                            );

                            // if (position) {
                            //   hanger.position.x = frameCenter.x + position.x
                            // }
                            // else {
                            //   hanger.position.x = frameCenter.x;
                            // }
                            hanger.position.x = frameCenter.x;

                            removeHangerIcon.position.set(
                                0, // Offset in world space
                                hangerCenter.y,
                                -hangerLength
                            );
                            // Adjust the hanger position based on the camera's z-axis position
                            if (side == "Front") {
                                hanger.rotation.y = Math.PI;
                                if (
                                    golfClubNames.includes(hangerType) ||
                                    hangerType == "Hanger_Rail_Step"
                                ) {
                                    hanger.position.z =
                                        frame.position.z - hangerBoundingBox.max.z - 40; // Small offset in front of the frame
                                } else {
                                    hanger.position.z =
                                        frame.position.z - hangerBoundingBox.max.z / 2; // Small offset in front of the frame
                                }
                                // hanger.position.x = frame.position.x
                            }

                            removeHangerIcon.visible = false;
                            hanger.add(removeHangerIcon);
                            frame.attach(hanger);

                            // Update removeHanger to always face the camera
                            sharedParams.scene.onBeforeRender = function () {
                                sharedParams.scene.traverse((obj) => {
                                    if (obj.name && obj.name.includes("remove")) {
                                        obj.lookAt(sharedParams.camera.position);
                                    }
                                });
                            };

                            if (position) {
                                hanger.position.x = position.x;
                            }

                            params.hangerCount = params.hangerCount || {};
                            params.hangerCount[hangerArrayKey] =
                                params.hangerCount[hangerArrayKey] || 0;
                            params.hangerCount[hangerArrayKey] += 1;

                            let count = params.hangerCount[hangerArrayKey];
                            hanger.hangerCount = count;
                            hanger.hangerArrayKey = hangerArrayKey;
                            hanger.side = side;

                            // params.hangerAdded = params.hangerAdded || {};
                            // params.hangerAdded[hangerArrayKey] = params.hangerAdded[hangerArrayKey] || {};
                            // params.hangerAdded[hangerArrayKey][count] = hanger.position;

                            // console.log('params.hangerCount', params.hangerCount);
                            // console.log('params.hangerAdded', params.hangerAdded);

                            await showHideNodes();
                        } else {
                            if (!lastside) {
                                alert("There is not enough space to add this hanger.");
                            }
                            console.log("There is not enough space to add this hanger.");
                        }
                    } else {
                        // alert('The slotted side is visible; cannot add hanger.');
                    }
                }
            }
        }
    }
}

export async function isHangerAdd(
    frame,
    hangermodel,
    hangerType,
    hangerArray,
    hangerPrefix
) {
    let conditionFlag = true;

    // Get the Top_Ex node width
    let topExNode = frame.getObjectByName("Top_Ex");

    if (!topExNode) {
        console.error("Top_Ex node not found!");
        return false;
    }

    const topExBoundingBox = new THREE.Box3().setFromObject(topExNode);
    const topExWidth = topExBoundingBox.max.x - topExBoundingBox.min.x;
    // Calculate the total width of hangers already added
    let totalHangerWidth = 0;
    totalHangerWidth -= params.frameTopExMargin * 2;
    for (let key in hangerArray) {
        if (key.startsWith(hangerPrefix)) {
            let hangerName = key.replace(hangerPrefix, "");
            let hangerArrayKey = hangerPrefix + hangerName;
            if (hangerName && hangerArray[hangerArrayKey] > 0) {
                let hanger = frame.getObjectByName(hangerName);
                if (hanger) {
                    const hangerBoundingBox = new THREE.Box3().setFromObject(hanger);
                    totalHangerWidth +=
                        (hangerBoundingBox.max.x - hangerBoundingBox.min.x) *
                        hangerArray[hangerArrayKey];
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

export async function setupHangerGolfClubModel() {
    if (sharedParams.hanger_golf_club_model) {
        sharedParams.hanger_golf_club_model = await updateModelName(
            sharedParams.hanger_golf_club_model,
            "Hanger_Stand_",
            "Hanger_Stand"
        );
        sharedParams.hanger_golf_club_model = await updateModelName(
            sharedParams.hanger_golf_club_model,
            "Hanger_Stand-Arm_Rubber_",
            "Hanger_Stand-Arm_Rubber"
        );
        sharedParams.hanger_golf_club_model = await updateModelName(
            sharedParams.hanger_golf_club_model,
            "Hanger_Stand-Fixture Material",
            "Hanger_Stand-Fixture_Material"
        );
        sharedParams.hanger_golf_club_model = await updateModelName(
            sharedParams.hanger_golf_club_model,
            "Hanger_Stand-Arm_Metal_",
            "Hanger_Stand-Arm_Metal"
        );

        sharedParams.hanger_golf_club_model = await updateModelName(
            sharedParams.hanger_golf_club_model,
            "Hanger_Clubs_",
            "Hanger_Clubs"
        );
        sharedParams.hanger_golf_club_model = await updateModelName(
            sharedParams.hanger_golf_club_model,
            "Hanger_Clubs-Club_Grip_Rubber_",
            "Hanger_Clubs-Club_Grip_Rubber"
        );
        sharedParams.hanger_golf_club_model = await updateModelName(
            sharedParams.hanger_golf_club_model,
            "Hanger_Clubs-Driver_Shaft_Metalic_",
            "Hanger_Clubs-Driver_Shaft_Metalic"
        );

        sharedParams.hanger_golf_club_model = await updateModelName(
            sharedParams.hanger_golf_club_model,
            "Hanger_Faceplate_",
            "Hanger_Faceplate"
        );
        sharedParams.hanger_golf_club_model = await updateModelName(
            sharedParams.hanger_golf_club_model,
            "Hanger_Faceplate-Arm_Metal_",
            "Hanger_Faceplate-Arm_Metal"
        );
        sharedParams.hanger_golf_club_model = await updateModelName(
            sharedParams.hanger_golf_club_model,
            "Hanger_Faceplate-Logo_",
            "Hanger_Faceplate-Logo"
        );

        sharedParams.hanger_golf_club_model.traverse(async function (child) {
            // if (child.name == "Iron_Arm_1") {
            //     child.name = 'Hanger_Stand';
            // }
            // if (child.name == "Driver_Arm") {
            //     child.name = 'Hanger_Stand';
            // }
            if (
                child.material &&
                [
                    "Hanger_StandX",
                    "Hanger_Stand-Arm_MetalX",
                    "Hanger_Stand-Arm_RubberX",
                ].includes(child.name)
            ) {
                const material = await commonMaterial(
                    parseInt(params.defaultHangerStandColor, 16)
                );
                child.material = material;
                child.material.needsUpdate = true;
            }
            if (child.material && ["Hanger_Stand"].includes(child.name)) {
                // const material = await commonMaterial(parseInt(params.defaultHangerStandColor, 16))
                // child.material = material
                // child.material.needsUpdate = true;
            } else if (child.material && ["Hanger_Clubs"].includes(child.name)) {
                // const material = await commonMaterial(parseInt('0x444444', 16))
                // child.material = material
                // child.material.needsUpdate = true;
            } else if (child.material && ["Hanger_Faceplate"].includes(child.name)) {
                // const material = await commonMaterial(parseInt('0x444444', 16))
                // child.material = material
                // child.material.needsUpdate = true;
            } else {
                // const material = await commonMaterial(parseInt(params.defaultHangerStandColor, 16))
                // child.material = material
                // child.material.needsUpdate = true;
            }
        });
    }else{
        console.log("no golf model found");
        
    }
}
