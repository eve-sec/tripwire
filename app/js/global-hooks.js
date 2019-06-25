$("body").on("click", "a[href^='.?system=']", function(e) {
	e.preventDefault();

	var system = $(this).attr("href").replace(".?system=", "");
	var systemID = Object.index(tripwire.systems, "name", system);

	tripwire.systemChange(systemID);
});

$("body").on("submit", "#systemSearch", function(e) {
	e.preventDefault();

	var system = $(this).find("[name='system']").val();
	var systemID = Object.index(tripwire.systems, "name", system, true) || false;

	if (systemID !== false) {
		tripwire.systemChange(systemID);
		$(this).find("[name='system']").val("");
		$("#search").click();
	}
});

$("body").on("click", "#undo:not(.disabled)", function() {
	tripwire.undo();
});

$("body").on("click", "#redo:not(.disabled)", function() {
	tripwire.redo();
});

// Chain map zooming (Gets funky if you push things too far)
$("#chainParent").on("mousewheel", function(e) {
	e.preventDefault();
	var zoom = parseFloat($("#chainParent").css("zoom")) || 1.0;
	var min = 0.6;
	var max = 2.0;

    if (e.originalEvent.wheelDelta / 120 > 0 && zoom < max) {
		$("#chainParent").css("zoom", zoom + 0.1);
    } else if (e.originalEvent.wheelDelta / 120 < 0 && zoom > min) {
		$("#chainParent").css("zoom", zoom - 0.1);
    }

	// Show the reset zoom button for awhile
	$("#chain-zoom-reset").fadeIn(200);
	if (this.timeout) clearTimeout(this.timeout);
	this.timeout = setTimeout('$("#chain-zoom-reset").fadeOut(200);', 3000);

	// Save options
	options.chain.zoom = parseFloat($("#chainParent").css("zoom"));
	options.saveDelay(2000);
});

$("#chain-zoom-reset").on("click", function() {
	$("#chainParent").css("zoom", 1);
	options.chain.zoom = 1;
	options.saveDelay(2000);
});

$(document).keydown(function(e)	{
	//Abort - user is in input or textarea
	if ($(document.activeElement).is("textarea, input")) return;

	// Ctrl key hooks
	if (e.metaKey || e.ctrlKey) {

		if (e.keyCode === 89 && !$("#redo").hasClass("disabled")) {
			// Ctrl-y redo hook
			e.preventDefault();
			$("#redo").click();
			Notify.trigger("Redoing last undo");
		} else if (e.keyCode === 90 && !$("#undo").hasClass("disabled")) {
			// Ctrl-z undo hook
			e.preventDefault();
			$("#undo").click();
			Notify.trigger("Undoing last action");
		} else if (e.keyCode === 65) {
			// Ctrl-a select all (signatures) hook
			e.preventDefault();
			$("#sigTable tbody tr").addClass("selected");
			$("#signaturesWidget #delete-signature").trigger("delete:refresh");
		} else if (e.keyCode === 67) {
			// Ctrl-c copy selected signatures hook
			if (window.getSelection().toString() === "") {
				var output = "";
				$("#sigTable tbody tr.selected").each(function(row) {
					var signature = tripwire.client.signatures[$(this).data("id")];
					var row = [];

					if (signature.signatureID) {
						row.push(signature.signatureID.substring(0, 3).toUpperCase() + "-" + (signature.signatureID.substring(3, 6) || "###"));
					} else {
						row.push("null");
					}

					row.push(signature.type);
					if (signature.type === "wormhole") {
						var wormhole = $.map(tripwire.client.wormholes, function(wormhole) { if (wormhole.initialID == signature.id || wormhole.secondaryID == signature.id) return wormhole; })[0];
						var otherSignature = signature.id == wormhole.initialID ? tripwire.client.signatures[wormhole.secondaryID] : tripwire.client.signatures[wormhole.initialID];
						row.push(wormhole.type || "null" );
						row.push(tripwire.systems[signature.systemID] ? tripwire.systems[signature.systemID].name : tripwire.aSigSystems[signature.systemID]);
						row.push(tripwire.systems[otherSignature.systemID] ? tripwire.systems[otherSignature.systemID].name : tripwire.aSigSystems[otherSignature.systemID]);
						row.push(wormhole.life);
						row.push(wormhole.mass);
					} else {
						row.push(signature.name);
					}

					row.push(signature.createdByName);
					row.push(signature.lifeTime);
					row.push(signature.lifeLength);
					row.push(signature.lifeLeft);
					row.push(signature.modifiedByName);
					row.push(signature.modifiedTime);
					output += row.join(options.signatures.copySeparator) + "\r\n";
				});
				$("#clipboard").text(output);
				$("#clipboard").focus();
				$("#clipboard").select();
			}
		}
	} else {
		// delete key keyhooks
		if (e.keyCode == 46 && $("#sigTable tr.selected").length > 0) {
			$("#delete-signature").click();
		}
	}
});

