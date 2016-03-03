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
			this._info.enable = false;
		}

		return item;
	},

	removeItem: function(item) 
	{
		this.remove(item);

		if(this.domElement.childNodes.length === 0) {
			this.info = this.infoTxt;
		}

		if(this.onItemRemove) {
			this.onItemRemove(item);
		}
	},

	onItemRemove: null,

	set info(str) 
	{
		this.infoTxt = str;

		if(!this._info) {
			this._info = new Element.Info(this);	
		}
		else {
			this._info.enable = true;
		}

		this._info.value = str;
	},

	get info() {
		return this._info.value;
	},

	//
	elementTag: "list",

	itemCls: null,
	selectedItem: null,

	_info: null,
	infoTxt: null
});