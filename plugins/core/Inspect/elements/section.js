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

	prepare: function() {
		this.$elements.header.on("open", this.updateOpen, this);
	},

	updateOpen: function(event, value) {
		this.$elements.content.hidden = event.element.open;
	},

	set_open: function(value) {
		this.$elements.header.open = value;
	},

	//
	open: true
});
