<?php

$debug_mode = false;
$defaultBaseFrame = 'frame_base2';
$defaultTopFrame = 'frame_top1';
$defaultBaseFrameColor = 'black';
$modelFileExtension = 'dae';
$numObjects = 1;

$borderName = $innerName = $fileName = '';
$singleStandDaeFiles = [
    'frameMain' => [
        'file_name' => "frame_main." . $modelFileExtension,
        'border_image' => "ID3",
        'inner_image' => "ID8",
        // 'border_image' => "ID5",
        // 'inner_image' => "ID10",
    ],
    'frameTop1' => [
        'file_name' => "frame_top." . $modelFileExtension,
        'border_image' => "ID5",
        'inner_image' => "ID10",
    ],
    'frameBase1' => [
        'file_name' => "frame_base1." . $modelFileExtension,
        'border_image' => "ID3",
        'inner_image' => "",
    ],
    'frameBase2' => [
        'file_name' => "frame_base2." . $modelFileExtension,
        'border_image' => "ID3",
        'inner_image' => "",
    ],
];

$innerImages = ["default.jpg", "tree1.jpeg", "sunset.jpeg", "sunset2.webp", "mount.jpeg", "trees.jpg", "adidas.jpg"];
$borderImages = ["Light_Wood.jpg", "Red_Cherry_Wood.jpg", "Lighter_Wood.jpg", "Dark_Wood.jpg"];
$borderColors = ["white" => "White", "black" => "Black"];
$baseFrameColors = ["white" => "White", "black" => "Black"];

$frameTop1Names = ['_600_Header_Graphic', '_600_Header_Graphic.1'];
$frameMainNames = ['_600SEG_Graphic.1', '_600_SEG_Graphic'];
$allFrameBorderNames = ['_600_Header_Frame', 'Left_Profile', 'Right_Profile', 'Lower_Profile', 'Top_Profile', 'Base_150_Flat', 'Base_Option_1'];
$generatedDir = '/assets/models/generated/';

$frameSizes = ['600', '900', '1200', '1500', '2000', '3000'];


// $allNodes = array_merge($topNode, $mainNodeBorder, $mainNodeInner, $baseNode);
// $mainFrame = $mainNodeInner;
// $woodFrame = array_merge($mainNodeBorder, $baseNode);


function pr($arr)
{
    echo '<pre>';
    print_r($arr);
    echo '</pre>';
}

function getFilename($name)
{
    $imgName = pathinfo($name, PATHINFO_FILENAME);
    $imgName = str_replace(['-', '_'], ' ', $imgName);

    return $imgName;
}
function getFilenameWithDelimiter($name)
{
    $imgName = pathinfo($name, PATHINFO_FILENAME);
    $imgName = str_replace(['-', ' '], '_', $imgName);

    return $imgName;
}

function generateFilename($key, $frameSize, $innerImage, $borderImage)
{
    global $modelFileExtension;
    return $key . '_' . $frameSize . '_' . getFilenameWithDelimiter($innerImage) . '_' . getFilenameWithDelimiter($borderImage) . '.' . $modelFileExtension;
    // return md5($key . $innerImage . $borderImage) . '.dae';
}

// Handle the generation of the .dae file if query parameters are present


function generateAllDaeFiles($generatedDir, $singleStandDaeFiles, $innerImages, $borderImages)
{
    global $debug_mode;
    global $frameSizes;
    // Ensure the output directory exists
    $outputDir = __DIR__ . $generatedDir;
    if (!is_dir($outputDir)) {
        mkdir($outputDir, 0755, true);
    }

    foreach ($singleStandDaeFiles as $key => $singleStandDaeFile) {
        $border_image = $inner_image = '';
        if (!empty($singleStandDaeFile['border_image'])) {
            $border_image = $singleStandDaeFile['border_image'];
        }
        if (!empty($singleStandDaeFile['inner_image'])) {
            $inner_image = $singleStandDaeFile['inner_image'];
        }

        foreach ($frameSizes as $frameSize) {
            $texture = 'texture' . $frameSize . '/' ;
            $originalDaePath = __DIR__ . '/assets/models/' . $texture . $singleStandDaeFile['file_name'];

            // Check if the original .dae file exists
            if (file_exists($originalDaePath)) {
                foreach ($innerImages as $innerKey => $innerImage) {
                    foreach ($borderImages as $borderKey => $borderImage) {

                        $fileName = generateFilename($key, $frameSize, $innerImage, $borderImage); // Using MD5 hash for unique file names

                        // Paths to the original and modified .dae files
                        $outputDaePath = __DIR__ .  $generatedDir . $fileName;

                        // Check if the modified .dae file not exists
                        if (!file_exists($outputDaePath) || $debug_mode) {
                            // Read the original .dae file
                            $daeContent = file_get_contents($originalDaePath);

                            // echo '<br>';
                            // echo '<br>fileName: ' . $fileName;


                            // Replace texture paths
                            if (!empty($inner_image) && $key == 'frameTop1') {
                                // echo '<br>inner_image frameTop1: ' . $inner_image;
                                $innerTexturePath = "../../images/inner-images/Logo_Test.jpg";
                                $daeContent = preg_replace('/<image id="' . $inner_image . '">.*?<init_from>.*?<\/init_from>.*?<\/image>/s', '<image id="' . $inner_image . '"><init_from>' . $innerTexturePath . '</init_from></image>', $daeContent);
                            } elseif (!empty($inner_image)) {
                                // echo '<br>inner_image: ' . $inner_image;
                                $innerTexturePath = "../../images/inner-images/" . $innerImage;
                                $daeContent = preg_replace('/<image id="' . $inner_image . '">.*?<init_from>.*?<\/init_from>.*?<\/image>/s', '<image id="' . $inner_image . '"><init_from>' . $innerTexturePath . '</init_from></image>', $daeContent);
                            }

                            if (!empty($border_image)) {
                                // echo '<br>border_image: ' . $border_image;
                                $borderTexturePath = "../../images/borders/" . $borderImage;
                                $daeContent = preg_replace('/<image id="' . $border_image . '">.*?<init_from>.*?<\/init_from>.*?<\/image>/s', '<image id="' . $border_image . '"><init_from>' . $borderTexturePath . '</init_from></image>', $daeContent);
                            }
                            // Write the modified .dae file
                            file_put_contents($outputDaePath, $daeContent);
                        }
                    }
                }
            }
        }
    }
}

generateAllDaeFiles($generatedDir, $singleStandDaeFiles, $innerImages, $borderImages);


// echo die;