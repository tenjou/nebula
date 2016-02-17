"use strict";

meta.class("Element.H2", "Editor.Element",
{
	set value(str) {
		this.element.innerHTML = str;
	},

	get value() {
		return this.element.innerHTML;
	},

	//
	elementTag: "h2",
});
