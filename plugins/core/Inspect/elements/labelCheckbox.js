"use strict";

wabi.element("labelCheckbox",
{
	elements: 
	{
		name: {
			type: "text",
			link: "name"
		},
		content: {
			type: "checkbox",
			link: "value"
		}
	},

	//
	$tag: "label"
});
