<?php
ini_set('memory_limit', '-1');
set_time_limit(0);

require_once 'connection.php';
require_once __DIR__ . '/vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\PngWriter;
// Start session
session_start();

if (!function_exists('deleteOldMedia')) {
    function deleteOldMedia(){
        // Define the path to the temporary files directory
        $arr = ["/export_models","/screenshots","/images","/uploads"];
        for ($i = 0; $i<count($arr); $i++) {
            $path = __DIR__ . $arr[$i]; // Replace with the actual path
            if (is_dir($path)) {
                // Get the timestamp for 30 minutes ago
                $tenDaysAgo = strtotime('-15 days');

                // Get all files in the directory
                $files = scandir($path);
                foreach ($files as $file) {
                    // Skip special directories '.' and '..'
                    if ($file === '.' || $file === '..') {
                        continue;
                    }

                    $filePath = $path . DIRECTORY_SEPARATOR . $file;

                    // Ensure it is a file and not a directory
                    if (is_file($filePath)) {
                        // Get the file's last modified time
                        $fileLastModified = filemtime($filePath);

                        // Delete if the file was modified more than 30 minutes ago
                        if ($fileLastModified < $tenDaysAgo) {
                            unlink($filePath);
                        }
                    }
                }
            }
        }
    }
    deleteOldMedia();
}

