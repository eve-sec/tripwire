<?php

$startTime = microtime(true);

// Caching
// header('Cache-Control: public, max-age=300');
// header('Expires: '.gmdate('r', time() + 300));
// header('Pragma: cache');
// header('Content-Type: text/html; charset=UTF-8');

// setcookie('loadedFromBrowserCache','false');

require_once('config.php');
require_once('settings.php');
require_once('db.inc.php');
require('lib.inc.php');

// Track this system view
$query = 'UPDATE userStats SET systemsViewed = systemsViewed + 1 WHERE userID = :userID';
$stmt = $mysql->prepare($query);
$stmt->bindValue(':userID', $_SESSION['userID']);
$stmt->execute();

// Verify correct system otherwise goto default...
$query = 'SELECT solarSystemName, systems.solarSystemID, regionName, regions.regionID FROM '. EVE_DUMP .'.mapSolarSystems systems LEFT JOIN '. EVE_DUMP .'.mapRegions regions ON regions.regionID = systems.regionID WHERE solarSystemName = :system';
$stmt = $mysql->prepare($query);
$stmt->bindValue(':system', $_REQUEST['system']);
$stmt->execute();
if ($row = $stmt->fetchObject()) {
	$system = $row->solarSystemName;
	$systemID = $row->solarSystemID;
	$region = $row->regionName;
	$regionID = $row->regionID;
} else {
	$system = 'Jita';
	$systemID = '30000142';
	$region = 'The Forge';
	$regionID = 10000002;
}

?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
	<meta name="system" content="<?= $system ?>">
	<meta name="systemID" content="<?= $systemID ?>">
	<meta name="server" content="<?= CDN_DOMAIN ?>">
	<meta name="app_name" content="<?= APP_NAME ?>">
	<meta name="version" content="<?= VERSION ?>">
	<link rel="shortcut icon" href="//<?= CDN_DOMAIN ?>/images/favicon.png" />

	<link rel="stylesheet" type="text/css" href="//<?= CDN_DOMAIN ?>/css/jquery.duration-picker.css">
	<link rel="stylesheet" type="text/css" href="//<?= CDN_DOMAIN ?>/css/jquery.jbox.css">
	<link rel="stylesheet" type="text/css" href="//<?= CDN_DOMAIN ?>/css/jquery.jbox-notice.css">
	<link rel="stylesheet" type="text/css" href="//<?= CDN_DOMAIN ?>/css/gridster.min.css">
	<link rel="stylesheet" type="text/css" href="//<?= CDN_DOMAIN ?>/css/jquery-ui-1.12.1.min.css">
	<link rel="stylesheet" type="text/css" href="//<?= CDN_DOMAIN ?>/css/jquery-ui-custom.css">
	<link rel="stylesheet" type="text/css" href="//<?= CDN_DOMAIN ?>/css/introjs.min.css">
	<link rel="stylesheet" type="text/css" href="//<?= CDN_DOMAIN ?>/css/app.min.css?v=<?= VERSION ?>">

	<title></title>
