"use strict";

meta.class("Element.String", "Editor.Element",
{
	onCreate: function() {
		this.element.setAttribute("type", "text");
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
			case 27: // Esc
				event.target.value = "";
				return;
		}
	},

	_handleOnChange: function(event)
	{

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
