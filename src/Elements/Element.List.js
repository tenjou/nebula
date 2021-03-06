"use strict";

meta.class("Element.List", "Element.Basic",
{
	onCreate: function() 
	{
		this.items = [];
		this.cache = {
			selectedItem: null,
			menuItem: null,
			selectable: true
		};

		this.domElement.onclick = this.handleClick.bind(this);
		this.domElement.oncontextmenu = this.handleContextMenu.bind(this);
		this.domElement.ondragenter = this.handleDragEnter.bind(this);
		this.domElement.ondragleave = this.handleDragLeave.bind(this);
		this.domElement.addEventListener("drop", this.handleDrop.bind(this), false);

		this.on("click", "item", this.selectItem.bind(this));
		this.on("click", "folder", this.selectItem.bind(this));
	},

	handleClick: function(domEvent) {
		this.emit("click", domEvent);
	},

	handleContextMenu: function(domEvent) 
	{
		domEvent.stopPropagation();
		domEvent.preventDefault();

		this.cache.menuItem = this;
		this.emit("menu", domEvent);
	},	

	selectItem: function(event)
	{
		if(!this.cache.selectable) { return; }
		if(this.cache.selectedItem === event.element) { return; }

		if(this.cache.selectedItem) {
			this.cache.selectedItem.select = false;
		}

		event.element.select = true;
	},

	handleDragEnter: function(domEvent) 
	{
		domEvent.stopPropagation();
		domEvent.preventDefault();

		var dragItem = this.internalCache.dragItem;
		if(!dragItem) { 
			this.showDragStyle();
			return; 
		}
		this.append(dragItem);
	},

	handleDragLeave: function(domEvent) 
	{
		domEvent.stopPropagation();
		domEvent.preventDefault();

		var dragItem = this.internalCache.dragItem;
		if(!dragItem) { 
			this.hideDragStyle();
		}		
	},

	handleDrop: function(domEvent) 
	{
		domEvent.stopPropagation();
		domEvent.preventDefault();

		var dragItem = this.internalCache.dragItem;
		if(!dragItem) { 
			this.hideDragStyle();
		}	

		this.emit("drop", domEvent);
	},

	showDragStyle: function() {
		this.domElement.style.background = "#656565";	
	},

	hideDragStyle: function() {
		this.domElement.style.background = "";
	},

	createItem: function(name, insertBefore) 
	{
		if(!this.itemCls) {
			this.itemCls = Element.ListItem;
		}

		var item = new this.itemCls();
		item.name = name;

		this.addItem(item, insertBefore)

		return item;
	},

	addItem: function(item, insertBefore)
	{
		if(insertBefore) {
			this.insertBefore(item, insertBefore);
		}
		else {
			this.append(item);
		}

		if(this._info) {
			this._info.enable = false;
		}

		this.items.push(item);
	},

	removeItem: function(item) 
	{
		if(this.cache.selectedItem === item) {
			item.select = false;
		}
		
		this.remove(item);

		var index = this.items.indexOf(item);
		if(index > -1) {
			console.log("REMOVE")
			this.items[index] = this.items[this.items.length - 1];
			this.items.pop();
		}

		if(this.items.length === 0) {
			console.log("NO FOLDER")
			this.folder = false;
		}

		if(this.domElement.childNodes.length === 0) {
			this.info = this._infoTxt;
		}
	},

	removeAll: function()
	{
		if(this.cache.selectedItem) {
			this.cache.selectedItem.select = false;
		}

		for(var n = 0; n < this.items.length; n++) {
			this.remove(this.items[n]);
		}

		this.items.length = 0;
		this.info = this._infoTxt;
	},

	sortFunc: function(a, b)
	{
		// if(a.info.data._type !== "folder") { return 1; }
		// if(a.info.data._type > b.info.data._type) { return 1; }

		if(a.name < b.name) { return -1; }
		if(a.name > b.name) { return 1; }
		
		return 0;
	},	

	sort: function()
	{
		if(!this.items) { return; }

		this.items.sort(this.sortFunc);

		var parentDomElement = this.domElement;
		var num = this.items.length;
		for(var n = 0; n < num; n++) {
			parentDomElement.appendChild(this.items[n].domElement);
		}
	},

	filterFunc: null,

	set infoTxt(str) 
	{
		this._infoTxt = str;

		if(!this._info) {
			this._info = new Element.Info(this);	
		}
		else {
			this._info.enable = true;
		}

		this._info.value = str;
	},

	get infoTxt() {
		return this._infoTxt;
	},

	set selectable(value) 
	{
		if(this.cache.selectable === value) { return; }
		this.cache.selectable = value;

		if(!value)
		{
			if(this.cache.selectedItem) {
				this.cache.selectedItem = false;
			}
		}
	},

	get selectable() {
		return this.cache.selectable;
	},

	//
	elementTag: "list",

	items: null,
	itemCls: null,
	folderCls: null, 

	cache: null,
	internalCache: {
		dragItem: null,
	},

	_info: null,
	_infoTxt: null
});