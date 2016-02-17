"use strict";

meta.class("Editor.Element.CanvasContent", "Editor.Element",
{
	onCreate: function()
	{
		// this.canvas = document.createElement("canvas");
		// this.element.appendChild(this.canvas);
	},

	set hidden(value) 
	{
		if(value) {
			this.element.setAttribute("class", "hidden");
		}
		else {
			this.element.setAttribute("class", "");
		}
	},

	get hidden() 
	{
		var cls = this.element.getAttribute("class");
		if(cls === "hidden") {
			return true;
		}

		return false;
	},	

	//
	elementTag: "content",

	canvas: null
});