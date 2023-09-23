<?php

//TODO: upload images

include_once "config.php";
include "header.html";

if (isset($_GET["addsource"])){
  $p_id = $_GET['p_id'];
  $s_id = $_GET['s_id'];
  $p_num = $_GET['p_num'];
  $query_update_fontes = mysqli_prepare($mysqli, "INSERT INTO pergunta_fonte (pergunta_id, fonte_id, pergunta_num) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE fonte_id=fonte_id");
  mysqli_stmt_execute($query_update_fontes, [$p_id, $s_id, $p_num]);
  echo "Fonte Adicionada";
  die();
}

if (!$_REQUEST['id']){
  echo "Movimento invalido, falta ID <br> <a href=index.php>Listagem de perguntas</a>";
  die();
}
$id = $_GET['id'];

if (@$_POST["submit"] == "Atualizar"){
  $id = $_POST["id"];
  $question = $_POST["question"];
  $respostas = $_POST["resposta"];
  $fontes = $_POST["fontes"];
  $correta = $_POST["correta"];
  $notes = $_POST["notes"];
  $query_update_resposta = mysqli_prepare($mysqli, "UPDATE resposta SET resposta = ?, correta = ? WHERE resposta_id=?");
  foreach ($respostas as $id_p => $resposta){
    mysqli_stmt_execute($query_update_resposta, [$resposta, ($correta == $id_p ? 1: 0), $id_p]);
  }
  $query_update_pergunta = mysqli_prepare($mysqli, "UPDATE pergunta SET question = ?, notes = ? WHERE pergunta_id=?");
  mysqli_stmt_execute($query_update_pergunta, [$question, $notes, $id]);

  //TODO: Check success of query
  echo "Atualizado com sucesso... Talvez...";
}

$query_pergunta = mysqli_prepare($mysqli, "SELECT pergunta_id, question, img, notes FROM pergunta WHERE pergunta_id=?");
mysqli_stmt_bind_param($query_pergunta, "d", $id);
mysqli_stmt_execute($query_pergunta);
$result = mysqli_stmt_get_result($query_pergunta);


$query_resposta = mysqli_prepare($mysqli, "SELECT resposta_id, resposta, correta FROM resposta WHERE pergunta_id=?");
mysqli_stmt_bind_param($query_resposta, "d", $id);
mysqli_stmt_execute($query_resposta);
$result_res = mysqli_stmt_get_result($query_resposta);

$query_fonte = mysqli_prepare($mysqli, "SELECT f.fonte as fonte, f.fonte_id as f_id, pf.pergunta_id as p_id, pf.pergunta_num as pn  FROM fonte f LEFT JOIN pergunta_fonte pf ON (f.fonte_id = pf.fonte_id AND pf.pergunta_id=?)");
mysqli_stmt_bind_param($query_fonte, "d", $id);
mysqli_stmt_execute($query_fonte);
$result_fonte = mysqli_stmt_get_result($query_fonte);


if ($result->num_rows > 0) {
    echo "<form action=\"editar.php\" method=\"post\">";
    while($row = $result->fetch_assoc()) {
        
      echo "<input type=hidden name=id value=" . $row["pergunta_id"] . ">";
      echo "ID: " . $row["pergunta_id"] . " </br>";
      
      echo "Questão: <input type=text size=100 name=question value=\"" . $row["question"]. "\"></br>";
      

      $count = 0;
      while($resposta = $result_res->fetch_assoc()) {
        $count++;  
        echo "Resposta " . $count . ": </th><td><input type=text size=100 name=resposta[" . $resposta["resposta_id"] . "] value=\"" . $resposta["resposta"]. "\"> <input type=radio name=correta " . (($resposta["correta"]) == "1" ? "checked":"") . " value=" . $resposta["resposta_id"] . "> </br>";
      }
      

      echo "Notas: <input type=text size=150 name=notes value=\"" . $row["notes"]. "\"></br>";
      
      if ($row["img"] != "null") {echo "Imagem: <img src=\"" . $row["img"] . "\"></br>";}
      
      echo "Fontes: <br>";
      while($fonte = $result_fonte->fetch_assoc()) {
        if ($fonte["p_id"] == $id) echo $fonte["fonte"] . " - Pergunta nº" . $fonte["pn"] . "<br>";
      }
      echo "<input type=submit name=submit value=Atualizar>";
    }
    echo "</form>";
  } else {
    echo "Pergunta não encontrada";
  }
  ?>
