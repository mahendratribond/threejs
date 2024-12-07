import * as THREE from "three";
import {
  params,
  setting,
  frameMainNames,
  frameTop1Names,
} from "../../config.js";
import { getHex } from "../../utils6.js";
import { UIManager } from "./UIManager.js";

export async function setMainFrameCropedImage(
  mainFrameCropedImage,
  modelGroup
) {
  let selectedGroupName = params.selectedGroupName;
  let defaultModel = setting[selectedGroupName].defaultModel;
  const uiManager = new UIManager();
  if (
    mainFrameCropedImage &&
    mainFrameCropedImage[selectedGroupName] &&
    mainFrameCropedImage[selectedGroupName][defaultModel]
  ) {
    let main_model = modelGroup.getObjectByName(selectedGroupName);
    main_model.traverse(async function (child) {
      if (frameMainNames.includes(child.name)) {
        child.material = child.material.clone();
        child.material.color.set(await getHex(params.mainFrameBackgroundColor));
        child.material.needsUpdate = true;
      }
    });
    const mainFrameBackgroundColor = await getHex(
      setting[selectedGroupName].mainFrameBackgroundColor
    );
    const tempCanvas = document.createElement("canvas");
    const ctx = tempCanvas.getContext("2d");

    // Create a new image element
    const img = new Image();
    img.src = mainFrameCropedImage[selectedGroupName][defaultModel]; // Assign the base64 string to the image's src

    // Wait for the image to load
    img.onload = function () {
      // Set canvas dimensions to match the image dimensions
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;

      // Draw the background color
      ctx.fillStyle = mainFrameBackgroundColor;
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      // Draw the cropped image on top
      ctx.drawImage(img, 0, 0);

      // Convert the canvas to a blob and create a texture from it
      tempCanvas.toBlob(async (blob) => {
        const url = URL.createObjectURL(blob);
        const texture = new THREE.TextureLoader().load(url, async function () {
          await updateMainFrameImageTexture(
            texture,
            modelGroup,
            selectedGroupName,
            defaultModel
          );
        });
        await uiManager.closeCropper();
      });
    };
    // console.log(mainFrameCropedImage);
    // console.log(mainFrameCropedImage[selectedGroupName][defaultModel]);
    // console.log(params.selectedGroupName);
    // Handle any errors during image loading
    img.onerror = function (err) {
      console.error("Image loading failed", err);
    };
  } else {
    if (modelGroup !== undefined) {
      const mainFrameBackgroundColor = await getHex(
        setting[selectedGroupName].mainFrameBackgroundColor
      );
      let main_model = modelGroup.getObjectByName(selectedGroupName);
      main_model.traverse(async function (child) {
        if (frameMainNames.includes(child.name)) {
          child.material = child.material.clone();
          child.material.color.set(mainFrameBackgroundColor);
          child.material.needsUpdate = true;
        }
      });
    }
  }
}

export async function setTopFrameCropedImage(topFrameCropedImage, modelGroup) {
  const uiManager = new UIManager();
  let selectedGroupName = params.selectedGroupName;
  let defaultModel = setting[selectedGroupName].defaultModel;
  let defaultHeaderSize = setting[params.selectedGroupName].defaultHeaderSize;
  if (
    topFrameCropedImage &&
    topFrameCropedImage[selectedGroupName] &&
    topFrameCropedImage[selectedGroupName][defaultModel] &&
    topFrameCropedImage[selectedGroupName][defaultModel][defaultHeaderSize]
  ) {
    let main_model = modelGroup.getObjectByName(selectedGroupName);
    main_model.traverse(async function (child) {
      if (frameTop1Names.includes(child.name)) {
        child.material = child.material.clone();
        child.material.color.set(await getHex(params.topFrameBackgroundColor));
        child.material.needsUpdate = true;
      }
    });
    
    const topFrameBackgroundColor = await getHex(
      setting[selectedGroupName].topFrameBackgroundColor
    );
    // console.log("here", topFrameBackgroundColor);
    
    const tempCanvas = document.createElement("canvas");
    const ctx = tempCanvas.getContext("2d");

    // Create a new image element
    const img = new Image();
    img.src =
      topFrameCropedImage[selectedGroupName][defaultModel][defaultHeaderSize]; // Assign the base64 string to the image's src

    // Wait for the image to load
    img.onload = function () {
      // Set canvas dimensions to match the image dimensions
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;

      // Draw the background color
      ctx.fillStyle = topFrameBackgroundColor;
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      // Draw the cropped image on top
      ctx.drawImage(img, 0, 0);

      // Convert the canvas to a blob and create a texture from it
      tempCanvas.toBlob(async (blob) => {
        const url = URL.createObjectURL(blob);
        const texture = new THREE.TextureLoader().load(url, async function () {
          await updateTopFrameImageTexture(
            texture,
            modelGroup,
            selectedGroupName,
            defaultModel,
            defaultHeaderSize
          );
        });
        await uiManager.closeCropper();
      });
    };

    // Handle any errors during image loading
    img.onerror = function (err) {
      console.error("Image loading failed", err);
    };
  } else {
    if (modelGroup !== undefined) {
      const topFrameBackgroundColor = await getHex(
        setting[selectedGroupName].topFrameBackgroundColor
      );
      console.log("ffff", topFrameBackgroundColor);
      let main_model = modelGroup.getObjectByName(selectedGroupName);
      main_model.traverse(async function (child) {
        if (frameTop1Names.includes(child.name)) {
          child.material = child.material.clone();
          child.material.color.set(topFrameBackgroundColor);
          child.material.needsUpdate = true;
        }
      });
    }
  }
}

async function updateMainFrameImageTexture(
  texture,
  modelGroup,
  selectedGroupName,
  defaultModel
) {
  //   let selectedGroupName = params.selectedGroupName;
  //   let defaultModel = setting[selectedGroupName].defaultModel;
  let main_model = modelGroup.getObjectByName(selectedGroupName);
  const currentModel = main_model.getObjectByName(defaultModel);
  const frame = currentModel.getObjectByName("Frame");
  if (frame) {
    frame.traverse(async function (child) {
      await setUploadedTexture(child, texture, frameMainNames);
    });
  }
}

async function updateTopFrameImageTexture(
  texture,
  modelGroup,
  selectedGroupName,
  defaultModel,
  defaultHeaderSize
) {
  //   let selectedGroupName = params.selectedGroupName;
  //   let defaultModel = setting[selectedGroupName].defaultModel;
  //   let defaultHeaderSize = setting[params.selectedGroupName].defaultHeaderSize;

  let main_model = modelGroup.getObjectByName(selectedGroupName);
  const currentModel = main_model.getObjectByName(defaultModel);
  // currentModel.traverse(function (modelNode) {
  const header = currentModel.getObjectByName(defaultHeaderSize);
  if (header) {
    header.traverse(async function (child) {
      await setUploadedTexture(child, texture, frameTop1Names);
    });
  }

  // });
}

async function setUploadedTexture(mesh, texture, frameNames) {
  texture = await setTextureParams(texture);
  texture.flipY = false;

  if (frameNames.includes(mesh.name)) {
    // Check if the mesh is a mesh
    if (mesh.isMesh) {
      var met = mesh.material.clone();
      met.map = texture;
      met.map.wrapS = THREE.RepeatWrapping;
      met.map.wrapT = THREE.RepeatWrapping;
      met.needsUpdate = true;

      mesh.material = met;
      mesh.needsUpdate = true;
    }
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

  return texture;
}
