<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Database connection
$servername = "3.8.249.69";
$username = "three_model";
$password = "Miami@123";
$dbname = "three_model";

$conn = new mysqli($servername, $username, $password, $dbname);
define('UPDATE_VALUE', '876635920e53248d9c00486f534deb4f');
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}