"use strict";

meta.class("Element.Color", "Element.Basic",
{
	onCreate: function()
	{
		this.domElement.setAttribute("type", "color");
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
