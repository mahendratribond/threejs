<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        body {
            font-family: "MinionPro", sans-serif;
            font-family: "Gotham", sans-serif;
            font-family: "GothamBook", sans-serif;
        }
        .modelDesc tr:nth-child(odd) {
            background-color: white;
        }
        .modelDesc tr:nth-child(even) {
            background-color: #e6e7e8;
        }
        .modelDesc td{
            height:70px;
        }
        .headerTwoTd {
            padding-left: 152px;
            padding-top: 80px;
            letter-spacing: 2px;
        }

        .header-text {
            font-family: "Gotham", sans-serif;
            font-weight: bold;
            margin: 0;
        }

        .header-logo {
            font-size: 4.4rem;
            font-family: "GothamBook", sans-serif;
            font-weight: 100;
            margin-top: 0px;
        }

        .header-product {
            font-family: "GothamBook", sans-serif;
            font-weight: lighter;
            letter-spacing: 0px;
        }
        .thankYouPage{
            padding-top: 200px;
            padding-left: 152px;
        }
        .thankYouPage p{
            font-size:20px;
            letter-spacing:5px        
        }

    </style>
</head>
<body>
    <?php foreach($data['ModelImageName'] as $imageLink){ ?>
        <?php
            $trimmedPath = str_replace('./screenshots/', '', $imageLink);
            $parts = explode('-', $trimmedPath);
            if($parts[2] == "wholeModel"){
        ?> 
            <table style="width:100%;">
                <tr style="page-break-after: always;">
                    <td style="text-align: center; padding: 120px; width:300px;">
                        <img src="<?php echo $imageLink ?>" style="width:40%" height="500px">  
                    </td>
                </tr>
            </table>
            <pagebreak />
        <?php } ?>
    <?php } ?>
    <!-- page 2 end -->
    <?php $hangerData = $data['setting']['main_model']['hangerAdded'];?>
    <?php foreach ($data['group_names'] as $index => $groupName) { ?>
        <?php foreach ($data['setting'] as $key => $value) { 
            if($key == $groupName){ ?>
                <?php
                $html = '';
                foreach ($data['ModelData'] as $ModelMeasureValue) {
                    $modelGroupName = key($data['ModelData']);
                    if($modelGroupName == $key){
                        foreach ($ModelMeasureValue as $ModelMeasureData) {
                            $html = '
                            <tr>
                                <td>Model Specification: </td>
                                <td> '.$ModelMeasureData['width'].' x '.$ModelMeasureData['height'] .' x '.$ModelMeasureData['depth'].' </td>
                            </tr>
                            ';
                        }
                    }
                } 
                ?> 
                <table style="width:100%;"> 
                    <tr>
                        <td colspan="2">
                            <table width="100%">
                                <tr>
                                    <td style="padding:20px 0px 0px 40px;">
                                        <p style="font-size:16px; font-weight:bold">MODEL <?php echo $index + 1 ?>&nbsp; | <span style="font-weight:normal; letter-spacing:2px;">SPECIFICATION</span></p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td width="50%" style="padding: 130px;">
                            <?php foreach($data['ModelImageName'] as $imageLink){ ?>
                                <?php
                                    $trimmedPath = str_replace('./screenshots/', '', $imageLink);
                                    $parts = explode('-', $trimmedPath);
                                    if($parts[1] == $groupName && $parts[2] == "diagonal"){
                                ?> 
                                    <table style="width:100%;">
                                        <tr style="page-break-after: always;">
                                            <td style="text-align: center; width:300px;">
                                                <img src="<?php echo $imageLink ?>" style="width:40%" height="500px"> 
                                            </td>
                                        </tr>
                                    </table>
                                <?php } ?>
                            <?php } ?>
                        </td>
                        <td width="50%" style="padding:130px 70px 0px 90px; padding-top: 0px">
                            <table style="width:100%;">
                                <tr style="background-color:#e6e7e9;">
                                    <td colspan="2" style="height: 40px;"><?php echo $value['addedVisibleModelName'] ?></td>
                                </tr>
                                <tr style="background-color:#007b71; color:white">
                                    <td style="border-right:0.1px solid white; color:white; height: 40px;">COMPONENTS</td>
                                    <td style="color:white; height: 30px;">SIZE</td>
                                </tr>
                                <tr>
                                    <td colspan="2">
                                        <table class="modelDesc" style="width:100%;">
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
                                            <!-- <tr>
                                                <td>
                                                    <?php 
                                                    foreach($hangerData as $Hangerkey => $Hangervalue){
                                                        $parts = explode("-", $Hangerkey);
                                                    ?>
                                                    <table>
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
                                                                            <table>
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
                                                                            </table>
                                                                        <?php } ?>
                                                                    </td>
                                                                </tr>   
                                                            <?php } ?>
                                                        </tr>   
                                                    </table>
                                                    <?php } ?>
                                                </td>
                                            </tr> -->
                                            <!-- <tr>
                                                <td>
                                                    <?php 
                                                    $rackFront = false;
                                                    $rackBack = false;
                                                    foreach($value['rackCount'] as $Rackkey => $Rackvalue){
                                                        $Rackparts = explode("-", $Rackkey);
                                                    ?>
                                                        <table>
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
                                                        </table>
                                                    <?php } ?>
                                                </td>
                                            </tr> -->
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
                <pagebreak />
                <table width="1120px">
                    <tr>
                        <td colspan="2" width="100%">
                            <table width="100%">
                                <tr>
                                    <td style="padding:20px 0px 0px 40px;">
                                        <p style="font-weight:bold">MODEL <?php echo $index + 1 ?> &nbsp; | <span style="font-weight:normal; letter-spacing:2px;">DIMENSIONS</span></p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr style="background-color:green">
                        <!-- Front Elevation -->
                        <td style="width:560px; height:100%; vertical-align:middle; background-color:pink;">
                            <?php foreach($data['ModelImageName'] as $imageLink){ ?>
                                <?php
                                    $trimmedPath = str_replace('./screenshots/', '', $imageLink);
                                    $parts = explode('-', $trimmedPath);
                                    if($parts[1] == $groupName && $parts[2] == "front"){
                                ?> 
                                <table style="padding:0px; margin:auto; text-align:center; ">
                                    <tr>
                                        <td></td>
                                        <td style="padding-bottom: 10px; text-align:center;">
                                            <p>FRONT ELEVATION</p>
                                        </td>
                                    </tr>
                                    <tr>                                        
                                        <td style=" border-top: 1px solid black; border-bottom: 1px solid black;">
                                            <table>
                                                <tr>
                                                    <td style="border-right: 1px dashed black;  height:200px"></td>
                                                    <td style=" height:200px"></td>
                                                </tr>
                                                <tr>
                                                    <td colspan="2" style="text-align: center;">1600mm</td>
                                                </tr>
                                                <tr>
                                                    <td style="border-right: 1px dashed black;  height:200px"></td>
                                                    <td style=" height:200px"></td>
                                                </tr>
                                            </table>
                                        </td>
                                        <td style="">
                                            <img src="<?php echo $imageLink ?>" style="height:450px">
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style=""></td>
                                        <td style="text-align: center;">
                                            <table>
                                                <tr>
                                                    <td style="border-bottom: 1px dashed black;"></td>
                                                    <td rowspan="2" style="">1061mm</td>
                                                    <td style="border-bottom: 1px dashed black;"></td>
                                                </tr>
                                                <tr>
                                                    <td style=""></td>
                                                    <td style=""></td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                                <?php } ?>
                            <?php } ?>
                        </td>                        
                        <!-- Side Elevation -->
                        <td style="width:560px; vertical-align:middle; background-color:red">
                             <?php foreach($data['ModelImageName'] as $imageLink){ ?>
                                <?php
                                    $trimmedPath = str_replace('./screenshots/', '', $imageLink);
                                    $parts = explode('-', $trimmedPath);
                                    if($parts[1] == $groupName && $parts[2] == "side"){
                                ?> 
                                <table style="width:560px; padding:0px; margin:0px; text-align:center;">
                                    <tr>
                                        <td style="padding-bottom: 10px; text-align:center;">
                                            <p>SIDE ELEVATION</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="">
                                            <img src="<?php echo $imageLink ?>" style="max-height:40%">
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="text-align: center;">
                                            <table>
                                                <tr>
                                                    <td style="border-bottom: 1px dashed black;"></td>
                                                    <td rowspan="2" style="width: 20px;">750mm</td>
                                                    <td style="border-bottom: 1px dashed black;"></td>
                                                </tr>
                                                <tr>
                                                    <td style=""></td>
                                                    <td style=""></td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                                <?php } ?>
                            <?php } ?>
                        </td>
                    </tr>
                </table>
                <pagebreak />
            <?php } ?>
        <?php } ?> 
    <?php } ?>
    <table width="100%">
        <tr>
            <td class="thankYouPage">
                <p>THANK YOU</p>
            </td>
        </tr>
        <tr>
            <td class="headerTwoTd">
                <p style="font-size:1.1rem;"><b style="color:#00635a;">E: </b>sales@slatframe.com | <b style="color:#00635a;">W:</b> www.slatframe.com</p>
            </td>  
        </tr>
        <tr>
            <td style="padding:0px; margin:0px; padding: 100px 0px 0px 150px;">
                <p class="header-logo">
                    <span class="header-text">SLAT</span>FRAME
                </p>
                <p class="header-product" style="margin: 0;">PREMIUM | SUSTAINABLE | MODULAR | UPDATABLE</p>
            </td>
        </tr>
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