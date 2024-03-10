<?php
session_start();

$response = ['loggedin' => false];

if (isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] === true) {
    $response = [
        'loggedin' => true,
        'user' => [
            'id' => $_SESSION["id"],
            'email' => $_SESSION["email"],
            'call_sign' => $_SESSION["call_sign"],
            'birthday' => $_SESSION["birthday"]
        ]
    ];
}

header('Content-Type: application/json');
echo json_encode($response);
?>
