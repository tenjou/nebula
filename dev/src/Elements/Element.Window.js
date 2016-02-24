"use strict";

meta.class("Element.Window", "Editor.Element",
{
	onCreate: function()
	{
		this.content = new Element.Content(this);
	},

	//
	elementTag: "window",

	content: null
});