"use strict";

wabi.element("panel", 
{
	elements: 
	{
		header: { 
			type: "header",
			link: "header"
		},
		content: {
			type: "content",
			link: "value"
		}
	},

	set_width: function(width) 
	{
		if(width > 0) {
			this.style("width", width + "px");
		}
	},

	set_height: function(height) 
	{
		if(height > 0) {
			this.style("min-height", height + "px");
		}
		
	},

	//
	header: "Panel",
	width: 0,
	height: 0
});
