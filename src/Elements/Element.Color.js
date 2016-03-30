"use strict";

meta.class("Element.Color", "Element.Basic",
{
	onCreate: function()
	{
		this.domElement.oninput = this.handleUpdate.bind(this);
		this.domElement.setAttribute("type", "color");
	},

	handleUpdate: function(domEvent)
	{
		domEvent.preventDefault();
		domEvent.stopPropagation();

		this.emit("update", domEvent);
	},

	set value(value) {
		this.domElement.value = value;
	},

	get value() {
		return this.domElement.value;
	},

	//
	elementTag: "input",
});
