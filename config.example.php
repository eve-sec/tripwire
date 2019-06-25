<?php

// Place all app configs here
date_default_timezone_set('UTC');

// Application name
define('APP_NAME', 'Tripwire');

// Content file server (Use CDN here if you have one) - used for serving images, css, js files
define('CDN_DOMAIN', 'localhost');

// EVE SDE table name
define('EVE_DUMP', 'eve_carnyx');

// Enable Tripwire API?
define('TRIPWIRE_API', false);

// EVE API userAgent
define('USER_AGENT', 'Tripwire Server - adminEmail@example.com');

// EVE SSO info
define('EVE_SSO_CLIENT', 'clientID');
define('EVE_SSO_SECRET', 'secret');
define('EVE_SSO_REDIRECT', 'http://localhost/index.php?mode=sso');
