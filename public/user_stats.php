<?php
//***********************************************************
//	File: 		user_stats.php
//	Author: 	Daimian
//	Created: 	6/1/2013
//	Modified: 	1/25/2014 - Daimian
//
//	Purpose:	Handles pulling user stats for options
//
//	ToDo:
//
//***********************************************************
$startTime = microtime(true);

if (!session_id()) session_start();

// Check for login - else kick
if(!isset($_SESSION['userID'])) {
	http_response_code(403);
	exit();
}

require_once('../config.php');
require_once('../db.inc.php');

header('Content-Type: application/json');

$userID = $_SESSION['userID'];
$output = null;

$query = 'SELECT SUM(signatures_added) as signatures_added, SUM(signatures_updated) as signatures_updated, SUM(signatures_deleted) as signatures_deleted, SUM(wormholes_added) as wormholes_added, SUM(wormholes_updated) as wormholes_updated, SUM(wormholes_deleted) as wormholes_deleted, SUM(comments_added) as comments_added, SUM(comments_updated) as comments_updated, SUM(comments_deleted) as comments_deleted FROM statistics WHERE userID = :userID GROUP BY userID';
$stmt = $mysql->prepare($query);
$stmt->bindValue(':userID', $userID);
$stmt->execute();
if ($results = $stmt->fetchAll(PDO::FETCH_CLASS)) {
	$output['stats'] = $results;
}

$query = 'SELECT logins, lastLogin FROM accounts WHERE id = :userID';
$stmt = $mysql->prepare($query);
$stmt->bindValue(':userID', $userID);
$stmt->execute();
if ($results = $stmt->fetchObject()) {
	$output['account'] = $results;
}

$query = 'SELECT DISTINCT systemID FROM system_visits WHERE userID = :userID';
$stmt = $mysql->prepare($query);
$stmt->bindValue(':userID', $userID);
$stmt->execute();
if ($results = number_format($stmt->rowCount())) {
	$output['system_visits'] = $results;
}

$output['username'] = $_SESSION['username'];

$output['proccessTime'] = sprintf('%.4f', microtime(true) - $startTime);

echo json_encode($output);
