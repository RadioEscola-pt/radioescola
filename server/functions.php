<?php


function printCurrentSource(){
    if ($_SESSION['current_source_id']) echo "A editar: " . ($_SESSION['current_source_name']) . " <a href=\"fonte.php?finish\"> Terminar edição</a>"; 
}

?>