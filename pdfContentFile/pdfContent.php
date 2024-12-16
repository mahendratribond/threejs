<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        /* body{
            background-color: #f0f0f0;
        } */
        .modelDesc tr:nth-child(odd):not(.notThis) {
            background-color: #e6e7e8;
        }
        .modelDesc tr:nth-child(even):not(.notThis) {
            background-color: white;
        }
        .modelDesc td{
            padding-left:8px;
            padding-top:8px;
            height:50px;
            font-size:9px;
            letter-spacing:1px;
            font-family:"gothambook";
            text-transform: uppercase;
        }
        .modelDesc td div:first-child{
            padding-bottom:5px;
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
            <table style="width:100%; padding-top: 110px;">
                <tr style="page-break-after: always;">
                    <!-- <td style="text-align: center;">
                        <img src="<?php echo $imageLink ?>" style=""> 
                    </td> -->
                    <td valign="middle" align="center" height="520" style="">
                        <img src="<?php echo $imageLink ?>" style="display:block; max-height:510px; height:auto; ">
                    </td>
                </tr>
            </table>
            <pagebreak />
        <?php } ?>
    <?php } ?>
    <!-- page 2 end -->
    <?php foreach ($data['group_names'] as $index => $groupName) { ?>
        <?php foreach ($data['setting'] as $key => $value) { 
            if($key == $groupName){ 
                $ModelMeasureArr = [];
                $HangerArr = [];
                if (isset($data['params']) && isset($data['params']['hangerAdded'])) {
                    foreach($data['params']['hangerAdded'] as $hangerKey => $hangerVal){
                        $hangerPartkey = explode('-',$hangerKey);
                        if($hangerPartkey[0] == $groupName){
                            $HangerArr[] = $hangerPartkey[3];    
                        }
                    }
                }
                foreach ($data['ModelData'] as $modelKey => $ModelMeasureValue) {
                    if($modelKey == $key){
                        foreach ($ModelMeasureValue as $submodelkey => $subModelMeasureData) {
                            foreach($subModelMeasureData as $measureKey => $ModelMeasure){
                                $ModelMeasureArr[$measureKey] = $ModelMeasure;
                            }
                        }
                    }
                } 
                // echo "heres a data"; echo "<pre>"; print_r($ModelMeasureArr);
                // die;
                ?> 
                <table style="width:100%; table-layout: fixed;"> 
                    <tr>
                        <td colspan="2">
                            <table width="100%">
                                <tr>
                                    <td style="padding:18px 0px 0px 32px;">
                                        <p style="font-size:13.5px; font-family:gotham; font-weight:bold; letter-spacing:1px;">MODEL <?php echo $index + 1 ?>&nbsp;| <span style="font-family:gothambook; letter-spacing:1px; font-weight:normal;">SPECIFICATION</span></p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td width="55%" style="padding-top: 50px;">
                            <?php foreach($data['ModelImageName'] as $imageLink){ ?>
                                <?php
                                    $trimmedPath = str_replace('./screenshots/', '', $imageLink);
                                    $parts = explode('-', $trimmedPath);
                                    if($parts[1] == $groupName && $parts[2] == "diagonal"){
                                ?> 
                                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                                    <tr>
                                        <td valign="middle" align="center" height="520" style="">
                                            <img src="<?php echo $imageLink ?>" style="display:block; max-width:500px; max-height:510px; width:auto; height:auto; ">
                                        </td>
                                    </tr>
                                </table>         
                                <?php } ?>
                            <?php } ?>
                        </td>
                        <td width="45%" style="padding:130px 70px 0px 90px; padding-top: 0px;">
                            <table style="width:100%;">
                                <tr style="background-color:#e6e7e9;">
                                    <td colspan="2" style="height: 40px; padding-left:10px; font-family:gotham; font-weight:bold; letter-spacing:2px;">MODEL <?php echo $index + 1 ?></td>
                                </tr>
                                <tr>
                                    <td colspan="2" style="padding:0px; margin:0px;">
                                        <table class="modelDesc" style="width:100%; vertical-align:top;">
                                            <tr class="notThis" style="background-color:#007b71;">
                                                <td style="width:50%; padding-left:8px; border-right:0.1px solid white; font-size:9px; font-family:gotham; font-weight:bold; color:white; height: 30px; letter-spacing:2px;">COMPONENTS</td>
                                                <td style="width:50%; padding-left:8px; color:white; height: 30px;font-size:9px; font-family:gotham; font-weight:bold; letter-spacing:2px;">SIZE</td>
                                            </tr>
                                            <!-- <tr>
                                                <td style="width:50%;">Model Specification: </td>
                                                <td style="width:50%;"><?php echo $ModelMeasureArr['modelMeasure']['width'].' x '.$ModelMeasureArr['modelMeasure']['height'].' x '.$ModelMeasureArr['modelMeasure']['depth'] ?></td>
                                            </tr> -->
                                            <?php 
                                                if(!empty($ModelMeasureArr['Header_Frame'])){
                                            ?>
                                            <tr>
                                                <td style="width:50%;">
                                                    <div>
                                                        <p style="font-family:gothambook; font-weight:bold;">HEADER FRAME</p>
                                                    </div>
                                                    <div>
                                                        <p>ALUMINIUM POWDER COATED</p>
                                                    </div> 
                                                </td>
                                                <td style="width:50%;">
                                                    <?php echo $ModelMeasureArr['Header_Frame']['x'].'mm x '.$ModelMeasureArr['Header_Frame']['y'].'mm x '.$ModelMeasureArr['Header_Frame']['z'].'mm'; ?>
                                                </td>
                                            </tr>
                                            <?php } ?>
                                            <?php 
                                                if(!empty($ModelMeasureArr['Header_Graphic1-Mat'])){
                                            ?>
                                            <tr>
                                                <td>
                                                    <div>
                                                        <p style="font-family:gothambook; font-weight:bold;">SEG HEADER GRAPHIC</p>
                                                    </div>
                                                    <div>
                                                        <p>REPLACEABLE PRINTED FABRIC</p>
                                                    </div> 
                                                </td>
                                                <td>
                                                    <?php 
                                                    echo !empty($ModelMeasureArr['Header_Graphic1-Mat']) ? 
                                                        $ModelMeasureArr['Header_Graphic1-Mat']['x'].'mm x '.$ModelMeasureArr['Header_Graphic1-Mat']['y'].'mm' : 
                                                        "No header"; 
                                                    ?>
                                                </td>
                                            </tr>
                                            <?php } ?>
                                            <tr>
                                                <td>
                                                    <div>
                                                        <p style="font-family:gothambook; font-weight:bold;">MAIN BODY FRAME</p>
                                                    </div>
                                                    <div>
                                                        <p style="">ALUMINIUM POWDER COATED</p>
                                                    </div> 
                                                </td>
                                                <td><?php echo $ModelMeasureArr['Frame']['width'].' x '.$ModelMeasureArr['Frame']['height'].' x '.$ModelMeasureArr['Frame']['depth']; ?></td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div>
                                                        <p style="font-family:gothambook; font-weight:bold;">SEG BODY GRAPHIC</p>
                                                    </div>
                                                    <div>
                                                        <p style="">REPLACEABLE PRINTED FABRIC</p>
                                                    </div> 
                                                </td>
                                                <td><?php echo round($ModelMeasureArr['Cube1-Mat']['x']).'mm x '.round($ModelMeasureArr['Cube1-Mat']['y']).'mm'; ?></td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div>
                                                        <p style="font-family:gothambook; font-weight:bold;">PREMIUM BASE</p>
                                                    </div>
                                                    <div>
                                                        <p style="">STEEL POWDER COATED</p>
                                                    </div> 
                                                </td>
                                                <td>
                                                    <?php
                                                    if (!empty($ModelMeasureArr['Base_Solid'])) {
                                                        echo round($ModelMeasureArr['Base_Solid']['x']) . 'mm x ' . round($ModelMeasureArr['Base_Solid']['y']) . 'mm x ' . round($ModelMeasureArr['Base_Solid']['z']) . 'mm';
                                                    } elseif (!empty($ModelMeasureArr['Base_Support_Sides'])) {
                                                        echo round($ModelMeasureArr['Base_Support_Sides']['x']) . 'mm x ' . round($ModelMeasureArr['Base_Support_Sides']['y']) . 'mm x ' . round($ModelMeasureArr['Base_Support_Sides']['z']) . 'mm';
                                                    } else {
                                                        echo 'N/A';
                                                    }
                                                    ?>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td colspan="2" style="border-bottom:1px solid #007b71; padding:0px; height:1px"></td>
                                            </tr>
                                            <tr>
                                                <td colspan="2" style="padding:0px; height:10px; background-color:white;"></td>
                                            </tr>
                                                            <!-- </table>
                                                        </td>
                                                    </tr>
                                                </table>
                                                <table style="width:100%; padding-top:5px;">
                                                    <tr>
                                                        <td colspan="2" style="padding:0px; margin:0px;">
                                                            <table class="modelDesc" style="width:100%; vertical-align:top;"> -->
                                            <tr class="notThis" style="background-color:#e6e7e9;">
                                                <td colspan="2" style="height: 40px; font-size:14px; padding-left:10px; font-family:gotham; font-weight:bold; letter-spacing:2px;">FIXTURES</td>
                                            </tr>
                                            <tr class="notThis" style="background-color:#007b71;">
                                                <td style="width:50%; padding-left:8px; border-right:0.1px solid white; font-size:9px; font-family:gotham; font-weight:bold; color:white; height: 30px; letter-spacing:2px;">COMPONENTS</td>
                                                <td style="width:50%; padding-left:8px; color:white; height: 30px;font-size:9px; font-family:gotham; font-weight:bold; letter-spacing:2px;">SIZE</td>
                                            </tr>
                                            <?php 
                                            if (in_array('Hanger_Rail_Step', $HangerArr)) {
                                                ?>
                                                <tr>
                                                    <td style="width:50%;">
                                                        <div>
                                                            <span style="font-family:gothambook; font-weight:bold;">RAIL STEP</span>
                                                            <p style="padding-top:10px;">ALUMINIUM POWDER COATED</p>
                                                        </div> 
                                                    </td>
                                                    <td style="width:50%;"><?php echo round($ModelMeasureArr['Hanger_Rail_Step']['x']).'mm x '.round($ModelMeasureArr['Hanger_Rail_Step']['y']).'mm x '.round($ModelMeasureArr['Hanger_Rail_Step']['z']).'mm'; ?></td>
                                                </tr>
                                                <?php
                                            }
                                            if (in_array('Hanger_Rail_Single', $HangerArr)) {
                                                ?>
                                                <tr>
                                                    <td style="width:50%;">
                                                        <div>
                                                            <span style="font-family:gothambook; font-weight:bold;">RAIL SINGLE</span>
                                                            <p style="padding-top:10px;">ALUMINIUM POWDER COATED</p>
                                                        </div> 
                                                    </td>
                                                    <td style="width:50%;"><?php echo round($ModelMeasureArr['Hanger_Rail_Single']['x']).'mm x '.round($ModelMeasureArr['Hanger_Rail_Single']['y']).'mm x '.round($ModelMeasureArr['Hanger_Rail_Single']['z']).'mm'; ?></td>
                                                </tr>
                                                <?php
                                            }
                                            if (in_array('Hanger_Rail_D_500mm', $HangerArr)) {
                                                ?>
                                                <tr>
                                                    <td style="width:50%;">
                                                        <div>
                                                            <span style="font-family:gothambook; font-weight:bold;">RAIL D 500M</span>
                                                            <p style="padding-top:10px;">ALUMINIUM POWDER COATED</p>
                                                        </div> 
                                                    </td>
                                                    <td style="width:50%;"><?php echo round($ModelMeasureArr['Hanger_Rail_D_500mm']['x']).'mm x '.round($ModelMeasureArr['Hanger_Rail_D_500mm']['y']).'mm x '.round($ModelMeasureArr['Hanger_Rail_D_500mm']['z']).'mm'; ?></td>
                                                </tr>
                                                <?php
                                            }
                                            if (in_array('Hanger_Rail_D_1000mm', $HangerArr)) {
                                                ?>
                                                <tr>
                                                    <td style="width:50%;">
                                                        <div>
                                                            <span style="font-family:gothambook; font-weight:bold;">RAIL D 1000M</span>
                                                            <p style="padding-top:10px;">ALUMINIUM POWDER COATED</p>
                                                        </div> 
                                                    </td>
                                                    <td style="width:50%;"><?php echo round($ModelMeasureArr['Hanger_Rail_D_1000mm']['x']).'mm x '.round($ModelMeasureArr['Hanger_Rail_D_1000mm']['y']).'mm x '.round($ModelMeasureArr['Hanger_Rail_D_1000mm']['z']).'mm'; ?></td>
                                                </tr>
                                                <?php
                                            }
                                            if (in_array('Hanger_Golf_Club_Driver', $HangerArr)) {
                                                ?>
                                                <tr>
                                                    <td style="width:50%;">
                                                        <div>
                                                            <span style="font-family:gothambook; font-weight:bold;">DRIVER ARMS</span>
                                                            <p style="padding-top:10px;">ALUMINIUM POWDER COATED</p>
                                                        </div> 
                                                    </td>
                                                    <td style="width:50%;"><?php echo round($ModelMeasureArr['Hanger_Golf_Club_Driver']['x']).'mm x '.round($ModelMeasureArr['Hanger_Golf_Club_Driver']['y']).'mm x '.round($ModelMeasureArr['Hanger_Golf_Club_Driver']['z']).'mm'; ?></td>
                                                </tr>
                                                <?php
                                            }
                                            if (in_array('Hanger_Golf_Club_Iron', $HangerArr)) {
                                                ?>
                                                <tr>
                                                    <td style="width:50%;">
                                                        <div>
                                                            <span style="font-family:gothambook; font-weight:bold;">IRON ARMS</span>
                                                            <p style="padding-top:10px;">ALUMINIUM POWDER COATED</p>
                                                        </div> 
                                                    </td>
                                                    <td style="width:50%;"><?php echo round($ModelMeasureArr['Hanger_Golf_Club_Iron']['x']).'mm x '.round($ModelMeasureArr['Hanger_Golf_Club_Iron']['y']).'mm x '.round($ModelMeasureArr['Hanger_Golf_Club_Iron']['z']).'mm'; ?></td>
                                                </tr>
                                                <?php
                                            }
                                            if(empty($HangerArr)){
                                                ?>
                                                <tr>
                                                    <td colspan="2" style="background-color:white;">
                                                        <div>
                                                            <span style="font-family:gothambook; font-weight:bold;">NONE</span>
                                                        </div> 
                                                    </td>
                                                </tr>
                                                <?php
                                            }
                                            ?>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
                <pagebreak />
                <?php foreach($HangerArr as $HangerModleKey => $HangerModleValue){
                ?>
                    <table style="width:100%; table-layout: fixed;"> 
                        <tr>
                            <td colspan="2">
                                <table width="100%">
                                    <tr>
                                        <td style="padding:18px 0px 0px 32px;">
                                            <p style="font-size:13.5px; font-family:gotham; font-weight:bold; letter-spacing:1px;">MODEL <?php echo $index + 1 ?>&nbsp;| <span style="font-family:gothambook; letter-spacing:1px; font-weight:normal;">SPECIFICATION</span></p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td width="55%" style="padding-top: 50px;">
                                <?php foreach($data['ModelImageName'] as $imageLink){ ?>
                                    <?php
                                        $trimmedPath = str_replace('./screenshots/', '', $imageLink);
                                        $parts = explode('-', $trimmedPath);
                                        if($parts[1] == $groupName && str_starts_with($parts[2], "Hanger") && $HangerModleValue == $parts[2]) {
                                    ?> 
                                    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                                        <tr>
                                            <td valign="middle" align="center" height="520" style="">
                                                <img src="<?php echo $imageLink ?>" style="display:block; max-width:500px; max-height:510px; width:auto; height:auto; ">
                                            </td>
                                        </tr>
                                    </table>         
                                    <?php } ?>
                                <?php } ?>
                            </td>
                            <td width="45%" style="padding:130px 70px 0px 90px; padding-top: 0px;">
                                <table style="width:100%;">
                                    <tr style="background-color:#e6e7e9;">
                                        <td colspan="2" style="height: 40px; padding-left:10px; font-family:gotham; font-weight:bold; letter-spacing:2px;">MODEL <?php echo $index + 1 ?></td>
                                    </tr>
                                    <tr>
                                        <td colspan="2" style="padding:0px; margin:0px;">
                                            <table class="modelDesc" style="width:100%; vertical-align:top;">
                                                <tr class="notThis" style="background-color:#007b71;">
                                                    <td style="width:50%; padding-left:8px; border-right:0.1px solid white; font-size:9px; font-family:gotham; font-weight:bold; color:white; height: 30px; letter-spacing:2px;">COMPONENTS</td>
                                                    <td style="width:50%; padding-left:8px; color:white; height: 30px;font-size:9px; font-family:gotham; font-weight:bold; letter-spacing:2px;">SIZE</td>
                                                </tr>
                                                <?php 
                                                if (in_array('Hanger_Rail_Step', $HangerArr) && $HangerModleValue == 'Hanger_Rail_Step') {
                                                    ?>
                                                    <tr>
                                                        <td style="width:50%;">
                                                            <div>
                                                                <span style="font-family:gothambook; font-weight:bold;">RAIL STEP</span>
                                                                <p style="padding-top:10px;">ALUMINIUM POWDER COATED</p>
                                                            </div> 
                                                        </td>
                                                        <td style="width:50%;"><?php echo round($ModelMeasureArr['Hanger_Rail_Step']['x']).'mm x '.round($ModelMeasureArr['Hanger_Rail_Step']['y']).'mm x '.round($ModelMeasureArr['Hanger_Rail_Step']['z']).'mm'; ?></td>
                                                    </tr>
                                                    <?php
                                                }
                                                if (in_array('Hanger_Rail_Single', $HangerArr) && $HangerModleValue == 'Hanger_Rail_Single') {
                                                    ?>
                                                    <tr>
                                                        <td style="width:50%;">
                                                            <div>
                                                                <span style="font-family:gothambook; font-weight:bold;">RAIL SINGLE</span>
                                                                <p style="padding-top:10px;">ALUMINIUM POWDER COATED</p>
                                                            </div> 
                                                        </td>
                                                        <td style="width:50%;"><?php echo round($ModelMeasureArr['Hanger_Rail_Single']['x']).'mm x '.round($ModelMeasureArr['Hanger_Rail_Single']['y']).'mm x '.round($ModelMeasureArr['Hanger_Rail_Single']['z']).'mm'; ?></td>
                                                    </tr>
                                                    <?php
                                                }
                                                if (in_array('Hanger_Rail_D_500mm', $HangerArr) && $HangerModleValue == 'Hanger_Rail_D_500mm') {
                                                    ?>
                                                    <tr>
                                                        <td style="width:50%;">
                                                            <div>
                                                                <span style="font-family:gothambook; font-weight:bold;">RAIL D 500M</span>
                                                                <p style="padding-top:10px;">ALUMINIUM POWDER COATED</p>
                                                            </div> 
                                                        </td>
                                                        <td style="width:50%;"><?php echo round($ModelMeasureArr['Hanger_Rail_D_500mm']['x']).'mm x '.round($ModelMeasureArr['Hanger_Rail_D_500mm']['y']).'mm x '.round($ModelMeasureArr['Hanger_Rail_D_500mm']['z']).'mm'; ?></td>
                                                    </tr>
                                                    <?php
                                                }
                                                if (in_array('Hanger_Rail_D_1000mm', $HangerArr) && $HangerModleValue == 'Hanger_Rail_D_1000mm') {
                                                    ?>
                                                    <tr>
                                                        <td style="width:50%;">
                                                            <div>
                                                                <span style="font-family:gothambook; font-weight:bold;">RAIL D 1000M</span>
                                                                <p style="padding-top:10px;">ALUMINIUM POWDER COATED</p>
                                                            </div> 
                                                        </td>
                                                        <td style="width:50%;"><?php echo round($ModelMeasureArr['Hanger_Rail_D_1000mm']['x']).'mm x '.round($ModelMeasureArr['Hanger_Rail_D_1000mm']['y']).'mm x '.round($ModelMeasureArr['Hanger_Rail_D_1000mm']['z']).'mm'; ?></td>
                                                    </tr>
                                                    <?php
                                                }
                                                if (in_array('Hanger_Golf_Club_Driver', $HangerArr) && $HangerModleValue == 'Hanger_Golf_Club_Driver') {
                                                    ?>
                                                    <tr>
                                                        <td style="width:50%;">
                                                            <div>
                                                                <span style="font-family:gothambook; font-weight:bold;">DRIVER ARMS</span>
                                                                <p style="padding-top:10px;">ALUMINIUM POWDER COATED</p>
                                                            </div> 
                                                        </td>
                                                        <td style="width:50%;"><?php echo round($ModelMeasureArr['Hanger_Golf_Club_Driver']['x']).'mm x '.round($ModelMeasureArr['Hanger_Golf_Club_Driver']['y']).'mm x '.round($ModelMeasureArr['Hanger_Golf_Club_Driver']['z']).'mm'; ?></td>
                                                    </tr>
                                                    <?php
                                                }
                                                if (in_array('Hanger_Golf_Club_Iron', $HangerArr) && $HangerModleValue == 'Hanger_Golf_Club_Iron') {
                                                    ?>
                                                    <tr>
                                                        <td style="width:50%;">
                                                            <div>
                                                                <span style="font-family:gothambook; font-weight:bold;">IRON ARMS</span>
                                                                <p style="padding-top:10px;">ALUMINIUM POWDER COATED</p>
                                                            </div> 
                                                        </td>
                                                        <td style="width:50%;"><?php echo round($ModelMeasureArr['Hanger_Golf_Club_Iron']['x']).'mm x '.round($ModelMeasureArr['Hanger_Golf_Club_Iron']['y']).'mm x '.round($ModelMeasureArr['Hanger_Golf_Club_Iron']['z']).'mm'; ?></td>
                                                    </tr>
                                                    <?php
                                                }
                                                if(empty($HangerArr)){
                                                    ?>
                                                    <tr>
                                                        <td colspan="2" style="background-color:white;">
                                                            <div>
                                                                <span style="font-family:gothambook; font-weight:bold;">NONE</span>
                                                            </div> 
                                                        </td>
                                                    </tr>
                                                    <?php
                                                }
                                                ?>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                    <pagebreak />
                <?php } ?>
                <?php switch ($value['defaultModel']) {
                    case 'Model_1061':
                        ?>
                        <table style="width:1120px;">
                            <tr>
                                <td width="100%">
                                    <table width="100%">
                                        <tr>
                                            <td style="padding:18px 0px 0px 32px;">
                                                <p style="font-size:13.5px; font-family:gotham; font-weight:bold; letter-spacing:1px;">MODEL <?php echo $index + 1 ?>&nbsp;| <span style="font-family:gothambook; letter-spacing:1px; font-weight:normal;">DIMENSIONS</span></p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>                    
                            <tr>
                                <td width="100%">
                                    <table width="100%">
                                        <tr>
                                            <td width="50%" style="padding-top:75px;  text-align:center;">
                                                <?php foreach($data['ModelImageName'] as $imageLink){ ?>
                                                    <?php
                                                        $trimmedPath = str_replace('./screenshots/', '', $imageLink);
                                                        $parts = explode('-', $trimmedPath);
                                                        if($parts[1] == $groupName && $parts[2] == "front"){
                                                    ?> 
                                                    <table style="margin: 0; padding-left:20px">
                                                        <tr>
                                                            <td></td>
                                                            <td style="padding-bottom: 38px; text-align:center;">
                                                                <p style="font-family: gothambook; color:#4d4b4b; font-size:10px; letter-spacing:1px;">FRONT ELEVATION</p>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding-left:5px;">
                                                                <table style="border-top: 1px solid black; border-bottom: 1px solid black; width:90px">
                                                                    <tr>
                                                                        <td style="border-right: 1px dashed black; height:195px;"></td>
                                                                        <td style="height:195px;"></td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td colspan="2" style="text-align: center; font-family: gothambook; color:#4d4b4b; font-size:10px; letter-spacing:1px;"><?php echo $ModelMeasureArr['modelMeasure']['height'] ?></td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td style="border-right: 1px dashed black; height:195px;"></td>
                                                                        <td style="height:195px;"></td>
                                                                    </tr>
                                                                </table>
                                                            </td>    
                                                            <td style="">
                                                                <img src="<?php echo $imageLink ?>" width="260px" height="420px">
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td></td>
                                                            <td style="border-left:1px solid black; border-right:1px solid black; text-align: center; height:45px;">
                                                                <table>
                                                                    <tr>
                                                                        <td style="width:87px; border-bottom: 1px dashed black;"></td>
                                                                        <td rowspan="2" style=" font-family: gothambook; color:#4d4b4b; font-size:10px; letter-spacing:1px;"><?php echo $ModelMeasureArr['modelMeasure']['width'] ?></td>
                                                                        <td style="width:87px; border-bottom: 1px dashed black;"></td>
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
                                            <td width="50%" style="padding-top:75px; ">
                                                <?php foreach($data['ModelImageName'] as $imageLink){ ?>
                                                    <?php
                                                        $trimmedPath = str_replace('./screenshots/', '', $imageLink);
                                                        $parts = explode('-', $trimmedPath);
                                                        if($parts[1] == $groupName && $parts[2] == "side"){
                                                    ?> 
                                                    <table style="margin: 0; padding-left:85px;">
                                                        <tr>
                                                            <td></td>
                                                            <td style="padding-bottom: 38px; text-align:center;">
                                                                <p style="font-family: gothambook; color:#4d4b4b; font-size:10px; letter-spacing:1px;">SIDE ELEVATION</p>
                                                            </td>
                                                        </tr>
                                                        <tr>    
                                                            <td></td>
                                                            <td style="">
                                                                <img src="<?php echo $imageLink ?>" style="width:auto;" height="415px">
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td></td>
                                                            <td style="border-left:1px solid black; border-right:1px solid black; text-align: center; height:45px;">
                                                                <table>
                                                                    <tr>
                                                                        <td style="width:67px; border-bottom: 1px dashed black;"></td>
                                                                        <td rowspan="2" style=" font-family: gothambook; color:#4d4b4b; font-size:10px; letter-spacing:1px;"><?php echo $ModelMeasureArr['modelMeasure']['depth'] ?></td>
                                                                        <td style="width:67px; border-bottom: 1px dashed black;"></td>
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
                                </td>
                            </tr>
                        </table>
                        <?php 
                        break;
                    
                    case 'Model_1200':
                        ?>
                        <table style="width:1120px;">
                            <tr>
                                <td width="100%">
                                    <table width="100%">
                                        <tr>
                                            <td style="padding:18px 0px 0px 32px;">
                                                <p style="font-size:13.5px; font-family:gotham; font-weight:bold; letter-spacing:1px;">MODEL <?php echo $index + 1 ?>&nbsp;| <span style="font-family:gothambook; letter-spacing:1px; font-weight:normal;">DIMENSIONS</span></p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>                    
                            <tr>
                                <td width="100%">
                                    <table width="100%">
                                        <tr>
                                            <td width="50%" style="padding-top:75px;  text-align:center;">
                                                <?php foreach($data['ModelImageName'] as $imageLink){ ?>
                                                    <?php
                                                        $trimmedPath = str_replace('./screenshots/', '', $imageLink);
                                                        $parts = explode('-', $trimmedPath);
                                                        if($parts[1] == $groupName && $parts[2] == "front"){
                                                    ?> 
                                                    <table style="margin: 0; padding-left:50px">
                                                        <tr>
                                                            <td></td>
                                                            <td style="padding-bottom: 38px; text-align:center;">
                                                                <p style="font-family: gothambook; color:#4d4b4b; font-size:10px; letter-spacing:1px;">FRONT ELEVATION</p>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style="">
                                                                <table style="border-top: 1px solid black; border-bottom: 1px solid black; width:90px">
                                                                    <tr>
                                                                        <td style="border-right: 1px dashed black; height:195px;"></td>
                                                                        <td style="height:195px;"></td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td colspan="2" style="text-align: center; font-family: gothambook; color:#4d4b4b; font-size:10px; letter-spacing:1px;"><?php echo $ModelMeasureArr['modelMeasure']['height'] ?></td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td style="border-right: 1px dashed black; height:195px;"></td>
                                                                        <td style="height:195px;"></td>
                                                                    </tr>
                                                                </table>
                                                            </td>    
                                                            <td style="">
                                                                <img src="<?php echo $imageLink ?>" width="280px" height="420px">
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td></td>
                                                            <td style="border-left:1px solid black; border-right:1px solid black; text-align: center; height:45px;">
                                                                <table>
                                                                    <tr>
                                                                        <td style="width:107px; border-bottom: 1px dashed black;"></td>
                                                                        <td rowspan="2" style=" font-family: gothambook; color:#4d4b4b; font-size:10px; letter-spacing:1px;"><?php echo $ModelMeasureArr['modelMeasure']['width'] ?></td>
                                                                        <td style="width:107px; border-bottom: 1px dashed black;"></td>
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
                                            <td width="50%" style="padding-top:75px; ">
                                                <?php foreach($data['ModelImageName'] as $imageLink){ ?>
                                                    <?php
                                                        $trimmedPath = str_replace('./screenshots/', '', $imageLink);
                                                        $parts = explode('-', $trimmedPath);
                                                        if($parts[1] == $groupName && $parts[2] == "side"){
                                                    ?> 
                                                    <table style="margin: 0; padding-left:65px;">
                                                        <tr>
                                                            <td></td>
                                                            <td style="padding-bottom: 38px; text-align:center;">
                                                                <p style="font-family: gothambook; color:#4d4b4b; font-size:10px; letter-spacing:1px;">SIDE ELEVATION</p>
                                                            </td>
                                                        </tr>
                                                        <tr>    
                                                            <td></td>
                                                            <td style="">
                                                                <img src="<?php echo $imageLink ?>" style="width:auto;" height="415px">
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td></td>
                                                            <td style="border-left:1px solid black; border-right:1px solid black; text-align: center; height:45px;">
                                                                <table>
                                                                    <tr>
                                                                        <td style="width:67px; border-bottom: 1px dashed black;"></td>
                                                                        <td rowspan="2" style=" font-family: gothambook; color:#4d4b4b; font-size:10px; letter-spacing:1px;"><?php echo $ModelMeasureArr['modelMeasure']['depth'] ?></td>
                                                                        <td style="width:67px; border-bottom: 1px dashed black;"></td>
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
                                </td>
                            </tr>
                        </table>
                        <?php 
                        break;
                    
                    case 'Model_1500':
                        ?>
                        <table style="width:1120px;">
                            <tr>
                                <td width="100%">
                                    <table width="100%">
                                        <tr>
                                            <td style="padding:18px 0px 0px 32px;">
                                                <p style="font-size:13.5px; font-family:gotham; font-weight:bold; letter-spacing:1px;">MODEL <?php echo $index + 1 ?>&nbsp;| <span style="font-family:gothambook; letter-spacing:1px; font-weight:normal;">DIMENSIONS</span></p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>                    
                            <tr>
                                <td width="100%">
                                    <table width="100%">
                                        <tr>
                                            <td width="60%" style="padding-top:75px;  text-align:center;">
                                                <?php foreach($data['ModelImageName'] as $imageLink){ ?>
                                                    <?php
                                                        $trimmedPath = str_replace('./screenshots/', '', $imageLink);
                                                        $parts = explode('-', $trimmedPath);
                                                        if($parts[1] == $groupName && $parts[2] == "front"){
                                                    ?> 
                                                    <table style="margin: 0; padding-left:10px">
                                                        <tr>
                                                            <td></td>
                                                            <td style="padding-bottom: 38px; text-align:center;">
                                                                <p style="font-family: gothambook; color:#4d4b4b; font-size:10px; letter-spacing:1px;">FRONT ELEVATION</p>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style="">
                                                                <table style="border-top: 1px solid black; border-bottom: 1px solid black; width:90px">
                                                                    <tr>
                                                                        <td style="border-right: 1px dashed black; height:195px;"></td>
                                                                        <td style="height:195px;"></td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td colspan="2" style="text-align: center; font-family: gothambook; color:#4d4b4b; font-size:10px; letter-spacing:1px;"><?php echo $ModelMeasureArr['modelMeasure']['height'] ?></td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td style="border-right: 1px dashed black; height:195px;"></td>
                                                                        <td style="height:195px;"></td>
                                                                    </tr>
                                                                </table>
                                                            </td>    
                                                            <td style="">
                                                                <img src="<?php echo $imageLink ?>" width="380px" height="420px">
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td></td>
                                                            <td style="border-left:1px solid black; border-right:1px solid black; text-align: center; height:45px;">
                                                                <table>
                                                                    <tr>
                                                                        <td style="width:157px; border-bottom: 1px dashed black;"></td>
                                                                        <td rowspan="2" style=" font-family: gothambook; color:#4d4b4b; font-size:10px; letter-spacing:1px;"><?php echo $ModelMeasureArr['modelMeasure']['width'] ?></td>
                                                                        <td style="width:157px; border-bottom: 1px dashed black;"></td>
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
                                            <td width="40%" style="padding-top:75px; ">
                                                <?php foreach($data['ModelImageName'] as $imageLink){ ?>
                                                    <?php
                                                        $trimmedPath = str_replace('./screenshots/', '', $imageLink);
                                                        $parts = explode('-', $trimmedPath);
                                                        if($parts[1] == $groupName && $parts[2] == "side"){
                                                    ?> 
                                                    <table style="margin: 0; padding-left:0px;">
                                                        <tr>
                                                            <td></td>
                                                            <td style="padding-bottom: 38px; text-align:center;">
                                                                <p style="font-family: gothambook; color:#4d4b4b; font-size:10px; letter-spacing:1px;">SIDE ELEVATION</p>
                                                            </td>
                                                        </tr>
                                                        <tr>    
                                                            <td></td>
                                                            <td style="">
                                                                <img src="<?php echo $imageLink ?>" style="width:auto;" height="415px">
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td></td>
                                                            <td style="border-left:1px solid black; border-right:1px solid black; text-align: center; height:45px;">
                                                                <table>
                                                                    <tr>
                                                                        <td style="width:67px; border-bottom: 1px dashed black;"></td>
                                                                        <td rowspan="2" style=" font-family: gothambook; color:#4d4b4b; font-size:10px; letter-spacing:1px;"><?php echo $ModelMeasureArr['modelMeasure']['depth'] ?></td>
                                                                        <td style="width:67px; border-bottom: 1px dashed black;"></td>
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
                                </td>
                            </tr>
                        </table>
                        <?php 
                        break;
                    
                    case 'Model_2000':
                        ?>
                        <table style="width:1120px;">
                            <tr>
                                <td width="100%">
                                    <table width="100%">
                                        <tr>
                                            <td style="padding:18px 0px 0px 32px;">
                                                <p style="font-size:13.5px; font-family:gotham; font-weight:bold; letter-spacing:1px;">MODEL <?php echo $index + 1 ?>&nbsp;| <span style="font-family:gothambook; letter-spacing:1px; font-weight:normal;">DIMENSIONS</span></p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>                    
                            <tr>
                                <td width="100%">
                                    <table width="100%">
                                        <tr>
                                            <td width="60%" style="padding-top:75px;  text-align:center;">
                                                <?php foreach($data['ModelImageName'] as $imageLink){ ?>
                                                    <?php
                                                        $trimmedPath = str_replace('./screenshots/', '', $imageLink);
                                                        $parts = explode('-', $trimmedPath);
                                                        if($parts[1] == $groupName && $parts[2] == "front"){
                                                    ?> 
                                                    <table style="margin: 0; padding-left:10px">
                                                        <tr>
                                                            <td></td>
                                                            <td style="padding-bottom: 38px; text-align:center;">
                                                                <p style="font-family: gothambook; color:#4d4b4b; font-size:10px; letter-spacing:1px;">FRONT ELEVATION</p>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style="">
                                                                <table style="border-top: 1px solid black; border-bottom: 1px solid black; width:90px">
                                                                    <tr>
                                                                        <td style="border-right: 1px dashed black; height:195px;"></td>
                                                                        <td style="height:195px;"></td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td colspan="2" style="text-align: center; font-family: gothambook; color:#4d4b4b; font-size:10px; letter-spacing:1px;"><?php echo $ModelMeasureArr['modelMeasure']['height'] ?></td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td style="border-right: 1px dashed black; height:195px;"></td>
                                                                        <td style="height:195px;"></td>
                                                                    </tr>
                                                                </table>
                                                            </td>    
                                                            <td style="">
                                                                <img src="<?php echo $imageLink ?>" width="460px" height="420px">
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td></td>
                                                            <td style="border-left:1px solid black; border-right:1px solid black; text-align: center; height:45px;">
                                                                <table>
                                                                    <tr>
                                                                        <td style="width:197px; border-bottom: 1px dashed black;"></td>
                                                                        <td rowspan="2" style=" font-family: gothambook; color:#4d4b4b; font-size:10px; letter-spacing:1px;"><?php echo $ModelMeasureArr['modelMeasure']['width'] ?></td>
                                                                        <td style="width:197px; border-bottom: 1px dashed black;"></td>
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
                                            <td width="40%" style="padding-top:75px; ">
                                                <?php foreach($data['ModelImageName'] as $imageLink){ ?>
                                                    <?php
                                                        $trimmedPath = str_replace('./screenshots/', '', $imageLink);
                                                        $parts = explode('-', $trimmedPath);
                                                        if($parts[1] == $groupName && $parts[2] == "side"){
                                                    ?> 
                                                    <table style="margin: 0; padding-left:0px;">
                                                        <tr>
                                                            <td></td>
                                                            <td style="padding-bottom: 38px; text-align:center;">
                                                                <p style="font-family: gothambook; color:#4d4b4b; font-size:10px; letter-spacing:1px;">SIDE ELEVATION</p>
                                                            </td>
                                                        </tr>
                                                        <tr>    
                                                            <td></td>
                                                            <td style="">
                                                                <img src="<?php echo $imageLink ?>" style="width:auto;" height="415px">
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td></td>
                                                            <td style="border-left:1px solid black; border-right:1px solid black; text-align: center; height:45px;">
                                                                <table>
                                                                    <tr>
                                                                        <td style="width:67px; border-bottom: 1px dashed black;"></td>
                                                                        <td rowspan="2" style=" font-family: gothambook; color:#4d4b4b; font-size:10px; letter-spacing:1px;"><?php echo $ModelMeasureArr['modelMeasure']['depth'] ?></td>
                                                                        <td style="width:67px; border-bottom: 1px dashed black;"></td>
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
                                </td>
                            </tr>
                        </table>
                        <?php 
                        break;
                    
                    case 'Model_3000':
                        ?>
                        <table style="width:1120px;">
                            <tr>
                                <td width="100%">
                                    <table width="100%">
                                        <tr>
                                            <td style="padding:18px 0px 0px 32px;">
                                                <p style="font-size:13.5px; font-family:gotham; font-weight:bold; letter-spacing:1px;">MODEL <?php echo $index + 1 ?>&nbsp;| <span style="font-family:gothambook; letter-spacing:1px; font-weight:normal;">DIMENSIONS</span></p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>                    
                            <tr>
                                <td width="100%">
                                    <table width="100%">
                                        <tr>
                                            <td width="60%" style="padding-top:75px;  text-align:center;">
                                                <?php foreach($data['ModelImageName'] as $imageLink){ ?>
                                                    <?php
                                                        $trimmedPath = str_replace('./screenshots/', '', $imageLink);
                                                        $parts = explode('-', $trimmedPath);
                                                        if($parts[1] == $groupName && $parts[2] == "front"){
                                                    ?> 
                                                    <table style="margin: 0; padding-left:10px">
                                                        <tr>
                                                            <td></td>
                                                            <td style="padding-bottom: 38px; text-align:center;">
                                                                <p style="font-family: gothambook; color:#4d4b4b; font-size:10px; letter-spacing:1px;">FRONT ELEVATION</p>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style="">
                                                                <table style="border-top: 1px solid black; border-bottom: 1px solid black; width:90px">
                                                                    <tr>
                                                                        <td style="border-right: 1px dashed black; height:195px;"></td>
                                                                        <td style="height:195px;"></td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td colspan="2" style="text-align: center; font-family: gothambook; color:#4d4b4b; font-size:10px; letter-spacing:1px;"><?php echo $ModelMeasureArr['modelMeasure']['height'] ?></td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td style="border-right: 1px dashed black; height:195px;"></td>
                                                                        <td style="height:195px;"></td>
                                                                    </tr>
                                                                </table>
                                                            </td>    
                                                            <td style="">
                                                                <img src="<?php echo $imageLink ?>" width="500px" height="420px">
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td></td>
                                                            <td style="border-left:1px solid black; border-right:1px solid black; text-align: center; height:45px;">
                                                                <table>
                                                                    <tr>
                                                                        <td style="width:247px; border-bottom: 1px dashed black;"></td>
                                                                        <td rowspan="2" style="width:66px; font-family: gothambook; color:#4d4b4b; font-size:10px; letter-spacing:1px;"><?php echo $ModelMeasureArr['modelMeasure']['width'] ?></td>
                                                                        <td style="width:247px; border-bottom: 1px dashed black;"></td>
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
                                            <td width="40%" style="padding-top:75px; ">
                                                <?php foreach($data['ModelImageName'] as $imageLink){ ?>
                                                    <?php
                                                        $trimmedPath = str_replace('./screenshots/', '', $imageLink);
                                                        $parts = explode('-', $trimmedPath);
                                                        if($parts[1] == $groupName && $parts[2] == "side"){
                                                    ?> 
                                                    <table style="margin: 0; padding-left:10px;">
                                                        <tr>
                                                            <td></td>
                                                            <td style="padding-bottom: 38px; text-align:center;">
                                                                <p style="font-family: gothambook; color:#4d4b4b; font-size:10px; letter-spacing:1px;">SIDE ELEVATION</p>
                                                            </td>
                                                        </tr>
                                                        <tr>    
                                                            <td></td>
                                                            <td style="">
                                                                <img src="<?php echo $imageLink ?>" style="width:auto;" height="415px">
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td></td>
                                                            <td style="border-left:1px solid black; border-right:1px solid black; text-align: center; height:45px;">
                                                                <table>
                                                                    <tr>
                                                                        <td style="width:67px; border-bottom: 1px dashed black;"></td>
                                                                        <td rowspan="2" style=" font-family: gothambook; color:#4d4b4b; font-size:10px; letter-spacing:1px;"><?php echo $ModelMeasureArr['modelMeasure']['depth'] ?></td>
                                                                        <td style="width:67px; border-bottom: 1px dashed black;"></td>
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
                                </td>
                            </tr>
                        </table>   
                        <?php 
                        break;
                    
                    default:
                        ?>
                        <table style="width:1120px;">
                            <tr>
                                <td width="100%">
                                    <table width="100%">
                                        <tr>
                                            <td style="padding:18px 0px 0px 32px;">
                                                <p style="font-size:13.5px; font-family:gotham; font-weight:bold; letter-spacing:1px;">MODEL <?php echo $index + 1 ?>&nbsp;| <span style="font-family:gothambook; letter-spacing:1px; font-weight:normal;">DIMENSIONS</span></p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>                    
                            <tr>
                                <td width="100%">
                                    <table width="100%">
                                        <tr>
                                            <td width="50%" style="padding-top:75px;  text-align:center;">
                                                <?php foreach($data['ModelImageName'] as $imageLink){ ?>
                                                    <?php
                                                        $trimmedPath = str_replace('./screenshots/', '', $imageLink);
                                                        $parts = explode('-', $trimmedPath);
                                                        if($parts[1] == $groupName && $parts[2] == "front"){
                                                    ?> 
                                                    <table style="margin: 0; padding-left:45px">
                                                        <tr>
                                                            <td></td>
                                                            <td style="padding-bottom: 55px; text-align:center;">
                                                                <p style="font-family: gothambook; color:#4d4b4b; font-size:10px; letter-spacing:1px;">FRONT ELEVATION</p>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding-left:5px;">
                                                                <table style="border-top: 1px solid black; border-bottom: 1px solid black; width:95px">
                                                                    <tr>
                                                                        <td style="border-right: 1px dashed black; height:185px;"></td>
                                                                        <td style="height:185px;"></td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td colspan="2" style="text-align: center; font-family: gothambook; color:#4d4b4b; font-size:10px; letter-spacing:1px;"><?php echo $ModelMeasureArr['modelMeasure']['height'] ?></td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td style="border-right: 1px dashed black; height:185px;"></td>
                                                                        <td style="height:185px;"></td>
                                                                    </tr>
                                                                </table>
                                                            </td>    
                                                            <td style="">
                                                                <img src="<?php echo $imageLink ?>" width="180px" height="400px">
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td></td>
                                                            <td style="border-left:1px solid black; border-right:1px solid black; text-align: center; height:45px;">
                                                                <table>
                                                                    <tr>
                                                                        <td style="width:57px; border-bottom: 1px dashed black;"></td>
                                                                        <td rowspan="2" style=" font-family: gothambook; color:#4d4b4b; font-size:10px; letter-spacing:1px;"><?php echo $ModelMeasureArr['modelMeasure']['width'] ?></td>
                                                                        <td style="width:57px; border-bottom: 1px dashed black;"></td>
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
                                            <td width="50%" style="padding-top:75px; ">
                                                <?php foreach($data['ModelImageName'] as $imageLink){ ?>
                                                    <?php
                                                        $trimmedPath = str_replace('./screenshots/', '', $imageLink);
                                                        $parts = explode('-', $trimmedPath);
                                                        if($parts[1] == $groupName && $parts[2] == "side"){
                                                    ?> 
                                                    <table style="margin: 0; padding-left:80px;">
                                                        <tr>
                                                            <td></td>
                                                            <td style="padding-bottom: 55px; text-align:center;">
                                                                <p style="font-family: gothambook; color:#4d4b4b; font-size:10px; letter-spacing:1px;">SIDE ELEVATION</p>
                                                            </td>
                                                        </tr>
                                                        <tr>    
                                                            <td></td>
                                                            <td style="">
                                                                <img src="<?php echo $imageLink ?>" style="width:auto;" height="415px">
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td></td>
                                                            <td style="border-left:1px solid black; border-right:1px solid black; text-align: center; height:45px;">
                                                                <table>
                                                                    <tr>
                                                                        <td style="width:87px; border-bottom: 1px dashed black;"></td>
                                                                        <td rowspan="2" style=" font-family: gothambook; color:#4d4b4b; font-size:10px; letter-spacing:1px;"><?php echo $ModelMeasureArr['modelMeasure']['depth'] ?></td>
                                                                        <td style="width:87px; border-bottom: 1px dashed black;"></td>
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
                                </td>
                            </tr>
                        </table>           
                        <?php 
                        break;
                } ?>
                <pagebreak />
            <?php } ?>
        <?php } ?> 
    <?php } ?>    
</body>
</html>