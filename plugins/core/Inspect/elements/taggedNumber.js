"use strict";

wabi.element("taggedNumber",
{
	elements: 
	{
		name: {
			type: "text",
			link: "name"
		},
		number: {
			type: "number",
			link: "value"
		}
	},

	set_name: function(name) 
	{
		console.log("name", name)
	},

	set_color: function(value) {
		this.$elements.name.style("background-color", value);
	},

	//
	color: "0x000000"
});
