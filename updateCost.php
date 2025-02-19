<?php
require_once __DIR__ . '/vendor/autoload.php';
include 'connection.php';
ini_set('display_errors', 1);
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$filename = "uploads/test.txt";
$myfile = fopen($filename, "w") or die("Unable to open file!");

$rawJason = file_get_contents('php://input');
$requestData = json_decode($rawJason, true);

if (!function_exists('getallheaders')) {
    function getallheaders()
    {
        $headers = array();
        foreach ($_SERVER as $name => $value) {
            if (substr($name, 0, 5) == 'HTTP_') {
                $headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value;
            }
        }
        return $headers;
    }
}
$headerArr = getallheaders();
$token = isset($headerArr['authorization']) ? $headerArr['authorization'] : $headerArr['Authorization'];

$text_to_write['token'] = $token;
$text_to_write['boday'] = $requestData;

fwrite($myfile, json_encode($text_to_write));
fclose($myfile);

$boardId = $requestData['payload']['inputFields']['boardId'];
$itemId = $requestData['payload']['inputFields']['itemId'];
$apiToken = "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjQ0MzA5Mjc2NSwiYWFpIjoxMSwidWlkIjo2OTE2MjExMCwiaWFkIjoiMjAyNC0xMi0wMlQwNToxMDo0My4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MjY3NzIwODAsInJnbiI6ImFwc2UyIn0.htHEKSVIIvtaIyoGdM9K8iHx3GYvE2mZv-RG87LfjBM";

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
    CURLOPT_POSTFIELDS => '{"query":"query {\\n                boards (ids: [' . $boardId . ']) {\\n                    columns {\\n                    id\\n                    title\\n                    type\\n                    settings_str\\n                    }\\t\\t\\n                }\\n                items (ids: [' . $itemId . ']) {\\n                    name\\n                column_values { text id value column { id title } } }\\n            }","variables":{}}',
    CURLOPT_HTTPHEADER => array(
        'Authorization: Bearer ' . $apiToken,
        'Content-Type: application/json',
    ),
));

// Execute the request and get the response
$response = curl_exec($curl);
curl_close($curl);
$responseData = json_decode($response, true);

$columnData = $responseData['data']['boards'][0]['columns'];
$columnVal = $responseData['data']['items'][0]['column_values'];
$colDropDownData;
$colDropDownVal;
$colProductQty;
$colProductCost;
$colLabourCost;
$colPackageCost;
$colTotalCostId;
foreach ($columnData as $cDKey => $cDValue) {
    foreach($columnVal as $cVKey => $cVValue){
        if($cDValue['title'] == "Pricing Structure" && $cDValue['id'] == $cVValue['id']){
            $colDropDownData = $cDValue['settings_str'];
            $colDropDownVal = $cVValue['value'];
        }
        if($cDValue['title'] == "Qty" && $cDValue['id'] == $cVValue['id']){
            $colProductQty = (int)str_replace('"', '', $cVValue['value']);
        }
        if($cDValue['title'] == "Product Cost" && $cDValue['id'] == $cVValue['id']){
            $colProductCost = (int)str_replace('"', '', $cVValue['value']);
        }
        if($cDValue['title'] == "Labour Cost" && $cDValue['id'] == $cVValue['id']){
            $colLabourCost = (int)str_replace('"', '', $cVValue['value']);
        }
        if($cDValue['title'] == "Packaging Cost" && $cDValue['id'] == $cVValue['id']){
            $colPackageCost = (int)str_replace('"', '', $cVValue['value']);
        }
        if($cDValue['title'] == "Total Cost" && $cDValue['id'] == $cVValue['id']){
            $colTotalCostId = $cDValue['id'];
        }
    }
}
$colDropDownData = json_decode($colDropDownData, true);
$colDropDownVal = json_decode($colDropDownVal, true);
$newDropDownValue;
foreach($colDropDownData['labels'] as $dDKey => $dDValue){
    if($dDValue['id'] == $colDropDownVal['ids'][0]){
        $part = explode('-', $dDValue['name']);
        $value = trim($part[1]);
        $newDropDownValue = (($colProductCost * $value) * $colProductQty) + $colLabourCost + $colPackageCost;
        break;
    }else{
        $newDropDownValue = (($colProductCost * 1.5) * $colProductQty) + $colLabourCost + $colPackageCost;
    }
}
// Convert the column values to JSON
$columnsToUpdate[$colTotalCostId] = strval($newDropDownValue);
$columnValuesJson = json_encode($columnsToUpdate, JSON_UNESCAPED_SLASHES);
// Construct the GraphQL mutation
$mutation = 'mutation {
    change_multiple_column_values(
        item_id: ' . $itemId . ',
        board_id: ' . $boardId . ',
        column_values: "' . addslashes($columnValuesJson) . '"
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
    CURLOPT_POSTFIELDS => json_encode(['query' => $mutation]),
    CURLOPT_HTTPHEADER => array(
        'Authorization: Bearer ' . $apiToken,
        'Content-Type: application/json',
    ),
));

// Execute the request and get the response
$response = curl_exec($curl);
curl_close($curl);
?>