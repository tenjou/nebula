"use strict";

wabi.element("caret", 
{
	state: {
		value: true
	},

	setup: function() {
		this.setCls("fa", true);
	},

	toggle: function() {
		this.$value = !this.$value;
	},

	set_value: function(value)
	{
		if(value) {
			this.setCls("fa-caret-right", false);
			this.setCls("fa-caret-down", true);
		}
		else {
			this.setCls("fa-caret-down", false);
			this.setCls("fa-caret-right", true);
		}
	},

	handle_click: function(event) {
		this.toggle();
	}
});
