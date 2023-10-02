<?php

/*
TODO:
- Get Questions (by type of exam)
- Login
- Registration
- CSRF token on sensitive operations
*/

$action = $_REQUEST['action'];

switch ($action){
    case "1":
        $type = $_REQUEST['examtype'];
        $category = $_REQUEST['category'];
        if($type && $category) generateExam($type, $category); else echo "No exam type specified";
        break;
    default:
        echo "Nothing was specified or unknown action";

}


function generateExam($type, $category){
    /* 
    Exam Types:
    - 1: Normal, 40 random questions TODO
    - 2: Most difficult (most failed by users) TODO
    - 3: Themed, requires a theme argument TODO
    - 4: Failed questions, requires login/session TODO
    - 5: New, requires login/session TODO
    */
    include "config.php";
    switch ($type){
        case 1:
            $query_get_questions = mysqli_prepare($mysqli, "SELECT * FROM pergunta WHERE categoria = ? ORDER BY RAND() LIMIT 40");
            mysqli_stmt_bind_param($query_get_questions, "s", $category);
            mysqli_stmt_execute($query_get_questions);
            $result = mysqli_stmt_get_result($query_get_questions);
            while($row = $result->fetch_assoc()) {
                echo $row['question'];
            }

    }
}


?>