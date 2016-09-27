"use strict";

wabi.element("icon", 
{
	setup: function() 
	{
		this.hidden = true;
		this.attrib("class", "fa");
	},

	set_value: function(value, prevValue) 
	{
		this.setCls(value, true);
		this.hidden = false;
	}
});