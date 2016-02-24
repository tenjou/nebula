"use strict";

meta.class("Editor.Element.ToolbarRoom", "Editor.Element",
{
	onCreate: function()
	{
		this.tabs = new Editor.Element.Tabs(this);
		this.tabs.createTab("Test1");
		//this.tabs.createTab("Stuff");
	},

	//
	elementTag: "toolbar-room",

	tabs: null,
	content: null
});
