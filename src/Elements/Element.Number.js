"use strict";

meta.class("Element.Number", "Element.Basic",
{
	onCreate: function() {
		this.domElement.setAttribute("type", "text");
		this.domElement.value = "0";
		this.domElement.onkeydown = this.handleOnKeyDown;
		this.domElement.onchange = this.handleOnChange;
	},

	handleOnKeyDown: function(domEvent) 
	{
		if(domEvent.ctrlKey) { return; }

		var keyCode = domEvent.keyCode;
		var value = domEvent.target.value;

		switch(keyCode)
		{
			case 8: // Backspace
				return;

			case 27: // Esc
				domEvent.target.value = "0";
				return;

			case 187: // +
			case 189: // -
			{
				if(value.length !== 0) {
					domEvent.preventDefault();
				}
			} return;

			case 190: // "."
			{
				var firstIndex = value.indexOf(".");
				if(firstIndex !== -1) {
					domEvent.preventDefault();
				}
			} return;
		}

		var key = String.fromCharCode(keyCode)
		if(isNaN(key)) {
			domEvent.preventDefault();
		}
	},

	handleOnChange: function(domEvent)
	{
		var value = parseFloat(domEvent.target.value);
		if(isNaN(value)) {
			value = "0";
		}
		else {
			domEvent.target.value = value;
		}
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
