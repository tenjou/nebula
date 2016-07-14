"use strict";

wabi.element("icon", 
{
	setup: function() {
		this.state.hidden = true;
		this.setCls("fa", true);
	},

	set_value: function(value, prevValue) 
	{
		if(prevValue) {
			this.setCls(prevValue, false)
		}
		if(value) {
			this.setCls(value, true);
		}

		this.state.hidden = false;
	}
});