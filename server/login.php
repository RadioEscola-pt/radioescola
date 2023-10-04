<?php
header("Content-Type: application/json");
session_start();

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Check if debug mode is enabled
    $debug = true; // Set this to true to enable debug mode

    $response = array();

    if ($debug) {
        // Debug mode is enabled
        if ($_POST["email"] === "admin@admin.pt" && $_POST["password"] === "pass") {
            // Set a session variable for the admin user
            $_SESSION["user_id"] = 1; // You can set the user ID as needed
            $_SESSION["email"] = $_POST["email"]; // Store the username in the session
            $response["success"] = true;            
            $response["user_id"] = 1;
            $response["email"] = $_POST["email"]; // Store the username in the session session

            $response["message"] = "Debug mode: Login successful!";
        } else {
            $response["success"] = false;
            $response["message"] = "Debug mode: Incorrect credentials.";
        }
    } else {
        // Debug mode is not enabled, proceed with database connection
        $loginEmail = $_POST["email"];
        $loginPassword = $_POST["password"];

        // Establish a database connection (replace with your database credentials)
        $mysqli = new mysqli("localhost", "email", "password", "database_name");

        if ($mysqli->connect_error) {
            $response["success"] = false;
            $response["message"] = "Connection failed: " . $mysqli->connect_error;
        } else {
            // Retrieve user data based on email
            $query = "SELECT id, email, password, email FROM users WHERE email = '$loginEmail'";
            $result = $mysqli->query($query);

            if ($result->num_rows == 1) {
                $row = $result->fetch_assoc();
                $hashedPassword = $row["password"];

                // Verify the provided password with the stored hashed password
                if (password_verify($loginPassword, $hashedPassword)) {
                    // Password is correct, set a session variable for the logged-in user
                    $_SESSION["user_id"] = $row["id"];
                    $_SESSION["email"] = $row["email"]; // Store the username in the            
            
                    $response["user_id"] = $row["id"];
                    $response["email"] = $row["email"]; // Store the username in the session session

                    $response["success"] = true;
                    $response["message"] = "Login successful!";
                } else {
                    $response["success"] = false;
                    $response["message"] = "Incorrect password.";
                }
            } else {
                $response["success"] = false;
                $response["message"] = "Email not found.";
            }

            $mysqli->close();
        }
    }

    echo json_encode($response);
}
?>



