"use strict";

meta.class("Element.AssetsProperty", "Element.Property",
{
	addField: function()
	{
		var fieldElement = document.createElement("field");
		this.element.appendChild(fieldElement);
	}
});