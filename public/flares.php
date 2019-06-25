<?php
//***********************************************************
//	File: 		flares.php
//	Author: 	Daimian
//	Created: 	6/1/2013
//	Modified: 	1/22/2014 - Daimian
//
//	Purpose:	Handles creating and removing system flares.
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

$mask = $_SESSION['mask'];

if (isset($_REQUEST['flare']) && !empty($_REQUEST['flare'])) {
	$systemID = $_REQUEST['systemID'];
	$flare = $_REQUEST['flare'];

	$query = 'INSERT INTO flares (maskID, systemID, flare) VALUES (:mask, :systemID, :flare) ON DUPLICATE KEY UPDATE flare = :flare';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':mask', $mask);
	$stmt->bindValue(':systemID', $systemID);
	$stmt->bindValue(':flare', $flare);

	$output['result'] = $stmt->execute()?true:$stmt->errorInfo();
} else {
	$systemID = $_REQUEST['systemID'];

	$query = "DELETE FROM flares WHERE maskID = :mask AND systemID = :systemID";
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':mask', $mask);
	$stmt->bindValue(':systemID', $systemID);

	$output['result'] = $stmt->execute()?true:$stmt->errorInfo();
}

$output['proccessTime'] = sprintf('%.4f', microtime(true) - $startTime);

echo json_encode($output);
?>
