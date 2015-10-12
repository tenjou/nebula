"use strict";

meta.class("EditorUI.Header", "EditorUI.Element",
{
	init: function()
	{
		var element = document.createElement("div");
		element.setAttribute("class", "element header");

		this.element = element;
	}
});
