"use strict";

meta.class("Element.String", "Element.Basic",
{
	onCreate: function() 
	{
		this.domElement.setAttribute("type", "text");
		this.domElement.setAttribute("spellcheck", "false");
		this.domElement.onkeydown = this.handleKeyDown.bind(this);
		this.domElement.onchange = this.handleChange.bind(this);
	},

	revert: function()
	{
		this._value = this.prevValue;
		this.domElement.value = this._value;
	},	

	handleKeyDown: function(domEvent) 
	{
		if(event.ctrlKey) { return; }

		var keyCode = event.keyCode;

		switch(keyCode)
		{
			case 27: // Esc
				this.domElement.value = this._value;
				return;
		}
	},

	handleChange: function(domEvent) {
		this.prevValue = this._value;
		this._value = this.domElement.value;
		this.emit("update");
	},	

	set value(value) {
		this.prevValue = this._value;
		this._value = value;
		this.domElement.value = value;
	},

	//
	elementTag: "input"
});
