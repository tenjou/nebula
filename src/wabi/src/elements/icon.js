"use strict";

wabi.element("icon", 
{
	setup: function() 
	{
		this.state.hidden = true;
		this.attrib("class", "fa");
	},

	set_value: function(value, prevValue) 
	{
		this.setCls(value, true);
		this.state.hidden = false;
	}
});