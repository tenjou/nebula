"use strict";

meta.class("Element.Name", "Editor.Element",
{
	onCreate: function()
	{
		this.element.spellcheck = "false";
		this.element.ondblclick = this._handleDbClick;
		this.element.onfocus = this._handleFocus;
		this.element.onblur = this._handleBlur;
	},

	_handleDbClick: function(event) 
	{
		var element = event.currentTarget;
		element.contentEditable = "true";
		element.focus();
		meta.selectElementContents(element);
	},

	_handleFocus: function(event)
	{
		var element = event.target;
		var holder = element.holder;
		holder._value = element.innerHTML;
		element.onkeydown = holder._handleOnKeyDown;
	},

	_handleBlur: function(event)
	{
		var element = event.target;
		var holder = element.holder;
		element.contentEditable = "false";
		element.onkeydown = null;

		if(!element.innerHTML) {
			element.innerHTML = holder._value;
		}
		else if(element.innerHTML !== holder._value) {
			holder.emit("update");
		}
	},

	_handleOnKeyDown: function(event)
	{
		var keyCode = event.keyCode;
		var element = event.target;

		console.log(keyCode)

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
			element.innerHTML = element.holder._value;
			element.blur();
		}
		// Enter
		else if(keyCode === 13) {
			element.blur();
		}

		event.preventDefault();
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