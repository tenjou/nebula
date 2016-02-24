"use strict";

meta.class("Element.Icon", "Editor.Element",
{
	set type(type) {
		this.element.setAttribute("class", "fa " + type);
	},

	//
	elementTag: "icon",
});
