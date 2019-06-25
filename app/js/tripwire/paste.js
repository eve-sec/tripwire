// Handles pasting sigs from EVE
tripwire.pasteSignatures = function() {
    var processing = false;

    var rowParse = function(row) {
        var scanner = {};
        var columns = row.split("	"); // Split by tab
        var validScanGroups = ["Cosmic Signature", "Cosmic Anomaly", "Kosmische Anomalie", "Kosmische Signatur",
                                "Скрытый сигнал", "Космическая аномалия"];
        var validTypes = {"Gas Site": "Gas", "Data Site": "Data", "Relic Site": "Relic", "Ore Site": "Ore", "Combat Site": "Combat", "Wormhole": "Wormhole",
                            "Gasgebiet": "Gas", "Datengebiet": "Data", "Reliktgebiet": "Relic", "Mineraliengebiet": "Ore", "Kampfgebiet": "Combat", "Wurmloch": "Wormhole",
                            "Газовый район": "Gas", "Информационный район": "Data", "Археологический район": "Relic", "Астероидный район": "Ore", "Боевой район": "Combat", "Червоточина": "Wormhole"};

        for (var x in columns) {
            if (columns[x].match(/^([A-Z]{3}[-]\d{3})$/)) {
                scanner.id = columns[x].split("-");
                continue;
            }

            if (columns[x].match(/(\d([.|,]\d)?[ ]?(%))/) || columns[x].match(/(\d[.|,]?\d+\s(AU|AE|km|m|а.е.|км|м))/i)) { // Exclude scan % || AU
                continue;
            }

            if ($.inArray(columns[x], validScanGroups) != -1) {
                scanner.scanGroup = columns[x];
                continue;
            }

            if (validTypes[columns[x]]) {
                scanner.type = validTypes[columns[x]];
                continue;
            }

            if (columns[x] != "") {
                scanner.name = columns[x];
            }
        }

        if (!scanner.id || scanner.id.length !== 2) {
            return false;
        }

        return scanner;
    }

    this.pasteSignatures.parsePaste = function(paste) {
        var paste = paste.split("\n");
        var payload = {"signatures": {"add": [], "update": []}, "systemID": viewingSystemID};
        var undo = [];
        processing = true;

        for (var i in paste) {
            var scanner = rowParse(paste[i]);

            if (scanner.id) {
                var signature = $.map(tripwire.client.signatures, function(signature) { if (signature.signatureID && signature.signatureID.toUpperCase() == scanner.id[0] + scanner.id[1]) return signature; })[0];
                if (signature) {
                    // Update signature (only non-wormholes can be updated to a wormhole)
                    if (scanner.type == "Wormhole" && signature.type != "wormhole") {
                        var wormhole = $.map(tripwire.client.wormholes, function(wormhole) { if (wormhole.initialID == signature.id || wormhole.secondaryID == signature.id) return wormhole; })[0] || {};
                        var otherSignature = wormhole.id ? (signature.id == wormhole.initialID ? tripwire.client.signatures[wormhole.secondaryID] : tripwire.client.signatures[wormhole.initialID]) : {};
                        payload.signatures.update.push({
                            "wormhole": {
                                "id": wormhole.id || null,
                                "type": wormhole.type || null,
                                "life": wormhole.life || "stable",
                                "mass": wormhole.mass || "stable"
                            },
                            "signatures": [
                                {
                                    "id": signature.id,
                                    "signatureID": signature.signatureID,
                                    "systemID": viewingSystemID,
                                    "type": "wormhole",
                                    "name": signature.name
                                },
                                {
                                    "id": otherSignature.id || null,
                                    "signatureID": otherSignature.signatureID || null,
                                    "systemID": otherSignature.systemID || null,
                                    "type": "wormhole",
                                    "name": otherSignature.name
                                }
                            ]
                        });

                        if (tripwire.client.wormholes[wormhole.id]) {
							undo.push({"wormhole": tripwire.client.wormholes[wormhole.id], "signatures": [tripwire.client.signatures[signature.id], tripwire.client.signatures[otherSignature.id]]});
						} else {
							// used to be just a regular signature
							undo.push(tripwire.client.signatures[signature.id]);
						}
                    // Make sure we are only updating when we have new info (we never turn wormholes into regular signatures)
                    } else if (signature.type != "wormhole" && ((scanner.type && scanner.type.toLowerCase() != signature.type) || (scanner.name && scanner.name != signature.name))) {
                        payload.signatures.update.push({
                            "id": signature.id,
                            "systemID": viewingSystemID,
                            "type": scanner.type || 'unknown',
                            "name": scanner.name,
                            "lifeLength": options.signatures.pasteLife * 60 * 60
                        });
                        undo.push(tripwire.client.signatures[signature.id]);
                    }
                } else {
                    // Add signature
                    if (scanner.type == "Wormhole") {
                        payload.signatures.add.push({
                            "wormhole": {
                                "type": null,
                                "parent": "initial",
                                "life": "stable",
                                "mass": "stable"
                            },
                            "signatures": [
                                {
                                    "signatureID": scanner.id[0] + scanner.id[1],
                                    "systemID": viewingSystemID,
                                    "type": "wormhole",
                                    "lifeLength": options.signatures.pasteLife * 60 * 60
                                },
                                {
                                    "signatureID": null,
                                    "systemID": null,
                                    "type": "wormhole",
                                    "lifeLength": options.signatures.pasteLife * 60 * 60
                                }
                            ]
                        });
                    } else {
                        payload.signatures.add.push({
                            "signatureID": scanner.id[0] + scanner.id[1],
                            "systemID": viewingSystemID,
                            "type": scanner.type || 'unknown',
                            "name": scanner.name,
                            "lifeLength": options.signatures.pasteLife * 60 * 60
                        });
                    }
                }
            }
        }

        if (payload.signatures.add.length || payload.signatures.update.length) {
            var success = function(data) {
                if (data.resultSet && data.resultSet[0].result == true) {
                    $("#undo").removeClass("disabled");

                    if (data.results) {
                        if (viewingSystemID in tripwire.signatures.undo) {
                            tripwire.signatures.undo[viewingSystemID].push({action: "add", signatures: data.results});
                        } else {
                            tripwire.signatures.undo[viewingSystemID] = [{action: "add", signatures: data.results}];
                        }
                    }

                    if (undo.length) {
                        if (viewingSystemID in tripwire.signatures.undo) {
                            tripwire.signatures.undo[viewingSystemID].push({action: "update", signatures: undo});
						} else {
                            tripwire.signatures.undo[viewingSystemID] = [{action: "update", signatures: undo}];
						}
                    }

                    sessionStorage.setItem("tripwire_undo", JSON.stringify(tripwire.signatures.undo));
                }
            }

            var always = function(data) {
                processing = false;
            }

            tripwire.refresh('refresh', payload, success, always);
        } else {
            processing = false;
        }
    }

    this.pasteSignatures.init = function() {
        $(document).keydown(function(e)	{
            if ((e.metaKey || e.ctrlKey) && (e.keyCode == 86 || e.keyCode == 91) && !processing) {
                //Abort - user is in input or textarea
                if ($(document.activeElement).is("textarea, input")) return;

                $("#clipboard").focus();
            }
        });

        $("body").on("click", "#fullPaste", function(e) {
            e.preventDefault();

            var paste = $(this).data("paste").split("\n");
            var pasteIDs = [];
            var removes = [];
            var undo = [];

            for (var i in paste) {
                if (scan = rowParse(paste[i])) {
                    pasteIDs.push((scan.id[0] + scan.id[1]).toLowerCase());
                }
            }

            for (var i in tripwire.client.signatures) {
                var signature = tripwire.client.signatures[i];

                if (signature.systemID == viewingSystemID && signature.signatureID && $.inArray(signature.signatureID.toLowerCase(), pasteIDs) === -1 && signature.signatureID !== "???") {
                    if (signature.type == "wormhole") {
                        var wormhole = $.map(tripwire.client.wormholes, function(wormhole) { if (wormhole.initialID == signature.id || wormhole.secondaryID == signature.id) return wormhole; })[0] || {};
                        var otherSignature = wormhole.id ? (signature.id == wormhole.initialID ? tripwire.client.signatures[wormhole.secondaryID] : tripwire.client.signatures[wormhole.initialID]) : {};
                        if (wormhole.type !== "GATE") {
                            removes.push(wormhole);
                            undo.push({"wormhole": wormhole, "signatures": [signature, otherSignature]});
                        }
                    } else {
                        removes.push(signature.id);
                        undo.push(signature);
                    }
                }
            }

            if (removes.length > 0) {
                var payload = {"signatures": {"remove": removes}};

                var success = function(data) {
                    if (data.resultSet && data.resultSet[0].result == true) {
                        $("#undo").removeClass("disabled");
                        if (viewingSystemID in tripwire.signatures.undo) {
                            tripwire.signatures.undo[viewingSystemID].push({action: "remove", signatures: undo});
                        } else {
                            tripwire.signatures.undo[viewingSystemID] = [{action: "remove", signatures: undo}];
                        }

                        sessionStorage.setItem("tripwire_undo", JSON.stringify(tripwire.signatures.undo));
                    }
                }

                tripwire.refresh('refresh', payload, success);
            }
        });

        $("#clipboard").on("paste", function(e) {
            e.preventDefault();
            var paste = window.clipboardData ? window.clipboardData.getData("Text") : (e.originalEvent || e).clipboardData.getData('text/plain');

            $("#clipboard").blur();
            Notify.trigger("Paste detected<br/>(<a id='fullPaste' href=''>Click to delete missing sigs</a>)");
            $("#fullPaste").data("paste", paste);
            tripwire.pasteSignatures.parsePaste(paste);
        });
    }

    this.pasteSignatures.init();
}
tripwire.pasteSignatures();