// $("#APIclock").knob({angleArc: 359.9, height: 20, width: 20, max: 60, readOnly: true, displayInput: false, fgColor: "#CCC", bgColor: "#666"});

$("#follow").click(function(e) {
	e.preventDefault();

	if ($(this).hasClass("active"))
		$(this).removeClass("active");
	else
		$(this).addClass("active");

	options.buttons.follow = $(this).hasClass("active");
	options.save();
})

$("#show-viewing").click(function() {
	if ($(this).hasClass("active"))
		$(this).removeClass("active");
	else
		$(this).addClass("active");

	chain.redraw();

	options.buttons.chainWidget.viewing = $(this).hasClass("active");
	options.save();
});

$("#show-favorite").click(function() {
	if ($(this).hasClass("active"))
		$(this).removeClass("active");
	else
		$(this).addClass("active");

	chain.redraw();

	options.buttons.chainWidget.favorites = $(this).hasClass("active");
	options.save();
});

$("#system-favorite").click(function() {
	if ($(this).hasClass("active")) {
		$(this).removeClass("active").attr("data-icon", "star-empty");

		options.favorites.splice(options.favorites.indexOf(parseInt(viewingSystemID)), 1);
	} else {
		$(this).attr("data-icon", "star").addClass("active");

		options.favorites.push(parseInt(viewingSystemID));
	}

	if ($("#show-favorite").hasClass("active"))
		chain.redraw();

	options.save();
});

$("#search").click(function(e) {
	$("#searchSpan").toggle();

	if ($(this).hasClass("active")) {
		$(this).removeClass("active");
		if (tripwire.client.EVE && tripwire.client.EVE.systemName)
			$("#currentSpan").show();
	} else {
		$(this).addClass("active");
		$("#currentSpan").hide();

		$("#searchSpan input[name=system]").focus().select();
	}
});

$("#toggle-automapper").click(function(e) {
	e.preventDefault();

	if ($(this).hasClass("active")) {
		$(this).removeClass("active");
	} else {
		$(this).addClass("active");
	}

	options.buttons.signaturesWidget.autoMapper = $(this).hasClass("active");
	options.save();
});

$("#track").on("click", ".tracking-clone", function() {
	var characterID =$(this).attr("data-characterid");
	$("#tracking .tracking-clone").removeClass("active");

	if (options.tracking.active == characterID) {
		options.tracking.active = null;
		tripwire.EVE(false, true);
		$("#removeESI").attr("disabled", "disabled");
	} else {
		options.tracking.active = characterID;

		if (tripwire.esi.characters[options.tracking.active]) {
			$("#tracking .tracking-clone[data-characterid='"+ options.tracking.active +"']").addClass("active");
			tripwire.EVE(tripwire.esi.characters[options.tracking.active], true);
		}

		$("#removeESI").removeAttr("disabled");
	}

	options.save();
});

$("#login").on("click", "#removeESI", function() {
	var characterID = options.tracking.active;

	options.tracking.active = null;
	tripwire.EVE(false, true);
	options.save();

	$("#tracking .tracking-clone[data-characterid='"+ characterID +"']").remove();

	$("#removeESI").attr("disabled", "disabled");

	if ($.isArray(tripwire.data.esi.delete)) {
		tripwire.data.esiDelete.push(characterID);
	} else {
		tripwire.data.esiDelete = [characterID];
	}
});

$("#user").click(function(e) {
	e.preventDefault();

	if ($(this).hasClass("active")) {
		$(this).removeClass("active");

		$("#login > #panel").css({display: "none"});

		//$("#wrapper").unbind("click");
	} else {
		$(this).addClass("active");

		$("#login > #panel").css({display: "inline"});
		$("#loginForm input[name=username]").focus().select();

		// Click outside closes
		$("#wrapper").click(function(e) {
			$("#login > #panel").css({display: "none"});
			$("#user").removeClass("active");
		});

		$("#login").click(function(e) {
			e.stopPropagation();
		})
	}
});

$("#logout").click(function() {
	window.location = "logout.php";
});

var Notify = new function() {
	this.trigger = function(content, color, stick, id) {
		var color = typeof(color) !== "undefined" ? color : "blue";
		var stick = typeof(stick) !== "undefined" ? stick : 10000;
		var id = typeof(id) !== "undefined" ? id : null;

		new jBox("Notice", {
			id: id,
			content: content,
			offset: {y: 35},
			animation: "flip",
			color: color,
			autoClose: stick
		});
	}
}

// Init valdiation tooltips
var ValidationTooltips = new jBox("Tooltip", {
	trigger: null,
	addClass: "validation-tooltip",
	animation: "flip",
	fade: 0
});

