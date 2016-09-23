"use strict";

wabi.element("error", 
{
	state: {
		types: {}
	},

	set_value: function(value)
	{
		if(!value) {
			this.html("");
			return;
		}

		var text = this.$types[value];
		if(!text) {
			this.html("");
			return; 
		}

		this.html(text);
	},

	set_types: function(value)
	{
		if(this.$value) {
			this.set_value(this.$value);
		}
	}
});
