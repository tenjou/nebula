"use strict";

meta.class("Element.List", "Element.Basic",
{
	onCreate: function() 
	{
		this.domElement.onclick = this.handleClick.bind(this);
		this.domElement.ondragenter = this.handleDragEnter.bind(this);
		this.domElement.ondragleave = this.handleDragLeave.bind(this);
		this.domElement.addEventListener("drop", this.handleDrop.bind(this), false);

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
		if(!dragItem) { 
			this.showDragStyle();
			return; 
		}
		this.append(dragItem);
	},

	handleDragLeave: function(domEvent) 
	{
		console.log("leave")
		domEvent.stopPropagation();
		domEvent.preventDefault();

		var dragItem = this.cache.dragItem;
		if(!dragItem) { 
			this.hideDragStyle();
		}		
	},

	handleDrop: function(domEvent) 
	{
		domEvent.stopPropagation();
		domEvent.preventDefault();

		var dragItem = this.cache.dragItem;
		if(!dragItem) { 
			this.hideDragStyle();
		}	
	},

	showDragStyle: function() {
		this.domElement.style.background = "#656565";	
	},

	hideDragStyle: function() {
		this.domElement.style.background = "";
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

	createFolder: function(name, item)
	{
		if(!this.folderCls) {
			this.folderCls = Element.ListFolder;
		}

		var folder;
		if(item) 
		{
			folder = new this.folderCls();
			folder.name = name;
			this.insertBefore(folder, item);
			folder.focus();

			item.parent.remove(item);
			folder.list.append(item);	
			folder.open = true;
		}
		else {
			folder = new this.folderCls(this);
			folder.name = name;
		}

		return folder;
	},

	filterFunc: null,

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