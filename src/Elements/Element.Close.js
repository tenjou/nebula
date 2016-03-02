"use strict";

meta.class("Element.Close", "Element.Basic",
{
	onCreate: function()
	{
		this.element.setAttribute("class", "fa fa-close");

	},

	//
	elementTag: "close",
});
