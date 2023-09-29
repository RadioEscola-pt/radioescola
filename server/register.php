<?php
header("Content-Type: application/json");
session_start();

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Handle login form submission

    $response = array();

    $loginEmail = $_POST["email"];
    $loginPassword = $_POST["password"];

    // Establish a database connection (replace with your database credentials)
    $mysqli = new mysqli("localhost", "username", "password", "database_name");

    if ($mysqli->connect_error) {
        $response["success"] = false;
        $response["message"] = "Connection failed: " . $mysqli->connect_error;
    } else {
        // Retrieve user data based on email
        $query = "SELECT id, email, password FROM users WHERE email = '$loginEmail'";
        $result = $mysqli->query($query);

        if ($result->num_rows == 1) {
            $row = $result->fetch_assoc();
            $hashedPassword = $row["password"];

            // Verify the provided password with the stored hashed password
            if (password_verify($loginPassword, $hashedPassword)) {
                // Password is correct, set a session variable for the logged-in user
                $_SESSION["user_id"] = $row["id"];
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

    echo json_encode($response);
}
?>