var Tooltips = new jBox("Tooltip", {
	attach: $("[data-tooltip]"),
	getContent: "data-tooltip",
	position: {x: "right", y: "center"},
	outside: "x"
});

var SystemActivityToolTips = new jBox("Tooltip", {
	getContent: "data-tooltip",
	position: {y: "bottom"},
	appendTo: $("#chainParent"),
	reposition: true,
	repositionOnOpen: true,
	createOnInit: true,
	onOpen: function() {
		var nodePos = this.source.closest("[data-nodeid]").position();
		var parentPos = this.source.closest(".nodeActivity").position();
		var nodeHeight = this.source.closest("[data-nodeid]").height();
		// var nodeWidth = this.source.closest("[data-nodeid]").width();
		var targetPos = this.target.position()
		var tooltipWidth = this.container.parent().width();
		// var tooltipHeight = this.container.parent().height();

		this.options.position = {x: nodePos.left + parentPos.left + targetPos.left + 3 - tooltipWidth /2 , y: nodePos.top + nodeHeight + 15};
	}
});

var WormholeTypeToolTips = new jBox("Tooltip", {
	attach: $("#chainMap .whEffect[data-icon]"),
	getContent: "data-tooltip",
	position: {x: "left", y: "center"},
	appendTo: $("#chainParent"),
	outside: "x",
	adjustDistance: 100,
	responsiveWidth: false,
	reposition: true,
	repositionOnOpen: true,
	createOnInit: true,
	onOpen: function() {
		var parentPos = this.source.closest("[data-nodeid]").position();
		// var parentHeight = this.source.closest("[data-nodeid]").height();
		// var parentWidth = this.source.closest("[data-nodeid]").width();
		var targetPos = this.target.position()
		var tooltipWidth = this.container.parent().width();
		// var tooltipHeight = this.container.parent().height();

		this.options.position = {x: parentPos.left - tooltipWidth - 10, y: parentPos.top + targetPos.top - 3};
	}
});

var OccupiedToolTips = new jBox("Tooltip", {
	pointer: "top:-3",
	position: {x: "right", y: "center"},
	appendTo: $("#chainParent"),
	outside: "x",
	minWidth: 100,
	animation: "move",
	adjustDistance: 100,
	responsiveWidth: false,
	reposition: true,
	repositionOnOpen: true,
	repositionOnContent: true,
	createOnInit: true,
	onOpen: function() {
		var tooltip = this;
		var systemID = this.source.closest("[data-nodeid]").data("nodeid");
		var parentPos = this.source.closest("[data-nodeid]").position();
		var parentWidth = this.source.closest("[data-nodeid]").width();
		var targetPos = this.target.position();

		this.options.position = {x: parentPos.left + parentWidth, y: parentPos.top + targetPos.top - 3};

		tooltip.setContent("&nbsp;");

		$.ajax({
			url: "occupants.php",
			dataType: "JSON",
			data: "systemID="+systemID,
			cache: false
		}).done(function(data) {
			if (data && data.occupants) {
				var chars = "<table>";

				// Sort by characterName
				data.occupants.sort(function(a, b) {
					if (a.characterName.toLowerCase() < b.characterName.toLowerCase()) return -1;
					if (a.characterName.toLowerCase() > b.characterName.toLowerCase()) return 1;
					return 0;
				});

				for (var x in data.occupants) {
					chars += "<tr><td>"+data.occupants[x].characterName+"</td><td style='padding-left: 10px;'>"+(data.occupants[x].shipTypeName?data.occupants[x].shipTypeName:"")+"</td></tr>";
				}

				chars += "</table>";
				tooltip.setContent(chars);
			}
		});
	}
});

$("#chainTabs").sortable({
	items: "> .tab",
	axis: "x",
	delay: 150,
	tolerance: "pointer",
	containment: "parent",
	update: function(e, ui) {
		var result = $("#chainTabs").sortable("toArray");
		var newTabs = [];

		for (var x in result) {
			newTabs.push(options.chain.tabs[result[x]]);
			$("#chainTabs .tab:eq("+x+")").attr("id", x);
		}

		options.chain.active = $(".tab.current").index();
		options.chain.tabs = newTabs;
		options.save();
	}
});

$("#chainTabs").on("click", ".tab", function(e) {
	e.preventDefault();

	if ($(this).hasClass("current")) {
		$("#chainTabs .tab").removeClass("current");
		options.chain.active = null;
	} else {
		$("#chainTabs .tab").removeClass("current");
		$(this).addClass("current");
		options.chain.active = $(this).index();
	}

	options.save();
	chain.redraw();
	tripwire.parse(tripwire.client, "refresh");
});

