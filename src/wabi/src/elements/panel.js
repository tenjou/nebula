"use strict";

wabi.element("panel", 
{
	state: {
		header: "Panel"
	},

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

	set width(width) 
	{
		this.style("width", width + "px");
	},

	get width() {
		return this._width;
	},

	set height(height) 
	{
		this.style("min-height", height + "px");		
	},

	get height() {
		return this._height;
	},

	//
	_width: 0,
	_height: 0
});
