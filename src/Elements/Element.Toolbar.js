"use strict";

meta.class("Element.Toolbar", "Element.Basic",
{
	onCreate: function()
	{
		this.tabData = {};

		this.holder = new Element.WrappedElement("holder", this);
		this.tabs = new Editor.Element.Tabs(this.holder);
	},

	onTabChange: function(tabName)
	{

	},

	createTab: function(name) {
		return this.tabs.createTab(name);
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

	holder: null,

	_width: 0
});
