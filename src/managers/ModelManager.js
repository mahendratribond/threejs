import { commonMaterial } from "./MaterialManager.js";
import {
    THREE,
    rodFrameTextureNames,
    allModelNames,
    rackPartNames,
    params,
    sharedParams,
} from "../../config.js";
import {
    setPositionCenter,
    updateModelName,
    getModelNode,
    traverseAsync,
    getRodCount,
    getSupportBaseCount,
} from "../../utils6.js";
import { getModelSize, getNodeSize } from "./MeasurementManager.js";
export class ModelManager {
    constructor() {}

    setupMainModel(main_model) {
        main_model.traverse(async (modelNode) => {
            if (modelNode.name && modelNode.name.startsWith("Base_Option")) {
                // if (modelNode.material && baseFrameTextureNames.includes(modelNode.name)) {
                // const material = await commonMaterial(
                //     parseInt(params.baseFrameColor, 16)
                // );
                // modelNode.material = material;
                // modelNode.material.needsUpdate = true;
                // }

                commonMaterial(parseInt(params.baseFrameColor, 16))
                    .then((material) => {
                        // This code runs after material is created
                        modelNode.material = material;
                        modelNode.material.needsUpdate = true;
                    })
                    .catch((error) => {
                        console.error("Error creating material:", error);
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

                let shelfModel = modelNode.getObjectByName(
                    "Header_Wooden_Shelf"
                );
                if (shelfModel) {
                    modelNode.isShelf = true;
                } else {
                    modelNode.isShelf = false;
                }

                let glassShelfModel =
                    modelNode.getObjectByName("Header_Glass_Shelf");
                if (glassShelfModel) {
                    modelNode.isGlassShelf = true;
                } else {
                    modelNode.isGlassShelf = false;
                }

                let SlottedSideModel =
                    modelNode.getObjectByName("Left_Ex_Slotted");
                if (SlottedSideModel) {
                    modelNode.isSlottedSides = true;
                } else {
                    modelNode.isSlottedSides = false;
                }
            }
        });
    }

    async setupArrowModel() {
        if (sharedParams.arrow_model) {
            await sharedParams.arrow_model.traverse(async function (child) {
                if (child.material) {
                    const material = await commonMaterial(
                        parseInt("0x888888", 16)
                    );
                    child.material = material;
                    child.material.needsUpdate = true;
                }
            });

            sharedParams.arrow_model = await setPositionCenter(
                sharedParams.arrow_model
            );

            await traverseAsync(
                sharedParams.modelGroup,
                async function (modelNode) {
                    if (allModelNames.includes(modelNode.name)) {
                        const modelBox = new THREE.Box3().setFromObject(
                            modelNode
                        );
                        const cone_model =
                            sharedParams.arrow_model.getObjectByName("Cone");
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
                }
            );
        }
    }

    async setupGlassShelfFixingModel() {
        let modelSize;
        if (sharedParams.header_glass_shelf_fixing_model) {
            sharedParams.header_glass_shelf_fixing_model =
                await updateModelName(
                    sharedParams.header_glass_shelf_fixing_model,
                    "__Glass_Shelf_Fixing",
                    "Glass_Shelf_Fixing"
                );
        }
        if (sharedParams.header_rod_model) {
            await traverseAsync(
                sharedParams.header_rod_model,
                async function (child) {
                    if (
                        child.material &&
                        rodFrameTextureNames.includes(child.name)
                    ) {
                        const material = await commonMaterial(
                            parseInt(params.rodFrameColor, 16)
                        );
                        child.material = material;
                        child.material.needsUpdate = true;
                    }
                }
            );
        }

        await traverseAsync(sharedParams.modelGroup, async (modelNode) => {
            if (allModelNames.includes(modelNode.name)) {
                modelSize = await getModelSize(modelNode.name);

                if (
                    sharedParams.header_rod_model &&
                    sharedParams.header_glass_shelf_fixing_model
                ) {
                    await this.createRod(modelNode, modelSize);
                }
            }
        });
    }
    async setupSupportBaseModel() {
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

        await traverseAsync(sharedParams.modelGroup, async (modelNode) => {
            if (allModelNames.includes(modelNode.name)) {
                modelSize = await getModelSize(modelNode.name);

                if (
                    sharedParams.support_base_middle &&
                    sharedParams.support_base_side
                ) {
                    await this.createSupportBase(modelNode, modelSize);
                }
            }
        });
    }

    async setupHeader500HeightModel() {
        let header;
        if (sharedParams.header_500_height_model) {
            await traverseAsync(
                sharedParams.modelGroup,
                async function (modelNode) {
                    if (allModelNames.includes(modelNode.name)) {
                        let frame = modelNode.getObjectByName("Frame");
                        const frameBox = new THREE.Box3().setFromObject(frame);

                        let header_300 =
                            modelNode.getObjectByName("Header_300");
                        let header_500_model =
                            sharedParams.header_500_height_model.getObjectByName(
                                modelNode.name
                            );
                        const header500ModelSize =
                            getNodeSize(header_500_model);
                        const header300ModelSize = getNodeSize(header_300);

                        if (header_300 && header_500_model) {
                            header = await getModelNode(
                                header_500_model,
                                "Header"
                            );
                            if (!header) {
                                header = await getModelNode(
                                    header_500_model,
                                    "Header_"
                                );
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
                                header.position.y =
                                    frameBox.max.y + header500ModelSize.y / 2;
                                modelNode.attach(header);
                            }
                        }
                    }
                }
            );
        }
    }

    async setupHeaderWoodenShelfModel() {
        await traverseAsync(
            sharedParams.modelGroup,
            async function (modelNode) {
                if (allModelNames.includes(modelNode.name)) {
                    if (sharedParams.header_wooden_shelf_model) {
                        let model =
                            sharedParams.header_wooden_shelf_model.getObjectByName(
                                modelNode.name
                            );
                        if (model) {
                            const modelSize = getNodeSize(model);
                            const frame = modelNode.getObjectByName("Frame");
                            const frameBox = new THREE.Box3().setFromObject(
                                frame
                            );

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
            }
        );
    }

    async setupHeaderGlassShelfModel() {
        if (sharedParams.header_glass_shelf_model) {
            sharedParams.header_glass_shelf_model.traverse(async (child) => {
                if (child.material) {
                    child.material = await this.generateGlassMaterial();
                    // child.material = await commonMaterial(0xffffff)
                    child.material.needsUpdate = true;
                }
            });
        }

        await traverseAsync(
            sharedParams.modelGroup,
            async function (modelNode) {
                if (allModelNames.includes(modelNode.name)) {
                    if (sharedParams.header_glass_shelf_model) {
                        let model =
                            sharedParams.header_glass_shelf_model.getObjectByName(
                                modelNode.name
                            );
                        if (model) {
                            const modelSize = getNodeSize(model);
                            const frame = modelNode.getObjectByName("Frame");
                            const frameBox = new THREE.Box3().setFromObject(
                                frame
                            );

                            if (frame) {
                                // console.log('frame', frame)
                                let positionY = frameBox.max.y;
                                if (params.rodSize) {
                                    positionY += params.rodSize.y;
                                }
                                if (params.glassShelfFixingSize) {
                                    positionY += params.glassShelfFixingSize.y;
                                }
                                positionY -= modelSize.y / 2 + -10; //0.5
                                model.name = "Header_Glass_Shelf";
                                model.visible = false;
                                model.position.y = positionY;
                                modelNode.attach(model);
                            }
                        }
                    }
                }
            }
        );
    }

    async setupSlottedSidesModel() {
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

        await traverseAsync(
            sharedParams.modelGroup,
            async function (modelNode) {
                if (allModelNames.includes(modelNode.name)) {
                    frame = modelNode.getObjectByName("Frame");

                    if (sharedParams.slotted_sides_model) {
                        let slotted_sides_ =
                            sharedParams.slotted_sides_model.clone();
                        let slotted_sides = slotted_sides_.getObjectByName(
                            modelNode.name
                        );
                        if (slotted_sides) {
                            slotted_left_side =
                                slotted_sides.getObjectByName(
                                    "Left_Ex_Slotted"
                                );
                            if (slotted_left_side) {
                                let leftSide = frame.getObjectByName("Left_Ex");
                                let leftSideWorldPosition = new THREE.Vector3();
                                leftSide.getWorldPosition(
                                    leftSideWorldPosition
                                );
                                slotted_left_side.visible = false;
                                frame.attach(slotted_left_side);
                                slotted_left_side.position.y =
                                    leftSide.position.y;
                            }

                            slotted_right_side =
                                slotted_sides.getObjectByName(
                                    "Right_Ex_Slotted"
                                );
                            if (slotted_right_side) {
                                let rightSide =
                                    frame.getObjectByName("Right_Ex");
                                let rightSideWorldPosition =
                                    new THREE.Vector3();
                                rightSide.getWorldPosition(
                                    rightSideWorldPosition
                                );
                                slotted_right_side.visible = false;
                                frame.attach(slotted_right_side);
                                slotted_right_side.position.y =
                                    rightSide.position.y;
                            }
                        }
                    }

                    // console.log('frame', frame)
                }
            }
        );
    }

    async setupWoodenRackModel(model) {
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

    async setupGlassRackModel(model) {
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

            const glassMaterial = await this.generateGlassMaterial();
            const defaultMaterial = await commonMaterial(
                parseInt(params.defaultRackColor, 16)
            );

            model.traverse(async function (child) {
                if (rackPartNames.includes(child.name)) {
                    let material =
                        child.name === "Rack_Glass_Shelf"
                            ? glassMaterial
                            : defaultMaterial;

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

    async createRod(modelNode, modelSize) {
        const additionalRods = getRodCount(modelSize);
        const header = modelNode.getObjectByName("Header_300");

        // Ensure both header and frame nodes exist
        if (header) {
            const headerBox = new THREE.Box3().setFromObject(header);
            const headerSize = getNodeSize(header); // Size of the current header

            let rodY = headerBox.min.y + params.rodSize.y / 2; //(frameSize.y / 2 + rodSize.y / 2);
            let lassShelfFixingY = params.glassShelfFixingSize.y / 2; //(frameSize.y / 2 + glassShelfFixingSize.y / 2);

            // Function to create and position a rod
            const createAndPositionRod = async (
                xOffset,
                rodName,
                shelfFixingName
            ) => {
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

                let shelf_fixing =
                    sharedParams.header_glass_shelf_fixing_model.clone();
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
                    await createAndPositionRod(
                        xOffset,
                        "Rod",
                        "Glass_Shelf_Fixing"
                    );
                }
            }
        }

        return modelNode;
    }
    async createSupportBase(modelNode, modelSize) {
        const additionalSupportBase = await getSupportBaseCount(modelSize);
        const base = modelNode.getObjectByName("Base_Solid");
        // Ensure both header and frame nodes exist
        if (base) {
            const baseBox = new THREE.Box3().setFromObject(modelNode);
            const baseSize = getNodeSize(modelNode); // Size of the current base
            let positionY;

            const bbox = new THREE.Box3();
            bbox.expandByObject(sharedParams.support_base_side);
            const modelWidth = bbox.min.y;
            // let baseY = baseBox.min.y + params.rodSize.y / 4; //(frameSize.y / 2 + rodSize.y / 2);
            let baseY = baseBox.min.y - modelWidth; //(frameSize.y / 2 + rodSize.y / 2);
            // Function to create and position a rod
            const createAndPositionBaseSide = async (
                xOffset,
                supportBaseName
            ) => {
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

    async generateGlassTexture() {
        const canvas = document.createElement("canvas");
        canvas.width = 2;
        canvas.height = 2;

        const context = canvas.getContext("2d");
        context.fillStyle = "white";
        context.fillRect(0, 1, 2, 1);

        return canvas;
    }
    async generateGlassMaterial() {
        let texture_glass = sharedParams.texture_background.clone();
        texture_glass.mapping = THREE.EquirectangularReflectionMapping;
        const texture = new THREE.CanvasTexture(
            await this.generateGlassTexture()
        );
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
}
