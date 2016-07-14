"use strict";

wabi.element("tag",
{
	setup: function() {
		this.hidden = true;
	},

	set_value: function(value)
	{
		if(!value) 
		{
			this.hidden = true;
			this.$domElement.innerHTML = "";
		}
		else 
		{
			this.hidden = false;
			this.$domElement.innerHTML = value;
		}
	}
});
