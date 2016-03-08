"use strict";

meta.class("Element.List", "Element.Basic",
{
	onCreate: function() 
	{
		this.domElement.onclick = this.handleClick.bind(this);
		this.domElement.ondragenter = this.handleDragEnter.bind(this);

		this.on("click", "item", this.selectItem.bind(this));
		this.on("click", "folder", this.selectItem.bind(this));
		this.on("select", "item", this.handleSelectedItem.bind(this));
		this.on("select", "folder", this.handleSelectedItem.bind(this));
	},

	handleClick: function(domEvent) {
		this.emit("click", domEvent);
	},

	selectItem: function(event)
	{
		if(event.element === this.cache.selectedItem) { return; }
		event.element.select = true;	
	},

	handleSelectedItem: function(event)
	{
		if(!this.cache.selectedItem) {
			this.cache.selectedItem = event.element;
		}
		else {
			this.cache.selectedItem.select = false;
			this.cache.selectedItem = event.element;
		}
	},

	handleDragEnter: function(domEvent) 
	{
		domEvent.stopPropagation();
		domEvent.preventDefault();

		var dragItem = this.cache.dragItem;
		this.append(dragItem);
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

	createFolder: function(name)
	{
		if(!this.folderCls) {
			this.folderCls = Element.ListFolder;
		}

		var item = new this.folderCls(this);
		item.name = name;
		return item;
	},

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
	folderCls: null, 

	cache: {
		selectedItem: null,
		dragItem: null,
	},

	_info: null,
	infoTxt: null
});