"use strict";

wabi.element("browserListItem", "listItem",
{
	elements: 
	{
		icon: {
			type: "type",
			link: "type"
		},
		name: {
			type: "word",
			link: "value"
		},
		tag: {
			type: "tag",
			link: "ext"
		}
	},

	setup: function()
	{
		this.$elements.caret.bind = "folder";
		this.$elements.icon.bind = "type";
		this.$elements.name.bind = "value",
		this.$elements.tag.bind = "tag";	
		this.$elements.caret.hidden = true;	
	}
});
