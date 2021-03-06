"use strict";

meta.class("Element.ListItem", "Element.Basic",
{
	onCreate: function()
	{
		this._inner = new Element.WrappedElement("inner", this);
		this._icon = new Element.Icon(this._inner);
		this._name = new Element.Name(this._inner);

		this.domElement.setAttribute("draggable", "true");
		this.domElement.setAttribute("tabindex", "1");

		this.domElement.onclick = this.handleClick.bind(this);
		this.domElement.oncontextmenu = this.handleContextMenu.bind(this);
		
		this.domElement.ondragstart = this.handleDragStart.bind(this);
		this.domElement.ondragend = this.handleDragEnd.bind(this);
		this.domElement.ondragenter = this.handleDragEnter.bind(this);
		this.domElement.ondragleave = this.handleDragLeave.bind(this);
		this.domElement.onkeyup = this.handleKeyUp.bind(this);
		this.domElement.addEventListener("drop", this.handleDrop.bind(this), false);
	},

	handleClick: function(domEvent)
	{
		domEvent.stopPropagation();

		if(domEvent.detail % 2 === 0) 
		{
			if(this._folder) {
				this.open = !this.open;
			}
			
			this.emit("dbClick", domEvent);
		}
		else {
			this.emit("click", domEvent);
			editor.emit("click", domEvent);
		}
	},	

	handleContextMenu: function(domEvent) 
	{
		domEvent.preventDefault();
		domEvent.stopPropagation();

		this.parent.cache.menuItem = this;
		this.emit("menu", domEvent);
	},	

	handleDragStart: function(domEvent) 
	{
		domEvent.stopPropagation();

		if(this.folder) {
			this.open = false;
		}

		this.preDragParent = this.parent;
		this.parent.internalCache.dragItem = this;
	},

	handleDragEnd: function(domEvent) 
	{
		domEvent.stopPropagation();

		this.parent.internalCache.dragItem = null;

		this.hideDragStyle();

		if(this.preDragParent !== this.parent) {
			this.emit("move", domEvent);
		}
	},		

	handleDragEnter: function(domEvent) 
	{
		domEvent.stopPropagation();
		domEvent.preventDefault();

		this.showDragStyle();

		var dragItem = this.parent.internalCache.dragItem;
		if(!dragItem) { return; }
		if(dragItem === this) { return; }

		var typeInfo = editor.resourceMgr.types[this.info.data._type];
		if(!typeInfo.content) { return; }
		
		dragItem.parent.removeItem(dragItem);

		if(this instanceof Element.List) {
			this.addItem(dragItem);
		}
		else if(this instanceof Element.ListItem) {
			this.folder = true;
			this.list.addItem(dragItem);
		}
		
		// else
		// {
		// 	var nextSibling = this.domElement.nextElementSibling;
		// 	if(!nextSibling) {
		// 		this.parent.append(dragItem);
		// 	}
		// 	else 
		// 	{
		// 		if(nextSibling !== dragItem.domElement) {
		// 			this.parent.insertBefore(dragItem, nextSibling);
		// 		}
		// 		else 
		// 		{
		// 			var prevSibling = this.domElement.previousElementSibling;
		// 			if(!prevSibling) {
		// 				this.parent.insertBefore(dragItem, this);
		// 			}
		// 			else {
		// 				this.parent.insertBefore(dragItem, prevSibling);
		// 			}
					
		// 		}
		// 	}			
		// }
	},

	handleDragLeave: function(domEvent) 
	{
		domEvent.stopPropagation();
		this.hideDragStyle();
	},

	handleDrop: function(domEvent) 
	{
		domEvent.stopPropagation();
		domEvent.preventDefault();
		
		this.hideDragStyle();
		this.emit("drop", domEvent);
	},

	handleKeyUp: function(domEvent)
	{
		domEvent.stopPropagation();
		domEvent.preventDefault();
		
		this.emit("keyup", domEvent);
	},

	showDragStyle: function() {
		this._inner.addCls("drag-over");
	},

	hideDragStyle: function() {
		this._inner.removeCls("drag-over");
	},

	focus: function() {
		this._name.focus();
	},

	set select(value) 
	{
		if(this._select === value) { return; }
		this._select = value;

		if(value) {
			this.domElement.setAttribute("class", "selected");
			this.emit("select");
			this.parent.cache.selectedItem = this;		
		}
		else
		{
			this.domElement.setAttribute("class", "");
			this.emit("unselect");
			if(this.parent.cache.selectedItem === this) {
				this.parent.cache.selectedItem = null;
			}
		}
	},

	get select() {
		return this._select;
	},

	set name(name) {
		this._name.value = name;
	},

	get name() {
		return this._name.value;
	},

	set type(typeInfo) 
	{
		this._type = typeInfo;

		if(typeInfo)
		{		
			if(this.open) {
				this._icon.value = typeInfo.iconActive ? typeInfo.iconActive : typeInfo.icon;
			}
			else {
				this._icon.value = typeInfo.icon;
			}
		}
		else {
			this._icon.value = "";
		}
	},

	get type() {
		return this._type;
	},

	set folder(value) 
	{
		if(this._folder === value) { return; }
		this._folder = value;

		if(value)
		{
			if(!this._caret)
			{
				this._caret = new Element.Caret();
				this._inner.insertBefore(this._caret, this._inner.domElement.firstChild.holder);
				this._caret.on("update", this.handleCaretUpdate.bind(this));

				this.list = new this.parent.__cls__(this);
				this.list.itemCls = this.parent.itemCls;
				this.list.db = this.parent.db;
				this.list.cache = this.parent.cache;
				this.list.addCls("hidden");				
			}
			else 
			{
				this._caret.removeCls("hidden");
				this.list.removeCls("hidden");
			}
		}
		else
		{
			this._caret.addCls("hidden");
			this.list.addCls("hidden");
		}
	},

	get folder() {
		return this._folder;
	},

	handleCaretUpdate: function(event) {
		this.open = event.element.open;
		return true;
	},

	set open(value) 
	{
		if(!this._folder) { return; }
		if(this._open === value) { return; }

		this._open = value;
		this._caret.open = value;

		if(value) {
			this._icon.value = this._type.iconActive ? this._type.iconActive : this._type.icon;
			this.list.removeCls("hidden");
		}
		else {
			this._icon.value = this._type.icon;
			this.list.addCls("hidden");
		}
	},

	get open() {
		return this._open;
	},	

	//
	elementTag: "item",
	preDragParent: null,

	_inner: null,
	_name: null,
	_icon: null,
	_caret: null,
	list: null,

	_select: false,
	_folder: false,
	_open: false,

	info: null,
	_type: null
});
