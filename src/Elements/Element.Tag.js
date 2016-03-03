"use strict";

meta.class("Element.Tag", "Element.Basic",
{
	set value(str) {
		this.domElement.innerHTML = str;
	},

	get value() {
		return this.domElement.innerHTML;
	},

	//
	elementTag: "tag",
});