$("#chainTabs").on("click", ".closeTab", function(e) {
	e.stopPropagation();
	var $tab = $(this).closest(".tab");

	$("#dialog-confirm #msg").html("This tab will be removed, are you sure?");
	$("#dialog-confirm").dialog("option", {
		buttons: {
			"Remove Tab": function() {
				var i = $tab.index();

				options.chain.active = $(".tab.current").index();
				options.chain.tabs.splice(i, 1);
				options.save();

				$tab.remove();
				if ($("#chainTabs .tab.current").length == 0) {
					$("#chainTabs .tab:last").click();
				}

				for (var x = 0, l = $("#chainTabs .tab").length; x < l; x++) {
					$("#chainTabs .tab:eq("+x+")").attr("id", x);
				}

				$(this).dialog("close");
			},
			Cancel: function() {
				$(this).dialog("close");
			}
		}
	}).dialog("open");
});

$("#newTab").on("click", function() {
	// check if dialog is open
	if (!$("#dialog-newTab").hasClass("ui-dialog-content")) {
		$("#dialog-newTab").dialog({
			resizable: false,
			minHeight: 0,
			dialogClass: "dialog-noeffect ui-dialog-shadow",
			buttons: {
				OK: function() {
					$("#newTab_form").submit();
				},
				Cancel: function() {
					$(this).dialog("close");
				}
			},
			open: function() {
				$("#dialog-newTab .name").val(viewingSystem).focus();
				$("#dialog-newTab .sigSystemsAutocomplete").val(viewingSystem);
			},
			close: function() {
				ValidationTooltips.close();
			},
			create: function() {
				$("#dialog-newTab .sigSystemsAutocomplete").inlinecomplete({source: tripwire.aSigSystems, maxSize: 10, delay: 0});

				$("#newTab_form").submit(function(e) {
					e.preventDefault();
					var $tab = $("#chainTab .tab").clone();
					var name = $("#dialog-newTab .name").val();
					var systemID = Object.index(tripwire.systems, "name", $("#dialog-newTab .sigSystemsAutocomplete").val());
					var thera = $("#tabThera")[0].checked ? true : false;

					if (!name) {
						ValidationTooltips.open({target: $("#dialog-newTab .name")}).setContent("Must have a name!");
						return false;
					} else if (!systemID && $("#tabType1")[0].checked) {
						ValidationTooltips.open({target: $("#dialog-newTab .sigSystemsAutocomplete")}).setContent("Must have a valid system!");
						return false;
					} else if ($("#tabType2")[0].checked) {
						systemID = 0;
					}

					$tab.attr("id", $("#chainTabs .tab").length).find(".name").data("tab", systemID).html(name);
					options.chain.tabs.push({systemID: systemID, name: name, evescout: thera});
					options.save();

					$("#chainTabs").append($tab);

					$("#dialog-newTab").dialog("close");
				});

				$("#dialog-newTab .sigSystemsAutocomplete").click(function(e) {
					$("#dialog-newTab #tabType1").click();
				});
			}
		});
	} else if (!$("#dialog-newTab").dialog("isOpen")) {
		$("#dialog-newTab").dialog("open");
	}
});

$("#chainTabs").on("click", ".editTab", function(e) {
	e.stopPropagation();

	// check if dialog is open
	if (!$("#dialog-editTab").hasClass("ui-dialog-content")) {
		$("#dialog-editTab").dialog({
			resizable: false,
			minHeight: 0,
			dialogClass: "dialog-noeffect ui-dialog-shadow",
			buttons: {
				OK: function() {
					$("#editTab_form").submit();
				},
				Cancel: function() {
					$(this).dialog("close");
				}
			},
			open: function() {
				$("#dialog-editTab .name").val(options.chain.tabs[options.chain.active].name).focus();
				$("#dialog-editTab .sigSystemsAutocomplete").val(options.chain.tabs[options.chain.active].systemID > 0 ? tripwire.systems[options.chain.tabs[options.chain.active].systemID].name : "");
				options.chain.tabs[options.chain.active].systemID > 0 ? $("#dialog-editTab #editTabType1")[0].checked = true : $("#dialog-editTab #editTabType2")[0].checked = true;
				$("#dialog-editTab #editTabThera")[0].checked = options.chain.tabs[options.chain.active].evescout;
			},
			close: function() {
				ValidationTooltips.close();
			},
			create: function() {
				$("#dialog-editTab .sigSystemsAutocomplete").inlinecomplete({source: tripwire.aSigSystems, maxSize: 10, delay: 0});

				$("#editTab_form").submit(function(e) {
					e.preventDefault();
					var $tab = $("#chainTabs .tab").eq([options.chain.active]);
					var name = $("#dialog-editTab .name").val();
					var systemID = Object.index(tripwire.systems, "name", $("#dialog-editTab .sigSystemsAutocomplete").val());
					var thera = $("#editTabThera")[0].checked ? true : false;

					if (!name) {
						ValidationTooltips.open({target: $("#dialog-editTab .name")}).setContent("Must have a name!");
						return false;
					} else if (!systemID && $("#editTabType1")[0].checked) {
						ValidationTooltips.open({target: $("#dialog-editTab .sigSystemsAutocomplete")}).setContent("Must have a valid system!");
						return false;
					} else if ($("#editTabType2")[0].checked) {
						systemID = 0;
					}

					$tab.attr("id", $("#chainTabs .tab").length).find(".name").data("tab", systemID).html(name);
					options.chain.tabs[options.chain.active] = {systemID: systemID, name: name, evescout: thera};
					options.save();
					chain.redraw();

					tripwire.parse(tripwire.client, "refresh");

					//$("#chainTabs").append($tab);

					$("#dialog-editTab").dialog("close");
				});

				$("#dialog-editTab .sigSystemsAutocomplete").click(function(e) {
					$("#dialog-editTab #editTabType1").click();
				});
			}
		});
	} else if (!$("#dialog-editTab").dialog("isOpen")) {
		$("#dialog-editTab").dialog("open");
	}
});

