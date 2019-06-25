<?php
//***********************************************************
//	File: 		occupants.php
//	Author: 	Daimian
//	Created: 	6/1/2013
//	Modified: 	1/22/2014 - Daimian
//
//	Purpose:	Handles pulling system occupants.
//
//	ToDo:
//
//***********************************************************
$startTime = microtime(true);

if (!session_id()) session_start();

if(!isset($_SESSION['userID'])) {
	http_response_code(403);
	exit();
}

require_once('../config.php');
require_once('../db.inc.php');

header('Content-Type: application/json');

$systemID = $_REQUEST['systemID'];
$maskID = $_SESSION['mask'];

$query = 'SELECT characterName, shipTypeName FROM tracking WHERE systemID = :systemID AND maskID = :maskID';
$stmt = $mysql->prepare($query);
$stmt->bindValue(':systemID', $systemID);
$stmt->bindValue(':maskID', $maskID);
$stmt->execute();

$output['occupants'] = $stmt->fetchAll(PDO::FETCH_CLASS);

$output['proccessTime'] = sprintf('%.4f', microtime(true) - $startTime);

echo json_encode($output);

?>
