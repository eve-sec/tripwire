$("body").on("dblclick", ".comment", function(e) {
	e.preventDefault();
	document.getSelection().removeAllRanges();
	$(this).find(".commentEdit").click();
})

$("body").on("click", ".commentEdit", function(e) {
	e.preventDefault();

	// Prevent multiple editors
	if ($(".cke").length) return false;

	var $comment = $(this).closest(".comment");

	$comment.find(".commentToolbar").hide();

	CKEDITOR.replace($comment.find(".commentBody").attr("id"), CKConfig).on("instanceReady", function() {
		$comment.find(".commentStatus").html("");
		$comment.find(".commentFooter").show();
		$comment.find(".commentFooter .commentControls").show();
	});

	tripwire.activity.editComment = $comment.data("id");
	tripwire.refresh('refresh');
});

$("body").on("click", ".commentSave, .commentCancel", function(e) {
	e.preventDefault();
	var $this = $(this);
	if ($this.attr("disabled")) return false;

	var $comment = $this.closest(".comment");
	$this.attr("disabled", "true");

	if ($this.hasClass("commentSave")) {
		var data = {"mode": "save", "commentID": $comment.data("id"), "systemID": $comment.find(".commentSticky").hasClass("active") ? 0 : viewingSystemID, "comment": CKEDITOR.instances[$comment.find(".commentBody").attr("id")].getData()};

		$.ajax({
			url: "comments.php",
			type: "POST",
			data: data,
			dataType: "JSON"
		}).done(function(data) {
			if (data && data.result == true) {
				$comment.find(".commentModified").html("Edited by " + data.comment.modifiedByName + " at " + data.comment.modifiedDate);
				$comment.find(".commentCreated").html("Posted by " + data.comment.createdByName + " at " + data.comment.createdDate);
				Tooltips.attach($comment.find("[data-tooltip]"));

				CKEDITOR.instances[$comment.find(".commentBody").attr("id")].destroy(false);
				$comment.attr("data-id", data.comment.id);
				$comment.find(".commentToolbar").show();
				$comment.find(".commentFooter").hide();
				$this.removeAttr("disabled");
			}
		});
	} else {
		CKEDITOR.instances[$comment.find(".commentBody").attr("id")].destroy(true);

		if (!$comment.attr("data-id")) {
			$comment.remove();
		} else {
			$comment.find(".commentToolbar").show();
			$comment.find(".commentFooter").hide();
			$this.removeAttr("disabled");
		}
	}

	$comment.find(".commentStatus").html("");

	delete tripwire.activity.editComment;
	tripwire.refresh('refresh');
});

$("body").on("click", ".commentDelete", function(e) {
	e.preventDefault();
	var $comment = $(this).closest(".comment");

	// check if dialog is open
	if (!$("#dialog-deleteComment").hasClass("ui-dialog-content")) {
		$("#dialog-deleteComment").data("comment", $comment).dialog({
			resizable: false,
			minHeight: 0,
			position: {my: "center", at: "center", of: $("#notesWidget")},
			dialogClass: "dialog-noeffect ui-dialog-shadow",
			buttons: {
				Delete: function() {
					// Prevent duplicate submitting
					$("#dialog-deleteComment").parent().find(":button:contains('Delete')").button("disable");

					var $comment = $(this).data("comment");
					var data = {"mode": "delete", "commentID": $comment.data("id")};

					$.ajax({
						url: "comments.php",
						type: "POST",
						data: data,
						dataType: "JSON"
					}).done(function(data) {
						if (data && data.result == true) {
							$("#dialog-deleteComment").dialog("close");
							$comment.remove();
						}
					}).always(function() {
						$("#dialog-deleteComment").parent().find(":button:contains('Delete')").button("enable");
					});
				},
				Cancel: function() {
					$(this).dialog("close");
				}
			}
		});
	} else if (!$("#dialog-deleteComment").dialog("isOpen")) {
		$("#dialog-deleteComment").data("comment", $comment).dialog("open");
	}
});

$("body").on("click", "#add-comment", function(e) {
	e.preventDefault();

	// Prevent multiple editors
	if ($(".cke").length) return false;

	var $comment = $(".comment:last").clone();
	var commentID = $(".comment:visible:last .commentBody").attr("id") ? $(".comment:visible:last .commentBody").attr("id").replace("comment", "") + 1 : 0;
	$(".comment:last").before($comment);

	$comment.find(".commentBody").attr("id", "comment" + commentID);
	$comment.removeClass("hidden").find(".commentEdit").click();
});

$("body").on("click", ".commentSticky", function(e) {
	e.preventDefault();
	var $comment = $(this).closest(".comment");

	var data = {"mode": "sticky", "commentID": $comment.data("id"), "systemID": $comment.find(".commentSticky").hasClass("active") ? viewingSystemID : 0};

	$.ajax({
		url: "comments.php",
		type: "POST",
		data: data,
		dataType: "JSON"
	}).done(function(data) {
		if (data && data.result == true) {
			$comment.find(".commentSticky").hasClass("active") ? $comment.find(".commentSticky").removeClass("active") : $comment.find(".commentSticky").addClass("active");
		}
	});
});
