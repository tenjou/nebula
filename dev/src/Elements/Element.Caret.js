"use strict";

meta.class("Element.Caret", "Editor.Element",
{
	onCreate: function() {
		this.element.onclick = this._handleOnClick;
		this.element.setAttribute("class", "fa fa-caret-right");
	},

	_handleOnClick: function(event) 
	{
		event.stopPropagation();

		var holder = event.currentTarget.holder;
		holder.open = !holder._open;
	},

	set open(value) 
	{
		if(this._open === value) { return; }
		this._open = value;

		if(value) {
			this.element.setAttribute("class", "fa fa-caret-down");
			this.emit("activated");
		}
		else {
			this.element.setAttribute("class", "fa fa-caret-right");
			this.emit("deactivated");
		}
	},

	get open() {
		return this._open;
	},

	//
	elementTag: "caret",
	_open: false
});
