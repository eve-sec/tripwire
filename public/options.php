<?php
//***********************************************************
//	File: 		options.php
//	Author: 	Daimian
//	Created: 	6/1/2013
//	Modified: 	8/18/2014 - Daimian
//
//	Purpose:	Handles getting and setting of options.
//
//	ToDo:
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
$mode = isset($_REQUEST['mode'])?$_REQUEST['mode']:null;
$options = isset($_REQUEST['options'])?$_REQUEST['options']:null;
$password = isset($_REQUEST['password'])?$_REQUEST['password']:null;
$confirm = isset($_REQUEST['confirm'])?$_REQUEST['confirm']:null;
$username = isset($_REQUEST['username'])?$_REQUEST['username']:null;
$old_username = isset($_REQUEST['username'])?$_SESSION['username']:null;
$mask = isset($_REQUEST['mask'])?$_REQUEST['mask']:null;
$output = null;

if ($mode == 'get') {
	$query = 'SELECT options FROM preferences WHERE userID = :userID';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':userID', $userID);
	$stmt->execute();
	$row = $stmt->fetchObject();

	if ($row)
		$output['options'] = json_decode($row->options);

} else if ($mode == 'set') {
	$query = 'INSERT INTO preferences (userID, options) VALUES (:userID, :options) ON DUPLICATE KEY UPDATE options = :options';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':userID', $userID);
	$stmt->bindValue(':options', $options);

	if ($output['result'] = $stmt->execute()) {
		$_SESSION['options'] = json_decode($options);

		$_SESSION['mask'] = @json_decode($options)->masks->active ? json_decode($options)->masks->active : $_SESSION['corporationID'] .'.2';
	}
}

if ($password) {
	if (strlen($password) < 5) {
		$output['error'] = 'Password must be 5 characters or more';
	} else if ($password !== $confirm) {
		$output['error'] = 'Passwords do not match';
	} else {
		require('../password_hash.php');
		$hasher = new PasswordHash(8, FALSE);

		$query = 'UPDATE accounts SET password = :password WHERE id = :userID';
		$stmt = $mysql->prepare($query);
		$stmt->bindValue(':userID', $userID);
		$stmt->bindValue(':password', $hasher->HashPassword($password));
		$output['result'] = $stmt->execute();
	}
}

if ($username && $old_username) {
	if (strlen($username) < 5) {
		$output['error'] = 'Username must be 5 characters or more';
	} else {
		$query = 'SELECT username FROM accounts WHERE username = :username';
		$stmt = $mysql->prepare($query);
		$stmt->bindValue(':username', $username);
		$stmt->execute();
		if ($stmt->rowCount()) {
			$output['field'] = 'username';
			$output['error'] = 'Already taken.';
		} else {
			$query = 'UPDATE accounts SET username = :username WHERE username = :old_username';
			$stmt = $mysql->prepare($query);
			$stmt->bindValue(':username', $username);
			$stmt->bindValue(':old_username', $old_username);
			$result = $stmt->execute();

			if ($result) {
				$output['result'] = $username;
				$_SESSION['username'] = $username;
			}
		}
	}
}

$output['proccessTime'] = sprintf('%.4f', microtime(true) - $startTime);

echo json_encode($output);

?>
