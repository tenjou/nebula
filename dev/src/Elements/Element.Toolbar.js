"use strict";

meta.class("Editor.Element.Toolbar", "Editor.Element",
{
	onCreate: function()
	{
		this.tabData = {};

		this.tabs = new Editor.Element.Tabs(this);
	},

	onTabChange: function(tabName)
	{

	},

	createTab: function(name, inputData)
	{
		var tab = this.tabs.createTab(name);
		editor.inputParser.parse(tab.content, inputData);
	},

	//
	elementTag: "toolbar",

	tabs: null
});
