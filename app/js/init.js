var viewingSystem = $("meta[name=system]").attr("content");
var viewingSystemID = $("meta[name=systemID]").attr("content");
var server = $("meta[name=server]").attr("content");
var app_name = $("meta[name=app_name]").attr("content");
var version = $("meta[name=version]").attr("content");

// Page cache indicator
if (getCookie("loadedFromBrowserCache") == "true") {
	$("#pageTime").html("Page is Cached");
}

// setCookie('loadedFromBrowserCache', true);

// Use this to test performance of javascript code lines
// var startTime = window.performance.now();
// console.log("stint: "+ (window.performance.now() - startTime));