// Signature column context menu
$("#signaturesWidget #sigTable thead").contextmenu({
	delegate: "th.sortable",
	menu: "#signatureColumnMenu",
	position: function(event, ui) {
        return {my: "left top", at: "center", of: ui.target};
    },
	select: function(e, ui) {
		var col = $(ui.target).parent().parent().children().index($(ui.target).parent()) + 1;

		switch(col) {
			case 1:
				colName = "sigID";
				break;
			case 2:
				colName = "sigType";
				break;
			case 3:
				colName = "sigAge";
				break;
			case 4:
				colName = "leadsTo";
				break;
			case 5:
				colName = "sigLife";
				break;
			case 6:
				colName = "sigMass";
				break;
		}

		switch(ui.cmd) {
			case "leftAlign":
				$("#signaturesWidget #sigTable tbody td:nth-child("+ col +")").removeClass("centerAlign rightAlign").addClass("leftAlign");
				options.signatures.alignment[colName] = "leftAlign";
				break;
			case "centerAlign":
				$("#signaturesWidget #sigTable tbody td:nth-child("+ col +")").removeClass("leftAlign rightAlign").addClass("centerAlign");
				options.signatures.alignment[colName] = "centerAlign";
				break;
			case "rightAlign":
				$("#signaturesWidget #sigTable tbody td:nth-child("+ col +")").removeClass("centerAlign leftAlign").addClass("rightAlign");
				options.signatures.alignment[colName] = "rightAlign";
				break;
		}

		options.save();
	},
	beforeOpen: function(e, ui) {
		var col = $(ui.target).parent().parent().children().index($(ui.target).parent()) + 1;

		switch(col) {
			case 1:
				colName = "sigID";
				break;
			case 2:
				colName = "sigType";
				break;
			case 3:
				colName = "sigAge";
				break;
			case 4:
				colName = "leadsTo";
				break;
			case 5:
				colName = "sigLife";
				break;
			case 6:
				colName = "sigMass";
				break;
		}

		$(this).contextmenu("enableEntry", "leftAlign", true);
		$(this).contextmenu("enableEntry", "centerAlign", true);
		$(this).contextmenu("enableEntry", "rightAlign", true);

		$(this).contextmenu("enableEntry", options.signatures.alignment[colName], false);
	}
});

