<?php
include_once "config.php";
include "header.html";
include_once "functions.php";

session_start();
printCurrentSource();

$result = mysqli_query($mysqli, "SELECT * FROM pergunta ORDER BY pergunta_id DESC");

?>

<form action="pesquisa.php" method="post">
  <input type="text" name="pesquisa">
    <?php if ($_SESSION['current_source_id']){ ?>
        <input type="number" size=5 name="p_num">
    <?php } ?>
  <input type="submit" name="submit" value="Pesquisar">
</form>

<?php

if ($result->num_rows > 0) {
    echo "<table border=1><tr><th>ID</th> <th>questão</th> <th>Editar</th></tr>";
    while($row = $result->fetch_assoc()) {
      echo "<tr><td>" . $row["pergunta_id"] . "</td> <td>" . $row["question"]. "</td> <td><a href=editar.php?p_id=" . $row["pergunta_id"]. ">editar</a></td> </tr>";
    }
    echo "</table>";
  } else {
    echo "0 results";
  }?>
