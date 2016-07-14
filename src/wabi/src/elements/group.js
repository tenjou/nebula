"use strict";

wabi.element("group", 
{
	params: {
		padding: 2
	},

	set_value: function(value) 
	{

	},

	set_padding: function(value) {
		this.style("margin", value + "px");
	}
})