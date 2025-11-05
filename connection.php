<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Database connection
$servername = "localhost";
$username = "mamp";
$password = "123456";
$dbname = "three-model";

$conn = new mysqli($servername, $username, $password, $dbname);
define('UPDATE_VALUE', '876635920e53248d9c00486f534deb4f');
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
