"use strict";

meta.class("Element.Window", "Element.Basic",
{
	onCreate: function()
	{
		this.content = new Element.Content(this);
	},

	//
	elementTag: "window",

	content: null
});