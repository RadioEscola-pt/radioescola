<?php
session_start(); // Start the session at the beginning
require 'database_connection.php'; 

// Create database
$sql = "CREATE DATABASE IF NOT EXISTS $dbname";
if ($conn->query($sql) === TRUE) {
    echo "Database created successfully\n";
} else {
    echo "Error creating database: " . $conn->error;
}

// Select the database
$conn->select_db($dbname);

// sql to create users table
$sql = "CREATE TABLE IF NOT EXISTS users (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    call_sign VARCHAR(50),
    Full_name VARCHAR(255),
    birthday DATE,
    is_certified BOOLEAN DEFAULT 0,
    verification_code VARCHAR(255) NOT NULL,
    verified BOOLEAN DEFAULT 0,
    role ENUM('pupil', 'contributor', 'admin') NOT NULL DEFAULT 'pupil',
    certification_level ENUM('NOHAM', 'cat 3', 'cat 2', 'cat 1') NOT NULL DEFAULT 'NOHAM',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_email (email)
)";

if ($conn->query($sql) === TRUE) {
    echo "Table users created successfully\n";
} else {
    echo "Error creating users table: " . $conn->error;
}
// Add default admin user
$adminEmail = 'admin@admin.com';
$adminPassword = password_hash('adminPassword', PASSWORD_DEFAULT); // Replace 'adminPassword' with a strong password
$adminFullName = 'Admin User';
$adminCallSign = 'AAA'; // Replace with a real or placeholder call sign if necessary

$sql = "INSERT INTO users (email, password, call_sign, Full_name, role, verified) VALUES (?, ?, ?, ?, 'admin', 1) ON DUPLICATE KEY UPDATE email=email";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssss", $adminEmail, $adminPassword, $adminCallSign, $adminFullName);
if ($stmt->execute()) {
    echo "Default admin user created successfully\n";
} else {
    echo "Error creating default admin user: " . $stmt->error;
}

// sql to create id_photos table
$sql = "CREATE TABLE IF NOT EXISTS id_photos (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT(6) UNSIGNED NOT NULL,
    Full_name VARCHAR(255),
    image_type VARCHAR(50),
    image_data LONGBLOB,
    verified BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)";

if ($conn->query($sql) === TRUE) {
    echo "Table id_photos created successfully\n";
} else {
    echo "Error creating id_photos table: " . $conn->error;
}

// sql to create ham_licenses table
$sql = "CREATE TABLE IF NOT EXISTS ham_licenses (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT(6) UNSIGNED NOT NULL,
    call_sign VARCHAR(50),
    image_type VARCHAR(50),
    image_data LONGBLOB,
    verified BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)";

if ($conn->query($sql) === TRUE) {
    echo "Table ham_licenses created successfully";
} else {
    echo "Error creating ham_licenses table: " . $conn->error;
}

$conn->close();
?>
