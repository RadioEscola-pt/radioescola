<?php
require 'database_connection.php'; // Adjust this line to use your actual database connection

if (isset($_GET['code'])) {
    $code = $_GET['code'];

    // Query to check if there's a user with this verification code and not already verified
    $query = "SELECT * FROM users WHERE verification_code = ? AND verified = 0 LIMIT 1";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $code);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // User found, update the verified status
        $updateQuery = "UPDATE users SET verified = 1 WHERE verification_code = ?";
        $updateStmt = $conn->prepare($updateQuery);
        $updateStmt->bind_param("s", $code);
        if ($updateStmt->execute()) {
            echo "Your email has been verified. You can now login.";
        } else {
            echo "Error updating record: " . $conn->error;
        }
    } else {
        echo "This verification code is invalid or the email has already been verified.";
    }
} else {
    echo "No verification code provided.";
}
?>
