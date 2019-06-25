// Handles API updates
tripwire.API = function() {
    this.indicator;
    this.APIrefresh;

    this.API.expire = function() {
        var options = {since: tripwire.API.APIrefresh, until: null, format: "MS", layout: "-{mnn}{sep}{snn}"};
        $("#APItimer").countdown("option", options);
    }

    this.API.refresh = function() {
        $.ajax({
            url: "api_update.php",
            cache: false,
            dataType: "JSON",
            data: "indicator="+tripwire.API.indicator
        }).done(function(data) {
            if (data && data.APIrefresh) {
                tripwire.API.indicator = data.indicator;
                tripwire.API.APIrefresh = new Date(data.APIrefresh);
                activity.refresh(); //Refresh graph

                var options = {until: tripwire.API.APIrefresh, since: null, layout: "{mnn}{sep}{snn}"};
                $("#APItimer").countdown("option", options);
                setTimeout("tripwire.API.refresh();", $.countdown.periodsToSeconds($("#APItimer").countdown('getTimes')) - 30);
            } else if ($("#APItimer").countdown("option", "layout") !== "-{mnn}{sep}{snn}" && $.countdown.periodsToSeconds($("#APItimer").countdown('getTimes')) > 120) {
                setTimeout("tripwire.API.refresh();", ($.countdown.periodsToSeconds($("#APItimer").countdown('getTimes')) - 30) * 1000);
            } else {
                setTimeout("tripwire.API.refresh();", 15000);
            }
        });
    }

    this.API.init = function() {
        $.ajax({
            url: "api_update.php",
            cache: true,
            dataType: "JSON",
            data: "init=true"
        }).done(function(data) {
            tripwire.API.indicator = data.indicator;
            tripwire.API.APIrefresh = new Date(data.APIrefresh);

            $("#APItimer").countdown({until: tripwire.API.APIrefresh, onExpiry: tripwire.API.expire, alwaysExpire: true, compact: true, format: "MS", serverSync: tripwire.serverTime.getTime, onTick: function(t) { $("#APIclock").val(t[5] + 1).trigger("change"); }})
            var timer = $("#APItimer").countdown("option", "layout") === "-{mnn}{sep}{snn}" ? 15 : $.countdown.periodsToSeconds($("#APItimer").countdown('getTimes')) - 30;
            setTimeout("tripwire.API.refresh();", timer * 1000);
        });
    }

    this.API.init();
}
// tripwire.API();
