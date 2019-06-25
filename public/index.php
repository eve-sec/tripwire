<?php

// SSO redirecting
$state = isset($_REQUEST['state'])?$_REQUEST['state']:null;
if ($state == 'evessologin' || $state == 'evessoesi') {
	require('login.php');
	exit();
} else if ($state == 'evessoregisteruser' || $state == 'evessoregisteradmin') {
	require('register.php');
	exit();
}

session_start();

if (!isset($_SESSION['username']) && isset($_COOKIE['tripwire']))
	include('login.php');

if (isset($_GET['system']) && isset($_SESSION['userID'])) {
	require('../tripwire.php');
} else {
	require('../landing.php');
}

?>
