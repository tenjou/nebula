"use strict";

wabi.element("word", 
{
	state: {
		value: ""
	},

	prepare: function()
	{
		this.attrib("spellcheck", "false");
		this.attrib("tabindex", "0");
	},

	set_value: function(value)
	{
		this.html(value);

		if(this.$value && value) 
		{
			console.log("highlight", value)
			this.setCls("highlight", true);
			
			var self = this;
			setTimeout(function() {
				self.setCls("highlight", false);
			}, 600);
		}			
	},

	set editable(value)
	{
		if(this._editable === value) { return; }
		this._editable = value;

		if(!value) {
			this.domElement.contentEditable = "false";
		}
	},

	get editable() {
		return this._editable;
	},

	handle_dblclick: function(event)
	{
		if(this.editable) {
			this.domElement.contentEditable = "true";
			this.domElement.focus();
			meta.selectElementContents(this.domElement);
		}
	},

	handle_blur: function(event)
	{
		var newValue = this.html();
		if(newValue) {
			this.$value = newValue;
		}
		else {
			this.html(this.$value);
		}

		if(this.editable) {
			this.domElement.contentEditable = "false";
		}
	},

	handle_keydown: function(event)
	{
		var keyCode = event.domEvent.keyCode;

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
			this.domElement.blur();
		}
		// Enter
		else if(keyCode === 13) {
			this.domElement.blur();
			this.domElement.scrollIntoView(true);
		}

		event.domEvent.preventDefault();
	},

	handle_change: function(event) {
		this.$value = this.html();
	},

	//
	_editable: true
});