</head>
<?php flush(); ?>
<body class="transition">
	<div id="wrapper">
	<div id="inner-wrapper">
	<div id="topbar">
		<span class="align-left">
			<h1 id="logo">
				<a href="."><?= APP_NAME ?></a>
				<span id="version"><?= VERSION ?></span>
				<span>|</span>
				<!-- <span data-tooltip="System activity update countdown"><input id="APIclock" class="hidden" /></span> -->
			</h1>
			<h3 id="serverStatus" class="pointer" data-tooltip="EVE server status and player count"></h3>
			<h3 id="systemSearch">| <i id="search" data-icon="search" data-tooltip="Toggle system search"></i>
				<span id="currentSpan" class="hidden"><span class="pointer">Current System: </span><a id="EVEsystem" href=""></a><i id="follow" data-icon="follow" data-tooltip="Follow my in-game system" style="padding-left: 10px;"></i></span>
				<span id="searchSpan"><form id="systemSearch" method="GET" action=".?"><input type="text" size="18" class="systemsAutocomplete" name="system" /></form></span>
				<span id="APItimer" class="hidden"></span>
			</h3>
		</span>
		<span class="align-right">
			<span id="login">
				<h3><a id="user" href=""><?= $_SESSION['characterName'] ?></a></h3>
				<div id="panel">
					<div id="content">
						<div id="triangle"></div>

						<table id="logoutTable">
							<tr>
								<td>
									<table id="track">
										<tr><th colspan="2">Tracking</th></tr>
										<tr>
											<td id="tracking">
												<table id="tracking-clone" class="hidden">
													<tr>
														<td rowspan="5" class="avatar"><img src="" />
															<i data-icon="red-giant" class="online critical" data-tooltip="Online status"></i>
															<i data-icon="alert" class="alert hidden" data-tooltip="Re-add character to fix missing permissions"></i>
														</td>
														<td class="name text">&nbsp;</td>
													</tr>
													<tr>
														<td class="system text">&nbsp;</td>
													</tr>
													<tr>
														<td class="station text" data-tooltip="">&nbsp;</td>
													</tr>
													<tr>
														<td class="ship text">&nbsp;</td>
													</tr>
													<tr>
														<td class="shipname text">&nbsp;</td>
													</tr>
												</table>
											</td>
										</tr>
									</table>
								</td>
								<td>
									<table id="account">
										<tr><th colspan="2">Characters</th></tr>
										<tr>
											<td id="avatar" rowspan="4"><img src="https://image.eveonline.com/Character/<?= $_SESSION['characterID'] ?>_64.jpg" /></td>
											<td id="characterName" class="text"><?= $_SESSION['characterName'] ?></td>
										</tr>
										<tr>
											<td class="text"><?= $_SESSION['corporationName'] ?></td>
										</tr>
										<tr><td rowspan="2"></td></tr>
									</table>
								</td>
							</tr>
							<tr>
								<td>
									<input type="button" value="Add" OnClick="javascript: window.location.href = 'login.php?mode=sso&login=esi'" />
									<input type="button" value="Remove" id="removeESI" disabled="disabled" />
								</td>
								<td colspan="1"><input id="logout" type="button" value="Logout" /></td>
							</tr>
						</table>
					</div>
				</div>
			</span>

			<h3> | </h3>

			<i id="settings" style="font-size: 1.7em;" data-icon="settings" class="options" data-tooltip="Settings"></i>
			<i id="admin" style="font-size: 1.7em;" data-icon="user" data-tooltip="Mask Admin" class="<?= checkAdmin($_SESSION['mask']) || checkOwner($_SESSION['mask']) ? '' : 'disabled' ?>"></i>
			<i id="layout" style="font-size: 1.7em;" data-icon="layout" data-tooltip="Customize layout"></i>
		</span>
	</div>

	<div class="gridster">
		<ul>
			<li id="infoWidget" class="gridWidget" data-row="1" data-col="1" data-sizex="7" data-sizey="6" data-min-sizex="5" data-min-sizey="4" style="width: 410px; height: 350px;">
				<div class="controls">
					<div style="float: right;">
						<i id="system-favorite" data-icon="star-empty" data-tooltip="Add/Remove favorite"></i>
						<i class="tutorial" data-tooltip="Show tutorial for this section">?</i>
					</div>
				</div>
				<div class="content">
					<div id="infoGeneral">
						<h1 id="infoSystem" class="pointer" style="color: #CCC;"><?=$system?></h1>
						<h4 id="infoSecurity" class="pointer">&nbsp;</h4>
						<h4 id="infoRegion" class="pointer">&nbsp;</h4>
						<h4 id="infoFaction" class="pointer">&nbsp;</h4>
					</div>
					<div id="activityGraph"></div>
					<div id="activityGraphControls" style="text-align: center;"><a href="javascript: activity.time(168);">Week</a> - <a href="javascript: activity.time(48);">48Hour</a> - <a href="javascript: activity.time(24);">24Hour</a></div>
					<div id="infoStatics" class="pointer" style="float: left; width: 50%; text-align: left;"></div>
					<div id="infoLinks" style="float: right; width: 50%; text-align: right;">
						<!-- <a class="infoLink" data-href='http://wh.pasta.gg/$systemName' href="" target="_blank">wormhol.es</a><br/> -->
						<a class="infoLink" data-href="http://anoik.is/systems/$systemName" href="" target="_blank">Anoik.is</a><br/>
						<a class="infoLink" data-href="http://evemaps.dotlan.net/search?q=$systemName" href="" target="_blank">dotlan</a><br/>
						<!--<a class="infoLink" style="float: right;" data-href='http://eve-kill.net/?a=system_detail&sys_name=$systemName' href="" target="_blank">Eve-kill.net&nbsp;&nbsp;</a>-->
						<a class="infoLink" data-href='https://zkillboard.com/system/$systemID' href="" target="_blank">zKillboard</a>
					</div>
				</div>
			</li>
			<li id="signaturesWidget" class="gridWidget" data-row="1" data-col="8" data-sizex="7" data-sizey="6" data-min-sizex="5" data-min-sizey="2" style="width: 410px; height: 350px;">
				<div class="controls">
					<i id="add-signature" data-icon="plus" data-tooltip="Add a new signature"></i>
					<i id="edit-signature" data-icon="edit" data-tooltip="Edit selected signature" class="disabled"></i>
					<i id="delete-signature" data-icon="trash" data-tooltip="Delete selected signature(s)" class="disabled"></i>
					<span>|</span>
					<i id="signature-count" style="font-style: normal; cursor: default;" data-tooltip="Total signature count">0</i>
					<i id="undo" data-icon="undo" class="disabled" data-tooltip="Undo last signature change"></i>
					<i id="redo" data-icon="redo" class="disabled" data-tooltip="Redo what was undone"></i>
					<div style="float: right;">
						<i id="toggle-automapper" class="disabled" data-icon="auto" data-tooltip="Toggle Auto-Mapper"></i>
						<i class="tutorial" data-tooltip="Show tutorial for this section">?</i>
					</div>
				</div>
				<div class="content">
					<table id="sigTable" width="100%">
						<thead>
							<tr>
								<th class="sortable">ID<i data-icon=""></i></th>
								<th class="sortable">Type<i data-icon=""></i></th>
								<th class="sortable" data-sorter="usLongDate">Age<i data-icon=""></i></th>
								<th class="sortable">Leads To<i data-icon=""></i></th>
								<th class="sortable">Life<i data-icon=""></i></th>
								<th class="sortable">Mass<i data-icon=""></i></th>
							</tr>
						</thead>
						<tbody></tbody>
					</table>
				</div>
			</li>
			<li id="notesWidget" class="gridWidget" data-row="1" data-col="15" data-sizex="7" data-sizey="6" data-min-sizex="5" data-min-sizey="2" style="width: 410px; height: 350px;">
				<div class="controls">
					<i id="add-comment" data-icon="plus" data-tooltip="Add a new comment"></i>
					<div style="float: right;">
						<i class="tutorial" data-tooltip="Show tutorial for this section">?</i>
					</div>
				</div>
				<div class="content">
					<div class="comment hidden">
						<div class="commentToolbar">
							<div class="commentTitle">
								<span class="commentModified"></span>
								<span class="commentCreated"></span>
								<i class="commentSticky" data-icon="pin" data-tooltip="Sticky"></i>
							</div>
							<div class="commentControls">
								<a class="commentEdit" href="">Edit</a>
								<a class="commentDelete" href="">Delete</a>
							</div>
							<div style="clear: both;"></div>
						</div>
						<div id="" class="commentBody"></div>
						<div class="commentFooter hidden">
							<div class="commentStatus"></div>
							<div class="commentControls">
								<a href="" class="commentSave">Save</a>
								<a href="" class="commentCancel">Cancel</a>
							</div>
							<div style="clear: both;"></div>
						</div>
					</div>
				</div>
			</li>
			<li id="chainWidget" class="gridWidget" data-row="7" data-col="1" data-sizex="21" data-sizey="8" data-min-sizex="5" data-min-sizey="4" style="width: 1250px; height: 470px;">
				<div class="controls">
					<span id="chainTabs"></span>
					<i id="newTab" data-icon="plus" data-tooltip="New tab"></i>
					<span>|</span>
					<i id="show-viewing" data-icon="eye" data-tooltip="Add viewing system to chain"></i>
					<i id="show-favorite" data-icon="star" data-tooltip="Add favorite systems to chain"></i>
					<i id="show-chainLegend" data-icon="tree" data-tooltip="<table id='guide'><tr><td><div class='guide-stable'></td><td>Stable</td></tr><tr><td><div class='guide-eol'></div></td><td>End of Life</td></tr><tr><td><div class='guide-destab'></div></td><td>Mass Destabbed</td></tr><tr><td><div class='guide-critical'></div></td><td>Mass Critical</td></tr><tr><td><div class='guide-frigate'></div></td><td>Frigate</td></tr></table>"></i>
					<div style="float: right;">
						<button id="chain-zoom-reset" class="hidden">Reset Zoom</button>
						<!-- <i class="tutorial" data-tooltip="Show tutorial for this section">?</i> -->
					</div>
				</div>
				<div id="chainParent" class="content dragscroll">
					<ul id="chainMenu" class="hidden">
						<!-- <li data-command="showInfo"><a>Show Info</a> -->
						<li><a>Navigation</a>
							<ul style="width: 10em;">
								<li data-command="setDest"><a>Set Destination</a></li>
								<li data-command="addWay"><a>Add Waypoint</a></li>
							</ul>
						</li>
						<li>
							<li><a>Flares</a>
								<ul style="width: 10em;">
									<li data-command="red"><a>Battle (red)</a></li>
									<li data-command="yellow"><a>Hold (yellow)</a></li>
									<li data-command="green"><a>Fleet Op (green)</a></li>
								</ul>
							</li>
							<li data-command="mass"><a>Mass</a></li>
							<li data-command="collapse"><a>Collapse</a></li>
						</li>
					</ul>
					<span style="position: relative; display: table; width: 100%;">
						<table id="chainGrid">
							<tr class="top"><td></td></tr>
							<tr class="space hidden"><td></td></tr>
							<tr class="line hidden"><td></td></tr>
							<tr class="space hidden"><td>1</td></tr>
							<tr class="line hidden"><td></td></tr>
							<tr class="space hidden"><td>2</td></tr>
							<tr class="line hidden"><td></td></tr>
							<tr class="space hidden"><td>3</td></tr>
							<tr class="line hidden"><td></td></tr>
							<tr class="space hidden"><td>4</td></tr>
							<tr class="line hidden"><td></td></tr>
							<tr class="space hidden"><td>5</td></tr>
							<tr class="line hidden"><td></td></tr>
							<tr class="space hidden"><td>6</td></tr>
							<tr class="line hidden"><td></td></tr>
							<tr class="space hidden"><td>7</td></tr>
							<tr class="line hidden"><td></td></tr>
							<tr class="space hidden"><td>8</td></tr>
							<tr class="line hidden"><td></td></tr>
							<tr class="space hidden"><td>9</td></tr>
							<tr class="line hidden"><td></td></tr>
							<tr class="space hidden"><td>10</td></tr>
							<tr class="line hidden"><td></td></tr>
							<tr class="space hidden"><td>11</td></tr>
							<tr class="line hidden"><td></td></tr>
							<tr class="space hidden"><td>12</td></tr>
							<tr class="line hidden"><td></td></tr>
							<tr class="space hidden"><td>13</td></tr>
							<tr class="line hidden"><td></td></tr>
							<tr class="space hidden"><td>14</td></tr>
							<tr class="line hidden"><td></td></tr>
							<tr class="space hidden"><td>15</td></tr>
							<tr class="line hidden"><td></td></tr>
							<tr class="space hidden"><td>16</td></tr>
							<tr class="line hidden"><td></td></tr>
							<tr class="space hidden"><td>17</td></tr>
							<tr class="line hidden"><td></td></tr>
							<tr class="space hidden"><td>18</td></tr>
							<tr class="line hidden"><td></td></tr>
							<tr class="space hidden"><td>19</td></tr>
							<tr class="line hidden"><td></td></tr>
							<tr class="space hidden"><td>20</td></tr>
							<tr class="line hidden"><td></td></tr>
							<tr class="space hidden"><td>21</td></tr>
							<tr class="line hidden"><td></td></tr>
							<tr class="space hidden"><td>22</td></tr>
						</table>
						<span id="chainMap"></span>
					</span>
				</div>
			</li>
		</ul>
	</div>

	<div id="footer">
		<form id="donate_form" action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
			<input type="hidden" name="cmd" value="_s-xclick">
			<input type="hidden" name="encrypted" value="-----BEGIN PKCS7-----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-----END PKCS7-----">
			<img id="donate" src="//<?= CDN_DOMAIN ?>/images/landing/donate.jpg" onclick="document.getElementById('donate_form').submit();" alt="PayPal - The safer, easier way to pay online!">
			<a href="https://www.patreon.com/bePatron?u=3551109" data-patreon-widget-type="become-patron-button">Become a Patron!</a><script async src="https://c6.patreon.com/becomePatronButton.bundle.js"></script>
		</form>
		<?php printf("<span id='pageTime'>Page generated in %.3f seconds.</span>", microtime(true) - $startTime); ?>
		<p>All Eve Related Materials are Property Of <a href="http://www.ccpgames.com" target="_blank">CCP Games</a></p>
		<p id="legal" class="pointer">EVE Online and the EVE logo are the registered trademarks of CCP hf. All rights are reserved worldwide. All other trademarks are the property of their respective owners. EVE Online, the EVE logo, EVE and all associated logos and designs are the intellectual property of CCP hf. All artwork, screenshots, characters, vehicles, storylines, world facts or other recognizable features of the intellectual property relating to these trademarks are likewise the intellectual property of CCP hf. CCP is in no way responsible for the content on or functioning of this website, nor can it be liable for any damage arising from the use of this website.</p>
	</div>
	</div>
	</div>

	<div id="dialog-deleteComment" title="Delete Comment" class="hidden">
		<i data-icon="alert"></i> This comment will be removed. Are you sure?
	</div>

	<div id="dialog-deleteSig" title="Delete Signature(s)" class="hidden">
		<i data-icon="alert"></i> This signature will be removed from this system. Are you sure?
	</div>

	<div id="dialog-signature" title="Add Signature" class="hidden">
		<form id="form-signature" autocomplete="off">
			<input autocomplete="false" name="hidden" type="text" class="hidden" />
			<div class="row">
				<span class="label">ID:</span>
				<input name="signatureID_Alpha" type="text" maxlength="3" size="2" class="signatureID" autocomplete="off" />
				<span class="label">-</span>
				<input name="signatureID_Numeric" type="text" maxlength="3" size="2" placeholder="###" class="signatureID" autocomplete="off" />
				<span id="signatureType" class="select">
					<select name="signatureType">
						<option value="unknown">Unknown</option>
						<option value="combat">Combat</option>
						<option value="wormhole">Wormhole</option>
						<option value="ore">Ore</option>
						<option value="data">Data</option>
						<option value="gas">Gas</option>
						<option value="relic">Relic</option>
					</select>
				</span>
			</div>
			<div class="row">
				<span class="label">Length:</span>
				<input type="text" value="" name="signatureLength" id="durationPicker" />
			</div>
			<div id="site">
				<div id="signatureName" class="row">
					<span class="label">Name:</span>
					<span><input name="signatureName" type="text" maxlength="100" autocomplete="off" /></span>
				</div>
			</div>
			<div id="wormhole" class="hidden">
				<div class="side">
					<div class="sideLabel"></div>
					<div class="row">
						<span class="label">Type:</span>
						<input name="wormholeType" type="text" class="wormholeType" data-autocomplete="sigType" maxlength="4" size="4" autocomplete="off" />
						<!-- <span class="bookmark">
							<span class="label">BM:</span>
							<input name="" type="text" maxlength="10" size="8" />
						</span> -->
					</div>
					<div class="row">
						<span class="label">Leads:</span>
						<span data-autocomplete="sigSystems">
							<input name="leadsTo" type="text" maxlength="20" size="20" class="leadsTo" autocomplete="off" />
							<select>
								<option value="Null-Sec">Null-Sec</option>
								<option value="Low-Sec">Low-Sec</option>
								<option value="High-Sec">High-Sec</option>
								<option value="Class-#">Class-#</option>
								<!-- <option value="Class-1">Class-1</option>
								<option value="Class-2">Class-2</option>
								<option value="Class-2">Class-2</option>
								<option value="Class-3">Class-3</option>
								<option value="Class-4">Class-4</option>
								<option value="Class-5">Class-5</option>
								<option value="Class-6">Class-6</option> -->
							</select>
						</span>
					</div>
					<div class="row">
						<span class="label">Name:</span>
						<input name="wormholeName" type="text" maxlength="100" size="20" autocomplete="off" />
					</div>
					<div class="row">
						<span class="label">Life:</span>
						<span class="select">
							<select name="wormholeLife">
								<option value="stable">Stable</option>
								<option value="critical">Critical</option>
							</select>
						</span>
						<span id="wormholeMass">
							<span class="label">Mass:</span>
							<span class="select">
								<select name="wormholeMass">
									<option value="stable">Stable</option>
									<option value="destab">Destab</option>
									<option value="critical">Critical</option>
								</select>
							</span>
						</span>
					</div>
				</div>
				<hr/>
				<div class="side">
					<div class="sideLabel"></div>
					<div class="row">
						<span class="label">ID:</span>
						<input name="signatureID2_Alpha" type="text" maxlength="3" size="2" class="signatureID" autocomplete="off" />
						<span class="label">-</span>
						<input name="signatureID2_Numeric" type="text" maxlength="3" size="2" placeholder="###" class="signatureID" autocomplete="off" />
					</div>
					<div class="row">
						<span class="label">Type:</span>
						<input name="wormholeType2" type="text" class="wormholeType" data-autocomplete="sigType" maxlength="4" size="4" autocomplete="off" />
						<!-- <span class="bookmark">
							<span class="label">BM:</span>
							<input name="" type="text" maxlength="10" size="8" />
						</span> -->
					</div>
					<div class="row">
						<span class="label">Name:</span>
						<input name="wormholeName2" type="text" maxlength="100" size="20" autocomplete="off" />
					</div>
				</div>
			</div>
			<input type="submit" style="position: absolute; left: -99999px;" tabindex="-1" />
		</form>
	</div>

	<div id="dialog-admin" title="Mask Admin" class="hidden">
		<div style="height: 100%;">
			<div class="menu">
				<!-- menu -->
				<ul>
					<li data-window="default" class="active"><a href="#">Home</a></li>
					<li data-window="active-users" data-refresh="3000"><a href="#">Active Users</a></li>
					<li data-window="user-stats"><a href="#">User Stats</a></li>
					<li data-window="access-list"><a href="#">Access List</a></li>
				</ul>
			</div>
			<div class="window">
				<!-- window -->
				<div data-window="default">
					<h1>Welcome to the new Mask Admin feature!</h1>
					<br/>
					<p>This has been a long overdue feature, but thanks to the continued requests over the months I was finally able to make enough progress to have a first release.</p>
					<br/>
					<p>There may be a few minor bugs with the interface yet, I spent most of the time making sure the back-end security was solid so nobody saw users they shouldn't be. Also I was the only one testing this feature for opsec sake</p>
					<br/>
					<p>Please feel free to suggest additions, I plan to add many more menu items over the next few weeks but telling me what you all want will help me prioritize and make sure I don't overlook something useful</p>
					<br/>
					<ul>
						<li>Mask creators/owners get access to mask admin</li>
						<li>Custom corp masks the creating corp admins get access</li>
						<li>Works for the default private and corporate masks</li>
					</ul>
					<br/>
					<p>Thanks for using Tripwire, enjoy! :)</p>
				</div>
				<div data-window="active-users" class="hidden">
					<table data-sortable="true" width="100%" cellpadding="0" cellspacing="0">
						<thead>
							<tr>
								<th class="sortable">Account<i data-icon=""></i></th>
								<th class="sortable">Character<i data-icon=""></i></th>
								<th class="sortable">System<i data-icon=""></i></th>
								<th class="sortable">Ship Name<i data-icon=""></i></th>
								<th class="sortable">Ship Type<i data-icon=""></i></th>
								<th class="sortable">Station<i data-icon=""></i></th>
							</tr>
						</thead>
						<tbody>
							<tr class="hidden">
								<td data-col="accountCharacterName"></td>
								<td data-col="characterName"></td>
								<td data-col="systemName"></td>
								<td data-col="shipName"></td>
								<td data-col="shipTypeName"></td>
								<td data-col="stationName"></td>
							</tr>
						</tbody>
					</table>
				</div>
				<div data-window="user-stats" class="hidden">
					<table data-sortable="true" width="100%" cellpadding="0" cellspacing="0">
						<thead>
							<tr>
								<th colspan="2"></th>
								<th colspan="3">Signatures</th>
								<th colspan="3">Wormholes</th>
								<th colspan="3">Comments</th>
								<th colspan="3"></th>
							</tr>
							<tr>
								<th class="sortable">Character<i data-icon=""></i></th>
								<th class="sortable">Corporation<i data-icon=""></i></th>
								<th class="sortable">Added<i data-icon=""></i></th>
								<th class="sortable">Updated<i data-icon=""></i></th>
								<th class="sortable">Deleted<i data-icon=""></i></th>
								<th class="sortable">Added<i data-icon=""></i></th>
								<th class="sortable">Updated<i data-icon=""></i></th>
								<th class="sortable">Deleted<i data-icon=""></i></th>
								<th class="sortable">Added<i data-icon=""></i></th>
								<th class="sortable">Updated<i data-icon=""></i></th>
								<th class="sortable">Deleted<i data-icon=""></i></th>
								<th class="sortable"># of Logins<i data-icon=""></i></th>
								<th class="sortable">Last Login<i data-icon=""></i></th>
							</tr>
						</thead>
						<tbody>
							<tr class="hidden">
								<td data-col="characterName"></td>
								<td data-col="corporationName"></td>
								<td data-col="signatures_added" data-format="number" class="text-center"></td>
								<td data-col="signatures_updated" data-format="number" class="text-center"></td>
								<td data-col="signatures_deleted" data-format="number" class="text-center"></td>
								<td data-col="wormholes_added" data-format="number" class="text-center"></td>
								<td data-col="wormholes_updated" data-format="number" class="text-center"></td>
								<td data-col="wormholes_deleted" data-format="number" class="text-center"></td>
								<td data-col="comments_added" data-format="number" class="text-center"></td>
								<td data-col="comments_updated" data-format="number" class="text-center"></td>
								<td data-col="comments_deleted" data-format="number" class="text-center"></td>
								<td data-col="logins" data-format="number" class="text-center"></td>
								<td data-col="lastLogin" class="text-center"></td>
							</tr>
						</tbody>
					</table>
				</div>
				<div data-window="access-list" class="hidden">
					<table data-sortable="true" width="100%" cellpadding="0" cellspacing="0">
						<thead>
							<tr>
								<th class="sortable">Character<i data-icon=""></i></th>
								<th class="sortable">Corporation<i data-icon=""></i></th>
								<th class="sortable">Date added<i data-icon=""></i></th>
							</tr>
						</thead>
						<tbody>
							<tr class="hidden">
								<td data-col="characterName"></td>
								<td data-col="corporationName"></td>
								<td data-col="added" class="text-center"></td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>

	<div id="dialog-options" title="Settings" class="hidden">
		<div id="optionsAccordion">
			<h3><a href="#">Account Settings</a></h3>
			<div>
				<table class="optionsTable" width="100%" cellpadding="1" cellspacing="0">
					<tr>
						<th>Username:</th>
						<td id="username"></td>
					</tr>
					<tr>
						<th colspan="2">Characters:</th>
					</tr>
					<tr>
						<th colspan="2" id="characters"></th>
					</tr>
					<tr class="line">
						<th colspan="2">Masks:</th>
					</tr>
					<tr>
						<td colspan="2" id="masks">
							<div class="maskCategory">
								<div class="maskCategoryLabel">Default</div>
								<div id="default"></div>
							</div>
							<div class="maskCategory">
								<div class="maskCategoryLabel">Personal</div>
								<div id="personal"></div>
							</div>
							<div class="maskCategory">
								<div class="maskCategoryLabel">Corporate</div>
								<div id="corporate"></div>
							</div>
						</td>
					</tr>
					<tr id="maskControls">
						<td colspan="2" style="padding: 5px 0;">
							<input type="button" id="create" value="Create" />
							<input type="button" id="edit" value="Edit" />
							<input type="button" id="delete" value="Delete" />
						</td>
					</tr>
				</table>
				<div style="border-top: 1px solid black; text-align: right; margin: 0 -5px; padding: 5px 5px 0 5px;">
					<input type="button" id="usernameChange" value="Change Username" />
					<input type="button" id="pwChange" value="Change Password" />
				</div>
			</div>
			<h3><a href="#">Preferences</a></h3>
			<div>
				<table class="optionsTable" width="100%" cellpadding="1" cellspacing="0">
					<!-- <tr>
						<th>Chain Type format:</th>
						<td><input type="text" id="typeFormat" size="4" maxlength="3" /></td>
					</tr> -->
					<!-- <tr>
						<th>Chain Class format:</th>
						<td><input type="text" id="classFormat" size="4" maxlength="3" /></td>
					</tr> -->
					<tr>
						<th>Show Chain Map Gridlines:</th>
						<td>
							<input type="radio" name="gridlines" id="gridlines-yes" value="true" /><label for="gridlines-yes"> Yes</label>
							<input type="radio" name="gridlines" id="gridlines-no" value="false" /><label for="gridlines-no"> No</label>
						</td>
					</tr>
					<tr>
						<th>Chain Map Node Reference:</th>
						<td>
							<input type="radio" name="node-reference" id="node-reference-type" value="type" /><label for="node-reference-type"> Wormhole Type</label>
							<input type="radio" name="node-reference" id="node-reference-id" value="id" /><label for="node-reference-id"> Signature ID</label>
						</td>
					</tr>
					<tr>
						<th>Signature Add Dialog default type:</th>
						<td>
							<select id="editType">
								<option value="unknown">Unknown</option>
								<option value="combat">Combat</option>
								<option value="wormhole">Wormhole</option>
								<option value="ore">Ore</option>
								<option value="data">Data</option>
								<option value="gas">Gas</option>
								<option value="relic">Relic</option>
							</select>
						</td>
					<tr>
						<th>Signature paste default life:</th>
						<td>
							<select id="pasteLife">
								<option value="24">24 Hours</option>
								<option value="48">48 Hours</option>
								<option value="72">72 Hours</option>
								<option value="168">7 Days</option>
								<option value="672">28 Days</option>
							</select>
						</td>
					</tr>
					<tr>
						<th>Signature copy output separator:</th>
						<td>
							<input type="text" id="copySeparator" maxlength="20" />
						</td>
					</tr>
					<tr>
						<th>Background Image:</th>
						<td>
							<input type="text" id="background-image" maxlength="200" />
						</td>
					</tr>
					<tr>
						<th>UI Scale:</th>
						<td>
							<label for="uiscale-slider"></label>
							<div id="uiscale-slider"></div>
						</td>
					</tr>
				</table>
			</div>
			<h3><a href="#">Personal Statistics</a></h3>
			<div>
				<table class="optionsTable" width="100%" cellpadding="1" cellspacing="0">
					<tr>
						<th>Signatures added:</th>
						<td id="signatures_added"></td>
					</tr>
					<tr>
						<th>Signatures updated:</th>
						<td id="signatures_updated"></td>
					</tr>
					<tr>
						<th>Signatures deleted:</th>
						<td id="signatures_deleted"></td>
					</tr>
					<tr>
						<th>Wormholes added:</th>
						<td id="wormholes_added"></td>
					</tr>
					<tr>
						<th>Wormholes updated:</th>
						<td id="wormholes_updated"></td>
					</tr>
					<tr>
						<th>Wormholes deleted:</th>
						<td id="wormholes_deleted"></td>
					</tr>
					<tr>
						<th>Comments added:</th>
						<td id="comments_added"></td>
					</tr>
					<tr>
						<th>Comments updated:</th>
						<td id="comments_updated"></td>
					</tr>
					<tr>
						<th>Comments deleted:</th>
						<td id="comments_deleted"></td>
					</tr>
					<tr>
						<th>Systems visited:</th>
						<td id="systems_visited"></td>
					</tr>
					<tr>
						<th>Logins:</th>
						<td id="logins"></td>
					</tr>
					<tr>
						<th>Last login:</th>
						<td id="lastLogin"></td>
					</tr>
				</table>
			</div>
		</div>
	</div>

	<div id="dialog-usernameChange" title="Change Username" class="hidden">
		<form id="usernameForm">
			<table class="optionsTable" width="100%" cellpadding="1" cellspacing="0">
				<tr>
					<th>Current Username:</th>
					<td id="username"></td>
				</tr>
				<tr>
					<th>New Username:</th>
					<td><input type="text" name="username" size="16" maxlength="25" /></td>
				</tr>
			</table>
			<p id="usernameError" class="critical hidden"></p>
		</form>
	</div>

	<div id="dialog-pwChange" title="Change Password" class="hidden">
		<form id="pwForm">
			<table class="optionsTable" width="100%" cellpadding="1" cellspacing="0">
				<tr>
					<th>New Password:</th>
					<td><input type="password" name="password" maxlength="35" /></td>
				</tr>
				<tr>
					<th>Confirm:</th>
					<td><input type="password" name="confirm" maxlength="35" /></td>
				</tr>
			</table>
			<p id="pwError" class="critical hidden"></p>
		</form>
	</div>

	<div id="dialog-createMask" title="Create Mask" class="hidden">
		<form>
			<input type="hidden" name="mode" value="create" />
			<table class="optionsTable" width="100%" cellpadding="1" cellspacing="0">
				<tr>
					<th>Mask Name:</th>
					<td><input type="text" name="name" maxlength="100" /></td>
				</tr>
				<tr>
					<th>Mask Type:</th>
					<td>
						<select name="type">
							<option value="char">Character</option>
							<option value="corp">Corporate</option>
						</select>
					</td>
				</tr>
				<tr>
					<th colspan="2">Who has access:</th>
				</tr>
				<tr>
					<th colspan="2" id="accessList">
						<input type="checkbox" onclick="return false" id="create_add" value="" class="selector static">
						<label for="create_add" style="width: 100%; margin-left: -5px;" class="static">
							<i data-icon="plus" style="font-size: 3em; margin: 16px 0 0 16px; display: block;" class="static"></i>
						</label>
					</th>
				</tr>
			</table>
		</form>
	</div>

	<div id="dialog-editMask" title="Edit Mask" class="hidden">
		<form>
			<input type="hidden" name="mode" value="save" />
			<input type="hidden" name="mask" value="" />
			<table class="optionsTable" width="100%" cellpadding="1" cellspacing="0">
				<tr>
					<th>Mask Name:</th>
					<td id="name"></td>
				</tr>
				<tr>
					<th colspan="2">Who has access:</th>
				</tr>
				<tr>
					<th colspan="2">
						<div id="loading" style="text-align: center; padding-top: 10px; margin-left: -50px;">
							Getting API data...
							<span style="position: absolute; margin-top: -10px; padding-left: 25px;" class="" id="searchSpinner">
								<!-- Loading animation container -->
								<div class="loading">
								    <!-- We make this div spin -->
								    <div class="spinner">
								        <!-- Mask of the quarter of circle -->
								        <div class="mask">
								            <!-- Inner masked circle -->
								            <div class="maskedCircle"></div>
								        </div>
								    </div>
								</div>
							</span>
						</div>
						<div id="accessList">
							<input type="checkbox" onclick="return false" id="edit_add" value="" class="selector static">
							<label for="edit_add" class="static">
								<i data-icon="plus" style="font-size: 3em; margin: 16px 0 0 16px; display: block;" class="static"></i>
							</label>
						</div>
					</th>
				</tr>
			</table>
		</form>
	</div>

	<div id="dialog-joinMask" title="Find Mask" class="hidden">
		<form>
			<input type="hidden" name="mode" value="find" />
			<input type="hidden" name="find" value="" />
			<table class="optionsTable" width="100%" cellpadding="1" cellspacing="0">
				<tr>
					<th>Mask Name:</th>
					<td><input type="text" name="name" /></td>
				</tr>
				<tr>
					<td colspan="2">
						<span style="position: absolute; left: 15px;" class="hidden" id="loading">
							<!-- Loading animation container -->
							<div class="loading">
							    <!-- We make this div spin -->
							    <div class="spinner">
							        <!-- Mask of the quarter of circle -->
							        <div class="mask">
							            <!-- Inner masked circle -->
							            <div class="maskedCircle"></div>
							        </div>
							    </div>
							</div>
						</span>
						<input type="submit" value="Search" />
					</td>
				</tr>
				<tr>
					<th colspan="2">
						<div id="results"></div>
					</th>
				</tr>
			</table>
		</form>
	</div>

	<div id="dialog-EVEsearch" title="Search" class="hidden">
		<form id="EVEsearch">
			<input type="hidden" name="mode" value="search" />
			<table class="optionsTable" width="100%" cellpadding="1" cellspacing="0">
				<tr>
					<th>Search:</th>
					<td><input type="text" name="name" maxlength="50" /></td>
				</tr>
				<tr>
					<td colspan="2">
						<input type="radio" value="character" name="category" id="characterSearch" />
						<label for="characterSearch">Character</label>
						<input type="radio" value="corporation" name="category" id="corporationSearch" checked="checked" />
						<label for="corporationSearch">Corporation</label>
						<br/>
						<input type="checkbox" value="exact" name="exact" id="exactSearch" />
						<label for="exactSearch">Exact Match</label>
					</td>
				</tr>
				<tr>
					<td colspan="2">
						<span style="position: absolute; left: 15px;" class="hidden" id="searchSpinner">
							<!-- Loading animation container -->
							<div class="loading">
							    <!-- We make this div spin -->
							    <div class="spinner">
							        <!-- Mask of the quarter of circle -->
							        <div class="mask">
							            <!-- Inner masked circle -->
							            <div class="maskedCircle"></div>
							        </div>
							    </div>
							</div>
						</span>
						<span style="position: absolute; left: 15px; text-align: left;" id="searchCount"></span>
						<input type="submit" value="Search" />
					</td>
				</tr>
				<tr>
					<th colspan="2">
						<div id="EVESearchResults"></div>
					</th>
				</tr>
			</table>
		</form>
	</div>

	<div id="dialog-api" title="Access via API" class="hidden">
		<form id="reset_form">
			<span data-icon="alert"></span> You must use an API Key from the character you registered with.<br/><br/>
			<div style="font-style: italic; clear: both;">* Do not use multi-character APIs</div>
			<br/>
			<a href="https://support.eveonline.com/api" target="_blank" tabindex="-1">View your EVE API keys</a>
			<br/><br/>
			<table class="stdTable">
				<tr><th>Key ID:</th><td><input type=text id="keyID" size="8" maxlength="12" /></td></tr>
				<tr><th>vCode:</th><td><input type=text id="vCode" maxlength="100" style="box-sizing: border-box; width: 100%;" /></td></tr>
			</table>
		</form>
	</div>

	<div id="dialog-mass" title="" class="hidden">
		<table id="massTable">
			<thead>
				<tr>
					<th>Character</th>
					<th>Direction</th>
					<th>Ship Type</th>
					<th>Mass</th>
					<th>Time</th>
				</tr>
			</thead>
			<tbody></tbody>
		</table>
	</div>

	<div id="dialog-newTab" title="New Tab" class="hidden">
		<form id="newTab_form">
			<table class="optionsTable" width="100%" cellpadding="1" cellspacing="0">
				<tr>
					<th>Name:</th><td><input type="text" class="name" maxlength="20" size="20" /></td>
				</tr>
				<tr>
					<th>System:</th><td><input type="radio" name="tabType" id="tabType1" checked="checked" style="vertical-align: text-top;" /><input type="text" class="sigSystemsAutocomplete" size="20" /></td>
				</tr>
				<tr>
					<th></th><td><input type="radio" name="tabType" id="tabType2" style="vertical-align: middle;" /><label for="tabType2" style="width: 164px; display: inline-block; padding-left: 2px; text-align: left;">&nbsp;K-Space</label></td>
				</tr>
				<tr>
					<th></th><td><input type="checkbox" id="tabThera" /><label for="tabThera">Include EVE-Scout's Thera chain</label></td>
				</tr>
			</table>
			<input type="submit" style="position: absolute; left: -9999px"/>
		</form>
	</div>

	<div id="dialog-editTab" title="Edit Tab" class="hidden">
		<form id="editTab_form">
			<table class="optionsTable" width="100%" cellpadding="1" cellspacing="0">
				<tr>
					<th>Name:</th>
					<td><input type="text" class="name" maxlength="20" size="20" /></td>
				</tr>
				<tr>
					<th>System:</th>
					<td><input type="radio" name="tabType" id="editTabType1" checked="checked" style="vertical-align: text-top;" /><input type="text" class="sigSystemsAutocomplete" size="20" /></td>
				</tr>
				<tr>
					<th></th>
					<td><input type="radio" name="tabType" id="editTabType2" style="vertical-align: middle;" /><label for="editTabType2" style="width: 164px; display: inline-block; padding-left: 2px; text-align: left;">&nbsp;K-Space</label></td>
				</tr>
				<tr>
					<th></th>
					<td><input type="checkbox" id="editTabThera" /><label for="editTabThera">Include EVE-Scout's Thera chain</label></td>
				</tr>
			</table>
			<input type="submit" style="position: absolute; left: -9999px"/>
		</form>
	</div>

	<div id="dialog-select-signature" title="&nbsp;" class="hidden">
			<span data-icon="info"></span>
			Which signature would you like to update?<br/><br/>
			<table class="optionsTable" width="100%" cellpadding="1" cellspacing="0">
					<thead>
							<tr>
									<th></th>
									<th class="centerAlign">ID</th>
									<th class="centerAlign">Type</th>
									<th class="centerAlign">Age</th>
									<th class="centerAlign">Leads To</th>
									<th class="centerAlign">Life</th>
									<th class="centerAlign">Mass</th>
							</tr>
					</thead>
					<tbody></tbody>
			</table>
	</div>

	<div id="dialog-error" title="Error" class="hidden">
		<span data-icon="alert" class="critical"></span>
		<span id="msg"></span>
	</div>

	<div id="dialog-msg" title="&nbsp;" class="hidden">
		<span data-icon="info"></span>
		<span id="msg"></span>
	</div>

	<div id="dialog-confirm" title="&nbsp;" class="hidden">
		<span data-icon="info"></span>
		<span id="msg"></span>
	</div>

	<ul id="signatureColumnMenu" class="hidden">
		<li data-command="leftAlign"><a>Left align</a></li>
		<li data-command="centerAlign"><a>Center align</a></li>
		<li data-command="rightAlign"><a>Right align</a></li>
	</ul>

	<div id="chainTab" class="hidden">
		<span class="tab">
			<span class="name" data-tab=""></span>
			<i class="closeTab" data-icon="times"></i>
			<i class="editTab" data-icon="edit"></i>
		</span>
	</div>

	<div id="chainNode" class="hidden">
		<div class="nodeIcons">
			<div style="float: left;">
				<i class="whEffect invisible"></i>
			</div>
			<div style="float: right;">
				<i data-icon="user" class="invisible confused"></i>
				<span class="badge invisible"></span>
			</div>
		</div>
		<h4 class="nodeClass">??</h4>
		<h4 class="nodeSystem"><a href="" class="invisible">system</a></h4>
		<h4 class="nodeType">&nbsp;</h4>
		<div class="nodeActivity">
			<span class="jumps invisible">&#9679;</span>&nbsp;<span class="pods invisible">&#9679;</span>&nbsp;&nbsp;<span class="ships invisible">&#9679;</span>&nbsp;<span class="npcs invisible">&#9679;</span>
		</div>
	</div>

	<textarea id="clipboard"></textarea>

	<script type="text/javascript">

		var init = <?= json_encode($_SESSION) ?>;

		// Google Analytics
		(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
		(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
		m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
		})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

		ga('create', 'UA-48258312-1', 'auto');
		ga('send', 'pageview');

		var passiveHitTimer;
		function passiveHit() {
			ga('send', 'pageview');
			clearTimeout(passiveHitTimer);
			passiveHitTimer = setTimeout("passiveHit()", 240000);
		}

		setTimeout("passiveHit()", 240000);

		// Monitor event listeners
		var listenerCount = 0;
		(function() {
		    var ael = Node.prototype.addEventListener;
		    Node.prototype.addEventListener = function() {
		         listenerCount++;
		         ael.apply(this, arguments);
		    }
		    var rel = Node.prototype.removeEventListener;
		    Node.prototype.removeEventListener = function() {
		         listenerCount--;
		         rel.apply(this, arguments);
		    }
		})();

	</script>

	<!-- JS Includes -->
	<script type="text/javascript" src="//<?= CDN_DOMAIN ?>/js/jquery-3.3.1.min.js"></script>
	<script type="text/javascript" src="//<?= CDN_DOMAIN ?>/js/jquery-ui-1.12.1.min.js"></script>
	<script type="text/javascript" src="//<?= CDN_DOMAIN ?>/js/jquery.tablesorter.combined.min.js"></script>
	<script type="text/javascript" src="//<?= CDN_DOMAIN ?>/js/jquery.ui-contextmenu.min.js"></script>
	<script type="text/javascript" src="//<?= CDN_DOMAIN ?>/js/jquery.plugin.min.js"></script>
	<script type="text/javascript" src="//<?= CDN_DOMAIN ?>/js/jquery.countdown.js"></script>
	<script type="text/javascript" src="//<?= CDN_DOMAIN ?>/js/jquery.inlinecomplete.min.js"></script>
	<script type="text/javascript" src="//<?= CDN_DOMAIN ?>/js/jquery.gridster.min.js"></script>
	<script type="text/javascript" src="//<?= CDN_DOMAIN ?>/js/jquery.knob.min.js"></script>
	<script type="text/javascript" src="//<?= CDN_DOMAIN ?>/js/jquery.jbox-0.4.9.min.js"></script>
	<script type="text/javascript" src="//<?= CDN_DOMAIN ?>/js/jquery.jbox-notice-0.4.9.min.js"></script>
	<script type="text/javascript" src="//<?= CDN_DOMAIN ?>/js/jquery.duration-picker.js"></script>
	<script type="text/javascript" src="//<?= CDN_DOMAIN ?>/ckeditor/ckeditor.js"></script>
	<script type="text/javascript" src="//<?= CDN_DOMAIN ?>/js/dragscroll.js"></script>
	<script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
	<!-- Google Charts -->
	<script type="text/javascript">google.charts.load('current', {packages: ['corechart', 'orgchart']});</script>
	<script type="text/javascript" src="//<?= CDN_DOMAIN ?>/js/moment.min.js"></script>
	<!-- <script type="text/javascript" src="//<?= CDN_DOMAIN ?>/js/mustache.min.js"></script> -->
	<script type="text/javascript" src="//<?= CDN_DOMAIN ?>/js/intro.min.js"></script>
	<script type="text/javascript" src="//<?= CDN_DOMAIN ?>/js/combine.js?v=<?= VERSION ?>"></script>
	<script type="text/javascript" src="//<?= CDN_DOMAIN ?>/js/app.min.js?v=<?= VERSION ?>"></script>
	<!-- JS Includes -->
</body>
</html>
