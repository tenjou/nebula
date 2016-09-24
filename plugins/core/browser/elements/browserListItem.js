"use strict";

wabi.element("browserListItem", "listItem",
{
	elements: 
	{
		folder: {
			type: "caret",
			link: "open",
			bind: "open"
		},
		icon: {
			type: "type",
			link: "type",
			bind: "type"
		},
		name: {
			type: "word",
			link: "value",
			bind: "value"
		},
		tag: null
	},

	setup: function() 
	{
		this.bind = { 
			tag: "ext"
		};
	},

	set_tag: function(tag) 
	{
		if(tag)
		{
			this.element("tag", "tag");
			this.elements.tag.$value = tag;
		}
		else
		{
			this.element("tag", null);
		}
	}
});
