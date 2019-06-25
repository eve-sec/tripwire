// Change the currently viewed system
tripwire.systemChange = function(systemID, mode) {
    if (mode != "init") {
        $("#infoSecurity").removeClass();
        $("#infoStatics").empty();

        viewingSystem = tripwire.systems[systemID].name;
        viewingSystemID = systemID;

        // Reset activity
        activity.refresh(true);

        // Reset signatures
        $("#sigTable span[data-age]").countdown("destroy");
        $("#sigTable tbody").empty();
        $("#signature-count").html(0);
        tripwire.signatures.list = {};
        tripwire.client.signatures = null;

        // Reset chain map
        chain.redraw();

        // Reset comments
        $("#notesWidget .content .comment:visible").remove();
        tripwire.comments.data = null;

        // Change the URL & history
        history.replaceState(null, null, "?system="+viewingSystem);

        tripwire.refresh("change");
    }

    // Change the title
    document.title = tripwire.systems[systemID].name + " - " + app_name;

    $("#infoSystem").text(tripwire.systems[systemID].name);

    // Current system favorite
    $.inArray(parseInt(viewingSystemID), options.favorites) != -1 ? $("#system-favorite").attr("data-icon", "star").addClass("active") : $("#system-favorite").attr("data-icon", "star-empty").removeClass("active");

    if (tripwire.systems[systemID].class) {
        // Security
        $("#infoSecurity").html("<span class='wh pointer'>Class " + tripwire.systems[systemID].class + "</span>");

        // Effects
        if (tripwire.systems[systemID].effect) {
            var tooltip = "<table cellpadding=\"0\" cellspacing=\"1\">";
            for (var x in tripwire.effects[tripwire.systems[systemID].effect]) {
                var effect = tripwire.effects[tripwire.systems[systemID].effect][x].name;
                var base = tripwire.effects[tripwire.systems[systemID].effect][x].base;
                var bad = tripwire.effects[tripwire.systems[systemID].effect][x].bad;
                var whClass = tripwire.systems[systemID].class > 6 ? 6 : tripwire.systems[systemID].class;
                var modifier = 0;

                switch (Math.abs(base)) {
                    case 15:
                        modifier = base > 0 ? 7 : -7;
                        break;
                    case 30:
                        modifier = base > 0 ? 14 : -14;
                        break;
                    case 60:
                        modifier = base > 0 ? 28 : -28;
                        break;
                }

                tooltip += "<tr><td>" + effect + "</td><td style=\"padding-left: 25px; text-align: right;\" class=\"" + (bad ? "critical" : "stable") + "\">";
                tooltip += base + (modifier * (whClass -1)) + "%</td></tr>";
            }
            tooltip += "</table>";
            $("#infoSecurity").append("&nbsp;<span class='pointer' data-tooltip='" + tooltip + "'>" + tripwire.systems[systemID].effect + "</span>");
            Tooltips.attach($("#infoSecurity [data-tooltip]"));
        }

        // Statics
        for (var x in tripwire.systems[systemID].statics) {
            var type = tripwire.systems[systemID].statics[x];
            var wormhole = tripwire.wormholes[type];
            var color = "wh";

            switch (wormhole.leadsTo) {
                case "High-Sec":
                    color = "hisec";
                    break;
                case "Low-Sec":
                    color = "lowsec";
                    break;
                case "Null-Sec":
                    color = "nullsec";
                    break;
            }

            $("#infoStatics").append("<div><span class='"+ color +"'>&#9679;</span> <b>"+ wormhole.leadsTo +"</b> via <span class='"+ color +"'>"+ type +"</span></div>");
        }

        // Faction
        $("#infoFaction").html("&nbsp;");
    } else {
        // Security
        if (tripwire.systems[systemID].security >= 0.45) {
            $("#infoSecurity").addClass("hisec").text("High-Sec " + tripwire.systems[systemID].security);
        } else if (tripwire.systems[systemID].security > 0.0) {
            $("#infoSecurity").addClass("lowsec").text("Low-Sec " + tripwire.systems[systemID].security);
        } else {
            $("#infoSecurity").addClass("nullsec").text("Null-Sec " + tripwire.systems[systemID].security);
        }

        // Faction
        $("#infoFaction").html(tripwire.systems[systemID].factionID ? tripwire.factions[tripwire.systems[systemID].factionID].name : "&nbsp;");
    }

    // Region
    $("#infoRegion").text(tripwire.regions[tripwire.systems[systemID].regionID].name);

    // Info Links
    $("#infoWidget .infoLink").each(function() {
        this.href = $(this).data("href").replace(/\$systemName/gi, tripwire.systems[systemID].name).replace(/\$systemID/gi, systemID);
    });

    // Reset undo/redo
    tripwire.signatures.undo[systemID] && tripwire.signatures.undo[systemID].length > 0 ? $("#undo").removeClass("disabled") : $("#undo").addClass("disabled");
    tripwire.signatures.redo[systemID] && tripwire.signatures.redo[systemID].length > 0 ? $("#redo").removeClass("disabled") : $("#redo").addClass("disabled");

    // Reset delete signature icon
    $("#sigTable tr.selected").length == 0 ? $("#signaturesWidget #delete-signature").addClass("disabled") : $("#signaturesWidget #delete-signature").removeClass("disabled");
}
tripwire.systemChange(viewingSystemID, "init");
