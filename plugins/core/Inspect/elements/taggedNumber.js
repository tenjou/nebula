"use strict";

wabi.element("taggedNumber",
{
	elements: 
	{
		name: {
			type: "word",
			bind: "name"
		},
		value: {
			type: "number",
			bind: "value"
		}
	},

	set_value: function(value) {
		console.log("tagged", value)
	},

	set_color: function(value) {
		this.$elements.name.style("background-color", value);
	},

	//
	color: "0x000000"
});
