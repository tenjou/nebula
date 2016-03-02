"use strict";

meta.class("Element.String", "Element.Basic",
{
	onCreate: function() 
	{
		this.element.setAttribute("type", "text");
		this.element.setAttribute("spellcheck", "false");
		this.element.onkeydown = this._handleKeyDown.bind(this);
		this.element.onchange = this._handleChange.bind(this);
	},

	revert: function()
	{
		this._value = this.prevValue;
		this.element.value = this._value;
	},	

	_handleKeyDown: function(event) 
	{
		if(event.ctrlKey) { return; }

		var keyCode = event.keyCode;

		switch(keyCode)
		{
			case 27: // Esc
				this.element.value = this._value;
				return;
		}
	},

	_handleChange: function(event) {
		this.prevValue = this._value;
		this._value = this.element.value;
		this.emit("update");
	},	

	set value(value) {
		this.prevValue = this._value;
		this._value = value;
		this.element.value = value;
	},

	get value() {
		return this._value;
	},

	//
	elementTag: "input",

	_value: null,
	prevValue: null
});
