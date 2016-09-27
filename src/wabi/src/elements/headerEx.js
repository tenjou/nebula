"use strict";

wabi.element("headerEx",
{
	elements: 
	{
		caret: {
			type: "caret",
			link: "open"
		},
		text: {
			type: "text",
			link: "value"
		}
	},

	prepare: function() {
		this.on("click", "*", this.handle_click, this);
	},

	handle_click: function(event) {
		this.elements.caret.toggle();
	},

	//
	tag: "header"
});