// Get JSON data from request
$data = json_decode(file_get_contents("php://input"), true); // Decode JSON input
if (!empty($data['action']) && $data['action'] == 'save_model_data') {
    // Prepare and bind the SQL statement
    $id = $data['id'];
    $userId = $_SESSION['user_id'];
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
        $sql = "INSERT INTO threejs_models (`id`, `user_id`, `name`, `params`, `setting`, `group_names`, `top_frame_croped_image`, `main_frame_croped_image`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        if ($stmt === false) {
            // This will print the error from MySQL
            die('MySQL prepare error: ' . $conn->error);
        }
        $stmt->bind_param("ssssssss", $id, $userId, $name, $params, $setting, $group_names, $top_frame_croped_image, $main_frame_croped_image); // Correct parameter types
    }

    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
} elseif (!empty($data['action']) && $data['action'] == 'get_model_data') {
    $id = $data['id'];

    $sql = "SELECT * FROM threejs_models WHERE id = ? AND user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $id, $_SESSION['user_id']);
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

    // First page HTML content
    ob_start();
    include './pdfContentFile/pdfFirstPage.html'; // Adjust the path if needed
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


    // Start output buffering for the remaining content
    ob_start();
    include './pdfContentFile/pdfContent.php'; // Adjust the path if needed
    $additionalContent = ob_get_clean();

    // Write remaining content with footer applied
    $mpdf->WriteHTML($additionalContent);

    $mpdf->SetHTMLFooter('');

    // last page HTML content
    ob_start();
    include './pdfContentFile/pdfLastPage.html'; // Adjust the path if needed
    $LastPageHtml = ob_get_clean();

    // Write the first page content
    $mpdf->WriteHTML($LastPageHtml);

    // Output the PDF
    $time = time();
    $filenameLoc = "./uploads/".$data['fileName'];
    $mpdf->Output($filenameLoc);
    echo json_encode(["success" => true, "message" => "Screenshot saved successfully","url" => $filenameLoc]);
    exit;
} else if (isset($data['image']) && isset($data['filename'])) {
    $imageData = $data['image'];
    $filename = basename($data['filename']); // Use basename to prevent directory traversal attacks
    // $base64Image = explode(',', $imageData)[1];

    // // Decode the image data
    // $decodedImage = base64_decode($base64Image);

    // Save the image to the server
    $savePath = "./screenshots/". $filename; // Save to "screenshots" directory
    $result = compressImage($imageData, $savePath);

    if ($result) {
        echo json_encode(["success" => true, "message" => "Screenshot saved successfully", "path" => $result]);
        exit;
    } else {
        echo json_encode(["success" => false, "error" => "Failed to save screenshot"]);
    }

    // if (file_put_contents($savePath, $decodedImage)) {
    //     echo json_encode(["success" => true, "message" => "Screenshot saved successfully", "path" => $savePath]);
    //     exit;
    // } else {
    //     echo json_encode(["success" => false, "error" => "Failed to save screenshot"]);
    // }
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
} else if (!empty($_REQUEST['action']) && $_REQUEST['action'] == 'RegisterUser') {
    $username = $_REQUEST['userName'];
    $email = $_REQUEST['email'];
    $password = $_REQUEST['password'];

    // Hash the password for security
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    try {
        // Prepare SQL query
        $sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            die("Prepare failed: " . $conn->error);
        }
        // Bind parameters to the placeholders
        $stmt->bind_param('sss', $username, $email, $hashed_password);
        // Execute the query
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Registration successful."]);
        } else {
            echo json_encode(["success" => false, "message" => "Registration failed: " . $stmt->error]);
        }
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) { // Duplicate entry error code
            echo json_encode(["success" => false, "message" => "Email is already registered."]);
        } else {
            echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
        }
    }

} else if (!empty($_REQUEST['action']) && $_REQUEST['action'] == 'LoginUser') {
    $email = $_REQUEST['email'];
    $password = $_REQUEST['password'];

    try {
        // Check if the email exists in the database
        $sql = "SELECT * FROM users WHERE email = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('s', $email);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();

        if ($user && password_verify($password, $user['password'])) {
            // Password is correct, set session variables
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            echo json_encode(["success" => true, "message" => "Login successful." , "session" => $_SESSION]);
        } else {
            // Invalid credentials
            echo json_encode(["success" => false, "message" => "Invalid email or password."]);
        }
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
    }


} else if (!empty($data['action']) && $data['action'] == 'create_qr_code') {
    // Get the protocol (http or https)
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https" : "http";

    // Get the host (e.g., biginstore.net)
    $host = $_SERVER['HTTP_HOST'];

    // Get the current script's directory
    $directory = rtrim(dirname($_SERVER['PHP_SELF']), '/\\');

    // Construct the dynamic URL
    $localUrl = "http://192.168.0.173/three-model";
    $liveUrl = "$protocol://$host$directory";
    // Define base URLs
    // $liveUrl = "https://biginstore.net/3d_frame_maker";

    // Determine if the server is local or live
    if ($host === '192.168.0.173' || strpos($host, 'localhost') !== false) {
        $baseUrl = $localUrl;
    } else {
        $baseUrl = $liveUrl;
    }
    $baseRedirectUrl = $baseUrl."/redirect.php";

    // Append the `url` parameter
    $redirectUrl = $baseRedirectUrl . "?url=" . urlencode($baseUrl.$data['url']);

    // Create the QR code
    $qrCode = new QrCode($redirectUrl);
    $qrCode->setSize(300);

    // Initialize the writer
    $writer = new PngWriter();

    // Define the directory to save the QR code (make sure the directory is writable)
    $directory = 'screenshots/';
    $time = time();
    $filePath = $directory . $time .'_qrcode.png';

    // Save the QR code to a file
    $result = $writer->write($qrCode);  // Use writeFile() to save the file
    // Save the PNG image to the file path
    file_put_contents($filePath, $result->getString()); // Save the result string as a PNG file

    // Generate the URL to access the QR code
    $qrCodeUrl = $filePath;

    // Output the link to the saved QR code
    echo json_encode(["success" => true, "message" => "QR Created successfully", "url" => $qrCodeUrl]);
} else if (isset($_REQUEST['action']) && $_REQUEST['action'] == 'saveModelCropImage') {
    $base64Image = $_REQUEST['modelCropImage'];

    // Extract the image data from the Base64 string (it may include the data URL prefix, so we remove it)
    // $modelCropImage = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $base64Image));

    // Define the folder where the images will be saved (ensure this folder is writable)
    $targetDir = 'images/';

    // Ensure the target directory exists
    if (!file_exists($targetDir)) {
        mkdir($targetDir, 0777, true);
    }

    // Create a unique file name (for example, using a timestamp or UUID)
    $fileName = 'image_' . time() . '.png';
    $filePath = $targetDir . $fileName;
    $result = compressImage($base64Image, $filePath);

    // Save the image to the server
    // if (file_put_contents($filePath, $modelCropImage)) {
    //     // Return the URL of the saved image
    //     $imageUrl = $targetDir . $fileName; // Relative URL path

    //     // Respond with success and the image URL
    //     echo json_encode([
    //         'success' => true,
    //         'imageUrl' => $imageUrl
    //     ]);
    // } else {
    //     // If there's an error saving the image
    //     echo json_encode(['success' => false, 'message' => 'Error saving image']);
    // }

    if ($result) {
        echo json_encode([
            'success' => true,
            'imageUrl' => $filePath
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error saving image']);
    }

} else if (!empty($_REQUEST['action']) && $_REQUEST['action'] == 'formSubmitionForMonday'){
    $data = json_decode($_REQUEST['mondayData'], true);
    // echo "<pre>";
    // foreach ($data['group_names'] as $index => $groupName) {
    //     foreach ($data['setting'] as $key => $value) { 
    //         if($key == $groupName){ 
    //             $ModelMeasureArr = [];
    //             $HangerArr = [];
    //             $RackArr = [];
    //             $headerImage = [];
    //             $frameImage = [];
    //             if (isset($data['params']) && isset($data['params']['rackAdded'])) {
    //                 foreach($data['params']['rackAdded'] as $rackKey => $rackVal){
    //                     $rackPartkey = explode('-',$rackKey);
    //                     if ($rackPartkey[0] == $groupName) {
    //                         if (!in_array($rackPartkey[3], $RackArr)) { // Check for duplicates
    //                             $RackArr[] = $rackPartkey[3];
    //                         }
    //                     }
    //                 }
    //             }
    //             if (isset($data['params']) && isset($data['params']['hangerAdded'])) {
    //                 foreach($data['params']['hangerAdded'] as $hangerKey => $hangerVal){
    //                     $hangerPartkey = explode('-',$hangerKey);
    //                     if ($hangerPartkey[0] == $groupName) {
    //                         if (!in_array($hangerPartkey[3], $HangerArr)) { // Check for duplicates
    //                             $HangerArr[] = $hangerPartkey[3];
    //                         }
    //                     }
    //                 }
    //             }
    //             if (isset($data['top_frame_croped_image'])) {
    //                 foreach($data['top_frame_croped_image'] as $headKey => $headVal){
    //                     if($headKey == $groupName) {
    //                         foreach ($headVal as $subHeadkey => $subHeadvalue) {
    //                             if($subHeadkey == $value['defaultModel']){
    //                                 foreach ($subHeadvalue as $Imagekey => $Imagevalue) {
    //                                     $headerImage['headerImage'] = __DIR__.'/'.$Imagevalue;
    //                                 }
    //                             }
    //                         }
    //                     }
    //                 }
    //             }
    //             if (isset($data['main_frame_croped_image'])) {
    //                 foreach($data['main_frame_croped_image'] as $frameKey => $frameVal){
    //                     if($frameKey == $groupName) {
    //                         foreach ($frameVal as $subframekey => $subframevalue) {
    //                             if($subframekey == $value['defaultModel']){
    //                                 foreach ($subframevalue as $Imagekey => $Imagevalue) {
    //                                     $frameImage['frameImage'] = __DIR__.'/'.$Imagevalue;
    //                                 }
    //                             }
    //                         }
    //                     }
    //                 }
    //             }
    //             foreach ($data['ModelData'] as $modelKey => $ModelMeasureValue) {
    //                 if($modelKey == $key){
    //                     foreach ($ModelMeasureValue as $submodelkey => $subModelMeasureData) {
    //                         foreach($subModelMeasureData as $measureKey => $ModelMeasure){
    //                             $ModelMeasureArr[$measureKey] = $ModelMeasure;
    //                         }
    //                     }
    //                 }
    //             } 

    //             print_r($HangerArr);
    //             print_r($RackArr);
    //             print_r($ModelMeasureArr);
    //         }
    //     }
    // }
    // die;
    $formData = $_REQUEST;
    $apiToken = "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjQ0OTAwMzY5MiwiYWFpIjoxMSwidWlkIjo2OTcxMjQwMSwiaWFkIjoiMjAyNC0xMi0xN1QwOTo0ODo1OS41MjdaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MjY5OTQ1MDIsInJnbiI6ImFwc2UyIn0.LCR6zgDGK5sxh_tM9vsZa51g2utgduvwDxjjf0yv71I";
    $boardId = 1948140868;
    $itemName = $_SESSION['username'];

    // Escape and encode the item name to safely include it in the GraphQL query
    $itemName = addslashes($itemName);
    // ---------------------------------- CREATING ITEM ----------------------------------------------------
    // GraphQL mutation to create a new item
    $ceateItemMutation = 'mutation {
        create_item (
            board_id: ' . $boardId . ',
            item_name: "' . $itemName . '"
        ) {
            id
        }
    }';

    // Initialize cURL
    $curl = curl_init();
    curl_setopt_array($curl, array(
        CURLOPT_URL => 'https://api.monday.com/v2',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => '',
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 0,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => 'POST',
        CURLOPT_POSTFIELDS => json_encode(['query' => $ceateItemMutation]),
        CURLOPT_HTTPHEADER => array(
            'Authorization: Bearer ' . $apiToken,
            'Content-Type: application/json',
        ),
    ));

    // Execute the request and get the response
    $response = curl_exec($curl);
    curl_close($curl);
    $responseForItem = json_decode($response, true);
    $itemId = $responseForItem['data']['create_item']['id'];

    // ---------------------------------- CREATING ITEM ----------------------------------------------------
    // ---------------------------------- CREATING SUBITEM AND UPDATE VALUE ----------------------------------------------------
    foreach ($data['group_names'] as $index => $groupName) {
        foreach ($data['setting'] as $key => $value) { 
            if($key == $groupName){ 
                $ModelMeasureArr = [];
                $HangerArr = [];
                $RackArr = [];
                $headerImage = [];
                $frameImage = [];
                if (isset($data['params']) && isset($data['params']['rackAdded'])) {
                    foreach($data['params']['rackAdded'] as $rackKey => $rackVal){
                        $rackPartkey = explode('-',$rackKey);
                        if ($rackPartkey[0] == $groupName) {
                            if (!in_array($rackPartkey[3], $RackArr)) { // Check for duplicates
                                $RackArr[] = $rackPartkey[3];
                            }
                        }
                    }
                }
                if (isset($data['params']) && isset($data['params']['hangerAdded'])) {
                    foreach($data['params']['hangerAdded'] as $hangerKey => $hangerVal){
                        $hangerPartkey = explode('-',$hangerKey);
                        if ($hangerPartkey[0] == $groupName) {
                            if (!in_array($hangerPartkey[3], $HangerArr)) { // Check for duplicates
                                $HangerArr[] = $hangerPartkey[3];
                            }
                        }
                    }
                }
                if (isset($data['top_frame_croped_image'])) {
                    foreach($data['top_frame_croped_image'] as $headKey => $headVal){
                        if($headKey == $groupName) {
                            foreach ($headVal as $subHeadkey => $subHeadvalue) {
                                if($subHeadkey == $value['defaultModel']){
                                    foreach ($subHeadvalue as $Imagekey => $Imagevalue) {
                                        $headerImage['headerImage'] = 'http://localhost/three-model/'.$Imagevalue;
                                    }
                                }
                            }
                        }
                    }
                }
                if (isset($data['main_frame_croped_image'])) {
                    foreach($data['main_frame_croped_image'] as $frameKey => $frameVal){
                        if($frameKey == $groupName) {
                            foreach ($frameVal as $subframekey => $subframevalue) {
                                if($subframekey == $value['defaultModel']){
                                    $frameImage['frameImage'] = 'http://localhost/three-model/'.$subframevalue;
                                }
                            }
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

                $ceateSubItemMutation = 'mutation { 
                    create_subitem (
                        parent_item_id: "' . $itemId . '", 
                        item_name: "' . $groupName . '" 
                    ) { 
                        id 
                    } 
                }';

                // Initialize cURL
                $curl = curl_init();
                curl_setopt_array($curl, array(
                    CURLOPT_URL => 'https://api.monday.com/v2',
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_ENCODING => '',
                    CURLOPT_MAXREDIRS => 10,
                    CURLOPT_TIMEOUT => 0,
                    CURLOPT_FOLLOWLOCATION => true,
                    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                    CURLOPT_CUSTOMREQUEST => 'POST',
                    CURLOPT_POSTFIELDS => json_encode(['query' => $ceateSubItemMutation]),
                    CURLOPT_HTTPHEADER => array(
                        'Authorization: Bearer ' . $apiToken,
                        'Content-Type: application/json',
                    ),
                ));

                // Execute the request and get the response
                $response = curl_exec($curl);
                curl_close($curl);
                if($response === false) {
                    echo "cURL Error: " . curl_error($curl);
                } else {
                    $responseForSubItem = json_decode($response, true);
                    if (isset($responseForSubItem['errors'])) {
                        print_r($responseForSubItem['errors']);
                    }
                    curl_close($curl);
                }
                $subItemId = $responseForSubItem['data']['create_subitem']['id'];
                // echo "<pre>";print_r($subItemId);die;
                // ---------------------------------- GETTING  SUBITEM BOARD ID ----------------------------------------------------
                $getSubItemBoardId = 'query {
                    boards(ids: ' . $boardId . ') {
                        id
                        name
                        columns {
                            id
                            title
                            type
                            settings_str
                        }
                    }
                }';

                // Initialize cURL
                $curl = curl_init();
                curl_setopt_array($curl, array(
                    CURLOPT_URL => 'https://api.monday.com/v2',
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_ENCODING => '',
                    CURLOPT_MAXREDIRS => 10,
                    CURLOPT_TIMEOUT => 0,
                    CURLOPT_FOLLOWLOCATION => true,
                    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                    CURLOPT_CUSTOMREQUEST => 'POST',
                    CURLOPT_POSTFIELDS => json_encode(['query' => $getSubItemBoardId]),
                    CURLOPT_HTTPHEADER => array(
                        'Authorization: Bearer ' . $apiToken,
                        'Content-Type: application/json',
                    ),
                ));

                // Execute the request and get the response
                $response = curl_exec($curl);
                curl_close($curl);

                // Decode the response
                $responseData = json_decode($response, true);
                // Find the Subitem Column
                // echo "<pre>"; print_r($responseData);
                $subitemBoardId = null;
                if (isset($responseData['data']['boards'][0]['columns'])) {
                    foreach ($responseData['data']['boards'][0]['columns'] as $column) {
                        if ($column['type'] === 'subtasks' && isset($column['settings_str'])) {
                            $settings = json_decode($column['settings_str'], true);
                            if (isset($settings['boardIds'])) {
                                $subitemBoardId = $settings['boardIds'][0];
                                break;
                            }
                        }
                    }
                }
                // ---------------------------------- GETTING  SUBITEM BOARD ID ----------------------------------------------------

                // ---------------------------------- CREATING SUBITEM COLUMN ----------------------------------------------------
                $columnData = [
                    "header Type" => "text",
                    "header Size" => "text",
                    "Header Shelf Type" => "text",
                    "Header Shelf size" => "text",
                    "Header Glass Shelf Fixing" => "text",
                    "isRod Active" => "text",
                    "Rod Size" => "text",
                    "Rod Color" => "text",
                    "Frame Type" => "text",
                    "Frame Size" => "text",
                    "Frame Border Color" => "text",
                    "Frame Material Type" => "text",
                    "isSlotted Active" => "text",
                    "Rack Wooden Shelf" => "text",
                    "Rack Wooden Shelf Size" => "text",
                    "Rack Glass Shelf" => "text",
                    "Rack Glass Shelf Size" => "text",
                    "Rack Color" => "text",
                    "Rack Stand Color" => "text",
                    "Base Type" => "text",
                    "Base Size" => "text",
                    "Header Image" => "link",
                    "Frame Image" => "link",   
                    "Hanger Rail Step" => "text",
                    "Hanger Rail Step Size" => "text",
                    "Hanger Rail Single" => "text",
                    "Hanger Rail Single Size" => "text",
                    "Hanger Rail D 500" => "text",
                    "Hanger Rail D 500 Size" => "text",
                    "Hanger Rail D 1000" => "text",
                    "Hanger Rail D 1000 Size" => "text",
                    "Hanger Golf Driver" => "text",
                    "Hanger Golf Driver Size" => "text",
                    "Hanger Golf Iron" => "text",
                    "Hanger Golf Iron Size" => "text",             
                ];

                // Retrieve Existing Columns
                $existingColumns = getExistingColumns($apiToken, $subitemBoardId);
                // Create Missing Columns
                $mutations = [];
                foreach ($columnData as $columnName => $columnType) {
                    if (!in_array($columnName, $existingColumns)) {
                        $mutations = 'mutation {
                            create_column (
                                board_id: ' . $subitemBoardId . ',
                                title: "' . addslashes($columnName) . '",
                                column_type: ' . $columnType . '
                            ) {
                                id
                            }
                    }';
                    // Perform the API request to Monday.com
                    $curl = curl_init();
                    curl_setopt_array($curl, array(
                        CURLOPT_URL => 'https://api.monday.com/v2',
                        CURLOPT_RETURNTRANSFER => true,
                        CURLOPT_ENCODING => '',
                        CURLOPT_MAXREDIRS => 10,
                        CURLOPT_TIMEOUT => 0,
                        CURLOPT_FOLLOWLOCATION => true,
                        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                        CURLOPT_CUSTOMREQUEST => 'POST',
                        CURLOPT_POSTFIELDS => json_encode(['query' => $mutations]),
                        CURLOPT_HTTPHEADER => array(
                            'Authorization: Bearer ' . $apiToken,
                            'Content-Type: application/json',
                        ),
                    ));
    
                    $response = curl_exec($curl);
                    curl_close($curl);
                    sleep(2);
                    }
                }

                
                // // Retrieve Existing Columns
                // $existingColumns = getExistingColumns($apiToken, $subitemBoardId);
                // // Create Missing Columns
                // foreach ($columnData as $columnName => $columnType) {
                //     if (!in_array($columnName, $existingColumns)) {
                //         $success = createColumn($apiToken, $subitemBoardId, $columnName, $columnType);
                //          // Add the column title as text value
                //         if ($success) {
                //         } else {
                //             echo "Failed to create column '$columnName'.\n";
                //         }
                //     }
                // }
                // echo "<pre>"; print_r($responseForSubItem);die;
                // ---------------------------------- CREATING SUBITEM COLUMN ----------------------------------------------------
                $getSubItemColumns = '
                    {
                    boards(ids: '.$subitemBoardId.') {
                        columns {
                        id
                        title
                        }
                    }
                }';

                // Initialize cURL
                $curl = curl_init();
                curl_setopt_array($curl, array(
                    CURLOPT_URL => 'https://api.monday.com/v2',
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_ENCODING => '',
                    CURLOPT_MAXREDIRS => 10,
                    CURLOPT_TIMEOUT => 0,
                    CURLOPT_FOLLOWLOCATION => true,
                    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                    CURLOPT_CUSTOMREQUEST => 'POST',
                    CURLOPT_POSTFIELDS => json_encode(['query' => $getSubItemColumns]),
                    CURLOPT_HTTPHEADER => array(
                        'Authorization: Bearer ' . $apiToken,
                        'Content-Type: application/json',
                    ),
                ));

                // Execute the request and get the response
                $response = curl_exec($curl);
                if($response === false) {
                    echo "cURL Error: " . curl_error($curl);
                } else {
                    $subItemColumnsFetch = json_decode($response, true);
                    if (isset($subItemColumnsFetch['errors'])) {
                        print_r($subItemColumnsFetch['errors']);
                    }
                    curl_close($curl);
                }

                $query = '
                    {
                    items(ids: '. $subItemId .') {
                        column_values {
                        id
                        text
                        value
                        }
                    }
                }';
                // Initialize cURL
                $curl = curl_init();
                curl_setopt_array($curl, array(
                    CURLOPT_URL => 'https://api.monday.com/v2',
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_ENCODING => '',
                    CURLOPT_MAXREDIRS => 10,
                    CURLOPT_TIMEOUT => 0,
                    CURLOPT_FOLLOWLOCATION => true,
                    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                    CURLOPT_CUSTOMREQUEST => 'POST',
                    CURLOPT_POSTFIELDS => json_encode(['query' => $query]),
                    CURLOPT_HTTPHEADER => array(
                        'Authorization: Bearer ' . $apiToken,
                        'Content-Type: application/json',
                    ),
                ));

                // Execute the request and get the response
                $response = curl_exec($curl);
                if($response === false) {
                    echo "cURL Error: " . curl_error($curl);
                } else {
                    $currentColumnValues = json_decode($response, true);
                    if (isset($currentColumnValues['errors'])) {
                        print_r($currentColumnValues['errors']);
                    }
                    curl_close($curl);
                }


                $baseSize = 'null'; 
                if (!empty($ModelMeasureArr['Base_Solid'])) {
                    $baseSize = round($ModelMeasureArr['Base_Solid']['x']) . 'mm x ' . round($ModelMeasureArr['Base_Solid']['y']) . 'mm x ' . round($ModelMeasureArr['Base_Solid']['z']) . 'mm';
                } elseif (!empty($ModelMeasureArr['Base_Support_Sides'])) {
                    $baseSize = round($ModelMeasureArr['Base_Support_Sides']['x']) . 'mm x ' . round($ModelMeasureArr['Base_Support_Sides']['y']) . 'mm x ' . round($ModelMeasureArr['Base_Support_Sides']['z']) . 'mm';
                }
                $subItemColumnValues = [
                    "header Type" => $value['topOption'],    
                    "header Size" => $value['topOption'] == "Header" ? $ModelMeasureArr['Header_Frame']['x'].'mm x '.$ModelMeasureArr['Header_Frame']['y'].'mm x '.$ModelMeasureArr['Header_Frame']['z'].'mm' : "null",
                    "Header Shelf Type" => $value['topOption'] == "Shelf" ? $value['defaultShelfType'] : "null",
                    "Header Shelf size" => $value['topOption'] == "Shelf" ? round($ModelMeasureArr[$value['defaultShelfType']]['x']).'mm x '.round($ModelMeasureArr[$value['defaultShelfType']]['y']).'mm x '.round($ModelMeasureArr[$value['defaultShelfType']]['z']).'mm' : "null" ,
                    "Header Glass Shelf Fixing" => $value['topOption'] == "Shelf" && $value['defaultShelfType'] == "Header_Glass_Shelf" ? round($ModelMeasureArr['Glass_Shelf_Fixing']['x']).'mm x '.round($ModelMeasureArr['Glass_Shelf_Fixing']['y']).'mm x '.round($ModelMeasureArr['Glass_Shelf_Fixing']['z']).'mm' : "null" ,
                    "isRod Active" => $value['headerRodToggle'] ? "Yes" : "No", 
                    "Rod Size" => $value['headerRodToggle'] == true && isset($ModelMeasureArr['Rod']) ? round($ModelMeasureArr['Rod']['x']).'mm x '.round($ModelMeasureArr['Rod']['y']).'mm x '.round($ModelMeasureArr['Rod']['z']).'mm' : "null" ,
                    "Rod Color" => $value['headerRodToggle'] == true ? $value['rodFrameColor'] : "null",
                    "Frame Type" => $value['defaultModel'],
                    "Frame Size" => $ModelMeasureArr['Frame']['width'].' x '.$ModelMeasureArr['Frame']['height'].' x '.$ModelMeasureArr['Frame']['depth'],
                    "Frame Border Color" => $value['frameBorderColor'],
                    "Frame Material Type" => $value['frameMaterialType'],
                    "isSlotted Active" => $value['slottedSidesToggle'] ? "Yes" : "No",
                    "Rack Wooden Shelf" => $value['slottedSidesToggle'] == true && in_array('RackWoodenShelf', $RackArr) ?  "Yes" : "No",
                    "Rack Wooden Shelf Size" => $value['slottedSidesToggle'] == true && in_array('RackWoodenShelf', $RackArr) ? round($ModelMeasureArr['RackWoodenShelf']['x']).'mm x '.round($ModelMeasureArr['RackWoodenShelf']['y']).'mm x '.round($ModelMeasureArr['RackWoodenShelf']['z']).'mm' : "null",
                    "Rack Glass Shelf" => $value['slottedSidesToggle'] == true &&  in_array('RackGlassShelf', $RackArr) ?  "Yes" : "No",
                    "Rack Glass Shelf Size" => $value['slottedSidesToggle'] == true &&  in_array('RackGlassShelf', $RackArr) ? round($ModelMeasureArr['RackGlassShelf']['x']).'mm x '.round($ModelMeasureArr['RackGlassShelf']['y']).'mm x '.round($ModelMeasureArr['RackGlassShelf']['z']).'mm' : "null",
                    "Rack Color" => $value['slottedSidesToggle'] == true ? $value['defaultRackShelfStandColor'] : "null",
                    "Rack Stand Color" => $value['slottedSidesToggle'] == true ? $value['defaultRackStandStandColor'] : "null",
                    "Base Type" => isset($ModelMeasureArr['Base_Solid']) ? "Base_Solid" : "Base_Support_Sides" ,
                    "Base Size" => $baseSize,
                    "Hanger Rail Step" => in_array('Hanger_Rail_Step', $HangerArr) ? 'Hanger_Rail_Step' : "null",
                    "Hanger Rail Step Size" => in_array('Hanger_Rail_Step', $HangerArr)  ? round($ModelMeasureArr['Hanger_Rail_Step']['x']).'mm x '.round($ModelMeasureArr['Hanger_Rail_Step']['y']).'mm x '.round($ModelMeasureArr['Hanger_Rail_Step']['z']).'mm' : "null",
                    "Hanger Rail Single" => in_array('Hanger_Rail_Single', $HangerArr) ? 'Hanger_Rail_Single' : "null",
                    "Hanger Rail Single Size" => in_array('Hanger_Rail_Single', $HangerArr) ? round($ModelMeasureArr['Hanger_Rail_Single']['x']).'mm x '.round($ModelMeasureArr['Hanger_Rail_Single']['y']).'mm x '.round($ModelMeasureArr['Hanger_Rail_Single']['z']).'mm' : "null",
                    "Hanger Rail D 500" => in_array('Hanger_Rail_D_500mm', $HangerArr) ? 'Hanger_Rail_D_500mm' : "null",
                    "Hanger Rail D 500 Size" => in_array('Hanger_Rail_D_500mm', $HangerArr) ? round($ModelMeasureArr['Hanger_Rail_D_500mm']['x']).'mm x '.round($ModelMeasureArr['Hanger_Rail_D_500mm']['y']).'mm x '.round($ModelMeasureArr['Hanger_Rail_D_500mm']['z']).'mm' : "null",
                    "Hanger Rail D 1000" => in_array('Hanger_Rail_D_1000mm', $HangerArr) ? 'Hanger_Rail_D_1000mm' : "null",
                    "Hanger Rail D 1000 Size" => in_array('Hanger_Rail_D_1000mm', $HangerArr) ? round($ModelMeasureArr['Hanger_Rail_D_1000mm']['x']).'mm x '.round($ModelMeasureArr['Hanger_Rail_D_1000mm']['y']).'mm x '.round($ModelMeasureArr['Hanger_Rail_D_1000mm']['z']).'mm' : "null",
                    "Hanger Golf Driver" => in_array('Hanger_Golf_Club_Driver', $HangerArr) ? 'Hanger_Golf_Club_Driver' : "null",
                    "Hanger Golf Driver Size" => in_array('Hanger_Golf_Club_Driver', $HangerArr) ? round($ModelMeasureArr['Hanger_Golf_Club_Driver']['x']).'mm x '.round($ModelMeasureArr['Hanger_Golf_Club_Driver']['y']).'mm x '.round($ModelMeasureArr['Hanger_Golf_Club_Driver']['z']).'mm' : "null",
                    "Hanger Golf Iron" => in_array('Hanger_Golf_Club_Iron', $HangerArr) ? 'Hanger_Golf_Club_Iron' : "null",
                    "Hanger Golf Iron Size" => in_array('Hanger_Golf_Club_Iron', $HangerArr) ? round($ModelMeasureArr['Hanger_Golf_Club_Iron']['x']).'mm x '.round($ModelMeasureArr['Hanger_Golf_Club_Iron']['y']).'mm x '.round($ModelMeasureArr['Hanger_Golf_Club_Iron']['z']).'mm' : "null",
                    "Header Image" => isset($headerImage['headerImage']) ? $headerImage['headerImage'] : "null",
                    "Frame Image" => isset($frameImage['frameImage']) ? $frameImage['frameImage'] : "null",
                ];

                // Initialize a mapping of current column titles to their values
                $headerImageId = "";
                $frameImageId = "";
                $columnsToUpdate = [];
                foreach ($subItemColumnValues as $columnTitle => $columnValue) {
                    // Step 1: Find the corresponding column ID from $subItemColumnsFetch
                    $columnId = null;
                    foreach ($subItemColumnsFetch['data']['boards'][0]['columns'] as $column) {
                        if (strtolower($column['title']) == strtolower($columnTitle)) {
                            if($column['title'] == "Header Image"){
                                $headerImageId = $column['id'];
                                break;  // Stop once we find the matching title
                            }else if($column['title'] == "Frame Image"){
                                $frameImageId = $column['id'];
                                break;  // Stop once we find the matching title
                            }else{
                                $columnId = $column['id'];
                                break;  // Stop once we find the matching title
                            }
                        }
                    }

                    // Step 2: If the column ID is found, update the value in $currentColumnValues
                    if ($columnId) {
                        foreach ($currentColumnValues['data']['items'][0]['column_values'] as &$column) {
                            if ($column['id'] == $columnId) {
                                // Step 3: Set the value from $subItemColumnValues to the column
                                $columnsToUpdate[$columnId] = $columnValue;
                                break;
                            }
                        }
                    }
                }

                // Convert the column values to JSON
                $columnValuesJson = json_encode($columnsToUpdate, JSON_UNESCAPED_SLASHES);

                // Construct the GraphQL mutation
                $mutation = 'mutation {
                    change_multiple_column_values(
                        item_id: ' . $subItemId . ',
                        board_id: ' . $subitemBoardId . ',
                        column_values: "' . addslashes($columnValuesJson) . '"
                    ) {
                        id
                    }
                }';

                // Initialize cURL
                $curl = curl_init();
                curl_setopt_array($curl, array(
                    CURLOPT_URL => 'https://api.monday.com/v2',
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_ENCODING => '',
                    CURLOPT_MAXREDIRS => 10,
                    CURLOPT_TIMEOUT => 0,
                    CURLOPT_FOLLOWLOCATION => true,
                    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                    CURLOPT_CUSTOMREQUEST => 'POST',
                    CURLOPT_POSTFIELDS => json_encode(['query' => $mutation]),
                    CURLOPT_HTTPHEADER => array(
                        'Authorization: Bearer ' . $apiToken,
                        'Content-Type: application/json',
                    ),
                ));

                // Execute the request and get the response
                $response = curl_exec($curl);
                if($response === false) {
                    echo "cURL Error: " . curl_error($curl);
                } else {
                    $responseData = json_decode($response, true);
                    if (isset($responseData['errors'])) {
                        print_r($responseData['errors']);
                    }
                }
                if(isset($headerImage['headerImage'])){
                    // Construct the GraphQL mutation
                    // Construct the GraphQL mutation
                    $mutation = 'mutation {
                        change_column_value(
                            board_id: ' . $subitemBoardId . ',
                            item_id: ' . $subItemId . ',
                            column_id: "' . $headerImageId . '",
                            value: "{\\"url\\": \\"' . addslashes($headerImage['headerImage']) . '\\", \\"text\\": \\"Header Image\\"}"
                        ) {
                            id
                        }
                    }';
                                    
                    // Initialize cURL
                    $curl = curl_init();
                    curl_setopt_array($curl, array(
                        CURLOPT_URL => 'https://api.monday.com/v2',
                        CURLOPT_RETURNTRANSFER => true,
                        CURLOPT_ENCODING => '',
                        CURLOPT_MAXREDIRS => 10,
                        CURLOPT_TIMEOUT => 0,
                        CURLOPT_FOLLOWLOCATION => true,
                        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                        CURLOPT_CUSTOMREQUEST => 'POST',
                        CURLOPT_POSTFIELDS => json_encode(['query' => $mutation]),
                        CURLOPT_HTTPHEADER => array(
                            'Authorization: Bearer ' . $apiToken,
                            'Content-Type: application/json',
                        ),
                    ));
    
                    // Execute the request and get the response
                    $response = curl_exec($curl);
                    if($response === false) {
                        echo "cURL Error: " . curl_error($curl);
                    } else {
                        $responseData = json_decode($response, true);
                        if (isset($responseData['errors'])) {
                            print_r($responseData['errors']);
                        }
                    }
                }
                if(isset($frameImage['frameImage'])){
                    // Construct the GraphQL mutation
                    $mutation = 'mutation {
                        change_column_value(
                            board_id: ' . $subitemBoardId . ',
                            item_id: ' . $subItemId . ',
                            column_id: "' . $frameImageId . '",
                            value: "{\\"url\\": \\"' . addslashes($frameImage['frameImage']) . '\\", \\"text\\": \\"Frame Image\\"}"
                        ) {
                            id
                        }
                    }';
                    // Initialize cURL
                    $curl = curl_init();
                    curl_setopt_array($curl, array(
                        CURLOPT_URL => 'https://api.monday.com/v2',
                        CURLOPT_RETURNTRANSFER => true,
                        CURLOPT_ENCODING => '',
                        CURLOPT_MAXREDIRS => 10,
                        CURLOPT_TIMEOUT => 0,
                        CURLOPT_FOLLOWLOCATION => true,
                        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                        CURLOPT_CUSTOMREQUEST => 'POST',
                        CURLOPT_POSTFIELDS => json_encode(['query' => $mutation]),
                        CURLOPT_HTTPHEADER => array(
                            'Authorization: Bearer ' . $apiToken,
                            'Content-Type: application/json',
                        ),
                    ));
    
                    // Execute the request and get the response
                    $response = curl_exec($curl);
                    if($response === false) {
                        echo "cURL Error: " . curl_error($curl);
                    } else {
                        $responseData = json_decode($response, true);
                        if (isset($responseData['errors'])) {
                            print_r($responseData['errors']);
                        }
                    }
                }


            }
        }
    }
    
    // ---------------------------------- CREATING SUBITEM AND UPDATE VALUE ----------------------------------------------------
    // ---------------------------------- GETTING COLUMNS ----------------------------------------------------
    // Columns to create
    $columnsToCreate = [
        ["title" => "Customer", "type" => "text"], 
        ["title" => "Company", "type" => "text"], 
        ["title" => "Email", "type" => "text"],
        ["title" => "Qty", "type" => "text"],
        ["title" => "Date", "type" => "text"],
    ];

    // Step 1: Fetch existing columns in the board
    $queryExistingColumns = '{
        boards(ids: ' . $boardId . ') {
            columns {
                title
            }
        }
    }';

    $curl = curl_init();
    curl_setopt_array($curl, array(
        CURLOPT_URL => 'https://api.monday.com/v2',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => '',
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 0,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => 'POST',
        CURLOPT_POSTFIELDS => json_encode(['query' => $queryExistingColumns]),
        CURLOPT_HTTPHEADER => array(
            'Authorization: Bearer ' . $apiToken,
            'Content-Type: application/json',
        ),
    ));
    $response = curl_exec($curl);
    curl_close($curl);
    $existingColumnsResponse = json_decode($response, true);

    $existingColumns = [];
    if (isset($existingColumnsResponse['data']['boards'][0]['columns'])) {
        foreach ($existingColumnsResponse['data']['boards'][0]['columns'] as $column) {
            $existingColumns[] = $column['title'];
        }
    }

    // Step 2: Loop through columns and create them if they don't exist
    foreach ($columnsToCreate as $column) {
        if (!in_array($column['title'], $existingColumns)) {
            // Create the column
            $createColumnMutation = 'mutation {
                create_column (
                    board_id: ' . $boardId . ',
                    title: "' . addslashes($column['title']) . '",
                    column_type: ' . $column['type'] . '
                ) {
                    id
                }
            }';

            $curl = curl_init();
            curl_setopt_array($curl, array(
                CURLOPT_URL => 'https://api.monday.com/v2',
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_ENCODING => '',
                CURLOPT_MAXREDIRS => 10,
                CURLOPT_TIMEOUT => 0,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_CUSTOMREQUEST => 'POST',
                CURLOPT_POSTFIELDS => json_encode(['query' => $createColumnMutation]),
                CURLOPT_HTTPHEADER => array(
                    'Authorization: Bearer ' . $apiToken,
                    'Content-Type: application/json',
                ),
            ));
            $response = curl_exec($curl);
            curl_close($curl);
        }
    }

    $curl = curl_init();
    curl_setopt_array($curl, array(
        CURLOPT_URL => 'https://api.monday.com/v2',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => '',
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 0,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => 'POST',
        CURLOPT_POSTFIELDS => '{"query":"query { boards (ids: [' . $boardId . ']) { columns { id title settings_str } } }"}',
        CURLOPT_HTTPHEADER => array(
            'Authorization: Bearer ' . $apiToken,
            'Content-Type: application/json',
        ),
    ));

    // Execute the request and get the response
    $response = curl_exec($curl);
    curl_close($curl);

    // Decode the response to get the columns
    $mondayColumns = json_decode($response, true)['data']['boards'][0]['columns'];
    // ---------------------------------- GETTING COLUMNS ----------------------------------------------------
    // ---------------------------------- MATCHING COLUMNS ----------------------------------------------------

    // Create an object to store the column values
    $columnValues = [];

    // Loop through the formData and match it with Monday column titles
    foreach ($formData as $field => $value) {
        foreach ($mondayColumns as $column) {
            if ($column['title'] == $field) {
                // Store the value using the column ID in the object
                $columnValues[$column['id']] = $value;
                break;
            }
        }
    }
    // ---------------------------------- MATCHING COLUMNS ----------------------------------------------------
    // ---------------------------------- ADDING TO MONDAY BOARD ----------------------------------------------------
    // Convert the column values to JSON format
    $columnValuesJson = json_encode($columnValues, JSON_UNESCAPED_SLASHES);
    // print_r($columnValuesJson);

    // Prepare the mutation to update multiple column values
    $mutation = '
        mutation {
            change_multiple_column_values (
                item_id: ' . $itemId . ',
                board_id: ' . $boardId . ',
                    column_values: "' . addslashes($columnValuesJson) . '"
            ) { id }
        }
    ';


    // Initialize curl for the mutation request
    $curl = curl_init();
    curl_setopt_array($curl, array(
        CURLOPT_URL => 'https://api.monday.com/v2',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => '',
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 0,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => 'POST',
        CURLOPT_POSTFIELDS => json_encode(['query' => $mutation]),
        CURLOPT_HTTPHEADER => array(
            'Authorization: Bearer ' . $apiToken,
            'Content-Type: application/json',
        ),
    ));

    // Execute the request to update the column values
    $response = curl_exec($curl);
    curl_close($curl);
    // sendEmailToUser($_REQUEST);
    echo json_encode(["status" => "success", "message" => $response]);
    exit;
    // ---------------------------------- ADDING TO MONDAY BOARD ----------------------------------------------------
} else if (!empty($_REQUEST['action']) && $_REQUEST['action'] == 'setSessionData'){
    $_SESSION['user_id'] = $_REQUEST['userId'];
    $_SESSION['username'] = $_REQUEST['username'];
} else {
    echo json_encode("No Action Found"); // No action found
}

