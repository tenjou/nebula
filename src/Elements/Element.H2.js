"use strict";

meta.class("Element.H2", "Element.Basic",
{
	set value(str) {
		this.domElement.innerHTML = str;
	},

	get value() {
		return this.domElement.innerHTML;
	},

	//
	elementTag: "h2",
});
