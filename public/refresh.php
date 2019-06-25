<?php
//	======================================================
//	File:		refresh.php
//	Author:		Josh Glassmaker (Daimian Mercer)
//
//	======================================================

$startTime = microtime(true);
// Verify access via Tripwire signon
if (!session_id()) session_start();

if(!isset($_SESSION['userID'])) {
	http_response_code(403);
	exit();
}

require_once('../config.php');
require_once('../settings.php');
require_once('../db.inc.php');

header('Content-Type: application/json');
/**
// *********************
// Check and update session
// *********************
*/
$query = 'SELECT characterID, characterName, corporationID, corporationName, admin FROM characters WHERE userID = :userID';
$stmt = $mysql->prepare($query);
$stmt->bindValue(':userID', $_SESSION['userID']);
$stmt->execute();
if ($row = $stmt->fetchObject()) {
	$_SESSION['characterID'] = $row->characterID;
	$_SESSION['characterName'] = $row->characterName;
	$_SESSION['corporationID'] = $row->corporationID;
	$_SESSION['corporationName'] = $row->corporationName;
	$_SESSION['admin'] = $row->admin;
}

/**
// *********************
// Mask Check
// *********************
**/
$checkMask = explode('.', $_SESSION['mask']);
if ($checkMask[1] == 0 && $checkMask[0] != 0) {
	// Check custom mask
	$query = 'SELECT masks.maskID FROM masks INNER JOIN groups ON masks.maskID = groups.maskID WHERE masks.maskID = :maskID AND ((ownerID = :characterID AND ownerType = 1373) OR (ownerID = :corporationID AND ownerType = 2) OR (eveID = :characterID AND eveType = 1373) OR (eveID = :corporationID AND eveType = 2))';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':characterID', $_SESSION['characterID']);
	$stmt->bindValue(':corporationID', $_SESSION['corporationID']);
	$stmt->bindValue(':maskID', $_SESSION['mask']);

	if ($stmt->execute() && $stmt->fetchColumn(0) != $_SESSION['mask'])
		$_SESSION['mask'] = $_SESSION['corporationID'] . '.2';
} else if ($checkMask[1] == 1 && $checkMask[0] != $_SESSION['characterID']) {
	// Force current character mask
	$_SESSION['mask'] = $_SESSION['characterID'] . '.1';
} else if ($checkMask[1] == 2 && $checkMask[0] != $_SESSION['corporationID']) {
	// Force current corporation mask
	$_SESSION['mask'] = $_SESSION['corporationID'] . '.2';
}

/**
// *********************
// Core variables
// *********************
*/
$ip				= isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : die();
$instance		= isset($_REQUEST['instance']) ? $_REQUEST['instance'] : 0;
$version		= isset($_SERVER['SERVER_NAME'])? explode('.', $_SERVER['SERVER_NAME'])[0] . (isset($_REQUEST['version']) ? ' ' . $_REQUEST['version'] : '') : die();
$userID			= isset($_SESSION['userID']) ? $_SESSION['userID'] : die();
$maskID			= isset($_SESSION['mask']) ? $_SESSION['mask'] : die();
$systemID 		= isset($_REQUEST['systemID']) && !empty($_REQUEST['systemID']) ? $_REQUEST['systemID'] : die();
$systemName 	= isset($_REQUEST['systemName']) && !empty($_REQUEST['systemName']) ? $_REQUEST['systemName'] : null;
$activity 		= isset($_REQUEST['activity']) ? json_encode($_REQUEST['activity']) : null;
$refresh 		= array('sigUpdate' => false, 'chainUpdate' => false);

/**
// *********************
// Server notifications & user activity
// *********************
*/
$query = 'SELECT notify FROM active WHERE instance = :instance AND notify IS NOT NULL';
$stmt = $mysql->prepare($query);
$stmt->bindValue(':instance', $instance);
$stmt->execute();
$stmt->rowCount() ? $output['notify'] = $stmt->fetchColumn() : null;

!isset($output['notify']) && isset($_REQUEST['version']) && $_REQUEST['version'] != VERSION ? $output['notify'] = 'Tripwire update available ('.VERSION.')<br/><a href="" OnClick="window.location.reload()">Reload to update!</a>' : null;

$query = 'SELECT characters.characterName, activity FROM active INNER JOIN characters ON active.userID = characters.userID WHERE maskID = :maskID AND instance <> :instance AND activity IS NOT NULL AND activity <> ""';
$stmt = $mysql->prepare($query);
$stmt->bindValue(':maskID', $maskID);
$stmt->bindValue(':instance', $instance);
$stmt->execute();
$stmt->rowCount() ? $output['activity'] = $stmt->fetchAll(PDO::FETCH_OBJ) : null;

