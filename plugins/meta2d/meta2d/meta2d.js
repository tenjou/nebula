"use strict";

editor.plugin("meta2d",
{
	onStart: function()
	{
		var parent = editor.plugins.layout.toolbarIFrame.$elements.content;

		this.iframe = wabi.createElement("iframe");
		this.iframe.value = "plugins/meta2d/meta2d/index/index.html";
		this.iframe.on("load", this.handleIframeLoad, this);
		this.iframe.appendTo(parent);
	},

	handleIframeLoad: function()
	{
		console.log("loaded")
	},

	//
	iframe: null
});
