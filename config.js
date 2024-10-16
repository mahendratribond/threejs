// Names for different frame parts 'Model_600', 'Model_900', 'Model_661', 'Model_1061', 
export const allGroupNames = ['main_model'];
export const allModelNames = ['Model_661', 'Model_1061', 'Model_1200', 'Model_1500', 'Model_2000', 'Model_3000'];
export const allOtherModelNames = ['Other_Model_661', 'Other_Model_1061', 'Other_Model_1200', 'Other_Model_1500', 'Other_Model_2000', 'Other_Model_3000'];
export const frameTop1Names = ['Header_Graphic1-Mat', 'Header_Graphic2-Mat'];
export const headerNames = ['Header_300', 'Header_500', 'Header_500_2'];
export const frameMainNames = ['Cube1-Mat', 'Cube2-Mat'];
export const allFrameBorderNames = ['Header_Frame', 'Top_Ex', "Top_Ex-Frame", 'Bottom_Ex', 'Left_Ex', 'Right_Ex', 'Left_Ex_Slotted', 'Right_Ex_Slotted', 'Left_Ex_Slotted-Frame', 'Right_Ex_Slotted-Frame'];
export const baseFrameNames = ['Base_Flat', 'Base_Solid'];
export const baseFrameTextureNames = ['Base_Option.1', 'Base_Option.2'];
export const rodFrameTextureNames = ['Rod'];
export const heightMeasurementNames = ['Header_300', 'Header_500', 'Header_500_2', 'Left_Ex', 'Right_Ex', 'Left_Ex_Slotted', 'Right_Ex_Slotted', 'Base_Flat', 'Base_Solid', 'Header_Wooden_Shelf', 'Header_Glass_Shelf', 'Rod', 'Glass_Shelf_Fixing'];
export const hangerNames = ['Hanger_Rail_Step', 'Hanger_Rail_Single', 'Hanger_Rail_D_500mm', 'Hanger_Rail_D_1000mm', 'Hanger_Golf_Club_Iron', 'Hanger_Golf_Club_Driver'];
export const hangerPartNames = ['Hanger_Stand', 'Hanger_Clubs', 'Hanger_Faceplate', 'Clothing', 'Clothing-Fixture_Material', 'Clothing-Mat', 'Clothing-Shirt_Colour'];
export const rackNames = ['RackWoodenShelf', 'RackGlassShelf'];
export const rackPartNames = ['Rack_Wooden_Shelf', 'Rack_Glass_Shelf', 'Rack_Stand_LH', 'Rack_Stand_RH', 'Rack_Glass_Shelf'];
export const golfClubNames = ["Hanger_Golf_Club_Iron", "Hanger_Golf_Club_Driver"];
export const hangerStandBaseNodes = ['Top_Ex'];
export const allGroupModelName = ['main_model'];


// Parameters for Three.js configuration
export const params = {
    allBorderColor: "0xffffff",
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
    exposure: 0.5,
    blurriness: 0.5,
    toneMapping: "AgX",
    selectedBaseFrame: baseFrameNames[1],
    defaultModel: allModelNames[0],
    fileUploadFlag: '',
    headerOptions: 'SEG',
    cameraPosition: 800,
    defaultHeaderSize: headerNames[0],
    topOption: 'Header', // we can set Header, Shelf, None
    headerRodToggle: false,
    defaultShelfType: 'Header_Glass_Shelf', // Header_Wooden_Shelf, Header_Glass_Shelf
    // isShelf: true,
    // isGlassShelf: true,
    rodSize: { x: 0, y: 0, z: 0 },
    glassShelfFixingSize: { x: 0, y: 0, z: 0 },
    calculateBoundingBox: {},
    headerUpDown: false,
    measurementToggle: false,
    measurementLineDistance: 100,
    measurementLineLength: 5,
    measurementLineHeight: 40,
    slottedSidesToggle: false,
    // isSlottedSides: true,
    fontSize: 32,
    hangerClothesToggle: true,
    hangerGolfClubsToggle: true,
    frameTopExMargin: 20,
    moveLeftRight: 10,
    font: null,
    lastInnerMaterial: {},
    // selectedModel: null,
    selectedGroupName: allGroupNames[0],
    addedVisibleModelName: allModelNames[0],
    // setting: {},
    // selectedModelBoxHelper: null,
    // selectedModelZAxis: 30,


};

export const setting = {}

setting[params.selectedGroupName] = { ...params };
// This removes the key from params
delete setting[params.selectedGroupName]['rodSize'];  
delete setting[params.selectedGroupName]['glassShelfFixingSize'];  
delete setting[params.selectedGroupName]['calculateBoundingBox'];  
delete setting[params.selectedGroupName]['lastInnerMaterial'];  
