"use strict";

wabi.element("taggedNumber",
{
	state: {
		color: "0x000000"
	},

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
	
	set_color: function(value) {
		this.elements.name.style("background-color", value);
	}
});
