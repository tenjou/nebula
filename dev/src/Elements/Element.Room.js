"use strict";

meta.class("Editor.Element.Room", "Editor.Element.Tab",
{ 
	onCreate: function()
	{
		this._name = document.createElement("span");
		this.element.appendChild(this._name);

		this.content = new Editor.Element.CanvasContent(this.parent.parent);
		this.content.hidden = true;		

		this.closeButton = document.createElement("span");
		this.closeButton.setAttribute("class", "fa fa-times");
		this.element.appendChild(this.closeButton);

		// var self = this;
		// this.element.addEventListener("click", function() {
		// 	self.activate();
		// });		
	},

	//
	elementTag: "room",

	closeButton: null,
	content: null
});