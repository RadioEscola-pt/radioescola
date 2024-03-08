<?php

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $file = $_POST['file'];
    $content = $_POST['content'];

    // Save the changes to the selected file
    if (file_put_contents($file, $content) !== false) {
        // Create a Git branch with the username
        $username = 'your_username'; // Replace with actual username
        $branchName = 'user_branch_' . $username;

        shell_exec("git checkout -b $branchName");
        shell_exec("git add $file");
        shell_exec("git commit -m 'Changes by $username'");
        shell_exec("git push origin $branchName");

        echo 'Changes saved successfully and Git branch created.';
    } else {
        echo 'Error saving changes';
    }
} else {
    http_response_code(400);
    echo 'Invalid request method';
}
?>
