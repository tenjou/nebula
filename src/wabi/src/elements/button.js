"use strict";

wabi.element("button",
{
	set_value: function(value) {
		this.html(value);
	},

	set_width: function(value) 
	{
		if(value > 0) {
			this.style("flex", "1 1 " + value + "px");
		}
		else if(this.style("flex")) {
			this.style("flex", "");
		}
	},

	//
	width: 0
});
