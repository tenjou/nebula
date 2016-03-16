"use strict";

Editor.Plugin("Support", 
{
	install: function()
	{
	},

	onStart: function()
	{
		var roomToolbar = editor.inner.roomToolbar;
		var tab = roomToolbar.createTab("Scene");

		this.content = new Element.Content();
		this.content.load(Controller.Scene);
		tab.addContent(this.content);
	},

	//
	content: null,
	iframe: null
});
