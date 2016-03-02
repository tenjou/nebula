"use strict";

meta.class("Element.ListItem", "Element.Basic",
{
	onCreate: function()
	{
		this._name = new Element.Name(this);

		this.element.onclick = this._handleClick.bind(this);
		this.element.ondblclick = this._handleDbClick.bind(this);
	},

	_handleClick: function(event)
	{
		event.stopPropagation();

		this.emit("click");
	},

	_handleDbClick: function(event)
	{
		event.stopPropagation();

		var holder = event.currentTarget.holder;
		this.emit("dbClick");
	},	

	focus: function() {
		this._name.focus();
	},

	set select(value) 
	{
		if(this._select === value) { return; }

		this._select = value;

		if(value) {
			this.element.setAttribute("class", "active");
			this.emit("select");
		}
		else {
			this.element.setAttribute("class", "");
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
