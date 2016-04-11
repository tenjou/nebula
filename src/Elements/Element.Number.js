"use strict";

meta.class("Element.Number", "Element.Basic",
{
	onCreate: function() 
	{
		this.input = this.domElement;
		this._onCreate();
	},

	_onCreate: function() 
	{
		this.input.setAttribute("type", "text");
		this.input.value = "0";
		this.input.onkeydown = this.handleOnKeyDown.bind(this);
		this.input.onchange = this.handleOnChange.bind(this);
	},

	handleOnKeyDown: function(domEvent) 
	{
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
		if(isNaN(key)) 
		{
			domEvent.preventDefault();
		}
	},

	handleOnChange: function(domEvent)
	{
		var prevValue = this.value;
		this.value = domEvent.target.value

		if(prevValue !== this.value) {
			this.emit("update");
		}
	},

	set value(value) 
	{
		var value = parseFloat(value);
		if(isNaN(value) || value === void(0) || value === null) {
			value = this._value;
		}

		if(value > this._max) {
			value = this._max;
		}
		else if(value < this._min) {
			value = this._min;
		}

		this.prevValue = this._value;
		this._value = value;
		this.input.value = value;
	},

	get value() {
		return this._value;
	},

	set min(min) 
	{
		if(this._min === min) { return; }
		this._min = min;

		if(this.value < this._min) {
			this.value = this._min;
			this.emit("update");
		}
	},

	get min() {
		return this._min;
	},

	set max(max)
	{
		if(this._max === max) { return; }
		this._max = max;

		if(this.value > this._max) {
			this.value = this._max;
			this.emit("update");
		}
	},

	get max() {
		return this._max;
	},

	//
	elementTag: "input",
	input: null,

	prevValue: 0,
	_value: 0,
	_default: 0,
	_min: Number.MIN_SAFE_INTEGER,
	_max: Number.MAX_SAFE_INTEGER
});
