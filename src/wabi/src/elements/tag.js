"use strict";

wabi.element("tag",
{
	set_value: function(value)
	{
		console.log("tag", value)

		if(!value) {
			this.html("");
		}
		else {
			this.html(value);
		}
	}
});
