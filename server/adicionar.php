<?php 
//TODO: Add source
include "header.html";
session_start();
if (!isset($_POST["submit"])){
?>

<form action="adicionar.php" method="post">
    <label for="question">Questão:</label> <input type=text size=100 name="question" id="question"> <br>
    <label for="resposta1">Resposta 1:</label> <input type=text size=100 name="resposta[]" id="resposta1"> <input type=radio name="correta" value="0"> <br>
    <label for="resposta2">Resposta 2:</label> <input type=text size=100 name="resposta[]" id="resposta2"> <input type=radio name="correta" value="1"> <br>
    <label for="resposta3">Resposta 3:</label> <input type=text size=100 name="resposta[]" id="resposta3"> <input type=radio name="correta" value="2"> <br>
    <label for="resposta4">Resposta 4:</label> <input type=text size=100 name="resposta[]" id="resposta4"> <input type=radio name="correta" value="3"> <br>
    <label for="notes">Notas:</label><input type=text size=150 name="notes" id="notes"> <br>
    <label for="fonte">Fonte:</label> <input type=hidden name="fonte" id="fonte"> <?php echo $_SESSION["current_source_name"]; ?> <a href=fonte.php>Mudar fonte</a><br>
    <input type="submit" name="submit" value="Adicionar">
</form>

<?php
} else {
    include "config.php";
    $question = $_POST["question"];
    $notes = $_POST["notes"];
    $respostas = $_POST["resposta"];
    $correta = $_POST["correta"];
    $query_insert_pergunta = mysqli_prepare($mysqli, "INSERT INTO pergunta (question, notes) VALUES (?, ?)");
    mysqli_stmt_execute($query_insert_pergunta, [$question, $notes]);
    $id = mysqli_insert_id($mysqli);

    $query_insert_resposta = mysqli_prepare($mysqli, "INSERT INTO resposta (pergunta_id, resposta, correta) VALUES (?, ?, ?)");
    foreach ($respostas as $id_p => $resposta){
        echo $correta . " - " . $id_p . "<br>";
      mysqli_stmt_execute($query_insert_resposta, [$id, $resposta, ($correta == $id_p ? 1: 0)]);
    }

    //TODO: Check success
    echo "Adicionado com sucesso... Talvez...";

    ?>
    <form action="pesquisa.php" method="post">
        <input type="text" name="pesquisa">
        <input type="submit" name="submit" value="Pesquisar">
    </form>
    <?php
}

?>