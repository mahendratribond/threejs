import {
    THREE,
    params,
    setting,
    rackNames,
    hangerNames,
    allGroupNames,
    rackPartNames,
    allModelNames,
    hangerPartNames,
    sharedParams,
} from "../../config.js";

import {
    getHex,
    addRacks,
    showHideNodes,
    centerMainModel,
    addAnotherModels,
    updateActiveModel,
    checkForCollision,
    findParentNodeByName,
    drawMeasurementBoxesWithLabels,
} from "../../utils6.js";

import { otherModelSetup, updateMaterial } from "../../main6.js";

import {
    setTopFrameCropedImage,
    setMainFrameCropedImage,
} from "./FrameImagesManager.js";

import { Scene } from "../core/Scene.js";
import { getCurrentModelSize } from "./MeasurementManager.js";
import { addHangers } from "./HangerManager.js";

const sceneUI = new Scene();
export class UIManager {
    constructor(modelManager, sceneManager) {
        this.modelManager = modelManager;
        this.sceneManager = sceneManager;
        this.hangerIntersects = [];
        this.initializeUIElements();
        // this.setupEventListeners();
    }

    initializeUIElements() {
        // Store UI element references
        this.elements = {
            container: document.getElementById("container"),
            // Select the elements by class instead of id
            frameSize: document.querySelector(".frameSize"),
            topDropdown: document.querySelector(".topDropdown"),
            baseColor: document.querySelector(".baseColor"),
            shelfTypeDropdown: document.querySelector(".shelfTypeDropdown"),
            headerOptions: document.querySelector(".headerOptions"),
            headerSizeDropdown: document.querySelector(".headerSizeDropdown"),
            headerRodToggle: document.querySelector(".headerRodToggle"),
            headerRodColorDropdown: document.querySelector(
                ".headerRodColorDropdown"
            ),
            topFrameFileUpload: document.querySelector(".topFrameFileUpload"),
            headerFrameColorInput: document.querySelector(
                ".headerFrameColorInput"
            ),
            headerFrameColorDropdown: document.querySelector(
                ".headerFrameColorDropdown"
            ),
            slottedSidesToggle: document.querySelector(".slottedSidesToggle"),
            mainFrameFileUpload: document.querySelector(".mainFrameFileUpload"),
            mainFrameColorInput: document.querySelector(".mainFrameColorInput"),
            baseSelectorDropdown: document.querySelector(
                ".baseSelectorDropdown"
            ),
            hangerClothesToggle: document.querySelector(".hangerClothesToggle"),
            hangerGolfClubsToggle: document.querySelector(
                ".hangerGolfClubsToggle"
            ),
            hangerStandColor: document.querySelector(".hangerStandColor"),
            rackShelfColor: document.querySelector(".rackShelfColor"),
            rackStandColor: document.querySelector(".rackStandColor"),
            addHanger: document.querySelectorAll(".addHanger"),
            addAnotherModel: document.querySelectorAll(".addAnotherModel"),
            addRack: document.querySelectorAll(".addRack"),
            measurementToggle: document.getElementById("measurementToggle"),
            captureButton: document.getElementById("captureButton"),
            takeScreenShot: document.getElementById("takeScreenShot"),
            saveModelDataButton: document.getElementById("saveModelDataButton"),
            showInAR: document.getElementById("showInAR"),
            savePdfButton: document.getElementById("savePdfButton"),
            cropperContainer: document.getElementById("cropper-container"),
            cropperImage: document.getElementById("cropper-image"),
            cropButton: document.getElementById("crop-button"),
            closeButton: document.getElementById("close-button"),
            closeButtonAR: document.getElementById("closeButtonAR"),
            createQrButton: document.getElementById("createQrButton"),
            formSubmition: document.getElementById("formSubmition"),
            formCloseBtn: document.getElementById("formCloseBtn"),
            submitForm: document.querySelector(".submitForm"),
            formModel: document.getElementById("formModel"),
            accordionModel: document.getElementById("accordionModel"),
            moveLeftModel: document.getElementById("moveLeftModel"),
            moveRightModel: document.getElementById("moveRightModel"),
            zoomInButton: document.getElementById("cropper-zoom-in"),
            zoomOutButton: document.getElementById("cropper-zoom-out"),
            resetButton: document.getElementById("cropper-reset"),
            registerForm: document.querySelector(".openRegisterForm"),
            LoginForm: document.querySelector(".openLoginForm"),
            loginRegisterClose: document.getElementById("loginRegisterClose"),
        };

        this.loadingElements = {
            loaderElement: document.getElementById("loader"),
            progressBarFill: document.getElementById("progress-bar-fill"),
            progressText: document.getElementById("progress-text"),
        };
    }

