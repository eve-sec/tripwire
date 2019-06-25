// Hanldes adding to Signatures section
// ToDo: Use native JS
tripwire.addSig = function(add, option, disabled) {
    var option = option || {};
    var animate = typeof(option.animate) !== 'undefined' ? option.animate : true;
    var disabled = disabled || false;
    var wormhole = {};

    if (add.type == "wormhole") {
        var wormhole = $.map(tripwire.client.wormholes, function(wormhole) { if (wormhole.initialID == add.id || wormhole.secondaryID == add.id) return wormhole; })[0];
        if (!wormhole) return false;
        var otherSignature = add.id == wormhole.initialID ? tripwire.client.signatures[wormhole.secondaryID] : tripwire.client.signatures[wormhole.initialID];
        if (!otherSignature) return false;

        if (add.name) {
          leadsTo = tripwire.systems[otherSignature.systemID] ? "<a href='.?system="+tripwire.systems[otherSignature.systemID].name+"'>"+add.name+"</a>" : add.name;
        } else if (tripwire.aSigSystems[otherSignature.systemID]) {
            leadsTo = tripwire.aSigSystems[otherSignature.systemID];
        } else if (tripwire.systems[otherSignature.systemID]) {
            leadsTo = "<a href='.?system="+tripwire.systems[otherSignature.systemID].name+"'>"+tripwire.systems[otherSignature.systemID].name+"</a>";
        } else {
            leadsTo = "";
        }

        var row = "<tr data-id='"+add.id+"' data-tooltip='' "+ (disabled ? 'disabled="disabled"' : '') +">"
            + "<td class='"+ options.signatures.alignment.sigID +"'>"+(add.signatureID ? add.signatureID.substring(0, 3)+"-"+(add.signatureID.substring(3, 6) || "###") : "???-###")+"</td>"
            + "<td class='type-tooltip "+ options.signatures.alignment.sigType +"' data-tooltip=\""+this.whTooltip(wormhole)+"\">"+(wormhole[wormhole.parent+"ID"] == add.id ? wormhole.type || "" : (wormhole.parent ? "K162" : ""))+"</td>"
            + "<td class='age-tooltip "+ options.signatures.alignment.sigAge + (parseInt(add.lifeLength) === 0 ? " disabled" : "") +"' data-tooltip='"+this.ageTooltip(add)+"'><span data-age='"+add.lifeTime+"'></span></td>"
            + "<td class='"+ options.signatures.alignment.leadsTo +"'>"+(leadsTo || "")+"</td>"
            + "<td class='"+wormhole.life+" "+ options.signatures.alignment.sigLife +"'>"+wormhole.life+"</td>"
            + "<td class='"+wormhole.mass+" "+ options.signatures.alignment.sigMass +"'>"+wormhole.mass+"</td>"
            + "</tr>";

        var tr = $(row);
    } else {
        var row = "<tr data-id='"+add.id+"' data-tooltip='' "+ (disabled ? 'disabled="disabled"' : '') +">"
            + "<td class='"+ options.signatures.alignment.sigID +"'>"+(add.signatureID ? add.signatureID.substring(0, 3)+"-"+(add.signatureID.substring(3, 6) || "###") : "???-###")+"</td>"
            + "<td class='"+ options.signatures.alignment.sigType +"'>"+add.type+"</td>"
            + "<td class='age-tooltip "+ options.signatures.alignment.sigAge + (parseInt(add.lifeLength) === 0 ? " disabled" : "") +"' data-tooltip='"+this.ageTooltip(add)+"'><span data-age='"+add.lifeTime+"'></span></td>"
            + "<td class='"+ options.signatures.alignment.leadsTo +"' colspan='3'>"+(add.name?linkSig(add.name):'')+"</td>"
            + "</tr>";

        var tr = $(row);
    }

    Tooltips.attach($(tr).find("[data-tooltip]"));

    $("#sigTable").append(tr);

    $("#sigTable").trigger("update");

    // Add counter
    if (wormhole.life == "critical") {
        $(tr).find('span[data-age]').countdown({until: moment.utc(add.lifeLeft).toDate(), onExpiry: this.pastEOL, alwaysExpire: true, compact: true, format: this.ageFormat, serverSync: this.serverTime.getTime})
            // .countdown('pause')
            .addClass('critical')
            // .countdown('resume');
    } else {
        $(tr).find('span[data-age]').countdown({since: moment.utc(add.lifeTime).toDate(), compact: true, format: this.ageFormat, serverSync: this.serverTime.getTime});
    }

    if (animate) {
        $(tr)
            .find('td')
            .wrapInner('<div class="hidden" />')
            .parent()
            .find('td > div')
            .slideDown(700, function(){
                $set = $(this);
                $set.replaceWith($set.contents());
            });

        $(tr).find("td").animate({backgroundColor: "#004D16"}, 1000).delay(1000).animate({backgroundColor: "#111"}, 1000, null, function() {$(this).css({backgroundColor: ""});});
    }
}