$conn->close();

function compressImage($source, $destination, $quality = 60) {
    // Check if the source is a Base64 string or a file path
    if (strpos($source, 'data:image/') === 0) {
        // Base64 string: Extract the actual image data and decode it
        $imageData = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $source));
        // Create an image from the decoded data
        $image = imagecreatefromstring($imageData);
    } else {
        // Regular file path: Get image info
        $info = getimagesize($source);
        if (!$info) {
            return "Unsupported file type or invalid image.";
        }

        // Create an image from the file
        $mime = $info['mime'];
        switch ($mime) {
            case 'image/jpeg':
                $image = imagecreatefromjpeg($source);
                break;
            case 'image/png':
                $image = imagecreatefrompng($source);
                imagealphablending($image, false); // Disable alpha blending
                imagesavealpha($image, true); // Save alpha channel
                break;
            case 'image/gif':
                $image = imagecreatefromgif($source);
                break;
            default:
                return "Unsupported image format: " . $mime;
        }
    }

    // Compress and save the image based on the MIME type
    $info = getimagesize($source);  // For MIME type checking
    $mime = $info['mime'];
    list($width, $height, $type) = getimagesize($source);
    switch ($mime) {
        case 'image/jpeg':
            imagejpeg($image, $destination, $quality);
            break;

        case 'image/png':
            $resized_image = imagecreatetruecolor($width, $height);
            $whiteBackground = imagecolorallocate($resized_image, 255, 255, 255);
            // imagecolortransparent($resized_image, $whiteBackground);
            imagefill($resized_image,0,0,$whiteBackground);
            @imagecopyresampled($resized_image, $image, 0, 0, 0, 0, $width, $height, $width, $height);
            imagealphablending($image, false); // Disable alpha blending
            imagesavealpha($image, true); // Save the alpha channel (transparency)
            $pngQuality = 9 - floor($quality / 10);  // Convert JPEG quality (0-100) to PNG compression level (0-9)
            imagepng($image, $destination, $pngQuality);
            break;

        case 'image/gif':
            imagegif($image, $destination);
            break;

        default:
            return "Unsupported image format: " . $mime;
    }

    // Free up memory
    imagedestroy($image);

    return $destination;
}

