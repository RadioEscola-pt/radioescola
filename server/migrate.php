<?php
/**
 * This script migrates the json files to the current database
 * Doesn't include the source yet as there is no specific pattern for it
 */

include "config.php";

$json = json_decode(file_get_contents('../question3.json'), true);
$category = 3;
$query_insert_pergunta = mysqli_prepare($mysqli, "INSERT INTO pergunta (question, notes, img, categoria) VALUES (?, ?, ?, ?)");
$query_insert_resposta = mysqli_prepare($mysqli, "INSERT INTO resposta (pergunta_id, resposta, correta) VALUES (?, ?, ?)");

foreach ($json["questions"] as $index => $question){

    $question_text = $question["question"];
    if ($question["notes"]) $notes = $question["notes"]; else $notes = null;
    $correct_index = $question["correctIndex"];
    if ($question["img"]) $img = $question["img"]; else $img = null;

    mysqli_stmt_execute($query_insert_pergunta, [$question_text, $notes, $img, $category]);
    $id = mysqli_insert_id($mysqli);

    
    foreach ($question["answers"] as $index_a => $answer){
            mysqli_stmt_execute($query_insert_resposta, [$id, $answer, ($correct_index == $index_a+1 ? 1: 0)]);
         }


}
?>