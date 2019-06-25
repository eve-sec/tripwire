$(".options").click(function(e) {
	e.preventDefault();

	if ($(this).hasClass("disabled"))
		return false;

	$("#dialog-options").dialog({
		autoOpen: false,
		width: 450,
		minHeight: 400,
		modal: true,
		buttons: {
			Save: function() {
				// Options
				var data = {mode: "set", options: JSON.stringify(options)};
				var maskChange = false;

				$("#dialog-options").parent().find(".ui-dialog-buttonpane button:contains('Save')").attr("disabled", true).addClass("ui-state-disabled");

				options.chain.typeFormat = $("#dialog-options #typeFormat").val();
				options.chain.classFormat = $("#dialog-options #classFormat").val();

				options.chain.gridlines = JSON.parse($("#dialog-options input[name=gridlines]:checked").val());

				options.chain["node-reference"] = $("#dialog-options input[name=node-reference]:checked").val();

				options.signatures.editType = $("#dialog-options #editType").val();

				options.signatures.pasteLife = $("#dialog-options #pasteLife").val();

				options.signatures.copySeparator = $("#dialog-options #copySeparator").val();

				options.background = $("#dialog-options #background-image").val();

				options.uiscale = $("#dialog-options #uiscale-slider").slider("value");

				if (options.masks.active != $("#dialog-options input[name='mask']:checked").val()) {
					maskChange = true;
				}

				options.masks.active = $("#dialog-options input[name='mask']:checked").val();

				options.apply();
				options.save() // Performs AJAX
					.done(function() {
						if (maskChange) {
							// Reset signatures
							$("#sigTable span[data-age]").countdown("destroy");
							$("#sigTable tbody").empty()
							$("#signature-count").html(0);
							tripwire.signatures.list = {};
							tripwire.client.signatures = [];

							tripwire.refresh('change');
						}
					});


				$("#dialog-options").dialog("close");
				$("#dialog-options").parent().find(".ui-dialog-buttonpane button:contains('Save')").attr("disabled", false).removeClass("ui-state-disabled");

				// toggle mask admin icon
				$("#dialog-options input[name='mask']:checked").data("admin") ? $("#admin").removeClass("disabled") : $("#admin").addClass("disabled");
			},
			Reset: function() {
				$("#dialog-confirm #msg").html("Settings will be reset to defaults temporarily.<br/><br/><p><em>Save settings to make changes permanent.</em></p>");
				$("#dialog-confirm").dialog("option", {
					buttons: {
						Reset: function() {
							options.reset();
							options.apply();

							$("#dialog-options").dialog("close");
							$(this).dialog("close");
						},
						Cancel: function() {
							$(this).dialog("close");
						}
					}
				}).dialog("open");
			},
			Close: function() {
				$(this).dialog("close");
			}
		},
		open: function() {
			// Get user stats data
			$.ajax({
				url: "user_stats.php",
				type: "POST",
				dataType: "JSON"
			}).done(function(data) {
				for (i in data.stats) {
					for (x in data.stats[i]) {
						$("#optionsAccordion #"+ x).text(data.stats[i][x]);
					}
				}

				$("#optionsAccordion #systems_visited").text(data.system_visits);
				$("#optionsAccordion #logins").text(data.account.logins);
				$("#optionsAccordion #lastLogin").text(data.account.lastLogin);
				$("#optionsAccordion #username").text(data.username);
			});

			// Get masks
			$.ajax({
				url: "masks.php",
				type: "POST",
				dataType: "JSON"
			}).done(function(response) {
				if (response && response.masks) {
					$("#dialog-options #masks #default").html("");
					$("#dialog-options #masks #personal").html("");
					$("#dialog-options #masks #corporate").html("");

					for (var x in response.masks) {
						var mask = response.masks[x];
						var node = $(''
							+ '<input type="radio" name="mask" id="mask'+x+'" value="'+mask.mask+'" class="selector" data-owner="'+mask.owner+'" data-admin="'+mask.admin+'" />'
							+ '<label for="mask'+x+'"><img src="'+mask.img+'" />'
							+  (mask.optional ? '<i class="closeIcon" onclick="return false;" data-icon="red-giant"><i data-icon="times"></i></i>' : '')
							+ '<span class="selector_label">'+mask.label+'</span></label>');

						$("#dialog-options #masks #"+mask.type).append(node);
					}

					var node = $(''
						+ '<input type="checkbox" name="find" id="findp" value="personal" class="selector" disabled="disabled" />'
						+ '<label for="findp"><i data-icon="search" style="font-size: 3em; margin-left: 16px; margin-top: 16px; display: block;"></i></label>');
					$("#dialog-options #masks #personal").append(node);

					if (init.admin == "1") {
						var node = $(''
							+ '<input type="checkbox" name="find" id="findc" value="corporate" class="selector" disabled="disabled" />'
							+ '<label for="findc"><i data-icon="search" style="font-size: 3em; margin-left: 16px; margin-top: 16px; display: block;"></i></label>');
						$("#dialog-options #masks #corporate").append(node);
					}

					$("#dialog-options input[name='mask']").filter("[value='"+response.masks[response.active].mask+"']").attr("checked", true).trigger("change");

					// toggle mask admin icon
					response.masks[response.active].admin ? $("#admin").removeClass("disabled") : $("#admin").addClass("disabled");
				}
			});

			$("#dialog-options #editType").val(options.signatures.editType);
			$("#dialog-options #pasteLife").val(options.signatures.pasteLife);
			$("#dialog-options #copySeparator").val(options.signatures.copySeparator);
			$("#dialog-options #typeFormat").val(options.chain.typeFormat);
			$("#dialog-options #classFormat").val(options.chain.classFormat);
			$("#dialog-options input[name='node-reference'][value='"+options.chain["node-reference"]+"']").prop("checked", true);
			$("#dialog-options input[name='gridlines'][value='"+options.chain.gridlines+"']").prop("checked", true);
			$("#dialog-options #background-image").val(options.background);
		},
		create: function() {
			$("#optionsAccordion").accordion({heightStyle: "content", collapsible: true, active: false});

			$("#uiscale-slider").slider({
				min: 0.7,
				max: 1.4,
				step: 0.05,
				value: options.uiscale || 1.0,
				change: function(e, ui) {
					$("body").css("zoom", ui.value);
				},
				slide: function(e, ui) {
					$("label[for='uiscale-slider']").html(ui.value);
				}
			});

			$("label[for='uiscale-slider']").html($("#uiscale-slider").slider("value"));

			$("#dialog-pwChange").dialog({
				autoOpen: false,
				resizable: false,
				minHeight: 0,
				dialogClass: "ui-dialog-shadow dialog-noeffect dialog-modal",
				buttons: {
					Save: function() {
						$("#pwForm").submit();
					},
					Cancel: function() {
						$(this).dialog("close");
					}
				},
				close: function() {
					$("#pwForm input[name='password'], #pwForm input[name='confirm']").val("");
					$("#pwError").text("").hide();
				}
			});

			$("#pwChange").click(function() {
				$("#dialog-pwChange").dialog("open");
			});

			$("#pwForm").submit(function(e) {
				e.preventDefault();

				$("#pwError").text("").hide();

				$.ajax({
					url: "options.php",
					type: "POST",
					data: $(this).serialize(),
					dataType: "JSON"
				}).done(function(response) {
					if (response && response.result) {
						$("#dialog-msg #msg").text("Password changed");
						$("#dialog-msg").dialog("open");

						$("#dialog-pwChange").dialog("close");
					} else if (response && response.error) {
						$("#pwError").text(response.error).show("slide", {direction: "up"});
					} else {
						$("#pwError").text("Unknown error").show("slide", {direction: "up"});
					}
				});
			});

			$("#dialog-usernameChange").dialog({
				autoOpen: false,
				resizable: false,
				minHeight: 0,
				dialogClass: "ui-dialog-shadow dialog-noeffect dialog-modal",
				buttons: {
					Save: function() {
						$("#usernameForm").submit();
					},
					Cancel: function() {
						$(this).dialog("close");
					}
				},
				open: function() {
					$("#usernameForm #username").html($("#dialog-options #username").html());
				},
				close: function() {
					$("#usernameForm [name='username']").val("");
					$("#usernameError").text("").hide();
				}
			});

			$("#usernameChange").click(function() {
				$("#dialog-usernameChange").dialog("open");
			});

			$("#usernameForm").submit(function(e) {
				e.preventDefault();

				$("#usernameError").text("").hide();

				$.ajax({
					url: "options.php",
					type: "POST",
					data: $(this).serialize(),
					dataType: "JSON"
				}).done(function(response) {
					if (response && response.result) {
						$("#dialog-msg #msg").text("Username changed");
						$("#dialog-msg").dialog("open");

						$("#dialog-options #username").html(response.result);

						$("#dialog-usernameChange").dialog("close");
					} else if (response && response.error) {
						$("#usernameError").text(response.error).show("slide", {direction: "up"});
					} else {
						$("#usernameError").text("Unknown error").show("slide", {direction: "up"});
					}
				});
			});

			// Mask selections
			$("#masks").on("change", "input.selector:checked", function() {
				if ($(this).data("owner")) {
					$("#maskControls #edit").removeAttr("disabled");
					$("#maskControls #delete").removeAttr("disabled");
				} else {
					$("#maskControls #edit").attr("disabled", "disabled");
					$("#maskControls #delete").attr("disabled", "disabled");
				}

				if ($(this).val() != 0.0 && $(this).val().split(".")[1] == 0) {
					$("#dialog-options #leave").removeAttr("disabled");
				} else {
					$("#dialog-options #leave").attr("disabled", "disabled");
				}
			});

			// Mask join
			$("#dialog-joinMask").dialog({
				autoOpen: false,
				resizable: false,
				dialogClass: "ui-dialog-shadow dialog-noeffect dialog-modal",
				buttons: {
					Add: function() {
						var mask = $("#dialog-joinMask #results input:checked");
						var label = $("#dialog-joinMask #results input:checked+label");

						$.ajax({
							url: "masks.php",
							type: "POST",
							data: {mask: mask.val(), mode: "join"},
							dataType: "JSON"
						}).done(function(response) {
							if (response && response.result) {
								label.css("width", "");
								label.find(".info").remove();
								label.append('<i class="closeIcon" onclick="return false;" data-icon="red-giant"><i data-icon="times"></i></i>');

								$("#dialog-options #masks #"+response.type+" input.selector:last").before(mask).before(label);
								$("#dialog-joinMask").dialog("close");
							}
						});
					},
					Cancel: function() {
						$(this).dialog("close");
					}
				},
				create: function() {
					$("#dialog-joinMask form").submit(function(e) {
						e.preventDefault();

						$("#dialog-joinMask #results").html("");
						$("#dialog-joinMask #loading").show();
						$("#dialog-joinMask input[type='submit']").attr("disabled", "disabled");

						$.ajax({
							url: "masks.php",
							type: "POST",
							data: $(this).serialize(),
							dataType: "JSON"
						}).then(function(response) {
							if (response && response.results && response.results.length) {
								return tripwire.esi.fullLookup(response.eveIDs)
									.done(function(results) {
										if (results) {
											for (var x in results) {
												var mask = response.results[x];
												var node = $(''
													+ '<input type="radio" name="mask" id="mask'+mask.mask+'" value="'+mask.mask+'" class="selector" data-owner="false" data-admin="'+mask.admin+'" />'
													+ '<label for="mask'+mask.mask+'" style="width: 100%; margin-left: -5px;">'
													+ '	<img src="'+mask.img+'" />'
													+ '	<span class="selector_label">'+mask.label+'</span>'
													+ '	<div class="info">'
													+ '		'+results[x].name + '<br/>'
													+ '		'+(results[x].category == "character" ? results[x].corporation.name +'<br/>' : null)
													+ '		'+(results[x].alliance ? results[x].alliance.name : '')+'<br/>'
													+ '	</div>'
													+ '</label>');

												$("#dialog-joinMask #results").append(node);
											}
										}
									});
							} else if (response && response.error) {
								$("#dialog-error #msg").text(response.error);
								$("#dialog-error").dialog("open");
							} else {
								$("#dialog-error #msg").text("Unknown error");
								$("#dialog-error").dialog("open");
							}
						}).then(function() {
							$("#dialog-joinMask #loading").hide();
							$("#dialog-joinMask input[type='submit']").removeAttr("disabled");
						});
					})
				},
				close: function() {
					$("#dialog-joinMask #results").html("");
					$("#dialog-joinMask input[name='name']").val("");
				}
			});

			$("#dialog-options #masks").on("click", "input[name='find']+label", function() {
				$("#dialog-joinMask input[name='find']").val($(this).prev().val());
				$("#dialog-joinMask").dialog("open");
			});

			// Mask leave
			$("#dialog-options #masks").on("click", ".closeIcon", function() {
				var mask = $(this).closest("input.selector+label").prev();

				$("#dialog-confirm #msg").text("Are you sure you want to remove this mask?");

				$("#dialog-confirm").dialog("option", {
					buttons: {
						Remove: function() {
							var send = {mode: "leave", mask: mask.val()};

							$.ajax({
								url: "masks.php",
								type: "POST",
								data: send,
								dataType: "JSON"
							}).done(function(response) {
								if (response && response.result) {
									mask.next().remove();
									mask.remove();

									$("#dialog-confirm").dialog("close");
								} else {
									$("#dialog-confirm").dialog("close");

									$("#dialog-error #msg").text("Unable to delete");
									$("#dialog-error").dialog("open");
								}
							});
						},
						Cancel: function() {
							$(this).dialog("close");
						}
					}
				}).dialog("open");
			});

			// Mask delete
			$("#maskControls #delete").click(function() {
				var mask = $("#masks input.selector:checked");

				$("#dialog-confirm #msg").text("Are you sure you want to delete this mask?");
				$("#dialog-confirm").dialog("option", {
					buttons: {
						Delete: function() {
							var send = {mode: "delete", mask: mask.val()};

							$.ajax({
								url: "masks.php",
								type: "POST",
								data: send,
								dataType: "JSON"
							}).done(function(response) {
								if (response && response.result) {
									mask.next().remove();
									mask.remove();

									$("#dialog-confirm").dialog("close");
								} else {
									$("#dialog-confirm").dialog("close");

									$("#dialog-error #msg").text("Unable to delete");
									$("#dialog-error").dialog("open");
								}
							});
						},
						Cancel: function() {
							$(this).dialog("close");
						}
					}
				}).dialog("open");
			});

			// User Create mask
			$("#dialog-createMask").dialog({
				autoOpen: false,
				dialogClass: "ui-dialog-shadow dialog-noeffect dialog-modal",
				buttons: {
					Create: function() {
						$("#dialog-createMask form").submit();
					},
					Cancel: function() {
						$(this).dialog("close");
					}
				},
				create: function() {
					$("#dialog-createMask #accessList").on("click", "#create_add+label", function() {
						$("#dialog-EVEsearch").dialog("open");
					});

					$("#dialog-createMask form").submit(function(e) {
						e.preventDefault();

						$.ajax({
							url: "masks.php",
							type: "POST",
							data: $(this).serialize(),
							dataType: "JSON"
						}).done(function(response) {
							if (response && response.result) {
								// Get masks
								$.ajax({
									url: "masks.php",
									type: "POST",
									dataType: "JSON"
								}).done(function(response) {
									if (response && response.masks) {
										$("#dialog-options #masks #default").html("");
										$("#dialog-options #masks #personal").html("");
										$("#dialog-options #masks #corporate").html("");

										for (var x in response.masks) {
											var mask = response.masks[x];
											var node = $(''
												+ '<input type="radio" name="mask" id="mask'+x+'" value="'+mask.mask+'" class="selector" data-owner="'+mask.owner+'" data-admin="'+mask.admin+'" />'
												+ '<label for="mask'+x+'"><img src="'+mask.img+'" />'
												+  (mask.optional ? '<i class="closeIcon" onclick="return false;" data-icon="red-giant"><i data-icon="times"></i></i>' : '')
												+ '<span class="selector_label">'+mask.label+'</span></label>');

											$("#dialog-options #masks #"+mask.type).append(node);
										}

										var node = $(''
											+ '<input type="checkbox" name="find" id="findp" value="personal" class="selector" disabled="disabled" />'
											+ '<label for="findp"><i data-icon="search" style="font-size: 3em; margin-left: 16px; margin-top: 16px; display: block;"></i></label>');
										$("#dialog-options #masks #personal").append(node);

										if (init.admin == "1") {
											var node = $(''
												+ '<input type="checkbox" name="find" id="findc" value="corporate" class="selector" disabled="disabled" />'
												+ '<label for="findc"><i data-icon="search" style="font-size: 3em; margin-left: 16px; margin-top: 16px; display: block;"></i></label>');
											$("#dialog-options #masks #corporate").append(node);
										}

										$("#dialog-options input[name='mask']").filter("[value='"+response.masks[response.active].mask+"']").attr("checked", true).trigger("change");

										// toggle mask admin icon
										response.masks[response.active].admin ? $("#admin").removeClass("disabled") : $("#admin").addClass("disabled");
									}
								});

								$("#dialog-createMask").dialog("close");
							} else if (response && response.error) {
								$("#dialog-error #msg").text(response.error);
								$("#dialog-error").dialog("open");
							} else {
								$("#dialog-error #msg").text("Unknown error");
								$("#dialog-error").dialog("open");
							}
						});
					});

					$("#dialog-createMask select").selectmenu({width: 100});
				},
				open: function() {
					$("#dialog-createMask input[name='name']").val("");
					$("#dialog-createMask #accessList :not(.static)").remove();
				}
			});

			$("#maskControls #create").click(function() {
				$("#dialog-createMask").dialog("open");
			});

			$("#dialog-createMask #accessList").on("click", ".maskRemove", function() {
				$(this).closest("input.selector+label").prev().remove();
				$(this).closest("label").remove();
			});

			$("#dialog-editMask").dialog({
				autoOpen: false,
				dialogClass: "ui-dialog-shadow dialog-noeffect dialog-modal",
				buttons: {
					Save: function() {
						$("#dialog-editMask form").submit();
					},
					Cancel: function() {
						$(this).dialog("close");
					}
				},
				create: function() {
					$("#dialog-editMask #accessList").on("click", ".maskRemove", function() {
						$(this).closest("input.selector+label").prev().attr("name", "deletes[]").hide();
						$(this).closest("label").hide();
					});

					$("#dialog-editMask #accessList").on("click", "#edit_add+label", function() {
						$("#dialog-EVEsearch").dialog("open");
					});

					$("#dialog-editMask form").submit(function(e) {
						e.preventDefault();

						$.ajax({
							url: "masks.php",
							type: "POST",
							data: $(this).serialize(),
							dataType: "JSON"
						}).done(function(response) {
							if (response && response.result) {
								$("#dialog-editMask").dialog("close");
							} else if (response && response.error) {
								$("#dialog-error #msg").text(response.error);
								$("#dialog-error").dialog("open");
							} else {
								$("#dialog-error #msg").text("Unknown error");
								$("#dialog-error").dialog("open");
							}
						});
					});
				},
				open: function() {
					var mask = $("#dialog-options input[name='mask']:checked").val();
					$("#dialog-editMask input[name='mask']").val(mask);
					$("#dialog-editMask #accessList label.static").hide();
					$("#dialog-editMask #loading").show();
					$("#dialog-editMask #name").text($("#dialog-options input[name='mask']:checked+label .selector_label").text());

					$.ajax({
						url: "masks.php",
						type: "POST",
						data: {mode: "edit", mask: mask},
						dataType: "JSON"
					}).then(function(response) {
						if (response && response.results && response.results.length) {
							return tripwire.esi.fullLookup(response.results)
								.done(function(results) {
									if (results) {
										for (var x in results) {
											if (results[x].category == "character") {
												var node = $(''
													+ '<input type="checkbox" checked="checked" onclick="return false" name="" id="edit_'+results[x].id+'_1373" value="'+results[x].id+'_1373" class="selector" />'
													+ '<label for="edit_'+results[x].id+'_1373">'
													+ '	<img src="https://image.eveonline.com/Character/'+results[x].id+'_64.jpg" />'
													+ '	<span class="selector_label">Character</span>'
													+ '	<div class="info">'
													+ '		'+results[x].name + '<br/>'
													+ '		'+results[x].corporation.name+'<br/>'
													+ '		'+(results[x].alliance ? results[x].alliance.name : '')+'<br/>'
													+ '		<input type="button" class="maskRemove" value="Remove" style="position: absolute; bottom: 3px; right: 3px;" />'
													+ '	</div>'
													+ '</label>');

												$("#dialog-editMask #accessList .static:first").before(node);
											} else if (results[x].category == "corporation") {
												var node = $(''
													+ '<input type="checkbox" checked="checked" onclick="return false" name="" id="edit_'+results[x].id+'_2" value="'+results[x].id+'_2" class="selector" />'
													+ '<label for="edit_'+results[x].id+'_2">'
													+ '	<img src="https://image.eveonline.com/Corporation/'+results[x].id+'_64.png" />'
													+ '	<span class="selector_label">Corporation</span>'
													+ '	<div class="info">'
													+ '		'+results[x].name+'<br/>'
													+ '		'+(results[x].alliance ? results[x].alliance.name : '')+'<br/>'
													+ '		<input type="button" class="maskRemove" value="Remove" style="position: absolute; bottom: 3px; right: 3px;" />'
													+ '	</div>'
													+ '</label>');

												$("#dialog-editMask #accessList .static:first").before(node);
											}
										}
									}
								});
						}
					}).then(function(response) {
						$("#dialog-editMask #accessList label.static").show();
						$("#dialog-editMask #loading").hide();
					});
				},
				close: function() {
					$("#dialog-editMask #accessList :not(.static)").remove();
				}
			});

			$("#maskControls #edit").click(function() {
				$("#dialog-editMask").dialog("open");
			});

			// EVE search dialog
			$("#dialog-EVEsearch").dialog({
				autoOpen: false,
				dialogClass: "ui-dialog-shadow dialog-noeffect dialog-modal",
				buttons: {
					Add: function() {
						if ($("#accessList input[value='"+$("#EVESearchResults input").val()+"']").length) {
							$("#dialog-error #msg").text("Already has access");
							$("#dialog-error").dialog("open");
							return false;
						}

						$("#EVESearchResults .info").append('<input type="button" class="maskRemove" value="Remove" style="position: absolute; bottom: 3px; right: 3px;" />');
						$("#EVESearchResults input:checked").attr("checked", "checked");
						$("#EVESearchResults input:checked").attr("onclick", "return false");

						var nodes = $("#EVESearchResults .maskNode:has(input:checked)");

						if ($("#dialog-createMask").dialog("isOpen"))
							$("#dialog-createMask #accessList .static:first").before(nodes);
						else if ($("#dialog-editMask").dialog("isOpen"))
							$("#dialog-editMask #accessList .static:first").before(nodes);

						$(this).dialog("close");
					},
					Close: function() {
						$(this).dialog("close");
					}
				},
				create: function() {
					$("#EVEsearch").submit(function(e) {
						e.preventDefault();

						if ($("#EVEsearch input[name='name']").val() == "") {
							return false;
						}

						$("#EVESearchResults, #searchCount").html("");
						$("#EVEsearch #searchSpinner").show();
						$("#EVEsearch input[type='submit']").attr("disabled", "disabled");
						$("#dialog-EVEsearch").parent().find(".ui-dialog-buttonpane button:contains('Add')").attr("disabled", true).addClass("ui-state-disabled");

						tripwire.esi.search($("#EVEsearch input[name='name']").val(), $("#EVEsearch input[name='category']:checked").val(), $("#EVEsearch input[name='exact']")[0].checked)
							.done(function(results) {
								if (results && (results.character || results.corporation)) {
									// limit results
									results = $.merge(results.character || [], results.corporation || []);
									total = results.length;
									results = results.slice(0, 10);
									return tripwire.esi.fullLookup(results)
										.done(function(results) {
											$("#EVEsearch #searchCount").html("Found: "+total+"<br/>Showing: "+(total<10?total:10));
											if (results) {
												for (var x in results) {
													if (results[x].category == "character") {
														var node = $(''
															+ '<div class="maskNode"><input type="checkbox" name="adds[]" id="find_'+results[x].id+'_1373" value="'+results[x].id+'_1373" class="selector" />'
															+ '<label for="find_'+results[x].id+'_1373">'
															+ '	<img src="https://image.eveonline.com/Character/'+results[x].id+'_64.jpg" />'
															+ '	<span class="selector_label">Character</span>'
															+ '	<div class="info">'
															+ '		'+results[x].name + '<br/>'
															+ '		'+results[x].corporation.name+'<br/>'
															+ '		'+(results[x].alliance ? results[x].alliance.name : '')+'<br/>'
															+ '	</div>'
															+ '</label></div>');

														$("#EVESearchResults").append(node);
													} else if (results[x].category == "corporation") {
														var node = $(''
															+ '<div class="maskNode"><input type="checkbox" name="adds[]" id="find_'+results[x].id+'_2" value="'+results[x].id+'_2" class="selector" />'
															+ '<label for="find_'+results[x].id+'_2">'
															+ '	<img src="https://image.eveonline.com/Corporation/'+results[x].id+'_64.png" />'
															+ '	<span class="selector_label">Corporation</span>'
															+ '	<div class="info">'
															+ '		'+results[x].name+'<br/>'
															+ '		'+(results[x].alliance ? results[x].alliance.name : '')+'<br/>'
															+ '	</div>'
															+ '</label></div>');

														$("#EVESearchResults").append(node);
													}
												}
											}
										}).always(function() {
											$("#EVEsearch #searchSpinner").hide();
											$("#EVEsearch input[type='submit']").removeAttr("disabled");
											$("#dialog-EVEsearch").parent().find(".ui-dialog-buttonpane button:contains('Add')").removeAttr("disabled").removeClass("ui-state-disabled");
										});
								} else {
									$("#dialog-error #msg").text("No Results");
									$("#dialog-error").dialog("open");

									$("#EVEsearch #searchSpinner").hide();
									$("#EVEsearch input[type='submit']").removeAttr("disabled");
									$("#dialog-EVEsearch").parent().find(".ui-dialog-buttonpane button:contains('Add')").removeAttr("disabled").removeClass("ui-state-disabled");
								}
							});
					});
				},
				close: function() {
					$("#EVEsearch input[name='name']").val("");
					$("#EVESearchResults, #searchCount").html("");
				}
			});
		}
	});

	$("#dialog-options").dialog("open");
});
