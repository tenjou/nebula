"use strict";

meta.class("Element.List", "Element.Basic",
{
	onCreate: function() {
		this.element.onclick = this.handleClick.bind(this);
	},

	handleClick: function(event) {
		this.emit("click");
	},

	createItem: function(name) 
	{
		if(!this.itemCls) {
			throw "(Element.Browser.createItem): 'itemCls' is not defined";
		}

		var item = new this.itemCls(this);
		item.name = name;

		if(this._info) {
			this._info.setAttribute("class", "hidden");
		}

		return item;
	},

	set info(str) 
	{
		if(!this._info) {
			this._info = document.createElement("info");
			this.element.appendChild(this._info);			
		}

		this._info.innerHTML = str;
	},

	get info() {
		return this._info.innerHTML;
	},

	//
	elementTag: "list",

	itemCls: Element.ListItem,
	_info: null
});