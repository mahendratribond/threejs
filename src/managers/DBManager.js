export async function saveModelData(name, dataToSave, modelId = 0) {
    // const model_data = dataToSave;
    dataToSave["action"] = "save_model_data";
    dataToSave["id"] = modelId || 0;
    dataToSave["name"] = name;

    const model_data = JSON.stringify(dataToSave);
    // console.log('model_data', model_data);

    fetch("api.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: model_data,
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                alert("Model data saved successfully!");
            } else {
                alert("Error saving model data:", data.error);
            }
        })
        .catch((error) => console.error("Fetch error:", error));
}

export async function getModelData(id) {
    try {
        // Send model state to the backend
        const response = await fetch("api.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ action: "get_model_data", id: id }), // Ensure data is stringified
        });

        const data = await response.json(); // Wait for the JSON response

        if (data.success) {
            console.log("Model fetch successfully!");
            return data.data; // Return the fetched data
        } else {
            console.error("No data found:");
            window.location.href = "test6.html";
            return null; // Return null if no data is found
        }
    } catch (error) {
        console.error("Fetch error:", error);
        return null; // Return null on error
    }
}