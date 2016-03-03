"use strict";

meta.class("Element.Info", "Element.Basic",
{
	set value(str) {
		this.domElement.innerHTML = str;
	},

	get value() {
		return this.domElement.innerHTML;
	},

	//
	elementTag: "info",
});
