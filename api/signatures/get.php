<?php

if (isset($_REQUEST['systemID']) && $maskID) {
    $query = 'SELECT * FROM signatures WHERE (systemID = :systemID OR type = "wormhole") AND maskID = :maskID';
    $stmt = $mysql->prepare($query);
    $stmt->bindValue(':systemID', $_REQUEST['systemID']);
    $stmt->bindValue(':maskID', $maskID);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_CLASS);
    foreach ($rows as $row) {
      $row->lifeTime = date('Y-m-d H:i:s e', strtotime($row->lifeTime));
      $row->lifeLeft = date('Y-m-d H:i:s e', strtotime($row->lifeLeft));
      $row->modifiedTime = date('Y-m-d H:i:s e', strtotime($row->modifiedTime));
      $output[] = $row;
    }
} else if ($maskID) {
    $query = 'SELECT * FROM signatures WHERE maskID = :maskID';
    $stmt = $mysql->prepare($query);
    $stmt->bindValue(':maskID', $maskID);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_CLASS);
    foreach ($rows as $row) {
      $row->lifeTime = date('Y-m-d H:i:s e', strtotime($row->lifeTime));
      $row->lifeLeft = date('Y-m-d H:i:s e', strtotime($row->lifeLeft));
      $row->modifiedTime = date('Y-m-d H:i:s e', strtotime($row->modifiedTime));
      $output[] = $row;
    }
}
