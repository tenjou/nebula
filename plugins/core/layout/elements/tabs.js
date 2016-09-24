"use strict";

wabi.element("tabs",
{
	set_value: function(value)
	{
		this.removeAll();

		var tab;

		if(typeof(value) === "string")
		{
			tab = wabi.createElement("tab", this);
			tab.$value = value;
		}
		else if(value instanceof Array)
		{
			for(var n = 0; n < value.length; n++)
			{
				tab = wabi.createElement("tab", this);
				tab.$value = value[n];
			}
		}
		else {
			return;
		}

		this.children[0].$active = true;
	}
});

wabi.element("tab",
{
	state: {
		active: true
	},

	set_value: function(value) {
		this.html(value);
	},

	set_active: function(value) {
		this.setCls("active", true);
	},

	//
	tabContent: null
});
