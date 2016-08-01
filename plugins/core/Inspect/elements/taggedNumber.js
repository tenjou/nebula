"use strict";

wabi.element("taggedNumber",
{
	elements: 
	{
		ww: {
			type: "word",
			bind: "name"
		},
		nn: {
			type: "number",
			bind: "value"
		}
	},

	set_color: function(value) {
		this.$elements.ww.style("background-color", value);
	},

	//
	name: "",
	color: "0x000000"
});
