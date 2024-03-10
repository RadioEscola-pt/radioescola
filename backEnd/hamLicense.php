<?php
session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'User not authenticated']);
    exit;
}

require 'database_connection.php';

// Check if the form was submitted
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_FILES["ham_license"])&& isset($_POST['call_sign'])) {
    $userId = $_SESSION['user_id'];
    $file = $_FILES['ham_license'];

    // Check for upload errors
    if ($file['error'] !== UPLOAD_ERR_OK) {
        echo json_encode(['error' => 'An error occurred during file upload.']);
        exit;
    }

    // Validate file type
    $fileType = $file['type'];
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!in_array($fileType, $allowedTypes)) {
        echo json_encode(['error' => 'Invalid file type. Allowed types are JPEG, PNG, and GIF.']);
        exit;
    }

    // Read the file content
    $imageContent = file_get_contents($file['tmp_name']);

    // Prepare the SQL statement
    $stmt = $conn->prepare("INSERT INTO ham_licenses (user_id, image_type, image_data, call_sign) VALUES (?, ?, ?, ?)");
    $stmt->bind_param('iss', $userId, $fileType, $imageContent);

    // Execute the statement
    if ($stmt->execute()) {
        echo json_encode(['success' => 'Ham radio license uploaded successfully.']);
    } else {
        echo json_encode(['error' => 'An error occurred while uploading the ham radio license.']);
    }

    $stmt->close();
    $conn->close();
} else {
    echo json_encode(['error' => 'No file uploaded.']);
}
?>
