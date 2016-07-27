"use strict";

wabi.element("browserListItem", "listItem",
{
	elements: 
	{
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
	}
});