// Chain Map Context Menu
$("#chainParent").contextmenu({
	appendTo: "#chainParent",
	delegate: ".nodeSystem a",
	position: function(event, ui) {
        return {my: "left top-1", at: "right top", of: ui.target};
    },
	menu: "#chainMenu",
	show: {effect: "slideDown", duration: 150},
	select: function(e, ui) {
		var id = $(ui.target[0]).closest("[data-nodeid]").data("nodeid");
		var row = $(ui.target[0]).closest("[data-nodeid]").attr("id").replace("node", "") -1;

		switch(ui.cmd) {
			case "showInfo":
				tripwire.esi.showInfo(id, options.tracking.active);
				break;
			case "setDest":
				tripwire.esi.setDestination(id, options.tracking.active, true);
				break;
			case "addWay":
				tripwire.esi.setDestination(id, options.tracking.active, false);
				break;
			case "showMap":
				// CCPEVE.showMap(id);
				break;
			case "red":
				$(ui.target[0]).closest("td").hasClass("redNode") ? $(this).contextmenu("removeFlare", id, ui) : $(this).contextmenu("setFlare", id, ui.cmd, ui);
				break;
			case "yellow":
				$(ui.target[0]).closest("td").hasClass("yellowNode") ? $(this).contextmenu("removeFlare", id, ui) : $(this).contextmenu("setFlare", id, ui.cmd, ui);
				break;
			case "green":
				$(ui.target[0]).closest("td").hasClass("greenNode") ? $(this).contextmenu("removeFlare", id, ui) : $(this).contextmenu("setFlare", id, ui.cmd, ui);
				break;
			case "mass":
				$("#dialog-mass").data("id", $(ui.target[0]).closest("[data-nodeid]").data("sigid")).data("systemID", $(ui.target[0]).closest("[data-nodeid]").data("nodeid")).dialog("open");
				break;
			case "collapse":
				var toggle = options.chain.tabs[options.chain.active] ? ($.inArray(id, options.chain.tabs[options.chain.active].collapsed) == -1 ? true : false) : true;
				chain.map.collapse(row, toggle);
				break;
		}
	},
	beforeOpen: function(e, ui) {
		var wormholeID = $(ui.target[0]).closest("[data-nodeid]").data("sigid") || null;
		var systemID = $(ui.target[0]).closest("[data-nodeid]").data("nodeid");

		// Add check for k-space
		if (tripwire.systems[systemID].class || !tripwire.esi.characters[options.tracking.active]) {
			$(this).contextmenu("enableEntry", "setDest", false);
			$(this).contextmenu("enableEntry", "addWay", false);
			$(this).contextmenu("enableEntry", "showMap", false);
		} else {
			$(this).contextmenu("enableEntry", "setDest", true);
			$(this).contextmenu("enableEntry", "addWay", true);
			$(this).contextmenu("enableEntry", "showMap", false);
		}

		if (wormholeID) {
			$(this).contextmenu("enableEntry", "mass", true);
		} else {
			$(this).contextmenu("enableEntry", "mass", false);
		}
	},
	create: function(e, ui) {
		// Fix some bad CSS from jQuery Position
		$(this).find(".ui-front").css("width", "10em");
		$(this).find(".ui-front").css("position", "");

		$("#dialog-mass").dialog({
			autoOpen: false,
			width: "auto",
			height: "auto",
			dialogClass: "dialog-noeffect ui-dialog-shadow",
			buttons: {
				Close: function() {
					$(this).dialog("close");
				}
			},
			open: function() {
				var wormholeID = $(this).data("id");
				var systemID = $(this).data("systemID");
				var wormhole = tripwire.client.wormholes[wormholeID];
				var signature = tripwire.client.signatures[wormhole.initialID];
				var otherSignature = tripwire.client.signatures[wormhole.secondaryID];

				$("#dialog-mass").dialog("option", "title", "From "+tripwire.systems[signature.systemID].name+" to "+tripwire.systems[otherSignature.systemID].name);

				$("#dialog-mass #massTable tbody tr").remove();

				var payload = {wormholeID: wormhole.id};

				$.ajax({
					url: "mass.php",
					type: "POST",
					data: payload,
					dataType: "JSON"
				}).done(function(data) {
					if (data && data.mass) {
                        var totalMass = 0;
						for (x in data.mass) {
                            totalMass += parseFloat(data.mass[x].mass);
							$("#dialog-mass #massTable tbody").append("<tr><td>"+data.mass[x].characterName+"</td><td>"+(data.mass[x].toID == systemID ? "In" : "Out")+"</td><td>"+data.mass[x].shipType+"</td><td>"+numFormat(data.mass[x].mass)+"Kg</td><td>"+data.mass[x].time+"</td></tr>");
						}
                        $("#dialog-mass #massTable tbody").append("<tr><td></td><td></td><td></td><th>"+ numFormat(totalMass) +"Kg</th><td></td></tr>");
					}
				});
			}
		});

		$.moogle.contextmenu.prototype.setFlare = function(systemID, flare, ui) {
			var data = {"systemID": systemID, "flare": flare};

			$.ajax({
				url: "flares.php",
				type: "POST",
				data: data,
				dataType: "JSON"
			}).done(function(data) {
				if (data && data.result) {
					// $(ui.target[0]).closest("td").removeClass("redNode yellowNode greenNode").addClass(flare+"Node");

					chain.data.flares.flares.push({systemID: systemID, flare: flare, time: null});
					chain.flares(chain.data.flares);
				}
			});
		}

		$.moogle.contextmenu.prototype.removeFlare = function(systemID, ui) {
			var data = {"systemID": systemID};

			$.ajax({
				url: "flares.php",
				type: "POST",
				data: data,
				dataType: "JSON"
			}).done(function(data) {
				if (data && data.result) {
					// $(ui.target[0]).closest("td").removeClass("redNode yellowNode greenNode");

					chain.data.flares.flares.splice(Object.index(chain.data.flares.flares, "systemID", systemID), 1);
					chain.flares(chain.data.flares);
				}
			});
		}
	}
});

