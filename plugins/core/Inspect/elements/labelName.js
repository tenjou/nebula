"use strict";

wabi.element("labelName",
{
	elements: 
	{
		name: {
			type: "text",
			link: "name"
		},
		content: {
			type: "input",
			link: "value"
		}
	},

	//
	$tag: "label"
});
