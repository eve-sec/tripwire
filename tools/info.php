<?php

$startTime = microtime(true);

session_start();

if(!isset($_SESSION['super']) || $_SESSION['super'] != 1) {
	echo 'Security Failure!';
	exit();
}

phpInfo();

echo sprintf('%.4f', microtime(true) - $startTime);

?>