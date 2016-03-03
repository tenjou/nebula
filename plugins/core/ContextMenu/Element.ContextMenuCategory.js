"use strict";

meta.class("Element.ContextMenuCategory", "Element.Basic",
{
	set value(value) {
		this.domElement.innerHTML = value;
	},

	get value() {
		return this.domElement.innerHTML;
	},

	//
	elementTag: "category"
});
