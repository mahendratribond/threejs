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
    $mpdf = new \Mpdf\Mpdf([
            'tempDir' => './uploads',
            'format' => 'A4',
            'margin_left' => 11,
            'margin_right' => 12,
            'margin_top' => 13,
            'margin_bottom' => 12,
            'margin_header' => 0,
            'margin_footer' => 8,
        ]);
    $mpdf->SetHTMLFooter('
    <table width="100%">
        <tr>
            <td width="50%" style="text-align: left; font-size: 11px;font-family:arial;"><b>BIGINSTORE</b> | THREE MODEL </td>
            <td width="50%" align="right" style="font-size: 11px;font-family:arial;">Page {PAGENO}/{nbpg}</td>
        </tr>
    </table>');

    // Start output buffering
    ob_start();
    // Include the HTML template
    include 'pdfContent.php'; // Adjust the path if needed
    // Get the contents of the buffer
    $html = ob_get_clean();
    // Load the HTML content from the file
    // $html = file_get_contents('content.html'); // Adjust the path if necessary
    $mpdf->WriteHTML($html);

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
    $savePath = "./screenshots/" .time()."_". $filename; // Save to "screenshots" directory
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
