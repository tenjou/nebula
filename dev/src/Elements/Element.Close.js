"use strict";

meta.class("Element.Close", "Editor.Element",
{
	onCreate: function()
	{
		this.element.setAttribute("class", "fa fa-close");

	},

	//
	elementTag: "close",
});
