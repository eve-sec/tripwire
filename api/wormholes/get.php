<?php

if ($maskID) {
    $query = 'SELECT * FROM wormholes WHERE maskID = :maskID';
    $stmt = $mysql->prepare($query);
    $stmt->bindValue(':maskID', $maskID);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_CLASS);
    $output = $rows;
}
