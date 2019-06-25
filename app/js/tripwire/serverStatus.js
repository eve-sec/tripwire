// Handles pulling TQ status & player count
tripwire.serverStatus = function() {
    this.data;
    this.timer;

    clearTimeout(tripwire.serverStatus.timer);

    tripwire.esi.eveStatus()
        .always(function(data) {
            if (data && data.players && data.players > 0) {
                if (!tripwire.serverStatus.data || tripwire.serverStatus.data.players !== data.players) {
                    $('#serverStatus').html("<span class='"+(data.players > 0 ? 'stable' : 'critical')+"'>TQ</span>: "+numFormat(data.players));

                    if (tripwire.serverStatus.data) {
                        $("#serverStatus").effect('pulsate', {times: 5});
                    }
                }

                tripwire.serverStatus.data = data;
            } else {
                $('#serverStatus').html("<span class='critical'>TQ</span>");
            }

            tripwire.serverStatus.timer = setTimeout("tripwire.serverStatus();", 15000);
        });
}
tripwire.serverStatus();
