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
    $formData = $_REQUEST;
    $apiToken = "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjQ0MzA5Mjc2NSwiYWFpIjoxMSwidWlkIjo2OTE2MjExMCwiaWFkIjoiMjAyNC0xMi0wMlQwNToxMDo0My4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MjY3NzIwODAsInJnbiI6ImFwc2UyIn0.htHEKSVIIvtaIyoGdM9K8iHx3GYvE2mZv-RG87LfjBM";
    $boardId = 1973431870;
    $itemName = $_SESSION['username'];

    // ------------------------------GETTING PRICE DATA ------------------------------
    $getAllBoardQuery = 'query {
                boards {
                    id
                    name
                    description
                    state
                    board_kind
                    board_folder_id
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
        CURLOPT_POSTFIELDS => json_encode(['query' => $getAllBoardQuery]),
        CURLOPT_HTTPHEADER => array(
            'Authorization: Bearer ' . $apiToken,
            'Content-Type: application/json',
        ),
    ));

    // Execute the request and get the response
    $response = curl_exec($curl);
    curl_close($curl);
    $responseSearchBoard = json_decode($response, true);
    $priceBoardId = null;
    foreach ($responseSearchBoard['data']['boards'] as $boardKey => $boardValue) {
        if($boardValue['name'] == "Price Board"){
            $priceBoardId = $boardValue['id'];
        }   
    }

    $getPriceBoardQuery = 'query GetBoardItems{  
            boards(ids: ' . $priceBoardId . ') {  
                id
                name
                columns {
                    id
                    title
                    type
                    settings_str
                }
                items_page(limit: 100) {  
                items {  
                    id  
                    name  
                    column_values {  
                    id  
                    value  
                    }  
                }  
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
        CURLOPT_POSTFIELDS => json_encode(['query' => $getPriceBoardQuery]),
        CURLOPT_HTTPHEADER => array(
            'Authorization: Bearer ' . $apiToken,
            'Content-Type: application/json',
        ),
    ));

    // Execute the request and get the response
    $response = curl_exec($curl);
    curl_close($curl);
    $responsePriceBoard = json_decode($response, true);
    // Extract column IDs with their titles into an associative array
    $columns = $responsePriceBoard['data']['boards'][0]['columns'];
    $priceColumnId = array_column($columns, 'id', 'title');
    // Extract items and process them
    $items = $responsePriceBoard['data']['boards'][0]['items_page']['items'];
    $priceBoardData = [];
    foreach ($items as $item) {
        $sellPriceData = [];
        // Map column values using the associative column ID array
        foreach ($item['column_values'] as $columnValue) {
            $columnTitle = array_search($columnValue['id'], $priceColumnId);
            if ($columnTitle !== false) {
                $sellPriceData[$columnTitle] = $columnValue['value'];
            }
        }
        $priceBoardData[$item['name']] = $sellPriceData;
    }
    // echo "<pre>"; print_r($priceColumnId);
    $quntityData = [];
    foreach ($data['group_names'] as $index => $groupName) {
        foreach ($data['setting'] as $key => $value) { 
            if($key == $groupName){ 
                $quntityArr = [];
                $shelfCount = [];
                $hangerCount = [];
                if (isset($data['params']) && isset($data['params']['rackCount'])) {
                    foreach($data['params']['rackCount'] as $rackKey => $rackVal){
                        $rackPartkey = explode('-',$rackKey);
                        if ($rackPartkey[0] == $groupName) {
                            if(array_key_exists($rackPartkey[3] ,$shelfCount)){
                                $shelfCount[$rackPartkey[3]] += $rackVal;
                            }else{
                                $shelfCount[$rackPartkey[3]] = $rackVal;
                            }
                        }
                    }
                } 
                if (isset($data['params']) && isset($data['params']['hangerCount'])) {
                    foreach($data['params']['hangerCount'] as $hangerKey => $hangerVal){
                        $hangerPartkey = explode('-',$hangerKey);
                        if ($hangerPartkey[0] == $groupName) {
                            if(array_key_exists($hangerPartkey[3] ,$hangerCount)){
                                $hangerCount[$hangerPartkey[3]] += $hangerVal;
                            }else{
                                $hangerCount[$hangerPartkey[3]] = $hangerVal;
                            }
                        }
                    }
                }
                $baseSolidQuantity;
                if($value['defaultModel'] == "Model_661" && $value['selectedBaseFrame'] == "Base_Solid"){
                    $baseSolidQuantity = 1; 
                }else if($value['defaultModel'] == "Model_1061" && $value['selectedBaseFrame'] == "Base_Solid"){
                    $baseSolidQuantity = 1; 
                }else if($value['defaultModel'] == "Model_1200" && $value['selectedBaseFrame'] == "Base_Solid"){
                    $baseSolidQuantity = 2; 
                }else if($value['defaultModel'] == "Model_1500" && $value['selectedBaseFrame'] == "Base_Solid"){
                    $baseSolidQuantity = 2; 
                }else if($value['defaultModel'] == "Model_2000" && $value['selectedBaseFrame'] == "Base_Solid"){
                    $baseSolidQuantity = 2; 
                }else if($value['defaultModel'] == "Model_3000" && $value['selectedBaseFrame'] == "Base_Solid"){
                    $baseSolidQuantity = 3; 
                }
                $baseFlatQuantity;
                if($value['defaultModel'] == "Model_661" && $value['selectedBaseFrame'] == "Base_Support_Sides"){
                    $baseFlatQuantity = 2; 
                }else if($value['defaultModel'] == "Model_1061" && $value['selectedBaseFrame'] == "Base_Support_Sides"){
                    $baseFlatQuantity = 2; 
                }else if($value['defaultModel'] == "Model_1200" && $value['selectedBaseFrame'] == "Base_Support_Sides"){
                    $baseFlatQuantity = 2; 
                }else if($value['defaultModel'] == "Model_1500" && $value['selectedBaseFrame'] == "Base_Support_Sides"){
                    $baseFlatQuantity = 3; 
                }else if($value['defaultModel'] == "Model_2000" && $value['selectedBaseFrame'] == "Base_Support_Sides"){
                    $baseFlatQuantity = 3; 
                }else if($value['defaultModel'] == "Model_3000" && $value['selectedBaseFrame'] == "Base_Support_Sides"){
                    $baseFlatQuantity = 4; 
                }

                $headerRodsQuantity;
                if($value['defaultModel'] == "Model_661" && ($value['topOption'] == "Shelf" || $value['headerRodToggle'])){
                    $headerRodsQuantity = 2; 
                }else if($value['defaultModel'] == "Model_1061" && ($value['topOption'] == "Shelf" || $value['headerRodToggle'])){
                    $headerRodsQuantity = 2; 
                }else if($value['defaultModel'] == "Model_1200" && ($value['topOption'] == "Shelf" || $value['headerRodToggle'])){
                    $headerRodsQuantity = 3; 
                }else if($value['defaultModel'] == "Model_1500" && ($value['topOption'] == "Shelf" || $value['headerRodToggle'])){
                    $headerRodsQuantity = 3; 
                }else if($value['defaultModel'] == "Model_2000" && ($value['topOption'] == "Shelf" || $value['headerRodToggle'])){
                    $headerRodsQuantity = 3; 
                }else if($value['defaultModel'] == "Model_3000" && ($value['topOption'] == "Shelf" || $value['headerRodToggle'])){
                    $headerRodsQuantity = 4; 
                }
                $quntityArr = [
                    "Header_300" => [
                        "Model_661" => $value['defaultModel'] == "Model_661" &&  $value['topOption'] == "Header" && $value['defaultHeaderSize'] == "Header_300" ? 1 : 0,
                        "Model_1061" => $value['defaultModel'] == "Model_1061" &&  $value['topOption'] == "Header" && $value['defaultHeaderSize'] == "Header_300" ? 1 : 0,
                        "Model_1200" => $value['defaultModel'] == "Model_1200" &&  $value['topOption'] == "Header" && $value['defaultHeaderSize'] == "Header_300" ? 1 : 0,
                        "Model_1500" => $value['defaultModel'] == "Model_1500" &&  $value['topOption'] == "Header" && $value['defaultHeaderSize'] == "Header_300" ? 1 : 0,
                        "Model_2000" => $value['defaultModel'] == "Model_2000" &&  $value['topOption'] == "Header" && $value['defaultHeaderSize'] == "Header_300" ? 1 : 0,
                        "Model_3000" => $value['defaultModel'] == "Model_3000" &&  $value['topOption'] == "Header" && $value['defaultHeaderSize'] == "Header_300" ? 1 : 0,
                    ],
                    "Header_500" => [
                        "Model_661" => $value['defaultModel'] == "Model_661" &&  $value['topOption'] == "Header" && $value['defaultHeaderSize'] == "Header_500" ? 1 : 0,
                        "Model_1061" => $value['defaultModel'] == "Model_1061" &&  $value['topOption'] == "Header" && $value['defaultHeaderSize'] == "Header_500" ? 1 : 0,
                        "Model_1200" => $value['defaultModel'] == "Model_1200" &&  $value['topOption'] == "Header" && $value['defaultHeaderSize'] == "Header_500" ? 1 : 0,
                        "Model_1500" => $value['defaultModel'] == "Model_1500" &&  $value['topOption'] == "Header" && $value['defaultHeaderSize'] == "Header_500" ? 1 : 0,
                        "Model_2000" => $value['defaultModel'] == "Model_2000" &&  $value['topOption'] == "Header" && $value['defaultHeaderSize'] == "Header_500" ? 1 : 0,
                        "Model_3000" => $value['defaultModel'] == "Model_3000" &&  $value['topOption'] == "Header" && $value['defaultHeaderSize'] == "Header_500" ? 1 : 0,
                    ],
                    "Header_Woodern_Shelf" => $value['topOption'] == "Shelf" && $value["defaultShelfType"] == "Header_Wooden_Shelf" ? 1 : 0,
                    "Header_Glass_Shelf" => $value['topOption'] == "Shelf" && $value["defaultShelfType"] == "Header_Glass_Shelf" ? 1 : 0,
                    "Header_Glass_Shelf_Fixing" => $value['topOption'] == "Shelf" && $value["defaultShelfType"] == "Header_Glass_Shelf" ? 2 : 0,
                    "Rod" => $value['topOption'] == "Shelf" || $value['headerRodToggle'] ? $headerRodsQuantity : 0,
                    "Frame_Slott" => [
                        "Model_661" => $value['defaultModel'] == "Model_661" && $value['slottedSidesToggle'] ? 1 : 0,
                        "Model_1061" => $value['defaultModel'] == "Model_1061" && $value['slottedSidesToggle'] ? 1 : 0,
                        "Model_1200" => $value['defaultModel'] == "Model_1200" && $value['slottedSidesToggle'] ? 1 : 0,
                    ],
                    "Frame" => [
                        "Model_661" => $value['defaultModel'] == "Model_661" && $value['slottedSidesToggle'] == false ? 1 : 0,
                        "Model_1061" => $value['defaultModel'] == "Model_1061" && $value['slottedSidesToggle'] == false ? 1 : 0,
                        "Model_1200" => $value['defaultModel'] == "Model_1200" && $value['slottedSidesToggle'] == false ? 1 : 0,
                        "Model_1500" => $value['defaultModel'] == "Model_1500" && $value['slottedSidesToggle'] == false ? 1 : 0,
                        "Model_2000" => $value['defaultModel'] == "Model_2000" && $value['slottedSidesToggle'] == false ? 1 : 0,
                        "Model_3000" => $value['defaultModel'] == "Model_3000" && $value['slottedSidesToggle'] == false ? 1 : 0,
                    ],
                    "Rack_Wooden_Shelf" => array_key_exists("RackWoodenShelf", $shelfCount) ? $shelfCount['RackWoodenShelf'] : 0,
                    "Rack_Glass_Shelf" => array_key_exists("RackGlassShelf", $shelfCount) ? $shelfCount['RackGlassShelf'] : 0,
                    "Rack_Shelf_Bracket" => array_key_exists("RackWoodenShelf", $shelfCount) && array_key_exists("RackGlassShelf", $shelfCount) ? ($shelfCount['RackGlassShelf'] + $shelfCount['RackWoodenShelf']) * 2 : (array_key_exists("RackWoodenShelf", $shelfCount) ? $shelfCount['RackWoodenShelf'] * 2 : (array_key_exists("RackGlassShelf", $shelfCount) ? $shelfCount['RackGlassShelf'] * 2  : 0)),
                    "Base_solid" => $value['selectedBaseFrame'] == "Base_Solid" ? $baseSolidQuantity : 0,
                    "Base_flat" => $value['selectedBaseFrame'] == "Base_Support_Sides" ? $baseFlatQuantity : 0,
                    "Hanger_Rail_Step" => array_key_exists("Hanger_Rail_Step", $hangerCount) ? $hangerCount['Hanger_Rail_Step'] : 0,
                    "Hanger_Rail_Single" => array_key_exists("Hanger_Rail_Single", $hangerCount) ? $hangerCount['Hanger_Rail_Single'] : 0,
                    "Hanger_Rail_D_500" => array_key_exists("Hanger_Rail_D_500mm", $hangerCount) ? $hangerCount['Hanger_Rail_D_500mm'] : 0,
                    "Hanger_Rail_D_1000" => array_key_exists("Hanger_Rail_D_1000mm", $hangerCount) ? $hangerCount['Hanger_Rail_D_1000mm'] : 0,
                    "Hanger_Golf_Driver" => array_key_exists("Hanger_Golf_Club_Driver", $hangerCount) ? $hangerCount['Hanger_Golf_Club_Driver'] : 0,
                    "Hanger_Golf_Iron" => array_key_exists("Hanger_Golf_Club_Iron", $hangerCount) ? $hangerCount['Hanger_Golf_Club_Iron'] : 0,
                ];
                $quntityData[$groupName] = $quntityArr;
            }
        }
    }
    $itemPriceData = [];
    $possibleKeys = [
        'Header_Model_661_Header_300', 'Header_Model_1061_Header_300', 'Header_Model_1200_Header_300', 'Header_Model_1500_Header_300', 
        'Header_Model_2000_Header_300', 'Header_Model_3000_Header_300', 'Header_Model_661_Header_500', 'Header_Model_1061_Header_500', 
        'Header_Model_1200_Header_500', 'Header_Model_1500_Header_500', 'Header_Model_2000_Header_500', 'Header_Model_3000_Header_500',
        'Header_Woodern_Shelf', 'Header_Glass_Shelf', 'Header_Glass_Shelf_Fixing',
        'Rod', 'Frame_Slotted_Model_661', 'Frame_Slotted_Model_1061', 'Frame_Slotted_Model_1200',
        'Frame_Model_661', 'Frame_Model_1061', 'Frame_Model_1200', 
        'Frame_Model_1500', 'Frame_Model_2000', 'Frame_Model_3000',
        'Rack_Wooden_Shelf', 'Rack_Glass_Shelf', 'Rack_Shelf_Bracket',
        'Base_solid', 'Base_flat', 'Hanger_Rail_Step', 'Hanger_Rail_Single',
        'Hanger_Rail_D_500', 'Hanger_Rail_D_1000', 'Hanger_Golf_Driver', 
        'Hanger_Golf_Iron', 'Labour_Price','Packaging_Price'
    ];

    foreach ($possibleKeys as $key) {
        $itemPriceData[$key] = 0;
    }
    foreach ($quntityData as $modelNameKey => $modelValue) {
        if($modelValue["Header_300"]["Model_661"] > 0){
            $itemPriceData["Header_Model_661_Header_300"] += $modelValue["Header_300"]["Model_661"]; 
        }
        if($modelValue["Header_300"]["Model_1061"] > 0){
            $itemPriceData["Header_Model_1061_Header_300"] += $modelValue["Header_300"]["Model_1061"]; 
        }
        if($modelValue["Header_300"]["Model_1200"] > 0){
            $itemPriceData["Header_Model_1200_Header_300"] += $modelValue["Header_300"]["Model_1200"]; 
        }
        if($modelValue["Header_300"]["Model_1500"] > 0){
            $itemPriceData["Header_Model_1500_Header_300"] += $modelValue["Header_300"]["Model_1500"]; 
        }
        if($modelValue["Header_300"]["Model_2000"] > 0){
            $itemPriceData["Header_Model_2000_Header_300"] += $modelValue["Header_300"]["Model_2000"]; 
        }
        if($modelValue["Header_300"]["Model_3000"] > 0){
            $itemPriceData["Header_Model_3000_Header_300"] += $modelValue["Header_300"]["Model_3000"]; 
        }
        if($modelValue["Header_500"]["Model_661"] > 0){
            $itemPriceData["Header_Model_661_Header_500"] += $modelValue["Header_500"]["Model_661"]; 
        }
        if($modelValue["Header_500"]["Model_1061"] > 0){
            $itemPriceData["Header_Model_1061_Header_500"] += $modelValue["Header_500"]["Model_1061"]; 
        }
        if($modelValue["Header_500"]["Model_1200"] > 0){
            $itemPriceData["Header_Model_1200_Header_500"] += $modelValue["Header_500"]["Model_1200"]; 
        }
        if($modelValue["Header_500"]["Model_1500"] > 0){
            $itemPriceData["Header_Model_1500_Header_500"] += $modelValue["Header_500"]["Model_1500"]; 
        }
        if($modelValue["Header_500"]["Model_2000"] > 0){
            $itemPriceData["Header_Model_2000_Header_500"] += $modelValue["Header_500"]["Model_2000"]; 
        }
        if($modelValue["Header_500"]["Model_3000"] > 0){
            $itemPriceData["Header_Model_3000_Header_500"] += $modelValue["Header_500"]["Model_3000"]; 
        }
        if($modelValue["Header_Woodern_Shelf"] > 0){
            $itemPriceData["Header_Woodern_Shelf"] += $modelValue["Header_Woodern_Shelf"];
        }
        if($modelValue["Header_Glass_Shelf"] > 0){
            $itemPriceData["Header_Glass_Shelf"] += $modelValue["Header_Glass_Shelf"]; 
        }
        if($modelValue["Header_Glass_Shelf_Fixing"] > 0){
            $itemPriceData["Header_Glass_Shelf_Fixing"] += $modelValue["Header_Glass_Shelf_Fixing"]; 
        }
        if($modelValue["Rod"] > 0){
            $itemPriceData["Rod"] += $modelValue["Rod"]; 
        }
        if($modelValue["Frame_Slott"]["Model_661"] > 0){
            $itemPriceData["Frame_Slotted_Model_661"] += $modelValue["Frame_Slott"]["Model_661"]; 
        }
        if($modelValue["Frame_Slott"]["Model_1061"] > 0){
            $itemPriceData["Frame_Slotted_Model_1061"] += $modelValue["Frame_Slott"]["Model_1061"]; 
        }
        if($modelValue["Frame_Slott"]["Model_1200"] > 0){
            $itemPriceData["Frame_Slotted_Model_1200"] += $modelValue["Frame_Slott"]["Model_1200"]; 
        }
        if($modelValue["Frame"]["Model_661"] > 0){
            $itemPriceData["Frame_Model_661"] += $modelValue["Frame"]["Model_661"]; 
        }
        if($modelValue["Frame"]["Model_1061"] > 0){
            $itemPriceData["Frame_Model_1061"] += $modelValue["Frame"]["Model_1061"]; 
        }
        if($modelValue["Frame"]["Model_1200"] > 0){
            $itemPriceData["Frame_Model_1200"] += $modelValue["Frame"]["Model_1200"]; 
        }
        if($modelValue["Frame"]["Model_1500"] > 0){
            $itemPriceData["Frame_Model_1500"] += $modelValue["Frame"]["Model_1500"]; 
        }
        if($modelValue["Frame"]["Model_2000"] > 0){
            $itemPriceData["Frame_Model_2000"] += $modelValue["Frame"]["Model_2000"]; 
        }
        if($modelValue["Frame"]["Model_3000"] > 0){
            $itemPriceData["Frame_Model_3000"] += $modelValue["Frame"]["Model_3000"]; 
        }
        if($modelValue["Rack_Wooden_Shelf"] > 0){
            $itemPriceData["Rack_Wooden_Shelf"] += $modelValue["Rack_Wooden_Shelf"]; 
        }
        if($modelValue["Rack_Glass_Shelf"] > 0){
            $itemPriceData["Rack_Glass_Shelf"] += $modelValue["Rack_Glass_Shelf"]; 
        }
        if($modelValue["Rack_Shelf_Bracket"] > 0){
            $itemPriceData["Rack_Shelf_Bracket"] += $modelValue["Rack_Shelf_Bracket"]; 
        }
        if($modelValue["Base_solid"] > 0){
            $itemPriceData["Base_solid"] += $modelValue["Base_solid"]; 
        }
        if($modelValue["Base_flat"] > 0){
            $itemPriceData["Base_flat"] += $modelValue["Base_flat"]; 
        }
        if($modelValue["Hanger_Rail_Step"] > 0){
            $itemPriceData["Hanger_Rail_Step"] += $modelValue["Hanger_Rail_Step"]; 
        }
        if($modelValue["Hanger_Rail_Single"] > 0){
            $itemPriceData["Hanger_Rail_Single"] += $modelValue["Hanger_Rail_Single"]; 
        }
        if($modelValue["Hanger_Rail_D_500"] > 0){
            $itemPriceData["Hanger_Rail_D_500"] += $modelValue["Hanger_Rail_D_500"]; 
        }
        if($modelValue["Hanger_Rail_D_1000"] > 0){
            $itemPriceData["Hanger_Rail_D_1000"] += $modelValue["Hanger_Rail_D_1000"]; 
        }
        if($modelValue["Hanger_Golf_Driver"] > 0){
            $itemPriceData["Hanger_Golf_Driver"] += $modelValue["Hanger_Golf_Driver"]; 
        }
        if($modelValue["Hanger_Golf_Iron"] > 0){
            $itemPriceData["Hanger_Golf_Iron"] += $modelValue["Hanger_Golf_Iron"]; 
        } 
    }
    $itemPriceData["Labour_Price"] = $formData['Qty'];
    $itemPriceData["Packaging_Price"] = $formData['Qty'];
    $priceListBaseOnQty = [];
    $totalPrice = 0;
    $arrMap = [
            "Header_Model_661_Header_300" => "Header 661X300",
            "Header_Model_1061_Header_300" => "Header 1061X300",
            "Header_Model_1200_Header_300" => "Header 1200X300",
            "Header_Model_1500_Header_300" => "Header 1500X300",
            "Header_Model_2000_Header_300" => "Header 2000X300",
            "Header_Model_3000_Header_300" => "Header 3000X300",
            "Header_Model_661_Header_500" => "Header 661X500",
            "Header_Model_1061_Header_500" => "Header 1061X500",
            "Header_Model_1200_Header_500" => "Header 1200X500",
            "Header_Model_1500_Header_500" => "Header 1500X500",
            "Header_Model_2000_Header_500" => "Header 2000X500",
            "Header_Model_3000_Header_500" => "Header 3000X500",
            "Header_Woodern_Shelf" => "Header Woodern Shelf",
            "Header_Glass_Shelf" => "Header Glass Shelf",
            "Header_Glass_Shelf_Fixing" => "Header Glass Shelf Fixing",
            "Rod" => "Rod",
            "Frame_Slotted_Model_661" => "Frame Slotted 661mm",
            "Frame_Slotted_Model_1061" => "Frame Slotted 1061mm",
            "Frame_Slotted_Model_1200" => "Frame Slotted 1200mm",
            "Frame_Model_661" => "Frame 661mm Wide",
            "Frame_Model_1061" => "Frame 1061mm Wide",
            "Frame_Model_1200" => "Frame 1200mm Wide",
            "Frame_Model_1500" => "Frame 1500mm Wide",
            "Frame_Model_2000" => "Frame 2000mm Wide",
            "Frame_Model_3000" => "Frame 3000mm Wide",
            "Rack_Wooden_Shelf" => "Rack Wooden Shelf",
            "Rack_Glass_Shelf" => "Rack Glass Shelf",
            "Rack_Shelf_Bracket" => "Rack Shelf Bracket",
            "Base_solid" => "Base solid",
            "Base_flat" => "Base flat",
            "Hanger_Rail_Step" => "Hanger Rail Step",
            "Hanger_Rail_Single" => "Hanger Rail Single",
            "Hanger_Rail_D_500" => "Hanger Rail D 500",
            "Hanger_Rail_D_1000" => "Hanger Rail D 1000",
            "Hanger_Golf_Driver" => "Hanger Golf Driver",
            "Hanger_Golf_Iron" => "Hanger Golf Iron", 
            // "Labour_Price" => "Labour Price", 
            // "Packaging_Price" => "Packaging Price", 
        ];
    foreach ($itemPriceData as $itemQtyKey => $itemQtyValue) {
        foreach ($priceBoardData as $dataPriceKey => $dataPriceValue) {
            if(isset($arrMap[$itemQtyKey]) && $arrMap[$itemQtyKey] == $dataPriceKey){
                if($itemQtyValue > 0 && $itemQtyValue <= 10){
                    $priceListBaseOnQty[$itemQtyKey] = (int)str_replace('"', '', $dataPriceValue["Sell Price 1-10"]);
                    $totalPrice += $itemQtyValue * (int)str_replace('"', '', $dataPriceValue["Sell Price 1-10"]);
                }else if($itemQtyValue >= 11 && $itemQtyValue <= 25){
                    $priceListBaseOnQty[$itemQtyKey] = (int)str_replace('"', '', $dataPriceValue["Sell Price 11-25"]);
                    $totalPrice += $itemQtyValue * (int)str_replace('"', '', $dataPriceValue["Sell Price 11-25"]);
                }else if($itemQtyValue >= 26 && $itemQtyValue <= 50){
                    $priceListBaseOnQty[$itemQtyKey] = (int)str_replace('"', '', $dataPriceValue["Sell Price 26-50"]);
                    $totalPrice += $itemQtyValue * (int)str_replace('"', '', $dataPriceValue["Sell Price 26-50"]);
                }else if($itemQtyValue >= 51 && $itemQtyValue <= 100){
                    $priceListBaseOnQty[$itemQtyKey] = (int)str_replace('"', '', $dataPriceValue["Sell Price 51-100"]);
                    $totalPrice += $itemQtyValue * (int)str_replace('"', '', $dataPriceValue["Sell Price 51-100"]);
                }else if($itemQtyValue > 100){
                    $priceListBaseOnQty[$itemQtyKey] = (int)str_replace('"', '', $dataPriceValue["Sell Price 100+"]);
                    $totalPrice += $itemQtyValue * (int)str_replace('"', '', $dataPriceValue["Sell Price 100+"]);
                }else{
                    $priceListBaseOnQty[$itemQtyKey] = 0;
                }
            }
        }   
    }
    // echo "<pre>"; print_r($priceListBaseOnQty);
    // echo "<pre>"; print_r($itemPriceData);
    // echo "<pre>"; print_r($priceBoardData);
    // die;


    // ------------------------------GETTING PRICE DATA ------------------------------

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
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
    $host = $_SERVER['HTTP_HOST']; // e.g., localhost or your domain
    $scriptDir = dirname($_SERVER['SCRIPT_NAME']); // e.g., /three-model
    $baseURL = $protocol . "://" . $host . $scriptDir;

    foreach ($data['group_names'] as $index => $groupName) {
        foreach ($data['setting'] as $key => $value) { 
            if($key == $groupName){ 
                $ModelMeasureArr = [];
                $HangerArr = [];
                $RackArr = [];
                $headerImage = [];
                $frameImage = [];
                $shelfCount = [];
                $hangerCount = [];
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
                                        $headerImage['headerImage'] = $baseURL.'/'.$Imagevalue;
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
                                    $frameImage['frameImage'] = $baseURL.'/'.$subframevalue;
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
                if (isset($data['params']) && isset($data['params']['rackCount'])) {
                    foreach($data['params']['rackCount'] as $rackKey => $rackVal){
                        $rackPartkey = explode('-',$rackKey);
                        if ($rackPartkey[0] == $groupName) {
                            if(array_key_exists($rackPartkey[3] ,$shelfCount)){
                                $shelfCount[$rackPartkey[3]] += $rackVal;
                            }else{
                                $shelfCount[$rackPartkey[3]] = $rackVal;
                            }
                        }
                    }
                } 
                if (isset($data['params']) && isset($data['params']['hangerCount'])) {
                    foreach($data['params']['hangerCount'] as $hangerKey => $hangerVal){
                        $hangerPartkey = explode('-',$hangerKey);
                        if ($hangerPartkey[0] == $groupName) {
                            if(array_key_exists($hangerPartkey[3] ,$hangerCount)){
                                $hangerCount[$hangerPartkey[3]] += $hangerVal;
                            }else{
                                $hangerCount[$hangerPartkey[3]] = $hangerVal;
                            }
                        }
                    }
                }

                $ceateSubItemMutation = 'mutation { 
                    create_subitem (
                        parent_item_id: "' . $itemId . '", 
                        item_name: "' . $value['defaultModel'] . '" 
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
                    "Header Type" => "text",
                    "Header Size" => "text",
                    "Header Qty" => "text",
                    "Header Sell Price" => "text",
                    "Header Shelf Type" => "text",
                    "Header Shelf size" => "text",
                    "Header Shelf Qty" => "text",
                    "Header Shelf Sell Price" => "text",
                    "Header Glass Shelf Fixing" => "text",
                    "Header Glass Shelf Fixing Qty" => "text",
                    "Header Glass Shelf Fixing Sell Price" => "text",
                    "isRod Active" => "text",
                    "Rod Size" => "text",
                    "Rod Color" => "text",
                    "Rod Qty" => "text",
                    "Rod Sell Price" => "text",
                    "Frame Type" => "text",
                    "Frame Size" => "text",
                    "Frame Qty" => "text",
                    "Frame Sell Price" => "text",
                    "Frame Border Color" => "text",
                    "Frame Material Type" => "text",
                    "isSlotted Active" => "text",
                    "Frame Slotted Qty" => "text",
                    "Frame Slotted Sell Price" => "text",
                    "Rack Wooden Shelf" => "text",
                    "Rack Wooden Shelf Size" => "text",
                    "Rack Wooden Shelf Qty" => "text",
                    "Rack Wooden Shelf Sell Price" => "text",
                    "Rack Glass Shelf" => "text",
                    "Rack Glass Shelf Size" => "text",
                    "Rack Glass Shelf Qty" => "text",
                    "Rack Glass Shelf Sell Price" => "text",
                    "Rack Color" => "text",
                    "Rack Stand Color" => "text",
                    "Rack Stand Qty" => "text",
                    "Rack Stand Sell Price" => "text",
                    "Base Type" => "text",
                    "Base Size" => "text",
                    "Base Qty" => "text",
                    "Base Sell Price" => "text",
                    "Header Image" => "link",
                    "Frame Image" => "link",   
                    "Hanger Rail Step" => "text",
                    "Hanger Rail Step Size" => "text",
                    "Hanger Rail Step Qty" => "text",
                    "Hanger Rail Step Sell Price" => "text",
                    "Hanger Rail Single" => "text",
                    "Hanger Rail Single Size" => "text",
                    "Hanger Rail Single Qty" => "text",
                    "Hanger Rail Single Sell Price" => "text",
                    "Hanger Rail D 500" => "text",
                    "Hanger Rail D 500 Size" => "text",
                    "Hanger Rail D 500 Qty" => "text",
                    "Hanger Rail D 500 Sell Price" => "text",
                    "Hanger Rail D 1000" => "text",
                    "Hanger Rail D 1000 Size" => "text",
                    "Hanger Rail D 1000 Qty" => "text",
                    "Hanger Rail D 1000 Sell Price" => "text",
                    "Hanger Golf Driver" => "text",
                    "Hanger Golf Driver Size" => "text",
                    "Hanger Golf Driver Qty" => "text",
                    "Hanger Golf Driver Sell Price" => "text",
                    "Hanger Golf Iron" => "text",
                    "Hanger Golf Iron Size" => "text",             
                    "Hanger Golf Iron Qty" => "text",
                    "Hanger Golf Iron Sell Price" => "text",
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


                $baseSize = ''; 
                if (!empty($ModelMeasureArr['Base_Solid'])) {
                    $baseSize = round($ModelMeasureArr['Base_Solid']['x']) . 'mm x ' . round($ModelMeasureArr['Base_Solid']['y']) . 'mm x ' . round($ModelMeasureArr['Base_Solid']['z']) . 'mm';
                } elseif (!empty($ModelMeasureArr['Base_Support_Sides'])) {
                    $baseSize = round($ModelMeasureArr['Base_Support_Sides']['x']) . 'mm x ' . round($ModelMeasureArr['Base_Support_Sides']['y']) . 'mm x ' . round($ModelMeasureArr['Base_Support_Sides']['z']) . 'mm';
                }

                $baseSolidQuantity;
                if($value['defaultModel'] == "Model_661" && $value['selectedBaseFrame'] == "Base_Solid"){
                    $baseSolidQuantity = 1; 
                }else if($value['defaultModel'] == "Model_1061" && $value['selectedBaseFrame'] == "Base_Solid"){
                    $baseSolidQuantity = 1; 
                }else if($value['defaultModel'] == "Model_1200" && $value['selectedBaseFrame'] == "Base_Solid"){
                    $baseSolidQuantity = 2; 
                }else if($value['defaultModel'] == "Model_1500" && $value['selectedBaseFrame'] == "Base_Solid"){
                    $baseSolidQuantity = 2; 
                }else if($value['defaultModel'] == "Model_2000" && $value['selectedBaseFrame'] == "Base_Solid"){
                    $baseSolidQuantity = 2; 
                }else if($value['defaultModel'] == "Model_3000" && $value['selectedBaseFrame'] == "Base_Solid"){
                    $baseSolidQuantity = 3; 
                }
                $baseFlatQuantity;
                if($value['defaultModel'] == "Model_661" && $value['selectedBaseFrame'] == "Base_Support_Sides"){
                    $baseFlatQuantity = 2; 
                }else if($value['defaultModel'] == "Model_1061" && $value['selectedBaseFrame'] == "Base_Support_Sides"){
                    $baseFlatQuantity = 2; 
                }else if($value['defaultModel'] == "Model_1200" && $value['selectedBaseFrame'] == "Base_Support_Sides"){
                    $baseFlatQuantity = 2; 
                }else if($value['defaultModel'] == "Model_1500" && $value['selectedBaseFrame'] == "Base_Support_Sides"){
                    $baseFlatQuantity = 3; 
                }else if($value['defaultModel'] == "Model_2000" && $value['selectedBaseFrame'] == "Base_Support_Sides"){
                    $baseFlatQuantity = 3; 
                }else if($value['defaultModel'] == "Model_3000" && $value['selectedBaseFrame'] == "Base_Support_Sides"){
                    $baseFlatQuantity = 4; 
                }
                $headerRodsQuantity;
                if($value['defaultModel'] == "Model_661" && ($value['topOption'] == "Shelf" || $value['headerRodToggle'])){
                    $headerRodsQuantity = 2; 
                }else if($value['defaultModel'] == "Model_1061" && ($value['topOption'] == "Shelf" || $value['headerRodToggle'])){
                    $headerRodsQuantity = 2; 
                }else if($value['defaultModel'] == "Model_1200" && ($value['topOption'] == "Shelf" || $value['headerRodToggle'])){
                    $headerRodsQuantity = 3; 
                }else if($value['defaultModel'] == "Model_1500" && ($value['topOption'] == "Shelf" || $value['headerRodToggle'])){
                    $headerRodsQuantity = 3; 
                }else if($value['defaultModel'] == "Model_2000" && ($value['topOption'] == "Shelf" || $value['headerRodToggle'])){
                    $headerRodsQuantity = 3; 
                }else if($value['defaultModel'] == "Model_3000" && ($value['topOption'] == "Shelf" || $value['headerRodToggle'])){
                    $headerRodsQuantity = 4; 
                }

                $rackStandQty = array_key_exists("RackWoodenShelf", $shelfCount) && array_key_exists("RackGlassShelf", $shelfCount) ? $shelfCount['RackGlassShelf'] + $shelfCount['RackWoodenShelf'] : (array_key_exists("RackWoodenShelf", $shelfCount) ? $shelfCount['RackWoodenShelf'] : (array_key_exists("RackGlassShelf", $shelfCount) ? $shelfCount['RackGlassShelf']  : 0));
                $subItemColumnValues = [
                    "Header Type" => $value['topOption'],    
                    "Header Size" => $value['topOption'] == "Header" ? $ModelMeasureArr['Header_Frame']['x'].'mm x '.$ModelMeasureArr['Header_Frame']['y'].'mm x '.$ModelMeasureArr['Header_Frame']['z'].'mm' : "",
                    "Header Qty" => $value['topOption'] == "Header" ? "1" : "",
                    "Header Sell Price" => $value['topOption'] == "Header" ? strval(1 * $priceListBaseOnQty['Header_'.$value['defaultModel'].'_'.$value['defaultHeaderSize']]) : "",
                    "Header Shelf Type" => $value['topOption'] == "Shelf" ? $value['defaultShelfType'] : "",
                    "Header Shelf size" => $value['topOption'] == "Shelf" ? round($ModelMeasureArr[$value['defaultShelfType']]['x']).'mm x '.round($ModelMeasureArr[$value['defaultShelfType']]['y']).'mm x '.round($ModelMeasureArr[$value['defaultShelfType']]['z']).'mm' : "" ,
                    "Header Shelf Qty" => $value['topOption'] == "Shelf" ? "1" : "",
                    "Header Shelf Sell Price" => $value['topOption'] == "Shelf" && $value["defaultShelfType"] == "Header_Wooden_Shelf" ? strval(1 * $priceListBaseOnQty["Header_Woodern_Shelf"]) : ($value['topOption'] == "Shelf" && $value["defaultShelfType"] == "Header_Glass_Shelf" ? strval(1 * $priceListBaseOnQty["Header_Glass_Shelf"]) : ""),
                    "Header Glass Shelf Fixing" => $value['topOption'] == "Shelf" && $value['defaultShelfType'] == "Header_Glass_Shelf" ? round($ModelMeasureArr['Glass_Shelf_Fixing']['x']).'mm x '.round($ModelMeasureArr['Glass_Shelf_Fixing']['y']).'mm x '.round($ModelMeasureArr['Glass_Shelf_Fixing']['z']).'mm' : "" ,
                    "Header Glass Shelf Fixing Qty" => $value['topOption'] == "Shelf" ? "2" : "",
                    "Header Glass Shelf Fixing Sell Price" => $value['topOption'] == "Shelf" && $value["defaultShelfType"] == "Header_Glass_Shelf" ? strval(2 * $priceListBaseOnQty["Header_Glass_Shelf_Fixing"]) : "",
                    "isRod Active" => $value['topOption'] == "Shelf" || $value['headerRodToggle'] ? "Yes" : "No", 
                    "Rod Size" => ($value['topOption'] == "Shelf" || $value['headerRodToggle']) && isset($ModelMeasureArr['Rod']) ? round($ModelMeasureArr['Rod']['x']).'mm x '.round($ModelMeasureArr['Rod']['y']).'mm x '.round($ModelMeasureArr['Rod']['z']).'mm' : "" ,
                    "Rod Color" => $value['topOption'] == "Shelf" || $value['headerRodToggle'] ? $value['rodFrameColor'] : "",
                    "Rod Qty" => $value['topOption'] == "Shelf" || $value['headerRodToggle'] ? strval($headerRodsQuantity) : "",
                    "Rod Sell Price" => $value['topOption'] == "Shelf" || $value['headerRodToggle'] ? strval($headerRodsQuantity * $priceListBaseOnQty["Rod"]) : "",
                    "Frame Type" => $value['defaultModel'],
                    "Frame Size" => $ModelMeasureArr['Frame']['width'].' x '.$ModelMeasureArr['Frame']['height'].' x '.$ModelMeasureArr['Frame']['depth'],
                    "Frame Qty" => $value['slottedSidesToggle'] == false ? "1" : "",
                    "Frame Sell Price" => $value['slottedSidesToggle'] == false ? strval(1 * $priceListBaseOnQty['Frame_'.$value['defaultModel']]) : "",
                    "Frame Border Color" => $value['frameBorderColor'],
                    "Frame Material Type" => $value['frameMaterialType'],
                    "isSlotted Active" => $value['slottedSidesToggle'] == true && ($value['defaultModel'] == "Model_661" || $value['defaultModel'] == "Model_1061" || $value['defaultModel'] == "Model_1200") ? "Yes" : "No",
                    "Frame Slotted Qty" => $value['slottedSidesToggle'] == true && ($value['defaultModel'] == "Model_661" || $value['defaultModel'] == "Model_1061" || $value['defaultModel'] == "Model_1200") ? "1" : "",
                    "Frame Slotted Sell Price" => $value['slottedSidesToggle'] == true && ($value['defaultModel'] == "Model_661" || $value['defaultModel'] == "Model_1061" || $value['defaultModel'] == "Model_1200") ? strval(1 * $priceListBaseOnQty['Frame_Slotted_'.$value['defaultModel']]) : "",
                    "Rack Wooden Shelf" => $value['slottedSidesToggle'] == true && in_array('RackWoodenShelf', $RackArr) ?  "Yes" : "No",
                    "Rack Wooden Shelf Size" => $value['slottedSidesToggle'] == true && in_array('RackWoodenShelf', $RackArr) ? round($ModelMeasureArr['RackWoodenShelf']['x']).'mm x '.round($ModelMeasureArr['RackWoodenShelf']['y']).'mm x '.round($ModelMeasureArr['RackWoodenShelf']['z']).'mm' : "",
                    "Rack Wooden Shelf Qty" => array_key_exists("RackWoodenShelf", $shelfCount) ? strval($shelfCount['RackWoodenShelf']) : "",
                    "Rack Wooden Shelf Sell Price" => array_key_exists("RackWoodenShelf", $shelfCount) ? strval($shelfCount['RackWoodenShelf'] * $priceListBaseOnQty["Rack_Wooden_Shelf"]) : "",
                    "Rack Glass Shelf" => $value['slottedSidesToggle'] == true &&  in_array('RackGlassShelf', $RackArr) ?  "Yes" : "No",
                    "Rack Glass Shelf Size" => $value['slottedSidesToggle'] == true &&  in_array('RackGlassShelf', $RackArr) ? round($ModelMeasureArr['RackGlassShelf']['x']).'mm x '.round($ModelMeasureArr['RackGlassShelf']['y']).'mm x '.round($ModelMeasureArr['RackGlassShelf']['z']).'mm' : "",
                    "Rack Glass Shelf Qty" => array_key_exists("RackGlassShelf", $shelfCount) ? strval($shelfCount['RackGlassShelf']) : "",
                    "Rack Glass Shelf Sell Price" => array_key_exists("RackGlassShelf", $shelfCount) ? strval($shelfCount['RackGlassShelf'] * $priceListBaseOnQty["Rack_Glass_Shelf"]) : "",
                    "Rack Color" => $value['slottedSidesToggle'] == true && ($value['defaultModel'] == "Model_661" || $value['defaultModel'] == "Model_1061" || $value['defaultModel'] == "Model_1200") ? $value['defaultRackShelfStandColor'] : "",
                    "Rack Stand Color" => $value['slottedSidesToggle'] == true && ($value['defaultModel'] == "Model_661" || $value['defaultModel'] == "Model_1061" || $value['defaultModel'] == "Model_1200") ? $value['defaultRackStandStandColor'] : "",
                    "Rack Stand Qty" => $rackStandQty !== 0 ? strval($rackStandQty * 2) : "",
                    "Rack Stand Sell Price" => $rackStandQty !== 0 ? strval(($rackStandQty * 2) * $priceListBaseOnQty["Rack_Shelf_Bracket"]) : "",
                    "Base Type" => isset($ModelMeasureArr['Base_Solid']) ? "Base_Solid" : "Base_Support_Sides" ,
                    "Base Size" => $baseSize,
                    "Base Qty" => isset($ModelMeasureArr['Base_Solid']) ? strval($baseSolidQuantity) : (isset($ModelMeasureArr['Base_Support_Sides']) ? strval($baseFlatQuantity) : ""),
                    "Base Sell Price" => isset($ModelMeasureArr['Base_Solid']) ? strval($baseSolidQuantity * $priceListBaseOnQty["Base_solid"]) : (isset($ModelMeasureArr['Base_Support_Sides']) ? strval($baseFlatQuantity * $priceListBaseOnQty["Base_flat"]) : ""),
                    "Hanger Rail Step" => in_array('Hanger_Rail_Step', $HangerArr) ? 'Hanger_Rail_Step' : "",
                    "Hanger Rail Step Size" => in_array('Hanger_Rail_Step', $HangerArr)  ? round($ModelMeasureArr['Hanger_Rail_Step']['x']).'mm x '.round($ModelMeasureArr['Hanger_Rail_Step']['y']).'mm x '.round($ModelMeasureArr['Hanger_Rail_Step']['z']).'mm' : "",
                    "Hanger Rail Step Qty" => array_key_exists("Hanger_Rail_Step", $hangerCount) ? strval($hangerCount['Hanger_Rail_Step']) : "",
                    "Hanger Rail Step Sell Price" => array_key_exists("Hanger_Rail_Step", $hangerCount) ? strval($hangerCount['Hanger_Rail_Step'] * $priceListBaseOnQty["Hanger_Rail_Step"]) : "",
                    "Hanger Rail Single" => in_array('Hanger_Rail_Single', $HangerArr) ? 'Hanger_Rail_Single' : "",
                    "Hanger Rail Single Size" => in_array('Hanger_Rail_Single', $HangerArr) ? round($ModelMeasureArr['Hanger_Rail_Single']['x']).'mm x '.round($ModelMeasureArr['Hanger_Rail_Single']['y']).'mm x '.round($ModelMeasureArr['Hanger_Rail_Single']['z']).'mm' : "",
                    "Hanger Rail Single Qty" => array_key_exists("Hanger_Rail_Single", $hangerCount) ? strval($hangerCount['Hanger_Rail_Single']) : "",
                    "Hanger Rail Single Sell Price" => array_key_exists("Hanger_Rail_Single", $hangerCount) ? strval($hangerCount['Hanger_Rail_Single'] * $priceListBaseOnQty["Hanger_Rail_Single"]) : "",
                    "Hanger Rail D 500" => in_array('Hanger_Rail_D_500mm', $HangerArr) ? 'Hanger_Rail_D_500mm' : "",
                    "Hanger Rail D 500 Size" => in_array('Hanger_Rail_D_500mm', $HangerArr) ? round($ModelMeasureArr['Hanger_Rail_D_500mm']['x']).'mm x '.round($ModelMeasureArr['Hanger_Rail_D_500mm']['y']).'mm x '.round($ModelMeasureArr['Hanger_Rail_D_500mm']['z']).'mm' : "",
                    "Hanger Rail D 500 Qty" => array_key_exists("Hanger_Rail_D_500mm", $hangerCount) ? strval($hangerCount['Hanger_Rail_D_500mm']) : "",
                    "Hanger Rail D 500 Sell Price" => array_key_exists("Hanger_Rail_D_500mm", $hangerCount) ? strval($hangerCount['Hanger_Rail_D_500mm'] * $priceListBaseOnQty["Hanger_Rail_D_500"]) : "",
                    "Hanger Rail D 1000" => in_array('Hanger_Rail_D_1000mm', $HangerArr) ? 'Hanger_Rail_D_1000mm' : "",
                    "Hanger Rail D 1000 Size" => in_array('Hanger_Rail_D_1000mm', $HangerArr) ? round($ModelMeasureArr['Hanger_Rail_D_1000mm']['x']).'mm x '.round($ModelMeasureArr['Hanger_Rail_D_1000mm']['y']).'mm x '.round($ModelMeasureArr['Hanger_Rail_D_1000mm']['z']).'mm' : "",
                    "Hanger Rail D 1000 Qty" => array_key_exists("Hanger_Rail_D_1000mm", $hangerCount) ? strval($hangerCount['Hanger_Rail_D_1000mm']) : "",
                    "Hanger Rail D 1000 Sell Price" => array_key_exists("Hanger_Rail_D_1000mm", $hangerCount) ? strval($hangerCount['Hanger_Rail_D_1000mm'] * $priceListBaseOnQty["Hanger_Rail_D_1000"]) : "",
                    "Hanger Golf Driver" => in_array('Hanger_Golf_Club_Driver', $HangerArr) ? 'Hanger_Golf_Club_Driver' : "",
                    "Hanger Golf Driver Size" => in_array('Hanger_Golf_Club_Driver', $HangerArr) ? round($ModelMeasureArr['Hanger_Golf_Club_Driver']['x']).'mm x '.round($ModelMeasureArr['Hanger_Golf_Club_Driver']['y']).'mm x '.round($ModelMeasureArr['Hanger_Golf_Club_Driver']['z']).'mm' : "",
                    "Hanger Golf Driver Qty" => array_key_exists("Hanger_Golf_Club_Driver", $hangerCount) ? strval($hangerCount['Hanger_Golf_Club_Driver']) : "",
                    "Hanger Golf Driver Sell Price" => array_key_exists("Hanger_Golf_Club_Driver", $hangerCount) ? strval($hangerCount['Hanger_Golf_Club_Driver'] * $priceListBaseOnQty["Hanger_Golf_Driver"]) : "",
                    "Hanger Golf Iron" => in_array('Hanger_Golf_Club_Iron', $HangerArr) ? 'Hanger_Golf_Club_Iron' : "",
                    "Hanger Golf Iron Size" => in_array('Hanger_Golf_Club_Iron', $HangerArr) ? round($ModelMeasureArr['Hanger_Golf_Club_Iron']['x']).'mm x '.round($ModelMeasureArr['Hanger_Golf_Club_Iron']['y']).'mm x '.round($ModelMeasureArr['Hanger_Golf_Club_Iron']['z']).'mm' : "",
                    "Hanger Golf Iron Qty" => array_key_exists("Hanger_Golf_Club_Iron", $hangerCount) ? strval($hangerCount['Hanger_Golf_Club_Iron']) : "",
                    "Hanger Golf Iron Sell Price" => array_key_exists("Hanger_Golf_Club_Iron", $hangerCount) ? strval($hangerCount['Hanger_Golf_Club_Iron'] * $priceListBaseOnQty["Hanger_Golf_Iron"]) : "",
                    "Header Image" => isset($headerImage['headerImage']) ? $headerImage['headerImage'] : "",
                    "Frame Image" => isset($frameImage['frameImage']) ? $frameImage['frameImage'] : "",
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
                // echo "<pre>"; print_r($columnValuesJson);
                // echo "<pre>"; print_r($mutation);
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
        ["title" => "Product Cost", "type" => "text"],
        ["title" => "Pricing Structure", "type" => "dropdown", "labels" => ["A - 2", "B - 1.8", "C - 1.5", "D - 1.3", "E - 1.2", "F - 1"]],
        ["title" => "Total Cost", "type" => "text"],
        ["title" => "Labour Cost", "type" => "text"],
        ["title" => "Packaging Cost", "type" => "text"],
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
            // Create mutation based on column type
            if ($column['type'] === 'dropdown') {
                $createColumnMutation = 'mutation {
                    create_column (
                        board_id: ' . $boardId . ',
                        title: "' . addslashes($column['title']) . '",
                        column_type: dropdown,
                        defaults: "{\"settings\":{\"labels\":[
                            {\"id\":1,\"name\":\"A - 2\"}, 
                            {\"id\":2,\"name\":\"B - 1.8\"}, 
                            {\"id\":3,\"name\":\"C - 1.5\"},
                            {\"id\":4,\"name\":\"D - 1.3\"}, 
                            {\"id\":5,\"name\":\"E - 1.2\"}, 
                            {\"id\":6,\"name\":\"F - 1\"}
                        ]}}"
                    ) {
                        id
                    }
                }';
            } else {
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
    $labourPackageCostArr = [
        "Labour_Price" => "Labour Price", 
        "Packaging_Price" => "Packaging Price", 
    ];
    $labourAndPackagingCost = [];
    foreach ($labourPackageCostArr as $nameKey => $valueKey){
        foreach ($priceBoardData as $dataPriceKey => $dataPriceValue) {
            if($valueKey == $dataPriceKey){
                if($formData['Qty'] > 0 && $formData['Qty'] <= 10){
                    $labourAndPackagingCost[$nameKey] = (int)str_replace('"', '', $dataPriceValue["Sell Price 1-10"]);
                }else if($formData['Qty'] >= 11 && $formData['Qty'] <= 25){
                    $labourAndPackagingCost[$nameKey] = (int)str_replace('"', '', $dataPriceValue["Sell Price 11-25"]);
                }else if($formData['Qty'] >= 26 && $formData['Qty'] <= 50){
                    $labourAndPackagingCost[$nameKey] = (int)str_replace('"', '', $dataPriceValue["Sell Price 26-50"]);
                }else if($formData['Qty'] >= 51 && $formData['Qty'] <= 100){
                    $labourAndPackagingCost[$nameKey] = (int)str_replace('"', '', $dataPriceValue["Sell Price 51-100"]);
                }else if($formData['Qty'] > 100){
                    $labourAndPackagingCost[$nameKey] = (int)str_replace('"', '', $dataPriceValue["Sell Price 100+"]);
                }
            }
        } 
    }
    $columnValues = [];
    $dropDownColumnVal;
    $grandTotalCost = ($formData['Qty'] * $labourAndPackagingCost['Labour_Price']) + ($formData['Qty'] * $labourAndPackagingCost['Packaging_Price']);
    $formData['Product Cost'] = strval($totalPrice);
    $formData['Total Cost'] = strval((($totalPrice * 1.5) * $formData['Qty']) + $grandTotalCost);
    $formData['Labour Cost'] = strval($formData['Qty'] * $labourAndPackagingCost['Labour_Price']);
    $formData['Packaging Cost'] = strval($formData['Qty'] * $labourAndPackagingCost['Packaging_Price']);
    foreach ($formData as $field => $value) {
        foreach ($mondayColumns as $column) {
            if ($column['title'] == $field) {
                $columnValues[$column['id']] = $value;
            }
            if($column['title'] == "Pricing Structure"){
                $dropDownColumnVal = $column['id'];
            }
        }
    }
    // ---------------------------------- MATCHING COLUMNS ----------------------------------------------------
    // ---------------------------------- ADDING TO MONDAY BOARD ----------------------------------------------------
    $columnValuesJson = json_encode($columnValues, JSON_UNESCAPED_SLASHES);
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
    //----------------------------------------- UPDATE DROPDOWN COLUMNS
    $dropMutation = '
        mutation {
            change_column_value(
                item_id: ' . $itemId . ',
                board_id: ' . $boardId . ',
                column_id: "'.$dropDownColumnVal.'"
                value: "{\"ids\": [3]}"
            ) {
                id
            }
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
        CURLOPT_POSTFIELDS => json_encode(['query' => $dropMutation]),
        CURLOPT_HTTPHEADER => array(
            'Authorization: Bearer ' . $apiToken,
            'Content-Type: application/json',
        ),
    ));

    // Execute the request to update the column values
    $response = curl_exec($curl);
    curl_close($curl); 
    //----------------------------------------- UPDATE DROPDOWN COLUMNS 


    sendEmailToUser($_REQUEST);
    echo json_encode(["status" => "success", "message" => $response]);
    exit;
    // ---------------------------------- ADDING TO MONDAY BOARD ----------------------------------------------------
} else if (!empty($_REQUEST['action']) && $_REQUEST['action'] == 'setSessionData'){
    $_SESSION['user_id'] = $_REQUEST['userId'];
    $_SESSION['username'] = $_REQUEST['username'];
} else if(!empty($_REQUEST['action']) && $_REQUEST['action'] == 'createMainBoard'){
    $apiToken = "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjQ0MzA5Mjc2NSwiYWFpIjoxMSwidWlkIjo2OTE2MjExMCwiaWFkIjoiMjAyNC0xMi0wMlQwNToxMDo0My4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MjY3NzIwODAsInJnbiI6ImFwc2UyIn0.htHEKSVIIvtaIyoGdM9K8iHx3GYvE2mZv-RG87LfjBM";
    // Initialize cURL
    $query = 'query {
                boards {
                    id
                    name
                    description
                    state
                    board_kind
                    board_folder_id
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

    // Execute the request and get the response
    $response = curl_exec($curl);
    curl_close($curl);
    $responseSearchBoard = json_decode($response, true);
    $isPriceBoard = false;
    foreach ($responseSearchBoard['data']['boards'] as $boardKey => $boardValue) {
        if($boardValue['name'] == "Price Board"){
            $isPriceBoard = true;
        }   
    }
    if(!$isPriceBoard){
        $mutation = 'mutation createBoard(
                        $boardName: String!
                        $boardKind: BoardKind!
                    ) {
                        create_board(
                            board_name: $boardName,
                            board_kind: $boardKind,
                        ) {
                            id
                            name
                            board_kind
                            board_folder_id
                            workspace_id
                            state
                            description
                            columns {
                                id
                                title
                                type
                            }
                        }
                    }';
        $variables = [
            'boardName' => "Price Board",
            'boardKind' => "public",
        ];
        // Remove null values from variables
        $variables = array_filter($variables, function($value) {
            return $value !== null;
        });
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
            CURLOPT_POSTFIELDS =>json_encode(['query' => $mutation, 'variables' => $variables]),
            CURLOPT_HTTPHEADER => array(
                'Authorization: Bearer ' . $apiToken,
                'Content-Type: application/json',
            ),
        ));

        // Execute the request and get the response
        $response = curl_exec($curl);
        curl_close($curl);
        $responseForBoard = json_decode($response, true);
        $boardId = $responseForBoard['data']['create_board']['id'];
        // -------------------------------- create column ------------------------------
        $columnData = [
            "Cost Price" => "text",
            "Sell Price 1-10" => "text",
            "Sell Price 11-25" => "text",
            "Sell Price 26-50" => "text",
            "Sell Price 51-100" => "text",
            "Sell Price 100+" => "text",
        ];

        // Retrieve Existing Columns
        $existingColumns = getExistingColumns($apiToken, $boardId);
        // Create Missing Columns
        foreach ($columnData as $columnName => $columnType) {
            if (!in_array($columnName, $existingColumns)) {
                $mutationsForColumnCreate = 'mutation {
                        create_column (
                            board_id: ' . $boardId . ',
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
                    CURLOPT_POSTFIELDS => json_encode(['query' => $mutationsForColumnCreate]),
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
        // -------------------------------- create column ------------------------------
        // -------------------------------- get column id ------------------------------
        // GraphQL query to fetch columns
        $query = 'query {
            boards(ids: ' . $boardId . ') {
                columns {
                    id
                    title
                    type
                }
            }
        }';
    
        // Initialize cURL
        $curl = curl_init();
        curl_setopt_array($curl, [
            CURLOPT_URL => 'https://api.monday.com/v2',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode(['query' => $query]),
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $apiToken,
                'Content-Type: application/json',
            ],
        ]);
    
        // Execute the request
        $response = curl_exec($curl);
        curl_close($curl);
    
        // Decode the JSON response
        $responseData = json_decode($response, true);
    
        // Extract column IDs and titles
        $columnsIdArr = [];
        if (isset($responseData['data']['boards'][0]['columns'])) {
            foreach ($responseData['data']['boards'][0]['columns'] as $column) {
                $columnsIdArr[$column['title']] = $column['id'];
            }
        }
        // -------------------------------- get column id ------------------------------
        // -------------------------------- create item ------------------------------
        $filePath = 'price.json';
        if (!file_exists($filePath)) {
            throw new Exception("JSON file not found at: " . $filePath);
        }
        $jsonString = file_get_contents($filePath);
        if ($jsonString === false) {
            throw new Exception("Failed to read JSON file");
        }
        $jsonData = json_decode($jsonString, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("JSON decode error: " . json_last_error_msg());
        }
        // echo "<pre>"; print_r($jsonData);
        $itemData = [
            "Header 661X300",
            "Header 1061X300",
            "Header 1200X300",
            "Header 1500X300",
            "Header 2000X300",
            "Header 3000X300",
            "Header 661X500",
            "Header 1061X500",
            "Header 1200X500",
            "Header 1500X500",
            "Header 2000X500",
            "Header 3000X500",
            "Header Woodern Shelf",
            "Header Glass Shelf",
            "Header Glass Shelf Fixing",
            "Rod",
            "Frame 661mm Wide",
            "Frame Slotted 661mm",
            "Frame 1061mm Wide",
            "Frame Slotted 1061mm",
            "Frame 1200mm Wide",
            "Frame Slotted 1200mm",
            "Frame 1500mm Wide",
            "Frame 2000mm Wide",
            "Frame 3000mm Wide",
            "Rack Wooden Shelf",
            "Rack Glass Shelf",
            "Rack Shelf Bracket",
            "Base solid",
            "Base flat",
            "Hanger Rail Step",
            "Hanger Rail Single",
            "Hanger Rail D 500",
            "Hanger Rail D 1000",
            "Hanger Golf Driver",
            "Hanger Golf Iron",
            "Labour Price",
            "Packaging Price",
        ];
        foreach ($itemData as $itemName) {
            $mutationForItemCreate = 'mutation {
                    create_item (
                        board_id: ' . $boardId . ',
                        item_name: "' . addslashes($itemName) . '"
                    ) {
                        id
                        name
                        column_values {
                            id
                            value
                            text
                        }
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
                CURLOPT_POSTFIELDS => json_encode(['query' => $mutationForItemCreate]),
                CURLOPT_HTTPHEADER => array(
                    'Authorization: Bearer ' . $apiToken,
                    'Content-Type: application/json',
                ),
            ));
    
            $response = curl_exec($curl);
            curl_close($curl);
            $responseOfCreatedItem = json_decode($response, true);
    
            $itemId = $responseOfCreatedItem['data']['create_item']['id'];
            $createdItemName = $responseOfCreatedItem['data']['create_item']['name'];
            foreach ($jsonData[0] as $dataKey => $dataValue) {
                if ($dataKey == $createdItemName) {
                    // Update the column values for the created item
                    foreach ($dataValue as $columnTitle => $columnValue) {
                        $columnId = $columnsIdArr[$columnTitle];
                        $mutationForColumnUpdate = 'mutation {
                            change_simple_column_value(
                                board_id: ' . $boardId . ',
                                item_id: ' . $itemId . ',
                                column_id: "' . $columnId . '",
                                value: "' . addslashes($columnValue) . '"
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
                            CURLOPT_POSTFIELDS => json_encode(['query' => $mutationForColumnUpdate]),
                            CURLOPT_HTTPHEADER => array(
                                'Authorization: Bearer ' . $apiToken,
                                'Content-Type: application/json',
                            ),
                        ));
    
                        $columnResponse = curl_exec($curl);
                        curl_close($curl);
                        $responseForColumn = json_decode($columnResponse, true);
                        if (!isset($responseForColumn['data']['change_simple_column_value'])) {
                            echo "Error updating column for item $createdItemName: " . print_r($responseForColumn, true);
                        }
                        sleep(2);
                    }
                }
            }
            sleep(2);
            // -------------------------------- create item ------------------------------
        }
    }
}else {
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
        $mail->addAddress($data['Email'], $data['Customer']);  // Add a recipient

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