function sendEmailToUser($data){
    $mail = new PHPMailer(true);
    try {
        // Server settings
        $mail->isSMTP();  // Set mailer to use SMTP
        $mail->Host = 'smtp.gmail.com';  // Set the SMTP server
        $mail->SMTPAuth = true;  // Enable SMTP authentication
        $mail->Username = 'tempacchj@gmail.com';  // SMTP username
        $mail->Password = 'daiwfndhrzwzjggk';  // SMTP password
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;  // Enable TLS encryption
        $mail->Port = 587;  // TCP port for TLS

        // Recipients
        $mail->setFrom('tempacchj@gmail.com', 'biginstore');
        $mail->addAddress($data['email'], $data['name']);  // Add a recipient

        // Content
        $mail->isHTML(true);  // Set email format to HTML
        $mail->Subject = 'biginStore';
        $mail->Body = "This is test email from biginStore";


        $mail->send();
    } catch (Exception $e) {
        echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
    }
}

// Function to Retrieve Existing Columns
function getExistingColumns($apiToken, $subitemBoardId) {
    $query = '{
        boards(ids: ' . $subitemBoardId . ') {
            columns {
                id
                title
            }
        }
    }';

    $curl = curl_init();
    curl_setopt_array($curl, array(
        CURLOPT_URL => 'https://api.monday.com/v2',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => '',
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 0,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => 'POST',
        CURLOPT_POSTFIELDS => json_encode(['query' => $query]),
        CURLOPT_HTTPHEADER => array(
            'Authorization: Bearer ' . $apiToken,
            'Content-Type: application/json',
        ),
    ));

    $response = curl_exec($curl);
    curl_close($curl);

    $responseData = json_decode($response, true);

    if (isset($responseData['data']['boards'][0]['columns'])) {
        return array_column($responseData['data']['boards'][0]['columns'], 'title');
    }

    return [];
}