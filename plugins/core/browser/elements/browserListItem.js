"use strict";

wabi.element("browserListItem", "listItem",
{
	elements: 
	{
		caret: null,
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
		tag: {
			type: null,
			bind: "ext"
		}
	},

	set_folder: function(value) 
	{
		this.element("caret", value ? "caret" : null);
	},

	set_tag: function(value) 
	{
		if(value)
		{
			this.element("tag", "tag");
			this.elements.tag.$value = value;
		}
		else
		{
			this.element("tag", null);
		}
	}
});
