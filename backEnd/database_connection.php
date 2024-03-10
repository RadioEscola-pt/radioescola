<?php

$hashed_password="ABCDSEFG";
//remember to change the password to the hashed password and in the docker file
$host = 'localhost'; // or your database host
$username = 'user'; // your database username
$password = 'password'; // your database password
$dbname = 'mydb'; // your database name

// Create connection
$conn = new mysqli($host, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// You can now use $conn to interact with your database
?>
