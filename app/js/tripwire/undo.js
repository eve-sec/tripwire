tripwire.undo = function() {
    if (tripwire.signatures.undo[viewingSystemID].length > 0) {
        $("#undo").addClass("disabled");
        var lastIndex = tripwire.signatures.undo[viewingSystemID].length -1;
        var data = {"systemID": viewingSystemID, "signatures": {"add": [], "remove": [], "update": []}};

        var undoItem = tripwire.signatures.undo[viewingSystemID][lastIndex];
        var redo = $.map(undoItem.signatures, function(signature) {
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

        switch(undoItem.action) {
            case "add":
                data.signatures.remove = data.signatures.remove.concat($.map(undoItem.signatures, function(signature) { return signature.wormhole ? signature.wormhole : signature.id }));
                break;
            case "remove":
                data.signatures.add = data.signatures.add.concat(undoItem.signatures);
                break;
            case "update":
                data.signatures.update = data.signatures.update.concat(undoItem.signatures);
                break;
        }

        var success = function(data) {
            if (data.resultSet && data.resultSet[0].result == true) {
                tripwire.signatures.undo[viewingSystemID].pop();

                $("#redo").removeClass("disabled");
                if (viewingSystemID in tripwire.signatures.redo) {
                    if (undoItem.action == "remove") {
                        // we are adding new signatures we removed so we need the new ids
                        tripwire.signatures.redo[viewingSystemID].push({"action": undoItem.action, "signatures": data.results});
                    } else if (undoItem.action == "update") {
                        tripwire.signatures.redo[viewingSystemID].push({"action": undoItem.action, "signatures": redo});
                    } else {
                        tripwire.signatures.redo[viewingSystemID].push({"action": undoItem.action, "signatures": undoItem.signatures});
                    }
                } else {
                    if (undoItem.action == "remove") {
                        tripwire.signatures.redo[viewingSystemID] = [{"action": undoItem.action, "signatures": data.results}];
                    } else if (undoItem.action == "update") {
                        tripwire.signatures.redo[viewingSystemID] = [{"action": undoItem.action, "signatures": redo}];
                    } else {
                        tripwire.signatures.redo[viewingSystemID] = [{"action": undoItem.action, "signatures": undoItem.signatures}];
                    }
                }

                sessionStorage.setItem("tripwire_undo", JSON.stringify(tripwire.signatures.undo));
                sessionStorage.setItem("tripwire_redo", JSON.stringify(tripwire.signatures.redo));
            }
        }

        var always = function(data) {
            if (tripwire.signatures.undo[viewingSystemID].length > 0) {
                $("#undo").removeClass("disabled");
            }
        }

        tripwire.refresh('refresh', data, success, always);
    }
}
