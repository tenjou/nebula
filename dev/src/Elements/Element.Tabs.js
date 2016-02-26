"use strict";

meta.class("Editor.Element.Tabs", "Element.Basic",
{
	onCreate: function()
	{
		this.inner = new Element.WrappedElement("tabs-inner", this);

		var tabCtrl = document.createElement("tabs-ctrl");
		this.element.appendChild(tabCtrl);

		this.tabs = [];
		this.tabsMap = {};
	},

	createTab: function(name)
	{
		var tab = new Editor.Element.Tab(this.inner);
		tab.name = name;

		this.tabs.push(tab);
		this.tabsMap[name] = tab;

		if(this.tabs.length === 1) {
			tab.activate();
		}

		return tab;
	},

	getTab: function(name)
	{
		var tab = this.tabsMap[name];
		if(!tab) {
			return null;
		}

		return tab;
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
	elementTag: "tabs",
	
	inner: null,
	tabs: null,
	_activeTab: null
});