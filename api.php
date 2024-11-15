<?php

require_once 'connection.php';
require_once __DIR__ . '/vendor/autoload.php';

// Get JSON data from request
$data = json_decode(file_get_contents("php://input"), true); // Decode JSON input
    
if (!empty($data['action']) && $data['action'] == 'save_model_data') {
    // print_r($data);
    // Prepare and bind the SQL statement
    $id = $data['id'];
    $name = $data['name'];

    $updatedHangerCount = [];
    $updatedRackCount = [];

    if (!empty($data['params']['hangerCount'])) {
        foreach ($data['params']['hangerCount'] as $hangerArrayKey => $count) {
            $updatedHangerCount[$hangerArrayKey] = 0; // Reset each count to 0
        }
        $data['params']['hangerCount'] = $updatedHangerCount;
    }
    if (!empty($data['params']['rackCount'])) {
        foreach ($data['params']['rackCount'] as $rackArrayKey => $count) {
            $updatedRackCount[$rackArrayKey] = 0; // Reset each count to 0
        }
        $data['params']['rackCount'] = $updatedRackCount;
    }
    
    $params = json_encode($data['params'] ?? null);
    $setting = json_encode($data['setting'] ?? null);
    $group_names = json_encode($data['group_names'] ?? null);
    $top_frame_croped_image = json_encode($data['top_frame_croped_image'] ?? null);
    $main_frame_croped_image = json_encode($data['main_frame_croped_image'] ?? null);



    // Check if model state exists for the id
    $sql = "SELECT * FROM threejs_models WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // Update existing model state
        $sql = "UPDATE threejs_models SET `name`=?, `params`=?, `setting`=?, `group_names`=?, `top_frame_croped_image`=?, `main_frame_croped_image`=? WHERE id=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sssssss", $name, $params, $setting, $group_names, $top_frame_croped_image, $main_frame_croped_image, $id); // Correct parameter types
    } else {
        // Insert new model state
        $sql = "INSERT INTO threejs_models (`id`, `name`, `params`, `setting`, `group_names`, `top_frame_croped_image`, `main_frame_croped_image`) VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sssssss", $id, $name, $params, $setting, $group_names, $top_frame_croped_image, $main_frame_croped_image); // Correct parameter types
    }

    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
} elseif (!empty($data['action']) && $data['action'] == 'get_model_data') {
    $id = $data['id'];

    $sql = "SELECT * FROM threejs_models WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $row['params'] = !empty($row['params']) ? json_decode($row['params'], true) : null;
        $row['setting'] = !empty($row['setting']) ? json_decode($row['setting'], true) : null;
        $row['group_names'] = !empty($row['group_names']) ? json_decode($row['group_names'], true) : null;
        $row['top_frame_croped_image'] = !empty($row['top_frame_croped_image']) ? json_decode($row['top_frame_croped_image'], true) : null;
        $row['main_frame_croped_image'] = !empty($row['main_frame_croped_image']) ? json_decode($row['main_frame_croped_image'], true) : null;

        echo json_encode(['success' => true, 'data' => $row]);
    } else {
        echo json_encode(['success' => false]); // No state found
    }
} elseif (!empty($data['action']) && $data['action'] == 'save_Pdf_data') {
    // function getScaledImageDimensions($imagePath, $maxWidth, $maxHeight) {
    //     // Get the original dimensions of the image
    //     list($originalWidth, $originalHeight) = getimagesize($imagePath);
        
    //     // If the image already fits within the dimensions, use its original size
    //     if ($originalWidth <= $maxWidth && $originalHeight <= $maxHeight) {
    //         return ['width' => $originalWidth, 'height' => $originalHeight];
    //     }

    //     // Calculate aspect ratio
    //     $aspectRatio = $originalWidth / $originalHeight;

    //     // Calculate new dimensions maintaining the aspect ratio
    //     if ($originalWidth > $maxWidth) {
    //         $newWidth = $maxWidth;
    //         $newHeight = $maxWidth / $aspectRatio;
    //     } else {
    //         $newWidth = $originalWidth;
    //         $newHeight = $originalHeight;
    //     }

    //     if ($newHeight > $maxHeight) {
    //         $newHeight = $maxHeight;
    //         $newWidth = $maxHeight * $aspectRatio;
    //     }

    //     return ['width' => round($newWidth), 'height' => round($newHeight)];
    // }
    // Example usage
    // $imageDimensions = getScaledImageDimensions('path/to/your/image.jpg', 600, 800);
    // echo '<td><img src="path/to/your/image.jpg" width="' . $imageDimensions['width'] . '" height="' . $imageDimensions['height'] . '" /></td>';



    // echo __DIR__ . '/assets/fonts/Document_fonts';die;
    $defaultConfig = (new \Mpdf\Config\ConfigVariables())->getDefaults();
    $fontDirs = $defaultConfig['fontDir'];

    $defaultFontConfig = (new \Mpdf\Config\FontVariables())->getDefaults();
    $fontData = $defaultFontConfig['fontdata'];

    $mpdf = new \Mpdf\Mpdf([
        'fontDir' => array_merge($fontDirs, [
            __DIR__ . '/assets/fonts/Document_fonts',
        ]),
        'fontdata' => $fontData + [ // lowercase letters only in font key
            'minipro' => [
                'R' => 'MinionPro-Regular.ttf',
            ],
            'gotham' => [
                'R' => 'Gotham-Bold.ttf',
            ],
            'gothambook' => [
                'R' => 'Gotham-Book.ttf',
            ]
        ],
        'tempDir' => './uploads',
        'format' => 'A4-L',
        'margin_left' => 0,
        'margin_right' => 0,
        'margin_top' => 0,
        'margin_bottom' => 0,
        'margin_header' => 0,
        'margin_footer' => 0,
    ]);
    // Register fonts in the mPDF configuration
    // $fontDir = __DIR__ . '/assets/fonts/Document_fonts';
    // $mpdf->fontdata['minipro'] = [
    //     'R' => $fontDir . '/MinionPro-Regular.otf',
    // ];
    // $mpdf->fontdata['gotham'] = [
    //     'R' => $fontDir . '/Gotham-Bold.otf',
    // ];
    // $mpdf->fontdata['gothambook'] = [
    //     'R' => $fontDir . '/Gotham-Book.otf',
    // ];

    // First page HTML content
    ob_start();
    include './pdfContentFile/pdfFrontpage.html'; // Adjust the path if needed
    $firstPageHtml = ob_get_clean();

    // Write the first page content
    $mpdf->WriteHTML($firstPageHtml);

    // Now set the footer for subsequent pages
    $mpdf->SetHTMLFooter('
    <table style="width:100%; padding-bottom:2.5px; border-collapse:collapse; border-spacing:0;">
        <tr style="padding-left:0px; margin-left:0px;">
            <td style="width:13.2%; background-color:#de1a40; color:white; padding:0px; padding-right:10px; padding-left:0px; margin-left:0px; text-align:right; height:23px;">
                <div style="font-size: 8.5px; font-weight:bold; font-family:gotham; letter-spacing:1.5px; margin:0px; padding:0px;">PATENT PENDING</div>
            </td>
            <td style="width:1.5%; padding: 0;">
            </td>
            <td style="width:82.3%; padding: 0;">
                <div style="margin:0; border:0; padding:0;"><hr style="margin:0px; padding:0px;" size="10px"></div>
            </td>
            <td style="width:3%; padding: 0;">
            </td>
        </tr>
    </table>
    <table width="97.2%" style="padding:0px 0px 20px 0px;">
        <tbody>
            <tr>
                <td width="50%" style="text-align: left;  padding-left:20px;">
                  <table>
                    <tr>
                      <td style="border-right:1px solid black; padding:0px 12px; 0px 0px; padding-top:2.5px;"><p style="font-size:15px; font-family:gothambook;"><span style="color:#00635a; font-size:14px; font-family:gotham; font-weight:bold;">E:</span>&nbsp;sales@slatframe.com</p></td>
                      <td style="padding-left:10px; padding-top:2.5px;"><p style="font-size:15px; font-family:gothambook;"><span style="color:#00635a; font-size:14px; font-family:gotham; font-weight:bold;">W:</span>&nbsp;www.slatframe.com </p></td>
                    </tr>
                  </table>
                </td>
                <td width="50%" align="right" style="">
                    <table style="width: auto; text-align: right;">
                        <tr>
                            <td style="color: #00635a; font-size: 9px; font-family:gothambook; font-weight:bold; padding: 0; text-align: left;">DESIGNED ON</td>
                        </tr>
                        <tr>
                            <td>
                                <img src="./assets/images/slatLogo.png" width="148px" height="17px" alt="">
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </tbody>
    </table>');

// <tr>
//     <td style="font-size: 20px; font-family: gotham; font-weight:bold; padding: 0; margin: 0;">
//     SLAT
//     <span style="font-family:gothambook; font-weight:normal;">FRAME</span>
//     </td>
// </tr>


    // Start output buffering for the remaining content
    ob_start();
    include './pdfContentFile/pdfContent.php'; // Adjust the path if needed
    $additionalContent = ob_get_clean();

    // Write remaining content with footer applied
    $mpdf->WriteHTML($additionalContent);

    $mpdf->SetHTMLFooter('');

    // last page HTML content
    ob_start();
    include './pdfContentFile/pdflastpage.html'; // Adjust the path if needed
    $LastPageHtml = ob_get_clean();

    // Write the first page content
    $mpdf->WriteHTML($LastPageHtml);

    // Output the PDF
    $filenameLoc = "./uploads/sample1.pdf";
    $mpdf->Output($filenameLoc);
    echo json_encode(["success" => true, "message" => "Screenshot saved successfully"]);
    exit;
} else if (isset($data['image']) && isset($data['filename'])) {
    $imageData = $data['image'];
    $filename = basename($data['filename']); // Use basename to prevent directory traversal attacks

    // Remove the "data:image/png;base64," part from the image data
    $base64Image = explode(',', $imageData)[1];

    // Decode the image data
    $decodedImage = base64_decode($base64Image);

    // Save the image to the server
    $savePath = "./screenshots/". $filename; // Save to "screenshots" directory
    if (file_put_contents($savePath, $decodedImage)) {
        echo json_encode(["success" => true, "message" => "Screenshot saved successfully", "path" => $savePath]);
        exit;
    } else {
        echo json_encode(["success" => false, "error" => "Failed to save screenshot"]);
    }
} else if (isset($_REQUEST['action']) && $_REQUEST['action'] == 'saveModelFile') {
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['file'])) {
        $targetDir = './export_models/'; // Set the desired directory
        $targetFile = $targetDir . basename($_FILES['file']['name']);
        $uploadedSize = $_FILES['file']['size'];
        
        // Check if the directory exists or create it
        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0777, true);
        }

        // Save the uploaded file
        if (move_uploaded_file($_FILES['file']['tmp_name'], $targetFile)) {
            echo json_encode(["status" => "success", "message" => "File saved successfully.",  "uploadedSize" => $uploadedSize, "Data" => $targetFile]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to save file."]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "No file uploaded."]);
    }
} else {
    echo json_encode("No Action Found"); // No action found
}

$conn->close();