/**
// *********************
// Character Tracking
// *********************
*/
if (isset($_REQUEST['tracking'])) {
	foreach ($_REQUEST['tracking'] as $track) {
		$track['characterID'] 		= isset($track['characterID']) ? $track['characterID'] : null;
		$track['characterName'] 	= isset($track['characterName']) ? $track['characterName'] : null;
		$track['systemID'] 			= isset($track['systemID']) ? $track['systemID'] : null;
		$track['systemName'] 		= isset($track['systemName']) ? $track['systemName'] : null;
		$track['stationID'] 		= isset($track['stationID']) && !empty($track['stationID']) ? $track['stationID'] : null;
		$track['stationName'] 		= isset($track['stationName']) && !empty($track['stationName']) ? $track['stationName'] : null;
		$track['shipID'] 			= isset($track['shipID']) ? $track['shipID'] : null;
		$track['shipName'] 			= isset($track['shipName']) ? $track['shipName'] : null;
		$track['shipTypeID'] 		= isset($track['shipTypeID']) ? $track['shipTypeID'] : null;
		$track['shipTypeName'] 		= isset($track['shipTypeName']) ? $track['shipTypeName'] : null;

		$query = 'INSERT INTO tracking (userID, characterID, characterName, systemID, systemName, stationID, stationName, shipID, shipName, shipTypeID, shipTypeName, maskID)
		VALUES (:userID, :characterID, :characterName, :systemID, :systemName, :stationID, :stationName, :shipID, :shipName, :shipTypeID, :shipTypeName, :maskID)
		ON DUPLICATE KEY UPDATE
		systemID = :systemID, systemName = :systemName, stationID = :stationID, stationName = :stationName, shipID = :shipID, shipName = :shipName, shipTypeID = :shipTypeID, shipTypeName = :shipTypeName';
		$stmt = $mysql->prepare($query);
		$stmt->bindValue(':userID', $userID);
		$stmt->bindValue(':characterID', $track['characterID']);
		$stmt->bindValue(':characterName', $track['characterName']);
		$stmt->bindValue(':systemID', $track['systemID']);
		$stmt->bindValue(':systemName', $track['systemName']);
		$stmt->bindValue(':stationID', $track['stationID']);
		$stmt->bindValue(':stationName', $track['stationName']);
		$stmt->bindValue(':shipID', $track['shipID']);
		$stmt->bindValue(':shipName', $track['shipName']);
		$stmt->bindValue(':shipTypeID', $track['shipTypeID']);
		$stmt->bindValue(':shipTypeName', $track['shipTypeName']);
		$stmt->bindValue(':maskID', $maskID);
		$stmt->execute();
	}
}

/**
// *********************
// ESI
// note: must be below Character Tracking
// *********************
*/
if ($_REQUEST['mode'] == 'init' || isset($_REQUEST['esi']) || isset($_REQUEST['esiDelete'])) {
	$output['esi'] = array();

	if (isset($_REQUEST['esiDelete'])) {
		foreach ($_REQUEST['esiDelete'] as $characterID) {
			$query = 'DELETE FROM esi WHERE userID = :userID AND characterID = :characterID';
			$stmt = $mysql->prepare($query);
			$stmt->bindValue(':userID', $userID);
			$stmt->bindValue(':characterID', $characterID);
			$stmt->execute();
		}
	}

	$query = 'SELECT characterID, characterName, accessToken, refreshToken, tokenExpire FROM esi WHERE userID = :userID';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':userID', $userID);
	$stmt->execute();
	$characters = $stmt->fetchAll(PDO::FETCH_OBJ);
	foreach ($characters as $character) {
		if (strtotime($character->tokenExpire) < strtotime('+5 minutes')) {
			require_once("../esi.class.php");

			$esi = new esi();
			if ($esi->refresh($character->refreshToken)) {
				$query = 'UPDATE esi SET accessToken = :accessToken, refreshToken = :refreshToken, tokenExpire = :tokenExpire WHERE characterID = :characterID';
				$stmt = $mysql->prepare($query);
				$stmt->bindValue(':accessToken', $esi->accessToken);
				$stmt->bindValue(':refreshToken', $esi->refreshToken);
				$stmt->bindValue(':tokenExpire', date('Y-m-d H:i:s', strtotime($esi->tokenExpire)));
				$stmt->bindValue(':characterID', $character->characterID);
				$stmt->execute();

				$character->accessToken = $esi->accessToken;
				$character->refreshToken = $esi->refreshToken;
				$character->tokenExpire = $esi->tokenExpire;
			} else if ($esi->httpCode >= 400 && $esi->httpCode < 500) {
				$query = 'DELETE FROM esi WHERE characterID = :characterID';
				$stmt = $mysql->prepare($query);
				$stmt->bindValue(':characterID', $character->characterID);
				$stmt->execute();

				unset($character);
				continue;
			}
		}

		$output['esi'][$character->characterID] = $character;
	}
}

