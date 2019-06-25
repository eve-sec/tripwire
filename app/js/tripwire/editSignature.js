// Handles changing Signatures section
// ToDo: Use native JS
tripwire.editSig = function(edit, disabled) {
    var disabled = disabled || false;
    var wormhole = {};

    if (edit.type == "wormhole") {
        var wormhole = $.map(tripwire.client.wormholes, function(wormhole) { if (wormhole.initialID == edit.id || wormhole.secondaryID == edit.id) return wormhole; })[0];
        if (!wormhole) return false;
        var otherSignature = edit.id == wormhole.initialID ? tripwire.client.signatures[wormhole.secondaryID] : tripwire.client.signatures[wormhole.initialID];
        if (!otherSignature) return false;

        if (edit.name) {
          leadsTo = tripwire.systems[otherSignature.systemID] ? "<a href='.?system="+tripwire.systems[otherSignature.systemID].name+"'>"+edit.name+"</a>" : edit.name;
        } else if (tripwire.aSigSystems[otherSignature.systemID]) {
            leadsTo = tripwire.aSigSystems[otherSignature.systemID];
        } else if (tripwire.systems[otherSignature.systemID]) {
            leadsTo = "<a href='.?system="+tripwire.systems[otherSignature.systemID].name+"'>"+tripwire.systems[otherSignature.systemID].name+"</a>";
        } else {
            leadsTo = "";
        }

        var row = "<tr data-id='"+edit.id+"' data-tooltip='' "+ (disabled ? 'disabled="disabled"' : '') +">"
            + "<td class='"+ options.signatures.alignment.sigID +"'>"+(edit.signatureID ? edit.signatureID.substring(0, 3)+"-"+(edit.signatureID.substring(3, 6) || "###") : "???-###")+"</td>"
            + "<td class='type-tooltip "+ options.signatures.alignment.sigType +"' data-tooltip=\""+this.whTooltip(wormhole)+"\">"+(wormhole[wormhole.parent+"ID"] == edit.id ? wormhole.type || "" : (wormhole.parent ? "K162" : ""))+"</td>"
            + "<td class='age-tooltip "+ options.signatures.alignment.sigAge + (parseInt(edit.lifeLength) === 0 ? " disabled" : "") +"' data-tooltip='"+this.ageTooltip(edit)+"'><span data-age='"+edit.lifeTime+"'></span></td>"
            + "<td class='"+ options.signatures.alignment.leadsTo +"'>"+(leadsTo || "")+"</td>"
            + "<td class='"+wormhole.life+" "+ options.signatures.alignment.sigLife +"'>"+wormhole.life+"</td>"
            + "<td class='"+wormhole.mass+" "+ options.signatures.alignment.sigMass +"'>"+wormhole.mass+"</td>"
            + "</tr>";

        var tr = $(row);
    } else {
        var row = "<tr data-id='"+edit.id+"' data-tooltip='' "+ (disabled ? 'disabled="disabled"' : '') +">"
            + "<td class='"+ options.signatures.alignment.sigID +"'>"+(edit.signatureID ? edit.signatureID.substring(0, 3)+"-"+(edit.signatureID.substring(3, 6) || "###") : "???-###")+"</td>"
            + "<td class='"+ options.signatures.alignment.sigType +"'>"+edit.type+"</td>"
            + "<td class='age-tooltip "+ options.signatures.alignment.sigAge + (parseInt(edit.lifeLength) === 0 ? " disabled" : "") +"' data-tooltip='"+this.ageTooltip(edit)+"'><span data-age='"+edit.lifeTime+"'></span></td>"
            + "<td class='"+ options.signatures.alignment.leadsTo +"' colspan='3'>"+(edit.name?linkSig(edit.name):'')+"</td>"
            + "</tr>";

        var tr = $(row);
    }

    Tooltips.attach($(tr).find("[data-tooltip]"));

    // Destroy the pervious countdown to prevent errors on a non-existant DOM element
    $("#sigTable tr[data-id='"+edit.id+"']").find('span[data-age]').countdown("destroy");
    $("#sigTable tr[data-id='"+edit.id+"']").replaceWith(tr);

    $("#sigTable").trigger("update");
    // Update counter
    if (wormhole.life == "critical") {
        $(tr).find('span[data-age]').countdown({until: moment.utc(edit.lifeLeft).toDate(), onExpiry: this.pastEOL, alwaysExpire: true, compact: true, format: this.ageFormat, serverSync: this.serverTime.getTime})
            .addClass('critical');
    } else {
        $(tr).find('span[data-age]').countdown({since: moment.utc(edit.lifeTime).toDate(), compact: true, format: this.ageFormat, serverSync: this.serverTime.getTime});
    }

    $(tr).effect("pulsate");
}
