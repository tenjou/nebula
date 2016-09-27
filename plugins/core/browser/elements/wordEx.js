"use strict";

wabi.element("wordEx",
{
	elements: 
	{
		word: {
			type: "word",
			link: "value",
			bind: "value"
		},
		highlight: {
			type: "highlight"
		}
	},

	set_value: function(value) {
		this.elements.highlight.$value = value;
	}
});
