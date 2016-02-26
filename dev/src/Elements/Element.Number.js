"use strict";

meta.class("Element.Number", "Element.Basic",
{
	onCreate: function() {
		this.element.setAttribute("type", "text");
		this.element.value = "0";
		this.element.onkeydown = this._handleOnKeyDown;
		this.element.onchange = this._handleOnChange;
	},

	_handleOnKeyDown: function(event) 
	{
		if(event.ctrlKey) { return; }

		var keyCode = event.keyCode;
		var value = event.target.value;

		switch(keyCode)
		{
			case 8: // Backspace
				return;

			case 27: // Esc
				event.target.value = "0";
				return;

			case 187: // +
			case 189: // -
			{
				if(value.length !== 0) {
					event.preventDefault();
				}
			} return;

			case 190: // "."
			{
				var firstIndex = value.indexOf(".");
				if(firstIndex !== -1) {
					event.preventDefault();
				}
			} return;
		}

		var key = String.fromCharCode(keyCode)
		if(isNaN(key)) {
			event.preventDefault();
		}
	},

	_handleOnChange: function(event)
	{
		var value = parseFloat(event.target.value);
		if(isNaN(value)) {
			value = "0";
		}
		else {
			event.target.value = value;
		}
	},

	set value(value) {
		this.element.value = value;
	},

	get value() {
		return this.element.value;
	},

	//
	elementTag: "input",
});
