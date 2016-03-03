"use strict";

meta.class("Element.Close", "Element.Basic",
{
	onCreate: function()
	{
		this.domElement.setAttribute("class", "fa fa-close");
	},

	//
	elementTag: "close",
});
