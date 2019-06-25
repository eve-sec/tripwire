var CKConfig = {
	skin: "custom",
	height: 100,
	allowedContent: true,
	extraPlugins: "toolbarswitch,autogrow,autolink",
	enterMode: CKEDITOR.ENTER_BR,
	removeDialogTabs: 'link:advanced',
	autoGrow_onStartup: true,
	autoGrow_minHeight: 100,
	toolbar_minToolbar: [
		{name: "basicstyles", items: ["Bold", "Italic", "Underline", "Strike"]},
		{name: "paragraph", items: ["BulletedList", "Outdent", "Indent"]},
		{name: "links", items: ["Link"]},
		{name: "colors", items: ["TextColor", "BGColor"]},
		{name: "styles", items: ["FontSize"]},
		{name: "tools", items: ["Toolbarswitch"]}
	],
	toolbar_maxToolbar: [
		{name: "basicstyles", items: ["Bold", "Italic", "Underline", "Strike", "Subscript", "Superscript"]},
		{name: "paragraph", items: ["NumberedList", "BulletedList", "Outdent", "Indent"]},
		{name: "links", items: ["Link"]},
		{name: "colors", items: ["TextColor", "BGColor"]},
		{name: "styles", items: ["FontSize", "Font"]},
		{name: "tools", items: ["Source", "Toolbarswitch"]}
	],
	toolbar: "minToolbar",
	smallToolbar: "minToolbar",
	maximizedToolbar: "maxToolbar",
	fontSize_style: {
	    element:        'span',
	    styles:         { 'font-size': '#(size)' },
	    overrides:      [ { element :'font', attributes: { 'size': null } } ]
	}
}

CKEDITOR.on("instanceLoaded", function(cke) {
	cke.editor.on("contentDom", function() {
		cke.editor.on("key", function(e) {
			if (e.data.keyCode == 27) {
				// escape key cancels
				$(cke.editor.element.$).closest(".comment").find(".commentCancel").click();
				return false;
			} else if (e.data.domEvent.$.altKey && e.data.domEvent.$.keyCode == 83) {
				// alt+s saves
				$(cke.editor.element.$).closest(".comment").find(".commentSave").click();
				return false;
			}
		});
	});

	$(".cke_combo__font a")
		.removeClass("cke_combo_button")
		.addClass("cke_button cke_button_off")
		.html('<span class="cke_button_icon">&nbsp;</span>')

	$(".cke_combo__fontsize a")
		.removeClass("cke_combo_button")
		.addClass("cke_button cke_button_off")
		.html('<span class="cke_button_icon">&nbsp;</span>')
});

CKEDITOR.on("instanceReady", function(cke) {
	// ensure focus on init
	cke.editor.focus();

	var s = cke.editor.getSelection(); // getting selection
	var selected_ranges = s.getRanges(); // getting ranges
	var node = selected_ranges[0].startContainer; // selecting the starting node
	var parents = node.getParents(true);

	node = parents[parents.length - 2].getFirst();

	if (!node) return false;

	while (true) {
		var x = node.getNext();
		if (x == null) {
			break;
		}
		node = x;
	}

	s.selectElement(node);
	selected_ranges = s.getRanges();
	selected_ranges[0].collapse(false);  //  false collapses the range to the end of the selected node, true before the node.
	s.selectRanges(selected_ranges);  // putting the current selection there
});

CKEDITOR.on("dialogDefinition", function(ev) {
	if (ev.data.name == 'link') {
		ev.data.definition.getContents('target').get('linkTargetType')['default'] = '_blank';
	}
});
