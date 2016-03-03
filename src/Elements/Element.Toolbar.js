"use strict";

meta.class("Element.Toolbar", "Element.Basic",
{
	onCreate: function()
	{
		this.tabData = {};

		this.tabs = new Editor.Element.Tabs(this);
		this.container = new Element.Container(this);
	},

	onTabChange: function(tabName)
	{

	},

	createTab: function(name)
	{
		var tab = this.tabs.createTab(name);
		tab.parentContainer = this.container;
		return tab;
	},

	set width(value) 
	{
		if(this._width === value) { return; }

		this._width = value;
		this.domElement.style.flex = "0 0 " + value + "px";
	},

	get width() {
		return this._width;
	},

	//
	elementTag: "toolbar",

	tabs: null,
	tabCls: Element.Tab,

	_width: 0
});
