"use strict";

wabi.element("toolbar",
{
	elements: 
	{
		tabs: {
			type: "tabs",
			link: "tab"
		},
		content: {
			type: "content",
			link: "value"
		}
	},

	set_width: function(value) 
	{
		if(value > 0)
		{
			this.style("flex", "0 0 " + value + "px");
		}
	},

	//
	width: 0
});
