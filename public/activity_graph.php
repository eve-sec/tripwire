<?php
//***********************************************************
//	File: 		activityData.php
//	Author: 	Daimian
//	Created: 	6/1/2013
//	Modified: 	2/13/2014 - Daimian
//
//	Purpose:	Handles getting activity graph data.
//
//	ToDo:
//		Remove need to revese array
//		Remove need to include zeros
//***********************************************************
$startTime = microtime(true);

if (!session_id()) session_start();

// Check for login & admin permission - else kick
if(!isset($_SESSION['userID'])) {
	http_response_code(403);
	exit();
}

require_once('../config.php');
require_once('../db.inc.php');

$cache = 360;

header('Cache-Control: max-age='.$cache);
header('Expires: '.gmdate('r', time() + $cache));
header('Pragma: cache');
header('Content-Type: application/json');

$length = isset($_REQUEST['time']) && !empty($_REQUEST['time']) ? intval($_REQUEST['time']) +1 : 25;
$systemID = $_REQUEST['systemID'];

//$annotations['2015-12-20 15:00:00'] = Array('label' => 'Downtime', 'text' => 'EVE Downtime');

$query = 'SELECT shipJumps, shipKills, podKills, npcKills, time FROM system_activity WHERE systemID = :systemID ORDER BY time DESC LIMIT :limit';
$stmt = $mysql->prepare($query);
$stmt->bindValue(':systemID', $systemID);
$stmt->bindValue(':limit', $length, PDO::PARAM_INT); // MySQL LIMIT requies this to have an int type sent
$stmt->execute();

$output['cols'][] = Array('type' => 'string');
$output['cols'][] = Array('type' => 'number');
$output['cols'][] = Array('type' => 'number');
$output['cols'][] = Array('type' => 'number');
$output['cols'][] = Array('type' => 'number');
#$output['cols'][] = Array('type' => 'string');
#$output['cols'][] = Array('type' => 'string');

$now = time();
$row = $stmt->fetchObject();
for ($x = 0; $x <= $length -1; $x++) {
	$data = null;

/*
	if ($row && isset($annotations[$row->time])) {
		$data[5] = Array('v' => $annotations[$row->time]['label']);
		$data[6] = Array('v' => $annotations[$row->time]['text']);
	} else {
		$data[5] = Array('v' => null);
		$data[6] = Array('v' => null);
	}
*/

	if ($row && date('m/d/Y H', strtotime($row->time)) == date('m/d/Y H', $now - (3600 * $x))) {
		$data[0] = Array('v' => $x);
		$data[1] = Array('v' => (int)$row->shipJumps);
		$data[2] = Array('v' => (int)$row->podKills);
		$data[3] = Array('v' => (int)$row->shipKills);
		$data[4] = Array('v' => (int)$row->npcKills);

		$row = $stmt->fetchObject();
	} else {
		$data[0] = Array('v' => $x);
		$data[1] = Array('v' => 0);
		$data[2] = Array('v' => 0);
		$data[3] = Array('v' => 0);
		$data[4] = Array('v' => 0);
	}

	$output['rows'][]['c'] = $data;
}

$output['proccessTime'] = sprintf('%.4f', microtime(true) - $startTime);

echo json_encode($output);
