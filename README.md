# INFO #
This is a Fork Clone of repo from [Bitbucket](https://bitbucket.org/daimian/tripwire/branch/production)

Some things have changed, read carefully - also Docker has some isssues yet, recommend not using it or helping solve the issues.

The landing page twitter feed won't work since the one I used requires a private token, I will have to find a new way to do it later.

### Tripwire - EVE Online wormhole mapping web tool ###

* MIT license
* [Learn Markdown](https://bitbucket.org/tutorials/markdowndemo)

### Setup guide for Linux ###

Requirements:

* PHP7+ (older requires polyfill for public/login.php as documented in that file)
* php-mbstring must be installed
* MySQL (or some flavor of MySQL - needed because database EVENTS)
* A my.cnf MySQL config file example is located in `.docker/mysql/my.cnf`
* The `sql_mode` and `event_scheduler` my.cnf lines are important, make sure you have them in your my.cnf file & reboot MySQL
* CRON or some other scheduler to execute PHP scripts

Setup:

* Create a `tripwire` database using the export located in `.docker/mysql/tripwire.sql`
* Create an EVE dump database, define it's name later in `config.php`. Download from: https://www.fuzzwork.co.uk/dump/ To download the latest use the following link: https://www.fuzzwork.co.uk/dump/mysql-latest.tar.bz2
* Clone the Tripwire repo to where you are going to serve to the public OR manually download repo and copy files yourself
* Copy `db.inc.example.php` to `db.inc.php` - modify file per your setup
* Copy `config.example.php` to `config.php` - modify file per your setup
* Create an EVE developer application via https://developers.eveonline.com/applications
* EVE SSO `Callback URL` should be: `https://your-domain.com/index.php?mode=sso`
* Use the following scopes:
esi-location.read_location.v1
esi-location.read_ship_type.v1
esi-ui.open_window.v1
esi-ui.write_waypoint.v1
esi-characters.read_corporation_roles.v1
esi-location.read_online.v1
esi-characters.read_titles.v1
* Settings go in the `config.php` file
* Modify your web server to serve Tripwire from the `tripwire/public` folder so the files like `config.php` and `db.inc.php` are not accessible via URL
* Setup a CRON or schedule for `system_activity.cron.php` to run at the top of every hour. CRON: `0 * * * * php /dir/to/system_activity.cron.php`
* Setup a CRON or schedule for `account_update.cron.php` to run every 3 minutes or however often you want to check for corporation changes. CRON: `*/3 * * * * php /dir/to/account_update.cron.php`

### Setup guide for Docker ###

Note: MySQL is setup without a root password - make sure you have a secure host machine.
Note: Be sure to properly fully shutdown Docker, and quit! Otherwise you will have issues starting the MySQL container

* Install Docker for your environment: https://www.docker.com/
* Run `docker-compose up --build`
* Copy db.inc.example.php to db.inc.php
* Copy config.example.php to config.php
* Modify the constants with your own settings in both files
* Create an EVE developer application via https://developers.eveonline.com/applications
* EVE SSO `Callback URL` should be: `https://your-domain.com/index.php?mode=sso`
* Use the following scopes:
esi-location.read_location.v1
esi-location.read_ship_type.v1
esi-ui.open_window.v1
esi-ui.write_waypoint.v1
esi-characters.read_corporation_roles.v1
esi-location.read_online.v1
esi-characters.read_titles.v1
* Settings go in the `config.php` file
* Modify your web server to serve Tripwire from the `tripwire/public` folder so the files like `config.php` and `db.inc.php` are not accessible via URL
* Setup a CRON or schedule for `system_activity.cron.php` to run at the top of every hour. CRON: `0 * * * * php /dir/to/system_activity.cron.php`
* Setup a CRON or schedule for `account_update.cron.php` to run every 3 minutes or however often you want to check for corporation changes. CRON: `*/3 * * * * php /dir/to/account_update.cron.php`
* MySQL connection settings will be the server `mysql` with the user `root` with an empty password
* Create a new table for the EVE dump, specify the name in `db.inc.php` for `EVE_DUMP`
* Import using the dump downloaded from: https://www.fuzzwork.co.uk/dump/ To download the latest use the following link: https://www.fuzzwork.co.uk/dump/mysql-latest.tar.bz2
* Create a new table for the actual Tripwire data, use the name `tripwire`
* Create a `tripwire` database using the export located in `.docker/mysql/tripwire.sql`

### Contribution guidelines ###

* Base off of production
* Look over issues, branches or get with me to ensure it isn't already being worked on

### Who do I talk to? ###

* Josh Glassmaker AKA Daimian Mercer (Project lead / Creator)
* Tripwire Public in-game channel
* Discord: https://discord.gg/xjFkJAx
