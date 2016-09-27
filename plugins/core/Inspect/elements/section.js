"use strict";

wabi.element("section",
{
	elements: 
	{
		header: {
			type: "headerEx",
			link: "name",
			watch_open: "updateOpen"
		},
		content: {
			type: "content",
			link: "value"
		}
	},

	updateOpen: function(value) {
		this.elements.content.hidden = !value;
	},

	set open(value) {
		this.elements.header.open = value;
	},

	get open() {
		return this.elements.header.open;
	}
});
