"use strict";

meta.class("Element.ListItem", "Element.Basic",
{
	onCreate: function()
	{
		this._name = new Element.Name(this);

		this.domElement.onclick = this.handleClick.bind(this);
		this.domElement.ondblclick = this.handleDbClick.bind(this);
		this.domElement.oncontextmenu = this.handleContextMenu.bind(this);
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
		this.emit("click", domEvent);
		this.emit("menu", domEvent);
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

	//
	elementTag: "item",
	_name: null,

	_select: false
});
