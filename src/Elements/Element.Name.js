"use strict";

meta.class("Element.Name", "Element.Basic",
{
	onCreate: function()
	{
		this.domElement.setAttribute("spellcheck", "false");
		this.domElement.setAttribute("tabindex", "0");
		this.domElement.onclick = this.handleClick.bind(this);
		this.domElement.onfocus = this.handleFocus.bind(this);
		this.domElement.onblur = this.handleBlur.bind(this);
	},

	focus: function()
	{
		this.domElement.contentEditable = "true";
		this.domElement.focus();
		meta.selectElementContents(this.domElement);
	},

	revert: function()
	{
		this._value = this.prevValue;
		this.domElement.innerHTML = this._value;
	},

	handleClick: function(domEvent) 
	{
		if(domEvent.detail % 2 === 0) 
		{
			domEvent.stopPropagation();
			domEvent.preventDefault();

			this.focus();
		}
	},

	handleFocus: function(domEvent)
	{
		this._value = this.domElement.innerHTML;
		this.domElement.onkeydown = this._handleOnKeyDown.bind(this);
	},

	handleBlur: function(domEvent)
	{
		this.domElement.contentEditable = "false";
		this.domElement.onkeydown = null;

		if(!this.domElement.innerHTML && this._value) {
			this.domElement.innerHTML = this._value;
		}
		else if(this.domElement.innerHTML !== this._value) {
			this.value = this.domElement.innerHTML;
		}
	},

	_handleOnKeyDown: function(domEvent)
	{
		var keyCode = domEvent.keyCode;

		// only 0..9, a..z, A..Z, -, _, ., space
		if((keyCode > 47 && keyCode < 58) || 
		   (keyCode > 64 && keyCode < 91) || 
		   (keyCode > 96 && keyCode < 123) || keyCode === 95 || keyCode === 189 || keyCode === 190 || keyCode === 32)
		{
			return;
		}

		// Backspace
		if(keyCode === 8) {
			return;
		}
		// Arrow keys
		else if(keyCode >= 37 && keyCode <= 40) {
			return;
		}
		// Esc
		else if(keyCode === 27) {
			this.domElement.innerHTML = this._value;
			this.domElement.blur();
		}
		// Enter
		else if(keyCode === 13) {
			this.domElement.blur();
		}

		domEvent.preventDefault();
	},

	focus: function() 
	{
		this.domElement.contentEditable = "true";
		this.domElement.focus();
		meta.selectElementContents(this.domElement);
	},

	set value(str) 
	{
		if(str === this._value) { return; }

		if(this.prevValue === null) {
			this.prevValue = str;
			this._value = str;
			this.domElement.innerHTML = str;			
		}
		else {
			this.prevValue = this._value;
			this._value = str;
			this.domElement.innerHTML = str;			
			this.emit("update");
		}
	},

	get value() {
		return this._value;
	},

	//
	elementTag: "name",
	_value: "",
	prevValue: null
});