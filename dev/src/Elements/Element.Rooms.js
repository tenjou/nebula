"use strict";

meta.class("Editor.Element.Rooms", "Editor.Element",
{
	onCreate: function()
	{
		this.tabs = [];
	},

	createTab: function(name)
	{
		var tab = new Editor.Element.Room(this);
		tab.name = name;
		this.tabs.push(tab);

		if(this.tabs.length === 1) {
			tab.activate();
		}
	},

	set activeTab(tab) 
	{
		if(this._activeTab === tab) { return; }

		if(this._activeTab) {
			this._activeTab.deactivate();
		}

		this._activeTab = tab;
	},

	get activeTab() {
		return this._activeTab;
	},

	//
	elementTag: "rooms"
});