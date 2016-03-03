"use strict";

meta.class("Element.Icon", "Element.Basic",
{
	set type(type) {
		this.domElement.setAttribute("class", "fa " + type);
	},

	//
	elementTag: "icon",
});
