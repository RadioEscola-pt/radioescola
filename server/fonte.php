<?php
include "header.html";
include "config.php";
session_start();

if (isset($_GET["setsource"])){
    $_SESSION["current_source_id"] = $_GET["id"];
    $_SESSION["current_source_name"] = $_GET["nome"];
}

if (isset($_GET["finish"])){
    unset($_SESSION["current_source_id"]);
    unset($_SESSION["current_source_name"]);
}

if (isset($_GET["newsource"])){
?>
<br>
<form action="fonte.php" method="post" enctype="multipart/form-data">
    <label for="nome">Nome: </label><input type="text" name="nome" id="nome"><br>
    <label for="categoria">Categoria: </label>
    <select name="categoria" id="categoria">
        <option value="-1">Selecione</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
    </select>
<br>
        <label for="file">Ficheiro: </label><input type="file" name="file" id="file"><br>
    <input type="submit" name="submit" value="Adicionar"> 

</form>

<?php
}

if (@$_POST["submit"] == "Adicionar"){
    $nome = $_POST["nome"];
    $currentDirectory = getcwd();
    $uploadDirectory = "/uploads/";
    $fileName = $_FILES['file']['name'];
    $fileTmpName  = $_FILES['file']['tmp_name'];
    $uploadPath = $currentDirectory . $uploadDirectory . basename($fileName); 
    $link = $uploadDirectory . basename($fileName);
    $didUpload = move_uploaded_file($fileTmpName, $uploadPath);

    if ($didUpload) {
        echo "The file " . basename($fileName) . " has been uploaded";
    } else {
        echo "An error occurred. Please contact the administrator.";
    }
    $query_insert_pergunta = mysqli_prepare($mysqli, "INSERT INTO fonte (fonte, link) VALUES (?, ?)");
    mysqli_stmt_execute($query_insert_pergunta, [$nome, $link]);
    $id = mysqli_insert_id($mysqli);
    $_SESSION["current_source_id"] = $id;
    $_SESSION["current_source_name"] = $nome;

}

if (isset($_SESSION["current_source_id"]) && !isset($_GET["newsource"]) ){
    echo "A editar " . $_SESSION["current_source_name"] . " <a href=\"fonte.php?finish\"> Terminar edição</a> <br><br>";
}

echo "<a href=fonte.php?newsource> Criar Novo </a> <br><br>";

$query_fonte = mysqli_query($mysqli, "SELECT fonte_id AS f_id, fonte FROM fonte ORDER BY f_id DESC");
if ($query_fonte->num_rows > 0) {
    while($row = $query_fonte->fetch_assoc()) {
        echo "<a href=\"fonte.php?setsource&id=" . $row["f_id"] . "&nome=" . $row["fonte"] . "\">" . $row["fonte"] . "</a><br>";
    }
}

?>