    async saveCropImage() {
        if (sharedParams.cropper) {
            const base64Image = sharedParams.cropper.getCroppedCanvas().toDataURL("image/png");
            const formData = new FormData();
            formData.append("modelCropImage", base64Image);
            formData.append("action", "saveModelCropImage");
            try {
                const response = await fetch("api.php", {
                    method: "POST",
                    body: formData,
                });
                const data = await response.json();
                return data; // Ensure the resolved data is returned
            } catch (error) {
                console.error("Error saving image:", error);
                throw error; // Re-throw the error to handle it at the calling point
            }
        }
    }

    async setupEventListeners(
        lights,
        lightHelpers
    ) {
        // Event listeners for controls
        if (this.elements.frameSize) {
            this.elements.frameSize.value = params.defaultModel;
            
            // frameSize.addEventListener("change", async function (event) {
                document.addEventListener("change", async function (event) {
                    if (event.target.classList.contains("frameSize")) {
                        setting[params.selectedGroupName].defaultModel =
                        event.target.value;
                    console.log(setting[params.selectedGroupName].defaultModel);
                    updateActiveModel(
                        setting[params.selectedGroupName].defaultModel
                    );
                    await showHideNodes();
                    await centerMainModel();
                    // await lightSetup();
                    if (lights !== undefined && lightHelpers !== undefined) {
                        await sceneUI.lightSetup(lights, lightHelpers);
                    }
                }
            });
        }

        if (this.elements.topDropdown) {
            this.elements.topDropdown.value = params.topOption;
            document.addEventListener("change", async function (event) {
                if (event.target.classList.contains("topDropdown")) {
                    // console.log(
                    //   "setting[params.selectedGroupName]",
                    //   setting[params.selectedGroupName]
                    // );
                    console.log(
                        "params.selectedGroupName",
                        params.selectedGroupName
                    );                    
                    setting[params.selectedGroupName].topOption =
                        event.target.value;
                    setting[params.selectedGroupName].headerRodToggle = false;
                    if (
                        setting[params.selectedGroupName].topOption ==
                        "Header_Wooden_Shelf"
                    ) {
                        setting[
                            params.selectedGroupName
                        ].headerRodToggle = true;
                    }
                    console.log(setting[params.selectedGroupName].topOption);
                    

                    const headerRodToggle =
                        document.querySelector(".headerRodToggle");
                    headerRodToggle.checked =
                        setting[params.selectedGroupName].headerRodToggle;
                    await otherModelSetup();
                    await showHideNodes();
                }
                // You can add similar event handlers for other elements here
            });
        }

        if (this.elements.headerOptions) {
            this.elements.headerOptions.value = params.headerOptions;
            document.addEventListener("change", async function (event) {
                if (event.target.classList.contains("headerOptions")) {
                    setting[params.selectedGroupName].headerOptions =
                        event.target.value;
                    await otherModelSetup();
                    await showHideNodes();
                }
            });
        }

        if (this.elements.headerSizeDropdown) {
            this.elements.headerSizeDropdown.value = params.defaultHeaderSize;
            document.addEventListener("change", async function (event) {
                if (event.target.classList.contains("headerSizeDropdown")) {
                    setting[params.selectedGroupName].defaultHeaderSize =
                        event.target.value;
                    await otherModelSetup();
                    await showHideNodes();
                }
            });
        }

        if (this.elements.headerRodToggle) {
            this.elements.headerRodToggle.checked = params.headerRodToggle;
            document.addEventListener("change", async function (event) {
                if (event.target.classList.contains("headerRodToggle")) {
                    setting[params.selectedGroupName].headerRodToggle =
                        event.target.checked;
                    await otherModelSetup();
                    await showHideNodes();
                }
            });
        }

        if (this.elements.headerRodColorDropdown) {
            this.elements.headerRodColorDropdown.value = params.rodFrameColor;
            document.addEventListener("change", async function (event) {
                if (event.target.classList.contains("headerRodColorDropdown")) {
                    setting[params.selectedGroupName].rodFrameColor =
                        event.target.value;
                    await otherModelSetup();
                    await showHideNodes();
                }
            });
        }

        if (this.elements.shelfTypeDropdown) {
            this.elements.shelfTypeDropdown.value = params.defaultShelfType;
            document.addEventListener("change", async function (event) {
                if (event.target.classList.contains("shelfTypeDropdown")) {
                    setting[params.selectedGroupName].defaultShelfType =
                        event.target.value;
                    await otherModelSetup();
                    await showHideNodes();
                }
            });
        }

        if (this.elements.slottedSidesToggle) {
            this.elements.slottedSidesToggle.checked =
                params.slottedSidesToggle;
            document.addEventListener("change", async function (event) {
                if (event.target.classList.contains("slottedSidesToggle")) {
                    setting[params.selectedGroupName].slottedSidesToggle =
                        event.target.checked;
                    console.log(
                        setting[params.selectedGroupName].slottedSidesToggle
                    );
                    
                    await otherModelSetup();
                    await showHideNodes();
                }
            });
        }

        if (this.elements.topFrameFileUpload) {
            document.addEventListener("change", async function (event) {
                if (event.target.classList.contains("topFrameFileUpload")) {
                    if (sharedParams.modelGroup) {
                        const file = event.target.files[0];
                        if (!file) return;
                        params.fileUploadFlag = "TopFrame";

                        const reader = new FileReader();
                        reader.onload = async function (e) {
                            const cropperImage =
                                document.getElementById("cropper-image");
                            const cropperContainer =
                                document.getElementById("cropper-container");
                            cropperImage.src = e.target.result;
                            cropperContainer.style.display = "block";

                            if (sharedParams.cropper) {
                                sharedParams.cropper.destroy();
                            }

                            let currentGroup =
                                sharedParams.modelGroup.getObjectByName(
                                    params.selectedGroupName
                                );
                            let defaultModelName =
                                setting[params.selectedGroupName].defaultModel;

                            let currentModel =
                                currentGroup.getObjectByName(defaultModelName);
                            let defaultHeaderSize =
                                setting[params.selectedGroupName]
                                    .defaultHeaderSize;
                            let currentHeader =
                                currentModel.getObjectByName(defaultHeaderSize);
                            const size = await getCurrentModelSize(
                                currentHeader,
                                "Header_Graphic1-Mat"
                            );
                            // console.log("size", size);

                            sharedParams.cropper = new Cropper(cropperImage, {
                                aspectRatio: size.x / size.y,
                                viewMode: 0.4,
                                autoCropArea: 1,
                                cropBoxResizable: true,
                                cropBoxMovable: true,
                                background: false,
                            });
                        };
                        reader.readAsDataURL(file);
                    }
                }
            });
        }

        if (this.elements.mainFrameFileUpload) {
            document.addEventListener("change", async function (event) {
                if (event.target.classList.contains("mainFrameFileUpload")) {
                    if (sharedParams.modelGroup) {
                        const file = event.target.files[0];
                        if (!file) return;

                        params.fileUploadFlag = "MainFrame";

                        const reader = new FileReader();
                        reader.onload = async function (e) {
                            const cropperImage =
                                document.getElementById("cropper-image");
                            const cropperContainer =
                                document.getElementById("cropper-container");
                            cropperImage.src = e.target.result;
                            cropperContainer.style.display = "block";

                            if (sharedParams.cropper) {
                                sharedParams.cropper.destroy();
                            }

                            let currentGroup =
                                sharedParams.modelGroup.getObjectByName(
                                    params.selectedGroupName
                                );
                            let defaultModelName =
                                setting[params.selectedGroupName].defaultModel;
                            let defaultModel =
                                currentGroup.getObjectByName(defaultModelName);

                            const size = await getCurrentModelSize(
                                defaultModel,
                                "Cube1-Mat"
                            );
                            // console.log(size)

                            sharedParams.cropper = new Cropper(cropperImage, {
                                aspectRatio: size.x / size.y,
                                viewMode: 0.4,
                                autoCropArea: 1,
                                cropBoxResizable: true,
                                cropBoxMovable: true,
                                background: false,
                            });
                        };
                        reader.readAsDataURL(file);
                    }
                }
            });
        }

        if (this.elements.closeButton) {
            this.elements.closeButton.addEventListener("click", (event) =>
                this.closeCropper()
            );
        }

        if (this.elements.cropButton) {
            this.elements.cropButton.addEventListener(
                "click",
                async (event) => {
                    if (sharedParams.cropper) {
                        let selectedGroupName = params.selectedGroupName;
                        let defaultModel =
                            setting[selectedGroupName].defaultModel;
                        let defaultHeaderSize =
                            setting[selectedGroupName].defaultHeaderSize;
                        if (params.fileUploadFlag == "MainFrame") {
                            sharedParams.mainFrameCropedImage =
                                sharedParams.mainFrameCropedImage || {};
                            sharedParams.mainFrameCropedImage[
                                selectedGroupName
                            ] =
                                sharedParams.mainFrameCropedImage[
                                    selectedGroupName
                                ] || {};
                            let mainFrameSaveImageURl =
                                await this.saveCropImage();
                            sharedParams.mainFrameCropedImage[
                                selectedGroupName
                            ][defaultModel] = mainFrameSaveImageURl.imageUrl;
                            await setMainFrameCropedImage(
                                sharedParams.mainFrameCropedImage
                            );
                        } else if (params.fileUploadFlag == "TopFrame") {
                            sharedParams.topFrameCropedImage =
                                sharedParams.topFrameCropedImage || {};
                            sharedParams.topFrameCropedImage[
                                selectedGroupName
                            ] =
                                sharedParams.topFrameCropedImage[
                                    selectedGroupName
                                ] || {};
                            sharedParams.topFrameCropedImage[selectedGroupName][
                                defaultModel
                            ] =
                                sharedParams.topFrameCropedImage[
                                    selectedGroupName
                                ][defaultModel] || {};
                            let topFrameSaveImageURl =
                                await this.saveCropImage();
                            sharedParams.topFrameCropedImage[selectedGroupName][
                                defaultModel
                            ][defaultHeaderSize] =
                                topFrameSaveImageURl.imageUrl;
                            await setTopFrameCropedImage(
                                sharedParams.topFrameCropedImage
                            );
                        }
                    }
                }
            );
        }

        if (this.elements.headerFrameColorDropdown) {
            this.elements.headerFrameColorDropdown.value =
                params.topFrameBackgroundColor;
            document.addEventListener("change", async function (event) {
                if (
                    event.target.classList.contains("headerFrameColorDropdown")
                ) {
                    setting[params.selectedGroupName].topFrameBackgroundColor =
                        event.target.value;
                    await setTopFrameCropedImage();
                }
            });
        }

        if (this.elements.baseSelectorDropdown) {
            this.elements.baseSelectorDropdown.value = params.selectedBaseFrame;
            document.addEventListener("change", async function (event) {
                if (event.target.classList.contains("baseSelectorDropdown")) {
                    setting[params.selectedGroupName].selectedBaseFrame =
                        event.target.value;
                    await otherModelSetup();
                    await showHideNodes();
                }
            });
        }

        if (this.elements.baseColor) {
            this.elements.baseColor.value = params.baseFrameColor;
            document.addEventListener("change", async function (event) {
                if (event.target.classList.contains("baseColor")) {
                    setting[params.selectedGroupName].baseFrameColor =
                        event.target.value;
                    await otherModelSetup();
                    await showHideNodes();
                }
            });
        }

        if (this.elements.addHanger) {
            document.addEventListener("click", async function (event) {
                if (event.target.closest(".addHanger")) {
                    const hangerType = event.target.getAttribute("data-hanger");
                    await otherModelSetup();
                    await addHangers(hangerType);
                }
            });
        }

        if (this.elements.addRack) {
            document.addEventListener("click", async function (event) {
                if (event.target.closest(".addRack")) {
                    const rackType = event.target.getAttribute("data-rack");
                    await otherModelSetup();
                    await addRacks(rackType);
                }
            });
        }

        if (this.elements.hangerClothesToggle) {
            this.elements.hangerClothesToggle.checked =
                params.hangerClothesToggle;
            document.addEventListener("change", async (event) => {
                if (event.target.classList.contains("hangerClothesToggle")) {
                    setting[params.selectedGroupName].hangerClothesToggle =
                        event.target.checked;
                    await otherModelSetup();
                    await showHideNodes();
                }
            });
        }

        if (this.elements.hangerGolfClubsToggle) {
            this.elements.hangerGolfClubsToggle.checked =
                params.hangerGolfClubsToggle;
            document.addEventListener("change", async (event) => {
                if (event.target.classList.contains("hangerGolfClubsToggle")) {
                    setting[params.selectedGroupName].hangerGolfClubsToggle =
                        event.target.checked;
                    await otherModelSetup();
                    await showHideNodes();
                }
            });
        }

        if (this.elements.hangerStandColor) {
            this.elements.hangerStandColor.value =
                params.defaultHangerStandColor;
            document.addEventListener("change", async function (event) {
                if (event.target.classList.contains("hangerStandColor")) {
                    setting[params.selectedGroupName].defaultHangerStandColor =
                        event.target.value;
                    await otherModelSetup();
                    await showHideNodes();
                }
            });
        }

        if (this.elements.rackShelfColor) {
            this.elements.rackShelfColor.value =
                params.defaultRackShelfStandColor;
            document.addEventListener("change", async function (event) {
                if (event.target.classList.contains("rackShelfColor")) {
                    setting[
                        params.selectedGroupName
                    ].defaultRackShelfStandColor = event.target.value;
                    await otherModelSetup();
                    await showHideNodes();
                }
            });
        }

        if (this.elements.rackStandColor) {
            this.elements.rackStandColor.value =
                params.defaultRackStandStandColor;
            document.addEventListener("change", async function (event) {
                if (event.target.classList.contains("rackStandColor")) {
                    setting[
                        params.selectedGroupName
                    ].defaultRackStandStandColor = event.target.value;
                    await otherModelSetup();
                    await showHideNodes();
                }
            });
        }

        if (this.elements.measurementToggle) {
            this.elements.measurementToggle.checked = params.measurementToggle;

            this.elements.measurementToggle.addEventListener(
                "change",
                async function (event) {
                    params.measurementToggle = event.target.checked;
                    await otherModelSetup();
                    await showHideNodes();
                }
            );
        }

        if (this.elements.addAnotherModel) {
            this.elements.addAnotherModel.forEach((button) => {
                button.addEventListener("click", async function () {
                    await addAnotherModels(allGroupNames);
                    await centerMainModel();
                    await showHideNodes();
                });
            });
        }

        if (this.elements.zoomInButton) {
            this.elements.zoomInButton.addEventListener("click", function () {
                if (sharedParams.cropper) sharedParams.cropper.zoom(0.1); // Zoom in
            });
        }

        if (this.elements.zoomOutButton) {
            this.elements.zoomOutButton.addEventListener("click", function () {
                if (sharedParams.cropper) sharedParams.cropper.zoom(-0.1); // Zoom out
            });
        }

        if (this.elements.resetButton) {
            this.elements.resetButton.addEventListener("click", function () {
                if (sharedParams.cropper) {
                    sharedParams.cropper.reset(); // Reset cropper settings to default
                }
            });
        }
        if (this.elements.accordionModel) {
            this.elements.accordionModel.addEventListener(
                "show.bs.collapse",
                async (event) => {
                    const openAccordionItems =
                        this.elements.accordionModel.querySelectorAll(
                            ".accordion-collapse.show"
                        );
                    openAccordionItems.forEach((item) => {
                        const bsCollapse = new bootstrap.Collapse(item, {
                            toggle: false, // This will collapse the accordion content
                        });
                        bsCollapse.hide(); // Explicitly hide the open accordion
                    });
                    const openedAccordionItem = event.target.closest(".accordion-item");

                    // Find the data-model attribute of the currently open accordion item
                    const modelName =
                        openedAccordionItem.getAttribute("data-model");
                    if (modelName) {
                        params.selectedGroupName = modelName;
                        let main_model = sharedParams.modelGroup.getObjectByName(
                            params.selectedGroupName
                        );
                        sharedParams.selectedGroup = main_model;
                        await otherModelSetup();
                        await showHideNodes();
                    }
                }
            );
        }

        // Move Left
        this.elements.moveLeftModel.addEventListener("click", async () => {
            const selectedGroupName = params.selectedGroupName;
            const selectedModelGroup =
                sharedParams.modelGroup.getObjectByName(selectedGroupName);

            if (selectedModelGroup) {
                // Check for collision before moving left
                const canMoveLeft = await checkForCollision(
                    selectedModelGroup,
                    -params.moveLeftRight
                );

                if (canMoveLeft) {
                    selectedModelGroup.position.x -= params.moveLeftRight; // Move selected model group left
                    if (!selectedModelGroup.spacing) {
                        selectedModelGroup.spacing = 0;
                    }
                    selectedModelGroup.spacing -= params.moveLeftRight;
                    await drawMeasurementBoxesWithLabels();
                } else {
                    console.log(
                        "Collision detected! Cannot move further left."
                    );
                }
            } else {
                console.log(`Group ${selectedGroupName} not found.`);
            }
        });

        // Move Right
        this.elements.moveRightModel.addEventListener("click", async () => {
            const selectedGroupName = params.selectedGroupName;
            const selectedModelGroup =
                sharedParams.modelGroup.getObjectByName(selectedGroupName);

            if (selectedModelGroup) {
                // Check for collision before moving right
                const canMoveRight = await checkForCollision(
                    selectedModelGroup,
                    params.moveLeftRight
                );

                if (canMoveRight) {
                    selectedModelGroup.position.x += params.moveLeftRight; // Move selected model group right
                    if (!selectedModelGroup.spacing) {
                        selectedModelGroup.spacing = 0;
                    }
                    selectedModelGroup.spacing += params.moveLeftRight;
                    await drawMeasurementBoxesWithLabels();
                } else {
                    console.log(
                        "Collision detected! Cannot move further right."
                    );
                }
            } else {
                console.log(`Group ${selectedGroupName} not found.`);
            }
        });

        document.addEventListener(
            "mousemove",
            (event) => this.onMouseMove(event),
            false
        );
        window.addEventListener("resize", (event) => this.onWindowResize());
        document.removeEventListener("click", this.handleClickWrapper);
        document.addEventListener(
            "click",
            (this.handleClickWrapper = (event) => this.handleClick(event))
        );
    }

