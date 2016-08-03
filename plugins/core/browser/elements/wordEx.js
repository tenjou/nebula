"use strict";

wabi.element("wordEx",
{
	elements: 
	{
		word: {
			type: "word",
			link: "value"
		},
		highlight: {
			type: "highlight"
		}
	},

	setup: function() {
		this.$elements.word.bind = "value"
	},

	set_value: function(value) {
		this.$elements.highlight.value = value;
	}
});
