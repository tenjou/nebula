"use strict";

wabi.element("checkbox", 
{
	state: {
		value: false
	},

	setup: function() {
		this.attrib("tabindex", "0");
	},

	set_value: function(value) {
		this.setCls("active", value);
	},

	handle_click: function() {
		this.toggle();
	},

	handle_keydown: function(event) 
	{
		if(event.domEvent.keyCode === 32) {
			this.toggle();
		}
	},

	toggle: function() {
		this.$value = !this.$value;
	}
});
