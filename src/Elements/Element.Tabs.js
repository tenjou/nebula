"use strict";

meta.class("Editor.Element.Tabs", "Element.Basic",
{
	onCreate: function()
	{
		this.inner = new Element.WrappedElement("tabs-inner", this);

		var tabCtrl = document.createElement("tabs-ctrl");
		this.domElement.appendChild(tabCtrl);

		this.tabs = {};

		this.on("click", "tab", this.activateTab.bind(this));
		this.on("active", "tab", this.handleActivatedTab.bind(this));
		this.on("inactive", "tab", this.handleDeactivatedTab.bind(this));
	},

	activateTab: function(event) {
		event.element.active = true;
	},

	handleActivatedTab: function(event)
	{
		if(this._activeTab) {
			this._activeTab.deactivate();
		}

		this._activeTab = event.element;
		event.element.activate();
	},

	handleDeactivatedTab: function(event)
	{
		if(this._activeTab === event.element) {
			this._activeTab = null;
		}
	},	

	createTab: function(name)
	{
		var tab = new Editor.Element.Tab(this.inner);
		tab.name = name;

		this.tabs[name] = tab;
		this.numTabs++;

		if(this.numTabs === 1) {
			tab.active = true;
		}

		return tab;
	},	

	getTab: function(name)
	{
		var tab = this.tabs[name];
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

		tab.activate();
		this._activeTab = tab;
	},

	get activeTab() {
		return this._activeTab;
	},

	//
	elementTag: "tabs",

	tabs: null,
	numTabs: 0,
	
	inner: null,
	_activeTab: null
});