    async handleClick(event) {
        if (!event.target.closest(".custom-dropdown")) {
            document
                .querySelectorAll(".custom-dropdown .dropdown-content")
                .forEach(function (content) {
                    content.style.display = "none";
                });
        }
        this.onMouseClick();
    }

    async onMouseMove(event) {
        // Calculate mouse position in normalized device coordinates (-1 to +1 for both axes)
        if (event !== undefined && sharedParams.mouse !== undefined && sharedParams.camera !== undefined) {
            sharedParams.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            sharedParams.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            // Update the raycaster with the camera and mouse position
            sharedParams.raycaster.setFromCamera(sharedParams.mouse, sharedParams.camera);
            const visibleObjects = [];

            // Traverse the main model and find visible objects
            sharedParams.modelGroup.traverse((child) => {
                if (hangerNames.includes(child.name) && child.visible) {
                    visibleObjects.push(child);
                }
                if (rackNames.includes(child.name) && child.visible) {
                    visibleObjects.push(child);
                }
                // Check for allModelNames and allOtherModelNames as well
                // if (allModelNames.includes(child.name) && child.visible) {
                //   visibleObjects.push(child);
                // }
                // if (allOtherModelNames.includes(child.name) && child.visible) {
                //     visibleObjects.push(child);
                // }
            });

            // Now check if parents are visible (using async outside of traverse)
            const finalVisibleObjects = [];
            for (const child of visibleObjects) {
                if (await this.isVisibleParents(child.parent)) {
                    finalVisibleObjects.push(child);
                }
            }

            // Find intersections with the main_model
            this.hangerIntersects = sharedParams.raycaster.intersectObjects(
                finalVisibleObjects,
                true
            );
            // console.log("finalVisibleObjects", finalVisibleObjects);
            // console.log("hangerIntersects", this.hangerIntersects);
            // console.log("sharedParams.raycaster", sharedParams.raycaster);
        }
    }

