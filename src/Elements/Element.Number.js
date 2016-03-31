"use strict";

meta.class("Element.Number", "Element.Basic",
{
	onCreate: function() {
		this.domElement.setAttribute("type", "text");
		this.domElement.value = "0";
		this.domElement.onkeydown = this.handleOnKeyDown.bind(this);
		this.domElement.onchange = this.handleOnChange.bind(this);
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
				domEvent.target.value = this._value;
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
		else 
		{
			if(value < this._min) {
				value = this._min;
			}
			else if(value > this._max) {
				value = this._max;
			}

			domEvent.target.value = value;
		}

		this.emit("update");
	},

	set value(value) {
		this._value = value;
		this.domElement.value = value;
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

	_value: 0,
	_min: Number.MIN_SAFE_INTEGER,
	_max: Number.MAX_SAFE_INTEGER
});
