<?php
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Handle registration form submission

    $response = array();

    $email = $_POST["email"];
    $password = password_hash($_POST["password"], PASSWORD_BCRYPT); // Hash the password

    // Establish a database connection (replace with your database credentials)
    $mysqli = new mysqli("localhost", "username", "password", "database_name");

    if ($mysqli->connect_error) {
        $response["success"] = false;
        $response["message"] = "Connection failed: " . $mysqli->connect_error;
    } else {
        // Check if the email is already registered
        $checkQuery = "SELECT id FROM users WHERE email = '$email'";
        $result = $mysqli->query($checkQuery);

        if ($result->num_rows > 0) {
            $response["success"] = false;
            $response["message"] = "Email already registered.";
        } else {
            // Insert the new user into the database
            $insertQuery = "INSERT INTO users (email, password) VALUES ('$email', '$password')";
            if ($mysqli->query($insertQuery) === TRUE) {
                $response["success"] = true;
                $response["message"] = "Registration successful!";
            } else {
                $response["success"] = false;
                $response["message"] = "Error: " . $mysqli->error;
            }
        }

        $mysqli->close();
    }

    echo json_encode($response);
}
?>


