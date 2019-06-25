var grid = $(".gridster ul").gridster({
	widget_selector: "li.gridWidget",
	avoid_overlapped_widgets: false,
	widget_base_dimensions: [50, 50],
	widget_margins: [5, 5],
	autogrow_cols: true,
	helper: "clone",
	draggable: {
		start: function(e, ui) {
			$("div.gridster").width($("div.gridster ul").width());
		}
	},
	resize: {
    	enabled: true,
    	handle_class: "grid-resize",
    	max_size: [30, 30],
    	min_size: [4, 4],
    	start: function(e) {
    		$("div.gridster").width($("div.gridster ul").width());
    	},
    	stop: function(e, ui, $widget) {
    		//var width = parseInt($(".gridster").css("margin-left")) + this.container_width;
    		//$("#wrapper").css({width: width + "px"})
    		switch ($widget.attr("id")) {
    			case "infoWidget":
    				setTimeout("activity.redraw();", 300);
    				break;
    		}
    	}
	},
	serialize_params: function($w, wgd) {
		return {
			id: $w.attr("id"),
			col: wgd.col,
			row: wgd.row,
			size_x: wgd.size_x,
			size_y: wgd.size_y,
			width: $w.width(),
			height: $w.height()
		}
	}
}).data("gridster").disable();

grid.disable_resize();
$(".grid-resize").addClass("hidden").attr("data-icon", "resize");

$(".gridster").css({visibility: "visible"});
$(".gridster > *").addClass("gridster-transition");

$("#layout").click(function() {
	if (!$(this).hasClass("active")) {
		grid.enable();
		grid.enable_resize();
		$(".grid-resize").removeClass("hidden");

		$(this).addClass("active");
	} else {
		grid.disable();
		grid.disable_resize();
		$(".grid-resize").addClass("hidden");

		$(this).removeClass("active");

		options.grid = grid.serialize();

		options.save();
	}
});
