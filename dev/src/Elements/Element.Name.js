"use strict";

meta.class("Element.Name", "Editor.Element",
{
	onCreate: function()
	{
		this.element.spellcheck = "false";
		this.element.setAttribute("tabindex", "0");
		this.element.ondblclick = this._handleDbClick.bind(this);
		this.element.onfocus = this._handleFocus.bind(this);
		this.element.onblur = this._handleBlur.bind(this);
	},

	_handleDbClick: function(event) 
	{
		this.element.contentEditable = "true";
		this.element.focus();
		meta.selectElementContents(this.element);
	},

	_handleFocus: function(event)
	{
		this._value = this.element.innerHTML;
		this.element.onkeydown = this._handleOnKeyDown.bind(this);
	},

	_handleBlur: function(event)
	{
		this.element.contentEditable = "false";
		this.element.onkeydown = null;

		if(!this.element.innerHTML) {
			this.element.innerHTML = this._value;
		}
		else if(this.element.innerHTML !== this._value) {
			this.emit("update");
		}
	},

	_handleOnKeyDown: function(event)
	{
		var keyCode = event.keyCode;

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
			this.element.innerHTML = this._value;
			this.element.blur();
		}
		// Enter
		else if(keyCode === 13) {
			this.element.blur();
		}

		event.preventDefault();
	},

	focus: function()
	{
		this.element.contentEditable = "true";
		this.element.focus();
		meta.selectElementContents(this.element);
	},

	set value(str) {
		this.element.innerHTML = str;
	},

	get value() {
		return this.element.innerHTML;
	},

	//
	elementTag: "name",
	_value: ""
});