/**
// *********************
// Signatures
// *********************
*/
if (isset($_POST['signatures']) || isset($_POST['wormholes'])) {
	require('../signatures.php');
}

/**
// *********************
// Active Users
// *********************
*/
$query = 'INSERT INTO active (ip, instance, session, userID, maskID, systemID, systemName, activity, version)
			VALUES (:ip, :instance, :session, :userID, :maskID, :systemID, :systemName, :activity, :version)
			ON DUPLICATE KEY UPDATE
			maskID = :maskID, systemID = :systemID, systemName = :systemName, activity = :activity, version = :version, time = NOW(), notify = NULL';
$stmt = $mysql->prepare($query);
$stmt->bindValue(':ip', $ip);
$stmt->bindValue(':instance', $instance);
$stmt->bindValue(':session', session_id());
$stmt->bindValue(':userID', $userID);
$stmt->bindValue(':maskID', $maskID);
$stmt->bindValue(':systemID', $systemID);
$stmt->bindValue(':systemName', $systemName);
$stmt->bindValue(':activity', $activity);
$stmt->bindValue(':version', $version);
$stmt->execute();

/**
// *********************
// Gathering data to output
// *********************
*/
if (isset($_REQUEST['mode']) && $_REQUEST['mode'] == 'init') {
	// Send server time for time sync
	$now = new DateTime();
	$now->add(new DateInterval('PT1S')); // Set clock 1 second ahead, jquery countdown plugin sync needs time to be slightly different that countdown time
	$output['sync'] = $now->format("M j, Y H:i:s O");

	// Signatures data
	// $debugStart = microtime(true);
	$output['signatures'] = array();
	$query = 'SELECT * FROM signatures WHERE (systemID = :systemID OR type = "wormhole") AND maskID = :maskID';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':systemID', $systemID);
	$stmt->bindValue(':maskID', $maskID);
	$stmt->execute();
	$rows = $stmt->fetchAll(PDO::FETCH_CLASS);
	foreach ($rows AS $row) {
		$output['signatures'][$row->id] = $row;
	}
	// $output['debugTime'] = sprintf('%.4f', microtime(true) - $debugStart);

	// Chain map data
	$output['wormholes'] = array();
	$query = "SELECT * FROM wormholes WHERE maskID = :maskID";
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':maskID', $maskID);
	$stmt->execute();
	$rows = $stmt->fetchAll(PDO::FETCH_CLASS);
	foreach ($rows AS $row) {
		$output['wormholes'][$row->id] = $row;
	}

	// Get occupied systems
	$query = 'SELECT systemID, COUNT(characterID) AS count FROM tracking WHERE maskID = :maskID GROUP BY systemID';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':maskID', $maskID);
	$stmt->execute();
	$output['occupied'] = $stmt->fetchAll(PDO::FETCH_CLASS);

	// Get flares
	$query = 'SELECT systemID, flare, time FROM flares WHERE maskID = :maskID';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':maskID', $maskID);
	$stmt->execute();
	$result = $stmt->fetchAll(PDO::FETCH_CLASS);
	$output['flares']['flares'] = $result;
	$output['flares']['last_modified'] = date('m/d/Y H:i:s e', $result ? strtotime($result[0]->time) : time());

	// Get Comments
	$query = 'SELECT id, comment, created AS createdDate, createdByName, modified AS modifiedDate, modifiedByName, systemID FROM comments WHERE (systemID = :systemID OR systemID = 0) AND maskID = :maskID ORDER BY systemID ASC, modified ASC';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':systemID', $systemID);
	$stmt->bindValue(':maskID', $maskID);
	$stmt->execute();
	while ($row = $stmt->fetchObject()) {
		$output['comments'][] = array('id' => $row->id, 'comment' => $row->comment, 'created' => $row->createdDate, 'createdByName' => $row->createdByName, 'modified' => $row->modifiedDate, 'modifiedByName' => $row->modifiedByName, 'sticky' => $row->systemID == 0 ? true : false);
	}
} else if ((isset($_REQUEST['mode']) && ($_REQUEST['mode'] == 'refresh')) || $refresh['sigUpdate'] == true || $refresh['chainUpdate'] == true) {
	$signatureCount 	= isset($_REQUEST['signatureCount']) ? $_REQUEST['signatureCount'] : null;
	$signatureTime 		= isset($_REQUEST['signatureTime']) ? $_REQUEST['signatureTime'] : null;
	$chainCount				= isset($_REQUEST['chainCount'])?$_REQUEST['chainCount']:null;
	$chainTime 				= isset($_REQUEST['chainTime'])?$_REQUEST['chainTime']:null;
	$flareCount 			= isset($_REQUEST['flareCount'])?$_REQUEST['flareCount']:null;
	$flareTime 				= isset($_REQUEST['flareTime'])?$_REQUEST['flareTime']:null;
	$commentCount 		= isset($_REQUEST['commentCount'])?$_REQUEST['commentCount']:null;
	$commentTime 			= isset($_REQUEST['commentTime'])?$_REQUEST['commentTime']:null;

	// Send server time for time sync
	$now = new DateTime();
	$now->add(new DateInterval('PT1S')); // Set clock 1 second ahead, jquery countdown plugin sync needs time to be slightly different that countdown time
	$output['sync'] = $now->format("M j, Y H:i:s O");

	// Check if signatures changed....
	if ($refresh['sigUpdate'] == false) {
		$query = 'SELECT COUNT(*) as total, MAX(modifiedTime) as time FROM signatures WHERE (systemID = :systemID OR type = "wormhole") AND maskID = :maskID';
		$stmt = $mysql->prepare($query);
		$stmt->bindValue(':systemID', $systemID);
		$stmt->bindValue(':maskID', $maskID);
		$stmt->execute();
		$results = $stmt->fetchObject();

		if ($signatureCount != $results->total || strtotime($signatureTime) < strtotime($results->time)) {
			$refresh['sigUpdate'] = true;
		}
	}

	if ($refresh['sigUpdate'] == true) {
		$output['signatures'] = array();
		$query = 'SELECT * FROM signatures WHERE (systemID = :systemID OR type = "wormhole") AND maskID = :maskID';
		$stmt = $mysql->prepare($query);
		$stmt->bindValue(':systemID', $systemID);
		$stmt->bindValue(':maskID', $maskID);
		$stmt->execute();
		$rows = $stmt->fetchAll(PDO::FETCH_CLASS);
		foreach ($rows AS $row) {
			$output['signatures'][$row->id] = $row;
		}

		$output['wormholes'] = array();
		$query = 'SELECT * FROM wormholes WHERE maskID = :maskID';
		$stmt = $mysql->prepare($query);
		$stmt->bindValue(':maskID', $maskID);
		$stmt->execute();
		$rows = $stmt->fetchAll(PDO::FETCH_CLASS);
		foreach ($rows AS $row) {
			$output['wormholes'][$row->id] = $row;
		}
	}

	// Get flares
	if ($flareCount != null && $flareTime != null) {
		$query = 'SELECT systemID, flare, time FROM flares WHERE maskID = :maskID ORDER BY time DESC';
		$stmt = $mysql->prepare($query);
		$stmt->bindValue(':maskID', $maskID);
		$stmt->execute();
		$result = $stmt->fetchAll(PDO::FETCH_CLASS);
		if (count($result) != $flareCount || ($result && strtotime($result[0]->time) < strtotime($flareTime))) {
			$output['flares']['flares'] = $result;
			$output['flares']['last_modified'] = date('m/d/Y H:i:s e', $result ? strtotime($result[0]->time) : time());
		}
	}

	// Get occupied systems
	$query = 'SELECT systemID, COUNT(characterID) AS count FROM tracking WHERE maskID = :maskID GROUP BY systemID';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':maskID', $maskID);
	$stmt->execute();
	if ($result = $stmt->fetchAll(PDO::FETCH_CLASS)) {
		$output['occupied'] = $result;
	}

	// Check Comments
	$query = 'SELECT COUNT(id) AS count, MAX(modified) AS modified FROM comments WHERE (systemID = :systemID OR systemID = 0) AND maskID = :maskID';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':systemID', $systemID);
	$stmt->bindValue(':maskID', $maskID);
	$stmt->execute();
	$row = $stmt->fetch(PDO::FETCH_OBJ);
	if ((int)$commentCount != (int)$row->count || strtotime($commentTime) < strtotime($row->modified)) {
		$output['comments'] = array();
		// Get Comments
		$query = 'SELECT id, comment, created AS createdDate, createdByName, modified AS modifiedDate, modifiedByName, systemID FROM comments WHERE (systemID = :systemID OR systemID = 0) AND maskID = :maskID ORDER BY systemID ASC, modified ASC';
		$stmt = $mysql->prepare($query);
		$stmt->bindValue(':systemID', $systemID);
		$stmt->bindValue(':maskID', $maskID);
		$stmt->execute();
		while ($row = $stmt->fetchObject()) {
			$output['comments'][] = array('id' => $row->id, 'comment' => $row->comment, 'created' => $row->createdDate, 'createdByName' => $row->createdByName, 'modified' => $row->modifiedDate, 'modifiedByName' => $row->modifiedByName, 'sticky' => $row->systemID == 0 ? true : false);
		}
	}
}

$output['proccessTime'] = sprintf('%.4f', microtime(true) - $startTime);
echo json_encode($output);
