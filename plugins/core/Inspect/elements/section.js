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
		this.on("click", "headerEx", this.updateOpen, this);
	},

	updateOpen: function(event) {
		this.$elements.content.hidden = !this.$elements.header.open;
	},

	set_open: function(value) {
		this.$elements.header.open = value;
		this.$elements.content.hidden = !value;
	},

	//
	open: true
});
