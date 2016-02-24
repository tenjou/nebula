"use strict";

meta.class("Element.Tag", "Editor.Element",
{
	set value(str) {
		this.element.innerHTML = str;
	},

	get value() {
		return this.element.innerHTML;
	},

	//
	elementTag: "tag",
});
