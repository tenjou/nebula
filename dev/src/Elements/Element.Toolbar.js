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

	loadTab: function(name, inputData)
	{
		var tab = this.tabs.getTab(name);
		if(!tab) {
			tab = this.tabs.createTab(name);
		}
		else {
			tab.clear();
		}

		editor.inputParser.parse(inputData, tab.content);
	},

	//
	elementTag: "toolbar",

	tabs: null
});
