"use strict";

wabi.element("input", 
{
	set_value: function(value) {
		this.domElement.value = value;
	},

	set inputType(value) {
		this.attrib("type", value);
	},

	get inputType() {
		return this.attrib("type");
	},

	set placeholder(value) 
	{
		if(value) {
			this.domElement.placeholder = value;
		}
		else {
			this.domElement.placeholder = "";
		}
	},

	get placeholder() {
		return this.domElement.placeholder;
	},

	set readOnly(value) {
		this.domElement.readOnly = value;
	},

	get readOnly() {
		return this.domElement.readOnly;
	},

	set editable(value) 
	{
		if(value) {
			this.removeAttrib("readonly");
		}
		else {
			this.attrib("readonly", "");
		}
	},

	get editable() {
		return (this.attrib("readonly") === undefined);
	},

	handle_change: function(event) {
		this.$value = this.domElement.value;
	},

	//
	tag: "input"
});

wabi.element("staticInput", "input",
{
	setup: function() {
		this.editable = false;
	}
});
