"use strict";

wabi.element("section",
{
	elements: 
	{
		header: {
			type: "headerEx",
			link: "name"
		},
		content: {
			type: "content",
			link: "value"
		}
	},

	setup: function() {
		this.elements.header.on("open", this.updateOpen, this);
	},

	updateOpen: function(event, value) {
		this.elements.content.hidden = event.element.open;
	},

	set open(value) {
		this.elements.header.open = value;
	},

	get open() {
		return this.elements.header.open;
	}
});
