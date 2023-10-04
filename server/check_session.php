<?php
session_start();

$response = array();

if (isset($_SESSION['user_id']) && isset($_SESSION['email'])) {
    $response['success'] = true;
    $response['email'] = $_SESSION['email'];
    $response['user_id'] = $_SESSION['user_id'];

} else {
    $response['success'] = false;
}

header('Content-Type: application/json');
echo json_encode($response);
?>

