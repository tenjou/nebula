"use strict";

editor.plugin("layout",
{
	create: function()
	{
		wabi.addTemplate("layout", {
			type: "content",
			$value: [
				{
					id: "browser",
					type: "toolbar",
					$tab: "Project",
					width: 270
				},
				{
					type: "toolbar",
					$tab: "master",
					$value: [
						{
							id: "ruler-horizontal",
							type: "ruler",
							orientation: "horizontal"
						},					
						// {
						// 	id: "ruler-row-horizontal",
						// 	type: "row",
						// 	$value: [
						// 		{
						// 			type: "slot"
						// 		},
						// 		{
						// 			id: "ruler-horizontal",
						// 			type: "ruler",
						// 			orientation: "horizontal"
						// 		},
						// 	]
						// },
						// {
						// 	type: "row",
						// 	$value: [
						// 		{
						// 			id: "ruler-vertical",
						// 			type: "ruler",
						// 			orientation: "vertical"
						// 		},
								// {
								// 	id: "iframe",
								// 	type: "slot"
								// }
						// 	]
						// }						
						
					]
				},
				{
					id: "inspect",
					type: "toolbar",
					width: 380,
					$tab: "Inspect"
				}
			]
		});

		wabi.on("drop", this.handleDrop, this);
		wabi.on("dragover", this.handleDragOver, this);
	},

	onStart: function()
	{
		this.template = wabi.createTemplate("layout");
		this.toolbarBrowser = this.template.get("#browser");
		this.toolbarIFrame = this.template.get("#iframe");
		this.toolbarInspect = this.template.get("#inspect");
		this.template.appendTo(editor.wrapperElement);
	},

	handleDrop: function(event) {
		event.stop();
	},

	handleDragOver: function(event) {
		event.stop();
	},

	//
	template: null,
	toolbarBrowser: null,
	toolbarIFrame: null,
	toolbarInspect: null
});
