// Import necessary scripts using importScripts
importScripts('/three'); // Ensure this path is correct
importScripts('/three/addons/loaders/ColladaLoader.js'); // Ensure this path is correct

self.onmessage = function(e) {
    const { filePaths } = e.data; // Get the array of file paths
    console.log('Received file paths in worker:', filePaths);

    if (!filePaths || !Array.isArray(filePaths)) {
        console.error("filePaths is not defined or is not an array");
        return;
    }

    const loadedModels = {}; // Object to hold the loaded models
    let loadedCount = 0;

    filePaths.forEach((file) => {   
        // Create a ColladaLoader instance for each file
        const loader = new ColladaLoader();

        // Log the loading process for debugging
        console.log(`Loading model: ${file.path} with variable name: ${file.variableName}`);

        loader.load(file.path, (collada) => {
            // Store the loaded model in the object with its variable name
            loadedModels[file.variableName] = collada.scene;
            loadedCount++;

            // Log each loaded model
            console.log(`Loaded model: ${file.variableName}`);

            // Check if all files are loaded
            if (loadedCount === filePaths.length) {
                // Post a message back to the main thread with all loaded models
                console.log('All models loaded. Posting data back to the main thread.');
                self.postMessage({
                    type: 'loaded',
                    data: loadedModels
                });
            }
        }, undefined, (error) => {
            console.error(`Error loading ${file.path}:`, error);
        });
    });
};
