//"use strict"
//var startTime = window.performance.now();

/* Tripwire Core */
var tripwire = new function() {
	this.timer, this.xhr;
	this.version = "0.8.6";
	this.client = {signatures: {}};
	this.server = {signatures: {}};
	this.signatures = {list: {}, undo: JSON.parse(sessionStorage.getItem("tripwire_undo")) || {}, redo: JSON.parse(sessionStorage.getItem("tripwire_redo")) || {}};
	this.activity = {};
	this.data = {tracking: {}, esi: {}};
	this.refreshRate = 5000;
	this.connected = true;
	this.ageFormat = "HM";
	this.instance = window.name ? window.name : (new Date().getTime() / 1000, window.name = new Date().getTime() / 1000);



	this.init = function() {
		this.chainMap(); // Required to call .parse() during init()
		this.comments();
		this.serverTime(); // ?? so we can access inside function to get time?
		this.sync('init'); // Get initial info

		this.esi();
		this.serverStatus(); // Get TQ status
		this.pasteSignatures();
		this.systemChange(viewingSystemID, "init");
	}

	// Use delayed init to speed up rendering
	setTimeout("tripwire.init();", 50);
}
