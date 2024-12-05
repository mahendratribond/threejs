<?php
ini_set('memory_limit', '-1');
set_time_limit(0);
 
require_once 'connection.php';
require_once __DIR__ . '/vendor/autoload.php';
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\PngWriter;
// Start session
session_start();

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
    $time = time();
    $filenameLoc = "./uploads/".$data['fileName'];
    $mpdf->Output($filenameLoc);
    echo json_encode(["success" => true, "message" => "Screenshot saved successfully","url" => $filenameLoc]);
    exit;
} else if (isset($data['image']) && isset($data['filename'])) {
    $imageData = $data['image'];
    $filename = basename($data['filename']); // Use basename to prevent directory traversal attacks
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
    // Detect the current host and scheme
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';
    $host = $_SERVER['HTTP_HOST'];
    // Define base URLs
    $localUrl = "http://192.168.0.173/three-model";
    $liveUrl = "https://biginstore.net/3d_frame_maker";

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
    $modelCropImage = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $base64Image));
    
    // Define the folder where the images will be saved (ensure this folder is writable)
    $targetDir = 'images/modelCropImage/';
    
    // Ensure the target directory exists
    if (!file_exists($targetDir)) {
        mkdir($targetDir, 0777, true);
    }
    
    // Create a unique file name (for example, using a timestamp or UUID)
    $fileName = 'image_' . time() . '.png';
    $filePath = $targetDir . $fileName;
    
    // Save the image to the server
    if (file_put_contents($filePath, $modelCropImage)) {
        // Return the URL of the saved image
        $imageUrl = $targetDir . $fileName; // Relative URL path

        // Respond with success and the image URL
        echo json_encode([
            'success' => true,
            'imageUrl' => $imageUrl
        ]);
    } else {
        // If there's an error saving the image
        echo json_encode(['success' => false, 'message' => 'Error saving image']);
    }
} else if (!empty($_REQUEST['action']) && $_REQUEST['action'] == 'formSubmitionForMonday'){
    $formData = $_REQUEST;
    $apiToken = "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjQ0MzA5Mjc2NSwiYWFpIjoxMSwidWlkIjo2OTE2MjExMCwiaWFkIjoiMjAyNC0xMi0wMlQwNToxMDo0My4wOTZaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MjY3NzIwODAsInJnbiI6ImFwc2UyIn0.2_FqtE-X7ptRGVXKmtlNP77LJUjivi-Y33q6lNn8OxE";
    $boardId = 1942435428;
    $itemName = $_SESSION['username'];

    // Escape and encode the item name to safely include it in the GraphQL query
    $itemName = addslashes($itemName);

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
    $createItemResponse = curl_exec($curl);
    curl_close($curl);
    $responseForItem = json_decode($createItemResponse, true);
    $itemId = $responseForItem['data']['create_item']['id'];

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
    // echo "<pre>";print_r($mondayColumns);
    // Create an object to store the column values
    $columnValues = [];

    // Loop through the formData and match it with Monday column titles
    foreach ($formData as $field => $value) {
        foreach ($mondayColumns as $column) {
            if ($column['title'] === $field) {
                // Store the value using the column ID in the object
                $columnValues[$column['id']] = $value;
                break;
            }
        }
    }
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
    // echo "<pre>";print_r($mutation);


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
    echo json_encode($response);
    exit;
} else {
    echo json_encode("No Action Found"); // No action found    
}

$conn->close();
