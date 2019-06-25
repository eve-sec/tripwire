<?php

require_once('../config.php');

if (!TRIPWIRE_API) {
    header('HTTP/1.0 503 Service Unavailable');
    exit();
}

require_once('../db.inc.php');
require_once('../api/auth.php');

header('Content-Type: application/json');
$output = null;

$path = explode('/', $_REQUEST['q']);

if (isset($path[1])) {
    if ($path[1] == 'signatures') {
        if ($_SERVER['REQUEST_METHOD'] == 'GET') {
            include('../api/signatures/get.php');
        }
    } else if ($path[1] == 'wormholes') {
        if ($_SERVER['REQUEST_METHOD'] == 'GET') {
            include('../api/wormholes/get.php');
        }
    }
}

echo json_encode($output);
