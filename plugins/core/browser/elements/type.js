"use strict";

wabi.element("type", 
{
	setup: function() {
		// this.state.hidden = true;
		this.setCls("fa", true);
	},

	set_value: function(value, prevValue) 
	{
		var icon = editor.plugins.resources.getIconFromType(value);
		this.setCls(icon, true);
		// if(prevValue) {
		// 	this.setCls(prevValue, false)
		// }
		// if(value) {
		// 	this.setCls(value, true);
		// }

		// this.state.hidden = false;
	}
});