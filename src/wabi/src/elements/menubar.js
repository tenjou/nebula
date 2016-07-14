"use strict";

wabi.element("menubar",
{
	elements: 
	{
		left: {
			type: "content",
			link: "value"
		},
		center: {
			type: "content",
			link: "center"
		},
		right: {
			type: "content",
			link: "right"
		}
	},

	prepare: function()
	{
		this.$elements.left.setCls("left", true);
		this.$elements.center.setCls("center", true);
		this.$elements.right.setCls("right", true);
	}
});
