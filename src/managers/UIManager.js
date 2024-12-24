import {
  params,
  setting,
  rackNames,
  hangerNames,
  allGroupNames,
  rackPartNames,
  allModelNames,
  hangerPartNames,
} from "../../config.js";

import {
  getHex,
  addRacks,
  showHideNodes,
  centerMainModel,
  addAnotherModels,
  findParentNodeByName,
} from "../../utils6.js";
import {
    saveModelData,
} from "./DBManager.js"

import { exportModelForAr } from "./ExportModelManager.js";

import {
  setTopFrameCropedImage,
  setMainFrameCropedImage,
} from "./frameImagesManager.js";

import { Scene } from "../core/Scene.js";
import {
    getCurrentModelSize,
    drawMeasurementBoxesWithLabels,
} from "./MeasurementManager.js";
import { addHangers } from "./HangerManager.js";
import { creatingPDF, checkAndPreparePDF } from "./PdfManager.js";
import { FileManager } from "./FileManager.js";
import { getModelMeasurement, getComponentSize } from "./MeasurementManager.js";

const sceneUI = new Scene();
export class UIManager {
  constructor(modelManager, sceneManager) {
    this.modelManager = modelManager;
    this.sceneManager = sceneManager;
    this.hangerIntersects = [];
    this.initializeUIElements();
    this.setupEventListeners();
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
      headerRodColorDropdown: document.querySelector(".headerRodColorDropdown"),
      topFrameFileUpload: document.querySelector(".topFrameFileUpload"),
      headerFrameColorInput: document.querySelector(".headerFrameColorInput"),
      headerFrameColorDropdown: document.querySelector(
        ".headerFrameColorDropdown"
      ),
      slottedSidesToggle: document.querySelector(".slottedSidesToggle"),
      mainFrameFileUpload: document.querySelector(".mainFrameFileUpload"),
      mainFrameColorInput: document.querySelector(".mainFrameColorInput"),
      baseSelectorDropdown: document.querySelector(".baseSelectorDropdown"),
      hangerClothesToggle: document.querySelector(".hangerClothesToggle"),
      hangerGolfClubsToggle: document.querySelector(".hangerGolfClubsToggle"),
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
      CreatingPdfFile: document.getElementById("CreatingPdfFile"),
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
    };

