<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <?php $hangerData = $data['setting']['main_model']['hangerAdded'];?>
    <?php foreach ($data['group_names'] as $groupName) { ?>
        <?php foreach ($data['setting'] as $key => $value) { 
            if($key == $groupName){ ?>
                <?php
                $html = '';
                foreach ($data['ModelData'] as $ModleMeasureValue) {
                    $modelGroupName = key($data['ModelData']);
                    if($modelGroupName == $key){
                        foreach ($ModleMeasureValue as $ModleMeasureData) {
                            $html = '
                            <tr>
                                <td>Model Width: </td>
                                <td> '.$ModleMeasureData['width'].' </td>
                            </tr>
                            <tr>
                                <td>Model Height: </td>
                                <td>'.$ModleMeasureData['height'] .'</td>
                            </tr>
                            <tr>
                                <td>Model Depth: </td>
                                <td>'.$ModleMeasureData['depth'].' </td>
                            </tr>
                            ';
                        }
                    }
                } 
                ?> 
                <table>
                    <tr>
                        <td>Model Group Name: </td>
                        <td><?php echo $key ?></td>
                    </tr>
                    <tr>
                        <td>Model Name: </td>
                        <td><?php echo $value['addedVisibleModelName'] ?></td>
                    </tr>
                    <?php echo $html; ?>
                    <tr>
                        <td>Top Option: </td>
                        <td><?php echo $value['topOption'] ?></td>
                    </tr>
                    <?php if($value['topOption'] == "Shelf") {?>
                        <tr>
                            <td>Header Shelf Color: </td>
                            <td><?php echo $value['defaultShelfColor'] ?></td>
                        </tr>
                    <?php }else{ ?>
                        <tr>
                            <td>Header Rod Toggle: </td>
                            <td><?php echo $value['headerRodToggle'] && $value['headerRodToggle'] == 1 ? "true" : "false" ?></td>
                        </tr>
                    <?php } ?>
                    <tr>
                        <td>Header Options: </td>
                        <td><?php echo $value['headerOptions'] ?></td>
                    </tr>
                    <tr>
                        <td>Header Size: </td>
                        <td><?php echo $value['defaultHeaderSize'] ?></td>
                    </tr>
                    <tr>
                        <td>hanger Count: </td>
                        <td><?php echo count($value['hangerCount']) ?></td>
                    </tr>
                    <tr>
                        <td>
                            <?php 
                            foreach($hangerData as $Hangerkey => $Hangervalue){
                                $parts = explode("-", $Hangerkey);
                            ?>
                            <tr>
                                <?php if($parts[0] == $key) {?>
                                    <tr>
                                        <td>Hanger Name:</td>
                                        <td><?php echo $parts[3]; ?></td>
                                    </tr>   
                                    <tr>
                                        <td>Hanger Direction:</td>
                                        <td><?php echo $parts[2]; ?></td>
                                    </tr>   
                                    <tr>
                                        <td>
                                            <?php foreach($Hangervalue as $index => $positions){ ?>
                                                <tr>
                                                    <td>Hanger Position X:</td>
                                                    <td><?php echo $positions['x'] ?></td>
                                                </tr>
                                                <tr>
                                                    <td>Hanger Position Y:</td>
                                                    <td><?php echo $positions['y'] ?></td>
                                                </tr>
                                                <tr>
                                                    <td>Hanger Position Z:</td>
                                                    <td><?php echo $positions['z'] ?></td>
                                                </tr>
                                            <?php } ?>
                                        </td>
                                    </tr>   
                                <?php } ?>
                            </tr>   
                            <?php } ?>
                        </td>
                    </tr>
                    <tr>
                        <td>Slotted Sides Toggle: </td>
                        <td><?php echo $value['slottedSidesToggle'] && $value['slottedSidesToggle'] == 1 ? "true" : "false" ?></td>
                    </tr>
                    <?php if($value['topOption'] == "Shelf") {?>
                    <tr>
                        <td>Default Shelf Type: </td>
                        <td><?php echo $value['defaultShelfType'] ? $value['defaultShelfType'] : "NA" ?></td>
                    </tr>
                    <?php } ?> 
                    <tr>
                        <td>
                            <?php 
                            $rackFront = false;
                            $rackBack = false;
                            foreach($value['rackCount'] as $Rackkey => $Rackvalue){
                                $Rackparts = explode("-", $Rackkey);
                            ?>
                                <?php if(!$rackFront && $Rackparts[2] === "Front"){ ?>
                                    <tr>
                                        <td>Rack Direction:</td>
                                        <td>Front</td>
                                    </tr>   
                                <?php $rackFront = true; } ?>
                                <?php if(!$rackBack && $Rackparts[2] === "Back"){ ?>
                                    <tr>
                                        <td>Rack Direction:</td>
                                        <td>Back</td>
                                    </tr>   
                                <?php $rackBack = true; } ?>
                                <?php if($Rackparts[2] === "Front" && $Rackparts[3] ){ ?>
                                    <tr>
                                        <td>Rack Type:</td>
                                        <td><?php echo $Rackparts[3]; ?></td>
                                    </tr>   
                                <?php }else if($Rackparts[2] === "Back" && $Rackparts[3] ){ ?>
                                    <tr>
                                        <td>Rack Type:</td>
                                        <td><?php echo $Rackparts[3]; ?></td>
                                    </tr>   
                                <?php } ?>
                            <?php } ?>
                        </td>
                    </tr>
                    <tr>
                        <td>Rack Added: </td>
                        <td><?php echo $value['rackAdded'] ? $value['rackAdded'] : 0 ?></td>
                    </tr>
                    <tr>
                        <td>Base Frame: </td>
                        <td><?php echo $value['selectedBaseFrame'] ?></td>
                    </tr>
                    <tr>
                        <td>Base Frame Color: </td>
                        <td><?php echo $value['baseFrameColor'] ?></td>
                    </tr>
                    <tr>
                        <td>Frame Border Color: </td>
                        <td><?php echo $value['frameBorderColor'] ?></td>
                    </tr>
                    <tr>
                        <td>Main Frame Color: </td>
                        <td><?php echo $value['mainFrameBackgroundColor'] ?></td>
                    </tr>
                    <tr>
                        <td>----------------------------------------------------------------------------------</td>
                        <td>----------------------------------------------------------------------------------</td>
                    </tr> 
                </table>
            <?php } ?>
        <?php } ?> 
    <?php } ?>
    <table>
        <?php foreach($data['angleImages'] as $imageKey => $imageLink){ ?>
            <tr>
                <td>
                    <img src="<?php echo $imageLink ?>" width="500" height="350">        
                </td>
            </tr>
        <?php } ?>
    </table>