// Used to generate eve-survival guide link
function linkSig(sigName) {
	var wormholeSignatures = [
		// Ore sites
		"Average Frontier Deposit",
		"Unexceptional Frontier Deposit",
		"Common Perimeter Deposit",
		"Exceptional Core Deposit",
		"Infrequent Core Deposit",
		"Unusual Core Deposit",
		"Rarified Core Deposit",
		"Isolated Core Deposit",
		"Ordinary Permiter Deposit",
		"Uncommon Core Deposit",

		// Gas Sites
		"Barren Perimeter Reservoir",
		"Minor Perimeter Reservoir",
		"Ordinary Perimeter Reservoir",
		"Sizeable Perimeter Reservoir",
		"Token Perimeter Reservoir",
		"Bountiful Frontier Reservoir",
		"Vast Frontier Reservoir",
		"Instrumental Core Reservoir",
		"Vital Core Reservoir",

		// Class 1
		"Perimeter Ambush Point",
		"Perimeter Camp",
		"Phase Catalyst Node",
		"The Line",
		"Forgotten Perimeter Coronation Platform",
		"Forgotten Perimeter Power Array",
		"Unsecured Perimeter Amplifier",
		"Unsecured Perimeter Information Center",

		// Class 2
		"Perimeter Checkpoint",
		"Perimeter Hangar",
		"The Ruins of Enclave Cohort 27",
		"Sleeper Data Sanctuary",
		"Forgotten Perimeter Gateway",
		"Forgotten Perimeter Habitation Coils",
		"Unsecured Perimeter Comms Relay",
		"Unsecured Perimeter Transponder Farm",

		// Class 3
		"Fortification Frontier Stronghold",
		"Outpost Frontier Stronghold",
		"Solar Cell",
		"The Oruze Construct",
		"Forgotten Frontier Quarantine Outpost",
		"Forgotten Frontier Recursive Depot",
		"Unsecured Frontier Database",
		"Unsecured Frontier Receiver",

		// Class 4
		"Frontier Barracks",
		"Frontier Command Post",
		"Integrated Terminus",
		"Sleeper Information Sanctum",
		"Forgotten Frontier Conversion Module",
		"Forgotten Frontier Evacuation Center",
		"Unsecured Frontier Digital Nexus",
		"Unsecured Frontier Trinary Hub",

		// Class 5
		"Core Garrison",
		"Core Stronghold",
		"Oruze Osobnyk",
		"Quarantine Area",
		"Forgotten Core Data Field",
		"Forgotten Core Information Pen",
		"Unsecured Frontier Enclave Relay",
		"Unsecured Frontier Server Bank",

		// Class 6
		"Core Citadel",
		"Core Bastion",
		"Strange Energy Readings",
		"The Mirror",
		"Forgotten Core Assembly Hall",
		"Forgotten Core Circuitry Disassembler",
		"Unsecured Core Backup Array",
		"Unsecured Core Emergence"
	];

	if (wormholeSignatures.indexOf(sigName) > -1) {
		return '<a href="http://eve-survival.org/wikka.php?wakka='+sigName.replace(/ /g, '')+'" target="_blank" class="siteLink">'+sigName+'</a>';
	}

	return sigName;
}

