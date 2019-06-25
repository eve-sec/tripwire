<?php

ini_set('display_errors', 'On');

require('config.php');
require('db.inc.php');
require('esi.class.php');

date_default_timezone_set('UTC');

$time = date('Y-m-d H:00:00', time());

$esi = new esi();

$keys = array('ship_jumps', 'ship_kills', 'pod_kills', 'npc_kills');

foreach ($esi->getJumps() AS $systemJumps) {
    $activity[$systemJumps->system_id] = array_fill_keys($keys, '');
    $activity[$systemJumps->system_id]['ship_jumps'] = $systemJumps->ship_jumps;
}

foreach ($esi->getKills() AS $systemKills) {
    $activity[$systemKills->system_id] = array_fill_keys($keys, '');
    $activity[$systemKills->system_id]['ship_kills'] = $systemKills->ship_kills;
    $activity[$systemKills->system_id]['pod_kills'] = $systemKills->pod_kills;
    $activity[$systemKills->system_id]['npc_kills'] = $systemKills->npc_kills;
}

foreach ($activity AS $systemID => $data) {
    $query = 'INSERT INTO system_activity (systemID, time, shipJumps, shipKills, podKills, npcKills) VALUES (:systemID, :time, :shipJumps, :shipKills, :podKills, :npcKills)';
    $stmt = $mysql->prepare($query);
    $stmt->bindValue(':systemID', $systemID);
    $stmt->bindValue(':time', $time);
    $stmt->bindValue(':shipJumps', $data['ship_jumps']);
    $stmt->bindValue(':shipKills', $data['ship_kills']);
    $stmt->bindValue(':podKills', $data['pod_kills']);
    $stmt->bindValue(':npcKills', $data['npc_kills']);
    $stmt->execute();
}
