"use strict";

meta.class("Element.Image", "Element.Basic",
{
	onCreate: function() {
		this.img = document.createElement("img");
		this.element.appendChild(this.img);
	},

	set value(value) {
		this.img.src = value;
	},

	get value() {
		return this.img.src;
	},

	//
	elementTag: "image",

	img: null
});
