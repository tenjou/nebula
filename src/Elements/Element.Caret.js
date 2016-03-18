"use strict";

meta.class("Element.Caret", "Element.Basic",
{
	onCreate: function() {
		this.domElement.onclick = this.handleOnClick.bind(this);
		this.domElement.setAttribute("class", "fa fa-caret-right");
	},

	handleOnClick: function(domEvent) 
	{
		domEvent.stopPropagation();

		var holder = event.currentTarget.holder;
		holder.open = !holder._open;
	},

	set open(value) 
	{
		if(this._open === value) { return; }
		this._open = value;

		if(value) {
			this.domElement.setAttribute("class", "fa fa-caret-down");
		}
		else {
			this.domElement.setAttribute("class", "fa fa-caret-right");
		}

		this.emit("update");
	},

	get open() {
		return this._open;
	},

	//
	elementTag: "caret",
	_open: false
});
