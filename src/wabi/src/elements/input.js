"use strict";

wabi.element("input", 
{
	set_value: function(value) {
		this.$domElement.value = value;
		console.log("here")
	},

	set_inputType: function(value) {
		this.attrib("type", value);
	},

	set_placeholder: function(value) 
	{
		if(value) {
			this.$domElement.placeholder = value;
		}
		else {
			this.$domElement.placeholder = "";
		}
	},

	set_readOnly: function(value) {
		this.$domElement.readOnly = value;
	},

	handle_change: function(event) {
		this.value = this.$domElement.value;
	},

	//
	$tag: "input",

	inputType: "name",
	value: "",
	placeholder: null,
	editable: true,
	readOnly: false
});
