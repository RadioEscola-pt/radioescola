<?php
/**
 * This script migrates the json files to the current database
 * Doesn't include the source yet as there is no specific pattern for it
 */

include "config.php";

$json = json_decode(file_get_contents('../question2.json'), true);
$category = 2;
$query_insert_pergunta = mysqli_prepare($mysqli, "INSERT INTO pergunta (question, notes, img, categoria) VALUES (?, ?, ?, ?)");
$query_insert_resposta = mysqli_prepare($mysqli, "INSERT INTO resposta (pergunta_id, resposta, correta) VALUES (?, ?, ?)");

foreach ($json["questions"] as $index => $question){

    $question_text = $question["question"];
    $notes = $question["notes"];
    $correct_index = $question["correctIndex"];
    $img = $question["img"]; 

    mysqli_stmt_execute($query_insert_pergunta, [$question_text, $notes, $img, $category]);
    $id = mysqli_insert_id($mysqli);

    
    foreach ($question["answers"] as $index_a => $answer){
            mysqli_stmt_execute($query_insert_resposta, [$id, $answer, ($correct_index == $index_a+1 ? 1: 0)]);
         }


}
?>