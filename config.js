import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import {
    CSS2DObject,
    CSS2DRenderer,
} from "three/addons/renderers/CSS2DRenderer.js";
import { USDZExporter } from "three/addons/exporters/USDZExporter.js";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export {
    THREE,
    OrbitControls,
    TransformControls,
    FontLoader,
    CSS2DObject,
    CSS2DRenderer,
    USDZExporter,
    GLTFExporter,
    RGBELoader,
    GLTFLoader,
};

export let sharedParams = {
    topFrameCropedImage: null,
    mainFrameCropedImage: null,
    renderer: null,
    scene: null,
    camera: null,
    controls: null,
    transformControls: null,
    raycaster: null,
    mouse: null,
    direction: null,
    selectedNode: null,
    labelRenderer: null,
    cropper: null,
    texture_background: null,
    border_texture_material: null,
    main_model: null,
    header_rod_model: null,
    header_wooden_shelf_model: null,
    header_500_height_model: null,
    header_glass_shelf_fixing_model: null,
    header_glass_shelf_model: null,
    slotted_sides_model: null,
    hanger_model: null,
    hanger_rail_step: null,
    hanger_rail_single: null,
    hanger_rail_d_500: null,
    hanger_rail_d_1000: null,
    hanger_golf_club_model: null,
    hanger_golf_Iron_club_model: null,
    hanger_golf_driver_club_model: null,
    rack_wooden_model: null,
    rack_glass_model: null,
    arrow_model: null,
    modelGroup: null,
    support_base_middle: null,
    support_base_side: null,
    previousData: null,
    selectedGroup: null,
    removeIcon: null,
};
// Names for different frame parts 'Model_600', 'Model_900', 'Model_661', 'Model_1061',
export let allGroupNames = ['main_model'];
export let allModelNames = ['Model_661', 'Model_1061', 'Model_1200', 'Model_1500', 'Model_2000', 'Model_3000'];
export let allOtherModelNames = ['Other_Model_661', 'Other_Model_1061', 'Other_Model_1200', 'Other_Model_1500', 'Other_Model_2000', 'Other_Model_3000'];
export let frameTop1Names = ['Header_Graphic1-Mat', 'Header_Graphic2-Mat'];
export let headerNames = ['Header_300', 'Header_500', 'Header_500_2'];
export let frameMainNames = ['Cube1-Mat', 'Cube2-Mat'];
export let allFrameBorderNames = ['Header_Frame', 'Top_Ex', "Top_Ex-Frame", 'Bottom_Ex', 'Left_Ex', 'Right_Ex', 'Left_Ex_Slotted', 'Right_Ex_Slotted', 'Left_Ex_Slotted-Frame', 'Right_Ex_Slotted-Frame'];
export let baseFrameNames = ["Base_Flat", "Base_Solid", "Base_Support_Sides"];
export let baseFrameTextureNames = ['Base_Option.1', 'Base_Option.2'];
export let rodFrameTextureNames = ['Rod'];
export let heightMeasurementNames = ['Header_300', 'Header_500', 'Header_500_2', 'Left_Ex', 'Right_Ex', 'Left_Ex_Slotted', 'Right_Ex_Slotted', 'Base_Flat', 'Base_Solid', 'Header_Wooden_Shelf', 'Header_Glass_Shelf', 'Rod', 'Glass_Shelf_Fixing'];
export let hangerNames = ['Hanger_Rail_Step', 'Hanger_Rail_Single', 'Hanger_Rail_D_500mm', 'Hanger_Rail_D_1000mm', 'Hanger_Golf_Club_Iron', 'Hanger_Golf_Club_Driver'];
export let hangerPartNames = ['Hanger_Stand', 'Hanger_Clubs', 'Hanger_Faceplate', 'Clothing', 'Clothing-Fixture_Material', 'Clothing-Mat', 'Clothing-Shirt_Colour'];
export let rackNames = ['RackWoodenShelf', 'RackGlassShelf'];
export let rackPartNames = ['Rack_Wooden_Shelf', 'Rack_Glass_Shelf', 'Rack_Stand_LH', 'Rack_Stand_RH', 'Rack_Glass_Shelf'];
export let golfClubNames = ["Hanger_Golf_Club_Iron", "Hanger_Golf_Club_Driver"];
export let hangerStandBaseNodes = ['Top_Ex'];
export let allGroupModelName = ['main_model'];

export let allGroups = [];
export const lights = [];
export const lightHelpers = [];

