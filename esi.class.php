<?php

class esi {
    // https://sisilogin.testeveonline.com
    private static $loginUrl = 'https://login.eveonline.com/oauth';
    private static $esiUrl = 'https://esi.evetech.net';
    public $lastError = null;
    public $httpCode = null;
    public $characterID = null;
    public $characterName = null;
    public $accessToken = null;
    public $refreshToken = null;
    public $tokenExpire = null;

    private function getAPI($url, $headers = array(), $params = false) {
		$curl = curl_init();
		curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);

    if ($params) {
        curl_setopt($curl, CURLOPT_POST, true);
        curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($params));
    }

		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		// curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($curl, CURLOPT_USERAGENT, USER_AGENT);

		$result = curl_exec($curl);
    $this->httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);

    if ($result === false) {
        $this->lastError = curl_error($curl);
    }

		return $result;
	}

    public function login($scope = NULL, $state = 'evessologin') {
        $params = array(
            'response_type' => 'code',
            'redirect_uri' => EVE_SSO_REDIRECT,
            'client_id' => EVE_SSO_CLIENT,
            'scope' => $scope,
            'state' => $state
        );

        header('Location: '. self::$loginUrl . '/authorize?' . http_build_query($params), true, 302);
    }

    public function authenticate($code) {
        $headers = array('Authorization: Basic '.base64_encode(EVE_SSO_CLIENT.':'.EVE_SSO_SECRET));
        $params = array(
            'grant_type' => 'authorization_code',
            'code' => $code
        );

        $result = $this->getAPI(self::$loginUrl.'/token', $headers, $params);

        if ($result === false) {
            return false;
        }

        $response = json_decode($result);
        if (!isset($response->access_token)) {
            $this->lastError = 'Invalid reponse from ESI during token authentication. ' . $result;
            return false;
        }

        $this->accessToken = $response->access_token;
        $this->tokenExpire = date('Y-m-d H:i:s', time() + $response->expires_in);
        $this->refreshToken = $response->refresh_token;

        $headers = array('Authorization: Bearer '. $this->accessToken);

        $result = $this->getAPI(self::$loginUrl.'/verify', $headers);

        if ($result === false) {
            return false;
        }

        $response = json_decode($result);
        if (!isset($response->CharacterID)) {
            $this->lastError = 'Invalid reponse from ESI during verification. ' . $result;
            return false;
        }

        $this->characterID = $response->CharacterID;
        $this->characterName = $response->CharacterName;

        return true;
    }

    public function refresh($refreshToken) {
        $headers = array('Authorization: Basic '.base64_encode(EVE_SSO_CLIENT.':'.EVE_SSO_SECRET));
        $params = array(
            'grant_type' => 'refresh_token',
            'refresh_token' => $refreshToken
        );

        $result = $this->getAPI(self::$loginUrl.'/token', $headers, $params);

        if ($result === false) {
            return false;
        }

        $response = json_decode($result);
        if (!isset($response->access_token)) {
            $this->lastError = 'Invalid reponse from ESI during token refresh. ' . $result;
            return false;
        }

        $this->accessToken = $response->access_token;
        $this->tokenExpire = date('Y-m-d H:i:sP', time() + $response->expires_in);
        $this->refreshToken = $response->refresh_token;

        return true;
    }

    public function getCharacter($characterID) {
        $result = $this->getAPI(self::$esiUrl.'/v4/characters/'.$characterID.'/');

        if ($result === false || !json_decode($result) || !isset(json_decode($result)->name)) {
            return false;
        }

        return json_decode($result);
    }

    public function getCorporation($corporationID) {
        $result = $this->getAPI(self::$esiUrl.'/v4/corporations/'.$corporationID.'/');

        if ($result === false || !json_decode($result) || !isset(json_decode($result)->name)) {
            return false;
        }

        return json_decode($result);
    }

    public function getCharacterRoles($characterID) {
        $headers = array('Authorization: Bearer '. $this->accessToken);
        $result = $this->getAPI(self::$esiUrl.'/v2/characters/'.$characterID.'/roles/', $headers);

        if ($result === false) {
            return false;
        }

        return json_decode($result);
    }

    public function getCharacterTitles($characterID) {
        $headers = array('Authorization: Bearer '. $this->accessToken);
        $result = $this->getAPI(self::$esiUrl.'/v1/characters/'.$characterID.'/titles/', $headers);

        if ($result === false) {
            return false;
        }

        // convert array of objects into just an array of titles
        $titles = [];
        foreach (json_decode($result) AS $title) {
            $titles[] = $title->name;
        }

        return $titles;
    }

    public function getJumps() {
        $result = $this->getAPI(self::$esiUrl.'/v1/universe/system_jumps/');

        if ($result === false) {
            return false;
        }

        return json_decode($result);
    }

    public function getKills() {
        $result = $this->getAPI(self::$esiUrl.'/v2/universe/system_kills/');

        if ($result === false) {
            return false;
        }

        return json_decode($result);
    }
}

?>
