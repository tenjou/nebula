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

	set width(value) 
	{
		if(value > 0)
		{
			this.style("flex", "0 0 " + value + "px");
		}
	},

	get width() {
		return this._width;
	},

	//
	_width: 0
});
