// this code is from main6
async function exportModel(model, name) {
    model.position.set(0, 0, 0);
    model.updateMatrixWorld();
    const gltfExporter = new GLTFExporter();
    const result = await gltfExporter.parseAsync(model, { binary: true });
    const blob = new Blob([result], { type: "application/octet-stream" });
    const modellink = document.createElement("a");
    modellink.href = URL.createObjectURL(blob);
    modellink.download = name;
    modellink.click();
}

// this code is from hangermanager
export async function setupHangerModel(model) {
    if (model) {
        model = await updateModelName(
            model,
            "__Hanger_Rail_Step",
            "Hanger_Rail_Step"
        );
        model = await updateModelName(
            model,
            "__Hanger_Rail_Single",
            "Hanger_Rail_Single"
        );

        model = await updateModelName(model, "Hanger_Stand_", "Hanger_Stand");
        model = await updateModelName(
            model,
            "Hanger_Stand-Fixture_Material_",
            "Hanger_Stand-Arm_Metal"
        );

        model = await updateModelName(model, "Clothing_", "Clothing");
        model = await updateModelName(model, "Clothing-Mat2", "Clothing-Mat");
        model = await updateModelName(model, "Clothing-Mat1_", "Clothing-Mat");
        model = await updateModelName(model, "Clothing-Mat2_", "Clothing-Mat");
        model = await updateModelName(
            model,
            "Clothing-Shirt_Colour_",
            "Clothing-Shirt_Colour"
        );
        model.traverse(async function (child) {
            if (
                child.material &&
                ["Clothing-Shirt_Colour"].includes(child.name)
            ) {
                // const material = await clothsMaterial(parseInt(params.defaultClothingColor, 16))
                // child.material = material
                // child.material.needsUpdate = true;
                child.material.color.set(
                    await getHex(params.defaultClothingColor)
                );
                child.material.needsUpdate = true;
            }
            if (
                child.material &&
                [
                    "Hanger_Stand",
                    "Hanger_Stand-Arm_Metal",
                    "Hanger_Stand-Fixture_Material",
                ].includes(child.name)
            ) {
                const material = await commonMaterial(
                    parseInt(params.defaultHangerStandColor, 16)
                );
                child.material = material;
                child.material.needsUpdate = true;
            }
        });

        // console.log('model', model)
    }
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
                    "Hanger_Stand",
                    "Hanger_Stand-Arm_Metal",
                    "Hanger_Stand-Arm_Rubber",
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
            } else if (
                child.material &&
                ["Hanger_Clubs"].includes(child.name)
            ) {
                // const material = await commonMaterial(parseInt('0x444444', 16))
                // child.material = material
                // child.material.needsUpdate = true;
            } else if (
                child.material &&
                ["Hanger_Faceplate"].includes(child.name)
            ) {
                // const material = await commonMaterial(parseInt('0x444444', 16))
                // child.material = material
                // child.material.needsUpdate = true;
            } else {
                // const material = await commonMaterial(parseInt(params.defaultHangerStandColor, 16))
                // child.material = material
                // child.material.needsUpdate = true;
            }
        });
    }
}