    // Handle mouse click for selection
    async onMouseClick() {
        // console.log("hangerIntersects", this.hangerIntersects);
        // let defaultModel = sharedParams.modelGroup.getObjectByName(params.selectedGroupName);
        if (
            this.hangerIntersects &&
            this.hangerIntersects.length > 0 &&
            sharedParams.transformControls
        ) {
            this.hideRemoveIcons();
            const intersectNode = this.hangerIntersects[0].object;
            if (intersectNode) {
                // console.log('intersectNode', intersectNode)
                sharedParams.selectedNode = intersectNode.parent;
                let iconName = sharedParams.selectedNode.name;

                let tempNode, defaultModel;
                for (let val of allModelNames) {
                    tempNode = await findParentNodeByName(sharedParams.selectedNode, val, true);
                    if (tempNode) {
                        defaultModel = tempNode;
                        break;
                    }
                }

                if (iconName.startsWith("removeHanger-")) {
                    if (sharedParams.modelGroup) {
                        let nodeName = iconName.replace("removeHanger-", "");
                        let hangerToRemove = await findParentNodeByName(
                            sharedParams.selectedNode,
                            nodeName
                        );
                        let hangerArrayKey = hangerToRemove.hangerArrayKey || null;
                        if (hangerToRemove) {
                            let frame = defaultModel.getObjectByName("Frame");
                            sharedParams.transformControls.detach();
                            frame.remove(hangerToRemove);
                        }
                        if (hangerArrayKey) {
                            params.hangerCount[hangerArrayKey] -= 1;
                        }
                        await showHideNodes();
                    }
                } else if (iconName.startsWith("removeRack-")) {
                    let nodeName = iconName.replace("removeRack-", "");
                    let hangerToRemove = await findParentNodeByName(
                        sharedParams.selectedNode,
                        nodeName
                    );
                    if (hangerToRemove) {
                        let frame = defaultModel.getObjectByName("Frame");
                        sharedParams.transformControls.detach();
                        frame.remove(hangerToRemove);
                    }
                } else if (
                    hangerPartNames.includes(sharedParams.selectedNode.name) ||
                    hangerNames.includes(sharedParams.selectedNode.name)
                ) {
                    let tempNode, selectedHangerNode;

                    for (let val of hangerNames) {
                        tempNode = await findParentNodeByName(sharedParams.selectedNode, val, true);
                        if (tempNode) {
                            selectedHangerNode = tempNode;
                            break;
                        }
                    }
                    if (selectedHangerNode) {
                        sharedParams.selectedNode = selectedHangerNode;
                        let removeHanger = sharedParams.selectedNode.getObjectByName(
                            "removeHanger-" + sharedParams.selectedNode.name
                        );
                        if (removeHanger) {
                            removeHanger.visible = true;
                        }
                        // console.log('selectedNode', sharedParams.selectedNode)

                        // Attach transform controls to the selected node
                        // console.log(sharedParams.transformControls);
                        sharedParams.transformControls.attach(sharedParams.selectedNode);
                        sharedParams.transformControls.setMode("translate"); // Set the mode to 'translate' for moving

                        // Configure to show only X-axis control and allow movement only on X-axis
                        sharedParams.transformControls.showX = true; // Show only X-axis arrow
                        sharedParams.transformControls.showY = false; // Hide Y-axis arrow
                        sharedParams.transformControls.showZ = false; // Hide Z-axis arrow

                        // Add event listener to enforce boundary check during movement
                        sharedParams.transformControls.addEventListener("objectChange", this.enforceHangerBounds);

                    }
                } else if (
                    rackPartNames.includes(sharedParams.selectedNode.name) ||
                    rackNames.includes(sharedParams.selectedNode.name)
                ) {
                    let tempNode, selectedRackNode;

                    for (let val of rackNames) {
                        tempNode = await findParentNodeByName(sharedParams.selectedNode, val, true);
                        if (tempNode) {
                            selectedRackNode = tempNode;
                            break;
                        }
                    }
                    if (
                        !selectedRackNode &&
                        rackNames.includes(sharedParams.selectedNode.name) &&
                        (await this.isVisibleParents(sharedParams.selectedNode))
                    ) {
                        selectedRackNode = sharedParams.selectedNode;
                    }
                    if (selectedRackNode) {
                        sharedParams.selectedNode = selectedRackNode;
                        let removeRack = sharedParams.selectedNode.getObjectByName(
                            "removeRack-" + sharedParams.selectedNode.name
                        );
                        if (removeRack) {
                            removeRack.visible = true;
                        }
                        // Attach transform controls to the selected node
                        sharedParams.transformControls.attach(sharedParams.selectedNode);
                        sharedParams.transformControls.setMode("translate"); // Set the mode to 'translate' for moving
                        sharedParams.transformControls.translationSnap = 3.139;

                        // Configure to show only X-axis control and allow movement only on X-axis
                        sharedParams.transformControls.showX = false; // Show only X-axis arrow
                        sharedParams.transformControls.showY = true; // Hide Y-axis arrow
                        sharedParams.transformControls.showZ = false; // Hide Z-axis arrow

                        // Add event listener to enforce boundary check during movement
                        sharedParams.transformControls.addEventListener("objectChange", this.enforceRackBounds);
                    }
                } else {
                    this.hideRemoveIcons();
                }
            } else {
                this.hideRemoveIcons();
            }
        } else {
            this.hideRemoveIcons();
        }
    }

