"use strict";

meta.class("Element.List", "Element.Basic",
{
	onCreate: function() 
	{
		this.domElement.onclick = this.handleClick.bind(this);
		this.on("click", "item", this.selectItem.bind(this));
		this.on("select", "item", this.handleSelectedItem.bind(this));
	},

	handleClick: function(domEvent) {
		this.emit("click", domEvent);
	},

	selectItem: function(event)
	{
		if(event.element === this.selectedItem) { return; }
		event.element.select = true;	
	},

	handleSelectedItem: function(event)
	{
		if(!this.selectedItem) {
			this.selectedItem = event.element;
		}
		else {
			this.selectedItem.select = false;
			this.selectedItem = event.element;
		}
	},

	createItem: function(name) 
	{
		if(!this.itemCls) {
			this.itemCls = Element.ListItem;
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
			this.domElement.appendChild(this._info);			
		}

		this._info.innerHTML = str;
	},

	get info() {
		return this._info.innerHTML;
	},

	//
	elementTag: "list",

	itemCls: null,
	_info: null,

	selectedItem: null
});