// Custom inlinecomplete + dropdown input
$.widget("custom.inlinecomplete", $.ui.autocomplete, {
	_create: function() {
		if (!this.element.is("input")) {
			this._selectInit();
		}

		// Invoke the parent function
		return this._super();
	},
	_value: function() {
		// Invoke the parent function
		var originalReturn = this._superApply(arguments);

		this.element.change();

		return originalReturn;
	},
	_suggest: function(items) {
		// if (this.element.val() != items[0].value) {
			// this.element.val(items[0].value.substr(0, this.element.val().length));
		// }

		// Invoke the parent function
		return this._super(items);
	},
	_initSource: function() {
		if ($.isArray(this.options.source)) {
			this.source = function(request, response) {
				var matcher = new RegExp("^" + $.ui.autocomplete.escapeRegex(request.term), "i");
				var results = new Array(); // results array
				var data = this.options.source;
				var maxSize = this.options.maxSize || 25; // maximum result size
				// simple loop for the options
				for (var i = 0, l = data.length; i < l; i++) {
					if (matcher.test(data[i])) {
						results.push(data[i]);

						if (maxSize && results.length > maxSize) {
							break;
						}
					}
				}
				 // send response
				 response(results);
			}
		} else {
			// Invoke the parent function
			return this._super();
		}
	},
	_close: function(event) {
		this.options.source = this.options.input_source ? this.options.input_source : this.options.source;

		// Invoke the parent function
		return this._super(event);
	},
	addToSelect: function(value) {
		this.options.select_added_value = value;
		this.options.select_source.unshift(value);
	},
	removeFromSelect: function(value) {
		if (value) {
			this.options.select_source.splice(value, 1);
		} else if (this.options.select_added_value) {
			this.options.select_source.splice(this.options.select_added_value, 1);
		}
		this.options.select_added_value = null;
	},
	_selectInit: function() {
		this.element.addClass("custom-combobox");
		this.wrapper = this.element;
		this.element = this.wrapper.find("input:first");
		this.select = this.wrapper.find("select:first").remove();

		this.options.input_source = this.options.source;
		this.options.select_source = this.select.children("option[value!='']").map(function() {
            return $.trim(this.text);
        }).toArray();

		this._createShowAllButton();
	},
	_createShowAllButton: function() {
        var that = this,
          wasOpen = false;

        $("<a>")
			.attr("tabIndex", that.element.prop("tabindex"))
			.attr("title", "")
			.appendTo(that.wrapper)
			.button({icons: {primary: "ui-icon-triangle-1-s"}, text: false})
			.removeClass("ui-corner-all")
			.addClass("custom-combobox-toggle ui-corner-right")
			.on("mousedown", function() {
				wasOpen = that.widget().is(":visible");
			})
			.on("click", function() {
				that.element.trigger("focus");

				// Close if already visible
				if (wasOpen) {
				  return;
				}

				// Pass empty string as value to search for, displaying all results
				that.options.source = that.options.select_source;
				that._search("");
			});
	},
});

// Initialize tablesorter plugin on signaturesWidget table
$("#sigTable").tablesorter({
	sortReset: true,
	widgets: ['saveSort'],
	textExtraction: {
		2: function(node) { return $(node).find("span").data("age"); }
	}
});

// Highlight signaturesWidget tr on click
$("#sigTable tbody").on("click", "tr", function(e) {
	if (e.metaKey || e.ctrlKey) {
		// ctrl or cmd key
		$(this).toggleClass("selected");
	} else if (e.shiftKey) {
		// shift key
		$(this).addClass("selected");
		$("#sigTable tbody tr.selected:first").nextUntil("#sigTable tbody tr.selected:last").addBack().add("#sigTable tbody tr.selected:last").addClass("selected");
	} else {
		$("#sigTable tbody tr.selected").removeClass("selected");
		$(this).addClass("selected");
	}
});

// Un-Highlight signaturesWidget tr on clicking outside
$(document).click(function(e) {
    if(!$(e.target).closest('#sigTable tbody').length && !$(e.target).closest('#edit-signature').length && !$(e.target).closest('#delete-signature').length) {
		$("#sigTable tbody tr.selected").removeClass("selected");
    }
});

// Monitor custom 'classchange' event
$("#sigTable tbody").on("classchange", "tr", function(e, className) {
	// Trigger signaturesWidget selected row change custom event
	if (className === "selected") {
		$("#signaturesWidget").trigger("selected:change");
	}
});

// Update signaturesWidget based on .selected rows change
$("#signaturesWidget").on("selected:change", function() {
	// Enable/Disable delete icon
	if ($("#sigTable tr.selected").length === 0) {
		$("#signaturesWidget #delete-signature").addClass("disabled");
	} else {
		$("#signaturesWidget #delete-signature").removeClass("disabled");
	}

	// Enable/Disable edit icon
	if ($("#sigTable tr.selected").length === 1) {
		$("#signaturesWidget #edit-signature").removeClass("disabled");
	} else {
		$("#signaturesWidget #edit-signature").addClass("disabled");
	}
})

$("#dialog-error").dialog({
	autoOpen: false,
	resizable: false,
	minHeight: 0,
	dialogClass: "ui-dialog-shadow dialog-noeffect dialog-modal",
	buttons: {
		Ok: function() {
			$(this).dialog("close");
		}
	},
	create: function() {
		$(this).dialog("option", "show", {effect: "shake", duration: 150, easing: "easeOutElastic"});
	}
});

$("#dialog-msg").dialog({
	autoOpen: false,
	resizable: false,
	minHeight: 0,
	dialogClass: "ui-dialog-shadow dialog-noeffect dialog-modal",
	buttons: {
		Ok: function() {
			$(this).dialog("close");
		}
	}
});

$("#dialog-confirm").dialog({
	autoOpen: false,
	resizable: false,
	minHeight: 0,
	dialogClass: "ui-dialog-shadow dialog-noeffect dialog-modal",
	buttons: {
		Cancel: function() {
			$(this).dialog("close");
		}
	}
});

if (window.location.href.indexOf("galileo") != -1) {
	Notify.trigger("This is the test version of Tripwire.<br/>Please use <a href='https://tripwire.cloud-things.com'>Tripwire</a>")
}
