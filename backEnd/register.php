<?php
// Include your database connection here
require 'database_connection.php'; 

header('Content-Type: application/json'); // Specify the content type as JSON

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST['email'];
    $password = $_POST['password']; // Consider hashing this password before storing
    $verification_code = bin2hex(random_bytes(16)); // Generate a unique verification code
    
    // Check if email already exists
    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows > 0) {
        echo json_encode(["success" => false, "message" => "This email is already registered. Please use another email."]);
    } else {
        // Email doesn't exist, proceed to insert
        $hashed_password = password_hash($password, $hashed_password); // Hash the password
        
        $stmt = $conn->prepare("INSERT INTO users (email, password, verification_code, verified) VALUES (?, ?, ?, 0)");
        $stmt->bind_param("sss", $email, $hashed_password, $verification_code);
        
        if ($stmt->execute()) {
            // Send verification email
            $to = $email;
            $subject = "Confirm your email address";
            $verificationLink = "http://yourwebsite.com/confirm_email.php?code=" . $verification_code;

            $message = "
            <html>
            <head>
            <title>Confirm your email address</title>
            </head>
            <body>
            <p>Please click the link below to confirm your email address:</p>
            <a href='$verificationLink'>$verificationLink</a>
            </body>
            </html>
            ";

            // Always set content-type when sending HTML email
            $headers = "MIME-Version: 1.0" . "\r\n";
            $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
            $headers .= 'From: <your-email@example.com>' . "\r\n";

            if (mail($to, $subject, $message, $headers)) {
                echo json_encode(["success" => true, "message" => "Registration successful! Please check your email to confirm your address."]);
            } else {
                echo json_encode(["success" => false, "message" => "There was a problem sending the confirmation email."]);
            }
        } else {
            echo json_encode(["success" => false, "message" => "There was an error registering the user: " . $conn->error]);
        }
    }
}
?>
