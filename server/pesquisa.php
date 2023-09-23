<?php

include_once "config.php";
session_start();
?>

<form action="pesquisa.php" method="post">
  <input type="text" name="pesquisa">
  <input type="submit" name="submit" value="Pesquisar">
</form>

<?php
echo "Pesquisa: " . $_POST["pesquisa"] . "<br> As seguintes perguntas foram encontradas: <br><br>";
$pesquisa = "%{$_POST['pesquisa']}%";

$query_pergunta = mysqli_prepare($mysqli, "SELECT pergunta_id, question FROM pergunta WHERE question LIKE ?");
mysqli_stmt_bind_param($query_pergunta, "s", $pesquisa);
mysqli_stmt_execute($query_pergunta);
$result = mysqli_stmt_get_result($query_pergunta);




if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        echo "<a href=editar.php?id=" . $row["pergunta_id"] . ">" . $row["question"] . "</a> &nbsp; &nbsp; <a href=editar.php?addsource&s_id=" .  $_SESSION["current_source_id"] . "&p_id=" . $row["pergunta_id"] . "> Adicionar ao exame: " . $_SESSION["current_source_name"] . "</a><br>";

        $query_resposta = mysqli_prepare($mysqli, "SELECT resposta_id, resposta, correta FROM resposta WHERE pergunta_id=?");
        mysqli_stmt_bind_param($query_resposta, "d", $row["pergunta_id"]);
        mysqli_stmt_execute($query_resposta);
        $result_res = mysqli_stmt_get_result($query_resposta);
        while($resposta = $result_res->fetch_assoc()) {
            echo $resposta["resposta"]. "<br>";
        }
        echo "<br>";
    }
    echo "<a href=adicionar.php> Adicionar nova </a>";

  } else {
    echo "Nada encontrado";
  }
?>