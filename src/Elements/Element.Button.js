"use strict";

meta.class("Element.Button", "Element.Basic",
{
	onCreate: function()
	{
		this._value = document.createElement("button-content");
		this.domElement.appendChild(this._value);

		this.domElement.onmouseup = this.handleClick.bind(this);
	},

	handleClick: function(domEvent) {
		this.emit("click", domEvent);
	},

	set value(str) {
		this._value.innerHTML = str;
	},

	get value() {
		return this._value.innerHTML;
	},	

	//
	elementTag: "button",
	_value: null
});