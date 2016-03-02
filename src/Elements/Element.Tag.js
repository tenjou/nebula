"use strict";

meta.class("Element.Tag", "Element.Basic",
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
