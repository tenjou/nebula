"use strict";

wabi.element("input", 
{
	set_value: function(value) {
		this.$domElement.value = value;
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

wabi.element("staticInput", 
{
	prepare: function() {
		this.attrib("readonly", "");
	},

	set_value: function(value) 
	{
		if(value instanceof wabi.data) {
			this.$domElement.value = value.raw.value;
		}
		else {
			this.$domElement.value = value;
		}
	},

	//
	$tag: "input",
	value: ""
});
