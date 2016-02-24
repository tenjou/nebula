"use strict";

meta.class("Element.WrappedElement", "Editor.Element",
{
	init: function(tagName, parent) {
		this.elementTag = tagName;
		this._super(parent);
	}
});
