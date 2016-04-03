"use strict";

meta.class("Element.Inner", "Element.Basic",
{
	onCreate: function()
	{
		if(editor.layout === "particles") {
			this.onCreateParticles();
			return;
		}		

		this.leftToolbar = new Element.Toolbar(this);
		this.leftToolbar.width = 270;

		this.roomToolbar = new Element.ToolbarRoom(this);	

		this.rightToolbar = new Element.Toolbar(this);
		this.rightToolbar.width = 310;
	},

	//
	elementTag: "inner",

	leftToolbar: null,
	rightToolbar: null,
	roomToolbar: null,
});
