tripwire.redo = function() {
    if (tripwire.signatures.redo[viewingSystemID].length > 0) {
        $("#redo").addClass("disabled");
        var lastIndex = tripwire.signatures.redo[viewingSystemID].length -1;
        var data = {"systemID": viewingSystemID, "signatures": {"add": [], "remove": [], "update": []}};

        var redoItem = tripwire.signatures.redo[viewingSystemID][lastIndex];
        var undo = $.map(redoItem.signatures, function(signature) {
            // grab the current signature so we can restore the way it is now
            if (signature.wormhole && tripwire.client.wormholes[signature.wormhole.id]) {
                // it was a wormhole and still is
                return {"wormhole": tripwire.client.wormholes[signature.wormhole.id], "signatures": [tripwire.client.signatures[signature.signatures[0].id], tripwire.client.signatures[signature.signatures[1].id]]};
            } else if (tripwire.client.signatures[signature.id] && tripwire.client.signatures[signature.id].type == "wormhole") {
                // it was a regular signature but is now a wormhole
                var wormhole = $.map(tripwire.client.wormholes, function(wormhole) { if (wormhole.initialID == signature.id || wormhole.secondaryID == signature.id) return wormhole; })[0];
                return {"wormhole": wormhole, "signatures": [tripwire.client.signatures[wormhole.initialID], tripwire.client.signatures[wormhole.secondaryID]]};
            } else if (signature.wormhole && tripwire.client.signatures[signature.signatures[0].id]) {
                // it was a wormhole but is now a regular signature
                return tripwire.client.signatures[signature.signatures[0].id];
            } else {
                // it was a regular signature and still is
                return tripwire.client.signatures[signature.id];
            }
        });

        switch(redoItem.action) {
            case "add":
                data.signatures.add = data.signatures.add.concat(redoItem.signatures);
                break;
            case "remove":
                data.signatures.remove = data.signatures.remove.concat($.map(redoItem.signatures, function(signature) { return signature.wormhole ? signature.wormhole : signature.id }));
                break;
            case "update":
                data.signatures.update = data.signatures.update.concat(redoItem.signatures);
                break;
        }

        var success = function(data) {
            if (data.resultSet && data.resultSet[0].result == true) {
                tripwire.signatures.redo[viewingSystemID].pop();

                $("#undo").removeClass("disabled");
                if (viewingSystemID in tripwire.signatures.undo) {
                    if (redoItem.action == "add") {
                        // we are adding new signatures we removed so we need the new ids
                        tripwire.signatures.undo[viewingSystemID].push({"action": redoItem.action, "signatures": data.results});
                    } else if (redoItem.action == "update") {
                        tripwire.signatures.undo[viewingSystemID].push({"action": redoItem.action, "signatures": undo});
                    } else {
                        tripwire.signatures.undo[viewingSystemID].push({action: redoItem.action, signatures: redoItem.signatures});
                    }
                } else {
                    if (redoItem.action == "add") {
                        tripwire.signatures.undo[viewingSystemID] = [{"action": redoItem.action, "signatures": data.results}];
                    } else if (redoItem.action == "update") {
                        tripwire.signatures.undo[viewingSystemID] = [{"action": redoItem.action, "signatures": undo}];
                    } else {
                        tripwire.signatures.undo[viewingSystemID] = [{action: redoItem.action, signatures: redoItem.signatures}];
                    }
                }

                sessionStorage.setItem("tripwire_redo", JSON.stringify(tripwire.signatures.redo));
                sessionStorage.setItem("tripwire_undo", JSON.stringify(tripwire.signatures.undo));
            }
        }

        var always = function(data) {
            if (tripwire.signatures.redo[viewingSystemID].length > 0) {
                $("#redo").removeClass("disabled");
            }
        }

        tripwire.refresh('refresh', data, success, always);
    }
}
