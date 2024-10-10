<?php

include './config1.php';

$innerTexture = $_GET['innerTexture'] ?? 'default.jpg';
$borderTexture = $_GET['borderTexture'] ?? 'Light_Wood.jpg';
$numObjects = !empty($_GET['numObjects']) ? $_GET['numObjects'] : 1;
foreach ($singleStandDaeFiles as $key => $singleStandDaeFile) {
    $singleStandDaeFiles[$key]['fileName'] = generateFilename($key, $innerTexture, $borderTexture); // Using MD5 hash for unique file names
}


// pr($singleStandDaeFiles);
// die;
?>

<!DOCTYPE html>
<html>

<head>
    <title>DAE Viewer with Dynamic Textures</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.12/cropper.min.css" rel="stylesheet">
    <link href="style.css" rel="stylesheet">

</head>

<body>
    <div class="loader-wrapper">
        <div class="loader"></div>
    </div>
    <div id="container"></div>
    <div id="info" class="fs-5">
        <input type="hidden" id="numObjects" min="1" value="<?php echo !empty($numObjects) ? $numObjects : 1 ?>" placeholder="Number of Objects">
        <br>
        <table class="table table-sm table-borderless">
            <tr>
                <th class=""><label>Frame Texture</label></th>
                <td class="">
                    <select id="borderTextureDropdown" class="form-select form-select-sm applyTextures">
                        <option value="">Select Frame Texture</option>
                        <?php foreach ($borderImages as $img) {
                            $imgName = getFilename($img); // Get the filename without extension
                            $selected = ($borderTexture == $img) ? 'selected' : '';
                        ?>
                            <option value="<?= $img ?>" <?= $selected ?>><?= $imgName ?></option>";
                        <?php
                        }
                        ?>
                    </select>
                </td>
            </tr>
            <tr>
                <th class="">
                    <label>SEG Image</label>
                </th>
                <td class="">
                    <div class="file-upload-wrapper">
                        <input type="file" id="mainFrameFileUpload" accept="image/*" class="file-upload-input">
                        <label for="mainFrameFileUpload" class="file-upload-label">Upload SEG Image</label>
                    </div>
                    <select id="innerTextureDropdown" class="form-select form-select-sm applyTextures" style="display: none;">
                        <option value="">Select SEG Image</option>
                        <?php foreach ($innerImages as $img) {
                            $imgName = getFilename($img); // Get the filename without extension
                            $selected = ($innerTexture == $img) ? 'selected' : '';
                        ?>
                            <option value="<?= $img ?>" <?= $selected ?>><?= $imgName ?></option>";
                        <?php
                        }
                        ?>
                    </select>
                </td>
            </tr>
            <tr>
                <th class="">
                    <label>Header</label>
                </th>
                <td class="">
                    <select id="topSelector" class="form-select form-select-sm">
                        <option value="none">Select Header</option>
                        <option value="frame_top1" <?= $defaultTopFrame == 'frame_top1' ? 'selected' : '' ?>>Top Frame </option>
                    </select>
                </td>
            </tr>
            <tr>
                <th class="">
                    <label>Header Image</label>
                </th>
                <td class="">
                    <div class="file-upload-wrapper">
                        <input type="file" id="topFrameFileUpload" accept="image/*" class="file-upload-input">
                        <label for="topFrameFileUpload" class="file-upload-label">Upload Header Image</label>
                    </div>
                </td>
            </tr>
            <tr>
                <th class="">
                    <label>Base Type</label>
                </th>
                <td class="">
                    <select id="baseSelector" class="form-select form-select-sm">
                        <option value="none">Select Base Type</option>
                        <option value="frame_base1" <?= $defaultBaseFrame == 'frame_base1' ? 'selected' : '' ?>>Base Frame 1</option>
                        <option value="frame_base2" <?= $defaultBaseFrame == 'frame_base2' ? 'selected' : '' ?>>Base Frame 2</option>
                    </select>
                </td>
            </tr>
            <tr>
                <th class="">
                    <label>Base Color</label>
                </th>
                <td class="">
                    <select id="frameColorDropdown" class="form-select form-select-sm">
                        <option value="">Select Base Color</option>
                        <option value="white" <?= $defaultBaseFrameColor == 'white' ? 'selected' : '' ?>>White</option>
                        <option value="black" <?= $defaultBaseFrameColor == 'black' ? 'selected' : '' ?>>Black</option>
                        <option value="red" <?= $defaultBaseFrameColor == 'red' ? 'selected' : '' ?>>Red</option>
                    </select>
                </td>
            </tr>
        </table>

        <div id="cropper-container">
            <div class="cropper-popup">
                <div class="cropper-inner">
                    <span class="close-icon">&times;</span>
                    <img id="cropper-image" src="" alt="Image to crop">
                    <button id="crop-button" class="btn btn-outline-primary btn-sm mt-2">Crop</button>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.12/cropper.min.js"></script>

    <script type="importmap">
        {
            "imports": {
                "three": "./three/build/three.module.js",
                "three/addons/": "./three/examples/jsm/"
            }
        }
    </script>
    <script>
        const singleStandDaeFiles = <?php echo !empty($singleStandDaeFiles) ? json_encode($singleStandDaeFiles) : ''; ?>;
        const frameTop1Names = <?php echo !empty($frameTop1Names) ? json_encode($frameTop1Names) : ''; ?>;
        const frameMainNames = <?php echo !empty($frameMainNames) ? json_encode($frameMainNames) : ''; ?>;
        const allFrameBorderNames = <?php echo !empty($allFrameBorderNames) ? json_encode($allFrameBorderNames) : ''; ?>;
        let generatedDir = "<?php echo !empty($generatedDir) ? $generatedDir : ''; ?>";
        let defaultTopFrame = "<?php echo !empty($defaultTopFrame) ? $defaultTopFrame : ''; ?>";
        let innerTexture = "<?php echo !empty($innerTexture) ? $innerTexture : ''; ?>";
        let defaultBaseFrame = "<?php echo !empty($defaultBaseFrame) ? $defaultBaseFrame : ''; ?>";
    </script>
    <script type="module" src="./main.js"></script>
</body>

</html> 