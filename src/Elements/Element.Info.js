"use strict";

meta.class("Element.Info", "Element.Basic",
{
	set value(str) {
		this.element.innerHTML = str;
	},

	get value() {
		return this.element.innerHTML;
	},

	//
	elementTag: "info",
});
