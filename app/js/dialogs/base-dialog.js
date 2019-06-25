// Dialog effects
$("#wrapper").addClass("transition");

$(document).on("dialogopen", ".ui-dialog", function (event, ui) {
	// Add additional full screen overlay for 2nd level dialog
	if ($(".ui-dialog:visible").length == 2 && $(this).hasClass("dialog-modal"))
		$("body").append($("<div id='overlay' class='overlay' />").css("z-index", $(this).css("z-index") - 1));
	else if ($("#overlay"))
		$("#overlay").css("z-index", $(this).css("z-index") - 1);

	if (!$(this).hasClass("dialog-noeffect"))
		$("#wrapper").addClass("blur");
});

$(document).on("dialogclose", ".ui-dialog", function (event, ui) {
	if (!$(".ui-dialog").is(":visible"))
		$("#wrapper").removeClass("blur");

	if ($(".ui-dialog:visible").length == 1)
		$("#overlay").remove();
	else if ($("#overlay"))
		$("#overlay").css("z-index", $(this).css("z-index") - 2);

	//if ($(".ui-dialog:visible").length == 0 && options.buttons.follow && viewingSystemID != tripwire.client.EVE.systemID)
	//	window.location = "?system="+tripwire.client.EVE.systemName;
});

// Signature overwrite
$(document).on("click", "#overwrite", function() {
	var payload = {"signatures": {"remove": []}, "systemID": viewingSystemID};
	var undo = [];

	var signature = tripwire.client.signatures[$(this).data("id")];
	if (signature.type != "wormhole") {
		undo.push(signature);
		payload.signatures.remove.push(signature.id);
	} else {
		var wormhole = $.map(tripwire.client.wormholes, function(wormhole) { if (wormhole.initialID == signature.id || wormhole.secondaryID == signature.id) return wormhole; })[0];
		undo.push({"wormhole": wormhole, "signatures": [tripwire.client.signatures[wormhole.initialID], tripwire.client.signatures[wormhole.secondaryID]]});
		payload.signatures.remove.push(wormhole);
	}

	$("#overwrite").attr("disable", true);

	var success = function(data) {
		if (data.resultSet && data.resultSet[0].result == true) {
			ValidationTooltips.close();

			$("#undo").removeClass("disabled");
			if (viewingSystemID in tripwire.signatures.undo) {
				tripwire.signatures.undo[viewingSystemID].push({action: "remove", signatures: undo});
			} else {
				tripwire.signatures.undo[viewingSystemID] = [{action: "remove", signatures: undo}];
			}

			sessionStorage.setItem("tripwire_undo", JSON.stringify(tripwire.signatures.undo));

			if ($("#dialog-signature").parent().find(":button:contains('Save')")) {
				$("#dialog-signature").parent().find(":button:contains('Save')").click();
			} else {
				$("#dialog-signature").parent().find(":button:contains('Add')").click();
			}
		}
	}

	var always = function() {
		$("#overwrite").removeAttr("disable");
	}

	tripwire.refresh('refresh', payload, success, always);
});
