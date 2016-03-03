"use strict";

meta.class("Element.Info", "Element.Basic",
{
	onCreate: function()
	{
		this.inner = document.createElement("inner");
		this.domElement.appendChild(this.inner);
	},

	set value(str) {
		this.inner.innerHTML = str;
	},

	get value() {
		return this.inner.innerHTML;
	},

	//
	elementTag: "info",

	inner: null
});
