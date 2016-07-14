"use strict";

wabi.element("labelDropdown",
{
	elements: 
	{
		name: {
			type: "text",
			link: "name"
		},
		dropdown: {
			type: "dropdown",
			link: "value"
		}
	},

	//
	$tag: "label"
});
