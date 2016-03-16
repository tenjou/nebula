"use strict";

meta.class("Controller.Inspect_Default", 
{
	init: function(content) {
		this.content = content;
		this.content.data = {
			General: {
				type: "section",
				content: {
					Name: "@string",
				}
			},
		};
	}
});