$("#admin").click(function(e) {
	e.preventDefault();

	if ($(this).hasClass("disabled")) {
		return false;
	}

	if (!$("#dialog-admin").hasClass("ui-dialog-content")) {
		var refreshTimer = null;
		var $total = null;
		var $ajax = null;

		function refreshWindow() {
			if ($ajax) $ajax.abort();
			$total.html("Total: " + $("#dialog-admin .window .hasFocus table tr[data-id]").length);

			$ajax = $.ajax({
				url: "admin.php",
				type: "POST",
				data: {mode: $("#dialog-admin .menu .active").attr("data-window")},
				dataType: "JSON"
			}).done(function(data) {
				if (data && data.results) {
					var rows = data.results;
					var ids = [];

					for (var i = 0, l = rows.length; i < l; i++) {
						var $row = $("#dialog-admin .window .hasFocus tbody tr[data-id='"+ rows[i].id +"']");
						ids.push(rows[i].id);

						if ($row.length) {
							for (col in rows[i]) {
								var $col = $row.find("[data-col='"+col+"']");
								$col.html(($col.attr("data-format") == "number" ? numFormat(rows[i][col]) : rows[i][col]) || "&nbsp;");
							}
						} else {
							$row = $("#dialog-admin .window .hasFocus table tr.hidden").clone();
							$row.attr("data-id", rows[i].id);

							for (col in rows[i]) {
								var $col = $row.find("[data-col='"+col+"']");
								$col.html(($col.attr("data-format") == "number" ? numFormat(rows[i][col]) : rows[i][col]) || "&nbsp;");
							}

							$row.removeClass("hidden");

							$("#dialog-admin .window .hasFocus tbody").append($row);
						}
					}

					$("#dialog-admin .window .hasFocus table tr[data-id]").each(function() {
						if ($.inArray($(this).data("id").toString(), ids) == -1) {
							$(this).remove();
						}
					});

					$("#dialog-admin .window .hasFocus table").trigger("update", [true]);
				} else {
					$("#dialog-admin .window .hasFocus table tr[data-id]").remove();
				}

				$total.html("Total: " + $("#dialog-admin .window .hasFocus table tr[data-id]").length);
			});

			if ($("#dialog-admin").dialog("isOpen") && $("#dialog-admin .menu .active").attr("data-refresh")) {
				refreshTimer = setTimeout(refreshWindow, $("#dialog-admin .menu .active").attr("data-refresh"));
			}
		}

		$("#dialog-admin").dialog({
			autoOpen: true,
			modal: true,
			height: 350,
			width: 800,
			buttons: {
				Close: function() {
					$(this).dialog("close");
				}
			},
			create: function() {
				// menu toggle
				$("#dialog-admin").on("click", ".menu li", function(e) {
					e.preventDefault();
					$menuItem = $(this);
					clearTimeout(refreshTimer);

					$("#dialog-admin .menu .active").removeClass("active");
					$menuItem.addClass("active");
					$("div.ui-dialog[aria-describedby='dialog-admin'] .ui-dialog-traypane").html("");

					$("#dialog-admin .window [data-window]").removeClass("hasFocus").hide();
					$("#dialog-admin .window [data-window='"+ $menuItem.data("window") +"']").addClass("hasFocus").show();

					refreshWindow();
				});

				$("#dialog-admin [data-sortable='true']").tablesorter({
					sortReset: true,
					widgets: ['saveSort'],
					sortList: [[0,0]]
				});

				// dialog bottom tray
				$($(this)[0].parentElement).find(".ui-dialog-buttonpane").append("<div class='ui-dialog-traypane'></div>");
				$total = $("div.ui-dialog[aria-describedby='dialog-admin'] .ui-dialog-traypane");
			},
			open: function() {
				$menuItem = $("#dialog-admin .menu li.active");
				refreshWindow();
			},
			close: function() {
				clearTimeout(refreshTimer);
			}
		});
	} else if (!$("#dialog-admin").dialog("isOpen")) {
		$("#dialog-admin").dialog("open");
	}
});
