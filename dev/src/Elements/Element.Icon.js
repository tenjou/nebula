"use strict";

meta.class("Element.Icon", "Element.Basic",
{
	set type(type) {
		this.element.setAttribute("class", "fa " + type);
	},

	//
	elementTag: "icon",
});
