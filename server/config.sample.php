<?php
//EDIT THIS FILE AND RENAME TO config.php

// Basic connection settings
$databaseHost = '<host_address>';
$databaseUsername = '<user_name>';
$databasePassword = '<pass>';
$databaseName = '<db name>';

// Connect to the database
$mysqli = mysqli_connect($databaseHost, $databaseUsername, $databasePassword, $databaseName); 
?>