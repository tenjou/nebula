"use strict";

meta.class("Element.Button", "Editor.Element",
{
	onCreate: function()
	{
		this._value = document.createElement("button-content");
		this.element.appendChild(this._value);

		this.element.onmouseup = this._handleClick.bind(this);
	},

	_handleClick: function(event) {
		this.emit("click");
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