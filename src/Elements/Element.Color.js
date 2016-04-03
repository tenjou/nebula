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

		this.prevValue = this._value;
		this._value = parseInt(this.domElement.value.slice(1), 16);

		this.emit("update", domEvent);
	},

	set value(value) 
	{
		if(!value) {
			value = this._value;
		}

		this.prevValue = this._value;
		this._value = value;
		this.domElement.value = "#" + value.toString(16);
	},

	get value() {
		return this._value;
	},

	//
	elementTag: "input",
	_default: 0x000000,
	_value: 0x000000
});