export let allGroupNames = ["main_model"];
export let allModelNames = [
    "Model_610",
    "Model_1010",
    // "Model_1210",
    // "Model_1510",
    // "Model_2010",
    // "Model_3010",
];
export let allOtherModelNames = [
    // "Other_Model_661",
    // "Other_Model_1061",
    // "Other_Model_1200",
    // "Other_Model_1500",
    // "Other_Model_2000",
    // "Other_Model_3000",
];
export let frameTop1Names = ["Header_Graphic1-Mat", "Header_Graphic2-Mat"];
export let headerNames = ["Header_300", "Header_500", "Header_500_2"];
export let frameMainNames = ["Cube1-Mat", "Cube2-Mat"];
export let allFrameBorderNames = [
    "Header_Frame",
    "Top_Ex",
    "Top_Ex-Frame",
    "Bottom_Ex",
    "Left_Ex",
    "Right_Ex",
    "Left_Ex_Slotted",
    "Right_Ex_Slotted",
    "Left_Ex_Slotted-Frame",
    "Right_Ex_Slotted-Frame",
];
export let baseFrameNames = ["Base_Flat", "Base_Solid", "Base_Support_Sides"];
export let baseFrameTextureNames = ["Base_Option.1", "Base_Option.2"];
export let rodFrameTextureNames = ["Rod"];
export let heightMeasurementNames = [
    "Header_300",
    "Header_500",
    "Header_500_2",
    "Left_Ex",
    "Right_Ex",
    "Left_Ex_Slotted",
    "Right_Ex_Slotted",
    "Base_Flat",
    "Base_Solid",
    "Header_Wooden_Shelf",
    "Header_Glass_Shelf",
    "Rod",
    "Glass_Shelf_Fixing",
];
export let hangerNames = [
    "Hanger_Rail_Step",
    "Hanger_Rail_Single",
    "Hanger_Rail_D_500mm",
    "Hanger_Rail_D_1000mm",
    "Hanger_Golf_Club_Iron",
    "Hanger_Golf_Club_Driver",
];
export let hangerPartNames = [
    "Hanger_Stand",
    "Hanger_StandX",
    "Hanger_ClubsX",
    "Hanger_FaceplateX",
    "Clothing",
    "Clothing-Fixture_Material",
    "Clothing-Mat",
    "Clothing-Shirt_Colour",
];
export let rackNames = ["RackWoodenShelf", "RackGlassShelf"];
export let rackPartNames = [
    "Rack_Wooden_Shelf",
    "Rack_Glass_Shelf",
    "Rack_Stand_LH",
    "Rack_Stand_RH",
    "Rack_Glass_Shelf",
];
export let golfClubNames = ["Hanger_Golf_Club_Iron", "Hanger_Golf_Club_Driver"];
export let hangerStandBaseNodes = ["Top_Ex"];
export let allGroupModelName = ["main_model"];

export let modelQueue = [
    // "Model_610.glb",
    "Model_1010.glb",
    // "Model_1200.glb",
    // "Model_1500.glb",
    // "Model_2000.glb",
    // "Model_3000.glb",
    // "Hanger_Rail_Step.glb",
    // "Hanger_Rail_Single.glb",
    // "Hanger_Rail_D_500mm.glb",
    // "Hanger_Rail_D_1000mm.glb",
    // "hanger_golf_club_model.glb",
    // "hanger_golf_driver_club_model.glb",
    // "hanger_golf_Iron_club_model.glb",
    // "rack_glass_model.glb",
    // "rack_wooden_model.glb",
    // "arrow_model.glb",
    // "header_rod_model.glb",
    // "header_glass_shelf_fixing_model.glb",
    // "header_500_height_model.glb",
    // "header_wooden_shelf_model.glb",
    // "header_glass_shelf_model.glb",
    // "slotted_sides_model.glb",
    // "support_base_middle.glb",
    // "support_base_sides.glb",
    // "removeIcon.glb",
];

// Parameters for Three.js configuration
export let params = {
    frameBorderColor: "0xffffff",
    rodFrameColor: "0xffffff",
    baseFrameColor: "0xffffff",
    topFrameBackgroundColor: "0xffffff",
    mainFrameBackgroundColor: "0xffffff",
    defaultShelfColor: "0xffffff",
    defaultHangerStandColor: "0xffffff",
    defaultRackShelfStandColor: "0xffffff",
    defaultRackStandStandColor: "0xffffff",
    defaultClothingColor: "0x888888", // 0x888888
    defaultRackColor: "0xffffff",
    measurementLineColor: 0x000000,
    measurementTextColor: 0xffffff,
    frameMaterialType: "color",
    shelfMaterialType: "color",
    exposure: 0.5,
    blurriness: 0.5,
    toneMapping: "AgX",
    selectedBaseFrame: baseFrameNames[1],
    defaultModel: allModelNames[0],
    fileUploadFlag: "",
    headerOptions: "SEG",
    cameraPosition: 800,
    defaultHeaderSize: headerNames[0],
    topOption: "Header", // we can set Header, Shelf, None
    headerRodToggle: false,
    defaultShelfType: "Header_Glass_Shelf", // Header_Wooden_Shelf, Header_Glass_Shelf
    rodSize: { x: 0, y: 0, z: 0 },
    glassShelfFixingSize: { x: 0, y: 0, z: 0 },
    calculateBoundingBox: {},
    headerUpDown: false,
    measurementToggle: false,
    measurementLineDistance: 100,
    measurementLineLength: 5,
    measurementLineHeight: 40,
    slottedSidesToggle: false,
    fontSize: 32,
    hangerClothesToggle: true,
    hangerGolfClubsToggle: true,
    frameTopExMargin: 20,
    moveLeftRight: 10,
    font: null,
    lastInnerMaterial: {},
    selectedGroupName: allGroupNames[0],
    addedVisibleModelName: allModelNames[0],
    hangerCount: {},
    hangerAdded: {},
    rackCount: {},
    rackAdded: {},
    previousRodToggle: false,
    spacing:0,
};

export let setting = {};

setting[params.selectedGroupName] = { ...params };
// This removes the key from params
delete setting[params.selectedGroupName]["rodSize"];
delete setting[params.selectedGroupName]["glassShelfFixingSize"];
delete setting[params.selectedGroupName]["calculateBoundingBox"];
delete setting[params.selectedGroupName]["lastInnerMaterial"];

// Generic update function
export async function updateVariable(varName, newValue) {
    switch (varName) {
        case "params":
            params = { ...params, ...newValue }; // Merge new parameters
            break;
        case "allGroupNames":
            allGroupNames = newValue; // Update directly
            break;
        case "allGroupModelName":
            allGroupModelName = newValue; // Update directly
            break;
        case "setting":
            setting = { ...setting, ...newValue }; // Merge new settings
            break;
        default:
            console.warn(`Variable "${varName}" not found.`);
    }
}
