<?php
//***********************************************************
//	File: 		login.php
//	Author: 	Daimian
//	Created: 	2/13/2014
//	Modified: 	2/13/2014 - Daimian
//
//	Purpose:	Handles the login process.
//
//	ToDo:
//***********************************************************
$startTime = microtime(true);

if (!session_id()) session_start();

require_once('../config.php');
require_once('../db.inc.php');
require_once('../esi.class.php');

$esi = new esi();

function login_history($ip, $username, $method, $result) {
	global $mysql;

	$query = 'INSERT INTO _history_login (ip, username, method, result) VALUES (:ip, :username, :method, :result)';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':ip', $ip);
	$stmt->bindValue(':username', $username);
	$stmt->bindValue(':method', $method);
	$stmt->bindValue(':result', $result);
	$stmt->execute();
}

$mode = 		isset($_REQUEST['mode'])?$_REQUEST['mode']:null;
$code = 		isset($_REQUEST['code'])?$_REQUEST['code']:null;
$state =		isset($_REQUEST['state'])?$_REQUEST['state']:null;
$login =		isset($_REQUEST['login'])?$_REQUEST['login']:null;
$ip = 			$_SERVER['REMOTE_ADDR'];

/**
 * Generate a random string, using a cryptographically secure
 * pseudorandom number generator (random_int)
 *
 * For PHP 7, random_int is a PHP core function
 * For PHP 5.x, depends on https://github.com/paragonie/random_compat
 *
 * @param int $length      How many characters do we want?
 * @param string $keyspace A string of all possible characters
 *                         to select from
 * @return string
 */
function random_str(
    $length,
    $keyspace = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
) {
    $str = '';
    $max = mb_strlen($keyspace, '8bit') - 1;
    for ($i = 0; $i < $length; ++$i) {
        $str .= $keyspace[random_int(0, $max)];
    }
    return $str;
}

