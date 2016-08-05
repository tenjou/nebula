"use strict";

editor.plugin("layout",
{
	create: function()
	{
		wabi.addTemplate("layout", {
			type: "content",
			value: [
				{
					id: "browser",
					type: "toolbar",
					tab: "Project",
					width: 270
				},
				{
					id: "iframe",
					type: "toolbar",
					tab: "master",
					value: [
						{
							type: "ruler",
							orientation: "horizontal"
						},
						{
							type: "ruler",
							orientation: "vertical"
						}						
					]
				},
				{
					id: "inspect",
					type: "toolbar",
					tab: "Inspect",
					width: 380
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