    this.loadingElements = {
      loaderElement: document.getElementById("loader"),
      progressBarFill: document.getElementById("progress-bar-fill"),
      progressText: document.getElementById("progress-text"),
    };
  }

  async saveCropImage(cropper) {
    const base64Image = cropper.getCroppedCanvas().toDataURL("image/png");
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
            formSubmition2: document.getElementById("formSubmition2"),
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
            loginButton: document.getElementById("loginButton"),
            registerButton: document.getElementById("registerButton"),
        };

        this.loadingElements = {
            loaderElement: document.getElementById("loader"),
            progressBarFill: document.getElementById("progress-bar-fill"),
            progressText: document.getElementById("progress-text"),
        };
    }

    async saveCropImage() {
        if (sharedParams.cropper) {
            const base64Image = sharedParams.cropper
                .getCroppedCanvas()
                .toDataURL("image/png");
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

    async setupEventListeners(lights, lightHelpers) {
        // Event listeners for controls
        if (this.elements.frameSize) {
            this.elements.frameSize.value = params.defaultModel;

            // frameSize.addEventListener("change", async function (event) {
            document.addEventListener("change", async function (event) {
                if (event.target.classList.contains("frameSize")) {
                    setting[params.selectedGroupName].defaultModel =
                        event.target.value;
                    // console.log(setting[params.selectedGroupName].defaultModel);
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
                    // console.log(
                    //     "params.selectedGroupName",
                    //     params.selectedGroupName
                    // );
                    setting[params.selectedGroupName].topOption =
                        event.target.value;
                    setting[params.selectedGroupName].headerRodToggle = false;
                    if (
                        setting[params.selectedGroupName].topOption == "Header_Wooden_Shelf"
                    ) {
                        setting[params.selectedGroupName].headerRodToggle = true;
                    }
                    // console.log(setting[params.selectedGroupName].topOption);

                    const headerRodToggle =
                        document.querySelector(".headerRodToggle");
                    headerRodToggle.checked =
                        setting[params.selectedGroupName].headerRodToggle;

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
                    setting[params.selectedGroupName].previousRodToggle =
                        event.target.checked;

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
                    // console.log(
                    //     setting[params.selectedGroupName].slottedSidesToggle
                    // );

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
                            const cropperImage = document.getElementById("cropper-image");
                            const cropperContainer = document.getElementById("cropper-container");
                            cropperImage.src = e.target.result;
                            cropperContainer.style.display = "block";

                            if (sharedParams.cropper) {
                                sharedParams.cropper.destroy();
                            }

                            let currentGroup = sharedParams.modelGroup.getObjectByName(params.selectedGroupName);
                            let defaultModelName = setting[params.selectedGroupName].defaultModel;

                            let currentModel = currentGroup.getObjectByName(defaultModelName);
                            let defaultHeaderSize = setting[params.selectedGroupName].defaultHeaderSize;
                            let currentHeader = currentModel.getObjectByName(defaultHeaderSize);
                            const size = await getCurrentModelSize(currentHeader,"Header_Graphic1-Mat");
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
                    this.showLoadingModal("Please wait...");
                    if (sharedParams.cropper) {
                        let selectedGroupName = params.selectedGroupName;
                        let defaultModel = setting[selectedGroupName].defaultModel;
                        let defaultHeaderSize = setting[selectedGroupName].defaultHeaderSize;
                        if (params.fileUploadFlag == "MainFrame") {
                            sharedParams.mainFrameCropedImage = sharedParams.mainFrameCropedImage || {};
                            sharedParams.mainFrameCropedImage[selectedGroupName] = sharedParams.mainFrameCropedImage[selectedGroupName] || {};
                            let mainFrameSaveImageURl = await this.saveCropImage();
                            sharedParams.mainFrameCropedImage[selectedGroupName][defaultModel] = mainFrameSaveImageURl.imageUrl;
                            await setMainFrameCropedImage(sharedParams.mainFrameCropedImage);
                        } else if (params.fileUploadFlag == "TopFrame") {
                            sharedParams.topFrameCropedImage = sharedParams.topFrameCropedImage || {};
                            sharedParams.topFrameCropedImage[selectedGroupName] = sharedParams.topFrameCropedImage[selectedGroupName] || {};
                            sharedParams.topFrameCropedImage[selectedGroupName][defaultModel] = sharedParams.topFrameCropedImage[selectedGroupName][defaultModel] || {};
                            let topFrameSaveImageURl = await this.saveCropImage();
                            sharedParams.topFrameCropedImage[selectedGroupName][defaultModel][defaultHeaderSize] = topFrameSaveImageURl.imageUrl;
                            await setTopFrameCropedImage(sharedParams.topFrameCropedImage);
                        }
                    }
                    this.hideLoadingModal();
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

                    await showHideNodes();
                }
            });
        }

        if (this.elements.addHanger) {
            document.addEventListener("click", async function (event) {
                if (event.target.closest(".addHanger")) {
                    const hangerType = event.target.getAttribute("data-hanger");

                    await addHangers(hangerType);
                }
            });
        }

        if (this.elements.addRack) {
            document.addEventListener("click", async function (event) {
                if (event.target.closest(".addRack")) {
                    const rackType = event.target.getAttribute("data-rack");

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
                    const openedAccordionItem =
                        event.target.closest(".accordion-item");

                    // Find the data-model attribute of the currently open accordion item
                    const modelName =
                        openedAccordionItem.getAttribute("data-model");
                    if (modelName) {
                        const previousModel =
                            sharedParams.modelGroup.getObjectByName(modelName);
                        // console.log(params.selectedGroupName);

                        for (const hideCone of previousModel.activeModel
                            .children) {
                            if (hideCone.name == "Cone") {
                                hideCone.visible = false;
                            }
                        }
                        params.selectedGroupName = modelName;
                        let main_model =
                            sharedParams.modelGroup.getObjectByName(
                                params.selectedGroupName
                            );
                        sharedParams.selectedGroup = main_model;

                        await showHideNodes();
                    }
                }
            );
        }

        if (this.elements.createQrButton) {
            this.elements.createQrButton.addEventListener("click", async () => {
                this.showLoadingModal(
                    "Please wait... we are creating your QR Code"
                );
                const unixTimestamp = Math.floor(Date.now() / 1000);
                const modelName = `main_group_${unixTimestamp}`;
                const exportedModelFileUrl = `/export_models/${modelName}`;
                const isQr = true;
                const closeBtn = document.getElementById("closeBtn");
                const showQRHere = document.getElementById("showQRHere");
                closeBtn.addEventListener("click", async function () {
                    showQRHere.style.display = "none";
                });
                await exportModelForAr(
                    sharedParams.modelGroup,
                    modelName,
                    isQr
                );
                const data = {};
                data["action"] = "create_qr_code";
                data["url"] = exportedModelFileUrl;

                const qr_data = JSON.stringify(data);
                fetch("api.php", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: qr_data,
                })
                    .then((response) => response.json())
                    .then((data) => {
                        if (data.success) {
                            console.log("Qr Code generate successfully!");
                            document.getElementById("qrImage").src = data.url;
                            this.hideLoadingModal();
                            showQRHere.style.display = "flex";
                        } else {
                            console.error(
                                "Error saving model data:",
                                data.error
                            );
                            this.hideLoadingModal();
                        }
                    });
            });
        }

        if (this.elements.showInAR) {
            this.elements.showInAR.addEventListener("click", async () => {
                this.showLoadingModal(
                    "Please wait... we are creating your AR model file"
                );
                await this.generateArModel();
            });
        }

        if (this.elements.savePdfButton) {
            this.elements.savePdfButton.addEventListener(
                "click",
                async (event) => {
                    if (
                        !localStorage.getItem("user_id") &&
                        !localStorage.getItem("username")
                    ) {
                        document.querySelector(".loginFormDiv").style.display =
                            "flex";
                        return;
                    } else {
                        try {
                            await checkAndPreparePDF();
                        } catch (error) {
                            console.error("Error creating PDF:", error);
                            document.getElementById("loadingModal").style.display = "none";
                        }
                    }
                }
            );
        }

        if (this.elements.saveModelDataButton) {
            this.elements.saveModelDataButton.addEventListener(
                "click",
                async function () {
                    if (
                        !localStorage.getItem("user_id") &&
                        !localStorage.getItem("username")
                    ) {
                        document.querySelector(".loginFormDiv").style.display =
                            "flex";
                        return;
                    } else {
                        const modelId =
                            sharedParams.previousData &&
                            sharedParams.previousData.id
                                ? sharedParams.previousData.id
                                : 0;

                        await traverseAsync(
                            sharedParams.modelGroup,
                            async (child) => {
                                if (
                                    hangerNames.includes(child.name) &&
                                    child.hangerArrayKey &&
                                    child.hangerCount
                                ) {
                                    params.hangerAdded =
                                        params.hangerAdded || {};
                                    params.hangerAdded[child.hangerArrayKey] =
                                        params.hangerAdded[
                                            child.hangerArrayKey
                                        ] || {};
                                    params.hangerAdded[child.hangerArrayKey][
                                        child.hangerCount
                                    ] = child.position;
                                }
                                if (
                                    rackNames.includes(child.name) &&
                                    child.rackArrayKey &&
                                    child.rackCount
                                ) {
                                    // console.log(
                                    //     "params.rackAdded",
                                    //     params.rackAdded
                                    // );
                                    // console.log("child", child);
                                    // console.log("child.name", child.name);

                                    params.rackAdded = params.rackAdded || {};
                                    params.rackAdded[child.rackArrayKey] =
                                        params.rackAdded[child.rackArrayKey] ||
                                        {};
                                    params.rackAdded[child.rackArrayKey][
                                        child.rackCount
                                    ] = child.position;
                                }
                            }
                        );

                        const dataToSave = {
                            params: params || null,
                            setting: setting || null,
                            group_names: allGroupNames || null,
                            top_frame_croped_image:
                                sharedParams.topFrameCropedImage || null,
                            main_frame_croped_image:
                                sharedParams.mainFrameCropedImage || null,
                        };

                        let projectName =
                            (sharedParams.previousData &&
                                sharedParams.previousData.name) ||
                            null;
                        let dataSave;
                        if (modelId > 0) {
                            dataSave = true;
                        }
                        if (!projectName) {
                            // Prompt the user to enter a value
                            projectName = prompt(
                                "Please enter a project name:"
                            );
                            if (projectName !== null) {
                                dataSave = true;
                            }
                        }

                        // console.log('params.hangerAdded', params.hangerAdded);

                        if (dataSave) {
                            await saveModelData(
                                projectName,
                                dataToSave,
                                modelId
                            );
                        }
                    }
                }
            );
        }

        if (this.elements.closeButtonAR) {
            this.elements.closeButtonAR.addEventListener("click", () => {
                let arviewer = document.getElementById("ArView");
                arviewer.style.display = "none";
            });
        }

        if (this.elements.formSubmition) {
            this.elements.formSubmition.addEventListener("click", async () => {
                if (
                    !localStorage.getItem("user_id") &&
                    !localStorage.getItem("username")
                ) {
                    document.querySelector(".loginFormDiv").style.display =
                        "flex";
                    return;
                } else {
                    formModel.style.display = "flex";
                    const formBase = document.getElementById("formBase");
                    formBase.style.display = "unset";
                }
            });
        }
        // if (this.elements.formSubmition2) {
        //     this.elements.formSubmition2.addEventListener("click", async () => {
        //         const fomdata = new FormData()
        //         fomdata.append('action', "createMainBoard")
        //         try {
        //             const response = await fetch("api.php", {
        //                 method: "POST",
        //                 body: fomdata,
        //             });
        //             const data = await response.json();
        //             if(data.status === "success") {
        //                 this.hideLoadingModal();
        //                 return data; // Ensure the resolved data is returned
        //             }
        //         } catch (error) {
        //             console.error("Error while submitting form: ", error);
        //             this.hideLoadingModal();
        //             throw error; // Re-throw the error to handle it at the calling point
        //         }
        //     });
        // }

        if (this.elements.formCloseBtn) {
            this.elements.formCloseBtn.addEventListener("click", async () => {
                formModel.style.display = "none";
                const form = document.getElementById("FormSubmitionForMonday");
                if (form) {
                    form.classList.remove("was-validated");
                }
                this.hideLoadingModal();
            });
        }

        if (this.elements.submitForm) {
            this.elements.submitForm.addEventListener("click", async () => {
                this.showLoadingModal("Please wait... the form is submitting");
                const form = document.getElementById("FormSubmitionForMonday");
                let hasError = false;
                const specialCharRegex = /[^a-zA-Z0-9\s]/;
                // Form fields to validate
                const fieldsToValidate = [
                    {
                        field: document.getElementById("name"),
                        errorMessage:
                            "Name cannot contain special characters like - ' \" ? / > <.",
                    },
                    {
                        field: document.getElementById("companyName"),
                        errorMessage:
                            "Company name cannot contain special characters like - ' \" ? / > <.",
                    },
                ];
                // Validate each field
                fieldsToValidate.forEach(({ field, errorMessage }) => {
                    const invalidFeedback = field.nextElementSibling; // Assuming the invalid-feedback is the next sibling after input
                    const valueText = invalidFeedback.textContent;

                    if (specialCharRegex.test(field.value)) {
                        field.classList.add("is-invalid"); // Add is-invalid class
                        invalidFeedback.textContent = errorMessage; // Set the custom error message
                        invalidFeedback.style.display = "block"; // Make sure the error message is visible
                        hasError = true; // Set the error flag
                    } else if (field.value === "") {
                        invalidFeedback.style.display = "block"; // Hide the error message
                    } else {
                        field.classList.remove("is-invalid"); // Remove is-invalid class if valid
                        invalidFeedback.textContent = valueText; // Clear any error message
                        invalidFeedback.style.display = "none"; // Hide the error message
                    }
                });

                if (form) {
                    if (!form.checkValidity()) {
                        form.classList.add("was-validated");
                    } else if (hasError) {
                        return;
                    } else {
                        const formBase = document.getElementById("formBase");
                        formBase.style.display = "none";
                        // Prevent the default form submission
                        event.preventDefault();
                        // Show the modal
                        const modal =
                            document.getElementById("confirmationModal");
                        modal.style.display = "flex"; // Or use a library method to show

                        document.getElementById(
                            "confirModelCloseButtton"
                        ).onclick = () => {
                            modal.style.display = "none";
                            formModel.style.display = "none";
                            // this.hideLoadingModal();
                        };

                        // Handle modal buttons
                        document.getElementById("yesButton").onclick =
                            async () => {
                                this.showLoadingModal("Please wait... the form is submitting");
                                modal.style.display = "none"; // Hide modal
                                formModel.style.display = "none";
                                try {
                                    await creatingPDF();
                                    await delay(500);
                                    await this.generateArModel();
                                    await this.formSubmitionForMonday();
                                } catch (e) {
                                    console.log(
                                        "error while submitting Data, ",
                                        e
                                    );
                                }
                            };

                        document.getElementById("noButton").onclick =
                            async () => {
                                this.showLoadingModal("Please wait... the form is submitting");
                                modal.style.display = "none"; // Hide modal
                                formModel.style.display = "none";
                                await this.formSubmitionForMonday();
                                this.hideLoadingModal();
                            };
                    }
                }
            });
        }

        if (this.elements.registerForm) {
            this.elements.registerForm.addEventListener("click", async () => {
                document.querySelector(".loginFormDiv").style.display = "none";
                document.querySelector(".registerFormDiv").style.display =
                    "flex";
            });
        }
        if (this.elements.LoginForm) {
            this.elements.LoginForm.addEventListener("click", async () => {
                document.querySelector(".registerFormDiv").style.display =
                    "none";
                document.querySelector(".loginFormDiv").style.display = "flex";
            });
        }

        if (this.elements.loginRegisterClose) {
            this.elements.loginRegisterClose.addEventListener(
                "click",
                async () => {
                    document.getElementById("loginEmail").value = null;
                    document.getElementById("loginPassword").value = null;
                    document.getElementById("loginEmailError").innerHTML = null;
                    document.getElementById("loginPasswordError").innerHTML =
                        null;
                    document.getElementById("responseErr").style.display =
                        "none";
                    document.getElementById("registerUsername").value = null;
                    document.getElementById("registerEmail").value = null;
                    document.getElementById("registerPassword").value = null;
                    document.getElementById("registerUsernameError").innerHTML =
                        null;
                    document.getElementById("registerEmailError").innerHTML =
                        null;
                    document.getElementById("registerPasswordError").innerHTML =
                        null;
                    document.querySelector(".loginFormDiv").style.display =
                        "none";
                    document.querySelector(".registerFormDiv").style.display =
                        "none";
                }
            );
        }

        if (this.elements.headerFrameColorInput) {
            this.elements.headerFrameColorInput.value = getHex(
                params.topFrameBackgroundColor
            );

            document.addEventListener("input", async function (event) {
                if (event.target.classList.contains("headerFrameColorInput")) {
                    setting[params.selectedGroupName].topFrameBackgroundColor =
                        event.target.value;

                    await setTopFrameCropedImage(
                        sharedParams.topFrameCropedImage,
                        params,
                        setting
                    );
                }
            });
        }

        if (this.elements.mainFrameColorInput) {
            this.elements.mainFrameColorInput.value = getHex(
                params.mainFrameBackgroundColor
            );
            document.addEventListener("input", async function (event) {
                if (event.target.classList.contains("mainFrameColorInput")) {
                    setting[params.selectedGroupName].mainFrameBackgroundColor =
                        event.target.value;
                    await setMainFrameCropedImage(
                        sharedParams.mainFrameCropedImage
                    );
                }
            });
        }

        // Move Left
        this.elements.moveLeftModel.addEventListener("click", async () => {
            const mainModelIndex = allGroupNames.indexOf(
                params.selectedGroupName
            );
            let beforeMainModel
            if (mainModelIndex !== -1) {
                beforeMainModel = mainModelIndex ? allGroupNames[mainModelIndex - 1] : null;
            }
            let beforeCurrentModel = setting[beforeMainModel];

            const selectedGroupName = params.selectedGroupName;
            const selectedModelGroup = sharedParams.modelGroup.getObjectByName(selectedGroupName);
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
                    if(beforeCurrentModel && beforeCurrentModel.spacing !== 0){
                        beforeCurrentModel.spacing += params.moveLeftRight;
                    }
                    setting[params.selectedGroupName].spacing = selectedModelGroup.spacing;
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
            const mainModelIndex = allGroupNames.indexOf(params.selectedGroupName);
            let aftereMainModel
            if (mainModelIndex !== -1) {
                aftereMainModel = mainModelIndex ? allGroupNames[mainModelIndex + 1] : null;
            }
            let afterCurrentModel = setting[aftereMainModel];
            const selectedGroupName = params.selectedGroupName;
            const selectedModelGroup = sharedParams.modelGroup.getObjectByName(selectedGroupName);

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
                    if(afterCurrentModel && afterCurrentModel.spacing !== 0){
                        afterCurrentModel.spacing -= params.moveLeftRight;
                    }
                    setting[params.selectedGroupName].spacing = selectedModelGroup.spacing;
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

        this.elements.loginButton.addEventListener("click", () => {
            const email = document.getElementById("loginEmail").value.trim();
            const password = document
                .getElementById("loginPassword")
                .value.trim();
            const emailError = document.getElementById("loginEmailError");
            const passwordError = document.getElementById("loginPasswordError");
            const responseError = document.getElementById("responseErr");

            // Reset error messages
            emailError.textContent = "";
            passwordError.textContent = "";
            responseError.style.display = "none";
            responseError.textContent = "";

            let hasError = false;

            // Email validation
            if (!email) {
                emailError.textContent = "Email is required.";
                hasError = true;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                emailError.textContent = "Enter a valid email address.";
                hasError = true;
            }

            // Password validation
            if (!password) {
                passwordError.textContent = "Password is required.";
                hasError = true;
            } else if (password.length < 6) {
                passwordError.textContent =
                    "Password must be at least 6 characters long.";
                hasError = true;
            }

            // Stop the function if there are validation errors
            if (hasError) return;

            // Prepare form data
            const form = document.getElementById("Login");
            const formData = new FormData(form);

            // Send an AJAX request
            fetch("api.php", {
                method: "POST",
                body: formData,
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(
                            `HTTP error! status: ${response.status}`
                        );
                    }
                    return response.json(); // Parse JSON response
                })
                .then((data) => {
                    if (data.success) {
                        // Handle successful login
                        this.createSession(
                            data.session.user_id,
                            data.session.username
                        );
                        document.querySelector(".loginFormDiv").style.display =
                            "none";
                        document.getElementById("myModelsDiv").style.display =
                            "block";
                        document.querySelector(".LogoutUser").style.display =
                            "block";
                    } else {
                        // Handle server-side validation errors
                        responseError.style.display = "block";
                        responseError.textContent =
                            data.message || "Login failed.";
                    }
                })
                .catch((error) => {
                    console.error("Request failed:", error);
                    responseError.style.display = "block";
                    responseError.textContent =
                        "An unexpected error occurred. Please try again later.";
                });
        });

        this.elements.registerButton.addEventListener("click", function () {
            const username = document
                .getElementById("registerUsername")
                .value.trim();
            const email = document.getElementById("registerEmail").value.trim();
            const password = document
                .getElementById("registerPassword")
                .value.trim();

            const usernameError = document.getElementById(
                "registerUsernameError"
            );
            const emailError = document.getElementById("registerEmailError");
            const passwordError = document.getElementById(
                "registerPasswordError"
            );

            // Reset error messages
            usernameError.textContent = "";
            emailError.textContent = "";
            passwordError.textContent = "";

            let hasError = false;

            // Username validation
            if (!username) {
                usernameError.textContent = "Username is required.";
                hasError = true;
            } else if (username.length < 3 || username.length > 15) {
                usernameError.textContent =
                    "Username must be between 3 and 15 characters.";
                hasError = true;
            }

            // Email validation
            if (!email) {
                emailError.textContent = "Email is required.";
                hasError = true;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                emailError.textContent = "Enter a valid email address.";
                hasError = true;
            }

            // Password validation
            if (!password) {
                passwordError.textContent = "Password is required.";
                hasError = true;
            } else if (password.length < 6) {
                passwordError.textContent =
                    "Password must be at least 6 characters.";
                hasError = true;
            }

            // Stop the function if there are validation errors
            if (hasError) return;

            // Prepare form data
            const form = document.getElementById("Register");
            const formData = new FormData(form);

            // Send an AJAX request
            fetch("api.php", {
                method: "POST",
                body: formData,
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(
                            `HTTP error! status: ${response.status}`
                        );
                    }
                    return response.json();
                })
                .then((data) => {
                    if (data.success) {
                        // Handle successful registration
                        alert(
                            "Registration successful. Redirecting to login..."
                        );
                        document.querySelector(
                            ".registerFormDiv"
                        ).style.display = "none";
                        document.querySelector(".loginFormDiv").style.display =
                            "flex";
                    } else {
                        // Handle server-side errors
                        if (data.message) {
                            alert(data.message);
                        } else {
                            alert("An error occurred. Please try again.");
                        }
                    }
                })
                .catch((error) => {
                    console.error("Request failed:", error);
                    alert(
                        "An unexpected error occurred. Please try again later."
                    );
                });
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
        // Initialize Bootstrap tooltips
        document.addEventListener("DOMContentLoaded", () => {
            var tooltipTriggerList = [].slice.call(
                document.querySelectorAll('[data-bs-toggle="tooltip"]')
            );
            var tooltipList = tooltipTriggerList.map(function (
                tooltipTriggerEl
            ) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });
        });
    }

    async handleClick(event) {
        if (!event.target.closest(".custom-dropdown")) {
            document
                .querySelectorAll(".custom-dropdown .dropdown-content")
                .forEach(function (content) {
                    content.style.display = "none";
                });
        }
        if (event.target.closest(".dropdown-button")) {
            const dropdown = event.target.closest(".custom-dropdown");
            const dropdownContent = dropdown.querySelector(".dropdown-content");

            // Toggle visibility of the clicked dropdown
            if (dropdownContent) {
                const isDropdownVisible =
                    dropdownContent.style.display === "block";
                dropdownContent
                    .querySelectorAll(".custom-dropdown .dropdown-content")
                    .forEach(function (content) {
                        content.style.display = "none"; // Close all dropdowns
                    });
                dropdownContent.style.display = isDropdownVisible
                    ? "none"
                    : "block"; // Toggle the clicked dropdown
            }
        }

        // Check if a dropdown item was clicked
        if (event.target.closest(".dropdown-item")) {
            const item = event.target.closest(".dropdown-item");
            const dropdownType = item
                .closest(".custom-dropdown")
                .getAttribute("data-type");
            const value = item.getAttribute("data-value");
            const accordion = item.closest(".accordion-item");
            const selectedModel = accordion.getAttribute("data-model");
            // console.log("selectedModel_pass", selectedModel);
            // Update material based on the dropdown type and value
            this.updateMaterial(value, dropdownType, selectedModel);

            // Hide the dropdown after selection
            const dropdown = item.closest(".custom-dropdown");
            const dropdownContent = dropdown.querySelector(".dropdown-content");
            if (dropdownContent) {
                dropdownContent.style.display = "none";
            }
        }
        this.onMouseClick();
    }

    async onMouseMove(event) {
        // Calculate mouse position in normalized device coordinates (-1 to +1 for both axes)
        if (
            event !== undefined &&
            sharedParams.mouse !== undefined &&
            sharedParams.camera !== undefined
        ) {
            sharedParams.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            sharedParams.mouse.y =
                -(event.clientY / window.innerHeight) * 2 + 1;

            // Update the raycaster with the camera and mouse position
            sharedParams.raycaster.setFromCamera(
                sharedParams.mouse,
                sharedParams.camera
            );
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
        let isLoaderActive = document.getElementById("loadingModal").style.display == "none" ? false : true;
        if (
            this.hangerIntersects &&
            this.hangerIntersects.length > 0 &&
            sharedParams.transformControls && !isLoaderActive
        ) {
            // console.log(this.hangerIntersects);

            this.hideRemoveIcons();
            const intersectNode = this.hangerIntersects[0].object;
            let camSide = sharedParams.camera.position.z > 0 ? "Front" : "Back";
            let hangerParent = findParentWithNamesInArr(
                intersectNode,
                hangerNames
            );
            let RackParent = findParentWithNamesInArr(intersectNode, rackNames);
            if (hangerParent && camSide == hangerParent.side) {
                sharedParams.transformControls.attach(hangerParent);
                sharedParams.transformControls.setMode("translate"); // Set the mode to 'translate' for moving

                // Configure to show only X-axis control and allow movement only on X-axis
                sharedParams.transformControls.showX = true; // Show only X-axis arrow
                sharedParams.transformControls.showY = false; // Hide Y-axis arrow
                sharedParams.transformControls.showZ = false; // Hide Z-axis arrow

                // Add event listener to enforce boundary check during movement
                sharedParams.transformControls.addEventListener(
                    "objectChange",
                    this.enforceHangerBounds
                );
            }
            if (RackParent && camSide == RackParent.side) {
                sharedParams.transformControls.attach(RackParent);
                sharedParams.transformControls.setMode("translate"); // Set the mode to 'translate' for moving
                sharedParams.transformControls.translationSnap = 3.139;
                // Configure to show only X-axis control and allow movement only on X-axis
                sharedParams.transformControls.showX = false; // Show only X-axis arrow
                sharedParams.transformControls.showY = true; // Hide Y-axis arrow
                sharedParams.transformControls.showZ = false; // Hide Z-axis arrow
                // Add event listener to enforce boundary check during movement
                sharedParams.transformControls.addEventListener(
                    "objectChange",
                    this.enforceRackBounds
                );
            }
            let activeParent = hangerParent ? hangerParent : RackParent;
            sharedParams.selectedNode = activeParent;
            if(activeParent.side == camSide){
                activeParent.removeIcon.visible = true;
            }

            if (intersectNode.parent.name.includes("removeHanger-")) {
                sharedParams.transformControls.detach(activeParent);
                activeParent.parent.remove(activeParent);
            } else if (intersectNode.parent.name.includes("removeRack-")) {
                sharedParams.transformControls.detach(activeParent);
                activeParent.parent.remove(activeParent);
            } else {
                // this.hideRemoveIcons();
            }
            // if (intersectNode) {
            //     // console.log('intersectNode', intersectNode)
            //     sharedParams.selectedNode = intersectNode.parent;
            //     let iconName = sharedParams.selectedNode.name;

            //     let tempNode, defaultModel;
            //     defaultModel = sharedParams.selectedGroup.activeModel;
            //     console.log("defaultModel", defaultModel);
            //     console.log("iconName", iconName);

            //     if (iconName.startsWith("removeHanger-")) {
            //         if (sharedParams.modelGroup) {
            //             let nodeName = iconName.replace("removeHanger-", "");
            //             let hangerToRemove = await findParentNodeByName(
            //                 sharedParams.selectedNode,
            //                 nodeName
            //             );
            //             let hangerArrayKey =
            //                 hangerToRemove.hangerArrayKey || null;
            //             if (hangerToRemove) {
            //                 let frame = defaultModel.getObjectByName("Frame");
            //                 sharedParams.transformControls.detach();
            //                 frame.remove(hangerToRemove);
            //             }
            //             if (hangerArrayKey) {
            //                 params.hangerCount[hangerArrayKey] -= 1;
            //             }
            //             await showHideNodes();
            //         }
            //     } else if (iconName.startsWith("removeRack-")) {
            //         let nodeName = iconName.replace("removeRack-", "");
            //         let hangerToRemove = await findParentNodeByName(
            //             sharedParams.selectedNode,
            //             nodeName
            //         );
            //         if (hangerToRemove) {
            //             let frame = defaultModel.getObjectByName("Frame");
            //             sharedParams.transformControls.detach();
            //             frame.remove(hangerToRemove);
            //         }
            //     } else if (
            //         hangerPartNames.includes(sharedParams.selectedNode.name) ||
            //         hangerNames.includes(sharedParams.selectedNode.name)
            //     ) {
            //         let tempNode, selectedHangerNode;

            //         for (let val of hangerNames) {
            //             tempNode = await findParentNodeByName(
            //                 sharedParams.selectedNode,
            //                 val,
            //                 true
            //             );
            //             if (tempNode) {
            //                 selectedHangerNode = tempNode;
            //                 break;
            //             }
            //         }
            //         if (selectedHangerNode) {
            //             sharedParams.selectedNode = selectedHangerNode;
            //             let removeHanger =
            //                 sharedParams.selectedNode.getObjectByName(
            //                     "removeHanger-" + sharedParams.selectedNode.name
            //                 );
            //             if (removeHanger) {
            //                 removeHanger.visible = true;
            //             }
            //             hangerParent.removeIcon.visible = true;
            //             // console.log('selectedNode', sharedParams.selectedNode)

            //             // Attach transform controls to the selected node
            //             // console.log(sharedParams.transformControls);
            //             sharedParams.transformControls.attach(
            //                 sharedParams.selectedNode
            //             );
            //             sharedParams.transformControls.setMode("translate"); // Set the mode to 'translate' for moving

            //             // Configure to show only X-axis control and allow movement only on X-axis
            //             sharedParams.transformControls.showX = true; // Show only X-axis arrow
            //             sharedParams.transformControls.showY = false; // Hide Y-axis arrow
            //             sharedParams.transformControls.showZ = false; // Hide Z-axis arrow

            //             // Add event listener to enforce boundary check during movement
            //             sharedParams.transformControls.addEventListener(
            //                 "objectChange",
            //                 this.enforceHangerBounds
            //             );
            //         }
            //     } else if (
            //         rackPartNames.includes(sharedParams.selectedNode.name) ||
            //         rackNames.includes(sharedParams.selectedNode.name)
            //     ) {
            //         let tempNode, selectedRackNode;

            //         for (let val of rackNames) {
            //             tempNode = await findParentNodeByName(
            //                 sharedParams.selectedNode,
            //                 val,
            //                 true
            //             );
            //             if (tempNode) {
            //                 selectedRackNode = tempNode;
            //                 break;
            //             }
            //         }
            //         if (
            //             !selectedRackNode &&
            //             rackNames.includes(sharedParams.selectedNode.name) &&
            //             (await this.isVisibleParents(sharedParams.selectedNode))
            //         ) {
            //             selectedRackNode = sharedParams.selectedNode;
            //         }
            //         if (selectedRackNode) {
            //             sharedParams.selectedNode = selectedRackNode;
            //             let removeRack =
            //                 sharedParams.selectedNode.getObjectByName(
            //                     "removeRack-" + sharedParams.selectedNode.name
            //                 );
            //             if (removeRack) {
            //                 removeRack.visible = true;
            //             }
            //             // Attach transform controls to the selected node
            //             sharedParams.transformControls.attach(
            //                 sharedParams.selectedNode
            //             );
            //             sharedParams.transformControls.setMode("translate"); // Set the mode to 'translate' for moving
            //             sharedParams.transformControls.translationSnap = 3.139;

            //             // Configure to show only X-axis control and allow movement only on X-axis
            //             sharedParams.transformControls.showX = false; // Show only X-axis arrow
            //             sharedParams.transformControls.showY = true; // Hide Y-axis arrow
            //             sharedParams.transformControls.showZ = false; // Hide Z-axis arrow

            //             // Add event listener to enforce boundary check during movement
            //             sharedParams.transformControls.addEventListener(
            //                 "objectChange",
            //                 this.enforceRackBounds
            //             );
            //         }
            //     } else {
            //         this.hideRemoveIcons();
            //     }
            // } else {
            //     this.hideRemoveIcons();
            // }
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
            sharedParams.renderer.setSize(
                window.innerWidth,
                window.innerHeight
            );
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
        if (sharedParams.modelGroup && sharedParams.transformControls) {
            sharedParams.modelGroup.traverse((child) => {
                if (child.name && child.name.includes("remove")) {
                    child.visible = false; // Hide remove icon
                }
            });
            sharedParams.transformControls.detach();
            sharedParams.selectedNode = null;

            sharedParams.transformControls.removeEventListener(
                "objectChange",
                this.enforceHangerBounds
            );
            sharedParams.transformControls.removeEventListener(
                "objectChange",
                this.enforceRackBounds
            );
            // Check if clicked on allModelNames or allOtherModelNames
        }
    }

    // Function to enforce boundaries on X-axis
    async enforceHangerBounds() {
        if (sharedParams.selectedNode) {
            let tempNode, defaultModel;

            for (let val of allModelNames) {
                tempNode = await findParentNodeByName(
                    sharedParams.selectedNode,
                    val,
                    true
                );
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
                let selectedChildNode =
                    sharedParams.selectedNode.getObjectByName("Hanger_Stand") ||
                    sharedParams.selectedNode.getObjectByName("Hanger_StandX");

                // const selectedChildWorldPosition = new THREE.Vector3();
                // selectedChildNode.getWorldPosition(selectedChildWorldPosition);

                const nodeBoundingBox = new THREE.Box3().setFromObject(
                    selectedChildNode
                );
                const nodeWidth = nodeBoundingBox.max.x - nodeBoundingBox.min.x;

                // const margin = 20;
                // const adjustedMinX = frameBox.min.x + selectedChildNode.position.x + (nodeWidth / 2) + params.frameTopExMargin;
                // const adjustedMaxX = frameBox.max.x - selectedChildNode.position.x - (nodeWidth / 2) - params.frameTopExMargin;

                const adjustedMinX =
                    minX + nodeWidth / 2 + params.frameTopExMargin;
                const adjustedMaxX =
                    maxX - nodeWidth / 2 - params.frameTopExMargin;

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
                tempNode = await findParentNodeByName(
                    sharedParams.selectedNode,
                    val,
                    true
                );
                if (tempNode) {
                    defaultModel = tempNode;
                    break;
                }
            }
            // let defaultModel = main_model.getObjectByName(params.selectedGroupName);
            // let defaultModel = main_model.getObjectByName(params.defaultModel);
            let baseFrame = defaultModel.getObjectByName("Base_Solid");
            let leftSlottedFrame =
                defaultModel.getObjectByName("Left_Ex_Slotted");
            const baseFrameBox = new THREE.Box3().setFromObject(baseFrame);
            const leftSlottedFrameBox = new THREE.Box3().setFromObject(
                leftSlottedFrame
            );
            // const boundingBox = params.calculateBoundingBox[params.defaultModel]['Frame'];

            const min = leftSlottedFrameBox.min.clone();
            const max = leftSlottedFrameBox.max.clone();
            const leftSlottedFrameHeight = max.y - min.y;
            const baseFrameHeight = baseFrameBox.max.y - baseFrameBox.min.y;

            let minY = min.y;
            let maxY = max.y + leftSlottedFrame.position.y;
            const nodeBoundingBox = new THREE.Box3().setFromObject(
                sharedParams.selectedNode
            );
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

    async showLoadingModal(message) {
        document.getElementById("loadingModal").style.display = "flex";
        document.getElementById("loadingText").innerHTML = message;
    }

    async hideLoadingModal() {
        document.getElementById("loadingModal").style.display = "none";
    }

    async generateArModel() {
        const unixTimestamp = Math.floor(Date.now() / 1000);
        const modelName = `main_group_${unixTimestamp}`;
        const exportedModelFileUrl = `./export_models/${modelName}`;

        await exportModelForAr(sharedParams.modelGroup, modelName);

        // Check if the file exists
        const checkFile = new FileManager();
        if (await checkFile.checkFileExists(exportedModelFileUrl)) {
            this.hideLoadingModal();
            await this.showARModel(exportedModelFileUrl);
            // Configure model viewer attributes
            // const userAgent = navigator.userAgent || navigator.vendor || window.opera;
            // if (/iPhone|iPad|iPod/.test(userAgent)) {
            //   let ViewArForIos = document.getElementById("ViewArForIos");
            //   ViewArForIos.style.display = "block";
            //   ViewArForIos.href = `${exportedModelFileUrl}.usdz`;
            //   ViewArForIos.click();
            // } else if (/Android/.test(userAgent)) {
            //   // Create or update the AR viewer
            //   const modelViewer = document.getElementById("modelViewer");
            //   let ArViewer = document.getElementById("ArView");
            //   ArViewer.style.display = "block";
            //   modelViewer.setAttribute("src", `${exportedModelFileUrl}.glb`);
            //   modelViewer.setAttribute("ar-modes", "scene-viewer");
            //   modelViewer.addEventListener("load", () => {
            //     modelViewer.enterAR();
            //   });
            // } else {
            //   alert("This feature is only supported on iOS and Android devices.");
            // }
        } else {
            console.error("File was not found within the expected time.");
            this.hideLoadingModal();
        }
    }
    async showARModel(exportedModelFileUrl) {
        const userAgent = navigator.userAgent;

        // Create loading screen elements
        const loadingScreen = document.createElement("div");
        loadingScreen.className = "ar-loading-screen";

        const spinner = document.createElement("div");
        spinner.className = "ar-loading-spinner";

        const progressBar = document.createElement("div");
        progressBar.className = "ar-progress-bar";

        const progressFill = document.createElement("div");
        progressFill.className = "ar-progress-fill";

        const loadingText = document.createElement("div");
        loadingText.className = "ar-loading-text";
        loadingText.textContent = "Preparing AR Experience...";

        progressBar.appendChild(progressFill);
        loadingScreen.appendChild(spinner);
        loadingScreen.appendChild(progressBar);
        loadingScreen.appendChild(loadingText);
        document.body.appendChild(loadingScreen);

        // Function to update progress
        function updateProgress(percent) {
            progressFill.style.width = `${percent}%`;
            loadingText.textContent = `Loading AR Model: ${Math.round(
                percent
            )}%`;
        }

        // Function to remove loading screen
        function removeLoadingScreen() {
            loadingScreen.remove();
        }

        if (/iPhone|iPad|iPod/.test(userAgent)) {
            // For iOS devices
            fetch(`${exportedModelFileUrl}.usdz`)
                .then((response) => {
                    const reader = response.body.getReader();
                    const contentLength =
                        +response.headers.get("Content-Length");
                    let receivedLength = 0;

                    return new ReadableStream({
                        start(controller) {
                            function push() {
                                reader.read().then(({ done, value }) => {
                                    if (done) {
                                        controller.close();
                                        return;
                                    }
                                    receivedLength += value.length;
                                    const progress =
                                        (receivedLength / contentLength) * 100;
                                    updateProgress(progress);
                                    controller.enqueue(value);
                                    push();
                                });
                            }
                            push();
                        },
                    });
                })
                .then(() => {
                    let ViewArForIos = document.getElementById("ViewArForIos");
                    ViewArForIos.style.display = "block";
                    ViewArForIos.href = `${exportedModelFileUrl}.usdz`;
                    ViewArForIos.click();
                    removeLoadingScreen();
                })
                .catch((error) => {
                    loadingText.textContent =
                        "Error loading AR model. Please try again.";
                    console.error("Error:", error);
                    setTimeout(removeLoadingScreen, 2000);
                });
        } else if (/Android/.test(userAgent)) {
            // For Android devices
            const modelViewer = document.getElementById("modelViewer");
            let ArViewer = document.getElementById("ArView");
            // Show loading screen
            ArViewer.style.display = "block";

            fetch(`${exportedModelFileUrl}.glb`)
                .then((response) => {
                    const reader = response.body.getReader();
                    const contentLength =
                        +response.headers.get("Content-Length");
                    let receivedLength = 0;

                    return new ReadableStream({
                        start(controller) {
                            function push() {
                                reader.read().then(({ done, value }) => {
                                    if (done) {
                                        controller.close();
                                        return;
                                    }
                                    receivedLength += value.length;
                                    const progress =
                                        (receivedLength / contentLength) * 100;
                                    updateProgress(progress);
                                    controller.enqueue(value);
                                    push();
                                });
                            }
                            push();
                        },
                    });
                })
                .then(() => {
                    modelViewer.setAttribute(
                        "src",
                        `${exportedModelFileUrl}.glb`
                    );
                    modelViewer.setAttribute("ar-modes", "scene-viewer");
                    modelViewer.addEventListener("load", () => {
                        removeLoadingScreen();
                        modelViewer.enterAR();
                    });
                })
                .catch((error) => {
                    loadingText.textContent =
                        "Error loading AR model. Please try again.";
                    console.error("Error:", error);
                    setTimeout(removeLoadingScreen, 2000);
                });
        } else {
            removeLoadingScreen();
            alert("This feature is only supported on iOS and Android devices.");
        }
    }

    async formSubmitionForMonday() {
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

                params.rackAdded = params.rackAdded || {};
                params.rackAdded[child.rackArrayKey] =
                    params.rackAdded[child.rackArrayKey] || {};
                params.rackAdded[child.rackArrayKey][child.rackCount] =
                    child.position;
            }
        });
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
        const dataToSave = {
            params: params || null,
            setting: setting || null,
            group_names: allGroupNames || null,
            top_frame_croped_image: sharedParams.topFrameCropedImage || null,
            main_frame_croped_image: sharedParams.mainFrameCropedImage || null,
            ModelData: modelMeasurementData || null,
        };
        const formForMonday = document.getElementById("FormSubmitionForMonday");
        const formDataForMonday = new FormData(formForMonday);
        formDataForMonday.append("mondayData", JSON.stringify(dataToSave));
        try {
            const response = await fetch("api.php", {
                method: "POST",
                body: formDataForMonday,
            });
            const data = await response.json();
            if(data.status === "success") {
                this.hideLoadingModal();
                return data; // Ensure the resolved data is returned
            }
        } catch (error) {
            console.error("Error while submitting form: ", error);
            this.hideLoadingModal();
            throw error; // Re-throw the error to handle it at the calling point
        }
    }
    async updateMaterial(value, dropdownType, selectedModel = "main_model") {
        let current_setting = setting[params.selectedGroupName];

        // console.log('value', value)
        let type, imageUrl, displayText;

        // console.log('selectedModel', selectedModel)

        // const customDropdownButton = document.querySelector(`.custom-dropdown[data-type=${dropdownType}]`);
        const customDropdownButton = document.querySelector(
            `.accordion-item[data-model=${selectedModel}] .custom-dropdown[data-type=${dropdownType}]`
        );
        // console.log('customDropdownButton', customDropdownButton)
        // Reset selected class
        // document.querySelectorAll(".dropdown-item").forEach(function (el) {
        customDropdownButton
            .querySelectorAll(`.dropdown-item`)
            .forEach(function (el) {
                el.classList.remove("selected");
            });

        // Find the matching element and add the selected class
        customDropdownButton
            .querySelectorAll(`.dropdown-item`)
            .forEach(function (element) {
                // console.log('element', element.getAttribute("data-value"))
                if (element.getAttribute("data-value") === value) {
                    // console.log('yes', value)
                    let accordion =
                        customDropdownButton.closest(`.accordion-item`);
                    selectedModel = accordion.getAttribute(`data-model`);
                    type = element.getAttribute("data-type");
                    imageUrl =
                        type === "texture"
                            ? element.querySelector("img").src
                            : "";
                    displayText = element.querySelector("span").innerText;
                    element.classList.add("selected");
                }
            });

        if (dropdownType === "frame") {
            setting[params.selectedGroupName].frameBorderColor = value;
            setting[params.selectedGroupName].frameMaterialType = type;
        } else if (dropdownType === "shelf") {
            setting[params.selectedGroupName].defaultShelfColor = value;
            setting[params.selectedGroupName].shelfMaterialType = type;
        }
        await showHideNodes();

        // Update dropdown button with selected image/color and name
        const dropdownButton = customDropdownButton.querySelector(
            `.accordion-item[data-model=${selectedModel}] .dropdown-button`
        );
        if (dropdownButton) {
            const selectedImage =
                dropdownButton.querySelector(".selected-image");
            const selectedText = dropdownButton.querySelector("span");
            if (selectedImage) {
                if (type === "texture") {
                    selectedImage.src = imageUrl;
                    selectedImage.style.display = "inline-block"; // Show image
                } else if (type === "color") {
                    selectedImage.style.display = "none"; // Hide image for color
                }
            }

            if (selectedText && displayText) {
                selectedText.innerText = displayText;
            }
        }

        if (dropdownType === "frame") {
            // if (type && type == "color" && value && value == "0xffffff") {
            //   sharedParams.renderer.toneMapping = THREE.ACESFilmicToneMapping;
            // } else {
            //   sharedParams.renderer.toneMapping = THREE.AgXToneMapping;
            // }
            // await lightSetup();
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
          console.log("params.selectedGroupName", params.selectedGroupName);
          setting[params.selectedGroupName].topOption = event.target.value;
          setting[params.selectedGroupName].headerRodToggle = false;
          if (
            setting[params.selectedGroupName].topOption == "Header_Wooden_Shelf"
          ) {
            setting[params.selectedGroupName].headerRodToggle = true;
          }

          const headerRodToggle = document.querySelector(".headerRodToggle");
          headerRodToggle.checked =
            setting[params.selectedGroupName].headerRodToggle;
          await otherModelSetup();
          await showHideNodes(modelGroup, scene, camera);
        }
        // You can add similar event handlers for other elements here
      });
    }

    if (this.elements.headerOptions) {
      this.elements.headerOptions.value = params.headerOptions;
      document.addEventListener("change", async function (event) {
        if (event.target.classList.contains("headerOptions")) {
          setting[params.selectedGroupName].headerOptions = event.target.value;
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
          await showHideNodes(modelGroup, scene, camera);
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
          await showHideNodes(modelGroup, scene, camera);
        }
      });
    }

    if (this.elements.headerRodColorDropdown) {
      this.elements.headerRodColorDropdown.value = params.rodFrameColor;
      document.addEventListener("change", async function (event) {
        if (event.target.classList.contains("headerRodColorDropdown")) {
          setting[params.selectedGroupName].rodFrameColor = event.target.value;
          await otherModelSetup();
          await showHideNodes(modelGroup, scene, camera);
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
          await showHideNodes(modelGroup, scene, camera);
        }
      });
    }

    if (this.elements.slottedSidesToggle) {
      this.elements.slottedSidesToggle.checked = params.slottedSidesToggle;
      document.addEventListener("change", async function (event) {
        if (event.target.classList.contains("slottedSidesToggle")) {
          setting[params.selectedGroupName].slottedSidesToggle =
            event.target.checked;
          await otherModelSetup();
          await showHideNodes(modelGroup, scene, camera);
        }
        let topShelfColorDropdown = parentElement.querySelectorAll(
            '.custom-dropdown[data-type="shelf"] .dropdown-item'
        );
        topShelfColorDropdown.forEach((dropdownItem) => {
            let dataValue = dropdownItem.getAttribute("data-value");
            if (dataValue === current_setting.defaultShelfColor) {
                dropdownItem.classList.add("selected");
            }
        });
        let slottedSidesToggle = parentElement.querySelector(
            ".slottedSidesToggle"
        );
        if (slottedSidesToggle) {
            slottedSidesToggle.checked = current_setting.slottedSidesToggle;
        }
      });
    }

    if (this.elements.mainFrameFileUpload) {
      document.addEventListener("change", async function (event) {
        if (event.target.classList.contains("mainFrameFileUpload")) {
          if (modelGroup) {
            const file = event.target.files[0];
            if (!file) return;

            params.fileUploadFlag = "MainFrame";

            const reader = new FileReader();
            reader.onload = async function (e) {
              const cropperImage = document.getElementById("cropper-image");
              const cropperContainer =
                document.getElementById("cropper-container");
              cropperImage.src = e.target.result;
              cropperContainer.style.display = "block";

              if (cropper) {
                cropper.destroy();
              }

              let currentGroup = modelGroup.getObjectByName(
                params.selectedGroupName
              );
              let defaultModelName =
                setting[params.selectedGroupName].defaultModel;
              let defaultModel = currentGroup.getObjectByName(defaultModelName);

              const size = await getCurrentModelSize(defaultModel, "Cube1-Mat");
              // console.log(size)

              cropper = new Cropper(cropperImage, {
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
        this.closeCropper(cropper)
      );
    }

    if (this.elements.cropButton) {
      this.elements.cropButton.addEventListener("click", async (event) => {
        // console.log("cropper", cropper);
        if (cropper) {
          let selectedGroupName = params.selectedGroupName;
          let defaultModel = setting[selectedGroupName].defaultModel;
          let defaultHeaderSize = setting[selectedGroupName].defaultHeaderSize;
          if (params.fileUploadFlag == "MainFrame") {
            sharedData.mainFrameCropedImage =
              sharedData.mainFrameCropedImage || {};
            sharedData.mainFrameCropedImage[selectedGroupName] =
              sharedData.mainFrameCropedImage[selectedGroupName] || {};
            // mainFrameCropedImage[selectedGroupName][defaultModel] = cropper.getCroppedCanvas().toDataURL("image/png");
            // mainFrameCropedImage[selectedGroupName][defaultModel] = cropper.getCroppedCanvas();
            let mainFrameSaveImageURl = await this.saveCropImage(cropper);
            sharedData.mainFrameCropedImage[selectedGroupName][defaultModel] =
              mainFrameSaveImageURl.imageUrl;
            await setMainFrameCropedImage(
              sharedData.mainFrameCropedImage,
              modelGroup
            );
        }
        let headerFrameColorDropdown = parentElement.querySelector(
            ".headerFrameColorDropdown"
        );
        if (headerFrameColorDropdown) {
            headerFrameColorDropdown.value =
                current_setting.topFrameBackgroundColor;
        }
        let mainFrameColorDropdown = parentElement.querySelectorAll(
            '.custom-dropdown[data-type="frame"] .dropdown-item'
        );
        mainFrameColorDropdown.forEach((dropdownItem) => {
            let dataValue = dropdownItem.getAttribute("data-value");
            if (dataValue === current_setting.frameBorderColor) {
                dropdownItem.classList.add("selected");
            }
        });
        let mainFrameColorInput = parentElement.querySelector(
            ".mainFrameColorInput"
        );
        if (mainFrameColorInput) {
            mainFrameColorInput.value = getHex(
                current_setting.mainFrameBackgroundColor
            );
          }
        }
      });
    }

    if (this.elements.headerFrameColorDropdown) {
      this.elements.headerFrameColorDropdown.value =
        params.topFrameBackgroundColor;
      document.addEventListener("change", async function (event) {
        if (event.target.classList.contains("headerFrameColorDropdown")) {
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
          await showHideNodes(modelGroup, scene, camera);
        }
      });
    }

    if (this.elements.baseColor) {
      this.elements.baseColor.value = params.baseFrameColor;
      document.addEventListener("change", async function (event) {
        if (event.target.classList.contains("baseColor")) {
          setting[params.selectedGroupName].baseFrameColor = event.target.value;
          await otherModelSetup();
          await showHideNodes(modelGroup, scene, camera);
        }
      });
    }

    if (this.elements.addHanger) {
      document.addEventListener("click", async function (event) {
        if (event.target.closest(".addHanger")) {
          const hangerType = event.target.getAttribute("data-hanger");
          await otherModelSetup();
          await addHangers(
            modelGroup,
            hangerType,
            hanger_model,
            hanger_golf_club_model,
            scene,
            camera
          );
        }
      });
    }

    if (this.elements.addRack) {
      document.addEventListener("click", async function (event) {
        if (event.target.closest(".addRack")) {
          const rackType = event.target.getAttribute("data-rack");
          await otherModelSetup();
          await addRacks(
            modelGroup,
            rackType,
            rack_wooden_model,
            rack_glass_model,
            scene,
            camera
          );
        }
      });
    }

    if (this.elements.hangerClothesToggle) {
      this.elements.hangerClothesToggle.checked = params.hangerClothesToggle;
      document.addEventListener("change", async (event) => {
        if (event.target.classList.contains("hangerClothesToggle")) {
          setting[params.selectedGroupName].hangerClothesToggle =
            event.target.checked;
          await otherModelSetup();
          await showHideNodes(modelGroup, scene, camera);
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
          await showHideNodes(modelGroup, scene, camera);
        }
      });
    }

    if (this.elements.hangerStandColor) {
      this.elements.hangerStandColor.value = params.defaultHangerStandColor;
      document.addEventListener("change", async function (event) {
        if (event.target.classList.contains("hangerStandColor")) {
          setting[params.selectedGroupName].defaultHangerStandColor =
            event.target.value;
          await otherModelSetup();
          await showHideNodes(modelGroup, scene, camera);
        }
      });
    }

    if (this.elements.rackShelfColor) {
      this.elements.rackShelfColor.value = params.defaultRackShelfStandColor;
      document.addEventListener("change", async function (event) {
        if (event.target.classList.contains("rackShelfColor")) {
          setting[params.selectedGroupName].defaultRackShelfStandColor =
            event.target.value;
          await otherModelSetup();
          await showHideNodes(modelGroup, scene, camera);
        }
      });
    }

    if (this.elements.rackStandColor) {
      this.elements.rackStandColor.value = params.defaultRackStandStandColor;
      document.addEventListener("change", async function (event) {
        if (event.target.classList.contains("rackStandColor")) {
          setting[params.selectedGroupName].defaultRackStandStandColor =
            event.target.value;
          await otherModelSetup();
          await showHideNodes(modelGroup, scene, camera);
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
          await showHideNodes(modelGroup, scene, camera);
        }
      );
    }

    if (this.elements.addAnotherModel) {
      this.elements.addAnotherModel.forEach((button) => {
        button.addEventListener("click", async function () {
          await addAnotherModels(allGroupNames, modelGroup, scene, camera);
          await centerMainModel(modelGroup);
          await showHideNodes(modelGroup, scene, camera);
        });
      });
    }

    if (this.elements.zoomInButton) {
      this.elements.zoomInButton.addEventListener("click", function () {
        if (cropper) cropper.zoom(0.1); // Zoom in
      });
    }

    if (this.elements.zoomOutButton) {
      this.elements.zoomOutButton.addEventListener("click", function () {
        if (cropper) cropper.zoom(-0.1); // Zoom out
      });
    }

    if (this.elements.resetButton) {
      this.elements.resetButton.addEventListener("click", function () {
        if (cropper) {
          cropper.reset(); // Reset cropper settings to default
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
          const modelName = openedAccordionItem.getAttribute("data-model");
          if (modelName) {
            params.selectedGroupName = modelName;
            await otherModelSetup();
            await showHideNodes(modelGroup, scene, camera);
          }
        }
      );
    }

    document.addEventListener(
      "mousemove",
      (event) => this.onMouseMove(event, mouse, raycaster, camera, modelGroup),
      false
    );
    window.addEventListener("resize", (event) =>
      this.onWindowResize(camera, renderer)
    );
    document.removeEventListener("click", this.handleClickWrapper);
    document.addEventListener(
      "click",
      (this.handleClickWrapper = (event) =>
        this.handleClick(
          event,
          transformControls,
          selectedNode,
          scene,
          camera,
          modelGroup
        ))
    );
  }
  async handleClick(
    event,
    transformControls,
    selectedNode,
    scene,
    camera,
    modelGroup
  ) {
    if (!event.target.closest(".custom-dropdown")) {
      document
        .querySelectorAll(".custom-dropdown .dropdown-content")
        .forEach(function (content) {
          content.style.display = "none";
        });
    }
    this.onMouseClick(
      transformControls,
      selectedNode,
      scene,
      camera,
      modelGroup
    );
  }
  async onMouseMove(event, mouse, raycaster, camera, modelGroup) {
    // Calculate mouse position in normalized device coordinates (-1 to +1 for both axes)
    if (event !== undefined && mouse !== undefined && camera !== undefined) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Update the raycaster with the camera and mouse position
      raycaster.setFromCamera(mouse, camera);
      const visibleObjects = [];

      // Traverse the main model and find visible objects
      modelGroup.traverse((child) => {
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
      this.hangerIntersects = raycaster.intersectObjects(
        finalVisibleObjects,
        true
      );
      // console.log("finalVisibleObjects", finalVisibleObjects);
      // console.log("hangerIntersects", this.hangerIntersects);
      // console.log("raycaster", raycaster);
    }
  }

  // Handle mouse click for selection
  async onMouseClick(
    transformControls,
    selectedNode,
    scene,
    camera,
    modelGroup
  ) {
    // console.log("hangerIntersects", this.hangerIntersects);
    // let defaultModel = modelGroup.getObjectByName(params.selectedGroupName);
    if (
      this.hangerIntersects &&
      this.hangerIntersects.length > 0 &&
      transformControls
    ) {
      this.hideRemoveIcons(modelGroup, selectedNode, transformControls);
      const intersectNode = this.hangerIntersects[0].object;
      if (intersectNode) {
        // console.log('intersectNode', intersectNode)
        selectedNode = intersectNode.parent;
        let iconName = selectedNode.name;

        let tempNode, defaultModel;
        for (let val of allModelNames) {
          tempNode = await findParentNodeByName(selectedNode, val, true);
          if (tempNode) {
            defaultModel = tempNode;
            break;
          }
        }

        if (iconName.startsWith("removeHanger-")) {
          if (modelGroup) {
            let nodeName = iconName.replace("removeHanger-", "");
            let hangerToRemove = await findParentNodeByName(
              selectedNode,
              nodeName
            );
            let hangerArrayKey = hangerToRemove.hangerArrayKey || null;
            if (hangerToRemove) {
              let frame = defaultModel.getObjectByName("Frame");
              transformControls.detach();
              frame.remove(hangerToRemove);
            }
            if (hangerArrayKey) {
              params.hangerCount[hangerArrayKey] -= 1;
            }
            await showHideNodes(modelGroup, scene, camera);
          }
        } else if (iconName.startsWith("removeRack-")) {
          let nodeName = iconName.replace("removeRack-", "");
          let hangerToRemove = await findParentNodeByName(
            selectedNode,
            nodeName
          );
          if (hangerToRemove) {
            let frame = defaultModel.getObjectByName("Frame");
            transformControls.detach();
            frame.remove(hangerToRemove);
          }
        } else if (
          hangerPartNames.includes(selectedNode.name) ||
          hangerNames.includes(selectedNode.name)
        ) {
          let tempNode, selectedHangerNode;

          for (let val of hangerNames) {
            tempNode = await findParentNodeByName(selectedNode, val, true);
            if (tempNode) {
              selectedHangerNode = tempNode;
              break;
            }
          }
          if (selectedHangerNode) {
            selectedNode = selectedHangerNode;
            let removeHanger = selectedNode.getObjectByName(
              "removeHanger-" + selectedNode.name
            );
            if (removeHanger) {
              removeHanger.visible = true;
            }
            // console.log('selectedNode', selectedNode)

            // Attach transform controls to the selected node
            // console.log(transformControls);
            transformControls.attach(selectedNode);
            transformControls.setMode("translate"); // Set the mode to 'translate' for moving

            // Configure to show only X-axis control and allow movement only on X-axis
            transformControls.showX = true; // Show only X-axis arrow
            transformControls.showY = false; // Hide Y-axis arrow
            transformControls.showZ = false; // Hide Z-axis arrow

            // Add event listener to enforce boundary check during movement
            transformControls.addEventListener("objectChange", () => {
              this.enforceHangerBounds(selectedNode);
            });
          }
        } else if (
          rackPartNames.includes(selectedNode.name) ||
          rackNames.includes(selectedNode.name)
        ) {
          let tempNode, selectedRackNode;

          for (let val of rackNames) {
            tempNode = await findParentNodeByName(selectedNode, val, true);
            if (tempNode) {
              selectedRackNode = tempNode;
              break;
            }
          }
          if (
            !selectedRackNode &&
            rackNames.includes(selectedNode.name) &&
            (await this.isVisibleParents(selectedNode))
          ) {
            selectedRackNode = selectedNode;
          }
          if (selectedRackNode) {
            selectedNode = selectedRackNode;
            let removeRack = selectedNode.getObjectByName(
              "removeRack-" + selectedNode.name
            );
            if (removeRack) {
              removeRack.visible = true;
            }
            // Attach transform controls to the selected node
            transformControls.attach(selectedNode);
            transformControls.setMode("translate"); // Set the mode to 'translate' for moving
            transformControls.translationSnap = 3.139;

            // Configure to show only X-axis control and allow movement only on X-axis
            transformControls.showX = false; // Show only X-axis arrow
            transformControls.showY = true; // Hide Y-axis arrow
            transformControls.showZ = false; // Hide Z-axis arrow

            // Add event listener to enforce boundary check during movement
            transformControls.addEventListener("objectChange", () => {
              this.enforceRackBounds(selectedNode);
            });
          }
        } else {
          this.hideRemoveIcons(modelGroup, selectedNode, transformControls);
        }
      } else {
        this.hideRemoveIcons(modelGroup, selectedNode, transformControls);
      }
    } else {
      this.hideRemoveIcons(modelGroup, selectedNode, transformControls);
    }
  }
  async onWindowResize(camera, renderer) {
    if (!camera || !renderer) {
      return;
    }else{
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }

  async closeCropper(cropper) {
    const cropperContainer = document.getElementById("cropper-container");

    cropperContainer.style.display = "none";
    document.body.classList.remove("modal-open");
    if (cropper) {
      cropper.destroy();
      cropper = null;
    }

    const topFrameFileUploads = document.querySelectorAll(
      ".mainFrameFileUpload"
    );

    // Loop through each element and set its value to blank
    topFrameFileUploads.forEach((element) => {
      // console.log('vvvv', element);

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

  async hideRemoveIcons(modelGroup, selectedNode, transformControls) {
    if (modelGroup) {
      modelGroup.traverse((child) => {
        if (child.name && child.name.includes("remove")) {
          child.visible = false; // Hide remove icon
        }
      });
      transformControls.detach();
      selectedNode = null;

      transformControls.removeEventListener("objectChange", () => {
        this.enforceHangerBounds(selectedNode);
      });
      transformControls.removeEventListener("objectChange", () => {
        this.enforceRackBounds(selectedNode);
      });
      // Check if clicked on allModelNames or allOtherModelNames
    }
  }

  // Function to enforce boundaries on X-axis
  async enforceHangerBounds(selectedNode) {
    if (selectedNode) {
      let tempNode, defaultModel;

      for (let val of allModelNames) {
        tempNode = await findParentNodeByName(selectedNode, val, true);
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
        let selectedChildNode = selectedNode.getObjectByName("Hanger_Stand");

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

        const position = selectedNode.position;
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
  async enforceRackBounds(selectedNode) {
    // console.log("enforceRackBounds", selectedNode);
    if (selectedNode) {
      let tempNode, defaultModel;
      for (let val of allModelNames) {
        tempNode = await findParentNodeByName(selectedNode, val, true);
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
      const leftSlottedFrameBox = new THREE.Box3().setFromObject(
        leftSlottedFrame
      );
      // const boundingBox = params.calculateBoundingBox[params.defaultModel]['Frame'];

      const min = leftSlottedFrameBox.min.clone();
      const max = leftSlottedFrameBox.max.clone();
      const leftSlottedFrameHeight = max.y - min.y;
      const baseFrameHeight = baseFrameBox.max.y - baseFrameBox.min.y;

      let minY = min.y;
      let maxY = max.y + leftSlottedFrame.position.y;
      const nodeBoundingBox = new THREE.Box3().setFromObject(selectedNode);
      const nodeHeight = nodeBoundingBox.max.y - nodeBoundingBox.min.y;

      const margin = 10;

      const adjustedMinY = minY - nodeHeight / 2 - baseFrameHeight - 50;
      const adjustedMaxY = maxY - nodeHeight / 2 + baseFrameHeight + 25;

      const position = selectedNode.position;

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
