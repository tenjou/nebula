"use strict";

meta.class("Element.ListFolder", "Element.Basic",
{
	onCreate: function()
	{
		this.domElement.setAttribute("draggable", "true");

		this._caret = new Element.Caret(this);
		this._caret.on("update", "*", this.handleCaretUpdate.bind(this));

		this._icon = new Element.Icon(this);
		this._icon.type = "fa-folder";

		this._name = new Element.Name(this);

		this.list = new Element.List(this);
		this.list.addCls("hidden");
		// var item = this.list.createItem("test");
		// item.icon = "fa-cube";

		this.domElement.onclick = this.handleClick.bind(this);
		this.domElement.ondragstart = this.handleDragStart.bind(this);
		this.domElement.ondragend = this.handleDragEnd.bind(this);		
		this.domElement.ondragenter = this.handleDragEnter.bind(this);
	},

	handleCaretUpdate: function(event) {
		this.open = event.element.open;
	},

	handleClick: function(domEvent) 
	{
		if(this.select) {
			this.open = !this.open;
		}

		this.emit("click", domEvent);
	},

	handleDragStart: function(domEvent) 
	{
		domEvent.stopPropagation();

		this.parent.cache.dragItem = this;
		this.open = false;
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

		if(dragItem instanceof Element.ListItem) 
		{
			this.open = true;

			var firstChild = this.list.domElement.firstChild;
			if(!firstChild) {
				this.list.append(dragItem);
			}
			else {
				this.list.insertBefore(dragItem, firstChild);
			}
		}
		else if(dragItem instanceof Element.ListFolder)
		{
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
		}
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

	set open(value) 
	{
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

	//
	elementTag: "folder",

	_caret: null,
	_name: null,
	_icon: null,
	list: null,

	_open: false,
	_select: false
});
