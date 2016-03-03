"use strict";

meta.class("Editor.Element.CanvasContent", "Element.Basic",
{
	onCreate: function()
	{
		// this.canvas = document.createElement("canvas");
		// this.domElement.appendChild(this.canvas);
	},

	set hidden(value) 
	{
		if(value) {
			this.domElement.setAttribute("class", "hidden");
		}
		else {
			this.domElement.setAttribute("class", "");
		}
	},

	get hidden() 
	{
		var cls = this.domElement.getAttribute("class");
		if(cls === "hidden") {
			return true;
		}

		return false;
	},	

	//
	elementTag: "content",

	canvas: null
});