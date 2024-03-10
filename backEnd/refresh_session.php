<?php
session_start();
require 'database_connection.php';

$response = ['success' => false];

if (isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] === true) {
    // Regenerate the session ID to prevent session fixation attacks
    session_regenerate_id(true);
    
    $user_id = $_SESSION["id"];

    // Optionally, extend session lifetime by resetting session cookie
    $lifetime = 3600; // 1 hour; adjust as needed
    setcookie(session_name(), session_id(), time() + $lifetime);

    $sql = "SELECT email, call_sign, birthday FROM users WHERE id = ?";
    if ($stmt = $conn->prepare($sql)) {
        $stmt->bind_param("i", $user_id);
        if ($stmt->execute()) {
            $stmt->store_result();
            
            if ($stmt->num_rows == 1) {
                $stmt->bind_result($email, $call_sign, $birthday);
                if ($stmt->fetch()) {
                    // Update session variables
                    $_SESSION["email"] = $email;
                    $_SESSION["call_sign"] = $call_sign;
                    $_SESSION["birthday"] = $birthday;

                    $response = [
                        'success' => true,
                        'message' => 'Session refreshed successfully.',
                        'user' => [
                            'email' => $_SESSION["email"],
                            'call_sign' => $_SESSION["call_sign"],
                            'birthday' => $_SESSION["birthday"]
                        ]
                    ];
                }
            }
        }
        $stmt->close();
    }
    $conn->close();
} else {
    $response = ['success' => false, 'message' => 'No active session.'];
}

header('Content-Type: application/json');
echo json_encode($response);
?>
