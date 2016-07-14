"use strict";

wabi.element("input", 
{
	set_value: function(value) {
		this.$domElement.value = value;
	},

	set_inputType: function(value) {
		this.attrib("type", value);
	},

	set_placeholder: function(value) {
		this.$domElement.placeholder = value;
	},

	handle_change: function(event) {
		this.value = this.$domElement.value;
	},

	//
	$tag: "input",

	inputType: "name",
	value: "",
	placeholder: null,
	editable: true
});
