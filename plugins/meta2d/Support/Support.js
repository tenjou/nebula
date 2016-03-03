"use strict";

Editor.Plugin("Support", 
{
	install: function()
	{
		this.iframe = new Element.IFrame();
		this.iframe.value = "plugins/meta2d/Support/index.html";
	},

	onSplashEnd: function()
	{
		
	},

	onStart: function()
	{
		this.content = new Element.Content_Scene();
		this.content.append(this.iframe);

		var roomToolbar = editor.inner.roomToolbar;
		var tab = roomToolbar.createTab("Scene");		
		tab.content = this.content;
	},

	//
	content: null,
	iframe: null
});
