<?php

/**
 ToDo:
	- Button to create womrhole effects JSON file & include in combine.json
	- Button to create pirates JSON file & include in combine.json
	- Make a statics JSON files & include in combine.json
	- Create a way to crawl for statics and include run from here
**/

session_start();

if(!isset($_SESSION['super']) || $_SESSION['super'] != 1) {
	echo 'Security Failure!';
	exit();
}

require_once('../db.inc.php');

/*
$contents = file(dirname(__FILE__).'/statics.json');
foreach ($contents AS $line) {
	$statics[substr($line, 0, 7)][] = substr($line, 8, 4);
}
echo json_encode($statics);
*/

if (isset($_REQUEST['combine'])) {
	$output = null;

	if ($file = fopen(dirname(__FILE__).'/combine.json', 'w')) {
		// Statics
		$statics = json_decode(file_get_contents(dirname(__FILE__).'/statics.json'), true);

		// Systems
		$query = 'SELECT s.solarSystemID, s.solarSystemName, s.security, s.constellationID, s.regionID, s.factionID, wormholeClassID, typeName FROM '. EVE_DUMP .'.mapSolarSystems s LEFT JOIN '. EVE_DUMP .'.mapLocationWormholeClasses ON regionID = locationID OR s.solarSystemID = locationID LEFT JOIN '. EVE_DUMP .'.mapDenormalize d ON d.solarSystemID = s.solarSystemID AND d.groupID = 995 LEFT JOIN '. EVE_DUMP .'.invTypes t ON t.typeID = d.typeID';
		$stmt = $mysql->prepare($query);
		$stmt->execute();
		while ($row = $stmt->fetchObject()) {
			$output['systems'][$row->solarSystemID]['name'] = $row->solarSystemName;
			$output['systems'][$row->solarSystemID]['security'] = substr($row->security, 0, (strpos($row->security, '.') + 3)); //substr(number_format($row->security, 3), 0, 4);
			$output['systems'][$row->solarSystemID]['constellationID'] = $row->constellationID;
			$output['systems'][$row->solarSystemID]['regionID'] = $row->regionID;
			if ($row->factionID) $output['systems'][$row->solarSystemID]['factionID'] = $row->factionID;
			if ((int)$row->regionID > 11000000) $output['systems'][$row->solarSystemID]['class'] = $row->wormholeClassID;
			if ((int)$row->regionID > 11000000 && $row->typeName) $output['systems'][$row->solarSystemID]['effect'] = $row->typeName;
			if ((int)$row->regionID > 11000000) $output['systems'][$row->solarSystemID]['statics'] = $statics[$row->solarSystemName];
		}

		// Regions
		$query = 'SELECT regionID, regionName FROM '. EVE_DUMP .'.mapRegions';
		$stmt = $mysql->prepare($query);
		$stmt->execute();
		while ($row = $stmt->fetchObject()) {
			$output['regions'][$row->regionID]['name'] = $row->regionName;
		}

		// Factions
		$query = 'SELECT factionID, factionName FROM '. EVE_DUMP .'.chrFactions';
		$stmt = $mysql->prepare($query);
		$stmt->execute();
		while ($row = $stmt->fetchObject()) {
			$output['factions'][$row->factionID]['name'] = $row->factionName;
		}

		// Wormholes
		$output['wormholes'] = json_decode(file_get_contents(dirname(__FILE__).'/wormholes.json'));

		// Map
		$output['map'] = json_decode(file_get_contents(dirname(__FILE__).'/map.json'));

		// Effects
		$output['effects'] = json_decode(file_get_contents(dirname(__FILE__).'/effects.json'));

		fwrite($file, json_encode($output));
		fclose($file);
	}
}

?>

<div style="margin: 0 auto; width: 50%;">
	<input type="button" value="Generate combine.json" onclick="window.location.href='?combine=true';" />
</div>
