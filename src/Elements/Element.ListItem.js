"use strict";

var dragSrcEl = null;

meta.class("Element.ListItem", "Element.Basic",
{
	onCreate: function()
	{
		this._inner = new Element.WrappedElement("inner", this);
		this._icon = new Element.Icon(this._inner);
		this._name = new Element.Name(this._inner);

		this.domElement.setAttribute("draggable", "true");

		this.domElement.onclick = this.handleClick.bind(this);
		this.domElement.oncontextmenu = this.handleContextMenu.bind(this);
		
		this.domElement.ondragstart = this.handleDragStart.bind(this);
		this.domElement.ondragend = this.handleDragEnd.bind(this);
		this.domElement.ondragenter = this.handleDragEnter.bind(this);
		this.domElement.ondragleave = this.handleDragLeave.bind(this);
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
		}
	},	

	handleContextMenu: function(domEvent) {
		domEvent.preventDefault();
		domEvent.stopPropagation();
		this.emit("menu", domEvent);
	},	

	handleDragStart: function(domEvent) 
	{
		domEvent.stopPropagation();

		this.preDragParent = this.parent;
		this.parent.cache.dragItem = this;
	},

	handleDragEnd: function(domEvent) 
	{
		domEvent.stopPropagation();

		this.parent.cache.dragItem = null;

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
		if(this.folder) {
			this.open = true;
		}

		var dragItem = this.parent.cache.dragItem;
		if(!dragItem) { return; }
		if(dragItem === this) { return; }
		
		if(this.folder)
		{
			this.list.append(dragItem);
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

	handleDragLeave: function(domEvent) {
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
		}
		else {
			this.domElement.setAttribute("class", "");
			this.emit("unselect");
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

	set icon(type) 
	{
		if(!this._icon) {
			this._icon = new Element.Icon();
			this.insertBefore(this._icon, this._name);
		}

		this._icon.type = type;
	},

	get icon() 
	{
		if(!this._icon) {
			return null;
		}

		return this._icon.type;
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
			this._icon.type = "fa-folder-open";
			this.list.removeCls("hidden");
		}
		else {
			this._icon.type = "fa-folder";
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
	_open: false
});
