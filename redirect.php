<?php
// Get the model URL from the query parameter
$modelUrl = isset($_GET['url']) ? urldecode($_GET['url']) : null;

// Ensure a URL is provided
if (!$modelUrl) {
    http_response_code(400);
    echo "Error: No model URL provided.";
    exit;
}

// Detect user device
$userAgent = $_SERVER['HTTP_USER_AGENT'];

if (strpos($userAgent, 'iPhone') !== false || strpos($userAgent, 'iPad') !== false) {
    // Redirect to USDZ file for iOS
    header("Location: $modelUrl.usdz");
} else {
    // Redirect to GLB file for Android with Scene Viewer
    $sceneViewerUrl = "intent://arvr.google.com/scene-viewer/1.0?file=$modelUrl.glb&mode=ar_only#Intent;scheme=https;package=com.google.ar.core;end;";
    header("Location: $sceneViewerUrl");
}
exit;
?>
