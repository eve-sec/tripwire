tripwire.autoMapper = function(from, to) {
    var pods = [33328, 670];
    var undo = [];

    // Convert from & to from system name to system ID for diagnostic testing
    // from = viewingSystemID;
    // to = Object.index(tripwire.systems, 'name', to);

    // Make sure the automapper is turned on & not disabled
    if (!$("#toggle-automapper").hasClass("active") || $("#toggle-automapper").hasClass("disabled"))
        return false;

    // Make sure from and to are valid systems
    if (!tripwire.systems[from] || !tripwire.systems[to])
        return false;

    // Make sure from and to are not the same system
    if (from == to)
        return false;

    // Is pilot in a station?
    if (tripwire.client.EVE && tripwire.client.EVE.stationID)
        return false;

    // Is pilot in a pod?
    // if (tripwire.client.EVE && tripwire.client.EVE.shipTypeID && $.inArray(parseInt(tripwire.client.EVE.shipTypeID), pods) >= 0)
    //     return false;

    // Is this a gate?
    if (typeof(tripwire.map.shortest[from - 30000000]) != "undefined" && typeof(tripwire.map.shortest[from - 30000000][to - 30000000]) != "undefined")
        return false;

     // Is this an existing connection?
     if ($.map(tripwire.client.wormholes,
               function(wormhole) {
                 const initial = tripwire.client.signatures[wormhole.initialID];
                 const secondary = tripwire.client.signatures[wormhole.secondaryID];
                 return initial && secondary &&
                   ((initial.systemID == from && secondary.systemID == to) ||
                    (initial.systemID == to && secondary.systemID == from))  ? wormhole : null;
               }).length > 0) {
       return false;
     }

    var payload = {"signatures": {"add": [], "update": []}};
    var sig, toClass;

    if (tripwire.systems[to].class)
        toClass = "Class-" + tripwire.systems[to].class;
    else if (tripwire.systems[to].security >= 0.45)
        toClass = "High-Sec";
    else if (tripwire.systems[to].security > 0)
        toClass = "Low-Sec";
    else
        toClass = "Null-Sec";

    var wormholes = $.map(tripwire.client.wormholes, function(wormhole) {
        // Find wormholes that have no set Leads To system, and their initial system is from the wormhole we just jumped from
        if (tripwire.client.signatures[wormhole.initialID].systemID == from && !tripwire.systems[tripwire.client.signatures[wormhole.secondaryID].systemID]) {
            if (tripwire.aSigSystems[tripwire.client.signatures[wormhole.secondaryID].systemID] == toClass) {
                // Find wormholes that Leads To is generically set to the class we just jumped into
                return wormhole;
            } else if (wormhole.type && tripwire.wormholes[wormhole.type] && tripwire.wormholes[wormhole.type].leadsTo.replace(' ', '-') == toClass) {
                // Find wormholes that Type is known to lead to the class we just jumped into
                return wormhole;
            } else if (tripwire.client.signatures[wormhole.secondaryID].systemID === null && (!wormhole.type || !tripwire.wormholes[wormhole.type])) {
                // Find wormholes that don't have a Type or any kind of Leads To entered
                return wormhole;
            }
        }
    });

    if (wormholes.length) {
        if (wormholes.length > 1) {
            $("#dialog-select-signature").dialog({
                autoOpen: true,
                title: "Which Signature?",
                width: 390,
                buttons: {
                    Cancel: function() {
                        $(this).dialog("close");
                    },
                    Ok: function() {
                        var i = $("#dialog-select-signature [name=sig]:checked").val();
                        var wormhole = wormholes[i];
                        var signature = tripwire.client.signatures[wormhole.initialID];
                        var signature2 = tripwire.client.signatures[wormhole.secondaryID];

                        payload.signatures.update.push({
                            "wormhole": {
                                "id": wormhole.id
                            },
                            "signatures": [
                                {
                                    "id": signature.id
                                },
                                {
                                    "id": signature2.id,
                                    "systemID": to
                                }
                            ]
                        });

                        var success = function(data) {
                            if (data.resultSet && data.resultSet[0].result == true) {
                                undo.push({"wormhole": wormhole, "signatures": [signature, signature2]});
                                $("#dialog-select-signature").dialog("close");
                            }
                        }

                        tripwire.refresh('refresh', payload, success);
                    }
                },
                open: function() {
                    $("#dialog-select-signature .optionsTable tbody").empty();

                    $.each(wormholes, function(i) {
                        var signature = tripwire.client.signatures[wormholes[i].initialID];
                        var signatureRow = $("#sigTable tr[data-id='"+signature.id+"']").html();
                        var tr = "<tr>"
                          + "<td><input type='radio' name='sig' value='"+i+"' id='sig"+i+"' /></td>"
                          + signatureRow
                          + "</tr>";

                        $("#dialog-select-signature .optionsTable tbody").append(tr);
                        $("#dialog-select-signature .optionsTable tbody td").wrapInner("<label for='sig"+i+"' />");
                    });
                }
            });
        } else {
            var wormhole = wormholes[0];
            var signature = tripwire.client.signatures[wormhole.initialID];
            var signature2 = tripwire.client.signatures[wormhole.secondaryID];

            payload.signatures.update.push({
                "wormhole": {
                    "id": wormhole.id
                },
                "signatures": [
                    {
                        "id": signature.id
                    },
                    {
                        "id": signature2.id,
                        "systemID": to
                    }
                ]
            });
            undo.push({"wormhole": wormhole, "signatures": [signature, signature2]});
        }
    } else {
        // Nothing matches, create a new wormhole
        payload.signatures.add.push({
            "wormhole": {
                "type": null,
                "parent": "initial",
                "life": "stable",
                "mass": "stable"
            },
            "signatures": [
                {
                    "systemID": from,
                    "type": "wormhole"
                },
                {
                    "systemID": to,
                    "type": "wormhole"
                }
            ]
        });
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

        tripwire.refresh('refresh', payload, success);
    }
}
