$("#sigTable tbody").on("dblclick", "tr", {mode: "dblclick-update"}, openSignatureDialog);
$("#edit-signature").on("click", {mode: "update"}, openSignatureDialog);
$("#add-signature").click({mode: "add"}, openSignatureDialog);

function openSignatureDialog(e) {
	e.preventDefault();
	mode = e.data.mode;
	element = this;

	if (mode == "dblclick-update") {
		$("#sigTable tr.selected").removeClass("selected");
		$(this).closest("tr").addClass("selected");
		mode = "update";
	} else if (mode == "update") {
		var elements = $("#sigTable tbody tr.selected");
		if (elements.length !== 1) {
			return false;
		} else {
			element = elements[0];
		}
	}

	if (!$("#dialog-signature").hasClass("ui-dialog-content")) {
		$("#dialog-signature").dialog({
			autoOpen: true,
			resizable: false,
			dialogClass: "dialog-noeffect ui-dialog-shadow",
			position: {my: "center", at: "center", of: $("#signaturesWidget")},
			buttons: {
				Save: function() {
					$("#form-signature").submit();
				},
				Add: function() {
					$("#form-signature").submit();
				},
				Cancel: function() {
					$(this).dialog("close");
				}
			},
			create: function() {
				var aSigWormholes = $.map(tripwire.wormholes, function(item, index) { return index;});
				aSigWormholes.splice(26, 0, "K162");
				aSigWormholes.push("GATE");
				aSigWormholes.push("SML");
				aSigWormholes.push("MED");
				aSigWormholes.push("LRG");
				aSigWormholes.push("XLG");

				$("#dialog-signature [name='signatureType'], #dialog-signature [name='signatureLife']").selectmenu({width: 100});
				$("#dialog-signature [name='wormholeLife'], #dialog-signature [name='wormholeMass']").selectmenu({width: 80});
				$("#dialog-signature [data-autocomplete='sigSystems']").inlinecomplete({source: tripwire.aSigSystems, maxSize: 10, delay: 0});
				$("#dialog-signature [data-autocomplete='sigType']").inlinecomplete({source: aSigWormholes, maxSize: 10, delay: 0});

				$("#dialog-signature #durationPicker").durationPicker();
				$("#dialog-signature #durationPicker").on("change", function() {
					// prevent negative values
					if (this.value < 0) {
						this.value = 0;
						$(this).change();
					}
				});

				// Ensure first signature ID field only accepts letters
				$("#dialog-signature [name='signatureID_Alpha'], #dialog-signature [name='signatureID2_Alpha']").on("input", function() {
					while (!/^[a-zA-Z?]*$/g.test(this.value)) {
						this.value = this.value.substring(0, this.value.length -1);
					}
				});

				// Move to the numeric ID after filling out alpha ID
				$("#dialog-signature [name='signatureID_Alpha']").on("input", function() {
					if (this.value.length === 3) {
						$("#dialog-signature [name='signatureID_Numeric']").select();
					}
				});

				$("#dialog-signature [name='signatureID2_Alpha']").on("input", function() {
					if (this.value.length === 3) {
						$("#dialog-signature [name='signatureID2_Numeric']").select();
					}
				});

				// Ensure second signature ID field only accepts numbers
				$("#dialog-signature [name='signatureID_Numeric'], #dialog-signature [name='signatureID2_Numeric']").on("input", function() {
					while (!/^[0-9?]*$/g.test(this.value)) {
						this.value = this.value.substring(0, this.value.length -1);
					}
				});

				// Select value on click
				$("#dialog-signature .signatureID, #dialog-signature .wormholeType").on("click", function() {
					$(this).select();
				});

				// Auto fill opposite side wormhole w/ K162
				$("#dialog-signature .wormholeType").on("input, change", function() {
					if (this.value.length > 0 && $.inArray(this.value.toUpperCase(), aSigWormholes) != -1 && this.value.toUpperCase() != "K162") {
						$("#dialog-signature .wormholeType").not(this).val("K162");

						// Also auto calculate duration
						if (tripwire.wormholes[this.value.toUpperCase()]) {
							$("#dialog-signature #durationPicker").val(tripwire.wormholes[this.value.toUpperCase()].life.substring(0, 2) * 60 * 60).change();
						}
					} else if (this.value.toUpperCase() === "K162") {
						if ($.inArray($("#dialog-signature .wormholeType").not(this).val().toUpperCase(), aSigWormholes) === -1 || $("#dialog-signature .wormholeType").not(this).val().toUpperCase() === "K162") {
							$("#dialog-signature .wormholeType").not(this).val("????");
						}
					} else if (this.value == "????") {
						$("#dialog-signature .wormholeType").not(this).val("K162");
					}
				});

				// Toggle between wormhole and regular signatures
				$("#dialog-signature").on("selectmenuchange", "[name='signatureType']", function() {
					if (this.value == "wormhole") {
						$("#dialog-signature #site").slideUp(200, function() { $(this).hide(0); });
						$("#dialog-signature #wormhole").slideDown(200, function() { $(this).show(200); });
					} else {
						$("#dialog-signature #site").slideDown(200, function() { $(this).show(200); });
						$("#dialog-signature #wormhole").slideUp(200, function() { $(this).hide(0); });
					}

					ValidationTooltips.close();
				});

				$("#form-signature").submit(function(e) {
					e.preventDefault();
					var form = $(this).serializeObject();
					var valid = true;
					ValidationTooltips.close();

					// Validate full signature ID fields (blank | 3 characters)
					$.each($("#dialog-signature .signatureID:visible"), function() {
						if (this.value.length > 0 && this.value.length < 3) {
							ValidationTooltips.open({target: $(this)}).setContent("Must be 3 characters in length!");
							$(this).select();
							valid = false;
							return false;
						}
					});
					if (!valid) return false;

					// Validate full signature ID doesn't already exist in current system
					if (form.signatureID_Alpha.length === 3 && form.signatureID_Numeric.length === 3 && Object.find(tripwire.client.signatures, "signatureID", form.signatureID_Alpha + form.signatureID_Numeric, true) != false && Object.find(tripwire.client.signatures, "signatureID", form.signatureID_Alpha + form.signatureID_Numeric, true).id != $("#dialog-signature").data("signatureid")) {
						var existingSignature = Object.find(tripwire.client.signatures, "signatureID", form.signatureID_Alpha + form.signatureID_Numeric);
						ValidationTooltips.open({target: $("#dialog-signature .signatureID:first")}).setContent("Signature ID already exists! <input type='button' autofocus='true' id='overwrite' value='Overwrite' style='margin-bottom: -4px; margin-top: -4px; font-size: 0.8em;' data-id='"+ existingSignature.id +"' />");
						$("#overwrite").focus();
						valid = false;
						return false;
					}
					if (!valid) return false;

					// Validate wormhole types (blank | wormhole)
					$.each($("#dialog-signature .wormholeType:visible"), function() {
						if (this.value.length > 0 && $.inArray(this.value.toUpperCase(), aSigWormholes) == -1 && this.value != "????") {
							ValidationTooltips.open({target: $(this)}).setContent("Must be a valid wormhole type!");
							$(this).select();
							valid = false;
							return false;
						}
					});
					if (!valid) return false;

					// Validate leads to system (blank | system)
					$.each($("#dialog-signature .leadsTo:visible"), function() {
						if (this.value.length > 0 && tripwire.aSigSystems.findIndex((item) => this.value.toLowerCase() === item.toLowerCase()) == -1) {
							ValidationTooltips.open({target: $(this)}).setContent("Must be a valid leads to system!");
							$(this).select();
							valid = false;
							return false;
						}
					});
					if (!valid) return false;

					// Validate leads to isn't the viewing system which causes a inner loop
					$.each($("#dialog-signature .leadsTo:visible"), function() {
						if (this.value.length > 0 && this.value.toLowerCase() === viewingSystem.toLowerCase()) {
							ValidationTooltips.open({target: $(this)}).setContent("Wormhole cannot lead to the same system it comes from!");
							$(this).select();
							valid = false;
							return false;
						}
					});
					if (!valid) return false;

					var payload = {};
					var undo = [];
					if (form.signatureType === "wormhole") {
						var signature = {
							"signatureID": form.signatureID_Alpha + form.signatureID_Numeric,
							"systemID": viewingSystemID,
							"type": "wormhole",
							"name": form.wormholeName,
							"lifeLength": form.signatureLength
						};
						var leadsTo = null;
						if (Object.index(tripwire.systems, "name", form.leadsTo, true)) {
							// Leads To is a normal EVE system, so use the sytem ID
							leadsTo = Object.index(tripwire.systems, "name", form.leadsTo, true)
						} else if (tripwire.wormholes[form.wormholeType.toUpperCase()]) {
							// Leads To can be determined by the wormhole type, so lets use what we know it leads to
							if (tripwire.aSigSystems.findIndex((item) => tripwire.wormholes[form.wormholeType.toUpperCase()].leadsTo.replace(' ', '-').toLowerCase() === item.toLowerCase()) > -1) {
								leadsTo = tripwire.aSigSystems.findIndex((item) => tripwire.wormholes[form.wormholeType.toUpperCase()].leadsTo.replace(' ', '-').toLowerCase() === item.toLowerCase());
							}
						} else if (tripwire.aSigSystems.findIndex((item) => form.leadsTo.toLowerCase() === item.toLowerCase()) !== -1) {
							// Leads To is one of the valid types we allow, so use of of those indexes as reference
							leadsTo = tripwire.aSigSystems.findIndex((item) => form.leadsTo.toLowerCase() === item.toLowerCase());
						}
						var signature2 = {
							"signatureID": form.signatureID2_Alpha + form.signatureID2_Numeric,
							"systemID": leadsTo,
							"type": "wormhole",
							"name": form.wormholeName2,
							"lifeLength": form.signatureLength
						};
						var type = null;
						var parent = null;
						if (form.wormholeType.length > 0 && $.inArray(form.wormholeType.toUpperCase(), aSigWormholes) != -1 && form.wormholeType.toUpperCase() != "K162") {
							parent = "initial";
							type = form.wormholeType.toUpperCase();
						} else if (form.wormholeType2.length > 0 && $.inArray(form.wormholeType2.toUpperCase(), aSigWormholes) != -1 && form.wormholeType2.toUpperCase() != "K162") {
							parent = "secondary";
							type = form.wormholeType2.toUpperCase();
						} else if (form.wormholeType.toUpperCase() == "K162") {
							parent = "secondary";
							type = "????";
						} else if (form.wormholeType2.toUpperCase() == "K162") {
							parent = "initial";
							type = "????";
						}
						var wormhole = {
							"type": type,
							"parent": parent,
							"life": form.wormholeLife,
							"mass": form.wormholeMass
						};
						if (mode == "update") {
							signature.id = $("#dialog-signature").data("signatureid");
							signature2.id = $("#dialog-signature").data("signature2id");
							wormhole.id = $("#dialog-signature").data("wormholeid");

							// Update the initial and type based on which side of the wormhole we are editing
							if (tripwire.client.wormholes[wormhole.id]) {
								if (form.wormholeType.length > 0 && $.inArray(form.wormholeType.toUpperCase(), aSigWormholes) != -1 && form.wormholeType.toUpperCase() != "K162") {
									wormhole.parent = tripwire.client.wormholes[wormhole.id].initialID == signature.id ? "initial" : "secondary";
									wormhole.type = form.wormholeType.toUpperCase();
								} else if (form.wormholeType2.length > 0 && $.inArray(form.wormholeType2.toUpperCase(), aSigWormholes) != -1 && form.wormholeType2.toUpperCase() != "K162") {
									wormhole.parent = tripwire.client.wormholes[wormhole.id].initialID == signature.id ? "secondary" : "initial";
									wormhole.type = form.wormholeType2.toUpperCase();
								} else if (form.wormholeType.toUpperCase() == "K162") {
									wormhole.parent = tripwire.client.wormholes[wormhole.id].initialID == signature.id ? "secondary" : "initial";
									wormhole.type = "????";
								} else if (form.wormholeType2.toUpperCase() == "K162") {
									wormhole.parent = tripwire.client.wormholes[wormhole.id].initialID == signature.id ? "initial" : "secondary";
									wormhole.type = "????";
								}
							}

							payload = {"signatures": {"update": [{"wormhole": wormhole, "signatures": [signature, signature2]}]}};

							if (tripwire.client.wormholes[wormhole.id]) {
									//used to be a wormhole
									undo.push({"wormhole": tripwire.client.wormholes[wormhole.id], "signatures": [tripwire.client.signatures[signature.id], tripwire.client.signatures[signature2.id]]});
							} else {
									// used to be just a regular signature
									undo.push(tripwire.client.signatures[signature.id]);
							}
						} else {
							payload = {"signatures": {"add": [{"wormhole": wormhole, "signatures": [signature, signature2]}]}};
						}
					} else {
						if (mode == "update") {
							var signature = {
								"id": $("#dialog-signature").data("signatureid"),
								"signatureID": form.signatureID_Alpha + form.signatureID_Numeric,
								"systemID": viewingSystemID,
								"type": form.signatureType,
								"name": form.signatureName,
								"lifeLength": form.signatureLength
							};
							payload = {"signatures": {"update": [signature]}};

							if (tripwire.client.signatures[signature.id].type == "wormhole") {
								//used to be a wormhole
								var wormhole = $.map(tripwire.client.wormholes, function(wormhole) { if (wormhole.initialID == signature.id || wormhole.secondaryID == signature.id) return wormhole; })[0];
								var signature2 = signature.id == wormhole.initialID ? tripwire.client.signatures[wormhole.secondaryID] : tripwire.client.signatures[wormhole.initialID];
								undo.push({"wormhole": tripwire.client.wormholes[wormhole.id], "signatures": [tripwire.client.signatures[signature.id], tripwire.client.signatures[signature2.id]]});
							} else {
								// used to be just a regular signature
								undo.push(tripwire.client.signatures[signature.id]);
							}
						} else {
							var signature = {
								"signatureID": form.signatureID_Alpha + form.signatureID_Numeric,
								"systemID": viewingSystemID,
								"type": form.signatureType,
								"name": form.signatureName,
								"lifeLength": form.signatureLength
							};
							payload = {"signatures": {"add": [signature]}};
						}
					}

					$("#dialog-signature").parent().find(":button:contains('Save')").button("disable");

					var success = function(data) {
						if (data.resultSet && data.resultSet[0].result == true) {
							$("#dialog-signature").dialog("close");

							$("#undo").removeClass("disabled");

							if (mode == "add") {
								undo = data.results;
							}
							if (viewingSystemID in tripwire.signatures.undo) {
								tripwire.signatures.undo[viewingSystemID].push({action: mode, signatures: undo});
							} else {
								tripwire.signatures.undo[viewingSystemID] = [{action: mode, signatures: undo}];
							}

							sessionStorage.setItem("tripwire_undo", JSON.stringify(tripwire.signatures.undo));
						}
					}

					var always = function() {
						$("#sigEditForm input[type=submit]").removeAttr("disabled");
						$("#dialog-signature").parent().find(":button:contains('Save')").button("enable");
					}

					tripwire.refresh('refresh', payload, success, always);
				});
			},
			open: function() {
				$("#dialog-signature").data("signatureid", "");
				$("#dialog-signature").data("signature2id", "");
				$("#dialog-signature").data("wormholeid", "");

				$("#dialog-signature input").val("");
				$("#dialog-signature [name='signatureType']").val("unknown").selectmenu("refresh");

				$("#dialog-signature [name='wormholeLife']").val("stable").selectmenu("refresh");
				$("#dialog-signature [name='wormholeMass']").val("stable").selectmenu("refresh");

				$("#dialog-signature #site").show();
				$("#dialog-signature #wormhole").hide();

				// Side labels
				$("#dialog-signature .sideLabel:first").html(viewingSystem + " Side");
				$("#dialog-signature .sideLabel:last").html("Other Side");

				// Default signature life
				$("#dialog-signature #durationPicker").val(options.signatures.pasteLife * 60 * 60).change();

				if (mode == "update" && $(element).data("id") && tripwire.client.signatures[$(element).data("id")]) {
					var id = $(element).data("id");
					var signature = tripwire.client.signatures[id];
					$("#dialog-signature").data("signatureid", id);

					// Change the dialog buttons
					$("#dialog-signature").parent().find("button:contains('Add')").hide();
					$("#dialog-signature").parent().find("button:contains('Save')").show();

					// Change the dialog title
					$("#dialog-signature").dialog("option", "title", "Edit Signature");

					if (signature.type == "wormhole") {
						var wormhole = $.map(tripwire.client.wormholes, function(wormhole) { if (wormhole.initialID == id || wormhole.secondaryID == id) return wormhole; })[0];
						var otherSignature = id == wormhole.initialID ? tripwire.client.signatures[wormhole.secondaryID] : tripwire.client.signatures[wormhole.initialID];
						$("#dialog-signature").data("signature2id", otherSignature.id);
						$("#dialog-signature").data("wormholeid", wormhole.id);

						$("#dialog-signature input[name='signatureID_Alpha']").val(signature.signatureID ? signature.signatureID.substr(0, 3) : "???");
						$("#dialog-signature input[name='signatureID_Numeric']").val(signature.signatureID ? signature.signatureID.substr(3, 5) : "");
						$("#dialog-signature [name='signatureType']").val(signature.type).selectmenu("refresh").trigger("selectmenuchange");
						$("#dialog-signature [name='wormholeName']").val(signature.name);
						$("#dialog-signature [name='leadsTo']").val(tripwire.systems[otherSignature.systemID] ? tripwire.systems[otherSignature.systemID].name : (tripwire.aSigSystems[otherSignature.systemID] ? tripwire.aSigSystems[otherSignature.systemID] : ""));

						$("#dialog-signature input[name='signatureID2_Alpha']").val(otherSignature.signatureID ? otherSignature.signatureID.substr(0, 3) : "???");
						$("#dialog-signature input[name='signatureID2_Numeric']").val(otherSignature.signatureID ? otherSignature.signatureID.substr(3, 5) : "");
						$("#dialog-signature [name='wormholeName2']").val(otherSignature.name);
						$("#dialog-signature [name='wormholeLife']").val(wormhole.life).selectmenu("refresh").trigger("selectmenuchange");
						$("#dialog-signature [name='wormholeMass']").val(wormhole.mass).selectmenu("refresh").trigger("selectmenuchange");

						if (wormhole[wormhole.parent+"ID"] == signature.id) {
							$("#dialog-signature input[name='wormholeType']").val(wormhole.type).change();
						} else if (wormhole[wormhole.parent+"ID"] == otherSignature.id) {
							$("#dialog-signature input[name='wormholeType2']").val(wormhole.type).change();
						}
						$("#dialog-signature #durationPicker").val(signature.lifeLength).change();
					} else {
						$("#dialog-signature input[name='signatureID_Alpha']").val(signature.signatureID ? signature.signatureID.substr(0, 3) : "???");
						$("#dialog-signature input[name='signatureID_Numeric']").val(signature.signatureID ? signature.signatureID.substr(3, 5) : "");
						$("#dialog-signature [name='signatureType']").val(signature.type).selectmenu("refresh").trigger("selectmenuchange");
						$("#dialog-signature [name='signatureName']").val(signature.name);
						$("#dialog-signature #durationPicker").val(signature.lifeLength).change();
					}

					// Heightlight first ID section
					$("#dialog-signature input[name='signatureID_Alpha']").select();
				} else {
					// Change the dialog buttons
					$("#dialog-signature").parent().find("button:contains('Add')").show();
					$("#dialog-signature").parent().find("button:contains('Save')").hide();

					// Change the dialog title
					$("#dialog-signature").dialog("option", "title", "Add Signature");

					$("#dialog-signature [name='signatureType']").val(options.signatures.editType || "unknown").selectmenu("refresh")
					if ($("#dialog-signature [name='signatureType']").val() === "wormhole") {
						$("#dialog-signature #site").hide();
						$("#dialog-signature #wormhole").show();
					}
				}
			},
			close: function() {
				ValidationTooltips.close();
				$("#sigTable tr.selected").removeClass("selected");
				$("#dialog-signature").data("signatureid", "");
				$("#dialog-signature").data("signature2id", "");
				$("#dialog-signature").data("wormholeid", "");
			}
		});
	} else if (!$("#dialog-signature").dialog("isOpen")) {
		$("#dialog-signature").dialog("open");
	}
};
