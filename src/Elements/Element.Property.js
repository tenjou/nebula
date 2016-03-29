"use strict";

meta.class("Element.Property", "Element.Basic",
{
	onCreate: function()
	{
		this.name = document.createElement("span");
		this.domElement.appendChild(this.name);
	},

	set value(value)
	{
		if(this._value === value) { return; }
		this._value = value;

		this.name.innerHTML = value;
	},	

	//
	elementTag: "prop",

	name: null,
	_value: null
});