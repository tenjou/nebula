"use strict";

meta.class("Element.Browser_ProjectItem", "Editor.Element",
{
	onCreate: function()
	{
		this.element.onclick = this._handleOnClick;

		this._name = new Element.Name(this);
	},

	_handleOnClick: function(event)
	{
		event.stopPropagation();

		var holder = event.currentTarget.holder;
		holder.emit("click");
	},

	focus: function() {
		this._name.focus();
	},

	set active(value) 
	{
		if(this._active === value) { return; }
		this._active = value;

		if(value) {
			this.element.setAttribute("class", "active");
		}
		else {
			this.element.setAttribute("class", "");
		}
	},

	get active() {
		return this._active;
	},

	set name(name) {
		this._name.value = name;
	},

	get name() {
		return this._name;
	},

	//
	elementTag: "item",
	_active: false,
	_name: null
});
