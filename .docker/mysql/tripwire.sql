-- MySQL dump 10.13  Distrib 5.7.23, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: tripwire
-- ------------------------------------------------------
-- Server version	8.0.13

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `_history_login`
--

DROP TABLE IF EXISTS `_history_login`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `_history_login` (
  `ip` varchar(42) NOT NULL,
  `username` varchar(25) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `method` enum('user','api','cookie','sso') NOT NULL,
  `result` enum('success','fail') NOT NULL,
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ip`,`time`),
  KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `_history_signatures`
--

DROP TABLE IF EXISTS `_history_signatures`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `_history_signatures` (
  `historyID` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `id` int(11) unsigned NOT NULL,
  `signatureID` char(6) DEFAULT NULL,
  `systemID` int(8) unsigned DEFAULT NULL,
  `type` enum('unknown','combat','data','relic','ore','gas','wormhole') NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `bookmark` varchar(100) DEFAULT NULL,
  `lifeTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lifeLeft` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lifeLength` int(11) NOT NULL,
  `createdByID` int(11) NOT NULL,
  `createdByName` varchar(100) NOT NULL,
  `modifiedByID` int(11) NOT NULL,
  `modifiedByName` varchar(100) NOT NULL,
  `modifiedTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `maskID` decimal(12,1) unsigned NOT NULL,
  `status` enum('add','update','delete','undo:add','undo:update','undo:delete') NOT NULL,
  PRIMARY KEY (`historyID`),
  KEY `systemID` (`systemID`),
  KEY `id` (`id`),
  KEY `maskID` (`maskID`),
  KEY `status` (`status`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 PACK_KEYS=0 DELAY_KEY_WRITE=1 ROW_FORMAT=FIXED;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `_history_wormholes`
--

DROP TABLE IF EXISTS `_history_wormholes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `_history_wormholes` (
  `historyID` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `id` int(11) unsigned NOT NULL,
  `initialID` int(11) unsigned NOT NULL,
  `secondaryID` int(11) unsigned NOT NULL,
  `type` char(4) DEFAULT NULL,
  `parent` char(9) DEFAULT NULL,
  `life` enum('stable','critical') NOT NULL,
  `mass` enum('stable','destab','critical') NOT NULL,
  `maskID` decimal(12,1) NOT NULL,
  `status` enum('add','update','delete','undo:add','undo:update','undo:delete') NOT NULL,
  PRIMARY KEY (`historyID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 PACK_KEYS=0 DELAY_KEY_WRITE=1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `accounts`
--

DROP TABLE IF EXISTS `accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `accounts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(25) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `password` char(60) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `ban` tinyint(1) NOT NULL DEFAULT '0',
  `super` tinyint(1) NOT NULL DEFAULT '0',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `logins` int(11) unsigned NOT NULL DEFAULT '0',
  `lastLogin` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `ban` (`ban`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 ROW_FORMAT=FIXED;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `active`
--

DROP TABLE IF EXISTS `active`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `active` (
  `ip` char(42) NOT NULL,
  `instance` decimal(13,3) unsigned NOT NULL DEFAULT '0.000',
  `session` char(50) NOT NULL,
  `userID` mediumint(8) unsigned NOT NULL,
  `maskID` decimal(12,1) NOT NULL,
  `systemID` int(8) unsigned DEFAULT NULL,
  `systemName` char(50) DEFAULT NULL,
  `activity` char(25) DEFAULT NULL,
  `notify` char(150) DEFAULT NULL,
  `version` varchar(100) DEFAULT NULL,
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ip`,`instance`,`session`,`userID`),
  KEY `notify` (`notify`),
  KEY `activity` (`activity`),
  KEY `instance` (`instance`),
  KEY `maskID` (`maskID`),
  KEY `time` (`time`)
) ENGINE=MEMORY DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `characters`
--

DROP TABLE IF EXISTS `characters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `characters` (
  `userID` int(11) NOT NULL,
  `characterID` int(10) unsigned NOT NULL,
  `characterName` varchar(50) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `corporationID` int(10) unsigned NOT NULL,
  `corporationName` varchar(60) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `admin` tinyint(1) NOT NULL DEFAULT '0',
  `ban` tinyint(1) NOT NULL DEFAULT '0',
  `added` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`userID`),
  UNIQUE KEY `characterID` (`characterID`),
  KEY `ban` (`ban`),
  KEY `admin` (`admin`),
  KEY `corporationID` (`corporationID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 ROW_FORMAT=FIXED;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `systemID` int(8) unsigned NOT NULL,
  `comment` text NOT NULL,
  `created` datetime NOT NULL,
  `createdByID` int(10) unsigned NOT NULL,
  `createdByName` varchar(100) NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedByID` int(10) unsigned NOT NULL,
  `modifiedByName` varchar(100) NOT NULL,
  `maskID` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `maskID` (`maskID`),
  KEY `systemID, maskID` (`maskID`,`systemID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `esi`
--

DROP TABLE IF EXISTS `esi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `esi` (
  `userID` int(11) NOT NULL,
  `characterID` int(10) unsigned NOT NULL,
  `characterName` varchar(100) NOT NULL,
  `accessToken` varchar(100) NOT NULL,
  `refreshToken` varchar(100) NOT NULL,
  `tokenExpire` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`userID`,`characterID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trackingRemove` AFTER DELETE ON `esi` FOR EACH ROW DELETE FROM tracking WHERE characterID = OLD.characterID */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `flares`
--

DROP TABLE IF EXISTS `flares`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `flares` (
  `maskID` decimal(12,1) NOT NULL,
  `systemID` int(8) unsigned NOT NULL,
  `flare` enum('red','yellow','green') CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`maskID`,`systemID`),
  KEY `time` (`time`),
  KEY `maskID` (`maskID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `groups`
--

DROP TABLE IF EXISTS `groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `groups` (
  `maskID` decimal(12,1) NOT NULL,
  `joined` tinyint(1) NOT NULL DEFAULT '0',
  `eveID` int(10) unsigned NOT NULL,
  `eveType` smallint(5) unsigned NOT NULL,
  PRIMARY KEY (`maskID`,`eveType`,`eveID`),
  KEY `joined` (`joined`),
  KEY `eveType` (`eveType`),
  KEY `eveID` (`eveID`),
  KEY `maskID` (`maskID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `jumps`
--

DROP TABLE IF EXISTS `jumps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `jumps` (
  `wormholeID` int(10) unsigned NOT NULL,
  `characterID` int(10) unsigned NOT NULL,
  `characterName` varchar(50) NOT NULL,
  `fromID` int(8) unsigned NOT NULL,
  `fromName` varchar(20) DEFAULT NULL,
  `toID` int(8) unsigned NOT NULL,
  `toName` varchar(20) DEFAULT NULL,
  `shipTypeID` int(10) unsigned DEFAULT NULL,
  `shipType` varchar(50) DEFAULT NULL,
  `maskID` decimal(12,1) NOT NULL DEFAULT '0.0',
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY `shipTypeID` (`shipTypeID`),
  KEY `maskID` (`maskID`),
  KEY `wormholeID` (`wormholeID`),
  KEY `time` (`time`),
  KEY `massSearch` (`maskID`,`wormholeID`,`time`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 ROW_FORMAT=FIXED;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `masks`
--

DROP TABLE IF EXISTS `masks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `masks` (
  `maskID` decimal(12,1) unsigned NOT NULL,
  `name` varchar(100) NOT NULL,
  `ownerID` int(10) unsigned NOT NULL,
  `ownerType` smallint(5) unsigned NOT NULL,
  PRIMARY KEY (`maskID`),
  UNIQUE KEY `name` (`name`,`ownerID`,`ownerType`),
  KEY `ownerID` (`ownerID`),
  KEY `ownerType` (`ownerType`),
  KEY `maskSearch` (`maskID`,`ownerType`,`ownerID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `preferences`
--

DROP TABLE IF EXISTS `preferences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `preferences` (
  `userID` int(10) unsigned NOT NULL,
  `options` text,
  PRIMARY KEY (`userID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `signatures`
--

DROP TABLE IF EXISTS `signatures`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `signatures` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `signatureID` char(6) DEFAULT NULL,
  `systemID` int(8) unsigned DEFAULT NULL,
  `type` enum('unknown','combat','data','relic','ore','gas','wormhole') NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `bookmark` varchar(100) DEFAULT NULL,
  `lifeTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lifeLeft` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lifeLength` int(11) NOT NULL,
  `createdByID` int(11) unsigned NOT NULL,
  `createdByName` varchar(100) NOT NULL,
  `modifiedByID` int(11) unsigned NOT NULL,
  `modifiedByName` varchar(100) NOT NULL,
  `modifiedTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `maskID` decimal(12,1) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `systemID, maskID` (`systemID`,`maskID`),
  KEY `modifiedTime` (`modifiedTime`),
  KEY `maskID` (`maskID`),
  KEY `lifeLeft, lifeLength` (`lifeLeft`,`lifeLength`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `logSignatureInsert` AFTER INSERT ON `signatures` FOR EACH ROW IF @disable_trigger IS NULL THEN
    INSERT INTO _history_signatures (historyID, id, signatureID, systemID, type, name, bookmark, lifeTime, lifeLeft, lifeLength, createdByID, createdByName, modifiedByID, modifiedByName, modifiedTime, maskID, status)
		VALUES (null, NEW.id, NEW.signatureID, NEW.systemID, NEW.type, NEW.name, NEW.bookmark, NEW.lifeTime, NEW.lifeLeft, NEW.lifeLength, NEW.createdByID, NEW.createdByName, NEW.modifiedByID, NEW.modifiedByName, NEW.modifiedTime, NEW.maskID, 'add');
END IF */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `logSignatureUpdate` AFTER UPDATE ON `signatures` FOR EACH ROW IF @disable_trigger IS NULL THEN
    IF NEW.modifiedTime <> OLD.modifiedTime THEN
        INSERT INTO _history_signatures (historyID, id, signatureID, systemID, type, name, bookmark, lifeTime, lifeLeft, lifeLength, createdByID, createdByName, modifiedByID, modifiedByName, modifiedTime, maskID, status)
			VALUES (null, NEW.id, NEW.signatureID, NEW.systemID, NEW.type, NEW.name, NEW.bookmark, NEW.lifeTime, NEW.lifeLeft, NEW.lifeLength, NEW.createdByID, NEW.createdByName, NEW.modifiedByID, NEW.modifiedByName, NEW.modifiedTime, NEW.maskID, 'update');
    END IF;
END IF */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `logSignatureDelete` BEFORE DELETE ON `signatures` FOR EACH ROW IF @disable_trigger IS NULL THEN
    INSERT INTO _history_signatures (historyID, id, signatureID, systemID, type, name, bookmark, lifeTime, lifeLeft, lifeLength, createdByID, createdByName, modifiedByID, modifiedByName, modifiedTime, maskID, status)
        VALUES (null, OLD.id, OLD.signatureID, OLD.systemID, OLD.type, OLD.name, OLD.bookmark, OLD.lifeTime, OLD.lifeLeft, OLD.lifeLength, OLD.createdByID, OLD.createdByName, OLD.modifiedByID, OLD.modifiedByName, OLD.modifiedTime, OLD.maskID, 'delete');
END IF */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `statistics`
--

DROP TABLE IF EXISTS `statistics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `statistics` (
  `userID` int(11) unsigned NOT NULL,
  `characterID` int(10) unsigned NOT NULL,
  `maskID` decimal(12,1) unsigned NOT NULL,
  `signatures_added` int(10) unsigned NOT NULL DEFAULT '0',
  `signatures_updated` int(10) unsigned NOT NULL DEFAULT '0',
  `signatures_deleted` int(10) unsigned NOT NULL DEFAULT '0',
  `wormholes_added` int(10) unsigned NOT NULL DEFAULT '0',
  `wormholes_updated` int(10) unsigned NOT NULL DEFAULT '0',
  `wormholes_deleted` int(10) unsigned NOT NULL DEFAULT '0',
  `comments_added` int(10) unsigned NOT NULL DEFAULT '0',
  `comments_updated` int(10) unsigned NOT NULL DEFAULT '0',
  `comments_deleted` int(10) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`userID`,`characterID`,`maskID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `system_activity`
--

DROP TABLE IF EXISTS `system_activity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `system_activity` (
  `systemID` int(8) unsigned NOT NULL,
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `shipJumps` mediumint(6) unsigned NOT NULL DEFAULT '0',
  `shipKills` mediumint(6) unsigned NOT NULL DEFAULT '0',
  `podKills` mediumint(6) unsigned NOT NULL DEFAULT '0',
  `npcKills` mediumint(6) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`systemID`,`time`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 PACK_KEYS=0;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `system_visits`
--

DROP TABLE IF EXISTS `system_visits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `system_visits` (
  `userID` int(10) unsigned NOT NULL,
  `characterID` int(10) unsigned NOT NULL,
  `systemID` int(10) unsigned NOT NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`userID`,`characterID`,`systemID`,`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tokens`
--

DROP TABLE IF EXISTS `tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tokens` (
  `userID` int(11) unsigned NOT NULL,
  `token` varchar(400) NOT NULL,
  PRIMARY KEY (`userID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tracking`
--

DROP TABLE IF EXISTS `tracking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tracking` (
  `userID` int(11) NOT NULL,
  `characterID` int(10) unsigned NOT NULL,
  `characterName` varchar(100) NOT NULL,
  `systemID` int(8) unsigned NOT NULL,
  `systemName` varchar(100) NOT NULL,
  `stationID` int(10) unsigned DEFAULT NULL,
  `stationName` varchar(100) DEFAULT NULL,
  `shipID` bigint(12) unsigned DEFAULT NULL,
  `shipName` varchar(100) DEFAULT NULL,
  `shipTypeID` int(10) unsigned DEFAULT NULL,
  `shipTypeName` varchar(100) DEFAULT NULL,
  `maskID` decimal(12,1) NOT NULL,
  PRIMARY KEY (`maskID`,`characterID`),
  KEY `systemID` (`systemID`),
  KEY `occupantSearch` (`maskID`,`systemID`),
  KEY `characterID` (`characterID`),
  KEY `maskID` (`maskID`),
  KEY `userID` (`userID`)
) ENGINE=MEMORY DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `systemVisits` AFTER UPDATE ON `tracking` FOR EACH ROW BEGIN
	IF NEW.systemID <> OLD.systemID THEN
		INSERT INTO system_visits (userID, characterID, systemID, date) VALUES (NEW.userID, NEW.characterID, NEW.systemID, NOW());
	END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `jumpHistory` AFTER UPDATE ON `tracking` FOR EACH ROW BEGIN
	IF NEW.systemID <> OLD.systemID THEN
		SET @wormholeID = (SELECT w.id FROM wormholes w INNER JOIN signatures a ON initialID = a.id INNER JOIN signatures b ON secondaryID = b.id WHERE (a.systemID = NEW.systemID OR b.systemID = NEW.systemID) AND (a.systemID = OLD.systemID OR b.systemID = OLD.systemID));
        IF @wormholeID IS NOT NULL THEN
			INSERT INTO jumps (wormholeID, characterID, characterName, toID, toName, fromID, fromName, shipTypeID, shipType, maskID) VALUES (@wormholeID, NEW.characterID, NEW.characterName, NEW.systemID, NEW.systemName, OLD.systemID, OLD.systemName, NEW.shipTypeID, NEW.shipTypeName, NEW.maskID);
		END IF;
	END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `wormholes`
--

DROP TABLE IF EXISTS `wormholes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `wormholes` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `initialID` int(11) unsigned NOT NULL,
  `secondaryID` int(11) unsigned NOT NULL,
  `type` char(4) DEFAULT NULL,
  `parent` char(9) DEFAULT NULL,
  `life` enum('stable','critical') NOT NULL,
  `mass` enum('stable','destab','critical') NOT NULL,
  `maskID` decimal(12,1) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `maskID` (`maskID`),
  KEY `secondaryID` (`secondaryID`),
  KEY `initialID` (`initialID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `logWormholeInsert` AFTER INSERT ON `wormholes` FOR EACH ROW IF @disable_trigger IS NULL THEN
    INSERT INTO _history_wormholes (historyID, id, initialID, secondaryID, type, parent, life, mass, maskID, status)
		VALUES (null, NEW.id, NEW.initialID, NEW.secondaryID, NEW.type, NEW.parent, NEW.life, NEW.mass, NEW.maskID, 'add');
END IF */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `logWormholeUpdate` AFTER UPDATE ON `wormholes` FOR EACH ROW IF @disable_trigger IS NULL THEN
    INSERT INTO _history_wormholes (historyID, id, initialID, secondaryID, type, parent, life, mass, maskID, status)
		VALUES (null, NEW.id, NEW.initialID, NEW.secondaryID, NEW.type, NEW.parent, NEW.life, NEW.mass, NEW.maskID, 'update');
END IF */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `logWormholeDelete` BEFORE DELETE ON `wormholes` FOR EACH ROW IF @disable_trigger IS NULL THEN
    INSERT INTO _history_wormholes (historyID, id, initialID, secondaryID, type, parent, life, mass, maskID, status)
		VALUES (null, OLD.id, OLD.initialID, OLD.secondaryID, OLD.type, OLD.parent, OLD.life, OLD.mass, OLD.maskID, 'delete');
END IF */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Dumping events for database 'tripwire'
--
/*!50106 SET @save_time_zone= @@TIME_ZONE */ ;
/*!50106 DROP EVENT IF EXISTS `activeClean` */;
DELIMITER ;;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;;
/*!50003 SET character_set_client  = utf8mb4 */ ;;
/*!50003 SET character_set_results = utf8mb4 */ ;;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;;
/*!50003 SET @saved_time_zone      = @@time_zone */ ;;
/*!50003 SET time_zone             = '+00:00' */ ;;
/*!50106 CREATE*/ /*!50117 DEFINER=`root`@`localhost`*/ /*!50106 EVENT `activeClean` ON SCHEDULE EVERY 15 SECOND STARTS '2014-09-27 23:42:27' ON COMPLETION NOT PRESERVE ENABLE DO DELETE FROM active WHERE DATE_ADD(time, INTERVAL 15 SECOND) < NOW() */ ;;
/*!50003 SET time_zone             = @saved_time_zone */ ;;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;;
/*!50003 SET character_set_client  = @saved_cs_client */ ;;
/*!50003 SET character_set_results = @saved_cs_results */ ;;
/*!50003 SET collation_connection  = @saved_col_connection */ ;;
/*!50106 DROP EVENT IF EXISTS `flaresClean` */;;
DELIMITER ;;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;;
/*!50003 SET character_set_client  = utf8mb4 */ ;;
/*!50003 SET character_set_results = utf8mb4 */ ;;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;;
/*!50003 SET @saved_time_zone      = @@time_zone */ ;;
/*!50003 SET time_zone             = '+00:00' */ ;;
/*!50106 CREATE*/ /*!50117 DEFINER=`root`@`localhost`*/ /*!50106 EVENT `flaresClean` ON SCHEDULE EVERY 1 HOUR STARTS '2014-08-21 03:15:55' ON COMPLETION NOT PRESERVE ENABLE DO DELETE FROM flares WHERE DATE_ADD(time, INTERVAL 24 HOUR) < NOW() */ ;;
/*!50003 SET time_zone             = @saved_time_zone */ ;;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;;
/*!50003 SET character_set_client  = @saved_cs_client */ ;;
/*!50003 SET character_set_results = @saved_cs_results */ ;;
/*!50003 SET collation_connection  = @saved_col_connection */ ;;
/*!50106 DROP EVENT IF EXISTS `jumpsClean` */;;
DELIMITER ;;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;;
/*!50003 SET character_set_client  = utf8mb4 */ ;;
/*!50003 SET character_set_results = utf8mb4 */ ;;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;;
/*!50003 SET @saved_time_zone      = @@time_zone */ ;;
/*!50003 SET time_zone             = 'SYSTEM' */ ;;
/*!50106 CREATE*/ /*!50117 DEFINER=`root`@`localhost`*/ /*!50106 EVENT `jumpsClean` ON SCHEDULE EVERY 1 HOUR STARTS '2017-01-27 04:24:28' ON COMPLETION NOT PRESERVE ENABLE DO DELETE FROM `jumps` WHERE wormholeID NOT IN (SELECT id FROM wormholes WHERE type <> 'GATE') */ ;;
/*!50003 SET time_zone             = @saved_time_zone */ ;;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;;
/*!50003 SET character_set_client  = @saved_cs_client */ ;;
/*!50003 SET character_set_results = @saved_cs_results */ ;;
/*!50003 SET collation_connection  = @saved_col_connection */ ;;
/*!50106 DROP EVENT IF EXISTS `signatureClean` */;;
DELIMITER ;;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;;
/*!50003 SET character_set_client  = utf8mb4 */ ;;
/*!50003 SET character_set_results = utf8mb4 */ ;;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;;
/*!50003 SET @saved_time_zone      = @@time_zone */ ;;
/*!50003 SET time_zone             = 'SYSTEM' */ ;;
/*!50106 CREATE*/ /*!50117 DEFINER=`root`@`localhost`*/ /*!50106 EVENT `signatureClean` ON SCHEDULE EVERY 1 MINUTE STARTS '2018-05-11 15:57:18' ON COMPLETION NOT PRESERVE ENABLE DO BEGIN

UPDATE signatures SET modifiedByID = 0, modifiedByName = "Tripwire" WHERE lifeLeft < NOW() AND lifeLength <> '0' AND type <> 'wormhole';

DELETE FROM signatures WHERE lifeLeft < NOW() AND lifeLength <> '0' AND type <> 'wormhole';

END */ ;;
/*!50003 SET time_zone             = @saved_time_zone */ ;;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;;
/*!50003 SET character_set_client  = @saved_cs_client */ ;;
/*!50003 SET character_set_results = @saved_cs_results */ ;;
/*!50003 SET collation_connection  = @saved_col_connection */ ;;
/*!50106 DROP EVENT IF EXISTS `trackingClean` */;;
DELIMITER ;;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;;
/*!50003 SET character_set_client  = utf8mb4 */ ;;
/*!50003 SET character_set_results = utf8mb4 */ ;;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;;
/*!50003 SET @saved_time_zone      = @@time_zone */ ;;
/*!50003 SET time_zone             = '+00:00' */ ;;
/*!50106 CREATE*/ /*!50117 DEFINER=`root`@`localhost`*/ /*!50106 EVENT `trackingClean` ON SCHEDULE EVERY 15 SECOND STARTS '2017-01-30 17:34:38' ON COMPLETION NOT PRESERVE ENABLE DO DELETE FROM tracking WHERE userID NOT IN (SELECT userID FROM active) */ ;;
/*!50003 SET time_zone             = @saved_time_zone */ ;;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;;
/*!50003 SET character_set_client  = @saved_cs_client */ ;;
/*!50003 SET character_set_results = @saved_cs_results */ ;;
/*!50003 SET collation_connection  = @saved_col_connection */ ;;
/*!50106 DROP EVENT IF EXISTS `wormholeClean` */;;
DELIMITER ;;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;;
/*!50003 SET character_set_client  = utf8mb4 */ ;;
/*!50003 SET character_set_results = utf8mb4 */ ;;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;;
/*!50003 SET @saved_time_zone      = @@time_zone */ ;;
/*!50003 SET time_zone             = 'SYSTEM' */ ;;
/*!50106 CREATE*/ /*!50117 DEFINER=`root`@`localhost`*/ /*!50106 EVENT `wormholeClean` ON SCHEDULE EVERY 1 MINUTE STARTS '2018-05-12 02:24:17' ON COMPLETION NOT PRESERVE ENABLE DO BEGIN

DELETE FROM wormholes WHERE initialID IN (SELECT id FROM signatures WHERE lifeLeft < NOW() AND lifeLength <> 0 AND type = 'wormhole');

UPDATE signatures SET modifiedByID = 0, modifiedByName = "Tripwire" WHERE lifeLeft < NOW() AND lifeLength <> 0 AND type = 'wormhole';

DELETE FROM signatures WHERE lifeLeft < NOW() AND lifeLength <> 0 AND type = 'wormhole';

END */ ;;
/*!50003 SET time_zone             = @saved_time_zone */ ;;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;;
/*!50003 SET character_set_client  = @saved_cs_client */ ;;
/*!50003 SET character_set_results = @saved_cs_results */ ;;
/*!50003 SET collation_connection  = @saved_col_connection */ ;;
/*!50106 DROP EVENT IF EXISTS `wormholeCritical` */;;
DELIMITER ;;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;;
/*!50003 SET character_set_client  = utf8mb4 */ ;;
/*!50003 SET character_set_results = utf8mb4 */ ;;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;;
/*!50003 SET @saved_time_zone      = @@time_zone */ ;;
/*!50003 SET time_zone             = 'SYSTEM' */ ;;
/*!50106 CREATE*/ /*!50117 DEFINER=`root`@`localhost`*/ /*!50106 EVENT `wormholeCritical` ON SCHEDULE EVERY 1 MINUTE STARTS '2014-08-21 03:16:46' ON COMPLETION NOT PRESERVE ENABLE DO BEGIN

UPDATE signatures s INNER JOIN wormholes w ON (s.id = initialID OR s.id = secondaryID) AND life = 'stable' SET modifiedByID = 0, modifiedByName = 'Tripwire', modifiedTime = NOW() WHERE s.type = 'wormhole' AND lifeLength <> '0' AND DATE_SUB(lifeLeft, INTERVAL 4 HOUR) < NOW();

UPDATE wormholes w INNER JOIN signatures s ON (s.id = initialID OR s.id = secondaryID) AND (s.type = 'wormhole' AND life = 'stable' AND lifeLength <> '0' AND DATE_SUB(lifeLeft, INTERVAL 4 HOUR) < NOW()) SET life = 'critical';

END */ ;;
/*!50003 SET time_zone             = @saved_time_zone */ ;;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;;
/*!50003 SET character_set_client  = @saved_cs_client */ ;;
/*!50003 SET character_set_results = @saved_cs_results */ ;;
/*!50003 SET collation_connection  = @saved_col_connection */ ;;
DELIMITER ;
/*!50106 SET TIME_ZONE= @save_time_zone */ ;

--
-- Dumping routines for database 'tripwire'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-01-05 15:50:12