</body>
</html>

<?php 
// if($data['top_frame_croped_image']){
//     foreach ($data['top_frame_croped_image'] as $headerImageValue) {
//         $modelGroupName = key($data['top_frame_croped_image']);
//         // echo $modelGroupName;
//         if($value['selectedGroupName'] === $modelGroupName){
//             foreach ($headerImageValue as $headers) {
//                 if (is_array($headers) && !empty($headers)) {
//                     $folderName = key($headerImageValue);
//                     $SubfolderName = key($headers); // Get the first key
//                     $Base64Val = $headers[$SubfolderName]; // Retrieve the value by the first key
//                     break; // Exit loop once the first header is found
//                 }
//             }
//             // Remove the "data:image/png;base64," part if present
//             if (strpos($Base64Val, 'base64,') !== false) {
//                 $base64_string = explode('base64,', $Base64Val);
//             }
//             // Decode the base64 string
//             $image_data = base64_decode($base64_string[1]);
//             $path = "./imageData/" .$modelGroupName."/". $folderName; 
//             if (!is_dir($path)) {
//                 // Create the folder with appropriate permissions
//                 if (mkdir($path, 0755, true)) {
                    
//                 } else {
//                     echo "Failed to create folder.";
//                 }
//             }
//             $subPath = "./imageData/" .$modelGroupName."/". $folderName ."/".$SubfolderName; 
//             if (!is_dir($subPath)) {
//                 // Create the folder with appropriate permissions
//                 if (mkdir($subPath, 0755, true)) {
                    
//                 } else {
//                     echo "Failed to create folder.";
//                 }
//             }
//             // Specify the path where the image will be saved
//             $time = time();
//             $HeaderImageFilePath = $subPath."/".$time.'.png';
//             // Save the decoded data as an image file
//             if (file_put_contents($HeaderImageFilePath, $image_data)) {
                
//             } else {
//                 echo "Failed to save image.";
//             }
//         }
//     }
// }
?>
<?php
// if($data['main_frame_croped_image']){
//     foreach ($data['main_frame_croped_image'] as $mainImageValue) {
//         $modelGroupName = key($data['main_frame_croped_image']);
//         if($value['selectedGroupName'] === $modelGroupName){
//             foreach ($mainImageValue as $frameImage) {
//                 print_r($mainImageValue);
//                 if (is_array($frameImage) && !empty($frameImage)) {
//                     $mainFolderName = key($mainImageValue);
//                     $mianSubfolderName = key($frameImage); // Get the first key
//                     $MainBase64Val = $frameImage; // Retrieve the value by the first key
//                     break; // Exit loop once the first header is found
//                 }
//             }
//             // echo $mainFolderName ."<br>";
//             // echo $mianSubfolderName ."<br>";
//             // echo $MainBase64Val ."<br>";
//             break;
//             // Remove the "data:image/png;base64," part if present
//             if (strpos($MainBase64Val, 'base64,') !== false) {
//                 $mainBase64_string = explode('base64,', $MainBase64Val);
//             }
//             // Decode the base64 string
//             $image_data = base64_decode($mainBase64_string[1]);
//             $path = "./imageData/" .$modelGroupName."/". $mainFolderName; 
//             if (!is_dir($path)) {
//                 // Create the folder with appropriate permissions
//                 if (mkdir($path, 0755, true)) {
                    
//                 } else {
//                     echo "Failed to create folder.";
//                 }
//             }
//             $subPath = "./imageData/" .$modelGroupName."/". $mainFolderName ."/".$mianSubfolderName; 
//             if (!is_dir($subPath)) {
//                 // Create the folder with appropriate permissions
//                 if (mkdir($subPath, 0755, true)) {
                    
//                 } else {
//                     echo "Failed to create folder.";
//                 }
//             }
//             // Specify the path where the image will be saved
//             $time = time();
//             $mainImageFilePath = $subPath."/".$time.'.png';
//             // Save the decoded data as an image file
//             if (file_put_contents($mainImageFilePath, $image_data)) {
                
//             } else {
//                 echo "Failed to save image.";
//             }
//         }
//     }
// }
?>