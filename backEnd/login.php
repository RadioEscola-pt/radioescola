<?php
session_start(); // Start the session at the beginning
require 'database_connection.php'; 

$response = ['success' => false, 'message' => 'Invalid request.'];

if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['email']) && isset($_POST['password'])) {
    $email = $_POST['email'];
    $password = $_POST['password'];
    
    // Prepare a select statement
    $sql = "SELECT id, password, verified, call_sign, birthday FROM users WHERE email = ?";
    
    if ($stmt = $conn->prepare($sql)) {
        // Bind variables to the prepared statement as parameters
        $stmt->bind_param("s", $email);
        
        // Attempt to execute the prepared statement
        if ($stmt->execute()) {
            // Store result
            $stmt->store_result();
            
            // Check if email exists, if yes then verify password
            if ($stmt->num_rows == 1) {
                // Bind result variables
                $stmt->bind_result($id, $hashed_password, $verified, $call_sign, $birthday);
                if ($stmt->fetch()) {
                    if (password_verify($password, $hashed_password)) {
                        // Check if the email is verified
                        if ($verified == 1) {
                            // Password is correct and email is verified, so start a new session
                            
                            // Store data in session variables
                            $_SESSION["loggedin"] = true;
                            $_SESSION["id"] = $id;
                            $_SESSION["email"] = $email;
                            $_SESSION["call_sign"] = $call_sign;
                            $_SESSION["birthday"] = $birthday;
                            
                            // Prepare the response with session variables
                            $response = [
                                'success' => true, 
                                'message' => 'Login successful.',
                                'user' => [
                                    'id' => $_SESSION["id"],
                                    'email' => $_SESSION["email"],
                                    'call_sign' => $_SESSION["call_sign"],
                                    'birthday' => $_SESSION["birthday"]
                                ]
                            ];
                        } else {
                            $response = ['success' => false, 'message' => 'You need to verify your email address to log in.'];
                        }
                    } else {
                        // Password is not valid, display a generic error message
                        $response = ['success' => false, 'message' => 'Invalid email or password.'];
                    }
                }
            } else {
                // Email doesn't exist, display a generic error message
                $response = ['success' => false, 'message' => 'Invalid email or password.'];
            }
        } else {
            $response = ['success' => false, 'message' => 'Oops! Something went wrong. Please try again later.'];
        }

        // Close statement
        $stmt->close();
    }
}

// Close connection
$conn->close();

header('Content-Type: application/json');
echo json_encode($response);
?>