if ($mode == 'login') {
	$username 	= isset($_REQUEST['username'])?$_REQUEST['username']:null;
	$password 	= isset($_REQUEST['password'])?$_REQUEST['password']:null;
	$method		= 'user';
	$remember	= isset($_REQUEST['remember'])?1:0;

	// Check input
	if (!$username || !$password || !$ip) {
		if (!$username) {
			$output['field'] = 'username';
			$output['error'] = 'Username required.';
		} else if (!$password) {
			$output['field'] = 'password';
			$output['error'] = 'Password required.';
		} else if (!$ip) {
			$output['field'] = 'password';
			$output['error'] = 'IP not detected.';
		}
	} else if (strlen($password) > 72) {
		$output['field'] = 'password';
		$output['error'] = 'Password too long.';
	} else {
		// Check login attempts
		$query = 'SELECT COUNT(ip) FROM _history_login WHERE ip = :ip AND DATE_ADD(time, INTERVAL 30 SECOND) > NOW()';
		$stmt = $mysql->prepare($query);
		$stmt->bindValue(':ip', $ip);
		$stmt->execute();
		if ($stmt->fetchColumn(0) > 3) {
			$output['field'] = 'username';
			$output['error'] = 'Login attempts exceeded, please wait 30 seconds.';

			// Log the attempt
			login_history($ip, $username, $method, 'fail');
		} else {
			$query = 'SELECT id, username, password, accounts.ban, characterID, characterName, corporationID, corporationName, admin, super, options FROM accounts LEFT JOIN preferences ON id = preferences.userID LEFT JOIN characters ON id = characters.userID WHERE username = :username';
			$stmt = $mysql->prepare($query);
			$stmt->bindValue(':username', $username);
			$stmt->execute();
			if ($account = $stmt->fetchObject()) {
				require('../password_hash.php');
				$hasher = new PasswordHash(8, FALSE);

				if ($account->ban == 1) {
					$output['field'] = 'username';
					$output['error'] = 'You have been banned.';

					// Log the attempt
					login_history($ip, $username, $method, 'fail');
				} else if ($hasher->CheckPassword($password, $account->password) == false) {
					$output['field'] = 'password';
					$output['error'] = 'Password incorrect.';

					// Log the attempt
					login_history($ip, $username, $method, 'fail');
				} else if (!$character = $esi->getCharacter($account->characterID)) {
					// Something crazy happened on CCP's end
					$output['field'] = 'password';
					$output['error'] = 'EVE ESI error.';
				} else if (!$corporation = $esi->getCorporation($character->corporation_id)) {
					// Something crazy happened on CCP's end
					$output['field'] = 'password';
					$output['error'] = 'EVE ESI error.';
				} else {
					// check and update character corp and admin powers
					$query = 'UPDATE characters SET corporationID = :corporationID, corporationName = :corporationName, ban = 0, admin = 0 WHERE characterID = :characterID AND corporationID <> :corporationID';
					$stmt = $mysql->prepare($query);
					$stmt->bindValue(':characterID', $account->characterID);
					$stmt->bindValue(':corporationID', $character->corporation_id);
					$stmt->bindValue(':corporationName', $corporation->name);
					$stmt->execute();
					if ($stmt->rowCount()) {
						$query = 'SELECT id, username, password, accounts.ban, characterID, characterName, corporationID, corporationName, admin, super, options FROM accounts LEFT JOIN preferences ON id = preferences.userID LEFT JOIN characters ON id = characters.userID WHERE username = :username';
						$stmt = $mysql->prepare($query);
						$stmt->bindValue(':username', $username);
						$stmt->execute();
						$account = $stmt->fetchObject();
					}

					$options = json_decode($account->options);

					$_SESSION['userID'] = $account->id;
					$_SESSION['username'] = $account->username;
					$_SESSION['ip'] = $ip;
					$_SESSION['mask'] = @$options->masks->active ? $options->masks->active : $account->corporationID . '.2';
					$_SESSION['characterID'] = $account->characterID;
					$_SESSION['characterName'] = $account->characterName;
					$_SESSION['corporationID'] = $account->corporationID;
          $_SESSION['corporationName'] = $account->corporationName;
          $_SESSION['admin'] = $account->admin;
          $_SESSION['super'] = $account->super;
					$_SESSION['options'] = $options;

					$output['result'] = 'success';
					$output['session'] = $_SESSION;

					// Log the attempt
					login_history($ip, $username, $method, 'success');

					$query = 'UPDATE accounts SET logins = logins + 1, lastLogin = NOW() WHERE id = :userID';
					$stmt = $mysql->prepare($query);
					$stmt->bindValue(':userID', $account->id);
					$stmt->execute();

					//save cookie on client PC for 30 days
					if ($remember) {
						$token = $hasher->HashPassword(random_str(30));
						$query = 'INSERT INTO tokens (userID, token) VALUES (:userID, :token) ON DUPLICATE KEY UPDATE token = :token';
						$stmt = $mysql->prepare($query);
						$stmt->bindValue(':userID', $account->id);
						$stmt->bindValue(':token', $token);
						$stmt->execute();

						$cookie = base64_encode($account->id . ':' . $token);

						setcookie('tripwire', $cookie, time()+60*60*24*30, '/', '', true, true);
					}
				}
			} else {
				$output['field'] = 'username';
				$output['error'] = "Username doesn't exist.";

				// Log the attempt
				login_history($ip, $username, $method, 'fail');
			}
		}
	}
} else if ($mode == 'sso') {
	$method		= 'sso';

	if ($code && $state == 'evessologin') {
		if ($esi->authenticate($code)) {
			$query = 'SELECT id, username, password, accounts.ban, characterID, characterName, corporationID, corporationName, admin, super, options FROM accounts LEFT JOIN preferences ON id = preferences.userID LEFT JOIN characters ON id = characters.userID WHERE characterID = :characterID';
			$stmt = $mysql->prepare($query);
			$stmt->bindValue(':characterID', $esi->characterID);
			$stmt->execute();

			if ($account = $stmt->fetchObject()) {
				// check and update character corp and admin powers
		    if (!$character = $esi->getCharacter($account->characterID)) {
		      // Something crazy happened on CCP's end
		      header('Location: ./?error=login-unknown#login#sso');
		      exit();
		    }

		    if (!$corporation = $esi->getCorporation($character->corporation_id)) {
		      // Something crazy happened on CCP's end
		      header('Location: ./?error=login-unknown#login#sso');
		      exit();
		    }

				$query = 'UPDATE characters SET corporationID = :corporationID, corporationName = :corporationName, ban = 0, admin = 0 WHERE characterID = :characterID AND corporationID <> :corporationID';
				$stmt = $mysql->prepare($query);
				$stmt->bindValue(':characterID', $account->characterID);
				$stmt->bindValue(':corporationID', $character->corporation_id);
				$stmt->bindValue(':corporationName', $corporation->name);
				$stmt->execute();
				if ($stmt->rowCount()) {
					$query = 'SELECT id, username, password, accounts.ban, characterID, characterName, corporationID, corporationName, admin, super, options FROM accounts LEFT JOIN preferences ON id = preferences.userID LEFT JOIN characters ON id = characters.userID WHERE characterID = :characterID';
					$stmt = $mysql->prepare($query);
					$stmt->bindValue(':characterID', $esi->characterID);
					$stmt->execute();
					$account = $stmt->fetchObject();
				}

				$options = json_decode($account->options);

				$_SESSION['userID'] = $account->id;
				$_SESSION['username'] = $account->username;
				$_SESSION['ip'] = $ip;
				$_SESSION['mask'] = @$options->masks->active ? $options->masks->active : $account->corporationID . '.2';
				$_SESSION['characterID'] = $account->characterID;
				$_SESSION['characterName'] = $account->characterName;
				$_SESSION['corporationID'] = $account->corporationID;
				$_SESSION['corporationName'] = $account->corporationName;
				$_SESSION['admin'] = $account->admin;
				$_SESSION['super'] = $account->super;
				$_SESSION['options'] = $options;

				// Log the attempt
				login_history($ip, $account->username, $method, 'success');

				$query = 'UPDATE accounts SET logins = logins + 1, lastLogin = NOW() WHERE id = :userID';
				$stmt = $mysql->prepare($query);
				$stmt->bindValue(':userID', $account->id);
				$stmt->execute();

				if (isset($_SESSION['ssologin_system'])) {
					header('Location: .?system=' . $_SESSION['ssologin_system']);
				} else {
					header('Location: .?system=');
				}

				exit();
			}

			header('Location: ./?error=login-account#login#sso');
			exit();
		}

		header('Location: ./?error=login-unknown#login#sso');
		exit();
	} else if ($code && $state == 'evessoesi') {
		if ($esi->authenticate($code)) {
			if(!isset($_SESSION['userID'])) {
				$_SESSION = array();
				session_regenerate_id();
				session_destroy();
				header('Location: ./?system=');
				exit();
			}

			$query = 'INSERT INTO esi (userID, characterID, characterName, accessToken, refreshToken, tokenExpire) VALUES (:userID, :characterID, :characterName, :accessToken, :refreshToken, :tokenExpire) ON DUPLICATE KEY UPDATE accessToken = :accessToken, refreshToken = :refreshToken, tokenExpire = :tokenExpire';
			$stmt = $mysql->prepare($query);
			$stmt->bindValue(':userID', $_SESSION['userID']);
			$stmt->bindValue(':characterID', $esi->characterID);
			$stmt->bindValue(':characterName', $esi->characterName);
			$stmt->bindValue(':accessToken', $esi->accessToken);
			$stmt->bindValue(':refreshToken', $esi->refreshToken);
			$stmt->bindValue(':tokenExpire', date('Y-m-d H:i:s', strtotime($esi->tokenExpire)));
			$stmt->execute();

			header('Location: ./?system=');
			exit();
		} else {
			echo $esi->lastError;
		}
	} else {
		if ($login == 'sso') {
			// Keep the URL param system
			if (isset($_GET['system'])) {
				$_SESSION['ssologin_system'] = $_GET['system'];
			}
			$esi->login();
		} else if ($login == 'esi') {
			$esi->login('esi-location.read_online.v1 esi-location.read_location.v1 esi-location.read_ship_type.v1 esi-ui.write_waypoint.v1 esi-ui.open_window.v1', 'evessoesi');
		}
	}
} else if (isset($_COOKIE['tripwire'])) {
	$method = 'cookie';

	// Check login attempts
	$query = 'SELECT COUNT(ip) FROM _history_login WHERE ip = :ip AND DATE_ADD(time, INTERVAL 30 SECOND) > NOW()';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':ip', $ip);
	$stmt->execute();
	if ($stmt->fetchColumn(0) > 3) {
		$output['field'] = 'username';
		$output['error'] = 'Login attempts exceeded, please wait 30 seconds.';

		// Log the attempt
		login_history($ip, NULL, $method, 'fail');
	} else {
		$cookie = explode(':', base64_decode($_COOKIE['tripwire']));
		$userID = $cookie[0];
		$token = $cookie[1];

		$query = 'SELECT id, username, password, accounts.ban, characterID, characterName, corporationID, corporationName, admin, super, options, token FROM accounts LEFT JOIN tokens ON id = tokens.userID LEFT JOIN preferences ON id = preferences.userID LEFT JOIN characters ON id = characters.userID WHERE id = :userID';
		$stmt = $mysql->prepare($query);
		$stmt->bindValue(':userID', $userID);
		$stmt->execute();

		if ($account = $stmt->fetchObject()) {
			if ($account->ban == 1) {
				$output['field'] = 'username';
				$output['error'] = 'You have been banned.';

				// Log the attempt
				login_history($ip, $account->username, $method, 'fail');
			} else if ($token !== $account->token) {
				$output['field'] = 'username';
				$output['error'] = 'Remember Me token incorrect.';

				// Log the attempt
				login_history($ip, $account->username, $method, 'fail');
			} else if (!$character = $esi->getCharacter($account->characterID)) {
				// Something crazy happened on CCP's end
				$output['field'] = 'username';
				$output['error'] = 'EVE ESI error.';
			} else if (!$corporation = $esi->getCorporation($character->corporation_id)) {
				// Something crazy happened on CCP's end
				$output['field'] = 'username';
				$output['error'] = 'EVE ESI error.';
			} else {
				$query = 'UPDATE characters SET corporationID = :corporationID, corporationName = :corporationName, ban = 0, admin = 0 WHERE characterID = :characterID AND corporationID <> :corporationID';
				$stmt = $mysql->prepare($query);
				$stmt->bindValue(':characterID', $account->characterID);
				$stmt->bindValue(':corporationID', $character->corporation_id);
				$stmt->bindValue(':corporationName', $corporation->name);
				$stmt->execute();
				if ($stmt->rowCount()) {
					$query = 'SELECT id, username, password, accounts.ban, characterID, characterName, corporationID, corporationName, admin, super, options, token FROM accounts LEFT JOIN tokens ON id = tokens.userID LEFT JOIN preferences ON id = preferences.userID LEFT JOIN characters ON id = characters.userID WHERE id = :userID';
					$stmt = $mysql->prepare($query);
					$stmt->bindValue(':userID', $userID);
					$stmt->execute();
					$account = $stmt->fetchObject();
				}

				$options = json_decode($account->options);

				$_SESSION['userID'] = $account->id;
				$_SESSION['username'] = $account->username;
				$_SESSION['ip'] = $ip;
				$_SESSION['mask'] = @$options->masks->active ? $options->masks->active : $account->corporationID . '.2';
				$_SESSION['characterID'] = $account->characterID;
				$_SESSION['characterName'] = $account->characterName;
				$_SESSION['corporationID'] = $account->corporationID;
				$_SESSION['corporationName'] = $account->corporationName;
				$_SESSION['admin'] = $account->admin;
				$_SESSION['super'] = $account->super;
				$_SESSION['options'] = $options;

				$output['result'] = 'success';
				$output['session'] = $_SESSION;

				// Log the attempt
				login_history($ip, $account->username, $method, 'success');

				$query = 'UPDATE accounts SET logins = logins + 1, lastLogin = NOW() WHERE id = :userID';
				$stmt = $mysql->prepare($query);
				$stmt->bindValue(':userID', $account->id);
				$stmt->execute();
			}
		}
	}
}

$output['proccessTime'] = sprintf('%.4f', microtime(true) - $startTime);

if (isset($_REQUEST['mode'])) echo json_encode($output);
?>
