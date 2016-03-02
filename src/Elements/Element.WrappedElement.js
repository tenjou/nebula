"use strict";

meta.class("Element.WrappedElement", "Element.Basic",
{
	init: function(tagName, parent) {
		this.elementTag = tagName;
		this._super(parent);
	},

	//
	pickable: false
});
