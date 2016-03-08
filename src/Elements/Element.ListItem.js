"use strict";

var dragSrcEl = null;

meta.class("Element.ListItem", "Element.Basic",
{
	onCreate: function()
	{
		this._name = new Element.Name(this);

		this.domElement.setAttribute("draggable", "true");

		this.domElement.onclick = this.handleClick.bind(this);
		this.domElement.ondblclick = this.handleDbClick.bind(this);
		this.domElement.oncontextmenu = this.handleContextMenu.bind(this);
		this.domElement.ondragstart = this.handleDragStart.bind(this);
		this.domElement.ondragend = this.handleDragEnd.bind(this);

		this.domElement.ondragenter = this.handleDragEnter.bind(this);
		this.domElement.ondragleave = this.handleDragLeave.bind(this);
	},

	handleClick: function(domEvent)
	{
		domEvent.stopPropagation();
		this.emit("click", domEvent);
	},

	handleDbClick: function(domEvent)
	{
		domEvent.stopPropagation();
		this.emit("dbClick", domEvent);
	},	

	handleContextMenu: function(domEvent) {
		domEvent.preventDefault();
		domEvent.stopPropagation();
		this.emit("click", domEvent);
		this.emit("menu", domEvent);
	},	

	handleDragStart: function(domEvent) 
	{
		domEvent.stopPropagation();

		this.parent.cache.dragItem = this;
	},

	handleDragEnd: function(domEvent) {
		this.parent.cache.dragItem = null;
	},

	handleDragEnter: function(domEvent) 
	{
		domEvent.stopPropagation();
		domEvent.preventDefault();

		var dragItem = this.parent.cache.dragItem;
		if(dragItem === this) { return; }
		
		var nextSibling = this.domElement.nextElementSibling;
		if(!nextSibling) {
			this.parent.append(dragItem);
		}
		else 
		{
			if(nextSibling !== dragItem.domElement) {
				this.parent.insertBefore(dragItem, nextSibling);
			}
			else 
			{
				var prevSibling = this.domElement.previousElementSibling;
				if(!prevSibling) {
					this.parent.insertBefore(dragItem, this);
				}
				else {
					this.parent.insertBefore(dragItem, prevSibling);
				}
				
			}
		}
	},

	handleDragLeave: function(domEvent) {
		this.domElement.style.background = "";
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

	//
	elementTag: "item",
	_name: null,
	_icon: null,

	_select: false
});