    async onWindowResize() {
        if (!sharedParams.camera || !sharedParams.renderer) {
            return;
        } else {
            sharedParams.camera.aspect = window.innerWidth / window.innerHeight;
            sharedParams.camera.updateProjectionMatrix();
            sharedParams.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }

    async closeCropper() {
        const cropperContainer = document.getElementById("cropper-container");

        cropperContainer.style.display = "none";
        document.body.classList.remove("modal-open");
        if (sharedParams.cropper) {
            sharedParams.cropper.destroy();
            sharedParams.cropper = null;
        }

        const topFrameFileUploads = document.querySelectorAll(
            ".topFrameFileUpload"
        );

        // Loop through each element and set its value to blank
        topFrameFileUploads.forEach((element) => {
            element.value = ""; // Set the value to an empty string
        });

        const mainFrameFileUploads = document.querySelectorAll(
            ".mainFrameFileUpload"
        );

        // Loop through each element and set its value to blank
        mainFrameFileUploads.forEach((element) => {
            element.value = ""; // Set the value to an empty string
        });
    }

    async hideRemoveIcons() {
        if (sharedParams.modelGroup && sharedParams.selectedNode) {
            sharedParams.modelGroup.traverse((child) => {
                if (child.name && child.name.includes("remove")) {
                    child.visible = false; // Hide remove icon
                }
            });
            sharedParams.transformControls.detach();
            sharedParams.selectedNode = null;

            sharedParams.transformControls.removeEventListener("objectChange", this.enforceHangerBounds);
            sharedParams.transformControls.removeEventListener("objectChange", this.enforceRackBounds);
            // Check if clicked on allModelNames or allOtherModelNames
        }
    }

    // Function to enforce boundaries on X-axis
    async enforceHangerBounds() {
        if (sharedParams.selectedNode) {
            let tempNode, defaultModel;

            for (let val of allModelNames) {
                tempNode = await findParentNodeByName(sharedParams.selectedNode, val, true);
                if (tempNode) {
                    defaultModel = tempNode;
                    break;
                }
            }

            // let defaultModelName = params.selectedGroupName !== 'default' ? params.selectedGroupName : params.defaultModel;
            // let defaultModel = main_model.getObjectByName(selectedHangerNode);
            if (defaultModel) {
                // console.log("defaultModel", defaultModel);
                defaultModel.traverse((child) => {
                    if (child.isMesh && child.geometry) {
                        child.geometry.computeBoundingBox();
                    }
                });

                let frame = defaultModel.getObjectByName("Top_Ex");

                const worldPosition = new THREE.Vector3();
                frame.getWorldPosition(worldPosition);

                const frameBox = new THREE.Box3().setFromObject(frame);
                const framecenter = frameBox.getCenter(new THREE.Vector3());
                // console.log("defaultModel", defaultModel);
                // console.log("frame", frame);
                // console.log('frameBox', frameBox)
                // console.log("frameBox.min", frameBox.min);
                // console.log("frameBox.max", frameBox.max);
                // console.log("framecenter", framecenter);
                // console.log("World Position:", worldPosition);

                let minX = frameBox.min.x + frame.position.x - worldPosition.x;
                let maxX = frameBox.max.x + frame.position.x - worldPosition.x;
                let selectedChildNode = sharedParams.selectedNode.getObjectByName("Hanger_Stand");

                // const selectedChildWorldPosition = new THREE.Vector3();
                // selectedChildNode.getWorldPosition(selectedChildWorldPosition);

                const nodeBoundingBox = new THREE.Box3().setFromObject(
                    selectedChildNode
                );
                const nodeWidth = nodeBoundingBox.max.x - nodeBoundingBox.min.x;

                // const margin = 20;
                // const adjustedMinX = frameBox.min.x + selectedChildNode.position.x + (nodeWidth / 2) + params.frameTopExMargin;
                // const adjustedMaxX = frameBox.max.x - selectedChildNode.position.x - (nodeWidth / 2) - params.frameTopExMargin;

                const adjustedMinX = minX + nodeWidth / 2 + params.frameTopExMargin;
                const adjustedMaxX = maxX - nodeWidth / 2 - params.frameTopExMargin;

                const position = sharedParams.selectedNode.position;
                // console.log("selectedChildNode", selectedChildNode);
                // console.log("nodeWidth", nodeWidth);
                // console.log("nodeBoundingBox", nodeBoundingBox);
                // console.log("adjustedMinX", adjustedMinX);
                // console.log("adjustedMaxX", adjustedMaxX);

                // If the node is trying to move past the minX or maxX boundary, set its position to the boundary
                if (position.x < adjustedMinX) {
                    position.x = adjustedMinX;
                } else if (position.x > adjustedMaxX) {
                    position.x = adjustedMaxX;
                } else {
                    // If within bounds, ensure position is properly centered
                    position.x = THREE.MathUtils.clamp(
                        position.x,
                        adjustedMinX,
                        adjustedMaxX
                    );
                }
                // console.log("Final position.x", position.x);
            }
        }
    }

    // Function to enforce boundaries on X-axis
    async enforceRackBounds() {
        // console.log("enforceRackBounds", sharedParams.selectedNode);
        if (sharedParams.selectedNode) {
            let tempNode, defaultModel;
            for (let val of allModelNames) {
                tempNode = await findParentNodeByName(sharedParams.selectedNode, val, true);
                if (tempNode) {
                    defaultModel = tempNode;
                    break;
                }
            }
            // let defaultModel = main_model.getObjectByName(params.selectedGroupName);
            // let defaultModel = main_model.getObjectByName(params.defaultModel);
            let baseFrame = defaultModel.getObjectByName("Base_Solid");
            let leftSlottedFrame = defaultModel.getObjectByName("Left_Ex_Slotted");
            const baseFrameBox = new THREE.Box3().setFromObject(baseFrame);
            const leftSlottedFrameBox = new THREE.Box3().setFromObject(leftSlottedFrame);
            // const boundingBox = params.calculateBoundingBox[params.defaultModel]['Frame'];

            const min = leftSlottedFrameBox.min.clone();
            const max = leftSlottedFrameBox.max.clone();
            const leftSlottedFrameHeight = max.y - min.y;
            const baseFrameHeight = baseFrameBox.max.y - baseFrameBox.min.y;

            let minY = min.y;
            let maxY = max.y + leftSlottedFrame.position.y;
            const nodeBoundingBox = new THREE.Box3().setFromObject(sharedParams.selectedNode);
            const nodeHeight = nodeBoundingBox.max.y - nodeBoundingBox.min.y;

            const margin = 10;

            const adjustedMinY = minY - nodeHeight / 2 - baseFrameHeight - 50;
            const adjustedMaxY = maxY - nodeHeight / 2 + baseFrameHeight + 25;

            const position = sharedParams.selectedNode.position;

            // If the node is trying to move past the minY or maxY boundary, set its position to the boundary
            if (position.y < adjustedMinY) {
                position.y = adjustedMinY;
            } else if (position.y > adjustedMaxY) {
                position.y = adjustedMaxY;
            }

            // console.log('adjustedMinY', adjustedMinY)
            // console.log('nodeHeight', nodeHeight)
            // console.log('leftSlottedFrameHeight', leftSlottedFrameHeight)
            // console.log('baseFrameHeight', baseFrameHeight)
            // console.log('baseFrameBox', baseFrameBox)
            // console.log('nodeBoundingBox', nodeBoundingBox)
        }
    }

    async isVisibleParents(node) {
        // Base case: If the node is null, return true (end of the hierarchy)
        if (!node) {
            return true;
        }

        // Check if the current node is visible
        if (!node.visible) {
            return false;
        }

        // Recursively check the parent node
        return await this.isVisibleParents(node.parent);
    }
}
