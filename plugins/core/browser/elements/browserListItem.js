"use strict";

wabi.element("browserListItem", "listItem",
{
	elements: 
	{
		folder: {
			type: "caret",
			link: "open"
		},
		icon: {
			type: "type",
			bind: "type"
		},
		name: {
			type: "word",
			bind: "value"
		},
		tag: {
			type: "tag",
			bind: "ext"
		}
	},

	//
	draggable: true
});
