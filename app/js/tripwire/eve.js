// Handles data from EVE in-game data
tripwire.EVE = function(EVE, characterChange) {
    var systemChange = this.client.EVE && this.client.EVE.systemChange || false;

    if (EVE) {
        // Automapper
        if (!characterChange) {
            // Did the system change or did it previously and we have yet to try an autoMapper call?
            if ((this.client.EVE && this.client.EVE.systemID != EVE.systemID) || systemChange == true) {
                systemChange = true;

                // Check if location was updated after the last ship update
                // if (moment(EVE.locationDate).isAfter(moment(this.client.EVE.shipDate))) {
                    systemChange = false;
                    tripwire.autoMapper(this.client.EVE.systemID, EVE.systemID);
                // }
            }
        }

        // System follower
        if (!characterChange && options.buttons.follow && (this.client.EVE && this.client.EVE.systemID != EVE.systemID) && $(".ui-dialog:visible").length == 0) {
            tripwire.systemChange(EVE.systemID);
        }

        if (!$("#search").hasClass("active")) {
            $("#currentSpan").show();
        }

        // Enable auto-mapper
        $("#toggle-automapper").removeClass("disabled");

        // Update current system
        if (EVE.systemID) {
            // add system to Leads To dropdown
            if ($("#dialog-signature [data-autocomplete='sigSystems']").hasClass("custom-combobox")) {
                $("#dialog-signature [data-autocomplete='sigSystems']").inlinecomplete("removeFromSelect");
                $("#dialog-signature [data-autocomplete='sigSystems']").inlinecomplete("addToSelect", tripwire.systems[EVE.systemID].name);
            }
            $("#EVEsystem").html(tripwire.systems[EVE.systemID].name).attr("href", ".?system="+ tripwire.systems[EVE.systemID].name);
        }
    } else {
        // Update current system
        $("#EVEsystem").html("");
        $("#currentSpan").hide();
        // Disable automapper
        $("#toggle-automapper").addClass("disabled");
        // remove system from Leads To dropdown
        if ($("#dialog-signature [data-autocomplete='sigSystems']").hasClass("custom-combobox")) {
            $("#dialog-signature [data-autocomplete='sigSystems']").inlinecomplete("removeFromSelect");
        }
    }

    this.client.EVE = {
        characterID: EVE.characterID,
        characterName: EVE.characterName,
        systemID: EVE.systemID,
        systemName: EVE.systemName,
        shipTypeID: EVE.shipTypeID,
        shipTypeName: EVE.shipTypeName,
        stationID: EVE.stationID,
        stationName: EVE.stationName,
        locationDate: EVE.locationDate,
        shipDate: EVE.shipDate,
        systemChange: systemChange
    };
}
