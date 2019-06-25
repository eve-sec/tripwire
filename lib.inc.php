<?php

function checkOwner($mask) {
	global $mysql;

	if ($mask == $_SESSION['characterID'].'.1') {
		return true;
	}

	$query = 'SELECT maskID FROM masks WHERE ownerID = :ownerID AND ownerType = 1373 AND maskID = :mask';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':ownerID', $_SESSION['characterID']);
	$stmt->bindValue(':mask', $mask);
	$stmt->execute();

	return $stmt->rowCount() == 0 ? false : true;
}

function checkAdmin($mask) {
	global $mysql;

	if ($mask == $_SESSION['corporationID'].'.2' && $_SESSION['admin'] == 1) {
		return true;
	}

	$query = 'SELECT corporationID FROM characters INNER JOIN masks ON ownerID = corporationID AND ownerType = 2 WHERE characterID = :characterID AND admin = 1 AND maskID = :mask';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':characterID', $_SESSION['characterID']);
	$stmt->bindValue(':mask', $mask);
	$stmt->execute();

	return $stmt->rowCount() == 0 ? false : true;
}
