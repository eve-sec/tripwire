var options = new function() {
	var localOverrides = ["grid"];
	var localOptions = JSON.parse(localStorage.getItem("tripwire_options"));
	var saveTimer;

	this.userID = init.userID;
	this.character = {id: init.characterID, name: init.characterName};
	this.background = null;
	this.uiscale = 1.0;
	this.favorites = [];
	this.grid = {};
	this.tracking = {active: "new"};
	this.masks = {active: init.corporationID + ".2"};
	this.chain = {typeFormat: null, classFormat: null, gridlines: true, active: 0, tabs: [], "node-reference": "type", zoom: 1.0};
	this.signatures = {editType: "unknown", copySeparator: ",", pasteLife: 72, alignment: {sigID: "centerAlign", sigType: "centerAlign", sigAge: "centerAlign", leadsTo: "centerAlign", sigLife: "centerAlign", sigMass: "centerAlign"}};
	this.buttons = {follow: false, chainWidget: {viewing: false, favorites: false}, signaturesWidget: {autoMapper: false}};

	this.saveDelay = function(delay) {
		if (saveTimer) clearTimeout(saveTimer);

		saveTimer = setTimeout("options.save()", delay);
	};

	// Saves options in both cookie and database
	this.save = function() {
		var options = JSON.stringify(window.options.get());

		localStorage.setItem("tripwire_options", options);

		return $.ajax({
			url: "options.php",
			data: {mode: "set", options: options},
			type: "POST",
			dataType: "JSON"
		});
	};

	// Loads options via passed object else cookie
	this.load = function(data) {
		if (data && typeof(data) != "undefined") {
			this.set(this, data);
		} else if (localOptions) {
			this.set(this, localOptions);
		}

		this.apply();
	};

	// Gets options from this by exluding types == function
	this.get = function() {
		var data = {};

		for (var x in this) {
			if (typeof(this[x]) != "function") {
				data[x] = this[x];
			}
		}

		return data;
	};

	// Sets this from passed object
	this.set = function(local, data) {
		for (var prop in data) {
			if (data[prop] && data[prop].constructor && data[prop].constructor === Object) {
				if (local) {
					this.set(local[prop], data[prop]);
				}
			} else if (local && typeof(local[prop]) != "undefined") {
				local[prop] = data[prop];
			}
		}
	};

	this.reset = function() {
		for (var x in this) {
			if (typeof(this[x]) != "function") {
				this[x] = JSON.parse(JSON.stringify(this.reset.defaults[x]));
			}
		}
	};

	// Applies settings
	this.apply = function() {
		// Local browser overrides
		if (localOptions) {
            for (key in localOverrides) {
                this[localOverrides[key]] = localOptions[localOverrides[key]];
			}
		}

		// Grid layout (detect old IGB setting options)
		if (this.grid.hasOwnProperty("oog") && !isEmpty(this.grid.oog)) {
			$.each(this.grid.oog, function() {
				$("#"+this.id).attr({"data-col": this.col, "data-row": this.row, "data-sizex": this.size_x, "data-sizey": this.size_y})
					.css({width: this.width, height: this.height});
			});
		} else if (!isEmpty(this.grid)) {
			$.each(this.grid, function() {
				$("#"+this.id).attr({"data-col": this.col, "data-row": this.row, "data-sizex": this.size_x, "data-sizey": this.size_y})
					.css({width: this.width, height: this.height});
			});
		}

		// Make sure favorites are all ints and not strings
		this.favorites = $.map(this.favorites, function(favorite) {
			return parseInt(favorite);
		});

		// Buttons
		if (this.buttons.follow) $("#follow").addClass("active");
		if (this.buttons.chainWidget.home) $("#home").addClass("active");
		if (this.buttons.chainWidget.kspace) $("#k-space").addClass("active");
		if (this.buttons.chainWidget.viewing) $("#show-viewing").addClass("active");
		if (this.buttons.chainWidget.favorites) $("#show-favorite").addClass("active");
		if (this.buttons.chainWidget.evescout) $("#eve-scout").addClass("active");
		if ($.inArray(parseInt(viewingSystemID), this.favorites) !== -1) $("#system-favorite").attr("data-icon", "star").addClass("active");
		if (this.buttons.signaturesWidget.autoMapper) $("#toggle-automapper").addClass("active");

		// UI Scale
		if (this.uiscale) {
			$("body").css("zoom", this.uiscale);
		}

		// Chain zoom
		if (this.chain.zoom) {
			$("#chainParent").css("zoom", this.chain.zoom);
		}

		// Background
		if (this.background) {
			var a = $('<a>', { href:this.background } )[0];
			$("#wrapper").attr("style", "background-image: url(https://" + a.hostname + a.pathname + a.search + ");");
		} else {
			$("#wrapper").attr("style", "");
		}

		// Characters in Options
		$("#dialog-options #characters").html("<img src='https://image.eveonline.com/Character/"+init.characterID+"_64.jpg' />");

		// Active mask
		$("#dialog-options input[name='mask']").filter("[value='"+this.masks.active+"']").attr("checked", true);

		// Chain tabs
		$("#chainTabs").html("");
		for (var x in this.chain.tabs) {
			if (this.chain.tabs[x]) {
				var $tab = $("#chainTab .tab").clone();

				$tab.attr("id", x).find(".name").data("tab", this.chain.tabs[x].systemID).html(this.chain.tabs[x].name);
				if (x == this.chain.active) { $tab.addClass("current"); }

				$("#chainTabs").append($tab);
			}
		}

		// Draw chain if Tripwire is initialized
		if (typeof(tripwire) !== "undefined") {
			chain.redraw();
		}
	};

	this.reset.defaults = JSON.parse(JSON.stringify(this.get()));
	this.load(init && init.options ? init.options : null);
}
