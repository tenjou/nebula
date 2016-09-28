"use strict";

wabi.element("number", 
{
	state: {
		value: 0,
		min: Number.MIN_SAFE_INTEGER,
		max: Number.MAX_SAFE_INTEGER			
	},

	prepare: function() {
		this.attrib("type", "text");
	},

	set_value: function(value)
	{
		if(isNaN(value)) {
			// value = "0";
			//value = 0;
			console.log("num", value)
		}
		else
		{
			if(value < this.min) {
				value = this.min;
			}
			if(value > this.max) {
				value = this.max;
			}
		}

		this.domElement.value = value + "";

		return value;
	},

	set_min: function(value) {
		this.$value = this.$value;
	},

	set_max: function(value) {
		this.$value = this.$value;
	},

	handle_keydown: function(event)
	{
		var domEvent = event.domEvent;

		if(domEvent.ctrlKey) { return; }

		var keyCode = domEvent.keyCode;

		// If arrows:
		if(keyCode >= 37 && keyCode <= 40) {
			return;
		}

		// If numpad:
		if(keyCode >= 96 && keyCode <= 105) {
			keyCode -= 48;
		}

		var value = domEvent.target.value;

		switch(keyCode)
		{
			case 8: // Backspace
			case 46: // Delete
				return;

			case 27: // Esc
				domEvent.target.value = this._value;
				return;

			case 187: // +
			case 189: // -
			{
				if(domEvent.target.selectionStart !== 0 && value.length !== 0) {
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

	handle_change: function(event) {
		this.$value = parseFloat(this.domElement.value);
	},

	//
	tag: "input"
});
