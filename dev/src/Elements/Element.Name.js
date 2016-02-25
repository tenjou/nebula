"use strict";

meta.class("Element.Name", "Editor.Element",
{
	onCreate: function()
	{
		this.element.setAttribute("spellcheck", "false");
		this.element.setAttribute("tabindex", "0");
		this.element.ondblclick = this._handleDbClick.bind(this);
		this.element.onfocus = this._handleFocus.bind(this);
		this.element.onblur = this._handleBlur.bind(this);
	},

	focus: function()
	{
		this.element.contentEditable = "true";
		this.element.focus();
		meta.selectElementContents(this.element);
	},

	revert: function()
	{
		this._value = this.prevValue;
		this.element.innerHTML = this._value;
	},

	_handleDbClick: function(event) 
	{
		event.stopPropagation();
		event.preventDefault();

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

		if(!this.element.innerHTML && this._value) {
			this.element.innerHTML = this._value;
		}
		else if(this.element.innerHTML !== this._value) {
			this.value = this.element.innerHTML;
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

	set value(str) 
	{
		if(str === this._value) { return; }

		if(this.prevValue === null) {
			this.prevValue = str;
			this._value = str;
			this.element.innerHTML = str;			
		}
		else {
			this.prevValue = this._value;
			this._value = str;
			this.element.innerHTML = str;			
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